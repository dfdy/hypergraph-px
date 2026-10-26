# HPX-FIND-019 — Formal correspondence should target cross-subsystem contracts incrementally

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Potential opportunity / verification gap

## Severity

Medium

## Confidence

High

## Confirmed versus hypothetical

Confirmed assurance boundary; proposed next step

## Affected components / scope

Publication, checkpoint promotion and request reconciliation

## Affected processes

HPX-PROC-003, HPX-PROC-008, HPX-PROC-018.001

## Priority and dependency gate

P2 — after closing immediate integration gaps

## Likelihood / evidence limit

Potential benefit supported; no proof defect found.

## Problem

Existing proofs accurately disclose their narrow scope. Cross-subsystem properties—late acknowledgement preserving newer source, source-type separation, atomic publication/receipt, and failure-independent post-Commit replacement—remain primarily executable-test contracts. The review model checks an abstraction, not extracted Rust or browser execution.

## Architectural consequences

Correct local validators do not by themselves prevent context or ordering errors in the complete workflow. A whole-application proof would be disproportionate and is not implied by current formal evidence.

## Reproduction / demonstration

The review explores 8,131 abstract states/18,317 transitions through depth 10, and finds short counterexamples in three deliberately wrong variants. Those mutants are not HPX defects. Crypto/fsync/auth revocation/Unicode are outside the model.

## Alternative interpretations

Existing integration/fault tests may provide sufficient practical assurance; formalization is an opportunity, not a prerequisite invented by this review.

## Possible remedies

Promote a few critical invariants into reusable state-machine contracts and property/fault tests; consider extraction/model correspondence only where source/toolchain boundaries are tractable.

## Trade-offs

Every extra model needs correspondence maintenance. Strong claims about code require extraction/refinement evidence, not a bigger handwritten state machine.

## Recommended next action

Keep the small model as review evidence and select one high-value property for implementation-connected checking after integration.

## Human architectural approval

No new approval for analysis; choosing new acceptance/proof obligations needs owner review.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/08-assurance/formal-validation-digest.md:26](../../../docs/08-assurance/formal-validation-digest.md) | **Evidence date:** 2026-10-24. **Toolchain:** Lean/Lake 4.35.0. **Current inventory:** four checked Lean model theorems and one checked theorem about an Aeneas-extracted real Rust helper. The full Rust graph validator remains unproved. This is a maintained evaluation record for developers and mathematicians, not a claim that the application or Rust graph algorithm is formally verified. |
| [docs/08-assurance/formal-validation-digest.md:44](../../../docs/08-assurance/formal-validation-digest.md) |  /  Internal &#96;expansion::spend&#96;  /  Charon extraction from unchanged Rust, Aeneas translation, exact generated-source replay and &#96;spend_spec&#96; theorem  /  **Extracted semantics checked.** Exhaustion preserves the counter; successful accounting increments once without overflow/panic. This trusts the extraction/translation/backend boundary; see §7.  /  |
| [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md) | # Draft acknowledgement and atomic commit protocol |
