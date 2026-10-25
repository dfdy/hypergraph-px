# Hypergraph Mathematics

## Common metadata

- **ID:** `HPX-DOM-002`
- **Title:** Hypergraph Mathematics
- **Purpose:** Constrained graph projections, traversal bounds and separation of structural/reference cycles.
- **Level:** `05-domain`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Formal meanings do not imply every type or operation is implemented. See implementation discrepancies and requirement evidence separately.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Vocabulary and mathematical notation

Constrained graph projections, traversal bounds and separation of structural/reference cycles. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Entities and identities



### Mathematical data model

Source `HPX-SRC-0025`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: required semantics with implementation boundaries, 2026-10-24. Exact Rust record schemas and wire encodings remain to be implemented. [The data reference](<../06-subsystems/interfaces/domain-navigation.md>) identifies actual APIs.

### Typed temporal multigraph

Source `HPX-SRC-0025`, original lines 5–19. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Represent the workspace as immutable canonical records and typed relationships with derived projections. Multiple edges between the same endpoints may carry different types, occurrence context, order and provenance. Do not impose one global graph constraint on every relationship.

| Projection | Mathematical constraint | Meaning |
|---|---|---|
| Composition | Ordered rooted forest of placement occurrences in a resolved view | Authorial structure and reading order |
| References | Typed directed multigraph, cycles allowed | Hyperlinks, citations and semantic assertions |
| Expansion | Directed acyclic dependency projection | Recursively included content; reject accepted expansion cycles |
| Revision ancestry | Immutable same-identity DAG | Content/manifest evolution, branches and merge parents |
| Derivation | Explicit cross-identity lineage through transformation events | Fork, extraction, split, merge and reuse provenance |
| Snapshot closure | Finite exact bindings for all reachable occurrence contexts | Historically fixed document reconstruction |

Dependency/topological order is not authorial reading order. A semantic assertion or recorded derivation is neither a proof of logical entailment nor an authority grant.

### Algorithms, bounds and validation

Source `HPX-SRC-0025`, original lines 44–52. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Every traversal declares its edge projection, consistent view, authorization scope, ordering, duplicate/cycle behavior and work/output bounds. Reachability costs O(V+E) over the visited projection before index overhead; full rendering additionally costs at least its emitted bytes/occurrences. Repeated expansion can exceed the number of unique records, so budgets must bound expanded output and context growth as well.

Validate unique placement ownership, complete endpoints, same-identity parents, transformation coverage, expansion acyclicity and snapshot closure before publication. Cross-owner mutations recheck every affected expected head and policy atomically. Request/storage exhaustion rejects work without silently pruning history. A recoverable index cannot become historical authority.

The implemented `expansion::validate` is a bounded Kahn validator over caller-supplied vertices and edges; it does not implement the entire model above. Four Lean rank/path theorems check a mathematical acyclicity model, and the actual Rust budget helper has an extracted proof. Full graph-validator correspondence and the additional invariants remain unproved. See the [validation digest](<../07-implementation/formal-invariants.md>).

### 2. Typed graph projections

Source `HPX-SRC-0026`, original lines 31–41. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- **Occurrence structure:** an ordered rooted forest per resolved document view. Sharing happens through occurrence→content references, not by giving a single placement multiple structural parents.
- **Revision ancestry:** an immutable same-node DAG; divergent revisions remain retained and merge parents cannot name unrelated identities.
- **Transformation provenance:** an incidence graph linking immutable input revisions to an event and that event to output revisions. Source context/ranges matter for split/extraction and ordered multi-source merges.
- **References/semantic links:** a typed directed multigraph; hyperlinks/self-links may cycle. An asserted semantic relation is not proof or permission.
- **Expansion dependencies:** a separately validated projection. Reject recursive expansion cycles; hyperlinks remain a different projection. Untrusted cyclic imports must fail validation rather than become accepted complete states.
- **Snapshot resolution:** a finite context graph recording every required occurrence binding, including nested/repeated and revision/closure-pinned uses.

Store canonical records once and derive graph indexes; do not create one independent authoritative database per projection. Topological dependency order is not authorial reading order. Wall-clock timestamps are display/search metadata, not ancestry or accepted-operation ordering.


## Relationships and permitted states

Constrained graph projections, traversal bounds and separation of structural/reference cycles. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Operations and transitions

Constrained graph projections, traversal bounds and separation of structural/reference cycles. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Invariants

Constrained graph projections, traversal bounds and separation of structural/reference cycles. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Unresolved semantics

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Verification/proofs

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 1–4; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 5–19; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 44–52; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 31–41; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
