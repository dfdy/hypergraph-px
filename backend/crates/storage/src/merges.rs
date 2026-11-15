// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Atomic independently reviewed synthesis
//!
//! Validate ordered pinned source fragments and publish a separately reviewed
//! output with its immutable derivation in the existing writer transaction.
//! The output can differ from all inputs; source-copy authorship remains unknown.
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
//! Used by: Workspace Merge dispatch, derivation and graph/overlay readers,
//! synthesis workflow tests.
//!
//! Specification:
//! - [Synthesis planning/adapters][spec0]
//! - [Cross-identity provenance meanings][spec1]
//! - [Reviewed synthesis record contract][spec2]
//! - [Navigation and source interfaces][spec3]
//!
//! Boundary: Cross-identity synthesis is not same-node parent Merge or an
//! automatic text diff. Current owner/device scope, exact records and
//! caller-owned transaction/receipt rules remain required.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/merges.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [spec1]: ../../../../docs/05-domain/diagrams/provenance-working.c4
//! [spec2]: ../../../../docs/07-implementation/data-structures/sqlite-records.md#optional-reviewed-synthesis-derivation-kind-17-record-version-1
//! [spec3]: ../../../../docs/06-subsystems/interfaces/domain-navigation.md

use super::*;
/// Existing optional reviewed-synthesis object kind; no SQL/envelope version change.
pub const KIND: i32 = 17;
/// One exact committed input and optional guard against a changed editor context.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Input {
    pub source: clipboard::Source,
    pub expected_draft: Option<clipboard::DraftContext>,
    pub quote: String,
}

/// Frozen reviewed output plus explicitly ordered source evidence; no copy map is inferred.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    pub title: String,
    pub text: String,
    pub inputs: Vec<Input>,
}

/// Explicit meaning of this immutable cross-identity derivation family.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Kind {
    ReviewedSynthesis,
}

/// Output publication evidence does not identify original authors of copied source.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SourceAuthorship {
    Unknown,
}

/// Pinned ordered input fragments and the independent initial output publication.
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
    pub source_authorship: SourceAuthorship,
    pub inputs: Vec<clipboard::Source>,
    pub outputs: Vec<clipboard::Source>,
}

/// Domain-separate the stable derivation address from the output logical node identity.
pub(super) fn address(node: NodeId) -> [u8; 32] {
    let mut hash = Sha256::new();
    hash.update(b"hpx/merge-derivation/by-output-node/v1\0");
    hash.update(node.0);
    hash.finalize().into()
}

/// Bound output/title/input shape and aggregate selected quotes before source acquisition.
pub(super) fn validate(request: &Request) -> Result<()> {
    if request.title.trim().is_empty() || request.title.len() > 512 || request.text.is_empty() {
        return Err(Error::Invalid);
    }
    if !(2..=hypergraph_domain::merge::MAX_INPUTS).contains(&request.inputs.len()) {
        return Err(Error::Invalid);
    }
    if request.text.len() > MAX_TEXT_BYTES {
        return Err(Error::Limit);
    }
    let mut total = 0usize;
    for input in &request.inputs {
        clipboard::validate_capture(&input.source, input.expected_draft.as_ref(), &input.quote)?;
        total = total.checked_add(input.quote.len()).ok_or(Error::Limit)?;
        if total > MAX_TEXT_BYTES {
            return Err(Error::Limit);
        }
    }
    Ok(())
}

/// Authenticate exact inputs, invoke pure validation and publish one independent synthesis.
/// The caller owns commit/replay/receipt handling and all writes share its transaction.
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
    let mut resolved = Vec::new();
    let mut anchors = Vec::new();
    for input in &request.inputs {
        resolved.push(clipboard::capture_source(
            cipher,
            db,
            &catalog,
            owner,
            device,
            &input.source,
            input.expected_draft.as_ref(),
            &input.quote,
        )?);
        anchors.push(Anchor {
            revision: input.source.revision,
            occurrence_path: input.source.occurrence_path.clone(),
            start_byte: input.source.start_byte,
            end_byte: input.source.end_byte,
        });
    }

    let output_node = NodeId(new_id()?);
    let inputs: Vec<_> = resolved
        .iter()
        .zip(&anchors)
        .map(
            // Convert each resolved retained source and anchor into pure planner input.
            |((doc, revision), anchor)| hypergraph_domain::merge::Input {
                node: doc.node,
                revision: anchor.revision,
                path: std::slice::from_ref(&doc.occurrence),
                text: &revision.text,
                anchor,
            },
        )
        .collect();
    hypergraph_domain::merge::validate(&inputs, output_node, &request.text)
        // Resolved stored bindings failing pure validation signal integrity failure.
        .map_err(|_| Error::Integrity)?;

    let len = request.text.len();
    let output = create_document(
        cipher,
        db,
        operation,
        owner,
        device,
        output_node,
        request.title,
        request.text,
        checkpoint,
    )?;

    let transformation = TransformationId(new_id()?);
    let event = Derivation {
        transformation,
        operation,
        actor: owner,
        device,
        kind: Kind::ReviewedSynthesis,
        source_authorship: SourceAuthorship::Unknown,
        inputs: request
            .inputs
            .into_iter()
            // Retain input order and exact source bindings in immutable provenance.
            .map(|input| input.source)
            .collect(),
        outputs: vec![clipboard::Source {
            document: output.document.id,
            node: output_node,
            snapshot: output.snapshot,
            revision: output.revision,
            occurrence_path: vec![output.document.occurrence],
            start_byte: 0,
            end_byte: len,
        }],
    };
    cipher.insert(db, KIND, address(output_node), &event)?;
    checkpoint("derivation")?;

    Ok(Outcome::Merged {
        document: output.document.id,
        transformation,
        revision: output.revision,
        snapshot: output.snapshot,
    })
}

