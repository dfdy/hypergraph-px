// SPDX-License-Identifier: AGPL-3.0-only
//! # Hypergraph PX — Explicit native keychain provider
//!
//! Supply create-only storage, retrieval and checked removal of independent
//! workspace device secrets through the native macOS keychain. Unsupported
//! platforms report unavailability while ordinary passphrase recovery stays
//! separate.
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
//! Used by: Workspace keychain enrollment/unlock adapter; the explicitly
//! invoked synthetic signing probe.
//!
//! Specification:
//! - [Keychain responsibility boundaries][spec0]
//! - [Explicit enrollment and recovery policy][spec1]
//!
//! Boundary: Provider calls may require OS consent. No startup reads,
//! plaintext-file fallback or hostile-host erasure/atomic compare-delete
//! guarantee is provided.
//!
//! [source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/crates/keychain/src/lib.rs
//! [spec0]: ../../../../docs/06-subsystems/diagrams/shared-responsibilities.c4
//! [spec1]: ../../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md

use zeroize::Zeroizing;

/// Non-secret provider outcomes; callers decide recovery without overwriting credentials.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    /// No supported/currently usable native keychain backend.
    Unavailable,
    /// This exact service/workspace item does not exist.
    NotFound,
    /// Create-only enrollment encountered an existing item.
    Exists,
    /// The OS refused or cancelled credential access.
    Denied,
    /// Secret width or expected-value verification failed.
    Invalid,
    /// Another native-provider failure, without exposing credential data.
    Backend,
}

/// Provider result with the stable, non-secret error vocabulary above.
pub type Result<T> = std::result::Result<T, Error>;

/// No Debug/Clone/Serde; caller-owned bytes and OS allocations have separate lifetimes.
pub struct DeviceSecret(Zeroizing<[u8; 32]>);
impl DeviceSecret {
    /// Own the fixed-width device secret in a buffer zeroized when dropped.
    pub fn from_bytes(bytes: [u8; 32]) -> Self {
        Self(Zeroizing::new(bytes))
    }

    /// Copy exactly 32 bytes into managed storage; reject other credential widths.
    pub fn from_slice(bytes: &[u8]) -> Result<Self> {
        let mut secret = Self::from_bytes([0; 32]);

        if bytes.len() != 32 {
            return Err(Error::Invalid);
        }
        secret.0.copy_from_slice(bytes);
        Ok(secret)
    }

    /// Borrow secret bytes for wrapping/comparison without cloning the secret owner.
    pub fn bytes(&self) -> &[u8; 32] {
        &self.0
    }
}

/// Explicit workspace-scoped credential operations, distinct from workspace authority.
pub trait Provider {
    /// Pure capability query; must not read/unlock a keychain.
    fn supported(&self) -> bool;
    /// Create only. An existing item must never be overwritten.
    fn create(&mut self, workspace: [u8; 16], secret: &DeviceSecret) -> Result<()>;
    /// Retrieve only the item selected by this workspace; no fallback item is permitted.
    fn load(&mut self, workspace: [u8; 16]) -> Result<DeviceSecret>;
    /// Verify expected contents and scope deletion to this workspace's item.
    fn remove(&mut self, workspace: [u8; 16], expected: &DeviceSecret) -> Result<()>;
}

/// An inert provider until an explicitly requested operation calls its methods.
#[derive(Default)]
pub struct Native;

#[cfg(target_os = "macos")]
mod macos {
    use super::*;
    use security_framework::{
        item::{ItemClass, ItemSearchOptions},
        os::macos::keychain::SecKeychain,
    };
    const SERVICE: &str = "org.hypergraph-px.workspace-unlock.v1";

    /// Encode the opaque workspace ID as a stable account without document metadata.
    fn account(workspace: [u8; 16]) -> String {
        // Render each ID byte as two hex digits, retaining leading zeroes.
        workspace.iter().map(|byte| format!("{byte:02x}")).collect()
    }

    /// Translate OSStatus into stable outcomes without passing native details upward.
    fn map(error: security_framework::base::Error) -> Error {
        match error.code() {
            -25300 => Error::NotFound,
            -25299 => Error::Exists,
            -128 | -25293 | -25308 => Error::Denied,
            -25291 => Error::Unavailable,
            _ => Error::Backend,
        }
    }
    impl Provider for Native {
        /// Report macOS backend availability without opening or reading credentials.
        fn supported(&self) -> bool {
            true
        }

