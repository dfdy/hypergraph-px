// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Private retained working-source references
//!
//! Captures private references to exact acknowledged checkpoints and explicitly
//! replaces eligible live references after publication while retaining
//! their originals.
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
//! Used by: Workspace WorkingCopy/working-clipboard commands, browser
//! reference reads and storage tests.
//!
//! Specification:
//! - [Working-source definitions][spec0]
//! - [Storage responsibilities][spec1]
//! - [Working-source boundary][spec2]
//!
//! Boundary: Replacement is a separately acknowledged private mutation, not
//! automatic Commit side effect or cross-identity ancestry. Current bounded
//! owner-private state is not a general multi-user authority mechanism.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/working_clipboard.rs
//! [spec0]: ../../../../docs/05-domain/diagrams/provenance-working.c4
//! [spec1]: ../../../../docs/06-subsystems/diagrams/shared-responsibilities.c4
//! [spec2]: ../../../../docs/06-subsystems/interfaces/domain-navigation.md#working-source-boundary

use super::*;
use clipboard::EntryId;
pub const INDEX_KIND: i32 = 25;
pub const REFERENCE_KIND: i32 = 26;
pub const MAX_ENTRIES: usize = 128;
const JS_MAX: u64 = 9_007_199_254_740_991;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum Target {
    Working {
        source: working::Source,
    },
    Committed {
        source: clipboard::Source,
        #[serde(with = "encoding::identity")]
        previous: EntryId,
        promotion: Box<working::Promotion>,
    },
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Reference {
    #[serde(with = "encoding::identity")]
    id: EntryId,
    #[serde(with = "encoding::identity")]
    actor: PrincipalId,
    #[serde(with = "encoding::identity")]
    device: DeviceId,
    #[serde(with = "encoding::identity")]
    operation: OperationId,
    target: Target,
    preview: String,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Index {
    #[serde(with = "encoding::identity")]
    owner: PrincipalId,
    #[serde(with = "encoding::identities")]
    entries: Vec<EntryId>,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Copied {
    pub checkpoint: working::Change,
    pub source: working::Source,
    #[serde(with = "encoding::identity")]
    pub entry: EntryId,
    pub generation: u64,
    pub count: usize,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case", deny_unknown_fields)]
pub enum Mutation {
    Promote {
        generation: u64,
        #[serde(with = "encoding::identity")]
        publication: OperationId,
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
pub struct Change {
    pub generation: u64,
    pub count: usize,
}
#[derive(Serialize)]
pub struct Entry {
    #[serde(with = "encoding::identity")]
    pub id: EntryId,
    pub target: Target,
    pub preview: String,
}
#[derive(Serialize)]
pub struct Page {
    pub generation: u64,
    pub total: usize,
    pub entries: Vec<Entry>,
    pub next: Option<usize>,
}

/// Reject a private generation that cannot advance safely for browser transport.
pub(super) fn validate_generation(generation: u64) -> Result<()> {
    if generation >= JS_MAX {
        return Err(Error::Limit);
    }
    Ok(())
}

/// Validate the generation precondition shared by every private mutation.
pub(super) fn validate(mutation: &Mutation) -> Result<()> {
    match mutation {
        Mutation::Promote { generation, .. }
        | Mutation::Remove { generation, .. }
        | Mutation::Clear { generation } => validate_generation(*generation),
    }
}

/// Read a bounded owner index and reject zero/stale shape or duplicate reference IDs.
fn load(cipher: &Cipher<'_>, db: &Connection, owner: PrincipalId) -> Result<(bool, u64, Index)> {
    match cipher.slot::<Index>(db, INDEX_KIND, owner.0) {
        Ok((generation, index)) => {
            // The mapping callback compares exact private reference bytes for duplicate IDs.
            let distinct: std::collections::BTreeSet<_> =
                index.entries.iter().map(|id| id.0).collect();
            if index.owner != owner
                || generation == 0
                || generation > JS_MAX
                || index.entries.len() > MAX_ENTRIES
                || distinct.len() != index.entries.len()
            {
                return Err(Error::Integrity);
            }
            Ok((true, generation, index))
        }
        Err(Error::NotFound) => Ok((
            false,
            0,
            Index {
                owner,
                entries: vec![],
            },
        )),
        Err(error) => Err(error),
    }
}

/// Persist a generation-checked private index, creating generation one for its first mutation.
fn write(
    cipher: &Cipher<'_>,
    db: &Connection,
    exists: bool,
    generation: u64,
    index: &Index,
) -> Result<u64> {
    validate_generation(generation)?;
    if exists {
        cipher.update(db, INDEX_KIND, index.owner.0, generation, index)
    } else {
        let bytes = cipher.seal(INDEX_KIND, index.owner.0, 1, index)?;
        db.execute(
            "INSERT INTO slots(kind,id,generation,envelope) VALUES (?1,?2,1,?3)",
            params![INDEX_KIND, index.owner.0.as_slice(), bytes],
        )?;
        Ok(1)
    }
}
/// Add an immutable working reference to a newly acknowledged checkpoint under the private quota.
#[allow(clippy::too_many_arguments)]
pub(super) fn capture(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    operation: OperationId,
    expected: u64,
    checkpoint: working::Change,
    occurrence: OccurrenceId,
    start: usize,
    end: usize,
    quote: &str,
) -> Result<Copied> {
    let (exists, generation, mut index) = load(cipher, db, catalog.owner)?;
    if generation != expected {
        return Err(Error::Conflict);
    }
    if index.entries.len() == MAX_ENTRIES {
        return Err(Error::Limit);
    }
    let source = checkpoint.source(occurrence, start, end);
    let id = EntryId(new_id()?);
    cipher.insert(
        db,
        REFERENCE_KIND,
        id.0,
        &Reference {
            id,
            actor: catalog.owner,
            device: catalog.device,
            operation,
            target: Target::Working {
                source: source.clone(),
            },
            preview: quote.chars().take(120).collect(),
        },
    )?;
    index.entries.insert(0, id);
    let generation = write(cipher, db, exists, generation, &index)?;
    Ok(Copied {
        checkpoint,
        source,
        entry: id,
        generation,
        count: index.entries.len(),
    })
}

/// Authenticate the original capture receipt, current source authority and exact cached preview.
fn original(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    id: EntryId,
) -> Result<(Reference, working::View)> {
    let reference: Reference = cipher.object(db, REFERENCE_KIND, id.0)?;
    if reference.id != id || reference.actor != catalog.owner || reference.device != catalog.device
    {
        return Err(Error::Integrity);
    }
    let Target::Working { source } = &reference.target else {
        return Err(Error::Integrity);
    };
    let receipt: StoredReceipt = cipher.object(db, RECEIPT, reference.operation.0)?;
    match &receipt.receipt.outcome {
        Outcome::WorkingCopied { state }
            if receipt.receipt.operation == reference.operation
                && state.entry == id
                && state.source == *source
                && state.generation > 0
                && state.count > 0
                && state.count <= MAX_ENTRIES => {}
        _ => return Err(Error::Integrity),
    }
    let view = working::source_view(cipher, db, catalog, source.clone())?;
    let preview: String = view.text[source.start_byte..source.end_byte]
        .chars()
        .take(120)
        .collect();
    if reference.preview != preview {
        return Err(Error::Integrity);
    }
    Ok((reference, view))
}

/// Validate working or committed references against retained originals and exact promotion evidence.
fn read(cipher: &Cipher<'_>, db: &Connection, catalog: &Catalog, id: EntryId) -> Result<Reference> {
    let reference: Reference = cipher.object(db, REFERENCE_KIND, id.0)?;
    if reference.id != id || reference.actor != catalog.owner || reference.device != catalog.device
    {
        return Err(Error::Integrity);
    }
    match &reference.target {
        Target::Working { .. } => {
            original(cipher, db, catalog, id)?;
        }
        Target::Committed {
            source,
            previous,
            promotion,
        } => {
            if *previous == id || reference.operation != promotion.operation {
                return Err(Error::Integrity);
            }
            let (prior, view) = original(cipher, db, catalog, *previous)?;
            let Target::Working { source: old } = &prior.target else {
                return Err(Error::Integrity);
            };
            if view.promotion.as_ref() != Some(promotion.as_ref())
                || reference.preview != prior.preview
                || *source != committed(old, promotion)
            {
                return Err(Error::Integrity);
            }
            let (_, revision) = clipboard::resolve_source(cipher, db, catalog, source)?;
            if revision.text != view.text {
                return Err(Error::Integrity);
            }
        }
    }
    Ok(reference)
}

/// Carry the identical captured range into its verified published revision/snapshot.
fn committed(source: &working::Source, promotion: &working::Promotion) -> clipboard::Source {
    clipboard::Source {
        document: source.document,
        node: source.node,
        snapshot: promotion.snapshot,
        revision: promotion.revision,
        occurrence_path: source.occurrence_path.clone(),
        start_byte: source.start_byte,
        end_byte: source.end_byte,
    }
}

/// Apply private removal, clear or explicit promoted-reference replacement at one expected generation.
pub(super) fn apply(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    mutation: Mutation,
) -> Result<Change> {
    let expected = match mutation {
        Mutation::Promote { generation, .. }
        | Mutation::Remove { generation, .. }
        | Mutation::Clear { generation } => generation,
    };
    let (exists, generation, mut index) = load(cipher, db, catalog.owner)?;
    if generation != expected {
        return Err(Error::Conflict);
    }
    match mutation {
        Mutation::Promote { publication, .. } => {
            return replace_promoted(cipher, db, catalog, publication, exists, generation, index);
        }
        Mutation::Remove { entry, .. } => {
            let position = index
                .entries
                .iter()
                // Remove only the requested live private reference identity.
                .position(|id| *id == entry)
                .ok_or(Error::NotFound)?;
            index.entries.remove(position);
        }
        Mutation::Clear { .. } => {
            if index.entries.is_empty() {
                return Ok(Change {
                    generation,
                    count: 0,
                });
            }
            index.entries.clear();
        }
    }
    let generation = write(cipher, db, exists, generation, &index)?;
    Ok(Change {
        generation,
        count: index.entries.len(),
    })
}

/// Require present document/branch authority before accepting a publication-driven replacement.
pub(super) fn authorize(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    mutation: &Mutation,
) -> Result<()> {
    if let Mutation::Promote { publication, .. } = mutation {
        let receipt = publication_receipt(cipher, db, catalog, *publication)?;
        if receipt.operation != *publication {
            return Err(Error::Integrity);
        }
        let (document, branch) = match receipt.outcome {
            Outcome::Committed { document, .. } => {
                if !catalog.documents.contains(&document) {
                    return Err(Error::NotFound);
                }
                let doc: Document = cipher.object(db, DOCUMENT, document.0)?;
                (document, doc.branch)
            }
            Outcome::Branch { state } => match state.outcome {
                branches::EditOutcome::Committed { document, .. } => (document, state.branch),
                _ => return Err(Error::Invalid),
            },
            _ => return Err(Error::Invalid),
        };
        branches::document(cipher, db, catalog, document, branch)?;
    }
    Ok(())
}

/// Read the original legacy receipt or dedicated experimental publication without fabricating an alias.
fn publication_receipt(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    operation: OperationId,
) -> Result<Receipt> {
    match cipher.object::<StoredReceipt>(db, RECEIPT, operation.0) {
        Ok(stored) => Ok(stored.receipt),
        Err(Error::NotFound) => {
            temporal_commit::publication_receipt(cipher, db, catalog, operation)
        }
        Err(error) => Err(error),
    }
}
/// Append eligible committed references while preserving originals and updating only live index entries.
#[allow(clippy::too_many_arguments)]
fn replace_promoted(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    operation: OperationId,
    exists: bool,
    mut generation: u64,
    mut index: Index,
) -> Result<Change> {
    let receipt = publication_receipt(cipher, db, catalog, operation)?;
    if receipt.operation != operation {
        return Err(Error::Integrity);
    }
    let document = match receipt.outcome {
        Outcome::Committed { document, .. } => {
            if !catalog.documents.contains(&document) {
                return Err(Error::NotFound);
            }
            let doc: Document = cipher.object(db, DOCUMENT, document.0)?;
            branches::document(cipher, db, catalog, document, doc.branch)?;
            document
        }
        Outcome::Branch { state } => match state.outcome {
            branches::EditOutcome::Committed { document, .. } => {
                branches::document(cipher, db, catalog, document, state.branch)?;
                document
            }
            _ => return Err(Error::Invalid),
        },
        _ => return Err(Error::Invalid),
    };
    let mut changed = false;
    // This private family is capped at128 live references. No whole-graph scan.
    for id in &mut index.entries {
        let reference: Reference = cipher.object(db, REFERENCE_KIND, id.0)?;
        let Target::Working { source } = &reference.target else {
            continue;
        };
        if source.document != document {
            continue;
        }
        let (prior, view) = original(cipher, db, catalog, *id)?;
        let Some(promotion) = view.promotion else {
            continue;
        };
        if promotion.operation != operation {
            continue;
        }
        let next = EntryId(new_id()?);
        cipher.insert(
            db,
            REFERENCE_KIND,
            next.0,
            &Reference {
                id: next,
                actor: catalog.owner,
                device: catalog.device,
                operation,
                target: Target::Committed {
                    source: committed(source, &promotion),
                    previous: *id,
                    promotion: Box::new(promotion),
                },
                preview: prior.preview,
            },
        )?;
        *id = next;
        changed = true;
    }
    if changed {
        generation = write(cipher, db, exists, generation, &index)?;
    }
    Ok(Change {
        generation,
        count: index.entries.len(),
    })
}

impl Workspace {
    /// Read a retained private reference after current catalogue and source checks.
    pub fn working_reference(&mut self, id: EntryId) -> Result<Entry> {
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        let reference = read(&cipher, &tx, &catalog, id)?;
        let entry = Entry {
            id,
            target: reference.target,
            preview: reference.preview,
        };
        tx.commit()?;
        Ok(entry)
    }

    /// Return bounded authenticated references from one stable private index generation.
    pub fn working_clipboard_page(
        &mut self,
        expected: Option<u64>,
        offset: usize,
        limit: usize,
    ) -> Result<Page> {
        if !(1..=16).contains(&limit) {
            return Err(Error::Invalid);
        }
        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self.db.transaction()?;
        let (_, catalog): (_, Catalog) = cipher.slot(&tx, CATALOG, ROOT)?;
        if catalog.owner != self.owner || catalog.device != self.device {
            return Err(Error::Integrity);
        }
        let (_, generation, index) = load(&cipher, &tx, catalog.owner)?;
        // The optional predicate binds a continuation to its original private generation.
        if expected.is_some_and(|value| value != generation) {
            return Err(Error::Conflict);
        }
        if offset > index.entries.len() {
            return Err(Error::Invalid);
        }
        let mut entries = vec![];
        for id in index.entries.iter().skip(offset).take(limit) {
            let reference = read(&cipher, &tx, &catalog, *id)?;
            entries.push(Entry {
                id: *id,
                target: reference.target,
                preview: reference.preview,
            });
        }
        let next = (offset + entries.len() < index.entries.len()).then_some(offset + entries.len());
        let page = Page {
            generation,
            total: index.entries.len(),
            entries,
            next,
        };
        tx.commit()?;
        Ok(page)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};
    /// Execute a synthetic checkpoint-and-copy command and extract its acknowledged private result.
    fn copy(ws: &mut Workspace, editor: &EditorState, operation: u8, generation: u64) -> Copied {
        match ws
            .execute(
                op(operation),
                Command::WorkingCopy {
                    plan: working::tests::request(editor),
                    generation,
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::WorkingCopied { state } => *state,
            _ => panic!(),
        }
    }

    /// Keep original working evidence through explicit replacement, restart and live-index clear.
    #[test]
    fn private_copy_survives_restart_and_exact_commit_appends_replacement_retaining_original() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let editor = ws.open_document(id).unwrap();
        ws.execute(op(2), save(&editor, "A😀\r\n中\r")).unwrap();
        let editor = ws.open_document(id).unwrap();
        let copied = copy(&mut ws, &editor, 3, 0);
        assert_eq!(ws.open_document(id).unwrap().snapshot, editor.snapshot);
        let page = ws.working_clipboard_page(None, 0, 16).unwrap();
        assert_eq!(page.entries[0].id, copied.entry);
        assert_eq!(page.generation, 1);
        ws.execute(op(4), commit(&editor)).unwrap();
        assert_eq!(
            ws.working_clipboard_page(None, 0, 16).unwrap().entries[0].id,
            copied.entry
        );
        ws.execute(
            op(6),
            Command::WorkingClipboard {
                mutation: Mutation::Promote {
                    generation: 1,
                    publication: op(4),
                },
            },
        )
        .unwrap();
        let page = ws.working_clipboard_page(None, 0, 16).unwrap();
        assert_eq!(page.generation, 2);
        assert_eq!(page.total, 1);
        let replacement = page.entries[0].id;
        assert_ne!(replacement, copied.entry);
        match &page.entries[0].target {
            Target::Committed {
                source,
                previous,
                promotion,
            } => {
                assert_eq!(*previous, copied.entry);
                assert_eq!(promotion.checkpoint, copied.source.checkpoint);
                assert_eq!(
                    ws.reconstruct_snapshot(id, source.snapshot).unwrap(),
                    editor.text
                );
            }
            _ => panic!(),
        };
        assert!(matches!(
            ws.working_reference(copied.entry).unwrap().target,
            Target::Working { .. }
        ));
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        assert_eq!(
            ws.working_clipboard_page(None, 0, 16).unwrap().entries[0].id,
            replacement
        );
        assert!(matches!(
            ws.working_clipboard_page(Some(1), 0, 16),
            Err(Error::Conflict)
        ));
        ws.execute(
            op(5),
            Command::WorkingClipboard {
                mutation: Mutation::Clear { generation: 2 },
            },
        )
        .unwrap();
        assert_eq!(ws.working_clipboard_page(None, 0, 16).unwrap().total, 0);
        assert!(matches!(
            ws.working_reference(copied.entry).unwrap().target,
            Target::Working { .. }
        ));
        assert!(matches!(
            ws.working_reference(replacement).unwrap().target,
            Target::Committed { .. }
        ));
    }

    /// Reject stale copy generation atomically and avoid promoting changed text to the earlier capture.
    #[test]
    fn changed_text_keeps_working_link_and_copy_generation_conflicts_roll_back_checkpoint() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let id = create(&mut ws);
        let editor = ws.open_document(id).unwrap();
        let copied = copy(&mut ws, &editor, 2, 0);
        assert!(matches!(
            ws.execute(
                op(3),
                Command::WorkingCopy {
                    plan: working::tests::request(&editor),
                    generation: 0
                }
            ),
            Err(Error::Conflict)
        ));
        let count: i64 = ws
            .db
            .query_row(
                "SELECT count(*) FROM objects WHERE kind=?1",
                params![working::CHECKPOINT_KIND],
                // Count checkpoints to detect a stale private-copy partial write.
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
        ws.execute(op(4), save(&editor, "Changed source")).unwrap();
        let newer = ws.open_document(id).unwrap();
        ws.execute(op(5), commit(&newer)).unwrap();
        let page = ws.working_clipboard_page(None, 0, 16).unwrap();
        assert_eq!(page.entries[0].id, copied.entry);
        assert!(matches!(page.entries[0].target, Target::Working { .. }));
    }

    /// Verify copy/replacement rollback and original-result retries across all command fault stages.
    #[test]
    fn copy_and_replacements_are_atomic_at_fault_boundaries_and_replay_original_receipts() {
        for phase in ["objects", "heads", "receipt", "committed"] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let id = create(&mut ws);
            let editor = ws.open_document(id).unwrap();
            let command = Command::WorkingCopy {
                plan: working::tests::request(&editor),
                generation: 0,
            };
            assert!(matches!(
                // Fail the selected copy stage, including a lost post-commit reply.
                ws.execute_inner(op(2), command.clone(), |at| if at == phase {
                    Err(Error::Io)
                } else {
                    Ok(())
                }),
                Err(Error::Io)
            ));
            assert_eq!(
                ws.working_clipboard_page(None, 0, 16).unwrap().total,
                usize::from(phase == "committed")
            );
            let first = ws.execute(op(2), command.clone()).unwrap();
            assert_eq!(first, ws.execute(op(2), command).unwrap());
            let original = ws.working_clipboard_page(None, 0, 16).unwrap().entries[0].id;
            let committed = ws.execute(op(3), commit(&editor)).unwrap();
            let published = ws.open_document(id).unwrap().snapshot;
            let replace = Command::WorkingClipboard {
                mutation: Mutation::Promote {
                    generation: 1,
                    publication: op(3),
                },
            };
            assert!(matches!(
                // Fail the selected replacement stage without changing the earlier publication.
                ws.execute_inner(op(4), replace.clone(), |at| if at == phase {
                    Err(Error::Io)
                } else {
                    Ok(())
                }),
                Err(Error::Io)
            ));
            let page = ws.working_clipboard_page(None, 0, 16).unwrap();
            assert_eq!(page.entries[0].id == original, phase != "committed");
            assert_eq!(ws.open_document(id).unwrap().snapshot, published);
            assert_eq!(committed, ws.execute(op(3), commit(&editor)).unwrap());
            let result = ws.execute(op(4), replace.clone()).unwrap();
            assert_eq!(result, ws.execute(op(4), replace).unwrap());
            assert_ne!(
                ws.working_clipboard_page(None, 0, 16).unwrap().entries[0].id,
                original
            );
        }
    }

    /// Reject changed source/preview/index evidence and revoked scope instead of disclosing or retargeting.
    #[test]
    fn authenticated_reference_changes_and_scope_revocation_do_not_disclose_or_retarget() {
        for fault in ["range", "preview", "duplicate", "revoked"] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let id = create(&mut ws);
            let editor = ws.open_document(id).unwrap();
            let copied = copy(&mut ws, &editor, 2, 0);
            let cipher = Cipher {
                key: &ws.key,
                workspace: ws.workspace,
            };
            match fault {
                "range" | "preview" => {
                    let mut reference: Reference = cipher
                        .object(&ws.db, REFERENCE_KIND, copied.entry.0)
                        .unwrap();
                    if fault == "preview" {
                        reference.preview = "Altered".into();
                    } else if let Target::Working { source } = &mut reference.target {
                        source.end_byte -= 1;
                    }
                    let envelope = cipher
                        .seal(REFERENCE_KIND, copied.entry.0, 0, &reference)
                        .unwrap();
                    ws.db
                        .execute(
                            "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                            params![envelope, REFERENCE_KIND, copied.entry.0.as_slice()],
                        )
                        .unwrap();
                }
                "duplicate" => {
                    let (_, generation, mut index) = load(&cipher, &ws.db, ws.owner).unwrap();
                    index.entries.push(copied.entry);
                    cipher
                        .update(&ws.db, INDEX_KIND, ws.owner.0, generation, &index)
                        .unwrap();
                }
                _ => {
                    let (generation, mut catalog): (_, Catalog) =
                        cipher.slot(&ws.db, CATALOG, ROOT).unwrap();
                    catalog.documents.clear();
                    cipher
                        .update(&ws.db, CATALOG, ROOT, generation, &catalog)
                        .unwrap();
                }
            }
            if fault == "revoked" {
                assert!(matches!(
                    ws.working_reference(copied.entry),
                    Err(Error::NotFound)
                ));
                assert!(matches!(
                    ws.execute(
                        op(2),
                        Command::WorkingCopy {
                            plan: working::tests::request(&editor),
                            generation: 0
                        }
                    ),
                    Err(Error::NotFound)
                ));
            } else {
                assert!(
                    matches!(
                        ws.working_clipboard_page(None, 0, 16),
                        Err(Error::Integrity)
                    ),
                    "{fault}"
                );
            }
        }
    }
}
