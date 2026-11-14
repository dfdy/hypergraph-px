# Frontend delivery implementation audit

- **ID:** `HPX-ARCH-009`
- **Title:** Frontend delivery implementation audit
- **Purpose:** Trace build inputs, embedding, static delivery and browser bootstrap without adopting a V3 packaging or security design.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; development agent records
- **Applies to:** V3 modelling; current single-executable trusted-server delivery slice
- **Upstream authority:** [system architecture](../../04-architecture/system-architecture.md), [local HTTPS decision](../../04-architecture/decisions/0004-local-https-bootstrap.md), [browser/runtime contract](../../06-subsystems/interfaces/browser-runtime.md), [owner decisions](../../02-governance/OWNER_DECISIONS.md)
- **Downstream dependencies:** [delivery C3](../C3/frontend-delivery.c4), [shared C4](../C4/frontend-delivery-overview.c4), [delivery sequences](../Sequence/frontend-delivery-workflows.c4), [source and asset inventory](../evidence/frontend-delivery-inventory.json)
- **Verification:** [initial modelling checks](../evidence/frontend-delivery-validation.json), [C3 re-audit checks](../evidence/frontend-delivery-c3-validation.json); application test sources were reviewed, not executed
- **Decision/history:** Owner requested delivery/bootstrap drill-downs on 2026-10-29. Groupings describe evidence and remain proposed; no packaging, security or compatibility decision is adopted.
- **Last reviewed:** 2026-10-30


Current diagram names and visual entry points are listed in the [navigation map](../navigation.md); earlier checkpoint titles below retain their historical scope.


## Scope and navigation

In **C3 / HPX Rust executable**, click **Frontend delivery** to open **C3 / Frontend delivery**. Within that expansion, **Prepared frontend/dist** opens **C4 / Frontend delivery — Implementation overview**, explicitly named in its description; the other responsibility boxes open focused C4 implementations. This preserves the standing **C1 → C2 → C3 overview → C3 expansions → C4** chain. See [all visual entry points](../navigation.md). Earlier checkpoint shortcut descriptions below are superseded by this owner requirement; their execution evidence remains historical.

The focused C3 is useful because this responsibility crosses three execution phases: build-time tooling and prepared files, resource delivery inside the existing Rust executable, and loading in the browser. Those are presentation groups, not new release services or a code refactor. C4 identifies existing functions, constants, source fragments and their relationships. In particular, the request gate and static branch both belong to `route_inner`; they are not invented handler functions. The Rust-to-browser C4 link denotes response bytes evaluated by the browser platform, not a direct Rust-to-JavaScript function call. The browser's editor and navigation responsibilities remain outside this delivery decomposition.

Ordinary blocks use C2 blue; planned blocks use grey. Status badges remain green/amber/grey for implemented/partial/planned. The embedding responsibility is partial within the stated packaging-assurance scope; its existing code functions are implemented. Neither badge establishes production acceptance. New static connections use one smooth cubic each; build-stage relations are dotted. Sequence views use standard lifelines/messages.

## Evidence and delivery chain

| Stage | Actual source / symbols | Observation |
|---|---|---|
| Inputs and prerequisites | [package.json](../../../frontend/package.json), [package-lock.json](../../../frontend/package-lock.json), [build-cache.mjs](../../../frontend/scripts/build-cache.mjs): `inputIdentity`, `filesUnder` | Node/esbuild and installed dependencies are build-time prerequisites. Identity includes source, installed dependency bytes, legal inputs, configuration and Node/platform/architecture; the lockfile alone is insufficient. Symlinks are rejected; `.bin` is excluded from recursive inventory. |
| Bundle, copy and cache | [build.mjs](../../../frontend/build.mjs): `buildFrontend`; cache: `cachedBuild`, `validEntry`, `assetDigest`, `installDist` | The callback bundles ESM and copies HTML/CSS/logo/KaTeX fonts/notices/LICENSE into a temporary snapshot. Input identity is rechecked before publishing its manifest. A valid cached snapshot can be reused. Default installation copies verified output to `frontend/dist`; matching output is not rewritten. |
| Rust embedding | [build.rs](../../../backend/crates/runtime/build.rs): `main`, `walk` | A separate Rust build requires `dist/index.html`, walks entries in sorted order, rejects symlinks and generates `OUT_DIR/assets.rs` with `include_bytes!`. The generated compiled-version entry replaces the dist version entry. These generated outputs are described through their producer source, not linked as presumed current files. |
| Compiled resources | [main.rs](../../../backend/crates/runtime/src/main.rs): `include!`, `ASSETS` | Byte references become resources inside the one native executable. Runtime delivery does not read a disk web root or need Node, esbuild, a frontend server, a proxy or another database process. |
| Static request/response | `main.rs`: `serve_socket`, `read_request`, `route_inner`, `write_response` | TLS and bounded framing precede routing. Host and cross-site checks precede the non-API GET branch. Root aliases the index; other paths require an exact map key. Unknown keys return 404. Shared response headers/body are written through the TLS stream. |
| Browser entry and session | [index.html](../../../frontend/index.html), [app.js](../../../frontend/src/app.js), [build-version.js](../../../frontend/src/build-version.js), [runtime-adapter.js](../../../frontend/src/runtime-adapter.js): `showBuildVersion`, `initializeRuntime` | The browser loads styles and the app module. Version display starts independently; the module awaits runtime initialization. Fragment exchange, session metadata, explicit unlock and authorized document initialization are separate stages. |

