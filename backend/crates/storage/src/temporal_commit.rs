// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Atomic experimental temporal publication
//!
//! Publishes exact acknowledged draft lineage, origin evidence and node
//! commit order
//! together, or returns the original frozen result for an identical retry.
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
//! Used by: Guarded storage temporal Commit integration tests and
//! separately acknowledged temporal reference publication.
//!
//! Specification:
//! - [Storage transaction responsibilities][spec0]
//! - [Experimental temporal Commit transaction][spec1]
//! - [Candidate storage records][spec2]
//!
//! Boundary: No public schema3 opener, upgrade or runtime route exists.
//! No-op publication writes a receipt alone; immutable history is created
//! by explicit changed Commit, not by autosave cadence.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/temporal_commit.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/shared-responsibilities.c4
//! [spec1]: ../../../../docs/07-implementation/protocols/draft-publication.md#experimental-single-parent-temporal-commit-transaction
//! [spec2]: ../../../../docs/07-implementation/data-structures/sqlite-records.md

use super::*;
use hypergraph_domain::parent_merge::{Base, Limits, lineage::Trace};
use temporal_commit_record::{Frozen, Request};

const READ_BYTES: usize = origin_history::READ_BYTES;
const WORK: usize = 5 * origin_history::WORK;
const RECORDS: usize = 64;

/// Encrypt and insert one immutable experimental object at generation zero.
fn insert_raw(
    cipher: &Cipher<'_>,
    db: &Connection,
    kind: i32,
    id: [u8; 32],
    plain: &[u8],
) -> Result<()> {
    let envelope = cipher.key.seal(cipher.context(kind, id, 0), plain)?;
    db.execute(
        "INSERT INTO objects(kind,id,envelope) VALUES (?1,?2,?3)",
        params![kind, id.as_slice(), envelope],
    )?;
    Ok(())
}

/// Authenticate an earlier frozen publication against immutable outcome evidence.
/// Replay validates immutable outcome/intent, never a newer mutable draft or clock.
fn replay(
    cipher: &Cipher<'_>,
    db: &Connection,
    doc: &Document,
    frozen: &Frozen,
    left: &mut usize,
    limits: Limits,
) -> Result<()> {
    let request = &frozen.request;
    let Outcome::Branch { state } = &frozen.receipt.outcome else {
        return Err(Error::Integrity);
    };
    let branches::EditOutcome::Committed {
        revision, snapshot, ..
    } = state.outcome
    else {
        return Err(Error::Integrity);
    };
    let base = history::read_entry(cipher, db, doc, request.base, left)?;
    let result = history::read_entry(cipher, db, doc, revision, left)?;
    let text: Revision = history::object(cipher, db, REVISION, revision.0, left)?;
    if base.snapshot != request.snapshot || result.snapshot != snapshot || text.text != request.text
    {
        return Err(Error::Integrity);
    }
    if frozen.changed {
        if result.parent != Some(request.base) || result.operation != frozen.receipt.operation {
            return Err(Error::Integrity);
        }
        if !temporal_save::charge(
            db,
            "objects",
            origin_record::CANDIDATE_KIND,
            revision.0,
            left,
        )? {
            return Err(Error::Integrity);
        }
        let envelope: Vec<u8> = db.query_row(
            "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
            params![origin_record::CANDIDATE_KIND, revision.0.as_slice()],
            // Retrieve only the already budgeted encrypted candidate object.
            |row| row.get(0),
        )?;
        let plain = cipher.key.open(
            cipher.context(origin_record::CANDIDATE_KIND, revision.0, 0),
            &envelope,
        )?;
        let (binding, bytes, evidence) = origin_record::evidence(&plain)?;
        if binding
            != (origin_record::Binding {
                document: doc.id,
                node: doc.node,
                revision,
                snapshot,
                parent_revision: request.base,
                parent_snapshot: request.snapshot,
                order: frozen.order,
            })
            || bytes != request.text.len()
            || evidence != request.evidence
        {
            return Err(Error::Integrity);
        }
        let parent: Revision = history::object(cipher, db, REVISION, request.base.0, left)?;
        // Replay verifies the exact transition without reading a newer mutable
        // clock or attributing chronology to legacy parent passages.
        let parent = hypergraph_domain::parent_merge::origins::Map::root(
            &Base {
                node: doc.node,
                revision: request.base,
                text: &parent.text,
            },
            None,
            limits,
        )
        // A bounded domain map/trace cannot be constructed with this resource allowance.
        .map_err(|_| Error::Limit)?;
        origin_record::decode(
            &plain,
            &binding,
            &parent,
            &request.text,
            limits,
            hypergraph_crypto::MAX_PLAINTEXT,
        )?;
    }
    Ok(())
}