impl Workspace {
    /// Read exact original synthesis provenance under current scope in one read transaction.
    pub fn document_merge(&mut self, document: DocumentId) -> Result<Derivation> {
        let tx = self.db.transaction()?;
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        // The ordinary reader supplies no extra externally charged source hook.
        let event = read_derivation(&cipher, &tx, &catalog, document, &mut |_| Ok(()))?;
        tx.commit()?;
        Ok(event)
    }
}

/// Validate pinned output publication/receipt and every exact input without following heads.
/// Caller owns a current-authority consistent transaction and source work budget.
pub(super) fn read_derivation(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    document: DocumentId,
    check_source: &mut impl FnMut(&clipboard::Source) -> Result<()>,
) -> Result<Derivation> {
    if !catalog.documents.contains(&document) {
        return Err(Error::NotFound);
    }
    let doc: Document = cipher.object(db, DOCUMENT, document.0)?;
    if doc.id != document {
        return Err(Error::Integrity);
    }
    let event: Derivation = cipher.object(db, KIND, address(doc.node))?;
    if !(2..=hypergraph_domain::merge::MAX_INPUTS).contains(&event.inputs.len())
        || event.outputs.len() != 1
        || event.actor != catalog.owner
        || event.device != catalog.device
    {
        return Err(Error::Integrity);
    }
    let out = &event.outputs[0];
    if out.document != document
        || out.node != doc.node
        || out.start_byte != 0
        // An independent output cannot appear as one of its own source nodes.
        || event.inputs.iter().any(|s| s.node == doc.node)
    {
        return Err(Error::Integrity);
    }
    check_source(out)?;
    let (_, output) = clipboard::resolve_source(cipher, db, catalog, out)?;
    if output.parent.is_some()
        || output.operation != event.operation
        || output.text.len() != out.end_byte
    {
        return Err(Error::Integrity);
    }
    let publication: Event = cipher.object(db, EVENT, event.operation.0)?;
    if publication.operation != event.operation
        || publication.actor != event.actor
        || publication.device != event.device
        || publication.document != document
        || publication.parent.is_some()
        || publication.revision != out.revision
        || publication.snapshot != out.snapshot
    {
        return Err(Error::Integrity);
    }
    let receipt: StoredReceipt = cipher.object(db, RECEIPT, event.operation.0)?;
    if receipt.receipt.operation != event.operation
        || receipt.receipt.outcome
            != (Outcome::Merged {
                document,
                transformation: event.transformation,
                revision: out.revision,
                snapshot: out.snapshot,
            })
    {
        return Err(Error::Integrity);
    }
    let mut total = 0usize;
    for source in &event.inputs {
        check_source(source)?;
        clipboard::resolve_source(cipher, db, catalog, source)?;
        total = total
            .checked_add(
                source
                    .end_byte
                    .checked_sub(source.start_byte)
                    .ok_or(Error::Integrity)?,
            )
            .ok_or(Error::Integrity)?;
        if total > MAX_TEXT_BYTES {
            return Err(Error::Integrity);
        }
    }
    Ok(event)
}

