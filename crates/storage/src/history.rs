// SPDX-License-Identifier: AGPL-3.0-only
//! Bounded immutable publication history for the initial one-owner document.
use super::*;
use std::collections::BTreeSet;

pub const MAX_PAGE: usize = 32;
pub(super) const PAGE_BYTES: usize = 16 * 1024 * 1024;

#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Entry {
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    #[serde(with = "encoding::optional_identity")]
    pub parent: Option<RevisionId>,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,
    /// Recorded publication principal, not inferred original text authorship.
    #[serde(with = "encoding::identity")]
    pub actor: PrincipalId,
    #[serde(with = "encoding::identity")]
    pub device: DeviceId,
    pub text_bytes: usize,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Page {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    pub entries: Vec<Entry>,
    /// Inclusive next immutable revision; new commits cannot shift this cursor.
    #[serde(with = "encoding::optional_identity")]
    pub next: Option<RevisionId>,
}

pub(super) fn object<T: DeserializeOwned>(
    cipher: &Cipher<'_>,
    db: &Connection,
    kind: i32,
    id: [u8; 32],
    remaining: &mut usize,
) -> Result<T> {
    let length: i64 = db
        .query_row(
            "SELECT length(envelope) FROM objects WHERE kind=?1 AND id=?2",
            params![kind, id.as_slice()],
            |r| r.get(0),
        )
        .optional()?
        .ok_or(Error::NotFound)?;
    let length = usize::try_from(length).map_err(|_| Error::Integrity)?;
    if length > *remaining {
        return Err(Error::Limit);
    }
    *remaining -= length;
    cipher.object(db, kind, id)
}

