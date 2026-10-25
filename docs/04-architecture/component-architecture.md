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
- **Last reviewed:** 2026-10-25

OWNER-003 requires serialization outside domain. Current domain Serde usage is nonconforming local work to refactor later, without changing code here.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Pure domain, application, storage/crypto and transport dependency directions. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Pure domain, application, storage/crypto and transport dependency directions. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

Owner-approved boundary: domain types and deterministic validators do not depend on Serde, SQLite, HTTP or cryptographic/key providers. Storage/transport representations belong to their adapters with explicit checked conversions. Purity is not identical to dependency freedom. Current Serde derives/dependency in domain are an implementation discrepancy; this migration does not remove them. The [serialization decision](decisions/0006-domain-serialization-boundary.md) records the required follow-up.

### Responsibility boundaries

Source `HPX-SRC-0021`, original lines 13–27. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

| Component | Responsibility | Implementation status |
|---|---|---|
| `crates/domain` | Pure deterministic data invariants, graph projections and operation planning; no implicit authorization or I/O | Bounded expansion validator implemented; persistent identities/history/snapshot records planned |
| `crates/crypto` | Authenticated byte envelopes, OS entropy, managed keys and bounded passphrase-key wrapping | In-memory adapter implemented; no filesystem, policy or login behavior |
| Application layer | Trusted principal/device resolution, command authorization, exact expected-state checks, previews and receipts | Planned |
| Storage layer | Canonical immutable records, one authoritative publication model, recoverable indexes and mutable durable drafts | SQLite selected; encrypted record/slot transaction design accepted, implementation in progress |
| Transport/bootstrap | Local HTTP API, REST/MCP adapters, authentication, configuration and embedded asset delivery | Planned |
| Browser frontend | Whole-document editor/source mapping, contents, minimap, Agent/Comments/Users, acknowledgement reconciliation | Synthetic frontend-only preview uses CodeMirror 6/KaTeX; live services and durable acknowledgements planned |
| Integration adapters | Explicitly scoped model calls, citation reads, export and future synchronization | Planned |
| `proofs` | Lean models, selected extracted-Rust proofs and reproducible development/CI checking | Four model theorems and one extracted-helper theorem checked; see the validation digest |

Avoid dependency cycles: domain semantics must not depend on a database, HTTP, browser state, key provider or federation protocol. The crypto adapter does not decide authorization. REST, MCP, browser and agent commands must converge on the same application operation semantics. Introduce concrete crates/modules as working behavior lands rather than many empty services.

### Decisions required before dependent implementation

Source `HPX-SRC-0021`, original lines 50–60. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- Domain identifier/canonical encodings, signatures, policy authority and exact repeated-occurrence snapshot bindings.
- Ordered placement representation, structural conflict acceptance and live text/branch concurrency semantics; a text CRDT does not validate graph moves.
- Durable publication order, writer isolation, fsync/recovery, integrity verification, index rebuilding and draft acknowledgements.
- Keychain provider, key hierarchy/rotation, authenticated policy/head rollback protection and selective historical disclosure.
- Development API/proxy/security contract and browser/embedded parity; frontend library selection.
- Offline operation validation, membership/revocation, replication protocol and federation acceptance.

Make routine mechanism choices within the approved requirements and record them in an ADR before code. Ask only when a consequential unresolved product/security decision requires owner input. Local publication timestamps cannot establish global federation causality. MLS is a candidate transport/group-key mechanism, not an adopted graph synchronization protocol.

### Workspace reuse and investigation design dependencies

Source `HPX-SRC-0021`, original lines 72–81. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

[WORKSPACE_INTERFACE.md](<../06-subsystems/document-engine.md>) defines required planned behavior. Extend domain planning for revision-aware anchors, ordered composite documents, cross-identity fork events and complete pinned/live occurrence closure. A source head advance can introduce a new expansion cycle; the resolver must validate the resulting dependency view, not rely on insertion-time checks. Concepts/assertions use ordinary content/references; accepted semantic state and retrospective overlays have distinct snapshot bindings.

Application commands coordinate source promotion, destination publication and protected principal/workspace clipboard state. Copy-triggered promotion requires explicit publication confirmation and must not silently commit unrelated drafts. Read permission is not derivation/redistribution authority. Atomic Paste All requires complete validation; clipboard clearing follows committed receipts and reconciles unknown outcomes. A separate private-state store needs an explicit crash-safe coordination protocol, not an assumed cross-store transaction.

Derived indexes cover cross-document backlinks, occurrences, contributors and lineage with explicit permission/view/budget scope. Sensitive private clipboard previews/anchors require encryption and key-lock/revocation handling; display preferences remain non-sensitive. Pinned investigation context is not a continuing authorization grant. No new services, schema, database or provider protocol is selected. Frontend-only fixture implementation is resumed; no backend runtime is enabled. The test preview has no sign-in, while future real-data authentication gates remain required.


Future client-held/non-trusted mode requires a core egress-policy gate below every command/transport/client and at provider/file/clipboard/print/artifact sinks. Document export and GitHub publication remain prohibited even on an authorized plaintext client. Recheck pending jobs/plans on execution and policy change, propagate protected-source restrictions across mixed inputs and keep diagnostics/caches from becoming disclosure paths. See [encryption requirements](<../06-subsystems/security-cryptography.md>); no egress policy is implemented by the current byte-encryption adapter or fixture frontend.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Pure domain, application, storage/crypto and transport dependency directions. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 13–27; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 50–60; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 72–81; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
