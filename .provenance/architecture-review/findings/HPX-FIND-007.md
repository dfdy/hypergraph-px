# HPX-FIND-007 — One workspace mutex can couple slow crypto and reads to edit latency

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Scalability risk / architectural coupling

## Severity

Medium

## Confidence

Medium

## Confirmed versus hypothetical

Confirmed serialization structure; impact hypothetical

## Affected components / scope

Current local runtime contention

## Affected processes

HPX-PROC-002.003, HPX-PROC-003, HPX-PROC-006, HPX-PROC-016.003

## Priority and dependency gate

P2 — before multi-user/performance claims

## Likelihood / evidence limit

Contention possible; workload incidence unknown.

## Problem

The service admits bounded workers but routes workspace work through shared state. KDF or a long authorized storage/read operation may serialize other requests. The socket deadline prevents stale queued work from starting but is not cancellation of an executing KDF or transaction.

## Architectural consequences

A slow unlock/query/capture can delay Save or lock response and create unknown transport outcomes. Sixteen ingress workers do not mean sixteen parallel workspace operations; local single-user scope limits expected load.

## Reproduction / demonstration

Static runtime lock acquisition and documented deadline limit confirm structure. Argon2 uses 64 MiB per derivation; do not multiply by sixteen as if all derivations run concurrently under the same lock.

## Alternative interpretations

Coarse serialization is a deliberate simple consistency boundary and may be entirely adequate for one user.

## Possible remedies

Measure concurrent save/history/unlock/lock workloads. If needed separate session state and safe immutable reads or use an explicit bounded coordinator queue while preserving current authorization and writer ordering.

## Trade-offs

Finer locks/read caches increase race and stale-authority risks; a new server architecture is not justified without measurements.

## Recommended next action

Publish supported latency/load budgets and profile contention before changing concurrency.

## Human architectural approval

No approval for measurement; concurrency/authorization redesign should be reviewed.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [crates/runtime/src/main.rs:859](../../../crates/runtime/src/main.rs) | Ok&#40;r&#41; =&gt; match state.lock&#40;&#41; { |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:72](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | The next independent transport checks found and corrected fragmented-header limit overshoot and repeated delimiter rescanning. Header termination must fit within 16 KiB, independent of read fragmentation; scanning retains only the necessary three-byte overlap. Socket reads/writes, including internal TLS record/handshake I/O, share one ten-second deadline rather than a per-read inactivity timeout. Requests whose deadline elapsed while waiting for  |
| [docs/06-subsystems/interfaces/browser-runtime.md:146](../../../docs/06-subsystems/interfaces/browser-runtime.md) | The current runtime bounds complete headers to 16 KiB, including fragmented reads; body declarations remain bounded to 14 MiB and duplicate framing fields are rejected. Header delimiter scanning is linear. A single ten-second deadline covers underlying socket reads/writes through TLS and is checked before a queued route starts. It does not cancel an already executing storage/KDF operation; unknown outcomes still reconcile via the same operation I |
