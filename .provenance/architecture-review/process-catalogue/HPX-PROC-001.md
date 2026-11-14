# HPX-PROC-001 — Application and runtime lifecycle

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-001 |
| Purpose | Application and runtime lifecycle |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Configuration, TLS files, embedded static assets, workspace bootstrap |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-001.001, HPX-PROC-001.002, HPX-PROC-001.003, HPX-PROC-001.004, HPX-PROC-001.005, HPX-PROC-001.006 |
| Dependencies | Rust runtime / embedded browser assets / development tooling |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Authenticated encrypted loopback; owner browser profile excluded |
| Requirements | HPX-RQ-001, HPX-RQ-010 |
| Specification evidence | [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-001.001 — Start configured runtime

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-001.001 |
| Name | Start configured runtime |
| Parent process | HPX-PROC-001 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Validate arguments and TLS configuration, bind loopback, establish process-lifetime session secrets |
| Actors / initiating event | Owner launches executable |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner launches executable; workspace path, loopback address, TLS paths |
| Outputs | Locked service or startup rejection |
| Internal transformation | Validate arguments and TLS configuration, bind loopback, establish process-lifetime session secrets |
| Data read | Configuration, TLS files, embedded static assets, workspace bootstrap |
| Data modified | None |
| Core objects | Runtime; workspace bootstrap |
| Invoked subprocesses | None |
| Dependencies | Rust runtime / embedded browser assets / development tooling |
| State changes | No persistent state change |
| Transaction boundary | No workspace editing before unlock |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Authenticated encrypted loopback; owner browser profile excluded |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-010 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/runtime/src/main.rs |
| Verification evidence / proposed acceptance | Runtime startup/security tests; recorded transport checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); section IDs HPX-EV-0314, HPX-EV-0558, HPX-EV-0724, HPX-EV-0444 |

## HPX-PROC-001.002 — Serve embedded frontend

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-001.002 |
| Name | Serve embedded frontend |
| Parent process | HPX-PROC-001 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Serve embedded allowlisted bytes without Node at release runtime |
| Actors / initiating event | Browser requests same-origin assets |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Browser requests same-origin assets; asset path |
| Outputs | Bundled HTML/JS/CSS |
| Internal transformation | Serve embedded allowlisted bytes without Node at release runtime |
| Data read | Configuration, TLS files, embedded static assets, workspace bootstrap |
| Data modified | None |
| Core objects | Asset bundle |
| Invoked subprocesses | None |
| Dependencies | Rust runtime / embedded browser assets / development tooling |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Authenticated encrypted loopback; owner browser profile excluded |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-010 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/runtime/build.rs; crates/runtime/src/main.rs |
| Verification evidence / proposed acceptance | Recorded embedded/development asset hash parity |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); section IDs HPX-EV-0314, HPX-EV-0558, HPX-EV-0724, HPX-EV-0444 |

## HPX-PROC-001.003 — Shut down and reopen

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-001.003 |
| Name | Shut down and reopen |
| Parent process | HPX-PROC-001 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Close process resources; reopen authenticated records and recover durable drafts, not unacknowledged browser memory |
| Actors / initiating event | Owner exits/restarts |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner exits/restarts; workspace path |
| Outputs | Locked reopened workspace; retained acknowledged data |
| Internal transformation | Close process resources; reopen authenticated records and recover durable drafts, not unacknowledged browser memory |
| Data read | Configuration, TLS files, embedded static assets, workspace bootstrap |
| Data modified | None |
| Core objects | Workspace; Draft; Receipt |
| Invoked subprocesses | None |
| Dependencies | Rust runtime / embedded browser assets / development tooling |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Reopen via passphrase or explicit enrolled alternative; unresolved operation uses original receipt |
| Security / trust | Authenticated encrypted loopback; owner browser profile excluded |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-010 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/lib.rs; crates/runtime/src/main.rs |
| Verification evidence / proposed acceptance | Storage subprocess crash/restart checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); section IDs HPX-EV-0314, HPX-EV-0558, HPX-EV-0724, HPX-EV-0444 |

## HPX-PROC-001.004 — Discover an update

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-001.004 |
| Name | Discover an update |
| Parent process | HPX-PROC-001 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Separate downloaded distribution from self-compiled and unknown origins; local editing remains available on network failure |
| Actors / initiating event | Explicit update request |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Explicit update request; distribution origin and approved metadata |
| Outputs | Available / unavailable / notification |
| Internal transformation | Separate downloaded distribution from self-compiled and unknown origins; local editing remains available on network failure |
| Data read | Configuration, TLS files, embedded static assets, workspace bootstrap |
| Data modified | None |
| Core objects | Distribution origin; update metadata |
| Invoked subprocesses | None |
| Dependencies | Rust runtime / embedded browser assets / development tooling |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Metadata authenticity and origin rules need exact contract |
| Recovery / compensation | No network response must not disable local use |
| Security / trust | Authenticated encrypted loopback; owner browser profile excluded |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-010 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); section IDs HPX-EV-0314, HPX-EV-0558, HPX-EV-0724, HPX-EV-0444 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-001.005 — Install an approved update

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-001.005 |
| Name | Install an approved update |
| Parent process | HPX-PROC-001 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Verify artifact, preserve workspace, perform approved migration and rollback/recovery |
| Actors / initiating event | Owner approves exact artifact |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner approves exact artifact; signature and migration plan |
| Outputs | New executable or recovered prior version |
| Internal transformation | Verify artifact, preserve workspace, perform approved migration and rollback/recovery |
| Data read | Configuration, TLS files, embedded static assets, workspace bootstrap |
| Data modified | Executable and optional approved migration |
| Core objects | Artifact; schema; backup |
| Invoked subprocesses | None |
| Dependencies | Rust runtime / embedded browser assets / development tooling |
| State changes | Executable and optional approved migration |
| Transaction boundary | Unspecified install/upgrade protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Signing, migration failure and rollback mechanics unspecified |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Authenticated encrypted loopback; owner browser profile excluded |
| Contract / postcondition | Notification does not authorize installation; no silent data format bump |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-010 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); section IDs HPX-EV-0314, HPX-EV-0558, HPX-EV-0724, HPX-EV-0444 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-001.006 — Refresh manual development runtime

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-001.006 |
| Name | Refresh manual development runtime |
| Parent process | HPX-PROC-001 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Guard binary/workspace identity, skip equal hash, preserve data and refresh private shortcuts |
| Actors / initiating event | Successful isolated integration run |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Successful isolated integration run; exact tested binary hash |
| Outputs | Locked manual runtime using identical tested binary |
| Internal transformation | Guard binary/workspace identity, skip equal hash, preserve data and refresh private shortcuts |
| Data read | Configuration, TLS files, embedded static assets, workspace bootstrap |
| Data modified | Manual executable/process only |
| Core objects | Binary digest; manual workspace |
| Invoked subprocesses | None |
| Dependencies | Rust runtime / embedded browser assets / development tooling |
| State changes | Manual executable/process only |
| Transaction boundary | Guarded development handoff; no test data enrollment |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Authenticated encrypted loopback; owner browser profile excluded |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-010 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/scripts/refresh-manual-runtime.mjs |
| Verification evidence / proposed acceptance | Prior guarded handoff evidence; no handoff in this review |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); section IDs HPX-EV-0314, HPX-EV-0558, HPX-EV-0724, HPX-EV-0444 |
