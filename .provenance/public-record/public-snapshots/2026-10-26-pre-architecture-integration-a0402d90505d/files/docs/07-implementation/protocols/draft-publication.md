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
- **Last reviewed:** 2026-10-25

No uncertain outcome authorizes a fresh operation. Preserve newer local typing and selection after older acknowledgements.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Provider and consumers

Draft acknowledgement, immutable commit, stale-state rejection and retry reconciliation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Version and compatibility

Draft acknowledgement, immutable commit, stale-state rejection and retry reconciliation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

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

For a reviewed structural/agent action: resolve intent → prepare frozen proposal → show exact targets/effects/disclosure → explicit human approval → execute atomically → reconcile receipt and projection. A preview may allocate encrypted workflow state but publishes no document history. Approval of a proposal is not publication, and execution rechecks heads, rights, policy and dependency closure. Ordinary human commits need an explicit commit action, not a proposal for each keystroke.

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


## Preconditions, postconditions and errors

Draft acknowledgement, immutable commit, stale-state rejection and retry reconciliation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Ordering, retry and idempotency

Draft acknowledgement, immutable commit, stale-state rejection and retry reconciliation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Authentication and authorisation

Draft acknowledgement, immutable commit, stale-state rejection and retry reconciliation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Examples and conformance tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 64–91; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 94–115; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 116–134; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
