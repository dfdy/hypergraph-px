# Native encrypted .hpx workspace format

## Common metadata

- **ID:** `HPX-FMT-001`
- **Title:** Native encrypted .hpx workspace format
- **Purpose:** Native .hpx file identity, record compatibility and real-data acceptance.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-003](<../../04-architecture/data-architecture.md>); [HPX-SUB-006](<../workspace-storage.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

OWNER-002 requires explicit per-record versions. Existing database/envelope versions alone are insufficient; field/layout/migration work is not implemented here.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Purpose and magic/version identifiers

Native .hpx file identity, record compatibility and real-data acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Binary/text encoding and schema

Owner decision [explicit record versions](../../04-architecture/decisions/0007-explicit-record-versions.md) requires a supported per-record discriminator before real-data testing. The source wording “format tags” describes a requirement, not present coverage in every current JSON struct. Database application_id/user_version and HGOB envelope versions have separate responsibilities. Exact tag field/layout, supported decode/migration paths and compatibility vectors are TBD; no new bytes are invented by this documentation.

### SQLite persistence and recovery

Source `HPX-SRC-0034`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: accepted first local slice design, 2026-10-25; not a delivered browser integration claim.

### Authority and format

Source `HPX-SRC-0034`, original lines 5–16. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Native `.hpx` is an embedded SQLite workspace. Use bundled SQLite through pinned rusqlite. Database application_id is 0x48505831 (HPX1); user_version is 1. Unknown application/schema versions fail without migration or modification. Schema creation is transactional; future migrations require explicit supported version paths, backup and failure tests. Never open an unrelated SQLite file as a workspace or create a missing file during open.

One database is authoritative: immutable encrypted objects and encrypted mutable slots publish together in a SQLite transaction. SQLite WAL is recovery machinery, not application history. Use WAL, synchronous=FULL, foreign_keys=ON, trusted_schema=OFF, temp_store=MEMORY, bounded busy timeout, and BEGIN IMMEDIATE for mutations. Read views use one consistent SQLite transaction. SQLite locks serialize writers; each command rechecks expected draft generation and branch head under that lock. No background replay of all retained history per save.

Clear bootstrap metadata contains format, workspace ID, key epoch and passphrase-wrapped key. SQL rows expose opaque IDs, record kind, generation and ciphertext lengths/counts/access patterns; they do not contain document names, source, actor labels, event payloads or plaintext indexes. Root catalog, document records, manifests, revisions, snapshots, branch heads, drafts and receipts are authenticated encrypted records. Encrypt before binding any sensitive bytes into SQL, so WAL and journals also receive ciphertext. Existing XChaCha20-Poly1305 envelope binds workspace, epoch and a domain-separated kind/ID/generation binding. Zeroizing serialized buffers minimise transient plaintext copies; caller-owned strings and unlocked host memory remain trusted.

Version-1 payload encoding is strictly typed UTF-8 JSON with fixed struct field order, no arbitrary maps or floats, denied unknown fields and format tags. This is a versioned local encoding, not a general canonical signing/interchange scheme. Exact request bytes for idempotency use the same typed encoding; no public plaintext fingerprints. New logical IDs use OS randomness. Unsupported client-held configuration fails; it cannot obtain keys by declaring a mode.

Encrypted catalog authenticates the list of documents and the owner/device context. Each document has a branch head, current draft and immutable root manifest/occurrence. Immutable object insert is create-only; existing records cannot be overwritten by the API. Sealed records authenticate expected kind, identity and generation. Referenced missing/corrupt objects fail; never substitute latest revisions. This detects substitution and many corruptions, not complete rollback of an earlier valid database. Independent rollback witnesses, full policy authority, signatures and group key hierarchies remain future gates.


## Canonical and optional fields

Native .hpx file identity, record compatibility and real-data acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Compatibility and migration

Native .hpx file identity, record compatibility and real-data acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Data-preservation guarantees

Native .hpx file identity, record compatibility and real-data acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Corruption and failure semantics

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Validation fixtures

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0034` — `Specifications/SQLITE_PERSISTENCE.md`, lines 1–4; SHA-256 `a5f2ddf4a59c93589326af673ca8dd14254291167ed3504262c68afe4c6cb5df`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0034` — `Specifications/SQLITE_PERSISTENCE.md`, lines 5–16; SHA-256 `a5f2ddf4a59c93589326af673ca8dd14254291167ed3504262c68afe4c6cb5df`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