        /// Add this workspace item through the create-only native API and default ACL.
        fn create(&mut self, workspace: [u8; 16], secret: &DeviceSecret) -> Result<()> {
            // SecKeychainAddGenericPassword uses the current user's file keychain
            // and its native ACL. Unlike set_generic_password this never updates.
            SecKeychain::default()
                .map_err(map)?
                .add_generic_password(SERVICE, &account(workspace), secret.bytes())
                .map_err(map)
        }

        /// Read the exact default-keychain service/account and enforce secret width.
        fn load(&mut self, workspace: [u8; 16]) -> Result<DeviceSecret> {
            let keychain = SecKeychain::default().map_err(map)?;
            let (password, _) = keychain
                .find_generic_password(SERVICE, &account(workspace))
                .map_err(map)?;
            DeviceSecret::from_slice(password.as_ref())
        }

        /// Verify the current secret before scoped checked deletion; OS calls are separate.
        fn remove(&mut self, workspace: [u8; 16], expected: &DeviceSecret) -> Result<()> {
            let current = self.load(workspace)?;
            if current
                .bytes()
                .iter()
                .zip(expected.bytes())
                // Accumulate every byte mismatch rather than returning at the first.
                .fold(0u8, |difference, (a, b)| difference | (a ^ b))
                != 0
            {
                return Err(Error::Invalid);
            }
            // Use the checked deletion API (legacy item.delete discards OSStatus).
            let keychain = SecKeychain::default().map_err(map)?;
            ItemSearchOptions::new()
                .keychains(&[keychain])
                .class(ItemClass::generic_password())
                .service(SERVICE)
                .account(&account(workspace))
                .delete()
                .map_err(map)
        }
    }
}

#[cfg(not(target_os = "macos"))]
impl Provider for Native {
    /// Report this platform unavailable without accessing any credential service.
    fn supported(&self) -> bool {
        false
    }

    /// Fail explicit enrollment on unsupported platforms without creating fallback storage.
    fn create(&mut self, _: [u8; 16], _: &DeviceSecret) -> Result<()> {
        Err(Error::Unavailable)
    }

    /// Fail explicit unlock on unsupported platforms rather than reading another source.
    fn load(&mut self, _: [u8; 16]) -> Result<DeviceSecret> {
        Err(Error::Unavailable)
    }

    /// Report unsupported removal without claiming an item was deleted.
    fn remove(&mut self, _: [u8; 16], _: &DeviceSecret) -> Result<()> {
        Err(Error::Unavailable)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    /// Check fixed credential width without opening the native keychain.
    #[test]
    fn secrets_require_exact_width() {
        assert!(matches!(
            DeviceSecret::from_slice(&[0; 31]),
            Err(Error::Invalid)
        ));
        assert!(matches!(
            DeviceSecret::from_slice(&[0; 33]),
            Err(Error::Invalid)
        ));
        assert_eq!(
            DeviceSecret::from_slice(&[7; 32]).unwrap().bytes(),
            &[7; 32]
        );
    }

    /// Exercise create-only/read/expected-secret removal on a unique synthetic item.
    /// This remains ignored unless explicitly authorized; it may prompt for consent.
    #[cfg(target_os = "macos")]
    #[test]
    #[ignore = "explicit native test; touches only a unique synthetic item and may prompt for OS consent"]
    fn native_create_only_roundtrip_and_scoped_removal() {
        let mut workspace = [0; 16];
        getrandom::fill(&mut workspace).unwrap();
        let mut bytes = Zeroizing::new([0; 32]);
        getrandom::fill(&mut *bytes).unwrap();
        let secret = DeviceSecret::from_slice(&*bytes).unwrap();
        let mut provider = Native;
        provider.create(workspace, &secret).unwrap();
        struct Cleanup([u8; 16], DeviceSecret);
        impl Drop for Cleanup {
            /// Best-effort cleanup of the exact synthetic item if the test unwinds.
            fn drop(&mut self) {
                // Best effort during panic, checked explicitly on the successful path.
                let _ = Native.remove(self.0, &self.1);
            }
        }
        let cleanup = Cleanup(workspace, secret);
        let secret = &cleanup.1;
        assert_eq!(provider.load(workspace).unwrap().bytes(), secret.bytes());
        assert_eq!(
            provider.create(workspace, &DeviceSecret::from_bytes([0; 32])),
            Err(Error::Exists)
        );
        assert_eq!(
            provider.remove(workspace, &DeviceSecret::from_bytes([0; 32])),
            Err(Error::Invalid)
        );
        assert_eq!(provider.load(workspace).unwrap().bytes(), secret.bytes());
        provider.remove(workspace, secret).unwrap();
        assert!(matches!(provider.load(workspace), Err(Error::NotFound)));
    }
}
