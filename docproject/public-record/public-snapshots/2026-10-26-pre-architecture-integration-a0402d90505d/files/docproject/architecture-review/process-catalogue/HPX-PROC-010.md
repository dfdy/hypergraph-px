# HPX-PROC-010 — Identity, attribution and provenance

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-010 |
| Purpose | Identity, attribution and provenance |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Principal, device, groups, publication and transformation evidence |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-010.001, HPX-PROC-010.002, HPX-PROC-010.003, HPX-PROC-010.004, HPX-PROC-010.005, HPX-PROC-010.006 |
| Dependencies | Identity and provenance domain / current publication views |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Identity, authentication and disclosure/operation permission are separate |
| Requirements | HPX-RQ-014, HPX-RQ-017 |
| Specification evidence | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-010.001 — Resolve principal and device identity

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-010.001 |
| Name | Resolve principal and device identity |
| Parent process | HPX-PROC-010 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Bind action to authenticated workspace authority; possession of a logical ID grants no rights |
| Actors / initiating event | Authenticated local command |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Authenticated local command; workspace catalog |
| Outputs | Current sole-owner/device identity |
| Internal transformation | Bind action to authenticated workspace authority; possession of a logical ID grants no rights |
| Data read | Principal, device, groups, publication and transformation evidence |
| Data modified | None |
| Core objects | Principal; Device; Workspace |
| Invoked subprocesses | None |
| Dependencies | Identity and provenance domain / current publication views |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Identity, authentication and disclosure/operation permission are separate |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-014, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/lib.rs |
| Verification evidence / proposed acceptance | Owner/device/cross-workspace substitution tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0343, HPX-EV-0391, HPX-EV-0612 |

## HPX-PROC-010.002 — Represent group and delegated identity

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-010.002 |
| Name | Represent group and delegated identity |
| Parent process | HPX-PROC-010 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Define membership, delegation scope and authority separate from identity |
| Actors / initiating event | Owner/group operation |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner/group operation; membership and delegation evidence |
| Outputs | Scoped authenticated relationship |
| Internal transformation | Define membership, delegation scope and authority separate from identity |
| Data read | Principal, device, groups, publication and transformation evidence |
| Data modified | Unspecified versioned identity/policy records |
| Core objects | Group; Principal; mandate |
| Invoked subprocesses | None |
| Dependencies | Identity and provenance domain / current publication views |
| State changes | Unspecified versioned identity/policy records |
| Transaction boundary | Unspecified membership/revocation protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Identity, authentication and disclosure/operation permission are separate |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-014, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0343, HPX-EV-0391, HPX-EV-0612 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-010.003 — Track authored spans and attribution

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-010.003 |
| Name | Track authored spans and attribution |
| Parent process | HPX-PROC-010 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Distinguish original author, publisher, importer, agent and reviewer; define span updates through edits |
| Actors / initiating event | Accepted editing/import/agent event |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Accepted editing/import/agent event; source spans and evidence |
| Outputs | Evidence-labelled attribution without fabricated certainty |
| Internal transformation | Distinguish original author, publisher, importer, agent and reviewer; define span updates through edits |
| Data read | Principal, device, groups, publication and transformation evidence |
| Data modified | Unspecified attribution records |
| Core objects | Authorship span; attribution claim |
| Invoked subprocesses | None |
| Dependencies | Identity and provenance domain / current publication views |
| State changes | Unspecified attribution records |
| Transaction boundary | Unspecified source-span publication integration |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Identity, authentication and disclosure/operation permission are separate |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-014, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0343, HPX-EV-0391, HPX-EV-0612 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-010.004 — Retain exact transformation evidence

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-010.004 |
| Name | Retain exact transformation evidence |
| Parent process | HPX-PROC-010 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Separate cross-node derivation from immutable same-node ancestry; retain exact source ranges |
| Actors / initiating event | Fork/Synthesis publication |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Fork/Synthesis publication; typed exact inputs and outputs |
| Outputs | Pinned transformation record inspectable historically |
| Internal transformation | Separate cross-node derivation from immutable same-node ancestry; retain exact source ranges |
| Data read | Principal, device, groups, publication and transformation evidence |
| Data modified | Immutable derivation in publishing transaction |
| Core objects | Transformation; Source; output Node |
| Invoked subprocesses | None |
| Dependencies | Identity and provenance domain / current publication views |
| State changes | Immutable derivation in publishing transaction |
| Transaction boundary | Same output publication transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Identity, authentication and disclosure/operation permission are separate |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-014, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/forks.rs; crates/storage/src/merges.rs |
| Verification evidence / proposed acceptance | Pinned derivation/read/restart/corruption tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0343, HPX-EV-0391, HPX-EV-0612 |

## HPX-PROC-010.005 — Record consequential observable interactions

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-010.005 |
| Name | Record consequential observable interactions |
| Parent process | HPX-PROC-010 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Record actual observed request/tool/output/review without inventing private model reasoning |
| Actors / initiating event | Human/agent tool interaction |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Human/agent tool interaction; permitted observable messages and targets |
| Outputs | Scoped auditable interaction evidence |
| Internal transformation | Record actual observed request/tool/output/review without inventing private model reasoning |
| Data read | Principal, device, groups, publication and transformation evidence |
| Data modified | Unspecified encrypted interaction journal |
| Core objects | Interaction; proposal; approval |
| Invoked subprocesses | None |
| Dependencies | Identity and provenance domain / current publication views |
| State changes | Unspecified encrypted interaction journal |
| Transaction boundary | Unspecified retention/redaction and transaction contracts |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Identity, authentication and disclosure/operation permission are separate |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-014, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0343, HPX-EV-0391, HPX-EV-0612 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-010.006 — Represent contested attribution

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-010.006 |
| Name | Represent contested attribution |
| Parent process | HPX-PROC-010 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Keep evidence and authority distinctions rather than newest-wins truth |
| Actors / initiating event | Conflicting rights/attribution evidence submitted |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Conflicting rights/attribution evidence submitted; exact claim scope |
| Outputs | Competing claims with explicit owner review outcome |
| Internal transformation | Keep evidence and authority distinctions rather than newest-wins truth |
| Data read | Principal, device, groups, publication and transformation evidence |
| Data modified | Unspecified claim/review records |
| Core objects | Claim; evidence; resolution |
| Invoked subprocesses | None |
| Dependencies | Identity and provenance domain / current publication views |
| State changes | Unspecified claim/review records |
| Transaction boundary | Unspecified conflict protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Identity, authentication and disclosure/operation permission are separate |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-014, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); section IDs HPX-EV-0343, HPX-EV-0391, HPX-EV-0612 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
