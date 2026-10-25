# Local categorized relationship UI and vocabulary audit

Date: 2026-10-25. Branch main; published version remains 0.6.0. Owner publication hold remains active. No GitHub issues/comments, commit, push, release or version increment in this batch.

## Scope

Added relationship-catalog.js and relationship-dialog.js; integrated with app.js, relationships.js and source-neutral editor/Navigator widgets. Right-click/keyboard Add relations accepts exactly two adjacent complete sentences, paragraphs or sibling sections. Search starts blank/focused with no initial choice; one match selects automatically, 1–9 matches offer keyboard/pointer suggestions. Category/type dropdowns, same-input Use custom, participant/relationship previews and editor-centred responsive positioning preserve source context. Definitions/examples/inverses follow participants. Stale contexts cannot create records.

Relations follows caret membership across sentence/paragraph/section endpoints, independently of general pins; arrow inspection overrides until next caret move. Local reviews now apply to actual document/record identity, not a generic unanchored demo card. Existing freeform local creation/removal remains available. No Rust/backend graph integration, persistence, authentication or logical proof engine was added.

Owner-requested vocabulary audit retained 104 initial thematic entries, split ordinary logical marker words and added the ninth operator category. Four gap corrections bring the catalogue to 129 scoped choices: determines, is determined by, underdetermines and adapts to. Existing adapts is explicitly defined as modifying the target; adapts to is adjusting oneself to target conditions. The report distinguishes selectable presets, inverse metadata, aliases, different roles and research proposals. See [audit](../research/RELATIONSHIP_VOCABULARY_AUDIT.md) and its complete current inventory.

## Resolved pitfalls

- Native dialog close/focus settling could erase a reverse selection after synchronous restoration. Restore once after layout, with a freshness check and cancellation on a new pointer/keyboard gesture. Inspect the created record after that restoration so selection transactions do not immediately clear it.
- Blank separator gaps belonged to the following paragraph/heading, so snapped selection ran past the pointer. Keep the gap with the preceding unit until the pointer actually enters the next.
- A new drag inside selected text could trigger native drag/drop instead of a new range. In ordinary snap-mode pointer selection, collapse the old range at the gesture origin before CodeMirror starts tracking; leave disabled snapping and modified gestures alone.
- Explorer caret-follow context could be overwritten by the programmatic scroll that reveals the caret. Distinguish caret-follow from user scroll/scrollbar/Navigator navigation, retaining the caret heading during reveal.
- Relationship labels containing underscores were implementation identifiers leaking into the menu. Derive ordinary display labels separately and preserve scoped IDs. Avoid merging different undermines senses merely because their labels match.
- Inverse glosses are not additional selectable options or proven equivalences. Never manufacture canonical symmetric/reverse graph facts from a double-ended UI arrow.

## Executed evidence

- npm --prefix frontend test: 35 tests passed.
- npm --prefix frontend run build: passed, rebuilt live static preview.
- npm --prefix frontend run test:ui: all 46 sequential Chromium scenarios passed (52.6 seconds).
- The corrected Explorer-follow scenario also passed three consecutive targeted runs before the final full suite.
- Modal screenshot artifacts/ui/relationship-modal-editor-centred.png visually inspected: centred over the editor, participant connector between excerpts, details beneath, blank search. Other scenarios cover creation, cancellation, custom terms, all nine category counts, caret filtering, selection gestures, Navigator geometry, export/undo and inert markup.

No dependency or proof-source changes. No new Lean claim. Preview remains http://127.0.0.1:5173/ with synthetic tab-only data; reload to use the rebuilt version. Research candidates beyond the four corrections are documented, not silently enabled. Canonical requirements: Specifications/RELATIONSHIP_UI.md.
