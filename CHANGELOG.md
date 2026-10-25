# Changelog

Project versions follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html); see Specifications/SPECIFICATION.md §8 for the initial-development convention and push policy.

## 0.7.0 — 2026-10-25

- Refresh the README screenshot from the latest synthetic frontend preview.
- Read table-wrapper/card geometry atomically in browser regression checks so scrolling between measurements cannot produce a false alignment failure.

- Fix guide/caret height drift after rendered tables by placing vertical spacing inside the measured widget wrapper; update Navigator projection and regress alignment below table/maths through rendering, font and wrap changes.

- Match editor guides to Explorer spacing/colour in both themes; increase the outer inset and fit the common gutter to document depth while removing excess text-side padding and centring.

- Add non-indenting editor structure guides for sections/subsections and paragraphs in a fixed left gutter, using actual wrapping/widget heights and preserving existing provenance icon locations.

- Add provenance icon rows above and left of paragraphs and sections, using independent unit-level anchors, exact counterpart navigation and Navigator geometry; extend tab-only forks and fork pastes to complete block units.

- Change the shared tooltip delay to 1500 ms, retaining exclusions for self-labelled text controls.

- Treat relationship categories as overlapping browsing tags over one stable-definition registry; deduplicate search/selection and reuse identical typed assertions across tags.
- Add assertion-level negation, certainty, attribution and scope, with optional creation controls and contextual display; preserve source and canonical predicate direction.
- Remove redundant tooltips from self-labelled text controls; retain delayed explanations for icons and formatting abbreviations.
- Record local spell checking as a medium-term requirement, including language/dictionaries, exact undoable corrections and protected syntax/privacy boundaries.

- Alphabetize relationship category and item dropdowns by display name; retain search relevance and alphabetize equal-score suggestions.

- Add source-neutral sentence-start provenance icons with distinct link kinds/directions, delayed names, exact-link inspection and counterpart navigation. Mirror their geometry in the Navigator and track complete-sentence links for tab-only Fork and provenance-clipboard fork paste operations; label synthetic examples and retain invalidated anchors for review.

- Implement the full relationship vocabulary audit: 244 choices across 13 categories, including discourse, temporal, source/provenance and causal/empirical families; make missing directions selectable and reuse aliases instead of duplicating choices.
- Add per-choice definitions, examples, roles/context and symmetry assessments, validated reciprocal inverse metadata and normalized local participant orientation; show Roles and context in the picker and Relations cards. These remain tab-only annotations, not Rust graph/inference or authenticated provenance operations.

- Remove the relationship-creation form from Relations; retain creation through the editor context-menu modal.

- Add categorized context-menu relationship creation for adjacent sentences, paragraphs and sibling sections, with search, unique-match selection, compact suggestions and single-field custom terms; display the relationship between participants.
- Follow the caret in Relations, combining applicable sentence/paragraph/section assertions; scope local review controls to actual records.
- Use ordinary relationship labels and separate logical marker words; distinguish adapts/adapts to, determines/is determined by and underdetermines/is underdetermined by. Record a category-wide vocabulary audit and proposals separately from implemented presets.
- Fix snapped dragging in separator whitespace and when starting inside an existing selection; prevent caret-reveal scrolling from overriding Explorer follow context.

- Align Interaction/Investigation headings, tabs and body edges on a shared 12px inset, with consistent tab styling/gaps and accessible overflow when narrowed.

- Separate adjacent Explorer highlights with small vertical gaps and omit redundant tooltips on document/heading labels, retaining disclosure-control tooltips.

- Add EXPLORER title, list documents directly without the duplicate workspace root, retain document rows on Close all, and align all guide levels on one 18px step.
- Place Relations before Concepts and select it initially.
- Fix backward word selection from a paragraph’s exact end; collapse only the visual separator beside sentence arrows without changing source.

- Add nested contents disclosures and section guides, plus bottom Follow editor and Close all / Open all controls in Workspace/Document trees.

- Remove the left-column Research Workspace heading row and its symbol.

- Remove line/column coordinates and character count from the status bar; keep bold Document/Workspace word totals.

- Move Markdown download to the right of the document bar, replacing the demo branch label.

- Match a highlighted pair of complete adjacent sentences/paragraphs using both selection bounds, independent of drag direction; place its marker at their shared boundary. Reject partial/ambiguous selections instead of guessing from the head caret.

## 0.6.0 — 2026-10-25

- Show one source-neutral horizontal sentence arrow or larger vertical paragraph arrow per adjacent-unit relationship; delayed tooltips name each relationship and activation opens its exact Relations entry.
- Add tab-only multiple relationship creation/removal, per-document state and exact-range mapping with review-needed invalidation. Preserve pinned context, Markdown source and Navigator layout; no canonical graph/backend writes.

## 0.5.4 — 2026-10-25

