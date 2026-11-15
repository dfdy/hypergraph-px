// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Bounded draft-lineage records
//!
//! Encodes and restores exact UTF8 draft splice history against its
//! immutable base.
//! Strict bindings prevent a trace being reused for a different
//! acknowledged draft.
//!
//! Source: [Latest source on GitHub][source]
//!
//! Agent provenance: Agent creation unverified; original creator not recorded.
//! Created: Unknown (not recorded).
//! Creation harness: Unknown (not recorded).
//! Creation model: Unknown (not recorded).
//!
//! Latest editing agent: Codex /root/storage_comments (OpenAI coding agent).
//! Latest editing harness: Codex; version/build unknown (not exposed).
//! Latest editing model: OpenAI; exact identifier/revision unknown (not exposed).
//! Last edited: 2026-11-15 (UTC).
//!
//! Used by: Experimental temporal Save and Commit adapters; storage codec tests.
//!
//! Specification:
//! - [Encrypted storage responsibilities][spec0]
//! - [Draft-lineage codec contract][spec1]
//!
//! Boundary: No SQL, crypto or active-record writes occur here. Callers
//! authorize access; only guarded experimental schema3 drivers use this
//! candidate kind31 format.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/lineage_record.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/shared-responsibilities.c4
//! [spec1]: ../../../../docs/07-implementation/data-structures/sqlite-records.md#draft-lineage-codec-prototype-under-adopted-parent-merge-direction

use crate::{Error, Result, encoding};
use hypergraph_domain::{
    parent_merge::{
        Base, Limits,
        lineage::{Change, Error as TraceError, Trace},
    },
    records::*,
};
use serde::{Deserialize, Serialize};
use std::io::{self, Write};

pub const CANDIDATE_KIND: i32 = 31;
const JS_MAX: u64 = (1u64 << 53) - 1;
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Binding {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub draft: DraftId,
    #[serde(with = "encoding::identity")]
    pub base_revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub base_snapshot: SnapshotId,
    pub generation: u64,
    pub sequence: u64,
}

impl Binding {
    /// Reject counters that cannot round-trip through browser-safe integers.
    fn valid(&self) -> bool {
        self.generation <= JS_MAX && self.sequence <= JS_MAX
    }
}
#[derive(Serialize)]
struct ChangeRef<'a> {
    start_byte: usize,
    end_byte: usize,
    replacement: &'a str,
}
#[derive(Serialize)]
struct PayloadRef<'a> {
    binding: &'a Binding,
    text_bytes: usize,
    changes: Vec<ChangeRef<'a>>,
}
#[derive(Serialize)]
struct RecordRef<'a> {
    record_version: u32,
    record_kind: i32,
    payload: PayloadRef<'a>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ChangeDto {
    start_byte: u64,
    end_byte: u64,
    replacement: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Payload {
    binding: Binding,
    text_bytes: usize,
    changes: Vec<ChangeDto>,
}
struct Bounded {
    bytes: Vec<u8>,
    limit: usize,
    exhausted: bool,
}

impl Write for Bounded {
    /// Append a complete chunk only if its bytes fit the record budget.
    fn write(&mut self, bytes: &[u8]) -> io::Result<usize> {
        if self
            .bytes
            .len()
            .checked_add(bytes.len())
            // Treat overflow as exhaustion instead of allocating beyond the output cap.
            .is_none_or(|n| n > self.limit)
        {
            self.exhausted = true;
            return Err(io::Error::other("lineage record byte limit"));
        }
        self.bytes.extend_from_slice(bytes);
        Ok(bytes.len())
    }

    /// Satisfy the writer interface; the in-memory buffer has no pending I/O.
    fn flush(&mut self) -> io::Result<()> {
        Ok(())
    }
}

/// Preserve resource exhaustion while treating invalid restored traces as corruption.
fn trace_error(error: TraceError) -> Error {
    match error {
        TraceError::Limit => Error::Limit,
        _ => Error::Integrity,
    }
}

