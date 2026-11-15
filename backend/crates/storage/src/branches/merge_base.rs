// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Authenticated bounded parent common-base inspection
//!
//! Capture exact committed source/parent heads in one authorized read view,
//! authenticate their retained legacy ancestry and ask the pure domain model
//! for a unique maximal common base without changing either draft or head.
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
//! Used by: Workspace parent-comparison API and browser common-base inspection.
//!
//! Specification:
//! - [History-planning implementation responsibilities][spec0]
//! - [Authenticated common-base query][spec1]
//! - [Per-node parent Merge protocol][spec2]
//!
//! Boundary: Read-only legacy ancestry is not passage-order inference, a
//! merge publication or a format upgrade. Missing, cyclic, ambiguous or
//! work-limited evidence never falls back to branch creation.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/branches/merge_base.rs
//! [spec0]: ../../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [spec1]: ../../../../../docs/06-subsystems/interfaces/domain-navigation.md#authenticated-bounded-common-base-inspection
//! [spec2]: ../../../../../docs/07-implementation/protocols/draft-publication.md

use super::*;
use hypergraph_domain::parent_merge::ancestry;
use std::collections::BTreeMap;

/// Maximum authenticated ancestry records for one complete inspection.
pub const MAX_REVISIONS: usize = 1024;
/// Maximum charged ciphertext bytes, shared by comparison and ancestry loading.
pub const MAX_BYTES: usize = 64 * 1024 * 1024;
/// Maximum pure ancestry-selection work; not a measured execution-time promise.
pub const MAX_WORK: usize = 1024 * 1024;

/// Independent caller limits, all checked against the supported upper bounds.
#[derive(Clone, Copy)]
pub struct Limits {
    pub revisions: usize,
    pub bytes: usize,
    pub work: usize,
}

impl Default for Limits {
    /// Select the existing bounded revision/byte/work ceilings without reading storage.
    fn default() -> Self {
        Self {
            revisions: MAX_REVISIONS,
            bytes: MAX_BYTES,
            work: MAX_WORK,
        }
    }
}

/// Exact unique-base, unrelated or ambiguous result; no heuristic winner is invented.
#[derive(Debug, Serialize)]
#[serde(tag = "result", rename_all = "snake_case")]
pub enum Selection {
    Base {
        #[serde(with = "encoding::identity")]
        revision: RevisionId,
        #[serde(with = "encoding::identity")]
        snapshot: SnapshotId,
        source_in_target: bool,
        target_in_source: bool,
    },
    Unrelated,
    Ambiguous {
        #[serde(with = "encoding::identities")]
        revisions: Vec<RevisionId>,
    },
}

/// Captured committed comparison, complete selection result and authenticated read count.
#[derive(Debug, Serialize)]
pub struct View {
    pub comparison: Comparison,
    pub selection: Selection,
    pub revisions_read: usize,
}

impl Workspace {
    /// Inspect exact committed parent ancestry using the ordinary no-injection read path.
    pub fn parent_merge_base(
        &mut self,
        document: DocumentId,
        branch: BranchId,
        limits: Limits,
    ) -> Result<View> {
        // The ordinary read does not trigger a concurrent-writer test action.
        self.parent_merge_base_inner(document, branch, limits, || Ok(()))
    }

