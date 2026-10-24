# Browser–runtime transport security

Status: important medium-term priority; required design and acceptance gate for connecting the browser editor to real runtime data. Not implemented. The current loopback HTTP preview serves synthetic fixtures only and has no Rust API connection.

## Required channel

Encrypt and authenticate communication between the browser and Rust runtime in both trusted-server and future client-held modes, including on localhost/loopback. Use established TLS via HTTPS for assets/bootstrap and HTTP API traffic; use WSS for any WebSocket channel. Streaming responses/events, document source, comments, provenance, credentials, unlock inputs and errors carrying sensitive context must use the protected channel. Loopback binding and browser secure-context treatment alone do not provide channel encryption.

The browser must authenticate the intended runtime endpoint with a valid, trusted certificate. Certificate failures, hostname mismatch or missing trust stop the real-data connection; do not instruct users to bypass warnings or silently fall back to HTTP/WS. A plaintext discovery/redirect listener, if later needed, must never accept secrets or serve application data. Browser frontend code must be delivered through the trusted bootstrap path; secure API calls cannot compensate for substituted client code.

Transport encryption is separate from storage encryption, authentication/authorization and client-held end-to-end confidentiality. TLS terminates at the runtime in trusted-server mode, where that trusted process may see authorized plaintext. In client-held mode, TLS does not grant the runtime content keys or override the core egress restrictions. It cannot protect against a compromised endpoint or malicious code already trusted by the client.

## Runtime and development boundaries

The release remains one Rust executable with embedded frontend assets and owned secure transport startup. Do not require a separate TLS proxy as the sole supported local release path. Keep certificate/private-key lifecycle separate from content-key lifecycle; never commit or ship a shared server private key.

Before implementation, record an ADR for loopback certificate issuance and browser/OS trust provisioning, supported hostnames, first-run bootstrap, key storage/permissions, renewal/expiry, revocation/removal and restart/upgrade behavior. Select a maintained TLS implementation and supported configuration through dependency/security review. No certificate provider, TLS library or version profile is selected by this specification.

A separate frontend development server may remain for synthetic fixtures. Before it handles real data, specify trusted HTTPS asset delivery and the protected browser-to-runtime path. Any development proxy/streaming setup must preserve the same transport guarantees; no plaintext network hop carrying runtime data, credentials or unlock inputs. Browser-facing origin, cookie/session, CSRF and Host checks remain required independently of TLS. Keep loopback binding for the initial local-only deployment; encryption does not enable remote access or federation.

## Acceptance gate

Before enabling a real-data editor connection:

- Verify trusted HTTPS startup and browser access from a clean supported-machine profile, with documented first-run trust and renewal procedures.
- Verify API requests/responses, assets, streaming and optional WebSockets use protected channels; reject mixed content, HTTP/WS downgrade and invalid/mismatched/expired certificates.
- Verify authentication, authorization, origin/Host/session controls and workspace unlock semantics remain enforced through both embedded-release and development paths.
- Verify private-key permissions/storage, renewal failure, restart and trust removal fail safely, without plaintext fallback or sensitive diagnostics.
- Verify representative payloads cannot be read or modified by an observer on the transport path, while documenting endpoint and local trust-store limits.

No transport implementation, cryptographic proof or delivered confidentiality guarantee is claimed by these requirements.
