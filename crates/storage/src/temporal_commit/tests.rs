// SPDX-License-Identifier: AGPL-3.0-only
use super::*;
use crate::tests::{PASS, Temp, create, op};
const SAVE_WORK: usize = 16 * 1024 * 1024;

fn install(ws: &mut Workspace, state: &EditorState) {
    let cipher = Cipher {
        key: &ws.key,
        workspace: ws.workspace,
    };
    let tx = ws.db.transaction().unwrap();
    cipher.new_slot(&tx,temporal_save::FEATURE_KIND,ROOT,&serde_json::json!({"workspace":ws.workspace,"minimum_reader":3,"feature":"temporal_parent_merge_v1"})).unwrap();
    cipher.insert(&tx,origin_history::SEED_KIND,state.base.0,&serde_json::json!({"document":state.document.0,"node":state.node.0,"revision":state.base.0,"snapshot":state.snapshot.0})).unwrap();
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
fn setup() -> (Temp, Workspace, EditorState) {
    let temp = Temp::new();
    let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
    let doc = create(&mut ws);
    let state = ws.open_document(doc).unwrap();
    install(&mut ws, &state);
    (temp, ws, state)
}
fn save(
    ws: &mut Workspace,
    state: &EditorState,
    operation: u8,
    start: usize,
    end: usize,
    replacement: &str,
) -> EditorState {
    let mut text = state.text.clone();
    text.replace_range(start..end, replacement);
    ws.temporal_save(
        op(operation),
        temporal_save::Save {
            document: state.document,
            branch: state.branch,
            generation: state.generation,
            base: state.base,
            previous_sequence: state.acknowledged_sequence,
            sequence: state.acknowledged_sequence + 1,
            text,
            edits: vec![temporal_save::Edit {
                start_byte: start,
                end_byte: end,
                expected: state.text[start..end].into(),
                replacement: replacement.into(),
            }],
        },
        SAVE_WORK,
    )
    .unwrap();
    ws.open_branch(state.document, state.branch).unwrap()
}
fn request(ws: &mut Workspace, state: &EditorState) -> Request {
    let trace = ws
        .temporal_lineage(state.document, state.branch, SAVE_WORK)
        .unwrap();
    Request {
        document: state.document,
        branch: state.branch,
        generation: state.generation,
        base: state.base,
        snapshot: state.snapshot,
        sequence: state.acknowledged_sequence,
        text: state.text.clone(),
        evidence: trace
            .changes
            .iter()
            .map(|change| origin_record::Evidence {
                pieces: if change.replacement.is_empty() {
                    vec![]
                } else {
                    vec![origin_record::Piece {
                        start_byte: 0,
                        end_byte: change.replacement.len(),
                        source: origin_record::Source::Fresh {},
                    }]
                },
                deletion_mapping: origin_record::Confidence::Exact,
            })
            .collect(),
    }
}
fn rows(ws: &Workspace) -> Vec<(i32, Vec<u8>, i64, Vec<u8>)> {
    ws.db.prepare("SELECT kind,id,-1,envelope FROM objects UNION ALL SELECT kind,id,generation,envelope FROM slots ORDER BY kind,id,3").unwrap().query_map([],|r|Ok((r.get(0)?,r.get(1)?,r.get(2)?,r.get(3)?))).unwrap().collect::<std::result::Result<_,_>>().unwrap()
}
fn checkpoint(ws: &mut Workspace, state: &EditorState, operation: u8) -> working::Source {
    // Fixture invokes the existing adapter inside a transaction. The normal
    // schema1/2 dispatcher deliberately remains closed to experimental3.
    let operation = op(operation);
    let plan = working::tests::request(state);
    let command = Command::Checkpoint { plan: plan.clone() };
    let digest = Sha256::digest(serde_json::to_vec(&command).unwrap()).into();
    let cipher = Cipher {
        key: &ws.key,
        workspace: ws.workspace,
    };
    let tx = ws.db.transaction().unwrap();
    let catalog = authority::catalog(&cipher, &tx, ws.owner, ws.device).unwrap();
    let change = working::apply(&cipher, &tx, &catalog, operation, plan, &mut |_| Ok(())).unwrap();
    cipher
        .insert(
            &tx,
            RECEIPT,
            operation.0,
            &StoredReceipt {
                digest,
                receipt: Receipt {
                    operation,
                    outcome: Outcome::Checkpointed {
                        state: change.clone(),
                    },
                },
            },
        )
        .unwrap();
    tx.commit().unwrap();
    change.source(state.occurrence, 0, state.text.len())
}
#[test]
fn changed_publication_is_exact_and_replays_after_newer_text_and_same_key_reconnect() {
    let (temp, mut ws, initial) = setup();
    let draft = save(
        &mut ws,
        &initial,
        2,
        initial.text.len(),
        initial.text.len(),
        "\r\nNew 😀中\r",
    );
    let frozen = request(&mut ws, &draft);
    let result = ws.temporal_commit(op(3), frozen.clone(), WORK).unwrap();
    let state = ws.open_document(initial.document).unwrap();
    assert_ne!(state.base, initial.base);
    assert_ne!(state.snapshot, initial.snapshot);
    assert_eq!(state.generation, draft.generation + 1);
    assert_eq!(state.text.as_bytes(), draft.text.as_bytes());
    assert_eq!(
        ws.reconstruct_snapshot(initial.document, initial.snapshot)
            .unwrap(),
        initial.text
    );
    let trace = ws
        .temporal_lineage(state.document, state.branch, SAVE_WORK)
        .unwrap();
    assert!(trace.changes.is_empty());
    assert_eq!(trace.base_text, state.text);
    let map = ws.temporal_origins(state.document, state.branch).unwrap();
    assert_eq!(map.publication_order(), Some(1));
    assert_eq!(map.text(), state.text);
    assert!(
        map.runs()
            .first()
            .unwrap()
            .origins
            .iter()
            .all(|o| o.order.is_none())
    );
    assert!(
        map.runs()
            .last()
            .unwrap()
            .origins
            .iter()
            .all(|o| o.order == Some(1))
    );
    let newer = save(&mut ws, &state, 4, 0, 0, "Later\n");
    let next = request(&mut ws, &newer);
    ws.temporal_commit(op(5), next, WORK).unwrap();
    // No public schema3 opener: test-only reconnect retains the existing key.
    ws.db = connect(&temp.db()).unwrap();
    let before = rows(&ws);
    assert_eq!(ws.temporal_commit(op(3), frozen, WORK).unwrap(), result);
    assert_eq!(rows(&ws), before);
    assert_eq!(
        ws.temporal_origins(state.document, state.branch)
            .unwrap()
            .publication_order(),
        Some(2)
    );
    assert!(matches!(
        Workspace::open(&temp.db(), PASS),
        Err(Error::Format)
    ));
}
#[test]
fn unchanged_and_exact_reversion_freeze_only_receipts_without_clock_or_promotion() {
    let (_temp, mut ws, initial) = setup();
    let source = checkpoint(&mut ws, &initial, 2);
    let original = request(&mut ws, &initial);
    let before = rows(&ws);
    let result = ws.temporal_commit(op(3), original.clone(), WORK).unwrap();
    let after = rows(&ws);
    assert_eq!(after.len(), before.len() + 1);
    assert_eq!(
        after
            .iter()
            .filter(|row| row.0 != temporal_commit_record::CANDIDATE_KIND)
            .cloned()
            .collect::<Vec<_>>(),
        before
    );
    assert!(ws.working_source(source).unwrap().promotion.is_none());
    assert_eq!(
        ws.open_document(initial.document).unwrap().base,
        initial.base
    );
    let changed = save(&mut ws, &initial, 4, 0, 0, "temporary");
    let reverted = save(&mut ws, &changed, 5, 0, 9, "");
    assert_eq!(reverted.text, initial.text);
    let reverted_request = request(&mut ws, &reverted);
    assert!(reverted_request.evidence.is_empty());
    ws.temporal_commit(op(6), reverted_request, WORK).unwrap();
    assert_eq!(
        ws.open_document(initial.document).unwrap().generation,
        reverted.generation
    );
    let before = rows(&ws);
    assert_eq!(ws.temporal_commit(op(3), original, WORK).unwrap(), result);
    assert_eq!(rows(&ws), before);
    let cipher = Cipher {
        key: &ws.key,
        workspace: ws.workspace,
    };
    let (generation, _): (_, serde_json::Value) = cipher
        .slot(&ws.db, node_clock::CANDIDATE_KIND, initial.node.0)
        .unwrap();
    assert_eq!(generation, 0);
}
#[test]
fn every_write_fault_rolls_back_and_lost_reply_reconciles_one_order_and_promotion() {
    for phase in [
        "revision",
        "snapshot",
        "event",
        "promotion",
        "head",
        "draft",
        "lineage",
        "origin",
        "clock",
        "receipt",
        "readback",
        "committed",
    ] {
        let (_temp, mut ws, initial) = setup();
        let draft = save(&mut ws, &initial, 2, 0, 0, "Fresh 😀\r\n");
        let source = checkpoint(&mut ws, &draft, 3);
        let frozen = request(&mut ws, &draft);
        let before = rows(&ws);
        assert!(
            matches!(
                ws.temporal_commit_inner(op(4), frozen.clone(), WORK, |stage| if stage == phase {
                    Err(Error::Invalid)
                } else {
                    Ok(())
                }),
                Err(Error::Invalid)
            ),
            "{phase}"
        );
        if phase != "committed" {
            assert_eq!(rows(&ws), before, "{phase}");
            assert!(
                ws.working_source(source.clone())
                    .unwrap()
                    .promotion
                    .is_none()
            );
        }
        let receipt = ws.temporal_commit(op(4), frozen.clone(), WORK).unwrap();
        let after = rows(&ws);
        assert_eq!(ws.temporal_commit(op(4), frozen, WORK).unwrap(), receipt);
        assert_eq!(rows(&ws), after);
        let promoted = ws.working_source(source).unwrap().promotion.unwrap();
        assert_eq!(promoted.operation, op(4));
        assert_eq!(
            ws.temporal_origins(initial.document, initial.branch)
                .unwrap()
                .publication_order(),
            Some(1)
        );
    }
}
#[test]
fn stale_mapping_scope_and_cross_family_intents_never_publish() {
    let (_temp, mut ws, initial) = setup();
    let draft = save(&mut ws, &initial, 2, 0, 0, "New");
    let good = request(&mut ws, &draft);
    for which in 0..9 {
        let mut bad = good.clone();
        match which {
            0 => bad.generation += 1,
            1 => bad.base = RevisionId([99; 32]),
            2 => bad.snapshot = SnapshotId([99; 32]),
            3 => bad.sequence += 1,
            4 => bad.text.push('!'),
            5 => bad.evidence.clear(),
            6 => bad.evidence[0].pieces[0].end_byte += 1,
            7 => bad.document = DocumentId([99; 32]),
            _ => bad.branch = BranchId([99; 32]),
        };
        let before = rows(&ws);
        assert!(ws.temporal_commit(op(3), bad, WORK).is_err(), "{which}");
        assert_eq!(rows(&ws), before, "{which}");
    }
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_commit(op(2), good.clone(), WORK),
        Err(Error::Conflict)
    ));
    assert_eq!(rows(&ws), before);
    ws.temporal_commit(op(3), good.clone(), WORK).unwrap();
    let mut altered = good.clone();
    altered.evidence[0].deletion_mapping = origin_record::Confidence::Unknown;
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_commit(op(3), altered, WORK),
        Err(Error::Conflict)
    ));
    assert_eq!(rows(&ws), before);
    let next = ws.open_document(initial.document).unwrap();
    let conflicting = temporal_save::Save {
        document: next.document,
        branch: next.branch,
        generation: next.generation,
        base: next.base,
        previous_sequence: next.acknowledged_sequence,
        sequence: next.acknowledged_sequence + 1,
        text: next.text.clone(),
        edits: vec![],
    };
    assert!(matches!(
        ws.temporal_save(op(3), conflicting, SAVE_WORK),
        Err(Error::Conflict)
    ));
    assert_eq!(rows(&ws), before);
    ws.owner = PrincipalId([99; 32]);
    assert!(matches!(
        ws.temporal_commit(op(3), good, WORK),
        Err(Error::Integrity)
    ));
    assert_eq!(rows(&ws), before);
}
#[test]
fn required_seed_and_work_limits_fail_closed_and_normal_schema_is_not_opted_in() {
    let temp = Temp::new();
    let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
    let doc = create(&mut ws);
    let initial = ws.open_document(doc).unwrap();
    let req = Request {
        document: doc,
        branch: initial.branch,
        generation: initial.generation,
        base: initial.base,
        snapshot: initial.snapshot,
        sequence: 0,
        text: initial.text.clone(),
        evidence: vec![],
    };
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_commit(op(2), req.clone(), WORK),
        Err(Error::Format)
    ));
    assert_eq!(rows(&ws), before);
    install(&mut ws, &initial);
    let before = rows(&ws);
    for work in [0, 1, 2, 3, WORK + 1] {
        assert!(matches!(
            ws.temporal_commit(op(2), req.clone(), work),
            Err(Error::Limit)
        ));
        assert_eq!(rows(&ws), before);
    }
    ws.db
        .execute(
            "DELETE FROM objects WHERE kind=?1",
            [origin_history::SEED_KIND],
        )
        .unwrap();
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_commit(op(2), req, WORK),
        Err(Error::Integrity)
    ));
    assert_eq!(rows(&ws), before);
}

