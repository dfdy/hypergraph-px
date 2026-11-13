# Domain/navigation contract

## Common metadata

- **ID:** `HPX-API-001`
- **Title:** Domain/navigation contract
- **Purpose:** Pure domain and planned navigation APIs, with exact implemented versus proposed boundaries.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-DOM-001](<../../05-domain/core-object-model.md>); [HPX-DOM-002](<../../05-domain/hypergraph-mathematics.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-11-01

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../../../architecture/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

Browser and MCP callers share the user command/query API and actor-specific permission checks before protected results or publication. Navigation selection, exact snapshots and deterministic domain plans are inputs, not authority. Preserve existing IDs, bytes, coordinate ownership and draft/Commit boundaries; this clarification does not change existing wire contracts. See the [accepted shared API scope](browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


## Creation context — HPX-RQ-039

Creation operations through either adapter must establish the [canonical creation-origin precondition](../../../architecture/Conceptual/identity-closure.c4) under the [precise context contract](../../05-domain/core-object-model.md#creation-origin-and-placement--hpx-owner-048). Human UI/caret context or explicit machine-equivalent context identifies the intended parent/position before creation; backend validation and current workspace-user permissions remain mandatory. Missing, stale or ambiguous context cannot silently choose a location. A selected node alone does not necessarily determine the new node's position. No new wire fields, endpoint, placement/identity encoding or permission mechanism is specified here; existing query sketches and implementations keep their scope.

## Messages and type schemas


### Data structures and navigation: MU-F technical reference

Source `HPX-SRC-0026`, original lines 1–6. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: current data and navigation contract, 2026-10-24. The navigation/type table below remains proposed. The first implemented validator is documented in §9. Proposed names/contracts below will be replaced or linked to actual symbols as implementation proceeds. Domain wire fields and container choices await accepted decisions; the separate crypto envelope adapter is now documented in §10.

Related requirements: [mathematical model](<../../05-domain/hypergraph-mathematics.md>), [encryption](<../security-cryptography.md>), [architecture](<../../04-architecture/system-architecture.md>) and the [product specification](<../../03-requirements/system-requirements.md>). This reference defines data/navigation mechanisms and marks proposed interfaces explicitly.

### 3. Proposed navigation contracts

Source `HPX-SRC-0026`, original lines 42–63. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

All names below are interface sketches. Every query needs an explicit consistent read view or exact snapshot, authorized principal/scope, and resource budget. Historical lookup does not grant current access. Return incomplete/denied/budget errors honestly; do not silently substitute a current revision.

| Proposed operation | Inputs and result | Algorithm / expected baseline cost |
|---|---|---|
| `get_node` / `get_revision` | Authorized identity → verified record | Indexed lookup plus object verification/decoding bytes |
| `children` / `parent_occurrence` | Manifest/context occurrence → ordered placements / exact parent | Adjacency/parent index; cost proportional to returned children after lookup |
| `walk_document` | Resolved root → ordered occurrence/source spans | Iterative traversal, active-path tracking, O(expanded occurrences + emitted bytes) |
| `find_occurrences` | Node and view scope → every permitted placement | Reverse occurrence index and bounded pagination; do not scan/render every document |
| `outgoing_links` / `backlinks` | Identity/revision, edge type, scope → edges | Forward/reverse adjacency indexes; O(lookup + page) |
| `ancestors` / `descendants` | Exact revision or occurrence graph → bounded reachability | O(V + E) over visited projection without an additional index |
| `is_ancestor` / `common_bases` | Exact retained states → ancestry result/candidate bases | DAG traversal with budget; multiple bases remain explicit, not timestamp-selected |
| `derivation_inputs` / `derived_outputs` | Immutable revision/event → ordered origins/results | Forward/reverse event index; preserve original revision rather than following result heads |
| `resolve_snapshot` | Manifest + consistent selected view → complete bindings | Resolve reachable contexts/rules; validate ownership/permission/completeness before publication |
| `reconstruct_snapshot` | Exact snapshot/profile → bytes + ordered source map | No live-head/provider/query lookup; bounded repeated rendering |
| `impact_of_change` | Source revision/rule and scope → affected live dependants | Reverse reachability; pinned historical uses do not advance automatically |
| `history_page` | Node/manifest/snapshot scope + cursor → immutable event page | Indexed causal/local publication order; stable cursor, no retained-history count cap |
| `validate_move` | Exact structure/base, occurrence, destination → valid plan/conflict | Reachability from destination before edge insertion; preserve one parent and order |

Here V/E refer to the traversed authorized projection, not automatically the entire workspace. Physical storage/index choice is unresolved, so logarithmic index access is a design target rather than a benchmarked guarantee. No algorithm avoids output-size cost for a complete rendering. An index must specify its exact scope—current state, retained history metadata, or optional historical full text.

### 11. Planned workspace/reuse queries

Source `HPX-SRC-0026`, original lines 144–146. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The [workspace interface contract](<../document-engine.md>) adds unimplemented requirements, not Rust symbols: list collection memberships versus composition children; resolve revision-bound selection anchors; trace cross-document derivation; inspect contextual assertions; resolve a designated live track; and manage protected per-principal/workspace clipboard entries. All queries bind exact view/context, permissions and budgets. Anchor transforms report ambiguity rather than silently quote-matching another occurrence. Reverse occurrence/backlink/lineage indexes are reconstructible; private clipboard order and acknowledged entries are protected application state, not a graph index. Query/renderer results never grant mutation or historical-key authority. Actual APIs in §§9–10 are unchanged.


## Source provenance

- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 1–6; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 42–63; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 144–146; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.

## Current domain/adapter boundary, 2026-10-25

`crates/domain` now has no dependencies or serialization derives. Identifiers, anchors, snapshot bindings and UTF-16/UTF-8 validators remain pure domain types. Storage/runtime DTO fields explicitly use codecs in `crates/storage/src/encoding.rs`; decoding checks exact 32-byte array shape/range, and snapshot-binding DTOs check their field set. Scalar-coordinate tests and the unchanged extracted spend-helper proof were replayed; no general graph navigation implementation or whole-validator proof follows. See [implementation evidence](../../09-guides/reference/implementation-resumption.md).

## Initial immutable history and anchor queries, 2026-10-25

The one-owner storage adapter now implements `Workspace::history_page` in [history.rs](../../../crates/storage/src/history.rs) and `Workspace::resolve_anchor` in [anchors.rs](../../../crates/storage/src/anchors.rs). Each query uses one consistent SQLite read transaction and checks the current authenticated catalog principal/device and document membership before returning protected data. This is the current sole-owner model, not selective multi-user historical disclosure or a capability grant.

History follows exact immutable revision parents through existing primary-key lookups and verifies each event, snapshot and occurrence/revision binding. A page accepts 1–32 entries and has a 16 MiB encrypted-object read budget after the bounded catalog/head slots. A byte-limited partial page returns the next unconsumed revision; an entry that cannot fit an empty page fails explicitly. Pages have no revision-count retention cap, do not scan all retained history, and do not sort by fabricated timestamps. Cursors are inclusive immutable revision IDs, validated against the requested document on each read; newly appended commits cannot shift an older page. No new index, stored record kind, database/envelope version, revision or snapshot is created by browsing.

The result is local publication metadata (`revision`, `parent`, `snapshot`, `operation`, recorded publisher `actor`/`device`, UTF-8 `text_bytes`) and `next`. Recorded publication does not prove original text authorship. The browser validates scope, identities, chain continuity and cursor shape; delayed responses cannot replace another document's history. It shows one bounded page and exact read-only historical snapshots, with byte-preserving download. Current drafts are unchanged. The initial linear single-node ancestry remains narrower than the future revision DAG and cross-identity derivation contracts.

Anchor resolution requires an exact document, snapshot, revision, full occurrence path and half-open UTF-8 byte range. Snapshot bindings must match the supplied revision/path; split scalars, reversed/out-of-range offsets, wrong scope and missing historical objects fail. Empty ranges resolve as points. No current head, text-match guess, Unicode/newline normalization, promotion, durable clipboard entry or mutation is substituted. Tests use repeated text, emoji, combining marks and mixed line endings across edits/restart; see [the test register](../../registers/tests.csv).

## Bounded publication-contributor adapter query

`Workspace::publication_contributors` derives publisher evidence from the same validated immutable ancestry used by `history_page`. It is an adapter query in [contributors.rs](../../../crates/storage/src/contributors.rs), not a new pure-domain identity or authoritative index. The requested snapshot binds the first event; encrypted continuation tokens bind every later page to that document/snapshot lineage while current permission is rechecked. The [runtime contract](browser-runtime.md#snapshot-bound-publication-contributors) specifies its incomplete family coverage, resource bounds, current-context pins and nonpersistent cursor representation. No new durable record or source write is performed.

## Initial immutable comment paging

`Workspace::comments_page` in `crates/storage/src/comments.rs` uses one authorized SQLite read transaction and an exact text-snapshot context. It follows an inclusive immutable revision cursor through the separate document comment paging chain, checks original command receipts/digests and exact participant sources, and reports retrospective comment scope explicitly. New comments do not shift older pages; no automatic retention cap/pruning or same-node ancestry is inferred from this chain. The pure domain comment planner remains independent of DTOs/codecs/storage. Exact bounds are specified in the runtime and record references; actual executable evidence is tracked separately.

## Working-source boundary

[ADR019](../../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) is adopted and has gated local content/working-branch context and typed immutable checkpoint source DTOs. Capture the exact owned source/sequence before asynchronous work; never resolve an old reference through a moving branch head. Current document-only routes retain their original designated branch. Separate versioned working-source records preserve the existing committed Source shape; do not append working variants silently to strict legacy payloads. Promotion can add exact replacement evidence through a separate post-Commit batch; changed source remains pinned for review. The following wiring checkpoint and [current evidence](../../09-guides/reference/DEVELOPMENT_STATE.md#current-scope-and-evidence-summary) state the unfinished runtime/reader acceptance.

## Gated branch/working navigation wiring, 2026-10-26

RuntimeAdapter now retains buffer identity independently of selected document projection: queued mutations resolve a frozen document/content-branch context, child writes carry the branch explicitly, and lock drains all retained buffers. The app caches CodeMirror state/selection/undo/scroll under that context and shows committed-source review before creating a child. Branch history uses encrypted document/branch/snapshot-bound cursors; back/forward paging retains the original view snapshot after newer commits. Current doc-only routes keep original-branch meaning. Adaptive source capture saves exact pending source before an atomic private working checkpoint/reference; committed bytes retain the existing committed-reference route. Text Commit and private replacement batches are independent acknowledgements. Capability advertisement and actual runtime acceptance remain held; component/mocked checks are not an integrated navigation delivery claim.

## Verified branch/working navigation, 2026-10-27

The preceding capability hold is superseded by HPX-TEST-040: actual branch creation/switch/selection/undo/redo, frozen lost/delayed acknowledgement handling, exact working-source Fork/inspection, independent draft/replacement recovery, old-reader20–27 preservation and pinned history checks pass. The bounded `local_branches`/`working_copy` capabilities are advertised; wider graph/composition/branch-Merge queries remain separately scoped. Exact record/runtime definitions stay in their existing contracts. Subsequent legacy catalog-scope hardening is tracked separately in the current state and does not define a new authorization policy.

## Adapter-only immediate-record audit and current scope

`Workspace::audit_document(document,max_bytes)` in [audit.rs](../../../crates/storage/src/audit.rs) implements the [bounded original-branch slice](../../08-assurance/recovery.md#initial-bounded-read-only-audit-slice). It returns source-free immediate-record findings from one authorized SQLite view, with no runtime endpoint, repair, guessed head or wider closure claim. Its resource guard and explicit exclusions do not change pure-domain navigation or durable formats. [authority.rs](../../../crates/storage/src/authority.rs) rechecks current catalog ownership/membership for legacy list/editor/snapshot/receipt reads and input/result scope before frozen receipt replay, preserving valid authorized historical retries without reevaluating their mutable generation preconditions.

## Bounded audit consumer, 2026-10-27

HPX-TEST-044 adds a protected runtime consumer and scoped dialog for the existing `audit_document` adapter. The caller captures a document identity and positive read budget; it does not pass the selected named branch or a mutable whole-workspace health claim. Report validation checks exact scope, document, counter bounds and role/problem consistency, discarding delayed results after lock or dialog close. The initial eight-record original-branch scope and recovery exclusions above remain unchanged; no domain serialization or new persisted format is introduced.

## Current committed child/parent comparison, 2026-10-27

`branch_comparison(document, branch)` is an authorized read query for one named child and its immutable fixed parent, including a named parent. Resolve catalog membership and authenticated child/parent creation records, then validate both current committed publications in one consistent SQLite transaction. Two one-entry history reads share the existing16MiB encrypted-read guard after bounded metadata. Return exact document/node/branch/parent, names and revision/snapshot IDs together, or an error with no partial comparison. No draft contents, scan of retained history, new index or write is needed. Original branches have no parent comparison.

The browser reads the two exact snapshots under current authorization and renders inert text; pending drafts are excluded. Later Commit cannot retarget the captured pair; explicit refresh obtains a new pair. This defines neither a Merge base nor conflict/target-publication semantics. [Protected transport and result shape](browser-runtime.md#read-only-parent-branch-comparison-context-2026-10-27), storage/browser cases and actual synthetic workflow are tracked by HPX-TEST-046.

## Logical editing departure publication, 2026-10-27

HPX-OWNER-010 changes application navigation policy, not domain identity or storage serialization. Leaving a content node or switching its branch first acknowledges publication of changed outgoing owned text through the existing immutable Commit operation. Same-context navigation and unchanged text need no revision. Failure/unknown outcome retains the old active context for exact retry. Ordinary keyboard focus changes are not navigation/publication. No multi-node closure merge or automatic relation/annotation publication is inferred.

## Parent-Merge supplied-map planning component, 2026-10-27

Under HPX-OWNER-013/014, [HPX-ALGO-002](../../07-implementation/algorithms/parent-merge.md) defines the first pure per-node selector. It accepts already established base-relative maps, checks exact UTF8 reconstruction/node scope/budgets and returns a complete plan or unresolved indices without partial text. It is not a new runtime query, common-base search, authenticated lineage proof or publication command. Existing read-only comparison still returns two committed snapshots; it cannot supply missing origin chronology or imply parent Merge availability.

## Supplied-metadata common-base component, 2026-10-27

HPX-ALGO-002's ancestry component now finds a unique maximal common base of two same-node heads from a caller-supplied bounded record batch, using iterative traversal and explicit missing/cycle/scope/parent/work/ambiguous errors. It returns incorporation flags without moving heads or reading source. A future storage caller must build the batch under current authorization, one pinned read view and encrypted-byte limits; no runtime query, cryptographic evidence or parent-Merge availability is implied by this pure component. HPX-TEST-054 records executed scope.

### Retained origins and experimental storage boundary

`parent_merge::origins::Map` retains exact immediate-parent passage evidence under supplied publication orders; confidence is independent of order, and unknown mapping prevents automatic competing-content selection. `Workspace::temporal_save` and `temporal_lineage` are guarded adapter foundations for marker3 disposable fixtures, not runtime commands/navigation capabilities. They bind current document/branch scope, acknowledged draft/base/generation/sequence and exact splices; original temporal receipts recheck current authority. Ordinary workspace opening remains1/2. HPX-TEST-055/056 separate these component guarantees from remaining clock/Commit/upgrade/parent-publication/UI integration.

## Authenticated bounded common-base inspection

`Workspace::parent_merge_base(document,branch,branches::merge_base::Limits)` now captures a named child and its fixed parent's current committed heads and authenticates their reachable legacy single-parent revision/event/snapshot union in one authorized SQLite read view. Existing history entry validation is shared, not replaced with branch-creation ancestry guesses. Limit/missing/corrupt/cycle/scope failures return no partial selection. Exact results bind the existing comparison and the unique base's snapshot plus incorporation flags; no draft or source text is returned. The protected inspection consumer is specified in the browser/runtime contract. This enables read-only base inspection only; future multi-parent codec dispatch, temporal Commit, upgraded opening and parent writes remain separate.

## Experimental retained-origin loading

`Workspace::temporal_origins(document,branch)` is an adapter-only marker3/feature32 query, with no runtime endpoint. It authenticates a current committed branch head, required per-node clock35 and its exact last-change publication/binding, then follows at most64 existing single-parent publications to an explicit immutable seed36. Missing required origin evidence is an error, never an inferred legacy seed. It validates each record34 context against actual immutable revision/event/snapshot edges, then replays parent-first under charged-byte and divided logical-work limits. Seed chronology remains unknown. No writes or public format opening/upgrade/clock allocation follow. HPX-TEST-061/062 separate codec/planning and encrypted-reader evidence from future atomic temporal Commit.

## Source-neutral semantic word projection

`runtime-relation-projection.js` is a frontend read-view adapter over the existing authenticated assertion/snapshot APIs. It converts exact current closed-source UTF8 participant bounds against the complete owned text, then matches existing parsed adjacent units. It performs no domain mutation, quote-based anchor relocation, new graph query or authorization. The transient relationship-field effect is cleared on edits rather than mapped as a draft relationship; only exact matching source may receive a fresh scoped projection. The browser/runtime contract owns loaded-page scope, status/direction wording and stale/lock behavior. No Rust identity, record format or snapshot meaning changes.

## Autosaved composition, update discovery and branch capture — OWNER049/050

[M1](../../../architecture/Conceptual/identity-closure.c4) and the [composition supplement](../../05-domain/document-semantics.md#retained-autosaved-selections-and-branch-preservation--owner049050) require exact last-acknowledged-autosave reconstruction with full nested/repeated selections. Current draft/text/snapshot queries do not establish that general capability. Discovery of a newer authorised version is a separate source-neutral query result, not a replacement selection, conflict-resolution action or grant. Branch capture preserves exact constructed composition under the same logical document/content identity and normal known-origin/permission/expected-state/recovery rules. The future universal autosave/Commit relationship, version-retention events, branch capture publication and main designation/construction remain unselected; no new query name, wire format or cache authority is adopted.
