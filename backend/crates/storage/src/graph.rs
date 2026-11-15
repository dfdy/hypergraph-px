// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Bounded document and Fork graph projection
//!
//! Read current committed node contexts and induced historical Fork edges for
//! one explicit document selection in one SQLite read view. Equal titles remain
//! distinct identities; historical edges do not move when document heads change.
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
//! Used by: Runtime document/Fork graph query and higher-level
//! provenance-overlay projections.
//!
//! Specification:
//! - [Graph projection responsibilities][spec0]
//! - [Current independent Fork provenance][spec1]
//! - [Domain/navigation interfaces][spec2]
//!
//! Boundary: No unselected-document graph scan, traversal expansion or
//! mutation is performed. Missing optional edges differ from corrupted
//! existing derivations.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/graph.rs
//! [spec0]: ../../../../docs/05-domain/diagrams/graph-projections.c4
//! [spec1]: ../../../../docs/05-domain/provenance-model.md#current-independent-fork-projection
//! [spec2]: ../../../../docs/06-subsystems/interfaces/domain-navigation.md

use super::*;
/// Maximum explicit document selection per bounded graph query.
pub const MAX_NODES: usize = 16;
/// Current committed context for one selected document, distinct from historical edges.
#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Node {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    pub title: String,
}

/// Induced selected graph plus a count of known incoming edges from outside selection.
#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Projection {
    pub projection: String,

    /// Requested documents in input order, each with a checked committed context.
    pub nodes: Vec<Node>,

    /// Pinned Fork derivations whose input and output documents are both selected.
    pub edges: Vec<forks::Derivation>,

    /// Only incoming forks of selected outputs; no scan of unselected documents.
    pub inputs_outside_selection: usize,
}

impl Workspace {
    /// Read one fully authorized bounded selection without injected query checkpoints.
    pub fn document_fork_graph(&mut self, documents: &[DocumentId]) -> Result<Projection> {
        // The normal query has no concurrency/fault injection callback.
        self.document_fork_graph_inner(documents, |_| Ok(()))
    }

    /// Validate all requested scope first, then collect nodes/edges in one consistent view.
    fn document_fork_graph_inner(
        &mut self,
        documents: &[DocumentId],
        mut checkpoint: impl FnMut(usize) -> Result<()>,
    ) -> Result<Projection> {
        if documents.is_empty() || documents.len() > MAX_NODES {
            return Err(Error::Invalid);
        }
        let mut ids = std::collections::BTreeSet::new();
        for document in documents {
            if !ids.insert(document.0) {
                return Err(Error::Invalid);
            }
        }

        let tx = self.db.transaction()?;
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        // Validate the complete requested authority scope before returning any projection.
        // Fail the entire query if any requested document is outside current scope.
        if documents.iter().any(|id| !catalog.documents.contains(id)) {
            return Err(Error::NotFound);
        }

        let mut nodes = Vec::new();
        let mut edges = Vec::new();
        let mut inputs_outside_selection = 0;
        for (index, id) in documents.iter().enumerate() {
            let context = document_node(&cipher, &tx, &catalog, *id)?;
            let node = context.node;
            nodes.push(context);
            if let Some(event) = optional_fork(&cipher, &tx, &catalog, *id, node)? {
                if ids.contains(&event.inputs[0].document.0) {
                    edges.push(event);
                } else {
                    inputs_outside_selection += 1;
                }
            }
            checkpoint(index)?;
        }

        tx.commit()?;

        Ok(Projection {
            projection: "document_forks".into(),
            nodes,
            edges,
            inputs_outside_selection,
        })
    }
}

/// Verify the selected document's current head, closed snapshot, revision and publication agree.
pub(super) fn document_node(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    document: DocumentId,
) -> Result<Node> {
    if !catalog.documents.contains(&document) {
        return Err(Error::NotFound);
    }
    let doc: Document = cipher.object(db, DOCUMENT, document.0)?;
    let (_, head): (_, Head) = cipher.slot(db, HEAD, doc.branch.0)?;
    if doc.id != document
        || head.document != document
        || snapshot_revision(cipher, db, &doc, head.snapshot)? != head.revision
    {
        return Err(Error::Integrity);
    }
    let revision: Revision = cipher.object(db, REVISION, head.revision.0)?;
    let publication: Event = cipher.object(db, EVENT, revision.operation.0)?;
    if revision.node != doc.node
        || publication.operation != revision.operation
        || publication.document != document
        || publication.revision != head.revision
        || publication.parent != revision.parent
        || publication.snapshot != head.snapshot
    {
        return Err(Error::Integrity);
    }
    if revision.text.len() > MAX_TEXT_BYTES {
        return Err(Error::Limit);
    }
    Ok(Node {
        document,
        node: doc.node,
        revision: head.revision,
        snapshot: head.snapshot,
        title: doc.title,
    })
}

