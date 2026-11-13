// SPDX-License-Identifier: AGPL-3.0-only
//! Separately acknowledged experimental working-reference replacement only.
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
        self.temporal_replace_references_inner(operation, publication, generation, |_| Ok(()))
    }
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
