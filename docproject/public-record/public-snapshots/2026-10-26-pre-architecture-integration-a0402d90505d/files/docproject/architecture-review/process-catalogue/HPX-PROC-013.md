# HPX-PROC-013 — Export, compilation and publication artifacts

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-013 |
| Purpose | Export, compilation and publication artifacts |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Current tab source, acknowledged draft, committed closure, citations and rights claims |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-013.001, HPX-PROC-013.002, HPX-PROC-013.003, HPX-PROC-013.004, HPX-PROC-013.005, HPX-PROC-013.006, HPX-PROC-013.007 |
| Dependencies | Future compiler profiles / current local download / egress policy |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Freeze exact authorized inputs; non-trusted plaintext egress denied; external resources never silently fetched |
| Requirements | HPX-RQ-013, HPX-RQ-030 |
| Specification evidence | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-013.001 — Download current owned Markdown

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-013.001 |
| Name | Download current owned Markdown |
| Parent process | HPX-PROC-013 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Download exact owned source including mixed newline/Unicode; distinguish current tab from acknowledged draft |
| Actors / initiating event | User local download |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User local download; captured current tab source |
| Outputs | Exact file bytes; no durability claim |
| Internal transformation | Download exact owned source including mixed newline/Unicode; distinguish current tab from acknowledged draft |
| Data read | Current tab source, acknowledged draft, committed closure, citations and rights claims |
| Data modified | Local download output only |
| Core objects | OwnedBuffer; local artifact |
| Invoked subprocesses | None |
| Dependencies | Future compiler profiles / current local download / egress policy |
| State changes | Local download output only |
| Transaction boundary | No implicit Save or Commit |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Freeze exact authorized inputs; non-trusted plaintext egress denied; external resources never silently fetched |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/src/app.js; frontend/src/owned-source.js |
| Verification evidence / proposed acceptance | Owned-source exact clipboard/download tests; prior runtime workflow |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0550, HPX-EV-0444, HPX-EV-0424 |