/// Dedicated37 publication consumer for separately acknowledged reference batches.
/// The normal schema1/2 missing-receipt error remains NotFound.
pub(super) fn publication_receipt(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    operation: OperationId,
) -> Result<Receipt> {
    // The SQL callback reads the scalar schema marker without opening any records.
    let schema: i32 = db.query_row("PRAGMA user_version", [], |r| r.get(0))?;
    if schema != temporal_save::EXPERIMENTAL_SCHEMA {
        return Err(Error::NotFound);
    }
    let mut left = READ_BYTES;
    temporal_save::guard(cipher, db, &mut left)?;
    if !temporal_save::charge(
        db,
        "objects",
        temporal_commit_record::CANDIDATE_KIND,
        operation.0,
        &mut left,
    )? {
        return Err(Error::NotFound);
    }
    let envelope: Vec<u8> = db.query_row(
        "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
        params![
            temporal_commit_record::CANDIDATE_KIND,
            operation.0.as_slice()
        ],
        // Read the already charged dedicated publication-receipt envelope.
        |r| r.get(0),
    )?;
    let plain = cipher.key.open(
        cipher.context(temporal_commit_record::CANDIDATE_KIND, operation.0, 0),
        &envelope,
    )?;
    let frozen = temporal_commit_record::decode(&plain, operation)?;
    let doc = branches::document(
        cipher,
        db,
        catalog,
        frozen.request.document,
        frozen.request.branch,
    )?;
    if !frozen.changed {
        return Err(Error::Invalid);
    }
    replay(
        cipher,
        db,
        &doc,
        &frozen,
        &mut left,
        Limits {
            text_bytes: MAX_TEXT_BYTES,
            work: WORK / 5,
        },
    )?;
    Ok(frozen.receipt)
}

impl Workspace {
    /// Commit an exact acknowledged experimental draft in one immediate transaction.
    ///
    /// Marker3/feature32 only. Ordinary schema1/2 commands are unchanged.
    pub fn temporal_commit(
        &mut self,
        operation: OperationId,
        request: Request,
        work: usize,
    ) -> Result<Receipt> {
        // The callback deliberately injects no production write-stage failure.
        self.temporal_commit_inner(operation, request, work, |_| Ok(()))
    }

