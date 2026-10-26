# HPX-PROC-005 — Document composition and exact closure

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-005 |
| Purpose | Document composition and exact closure |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Nodes, revisions, occurrences, manifests, snapshots, source resources |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-005.001, HPX-PROC-005.002, HPX-PROC-005.003, HPX-PROC-005.004, HPX-PROC-005.005, HPX-PROC-005.006, HPX-PROC-005.007 |
| Dependencies | Domain composition planner / storage resolver |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Current authority for every occurrence and retained binding; no multi-owner generic save |
| Requirements | HPX-RQ-003, HPX-RQ-004, HPX-RQ-005, HPX-RQ-018, HPX-RQ-026 |
| Specification evidence | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-005.001 — Create and open local document

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-005.001 |
| Name | Create and open local document |
| Parent process | HPX-PROC-005 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Allocate stable identities and initial closed snapshot; load exact current authorized document |
| Actors / initiating event | Owner creates/opens document |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner creates/opens document; title and exact initial text or ID |
| Outputs | One-node one-occurrence document and owned draft |
| Internal transformation | Allocate stable identities and initial closed snapshot; load exact current authorized document |
| Data read | Nodes, revisions, occurrences, manifests, snapshots, source resources |
| Data modified | Catalog, immutable initial objects and head/draft |
| Core objects | Document; Node; Occurrence; Revision; Manifest; Snapshot |
| Invoked subprocesses | None |
| Dependencies | Domain composition planner / storage resolver |
| State changes | Catalog, immutable initial objects and head/draft |
| Transaction boundary | Atomic create and receipt; open consistent read |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current authority for every occurrence and retained binding; no multi-owner generic save |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-004, HPX-RQ-005, HPX-RQ-018, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/lib.rs |
| Verification evidence / proposed acceptance | Create/retry/document isolation and restart tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0343, HPX-EV-0360, HPX-EV-0424 |

## HPX-PROC-005.002 — Arrange, move or reuse occurrences

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-005.002 |
| Name | Arrange, move or reuse occurrences |
| Parent process | HPX-PROC-005 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Preserve logical node identity; move preserves occurrence, reuse allocates occurrence; enforce one structural parent |
| Actors / initiating event | User composition operation |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User composition operation; selected occurrence and destination |
| Outputs | New ordered manifest version |
| Internal transformation | Preserve logical node identity; move preserves occurrence, reuse allocates occurrence; enforce one structural parent |
| Data read | Nodes, revisions, occurrences, manifests, snapshots, source resources |
| Data modified | New immutable manifest and authorized head |
| Core objects | Occurrence; Manifest |
| Invoked subprocesses | None |
| Dependencies | Domain composition planner / storage resolver |
| State changes | New immutable manifest and authorized head |
| Transaction boundary | Unspecified general structural publication protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current authority for every occurrence and retained binding; no multi-owner generic save |
| Contract / postcondition | Ordered occurrence forest; stable identity distinct from placement |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-004, HPX-RQ-005, HPX-RQ-018, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0343, HPX-EV-0360, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-005.003 — Resolve and reconstruct exact snapshot

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-005.003 |
| Name | Resolve and reconstruct exact snapshot |
| Parent process | HPX-PROC-005 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Resolve closed revision bindings without following current heads or provider metadata |
| Actors / initiating event | History/reader request |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | History/reader request; closed snapshot ID and exact occurrence path |
| Outputs | Exact retained text and resources |
| Internal transformation | Resolve closed revision bindings without following current heads or provider metadata |
| Data read | Nodes, revisions, occurrences, manifests, snapshots, source resources |
| Data modified | None |
| Core objects | Snapshot; binding; Revision; occurrence path |
| Invoked subprocesses | None |
| Dependencies | Domain composition planner / storage resolver |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current authority for every occurrence and retained binding; no multi-owner generic save |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-004, HPX-RQ-005, HPX-RQ-018, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/domain/src/records.rs; crates/storage/src/lib.rs; crates/storage/src/history.rs |
| Verification evidence / proposed acceptance | One-occurrence exact history/restart; general nested resolver not implemented |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0343, HPX-EV-0360, HPX-EV-0424 |