    /// Capture and authenticate one consistent bounded graph before pure base selection.
    fn parent_merge_base_inner(
        &mut self,
        document: DocumentId,
        branch: BranchId,
        limits: Limits,
        after_source: impl FnOnce() -> Result<()>,
    ) -> Result<View> {
        if !(1..=MAX_REVISIONS).contains(&limits.revisions)
            || !(1..=MAX_BYTES).contains(&limits.bytes)
            || !(1..=MAX_WORK).contains(&limits.work)
        {
            return Err(Error::Limit);
        }
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let catalog = authority::catalog(&cipher, &tx, self.owner, self.device)?;
        let mut remaining = limits.bytes;
        let (comparison, doc) = capture_comparison(
            &cipher,
            &tx,
            &catalog,
            document,
            branch,
            &mut remaining,
            after_source,
        )?;

        let mut entries = BTreeMap::new();
        let mut pending = vec![comparison.parent_revision, comparison.source_revision];
        while let Some(id) = pending.pop() {
            if entries.contains_key(&id) {
                continue;
            }
            if entries.len() == limits.revisions {
                return Err(Error::Limit);
            }
            let entry = history::read_entry(&cipher, &tx, &doc, id, &mut remaining)?;
            if let Some(parent) = entry.parent {
                pending.push(parent);
            }
            entries.insert(id, entry);
        }

        let records: Vec<_> = entries
            .values()
            // Pass only authenticated same-node parent descriptors into pure planning.
            .map(|entry| ancestry::Record {
                revision: entry.revision,
                node: doc.node,
                parents: entry.parent.as_slice(),
            })
            .collect();

        let selection = match ancestry::common_base(
            doc.node,
            comparison.source_revision,
            comparison.parent_revision,
            &records,
            limits.work,
        ) {
            Ok(base) => Selection::Base {
                revision: base.revision,
                snapshot: entries[&base.revision].snapshot,
                source_in_target: base.source_in_target,
                target_in_source: base.target_in_source,
            },
            Err(ancestry::Error::Unrelated) => Selection::Unrelated,
            Err(ancestry::Error::Ambiguous(revisions)) => Selection::Ambiguous { revisions },
            Err(ancestry::Error::Limit) => return Err(Error::Limit),
            Err(_) => return Err(Error::Integrity),
        };
        let view = View {
            comparison,
            selection,
            revisions_read: entries.len(),
        };

        tx.commit()?;

        Ok(view)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};

    /// Create a synthetic child branch at the exact supplied retained parent context.
    fn child(ws: &mut Workspace, state: &EditorState, n: u8) -> BranchId {
        match ws
            .execute(
                op(n),
                Command::Branch {
                    mutation: Mutation::Create {
                        document: state.document,
                        parent: state.branch,
                        revision: state.base,
                        snapshot: state.snapshot,
                        name: "Synthetic child".into(),
                    },
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Branch { state } => state.branch,
            _ => panic!(),
        }
    }

    /// Capture a branch Save with this exact acknowledged base/generation/sequence.
    fn write(state: &EditorState, text: &str) -> Command {
        Command::Branch {
            mutation: Mutation::Save {
                document: state.document,
                branch: state.branch,
                generation: state.generation,
                base: state.base,
                previous_sequence: state.acknowledged_sequence,
                sequence: state.acknowledged_sequence + 1,
                text: text.into(),
            },
        }
    }

    /// Capture a branch Commit of the exact acknowledged synthetic editor state.
    fn publish(state: &EditorState) -> Command {
        Command::Branch {
            mutation: Mutation::Commit {
                document: state.document,
                branch: state.branch,
                generation: state.generation,
                base: state.base,
                sequence: state.acknowledged_sequence,
            },
        }
    }

    /// Require a unique base result before extracting its exact identity/context flags.
    fn base(view: &View) -> (RevisionId, SnapshotId, bool, bool) {
        match view.selection {
            Selection::Base {
                revision,
                snapshot,
                source_in_target,
                target_in_source,
            } => (revision, snapshot, source_in_target, target_in_source),
            _ => panic!(),
        }
    }

    /// Guard unique base selection across divergence/restart without touching either pending draft.
    #[test]
    fn divergent_committed_histories_select_exact_base_without_reading_or_changing_drafts() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let initial = ws.open_document(doc).unwrap();
        let branch = child(&mut ws, &initial, 2);
        ws.execute(op(3), save(&initial, "Parent Wednesday\r\n😀"))
            .unwrap();
        let state = ws.open_document(doc).unwrap();
        ws.execute(op(4), commit(&state)).unwrap();
        let state = ws.open_branch(doc, branch).unwrap();
        ws.execute(op(5), write(&state, "Child Tuesday\r中"))
            .unwrap();
        let state = ws.open_branch(doc, branch).unwrap();
        ws.execute(op(6), publish(&state)).unwrap();
        let parent = ws.open_document(doc).unwrap();
        let source = ws.open_branch(doc, branch).unwrap();
        ws.execute(op(7), save(&parent, "Uncommitted parent"))
            .unwrap();
        ws.execute(op(8), write(&source, "Uncommitted source"))
            .unwrap();
        let changes = ws.db.total_changes();
        let view = ws
            .parent_merge_base(doc, branch, Limits::default())
            .unwrap();
        assert_eq!(view.comparison.source_revision, source.base);
        assert_eq!(view.comparison.parent_revision, parent.base);
        assert_eq!(base(&view), (initial.base, initial.snapshot, false, false));
        assert_eq!(view.revisions_read, 3);
        assert_eq!(changes, ws.db.total_changes());
        assert_eq!(ws.open_document(doc).unwrap().text, "Uncommitted parent");
        assert_eq!(
            ws.open_branch(doc, branch).unwrap().text,
            "Uncommitted source"
        );
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        assert_eq!(
            base(
                &ws.parent_merge_base(doc, branch, Limits::default())
                    .unwrap()
            ),
            base(&view)
        );
        let grandchild = child(&mut ws, &source, 9);
        let nested = ws
            .parent_merge_base(doc, grandchild, Limits::default())
            .unwrap();
        assert_eq!(nested.comparison.parent, branch);
        assert_eq!(base(&nested), (source.base, source.snapshot, true, true));
    }

