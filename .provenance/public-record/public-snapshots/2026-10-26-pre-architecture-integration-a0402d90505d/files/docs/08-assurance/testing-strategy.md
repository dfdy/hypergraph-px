# Verification and Testing Strategy

## Common metadata

- **ID:** `HPX-ASSUR-001`
- **Title:** Verification and Testing Strategy
- **Purpose:** Reported tests, proof evidence, limits and future acceptance strategy.
- **Level:** `08-assurance`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Requirements and invariants covered

Reported tests, proof evidence, limits and future acceptance strategy. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Test fixtures and inputs

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Unit/integration/property/fuzz cases

Published0.7.0 frontend evidence:54 Node tests and56 Chromium scenarios, plus eight Rust tests/format/Clippy at that milestone. Paused local work later reports two new Unicode/range cases, five storage tests (four process-exit children), two runtime parser/security-gate tests and a buildable runtime; no trusted-browser real-data workflow has passed. The intentional ignored crash_worker is invoked by its subprocess parent; it is not a passing standalone test. These are dated source reports, not tests rerun during this migration.

Requirements must trace to their real code/test/proof scope. Security, privacy, recovery, accessibility, performance and platform readiness require their own acceptance. Do not invent benchmark thresholds, WCAG conformance or remote CI success. Test a complete workflow before calling disconnected primitives an integrated application.

### Validation boundary

Source `HPX-SRC-0024`, original lines 74–78. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The adapter's Rust tests cover round-trips, independent encryption of equal content, tampering/context substitution, malformed/resource limits and passphrase rewrap preserving access to existing ciphertext. Dependency versions/checksums/licenses are recorded in [the runtime inventory](<../../legal/RUST_DEPENDENCIES.json>). No crypto function is Lean verified. Primitive correctness, OS entropy, client integrity, process memory and future I/O remain explicit trust assumptions. Formal-assurance evidence stays in the [Lean validation digest](<../07-implementation/formal-invariants.md>), separate from these requirements.


## Failure cases

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Platform matrix

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Pass/fail or measurement thresholds

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Automated reports

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 74–78; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
