# Browser/runtime contract and capability gates

## Common metadata

- **ID:** `HPX-API-002`
- **Title:** Browser/runtime contract and capability gates
- **Purpose:** Browser/runtime capabilities, source ownership and versioned command boundary.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-002](<../../04-architecture/component-architecture.md>); [HPX-DOM-006](<../../05-domain/text-and-anchors.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Candidate endpoints in source contracts remain sketches. The local /api/v1 implementation is provisional and not a frozen complete wire contract.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Provider and consumers

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Version and compatibility

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Messages and type schemas

The current local listener is [runtime/src/main.rs](../../../crates/runtime/src/main.rs). It reports contract1, trusted_server/whole_document and unavailable graph/provider/client-held services. It implements provisional bootstrap/runtime/unlock/lock/documents/editor/commands/receipt/snapshot routes under /api/v1. This is a local implementation subset, not acceptance of the source proposal's complete endpoint catalogue. Origin/session/TLS and source ownership must be verified independently. The domain must not inherit wire encoding through Serde derives.

### Frontend integration specification

Source `HPX-SRC-0028`, original lines 1–8. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: development coordination specification, 2026-10-24. Audience: the agent building the browser interface and the developers implementing its Rust application services. Read this document with [the product specification](<../../03-requirements/system-requirements.md>), [architecture](<../../04-architecture/system-architecture.md>), [data/navigation reference](<domain-navigation.md>) and [encryption specification](<../security-cryptography.md>).

The behavioral requirements below govern frontend development. Adapter concepts and candidate HTTP routes are design targets, **not implemented endpoints, a frozen JSON schema or a durable storage format**. The product specification takes precedence. Agree executable DTO/schema fixtures with Rust implementation before connecting real data. Interface-study versions, application versions and transport-contract versions are independent.

The [workspace interface specification](<../document-engine.md>) refines the desktop layout, multi-document/reuse semantics and investigation workflows. Its sections define the durable clipboard/promotion/transclusion and backend gates. The owner has **resumed frontend-only implementation** and explicitly waived authentication for the synthetic test preview. This does not authorize backend services, real-data access or removal of future authentication gates.

### 1. Current boundary and staged delivery

Source `HPX-SRC-0028`, original lines 9–26. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The repository implements a pure Rust expansion validator and an in-memory cryptographic adapter. It has **no Rust HTTP server, authentication/session service, draft store, publication service or live REST/MCP endpoints**. Crypto functions are not browser API endpoints. A separate synthetic preview now uses reviewed, pinned CodeMirror 6 and KaTeX packages; its simulated state is not a Rust service or durability result. See [frontend setup](<../../09-guides/developers/getting-started.md>).

Build a desktop interface against a replaceable typed application adapter. A fixture adapter may simulate the required state transitions with synthetic data; an HTTP adapter will later invoke the same application use cases. Show fixture mode persistently as **Demonstration — changes in this tab only**. Do not label fixture operations durable, committed to Rust, authenticated, encrypted at rest or restart-safe. A failed live connection must never silently switch to fixtures or report a successful save.

Do not implement the complete endpoint catalogue before a usable editor slice. Stage delivery as follows:

| Stage | Frontend work | Backend acceptance gate |
|---|---|---|
| A: visual/interaction study | Four columns/split Interaction and Investigation panels, editable synthetic document, selection/undo, outline/minimap, table/maths presentation, attribution and simulated failure states | Fixture-only; no backend dependency |
| B: local editor | Create/open document, exact owned projection, draft autosave/recovery, explicit commit, error/conflict handling | Authentication/unlock design, authoritative identities/source mapping, encrypted durable drafts/publication and real recovery tests |
| C: reviewed structure | Multi-document/composite structure, anchored promotion, private clipboard, fork/pinned inclusion, history and branch comparison/integration | Exact provenance/closure, promotion approval, protected clipboard/receipt recovery, atomic expected-state/idempotency and permission checks; Live gated separately by resolver acceptance |
| D: integrations | Anchored comments, contributor/attribution services, annotations, exact export, mock then live agent, read-only Zotero and optional reviewed GitHub document publication | Per-feature contracts, disclosure/credential policy, capability checks and executed acceptance evidence |
| E: remote/client-held | Live collaboration, offline exchange, federation, client-held mode | Separate concurrency, membership, policy, key lifecycle and trusted-client gates |

Comments/agent visual panels can be demonstrated in A; their persistence/live execution belongs to D. UI presence does not mean feature availability. General backend implementation is not authorized merely by this coordination document.

### 3. Adapter design target

Source `HPX-SRC-0028`, original lines 47–67. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Use one frontend boundary; UI components must not make unrelated fetch calls or manufacture backend graph records. The names below describe use cases and are not a requirement for a particular framework, filename or DTO-generation tool.

| Adapter operation | Minimum semantic input | Required result |
|---|---|---|
| `getRuntime` | Requested contract compatibility | Capabilities, contract/app versions, limits, deployment mode, authentication/storage availability; no secrets |
| `getSession`, `getStorageState` | Current connection context | Separate authenticated-principal/device and storage locked/unlocked state |
| `unlockStorage`, `lockStorage` | Explicit supported unlock method or confirmed lock intent; mutation identity | Resulting storage state, safe errors; never raw keys |
| `listDocuments`, `createDocument` | Workspace/page or requested name/initial content and mutation identity | Authorized summaries or one atomically created initial document state/projection |
| `openEditor` | Workspace/document, branch or exact historical reference, optional draft reference | Text plus complete source map, projection/state tokens, permissions, headings and draft state |
| `openDraft`, `recoverDraft` | Exact base and editing context, or authorized draft reference | Draft reference, generation, acknowledged local sequence and its exact mapped content |
| `saveDraft` | Exact draft/generation, editing context, prior acknowledged sequence, ordered changes through a local sequence, operation identity | Acknowledged sequence, new generation, exact resulting mapping/state token; no immutable commit |
| `resolveSelection`, `searchTargets` | Exact editor/draft context and selection, or bounded query | Authorized stable targets and exact resolved source bindings, or explicit ambiguity/staleness |
| `prepareProposal`, `approveProposal` | One action with exact inputs/state, or frozen proposal reference/scope | Frozen effects/disclosure/ownership and an approval bound to that exact proposal |
| `executeCommand`, `getRequest` | Frozen command/proposal plus expected state and operation identity, or original operation reference | Pending/committed/rejected/unknown result; exact receipt where authorized |

Do not expose fictional success implementations for absent methods. Adapter results must represent unavailable, denied, locked, stale, conflict and uncertain-outcome states. Later adapters extend this boundary for history/compare, comments/annotations, exports, agents and Zotero without bypassing the same authorization and publication semantics.

Keep opaque references semantically distinct: workspace, document/content identity, revision, placement occurrence, manifest revision, snapshot, transformation, branch, commit, draft, proposal, principal, device, group and operation. A document may refer to a composition identity; a new ID representation is not decided here. Backend-issued references must not be derived from labels, heading slugs, text equality or ciphertext addresses. Synthetic fixture references stay confined to fixture mode.

### 7. Capabilities, errors and candidate transport surface

Source `HPX-SRC-0028`, original lines 135–157. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Use same-origin relative paths with a candidate base `/api/v1`; never hard-code host/port in the bundle. Development proxying and release asset embedding must reach the same Rust application services. A future API contract negotiation must reject incompatible shapes/encodings rather than accepting a matching application version. No Node/frontend server or Lean process is required in the released product.

Capability results distinguish implemented support, deployment availability and current permission. Action eligibility also depends on the exact document/selection/state and lock status; capability flags are not authority. Missing capabilities disable the action. Preserve bounded/paginated results and only the completeness/denial information the backend permits. Do not probe or reveal hidden-object existence, fabricate missing bindings or infer permission from visible counts.

Candidate minimum surface, **all currently unimplemented**. Paths are relative to the candidate base and require DTO/security agreement before use:

| Surface | Candidate routes |
|---|---|
| Bootstrap/session/storage | `GET /capabilities`, `GET /session`, `GET /storage/state`; supported login/logout and `POST /storage/unlock`, `POST /storage/lock` after security design |
| Document discovery/creation | `GET /workspaces`, `GET /workspaces/{workspace}/documents`; `POST /commands` with gated `create_document` use case for initial atomic creation |
| Editor/navigation | `GET /documents/{document}/editor`, `GET /documents/{document}/headings`, `POST /documents/{document}/navigation/resolve` |
| Drafts | `POST /documents/{document}/working-drafts`, `GET /working-drafts/{draft}`, `PUT /working-drafts/{draft}` |
| Explicit publication/retry | `POST /commands` with `commit_draft`, `GET /requests/{operation}` |
| Reviewed structural actions | `POST /proposals`, `GET /proposals/{proposal}`, `POST /proposals/{proposal}/approvals`, `POST /commands` |

Require workspace/resource relationship validation even when a path only names a document or draft. Login/bootstrap must not depend on having document decryption keys; permission-filtered bootstrap metadata must not reveal protected content. DTO field spellings, authentication mechanism, cursor format, range conversion, request retention, resource limits, commit receipt and lock lifecycle remain integration gates, not frontend guesses.

Errors need a safe code/category, operation/correlation reference, permitted conflict details and recovery action. Model authentication-required, denied/undisclosed, locked, unsupported, invalid range, stale projection/draft, expected-state conflict, changed-key conflict, limit exceeded, disconnected, pending and unknown outcome. Do not blindly retry publication based on a generic retryable flag. HTTP mappings are subordinate to the agreed error contract; `If-Match` may carry a draft resource precondition, while a multi-owner command needs its full expected-state vector. See [HTTP preconditions and status semantics](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match).

Optional server events may invalidate authorized projections or report progress. Treat them as hints to re-read/reconcile, not permission grants or authoritative editor patches. Connection/presence invalidations do not establish document contribution, authorship or workspace membership. Bound resume state; sequence numbers are local to the negotiated stream/context, not global federation order. Polling/reconciliation is sufficient for the first editor contract; SSE and future MCP transport/protocol are separate gates.


## Preconditions, postconditions and errors

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Ordering, retry and idempotency

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Authentication and authorisation

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Examples and conformance tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 1–8; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 9–26; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 47–67; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 135–157; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
