# HPX-FIND-008 — Application authorization is concentrated in the storage crate

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Architectural coupling / maintainability concern

## Severity

Medium

## Confidence

High for structure; medium for remedy

## Confirmed versus hypothetical

Confirmed implementation concentration; improvement proposal

## Affected components / scope

Storage feature growth and alternate interfaces

## Affected processes

HPX-PROC-003, HPX-PROC-008, HPX-PROC-015.006

## Priority and dependency gate

P2 — before a second command transport

## Likelihood / evidence limit

Growth-driven maintenance risk; no present dependency cycle demonstrated.

## Problem

The intended application responsibility is separate from persistence, but the present storage crate hosts principal/device checks, command dispatch/replay and transaction orchestration. Sibling feature modules share the parent namespace. Cargo dependencies are acyclic and domain remains dependency-free; no missing microservice is implied.

## Architectural consequences

Adding MCP/providers may tempt duplication of authorization/expected-state semantics. Shared namespace access makes it harder to identify the minimum privilege/data interface for each feature.

## Reproduction / demonstration

Static dependency report: five local crates, six path edges, no local crate SCC; 52 frontend modules/101 recognized imports/no static SCC. Thirty-eight storage super::* occurrences include tests, not thirty-eight production cycles.

## Alternative interpretations

A single crate can contain well-separated layers; separate packages do not guarantee architecture. Current code may be a proportionate local slice.

## Possible remedies

First document a narrow application operation facade and storage transaction capabilities. Consider an internal application module only when a second real adapter needs it; avoid empty services.

## Trade-offs

Moving serialization or pure validation back into domain would violate adopted boundaries. Over-abstracting every feature adds indirection and transaction-lifetime complexity.

## Recommended next action

Draw a precise call/data-access map for the next interface and enforce domain purity, current-authority-before-replay and one-operation semantics.

## Human architectural approval

Routine internal separation within contracts; public API changes follow explicit compatibility policy.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/04-architecture/component-architecture.md:42](../../../docs/04-architecture/component-architecture.md) |  /  Application layer  /  Trusted principal/device resolution, command authorization, exact expected-state checks, previews and receipts  /  Planned  /  |
| [crates/storage/src/lib.rs:645](../../../crates/storage/src/lib.rs) | pub fn receipt&#40;&amp;self, id: OperationId&#41; -&gt; Result&lt;Receipt&gt; { |
| [crates/storage/src/working.rs:3](../../../crates/storage/src/working.rs) | use super::*; |
| [crates/domain/Cargo.toml:1](../../../crates/domain/Cargo.toml) | &#91;package&#93; |
