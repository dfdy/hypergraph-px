# Roadmap and Milestones

## Common metadata

- **ID:** `HPX-GOV-004`
- **Title:** Roadmap and Milestones
- **Purpose:** Gated delivery sequence without speculative release dates.
- **Level:** `02-governance`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-PRIN-004](<../01-purpose/scope-and-non-goals.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Published version is 0.7.0. Local storage/runtime work is uncommitted; browser integration is not accepted for real-data testing.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Gated delivery sequence without speculative release dates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Gated delivery sequence without speculative release dates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

The active sequence is core reconciliation → SQLite persistence/recovery → exact open/edit/autosave/restart/recover/commit/reconstruct workflow → authenticated encrypted browser/runtime integration and embedded packaging → incremental durable relationships/comments/provenance. Application development is paused; this migration does not resume it. Future keychain, scholarly integrations, client-held mode and federation retain separate acceptance gates. Mobile remains deferred.

### 7. Initial implementation order and gates

Source `HPX-SRC-0032`, original lines 82–93. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

1. Repository/issue tracking, confirmed architecture decisions and current specifications.
2. Pure constrained-graph validators and documented navigation contracts; first model obligations and Aeneas feasibility.
3. Reviewed identities/canonical object and signed/encrypted envelope design, key lifecycle, authorization and storage publication/recovery.
4. Minimal local encrypted persistence/drafts and independently developed whole-document editor, packaged/tested in the Rust executable. Prioritize authenticated encrypted browser/runtime transport before connecting real document data.
5. Branch/compare/selected integration and human/mock-agent structural workflows with crash/permission/provenance evidence.
6. Remaining local integrations and hardening; future multi-user, offline exchange, federation and client-held mode through separate explicit acceptance gates.

Use a bounded issue per increment, reproducible checks, license/provenance accounting, pure-core property/differential tests, recovery/failpoint tests and real-browser embedded/development parity. Do not treat disconnected internal primitives as a complete editor milestone. The in-memory trusted-server adapter now defines versioned object/key envelope bytes in [the encryption specification](<../06-subsystems/security-cryptography.md>) and [ADR 0002](<../04-architecture/decisions/0002-trusted-server-envelopes.md>). This is not a complete encrypted storage mode: durable publication, policy enforcement, OS-keychain integration, the live Rust-integrated editor and federation remain unimplemented. A synthetic browser-only preview is separately runnable without authentication; its tab-only simulations do not satisfy the durable editor gate.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Gated delivery sequence without speculative release dates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 82–93; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
