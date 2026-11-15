// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Atomic acknowledged temporal draft saves
//!
//! Persists exact draft text, compact splice lineage and original retry receipt in
//! one guarded transaction without creating an immutable text publication.
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
//! Used by: Experimental temporal Commit driver, origin loader and isolated
//! temporal Save tests.
//!
//! Specification:
//! - [Storage transaction responsibilities][spec0]
//! - [Temporal Save foundation][spec1]
//! - [Draft publication protocol][spec2]
//!
//! Boundary: Experimental marker3 plus authenticated feature32 are
//! mandatory. There is no public opener, upgrade or runtime route. Missing
//! unexplained lineage fails closed; this is not cadence-created immutable
//! history.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/temporal_save.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/shared-responsibilities.c4
//! [spec1]: ../../../../docs/07-implementation/data-structures/sqlite-records.md
//! [spec2]: ../../../../docs/07-implementation/protocols/draft-publication.md

use super::*;
use hypergraph_domain::parent_merge::{
    Base, Limits,
    lineage::{Change, Splice, Trace},
};
use std::io::{self, Write};

pub const EXPERIMENTAL_SCHEMA: i32 = 3;
pub const FEATURE_KIND: i32 = 32;
pub const RECEIPT_KIND: i32 = 33;
const BYTES: usize = hypergraph_crypto::MAX_PLAINTEXT;
// Four bounded envelopes may be read: validated revision, draft, retained
// lineage, and the revision's exact text. JSON escaping can expand raw source.
const READ_BYTES: usize = 4 * BYTES;
const INTENT_BYTES: usize = 4 * BYTES;
const MAX_ENVELOPE: usize = BYTES + 30 + 16; // existing HGOB header + tag
const JS_MAX: u64 = (1u64 << 53) - 1;
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Feature {
    workspace: [u8; 16],
    minimum_reader: i32,
    feature: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Edit {
    pub start_byte: usize,
    pub end_byte: usize,
    pub expected: String,
    pub replacement: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Save {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    pub generation: u64,
    #[serde(with = "encoding::identity")]
    pub base: RevisionId,
    pub previous_sequence: u64,
    pub sequence: u64,
    pub text: String,
    pub edits: Vec<Edit>,
}

/// Owned verified view; serialization remains an adapter concern.
pub struct View {
    pub binding: lineage_record::Binding,
    pub base_text: String,
    pub text: String,
    pub changes: Vec<Change>,
}

/// Derive a draft-specific lineage slot address independent of the source text.
pub fn address(draft: DraftId) -> [u8; 32] {
    let mut hash = Sha256::new();
    hash.update(b"hpx/draft-lineage/slot/v1\0");
    hash.update(draft.0);
    hash.finalize().into()
}
struct DigestWriter {
    hash: Sha256,
    left: usize,
}

impl Write for DigestWriter {
    /// Charge serialized request bytes before streaming them into the intent hash.
    fn write(&mut self, bytes: &[u8]) -> io::Result<usize> {
        self.left = self
            .left
            .checked_sub(bytes.len())
            // Construct a writer error only when the serialized intent exceeds its cap.
            .ok_or_else(|| io::Error::other("temporal request limit"))?;
        self.hash.update(bytes);
        Ok(bytes.len())
    }

    /// Complete the in-memory hash writer without external I/O.
    fn flush(&mut self) -> io::Result<()> {
        Ok(())
    }
}

/// Bind exact serialized Save intent, including edits, within the hashing byte allowance.
fn digest(request: &Save) -> Result<[u8; 32]> {
    let mut writer = DigestWriter {
        hash: Sha256::new(),
        left: INTENT_BYTES,
    };
    writer.hash.update(b"hpx/temporal-save/v1\0");
    // The callback classifies failed bounded serialization as exhausted intent capacity.
    serde_json::to_writer(&mut writer, request).map_err(|_| Error::Limit)?;
    Ok(writer.hash.finalize().into())
}

/// Charge ciphertext length before allocation and distinguish a genuinely missing record.
pub(super) fn charge(
    db: &Connection,
    table: &str,
    kind: i32,
    id: [u8; 32],
    left: &mut usize,
) -> Result<bool> {
    let sql = match table {
        "slots" => "SELECT length(envelope) FROM slots WHERE kind=?1 AND id=?2",
        _ => "SELECT length(envelope) FROM objects WHERE kind=?1 AND id=?2",
    };
    // The SQL callback reads length only, before any ciphertext allocation.
    let length: Option<i64> = db
        .query_row(sql, params![kind, id.as_slice()], |row| row.get(0))
        .optional()?;
    let Some(length) = length else {
        return Ok(false);
    };
    // Reject negative or unrepresentable stored envelope lengths.
    let length = usize::try_from(length).map_err(|_| Error::Integrity)?;
    if length > MAX_ENVELOPE {
        return Err(Error::Limit);
    }
    *left = left.checked_sub(length).ok_or(Error::Limit)?;
    Ok(true)
}

/// Require both experimental SQL marker and workspace-bound authenticated feature metadata.
pub(super) fn guard(cipher: &Cipher<'_>, db: &Connection, left: &mut usize) -> Result<()> {
    // The SQL callback reads only the numeric schema marker.
    let schema: i32 = db.query_row("PRAGMA user_version", [], |r| r.get(0))?;
    if schema != EXPERIMENTAL_SCHEMA || !charge(db, "slots", FEATURE_KIND, ROOT, left)? {
        return Err(Error::Format);
    }
    let (generation, feature): (_, Feature) = cipher.slot(db, FEATURE_KIND, ROOT)?;
    if generation != 0
        || feature.workspace != cipher.workspace
        || feature.minimum_reader != EXPERIMENTAL_SCHEMA
        || feature.feature != "temporal_parent_merge_v1"
    {
        return Err(Error::Format);
    }
    Ok(())
}

/// Reject zero or excessive work before constructing bounded domain allowances.
fn limits(work: usize) -> Result<Limits> {
    if work == 0 || work > BYTES {
        return Err(Error::Limit);
    }
    Ok(Limits {
        text_bytes: MAX_TEXT_BYTES,
        work,
    })
}
pub(super) struct ContextData {
    pub(super) binding: lineage_record::Binding,
    pub(super) base: String,
    pub(super) text: String,
}

/// Read exact authorized head/draft/base context under the shared encrypted-read budget.
pub(super) fn context(
    cipher: &Cipher<'_>,
    db: &Connection,
    doc: &Document,
    owner: PrincipalId,
    device: DeviceId,
    left: &mut usize,
) -> Result<ContextData> {
    let page = history::read_document_page(cipher, db, doc, None, 1, left)?;
    let entry = page.entries.first().ok_or(Error::Integrity)?;
    if !charge(db, "slots", DRAFT, doc.draft.0, left)? {
        return Err(Error::NotFound);
    }
    let (generation, draft): (_, Draft) = cipher.slot(db, DRAFT, doc.draft.0)?;
    let (_, head): (_, Head) = cipher.slot(db, HEAD, doc.branch.0)?;
    check_draft(doc, &head, &draft, owner, device)?;
    if entry.revision != head.revision
        || entry.snapshot != head.snapshot
        || generation > JS_MAX
        || draft.sequence > JS_MAX
        || draft.text.len() > MAX_TEXT_BYTES
    {
        return Err(Error::Integrity);
    }
    let revision: Revision = history::object(cipher, db, REVISION, head.revision.0, left)?;
    if revision.node != doc.node {
        return Err(Error::Integrity);
    }
    Ok(ContextData {
        binding: lineage_record::Binding {
            document: doc.id,
            node: doc.node,
            branch: doc.branch,
            draft: doc.draft,
            base_revision: draft.base,
            base_snapshot: head.snapshot,
            generation,
            sequence: draft.sequence,
        },
        base: revision.text,
        text: draft.text,
    })
}

/// Restore bound lineage, allowing an empty start only when draft equals its committed base.
pub(super) fn read<'a>(
    cipher: &Cipher<'_>,
    db: &Connection,
    current: &'a ContextData,
    work: Limits,
    left: &mut usize,
) -> Result<Trace<'a>> {
    let id = address(current.binding.draft);
    if !charge(db, "slots", lineage_record::CANDIDATE_KIND, id, left)? {
        if current.text != current.base {
            return Err(Error::Conflict);
        }
        return Trace::new(
            &Base {
                node: current.binding.node,
                revision: current.binding.base_revision,
                text: &current.base,
            },
            work,
        )
        // An empty initial domain trace must fit the supplied allowance.
        .map_err(|_| Error::Limit);
    }
    let (generation, bytes): (i64, Vec<u8>) = db.query_row(
        "SELECT generation,envelope FROM slots WHERE kind=?1 AND id=?2",
        params![lineage_record::CANDIDATE_KIND, id.as_slice()],
        // Retrieve the already charged generation/envelope pair together.
        |row| Ok((row.get(0)?, row.get(1)?)),
    )?;
    // Negative slot generations cannot describe acknowledged draft state.
    let generation = u64::try_from(generation).map_err(|_| Error::Integrity)?;
    if generation != current.binding.generation {
        return Err(Error::Integrity);
    }
    let plain = cipher.key.open(
        cipher.context(lineage_record::CANDIDATE_KIND, id, generation),
        &bytes,
    )?;
    lineage_record::decode(
        &plain,
        &current.binding,
        &current.base,
        &current.text,
        work,
        BYTES,
    )
    // A persisted binding mismatch is corruption rather than a client retry conflict.
    .map_err(|error| match error {
        Error::Conflict => Error::Integrity,
        other => other,
    })
}

