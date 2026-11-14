// SPDX-License-Identifier: AGPL-3.0-only
//! Publication evidence, explicitly narrower than complete contributor attribution.
use super::*;
/// Ephemeral encrypted continuation context; never written to objects or slots.
const CURSOR_KIND: i32 = 1_000_001;
pub const MAX_CURSOR_BYTES: usize = 4096;
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Cursor {
    #[serde(with = "encoding::identity")]
    document: DocumentId,
    #[serde(with = "encoding::identity")]
    snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    next: RevisionId,
}
#[derive(Debug, Serialize)]
pub struct Human {
    #[serde(with = "encoding::identity")]
    pub principal: PrincipalId,
    pub label: String,
}
#[derive(Debug, Serialize)]
pub struct Publication {
    #[serde(with = "encoding::identity")]
    pub principal: PrincipalId,
    #[serde(with = "encoding::identity")]
    pub revision: RevisionId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    #[serde(with = "encoding::identity")]
    pub operation: OperationId,
    pub role: &'static str,
}
#[derive(Debug, Serialize)]
pub struct Page {
    pub projection: &'static str,
    #[serde(with = "encoding::identity")]
    pub document: DocumentId,
    #[serde(with = "encoding::identity")]
    pub snapshot: SnapshotId,
    pub current_human: Human,
    pub current_agent: Option<Human>,
    pub publications: Vec<Publication>,
    pub next: Option<Vec<u8>>,
    pub complete_text_publications: bool,
    pub complete_contributors: bool,
    pub excluded_families: Vec<&'static str>,
}
fn cursor_address(owner: PrincipalId) -> [u8; 32] {
    let mut h = Sha256::new();
    h.update(b"hpx/publication-contributors/cursor/v1\0");
    h.update(owner.0);
    h.finalize().into()
}
impl Workspace {
    pub fn publication_contributors(
        &mut self,
        document: DocumentId,
        snapshot: SnapshotId,
        cursor: Option<&[u8]>,
        limit: usize,
    ) -> Result<Page> {
        if !(1..=history::MAX_PAGE).contains(&limit)
            || cursor.is_some_and(|c| c.is_empty() || c.len() > MAX_CURSOR_BYTES)
        {
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
        if catalog.owner_label.len() > 4096 {
            return Err(Error::Limit);
        }
        let mut remaining = history::PAGE_BYTES;
        let doc: Document = history::object(&cipher, &tx, DOCUMENT, document.0, &mut remaining)?;
        let snap: Snapshot = history::object(&cipher, &tx, SNAPSHOT, snapshot.0, &mut remaining)?;
        if doc.id != document
            || snap.document != document
            || snap.manifest != doc.manifest
            || snap.bindings.len() != 1
            || snap.bindings[0].node != doc.node
            || snap.bindings[0].path != [doc.occurrence]
        {
            return Err(Error::Integrity);
        }
        let start = if let Some(bytes) = cursor {
            let token: Cursor = cipher
                .open(CURSOR_KIND, cursor_address(self.owner), 0, bytes)
                .map_err(|_| Error::Invalid)?;
            if token.document != document || token.snapshot != snapshot {
                return Err(Error::Invalid);
            }
            token.next
        } else {
            snap.bindings[0].revision
        };
        let page = history::read_page(
            &cipher,
            &tx,
            &catalog,
            document,
            Some(start),
            limit,
            &mut remaining,
        )?;
        if cursor.is_none()
            && page
                .entries
                .first()
                .is_none_or(|entry| entry.snapshot != snapshot)
        {
            return Err(Error::Integrity);
        }
        let next = page
            .next
            .map(|next| {
                cipher.seal(
                    CURSOR_KIND,
                    cursor_address(self.owner),
                    0,
                    &Cursor {
                        document,
                        snapshot,
                        next,
                    },
                )
            })
            .transpose()?;
        let publications = page
            .entries
            .into_iter()
            .map(|entry| Publication {
                principal: entry.actor,
                revision: entry.revision,
                snapshot: entry.snapshot,
                operation: entry.operation,
                role: "publisher",
            })
            .collect();
        let result = Page {
            projection: "text_publication_contributors",
            document,
            snapshot,
            current_human: Human {
                principal: self.owner,
                label: catalog.owner_label,
            },
            current_agent: None,
            publications,
            complete_text_publications: next.is_none(),
            next,
            complete_contributors: false,
            excluded_families: vec![
                "original_text_authorship",
                "semantic_reviews",
                "comments",
                "interaction_records",
            ],
        };
        tx.commit()?;
        Ok(result)
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};
    #[test]
    fn pinned_pages_retain_earlier_publishers_and_ignore_newer_heads_across_restart() {
        let t = Temp::new();
        let mut w = Workspace::create(&t.db(), PASS, "Actual owner").unwrap();
        let d = create(&mut w);
        let first = w.open_document(d).unwrap();
        for i in 0..3 {
            let s = w.open_document(d).unwrap();
            w.execute(op(2 + i * 2), save(&s, &format!("Publication {i}😀\r\n")))
                .unwrap();
            let s = w.open_document(d).unwrap();
            w.execute(op(3 + i * 2), commit(&s)).unwrap();
        }
        let s = w.open_document(d).unwrap();
        let page = w.publication_contributors(d, s.snapshot, None, 2).unwrap();
        assert_eq!(page.current_human.label, "Actual owner");
        assert_eq!(page.current_human.principal, w.owner);
        assert!(page.current_agent.is_none());
        assert!(!page.complete_contributors);
        assert!(!page.complete_text_publications);
        assert_eq!(page.publications.len(), 2);
        w.execute(op(20), save(&s, "Newer publisher state"))
            .unwrap();
        let draft = w.open_document(d).unwrap();
        w.execute(op(21), commit(&draft)).unwrap();
        drop(w);
        let mut w = Workspace::open(&t.db(), PASS).unwrap();
        let older = w
            .publication_contributors(d, s.snapshot, page.next.as_deref(), 2)
            .unwrap();
        assert!(older.complete_text_publications);
        assert_eq!(older.publications.last().unwrap().revision, first.base);
        assert!(older.publications.iter().all(|p| p.role == "publisher"));
        let original = w
            .publication_contributors(d, first.snapshot, None, 32)
            .unwrap();
        assert_eq!(original.publications.len(), 1);
        assert!(original.complete_text_publications);
    }
    #[test]
    fn cursor_tampering_cross_document_and_authority_changes_cannot_extend_scope() {
        let t = Temp::new();
        let mut w = Workspace::create(&t.db(), PASS, "Owner").unwrap();
        let d = create(&mut w);
        let first = w.open_document(d).unwrap();
        w.execute(op(2), save(&first, "Later")).unwrap();
        let draft = w.open_document(d).unwrap();
        w.execute(op(3), commit(&draft)).unwrap();
        let s = w.open_document(d).unwrap();
        let page = w.publication_contributors(d, s.snapshot, None, 1).unwrap();
        let mut token = page.next.unwrap();
        token[20] ^= 1;
        assert!(
            w.publication_contributors(d, s.snapshot, Some(&token), 1)
                .is_err()
        );
        let good = w
            .publication_contributors(d, s.snapshot, None, 1)
            .unwrap()
            .next
            .unwrap();
        assert!(
            w.publication_contributors(d, first.snapshot, Some(&good), 1)
                .is_err()
        );
        let r = w
            .execute(
                op(4),
                Command::Create {
                    title: "Other".into(),
                    text: "Other".into(),
                },
            )
            .unwrap();
        let Outcome::Created { document: other } = r.outcome else {
            panic!()
        };
        let o = w.open_document(other).unwrap();
        assert!(
            w.publication_contributors(other, o.snapshot, Some(&good), 1)
                .is_err()
        );
        let owner = w.owner;
        w.owner = PrincipalId([99; 32]);
        assert!(matches!(
            w.publication_contributors(d, s.snapshot, None, 1),
            Err(Error::Integrity)
        ));
        w.owner = owner;
        assert!(
            w.publication_contributors(d, s.snapshot, Some(&[]), 1)
                .is_err()
        );
        assert!(w.publication_contributors(d, s.snapshot, None, 33).is_err());
    }
}
