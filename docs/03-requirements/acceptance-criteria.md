# Acceptance and Conformance


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-002-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-002-02` [Reconstruction and changed-source choices — HPX-OWNER-043](#reconstruction-and-changed-source-choices--hpx-owner-043) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-03` [Cycle-aware inclusion acceptance — HPX-OWNER-041](#cycle-aware-inclusion-acceptance--hpx-owner-041) | [hpx.native.domain.projection_expansion](../05-domain/diagrams/graph-projections.c4) · `HPX-CAN-025` · [concept_graph_projections](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-04` [Workspace-local users — owner clarification](#workspace-local-users--owner-clarification) | [hpx.native.authority.concept_user](../05-domain/diagrams/authority-distinction.c4) · `HPX-CAN-026` · [concept_authority_distinctions](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-05` [Shared user API and per-user permissions](#shared-user-api-and-per-user-permissions) | [hpx.native.application.admission](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-06` [Unit/integration/property/fuzz cases](#unitintegrationpropertyfuzz-cases) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-07` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
| `HPX-BIND-002-08` [Owner-directed action-set acceptance, 2026-10-25](#owner-directed-action-set-acceptance-2026-10-25) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-09` [Separately approved equivalence and graph acceptance](#separately-approved-equivalence-and-graph-acceptance) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-10` [Planned bundled export acceptance](#planned-bundled-export-acceptance) | [hpx.native.integrations.export](../04-architecture/diagrams/executable.c4) · `HPX-CAN-030` · [c3_integrations](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-11` [Working-branch acceptance gate (HPX-RQ-031)](#working-branch-acceptance-gate-hpx-rq-031) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-12` [Logical departure Commit acceptance refinement, 2026-10-27](#logical-departure-commit-acceptance-refinement-2026-10-27) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-13` [Semantic word controls — HPX-OWNER-017](#semantic-word-controls--hpx-owner-017) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-14` [Planned selected-node editor Graph tab acceptance](#planned-selected-node-editor-graph-tab-acceptance) | [hpx.native.domain.annotation_rules](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-15` [Multi-user and AI-user baseline acceptance](#multi-user-and-ai-user-baseline-acceptance) | [hpx.native.authority.concept_user](../05-domain/diagrams/authority-distinction.c4) · `HPX-CAN-026` · [concept_authority_distinctions](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-16` [Node-creation origin acceptance — HPX-RQ-039](#node-creation-origin-acceptance--hpx-rq-039) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-17` [Retained composition and branch capture acceptance — RQ040–041](#retained-composition-and-branch-capture-acceptance--rq040041) | [hpx.native.domain.exact](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-18` [Structural no-notation reconstruction — OWNER051](#structural-no-notation-reconstruction--owner051) | [hpx.native.domain.exact](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-19` [Recovery purpose versus permanent capture — OWNER052](#recovery-purpose-versus-permanent-capture--owner052) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-20` [Composition membership and partial fragments — OWNER053](#composition-membership-and-partial-fragments--owner053) | [hpx.native.domain.exact](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-002-21` [Workspace authority policy acceptance — OWNER058](#workspace-authority-policy-acceptance--owner058) | [hpx.native.authority.concept_permission](../05-domain/diagrams/authority-distinction.c4) · `HPX-CAN-026` · [concept_authority_distinctions](../04-architecture/navigation.md) · consumers: none |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-REQ-004`
- **Title:** Acceptance and Conformance
- **Purpose:** Acceptance gates for owned-source editing, persistence and integration.
- **Level:** `03-requirements`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-11-02

## Reconstruction and changed-source choices — HPX-OWNER-043

Planned checks must establish identical reconstructed source bytes and exact selected versions at each inclusion position, including cycle-boundary targets. Changing fonts, visual rendering or typesetting alone must not make that source-reconstruction guarantee fail. This does not waive exact source-emission/citation dependencies that affect the actual source bytes.

For the [conflict setting](../06-subsystems/frontend-interaction.md#changed-source-conflict-handling--hpx-owner-043), verify Ask requests a choice;automatic mode uses HPX-recorded Commit time and asks on equal competing timestamps. Each workspace user defaults to Ask and changes only their own preference. Automatic selection marks the affected sentence/paragraph/section as a potential conflict. Two authorised viewers of the same affected committed version must see the shared marker even with different preferences;private draft markers remain private. Opening the comparison modal does not clear the marker;it persists until an authorised explicit resolution,with history retained. Marker comparison must name exact authorised changes. Automatic choice must not imply resolved status,erase alternatives,publish content by itself,mutate source for styling,or bypass ordinary draft/Commit/permission/recovery rules. Repeated placements retain exact context. OWNER056 now specifies millisecond HPX Commit-time comparison, Ask on missing/unreliable/incomparable or equal competing times, exact issue anchors, explicit resolution/history/carry and versioned candidate records in the [conflict-state contract](../05-domain/proposals/conflict-state.md). Its F1–F12 conformance cases and actual clocks/codecs/authority/UI/MCP/profile-upgrade/correspondence remain unexecuted. OWNER043/044 acceptance cases remain planned and unexecuted.

## Cycle-aware inclusion acceptance — HPX-OWNER-041

HPX-RQ-005 follows the [accepted cycle policy](../05-domain/hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041). Planned acceptance must exercise self-cycles, A→B→A cycles, cycles reached after acyclic prefixes, repeated siblings, finite older-version inclusion and equal labels/bytes with distinct identities. Saving valid cyclic inclusion must not reject it merely because the inclusion graph cycles. Revision-ancestry cycles remain invalid.

Verify automatic expansion stops at each exact cycle-closing boundary with a visible and keyboard/screen-reader-accessible warning and an explicit navigation action. No click means no recursive navigation/fetch/render. Each deliberate click may revisit the cycle but performs only bounded authorised work, preserving exact context and ordinary draft/selection/Undo/departure/recovery rules. Lock, revoked permission and stale replies must not leak or substitute targets.

Verify complete output accounts for every required selected contribution and explicit boundary, including deterministic historical boundary targets after current heads change. Missing/corrupt/unauthorised dependencies, depth/work/output exhaustion and unsupported cyclic calculations must fail or be explicitly incomplete; they cannot silently omit content or be labelled complete. No algorithm may loop, silently treat a bounded cut as proof the original graph is acyclic, or alter saved relationships/history to obtain termination.

Require the [HPX-PROP-006–008 Lean obligations](../07-implementation/formal-invariants.md#required-cycle-aware-expansion-proofs--hpx-owner-041), documented implementation correspondence and targeted runtime/UI/accessibility checks as distinct evidence. No proof or planned product acceptance case in this section is executed by this specification change. OWNER045 selects the finite-state semantic model; OWNER055 completes the bounded representation/format design in the [closure/source-map contract](../05-domain/proposals/exact-closure-source-map.md). Checked finite-state and bounded emission models retain their supplied-input premises in the [formal digest](../08-assurance/formal-validation-digest.md); actual suppliers, codecs, upgrade acceptance, resource enforcement and Rust/UI correspondence remain unfinished.

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../04-architecture/diagrams/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

Required future acceptance: exercise the same authorised read/edit/graph/draft/Commit/history operation through browser and MCP for distinct human/AI users; verify consistent results and attribution. Give users different permissions per user–workspace pair and verify permitted access, denied reads/writes/history/chat-context disclosure, private draft/receipt isolation, forbidden self-grants and permission changes during delayed requests/replay. A client cannot bypass denial by switching adapters, unlocking the workspace or selecting a node. Define exact policy/concurrency expectations before these tests. These checks have not been executed. See the [accepted shared API scope](../06-subsystems/interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


Acceptance criteria are requirements, not passing evidence. No application or proof tests are rerun by this migration.


## Unit/integration/property/fuzz cases


### Verification and delivery gates

Source `HPX-SRC-0021`, original lines 61–71. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Preserve pure deterministic validators and bounded traversals. Distinguish tests, Lean model proofs and extracted-Rust correspondence. Current full-validator translation is blocked by concrete Aeneas subset/model limits; its budget helper is proved through extraction. No cryptographic primitive, filesystem or complete application proof is claimed.

Require an early complete editor workflow: owned whole-buffer editing, five-second-idle draft persistence, restart recovery, explicit commit and delayed acknowledgement handling. Verify crash/failure states, exact historical reconstruction, authorization and development/embedded browser parity. The current domain and crypto primitives do not constitute this delivered workflow.

Frontend implementation coordination is defined in [FRONTEND_INTEGRATION.md](<../06-subsystems/interfaces/browser-runtime.md>). Its fixture-first work order and behavioral contracts do not settle the outstanding durable-format, transport DTO, authentication or recovery mechanisms listed above.

The Users tab is a permission-scoped document-contributor projection over attribution/provenance, with current human/agent context pinned separately; it is independent of session presence and workspace membership. A derived contributor index requires no change to the core typed-graph model and grants no additional historical access.

### 9. Acceptance scenarios and handoff checklist

Source `HPX-SRC-0028`, original lines 253–283. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The frontend agent should deliver its interface code, an adapter boundary, synthetic fixtures and executable UI/adapter tests for these scenarios. Report which were actually run; fixtures cannot establish Rust durability/security. Tests against a real backend are required for the corresponding integration gate.

| Scenario | Expected observable result |
|---|---|
| Fixture mode and unavailable server | Persistent demo indicator; no fabricated durable save/commit; failed live connection does not fall back silently |
| Desktop editing | Four columns, outline/minimap synchronized to editor, keyboard navigation, focus/selection/IME/undo preserved |
| Delayed save 10 while typing 12 | Text 12 intact, acknowledgement at 10, draft still modified until 12 acknowledged |
| Lost save/commit reply | Original operation reconciled; no fresh-key duplicate and no false saved/committed label |
| Two editing contexts | Sequence/ack isolation; stale shared draft generation conflicts rather than overwrites |
| Repeated/nested/shared/local prose | Exact intended owners and context retained; ambiguous cross-owner edit rejected or explicitly resolved |
| Unicode and line endings | Non-BMP, combining/emoji sequences, invalid surrogate boundaries and CRLF mapping handled without silent normalization |
| Stale heading picker/proposal | Discard/remap against exact originating state; duplicate headings/rename do not retarget links |
| Table edits/source switch | Undoable mapped draft changes; view switch does not save or publish |
| Copy versus inclusion | Different labels and semantics; shared inclusion awaits real occurrence/closure service |
| Permission change, lock or incompatible capability | No stale action execution, data disclosure or fake success; unsaved-state recovery is explicit |
| Explicit commit with later typing | Frozen generation only; later local text retained or recoverable conflict, never replaced by an old result |
| Agent/comments/export/Zotero | Separate gated services and accurate labels; no implicit model disclosure, publication, anchor reassignment or external-library write |
| Untrusted markup | No script execution/active unsafe URL from source, comments or model output |
| Users/contributors | Current human and agent pinned, other recorded contributors below with distinct stable colours; disconnected contributors retained and logged-in noncontributors excluded; no duplicate pinned IDs, withheld-history disclosure or presence substitution |
| Authorship/context menu | Imported unknown authors not relabelled current human; clicked position independent of selection; keyboard/table/formula lookup maps exactly; mixed/undisclosed attribution preserved |
| Authorship styling/undo | Default off, current-human red only by authenticated identity; labels/contrast; attribution maps survive local transactions/undo and delayed replies |
| Maths display | Source default, code exclusions, exact original syntax retained; bounded untrusted rendering, source-mapped widgets, visible errors and actual accessibility checks |
| Export source choices | Temporary buffer, acknowledged draft and committed source labelled distinctly; stale-head conflict; shared/nested closure, LaTeX and safe filename preserved |
| GitHub review/recovery | No side effects on open/connect; exact approval and account/visibility/path scope; provider-side head conflict; lost-reply/restart uncertainty never produces a blind second write |
| Real integration | Create → edit → five-second idle draft acknowledgement → restart recovery → explicit commit → exact historical reconstruction; interrupted publication and index rebuild tested |
| Release/development parity | Same authorization, origin, source mapping, draft/command outcomes and bundled editor behavior through both serving modes |

Before enabling live writes, both frontend and Rust developers must agree executable DTO/error fixtures, source-coordinate/mapping behavior, authentication/unlock policy, draft durability, idempotency retention and publication recovery. Keep backend-owned decisions visible as gates; the visual design can proceed with honest fixtures while those services are developed.

### Acceptance gate

Source `HPX-SRC-0035`, original lines 21–31. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Before enabling a real-data editor connection:

- Verify trusted HTTPS startup and browser access from a clean supported-machine profile, with documented first-run trust and renewal procedures.
- Verify API requests/responses, assets, streaming and optional WebSockets use protected channels; reject mixed content, HTTP/WS downgrade and invalid/mismatched/expired certificates.
- Verify authentication, authorization, origin/Host/session controls and workspace unlock semantics remain enforced through both embedded-release and development paths.
- Verify private-key permissions/storage, renewal failure, restart and trust removal fail safely, without plaintext fallback or sensitive diagnostics.
- Verify representative payloads cannot be read or modified by an observer on the transport path, while documenting endpoint and local trust-store limits.

No transport implementation, cryptographic proof or delivered confidentiality guarantee is claimed by these requirements.


## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 61–71; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 253–283; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0035` — `Specifications/TRANSPORT_SECURITY.md`, lines 21–31; SHA-256 `96688214826d64bb9d96f01f98c3f717c7327c9e8ec8487eb461bc71098fa0eb`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.

## Owner-directed action-set acceptance, 2026-10-25

The frontend target names **Fork, Link, Embed, Merge and Copy** together, with honest eligibility and implementation status. Verify their distinct effects against the [document-engine definitions](../06-subsystems/document-engine.md#owner-directed-action-set-fork-link-embed-merge-and-copy): Copy preserves exact bytes and publishes no implicit fork/commit; Merge retains all exact inputs and histories, distinguishes same-identity parents from cross-identity provenance, and presents unresolved conflicts before publication. Preview, cancellation and stale responses preserve the originating source/selection/undo and cannot apply to a different context. Required durable behavior needs actual backend/receipt/recovery evidence; current fixture labels do not satisfy it.

## Separately approved equivalence and graph acceptance

For HPX-RQ-028, searching “logically equivalent” resolves to the existing equivalence choice without another predicate identity; participants retain formalisation/premise context, and assertion labels do not claim checked proof or node identity.

For HPX-RQ-029, use the currently selected node as the Graph tab focus under HPX-OWNER-026; the selected-node tab checks below replace the earlier arbitrary-selection dialog target. Preserve distinct/equal-labelled identities, direction, self/parallel and role-labelled n-ary links, accessible inspection and honest completeness bounds. A bounded derivation-only projection does not establish complete selected-node graph coverage.

The Lean-conversion proposal remains deferred by the owner's separate review; no acceptance claim or implementation dependency is inferred for it.

## Planned bundled export acceptance

For future HPX-RQ-030, test every requested target (.docx/.odt/.rtf/.html/.tex/.typ/.xml/.json) against its explicit writer/profile capabilities, selectable main/additional branches and annotation/provenance/relationship scopes. Verify captured APA/Harvard/Chicago/IEEE variants and bibliographies; exact occurrence/range identity and n-ary roles/direction; labelled readable fallbacks/loss reports; appended permission-scoped unresolved-rights reports without rights-dispute-only blocking; unchanged source/history and stale-plan rejection; hostile-input/resource limits and private artifact cleanup. Verify supported delivery requires no separate user Pandoc install while respecting HPX packaging, licensing and egress requirements. These are future acceptance obligations, not executed converter tests or approved format schemas.

## Working-branch acceptance gate (HPX-RQ-031)

Under accepted ADR019, demonstrate that autosave updates only the selected branch's recoverable working buffer and provenance copy/paste can checkpoint exact pending source without Commit. Capture before asynchronous work; later typing, switches, lock, delayed/lost replies, restart and undo/redo preserve independent branch buffers and frozen reference intent. Prove atomic checkpoint/reference/receipt and idempotent retry, current authority before replay, malformed/future source rejection, exact Unicode/newline/scalar ranges and no published-head change from capture. Exact Commit must retain original evidence and append an inspectable replacement; changed source must not silently retarget. Bound incoming-link work and preserve removed private-reference history. Verify independent working-source paste/Fork and actual older-reader preservation/upgrade behaviour, then inspect desktop controls/retry/promotion states and source below widgets in both themes. Run the isolated actual headless workflow and guarded exact tested-binary manual refresh before integrated delivery claims. Current local backend coverage is recorded separately; this gate is not complete.

For avoidance of ambiguity, ADR019's publication boundaries are separate: Commit atomically publishes text, any eligible exact promotion fact and its original receipt; a later bounded generation-bound replacement batch has its own frozen operation/receipt. Test interruption between them, denied/stale/unknown batch outcomes, original-reference inspection and restart reconciliation. Batch failure must not undo already committed text. This is the adopted design, not a new requirement that replacements join the text transaction. Existing wrapper tests do not substitute for actual older-reader20–27 preservation or live branch-switch/undo/recovery checks. No capability advertisement or real-data acceptance is established by this specification refinement.

## Logical departure Commit acceptance refinement, 2026-10-27

HPX-OWNER-010 adds automatic publication when leaving the active content node or switching its branch. Idle autosave remains draft-only; formatting/menu/comparison blur and same-context selection do not publish. Test unchanged revisits, recovered acknowledged drafts, exact Unicode/CRLF/CR, independent node/branch selection/Undo, queued Save/newer typing, lost/delayed/denied Commit and original-operation retry, publication before destination editing, restart and exact older history. A failed or unknown transition retains outgoing text/context without a routine decision prompt. Working-reference promotion/replacement retains its separate acknowledgement and original checkpoint evidence. Manual Commit remains available.

HPX-OWNER-009 requires portable workspace-contained application/recovery evidence. Complete authentic rollback of all workspace files and their internal evidence cannot be detected without independent surviving evidence; do not claim that acceptance property. Internal authenticated integrity, interrupted-write reconciliation and exact historical recovery retain their actual tested scope. No general restore format or real-data acceptance is granted here.

## Semantic word controls — HPX-OWNER-017

Verify separate brace-enclosed relation names between adjacent sentences and centered between adjacent paragraphs/sections, including multiple claims at one boundary, both desktop themes and the Navigator. Labels are inert source-neutral display controls, not manuscript characters; source/selection/copy/export/Undo must remain exact through pointer and keyboard inspection, view changes, widgets and restart. Preserve recorded polarity, declared certainty and participant direction, using only reviewed matching converse definitions or explicit spatial direction words. Acceptance is an owner judgement rather than checked proof.

Runtime controls require the exact current committed whole source and complete document/node/revision/snapshot/occurrence/UTF8 bounds, with no quote-search relocation. Changed source, different head (even identical text), branch transition, lock, stale/denied/malformed replies and exhausted/partial paging must not produce guessed controls or false completeness. Show loaded scope; More assertions can extend only the same page generation/snapshot. Unsupported historical/cross-document/n-ary/nonadjacent and rejected/superseded claims remain inspectable without fabricated adjacent controls. Review updates must change control status/visibility without rewriting text or removing immutable claims. Run actual protected HTTPS/SQLite source/receipt/restart checks and guarded exact-binary handoff before claiming integrated delivery.


## Planned selected-node editor Graph tab acceptance

For HPX-RQ-029 / HPX-OWNER-026, verify Graph is a tab in the main editor rather than a separate dialog, identifies the current selected node/view, and shows all authorised supported linkages with explicit completeness/continuation. Exercise interactive node/edge inspection, navigation and keyboard/text alternatives; retain labelled direction, n-ary roles and evidence distinctions. Check disconnected/self/parallel cases and equal-labelled distinct identities, unavailable/withheld/unsupported/partial results, stale replies after changed context/lock, and exact source inspection. Switching Text/Graph alone preserves source bytes, editor selection/Undo, draft state and receipts without a Commit; actual logical-node changes retain departure/recovery rules. Gestures, neighbourhood expansion and mapping mechanisms require design before their executable acceptance cases are frozen. Existing dialog tests are not acceptance of the new tab or complete arbitrary-node adjacency. No checks in this paragraph have been executed by this documentation change.


## Multi-user and AI-user baseline acceptance

For HPX-RQ-032–036 / HPX-SUB-010, verify at least two humans and two machine users from different providers in one workspace without federation. Test workspace membership/permission denials, session/private draft/clipboard isolation, actor/delegator attribution, overlapping edits, stale heads, conflict handling and original-operation replay. Verify exact supplied prompts/context and every observed chat response reconstruct as protected versioned nodes with ordinary graph links/history, including failed/partial/cancelled interactions without fabricated output. Exercise human and MCP-selected-node parity for owned bytes/coordinates, graph operations, Save versus Commit, immutable same-node history, concurrency and lost acknowledgements; reject unauthorised targets, context-scope escalation and self-grants. One-human development or mock chat is not acceptance. Existing provider/transport/format migration gates remain. These are future required checks; none are claimed executed here.


### Workspace-local user acceptance (HPX-OWNER-030/031)

Required future checks: both human and machine users belong to one workspace; a user from workspace A cannot supply authority in B. A person/provider represented in B has a separate B-local user and B-local permissions. Allow two machine users from different providers in one workspace; reject a second machine user for the same provider there, regardless of model/session/chat. Verify workspace-user permission enforcement through both browser and MCP. These are requirements, not executed tests; no new credential, record or uniqueness mechanism is selected.

## Node-creation origin acceptance — HPX-RQ-039

Future acceptance must verify [M1/O2's creation precondition](../05-domain/diagrams/identity-closure.c4) through human and machine/shared-API paths for every supported node kind and every operation that creates one, including creation outside the editor and chat/context/result creation. With exact authorised UI/caret or explicit equivalent machine context, parent/position is determinable; missing, ambiguous, stale or unauthorised context prevents successful creation without choosing a default or producing partial committed state. Test root creation with known contextual position but no fabricated structural parent, repeated placement of reusable content, move/reuse after creation, and distinct same-node ancestry versus cross-identity derivation. No original-author claim follows from creation context. Known structural placement without inline notation must not be classified as unknown origin; textual reconstruction/projection is a separate gate. Preserve bytes, exact history, draft versus Commit, original-operation recovery and current permissions. These are required future checks, not checks executed by this specification change; concrete context/revocation/format mechanisms remain unadopted.

## Retained composition and branch capture acceptance — RQ040–041

Future checks must restore A's exact nested/repeated selected B versions from its last successful acknowledged autosave after edits/restart, retaining private/current-authority scope and not treating unacknowledged typing as durable. Advancing B must not mutate retained A; a source-neutral newer-authorised-version indication must disclose no inaccessible version existence/counts and must remain separate from OWNER043/044 selection and shared review markers. Verify routine autosaves do not accumulate historical versions merely by cadence; test the eventual adopted autosave/Commit/retention policy without overwriting immutable history. No such future universal relationship is selected here.

Exercise save-as of exact constructed compositions under current document/content identity, all ordered selections/positions/cycle context, owning-branch versus constituent versions, stale/denied/partial captures and original-operation recovery. Distinguish ordinary known-branch editing from read-only multi-branch projections; do not require hypothetical orphan branches or silently turn branch capture into Fork. Test actual designated-main selection and equivalent cold/cache reconstruction only after their mechanisms exist; a global latest-all-nodes rule or authoritative cache is not assumed. Existing departure Commit and earlier branch evidence retain their scope. These are future acceptance obligations, not executed application/proof tests.

## Structural no-notation reconstruction — OWNER051

Planned RQ004–005 acceptance must cover [M1](../05-domain/diagrams/identity-closure.c4) and [R4/R6](../05-domain/proposals/reconstruction-input-preparation.md#completed-supplier-result-contract): exact child source follows its retained structural position without requiring an authored marker; at a no-notation cycle stop no authored text is invented, while the exact stopped relationship/target/ancestor and separate visible warning/navigation remain; an existing original notation span is copied byte-for-byte. Missing structural order is never inferred from absent markers. These product acceptance cases are unexecuted; TEST160 verifies specification integration only. No adoption of subrange/retention/permission/format mechanisms or proof of the zero-byte boundary case follows.

## Recovery purpose versus permanent capture — OWNER052

Planned RQ004/006/040 checks must establish [the canonical distinction](../05-domain/diagrams/identity-closure.c4) under [its exact scope](../05-domain/document-semantics.md#recovery-purpose-and-immutable-reference-evidence--owner052): acknowledge A selecting exact unpublished B and nested context; advance B's draft; reopen A with the retained selections. Repeated ordinary autosaves must not themselves create permanent historical checkpoints. Existing immutable reference evidence and dependencies needed by another composition or unresolved operation remain intact. Do not test this by evicting recovery data or assuming an unapproved deletion/capture policy. These product cases are unexecuted; TEST162 verifies specification integration only.

## Composition membership and partial fragments — OWNER053

Planned RQ002/004/005 acceptance follows [M1](../05-domain/diagrams/identity-closure.c4) and the [selection contract](../05-domain/text-and-anchors.md#structural-membership-and-exact-partial-fragments--owner053): select only B between its structural endpoints when B/C share a source cut;cross a zero-byte stop retaining its exact selected relationship/context and separate warning/navigation;identical structural endpoints select nothing. A partial repeated-child or notation selection preserves exact bytes/full context without becoming the whole inclusion,expanding silently or banning arbitrary owned-source ranges. These product cases and [input-preparation P1–P7](../05-domain/proposals/reconstruction-input-preparation.md) are unexecuted. TEST163 checks specification/design integration,not UI,storage or model correspondence.

## Workspace authority policy acceptance — OWNER058

The [canonical M4 policy](../05-domain/diagrams/authority-distinction.c4) and [eight exact policy cases](../02-governance/proposals/workspace-authority-decisions.md#required-unexecuted-policy-acceptance-cases) now supplement RQ032/038 and shared browser/MCP acceptance. Test lifecycle and explicit bootstrap, exact capability prerequisites, private-workflow isolation, no self-escalation, revocation between preparation and publication/release, original-operation reconciliation after revocation, and separate current/history dependency admission. Policy choices1A/2A/3A/4A are accepted; these application checks remain unexecuted. Exact credentials, sessions, assignment ceilings, final-administrator recovery, authenticated policy/key grants and record/wire designs remain separate gates. No existing one-owner workflow satisfies general multi-user policy merely by passing earlier checks.
