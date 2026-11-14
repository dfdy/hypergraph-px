# Privacy and Research Data Protection


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-032-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-032-02` [Current adopted design — OWNER059](#current-adopted-design--owner059) | Prose only: Routing summary to the detailed adopted design contracts; their section bindings carry ownership. |
| `HPX-BIND-032-03` [Workspace-local users — owner clarification](#workspace-local-users--owner-clarification) | [hpx.native.authority.concept_user](../05-domain/diagrams/authority-distinction.c4) · `HPX-CAN-026` · [concept_authority_distinctions](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-032-04` [Shared user API and per-user permissions](#shared-user-api-and-per-user-permissions) | [hpx.native.application.admission](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-032-05` [Normative content](#normative-content) | [hpx.native.authority](../04-architecture/diagrams/executable.c4) · `HPX-CAN-026` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-032-06` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-ASSUR-003`
- **Title:** Privacy and Research Data Protection
- **Purpose:** Confidentiality, egress, disclosure and retained-history privacy limits.
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

The shared user API applies user–workspace permissions to content, history, chat and captured context. Retained nodes do not imply universal disclosure; key availability, user selection and provider/model identity are not access grants. Existing confidentiality, disclosure and retained-history rules continue to apply. See the [accepted shared API scope](../06-subsystems/interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.


## Normative content

OWNER-001 retains immutable committed history. Redaction, erasure and retention exceptions in design inputs remain deferred proposals requiring a separately approved mechanism; no silent pruning, payload deletion or history weakening is introduced. This is not a statement of legal compliance. Rights-conflict reporting does not override access restrictions or future non-trusted egress denial. Documents/user manuscripts remain outside application licensing unless separately granted.

### Future core egress policy for client-held/non-trusted mode

Source `HPX-SRC-0024`, original lines 15–30. Source-linked obligations with scoped retention, transformation or owner qualification; see the clause dispositions for `HPX-SRC-0024-S003`. Original dates and implementation observations remain historical evidence.

Status: required future functionality, unimplemented. When client-held/local encryption with a non-trusted server is selected, the core must deny application-controlled plaintext disclosure paths. **GitHub publication/pushing and document export are disabled**, including local Markdown/HTML/PDF/LaTeX/Word downloads and direct browser Blob/download shortcuts. Possession of client keys, read access, an integration credential or a confirmation dialog cannot override this mode policy.

Use one authoritative policy/command boundary across browser, native/trusted client, REST, MCP, plugins and background workers. UI capability flags and disabled buttons reflect the decision; every direct command, retry and sink must independently enforce it. The future trusted client must route file/download, OS clipboard, printing, integrations and machine-user chat/MCP data disclosures through its core execution boundary. An authorized plaintext-capable client is not an automatic export exception.

Audit and block additional application disclosure sinks: external model/agent/provider requests carrying protected content; citation or integration queries derived from protected text; plaintext OS clipboard/share sheets; printing; public previews/share links; file/temporary/export artifacts; plaintext caches, indexes, service-worker storage, logs, errors, traces, crash reports and telemetry. Internal encrypted workspace drafts, protected application clipboard references and authorized local viewing/editing require their own permitted flows. Keep protected plaintext from the hosting server and third-party assets.

Ciphertext-only synchronization and separately designed encrypted recovery/backup flows need an explicit policy, metadata/disclosure bounds and authorization. They cannot reuse a disabled document-export/publish operation as an escape hatch. Mixed-source operations inherit restrictions from every protected input; moving content into a trusted destination cannot launder its source policy.

Freeze the applicable policy context in plans and recheck before execution and artifact delivery. Switching to non-trusted mode invalidates pending export/push/disclosure plans, jobs, temporary artifacts and outstanding plaintext access links; no delayed task may execute under an older permissive policy. Mode changes must not silently downgrade protection. Earlier disclosures cannot be recalled.

Acceptance requires negative tests through all transports and clients, UI bypass/direct commands, stale plans, retry/outbox/restart, mixed protected inputs, provider/OS sinks, caches/logs and mode transitions. Model the decision as a pure exhaustive policy function and consider Lean denial-invariant proofs; this requirement establishes no checked theorem or implemented guarantee.

The threat model must distinguish application-controlled egress from a reader copying a screen, OS screenshots, compromised endpoints and side channels. Protection against a malicious host replacing browser code still requires independently trusted client/update delivery. Do not claim that an ordinary browser can prevent a malicious host or privileged user from extracting plaintext already available to it. These limits must not weaken enforcement of the application's supported disclosure paths.


## Source provenance

- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 15–30; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
