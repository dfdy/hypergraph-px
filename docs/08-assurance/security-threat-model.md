# Security Threat Model


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-034-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-034-02` [Current adopted design — OWNER059](#current-adopted-design--owner059) | Prose only: Routing summary to the detailed adopted design contracts; their section bindings carry ownership. |
| `HPX-BIND-034-03` [Workspace-local users — owner clarification](#workspace-local-users--owner-clarification) | [hpx.native.authority.concept_user](../05-domain/diagrams/authority-distinction.c4) · `HPX-CAN-026` · [concept_authority_distinctions](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-034-04` [Shared user API and per-user permissions](#shared-user-api-and-per-user-permissions) | [hpx.native.application.admission](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-034-05` [Normative content](#normative-content) | [hpx.native.authority](../04-architecture/diagrams/executable.c4) · `HPX-CAN-026` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-034-06` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
| `HPX-BIND-034-07` [Pending restoration-scope design input, 2026-10-27](#pending-restoration-scope-design-input-2026-10-27) | [hpx.native.authority](../04-architecture/diagrams/executable.c4) · `HPX-CAN-026` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-034-08` [Selected workspace-only restoration scope, 2026-10-27](#selected-workspace-only-restoration-scope-2026-10-27) | [hpx.native.authority](../04-architecture/diagrams/executable.c4) · `HPX-CAN-026` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-034-09` [Portable workspace supersedes external witness direction, 2026-10-27](#portable-workspace-supersedes-external-witness-direction-2026-10-27) | [hpx.native.authority](../04-architecture/diagrams/executable.c4) · `HPX-CAN-026` · [c3_application](../04-architecture/navigation.md) · consumers: none |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-ASSUR-002`
- **Title:** Security Threat Model
- **Purpose:** Trust boundaries, protected assets and residual security risks.
- **Level:** `08-assurance`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-30


## Current adopted design — OWNER059

The directly selected D01–D22A briefs now have diagram-owned definitions and precise supplements: [CAN026 / Authority lifecycle and custody](../06-subsystems/contracts/authority-lifecycle.md). These govern the listed design questions; earlier open-mechanism statements below retain their historical checkpoint scope where superseded by this explicit decision. Candidate record/profile designs are not active formats or implemented capability. Exact retained source/byte/history and accepted obligations remain; actual code, measured capacity, genuine older-reader, recovery/security/UI acceptance and proofs are separately unperformed. No original source provenance or as-run evidence is rewritten.

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../04-architecture/diagrams/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

Threat analysis must cover adapter switching (browser/MCP/chat), confused-deputy and forged actor/target context, unauthorised permission administration, cross-user drafts/receipts, protected-history or graph disclosure and rights changes during queued/replayed operations. Shared backend user API policy, not frontend controls or workspace unlock, is the required enforcement boundary. No completed security assurance is claimed. See the [accepted shared API scope](../06-subsystems/interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.


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

The owner decision is tracked as HPX-GAP-023 in [open questions](../02-governance/registers/open-questions.csv): **A**, retain the inherited freshness gate and require a separately reviewed witness/recovery design before claiming that acceptance; or **B**, explicitly approve a bounded initial-local exception for authentic whole-database rollback while retaining the stronger future requirement. Recommendation pending owner review: A, because a review cannot itself reduce the accepted security guarantee. Either choice preserves current synthetic evidence; neither implements a witness, authorizes real-data use or changes trust settings. A witness design must address backup/restore, unavailable witnesses and independently retained authority; a local epoch alone is insufficient.

The owner requested simpler wording and then asked whether detection is possible, explicitly **without answering the approval question**. Detection is conditional on independent evidence of the latest accepted state: a separate record may detect replacement of the workspace alone, but cannot establish freshness if the attacker can restore that record together with the workspace. A separately trusted device/service or suitable protected counter is a possible design direction, not an adopted HPX dependency or a verified facility on the owner's platform. Define the attacker's restoration scope, trusted state, crash-consistent update order, legitimate backup restore/device transfer and an explicit unknown result when evidence is missing **before asking for final acceptance scope**. Keep the existing gate and ADR003 limit visible meanwhile; do not interpret a clarification request as approval of either alternative.

Method references: [RFC5116 §1.2](https://datatracker.ietf.org/doc/html/rfc5116#section-1.2) separates authenticated encryption from replay protection; the [TPM2 counter interface](https://tpm2-tools.readthedocs.io/en/latest/man/tpm2_nvincrement.1/) demonstrates that protected counter mechanisms exist in some environments. Neither source specifies an HPX witness or guarantees resistance to compromise/restoration of its entire trusted environment.


## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 44–49; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 92–99; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 60–67; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.

## Pending restoration-scope design input, 2026-10-27

After the bounded audit integration, the owner was asked which restoration scope the next witness design should cover: workspace files only while separately retained local state survives; or the host and ordinary local witness together, requiring trustworthy latest-state evidence beyond that restored state; or defer witness design while retaining the acceptance gate. The owner requested an explanation, **not a selection or approval**. The explanation distinguishes authentic older workspace replacement from restoring both copies of the evidence, intentional restore/recovery and missing-evidence unknown status. Separately protected hardware state would require its own explicitly verified survival/trust assumptions; no available-platform facility is presumed.

The current recommendation remains to retain the stronger accepted gate while designing a sufficiently independent witness. No specific device/service, weaker initial exception, connection/enrollment, witness format or crash/restore protocol has been selected. HPX-GAP-023 stays open. This scope question is a prerequisite design input, not the final acceptance-scope question: trusted state, update order, missing/offline behaviour and intentional restore/device transfer still need a concrete reviewable design before final acceptance.

## Selected workspace-only restoration scope, 2026-10-27

The owner subsequently answered **“Workspace only.”** HPX-OWNER-008 selects the next design's restoration boundary: an attacker may replace/restore workspace files while trusted local registration/witness state elsewhere on the same machine remains intact. Whole-host restoration that also rolls that witness back is outside this selected scope. Earlier unanswered/clarification-only paragraphs are historical; this is an actual scope choice, not approval of the candidate mechanism or real-data acceptance.

The [local witness proposal](recovery.md#workspace-only-local-witness-proposal) makes surviving trusted state, committed encrypted state, cross-store acknowledgement order, missing/uncertain evidence, intentional restore and proposed backed-up minimum-reader enrollment concrete for owner review. It preserves the accepted freshness gate within the chosen threat boundary; it does not select ADR003's no-detection exception. Default passphrase recovery and separately opted-in keychain custody remain unchanged. No external witness service is required by this local design. HPX-GAP-023 is scope-selected but remains open for mechanism/upgrade and acceptance, alongside HPX-GAP-024's restore/recovery decisions.

## Portable workspace supersedes external witness direction, 2026-10-27

HPX-OWNER-009 requires self-contained portable application/recovery evidence and withdraws the proposed surviving external witness/registration and its upgrade. Historical workspace-only witness sections above are superseded in this respect. A complete authentic rollback of the workspace and all internal evidence cannot be detected under this boundary. Retain authenticated integrity, crash/retry and internal recovery claims only within their actual executed scope; no whole-workspace freshness or real-data acceptance follows. See [the current recovery direction](recovery.md#portable-self-contained-recovery-direction-2026-10-27).
