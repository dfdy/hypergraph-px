# HPX-PROC-008 — Named and private working branches

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-008 |
| Purpose | Named and private working branches |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Branch metadata 20/21, Draft, working state/checkpoint 22/23, promotion 24, private reference 25/26, WorkingFork 27 |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-008.001, HPX-PROC-008.002, HPX-PROC-008.003, HPX-PROC-008.004, HPX-PROC-008.005, HPX-PROC-008.006, HPX-PROC-008.007, HPX-PROC-008.008 |
| Dependencies | Branch storage / working checkpoint coordinator / gated frontend |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Neither local_branches nor working_copy advertised; current document/branch/private owner authority before replay |
| Requirements | HPX-RQ-003, HPX-RQ-006, HPX-RQ-007, HPX-RQ-019, HPX-RQ-026, HPX-RQ-031 |
| Specification evidence | [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-008.001 — Create named child from committed snapshot

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-008.001 |
| Name | Create named child from committed snapshot |
| Parent process | HPX-PROC-008 |
| Applicable milestone/status | G — accepted design / gated local code; actual runtime integration pending |
| Purpose | Retain parent pending draft and separate creation metadata from revision ancestry |
| Actors / initiating event | Owner reviews child creation |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner reviews child creation; selected committed parent head and name |
| Outputs | Same-document/same-node child with independent draft |
| Internal transformation | Retain parent pending draft and separate creation metadata from revision ancestry |
| Data read | Branch metadata 20/21, Draft, working state/checkpoint 22/23, promotion 24, private reference 25/26, WorkingFork 27 |
| Data modified | Branch metadata/index and child slots plus receipt |
| Core objects | Content branch; head; draft |
| Invoked subprocesses | None |
| Dependencies | Branch storage / working checkpoint coordinator / gated frontend |
| State changes | Branch metadata/index and child slots plus receipt |
| Transaction boundary | One writer transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Neither local_branches nor working_copy advertised; current document/branch/private owner authority before replay |
| Contract / postcondition | Never copy uncommitted parent text implicitly |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-006, HPX-RQ-007, HPX-RQ-019, HPX-RQ-026, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/branches.rs; frontend/src/runtime-branches-panel.js |
| Verification evidence / proposed acceptance | Branch foundation and component checks; actual runtime workflow pending |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0296, HPX-EV-0304, HPX-EV-0677, HPX-EV-0846 |

## HPX-PROC-008.002 — Select and recover branch context

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-008.002 |
| Name | Select and recover branch context |
| Parent process | HPX-PROC-008 |
| Applicable milestone/status | G — accepted design / gated local code; actual runtime integration pending |
| Purpose | Load selected branch head/draft, cache selection/undo/scroll per context; legacy doc routes retain original branch |
| Actors / initiating event | User switches branch |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User switches branch; document/branch ID |
| Outputs | Independent owned source and editor state |
| Internal transformation | Load selected branch head/draft, cache selection/undo/scroll per context; legacy doc routes retain original branch |
| Data read | Branch metadata 20/21, Draft, working state/checkpoint 22/23, promotion 24, private reference 25/26, WorkingFork 27 |
| Data modified | None |
| Core objects | Branch; Draft; editor context |
| Invoked subprocesses | None |
| Dependencies | Branch storage / working checkpoint coordinator / gated frontend |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Neither local_branches nor working_copy advertised; current document/branch/private owner authority before replay |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-006, HPX-RQ-007, HPX-RQ-019, HPX-RQ-026, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/branches.rs; frontend/src/runtime-adapter.js; frontend/src/app.js |
| Verification evidence / proposed acceptance | Branch transport/context component checks; switch/undo/restart pending |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0296, HPX-EV-0304, HPX-EV-0677, HPX-EV-0846 |

## HPX-PROC-008.003 — Checkpoint unpublished working source

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-008.003 |
| Name | Checkpoint unpublished working source |
| Parent process | HPX-PROC-008 |
| Applicable milestone/status | G — accepted design / gated local code; actual runtime integration pending |
| Purpose | Lazily allocate private working branch identity; atomically save exact source checkpoint; do not Commit |
| Actors / initiating event | Provenance operation needs durable pending source |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Provenance operation needs durable pending source; exact text/base/sequence/range |
| Outputs | Immutable typed CheckpointId and original receipt |
| Internal transformation | Lazily allocate private working branch identity; atomically save exact source checkpoint; do not Commit |
| Data read | Branch metadata 20/21, Draft, working state/checkpoint 22/23, promotion 24, private reference 25/26, WorkingFork 27 |
| Data modified | Working state 22, immutable checkpoint 23, draft and receipt |
| Core objects | Working branch; checkpoint |
| Invoked subprocesses | None |
| Dependencies | Branch storage / working checkpoint coordinator / gated frontend |
| State changes | Working state 22, immutable checkpoint 23, draft and receipt |
| Transaction boundary | One writer transaction; idle autosave alone creates no checkpoint |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Neither local_branches nor working_copy advertised; current document/branch/private owner authority before replay |
| Contract / postcondition | Checkpoint source type is distinct from committed snapshot/revision |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-006, HPX-RQ-007, HPX-RQ-019, HPX-RQ-026, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/domain/src/working.rs; crates/storage/src/working.rs |
| Verification evidence / proposed acceptance | Checkpoint byte equality/restart/fault/wrapper tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0296, HPX-EV-0304, HPX-EV-0677, HPX-EV-0846 |

## HPX-PROC-008.004 — Capture working source reference atomically

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-008.004 |
| Name | Capture working source reference atomically |
| Parent process | HPX-PROC-008 |
| Applicable milestone/status | G — accepted design / gated local code; actual runtime integration pending |
| Purpose | Combine required save/checkpoint and exact range reference; keep legacy clipboard payload unchanged |
| Actors / initiating event | Protected Copy on pending exact source |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Protected Copy on pending exact source; expected list generation |
| Outputs | Checkpoint and private working reference |
| Internal transformation | Combine required save/checkpoint and exact range reference; keep legacy clipboard payload unchanged |
| Data read | Branch metadata 20/21, Draft, working state/checkpoint 22/23, promotion 24, private reference 25/26, WorkingFork 27 |
| Data modified | Working state/checkpoint, private list/reference and receipt |
| Core objects | Checkpoint; working reference 25/26 |
| Invoked subprocesses | None |
| Dependencies | Branch storage / working checkpoint coordinator / gated frontend |
| State changes | Working state/checkpoint, private list/reference and receipt |
| Transaction boundary | One writer transaction; bounded 128 current and retained entries |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Neither local_branches nor working_copy advertised; current document/branch/private owner authority before replay |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-006, HPX-RQ-007, HPX-RQ-019, HPX-RQ-026, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/working_clipboard.rs; crates/storage/src/lib.rs; frontend/src/runtime-working-clipboard.js |
| Verification evidence / proposed acceptance | Atomic capture/replay/context/range/component tests; actual HTTPS integration pending |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0296, HPX-EV-0304, HPX-EV-0677, HPX-EV-0846 |

## HPX-PROC-008.005 — Record exact promotion with Commit

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-008.005 |
| Name | Record exact promotion with Commit |
| Parent process | HPX-PROC-008 |
| Applicable milestone/status | G — accepted design / gated local code; actual runtime integration pending |
| Purpose | Compare complete owned text and context; latest eligible checkpoint only; retain old checkpoint |
| Actors / initiating event | Explicit Commit matches latest checkpoint complete source/base/binding |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Explicit Commit matches latest checkpoint complete source/base/binding |
| Outputs | Promotion fact or no promotion for changed source |
| Internal transformation | Compare complete owned text and context; latest eligible checkpoint only; retain old checkpoint |
| Data read | Branch metadata 20/21, Draft, working state/checkpoint 22/23, promotion 24, private reference 25/26, WorkingFork 27 |
| Data modified | Promotion 24 in text publication transaction |
| Core objects | Promotion; Checkpoint; Revision; Snapshot |
| Invoked subprocesses | None |
| Dependencies | Branch storage / working checkpoint coordinator / gated frontend |
| State changes | Promotion 24 in text publication transaction |
| Transaction boundary | Same transaction as Commit, no reference replacement here |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Neither local_branches nor working_copy advertised; current document/branch/private owner authority before replay |
| Contract / postcondition | Equal selected words in altered full source do not justify retargeting |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-006, HPX-RQ-007, HPX-RQ-019, HPX-RQ-026, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/working.rs; crates/storage/src/branches.rs |
| Verification evidence / proposed acceptance | Exact/changed/mismatch promotion and fault cases |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0296, HPX-EV-0304, HPX-EV-0677, HPX-EV-0846 |

## HPX-PROC-008.006 — Replace eligible private references after Commit

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-008.006 |
| Name | Replace eligible private references after Commit |
| Parent process | HPX-PROC-008 |
| Applicable milestone/status | G — accepted design / gated local code; actual runtime integration pending |
| Purpose | Authorize exact promotion; CAS private list under separate frozen operation and receipt |
| Actors / initiating event | Explicit bounded Promote batch |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Explicit bounded Promote batch; publication ID and current list generation |
| Outputs | New replacement links retaining predecessors, or inspectable pending candidates |
| Internal transformation | Authorize exact promotion; CAS private list under separate frozen operation and receipt |
| Data read | Branch metadata 20/21, Draft, working state/checkpoint 22/23, promotion 24, private reference 25/26, WorkingFork 27 |
| Data modified | Private reference/list and batch receipt |
| Core objects | Promotion; predecessor; replacement |
| Invoked subprocesses | None |
| Dependencies | Branch storage / working checkpoint coordinator / gated frontend |
| State changes | Private reference/list and batch receipt |
| Transaction boundary | Separate transaction AFTER text Commit |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Stale generation, denied source or unknown batch acknowledgement never undo text publication |
| Recovery / compensation | Reconcile batch receipt; inspect/retry bounded candidates after restart; broad reverse indexes deferred |
| Security / trust | Neither local_branches nor working_copy advertised; current document/branch/private owner authority before replay |
| Contract / postcondition | Original immutable links and checkpoints retained; no other principal/entity rewrite |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-006, HPX-RQ-007, HPX-RQ-019, HPX-RQ-026, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/working_clipboard.rs; frontend/src/runtime-working-clipboard.js |
| Verification evidence / proposed acceptance | Batch stale/replay/rollback and restart tests; cross-subsystem integration pending |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0296, HPX-EV-0304, HPX-EV-0677, HPX-EV-0846 |

## HPX-PROC-008.007 — Fork unpublished checkpoint

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-008.007 |
| Name | Fork unpublished checkpoint |
| Parent process | HPX-PROC-008 |
| Applicable milestone/status | G — accepted design / gated local code; actual runtime integration pending |
| Purpose | Validate retained source without forcing Commit; new independent node starts parentless |
| Actors / initiating event | User reviews working-source Fork |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User reviews working-source Fork; exact checkpoint and range |
| Outputs | Independent initial document and kind-27 derivation |
| Internal transformation | Validate retained source without forcing Commit; new independent node starts parentless |
| Data read | Branch metadata 20/21, Draft, working state/checkpoint 22/23, promotion 24, private reference 25/26, WorkingFork 27 |
| Data modified | New document/catalog/derivation and receipt |
| Core objects | Working source; new Node; derivation 27 |
| Invoked subprocesses | None |
| Dependencies | Branch storage / working checkpoint coordinator / gated frontend |
| State changes | New document/catalog/derivation and receipt |
| Transaction boundary | One writer transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Neither local_branches nor working_copy advertised; current document/branch/private owner authority before replay |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-006, HPX-RQ-007, HPX-RQ-019, HPX-RQ-026, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/working_forks.rs; frontend/src/runtime-adapter.js |
| Verification evidence / proposed acceptance | WorkingFork backend/restart/fault tests; general Provenance panel reader pending |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0296, HPX-EV-0304, HPX-EV-0677, HPX-EV-0846 |

## HPX-PROC-008.008 — Merge same-identity branches

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-008.008 |
| Name | Merge same-identity branches |
| Parent process | HPX-PROC-008 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Select merge semantics separately from independent Synthesis, including parent pending edits |
| Actors / initiating event | Owner reviews parent/child Merge |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner reviews parent/child Merge; exact branch heads |
| Outputs | New same-node revision(s), approved draft outcome |
| Internal transformation | Select merge semantics separately from independent Synthesis, including parent pending edits |
| Data read | Branch metadata 20/21, Draft, working state/checkpoint 22/23, promotion 24, private reference 25/26, WorkingFork 27 |
| Data modified | Unspecified merge publication records |
| Core objects | Content branches; Revision; merge conflict |
| Invoked subprocesses | None |
| Dependencies | Branch storage / working checkpoint coordinator / gated frontend |
| State changes | Unspecified merge publication records |
| Transaction boundary | Unspecified same-identity merge protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Conflict resolution, stale merge review, parent draft reconciliation unspecified |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Neither local_branches nor working_copy advertised; current document/branch/private owner authority before replay |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-006, HPX-RQ-007, HPX-RQ-019, HPX-RQ-026, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0296, HPX-EV-0304, HPX-EV-0677, HPX-EV-0846 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