#[test]
fn separate_branch_heads_share_changed_passage_order_without_touching_other_drafts() {
    let temp = Temp::new();
    let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
    let doc = create(&mut ws);
    let initial = ws.open_document(doc).unwrap();
    let child = match ws
        .execute(op(2), branches::tests::creation(&initial))
        .unwrap()
        .outcome
    {
        Outcome::Branch { state } => state.branch,
        _ => panic!(),
    };
    let original_child = ws.open_branch(doc, child).unwrap();
    install(&mut ws, &initial);
    let first = save(&mut ws, &initial, 3, 0, 0, "Parent\n");
    let frozen = request(&mut ws, &first);
    let receipt = ws.temporal_commit(op(4), frozen.clone(), WORK).unwrap();
    let untouched = ws.open_branch(doc, child).unwrap();
    assert_eq!(untouched.base, original_child.base);
    assert_eq!(untouched.generation, original_child.generation);
    assert_eq!(untouched.text, original_child.text);
    let child_draft = save(&mut ws, &untouched, 5, 0, 0, "Child\n");
    let req = request(&mut ws, &child_draft);
    ws.temporal_commit(op(6), req, WORK).unwrap();
    assert_eq!(
        ws.temporal_origins(doc, initial.branch)
            .unwrap()
            .publication_order(),
        Some(1)
    );
    assert_eq!(
        ws.temporal_origins(doc, child).unwrap().publication_order(),
        Some(2)
    );
    let before = rows(&ws);
    assert_eq!(ws.temporal_commit(op(4), frozen, WORK).unwrap(), receipt);
    assert_eq!(rows(&ws), before);
}