impl Workspace {
    pub fn history_page(
        &mut self,
        document: DocumentId,
        next: Option<RevisionId>,
        limit: usize,
    ) -> Result<Page> {
        self.history_page_budget(document, next, limit, PAGE_BYTES)
    }
    fn history_page_budget(
        &mut self,
        document: DocumentId,
        next: Option<RevisionId>,
        limit: usize,
        mut remaining: usize,
    ) -> Result<Page> {
        if !(1..=MAX_PAGE).contains(&limit) {
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
        let page = read_page(
            &cipher,
            &tx,
            &catalog,
            document,
            next,
            limit,
            &mut remaining,
        )?;
        tx.commit()?;
        Ok(page)
    }
}

/// Read a bounded immutable ancestry page inside the caller's authorized transaction.
pub(super) fn read_page(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    document: DocumentId,
    next: Option<RevisionId>,
    limit: usize,
    remaining: &mut usize,
) -> Result<Page> {
    if !(1..=MAX_PAGE).contains(&limit) {
        return Err(Error::Invalid);
    }
    if !catalog.documents.contains(&document) {
        return Err(Error::NotFound);
    }
    let doc: Document = object(cipher, db, DOCUMENT, document.0, remaining)?;
    if doc.id != document {
        return Err(Error::Integrity);
    }
    let (_, head): (_, Head) = cipher.slot(db, HEAD, doc.branch.0)?;
    if head.document != document {
        return Err(Error::Integrity);
    }
    let manifest: Manifest = object(cipher, db, MANIFEST, doc.manifest.0, remaining)?;
    if manifest.document != document
        || manifest.node != doc.node
        || manifest.occurrence != doc.occurrence
    {
        return Err(Error::Integrity);
    }
    let mut cursor = Some(next.unwrap_or(head.revision));
    let mut entries = Vec::new();
    let mut seen = BTreeSet::new();
    while let Some(id) = cursor {
        if entries.len() == limit {
            break;
        }
        if seen.contains(&id.0) {
            return Err(Error::Integrity);
        }
        let entry = (|| {
            let revision: Revision = object(cipher, db, REVISION, id.0, remaining)?;
            let event: Event = object(cipher, db, EVENT, revision.operation.0, remaining)?;
            let snapshot: Snapshot = object(cipher, db, SNAPSHOT, event.snapshot.0, remaining)?;
            if revision.text.len() > MAX_TEXT_BYTES {
                return Err(Error::Limit);
            }
            if revision.node != doc.node
                || revision.parent == Some(id)
                || event.document != document
                || event.operation != revision.operation
                || event.revision != id
                || event.parent != revision.parent
                || snapshot.document != document
                || snapshot.manifest != doc.manifest
                || snapshot.bindings.len() != 1
            {
                return Err(Error::Integrity);
            }
            let binding = &snapshot.bindings[0];
            if binding.path != [doc.occurrence]
                || binding.node != doc.node
                || binding.revision != id
            {
                return Err(Error::Integrity);
            }
            if next.is_none() && entries.is_empty() && event.snapshot != head.snapshot {
                return Err(Error::Integrity);
            }
            Ok(Entry {
                revision: id,
                parent: revision.parent,
                snapshot: event.snapshot,
                operation: event.operation,
                actor: event.actor,
                device: event.device,
                text_bytes: revision.text.len(),
            })
        })();
        match entry {
            Ok(entry) => {
                seen.insert(id.0);
                cursor = entry.parent;
                entries.push(entry);
            }
            Err(Error::Limit) if !entries.is_empty() => break,
            Err(error) => return Err(error),
        }
    }
    if cursor.is_some_and(|id| seen.contains(&id.0)) {
        return Err(Error::Integrity);
    }
    Ok(Page {
        document,
        entries,
        next: cursor,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};
    #[test]
    fn stable_pages_preserve_exact_snapshots_across_new_commits_and_restart() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let initial = ws.open_document(doc).unwrap().text;
        let mut texts = vec![initial];
        for i in 0..5 {
            let state = ws.open_document(doc).unwrap();
            let text = format!("Revision {i}😀\r\n中\rfinal\n");
            ws.execute(op(2 + i * 2), save(&state, &text)).unwrap();
            let state = ws.open_document(doc).unwrap();
            ws.execute(op(3 + i * 2), commit(&state)).unwrap();
            texts.push(text);
        }
        let state = ws.open_document(doc).unwrap();
        ws.execute(op(20), save(&state, "Uncommitted draft"))
            .unwrap();
        let first = ws.history_page(doc, None, 2).unwrap();
        assert_eq!(first.entries.len(), 2);
        let frozen = first.next;
        let state = ws.open_document(doc).unwrap();
        ws.execute(op(21), commit(&state)).unwrap();
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        let mut entries = first.entries;
        let mut cursor = frozen;
        while let Some(next) = cursor {
            let page = ws.history_page(doc, Some(next), 2).unwrap();
            assert!(page.entries.len() <= 2);
            cursor = page.next;
            entries.extend(page.entries);
        }
        assert_eq!(entries.len(), texts.len());
        for (entry, text) in entries.iter().zip(texts.iter().rev()) {
            assert_eq!(ws.reconstruct_snapshot(doc, entry.snapshot).unwrap(), *text);
            assert_eq!(entry.text_bytes, text.len());
        }
        let again = ws.history_page(doc, frozen, 2).unwrap();
        assert_eq!(again.entries[0].revision, entries[2].revision);
        assert_eq!(
            ws.history_page(doc, None, 1).unwrap().entries[0].snapshot,
            ws.open_document(doc).unwrap().snapshot
        );
    }

    #[test]
    fn limits_and_cross_document_cursors_fail_without_publishing_changes() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let other = match ws
            .execute(
                op(2),
                Command::Create {
                    title: "Other".into(),
                    text: "Private other".into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let wrong = ws.open_document(other).unwrap().base;
        assert!(matches!(
            ws.history_page(doc, Some(wrong), 2),
            Err(Error::Integrity)
        ));
        for limit in [0, MAX_PAGE + 1] {
            assert!(matches!(
                ws.history_page(doc, None, limit),
                Err(Error::Invalid)
            ));
        }
        assert!(matches!(
            ws.history_page_budget(doc, None, 1, 0),
            Err(Error::Limit)
        ));
        let before = ws.open_document(doc).unwrap();
        assert!(matches!(
            ws.history_page(DocumentId([9; 32]), None, 1),
            Err(Error::NotFound)
        ));
        let after = ws.open_document(doc).unwrap();
        assert_eq!(before.generation, after.generation);
        assert_eq!(before.base, after.base);
    }

    #[test]
    fn corrupt_events_and_missing_exact_snapshots_never_substitute_latest() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let page = ws.history_page(doc, None, 1).unwrap();
        let entry = &page.entries[0];
        ws.db
            .execute(
                "DELETE FROM objects WHERE kind=?1 AND id=?2",
                params![SNAPSHOT, entry.snapshot.0.as_slice()],
            )
            .unwrap();
        assert!(matches!(
            ws.history_page(doc, None, 1),
            Err(Error::NotFound)
        ));
    }

    #[test]
    fn byte_budget_returns_a_stable_partial_page_without_a_retention_cap() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = create(&mut ws);
        let editor = ws.open_document(doc).unwrap();
        ws.execute(op(2), save(&editor, &"x".repeat(20000)))
            .unwrap();
        let editor = ws.open_document(doc).unwrap();
        ws.execute(op(3), commit(&editor)).unwrap();
        let page = ws.history_page(doc, None, 1).unwrap();
        let entry = &page.entries[0];
        let mut budget = 0usize;
        for (kind, id) in [
            (DOCUMENT, doc.0),
            (MANIFEST, editor.manifest.0),
            (REVISION, entry.revision.0),
            (EVENT, entry.operation.0),
            (SNAPSHOT, entry.snapshot.0),
        ] {
            let n: i64 = ws
                .db
                .query_row(
                    "SELECT length(envelope) FROM objects WHERE kind=?1 AND id=?2",
                    params![kind, id.as_slice()],
                    |r| r.get(0),
                )
                .unwrap();
            budget += n as usize;
        }
        let partial = ws.history_page_budget(doc, None, MAX_PAGE, budget).unwrap();
        assert_eq!(partial.entries.len(), 1);
        assert_eq!(partial.next, entry.parent);
        let rest = ws.history_page(doc, partial.next, MAX_PAGE).unwrap();
        assert_eq!(rest.entries.len(), 1);
        assert!(rest.next.is_none());
    }

