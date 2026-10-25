# Current development state

## Common metadata

- **ID:** `HPX-GUIDE-007`
- **Title:** Current development state
- **Purpose:** Resume safely without confusing published evidence, paused implementation and documentation migration.
- **Level:** `09-guides`
- **Status:** `proposed`
- **Maintainer:** project owner; development agent records
- **Applies to:** published0.7.0 and preserved unfinished local work
- **Upstream authority:** [owner decisions](../../02-governance/OWNER_DECISIONS.md), [documentation index](../../README.md)
- **Downstream dependencies:** [technical debt](../../registers/technical-debt.csv), [acceptance gates](../../03-requirements/acceptance-criteria.md)
- **Verification:** source/hash/archive checks in [migration report](../../MIGRATION-REPORT.md); no new application checks
- **Decision/history:** source/owner records and preserved previous handoff under .oldspecs
- **Last reviewed:** 2026-10-25

## Scope

Application development is paused. No push/commit/release or GitHub mutation is authorized. Published0.7.0 is commit2ebe35b8c966ab83530174fcebc8f245238625cb. Branch docs/nine-level-migration preserves all prior uncommitted core/storage/runtime/frontend changes. Documentation migration has not modified application source, tests, schema code, build configuration or proof sources.

## Implemented and tested boundaries

Published synthetic frontend has recorded54 Node/56 browser scenarios and eight Rust tests at that milestone. Subsequent local storage work records encrypted SQLite draft recovery, immutable commits/snapshots, retry receipts, stale writers, tamper/wrong-passphrase/future-schema rejection and four subprocess exits around transaction publication. Two new Unicode domain tests and two runtime parser/origin/session unit tests are recorded; runtime and static frontend builds passed. These are prior evidence records, not checks rerun during migration.

The local runtime embeds assets and implements HTTPS on127.0.0.1 with launch capability→Secure/HttpOnly cookie and separate passphrase unlock. It is not a delivered real-data editor. RuntimeAdapter tests and trusted-browser edit/autosave/restart/commit/reconstruct acceptance remain unfinished. No runtime was launched or trust installed by migration. Local certificate/key artifacts remain ignored, and no secret/key is copied into current docs.

## Owner decisions requiring later code work

1. Keep serialization outside domain. Current crates/domain has Serde derives/dependency; move serialization DTOs/conversions outward in a separately authorized code change.
2. Require explicit record versions before durable real-data testing. Current database/envelope versions do not supply every payload record discriminator; exact format/migration tests remain to implement.
3. Retain immutable committed history; no automatic pruning/redaction/erasure exceptions are approved.

One-owner whole-Markdown buffers are the initial supported save contract; shared-node/nested closure editing, durable relationships/comments/provenance, keychain, provider agents/citations, client-held mode and federation remain unimplemented. A type definition, fixture icon or disabled service is not a capability.

## Next implementation work, only after owner resumes

Complete domain serialization separation and record-version design/compatibility, RuntimeAdapter delayed/lost retry and queued-edit/doc-switch/lock tests, updated dependency/license notices and proof replay compatibility. Then obtain explicit certificate trust approval when ready and test encrypted real browser/runtime workflow, embedded/development parity and exact source/history. Do not bypass TLS trust, invent new operation IDs after unknown outcomes or enable unsupported graph mutations.

## Documentation state

Nine levels and source/decision/coverage registers are assembled. All previous documentation is moved byte-for-byte to ignored .oldspecs at Phase C completion by owner instruction, with originals/current locations and hashes retained. Root README/AGENTS are current replacements; original copies remain archived. Existing legal text and executable sources stay active. The full human-readable proof digest is retained in [formal validation](../../08-assurance/formal-validation-digest.md).

Review the [migration report](../../MIGRATION-REPORT.md) for coverage/mechanical verification and unresolved editorial/technical questions. Preliminary Phase C approval does not adopt speculative requirements, approve all topic editorial bodies, change licenses or authorize publication. The durable private baseline remains outside Git; its historical receipt is preserved locally at `.oldspecs/docproject/migration-execution/baseline.json`. Current checks do not require that baseline. No reset/stash should overwrite owner work.

Owner-authorized records relocation: decisions now live in `docs/02-governance/OWNER_DECISIONS.md`, historical verification in `docs/08-assurance/migration-verification.md`, and the reusable checker in `scripts/verify_documentation.py`. All 15 execution originals are preserved byte-for-byte under ignored `.oldspecs/docproject/migration-execution/`; original/current locations and hashes are in [the archive manifest](../../registers/documentation-archive.json). See [the relocation record](../../08-assurance/documentation-records-move.md) for checks and limits. Application development and publication remain paused.

## Current source publication authorization

On 2026-10-25 the owner explicitly requested pushing all files to GitHub. Current source metadata is 0.8.0; this one-time authorization supersedes the publication hold for this snapshot only. Application implementation remains paused and integrated runtime acceptance remains unfinished. See [publication scope and current checks](source-publication-0.8.0.md). Private material in the unpushed local ancestor must not be published; retain local history and publish the current intended tree on a branch based on GitHub main.
