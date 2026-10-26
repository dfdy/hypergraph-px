# Serialization outside the pure domain

## Common metadata

- **ID:** `HPX-ADR-006`
- **Title:** Serialization outside the pure domain
- **Purpose:** Owner decision: serialization belongs in adapters, not in the pure domain.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Implementation update, 2026-10-25: domain Serde/dependencies have been removed. The [adapter codecs](../../../crates/storage/src/encoding.rs) preserve identifier/command encodings; [current evidence](../../09-guides/reference/implementation-resumption.md) distinguishes ordinary tests and proof replay.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Status and decision date

Owner decision: serialization belongs in adapters, not in the pure domain. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Problem and forces

Owner decision: serialization belongs in adapters, not in the pure domain. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Alternatives considered

Owner decision: serialization belongs in adapters, not in the pure domain. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Chosen decision

Decision accepted by explicit owner instruction “Keep serialization outside the domain” on2026-10-25. Keep domain types/validators independent of Serde/storage/wire representations. Place serialization DTOs and checked conversions in adapters. This trades some conversion/test code for a smaller dependency/proof boundary and independently evolvable formats. The resumed implementation removes domain Serde derives/dependency; exact-width identifier codecs and checked snapshot-binding DTO decoding now live in the storage adapter and are shared by runtime request DTOs. Preserve ADR0002's dependency-free domain constraint.


## Consequences and risks

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Revisit triggers

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Affected specifications and tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

Source-grounded consolidation of the documents registered for this topic in [source manifest](<../../registers/source-manifest.csv>), explicit owner decisions and source/code references above. No missing mechanism is invented.