/// Require the frozen branch Save result to match operation and expected generation/sequence.
fn validate_receipt(receipt: &Receipt, operation: OperationId, request: &Save) -> Result<()> {
    if receipt.operation != operation {
        return Err(Error::Integrity);
    }
    match &receipt.outcome {
        Outcome::Branch { state } if state.branch == request.branch => match state.outcome {
            branches::EditOutcome::Saved {
                document,
                generation,
                sequence,
            } if document == request.document
                && generation == request.generation + 1
                && sequence == request.sequence =>
            {
                Ok(())
            }
            _ => Err(Error::Integrity),
        },
        _ => Err(Error::Integrity),
    }
}

impl Workspace {
    /// Return owned exact source and validated changes from one authorized read view.
    pub fn temporal_lineage(
        &mut self,
        document: DocumentId,
        branch: BranchId,
        work: usize,
    ) -> Result<View> {
        let work = limits(work)?;
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let catalog = authority::catalog(&cipher, &tx, self.owner, self.device)?;
        let doc = branches::document(&cipher, &tx, &catalog, document, branch)?;
        let mut left = READ_BYTES;
        guard(&cipher, &tx, &mut left)?;
        let current = context(&cipher, &tx, &doc, self.owner, self.device, &mut left)?;
        let trace = read(&cipher, &tx, &current, work, &mut left)?;
        let changes = trace.changes().to_vec();
        tx.commit()?;
        Ok(View {
            binding: current.binding,
            base_text: current.base,
            text: current.text,
            changes,
        })
    }

