# System Requirements

## Common metadata

- **ID:** `HPX-REQ-002`
- **Title:** System Requirements
- **Purpose:** Observable requirements and invariant commitments, independent of implementation completeness.
- **Level:** `03-requirements`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-PRIN-002](<../01-purpose/principles.md>); [HPX-PRIN-004](<../01-purpose/scope-and-non-goals.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Inherited accepted obligations remain effective. The editorial migration is proposed; no functionality is newly claimed delivered.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Observable requirements and invariant commitments, independent of implementation completeness. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Observable requirements and invariant commitments, independent of implementation completeness. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content



### Hypergraph PX MU-F — product specification

Source `HPX-SRC-0032`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: current requirements, 2026-10-24. Project version 0.7.0. This document defines the approved product requirements. The architecture, mathematical model, data reference and encryption specification in this directory elaborate these requirements and distinguish implemented behavior from planned work.

### 2. Data and history invariants

Source `HPX-SRC-0032`, original lines 13–29. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

**Text encoding:** UTF-8 is required for document text, textual stored payloads, text API/wire representations and plain-text/Markdown exports. Encrypted objects and other binary containers remain binary; encode their text payloads as UTF-8 before encryption/serialization. Reject malformed UTF-8 at text boundaries rather than silently replacing characters. Preserve exact Unicode content and line endings; encoding does not authorize normalization. Browser UTF-16 indices are an internal coordinate convention and must be explicitly converted at integration boundaries.

The core is a typed temporal multigraph exposed through constrained projections, not one untyped graph database:

1. Stable logical content identities have immutable revision DAGs. Same-identity parents are distinct from cross-identity derivation.
2. Ordered occurrence placements identify where shared content appears. Repeated content and repeated nested manifests retain distinct binding contexts; moving a placement preserves its identity.
3. Immutable manifests record composition independently of constituent text changes. Links may cycle; accepted recursive expansion dependencies may not.
4. Transformation events record exact ordered immutable inputs/outputs, source ranges, operation parameters and provenance for extraction/fork/split/merge. Reverse lineage is derivable without rewriting sources.
5. Closed snapshots bind exact manifest and nested occurrence-selected revisions, rules/pins and compiler inputs. Historical reconstruction never follows newer heads, reruns mutable queries or refreshes external metadata silently.
6. Node, composition and snapshot history remain retained without arbitrary revision-count caps. Request/storage quotas reject work atomically rather than prune history silently. Restore appends a new state.

Distinguish content/revision/occurrence/transformation/snapshot/commit/principal/device/group identities, private content commitments and physical encrypted object addresses. Their canonical encodings and cryptographic bindings require explicit design before durable data writes. Public plaintext hashes must not leak equality across authorization/encryption domains by default.

Each traversal identifies its projection, order, context, permission scope, duplicate/cycle behavior and work/output budget. Query results are bounded and paginated. Read-only navigation and preview do not publish history. [DATA/README.md](<../06-subsystems/interfaces/domain-navigation.md>) documents actual types/navigation functions, invariants, complexity, errors and implementation evidence as they land.

### 3. Persistence and concurrency

Source `HPX-SRC-0032`, original lines 30–43. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Embedded SQLite is selected for native `.hpx` workspaces. The [core object model](<../05-domain/core-object-model.md>) and [persistence/recovery specification](<../06-subsystems/formats/hpx-workspace.md>) define the first single-owner durable writer and its explicit exclusions. Portable formats, GitHub backup and federation remain separate milestones.

Define one authoritative object/commit publication model with an explicitly recoverable index/read model. No mutable working file or unverified database cache becomes historical truth. A full history audit/read model must avoid redundant replay inside every helper; optimization must preserve integrity rather than trust stale authorization.

Transactions bind actor/action, exact affected owners, expected heads, policy and complete resulting dependency closure. Commit publishes content/structure/provenance/snapshot effects atomically. Changed idempotency-key reuse conflicts; uncertain acknowledgements reconcile the original request instead of silently resubmitting a fresh operation.

Five-second idle autosave persists mutable recoverable working drafts separately from immutable commits. Acknowledged drafts survive restart; autosave alone creates no revisions/snapshots/branch transitions. Explicit commit and reviewed structural/agent actions publish history. Older acknowledgements preserve newer typing, selection and undo history.

Future replicated operations carry causal and authenticated author/device/policy evidence; local publication order and timestamps are not a global federation order. A text CRDT alone does not validate structural moves. The concurrency ADR must specify deterministic acceptance/conflicts, offline operations and membership/policy changes before remote mutation is enabled.

Durability acceptance includes interrupted staging/publication, disk/write/fsync failures, corruption, index rebuilding and exact retry. No recoverability claim is made before the relevant mechanism/tests exist.

### 4. Encryption and authority

Source `HPX-SRC-0032`, original lines 44–59. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

**Important medium-term priority:** encrypt and authenticate all browser-to-runtime communication, including loopback, using HTTPS and WSS where applicable. This is a gate before real-data browser integration, independent of storage/client-held encryption. Keep the current synthetic HTTP preview clearly separate. See [transport security](<../06-subsystems/security-cryptography.md>) for certificate trust, bootstrap and acceptance requirements. This capability is not implemented.

Trusted-server mode is the initial implementation and default: an unlocked trusted Rust process may decrypt permitted data for editing/search/compilation and approved integrations. Support passphrase and OS-keychain startup unlock, with passphrase unlock the default. Login authentication remains distinct from storage-key unlock; keychain use is an explicit alternative. Encrypt complete historical content and sensitive derived state at rest, including manifests/provenance, indexes/drafts and backups as applicable. Encryption suites, nonce/key envelopes, master-key unlock/recovery and authenticated contexts require an explicit security design, established libraries and tests.

Client-held encryption is designed into identities, policies and execution boundaries now, but remains explicitly unavailable until implemented. In that mode the hosting server must not gain plaintext/decryption keys through configuration. Operations requiring plaintext run at an authorized client boundary or report unavailable; no silent server delegation or mode downgrade is permitted.

Future client-held/non-trusted mode must deny application-controlled plaintext egress at the core, including GitHub publication and document export, across all UI/API/MCP/client/background paths. Client keys, read rights and confirmation cannot bypass that mode policy. See the [future egress requirement](<../06-subsystems/security-cryptography.md>). This stricter rule supersedes earlier client-side export/disclosure allowances; it remains unimplemented.

Authenticated workspace/group security policy controls key custody and migration; operational TOML cannot create missing decryption authority. Mode changes and re-encryption preserve logical identities and require the applicable authorization. Client-encryption recovery uses a user-held recovery key; server account reset cannot recover client-only keys. Revocation cannot erase data already disclosed to a participant.

Initial future sharing scope is workspace/document. Full retained history is shared only by explicit grant. Current-state sharing must specify dependencies/provenance disclosure and opaque/hidden inaccessible references; read permission does not automatically imply every historical key.

Keep cryptographic transport/group-key agreement separate from document synchronization, authorization, conflict resolution and archival access. MLS is a candidate for future group transport, not an adopted implementation or complete federation protocol. Reject silent security downgrades. Retain both browser-only and independently trusted client deployment paths for future client-held mode. The stronger guarantee against a malicious hosting server changing editor code requires the independently trusted client and update channel; browser-only deployments must explicitly exclude malicious client-code delivery from their confidentiality guarantee. A client/server deployment role need not imply distinct application implementations.

### 5. Editor and integrations

Source `HPX-SRC-0032`, original lines 60–71. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Provide a desktop writing interface with four default columns, from left to right: (1) a contents tree of chapters, sections and subsections; (2) an editor showing styled Markdown source; (3) a document minimap labelled Navigator, supporting wheel/click/drag/keyboard navigation and current-viewport indication, hide/show and placement on either side of the editor; (4) a split sidebar with upper Interaction tabs (Agent, Comments, Users) and lower Investigation tabs (Relationships, Concepts, Sources, Provenance, History). The left navigator provides Workspace, Document, Graph and History lenses while keeping the heading tree accessible. Preserve whole-document caret, selection and source-ownership mapping. Comments are user-authored document annotations and remain separate from agent conversation. Users shows the known contributors to the current document, with the current human and current agent pinned above other contributing users/agents, each with a distinct display colour. It is a permission-scoped contribution/provenance view rather than a logged-in-user list; showing a contributor does not enable remote editing or grant historical access. Mobile is deferred. Document-local prose and repeated/nested source ownership are part of the core source model rather than late editor exceptions.

The [frontend integration specification](<../06-subsystems/interfaces/browser-runtime.md>) defines browser/Rust responsibilities, exact selection and source-mapping rules, draft/commit state handling, staged capabilities and frontend acceptance scenarios. Its candidate endpoints and adapter shapes are not implemented or frozen wire formats.

Human and agent principals remain distinct. Context selection, model output and document instructions grant no permissions. Proposals freeze exact targets, action scope, model/actor attribution and expected state; approval rechecks current rights. Mock proposal/approval/recovery precedes live authoring. External model disclosure is explicit and mode-dependent.

Branch comparison/selected integration, anchored comments, typed reasoning annotations, graph navigation, read-only Zotero citation integration, export and shared REST/MCP interfaces are planned product areas. They are not implemented yet. Specify and validate detailed capability, provider and protocol contracts before enabling them.

The [workspace interface specification](<../06-subsystems/document-engine.md>) extends the desktop contract with independent chapter documents in versioned composite works, per-user/workspace protected provenance clipboards, explicit selection promotion, repeated paste-as-fork, pinned/live transclusion and contextual semantic assertions. Exact history, ownership, authorization and recovery are prerequisites for these durable capabilities. Clipboard previews and anchors are sensitive private state; ordinary copy never silently commits unsaved work. Lower-panel context pinning and accessible navigation are required. Zotero targets separately authenticated desktop-local REST and cloud Web API adapters, read-only initially. All these capabilities remain planned.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Observable requirements and invariant commitments, independent of implementation completeness. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 1–4; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 13–29; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 30–43; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 44–59; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 60–71; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.

## Owner addition: five distinct content actions, 2026-10-25

Expose **Fork, Link, Embed, Merge and Copy** as distinct action names. The owner explicitly added Merge and Copy alongside Fork/Link/Embed. Their authoritative behavior is defined by the [document-engine action set](../06-subsystems/document-engine.md#owner-directed-action-set-fork-link-embed-merge-and-copy), with presentation in the [frontend contract](../06-subsystems/frontend-interaction.md). Merge preserves exact input histories and transformation evidence; Copy distinguishes clipboard capture from subsequent publication. Neither action silently changes identity, grants authority, commits a draft or erases retained history. Required names and target behavior do not imply that the durable operations are already implemented.

## Separately reviewed owner additions, 2026-10-25

- **HPX-RQ-028:** Make “logically equivalent” explicitly discoverable as the existing contextual equivalence relation, preserving identity and the distinction between an assertion, a checked proof and node identity. See [domain definition](../05-domain/assertions-and-predicates.md#owner-approved-logical-equivalence-clarification-2026-10-25).
- **HPX-RQ-029:** Provide a read-only graph of any selected authorised nodes as labelled circles and their relationships as labelled connectors, preserving direction, n-ary roles, context, completeness and evidence status. See [graph view contract](../06-subsystems/graph-engine.md#owner-approved-selected-node-graph-view-2026-10-25).

The owner explicitly deferred the separately proposed statement/relationship-to-Lean conversion workflow. It is not an adopted requirement or an enabled feature by this review.

## Owner-confirmed future bundled export scope, 2026-10-26

HPX-RQ-030 records future embedded/bundled Pandoc integration without a separate user installation, targeting .docx/.odt/.rtf/.html/.tex/.typ/.xml/.json and academic citation styles including APA/Harvard/Chicago/IEEE with bibliographies. Offer selected-document main-branch output and explicitly selectable additional branches, provenance, annotations and sentence/paragraph/section/other-node relationships. Define native representations and readable fallbacks per format, preserve exact source/view/role/evidence context and append permitted unresolved-rights reports without blocking export solely for such disputes. Existing authorization and confidentiality/egress rules remain mandatory. This is accepted future product scope, not an immediate implementation priority, converter/version adoption or a claim of installed writer support. See the [planned export contract](../06-subsystems/import-export.md).

## HPX-RQ-031: private working branches and exact provenance checkpoints

The owner explicitly adopted [ADR019](../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) on2026-10-26. Pending edits belong to a private working branch associated with the selected content branch. Autosave acknowledges that branch's exact recoverable buffer; provenance-bearing copy/paste can automatically retain an exact immutable checkpoint without advancing published content. Explicit Commit remains the publication boundary. Exact source correspondence may produce new committed replacement references with inspectable predecessor/promotion evidence; original links/checkpoints remain retained. Changed source stays historical working evidence until explicit review, without heuristic relocation. Current authorization applies to capture, replay, inspection and replacement. This accepted design precedes branch UI integration; backend tests are not complete clipboard/paste/branch delivery evidence.
