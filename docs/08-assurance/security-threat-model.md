# Security Threat Model

## Common metadata

- **ID:** `HPX-ASSUR-002`
- **Title:** Security Threat Model
- **Purpose:** Trust boundaries, protected assets and residual security risks.
- **Level:** `08-assurance`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-26

Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Trust boundaries, protected assets and residual security risks. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Trust boundaries, protected assets and residual security risks. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

Threat boundaries include unlocked Rust memory, browser-delivered assets, loopback TLS/session/origin, encrypted SQL data, retained history/private clipboard, external disclosure and future federation. AEAD does not detect a complete rollback to an earlier valid workspace. Rust-held keys remain trusted-server custody. Hostile hosting code delivery requires an independently trusted client/update path for a stronger client-held guarantee. Local filesystem/fsync assumptions and trusted parent directories are explicit; compromised endpoints are not solved by TLS.

### Security and execution

Source `HPX-SRC-0021`, original lines 44–49. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Trusted-server custody is the default: the unlocked Rust process may hold keys and permitted plaintext. Passphrase unlock defaults on; an explicit OS-keychain alternative is a delivery requirement. Login remains separate. [ENCRYPTION.md](<../06-subsystems/security-cryptography.md>) defines the implemented byte adapter and its limits.

Client-held mode remains unavailable. Its future plaintext work must execute at an authorized client boundary or report unsupported. A server configuration value cannot grant keys or silently change security policy. Keep independently trusted and browser-only client paths distinct: malicious host code delivery is excluded from the browser-only confidentiality guarantee.

### 5. Encryption-aware access and execution

Source `HPX-SRC-0026`, original lines 92–99. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Mode-independent domain identities must survive re-encryption and authorized transfer. The implemented crypto adapter binds version/suite, nonce and the expected workspace/logical record/purpose/key epoch; its exact envelope layout is specified in [ENCRYPTION.md](<../06-subsystems/security-cryptography.md>). Authenticated catalogue and application policy formats remain unimplemented. Signatures/commitments, encrypted physical lookup and private payload hashes must have separate responsibilities.

Trusted-server mode permits an unlocked Rust service to run plaintext graph queries, compilation and permitted agent context. In client-held mode those operations must run at an authorized client boundary or be explicitly unavailable. The server cannot perform plaintext search simply because its config says it may. Plaintext drafts, indexes, backups, working Markdown, logs and exports are all part of the confidentiality boundary.

Queries must distinguish missing data from inaccessible historical references without leaking unauthorized existence. Decide whether an authorized user may see an opaque reference or whether even the relation must be hidden. Group membership and current read rights are not automatically access to all historical keys. Revocation cannot undo prior plaintext disclosure.

### Memory, disclosure and integrity limits

Source `HPX-SRC-0024`, original lines 60–67. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Managed keys, KDF outputs, explicitly owned Argon2 Block memory, AEAD-held keys and plaintext result/intermediate buffers use zeroization. The adapter avoids Argon2's non-clearing convenience work-memory allocator and reserves tag capacity before copying plaintext to avoid plaintext reallocations. Caller-owned input buffers remain the caller's responsibility. No complete erasure claim covers compiler temporaries, registers, swap or crash dumps. An unlocked compromised process can access its keys/plaintext.

Fresh random nonces avoid exposing equal plaintext through deterministic ciphertext addresses; ciphertext size, access patterns and reuse of already-stored objects remain visible. No padding/ORAM or global plaintext deduplication is implemented. Wrong passphrase/key/context and authenticated-byte tampering fail authentication without revealing which secret was wrong.

AEAD authenticates bytes/context but does not establish latest state or reject authentic stale envelopes. The storage/application design must bind key policy, catalogue, publication and heads to reject rollback/replay before durable editing. Epoch numbers alone neither rotate keys nor grant historical access.

### Unresolved freshness acceptance scope — architecture review

HPX-FIND-001 identifies a conflict between the preceding inherited gate and [ADR003](../04-architecture/decisions/0003-sqlite-local-writer.md), which explicitly leaves whole-database rollback outside the initial guarantee. The current writer has authenticated records, expected-state checks and original receipts; these do not establish detection of restoration of an entire authentic older database. No existing requirement is narrowed by this review integration, and no full freshness acceptance is claimed.

The owner decision is tracked as HPX-GAP-023 in [open questions](../registers/open-questions.csv): **A**, retain the inherited freshness gate and require a separately reviewed witness/recovery design before claiming that acceptance; or **B**, explicitly approve a bounded initial-local exception for authentic whole-database rollback while retaining the stronger future requirement. Recommendation pending owner review: A, because a review cannot itself reduce the accepted security guarantee. Either choice preserves current synthetic evidence; neither implements a witness, authorizes real-data use or changes trust settings. A witness design must address backup/restore, unavailable witnesses and independently retained authority; a local epoch alone is insufficient.

The owner requested simpler wording and then asked whether detection is possible, explicitly **without answering the approval question**. Detection is conditional on independent evidence of the latest accepted state: a separate record may detect replacement of the workspace alone, but cannot establish freshness if the attacker can restore that record together with the workspace. A separately trusted device/service or suitable protected counter is a possible design direction, not an adopted HPX dependency or a verified facility on the owner's platform. Define the attacker's restoration scope, trusted state, crash-consistent update order, legitimate backup restore/device transfer and an explicit unknown result when evidence is missing **before asking for final acceptance scope**. Keep the existing gate and ADR003 limit visible meanwhile; do not interpret a clarification request as approval of either alternative.

Method references: [RFC5116 §1.2](https://datatracker.ietf.org/doc/html/rfc5116#section-1.2) separates authenticated encryption from replay protection; the [TPM2 counter interface](https://tpm2-tools.readthedocs.io/en/latest/man/tpm2_nvincrement.1/) demonstrates that protected counter mechanisms exist in some environments. Neither source specifies an HPX witness or guarantees resistance to compromise/restoration of its entire trusted environment.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Trust boundaries, protected assets and residual security risks. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 44–49; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 92–99; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 60–67; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
