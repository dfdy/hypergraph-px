# HPX-PROC-009 — Comments and semantic assertions

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-009 |
| Purpose | Comments and semantic assertions |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Exact committed passages, predicate versions, annotation ancestry |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-009.001, HPX-PROC-009.002, HPX-PROC-009.003, HPX-PROC-009.004, HPX-PROC-009.005 |
| Dependencies | Immutable annotation planners / storage / retrospective panels |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Current source and entity authority; comments/assertions are claims, not truth or automatic authorship |
| Requirements | HPX-RQ-008, HPX-RQ-015, HPX-RQ-016, HPX-RQ-028, HPX-RQ-029 |
| Specification evidence | [docs/04-architecture/decisions/0017-initial-durable-comments.md:1](../../../docs/04-architecture/decisions/0017-initial-durable-comments.md); [docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md:1](../../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md); [docs/05-domain/assertions-and-predicates.md:1](../../../docs/05-domain/assertions-and-predicates.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-009.001 — Publish immutable passage comment

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-009.001 |
| Name | Publish immutable passage comment |
| Parent process | HPX-PROC-009 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Promote private capture into distinct retrospective comment; no draft anchor or source text edit |
| Actors / initiating event | Owner reviews comment |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner reviews comment; exact committed range and body ≤16 KiB |
| Outputs | Immutable comment and source binding |
| Internal transformation | Promote private capture into distinct retrospective comment; no draft anchor or source text edit |
| Data read | Exact committed passages, predicate versions, annotation ancestry |
| Data modified | Comment objects/index and receipt |
| Core objects | Comment; exact Source |
| Invoked subprocesses | None |
| Dependencies | Immutable annotation planners / storage / retrospective panels |
| State changes | Comment objects/index and receipt |
| Transaction boundary | One writer transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current source and entity authority; comments/assertions are claims, not truth or automatic authorship |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-008, HPX-RQ-015, HPX-RQ-016, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/domain/src/comment.rs; crates/storage/src/comments.rs; frontend/src/runtime-comments.js |
| Verification evidence / proposed acceptance | Comment Unicode/range/body/replay/restart tests and recorded workflow |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0017-initial-durable-comments.md:1](../../../docs/04-architecture/decisions/0017-initial-durable-comments.md); [docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md:1](../../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md); [docs/05-domain/assertions-and-predicates.md:1](../../../docs/05-domain/assertions-and-predicates.md); section IDs HPX-EV-0289, HPX-EV-0248, HPX-EV-0327 |

## HPX-PROC-009.002 — Inspect comments against historical text

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-009.002 |
| Name | Inspect comments against historical text |
| Parent process | HPX-PROC-009 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Resolve historical source under current rights independently of newer draft/Commit |
| Actors / initiating event | User selects source/comment |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User selects source/comment; bounded page |
| Outputs | Exact retained passage and immutable comment body |
| Internal transformation | Resolve historical source under current rights independently of newer draft/Commit |
| Data read | Exact committed passages, predicate versions, annotation ancestry |
| Data modified | None |
| Core objects | Comment; Snapshot; Source |
| Invoked subprocesses | None |
| Dependencies | Immutable annotation planners / storage / retrospective panels |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current source and entity authority; comments/assertions are claims, not truth or automatic authorship |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-008, HPX-RQ-015, HPX-RQ-016, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/comments.rs; frontend/src/runtime-comments-panel.js |
| Verification evidence / proposed acceptance | Historical reconstruction and component/headless comment checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0017-initial-durable-comments.md:1](../../../docs/04-architecture/decisions/0017-initial-durable-comments.md); [docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md:1](../../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md); [docs/05-domain/assertions-and-predicates.md:1](../../../docs/05-domain/assertions-and-predicates.md); section IDs HPX-EV-0289, HPX-EV-0248, HPX-EV-0327 |