/// Serialize a bound trace within work, text and output-byte limits.
///
/// Context authorization and any future encrypted slot binding are external.
pub fn encode(
    binding: &Binding,
    trace: &Trace<'_>,
    limits: Limits,
    max_bytes: usize,
) -> Result<Vec<u8>> {
    if !binding.valid() {
        return Err(Error::Format);
    }
    if binding.node != trace.node() || binding.base_revision != trace.base_revision() {
        return Err(Error::Integrity);
    }
    if trace.base_text().len() > limits.text_bytes
        || trace.text().len() > limits.text_bytes
        || limits.work == 0
        || max_bytes == 0
        || trace
            .changes()
            .len()
            .checked_add(trace.text().len())
            // Count both changes and resulting source against bounded reconstruction work.
            .is_none_or(|n| n > limits.work)
        || trace.changes().len() > max_bytes / 2
    {
        return Err(Error::Limit);
    }
    let changes = trace
        .changes()
        .iter()
        // Borrow exact replacement bytes rather than rebuilding or normalizing text.
        .map(|change| ChangeRef {
            start_byte: change.start,
            end_byte: change.end,
            replacement: &change.replacement,
        })
        .collect();
    let record = RecordRef {
        record_version: encoding::RECORD_VERSION,
        record_kind: CANDIDATE_KIND,
        payload: PayloadRef {
            binding,
            text_bytes: trace.text().len(),
            changes,
        },
    };
    let mut output = Bounded {
        bytes: Vec::new(),
        limit: max_bytes,
        exhausted: false,
    };
    if serde_json::to_writer(&mut output, &record).is_err() {
        return Err(if output.exhausted {
            Error::Limit
        } else {
            Error::Format
        });
    }
    Ok(output.bytes)
}

