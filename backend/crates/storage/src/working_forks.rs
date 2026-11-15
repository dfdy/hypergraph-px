// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Independent Fork from retained working evidence
//!
//! Create an independent document from an exact unpublished checkpoint selection
//! and retain the original working source alongside its initial committed output.
//! The source document remains uncommitted and later source edits do not
//! retarget it.
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
//! Used by: Workspace WorkingFork dispatch, provenance reads and
//! working-source acceptance tests.
//!
//! Specification:
//! - [Source planning and adapters][spec0]
//! - [Working-source and promotion policy][spec1]
//! - [Working navigation boundary][spec2]
//! - [Private reference record contract][spec3]
//!
//! Boundary: The adapter uses explicit retained working evidence and
//! current catalogue scope. This is not a generic multi-owner composition
//! loader or ordinary-autosave history policy.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/working_forks.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [spec1]: ../../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md
//! [spec2]: ../../../../docs/06-subsystems/interfaces/domain-navigation.md#working-source-boundary
//! [spec3]: ../../../../docs/07-implementation/data-structures/sqlite-records.md

use super::*;
/// Existing immutable working-Fork derivation allocation, separate from committed Fork kind11.
pub const KIND: i32 = 27;
/// Captured title, exact working checkpoint/range and original quoted bytes.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    pub title: String,
    pub source: working::Source,
    pub quote: String,
}

/// Exact independently created output identities returned in the original receipt.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Change {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub transformation: TransformationId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
}

/// Record-family discriminator; working evidence is not relabelled a committed input.
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Kind {
    WorkingFork,
}

/// Immutable source-checkpoint to initial-output relationship, retaining both actual source kinds.
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Derivation {
    pub kind: Kind,
    #[serde(with = "encoding::identity")]
    pub transformation: TransformationId,
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,
    #[serde(with = "encoding::identity")]
    pub actor: PrincipalId,
    #[serde(with = "encoding::identity")]
    pub device: DeviceId,
    pub input: working::Source,
    pub output: clipboard::Source,
}

/// Bound request shape/title/quote before current-authority source resolution.
pub(super) fn validate(plan: &Request) -> Result<()> {
    if plan.title.trim().is_empty()
        || plan.title.len() > 512
        || plan.quote.is_empty()
        || plan.source.start_byte >= plan.source.end_byte
        || plan.source.end_byte > MAX_TEXT_BYTES
        || plan.source.occurrence_path.len() != 1
    {
        return Err(Error::Invalid);
    }
    if plan.quote.len() > MAX_TEXT_BYTES {
        return Err(Error::Limit);
    }
    Ok(())
}

/// Create output/history and its exact working-input derivation within the caller transaction.
pub(super) fn apply(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    operation: OperationId,
    plan: Request,
    checkpoint: &mut impl FnMut(&str) -> Result<()>,
) -> Result<Change> {
    let view = working::source_view(cipher, db, catalog, plan.source.clone())?;
    let text = &view.text[plan.source.start_byte..plan.source.end_byte];
    if text != plan.quote {
        return Err(Error::Conflict);
    }

    let output = create_document(
        cipher,
        db,
        operation,
        catalog.owner,
        catalog.device,
        NodeId(new_id()?),
        plan.title,
        text.to_owned(),
        checkpoint,
    )?;

    let transformation = TransformationId(new_id()?);
    cipher.insert(
        db,
        KIND,
        output.document.id.0,
        &Derivation {
            kind: Kind::WorkingFork,
            transformation,
            operation,
            actor: catalog.owner,
            device: catalog.device,
            input: plan.source,
            output: clipboard::Source {
                document: output.document.id,
                node: output.document.node,
                snapshot: output.snapshot,
                revision: output.revision,
                occurrence_path: vec![output.document.occurrence],
                start_byte: 0,
                end_byte: text.len(),
            },
        },
    )?;
    checkpoint("derivation")?;

    Ok(Change {
        document: output.document.id,
        transformation,
        revision: output.revision,
        snapshot: output.snapshot,
    })
}

impl Workspace {
    /// Reconstruct and verify retained working input, initial output and original receipt.
    /// Later heads do not replace the pinned sources or revise this derivation.
    pub fn working_derivation(&mut self, document: DocumentId) -> Result<Derivation> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        if !catalog.documents.contains(&document) {
            return Err(Error::NotFound);
        }
        let doc: Document = cipher.object(&tx, DOCUMENT, document.0)?;
        let event: Derivation = cipher.object(&tx, KIND, document.0)?;
        if doc.id != document
            || event.actor != catalog.owner
            || event.device != catalog.device
            || event.output.document != document
            || event.output.node != doc.node
            || event.input.node == doc.node
            || event.output.start_byte != 0
        {
            return Err(Error::Integrity);
        }