    #[test]
    fn authenticated_but_inconsistent_event_snapshot_and_cycle_are_rejected() {
        for fault in ["event", "snapshot", "cycle"] {
            let temp = Temp::new();
            let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
            let doc = create(&mut ws);
            let entry = ws.history_page(doc, None, 1).unwrap().entries.remove(0);
            let cipher = Cipher {
                key: &ws.key,
                workspace: ws.workspace,
            };
            let mut event: Event = cipher.object(&ws.db, EVENT, entry.operation.0).unwrap();
            let (kind, id, envelope) = match fault {
                "event" => {
                    event.revision = RevisionId([9; 32]);
                    (
                        EVENT,
                        entry.operation.0,
                        cipher.seal(EVENT, entry.operation.0, 0, &event).unwrap(),
                    )
                }
                "snapshot" => {
                    let mut snapshot: Snapshot =
                        cipher.object(&ws.db, SNAPSHOT, entry.snapshot.0).unwrap();
                    snapshot.bindings[0].revision = RevisionId([9; 32]);
                    (
                        SNAPSHOT,
                        entry.snapshot.0,
                        cipher
                            .seal(SNAPSHOT, entry.snapshot.0, 0, &snapshot)
                            .unwrap(),
                    )
                }
                _ => {
                    let mut revision: Revision =
                        cipher.object(&ws.db, REVISION, entry.revision.0).unwrap();
                    revision.parent = Some(entry.revision);
                    event.parent = revision.parent;
                    let bytes = cipher.seal(EVENT, entry.operation.0, 0, &event).unwrap();
                    ws.db
                        .execute(
                            "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                            params![bytes, EVENT, entry.operation.0.as_slice()],
                        )
                        .unwrap();
                    (
                        REVISION,
                        entry.revision.0,
                        cipher
                            .seal(REVISION, entry.revision.0, 0, &revision)
                            .unwrap(),
                    )
                }
            };
            ws.db
                .execute(
                    "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                    params![envelope, kind, id.as_slice()],
                )
                .unwrap();
            assert!(
                matches!(ws.history_page(doc, None, 1), Err(Error::Integrity)),
                "{fault}"
            );
        }
    }
}
