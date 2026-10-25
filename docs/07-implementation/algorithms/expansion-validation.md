# Bounded expansion DAG validation

## Common metadata

- **ID:** `HPX-ALGO-001`
- **Title:** Bounded expansion DAG validation
- **Purpose:** Bounded Kahn expansion validation and its exact work/error contract.
- **Level:** `07-implementation`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-DOM-002](<../../05-domain/hypergraph-mathematics.md>); [HPX-API-001](<../../06-subsystems/interfaces/domain-navigation.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Only the spend helper has an extracted-Rust proof. Graph examples/oracle tests are separate evidence.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Problem and assumptions

Bounded Kahn expansion validation and its exact work/error contract. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Inputs and outputs

Bounded Kahn expansion validation and its exact work/error contract. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Preconditions

Bounded Kahn expansion validation and its exact work/error contract. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Mathematical definition

Actual source: [expansion.rs](../../../crates/domain/src/expansion.rs). The validator bounds vertices, edges and charged work, rejects undeclared/duplicate vertices/endpoints and cycles, and computes an elimination order with Kahn's algorithm. Parallel edges and disconnected isolated vertices remain valid where acyclic. Five original tests include exhaustive comparison of all512 three-vertex directed graphs with a separate reachability oracle. Exact error/work rules belong to the source API and preserved data reference; no inferred federation ordering or new algorithm is adopted. Only the private spend helper has extracted-Rust assurance.

### 9. Implemented initial Rust API

Source `HPX-SRC-0026`, original lines 131–138. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

[`hypergraph_domain::expansion::validate`](<../../../crates/domain/src/expansion.rs>) accepts an explicit vertex list, directed expansion edges and a `Budget { vertices, edges, work }`. IDs are opaque ordered values supplied by the caller; no persistent ID or wire format is chosen. It returns `Validated { vertices, edges, work }` or `Error::{Budget, DuplicateVertex, UnknownVertex, Cycle}`.

The implementation uses iterative Kahn validation and ordered maps. Parallel edges and repeated dependencies are valid. A successful run spends exactly 2V + 2E defined work units, stores O(V + E) data and performs O((V + E) log V) ordered-map work (with a constant empty case). It mutates no input and does not require storage, network, keys or a principal. Its caller must supply the complete correct projection and authorize any records used to build it. It is not a renderer, forest-owner validator, durable commit or permission grant.

Five tests cover repeated/parallel/isolated dependencies, self/long/disconnected cycles, invalid vertex catalogues/endpoints and exact independent budgets. The last exhaustively checks all 512 directed graphs on three vertices against an independent transitive-closure oracle, with reversed input order and input preservation. Actual execution evidence belongs to the issue/work record; these tests are not Lean/Rust correspondence proofs. Separate rank/path model theorems are checked, as documented in the formal-assurance record.


## Pseudocode

Bounded Kahn expansion validation and its exact work/error contract. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## State transition and postconditions

Bounded Kahn expansion validation and its exact work/error contract. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Invariants and termination

Bounded Kahn expansion validation and its exact work/error contract. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Correctness argument

Bounded Kahn expansion validation and its exact work/error contract. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Complexity and resource bounds

Bounded Kahn expansion validation and its exact work/error contract. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Failure cases and test vectors

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Source provenance

- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 131–138; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