    /// Acknowledge exact temporal draft edits with durable idempotent retry evidence.
    pub fn temporal_save(
        &mut self,
        operation: OperationId,
        request: Save,
        work: usize,
    ) -> Result<Receipt> {
        // The default fault callback does not interrupt ordinary operation.
        self.temporal_save_inner(operation, request, work, |_| Ok(()))
    }

    /// Reconcile original receipts before mutable preconditions, then atomically save draft and lineage.
    fn temporal_save_inner(
        &mut self,
        operation: OperationId,
        request: Save,
        work: usize,
        mut fault: impl FnMut(&str) -> Result<()>,
    ) -> Result<Receipt> {
        let work = limits(work)?;
        if request.generation >= JS_MAX || request.text.len() > MAX_TEXT_BYTES {
            return Err(Error::Limit);
        }
        let command = Command::Save {
            document: request.document,
            generation: request.generation,
            base: request.base,
            previous_sequence: request.previous_sequence,
            sequence: request.sequence,
            text: request.text.clone(),
        };
        validate_command(&command)?;
        let digest = digest(&request)?;
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self
            .db
            .transaction_with_behavior(TransactionBehavior::Immediate)?;
        let catalog = authority::catalog(&cipher, &tx, self.owner, self.device)?;
        let doc = branches::document(&cipher, &tx, &catalog, request.document, request.branch)?;
        let mut left = READ_BYTES;
        guard(&cipher, &tx, &mut left)?;
        if charge(
            &tx,
            "objects",
            temporal_commit_record::CANDIDATE_KIND,
            operation.0,
            &mut left,
        )? {
            return Err(Error::Conflict);
        }
        if charge(&tx, "objects", RECEIPT_KIND, operation.0, &mut left)? {
            let stored: StoredReceipt = cipher.object(&tx, RECEIPT_KIND, operation.0)?;
            if stored.digest != digest {
                return Err(Error::Conflict);
            }
            validate_receipt(&stored.receipt, operation, &request)?;
            tx.commit()?;
            return Ok(stored.receipt);
        }
        if charge(&tx, "objects", RECEIPT, operation.0, &mut left)? {
            return Err(Error::Conflict);
        }
        let current = context(&cipher, &tx, &doc, self.owner, self.device, &mut left)?;
        if current.binding.generation != request.generation
            || current.binding.base_revision != request.base
            || current.binding.sequence != request.previous_sequence
        {
            return Err(Error::Conflict);
        }
        let trace = read(&cipher, &tx, &current, work, &mut left)?;
        if request.edits.len() > work.work {
            return Err(Error::Limit);
        }
        let edits: Vec<_> = request
            .edits
            .iter()
            // Borrow exact quotes/replacements without changing byte coordinates.
            .map(|edit| Splice {
                start: edit.start_byte,
                end: edit.end_byte,
                expected: &edit.expected,
                replacement: &edit.replacement,
            })
            .collect();
        let next = trace
            .apply(&current.text, &edits, &request.text, work)
            // A persisted binding mismatch is corruption rather than a client retry conflict.
            .map_err(|error| match error {
                hypergraph_domain::parent_merge::lineage::Error::Limit => Error::Limit,
                _ => Error::Invalid,
            })?;
        let mut binding = current.binding.clone();
        binding.generation += 1;
        binding.sequence = request.sequence;
        let plain = Zeroizing::new(lineage_record::encode(&binding, &next, work, BYTES)?);
        let id = address(doc.draft);
        let envelope = cipher.key.seal(
            cipher.context(lineage_record::CANDIDATE_KIND, id, binding.generation),
            &plain,
        )?;
        let outcome = write_draft(
            &cipher,
            &tx,
            &doc,
            self.owner,
            self.device,
            operation,
            command,
            // This writer uses the enclosing temporal fault checkpoints.
            &mut |_| Ok(()),
        )?;
        fault("draft")?;
        tx.execute("INSERT INTO slots(kind,id,generation,envelope) VALUES (?1,?2,?3,?4) ON CONFLICT(kind,id) DO UPDATE SET generation=excluded.generation,envelope=excluded.envelope", params![lineage_record::CANDIDATE_KIND, id.as_slice(), binding.generation as i64, envelope])?;
        fault("lineage")?;
        let receipt = Receipt {
            operation,
            outcome: Outcome::Branch {
                state: branches::Change {
                    branch: request.branch,
                    outcome: outcome.try_into()?,
                },
            },
        };
        cipher.insert(
            &tx,
            RECEIPT_KIND,
            operation.0,
            &StoredReceipt {
                digest,
                receipt: receipt.clone(),
            },
        )?;
        fault("receipt")?;
        tx.commit()?;
        fault("committed")?;
        Ok(receipt)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, create, op};
    /// Install feature/schema markers only in the isolated synthetic test workspace.
    fn enable(ws: &mut Workspace) {
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let tx = ws.db.transaction().unwrap();
        cipher
            .new_slot(
                &tx,
                FEATURE_KIND,
                ROOT,
                &Feature {
                    workspace: ws.workspace,
                    minimum_reader: 3,
                    feature: "temporal_parent_merge_v1".into(),
                },
            )
            .unwrap();
        tx.execute_batch("PRAGMA user_version=3").unwrap();
        tx.commit().unwrap();
    }

