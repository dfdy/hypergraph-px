# HPX-PROC-011 — Rights, permissions and reporting

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-011 |
| Purpose | Rights, permissions and reporting |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Named rights holders, licence/mandate claims, authenticated mode and current permissions |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-011.001, HPX-PROC-011.002, HPX-PROC-011.003, HPX-PROC-011.004 |
| Dependencies | Future core policy / rights evidence / report builder |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Unresolved rights claim alone does not defeat authorized export; confidentiality and access rules take precedence |
| Requirements | HPX-RQ-013, HPX-RQ-030 |
| Specification evidence | [docs/01-purpose/principles.md:1](../../../docs/01-purpose/principles.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-011.001 — Capture rights-holder and licence claims

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-011.001 |
| Name | Capture rights-holder and licence claims |
| Parent process | HPX-PROC-011 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Separate licence assertion, legal identity, acceptance and contested evidence |
| Actors / initiating event | Owner/import submits scoped rights evidence |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use; named-holder/mandate workflows are review-requested investigation topics, not separately adopted mechanisms located in current contracts |
| Inputs | Owner/import submits scoped rights evidence; exact content |
| Outputs | Retained claim and named-holder evidence |
| Internal transformation | Separate licence assertion, legal identity, acceptance and contested evidence |
| Data read | Named rights holders, licence/mandate claims, authenticated mode and current permissions |
| Data modified | Unspecified versioned rights records |
| Core objects | RightsHolder; licence claim; Source |
| Invoked subprocesses | None |
| Dependencies | Future core policy / rights evidence / report builder |
| State changes | Unspecified versioned rights records |
| Transaction boundary | Unspecified claim publication protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Unresolved rights claim alone does not defeat authorized export; confidentiality and access rules take precedence |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. Existing rights/confidentiality/report obligations do not establish a named-holder or mandate schema. |
| Source sections | [docs/01-purpose/principles.md:1](../../../docs/01-purpose/principles.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0002, HPX-EV-0550, HPX-EV-0444, HPX-EV-0771 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-011.002 — Evaluate access and mandates

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-011.002 |
| Name | Evaluate access and mandates |
| Parent process | HPX-PROC-011 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Resolve current authority and mixed-input policy; keys and consent do not override core mode restrictions |
| Actors / initiating event | Operation plan |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use; named-holder/mandate workflows are review-requested investigation topics, not separately adopted mechanisms located in current contracts |
| Inputs | Operation plan; principal, mode, input scopes and mandates |
| Outputs | Permit/deny with scoped reason |
| Internal transformation | Resolve current authority and mixed-input policy; keys and consent do not override core mode restrictions |
| Data read | Named rights holders, licence/mandate claims, authenticated mode and current permissions |
| Data modified | None |
| Core objects | Mandate; policy; operation plan |
| Invoked subprocesses | None |
| Dependencies | Future core policy / rights evidence / report builder |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Policy algebra, precedence encoding and revocation semantics unspecified |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Unresolved rights claim alone does not defeat authorized export; confidentiality and access rules take precedence |
| Contract / postcondition | Identity and historical key possession are not authorization |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. Existing rights/confidentiality/report obligations do not establish a named-holder or mandate schema. |
| Source sections | [docs/01-purpose/principles.md:1](../../../docs/01-purpose/principles.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0002, HPX-EV-0550, HPX-EV-0444, HPX-EV-0771 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-011.003 — Append permitted rights-conflict report

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-011.003 |
| Name | Append permitted rights-conflict report |
| Parent process | HPX-PROC-011 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Report unresolved claims without automatically blocking otherwise permitted export |
| Actors / initiating event | Authorized export |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use; named-holder/mandate workflows are review-requested investigation topics, not separately adopted mechanisms located in current contracts |
| Inputs | Authorized export; unresolved/conflicting rights claims |
| Outputs | Rights appendix limited to permitted disclosures |
| Internal transformation | Report unresolved claims without automatically blocking otherwise permitted export |
| Data read | Named rights holders, licence/mandate claims, authenticated mode and current permissions |
| Data modified | Export artifact only |
| Core objects | Rights claim; conflict report |
| Invoked subprocesses | None |
| Dependencies | Future core policy / rights evidence / report builder |
| State changes | Export artifact only |
| Transaction boundary | Part of frozen export job; exact contract missing |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Unresolved rights claim alone does not defeat authorized export; confidentiality and access rules take precedence |
| Contract / postcondition | Rights reporting never bypasses confidential input/output boundaries |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. Existing rights/confidentiality/report obligations do not establish a named-holder or mandate schema. |
| Source sections | [docs/01-purpose/principles.md:1](../../../docs/01-purpose/principles.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0002, HPX-EV-0550, HPX-EV-0444, HPX-EV-0771 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-011.004 — Authorize historical selective disclosure

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-011.004 |
| Name | Authorize historical selective disclosure |
| Parent process | HPX-PROC-011 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Define visible opaque reference versus hidden relation, scope of history keys and revocation |
| Actors / initiating event | Recipient/history read or export |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use; named-holder/mandate workflows are review-requested investigation topics, not separately adopted mechanisms located in current contracts |
| Inputs | Recipient/history read or export; exact key epochs and grants |
| Outputs | Permitted historical subset or hidden/missing result |
| Internal transformation | Define visible opaque reference versus hidden relation, scope of history keys and revocation |
| Data read | Named rights holders, licence/mandate claims, authenticated mode and current permissions |
| Data modified | None |
| Core objects | Historical grant; key epoch; recipient |
| Invoked subprocesses | None |
| Dependencies | Future core policy / rights evidence / report builder |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Selective disclosure policy, key distribution and negative information contract unspecified |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Unresolved rights claim alone does not defeat authorized export; confidentiality and access rules take precedence |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. Existing rights/confidentiality/report obligations do not establish a named-holder or mandate schema. |
| Source sections | [docs/01-purpose/principles.md:1](../../../docs/01-purpose/principles.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0002, HPX-EV-0550, HPX-EV-0444, HPX-EV-0771 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