#[test]
fn copied_and_unknown_mapping_evidence_preserve_ages_without_inventing_legacy_order() {
    let (_temp, mut ws, initial) = setup();
    let draft = save(
        &mut ws,
        &initial,
        2,
        initial.text.len(),
        initial.text.len(),
        "Known",
    );
    let req = request(&mut ws, &draft);
    ws.temporal_commit(op(3), req, WORK).unwrap();
    let parent = ws.open_document(initial.document).unwrap();
    let text = format!("!{}?", parent.text);
    let draft = save(&mut ws, &parent, 4, 0, parent.text.len(), &text);
    let mut req = request(&mut ws, &draft);
    assert_eq!(req.evidence.len(), 1);
    req.evidence[0].pieces = vec![
        origin_record::Piece {
            start_byte: 0,
            end_byte: 1,
            source: origin_record::Source::Fresh {},
        },
        origin_record::Piece {
            start_byte: 1,
            end_byte: 1 + parent.text.len(),
            source: origin_record::Source::Copy { base_start: 0 },
        },
        origin_record::Piece {
            start_byte: 1 + parent.text.len(),
            end_byte: text.len(),
            source: origin_record::Source::Unknown {},
        },
    ];
    let result = ws.temporal_commit(op(5), req.clone(), WORK).unwrap();
    let map = ws
        .temporal_origins(initial.document, initial.branch)
        .unwrap();
    assert!(
        map.runs()
            .iter()
            .any(|r| r.origins.iter().any(|o| o.order.is_none()))
    );
    assert!(
        map.runs()
            .iter()
            .any(|r| r.origins.iter().any(|o| o.order == Some(1)))
    );
    assert_eq!(map.runs().first().unwrap().origins[0].order, Some(2));
    assert_eq!(
        map.runs().last().unwrap().mapping,
        hypergraph_domain::parent_merge::Mapping::Unknown
    );
    let before = rows(&ws);
    assert_eq!(ws.temporal_commit(op(5), req, WORK).unwrap(), result);
    assert_eq!(rows(&ws), before);
}

