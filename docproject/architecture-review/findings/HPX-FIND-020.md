# HPX-FIND-020 — Crash tests and enrollment backup do not establish complete disaster recovery

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Verification gap / reliability risk

## Severity

High

## Confidence

High

## Confirmed versus hypothetical

Confirmed evidence limit

## Affected components / scope

Disk failure, power loss, corruption and restore

## Affected processes

HPX-PROC-003.005, HPX-PROC-014, HPX-PROC-018.002

## Priority and dependency gate

P1 before disaster-recovery claims

## Likelihood / evidence limit

Hardware failure likelihood unmeasured; evidence limit certain.

## Problem

Process-exit injections show transaction-boundary behavior under the tested filesystem. They do not exhaust disk-full, fsync/VFS errors, torn storage, damaged backup, credential loss or restoration to a new trusted environment. Enrollment’s verified encrypted backup is a useful narrow increment, not a complete recovery product.

## Architectural consequences

Acknowledged data durability is conditional on the local storage stack; users lack a fully specified general restore procedure. Failure to distinguish these scopes can overstate survivability.

## Reproduction / demonstration

Read the explicit filesystem/hardware assumptions and narrow backup evidence. No hardware/power-loss or corrupt-backup experiment is executed in this review.

## Alternative interpretations

SQLite/FULL and OS guarantees can be reasonable assumptions for the first slice; exhaustive fault simulation is not always cost-effective.

## Possible remedies

Specify supported failure envelope and an isolated backup/restore rehearsal with missing/corrupt key wrapper, truncated backup, disk-full/fsync failure and process restart outcomes. Preserve originals and distinguish unavailable from irrecoverable data.

## Trade-offs

Fault-injection adapters and platform testing cost effort; portable recovery must also avoid granting historical keys beyond intended recipients.

## Recommended next action

Before real-data recovery claims, select a minimal supported restore design and evidence plan.

## Human architectural approval

Yes for recovery guarantees, format and credential policy; isolated analytical/fault tests are routine.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/08-assurance/recovery.md:32](../../../docs/08-assurance/recovery.md) | The storage test corpus records restart-exact Unicode/CRLF drafts, explicit commit/historical reconstruction, duplicate/changed retry, stale-writer rejection, rollback on injected error, wrong-password/ciphertext substitution/future-schema failures and real process exit on both sides of COMMIT. No claim is made that process exits exhaust power-loss/hardware/fsync-failure scenarios. Consistent backup and portable restore are future capabilities; c |
| [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:29](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md) | 4. Upgrading a schema-1 workspace requires a separately invoked enrollment/upgrade action while unlocked. Create and verify a consistent encrypted SQLite backup with restrictive permissions before the transaction. Preserve all existing encrypted record bytes and logical history. Add the table and change &#96;user_version&#96; atomically; do not upgrade merely by opening a file. Define explicit readers for supported schema 1 and 2; future/unknown versions |
| [docs/08-assurance/recovery.md:40](../../../docs/08-assurance/recovery.md) | Durability assumes local filesystem, functioning SQLite VFS/fsync and storage hardware. No network filesystem support. Newly created file is create-only with restrictive permissions on Unix; reject symlink opens where supported. Parent directories must be user-controlled; no claim against a malicious same-user host. Consistent backup requires SQLite backup API; copying a live database or just ignoring WAL is unsupported. Portable &#96;.hpxz&#96;/&#96;.hpx.js |
