# HPX-PROC-006 — Graph validation and read projections

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-006 |
| Purpose | Graph validation and read projections |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Expansion edges, exact source bindings, assertion/derivation records |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-006.001, HPX-PROC-006.002, HPX-PROC-006.003, HPX-PROC-006.004, HPX-PROC-006.005, HPX-PROC-006.006, HPX-PROC-006.007, HPX-PROC-006.008 |
| Dependencies | Pure graph validator / authorized read projections |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | One authorized read transaction; historical source bindings differ from current display context |
| Requirements | HPX-RQ-002, HPX-RQ-004, HPX-RQ-005, HPX-RQ-014, HPX-RQ-015, HPX-RQ-028, HPX-RQ-029 |
| Specification evidence | [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-006.001 — Validate expansion DAG

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-006.001 |
| Name | Validate expansion DAG |
| Parent process | HPX-PROC-006 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Kahn elimination with declared-vertex and bounded work checks; caller owns projection completeness |
| Actors / initiating event | Caller provides finite complete projection |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Caller provides finite complete projection; vertices, edges, work budget |
| Outputs | Validated acyclic expansion or explicit error |
| Internal transformation | Kahn elimination with declared-vertex and bounded work checks; caller owns projection completeness |
| Data read | Expansion edges, exact source bindings, assertion/derivation records |
| Data modified | None |
| Core objects | Expansion graph |
| Invoked subprocesses | None |
| Dependencies | Pure graph validator / authorized read projections |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Unknown vertex, cycle, overflow or budget exhaustion fails |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | One authorized read transaction; historical source bindings differ from current display context |
| Contract / postcondition | No accepted recursive expansion; topological order is not reading order |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-004, HPX-RQ-005, HPX-RQ-014, HPX-RQ-015, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/domain/src/expansion.rs |
| Verification evidence / proposed acceptance | All 512 directed three-vertex graphs vs reachability oracle; model proof is separate |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md); section IDs HPX-EV-0535, HPX-EV-0376, HPX-EV-0612, HPX-EV-0663 |

## HPX-PROC-006.002 — Validate exact source anchors

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-006.002 |
| Name | Validate exact source anchors |
| Parent process | HPX-PROC-006 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Validate half-open scalar-aligned UTF8 range against immutable source; no heuristic relocation |
| Actors / initiating event | Selection/reference request |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Selection/reference request; owned text, path, byte range and quote |
| Outputs | Exact authorized source or rejection |
| Internal transformation | Validate half-open scalar-aligned UTF8 range against immutable source; no heuristic relocation |
| Data read | Expansion edges, exact source bindings, assertion/derivation records |
| Data modified | None |
| Core objects | Source; anchor; occurrence path |
| Invoked subprocesses | None |
| Dependencies | Pure graph validator / authorized read projections |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | One authorized read transaction; historical source bindings differ from current display context |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-004, HPX-RQ-005, HPX-RQ-014, HPX-RQ-015, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/anchors.rs; crates/domain/src/records.rs |
| Verification evidence / proposed acceptance | Exact Unicode/range/source-mismatch tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md); section IDs HPX-EV-0535, HPX-EV-0376, HPX-EV-0612, HPX-EV-0663 |

## HPX-PROC-006.003 — Page and compare immutable history

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-006.003 |
| Name | Page and compare immutable history |
| Parent process | HPX-PROC-006 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Bind branch cursor to document/branch/snapshot; preserve selected historical snapshot through later pages |
| Actors / initiating event | User history request |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User history request; pinned snapshot or opaque branch cursor |
| Outputs | Stable bounded historical page and exact selected text |
| Internal transformation | Bind branch cursor to document/branch/snapshot; preserve selected historical snapshot through later pages |
| Data read | Expansion edges, exact source bindings, assertion/derivation records |
| Data modified | None |
| Core objects | Revision; snapshot; encrypted cursor |
| Invoked subprocesses | None |
| Dependencies | Pure graph validator / authorized read projections |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Cross-context cursor fails; first-page stale expected head conflicts |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | One authorized read transaction; historical source bindings differ from current display context |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-004, HPX-RQ-005, HPX-RQ-014, HPX-RQ-015, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/history.rs; crates/storage/src/branches.rs; frontend/src/history-panel.js |
| Verification evidence / proposed acceptance | Three repeated targeted history checks; live branch history workflow pending |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md); section IDs HPX-EV-0535, HPX-EV-0376, HPX-EV-0612, HPX-EV-0663 |

## HPX-PROC-006.004 — Project selected hypergraph

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-006.004 |
| Name | Project selected hypergraph |
| Parent process | HPX-PROC-006 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Represent n-ary assertions as incidence groups; include original Fork/assertion/explicit Synthesis scopes only |
| Actors / initiating event | User selects up to 16 nodes and scope |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User selects up to 16 nodes and scope; exact input contexts |
| Outputs | Bounded graph with explicit outside-selection markers |
| Internal transformation | Represent n-ary assertions as incidence groups; include original Fork/assertion/explicit Synthesis scopes only |
| Data read | Expansion edges, exact source bindings, assertion/derivation records |
| Data modified | None |
| Core objects | Assertion; role; derivation; historical endpoint |
| Invoked subprocesses | None |
| Dependencies | Pure graph validator / authorized read projections |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | 64-source-work budget or unsupported scope fails honestly |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | One authorized read transaction; historical source bindings differ from current display context |
| Contract / postcondition | No clique expansion; no claim of complete outgoing/working-Fork graph |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-004, HPX-RQ-005, HPX-RQ-014, HPX-RQ-015, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/graph.rs; crates/storage/src/overlay_graph.rs; frontend/src/runtime-graph.js |
| Verification evidence / proposed acceptance | Graph budget/scope/history tests and recorded headless projection checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md); section IDs HPX-EV-0535, HPX-EV-0376, HPX-EV-0612, HPX-EV-0663 |

