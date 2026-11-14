# Developer setup and runtime/fixture modes

## Common metadata

- **ID:** `HPX-GUIDE-002`
- **Title:** Developer setup and runtime/fixture modes
- **Purpose:** Entry point for current repository development commands and bounded runtime/fixture modes.
- **Level:** `09-guides`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** current checkout development tooling; bounded one-owner runtime and explicitly labelled unfinished/future scope
- **Upstream authority:** [HPX-ARCH-001](<../../04-architecture/system-architecture.md>); [HPX-ASSUR-005](<../../08-assurance/build-and-release.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-11-13

Do not use certificate-warning bypasses. No trusted live runtime was launched by this migration.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Audience and prerequisites

Developer setup for fixture preview and the unfinished integrated Rust writer. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Task and expected result

Developer setup for fixture preview and the unfinished integrated Rust writer. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Procedure

Start with the [repository development guide](repository-development.md), linked from the [canonical frontend-delivery scope](../../architecture/C3/frontend-delivery.c4). It is the current reference for commands, ports, HTTPS proxy/launch behavior, source watch, debugging, tests and production packaging. Use Git, a native compiler/linker, Rust stable with rustfmt/Clippy and Node.js 26/npm. From the repository root:

```sh
npm --prefix frontend ci --ignore-scripts
npm run dev:mock
```

The independent mock frontend defaults to `http://127.0.0.1:3000/`; it has no backend authority and resets tab-local edits on reload. This HTTP fixture mode is not a fallback for connected workspace editing. Connected development uses `npm run dev:backend -- ...` and `npm run dev:frontend -- ...` independently, or `npm run dev -- ...` to supervise both; the guide supplies their required options. Defaults are backend HTTPS port 8000 and frontend HTTPS port 3000. Use an existing explicitly approved certificate/trust setup and retain the backend's private launch fragment on the frontend origin. Do not install trust or bypass certificate warnings from these instructions.

Frontend source changes rebuild assets, but the browser reload is deliberate rather than automatic. Rust changes require a backend restart and its new launch URL. Current crates are under `backend/crates/`; root `Cargo.toml` and `Cargo.lock` still define the Rust workspace. Shared OpenAPI/predicate inputs are under `shared/`. Generated API typing is partial; shared transport does not imply complete schemas, multi-user permissions or full application verification.

For the single embedded production build:

```sh
npm run build -- --build-number 1
```

This prepares/checks frontend assets and builds `target/release/hypergraph` without `dev-backend`. It does not run acceptance suites, install trust, enroll a workspace, refresh the manual app or publish a release. Node, Lean and separate web/database servers are not release runtime requirements. See [local build/run](repository-development.md) for a separate synthetic workspace; real-document acceptance remains pending.

Use `npm run test:frontend`, `npm run test:backend`, `npm run api:check` and `npm run test:ui` with the prerequisites and scope in the repository guide. Backend tests are locked/offline and need cached crates; API checks may invoke the Rust exporter. Browser tests own isolated headless Chromium sessions and cleanup. These procedures assert no current integrated/release test result.

Proof sources/pins remain under `backend/proofs/`; the replay command is `python3 shared/tooling/check_rust_proof.py` with reviewed toolchains installed. New workspace/serialization changes still need replay compatibility checks. No proof replay was performed for this command-reference update.

### 11. Local frontend intake and runtime transition

Source `HPX-SRC-0028`, original lines 290–296. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Frontend development takes place in this IDE/workspace. Receive exported source/assets in the local [frontend inbox](<../reference/development-evidence.md>), preserving raw input and reviewing it against this specification and the integration evaluation before adoption. An export is reference code/design, not an accepted data/storage/application architecture. Refactor or replace its internals where needed.

The initial accepted frontend runs as a separate local development server with synthetic mock document data and a typed fixture adapter. Configure browser automation/screenshots and interactive checks against the actual local page. Do not claim a working frontend, screenshots or behavior tests before an implementation runs. The Rust runtime embeds the built static frontend and assets in one executable; current delivery/acceptance is bounded by the development-state record. The fixture development server and browser-test tools are not release-runtime dependencies. See [repository development](repository-development.md) for the current executable workflow.


## Examples

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Troubleshooting and limitations

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Related references

Developer setup for fixture preview and the unfinished integrated Rust writer. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Source provenance

- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 290–296; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.

## Current Stage3 local paths

The current command reference is [repository development](repository-development.md). Local verification tools/caches live in `.local/verification`,approved TLS material in `.local/credentials/tls`,persistent workspaces in `.local/workspaces`,and evidence in `.local/artifacts`. The default executable path is `.local/target/debug/hypergraph` or `.local/target/release/hypergraph`;use `node shared/tooling/cargo-path.mjs --profile debug` (or `release`) for the effective Cargo metadata path,including environment/cross-target overrides. Retained source/as-run blocks above preserve historical path wording and are not current invocation recipes.
