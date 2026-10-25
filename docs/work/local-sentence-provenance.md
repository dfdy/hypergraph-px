# Sentence provenance icons

2026-10-25. Owner authorized sentence-start icons for forked sources, forks, copies, revisions and transpositions, with all links shown separately. Add extraction, split/merge, pinned/live embeds and references/backlinks as distinct supported link kinds. Publication hold remains active.

Implement source-neutral, individually named keyboard/pointer controls and exact-link Provenance inspection, keeping semantic assertions separate from operation provenance. Synthetic examples are explicitly labelled; actual tab-only fork actions should populate the source and destination. Exact anchors map through unrelated edits and retain review-needed records after changes; no text matching guesses, equal-text lineage inference, durable history or backend writes. Mirror icon geometry in the Navigator. Record actual test evidence on completion.


## Completed locally

Implemented sentence-provenance.js (nine kinds and both endpoint directions, exact sentence units, explicit event/link identities, frozen capture metadata, field/effects, edit mapping and review-needed invalidation), sentence-provenance-view.js (SVG-only source-neutral controls and inspection callback), and shared Navigator rendering/cache invalidation. Every known endpoint gets its own 17px icon; multiple links are not collapsed into a count. Reviewed the screenshot visually after fixing shared-boundary order: semantic arrow first, then next sentence's provenance icons.

Provenance shows the exact selected endpoint or current sentence's links, explicit fixture/tab-operation attribution, both captured excerpts and current counterpart navigation only when the mirrored anchor remains valid. Semantic inspection context does not leak into Provenance. Source changed or unavailable counterparts do not trigger text matching or guessed navigation. Symbols add no text to clipboard/selection/export. Native button activation supports pointer and keyboard, with the existing 3.1-second tooltip system.

Real tab-only Fork actions populate source and destination complete-sentence endpoints. Clipboard captures remember complete-sentence source ranges; fork pastes record source/destination endpoints against those captured ranges, with same-document insertion mapping and historical-source handling. Capturing a protected clipboard reference alone is not a derivation. Distinct link IDs allow multiple parents in a shared merge event. Other transformation commands are still illustrative fixture data until their actual operations exist. No Rust services, durable provenance, new dependency or Lean claim.

Documentation: Specifications/SENTENCE_PROVENANCE.md plus index/workspace specification, frontend README and Unreleased changelog. Initial source document contains explicitly labelled synthetic examples; all data resets on reload. Category-reorganization ideas from the owner's earlier question remain an assessment, not newly implemented here.

## Validation

42 Node tests passed, including direction/policy distinctions, multiple endpoints, exact mapping, stale/undo handling, structural exclusions and multi-parent event identities. Static build and all 50 sequential Chromium scenarios passed (about one minute), including source/undo/export, fork navigation, clipboard provenance, tooltip timing, selection gestures and Navigator geometry. After the final visual ordering correction, rebuild and all six affected provenance/relationship/Navigator browser scenarios passed (10.6s). artifacts/ui/sentence-provenance-icons.png visually inspected. git diff --check passed.

Initial targeted browser run failed because new test locators searched for buttons inside button locators; corrected the scope to the provenance group. Both actual icon/fork scenarios then passed. No application workaround or weakened source checks.

No commit, push, release, GitHub mutation or version bump. Live preview rebuilt at http://127.0.0.1:5173/. Published version remains 0.6.0.
