// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Current workspace scope before reads and replay
//!
//! Check the implemented owner/device catalogue and the document scope of command
//! inputs and receipt outputs. Retained IDs or a previously successful operation
//! do not override the current scope check when protected data is released.
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
//! Used by: Workspace dispatch/receipt recovery, assertion readers and
//! protected storage queries.
//!
//! Specification:
//! - [Authority concepts and distinctions][spec0]
//! - [Shared operation coordination][spec1]
//! - [Current and candidate authority boundaries][spec2]
//!
//! Boundary: This is the bounded sole-owner implementation, not the
//! candidate general workspace-user policy. Mutable write preconditions
//! stay separate so a valid frozen retry can reconcile.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/authority.rs
//! [spec0]: ../../../../docs/05-domain/diagrams/authority-distinction.c4
//! [spec1]: ../../../../docs/06-subsystems/diagrams/shared-responsibilities.c4
//! [spec2]: ../../../../docs/06-subsystems/contracts/authority-lifecycle.md

use super::*;

/// Authenticate the stored current catalogue against this open workspace's owner/device.
pub(super) fn catalog(
    cipher: &Cipher<'_>,
    db: &Connection,
    owner: PrincipalId,
    device: DeviceId,
) -> Result<Catalog> {
    let (_, value): (_, Catalog) = cipher.slot(db, CATALOG, ROOT)?;
    if value.owner != owner || value.device != device {
        return Err(Error::Integrity);
    }

    Ok(value)
}

/// Require present membership in the current catalogue without implying source validity.
pub(super) fn document(catalog: &Catalog, id: DocumentId) -> Result<()> {
    if !catalog.documents.contains(&id) {
        return Err(Error::NotFound);
    }

    Ok(())
}

/// Require current document scope for every participant of the retained assertion.
fn assertion(cipher: &Cipher<'_>, db: &Connection, catalog: &Catalog, node: NodeId) -> Result<()> {
    let entry = assertions::read_entry(cipher, db, catalog.owner, node)?;
    for input in &entry.record.participants {
        document(catalog, input.source.document)?;
    }

    Ok(())
}

/// Scope checks omit mutable preconditions so an authorized frozen retry remains valid.
pub(super) fn command(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    command: &Command,
) -> Result<()> {
    match command {
        Command::Save { document: id, .. } | Command::Commit { document: id, .. } => {
            document(catalog, *id)
        }
        Command::Fork { plan } => document(catalog, plan.source.document),
        Command::Merge { plan } => {
            for input in &plan.inputs {
                document(catalog, input.source.document)?;
            }

            Ok(())
        }
        Command::Comment { plan } => document(catalog, plan.source.document),
        Command::Assertion { mutation } => match mutation {
            assertions::Mutation::Create { participants, .. } => {
                for input in participants {
                    document(catalog, input.source.document)?;
                }

                Ok(())
            }
            assertions::Mutation::Review { node, .. } => assertion(cipher, db, catalog, *node),
        },
        Command::Clipboard {
            mutation: clipboard::Mutation::Capture { source, .. },
        } => document(catalog, source.document),
        // These retain their typed source/branch/reference checks before replay in execute_inner.
        Command::WorkingFork { .. }
        | Command::WorkingCopy { .. }
        | Command::Checkpoint { .. }
        | Command::WorkingClipboard { .. }
        | Command::Branch { .. }
        | Command::Clipboard { .. }
        | Command::Create { .. } => Ok(()),
    }
}

