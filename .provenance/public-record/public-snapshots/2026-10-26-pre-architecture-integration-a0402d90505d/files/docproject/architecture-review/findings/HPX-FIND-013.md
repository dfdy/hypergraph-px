# HPX-FIND-013 — Remote job recovery has sound high-level states but missing executable reconciliation

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Missing specification / reliability risk

## Severity

High

## Confidence

High

## Confirmed versus hypothetical

Confirmed future recovery gap

## Affected components / scope

GitHub and other provider side effects

## Affected processes

HPX-PROC-015.004, HPX-PROC-015.005, HPX-PROC-012.005

## Priority and dependency gate

P1 before any provider write implementation

## Likelihood / evidence limit

Lost reply and remote races are ordinary distributed-system failure modes.

## Problem

The documentation correctly separates approval, local outbox and provider conditional writes, including unknown outcomes. Exact durable job schema, provider-specific identity/equality probes, lease/retry rules, cancellation, credential revocation and crash recovery remain to select.

## Architectural consequences

A naive retry could duplicate a foreign change or overwrite a concurrent remote update even though the local job appears failed. A local receipt cannot by itself prove a provider did or did not write.

## Reproduction / demonstration

Sequence: provider accepts conditional write; reply is lost; process crashes before recording success. The planned unknown state is necessary, but precise probe/reconcile behavior remains unspecified.

## Alternative interpretations

This is a deliberate future gate, not a discovered bug in an existing GitHub publisher; no such live publisher is claimed.

## Possible remedies

Define one provider operation end-to-end: frozen exact bytes/precondition, encrypted job, transition table, reconciliation evidence and user review of still-unknown state. Keep create-only backup distinct from Markdown update.

## Trade-offs

Provider APIs have different preconditions (branch expectedHeadOid versus file SHA); hiding them behind a false exactly-once abstraction harms correctness.

## Recommended next action

Design/fault-model the smallest GitHub publication before provider connection and implementation.

## Human architectural approval

Yes for connection, credentials and publication; routine mock modelling is already within future design scope.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/06-subsystems/external-integrations.md:87](../../../docs/06-subsystems/external-integrations.md) | GitHub writes cannot participate in an atomic local graph transaction. Use an encrypted/authenticated durable job/outbox with the approved input and explicit queued/running/succeeded/conflict/failed/**outcome unknown** states; add cancellation-requested/irreversible-result handling as applicable. Success needs a verified remote commit/result bound to that job and destination. A local response failure after provider success is not evidence that no |
| [docs/06-subsystems/external-integrations.md:89](../../../docs/06-subsystems/external-integrations.md) | Enforce a provider-side concurrency condition matching the promised remote-head contract. Reading a head then performing an unconditional write is a check/write race; the Contents API&#x27;s file blob SHA is not itself an expected branch-head condition. Evaluate a suitable atomic expected-head operation and prove its actual failure/retry semantics during implementation. GitHub documents file SHA in &#91;Contents API&#93;&#40;https://docs.github.com/en/rest/repos/ |
