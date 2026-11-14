# HPX-FIND-003 — Recoverable-index repair is a named responsibility without a complete protocol

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Missing specification / data integrity risk

## Severity

High

## Confidence

High

## Confirmed versus hypothetical

Confirmed specification gap

## Affected components / scope

Local corruption recovery, future general indexes

## Affected processes

HPX-PROC-003.006, HPX-PROC-014

## Priority and dependency gate

P1 — before claiming corruption recovery

## Likelihood / evidence limit

Corruption frequency unmeasured; consequences are high if repair is attempted.

## Problem

The architecture calls indexes recoverable but does not exhaustively classify every catalog/head/private-reference/assertion index as canonical or derived, define authoritative rebuild inputs, or specify deterministic head choice, quarantine, repair atomicity and interrupted repair recovery. Mutable acknowledged drafts are authoritative state, not disposable indexes.

## Architectural consequences

A future repair tool might invent a current head from unordered history, lose the latest acknowledged draft, or silently erase opaque optional records. Current fail-closed corruption behavior is safer than an unspecified repair.

## Reproduction / demonstration

The record document’s index section is generic scaffolding. Compare actual mutable slots and encrypted receipts: a save receipt digest alone is insufficient to recreate overwritten draft text.

## Alternative interpretations

A fail-closed first slice may intentionally defer repair. That is acceptable if explicitly framed as a limitation and not a rebuild guarantee.

## Possible remedies

Create an authoritative/derived-state matrix and repair design: exact inputs, authorization, deterministic output, preserving originals, backup/quarantine, atomic swap and interruption tests.

## Trade-offs

Retaining full request text solely for repair increases plaintext-history sensitivity and storage; refusing repair preserves integrity but reduces availability.

## Recommended next action

Design a minimal offline audit report before any mutating repair; define which acknowledged data can only come from a valid backup.

## Human architectural approval

Yes for reconstruction/repair policy and any retention change.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/04-architecture/component-architecture.md:57](../../../docs/04-architecture/component-architecture.md) | - Durable publication order, writer isolation, fsync/recovery, integrity verification, index rebuilding and draft acknowledgements. |
| [docs/07-implementation/data-structures/sqlite-records.md:44](../../../docs/07-implementation/data-structures/sqlite-records.md) | ## Indices and operations |
| [docs/08-assurance/recovery.md:34](../../../docs/08-assurance/recovery.md) | ### Failure and recovery |
