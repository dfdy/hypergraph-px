// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Private historical source clipboard
//!
//! Keeps bounded owner-private references to exact historical source ranges.
//! Capture validates source and optional current draft context without
//! publishing text.
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
//! Used by: Workspace clipboard commands, retrospective
//! comment/assertion/synthesis source adapters and browser clipboard
//! paging.
//!
//! Specification:
//! - [Storage responsibilities][spec0]
//! - [Provenance and working-source definitions][spec1]
//! - [Navigation contract][spec2]
//!
//! Boundary: Current catalogue-owner scope is implementation evidence, not
//! full product permissions. Cached previews are withheld when source
//! cannot currently be resolved; captures do not create content revisions.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/clipboard.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/shared-responsibilities.c4
//! [spec1]: ../../../../docs/05-domain/diagrams/provenance-working.c4
//! [spec2]: ../../../../docs/06-subsystems/interfaces/domain-navigation.md

use super::*;
pub const KIND: i32 = 10;
pub const MAX_ENTRIES: usize = 128;
const MAX_PREVIEW: usize = 120;
const MAX_PAGE: usize = 16;
const JS_MAX: u64 = 9_007_199_254_740_991;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct EntryId(pub [u8; 32]);
impl encoding::Identity for EntryId {
    /// Expose the exact private entry identity for strict record encoding.
    fn bytes(&self) -> [u8; 32] {
        self.0
    }

