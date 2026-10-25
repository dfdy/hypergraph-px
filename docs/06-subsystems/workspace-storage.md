# Workspace Storage

## Common metadata

- **ID:** `HPX-SUB-006`
- **Title:** Workspace Storage
- **Purpose:** Encrypted SQLite create/open/draft/commit transactions and restart recovery.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../04-architecture/system-architecture.md>); [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Fixture controls and future contracts are not durable service implementations. Capabilities must report unavailable honestly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Responsibilities and boundaries

Encrypted SQLite create/open/draft/commit transactions and restart recovery. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Inputs and outputs

Encrypted SQLite create/open/draft/commit transactions and restart recovery. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## State and operations



### Commands and acknowledgements

Source `HPX-SRC-0034`, original lines 17–26. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Create document publishes metadata, whole-buffer node revision, manifest, closed snapshot, branch head, draft, catalog change and operation receipt in one transaction. Names/source are UTF-8, bounded before allocation/encryption. Names are display labels only.

Save draft supplies operation ID, document/context IDs, expected generation, expected base revision, previous acknowledged sequence, increasing through-sequence and complete exact owned buffer. This full-buffer replacement is supported only for the initial single-owner contract. Validate all preconditions; atomically update the encrypted draft and insert an encrypted request/result receipt. Return captured through-sequence and new generation. Earlier receipt replay must return the original acknowledgement, never newer state. Browser keeps edits after that acknowledged sequence.

Commit supplies exact draft generation/base/acknowledged sequence and operation ID. Publish immutable revision with same-node parent, snapshot, semantic event, branch-head CAS and rebased draft plus receipt in one transaction. Explicit commit of an older browser buffer is rejected, not guessed. Browser typing after request capture remains newer local state. Retrying identical operation IDs returns the original result; changed request reuse conflicts, including after restart. No mutation may infer success from network timeout.

Open validates bootstrap/schema and unlocks with passphrase; keys never enter browser storage or SQL. Wrong passphrase/tag fails safely. Reads authenticate selected records and verify ownership/closure. Reconstruct snapshot uses its exact pinned revision regardless of current head. Draft recovery returns exact text, base, generation and acknowledged sequence without committing it.


## Invariants and error behavior

Encrypted SQLite create/open/draft/commit transactions and restart recovery. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Dependencies and interfaces

Encrypted SQLite create/open/draft/commit transactions and restart recovery. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Security and privacy

Encrypted SQLite create/open/draft/commit transactions and restart recovery. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0034` — `Specifications/SQLITE_PERSISTENCE.md`, lines 17–26; SHA-256 `a5f2ddf4a59c93589326af673ca8dd14254291167ed3504262c68afe4c6cb5df`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
