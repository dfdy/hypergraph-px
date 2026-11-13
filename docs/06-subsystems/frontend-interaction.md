# Frontend Interaction

## Common metadata

- **ID:** `HPX-SUB-009`
- **Title:** Frontend Interaction
- **Purpose:** Desktop UI, formatting, navigation, selection, provenance and relation displays.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../04-architecture/system-architecture.md>); [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-30

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../../architecture/context.c4) (HPX-CAN-002); [chat/MCP and permission details](ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

The browser is a client of the shared human/machine hypergraph API. UI availability may reflect permissions, but backend enforcement is mandatory for each protected operation and result. Preserve denial/conflict/uncertainty feedback and drafts; do not treat a disabled control, selected node, session cookie or workspace unlock as authority. Local editor/view behaviour remains browser execution. See the [accepted shared API scope](interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


Fixture controls and future contracts are not durable service implementations. Capabilities must report unavailable honestly.


## Functional organisation (owner direction, 2026-10-30)

The browser organisation and its displayed inputs/outputs are canonical in [C3 / Browser interface](../../architecture/C3/browser-interface.c4) and its [UI/functions expansions](../../architecture/C3/browser-organisation.c4), HPX-CAN-004. Grouping and implementation-path tables are removed from this document.

### User interface — visible regions

The User interface view owns spatial groups/nesting and planned Graph-tab placement. These are logical drawing groups, not a requirement to rename DOM controls or introduce modules. Existing Interaction/Investigation labels and tab meanings retain their detailed contracts below. Functions (right) is a sidebar group, distinct from Interface functions; a function may serve several regions.

### Interface functions — retained logical responsibilities

The Interface functions view owns the displayed responsibility decomposition. [Workspace and contents navigation C4](../../architecture/C4/workspace-navigation.c4) owns its source-symbol mapping; detailed editor behaviour, exact-source ownership, API state and error rules remain in this document and linked contracts.

## Selected-node Graph tab (owner direction, 2026-10-30)

HPX-OWNER-026 refines HPX-RQ-029: move graph visualisation from a separate dialog into a **Graph tab in the main editor window**, alongside the text/document editor. The graph shows a graphical representation of the **currently selected node with all its linkages**, with interactive node/relationship inspection and navigation. This is accepted future UI direction; the editor tab and expanded selected-node coverage are **planned**, not implemented by the existing dialog.

- The selected node is the clearly identified graph focus. Carry its logical identity and exact authorised view/revision/occurrence context; a heading offset, selection label or equal text is not sufficient identity. Choosing an outline heading does not automatically establish a canonical graph node mapping.
- Show labelled nodes and relationships with direction, participant roles, context and evidence status. Include all linkages in the authorised supported scope; progressive loading must expose permitted incompleteness/unsupported families, never silently present a partial Fork/assertion graph as the whole graph. Withheld identities/counts remain protected. The [graph contract](graph-engine.md#selected-node-editor-graph-tab-2026-10-30) preserves n-ary relationship identity and scope rules.
- Support interactive selection/inspection and navigation of the visual graph, with an accessible text/keyboard alternative. This instruction does not add relationship creation/deletion or publication operations; HPX-RQ-029 remains read-only. Exact gestures, root-neighbour depth and whether selecting a neighbour changes the active editor node remain design questions, not invented mechanisms.
- Text and Graph are views in the same main editor area. Switching tabs preserves the owned buffer, draft/acknowledgement state, selection, Undo and recoverable editor state. A tab switch alone is not logical-node departure, Save or Commit. If an interaction changes the active logical node, retain the existing departure/recovery rules.
- Changing selected node, view, branch, permissions or workspace lifecycle invalidates obsolete graph replies. Bind results to their requested context; do not attach old-snapshot relationships to current draft passages by guessing. No new wire route, graph snapshot format or query adapter is selected here.

**Current implementation evidence:** app.js invokes openRuntimeGraph from the capability-gated Graph navigation lens; runtime-graph.js implements a dialog with bounded selected document/assertion/transformation scopes. Retain that source mapping in C4 as **Current graph dialog**. The proposed route opens the new editor Graph tab instead. Data/selection transfer and broader adjacency queries still need design; no application code changed with this specification update.

## Multi-user and AI-user UI baseline

[HPX-SUB-010](ai-collaboration.md) requires distinct human/AI users and multiple agents per workspace. Agent chat must expose actual workspace prompt/context/response nodes and their graph/history/provenance, with authorised disclosure. A focused current-agent indicator may coexist with several assigned/active agents; it must not imply one agent per workspace. Contributor lists remain separate from membership/presence. MCP permits authorised direct editing of the selected node with the same draft/version/graph/Commit and recovery behaviour as human input; selection is not a permission grant. Existing mock chat, single-owner runtime and contributor UI are partial implementation evidence, not delivery of this baseline.

## State and operations

### Changed-source conflict handling — HPX-OWNER-043

The [existing Editor region](../../architecture/C3/browser-organisation.c4) owns the accepted control scope. For conflicts encountered while resolving changed followed sources before Commit, provide a setting that toggles between **Ask** (request a choice) and **Automatic latest timestamp** (choose the version with the latest timestamp). In automatic mode, visually mark the affected sentence, paragraph or section as having a **potential conflict**. The marker has a link opening a modal for comparing changes. This is accepted future behaviour, not an implemented setting or a general adoption of last-write-wins branch merging.

Automatic choice does not prove the conflict resolved, confer permission or trigger Commit by itself. The chosen exact version must still be reflected in the committed snapshot; retained alternatives/history are not erased. Compare only authorised exact versions, preserve source bytes/selection/Undo and distinguish repeated occurrence contexts; sentence/paragraph/section display regions do not automatically become new persistent nodes. Normal current-authority, exact-state, uncertain-outcome and atomic publication requirements remain; this setting cannot change an already-submitted frozen operation or its receipt.

**Follow-up choices (HPX-OWNER-044):** latest means the time **HPX recorded the version as committed**, not a writer-supplied device timestamp. Equal competing Commit timestamps require asking, even in automatic mode. The preference belongs to each workspace-local user;changing one user's mode does not change another's. **Ask is the default**;automatic selection is an explicit user choice.

The potential-conflict marker is shared evidence about the affected committed version,not a private consequence of a viewer's preference. Every authorised viewer of that version sees the marker regardless of mode. A private unpublished draft and its markers do not thereby become shared. Keep the shared marker until someone authorised explicitly resolves the conflict;merely opening or reading the comparison modal cannot clear it. Retain resolution/history evidence rather than rewriting historical source bytes. Exact marker/resolution records and UI transitions still require design;no new permission vocabulary is adopted.

Timestamp precision/encoding,missing or incomparable values,exact marker granularity/representation and modal/resolution mechanics remain open. Recorded Commit time is a selection heuristic,not proof of causal precedence,correctness or semantic agreement. Existing storage/wire versions and current UI capabilities are unchanged.

### Cycle warnings and deliberate navigation — HPX-OWNER-041

Follow the [accepted inclusion-cycle policy](../05-domain/hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041): show an explicit accessible boundary warning instead of auto-expanding the stopped dependency. Offer deliberate authorised click-through; each action is bounded and must not trigger recursive auto-opening. Keep exact target/view context, stale/lock/permission handling and normal source/selection/Undo/departure rules. Exact wording, controls and state encoding remain design details. Required [Lean state-transition proofs](../07-implementation/formal-invariants.md#required-cycle-aware-expansion-proofs--hpx-owner-041) do not replace actual UI/accessibility checks. This behaviour is required, not implemented by current graph/navigation controls.


### 2. Desktop presentation and interaction responsibilities

Source `HPX-SRC-0028`, original lines 27–46. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Default left-to-right layout: **workspace/contents navigator → styled Markdown source editor → document minimap → split right sidebar** (upper Interaction: Agent, Comments, Users; lower Investigation: Relationships, Concepts, Sources, Provenance, History). Default to this order; allow the Navigator to be hidden or positioned directly left of the editor, after the workspace contents. Persist validated visibility/side display preferences and recompute editor/Navigator geometry without changing source, selection or undo. The minimap is labelled **Navigator** and supports wheel, click/drag and keyboard navigation. Its current-viewport indication must stay synchronized with the same editor projection as the contents tree. Mobile responsiveness is deferred.

The browser owns presentation, input/IME, local transactions, caret/selection, focus, undo/redo and display preferences. Rust application services own authoritative identities, source ownership, permissions, validation, draft durability, proposal approval, publication, provenance and recovery. The browser may track tentative mappings to preserve editing responsiveness; Rust independently validates mappings before accepting writes.

Provide separate Paragraph (¶) and H1–H4 controls instead of a style dropdown. Highlight the block style at the caret and show parsed Bold/Italic/Blockquote/Bulleted/Numbered-list context; active formatting toggles off and list conversion preserves nesting. Chapter disclosure arrows expand/collapse their own outlines independently from opening a chapter. The minimap uses the editor's actual line/wrapping/widget geometry and uniformly scaled viewport, not an independently wrapped text stream. Name individual interface controls/actionable items with delayed tooltips (exclude editor surfaces, large panel containers and all text-labelled controls/items that already explain their purpose, including tabs, buttons, labelled fields and Explorer entries; retain tips for glyphs, icon-only controls and ambiguous formatting abbreviations) after 1,500 milliseconds of hover, suppress early native-title popups, and preserve accessible names and keyboard equivalents.

Display Markdown syntax markers in neutral grey in the source editor: heading hashes, emphasis/strike delimiters, quotes/list prefixes, link/image delimiters, code markers, table/task syntax and tag delimiters. Recognize source syntax rather than greying literal punctuation in code or maths. Keep marker grey when Authors colours are enabled, use readable theme-specific greys, and preserve source/selection/undo.

Use a clearly visible red editing caret by default, with a **Red caret** checkbox in the bottom settings bar. Disabling it restores the current theme accent; persist only a validated display boolean and keep source/selection unchanged. Choose distinct dark/light theme reds and preserve native/drawn cursor handling.

The bottom information bar shows **Document and Workspace word counts**, with both numeric word counts bold. Omit line numbers, column numbers and character count from this bar. The fixture Workspace total counts each independent tab-local document once, including forks, rather than repeated placements or clipboard entries. Count Unicode word-like segments of the current Markdown source, update on edits/undo and document switches, and avoid rescanning unchanged text on caret movement. This is a browser display metric, not canonical content metadata; preserve existing source-coordinate/character semantics.

The top Functions bar exposes **Fork, Link and Embed** separately from provenance clipboard capture/paste. Fixture forks may create independent tab-only test documents with source attribution preserved; plain Markdown heading links remain distinct from typed graph relationships. Embed previews identify source/resolution policy but shared insertion remains gated on authoritative source/placement services. Cancelling a dialog preserves the exact selection; stale source contexts cannot be applied.

Keep buttons and labels honest. Distinguish document text editing from structural publication and distinguish a temporary download from a saved draft. Provide keyboard operation/focus restoration for contents, minimap, dialogs, resizable panels and tabs. Unsupported actions have an explanatory unavailable state; a visually enabled control is never an authorization grant.

Treat document text, comments, model output, remote labels and link destinations as untrusted display inputs. Escape/sanitize rendered markup, constrain active URL schemes and prevent raw document HTML from executing scripts. Rendering a table, switching source/render view, navigating or changing appearance creates no history.

### 8.1 Users as document contributors

Source `HPX-SRC-0028`, original lines 174–187. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The upper Interaction panel has three tabs: **Agent, Comments, Users**. **Users lists all known contributors to the current document, not logged-in or connected users.** Derive it from authorized contribution/attribution/provenance records for the viewed document/state. A disconnected contributor remains listed; connecting alone does not make anyone a contributor. This read projection is not membership or mutation authority. HPX-OWNER-027 requires multiple human/AI users and agents in the product; the current one-human development view does not constrain that architecture.

At the top, pin **current human** and **current agent**, resolved by opaque principal identity from the authenticated human and the agent assigned to this document/editing context. They remain distinguishable from historical contribution claims: pinning someone does not assert they wrote text. If no current agent is assigned, show an explicit “No current agent” row rather than fabricate a connected agent/principal. Fixture identities are clearly labelled synthetic/display-only; a provider label, model name, MCP connection or sample chat message is not an authoritative agent identity.

Below the pinned entries, list **other contributing users/agents**, one entry per authorized principal, without duplicating the pinned principals. Deduplicate by principal ID, never display name or device. Show permitted contribution roles rather than calling every contributor a text author: author, editor, structural contributor, recorded reviewer/approver or commenter where the application's contribution records establish that role. Merely opening a document, logging in, configuring a provider or generating an unaccepted proposal is not evidence of a document contribution. Reused-source authors are included when explicit authorized provenance establishes their contribution; arbitrary linked/ancestor identities are not inferred to be authors.

“All known” includes recorded earlier contributions, including edits to content no longer present, within the viewer's authorized document/provenance/history scope. Full retained-history access is not granted by opening this tab. Return only identities/roles and completeness information the policy allows; do not reveal withheld identities or counts. A historical snapshot query binds its exact permitted state and cannot acquire contributors from newer heads. An unavailable/incomplete contributor index is reported honestly, never replaced by current presence. Queries are bounded/paginated, with navigation to all available contributors rather than silent truncation. A recoverable contributor index derives from authoritative records rather than becoming a second history authority.

Use one session-stable **distinct assigned colour per displayed principal**, including pinned entries, and reuse that palette in inline attribution and context-menu indicators. Reserve current-human red (hue 0) and current-agent blue under the display convention in §8.2; assign other contributors distinct colours with collision handling. Loading later pages must not reshuffle existing colours or merge different identities. Names, human/agent kind and role labels remain necessary for accessibility; colour alone is not an identity or evidence. The Authors toggle controls inline highlighting, not whether the Users list shows contributor colours. Do not persist principal/hue maps in display cookies.

The optional `getContributors` adapter may use candidate `GET /documents/{document}/contributors`, bound to exact projection/snapshot, authorized contribution scope and cursor. Return permitted principals/roles and current-context references separately from historical contribution facts. This is a planned read model, not an implemented endpoint. `GET /documents/{document}/presence` and `GET /workspaces/{workspace}/members`, if later supported, remain separate connection/membership projections and **must not populate the Users contributor list**. Current-agent context resolution and contributor-role/completeness rules must be specified before live integration; no new graph primitive or identity model is required.

### 8.3 Mathematics source and rendered presentation

Source `HPX-SRC-0028`, original lines 200–209. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Provide a **Source/Rendered** mathematics display toggle, default Source. Save/export the original Markdown/LaTeX source; generated HTML/MathML is presentation only. Support the planned delimiters `\(...\)`, `\[...\]` and `$$...$$` outside code spans/fences, including mapped table-cell source. Toggling must preserve source bytes, source ownership, draft sequence, attribution, selection and undo; it creates no save, revision or mathematical proof.

Use a locally bundled browser renderer and its CSS/fonts/license notices, embedded with the final release assets. This preview needs no CDN, TeX service, Node runtime or Rust maths-render endpoint. Current frontend source pins KaTeX in `frontend/package.json` and bundles its assets; this is implementation evidence, not blanket rendering/security acceptance. Preserve dependency/license review before changes. Disable trust, apply finite size/macro-expansion/input/output budgets, isolate mutable macro state to the explicit rendering context, and escape/sanitize errors without leaking raw source into executable HTML. See the renderer's [security guidance](https://katex.org/docs/security) and [options](https://katex.org/docs/options). Accessibility output does not replace actual keyboard/screen-reader acceptance.

Invalid/unsupported formulas remain visibly recoverable as source. Widgets must map actions to exact source context even when rendering changes visual width. Escape-doubled fixture strings must not establish a production source encoding: any narrow fixture compatibility decoder is explicit, render-only and source-mapped. Do not broadly unescape/backslash-normalize stored documents or silently change legitimate LaTeX. Render success is not a mathematical correctness or Lean proof result.

Exact rendered exports bind renderer/version, fonts, options, macro inputs and other compiler dependencies in their reconstruction profile. Plain Markdown export preserves formula source and needs no formula rendering pass. No renderer asset or fixture-expression test is claimed executed by this specification.

### Local layout and editing refinements

Source `HPX-SRC-0028`, original lines 297–305. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Column widths are adjustable by dragging accessible separators, with keyboard alternatives and validated display preferences; Navigator width remains fixed regardless of side/visibility. The editor uses remaining space. Keep the Markdown download action at the right of the document bar (replacing the synthetic demo branch label) and the Navigator side-toggle at its own bottom.

Presentation adds space between recognized paragraphs/headings/blocks without requiring manual spacing adjustments or rewriting source. Owner-confirmed policy: retain Markdown’s blank-line paragraph rule and ordinary Enter behavior. Soft source-line breaks remain within the same paragraph; visual padding does not create paragraphs. Future LaTeX/Word compilation must derive paragraph/heading structure from the canonical semantic model and apply target styles; screen padding is not content or a source delimiter.

Repeated clicks in one spot select caret, word, sentence, paragraph, section (one through five). Drag snapping is controlled separately by the bottom-bar Drag snapping checkbox; preserve keyboard/Shift selection, exact forward/backward source ranges, Unicode and protected code/table/maths boundaries. Fixture mouse settings do not define future canonical anchor formats.

### Adjacent-unit relationship visualization

Source `HPX-SRC-0028`, original lines 316–320. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Implement [adjacent-unit markers](<frontend-interaction.md#adjacent-unit-relationship-markers>) as source-neutral editor widgets: compact horizontal double-ended arrows for sentences, larger vertical ones for paragraphs, one arrow per relationship. Delayed names, keyboard activation and exact Relations-tab inspection are required. Reflect the same layout in the Navigator. Preserve source/undo, selection, per-document state and pinned context; report invalidated anchors instead of guessing. The synthetic adapter may demonstrate multiple local records and explicit review-needed states, without claiming canonical semantic identity or graph publication. Resolve real snapshot/occurrence/authorization mapping before backend integration. Adjacent sibling sections also use vertical markers. Follow the [relationship interface](<frontend-interaction.md>) for the categorized context-menu modal, blank/unique-match search, single-field custom terms, selection restoration and caret-scoped cards. Relations always follows the caret independently of other pinned lenses; explicit inspection lasts until the next caret move.

### Contents-tree controls

Source `HPX-SRC-0028`, original lines 321–323. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Implement the [hierarchical contents/follow contract](<frontend-interaction.md#hierarchical-contents-and-editor-following>) in Workspace and Document lenses: document rows directly under EXPLORER, per-branch disclosure, evenly spaced vertical subtree guides, bottom Follow editor preference and Close all / Open all toggle that retains documents/chapters. Follow caret/viewport section using current source headings, reveal ancestors and scroll only the left tree without stealing focus. Do not treat display collapse state or heading labels as canonical revision/occurrence identities.

### 2. Desktop workspace

Source `HPX-SRC-0037`, original lines 11–27. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Default to four columns: **left navigator → editor → narrow minimap → right sidebar**. Label the mini-overview **Navigator**; allow hide/show and positioning directly left or right of the editor, with saved display preferences. Wheel scrolling over it moves the same editor and viewport; Ctrl/pinch zoom remains under browser control. The left workspace navigator offers Workspace, Document, Graph and History lenses. The branch/snapshot heading tree remains readily accessible; overlays add authorized concept/comment/source/contributor/change indicators without replacing its structure. Display query scope: selection, section, snapshot, branch, document or workspace; federation scope remains unavailable.

Workspace shows nested collections, documents and ordered composite works. Expand a chapter into headings, with breadcrumbs and previous/next chapter navigation following the selected composition order. Document shows the current outline; Graph shows bounded references/backlinks/concepts/provenance; History distinguishes revision, composition, derivation and snapshot views. Missing/denied results must not expose hidden target existence or counts.

The right column contains two independently scrollable, collapsible, vertically resizable panels:

- **Interaction (upper): Agent, Comments, Users.** Users retains the permission-scoped document-contributors contract, with current human and current agent pinned, then other contributors. It is not presence or membership.
- **Investigation (lower): Relationships, Concepts, Sources, Provenance, History**, with future lenses capability-gated. Pin context freezes the exact inspected identity/revision/occurrence/view; caret movement cannot replace it. Unpin explicitly returns to editor-following context.

Share workspace/document, branch or snapshot, projection/generation, selection/source mapping, trusted actor and permission context across panels. A pinned panel can become stale or inaccessible; pinning grants no continuing access. Investigation navigation preserves recoverable drafts and rechecks authorization. Distinguish a historical snapshot view from current state and retrospective overlays.

Remember validated panel proportions, collapsed states and tab/lens preferences with other non-sensitive display preferences. Persisted pinned identities or query contents require the protected user-state mechanism, not the display cookie. Current human attribution is red, current agent blue; other contributors receive distinct session-stable colors outside those reserved ranges, plus text/role indicators and accessible contrast. Unknown or undisclosed attribution stays explicit.

Retain styled Markdown source, toolbar/Functions controls, source/rendered maths, wrap choices 60/80/100/120, author visibility, font size and proportional minimap viewport. Single click places caret; double selects word, triple sentence, quadruple paragraph, five clicks section. Numbered list items are paragraph units. Define Unicode, punctuation, nested lists, code/table/formula boundaries and keyboard equivalents in executable selection fixtures before implementation; multi-click is a convenience, not the only accessible route. Optional snapping must not silently enlarge a normal partial selection. Selection/promotion must not reflow text or introduce visible separators. Mobile remains future work.

### Adjacent-unit relationship markers

Source `HPX-SRC-0037`, original lines 117–125. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Display a small horizontal double-ended arrow between adjacent sentences for each relationship at that boundary. Between adjacent paragraphs use a larger vertical double-ended arrow. Multiple relationships produce separate individually actionable arrows, not one merged marker or a count badge. After the standard hover delay (1,500 milliseconds), the tooltip names that arrow's relationship. Pointer activation or keyboard Enter/Space opens the exact relationship in the lower Relations tab, reveals it if the panel is collapsed and identifies both participants. Preserve the editor's source selection and retained pins in other investigation lenses. Relations follows the caret independently; explicit inspection lasts until the next caret change.

These are source-neutral visual controls: never insert arrow characters or relationship labels into Markdown, exports or clipboard text. At a sentence boundary with arrows, visually collapse the horizontal separator spaces/tabs beside the arrows so spacing is not duplicated. Preserve source whitespace, selection/copy/export content and structural newlines; restore the normal separator when the last relationship is removed or its marker becomes stale. Double-ended glyphs indicate a connection control; they do not assert a symmetric predicate, erase participant roles or change the relationship's stored direction. A real relationship still requires the typed semantic identity, exact revision/occurrence anchors, policy and publication semantics above.

The frontend demonstration supports top-level prose sentence and paragraph pairs in one document, with multiple named tab-only records. Creation uses the editor context-menu modal; Relations provides inspection, review and removal only. When exactly two complete adjacent units are highlighted, resolve both selection bounds (ignoring outer whitespace), independent of selection direction, and put the marker at their shared boundary. Do not choose a pair from the head caret alone. Partial or more-than-two-unit selections require a corrected selection; collapsed-caret creation retains an explicit participant preview. Sentence segmentation uses Intl.Segmenter on source prose, excluding pairs crossing inline code/maths; paragraph pairs cannot cross headings, tables, code or other intervening blocks. Source edits map anchors; if participant text changes or adjacency is lost, hide the marker and retain a clearly review-needed record. Do not silently attach it to another matching passage. Reload resets these examples; no durable graph identity, merge or backend write is implemented. The categorized context-menu modal also supports exactly two adjacent sibling sections, including descendants; section controls use the larger vertical marker at their shared boundary. See [Relationship interface](<frontend-interaction.md>) for search/custom-term behavior, direction and caret filtering.

### Hierarchical contents and editor following

Source `HPX-SRC-0037`, original lines 126–140. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The left column is titled **EXPLORER**. Workspace lists documents/chapters directly; do not duplicate the workspace/composition name already shown in the editor bar or add placeholder collection rows. Document shows the current document row. Documents and heading sections with children have independent disclosure controls and nested headings. Closing a node hides its descendants without navigating the editor. Draw a vertical guide at the left of each expanded descendant group, spanning its visible section subtree. Use one consistent indentation step (18 CSS pixels in the preview) for every guide/branch level, aligning each guide with its parent disclosure column; skipped heading ranks still nest under the nearest preceding lower-ranked heading.

At the bottom of the left column provide **Follow editor** and a **Close all / Open all** toggle. Follow editor is optional (initially off); when enabled, highlight the heading for the caret's section and, on editor scrolling, the section at the top of the viewport. Reveal the relevant ancestor path and scroll only the left contents area enough to show that row. Preserve keyboard focus, editor selection, source and the other panels. Manual tree scrolling alone must not navigate the editor. Turning follow off leaves the current tree position/highlight under manual control. Store only the validated follow boolean as a display preference, never document IDs/headings or collapse maps.

Close all hides every document’s sections/subsections while leaving the document/chapter rows visible in both Workspace and Document. The same control becomes Open all to restore expanded branches. A close-all action is immediate even with following enabled; following may reveal a relevant path on the next section change or explicit follow/lens action. Individual disclosures remain independently usable. Tree folding and highlights are presentation state, not document structure or graph publication. Keep a small visible vertical gap between neighbouring selected/hovered Explorer row backgrounds so parent and child highlights do not merge. Explorer document/heading text labels do not show tooltips; independent disclosure controls retain delayed names and keyboard accessibility.


Paragraph-end selection boundary: a caret exactly after a paragraph’s final full stop belongs to the preceding paragraph/sentence for drag snapping. A backward drag within its final sentence remains a partial/word selection, rather than snapping to the following paragraph. Normal sentence/paragraph snapping still applies when genuinely crossing those units.


Sidebar spacing: Interaction and Investigation use the same horizontal inset for headings, first tab boundaries and body/card edges (12 CSS pixels in the preview), with consistent tab gaps (4px), typography and button padding. Keep the same geometry when resizing; narrow desktop columns may scroll the tab strip horizontally so controls remain keyboard-accessible. Avoid independent padding overrides for the lower tab strip.

### Sentence-start provenance links

Source `HPX-SRC-0037`, original lines 141–151. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Display individual source-neutral icons at sentence starts for known forks, copies, revisions, transpositions, extraction, split/merge, embeds and references, with both directions distinguishable. Delayed names and keyboard/pointer activation inspect the exact link in Provenance, with navigation only to a resolved valid counterpart. Keep semantic assertions separate from operation-derived provenance. The [sentence provenance contract](<frontend-interaction.md>) defines the icon vocabulary, anchor handling, Navigator parity and current fixture versus operation boundaries.


Relationship categories are overlapping browsing tags over stable definitions. Category membership neither creates a new predicate nor a separate assertion. Negation, uncertainty, attribution and contextual scope are assertion properties; [assertion identity and tags](<../05-domain/assertions-and-predicates.md>) defines current preview behavior and future domain requirements.


Paragraph and section provenance use the same small individual controls in rows above and left of their first source line. Bind them to that paragraph/section’s own provenance records, not inherited sentence links. Preserve exact source and match row spacing in the Navigator; see the [content provenance contract](<frontend-interaction.md>).

### Editor structure guides

Source `HPX-SRC-0037`, original lines 152–154. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Provide vertical guides for paragraph and section/subsection spans in one fixed gutter left of the editor text, using evenly spaced hierarchy lanes and measured wrapping/widget heights. All text levels remain aligned; no structural indentation is inserted. This stage adds the lines only and leaves provenance icons in their current locations. See [editor structure guides](<frontend-interaction.md>).

### Relationship interface

Source `HPX-SRC-0030`, original lines 1–2. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Source title/navigation context retained by this subsection; no additional requirement is inferred.

### Scope and semantics

Source `HPX-SRC-0030`, original lines 3–10. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The desktop fixture editor supports tab-only assertions between two complete adjacent prose sentences, paragraphs, or sibling sections. A section includes its descendant headings/body; parent/child overlaps are not sibling pairs. These records are UI demonstrations, not canonical graph predicates, persistent revisions, verified logical claims or backend writes. Reload resets them. Source order defines source and target, regardless of selection direction. A double-ended marker is a connection control and does not declare symmetry.

The vocabulary has thirteen categories: Ontological, Dialectical/process, Logical/argumentative, Epistemological, Ethical/political, Conceptual/semantic, Genealogical/historical, Methodological/practical, Logical operators, Rhetorical/discourse, Temporal, Source/provenance, and Causal/empirical. The implemented fixture catalogue contains 244 selectable choices. All audit candidates are available as choices or deliberate search aliases; “suffices for” resolves to the existing sufficient-condition choice, “is a subtype of” to is a, and “is an instance of” to instantiates. Existing preview IDs are retained. Display labels use spaces; identifiers remain separate from labels. Category membership is overlapping browsing metadata and does not scope identity. The unique registry owns stable definitions; distinct senses of “undermines” retain separate identities because their meanings differ, not because they are listed under different categories. See [assertion identity and tags](<../05-domain/assertions-and-predicates.md>). “Adapts” means reworking the target; “adapts to” means adjusting to target conditions. “Determines” and “is determined by” differ from evidence underdetermining an account. These distinctions require individual definitions/examples rather than mechanical name substitutions.

Logical operators distinguish classical binary truth functions from semantic consequence, proof-system derivability, inference indicators and ordinary discourse markers. “Not” is unary; if/then/neither/but are available annotation labels and do not acquire invented binary truth tables. Selecting “proves” or “therefore” does not execute a proof. The local catalogue explicitly registers 34 reviewed converse pairs and 19 contextual symmetric choices. Reviewed converse wordings are selectable; an unregistered gloss is not a new predicate. Each choice has a definition, example, source/target roles, context guidance, symmetry assessment, orientation and normalized local predicate ID. Aliases are search routes, not duplicate choices. Do not infer missing converses or automatically generate reverse records. A complete Rust predicate registry and its versioning, authorization and inference rules remain future integration work.

### Creation and search

Source `HPX-SRC-0030`, original lines 11–22. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The Relations tab is for contextual inspection, review and removal; it contains no relationship-creation form. Create relationships through the editor context menu.

Selecting exactly two complete adjacent units enables **Add relations** in the context menu, including its keyboard invocation. Normalize only outer selection whitespace; reject partial, ambiguous and more-than-two-unit selections. Preserve the frozen document/source version and both bounds while the modal is open. Source changes invalidate creation rather than retargeting it.

Centre the small modal over the editor column and reposition it when its dimensions or the viewport change. Put a blank, initially focused search box first, with a small adjacent **Use custom** button. Do not add a separate custom field or explanatory input placeholder. Below it, stack Category then Relationship type dropdowns. Sort category names and relationship choices alphabetically by displayed names, ignoring case; keep blank prompts first. Filtered choices remain alphabetical and are deduplicated across overlapping tags. Search suggestions retain relevance priority, with alphabetical ordering for equal relevance. Neither has a default selection on opening; omit vocabulary-count text. Search names, aliases, symbols, categories, inverse labels and examples, ranking exact names/aliases first. Select automatically only when the complete search result has exactly one unique identity. Show an accessible compact result dropdown for one through nine matches; hide it for zero or ten-plus. Support arrow keys, Enter, Escape and pointer selection without losing the editor selection.

**Use custom** selects the trimmed search text as a local custom term (maximum 80 characters), not as a registered preset. Creation still requires **Add relation**. Editing search clears a previous implicit/custom choice. A category/type must agree before preset creation. Cancel/Escape restores the original selection and focus, guarded against stale contexts or a subsequent user gesture.

Show source excerpt, the selected relationship, then target excerpt. Put supporting text below both excerpts, using matching Definition:, Example: and Inverse label: styles. Provide a collapsed Roles and context disclosure for the entities described by each selected unit, contextual qualifiers and direction; it is guidance, not an automatic type judgment or completed context form. The chosen relationship also appears between source/target excerpts in Relations cards.

### Markers and caret context

Source `HPX-SRC-0030`, original lines 23–31. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Use one small horizontal two-ended arrow per sentence relationship and larger vertical arrows for paragraph/section relationships. Place it at the shared boundary, preserving exact source, whitespace, clipboard/export and undo. Collapse only the visual horizontal separator beside sentence markers. Reflect the same geometry in the Navigator. Delayed tooltips name the relationship; pointer or Enter/Space opens its exact Relations card.

Relations shows only assertions whose source or target contains the current caret: sentence links for the containing sentence, paragraph links for the containing paragraph, and section links for the containing section. Include all applicable levels together. It follows the caret even when another investigation lens retains a pin. Explicit arrow inspection temporarily reveals that record until the next caret change. Each displayed record has its own local review controls; never show unrelated generic assertions. Unrelated source edits map anchors; changed participants or lost adjacency retain review-needed records and hide markers rather than guessing a replacement.

This preview uses draft-local UTF-16 ranges. Canonical revision/occurrence mapping, authorization, registry semantics, encrypted transport and durable command receipts remain backend integration gates. No UI label creates new core mathematical guarantees.

### Local vocabulary contracts and semantic boundaries

Source `HPX-SRC-0030`, original lines 32–43. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

relationship-catalog.js exports the unique immutable relationshipTypes registry, shared relationshipCategories projections, relationshipType(id), relationshipCategory(id), searchRelationshipCatalog(query) and validateRelationshipCatalog(categories). Choices separate scoped preview ID, label, aliases, definition/example, sourceRole/targetRole, contextFields, canonicalId, orientation, inverseId and symmetry. The validator rejects conflicting identities, duplicate membership/meaning, unknown tags, missing descriptive metadata, dangling/nonreciprocal converses, mismatched reversed roles and invalid normalized direction. Search includes definitions after names/categories/examples; exact aliases retain priority.

Preset records retain the selected predicateId and display wording, plus canonicalPredicateId and orientation. canonicalRelationship(record) in relationships.js resolves the normalized local predicate and current mapped source/target ranges: forward wording uses left/right; reverse wording uses right/left. It creates no second edge and never changes source. Custom terms and legacy freeform fixture seeds return no normalized predicate. Identical non-stale typed assertions reuse their existing record regardless of browsing tag; claims with different properties remain distinct. Source mapping/staleness and caret membership continue to use document-order participant ranges.

Concept identity differs from terminology: is a means subtype-of, instantiates means instance-of; denotes links a term/sign to its referent; synonymy is contextual term equivalence; cross-scheme close/exact matching does not establish object identity. Conceptual overlap differs from temporal overlap. Temporal starts/starts with and finishes/finishes with distinguish the smaller interval from the larger; strict precedes differs from touching meets. Correlation, moderation and causal claims require different meanings and context. Philosophical mediation is distinct from statistical mediation; no statistical engine is implemented.

Extra participant roles remain explicit context guidance: adapts for needs adapted material, responds with needs the stimulus, infers needs premises, mediates between needs poles, liberates from needs a beneficiary, redistributes needs parties, and moderates needs predictor/outcome. Two text endpoints can annotate such a claim but do not supply a structured multi-participant fact. Normative relations never grant permissions. Source/provenance labels describe claims about entities/agents/activities and do not modify authenticated attribution, immutable history or revision lineage. No imported ontology's inference rules, provenance guarantees or Lean validation are acquired merely by selecting its related wording.


Assertion negation, uncertainty, attribution and scope belong to each claim, not to categories. The optional Assertion properties disclosure in the modal preserves these qualifiers independently of selected browsing tags and displays them in the participant preview and Relations card. Typed records do not store browsing category as part of their fact; see [the full contract](<../05-domain/assertions-and-predicates.md>).

### Sentence, paragraph and section provenance controls

Source `HPX-SRC-0031`, original lines 1–2. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Source title/navigation context retained by this subsection; no additional requirement is inferred.

### Display contract

Source `HPX-SRC-0031`, original lines 3–24. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Show a small icon at the beginning of each sentence for every known provenance link attached to it. Paragraphs and sections have equivalent icon rows above their first source line, aligned at the left edge. Use their own unit-level links; a descendant sentence link does not establish provenance for the enclosing paragraph or section. Keep distinct links separately actionable, including multiple links of the same kind. Incoming and outgoing controls must be distinguishable by their accessible names and visual direction cue. Do not infer lineage from equal wording or from a semantic relationship whose label resembles a provenance operation.

| Kind | Source-side name | Derived/referencing-side name |
|---|---|---|
| Fork | Has been forked | Is a fork |
| Copy | Has been copied | Is a copy of |
| Revision | Has a later revision | Is a revision of |
| Transposition | Has a transposed occurrence | Is transposed from |
| Extraction | Has extracted content | Is extracted from |
| Split | Has been split | Is split from |
| Merge | Contributes to a merge | Is merged from |
| Embed | Has an embedded occurrence (pinned/live) | Is an embed of (pinned/live) |
| Reference | Is referenced by | References sentence / paragraph / section |

The names describe the direction of the corresponding known link, not an inferred hierarchy of ownership. A fork has independent identity; a revision belongs to same-identity history; a transposition concerns a changed placement/occurrence; copying, extraction and split/merge transformations retain their own provenance semantics. Embeds distinguish pinned and live resolution. An ordinary reference does not make shared content. These distinctions must survive backend integration.

Hovering for 1,500 milliseconds names the link. Each icon is a keyboard-focusable button; pointer or Enter/Space opens the exact link in the Provenance investigation tab and reveals the panel if collapsed. Inspection identifies both unit excerpts, the related document, origin and availability. Offer Go to linked sentence/paragraph/section only when the current counterpart is resolved and its exact anchor remains valid. Keep captured historical information separate from a current navigable endpoint; never silently navigate to a similar passage.

Icons are source-neutral widgets: they add no Markdown characters, selection/clipboard/export text or undo entries. SVG glyphs and visual direction cues must not introduce hidden textual characters into selections. Preserve source caret/selection on icon activation. Mirror the widgets' geometry in the Navigator, where they remain inert. Semantic relationship arrows retain their separate between-unit positions and precede the following sentence’s provenance icons at a shared boundary.

### Current synthetic implementation

Source `HPX-SRC-0031`, original lines 25–35. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

sentence-provenance.js defines nine link kinds, source-sentence segmentation, a per-document sentenceProvenanceField, addSentenceProvenance effects, provenancePair and sentenceProvenanceGroups. Records distinguish link endpoint ID, transformation/event ID, kind/direction, current local anchor, frozen capture coordinates/sequence, counterpart endpoint/document/excerpt and fixture versus tab-operation origin. A shared event can have multiple distinct links, allowing merge parents or split outputs without endpoint-ID collisions.

Exact draft-local UTF-16 sentence anchors map through unrelated changes. Changed text or lost sentence boundaries mark a record review-needed; hide its unreliable start icon while retaining its captured evidence in the tab. Undo does not silently revalidate it. Sentences inside headings, code fences and table cells do not get inferred prose markers. Partial selections or inserted material that does not form a complete sentence cannot fabricate a whole-sentence anchor.

The initial synthetic document includes explicitly labelled illustrative provenance records at all three unit levels for icon exploration. They are demonstration metadata, not authenticated history. Real tab-only Fork actions record complete source sentences, paragraphs and sections and their destination counterparts. Provenance-clipboard fork pastes likewise create endpoint records for captured complete units; merely capturing a clipboard reference creates no derivation event. Stale captured sources can supply historical excerpts but cannot manufacture a current source-side link. Pasting is still the existing fixture operation, not an authoritative transaction.

Copies, committed revisions, transpositions, extraction, split/merge, actual embeds and sentence-reference commands remain backend/future operation integrations; displaying their supplied fixture icons does not implement those commands. Arbitrary typing is not a committed revision. Semantic catalogue assertions do not populate this projection. The displayed projection is reset on reload and creates no durable graph, snapshot, authorization grant or new Lean guarantee. Future real-data projection must be permission scoped and bind exact identity/revision/occurrence anchors and authenticated operation receipts.

### Paragraph and section rows

Source `HPX-SRC-0031`, original lines 36–42. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Records carry unitKind (sentence, paragraph or section), independent of the transformation kind and direction. Sentence labels remain inline. Paragraph/section rows reserve 22px above their source line and reuse the same glyphs, individual actions, 1500 ms tooltip delay and source-neutral selection behavior. No Markdown blank lines are inserted. The Navigator reserves matching space and renders the same row geometry; its controls remain inert.

provenanceUnits(state, unitKind) uses the full Markdown tree. Paragraph units exclude headings, fences and table cells. Section units support ATX and Setext headings, include descendants and end before the next equal/higher-level heading. Each anchor is validated at its own structural level. Edits can invalidate a section while leaving an unchanged paragraph/sentence valid; never copy a child's provenance to its parent or silently heal a changed anchor. Existing sentence-named field/effect/module exports remain internal compatibility names and now carry all three unit kinds.

containedProvenanceUnits captures only complete units for actual fixture Fork and provenance-clipboard fork pastes. Event/endpoint IDs include unit kind so co-located sentence/paragraph/section anchors remain distinct. Long block excerpts are abbreviated for inspection, with exact full anchors retained for navigation. Counterpart navigation resolves the matching endpoint and unit kind, not a matching substring or enclosing unit.

### Editor structure guides

Source `HPX-SRC-0027`, original lines 1–14. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Implement decorative vertical structure guides in a dedicated gutter to the left of all editor text. These are often called indent guides in code editors; here they represent Markdown hierarchy without indenting the source. This stage draws lines only. Provenance icons remain in their existing inline/above-block locations until separately instructed.

Reserve one common-width gutter for the document, sized only to its deepest guide lane: 24px outer inset + 18px per lane + 12px text-side clearance. A document with deepest lane 3 uses 90px; deeper documents expand the common gutter rather than clipping guides. The width is shared across all text levels, not varied per paragraph. Every heading and paragraph keeps the same text-column alignment, independently of depth; do not add per-level source padding, whitespace or indentation. Use evenly spaced 18px guide lanes matching the Explorer for actual section ancestry, then a paragraph lane inside its containing sections. Skipped heading levels do not create phantom ancestors. Section/subsection and paragraph guides use the same one-pixel border colour as the Explorer, without opacity differences, in both themes. Distinguish depth by lane and span, not colour. Remove left content padding and automatic left centring so unnecessary blank space does not separate the guides from the text; retain common text alignment and safe wrapping.

Use the full Markdown tree for top-level ATX/Setext headings and paragraph spans. Quoted or fenced heading-like content does not redefine document sections. Section guides extend through their descendant content and intervening blank lines to their own boundary. Paragraph guides stop at paragraph boundaries and follow both hard source lines and soft wrapping. Do not draw paragraph guides for table cells or fenced code. Preserve section continuity beside rendered table/math replacement blocks.

The gutter is decorative, noninteractive and hidden from assistive reading; it adds no source characters, Markdown, clipboard/export content, undo steps or tooltip targets. Layout follows the editor's measured line/widget heights, including existing provenance row padding. Scrolling, wrap/font changes, document switching and edits must update the projection without stale guides or horizontal overflow. Existing Navigator geometry continues to use the actual text width; no new Navigator control or provenance icon relocation is part of this stage.

The fixture implementation uses structure-guides.js: a cached structureGuideModel over source text, structureGuideSegments for source lines/replacement blocks, and the editorStructureGuides CodeMirror gutter extension. These are browser display structures, not Rust core identities or graph invariants. Validate hierarchy and boundaries with pure fixtures, and verify real gutter width, uniform text alignment, lane spacing, wrapped/scrolling continuity and exact clipboard/export through browser interaction.


Replacement block widgets must include their visual spacing in their measured outer box. Do not put vertical margins on table/math widget roots: native editor height measurements exclude those margins and can accumulate gutter/caret offsets below the widget. The table adapter uses an outer table-block-layout with 18px top/bottom padding and an inner zero-margin card. Navigator projection uses that same measured outer wrapper. Verify exact gutter-row/source-line positions below replacements after scrolling, render/source toggles, wrapping and font changes; a correct top-of-document view alone is insufficient evidence.

### Spell checking — medium-term priority

Source `HPX-SRC-0033`, original lines 1–9. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Planned; not implemented. Provide spell checking for prose in the desktop editor, with visible misspelling marks, suggestions, ignore/add-to-dictionary actions, language selection and an enable/disable control. Correction must be an explicit undoable edit at an exact current source range, preserving Markdown syntax, surrounding text and attribution semantics.

Exclude Markdown control syntax, code, URLs/link targets, citation keys and mathematical notation from prose checking. Establish fixtures for Unicode, contractions, proper names, multilingual passages and common academic vocabulary. User dictionary ownership, language variants and persistence need an explicit design before release; do not assume the operating system/browser supplies a consistent dictionary.

Use a local checking/dictionary path as the baseline. Do not transmit manuscript text to a third-party checking service or store sensitive prose in plaintext diagnostics/caches. Respect trusted-server/client-held execution and core egress policy. Review dictionary/engine licenses, packaging, bundle size and performance before choosing dependencies; distribute release assets through the single-Rust-executable packaging path.

Acceptance must cover real editor marking/suggestions, exact corrections and undo/redo, disabled mode, protected syntax, language/dictionary behavior, stale or delayed results after edits/document switches, accessibility and no unauthorized text disclosure. The synthetic editor currently sets browser spellcheck to false and implements no spelling engine; this requirement does not claim otherwise.


## Source provenance

- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 27–46; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 174–187; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 200–209; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 297–305; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 316–320; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 321–323; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 11–27; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 117–125; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 126–140; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 141–151; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 152–154; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0030` — `Specifications/RELATIONSHIP_UI.md`, lines 1–2; SHA-256 `bc21bc77787d76a46dd0781fd7015c0df4e1e6957cce31e83469414f23658fc8`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0030` — `Specifications/RELATIONSHIP_UI.md`, lines 3–10; SHA-256 `bc21bc77787d76a46dd0781fd7015c0df4e1e6957cce31e83469414f23658fc8`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0030` — `Specifications/RELATIONSHIP_UI.md`, lines 11–22; SHA-256 `bc21bc77787d76a46dd0781fd7015c0df4e1e6957cce31e83469414f23658fc8`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0030` — `Specifications/RELATIONSHIP_UI.md`, lines 23–31; SHA-256 `bc21bc77787d76a46dd0781fd7015c0df4e1e6957cce31e83469414f23658fc8`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0030` — `Specifications/RELATIONSHIP_UI.md`, lines 32–43; SHA-256 `bc21bc77787d76a46dd0781fd7015c0df4e1e6957cce31e83469414f23658fc8`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0031` — `Specifications/SENTENCE_PROVENANCE.md`, lines 1–2; SHA-256 `717a143f1d4affbbc6ac8aea5f1ce27d8df14609419516509705218f4c66c133`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0031` — `Specifications/SENTENCE_PROVENANCE.md`, lines 3–24; SHA-256 `717a143f1d4affbbc6ac8aea5f1ce27d8df14609419516509705218f4c66c133`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0031` — `Specifications/SENTENCE_PROVENANCE.md`, lines 25–35; SHA-256 `717a143f1d4affbbc6ac8aea5f1ce27d8df14609419516509705218f4c66c133`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0031` — `Specifications/SENTENCE_PROVENANCE.md`, lines 36–42; SHA-256 `717a143f1d4affbbc6ac8aea5f1ce27d8df14609419516509705218f4c66c133`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0027` — `Specifications/EDITOR_STRUCTURE_GUIDES.md`, lines 1–14; SHA-256 `6e725b35aa4d7ecf35a61d9c753a2a060dbb96f518b07a94b8f233a341ab94db`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0033` — `Specifications/SPELL_CHECKING.md`, lines 1–9; SHA-256 `d84fe838b40e136d3a16859a71c82caf430cfcddd3a0ad9110147be198d7c1ab`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.


## Owner-directed action set and branding, 2026-10-25

**Owner addition, 2026-10-25:** the required Functions action set is **Fork, Link, Embed, Merge and Copy**. Present Merge and Copy alongside the existing names with clear eligibility/availability and accessible labels. Use the [single action definition in the document engine](document-engine.md#owner-directed-action-set-fork-link-embed-merge-and-copy): Merge reviews exact inputs and preserves their histories/provenance; Copy captures content/references to the explicitly identified clipboard without silently creating a fork or committing a draft. Preview and cancellation preserve source, selection and undo. Authoritative command integration remains separately gated; a labelled control or demonstration does not claim durable implementation.

Use the owner-supplied [system logo](../assets/logo.png) in application and documentation branding. Keep the canonical PNG unchanged, preserve aspect ratio, ensure it remains legible in both themes and accompany decorative instances with an accessible system name. Build/embed the asset into the single executable and serve it as PNG; branding must not introduce remote asset requests or disclose manuscript data.

## Owner-approved logical-equivalence search and graph view, 2026-10-25

Expose “logically equivalent” as a search route to the existing contextual equivalence relation; retain its stable identity and distinguish an assertion from a checked proof. Do not duplicate the predicate or equate its participants. See [domain meaning](../05-domain/assertions-and-predicates.md#owner-approved-logical-equivalence-clarification-2026-10-25).

The Graph view lets the user choose any authorised nodes and displays labelled circles and labelled relationship lines. Preserve direction and n-ary participant roles, show the view's scope/completeness and distinguish asserted claims, recorded derivation and checked evidence. Provide accessible text/keyboard inspection alongside the visual labels; colour alone cannot communicate identity or verification state. Opening, changing or closing the graph preserves editor source, selection and undo. A bounded initial projection must label its supported subset and unavailable relationship families. The [graph-engine contract](graph-engine.md#owner-approved-selected-node-graph-view-2026-10-25) owns the adopted semantics; no durable query implementation follows solely from this requirement.

## Initial durable graph and creation recovery evidence

The runtime Graph entry now offers arbitrary selection of up to 16 authorised document nodes, labelled circles and recorded historical Fork connectors, with direction and keyboard/text inspection. It explicitly excludes unavailable semantic relationship families and out-of-selection connections; exact source inspection resolves pinned history, not the current document text. The first projection does not implement arbitrary semantic/n-ary graph delivery. See [bounded query contract](interfaces/browser-runtime.md#bounded-documentfork-graph-projection) and [executed graph evidence](../registers/tests.csv).

Creating a new runtime document registers/opens its editor without replacing the page. A retained operation can be reconciled through “Retry new document” after unknown command replies or failed editor reads, preserving newer source typing and other cached buffers. This is separate from explicit Lock, whose acknowledged completion still replaces the page with the unlock view. The current scope remains one-owner document editing; it does not promise tab-reload recovery of arbitrary unacknowledged typing.

## First durable semantic overlay

The runtime now supports explicit relationship proposals and retained reviews under accepted ADR010. Whole eligible committed text selections open the existing relationship chooser with exact raw-source previews; the request freezes canonical predicate choice, properties and immutable participant bindings. The Relationships pane labels the result retrospective, keeps accepted/rejected/superseded judgements separate from proof, and offers exact source inspection. Matching caret filtering requires the same closed snapshot and exact owned source; changed text hides automatic applicability instead of guessing new anchors. An explicit retained view exposes old claims without adding them to old text snapshots. The existing graph still shows document/Fork incidence only. See [wire/limit contract](interfaces/browser-runtime.md#versioned-retrospective-semantic-assertions).

## Planned branch-parent Merge interface

The owner clarified on 2026-10-26 that the intended Merge action integrates the current document text into a parent branch. Introduce this workflow during [branch/compare/selected integration](../02-governance/roadmap.md#planned-branch-parent-merge-workflow--owner-clarification-2026-10-26), after functional branch selection and recoverable branch-specific drafts. Make the current source branch, intended parent destination, comparison/conflicts and reviewed result clear before publication. Preserve drafts and history; do not silently substitute creation of an independent synthesis document. The current synthesis operation remains distinct. Exact controls/wording and handling of uncommitted text remain future design work. No immediate UI or implementation change is requested.

## Initial live Users publication-evidence scope

The first runtime Users connection is an explicitly incomplete text-publication projection, not the full contributor index described above. It resolves the authenticated current human from protected workspace metadata and shows No current agent because the current runtime has no assigned-agent context. Publisher facts derive from retained immutable document events for an exact committed snapshot and its ancestors. Opening the tab, connection state and provider configuration create no contributor evidence.

Deduplicate by principal identity across bounded pages and retain session-stable colours. Current human context remains pinned without implying original text authorship; the role shown for actual evidence is recorded publisher. Older publications remain available even after their content changes. A historical query excludes newer heads. Semantic reviews, comments, interactions and original authorship remain explicitly unindexed, so text-history completion cannot be labelled complete contributor coverage. See the [runtime contract](interfaces/browser-runtime.md#snapshot-bound-publication-contributors). This slice does not enable shared editing or any provider.

## First durable committed-passage comments

The owner adopted HPX-ADR-017's bounded first comment scope on 2026-10-26. The durable Comments tab uses reviewed protected captures from the current document, an exact owned-source comment editor, explicit publication/retry, bounded retained-comment pages and exact historical passage inspection. Every comment is labelled retrospective; editing the document does not relocate its anchor or insert it into an earlier text snapshot. Publication creates no text transaction, draft save, clipboard removal or original-authorship assertion. See the runtime contract and record reference for exact bounds/compatibility. Draft comments, replies, editing, resolution and shared-user behavior remain future work, with no enabled placeholder controls.

## Runtime contributor badge implementation boundary

The runtime palette keeps the current human's existing red and reserves red/blue hue bands when assigning other principal colours. Assignments remain session-only, numerically distinct and stable across later pages; explicit labels, roles and expandable full IDs retain identity independently of colour. Runtime badge initials use white against bounded-luminance backgrounds, checked for at least4.5:1 contrast. This corrects the earlier exact-hex-only exclusion and inherited theme foreground. It adds no assigned agent, source-author inference, persistent hue map or contributor family. Synthetic multi-principal views are visual evidence only; current runtime authority remains the sole-owner model.

## Working-branch design in progress

At the owner's request, [ADR019](../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) designs automatic private checkpoints for provenance-bearing copy/paste, while keeping explicit Commit. UI must distinguish acknowledged working text, retained working-source evidence, published source and any pending/reviewed replacement. Switching preserves branch-specific source/selection/undo and freezes command context; copy must not force publication or silently retarget existing provenance. This is design scope, not a current frontend capability.

## Local gated wiring checkpoint and owner stop

Branch review/selection and retained working-reference inspection are now component-tested at1280/1600/2000 in both themes; all six branch views and two working-source inspection views were visually inspected. Component tests cover cancellation, reviewed snapshot context and inert exact source. Mock adapter tests cover frozen branch retries, newer typing during delayed save, branch isolation and opaque history scope. Existing owned-buffer copy/paste/undo/lock and historical-dialog cancellation checks pass. The real CodeMirror branch-switch/restart/Fork/promotion workflow and below-widget integration visuals remain pending. The server does not advertise local_branches/working_copy, so this wiring is not enabled for the current runtime. The owner asked to stop after the current step; implementation is stopped after these checks and handoff.

## Heading Link selection eligibility

HPX-OWNER-016 requires selected text, not a caret-only insertion. Enable Link only for a nonempty selection with a heading target in the current editable document. Permit partial-word/punctuation/Unicode selections. Capture the exact owned range and branch buffer; preserve selection on cancel and treat insertion as one undoable draft edit, with no keyboard-focus Commit. The heading picker supports LF/CRLF/CR sources, retaining exact source offsets and duplicate anchors. [Document-engine contract](document-engine.md#selected-text-heading-links-owner-clarification-2026-10-27) owns the exact scope; HPX-TEST-065 records verification.

## Current in-text semantic relation labels — HPX-OWNER-017

The owner replaces the earlier adjacent-unit arrow glyphs with explicit brace-enclosed relation words: `{determines}{justifies}` between sentences; corresponding individual controls centered in the gap between paragraphs (and existing sibling-section boundaries). Each relation remains separately selectable with pointer/keyboard inspection in Relations; role/direction and review meaning are retained rather than inferred from the glyph. Labels are self-labelled controls and do not need redundant hover tooltips. They are editor/Navigator decorations, never Markdown, clipboard or exported source characters. Preserve original separator bytes while avoiding duplicated visible spacing; show no guessed controls for stale or unresolved anchors.

The next runtime increment projects only loaded proposed/accepted binary assertions whose two exact participant document/node/revision/snapshot/occurrence/UTF8 ranges match the current complete committed owned buffer and one eligible adjacent sentence/paragraph/section pair. Retrospective overlay meaning remains explicit; rejected/superseded claims remain inspectable in retained views. Nonadjacent/cross-document/n-ary/old-source claims remain in Relations without fabricated adjacent controls. Display loaded-count/continuation scope; a bounded partial page is not absence of other relations. Protected source/page replies must be discarded after changed buffer/branch/head/lock or obsolete requests. No source write, persistent format upgrade or automatic Commit follows from projection/inspection.


## Owner-prioritized readable Markdown, 2026-10-27

HPX-OWNER-018 requires visible bold and italic styles, rendered link labels instead of destination syntax, and distinct sizes for all six parsed heading levels. Keep source text exact; CodeMirror presentation decorations and the Navigator must share the same parsed ranges/styles and hidden link syntax. Literal code/math must not acquire accidental Markdown emphasis/link interpretation. Escaped bracket labels in actual Markdown links are literal link text, not standalone maths delimiters. Link activation accepts heading fragments and safe explicit HTTP/HTTPS/mailto schemes; untrusted HTML stays inert and external anchors retain noopener/noreferrer. Heading links navigate only inside the current document and must not create history. Source mode exposes hidden link syntax for editing and suppresses link navigation; changing presentation creates no draft/Commit/Undo entry. Existing neutral grey syntax markers remain available outside hidden link ranges.

The current partial working-tree implementation uses full-tree presentation metadata, inline marks, source-neutral atomic replacement ranges, an optional Markdown source checkbox and descending H1–H6 typography. It is not manually delivered yet: the owner stopped work before final link-selection review and actual HTTPS/SQLite integration/guarded handoff. HPX-TEST-071 records only checks actually executed. UI work remains the first continuation priority on explicit resumption.

### Retained inclusion state and newer-version indication — HPX-RQ-040

The [canonical editor notes](../../architecture/C3/browser-organisation.c4) and [M1](../../architecture/Conceptual/identity-closure.c4) require retained A to show its retained selected B versions from the last successful acknowledged autosave, including nested/repeated contexts. Indicate an available newer authorised version separately, without editing source, retargeting selections, revealing inaccessible identities/counts or creating/clearing a shared conflict marker. OWNER043/044's Ask/Automatic Commit-conflict selection rules keep their own scope. The hint's comparison rule and exact UI mapping remain undesigned; no global newest timestamp or background update is selected. OWNER050 reopens universal future autosave/Commit separation while forbidding historical-version accumulation merely from routine autosaves; no current draft publication or departure-Commit revocation follows.

HPX-RQ-041 additionally requires the option to preserve an authorised constructed current-document version as a specific branch, retaining exact composition and logical identity. This is not a claim of branchless ordinary editing or existing single-node branch-creation delivery of arbitrary composition capture. [The reconciliation](../../architecture/proposals/branch-selection-reconciliation.md) retains the precise unresolved capture/main questions. No control or storage mechanism is implemented by this specification change.
