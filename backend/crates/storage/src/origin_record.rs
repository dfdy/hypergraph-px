// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Single-parent passage-origin evidence
//!
//! Serializes exact splice evidence and reconstructs passage origins against a
//! validated parent map without inventing origin age for unknown source.
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
//! Used by: Experimental temporal Commit writer and bounded origin-history
//! reader; codec tests.
//!
//! Specification:
//! - [Storage record responsibilities][spec0]
//! - [Candidate origin evidence][spec1]
//!
//! Boundary: Candidate kind34 only; callers authorize snapshots and
//! allocate commit order. No SQL or clock allocation occurs here; the
//! guarded experimental driver uses this codec, while normal formats remain
//! unchanged.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/origin_record.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/shared-responsibilities.c4
//! [spec1]: ../../../../docs/07-implementation/data-structures/sqlite-records.md

use crate::{Error, Result, encoding};
use hypergraph_domain::{
    parent_merge::{
        Base, Limits, Mapping,
        lineage::{Change, Trace},
        origins::{self, Map},
    },
    records::*,
};
use serde::{Deserialize, Serialize};

pub const CANDIDATE_KIND: i32 = 34;
const JS_MAX: u64 = (1u64 << 53) - 1;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Binding {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    pub parent_revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub parent_snapshot: SnapshotId,
    pub order: u64,
}

impl Binding {
    /// Reject missing/unsafe commit order and a revision that names itself as parent.
    fn valid(&self) -> bool {
        self.order > 0 && self.order <= JS_MAX && self.revision != self.parent_revision
    }
}
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Confidence {
    Exact,
    Unknown,
}

