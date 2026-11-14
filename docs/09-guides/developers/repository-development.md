# Repository development

This is the current executable-command reference for this checkout. The canonical [frontend-delivery scope](../../08-assurance/diagrams/delivery/frontend-delivery.c4) links here for development details; [development state](../reference/DEVELOPMENT_STATE.md) records actual implementation and verification evidence. Commands below are procedures, not claims that the current integrated or release checks have passed.

The three-stage root reorganisation records verified Stage1/Stage2/Stage3 execution. All three stages are executed and verified under TEST178;manual handoff remains blocked by the missing recorded workspace. TEST176 records the closed proof/staged-integrity gates and remaining raw-index attribution limit.

## Prerequisites and repository boundaries

Run commands from the repository root unless stated otherwise. Use Node.js 26/npm, Rust stable and a native compiler/linker. Rustfmt/Clippy and Playwright Chromium are needed for their respective checks; Lean is a separate proof-development tool, not an application runtime dependency. Review dependency licenses/provenance before compilation. Install the pinned frontend dependencies without lifecycle scripts:

```sh
npm --prefix frontend ci --ignore-scripts
```

A fresh dependency download needs network access. The root `package.json` supplies command wrappers; dependencies and their lockfile belong to `frontend/`, not the root. Build from the existing checkout without committing, pushing, switching branches or discarding uncommitted work.

| Location | Responsibility |
| --- | --- |
| `backend/crates/domain` | Pure domain; no serialization dependency |
| `backend/crates/storage`, `crypto`, `keychain`, `runtime` | Persistence/adapters, encryption, optional native unlock and HTTPS application runtime |
| Root `Cargo.toml` / `Cargo.lock` | Cargo workspace and locked Rust dependency resolution |
| `frontend/src`, `frontend/styles.css`, `frontend/index.html` | Browser interface, existing CodeMirror editor, Dockview layout and locally bundled Web Awesome components |
| `frontend/src/api-client.ts`, `frontend/src/runtime-adapter.js` | Shared generated-contract transport and bounded application/buffer coordination |
| `shared/openapi.json` | Rust-derived, partially typed API contract; not a second handwritten API definition |
| `shared/predicate-catalog-v1.json` | Shared predicate catalogue input |
| `frontend/src/generated` | Generated client types, routes and constraints; do not edit by hand |
| `shared/tooling/hpx.mjs` | Root development/process and production-build command wrapper |
| `frontend/scripts/dev.mjs`, `dev-server.mjs` | Source watch and independent development server / verified HTTPS proxy |
| `frontend/dist`, `.local/verification`, `.local/target` | Generated assets, local verification caches and Cargo outputs |

Current live application semantics are a bounded one-owner implementation, not completion of the required workspace-local multi-user/AI-user permission model. OpenAPI inventories routes but only some request/result schemas are typed. Generated typing does not establish authorization, exact-source validity, format compatibility or whole-application correctness. See the [browser/runtime contract](../../06-subsystems/interfaces/browser-runtime.md).

## Choose a development mode

| Root command | What runs | Default browser address |
| --- | --- | --- |
| `npm run dev:mock` | Independent synthetic frontend; no Rust/backend connection | `http://127.0.0.1:3000/` |
| `npm run dev:frontend -- ...` | Independent HTTPS frontend proxying an already running Rust backend | `https://127.0.0.1:3000/` plus the private launch fragment |
| `npm run dev:backend -- ...` | Independent Rust API runtime with `dev-backend`; no embedded frontend | Prints a private frontend launch URL on port 3000; start frontend separately |
| `npm run dev -- ...` | Supervises the connected frontend and Rust backend together | Prints a private frontend launch URL on port 3000 |

Frontend and backend ports are independent. Root wrappers accept `--frontend-port` / `--backend-port`, or `HPX_FRONTEND_PORT` / `HPX_BACKEND_PORT`; flags take precedence. Ports must be integers from 1024 through 65535. Combined development rejects equal ports. Choose unused ports rather than terminating unrelated servers. These defaults do not replace the separate guarded manual runtime or its workspace.

### Synthetic frontend only

```sh
npm run dev:mock
```

For another port:

```sh
npm run dev:mock -- --frontend-port 3001
```

Open the printed HTTP frontend URL. This mode is explicitly **Demonstration — changes in this tab only**; reload loses synthetic edits. It does not authenticate, unlock, save to SQLite, contact providers or fall back from a failed live connection. Its API requests are rejected rather than proxied. HTTP here is only for synthetic fixtures, never a fallback for workspace data.