The linked [machine inventory](../evidence/frontend-delivery-inventory.json) retains detailed file hashes, MIME rules and source identities. The as-read dist tree has **68 files**; direct local HTML references and local CSS URLs resolve. This is a static inventory, not a complete dynamic-dependency proof, current-source build attestation or inspection of an executable. The dist version bytes are preview evidence only: Rust replaces that route's content during a build.

## Access and security boundaries

Every embedded non-API GET resource, including HTML, bundle, styles, fonts, notices and build identity, is available **before session authentication and workspace unlock**, subject to TLS, framing, exact Host and cross-site checks. It carries no workspace keys. The parser rejects query strings, fragments and backslashes rather than using them for path traversal or cache-busting; routing has no arbitrary filesystem fallback. Static responses do not issue a session cookie.

The launch capability is removed from the URL with `history.replaceState` before the bootstrap POST. That POST must still pass transport/Host/site/Origin/JSON checks, but has no pre-existing session-cookie prerequisite. `secure_equal` validates the capability and a distinct process-lifetime Secure/HttpOnly/SameSite host cookie establishes the session. The capability is not consumed by this implementation; do not describe it as a one-use token.

The authenticated metadata response can describe a locked workspace. **The browser checks contract/mode/ownership after receiving metadata**; that compatibility decision is not a server authentication gate. Locked startup waits for explicit create/passphrase or enrolled keychain action before document/editor initialization. Each protected operation still has server-side workspace/resource authority checks. Loading assets or receiving capabilities grants neither unlock nor document authority.

HTTPS initialization errors retain an unavailable overlay and rethrow; the app's top-level await prevents silent selection of synthetic fixture documents. The non-HTTPS `return null` branch is a deliberate fixture-preview path, not a live-workspace HTTP fallback. Existing [preview tooling](../../../frontend/server.mjs) and [UI test runner](../../../frontend/scripts/run-ui.mjs) are development context, not release services. Certificate trust remains an operator prerequisite; no warning bypass or automatic trust installation is modelled. Self-delivered trusted-server code does not solve confidentiality against a malicious host; independently trusted client delivery remains an unselected future design.

Exact MIME and security-header policy stays in `route_inner` and `write_response`. Shared responses use `no-store`, `nosniff`, no-referrer, CSP, a body length and connection close. The current CSP permits inline styles. There is no implemented conditional caching/versioned URL policy in this branch. `build-version.json` uses the text/plain fallback, although the client parses its body as JSON. The four-part compiled identity and preview `.0` label are not workspace/schema/API versions or authenticated build provenance.

## Discrepancies and coverage limits

- Rust checks for an index and embeds the prepared tree; it does **not independently verify source freshness, an approved asset allowlist or transitive resource closure**. Existing release embedding intent should not be read as those stronger guarantees. Node's content cache is not test acceptance, signed provenance or a release admission mechanism.
- `installDist` locks, removes, copies and verifies; replacement is **not atomic**. Failure can leave a partial tree. A Rust build invoked independently can consume a stale/partial prepared tree if the index remains. The sequences show the separate invocations rather than implying Cargo automatically runs the frontend build.
- The Rust build counter is appended and synced before the index check; a failed build may consume a number. The compiled version entry overrides the preview file, so a dist-only inventory cannot establish the exact released build identity.
- Current asset lookup/MIME/header behaviour is implemented but narrowly evidenced here. No additional MIME handling, cache policy, resource admission, service worker, update transport or independent client trust mechanism is invented.
- Cache, route/static security and bootstrap-related tests were reviewed in [runtime workflow checks](../../../frontend/scripts/check-runtime-workflow.mjs), [TLS checks](../../../frontend/scripts/check-runtime-tls.mjs), [API client tests](../../../frontend/tests/api-contract.test.js) and inline Rust tests. Historical HPX-TEST-072 cache evidence remains historical. None of those application tests ran for this modelling task, and existing tests do not become exhaustive packaging/security assurance by being referenced.

