# Trusted-server cryptographic adapter

Actual API: [src/lib.rs](src/lib.rs). Accepted development format, rationale and recovery limits: [ADR 0002](../../docs/adr/0002-trusted-server-envelopes.md). This crate is an in-memory adapter: it performs no file, network, authorization or policy operations. It does not implement client-held mode.

| API/type | Contract |
|---|---|
| `Context` | Expected workspace `[u8;16]`, logical binding `[u8;32]`, `Purpose`, key epoch u64. Caller supplies authorized expected values. Never infer them from an attacker-controlled envelope. |
| `Purpose` | Revision=1, Manifest=2, Snapshot=3, Transformation=4, Draft=5, Index=6. These identify separate authenticated domains, not permission grants. |
| `SecretKey::generate` | Independent OS-random 32-byte data key; fails if entropy is unavailable. No Debug, Clone or raw export. |
| `SecretKey::seal(context, bytes)` | Fresh OS-random 24-byte nonce, XChaCha20-Poly1305, complete header/context as authenticated associated data. At most 16 MiB plaintext, including zero-byte payloads. Returns ciphertext envelope. |
| `SecretKey::open(context, envelope)` | Reject framing/size/unknown format, authenticate key/context/bytes, return drop-zeroizing plaintext. Never silently substitute context. |
| `SecretKey::wrap(passphrase, workspace, epoch)` | Wrap existing key with random salt/nonce and fixed Argon2id v19 (65,536 KiB, 3 passes, 1 lane, output 32). Passphrase is 1–1024 raw bytes, no normalization. |
| `SecretKey::unlock(passphrase, workspace, epoch, envelope)` | Require exactly 106 bytes and the supported suite/profile before allocating KDF memory. Authenticate expected workspace/epoch; wrong passphrase and tag tampering both return Authentication. |
| `storage_address(envelope)` / `StorageAddress` | SHA-256 of complete encrypted bytes; physical address only. It neither verifies nor authorizes an object and does not identify plaintext or a logical revision. |

## Canonical byte formats

Integer fields are unsigned big endian; no optional/trailing fields. Version=1 and suite=1 mean the complete profile below, including Argon2id v19 for wrappers.

Object: `HGOB[4] | version[1] | suite[1] | nonce[24] | ciphertext[N] | tag[16]`. Total N+46 bytes. AAD is `hypergraph/object/v1` followed by a zero byte, the complete 30-byte header, workspace[16], binding[32], purpose[1], epoch[8]. Logical IDs/purpose/epoch are not stored in the envelope; an authenticated application catalogue must supply them. Nonce, size and format are public.

Key wrapper: `HGWK[4] | version[1] | suite[1] | m_kib[4] | passes[4] | lanes[4] | salt[16] | nonce[24] | encrypted_key[32] | tag[16]`. Total 106 bytes. AAD is `hypergraph/key-wrap/v1` followed by a zero byte, the complete 58-byte header, expected workspace[16], epoch[8]. Only the exact supported KDF tuple is accepted; untrusted bytes cannot request additional memory or weaken the profile.

Ciphertext/tag use the library postfix-tag format. Equal plaintexts sealed separately should have unrelated ciphertext/address because nonces are independently random; this does not hide lengths, reuse of an already-stored object or access patterns. Maximum object envelope is 16 MiB+46. There is no public plaintext digest or cross-domain plaintext deduplication.

## Errors, costs and memory

`Unsupported`: unknown framing magic/version/suite/profile; `Malformed`: insufficient/wrong exact length; `Resource`: explicit object limit/allocation failure; `Passphrase`: empty or >1024 bytes; `Entropy`: OS random failure; `Authentication`: wrong key/passphrase/context or corrupted authenticated bytes; `Derivation`: library KDF failure. Callers must not expose these in ways that disclose unauthorized existence.

Seal/open/hash are O(N) in bytes; seal/open use O(N) additional managed buffer space. One wrapper/unlock uses 64 MiB working memory, three Argon2id passes, plus bounded overhead. Application code must serialize/rate-limit unlock attempts; a per-call bound does not bound concurrent aggregate work. Framing/profile failures precede KDF allocation. Caller allocations and OOM/process termination are not recoverable durability guarantees.

Key bytes, KDF output, explicit KDF Block memory, AEAD-held keys and plaintext result/intermediate buffers use enabled zeroization. Reserve tag capacity before copying plaintext to avoid plaintext-buffer reallocations. The caller still owns its input passphrase/content; memory erasure does not cover every compiler copy/register/swap/crash dump or a compromised unlocked host. Default Argon2 convenience allocation was deliberately avoided after source review found it does not zeroize its working Blocks.

## Example and limitations

```rust
use hypergraph_crypto::{Context, Purpose, SecretKey};
let key = SecretKey::generate()?;
// Synthetic opaque IDs for illustration; the application must authorize real bindings.
let ctx = Context { workspace: [1;16], binding: [2;32], purpose: Purpose::Revision, epoch: 1 };
let envelope = key.seal(ctx, b"# A revision")?;
let clear = key.open(ctx, &envelope)?;
assert_eq!(&clear[..], b"# A revision");
# Ok::<(), hypergraph_crypto::Error>(())
```

Wrapping the same key with a new passphrase leaves existing encrypted objects decryptable. Copies of old wrappers remain usable with their old passphrases: changing one wrapper is not revocation or secure deletion. Valid old envelopes also authenticate; replay/rollback detection requires a later authenticated publication/head model. Epoch numbers alone neither rotate keys nor grant historical access. No keychain provider, signed identity, per-domain key hierarchy, migration, complete custody policy, crash recovery or disk encryption service exists yet. Storage must not write plaintext drafts/indexes while these pieces are developed.

Three integration tests cover independent same-content encryption, every object-byte mutation, context-field/wrong-key rejection, truncation/extension, resource/empty-input boundaries, salt/nonce/tag tampering, unsupported KDF/framing and passphrase rewrap with prior object access. Existing domain/proof tests are independent. No crypto function is Lean verified.
