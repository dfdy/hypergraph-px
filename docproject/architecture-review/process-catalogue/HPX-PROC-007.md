# HPX-PROC-007 — Intellectual transformations

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-007 |
| Purpose | Intellectual transformations |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Committed source snapshots, fragments, transformation events, private references |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-007.001, HPX-PROC-007.002, HPX-PROC-007.003, HPX-PROC-007.004, HPX-PROC-007.005, HPX-PROC-007.006, HPX-PROC-007.007 |
| Dependencies | Domain transformation planners / transactional storage / reviewed UI |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Exact source permission now; origin evidence never grants access |
| Requirements | HPX-RQ-003, HPX-RQ-008, HPX-RQ-017, HPX-RQ-026 |
| Specification evidence | [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); [docs/04-architecture/decisions/0015-initial-merge-workflow.md:1](../../../docs/04-architecture/decisions/0015-initial-merge-workflow.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-007.001 — Capture committed source reference

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-007.001 |
| Name | Capture committed source reference |
| Parent process | HPX-PROC-007 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Validate source and capture encrypted preview with idempotent generation-bound mutation |
| Actors / initiating event | User protected Copy |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User protected Copy; committed source and exact selected range |
| Outputs | Private pinned reference and generation |
| Internal transformation | Validate source and capture encrypted preview with idempotent generation-bound mutation |
| Data read | Committed source snapshots, fragments, transformation events, private references |
| Data modified | Private clipboard slot kind 10 and receipt |
| Core objects | Source; private clipboard entry |
| Invoked subprocesses | None |
| Dependencies | Domain transformation planners / transactional storage / reviewed UI |
| State changes | Private clipboard slot kind 10 and receipt |
| Transaction boundary | One writer transaction; capacity 128 |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Exact source permission now; origin evidence never grants access |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-008, HPX-RQ-017, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/clipboard.rs; frontend/src/runtime-clipboard.js |
| Verification evidence / proposed acceptance | Clipboard dedup/corruption/opaque-entry/retry and prior old-reader preservation |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); [docs/04-architecture/decisions/0015-initial-merge-workflow.md:1](../../../docs/04-architecture/decisions/0015-initial-merge-workflow.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0391, HPX-EV-0424, HPX-EV-0272, HPX-EV-0612 |

## HPX-PROC-007.002 — Fork committed passage independently

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-007.002 |
| Name | Fork committed passage independently |
| Parent process | HPX-PROC-007 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Create parentless first revision of new node and one-input one-output derivation; leave source pending unchanged |
| Actors / initiating event | User reviews Fork |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User reviews Fork; one exact committed fragment and title |
| Outputs | Independent document/node and pinned derivation |
| Internal transformation | Create parentless first revision of new node and one-input one-output derivation; leave source pending unchanged |
| Data read | Committed source snapshots, fragments, transformation events, private references |
| Data modified | New document objects, catalog, draft/head and receipt |
| Core objects | New Node; Revision; Snapshot; derivation kind 11 |
| Invoked subprocesses | None |
| Dependencies | Domain transformation planners / transactional storage / reviewed UI |
| State changes | New document objects, catalog, draft/head and receipt |
| Transaction boundary | One atomic writer transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Exact source permission now; origin evidence never grants access |
| Contract / postcondition | Cross-identity input is not a revision parent |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-008, HPX-RQ-017, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/domain/src/fork.rs; crates/storage/src/forks.rs |
| Verification evidence / proposed acceptance | Independent identity/retry/fault/source history tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); [docs/04-architecture/decisions/0015-initial-merge-workflow.md:1](../../../docs/04-architecture/decisions/0015-initial-merge-workflow.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0391, HPX-EV-0424, HPX-EV-0272, HPX-EV-0612 |

## HPX-PROC-007.003 — Review and publish Synthesis

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-007.003 |
| Name | Review and publish Synthesis |
| Parent process | HPX-PROC-007 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Publish explicit combined text and exact provenance; unknown original authorship remains unknown |
| Actors / initiating event | User reviews 2–8 exact committed inputs and edited output |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User reviews 2–8 exact committed inputs and edited output |
| Outputs | Independent output document and retained ordered derivation |
| Internal transformation | Publish explicit combined text and exact provenance; unknown original authorship remains unknown |
| Data read | Committed source snapshots, fragments, transformation events, private references |
| Data modified | New output objects, derivation and receipt |
| Core objects | Transformation; ordered inputs; new Node |
| Invoked subprocesses | None |
| Dependencies | Domain transformation planners / transactional storage / reviewed UI |
| State changes | New output objects, derivation and receipt |
| Transaction boundary | One atomic writer transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Exact source permission now; origin evidence never grants access |
| Contract / postcondition | Implemented Synthesis differs from same-identity parent-branch Merge |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-008, HPX-RQ-017, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/domain/src/merge.rs; crates/storage/src/merges.rs; frontend/src/merge-composer.js |
| Verification evidence / proposed acceptance | Synthesis role/input/range/replay/fault tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); [docs/04-architecture/decisions/0015-initial-merge-workflow.md:1](../../../docs/04-architecture/decisions/0015-initial-merge-workflow.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0391, HPX-EV-0424, HPX-EV-0272, HPX-EV-0612 |

## HPX-PROC-007.004 — Link a retained passage

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-007.004 |
| Name | Link a retained passage |
| Parent process | HPX-PROC-007 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Define Link participants and lifecycle without inventing revision ancestry |
| Actors / initiating event | Reviewed Link request |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Reviewed Link request; exact source and target context |
| Outputs | Typed reference with retained source evidence |
| Internal transformation | Define Link participants and lifecycle without inventing revision ancestry |
| Data read | Committed source snapshots, fragments, transformation events, private references |
| Data modified | Unspecified versioned reference entity |
| Core objects | Reference; Source |
| Invoked subprocesses | None |
| Dependencies | Domain transformation planners / transactional storage / reviewed UI |
| State changes | Unspecified versioned reference entity |
| Transaction boundary | Unspecified; no immutable entity rewrite |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Exact source permission now; origin evidence never grants access |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-008, HPX-RQ-017, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); [docs/04-architecture/decisions/0015-initial-merge-workflow.md:1](../../../docs/04-architecture/decisions/0015-initial-merge-workflow.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0391, HPX-EV-0424, HPX-EV-0272, HPX-EV-0612 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-007.005 — Embed retained content

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-007.005 |
| Name | Embed retained content |
| Parent process | HPX-PROC-007 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Use pinned/live include contracts rather than generic buffer insertion over multiple owners |
| Actors / initiating event | User reviews Embed |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User reviews Embed; exact source and target occurrence |
| Outputs | New composition include and provenance |
| Internal transformation | Use pinned/live include contracts rather than generic buffer insertion over multiple owners |
| Data read | Committed source snapshots, fragments, transformation events, private references |
| Data modified | New composition records |
| Core objects | Include; occurrence; derivation |
| Invoked subprocesses | HPX-PROC-005.004 |
| Dependencies | Domain transformation planners / transactional storage / reviewed UI |
| State changes | New composition records |
| Transaction boundary | General composition mechanism unspecified |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Exact source permission now; origin evidence never grants access |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-008, HPX-RQ-017, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); [docs/04-architecture/decisions/0015-initial-merge-workflow.md:1](../../../docs/04-architecture/decisions/0015-initial-merge-workflow.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0391, HPX-EV-0424, HPX-EV-0272, HPX-EV-0612 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-007.006 — Paste all, split or extract source

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-007.006 |
| Name | Paste all, split or extract source |
| Parent process | HPX-PROC-007 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Specify source ordering, occurrence ownership, identity allocation and publication before enabling broad transforms |
| Actors / initiating event | User explicit transformation |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User explicit transformation; scoped captured sources |
| Outputs | Reviewed target plan or unsupported operation |
| Internal transformation | Specify source ordering, occurrence ownership, identity allocation and publication before enabling broad transforms |
| Data read | Committed source snapshots, fragments, transformation events, private references |
| Data modified | Unspecified target/history records |
| Core objects | Fragment; Transformation; occurrence |
| Invoked subprocesses | None |
| Dependencies | Domain transformation planners / transactional storage / reviewed UI |
| State changes | Unspecified target/history records |
| Transaction boundary | Unspecified multi-source transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Exact source permission now; origin evidence never grants access |
| Contract / postcondition | Plain external paste never invents authenticated origin |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-008, HPX-RQ-017, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); [docs/04-architecture/decisions/0015-initial-merge-workflow.md:1](../../../docs/04-architecture/decisions/0015-initial-merge-workflow.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0391, HPX-EV-0424, HPX-EV-0272, HPX-EV-0612 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-007.007 — Remove or clear private captured references

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-007.007 |
| Name | Remove or clear private captured references |
| Parent process | HPX-PROC-007 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | CAS remove/clear private references; do not delete source snapshots or transform history |
| Actors / initiating event | Owner removes/clears |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner removes/clears; exact clipboard generation |
| Outputs | Updated private list with retained source history |
| Internal transformation | CAS remove/clear private references; do not delete source snapshots or transform history |
| Data read | Committed source snapshots, fragments, transformation events, private references |
| Data modified | Private slot and receipt |
| Core objects | Private clipboard |
| Invoked subprocesses | None |
| Dependencies | Domain transformation planners / transactional storage / reviewed UI |
| State changes | Private slot and receipt |
| Transaction boundary | One writer transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Exact source permission now; origin evidence never grants access |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-003, HPX-RQ-008, HPX-RQ-017, HPX-RQ-026 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/clipboard.rs |
| Verification evidence / proposed acceptance | Generation conflict, clear/no-op, overflow and immutable-source tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); [docs/04-architecture/decisions/0015-initial-merge-workflow.md:1](../../../docs/04-architecture/decisions/0015-initial-merge-workflow.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0391, HPX-EV-0424, HPX-EV-0272, HPX-EV-0612 |
