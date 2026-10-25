# Editor structure guides

2026-10-25. Owner requested vertical structure/indent guides for sections, subsections and paragraphs in a dedicated gutter left of all text, without level-dependent text indentation. Implement lines first; leave provenance icons in their current locations pending further instruction. Local work only, publication hold active.

Use parsed top-level Markdown headings and paragraph ranges, fixed gutter width/regular lane spacing, real editor line/wrap/widget geometry, decorative noninteractive rails, exact source/selection/export preservation and clean document/scroll updates. Validate hierarchy, boundaries, code/table handling, fixed text alignment and actual browser layout.


## Completed implementation

Added frontend/src/structure-guides.js: a source-keyed cached Markdown hierarchy/paragraph model, per-line/replace-block guide segments, and a native CodeMirror gutter. Fixed width 96px; lanes every 12px. One-pixel section rails run through descendant content, with paragraph rails inside their section ancestry. Actual ancestry handles skipped heading levels; only top-level ATX/Setext headings define sections. Code/table rows do not gain prose-paragraph rails. Replacement math/table blocks retain containing section guides through the native gutter widget callback.

The gutter uses CodeMirror line/wrap/widget heights, including existing provenance row padding. Native gutter row height updates track scrolling, font/wrap and source edits. All editor text shares one alignment; only the common available width changes to reserve the gutter. No indentation, source characters, undo changes, tooltip targets, new controls or icon moves. The gutter is decorative/noninteractive and hidden from reading. No new Navigator guide/control; its existing source-width projection continues to match actual wrapping.

Documentation added Specifications/EDITOR_STRUCTURE_GUIDES.md and linked it from the index/workspace contract; frontend README and Unreleased changelog updated. Existing provenance icons deliberately remain in their current inline/above-block locations pending the owner's next instruction.

## Verification

53 Node tests passed, including new hierarchy/lane, soft/hard-line, sibling/blank boundary, Setext/quoted/fenced heading and table exclusion fixtures. Static build passed. A full 54-scenario Chromium run passed all 53 existing scenarios; the new guide scenario failed only because an unscoped .cm-line locator also matched the Navigator copy. Scoped that one locator to #editorHost, then the complete new guide scenario passed (1.2s) with no production changes. It verifies 96px width, 12px lane spacing, one-pixel rails, continuous ancestor segments, fixed text alignment, wrapped paragraph height, scrolled alignment and exact clipboard/export. No further repeated suite needed for a locator-only repair.

Live screenshot artifacts/ui/editor-structure-guides.png visually inspected; fresh fixture inspection also showed no horizontal overflow (scrollWidth=clientWidth), native gutter width96, source content aligned and no browser errors. git diff --check passed. No dependencies/Rust/Lean evidence changed, commit/version bump or GitHub mutation. Publication hold remains active; shared preview rebuilt at http://127.0.0.1:5173/.

## Follow-up: match Explorer spacing/colour and tighten the text gap

Owner requested the editor's guide spacing/colour match the Explorer, a larger left boundary inset and a much smaller text-side gap; provided screenshot and explicitly requested agent visual inspection. Baseline live browser confirmed 12px editor spacing versus 18px Explorer, 12px editor outer inset, and muted/opacity-adjusted editor colours versus Explorer border colour. Adjust using the same visual styling, 24px outer inset and one document-wide gutter sized to deepest lane, removing content centring/left padding that exaggerated the gap. Keep all text aligned and existing icons in place relative to their units.


Follow-up completed: guide lanes now match Explorer's 18px spacing and share its border-colour token at full opacity. The first editor rail is 24px from the boundary (was 12px). Gutter width now fits the deepest document lane with 12px clearance; a depth-3 fixture uses 90px, not unused fixed lanes. Removed automatic left centring and 30px content-left padding; retained 4px source-line padding and right-side wrap padding. All levels share one text edge. Computed editor attributes and native spacer update together when document depth changes. Icons remain in their existing source-relative locations.

Inspected live before/after captures and dark/light screenshots, not just tests: initial editor colour rgb(143,151,168) at 0.4 opacity differed from Explorer rgb(48,52,61); final both use rgb(48,52,61) at full opacity in dark mode and matching theme borders in light mode. Visible nearest-guide text gap in the default viewport is now 33px; deepest document lane has only the configured clearance plus source-line padding. No horizontal overflow. Colour token resolves on body so light-theme border overrides apply correctly instead of inheriting a pre-resolved dark root colour.

Follow-up evidence: all 54 Node tests passed, build passed, both guide browser checks passed across 1280/1600/2000px widths in both themes, and final all 55 Chromium scenarios passed (1.2m). Screenshots artifacts/ui/structure-guides-balanced-dark.png and -light.png visually inspected. Canonical guide spec, frontend README and changelog updated. Added the owner's actual-interface visual-review preference to AGENTS.md for future layout work. No publication, commit or version increment.
