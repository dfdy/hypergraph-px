// SPDX-License-Identifier: AGPL-3.0-only
//! Selected document/assertion incidence. It never turns an n-ary claim into a clique.
use super::*;
use std::collections::BTreeSet;
pub const MAX_PARTICIPANT_SOURCES: usize = 64;
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum Selection {
    Document {
        #[serde(with = "encoding::identity")]
        document: DocumentId,
    },
    Assertion {
        #[serde(with = "encoding::identity")]
        node: NodeId,
    },
}
#[derive(Debug, Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum Node {
    Document { context: graph::Node },
    Assertion { context: Box<assertions::Entry> },
}
impl Node {
    fn id(&self) -> NodeId {
        match self {
            Self::Document { context } => context.node,
            Self::Assertion { context } => context.record.node,
        }
    }
}
#[derive(Debug, Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum Edge {
    Merge {
        event: merges::Derivation,
    },
    Fork {
        event: forks::Derivation,
    },
    Participant {
        #[serde(with = "encoding::identity")]
        assertion: NodeId,
        #[serde(with = "encoding::identity")]
        revision: RevisionId,
        index: usize,
        role: String,
        source: clipboard::Source,
    },
}
#[derive(Debug, Serialize)]
pub struct Projection {
    pub projection: &'static str,
    pub text_snapshot_scope: &'static str,
    pub nodes: Vec<Node>,
    pub edges: Vec<Edge>,
    pub outside_selection: usize,
}
impl Workspace {
    pub fn overlay_graph(&mut self, selection: &[Selection]) -> Result<Projection> {
        self.overlay_graph_inner(selection, |_| Ok(()))
    }
    fn overlay_graph_inner(
        &mut self,
        selection: &[Selection],
        checkpoint: impl FnMut(usize) -> Result<()>,
    ) -> Result<Projection> {
        self.graph_inner(selection, false, checkpoint)
    }
    pub fn transformation_graph(&mut self, selection: &[Selection]) -> Result<Projection> {
        self.graph_inner(selection, true, |_| Ok(()))
    }
    fn graph_inner(
        &mut self,
        selection: &[Selection],
        include_merges: bool,
        mut checkpoint: impl FnMut(usize) -> Result<()>,
    ) -> Result<Projection> {
        if selection.is_empty() || selection.len() > graph::MAX_NODES {
            return Err(Error::Invalid);
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
        let mut nodes = Vec::new();
        let mut ids = BTreeSet::new();
        let mut forks = Vec::new();
        let mut merges = Vec::new();
        let mut checked_sources = BTreeSet::new();
        for (index, item) in selection.iter().enumerate() {
            let node = match item {
                Selection::Document { document } => {
                    let context = graph::document_node(&cipher, &tx, &catalog, *document)?;
                    if let Some(event) =
                        graph::optional_fork(&cipher, &tx, &catalog, *document, context.node)?
                    {
                        forks.push(event);
                    }
                    if include_merges {
                        let exists: bool = tx.query_row(
                            "SELECT EXISTS(SELECT 1 FROM objects WHERE kind=?1 AND id=?2)",
                            params![merges::KIND, merges::address(context.node).as_slice()],
                            |r| r.get(0),
                        )?;
                        if exists {
                            let event = merges::read_derivation(
                                &cipher,
                                &tx,
                                &catalog,
                                *document,
                                &mut |source| {
                                    let key =
                                        serde_json::to_vec(source).map_err(|_| Error::Format)?;
                                    if checked_sources.insert(key)
                                        && checked_sources.len() > MAX_PARTICIPANT_SOURCES
                                    {
                                        return Err(Error::Limit);
                                    }
                                    Ok(())
                                },
                            )?;
                            merges.push(event);
                        }
                    }
                    Node::Document { context }
                }
                Selection::Assertion { node } => {
                    let context = assertions::read_entry(&cipher, &tx, self.owner, *node)?;
                    assertions::check_indices(&cipher, &tx, &context)?;
                    for participant in &context.record.participants {
                        let key =
                            serde_json::to_vec(&participant.source).map_err(|_| Error::Format)?;
                        if checked_sources.insert(key) {
                            if checked_sources.len() > MAX_PARTICIPANT_SOURCES {
                                return Err(Error::Limit);
                            }
                            clipboard::resolve_source(&cipher, &tx, &catalog, &participant.source)?;
                        }
                    }
                    Node::Assertion {
                        context: Box::new(context),
                    }
                }
            };
            if !ids.insert(node.id().0) {
                return Err(Error::Invalid);
            }
            nodes.push(node);
            checkpoint(index)?;
        }
        let mut edges = Vec::new();
        let mut outside_selection = 0;
        for event in forks {
            if ids.contains(&event.inputs[0].node.0) {
                edges.push(Edge::Fork { event });
            } else {
                outside_selection += 1;
            }
        }
        for event in merges {
            outside_selection += event
                .inputs
                .iter()
                .filter(|source| !ids.contains(&source.node.0))
                .count();
            edges.push(Edge::Merge { event });
        }
        for node in &nodes {
            if let Node::Assertion { context } = node {
                for (index, participant) in context.record.participants.iter().enumerate() {
                    if ids.contains(&participant.source.node.0) {
                        edges.push(Edge::Participant {
                            assertion: context.record.node,
                            revision: context.revision,
                            index,
                            role: participant.role.clone(),
                            source: participant.source.clone(),
                        });
                    } else {
                        outside_selection += 1;
                    }
                }
            }
        }
        tx.commit()?;
        Ok(Projection {
            projection: if include_merges {
                "transformation_incidence"
            } else {
                "retrospective_incidence"
            },
            text_snapshot_scope: "semantic_assertions_excluded",
            nodes,
            edges,
            outside_selection,
        })
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, op, save};
    fn setup() -> (Temp, Workspace, EditorState, assertions::Change) {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let document = match ws
            .execute(
                op(1),
                Command::Create {
                    title: "Same label".into(),
                    text: "Exact😀\r\nSecond 中\n".into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let source = ws.open_document(document).unwrap();
        let mut mutation = assertions::tests::create(&source);
        if let assertions::Mutation::Create {
            predicate,
            participants,
            ..
        } = &mut mutation
        {
            *predicate = assertions::Predicate::Declared {
                label: "Same label".into(),
                description: "Declared n-ary claim; not a proof.".into(),
                roles: vec![
                    predicates::Role {
                        id: "premise".into(),
                        label: "Premise".into(),
                    },
                    predicates::Role {
                        id: "conclusion".into(),
                        label: "Conclusion".into(),
                    },
                ],
            };
            participants[0].role = "premise".into();
            participants[1].role = "conclusion".into();
            participants.insert(1, participants[0].clone());
        }
        let assertion = match ws
            .execute(op(2), Command::Assertion { mutation })
            .unwrap()
            .outcome
        {
            Outcome::Assertion { state } => state,
            _ => panic!(),
        };
        (temp, ws, source, assertion)
    }
    #[test]
    fn nary_incidence_preserves_one_assertion_node_and_parallel_role_occurrences_after_source_edits()
     {
        let (_temp, mut ws, source, assertion) = setup();
        ws.execute(op(3), save(&source, "New current text"))
            .unwrap();
        let draft = ws.open_document(source.document).unwrap();
        ws.execute(op(4), commit(&draft)).unwrap();
        let graph = ws
            .overlay_graph(&[
                Selection::Document {
                    document: source.document,
                },
                Selection::Assertion {
                    node: assertion.node,
                },
            ])
            .unwrap();
        assert_eq!(graph.nodes.len(), 2);
        assert_eq!(graph.edges.len(), 3);
        assert_eq!(graph.outside_selection, 0);
        for (i, edge) in graph.edges.iter().enumerate() {
            match edge {
                Edge::Participant {
                    index,
                    source: binding,
                    assertion: node,
                    ..
                } => {
                    assert_eq!(*index, i);
                    assert_eq!(*node, assertion.node);
                    assert_eq!(binding.snapshot, source.snapshot);
                }
                _ => panic!(),
            }
        }
        assert_eq!(
            ws.reconstruct_snapshot(source.document, source.snapshot)
                .unwrap(),
            source.text
        );
    }
    #[test]
    fn boundaries_duplicate_scope_unknown_ids_and_authority_fail_without_partial_graph() {
        let (_temp, mut ws, source, assertion) = setup();
        let graph = ws
            .overlay_graph(&[Selection::Assertion {
                node: assertion.node,
            }])
            .unwrap();
        assert_eq!(graph.edges.len(), 0);
        assert_eq!(graph.outside_selection, 3);
        assert!(matches!(ws.overlay_graph(&[]), Err(Error::Invalid)));
        assert!(matches!(
            ws.overlay_graph(&vec![
                Selection::Document {
                    document: source.document
                };
                17
            ]),
            Err(Error::Invalid)
        ));
        assert!(matches!(
            ws.overlay_graph(&[
                Selection::Assertion {
                    node: assertion.node
                },
                Selection::Assertion {
                    node: assertion.node
                }
            ]),
            Err(Error::Invalid)
        ));
        assert!(matches!(
            ws.overlay_graph(&[Selection::Assertion {
                node: NodeId([99; 32])
            }]),
            Err(Error::NotFound)
        ));
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.overlay_graph(&[Selection::Assertion {
                node: assertion.node
            }]),
            Err(Error::Integrity)
        ));
    }
    #[test]
    fn selected_reviews_and_text_nodes_share_one_read_view_during_concurrent_review() {
        let (temp, mut ws, source, assertion) = setup();
        let mut other = Workspace::open(&temp.db(), PASS).unwrap();
        let graph = ws
            .overlay_graph_inner(
                &[
                    Selection::Document {
                        document: source.document,
                    },
                    Selection::Assertion {
                        node: assertion.node,
                    },
                ],
                |index| {
                    if index == 0 {
                        other.execute(
                            op(3),
                            Command::Assertion {
                                mutation: assertions::Mutation::Review {
                                    node: assertion.node,
                                    revision: assertion.revision,
                                    generation: 0,
                                    status: assertions::Status::Accepted,
                                },
                            },
                        )?;
                    }
                    Ok(())
                },
            )
            .unwrap();
        match &graph.nodes[1] {
            Node::Assertion { context } => {
                assert_eq!(context.record.status, assertions::Status::Proposed)
            }
            _ => panic!(),
        };
        assert_eq!(
            other
                .assertion_page(source.document, source.snapshot, None, 0, 8)
                .unwrap()
                .entries[0]
                .record
                .status,
            assertions::Status::Accepted
        );
    }
    #[test]
    fn source_validation_budget_rejects_a_large_induced_view_without_partial_output() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(4);
        let document = match ws
            .execute(
                op(1),
                Command::Create {
                    title: "Budget source".into(),
                    text: text.clone(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let source = ws.open_document(document).unwrap();
        let mut selected = Vec::new();
        for group in 0..9usize {
            let participants = (0..8)
                .map(|index| {
                    let start = group * 8 + index;
                    assertions::Input {
                        role: "participant".into(),
                        source: clipboard::Source {
                            document,
                            node: source.node,
                            snapshot: source.snapshot,
                            revision: source.base,
                            occurrence_path: vec![source.occurrence],
                            start_byte: start,
                            end_byte: start + 1,
                        },
                        expected_draft: Some(clipboard::DraftContext {
                            generation: source.generation,
                            sequence: source.acknowledged_sequence,
                        }),
                        quote: text[start..start + 1].into(),
                    }
                })
                .collect();
            let mutation = assertions::Mutation::Create {
                predicate: assertions::Predicate::Declared {
                    label: "Budget claim".into(),
                    description: "Synthetic declared participant collection.".into(),
                    roles: vec![predicates::Role {
                        id: "participant".into(),
                        label: "Participant".into(),
                    }],
                },
                participants,
                properties: assertions::Properties {
                    negated: false,
                    certainty: assertions::Certainty::Unspecified,
                    attribution: String::new(),
                    scope: String::new(),
                },
            };
            let node = match ws
                .execute(op(group as u8 + 2), Command::Assertion { mutation })
                .unwrap()
                .outcome
            {
                Outcome::Assertion { state } => state.node,
                _ => panic!(),
            };
            selected.push(Selection::Assertion { node });
        }
        assert!(matches!(ws.overlay_graph(&selected), Err(Error::Limit)));
        assert_eq!(ws.overlay_graph(&selected[..8]).unwrap().nodes.len(), 8);
        assert_eq!(
            ws.open_document(document).unwrap().generation,
            source.generation
        );
    }
    fn merged(ws: &mut Workspace, source: &EditorState) -> DocumentId {
        match ws
            .execute(
                op(190),
                Command::Merge {
                    plan: merges::tests::request(source),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Merged { document, .. } => document,
            _ => panic!(),
        }
    }
    #[test]
    fn merge_is_one_ordered_group_with_partial_boundary_and_retained_source_context() {
        let (_temp, mut ws, source, _) = setup();
        let output = merged(&mut ws, &source);
        let selected = [
            Selection::Document {
                document: source.document,
            },
            Selection::Document { document: output },
        ];
        let graph = ws.transformation_graph(&selected).unwrap();
        assert_eq!(graph.projection, "transformation_incidence");
        assert_eq!(graph.edges.len(), 1);
        let Edge::Merge { event } = &graph.edges[0] else {
            panic!()
        };
        assert_eq!(event.inputs.len(), 2);
        assert_eq!(event.inputs[0], event.inputs[1]);
        assert_eq!(graph.outside_selection, 0);
        let original = event.clone();
        ws.execute(op(191), save(&source, "Later input 😀\r\n"))
            .unwrap();
        let edited = ws.open_document(source.document).unwrap();
        ws.execute(op(192), commit(&edited)).unwrap();
        let graph = ws.transformation_graph(&selected).unwrap();
        let Edge::Merge { event } = &graph.edges[0] else {
            panic!()
        };
        assert_eq!(*event, original);
        let graph = ws.transformation_graph(&selected[1..]).unwrap();
        assert_eq!(graph.nodes.len(), 1);
        assert_eq!(graph.edges.len(), 1);
        assert_eq!(graph.outside_selection, 2);
        assert!(ws.overlay_graph(&selected).unwrap().edges.is_empty());
    }
    #[test]
    fn damaged_existing_merge_never_becomes_an_unrelated_document_and_authority_is_checked() {
        let (_temp, mut ws, source, _) = setup();
        let output = merged(&mut ws, &source);
        let selected = [Selection::Document { document: output }];
        let owner = ws.owner;
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.transformation_graph(&selected),
            Err(Error::Integrity)
        ));
        ws.owner = owner;
        ws.db
            .execute(
                "DELETE FROM objects WHERE kind=?1 AND id=?2",
                params![RECEIPT, op(190).0.as_slice()],
            )
            .unwrap();
        assert!(ws.transformation_graph(&selected).is_err());
        assert!(ws.overlay_graph(&selected).is_ok());
    }
    #[test]
    fn merge_graph_keeps_one_read_view_while_a_separate_writer_edits_an_input() {
        let (temp, mut ws, source, _) = setup();
        let output = merged(&mut ws, &source);
        let selected = [
            Selection::Document {
                document: source.document,
            },
            Selection::Document { document: output },
        ];
        let before = serde_json::to_value(ws.transformation_graph(&selected).unwrap()).unwrap();
        let mut writer = Workspace::open(&temp.db(), PASS).unwrap();
        let graph = ws
            .graph_inner(&selected, true, |i| {
                if i == 0 {
                    writer.execute(op(191), save(&source, "Separate writer"))?;
                    let draft = writer.open_document(source.document)?;
                    writer.execute(op(192), commit(&draft))?;
                }
                Ok(())
            })
            .unwrap();
        assert_eq!(serde_json::to_value(graph).unwrap(), before);
        assert_ne!(
            serde_json::to_value(ws.transformation_graph(&selected).unwrap()).unwrap(),
            before
        );
    }
    #[test]
    fn merge_sources_share_the_64_binding_work_budget() {
        let (_temp, mut ws, source, _) = setup();
        let boundaries: Vec<_> = source
            .text
            .char_indices()
            .map(|(i, _)| i)
            .chain([source.text.len()])
            .collect();
        let mut selected = Vec::new();
        for group in 0..8 {
            let mut plan = merges::tests::request(&source);
            plan.inputs = (0..8)
                .map(|offset| {
                    let mut input = plan.inputs[0].clone();
                    input.source.start_byte = boundaries[group];
                    input.source.end_byte = boundaries[group + offset + 1];
                    input.quote =
                        source.text[input.source.start_byte..input.source.end_byte].into();
                    input
                })
                .collect();
            let receipt = ws
                .execute(op(40 + group as u8), Command::Merge { plan })
                .unwrap();
            let Outcome::Merged { document, .. } = receipt.outcome else {
                panic!()
            };
            selected.push(Selection::Document { document });
        }
        assert!(ws.transformation_graph(&selected[..7]).is_ok());
        assert!(matches!(
            ws.transformation_graph(&selected),
            Err(Error::Limit)
        ));
    }
}
