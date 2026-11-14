# HPX-FIND-010 — Rights and mandate requirements lack an executable core policy model

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Missing specification / security risk

## Severity

High

## Confidence

High

## Confirmed versus hypothetical

Confirmed future contract gap

## Affected components / scope

Future exports, sharing and provider context

## Affected processes

HPX-PROC-011, HPX-PROC-012, HPX-PROC-013, HPX-PROC-015

## Priority and dependency gate

P1 when outbound or shared features are selected

## Likelihood / evidence limit

High risk of divergent implementations if deferred past adapter implementation.

## Problem

The contracts establish scoped authorization, contested attribution/licensing and confidentiality gates, but do not select versioned policy inputs, grant/delegation algebra, conflict precedence representation, revocation timing or a minimal decision interface. Named-holder and mandate workflows are requested review topics; separate adoption or executable schemas were not located. Rights reporting itself can reveal sensitive claims.

## Architectural consequences

Independent exporters/agents may implement different allow/deny rules, or confuse unresolved rights with access denial. Mixed-input output could launder confidential material if the mode gate is only a UI check.

## Reproduction / demonstration

Construct a decision table for authorized source plus disputed licence, unauthorized source plus consent, and mixed trusted/non-trusted sources. The high-level outcomes are constrained; exact persisted authority evidence and evaluator remain unspecified.

## Alternative interpretations

The current sole-owner local slice does not require a complete multi-user rights engine. This finding gates the dependent future features, not existing editing.

## Possible remedies

Specify a small shared authorization/egress decision contract, evidence versions, precedence and explainable denial/report scopes before implementing each outbound adapter.

## Trade-offs

A universal legal rules engine would be excessive. Preserve claim uncertainty and owner decisions without asserting legal truth or blocking authorized exports solely for unresolved claims.

## Recommended next action

Owner review of the minimal policy decision table and historical disclosure rules.

## Human architectural approval

Yes — authority, disclosure and conflict policy.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/06-subsystems/import-export.md:57](../../../docs/06-subsystems/import-export.md) | Unresolved attribution/licensing conflicts must not by themselves prevent an otherwise authorized export. Append an in-document unresolved-rights report identifying the permitted affected content, evidence/uncertainty and unresolved claims; do not invent a clearance or ownership resolution. Its detail is permission-scoped and must not leak withheld identities or content. Where no native appendix structure exists, retain a clearly labelled report  |
| [docs/08-assurance/privacy-and-data-protection.md:40](../../../docs/08-assurance/privacy-and-data-protection.md) | Use one authoritative policy/command boundary across browser, native/trusted client, REST, MCP, plugins and background workers. UI capability flags and disabled buttons reflect the decision; every direct command, retry and sink must independently enforce it. The future trusted client must route file/download, OS clipboard, printing, integrations and provider network calls through its core execution boundary. An authorized plaintext-capable client |
| [docs/08-assurance/security-threat-model.md:50](../../../docs/08-assurance/security-threat-model.md) | Queries must distinguish missing data from inaccessible historical references without leaking unauthorized existence. Decide whether an authorized user may see an opaque reference or whether even the relation must be hidden. Group membership and current read rights are not automatically access to all historical keys. Revocation cannot undo prior plaintext disclosure. |
