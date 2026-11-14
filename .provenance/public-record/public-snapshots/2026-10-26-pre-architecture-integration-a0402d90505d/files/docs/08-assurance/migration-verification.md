# Migration verification results

Date: 2026-10-25. Phase C editorial assembly is complete; mechanical Phase D checks pass. Independent semantic/topic adoption remains reviewable. Application implementation remains paused.

These are historical Phase C/D results, not assertions rerun by the reusable checker. See [the relocation record](documentation-records-move.md) for subsequent moves and current checks.

## Executed checks

- Preserved all230 baseline files: original documentation bytes are at their recorded archive locations; application source, tests, schema code, build/CI configuration, dependency/proof source and existing local changes retain exact baseline hashes.
- Moved116 prior documentation/control files byte-for-byte into .oldspecs; preserved the original .gitignore separately, for117 archive-manifest entries. Added only the owner-authorized /.oldspecs/ exclusion to the current ignore rules.
- Verified every archive-manifest checksum. The durable private recovery archive hash still matches its recorded receipt; its230 members were individually checked when created. The historical baseline receipt is retained locally at `.oldspecs/docproject/migration-execution/baseline.json`; private recovery archives remain outside Git.
- Verified Git HEAD remains `a661f0723c9ec1dcc2abd4a3967e05a50ae762e8`; branch is `docs/nine-level-migration`. Git index is unchanged. No staging, commit, push, release or history rewriting occurred.
- Verified52 materialized contract/guide documents have unique registered IDs, required metadata, explicit status and valid upstream IDs.29 unmaterialized candidate IDs remain reserved rather than becoming empty specifications.
- Verified all116 non-index canonical source sections are covered;169 canonical/policy/proof-evidence sections retain source text (allowing rebased relative links), source spans/hashes and current destinations.509 paragraph claim units and25 requirement seeds are registered; compound obligations remain visible for later atomic refinement.
- Verified all124 source entries resolve through current_path; embedded archive sources additionally use archive_member. Exact current file/member checksums match. Current-location fields agree across source/section/claim/coverage/mapping registers. All110 template-pack member hashes match the moved ZIP.
- Verified current Markdown local file and heading-fragment links, requirement/design/code/evidence references and source/map coverage. Two post-archive references were corrected in new documentation: the old proof digest trace now points to its active evidence document, and the extracted proof guide points to the preserved active reproduction guide. Original archived bytes were not edited.
- Verified every archived path is ignored and no .oldspecs path is tracked. Existing published Git history remains intact. Root/upstream license text and executable frontend/index.html remain active and unchanged.
- `git diff --check` passed. A bounded credential/private-key-pattern scan of new documentation passed; this is not a guarantee that all possible sensitive information is absent or permission to publish private inputs.

Run `python3 scripts/verify_documentation.py` for current metadata, links and register checks without private sources. Add `--check-local-sources` to verify local archived source bytes and spans. Neither mode rechecks the historical private recovery archive or freezes Git HEAD/index. Do not rerun the one-time assembly/archive scripts over user edits. The retained Phase A/B verifier in .oldspecs describes its original pre-migration layout and is historical, not the current checker.

## Assurance limits and unresolved work

No application/browser/Rust/Lean tests or remote CI were run for this documentation-only task. Previously reported software/proof evidence retains its source/date/toolchain scope; no new security/correctness result is claimed. The complete human-readable proof digest and both reproduction guides remain active.

Owner decisions resolve immutable history, external serialization and explicit record versions. Actual domain Serde usage and missing per-payload versions remain code follow-ups; live TLS browser/adapter acceptance remains unfinished. No migration/crypto bytes, retention exception, federation protocol, community governance, license scope or private publication right is invented.

Original historical broken links remain unchanged in .oldspecs; current active links resolve. Originals are recoverable from the archive and durable private baseline. Current root README/AGENTS route to the new documentation. Editorial assemblies are proposed while inherited accepted obligations and explicit owner decisions retain authority. Review topic meaning and remaining open questions before publication; preliminary approval is not a commit/push authorization.
