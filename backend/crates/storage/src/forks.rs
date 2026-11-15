// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Independent Fork creation and provenance
//!
//! Create a new document and logical node from an exact committed source passage,
//! then retain the pinned input and initial output as an immutable derivation.
//! Later edits develop the new node's own history without rewriting that record.
//!
//! Source: [Latest source on GitHub][source]
//!
//! Agent provenance: Agent creation unverified; original creator not recorded.
//! Created: Unknown (not recorded).
//! Creation harness: Unknown (not recorded).
//! Creation model: Unknown (not recorded).
//!
//! Latest editing agent: Codex (OpenAI coding agent).
//! Latest editing harness: Codex; version/build: unknown (not exposed).
//! Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
//! Last edited: 2026-11-15 (UTC).
//!
//! Used by: Workspace command dispatch for Fork creation; runtime derivation
//! reads; document/Fork graph and provenance-overlay projections. Source-authority
//! validation also consumes the derivation's record type and address convention.
//!
//! Specification:
//! - [Revision and transformation definitions][provenance-model]
//! - [Adapter and pure-domain responsibilities][adapter-model]
//! - [Current independent Fork contract][fork-contract]
//! - [Immutable derivation record and compatibility][record-contract]
//!
//! Boundary: This adapter uses the current owner/device-scoped catalog. Its
//! helpers do not implement the future general multi-user permission design.
//! Creation runs inside the caller's writer transaction; source capture does not
//! mean Commit, and cross-identity derivation is not a same-node revision parent.
//! Read validation checks the original pinned records, not current head equality,
//! and establishes neither original authorship nor the truth of copied claims.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/forks.rs
//! [provenance-model]: ../../../../docs/05-domain/diagrams/provenance-working.c4
//! [adapter-model]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [fork-contract]: ../../../../docs/05-domain/provenance-model.md#current-independent-fork-projection
//! [record-contract]: ../../../../docs/07-implementation/data-structures/sqlite-records.md#optional-immutable-fork-derivation-2026-10-25

use super::*;

/// Existing encrypted-object kind for an immutable independent-Fork derivation.
/// Keep this allocation distinct from the payload wrapper version and SQL schema.
pub const KIND: i32 = 11;

/// Frozen Fork intent, validated before dispatch and rechecked during source capture.
/// Serialization stays in this adapter, outside the pure domain planner.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    /// Non-whitespace output title, limited to 512 UTF8 bytes; stored without trimming.
    pub title: String,

    /// Exact committed document/node/snapshot/revision, occurrence and byte range.
    pub source: clipboard::Source,

    /// Optional editor guard: require its generation/sequence, committed base and
    /// unchanged text to match. Absence selects the explicit historical source.
    pub expected_draft: Option<clipboard::DraftContext>,

    /// Exact selected source text, compared byte-for-byte without normalization.
    pub quote: String,
}

/// Serialized transformation discriminator for this existing record family.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Kind {
    /// Independent output identity with pinned source provenance.
    Fork,
}

/// Immutable account of the original Fork input/output, not mutable head state.
/// The reader checks one input and one initial output against retained publication.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Derivation {
    /// Identity of this cross-node transformation, distinct from revision ancestry.
    #[serde(with = "encoding::identity")]
    pub transformation: TransformationId,

    /// Original operation whose publication and receipt own the Fork outcome.
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,

    /// Recorded publishing actor; does not assert original source authorship.
    #[serde(with = "encoding::identity")]
    pub actor: PrincipalId,

    /// Recorded device, checked against the initial output publication.
    #[serde(with = "encoding::identity")]
    pub device: DeviceId,

    /// Transformation meaning, independent of the encrypted-object kind number.
    pub kind: Kind,

    /// One exact retained source passage, including occurrence and UTF8 range.
    pub inputs: Vec<clipboard::Source>,

    /// One complete initial output revision/snapshot; later edits do not retarget it.
    pub outputs: Vec<clipboard::Source>,
}

/// Derive the lookup address from the output node using the existing v1 domain tag.
/// This is a stable record address, not encryption, authority or a content identity.
pub(super) fn address(node: NodeId) -> [u8; 32] {
    let mut hash = Sha256::new();
    hash.update(b"hpx/fork-derivation/by-output-node/v1\0");
    hash.update(node.0);
    hash.finalize().into()
}

/// Reject malformed title/source/quote intent before entering feature dispatch.
/// This checks shape and limits; authenticated source resolution occurs in apply.
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

