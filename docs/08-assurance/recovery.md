# Migration, Backup and Recovery

## Common metadata

- **ID:** `HPX-ASSUR-006`
- **Title:** Migration, Backup and Recovery
- **Purpose:** Atomic recovery, corruption, rollback limits and future backups.
- **Level:** `08-assurance`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Atomic recovery, corruption, rollback limits and future backups. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Atomic recovery, corruption, rollback limits and future backups. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

The storage test corpus records restart-exact Unicode/CRLF drafts, explicit commit/historical reconstruction, duplicate/changed retry, stale-writer rejection, rollback on injected error, wrong-password/ciphertext substitution/future-schema failures and real process exit on both sides of COMMIT. No claim is made that process exits exhaust power-loss/hardware/fsync-failure scenarios. Consistent backup and portable restore are future capabilities; copying a live WAL database is not an accepted backup procedure.

### Failure and recovery

Source `HPX-SRC-0034`, original lines 27–31. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

A failed precondition publishes nothing. Inject failures between object insertion, head/draft update and receipt, including process exit before and after COMMIT; reopening must show either the entire old state or the complete new state with original receipt. Test duplicate command, stale writer, corruption, missing records, invalid UTF-8 boundary conversion and source unchanged across restart/history.

Durability assumes local filesystem, functioning SQLite VFS/fsync and storage hardware. No network filesystem support. Newly created file is create-only with restrictive permissions on Unix; reject symlink opens where supported. Parent directories must be user-controlled; no claim against a malicious same-user host. Consistent backup requires SQLite backup API; copying a live database or just ignoring WAL is unsupported. Portable `.hpxz`/`.hpx.json`, encrypted `.hpxe`, GitHub backup/restore and keychain integration remain later work. Backups and export never override core confidentiality policy.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Atomic recovery, corruption, rollback limits and future backups. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0034` — `Specifications/SQLITE_PERSISTENCE.md`, lines 27–31; SHA-256 `a5f2ddf4a59c93589326af673ca8dd14254291167ed3504262c68afe4c6cb5df`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
