# Workspace, reuse and investigation interface

Status: current target requirements, 2026-10-24. Canonical backend capabilities in this document are **unimplemented**; the separate frontend preview implements selected presentation and explicitly tab-only fixture interactions. This document refines the [product specification](SPECIFICATION.md) and [frontend integration contract](FRONTEND_INTEGRATION.md); it defines behavior, not a selected database, endpoint schema or frontend library. Frontend-only implementation is authorized; the synthetic preview opens without authentication. Backend implementation remains outside this scope.

## 1. Core boundaries

Composition trees, reference graphs, revision graphs, provenance graphs and closed document snapshots remain the canonical constructs. Expansion dependencies are a constrained projection, not a new semantic graph. Concepts, propositions, arguments and assertions are content entities with ordinary identities/revisions and typed references. The provenance clipboard is private application state, not a sixth canonical graph.

Keep content identity, immutable revision, placement occurrence, anchor, transformation event, branch, snapshot and principal distinct. Same-identity revision parents never encode cross-identity fork ancestry. Interpretive predicates never invoke structural operations, validate logical truth or grant access. No new runtime functionality or formal proof follows from these requirements.

## 2. Desktop workspace

Keep four columns: **left navigator → editor → narrow minimap → right sidebar**. The left navigator offers Workspace, Document, Graph and History lenses. The branch/snapshot heading tree remains readily accessible; overlays add authorized concept/comment/source/contributor/change indicators without replacing its structure. Display query scope: selection, section, snapshot, branch, document or workspace; federation scope remains unavailable.

Workspace shows nested collections, documents and ordered composite works. Expand a chapter into headings, with breadcrumbs and previous/next chapter navigation following the selected composition order. Document shows the current outline; Graph shows bounded references/backlinks/concepts/provenance; History distinguishes revision, composition, derivation and snapshot views. Missing/denied results must not expose hidden target existence or counts.

The right column contains two independently scrollable, collapsible, vertically resizable panels:

- **Interaction (upper): Agent, Comments, Users.** Users retains the permission-scoped document-contributors contract, with current human and current agent pinned, then other contributors. It is not presence or membership.
- **Investigation (lower): Concepts, Relationships, Sources, Provenance, History**, with future lenses capability-gated. Pin context freezes the exact inspected identity/revision/occurrence/view; caret movement cannot replace it. Unpin explicitly returns to editor-following context.

Share workspace/document, branch or snapshot, projection/generation, selection/source mapping, trusted actor and permission context across panels. A pinned panel can become stale or inaccessible; pinning grants no continuing access. Investigation navigation preserves recoverable drafts and rechecks authorization. Distinguish a historical snapshot view from current state and retrospective overlays.

Remember validated panel proportions, collapsed states and tab/lens preferences with other non-sensitive display preferences. Persisted pinned identities or query contents require the protected user-state mechanism, not the display cookie. Current human attribution is red, current agent blue; other contributors receive distinct session-stable colors outside those reserved ranges, plus text/role indicators and accessible contrast. Unknown or undisclosed attribution stays explicit.

Retain styled Markdown source, toolbar/Functions controls, source/rendered maths, wrap choices 60/80/100/120, author visibility, font size and proportional minimap viewport. Single click places caret; double selects word, triple sentence, quadruple paragraph, five clicks section. Numbered list items are paragraph units. Define Unicode, punctuation, nested lists, code/table/formula boundaries and keyboard equivalents in executable selection fixtures before implementation; multi-click is a convenience, not the only accessible route. Optional snapping must not silently enlarge a normal partial selection. Selection/promotion must not reflow text or introduce visible separators. Mobile remains future work.

## 3. Documents, collections and composite works

A workspace supplies an authorized identity/query context. A collection organizes membership without embedding or cloning text. A document is an independent identifiable composition with its own history. A composite work is an ordered, versioned assembly of document/fragment placements. One document can belong to several collections and appear in several compositions with distinct placement contexts.

Create/rename/open, reorder/move/remove placement, fork, archive and history are distinct actions. Removing a collection membership or placement never deletes source/history. A drag between documents offers **Move / Fork / Transclude** explicitly; do not guess. Moving a placement preserves its identity where the operation permits it; repeated reuse allocates another placement. Cross-owner changes recheck all heads and policies atomically.

Composite manifests bind ordered child identities and pin/follow rules. Reordering chapters changes composition history, not chapter content identities. Adopt the existing manifest/occurrence semantics; decide concrete entity kinds/serialization in a domain ADR before persistence. A new database or separate service per graph is not required.

