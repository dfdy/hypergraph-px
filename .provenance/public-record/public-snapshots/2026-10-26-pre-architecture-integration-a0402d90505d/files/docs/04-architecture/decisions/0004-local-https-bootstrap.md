# Existing ADR 0004, retain decision identity/status

## Common metadata

- **ID:** `HPX-ADR-004`
- **Title:** Existing ADR 0004, retain decision identity/status
- **Purpose:** Metadata view of an existing scoped decision; original decision identity and provenance retained.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../system-architecture.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

The underlying decision retains its recorded acceptance. This new editorial wrapper does not expand that decision or imply implemented services.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Status and decision date

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Problem and forces

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Alternatives considered

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Chosen decision



### ADR 0004: local HTTPS bootstrap and embedded runtime

Source `HPX-SRC-0044`, original lines 1–15. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Date: 2026-10-25. Accepted implementation mechanism; installing certificate trust requires explicit owner approval.

The local runtime binds only 127.0.0.1, serves embedded assets and APIs through rustls HTTPS with an explicitly supplied certificate/key, and has no plaintext listener/fallback. Browser hostname verification and OS/browser CA trust remain mandatory. Certificate generation does not imply trust installation. No shared certificate private key is shipped or committed. Development may generate a dedicated local CA/leaf in ignored artifacts; present certificate fingerprint/scope before requesting owner approval to trust it. Do not bypass browser certificate errors.

An OS-random launch capability is delivered in a URL fragment; browser exchanges it through same-origin POST bootstrap and immediately removes it from the address. Capability is not placed in browser storage, referrers or routine request logs. Issue a separate process-lifetime Secure/HttpOnly/SameSite=Strict host-only cookie. Restart rotates both tokens. This is the local user's launch authorization, distinct from storage passphrase unlock. No multi-user/password-login claim. In-memory tokens and decrypted data are not accessible to an unrelated origin through permissive CORS.

Validate exact numeric loopback Host with configured port, same-origin Origin on every POST, JSON content type, one Content-Length, request/header bounds and method. Reject transfer encoding/pipelining and conflicting duplicate security headers. Close each HTTP/1 connection. Use httparse rather than handwritten request syntax parsing; no external proxy trusted headers. No network diagnostics contain source, passphrase, token or payload. TLS/private-key load fails closed; key file restrictive permissions checked on Unix. CSP allows only same-origin scripts/styles/fonts and same-origin connections; no provider calls.

Workspace is locked at launch. Browser unlock submits passphrase over authenticated HTTPS, and creation uses explicit --create. Unlock attempts are serialized/rate limited; keys remain Rust-only. Runtime state owns the unlocked local workspace. Browser Save and Commit use frozen idempotent commands and retain pending operation IDs through uncertain replies within the tab; restart recovery reads durable acknowledged drafts/receipts. Read-only API capability reporting must identify unimplemented services. Lock clears Rust workspace keys and browser source; no keychain/client-held support is claimed.

Initial synchronous local listener uses bounded worker slots and socket deadlines; workspace mutations serialize under a mutex. This supports single-human testing, not high-load/public deployment. Embedded build includes a generated static asset map, not arbitrary disk paths. Builds without prepared frontend assets may build library crates but cannot deliver a runnable editor; runtime build fails with an actionable npm build instruction. Frontend development and embedded runtime must use the same adapter semantics; synthetic HTTP development remains fixture-only.

Primary references: https://docs.rs/rustls/0.23.46/rustls/ ; https://docs.rs/httparse/1.10.1/httparse/ ; https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie . TLS does not replace storage encryption, origin controls or application authorization. Certificate issuance/renewal and trust removal are documented local operator steps; no automatic trust store changes or remote access.


## Consequences and risks

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Revisit triggers

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Affected specifications and tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0044` — `docs/adr/0004-local-https-bootstrap.md`, lines 1–15; SHA-256 `e540f6db076c044420b7f6fddc43dc82cdec6d239e6643ab3125ef364d00a013`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
