# Explicit persistent record versions

## Common metadata

- **ID:** `HPX-ADR-007`
- **Title:** Explicit persistent record versions
- **Purpose:** Owner decision: explicit record versions before real-data testing acceptance.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-25

Implementation update, 2026-10-25: encrypted records now carry a strict version/kind/payload wrapper; see [exact record representation](../../07-implementation/data-structures/sqlite-records.md). This does not adopt a real-data migration path or complete runtime acceptance.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; documentation ownership does not establish implementation or verification.

## Status and decision date

Owner decision: explicit record versions before real-data testing acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Problem and forces

Owner decision: explicit record versions before real-data testing acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Alternatives considered

Owner decision: explicit record versions before real-data testing acceptance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Chosen decision

Decision accepted by explicit owner answer “Require explicit record versions (Recommended)” on2026-10-25. Persistent records must identify a supported record version before the durable format is accepted for real-data testing. Database schema, crypto envelope, application record and network contract versions remain distinct. The resumed implementation selects integer `record_version: 1` and the existing integer `record_kind`, wrapping the typed `payload` at the authenticated cipher boundary. Missing/future versions, unknown/duplicate wrapper fields, malformed payloads and mismatched kinds fail closed. Golden vectors and all-kind persisted-record checks exercise this implementation choice. Unversioned experimental payloads are rejected without conversion; no automatic migration is approved or implemented. Database, envelope and network versions are unchanged.


## Consequences and risks

Retain the scoped limits above and [open questions/conflicts](<../../02-governance/registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Revisit triggers

Retain the scoped limits above and [open questions/conflicts](<../../02-governance/registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Affected specifications and tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

Source-grounded consolidation of the documents registered for this topic in [source manifest](<../../02-governance/registers/source-manifest.csv>), explicit owner decisions and source/code references above. No missing mechanism is invented.
