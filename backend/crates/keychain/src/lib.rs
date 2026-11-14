// SPDX-License-Identifier: AGPL-3.0-only
//! Explicit native credential operations only. No startup reads or file fallback.
use zeroize::Zeroizing;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Error {
    Unavailable,
    NotFound,
    Exists,
    Denied,
    Invalid,
    Backend,
}
pub type Result<T> = std::result::Result<T, Error>;

/// No Debug/Clone/Serde; caller-owned bytes and OS allocations have separate lifetimes.
pub struct DeviceSecret(Zeroizing<[u8; 32]>);
impl DeviceSecret {
    pub fn from_bytes(bytes: [u8; 32]) -> Self {
        Self(Zeroizing::new(bytes))
    }
    pub fn from_slice(bytes: &[u8]) -> Result<Self> {
        let mut secret = Self::from_bytes([0; 32]);
        if bytes.len() != 32 {
            return Err(Error::Invalid);
        }
        secret.0.copy_from_slice(bytes);
        Ok(secret)
    }
    pub fn bytes(&self) -> &[u8; 32] {
        &self.0
    }
}

pub trait Provider {
    /// Pure capability query; must not read/unlock a keychain.
    fn supported(&self) -> bool;
    /// Create only. An existing item must never be overwritten.
    fn create(&mut self, workspace: [u8; 16], secret: &DeviceSecret) -> Result<()>;
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
    fn account(workspace: [u8; 16]) -> String {
        workspace.iter().map(|byte| format!("{byte:02x}")).collect()
    }
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
        fn supported(&self) -> bool {
            true
        }
        fn create(&mut self, workspace: [u8; 16], secret: &DeviceSecret) -> Result<()> {
            // SecKeychainAddGenericPassword uses the current user's file keychain
            // and its native ACL. Unlike set_generic_password this never updates.
            SecKeychain::default()
                .map_err(map)?
                .add_generic_password(SERVICE, &account(workspace), secret.bytes())
                .map_err(map)
        }
        fn load(&mut self, workspace: [u8; 16]) -> Result<DeviceSecret> {
            let keychain = SecKeychain::default().map_err(map)?;
            let (password, _) = keychain
                .find_generic_password(SERVICE, &account(workspace))
                .map_err(map)?;
            DeviceSecret::from_slice(password.as_ref())
        }
        fn remove(&mut self, workspace: [u8; 16], expected: &DeviceSecret) -> Result<()> {
            let current = self.load(workspace)?;
            if current
                .bytes()
                .iter()
                .zip(expected.bytes())
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
    fn supported(&self) -> bool {
        false
    }
    fn create(&mut self, _: [u8; 16], _: &DeviceSecret) -> Result<()> {
        Err(Error::Unavailable)
    }
    fn load(&mut self, _: [u8; 16]) -> Result<DeviceSecret> {
        Err(Error::Unavailable)
    }
    fn remove(&mut self, _: [u8; 16], _: &DeviceSecret) -> Result<()> {
        Err(Error::Unavailable)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
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
