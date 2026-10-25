# Data and Storage Architecture

## Common metadata

- **ID:** `HPX-ARCH-003`
- **Title:** Data and Storage Architecture
- **Purpose:** SQLite authority, encrypted records, mutable drafts and atomic publication.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<system-architecture.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

SQLite is selected. Encryption metadata leakage and whole-database rollback limitations remain explicit; database choice does not implement policy/federation.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

SQLite authority, encrypted records, mutable drafts and atomic publication. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

SQLite authority, encrypted records, mutable drafts and atomic publication. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

One SQLite database coordinates encrypted immutable objects, mutable head/draft slots and encrypted operation receipts. WAL/FULL is durability machinery, not application history. Ciphertext metadata leaks opaque identifiers, types, generations, lengths/counts and access patterns; no whole-database rollback witness exists. The implementation does not rewrite every retained revision on each draft save. See [record representation](../07-implementation/data-structures/sqlite-records.md) and [publication protocol](../07-implementation/protocols/draft-publication.md).

### Data and command flow

Source `HPX-SRC-0021`, original lines 28–43. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The accepted [core object model](<../05-domain/core-object-model.md>) and [SQLite persistence design](<../06-subsystems/formats/hpx-workspace.md>) define the initial local writer. Canonical immutable records support typed projections: occurrence structure, revision ancestry, transformation provenance, references, expansion dependencies and snapshot closure. Derive indexes rather than creating competing authoritative stores. Logical identity is independent of physical encrypted addresses. See the [mathematical model](<../05-domain/hypergraph-mathematics.md>) and [data reference](<../06-subsystems/interfaces/domain-navigation.md>).

```text
frozen request + trusted actor/device + exact base/policy
    -> authorize source/target operations
    -> pure validation and complete result planning
    -> recheck affected heads/policy and idempotency
    -> durably publish one complete atomic result
    -> update recoverable read models
    -> return original action/commit receipt
```

This is the required application flow, not an implemented transaction system. Preview/navigation must not publish history. Changed request reuse under the same idempotency key conflicts; uncertain acknowledgements reconcile the original action. Autosave persists mutable drafts separately from immutable commits. Delayed replies must preserve newer typing, selection and undo state.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

SQLite authority, encrypted records, mutable drafts and atomic publication. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 28–43; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
