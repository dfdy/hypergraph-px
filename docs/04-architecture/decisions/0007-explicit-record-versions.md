# Explicit persistent record versions

## Common metadata

- **ID:** `HPX-ADR-007`
- **Title:** Explicit persistent record versions
- **Purpose:** Owner decision: explicit record versions before real-data testing acceptance.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Accepted decision does not mean follow-up code exists.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Status and decision date

Owner decision: explicit record versions before real-data testing acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Problem and forces

Owner decision: explicit record versions before real-data testing acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Alternatives considered

Owner decision: explicit record versions before real-data testing acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Chosen decision

Decision accepted by explicit owner answer “Require explicit record versions (Recommended)” on2026-10-25. Persistent records must identify a supported record version before the durable format is accepted for real-data testing. Database schema, crypto envelope, application record and network contract versions remain distinct. Current generic payload serialization lacks those fields; exact discriminant layout, decode/migration policy and golden vectors remain to be implemented/reviewed. No field name, version number or migration algorithm is invented here.


## Consequences and risks

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Revisit triggers

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Affected specifications and tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

Source-grounded consolidation of the documents registered for this topic in [source manifest](<../../registers/source-manifest.csv>), explicit owner decisions and source/code references above. No missing mechanism is invented.
