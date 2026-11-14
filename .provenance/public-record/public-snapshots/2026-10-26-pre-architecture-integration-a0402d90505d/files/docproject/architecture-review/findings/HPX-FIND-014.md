# HPX-FIND-014 — Concurrent structural acceptance needs more than local acyclicity

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Data integrity risk / missing specification

## Severity

High

## Confidence

High for counterexample

## Confirmed versus hypothetical

Confirmed mathematical risk; future mechanism absent

## Affected components / scope

Future federation and multi-user structure

## Affected processes

HPX-PROC-005.005, HPX-PROC-017.002

## Priority and dependency gate

P1 before collaboration/federation architecture commitment

## Likelihood / evidence limit

Counterexample certain under naive union; actual future policy unselected.

## Problem

Two locally accepted acyclic expansion updates may form a cycle when combined. Single-parent occurrence constraints can likewise conflict. The local Kahn validator checks a supplied projection; it does not choose a globally convergent rejection/acceptance policy or prove the caller closure complete.

## Architectural consequences

Replicas might accept different documents or repeatedly reject each other without a specified causal/authority conflict rule. Reading order and DAG order cannot substitute for conflict semantics.

## Reproduction / demonstration

Actual review counterexample in model-results.json: A accepts X→Y, B accepts Y→X; each is acyclic, union is cyclic. This is independent of text CRDT correctness.

## Alternative interpretations

The architecture explicitly recognizes federation as gated. No claim that current local operation is defective follows.

## Possible remedies

Specify authoritative operation identity, causal context, deterministic structural acceptance/conflict representation, rights evaluation and partial-knowledge behavior before choosing replication transport.

## Trade-offs

Central ordering simplifies validity but changes availability/authority; decentralized deterministic conflict policy needs explicit user-visible outcomes and retained rejected proposals.

## Recommended next action

Owner chooses availability/conflict semantics after a two-replica bounded model; do not infer MLS solves graph convergence.

## Human architectural approval

Yes — distributed authority and conflict semantics.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/05-domain/hypergraph-mathematics.md:46](../../../docs/05-domain/hypergraph-mathematics.md) |  /  Expansion  /  Directed acyclic dependency projection  /  Recursively included content; reject accepted expansion cycles  /  |
| [docs/04-architecture/component-architecture.md:56](../../../docs/04-architecture/component-architecture.md) | - Ordered placement representation, structural conflict acceptance and live text/branch concurrency semantics; a text CRDT does not validate graph moves. |
| [docs/07-implementation/algorithms/expansion-validation.md:44](../../../docs/07-implementation/algorithms/expansion-validation.md) | The implementation uses iterative Kahn validation and ordered maps. Parallel edges and repeated dependencies are valid. A successful run spends exactly 2V + 2E defined work units, stores O&#40;V + E&#41; data and performs O&#40;&#40;V + E&#41; log V&#41; ordered-map work &#40;with a constant empty case&#41;. It mutates no input and does not require storage, network, keys or a principal. Its caller must supply the complete correct projection and authorize any records used to bui |