#[test]
fn nonmatching_private_checkpoint_stays_private_and_invalid_origin_replay_fails() {
    let (_temp, mut ws, initial) = setup();
    let source = checkpoint(&mut ws, &initial, 2);
    let draft = save(&mut ws, &initial, 3, 0, 0, "Fresh");
    let frozen = request(&mut ws, &draft);
    ws.temporal_commit(op(4), frozen.clone(), WORK).unwrap();
    assert!(ws.working_source(source).unwrap().promotion.is_none());
    let head = ws.open_document(initial.document).unwrap();
    let cipher = Cipher {
        key: &ws.key,
        workspace: ws.workspace,
    };
    let envelope: Vec<u8> = ws
        .db
        .query_row(
            "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
            params![origin_record::CANDIDATE_KIND, head.base.0.as_slice()],
            |r| r.get(0),
        )
        .unwrap();
    let plain = cipher
        .key
        .open(
            cipher.context(origin_record::CANDIDATE_KIND, head.base.0, 0),
            &envelope,
        )
        .unwrap();
    let mut raw: serde_json::Value = serde_json::from_slice(&plain).unwrap();
    raw["payload"]["changes"][0]["replacement"] = serde_json::json!("wrong");
    let envelope = cipher
        .key
        .seal(
            cipher.context(origin_record::CANDIDATE_KIND, head.base.0, 0),
            &serde_json::to_vec(&raw).unwrap(),
        )
        .unwrap();
    ws.db
        .execute(
            "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
            params![
                envelope,
                origin_record::CANDIDATE_KIND,
                head.base.0.as_slice()
            ],
        )
        .unwrap();
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_commit(op(4), frozen, WORK),
        Err(Error::Integrity)
    ));
    assert_eq!(rows(&ws), before);
}

