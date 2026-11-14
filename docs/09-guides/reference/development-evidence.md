# Development/source provenance navigation

## Common metadata

- **ID:** `HPX-GUIDE-006`
- **Title:** Development/source provenance navigation
- **Purpose:** Source provenance, work history and proof inventory; current execution status is maintained in the development-state guide.
- **Level:** `09-guides`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-GOV-004](<../../02-governance/roadmap.md>); [HPX-ASSUR-001](<../../08-assurance/testing-strategy.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-11-03



Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Audience and prerequisites

Source provenance, work history and proof inventory; current execution status is maintained in the development-state guide. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Task and expected result

Source provenance, work history and proof inventory; current execution status is maintained in the development-state guide. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Procedure

Use the [current execution status](DEVELOPMENT_STATE.md#current-execution-status), [scope/evidence summary](DEVELOPMENT_STATE.md#current-scope-and-evidence-summary) and [change-sensitive workflow](#change-sensitive-development-workflow-hpx-owner-019) for current work. The following pre-resumption checkpoint preserves its original status and is not a current development pause or publication grant.

### Historical pre-resumption checkpoint

Published version0.7.0: commit2ebe35b8c966ab83530174fcebc8f245238625cb. The working tree includes unfinished encrypted storage/runtime integration from before migration; do not discard it or call it delivered. Application development is paused, publication held. Current documentation migration [owner decisions](../../02-governance/OWNER_DECISIONS.md) and [historical verification](../../08-assurance/migration-verification.md) are maintained in docs; the [relocation record](../../08-assurance/documentation-records-move.md) describes current checks. Dated earlier work records, source studies, proof digest and review reports are retained byte-for-byte under ignored .oldspecs with SHA256/source IDs in registers. Public readers must not be promised access to local/private originals; hashes preserve identity, not access rights.

### 9. Implementation evidence and resumable progress

Source `HPX-SRC-0032`, original lines 108–112. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Maintain [docs/DEVELOPMENT_STATE.md](<DEVELOPMENT_STATE.md>) as the context-compaction handoff, with confirmed decisions or authoritative links, published milestone/CI evidence, active issue and uncommitted work, actual boundaries, unresolved findings and exact next steps. Update it before significant transitions or compaction; never record credentials. Bounded issue work records retain chronological implementation/verification findings; ADRs record design reasons; the data reference and Lean digest record actual APIs and assurance. A context reset must not silently convert proposed features or unobserved checks into completed work.

### 10. Work order for the frontend agent

Source `HPX-SRC-0028`, original lines 284–289. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Start with stage A and keep the visual implementation behind the adapter in §3. Use synthetic fixtures with repeated/nested content, document-local prose, inserted text, Unicode, a small table and mapped formula source. Include pinned human/agent, other/offline contributors, a logged-in noncontributor, missing-agent and unknown/mixed authorship fixtures without inventing authenticated peers or crediting imported text to the current user. Implement controllable delayed acknowledgements, conflicts, locked/unavailable states and uncertain commit outcomes so the UI can exercise §§4–6 without real storage. Show fixture status and keep advanced live capabilities unavailable.

Deliver the interface, adapter/fixture modules, setup instructions, dependencies/licenses and the actual browser/adapter checks executed against §9. Document unanswered transport/schema questions for the Rust developer. Do not implement graph authority, invent a database/encryption format, connect a real provider, or claim real durability to make a visual control appear finished. Move to stage B only after its backend contract and acceptance gate exist.


## Examples

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Troubleshooting and limitations

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Related references

Source provenance, work history and proof inventory; current execution status is maintained in the development-state guide. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 108–112; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 284–289; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.

## Change-sensitive development workflow (HPX-OWNER-019)

This section governs verification coordination; historical evidence above is unchanged. HPX-TEST-072 was a process-only checkpoint under the earlier owner stop. HPX-OWNER-021 subsequently resumed Markdown delivery and API work; current application evidence is recorded separately.

### Confirmed overhead and implemented response

| Confirmed source of overhead | Response |
| --- | --- |
| Repeated default-app22-check regressions/handoffs between unintegrated temporal components; the retained198/201/203 Rust checkpoints distinguish their actual sensitive-storage work from unchanged ordinary-app checks. Sensitive storage regressions can remain justified. | Deliver coherent vertical milestones. Use targeted feedback within them and applicable comprehensive acceptance at integration boundaries; source-only components are not delivery. No claimed retrospective timing total. |
| Unconditional bundling/copying on every frontend dev/build/screenshot invocation. The generated tree had1,196 extra font-copy files (21,398,304 bytes). | Content-keyed generated-asset snapshots; clean required output and skip rewriting unchanged dist. All68 required output files matched the prior generated files byte-for-byte. Extra unreferenced copies are excluded. |
| Fixed5173 preview plus reuse of an existing server could consume old assets. | Each `npm run test:ui` owns a verified immutable asset snapshot and OS-assigned loopback port; direct unconfigured Playwright execution fails with guidance. No existing server is reused. |
| Concurrent Playwright runs previously shared traces/screenshots/output and caused actual ENOENT cleanup failures. | Unique per-run results, JSON report, screenshots, server and headless browser. Independent runs were tested concurrently. Failed or input-mutated runs cannot become successful evidence. |
| Long checkpoint facts copied into both progress guides and other documents; an intermediate46 executable preceded the final UI correction. | Short current summary plus one chronological entry/test row; machine JSON carries exact run facts. Separate feedback, final compilation, acceptance and guarded handoff. Historical records are retained. |

### Procedure

1. Define the next complete user-visible capability and its acceptance boundary. Keep implemented/unintegrated, experimental, integrated, acceptance-verified and deployed states distinct. Declare the exact increment's files; do not treat all retained dirty work as a new change.
2. Inspect a plan: `node shared/tooling/verify-change.mjs --files frontend/styles.css`. `--run A` executes development feedback only. The conservative file-level advisor does not understand semantic diffs and cannot waive contract tests. Rust/storage/proof/guard/unknown inputs trigger broader review; do not classify a security change as cosmetic to obtain a smaller plan.
3. Tier A: relevant unit/component/static checks, e.g. `npm --prefix frontend test` or `npm --prefix frontend run test:ui -- tests/browser/markdown-presentation.spec.js`. Tier B: affected cross-subsystem/storage/auth/source/recovery interactions. Tier C: applicable full regression, compatibility, crash/encryption, desktop/theme/accessibility, documentation/archive and changed-assumption proof checks at a coherent milestone or immediately when risk requires. Record why omitted broad suites remain outside the declared change; old evidence keeps its old scope.
4. Browser commands now build/reuse a content-checked snapshot without changing frontend/dist, Rust outputs or the manual app. `artifacts/ui-runs/run-*/run.json` records source/asset/test identities, selection, cache status, phase times, result and report statistics. Related screenshots/traces/report stay inside that run. Assets and declared inputs are checked again at completion; changed inputs, missing report or zero executed tests invalidate success. A failed test/fixture still needs diagnosis, not an inferred product defect or automatic retry.
5. Run independent Node/document/static checks concurrently. Browser runs may run concurrently through the isolated runner, with source edits excluded during verification. Serialize Rust compilation against mutable dist generation and serialize actual integration/native/deployment jobs unless their resources are explicitly isolated. Do not parallelise shared runtime output, credentials or handoff state. `npm --prefix frontend run build` prepares canonical generated dist only when needed, reusing valid content and preserving unchanged mtimes. Never edit cache snapshots used by running tests; corrupt-cache recovery is not test acceptance.
6. Compile the final Rust executable once when ready for actual integration; preserve its mandatory fourth build component. Source identity, generated assets and the executable SHA are separate. Run required actual HTTPS/SQLite checks against that executable. **HPX-OWNER-020 now authorises milestone-based manual refresh: intermediate actual runs verify exact executable equality but defer deployment; pass `--handoff` only for a completed verified user-visible milestone or an explicit update request.** Same-hash restart skipping and workspace/origin/locked-start/upgrade boundaries are unchanged. Preview/component success is not executable acceptance. The opt-in changes cadence only; failed checks or changed bytes cannot hand off.
7. Update one concise current-state summary, one chronological entry and the existing test register; reference machine evidence instead of copying a full narrative. Update requirement/source/decision/proof records when their scope changes. Preserve prior history and archive checks; no parallel governance/reporting layer. Formal replay remains required when its exact source/toolchain/dependency assumptions change, with no broader proof inference.

### Measured scope and limits

Local observations on2026-10-27, unchanged app source/dependencies. The baseline used two unconditional frontend builds (0.930s initial,0.131s warm); a cold content-cache snapshot took0.338s. Fresh-Node cached canonical builds took0.113s twice after a0.989s first cleanup/copy of the old generated tree. Within-process warm cache checks took0.046–0.061s; these exclude fresh Node startup and must not be compared as equivalent command totals. An unchanged canonical build preserved every output mtime. Clean output is68 files/3,193,091 bytes, excluding the21.4MB extra files. These are small warm-build savings, not a measured order-of-magnitude build improvement.

Two selected existing presentation scenarios completed in6.28/6.95s total in concurrent isolated runs; the full95-scenario run completed in92.58s (Playwright92.03s), versus the previous recorded approximately96s. The focused/full comparison is different coverage: it demonstrates faster appropriate Tier A feedback while the complete milestone regression is retained, not equivalent acceptance in less time. The few full-run seconds are not an established speedup. The earlier194.15s Rust storage suite was not rerun because all114 existing app/Rust input files and proof/dependency assumptions were unchanged; no new backend acceptance is claimed.

Cache corruption rebuilt to the same asset digest; timestamp-independent content tests, unknown/sensitive planning tests, concurrent isolation, deliberate no-match failure, zero-test success rejection and input-change invalidation passed. Completed private servers were confirmed stopped. The executable/build counter/manual-session record and both handoff helpers plus Rust build hook remained byte-identical; no Rust compile, actual runtime integration, handoff, migration, enrollment, trust/provider action or publication occurred. Raw aggregate observations remain local in ignored artifacts; HPX-TEST-072 records the durable result and limits.

HPX-OWNER-020 resolves deployment cadence in favour of completed verified user-visible milestones or explicit requests. HPX-OWNER-021 separately resumes Markdown first, then generated-contract Fork integration.

Documentation effort and time-to-completed-capability were not instrumented before this change. Overall development throughput remains unmeasured; future per-run phase timings supply a baseline without adding telemetry or a new reporting service.

### LikeC4 validation cadence

Owner instruction, 2026-10-30: reduce repeated layout computation after the reported VS Code memory suspension. LikeC4 is a suspected contributor; this workflow change does not establish the cause or a measured memory reduction.

| Boundary | Required checks |
| --- | --- |
| Editing feedback | Use the existing `npm --prefix docs/architecture run validate` command (`--json --no-layout`). Check relevant links and source/status mappings. Do not calculate every view merely to validate syntax or prose-only changes. |
| Completed model stage | Check model/navigation and source scope; calculate and inspect the served manual arrangement of changed views and views affected through shared elements, relationships, styles or configuration. Verify drift, snapshot metadata, labels, bounds, positions and paths. Check unaffected saved snapshots by bytes/hashes without computing their layouts. |
| Coherent milestone or global layout change | Run complete applicable model/navigation and saved/served layout regression once against the final unchanged source. Broaden immediately when the affected set cannot be bounded, global layout settings change, or a failure suggests wider impact. |

Reuse an existing LikeC4 language/model service for related reads; avoid launching another parser/layout service for each check. Serialize expensive layout computations and let owned one-shot validation processes exit after completion. Do not run a development server or static-site build solely for validation. Keep acceptance and preservation obligations; if targeted tooling is unavailable, state that limitation and run the necessary broader check once at the coherent boundary rather than repeatedly between edits.

Evidence must name the views actually computed, why they were selected, the source/snapshot identity and deferred full regression. A byte-identical snapshot alone does not establish a drift-free served arrangement. Data-based layout checks are not rendered visual inspection. Completed stages are scoped verification; deferred milestone checks must not be reported as passed. Re-run only after new changes, failures or unresolved concerns justify it.

### Generated Fork contract checks

Under OWNER021, application work has resumed after the process-only checkpoint. For API changes run `npm --prefix frontend run api:check` and relevant Node/runtime tests; use `api:generate` for an intentional compatible addition. The feature-gated Rust exporter is development tooling, not a second release service. Existing API schemas/operations are conservatively frozen by the checker; do not refresh an incompatible baseline without the required review/approval. Actual HTTPS checks also validate selected Fork payloads against generated components with a test-only bounded schema interpreter; this does not establish domain or storage correctness. Full integration/hand-off rules above remain applicable.


## Shared user API specification checkpoint, 2026-10-30

HPX-TEST-114 / HPX-OWNER-029 / HPX-RQ-037–038 record documentation/model checks for common browser/MCP hypergraph access and granular per-user permissions. [Executed evidence](../../architecture/evidence/shared-user-api.json) and [coverage/gaps](../../architecture/audits/shared-user-api.md) distinguish accepted requirements from incomplete single-owner implementation. No application/security acceptance tests, compilation, launch, provider/trust/workspace change, commit or publication were performed.


## Specification reconciliation checkpoint, 2026-10-30

HPX-TEST-116 records the [scoped audit](../../architecture/audits/specification-reconciliation-audit.md) and [actual static checks](../../architecture/evidence/specification-reconciliation-audit.json): registered-contract coverage, superseded-claim regressions, immutable backups/public-archive/application hashes and LikeC4 source/navigation/layout preservation. No application or security acceptance/proof was executed; current code inspection and earlier executed tests remain distinct.
