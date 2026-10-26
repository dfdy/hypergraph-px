// SPDX-License-Identifier: AGPL-3.0-only
//! Independent text forks with explicit pinned derivation, in the writer transaction.
use super::*;
pub const KIND: i32 = 11;
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    pub title: String,
    pub source: clipboard::Source,
    pub expected_draft: Option<clipboard::DraftContext>,
    pub quote: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Kind {
    Fork,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Derivation {
    #[serde(with = "encoding::identity")]
    pub transformation: TransformationId,
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,
    #[serde(with = "encoding::identity")]
    pub actor: PrincipalId,
    #[serde(with = "encoding::identity")]
    pub device: DeviceId,
    pub kind: Kind,
    pub inputs: Vec<clipboard::Source>,
    pub outputs: Vec<clipboard::Source>,
}
pub(super) fn address(node: NodeId) -> [u8; 32] {
    let mut hash = Sha256::new();
    hash.update(b"hpx/fork-derivation/by-output-node/v1\0");
    hash.update(node.0);
    hash.finalize().into()
}
pub(super) fn validate(request: &Request) -> Result<()> {
    if request.title.trim().is_empty() || request.title.len() > 512 {
        return Err(Error::Invalid);
    }
    clipboard::validate_capture(
        &request.source,
        request.expected_draft.as_ref(),
        &request.quote,
    )
}
pub(super) fn apply(
    cipher: &Cipher<'_>,
    db: &Connection,
    operation: OperationId,
    owner: PrincipalId,
    device: DeviceId,
    request: Request,
    checkpoint: &mut impl FnMut(&str) -> Result<()>,
) -> Result<Outcome> {
    let (_, catalog): (_, Catalog) = cipher.slot(db, CATALOG, ROOT)?;
    if catalog.owner != owner || catalog.device != device {
        return Err(Error::Integrity);
    }
    let (source_doc, revision) = clipboard::capture_source(
        cipher,
        db,
        &catalog,
        owner,
        device,
        &request.source,
        request.expected_draft.as_ref(),
        &request.quote,
    )?;
    let anchor = Anchor {
        revision: request.source.revision,
        occurrence_path: request.source.occurrence_path.clone(),
        start_byte: request.source.start_byte,
        end_byte: request.source.end_byte,
    };
    let plan = hypergraph_domain::fork::plan(
        source_doc.node,
        request.source.revision,
        &[source_doc.occurrence],
        &revision.text,
        &anchor,
        NodeId(new_id()?),
    )
    .map_err(|_| Error::Integrity)?;
    let output = create_document(
        cipher,
        db,
        operation,
        owner,
        device,
        plan.output_node,
        request.title,
        plan.text.to_owned(),
        checkpoint,
    )?;
    let transformation = TransformationId(new_id()?);
    let derivation = Derivation {
        transformation,
        operation,
        actor: owner,
        device,
        kind: Kind::Fork,
        inputs: vec![request.source],
        outputs: vec![clipboard::Source {
            document: output.document.id,
            node: output.document.node,
            snapshot: output.snapshot,
            revision: output.revision,
            occurrence_path: vec![output.document.occurrence],
            start_byte: 0,
            end_byte: plan.text.len(),
        }],
    };
    cipher.insert(db, KIND, address(output.document.node), &derivation)?;
    checkpoint("derivation")?;
    Ok(Outcome::Forked {
        document: output.document.id,
        transformation,
        revision: output.revision,
        snapshot: output.snapshot,
    })
}
impl Workspace {
    pub fn document_derivation(&mut self, document: DocumentId) -> Result<Derivation> {
        let tx = self.db.transaction()?;
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        let event = read_derivation(&cipher, &tx, &catalog, document)?;
        tx.commit()?;
        Ok(event)
    }
}

/// Caller owns the consistent read transaction and authenticated current catalog.
pub(super) fn read_derivation(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    document: DocumentId,
) -> Result<Derivation> {
    if !catalog.documents.contains(&document) {
        return Err(Error::NotFound);
    }
    let doc: Document = cipher.object(db, DOCUMENT, document.0)?;
    if doc.id != document {
        return Err(Error::Integrity);
    }
    let event: Derivation = cipher.object(db, KIND, address(doc.node))?;
    if event.inputs.len() != 1
        || event.outputs.len() != 1
        || event.outputs[0].document != document
        || event.outputs[0].node != doc.node
        || event.inputs[0].node == doc.node
        || event.outputs[0].start_byte != 0
    {
        return Err(Error::Integrity);
    }
    let checked = |source: &clipboard::Source| {
        clipboard::resolve_source(cipher, db, catalog, source)
            .map(|(_, revision)| revision)
            .map_err(|error| match error {
                Error::Invalid | Error::Conflict | Error::Limit => Error::Integrity,
                other => other,
            })
    };
    let input = checked(&event.inputs[0])?;
    let output = checked(&event.outputs[0])?;
    let publication: Event = cipher.object(db, EVENT, output.operation.0)?;
    if publication.operation != event.operation
        || publication.actor != event.actor
        || publication.device != event.device
        || publication.document != document
        || publication.parent.is_some()
        || publication.revision != event.outputs[0].revision
        || publication.snapshot != event.outputs[0].snapshot
    {
        return Err(Error::Integrity);
    }
    if input.node != event.inputs[0].node
        || output.node != doc.node
        || output.parent.is_some()
        || output.operation != event.operation
        || output.text.len() != event.outputs[0].end_byte
        || input.text[event.inputs[0].start_byte..event.inputs[0].end_byte] != output.text
    {
        return Err(Error::Integrity);
    }
    Ok(event)
}

#[cfg(test)]
pub(super) mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, op, save};
    pub(crate) fn request(editor: &EditorState) -> Request {
        Request {
            title: "Independent fork".into(),
            source: clipboard::Source {
                document: editor.document,
                node: editor.node,
                snapshot: editor.snapshot,
                revision: editor.base,
                occurrence_path: vec![editor.occurrence],
                start_byte: 0,
                end_byte: editor.text.len(),
            },
            expected_draft: Some(clipboard::DraftContext {
                generation: editor.generation,
                sequence: editor.acknowledged_sequence,
            }),
            quote: editor.text.clone(),
        }
    }
    fn setup() -> (Temp, Workspace, EditorState) {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = match ws
            .execute(
                op(1),
                Command::Create {
                    title: "Source".into(),
                    text: "Prefix😀\r\nExact e\u{301}中\rtail\n".into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let editor = ws.open_document(doc).unwrap();
        (temp, ws, editor)
    }
    fn output(receipt: &Receipt) -> DocumentId {
        match receipt.outcome {
            Outcome::Forked { document, .. } => document,
            _ => panic!(),
        }
    }
    #[test]
    fn independent_fragment_identity_history_and_derivation_reconstruct_exactly_after_restart() {
        let (temp, mut ws, source) = setup();
        let mut plan = request(&source);
        let start = "Prefix".len();
        plan.source.start_byte = start;
        plan.quote = source.text[start..].into();
        let receipt = ws
            .execute(op(2), Command::Fork { plan: plan.clone() })
            .unwrap();
        let fork = output(&receipt);
        let editor = ws.open_document(fork).unwrap();
        assert_ne!(editor.node, source.node);
        assert_ne!(fork, source.document);
        assert_eq!(editor.text, plan.quote);
        let initial: Revision = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        }
        .object(&ws.db, REVISION, editor.base.0)
        .unwrap();
        assert!(initial.parent.is_none());
        assert_eq!(
            ws.open_document(source.document).unwrap().generation,
            source.generation
        );
        let event = ws.document_derivation(fork).unwrap();
        assert_eq!(event.inputs[0], plan.source);
        assert_eq!(event.outputs[0].revision, editor.base);
        assert_eq!(event.outputs[0].node, editor.node);
        ws.execute(op(3), save(&editor, "Independent later edit"))
            .unwrap();
        let edited = ws.open_document(fork).unwrap();
        ws.execute(op(4), commit(&edited)).unwrap();
        assert_eq!(ws.document_derivation(fork).unwrap(), event);
        assert_eq!(
            ws.reconstruct_snapshot(source.document, source.snapshot)
                .unwrap(),
            source.text
        );
        assert_eq!(
            ws.reconstruct_snapshot(fork, editor.snapshot).unwrap(),
            plan.quote
        );
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        assert_eq!(ws.document_derivation(fork).unwrap(), event);
        assert_eq!(
            ws.open_document(fork).unwrap().text,
            "Independent later edit"
        );
    }
    #[test]
    fn identical_retry_is_one_fork_but_distinct_operations_never_collapse_equal_text() {
        let (_temp, mut ws, source) = setup();
        let command = Command::Fork {
            plan: request(&source),
        };
        let first = ws.execute(op(2), command.clone()).unwrap();
        assert_eq!(ws.execute(op(2), command.clone()).unwrap(), first);
        let second = ws.execute(op(3), command).unwrap();
        assert_ne!(output(&first), output(&second));
        assert_ne!(
            ws.open_document(output(&first)).unwrap().node,
            ws.open_document(output(&second)).unwrap().node
        );
        let mut changed = request(&source);
        changed.title = "Different intent".into();
        assert!(matches!(
            ws.execute(op(2), Command::Fork { plan: changed }),
            Err(Error::Conflict)
        ));
        assert_eq!(ws.list_documents().unwrap().len(), 3);
    }
    #[test]
    fn fork_transaction_faults_publish_nothing_or_replay_the_single_committed_result() {
        for phase in ["objects", "derivation", "heads", "receipt", "committed"] {
            let (temp, mut ws, source) = setup();
            let command = Command::Fork {
                plan: request(&source),
            };
            assert!(matches!(
                ws.execute_inner(op(2), command.clone(), |point| if point == phase {
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
            drop(ws);
            let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
            let receipt = ws.execute(op(2), command).unwrap();
            assert_eq!(ws.list_documents().unwrap().len(), 2);
            assert_eq!(
                ws.document_derivation(output(&receipt)).unwrap().inputs[0].snapshot,
                source.snapshot
            );
        }
    }
    #[test]
    fn stale_or_uncommitted_editor_inputs_do_not_publish_and_historical_sources_never_follow_head()
    {
        let (_temp, mut ws, source) = setup();
        ws.execute(op(2), save(&source, "Changed source")).unwrap();
        let draft = ws.open_document(source.document).unwrap();
        assert!(matches!(
            ws.execute(
                op(3),
                Command::Fork {
                    plan: request(&draft)
                }
            ),
            Err(Error::Conflict)
        ));
        assert!(matches!(
            ws.execute(
                op(4),
                Command::Fork {
                    plan: request(&source)
                }
            ),
            Err(Error::Conflict)
        ));
        assert_eq!(ws.list_documents().unwrap().len(), 1);
        ws.execute(op(5), commit(&draft)).unwrap();
        let mut historical = request(&source);
        historical.expected_draft = None;
        let receipt = ws
            .execute(op(6), Command::Fork { plan: historical })
            .unwrap();
        assert_eq!(
            ws.open_document(output(&receipt)).unwrap().text,
            source.text
        );
        assert_eq!(
            ws.open_document(source.document).unwrap().text,
            "Changed source"
        );
    }
    #[test]
    fn wrong_scope_and_corrupted_derivation_never_guess_an_origin() {
        let (_temp, mut ws, source) = setup();
        let mut bad = request(&source);
        bad.source.revision = RevisionId([9; 32]);
        assert!(ws.execute(op(2), Command::Fork { plan: bad }).is_err());
        assert_eq!(ws.list_documents().unwrap().len(), 1);
        let receipt = ws
            .execute(
                op(3),
                Command::Fork {
                    plan: request(&source),
                },
            )
            .unwrap();
        let fork = output(&receipt);
        let output_node = ws.open_document(fork).unwrap().node;
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let mut event: Derivation = cipher.object(&ws.db, KIND, address(output_node)).unwrap();
        let original_actor = event.actor;
        event.actor = PrincipalId([99; 32]);
        let bytes = cipher.seal(KIND, address(output_node), 0, &event).unwrap();
        ws.db
            .execute(
                "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                params![bytes, KIND, address(output_node).as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.document_derivation(fork),
            Err(Error::Integrity)
        ));
        event.actor = original_actor;
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        event.outputs[0].revision = source.base;
        let bytes = cipher.seal(KIND, address(output_node), 0, &event).unwrap();
        ws.db
            .execute(
                "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                params![bytes, KIND, address(output_node).as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.document_derivation(fork),
            Err(Error::Integrity)
        ));
        assert!(matches!(
            ws.document_derivation(source.document),
            Err(Error::NotFound)
        ));
    }
}
