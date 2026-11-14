# Runtime and API C3 specification audit

- **ID:** `HPX-ARCH-007`
- **Title:** Runtime and API C3 specification audit
- **Purpose:** Trace runtime startup, secure request handling, workspace lifecycle and API boundaries to specifications and actual code without adopting unresolved mechanisms.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; development agent records
- **Applies to:** V3 modelling; current local trusted-server API1 slice and explicitly planned non-browser access
- **Upstream authority:** [component architecture](../../04-architecture/component-architecture.md), [HTTPS bootstrap decision](../../04-architecture/decisions/0004-local-https-bootstrap.md), [keychain decision](../../04-architecture/decisions/0014-keychain-unlock-policy.md), [runtime contract](../../06-subsystems/interfaces/browser-runtime.md), [owner decisions](../../02-governance/OWNER_DECISIONS.md)
- **Downstream dependencies:** [focused model](../C3/runtime-api.c4), [engine overview](../C3/executable.c4), [source and route inventory](../evidence/runtime-api-inventory.json)
- **Verification:** [modelling checks](../evidence/runtime-api-validation.json); existing application test source is inventory, not a new execution claim
- **Decision/history:** Owner requested a specification-grounded Runtime/API C3 view on 2026-10-29. Logical responsibilities remain proposed; no code refactor, new transport, trust/provider action or publication is adopted.
- **Last reviewed:** 2026-10-29


Current diagram names and visual entry points are listed in the [navigation map](../navigation.md); earlier checkpoint titles below retain their historical scope.


## Scope and navigation

Click **Runtime and API** in the engine view to open **C3 / Runtime and API**. Context components link back to the engine/C2 views. This is a focused responsibility decomposition inside the existing Rust executable, not eight selected crates/services or a complete C4 symbol model. Seven current responsibilities are shown, plus one planned client-access responsibility. Most share `main.rs` and even the same `route_inner` function. Existing implementation is evidence, not a retroactive requirement.

The offline exporter/client tooling is outside the runtime box. It is not a second release executable requirement, HTTP schema service or background Node process. Startup, sessions, locked workspace state and application resource authority remain separate. C2 blue/grey fills, fixed status badges and simple smooth curves are retained.

## Responsibility and source mapping

| Responsibility | Status | Principal implementation paths/symbols | Specification obligations |
| --- | --- | --- | --- |
| Startup and process state | implemented | [crates/runtime/src/main.rs](../../../backend/crates/runtime/src/main.rs)<br>`run`, `main`, `State`, `token` | [0004-local-https-bootstrap](../../04-architecture/decisions/0004-local-https-bootstrap.md)<br>[system-architecture](../../04-architecture/system-architecture.md) |
| Bounded HTTPS and HTTP framing | implemented | [crates/runtime/src/main.rs](../../../backend/crates/runtime/src/main.rs)<br>[crates/runtime/Cargo.toml](../../../backend/crates/runtime/Cargo.toml)<br>`run`, `serve_socket`, `DeadlineSocket`, `read_request` | [0004-local-https-bootstrap](../../04-architecture/decisions/0004-local-https-bootstrap.md)<br>[browser-runtime](../../06-subsystems/interfaces/browser-runtime.md)<br>[security-cryptography](../../06-subsystems/security-cryptography.md) |
| Request, session and lock gates | implemented | [crates/runtime/src/main.rs](../../../backend/crates/runtime/src/main.rs)<br>`route_inner`, `secure_equal`, `State` | [0004-local-https-bootstrap](../../04-architecture/decisions/0004-local-https-bootstrap.md)<br>[browser-runtime](../../06-subsystems/interfaces/browser-runtime.md)<br>[security-cryptography](../../06-subsystems/security-cryptography.md) |
| Embedded-asset routing | implemented | [crates/runtime/src/main.rs](../../../backend/crates/runtime/src/main.rs)<br>[crates/runtime/build.rs](../../../backend/crates/runtime/build.rs)<br>`route_inner`, `ASSETS` | [0004-local-https-bootstrap](../../04-architecture/decisions/0004-local-https-bootstrap.md)<br>[frontend-interaction](../../06-subsystems/frontend-interaction.md) |
| API dispatch and wire adapters | partial | [crates/runtime/src/main.rs](../../../backend/crates/runtime/src/main.rs)<br>[crates/runtime/src/api.rs](../../../backend/crates/runtime/src/api.rs)<br>[crates/runtime/src/api_transport.rs](../../../backend/crates/runtime/src/api_transport.rs)<br>`route_inner`, `decode`, `api_transport::decode_command`, `api_transport::fork_receipt` | [component-architecture](../../04-architecture/component-architecture.md)<br>[browser-runtime](../../06-subsystems/interfaces/browser-runtime.md)<br>[domain-navigation](../../06-subsystems/interfaces/domain-navigation.md)<br>[draft-publication](../../07-implementation/protocols/draft-publication.md) |
| Workspace session lifecycle | implemented | [crates/runtime/src/main.rs](../../../backend/crates/runtime/src/main.rs)<br>[crates/runtime/src/api.rs](../../../backend/crates/runtime/src/api.rs)<br>`State`, `route_inner`, `api::RuntimeResponse::new` | [0014-keychain-unlock-policy](../../04-architecture/decisions/0014-keychain-unlock-policy.md)<br>[browser-runtime](../../06-subsystems/interfaces/browser-runtime.md)<br>[workspace-storage](../../06-subsystems/workspace-storage.md) |
| Responses, errors and security headers | partial | [crates/runtime/src/main.rs](../../../backend/crates/runtime/src/main.rs)<br>[crates/runtime/src/api.rs](../../../backend/crates/runtime/src/api.rs)<br>`json`, `error`, `storage_error`, `route`, `write_response` | [0004-local-https-bootstrap](../../04-architecture/decisions/0004-local-https-bootstrap.md)<br>[browser-runtime](../../06-subsystems/interfaces/browser-runtime.md)<br>[draft-publication](../../07-implementation/protocols/draft-publication.md) |
| Future API / MCP access | planned | No implementation selected | [component-architecture](../../04-architecture/component-architecture.md)<br>[browser-runtime](../../06-subsystems/interfaces/browser-runtime.md)<br>[security-cryptography](../../06-subsystems/security-cryptography.md) |