    /// Build an exact append edit from the branch current acknowledged source.
    fn request(ws: &mut Workspace, document: DocumentId, branch: BranchId, append: &str) -> Save {
        let state = ws.open_branch(document, branch).unwrap();
        Save {
            document,
            branch,
            generation: state.generation,
            base: state.base,
            previous_sequence: state.acknowledged_sequence,
            sequence: state.acknowledged_sequence + 1,
            text: format!("{}{append}", state.text),
            edits: vec![Edit {
                start_byte: state.text.len(),
                end_byte: state.text.len(),
                expected: "".into(),
                replacement: append.into(),
            }],
        }
    }

    /// Capture every encrypted slot/object row for exact rollback and preservation assertions.
    fn rows(ws: &Workspace) -> Vec<(i32, Vec<u8>, i64, Vec<u8>)> {
        // SQL callbacks extract typed row tuples and surface fixture row failures.
        ws.db.prepare("SELECT kind,id,generation,envelope FROM slots UNION ALL SELECT kind,id,0,envelope FROM objects ORDER BY kind,id").unwrap().query_map([], |row| Ok((row.get(0)?,row.get(1)?,row.get(2)?,row.get(3)?))).unwrap().map(|row|row.unwrap()).collect()
    }

    /// Require authenticated feature enrollment and explainable lineage before temporal saving.
    #[test]
    fn legacy_numeric_marker_and_untraced_draft_do_not_silently_enable_temporal_saves() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let state = ws.open_document(doc).unwrap();
        let req = request(&mut ws, doc, state.branch, "Pending");
        let before = rows(&ws);
        assert!(matches!(
            ws.temporal_save(op(2), req.clone(), BYTES),
            Err(Error::Format)
        ));
        assert_eq!(rows(&ws), before);
        ws.execute(
            op(3),
            Command::Save {
                document: doc,
                generation: state.generation,
                base: state.base,
                previous_sequence: 0,
                sequence: 1,
                text: "Untraced legacy draft".into(),
            },
        )
        .unwrap();
        ws.db.execute_batch("PRAGMA user_version=3").unwrap();
        let req = request(&mut ws, doc, state.branch, "new");
        let before = rows(&ws);
        assert!(matches!(
            ws.temporal_save(op(4), req.clone(), BYTES),
            Err(Error::Format)
        ));
        assert!(matches!(
            ws.execute(
                op(5),
                Command::Save {
                    document: doc,
                    generation: req.generation,
                    base: req.base,
                    previous_sequence: req.previous_sequence,
                    sequence: req.sequence,
                    text: req.text.clone()
                }
            ),
            Err(Error::Format)
        ));
        assert_eq!(rows(&ws), before);
        enable(&mut ws);
        let before = rows(&ws);
        assert!(matches!(
            ws.temporal_save(op(4), req, BYTES),
            Err(Error::Conflict)
        ));
        assert_eq!(rows(&ws), before);
    }

    /// Keep exact draft/trace/receipt durable and encrypted while preserving the committed snapshot.
    #[test]
    fn text_trace_and_receipt_persist_encrypted_and_reconnect_without_committing_text() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let initial = ws.open_document(doc).unwrap();
        enable(&mut ws);
        let req = request(&mut ws, doc, initial.branch, "TEMPORAL-SENTINEL😀\r\n中\r");
        let expected = req.text.clone();
        let receipt = ws.temporal_save(op(2), req.clone(), BYTES).unwrap();
        let view = ws.temporal_lineage(doc, initial.branch, BYTES).unwrap();
        assert_eq!(view.text, expected);
        assert_eq!(view.binding.generation, initial.generation + 1);
        assert_eq!(view.changes.len(), 1);
        assert_eq!(view.changes[0].start, initial.text.len());
        assert_eq!(ws.open_document(doc).unwrap().snapshot, initial.snapshot);
        assert_eq!(
            ws.reconstruct_snapshot(doc, initial.snapshot).unwrap(),
            initial.text
        );
        ws.db
            .execute_batch("PRAGMA wal_checkpoint(TRUNCATE)")
            .unwrap();
        assert!(
            !std::fs::read(temp.db())
                .unwrap()
                .windows(b"TEMPORAL-SENTINEL".len())
                // Scan exact persisted windows for the synthetic plaintext sentinel.
                .any(|bytes| bytes == b"TEMPORAL-SENTINEL")
        );
        ws.db = connect(&temp.db()).unwrap();
        assert_eq!(
            ws.temporal_lineage(doc, initial.branch, BYTES)
                .unwrap()
                .text,
            expected
        );
        assert_eq!(ws.temporal_save(op(2), req, BYTES).unwrap(), receipt);
        assert!(matches!(
            Workspace::open(&temp.db(), PASS),
            Err(Error::Format)
        ));
    }

    /// Roll back intermediate writes and replay the original result after reply loss or later saves.
    #[test]
    fn intermediate_faults_roll_back_and_unknown_acknowledgements_replay_original_receipt() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let branch = ws.open_document(doc).unwrap().branch;
        enable(&mut ws);
        let req = request(&mut ws, doc, branch, "first😀\r\n");
        let before = rows(&ws);
        for (i, stage) in ["draft", "lineage", "receipt"].iter().enumerate() {
            assert!(
                // Fail the selected pre-commit stage to verify complete rollback.
                // Lose the acknowledgement after commit to test original-result replay.
                ws.temporal_save_inner(op(2 + i as u8), req.clone(), BYTES, |at| if at == *stage {
                    Err(Error::Database)
                } else {
                    Ok(())
                })
                .is_err()
            );
            assert_eq!(rows(&ws), before);
        }
        assert!(
            // Lose the acknowledgement after commit to test original-result replay.
            ws.temporal_save_inner(op(8), req.clone(), BYTES, |at| if at == "committed" {
                Err(Error::Database)
            } else {
                Ok(())
            })
            .is_err()
        );
        let original = ws.temporal_save(op(8), req.clone(), BYTES).unwrap();
        let later = request(&mut ws, doc, branch, "later");
        let latest = later.text.clone();
        ws.temporal_save(op(9), later, BYTES).unwrap();
        assert_eq!(
            ws.temporal_save(op(8), req.clone(), BYTES).unwrap(),
            original
        );
        assert_eq!(ws.open_document(doc).unwrap().text, latest);
        let mut changed = req;
        changed.edits[0].replacement.push('!');
        assert!(matches!(
            ws.temporal_save(op(8), changed, BYTES),
            Err(Error::Conflict)
        ));
        assert_eq!(
            ws.db
                // The SQL callback counts only dedicated temporal Save receipts.
                .query_row("SELECT count(*) FROM objects WHERE kind=33", [], |r| r
                    .get::<_, i64>(0))
                .unwrap(),
            2
        );
    }

    /// Recheck present authority on retries and reject operation IDs already used by other record kinds.
    #[test]
    fn current_principal_membership_and_legacy_operation_collisions_are_rechecked() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let branch = ws.open_document(doc).unwrap().branch;
        enable(&mut ws);
        let req = request(&mut ws, doc, branch, "one");
        assert!(matches!(
            ws.temporal_save(op(1), req.clone(), BYTES),
            Err(Error::Conflict)
        ));
        ws.temporal_save(op(2), req.clone(), BYTES).unwrap();
        let owner = ws.owner;
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.temporal_save(op(2), req.clone(), BYTES),
            Err(Error::Integrity)
        ));
        assert!(matches!(
            ws.temporal_lineage(doc, branch, BYTES),
            Err(Error::Integrity)
        ));
        ws.owner = owner;
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let (generation, mut catalog): (_, Catalog) = cipher.slot(&ws.db, CATALOG, ROOT).unwrap();
        catalog.documents.clear();
        cipher
            .update(&ws.db, CATALOG, ROOT, generation, &catalog)
            .unwrap();
        let before = rows(&ws);
        assert!(matches!(
            ws.temporal_save(op(2), req, BYTES),
            Err(Error::NotFound)
        ));
        assert!(matches!(
            ws.temporal_lineage(doc, branch, BYTES),
            Err(Error::NotFound)
        ));
        assert_eq!(rows(&ws), before);
    }

    /// Reject cross-draft ciphertext, generation drift and oversized evidence before exposing lineage.
    #[test]
    fn copied_stale_and_oversized_lineage_slots_never_return_unverified_source() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let other = match ws
            .execute(
                op(2),
                Command::Create {
                    title: "Other".into(),
                    text: "Other😀".into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let a = ws.open_document(doc).unwrap();
        let b = ws.open_document(other).unwrap();
        enable(&mut ws);
        let req = request(&mut ws, doc, a.branch, "A");
        ws.temporal_save(op(3), req, BYTES).unwrap();
        let req = request(&mut ws, other, b.branch, "B");
        ws.temporal_save(op(4), req, BYTES).unwrap();
        // Retrieve fixture ciphertext for deliberate cross-draft substitution.
        let fetch = |ws: &Workspace, id: [u8; 32]| {
            ws.db
                .query_row(
                    "SELECT envelope FROM slots WHERE kind=31 AND id=?1",
                    [id.as_slice()],
                    // Read only the targeted encrypted lineage envelope.
                    |r| r.get::<_, Vec<u8>>(0),
                )
                .unwrap()
        };
        let a_id = address(a.draft);
        let b_id = address(b.draft);
        let a_bytes = fetch(&ws, a_id);
        let b_bytes = fetch(&ws, b_id);
        ws.db
            .execute(
                "UPDATE slots SET envelope=?1 WHERE kind=31 AND id=?2",
                params![a_bytes, b_id.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.temporal_lineage(other, b.branch, BYTES),
            Err(Error::Crypto)
        ));
        ws.db
            .execute(
                "UPDATE slots SET envelope=?1,generation=2 WHERE kind=31 AND id=?2",
                params![b_bytes, b_id.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.temporal_lineage(other, b.branch, BYTES),
            Err(Error::Integrity)
        ));
        ws.db
            .execute(
                "UPDATE slots SET envelope=zeroblob(?1),generation=1 WHERE kind=31 AND id=?2",
                params![(MAX_ENVELOPE + 1) as i64, b_id.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.temporal_lineage(other, b.branch, BYTES),
            Err(Error::Limit)
        ));
        assert!(matches!(
            ws.temporal_lineage(doc, a.branch, 1),
            Err(Error::Limit)
        ));
    }

    /// Save a named child independently without mutating parent or optional branch metadata.
    #[test]
    fn named_child_saves_preserve_parent_draft_and_optional_branch_ciphertext() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let initial = ws.open_document(doc).unwrap();
        let child = match ws
            .execute(
                op(2),
                Command::Branch {
                    mutation: branches::Mutation::Create {
                        document: doc,
                        parent: initial.branch,
                        revision: initial.base,
                        snapshot: initial.snapshot,
                        name: "Child".into(),
                    },
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Branch { state } => state.branch,
            _ => panic!(),
        };
        let optional: Vec<_> = rows(&ws)
            .into_iter()
            // Retain optional branch records for exact preservation comparison.
            .filter(|row| row.0 == 20 || row.0 == 21)
            .collect();
        enable(&mut ws);
        let req = request(&mut ws, doc, child, "Child😀\r\n");
        let expected = req.text.clone();
        ws.temporal_save(op(3), req, BYTES).unwrap();
        assert_eq!(
            ws.temporal_lineage(doc, child, BYTES).unwrap().text,
            expected
        );
        assert_eq!(ws.open_document(doc).unwrap().text, initial.text);
        assert_eq!(
            optional,
            rows(&ws)
                .into_iter()
                // Retain optional branch records for exact preservation comparison.
                .filter(|row| row.0 == 20 || row.0 == 21)
                .collect::<Vec<_>>()
        );
        let mut bad = request(&mut ws, doc, child, "new");
        bad.branch = BranchId([99; 32]);
        let before = rows(&ws);
        assert!(matches!(
            ws.temporal_save(op(4), bad, BYTES),
            Err(Error::NotFound)
        ));
        assert_eq!(rows(&ws), before);
    }

    /// Allow maximum raw source despite JSON expansion within explicitly provisioned read caps.
    #[test]
    fn maximum_raw_text_with_json_escaping_does_not_hit_a_small_combined_read_budget() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let state = ws.open_document(doc).unwrap();
        let before = "\0".repeat(MAX_TEXT_BYTES);
        ws.execute(
            op(2),
            Command::Save {
                document: doc,
                generation: state.generation,
                base: state.base,
                previous_sequence: 0,
                sequence: 1,
                text: before.clone(),
            },
        )
        .unwrap();
        let state = ws.open_document(doc).unwrap();
        ws.execute(
            op(3),
            Command::Commit {
                document: doc,
                generation: state.generation,
                base: state.base,
                sequence: 1,
            },
        )
        .unwrap();
        let state = ws.open_document(doc).unwrap();
        enable(&mut ws);
        let after = "\u{1}".repeat(MAX_TEXT_BYTES);
        let request = Save {
            document: doc,
            branch: state.branch,
            generation: state.generation,
            base: state.base,
            previous_sequence: 1,
            sequence: 2,
            text: after.clone(),
            edits: vec![Edit {
                start_byte: 0,
                end_byte: before.len(),
                expected: before,
                replacement: after,
            }],
        };
        ws.temporal_save(op(4), request, BYTES).unwrap();
        let view = ws.temporal_lineage(doc, state.branch, BYTES).unwrap();
        assert_eq!(view.text.len(), MAX_TEXT_BYTES);
        // The predicate checks every recovered byte, not just the overall text length.
        assert!(view.text.as_bytes().iter().all(|&byte| byte == 1));
        assert_eq!(view.changes.len(), 1);
        assert_eq!(view.changes[0].end, MAX_TEXT_BYTES);
    }
}