#[test]
fn exhausted_node_order_allows_noop_but_rejects_changed_text_atomically() {
    let (_temp, mut ws, initial) = setup();
    let draft = save(&mut ws, &initial, 2, 0, 0, "Fresh");
    let req = request(&mut ws, &draft);
    ws.temporal_commit(op(3), req, WORK).unwrap();
    let state = ws.open_document(initial.document).unwrap();
    // Reach the boundary in a fixture, preserving clock/publication bindings.
    let cipher = Cipher {
        key: &ws.key,
        workspace: ws.workspace,
    };
    let tx = ws.db.transaction().unwrap();
    for (kind, id) in [
        (origin_record::CANDIDATE_KIND, state.base.0),
        (temporal_commit_record::CANDIDATE_KIND, op(3).0),
    ] {
        let envelope: Vec<u8> = tx
            .query_row(
                "SELECT envelope FROM objects WHERE kind=?1 AND id=?2",
                params![kind, id.as_slice()],
                |r| r.get(0),
            )
            .unwrap();
        let plain = cipher
            .key
            .open(cipher.context(kind, id, 0), &envelope)
            .unwrap();
        let mut raw: serde_json::Value = serde_json::from_slice(&plain).unwrap();
        if kind == origin_record::CANDIDATE_KIND {
            raw["payload"]["binding"]["order"] = serde_json::json!(node_clock::MAX_ORDER)
        } else {
            raw["payload"]["order"] = serde_json::json!(node_clock::MAX_ORDER)
        }
        let envelope = cipher
            .key
            .seal(
                cipher.context(kind, id, 0),
                &serde_json::to_vec(&raw).unwrap(),
            )
            .unwrap();
        tx.execute(
            "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
            params![envelope, kind, id.as_slice()],
        )
        .unwrap();
    }
    let maximum = serde_json::json!({"record_version":1,"record_kind":35,"payload":{"document":state.document.0,"node":state.node.0,"last_order":node_clock::MAX_ORDER,"last_change":{"revision":state.base.0,"snapshot":state.snapshot.0,"operation":op(3).0}}});
    let envelope = cipher
        .key
        .seal(
            cipher.context(
                node_clock::CANDIDATE_KIND,
                state.node.0,
                node_clock::MAX_ORDER,
            ),
            &serde_json::to_vec(&maximum).unwrap(),
        )
        .unwrap();
    tx.execute(
        "UPDATE slots SET generation=?1,envelope=?2 WHERE kind=?3 AND id=?4",
        params![
            node_clock::MAX_ORDER as i64,
            envelope,
            node_clock::CANDIDATE_KIND,
            state.node.0.as_slice()
        ],
    )
    .unwrap();
    tx.commit().unwrap();
    let no_op = request(&mut ws, &state);
    ws.temporal_commit(op(4), no_op, WORK).unwrap();
    assert_eq!(ws.open_document(state.document).unwrap().base, state.base);
    let draft = save(&mut ws, &state, 5, 0, 0, "More");
    let req = request(&mut ws, &draft);
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_commit(op(6), req, WORK),
        Err(Error::Limit)
    ));
    assert_eq!(rows(&ws), before);
}

// Deliberately test-only loader. It does not change marker3 or add a public opener.
fn open_fixture(path: &Path) -> Workspace {
    let db = connect(path).unwrap();
    let (workspace, wrapper): (Vec<u8>, Vec<u8>) = db
        .query_row(
            "SELECT workspace,wrapper FROM bootstrap WHERE singleton=1",
            [],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .unwrap();
    let workspace = workspace.try_into().unwrap();
    let key = SecretKey::unlock(PASS, workspace, 1, &wrapper).unwrap();
    let ws = Workspace::from_key(path, db, key, workspace).unwrap();
    let cipher = Cipher {
        key: &ws.key,
        workspace: ws.workspace,
    };
    temporal_save::guard(&cipher, &ws.db, &mut READ_BYTES.clone()).unwrap();
    ws
}

#[test]
fn process_exit_at_each_write_preserves_wal_recovery_and_original_operation() {
    let (temp, mut ws, initial) = setup();
    let draft = save(&mut ws, &initial, 2, 0, 0, "Recovered 😀\r\n");
    let source = checkpoint(&mut ws, &draft, 3);
    let frozen = request(&mut ws, &draft);
    let before = rows(&ws);
    drop(ws);
    let baseline = std::fs::read(temp.db()).unwrap();
    for phase in [
        "revision",
        "snapshot",
        "event",
        "promotion",
        "head",
        "draft",
        "lineage",
        "origin",
        "clock",
        "receipt",
        "readback",
        "committed",
    ] {
        let path = temp.db().with_file_name(format!("crash-{phase}.hpx"));
        std::fs::write(&path, &baseline).unwrap();
        let status = std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "temporal_commit::tests::crash_worker",
                "--ignored",
                "--nocapture",
            ])
            .env("HPX_TEMPORAL_TEST_DB", &path)
            .env("HPX_TEMPORAL_TEST_PHASE", phase)
            .status()
            .unwrap();
        assert_eq!(status.code(), Some(86), "{phase}");
        let mut ws = open_fixture(&path);
        let recovered = ws.open_document(initial.document).unwrap();
        assert_eq!(recovered.text, draft.text);
        if phase != "committed" {
            assert_eq!(rows(&ws), before, "{phase}");
            assert_eq!(recovered.base, initial.base)
        } else {
            assert_ne!(recovered.base, initial.base)
        }
        let result = ws.temporal_commit(op(4), frozen.clone(), WORK).unwrap();
        let after = rows(&ws);
        assert_eq!(
            ws.temporal_commit(op(4), frozen.clone(), WORK).unwrap(),
            result
        );
        assert_eq!(rows(&ws), after);
        assert_eq!(
            ws.temporal_origins(initial.document, initial.branch)
                .unwrap()
                .publication_order(),
            Some(1)
        );
        assert_eq!(
            ws.working_source(source.clone())
                .unwrap()
                .promotion
                .unwrap()
                .operation,
            op(4)
        );
    }
}

