# HGOB/HGWK envelope formats


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-016-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-016-02` [Binary/text encoding and schema](#binarytext-encoding-and-schema) | [hpx.native.crypto.envelopes](../diagrams/shared-responsibilities.c4) · `HPX-CAN-015` · [c3_crypto](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-016-03` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-FMT-002`
- **Title:** HGOB/HGWK envelope formats
- **Purpose:** Exact implemented HGOB/HGWK byte layouts and cryptographic bindings.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-SUB-012](<../security-cryptography.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-30

Preserve the byte adapter format exactly. Future explicit application record versions do not silently change envelope version/suite.


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


## Source provenance

- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 39–59; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0038` — `crates/crypto/README.md`, lines 16–25; SHA-256 `f0e23d0926c724b816157a3ccf1b0a07ac3f7332a55eb6ab809747dc1d7422d6`. Original bytes and paths are recorded in [source manifest](<../../02-governance/registers/source-manifest.csv>); archive is local/ignored.