impl Confidence {
    /// Translate persisted confidence without strengthening unknown evidence.
    fn domain(self) -> Mapping {
        match self {
            Self::Exact => Mapping::Exact,
            Self::Unknown => Mapping::Unknown,
        }
    }
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum Source {
    Fresh {},
    Unknown {},
    Copy { base_start: usize },
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Piece {
    pub start_byte: usize,
    pub end_byte: usize,
    pub source: Source,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Evidence {
    pub pieces: Vec<Piece>,
    pub deletion_mapping: Confidence,
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
    evidence: &'a [Evidence],
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ChangeDto {
    start_byte: usize,
    end_byte: usize,
    replacement: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Payload {
    binding: Binding,
    text_bytes: usize,
    changes: Vec<ChangeDto>,
    evidence: Vec<Evidence>,
}

/// Reject impossible output budgets and oversized parent/result text before replay.
fn bounds(parent: &Map, text: &str, limits: Limits, max_bytes: usize) -> Result<()> {
    if max_bytes == 0
        || max_bytes > hypergraph_crypto::MAX_PLAINTEXT
        || limits.work == 0
        || parent.text().len() > limits.text_bytes
        || text.len() > limits.text_bytes
    {
        return Err(Error::Limit);
    }
    Ok(())
}

/// Rebuild origin runs from exact parent/trace evidence under the work budget.
fn replay(
    binding: &Binding,
    parent: &Map,
    trace: &Trace<'_>,
    evidence: &[Evidence],
    limits: Limits,
) -> Result<Map> {
    if !binding.valid() {
        return Err(Error::Format);
    }
    if binding.node != parent.node() || binding.parent_revision != parent.revision() {
        return Err(Error::Integrity);
    }
    if evidence.len() > limits.work {
        return Err(Error::Limit);
    }
    // Bound total nested pieces before allocating their domain representations.
    evidence.iter().try_fold(evidence.len(), |n, proof| {
        n.checked_add(proof.pieces.len())
            // Stop the accumulated piece count at the configured work ceiling.
            .filter(|n| *n <= limits.work)
            .ok_or(Error::Limit)
    })?;
    let pieces: Vec<Vec<_>> = evidence
        .iter()
        // Convert each persisted proof into borrowed-domain piece storage.
        .map(|proof| {
            proof
                .pieces
                .iter()
                // Keep exact byte ranges and fresh/unknown/copied source distinctions.
                .map(|piece| origins::Piece {
                    start: piece.start_byte,
                    end: piece.end_byte,
                    source: match piece.source {
                        Source::Fresh {} => origins::Source::Fresh,
                        Source::Unknown {} => origins::Source::Unknown,
                        Source::Copy { base_start } => origins::Source::Copy { base_start },
                    },
                })
                .collect()
        })
        .collect();
    let proofs: Vec<_> = evidence
        .iter()
        .zip(&pieces)
        // Pair converted pieces with their independent deletion confidence.
        .map(|(proof, pieces)| origins::Evidence {
            pieces,
            deletion_mapping: proof.deletion_mapping.domain(),
        })
        .collect();
    parent
        .publish(trace, binding.revision, binding.order, &proofs, limits)
        // Preserve exhaustion; any other failed origin/trace invariant is corrupt evidence.
        .map_err(|error| match error {
            origins::Error::Limit => Error::Limit,
            _ => Error::Integrity,
        })
}

/// Encode a replay-validated origin record and return the reconstructed map.
///
/// Parent/current snapshot authority and clock allocation are caller obligations.
pub fn encode(
    binding: &Binding,
    parent: &Map,
    trace: &Trace<'_>,
    evidence: &[Evidence],
    limits: Limits,
    max_bytes: usize,
) -> Result<(Vec<u8>, Map)> {
    bounds(parent, trace.text(), limits, max_bytes)?;
    let map = replay(binding, parent, trace, evidence, limits)?;
    let changes = trace
        .changes()
        .iter()
        // Borrow unchanged splice text for the serialized candidate payload.
        .map(|change| ChangeRef {
            start_byte: change.start,
            end_byte: change.end,
            replacement: &change.replacement,
        })
        .collect();
    let record = PayloadRef {
        binding,
        text_bytes: trace.text().len(),
        changes,
        evidence,
    };
    Ok((
        encoding::encode_record_limited(CANDIDATE_KIND, &record, max_bytes)?,
        map,
    ))
}

/// Metadata inspection for a bounded authenticated loader; this is not map validation.
pub(super) fn binding(bytes: &[u8]) -> Result<Binding> {
    // Discard unvalidated map material; callers requested only bound context.
    evidence(bytes).map(|(binding, _, _)| binding)
}

/// Inspect strict bounded metadata for loaders without claiming map validity.
pub(super) fn evidence(bytes: &[u8]) -> Result<(Binding, usize, Vec<Evidence>)> {
    if bytes.len() > hypergraph_crypto::MAX_PLAINTEXT {
        return Err(Error::Limit);
    }
    let payload: Payload = encoding::decode_record(CANDIDATE_KIND, bytes)?;
    if !payload.binding.valid() {
        return Err(Error::Format);
    }
    Ok((payload.binding, payload.text_bytes, payload.evidence))
}

/// Restore a bound origin map only after exact trace reconstruction succeeds.
pub fn decode(
    bytes: &[u8],
    expected: &Binding,
    parent: &Map,
    text: &str,
    limits: Limits,
    max_bytes: usize,
) -> Result<Map> {
    bounds(parent, text, limits, max_bytes)?;
    if bytes.len() > max_bytes {
        return Err(Error::Limit);
    }
    if !expected.valid() {
        return Err(Error::Format);
    }
    let payload: Payload = encoding::decode_record(CANDIDATE_KIND, bytes)?;
    if payload.binding != *expected {
        return Err(Error::Conflict);
    }
    if payload.text_bytes != text.len() {
        return Err(Error::Integrity);
    }
    if payload.changes.len() > limits.work {
        return Err(Error::Limit);
    }
    let changes: Vec<_> = payload
        .changes
        .into_iter()
        // Carry exact persisted splice bytes into domain reconstruction.
        .map(|change| Change {
            start: change.start_byte,
            end: change.end_byte,
            replacement: change.replacement,
        })
        .collect();
    let base = Base {
        node: parent.node(),
        revision: parent.revision(),
        text: parent.text(),
    };
    let trace = Trace::restore(&base, text, &changes, limits) // Preserve exhaustion; any other failed origin/trace invariant is corrupt evidence.
        .map_err(|error| match error {
            hypergraph_domain::parent_merge::lineage::Error::Limit => Error::Limit,
            _ => Error::Integrity,
        })?;
    replay(expected, parent, &trace, &payload.evidence, limits)
}

#[cfg(test)]
mod tests {
    use super::*;
    use hypergraph_domain::parent_merge::lineage::Splice;
    /// Provide distinct deterministic revision and snapshot identities.
    fn binding() -> Binding {
        Binding {
            document: DocumentId([1; 32]),
            node: NodeId([2; 32]),
            revision: RevisionId([3; 32]),
            snapshot: SnapshotId([4; 32]),
            parent_revision: RevisionId([5; 32]),
            parent_snapshot: SnapshotId([6; 32]),
            order: 1,
        }
    }

    /// Bound fixture source size and origin reconstruction work.
    fn limits() -> Limits {
        Limits {
            text_bytes: 4096,
            work: 100_000,
        }
    }

    /// Mark the replacement range as fresh with exact deletion evidence.
    fn proof(end: usize) -> Vec<Evidence> {
        vec![Evidence {
            pieces: vec![Piece {
                start_byte: 0,
                end_byte: end,
                source: Source::Fresh {},
            }],
            deletion_mapping: Confidence::Exact,
        }]
    }

    /// Build a parent map whose legacy source has no invented commit order.
    fn root(text: &str) -> Map {
        Map::root(
            &Base {
                node: binding().node,
                revision: binding().parent_revision,
                text,
            },
            None,
            limits(),
        )
        .unwrap()
    }

    /// Lock exact record bytes and inherited unknown age through round-trip reconstruction.
    #[test]
    fn golden_bytes_round_trip_exact_source_and_derive_inherited_age_from_parent() {
        let parent = root("Mon\r\n😀");
        let base = Base {
            node: parent.node(),
            revision: parent.revision(),
            text: parent.text(),
        };
        let trace = Trace::new(&base, limits())
            .unwrap()
            .apply(
                parent.text(),
                &[Splice {
                    start: 0,
                    end: 3,
                    expected: "Mon",
                    replacement: "Tue",
                }],
                "Tue\r\n😀",
                limits(),
            )
            .unwrap();
        let (bytes, map) = encode(&binding(), &parent, &trace, &proof(3), limits(), 4096).unwrap();
        // Render exact identity-array bytes for the golden JSON vector.
        let array = |n: u8| {
            std::iter::repeat_n(n.to_string(), 32)
                .collect::<Vec<_>>()
                .join(",")
        };
        let golden = format!(
            "{{\"record_version\":1,\"record_kind\":34,\"payload\":{{\"binding\":{{\"document\":[{}],\"node\":[{}],\"revision\":[{}],\"snapshot\":[{}],\"parent_revision\":[{}],\"parent_snapshot\":[{}],\"order\":1}},\"text_bytes\":9,\"changes\":[{{\"start_byte\":0,\"end_byte\":3,\"replacement\":\"Tue\"}}],\"evidence\":[{{\"pieces\":[{{\"start_byte\":0,\"end_byte\":3,\"source\":{{\"kind\":\"fresh\"}}}}],\"deletion_mapping\":\"exact\"}}]}}}}",
            array(1),
            array(2),
            array(3),
            array(4),
            array(5),
            array(6)
        );
        assert_eq!(bytes, golden.as_bytes());
        assert_eq!(
            decode(&bytes, &binding(), &parent, trace.text(), limits(), 4096).unwrap(),
            map
        );
        assert_eq!(map.runs().len(), 2);
        assert_eq!(map.runs()[0].origins[0].order, Some(1));
        assert_eq!(map.runs()[1].origins[0].order, None);
        assert_eq!(map.runs()[1].parent_start, Some(3));
        assert_eq!(map.deletions()[0].end, 3);
    }

    /// Reject altered context, unsafe order and an unrelated parent node.
    #[test]
    fn every_binding_and_unsafe_order_are_checked_before_accepting_evidence() {
        let parent = root("a");
        let base = Base {
            node: parent.node(),
            revision: parent.revision(),
            text: parent.text(),
        };
        let trace = Trace::new(&base, limits())
            .unwrap()
            .apply(
                "a",
                &[Splice {
                    start: 0,
                    end: 1,
                    expected: "a",
                    replacement: "b",
                }],
                "b",
                limits(),
            )
            .unwrap();
        let (bytes, _) = encode(&binding(), &parent, &trace, &proof(1), limits(), 4096).unwrap();
        for i in 0..7 {
            let mut changed = binding();
            match i {
                0 => changed.document = DocumentId([99; 32]),
                1 => changed.node = NodeId([99; 32]),
                2 => changed.revision = RevisionId([99; 32]),
                3 => changed.snapshot = SnapshotId([99; 32]),
                4 => changed.parent_revision = RevisionId([99; 32]),
                5 => changed.parent_snapshot = SnapshotId([99; 32]),
                _ => changed.order = 2,
            }
            assert!(matches!(
                decode(&bytes, &changed, &parent, "b", limits(), 4096),
                Err(Error::Conflict)
            ));
        }
        for order in [0, JS_MAX + 1] {
            let mut changed = binding();
            changed.order = order;
            assert!(matches!(
                encode(&changed, &parent, &trace, &proof(1), limits(), 4096),
                Err(Error::Format)
            ));
            assert!(matches!(
                decode(&bytes, &changed, &parent, "b", limits(), 4096),
                Err(Error::Format)
            ));
        }
        let other = Map::root(
            &Base {
                node: NodeId([99; 32]),
                revision: parent.revision(),
                text: "a",
            },
            None,
            limits(),
        )
        .unwrap();
        assert!(matches!(
            decode(&bytes, &binding(), &other, "b", limits(), 4096),
            Err(Error::Integrity)
        ));
    }

    /// Reject unknown/duplicate fields, invalid traces and unsupported copy claims.
    #[test]
    fn malformed_future_duplicate_noncanonical_and_false_copy_records_fail_closed() {
        let parent = root("a");
        let base = Base {
            node: parent.node(),
            revision: parent.revision(),
            text: parent.text(),
        };
        let trace = Trace::new(&base, limits())
            .unwrap()
            .apply(
                "a",
                &[Splice {
                    start: 0,
                    end: 1,
                    expected: "a",
                    replacement: "b",
                }],
                "b",
                limits(),
            )
            .unwrap();
        let (bytes, _) = encode(&binding(), &parent, &trace, &proof(1), limits(), 4096).unwrap();
        let good = serde_json::from_slice::<serde_json::Value>(&bytes).unwrap();
        for field in ["record_version", "record_kind"] {
            let mut value = good.clone();
            value[field] = serde_json::json!(999);
            assert!(matches!(
                decode(
                    &serde_json::to_vec(&value).unwrap(),
                    &binding(),
                    &parent,
                    "b",
                    limits(),
                    4096
                ),
                Err(Error::Format)
            ));
        }
        for location in [
            "wrapper", "payload", "binding", "change", "proof", "piece", "source",
        ] {
            let mut value = good.clone();
            let object = match location {
                "wrapper" => &mut value,
                "payload" => &mut value["payload"],
                "binding" => &mut value["payload"]["binding"],
                "change" => &mut value["payload"]["changes"][0],
                "proof" => &mut value["payload"]["evidence"][0],
                "piece" => &mut value["payload"]["evidence"][0]["pieces"][0],
                _ => &mut value["payload"]["evidence"][0]["pieces"][0]["source"],
            };
            object["surprise"] = serde_json::json!(true);
            assert!(
                matches!(
                    decode(
                        &serde_json::to_vec(&value).unwrap(),
                        &binding(),
                        &parent,
                        "b",
                        limits(),
                        4096
                    ),
                    Err(Error::Format)
                ),
                "{location}"
            );
        }
        let string = String::from_utf8(bytes.clone()).unwrap().replace(
            "\"record_version\":1",
            "\"record_version\":1,\"record_version\":1",
        );
        assert!(matches!(
            decode(string.as_bytes(), &binding(), &parent, "b", limits(), 4096),
            Err(Error::Format)
        ));
        for malformed in [
            "copy",
            "gap",
            "range",
            "count",
            "reconstruction",
            "text_bytes",
        ] {
            let mut value = good.clone();
            match malformed {
                "copy" => {
                    value["payload"]["evidence"][0]["pieces"][0]["source"] =
                        serde_json::json!({"kind":"copy","base_start":0})
                }
                "gap" => {
                    value["payload"]["evidence"][0]["pieces"][0]["start_byte"] =
                        serde_json::json!(1)
                }
                "range" => value["payload"]["changes"][0]["end_byte"] = serde_json::json!(2),
                "count" => value["payload"]["evidence"] = serde_json::json!([]),
                "text_bytes" => value["payload"]["text_bytes"] = serde_json::json!(9),
                _ => value["payload"]["changes"][0]["replacement"] = serde_json::json!("c"),
            }
            assert!(
                matches!(
                    decode(
                        &serde_json::to_vec(&value).unwrap(),
                        &binding(),
                        &parent,
                        "b",
                        limits(),
                        4096
                    ),
                    Err(Error::Integrity)
                ),
                "{malformed}"
            );
        }
    }

    /// Preserve exact copied subranges and unknown confidence while enforcing all resource caps.
    #[test]
    fn exact_inner_copy_unknown_mapping_and_resource_bounds_survive_the_codec() {
        let parent = root("axb");
        let base = Base {
            node: parent.node(),
            revision: parent.revision(),
            text: parent.text(),
        };
        let trace = Trace::new(&base, limits())
            .unwrap()
            .apply(
                "axb",
                &[Splice {
                    start: 0,
                    end: 3,
                    expected: "axb",
                    replacement: "Axb",
                }],
                "Axb",
                limits(),
            )
            .unwrap();
        let evidence = vec![Evidence {
            pieces: vec![
                Piece {
                    start_byte: 0,
                    end_byte: 1,
                    source: Source::Unknown {},
                },
                Piece {
                    start_byte: 1,
                    end_byte: 3,
                    source: Source::Copy { base_start: 1 },
                },
            ],
            deletion_mapping: Confidence::Unknown,
        }];
        let (bytes, map) = encode(&binding(), &parent, &trace, &evidence, limits(), 4096).unwrap();
        let restored = decode(&bytes, &binding(), &parent, "Axb", limits(), 4096).unwrap();
        assert_eq!(restored, map);
        assert_eq!(restored.runs()[0].mapping, Mapping::Unknown);
        assert_eq!(restored.runs()[1].origins[0].order, None);
        assert_eq!(restored.deletions()[0].end, 1);
        assert_eq!(restored.deletions()[0].mapping, Mapping::Unknown);
        assert!(matches!(
            encode(
                &binding(),
                &parent,
                &trace,
                &evidence,
                limits(),
                bytes.len() - 1
            ),
            Err(Error::Limit)
        ));
        assert!(matches!(
            decode(
                &bytes,
                &binding(),
                &parent,
                "Axb",
                limits(),
                bytes.len() - 1
            ),
            Err(Error::Limit)
        ));
        for bound in [
            Limits {
                work: 1,
                ..limits()
            },
            Limits {
                text_bytes: 2,
                ..limits()
            },
        ] {
            assert!(matches!(
                encode(&binding(), &parent, &trace, &evidence, bound, 4096),
                Err(Error::Limit)
            ));
            assert!(matches!(
                decode(&bytes, &binding(), &parent, "Axb", bound, 4096),
                Err(Error::Limit)
            ));
        }
        let no_op = Trace::new(&base, limits()).unwrap();
        assert!(matches!(
            encode(&binding(), &parent, &no_op, &[], limits(), 4096),
            Err(Error::Integrity)
        ));
    }
}