## HPX-PROC-005.004 — Include pinned content

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-005.004 |
| Name | Include pinned content |
| Parent process | HPX-PROC-005 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Retain exact nested path bindings; repeated nested manifests may bind differently at different paths |
| Actors / initiating event | Reviewed include |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Reviewed include; exact source snapshot and occurrence path |
| Outputs | Pinned include in new closed composition |
| Internal transformation | Retain exact nested path bindings; repeated nested manifests may bind differently at different paths |
| Data read | Nodes, revisions, occurrences, manifests, snapshots, source resources |
| Data modified | New authorized composition records |
| Core objects | Include; nested Snapshot; Manifest |
| Invoked subprocesses | None |
| Dependencies | Domain composition planner / storage resolver |
| State changes | New authorized composition records |
| Transaction boundary | Unspecified general composition transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current authority for every occurrence and retained binding; no multi-owner generic save |
| Contract / postcondition | No live head substitution; expansion cycles rejected, references remain distinct |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-004, HPX-RQ-005, HPX-RQ-018, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0343, HPX-EV-0360, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-005.005 — Resolve live includes safely

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-005.005 |
| Name | Resolve live includes safely |
| Parent process | HPX-PROC-005 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Validate entire resulting expansion dependency view, not only original insertion |
| Actors / initiating event | Source head advance or live projection request |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Source head advance or live projection request; selected view |
| Outputs | Validated closure or cycle/error |
| Internal transformation | Validate entire resulting expansion dependency view, not only original insertion |
| Data read | Nodes, revisions, occurrences, manifests, snapshots, source resources |
| Data modified | None |
| Core objects | Live include; expansion graph |
| Invoked subprocesses | None |
| Dependencies | Domain composition planner / storage resolver |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Missing/unreadable source or recursive expansion must fail without partial publication |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current authority for every occurrence and retained binding; no multi-owner generic save |
| Contract / postcondition | Reference cycles are allowed separately from expansion cycles |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-004, HPX-RQ-005, HPX-RQ-018, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0343, HPX-EV-0360, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-005.006 — Freeze query or selected composite closure

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-005.006 |
| Name | Freeze query or selected composite closure |
| Parent process | HPX-PROC-005 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Specify selection ordering, repeated occurrences, citations and complete resources before compilation |
| Actors / initiating event | User compiles chosen branch/hypergraph selection |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User compiles chosen branch/hypergraph selection; exact selection |
| Outputs | Closed ordered resource-complete snapshot |
| Internal transformation | Specify selection ordering, repeated occurrences, citations and complete resources before compilation |
| Data read | Nodes, revisions, occurrences, manifests, snapshots, source resources |
| Data modified | Only approved captured closure |
| Core objects | Query; selection; Snapshot |
| Invoked subprocesses | None |
| Dependencies | Domain composition planner / storage resolver |
| State changes | Only approved captured closure |
| Transaction boundary | Unspecified capture plan and bounds |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current authority for every occurrence and retained binding; no multi-owner generic save |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-004, HPX-RQ-005, HPX-RQ-018, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0343, HPX-EV-0360, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-005.007 — Rename, archive or restore document

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-005.007 |
| Name | Rename, archive or restore document |
| Parent process | HPX-PROC-005 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Define mutable display metadata versus immutable history and append-only restore |
| Actors / initiating event | Owner lifecycle request |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner lifecycle request; target and expected state |
| Outputs | New metadata/history without erasing prior content |
| Internal transformation | Define mutable display metadata versus immutable history and append-only restore |
| Data read | Nodes, revisions, occurrences, manifests, snapshots, source resources |
| Data modified | Unspecified authorized metadata/restore records |
| Core objects | Document metadata; retained Revision |
| Invoked subprocesses | None |
| Dependencies | Domain composition planner / storage resolver |
| State changes | Unspecified authorized metadata/restore records |
| Transaction boundary | Unspecified; deletion/erasure excluded |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Current authority for every occurrence and retained binding; no multi-owner generic save |
| Contract / postcondition | No inferred erasure or history rewriting |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-004, HPX-RQ-005, HPX-RQ-018, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0343, HPX-EV-0360, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
