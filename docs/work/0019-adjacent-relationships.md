# Adjacent sentence and paragraph relationship markers

Milestone 0.6.0, issue 19. Frontend-only synthetic behavior, not graph publication.

## Implementation and boundaries

relationships.js owns the CodeMirror StateField of named records with distinct tab-local IDs, unit kind, exact UTF-16 participant ranges/text, marker position and stale flag. Eligibility comes from the full Markdown tree: top-level prose paragraph pairs with whitespace-only gaps; Intl.Segmenter sentence pairs excluding protected code/maths. No heading/table/code crossing or text-search reattachment. Unrelated source edits map positions; changed text/lost adjacency retains a review-needed record and hides its marker. Undo does not silently certify a previously invalidated anchor. Local forks do not inherit invented relationship records.

relationship-markers.js renders original SVG horizontal/vertical double-ended controls, one per record. Glyph direction does not establish predicate symmetry. The Relations form creates/removes multiple named local examples. Activation expands Relations and focuses the exact card with both participant excerpts, preserving source selection and the retained pin. The Navigator shares marker DOM factories and invalidates its layout cache when relationship state changes. Unload warnings include relationship-only changes; localStorage contains display preferences only. Reload discards local relationships.

No canonical semantic predicate registry, occurrence/snapshot anchor, authenticated contributor, durable revision or Rust endpoint is introduced. Section markers/creation require subsequent design. Main fixture includes two sentence relationships at one boundary and one paragraph relationship so the visuals can be evaluated immediately.

## Verification

22 Node tests and 29 sequential Chromium scenarios passed. New checks cover eligible adjacency/protected contexts, distinct multiple records, exact source preservation, unrelated Unicode edits, invalidated anchors, delayed named tooltip, keyboard/pointer inspection, collapsed panel expansion, chapter state, multiple paragraph links, preserved pins and reload. Existing source editing/undo, export, inert markup, selection, Navigator geometry and privacy checks passed.

DOM inspection resolved an inert-markup test false positive: CodeMirror inserts empty hidden img.cm-widgetBuffer cursor buffers next to inline widgets. The test rejects real document images/scripts and verifies these buffers have no src or event handlers. Overlapping test runs initially corrupted Playwright artifacts; final suites ran sequentially against the same output directory.

Static build, screenshot capture, locked cargo check and whitespace checks passed. Current relationship screenshot and regenerated README image visually inspected. No external dependency changes or Rust/proof source changes; no new Lean result is claimed. Hosted publication evidence belongs in issue 19 after observation.