/// Create the independent output and derivation inside the caller's transaction.
/// The dispatcher owns operation replay, transaction publication and receipt handling.
/// A checkpoint callback may fail for testing/recovery; this helper never commits.
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

    // Resolve and authenticate the retained source before handing exact bytes to
    // the pure planner; the planner cannot verify storage or grant authority.
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

    // Pin the initial output, not its future head. create_document establishes
    // independent history; the derivation records the cross-identity relationship.
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
    /// Read and validate the original Fork provenance in one consistent transaction.
    /// Checks the current owner/device catalog and retained initial publication,
    /// even when either document has since advanced. Missing provenance remains
    /// NotFound; malformed relationships fail rather than guessing an origin.
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

/// Validate a pinned derivation without following either document's current head.
/// The caller owns the consistent read transaction and authenticated current catalog.
/// Resolve exact input/output sources before slicing; compare the initial output's
/// publication, ancestry and bytes to the retained event. Expected source-validation
/// failures become Integrity because these references were already persisted.
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

    // Resolve one persisted participant; broken stored bindings are integrity errors.
    // Its owner, occurrence, snapshot, revision and byte range must all agree.
    let checked = |source: &clipboard::Source| {
        clipboard::resolve_source(cipher, db, catalog, source)
            .map(|(_, revision)| revision) // Keep only the validated revision.
            // Reclassify invalid persisted evidence; preserve other operational errors.
            .map_err(|error| match error {
                Error::Invalid | Error::Conflict | Error::Limit => Error::Integrity,
                other => other,
            })
    };

    let input = checked(&event.inputs[0])?;
    let output = checked(&event.outputs[0])?;

    // Check the original publication, not a later edit. Independent Fork starts
    // a new same-node history with no parent, while retaining its separate input.
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
    // Synthetic workspaces only: these cases cover exact provenance, restart,
    // replay identity, transactional faults and rejection of corrupted bindings.
    use super::*;
    use crate::tests::{PASS, Temp, commit, op, save};

    /// Capture the editor guard and whole retained source explicitly so tests can
    /// vary scope without silently substituting a newer document head.
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

    /// Create an isolated encrypted workspace with a committed mixed-Unicode
    /// source fixture for exact provenance and recovery checks.
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

    /// Extract the document from a successful Fork receipt; fail the test if
    /// another operation outcome was returned.
    fn output(receipt: &Receipt) -> DocumentId {
        match receipt.outcome {
            Outcome::Forked { document, .. } => document,
            _ => panic!(),
        }
    }

    /// Verify independent identity/history and exact pinned derivation survive
    /// subsequent edits and a workspace restart.
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

        // Independence is a history property, not just different document labels.
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

        // Subsequent Commit changes current text but must leave this original
        // input/output record and both historical snapshots reconstructible.
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

    /// Verify original-operation replay is idempotent while separate operations
    /// with equal text still create distinct nodes.
    #[test]
    fn identical_retry_is_one_fork_but_distinct_operations_never_collapse_equal_text() {
        let (_temp, mut ws, source) = setup();
        let command = Command::Fork {
            plan: request(&source),
        };

        let first = ws.execute(op(2), command.clone()).unwrap();
        assert_eq!(ws.execute(op(2), command.clone()).unwrap(), first);

        // Equal bodies with a different operation are independent Fork requests;
        // only retrying the original operation may return its existing result.
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

    /// Verify injected faults roll back publication or reconcile the one
    /// already committed result.
    #[test]
    fn fork_transaction_faults_publish_nothing_or_replay_the_single_committed_result() {
        // Pre-commit faults roll back everything. A fault after commit instead
        // leaves one durable result that the original operation can reconcile.
        for phase in ["objects", "derivation", "heads", "receipt", "committed"] {
            let (temp, mut ws, source) = setup();
            let command = Command::Fork {
                plan: request(&source),
            };

            assert!(matches!(
                // Fail only the selected checkpoint to exercise this fault boundary.
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

    /// Verify editor guards reject stale/uncommitted inputs while an explicit
    /// historical request remains pinned to its retained source.
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
        // Explicit historical intent may read the old retained version; it does
        // not pretend a stale editor is current or follow the changed head.
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

    /// Verify source/publication binding corruption is rejected even when the
    /// modified record has a valid encrypted envelope.
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
        // Re-seal altered semantic content with the valid test key: this isolates
        // publication/binding checks from AEAD corruption detection.
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
