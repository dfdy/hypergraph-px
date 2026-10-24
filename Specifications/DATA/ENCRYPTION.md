# Encryption and key-custody specification

Status: current requirements and implemented adapter contract, 2026-10-24. [ADR 0002](../../docs/adr/0002-trusted-server-envelopes.md) records mechanism rationale; [the crypto API reference](../../crates/crypto/README.md) documents actual signatures, errors and costs. This is not a claim of a complete encrypted workspace.

## Modes and authority

Trusted-server mode is the initial/default delivery mode. An unlocked trusted Rust process holds permitted plaintext and keys for editing, navigation, search, compilation and explicitly approved integrations. Protect complete historical content and sensitive derived state at rest, including manifests, provenance, indexes, drafts and backups. Plaintext exports/provider disclosures require explicit scope; incidental working files, temporary files and logs must not defeat confidentiality.

Passphrase storage unlock is the default; support an explicit OS-keychain alternative before claiming complete startup-unlock support. Login authentication is separate from storage-key unlock. The passphrase wrapping primitive exists; the OS-keychain and application startup flows do not yet exist.

Client-held mode remains unavailable until implemented. Its server stores/relays ciphertext without acquiring client-only keys. Plaintext operations execute at an authorized client or report unsupported. Configuration cannot create decryption capability or silently downgrade custody. Authenticated workspace/group policy must govern mode changes and key migration while preserving logical identities.

Future client-held recovery uses a user-held recovery key; server account reset cannot recover client-only content. Keep both browser-only and independently trusted client paths. Protection against a malicious hosting server changing editor code requires the independently trusted client/update channel; browser-only confidentiality excludes malicious client-code delivery.

## Future core egress policy for client-held/non-trusted mode

Status: required future functionality, unimplemented. When client-held/local encryption with a non-trusted server is selected, the core must deny application-controlled plaintext disclosure paths. **GitHub publication/pushing and document export are disabled**, including local Markdown/HTML/PDF/LaTeX/Word downloads and direct browser Blob/download shortcuts. Possession of client keys, read access, an integration credential or a confirmation dialog cannot override this mode policy.

Use one authoritative policy/command boundary across browser, native/trusted client, REST, MCP, plugins and background workers. UI capability flags and disabled buttons reflect the decision; every direct command, retry and sink must independently enforce it. The future trusted client must route file/download, OS clipboard, printing, integrations and provider network calls through its core execution boundary. An authorized plaintext-capable client is not an automatic export exception.

Audit and block additional application disclosure sinks: external model/agent/provider requests carrying protected content; citation or integration queries derived from protected text; plaintext OS clipboard/share sheets; printing; public previews/share links; file/temporary/export artifacts; plaintext caches, indexes, service-worker storage, logs, errors, traces, crash reports and telemetry. Internal encrypted workspace drafts, protected application clipboard references and authorized local viewing/editing require their own permitted flows. Keep protected plaintext from the hosting server and third-party assets.

Ciphertext-only synchronization and separately designed encrypted recovery/backup flows need an explicit policy, metadata/disclosure bounds and authorization. They cannot reuse a disabled document-export/publish operation as an escape hatch. Mixed-source operations inherit restrictions from every protected input; moving content into a trusted destination cannot launder its source policy.

Freeze the applicable policy context in plans and recheck before execution and artifact delivery. Switching to non-trusted mode invalidates pending export/push/disclosure plans, jobs, temporary artifacts and outstanding plaintext access links; no delayed task may execute under an older permissive policy. Mode changes must not silently downgrade protection. Earlier disclosures cannot be recalled.

Acceptance requires negative tests through all transports and clients, UI bypass/direct commands, stale plans, retry/outbox/restart, mixed protected inputs, provider/OS sinks, caches/logs and mode transitions. Model the decision as a pure exhaustive policy function and consider Lean denial-invariant proofs; this requirement establishes no checked theorem or implemented guarantee.

The threat model must distinguish application-controlled egress from a reader copying a screen, OS screenshots, compromised endpoints and side channels. Protection against a malicious host replacing browser code still requires independently trusted client/update delivery. Do not claim that an ordinary browser can prevent a malicious host or privileged user from extracting plaintext already available to it. These limits must not weaken enforcement of the application's supported disclosure paths.

## Implemented cryptographic primitives and contexts

