// SPDX-License-Identifier: AGPL-3.0-only
//! Optional private checkpoint evidence. Idle autosave remains mutable draft state.
use super::*;

pub const STATE_KIND: i32 = 22;
pub const CHECKPOINT_KIND: i32 = 23;
pub const PROMOTION_KIND: i32 = 24;
const JS_MAX: u64 = 9_007_199_254_740_991;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    pub generation: u64,
    #[serde(with = "encoding::identity")]
    pub base: RevisionId,
    pub sequence: u64,
    pub text: String,
    pub start_byte: usize,
    pub end_byte: usize,
    pub quote: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Change {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub working_branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub checkpoint: CheckpointId,
    pub ordinal: u64,
}
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SourceKind {
    WorkingCheckpoint,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Source {
    pub kind: SourceKind,
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub working_branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub checkpoint: CheckpointId,
    #[serde(with = "encoding::identities")]
    pub occurrence_path: Vec<OccurrenceId>,
    pub start_byte: usize,
    pub end_byte: usize,
}
impl Change {
    pub fn source(&self, occurrence: OccurrenceId, start_byte: usize, end_byte: usize) -> Source {
        Source {
            kind: SourceKind::WorkingCheckpoint,
            document: self.document,
            node: self.node,
            branch: self.branch,
            working_branch: self.working_branch,
            checkpoint: self.checkpoint,
            occurrence_path: vec![occurrence],
            start_byte,
            end_byte,
        }
    }
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct State {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    node: NodeId,
    #[serde(with = "encoding::identity")]
    branch: BranchId,
    #[serde(with = "encoding::identity")]
    working_branch: BranchId,
    #[serde(with = "encoding::identity")]
    draft: DraftId,
    #[serde(with = "encoding::identity")]
    actor: PrincipalId,
    #[serde(with = "encoding::identity")]
    device: DeviceId,
    #[serde(with = "encoding::identity")]
    head: CheckpointId,
    count: u64,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Record {
    state: Change,
    #[serde(with = "encoding::identity")]
    draft: DraftId,
    #[serde(with = "encoding::identity")]
    manifest: ManifestId,
    #[serde(with = "encoding::identity")]
    occurrence: OccurrenceId,
    #[serde(with = "encoding::identity")]
    actor: PrincipalId,
    #[serde(with = "encoding::identity")]
    device: DeviceId,
    #[serde(with = "encoding::identity")]
    operation: OperationId,
    #[serde(with = "encoding::optional_identity")]
    previous: Option<CheckpointId>,
    request: Request,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Promotion {
    #[serde(with = "encoding::identity")]
    pub checkpoint: CheckpointId,
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub working_branch: BranchId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,
}
#[derive(Serialize)]
pub struct View {
    pub source: Source,
    pub text: String,
    #[serde(with = "encoding::identity")]
    pub base: RevisionId,
    pub sequence: u64,
    pub publication: &'static str,
    pub promotion: Option<Promotion>,
}
pub(super) fn validate(request: &Request) -> Result<()> {
    // Leave room for the command/operation envelope and persisted metadata.
    if serde_json::to_vec(request)
        .map_err(|_| Error::Format)?
        .len()
        > 14 * 1024 * 1024 - 2048
    {
        return Err(Error::Limit);
    }

    if request.text.len() > MAX_TEXT_BYTES
        || request.quote.len() > MAX_TEXT_BYTES
        || request.generation > JS_MAX
        || request.sequence > JS_MAX
    {
        return Err(Error::Limit);
    }
    hypergraph_domain::working::capture(
        &request.text,
        &request.text,
        request.start_byte,
        request.end_byte,
        &request.quote,
    )
    .map_err(|_| Error::Invalid)?;
    Ok(())
}
pub(super) fn authorize(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    request: &Request,
) -> Result<()> {
    branches::document(cipher, db, catalog, request.document, request.branch)?;
    Ok(())
}
fn load(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    doc: &Document,
) -> Result<Option<(u64, State)>> {
    match cipher.slot::<State>(db, STATE_KIND, doc.branch.0) {
        Ok((generation, state)) => {
            if state.document != doc.id
                || state.node != doc.node
                || state.branch != doc.branch
                || state.working_branch == doc.branch
                || state.draft != doc.draft
                || state.actor != catalog.owner
                || state.device != catalog.device
                || state.count == 0
                || state.count > JS_MAX
                || generation.checked_add(1) != Some(state.count)
            {
                return Err(Error::Integrity);
            }
            Ok(Some((generation, state)))
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
    checkpoint: CheckpointId,
) -> Result<Record> {
    let record: Record = cipher.object(db, CHECKPOINT_KIND, checkpoint.0)?;
    validate(&record.request).map_err(|_| Error::Integrity)?;
    let state = &record.state;
    if state.document != doc.id
        || state.node != doc.node
        || state.branch != doc.branch
        || state.working_branch == doc.branch
        || state.checkpoint != checkpoint
        || state.ordinal == 0
        || state.ordinal > JS_MAX
        || (state.ordinal == 1) != record.previous.is_none()
        || record.previous == Some(checkpoint)
        || record.draft != doc.draft
        || record.manifest != doc.manifest
        || record.occurrence != doc.occurrence
        || record.actor != catalog.owner
        || record.device != catalog.device
        || record.request.document != doc.id
        || record.request.branch != doc.branch
    {
        return Err(Error::Integrity);
    }
    let base: Revision = cipher.object(db, REVISION, record.request.base.0)?;
    if base.node != doc.node {
        return Err(Error::Integrity);
    }
    let receipt: StoredReceipt = cipher.object(db, RECEIPT, record.operation.0)?;
    let command = match &receipt.receipt.outcome {
        Outcome::Checkpointed { state: expected } if expected == state => Command::Checkpoint {
            plan: record.request.clone(),
        },
        Outcome::WorkingCopied { state: copy }
            if copy.checkpoint == *state
                && copy.source
                    == state.source(
                        record.occurrence,
                        record.request.start_byte,
                        record.request.end_byte,
                    ) =>
        {
            Command::WorkingCopy {
                plan: record.request.clone(),
                generation: copy.generation.checked_sub(1).ok_or(Error::Integrity)?,
            }
        }
        _ => return Err(Error::Integrity),
    };
    let bytes = Zeroizing::new(serde_json::to_vec(&command).map_err(|_| Error::Format)?);
    let digest: [u8; 32] = Sha256::digest(&*bytes).into();
    if receipt.digest != digest || receipt.receipt.operation != record.operation {
        return Err(Error::Integrity);
    }
    Ok(record)
}
pub(super) fn apply(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    operation: OperationId,
    request: Request,
    checkpoint: &mut impl FnMut(&str) -> Result<()>,
) -> Result<Change> {
    let doc = branches::document(cipher, db, catalog, request.document, request.branch)?;
    let (_, head): (_, Head) = cipher.slot(db, HEAD, doc.branch.0)?;
    let (generation, draft): (_, Draft) = cipher.slot(db, DRAFT, doc.draft.0)?;
    check_draft(&doc, &head, &draft, catalog.owner, catalog.device)?;
    if generation != request.generation
        || draft.base != request.base
        || draft.sequence != request.sequence
    {
        return Err(Error::Conflict);
    }
    hypergraph_domain::working::capture(
        &request.text,
        &draft.text,
        request.start_byte,
        request.end_byte,
        &request.quote,
    )
    .map_err(|_| Error::Conflict)?;
    let prior = load(cipher, db, catalog, &doc)?;
    let count = prior.as_ref().map_or(1, |(_, s)| s.count + 1);
    if count > JS_MAX {
        return Err(Error::Limit);
    }
    let working_branch = if let Some((_, prior)) = &prior {
        let last = record(cipher, db, catalog, &doc, prior.head)?;
        if last.state.ordinal != prior.count || last.state.working_branch != prior.working_branch {
            return Err(Error::Integrity);
        }
        prior.working_branch
    } else {
        BranchId(new_id()?)
    };
    let state = Change {
        document: doc.id,
        node: doc.node,
        branch: doc.branch,
        working_branch,
        checkpoint: CheckpointId(new_id()?),
        ordinal: count,
    };
    cipher.insert(
        db,
        CHECKPOINT_KIND,
        state.checkpoint.0,
        &Record {
            state: state.clone(),
            draft: doc.draft,
            manifest: doc.manifest,
            occurrence: doc.occurrence,
            actor: catalog.owner,
            device: catalog.device,
            operation,
            previous: prior.as_ref().map(|(_, s)| s.head),
            request,
        },
    )?;
    checkpoint("objects")?;
    let next = State {
        document: doc.id,
        node: doc.node,
        branch: doc.branch,
        working_branch,
        draft: doc.draft,
        actor: catalog.owner,
        device: catalog.device,
        head: state.checkpoint,
        count,
    };
    if let Some((generation, _)) = prior {
        cipher.update(db, STATE_KIND, doc.branch.0, generation, &next)?;
    } else {
        cipher.new_slot(db, STATE_KIND, doc.branch.0, &next)?;
    }
    Ok(state)
}

#[allow(clippy::too_many_arguments)]
pub(super) fn promote(
    cipher: &Cipher<'_>,
    db: &Connection,
    doc: &Document,
    owner: PrincipalId,
    device: DeviceId,
    operation: OperationId,
    revision: RevisionId,
    snapshot: SnapshotId,
    draft: &Draft,
) -> Result<()> {
    let (_, catalog): (_, Catalog) = cipher.slot(db, CATALOG, ROOT)?;
    if catalog.owner != owner || catalog.device != device {
        return Err(Error::Integrity);
    }
    let Some((_, state)) = load(cipher, db, &catalog, doc)? else {
        return Ok(());
    };
    let checkpoint = record(cipher, db, &catalog, doc, state.head)?;
    if checkpoint.state.ordinal != state.count
        || checkpoint.state.working_branch != state.working_branch
    {
        return Err(Error::Integrity);
    }
    // A changed source remains private historical evidence; no anchor heuristic.
    if checkpoint.request.text != draft.text || checkpoint.request.base != draft.base {
        return Ok(());
    }
    match cipher.object::<Promotion>(db, PROMOTION_KIND, state.head.0) {
        Ok(_) => {
            read_promotion(cipher, db, doc, &checkpoint)?;
            return Ok(());
        }
        Err(Error::NotFound) => {}
        Err(error) => return Err(error),
    }
    cipher.insert(
        db,
        PROMOTION_KIND,
        state.head.0,
        &Promotion {
            checkpoint: state.head,
            document: doc.id,
            branch: doc.branch,
            working_branch: state.working_branch,
            revision,
            snapshot,
            operation,
        },
    )
}
fn read_promotion(
    cipher: &Cipher<'_>,
    db: &Connection,
    doc: &Document,
    checkpoint: &Record,
) -> Result<Option<Promotion>> {
    let promotion: Promotion =
        match cipher.object(db, PROMOTION_KIND, checkpoint.state.checkpoint.0) {
            Ok(value) => value,
            Err(Error::NotFound) => return Ok(None),
            Err(error) => return Err(error),
        };
    if promotion.checkpoint != checkpoint.state.checkpoint
        || promotion.document != doc.id
        || promotion.branch != doc.branch
        || promotion.working_branch != checkpoint.state.working_branch
        || snapshot_revision(cipher, db, doc, promotion.snapshot)? != promotion.revision
    {
        return Err(Error::Integrity);
    }
    let revision: Revision = cipher.object(db, REVISION, promotion.revision.0)?;
    let event: Event = cipher.object(db, EVENT, promotion.operation.0)?;
    if revision.node != doc.node
        || revision.operation != promotion.operation
        || revision.parent != Some(checkpoint.request.base)
        || revision.text != checkpoint.request.text
        || event.operation != promotion.operation
        || event.document != doc.id
        || event.revision != promotion.revision
        || event.snapshot != promotion.snapshot
        || event.parent != revision.parent
        || event.actor != checkpoint.actor
        || event.device != checkpoint.device
    {
        return Err(Error::Integrity);
    }
    let receipt: StoredReceipt = match cipher.object(db, RECEIPT, promotion.operation.0) {
        Ok(receipt) => receipt,
        Err(Error::NotFound) => {
            temporal_commit_record::promotion_receipt(
                cipher,
                db,
                doc,
                &promotion,
                &checkpoint.request,
            )?;
            return Ok(Some(promotion));
        }
        Err(error) => return Err(error),
    };
    if receipt.receipt.operation != promotion.operation {
        return Err(Error::Integrity);
    }
    let (document, target_revision, target_snapshot, command) = match &receipt.receipt.outcome {
        Outcome::Branch { state } if state.branch == doc.branch => match &state.outcome {
            branches::EditOutcome::Committed {
                document,
                generation,
                sequence,
                revision,
                snapshot,
            } => (
                *document,
                *revision,
                *snapshot,
                Command::Branch {
                    mutation: branches::Mutation::Commit {
                        document: *document,
                        branch: doc.branch,
                        generation: generation.checked_sub(1).ok_or(Error::Integrity)?,
                        base: checkpoint.request.base,
                        sequence: *sequence,
                    },
                },
            ),
            _ => return Err(Error::Integrity),
        },
        Outcome::Committed {
            document,
            generation,
            sequence,
            revision,
            snapshot,
        } => {
            let original: Document = cipher.object(db, DOCUMENT, doc.id.0)?;
            if original.branch != doc.branch {
                return Err(Error::Integrity);
            }
            (
                *document,
                *revision,
                *snapshot,
                Command::Commit {
                    document: *document,
                    generation: generation.checked_sub(1).ok_or(Error::Integrity)?,
                    base: checkpoint.request.base,
                    sequence: *sequence,
                },
            )
        }
        _ => return Err(Error::Integrity),
    };
    let bytes = Zeroizing::new(serde_json::to_vec(&command).map_err(|_| Error::Format)?);
    let digest: [u8; 32] = Sha256::digest(&*bytes).into();
    if document != doc.id
        || target_revision != promotion.revision
        || target_snapshot != promotion.snapshot
        || receipt.digest != digest
    {
        return Err(Error::Integrity);
    }
    Ok(Some(promotion))
}
pub(super) fn source_view(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    source: Source,
) -> Result<View> {
    let doc = branches::document(cipher, db, catalog, source.document, source.branch)?;
    let checkpoint = record(cipher, db, catalog, &doc, source.checkpoint)?;
    if source.node != doc.node
        || source.working_branch != checkpoint.state.working_branch
        || source.occurrence_path != [doc.occurrence]
        || source.start_byte >= source.end_byte
    {
        return Err(Error::Invalid);
    }
    validate_byte_range(&checkpoint.request.text, source.start_byte, source.end_byte)
        .map_err(|_| Error::Invalid)?;
    let promotion = read_promotion(cipher, db, &doc, &checkpoint)?;
    Ok(View {
        source,
        text: checkpoint.request.text,
        base: checkpoint.request.base,
        sequence: checkpoint.request.sequence,
        publication: "private_working_checkpoint",
        promotion,
    })
}
impl Workspace {
    pub fn working_source(&mut self, source: Source) -> Result<View> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        let view = source_view(&cipher, &tx, &catalog, source)?;
        tx.commit()?;
        Ok(view)
    }
}

#[cfg(test)]
pub(super) mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};

    pub(crate) fn request(state: &EditorState) -> Request {
        Request {
            document: state.document,
            branch: state.branch,
            generation: state.generation,
            base: state.base,
            sequence: state.acknowledged_sequence,
            text: state.text.clone(),
            start_byte: 0,
            end_byte: state.text.len(),
            quote: state.text.clone(),
        }
    }
    fn capture(ws: &mut Workspace, state: &EditorState, operation: u8) -> Source {
        match ws
            .execute(
                op(operation),
                Command::Checkpoint {
                    plan: request(state),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Checkpointed { state: change } => {
                change.source(state.occurrence, 0, state.text.len())
            }
            _ => panic!(),
        }
    }
    #[test]
    fn checkpoint_keeps_private_exact_source_after_newer_autosave_commit_and_restart() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let initial = ws.open_document(id).unwrap();
        let text = "A\r\n😀中\rA\r\n😀中";
        ws.execute(op(2), save(&initial, text)).unwrap();
        let state = ws.open_document(id).unwrap();
        let mut source = capture(&mut ws, &state, 3);
        source.start_byte = 3;
        source.end_byte = 10;
        let after = ws.open_document(id).unwrap();
        assert_eq!(after.generation, state.generation);
        assert_eq!(after.base, initial.base);
        assert_eq!(after.snapshot, initial.snapshot);
        let view = ws.working_source(source.clone()).unwrap();
        assert_eq!(view.text.as_bytes(), text.as_bytes());
        assert_eq!(&view.text[source.start_byte..source.end_byte], "😀中");
        assert_eq!(view.publication, "private_working_checkpoint");
        assert!(view.promotion.is_none());
        ws.execute(op(4), save(&state, "B\r\n😀中")).unwrap();
        let newer = ws.open_document(id).unwrap();
        ws.execute(op(5), commit(&newer)).unwrap();
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        let view = ws.working_source(source.clone()).unwrap();
        assert_eq!(view.text, text);
        assert!(view.promotion.is_none());
        let mut split = source.clone();
        split.start_byte = 4;
        assert!(matches!(ws.working_source(split), Err(Error::Invalid)));
        let mut wrong = source;
        wrong.working_branch = state.branch;
        assert!(matches!(ws.working_source(wrong), Err(Error::Invalid)));
    }
    #[test]
    fn exact_commit_promotes_once_and_preserves_the_unpublished_checkpoint() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let initial = ws.open_document(id).unwrap();
        ws.execute(op(2), save(&initial, "Private 😀\r\nsource"))
            .unwrap();
        let state = ws.open_document(id).unwrap();
        let source = capture(&mut ws, &state, 3);
        let result = ws.execute(op(4), commit(&state)).unwrap();
        let view = ws.working_source(source.clone()).unwrap();
        let promotion = view.promotion.unwrap();
        assert_eq!(promotion.checkpoint, source.checkpoint);
        assert_eq!(promotion.operation, op(4));
        assert_eq!(
            ws.reconstruct_snapshot(id, promotion.snapshot).unwrap(),
            state.text
        );
        assert_eq!(view.text, state.text);
        assert_eq!(view.base, initial.base);
        assert_eq!(view.publication, "private_working_checkpoint");
        assert_eq!(result, ws.execute(op(4), commit(&state)).unwrap());
        let current = ws.open_document(id).unwrap();
        ws.execute(op(5), commit(&current)).unwrap();
        assert_eq!(
            ws.working_source(source).unwrap().promotion.unwrap(),
            promotion
        );
    }
    #[test]
    fn content_branches_keep_distinct_working_identities_and_only_matching_child_promotes() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let original = ws.open_document(id).unwrap();
        let child = match ws
            .execute(op(2), branches::tests::creation(&original))
            .unwrap()
            .outcome
        {
            Outcome::Branch { state } => state.branch,
            _ => panic!(),
        };
        let parent_source = capture(&mut ws, &original, 3);
        let editor = ws.open_branch(id, child).unwrap();
        let first = capture(&mut ws, &editor, 4);
        assert_ne!(first.working_branch, parent_source.working_branch);
        ws.execute(
            op(5),
            Command::Branch {
                mutation: branches::Mutation::Save {
                    document: id,
                    branch: child,
                    generation: editor.generation,
                    base: editor.base,
                    previous_sequence: 0,
                    sequence: 1,
                    text: "Child working 😀\r\n".into(),
                },
            },
        )
        .unwrap();
        let editor = ws.open_branch(id, child).unwrap();
        let latest = capture(&mut ws, &editor, 6);
        assert_eq!(first.working_branch, latest.working_branch);
        ws.execute(
            op(7),
            Command::Branch {
                mutation: branches::Mutation::Commit {
                    document: id,
                    branch: child,
                    generation: editor.generation,
                    base: editor.base,
                    sequence: 1,
                },
            },
        )
        .unwrap();
        let promotion = ws.working_source(latest).unwrap().promotion.unwrap();
        assert_eq!(promotion.branch, child);
        assert!(ws.working_source(first).unwrap().promotion.is_none());
        assert!(
            ws.working_source(parent_source.clone())
                .unwrap()
                .promotion
                .is_none()
        );
        assert_eq!(ws.open_document(id).unwrap().snapshot, original.snapshot);
        let mut wrong = parent_source;
        wrong.branch = child;
        assert!(matches!(ws.working_source(wrong), Err(Error::Integrity)));
    }
    #[test]
    fn checkpoint_and_promotion_faults_are_atomic_and_unknown_acknowledgements_replay() {
        for phase in ["objects", "heads", "receipt", "committed"] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let id = create(&mut ws);
            let editor = ws.open_document(id).unwrap();
            let command = Command::Checkpoint {
                plan: request(&editor),
            };
            assert!(matches!(
                ws.execute_inner(op(2), command.clone(), |at| if at == phase {
                    Err(Error::Io)
                } else {
                    Ok(())
                }),
                Err(Error::Io)
            ));
            let objects: i64 = ws
                .db
                .query_row(
                    "SELECT count(*) FROM objects WHERE kind=?1",
                    params![CHECKPOINT_KIND],
                    |r| r.get(0),
                )
                .unwrap();
            assert_eq!(objects, i64::from(phase == "committed"));
            let first = ws.execute(op(2), command.clone()).unwrap();
            assert_eq!(first, ws.execute(op(2), command).unwrap());
            let source = match first.outcome {
                Outcome::Checkpointed { state } => {
                    state.source(editor.occurrence, 0, editor.text.len())
                }
                _ => panic!(),
            };
            assert!(matches!(
                ws.execute_inner(op(3), commit(&editor), |at| if at == phase {
                    Err(Error::Io)
                } else {
                    Ok(())
                }),
                Err(Error::Io)
            ));
            let view = ws.working_source(source.clone()).unwrap();
            assert_eq!(view.promotion.is_some(), phase == "committed");
            let result = ws.execute(op(3), commit(&editor)).unwrap();
            assert_eq!(result, ws.execute(op(3), commit(&editor)).unwrap());
            assert!(ws.working_source(source).unwrap().promotion.is_some());
        }
    }
    #[test]
    fn stale_scope_reuse_and_authenticated_text_damage_cannot_capture_or_retarget() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let editor = ws.open_document(id).unwrap();
        let source = capture(&mut ws, &editor, 2);
        let mut stale = request(&editor);
        stale.text = "Different".into();
        stale.quote = stale.text.clone();
        stale.end_byte = stale.text.len();
        assert!(matches!(
            ws.execute(
                op(3),
                Command::Checkpoint {
                    plan: stale.clone()
                }
            ),
            Err(Error::Conflict)
        ));
        assert!(matches!(
            ws.execute(op(2), Command::Checkpoint { plan: stale }),
            Err(Error::Conflict)
        ));
        let mut stale = request(&editor);
        stale.generation += 1;
        assert!(matches!(
            ws.execute(op(3), Command::Checkpoint { plan: stale }),
            Err(Error::Conflict)
        ));
        let mut stale = request(&editor);
        stale.base = RevisionId([9; 32]);
        assert!(matches!(
            ws.execute(op(3), Command::Checkpoint { plan: stale }),
            Err(Error::Conflict)
        ));
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let mut record: Record = cipher
            .object(&ws.db, CHECKPOINT_KIND, source.checkpoint.0)
            .unwrap();
        record.request.text = "Altered".into();
        record.request.quote = record.request.text.clone();
        record.request.end_byte = 7;
        let envelope = cipher
            .seal(CHECKPOINT_KIND, source.checkpoint.0, 0, &record)
            .unwrap();
        ws.db
            .execute(
                "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                params![envelope, CHECKPOINT_KIND, source.checkpoint.0.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.working_source(source.clone()),
            Err(Error::Integrity)
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
            ws.execute(
                op(2),
                Command::Checkpoint {
                    plan: request(&editor)
                }
            ),
            Err(Error::NotFound)
        ));
        assert!(matches!(ws.working_source(source), Err(Error::NotFound)));
    }
}
