//! Trusted-server envelope adapter; no authorization, policy or filesystem I/O.
//!
//! See ADR 0002 for the development format, threat model and recovery limits.
//! Caller-provided plaintext/passphrases remain the caller's responsibility.

use argon2::{Algorithm, Argon2, Block, Params, Version};
use chacha20poly1305::{AeadInOut, KeyInit, XChaCha20Poly1305, XNonce};
use sha2::{Digest, Sha256};
use zeroize::Zeroizing;

/// Per-envelope plaintext limit; does not limit retained history.
pub const MAX_PLAINTEXT: usize = 16 * 1024 * 1024;
const OBJECT_PREFIX: &[u8; 6] = b"HGOB\x01\x01";
const WRAP_PREFIX: &[u8; 6] = b"HGWK\x01\x01";
const OBJECT_HEADER: usize = 30;
const WRAP_HEADER: usize = 58;
const WRAPPED_LEN: usize = WRAP_HEADER + 32 + 16;
const MEMORY_KIB: u32 = 65536;
const PASSES: u32 = 3;
const LANES: u32 = 1;

/// Non-sensitive failures. Authentication does not distinguish bad keys from tampering.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Error {
    /// Unrecognized magic, format, suite or KDF profile.
    Unsupported,
    /// Invalid envelope framing or length.
    Malformed,
    /// Input exceeds the explicit limit, or resource allocation failed.
    Resource,
    /// Empty or excessively long passphrase; no normalization is performed.
    Passphrase,
    /// OS entropy failed; there is no fallback random source.
    Entropy,
    /// The authenticated context, key, passphrase or bytes do not match.
    Authentication,
    /// Key derivation failed.
    Derivation,
}

/// Domain of a logical record; not a permission or a decryption grant.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum Purpose {
    Revision = 1,
    Manifest = 2,
    Snapshot = 3,
    Transformation = 4,
    Draft = 5,
    Index = 6,
}

/// Expected binding, supplied by an authorized application, never taken from ciphertext.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Context {
    pub workspace: [u8; 16],
    /// Opaque logical record ID; do not pass a public plaintext hash.
    pub binding: [u8; 32],
    pub purpose: Purpose,
    pub epoch: u64,
}

/// SHA-256 address of complete encrypted bytes, distinct from all logical identities.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct StorageAddress(pub [u8; 32]);

/// Compute a physical address. This does not authenticate or authorize the envelope.
pub fn storage_address(envelope: &[u8]) -> StorageAddress {
    StorageAddress(Sha256::digest(envelope).into())
}

/// Managed key bytes are cleared on drop. No Debug, Clone or raw export API.
/// This does not guarantee erasure of stack copies, registers, swap or crash dumps.
pub struct SecretKey(Zeroizing<[u8; 32]>);

impl SecretKey {
    /// Generate an independent data key using OS entropy.
    pub fn generate() -> Result<Self, Error> {
        let mut key = Zeroizing::new([0; 32]);
        getrandom::fill(&mut *key).map_err(|_| Error::Entropy)?;
        Ok(Self(key))
    }

    /// Encrypt bytes under an expected context with a fresh random nonce.
    pub fn seal(&self, context: Context, plaintext: &[u8]) -> Result<Vec<u8>, Error> {
        if plaintext.len() > MAX_PLAINTEXT {
            return Err(Error::Resource);
        }
        let mut header = Vec::from(OBJECT_PREFIX.as_slice());
        header.extend_from_slice(&random::<24>()?);
        let aad = object_aad(&header, context);
        encrypt(&self.0, &header, &aad, plaintext)
    }

    /// Authenticate before returning plaintext in a drop-zeroizing buffer.
    pub fn open(&self, context: Context, envelope: &[u8]) -> Result<Zeroizing<Vec<u8>>, Error> {
        check(envelope, OBJECT_PREFIX, OBJECT_HEADER, MAX_PLAINTEXT)?;
        decrypt(
            &self.0,
            envelope,
            OBJECT_HEADER,
            &object_aad(&envelope[..OBJECT_HEADER], context),
        )
    }

    /// Wrap the same data key with a new salt/nonce; objects need no re-encryption.
    /// A copied old wrapper retains its old unlock capability.
    pub fn wrap(
        &self,
        passphrase: &[u8],
        workspace: [u8; 16],
        epoch: u64,
    ) -> Result<Vec<u8>, Error> {
        check_passphrase(passphrase)?;
        let salt = random::<16>()?;
        let kek = derive(passphrase, &salt)?;
        let mut header = Vec::from(WRAP_PREFIX.as_slice());
        for parameter in [MEMORY_KIB, PASSES, LANES] {
            header.extend_from_slice(&parameter.to_be_bytes());
        }
        header.extend_from_slice(&salt);
        header.extend_from_slice(&random::<24>()?);
        encrypt(
            &kek,
            &header,
            &wrap_aad(&header, workspace, epoch),
            &self.0[..],
        )
    }

