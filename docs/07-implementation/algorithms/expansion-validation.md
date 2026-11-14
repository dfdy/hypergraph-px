# Bounded expansion DAG validation


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-026-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-026-02` [Mathematical definition](#mathematical-definition) | [hpx.native.domain.projection_expansion](../../05-domain/diagrams/graph-projections.c4) · `HPX-CAN-025` · [concept_graph_projections](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-026-03` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-ALGO-001`
- **Title:** Bounded expansion DAG validation
- **Purpose:** Bounded Kahn expansion validation and its exact work/error contract.
- **Level:** `07-implementation`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-DOM-002](<../../05-domain/hypergraph-mathematics.md>); [HPX-API-001](<../../06-subsystems/interfaces/domain-navigation.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-30

Only the spend helper has an extracted-Rust proof. Graph examples/oracle tests are separate evidence.

**Policy boundary, HPX-OWNER-041:** this existing validator still rejects cycles in its supplied finite DAG projection; its implementation and original tests are unchanged. It is not a validator of the newly accepted cyclic saved-inclusion graph and does not implement cycle-boundary expansion or UI navigation. Any reuse must declare the separate acyclic projection it validates; the [new policy](../../05-domain/hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041) and [required unproved Lean obligations](../formal-invariants.md#required-cycle-aware-expansion-proofs--hpx-owner-041) do not follow from its old evidence.


## Mathematical definition

Actual source: [expansion.rs](../../../backend/crates/domain/src/expansion.rs). The validator bounds vertices, edges and charged work, rejects undeclared/duplicate vertices/endpoints and cycles, and computes an elimination order with Kahn's algorithm. Parallel edges and disconnected isolated vertices remain valid where acyclic. Five original tests include exhaustive comparison of all512 three-vertex directed graphs with a separate reachability oracle. Exact error/work rules belong to the source API and preserved data reference; no inferred federation ordering or new algorithm is adopted. Only the private spend helper has extracted-Rust assurance.

### 9. Implemented initial Rust API

Source `HPX-SRC-0026`, original lines 131–138. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

[`hypergraph_domain::expansion::validate`](<../../../backend/crates/domain/src/expansion.rs>) accepts an explicit vertex list, directed expansion edges and a `Budget { vertices, edges, work }`. IDs are opaque ordered values supplied by the caller; no persistent ID or wire format is chosen. It returns `Validated { vertices, edges, work }` or `Error::{Budget, DuplicateVertex, UnknownVertex, Cycle}`.

The implementation uses iterative Kahn validation and ordered maps. Parallel edges and repeated dependencies are valid. A successful run spends exactly 2V + 2E defined work units, stores O(V + E) data and performs O((V + E) log V) ordered-map work (with a constant empty case). It mutates no input and does not require storage, network, keys or a principal. Its caller must supply the complete correct projection and authorize any records used to build it. It is not a renderer, forest-owner validator, durable commit or permission grant.

Five tests cover repeated/parallel/isolated dependencies, self/long/disconnected cycles, invalid vertex catalogues/endpoints and exact independent budgets. The last exhaustively checks all 512 directed graphs on three vertices against an independent transitive-closure oracle, with reversed input order and input preservation. Actual execution evidence belongs to the issue/work record; these tests are not Lean/Rust correspondence proofs. Separate rank/path model theorems are checked, as documented in the formal-assurance record.


## Source provenance

- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 131–138; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../02-governance/registers/source-manifest.csv>); archive is local/ignored.
