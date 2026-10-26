# HPX-FIND-017 — Quality acceptance lacks measurable workloads and platform thresholds

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Verification gap / excessive specification placement

## Severity

Medium

## Confidence

High

## Confirmed versus hypothetical

Confirmed assurance gap

## Affected components / scope

Performance, accessibility, recovery and portability

## Affected processes

HPX-PROC-004, HPX-PROC-018.003

## Priority and dependency gate

P2 before broader quality claims

## Likelihood / evidence limit

Coverage gap certain; practical dissatisfaction unknown.

## Problem

Some interaction details are precise (desktop widths, source-neutral widgets and tooltip delay), while generic assurance sections defer performance, accessibility and platform thresholds. Exact UI constraints are owner requirements, not defects; their repetition across levels increases maintenance cost when no single current assurance matrix exists.

## Architectural consequences

A feature can pass examples yet have no agreed latency, workload size, keyboard/screenreader or failure budget. Repeated presentation details may drift while major quality risks remain unmeasurable.

## Reproduction / demonstration

The testing strategy explicitly forbids fabricated benchmark/WCAG/platform claims and provides generic threshold text. Existing synthetic desktop evidence is valuable but narrower than full quality acceptance.

## Alternative interpretations

Early local scope may intentionally prioritize source correctness over performance and broad platform support. Do not manufacture numerical targets.

## Possible remedies

Create a small owner-reviewed quality scenario matrix: input size, concurrent contexts, operation, environment, required behavior and measurement; keep detailed presentation values in one source with cross-references.

## Trade-offs

Premature hard targets can constrain implementation without user value. Choose workloads from actual use and clearly label observations versus acceptance thresholds.

## Recommended next action

Agree first supported workloads and accessibility scenarios before scale/conformance claims.

## Human architectural approval

Yes for new acceptance thresholds; measuring current behavior is routine.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/08-assurance/testing-strategy.md:51](../../../docs/08-assurance/testing-strategy.md) | ## Pass/fail or measurement thresholds |
| [docs/06-subsystems/frontend-interaction.md:270](../../../docs/06-subsystems/frontend-interaction.md) | Records carry unitKind &#40;sentence, paragraph or section&#41;, independent of the transformation kind and direction. Sentence labels remain inline. Paragraph/section rows reserve 22px above their source line and reuse the same glyphs, individual actions, 1500 ms tooltip delay and source-neutral selection behavior. No Markdown blank lines are inserted. The Navigator reserves matching space and renders the same row geometry; its controls remain inert. |
| [docs/03-requirements/acceptance-criteria.md:1](../../../docs/03-requirements/acceptance-criteria.md) | # Acceptance and Conformance |
