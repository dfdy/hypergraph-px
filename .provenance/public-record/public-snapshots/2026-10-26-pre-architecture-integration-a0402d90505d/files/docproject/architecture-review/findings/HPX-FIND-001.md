# HPX-FIND-001 — Rollback acceptance wording exceeds the bounded local freshness guarantee

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Contradiction / security risk

## Severity

High

## Confidence

High for wording; no exploit demonstrated

## Confirmed versus hypothetical

Confirmed documentary tension

## Affected components / scope

Current durable-edit acceptance

## Affected processes

HPX-PROC-003, HPX-PROC-016

## Priority and dependency gate

P1 — clarify before real-data security acceptance

## Likelihood / evidence limit

Ambiguity is present; actual rollback requires an actor able to restore storage.

## Problem

The inherited threat clause says storage/application must reject rollback/replay before durable editing. The local SQLite contract expressly accepts the absence of a whole-database freshness witness. CAS and authenticated receipts reject selected stale commands; AEAD does not reject restoration of a complete authentic old database.

## Architectural consequences

A reader cannot tell whether current bounded editing is an approved exception, whether the gate means only per-operation replay, or whether durable editing is still prohibited. This is an acceptance ambiguity, not evidence that AEAD was misimplemented.

## Reproduction / demonstration

Compare the exact three passages. Thought experiment: replace the entire workspace and WAL state with an older valid consistent image. Its tags can remain authentic. No real workspace was rolled back in this review.

## Alternative interpretations

The threat clause may have meant mixed-record substitution or stale-command replay only. That interpretation is narrower than its unqualified wording and needs authority, not inference.

## Possible remedies

Clarify the threat/gate scope and explicitly accept the bounded residual risk, or design an independently retained monotonic witness and its recovery/trust model.

## Trade-offs

Narrowing the gate changes acceptance policy; an external witness adds availability, backup/restore and hostile-host dependencies and does not follow automatically from a key epoch.

## Recommended next action

Ask the owner to resolve gate scope before claiming real-data freshness acceptance. Preserve the residual limitation in user-facing deployment guidance.

## Human architectural approval

Yes — security/acceptance scope decision; this review makes no change.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/08-assurance/security-threat-model.md:60](../../../docs/08-assurance/security-threat-model.md) | AEAD authenticates bytes/context but does not establish latest state or reject authentic stale envelopes. The storage/application design must bind key policy, catalogue, publication and heads to reject rollback/replay before durable editing. Epoch numbers alone neither rotate keys nor grant historical access. |
| [docs/04-architecture/data-architecture.md:32](../../../docs/04-architecture/data-architecture.md) | One SQLite database coordinates encrypted immutable objects, mutable head/draft slots and encrypted operation receipts. WAL/FULL is durability machinery, not application history. Ciphertext metadata leaks opaque identifiers, types, generations, lengths/counts and access patterns; no whole-database rollback witness exists. The implementation does not rewrite every retained revision on each draft save. See &#91;record representation&#93;&#40;../07-implementati |
| [docs/06-subsystems/formats/hpx-workspace.md:48](../../../docs/06-subsystems/formats/hpx-workspace.md) | Encrypted catalog authenticates the list of documents and the owner/device context. Each document has a branch head, current draft and immutable root manifest/occurrence. Immutable object insert is create-only; existing records cannot be overwritten by the API. Sealed records authenticate expected kind, identity and generation. Referenced missing/corrupt objects fail; never substitute latest revisions. This detects substitution and many corruptio |
