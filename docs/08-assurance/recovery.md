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
- **Last reviewed:** 2026-10-30

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../../architecture/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

Recovery and original-operation receipt lookup use the shared user API with current per-user-per-workspace authorisation. A previously valid session, completed write or saved receipt does not authorise disclosure to another user or bypass rights changes. Preserve uncertain outcomes and immutable results while reporting denials honestly; no new recovery protocol is selected. See the [accepted shared API scope](../06-subsystems/interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.


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

### Initial bounded read-only audit slice

Roadmap unit4 starts with an adapter-only audit of one currently authorized document's **original designated content branch**. Named-child/working/reference/annotation closures, all retained history, receipts, optional ciphertext, bootstrap and whole-database freshness are outside this initial slice and must be reported as such. Selecting a known ID confers no authority: read and verify current catalog owner/device/membership before returning any finding for that document. Use one consistent SQLite read transaction; do not copy the active database or ignore WAL.

The initial implementation guard is a caller-selected positive encrypted-read budget up to16MiB, charged before allocating/decrypting each selected catalog/document/head/draft/manifest/snapshot/revision/publication-event envelope. This is a bounded-operation guard, not a performance acceptance target or storage-retention cap. Validate strict existing wrappers and authenticated context, document/node/occurrence bindings, draft/base/head alignment, exact closed snapshot and its publication-event identity. Preserve the distinction between a mutable acknowledged draft and immutable committed text. No implicit checkpoint, Commit, metadata upgrade, credential action or repair occurs.

Return no source/title/body in the report. Report the failing selected record role and a bounded category: missing, unreadable encrypted record (envelope/authentication), unsupported-or-malformed decoded record, inconsistent context, or exhausted budget. The current decoder cannot reliably distinguish all future versions from malformed payloads, so retain that explicit combined category. Stop dependent checks at the first failure; mark the result incomplete. A successful result means only that all selected immediate records passed these checks in this read view; it is neither a complete audit of other families nor a provenance, receipt-digest, freshness, filesystem-durability or whole-application proof. Authorization/catalog failures return an ordinary denial/error, not a document-existence diagnostic. Ordinary executable tests must verify denied reads, tampering/missing/context failures, budget bounds and unchanged persisted state before any delivery claim.

### Recovery evidence required by scope

| Claim | Required evidence / current limit |
| --- | --- |
| Transaction interruption and uncertain reply | Old state or complete new state including original receipt; frozen retry cannot duplicate publication. Existing process-exit/fault checks cover their stated checkpoints. |
| Working-source promotion/replacement | Crash after text Commit and before the separate replacement batch; text remains published, original reference/checkpoint remains exact, bounded batch reconciliation survives restart. The complete40-check synthetic runtime workflow now includes both uncertain replacement retry and startup reconciliation of an unsent batch (HPX-TEST-040); real-data acceptance remains separate. |
| Enrollment backup | Consistent SQLite snapshot, retained-state verification, file/directory durability and source-state recheck before upgrade. This does not establish portable restore or backup retention policy. |
| General disaster recovery | A selected supported restore design and isolated rehearsal covering truncated/corrupt backup, missing/wrong credentials and incompatible versions; disk-full/fsync/VFS/power-loss failure envelope must be explicit. These broader checks have not been executed by this documentation task. |

Recovery guarantees continue to depend on the stated local-filesystem/VFS/fsync/hardware assumptions. No network filesystem, full hostile-host protection, erasure exception or receipt expiry is introduced.

### Failure and recovery

Source `HPX-SRC-0034`, original lines 27–31. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

A failed precondition publishes nothing. Inject failures between object insertion, head/draft update and receipt, including process exit before and after COMMIT; reopening must show either the entire old state or the complete new state with original receipt. Test duplicate command, stale writer, corruption, missing records, invalid UTF-8 boundary conversion and source unchanged across restart/history.

Durability assumes local filesystem, functioning SQLite VFS/fsync and storage hardware. No network filesystem support. Newly created file is create-only with restrictive permissions on Unix; reject symlink opens where supported. Parent directories must be user-controlled; no claim against a malicious same-user host. Consistent backup requires SQLite backup API; copying a live database or just ignoring WAL is unsupported. Portable `.hpxz`/`.hpx.json`, encrypted `.hpxe`, GitHub backup/restore and keychain integration remain later work. Backups and export never override core confidentiality policy.


## Source provenance

- `HPX-SRC-0034` — `Specifications/SQLITE_PERSISTENCE.md`, lines 27–31; SHA-256 `a5f2ddf4a59c93589326af673ca8dd14254291167ed3504262c68afe4c6cb5df`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.

## Bounded audit transport and UI verification, 2026-10-27

HPX-TEST-044 now exposes the same original-branch immediate-record slice through [the strict protected runtime query](../06-subsystems/interfaces/browser-runtime.md#original-branch-integrity-audit-transport-2026-10-27) and an explicitly scoped read-only dialog. Actual audit requests leave all selected object/slot ciphertext unchanged, preserve pending typing/selection/Undo, report an incomplete budget-limited read and reject repair/locked/invalid requests. Complete42-check synthetic runtime evidence and desktop visuals are recorded separately from broader recovery acceptance. No repair, wider record family, freshness or source/proof guarantee is added by exposing this slice.

## Workspace-only local witness proposal

**Historical proposal, superseded by HPX-OWNER-009 below; not adopted or implemented.** HPX-OWNER-008 selects workspace-only restoration with trusted local state surviving elsewhere on the machine. It does not approve this proposal or an enrollment/upgrade. This section owns the proposed cross-store recovery protocol; the threat model owns the selected attacker boundary and existing persistent contracts remain unchanged.

### Scope and trusted state

A witness is a protected local record of the latest accepted encrypted workspace state. Keep it outside the workspace and its backup/restore set, indexed through a local registration by immutable workspace identity and a fresh registration identity. The selected threat assumes that registration/witness, trusted runtime/OS, keys in an unlocked trusted process and the witness directory survive intact; replacing both workspace and witness is outside this scope. An ordinary second file is not independent against whole-host restoration. There is no remote provider or mandatory native-keychain enrollment. After bounded key unwrap, authenticate required witness/registration evidence before returning protected catalog/source data; a valid passphrase alone does not attest that the restored key policy is current. Passphrase unlock remains default and ADR014's separately opted-in keychain alternative remains unchanged.

The witness must be confidential/authenticated and explicitly versioned through adapter DTOs/codecs, using a separately bound purpose/context with the existing workspace key rather than plaintext source or a public text hash. Exact bytes/key-binding encodings remain subsequent reviewed format work, not an implicit envelope/epoch change. Trusted local registration is consulted even when restored workspace files predate enrollment or omit enrollment metadata. Missing, malformed, unsupported, unauthenticated or unregistered required evidence produces **unknown/denied**, never automatic enrollment or trust in the restored database. Moving a file on the same host must locate the same registration by identity; two diverging copies of one identity do not get silently enrolled as separate workspaces.

### State commitment and cost boundary

The candidate commitment covers logical persistent state: application/schema identity and supported schema definitions, bootstrap/key-policy/witness-binding metadata and every encrypted object/slot, including kind, identity, generation where applicable and exact envelope bytes. Preserve unknown optional ciphertext as opaque committed bytes. Define canonical encodings/domain separation before implementation; do not hash SQLite physical pages/WAL offsets, decrypted text, unordered rows or just the latest receipt. A witness's root must bind the state actually read, not merely another root value copied out of the database. Database enrollment metadata binds the registration identity; it does not store a self-referential commitment root. A retained receipt chain alone cannot authenticate arbitrary restored slots.

Proposed mechanism: construct an authenticated tree of record fingerprints keyed by record identity from one consistent database view on unlock/first verification; retain the tree only in trusted runtime memory, and update affected leaves for each transaction rather than rewriting/scanning retained history on every Save. Root calculation must be deterministic, include all persisted authoritative rows and detect missing/substituted/stale records. Cache validity requires current connection/file/view identity and external-writer detection; any unexplained replacement/change invalidates it and demands revalidation. A cached root or SQLite change counter is not itself authenticated evidence of file contents. Exact tree structure, bounds and file-replacement/concurrent-modification acceptance still need implementation tests; no current performance guarantee or support for unsafe concurrent file copying is inferred. Resource exhaustion must report an incomplete/unknown verification and deny protected editing rather than accept a partial root. Existing whole-buffer/source and current-authorization checks continue to apply.

### Proposed publication order

Hold the same workspace registration lock across all witness/database steps, with a fixed cross-process lock order and one existing immediate SQLite mutation transaction. Serialize protected reads through the selected verified view until a pending transition is reconciled. Operation identity and command digest are frozen; the database still publishes all of its affected objects/slots/receipt atomically. An accepted result requires the following sequence:

1. Verify the current database commitment against an authenticated **stable** witness and check current authority/preconditions. An unexplained mismatch denies writes before new acknowledgements.
2. Stage the existing database transaction and compute its candidate new root from the exact transaction changes. Persist an authenticated **prepared** witness containing the old/new roots, frozen operation and command digest, registration/version binding and recovery status. Use create-only/private temporary output, atomic replacement and required file/directory durability; uncertain I/O is an unknown outcome, not assumed rollback.
3. Commit SQLite with the existing durability assumptions. The prepared witness remains authoritative recovery evidence; do not expose a successful Save/Commit or new protected publication view yet.
4. After verifying the candidate root and original receipt/authority, durably replace the witness with the **stable new** state. Only then return the original command receipt as accepted and release the lock. A failed/unknown finalization cannot manufacture an acknowledgement or roll back already-written text.

No competing content append log, per-keystroke history, automatic text Commit, reference-batch fusion, receipt pruning or new custody mode is proposed. Text Commit and the separately acknowledged working-reference batch each get their own witnessed transition. Key-policy/enrollment changes also need their own witnessed transition without bypassing ADR014's ordered native side effects; exact composition is part of the later format/upgrade review. No cross-store atomicity claim follows merely from SQLite COMMIT.

### Conservative restart decisions

| Authenticated surviving witness | Database state in one verified view | Proposed decision |
| --- | --- | --- |
| Stable root R | Exact root R | Matched witnessed state; ordinary current authorization still applies. |
| Stable root R | Any other root | Rollback/tampering/out-of-protocol change detected; deny editing. Do not move the witness backward or guess a head. |
| Prepared old R / new N / original operation | Exact N and matching original receipt/command binding/current authority | Finish stable-witness durability first, then reconcile that original operation. No second publication. |
| Prepared old R / new N | Exact old R | **Interrupted-or-restored, outcome unknown.** A crash before SQLite COMMIT and restoration after an unacknowledged COMMIT can look the same. Do not automatically cancel the witness, reapply the command, declare health or permit new writes. |
| Prepared state | Other root, wrong/missing receipt, wrong operation, changed command or denied current scope | Unknown/integrity/denied; retain original evidence and block new writes. |
| Missing/invalid/unsupported required witness or registration | Any workspace bytes | Freshness unknown; no automatic trust reset/enrollment/fallback. |

The conservative old-root/prepared case trades availability for avoiding an invented recovery result. A first implementation can remain read-only/blocked there; an explicit authorized recovery protocol is required to resume. If an exact newer trusted backup restores N, reconciliation can follow its matching evidence. If it is unavailable, do not erase or reset the surviving registration to make an older copy look current. Any independent recovery workspace/import or intentional adoption of older state remains a separately reviewed restore operation, retaining the original witness/history/conflict evidence. This proposal does not silently complete HPX-GAP-024 or permit immutable-history erasure.

### Enrollment, old readers and restore

Propose an explicit **consistent backed-up minimum-reader upgrade** for enrollment (candidate next SQL schema3, not reserved/adopted by this text), retaining passphrase recovery and existing encrypted payload/envelope versions. An enrolled current workspace must be rejected by older executables before ordinary writes; merely adding optional records would let old writers silently omit witness updates. Current schema1/2 and actual old-reader20–27 preservation evidence remain valid for their existing unenrolled scope. Unenrolled experimental workspaces retain their explicitly limited development status; no freshness protection or real-data acceptance is inferred for them. Restoring a pre-enrollment older workspace does not erase the surviving registration; the new reader must consult it and refuse an unexplained old root even if an old executable can open that restored copy.

First enrollment requires a verified consistent backup and an explicit owner-selected baseline; it is not a test side effect or permission to enroll the manual workspace now. Keep the external registration and backup until the complete upgrade/witness transition is reconciled. Exact paths, supported atomic replacement/fsync/locking semantics, registration codec, minimum-reader/schema decision and interrupted-enrollment procedure need approval/testing before production writes. Native credential enrollment remains separately authorized. Intentional restore and device transfer must report missing/stale witness honestly; workspace portability cannot mean silently dropping freshness protection. General restore/transfer is still gated.

### Required evidence and remaining decision

Before delivery, test independent consistent-root recomputation versus incremental updates; all authoritative/opaque rows and key-policy changes; valid frozen retry/current permission; every cross-store crash/unknown-I/O boundary; restoration of exact older files with the witness retained; selective record substitution; witness loss/corruption/version failure; interrupted enrollment and compatible backup/passphrase recovery; old-reader rejection; path replacement/concurrent writers; source/selection/Undo; and the full isolated headless workflow with guarded exact-binary handoff. Record workload costs before choosing thresholds or data structures. A small abstract protocol model can check its decision table and acknowledgement ordering, but cannot establish real file durability, cryptographic tree correctness or application correspondence.

**Owner review needed before implementing witness writes/upgrade:** adopt this local witness direction, explicit backed-up minimum-reader enrollment and conservative unknown-state blocking, or request revisions. This asks for a concrete mechanism decision beyond HPX-OWNER-008's threat scope. It does not authorize manual enrollment, real-data acceptance, release, provider connections or trust installation.

Proposal model evidence: `python3 scripts/check_witness_proposal.py` passes33 assertions over12 database/witness restoration pairs with Python3.14.8. Source SHA-256 is `cf71c79a7843589bf009ba90435694b27a3a8b8ce1ebb09ff6f5b5c1db2fe020`. Roots are symbolic collision-free labels and trusted witness durability/current-authority/receipt checks are supplied assumptions. The executable decision-table check covers uncertain prepare/commit/finalize outcomes, original-operation recovery, missing/invalid witnesses, restoration and the deliberately excluded both-stores rollback. It does not exercise actual storage, hashing, cryptography, file replacement/durability, locks, enrollment or recovery of lost data. See HPX-TEST-045 and the formal digest for the explicit model-versus-implementation boundary.

## Portable self-contained recovery direction, 2026-10-27

HPX-OWNER-009 supersedes the external local-witness proposal above and its proposed enrollment/upgrade. All required persistent application/recovery evidence must travel inside the workspace. Do not create a required external registration, witness or protected recovery store. The earlier proposal and HPX-TEST-045 remain historical design/model evidence only; they are not the implementation plan. Existing optional host custody/transport infrastructure retains its separately approved scope and is not a prerequisite for portable passphrase recovery.

A complete authentic older workspace restored together with all its internal evidence is indistinguishable from its original state without independently surviving evidence. Report that whole-workspace rollback detection is unavailable; never relabel an internal checksum, receipt chain or backup as independent freshness proof. Crash reconciliation, authenticated corruption checks and recovery from retained internal evidence remain useful, separately scoped requirements. New internal checkpoint/redo/restore mechanisms still need exact format/atomicity/crash tests; none is implemented merely by this decision. Real-data acceptance remains separately gated.

HPX-OWNER-010 adds automatic immutable publication at logical node/branch departure. A failed/unknown transition retains the outgoing source and frozen operation instead of completing navigation. Autosave and recovery while remaining in the active node stay distinct from Commit. Formatting/menu/comparison blur and browser unload do not create automatic publications.


## Experimental temporal transaction recovery evidence, 2026-10-27

HPX-TEST-068/069 add actual process-exit probes on both sides of the experimental single-parent temporal publication and its separately acknowledged private reference replacement. The synthetic fixture reopens SQLite/WAL and unlocks with a passphrase through test-only code; the normal application still rejects format3. Text/head/draft/origin/clock/promotion/receipt form one publication transaction; reference/index/batch receipt form a later transaction retaining originals. A replacement failure cannot revoke the acknowledged text publication, and exact original operations reconcile after a lost reply without allocating a second passage order or reference batch. These checks do not implement a production backup/upgrade entry point or detect restoration of a complete authentic older workspace; the self-contained portability/freshness limits above remain unchanged.
