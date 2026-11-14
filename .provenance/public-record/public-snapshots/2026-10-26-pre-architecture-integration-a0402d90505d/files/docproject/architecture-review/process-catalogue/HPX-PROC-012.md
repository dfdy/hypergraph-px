# HPX-PROC-012 — Human–agent collaboration

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-012 |
| Purpose | Human–agent collaboration |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Agent identity, frozen context, proposed edit and owner review |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-012.001, HPX-PROC-012.002, HPX-PROC-012.003, HPX-PROC-012.004, HPX-PROC-012.005, HPX-PROC-012.006 |
| Dependencies | Future agent adapters / core application command boundary |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Provider connection and context egress explicit; agent output is a proposal and never authorizes itself |
| Requirements | HPX-RQ-013, HPX-RQ-017 |
| Specification evidence | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/02-governance/ai-development-protocol.md:1](../../../docs/02-governance/ai-development-protocol.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-012.001 — Connect an agent provider

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-012.001 |
| Name | Connect an agent provider |
| Parent process | HPX-PROC-012 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Specify secret custody, capability and revocation before live provider calls |
| Actors / initiating event | Owner explicit connect |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner explicit connect; provider credential and scope |
| Outputs | Scoped connection or failure |
| Internal transformation | Specify secret custody, capability and revocation before live provider calls |
| Data read | Agent identity, frozen context, proposed edit and owner review |
| Data modified | Unspecified encrypted connection record |
| Core objects | AgentPrincipal; provider connection |
| Invoked subprocesses | None |
| Dependencies | Future agent adapters / core application command boundary |
| State changes | Unspecified encrypted connection record |
| Transaction boundary | External setup protocol unspecified |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Provider connection and context egress explicit; agent output is a proposal and never authorizes itself |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/02-governance/ai-development-protocol.md:1](../../../docs/02-governance/ai-development-protocol.md); section IDs HPX-EV-0444, HPX-EV-0493, HPX-EV-0041 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-012.002 — Approve and disclose context

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-012.002 |
| Name | Approve and disclose context |
| Parent process | HPX-PROC-012 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Authorize each source and enforce non-trusted plaintext denial before outbound call |
| Actors / initiating event | User reviews context plan |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User reviews context plan; exact permitted sources and mode |
| Outputs | Frozen approved provider request or denied egress |
| Internal transformation | Authorize each source and enforce non-trusted plaintext denial before outbound call |
| Data read | Agent identity, frozen context, proposed edit and owner review |
| Data modified | Unspecified outbox/audit record |
| Core objects | ContextPlan; source closure |
| Invoked subprocesses | None |
| Dependencies | Future agent adapters / core application command boundary |
| State changes | Unspecified outbox/audit record |
| Transaction boundary | External request cannot share SQLite atomicity |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Provider connection and context egress explicit; agent output is a proposal and never authorizes itself |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/02-governance/ai-development-protocol.md:1](../../../docs/02-governance/ai-development-protocol.md); section IDs HPX-EV-0444, HPX-EV-0493, HPX-EV-0041 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-012.003 — Receive suggestion or tool proposal

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-012.003 |
| Name | Receive suggestion or tool proposal |
| Parent process | HPX-PROC-012 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Validate target/source references and isolate instructions from authority |
| Actors / initiating event | Provider response |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Provider response; bounded untrusted text/tool data |
| Outputs | Non-authoritative proposed change |
| Internal transformation | Validate target/source references and isolate instructions from authority |
| Data read | Agent identity, frozen context, proposed edit and owner review |
| Data modified | Unspecified proposal record |
| Core objects | Proposal; Agent; target head |
| Invoked subprocesses | None |
| Dependencies | Future agent adapters / core application command boundary |
| State changes | Unspecified proposal record |
| Transaction boundary | No content publication merely on response |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Provider connection and context egress explicit; agent output is a proposal and never authorizes itself |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/02-governance/ai-development-protocol.md:1](../../../docs/02-governance/ai-development-protocol.md); section IDs HPX-EV-0444, HPX-EV-0493, HPX-EV-0041 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-012.004 — Accept or reject reviewed change

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-012.004 |
| Name | Accept or reject reviewed change |
| Parent process | HPX-PROC-012 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Revalidate authority and stale targets; converge on same application commands as browser/REST |
| Actors / initiating event | Human reviews exact proposal |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Human reviews exact proposal; expected current heads and rights |
| Outputs | Authorized application operation or retained rejection |
| Internal transformation | Revalidate authority and stale targets; converge on same application commands as browser/REST |
| Data read | Agent identity, frozen context, proposed edit and owner review |
| Data modified | Only approved target publication and evidence |
| Core objects | Approval; operation; provenance |
| Invoked subprocesses | None |
| Dependencies | Future agent adapters / core application command boundary |
| State changes | Only approved target publication and evidence |
| Transaction boundary | Future frozen-plan/apply protocol unspecified |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Provider connection and context egress explicit; agent output is a proposal and never authorizes itself |
| Contract / postcondition | Review of one plan cannot authorize later changed payload |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/02-governance/ai-development-protocol.md:1](../../../docs/02-governance/ai-development-protocol.md); section IDs HPX-EV-0444, HPX-EV-0493, HPX-EV-0041 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-012.005 — Cancel and inspect interaction history

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-012.005 |
| Name | Cancel and inspect interaction history |
| Parent process | HPX-PROC-012 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Separate cancellation intent from proof provider never ran; retain permitted observed messages |
| Actors / initiating event | Human cancels or inspects |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Human cancels or inspects; in-flight request ID |
| Outputs | Explicit known/unknown external outcome and observable evidence |
| Internal transformation | Separate cancellation intent from proof provider never ran; retain permitted observed messages |
| Data read | Agent identity, frozen context, proposed edit and owner review |
| Data modified | Unspecified journal/outbox |
| Core objects | Interaction; request; cancellation |
| Invoked subprocesses | None |
| Dependencies | Future agent adapters / core application command boundary |
| State changes | Unspecified journal/outbox |
| Transaction boundary | External completion uncertainty requires explicit reconciliation |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Provider connection and context egress explicit; agent output is a proposal and never authorizes itself |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/02-governance/ai-development-protocol.md:1](../../../docs/02-governance/ai-development-protocol.md); section IDs HPX-EV-0444, HPX-EV-0493, HPX-EV-0041 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-012.006 — Convert selected formal material to Lean

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-012.006 |
| Name | Convert selected formal material to Lean |
| Parent process | HPX-PROC-012 |
| Applicable milestone/status | D — explicitly deferred |
| Purpose | No automatic proof or general prose-to-proof claim; exact conversion mechanism deferred |
| Actors / initiating event | Future explicit request |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Future explicit request; selected formal source |
| Outputs | Proposed formal artifact subject to checking |
| Internal transformation | No automatic proof or general prose-to-proof claim; exact conversion mechanism deferred |
| Data read | Agent identity, frozen context, proposed edit and owner review |
| Data modified | None |
| Core objects | Formal source; Lean artifact |
| Invoked subprocesses | None |
| Dependencies | Future agent adapters / core application command boundary |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Conversion interface and acceptance undefined; explicitly deferred |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Provider connection and context egress explicit; agent output is a proposal and never authorizes itself |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/02-governance/ai-development-protocol.md:1](../../../docs/02-governance/ai-development-protocol.md); section IDs HPX-EV-0444, HPX-EV-0493, HPX-EV-0041 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
