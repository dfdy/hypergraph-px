# Encrypted SQLite records and slot schema

## Common metadata

- **ID:** `HPX-DATA-001`
- **Title:** Encrypted SQLite records and slot schema
- **Purpose:** Actual initial encrypted SQLite objects/slots and typed local record representation.
- **Level:** `07-implementation`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-FMT-001](<../../06-subsystems/formats/hpx-workspace.md>); [HPX-SUB-006](<../../06-subsystems/workspace-storage.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Describes local code, not proof of a complete data model. Serialization must move out of domain and record versions must be implemented before real-data acceptance.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Exact types and fields

Current local code is [storage/src/lib.rs](../../../crates/storage/src/lib.rs); this is implementation evidence, not a newly frozen schema.

| Physical record | Current representation | Authority/limit |
|---|---|---|
| bootstrap | workspace16, epoch1 and wrapped key106 | Clear bounded bootstrap metadata; no plaintext document content |
| objects | kind, id32, encrypted envelope; compound primary key | API insert-only immutable revisions/manifests/snapshots/events/receipts |
| slots | kind, id32, generation, encrypted envelope | Catalog/head/draft mutable state, updated under SQLite writer transaction |
| local payloads | typed JSON serialized in storage | Current JSON payloads lack explicit record-version fields; real-data acceptance blocked pending implementation |

Private document/node/branch/occurrence/draft references and full text are authenticated inside records. The initial one-owner document has one immutable manifest and one occurrence; this does not implement general nested composition. SQL should receive encrypted bytes, including data entering WAL/journals. JSON request digests are encrypted receipt data, not public plaintext addresses. Exact structural constraints and decode limits must remain bound to schema/record versions. No SQL migration or new JSON field was added here.


## Keys and references

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Constraints and invariants

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Indices and operations

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Migration and serialization

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Valid/invalid example records

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Integrity tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

Source-grounded consolidation of the documents registered for this topic in [source manifest](<../../registers/source-manifest.csv>), explicit owner decisions and source/code references above. No missing mechanism is invented.
