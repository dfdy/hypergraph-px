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
- **Last reviewed:** 2026-11-01

Formal meanings do not imply every type or operation is implemented. See implementation discrepancies and requirement evidence separately.


## Entities and identities


### Mathematical data model

Source `HPX-SRC-0025`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: required semantics with implementation boundaries, 2026-10-24. Exact Rust record schemas and wire encodings remain to be implemented. [The data reference](<../06-subsystems/interfaces/domain-navigation.md>) identifies actual APIs.

### Accepted cycle-aware inclusion policy — HPX-OWNER-041

The [Pure domain expansion responsibility](../../architecture/C3/pure-domain.c4) records the accepted scope. Cyclic inclusion relationships are valid saved content. This supersedes the inherited blanket rejection of cyclic inclusion below; revision ancestry remains an immutable same-identity DAG and ordinary reference cycles remain distinct. It is accepted product behaviour, not current implementation or an adopted persistence format.

Automatic expansion must produce a finite result: on encountering a cycle-closing dependency in the exact selected expansion state, stop that branch and retain an explicit boundary identifying the exact inclusion/target context under current permission. Show a visible, accessible warning and offer deliberate click-through navigation. One click may open the authorised target as a new bounded navigation action; it must never trigger unbounded recursive opening, rendering, calculation or background fetching. Repeated clicks may revisit the cycle; the data and navigation history are not silently rewritten to remove it. A traversal requiring acyclicity must report that the cyclic input is unsupported rather than treat a cut result as an acyclic original graph.

Repeated sibling uses are not cycles. Finite historical inclusion is allowed even when logical identities repeat. Detection must use exact selected revision/closure and dependency semantics, not logical identity alone; an ever-growing occurrence path alone cannot detect recurrence. OWNER045 selects the [finite selected-state table/use-tree semantic basis](../../architecture/proposals/finite-cycle-closure-state.md),with structural row equality and exact target/ancestor witnesses. OWNER047 selects retained original including-source notation with separate warning/navigation metadata; see the [precise source-emission scope](../../architecture/proposals/cycle-boundary-source-emission.md). Physical encoding and authenticated source/parser correspondence remain open. Resource exhaustion is a separate explicit incomplete/error outcome, not evidence of a cycle or a complete closed result.

Completeness is relative to the explicit cycle-boundary rule: account for every required expanded use and every stopped cycle-closing dependency, preserve exact selected targets and reconstruction inputs, and stop only where that rule authorises it. A warning is not permission to omit inaccessible/missing dependencies or silently substitute current heads. Historical reconstruction must reproduce the same boundary decisions from frozen inputs and policy. This does not adopt flat closure storage, a new marker record or a renderer format.

The mandatory [Lean proof obligations](../07-implementation/formal-invariants.md#required-cycle-aware-expansion-proofs--hpx-owner-041) now have checked finite typed-table traversal/coverage and warning/navigation model results;source-emitter,operational-resource and Rust/UI correspondence remain open. [The digest](../08-assurance/formal-validation-digest.md#finite-cycle-state-model--2026-10-31) states exact assumptions and limitations. Existing DAG tests/theorems and budget-helper extraction retain their distinct original scope.

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


## Source provenance

- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 1–4; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 5–19; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 44–52; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 31–41; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.

## Creation context versus graph structure — HPX-OWNER-048

All node kinds satisfy the [canonical creation-origin precondition](../../architecture/Conceptual/identity-closure.c4) and [precise context distinctions](core-object-model.md#creation-origin-and-placement--hpx-owner-048), HPX-RQ-039. A node cannot be created with unknown/ambiguous origin or parent/position. This does not impose one permanent containment parent on logical content, turn root context into a structural parent, change accepted cyclic inclusions or allow revision-ancestry cycles. Structural occurrence placement and textual notation are separate questions; lack of inline notation is not evidence of an unplaced node. Current Lean results do not prove this creation precondition or its implementation.
