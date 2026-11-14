# Existing ADR 0002, retain decision identity/status

## Common metadata

- **ID:** `HPX-ADR-002`
- **Title:** Existing ADR 0002, retain decision identity/status
- **Purpose:** Metadata view of an existing scoped decision; original decision identity and provenance retained.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../system-architecture.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

The underlying decision retains its recorded acceptance. This new editorial wrapper does not expand that decision or imply implemented services.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Status and decision date

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Problem and forces

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Alternatives considered

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Chosen decision



### ADR 0002 — initial trusted-server cryptographic adapter

Source `HPX-SRC-0042`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Date: 2026-10-24. Accepted for the bounded local adapter in issue [4](https://github.com/dfdy/hypergraph-px/issues/4). This is an initial development format, not a complete workspace storage or federation protocol.

### Decision and assumptions (before implementation)

Source `HPX-SRC-0042`, original lines 5–18. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Keep the pure domain crate dependency-free. A separate `hypergraph-crypto` adapter accepts bytes and explicit cryptographic bindings; it neither reads configuration nor authorizes actions. An unlocked trusted Rust process holds plaintext and keys. Client-held mode is unavailable, and no mode flag can produce missing keys. Login and storage unlock remain separate.

Use RustCrypto XChaCha20-Poly1305 with fresh OS-generated 24-byte nonces for each seal, including repeated plaintext. Use independently random 32-byte data keys and Argon2id v19 passphrase wrapping; never encrypt content directly with the passphrase. Initially accept exactly one KDF profile (65,536 KiB, 3 passes, 1 lane, 32-byte output) and a random 16-byte salt. Reject unknown versions/suites/profiles before KDF work. Bound passphrase input to 1–1024 bytes and plaintext per object to 16 MiB. These are explicit resource limits, not history retention limits; callers must serialize concurrent unlock requests to bound total memory/CPU. No insecure fast production test profile.

Fixed canonical object context is workspace ID (16 opaque bytes), binding ID (32 opaque bytes), purpose tag (revision/manifest/snapshot/transformation/draft/index), and key epoch (u64 big endian). Binding IDs denote logical records; they are neither plaintext hashes nor storage addresses. Domain-specific typed identities will be mapped by the application; this adapter does not collapse their semantics. Object identity is independent of encryption. The caller provides and authorizes the expected context; do not derive it from an untrusted envelope.

Object bytes are `HGOB | version=1 | suite=1 | nonce[24] | ciphertext | tag[16]`. Authenticate a fixed domain separator, the complete header and canonical context. Only framing, nonce and size are public; logical identities and plaintext digests are absent. SHA-256 of the complete encrypted bytes is a physical `StorageAddress`, never an authorization grant or logical ID. Length/access-pattern/equality of the same stored ciphertext remain visible; no padding or ORAM is claimed.

Passphrase-key bytes are `HGWK | version=1 | suite=1 | m_kib:u32be | passes:u32be | lanes:u32be | salt[16] | nonce[24] | encrypted_key[32] | tag[16]`. Authenticate a distinct domain separator, the entire header, expected workspace ID and epoch. Changing the passphrase wraps the existing data key afresh without re-encrypting objects. Keeping a copied old wrapper preserves its old unlock capability; secure deletion and passphrase change do not revoke already disclosed keys. Epoch rotation, key hierarchies and historical grants are separate future work.

Managed key/KDF/plaintext buffers are zeroized on drop; secret keys have no Debug, Clone or raw export API. This does not guarantee erasure of compiler temporaries, registers, allocator copies, swap or crash dumps, nor defend an unlocked compromised process. Use AEAD in-place on zeroizing buffers to avoid unmanaged plaintext allocations. Treat malformed framing, invalid context/tag/key and unsupported parameters as typed failures without logging content. Do not distinguish wrong passphrase from tag tampering. Data caller buffers remain caller-owned.

### Verification and recovery boundary

Source `HPX-SRC-0042`, original lines 19–23. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Before adding dependencies, review declared licenses and source provenance. Pin resolved versions in Cargo.lock. Test context/epoch/purpose substitution, header/nonce/ciphertext tampering, malformed/truncated/oversized input, independent encryption of equal content, wrong key/passphrase, and passphrase rewrap preserving access to prior ciphertext. Keep crypto assumptions out of existing Lean proof claims; this adapter is tested, not Lean verified.

This increment writes no files and publishes no commit or policy. No durability, rollback/replay detection, authenticated latest head, keychain provider, identity signature, full key hierarchy or complete encrypted workspace is claimed. Storage will bind envelopes into an authenticated publication model before enabling durable edits; AEAD alone cannot reject a valid old envelope. Both passphrase-default and explicit OS-keychain startup paths remain release requirements; only the former primitive is implemented here. A later application service must prevent policy downgrade and inappropriate key reuse, limit unlock attempts, manage key rotation, and persist envelopes atomically. Rolling back this increment changes no user data.


## Consequences and risks

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Revisit triggers

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Affected specifications and tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0042` — `docs/adr/0002-trusted-server-envelopes.md`, lines 1–4; SHA-256 `8f2254251aa273b939c58295fe97ade69f23843907aff2fc7aa066b0dd030505`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0042` — `docs/adr/0002-trusted-server-envelopes.md`, lines 5–18; SHA-256 `8f2254251aa273b939c58295fe97ade69f23843907aff2fc7aa066b0dd030505`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0042` — `docs/adr/0002-trusted-server-envelopes.md`, lines 19–23; SHA-256 `8f2254251aa273b939c58295fe97ade69f23843907aff2fc7aa066b0dd030505`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
