// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Frozen temporal Commit intent and receipt codec
//!
//! Bind an experimental Commit result to the complete exact request, its
//! namespaced digest, changed/no-op meaning and actual committed-change order.
//! Validate promotion against that frozen intent rather than fabricating a
//! legacy command.
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
//! Used by: Experimental temporal Commit writer, promotion reader and
//! strict record-codec tests.
//!
//! Specification:
//! - [Temporal publication coordination][spec0]
//! - [Frozen temporal Commit receipt format][spec1]
//! - [Single-parent temporal Commit protocol][spec2]
//!
//! Boundary: No SQL publication or format activation is performed here.
//! Caller-owned current authority and exact publication/source checks
//! remain required before disclosure or reuse.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/temporal_commit_record.rs
//! [spec0]: ../../../../docs/07-implementation/diagrams/application-coordination.c4
//! [spec1]: ../../../../docs/07-implementation/data-structures/sqlite-records.md#candidate-temporal-commit-frozen-receipt
//! [spec2]: ../../../../docs/07-implementation/protocols/draft-publication.md#experimental-single-parent-temporal-commit-transaction

use super::*;

/// Existing experimental frozen-Commit allocation; wrapper/profile versions remain separate.
pub const CANDIDATE_KIND: i32 = 37;
const MAX_ORDER: u64 = node_clock::MAX_ORDER;
/// Frozen exact branch/editor/base/source intent and supplied origin-mapping evidence.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,

    /// Expected acknowledged draft generation, not an inferred publication order.
    pub generation: u64,
    #[serde(with = "encoding::identity")]
    pub base: RevisionId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,

    /// Exact acknowledged source sequence captured by this operation.
    pub sequence: u64,
    pub text: String,

    /// Supplied changed-region evidence; absence is reserved for a true unchanged result.
    pub evidence: Vec<origin_record::Evidence>,
}

impl Request {
    /// Bound acknowledged counters, source bytes and aggregate evidence shape before encoding.
    pub fn validate(&self) -> Result<()> {
        if self.generation > MAX_ORDER
            || self.sequence > MAX_ORDER
            || self.text.len() > MAX_TEXT_BYTES
        {
            return Err(Error::Limit);
        }
        let mut count = self.evidence.len();
        if count > MAX_TEXT_BYTES {
            return Err(Error::Limit);
        }
        for proof in &self.evidence {
            count = count
                .checked_add(proof.pieces.len())
                // Bound the aggregate nested evidence count before accepting the request.
                .filter(|n| *n <= MAX_TEXT_BYTES)
                .ok_or(Error::Limit)?;
        }
        Ok(())
    }

    /// Hash the exact bounded wrapper plus its temporal-command domain separator.
    pub fn digest(&self) -> Result<[u8; 32]> {
        self.validate()?;
        let bytes = Zeroizing::new(encoding::encode_record_limited(
            CANDIDATE_KIND,
            self,
            hypergraph_crypto::MAX_PLAINTEXT,
        )?);

        let mut hash = Sha256::new();
        hash.update(b"hpx/temporal-commit/v1\0");
        hash.update(&*bytes);
        Ok(hash.finalize().into())
    }
}

/// Original operation result paired with its actual request and change/no-op interpretation.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Frozen {
    pub request: Request,
    pub receipt: Receipt,

    /// Per-node committed-change order; a no-op does not allocate another value.
    pub order: u64,

    /// Whether publication created a new revision/snapshot and advanced generation.
    pub changed: bool,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Stored {
    request: Request,
    digest: [u8; 32],
    receipt: Receipt,
    order: u64,
    changed: bool,
}
#[derive(Serialize)]
struct StoredRef<'a> {
    request: &'a Request,
    digest: [u8; 32],
    receipt: &'a Receipt,
    order: u64,
    changed: bool,
}