#[test]
#[ignore = "subprocess fault-injection worker, launched by temporal process-exit test"]
fn crash_worker() {
    let path = std::path::PathBuf::from(std::env::var_os("HPX_TEMPORAL_TEST_DB").unwrap());
    let phase = std::env::var("HPX_TEMPORAL_TEST_PHASE").unwrap();
    let mut ws = open_fixture(&path);
    let doc = ws.list_documents().unwrap()[0].document;
    let state = ws.open_document(doc).unwrap();
    let frozen = request(&mut ws, &state);
    ws.temporal_commit_inner(op(4), frozen, WORK, |at| {
        if at == phase {
            std::process::exit(86)
        }
        Ok(())
    })
    .unwrap();
    panic!("fault checkpoint was not reached");
}

fn copy_fixture(
    ws: &mut Workspace,
    state: &EditorState,
    operation: u8,
    generation: u64,
) -> working_clipboard::Copied {
    let operation = op(operation);
    let plan = working::tests::request(state);
    let command = Command::WorkingCopy {
        plan: plan.clone(),
        generation,
    };
    let digest = Sha256::digest(serde_json::to_vec(&command).unwrap()).into();
    let cipher = Cipher {
        key: &ws.key,
        workspace: ws.workspace,
    };
    let tx = ws.db.transaction().unwrap();
    let catalog = authority::catalog(&cipher, &tx, ws.owner, ws.device).unwrap();
    let checkpoint = working::apply(&cipher, &tx, &catalog, operation, plan.clone(), &mut |_| {
        Ok(())
    })
    .unwrap();
    let copy = working_clipboard::capture(
        &cipher,
        &tx,
        &catalog,
        operation,
        generation,
        checkpoint,
        state.occurrence,
        plan.start_byte,
        plan.end_byte,
        &plan.quote,
    )
    .unwrap();
    cipher
        .insert(
            &tx,
            RECEIPT,
            operation.0,
            &StoredReceipt {
                digest,
                receipt: Receipt {
                    operation,
                    outcome: Outcome::WorkingCopied {
                        state: Box::new(copy.clone()),
                    },
                },
            },
        )
        .unwrap();
    tx.commit().unwrap();
    copy
}

