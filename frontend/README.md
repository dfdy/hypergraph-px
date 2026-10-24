# Frontend preview

Status: runnable frontend-only synthetic-data preview, version 0.5.1. Owner explicitly resumed development and waived authentication for this test runtime. No Rust HTTP API, login, graph publication or encrypted persistence is implemented. This preview opens directly; that does not alter future backend authentication requirements.

## Run locally

Use Node.js 26/npm. From this directory:

```sh
npm ci --ignore-scripts
npm run dev
```

Open **http://127.0.0.1:5173/**. The server binds loopback, serves only generated `dist/` assets, rejects unexpected Host/mutation requests and uses a restrictive CSP with no network connections. Set `HYPERGRAPH_PREVIEW_PORT` to another unprivileged port if needed. `npm run build` regenerates static assets; refresh the browser after rebuilds. Stop the terminal process with Ctrl+C. No authentication, provider account, manuscript or Rust service is needed.

Both a human browser and agent Chromium automation can use the same local URL. Each tab has separate fixture state; agent tests do not observe the human tab's unsaved edits. Reload resets text, clipboard, comments and review examples. Only validated non-sensitive display preferences persist, including Navigator visibility/position, column widths, red caret and drag snapping. Before reload/close, the app warns if tab data changed. Download the current buffer using **↓ Markdown** at the bottom of the left workspace column for an exact temporary uncommitted Markdown copy.

## Available interactions

- Six synthetic chapters with independent tab-local editor/undo state, Workspace/Document navigation, independent chapter disclosure arrows, stable full-document, source-mapped Navigator with wheel/click/drag/keyboard, hide/show and left/right placement controls and chapter previous/next.
- Neutral grey Markdown syntax markers, preserving prose colours and literal punctuation in code/maths in both themes and Authors mode.
- Context-aware Paragraph/H1–H4, Bold/Italic/Quote/Bulleted/Numbered controls, multi-click source units, table cell editing/undo, exact source/rendered maths, wrap/font/theme/authorship controls and a persistent Red caret toggle in the bottom settings bar (enabled by default).
- Split scrollable/resizable/collapsible right panels: upper Agent/Comments/Users and lower Concepts/Relations/Sources/Provenance/History. Pin an investigation context while continuing elsewhere.
- Synthetic contributors with current human/agent pinned and distinct colors; no presence/authentication inference.
- Footer character count followed by labelled **Document** and **Workspace** word counts, with numeric word totals bold. Workspace counts each independent fixture document once, including local forks, excluding duplicate placements/clipboard entries. Words are Unicode word-like segments of Markdown source; numerals/code/formula words can contribute, while standalone punctuation/emoji do not. Counts update with editing, undo and chapter switching.
- Drag workspace/sidebar column separators, or use their keyboard controls; Navigator width stays fixed. PX matches Hypergraph’s font size.
- Default-on **Drag snapping** checkbox in the bottom settings bar enables sentence/paragraph snapping; repeated clicks independently select caret, word, sentence, paragraph, section. Keyboard and modified selections retain precise source ranges.
- Semantic visual spacing between adjacent blocks preserves exact source and Markdown’s blank-line paragraph rule. A soft source newline stays within its paragraph; no extra blank lines are inserted. Navigator tables/maths remain rendered consistently while the editor virtualizes.
- **Local Functions bar:** Fork opens an independent tab-only test document from a whole sentence/paragraph/section, retaining captured source attribution; it stays outside the dissertation composition. Link inserts an undoable plain Markdown heading link. Embed offers source/section/policy preview; actual shared insertion is disabled pending backend source/composition services. These are frontend demonstrations, not canonical graph records.
- Local test comments, selection capture, clipboard removal, repeated simulated fork paste and clear, local simulation log, and accept/reject example assertion states per chapter.
- Five-second-idle simulated checkpoint acknowledgement; always labelled tab-only, with delayed-ack reconciliation tested in the pure fixture adapter.

Graph/History/Sources/Agent panels identify their missing services. Transclusion, actual fork identities/ancestry, persistent source promotion, durable clipboard/commit/recovery, real contributor evidence, Zotero, provider calls, coediting and federation remain unavailable. A pasted fixture string is independent text, not a published canonical fork. Comments report stale local source context rather than silently reanchoring. Preview fixture colors/IDs are not authenticated principals.

Individual controls (not editor surfaces or large panel containers) show named tooltips after a 3.1-second hover; accessible names also support keyboard/screen-reader operation.

## Structure and provenance

`src/adapter.js` owns synthetic document sequences, delayed checkpoint simulation and exact captured clipboard inputs. `src/fixtures.js` contains original synthetic content. `src/app.js` coordinates browser/editor/view state; UI modules do not call invented backend routes. Source helpers and table/math widgets were selectively adapted from the uploaded owner-provided interface study, with source digests in [SOURCE_PROVENANCE.json](SOURCE_PROVENANCE.json). The raw [inbox](incoming/README.md) remains ignored and unchanged. Neither its manuscript, private fixture, built bundle nor provider modules were adopted.

CodeMirror 6 and KaTeX are pinned in the lockfile. Original code is AGPL-3.0-only; resolved dependency versions/integrities/licenses are recorded in [legal/FRONTEND_DEPENDENCIES.json](../legal/FRONTEND_DEPENDENCIES.json). Builds include root LICENSE and installed third-party license texts in `dist/THIRD_PARTY_NOTICES.txt`. Generated assets and traces stay out of Git. Release static assets are suitable inputs for eventual Rust embedding; actual embedding/parity is not implemented here.

## Tests and visual inspection

```sh
npm test
npx playwright install chromium
npm run test:ui
```

The browser suite starts the preview server if needed, or reuses the local port. It covers real editing/undo/download, chapter context, source-preserving maths/table edits, contributors, minimap/panel keyboard interaction, clipboard actions, pinned context, local comments/review, inert markup and static-server boundaries. Screenshots go to ignored `artifacts/ui/`; failure traces stay in ignored `frontend/test-results/`. Do not use real private documents in test traces. A cached browser is optional; install the matching Playwright Chromium revision when absent. These frontend checks cannot prove Rust authorization, durable storage, encryption or graph correctness.

Canonical behavior: [frontend integration](../Specifications/FRONTEND_INTEGRATION.md) and [workspace interface](../Specifications/WORKSPACE_INTERFACE.md). Work/evidence: [issue 11 work record](../docs/work/0011-frontend-preview.md).