## Request paths and security ordering

1. Startup selects an explicit workspace/create mode and supplied TLS certificate/private key, validates the supported loopback configuration, initializes locked state and fresh process tokens, then starts the bounded listener. It does not install trust or enroll keychain custody.
2. The listener/framer bounds request bytes, headers, worker slots and underlying socket time. It parses HTTP before serializing route handling under the existing state mutex. The deadline is checked after obtaining the mutex, before starting a queued route; it cannot cancel a storage/KDF operation already running.
3. Host/cross-site and POST Origin/JSON-content-type checks precede route selection. Static non-API GET serves only the embedded map before session/workspace unlock. Bootstrap exchanges the fragment-delivered launch capability for a distinct secure cookie; this is process-local launch authorization, not multi-user login or document authority.
4. Runtime metadata and explicitly supported lifecycle/status calls retain their locked-state availability. Default passphrase create/open and enrolled keychain unlock are explicit and throttled. Enrollment/removal require an unlocked owner, delegated backup/upgrade/cleanup checks, and retain passphrase recovery. Lock drops `Option<Workspace>` and Rust-held keys.
5. Other data APIs require the authenticated session and unlocked workspace. Wire adapters preserve IDs, exact source bytes and frozen operations; application/storage perform resource authority before protected receipt replay and publication. Read methods are scoped workspace calls, not reads through `Workspace::execute`. Draft acknowledgement remains distinct from Commit; unknown outcomes reconcile the original operation.
6. Shared output handling serializes results/errors and writes length, close/no-store, no-referrer, nosniff and same-origin CSP. Opt-in problem details apply to routed errors; parser/deadline/unavailable-state failures constructed outside `route` retain legacy errors. Diagram returns are implicit, rather than reverse dependency arrows from pure services.

The focused view has 13 source-linked dependency records plus three refined existing incoming relationships. Only the existing owner/browser/future-client relationship targets are refined to startup/HTTPS/planned-client details. They project to the same C1/C2 boundaries. The engine overview keeps its 25 visible connections and owner geometry; planned client-to-application flow is excluded from its solid current-command aggregation, and remains explicit in this focused view.

## Current API catalogue and limits

