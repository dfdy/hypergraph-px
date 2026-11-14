# Shared contracts

- `openapi.json` is the sole generated OpenAPI 3.1 document. Rust **adapter** DTOs in `backend/crates/runtime/src/api.rs` and the exporter define its source; the domain remains dependency-free. Do not maintain a second handwritten contract.
- `predicate-catalog-v1.json` is the existing catalogue, consumed by the Rust storage adapter and browser relationship catalogue without changing its version or bytes.

From the root, `npm run api:check` verifies the contract, generated frontend artifacts, conservative compatibility and strict client typing. Intentional compatible regeneration uses `npm --prefix frontend run api:generate`. Browser traffic goes through `frontend/src/api-client.ts` (`openapi-fetch`) and the existing application services; types are generated with `openapi-typescript`.

All 36 current routes are inventoried, but some payloads remain explicitly route-only/unknown. This move does not complete V3 wire schemas, the shared multi-user permission model, MCP or storage-format acceptance. [Precise boundary](../docs/06-subsystems/interfaces/browser-runtime.md).