## Open V3 questions for the owner

1. What should authorize a prepared asset tree for release: source identity, declared inventory/closure, reproducibility or signed provenance? Which guarantees are requirements, and where should they be enforced?
2. Should dist installation/build handoff have an atomic or immutable-snapshot contract? What compatibility and recovery behaviour should be required for interrupted preparation?
3. Should public build identity, exact MIME coverage, cache policy and URL rules change? Current behaviour is documented without selecting replacements.
4. What client-delivery trust boundary is required beyond trusted-server mode? How should it affect launch/session recovery without conflating authentication, unlock and resource authority?

## Executed verification

LikeC4 1.60.0 export/validation, source/symbol/path checks, delivery-chain coverage, sequence flow/navigation checks, saved-layout preservation, curve/label/containment checks and protected-input hashes are recorded in [validation evidence](../evidence/frontend-delivery-validation.json), with HPX-TEST-094 in the existing register. Static native AppKit approximations were inspected for spacing and routing; they omit some LikeC4 features and do not constitute actual VS Code/webview or sequence visual acceptance. No browser, frontend build, Rust compile/app launch, contract/asset regeneration, application regression, trust/provider/workspace action, commit or publication was performed.

## C3 input/output and internal audit, 2026-10-30

HPX-TEST-097 records a specification/code re-audit of the C3 diagram itself. The [checklist](../evidence/frontend-delivery-c3-audit.json) separates visible inputs/transforms/outputs from prerequisites and workflows owned by linked views; [executed checks](../evidence/frontend-delivery-c3-validation.json) record this checkpoint separately from HPX-TEST-094.

| Area | Finding and C3 correction |
|---|---|
| Frontend inputs | Build scripts, cache configuration and the logo were insufficiently traceable in the input element. Paths/caption now cover source/HTML/CSS/logo, installed dependencies, build configuration/legal inputs and Node identity. |
| Rust build identity | Cargo version and the local compile counter fed the compiled-version override but had no input box/connection. Added a build-time artifact linked to the actual producer and OWNER011; it is not workspace data or authenticated release provenance. |
| Rejected asset requests | Host/cross-site checks could reject before asset selection, but that dependency on existing error/response handling was missing. Added it without inventing a handler or service. |
| Request/output scope | Replaced the combined assets/bootstrap request label with static asset GETs. Response text now covers asset bytes and safe errors via the existing TLS stream; embedded outputs explicitly include fonts/notices/build identity. |
| Existing responsibilities | Cache/preparation, sorted embedding, compiled resources, TLS/framing, exact lookup/MIME/404 and shared headers are present. Original boxes/curves remain; the build group expands to accommodate one new input. |
| Linked scope | Certificate/key/trust and startup remain in Runtime C3. Session bootstrap, explicit unlock and resource authorization follow asset loading in their existing views/sequences. Build failure diagnostics remain in the build sequence/report. No application behaviour or new C4 decomposition is added. |

The diagram now covers the evidenced asset-delivery inputs, outputs and responsibilities at C3 scope; this does not establish every broader specification guarantee. Prepared-tree admission/freshness and non-atomic dist installation remain as previously reported, and the JSON MIME fallback is unchanged. ADR004's retained same-origin-style wording does not explicitly settle the current `style-src 'self' 'unsafe-inline'` allowance: record the difference for owner policy review rather than silently approving an exception or tightening application CSP. Historical system-architecture statements that transport was unimplemented retain their original checkpoint scope; current code/ADR004 evidence is separately identified.

No frontend build, Rust compile/app launch, browser, asset/API regeneration, trust/provider/workspace action, proof tool, commit or publication was performed.

## Frontend hierarchy reconciliation, 2026-10-30

HPX-TEST-098 refines the hierarchy using the previous I/O audit, ADR004, owner decisions, actual build/cache/embedding/request/bootstrap code and relevant test sources. This is a proposed architectural interpretation within the existing specifications' recorded authority; it neither adopts V3 boundaries nor renews test, packaging or security acceptance. The Rust engine entry and C3 geometry remain intact. Frontend delivery covers packaging and byte delivery; TLS setup/API authority remain Runtime/API responsibilities, while editor/navigation behaviour executes in the browser.

