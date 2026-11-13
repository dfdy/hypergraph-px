// SPDX-License-Identifier: AGPL-3.0-only
//! Immutable retrospective comments with an append-only document paging chain.
use super::*;
use hypergraph_domain::comment as domain;

pub const KIND: i32 = 18;
pub const HEAD_KIND: i32 = 19;
pub const MAX_PAGE: usize = 8;
const JS_MAX: u64 = 9_007_199_254_740_991;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    pub source: clipboard::Source,
    pub expected_draft: Option<clipboard::DraftContext>,
    pub quote: String,
    pub body: String,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Record {
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    pub source: clipboard::Source,
    pub body: String,
    pub expected_draft: Option<clipboard::DraftContext>,
    #[serde(with = "encoding::identity")]
    pub actor: PrincipalId,
    #[serde(with = "encoding::identity")]
    pub device: DeviceId,
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,
    pub ordinal: u64,
    /// Paging linkage between distinct comments, never same-node ancestry.
    #[serde(with = "encoding::optional_identity")]
    pub previous_document_comment: Option<RevisionId>,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Change {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub node: NodeId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    pub ordinal: u64,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Index {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    head: RevisionId,
    count: u64,
}
#[derive(Serialize)]
pub struct Page {
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    pub text_snapshot_scope: &'static str,
    pub entries: Vec<Record>,
    #[serde(with = "encoding::optional_identity")]
    pub next: Option<RevisionId>,
}
fn address(document: DocumentId) -> [u8; 32] {
    let mut h = Sha256::new();
    h.update(b"hpx/document-comments/v1\0");
    h.update(document.0);
    h.finalize().into()
}
pub(super) fn validate(request: &Request) -> Result<()> {
    clipboard::validate_capture(
        &request.source,
        request.expected_draft.as_ref(),
        &request.quote,
    )?;
    if request.body.trim().is_empty() {
        return Err(Error::Invalid);
    }
    if request.body.len() > domain::MAX_BODY_BYTES {
        return Err(Error::Limit);
    }
    Ok(())
}
fn index(
    cipher: &Cipher<'_>,
    db: &Connection,
    document: DocumentId,
) -> Result<Option<(u64, Index)>> {
    match cipher.slot::<Index>(db, HEAD_KIND, address(document)) {
        Ok((generation, value)) => {
            if value.document != document
                || value.count == 0
                || value.count > JS_MAX
                || generation.checked_add(1) != Some(value.count)
            {
                return Err(Error::Integrity);
            }
            Ok(Some((generation, value)))
        }
        Err(Error::NotFound) => Ok(None),
        Err(error) => Err(error),
    }
}
fn record(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    document: DocumentId,
    revision: RevisionId,
) -> Result<Record> {
    let record: Record = cipher.object(db, KIND, revision.0)?;
    if record.revision != revision
        || record.source.document != document
        || record.node == record.source.node
        || record.body.trim().is_empty()
        || record.body.len() > domain::MAX_BODY_BYTES
        || record.ordinal == 0
        || record.ordinal > JS_MAX
        || (record.ordinal == 1) != record.previous_document_comment.is_none()
        || record.previous_document_comment == Some(revision)
        || record.actor != catalog.owner
        || record.device != catalog.device
    {
        return Err(Error::Integrity);
    }
    let receipt: StoredReceipt = cipher.object(db, RECEIPT, record.operation.0)?;
    match receipt.receipt.outcome {
        Outcome::Commented { state }
            if receipt.receipt.operation == record.operation
                && state.document == document
                && state.node == record.node
                && state.revision == revision
                && state.ordinal == record.ordinal => {}
        _ => return Err(Error::Integrity),
    }
    let (_, source) = clipboard::resolve_source(cipher, db, catalog, &record.source)?;
    if record.source.start_byte == record.source.end_byte || source.node == record.node {
        return Err(Error::Integrity);
    }
    let command = Command::Comment {
        plan: Request {
            source: record.source.clone(),
            expected_draft: record.expected_draft.clone(),
            quote: source.text[record.source.start_byte..record.source.end_byte].to_owned(),
            body: record.body.clone(),
        },
    };
    let bytes = Zeroizing::new(serde_json::to_vec(&command).map_err(|_| Error::Format)?);
    if <[u8; 32]>::from(Sha256::digest(&*bytes)) != receipt.digest {
        return Err(Error::Integrity);
    }
    Ok(record)
}
#[allow(clippy::too_many_arguments)]
pub(super) fn apply(
    cipher: &Cipher<'_>,
    db: &Connection,
    owner: PrincipalId,
    device: DeviceId,
    operation: OperationId,
    request: Request,
    checkpoint: &mut impl FnMut(&str) -> Result<()>,
) -> Result<Change> {
    let (_, catalog): (_, Catalog) = cipher.slot(db, CATALOG, ROOT)?;
    if catalog.owner != owner || catalog.device != device {
        return Err(Error::Integrity);
    }
    let (doc, source) = clipboard::capture_source(
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
    domain::plan(
        request.source.revision,
        &[doc.occurrence],
        &source.text,
        &anchor,
        &request.quote,
        &request.body,
    )
    .map_err(|_| Error::Invalid)?;
    let previous = index(cipher, db, doc.id)?;
    if let Some((_, head)) = &previous {
        let last = record(cipher, db, &catalog, doc.id, head.head)?;
        if last.ordinal != head.count {
            return Err(Error::Integrity);
        }
    }
    let ordinal = previous.as_ref().map_or(1, |(_, head)| head.count + 1);
    if ordinal > JS_MAX {
        return Err(Error::Limit);
    }
    let value = Record {
        node: NodeId(new_id()?),
        revision: RevisionId(new_id()?),
        source: request.source,
        body: request.body,
        expected_draft: request.expected_draft,
        actor: owner,
        device,
        operation,
        ordinal,
        previous_document_comment: previous.as_ref().map(|(_, head)| head.head),
    };
    cipher.insert(db, KIND, value.revision.0, &value)?;
    checkpoint("comment")?;
    let head = Index {
        document: doc.id,
        head: value.revision,
        count: ordinal,
    };
    if let Some((generation, _)) = previous {
        cipher.update(db, HEAD_KIND, address(doc.id), generation, &head)?;
    } else {
        cipher.new_slot(db, HEAD_KIND, address(doc.id), &head)?;
    }
    checkpoint("comment_index")?;
    Ok(Change {
        document: doc.id,
        node: value.node,
        revision: value.revision,
        ordinal,
    })
}
impl Workspace {
    pub fn comments_page(
        &mut self,
        document: DocumentId,
        snapshot: SnapshotId,
        next: Option<RevisionId>,
        limit: usize,
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
        if !catalog.documents.contains(&document) {
            return Err(Error::NotFound);
        }
        let doc: Document = cipher.object(&tx, DOCUMENT, document.0)?;
        if doc.id != document {
            return Err(Error::Integrity);
        }
        let revision = snapshot_revision(&cipher, &tx, &doc, snapshot)?;
        let text: Revision = cipher.object(&tx, REVISION, revision.0)?;
        if text.node != doc.node || text.text.len() > MAX_TEXT_BYTES {
            return Err(Error::Integrity);
        }
        let head = index(&cipher, &tx, document)?;
        let mut cursor = next.or_else(|| head.as_ref().map(|(_, h)| h.head));
        if next.is_some() && head.is_none() {
            return Err(Error::Integrity);
        }
        let mut entries: Vec<Record> = Vec::new();
        let mut expected = None;
        let mut lookahead = None;
        while let Some(revision) = cursor {
            if entries.len() == limit {
                break;
            }
            let value = match lookahead.take() {
                Some(value) => value,
                None => record(&cipher, &tx, &catalog, document, revision)?,
            };
            if head.as_ref().is_none_or(|(_, h)| value.ordinal > h.count)
                || expected.is_some_and(|n| value.ordinal != n)
                || next.is_none()
                    && entries.is_empty()
                    && head.as_ref().is_none_or(|(_, h)| value.ordinal != h.count)
                || entries
                    .iter()
                    .any(|e| e.node == value.node || e.revision == value.revision)
            {
                return Err(Error::Integrity);
            }
            expected = value.ordinal.checked_sub(1);
            cursor = value.previous_document_comment;
            if let Some(previous) = cursor {
                let prior = record(&cipher, &tx, &catalog, document, previous)?;
                if Some(prior.ordinal) != expected || prior.node == value.node {
                    return Err(Error::Integrity);
                }
                lookahead = Some(prior);
            }
            entries.push(value);
        }
        tx.commit()?;
        Ok(Page {
            document,
            snapshot,
            text_snapshot_scope: "comments_excluded",
            entries,
            next: cursor,
        })
    }
}

#[cfg(test)]
pub(super) mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};
    pub(crate) fn request(s: &EditorState) -> Request {
        Request {
            source: clipboard::Source {
                document: s.document,
                node: s.node,
                snapshot: s.snapshot,
                revision: s.base,
                occurrence_path: vec![s.occurrence],
                start_byte: 0,
                end_byte: s.text.len(),
            },
            expected_draft: None,
            quote: s.text.clone(),
            body: "  Comment 😀e\u{301}\r\nExact body\r\n ".into(),
        }
    }
    #[test]
    fn immutable_comments_and_stable_pages_survive_text_edits_and_restart() {
        let t = Temp::new();
        let mut w = Workspace::create(&t.db(), PASS, "Human").unwrap();
        let d = create(&mut w);
        let initial = w.open_document(d).unwrap();
        let plan = request(&initial);
        let receipt = w
            .execute(op(2), Command::Comment { plan: plan.clone() })
            .unwrap();
        assert_eq!(
            w.execute(op(2), Command::Comment { plan: plan.clone() })
                .unwrap(),
            receipt
        );
        w.execute(op(3), Command::Comment { plan: plan.clone() })
            .unwrap();
        let first = w.comments_page(d, initial.snapshot, None, 1).unwrap();
        assert_eq!(first.entries.len(), 1);
        assert_eq!(first.entries[0].ordinal, 2);
        w.execute(op(4), save(&initial, "Changed text 😀\r\n"))
            .unwrap();
        let draft = w.open_document(d).unwrap();
        w.execute(op(5), commit(&draft)).unwrap();
        w.execute(op(6), Command::Comment { plan: plan.clone() })
            .unwrap();
        drop(w);
        let mut w = Workspace::open(&t.db(), PASS).unwrap();
        let older = w.comments_page(d, initial.snapshot, first.next, 8).unwrap();
        assert_eq!(older.entries.len(), 1);
        assert_eq!(older.entries[0].ordinal, 1);
        assert!(older.next.is_none());
        assert_eq!(older.entries[0].body, plan.body);
        assert_eq!(older.entries[0].source, plan.source);
        assert_ne!(older.entries[0].node, initial.node);
        assert_eq!(
            w.reconstruct_snapshot(d, initial.snapshot).unwrap(),
            initial.text
        );
        let current = w.open_document(d).unwrap();
        assert_eq!(current.text, "Changed text 😀\r\n");
        assert_eq!(
            w.comments_page(d, current.snapshot, None, 8)
                .unwrap()
                .entries
                .len(),
            3
        );
    }
    #[test]
    fn atomic_comment_faults_and_lost_acknowledgements_reconcile_one_record() {
        for point in ["comment", "comment_index", "heads", "receipt", "committed"] {
            let t = Temp::new();
            let mut w = Workspace::create(&t.db(), PASS, "Human").unwrap();
            let d = create(&mut w);
            let s = w.open_document(d).unwrap();
            let command = Command::Comment { plan: request(&s) };
            assert!(
                w.execute_inner(op(2), command.clone(), |at| if at == point {
                    Err(Error::Io)
                } else {
                    Ok(())
                })
                .is_err()
            );
            assert_eq!(
                w.comments_page(d, s.snapshot, None, 8)
                    .unwrap()
                    .entries
                    .len(),
                usize::from(point == "committed")
            );
            let receipt = w.execute(op(2), command.clone()).unwrap();
            assert_eq!(w.execute(op(2), command).unwrap(), receipt);
            assert_eq!(
                w.comments_page(d, s.snapshot, None, 8)
                    .unwrap()
                    .entries
                    .len(),
                1
            );
            assert_eq!(w.open_document(d).unwrap().generation, s.generation);
        }
    }
    #[test]
    fn scope_stale_draft_quotes_limits_and_reused_operations_fail_closed() {
        let t = Temp::new();
        let mut w = Workspace::create(&t.db(), PASS, "Human").unwrap();
        let d = create(&mut w);
        let s = w.open_document(d).unwrap();
        let plan = request(&s);
        w.execute(op(2), Command::Comment { plan: plan.clone() })
            .unwrap();
        let mut changed = plan.clone();
        changed.body.push('x');
        assert!(matches!(
            w.execute(op(2), Command::Comment { plan: changed }),
            Err(Error::Conflict)
        ));
        let mut changed = plan.clone();
        changed.quote.push('x');
        assert!(
            w.execute(op(3), Command::Comment { plan: changed })
                .is_err()
        );
        w.execute(op(4), save(&s, "Uncommitted source")).unwrap();
        let draft = w.open_document(d).unwrap();
        let mut changed = plan.clone();
        changed.expected_draft = Some(clipboard::DraftContext {
            generation: draft.generation,
            sequence: draft.acknowledged_sequence,
        });
        assert!(matches!(
            w.execute(op(5), Command::Comment { plan: changed }),
            Err(Error::Conflict)
        ));
        let other = match w
            .execute(
                op(6),
                Command::Create {
                    title: "Other".into(),
                    text: "Other".into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let os = w.open_document(other).unwrap();
        let cursor = w.comments_page(d, s.snapshot, None, 8).unwrap().entries[0].revision;
        assert!(
            w.comments_page(other, os.snapshot, Some(cursor), 8)
                .is_err()
        );
        assert!(w.comments_page(d, os.snapshot, None, 8).is_err());
        for limit in [0, MAX_PAGE + 1] {
            assert!(matches!(
                w.comments_page(d, s.snapshot, None, limit),
                Err(Error::Invalid)
            ));
        }
        let owner = w.owner;
        w.owner = PrincipalId([99; 32]);
        assert!(w.comments_page(d, s.snapshot, None, 8).is_err());
        assert!(w.execute(op(2), Command::Comment { plan }).is_err());
        w.owner = owner;
    }
    #[test]
    fn authenticated_body_receipt_and_paging_link_corruption_are_rejected() {
        for fault in ["body", "receipt", "link", "ordinal", "source"] {
            let t = Temp::new();
            let mut w = Workspace::create(&t.db(), PASS, "Human").unwrap();
            let d = create(&mut w);
            let s = w.open_document(d).unwrap();
            w.execute(op(2), Command::Comment { plan: request(&s) })
                .unwrap();
            w.execute(op(3), Command::Comment { plan: request(&s) })
                .unwrap();
            let page = w.comments_page(d, s.snapshot, None, 8).unwrap();
            let mut value = page.entries[0].clone();
            match fault {
                "body" => value.body.push('x'),
                "receipt" => value.operation = op(2),
                "link" => value.previous_document_comment = Some(value.revision),
                "ordinal" => value.ordinal = 3,
                _ => value.source.revision = RevisionId([99; 32]),
            }
            let cipher = Cipher {
                key: &w.key,
                workspace: w.workspace,
            };
            let bytes = cipher.seal(KIND, value.revision.0, 0, &value).unwrap();
            w.db.execute(
                "UPDATE objects SET envelope=?1 WHERE kind=?2 AND id=?3",
                params![bytes, KIND, value.revision.0.as_slice()],
            )
            .unwrap();
            assert!(w.comments_page(d, s.snapshot, None, 8).is_err(), "{fault}");
        }
    }
}
