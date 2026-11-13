// SPDX-License-Identifier: AGPL-3.0-only
//! Read-only experimental origin loading with explicit legacy seeds.
use super::*;
use hypergraph_domain::parent_merge::{Base, Limits, origins::Map};
use std::collections::BTreeSet;

pub const SEED_KIND: i32 = 36;
const MAX_RECORDS: usize = 64;
pub(super) const READ_BYTES: usize = 128 * 1024 * 1024;
pub(super) const WORK: usize = 32 * 1024 * 1024;
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Seed {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    node: NodeId,
    #[serde(with = "encoding::identity")]
    revision: RevisionId,
    #[serde(with = "encoding::identity")]
    snapshot: SnapshotId,
}
struct Frame {
    binding: origin_record::Binding,
    bytes: Zeroizing<Vec<u8>>,
    text: String,
}
fn raw_clock(
    cipher: &Cipher<'_>,
    db: &Connection,
    doc: &Document,
    left: &mut usize,
) -> Result<node_clock::Clock> {
    if !temporal_save::charge(db, "slots", node_clock::CANDIDATE_KIND, doc.node.0, left)? {
        return Err(Error::Integrity);
    }
    let (generation, envelope): (i64, Vec<u8>) = db.query_row(
        "SELECT generation,envelope FROM slots WHERE kind=?1 AND id=?2",
        params![node_clock::CANDIDATE_KIND, doc.node.0.as_slice()],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )?;
    let generation = u64::try_from(generation).map_err(|_| Error::Integrity)?;
    let plain = cipher.key.open(
        cipher.context(node_clock::CANDIDATE_KIND, doc.node.0, generation),
        &envelope,
    )?;
    let clock = node_clock::decode(&plain, doc.id, doc.node).map_err(|error| match error {
        Error::Conflict => Error::Integrity,
        other => other,
    })?;
    if clock.order() != generation {
        return Err(Error::Integrity);
    }
    Ok(clock)
}
impl Workspace {
    /// No fallback from missing required origin evidence to inferred legacy state.
    pub fn temporal_origins(&mut self, document: DocumentId, branch: BranchId) -> Result<Map> {
        self.temporal_origins_budget(document, branch, MAX_RECORDS, READ_BYTES, WORK)
    }
    fn temporal_origins_budget(
        &mut self,
        document: DocumentId,
        branch: BranchId,
        records: usize,
        bytes: usize,
        work: usize,
    ) -> Result<Map> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let catalog = authority::catalog(&cipher, &tx, self.owner, self.device)?;
        let doc = branches::document(&cipher, &tx, &catalog, document, branch)?;
        let mut left = bytes;
        let (map, _) = read_map(&cipher, &tx, &doc, records, &mut left, work)?;
        tx.commit()?;
        Ok(map)
    }
}

