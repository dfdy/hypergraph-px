// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Exact historical passage reads
//!
//! Resolve an anchor against its explicitly selected retained snapshot/revision
//! in one consistent read transaction. Preserve original text bytes and occurrence
//! context even when the current document head has changed.
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
//! Used by: Runtime historical-anchor API and workspace source-inspection
//! consumers.
//!
//! Specification:
//! - [Exact source and coordinate responsibilities][spec0]
//! - [Text and anchor invariants][spec1]
//! - [Historical query contract][spec2]
//!
//! Boundary: Current owner/device scope and one owned occurrence are
//! enforced. No automatic relocation, checkpoint promotion, multi-owner
//! reconstruction or source mutation occurs.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/anchors.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/pure-domain.c4
//! [spec1]: ../../../../docs/05-domain/text-and-anchors.md
//! [spec2]: ../../../../docs/06-subsystems/interfaces/domain-navigation.md

use super::*;
impl Workspace {
    /// Authenticate current document scope, then read only the exact retained byte range.
    /// Empty ranges are valid; wrong snapshot/revision/occurrence or scalar cuts fail.
    pub fn resolve_anchor(
        &mut self,
        document: DocumentId,
        snapshot: SnapshotId,
        anchor: &Anchor,
    ) -> Result<String> {
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
        if anchor.occurrence_path != [doc.occurrence] {
            return Err(Error::Invalid);
        }
        if snapshot_revision(&cipher, &tx, &doc, snapshot)? != anchor.revision {
            return Err(Error::Conflict);
        }

        let revision: Revision = cipher.object(&tx, REVISION, anchor.revision.0)?;
        if revision.node != doc.node {
            return Err(Error::Integrity);
        }
        if revision.text.len() > MAX_TEXT_BYTES {
            return Err(Error::Limit);
        }
        validate_byte_range(&revision.text, anchor.start_byte, anchor.end_byte)
            // A bad range is caller input, not an invitation to relocate the anchor.
            .map_err(|_| Error::Invalid)?;

        let selected = revision.text[anchor.start_byte..anchor.end_byte].to_owned();
        tx.commit()?;

        Ok(selected)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, op, save};
    /// Guard repeated-text/Unicode/newline selection across later commits and restart.
    #[test]
    fn exact_ranges_preserve_repeated_unicode_and_newlines_after_edits_and_restart() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let text = "same😀\r\nsame😀\r\n中 e\u{301}";
        let doc = match ws
            .execute(
                op(1),
                Command::Create {
                    title: "Synthetic".into(),
                    text: text.into(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        let state = ws.open_document(doc).unwrap();
        let start = "same😀\r\n".len();
        let anchor = Anchor {
            revision: state.base,
            occurrence_path: vec![state.occurrence],
            start_byte: start,
            end_byte: text.len(),
        };
        assert_eq!(
            ws.resolve_anchor(doc, state.snapshot, &anchor).unwrap(),
            "same😀\r\n中 e\u{301}"
        );

        ws.execute(op(2), save(&state, "Changed head\n")).unwrap();
        let changed = ws.open_document(doc).unwrap();
        ws.execute(op(3), commit(&changed)).unwrap();
        drop(ws);
        let mut ws = Workspace::open(&temp.db(), PASS).unwrap();
        assert_eq!(
            ws.resolve_anchor(doc, state.snapshot, &anchor).unwrap(),
            "same😀\r\n中 e\u{301}"
        );
        assert_eq!(ws.open_document(doc).unwrap().text, "Changed head\n");

        let mut point = anchor.clone();
        point.end_byte = point.start_byte;
        assert_eq!(ws.resolve_anchor(doc, state.snapshot, &point).unwrap(), "");
    }

    /// Reject mismatched history/context and invalid scalar ranges without changing state.
    #[test]
    fn wrong_revision_occurrence_scope_and_split_scalars_fail_without_relocation() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let doc = crate::tests::create(&mut ws);
        let state = ws.open_document(doc).unwrap();
        let valid = Anchor {
            revision: state.base,
            occurrence_path: vec![state.occurrence],
            start_byte: 0,
            end_byte: state.text.len(),
        };
        let mut wrong = valid.clone();
        wrong.revision = RevisionId([9; 32]);
        assert!(matches!(
            ws.resolve_anchor(doc, state.snapshot, &wrong),
            Err(Error::Conflict)
        ));
        wrong = valid.clone();
        wrong.occurrence_path.push(state.occurrence);
        assert!(matches!(
            ws.resolve_anchor(doc, state.snapshot, &wrong),
            Err(Error::Invalid)
        ));
        wrong = valid.clone();
        wrong.end_byte = state.text.len() + 1;
        assert!(matches!(
            ws.resolve_anchor(doc, state.snapshot, &wrong),
            Err(Error::Invalid)
        ));
        wrong = valid.clone();
        wrong.start_byte = state.text.find('😀').unwrap() + 1;
        assert!(matches!(
            ws.resolve_anchor(doc, state.snapshot, &wrong),
            Err(Error::Invalid)
        ));
        wrong = valid.clone();
        wrong.start_byte = wrong.end_byte;
        wrong.end_byte = 0;
        assert!(matches!(
            ws.resolve_anchor(doc, state.snapshot, &wrong),
            Err(Error::Invalid)
        ));
        let other = match ws
            .execute(
                op(2),
                Command::Create {
                    title: "Other".into(),
                    text: state.text.clone(),
                },
            )
            .unwrap()
            .outcome
        {
            Outcome::Created { document } => document,
            _ => panic!(),
        };
        assert!(matches!(
            ws.resolve_anchor(other, state.snapshot, &valid),
            Err(Error::Invalid) | Err(Error::Integrity)
        ));
        assert!(matches!(
            ws.resolve_anchor(doc, SnapshotId([9; 32]), &valid),
            Err(Error::NotFound)
        ));
        assert_eq!(ws.open_document(doc).unwrap().generation, state.generation);
    }
}