#[cfg(test)]
pub(super) mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, op, save};
    /// Supply two explicit equal-source inputs with an independently reviewed output fixture.
    pub(crate) fn request(state: &EditorState) -> Request {
        let fork = forks::tests::request(state);
        Request {
            title: "Reviewed synthesis".into(),
            text: "Reviewed 😀\r\nNew interpretation e\u{301}中\rtail\n".into(),
            inputs: vec![
                Input {
                    source: fork.source.clone(),
                    expected_draft: None,
                    quote: fork.quote.clone(),
                },
                Input {
                    source: fork.source,
                    expected_draft: None,
                    quote: fork.quote,
                },
            ],
        }
    }

    /// Create a disposable committed source with mixed Unicode/newline content.
    fn setup() -> (Temp, Workspace, EditorState) {
        let t = Temp::new();
        let mut w = Workspace::create(&t.db(), PASS, "Synthetic").unwrap();
        let r = w
            .execute(
                op(1),
                Command::Create {
                    title: "Input".into(),
                    text: "Pinned 😀\r\n中\rA\n".into(),
                },
            )
            .unwrap();
        let Outcome::Created { document } = r.outcome else {
            panic!()
        };
        let e = w.open_document(document).unwrap();
        (t, w, e)
    }

    /// Require a successful synthesis outcome before extracting its independent document.
    fn document(r: &Receipt) -> DocumentId {
        let Outcome::Merged { document, .. } = r.outcome else {
            panic!()
        };
        document
    }

    /// Guard independent reviewed output and ordered pinned provenance through replay/edit/restart.
    #[test]
    fn reviewed_output_retains_ordered_inputs_independent_identity_history_retry_and_restart() {
        let (t, mut w, source) = setup();
        let p = request(&source);
        w.execute(op(2), save(&source, "Later uncommitted input"))
            .unwrap();
        let command = Command::Merge { plan: p.clone() };
        let r = w.execute(op(3), command.clone()).unwrap();
        assert_eq!(w.execute(op(3), command.clone()).unwrap(), r);
        let id = document(&r);
        let out = w.open_document(id).unwrap();
        assert_ne!(out.node, source.node);
        assert_eq!(out.text, p.text);
        let event = w.document_merge(id).unwrap();
        assert_eq!(
            event.inputs,
            p.inputs
                .iter()
                // Compare retained input order, not only set membership.
                .map(|i| i.source.clone())
                .collect::<Vec<_>>()
        );
        assert_eq!(event.source_authorship, SourceAuthorship::Unknown);
        assert_eq!(
            w.open_document(source.document).unwrap().text,
            "Later uncommitted input"
        );
        w.execute(op(4), save(&out, "Independent output edit"))
            .unwrap();
        let edited = w.open_document(id).unwrap();
        w.execute(op(5), commit(&edited)).unwrap();
        assert_eq!(w.document_merge(id).unwrap(), event);
        assert_eq!(w.reconstruct_snapshot(id, out.snapshot).unwrap(), p.text);
        let next = w.execute(op(6), command).unwrap();
        assert_ne!(document(&next), id);
        drop(w);
        let mut w = Workspace::open(&t.db(), PASS).unwrap();
        assert_eq!(w.document_merge(id).unwrap(), event);
    }

    /// Guard rollback-before-commit and exact single-result recovery after committed reply loss.
    #[test]
    fn all_publication_faults_roll_back_or_reconcile_one_output() {
        for phase in ["objects", "derivation", "heads", "receipt", "committed"] {
            let (t, mut w, s) = setup();
            let c = Command::Merge { plan: request(&s) };
            assert!(
                // Fail this exact selected publication checkpoint and leave other phases alone.
                w.execute_inner(op(2), c.clone(), |p| if p == phase {
                    Err(Error::Io)
                } else {
                    Ok(())
                })
                .is_err()
            );
            assert_eq!(
                w.list_documents().unwrap().len(),
                if phase == "committed" { 2 } else { 1 }
            );
            drop(w);
            let mut w = Workspace::open(&t.db(), PASS).unwrap();
            let r = w.execute(op(2), c).unwrap();
            assert_eq!(w.list_documents().unwrap().len(), 2);
            w.document_merge(document(&r)).unwrap();
        }
    }

    /// Reject wrong quotes/revisions and damaged original evidence without guessing provenance.
    #[test]
    fn invalid_uncommitted_scope_and_damaged_evidence_never_publish_or_guess() {
        let (_t, mut w, s) = setup();
        let mut bad = request(&s);
        bad.inputs[0].quote = "Wrong".into();
        assert!(w.execute(op(2), Command::Merge { plan: bad }).is_err());
        let mut bad = request(&s);
        bad.inputs[0].source.revision = RevisionId([90; 32]);
        assert!(w.execute(op(3), Command::Merge { plan: bad }).is_err());
        assert_eq!(w.list_documents().unwrap().len(), 1);
        let r = w
            .execute(op(4), Command::Merge { plan: request(&s) })
            .unwrap();
        let id = document(&r);
        w.db.execute(
            "DELETE FROM objects WHERE kind=?1 AND id=?2",
            params![RECEIPT, op(4).0.as_slice()],
        )
        .unwrap();
        assert!(w.document_merge(id).is_err());
        assert!(w.document_merge(s.document).is_err());
    }
}
