# Crypto adapter API

## Common metadata

- **ID:** `HPX-API-003`
- **Title:** Crypto adapter API
- **Purpose:** Actual cryptographic adapter methods, errors, costs and caller responsibilities.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-FMT-002](<../formats/crypto-envelopes.md>); [HPX-SUB-012](<../security-cryptography.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25



Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Provider and consumers

Actual cryptographic adapter methods, errors, costs and caller responsibilities. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Version and compatibility

Actual cryptographic adapter methods, errors, costs and caller responsibilities. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Messages and type schemas



### 10. Implemented encryption adapter boundary

Source `HPX-SRC-0026`, original lines 139–143. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

[hypergraph-crypto](<crypto-adapter.md>) implements `Context`, `Purpose`, `SecretKey::{generate,seal,open,wrap,unlock}`, `StorageAddress` and `storage_address`. Its reference provides exact canonical byte layouts, algorithm/resource costs, errors, authorization responsibilities, plaintext/ciphertext visibility, a synthetic example and tests. [ADR 0002](<../../04-architecture/decisions/0002-trusted-server-envelopes.md>) explains the choices. Logical binding IDs and encrypted physical addresses remain separate; envelope context is supplied by an authorized application, not trusted from the file. These APIs add no graph navigation, history, storage publication, policy grant or client-held encryption. They are tested Rust, not Lean-verified functions.

### Trusted-server cryptographic adapter

Source `HPX-SRC-0038`, original lines 1–15. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Actual API: [src/lib.rs](<../../../crates/crypto/src/lib.rs>). Accepted development format, rationale and recovery limits: [ADR 0002](<../../04-architecture/decisions/0002-trusted-server-envelopes.md>). This crate is an in-memory adapter: it performs no file, network, authorization or policy operations. It does not implement client-held mode.

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

### Errors, costs and memory

Source `HPX-SRC-0038`, original lines 26–33. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

`Unsupported`: unknown framing magic/version/suite/profile; `Malformed`: insufficient/wrong exact length; `Resource`: explicit object limit/allocation failure; `Passphrase`: empty or >1024 bytes; `Entropy`: OS random failure; `Authentication`: wrong key/passphrase/context or corrupted authenticated bytes; `Derivation`: library KDF failure. Callers must not expose these in ways that disclose unauthorized existence.

Seal/open/hash are O(N) in bytes; seal/open use O(N) additional managed buffer space. One wrapper/unlock uses 64 MiB working memory, three Argon2id passes, plus bounded overhead. Application code must serialize/rate-limit unlock attempts; a per-call bound does not bound concurrent aggregate work. Framing/profile failures precede KDF allocation. Caller allocations and OOM/process termination are not recoverable durability guarantees.

Key bytes, KDF output, explicit KDF Block memory, AEAD-held keys and plaintext result/intermediate buffers use enabled zeroization. Reserve tag capacity before copying plaintext to avoid plaintext-buffer reallocations. The caller still owns its input passphrase/content; memory erasure does not cover every compiler copy/register/swap/crash dump or a compromised unlocked host. Default Argon2 convenience allocation was deliberately avoided after source review found it does not zeroize its working Blocks.

### Example and limitations

Source `HPX-SRC-0038`, original lines 34–49. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

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


## Preconditions, postconditions and errors

Actual cryptographic adapter methods, errors, costs and caller responsibilities. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Ordering, retry and idempotency

Actual cryptographic adapter methods, errors, costs and caller responsibilities. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Authentication and authorisation

Actual cryptographic adapter methods, errors, costs and caller responsibilities. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Examples and conformance tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 139–143; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0038` — `crates/crypto/README.md`, lines 1–15; SHA-256 `f0e23d0926c724b816157a3ccf1b0a07ac3f7332a55eb6ab809747dc1d7422d6`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0038` — `crates/crypto/README.md`, lines 26–33; SHA-256 `f0e23d0926c724b816157a3ccf1b0a07ac3f7332a55eb6ab809747dc1d7422d6`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0038` — `crates/crypto/README.md`, lines 34–49; SHA-256 `f0e23d0926c724b816157a3ccf1b0a07ac3f7332a55eb6ab809747dc1d7422d6`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
