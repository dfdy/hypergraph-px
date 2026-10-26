# HPX-PROC-003 — Durable editing and publication

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-003 |
| Purpose | Durable editing and publication |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Catalog, branch/head, Draft, immutable objects, encrypted receipts |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-003.001, HPX-PROC-003.002, HPX-PROC-003.003, HPX-PROC-003.004, HPX-PROC-003.005, HPX-PROC-003.006, HPX-PROC-003.007 |
| Dependencies | Application command coordinator / encrypted SQLite |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Resolve current principal/device and expected workspace/document/branch before receipt replay |
| Requirements | HPX-RQ-006, HPX-RQ-007, HPX-RQ-008, HPX-RQ-009, HPX-RQ-019, HPX-RQ-023, HPX-RQ-024, HPX-RQ-031 |
| Specification evidence | [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-003.001 — Authorize and freeze command

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-003.001 |
| Name | Authorize and freeze command |
| Parent process | HPX-PROC-003 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Pure validators plan; application resolves current authority and checks expected state before write/replay |
| Actors / initiating event | UI operation |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | UI operation; exact document/branch, generation, source sequence, bytes, operation ID |
| Outputs | Frozen plan or rejected precondition |
| Internal transformation | Pure validators plan; application resolves current authority and checks expected state before write/replay |
| Data read | Catalog, branch/head, Draft, immutable objects, encrypted receipts |
| Data modified | None |
| Core objects | Command; OperationId; Draft |
| Invoked subprocesses | None |
| Dependencies | Application command coordinator / encrypted SQLite |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Resolve current principal/device and expected workspace/document/branch before receipt replay |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-006, HPX-RQ-007, HPX-RQ-008, HPX-RQ-009, HPX-RQ-019, HPX-RQ-023, HPX-RQ-024, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/domain/src/records.rs; crates/storage/src/lib.rs; frontend/src/runtime-adapter.js |
| Verification evidence / proposed acceptance | Changed retry/stale writer/principal isolation tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); section IDs HPX-EV-0710, HPX-EV-0677, HPX-EV-0651, HPX-EV-0782 |

## HPX-PROC-003.002 — Acknowledge mutable autosave

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-003.002 |
| Name | Acknowledge mutable autosave |
| Parent process | HPX-PROC-003 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | CAS mutable draft without creating text Revision or Snapshot; private working identity becomes explicit lazily |
| Actors / initiating event | Five-second idle or required checkpoint preparation |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Five-second idle or required checkpoint preparation; frozen exact owned text |
| Outputs | New draft generation and original receipt |
| Internal transformation | CAS mutable draft without creating text Revision or Snapshot; private working identity becomes explicit lazily |
| Data read | Catalog, branch/head, Draft, immutable objects, encrypted receipts |
| Data modified | Draft slot and immutable operation receipt |
| Core objects | Draft; content branch; private working context; Receipt |
| Invoked subprocesses | None |
| Dependencies | Application command coordinator / encrypted SQLite |
| State changes | Draft slot and immutable operation receipt |
| Transaction boundary | One BEGIN IMMEDIATE transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Frozen same-ID retry or receipt lookup; later typing stays queued |
| Security / trust | Resolve current principal/device and expected workspace/document/branch before receipt replay |
| Contract / postcondition | Acknowledged draft is durable; Save is not Commit |
| Requirement seed paths | HPX-RQ-006, HPX-RQ-007, HPX-RQ-008, HPX-RQ-009, HPX-RQ-019, HPX-RQ-023, HPX-RQ-024, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/lib.rs; crates/storage/src/branches.rs; frontend/src/runtime-adapter.js |
| Verification evidence / proposed acceptance | Exact Unicode/newline save/restart, lost reply and queued typing checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); section IDs HPX-EV-0710, HPX-EV-0677, HPX-EV-0651, HPX-EV-0782 |

## HPX-PROC-003.003 — Publish explicit Commit

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-003.003 |
| Name | Publish explicit Commit |
| Parent process | HPX-PROC-003 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Append same-node revision; atomically advance selected content head and rebase draft; eligible working checkpoint gains promotion fact |
| Actors / initiating event | Owner explicit Commit |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner explicit Commit; exact frozen source, expected branch head and generation |
| Outputs | New immutable revision, closed snapshot, event and receipt |
| Internal transformation | Append same-node revision; atomically advance selected content head and rebase draft; eligible working checkpoint gains promotion fact |
| Data read | Catalog, branch/head, Draft, immutable objects, encrypted receipts |
| Data modified | Immutable objects, selected head/draft and receipt |
| Core objects | Revision; Snapshot; Publication; Head; Draft; Promotion |
| Invoked subprocesses | HPX-PROC-008.005 |
| Dependencies | Application command coordinator / encrypted SQLite |
| State changes | Immutable objects, selected head/draft and receipt |
| Transaction boundary | One SQLite writer transaction; later replacement is separate |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Unknown reply reconciles original receipt, never publishes a second revision |
| Security / trust | Resolve current principal/device and expected workspace/document/branch before receipt replay |
| Contract / postcondition | All old or all new publication; no cross-identity revision parent |
| Requirement seed paths | HPX-RQ-006, HPX-RQ-007, HPX-RQ-008, HPX-RQ-009, HPX-RQ-019, HPX-RQ-023, HPX-RQ-024, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/lib.rs; crates/storage/src/branches.rs; crates/storage/src/working.rs |
| Verification evidence / proposed acceptance | Process exits both sides of COMMIT, exact history and duplicate retry tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); section IDs HPX-EV-0710, HPX-EV-0677, HPX-EV-0651, HPX-EV-0782 |

