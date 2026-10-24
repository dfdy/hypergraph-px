# Development state and context-compaction handoff

Last updated: 2026-10-24. **Current work: capture and publish README screenshot refresh 0.5.3 (issue 17). Owner explicitly lifted the publication hold with “Push to github”. Frontend-only scope and authentication waiver for the synthetic preview remain. Local preview: http://127.0.0.1:5173/. Historical hold statements below describe earlier instructions.** Read this first when resuming, then AGENTS.md and the linked authoritative documents. This file records actual state; it does not replace the specification or make proposed features implemented.

## Workspace and authorization

Work exclusively in `/Users/diaan/Documents/Work/Sites/Hypergraph PX MU-F`, repository https://github.com/dfdy/hypergraph-px (public), branch main. Keep runtime data/credentials separate from source. Owner authorizes successive routine implementation autonomously, GitHub issue tracking and milestone pushes. Increment SemVer before every push with new changes; retries of an identical commit need no extra bump. Preserve unrelated user edits. Current sandbox may require an authorized escalation for writes in this sibling workspace; do not interpret a sandbox boundary as a missing product decision.

## Requirements and decisions to preserve

Canonical requirements: [Specifications/SPECIFICATION.md](../Specifications/SPECIFICATION.md). Specification map: [Specifications/README.md](../Specifications/README.md). Detailed confirmed decisions: [ADR 0001](adr/0001-foundation-decisions.md). Data APIs: [technical reference](../Specifications/DATA/README.md).

- Fresh local-only, one human initially; model users/devices/groups now for later multi-user and federation. Future live coediting AND explicit branches/merge.
- Separate browser development, pure Rust domain, application authorization, storage/crypto and transport; one Rust executable embeds built frontend in releases. No runtime Node/Lean/database server requirement.
- Trusted-server encryption first/default. Passphrase startup unlock default; OS-keychain alternative also required before claiming complete initial unlock support. Login is separate. Client-held encryption is designed but unavailable until implemented.
- Future client recovery uses a user-held key; server account reset cannot recover client-only content. Browser-only and independently trusted client paths remain planned; stronger protection against a malicious code-serving host requires independently trusted client/update delivery.
- Reject expansion cycles; permit hyperlink cycles. Share workspace/document initially; all retained history requires explicit grant. Original code AGPL-3.0-only.
- Desktop contents/editor/minimap/sidebar four-column layout, with Agent, Comments and Users tabs; Users is a document-contributors view, not presence. Pin current human/agent, then other contributors with distinct colours; mobile deferred. No frontend library choice has been adopted yet. React/TypeScript, CodeMirror 6, shadcn/ui and optional Cytoscape.js were suggested for a separate mockup discussion only.
- Lean model proofs plus early Aeneas feasibility and selected actual-Rust proofs where supported. Maintain the [human-readable validation digest](../proofs/VALIDATION_DIGEST.md); distinguish model proofs, extracted Rust proofs and tests.
- SemVer 0.y.z policy: patch for compatible fixes/docs/proofs; minor for new runtime functionality/breaking development API. Synchronize Cargo workspace/lock, Lean package, README/spec and changelog for each milestone push.

## Published milestones and executed checks

Latest implemented milestone **0.1.0**, commit `4705b3f863da68e55f902780876cf770a4c6636e`, verified pushed to origin/main. Current project metadata **0.4.0** adds the live word count to the separate frontend preview; no runtime/proof source changes. Use git log/origin to identify the final documentation commit, avoiding self-referential version churn. Issues 1 (foundation), 2 (Lean/extraction feasibility), 3 (version policy) and 4 (crypto adapter) are completed; issue 4 closure follows observed hosted success.

Implemented pure `hypergraph_domain::expansion::validate`: bounded Kahn DAG validator; five tests including all 512 directed three-vertex graphs versus an independent transitive-closure oracle. Source `crates/domain/src/expansion.rs` SHA-256 `74f2cc79679f4cc3a397f81ce68a3c758c24a520948a1954de391770c3f6b6ad` remains unchanged.

Four axiom-free Lean rank/path model theorems check with Lean 4.35.0. Actual extracted Rust private `spend` helper has a total-correctness theorem for success/error accounting and overflow safety; standard axioms propext, Classical.choice, Quot.sound; no sorryAx/native decision axiom. Full validator NOT proved: strict Aeneas translation fails on nested-loop returns and missing Iterator::filter_map model. Tool/source/dependency pins in proofs/rust/extraction.json; exact regeneration/check script scripts/check_rust_proof.py.

Hosted CI for 0.0.3 all observed completed/success (historical proof baseline):

