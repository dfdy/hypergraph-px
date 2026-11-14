# Browser interface — basic C3 audit

2026-10-30 · Proposed source-backed responsibility overview · HPX-TEST-105

This increment adds only **C3 / Browser interface**, opened by the Browser interface box in C2. Its six logical responsibilities share existing browser code; they do not introduce modules, services or adopted V3 boundaries. C4 views, C3 expansions and new sequences are deliberately deferred to later owner-led work.

The named Browser interface boundary contains the six areas below. The owner, Rust frontend delivery, Rust Runtime/API, ordinary OS clipboard and downloaded-file artifacts stay outside. Directional labels show inputs and outputs; bidirectional connectors pair requests with results. Assets arrive from Rust, and all protected workspace reads and commands pass through its API. There is no browser-to-SQLite, keychain or provider shortcut.

| Responsibility | Current status / limits | Main source evidence |
| --- | --- | --- |
| Interface shell and navigation | partial: Desktop shell, document switching, contents tree, minimap and display preferences. Workspace/concept lenses include synthetic or limited scope; preferences do not store manuscript content. | [app.js](../../../frontend/src/app.js); [outline-tree.js](../../../frontend/src/outline-tree.js); [minimap.js](../../../frontend/src/minimap.js); [column-widths.js](../../../frontend/src/column-widths.js); [tooltips.js](../../../frontend/src/tooltips.js) |
| Workspace access and capability gates | implemented: Trusted-server launch session, capability checks, explicit create/unlock and lock controls. Session authentication, workspace unlock and server resource authorization remain distinct; keys stay in Rust. | [runtime-adapter.js](../../../frontend/src/runtime-adapter.js); [app.js](../../../frontend/src/app.js) |
| Owned-source editing and presentation | partial: Exact whole-document owned text, selection/Undo and Markdown/table/math presentation. UTF16 display coordinates map against preserved source bytes. Multi-owner editing and general Embed remain gated. | [app.js](../../../frontend/src/app.js); [owned-source.js](../../../frontend/src/owned-source.js); [inline-presentation.js](../../../frontend/src/inline-presentation.js); [formatting.js](../../../frontend/src/formatting.js); [table-view.js](../../../frontend/src/table-view.js); [math-view.js](../../../frontend/src/math-view.js); [functions-bar.js](../../../frontend/src/functions-bar.js) |
| Runtime requests and buffer coordination | implemented: Per-context buffers and captured API operations; draft acknowledgements, explicit/departure Commit and original-operation reconciliation. Tentative browser state is not publication; typed schema coverage remains incomplete. | [runtime-adapter.js](../../../frontend/src/runtime-adapter.js); [api-client.ts](../../../frontend/src/api-client.ts); [adapter.js](../../../frontend/src/adapter.js) |
| History, branches and graph inspection | partial: Bounded retained history, snapshots, branch comparison, graph and audit inspection. Original-branch/working-source limits are explicit; general multi-parent integration and federation remain gated. | [history-panel.js](../../../frontend/src/history-panel.js); [runtime-branches-panel.js](../../../frontend/src/runtime-branches-panel.js); [runtime-branch-comparison.js](../../../frontend/src/runtime-branch-comparison.js); [runtime-graph.js](../../../frontend/src/runtime-graph.js); [runtime-audit-panel.js](../../../frontend/src/runtime-audit-panel.js) |
| Annotations and provenance panels | partial: Protected assertions, comments, contributors, derivation and private-reference panels. Synthetic examples stay labelled; agent execution, general Embed and provider integrations remain planned. | [runtime-assertions-panel.js](../../../frontend/src/runtime-assertions-panel.js); [runtime-comments-panel.js](../../../frontend/src/runtime-comments-panel.js); [runtime-contributors.js](../../../frontend/src/runtime-contributors.js); [runtime-derivation.js](../../../frontend/src/runtime-derivation.js); [runtime-clipboard-panel.js](../../../frontend/src/runtime-clipboard-panel.js); [runtime-working-clipboard-panel.js](../../../frontend/src/runtime-working-clipboard-panel.js); [app.js](../../../frontend/src/app.js) |

## Evidence and distinctions

