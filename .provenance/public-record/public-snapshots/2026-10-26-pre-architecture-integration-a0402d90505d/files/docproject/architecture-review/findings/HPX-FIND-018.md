# HPX-FIND-018 — Compound requirement seeds and source counts overstate completeness if treated as proof

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Maintainability concern / verification gap

## Severity

Medium

## Confidence

High

## Confirmed versus hypothetical

Confirmed traceability granularity limit

## Affected components / scope

All requirements and migration evidence

## Affected processes

HPX-PROC-018.005

## Priority and dependency gate

P2 — before declaring feature completeness

## Likelihood / evidence limit

High risk of reporting misuse; no source-loss claim made.

## Problem

The register has 31 compound seeds rather than an exhaustive atomized requirement set. Existing historical claim/coverage counts and this review’s 60-document paths demonstrate coverage bookkeeping, not individual correctness or complete architecture. Broad academic export and working-branch rows contain many independent acceptance obligations.

## Architectural consequences

A nominal 31/31 mapping can hide missing rights-policy types, exact formats, error cases and verification targets. Generic template headings are not implemented mechanisms.

## Reproduction / demonstration

Decompose RQ030 into selection/closure, compiler packaging, citations, per-format role mapping, rights reports and schemas. One row cannot certify all six independently. This review maps all seeds but explicitly refuses atomic coverage percentage.

## Alternative interpretations

Compound seeds are reasonable during migration when original statements and acceptance are preserved. The risk arises only when consumers treat them as exhaustive testable units.

## Possible remedies

Incrementally derive atomic obligations only for the next selected feature, retaining source lines, adoption scope, process leaf, verification method and unresolved mechanism. Keep source coverage separate from semantic coverage.

## Trade-offs

Full retroactive atomization is costly and could accidentally invent requirements; do not replace adopted source meaning with editorial decomposition.

## Recommended next action

Use the next branch integration and export design as two small traceability pilots.

## Human architectural approval

Routine trace maintenance; changing requirement meaning needs owner decision.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/registers/requirements.csv:31](../../../docs/registers/requirements.csv) | HPX-RQ-030,HPX-REQ-002,Future bundled Pandoc export with academic citations and selectable hypergraph content plus readable relation fallbacks and rights appendix,Explicit owner-confirmed INPUT.md item4 on 2026-10-26; future documentation inclusion only,future planning; not an immediate implementation priority,roadmap stage6 after exact export/branch/citation foundations,HPX-SUB-008;HPX-ARCH-002;HPX-ARCH-003;HPX-GOV-004,,future per-format citatio |
| [docs/registers/claim-coverage.csv:1](../../../docs/registers/claim-coverage.csv) | section_id,source_id,original_path,start_line,end_line,destination_id,destination_path,destination_section,disposition,source_section_sha256,review_status,current_source_path,archive_member |
| [docs/MIGRATION-REPORT.md:9](../../../docs/MIGRATION-REPORT.md) | ## Deliverables and coverage |
| [docs/03-requirements/system-requirements.md:1](../../../docs/03-requirements/system-requirements.md) | # System Requirements |
