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
- **Last reviewed:** 2026-10-26

Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.

The checkpoint counts retained below are historical. The [current scope/evidence summary](../09-guides/reference/DEVELOPMENT_STATE.md#current-scope-and-evidence-summary) and [test register](../registers/tests.csv) separate integrated local behavior, gated branch/working code and future acceptance. This refinement executes documentation/archive checks only; it does not rerun application tests or promote the review's abstract model into implementation proof.

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

Correctness gates remain in [acceptance criteria](../03-requirements/acceptance-criteria.md), [publication protocol](../07-implementation/protocols/draft-publication.md) and [recovery](recovery.md). New performance/accessibility/platform thresholds require an explicit supported scenario and owner acceptance; no invented latency target or WCAG/platform conformance follows from passing examples.

For the next selected workload, record input size, operation/context count, environment, observed time/memory/storage, exact result and source-byte/history invariants. Reuse the existing test/work record rather than a new metrics system. HPX-FIND-005/006/007/017 motivate these investigations:

- Changing autosaves and retained receipts: measure DB/WAL/backup growth against acknowledged Save and explicit Commit counts. Idle timing is not a fixed perpetual save frequency. Preserve original-result replay and immutable history; no retry horizon, receipt expiry or pruning is adopted.
- Large working-source capture/list inspection and simultaneous Save/history/unlock: measure serialization, allocations, authenticated source reads and mutex waiting before introducing caches, new representations, finer locks or services. A socket deadline does not cancel an executing KDF/transaction. Any optimization must retain exact bytes, current authority and operation atomicity.
- Supported desktop keyboard/screenreader and source-under-widget workflows: identify the intended user task and expected behavior; retain theme/width/selection/undo requirements. Broader accessibility/platform acceptance stays explicit and unclaimed until checked.

Analytical complexity and repeated-work hypotheses are not measured regressions. General federation, compiler/export and recovery acceptance remain deferred with their full requirements intact. Four Lean model theorems, an extracted-helper theorem, a handwritten bounded review model and ordinary executable tests remain distinct evidence classes.

## Automated reports

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 74–78; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