/// Distinguish absent optional provenance from an existing derivation that fails validation.
pub(super) fn optional_fork(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    document: DocumentId,
    node: NodeId,
) -> Result<Option<forks::Derivation>> {
    let exists: bool = db.query_row(
        "SELECT EXISTS(SELECT 1 FROM objects WHERE kind=?1 AND id=?2)",
        params![forks::KIND, forks::address(node).as_slice()],
        // Decode only the existence flag before deciding whether full validation is needed.
        |row| row.get(0),
    )?;
    if exists {
        Ok(Some(forks::read_derivation(cipher, db, catalog, document)?))
    } else {
        Ok(None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, op, save};
    /// Create a synthetic source/Fork pair sharing labels but never logical identities.
    fn setup() -> (Temp, Workspace, DocumentId, DocumentId) {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let source = match ws
            .execute(
                op(1),
                Command::Create {
                    title: "Same label".into(),
                    text: "Exact😀\r\n".into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let state = ws.open_document(source).unwrap();
        let mut plan = forks::tests::request(&state);
        plan.title = "Same label".into();
        let fork = match ws.execute(op(2), Command::Fork { plan }).unwrap().outcome {
            Outcome::Forked { document, .. } => document,
            _ => panic!(),
        };
        (temp, ws, source, fork)
    }

    /// Guard identity separation and immutable Fork endpoints after edits and restart.
    #[test]
    fn induced_selection_keeps_equal_labels_distinct_and_pins_historical_fork_after_edits_restart()
    {
        let (temp, mut ws, source, fork) = setup();
        let before = ws.open_document(source).unwrap();
        let graph = ws.document_fork_graph(&[fork, source]).unwrap();
        assert_eq!(graph.nodes[0].document, fork);
        assert_eq!(graph.nodes[0].title, graph.nodes[1].title);
        assert_ne!(graph.nodes[0].node, graph.nodes[1].node);
        assert_eq!(graph.edges.len(), 1);
        assert_eq!(graph.inputs_outside_selection, 0);
        assert_eq!(
            ws.open_document(source).unwrap().generation,
            before.generation
        );
        ws.execute(op(3), save(&before, "New source")).unwrap();
        let draft = ws.open_document(source).unwrap();
        ws.execute(op(4), commit(&draft)).unwrap();
        let changed = ws.document_fork_graph(&[source, fork]).unwrap();
        assert_eq!(changed.edges, graph.edges);
        assert_ne!(changed.nodes[0].revision, graph.edges[0].inputs[0].revision);
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        assert_eq!(
            ws.document_fork_graph(&[source, fork]).unwrap().edges,
            graph.edges
        );
    }

    /// Guard selection limits, duplicate rejection and whole-query current-authority checks.
    #[test]
    fn bounded_selection_and_current_authority_reject_invalid_partial_scope() {
        let (_temp, mut ws, source, fork) = setup();
        assert!(matches!(ws.document_fork_graph(&[]), Err(Error::Invalid)));
        assert!(matches!(
            ws.document_fork_graph(&[source, source]),
            Err(Error::Invalid)
        ));
        assert!(matches!(
            ws.document_fork_graph(&[source; MAX_NODES + 1]),
            Err(Error::Invalid)
        ));
        assert!(matches!(
            ws.document_fork_graph(&[source, DocumentId([99; 32])]),
            Err(Error::NotFound)
        ));
        let graph = ws.document_fork_graph(&[fork]).unwrap();
        assert_eq!(graph.edges.len(), 0);
        assert_eq!(graph.inputs_outside_selection, 1);
        let isolated = ws.document_fork_graph(&[source]).unwrap();
        assert_eq!(isolated.edges.len(), 0);
        assert_eq!(isolated.inputs_outside_selection, 0);
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.document_fork_graph(&[source]),
            Err(Error::Integrity)
        ));
    }

    /// Ensure damaged provenance fails rather than becoming a falsely disconnected graph.
    #[test]
    fn damaged_existing_edge_is_not_reported_as_disconnected() {
        let (_temp, mut ws, source, fork) = setup();
        let editor = ws.open_document(fork).unwrap();
        ws.db
            .execute(
                "UPDATE objects SET envelope=zeroblob(length(envelope)) WHERE kind=?1 AND id=?2",
                params![forks::KIND, forks::address(editor.node).as_slice()],
            )
            .unwrap();
        assert!(ws.document_fork_graph(&[source, fork]).is_err());
    }

    /// Ensure one read view does not mix contexts when a second writer advances a head.
    #[test]
    fn one_query_keeps_a_consistent_view_while_another_writer_commits() {
        let (temp, mut ws, source, fork) = setup();
        let initial = ws.open_document(source).unwrap();
        let mut other = Workspace::open(&temp.db(), PASS).unwrap();
        let graph = ws
            // Advance the other writer after the first node to challenge read-view consistency.
            .document_fork_graph_inner(&[fork, source], |index| {
                if index == 0 {
                    other.execute(op(3), save(&initial, "Concurrent newer source"))?;
                    let draft = other.open_document(source)?;
                    other.execute(op(4), commit(&draft))?;
                }
                Ok(())
            })
            .unwrap();
        assert_eq!(graph.nodes[1].revision, initial.base);
        assert_ne!(
            other.open_document(source).unwrap().base,
            graph.nodes[1].revision
        );
        assert_eq!(graph.edges[0].inputs[0].revision, initial.base);
    }
}