## HPX-PROC-009.003 — Publish typed n-ary assertion

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-009.003 |
| Name | Publish typed n-ary assertion |
| Parent process | HPX-PROC-009 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Validate participant bindings and role cardinality; distinguish proposed claim from accepted review |
| Actors / initiating event | Owner reviews relation |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner reviews relation; 2–8 ordered roles, predicate definition/version, qualifiers |
| Outputs | Immutable assertion revision and review state |
| Internal transformation | Validate participant bindings and role cardinality; distinguish proposed claim from accepted review |
| Data read | Exact committed passages, predicate versions, annotation ancestry |
| Data modified | Assertion entities/index and receipt |
| Core objects | Assertion; role; predicate; source |
| Invoked subprocesses | None |
| Dependencies | Immutable annotation planners / storage / retrospective panels |
| State changes | Assertion entities/index and receipt |
| Transaction boundary | One writer transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current source and entity authority; comments/assertions are claims, not truth or automatic authorship |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-008, HPX-RQ-015, HPX-RQ-016, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/domain/src/assertion.rs; crates/storage/src/assertions.rs |
| Verification evidence / proposed acceptance | Participant/version/symmetry/qualifier/retry/fault tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0017-initial-durable-comments.md:1](../../../docs/04-architecture/decisions/0017-initial-durable-comments.md); [docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md:1](../../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md); [docs/05-domain/assertions-and-predicates.md:1](../../../docs/05-domain/assertions-and-predicates.md); section IDs HPX-EV-0289, HPX-EV-0248, HPX-EV-0327 |

## HPX-PROC-009.004 — Review assertion and retain ancestry

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-009.004 |
| Name | Review assertion and retain ancestry |
| Parent process | HPX-PROC-009 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Append same-entity annotation history; text snapshot stays immutable and excludes later retrospective overlays |
| Actors / initiating event | Owner explicit review |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner explicit review; expected assertion revision |
| Outputs | New accepted/rejected/superseded review revision |
| Internal transformation | Append same-entity annotation history; text snapshot stays immutable and excludes later retrospective overlays |
| Data read | Exact committed passages, predicate versions, annotation ancestry |
| Data modified | New assertion revision/index and receipt |
| Core objects | AssertionRevision; review ancestry |
| Invoked subprocesses | None |
| Dependencies | Immutable annotation planners / storage / retrospective panels |
| State changes | New assertion revision/index and receipt |
| Transaction boundary | One writer transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current source and entity authority; comments/assertions are claims, not truth or automatic authorship |
| Contract / postcondition | Accepted review is not factual truth; historical text does not absorb later assertions |
| Requirement seed paths | HPX-RQ-008, HPX-RQ-015, HPX-RQ-016, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/assertions.rs; frontend/src/assertion-history.js |
| Verification evidence / proposed acceptance | Review ancestry/stale source/history isolation tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0017-initial-durable-comments.md:1](../../../docs/04-architecture/decisions/0017-initial-durable-comments.md); [docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md:1](../../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md); [docs/05-domain/assertions-and-predicates.md:1](../../../docs/05-domain/assertions-and-predicates.md); section IDs HPX-EV-0289, HPX-EV-0248, HPX-EV-0327 |

## HPX-PROC-009.005 — Extend comment lifecycle

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-009.005 |
| Name | Extend comment lifecycle |
| Parent process | HPX-PROC-009 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Define replies, editing, resolution and deletion semantics before use; first comments remain immutable |
| Actors / initiating event | Future reply/edit/resolve request |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Future reply/edit/resolve request; exact parent and rights |
| Outputs | Separately versioned discussion lifecycle |
| Internal transformation | Define replies, editing, resolution and deletion semantics before use; first comments remain immutable |
| Data read | Exact committed passages, predicate versions, annotation ancestry |
| Data modified | Unspecified; no erasure authorized |
| Core objects | Comment thread; revision |
| Invoked subprocesses | None |
| Dependencies | Immutable annotation planners / storage / retrospective panels |
| State changes | Unspecified; no erasure authorized |
| Transaction boundary | Unspecified new entity lifecycle |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current source and entity authority; comments/assertions are claims, not truth or automatic authorship |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-008, HPX-RQ-015, HPX-RQ-016, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/04-architecture/decisions/0017-initial-durable-comments.md:1](../../../docs/04-architecture/decisions/0017-initial-durable-comments.md); [docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md:1](../../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md); [docs/05-domain/assertions-and-predicates.md:1](../../../docs/05-domain/assertions-and-predicates.md); section IDs HPX-EV-0289, HPX-EV-0248, HPX-EV-0327 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