- Prioritize authenticated encrypted browser/runtime communication, including loopback, before real-data integration. Specify HTTPS/WSS, secure bootstrap and certificate trust/lifecycle decisions independently of storage/client-held encryption. Requirements only; no runtime TLS implementation.

## 0.5.3 — 2026-10-25

- Refresh the README desktop screenshot from the current synthetic preview and clarify its fixture-only caption.
- Add a repeatable screenshot command using a fresh browser context and dedicated loopback preview, preserving the human testing session.

## 0.5.2 — 2026-10-25

- Begin each independent snapping-test gesture with a collapsed caret and freshly measured coordinates. Avoid Chromium treating a drag inside the previous selection as native selected-text drag/drop. Preserve exact source and forward/backward assertions; no runtime change.

## 0.5.1 — 2026-10-24

- Wait for the actual DOM selection to settle when checking drag snapping in Chromium, retaining exact forward/backward expected ranges. Prevent CI from reading the previous gesture before CodeMirror paints the selection. No runtime/dependency/proof changes.

## 0.5.0 — 2026-10-24

- Specify future Word tracked-change/comment import matched to branches or snapshots, attributed to the virtual Word Revision contributor.

- Match vertical column resize dividers to the right-panel horizontal divider: dark track, paired borders and centered muted grip.

- Correct parsed block-style indicators; place bold Document/Workspace word totals after characters, match PX brand size and move Markdown download to the left footer.
- Add draggable/keyboard column resizing with fixed Navigator width, and source-preserving semantic spacing under unchanged Markdown paragraph rules.
- Replace viewport-dependent Navigator rendering with stable full-source table/math presentation and source-based viewport mapping.
- Add default-on Drag snapping toggle and independent caret/word/sentence/paragraph/section repeated-click selection; resolve stale modal-close selection restoration.
- Specify future core disclosure denial in client-held/non-trusted mode, including exports and GitHub publication; no backend implementation or new proof claim.

- Mute Markdown source syntax markers in grey across themes and Authors mode, preserving content, code/math literals and exact source.

- Add default-on red caret with a persistent bottom-bar toggle, theme-appropriate reds and a more visible drawn cursor.

- Add explicit Fork, Link and Embed controls: independent tab-only fixture forks with source attribution, undoable Markdown heading links and gated shared-inclusion previews.
- Preserve exact selection on dialog cancellation and show delayed tooltips inside modal dialogs.
- Correct accidental external cpufeatures version replacement in the local Cargo.lock; retain the previously pinned dependency version/checksum.

## 0.4.0 — 2026-10-24

- Show live document word count immediately before character count in the bottom status bar, with the numeric word count bold.
- Count Unicode word-like segments in the current Markdown source, caching by immutable editor document so caret moves do not rescan text. Preserve existing line/column and UTF-16 character counts.
- Verify typing, Unicode input, chapter switching, counter order and bold styling in Chromium. No backend/dependency/proof source changes.

## 0.3.1 — 2026-10-24

- Group bullet and numbered list buttons directly together; use original SVG icons showing three bullets and 1/2/3 numbering with text lines.
- Preserve accessible names, contextual pressed states and formatting behavior; no dependency/backend changes.

## 0.3.0 — 2026-10-24

- Rename Overview to Navigator and route wheel input over its label/map to the editor while preserving browser zoom gestures.
- Add Navigator hide/show and left/right placement controls with validated display preference persistence and recalculated source-aligned geometry.
- Test actual wheel input, line/page units, layout, preference restoration and unchanged source. No backend implementation, dependency or proof changes.

## 0.2.0 — 2026-10-24

- Add a runnable frontend-only loopback preview, no sign-in, with reviewed CodeMirror/KaTeX dependencies and static release-build inputs.
- Implement six synthetic chapters, owned tab-local source/undo state, outline/minimap, formatting, table/maths views, split panels, contributors, pinned context and appearance controls.
- Add explicitly simulated provenance clipboard/fork-paste, local comments and contextual semantic review; preserve captured source and delayed checkpoint sequences.
- Align minimap with actual editor geometry; add independent chapter disclosure, contextual Paragraph/H1–H4/inline/list controls, numbered lists and 3.1-second control tooltips excluding large surfaces.
- Add source/dependency provenance, generated notices, meaningful adapter/source and Chromium workflow tests and frontend CI. No Rust runtime API, durable graph/storage, live provider call or new Lean proof.

## 0.1.8 — 2026-10-24

- Integrate multi-document/composite navigation, split Interaction/Investigation panels and contextual concept/assertion workflows into current specifications.
- Specify protected provenance clipboards, explicit source promotion, atomic fork-paste/clear recovery and pinned/live transclusion with exact historical closure.
- Record backend identity, authorization, encryption, transaction and resolver gates; retain single-Rust-executable packaging and read-only local/cloud Zotero plans.
- Reflect public source-repository visibility and the owner's frontend implementation pause. No runtime, dependency, proof or durable format changes.