    /// Ensure a concurrent Commit cannot mix ancestry from two different read views.
    #[test]
    fn source_and_parent_ancestry_share_one_read_view_during_a_concurrent_commit() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let initial = ws.open_document(doc).unwrap();
        let branch = child(&mut ws, &initial, 2);
        let mut writer = Workspace::open(&temp.db(), PASS).unwrap();
        writer
            .execute(op(3), save(&initial, "Later parent publication"))
            .unwrap();
        let pending = writer.open_document(doc).unwrap();
        let view = ws
            // Advance a separate writer after source capture to test snapshot consistency.
            .parent_merge_base_inner(doc, branch, Limits::default(), || {
                writer.execute(op(4), commit(&pending))?;
                Ok(())
            })
            .unwrap();
        assert_eq!(base(&view), (initial.base, initial.snapshot, true, true));
        assert_eq!(view.comparison.parent_revision, initial.base);
        assert_eq!(view.revisions_read, 1);
        let later = ws
            .parent_merge_base(doc, branch, Limits::default())
            .unwrap();
        assert_eq!(base(&later), (initial.base, initial.snapshot, true, false));
        assert_ne!(
            later.comparison.parent_revision,
            view.comparison.parent_revision
        );
    }

    /// Reject exceeded bounds and lost scope without a partial selection or write.
    #[test]
    fn budgets_and_current_authority_fail_without_partial_selection_or_sql_writes() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let initial = ws.open_document(doc).unwrap();
        let branch = child(&mut ws, &initial, 2);
        ws.execute(op(3), save(&initial, "Later parent")).unwrap();
        let state = ws.open_document(doc).unwrap();
        ws.execute(op(4), commit(&state)).unwrap();
        let changes = ws.db.total_changes();
        for limits in [
            Limits {
                revisions: 1,
                ..Limits::default()
            },
            Limits {
                revisions: 0,
                ..Limits::default()
            },
            Limits {
                revisions: MAX_REVISIONS + 1,
                ..Limits::default()
            },
            Limits {
                bytes: 1,
                ..Limits::default()
            },
            Limits {
                bytes: MAX_BYTES + 1,
                ..Limits::default()
            },
            Limits {
                work: 1,
                ..Limits::default()
            },
            Limits {
                work: MAX_WORK + 1,
                ..Limits::default()
            },
        ] {
            assert!(matches!(
                ws.parent_merge_base(doc, branch, limits),
                Err(Error::Limit)
            ));
        }
        assert!(matches!(
            ws.parent_merge_base(doc, initial.branch, Limits::default()),
            Err(Error::Invalid)
        ));
        assert!(matches!(
            ws.parent_merge_base(doc, BranchId([99; 32]), Limits::default()),
            Err(Error::NotFound)
        ));
        assert!(matches!(
            ws.parent_merge_base(DocumentId([99; 32]), branch, Limits::default()),
            Err(Error::NotFound)
        ));
        assert_eq!(changes, ws.db.total_changes());
        let owner = ws.owner;
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.parent_merge_base(doc, branch, Limits::default()),
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
        assert!(matches!(
            ws.parent_merge_base(doc, branch, Limits::default()),
            Err(Error::NotFound)
        ));
    }

    /// Reject missing, cross-node, cyclic or oversized evidence rather than guessing a base.
    #[test]
    fn missing_corrupt_cross_node_and_cyclic_evidence_never_fall_back_to_branch_creation() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let initial = ws.open_document(doc).unwrap();
        let branch = child(&mut ws, &initial, 2);
        ws.execute(op(3), save(&initial, "Parent advanced"))
            .unwrap();
        let pending = ws.open_document(doc).unwrap();
        ws.execute(op(4), commit(&pending)).unwrap();
        let head = ws.open_document(doc).unwrap();
        let original: Vec<u8> = ws
            .db
            .query_row(
                "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
                params![REVISION, initial.base.0.as_slice()],
                // Retain original fixture ciphertext so a deliberately missing record can be restored.
                |r| r.get(0),
            )
            .unwrap();
        ws.db
            .execute(
                "DELETE FROM objects WHERE kind=?1 AND id=?2",
                params![REVISION, initial.base.0.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.parent_merge_base(doc, branch, Limits::default()),
            Err(Error::NotFound)
        ));
        ws.db
            .execute(
                "INSERT INTO objects(kind,id,envelope) VALUES (?1,?2,?3)",
                params![REVISION, initial.base.0.as_slice(), original],
            )
            .unwrap();
        // Re-seal controlled semantic faults to isolate binding/cycle checks from AEAD failure.
        let mutate = |ws: &Workspace, wrong_node: bool, cycle: bool| {
            let cipher = Cipher {
                key: &ws.key,
                workspace: ws.workspace,
            };
            let mut revision: Revision = cipher.object(&ws.db, REVISION, initial.base.0).unwrap();
            revision.node = if wrong_node {
                NodeId([99; 32])
            } else {
                initial.node
            };
            revision.parent = if cycle { Some(head.base) } else { None };
            let mut event: Event = cipher.object(&ws.db, EVENT, op(1).0).unwrap();
            event.parent = revision.parent;
            let revision = cipher.seal(REVISION, initial.base.0, 0, &revision).unwrap();
            let event = cipher.seal(EVENT, op(1).0, 0, &event).unwrap();
            ws.db
                .execute(
                    "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                    params![revision, REVISION, initial.base.0.as_slice()],
                )
                .unwrap();
            ws.db
                .execute(
                    "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                    params![event, EVENT, op(1).0.as_slice()],
                )
                .unwrap();
        };
        mutate(&ws, true, false);
        assert!(matches!(
            ws.parent_merge_base(doc, branch, Limits::default()),
            Err(Error::Integrity)
        ));
        mutate(&ws, false, true);
        assert!(matches!(
            ws.parent_merge_base(doc, branch, Limits::default()),
            Err(Error::Integrity)
        ));
        mutate(&ws, false, false);
        assert!(ws.parent_merge_base(doc, branch, Limits::default()).is_ok());
        ws.db
            .execute(
                "UPDATE objects SET envelope=zeroblob(65536) WHERE kind=?1 AND id=?2",
                params![REVISION, initial.base.0.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.parent_merge_base(
                doc,
                branch,
                Limits {
                    bytes: 4096,
                    ..Limits::default()
                }
            ),
            Err(Error::Limit)
        ));
    }
}
