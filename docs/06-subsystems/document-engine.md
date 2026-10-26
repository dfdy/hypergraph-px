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

### Owner-directed action set: Fork, Link, Embed, Merge and Copy

On 2026-10-25 the owner requested: “Alongside fork, link, and embed add merge and copy.” The required action vocabulary is **Fork, Link, Embed, Merge and Copy**. These are distinct user intents; their availability still depends on exact source/context, permissions, destination state and implemented capability. This extends the target specification, without claiming that all five durable commands exist.

| Action | Required distinction |
|---|---|
| Fork | Create independent destination identity/revisions with exact source provenance. Editing the result does not edit its source. |
| Link | Create an explicitly resolved reference to the selected target; no shared-content inclusion or implicit copy. |
| Embed | Include a source through occurrence/placement and an explicit pinned or live policy; do not silently turn shared inclusion into an independent fork. |
| Merge | Combine explicitly selected compatible inputs through a reviewed result while retaining input histories, conflicts and ordered provenance. Same-identity revision merging and cross-identity content combination remain distinguishable. |
| Copy | Capture exact selected content or source references to the explicitly identified clipboard target. Capture alone creates no destination fork, shared inclusion or merge. Ordinary OS clipboard copy and protected provenance-clipboard capture must remain clearly labelled. |

Merge must identify exact immutable input revisions/ranges and the intended output identity or identities. Same-identity merge parents belong to that logical identity; inputs from different identities belong in transformation provenance, not disguised revision-parent edges. Resolve conflicts explicitly before publication; timestamps, equal text and input order do not silently choose a winner. Keep all accepted source history and recheck authorization/expected state in the publication transaction. The future merge planner, output/composition policy and receipt must be specified before enabling durable Merge writes.

Copy preserves exact UTF-8 content and line endings through the browser coordinate contract. Provenance-aware capture retains exact revision/occurrence/range bindings; it does not make the current user the original author. Ordinary copy does not silently commit unsaved text. Any necessary promotion remains an explicit separately confirmed publication under the existing anchor/promotion contract. Paste remains a separate named operation, with its own fork/transclusion/provenance and rights checks.

The frontend target presents all five names together, while explaining unavailable actions honestly. Current fixture Fork/Link/Embed and clipboard simulations are evidence only for their bounded implemented behavior. Adding Merge/Copy to the specification does not manufacture backend merge, durable copy/promotion, shared ownership or attribution support.

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

## Initial protected Copy implementation evidence, 2026-10-25

The trusted-server runtime now implements the protected-reference portion of Copy for exact committed selections in the one-owner whole-document projection. The private chip row survives document changes/restart, offers exact historical inspection, removal/clear and bounded pagination, and never creates a destination fork merely by capturing. Missing/inaccessible sources appear as removable opaque entries without previews. Editor selections with uncommitted source are rejected with a commit-first explanation; source publication remains an explicit separate action. This increment does not implement promotion, fork-paste, multi-component clipboard plans or shared transclusion. See [wire behavior](interfaces/browser-runtime.md#protected-clipboard-subset-2026-10-25), [private record](../07-implementation/data-structures/sqlite-records.md#optional-private-clipboard-record-2026-10-25) and [executed checks](../registers/tests.csv).

## Initial independent Fork implementation, 2026-10-25

The trusted-server one-owner adapter now connects a selected committed range to an independent document with an immutable pinned derivation. The new document starts its own revision history; its source retains its exact draft, head and history. Later edits on either side do not alter the captured source or initial fork snapshot. The pure domain planner validates the separate identity, revision/path and byte range; adapter authorization, immutable-source validation and atomic publication remain separate responsibilities. The frontend requires explicit review/name, preserves mixed newlines and Unicode, and reconciles unknown replies with the original operation. See [wire contract](interfaces/browser-runtime.md#independent-committed-source-fork-2026-10-25) and [format reference](../07-implementation/data-structures/sqlite-records.md#optional-immutable-fork-derivation-2026-10-25).

This increment does not promote uncommitted ranges, paste private clipboard items into existing documents, map shared/multi-owner edits, create live embeds or implement Merge. The immutable input relation is derivation rather than same-identity revision ancestry. Ordinary planner/storage/browser tests are distinct from the existing bounded Lean evidence; no new formal proof is claimed.

Read-only history comparison presents a selected historical snapshot alongside the latest committed snapshot captured when comparison opens. It distinguishes exact byte equality from changed text and excludes newer uncommitted draft content. Comparison is an inspection operation with no source publication or automatic merge; the [runtime contract](interfaces/browser-runtime.md#read-only-committed-snapshot-comparison) defines its bounded reads.

## Owner-approved first Merge scope, 2026-10-26

The owner selected reviewed new-document synthesis in [HPX-ADR-015](../04-architecture/decisions/0015-initial-merge-workflow.md). The first workflow reviews multiple exact committed input ranges and editable output before explicit atomic publication into a new document/content identity. Preserve ordered inputs, initial output and publisher provenance with original source authorship explicitly unknown; retain every source and its history. This is distinct from same-identity branch merge, which remains future scope. The [runtime contract](interfaces/browser-runtime.md#reviewed-new-document-merge) records the bounded implementation interface and verification limits.

## Planned Merge into parent branch

The owner's 2026-10-26 clarification identifies the intended interface Merge workflow as integrating the current document branch's text into a parent branch. Plan this under [roadmap stage 5](../02-governance/roadmap.md#planned-branch-parent-merge-workflow--owner-clarification-2026-10-26), after durable multiple-branch heads, branch-specific drafts and safe branch viewing/switching. The parent destination and conflicts must be explicit; preserve source/target histories and use same-identity revision ancestry. Branch parentage is distinct from revision-parent edges and cross-identity derivation. Treatment of uncommitted text and exact publication/compatibility mechanics remain to be specified before enabling the operation.

This is a documented future requirement, not an immediate implementation instruction. The current independently published synthesis remains its separately approved bounded operation; it does not implement merging into a parent branch. [ADR015](../04-architecture/decisions/0015-initial-merge-workflow.md#later-owner-clarification-parent-branch-merge) retains both the first increment and this later clarification.
