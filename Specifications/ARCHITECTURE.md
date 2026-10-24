# Software architecture

Status: current architecture, 2026-10-24. Requirements are defined by [SPECIFICATION.md](SPECIFICATION.md). Implemented components are identified below; planned directories are responsibility boundaries, not existing services.

## Deployment and development

The initial application runs locally for one human. Model users, devices, groups, policy authority and causal operations so later live collaboration, explicit branches and federated instances do not depend on process-local identities or wall-clock ordering. Remote operation remains unavailable until its acceptance gates pass.

Develop the browser frontend independently from Rust data and application processes. Development may use a frontend development server with a defined API/proxy contract. Production builds embed the compiled HTML/CSS/JavaScript in one Rust executable that owns startup, storage, application services, transport and asset delivery. Node, Lean and a separate database/frontend server are not runtime requirements. Describe platform libraries accurately for each release target.

## Responsibility boundaries

| Component | Responsibility | Implementation status |
|---|---|---|
| `crates/domain` | Pure deterministic data invariants, graph projections and operation planning; no implicit authorization or I/O | Bounded expansion validator implemented; persistent identities/history/snapshot records planned |
| `crates/crypto` | Authenticated byte envelopes, OS entropy, managed keys and bounded passphrase-key wrapping | In-memory adapter implemented; no filesystem, policy or login behavior |
| Application layer | Trusted principal/device resolution, command authorization, exact expected-state checks, previews and receipts | Planned |
| Storage layer | Canonical immutable records, one authoritative publication model, recoverable indexes and mutable durable drafts | Planned; no database or publication mechanism selected |
| Transport/bootstrap | Local HTTP API, REST/MCP adapters, authentication, configuration and embedded asset delivery | Planned |
| Browser frontend | Whole-document editor/source mapping, contents, minimap, Agent/Comments/Users, acknowledgement reconciliation | Synthetic frontend-only preview uses CodeMirror 6/KaTeX; live services and durable acknowledgements planned |
| Integration adapters | Explicitly scoped model calls, citation reads, export and future synchronization | Planned |
| `proofs` | Lean models, selected extracted-Rust proofs and reproducible development/CI checking | Four model theorems and one extracted-helper theorem checked; see the validation digest |

Avoid dependency cycles: domain semantics must not depend on a database, HTTP, browser state, key provider or federation protocol. The crypto adapter does not decide authorization. REST, MCP, browser and agent commands must converge on the same application operation semantics. Introduce concrete crates/modules as working behavior lands rather than many empty services.

## Data and command flow

Canonical immutable records support typed projections: occurrence structure, revision ancestry, transformation provenance, references, expansion dependencies and snapshot closure. Derive indexes rather than creating competing authoritative stores. Logical identity is independent of physical encrypted addresses. See the [mathematical model](DATA/MATHEMATICAL_MODEL.md) and [data reference](DATA/README.md).

```text
frozen request + trusted actor/device + exact base/policy
    -> authorize source/target operations
    -> pure validation and complete result planning
    -> recheck affected heads/policy and idempotency
    -> durably publish one complete atomic result
    -> update recoverable read models
    -> return original action/commit receipt
```

This is the required application flow, not an implemented transaction system. Preview/navigation must not publish history. Changed request reuse under the same idempotency key conflicts; uncertain acknowledgements reconcile the original action. Autosave persists mutable drafts separately from immutable commits. Delayed replies must preserve newer typing, selection and undo state.

## Security and execution

Trusted-server custody is the default: the unlocked Rust process may hold keys and permitted plaintext. Passphrase unlock defaults on; an explicit OS-keychain alternative is a delivery requirement. Login remains separate. [ENCRYPTION.md](DATA/ENCRYPTION.md) defines the implemented byte adapter and its limits.

Client-held mode remains unavailable. Its future plaintext work must execute at an authorized client boundary or report unsupported. A server configuration value cannot grant keys or silently change security policy. Keep independently trusted and browser-only client paths distinct: malicious host code delivery is excluded from the browser-only confidentiality guarantee.

## Decisions required before dependent implementation

- Domain identifier/canonical encodings, signatures, policy authority and exact repeated-occurrence snapshot bindings.
- Ordered placement representation, structural conflict acceptance and live text/branch concurrency semantics; a text CRDT does not validate graph moves.
- Durable publication order, writer isolation, fsync/recovery, integrity verification, index rebuilding and draft acknowledgements.
- Keychain provider, key hierarchy/rotation, authenticated policy/head rollback protection and selective historical disclosure.
- Development API/proxy/security contract and browser/embedded parity; frontend library selection.
- Offline operation validation, membership/revocation, replication protocol and federation acceptance.

Make routine mechanism choices within the approved requirements and record them in an ADR before code. Ask only when a consequential unresolved product/security decision requires owner input. Local publication timestamps cannot establish global federation causality. MLS is a candidate transport/group-key mechanism, not an adopted graph synchronization protocol.

## Verification and delivery gates

Preserve pure deterministic validators and bounded traversals. Distinguish tests, Lean model proofs and extracted-Rust correspondence. Current full-validator translation is blocked by concrete Aeneas subset/model limits; its budget helper is proved through extraction. No cryptographic primitive, filesystem or complete application proof is claimed.

Require an early complete editor workflow: owned whole-buffer editing, five-second-idle draft persistence, restart recovery, explicit commit and delayed acknowledgement handling. Verify crash/failure states, exact historical reconstruction, authorization and development/embedded browser parity. The current domain and crypto primitives do not constitute this delivered workflow.

Frontend implementation coordination is defined in [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md). Its fixture-first work order and behavioral contracts do not settle the outstanding durable-format, transport DTO, authentication or recovery mechanisms listed above.

The Users tab is a permission-scoped document-contributor projection over attribution/provenance, with current human/agent context pinned separately; it is independent of session presence and workspace membership. A derived contributor index requires no change to the core typed-graph model and grants no additional historical access.


## Workspace reuse and investigation design dependencies

[WORKSPACE_INTERFACE.md](WORKSPACE_INTERFACE.md) defines required planned behavior. Extend domain planning for revision-aware anchors, ordered composite documents, cross-identity fork events and complete pinned/live occurrence closure. A source head advance can introduce a new expansion cycle; the resolver must validate the resulting dependency view, not rely on insertion-time checks. Concepts/assertions use ordinary content/references; accepted semantic state and retrospective overlays have distinct snapshot bindings.

Application commands coordinate source promotion, destination publication and protected principal/workspace clipboard state. Copy-triggered promotion requires explicit publication confirmation and must not silently commit unrelated drafts. Read permission is not derivation/redistribution authority. Atomic Paste All requires complete validation; clipboard clearing follows committed receipts and reconciles unknown outcomes. A separate private-state store needs an explicit crash-safe coordination protocol, not an assumed cross-store transaction.

Derived indexes cover cross-document backlinks, occurrences, contributors and lineage with explicit permission/view/budget scope. Sensitive private clipboard previews/anchors require encryption and key-lock/revocation handling; display preferences remain non-sensitive. Pinned investigation context is not a continuing authorization grant. No new services, schema, database or provider protocol is selected. Frontend-only fixture implementation is resumed; no backend runtime is enabled. The test preview has no sign-in, while future real-data authentication gates remain required.