    /// Authorize and reconcile retries before atomically publishing all dependent records.
    /// Fault hooks expose rollback and uncertain-after-commit boundaries to tests.
    fn temporal_commit_inner(
        &mut self,
        operation: OperationId,
        request: Request,
        work: usize,
        mut fault: impl FnMut(&str) -> Result<()>,
    ) -> Result<Receipt> {
        if !(5..=WORK).contains(&work) {
            return Err(Error::Limit);
        }
        // Separate bounded slices cover draft lineage, parent reconstruction,
        // origin publication, reset lineage and exact result readback. Each
        // read phase shares its own encrypted cap (256MiB aggregate maximum).
        let limits = Limits {
            text_bytes: MAX_TEXT_BYTES,
            work: work / 5,
        };
        request.validate()?;
        request.digest()?;
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
        temporal_save::guard(&cipher, &tx, &mut left)?;
        for kind in [RECEIPT, temporal_save::RECEIPT_KIND] {
            if temporal_save::charge(&tx, "objects", kind, operation.0, &mut left)? {
                return Err(Error::Conflict);
            }
        }
        if temporal_save::charge(
            &tx,
            "objects",
            temporal_commit_record::CANDIDATE_KIND,
            operation.0,
            &mut left,
        )? {
            let envelope: Vec<u8> = tx.query_row(
                "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
                params![
                    temporal_commit_record::CANDIDATE_KIND,
                    operation.0.as_slice()
                ],
                // Retrieve only the already budgeted encrypted candidate object.
                |row| row.get(0),
            )?;
            let plain = cipher.key.open(
                cipher.context(temporal_commit_record::CANDIDATE_KIND, operation.0, 0),
                &envelope,
            )?;
            let frozen = temporal_commit_record::decode(&plain, operation)?;
            if frozen.request != request {
                return Err(Error::Conflict);
            }
            replay(&cipher, &tx, &doc, &frozen, &mut left, limits)?;
            tx.commit()?;
            return Ok(frozen.receipt);
        }
        let current =
            temporal_save::context(&cipher, &tx, &doc, self.owner, self.device, &mut left)?;
        if current.binding.generation != request.generation
            || current.binding.base_revision != request.base
            || current.binding.base_snapshot != request.snapshot
            || current.binding.sequence != request.sequence
            || current.text != request.text
        {
            return Err(Error::Conflict);
        }
        let trace = temporal_save::read(&cipher, &tx, &current, limits, &mut left)?;
        let changed = !trace.changes().is_empty();
        let (parent, clock) = origin_history::read_map(
            &cipher,
            &tx,
            &doc,
            RECORDS - usize::from(changed),
            &mut left,
            limits.work.min(origin_history::WORK),
        )?;
        if parent.revision() != request.base || parent.text() != current.base {
            return Err(Error::Integrity);
        }
        if !changed && !request.evidence.is_empty() {
            return Err(Error::Invalid);
        }
        let (revision, snapshot, generation, order) = if changed {
            if request.generation == node_clock::MAX_ORDER {
                return Err(Error::Limit);
            }
            let revision = RevisionId(new_id()?);
            let snapshot = SnapshotId(new_id()?);
            let next_clock = clock.plan_change(
                clock.order(),
                node_clock::Change {
                    revision,
                    snapshot,
                    operation,
                },
            )?;
            let binding = origin_record::Binding {
                document: doc.id,
                node: doc.node,
                revision,
                snapshot,
                parent_revision: request.base,
                parent_snapshot: request.snapshot,
                order: next_clock.order(),
            };
            let (origin, _) = origin_record::encode(
                &binding,
                &parent,
                &trace,
                &request.evidence,
                limits,
                hypergraph_crypto::MAX_PLAINTEXT,
            )?;
            let origin = Zeroizing::new(origin);
            let mut reset = current.binding.clone();
            reset.generation += 1;
            reset.base_revision = revision;
            reset.base_snapshot = snapshot;
            let reset_trace = Trace::new(
                &Base {
                    node: doc.node,
                    revision,
                    text: &request.text,
                },
                limits,
            )
            // A bounded domain map/trace cannot be constructed with this resource allowance.
            .map_err(|_| Error::Limit)?;
            let lineage = Zeroizing::new(lineage_record::encode(
                &reset,
                &reset_trace,
                limits,
                hypergraph_crypto::MAX_PLAINTEXT,
            )?);
            let lineage_id = temporal_save::address(doc.draft);
            let lineage_envelope = cipher.key.seal(
                cipher.context(lineage_record::CANDIDATE_KIND, lineage_id, reset.generation),
                &lineage,
            )?;
            let (head_generation, head): (_, Head) = cipher.slot(&tx, HEAD, doc.branch.0)?;
            let (_, mut draft): (_, Draft) = cipher.slot(&tx, DRAFT, doc.draft.0)?;
            check_draft(&doc, &head, &draft, self.owner, self.device)?;
            // Each write is in this one IMMEDIATE transaction; fault probes are
            // deliberately after individual writes, including private promotion.
            cipher.insert(
                &tx,
                REVISION,
                revision.0,
                &Revision {
                    node: doc.node,
                    parent: Some(request.base),
                    text: request.text.clone(),
                    operation,
                },
            )?;
            fault("revision")?;
            cipher.insert(
                &tx,
                SNAPSHOT,
                snapshot.0,
                &Snapshot {
                    document: doc.id,
                    manifest: doc.manifest,
                    bindings: vec![SnapshotBinding {
                        path: vec![doc.occurrence],
                        node: doc.node,
                        revision,
                    }],
                },
            )?;
            fault("snapshot")?;
            cipher.insert(
                &tx,
                EVENT,
                operation.0,
                &Event {
                    operation,
                    actor: self.owner,
                    device: self.device,
                    document: doc.id,
                    parent: Some(request.base),
                    revision,
                    snapshot,
                },
            )?;
            fault("event")?;
            working::promote(
                &cipher,
                &tx,
                &doc,
                self.owner,
                self.device,
                operation,
                revision,
                snapshot,
                &draft,
            )?;
            fault("promotion")?;
            cipher.update(
                &tx,
                HEAD,
                doc.branch.0,
                head_generation,
                &Head {
                    document: doc.id,
                    revision,
                    snapshot,
                },
            )?;
            fault("head")?;
            draft.base = revision;
            let generation = cipher.update(&tx, DRAFT, doc.draft.0, request.generation, &draft)?;
            fault("draft")?;
            tx.execute("INSERT INTO slots(kind,id,generation,envelope) VALUES (?1,?2,?3,?4) ON CONFLICT(kind,id) DO UPDATE SET generation=excluded.generation,envelope=excluded.envelope",params![lineage_record::CANDIDATE_KIND,lineage_id.as_slice(),reset.generation as i64,lineage_envelope])?;
            fault("lineage")?;
            insert_raw(
                &cipher,
                &tx,
                origin_record::CANDIDATE_KIND,
                revision.0,
                &origin,
            )?;
            fault("origin")?;
            let plain = Zeroizing::new(next_clock.encode()?);
            let envelope = cipher.key.seal(
                cipher.context(node_clock::CANDIDATE_KIND, doc.node.0, next_clock.order()),
                &plain,
            )?;
            if tx.execute("UPDATE slots SET generation=?1,envelope=?2 WHERE kind=?3 AND id=?4 AND generation=?5",params![next_clock.order() as i64,envelope,node_clock::CANDIDATE_KIND,doc.node.0.as_slice(),clock.order() as i64])? != 1 { return Err(Error::Conflict) }
            fault("clock")?;
            (revision, snapshot, generation, next_clock.order())
        } else {
            (
                request.base,
                request.snapshot,
                request.generation,
                clock.order(),
            )
        };
        let receipt = Receipt {
            operation,
            outcome: Outcome::Branch {
                state: branches::Change {
                    branch: request.branch,
                    outcome: branches::EditOutcome::Committed {
                        document: request.document,
                        generation,
                        sequence: request.sequence,
                        revision,
                        snapshot,
                    },
                },
            },
        };
        let frozen = Frozen {
            request,
            receipt: receipt.clone(),
            order,
            changed,
        };
        let plain = Zeroizing::new(frozen.encode()?);
        insert_raw(
            &cipher,
            &tx,
            temporal_commit_record::CANDIDATE_KIND,
            operation.0,
            &plain,
        )?;
        fault("receipt")?;
        if changed {
            // Never publish a head that the ordinary experimental origin reader
            // cannot reconstruct within its own record/byte/work limits. This
            // also catches capacity growth caused by escaped or fragmented data.
            let mut result_bytes = READ_BYTES;
            let (map, _) = origin_history::read_map(
                &cipher,
                &tx,
                &doc,
                RECORDS,
                &mut result_bytes,
                limits.work.min(origin_history::WORK),
            )?;
            if map.revision() != revision || map.text() != frozen.request.text {
                return Err(Error::Integrity);
            }
            fault("readback")?;
        }
        tx.commit()?;
        fault("committed")?;
        Ok(receipt)
    }
}

#[cfg(test)]
mod tests;
