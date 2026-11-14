# HGOB/HGWK envelope formats

## Common metadata

- **ID:** `HPX-FMT-002`
- **Title:** HGOB/HGWK envelope formats
- **Purpose:** Exact implemented HGOB/HGWK byte layouts and cryptographic bindings.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-SUB-012](<../security-cryptography.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Preserve the byte adapter format exactly. Future explicit application record versions do not silently change envelope version/suite.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Purpose and magic/version identifiers

Exact implemented HGOB/HGWK byte layouts and cryptographic bindings. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Binary/text encoding and schema



### Versioned envelope bytes

Source `HPX-SRC-0024`, original lines 39–59. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Unsigned integers use big endian; version=1 and suite=1 select the complete profiles defined here. Tags are 16-byte postfix tags. Unknown framing/version/suite/profile, invalid lengths and excessive input fail explicitly; no fallback or silent downgrade.

Object:

```text
HGOB[4] | version[1] | suite[1] | nonce[24] | ciphertext[N] | tag[16]
```

N is at most 16 MiB and may be zero. Authenticate as AAD: ASCII `hypergraph/object/v1`, one zero byte, the complete 30-byte header, workspace[16], binding[32], purpose[1], epoch[8]. No logical ID, plaintext digest, purpose or epoch is stored in the public header. Envelope length is N+46 bytes.

Passphrase key wrapper:

```text
HGWK[4] | version[1] | suite[1] | m_kib[4] | passes[4] | lanes[4]
        | salt[16] | nonce[24] | encrypted_key[32] | tag[16]
```

Require exactly 106 bytes. Authenticate as AAD: ASCII `hypergraph/key-wrap/v1`, one zero byte, the complete 58-byte header, expected workspace[16], epoch[8]. Rewrapping the same data key with a new passphrase requires no object re-encryption. A copied earlier wrapper remains usable with its corresponding passphrase; wrapper replacement is not revocation or secure deletion.

### Canonical byte formats

Source `HPX-SRC-0038`, original lines 16–25. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Integer fields are unsigned big endian; no optional/trailing fields. Version=1 and suite=1 mean the complete profile below, including Argon2id v19 for wrappers.

Object: `HGOB[4] | version[1] | suite[1] | nonce[24] | ciphertext[N] | tag[16]`. Total N+46 bytes. AAD is `hypergraph/object/v1` followed by a zero byte, the complete 30-byte header, workspace[16], binding[32], purpose[1], epoch[8]. Logical IDs/purpose/epoch are not stored in the envelope; an authenticated application catalogue must supply them. Nonce, size and format are public.

Key wrapper: `HGWK[4] | version[1] | suite[1] | m_kib[4] | passes[4] | lanes[4] | salt[16] | nonce[24] | encrypted_key[32] | tag[16]`. Total 106 bytes. AAD is `hypergraph/key-wrap/v1` followed by a zero byte, the complete 58-byte header, expected workspace[16], epoch[8]. Only the exact supported KDF tuple is accepted; untrusted bytes cannot request additional memory or weaken the profile.

Ciphertext/tag use the library postfix-tag format. Equal plaintexts sealed separately should have unrelated ciphertext/address because nonces are independently random; this does not hide lengths, reuse of an already-stored object or access patterns. Maximum object envelope is 16 MiB+46. There is no public plaintext digest or cross-domain plaintext deduplication.


## Canonical and optional fields

Exact implemented HGOB/HGWK byte layouts and cryptographic bindings. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Compatibility and migration

Exact implemented HGOB/HGWK byte layouts and cryptographic bindings. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Data-preservation guarantees

Exact implemented HGOB/HGWK byte layouts and cryptographic bindings. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Corruption and failure semantics

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Validation fixtures

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 39–59; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0038` — `crates/crypto/README.md`, lines 16–25; SHA-256 `f0e23d0926c724b816157a3ccf1b0a07ac3f7332a55eb6ab809747dc1d7422d6`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