| C3 responsibility or context | C4 destination | Actual implementation and scope |
|---|---|---|
| Frontend build tooling (development) | `c4_frontend_build` — **Frontend build tooling (development) — Implementation** | [build.mjs](../../../frontend/build.mjs) `buildFrontend`; [build-cache.mjs](../../../frontend/scripts/build-cache.mjs) `inputIdentity`, `cachedBuild`, `validEntry`, `assetDigest`, `installDist`. Source/dependency/config/legal inputs and prepared dist are supporting artifacts. |
| Rust asset embedding | `c4_frontend_embedding` — **Rust asset embedding — Implementation (shared)** | [build.rs](../../../backend/crates/runtime/build.rs) `main`, `walk`, Cargo version and compile counter; generated map and version are described through their producer. |
| Compiled frontend resources | Same shared embedding view | [main.rs](../../../backend/crates/runtime/src/main.rs) `include!` / `ASSETS`, generated `include_bytes!`. Shares the embedding producer; no artificial one-box view. |
| Embedded-asset routing | `c4_frontend_routing` — **Embedded-asset routing — Implementation (shared)** | `route_inner` static branch, exact compiled-map read and MIME/body selection; `serve_socket` is the actual caller/stream owner. |
| Asset request checks | Same shared routing view | Existing `route_inner` Host/site fragments precede the public static branch. This is not a separate handler function. Later session/unlock/resource gates remain in Runtime/API. |
| Responses, errors and security headers | Same shared routing view | Existing `error`, `json`, `write_response` and return through the socket caller. A descriptor/IO return is data, not a call to a new error service. |
| Rust identity, frontend source and prepared output | Supporting artifacts in build/embedding views; prepared-output C3 box also opens shared overview | Trace to the actual consumers/producers above; do not assign implementation components to every artifact. |
| Bounded HTTPS / browser context | Existing Runtime/API views and frontend load/session sequences | [main.rs](../../../backend/crates/runtime/src/main.rs) `serve_socket`, `read_request`, `route`; [index.html](../../../frontend/index.html), [app.js](../../../frontend/src/app.js), [build-version.js](../../../frontend/src/build-version.js), [runtime-adapter.js](../../../frontend/src/runtime-adapter.js), [api-client.ts](../../../frontend/src/api-client.ts). Browser evaluation is a platform action, not a Rust-to-JavaScript call. |

The stable `c4_frontend_delivery` ID is retained as **Frontend delivery — Implementation (shared overview)** under Frontend delivery rather than being scoped to Compiled frontend resources. Its contributing C3 responsibilities are named in the view description; it preserves the original code boxes/curves and leads to the matching focused views. Intermediate model ancestors are explicitly excluded from this projection so the corrected scope does not add unwanted boxes or rearrange the owner's diagram. Existing code aliases are reused; only actual socket-entry and error-helper fragments receive new aliases. Solid links mean calls/branch control; dotted links mean build/data dependencies or returned descriptors. Group captions distinguish development build, native runtime and browser execution. The three focused views contain 4, 4 and 10 connections respectively.

### Reconciled sequences and remaining gaps

The existing build, loading and session sequence IDs are reused. Build sequencing now separates counter/version failure from subsequent tree/map generation; failed builds can consume a number. Browser loading includes the shared state-lock/deadline rejection before routing and distinguishes local writer success from actual browser receipt and makes ignored write/flush errors explicit. The session sequence distinguishes a completed exchange from a failed fetch/reply: the launch fragment has already been removed, server outcome may be unknown, startup throws and there is no automatic bootstrap retry/reconciliation mechanism. The implemented unavailable overlay tells the owner to reopen the private launch URL; that manual hint is not absent recovery. Metadata fetch/reply failure is also explicit. These are frontend/bootstrap limits, distinct from command receipt recovery.

The earlier freshness/admission, non-atomic dist replacement, JSON MIME fallback and CSP inline-style questions remain **unresolved**. Exact asset inventories, MIME and headers stay in linked source and historical inventory records. Public static resources still precede authentication/unlock but retain TLS/framing/Host/site checks. Version display remains best effort; protected reads, explicit unlock and resource authority are not implied by successful page loading. Node/esbuild remain build dependencies; one native executable embeds resources and SQLite.

Additional owner questions: what observable delivery diagnostics, if any, should replace ignored writer errors; and what launch recovery experience should follow a lost bootstrap reply after fragment removal? No retry, cookie reconciliation, new transport, tighter CSP, MIME or packaging policy is selected here.

[Hierarchy/source coverage](../evidence/frontend-delivery-hierarchy.json), [sequence flow evidence](../evidence/frontend-delivery-hierarchy-workflows.json) and [executed validation](../evidence/frontend-delivery-hierarchy-validation.json) distinguish the current checks from HPX-TEST-094/097. Application test sources were reviewed, not run. Static native approximations were inspected for the three new layouts; they are not actual VS Code/UML visual acceptance. No browser, app/frontend build or launch, generation, proof tool, trust/provider/workspace action, commit or publication was performed.