    /// Reconstruct an entry identity without changing its stored bytes.
    fn from_bytes(bytes: [u8; 32]) -> Self {
        Self(bytes)
    }
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Source {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    #[serde(with = "encoding::identities")]
    pub occurrence_path: Vec<OccurrenceId>,
    pub start_byte: usize,
    pub end_byte: usize,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DraftContext {
    pub generation: u64,
    pub sequence: u64,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case", deny_unknown_fields)]
pub enum Mutation {
    Capture {
        generation: u64,
        source: Source,
        expected_draft: Option<DraftContext>,
        quote: String,
    },
    Remove {
        generation: u64,
        #[serde(with = "encoding::identity")]
        entry: EntryId,
    },
    Clear {
        generation: u64,
    },
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Entry {
    #[serde(with = "encoding::identity")]
    pub id: EntryId,
    pub source: Source,
    pub preview: String,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct PrivateState {
    #[serde(with = "encoding::identity")]
    owner: PrincipalId,
    entries: Vec<Entry>,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Change {
    pub generation: u64,
    #[serde(with = "encoding::optional_identity")]
    pub entry: Option<EntryId>,
    pub count: usize,
}
#[derive(Serialize)]
pub struct EntryView {
    #[serde(with = "encoding::identity")]
    pub id: EntryId,
    pub available: bool,
    pub source: Option<Source>,
    pub preview: Option<String>,
}
#[derive(Serialize)]
pub struct Page {
    pub generation: u64,
    pub total: usize,
    pub entries: Vec<EntryView>,
    pub next: Option<usize>,
}

/// Separate each owner private clipboard slot with a domain-specific hash.
fn slot(owner: PrincipalId) -> [u8; 32] {
    let mut hash = Sha256::new();
    hash.update(b"hpx/private-clipboard/v1\0");
    hash.update(owner.0);
    hash.finalize().into()
}

/// Check cached principal/device against the authenticated current catalogue.
fn authorize(
    cipher: &Cipher<'_>,
    db: &Connection,
    owner: PrincipalId,
    device: DeviceId,
) -> Result<Catalog> {
    let (_, catalog): (_, Catalog) = cipher.slot(db, CATALOG, ROOT)?;
    if catalog.owner != owner || catalog.device != device {
        return Err(Error::Integrity);
    }
    Ok(catalog)
}

/// Load bounded private entries, rejecting inconsistent identities or malformed cached ranges.
fn load(
    cipher: &Cipher<'_>,
    db: &Connection,
    owner: PrincipalId,
) -> Result<(bool, u64, PrivateState)> {
    match cipher.slot::<PrivateState>(db, KIND, slot(owner)) {
        Ok((generation, state)) => {
            if state.owner != owner || generation > JS_MAX || state.entries.len() > MAX_ENTRIES {
                return Err(Error::Integrity);
            }
            let mut ids = std::collections::BTreeSet::new();
            for entry in &state.entries {
                if !ids.insert(entry.id.0)
                    || entry.preview.chars().count() > MAX_PREVIEW
                    || entry.source.start_byte >= entry.source.end_byte
                    || entry.source.end_byte > MAX_TEXT_BYTES
                    || entry.source.occurrence_path.len() != 1
                {
                    return Err(Error::Integrity);
                }
            }
            Ok((true, generation, state))
        }
        Err(Error::NotFound) => Ok((
            false,
            0,
            PrivateState {
                owner,
                entries: vec![],
            },
        )),
        Err(error) => Err(error),
    }
}

/// Validate mutation shape and leave room for a browser-safe next generation.
pub(super) fn validate(mutation: &Mutation) -> Result<()> {
    let generation = match mutation {
        Mutation::Capture {
            generation,
            source,
            expected_draft,
            quote,
        } => {
            validate_capture(source, expected_draft.as_ref(), quote)?;
            *generation
        }
        Mutation::Remove { generation, .. } | Mutation::Clear { generation } => *generation,
    };
    if generation >= JS_MAX {
        return Err(Error::Limit);
    }
    Ok(())
}

/// Reject empty/oversized captures and unsafe optional draft counters.
pub(super) fn validate_capture(
    source: &Source,
    expected: Option<&DraftContext>,
    quote: &str,
) -> Result<()> {
    if quote.is_empty()
        || quote.len() > MAX_TEXT_BYTES
        || source.start_byte >= source.end_byte
        || source.end_byte > MAX_TEXT_BYTES
        || source.occurrence_path.len() != 1
    {
        return Err(Error::Invalid);
    }
    // The predicate checks both browser-visible counters before source access.
    if expected.is_some_and(|d| d.generation > JS_MAX || d.sequence > JS_MAX) {
        return Err(Error::Limit);
    }
    Ok(())
}

/// Resolve authorized immutable source and validate exact UTF8 scalar-boundary offsets.
pub(super) fn resolve_source(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    source: &Source,
) -> Result<(Document, Revision)> {
    if !catalog.documents.contains(&source.document) {
        return Err(Error::NotFound);
    }
    let doc: Document = cipher.object(db, DOCUMENT, source.document.0)?;
    if doc.id != source.document
        || doc.node != source.node
        || source.occurrence_path != [doc.occurrence]
    {
        return Err(Error::Invalid);
    }
    if snapshot_revision(cipher, db, &doc, source.snapshot)? != source.revision {
        return Err(Error::Conflict);
    }
    let revision: Revision = cipher.object(db, REVISION, source.revision.0)?;
    if revision.node != source.node {
        return Err(Error::Integrity);
    }
    if revision.text.len() > MAX_TEXT_BYTES {
        return Err(Error::Limit);
    }
    // The mapping callback treats a split scalar or invalid byte interval as bad input.
    validate_byte_range(&revision.text, source.start_byte, source.end_byte)
        .map_err(|_| Error::Invalid)?;
    Ok((doc, revision))
}
/// Require exact quoted source and, when supplied, the unchanged acknowledged editor context.
#[allow(clippy::too_many_arguments)]
pub(super) fn capture_source(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    owner: PrincipalId,
    device: DeviceId,
    source: &Source,
    expected: Option<&DraftContext>,
    quote: &str,
) -> Result<(Document, Revision)> {
    validate_capture(source, expected, quote)?;
    let (doc, revision) = resolve_source(cipher, db, catalog, source)?;
    if revision.text[source.start_byte..source.end_byte] != *quote {
        return Err(Error::Conflict);
    }
    if let Some(expected) = expected {
        let (_, head): (_, Head) = cipher.slot(db, HEAD, doc.branch.0)?;
        let (generation, draft): (_, Draft) = cipher.slot(db, DRAFT, doc.draft.0)?;
        check_draft(&doc, &head, &draft, owner, device)?;
        if generation != expected.generation
            || draft.sequence != expected.sequence
            || draft.base != source.revision
            || head.snapshot != source.snapshot
            || draft.text != revision.text
        {
            return Err(Error::Conflict);
        }
    }
    Ok((doc, revision))
}

/// Apply one generation-checked private capture/remove/clear without altering source history.
pub(super) fn apply(
    cipher: &Cipher<'_>,
    db: &Connection,
    owner: PrincipalId,
    device: DeviceId,
    mutation: Mutation,
) -> Result<Change> {
    let catalog = authorize(cipher, db, owner, device)?;
    let (exists, actual, mut state) = load(cipher, db, owner)?;
    let expected = match &mutation {
        Mutation::Capture { generation, .. }
        | Mutation::Remove { generation, .. }
        | Mutation::Clear { generation } => *generation,
    };
    if actual != expected {
        return Err(Error::Conflict);
    }
    let mut selected = None;
    let mut changed = true;
    match mutation {
        Mutation::Capture {
            source,
            expected_draft,
            quote,
            ..
        } => {
            let (_, revision) = capture_source(
                cipher,
                db,
                &catalog,
                owner,
                device,
                &source,
                expected_draft.as_ref(),
                &quote,
            )?;
            let text = &revision.text[source.start_byte..source.end_byte];
            // Reuse the exact binding rather than inserting a duplicate private entry.
            if let Some(prior) = state.entries.iter().find(|entry| entry.source == source) {
                selected = Some(prior.id);
                changed = false;
            } else {
                if state.entries.len() >= MAX_ENTRIES {
                    return Err(Error::Limit);
                }
                let id = EntryId(new_id()?);
                selected = Some(id);
                state.entries.push(Entry {
                    id,
                    source,
                    preview: text.chars().take(MAX_PREVIEW).collect(),
                });
            }
        }
        Mutation::Remove { entry, .. } => {
            let before = state.entries.len();
            // Preserve every entry except the specifically selected private identity.
            state.entries.retain(|item| item.id != entry);
            if state.entries.len() == before {
                return Err(Error::NotFound);
            }
        }
        Mutation::Clear { .. } => {
            changed = !state.entries.is_empty();
            state.entries.clear();
        }
    }
    let generation = if changed {
        if exists {
            cipher.update(db, KIND, slot(owner), actual, &state)?
        } else {
            // The absent empty state is generation zero; the first mutation advances it.
            let envelope = cipher.seal(KIND, slot(owner), 1, &state)?;
            db.execute(
                "INSERT INTO slots(kind,id,generation,envelope) VALUES(?1,?2,1,?3)",
                params![KIND, slot(owner).as_slice(), envelope],
            )?;
            1
        }
    } else {
        actual
    };
    Ok(Change {
        generation,
        entry: selected,
        count: state.entries.len(),
    })
}

impl Workspace {
    /// Page a stable private generation and reveal previews only for currently resolvable source.
    pub fn clipboard_page(
        &mut self,
        generation: Option<u64>,
        offset: usize,
        limit: usize,
    ) -> Result<Page> {
        if !(1..=MAX_PAGE).contains(&limit)
            || offset > MAX_ENTRIES
            || (offset > 0 && generation.is_none())
        {
            return Err(Error::Invalid);
        }
        let tx = self.db.transaction()?;
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let catalog = authorize(&cipher, &tx, self.owner, self.device)?;
        let (_, actual, state) = load(&cipher, &tx, self.owner)?;
        // Bind continuation to the same private-state generation.
        if generation.is_some_and(|expected| expected != actual) {
            return Err(Error::Conflict);
        }
        if offset > state.entries.len() {
            return Err(Error::Invalid);
        }
        let entries = state.entries[offset..]
            .iter()
            .take(limit)
            // Re-resolve each source before exposing a cached preview; retain removable identity otherwise.
            .map(|entry| {
                let available = match resolve_source(&cipher, &tx, &catalog, &entry.source) {
                    Ok((_, revision)) => {
                        revision.text[entry.source.start_byte..entry.source.end_byte]
                            .chars()
                            .take(MAX_PREVIEW)
                            .collect::<String>()
                            == entry.preview
                    }
                    Err(error @ (Error::Database | Error::Io)) => return Err(error),
                    Err(_) => false,
                };
                if available {
                    Ok(EntryView {
                        id: entry.id,
                        available: true,
                        source: Some(entry.source.clone()),
                        preview: Some(entry.preview.clone()),
                    })
                } else {
                    // An owned reference can be removed without disclosing an inaccessible source.
                    Ok(EntryView {
                        id: entry.id,
                        available: false,
                        source: None,
                        preview: None,
                    })
                }
            })
            .collect::<Result<Vec<_>>>()?;
        let next = offset + entries.len();
        let page = Page {
            generation: actual,
            total: state.entries.len(),
            entries,
            next: (next < state.entries.len()).then_some(next),
        };
        tx.commit()?;
        Ok(page)
    }
}

#[cfg(test)]
pub(super) mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};
    /// Capture complete committed fixture text with its exact acknowledged editor context.
    pub(crate) fn capture(editor: &EditorState, generation: u64) -> Command {
        Command::Clipboard {
            mutation: Mutation::Capture {
                generation,
                source: Source {
                    document: editor.document,
                    node: editor.node,
                    snapshot: editor.snapshot,
                    revision: editor.base,
                    occurrence_path: vec![editor.occurrence],
                    start_byte: 0,
                    end_byte: editor.text.len(),
                },
                expected_draft: Some(DraftContext {
                    generation: editor.generation,
                    sequence: editor.acknowledged_sequence,
                }),
                quote: editor.text.clone(),
            },
        }
    }

    /// Extract the private-state result from a successful command receipt.
    fn change(receipt: Receipt) -> Change {
        match receipt.outcome {
            Outcome::Clipboard { state } => state,
            _ => panic!(),
        }
    }

    /// Count retained content records so private mutations cannot silently publish history.
    fn immutable_counts(db: &Connection) -> Vec<(i32, i64)> {
        let mut s=db.prepare("SELECT kind,count(*) FROM objects WHERE kind IN(3,4,5,9) GROUP BY kind ORDER BY kind").unwrap();
        // The SQL callback reads kind/count pairs without decrypting source content.
        s.query_map([], |r| Ok((r.get(0)?, r.get(1)?)))
            .unwrap()
            // Surface any failed count row as a fixture failure.
            .map(|r| r.unwrap())
            .collect()
    }

    /// Verify durable private captures, deduplication and clear preserve content history and exact source.
    #[test]
    fn capture_retries_restart_dedup_and_clear_preserve_source_and_immutable_history() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let editor = ws.open_document(doc).unwrap();
        assert_eq!(ws.clipboard_page(None, 0, 16).unwrap().generation, 0);
        let counts = immutable_counts(&ws.db);
        let command = capture(&editor, 0);
        let receipt = ws.execute(op(2), command.clone()).unwrap();
        let captured = change(receipt.clone());
        assert_eq!(captured.generation, 1);
        assert_eq!(captured.count, 1);
        assert!(captured.entry.is_some());
        for path in [
            temp.db(),
            std::path::PathBuf::from(format!("{}-wal", temp.db().display())),
            std::path::PathBuf::from(format!("{}-shm", temp.db().display())),
        ] {
            if let Ok(bytes) = std::fs::read(path) {
                assert!(
                    !bytes
                        .windows(editor.text.len())
                        // Detect any exact plaintext source window in SQLite-related files.
                        .any(|part| part == editor.text.as_bytes())
                );
            }
        }
        assert_eq!(ws.execute(op(2), command.clone()).unwrap(), receipt);
        assert_eq!(immutable_counts(&ws.db), counts);
        assert_eq!(ws.open_document(doc).unwrap().generation, editor.generation);
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        assert_eq!(ws.execute(op(2), command).unwrap(), receipt);
        let page = ws.clipboard_page(Some(1), 0, 16).unwrap();
        assert_eq!(
            page.entries[0].preview.as_deref(),
            Some(editor.text.as_str())
        );
        assert_eq!(page.entries[0].id, captured.entry.unwrap());
        let dedup = change(ws.execute(op(3), capture(&editor, 1)).unwrap());
        assert_eq!(dedup, captured);
        let cleared = change(
            ws.execute(
                op(4),
                Command::Clipboard {
                    mutation: Mutation::Clear { generation: 1 },
                },
            )
            .unwrap(),
        );
        assert_eq!(cleared.count, 0);
        assert_eq!(cleared.generation, 2);
        assert_eq!(immutable_counts(&ws.db), counts);
        assert_eq!(
            ws.reconstruct_snapshot(doc, editor.snapshot).unwrap(),
            editor.text
        );
        assert!(
            ws.clipboard_page(Some(2), 0, 16)
                .unwrap()
                .entries
                .is_empty()
        );
    }

    /// Distinguish unchanged editor capture from independently valid immutable historical capture.
    #[test]
    fn editor_capture_rejects_uncommitted_and_stale_ranges_but_historical_capture_stays_exact() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let editor = ws.open_document(doc).unwrap();
        ws.execute(op(2), save(&editor, "Different draft")).unwrap();
        let changed = ws.open_document(doc).unwrap();
        assert!(matches!(
            ws.execute(op(3), capture(&changed, 0)),
            Err(Error::Conflict) | Err(Error::Invalid)
        ));
        assert!(matches!(
            ws.execute(op(4), capture(&editor, 0)),
            Err(Error::Conflict)
        ));
        assert_eq!(ws.clipboard_page(None, 0, 16).unwrap().total, 0);
        let mut historical = capture(&editor, 0);
        if let Command::Clipboard {
            mutation: Mutation::Capture { expected_draft, .. },
        } = &mut historical
        {
            *expected_draft = None;
        }
        let result = change(ws.execute(op(5), historical).unwrap());
        assert_eq!(result.generation, 1);
        ws.execute(op(6), commit(&changed)).unwrap();
        assert_eq!(
            ws.clipboard_page(None, 0, 16).unwrap().entries[0]
                .preview
                .as_deref(),
            Some(editor.text.as_str())
        );
    }

    /// Reject stale generations and operation reuse while replaying original removal receipts.
    #[test]
    fn generations_and_receipts_prevent_cross_context_removal_or_silent_reordering() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let editor = ws.open_document(doc).unwrap();
        let captured = change(ws.execute(op(2), capture(&editor, 0)).unwrap());
        assert!(matches!(
            ws.execute(
                op(3),
                Command::Clipboard {
                    mutation: Mutation::Clear { generation: 0 }
                }
            ),
            Err(Error::Conflict)
        ));
        assert!(matches!(
            ws.clipboard_page(Some(0), 0, 16),
            Err(Error::Conflict)
        ));
        let command = Command::Clipboard {
            mutation: Mutation::Remove {
                generation: 1,
                entry: captured.entry.unwrap(),
            },
        };
        let removed = ws.execute(op(4), command.clone()).unwrap();
        assert_eq!(change(removed.clone()).generation, 2);
        assert_eq!(ws.execute(op(4), command).unwrap(), removed);
        assert!(matches!(
            ws.execute(
                op(4),
                Command::Clipboard {
                    mutation: Mutation::Clear { generation: 2 }
                }
            ),
            Err(Error::Conflict)
        ));
        assert_eq!(ws.clipboard_page(None, 0, 16).unwrap().total, 0);
    }

    /// Exercise rollback and uncertain post-commit retry across reopening without duplicate entries.
    #[test]
    fn faults_roll_back_private_state_and_unknown_commit_reply_reconciles_exactly() {
        for phase in ["objects", "heads", "receipt", "committed"] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let doc = create(&mut ws);
            let editor = ws.open_document(doc).unwrap();
            let command = capture(&editor, 0);
            assert!(matches!(
                // Fail the selected write stage, including a lost reply after commit.
                ws.execute_inner(op(2), command.clone(), |point| if point == phase {
                    Err(Error::Io)
                } else {
                    Ok(())
                }),
                Err(Error::Io)
            ));
            let expected = usize::from(phase == "committed");
            assert_eq!(ws.clipboard_page(None, 0, 16).unwrap().total, expected);
            drop(ws);
            let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
            let result = change(ws.execute(op(2), command).unwrap());
            assert_eq!(result.count, 1);
            assert_eq!(result.generation, 1);
        }
    }

