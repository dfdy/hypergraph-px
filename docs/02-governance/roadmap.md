# Roadmap and Milestones

## Common metadata

- **ID:** `HPX-GOV-004`
- **Title:** Roadmap and Milestones
- **Purpose:** Gated delivery sequence without speculative release dates.
- **Level:** `02-governance`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-PRIN-004](<../01-purpose/scope-and-non-goals.md>)
- **Downstream dependencies:** [requirements and implementation traces](<registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-30


## Current adopted design — OWNER059

The directly selected D01–D22A briefs now have diagram-owned definitions and precise supplements: [CAN030 / Integration export and delivery design](../06-subsystems/contracts/integrations-and-delivery.md). These govern the listed design questions; earlier open-mechanism statements below retain their historical checkpoint scope where superseded by this explicit decision. Candidate record/profile designs are not active formats or implemented capability. Exact retained source/byte/history and accepted obligations remain; actual code, measured capacity, genuine older-reader, recovery/security/UI acceptance and proofs are separately unperformed. No original source provenance or as-run evidence is rewritten.

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../04-architecture/diagrams/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared API baseline

HPX-OWNER-029 / HPX-RQ-037–038 require one shared human/machine command/query API with backend-enforced permissions for each workspace-local user. This belongs to the multi-user baseline, not federation or optional public API work. Identity, grant-policy and compatibility design remain required before implementation acceptance.


Current source publication is 1.0.0. The bounded one-owner HTTPS/SQLite workflow and relationship/provenance increments have synthetic integration evidence; real-document acceptance and broader branch/shared/platform scope remain unfinished. See the current development state.


## Owner baseline reconciliation, 2026-10-30

HPX-OWNER-027 makes [multi-user/AI-user scope](../06-subsystems/ai-collaboration.md) mandatory baseline: single-human development is a profile, not architecture. Same-instance users/agents, node-based chat and selected-node MCP parity must not be scheduled only behind optional integrations or federation. Existing single-owner milestones remain bounded evidence; define the missing identity/grant/concurrency/record/tool mechanisms and acceptance before claiming product completion.

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


## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 82–93; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<registers/source-manifest.csv>); archive is local/ignored.

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

These are small dependency-ordered units for a future explicit implementation resume. Use the existing state/test records, not mandatory new issues, reports or a sprint process. Current working functionality and full future scope remain intact. [Finding dispositions and impact](../08-assurance/development-findings.md#finding-dispositions) supply the review trace.

| Unit / capability | Authoritative specification / dependencies | Affected implementation | Acceptance / migration / approval |
| --- | --- | --- | --- |
| 1. Complete working-source inspection | ADR019; HPX-DATA-001 kind27 and browser/runtime contract; existing gated WorkingFork reader | storage/working_forks.rs; runtime route; frontend Provenance panel | Inspect exact retained unpublished source after edits/restart, with current permission and original receipt. No format change selected. Existing adopted scope; owner resume required. |
| 2. Close branch/working integrated lifecycle | ADR018/019; HPX-RQ-031 acceptance; unit1 | RuntimeAdapter, branch/reference controls, CodeMirror context cache, storage branch/checkpoint/reference modules | Actual isolated HTTPS/SQLite capture, independent drafts, switch/undo/redo, delayed/lost replies, lock/restart, exact Commit and separately retried replacement; original evidence retained. Test actual older-reader20–27 preservation and invalidation after old writes. No migration assumed: if preservation fails, return for explicit backed-up rollout/compatibility decision. |
| 3. Advertise only the verified bounded capabilities | Browser/runtime capabilities and HPX-TEST-038 remaining gates; unit2 | Runtime metadata; frontend capability gates; existing integration harness | Supported desktop widths/themes and source below table/math widgets, full actual workflow and clean test teardown before guarded exact-tested-binary manual refresh. No code/metadata enablement or handoff from this documentation task. |
| 4. Establish audit/recovery contract before repair | HPX-ASSUR-006 authoritative/derived matrix; HPX-GAP-024 | Storage diagnostics and existing fault/restart tests; future restore adapter | Bounded read-only authenticated audit first. No guessed heads, lost drafts, opaque-record deletion or mutating repair until deterministic sources, backup/atomicity and recovery are specified. Migration/repair policy not selected; owner approval before changing authoritative data or recovery guarantees. |
| 5. Measure concrete cost/quality scenarios | Testing strategy; supported workload selection | Existing storage/frontend/runtime checks, without new production framework | Measure receipt growth, large-source serialization/read work, mutex contention and desktop accessibility tasks; distinguish observations from accepted targets. No pruning, cache, lock redesign or numerical budget adopted. New quality thresholds require owner acceptance. |
| 6. Resolve freshness scope before security acceptance | Threat model HPX-GAP-023; ADR003 and full recovery/portability requirements | Later storage/crypto/OS or independent witness design, if selected | First define which independent state an attacker can restore, offline/missing-witness outcome and intentional restore/device-transfer behavior. No absolute detection guarantee or reduced gate selected. Owner decision remains outstanding; this does not block synthetic development. |
| 7. Separate required baseline completion from optional future features | HPX-RQ-032–036; HPX-GAP-026–028; existing integration prerequisites | Multi-user/AI identity and authority,chat nodes,and selected-node MCP parity are required baseline;optional import/export,Zotero/GitHub and federation remain separate | Architecture is multi-user from the start even during one-user development. Define missing mechanisms and validate baseline acceptance before product completion;this list adopts no format,provider,remote protocol or permission scheme. |

Do not make all future designs prerequisites for the bounded local editor. Conversely, do not weaken rights, provenance, immutable history, mathematical semantics, interoperability, verification or federation ambition to reduce present workload. Organizational simplification means one concise increment record; technical optimizations require evidence and the same invariants.

### Resumed units1–3 checkpoint, 2026-10-27

The owner resumed implementation. Units1–3 now have bounded delivery evidence in HPX-TEST-040: WorkingFork Provenance, actual branch/working/replacement/restart and older-reader20–27 lifecycle, advertised capabilities, desktop visual checks and guarded exact-binary manual handoff. This does not complete broader composition, graph families or branch-parent Merge. Unit4 preparation identified legacy current-catalog read/replay scope gaps; hardening those existing boundaries precedes new read-only diagnostics. Audit/repair, workload observations and freshness decisions retain their stated scope and dependencies.

### Units4–5 bounded progress, 2026-10-27

HPX-TEST-041 closes current-catalog/input/result authorization gaps identified during audit preparation. HPX-TEST-042 verifies an adapter-only source-free eight-record original-branch audit under an explicit encrypted-read budget; broader families, transport and repair remain outside that slice. HPX-TEST-043 records warm synthetic serialization/large-source/receipt-growth/concurrent Save-history observations. The complete41-check hardened workflow and guarded same-workspace locked handoff pass. This does not select mutating repair, restore, pruning, caching, a lock redesign, performance thresholds or accessibility conformance; remaining workload/platform/freshness decisions stay open.

### Unit6 scope selected; mechanism proposal awaiting review, 2026-10-27

HPX-OWNER-008 selects workspace-only restoration while trusted local witness state survives. The [local witness proposal](../08-assurance/recovery.md#workspace-only-local-witness-proposal) makes state commitment, prepared/stable acknowledgement ordering, conservative missing/interrupted outcomes, intentional restore limits and proposed backed-up minimum-reader enrollment reviewable. HPX-TEST-045 checks its abstract decision table only. No witness production writes, schema3 upgrade, manual enrollment or real-data acceptance is authorized by the scope choice. Next gate is owner adoption/revision of that concrete direction; then specify exact adapter formats/locking/upgrade and test actual crash/restore/file behaviour before acceptance. Other current delivered editor/audit evidence remains intact.

## Read-only stage5 comparison checkpoint, 2026-10-27

The current-versus-parent comparison step is delivered as a bounded read-only view: a named child's fixed parent and both current committed versions are captured together, then exact snapshots are inspected without either draft. Explicit refresh captures a newer pair. See the [runtime contract](../06-subsystems/interfaces/browser-runtime.md#read-only-parent-branch-comparison-context-2026-10-27) and HPX-TEST-046. This completes comparison only. Parent-branch Merge still needs the separately reviewed base/conflict, uncommitted-input, target-publication and ancestry/compatibility design above; no parent write or automatic Commit is enabled. The local freshness witness/upgrade remains a separate unadopted proposal.

## Owner editing and portability refinement, 2026-10-27

HPX-OWNER-009 replaces the external-witness direction with portable self-contained recovery evidence; whole-workspace rollback detection is unavailable without independent evidence. HPX-OWNER-010 prioritizes seamless editing: autosave while writing and automatic Commit of changed text when leaving a node or switching its branch, never ordinary DOM focus changes. Implement this through existing exact Save/Commit/retry boundaries before new parent-Merge writes. Parent-Merge is per-node, retains alternatives and must distinguish actual passage-change order from later publication of unchanged passages. Its base/conflict/repeated-merge design remains separate.

## Parent-Merge design sequence resumed, 2026-10-27

The owner directed continuation after the proposed next-five sequence. [ADR015's concrete per-node proposal](../04-architecture/decisions/0015-initial-merge-workflow.md#proposed-per-node-temporal-parent-merge-design-2026-10-27) now makes passage-specific committed-change order, retained alternatives, two-parent ancestry/repeated integration, target-draft protection and proposed backed-up compatibility review concrete. It is not adoption of an exact format, a parent write or a manual upgrade. While the consequential policy/compatibility questions are pending, independently validate the abstract rule model and keep exact diff/range/codec work separate from application delivery. HPX-OWNER-009's self-contained portability requirement excludes the withdrawn external witness; no build counter or file timestamp supplies passage chronology.

## Parent-Merge direction adopted and first planner component verified, 2026-10-27

HPX-OWNER-013/014 answer the preceding policy questions: passage-specific committed-change order, explicit one-click determined Merge and staged backed-up compatibility design are adopted. HPX-ALGO-002/HPX-TEST-051 record the first supplied-map pure selector (full140 Rust tests); exact edit-lineage mapping, common-base discovery, codec/upgrade, atomic parent publication and UI remain successive implementation work. Existing-workspace upgrade still requires separate approval. No new parent-write capability or real-data acceptance is advertised.

## Further parent-Merge foundations, 2026-10-27

HPX-TEST-052/053/054 now verify immediate-base working-lineage composition, an inactive strict draft-trace codec and bounded common-base selection over supplied same-node metadata (full156 Rust tests). No frontend or persistent parent-write feature is advertised. Continue retained committed-origin mapping and actual encrypted record/clock/upgrade/publication wiring; existing-workspace upgrade remains separate approval. The trace is not a semantic diff or inference of copied character identity inside coarse replacements, and the pure DAG query is not an authenticated storage read.

## Retained origins and guarded Save foundation, 2026-10-27

HPX-TEST-055/056 add pure immediate-parent passage origins with explicit mapping confidence and encrypted atomic text/trace/receipt Save under an experimental minimum-reader marker. Normal schemas1/2 opening and runtime routes remain unchanged; disposable fixtures alone install marker3/kinds31–33. Next implement bounded authenticated history loading and committed-origin codecs/clock publication, then backed-up format opening/upgrade and exact parent transaction before UI enablement. Unknown mapping must remain unresolved even with a known later order. Existing-workspace upgrade remains separately explicit.

## Authenticated base inspection and origin evidence, 2026-10-27

The next stage5 increment adds authenticated bounded legacy-history base discovery and a read-only **Inspect common base** control within parent comparison. It preserves both committed inputs and drafts and rejects results for a changed displayed pair. This is inspection, not parent publication. Candidate kind34/wrapper1 can encode/replay single-parent passage-origin evidence against an externally verified exact parent map; it remains inactive with no SQL writer/clock allocation or two-parent Merge variant. Continue durable clock/publication/upgrade and exact historical-map composition before enabling parent Merge. Keep the owner-visible manual runtime current through guarded tested-binary handoff under HPX-OWNER-015.

## Further temporal publication foundations

Candidate35 defines safe bounded per-node committed-change clock state and immutable next-value planning; explicit seed36 permits bounded parent-first reconstruction of retained34 origins without guessing missing records are legacy. Candidate37 freezes actual temporal Commit intent/result, including a same-source no-op, and supports exact working-promotion read verification under marker3 without a false legacy receipt alias. These adapter foundations do not allocate durable clocks or publish temporal revisions. The next unit is the single-parent transaction specified in draft-publication, with complete fault/retry/promotion/replacement tests; only after that should format opening/backup/upgrade and two-parent Merge proceed. Owner-existing workspace upgrade remains separately explicit.

## Owner-prioritized semantic relation visualization, 2026-10-27

The owner selects in-text named semantic relations as the next component, ahead of the remaining temporal Commit work. HPX-OWNER-017 replaces arrow glyphs with brace-enclosed word controls, separately actionable between sentences and centered between paragraphs/sections. Connect exact loaded durable assertion overlays to the existing editor/Navigator renderer, preserving source, closed participant bindings and current authority. Extend inspection and bounded pagination, review/negation/direction fidelity and transition/restart checks before delivery. Do not turn heading links into semantic claims or invent controls for unsupported n-ary/cross-document/old-source anchors. Temporal Commit/upgrade/parent Merge remain next independent foundations after this priority, with their existing approval boundaries intact.

HPX-TEST-066/067 deliver the owner-prioritized adjacent semantic word projection in v1.0.0.36:151 Node/91 full headless plus seven final focused/22 actual HTTPS checks. Resume the already adopted temporal Commit transaction next; do not infer unsupported visualization/layout semantics or public format-upgrade authority.

HPX-TEST-068 implements the experimental single-parent temporal Commit transaction with198 Rust tests/Clippy and22 actual normal-schema regression checks; v1.0.0.39 is handed off. Next make separately acknowledged working-reference replacement read the actual37 publication with bounded current authority and retry/fault checks, then broaden capacity and backed-up production opening/upgrade/old-reader rejection before two-parent publication. No existing-workspace upgrade is authorized.

HPX-TEST-069 implements separately acknowledged temporal working-reference replacement with retained originals and actual37 validation; full201 Rust tests/Clippy/formatting and22 normal-schema HTTPS checks pass, exact v1.0.0.42 handed off. Next test2MiB/escaped-source and retained-history capacity with shared limits, then production backup/opening/upgrade/old-reader rejection before two-parent Merge. No manual format upgrade or publication is authorized.

HPX-TEST-070 verifies successive2MiB escaped-source publication and the64-record boundary, adds exact result readback before COMMIT, and records explicit bounded phase allowances; full203 Rust tests/Clippy/formatting and22 actual normal-schema HTTPS checks pass with exact v1.0.0.45 handoff. Next design and test long-lived retained-origin reconstruction without pruning/unknown-age substitution, then coordinate concrete minimum-reader/two-parent format and verified backup/interrupted-upgrade/old-reader rejection. An authenticated derived-map checkpoint remains a candidate only. No production3 opening, manual upgrade or publication is authorized.

HPX-OWNER-018 makes readable Markdown/editor interface the next priority ahead of experimental temporal foundations. The owner then requested a safe stop. Current UI changes remain local and unhanded-off; finish link-selection review and exact actual integration/guarded refresh on explicit resumption. Keep the tested manual v1.0.0.45 until that succeeds.