impl Frozen {
    /// Require request/receipt branch, document, counters and changed-result evidence to agree.
    pub fn validate(&self) -> Result<()> {
        self.request.validate()?;
        if self.changed && self.request.generation == MAX_ORDER {
            return Err(Error::Limit);
        }
        if self.order > MAX_ORDER || self.changed && self.order == 0 {
            return Err(Error::Integrity);
        }
        if self.changed == self.request.evidence.is_empty() {
            return Err(Error::Integrity);
        }
        let Outcome::Branch { state } = &self.receipt.outcome else {
            return Err(Error::Integrity);
        };
        if state.branch != self.request.branch {
            return Err(Error::Integrity);
        }
        let branches::EditOutcome::Committed {
            document,
            generation,
            sequence,
            revision,
            snapshot,
        } = &state.outcome
        else {
            return Err(Error::Integrity);
        };
        if *document != self.request.document
            || *sequence != self.request.sequence
            || *generation != self.request.generation + u64::from(self.changed)
            || self.changed
                && (*revision == self.request.base || *snapshot == self.request.snapshot)
            || !self.changed
                && (*revision != self.request.base || *snapshot != self.request.snapshot)
        {
            return Err(Error::Integrity);
        }
        Ok(())
    }

    /// Serialize the validated frozen request/result with its original intent digest.
    pub fn encode(&self) -> Result<Vec<u8>> {
        self.validate()?;
        encoding::encode_record_limited(
            CANDIDATE_KIND,
            &StoredRef {
                request: &self.request,
                digest: self.request.digest()?,
                receipt: &self.receipt,
                order: self.order,
                changed: self.changed,
            },
            hypergraph_crypto::MAX_PLAINTEXT,
        )
    }
}

/// Decode the expected operation and validate frozen semantics/digest without a fallback receipt.
pub fn decode(bytes: &[u8], operation: OperationId) -> Result<Frozen> {
    if bytes.len() > hypergraph_crypto::MAX_PLAINTEXT {
        return Err(Error::Limit);
    }

    let stored: Stored = encoding::decode_record(CANDIDATE_KIND, bytes)?;
    if stored.receipt.operation != operation {
        return Err(Error::Conflict);
    }
    let frozen = Frozen {
        request: stored.request,
        receipt: stored.receipt,
        order: stored.order,
        changed: stored.changed,
    };
    frozen.validate()?;
    if frozen.request.digest()? != stored.digest {
        return Err(Error::Integrity);
    }
    Ok(frozen)
}

