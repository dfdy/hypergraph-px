# HPX-PROC-002 — Workspace access and enrollment

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-002 |
| Purpose | Workspace access and enrollment |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Bootstrap wrapper, encrypted catalog, optional native secret |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-002.001, HPX-PROC-002.002, HPX-PROC-002.003, HPX-PROC-002.004, HPX-PROC-002.005, HPX-PROC-002.006, HPX-PROC-002.007 |
| Dependencies | Runtime access / storage / crypto / native keychain |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Explicit owner authority; passphrase recovery retained; bootstrap session is not storage unlock |
| Requirements | HPX-RQ-010, HPX-RQ-011 |
| Specification evidence | [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-002.001 — Create encrypted workspace

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-002.001 |
| Name | Create encrypted workspace |
| Parent process | HPX-PROC-002 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Allocate random data key, wrap it and initialize sole owner/device catalog |
| Actors / initiating event | Owner creation request |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner creation request; passphrase and create-only path |
| Outputs | Schema-1 locked/open workspace result |
| Internal transformation | Allocate random data key, wrap it and initialize sole owner/device catalog |
| Data read | Bootstrap wrapper, encrypted catalog, optional native secret |
| Data modified | Bootstrap and catalog |
| Core objects | Workspace; Principal; Device; key wrapper |
| Invoked subprocesses | None |
| Dependencies | Runtime access / storage / crypto / native keychain |
| State changes | Bootstrap and catalog |
| Transaction boundary | Create-only file initialization; failure must not replace existing file |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Explicit owner authority; passphrase recovery retained; bootstrap session is not storage unlock |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-010, HPX-RQ-011 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/lib.rs |
| Verification evidence / proposed acceptance | Creation, wrong passphrase, symlink/format and restart tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); section IDs HPX-EV-0265, HPX-EV-0558, HPX-EV-0651 |

## HPX-PROC-002.002 — Bootstrap browser session

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-002.002 |
| Name | Bootstrap browser session |
| Parent process | HPX-PROC-002 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Exchange launch capability for process-lifetime Secure HttpOnly SameSiteStrict session |
| Actors / initiating event | Browser launch fragment |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Browser launch fragment; one-time process capability |
| Outputs | Same-origin secure session cookie; fragment removed |
| Internal transformation | Exchange launch capability for process-lifetime Secure HttpOnly SameSiteStrict session |
| Data read | Bootstrap wrapper, encrypted catalog, optional native secret |
| Data modified | Process session state only |
| Core objects | Session capability |
| Invoked subprocesses | None |
| Dependencies | Runtime access / storage / crypto / native keychain |
| State changes | Process session state only |
| Transaction boundary | In-memory bootstrap, separate from storage unlock |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Explicit owner authority; passphrase recovery retained; bootstrap session is not storage unlock |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-010, HPX-RQ-011 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/runtime/src/main.rs |
| Verification evidence / proposed acceptance | Actual runtime cookie/origin/fragment checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); section IDs HPX-EV-0265, HPX-EV-0558, HPX-EV-0651 |

## HPX-PROC-002.003 — Unlock with passphrase

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-002.003 |
| Name | Unlock with passphrase |
| Parent process | HPX-PROC-002 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Derive bounded wrapping key and unwrap workspace key; authenticate catalog |
| Actors / initiating event | Owner unlock request |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner unlock request; raw passphrase bytes |
| Outputs | Unlocked scoped service or authentication failure |
| Internal transformation | Derive bounded wrapping key and unwrap workspace key; authenticate catalog |
| Data read | Bootstrap wrapper, encrypted catalog, optional native secret |
| Data modified | Unlocked process memory |
| Core objects | Workspace; owner/device; wrapped key |
| Invoked subprocesses | None |
| Dependencies | Runtime access / storage / crypto / native keychain |
| State changes | Unlocked process memory |
| Transaction boundary | No text publication |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Wrong secret, wrong context, future schema or corrupt catalog fail closed |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Explicit owner authority; passphrase recovery retained; bootstrap session is not storage unlock |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-010, HPX-RQ-011 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/crypto/src/lib.rs; crates/storage/src/lib.rs |
| Verification evidence / proposed acceptance | Crypto envelope and storage unlock tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); section IDs HPX-EV-0265, HPX-EV-0558, HPX-EV-0651 |

