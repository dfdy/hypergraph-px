# HPX-FIND-005 — Immutable retry receipts cause growth beyond retained text history

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Scalability risk / inefficiency

## Severity

Medium

## Confidence

High for growth; low for practical impact

## Confirmed versus hypothetical

Confirmed structural growth; resource exhaustion hypothetical

## Affected components / scope

All acknowledged local mutations

## Affected processes

HPX-PROC-003.002, HPX-PROC-003.004, HPX-PROC-018.003

## Priority and dependency gate

P2 — before long-lived workspace scale claims

## Likelihood / evidence limit

Certain asymptotic growth; capacity impact workload dependent.

## Problem

Every successful mutating operation retains an immutable encrypted receipt even though autosave overwrites mutable Draft. With S changing Save operations, receipt count is Θ(S), independent of explicit Commit count. Five-second idle is a trigger, not a mandatory perpetual save frequency.

## Architectural consequences

Long-lived editing may grow the DB and backup cost despite few committed revisions. This is not evidence that each save rewrites all historical text; receipts normally retain outcome/digest rather than the whole request.

## Reproduction / demonstration

Inspect the unconditional receipt insertion after the successful command dispatch. A hypothetical one changing save every five seconds of eight active hours gives 5,760 receipts/day; this is an input assumption, not an observed usage or size measurement.

## Alternative interpretations

Durable idempotency deliberately needs receipts; operation rate may be modest and storage cheap. No benchmark establishes an unacceptable cost.

## Possible remedies

Measure real encrypted receipt/index/WAL growth with representative workloads. Consider explicit quotas/backpressure, safe no-op suppression or owner-approved retry/retention semantics before any compaction design.

## Trade-offs

Deleting receipts can break original-result replay and violate retained-history rules. Reusing IDs for changed commands is never an optimization. Full-history pruning is not an authorized remedy.

## Recommended next action

Add storage-growth measurements to acceptance and state the supported retry horizon/retention policy before proposing mutation.

## Human architectural approval

Measurements routine; receipt expiry/erasure or semantic retention changes require owner approval.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/07-implementation/data-structures/sqlite-records.md:89](../../../docs/07-implementation/data-structures/sqlite-records.md) | An absent slot is logical generation 0 with no entries. The first changing mutation creates generation 1; later changes use encrypted slot CAS. Exact-source recapture reuses its entry and generation, while each command retains its own encrypted receipt. Empty clear does not advance generation. The private clipboard admits up to 128 entries, rejecting overflow atomically rather than pruning source history. Removing/clearing references never delete |
| [crates/storage/src/lib.rs:837](../../../crates/storage/src/lib.rs) | let receipt = Receipt { operation, outcome }; |
| [docs/04-architecture/decisions/0011-retained-history.md:1](../../../docs/04-architecture/decisions/0011-retained-history.md) | # Retained immutable committed history |