#[test]
fn separate_reference_replacement_retains_originals_and_reconciles_faults_after_publication() {
    for phase in ["references", "receipt", "committed"] {
        let (_temp, mut ws, initial) = setup();
        let draft = save(&mut ws, &initial, 2, 0, 0, "Private 😀\r\n");
        let copy = copy_fixture(&mut ws, &draft, 3, 0);
        let req = request(&mut ws, &draft);
        ws.temporal_commit(op(4), req, WORK).unwrap();
        let published = ws.open_document(initial.document).unwrap();
        let page = ws.working_clipboard_page(None, 0, 16).unwrap();
        assert_eq!(page.generation, 1);
        assert_eq!(page.entries[0].id, copy.entry);
        assert!(matches!(
            page.entries[0].target,
            working_clipboard::Target::Working { .. }
        ));
        let before = rows(&ws);
        assert!(matches!(
            ws.temporal_replace_references_inner(op(5), op(4), 1, |at| if at == phase {
                Err(Error::Invalid)
            } else {
                Ok(())
            }),
            Err(Error::Invalid)
        ));
        if phase != "committed" {
            assert_eq!(rows(&ws), before, "{phase}")
        }
        assert_eq!(
            ws.open_document(initial.document).unwrap().base,
            published.base
        );
        let result = ws.temporal_replace_references(op(5), op(4), 1).unwrap();
        let page = ws.working_clipboard_page(None, 0, 16).unwrap();
        assert_eq!(page.generation, 2);
        assert_eq!(page.total, 1);
        assert_ne!(page.entries[0].id, copy.entry);
        let working_clipboard::Target::Committed {
            source,
            previous,
            promotion,
        } = &page.entries[0].target
        else {
            panic!()
        };
        assert_eq!(*previous, copy.entry);
        assert_eq!(promotion.operation, op(4));
        assert_eq!(source.snapshot, published.snapshot);
        assert_eq!(source.revision, published.base);
        assert!(matches!(
            ws.working_reference(copy.entry).unwrap().target,
            working_clipboard::Target::Working { .. }
        ));
        assert_eq!(ws.working_source(copy.source).unwrap().text, draft.text);
        // No still-private matching entries: a new exact batch records no index change.
        let after = rows(&ws);
        ws.temporal_replace_references(op(6), op(4), 2).unwrap();
        assert_eq!(
            ws.working_clipboard_page(None, 0, 16).unwrap().generation,
            2
        );
        assert_eq!(rows(&ws).len(), after.len() + 1);
        // A later index change does not make an original frozen retry publish again.
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let tx = ws.db.transaction().unwrap();
        let catalog = authority::catalog(&cipher, &tx, ws.owner, ws.device).unwrap();
        working_clipboard::apply(
            &cipher,
            &tx,
            &catalog,
            working_clipboard::Mutation::Clear { generation: 2 },
        )
        .unwrap();
        tx.commit().unwrap();
        let before = rows(&ws);
        assert_eq!(
            ws.temporal_replace_references(op(5), op(4), 1).unwrap(),
            result
        );
        assert_eq!(rows(&ws), before);
        assert_eq!(ws.working_clipboard_page(None, 0, 16).unwrap().total, 0);
    }
}

#[test]
fn replacement_rejects_stale_cross_family_noop_and_current_authority_without_writes() {
    let (_temp, mut ws, initial) = setup();
    let draft = save(&mut ws, &initial, 2, 0, 0, "Fresh");
    copy_fixture(&mut ws, &draft, 3, 0);
    let req = request(&mut ws, &draft);
    ws.temporal_commit(op(4), req, WORK).unwrap();
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_replace_references(op(5), op(4), 0),
        Err(Error::Conflict)
    ));
    assert_eq!(rows(&ws), before);
    for used in [2, 3, 4] {
        assert!(matches!(
            ws.temporal_replace_references(op(used), op(4), 1),
            Err(Error::Conflict)
        ));
        assert_eq!(rows(&ws), before);
    }
    let result = ws.temporal_replace_references(op(5), op(4), 1).unwrap();
    let state = ws.open_document(initial.document).unwrap();
    let noop = request(&mut ws, &state);
    ws.temporal_commit(op(6), noop, WORK).unwrap();
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_replace_references(op(7), op(6), 2),
        Err(Error::Invalid)
    ));
    assert_eq!(rows(&ws), before);
    let newer = save(&mut ws, &state, 7, 0, 0, "Later");
    let req = request(&mut ws, &newer);
    ws.temporal_commit(op(8), req, WORK).unwrap();
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_replace_references(op(5), op(8), 1),
        Err(Error::Conflict)
    ));
    assert_eq!(rows(&ws), before);
    assert_eq!(
        ws.temporal_replace_references(op(5), op(4), 1).unwrap(),
        result
    );
    let cipher = Cipher {
        key: &ws.key,
        workspace: ws.workspace,
    };
    let (generation, mut catalog): (_, Catalog) = cipher.slot(&ws.db, CATALOG, ROOT).unwrap();
    catalog.documents.clear();
    cipher
        .update(&ws.db, CATALOG, ROOT, generation, &catalog)
        .unwrap();
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_replace_references(op(5), op(4), 1),
        Err(Error::NotFound)
    ));
    assert_eq!(rows(&ws), before);
}