Use RustCrypto XChaCha20-Poly1305 authenticated encryption with independent OS-generated 32-byte data keys and fresh 24-byte nonces. Use Argon2id v19 to derive a passphrase key-encryption key: exactly 65,536 KiB memory, 3 passes, 1 lane, 32-byte output, random 16-byte salt. Passphrases are 1–1024 raw bytes with no normalization. Reject all unsupported profiles before expensive derivation. Application-level unlock serialization/rate limits remain required; per-call bounds do not bound concurrent aggregate work.

`Context` contains workspace ID[16], logical binding ID[32], purpose[1] and key epoch u64. Purpose tags are Revision=1, Manifest=2, Snapshot=3, Transformation=4, Draft=5, Index=6. The authorized application supplies the expected context independently of untrusted envelope bytes. This adapter neither chooses domain identities nor authorizes access. Logical binding IDs are not public plaintext hashes; content equality must not disclose cross-domain equality by default.

`StorageAddress` is SHA-256 of the complete encrypted bytes. It is a physical lookup address, not a logical revision identity, content commitment or integrity/permission grant. Re-encryption changes physical addresses while logical identities stay fixed. A full private-commitment/signature/catalogue scheme remains unimplemented.

## Versioned envelope bytes

Unsigned integers use big endian; version=1 and suite=1 select the complete profiles defined here. Tags are 16-byte postfix tags. Unknown framing/version/suite/profile, invalid lengths and excessive input fail explicitly; no fallback or silent downgrade.

Object:

```text
HGOB[4] | version[1] | suite[1] | nonce[24] | ciphertext[N] | tag[16]
```

N is at most 16 MiB and may be zero. Authenticate as AAD: ASCII `hypergraph/object/v1`, one zero byte, the complete 30-byte header, workspace[16], binding[32], purpose[1], epoch[8]. No logical ID, plaintext digest, purpose or epoch is stored in the public header. Envelope length is N+46 bytes.

Passphrase key wrapper:

```text
HGWK[4] | version[1] | suite[1] | m_kib[4] | passes[4] | lanes[4]
        | salt[16] | nonce[24] | encrypted_key[32] | tag[16]
```

Require exactly 106 bytes. Authenticate as AAD: ASCII `hypergraph/key-wrap/v1`, one zero byte, the complete 58-byte header, expected workspace[16], epoch[8]. Rewrapping the same data key with a new passphrase requires no object re-encryption. A copied earlier wrapper remains usable with its corresponding passphrase; wrapper replacement is not revocation or secure deletion.

## Memory, disclosure and integrity limits

Managed keys, KDF outputs, explicitly owned Argon2 Block memory, AEAD-held keys and plaintext result/intermediate buffers use zeroization. The adapter avoids Argon2's non-clearing convenience work-memory allocator and reserves tag capacity before copying plaintext to avoid plaintext reallocations. Caller-owned input buffers remain the caller's responsibility. No complete erasure claim covers compiler temporaries, registers, swap or crash dumps. An unlocked compromised process can access its keys/plaintext.

Fresh random nonces avoid exposing equal plaintext through deterministic ciphertext addresses; ciphertext size, access patterns and reuse of already-stored objects remain visible. No padding/ORAM or global plaintext deduplication is implemented. Wrong passphrase/key/context and authenticated-byte tampering fail authentication without revealing which secret was wrong.

AEAD authenticates bytes/context but does not establish latest state or reject authentic stale envelopes. The storage/application design must bind key policy, catalogue, publication and heads to reject rollback/replay before durable editing. Epoch numbers alone neither rotate keys nor grant historical access.

## Future sharing and lifecycle obligations

Model users, devices, groups and authenticated policy now. Future initial sharing scope is workspace/document; full retained history requires explicit grant. Current-state sharing must define disclosure of nested dependencies/provenance and hidden or opaque inaccessible references. Current read permission does not imply all historical keys. Revocation cannot erase content/keys already disclosed.

Specify data-key hierarchy, domain separation, rotation, historical grants, recovery and mode migration before implementing those capabilities. Separate group transport/key agreement from graph synchronization, authorization, conflict resolution and archival access. MLS may be evaluated for group transport; no federation/group cryptographic protocol is adopted here.

## Validation boundary

The adapter's Rust tests cover round-trips, independent encryption of equal content, tampering/context substitution, malformed/resource limits and passphrase rewrap preserving access to existing ciphertext. Dependency versions/checksums/licenses are recorded in [the runtime inventory](../../legal/RUST_DEPENDENCIES.json). No crypto function is Lean verified. Primitive correctness, OS entropy, client integrity, process memory and future I/O remain explicit trust assumptions. Formal-assurance evidence stays in the [Lean validation digest](../../proofs/VALIDATION_DIGEST.md), separate from these requirements.