- [Rust formatting/strict Clippy/tests](https://github.com/dfdy/hypergraph-px/actions/runs/40080895349)
- [Lean model build/environment](https://github.com/dfdy/hypergraph-px/actions/runs/40080895296)
- [Fresh Rust extraction and Lean proof replay](https://github.com/dfdy/hypergraph-px/actions/runs/40080895276)

## Completed encryption increment and current pause

Issue [4](https://github.com/dfdy/hypergraph-px/issues/4): trusted-server in-memory cryptographic adapter, completed at **0.1.0**. Before code, wrote [ADR 0002](adr/0002-trusted-server-envelopes.md) and [work record](work/0004-crypto-envelopes.md). Actual format/API/cost/error/security reference: [crates/crypto/README.md](../crates/crypto/README.md). No durable storage/database/service/frontend exists.

Implemented chacha20poly1305 0.11.0 (XChaCha20-Poly1305, zeroize feature), argon2 0.6.0 (alloc+zeroize, defaults off), getrandom 0.4.3, sha2 0.11.1, zeroize 1.9.1. All 28 resolved external package manifests inspected before compilation: MIT/Apache-2.0 alternatives, with r-efi additionally offering LGPL-2.1-or-later (choose MIT). Dependency licenses/checksums are persisted in legal/RUST_DEPENDENCIES.json.

Eight Rust tests, strict locked all-target Clippy, formatting/whitespace checks passed at 0.1.0. Actual extracted-helper replay after workspace expansion and model build after synchronized 0.1.0 metadata passed. Fifty-five current-document local links, synchronized package versions, exact dependency inventory and unchanged proven Rust hash were checked.

Hosted CI for commit `4705b3f863da68e55f902780876cf770a4c6636e` all observed completed/success before recording the pause:

- [Rust formatting/strict Clippy/eight tests](https://github.com/dfdy/hypergraph-px/actions/runs/40082126475)
- [Lean models](https://github.com/dfdy/hypergraph-px/actions/runs/40082126469)
- [Actual extracted-Rust proof replay](https://github.com/dfdy/hypergraph-px/actions/runs/40082126476)

Critical resolved finding: argon2 0.6.0 `hash_password_into` allocates private Blocks whose Drop deallocates WITHOUT zeroizing memory, despite zeroize feature. Resolved using explicitly allocated `Zeroizing<Vec<argon2::Block>>` with `hash_password_into_with_memory`; avoid claiming default library allocation is cleared. Feature clears only selected intermediates. AEAD 0.11 uses AeadInOut, not deprecated AeadInPlace. Allocate tag capacity before copying plaintext into a zeroizing Vec to avoid plaintext reallocation. Do not claim complete erasure of compiler copies/registers/swap.

A passphrase rewrap preserves object access because it wraps the existing data key. Copied old wrappers still work with their old passphrases; replacement is not revocation. AEAD accepts authentic old objects; rollback/replay requires a later authenticated publication/head model. Key epochs alone do not rotate keys or authorize history. Client-held mode, OS-keychain implementation, full per-domain key hierarchy, identity/authorization, durable commit/draft recovery and the whole editor remain unimplemented.

## Concrete steps when the owner resumes

1. Read this handoff, AGENTS, canonical requirements and actual API/proof references. Verify git status/origin and final documentation CI with gh; preserve unrelated user changes. Issue 5 tracks the documentation publication cleanup only. No data-model ADR or next feature code has been created.
2. Before durable storage, open a bounded issue and record typed identity/immutable-history contracts: users/devices/groups, content/revision versus placement/manifest, exact snapshot bindings including repeated nested occurrences. Read Specifications/DATA/MATHEMATICAL_MODEL.md and the data reference. Existing expansion validation does not implement these records. Preliminary review only has occurred; no additional detailed model decision is accepted yet.
3. Implement/test those contracts with source ownership and exact historical reconstruction in mind; do not silently introduce live-head lookup into a snapshot. Preserve the existing expansion.rs extraction hash or explicitly review/update/reprove any change. Keep domain purity and crypto separation.
4. Progress to application authorization/key lifecycle (including the required explicit OS-keychain alternative), authenticated durable publication and crash-safe drafts, then one complete desktop editor workflow embedded in Rust. Avoid spending indefinitely on disconnected primitives. Decide publication/encoding/recovery mechanisms in an ADR before enabling durable writes; no storage choice is finalized.
5. Update technical reference, work record, validation digest for any new Lean checks, and this handoff. Bump SemVer for the next functionality milestone (normally 0.2.0 under current convention), synchronize metadata/changelog, run relevant checks, commit/push and observe CI. Never claim unexecuted tests, durability checks or proofs.

## Pause closeout

The owner requested “Finish what you're doing and then pause your processing for a while.” The 0.1.0 adapter and hosted validation are complete. The 0.1.1 documentation-only closeout records this status and pause; no new implementation increment is started. Its workflow status can be read from GitHub on resume without another evidence-only push. No credentials or runtime data are recorded here.

## Tooling notes (local convenience, not requirements)

Lean tools currently in /tmp/hypergraph-muf-tools/lean-4.35.0-darwin_aarch64/bin. Aeneas bundle in /tmp/hypergraph-muf-tools/aeneas-74aabd5; isolated Rustup/Cargo caches in /tmp/hypergraph-muf-tools/{rustup,cargo}. Ignored .verification contains local symlinks/caches; nothing there is a source artifact. Reproduction from clean CI uses scripts/check_rust_proof.py --download. Never change the personal default Rust toolchain or include tool caches/runtime data/secrets in Git. Local cache paths may disappear and must not block reproducible provisioning.

## Specification publication cleanup — issue 5

The owner authorized a self-contained `Specifications` directory containing only current specifications. Current product requirements, architecture, data/navigation, mathematical model and encryption contracts are published there; ADRs, implementation work records and proof evidence stay in their own directories. The specification index and all current links now target this directory. Source materials retained locally are ignored and are not specification authority. No Git history rewrite is part of this update.

Version 0.1.1 commit `4dd2f31368e8dcd87cee052c732c28f2c401f141` was pushed and all three CI workflows observed successful (Rust 40082444165, models 40082444104, extracted proof 40082444180). Version 0.1.2 is documentation-only; track publication/checks via GitHub rather than a self-referential evidence commit. Feature implementation remains paused after this requested cleanup.

Validation executed for 0.1.2: six current specification files, 78 published local Markdown links/code fences, source-copy byte preservation/ignore rules, excluded-tree absence from Git index, synchronized package/docs versions and unchanged runtime/proof source all passed. Cargo workspace check, formatting and staged whitespace checks passed. Hosted checks remain to be observed after push.

## README future design aims — issue 6

Owner requested a README section describing future aims, including Zotero. Added explicit planned/unimplemented descriptions of read-only reference selection/citations and reproducible bibliography inputs, desktop four-column editing/minimap, reusable content and history, agent/comments, export, live collaboration plus branches/federation, and future client-held encryption. Mobile remains deferred and no release date or runtime completion is claimed. Product specification remains authoritative. No feature implementation resumed.

Version 0.1.2 commit `5c993377d891850da0f5b5a8f8ba9d1a14ae48b7` was pushed; all hosted checks observed successful (Rust 40083095570, Lean models 40083095585, extracted proof 40083095573), and issue 5 is closed. Issue 6 is documentation-only at 0.1.3; verify its publication/CI from GitHub rather than creating a self-referential evidence update.

## Developer README setup — issue 7

Owner requested a brief Current status outline, removal of Initial verification and basic developer installation instructions. README now gives Git/private repository access and Rust/native-linker prerequisites, clone instructions, explicit stable-toolchain installation, locked library build/tests and formatting/Clippy commands. Optional Lean reproduction and technical/progress documentation remain linked. There is no application launch/Node/frontend setup claim. Feature implementation stays paused.

Version 0.1.3 commit `05193bb` was pushed with all three CI workflows observed successful (Rust 40083409534, Lean models 40083409533, extracted proof 40083409528); issue 6 is closed. Issue 7 is documentation-only at 0.1.4; observe publication/checks without creating a self-referential evidence update.

## Frontend integration evaluation — issue 8

Owner supplied the local ignored SPECS/Hypergraph-PX-Rust-Endpoint-Integration.md as noncanonical input and requested evaluation plus a specification for the frontend agent. Read all 245 lines; SHA-256 13263d8791dbdc327143f796cf543ed78141bca94ffa44ab265af342ed7934c3, 31,145 bytes. Preserve it unchanged and ignored. Prototype source/status claims were not independently verified. Actual repository still has no frontend/server/application/draft/publication service.

Deliverable: [Specifications/FRONTEND_INTEGRATION.md](../Specifications/FRONTEND_INTEGRATION.md), a self-contained behavioral/adapter handoff with staged capability gates, the four-column desktop layout, fixture-only mode, exact source mapping/draft-local inserts/Unicode coordinates, draft autosave state machine, commit/structural approval/idempotency, candidate HTTP surface, errors/security/preferences and executable acceptance scenarios/work order. Adapter names/DTO concepts/routes are planning targets, not implemented or frozen APIs. No frontend library, durable anchor encoding, authentication mechanism, provider connection or cookie lifetime is selected.

Evaluation and accepted/corrected/deferred findings are in [docs/reviews/0008-frontend-integration.md](reviews/0008-frontend-integration.md), outside Specifications. Key corrections: do not require a large API catalogue before an editor slice; add create/open workflow; do not trust stale/client ownership maps or replace multi-owner buffers; keep table edits in drafts; preserve newer typing and handle two contexts; distinguish unknown outcomes/202 from commit; do not make prototype sentence/cookie/provider choices canonical. Source document stays untracked; no backend/frontend code is implemented. General feature work remains paused.

Version 0.1.4 commit `ddbcd1b` was pushed; all three hosted checks observed successful (Rust 40083746437, models 40083746477, extracted proof 40083746530), and issue 7 closed. Documentation milestone 0.1.5 follows the same publication policy; verify its actual CI via GitHub without another evidence-only version bump.

## Updated frontend proposal and contributor Users tab — issue 9

Reviewed the updated ignored local input SPECS/Hypergraph-PX-Rust-Endpoint-Integration(1).md: 325 lines, 47,985 bytes, SHA-256 8dd5fb621d507488e51cd2afe778411ece1d5eaaade5deb5857e64722e5dc439. Both input files remain unchanged/ignored. The updated input's prototype version/files, renderer package use, 77-expression success and unit-test claims have not been independently verified here.

Owner first confirmed a third Users tab, then explicitly required all known document contributors rather than logged-in users: current human and current agent pinned at top; other contributors below, each with a distinct colour. This supersedes the input's presence-based Users tab. The core typed graph is compatible: add a permission-scoped derived contributor projection over attribution/provenance and current-context principal references. Do not infer authorship from ownership, login, provider configuration or import. Missing agent and unknown/undisclosed roles are explicit; snapshot/history scope and all retained-history permissions remain intact. No remote collaboration is enabled by showing contributors.

Updated Specifications/FRONTEND_INTEGRATION.md §§8.1–8.5 and acceptance/work order for contributors, clicked-source authorship, source-preserving maths display, three export source choices and optional reviewed GitHub document-publication jobs. Corrected import attribution, fixture escape handling and remote head race/exactly-once assumptions. KaTeX is only a candidate; no renderer version or GitHub provider flow adopted. Product specification, architecture, index and README now use Agent/Comments/Users consistently. Review details and source comparison are appended to docs/reviews/0008-frontend-integration.md under issue 9.

GitHub document publishing would be external disclosure through a separately authorized app connection, never implicitly using this coding agent's/source repository's permissions. Exact frozen review, protected credentials, separate repository creation/local commit, provider-side expected-head checks and honest unknown/recovery outcomes are required before live use. Do not implement a preflight-read/unconditional-write race or assume provider correlation IDs deduplicate writes. General runtime work stays paused; this is documentation-only 0.1.6.

Prior 0.1.5 commit ce525ed was pushed and all hosted checks observed successful (Rust 40087989026, models 40087989015, extracted proof 40087989000); issue 8 closed. Verify the current publication/CI from GitHub without a self-referential evidence-only push.

## Local frontend export intake — issue 10

Owner is moving frontend work into this IDE rather than continuing it separately in Sites. Upload location: frontend/incoming/sites-export/ (full path under the project workspace), tracked only through .gitkeep; raw files/archives are ignored. Instructions are in frontend/incoming/README.md and frontend/README.md. Preserve the export, review its architecture/dependencies/assets/licenses and adapt or replace code against Specifications/FRONTEND_INTEGRATION.md and docs/reviews/0008-frontend-integration.md. Do not assume the prototype's backend assumptions are accepted.

After files arrive, the intended first implementation is a separate loopback frontend development server with synthetic mock documents/typed fixture adapter, plus browser screenshots and interaction tests. Eventual built frontend assets are embedded in the single Rust runtime. Node/npm and cached Chromium binaries exist locally; no project-local Playwright harness/package is configured and no actual UI test is claimed. Do not borrow application code/runtime data from unrelated projects or treat cache presence as tested browser automation.

No export is present and no frontend runtime has been created at this intake milestone. Frontend stack/package/build commands will be chosen after inspection; avoid blindly running import scripts. This request authorizes that frontend direction, not unrelated backend feature development. Prior 0.1.6 commit ba424c4 was pushed; all three hosted checks observed successful (Rust 40091928377, models 40091928388, extracted proof 40091928441), and issue 9 closed. Observe 0.1.7 publication/checks without an evidence-only follow-up push.


## Integrated workspace/interface specification — issue 12 (current)

Owner paused frontend work after export inspection, then authorized evaluation/integration of the new integrated architecture/UI document. This is documentation scope only, not frontend resumption. Raw export is present under the ignored inbox; inspected source has not been copied into accepted runtime code and no browser tests have run. Issue 11 remains open but paused. Source repository visibility is now public, independently verified with GitHub; README and product requirements reflect this.

Issue [12](https://github.com/dfdy/hypergraph-px/issues/12) publishes [WORKSPACE_INTERFACE.md](../Specifications/WORKSPACE_INTERFACE.md) and [evaluation](reviews/0012-integrated-workspace-interface.md). Input SHA-256 `52318be318982e1dde5043ca316e80d5f75e600781c2b52220db3ccf9ef2b00d` remains ignored/unchanged. Adopted targets: Workspace/Document/Graph/History navigation; independent chapter documents and versioned composites; upper Agent/Comments/Users plus lower investigation panel; private persistent provenance clipboard; explicit promotion and fork-first paste; pinned/live transclusion; contextual concepts/assertions and exact semantic snapshot state. Current human red, current agent blue, other contributors distinct; mobile deferred.

Critical corrections: copy cannot silently commit unsaved source; promotion needs explicit publication confirmation; partial/overlapping ranges use revision-aware anchors, not invalid tree nodes. Paste All defaults atomic. Paste-and-clear needs atomic or receipt-linked protected user-state coordination and original-operation reconciliation. Fork inputs remain captured exact source revisions; read access alone cannot authorize redistribution. Live updates must recheck newly introduced expansion cycles; pins include nested closure. Sensitive clipboard previews/anchors cannot live in display cookies/plaintext browser storage. History and snapshot contracts precede durable reuse. No schema, database, framework or provider protocol was selected and no new Lean result established.

Version 0.1.8 is documentation-only; Cargo/lock/Lake/README/product metadata synchronized. Prior uncommitted README visibility fix is included as requested; preserve user-authored commits already on main. Validation/publication results are recorded below when executed. Do not resume issue 11 on a context reset: wait for explicit owner instruction. Next dependent backend work requires the anchor/domain, publication/private-state, live resolver and semantic snapshot ADRs listed in the evaluation; no decision here authorizes implementation.

Executed for 0.1.8: 12 current Markdown files and 84 local links/fences validated; synchronized package/lock/Lake/docs versions checked; input SHA-256, proven validator hash, unchanged runtime/proof sources and absence of ignored inputs from Git index verified. `git diff --check`, `cargo check --workspace --locked` and `cargo fmt --all -- --check` passed. Hosted CI will be observed after push; no browser or new theorem checks are claimed locally.


## Frontend-only live preview — issue 11 (current)

Owner explicitly resumed successive frontend-only implementation and requested a shared live testing URL, then waived authentication for this test runtime. This supersedes the earlier frontend pause. Open http://127.0.0.1:5173/ locally; the live Node server serves built assets from frontend/dist. Restart with `cd frontend && npm ci --ignore-scripts && npm run dev`; rebuild and refresh after edits. Port override: HYPERGRAPH_PREVIEW_PORT. Browser automation and the human use the same URL with independent tab state; no sign-in, Rust backend or provider is connected. Current terminal session is an operational convenience, not a runtime deployment guarantee.

Implemented 0.2.0 frontend: CodeMirror source/undo/formatting and six original synthetic chapters; per-document state/scroll; outline/minimap; table editing and exact-source KaTeX display; upper Interaction and lower Investigation with keyboard/drag split, collapse, tabs and pinned context; synthetic contributor palette; local comments and contextual example-assertion review; temporary exact Markdown download; tab-only clipboard capture and independent text-paste/clear simulations with a local log. Five-second-idle checkpoint labels remain explicitly simulated. Display preferences alone persist; no document state is written into browser storage. Reload clears all test state and warns on changes.

Original source helpers/widgets selectively adapted with per-file hashes in frontend/SOURCE_PROVENANCE.json. Raw manuscript, private fixture, built bundle, original backend/provider modules and original identity strings excluded. New src/adapter.js is the replaceable synthetic state boundary, not an invented Rust API. Actual graph forks, source promotion, transclusion, durability, authentication and cryptographic guarantees remain unavailable. Source display/export preserves exact Markdown/LaTeX. Source coordinates are UTF-16 for this one-owner-per-fixture model; real multi-owner/UTF-8 mapping remains gated. Runtime Rust and proof sources remain unchanged except synchronized project metadata.

Executed: frontend build, thirteen Node adapter/source tests, fourteen Chromium browser scenarios, screenshots visually inspected at 1600x1000 and 1440x900; no horizontal overflow at 1440. Browser tests cover typing/undo/redo/download, table edits, maths source preservation, contributors, minimap/panels, chapter state, pinned context, clipboard/context keyboard actions, reload reset, local comments/assertion scope, inert markup and restricted server paths/Host/methods; no page errors across scenarios. Tests/snapshots/traces ignored. New frontend workflow runs pinned npm install, tests/build and Chromium browser checks; hosted publication results must be observed after push.

Resolved findings: raw heading helper returns label, not text (empty outline fixed); test download selector conflicted with table Edit Markdown (scoped exact label); undo groups follow editor transactions rather than assuming all typed newlines undo in one group (verify actual undo/redo roundtrip); repeated table values must map clicked cell by delimiters, not first text match; stale local comment navigation rechecks source sequence before selecting. Twelve pure tests include delayed acknowledgement without later-text overwrite, document isolation, surrogate splitting rejection, captured-source repeat paste, invalid mixed plans, exact math/code exclusion, duplicate/fenced headings, table-cell isolation and authored insert preservation.

Next steps remain FRONTEND ONLY: improve visual polish and source-mapped interaction/accessibility with owner feedback at the live URL. Consult WORKSPACE_INTERFACE and frontend contracts before adding fixtures. Do not enable backend operations to make controls appear finished; mock state cannot establish canonical provenance, transaction recovery, contributor truth or client-held security. Preserve unrelated owner README grammar edits separately from milestone staging.

Latest owner feedback included in 0.2.0 before publication: minimap now shares measured visible geometry and offscreen block estimates with editor, chapter arrows independently expand/collapse, Paragraph/H1–H4 and Bold/Italic/Quote/Bulleted/Numbered buttons follow parsed context and toggle, and all controls have delayed named tooltips (3.1 seconds). Thirteen actual browser scenarios and thirteen Node tests cover these fixes, including minimap pixel alignment after wrap/font/maths changes, independent disclosures, toolbar context and tooltip timing/reset. Native titles are converted to delegated tooltip descriptions, including dynamically created controls. Source helper selection and DOM widgets remain fixture-only.

Owner clarified that large editor/panel surfaces should have NO tooltips. Delegation now targets individual controls/actionable table/math items only; editor role=textbox, panel regions and broad containers are excluded. Preserve this exception to the earlier all-elements wording.


## Navigator controls — issue 13 (current)

0.2.0 commit a5bf854f2fd09a65d77c5f45613648f6c7824bb3 was verified pushed, all four hosted workflows observed successful (Frontend 40109205423, Rust 40109205450, models 40109205390, extracted proof 40109205424), issue 11 closed. Subsequent owner requests: rename Overview to Navigator, wheel scrolling in Navigator, visibility toggle and move Navigator to either side of the editor. Issue 13 and docs/work/0013-navigator-controls.md track this frontend-only increment. These new display controls use version 0.3.0; 0.2.1 was considered for the initial naming/wheel repair but was never published or used after added functionality increased scope.

Implemented controls in header: Navigator hide/show and move-left/right. Default visible/right, validated navigatorVisible/navigatorSide fields added to non-sensitive display preferences. DOM/grid order changes together; same EditorView/state retained and remeasured. Whole Navigator accepts pixel/line/page wheel input; native scroll bounds and map updates shared, Ctrl/Meta-wheel/pinch preserved. Server remains live at http://127.0.0.1:5173/. No backend/dependency/proof source changes. Final browser/source/build and publication evidence follows actual execution, with hosted results recorded in issue 13 rather than an evidence-only version bump. Preserve unrelated owner README grammar change outside milestone staging.

Executed for 0.3.0: frontend build, thirteen Node tests and sixteen real Chromium scenarios passed, including new Navigator wheel/visibility/side/persistence cases; left-position screenshot visually inspected at 1440x900 with no horizontal overflow. No runtime/proof source or dependency changes. The running frontend server serves the rebuilt current assets; user must refresh open tabs.


## List toolbar icon polish — issue 14 (current)

0.3.0 commit bd3c56fc5632f2c329aa8bf70eb4226c0d46f226 was verified pushed and all four hosted workflows observed successful (Frontend 40109937299, Rust 40109937270, Lean models 40109937280, extracted proof 40109937268); issue 13 closed. Owner now requested adjacent bullet/numbered buttons with representative bullet/line and 1/2/3 icons. Implemented original inline SVGs, preserving aria labels, tooltip names, context pressed states and commands. Patch 0.3.1 synchronizes metadata; no dependency/backend/proof source changes. Work record: docs/work/0014-list-toolbar-icons.md. Preserve the owner's unrelated README grammar edit outside milestone staging. Live server remains http://127.0.0.1:5173/; refresh to receive the rebuilt toolbar.

Executed for 0.3.1: static frontend build and existing Chromium contextual formatting/toggle scenario passed; direct DOM sibling check confirmed adjacent controls; toolbar screenshot visually inspected. Original SVGs use currentColor and stay aria-hidden inside named buttons. CI/publication results will be recorded in issue 14 after observation.


## Live status-bar word count — issue 15 (current)

0.3.1 commit d343cc74b7d1615d551421e9b373066db9aac3fb was verified pushed. Rust 40110393122, Lean models 40110393117 and extracted proof 40110393175 succeeded; frontend 40110393137 was still installing the browser environment at latest observation. Do not claim it passed; issue 14 remains to close after observed results. Owner then requested live word count to the left of character count, numeric word count bold; a subsequent progress question did not cancel this work.

Implemented in updatePosition(): Unicode Intl.Segmenter word-like count of current Markdown source, cached in a WeakMap by immutable CodeMirror Text; no recount on caret-only changes. Display strong numeric count followed by words, then unchanged character count; updates on edits/undo and chapter switching. Executed static build and actual Chromium checks for Unicode input (+3 words, emoji excluded), chapter return, order and computed bold weight 700; footer screenshot is ignored. Work record: docs/work/0015-status-word-count.md. New functionality uses MINOR 0.4.0 with synchronized metadata; no backend/dependency/proof source changes. Live server still http://127.0.0.1:5173/; refresh for new count. Preserve owner's unrelated README grammar edit outside staging.


## Publication hold — latest owner instruction

Owner explicitly instructed: “Don't publish again until I tell you.” Do not push, create releases or publish further GitHub updates until explicit authorization. Local work and verification can continue. Latest already-pushed commit before this instruction was bfaad9869581f9fd446a7e3883a86c739bb38033 (0.4.0 word count). No subsequent push is authorized.

A broad version-string replacement accidentally changed the external cpufeatures lock entry from 0.3.1 to 0.4.0 while leaving its checksum unchanged. The local locked build caught this, but a shell command sequence continued to commit/push after the failed check; this was an error, not a passing validation. Corrected ONLY the external cpufeatures entry locally to the prior pinned version/checksum and compared all external dependency version/checksum pairs against the previous lock. No dependency upgrade intended. Do not publish this repair without authorization. Future version scripts must target named workspace records and execute dependent checks/commits using check=True or fail-fast sequencing; never global-replace versions in dependency lockfiles. The live frontend word counter itself passed Chromium checks.


## Local Functions bar — latest work under publication hold

Owner requested explicit Fork, Link and Embed in the top Functions bar. Implemented locally with no GitHub updates or version bump; AGENTS.md now carries the explicit publication hold above automatic publication rules. Work record: docs/work/local-functions-bar.md.

Fork accepts whole source units and creates independent synthetic tab-only documents, preserving source attribution and exact captured input context. They appear under Local test forks, outside the six-chapter composition, with chapter previous/next disabled. Editing a fork preserves the original; source authors are not relabelled as current human. Link uses the same-document heading picker to insert an undoable plain Markdown link, not a typed reference edge. Embed has source document/section/policy and preview; shared insertion and Live remain disabled until real backend mappings/publication exist. Dialogs freeze context, reject stale sources and restore anchor/head on cancel. New module: frontend/src/functions-bar.js; fixture operation stays in adapter.js. Modal tooltip is parented into the active dialog for correct top-layer display.

Executed: build, fourteen Node checks and nineteen full Chromium scenarios passed; then focused tooltip/Embed cases run after final tooltip fix. Original source/undo/panels/navigation checks remain passing. Screenshots are ignored under artifacts/ui. Local Cargo.lock cpufeatures repair still passes locked build; no dependency upgrade intended, no Rust/proof source change. Leave all changes local and preserve owner README grammar edit. Do not publish, close/update GitHub issues, or treat new local implementation requests as permission to lift the hold.

Latest local UI request: move Navigator left/right toggle to its own bottom edge. Implemented minimap-footer containing navigatorSide, compact Left/Right labels, retained full accessible action names and top-header show/hide. Navigator is flex-column; map gets remaining height, footer stays below it. Explicitly restore button focus after moving the panel. Build and four targeted Chromium regression cases passed; direct browser footer/no-overlap/focus checks and screenshot inspection passed. All changes remain uncommitted/unpublished under the existing hold. Work record: docs/work/local-navigator-controls.md.

Latest local UI request: visible red caret plus bottom settings toggle. Implemented default-on Red caret checkbox next to Authors, redCaret boolean in validated display preferences, dark/light red colors and 2px drawn cursor; unchecked restores theme accent. Native caret fallback follows same color while respecting CodeMirror's drawSelection hiding. Verified static build, appearance/privacy scenario, actual computed cursor colors/width in both themes, persisted off/on after reload, unchanged source and blocked storage fallback. Screenshots visually inspected. Work record: docs/work/local-red-caret.md. All changes remain local under publication hold; no version bump or GitHub update.

Latest local UI request: place font-size slider next to Wrap column selector. Moved existing font-label and fontValue immediately after Wrap in bottom view-controls, removed font-label auto left margin. Existing handlers/preferences retained. Build and actual Chromium DOM/bounds/font adjustment checks passed; settings-bar screenshot visually inspected. No publication/version bump. Work record: docs/work/local-settings-order.md.

Latest local UI request: grey all Markdown selectors. Implemented parser-aware source-markers.js ranges (heading/emphasis/strike/list/quote/link/code/table/task/tag markers, escape prefix and maths delimiters), preserving literal punctuation in code/maths and content text. Uses the already bundled extended Markdown language, without new dependencies. Grey overrides Authors colours only for marker spans, dark #909090/light #737373. Decorator refresh observes syntax-tree progress. Build, fifteen Node checks and nineteen Chromium scenarios passed; direct browser checks in both themes/Authors confirm correct colours and exact unchanged source. Screenshots inspected. Work record: docs/work/local-markdown-markers.md. Everything remains local under the publication hold.

## Pending owner batch and task queue (latest)

Preserve ALL queued requests: style indicators; character count followed by labelled Document/Workspace word counts (bold numbers); PX brand size; Markdown download at left-column bottom; draggable column widths except fixed Navigator; presentation spacing for semantic blocks without source whitespace; future core plaintext-egress denial in non-trusted/client-held mode; Navigator recording defects; sentence/paragraph selection snapping explicitly queued from initial exploration. Central queue: docs/FRONTEND_TASK_QUEUE.md. A new request does not cancel earlier tasks.

Recording inspected locally: /Users/diaan/Downloads/Screen Recording 2026-10-24 at 18.29.53.mov, 382x1670, 16.67 seconds. Native frames under /tmp/hypergraph-navigator-clip, outside Git. It shows miniature table/formula representations changing as editor content virtualizes. Current Navigator clones visible widgets but substitutes source/estimates offscreen; replace that representation with stable full-document layout and source-based mapping. Selection snapping remains queued beyond existing multi-click selection.


## Completed local owner batch — latest authoritative state

The preceding pending-batch paragraphs are historical. All items in docs/FRONTEND_TASK_QUEUE.md are now completed locally or explicitly specified as future core work. No publication, commit, version bump or GitHub update occurred; version remains 0.4.0. Live preview: http://127.0.0.1:5173/ (refresh rebuilt assets; synthetic tab-only state).

Implemented parsed block/inline context indicators; characters then bold Document/Workspace word totals; matching PX brand size; Markdown download at left-column footer; draggable/keyboard column widths with fixed 90px Navigator and validated display preferences. Workspace counts each independent fixture document once, including local forks. Column resize Escape/lost-capture cleanup preserves state.

Owner confirmed Markdown blank-line paragraph rules. document-presentation.js caches full Markdown syntax by immutable Text, deriving marker/heading/block-gap presentation without inserting whitespace or changing Enter/soft-line semantics. minimap.js now builds a stable full-source projection with table/math widget factories, independent of the main viewport; source anchors map its viewport and navigation to main-editor geometry. Fonts/layout trigger remeasurement. Video native frames remain in /tmp, not Git.

source-selection.js provides default-on persisted bottom-bar Drag snapping for sentence/paragraph ranges, exact protected code/math/table contexts, forward/backward dragging and independent click counts 1–5 (caret/word/sentence/paragraph/section). Existing keyboard/modified selection stays precise. Fixed a modal-close race: a delayed native close event previously restored stale selection over a later click; synchronous idempotent cleanup now restores context only during explicit close handling.

Future client-held/non-trusted mode must deny application-controlled egress in core commands/policy, including exports/GitHub/providers/clipboard/print/logs/caches, across all transports. Specifications/DATA/ENCRYPTION.md details scope and honest endpoint limits; earlier export allowances reconciled. This is specification only, no backend implementation or new proof claim.

Executed: build and 19 Node tests passed; complete 26-scenario Chromium run passed (test-results last-run status passed, zero failures). Visually inspected current dark workspace and stable rendered Navigator screenshots. No new dependencies or Rust/proof source changes. Preserve local cpufeatures lock repair and owner README grammar edit. Publication hold remains in force.


Latest local refinement: vertical column resize handles now visually match the horizontal right-panel divider, rotated: 6px background track, paired theme borders and centered 1px muted grip spanning the middle 10%. Keep 8px pointer targets and existing keyboard/drag behavior. Build and targeted Chromium resize/Escape/persistence scenario passed; desktop screenshot inspected. No publication.

Latest local refinement: column pointer resizing suppresses the selected-looking focus outline; keyboard navigation restores its visible focus cue. Tooltips remain hidden during pointer drags (including delayed focus/scroll rearming). Build, two targeted Chromium scenarios and direct held-drag/keyboard checks passed. No publication.

Latest future requirement: Word review import, matching tracked changes/comments to an explicitly selected branch or exact snapshot, attributed to a stable virtual Word Revision contributor. New Specifications/WORD_REVIEW_IMPORT.md covers ambiguous/stale matching, immutable snapshot/writable destination, conflict review, original external labels versus importing human, contributor visibility, untrusted parsing, retry/recovery and encryption policy boundaries. Linked product/frontend specification, index and README; queued only, no implementation/dependency/proof claim. Publication hold remains active.


## Publication authorized — 0.5.0 preparation

Owner requested “Push to github”, lifting the earlier hold. Publish accumulated frontend features/fixes, Word review import and future egress specifications, local cpufeatures repair and owner README grammar edit. MINOR 0.5.0 reflects new frontend functionality; workspace/Lean/npm metadata synchronized by named entries only. No external dependency upgrade or Rust/proof source change. Final checks and publication evidence follow execution.


## Resumed publication: existing 0.5.0 and CI repair 0.5.1

On resume, the working tree was clean: 0.5.0 was already published in 685af85777623b44ae8230fce939f39ce42bbcee, followed by owner README edit 67901ee055ce3162759654be71242d9d7e4892f3. Preserve both commits. All three hosted Rust/Lean/extracted-proof workflows passed at 67901ee; frontend 40118154986 failed at the second forward drag assertion, which read the previous DOM selection. Browser selection is painted asynchronously by CodeMirror. Change the regression assertions to poll the exact expected range, retaining forward/backward/protected/source-preservation checks; no app behavior is changed. New publication uses PATCH 0.5.1, with named metadata entries synchronized and dependencies unchanged. Issue 16 tracks completion.

On resume, pinned local Lean model build, theorem axioms and leanchecker passed. The actual-Rust helper replay also passed: unchanged source re-extracted, exact generated source, locked dependencies, spend_spec proof and environment checked. No new proof guarantee or digest entry is introduced. Final test/push/hosted results follow actual execution.

Executed for 0.5.1: 19 Node tests, static build and all 26 Chromium scenarios passed, plus 10 repeated drag-snapping scenarios. Locked cargo check passed; prior full Rust fmt/clippy/eight tests passed on identical Rust sources. Pinned Lean models/axiom audit/leanchecker and extracted Rust helper replay passed. External dependency version/checksum records and proven expansion source digest match published source. Publication and hosted verification remain to be observed.


0.5.1 b0ce8acff98a512bb70fc2be65e2642a1648e383 was verified pushed. Its frontend workflow 40136505888 failed on the same forward selection even with polling, disproving painting timing as a sufficient explanation. CodeMirror MouseSelection explicitly treats a single drag beginning inside an existing selection as selected-text dragging, with native Chromium behavior differing between macOS and Linux. Test gestures now collapse the previous selection by ArrowLeft and remeasure both source endpoints before each independent drag; no runtime behavior is changed. Version 0.5.2 is the follow-up patch. Preserve this failed diagnosis and subsequent evidence rather than claiming 0.5.1 passed hosted frontend CI.

Executed for 0.5.2: five repeated drag-snapping browser scenarios passed with fresh collapsed-caret gestures; static build, locked cargo check and diff whitespace checks passed. Remaining application source/dependencies/proof sources unchanged from 0.5.1. Full 26-scenario and 19-source-test checks passed locally before this isolated test change; hosted verification of this patch remains pending.


## README screenshot refresh — 0.5.3 / issue 17

0.5.2 ac824b94e98ed0e7b252a4c34e5cf9b36dd6fdb5 was verified pushed with a clean matching remote. All four hosted workflows succeeded: Frontend 40136732913, Rust 40136732920, Lean models 40136732923, extracted Rust proof 40136732910. Completion/evidence and the failed timing-only diagnosis are recorded in issue 16; issues 14–16 closed.

Owner requested automatic screenshot replacement. Added frontend/scripts/capture-readme.mjs and npm screenshot command: rebuild static assets, start an owned loopback synthetic preview on 5193, open a fresh 1600x1000 Chromium context, await fonts/layout, check page errors/overflow, write docs/images/Screenshot.png, close browser/server. Human preview on 5173 and its browser state are untouched. Only fixture data is captured; image intentionally tracked as documentation, not a test trace. README caption/alt text updated. Screenshot command executed successfully and resulting PNG visually inspected. No app runtime source, dependencies or proof guarantees changed. PATCH 0.5.3 metadata synchronized by named entries only; publication evidence follows execution.