The frontend-local equivalent is `npm --prefix frontend run dev:mock -- --port 3001`. A bare `npm --prefix frontend run dev` is connected mode and requires its HTTPS/backend options; it is not the old static preview.

### Connected HTTPS development prerequisites

Before starting connected development, have an existing, explicitly approved certificate/trust setup covering `127.0.0.1`. The browser must trust the frontend certificate, and Node must validate the backend certificate. The examples reuse local `.local/credentials/tls/localhost.pem` and `localhost-key.pem`; a fresh clone does not contain these private files. Substitute your approved paths if different. `--ca` supplies the approved backend trust material to the Node proxy; it does **not** install trust in the browser or operating system.

This guide performs no certificate generation or trust installation. Installing trust requires separate owner authorization. Stop on certificate errors: no browser-warning bypass, HTTP fallback, `ignoreHTTPSErrors`, `curl -k` or `NODE_TLS_REJECT_UNAUTHORIZED=0`. The development server explicitly rejects disabled Node TLS verification. Keep private keys owner-readable only, and keep keys, passphrases, launch URLs and runtime data out of Git and shared logs.

Use a separate synthetic workspace, not the manual workspace. `--create` is only for a genuinely new path; preserve and reopen existing workspaces without it. Do not run two writers against one workspace. The following examples use `.local/workspaces/development-synthetic.hpx` and assume that path does not yet exist.

### Independent backend and frontend

In terminal A, start the Rust backend:

```sh
npm run dev:backend -- --workspace .local/workspaces/development-synthetic.hpx --cert .local/credentials/tls/localhost.pem --key .local/credentials/tls/localhost-key.pem --create
```

This runs Cargo with the `dev-backend` feature, so the backend can compile/start without prepared browser assets. It serves API/session traffic over HTTPS on `127.0.0.1:8000`; it does not serve the embedded editor. On later starts, use the same command **without `--create`**.

In terminal B, start the connected frontend independently:

```sh
npm run dev:frontend -- --backend https://127.0.0.1:8000 --cert .local/credentials/tls/localhost.pem --key .local/credentials/tls/localhost-key.pem --ca .local/credentials/tls/localhost.pem
```

The frontend serves its own assets over HTTPS on port 3000 and forwards allowed `/api/v1/` requests to that backend. It verifies browser Host/Origin before translating the origin for the verified upstream connection. It forwards session material; it neither invents authorization nor bypasses workspace unlock.

Open the complete **`Development launch (private):` URL** printed by `dev:backend` after the frontend is ready. It already uses the frontend origin (`https://127.0.0.1:3000`) and retains the backend's fresh private `#launch=...` fragment; the backend API origin on port 8000 is not an editor page. Launch URLs are explicit clickable hyperlinks in supporting terminals and plain URLs in redirected output. Do not paste the literal ellipsis. Opening the bare frontend origin does not establish a new authenticated session. Keep the launch URL private; enter the passphrase in the browser, not a shell command. Authentication, workspace unlock and resource authority remain distinct.

For nondefault ports, give terminal A `--backend-port 8001 --frontend-port 3001`, and terminal B `--frontend-port 3001 --backend https://127.0.0.1:8001` together with the same TLS options. Frontend startup does not start or supervise a backend, and backend startup does not start a frontend. If either is unavailable, diagnose it explicitly; never switch live editing to fixtures.

### Combined supervision

To run both processes under one foreground supervisor:

```sh
npm run dev -- --workspace .local/workspaces/development-synthetic.hpx --cert .local/credentials/tls/localhost.pem --key .local/credentials/tls/localhost-key.pem --ca .local/credentials/tls/localhost.pem --create
```

Use this instead of the two independent processes, not alongside them on the same ports/workspace. Omit `--create` when reopening. The supervisor prints `Development launch (private):` with the backend's launch fragment on the frontend origin. Open that complete URL. `--frontend-port 3001 --backend-port 8001` changes both local defaults. Do not add `--mock` to this command; use `dev:mock` instead.

Choose **Lock** and await completion before stopping a connected editing session. Control-C stops the foreground process; the combined supervisor stops both of its children. Independently started processes must each be stopped in their own terminal. Do not stop or update the guarded manual app as a development side effect.

