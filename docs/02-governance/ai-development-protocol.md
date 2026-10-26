# AI Development Agent Protocol

## Common metadata

- **ID:** `HPX-GOV-006`
- **Title:** AI Development Agent Protocol
- **Purpose:** Human authority, agent change boundaries and evidence discipline.
- **Level:** `02-governance`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-PRIN-002](<../01-purpose/principles.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-26

Owner messages override procedural source text. This task is documentation-only; implementation and publication remain paused.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Human authority, agent change boundaries and evidence discipline. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Human authority, agent change boundaries and evidence discipline. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

### Proportionate current work records

For the current owner-and-agent arrangement, use the existing development-state handoff and update only affected requirement/test/compatibility/decision rows for a material increment. Preserve the minimal chain **finding → requirement/decision → specification → code impact → actual or pending check**. A minor factual correction does not require another report, ADR, GitHub issue, PR or approval round. Create an ADR when choosing consequential semantics, not merely to restate an accepted rule. External issue/comment actions and publication still require their own authorization.

The source-era procedures below retain their historical context; references to a bounded issue are not a requirement to contact GitHub for each local increment. Current navigation is [docs/README.md](../README.md), and current execution scope is in the [development state](../09-guides/reference/DEVELOPMENT_STATE.md). The owner's review-integration instruction authorizes documentation corrections only. Application work remains stopped. This reduces record duplication, not mathematical precision, exceptional cases, test obligations, future capability or human authority over substantive design/security changes.



### 8. Implementation documentation rule

Source `HPX-SRC-0026`, original lines 126–130. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

As code lands, replace sketches with real Rust symbol/source links, canonical examples, error enums, query pagination and proof/test references. Record measured complexity/latency separately from expected asymptotics. Each new traversal must state edge projection, ordering, duplicate/cycle behavior, budget, authorization and what ciphertext/plaintext it needs. Each mutation must additionally state identity effects, immutable history, expected heads, provenance and crash/retry behavior.

### Development instructions

Source `HPX-SRC-0002`, original lines 1–2. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Source title/navigation context retained by this subsection; no additional requirement is inferred.

### Current owner instruction: publication hold

Source `HPX-SRC-0002`, original lines 3–26. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

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

13. Before every push introducing new milestone changes, increment the project version according to Specifications/SPECIFICATION.md §8 and SemVer 2.0.0. Synchronize Cargo workspace/lockfile, Lean package metadata and current documentation; update CHANGELOG.md. Use MAJOR for incompatible API changes, MINOR for backward-compatible new functionality and PATCH for backward-compatible bug fixes, including while on 0.x; use the largest applicable change class, preserve historical evidence, and do not bump schema/protocol/toolchain versions automatically. Retrying the exact same versioned commit needs no extra bump.

14. Maintain docs/DEVELOPMENT_STATE.md as the context-compaction handoff. Before a significant transition or compaction, update current issue/branch/version, owner decisions or their authoritative links, exact implemented/unimplemented boundaries, executed validation/publication evidence, unresolved findings and concrete next steps. Read it when resuming; do not infer progress from conversation alone. Never store credentials in this record.

15. For frontend layout and styling changes, visually inspect the actual rendered interface before reporting completion. Compare related components directly, use relevant desktop widths/themes and record observed geometry/appearance alongside tests. Do not rely only on code or automated assertions to catch spacing, colour and alignment issues. For editor geometry, inspect below rendered tables and maths as well as the document top. Mobile work remains deferred.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Human authority, agent change boundaries and evidence discipline. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 126–130; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0002` — `AGENTS.md`, lines 1–2; SHA-256 `395aadaad5ede26c3e7091502e8266720e4d229fc40c7734ed810906f7aebac1`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0002` — `AGENTS.md`, lines 3–26; SHA-256 `395aadaad5ede26c3e7091502e8266720e4d229fc40c7734ed810906f7aebac1`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
