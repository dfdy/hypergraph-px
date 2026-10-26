# HPX-PROC-015 — External integrations and shared interfaces

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-015 |
| Purpose | External integrations and shared interfaces |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Zotero data, GitHub destination, expected remote head, frozen job |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-015.001, HPX-PROC-015.002, HPX-PROC-015.003, HPX-PROC-015.004, HPX-PROC-015.005, HPX-PROC-015.006 |
| Dependencies | Optional provider adapters / common operation semantics |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Explicit provider connection; scoped credentials and current egress policy; development GitHub access is not product connection |
| Requirements | HPX-RQ-013, HPX-RQ-030 |
| Specification evidence | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-015.001 — Read Zotero desktop library

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-015.001 |
| Name | Read Zotero desktop library |
| Parent process | HPX-PROC-015 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Specify local REST authentication/origin/credential rules and freeze selected metadata |
| Actors / initiating event | Owner explicitly connects local Zotero API |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner explicitly connects local Zotero API; selected references |
| Outputs | Read-only captured citation metadata |
| Internal transformation | Specify local REST authentication/origin/credential rules and freeze selected metadata |
| Data read | Zotero data, GitHub destination, expected remote head, frozen job |
| Data modified | Unspecified captured bibliography records |
| Core objects | Citation; local provider |
| Invoked subprocesses | None |
| Dependencies | Optional provider adapters / common operation semantics |
| State changes | Unspecified captured bibliography records |
| Transaction boundary | External read then explicit capture |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Desktop endpoint, credential, CORS and capture schema incomplete |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Explicit provider connection; scoped credentials and current egress policy; development GitHub access is not product connection |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0444, HPX-EV-0550, HPX-EV-0558 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-015.002 — Read Zotero cloud library

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-015.002 |
| Name | Read Zotero cloud library |
| Parent process | HPX-PROC-015 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Use separately authenticated Web API, not desktop assumptions; preserve historical captures |
| Actors / initiating event | Owner connects cloud library |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner connects cloud library; scoped token and selected references |
| Outputs | Read-only captured cloud metadata |
| Internal transformation | Use separately authenticated Web API, not desktop assumptions; preserve historical captures |
| Data read | Zotero data, GitHub destination, expected remote head, frozen job |
| Data modified | Unspecified captured bibliography records |
| Core objects | Citation; cloud provider |
| Invoked subprocesses | None |
| Dependencies | Optional provider adapters / common operation semantics |
| State changes | Unspecified captured bibliography records |
| Transaction boundary | External read then explicit capture |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Explicit provider connection; scoped credentials and current egress policy; development GitHub access is not product connection |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0444, HPX-EV-0550, HPX-EV-0558 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-015.003 — Connect GitHub and select destination

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-015.003 |
| Name | Connect GitHub and select destination |
| Parent process | HPX-PROC-015 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Keep credentials encrypted; show exact publication/backup purpose before job creation |
| Actors / initiating event | Owner connects and reviews repository/branch/path/visibility |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner connects and reviews repository/branch/path/visibility |
| Outputs | Scoped destination and preview |
| Internal transformation | Keep credentials encrypted; show exact publication/backup purpose before job creation |
| Data read | Zotero data, GitHub destination, expected remote head, frozen job |
| Data modified | Unspecified encrypted provider config |
| Core objects | Connection; destination; visibility |
| Invoked subprocesses | None |
| Dependencies | Optional provider adapters / common operation semantics |
| State changes | Unspecified encrypted provider config |
| Transaction boundary | External authorization boundary |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Explicit provider connection; scoped credentials and current egress policy; development GitHub access is not product connection |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0444, HPX-EV-0550, HPX-EV-0558 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-015.004 — Publish reviewed Markdown to GitHub

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-015.004 |
| Name | Publish reviewed Markdown to GitHub |
| Parent process | HPX-PROC-015 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Freeze encrypted outbox; perform provider-specific conditional write; reconcile lost replies without blind overwrite |
| Actors / initiating event | Owner approves exact bytes |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner approves exact bytes; destination and expected remote head |
| Outputs | Succeeded/conflict/failed/unknown job |
| Internal transformation | Freeze encrypted outbox; perform provider-specific conditional write; reconcile lost replies without blind overwrite |
| Data read | Zotero data, GitHub destination, expected remote head, frozen job |
| Data modified | Local outbox plus external repository |
| Core objects | ExportJob; expectedHeadOid or Contents SHA |
| Invoked subprocesses | None |
| Dependencies | Optional provider adapters / common operation semantics |
| State changes | Local outbox plus external repository |
| Transaction boundary | Local transaction and provider write are not atomic |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Remote race/lost reply cannot be interpreted as no remote write |
| Recovery / compensation | Inspect actual remote state under frozen job; unknown remains explicit |
| Security / trust | Explicit provider connection; scoped credentials and current egress policy; development GitHub access is not product connection |
| Contract / postcondition | No exactly-once provider promise; approval tied to exact bytes and destination |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0444, HPX-EV-0550, HPX-EV-0558 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-015.005 — Store create-only encrypted remote backup

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-015.005 |
| Name | Store create-only encrypted remote backup |
| Parent process | HPX-PROC-015 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Separate private encrypted backup from Markdown publication; do not overwrite existing artifact |
| Actors / initiating event | Owner approves backup destination |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner approves backup destination; encrypted artifact and unique target |
| Outputs | Known/unknown remote backup result |
| Internal transformation | Separate private encrypted backup from Markdown publication; do not overwrite existing artifact |
| Data read | Zotero data, GitHub destination, expected remote head, frozen job |
| Data modified | Outbox and remote object |
| Core objects | BackupJob; artifact |
| Invoked subprocesses | None |
| Dependencies | Optional provider adapters / common operation semantics |
| State changes | Outbox and remote object |
| Transaction boundary | Remote conditional create; local/remote reconciliation unspecified |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Explicit provider connection; scoped credentials and current egress policy; development GitHub access is not product connection |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0444, HPX-EV-0550, HPX-EV-0558 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-015.006 — Expose common REST and MCP commands

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-015.006 |
| Name | Expose common REST and MCP commands |
| Parent process | HPX-PROC-015 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Share operation semantics and expected-state checks rather than separate tool authority |
| Actors / initiating event | Authenticated client/tool invokes supported command |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Authenticated client/tool invokes supported command; exact plan |
| Outputs | Same authorized application outcome as browser |
| Internal transformation | Share operation semantics and expected-state checks rather than separate tool authority |
| Data read | Zotero data, GitHub destination, expected remote head, frozen job |
| Data modified | Only command-authorized state |
| Core objects | Command; tool capability; Receipt |
| Invoked subprocesses | None |
| Dependencies | Optional provider adapters / common operation semantics |
| State changes | Only command-authorized state |
| Transaction boundary | Current HTTPS browser routes exist; MCP auth/discovery/quotas unspecified |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Explicit provider connection; scoped credentials and current egress policy; development GitHub access is not product connection |
| Contract / postcondition | MCP transport does not grant broader authority |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0444, HPX-EV-0550, HPX-EV-0558 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