- [Frontend interaction](../../06-subsystems/frontend-interaction.md), especially desktop responsibilities and contributor/provenance policy, supplies scoped obligations. [Browser/runtime](../../06-subsystems/interfaces/browser-runtime.md) supplies capability, owned-source, request and generated-contract boundaries. Historical statements that no runtime exists are qualified by its generated-transport section and current implementation/state; they are not current absence claims.
- Owner directions distinguish real node departure from tab hiding/blur, preserve selected-text heading Link, specify readable Markdown and keep parent-Merge design separate. [Owner decisions](../../02-governance/OWNER_DECISIONS.md) remain authoritative within their scope.
- `app.js` connects shell/editor actions to RuntimeAdapter and panel modules. `initializeRuntime` handles HTTPS launch/session and unlock UI; the server authenticates and authorizes. Passphrases are submitted explicitly; workspace keys remain Rust-only. A failed live initialization does not silently switch to fixtures.
- `owned-source.js` retains exact source separately from editor newline projection. Browser coordinate conversion and captured text remain separate from server validation. Copy/paste and temporary Markdown download are not durable draft acknowledgement or Commit.
- RuntimeAdapter keeps per-context pending operations, captured bytes, sequence/generation bindings and reconciliation. Runtime API requests use the shared client. Generated wire schema coverage remains partial; exact contracts remain in [OpenAPI](../../../shared/openapi.json).
- Bounded runtime history/branch/graph/annotation/provenance functionality exists alongside explicitly synthetic previews. Partial tags refer to the broader obligation gaps, not absence of the implemented subset. Agent/provider execution, general multi-owner Embed and full parent-Merge/federation are not presented as delivered.

## Test sources reviewed, not executed

- [Runtime adapter tests](../../../frontend/tests/runtime-adapter.test.js): captured saves, lost acknowledgements, uncertain Commit, identity/generation mismatch, lock/drain and recovery cases.
- [Runtime buffer browser tests](../../../frontend/tests/browser/runtime-buffer.spec.js): exact mixed newlines, paste/download/Undo, departure publication and failed/delayed acknowledgements.

## Next design questions

Expand the six areas interactively before selecting finer boundaries. Review ownership of shared app.js/RuntimeAdapter fragments; richer workspace navigation, multi-owner editing, graph scope and planned agent/citation UI remain open. No substantive architecture or compatibility decision is adopted here.

## Verification

See [executed modelling evidence](../evidence/browser-interface-c3-validation.json). Only model/source/navigation/layout/document checks and a native static preview are intended for this increment. No application tests, browser, application build/launch, asset/contract generation, proof, trust/provider/workspace action, commit or publication.


## Focused C2 container context (historical; removed)

2026-10-30 · HPX-TEST-106. **C2 / HPX containers → Browser interface → C2 / Browser interface → Browser interface → C3 / Browser interface** was the visual entry path for that increment. The owner subsequently removed the redundant focused C2; the current path is **C2 / HPX containers → Browser interface → C3 / Browser interface**. This focused C2 is a container-context view, not another decomposition level or a second browser implementation.

The former `architecture/C2/browser-interface.c4` reused existing elements and relationships; it and its saved layout have been removed. The evidence below records that historical increment. One Browser interface boundary contains the browser container; the owner, Rust executable, embedded SQLite workspace, ordinary clipboard and download artifacts are outside. Eight curved connections cover every existing direct browser boundary exchange plus launch/configuration and Rust-to-workspace context:

| Exchange | Existing evidence | C3 correspondence |
| --- | --- | --- |
| Owner interaction and displayed results/status/errors | app.js; existing context and browser-detail flows | Interface shell and navigation |
| Embedded frontend assets from Rust | runtime/build.rs; existing frontend delivery flow | Rust Frontend delivery → shell |
| Bidirectional HTTPS requests/results/receipts | RuntimeAdapter/api-client; two existing browser-detail relations aggregated at container level | Workspace access and runtime coordination ↔ Runtime/API |
| Ordinary exact-source copy/paste | owned-source.js; existing clipboard flow | Owned-source editor ↔ OS clipboard |
| Exact uncommitted Markdown download | app.js; existing download flow | Owned-source editor → files |
| Owner launch/configuration and Rust workspace access | main.rs/storage; existing context flows | Context only; no browser-to-SQLite connection |

Static assets remain available before session authentication/workspace unlock, subject to the existing transport and request checks; protected API operations retain their own gates.

“Fully connected” means complete evidenced boundary exchanges and a connected container-context graph, not an all-to-all network. The diagram keeps browser internals in C3 and Rust internals in its own C3. Rust's optional keychain, enrollment backups and planned providers/peer/integration services remain in the system/Rust diagrams; they are not direct browser dependencies. Temporary download remains distinct from draft acknowledgement and Commit. No new relationship, runtime service, contract or V3 architecture is introduced.

[Executed C2 checks](../evidence/browser-interface-c2-validation.json) record model/navigation/coverage/geometry/document validation. Existing C2/C3/C4/sequence arrangements are retained. Static native preview review is not actual VS Code acceptance; no browser/application build, launch, tests, regeneration, proof or state/publication action was performed.


## User interface and Interface functions

2026-10-30 · HPX-OWNER-024 · HPX-TEST-107. This section supersedes the initial six-box overview arrangement, while retaining its evidence and responsibility IDs.

**C3 / Browser interface** now has exactly two clickable blocks: **User interface** and **Interface functions**. Each opens a matching C3 expansion. The original six responsibilities are reused in Interface functions; their model parents/IDs remain unchanged to preserve references. Logical membership is explicit metadata/view grouping, not a claim that code moved. UI-related rendering in those shared responsibilities remains real; visible regions are separately mapped in the User interface expansion.