## HPX-PROC-006.005 — Read contributor publication evidence

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-006.005 |
| Name | Read contributor publication evidence |
| Parent process | HPX-PROC-006 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Traverse exact ancestry for publication evidence; do not equate publication with authorship or presence |
| Actors / initiating event | User selects exact snapshot |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User selects exact snapshot; scoped cursor |
| Outputs | Known publisher facts and explicit incomplete families |
| Internal transformation | Traverse exact ancestry for publication evidence; do not equate publication with authorship or presence |
| Data read | Expansion edges, exact source bindings, assertion/derivation records |
| Data modified | None |
| Core objects | Principal; Publication; Snapshot |
| Invoked subprocesses | None |
| Dependencies | Pure graph validator / authorized read projections |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | One authorized read transaction; historical source bindings differ from current display context |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-004, HPX-RQ-005, HPX-RQ-014, HPX-RQ-015, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/contributors.rs; frontend/src/runtime-contributors.js |
| Verification evidence / proposed acceptance | Contributor exact snapshot/cursor/privacy checks |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md); section IDs HPX-EV-0535, HPX-EV-0376, HPX-EV-0612, HPX-EV-0663 |

## HPX-PROC-006.006 — Browse predicate definitions and roles

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-006.006 |
| Name | Browse predicate definitions and roles |
| Parent process | HPX-PROC-006 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Separate labels/inverse labels/categories from identity; normalize symmetric roles for dedup |
| Actors / initiating event | User selects predicate/category |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | User selects predicate/category; versioned registry |
| Outputs | Canonical ordered participant roles and definition ID |
| Internal transformation | Separate labels/inverse labels/categories from identity; normalize symmetric roles for dedup |
| Data read | Expansion edges, exact source bindings, assertion/derivation records |
| Data modified | None |
| Core objects | PredicateDefinition; role; qualifier |
| Invoked subprocesses | None |
| Dependencies | Pure graph validator / authorized read projections |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | One authorized read transaction; historical source bindings differ from current display context |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-004, HPX-RQ-005, HPX-RQ-014, HPX-RQ-015, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/storage/src/predicates.rs; frontend/src/relationship-catalog.js |
| Verification evidence / proposed acceptance | Canonical registry/version/role and dialog tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md); section IDs HPX-EV-0535, HPX-EV-0376, HPX-EV-0612, HPX-EV-0663 |

## HPX-PROC-006.007 — Query general concepts and backlinks

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-006.007 |
| Name | Query general concepts and backlinks |
| Parent process | HPX-PROC-006 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Define indexing, bounded traversal and hidden-versus-missing references before enabling general query |
| Actors / initiating event | User semantic query |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User semantic query; concept/ref scope and rights |
| Outputs | Authorized result set with explicit completeness |
| Internal transformation | Define indexing, bounded traversal and hidden-versus-missing references before enabling general query |
| Data read | Expansion edges, exact source bindings, assertion/derivation records |
| Data modified | None |
| Core objects | Concept; Reference; query index |
| Invoked subprocesses | None |
| Dependencies | Pure graph validator / authorized read projections |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | General query semantics, repair and pagination contracts incomplete |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | One authorized read transaction; historical source bindings differ from current display context |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-004, HPX-RQ-005, HPX-RQ-014, HPX-RQ-015, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md); section IDs HPX-EV-0535, HPX-EV-0376, HPX-EV-0612, HPX-EV-0663 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-006.008 — Discover contextual logical equivalence

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-006.008 |
| Name | Discover contextual logical equivalence |
| Parent process | HPX-PROC-006 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Keep contextual equivalence, predicate identity and proof status distinct; no automatic unification of custom words or existing facts |
| Actors / initiating event | User explicitly investigates equivalence |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | User explicitly investigates equivalence; exact predicate definitions, context and evidence |
| Outputs | Reviewed equivalence claim or unresolved hypothesis |
| Internal transformation | Keep contextual equivalence, predicate identity and proof status distinct; no automatic unification of custom words or existing facts |
| Data read | Expansion edges, exact source bindings, assertion/derivation records |
| Data modified | Unspecified versioned discovery/review records |
| Core objects | PredicateDefinition; equivalence claim; context |
| Invoked subprocesses | None |
| Dependencies | Pure graph validator / authorized read projections |
| State changes | Unspecified versioned discovery/review records |
| Transaction boundary | Unspecified inference/proof acceptance protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Discovery procedure, context algebra, proof evidence and acceptance tests are not selected |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | One authorized read transaction; historical source bindings differ from current display context |
| Contract / postcondition | A discovered equivalence is not a new identity equality or a verified proof merely by presentation |
| Requirement seed paths | HPX-RQ-002, HPX-RQ-004, HPX-RQ-005, HPX-RQ-014, HPX-RQ-015, HPX-RQ-028, HPX-RQ-029 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md); section IDs HPX-EV-0535, HPX-EV-0376, HPX-EV-0612, HPX-EV-0663 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
