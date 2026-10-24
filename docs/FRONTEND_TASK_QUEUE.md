# Frontend task queue

Latest owner instructions accumulate. Owner authorized publication with “Push to github”; accumulated local changes are prepared as 0.5.0. Backend implementation remains outside current frontend-only scope.

## Completed locally

- Parsed style indicators: Paragraph off in lists/quotes/code/tables, nearest nested list and actual heading level, independent inline emphasis.
- Character count followed by labelled Document/Workspace bold word totals; each independent fixture document counted once, including forks, excluding placements/clipboard duplication.
- Matching PX brand size, left-column Markdown download footer and draggable accessible column separators; Navigator width fixed and side-toggle at its bottom.
- Source-preserving semantic visual spacing. Owner confirmed Markdown blank-line paragraph rules; Enter and soft source newlines retain their Markdown meaning.
- Stable full-source Navigator projection with tables/formulas and source-based viewport/navigation mapping; fixes viewport-virtualization rendering changes shown in the recording.
- Default-on bottom-bar Drag snapping toggle for sentence/paragraph boundaries; forward/backward dragging and exact protected code/math contexts. Independent one-through-five repeated-click selection: caret, word, sentence, paragraph, section.
- Future core egress denial specified for client-held/non-trusted mode, including GitHub publication/document export and other application-controlled disclosure paths. This remains unimplemented, as does client-held mode itself.

## Evidence and continuation

Build and 19 Node tests passed; full Chromium suite passed (26 scenarios). Browser screenshots inspected. See [development handoff](DEVELOPMENT_STATE.md) and [local workspace work record](work/local-workspace-layout.md). Raw recording stays outside Git; screenshots/traces remain ignored. Continue frontend-only refinement from owner feedback; do not enable missing Rust services or publish without authorization.

## Future Word review import

Owner requested import of tracked changes/comments from Word matched to a branch or snapshot, attributed to virtual Word Revision. Recorded in [the future specification](../Specifications/WORD_REVIEW_IMPORT.md); implementation remains queued, including parser/mapping/core publication and frontend review workflow.

## Important medium-term priority: encrypted browser/runtime communication

Implement authenticated encrypted transport (HTTPS/WSS, including loopback) before real-data browser integration. ADR needed for certificate trust/bootstrap/lifecycle and secure development/embedded parity. Storage encryption, authentication and client-held egress policy remain separate. See [transport requirements](../Specifications/TRANSPORT_SECURITY.md). The current synthetic-only HTTP preview remains unconnected to Rust.

## Adjacent-unit relationship visualization

Issue 19: sentence horizontal and paragraph vertical double-ended arrows, one per named local relationship, delayed tooltip and exact Relations inspection; local multiple-record form, source-range mapping/review-needed invalidation, pinned context and Navigator parity. Frontend-only synthetic implementation; sections and real graph publication remain future work. Final evidence is in the handoff and issue.
