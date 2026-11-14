// SPDX-License-Identifier: AGPL-3.0-only
//! Optional local branches. The saved Document keeps its original branch forever.
use super::*;

pub const KIND: i32 = 20;
pub const INDEX_KIND: i32 = 21;
pub const MAX_PAGE: usize = 16;
const JS_MAX: u64 = 9_007_199_254_740_991;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case", deny_unknown_fields)]
pub enum Mutation {
    Create {
        #[serde(with = "encoding::identity")]
        document: DocumentId,
        #[serde(with = "encoding::identity")]
        parent: BranchId,
        #[serde(with = "encoding::identity")]
        revision: RevisionId,
        #[serde(with = "encoding::identity")]
        snapshot: SnapshotId,
        name: String,
    },
    Save {
        #[serde(with = "encoding::identity")]
        document: DocumentId,
        #[serde(with = "encoding::identity")]
        branch: BranchId,
        generation: u64,
        #[serde(with = "encoding::identity")]
        base: RevisionId,
        previous_sequence: u64,
        sequence: u64,
        text: String,
    },
    Commit {
        #[serde(with = "encoding::identity")]
        document: DocumentId,
        #[serde(with = "encoding::identity")]
        branch: BranchId,
        generation: u64,
        #[serde(with = "encoding::identity")]
        base: RevisionId,
        sequence: u64,
    },
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Record {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub draft: DraftId,
    #[serde(with = "encoding::identity")]
    pub parent: BranchId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    pub name: String,
    #[serde(with = "encoding::identity")]
    pub actor: PrincipalId,
    #[serde(with = "encoding::identity")]
    pub device: DeviceId,
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,
    pub ordinal: u64,
    /// List linkage only, distinct from branch parentage and revision ancestry.
    #[serde(with = "encoding::optional_identity")]
    pub previous: Option<BranchId>,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Change {
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    pub outcome: EditOutcome,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "result", rename_all = "snake_case", deny_unknown_fields)]
pub enum EditOutcome {
    Created {
        #[serde(with = "encoding::identity")]
        document: DocumentId,
    },
    Saved {
        #[serde(with = "encoding::identity")]
        document: DocumentId,
        generation: u64,
        sequence: u64,
    },
    Committed {
        #[serde(with = "encoding::identity")]
        document: DocumentId,
        generation: u64,
        sequence: u64,
        #[serde(with = "encoding::identity")]
        revision: RevisionId,
        #[serde(with = "encoding::identity")]
        snapshot: SnapshotId,
    },
}
impl TryFrom<Outcome> for EditOutcome {
    type Error = Error;
    fn try_from(value: Outcome) -> Result<Self> {
        Ok(match value {
            Outcome::Created { document } => Self::Created { document },
            Outcome::Saved {
                document,
                generation,
                sequence,
            } => Self::Saved {
                document,
                generation,
                sequence,
            },
            Outcome::Committed {
                document,
                generation,
                sequence,
                revision,
                snapshot,
            } => Self::Committed {
                document,
                generation,
                sequence,
                revision,
                snapshot,
            },
            _ => return Err(Error::Integrity),
        })
    }
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Index {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    head: BranchId,
    count: u64,
}
#[derive(Serialize)]
pub struct Page {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub original_branch: BranchId,
    pub entries: Vec<Record>,
    #[serde(with = "encoding::optional_identity")]
    pub next: Option<BranchId>,
}
pub(super) fn validate(mutation: &Mutation) -> Result<()> {
    match mutation {
        Mutation::Create { name, .. } => {
            if name.trim().is_empty() || name.len() > 512 {
                return Err(Error::Invalid);
            }
        }
        Mutation::Save {
            document,
            generation,
            base,
            previous_sequence,
            sequence,
            text,
            ..
        } => validate_command(&Command::Save {
            document: *document,
            generation: *generation,
            base: *base,
            previous_sequence: *previous_sequence,
            sequence: *sequence,
            text: text.clone(),
        })?,
        Mutation::Commit {
            document,
            generation,
            base,
            sequence,
            ..
        } => validate_command(&Command::Commit {
            document: *document,
            generation: *generation,
            base: *base,
            sequence: *sequence,
        })?,
    }
    Ok(())
}
fn index(
    cipher: &Cipher<'_>,
    db: &Connection,
    document: DocumentId,
) -> Result<Option<(u64, Index)>> {
    match cipher.slot::<Index>(db, INDEX_KIND, document.0) {
        Ok((generation, index)) => {
            if index.document != document
                || index.count == 0
                || index.count > JS_MAX
                || generation.checked_add(1) != Some(index.count)
            {
                return Err(Error::Integrity);
            }
            Ok(Some((generation, index)))
        }
        Err(Error::NotFound) => Ok(None),
        Err(error) => Err(error),
    }
}
fn record(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    doc: &Document,
    branch: BranchId,
) -> Result<Record> {
    let value: Record = cipher.object(db, KIND, branch.0)?;
    if value.document != doc.id
        || value.node != doc.node
        || value.branch != branch
        || branch == doc.branch
        || value.parent == branch
        || value.draft == doc.draft
        || value.name.trim().is_empty()
        || value.name.len() > 512
        || value.ordinal == 0
        || value.ordinal > JS_MAX
        || (value.ordinal == 1) != value.previous.is_none()
        || value.previous == Some(branch)
        || value.actor != catalog.owner
        || value.device != catalog.device
    {
        return Err(Error::Integrity);
    }
    if snapshot_revision(cipher, db, doc, value.snapshot)? != value.revision {
        return Err(Error::Integrity);
    }
    let stored: StoredReceipt = cipher.object(db, RECEIPT, value.operation.0)?;
    let expected = Outcome::Branch {
        state: Change {
            branch,
            outcome: EditOutcome::Created { document: doc.id },
        },
    };
    let command = Command::Branch {
        mutation: Mutation::Create {
            document: doc.id,
            parent: value.parent,
            revision: value.revision,
            snapshot: value.snapshot,
            name: value.name.clone(),
        },
    };
    let bytes = Zeroizing::new(serde_json::to_vec(&command).map_err(|_| Error::Format)?);
    let digest: [u8; 32] = Sha256::digest(&*bytes).into();
    if stored.receipt.operation != value.operation
        || stored.receipt.outcome != expected
        || stored.digest != digest
    {
        return Err(Error::Integrity);
    }
    Ok(value)
}
pub(super) fn document(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    id: DocumentId,
    branch: BranchId,
) -> Result<Document> {
    if !catalog.documents.contains(&id) {
        return Err(Error::NotFound);
    }
    let mut doc: Document = cipher.object(db, DOCUMENT, id.0)?;
    if doc.id != id {
        return Err(Error::Integrity);
    }
    if branch != doc.branch {
        let metadata = record(cipher, db, catalog, &doc, branch)?;
        doc.branch = branch;
        doc.draft = metadata.draft;
    }
    Ok(doc)
}
pub(super) fn authorize(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    mutation: &Mutation,
) -> Result<()> {
    let (id, branch) = match mutation {
        Mutation::Create {
            document, parent, ..
        } => (*document, *parent),
        Mutation::Save {
            document, branch, ..
        }
        | Mutation::Commit {
            document, branch, ..
        } => (*document, *branch),
    };
    document(cipher, db, catalog, id, branch)?;
    Ok(())
}
pub(super) fn apply(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    operation: OperationId,
    mutation: Mutation,
    checkpoint: &mut impl FnMut(&str) -> Result<()>,
) -> Result<Change> {
    let (branch, outcome) = match mutation {
        Mutation::Create {
            document: id,
            parent,
            revision,
            snapshot,
            name,
        } => {
            let doc = document(cipher, db, catalog, id, parent)?;
            let (_, head): (_, Head) = cipher.slot(db, HEAD, parent.0)?;
            if head.document != id {
                return Err(Error::Integrity);
            }
            if head.revision != revision || head.snapshot != snapshot {
                return Err(Error::Conflict);
            }
            if snapshot_revision(cipher, db, &doc, snapshot)? != revision {
                return Err(Error::Integrity);
            }
            let text = reconstruct(cipher, db, &doc, snapshot)?;
            if text.len() > MAX_TEXT_BYTES {
                return Err(Error::Limit);
            }
            let prior = index(cipher, db, id)?;
            let count = prior.as_ref().map_or(1, |(_, i)| i.count + 1);
            if count > JS_MAX {
                return Err(Error::Limit);
            }
            let branch = BranchId(new_id()?);
            let draft = DraftId(new_id()?);
            cipher.insert(
                db,
                KIND,
                branch.0,
                &Record {
                    document: id,
                    node: doc.node,
                    branch,
                    draft,
                    parent,
                    revision,
                    snapshot,
                    name,
                    actor: catalog.owner,
                    device: catalog.device,
                    operation,
                    ordinal: count,
                    previous: prior.as_ref().map(|(_, i)| i.head),
                },
            )?;
            cipher.new_slot(db, HEAD, branch.0, &head)?;
            cipher.new_slot(
                db,
                DRAFT,
                draft.0,
                &Draft {
                    document: id,
                    branch,
                    base: revision,
                    actor: catalog.owner,
                    device: catalog.device,
                    sequence: 0,
                    text,
                },
            )?;
            checkpoint("objects")?;
            let new_index = Index {
                document: id,
                head: branch,
                count,
            };
            if let Some((generation, _)) = prior {
                cipher.update(db, INDEX_KIND, id.0, generation, &new_index)?;
            } else {
                cipher.new_slot(db, INDEX_KIND, id.0, &new_index)?;
            }
            (branch, Outcome::Created { document: id })
        }
        Mutation::Save {
            document: id,
            branch,
            generation,
            base,
            previous_sequence,
            sequence,
            text,
        } => {
            let doc = document(cipher, db, catalog, id, branch)?;
            let outcome = write_draft(
                cipher,
                db,
                &doc,
                catalog.owner,
                catalog.device,
                operation,
                Command::Save {
                    document: id,
                    generation,
                    base,
                    previous_sequence,
                    sequence,
                    text,
                },
                checkpoint,
            )?;
            (branch, outcome)
        }
        Mutation::Commit {
            document: id,
            branch,
            generation,
            base,
            sequence,
        } => {
            let doc = document(cipher, db, catalog, id, branch)?;
            let outcome = write_draft(
                cipher,
                db,
                &doc,
                catalog.owner,
                catalog.device,
                operation,
                Command::Commit {
                    document: id,
                    generation,
                    base,
                    sequence,
                },
                checkpoint,
            )?;
            (branch, outcome)
        }
    };
    Ok(Change {
        branch,
        outcome: outcome.try_into()?,
    })
}

pub mod merge_base;

const HISTORY_CURSOR_KIND: i32 = 1_000_002;
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct HistoryCursor {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    branch: BranchId,
    #[serde(with = "encoding::identity")]
    snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    next: RevisionId,
}
#[derive(Serialize)]
pub struct HistoryPage {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    pub entries: Vec<history::Entry>,
    pub cursor: Vec<u8>,
    pub next: Option<Vec<u8>>,
}
#[derive(Debug, Serialize)]
pub struct Comparison {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub parent: BranchId,
    pub source_name: String,
    pub parent_name: String,
    #[serde(with = "encoding::identity")]
    pub source_revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub source_snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    pub parent_revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub parent_snapshot: SnapshotId,
}
// Shared capture keeps comparison and full ancestry loading in one read view.
fn capture_comparison(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    id: DocumentId,
    branch: BranchId,
    remaining: &mut usize,
    after_source: impl FnOnce() -> Result<()>,
) -> Result<(Comparison, Document)> {
    authority::document(catalog, id)?;
    let original: Document = cipher.object(db, DOCUMENT, id.0)?;
    if original.id != id {
        return Err(Error::Integrity);
    }
    if original.branch == branch {
        return Err(Error::Invalid);
    }
    let source = record(cipher, db, catalog, &original, branch)?;
    let mut source_doc = original.clone();
    source_doc.branch = branch;
    source_doc.draft = source.draft;
    let source_page = history::read_document_page(cipher, db, &source_doc, None, 1, remaining)?;
    after_source()?;
    let mut parent_doc = original.clone();
    let parent_name = if source.parent == original.branch {
        "Original branch".to_owned()
    } else {
        let parent = record(cipher, db, catalog, &original, source.parent)?;
        parent_doc.branch = source.parent;
        parent_doc.draft = parent.draft;
        parent.name
    };
    let parent_page = history::read_document_page(cipher, db, &parent_doc, None, 1, remaining)?;
    let source_head = source_page.entries.first().ok_or(Error::Integrity)?;
    let parent_head = parent_page.entries.first().ok_or(Error::Integrity)?;
    let result = Comparison {
        document: id,
        node: original.node,
        branch,
        parent: source.parent,
        source_name: source.name,
        parent_name,
        source_revision: source_head.revision,
        source_snapshot: source_head.snapshot,
        parent_revision: parent_head.revision,
        parent_snapshot: parent_head.snapshot,
    };
    Ok((result, original))
}

impl Workspace {
    /// Capture two committed heads together; fixed parentage does not select a Merge base.
    pub fn branch_comparison(&mut self, id: DocumentId, branch: BranchId) -> Result<Comparison> {
        self.branch_comparison_inner(id, branch, history::PAGE_BYTES, || Ok(()))
    }
    fn branch_comparison_inner(
        &mut self,
        id: DocumentId,
        branch: BranchId,
        mut remaining: usize,
        after_source: impl FnOnce() -> Result<()>,
    ) -> Result<Comparison> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let catalog = authority::catalog(&cipher, &tx, self.owner, self.device)?;
        let (result, _) = capture_comparison(
            &cipher,
            &tx,
            &catalog,
            id,
            branch,
            &mut remaining,
            after_source,
        )?;
        tx.commit()?;
        Ok(result)
    }
    pub fn branch_history_page(
        &mut self,
        id: DocumentId,
        branch: BranchId,
        snapshot: SnapshotId,
        cursor: Option<&[u8]>,
        limit: usize,
    ) -> Result<HistoryPage> {
        if !(1..=history::MAX_PAGE).contains(&limit)
            || cursor.is_some_and(|c| c.is_empty() || c.len() > 4096)
        {
            return Err(Error::Invalid);
        }
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        let doc = document(&cipher, &tx, &catalog, id, branch)?;
        let start = if let Some(cursor) = cursor {
            let token: HistoryCursor = cipher
                .open(HISTORY_CURSOR_KIND, self.owner.0, 0, cursor)
                .map_err(|_| Error::Invalid)?;
            if token.document != id || token.branch != branch || token.snapshot != snapshot {
                return Err(Error::Invalid);
            }
            token.next
        } else {
            let (_, head): (_, Head) = cipher.slot(&tx, HEAD, branch.0)?;
            if head.document != id {
                return Err(Error::Integrity);
            }
            if head.snapshot != snapshot {
                return Err(Error::Conflict);
            }
            head.revision
        };
        let mut remaining = history::PAGE_BYTES;
        let page =
            history::read_document_page(&cipher, &tx, &doc, Some(start), limit, &mut remaining)?;
        if cursor.is_none()
            && page
                .entries
                .first()
                .is_none_or(|entry| entry.snapshot != snapshot)
        {
            return Err(Error::Integrity);
        }
        let token = |next| {
            cipher.seal(
                HISTORY_CURSOR_KIND,
                self.owner.0,
                0,
                &HistoryCursor {
                    document: id,
                    branch,
                    snapshot,
                    next,
                },
            )
        };
        let result = HistoryPage {
            document: id,
            branch,
            snapshot,
            entries: page.entries,
            cursor: token(start)?,
            next: page.next.map(token).transpose()?,
        };
        tx.commit()?;
        Ok(result)
    }
    pub fn branch_page(
        &mut self,
        id: DocumentId,
        next: Option<BranchId>,
        limit: usize,
    ) -> Result<Page> {
        if !(1..=MAX_PAGE).contains(&limit) {
            return Err(Error::Invalid);
        }
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        if !catalog.documents.contains(&id) {
            return Err(Error::NotFound);
        }
        let doc: Document = cipher.object(&tx, DOCUMENT, id.0)?;
        if doc.id != id {
            return Err(Error::Integrity);
        }
        let index = index(&cipher, &tx, id)?;
        let mut cursor = next.or_else(|| index.as_ref().map(|(_, i)| i.head));
        let mut expected = if next.is_none() {
            index.as_ref().map(|(_, i)| i.count)
        } else {
            None
        };
        let mut entries = Vec::new();
        while let Some(branch) = cursor {
            if entries.len() == limit {
                break;
            }
            let value = record(&cipher, &tx, &catalog, &doc, branch)?;
            if expected.is_some_and(|ordinal| value.ordinal != ordinal) {
                return Err(Error::Integrity);
            }
            expected = value.ordinal.checked_sub(1);
            cursor = value.previous;
            entries.push(value);
        }
        let page = Page {
            document: id,
            original_branch: doc.branch,
            entries,
            next: cursor,
        };
        tx.commit()?;
        Ok(page)
    }
    pub fn open_branch(&mut self, id: DocumentId, branch: BranchId) -> Result<EditorState> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        let doc = document(&cipher, &tx, &catalog, id, branch)?;
        let result = editor_state(&cipher, &tx, &doc, self.owner, self.device)?;
        tx.commit()?;
        Ok(result)
    }
    pub fn branch_history(
        &mut self,
        id: DocumentId,
        branch: BranchId,
        next: Option<RevisionId>,
        limit: usize,
    ) -> Result<history::Page> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        let doc = document(&cipher, &tx, &catalog, id, branch)?;
        let mut remaining = history::PAGE_BYTES;
        let page = history::read_document_page(&cipher, &tx, &doc, next, limit, &mut remaining)?;
        tx.commit()?;
        Ok(page)
    }
}