## HPX-PROC-013.002 — Freeze exact compilation closure

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-013.002 |
| Name | Freeze exact compilation closure |
| Parent process | HPX-PROC-013 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Bind every revision, nested occurrence, resource, compiler/profile/template/style/locale and citation input |
| Actors / initiating event | User selects draft/snapshot/branch/hypergraph content |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User selects draft/snapshot/branch/hypergraph content; exact context |
| Outputs | Closed ordered export manifest |
| Internal transformation | Bind every revision, nested occurrence, resource, compiler/profile/template/style/locale and citation input |
| Data read | Current tab source, acknowledged draft, committed closure, citations and rights claims |
| Data modified | Unspecified frozen export job |
| Core objects | ExportPlan; closed Snapshot; resource manifest |
| Invoked subprocesses | None |
| Dependencies | Future compiler profiles / current local download / egress policy |
| State changes | Unspecified frozen export job |
| Transaction boundary | Unspecified atomic capture and rights-report protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Freeze exact authorized inputs; non-trusted plaintext egress denied; external resources never silently fetched |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0550, HPX-EV-0444, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-013.003 — Compile Markdown and HTML

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-013.003 |
| Name | Compile Markdown and HTML |
| Parent process | HPX-PROC-013 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Define mapping of selected structure and n-ary relationships; preserve readable fallback/appendix |
| Actors / initiating event | Approved frozen plan |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Approved frozen plan; format/profile |
| Outputs | Reproducible output plus explicit losses |
| Internal transformation | Define mapping of selected structure and n-ary relationships; preserve readable fallback/appendix |
| Data read | Current tab source, acknowledged draft, committed closure, citations and rights claims |
| Data modified | Export artifact/job |
| Core objects | Format profile; compilation result |
| Invoked subprocesses | None |
| Dependencies | Future compiler profiles / current local download / egress policy |
| State changes | Export artifact/job |
| Transaction boundary | Unspecified deterministic compiler contract |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Unsupported constructs/resources and determinism thresholds unspecified |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Freeze exact authorized inputs; non-trusted plaintext egress denied; external resources never silently fetched |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0550, HPX-EV-0444, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-013.004 — Provide bundled academic Pandoc formats

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-013.004 |
| Name | Provide bundled academic Pandoc formats |
| Parent process | HPX-PROC-013 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Choose embedded binding or bundled helper while reconciling one-Rust-executable release; XML/JSON schemas remain undecided |
| Actors / initiating event | Approved profile |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Approved profile; DOCX/ODT/RTF/HTML/TeX/Typst/XML/JSON selection |
| Outputs | Academic artifact without separate user Pandoc installation |
| Internal transformation | Choose embedded binding or bundled helper while reconciling one-Rust-executable release; XML/JSON schemas remain undecided |
| Data read | Current tab source, acknowledged draft, committed closure, citations and rights claims |
| Data modified | Export artifact/job |
| Core objects | Compiler version; writer profile; artifact |
| Invoked subprocesses | None |
| Dependencies | Future compiler profiles / current local download / egress policy |
| State changes | Export artifact/job |
| Transaction boundary | Unspecified packaging/compiler execution boundary |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Writer/version/licensing/sandbox/resource limits and PDF route not selected |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Freeze exact authorized inputs; non-trusted plaintext egress denied; external resources never silently fetched |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0550, HPX-EV-0444, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-013.005 — Freeze citations and bibliography

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-013.005 |
| Name | Freeze citations and bibliography |
| Parent process | HPX-PROC-013 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Snapshot metadata/style/locale rather than silently refreshing Zotero at historical render |
| Actors / initiating event | User chooses academic style |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User chooses academic style; retained citation data and locale |
| Outputs | Historical citation rendering and bibliography |
| Internal transformation | Snapshot metadata/style/locale rather than silently refreshing Zotero at historical render |
| Data read | Current tab source, acknowledged draft, committed closure, citations and rights claims |
| Data modified | Captured resources and artifact |
| Core objects | Citation; bibliographic record; CSL resource |
| Invoked subprocesses | None |
| Dependencies | Future compiler profiles / current local download / egress policy |
| State changes | Captured resources and artifact |
| Transaction boundary | Unspecified immutable citation representation |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Freeze exact authorized inputs; non-trusted plaintext egress denied; external resources never silently fetched |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0550, HPX-EV-0444, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-013.006 — Deliver and expire artifacts safely

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-013.006 |
| Name | Deliver and expire artifacts safely |
| Parent process | HPX-PROC-013 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Enforce access and confidentiality after compilation; define temp-file/log/job retention |
| Actors / initiating event | Approved destination |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Approved destination; exact final bytes and egress plan |
| Outputs | Delivered artifact or inspectable failed/unknown result |
| Internal transformation | Enforce access and confidentiality after compilation; define temp-file/log/job retention |
| Data read | Current tab source, acknowledged draft, committed closure, citations and rights claims |
| Data modified | Unspecified job/artifact state |
| Core objects | ExportJob; artifact; destination |
| Invoked subprocesses | None |
| Dependencies | Future compiler profiles / current local download / egress policy |
| State changes | Unspecified job/artifact state |
| Transaction boundary | Local/remote boundaries distinct; cleanup protocol unspecified |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Freeze exact authorized inputs; non-trusted plaintext egress denied; external resources never silently fetched |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0550, HPX-EV-0444, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-013.007 — Export provenance archive and relationship fallbacks

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-013.007 |
| Name | Export provenance archive and relationship fallbacks |
| Parent process | HPX-PROC-013 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Preserve role-labelled n-ary relationships and rights-conflict appendix under current disclosure authority |
| Actors / initiating event | User selects provenance scope |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User selects provenance scope; exact permitted graph |
| Outputs | Archive or readable per-format relationships with loss report |
| Internal transformation | Preserve role-labelled n-ary relationships and rights-conflict appendix under current disclosure authority |
| Data read | Current tab source, acknowledged draft, committed closure, citations and rights claims |
| Data modified | Archive artifact |
| Core objects | ProvenanceArchive; relationship; report |
| Invoked subprocesses | None |
| Dependencies | Future compiler profiles / current local download / egress policy |
| State changes | Archive artifact |
| Transaction boundary | Unspecified archive schema/roundtrip protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Freeze exact authorized inputs; non-trusted plaintext egress denied; external resources never silently fetched |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-013, HPX-RQ-030 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); section IDs HPX-EV-0550, HPX-EV-0444, HPX-EV-0424 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
