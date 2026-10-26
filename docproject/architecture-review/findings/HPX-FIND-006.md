# HPX-FIND-006 — Working-source capture repeats whole-source serialization and validation

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Inefficiency / potential opportunity

## Severity

Medium

## Confidence

Medium

## Confirmed versus hypothetical

Code-supported hypothesis; no measured bottleneck

## Affected components / scope

Gated WorkingCopy and private reference reads

## Affected processes

HPX-PROC-008.003, HPX-PROC-008.004, HPX-PROC-008.006

## Priority and dependency gate

P2 — investigate after integration correctness

## Likelihood / evidence limit

Repeated work is present; user-visible latency unknown.

## Problem

Working requests carry complete text plus selected quote; validation serializes them to enforce wire-size limits. Source view reconstruction is repeated from private-reference paths. A required pending save plus checkpoint can logically persist N bytes in Draft and N+Q in retained checkpoint payload, before JSON/envelope overhead.

## Architectural consequences

Time and transient memory scale at least linearly with source bytes; repeated exact-source resolution across K entries can approach O(KN) bytes processed without an authorization-safe transaction cache. This estimate is conditional on shared sources and actual call paths, not a benchmark.

## Reproduction / demonstration

Static call inspection identifies serialization and source_view calls. N≤2 MiB, Q≤N currently; 2N+Q is logical stored source duplication, not exact SQL bytes. JSON escaping can expand a control-heavy payload and is explicitly bounded/rejected.

## Alternative interpretations

Repeated validation intentionally catches tampered/authenticated references. The small bounded list and text ceiling may make cost acceptable.

## Possible remedies

Profile large mixed-Unicode/control-character capture and list reads. If needed, cache validated immutable source within one authorized read transaction and avoid duplicate serialization using an exact bounded encoder.

## Trade-offs

Cross-transaction caching risks stale permission/context. Public plaintext hashes or global dedup would change privacy/identity assumptions and are not justified by this finding.

## Recommended next action

Measure allocation/serialization/decryption counts per operation before refactoring; preserve exact bytes and fail-closed bounds.

## Human architectural approval

Routine bounded optimization can follow specifications; privacy/format changes require owner decision.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [crates/storage/src/working.rs:151](../../../crates/storage/src/working.rs) | if serde_json::to_vec&#40;request&#41; |
| [crates/storage/src/working_clipboard.rs:222](../../../crates/storage/src/working_clipboard.rs) | let view = working::source_view&#40;cipher, db, catalog, source.clone&#40;&#41;&#41;?; |
| [crates/storage/src/lib.rs:32](../../../crates/storage/src/lib.rs) | pub const MAX_TEXT_BYTES: usize = 2 * 1024 * 1024; |
