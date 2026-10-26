# HPX-FIND-015 — Agent proposal approval needs a versioned target and authority contract

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Missing specification / security risk

## Severity

High

## Confidence

High

## Confirmed versus hypothetical

Confirmed future application-boundary gap

## Affected components / scope

Future AI and MCP mutation

## Affected processes

HPX-PROC-012, HPX-PROC-015.006

## Priority and dependency gate

P1 before live agent mutation

## Likelihood / evidence limit

Known general failure mode; no present exploit demonstrated.

## Problem

High-level rules require explicit provider connection, permitted exact context, proposals and human authorization, but do not yet define complete proposal schema, target/expected-head binding, approval expiry, delegated tool scopes, cancellation/replay and consequential interaction retention.

## Architectural consequences

A stale or changed tool payload could inherit an approval intended for a different exact plan; untrusted model text may be mistaken for authority if alternate interfaces bypass the coordinator.

## Reproduction / demonstration

Paper test: human reviews target revision R, another action advances to R2, agent submits a modified patch under old approval. Required rejection/review principle is clear; exact message/evidence protocol remains missing.

## Alternative interpretations

No live agent mutation feature is delivered; UI placeholders and future specification are correctly distinct from integration.

## Possible remedies

Define minimal frozen proposal/approval data and route all accepted edits through existing application expected-state and receipt semantics. Mock prompt injection, stale target, revoked grant, lost reply and changed-operation cases before live providers.

## Trade-offs

Recording every provider message can increase sensitive retention; capture consequential observable evidence with approved scope rather than private chain-of-thought.

## Recommended next action

Review scoped approval and disclosure design before any live credential or tool mutation.

## Human architectural approval

Yes — provider connection, disclosure and delegation policy.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/06-subsystems/document-engine.md:107](../../../docs/06-subsystems/document-engine.md) | Logical capabilities &#40;identity, content/anchors, composition, revisions, references, provenance, snapshots, private clipboard, queries, permissions and integrations&#41; are modules inside the application boundary, not mandatory microservices. Browser, REST and MCP converge on the same authorized planner/publication semantics. Canonical records, reconstructible indexes and protected private user state have distinct responsibilities. SQLite is an avai |
| [docs/03-requirements/system-requirements.md:101](../../../docs/03-requirements/system-requirements.md) | Human and agent principals remain distinct. Context selection, model output and document instructions grant no permissions. Proposals freeze exact targets, action scope, model/actor attribution and expected state; approval rechecks current rights. Mock proposal/approval/recovery precedes live authoring. External model disclosure is explicit and mode-dependent. |
| [docs/02-governance/ai-development-protocol.md:65](../../../docs/02-governance/ai-development-protocol.md) | 12. At each completed milestone, record its scope and actual validation evidence, commit the relevant source/documentation, and push to the configured GitHub remote without asking again for routine approval. A milestone is a bounded, reviewable outcome, not every edit. Preserve unrelated work, exclude secrets/runtime data, and never force-push to bypass divergent history. Verify push success; if push or CI fails, investigate and report the actual |
