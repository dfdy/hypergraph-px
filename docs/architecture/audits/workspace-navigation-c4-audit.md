# Workspace and contents navigation — C4 audit

2026-10-30 · Proposed source-fragment mapping · HPX-TEST-110

**Visual entry:** C2 / HPX containers → Browser interface → C3 / Browser interface → User interface → C3 / User interface → Workspace and contents navigation → **C4 / Workspace and contents navigation — Implementation**. Existing component IDs and owner-adjusted UI geometry are retained. The existing C3 expansion is the higher-level home; no additional workflow sequence is added.

## Scope and evidence

This view maps the actual Explorer/navigation implementation to source fragments. Several code boxes share app.js or the same function: they are responsibility projections, not additional modules. The named navigation boundary encloses seven implementation areas. Callers, input catalogs and shared providers/consumers remain outside even when their code is co-located. Calls/control and data dependencies are distinguished; exact contracts remain in their existing specifications.

| Internal code area | Inputs / outputs and coverage | Sources |
| --- | --- | --- |
| index.html • Explorer controls | implemented: Existing #navigation, lens tabs, Follow editor and Open/Close all controls. This is markup/DOM context, not a navigation service. | [frontend/index.html](../../../frontend/index.html); `navigation, followTree, toggleAllTree` |
| app.js • renderNavigation / document rows | partial: Workspace/Document rows from current client catalog; chapter disclosure is separate from opening. Runtime Graph delegates behind capability flags; History lens remains a placeholder even when other runtime history UI exists. | [frontend/src/app.js](../../../frontend/src/app.js); `renderNavigation, appendDocumentRow, syncRuntimeDocuments` |
| documentHeadings / editorProjection | partial: Parse ATX headings outside the implemented fence filter; derive duplicate-suffixed slugs and section bounds from the LF editor projection. Positions are JavaScript UTF16 hints, not canonical graph IDs or durable anchors. | [frontend/src/context-actions.js](../../../frontend/src/context-actions.js); [frontend/src/owned-source.js](../../../frontend/src/owned-source.js); `documentHeadings, editorProjection` |
| outline-tree.js • hierarchy and disclosure state | implemented: headingTree/headingAt and createOutlineTree render textContent labels, independent subsection collapse, current-location marking and reveal/setAll helpers. Keys use document plus derived heading slug. | [frontend/src/outline-tree.js](../../../frontend/src/outline-tree.js); `headingTree, headingAt, createOutlineTree, render, mark, setCurrent, expandPath, setAll` |
| app.js • navigation callbacks / outline | implemented: Existing callback fragments bind lenses, chapter/heading actions, Follow and Open/Close all. outline passes projected headings into the tree. These fragments share renderNavigation/appendDocumentRow and are not new functions. | [frontend/src/app.js](../../../frontend/src/app.js); `outline, createOutlineTree callbacks, data-lens onclick, followTree.onchange, toggleAllTree.onclick, previous.onclick, next.onclick` |
| app.js • openDocument / jump | implemented: Same-document no-op and busy-switch guard; save cached EditorState/scroll. Unlocked runtime departure awaits adapter.depart; refusal/unknown outcome retains active node. Successful switches restore context; heading jumps only move selection/viewport. | [frontend/src/app.js](../../../frontend/src/app.js); `openDocument, jump, editorKey, states, branchSwitching` |
| app.js • scheduleTreeFollow / controls | implemented: Coalesced requestAnimationFrame; follow toggle and Workspace/Document lens guards. Uses caret or visible-editor position, reveals ancestor path/current row and scrolls the outline. No source edit or publication. | [frontend/src/app.js](../../../frontend/src/app.js); `scheduleTreeFollow, updateTreeControls, treeNavigationMode, treeForce, lastFollowTarget` |

| Outside code/context | Connection to navigation | Sources |
| --- | --- | --- |
| Existing RuntimeAdapter / initializeRuntime | Live catalog, exact client buffers/capabilities, captured departure operation/results; onward API/recovery view | [runtime-adapter.js](../../../frontend/src/runtime-adapter.js), [existing C4 API view](../C4/api-implementation.c4) |
| CodeMirror EditorView integration | Existing app.js EditorView update/listener/state integration: source projection, selection, scroll DOM and cached editor states; no new editor module. | [frontend/src/app.js](../../../frontend/src/app.js) |
| savePreferences / loadPreferences | Optional localStorage hypergraph-display-v1 display settings, including validated followTree and column widths. Not manuscript persistence or retained pinned identities. | [frontend/src/app.js](../../../frontend/src/app.js) |
| installColumnWidths • shared layout helper | Actual shared outline/sidebar resizing and validated sizes. app.js onLayout callback requests editor measure/minimap refresh; onSave persists display settings. | [frontend/src/column-widths.js](../../../frontend/src/column-widths.js); [frontend/src/app.js](../../../frontend/src/app.js); [frontend/styles.css](../../../frontend/styles.css) |
| openRuntimeGraph • delegated inspection | Existing separately scoped graph dialog consumes RuntimeAdapter. Invocation is capability-gated; stale replies/locked lifecycle are rejected by dialog checks. General graph scope is not implied. | [frontend/src/runtime-graph.js](../../../frontend/src/runtime-graph.js) |
| notify / refreshAll • shared UI feedback | Actual app.js toast/status and coordinated UI refresh, including navigation and other panels. A UI refresh does not publish a revision. | [frontend/src/app.js](../../../frontend/src/app.js) |
| FixtureAdapter / fixture documents | Synthetic preview alternative and tab-local documents. No fallback after a failed live connection, authoritative graph or durable publication. | [frontend/src/adapter.js](../../../frontend/src/adapter.js); [frontend/src/fixtures.js](../../../frontend/src/fixtures.js); [frontend/src/app.js](../../../frontend/src/app.js) |
| User and Navigator/minimap | Navigation events enter existing callbacks; minimap changes the same EditorView viewport; switch/resize schedules its refresh | [app.js](../../../frontend/src/app.js), [minimap.js](../../../frontend/src/minimap.js) |

