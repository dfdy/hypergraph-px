# Existing ADR 0003, retain decision identity/status

## Common metadata

- **ID:** `HPX-ADR-003`
- **Title:** Existing ADR 0003, retain decision identity/status
- **Purpose:** Metadata view of an existing scoped decision; original decision identity and provenance retained.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../system-architecture.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-30

The underlying decision retains its recorded acceptance. This new editorial wrapper does not expand that decision or imply implemented services.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Owner baseline reconciliation, 2026-10-30

HPX-OWNER-027 makes multi-user and multi-agent support mandatory in the product. A single SQLite publication writer serializes transactions, not user identities. Current one-owner authority/storage describes the prototype; per-user isolation, grants and conflict mechanisms remain required design work. No schema/version/locking migration is adopted by this note.

## Status and decision date

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Problem and forces

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Alternatives considered

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Chosen decision



### ADR 0003: encrypted SQLite records and first integrated writer

Source `HPX-SRC-0043`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Date: 2026-10-25. Accepted for local implementation; publication held.

### Decision

Source `HPX-SRC-0043`, original lines 5–10. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Adopt embedded SQLite for native workspace durability, with immutable encrypted objects, authenticated mutable slots and encrypted command receipts committed together. Use the existing reviewed envelope adapter, passphrase unlock, WAL/FULL and explicit single-owner whole-document drafts. Retain distinct content/revision/placement/manifest/snapshot identities. Scope the first complete workflow to create/open/edit/autosave/restart/recover/commit/reconstruct; add relationships/comments/provenance incrementally afterwards.

The canonical core object and SQLite persistence specifications define exact invariants. Do not copy illustrative external schemas verbatim or mistake their unimplemented milestones for current capabilities. Mutable drafts are not permanent per-keystroke event history. Metadata/payload encryption avoids plaintext in SQLite/WAL, while documented ID/count/length leakage and whole-database rollback remain outside the initial guarantee. Per-record storage prevents full-history rewriting/replay on each save.

### Consequences

Source `HPX-SRC-0043`, original lines 11–14. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

One transaction coordinates history, heads and retry receipts; no competing append log. Whole-buffer saves are safe only because one verified owner covers the full projection. General shared composition writes require a later mapping/planning implementation. SQLite does not implement federation convergence, authorisation, TLS or cryptographic key custody. No client-held mode is enabled.

### Primary mechanism references

Source `HPX-SRC-0043`, original lines 15–22. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- https://www.sqlite.org/wal.html — WAL, synchronization and local filesystem assumptions.
- https://www.sqlite.org/pragma.html — configuration and application/schema identifiers.
- https://www.sqlite.org/atomiccommit.html — atomic publication and hardware assumptions.
- https://docs.rs/rusqlite/0.41.0/rusqlite/ — pinned Rust binding and transaction API.

Dependency source/license review must precede compilation. Validate real process interruption, not just successful close/reopen. No new Lean theorem is implied; pure range/ownership checks and their assurance must be documented separately.


## Consequences and risks

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Revisit triggers

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Affected specifications and tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0043` — `docs/adr/0003-sqlite-local-writer.md`, lines 1–4; SHA-256 `40bab3126a8d1dea3f1d6ca0f2f457edf4d0a61ce4dbf774eedcf206a3cc2c7f`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0043` — `docs/adr/0003-sqlite-local-writer.md`, lines 5–10; SHA-256 `40bab3126a8d1dea3f1d6ca0f2f457edf4d0a61ce4dbf774eedcf206a3cc2c7f`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0043` — `docs/adr/0003-sqlite-local-writer.md`, lines 11–14; SHA-256 `40bab3126a8d1dea3f1d6ca0f2f457edf4d0a61ce4dbf774eedcf206a3cc2c7f`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0043` — `docs/adr/0003-sqlite-local-writer.md`, lines 15–22; SHA-256 `40bab3126a8d1dea3f1d6ca0f2f457edf4d0a61ce4dbf774eedcf206a3cc2c7f`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.

## Workspace-only witness design scope, 2026-10-27

HPX-OWNER-008 subsequently selects workspace-file restoration with a trusted local witness surviving outside the workspace. This selects the next design boundary; it does not retroactively give the current SQLite writer freshness detection or adopt a rollback exception. The [concrete recovery proposal](../../08-assurance/recovery.md#workspace-only-local-witness-proposal) retains one atomic SQLite mutation transaction but proposes a separately persisted witness and acknowledgement gate. Its backed-up minimum-reader upgrade and cross-store crash/unknown/recovery handling need mechanism approval before witness writes. Current schemas1/2 and earlier local compatibility evidence remain unchanged. Whole-host/witness restoration is outside the selected design scope.

## Portable workspace owner direction, 2026-10-27

HPX-OWNER-009 withdraws the external witness/registration proposal and requires workspace-contained portable application/recovery evidence. The earlier proposed external-store minimum-reader upgrade is not to be implemented. This explicitly bounds whole-workspace freshness: a complete authentic rollback with all internal evidence cannot be detected in this self-contained design. SQLite/WAL recovery and authenticated retained records retain their narrower meanings; no new schema, restore mechanism or real-data acceptance is inferred.