    /// Reject drift in identity, occurrence, scalar cut and quoted source before private mutation.
    #[test]
    fn exact_bindings_scalar_boundaries_and_quote_prevent_cross_scope_copy() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let editor = ws.open_document(doc).unwrap();
        for fault in ["node", "revision", "path", "scalar", "quote"] {
            let mut command = capture(&editor, 0);
            if let Command::Clipboard {
                mutation: Mutation::Capture { source, quote, .. },
            } = &mut command
            {
                match fault {
                    "node" => source.node = NodeId([9; 32]),
                    "revision" => source.revision = RevisionId([9; 32]),
                    "path" => source.occurrence_path[0] = OccurrenceId([9; 32]),
                    "scalar" => source.start_byte = editor.text.find('😀').unwrap() + 1,
                    _ => *quote = "Different".into(),
                }
            }
            assert!(ws.execute(op(2), command).is_err(), "{fault}");
            assert_eq!(ws.clipboard_page(None, 0, 16).unwrap().total, 0);
        }
    }

    /// Withhold inaccessible cached source and reject unsupported private-record wrappers.
    #[test]
    fn private_record_versions_and_missing_source_fail_closed_without_cached_preview_disclosure() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let editor = ws.open_document(doc).unwrap();
        ws.execute(op(2), capture(&editor, 0)).unwrap();
        ws.db
            .execute(
                "DELETE FROM objects WHERE kind=?1 AND id=?2",
                params![SNAPSHOT, editor.snapshot.0.as_slice()],
            )
            .unwrap();
        let page = ws.clipboard_page(None, 0, 16).unwrap();
        assert!(!page.entries[0].available);
        assert!(page.entries[0].preview.is_none());
        assert!(page.entries[0].source.is_none());
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let (_, generation, state) = load(&cipher, &ws.db, ws.owner).unwrap();
        let record = serde_json::json!({"record_version":2,"record_kind":KIND,"payload":state});
        let envelope = ws
            .key
            .seal(
                cipher.context(KIND, slot(ws.owner), generation),
                &serde_json::to_vec(&record).unwrap(),
            )
            .unwrap();
        ws.db
            .execute(
                "UPDATE slots SET envelope=?1 WHERE kind=?2",
                params![envelope, KIND],
            )
            .unwrap();
        assert!(matches!(
            ws.execute(
                op(3),
                Command::Clipboard {
                    mutation: Mutation::Clear { generation: 1 }
                }
            ),
            Err(Error::Format)
        ));
    }

    /// Enforce capture quota atomically and invalidate continuation after private generation changes.
    #[test]
    fn capture_quota_rejects_atomically_and_page_cursors_bind_private_generation() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = match ws
            .execute(
                op(1),
                Command::Create {
                    title: "Synthetic".into(),
                    text: "x".repeat(200),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let editor = ws.open_document(doc).unwrap();
        for i in 0..MAX_ENTRIES {
            let mut command = capture(&editor, i as u64);
            if let Command::Clipboard {
                mutation: Mutation::Capture { source, quote, .. },
            } = &mut command
            {
                source.start_byte = i;
                source.end_byte = i + 1;
                *quote = "x".into();
            }
            assert_eq!(
                change(ws.execute(op(2 + i as u8), command).unwrap()).count,
                i + 1
            );
        }
        let page = ws.clipboard_page(Some(MAX_ENTRIES as u64), 0, 16).unwrap();
        assert_eq!(page.entries.len(), 16);
        assert_eq!(page.next, Some(16));
        assert_eq!(page.total, MAX_ENTRIES);
        let mut overflow = capture(&editor, MAX_ENTRIES as u64);
        if let Command::Clipboard {
            mutation: Mutation::Capture { source, quote, .. },
        } = &mut overflow
        {
            source.start_byte = MAX_ENTRIES;
            source.end_byte = MAX_ENTRIES + 1;
            *quote = "x".into();
        }
        assert!(matches!(ws.execute(op(200), overflow), Err(Error::Limit)));
        assert!(matches!(ws.receipt(op(200)), Err(Error::NotFound)));
        assert_eq!(ws.clipboard_page(None, 0, 16).unwrap().total, MAX_ENTRIES);
        ws.execute(
            op(201),
            Command::Clipboard {
                mutation: Mutation::Clear {
                    generation: MAX_ENTRIES as u64,
                },
            },
        )
        .unwrap();
        assert!(matches!(
            ws.clipboard_page(Some(MAX_ENTRIES as u64), 16, 16),
            Err(Error::Conflict)
        ));
        assert_eq!(
            ws.reconstruct_snapshot(doc, editor.snapshot).unwrap(),
            editor.text
        );
    }

    /// Prevent cross-workspace capture and reject stale cached principal authority.
    #[test]
    fn private_capture_cannot_cross_workspace_or_cached_principal_authority() {
        let a = Temp::new();
        let b = Temp::new();
        let mut first = Workspace::create(&a.db(), PASS, "First").unwrap();
        let mut second = Workspace::create(&b.db(), PASS, "Second").unwrap();
        let doc = create(&mut first);
        let editor = first.open_document(doc).unwrap();
        assert!(matches!(
            second.execute(op(2), capture(&editor, 0)),
            Err(Error::NotFound)
        ));
        assert_eq!(second.clipboard_page(None, 0, 16).unwrap().total, 0);
        let owner = first.owner;
        first.owner = PrincipalId([9; 32]);
        assert!(matches!(
            first.execute(op(2), capture(&editor, 0)),
            Err(Error::Integrity)
        ));
        assert!(matches!(
            first.clipboard_page(None, 0, 16),
            Err(Error::Integrity)
        ));
        first.owner = owner;
        first.execute(op(2), capture(&editor, 0)).unwrap();
        assert_eq!(first.clipboard_page(None, 0, 16).unwrap().total, 1);
        assert_eq!(second.clipboard_page(None, 0, 16).unwrap().total, 0);
    }
}
