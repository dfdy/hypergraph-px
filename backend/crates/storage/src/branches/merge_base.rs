// SPDX-License-Identifier: AGPL-3.0-only
//! Authenticated bounded legacy ancestry. Read-only; no inferred passage order.
use super::*;
use hypergraph_domain::parent_merge::ancestry;
use std::collections::BTreeMap;

pub const MAX_REVISIONS: usize = 1024;
pub const MAX_BYTES: usize = 64 * 1024 * 1024;
pub const MAX_WORK: usize = 1024 * 1024;

#[derive(Clone, Copy)]
pub struct Limits {
    pub revisions: usize,
    pub bytes: usize,
    pub work: usize,
}
impl Default for Limits {
    fn default() -> Self {
        Self {
            revisions: MAX_REVISIONS,
            bytes: MAX_BYTES,
            work: MAX_WORK,
        }
    }
}
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
#[derive(Debug, Serialize)]
pub struct View {
    pub comparison: Comparison,
    pub selection: Selection,
    pub revisions_read: usize,
}

impl Workspace {
    pub fn parent_merge_base(
        &mut self,
        document: DocumentId,
        branch: BranchId,
        limits: Limits,
    ) -> Result<View> {
        self.parent_merge_base_inner(document, branch, limits, || Ok(()))
    }
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
