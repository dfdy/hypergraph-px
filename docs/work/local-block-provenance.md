# Paragraph and section provenance rows

2026-10-25. Owner requested the existing small provenance icons at paragraph and section starts, above and to the left. Preserve independent unit-level anchors and link records: a sentence link does not automatically assert that its parent paragraph/section was forked. Reuse kinds, exact-link inspection, direction, 1500 ms names and source-neutral Navigator rendering. Extend actual tab-only forks/pastes to complete paragraphs/sections; label fixtures explicitly. Publication hold remains active.


## Completed locally

Extended the existing provenance projection with unitKind sentence/paragraph/section and level-specific full Markdown-tree anchors. provenanceUnits handles paragraphs and ATX/Setext section spans (including descendants); containedProvenanceUnits captures only complete selected units. Event IDs include unit kind. The field maps/validates each anchor at its own level and retains stale records without promoting descendant provenance onto parents. Fixture examples and actual tab-only Fork/clipboard fork pastes populate independent block links.

Paragraph/section controls reuse glyphs and individual actions in a reserved row above the first source line, aligned left. Sentence controls remain inline. The existing widget plugin adds source-neutral line decoration and absolutely positioned icon rows instead of adding Markdown lines or block widgets. Navigator rows use identical renderer/spacing and cache invalidation. Inspection identifies unit level, abbreviates long excerpts and navigates only to the exact valid counterpart, with Go to linked paragraph/section labels. Existing 1500 ms names and text-tooltip exclusions remain.

CSS/layout pitfalls resolved: the application's broad .cm-line padding rule uses !important, so ordinary provenance padding was ignored even after raising selector specificity. Applied the intended important top padding and combined it with existing cm-block-gap spacing (22px row reservation; 34px when adding a 12px visual gap). Native browser selection also inserted visual newlines around inline-flex sentence marker groups; plain inline/nowrap wrappers preserve literal selection, while CodeMirror clipboard data was independently verified exact. Neither correction changes source.

Two older interaction scenarios assumed inserted prefixes remained in the rendered viewport. Extra row height exposed that assumption. Updated them to reveal source via keyboard before computing drag coordinates or querying virtualized lines; exact selection and context-style assertions remain unchanged. No test expectations were weakened.

## Verification and boundaries

50 Node tests passed, including independent block anchors, descendant/sibling section boundaries, Setext headings, code exclusion and level-specific invalidation. Static build passed. All 53 sequential Chromium scenarios passed (1.2 minutes) after the final fixes. Browser coverage includes row rectangles above/left of glyphs, exact section selection and copy-event clipboard text, unchanged Markdown download, actual paragraph/section fork markers, Navigator geometry, source editing/undo and existing selection/formatting controls. Screenshot artifacts/ui/paragraph-section-provenance.png visually inspected. git diff --check passed.

Updated the content provenance contract/index, workspace requirements, frontend README and Unreleased changelog. Legacy sentence-named internal exports remain compatible but now carry all three levels. No dependencies, Rust behavior, backend persistence or Lean scope changed. No version bump, commit or GitHub mutation; publication hold remains active. Live preview rebuilt at http://127.0.0.1:5173/.