## Connection coverage

All 33 drawn connections have source links in [the model](../C4/workspace-navigation.c4). They cover navigation events/binding, DOM output, chapter/heading callbacks, parser/tree data, activation outcomes, live/fixture catalogs, EditorState/selection/scroll, coalesced follow/reveal, display preferences, shared sizing/minimap refresh, graph delegation and status/error refresh. Internal calls stay inside the subject boundary; contextual code is outside. Context-to-context dependencies clarify actual shared callback/data paths rather than imply extra navigation services.

The C3 navigation input/output aggregates are represented by explicit C4 participants: owner gestures, projected client documents, current editor/view context and returned rendered rows/selection/status. Shared Interface functions is decomposed here into existing code providers; no new browser-to-SQLite or key/authorization path is introduced.

## Semantics and limits

- Chapter disclosure changes expanded state independently of opening a document. Heading jumps change selection/focus/viewport; collapse/follow/render do not publish source or history.
- openDocument first handles same-document and busy-switch cases, then caches state/scroll. **When runtime exists and lifecycle is unlocked**, it awaits adapter.depart. Refusal/unknown outcomes report failure and return false before changing active node. After departure it rechecks lifecycle. The model does not invent a blanket unlocked guard for every possible entry: other source branches remain as implemented.
- RuntimeAdapter.depart serializes the captured context and calls commitCaptured with onlyChanged. It saves/reconciles captured source, checks the committed snapshot when unchanged, and publishes an existing Commit only when required. Navigation is not the entire transaction; acknowledgement/receipt recovery and Rust authority/durability remain delegated. Tab hiding, ordinary blur and same-document heading movement are distinct from actual node departure.
- Heading extraction uses its implemented ATX/fence filtering and JS string coordinates; outline data is computed from the editor newline projection. Slugs (including duplicate suffixes) and collapse keys are presentation hints, not permanent node/occurrence/revision identities or a complete CommonMark parser. Label changes/duplicate reordering may change those keys. Exact source bytes remain owned separately.
- scheduleTreeFollow coalesces requestAnimationFrame work, observes the follow toggle and Workspace/Document lens, uses caret or visible-editor coordinates, expands the current ancestor path and scrolls only to reveal the current outline row. Source and editor Undo are preserved by the inspected navigation code.
- Runtime Graph is delegated only when graphSupported; overlay/transformations use their supplied flags. **The History navigation lens still renders the fallback placeholder**, distinct from working runtime History in Investigation. General workspace collections/composition-order resolution and graph/history lenses are not claimed complete.
- Live data and synthetic FixtureAdapter/fixtureDocuments remain separate. A failed HTTPS initialization is not silently relabelled as a successful fixture session. Optional localStorage preferences/column widths do not store acknowledged manuscripts or supply a durability guarantee.

## Specification and test evidence

Reviewed [Frontend Interaction](../../06-subsystems/frontend-interaction.md) contents-tree controls, desktop workspace and hierarchical editor-following sections; [browser/runtime contract](../../06-subsystems/interfaces/browser-runtime.md); [owner decisions](../../02-governance/OWNER_DECISIONS.md), especially HPX-OWNER-010; and actual callers/modules above. [OpenAPI](../../../shared/openapi.json) remains the wire reference; this UI C4 does not expand its incomplete schema coverage.

Test sources reviewed, **not executed**: [outline-tree unit tests](../../../frontend/tests/outline-tree.test.js) (skipped levels/fences/order/heading selection), [context-action tests](../../../frontend/tests/context-actions.test.js), [outline browser tests](../../../frontend/tests/browser/outline-tree.spec.js) (independent collapse, Follow persistence/reveal), [workspace browser tests](../../../frontend/tests/browser/workspace.spec.js) (chapter disclosure/minimap), [runtime-buffer tests](../../../frontend/tests/browser/runtime-buffer.spec.js) (departure, refusal/delayed/unknown acknowledgement), [RuntimeAdapter tests](../../../frontend/tests/runtime-adapter.test.js) (captured saves/retries). Source review is not a fresh application test or acceptance result.

## Open V3 questions

1. How should the live History lens and richer workspace/composition navigation relate to existing Investigation/graph views?
2. Should display-only collapse/heading identity evolve beyond derived slugs, with explicit compatibility and privacy rules?
3. What additional stale-context/load/error handling is needed for future lazy or multi-owner navigation? Current loaded-buffer and departure logic must not be extrapolated to that design.

## Verification

See [executed modelling checks](../evidence/workspace-navigation-c4-validation.json). LikeC4/source/navigation/geometry and documentation checks are recorded separately from application tests. Native static preview review is not actual VS Code acceptance. No application code/tests/build/launch,browser,asset/contract generation,proof,trust/provider/workspace,commit or publication.


## Editor Graph tab design refinement, 2026-10-30

HPX-OWNER-026 supersedes the graph dialog as the intended navigation destination: open a main-editor Graph tab focused on the selected node and its linkages. C4 retains the solid current dialog callback/code as source evidence and adds a dashed planned route to the Graph tab. This does not claim the tab or general selected-node adjacency exists. See [frontend target](../../06-subsystems/frontend-interaction.md#selected-node-graph-tab-owner-direction-2026-10-30),[graph scope](../../06-subsystems/graph-engine.md#selected-node-editor-graph-tab-2026-10-30) and HPX-GAP-025 for unresolved selection/depth/query mechanisms. The earlier33 connections remain implementation evidence;the planned route is additional.