#[test]
fn reference_batch_process_exit_never_undoes_acknowledged_text_or_rewrites_originals() {
    let (temp, mut ws, initial) = setup();
    let draft = save(&mut ws, &initial, 2, 0, 0, "Private 😀");
    let copy = copy_fixture(&mut ws, &draft, 3, 0);
    let req = request(&mut ws, &draft);
    ws.temporal_commit(op(4), req, WORK).unwrap();
    let published = ws.open_document(initial.document).unwrap();
    let before = rows(&ws);
    drop(ws);
    let baseline = std::fs::read(temp.db()).unwrap();
    for phase in ["references", "receipt", "committed"] {
        let path = temp.db().with_file_name(format!("reference-{phase}.hpx"));
        std::fs::write(&path, &baseline).unwrap();
        let status = std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "temporal_commit::tests::reference_crash_worker",
                "--ignored",
                "--nocapture",
            ])
            .env("HPX_TEMPORAL_TEST_DB", &path)
            .env("HPX_TEMPORAL_TEST_PHASE", phase)
            .status()
            .unwrap();
        assert_eq!(status.code(), Some(86));
        let mut ws = open_fixture(&path);
        assert_eq!(
            ws.open_document(initial.document).unwrap().base,
            published.base
        );
        if phase != "committed" {
            assert_eq!(rows(&ws), before)
        }
        let receipt = ws.temporal_replace_references(op(5), op(4), 1).unwrap();
        let after = rows(&ws);
        assert_eq!(
            ws.temporal_replace_references(op(5), op(4), 1).unwrap(),
            receipt
        );
        assert_eq!(rows(&ws), after);
        assert_eq!(
            ws.working_clipboard_page(None, 0, 16).unwrap().generation,
            2
        );
        assert!(matches!(
            ws.working_reference(copy.entry).unwrap().target,
            working_clipboard::Target::Working { .. }
        ));
    }
}

#[test]
#[ignore = "subprocess worker, launched by reference batch process-exit test"]
fn reference_crash_worker() {
    let path = std::path::PathBuf::from(std::env::var_os("HPX_TEMPORAL_TEST_DB").unwrap());
    let phase = std::env::var("HPX_TEMPORAL_TEST_PHASE").unwrap();
    let mut ws = open_fixture(&path);
    ws.temporal_replace_references_inner(op(5), op(4), 1, |at| {
        if at == phase {
            std::process::exit(86)
        }
        Ok(())
    })
    .unwrap();
    panic!("fault checkpoint was not reached");
}

#[test]
fn full_raw_source_capacity_survives_successive_json_escaped_publications() {
    let (_temp, mut ws, initial) = setup();
    let text = "\0".repeat(MAX_TEXT_BYTES);
    let draft = save(&mut ws, &initial, 2, 0, initial.text.len(), &text);
    let req = request(&mut ws, &draft);
    ws.temporal_commit(op(3), req, WORK).unwrap();
    let state = ws.open_document(initial.document).unwrap();
    assert_eq!(state.text, text);
    let text = "\u{1}".repeat(MAX_TEXT_BYTES);
    let draft = save(&mut ws, &state, 4, 0, state.text.len(), &text);
    let req = request(&mut ws, &draft);
    let receipt = ws.temporal_commit(op(5), req.clone(), WORK).unwrap();
    let state = ws.open_document(initial.document).unwrap();
    assert_eq!(state.text, text);
    assert_eq!(
        ws.temporal_origins(state.document, state.branch)
            .unwrap()
            .text(),
        text
    );
    let before = rows(&ws);
    assert_eq!(ws.temporal_commit(op(5), req, WORK).unwrap(), receipt);
    assert_eq!(rows(&ws), before);
}

#[test]
fn publication_reserves_the_last_history_slot_and_never_creates_an_unreadable_head() {
    let (_temp, mut ws, initial) = setup();
    let mut state = initial;
    let mut first = None;
    for order in 1..RECORDS {
        let draft = save(
            &mut ws,
            &state,
            (2 * order) as u8,
            state.text.len(),
            state.text.len(),
            "x",
        );
        let req = request(&mut ws, &draft);
        let receipt = ws
            .temporal_commit(op((2 * order + 1) as u8), req.clone(), WORK)
            .unwrap();
        if order == 1 {
            first = Some((req, receipt))
        }
        state = ws.open_document(state.document).unwrap();
    }
    assert_eq!(
        ws.temporal_origins(state.document, state.branch)
            .unwrap()
            .publication_order(),
        Some((RECORDS - 1) as u64)
    );
    let draft = save(
        &mut ws,
        &state,
        128,
        state.text.len(),
        state.text.len(),
        "overflow",
    );
    let req = request(&mut ws, &draft);
    let before = rows(&ws);
    assert!(matches!(
        ws.temporal_commit(op(129), req, WORK),
        Err(Error::Limit)
    ));
    assert_eq!(rows(&ws), before);
    assert_eq!(ws.open_document(state.document).unwrap().base, state.base);
    let reverted = save(&mut ws, &draft, 130, state.text.len(), draft.text.len(), "");
    let noop = request(&mut ws, &reverted);
    ws.temporal_commit(op(131), noop, WORK).unwrap();
    assert_eq!(ws.open_document(state.document).unwrap().base, state.base);
    let (req, receipt) = first.unwrap();
    let before = rows(&ws);
    assert_eq!(ws.temporal_commit(op(3), req, WORK).unwrap(), receipt);
    assert_eq!(rows(&ws), before);
}