#[cfg(test)]
pub(super) mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};

    pub(crate) fn creation(state: &EditorState) -> Command {
        Command::Branch {
            mutation: Mutation::Create {
                document: state.document,
                parent: state.branch,
                revision: state.base,
                snapshot: state.snapshot,
                name: "Alternative 😀\r\n".into(),
            },
        }
    }
    fn child(ws: &mut Workspace, state: &EditorState, operation: u8) -> BranchId {
        match ws.execute(op(operation), creation(state)).unwrap().outcome {
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
    #[test]
    fn comparison_excludes_both_drafts_and_follows_fixed_parent_with_exact_committed_snapshots() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let initial = ws.open_document(id).unwrap();
        let branch = child(&mut ws, &initial, 2);
        let first = ws.open_branch(id, branch).unwrap();
        ws.execute(op(3), write(&first, "Child committed 😀\r\n中\r"))
            .unwrap();
        let pending_source = ws.open_branch(id, branch).unwrap();
        ws.execute(op(4), publish(&pending_source)).unwrap();
        ws.execute(op(5), save(&initial, "Parent committed e\u{301}\r\n"))
            .unwrap();
        let pending_parent = ws.open_document(id).unwrap();
        ws.execute(op(6), commit(&pending_parent)).unwrap();
        let source = ws.open_branch(id, branch).unwrap();
        let parent = ws.open_document(id).unwrap();
        ws.execute(op(7), write(&source, "Newer child draft"))
            .unwrap();
        ws.execute(op(8), save(&parent, "Newer parent draft"))
            .unwrap();
        let changes = ws.db.total_changes();
        let view = ws.branch_comparison(id, branch).unwrap();
        assert_eq!(view.document, id);
        assert_eq!(view.node, initial.node);
        assert_eq!(view.parent, initial.branch);
        assert_eq!(view.source_snapshot, source.snapshot);
        assert_eq!(view.parent_snapshot, parent.snapshot);
        assert_eq!(
            ws.reconstruct_snapshot(id, view.source_snapshot).unwrap(),
            "Child committed 😀\r\n中\r"
        );
        assert_eq!(
            ws.reconstruct_snapshot(id, view.parent_snapshot).unwrap(),
            "Parent committed e\u{301}\r\n"
        );
        assert_eq!(ws.db.total_changes(), changes);
        let grandchild = child(&mut ws, &source, 9);
        assert_eq!(ws.branch_comparison(id, grandchild).unwrap().parent, branch);
        assert!(matches!(
            ws.branch_comparison(id, initial.branch),
            Err(Error::Invalid)
        ));
        assert!(matches!(
            ws.branch_comparison(id, BranchId([99; 32])),
            Err(Error::NotFound)
        ));
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.branch_comparison(id, branch),
            Err(Error::Integrity)
        ));
    }
    #[test]
    fn comparison_pins_one_read_view_during_parent_commit_and_returns_no_partial_budget_result() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let initial = ws.open_document(id).unwrap();
        let branch = child(&mut ws, &initial, 2);
        let source_page_bytes: usize = [
            (MANIFEST, initial.manifest.0),
            (REVISION, initial.base.0),
            (EVENT, op(1).0),
            (SNAPSHOT, initial.snapshot.0),
        ]
        .iter()
        .map(|(kind, id)| {
            ws.db
                .query_row(
                    "SELECT length(envelope) FROM objects WHERE kind=?1 AND id=?2",
                    params![kind, id.as_slice()],
                    |row| row.get::<_, u32>(0),
                )
                .unwrap() as usize
        })
        .sum();
        let visited = std::cell::Cell::new(false);
        assert!(matches!(
            ws.branch_comparison_inner(id, branch, source_page_bytes + 1, || {
                visited.set(true);
                Ok(())
            }),
            Err(Error::Limit)
        ));
        assert!(
            visited.get(),
            "source completed; the shared budget rejected the parent page"
        );
        let mut writer = Workspace::open(&temp.db(), PASS).unwrap();
        let old_parent = writer.open_document(id).unwrap();
        writer
            .execute(op(3), save(&old_parent, "Later parent commit"))
            .unwrap();
        let pending = writer.open_document(id).unwrap();
        let comparison = ws
            .branch_comparison_inner(id, branch, history::PAGE_BYTES, || {
                writer.execute(op(4), commit(&pending))?;
                Ok(())
            })
            .unwrap();
        assert_eq!(comparison.parent_snapshot, old_parent.snapshot);
        assert_ne!(
            comparison.parent_snapshot,
            writer.open_document(id).unwrap().snapshot
        );
        assert!(matches!(
            ws.branch_comparison_inner(id, branch, 1, || Ok(())),
            Err(Error::Limit)
        ));
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
            ws.branch_comparison(id, branch),
            Err(Error::NotFound)
        ));
    }
    #[test]
    fn children_keep_identity_and_independent_drafts_histories_and_parentage_after_restart() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let original = ws.open_document(id).unwrap();
        let exact = ws.reconstruct_snapshot(id, original.snapshot).unwrap();
        ws.execute(op(2), save(&original, "Parent pending 😀\r\n"))
            .unwrap();
        let a = child(&mut ws, &original, 3);
        let b = child(&mut ws, &original, 4);
        for (branch, text, operation) in [(a, "A😀\r\n中\r", 5), (b, "B😀\n中\r\n", 7)] {
            let state = ws.open_branch(id, branch).unwrap();
            assert_eq!(state.node, original.node);
            assert_eq!(state.base, original.base);
            assert_eq!(state.snapshot, original.snapshot);
            assert_eq!(state.text, exact);
            assert_ne!(state.draft, original.draft);
            ws.execute(op(operation), write(&state, text)).unwrap();
            let state = ws.open_branch(id, branch).unwrap();
            ws.execute(op(operation + 1), publish(&state)).unwrap();
        }
        assert_eq!(ws.open_document(id).unwrap().text, "Parent pending 😀\r\n");
        assert_eq!(ws.open_document(id).unwrap().base, original.base);
        let parent = ws.open_document(id).unwrap();
        ws.execute(op(9), commit(&parent)).unwrap();
        let state = ws.open_branch(id, a).unwrap();
        ws.execute(op(10), write(&state, "A newer pending\r\n"))
            .unwrap();
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        assert_eq!(ws.open_branch(id, a).unwrap().text, "A newer pending\r\n");
        assert_eq!(ws.open_branch(id, b).unwrap().text, "B😀\n中\r\n");
        let page = ws.branch_page(id, None, 1).unwrap();
        assert_eq!(page.original_branch, original.branch);
        assert_eq!(page.entries[0].branch, b);
        let rest = ws.branch_page(id, page.next, 1).unwrap();
        assert_eq!(rest.entries[0].branch, a);
        assert!(rest.next.is_none());
        for branch in [a, b] {
            let history = ws.branch_history(id, branch, None, 32).unwrap();
            assert_eq!(history.entries.len(), 2);
            assert_eq!(history.entries[0].parent, Some(original.base));
            assert_eq!(history.entries[1].snapshot, original.snapshot);
        }
        assert_eq!(rest.entries[0].parent, original.branch);
        assert_eq!(rest.entries[0].snapshot, original.snapshot);
        assert_eq!(ws.history_page(id, None, 32).unwrap().entries.len(), 2);
    }
    #[test]
    fn creation_faults_roll_back_and_lost_ack_replays_one_child_without_resetting_parent() {
        for phase in ["objects", "heads", "receipt", "committed"] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let id = create(&mut ws);
            let state = ws.open_document(id).unwrap();
            let command = creation(&state);
            assert!(matches!(
                ws.execute_inner(op(2), command.clone(), |at| if at == phase {
                    Err(Error::Io)
                } else {
                    Ok(())
                }),
                Err(Error::Io)
            ));
            assert_eq!(
                ws.branch_page(id, None, 16).unwrap().entries.len(),
                usize::from(phase == "committed")
            );
            let first = ws.execute(op(2), command.clone()).unwrap();
            let again = ws.execute(op(2), command).unwrap();
            assert_eq!(first, again);
            assert_eq!(ws.branch_page(id, None, 16).unwrap().entries.len(), 1);
            assert_eq!(ws.open_document(id).unwrap().generation, state.generation);
        }
    }
    #[test]
    fn stale_heads_scope_generations_operation_reuse_and_current_authority_fail_closed() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let original = ws.open_document(id).unwrap();
        let branch = child(&mut ws, &original, 2);
        let initial = ws.open_branch(id, branch).unwrap();
        let command = write(&initial, "Child draft");
        let saved = ws.execute(op(3), command.clone()).unwrap();
        assert_eq!(saved, ws.execute(op(3), command.clone()).unwrap());
        assert!(matches!(
            ws.execute(op(4), command.clone()),
            Err(Error::Conflict)
        ));
        assert!(matches!(
            ws.execute(op(3), write(&initial, "Other")),
            Err(Error::Conflict)
        ));
        ws.execute(op(5), commit(&original)).unwrap();
        assert!(matches!(
            ws.execute(op(6), creation(&original)),
            Err(Error::Conflict)
        ));
        assert!(matches!(
            ws.open_branch(DocumentId([9; 32]), branch),
            Err(Error::NotFound)
        ));
        assert!(matches!(
            ws.open_branch(id, BranchId([9; 32])),
            Err(Error::NotFound)
        ));
        for limit in [0, 17] {
            assert!(matches!(
                ws.branch_page(id, None, limit),
                Err(Error::Invalid)
            ));
        }
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let (generation, mut catalog): (_, Catalog) = cipher.slot(&ws.db, CATALOG, ROOT).unwrap();
        catalog.documents.clear();
        cipher
            .update(&ws.db, CATALOG, ROOT, generation, &catalog)
            .unwrap();
        assert!(matches!(ws.execute(op(3), command), Err(Error::NotFound)));
        assert!(matches!(ws.open_branch(id, branch), Err(Error::NotFound)));
    }
    #[test]
    fn authenticated_metadata_and_receipt_damage_never_guess_a_branch() {
        for field in ["document", "parent", "draft", "name", "ordinal", "receipt"] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let id = create(&mut ws);
            let original = ws.open_document(id).unwrap();
            let branch = child(&mut ws, &original, 2);
            let cipher = Cipher {
                key: &ws.key,
                workspace: ws.workspace,
            };
            let mut metadata: Record = cipher.object(&ws.db, KIND, branch.0).unwrap();
            let (kind, address, bytes) = if field == "receipt" {
                let mut receipt: StoredReceipt = cipher
                    .object(&ws.db, RECEIPT, metadata.operation.0)
                    .unwrap();
                receipt.digest[0] ^= 1;
                (
                    RECEIPT,
                    metadata.operation.0,
                    cipher
                        .seal(RECEIPT, metadata.operation.0, 0, &receipt)
                        .unwrap(),
                )
            } else {
                match field {
                    "document" => metadata.document = DocumentId([9; 32]),
                    "parent" => metadata.parent = branch,
                    "draft" => metadata.draft = original.draft,
                    "name" => metadata.name = "Altered".into(),
                    _ => metadata.ordinal = 0,
                }
                (
                    KIND,
                    branch.0,
                    cipher.seal(KIND, branch.0, 0, &metadata).unwrap(),
                )
            };
            ws.db
                .execute(
                    "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                    params![bytes, kind, address.as_slice()],
                )
                .unwrap();
            assert!(
                matches!(ws.open_branch(id, branch), Err(Error::Integrity)),
                "{field}"
            );
            assert!(
                matches!(ws.branch_page(id, None, 16), Err(Error::Integrity)),
                "{field}"
            );
            assert_eq!(ws.open_document(id).unwrap().branch, original.branch);
        }
    }
    #[test]
    fn encrypted_history_cursor_stays_pinned_across_commits_and_cannot_cross_branch_or_snapshot() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let original = ws.open_document(id).unwrap();
        let a = child(&mut ws, &original, 2);
        let b = child(&mut ws, &original, 3);
        let editor = ws.open_branch(id, a).unwrap();
        ws.execute(op(4), write(&editor, "A committed")).unwrap();
        let editor = ws.open_branch(id, a).unwrap();
        ws.execute(op(5), publish(&editor)).unwrap();
        let editor = ws.open_branch(id, a).unwrap();
        let snapshot = editor.snapshot;
        let page = ws.branch_history_page(id, a, snapshot, None, 1).unwrap();
        let cursor = page.next.unwrap();
        assert!(matches!(
            ws.branch_history_page(id, b, snapshot, Some(&cursor), 1),
            Err(Error::Invalid)
        ));
        assert!(matches!(
            ws.branch_history_page(id, a, original.snapshot, Some(&cursor), 1),
            Err(Error::Invalid)
        ));
        let mut damaged = cursor.clone();
        damaged[0] ^= 1;
        assert!(matches!(
            ws.branch_history_page(id, a, snapshot, Some(&damaged), 1),
            Err(Error::Invalid)
        ));
        ws.execute(op(6), write(&editor, "Newer A")).unwrap();
        let newer = ws.open_branch(id, a).unwrap();
        ws.execute(op(7), publish(&newer)).unwrap();
        assert!(matches!(
            ws.branch_history_page(id, a, snapshot, None, 1),
            Err(Error::Conflict)
        ));
        let older = ws
            .branch_history_page(id, a, snapshot, Some(&cursor), 1)
            .unwrap();
        assert_eq!(older.entries[0].revision, original.base);
        assert!(older.next.is_none());
        let repeat = ws
            .branch_history_page(id, a, snapshot, Some(&page.cursor), 1)
            .unwrap();
        assert_eq!(repeat.entries[0].snapshot, snapshot);
    }
}