## 0.1.7 — 2026-10-24

- Prepare a local Sites export inbox, preserving raw files outside automatic Git publication.
- Document review/adaptation against the frontend specification/evaluation, followed by a separate mock-data runtime and browser visual/interaction testing.
- Retain eventual single-executable Rust asset embedding; no frontend package, runtime or browser acceptance result is introduced by the intake folder.

## 0.1.6 — 2026-10-24

- Review the updated frontend integration proposal and adopt the owner-confirmed third Users tab and document-contributors semantics consistently in current requirements.
- Extend frontend contracts for distinct contributors/presence/membership/authorship, exact context lookup, source-preserving maths display and explicit Markdown export sources.
- Specify optional reviewed GitHub document disclosure as external jobs with separate authorization, provider-side concurrency and honest recovery limits.
- Preserve both local proposal inputs and unverified prototype claims; no frontend/backend implementation, provider credentials, renderer dependency or proof result is introduced.

## 0.1.5 — 2026-10-24

- Add a frontend integration specification with a fixture-first work order, staged capabilities, exact source/Unicode mapping, draft acknowledgement states and atomic command/retry semantics.
- Evaluate the supplied endpoint proposal separately, retaining aligned requirements and correcting/deferring prototype assumptions, mixed draft/publication actions and premature transport detail.
- Link the frontend handoff from current specifications and README; preserve the input document locally and unchanged. No endpoints, frontend runtime, durable formats or proof results are introduced.

## 0.1.4 — 2026-10-24

- Shorten README Current status to a brief implementation outline and remove Initial verification.
- Add developer prerequisites, private-repository clone instructions, stable Rust setup and locked build/test/lint commands.
- Link optional proof reproduction and technical documentation; clarify that no application executable or frontend setup is available yet. No runtime/proof changes.

## 0.1.3 — 2026-10-24

- Add README future design aims covering read-only Zotero citations, desktop editing/navigation, reusable content/history, agent/comments workflows, reproducible export, collaboration/federation and client-held encryption.
- Mark planned capabilities explicitly unimplemented; retain staged delivery and mobile deferral. No runtime or proof changes.

## 0.1.2 — 2026-10-24

- Publish a self-contained Specifications directory for current product, architecture, mathematical, data/navigation and encryption contracts.
- Keep reference/source material local and excluded from publication; keep reports and proof evidence outside Specifications.
- Update documentation links and resumption instructions without changing runtime behavior, proof source or data formats.

## 0.1.1 — 2026-10-24

- Record observed successful 0.1.0 hosted Rust, Lean model and extracted-Rust proof checks.
- Finalize the context-compaction handoff, resolved findings, explicit unimplemented boundaries and concrete resumption steps.
- Record the owner's requested pause after the completed increment. No runtime/proof source or format changes.

## 0.1.0 — 2026-10-24

- Add a separate trusted-server crypto adapter: XChaCha20-Poly1305 object envelopes, ciphertext-only SHA-256 storage addresses and bounded Argon2id passphrase-key wrapping.
- Bind workspace/record/purpose/epoch, clear managed secret/KDF buffers, and reject malformed/unknown/resource-heavy inputs before cryptographic processing.
- Test round-trip, independent encryption of equal content, tampering/context substitution, limits and passphrase rewrapping without re-encrypting prior objects.
- Record dependency licenses/checksums, the envelope ADR, actual API reference and persistent context-compaction handoff.
- No durable workspace, keychain implementation, authorization, client-held encryption or complete application is claimed. Existing domain/proof source is unchanged.

## 0.0.3 — 2026-10-24

- Execute pinned Charon/Aeneas extraction against the actual Rust domain crate and document nested-loop/iterator-model limits.
- Prove the unchanged real Rust budget helper's extracted semantics, including exhausted accounting and overflow-free increment.
- Add exact source/tool/dependency pins, strict regeneration/proof replay, hosted verification workflow and updated human-readable digest.
- Runtime APIs and Rust source remain unchanged; full-validator verification is not claimed.

## 0.0.2 — 2026-10-24

- Adopt version increments for milestone pushes, with synchronized Rust/Lake metadata and changelog records.
- Declare the public-contract scope and pre-/post-1.0 version conventions.
- No runtime API, graph algorithm, encryption, storage format or Lean theorem changed.

## 0.0.1 — initial foundation

- New MU-F repository, supplied design sources and owner-confirmed architecture decisions.
- Pure bounded Rust expansion validator and five regression tests.
- Four checked Lean rank/path model theorems, validation digest and Rust/Lean CI.
- Project-purpose introduction and automatic milestone publication instruction.

Earlier commits retained this initial version; the increment-on-push policy takes effect at 0.0.2. Model proofs do not establish Rust implementation correspondence.
