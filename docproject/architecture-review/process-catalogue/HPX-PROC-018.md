# HPX-PROC-018 — Assurance, build and governance

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-018 |
| Purpose | Assurance, build and governance |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Pinned sources/toolchains, dependency inventories, tests, decisions and source registers |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-018.001, HPX-PROC-018.002, HPX-PROC-018.003, HPX-PROC-018.004, HPX-PROC-018.005, HPX-PROC-018.006 |
| Dependencies | Independent verification tooling / owner decision authority |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | No application-wide proof or publication permission inferred from test success |
| Requirements | HPX-RQ-001, HPX-RQ-020, HPX-RQ-021, HPX-RQ-022, HPX-RQ-023, HPX-RQ-025, HPX-RQ-027 |
| Specification evidence | [docs/08-assurance/formal-validation-digest.md:1](../../../docs/08-assurance/formal-validation-digest.md); [docs/08-assurance/testing-strategy.md:1](../../../docs/08-assurance/testing-strategy.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/02-governance/OWNER_DECISIONS.md:1](../../../docs/02-governance/OWNER_DECISIONS.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-018.001 — Check mathematical models and extraction

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-018.001 |
| Name | Check mathematical models and extraction |
| Parent process | HPX-PROC-018 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Distinguish four rank/path model theorems from actual extracted spend helper; full Kahn/application unproved |
| Actors / initiating event | Developer proof replay |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Developer proof replay; pinned Lean/Charon/Aeneas inputs |
| Outputs | Scoped theorem/checker evidence or mismatch |
| Internal transformation | Distinguish four rank/path model theorems from actual extracted spend helper; full Kahn/application unproved |
| Data read | Pinned sources/toolchains, dependency inventories, tests, decisions and source registers |
| Data modified | Development evidence only |
| Core objects | Proof artifact; toolchain; source digest |
| Invoked subprocesses | None |
| Dependencies | Independent verification tooling / owner decision authority |
| State changes | Development evidence only |
| Transaction boundary | Isolated proof replay, no runtime service |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | No application-wide proof or publication permission inferred from test success |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-020, HPX-RQ-021, HPX-RQ-022, HPX-RQ-023, HPX-RQ-025, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | proofs/lean/Hypergraph/Expansion.lean; crates/domain/src/expansion.rs |
| Verification evidence / proposed acceptance | Recorded leanchecker and exact generated-byte replay; not rerun here |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/08-assurance/formal-validation-digest.md:1](../../../docs/08-assurance/formal-validation-digest.md); [docs/08-assurance/testing-strategy.md:1](../../../docs/08-assurance/testing-strategy.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/02-governance/OWNER_DECISIONS.md:1](../../../docs/02-governance/OWNER_DECISIONS.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0739, HPX-EV-0806, HPX-EV-0724, HPX-EV-0039, HPX-EV-0846 |

## HPX-PROC-018.002 — Validate complete edit/recovery workflows

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-018.002 |
| Name | Validate complete edit/recovery workflows |
| Parent process | HPX-PROC-018 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Exercise edits/autosave/restart/history/Commit, delayed/lost acknowledgements and context isolation |
| Actors / initiating event | Developer isolated synthetic workflow |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Developer isolated synthetic workflow; exact build |
| Outputs | Scoped checks and honest remaining gates |
| Internal transformation | Exercise edits/autosave/restart/history/Commit, delayed/lost acknowledgements and context isolation |
| Data read | Pinned sources/toolchains, dependency inventories, tests, decisions and source registers |
| Data modified | Isolated synthetic data only |
| Core objects | Test fixture; operation; snapshot |
| Invoked subprocesses | None |
| Dependencies | Independent verification tooling / owner decision authority |
| State changes | Isolated synthetic data only |
| Transaction boundary | Temporary runtime/browser cleanup before guarded handoff |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | No application-wide proof or publication permission inferred from test success |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-020, HPX-RQ-021, HPX-RQ-022, HPX-RQ-023, HPX-RQ-025, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | frontend/scripts/check-runtime-workflow.mjs |
| Verification evidence / proposed acceptance | Prior 32-check runtime increment; latest branch increment only component checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/08-assurance/formal-validation-digest.md:1](../../../docs/08-assurance/formal-validation-digest.md); [docs/08-assurance/testing-strategy.md:1](../../../docs/08-assurance/testing-strategy.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/02-governance/OWNER_DECISIONS.md:1](../../../docs/02-governance/OWNER_DECISIONS.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0739, HPX-EV-0806, HPX-EV-0724, HPX-EV-0039, HPX-EV-0846 |

## HPX-PROC-018.003 — Assess performance, usability and accessibility

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-018.003 |
| Name | Assess performance, usability and accessibility |
| Parent process | HPX-PROC-018 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Choose measurable workloads, latency/storage targets, keyboard/screenreader criteria without inventing conformance |
| Actors / initiating event | Acceptance run |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Acceptance run; representative supported desktop/platform profiles |
| Outputs | Measured budgets and accessibility results |
| Internal transformation | Choose measurable workloads, latency/storage targets, keyboard/screenreader criteria without inventing conformance |
| Data read | Pinned sources/toolchains, dependency inventories, tests, decisions and source registers |
| Data modified | Assurance evidence only |
| Core objects | Workload; metrics; accessibility scenario |
| Invoked subprocesses | None |
| Dependencies | Independent verification tooling / owner decision authority |
| State changes | Assurance evidence only |
| Transaction boundary | No application publication |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Quantitative performance/platform/accessibility targets incomplete |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | No application-wide proof or publication permission inferred from test success |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-020, HPX-RQ-021, HPX-RQ-022, HPX-RQ-023, HPX-RQ-025, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/08-assurance/formal-validation-digest.md:1](../../../docs/08-assurance/formal-validation-digest.md); [docs/08-assurance/testing-strategy.md:1](../../../docs/08-assurance/testing-strategy.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/02-governance/OWNER_DECISIONS.md:1](../../../docs/02-governance/OWNER_DECISIONS.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0739, HPX-EV-0806, HPX-EV-0724, HPX-EV-0039, HPX-EV-0846 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-018.004 — Prepare explicitly authorized publication

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-018.004 |
| Name | Prepare explicitly authorized publication |
| Parent process | HPX-PROC-018 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Choose MAJOR/MINOR/PATCH by compatibility including 0.x; synchronize relevant metadata; keep schemas/toolchains independent |
| Actors / initiating event | Owner explicit milestone authorization |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner explicit milestone authorization; reviewed exact source and validation |
| Outputs | SemVer metadata and permitted publication |
| Internal transformation | Choose MAJOR/MINOR/PATCH by compatibility including 0.x; synchronize relevant metadata; keep schemas/toolchains independent |
| Data read | Pinned sources/toolchains, dependency inventories, tests, decisions and source registers |
| Data modified | Only explicitly authorized release changes |
| Core objects | Version; release manifest |
| Invoked subprocesses | None |
| Dependencies | Independent verification tooling / owner decision authority |
| State changes | Only explicitly authorized release changes |
| Transaction boundary | Development publication separate from runtime commits |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | No application-wide proof or publication permission inferred from test success |
| Contract / postcondition | No commit/push/release in this analysis; prior one-time authorization exhausted |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-020, HPX-RQ-021, HPX-RQ-022, HPX-RQ-023, HPX-RQ-025, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Cargo.toml; frontend/package.json |
| Verification evidence / proposed acceptance | Version/link/license/release checks appropriate to actual milestone |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/08-assurance/formal-validation-digest.md:1](../../../docs/08-assurance/formal-validation-digest.md); [docs/08-assurance/testing-strategy.md:1](../../../docs/08-assurance/testing-strategy.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/02-governance/OWNER_DECISIONS.md:1](../../../docs/02-governance/OWNER_DECISIONS.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0739, HPX-EV-0806, HPX-EV-0724, HPX-EV-0039, HPX-EV-0846 |

## HPX-PROC-018.005 — Record decisions and maintain traceability

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-018.005 |
| Name | Record decisions and maintain traceability |
| Parent process | HPX-PROC-018 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Preserve source provenance and adopted obligations; record uncertainty instead of newest-wins authority |
| Actors / initiating event | Owner resolves consequential choice |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner resolves consequential choice; evidence and competing claims |
| Outputs | Scoped decision and updated requirement/test links |
| Internal transformation | Preserve source provenance and adopted obligations; record uncertainty instead of newest-wins authority |
| Data read | Pinned sources/toolchains, dependency inventories, tests, decisions and source registers |
| Data modified | Governance registers only in authorized implementation work |
| Core objects | Decision; requirement; evidence |
| Invoked subprocesses | None |
| Dependencies | Independent verification tooling / owner decision authority |
| State changes | Governance registers only in authorized implementation work |
| Transaction boundary | No authoritative register edits during this review |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | No application-wide proof or publication permission inferred from test success |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-020, HPX-RQ-021, HPX-RQ-022, HPX-RQ-023, HPX-RQ-025, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Existing migration hash/link/source-coverage checks; review checks separate |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/08-assurance/formal-validation-digest.md:1](../../../docs/08-assurance/formal-validation-digest.md); [docs/08-assurance/testing-strategy.md:1](../../../docs/08-assurance/testing-strategy.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/02-governance/OWNER_DECISIONS.md:1](../../../docs/02-governance/OWNER_DECISIONS.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0739, HPX-EV-0806, HPX-EV-0724, HPX-EV-0039, HPX-EV-0846 |

## HPX-PROC-018.006 — Review dependencies and build executable

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-018.006 |
| Name | Review dependencies and build executable |
| Parent process | HPX-PROC-018 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Check licences/checksums before compilation; development Node/Lean are not release runtime servers |
| Actors / initiating event | Developer build request |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Developer build request; pinned lockfiles and provenance inventories |
| Outputs | Reviewed static frontend and embedded Rust executable |
| Internal transformation | Check licences/checksums before compilation; development Node/Lean are not release runtime servers |
| Data read | Pinned sources/toolchains, dependency inventories, tests, decisions and source registers |
| Data modified | Build outputs only |
| Core objects | Dependency; asset bundle; executable |
| Invoked subprocesses | None |
| Dependencies | Independent verification tooling / owner decision authority |
| State changes | Build outputs only |
| Transaction boundary | Build not deployment or proof |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | No application-wide proof or publication permission inferred from test success |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-001, HPX-RQ-020, HPX-RQ-021, HPX-RQ-022, HPX-RQ-023, HPX-RQ-025, HPX-RQ-027 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Cargo.lock; frontend/package-lock.json; crates/runtime/build.rs |
| Verification evidence / proposed acceptance | Historical builds/license inventories; no compilation in this review |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/08-assurance/formal-validation-digest.md:1](../../../docs/08-assurance/formal-validation-digest.md); [docs/08-assurance/testing-strategy.md:1](../../../docs/08-assurance/testing-strategy.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/02-governance/OWNER_DECISIONS.md:1](../../../docs/02-governance/OWNER_DECISIONS.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md); section IDs HPX-EV-0739, HPX-EV-0806, HPX-EV-0724, HPX-EV-0039, HPX-EV-0846 |
