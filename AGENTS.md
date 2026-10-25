# Development instructions

## Current owner instruction: publication hold

The owner explicitly instructed “Don't push to github unless I ask you.” Do not push, release or make GitHub issue/comment updates until the owner explicitly requests publication again. Local implementation/testing remains authorized. Use local work records while held. This overrides the automatic milestone publication rules below. The owner authorized one milestone push on 2026-10-25, including a refreshed README screenshot. After that push, this hold remains in force; do not treat the one-time authorization as permission for subsequent publication.


1. Work in `Hypergraph PX MU-F` and `dfdy/hypergraph-px`. Keep source, runtime data and credentials separate; never import unrelated runtime material.
2. Read `Specifications/README.md` for the current specification map, then the relevant model, approved decisions and issue. Keep Specifications self-contained: only current specifications, with no references to a previous application or imported reports.
3. Track bounded work in GitHub issues and record assumptions, invariants, tests and recovery implications before code. Persist owner decisions; do not ask repeatedly for previously granted routine authorization.
4. Keep logical identities, immutable revisions, placement occurrences, transformations, snapshot bindings and encrypted storage addresses distinct. Preserve histories and exact source provenance.
5. Separate pure domain validation, application authorization/orchestration, storage/crypto adapters, transport and browser state. All interfaces use the same operation semantics. Releases embed frontend assets in one Rust executable; development tools are not runtime services.
6. Cryptographic configuration does not grant keys. Never silently downgrade workspace security policy, expose plaintext indexes/drafts/logs in an encrypted mode, invent a crypto protocol or imply federation encryption solves graph conflicts.
7. Maintain `proofs/VALIDATION_DIGEST.md` for every newly Lean-validated function/theorem, with human-readable guarantees, technical proof method, assumptions, source/toolchain/CI evidence and actual Rust correspondence status. Specify proof scope and assumptions. Lean model proofs are not automatically Rust implementation proofs. Keep selected Rust algorithms small and deterministic; pin proof/extraction tools once chosen and report actual checked results.
8. Maintain `Specifications/DATA/README.md` with actual types, navigation functions, invariants, complexity, errors, authorization, encryption visibility and examples. Mark unimplemented designs clearly.
9. Test one complete user workflow early, including whole-buffer ownership, mutable draft autosave versus explicit commit, delayed acknowledgements and crash recovery.
10. Do not record secrets, private user documents, tokens, runtime databases or generated test traces in Git. Keep dependencies/copied source/conceptual influences distinct, with licenses and provenance reviewed before use.
11. Record only executed checks as passing. Record the exact source, scope and toolchain for validation evidence. Ask about consequential unresolved architectural decisions; make routine implementation decisions autonomously within approved scope.

12. At each completed milestone, record its scope and actual validation evidence, commit the relevant source/documentation, and push to the configured GitHub remote without asking again for routine approval. A milestone is a bounded, reviewable outcome, not every edit. Preserve unrelated work, exclude secrets/runtime data, and never force-push to bypass divergent history. Verify push success; if push or CI fails, investigate and report the actual state rather than claiming publication.

13. Before every push introducing new milestone changes, increment the project version according to Specifications/SPECIFICATION.md §8 and SemVer 2.0.0. Synchronize Cargo workspace/lockfile, Lean package metadata and current documentation; update CHANGELOG.md. Use the largest applicable change class, preserve historical evidence, and do not bump schema/protocol/toolchain versions automatically. Retrying the exact same versioned commit needs no extra bump.

14. Maintain docs/DEVELOPMENT_STATE.md as the context-compaction handoff. Before a significant transition or compaction, update current issue/branch/version, owner decisions or their authoritative links, exact implemented/unimplemented boundaries, executed validation/publication evidence, unresolved findings and concrete next steps. Read it when resuming; do not infer progress from conversation alone. Never store credentials in this record.

15. For frontend layout and styling changes, visually inspect the actual rendered interface before reporting completion. Compare related components directly, use relevant desktop widths/themes and record observed geometry/appearance alongside tests. Do not rely only on code or automated assertions to catch spacing, colour and alignment issues. For editor geometry, inspect below rendered tables and maths as well as the document top. Mobile work remains deferred.