## HPX-PROC-003.004 — Reconcile uncertain result

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-003.004 |
| Name | Reconcile uncertain result |
| Parent process | HPX-PROC-003 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Check current authority and original receipt; compare exact request digest; queue newer edits independently |
| Actors / initiating event | Lost/delayed response |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Lost/delayed response; original frozen operation and digest |
| Outputs | Original authorized outcome or explicit unknown/conflict |
| Internal transformation | Check current authority and original receipt; compare exact request digest; queue newer edits independently |
| Data read | Catalog, branch/head, Draft, immutable objects, encrypted receipts |
| Data modified | None |
| Core objects | Operation; Receipt; buffer context |
| Invoked subprocesses | None |
| Dependencies | Application command coordinator / encrypted SQLite |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Changed operation reuse conflicts; unavailable receipt is not proof of failure |
| Recovery / compensation | Retry original frozen intent; do not substitute current editor bytes |
| Security / trust | Resolve current principal/device and expected workspace/document/branch before receipt replay |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-006, HPX-RQ-007, HPX-RQ-008, HPX-RQ-009, HPX-RQ-019, HPX-RQ-023, HPX-RQ-024, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/lib.rs; frontend/src/runtime-adapter.js |
| Verification evidence / proposed acceptance | Runtime-adapter lost response/stale/delayed tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); section IDs HPX-EV-0710, HPX-EV-0677, HPX-EV-0651, HPX-EV-0782 |

## HPX-PROC-003.005 — Recover acknowledged draft on restart

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-003.005 |
| Name | Recover acknowledged draft on restart |
| Parent process | HPX-PROC-003 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Authenticate selected slots and reconstruct owned buffer; preserve source bytes |
| Actors / initiating event | Reopen unlocked workspace |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Reopen unlocked workspace; exact document/branch |
| Outputs | Exact durable draft and published history |
| Internal transformation | Authenticate selected slots and reconstruct owned buffer; preserve source bytes |
| Data read | Catalog, branch/head, Draft, immutable objects, encrypted receipts |
| Data modified | None |
| Core objects | Draft; Head; Snapshot |
| Invoked subprocesses | None |
| Dependencies | Application command coordinator / encrypted SQLite |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Missing/corrupt authenticated record fails; unacknowledged typing has no durability promise |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Resolve current principal/device and expected workspace/document/branch before receipt replay |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-006, HPX-RQ-007, HPX-RQ-008, HPX-RQ-009, HPX-RQ-019, HPX-RQ-023, HPX-RQ-024, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/lib.rs; crates/storage/src/branches.rs |
| Verification evidence / proposed acceptance | Subprocess restart and mixed-newline historical reconstruction checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); section IDs HPX-EV-0710, HPX-EV-0677, HPX-EV-0651, HPX-EV-0782 |

## HPX-PROC-003.006 — Audit and rebuild recoverable indexes

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-003.006 |
| Name | Audit and rebuild recoverable indexes |
| Parent process | HPX-PROC-003 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Classify canonical mutable state versus derived indexes before selecting a rebuild algorithm |
| Actors / initiating event | Owner recovery request |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner recovery request; canonical history and damaged derived index |
| Outputs | Validated rebuilt index or explicit irrecoverable record report |
| Internal transformation | Classify canonical mutable state versus derived indexes before selecting a rebuild algorithm |
| Data read | Catalog, branch/head, Draft, immutable objects, encrypted receipts |
| Data modified | Only separately approved derived indexes |
| Core objects | Catalog; Head; Draft; assertion index |
| Invoked subprocesses | None |
| Dependencies | Application command coordinator / encrypted SQLite |
| State changes | Only separately approved derived indexes |
| Transaction boundary | Unspecified repair/quarantine transaction protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Canonical mutable Draft cannot be recreated merely from save receipt digest |
| Recovery / compensation | Preserve original DB; no speculative head selection or receipt pruning |
| Security / trust | Resolve current principal/device and expected workspace/document/branch before receipt replay |
| Contract / postcondition | Rebuild never invents acknowledged text or deletes history |
| Requirement seed paths | HPX-RQ-006, HPX-RQ-007, HPX-RQ-008, HPX-RQ-009, HPX-RQ-019, HPX-RQ-023, HPX-RQ-024, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); section IDs HPX-EV-0710, HPX-EV-0677, HPX-EV-0651, HPX-EV-0782 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-003.007 — Decode and negotiate persistent versions

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-003.007 |
| Name | Decode and negotiate persistent versions |
| Parent process | HPX-PROC-003 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Separate SQL schema, record kind/version, envelope and transport versions; preserve unknown optional records where supported |
| Actors / initiating event | Open/read request |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Open/read request; wrapper and kind/version |
| Outputs | Strict typed record or format error |
| Internal transformation | Separate SQL schema, record kind/version, envelope and transport versions; preserve unknown optional records where supported |
| Data read | Catalog, branch/head, Draft, immutable objects, encrypted receipts |
| Data modified | None |
| Core objects | Record wrapper; schema; ciphertext |
| Invoked subprocesses | None |
| Dependencies | Application command coordinator / encrypted SQLite |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Resolve current principal/device and expected workspace/document/branch before receipt replay |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-006, HPX-RQ-007, HPX-RQ-008, HPX-RQ-009, HPX-RQ-019, HPX-RQ-023, HPX-RQ-024, HPX-RQ-031 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/encoding.rs; crates/storage/src/lib.rs |
| Verification evidence / proposed acceptance | All-kind 1–27 wrappers reported; actual older-reader preservation 20–27 pending |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); section IDs HPX-EV-0710, HPX-EV-0677, HPX-EV-0651, HPX-EV-0782 |
