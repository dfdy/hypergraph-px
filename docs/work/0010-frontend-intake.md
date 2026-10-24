# Local frontend intake — issue 10

Tracking: https://github.com/dfdy/hypergraph-px/issues/10. Date: 2026-10-24. Scope before changes: create an upload folder, preserve/raw-isolate exports, use the current frontend specification/evaluation for architectural review, plan independent mock-data development and browser inspection followed by Rust embedding. Do not fabricate an imported/runnable frontend or choose its package architecture before seeing the files.

Prepared frontend/incoming/sites-export with an empty tracked marker and ignored export contents, plus instructions outside the inbox so imported READMEs do not overwrite project guidance. Documented the review, adaptation, fixture adapter, browser verification and release-bundling path. Node/npm and cached Chromium found; Playwright is not on PATH/project-configured. No browser has been launched and no source export exists yet. No existing Sites app, deployment, credentials or external document was accessed.

Verify upload directory, ignore/marker behavior, published links, synchronized patch version and unchanged runtime/proof source. No behavior test is needed for an empty intake directory. Recovery is a documentation revert without deleting user uploads. Git publication excludes raw input; actual UI/runtime integration waits for the exported files.

Executed: intake/marker exists; representative archive/source/asset paths are ignored while .gitkeep is trackable; no raw imports staged. 99 published local Markdown file/directory links and code fences checked. Version metadata synchronized at 0.1.7; runtime/proof source/hash unchanged. Cargo workspace check, formatting and whitespace checks passed. Browser automation/UI checks remain unexecuted until frontend integration.