The UI expansion maps existing HTML areas: workspace/contents navigation, document editor, Navigator/minimap, Interaction panel, Investigation panel, shared controls/status. It shows user actions/output and the shared function dependency for each area. The functions expansion retains existing internal dependencies, protected native API operations, exact source clipboard/download and status/error exchange with User interface. Fine UI/function correspondence is indexed in [Frontend Interaction](../../06-subsystems/frontend-interaction.md#functional-organisation-owner-direction-2026-10-30); diagrams aggregate context/state exchanges rather than inventing dispatcher APIs.

| Parent | Expansion | Internal content | Significant external inputs/outputs |
| --- | --- | --- | --- |
| Browser interface | existing `c3_browser` | User interface; Interface functions | Owner interaction/display, embedded assets, Rust session/unlock/protected requests/results, exact-source clipboard/download |
| User interface | `c3_browser_ui` | Six visible UI regions | User actions/feedback; shared function intents/state/results; embedded HTML/CSS/module bootstrap |
| Interface functions | `c3_browser_functions` | Original six responsibility areas | UI context/status, Runtime/API, ordinary OS clipboard, download artifacts |

Existing model elements and relationships are retained; new source-backed UI/grouping projections use separate relationship kinds so they do not add detail to other levels. Native delivery is still one bundled frontend pipeline; the overview asset caption covers both UI and function code. The UI expansion's shared controls/status region represents shell/bootstrap, not a second delivery mechanism. All original browser boundary flows remain accounted for in the two-block overview and functional expansion. C2 entry points and existing C4/sequences are unchanged.

The new block/region status tags describe evidenced implementation coverage; partial panels include synthetic/gated features and do not imply live agents, general Embed, complete graph scope or stronger security acceptance. The inherited frontend contract tail is retained byte-for-byte; the new functional index does not supersede accepted source obligations.

See [executed split checks](../evidence/browser-ui-functions-split-validation.json). Native static previews are layout aids,not actual VS Code renderer acceptance. No application build/tests/launch,browser,generation,proof,trust/provider/workspace,commit or publication action.

The functions expansion uses functional display names for retained IDs: `shell` → Navigation and display coordination; `history` → History, branch and graph operations; `annotations` → Annotation and provenance operations. Original model names/IDs and historical evidence remain intact.


## Direct browser C2-to-C3 navigation restored

2026-10-30 · HPX-TEST-108. The owner removed the redundant focused C2 browser view and its saved layout. The main C2 Browser interface box now opens C3 / Browser interface directly. Its two User interface / Interface functions expansions and their linkages are unchanged. Historical test/evidence records retain their original execution paths/hashes; current guides use the direct route. No model elements or relationships were removed.


## Spatial User interface layout

2026-10-30 · HPX-OWNER-025 · HPX-TEST-109. The User interface C3 expansion now follows the requested five-area layout: Top toolbar and Bottom toolbar span the body; Navigator is left; Editor is centre with document editor and minimap together; Functions is right with Collaborators above Relations. The existing Interaction and Investigation panel elements occupy those right-column subgroups, retaining their actual labels/tabs and stable IDs.

The existing shared-controls ID is shown as Actions and formatting in Top toolbar. A source-backed Display settings and status region makes existing below-editor preferences/footer explicit in Bottom toolbar. The original thirteen connections remain;two source-linked preference/status/user exchanges cover the bottom region. This is a visible-region projection over current index.html/app.js,not a new component implementation or an assertion that every grouped control already belongs to one DOM toolbar. The right Functions area is distinct from shared Interface functions and from the existing Fork/Link/Embed strip.

The owner, frontend delivery and shared Interface functions remain outside the named UI boundary. Inputs/outputs retain directional labels and simple cubic curves. Browser overview,Interface functions,C2 entries and unrelated diagrams remain unchanged. The [Frontend Interaction spatial index](../../06-subsystems/frontend-interaction.md#user-interface--visible-regions) documents group-to-region/source correspondence;retained contract sections remain byte-identical.

See [executed layout checks](../evidence/browser-ui-spatial-layout-validation.json). Static native previews are not actual VS Code renderer acceptance. No application code/tests/build/launch,browser,generation,proof,trust/provider/workspace,commit or publication.


## Selected-node editor Graph tab, 2026-10-30

HPX-OWNER-026 / HPX-TEST-111 add a planned Graph tab to a planned main-editor tab host alongside the existing text editor. The minimap remains in Editor (centre);all five spatial groups and Collaborators/Relations remain. Planned selected-node/view-context and function/query/interaction exchanges use grey dashed connections;current dialog code remains explicitly labelled in navigation C4. Owner direction is accepted for the future UI;the tab and broader linkage coverage remain unimplemented. Read-only interactive inspection/navigation,exact identities/authorised view,scope/completeness and draft/tab-switch preservation are specified. HPX-GAP-025 retains adjacency-depth,selection/recentring/mapping and query-contract questions. No application code or wire/schema change. See [executed checks](../evidence/selected-node-graph-tab-validation.json).
