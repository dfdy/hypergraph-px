# Component and Module Architecture

## Common metadata

- **ID:** `HPX-ARCH-002`
- **Title:** Component and Module Architecture
- **Purpose:** Pure domain, application, storage/crypto and transport dependency directions.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<system-architecture.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-30

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../../architecture/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

Transport adapters carry authenticated actor and target/operation context into one shared user API. Application coordination owns current per-user-per-workspace authority before reads, command execution and protected receipt replay. MCP is an AI-user access mode, not a parallel writer; frontend controls are presentation rather than enforcement. No additional module/crate is selected. See the [accepted shared API scope](../06-subsystems/interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


OWNER-003 requires serialization outside domain. That refactor is implemented: [ADR006](decisions/0006-domain-serialization-boundary.md) records adapter-owned codecs and dependency-free domain records. Current readiness and unfinished integration are summarized in the [development state](../09-guides/reference/DEVELOPMENT_STATE.md#current-scope-and-evidence-summary); historical status below is retained with its original scope.


## Owner baseline reconciliation, 2026-10-30

HPX-OWNER-028 removes the separate general-purpose external API client requirement: MCP is an AI-user access mode; the browser internal HTTPS API and contract tooling remain. This does not remove the shared user API.

Mandatory human/AI multi-user and multi-agent scope is defined in [HPX-SUB-010](../06-subsystems/ai-collaboration.md). Chat/provider and MCP adapters must use the same actor-bound application authorization/planning/publication as browser input. Node-based prompt/context/response retention is required. Existing one-owner coordinator and missing MCP/agent adapters are implementation gaps; no new microservice, crate or alternate writer is selected.

## Normative content

Owner-approved boundary: domain types and deterministic validators do not depend on Serde, SQLite, HTTP or cryptographic/key providers. Storage/transport representations belong to their adapters with explicit checked conversions. Purity is not identical to dependency freedom. The [serialization decision](decisions/0006-domain-serialization-boundary.md) records the completed local refactor and its compatibility evidence. This documentation integration changes no code or representation.

The former prose inventory is replaced by the canonical views linked below. Application authorization/orchestration is a logical responsibility currently hosted in `crates/storage`; it does not require a separate crate or service. Browser HTTPS and AI MCP/chat adapters must use the same authorized command/expected-state/receipt semantics. Keep current authority checks before protected replay. A new application module, crate, caching layer or finer lock is not mandated by the review: demonstrate a concrete benefit and preserve transaction/authority boundaries first.

### Responsibility boundaries

Names, boundaries, dependencies and implementation-path mappings are canonical in [the Rust executable overview](../../architecture/C3/executable.c4) and its focused C3/C4 expansions (HPX-CAN-003). The [ownership index](../../architecture/specification-ownership.csv) specifies this scope; implementation and proposal statuses remain distinct. The prose component inventory is removed.

### Decisions required before dependent implementation

Source `HPX-SRC-0021`, original lines 50–60. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Current local mechanisms already exist for typed/versioned records, bounded SQLite publication/drafts/receipts, loopback HTTPS and the macOS keychain alternative. The remaining checklist concerns target scope beyond that implementation:

- Workspace-local user/provider lifecycle, workspace permission capabilities/administration and concurrent-user acceptance.
- Complete repeated-occurrence snapshot closure, ordered composition and structural conflicts; a text CRDT does not validate graph moves.
- Broader integrity/repair coverage, authoritative versus reconstructible state and whole-database freshness limits.
- Additional-platform keychain support, key rotation and separately approved disclosure/custody mechanisms.
- Required AI chat-node/MCP contracts and complete shared API/schema coverage; current library/dependency choices are evidence rather than requests to select them again.
- Separately future offline/federation protocol, causal conflict and membership/key-lifecycle acceptance.

Record consequential new choices in an ADR and obtain owner decisions for unresolved product/security scope. Routine implementation within approved contracts does not require a new architecture decision. Local publication timestamps do not establish federation causality; no group-key or synchronization protocol is adopted here.


### Workspace reuse and investigation design dependencies

The retained passage below predates accepted [ADR019](decisions/0019-working-branches-and-reference-checkpoints.md). Its explicit-publication wording describes committed-source promotion; it is not permission to force Commit for pending-source copy. Accepted private working checkpoints retain exact pending bytes without Commit, with separate post-Commit replacement batches. General multi-owner composition and Paste All remain separately gated.

Source `HPX-SRC-0021`, original lines 72–81. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

[WORKSPACE_INTERFACE.md](<../06-subsystems/document-engine.md>) defines required planned behavior. Extend domain planning for revision-aware anchors, ordered composite documents, cross-identity fork events and complete pinned/live occurrence closure. A source head advance can introduce a new expansion cycle; the resolver must validate the resulting dependency view, not rely on insertion-time checks. Concepts/assertions use ordinary content/references; accepted semantic state and retrospective overlays have distinct snapshot bindings.

Application commands coordinate source promotion, destination publication and protected principal/workspace clipboard state. Under ADR019, provenance copy/paste captures a private working checkpoint without Commit; later explicit/departure Commit and separately acknowledged reference replacement retain their own publication semantics. Copy does not silently commit unrelated drafts. Read permission is not derivation/redistribution authority. Atomic Paste All requires complete validation; clipboard clearing follows committed receipts and reconciles unknown outcomes. A separate private-state store needs an explicit crash-safe coordination protocol, not an assumed cross-store transaction.

Derived indexes cover cross-document backlinks, occurrences, contributors and lineage with explicit permission/view/budget scope. Sensitive private clipboard previews/anchors require encryption and key-lock/revocation handling; display preferences remain non-sensitive. Pinned investigation context is not a continuing authorization grant. No new services, schema, database or provider protocol is selected. Synthetic fixture previews remain separate from the existing authenticated Rust runtime. No new backend capability is enabled by this specification change.


Future client-held/non-trusted mode requires a core egress-policy gate below every command/transport/client and at provider/file/clipboard/print/artifact sinks. Document export and GitHub publication remain prohibited even on an authorized plaintext client. Recheck pending jobs/plans on execution and policy change, propagate protected-source restrictions across mixed inputs and keep diagnostics/caches from becoming disclosure paths. See [encryption requirements](<../06-subsystems/security-cryptography.md>); no egress policy is implemented by the current byte-encryption adapter or fixture frontend.


## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 13–27; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 50–60; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 72–81; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.

## Future bundled document conversion boundary

Owner-confirmed HPX-RQ-030 adds a future Pandoc conversion adapter behind the application-authorized export plan. Keep the pure domain independent of converter libraries, file serialization and process execution; capture exact content/branch/annotation/citation resources before conversion, and recheck egress/permissions before delivery. Reconcile embedded versus bundled-helper packaging with the single Rust executable requirement before adoption; do not introduce a user-installed Pandoc dependency as a fallback. Versions, licenses, bindings, helpers, target profiles and limits require review. No converter is selected or installed by this architecture refinement. See [format scope and fallbacks](../06-subsystems/import-export.md).
