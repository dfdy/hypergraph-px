# Security and Cryptography

## Common metadata

- **ID:** `HPX-SUB-012`
- **Title:** Security and Cryptography
- **Purpose:** Key custody, secure loopback transport and future core confidentiality restrictions.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../04-architecture/system-architecture.md>); [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Fixture controls and future contracts are not durable service implementations. Capabilities must report unavailable honestly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Responsibilities and boundaries

Key custody, secure loopback transport and future core confidentiality restrictions. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Inputs and outputs

Key custody, secure loopback transport and future core confidentiality restrictions. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## State and operations



### 8. Security, preferences and later integrations

Source `HPX-SRC-0028`, original lines 158–173. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Local live serving must bind loopback by default and validate Host/origin, same-origin requests and CSRF protection for cookie-authenticated mutation. Do not enable permissive CORS to connect a hosted mockup. Keep authentication, display preferences and storage unlock distinct. Server-derived actors/device authority, not submitted labels, authorize operations. Protect sensitive API responses and exports from unintended caches and logs; select exact headers, cookies and CSP in the transport/security contract before real data integration.

Display preferences may contain only validated theme, wrap width, editor font size, minimap visibility, panel widths/proportions, Navigator visibility/left-right placement, collapsed states, selected tab/lens, authorship-colour visibility and maths Source/Rendered mode, with a schema version and defaults for corrupt/unsupported values. Persistence mechanism, name and lifetime are UI choices, not an authentication or data format. Never store text, document IDs, drafts, proposals, credentials, keys or permission grants with preferences. Blocking preference persistence must not prevent editing. Browser zoom is separate from editor font size.

| Later feature | Required frontend boundary |
|---|---|
| Agent | Mock before live calls; preview exact disclosure, require explicit permission, keep model/human identities distinct; output is a proposal, never a self-approved command; cancellation cannot undo disclosure |
| Comments/annotations | Exact anchored source/context/state, independent from chat; show unresolved/ambiguous/stale anchors rather than attaching to similar text silently |
| Export | Distinguish temporary local-buffer downloads from exact committed/acknowledged-draft exports; neither is autosave or implicit commit (§8.4) |
| GitHub document publication | Optional external disclosure/job workflow with its own authorization, frozen review and remote concurrency/reconciliation gate (§8.5) |
| Zotero | Read-only scoped lookup/selection; connection types/URLs/credentials separately specified; preserve exact cited metadata for reconstruction, no library write-back implied |
| History/branches/graph | Exact authorized projections, bounded traversals, explicit comparison/integration, no live-head substitution in historical views |
| Client-held/federated | Remain unavailable until their dedicated designs/tests pass; no silent server plaintext delegation, key upload or configuration downgrade |

### Medium-term priority: encrypted runtime communication

Source `HPX-SRC-0028`, original lines 311–315. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Before connecting real document data or sending runtime credentials/unlock inputs, require authenticated encrypted browser/runtime transport, including on loopback. Use trusted HTTPS for frontend bootstrap/assets, API and streaming, and WSS for any WebSockets; reject certificate failures and plaintext downgrade. Keep the synthetic-only HTTP preview separate. TLS does not replace origin/session/authorization controls or client-held content confidentiality. See [transport security](<security-cryptography.md>) for development/release parity, certificate lifecycle decisions and acceptance gates.

### Encryption and key-custody specification

Source `HPX-SRC-0024`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: current requirements and implemented adapter contract, 2026-10-24. [ADR 0002](<../04-architecture/decisions/0002-trusted-server-envelopes.md>) records mechanism rationale; [the crypto API reference](<interfaces/crypto-adapter.md>) documents actual signatures, errors and costs. This is not a claim of a complete encrypted workspace.

### Modes and authority

Source `HPX-SRC-0024`, original lines 5–14. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Trusted-server mode is the initial/default delivery mode. An unlocked trusted Rust process holds permitted plaintext and keys for editing, navigation, search, compilation and explicitly approved integrations. Protect complete historical content and sensitive derived state at rest, including manifests, provenance, indexes, drafts and backups. Plaintext exports/provider disclosures require explicit scope; incidental working files, temporary files and logs must not defeat confidentiality.

Passphrase storage unlock is the default; support an explicit OS-keychain alternative before claiming complete startup-unlock support. Login authentication is separate from storage-key unlock. The passphrase wrapping primitive exists; the OS-keychain and application startup flows do not yet exist.

Client-held mode remains unavailable until implemented. Its server stores/relays ciphertext without acquiring client-only keys. Plaintext operations execute at an authorized client or report unsupported. Configuration cannot create decryption capability or silently downgrade custody. Authenticated workspace/group policy must govern mode changes and key migration while preserving logical identities.

Future client-held recovery uses a user-held recovery key; server account reset cannot recover client-only content. Keep both browser-only and independently trusted client paths. Protection against a malicious hosting server changing editor code requires the independently trusted client/update channel; browser-only confidentiality excludes malicious client-code delivery.

### Implemented cryptographic primitives and contexts

Source `HPX-SRC-0024`, original lines 31–38. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Use RustCrypto XChaCha20-Poly1305 authenticated encryption with independent OS-generated 32-byte data keys and fresh 24-byte nonces. Use Argon2id v19 to derive a passphrase key-encryption key: exactly 65,536 KiB memory, 3 passes, 1 lane, 32-byte output, random 16-byte salt. Passphrases are 1–1024 raw bytes with no normalization. Reject all unsupported profiles before expensive derivation. Application-level unlock serialization/rate limits remain required; per-call bounds do not bound concurrent aggregate work.

`Context` contains workspace ID[16], logical binding ID[32], purpose[1] and key epoch u64. Purpose tags are Revision=1, Manifest=2, Snapshot=3, Transformation=4, Draft=5, Index=6. The authorized application supplies the expected context independently of untrusted envelope bytes. This adapter neither chooses domain identities nor authorizes access. Logical binding IDs are not public plaintext hashes; content equality must not disclose cross-domain equality by default.

`StorageAddress` is SHA-256 of the complete encrypted bytes. It is a physical lookup address, not a logical revision identity, content commitment or integrity/permission grant. Re-encryption changes physical addresses while logical identities stay fixed. A full private-commitment/signature/catalogue scheme remains unimplemented.

### Future sharing and lifecycle obligations

Source `HPX-SRC-0024`, original lines 68–73. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Model users, devices, groups and authenticated policy now. Future initial sharing scope is workspace/document; full retained history requires explicit grant. Current-state sharing must define disclosure of nested dependencies/provenance and hidden or opaque inaccessible references. Current read permission does not imply all historical keys. Revocation cannot erase content/keys already disclosed.

Specify data-key hierarchy, domain separation, rotation, historical grants, recovery and mode migration before implementing those capabilities. Separate group transport/key agreement from graph synchronization, authorization, conflict resolution and archival access. MLS may be evaluated for group transport; no federation/group cryptographic protocol is adopted here.

### Browser–runtime channel priority

Source `HPX-SRC-0024`, original lines 79–81. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Encrypted authenticated transport is an important medium-term requirement in every key-custody mode, including local loopback. Storage AEAD and client-held content encryption do not replace HTTPS/WSS or runtime endpoint authentication. See [transport security](<security-cryptography.md>) for the real-data integration gate and certificate trust/bootstrap obligations. No browser/runtime TLS channel is implemented by this byte-encryption adapter or synthetic preview.

### Browser–runtime transport security

Source `HPX-SRC-0035`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: important medium-term priority; required design and acceptance gate for connecting the browser editor to real runtime data. Not implemented. The current loopback HTTP preview serves synthetic fixtures only and has no Rust API connection.

### Required channel

Source `HPX-SRC-0035`, original lines 5–12. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Encrypt and authenticate communication between the browser and Rust runtime in both trusted-server and future client-held modes, including on localhost/loopback. Use established TLS via HTTPS for assets/bootstrap and HTTP API traffic; use WSS for any WebSocket channel. Streaming responses/events, document source, comments, provenance, credentials, unlock inputs and errors carrying sensitive context must use the protected channel. Loopback binding and browser secure-context treatment alone do not provide channel encryption.

The browser must authenticate the intended runtime endpoint with a valid, trusted certificate. Certificate failures, hostname mismatch or missing trust stop the real-data connection; do not instruct users to bypass warnings or silently fall back to HTTP/WS. A plaintext discovery/redirect listener, if later needed, must never accept secrets or serve application data. Browser frontend code must be delivered through the trusted bootstrap path; secure API calls cannot compensate for substituted client code.

Transport encryption is separate from storage encryption, authentication/authorization and client-held end-to-end confidentiality. TLS terminates at the runtime in trusted-server mode, where that trusted process may see authorized plaintext. In client-held mode, TLS does not grant the runtime content keys or override the core egress restrictions. It cannot protect against a compromised endpoint or malicious code already trusted by the client.

### Runtime and development boundaries

Source `HPX-SRC-0035`, original lines 13–20. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The release remains one Rust executable with embedded frontend assets and owned secure transport startup. Do not require a separate TLS proxy as the sole supported local release path. Keep certificate/private-key lifecycle separate from content-key lifecycle; never commit or ship a shared server private key.

Before implementation, record an ADR for loopback certificate issuance and browser/OS trust provisioning, supported hostnames, first-run bootstrap, key storage/permissions, renewal/expiry, revocation/removal and restart/upgrade behavior. Select a maintained TLS implementation and supported configuration through dependency/security review. No certificate provider, TLS library or version profile is selected by this specification.

A separate frontend development server may remain for synthetic fixtures. Before it handles real data, specify trusted HTTPS asset delivery and the protected browser-to-runtime path. Any development proxy/streaming setup must preserve the same transport guarantees; no plaintext network hop carrying runtime data, credentials or unlock inputs. Browser-facing origin, cookie/session, CSRF and Host checks remain required independently of TLS. Keep loopback binding for the initial local-only deployment; encryption does not enable remote access or federation.


## Invariants and error behavior

Key custody, secure loopback transport and future core confidentiality restrictions. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Dependencies and interfaces

Key custody, secure loopback transport and future core confidentiality restrictions. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Security and privacy

Key custody, secure loopback transport and future core confidentiality restrictions. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 158–173; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 311–315; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 1–4; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 5–14; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 31–38; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 68–73; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 79–81; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0035` — `Specifications/TRANSPORT_SECURITY.md`, lines 1–4; SHA-256 `96688214826d64bb9d96f01f98c3f717c7327c9e8ec8487eb461bc71098fa0eb`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0035` — `Specifications/TRANSPORT_SECURITY.md`, lines 5–12; SHA-256 `96688214826d64bb9d96f01f98c3f717c7327c9e8ec8487eb461bc71098fa0eb`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0035` — `Specifications/TRANSPORT_SECURITY.md`, lines 13–20; SHA-256 `96688214826d64bb9d96f01f98c3f717c7327c9e8ec8487eb461bc71098fa0eb`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