/// Restore exact changes against the expected binding and base, rejecting drift.
pub fn decode<'a>(
    bytes: &[u8],
    expected: &Binding,
    base_text: &'a str,
    draft_text: &str,
    limits: Limits,
    max_bytes: usize,
) -> Result<Trace<'a>> {
    if bytes.len() > max_bytes
        || max_bytes == 0
        || limits.work == 0
        || base_text.len() > limits.text_bytes
        || draft_text.len() > limits.text_bytes
    {
        return Err(Error::Limit);
    }
    let payload: Payload = encoding::decode_record(CANDIDATE_KIND, bytes)?;
    if !payload.binding.valid() || !expected.valid() {
        return Err(Error::Format);
    }
    if payload.binding != *expected {
        return Err(Error::Conflict);
    }
    if payload.text_bytes != draft_text.len() {
        return Err(Error::Integrity);
    }
    if payload.changes.len() > limits.work {
        return Err(Error::Limit);
    }
    let changes = payload
        .changes
        .into_iter()
        // Reject offsets outside this platform before domain trace validation.
        .map(|change| {
            Ok(Change {
                // A persisted offset that cannot fit usize is corrupt on this reader.
                start: usize::try_from(change.start_byte).map_err(|_| Error::Integrity)?,
                // Apply the same representability check to the exclusive end.
                end: usize::try_from(change.end_byte).map_err(|_| Error::Integrity)?,
                replacement: change.replacement,
            })
        })
        .collect::<Result<Vec<_>>>()?;
    let base = Base {
        node: expected.node,
        revision: expected.base_revision,
        text: base_text,
    };
    Trace::restore(&base, draft_text, &changes, limits).map_err(trace_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use hypergraph_domain::parent_merge::lineage::Splice;
    /// Supply distinct deterministic identities and acknowledged draft counters.
    fn binding() -> Binding {
        Binding {
            document: DocumentId([1; 32]),
            node: NodeId([2; 32]),
            branch: BranchId([3; 32]),
            draft: DraftId([4; 32]),
            base_revision: RevisionId([5; 32]),
            base_snapshot: SnapshotId([6; 32]),
            generation: 7,
            sequence: 8,
        }
    }

    /// Give codec fixtures enough text/work capacity without removing bounds.
    fn limits() -> Limits {
        Limits {
            text_bytes: 4096,
            work: 100_000,
        }
    }

    /// Build an exact CRLF/multibyte replacement trace for round-trip assertions.
    fn trace() -> Trace<'static> {
        let b = binding();
        let base = Base {
            node: b.node,
            revision: b.base_revision,
            text: "AA\r\n😀",
        };
        Trace::new(&base, limits())
            .unwrap()
            .apply(
                base.text,
                &[Splice {
                    start: 1,
                    end: 2,
                    expected: "A",
                    replacement: "中\r\n😀",
                }],
                "A中\r\n😀\r\n😀",
                limits(),
            )
            .unwrap()
    }

    /// Lock wrapper bytes, identity arrays and unnormalised source through encoding/restoration.
    #[test]
    fn golden_candidate_wrapper_exact_ids_and_source_bytes_round_trip() {
        let binding = binding();
        let trace = trace();
        let encoded = encode(&binding, &trace, limits(), 4096).unwrap();
        // Render the exact repeated-byte JSON identity expected by the golden vector.
        let id = |n: u8| {
            format!(
                "[{}]",
                std::iter::repeat_n(n.to_string(), 32)
                    .collect::<Vec<_>>()
                    .join(",")
            )
        };
        let expected = format!(
            r#"{{"record_version":1,"record_kind":31,"payload":{{"binding":{{"document":{},"node":{},"branch":{},"draft":{},"base_revision":{},"base_snapshot":{},"generation":7,"sequence":8}},"text_bytes":16,"changes":[{{"start_byte":1,"end_byte":2,"replacement":"中\r\n😀"}}]}}}}"#,
            id(1),
            id(2),
            id(3),
            id(4),
            id(5),
            id(6)
        );
        assert_eq!(encoded, expected.as_bytes());
        assert_eq!(
            decode(
                &encoded,
                &binding,
                trace.base_text(),
                trace.text(),
                limits(),
                4096
            )
            .unwrap(),
            trace
        );
        assert_eq!(
            encode(&binding, &trace, limits(), encoded.len()).unwrap(),
            encoded
        );
    }

    /// Reject drift in every bound identity/counter and unsafe browser integers.
    #[test]
    fn every_expected_binding_and_unsafe_counter_is_checked() {
        let b = binding();
        let trace = trace();
        let encoded = encode(&b, &trace, limits(), 4096).unwrap();
        let changed = [
            Binding {
                document: DocumentId([9; 32]),
                ..b.clone()
            },
            Binding {
                node: NodeId([9; 32]),
                ..b.clone()
            },
            Binding {
                branch: BranchId([9; 32]),
                ..b.clone()
            },
            Binding {
                draft: DraftId([9; 32]),
                ..b.clone()
            },
            Binding {
                base_revision: RevisionId([9; 32]),
                ..b.clone()
            },
            Binding {
                base_snapshot: SnapshotId([9; 32]),
                ..b.clone()
            },
            Binding {
                generation: 9,
                ..b.clone()
            },
            Binding {
                sequence: 9,
                ..b.clone()
            },
        ];
        for expected in changed {
            assert!(matches!(
                decode(
                    &encoded,
                    &expected,
                    trace.base_text(),
                    trace.text(),
                    limits(),
                    4096
                ),
                Err(Error::Conflict)
            ));
        }
        assert!(matches!(
            encode(
                &Binding {
                    node: NodeId([9; 32]),
                    ..b.clone()
                },
                &trace,
                limits(),
                4096
            ),
            Err(Error::Integrity)
        ));
        assert!(matches!(
            encode(
                &Binding {
                    sequence: JS_MAX + 1,
                    ..b.clone()
                },
                &trace,
                limits(),
                4096
            ),
            Err(Error::Format)
        ));
        let mut value: serde_json::Value = serde_json::from_slice(&encoded).unwrap();
        value["payload"]["binding"]["generation"] = (JS_MAX + 1).into();
        assert!(matches!(
            decode(
                &serde_json::to_vec(&value).unwrap(),
                &b,
                trace.base_text(),
                trace.text(),
                limits(),
                4096
            ),
            Err(Error::Format)
        ));
    }

    /// Reject unsupported wrappers, malformed fields and traces inconsistent with exact source.
    #[test]
    fn unsupported_malformed_duplicate_and_inconsistent_records_fail_closed() {
        let b = binding();
        let trace = trace();
        let encoded = encode(&b, &trace, limits(), 4096).unwrap();
        let original: serde_json::Value = serde_json::from_slice(&encoded).unwrap();
        let mut cases = Vec::new();
        for (field, number) in [("record_version", 2), ("record_kind", 30)] {
            let mut value = original.clone();
            value[field] = number.into();
            cases.push(serde_json::to_vec(&value).unwrap());
        }
        for path in [
            vec!["extra"],
            vec!["payload", "extra"],
            vec!["payload", "binding", "extra"],
        ] {
            let mut value = original.clone();
            let mut cursor = &mut value;
            for field in &path[..path.len() - 1] {
                cursor = &mut cursor[*field];
            }
            cursor[path[path.len() - 1]] = true.into();
            cases.push(serde_json::to_vec(&value).unwrap());
        }
        let mut bad_id = original.clone();
        bad_id["payload"]["binding"]["node"] = serde_json::json!([2, 2]);
        cases.push(serde_json::to_vec(&bad_id).unwrap());
        cases.push(
            String::from_utf8(encoded.clone())
                .unwrap()
                .replace(
                    "\"record_kind\":31",
                    "\"record_kind\":31,\"record_kind\":31",
                )
                .into_bytes(),
        );
        for bytes in cases {
            assert!(matches!(
                decode(&bytes, &b, trace.base_text(), trace.text(), limits(), 4096),
                Err(Error::Format)
            ));
        }
        let mut value = original.clone();
        value["payload"]["text_bytes"] = 1.into();
        assert!(matches!(
            decode(
                &serde_json::to_vec(&value).unwrap(),
                &b,
                trace.base_text(),
                trace.text(),
                limits(),
                4096
            ),
            Err(Error::Integrity)
        ));
        for start in [5, u64::MAX] {
            let mut value = original.clone();
            value["payload"]["changes"][0]["start_byte"] = start.into();
            value["payload"]["changes"][0]["end_byte"] = 8.into();
            assert!(matches!(
                decode(
                    &serde_json::to_vec(&value).unwrap(),
                    &b,
                    trace.base_text(),
                    trace.text(),
                    limits(),
                    4096
                ),
                Err(Error::Integrity)
            ));
        }
        let mut redundant = original.clone();
        redundant["payload"]["text_bytes"] = 8.into();
        redundant["payload"]["changes"][0]["replacement"] = "A".into();
        assert!(matches!(
            decode(
                &serde_json::to_vec(&redundant).unwrap(),
                &b,
                trace.base_text(),
                trace.base_text(),
                limits(),
                4096
            ),
            Err(Error::Integrity)
        ));
        assert!(matches!(
            decode(&encoded, &b, "AA\r\n😃", trace.text(), limits(), 4096),
            Err(Error::Integrity)
        ));
    }

    /// Exercise output, work and text budgets before accepting any record.
    #[test]
    fn byte_work_and_text_limits_precede_unbounded_or_partial_output() {
        let b = binding();
        let trace = trace();
        let encoded = encode(&b, &trace, limits(), 4096).unwrap();
        assert!(matches!(
            encode(&b, &trace, limits(), encoded.len() - 1),
            Err(Error::Limit)
        ));
        assert!(matches!(encode(&b, &trace, limits(), 0), Err(Error::Limit)));
        assert!(matches!(
            encode(
                &b,
                &trace,
                Limits {
                    work: 1,
                    ..limits()
                },
                4096
            ),
            Err(Error::Limit)
        ));
        assert!(matches!(
            decode(
                &encoded,
                &b,
                trace.base_text(),
                trace.text(),
                limits(),
                encoded.len() - 1
            ),
            Err(Error::Limit)
        ));
        assert!(matches!(
            decode(
                b"not json",
                &b,
                trace.base_text(),
                trace.text(),
                limits(),
                1
            ),
            Err(Error::Limit)
        ));
        assert!(matches!(
            decode(
                &encoded,
                &b,
                trace.base_text(),
                trace.text(),
                Limits {
                    work: 1,
                    ..limits()
                },
                4096
            ),
            Err(Error::Limit)
        ));
        assert!(matches!(
            decode(
                &encoded,
                &b,
                trace.base_text(),
                trace.text(),
                Limits {
                    text_bytes: 1,
                    ..limits()
                },
                4096
            ),
            Err(Error::Limit)
        ));
    }
}
