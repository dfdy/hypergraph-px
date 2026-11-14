# HPX-FIND-009 — Additive branch records lack actual older-reader preservation evidence

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Verification gap / interoperability risk

## Severity

High

## Confidence

High

## Confirmed versus hypothetical

Confirmed remaining compatibility gate

## Affected components / scope

Gated kinds 20–27 and strict command outcomes

## Affected processes

HPX-PROC-003.007, HPX-PROC-008

## Priority and dependency gate

P1 — before enabling branch/working writes

## Likelihood / evidence limit

Unknown compatibility failure probability; evidence absence certain.

## Problem

Wrapper tests establish shape/authentication for new records, but do not establish that an actual older executable preserves them during ordinary writes, or that old-reader writes safely invalidate cached working-base assumptions. Strict new receipt outcomes cannot be reconciled by unaware clients merely because HTTP contract remains 1.

## Architectural consequences

An unaware writer might preserve opaque rows yet make cached working lineage stale; supported readers need honest capability/receipt limits. Independent version domains are correct but require a compatibility matrix.

## Reproduction / demonstration

Earlier recorded old-reader checks cover prior optional kinds; the newest checkpoint explicitly lists 20–27 as pending. No old binary is executed during this review.

## Alternative interpretations

New features are currently gated, containing the exposure. Generic tables do permit opaque preservation, but that is a design claim until exercised.

## Possible remedies

Execute a representative old/new reader matrix with byte-identical optional ciphertext checks and current-reader revalidation after old Save/Commit. Specify command/outcome support separately from ordinary document compatibility.

## Trade-offs

Requiring a minimum reader is simpler than preserving every old behavior but changes rollout/backup expectations; do not bump unrelated formats automatically.

## Recommended next action

Close the actual matrix before advertising capabilities or accepting persistent real data in this increment.

## Human architectural approval

No new approval for existing required tests; incompatible rollout policy needs owner approval.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:452](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | On a future owner resume: connect the kind27 Working Fork reader to the general Provenance panel; test actual branch/working source workflows behind explicit test-only capability setup; complete actual older-reader preservation for20–27, frozen lost/delayed acknowledgement/source and branch-switch undo/restart checks, exact publication/replacement recovery and both-theme source-under-widget visuals. Only then enable advertised capabilities and ru |
| [docs/07-implementation/data-structures/sqlite-records.md:91](../../../docs/07-implementation/data-structures/sqlite-records.md) | This is an optional record in the existing generic slots layout; SQL schemas 1/2, original nine payload layouts, HGOB/HGWK and contract 1 stay unchanged. Readers that do not implement the clipboard can continue ordinary document reads/writes while preserving its opaque slot. They do not implement the new capability or parse its added receipt outcome. A pre-clipboard tested build opened, saved and committed an isolated upgraded workspace while pre |
| [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:71](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) | Before durable writes are enabled, specify whether an existing workspace gets working metadata lazily or through an explicit backed-up upgrade, and how an older reader&#x27;s ordinary writes invalidate any cached working-base claims. A missing checkpoint is an error, never permission to reconstruct it from a newer draft. Old readers must preserve unknown optional ciphertext byte-for-byte, or the upgrade must explicitly require a newer reader with back |
