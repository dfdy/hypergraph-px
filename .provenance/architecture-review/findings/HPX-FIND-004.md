# HPX-FIND-004 — Working branches have not passed their required integrated lifecycle

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Verification gap / data integrity risk

## Severity

High

## Confidence

High

## Confirmed versus hypothetical

Confirmed remaining gate; no failing app workflow demonstrated

## Affected components / scope

Gated branch/checkpoint/reference increment

## Affected processes

HPX-PROC-004.005, HPX-PROC-008

## Priority and dependency gate

P1 — before enabling branch/working capabilities

## Likelihood / evidence limit

Integration failure likelihood unknown; evidence absence is certain.

## Problem

Backend, transport and component checks do not establish actual branch-switch undo/recovery, live checkpoint capture, lost/delayed acknowledgement, text promotion and separately retried replacement across HTTPS/SQLite/restart. The general Provenance panel reader for working-source Fork also remains unconnected.

## Architectural consequences

Advertising these capabilities prematurely could expose source/context confusion or incomplete inspection despite sound local primitives. The current non-advertisement is a useful containment boundary.

## Reproduction / demonstration

Latest state explicitly lists unexecuted runtime/reader/below-widget gates. The bounded abstract review model catches hypothetical wrong-branch acknowledgement and partial-publication mutants but cannot establish implementation correctness.

## Alternative interpretations

This is unfinished authorized work rather than a known implementation bug. Existing committed-passage features retain their prior acceptance.

## Possible remedies

Keep capabilities gated; connect missing reader, then execute the exact synthetic matrix already demanded by ADR019, including crash between text Commit and replacement and original receipt replay.

## Trade-offs

A narrow test-only capability setup exercises code without publishing unsupported UI. More unit tests alone will not close the cross-subsystem gate.

## Recommended next action

On a future implementation resume, finish the reader and one real isolated lifecycle before widening scope. No implementation is performed here.

## Human architectural approval

No new design approval for existing adopted scope; explicit resume is needed after the owner stop.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:442](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | Added gated frontend branch review/selection, independent document/branch buffer identities, branch-scoped child Save/Commit, frozen retries, all-buffer lock quiescence and separate CodeMirror state/selection/undo/scroll caches. Adaptive protected capture saves the captured pending source and uses atomic WorkingCopy only when its bytes differ from the current committed snapshot; exact committed source retains the existing clipboard path. Added wo |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:340](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | On a future owner resume, reconcile the unverified signing experiment before the next build/handoff: development-signing helpers and imports in manual-runtime-update.mjs/refresh-manual-runtime.mjs currently validate the installed identity, but signature validity is **not** evidence of Keychain continuity. Do not deploy the experimental signer as a claimed fix. Choose an owner-approved Apple-issued signing route or explicitly restore the prior dev |
| [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:75](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) | ## Required checks before delivery |