    /// Unlock a data key with the fixed bounded KDF profile, expected workspace and epoch.
    /// Malformed/unknown profiles are rejected before memory-hard derivation.
    pub fn unlock(
        passphrase: &[u8],
        workspace: [u8; 16],
        epoch: u64,
        envelope: &[u8],
    ) -> Result<Self, Error> {
        check_passphrase(passphrase)?;
        if envelope.len() != WRAPPED_LEN {
            return Err(Error::Malformed);
        }
        check(envelope, WRAP_PREFIX, WRAP_HEADER, 32)?;
        for (i, parameter) in [MEMORY_KIB, PASSES, LANES].into_iter().enumerate() {
            if envelope[6 + i * 4..10 + i * 4] != parameter.to_be_bytes() {
                return Err(Error::Unsupported);
            }
        }
        let kek = derive(passphrase, &envelope[18..34])?;
        let plaintext = decrypt(
            &kek,
            envelope,
            WRAP_HEADER,
            &wrap_aad(&envelope[..WRAP_HEADER], workspace, epoch),
        )?;
        let mut key = Zeroizing::new([0; 32]);
        key.copy_from_slice(&plaintext);
        Ok(Self(key))
    }
}

fn random<const N: usize>() -> Result<[u8; N], Error> {
    let mut bytes = [0; N];
    getrandom::fill(&mut bytes).map_err(|_| Error::Entropy)?;
    Ok(bytes)
}

fn check_passphrase(passphrase: &[u8]) -> Result<(), Error> {
    if passphrase.is_empty() || passphrase.len() > 1024 {
        return Err(Error::Passphrase);
    }
    Ok(())
}

fn derive(passphrase: &[u8], salt: &[u8]) -> Result<Zeroizing<[u8; 32]>, Error> {
    let params = Params::new(MEMORY_KIB, PASSES, LANES, Some(32)).map_err(|_| Error::Derivation)?;
    // The crate's convenience allocator does not clear its Blocks on drop.
    // Own the backing memory explicitly and clear it on every return path.
    let mut memory = Zeroizing::new(Vec::<Block>::new());
    memory
        .try_reserve_exact(params.block_count())
        .map_err(|_| Error::Resource)?;
    memory.resize(params.block_count(), Block::default());
    let mut kek = Zeroizing::new([0; 32]);
    Argon2::new(Algorithm::Argon2id, Version::V0x13, params)
        .hash_password_into_with_memory(passphrase, salt, &mut *kek, &mut memory[..])
        .map_err(|_| Error::Derivation)?;
    Ok(kek)
}

fn object_aad(header: &[u8], context: Context) -> Vec<u8> {
    let mut aad = Vec::from(b"hypergraph/object/v1\0".as_slice());
    aad.extend_from_slice(header);
    aad.extend_from_slice(&context.workspace);
    aad.extend_from_slice(&context.binding);
    aad.push(context.purpose as u8);
    aad.extend_from_slice(&context.epoch.to_be_bytes());
    aad
}

fn wrap_aad(header: &[u8], workspace: [u8; 16], epoch: u64) -> Vec<u8> {
    let mut aad = Vec::from(b"hypergraph/key-wrap/v1\0".as_slice());
    aad.extend_from_slice(header);
    aad.extend_from_slice(&workspace);
    aad.extend_from_slice(&epoch.to_be_bytes());
    aad
}

fn check(envelope: &[u8], prefix: &[u8; 6], header: usize, max: usize) -> Result<(), Error> {
    if envelope.len() > header + max + 16 {
        return Err(Error::Resource);
    }
    if envelope.len() < header + 16 {
        return Err(Error::Malformed);
    }
    if !envelope.starts_with(prefix) {
        return Err(Error::Unsupported);
    }
    Ok(())
}

fn buffer(bytes: &[u8], extra: usize) -> Result<Zeroizing<Vec<u8>>, Error> {
    let mut buffer = Zeroizing::new(Vec::new());
    // Allocate tag space BEFORE copying plaintext; avoid reallocating secret bytes.
    buffer
        .try_reserve_exact(bytes.len() + extra)
        .map_err(|_| Error::Resource)?;
    buffer.extend_from_slice(bytes);
    Ok(buffer)
}

fn encrypt(key: &[u8; 32], header: &[u8], aad: &[u8], plaintext: &[u8]) -> Result<Vec<u8>, Error> {
    let mut output = Vec::new();
    output
        .try_reserve_exact(header.len() + plaintext.len() + 16)
        .map_err(|_| Error::Resource)?;
    let mut payload = buffer(plaintext, 16)?;
    let nonce = XNonce::try_from(&header[header.len() - 24..]).map_err(|_| Error::Malformed)?;
    XChaCha20Poly1305::new(key.into())
        .encrypt_in_place(&nonce, aad, &mut *payload)
        .map_err(|_| Error::Authentication)?;
    output.extend_from_slice(header);
    output.extend_from_slice(&payload);
    Ok(output)
}

fn decrypt(
    key: &[u8; 32],
    envelope: &[u8],
    header: usize,
    aad: &[u8],
) -> Result<Zeroizing<Vec<u8>>, Error> {
    let mut plaintext = buffer(&envelope[header..], 0)?;
    let nonce = XNonce::try_from(&envelope[header - 24..header]).map_err(|_| Error::Malformed)?;
    XChaCha20Poly1305::new(key.into())
        .decrypt_in_place(&nonce, aad, &mut *plaintext)
        .map_err(|_| Error::Authentication)?;
    Ok(plaintext)
}
