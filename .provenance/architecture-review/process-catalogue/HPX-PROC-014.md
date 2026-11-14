# HPX-PROC-014 — Import, backup and restore

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-014 |
| Purpose | Import, backup and restore |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Portable package candidates, Word review, SQLite snapshot, key recovery context |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-014.001, HPX-PROC-014.002, HPX-PROC-014.003, HPX-PROC-014.004, HPX-PROC-014.005 |
| Dependencies | Untrusted input adapters / consistent storage backup / future restore |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Bound resources; no macros or unapproved network; backup does not authorize plaintext egress |
| Requirements | HPX-RQ-017 |
| Specification evidence | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/formats/hpx-workspace.md:1](../../../docs/06-subsystems/formats/hpx-workspace.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-014.001 — Import portable workspace package

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-014.001 |
| Name | Import portable workspace package |
| Parent process | HPX-PROC-014 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Define schema, version, references, quotas and identity collision handling before accepting data |
| Actors / initiating event | Owner selects .hpxz/.hpx.json/.hpxe |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner selects .hpxz/.hpx.json/.hpxe; bounded bytes |
| Outputs | Validated import plan or unsupported format |
| Internal transformation | Define schema, version, references, quotas and identity collision handling before accepting data |
| Data read | Portable package candidates, Word review, SQLite snapshot, key recovery context |
| Data modified | Unspecified imported workspace objects |
| Core objects | Package; logical IDs; encrypted records |
| Invoked subprocesses | None |
| Dependencies | Untrusted input adapters / consistent storage backup / future restore |
| State changes | Unspecified imported workspace objects |
| Transaction boundary | Unspecified atomic import staging |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Archive bombs, missing closure, unknown schema, colliding identity require defined rejection |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Bound resources; no macros or unapproved network; backup does not authorize plaintext egress |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/formats/hpx-workspace.md:1](../../../docs/06-subsystems/formats/hpx-workspace.md); section IDs HPX-EV-0550, HPX-EV-0782, HPX-EV-0265, HPX-EV-0477 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-014.002 — Import Word review against exact base

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-014.002 |
| Name | Import Word review against exact base |
| Parent process | HPX-PROC-014 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Treat Word labels as unverified; separate virtual Word revision, importer and approver; no macro/resource execution |
| Actors / initiating event | Owner chooses DOCX review and exact branch/snapshot base |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner chooses DOCX review and exact branch/snapshot base |
| Outputs | Exact/ambiguous/unmatched proposed edits and comments |
| Internal transformation | Treat Word labels as unverified; separate virtual Word revision, importer and approver; no macro/resource execution |
| Data read | Portable package candidates, Word review, SQLite snapshot, key recovery context |
| Data modified | Unspecified review entities and later authorized edits |
| Core objects | WordRevision; proposal; exact base |
| Invoked subprocesses | None |
| Dependencies | Untrusted input adapters / consistent storage backup / future restore |
| State changes | Unspecified review entities and later authorized edits |
| Transaction boundary | Unspecified review/retry/apply protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Bound resources; no macros or unapproved network; backup does not authorize plaintext egress |
| Contract / postcondition | Historical snapshots immutable; ambiguity requires explicit review |
| Requirement seed paths | HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/formats/hpx-workspace.md:1](../../../docs/06-subsystems/formats/hpx-workspace.md); section IDs HPX-EV-0550, HPX-EV-0782, HPX-EV-0265, HPX-EV-0477 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-014.003 — Create consistent encrypted SQLite backup

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-014.003 |
| Name | Create consistent encrypted SQLite backup |
| Parent process | HPX-PROC-014 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Use SQLite backup API, quick_check and framed retained-state fingerprint; fsync file and directory before upgrade |
| Actors / initiating event | Explicit keychain enrollment |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Explicit keychain enrollment; current encrypted DB |
| Outputs | Verified encrypted consistent backup |
| Internal transformation | Use SQLite backup API, quick_check and framed retained-state fingerprint; fsync file and directory before upgrade |
| Data read | Portable package candidates, Word review, SQLite snapshot, key recovery context |
| Data modified | Create-only sibling encrypted backup |
| Core objects | SQLite image; fingerprint |
| Invoked subprocesses | None |
| Dependencies | Untrusted input adapters / consistent storage backup / future restore |
| State changes | Create-only sibling encrypted backup |
| Transaction boundary | Backup snapshot then writer-lock fingerprint recheck |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Bound resources; no macros or unapproved network; backup does not authorize plaintext egress |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/keychain.rs |
| Verification evidence / proposed acceptance | Keychain backup preservation/failure cases; general portable restore not delivered |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/formats/hpx-workspace.md:1](../../../docs/06-subsystems/formats/hpx-workspace.md); section IDs HPX-EV-0550, HPX-EV-0782, HPX-EV-0265, HPX-EV-0477 |

## HPX-PROC-014.004 — Create portable encrypted backup

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-014.004 |
| Name | Create portable encrypted backup |
| Parent process | HPX-PROC-014 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Select authenticated portable schema, key policy and retention; never copy a live WAL DB as backup |
| Actors / initiating event | Owner backup request |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner backup request; frozen closure and recipient/key policy |
| Outputs | Encrypted portable artifact and recovery information |
| Internal transformation | Select authenticated portable schema, key policy and retention; never copy a live WAL DB as backup |
| Data read | Portable package candidates, Word review, SQLite snapshot, key recovery context |
| Data modified | Backup artifact |
| Core objects | Encrypted package; recovery metadata |
| Invoked subprocesses | None |
| Dependencies | Untrusted input adapters / consistent storage backup / future restore |
| State changes | Backup artifact |
| Transaction boundary | Unspecified package/key recovery protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Bound resources; no macros or unapproved network; backup does not authorize plaintext egress |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/formats/hpx-workspace.md:1](../../../docs/06-subsystems/formats/hpx-workspace.md); section IDs HPX-EV-0550, HPX-EV-0782, HPX-EV-0265, HPX-EV-0477 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-014.005 — Restore as a new workspace

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-014.005 |
| Name | Restore as a new workspace |
| Parent process | HPX-PROC-014 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Verify artifact, scopes and IDs; restore create-only rather than overwriting current workspace |
| Actors / initiating event | Owner selects validated local/remote backup |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner selects validated local/remote backup; recovery credential |
| Outputs | New workspace preserving original source |
| Internal transformation | Verify artifact, scopes and IDs; restore create-only rather than overwriting current workspace |
| Data read | Portable package candidates, Word review, SQLite snapshot, key recovery context |
| Data modified | New workspace only |
| Core objects | Workspace; backup; key wrapper |
| Invoked subprocesses | None |
| Dependencies | Untrusted input adapters / consistent storage backup / future restore |
| State changes | New workspace only |
| Transaction boundary | Unspecified restore transaction and verification |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Corrupt/truncated artifact, wrong key and incompatible versions must not mutate original |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Bound resources; no macros or unapproved network; backup does not authorize plaintext egress |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-017 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/formats/hpx-workspace.md:1](../../../docs/06-subsystems/formats/hpx-workspace.md); section IDs HPX-EV-0550, HPX-EV-0782, HPX-EV-0265, HPX-EV-0477 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