## Watch, reload and debug

The frontend watches `frontend/src/`, `frontend/index.html`, `frontend/styles.css`, `frontend/build.mjs` and shared-directory changes, rebuilding a content-keyed asset snapshot after edits. A failed rebuild retains the previous served snapshot and reports an error. Dependency/package changes are not a dependency installer: rerun `npm ci` when the frontend lockfile changes, then restart the frontend process.

There is **no automatic browser reload or editor replacement**. Wait for `Frontend rebuilt; reload when ready.`, preserve/acknowledge the current owned editing buffer as appropriate, then reload deliberately. Mock buffers are tab-local and cannot survive reload. A shared-file watch does not regenerate API DTOs or restart Rust. Restart the backend after Rust changes; reuse the new launch URL after restart. The production executable never live-serves source files or `frontend/dist`.

For debugging:

- Use an isolated browser context and synthetic data. Inspect the Console and Network panels for build, API, Host/Origin, TLS and session failures. Redact launch fragments/cookies and document contents before sharing logs.
- Check the two processes separately: frontend asset responses versus backend/API responses. A `502` means the verified upstream connection failed; it is not permission to disable verification. A locked/denied/stale/uncertain application result is not a proxy failure.
- Use `RUST_BACKTRACE=1` with a backend command when diagnosing a Rust panic. The backend runs through Cargo and is not a Rust source watcher; attach a debugger to the process you started, not the manual app.
- Preserve exact source, selection and Undo/Redo when investigating docking, resizing, rendering, tables or math. A visual change must not create application history or bypass the shared API boundary.

## Tests and generated contracts

These are commands to run, not results asserted by this guide. Select checks proportionate to the changed boundary; coordinate Rust builds and complete suites rather than compiling concurrently with another worker.

```sh
npm run test:frontend
npm run test:backend
npm run api:check
npm run test:ui
npm run test:development
```

- `test:frontend` runs the frontend Node suite without a Rust build.
- `test:backend` runs workspace Rust tests with `hypergraph-runtime/dev-backend`, locked and offline. It needs the pinned crates already cached; missing-cache errors are not test failures to conceal by changing dependency versions.
- `api:check` checks generated bytes, local schema references, conservative compatibility and strict client typing. It may invoke the offline Rust API exporter when its source/toolchain identity changes. Intentional authorized regeneration uses `npm --prefix frontend run api:generate`; do not hand-edit `shared/openapi.json` or generated frontend files, or silently accept a wire/schema change.
- `test:development` uses the approved local TLS files and isolated headless Chromium to check root CLI mock startup/restart, independent frontend/backend restart, combined supervision and port cleanup against synthetic workspaces. It performs no trust installation or manual-workspace access.
- `test:ui` builds isolated preview assets and owns an ephemeral loopback server, isolated **headless** Chromium contexts, cleanup and unique evidence under `.local/artifacts/ui-runs/`. It needs no development server. To filter: `npm run test:ui -- tests/browser/docking.spec.js`. Install the pinned browser if missing by running `npx playwright install chromium` from `frontend/`, then return to the repository root.

Additional Rust hygiene checks are `cargo fmt --all -- --check` and `cargo clippy --workspace --all-targets --locked --features hypergraph-runtime/dev-backend -- -D warnings`. `python3 shared/tooling/verify_documentation.py` checks repository documentation; `--check-local-sources` additionally requires retained private source archives.

Preview/Node tests are not actual HTTPS/SQLite/restart/compatibility or release acceptance. The separate `frontend/scripts/check-runtime-workflow.mjs` exercises real synthetic runtime workflows; its explicit binary, proxy, compatibility and native-Keychain scopes require the corresponding prerequisites. It does not authorize trust installation or manual-workspace mutation. Manual refresh requires the separately guarded, exact-tested-binary milestone procedure; no routine dev/test command above hands off the app. Current integration/release evidence belongs in development state and the test register, not an inferred success here.

## One-command production build

From the repository root:

```sh
npm run build -- --build-number 1
```

The wrapper installs the locked frontend dependencies without lifecycle scripts, fetches the locked Rust dependencies, checks the generated API contract, prepares static assets, and runs the locked release build for `hypergraph-runtime` / `hypergraph`. It stops if any step fails. The build number must be a positive integer of at most 16 digits; choose the intended build identity explicitly. The dependency-fetch steps need network access on a fresh checkout; the contract exporter itself remains offline against that populated cache.

