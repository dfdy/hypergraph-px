# Initial Merge output and review workflow

## Common metadata

- **ID:** `HPX-ADR-015`
- **Title:** Initial Merge output and review workflow
- **Purpose:** Choose the first product meaning of Merge before implementing its publication semantics.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; implementation agent
- **Applies to:** first one-owner trusted-server Merge increment; existing snapshots/history and original authorship remain protected
- **Upstream authority:** [five-action requirement](../../06-subsystems/document-engine.md#owner-directed-action-set-fork-link-embed-merge-and-copy), [revision versus derivation](../../05-domain/provenance-model.md), [retained history](0011-retained-history.md)
- **Downstream dependencies:** future Merge planner, immutable transformation record, review UI and compatibility evidence
- **Verification:** explicit owner scope choice and required checks below; no implementation claim from this proposal
- **Decision/history:** the owner required Merge alongside Fork/Link/Embed/Copy. Existing specifications deliberately leave exact output-identity/conflict mechanics open. On 2026-10-26 the owner explicitly selected “Reviewed new-document synthesis.” This adopts the first scope below.
- **Last reviewed:** 2026-10-26

## Adopted first scope: reviewed synthesis into a new document

Select multiple exact committed source ranges, review their pinned text together, and compose/edit a proposed result before explicit publication into a **new document and logical content identity**. Preserve each original source and its history. Atomically record the ordered exact inputs, reviewed output's first revision/snapshot, operation and editor/publisher attribution. Unknown acknowledgement retries reconcile one operation/output. Cancelling, changing source context or review failure publishes nothing and leaves input buffers intact.

This is a cross-identity transformation, so source revisions are derivation inputs rather than same-node revision parents. The new output starts its own history. The user can deliberately combine or rewrite the inputs; the application does not resolve intellectual disagreements or connect an AI provider automatically. Source selection demonstrates what the operation used, not that every output sentence is an exact copy or that all sources support it. Preserve exact source-copy mappings only where validated; edited/uncertain contributions stay explicitly unknown rather than being assigned invented original authorship. The initial runtime still cannot claim complete fine-grained authorship reconstruction.

## Simpler alternative: exact combination first

Create a new document by concatenating the ordered committed source ranges with an explicitly reviewed separator. Source bytes remain unchanged; new separator bytes are explicit. This supports complete exact range mapping and a smaller first planner, but does not provide an editable synthesis result within Merge itself. Later edits follow ordinary output history. Label this scope clearly rather than promising conflict resolution or a semantic synthesis engine.

## Different priority: same-identity branch merge

Begin with integrating divergent revisions of one logical content identity. This requires choosing conflict presentation, multiple exact same-node parents, and explicit representation/compatibility for the current single-parent text revision shape. It is a different mechanism from combining distinct identities, and must not put cross-identity source revisions into a same-node parent list. It remains valid future scope whichever first workflow is selected.

## Shared safeguards and required verification

Every alternative retains prior immutable states, current permission checks, exact Unicode/mixed line endings, source identity versus occurrence context, reviewed publication and frozen receipt recovery. No automatic source commit/promotion, source deletion, history rewrite, confidentiality weakening or provider/publication permission follows. Verify cancellation/staleness, exact input/output retention, separate identity or same-node parent semantics as applicable, repeated operations versus retries, all-or-nothing failures/restart, old-reader preservation or explicit rejection, and honest contribution/uncertainty labels. Output/parameter records need explicit versions; production real-data acceptance remains separate.

## Current state

Owner-approved on 2026-10-26. Implement the reviewed synthesis scope above; the other alternatives remain future work. Acceptance of this policy is distinct from implementation or production format acceptance.

## Later owner clarification: parent-branch Merge

On 2026-10-26 the owner clarified that the original intention for the interface Merge function was to allow **the current text to be merged into a parent branch**. The owner explicitly requested documentation at the appropriate point in the development plan, with **no immediate implementation requirement**. This establishes the planned branch-parent workflow; it does not rewrite the earlier approval or executable evidence for the first reviewed new-document synthesis increment.

Place the clarified workflow in [roadmap stage 5](../../02-governance/roadmap.md#planned-branch-parent-merge-workflow--owner-clarification-2026-10-26), after durable branch creation/selection and branch-specific draft recovery. The source is the current document branch and the intended destination is its identified parent branch. Preserve document/content identity, retained divergent revisions and explicit same-identity merge ancestry; branch parentage must not be confused with a previous revision or a cross-identity Fork derivation. The existing synthesis action creates an independent document and is a different operation.

Parent selection/validation, merge-base rules, handling of uncommitted current text, conflict presentation and versioned multiple-parent publication remain future mechanism decisions before enabling writes. The interface must make the parent destination and reviewed result clear. This clarification neither silently changes the current command nor schedules it ahead of the required branching foundation.

## Proposed per-node temporal parent-Merge design, 2026-10-27

**Staged direction adopted by HPX-OWNER-013/014 on 2026-10-27; exact mapping/format implementation and real-data acceptance remain separate.** The owner's latest continuation authorizes developing the previously listed five-step sequence. HPX-OWNER-009/010/011/012 remain accepted; continuation does not silently select new persistent encodings, upgrade existing data or authorize parent writes. This section owns the proposed mechanism; the current independent-document synthesis and read-only parent comparison retain their delivered scope.

### Product scope and the meaning of later

One child branch integrates into its immutable fixed parent branch of the **same content node**. No whole multi-node document closure, annotation/relationship merge, independent Fork or federation is inferred. Writing remains uninterrupted: autosave during editing, automatic Commit when leaving the node/branch, no routine prompts. Clicking Merge requests integration; no merge or confirmation prompt is caused by ordinary typing, focus or navigation.

Propose that **later means the workspace-local acceptance order of a content-changing Commit for the actual competing passage**, within the supported one-owner, one-active-editor workflow. Use an authenticated monotone per-node integer allocated atomically with publication, not wall-clock time, filesystem mtime, a random ID, the node's most recent unrelated edit or its test build number. A node-wide order distinguishes publications across its branches. Two branches' existing independent draft sequences cannot do that. Passages not changed by a Commit retain their earlier origin/order. A deliberate later reversion is a new change even if its bytes equal an older base. Byte-identical no-op departure creates no publication/order.

This is an explicit proposed interpretation, not a claim to observe every keystroke. Several uncommitted changes to one passage in a single visit can collapse into its captured final text; intermediate typing is not permanent history. If multiple tabs/writers defer older edits and publish out of editing order, acceptance order is not necessarily actual typing order. That stronger behavior requires separately designed edit-event/causal tracking; do not advertise it from this first local policy. Imported/legacy evidence without an established order remains unknown. Native keychain/transport state and the build counter are not passage clocks.

### Retained passage evidence and source bytes

Associate immutable revision-specific origin maps with exact closed text snapshots. Changed insertions/replacements and deletion tombstones need stable base-relative ownership/bindings and the actual content-change publication that introduced them. Unchanged spans inherit their old evidence; automated Merge copies selected origin evidence instead of making imported old text look freshly authored. Keep exact input/output snapshots and losing alternatives in immutable history. Origin/order means recorded editing/publication evidence, not original authorship or proof of a statement.

Planning works on validated UTF8 source boundaries, preserving CRLF/CR, combining characters and repeated content without normalization. A deletion is distinct from empty text; same-position insertions and delete/modify are competing changes. Non-overlapping changes can combine independently. Equal resulting bytes need no content choice, but retain both input bindings; absent chronology must not become known through deduplication. Only overlapping changes whose exact mapping and comparable origins are established may use the later-change rule. Do not discard independent edits elsewhere in a paragraph because one large paragraph hunk is newer. Ambiguous repeated-text alignment, moves, splits or complex overlapping groups remain unresolved at Merge, without inventing passage identity. An exact diff/range-mapping algorithm and bounded-work contract remain required subsequent work, not supplied by the abstract model below.

### Base, ancestry and repeated integration

Pin the child head, fixed parent head, source/target snapshots and verified ancestry together under current authorization. Initially select a unique maximal common ancestor in the **same-node revision DAG**. Branch creation's retained source is ancestry evidence, not an automatically perpetual Merge base. Missing/incomplete/budget-limited ancestry and multiple incomparable maximal bases must produce a bounded unresolved outcome, not a guessed base or partial publication. No arbitrary revision pruning or all-history scan is adopted; bound work and expose incomplete discovery honestly.

A nontrivial Merge creates one new target revision with two exact same-node parents in fixed roles: previous target head first, incorporated child head second. The child head/draft and fixed branch parentage are unchanged. The result's origin map retains selected input origins; Merge's own publication order does not refresh them. If the child is already incorporated and there is no new integration, return a read-only already-integrated result rather than create endless revisions. Equal content with genuinely new ancestry can still require one integration revision so later Merge has an honest common base. No branch deletion or reparenting.

Example: child changes Monday to Tuesday at order1; parent changes Monday to Wednesday at order2. Merge chooses Wednesday and records both parents. Repeating Merge without new work leaves Wednesday alone: Tuesday is now incorporated ancestry, not a fresh edit. A later child change to Thursday at order4 can win the next true competition. An unrelated later parent edit must not make Wednesday newer than Thursday. Manual resolution of a genuinely unresolved region is a new recorded decision; preserve the alternatives and distinguish that decision from automatic import.

### Drafts, review and atomic target publication

For the first durable increment, use exact committed inputs. On an explicit Merge request, quiesce and Commit changed active child text through the same owner-adopted publication path; this does not create a new writing-time decision prompt. Capture acknowledged/newer browser sequences so later typing cannot be accidentally included. A failed or unknown source Commit prevents integration until its original operation is reconciled. Existing exact working-source checkpoints remain inspectable.

Do not silently Commit, replace, stash or rebase a pending **target** draft. The supported sequential navigation normally commits the target when leaving it. A recovered pending target draft or concurrent target change still needs an explicit exception outcome with preserved text; no target write can go ahead merely because the source is ready. Future support for incorporating that draft needs its own exact input/ancestry policy. Review is confined to actual unresolved Merge regions, not routine node transitions. The single user Merge action may publish an entirely determined result only after this policy is adopted; never silently choose unknown chronology or transform a read-only comparison into a write.

Freeze one operation, document/node, branch pair, exact heads/snapshots/base, supported planner version and reviewed unresolved decisions. Recheck current source/result authority and both expected heads plus clean acknowledged target draft in one immediate SQLite transaction. Publish target revision/snapshot/event/head/draft, origin evidence, exact integration record and original receipt atomically; source head/history and old snapshots remain unchanged. Reject stale preconditions without partial output. Unknown acknowledgement retries use the identical operation and original receipt; do not recompute against newer text or publish twice. Working-reference promotion and separately acknowledged replacement remain distinct, with original captures preserved.

### Proposed compatibility and storage boundary

Existing strict `Revision` and publication `Event` payloads have one optional parent; the wrapper validates explicit record versions and old readers can write schema1/2 without maintaining a passage clock. Optional metadata alone cannot safely supply the proposed guarantees. Recommend an **explicit backed-up minimum-reader upgrade**, with a new approved SQL schema level and versioned revision/event variants for multi-parent ancestry plus versioned clock/origin/integration records. Existing v1 records stay immutable/readable; legacy passage order starts unknown, not fabricated by sorting IDs or discovery order. Preserve both passphrase recovery and existing optional keychain policy. New/recovered upgraded workspaces need no external registration/witness: all required persistent state and upgrade evidence remain inside the portable workspace.

This is a different upgrade purpose from the withdrawn external-witness enrollment. No schema number, record-kind allocation or exact codec is reserved by this proposal; those must be specified and reviewed before persistent writes. New binaries must reject unsupported versions honestly; older executables must reject an upgraded workspace before writes. Upgrade needs a verified consistent backup, explicit baseline/consent, interrupted-upgrade/crash recovery and actual old-reader rejection evidence before real-data use. The manual workspace is never upgraded as a test side effect. Existing unenrolled schema1/2 and kind20–27 preservation evidence retain their original scope.

### Delivery sequence and required checks

1. Adopt or revise the temporal interpretation, low-prompt Merge publication policy and backed-up compatibility direction above.
2. Specify exact base-relative span/tombstone mapping, retained ancestry/origin/integration codecs, bounds and interrupted upgrade; implement dependency-free planning separately from adapter serialization/authorization.
3. Implement target transaction and frozen receipts only after format/upgrade review. Exercise every partial-write/crash boundary and denial before advertising capability.
4. Add per-node Merge inspection/resolution; retain the existing independent Synthesis as a differently labelled operation. No new provider or automatic writing-time prompts.
5. Run exact-byte/temporal/repeated-Merge, unchanged-region, reversion, deletion/insertion, unknown/legacy mapping, stale target/draft, lost/delayed replies, restart, old-reader rejection and six supported desktop/theme source-under-widget checks. Guarded exact-binary handoff follows successful actual synthetic integration; publication and real-data acceptance remain separate.

The standalone proposed-rule model in `scripts/check_parent_merge_proposal.py` assumes already aligned regions and trusted comparable orders. It can check the example decisions and retained-input discipline, not derive actual passage identity, authenticate clocks, prove a diff, execute SQLite/upgrade or establish whole-application/Lean correspondence.

**Owner decisions received:** HPX-OWNER-013 accepts committed passage-change order within the one-active-editor scope; HPX-OWNER-014 adopts one-click determined Merge and the staged backed-up compatibility direction. Proceed with exact planner/format/upgrade design and bounded implementation. No existing workspace upgrade is authorized; exact versioned durable layout and upgrade verification still precede persistent integration.

Proposal evidence: Python3.14.8 executes55 checks in `scripts/check_parent_merge_proposal.py`; SHA256 `ec807724699134700b32a218ab9359f5a78e8b4b5d0ff67f7f1b54ce0655e38d`. Checks cover opposite passage order, untouched spans, known/unknown origins, deliberate reversion, deletion versus empty text, exact mixed-newline/Unicode bytes, no partial unknown result, two-parent common ancestry, repeated integration and bounded/missing/cyclic/cross-node/ambiguous-base failures. Supplied symbolic region/origin identities and trusted order labels are assumptions. The model does not establish the real byte alignment/diff, clock allocation, durable codecs/upgrade, authorization/receipts or application behavior. HPX-TEST-050 separates this proposal evidence from delivered application tests.

## Adopted direction: first bounded planner increment

HPX-OWNER-013/014 accept passage-specific committed-change order and staged one-click determined parent Merge. The [level7 planning contract](../../07-implementation/algorithms/parent-merge.md) defines the first dependency-free supplied-map selector and explicitly separates missing lineage/diff, ancestry, exact codecs/upgrade and transaction/UI delivery. Keep this boundary visible: pure selection tests do not enable parent writes or authorize an existing-workspace upgrade.

## Successive lineage, codec and ancestry components

Within HPX-OWNER-013/014, HPX-ALGO-002 now also specifies an in-memory compact working trace from supplied exact UTF8 splices, an inactive versioned draft-lineage codec prototype and bounded common-base selection over supplied same-node metadata. These reduce the remaining mapping/format/ancestry work but do not activate Save/Commit lineage, clock allocation, encrypted slots, an upgraded workspace or parent publication. Genuine reversion across committed revisions must not be cancelled using immediate-base draft normalization. Undo/Redo must retain the matching trace; no generic inverse diff is provenance proof.

## Retained origins and isolated encrypted Save foundation

HPX-ALGO-002 now distinguishes unknown mapping from unknown order and retains exact immediate-parent copy coordinates, changed extents and deletion evidence. Supplied publication order cannot make uncertain coarse mappings safe for automatic temporal conflict selection. A later unrelated publication keeps the older competing passage's age. HPX-TEST-055 records pure component evidence; no durable clock or arbitrary cross-history mapper follows.

The storage contract now allocates experimental marker3 and kinds31–33 for guarded disposable-fixture draft-lineage Save tests (HPX-TEST-056). This supersedes the earlier unallocated/inactive status for that narrow family only. Exact draft text, trace and frozen receipt write atomically under current catalog/document/branch authority. Normal schemas1/2 and their opening/writing remain supported; marker3 has no public opener/upgrade/runtime route. This is not activation of temporal Commit or parent publication, nor approval to upgrade an existing workspace. Backed-up upgrade and actual old-reader rejection remain gates.
