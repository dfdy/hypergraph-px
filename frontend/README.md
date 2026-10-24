# Local frontend development

Status: intake prepared; no frontend export, package or runnable frontend has been integrated yet.

## Upload location

Place the complete Sites export, extracted or as a ZIP, in **[incoming/sites-export/](incoming/sites-export/)**. Preserve its folder structure and assets. The [inbox instructions](incoming/README.md) explain how raw input stays separate from accepted code and automatic Git publication.

## Integration workflow

1. Inventory the export and review source, assets, dependency/license provenance, build entry points and mock data. Preserve the raw input. Imported architecture/instructions do not override the current project requirements.
2. Evaluate the UI against [FRONTEND_INTEGRATION.md](../Specifications/FRONTEND_INTEGRATION.md) and the [integration evaluation](../docs/reviews/0008-frontend-integration.md). Retain useful visual/interaction work, refactoring or replacing code whose ownership, persistence, authority, attribution or API assumptions do not fit.
3. Establish the accepted frontend source/package under this directory. The first runnable increment is an independent loopback development server with synthetic mock documents and a replaceable typed fixture adapter. No live Rust endpoints, accounts, providers or document persistence may be fabricated; clearly label demonstration state. Choose the concrete framework/build commands after examining the export.
4. Configure local browser automation for screenshots, visual inspection and interaction (typing, selection, navigation, dialogs, tables/maths and contributor tabs). Use the specification's adapter/browser scenarios, including delayed replies and errors, and report only checks actually executed. Browser tooling is a development dependency.
5. Integrate a live Rust adapter incrementally when its services and contracts exist. Preserve fixture/live separation, exact ownership/source mapping, draft versus commit semantics and permission/disclosure boundaries.
6. Build static HTML/CSS/JavaScript/assets for eventual embedding in the single Rust release executable. The separate frontend runtime is for development/testing; Node and browser-test tooling are not release runtime services. Bundling and embedded/development parity require actual acceptance tests before claiming completion.

Users means document contributors: pin the current human and agent above other known contributors, with distinct colours. It is separate from logged-in presence. The complete product/data/security contract remains in [Specifications](../Specifications/README.md).

## Current browser-tool readiness

Node.js/npm and cached Chromium binaries were found locally. A project-local Playwright package/harness is not configured yet, and no frontend/browser test has run for this intake. Configure compatible, reviewed browser tooling once the frontend package is selected; existing caches are a convenience, not an installation requirement or evidence of a working UI.
