# Draft acknowledgement and atomic commit protocol

## Common metadata

- **ID:** `HPX-PROTO-001`
- **Title:** Draft acknowledgement and atomic commit protocol
- **Purpose:** Draft acknowledgement, immutable commit, stale-state rejection and retry reconciliation.
- **Level:** `07-implementation`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-SUB-006](<../../06-subsystems/workspace-storage.md>); [HPX-API-002](<../../06-subsystems/interfaces/browser-runtime.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-30

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../../../architecture/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

Both browser and MCP submit user operations through the same logical API. Apply workspace-user permissions before protected reads, executing changes and receipt replay, and preserve authority through publication rather than trusting a prior UI check. Draft acknowledgement, Commit and observed response remain distinct; lost acknowledgement does not permit changing identity/scope or bypassing current rights during reconciliation. The exact atomicity/revocation mechanism remains unresolved. See the [accepted shared API scope](../../06-subsystems/interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


No uncertain outcome authorizes a fresh operation. Preserve newer local typing and selection after older acknowledgements.


## Messages and type schemas

The first writer's full-buffer save is valid only under the verified one-owner whole-document projection contract. A general multi-owner overwrite is unsupported. Freeze operation ID, document/base/generation, prior acknowledgement, captured through-sequence and exact text; retries retain the same request. A later acknowledgement must never overwrite newer browser typing, selection or undo history. No autosave creates an immutable revision; commit publication is explicit. Live adapter acknowledgement/cancellation/queued-edit acceptance remains unfinished.

### 4. Planned mutation and recovery boundary

Source `HPX-SRC-0026`, original lines 64–91. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Keep pure planning/validation separate from I/O and grants:

```text
frozen request + trusted actor + exact base/policy
  -> authorize source/target operations
  -> validate/plan complete immutable result and closure
  -> recheck expected heads and policy
  -> durably publish one atomic commit
  -> update recoverable read models/projections
  -> return original action/commit receipt
```

Required behavior to specify and test before enabling writes:

- Revision parents belong to the same identity; new identity origins use transformation provenance.
- Move/reorder preserves placement identity. Remove detaches a use rather than deleting its source history.
- Split/merge plans preserve exact raw source bytes/ranges and ordered contribution mapping, unless the operation explicitly proposes text changes.
- Content-only edits do not duplicate every containing manifest history; historical closed snapshots remain exact.
- Draft autosave changes mutable working state only; explicit commit publishes history. Acknowledged drafts survive crash/rebuild.
- Atomic expected-head checks cover every affected owner/manifest/branch; stale plans conflict without partial publication.
- Exact retries reconcile original outcomes; changed request reuse conflicts. Uncertain acknowledgement is not permission to issue a fresh mutation.
- Full result closure is present before commit visibility. Missing committed data fails integrity checks; current heads are never a historical repair substitute.
- Reject capacity/work exhaustion without silently pruning retained history.

The storage ADR must define fsync/publication order, journal/database authority, writer isolation, crash states, index rebuild, import validation and corruption handling. These contracts are not proved merely by choosing SQLite or a content-addressed object directory.

### 5. Draft autosave state machine

Source `HPX-SRC-0028`, original lines 94–115. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Track independent values: current local sequence, last acknowledged sequence, server draft generation, in-flight operation and current projection/base. Sequences are monotone safe integers within an editing context; server generations/state tokens are opaque. Different tabs/contexts must not share counters or assume exclusive access. Server preconditions protect shared drafts even for one human.

After five seconds of input inactivity, submit ordered changes to the mutable draft. Ordinary typing, formatting and table cell/row/column text edits use this path. Prefer one in-flight save per editing context; queue newer local changes. Retrying a save with an uncertain result uses the original operation identity and identical payload, not an updated generation/payload under the same key.

| UI state | Meaning / required behavior |
|---|---|
| Temporary/demo | Fixture data only; no durability claim |
| Modified | Current local sequence exceeds the acknowledged sequence |
| Saving | An exact sequence is in flight; later typing remains intact |
| Draft saved | Current sequence has been acknowledged by the durable draft service; no immutable publication implied |
| Save outcome unknown | Connection/reply lost; preserve text and reconcile the original operation |
| Conflict/stale | Preconditions or ownership no longer match; keep local text, offer explicit recovery/compare when supported |
| Locked/denied/unavailable | Stop prohibited work and show the cause; never report saved or fall back to another security mode |

Example: sequence 10 is sent, then the user types sequence 12. An acknowledgement for 10 advances acknowledged state only to 10; it cannot replace the current buffer, clear the dirty marker, move the caret, reset undo or claim 12 saved. Verify response context before applying it. Sequence/mapping reconciliation uses editor transactions rather than wholesale document replacement.

Draft save creates no content revision, manifest commit, snapshot or branch transition. Label successful autosave **Draft saved**, not **Committed**. A durable acknowledgement must survive restart before the UI may promise recovery. The server must return original outcomes for authorized duplicate operations, including when the first save already advanced the generation. Transport success alone is insufficient without a valid matching acknowledgement.

Do not put real drafts in plaintext localStorage, IndexedDB, cookies, service-worker caches, diagnostics or telemetry as an improvised recovery system. Browser persistence of sensitive data needs its own approved encryption/lifecycle design. On lock/logout or lost authorization, stop requests and stale-result application; revoke relevant views and stop further plaintext access. Warn before a user-initiated lock with unsaved work; define the actual draft/session/key-lock relationship in the security contract. Browser/OS memory erasure cannot be guaranteed by clearing a panel.

### 6. Explicit commit and reviewed structural actions

Source `HPX-SRC-0028`, original lines 116–134. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Commit freezes an exact draft generation/local sequence and affected owner bases, then publishes one complete permitted result. Flush/acknowledge the intended draft before executing `commit_draft`; autosave is not this operation. Structural actions require a resolved selection/destination, known ownership and a current compatible base. Block them while mapping/save outcomes are unresolved. If the user types after an action is frozen, preserve the later changes and rebase only through a validated mapping; otherwise show a recoverable conflict. An initial implementation may temporarily pause input during publication rather than claim unsupported rebasing.

HPX-OWNER-027 qualifies the following reviewed-action workflow: an authorised selected-node MCP edit follows the ordinary human-equivalent edit/draft/Commit path unless applicable policy requires review. It is not forced through a proposal per edit. Actor/target/current authority/expected state and original receipt recovery remain mandatory. Exact MCP messages are not selected here.

For an action whose policy requires reviewed approval (human or AI): resolve intent → prepare frozen proposal → show exact targets/effects/disclosure → explicit human approval → execute atomically → reconcile receipt and projection. A preview may allocate encrypted workflow state but publishes no document history. Approval of a proposal is not publication, and execution rechecks heads, rights, policy and dependency closure. Ordinary human commits need an explicit commit action, not a proposal for each keystroke.

| User intent | Required distinction |
|---|---|
| Fork/extract | New logical content/revision and exact transformation provenance; retain source history; placement effects are explicit |
| Link | Stable target/reference and source anchors, separate from display text/slug; plain Markdown URL formatting must not pretend to create a typed graph relation |
| Copy versus shared inclusion | A Markdown copy is independent text; shared inclusion creates an occurrence with explicit pin/follow/closure and ownership semantics |
| Move/remove occurrence | Preserve occurrence identity on move; detach placement without erasing source history; reject illegal expansion cycles atomically |
| Table editing | Draft text transaction by default; table rendering is UI-only; no publication command per cell |
| Branch integration/restore | Review exact base/target/closure; append state, never rewrite retained history |

Rust performs the complete authorized content/composition/provenance/snapshot/branch publication. The browser cannot emulate it with separate create-text/place/provenance/update-head calls. Undo after publication cannot delete immutable history; an inverse structural operation needs an explicit valid command. Local text undo remains a draft edit with its own sequence.

Every mutation has an opaque `operation_id` scoped to the authenticated context and exact payload; per-attempt tracing is separate. Reconcile pending, committed, rejected or unknown outcomes using that original ID. A timeout, aborted fetch, event or HTTP `202` is not evidence of commit or rollback. Retry only the identical operation, or wait for reconciliation. An unknown/expired operation record does not authorize a fresh key that could duplicate a commit; retention/reconciliation guarantees must be agreed before live publication. Changed payload under one ID conflicts. Current authorization governs disclosure of the original receipt.


## Source provenance

- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 64–91; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 94–115; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 116–134; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.

## Owner-adopted navigation publication boundary, 2026-10-27

HPX-OWNER-010 supersedes the retained explicit-user-action-only publication wording for leaving an active node or switching its selected branch. Autosave while writing remains mutable draft acknowledgement. Before completing either departure, freeze the exact outgoing owned source/context, reconcile original pending operations, Save that captured text and Commit it when it differs from the exact committed snapshot. A same-node/same-branch selection and an unchanged captured snapshot do not create a departure revision. An explicit manual Commit remains supported. Formatting controls, menus, selection, comparison and other ordinary keyboard-focus changes do not publish. Browser close/tab hiding and lock retain their existing draft/recovery behavior; asynchronous unload is not a reliable Commit boundary.

Serialize departure with existing per-document queues and publication/receipt recovery. Do not move editing to the destination until the outgoing publication is acknowledged. Suspend outgoing editing during that transition, preserving cached source, selection, scroll and Undo. Failure/unknown outcome leaves the outgoing node active, exact bytes and operation retained for retry; do not show routine confirmation prompts, silently drop typing or manufacture success. A later retry reconciles the original operation before considering a new publication. Working-reference promotion remains separately acknowledged; a replacement failure cannot undo acknowledged text publication. No persistent record/schema/envelope version change follows from this trigger policy.

## Experimental single-parent temporal Commit transaction

Under HPX-OWNER-013/014, the next adapter-only writer remains marker3/feature32 with no runtime route or format opener/upgrade. Freeze document/branch/draft generation/base revision/base snapshot/sequence, complete exact text and explicit per-change mapping evidence. Recheck current scope before original receipt replay. Dedicated immutable candidate receipt37/wrapper1 retains that complete request, its namespaced canonical digest, the existing branch-scoped receipt, actual passage order and changed/unchanged distinction. Request digest is SHA256 of `hpx/temporal-commit/v1\0` plus the bounded strict kind37/wrapper1 encoding of the request itself. Stored receipt encoding remains separately bounded by the existing16MiB plaintext cap. Other receipt8/33 operation intents conflict; do not manufacture a legacy receipt for a different request.

Within one IMMEDIATE transaction: validate exact acknowledged draft/base/sequence/text and compact lineage31; load the committed origin map/required clock/explicit seed through the same read view and shared charged budget; validate supplied mapping evidence against the trace. If no actual immediate-base changes remain, require empty evidence, append only the frozen unchanged result and consume no passage order, revision, generation or promotion. Otherwise allocate the next clock value in memory, generate opaque revision/snapshot IDs, and encode origin34 against exact authenticated parent/current bindings. Publish existing single-parent revision4/snapshot5/event9, eligible exact working promotion24, selected head/draft, reset lineage31, origin34, clock35 and receipt37 atomically. Existing unselected branches, old revisions/seeds and optional evidence remain unchanged. This increment cannot represent two-parent Merge; never omit a parent to reuse it.

Keep working-checkpoint promotion semantics: the latest checkpoint qualifies only for exact base and complete text, and private reference replacement remains its separately acknowledged later batch. Its reader must verify the actual new37 request/digest/receipt when legacy receipt8 is absent under marker3; it must not reinterpret a temporal request as the old plain Commit command. Normal1/2 and existing8-based reads retain their contract. No-op temporal Commit has no promotion because it creates no new revision.

Original-operation retry rechecks current authority and exact immutable result/request bindings but does not revalidate newer mutable generation/head/order or allocate again. Faults before SQL COMMIT roll back every changed value, including promotions and clocks; an unknown reply after COMMIT reconciles the same request/operation. Test no-op, actual reversion, inherited/unknown passage age, independent branches, stale/denied source, changed intent/cross-family collisions, every write boundary, eligible/noneligible promotion, separate replacement and lost reply before any format/runtime enablement. This protocol is the next implementation contract, not a passing test or authorized existing-workspace upgrade.

### Experimental transaction implemented; application integration remains separate

`storage/temporal_commit.rs` now implements the preceding single-parent transaction behind the existing experimental3/feature32 guard. It exposes an adapter method, not an HTTP command or public format opener. Save's exact context/lineage readers are crate-private shared helpers. Current catalog/document/branch authority and guard precede original37 receipt recovery; operation IDs already used by8 or33 conflict. Temporal Save also rejects37 reuse. Frozen retries validate original exact parent/result/event/snapshot/text and retained origin/evidence/transition without consulting a newer mutable draft or allocating another order.

The transaction caps encrypted temporal/history reads at64MiB and retained origin reconstruction at64 records; caller work is positive and capped at16Mi units, divided between lineage, historical-map reconstruction and publication. Existing catalog/branch/checkpoint validation retains its own bounds. Failed limits return no partial publication. Encoding/sealing includes explicit wrapper1 kinds31/34/35/37, never a double wrapper or fabricated8 intent. Each revision/snapshot/event/promotion/head/draft/lineage/origin/clock/receipt write is in one IMMEDIATE transaction. The no-op records only37, including after an exact working reversion; it leaves revision/generation/order/promotion unchanged.

HPX-TEST-068 records ordinary transaction evidence including process termination at every write and after SQL COMMIT. Its fresh-process fixture loader deliberately unlocks only disposable synthetic3 data through test code; normal workspace opening and the main command dispatcher still reject3. This does not deliver a production upgrade/recovery entry point. Separate reference replacement, broader capacity tests, backed-up opening/upgrade/old-reader rejection and two-parent Merge remain subsequent work; existing-workspace upgrade remains separately explicit.

### Separately acknowledged temporal reference replacement

`temporal_replace_references(operation, publication, generation)` now provides the bounded experimental3/feature32 adapter transaction for the subsequent private reference batch. The existing WorkingClipboard Promote command/digest/receipt8 is its actual intent; it never aliases a temporal Commit to plain Commit8. The driver accepts no text writer, Checkpoint, Clear or Remove command and adds no runtime route. The existing protected publication consumer falls back from an absent8 only to a strict changed37 publication under3; complete current document/branch scope, parent/result/event/snapshot/source and origin transition are authenticated before replacement or original-batch recovery. Normal1/2 behavior retains the original8 path and missing-receipt error.

Live private references remain unchanged until this separately acknowledged transaction succeeds. The bounded128-entry replacement loop appends committed references retaining exact previous IDs/ranges and original private references; only its own index and batch receipt publish together. A failed batch cannot undo the previously acknowledged text/clock/promotion. Original exact batch retries are authorized and reconciled before checking newer mutable index generation; changed intent or cross-family33/37 operation reuse conflicts. A new batch with no matching private entries records its own outcome without advancing the index; unchanged37 publication is not a replacement target. HPX-TEST-069 tests both error and actual process-termination boundaries, retained originals and later index mutation/authority loss. This remains a storage adapter increment, not a production format upgrade or public temporal workflow.

### Capacity/readback hardening of the experimental writer

The later HPX-TEST-070 capacity increment supersedes the initial64MiB read/16Mi-work allowances above, without changing any serialized format. Origin reconstruction now caps charged encrypted bytes at128MiB, retained records at64 and caller work at32Mi units. Temporal Commit admits up to160Mi work units divided into five bounded slices: draft lineage, authenticated parent map, origin publication, reset lineage and result readback. It uses one128MiB shared prepublication read allowance and a separate128MiB result-readback allowance (256MiB aggregate maximum); existing separately bounded catalog/branch/checkpoint metadata remains outside these temporal/history budgets. Save retains its original16Mi work cap and schema1/2 behavior is unchanged.

A changed publication loads at most63 parent records, reserving the final retained-reader slot for its result. After all writes, before SQL COMMIT, it reconstructs the exact new head using the ordinary origin reader's64-record/128MiB/32Mi-work ceilings and checks exact revision/text. Exhaustion or mismatch rolls back the transaction, including receipt/clock/promotion. The no-op still accepts a valid64-record current map and writes only its frozen receipt. No history is silently pruned or reseeded. Full raw2MiB source containing JSON-escaped control characters is tested through successive publications, origin reconstruction and exact frozen retry; this is bounded capacity evidence, not a promise of arbitrarily deep history within one query budget or accepted production format performance.

### Long-lived history remains a production-format gate

The experimental64-record origin reconstruction allowance is an admission limit, not permission to truncate immutable history or silently replace known passage ages with an unknown seed. At the bound a changed temporal Commit fails atomically and retains the acknowledged draft; ordinary supported1/2 workspaces keep their existing workflow and are unaffected by this experimental driver. Before any production temporal-format opener/upgrade, specify and verify how long-lived passage evidence remains bounded and reconstructible while retaining exact origins and all historical revisions. An authenticated derived-map checkpoint is a design candidate, not an adopted mechanism or delivered feature. Its exact record/minimum-reader/validation/recovery boundaries must be reviewable before enabling it; do not use missing/corrupt origin records as a checkpoint fallback. Coordinate this with the still-pending two-parent format so existing-data approval is sought for a concrete backed-up upgrade rather than successive speculative migrations.
