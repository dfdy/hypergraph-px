# Native encrypted .hpx workspace format


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-017-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-017-02` [Current adopted design — OWNER059](#current-adopted-design--owner059) | Prose only: Routing summary to the detailed adopted design contracts; their section bindings carry ownership. |
| `HPX-BIND-017-03` [Binary/text encoding and schema](#binarytext-encoding-and-schema) | [hpx.native.storage.records](../diagrams/shared-responsibilities.c4) · `HPX-CAN-029` · [c3_workspace_persistence](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-017-04` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
| `HPX-BIND-017-05` [Resumed record implementation, 2026-10-25](#resumed-record-implementation-2026-10-25) | [hpx.native.storage.records](../diagrams/shared-responsibilities.c4) · `HPX-CAN-029` · [c3_workspace_persistence](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-017-06` [Explicit keychain upgrade, 2026-10-25](#explicit-keychain-upgrade-2026-10-25) | [hpx.native.storage.records](../diagrams/shared-responsibilities.c4) · `HPX-CAN-029` · [c3_workspace_persistence](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-017-07` [Optional immutable comment records](#optional-immutable-comment-records) | [hpx.native.storage.records](../diagrams/shared-responsibilities.c4) · `HPX-CAN-029` · [c3_workspace_persistence](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-017-08` [Local branch foundation under verification](#local-branch-foundation-under-verification) | Prose only: Scoped implementation or execution record; evidence does not define or adopt the product architecture. |
| `HPX-BIND-017-09` [Designed incompatible closure boundary — OWNER055](#designed-incompatible-closure-boundary--owner055) | [hpx.native.domain.exact](../diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-017-10` [Designed combined conflict profile — OWNER056](#designed-combined-conflict-profile--owner056) | [hpx.native.domain.annotation_rules.concept_overlay](../../05-domain/diagrams/relationships.c4) · `HPX-CAN-019` · [concept_relationships](../../04-architecture/navigation.md) · consumers: none |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-FMT-001`
- **Title:** Native encrypted .hpx workspace format
- **Purpose:** Native .hpx file identity, record compatibility and real-data acceptance.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-003](<../../04-architecture/data-architecture.md>); [HPX-SUB-006](<../workspace-storage.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-11-03

OWNER-002 requires explicit per-record versions. The strict wrapper is implemented through adapter codecs; [the record contract](../../07-implementation/data-structures/sqlite-records.md) owns exact fields and current optional kinds. Legacy unversioned payload conversion and real-data acceptance remain unavailable.



## Current adopted design — OWNER059

The directly selected D01–D22A briefs now have diagram-owned definitions and precise supplements: [CAN029 / Canonical repair restore and authenticated exchange](../contracts/persistence-and-exchange.md). These govern the listed design questions; earlier open-mechanism statements below retain their historical checkpoint scope where superseded by this explicit decision. Candidate record/profile designs are not active formats or implemented capability. Exact retained source/byte/history and accepted obligations remain; actual code, measured capacity, genuine older-reader, recovery/security/UI acceptance and proofs are separately unperformed. No original source provenance or as-run evidence is rewritten.

## Binary/text encoding and schema

Owner decision [explicit record versions](../../04-architecture/decisions/0007-explicit-record-versions.md) requires a supported per-record discriminator before real-data testing. The implemented `{record_version:1,record_kind,payload}` wrapper and checked identity codecs are specified in [HPX-DATA-001](../../07-implementation/data-structures/sqlite-records.md). Missing/future/mismatched versions fail closed; unversioned experimental workspaces are not silently migrated. Database application_id/user_version, record kinds/wrappers, HGOB/HGWK envelopes and HTTP contract versions remain distinct. The retained initial schema-1 passage below is complemented by ADR014's explicit opt-in backed-up schema-2 enrollment; neither a new optional kind nor this clarification silently bumps those versions. Actual older-reader compatibility for gated kinds20–27 remains unverified.

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


## Source provenance

- `HPX-SRC-0034` — `Specifications/SQLITE_PERSISTENCE.md`, lines 1–4; SHA-256 `a5f2ddf4a59c93589326af673ca8dd14254291167ed3504262c68afe4c6cb5df`. Original bytes and paths are recorded in [source manifest](<../../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0034` — `Specifications/SQLITE_PERSISTENCE.md`, lines 5–16; SHA-256 `a5f2ddf4a59c93589326af673ca8dd14254291167ed3504262c68afe4c6cb5df`. Original bytes and paths are recorded in [source manifest](<../../02-governance/registers/source-manifest.csv>); archive is local/ignored.

## Resumed record implementation, 2026-10-25

The supported encrypted payload now uses `record_version: 1`, an existing integer `record_kind`, and strict typed `payload`; see [exact fields and compatibility](../../07-implementation/data-structures/sqlite-records.md). Database/envelope/network versions are unchanged. Unversioned experimental payloads and unknown/future record versions are rejected without automatic migration or record rewriting. Browser trust and complete real-data acceptance remain separate gates.

## Explicit keychain upgrade, 2026-10-25

[Owner-approved ADR014](../../04-architecture/decisions/0014-keychain-unlock-policy.md) adds supported database schema 2. New workspaces still start at schema 1; ordinary open, passphrase unlock and status queries never upgrade them. Explicit enrollment while unlocked creates and verifies a consistent encrypted schema-1 backup before a writer transaction adds the optional `keychain_unlock` row and atomically sets `user_version=2`. All existing encrypted objects/slots and the passphrase wrapper remain byte-identical. Intervening source changes abort before provider creation. Failure rolls back the format change and attempts scoped provider cleanup.

Schema 2 has a separate 106-byte device-secret wrapper around the same workspace key, using existing HGWK version 1 and KDF parameters. It stores no native credential, raw key or passphrase. Readers explicitly accept schemas 1 and 2 and reject unknown/future schemas. Removing enrollment leaves schema 2 with no device-wrapper row, without downgrade. Passphrase recovery remains available. Old schema-1 binaries reject upgraded files; the pre-upgrade backup remains readable with the passphrase by a binary supporting its encrypted record wrapper. This bounded local backup is distinct from deferred portable/remote restore. See [exact schema](../../07-implementation/data-structures/sqlite-records.md) and [test evidence](../../02-governance/registers/tests.csv).

## Optional immutable comment records

Accepted ADR017 adds optional wrapped version1 kinds18/19 for immutable comments and their document paging index, outside existing text snapshots and payloads. Database schemas1/2, envelope/network versions and other kinds remain unchanged. The exact fields and limits are in the SQLite record reference. Actual old-reader open/edit/commit preserved the unknown optional encrypted bytes and the current reader reconstructed identical comments afterward; production format acceptance and broader comment lifecycle remain separate.

## Local branch foundation under verification

The in-progress ADR018 adapter adds optional encrypted strict wrapper1 kinds20/21 without changing saved Document/Draft/text payloads, schemas1/2 or envelope framing. See [exact local records](../../07-implementation/data-structures/sqlite-records.md#in-progress-named-branch-adapter-kinds2021). Old-reader preservation and branch editor integration have not been accepted. The owner-requested ADR019 working checkpoints remain a proposed separate typed-source design; no existing revision/source field is reinterpreted as a draft checkpoint.

## Designed incompatible closure boundary — OWNER055

The [canonical item3 choices](../../05-domain/diagrams/identity-closure.c4) and [concrete closure format](../../05-domain/proposals/exact-closure-source-map.md) now define the proposed schema4/feature38/catalog2 boundary and kinds39–44. This is completed format **design**, not a change to this workspace's current schema1/2 opening or an executed upgrade. [Exact upgrade/refusal requirements](../../05-domain/proposals/exact-closure-source-map.md#7-effective-incompatible-workspace-gate--choice8a) include verified backup,quiescence,atomic authenticated markers and cold/stale unsupported-reader checks. Existing bytes/history/key wrappers and passphrase recovery remain; an empty schema4 keychain table is not enrollment. Experimental3 is not a supported migration source. No format downgrade,provider/trust/manual-workspace action or new real-data acceptance is implied.

## Designed combined conflict profile — OWNER056

The [item4 conflict-state addendum](../../05-domain/proposals/conflict-state.md#fit-with-item3s-incompatible-profile) specifies feature38/version2 for candidate schema4,retaining item3 bundles and adding explicit commit-time/review versions and candidate45–54 records. A future closure-only feature1 reader must refuse2 before protected operations. This is completed design,not a current schema/envelope/API change or permission to upgrade. Exact backup/quiescence/atomic marker/catalog consistency and actual older-reader evidence remain required;normal1/2 and experimental3 remain unchanged.
