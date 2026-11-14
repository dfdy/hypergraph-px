# HPX-PROC-004 — Owned editing and presentation

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-004 |
| Purpose | Owned editing and presentation |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Exact owned UTF8 source, LF projection, selection, editor state |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-004.001, HPX-PROC-004.002, HPX-PROC-004.003, HPX-PROC-004.004, HPX-PROC-004.005, HPX-PROC-004.006, HPX-PROC-004.007 |
| Dependencies | Browser CodeMirror / owned-source adapter |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | Browser view state conveys no publication authority; Rust validates exact source ownership |
| Requirements | HPX-RQ-002, HPX-RQ-006, HPX-RQ-018, HPX-RQ-021, HPX-RQ-027 |
| Specification evidence | [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-004.001 — Map source and browser coordinates

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-004.001 |
| Name | Map source and browser coordinates |
| Parent process | HPX-PROC-004 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Convert UTF16 LF browser coordinates against exact owned UTF8 bytes; reject stale or split scalar endpoints |
| Actors / initiating event | Editor input/selection |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Editor input/selection; owned mixed-newline Unicode source |
| Outputs | Exact byte-range mapping or rejection |
| Internal transformation | Convert UTF16 LF browser coordinates against exact owned UTF8 bytes; reject stale or split scalar endpoints |
| Data read | Exact owned UTF8 source, LF projection, selection, editor state |
| Data modified | None |
| Core objects | OwnedBuffer; byte anchor |
| Invoked subprocesses | None |
| Dependencies | Browser CodeMirror / owned-source adapter |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Browser view state conveys no publication authority; Rust validates exact source ownership |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-006, HPX-RQ-018, HPX-RQ-021, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/src/owned-source.js; crates/domain/src/records.rs |
| Verification evidence / proposed acceptance | frontend/tests/owned-source.test.js; domain UTF8 validation |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0493, HPX-EV-0407, HPX-EV-0558 |

## HPX-PROC-004.002 — Apply formatting and table edits

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-004.002 |
| Name | Apply formatting and table edits |
| Parent process | HPX-PROC-004 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Apply source transaction; map through table/math replacement widgets without generic multi-owner save |
| Actors / initiating event | User edit/menu/IME |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User edit/menu/IME; exact source selection |
| Outputs | Single owned-buffer edit with preserved selection |
| Internal transformation | Apply source transaction; map through table/math replacement widgets without generic multi-owner save |
| Data read | Exact owned UTF8 source, LF projection, selection, editor state |
| Data modified | Browser buffer and undo history |
| Core objects | Editor transaction; Table; source range |
| Invoked subprocesses | None |
| Dependencies | Browser CodeMirror / owned-source adapter |
| State changes | Browser buffer and undo history |
| Transaction boundary | Editor transaction only; autosave is separate |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Browser view state conveys no publication authority; Rust validates exact source ownership |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-006, HPX-RQ-018, HPX-RQ-021, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/src/formatting.js; frontend/src/tables.js |
| Verification evidence / proposed acceptance | Formatting/structure browser cases; below-widget checks required per increment |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0493, HPX-EV-0407, HPX-EV-0558 |

## HPX-PROC-004.003 — Navigate outline and structural selection

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-004.003 |
| Name | Navigate outline and structural selection |
| Parent process | HPX-PROC-004 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Compute heading/block selection and navigate same buffer; structural selection does not alter occurrence identity |
| Actors / initiating event | User outline/minimap/overview click |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User outline/minimap/overview click; parsed structure |
| Outputs | Mapped source selection and viewport |
| Internal transformation | Compute heading/block selection and navigate same buffer; structural selection does not alter occurrence identity |
| Data read | Exact owned UTF8 source, LF projection, selection, editor state |
| Data modified | None |
| Core objects | Outline; source selection; view |
| Invoked subprocesses | None |
| Dependencies | Browser CodeMirror / owned-source adapter |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Browser view state conveys no publication authority; Rust validates exact source ownership |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-006, HPX-RQ-018, HPX-RQ-021, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/src/outline-tree.js; frontend/src/minimap.js; frontend/src/source-selection.js |
| Verification evidence / proposed acceptance | Outline/minimap/selection headless cases |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0493, HPX-EV-0407, HPX-EV-0558 |

## HPX-PROC-004.004 — Render math, tables and source guides

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-004.004 |
| Name | Render math, tables and source guides |
| Parent process | HPX-PROC-004 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Render bundled KaTeX/table replacements; maintain geometry below replacements and source-based navigation |
| Actors / initiating event | Source parse or viewport/theme update |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Source parse or viewport/theme update; exact buffer |
| Outputs | Source-neutral widgets and guides |
| Internal transformation | Render bundled KaTeX/table replacements; maintain geometry below replacements and source-based navigation |
| Data read | Exact owned UTF8 source, LF projection, selection, editor state |
| Data modified | None |
| Core objects | View decoration; owned source |
| Invoked subprocesses | None |
| Dependencies | Browser CodeMirror / owned-source adapter |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Browser view state conveys no publication authority; Rust validates exact source ownership |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-006, HPX-RQ-018, HPX-RQ-021, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/src/math-view.js; frontend/src/table-view.js; frontend/src/structure-guides.js |
| Verification evidence / proposed acceptance | Both-theme desktop rendering and source-under-widget cases |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0493, HPX-EV-0407, HPX-EV-0558 |

## HPX-PROC-004.005 — Undo, redo and switch buffer state

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-004.005 |
| Name | Undo, redo and switch buffer state |
| Parent process | HPX-PROC-004 |
| Applicable milestone/status | G — accepted design / gated local code; actual runtime integration pending |
| Purpose | Cache independent document/branch editor states; frozen responses remain attached to original context |
| Actors / initiating event | User undo/redo or branch switch |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User undo/redo or branch switch; per-context CodeMirror state |
| Outputs | Selected context source, selection, undo and scroll |
| Internal transformation | Cache independent document/branch editor states; frozen responses remain attached to original context |
| Data read | Exact owned UTF8 source, LF projection, selection, editor state |
| Data modified | Browser buffer state; persistence through explicit save only |
| Core objects | Editor state; document/branch key |
| Invoked subprocesses | None |
| Dependencies | Browser CodeMirror / owned-source adapter |
| State changes | Browser buffer state; persistence through explicit save only |
| Transaction boundary | Per-editor transaction; actual branch-switch integration pending |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Browser view state conveys no publication authority; Rust validates exact source ownership |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-006, HPX-RQ-018, HPX-RQ-021, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/src/app.js; frontend/src/runtime-adapter.js |
| Verification evidence / proposed acceptance | Owned-buffer component tests; full branch undo/restart workflow pending |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0493, HPX-EV-0407, HPX-EV-0558 |

## HPX-PROC-004.006 — Persist display preferences and tooltips

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-004.006 |
| Name | Persist display preferences and tooltips |
| Parent process | HPX-PROC-004 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Persist display-only schema; tooltips only on ambiguous/icon controls, never whole large surfaces |
| Actors / initiating event | User changes theme/width |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User changes theme/width; ambiguous icon hover |
| Outputs | Restored nonsecret display state; 1500ms tooltip |
| Internal transformation | Persist display-only schema; tooltips only on ambiguous/icon controls, never whole large surfaces |
| Data read | Exact owned UTF8 source, LF projection, selection, editor state |
| Data modified | Nonsecret browser display storage |
| Core objects | Display preference |
| Invoked subprocesses | None |
| Dependencies | Browser CodeMirror / owned-source adapter |
| State changes | Nonsecret browser display storage |
| Transaction boundary | No document mutation |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Browser view state conveys no publication authority; Rust validates exact source ownership |
| Contract / postcondition | No source, private identifiers, keys or workspace payload in preferences |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-006, HPX-RQ-018, HPX-RQ-021, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/src/column-widths.js; frontend/src/tooltips.js; frontend/src/control-labels.js |
| Verification evidence / proposed acceptance | Tooltip and both-theme width/layout checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0493, HPX-EV-0407, HPX-EV-0558 |

## HPX-PROC-004.007 — Check spelling locally

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-004.007 |
| Name | Check spelling locally |
| Parent process | HPX-PROC-004 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Choose local engine/dictionaries after licensing review; never assume native browser spellcheck supplies full contract |
| Actors / initiating event | User edits prose |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User edits prose; selected language dictionary |
| Outputs | Local suggestions and explicit replacement |
| Internal transformation | Choose local engine/dictionaries after licensing review; never assume native browser spellcheck supplies full contract |
| Data read | Exact owned UTF8 source, LF projection, selection, editor state |
| Data modified | None |
| Core objects | Language profile; dictionary; suggestion |
| Invoked subprocesses | None |
| Dependencies | Browser CodeMirror / owned-source adapter |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Engine, dictionary formats, language scope and thresholds unspecified |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | Browser view state conveys no publication authority; Rust validates exact source ownership |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-006, HPX-RQ-018, HPX-RQ-021, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); section IDs HPX-EV-0493, HPX-EV-0407, HPX-EV-0558 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