/// Caller supplies the already authorized document and one pinned transaction.
/// No nested transaction or implicit initialization; share its encrypted-read budget.
pub(super) fn read_map(
    cipher: &Cipher<'_>,
    db: &Connection,
    doc: &Document,
    records: usize,
    left: &mut usize,
    work: usize,
) -> Result<(Map, node_clock::Clock)> {
    let document = doc.id;
    if !(1..=MAX_RECORDS).contains(&records)
        || !(1..=READ_BYTES).contains(&*left)
        || !(1..=WORK).contains(&work)
    {
        return Err(Error::Limit);
    }
    temporal_save::guard(cipher, db, left)?;
    let clock = raw_clock(cipher, db, doc, left)?;
    if let Some(change) = clock.change() {
        let entry = history::read_entry(cipher, db, doc, change.revision, left)?;
        if entry.operation != change.operation || entry.snapshot != change.snapshot {
            return Err(Error::Integrity);
        }
        if !temporal_save::charge(
            db,
            "objects",
            origin_record::CANDIDATE_KIND,
            change.revision.0,
            left,
        )? {
            return Err(Error::Integrity);
        }
        let envelope: Vec<u8> = db.query_row(
            "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
            params![origin_record::CANDIDATE_KIND, change.revision.0.as_slice()],
            |row| row.get(0),
        )?;
        let bytes = cipher.key.open(
            cipher.context(origin_record::CANDIDATE_KIND, change.revision.0, 0),
            &envelope,
        )?;
        let binding = origin_record::binding(&bytes)?;
        if binding.document != document
            || binding.node != doc.node
            || binding.revision != change.revision
            || binding.snapshot != change.snapshot
            || binding.order != clock.order()
            || entry.parent != Some(binding.parent_revision)
        {
            return Err(Error::Integrity);
        }
    }
    let page = history::read_document_page(cipher, db, doc, None, 1, left)?;
    let head = page.entries.first().ok_or(Error::Integrity)?;
    let (mut id, mut snapshot) = (head.revision, head.snapshot);
    let mut seen = BTreeSet::new();
    let mut frames = Vec::new();
    let root = loop {
        if seen.len() == records {
            return Err(Error::Limit);
        }
        if !seen.insert(id) {
            return Err(Error::Integrity);
        }
        let entry = history::read_entry(cipher, db, doc, id, left)?;
        if entry.snapshot != snapshot {
            return Err(Error::Integrity);
        }
        let revision: Revision = history::object(cipher, db, REVISION, id.0, left)?;
        let has_origin =
            temporal_save::charge(db, "objects", origin_record::CANDIDATE_KIND, id.0, left)?;
        let has_seed = temporal_save::charge(db, "objects", SEED_KIND, id.0, left)?;
        if has_origin == has_seed {
            return Err(Error::Integrity);
        }
        if has_seed {
            let seed: Seed = cipher.object(db, SEED_KIND, id.0)?;
            if seed.document != document
                || seed.node != doc.node
                || seed.revision != id
                || seed.snapshot != snapshot
            {
                return Err(Error::Integrity);
            }
            break (id, revision.text);
        }
        let envelope: Vec<u8> = db.query_row(
            "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
            params![origin_record::CANDIDATE_KIND, id.0.as_slice()],
            |row| row.get(0),
        )?;
        let bytes = cipher.key.open(
            cipher.context(origin_record::CANDIDATE_KIND, id.0, 0),
            &envelope,
        )?;
        let binding = origin_record::binding(&bytes)?;
        if binding.document != document
            || binding.node != doc.node
            || binding.revision != id
            || binding.snapshot != snapshot
            || entry.parent != Some(binding.parent_revision)
            || binding.order > clock.order()
        {
            return Err(Error::Integrity);
        }
        id = binding.parent_revision;
        snapshot = binding.parent_snapshot;
        frames.push(Frame {
            binding,
            bytes,
            text: revision.text,
        });
    };
    let limits = Limits {
        text_bytes: MAX_TEXT_BYTES,
        work: work / seen.len(),
    };
    let mut map = Map::root(
        &Base {
            node: doc.node,
            revision: root.0,
            text: &root.1,
        },
        None,
        limits,
    )
    .map_err(|_| Error::Limit)?;
    for frame in frames.into_iter().rev() {
        map = origin_record::decode(
            &frame.bytes,
            &frame.binding,
            &map,
            &frame.text,
            limits,
            hypergraph_crypto::MAX_PLAINTEXT,
        )
        .map_err(|error| match error {
            Error::Conflict => Error::Integrity,
            other => other,
        })?;
    }
    Ok((map, clock))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};
    use hypergraph_domain::parent_merge::{
        Mapping,
        lineage::{Splice, Trace},
    };
    fn limits() -> Limits {
        Limits {
            text_bytes: MAX_TEXT_BYTES,
            work: WORK,
        }
    }
    fn install(ws: &mut Workspace, state: &EditorState) {
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let tx = ws.db.transaction().unwrap();
        cipher.new_slot(&tx,temporal_save::FEATURE_KIND,ROOT,&serde_json::json!({"workspace":ws.workspace,"minimum_reader":3,"feature":"temporal_parent_merge_v1"})).unwrap();
        cipher
            .insert(
                &tx,
                SEED_KIND,
                state.base.0,
                &Seed {
                    document: state.document,
                    node: state.node,
                    revision: state.base,
                    snapshot: state.snapshot,
                },
            )
            .unwrap();
        let clock = node_clock::Clock::initial(state.document, state.node);
        let envelope = cipher
            .key
            .seal(
                cipher.context(node_clock::CANDIDATE_KIND, state.node.0, 0),
                &clock.encode().unwrap(),
            )
            .unwrap();
        tx.execute(
            "INSERT INTO slots(kind,id,generation,envelope) VALUES (?1,?2,0,?3)",
            params![
                node_clock::CANDIDATE_KIND,
                state.node.0.as_slice(),
                envelope
            ],
        )
        .unwrap();
        tx.execute_batch("PRAGMA user_version=3").unwrap();
        tx.commit().unwrap();
    }
    // Fixtures simulate the future publication transaction; no public writer is enabled.
    fn evidence(
        ws: &Workspace,
        parent: &EditorState,
        current: &EditorState,
        operation: OperationId,
        map: &Map,
        order: u64,
    ) -> Map {
        let base = Base {
            node: map.node(),
            revision: map.revision(),
            text: map.text(),
        };
        let trace = Trace::new(&base, limits())
            .unwrap()
            .apply(
                map.text(),
                &[Splice {
                    start: 0,
                    end: map.text().len(),
                    expected: map.text(),
                    replacement: &current.text,
                }],
                &current.text,
                limits(),
            )
            .unwrap();
        let proof = vec![origin_record::Evidence {
            pieces: vec![origin_record::Piece {
                start_byte: 0,
                end_byte: current.text.len(),
                source: origin_record::Source::Fresh {},
            }],
            deletion_mapping: origin_record::Confidence::Exact,
        }];
        let binding = origin_record::Binding {
            document: parent.document,
            node: parent.node,
            revision: current.base,
            snapshot: current.snapshot,
            parent_revision: parent.base,
            parent_snapshot: parent.snapshot,
            order,
        };
        let (bytes, next) = origin_record::encode(
            &binding,
            map,
            &trace,
            &proof,
            limits(),
            hypergraph_crypto::MAX_PLAINTEXT,
        )
        .unwrap();
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let envelope = cipher
            .key
            .seal(
                cipher.context(origin_record::CANDIDATE_KIND, current.base.0, 0),
                &bytes,
            )
            .unwrap();
        ws.db
            .execute(
                "INSERT INTO objects(kind,id,envelope) VALUES (?1,?2,?3)",
                params![
                    origin_record::CANDIDATE_KIND,
                    current.base.0.as_slice(),
                    envelope
                ],
            )
            .unwrap();
        let mut clock = node_clock::Clock::initial(parent.document, parent.node);
        // Exact fixture state, not a persistent allocator or recovery route.
        for n in 0..order {
            clock = clock
                .plan_change(
                    n,
                    node_clock::Change {
                        revision: if n + 1 == order {
                            current.base
                        } else {
                            RevisionId([100 + n as u8; 32])
                        },
                        snapshot: if n + 1 == order {
                            current.snapshot
                        } else {
                            SnapshotId([120 + n as u8; 32])
                        },
                        operation: if n + 1 == order {
                            operation
                        } else {
                            op(150 + n as u8)
                        },
                    },
                )
                .unwrap();
        }
        let envelope = cipher
            .key
            .seal(
                cipher.context(node_clock::CANDIDATE_KIND, parent.node.0, order),
                &clock.encode().unwrap(),
            )
            .unwrap();
        ws.db
            .execute(
                "UPDATE slots SET generation=?1,envelope=?2 WHERE kind=?3 AND id=?4",
                params![
                    order as i64,
                    envelope,
                    node_clock::CANDIDATE_KIND,
                    parent.node.0.as_slice()
                ],
            )
            .unwrap();
        next
    }
    #[test]
    fn explicit_seed_and_two_origin_edges_replay_against_exact_publications_after_reconnect() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let seed = ws.open_document(doc).unwrap();
        ws.execute(op(2), save(&seed, "Tuesday 😀\r\n")).unwrap();
        let pending = ws.open_document(doc).unwrap();
        ws.execute(op(3), commit(&pending)).unwrap();
        let first = ws.open_document(doc).unwrap();
        ws.execute(op(4), save(&first, "Thursday e\u{301}\r\n"))
            .unwrap();
        let pending = ws.open_document(doc).unwrap();
        ws.execute(op(5), commit(&pending)).unwrap();
        let second = ws.open_document(doc).unwrap();
        install(&mut ws, &seed);
        let root = Map::root(
            &Base {
                node: seed.node,
                revision: seed.base,
                text: &seed.text,
            },
            None,
            limits(),
        )
        .unwrap();
        let first_map = evidence(&ws, &seed, &first, op(3), &root, 1);
        let expected = evidence(&ws, &first, &second, op(5), &first_map, 2);
        let changes = ws.db.total_changes();
        let loaded = ws.temporal_origins(doc, seed.branch).unwrap();
        assert_eq!(loaded, expected);
        assert_eq!(loaded.runs()[0].mapping, Mapping::Exact);
        assert_eq!(changes, ws.db.total_changes());
        let mut reopened = connect(&temp.db()).unwrap();
        std::mem::swap(&mut ws.db, &mut reopened);
        assert_eq!(ws.temporal_origins(doc, seed.branch).unwrap(), expected);
        assert!(matches!(
            Workspace::open(&temp.db(), PASS),
            Err(Error::Format)
        ));
    }
    #[test]
    fn missing_required_origin_seed_or_clock_never_becomes_an_unknown_legacy_map() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let seed = ws.open_document(doc).unwrap();
        assert!(matches!(
            ws.temporal_origins(doc, seed.branch),
            Err(Error::Format)
        ));
        install(&mut ws, &seed);
        assert_eq!(
            ws.temporal_origins(doc, seed.branch).unwrap().runs()[0].origins[0].order,
            None
        );
        ws.db
            .execute("DELETE FROM objects WHERE kind=?1", [SEED_KIND])
            .unwrap();
        assert!(matches!(
            ws.temporal_origins(doc, seed.branch),
            Err(Error::Integrity)
        ));
        ws.db
            .execute(
                "DELETE FROM slots WHERE kind=?1",
                [node_clock::CANDIDATE_KIND],
            )
            .unwrap();
        assert!(matches!(
            ws.temporal_origins(doc, seed.branch),
            Err(Error::Integrity)
        ));
    }
    #[test]
    fn stored_context_substitution_and_conflicting_seed_do_not_return_origins() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let seed = ws.open_document(doc).unwrap();
        ws.execute(op(2), save(&seed, "New current text")).unwrap();
        let pending = ws.open_document(doc).unwrap();
        ws.execute(op(3), commit(&pending)).unwrap();
        let current = ws.open_document(doc).unwrap();
        install(&mut ws, &seed);
        let root = Map::root(
            &Base {
                node: seed.node,
                revision: seed.base,
                text: &seed.text,
            },
            None,
            limits(),
        )
        .unwrap();
        evidence(&ws, &seed, &current, op(3), &root, 1);
        let raw: Vec<u8> = ws
            .db
            .query_row(
                "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
                params![origin_record::CANDIDATE_KIND, current.base.0.as_slice()],
                |row| row.get(0),
            )
            .unwrap();
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        cipher
            .insert(
                &ws.db,
                SEED_KIND,
                current.base.0,
                &Seed {
                    document: doc,
                    node: current.node,
                    revision: current.base,
                    snapshot: current.snapshot,
                },
            )
            .unwrap();
        assert!(matches!(
            ws.temporal_origins(doc, seed.branch),
            Err(Error::Integrity)
        ));
        ws.db
            .execute(
                "DELETE FROM objects WHERE kind=?1 AND id=?2",
                params![SEED_KIND, current.base.0.as_slice()],
            )
            .unwrap();
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let plain = cipher
            .key
            .open(
                cipher.context(origin_record::CANDIDATE_KIND, current.base.0, 0),
                &raw,
            )
            .unwrap();
        let mut value: serde_json::Value = serde_json::from_slice(&plain).unwrap();
        value["payload"]["binding"]["parent_snapshot"] = serde_json::json!([99; 32].to_vec());
        let envelope = cipher
            .key
            .seal(
                cipher.context(origin_record::CANDIDATE_KIND, current.base.0, 0),
                &serde_json::to_vec(&value).unwrap(),
            )
            .unwrap();
        ws.db
            .execute(
                "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                params![
                    envelope,
                    origin_record::CANDIDATE_KIND,
                    current.base.0.as_slice()
                ],
            )
            .unwrap();
        assert!(matches!(
            ws.temporal_origins(doc, seed.branch),
            Err(Error::Integrity)
        ));
        ws.db
            .execute(
                "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                params![
                    raw,
                    origin_record::CANDIDATE_KIND,
                    current.base.0.as_slice()
                ],
            )
            .unwrap();
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let clock = node_clock::Clock::initial(doc, current.node)
            .plan_change(
                0,
                node_clock::Change {
                    revision: current.base,
                    snapshot: current.snapshot,
                    operation: op(3),
                },
            )
            .unwrap();
        let envelope = cipher
            .key
            .seal(
                cipher.context(node_clock::CANDIDATE_KIND, current.node.0, 2),
                &clock.encode().unwrap(),
            )
            .unwrap();
        ws.db
            .execute(
                "UPDATE slots SET generation=2,envelope=?1 WHERE kind=?2 AND id=?3",
                params![
                    envelope,
                    node_clock::CANDIDATE_KIND,
                    current.node.0.as_slice()
                ],
            )
            .unwrap();
        assert!(matches!(
            ws.temporal_origins(doc, seed.branch),
            Err(Error::Integrity)
        ));
    }
    #[test]
    fn record_byte_work_and_current_authority_failures_do_not_return_a_partial_map() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let seed = ws.open_document(doc).unwrap();
        ws.execute(op(2), save(&seed, "Changed source")).unwrap();
        let pending = ws.open_document(doc).unwrap();
        ws.execute(op(3), commit(&pending)).unwrap();
        let current = ws.open_document(doc).unwrap();
        install(&mut ws, &seed);
        let root = Map::root(
            &Base {
                node: seed.node,
                revision: seed.base,
                text: &seed.text,
            },
            None,
            limits(),
        )
        .unwrap();
        evidence(&ws, &seed, &current, op(3), &root, 1);
        let changes = ws.db.total_changes();
        for (records, bytes, work) in [
            (1, READ_BYTES, WORK),
            (0, READ_BYTES, WORK),
            (MAX_RECORDS + 1, READ_BYTES, WORK),
            (MAX_RECORDS, 1, WORK),
            (MAX_RECORDS, READ_BYTES, 1),
            (MAX_RECORDS, READ_BYTES, WORK + 1),
        ] {
            assert!(matches!(
                ws.temporal_origins_budget(doc, seed.branch, records, bytes, work),
                Err(Error::Limit)
            ));
        }
        assert_eq!(changes, ws.db.total_changes());
        assert!(matches!(
            ws.temporal_origins(doc, BranchId([99; 32])),
            Err(Error::NotFound)
        ));
        let owner = ws.owner;
        ws.owner = PrincipalId([99; 32]);
        assert!(matches!(
            ws.temporal_origins(doc, seed.branch),
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
            ws.temporal_origins(doc, seed.branch),
            Err(Error::NotFound)
        ));
    }
    #[test]
    fn exact_working_promotion_can_verify_the_actual_temporal_receipt_without_a_legacy_alias() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let initial = ws.open_document(doc).unwrap();
        ws.execute(
            op(2),
            save(&initial, "Captured exact pending source 😀\r\n"),
        )
        .unwrap();
        let pending = ws.open_document(doc).unwrap();
        let source = match ws
            .execute(
                op(3),
                Command::Checkpoint {
                    plan: working::tests::request(&pending),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Checkpointed { state } => {
                state.source(pending.occurrence, 0, pending.text.len())
            }
            _ => panic!(),
        };
        let committed = ws.execute(op(4), commit(&pending)).unwrap();
        let current = ws.open_document(doc).unwrap();
        assert!(
            ws.working_source(source.clone())
                .unwrap()
                .promotion
                .is_some()
        );
        install(&mut ws, &initial);
        let root = Map::root(
            &Base {
                node: initial.node,
                revision: initial.base,
                text: &initial.text,
            },
            None,
            limits(),
        )
        .unwrap();
        evidence(&ws, &initial, &current, op(4), &root, 1);
        let proof = vec![origin_record::Evidence {
            pieces: vec![origin_record::Piece {
                start_byte: 0,
                end_byte: current.text.len(),
                source: origin_record::Source::Fresh {},
            }],
            deletion_mapping: origin_record::Confidence::Exact,
        }];
        let request = temporal_commit_record::Request {
            document: doc,
            branch: pending.branch,
            generation: pending.generation,
            base: pending.base,
            snapshot: pending.snapshot,
            sequence: pending.acknowledged_sequence,
            text: pending.text.clone(),
            evidence: proof,
        };
        let frozen = temporal_commit_record::Frozen {
            request,
            receipt: Receipt {
                operation: op(4),
                outcome: Outcome::Branch {
                    state: branches::Change {
                        branch: pending.branch,
                        outcome: committed.outcome.try_into().unwrap(),
                    },
                },
            },
            order: 1,
            changed: true,
        };
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let envelope = cipher
            .key
            .seal(
                cipher.context(temporal_commit_record::CANDIDATE_KIND, op(4).0, 0),
                &frozen.encode().unwrap(),
            )
            .unwrap();
        ws.db
            .execute(
                "INSERT INTO objects(kind,id,envelope) VALUES (?1,?2,?3)",
                params![
                    temporal_commit_record::CANDIDATE_KIND,
                    op(4).0.as_slice(),
                    envelope
                ],
            )
            .unwrap();
        ws.db
            .execute(
                "DELETE FROM objects WHERE kind=?1 AND id=?2",
                params![RECEIPT, op(4).0.as_slice()],
            )
            .unwrap();
        let changes = ws.db.total_changes();
        let view = ws.working_source(source.clone()).unwrap();
        assert_eq!(view.promotion.unwrap().revision, current.base);
        assert_eq!(changes, ws.db.total_changes());
        let mut changed = frozen.clone();
        changed.request.text.push('!');
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let envelope = cipher
            .key
            .seal(
                cipher.context(temporal_commit_record::CANDIDATE_KIND, op(4).0, 0),
                &changed.encode().unwrap(),
            )
            .unwrap();
        ws.db
            .execute(
                "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                params![
                    envelope,
                    temporal_commit_record::CANDIDATE_KIND,
                    op(4).0.as_slice()
                ],
            )
            .unwrap();
        assert!(matches!(ws.working_source(source), Err(Error::Integrity)));
    }
}