The read-only inventory matches **all36** API literals in current runtime source to existing generated OpenAPI paths: **11 typed**, **two typed-response**, **one typed committed-Fork/legacy-command mixture**, and **22 route-only** operations. Bootstrap is a security responsibility; seven metadata/lock/unlock/keychain paths belong to lifecycle; the remaining28 belong to application dispatch. Static frontend GET is outside that API route count. Full paths, methods, coverage and body compatibility are in the [machine inventory](../evidence/runtime-api-inventory.json).

Typed definitions and generated TypeScript do not implement runtime authorization, domain validity, range/source ownership or storage durability. `api.rs` plus adapter DTOs own wire schemas; pure domain remains serialization-free. The normal binary serves no schema endpoint. The optional `hypergraph-api` exporter and Node/TypeScript generation/check scripts are development tools. No generation, compilation or application test suite was run during this modelling task.

## Discrepancies and V3 design questions

| Evidence or competing scope | Treatment in the model / review question |
| --- | --- |
| Retained early runtime-contract passages say no HTTP/server/graph implementation and show candidate REST routes. Later bounded contracts and code contain a local server, graph/history and36 API1 paths. | Keep early passages as dated source evidence; the diagram inventories current bounded behavior without adopting the old candidate endpoint catalogue or revoking accepted semantics. |
| Generated-contract prose lists earlier typed slices; the current source/generated schema additionally has typed keychain enroll/remove and typed-response documents/Lock. The development-state checkpoint still names the latter as next work. | Report the source as observed, not as a new verified delivery or manual-runtime refresh. No application checkpoint is silently advanced. |
| ADR014/older route prose describes strict empty-object lifecycle input, while existing `EmptyRequest` Serde/schema compatibility also accepts an empty sequence; documents/Lock intentionally ignore bodies. | Preserve current acceptance. Decide the V3 canonical shape and any versioned compatibility evolution explicitly; a diagram is not authority to tighten the wire contract. |
| Complete target API, authentication/permission/error/negotiation support exceeds current partial schemas and process-local launch-cookie model. | Decide priorities for compatible schema coverage and future client identity/scope. No general login, protocol negotiation or new authentication scheme is selected here. |
| MCP/non-browser product access remains proposed; HTTP test clients already exercise local APIs. | Test-client feasibility is not product acceptance of MCP, a remote API or provider integration. Future access must share application authority/expected-state/receipt semantics; its wire/auth design remains open. |
| Ten-second socket deadlines and16 workers do not bound the duration of an executing transaction/KDF; one mutex serializes all route handling. | Preserve the actual limits. Review cancellation/concurrency only with concrete workload and transaction/unknown-outcome evidence; do not invent an async engine or finer locks. |
| Supplied TLS keys and approved trust provisioning establish local transport; renewal/removal, multi-platform trust acceptance and independently trusted client delivery remain separate concerns. | Keep operator trust actions explicit. No HTTP fallback, warning bypass, automatic CA installation, public listener, WSS channel or client-held mode is introduced. WSS is required only if a future WebSocket channel is adopted. |
| Error negotiation is partial and retained response schemas do not cover every source proposal's recovery detail. | Preserve stable codes/legacy clients while reviewing future compatible errors; do not silently add transport/protocol versions. |

## Validation boundary

The modelling record verifies component/source links, all36 route dispositions, four view layouts and click-through, preserved existing overview geometry, semantic palettes, planned/build-time styling, simple cubic curves and unchanged application/proof inputs. Native AppKit preview inspection is a geometry approximation, not actual VS Code webview acceptance. Existing runtime/codec/schema/transport tests are named in the inventory but were not rerun; no new security/durability/proof acceptance follows. No application code, provider/trust state, manual workspace, build counter, version or publication was changed.

## C4 implementation and workflow navigation, 2026-10-29

The owner-requested [C4 audit](api-implementation-audit.md) maps all36 routes into eight real code families and adds Unlock, Save, Commit and uncertain-result sequence views. In the Runtime/API diagram, API dispatch and security gates open C4; lifecycle opens Unlock. The existing C3 component/layout scope is preserved. C4 symbols are source fragments/method sets, not a new module design. HPX-TEST-093 records executed modelling checks only.

Frontend delivery now has a [focused C3/C4 and build/load/session drill-down](frontend-delivery-audit.md); its links reuse the existing guards and bootstrap code. This extends modelling coverage only.

Keychain, crypto and persistence context links now open their [focused C3 responsibility views](c3-coverage-audit.md). This extends navigation/coverage without changing runtime behaviour or earlier executed evidence.
