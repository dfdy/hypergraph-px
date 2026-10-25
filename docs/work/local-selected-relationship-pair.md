# Local selected-pair relationship fix

Owner renewed the publication hold: no pushes or GitHub updates unless explicitly requested. No version bump/commit/publication for this repair.

Reported behavior: highlighting two sentences could create an arrow before the first. The pair resolver used only selection.head, which could select the preceding pair. pairForSelection now trims the complete selection bounds and matches exactly two complete eligible adjacent sentence/paragraph units. Both drag directions resolve identically; the shared boundary determines marker position. Partial or more-than-two-unit selections report unavailable instead of guessing. Collapsed-caret behavior remains previewed in the Relations form.

Executed: 24 Node tests passed, including sentence/paragraph selection direction, outer whitespace and ambiguous/partial rejection. Four targeted Chromium scenarios passed, including a reproduction selecting the second and third sentences forward/backward, actual DOM marker position between those sentences, correct Relations participants, multiple arrows, preserved source, stale anchors and pinned context. Static build and diff checks passed. Live server serves rebuilt assets; refresh http://127.0.0.1:5173/. No source markup, dependency, Rust/proof or durable format change.
