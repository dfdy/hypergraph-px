// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Separately acknowledged temporal reference replacement
//!
//! Run the experimental working-reference promotion batch independently of its
//! already acknowledged text publication. Preserve original intent/receipt bytes
//! and reconcile an exact retry before interpreting a newer mutable generation.
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
//! Used by: Experimental storage temporal-publication workflow and its
//! synthetic acceptance tests.
//!
//! Specification:
//! - [Application coordination][spec0]
//! - [Temporal publication and separate replacement][spec1]
//! - [Experimental record contract][spec2]
//!
//! Boundary: Marker3 fixture scope only: no runtime route, format upgrade
//! or ordinary writer is enabled. Receipt8 replacement is not a temporal
//! Commit alias.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/storage/src/temporal_references.rs
//! [spec0]: ../../../../docs/07-implementation/diagrams/application-coordination.c4
//! [spec1]: ../../../../docs/07-implementation/protocols/draft-publication.md
//! [spec2]: ../../../../docs/07-implementation/data-structures/sqlite-records.md

use super::*;

impl Workspace {
    /// Keeps the original WorkingClipboard Promote intent/receipt8 bytes. This
    /// is not a legacy Commit alias or permission to run ordinary writers on3.
    pub fn temporal_replace_references(
        &mut self,
        operation: OperationId,
        publication: OperationId,
        generation: u64,
    ) -> Result<Receipt> {
        // The ordinary entrypoint observes no injected faults.
        self.temporal_replace_references_inner(operation, publication, generation, |_| Ok(()))
    }

    /// Execute one protected promotion transaction with injectable publication checkpoints.
    /// Guard authority/format and cross-family operation collisions before replay or mutation.
    pub(super) fn temporal_replace_references_inner(
        &mut self,
        operation: OperationId,
        publication: OperationId,
        generation: u64,
        mut fault: impl FnMut(&str) -> Result<()>,
    ) -> Result<Receipt> {
        let mutation = working_clipboard::Mutation::Promote {
            generation,
            publication,
        };
        working_clipboard::validate(&mutation)?;
        let command = Command::WorkingClipboard {
            mutation: mutation.clone(),
        };
        // Preserve the original command representation and hide serializer diagnostics.
        let bytes = Zeroizing::new(serde_json::to_vec(&command).map_err(|_| Error::Format)?);
        let digest: [u8; 32] = Sha256::digest(&*bytes).into();

        let cipher = Cipher {
            key: &self.key,
            workspace: self.workspace,
        };
        let tx = self
            .db
            .transaction_with_behavior(TransactionBehavior::Immediate)?;
        let catalog = authority::catalog(&cipher, &tx, self.owner, self.device)?;

        let mut left = 64 * 1024 * 1024;
        temporal_save::guard(&cipher, &tx, &mut left)?;
        working_clipboard::authorize(&cipher, &tx, &catalog, &mutation)?;
        for kind in [
            temporal_save::RECEIPT_KIND,
            temporal_commit_record::CANDIDATE_KIND,
        ] {
            if temporal_save::charge(&tx, "objects", kind, operation.0, &mut left)? {
                return Err(Error::Conflict);
            }
        }

        // Reconcile this operation before applying newer index-generation checks.
        if temporal_save::charge(&tx, "objects", RECEIPT, operation.0, &mut left)? {
            let stored: StoredReceipt = cipher.object(&tx, RECEIPT, operation.0)?;
            if stored.digest != digest || stored.receipt.operation != operation {
                return Err(Error::Conflict);
            }
            let Outcome::WorkingClipboard { state } = &stored.receipt.outcome else {
                return Err(Error::Integrity);
            };
            if state.generation < generation
                || state.generation > generation + 1
                || state.count > working_clipboard::MAX_ENTRIES
            {
                return Err(Error::Integrity);
            }
            tx.commit()?;
            return Ok(stored.receipt);
        }

        let state = working_clipboard::apply(&cipher, &tx, &catalog, mutation)?;
        fault("references")?;
        let receipt = Receipt {
            operation,
            outcome: Outcome::WorkingClipboard { state },
        };
        cipher.insert(
            &tx,
            RECEIPT,
            operation.0,
            &StoredReceipt {
                digest,
                receipt: receipt.clone(),
            },
        )?;
        fault("receipt")?;

        tx.commit()?;
        fault("committed")?;
        Ok(receipt)
    }
}
