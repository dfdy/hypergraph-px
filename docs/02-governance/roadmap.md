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
- **Last reviewed:** 2026-10-26

Current source publication is 1.0.0. The bounded one-owner HTTPS/SQLite workflow and relationship/provenance increments have synthetic integration evidence; real-document acceptance and broader branch/shared/platform scope remain unfinished. See the current development state.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Gated delivery sequence without speculative release dates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Gated delivery sequence without speculative release dates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

The active sequence is core reconciliation → SQLite persistence/recovery → exact open/edit/autosave/restart/recover/commit/reconstruct workflow → authenticated encrypted browser/runtime integration and embedded packaging → incremental durable relationships/comments/provenance. Application development is paused; this migration does not resume it. Future keychain, scholarly integrations, client-held mode and federation retain separate acceptance gates. Mobile remains deferred.

That sequence is the retained source-era plan. Its early milestones now have bounded local evidence; use [current scope](../09-guides/reference/DEVELOPMENT_STATE.md#current-scope-and-evidence-summary) rather than interpreting the historical unimplemented statements below as current status. Application work is stopped after the latest wiring increment; this specification integration authorizes no new implementation or external service action.

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

## Resumed implementation progress, 2026-10-25

The owner resumed application work after the migration. The initial one-owner create/edit/autosave/restart/recover/commit/reconstruct workflow now passes against the real HTTPS/SQLite runtime in Chromium with explicitly approved user leaf trust. Source mapping, retry/lock behavior, record-version decoding and embedded asset parity have current evidence in [the development state](../09-guides/reference/DEVELOPMENT_STATE.md). Broader startup/unlock support, supported-machine certificate lifecycle and durable graph/annotation services remain bounded by the existing open decisions; this evidence does not adopt unspecified mechanisms or authorize publication.

## Local reviewed synthesis checkpoint, 2026-10-26

The owner adopted HPX-ADR-015's first Merge scope. Local implementation now publishes human-reviewed synthesis into a new independent document, retaining ordered exact inputs and immutable history with original source authorship explicitly unknown. The 27-check actual synthetic HTTPS/SQLite/old-reader workflow passed; no release was published. Source/format acceptance and deferred shared composition, branch merge and provider mechanisms retain their own gates. See [current evidence and handoff](../09-guides/reference/DEVELOPMENT_STATE.md).

## Planned branch-parent Merge workflow — owner clarification, 2026-10-26

The owner clarified that the intended interface **Merge** action is to merge the current document text from its current branch **into a parent branch**. Record this within stage **5 — Branch/compare/selected integration**. This is future planned work, not an immediate implementation priority or an instruction to resume paused application development.

Sequence this work after durable multiple-branch identity/head support, branch-specific recoverable drafts and safe branch selection/viewing. Then add current-versus-parent comparison and a reviewed Merge into the identified parent branch, with explicit conflict handling, atomic target publication and retained source/target histories. Branch viewing/switching can arrive before branch merging; local branching does not depend on federation or multi-user support.

The parent branch is the intended destination, rather than a newly created independent document. The existing reviewed new-document synthesis remains a separately recorded implemented scope and does not fulfil this clarified branch-parent workflow. Preserve its historical approval/evidence in [ADR015](../04-architecture/decisions/0015-initial-merge-workflow.md#later-owner-clarification-parent-branch-merge). Before enabling branch-parent writes, specify parent-branch identification, merge-base/conflict review, handling of uncommitted current text and versioned same-identity ancestry/compatibility. No automatic commit, branch deletion or conflict resolution is implied.

## Future Pandoc export and citation compilation — owner confirmation, 2026-10-26

Schedule HPX-RQ-030 within stage6 remaining local integrations, after the exact authorized export model, relevant branch/closure selection and captured citation-resource foundations are available. Plan embedded/bundled Pandoc feasibility and distribution/license review, then verified target profiles for .docx/.odt/.rtf/.html/.tex/.typ/.xml/.json, academic citations/bibliographies and selectable branch/annotation/provenance/relationship supplements. Each profile needs explicit readable fallbacks and appended unresolved-rights reporting without overriding access or egress rules. Main-branch-only output can precede additional-branch export once its own input model is ready. This confirms future specification inclusion only: do not install Pandoc or reprioritize current implementation. See [the planned contract](../06-subsystems/import-export.md).

## Working-branch refinement before branch integration, 2026-10-26

The owner adopted ADR018 committed-snapshot child creation and then requested designing working branches now. [ADR019](../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) precedes stage5 branch UI integration: private editing/checkpoints, automatic retained-source capture and exact promotion/replacement semantics must be reconciled first. Existing committed-passage comments remain within ADR017; branch Merge and future bundled export retain their separately scoped later plans. This refinement is neither an implicit Commit-on-copy policy nor implementation evidence.

## Next implementation units after review integration

These are small dependency-ordered units for a future explicit implementation resume. Use the existing state/test records, not mandatory new issues, reports or a sprint process. Current working functionality and full future scope remain intact. [Finding dispositions and impact](../09-guides/reference/implementation-resumption.md#architecture-review-integration-2026-10-26) supply the review trace.

| Unit / capability | Authoritative specification / dependencies | Affected implementation | Acceptance / migration / approval |
| --- | --- | --- | --- |
| 1. Complete working-source inspection | ADR019; HPX-DATA-001 kind27 and browser/runtime contract; existing gated WorkingFork reader | storage/working_forks.rs; runtime route; frontend Provenance panel | Inspect exact retained unpublished source after edits/restart, with current permission and original receipt. No format change selected. Existing adopted scope; owner resume required. |
| 2. Close branch/working integrated lifecycle | ADR018/019; HPX-RQ-031 acceptance; unit1 | RuntimeAdapter, branch/reference controls, CodeMirror context cache, storage branch/checkpoint/reference modules | Actual isolated HTTPS/SQLite capture, independent drafts, switch/undo/redo, delayed/lost replies, lock/restart, exact Commit and separately retried replacement; original evidence retained. Test actual older-reader20–27 preservation and invalidation after old writes. No migration assumed: if preservation fails, return for explicit backed-up rollout/compatibility decision. |
| 3. Advertise only the verified bounded capabilities | Browser/runtime capabilities and HPX-TEST-038 remaining gates; unit2 | Runtime metadata; frontend capability gates; existing integration harness | Supported desktop widths/themes and source below table/math widgets, full actual workflow and clean test teardown before guarded exact-tested-binary manual refresh. No code/metadata enablement or handoff from this documentation task. |
| 4. Establish audit/recovery contract before repair | HPX-ASSUR-006 authoritative/derived matrix; HPX-GAP-024 | Storage diagnostics and existing fault/restart tests; future restore adapter | Bounded read-only authenticated audit first. No guessed heads, lost drafts, opaque-record deletion or mutating repair until deterministic sources, backup/atomicity and recovery are specified. Migration/repair policy not selected; owner approval before changing authoritative data or recovery guarantees. |
| 5. Measure concrete cost/quality scenarios | Testing strategy; supported workload selection | Existing storage/frontend/runtime checks, without new production framework | Measure receipt growth, large-source serialization/read work, mutex contention and desktop accessibility tasks; distinguish observations from accepted targets. No pruning, cache, lock redesign or numerical budget adopted. New quality thresholds require owner acceptance. |
| 6. Resolve freshness scope before security acceptance | Threat model HPX-GAP-023; ADR003 and full recovery/portability requirements | Later storage/crypto/OS or independent witness design, if selected | First define which independent state an attacker can restore, offline/missing-witness outcome and intentional restore/device-transfer behavior. No absolute detection guarantee or reduced gate selected. Owner decision remains outstanding; this does not block synthetic development. |
| 7. Select the next future feature only after its prerequisites | Existing stages5/6; HPX-GAP-004/006/008/011/012/013/014/021 | Relevant composition, rights, import/export, Zotero/GitHub/agent/MCP or federation adapter | Preserve full requirements. Decide exact policy/schema/compiler/remote reconciliation/causal conflict mechanisms when that feature is selected; retain privacy, approvals, formats and proof gates. No new formats, migrations, providers or permissions are adopted by this list. |

Do not make all future designs prerequisites for the bounded local editor. Conversely, do not weaken rights, provenance, immutable history, mathematical semantics, interoperability, verification or federation ambition to reduce present workload. Organizational simplification means one concise increment record; technical optimizations require evidence and the same invariants.
