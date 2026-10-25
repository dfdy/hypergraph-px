# Structure guide alignment after replacement widgets

2026-10-25. Owner reported section/paragraph rail drift starting after the rendered table, with screenshots around table/maths/list content. Reproduced in live browser: first blank line below table was 36px lower than its gutter row, exactly the table card's two 18px vertical margins. Native CodeMirror height measurement reads widget bounding rectangles, excluding outer margins. Fix widget layout rather than compensating downstream guide positions. Keep source, table UI/spacing, guides and Navigator geometry consistent. Publication hold remains active.


## Completed repair

Rendered table card now has zero outer margin inside a table-block-layout wrapper with 18px top/bottom padding. The overall visual spacing is retained, while the native editor measures all 36px instead of excluding it. Estimated widget height includes that padding. Navigator uses the same outer wrapper for projected-height measurements, rather than the inner table card. No downstream guide offset compensation was introduced. Maths widgets already contain their spacing inside the measured root.

Guide marker DOM records source block from/to coordinates, and equality includes them so reused rows retain correct debug/test metadata. New browser regression compares the exact row top/height with source lines at the maths heading, all three numbered list items and the following section. It runs with source/rendered maths, 60-column wrapping, 21px font and table source/rendered toggles. Geometry before repair was off by exactly36px below the table; after repair measured deltas are zero. Table appearance, data, editing and source are preserved.

54 Node tests passed; static build and all56 Chromium scenarios passed (1.2m). Three targeted guide scenarios also passed before the final full suite. Visually inspected artifacts/ui/guide-table-offset-after.png around the table/maths and artifacts/ui/guides-after-table-maths.png around the numbered list/next section at21px. Exact source download remains unchanged. git diff --check passed.

Updated the canonical guide contract, changelog and AGENTS visual-review rule to include content below rendered table/maths replacements. No dependency/Rust/Lean changes, commit, version bump or GitHub mutation. Publication hold remains active; shared preview rebuilt at http://127.0.0.1:5173/.
