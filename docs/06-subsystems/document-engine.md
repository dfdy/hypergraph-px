# Document Engine

## Common metadata

- **ID:** `HPX-SUB-002`
- **Title:** Document Engine
- **Purpose:** Composition, source promotion, private clipboard, pinned/live reuse and publication gates.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../04-architecture/system-architecture.md>); [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Fixture controls and future contracts are not durable service implementations. Capabilities must report unavailable honestly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Responsibilities and boundaries

Composition, source promotion, private clipboard, pinned/live reuse and publication gates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Inputs and outputs

Composition, source promotion, private clipboard, pinned/live reuse and publication gates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## State and operations



### Workspace, reuse and investigation interface

Source `HPX-SRC-0037`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: current target requirements, 2026-10-24. Canonical backend capabilities in this document are **unimplemented**; the separate frontend preview implements selected presentation and explicitly tab-only fixture interactions. This document refines the [product specification](<../03-requirements/system-requirements.md>) and [frontend integration contract](<interfaces/browser-runtime.md>); it defines behavior, not a selected database, endpoint schema or frontend library. Frontend-only implementation is authorized; the synthetic preview opens without authentication. Backend implementation remains outside this scope.

### 1. Core boundaries

Source `HPX-SRC-0037`, original lines 5–10. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Composition trees, reference graphs, revision graphs, provenance graphs and closed document snapshots remain the canonical constructs. Expansion dependencies are a constrained projection, not a new semantic graph. Concepts, propositions, arguments and assertions are content entities with ordinary identities/revisions and typed references. The provenance clipboard is private application state, not a sixth canonical graph.

Keep content identity, immutable revision, placement occurrence, anchor, transformation event, branch, snapshot and principal distinct. Same-identity revision parents never encode cross-identity fork ancestry. Interpretive predicates never invoke structural operations, validate logical truth or grant access. No new runtime functionality or formal proof follows from these requirements.

### 5. Provenance clipboard

Source `HPX-SRC-0037`, original lines 48–70. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Place a fixed, horizontally scrollable chip row immediately above the Wrap/Authors/Maths/Font-size controls. Chips expose type, truncated preview, source/revision label, optional paste count and an individual remove button. Provide Clear All and overflow/collapse; explicit duplicate and reorder may follow. Recopying the identical selection may focus the existing entry; deduplication uses exact source binding, not equal preview text.

The durable clipboard belongs to **one principal and workspace**, survives document switches/restarts and is not shared by default. It stores exact source references/range components, ordering and optional previews; it is separate from the OS clipboard and canonical provenance. Treat previews, anchors and labels as sensitive: persist under the approved encrypted user-state/key lifecycle, not plaintext localStorage, cookies or an unauthenticated cache. UI preference persistence alone cannot implement this feature. Client-held mode later needs an authorized client executor or must report unsupported.

Deleting a chip clears a reference only, never source, forks, transclusions or retained history. Retention/garbage collection must distinguish clipboard removal from release of graph/history dependencies. Revoked access may leave an opaque entry/tombstone but no unauthorized preview. Lock/logout blocks reads and invalidates stale responses. Restart recovery restores only acknowledged authorized entries.

Context-menu commands, distinct from OS Copy/Cut/Paste:

| Command | Required effect |
|---|---|
| Copy to Provenance Clipboard | Resolve/capture exact source, explicitly promote if needed, then acknowledge protected entry; no pre-created fork |
| Paste as Fork / Paste as Fork and Clear | Choose one or all ordered entries; create independent destination identities and initial revisions with exact provenance; clear only acknowledged successful entries |
| Insert as Transclusion / Insert as Transclusion and Clear | Choose one/all and Pinned/Live; create placements/references with explicit resolution policy, not independent source copies |
| Remove / Clear All | Mutate private clipboard state only |

Each repeated fork paste allocates distinct destination identities from the original captured source revisions, even after source heads change. Typing in a fork never edits the original. Preserve per-component provenance, citations/references where authorized and structurally valid insertion rules. Read permission is not permission to copy/redistribute/derive: recheck the operation's source and destination rights and disclosure policy at execution. A reference grants no historical keys or cross-workspace access.

“One item” and “all” bind exact ordered entry versions in the frozen plan. Default Paste All is atomic; no silent skip of inaccessible/invalid entries. An optional explicit partial workflow uses separately identified item commands and reports every result. Concurrent clipboard removal/reorder or target edits cannot silently change the approved plan.

Publication includes destination nodes/revisions, mandatory derivation events and composition effects in one atomic result. Private clipboard clearing must be coordinated by the same authoritative transaction or a durable idempotent receipt-linked protocol. Do not claim atomicity across separate stores without such a mechanism. On uncertain result retain pending entries and reconcile the original operation; never clear early or generate duplicate forks. Clear-and-paste conflicts and multi-context private-state generations must be specified before enabling writes. After publication, undo is a new valid operation, not history erasure; clipboard removal cannot undo a published paste.

### 6. Pinned and live transclusion

Source `HPX-SRC-0037`, original lines 71–80. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Pinned transclusion binds an immutable source revision **and required nested closure**, not only a top-level ID. Live transclusion follows a designated source identity/branch/track in a current resolved view. Display origin, pin/follow rule, resolved revision and synchronization/availability state. Historical snapshots freeze every resolved revision and nested occurrence context; they never follow later heads.

At the destination, transcluded text is read-only by default. Offer **Go to source / Edit source** only when authorized, or **Fork into independent content**. Never silently redirect destination typing to shared source. Selection and source mapping preserve this distinction even when text is rendered inline.

A safe live update is a validated resolution at an explicit consistent view. Recheck expansion cycles and bounds across the complete affected dependency projection before accepting changes. The original acyclic insertion does not prove all future source-head combinations acyclic. On conflict, revoked access, missing target or unavailable source, show explicit unresolved/blocked state; never silently substitute a cached revision as current. Any last-known display is marked stale and only shown while still authorized. Historical reconstruction requires its exact closure or reports unavailable.

Branch deletion/rename, offline fallback, concurrent head changes and cross-workspace policy need a resolver ADR and tests before live transclusion is enabled. The initial validated implementation may support pinned inclusion first; the Live control stays disabled until these gates pass.

### 8. Backend dependencies and staged acceptance

Source `HPX-SRC-0037`, original lines 93–116. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Logical capabilities (identity, content/anchors, composition, revisions, references, provenance, snapshots, private clipboard, queries, permissions and integrations) are modules inside the application boundary, not mandatory microservices. Browser, REST and MCP converge on the same authorized planner/publication semantics. Canonical records, reconstructible indexes and protected private user state have distinct responsibilities. SQLite is an available embedded-engine option, **not selected**. Keep the single Rust release executable and local-only initial serving restrictions.

Zotero integration plans include separately selectable/authenticated desktop-local REST and cloud Web API adapters, read-only initially. Their actual protocol/credential/origin contracts require review before code. Bind cited metadata to reconstruction inputs; live provider refresh never changes historical output. GitHub publication remains an explicit external job, not canonical history.

Dependency order below extends the editor delivery gates; each requires its own evidence; frontend-only authorization does not enable backend writes:

| Gate | Required capability and observable acceptance |
|---|---|
| Foundational local workflow | Authoritative identities/mappings, encrypted durable drafts, explicit commit/recovery and one real embedded editor; fixture visuals alone do not pass |
| Multi-document composition | Six independent chapters in one versioned composite; reorder without changing content identities; multi-collection membership without clones; previous/next follows composition |
| Anchors and pinned reuse | Exact partial/multi-owner selections with Unicode/repeated text; explicit promotion without rendering changes or snapshot damage; repeated fork paste yields distinct identities from the same captured revision; pinned reuse survives source edits |
| Clipboard recovery | Per-principal/workspace isolation; encrypted restart recovery; concurrent contexts, permission loss and lost replies; all-or-nothing Paste All and receipt-linked clear without missing provenance or duplicate forks |
| Investigation | Split-panel keyboard resize/collapse/tab access; pinned context stable across caret moves; proposal rejection/acceptance and competing assertions; accessible color-independent contributor identification |
| Live resolution and history | Newly introduced cycles, bounds, branch deletion, offline/unavailable targets; exact repeated/nested/composite/semantic snapshot reconstruction; cross-document lineage and non-destructive undo |
| Integrations and later deployment | Exact Markdown/HTML plus manifests, separately gated Zotero adapters; future coediting/federation/client-held boundaries, never inferred from local UI availability |

History and snapshot semantics are foundations for every durable gate, not features deferred until after destructive reuse. Add pure-model obligations for promotion preservation, fork provenance completeness, snapshot determinism and atomic publication/clear before claiming assurance. Any Lean evidence must name actual checked theorems and Rust correspondence; none is newly established here.


Future export/compilation and external integration capabilities are subject to the [client-held/non-trusted egress policy](<security-cryptography.md>): document export and GitHub publication are disabled at the core in that mode, even at a plaintext-capable client. Internal protected provenance-clipboard references are distinct from an OS clipboard export sink. These mode restrictions remain future implementation gates.


## Invariants and error behavior

Composition, source promotion, private clipboard, pinned/live reuse and publication gates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Dependencies and interfaces

Composition, source promotion, private clipboard, pinned/live reuse and publication gates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Security and privacy

Composition, source promotion, private clipboard, pinned/live reuse and publication gates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 1–4; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 5–10; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 48–70; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 71–80; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 93–116; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
