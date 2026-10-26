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
- **Last reviewed:** 2026-10-26

Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Atomic recovery, corruption, rollback limits and future backups. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Atomic recovery, corruption, rollback limits and future backups. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

The storage test corpus records restart-exact Unicode/CRLF drafts, explicit commit/historical reconstruction, duplicate/changed retry, stale-writer rejection, rollback on injected error, wrong-password/ciphertext substitution/future-schema failures and real process exit on both sides of COMMIT. No claim is made that process exits exhaust power-loss/hardware/fsync-failure scenarios. [ADR014](../04-architecture/decisions/0014-keychain-unlock-policy.md) now implements a verified consistent encrypted backup specifically before native-keychain schema upgrade. General portable backup/restore remains future work; copying a live WAL database is not an accepted backup procedure. The retained source-era paragraph below predates that bounded enrollment increment.

### Authoritative state and repair boundary

HPX-FIND-003/020 refine the existing recovery obligation without adopting a repair command, new schema or loss of acknowledged data. Treat a persisted record as authoritative unless its contract defines complete deterministic reconstruction inputs and preservation checks. A record named “index,” or a digest in a receipt, is not by itself such a definition.

| Storage responsibility | Recovery treatment |
| --- | --- |
| Revisions, manifests, snapshots, publication/derivation/annotation records, checkpoints, promotion and retained reference evidence | Immutable canonical history; validate exact references. Missing/corrupt records cannot be replaced by newer heads or text matches. |
| Current catalog ownership/membership/order, selected branch heads, acknowledged drafts, private lists and active annotation/reference indexes | Protected current application state. Preserve exact values, generations and opaque optional ciphertext; do not guess a unique current state from unordered retained objects. A specific index may be rebuilt only after its own deterministic reconstruction contract is defined. |
| Operation receipts | Authoritative original retry outcomes; a digest does not retain the complete overwritten draft. Preserve current authorization checks before replay. |
| Future reverse occurrence/backlink/lineage indexes, renderer/query caches | Reconstructible only within an explicit canonical source/view, ordering, authorization and budget contract. Never use a display cache as an authoritative draft. |
| Bootstrap/key wrappers and optional native credential | Required recovery/authority material, with separate ordered native side effects under ADR014; content history alone does not recreate a lost key. |

Before any future repair implementation, specify a bounded, permission-scoped **read-only audit**: selected records/view and resource budget; supported versions; authenticated identity/context/reference consistency; exact missing/corrupt/unsupported findings visible only to the authorized caller. It must not publish history, advance a head, rewrite an original file, disclose source in logs, enroll credentials or guess a repair. Keep the original workspace recoverable. Use a separately authorized consistent backup where an audit copy is needed; never copy an active DB while ignoring WAL.

A mutating rebuild then needs explicit canonical inputs, deterministic ordering/head rules, proof that no authoritative mutable state is discarded, backup/quarantine, atomic publication and interruption/retry checks. Until those exist, fail closed and report the limitation; this is not permission to delete an index or declare the latest acknowledged draft reconstructible. The future repair/restore mechanism remains HPX-GAP-024; whole-database freshness is separately HPX-GAP-023.

### Recovery evidence required by scope

| Claim | Required evidence / current limit |
| --- | --- |
| Transaction interruption and uncertain reply | Old state or complete new state including original receipt; frozen retry cannot duplicate publication. Existing process-exit/fault checks cover their stated checkpoints. |
| Working-source promotion/replacement | Crash after text Commit and before the separate replacement batch; text remains published, original reference/checkpoint remains exact, bounded batch reconciliation survives restart. Actual full runtime acceptance remains pending. |
| Enrollment backup | Consistent SQLite snapshot, retained-state verification, file/directory durability and source-state recheck before upgrade. This does not establish portable restore or backup retention policy. |
| General disaster recovery | A selected supported restore design and isolated rehearsal covering truncated/corrupt backup, missing/wrong credentials and incompatible versions; disk-full/fsync/VFS/power-loss failure envelope must be explicit. These broader checks have not been executed by this documentation task. |

Recovery guarantees continue to depend on the stated local-filesystem/VFS/fsync/hardware assumptions. No network filesystem, full hostile-host protection, erasure exception or receipt expiry is introduced.

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