For repeatable binary identity, use the same source, lockfiles, build number, toolchain, platform and build location. This migration checked two same-machine builds with Node 26.10.0 and Rust 1.99.1 and obtained identical SHA256; cross-machine/cross-toolchain byte determinism is not claimed. The local diagnostic compile counter still advances but the explicit production build number determines the embedded four-part version.

Output: `.local/target/release/hypergraph`. The production build does **not** enable `dev-backend`: it embeds the frontend, local assets and notices in one Rust executable. Node, Lean, Docker, a separate database server and the development proxy are not release runtime requirements. `npm run build:frontend` and `npm run build:backend` are independent development helpers, not substitutes for this production command; the latter deliberately enables the asset-free development backend.

The executable still needs an approved HTTPS certificate/key and an explicit workspace when launched; building does not install trust, create/enroll/unlock a workspace, run acceptance suites, refresh the manual app, commit, push or publish a release. See [local embedded lifecycle instructions](#start-a-separate-synthetic-workspace). Successful compilation alone is not integrated delivery or real-document acceptance.

## Local embedded build and run

The former root local-run page is consolidated here. Existing checkout edits need no commit,push,pull or branch change to compile. These are procedures,not integrated/release acceptance results.

## Enter the repository and check prerequisites

For this checkout:

```sh
cd "/Volumes/Base/Sites/Hypergraph PX MU-F"
```

All commands below run from that root. Stop on a failed command. Use Node.js 26/npm, Rust stable and a native compiler/linker. On macOS, `xcode-select -p` checks for the command-line compiler tools. Check installed versions with `node --version`, `npm --version`, `rustc --version` and `cargo --version`. Resolve missing prerequisites separately; this guide installs no certificate trust or signing identity. Review dependency licenses/provenance before compilation.

Rust crates live in `backend/crates/`, but the Cargo workspace and lockfile remain at the root. Shared OpenAPI/predicate inputs live in `shared/`; browser dependencies and their lockfile live in `frontend/`.


## Use existing approved HTTPS files

The following examples assume an existing approved setup at:

- `.local/credentials/tls/localhost.pem` — certificate covering `127.0.0.1`;
- `.local/credentials/tls/localhost-key.pem` — private key, readable only by its owner.

These private files are not supplied by a fresh clone. Confirm that the certificate is valid and trusted normally by the browser. If files are absent, expired, different from the approved material or untrusted, stop and resolve setup separately. Installing trust requires explicit owner authorization. Never bypass a certificate warning, disable TLS verification or switch connected editing to HTTP. Do not put keys, passphrases, launch URLs or workspace data into Git or shared logs.


## Start a separate synthetic workspace

Use an unused workspace path under `.local/workspaces/`. The example below uses `.local/workspaces/self-build/synthetic.hpx`; create its parent if necessary:

```sh
mkdir -p .local/workspaces/self-build
```

For a genuinely new workspace only:

```sh
./.local/target/release/hypergraph --workspace .local/workspaces/self-build/synthetic.hpx --cert .local/credentials/tls/localhost.pem --key .local/credentials/tls/localhost-key.pem --create --port 8388
```

Keep Terminal open. If the file already exists, preserve it and use the reopening command below **without `--create`**. If port 8388 is occupied, choose another unused port rather than stopping an unrelated process. Do not run two processes against the same workspace. Use synthetic text; real-document acceptance remains pending.

1. Open the **complete fresh HTTPS URL printed by this process**, including its private `#launch=` token. A bare origin does not establish a new authenticated session.
2. Keep that URL private. In the browser, choose **Create workspace** with a new passphrase, then create a synthetic document. Never place the passphrase in a shell command.
3. Draft acknowledgement/recovery is distinct from immutable Commit history. Existing workflows also include changed-text departure Commit within their adopted scope; do not infer a universal future Save/Commit relationship.
4. Passphrase unlock is the default. Keychain enrollment is a separate explicit action retaining passphrase recovery; ordinary build/run commands do not enroll a workspace. Do not enroll or otherwise mutate the manual workspace as a test side effect.

Current runtime support is a bounded one-owner implementation. Required workspace-local multi-user/AI-user permissions and other future capabilities are not delivered merely because the UI or partially typed API contract exists.


## Stop, reopen and rebuild

Choose **Lock** and await completion, then press Control-C in the terminal for the process you started. The workspace file remains. On reopening:

```sh
./.local/target/release/hypergraph --workspace .local/workspaces/self-build/synthetic.hpx --cert .local/credentials/tls/localhost.pem --key .local/credentials/tls/localhost-key.pem --port 8388
```

Use the newly printed complete launch URL and unlock with the retained passphrase. Startup is locked. Stop this process before rebuilding/replacing its executable; rerun the single production build command, then reopen without `--create`. The running guarded manual app uses its own exact tested binary snapshot: rebuilding this checkout does not update it.


## Local troubleshooting and manual refresh boundary

| Symptom | Action |
| --- | --- |
| Missing locked dependency cache | Obtain the reviewed locked dependencies; do not change versions just to make an offline check pass. |
| Generated API drift/type failure | Investigate Rust DTO/shared/generated outputs through the generator; do not hand-edit the contract or silence the check. |
| Frontend does not reflect a source edit | In development, wait for the rebuild message and reload deliberately; in production, rebuild the executable and restart your separate process. |
| Connected frontend reports 502 | Check the backend origin, process, port and Node trust material; do not disable certificate verification. |
| No authenticated session | Use this process's fresh complete launch URL, not just its origin or an older token. |
| Existing workspace rejected by `--create` | Preserve it and reopen without `--create`; never delete data to make setup succeed. |
| Unsupported/future format | Preserve the file and investigate compatibility; do not reset or silently migrate it. |
| Manual app remains unchanged | Expected: routine development/build/test does not hand off a new binary. |

Manual refresh is a separately guarded milestone action following successful actual integration checks and cleanup, using the exact verified binary hash. It requires the explicit handoff path; this page does not run it, promise automatic refresh or authorize replacement of private launch shortcuts. No real-data acceptance, final integrated test success or release readiness follows from these instructions.

## Rebuild and reopen the existing self-build workspace

```sh
npm run start:self-build
```

This explicit foreground command preserves the former root launcher:umask077;refusal if `.local/workspaces/self-build/synthetic.hpx` is missing;frontend build then `cargo +stable build --workspace --locked`;foreground exec of `.local/target/debug/hypergraph` on port8388 with the approved `.local/credentials/tls/localhost.pem` and `localhost-key.pem`. It takes no arguments except `--help`;it never passes `--create`,installs dependencies,opens a browser,changes trust,enrolls keychain or refreshes the guarded manual app. Stop the process you started before rebuilding;use the fresh private launch URL and retained passphrase. Missing workspace means stop,not reinitialise. The debug diagnostic build counter may advance;this is not the explicit release-build-number command.

## Classified local state and effective Cargo outputs

`.local/` is private and ignored. Ordinary evidence and the mandatory durable append-only build counter live in `.local/artifacts`;approved TLS material and signing inputs in named `.local/credentials/tls` and `signing` groups;manual records,unchanged private shortcuts and exact tested snapshots in `.local/manual-runtime`;persistent workspaces in `.local/workspaces`;pinned tools/caches in `.local/verification`;test results in `.local/test-results`. These are distinct retention classes,not permission for blanket cleanup. Missing recorded manual data must not be recreated or redirected. Legacy records preserve their original PID/argv/origin/workspace facts and require explicit guarded stopped-record migration before operational reuse.

Root `.cargo/config.toml` supplies the default `.local/target`. Maintenance binary consumers use Cargo metadata for the output root,including `CARGO_TARGET_DIR` and Cargo `build.target-dir` configuration. The target subdirectory follows the effective `CARGO_BUILD_TARGET` environment or the helper's explicit `--target` option:

```sh
node shared/tooling/cargo-path.mjs --profile debug
node shared/tooling/cargo-path.mjs --profile release
```

Substitute that effective path for example `.local/target` commands when overriding Cargo configuration. Config-only `build.target` selection is not inferred from Cargo metadata by this helper:export the matching `CARGO_BUILD_TARGET` when using wrappers,or supply `--target <triple-or-target-json>` to the helper. Do not treat its host-profile default as cross-target autodetection. The build counter retains exclusive locking,append-only high-water checks and fsync;failed builds may consume a number. Original required evidence and workspace recovery/history are not evictable caches. No tool here grants trust,provider,keychain enrollment or manual handoff authority. The legacy `serve-manual-runtime.mjs` entry now delegates only to the exact-tested-SHA refresh guard;it cannot synthesize a replacement workspace.