/// Current permission and exact publication/event/text checks belong to the caller.
/// This verifies the actual frozen temporal intent, never a fabricated legacy command.
pub(super) fn promotion_receipt(
    cipher: &Cipher<'_>,
    db: &Connection,
    doc: &Document,
    promotion: &working::Promotion,
    source: &working::Request,
) -> Result<()> {
    // Read only the current format marker; this never upgrades or opens a new profile.
    let schema: i32 = db.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    if schema != temporal_save::EXPERIMENTAL_SCHEMA {
        return Err(Error::NotFound);
    }
    let mut left = 64 * 1024 * 1024;
    temporal_save::guard(cipher, db, &mut left)?;
    if !temporal_save::charge(
        db,
        "objects",
        CANDIDATE_KIND,
        promotion.operation.0,
        &mut left,
    )? {
        return Err(Error::Integrity);
    }
    let envelope: Vec<u8> = db.query_row(
        "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
        params![CANDIDATE_KIND, promotion.operation.0.as_slice()],
        // Read the already charged exact stored envelope, not a head-selected substitute.
        |row| row.get(0),
    )?;
    let bytes = cipher.key.open(
        cipher.context(CANDIDATE_KIND, promotion.operation.0, 0),
        &envelope,
    )?;
    // A persisted promotion referencing another operation is an integrity violation.
    let frozen = decode(&bytes, promotion.operation).map_err(|error| match error {
        Error::Conflict => Error::Integrity,
        other => other,
    })?;

    let request = &frozen.request;
    if !frozen.changed
        || request.document != doc.id
        || request.branch != doc.branch
        || request.base != source.base
        || request.text != source.text
    {
        return Err(Error::Integrity);
    }
    let Outcome::Branch { state } = &frozen.receipt.outcome else {
        return Err(Error::Integrity);
    };
    let branches::EditOutcome::Committed {
        revision, snapshot, ..
    } = &state.outcome
    else {
        return Err(Error::Integrity);
    };
    if *revision != promotion.revision || *snapshot != promotion.snapshot {
        return Err(Error::Integrity);
    }

    let base = history::read_entry(cipher, db, doc, request.base, &mut left)?;
    if base.snapshot != request.snapshot {
        return Err(Error::Integrity);
    }
    if !temporal_save::charge(
        db,
        "objects",
        origin_record::CANDIDATE_KIND,
        promotion.revision.0,
        &mut left,
    )? {
        return Err(Error::Integrity);
    }
    let envelope: Vec<u8> = db.query_row(
        "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
        params![
            origin_record::CANDIDATE_KIND,
            promotion.revision.0.as_slice()
        ],
        // Read the already charged exact stored envelope, not a head-selected substitute.
        |row| row.get(0),
    )?;
    let bytes = cipher.key.open(
        cipher.context(origin_record::CANDIDATE_KIND, promotion.revision.0, 0),
        &envelope,
    )?;
    let (binding, text_bytes, evidence) = origin_record::evidence(&bytes)?;
    if binding.document != doc.id
        || binding.node != doc.node
        || binding.revision != promotion.revision
        || binding.snapshot != promotion.snapshot
        || binding.parent_revision != request.base
        || binding.parent_snapshot != request.snapshot
        || binding.order != frozen.order
        || text_bytes != request.text.len()
        || evidence != request.evidence
    {
        return Err(Error::Integrity);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    /// Build an exact changed/no-op synthetic request/result pair for codec invariants.
    fn frozen(changed: bool) -> Frozen {
        let request = Request {
            document: DocumentId([1; 32]),
            branch: BranchId([2; 32]),
            generation: 3,
            base: RevisionId([4; 32]),
            snapshot: SnapshotId([5; 32]),
            sequence: 6,
            text: "Exact 😀\r\n中\r".into(),
            evidence: if changed {
                vec![origin_record::Evidence {
                    pieces: vec![origin_record::Piece {
                        start_byte: 0,
                        end_byte: 5,
                        source: origin_record::Source::Unknown {},
                    }],
                    deletion_mapping: origin_record::Confidence::Unknown,
                }]
            } else {
                vec![]
            },
        };
        let receipt = Receipt {
            operation: OperationId([7; 32]),
            outcome: Outcome::Branch {
                state: branches::Change {
                    branch: request.branch,
                    outcome: branches::EditOutcome::Committed {
                        document: request.document,
                        generation: request.generation + u64::from(changed),
                        sequence: request.sequence,
                        revision: if changed {
                            RevisionId([8; 32])
                        } else {
                            request.base
                        },
                        snapshot: if changed {
                            SnapshotId([9; 32])
                        } else {
                            request.snapshot
                        },
                    },
                },
            },
        };
        Frozen {
            request,
            receipt,
            order: u64::from(changed),
            changed,
        }
    }

    /// Guard independent digest vectors, exact bytes and original changed/no-op result identity.
    #[test]
    fn changed_and_unchanged_receipts_retain_exact_request_and_original_result() {
        // Independent Python compact-JSON/SHA256 vector freezes field order and intent bytes.
        assert_eq!(
            frozen(true).request.digest().unwrap(),
            [
                150, 40, 143, 34, 114, 172, 46, 92, 116, 50, 129, 83, 172, 4, 158, 164, 182, 153,
                25, 107, 246, 148, 70, 105, 97, 155, 177, 174, 231, 85, 243, 134
            ]
        );
        for changed in [false, true] {
            let original = frozen(changed);
            let bytes = original.encode().unwrap();
            assert_eq!(
                decode(&bytes, original.receipt.operation).unwrap(),
                original
            );
            assert!(String::from_utf8(bytes.clone()).unwrap().starts_with(
                "{\"record_version\":1,\"record_kind\":37,\"payload\":{\"request\":{\"document\":"
            ));
            assert!(
                String::from_utf8(bytes)
                    .unwrap()
                    .contains("Exact 😀\\r\\n中\\r")
            );
            assert!(matches!(
                decode(&original.encode().unwrap(), OperationId([99; 32])),
                Err(Error::Conflict)
            ));
        }
        let mut maximum = frozen(false);
        maximum.request.generation = MAX_ORDER;
        maximum.request.sequence = MAX_ORDER;
        let Outcome::Branch { state } = &mut maximum.receipt.outcome else {
            panic!()
        };
        let branches::EditOutcome::Committed {
            generation,
            sequence,
            ..
        } = &mut state.outcome
        else {
            panic!()
        };
        *generation = MAX_ORDER;
        *sequence = MAX_ORDER;
        assert!(maximum.encode().is_ok());
    }

    /// Reject relabelled publication scope, counters, change order or evidence.
    #[test]
    fn changed_result_scope_generation_order_and_evidence_cannot_be_relabelled() {
        let good = frozen(true);
        for which in 0..10 {
            let mut bad = good.clone();
            match which {
                0 => bad.order = 0,
                1 => bad.order = MAX_ORDER + 1,
                2 => bad.changed = false,
                3 => bad.request.evidence.clear(),
                4 => bad.request.document = DocumentId([99; 32]),
                5 => bad.request.branch = BranchId([99; 32]),
                6 => bad.request.sequence += 1,
                7 => bad.request.generation += 1,
                8 => bad.request.base = RevisionId([8; 32]),
                _ => bad.request.snapshot = SnapshotId([9; 32]),
            }
            assert!(matches!(bad.encode(), Err(Error::Integrity)), "{which}");
        }
        let mut unsafe_generation = good.clone();
        unsafe_generation.request.generation = MAX_ORDER;
        assert!(matches!(unsafe_generation.encode(), Err(Error::Limit)));
        let mut unsafe_sequence = good;
        unsafe_sequence.request.sequence = MAX_ORDER + 1;
        assert!(matches!(unsafe_sequence.encode(), Err(Error::Limit)));
    }

    /// Reject changed intent, duplicate/unknown/future shapes and excessive payloads.
    #[test]
    fn changed_intent_unknown_fields_duplicates_and_future_shapes_fail_closed() {
        let good = frozen(true);
        let bytes = good.encode().unwrap();
        let raw = serde_json::from_slice::<serde_json::Value>(&bytes).unwrap();
        for which in [
            "text",
            "evidence",
            "digest",
            "unknown",
            "future",
            "duplicate",
        ] {
            let mut value = raw.clone();
            match which {
                "text" => {
                    value["payload"]["request"]["text"] = serde_json::json!("Different intent")
                }
                "evidence" => {
                    value["payload"]["request"]["evidence"][0]["deletion_mapping"] =
                        serde_json::json!("exact")
                }
                "digest" => value["payload"]["digest"] = serde_json::json!(vec![0; 32]),
                "unknown" => value["payload"]["request"]["extra"] = serde_json::json!(true),
                "future" => value["record_version"] = serde_json::json!(2),
                _ => {}
            }
            let bytes = if which == "duplicate" {
                String::from_utf8(bytes.clone())
                    .unwrap()
                    .replace("\"changed\":true", "\"changed\":true,\"changed\":true")
                    .into_bytes()
            } else {
                serde_json::to_vec(&value).unwrap()
            };
            assert!(
                matches!(
                    decode(&bytes, good.receipt.operation),
                    Err(Error::Format | Error::Integrity)
                ),
                "{which}"
            );
        }
        let mut large = frozen(false);
        large.request.text = "x".repeat(MAX_TEXT_BYTES + 1);
        assert!(matches!(large.encode(), Err(Error::Limit)));
        assert!(matches!(
            decode(
                &vec![b' '; hypergraph_crypto::MAX_PLAINTEXT + 1],
                good.receipt.operation
            ),
            Err(Error::Limit)
        ));
    }
}