        let input = working::source_view(&cipher, &tx, &catalog, event.input.clone())?;
        let (_, revision) = clipboard::resolve_source(&cipher, &tx, &catalog, &event.output)?;
        let quote = &input.text[event.input.start_byte..event.input.end_byte];
        if revision.parent.is_some()
            || revision.operation != event.operation
            || revision.text != quote
            || event.output.end_byte != quote.len()
        {
            return Err(Error::Integrity);
        }
        let publication: Event = cipher.object(&tx, EVENT, event.operation.0)?;
        if publication.document != document
            || publication.revision != event.output.revision
            || publication.snapshot != event.output.snapshot
            || publication.parent.is_some()
            || publication.operation != event.operation
            || publication.actor != event.actor
            || publication.device != event.device
        {
            return Err(Error::Integrity);
        }

        let receipt: StoredReceipt = cipher.object(&tx, RECEIPT, event.operation.0)?;
        let expected = Outcome::WorkingForked {
            state: Change {
                document,
                transformation: event.transformation,
                revision: event.output.revision,
                snapshot: event.output.snapshot,
            },
        };
        let command = Command::WorkingFork {
            plan: Request {
                title: doc.title,
                source: event.input.clone(),
                quote: quote.into(),
            },
        };
        // Rebuild the original intent; serializer failure is not repaired by guessing bytes.
        let bytes = Zeroizing::new(serde_json::to_vec(&command).map_err(|_| Error::Format)?);
        let digest: [u8; 32] = Sha256::digest(&*bytes).into();
        if receipt.digest != digest
            || receipt.receipt.operation != event.operation
            || receipt.receipt.outcome != expected
        {
            return Err(Error::Integrity);
        }

        tx.commit()?;

        Ok(event)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};
    /// Publish an explicit synthetic checkpoint and capture its exact working-source reference.
    fn plan(ws: &mut Workspace, editor: &EditorState) -> Request {
        let state = match ws
            .execute(
                op(2),
                Command::Checkpoint {
                    plan: working::tests::request(editor),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Checkpointed { state } => state,
            _ => panic!(),
        };
        Request {
            title: "Working source fork".into(),
            source: state.source(editor.occurrence, 0, editor.text.len()),
            quote: editor.text.clone(),
        }
    }

    /// Guard independent output/history and pinned unpublished input across changes and restart.
    #[test]
    fn unpublished_fork_keeps_independent_identity_and_exact_immutable_derivation_after_restart() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let editor = ws.open_document(id).unwrap();
        ws.execute(op(10), save(&editor, "Private 😀\r\n中\r"))
            .unwrap();
        let editor = ws.open_document(id).unwrap();
        let plan = plan(&mut ws, &editor);
        let receipt = ws
            .execute(op(3), Command::WorkingFork { plan: plan.clone() })
            .unwrap();
        assert_eq!(
            receipt,
            ws.execute(op(3), Command::WorkingFork { plan: plan.clone() })
                .unwrap()
        );
        let state = match receipt.outcome {
            Outcome::WorkingForked { state } => state,
            _ => panic!(),
        };
        let output = ws.open_document(state.document).unwrap();
        assert_ne!(output.node, editor.node);
        assert_eq!(output.text, editor.text);
        assert_eq!(ws.open_document(id).unwrap().snapshot, editor.snapshot);
        assert!(
            ws.history_page(state.document, None, 1).unwrap().entries[0]
                .parent
                .is_none()
        );
        ws.execute(op(4), save(&editor, "New source")).unwrap();
        let newer = ws.open_document(id).unwrap();
        ws.execute(op(5), commit(&newer)).unwrap();
        ws.execute(op(6), save(&output, "New fork draft")).unwrap();
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        let event = ws.working_derivation(state.document).unwrap();
        assert_eq!(event.input, plan.source);
        assert_eq!(event.output.snapshot, state.snapshot);
        assert_eq!(
            ws.reconstruct_snapshot(state.document, state.snapshot)
                .unwrap(),
            plan.quote
        );
    }

    /// Guard atomic publication/replay, changed-intent rejection and wrong working-source scope.
    #[test]
    fn publication_faults_replay_one_result_without_committing_source_or_guessing_scope() {
        for phase in ["objects", "derivation", "heads", "receipt", "committed"] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let id = create(&mut ws);
            let editor = ws.open_document(id).unwrap();
            let plan = plan(&mut ws, &editor);
            let command = Command::WorkingFork { plan: plan.clone() };
            assert!(matches!(
                // Inject failure only at this selected write/commit checkpoint.
                ws.execute_inner(op(3), command.clone(), |at| if at == phase {
                    Err(Error::Io)
                } else {
                    Ok(())
                }),
                Err(Error::Io)
            ));
            assert_eq!(
                ws.list_documents().unwrap().len(),
                if phase == "committed" { 2 } else { 1 }
            );
            let receipt = ws.execute(op(3), command.clone()).unwrap();
            assert_eq!(receipt, ws.execute(op(3), command).unwrap());
            let mut changed = plan.clone();
            changed.quote = "Different".into();
            assert!(matches!(
                ws.execute(op(3), Command::WorkingFork { plan: changed }),
                Err(Error::Conflict)
            ));
            let mut wrong = plan;
            wrong.source.node = NodeId([9; 32]);
            assert!(matches!(
                ws.execute(op(4), Command::WorkingFork { plan: wrong }),
                Err(Error::Invalid)
            ));
            assert_eq!(ws.open_document(id).unwrap().snapshot, editor.snapshot);
        }
    }
}