Compilation targets Markdown and HTML, with a machine-readable source/revision manifest; PDF is later. Outputs bind an exact authorized closure, citation resources and compiler profile. Multi-owner source exports and flattened assembly are distinct formats/options. Export failure cannot silently omit inaccessible material or use newer revisions. Temporary local-buffer downloads retain their existing uncommitted label.

## 4. Selection anchors and promotion

An anchor identifies an exact owner revision and range, including occurrence path/context for repeated or nested content. Canonical coordinate/encoding rules must agree with the frontend UTF-16/source mapping contract. Quote/context selectors assist recovery; text matching alone never proves identity or silently reassigns an ambiguous anchor. Revision-aware mappings report resolved, stale, ambiguous, inaccessible or missing outcomes.

Promote a fragment only when an operation needs persistent identity. Preserve bytes, formatting and reading order; do not allocate a node for every word. Overlapping ranges remain anchored references or ordered selection components, never overlapping children in a composition tree. Multi-node selections preserve ordered parts, individual owners/revisions and boundaries. Historical snapshots remain immutable.

**Copying is not implicit permission to commit an unsaved buffer.** An existing committed source range can be captured read-only. If copying requires source promotion or the selection includes uncommitted text, the UI must disclose the publication needed and obtain explicit confirmation before the promotion command. An unconfirmed selection remains a temporary tab item, not a durable canonical clipboard reference. This is the exception to ordinary read-only copy/navigation: promotion is an explicit authorized history operation; simply opening a menu or preview publishes nothing.

Before enabling durable promotion, specify its exact affected heads, whether it creates only a derived fragment or also restructures current source composition, attribution, undo and atomic receipt in an ADR. No source restructuring or unrelated draft commit may be hidden in Copy. Copy never creates destination forks in advance.

## 5. Provenance clipboard

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

## 6. Pinned and live transclusion

Pinned transclusion binds an immutable source revision **and required nested closure**, not only a top-level ID. Live transclusion follows a designated source identity/branch/track in a current resolved view. Display origin, pin/follow rule, resolved revision and synchronization/availability state. Historical snapshots freeze every resolved revision and nested occurrence context; they never follow later heads.

At the destination, transcluded text is read-only by default. Offer **Go to source / Edit source** only when authorized, or **Fork into independent content**. Never silently redirect destination typing to shared source. Selection and source mapping preserve this distinction even when text is rendered inline.

A safe live update is a validated resolution at an explicit consistent view. Recheck expansion cycles and bounds across the complete affected dependency projection before accepting changes. The original acyclic insertion does not prove all future source-head combinations acyclic. On conflict, revoked access, missing target or unavailable source, show explicit unresolved/blocked state; never silently substitute a cached revision as current. Any last-known display is marked stale and only shown while still authorized. Historical reconstruction requires its exact closure or reports unavailable.

Branch deletion/rename, offline fallback, concurrent head changes and cross-workspace policy need a resolver ADR and tests before live transclusion is enabled. The initial validated implementation may support pinned inclusion first; the Live control stays disabled until these gates pass.

## 7. Concepts and semantic assertions

Distinguish concept, proposition, argument, historical formulation and passage occurrence. Concepts can carry multilingual labels/aliases, definitions and competing interpretations. Same words need not imply same concept; lexical matching produces candidates, not authoritative occurrences. Occurrences use revision-specific anchors and roles such as mentions, uses, defines, qualifies or criticises.

Semantic predicates have stable namespaced identity/version, description, permitted participant types/roles and direction; inverse labels and symmetry/transitivity require explicit definitions. Families may cover ontological, process/dialectical, argument/logical, epistemological, ethical/political, conceptual, genealogical and methodological relations. For example, `semantic:develops_from` is an interpretation; an actual `core:forked_from` derivation is recorded only by the corresponding command. Do not infer logical entailment, symmetry or transitivity from English labels, or equate dialectical tension with logical contradiction.

Represent an n-ary assertion as an ordinary identifiable revisioned content entity with role-labelled reference edges; no new graph primitive is required. Record participants, qualifiers, evidence anchors, proposer and review state. Assertions may themselves be referenced or challenged, and competing assertions can coexist.

Agent proposals retain proposed/accepted/rejected/superseded states, exact branch/revision context and evidence. Only authorized review records acceptance; acceptance is an attributable contextual act, not universal truth. Retain rejected suggestion identities in the permitted scope to avoid blindly repeating them. Proposal records, accepted semantic state and reconstructible lexical indexes remain distinct. Creating/updating semantic records uses the shared authorized command path.

Snapshots bind the exact in-scope semantic/reference state or an explicit empty/excluded scope. Later annotations are separate, labelled retrospective overlays with their own view token, never inserted into old snapshots. Decide inclusion defaults and disclosure/closure rules before production snapshot formats are frozen.

## 8. Backend dependencies and staged acceptance

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
