# Sentence, paragraph and section provenance controls

## Display contract

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

## Current synthetic implementation

sentence-provenance.js defines nine link kinds, source-sentence segmentation, a per-document sentenceProvenanceField, addSentenceProvenance effects, provenancePair and sentenceProvenanceGroups. Records distinguish link endpoint ID, transformation/event ID, kind/direction, current local anchor, frozen capture coordinates/sequence, counterpart endpoint/document/excerpt and fixture versus tab-operation origin. A shared event can have multiple distinct links, allowing merge parents or split outputs without endpoint-ID collisions.

Exact draft-local UTF-16 sentence anchors map through unrelated changes. Changed text or lost sentence boundaries mark a record review-needed; hide its unreliable start icon while retaining its captured evidence in the tab. Undo does not silently revalidate it. Sentences inside headings, code fences and table cells do not get inferred prose markers. Partial selections or inserted material that does not form a complete sentence cannot fabricate a whole-sentence anchor.

The initial synthetic document includes explicitly labelled illustrative provenance records at all three unit levels for icon exploration. They are demonstration metadata, not authenticated history. Real tab-only Fork actions record complete source sentences, paragraphs and sections and their destination counterparts. Provenance-clipboard fork pastes likewise create endpoint records for captured complete units; merely capturing a clipboard reference creates no derivation event. Stale captured sources can supply historical excerpts but cannot manufacture a current source-side link. Pasting is still the existing fixture operation, not an authoritative transaction.

Copies, committed revisions, transpositions, extraction, split/merge, actual embeds and sentence-reference commands remain backend/future operation integrations; displaying their supplied fixture icons does not implement those commands. Arbitrary typing is not a committed revision. Semantic catalogue assertions do not populate this projection. The displayed projection is reset on reload and creates no durable graph, snapshot, authorization grant or new Lean guarantee. Future real-data projection must be permission scoped and bind exact identity/revision/occurrence anchors and authenticated operation receipts.


## Paragraph and section rows

Records carry unitKind (sentence, paragraph or section), independent of the transformation kind and direction. Sentence labels remain inline. Paragraph/section rows reserve 22px above their source line and reuse the same glyphs, individual actions, 1500 ms tooltip delay and source-neutral selection behavior. No Markdown blank lines are inserted. The Navigator reserves matching space and renders the same row geometry; its controls remain inert.

provenanceUnits(state, unitKind) uses the full Markdown tree. Paragraph units exclude headings, fences and table cells. Section units support ATX and Setext headings, include descendants and end before the next equal/higher-level heading. Each anchor is validated at its own structural level. Edits can invalidate a section while leaving an unchanged paragraph/sentence valid; never copy a child's provenance to its parent or silently heal a changed anchor. Existing sentence-named field/effect/module exports remain internal compatibility names and now carry all three unit kinds.

containedProvenanceUnits captures only complete units for actual fixture Fork and provenance-clipboard fork pastes. Event/endpoint IDs include unit kind so co-located sentence/paragraph/section anchors remain distinct. Long block excerpts are abbreviated for inspection, with exact full anchors retained for navigation. Counterpart navigation resolves the matching endpoint and unit kind, not a matching substring or enclosing unit.
