# Local contents tree and editor following

Publication held: no GitHub updates, commits or version increment.

Added outline-tree.js with pure heading hierarchy/current-heading lookup and transient branch collapse state. Workspace composition, document rows and heading branches with descendants disclose independently. Nested left borders span visible descendant groups, including skipped heading ranks. Tree display does not mutate source or canonical graph structure.

Bottom controls: Follow editor (default off, validated boolean display preference) and Close all / Open all. Following highlights the caret section or top visible section on editor scrolling, opens relevant ancestors and scrolls only the contents area, preserving focus/selection. Re-reveals an offscreen row even on later movement within the same section. Close all cancels pending follow frames and remains immediate until a later follow/section event; Open all restores all branches. Fold maps/headings/IDs remain tab-local and never enter display storage.

Executed: 25 Node checks and the full 32-scenario Chromium suite passed. A final small refinement to same-section re-reveal/pending-frame cancellation passed both targeted tree scenarios after rebuild. Checks include both lenses, all branch levels, guide geometry, source preservation, independent disclosure, focus, viewport/caret following, disabling, preference persistence and unchanged existing source/relationship/Navigator flows. Screenshot visually inspected at 1600x1000. No runtime Rust, proof, dependency or backend change.

Owner refinements supersede the initial composition-root behavior above: EXPLORER now lists documents directly, without a Synthetic dissertation root or placeholder collections. Close all hides section/subsection outlines while retaining document/chapter rows; Document lens shows its current document row. Vertical guides align with disclosure centres on one 18px progression (9px margin + 1px border + 8px padding). Relations is now first/default in Investigation. Full combined validation passed: 27 Node tests and 35 browser scenarios; screenshot visually inspected. Publication remains held.
