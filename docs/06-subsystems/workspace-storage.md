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
- **Last reviewed:** 2026-10-30

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../architecture/context.c4) (HPX-CAN-002); [chat/MCP and permission details](ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

Storage is below shared API/application authorisation; browser and AI tools receive no alternate direct SQLite access. Persist user-attributed results/drafts/receipts under common publication semantics. One SQLite writer does not imply one user. Existing one-owner checks remain incomplete; no new permission record or migration is adopted. See the [accepted shared API scope](interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


Fixture controls and future contracts are not durable service implementations. Capabilities must report unavailable honestly.


## State and operations


### Commands and acknowledgements

Source `HPX-SRC-0034`, original lines 17–26. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Create document publishes metadata, whole-buffer node revision, manifest, closed snapshot, branch head, draft, catalog change and operation receipt in one transaction. Names/source are UTF-8, bounded before allocation/encryption. Names are display labels only.

Save draft supplies operation ID, document/context IDs, expected generation, expected base revision, previous acknowledged sequence, increasing through-sequence and complete exact owned buffer. This full-buffer replacement is supported only for the initial single-owner contract. Validate all preconditions; atomically update the encrypted draft and insert an encrypted request/result receipt. Return captured through-sequence and new generation. Earlier receipt replay must return the original acknowledgement, never newer state. Browser keeps edits after that acknowledged sequence.

Commit supplies exact draft generation/base/acknowledged sequence and operation ID. Publish immutable revision with same-node parent, snapshot, semantic event, branch-head CAS and rebased draft plus receipt in one transaction. Explicit commit of an older browser buffer is rejected, not guessed. Browser typing after request capture remains newer local state. Retrying identical operation IDs returns the original result; changed request reuse conflicts, including after restart. No mutation may infer success from network timeout.

Open validates bootstrap/schema and unlocks with passphrase; keys never enter browser storage or SQL. Wrong passphrase/tag fails safely. Reads authenticate selected records and verify ownership/closure. Reconstruct snapshot uses its exact pinned revision regardless of current head. Draft recovery returns exact text, base, generation and acknowledged sequence without committing it.


## Source provenance

- `HPX-SRC-0034` — `Specifications/SQLITE_PERSISTENCE.md`, lines 17–26; SHA-256 `a5f2ddf4a59c93589326af673ca8dd14254291167ed3504262c68afe4c6cb5df`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
