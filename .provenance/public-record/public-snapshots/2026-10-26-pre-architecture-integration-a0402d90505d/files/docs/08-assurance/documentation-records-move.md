# Documentation records relocation

Date: 2026-10-25. Status: proposed editorial record; relocation explicitly authorized by the owner. Scope: documentation and its read-only checker. Normative meaning, acceptance, licenses and application behavior remain unchanged.

## Plan recorded before relocation

Continue on the existing `docs/nine-level-migration` branch, preserving its uncommitted work. Copy owner decisions byte-for-byte to `docs/02-governance/OWNER_DECISIONS.md`; retain historical verification at `docs/08-assurance/migration-verification.md`. Adapt the reusable checker into `scripts/verify_documentation.py`. Preserve every original execution file byte-for-byte under ignored `.oldspecs/docproject/`, with original names, paths, SHA-256 and byte counts in `docs/registers/documentation-archive.json`. Retain historical original paths in source registers and update only current locations for the active owner record. Preserve existing archive entries.

Update current Markdown links and navigation, the development-state handoff and migration report. No application source, tests, build configuration, license, Git index or history is to change. No publication is authorized. Private baselines and one-time generators remain local. The public checker validates metadata, IDs, links and register consistency without requiring local/private sources; `--check-local-sources` additionally validates archived bytes and source spans. Neither mode relies on a private baseline or frozen Git HEAD/index.

## Traceability and rollback

The archive manifest records each original and its recoverable location. Existing source IDs and hashes retain their scope; no new requirement or conflict resolution is introduced. To undo this relocation, copy the archived execution files back to their original paths and reverse only the relocation patch, preserving unrelated working-tree edits. Do not rerun historical generators over current documents.

## Verification

Executed 2026-10-25:

- Both `python3 scripts/verify_documentation.py` and its `--check-local-sources` mode passed. All 132 archive entries match their SHA-256 and byte counts, including 15 execution originals; archives remain ignored and untracked.
- The unchanged owner record matches its five existing source IDs/hashes. Current-location fields were rebased; original paths, source bytes, IDs and acceptance remain intact. Fourteen additional execution artifacts are registered as descriptive provenance, giving 138 source entries. No new requirements were inferred from scripts or receipts.
- Checked 52 materialized documents, 29 reserved IDs, 116 canonical sections, 169 retained source sections, 509 claim units and 25 requirement seeds. Local file/heading links and cross-register source locations pass.
- A temporary copy of publication-eligible files passed the default checker without `.oldspecs`, `docproject`, Git metadata or private baselines. Separate missing-link and source-location-drift fixtures failed as expected; fixtures were confined to the temporary copy.
- Compared existing working-tree file hashes captured before relocation: application/build/test/proof/license bytes are unchanged. Existing-file changes are confined to documentation and AGENTS; the only new executable is the read-only documentation checker. `git diff --check` passed.
- A bounded credential/private-key-pattern scan of changed/new active records and the checker passed. This does not establish publication rights or guarantee absence of every possible sensitive datum.

The original Phase C verification remains historical evidence in [migration verification](migration-verification.md). No application, browser, Rust or Lean checks were run. No files were staged, committed, pushed or published. Semantic adoption remains reviewable; application implementation stays paused.