## HPX-PROC-002.004 — Lock workspace

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-002.004 |
| Name | Lock workspace |
| Parent process | HPX-PROC-002 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Suspend edits, drain frozen operations, drop workspace authority and keys |
| Actors / initiating event | Owner lock |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner lock; pending per-buffer operations |
| Outputs | Locked UI and service or explicit unknown/read-only outcome |
| Internal transformation | Suspend edits, drain frozen operations, drop workspace authority and keys |
| Data read | Bootstrap wrapper, encrypted catalog, optional native secret |
| Data modified | Unlocked process state |
| Core objects | Buffer contexts; session; data key |
| Invoked subprocesses | None |
| Dependencies | Runtime access / storage / crypto / native keychain |
| State changes | Unlocked process state |
| Transaction boundary | Drain before lock request; ambiguous reply reconciled |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain read-only uncertain state; do not re-enable another document context |
| Security / trust | Explicit owner authority; passphrase recovery retained; bootstrap session is not storage unlock |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-010, HPX-RQ-011 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/src/runtime-adapter.js; crates/runtime/src/main.rs |
| Verification evidence / proposed acceptance | Frozen-retry/lock tests and reported real workflow |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); section IDs HPX-EV-0265, HPX-EV-0558, HPX-EV-0651 |

## HPX-PROC-002.005 — Enroll native keychain alternative

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-002.005 |
| Name | Enroll native keychain alternative |
| Parent process | HPX-PROC-002 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Verify consistent encrypted backup; create independent native random secret; atomically add optional wrapper |
| Actors / initiating event | Unlocked owner explicitly enrolls |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Unlocked owner explicitly enrolls; supported native provider |
| Outputs | Schema-2 optional wrapper and retained passphrase recovery |
| Internal transformation | Verify consistent encrypted backup; create independent native random secret; atomically add optional wrapper |
| Data read | Bootstrap wrapper, encrypted catalog, optional native secret |
| Data modified | Native item and schema-2 wrapper |
| Core objects | Keychain item; wrapper; backup |
| Invoked subprocesses | None |
| Dependencies | Runtime access / storage / crypto / native keychain |
| State changes | Native item and schema-2 wrapper |
| Transaction boundary | Native create before SQLite COMMIT; only newly created item compensatable |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Denied/existing native item, stale backup fingerprint, DB failure |
| Recovery / compensation | Compensate new native item; orphan requires scoped inspection after crash |
| Security / trust | Explicit owner authority; passphrase recovery retained; bootstrap session is not storage unlock |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-010, HPX-RQ-011 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/keychain.rs; crates/keychain/src/lib.rs |
| Verification evidence / proposed acceptance | Keychain fault/replay and explicit isolated native roundtrip |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); section IDs HPX-EV-0265, HPX-EV-0558, HPX-EV-0651 |

## HPX-PROC-002.006 — Unlock explicitly through keychain

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-002.006 |
| Name | Unlock explicitly through keychain |
| Parent process | HPX-PROC-002 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Read native secret only for enrolled supported workspace, authenticate wrapping context |
| Actors / initiating event | Owner chooses keychain unlock |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner chooses keychain unlock; enrolled wrapper |
| Outputs | Unlocked service or explicit provider failure |
| Internal transformation | Read native secret only for enrolled supported workspace, authenticate wrapping context |
| Data read | Bootstrap wrapper, encrypted catalog, optional native secret |
| Data modified | Unlocked memory |
| Core objects | Native item; data key |
| Invoked subprocesses | None |
| Dependencies | Runtime access / storage / crypto / native keychain |
| State changes | Unlocked memory |
| Transaction boundary | No enrollment side effect |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Provider denial/missing item, unsupported schema, wrong workspace |
| Recovery / compensation | Passphrase fallback; never silently enroll or overwrite item |
| Security / trust | Explicit owner authority; passphrase recovery retained; bootstrap session is not storage unlock |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-010, HPX-RQ-011 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/keychain.rs |
| Verification evidence / proposed acceptance | Native restart/passphrase fallback checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); section IDs HPX-EV-0265, HPX-EV-0558, HPX-EV-0651 |

## HPX-PROC-002.007 — Remove enrollment and recover orphan

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-002.007 |
| Name | Remove enrollment and recover orphan |
| Parent process | HPX-PROC-002 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Commit wrapper removal before native deletion; never downgrade schema or speculate about an existing item |
| Actors / initiating event | Unlocked owner requests removal or scoped cleanup |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Unlocked owner requests removal or scoped cleanup; expected native item |
| Outputs | Deleted DB wrapper; native removal status |
| Internal transformation | Commit wrapper removal before native deletion; never downgrade schema or speculate about an existing item |
| Data read | Bootstrap wrapper, encrypted catalog, optional native secret |
| Data modified | Wrapper row and explicitly selected native item |
| Core objects | Optional wrapper; native secret |
| Invoked subprocesses | None |
| Dependencies | Runtime access / storage / crypto / native keychain |
| State changes | Wrapper row and explicitly selected native item |
| Transaction boundary | DB commit precedes external delete; cleanup may remain incomplete |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retry exact pending cleanup before lock; after crash manual scoped investigation |
| Security / trust | Explicit owner authority; passphrase recovery retained; bootstrap session is not storage unlock |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-010, HPX-RQ-011 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/keychain.rs |
| Verification evidence / proposed acceptance | Removal ordering, wrong-secret and cleanup fault cases |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); section IDs HPX-EV-0265, HPX-EV-0558, HPX-EV-0651 |