/// Receipt reads/replays must also authorize their result, including newly created outputs.
pub(super) fn outcome(
    cipher: &Cipher<'_>,
    db: &Connection,
    catalog: &Catalog,
    outcome: &Outcome,
) -> Result<()> {
    match outcome {
        Outcome::Created { document: id }
        | Outcome::Saved { document: id, .. }
        | Outcome::Committed { document: id, .. } => document(catalog, *id),
        Outcome::Forked { document: id, .. } => {
            document(catalog, *id)?;
            let doc: Document = cipher.object(db, DOCUMENT, id.0)?;
            let event: forks::Derivation =
                cipher.object(db, forks::KIND, forks::address(doc.node))?;
            for input in event.inputs {
                document(catalog, input.document)?;
            }

            Ok(())
        }
        Outcome::Merged { document: id, .. } => {
            document(catalog, *id)?;
            let doc: Document = cipher.object(db, DOCUMENT, id.0)?;
            let event: merges::Derivation =
                cipher.object(db, merges::KIND, merges::address(doc.node))?;
            for input in event.inputs {
                document(catalog, input.document)?;
            }

            Ok(())
        }
        Outcome::WorkingForked { state } => {
            document(catalog, state.document)?;
            let event: working_forks::Derivation =
                cipher.object(db, working_forks::KIND, state.document.0)?;
            document(catalog, event.input.document)
        }
        Outcome::WorkingCopied { state } => document(catalog, state.source.document),
        Outcome::Checkpointed { state } => document(catalog, state.document),
        Outcome::Commented { state } => document(catalog, state.document),
        Outcome::Assertion { state } => assertion(cipher, db, catalog, state.node),
        Outcome::Branch { state } => match state.outcome {
            branches::EditOutcome::Created { document: id }
            | branches::EditOutcome::Saved { document: id, .. }
            | branches::EditOutcome::Committed { document: id, .. } => document(catalog, id),
        },
        // Count/generation receipts belong to the authenticated principal's private lists.
        Outcome::Clipboard { .. } | Outcome::WorkingClipboard { .. } => Ok(()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::{PASS, Temp, commit, create, op, save};

    /// Remove one document from a synthetic catalogue to challenge retained-handle access.
    fn revoke(ws: &mut Workspace, document: DocumentId) {
        let cipher = Cipher {
            key: &ws.key,
            workspace: ws.workspace,
        };
        let (generation, mut catalog): (_, Catalog) = cipher.slot(&ws.db, CATALOG, ROOT).unwrap();
        // Keep all other catalogue members while revoking this exact document identity.
        catalog.documents.retain(|id| *id != document);
        cipher
            .update(&ws.db, CATALOG, ROOT, generation, &catalog)
            .unwrap();
    }

    /// Verify cached editor/snapshot/receipt handles cannot bypass later scope removal.
    #[test]
    fn retained_editor_snapshot_and_receipts_do_not_override_revoked_document_scope() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let document = create(&mut ws);
        let initial = ws.open_document(document).unwrap();
        let command = save(&initial, "Acknowledged private 😀\r\n");
        ws.execute(op(2), command.clone()).unwrap();
        let saved = ws.open_document(document).unwrap();
        let publication = commit(&saved);
        ws.execute(op(3), publication.clone()).unwrap();
        let published = ws.open_document(document).unwrap();

        revoke(&mut ws, document);

        let changes = ws.db.total_changes();
        assert!(ws.list_documents().unwrap().is_empty());
        assert!(matches!(ws.open_document(document), Err(Error::NotFound)));
        for snapshot in [initial.snapshot, published.snapshot] {
            assert!(matches!(
                ws.reconstruct_snapshot(document, snapshot),
                Err(Error::NotFound)
            ));
        }
        for operation in [op(1), op(2), op(3)] {
            assert!(matches!(ws.receipt(operation), Err(Error::NotFound)));
        }
        assert!(matches!(ws.execute(op(2), command), Err(Error::NotFound)));
        assert!(matches!(
            ws.execute(op(3), publication),
            Err(Error::NotFound)
        ));
        assert!(matches!(
            ws.execute(op(4), save(&published, "Denied")),
            Err(Error::NotFound)
        ));
        assert_eq!(ws.db.total_changes(), changes);
    }

    /// Verify derivation/comment/assertion/clipboard retries reauthorize every protected input.
    #[test]
    fn retained_legacy_derivation_annotation_and_assertion_replays_recheck_all_input_scope() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let document = create(&mut ws);
        let editor = ws.open_document(document).unwrap();
        let source = clipboard::Source {
            document,
            node: editor.node,
            snapshot: editor.snapshot,
            revision: editor.base,
            occurrence_path: vec![editor.occurrence],
            start_byte: 0,
            end_byte: editor.text.len(),
        };
        let fork = Command::Fork {
            plan: forks::Request {
                title: "Independent".into(),
                source: source.clone(),
                expected_draft: None,
                quote: editor.text.clone(),
            },
        };
        let fork_id = match ws.execute(op(2), fork.clone()).unwrap().outcome {
            Outcome::Forked { document, .. } => document,
            _ => panic!(),
        };
        let comment = Command::Comment {
            plan: comments::Request {
                source: source.clone(),
                expected_draft: None,
                quote: editor.text.clone(),
                body: "Synthetic comment".into(),
            },
        };
        ws.execute(op(3), comment.clone()).unwrap();
        let assertion = Command::Assertion {
            mutation: assertions::tests::create(&editor),
        };
        let change = match ws.execute(op(4), assertion.clone()).unwrap().outcome {
            Outcome::Assertion { state } => state,
            _ => panic!(),
        };
        let review = Command::Assertion {
            mutation: assertions::Mutation::Review {
                node: change.node,
                revision: change.revision,
                generation: change.generation,
                status: assertions::Status::Accepted,
            },
        };
        ws.execute(op(6), review.clone()).unwrap();
        let output = ws.open_document(fork_id).unwrap();
        let other_source = clipboard::Source {
            document: fork_id,
            node: output.node,
            snapshot: output.snapshot,
            revision: output.base,
            occurrence_path: vec![output.occurrence],
            start_byte: 0,
            end_byte: output.text.len(),
        };
        let merge = Command::Merge {
            plan: merges::Request {
                title: "Reviewed independent result".into(),
                text: "Synthetic synthesis".into(),
                inputs: vec![
                    merges::Input {
                        source: source.clone(),
                        expected_draft: None,
                        quote: editor.text.clone(),
                    },
                    merges::Input {
                        source: other_source,
                        expected_draft: None,
                        quote: output.text,
                    },
                ],
            },
        };
        ws.execute(op(7), merge.clone()).unwrap();
        let capture = Command::Clipboard {
            mutation: clipboard::Mutation::Capture {
                generation: 0,
                source,
                expected_draft: None,
                quote: editor.text.clone(),
            },
        };
        ws.execute(op(5), capture.clone()).unwrap();

        revoke(&mut ws, document);

        let changes = ws.db.total_changes();
        // Independent output remains authorized; its retained input and receipt grant no source access.
        assert_eq!(ws.open_document(fork_id).unwrap().text, editor.text);
        for (operation, command) in [
            (op(2), fork),
            (op(3), comment),
            (op(4), assertion),
            (op(5), capture),
            (op(6), review),
            (op(7), merge),
        ] {
            assert!(matches!(
                ws.execute(operation, command),
                Err(Error::NotFound)
            ));
        }
        for operation in [op(2), op(3), op(4), op(6), op(7)] {
            assert!(matches!(ws.receipt(operation), Err(Error::NotFound)));
        }
        assert_eq!(ws.db.total_changes(), changes);
    }

    /// Verify receipt output scope is current even when its original input remains allowed.
    #[test]
    fn replay_result_scope_is_current_even_when_original_input_remains_authorized() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let document = create(&mut ws);
        let editor = ws.open_document(document).unwrap();
        let command = Command::Fork {
            plan: forks::Request {
                title: "Independent".into(),
                source: clipboard::Source {
                    document,
                    node: editor.node,
                    snapshot: editor.snapshot,
                    revision: editor.base,
                    occurrence_path: vec![editor.occurrence],
                    start_byte: 0,
                    end_byte: editor.text.len(),
                },
                expected_draft: None,
                quote: editor.text.clone(),
            },
        };
        let output = match ws.execute(op(2), command.clone()).unwrap().outcome {
            Outcome::Forked { document, .. } => document,
            _ => panic!(),
        };
        revoke(&mut ws, output);
        assert_eq!(ws.open_document(document).unwrap().text, editor.text);
        assert!(matches!(ws.execute(op(2), command), Err(Error::NotFound)));
        assert!(matches!(ws.receipt(op(2)), Err(Error::NotFound)));
    }

    /// Reject cached-principal/device mismatches before returning protected legacy data.
    #[test]
    fn legacy_reads_recheck_cached_principal_and_device_before_returning_protected_data() {
        let temp = Temp::new();
        let mut ws = Workspace::create(&temp.db(), PASS, "Synthetic").unwrap();
        let document = create(&mut ws);
        let editor = ws.open_document(document).unwrap();
        let owner = ws.owner;
        let device = ws.device;
        for wrong_owner in [true, false] {
            ws.owner = if wrong_owner {
                PrincipalId([99; 32])
            } else {
                owner
            };
            ws.device = if wrong_owner {
                device
            } else {
                DeviceId([99; 32])
            };
            assert!(matches!(ws.list_documents(), Err(Error::Integrity)));
            assert!(matches!(ws.open_document(document), Err(Error::Integrity)));
            assert!(matches!(
                ws.reconstruct_snapshot(document, editor.snapshot),
                Err(Error::Integrity)
            ));
            assert!(matches!(ws.receipt(op(1)), Err(Error::Integrity)));
        }
        ws.owner = owner;
        ws.device = device;
        assert_eq!(ws.open_document(document).unwrap().text, editor.text);
        assert!(ws.receipt(op(1)).is_ok());
    }
}
