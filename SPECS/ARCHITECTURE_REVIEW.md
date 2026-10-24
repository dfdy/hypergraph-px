# MU-F foundation review

Date: 2026-10-24. Status: initial architecture decisions confirmed; first pure-core increment under issue #1. No durable format accepted yet. Source documents: [reading guide](README.md).

## Confirmed direction

Start afresh in `Hypergraph PX MU-F`, with source at `dfdy/hypergraph-px`. Local-only operation is the first delivery scope. Multi-user and federated deployment are future capabilities whose identity, permission, causality, cryptographic and serialization requirements affect today's architecture.

Develop the web editor independently from Rust data/domain processes, but embed built frontend assets in a single Rust executable for release. Lean is a development/CI verification tool, not a runtime service. Trusted-server key custody is the default. The owner confirmed trusted-server mode first, with client-held mode designed now and explicitly unavailable until implemented.

The retired folder is reference-only. Preserve its lessons, not its codebase, accounts, draft formats, schema sequence or service state. No automatic migration, old workspace import or provider connection is authorized by this restart.

## Mathematical model to carry forward

Use typed related projections over one canonical record model:

- Logical content identities and immutable same-identity revision DAGs.
- Ordered placement occurrences, distinct from the logical content they reference.
- Typed references/links, which may cycle and are not recursively rendered.
- Expansion dependencies with separately decided cycle policy and bounded traversal.
- Explicit transformation events with ordered exact immutable inputs/outputs, ranges and provenance; a split/merge is not merely an unlabelled pairwise relationship.
- Immutable manifests and closed snapshot resolutions, including nested/repeated occurrence binding contexts.
- Principals, devices, collaboration groups, authorization policies and security-policy epochs, distinct from instance/workspace hosting identities.

Do not use a node-ID-only map for snapshot closure, wall clocks as causal order, or the physical ciphertext address as a logical revision identity. A revision pin and a full subtree closure pin have different semantics. Graph provenance records derivation, not logical entailment of prose.

## Reconciliation needed before durable code

| Question | Tension or consequence |
|---|---|
| Expansion cycles | New mathematics describes an acyclic expansion projection; old specification permits stored transclusion cycles with bounded diagnostic rendering. Need an explicit valid-state/import policy. Hyperlink cycles remain distinct. |
| Encryption modes | At-rest encryption and key custody are separate. A local Rust process that holds keys is still trusted-server custody; browser-held keys exclude that process only if plaintext computation also moves out of it. |
| Trusted client distribution | An untrusted server can change browser-delivered JS/WASM. Genuine hostile-server protection needs an independently trusted client/update channel or an explicitly limited threat model. |
| Public content digests | Plaintext-based public addresses can reveal equality or permit guessing. Keep logical identity, private commitment/digest and encrypted physical address separate; define signed commitments and encryption-domain deduplication. |
| Local scope | Local-only does not specify number of accounts/devices or whether LAN access is allowed. Do not inherit the old single-human restriction silently. |
| Concurrency | Future live coediting, offline divergent branches and structural merges have different requirements. A text CRDT does not make concurrent graph moves valid. |
| Occurrence order | Fractional ordering, vectors and sequence CRDTs are alternatives, not interchangeable guarantees. Floats or locally rebalanced keys alone do not establish distributed convergence. |
| Historical access | Sharing current content with a fresh epoch can still leak old content through provenance, closures or keys. Define historical disclosure and opaque/hidden references. |
| Revocation | Revocation can block future authorized distribution; it cannot erase previously downloaded plaintext/keys. Offline signed operations need a defined policy/membership authority and acceptance rule. |
| Storage authority | Immutable objects plus an authoritative commit ledger need one publication/recovery model. Evaluate the index/read model without reproducing per-request full replay or creating two competing authoritative stores. |
| Formal assurance | Proving a Lean model, testing Rust against it and proving extracted Rust are different evidence levels. Select toolchain-compatible pure validators and prove actual stated properties. |
| Recovery / mode changes | Account reset cannot automatically recover client-only keys. Mode migration, key rotation, policy rollback and restore to a new device require explicit authority and retained policy evidence. |
| Plaintext portability | Automatic Markdown working files, indexes, previews, backups, temp files and provider context can defeat encryption. Decide which plaintext exports are explicit, scoped and auditable. |
| License / release policy | The previous AGPL/version policy is historical. AGPL-3.0-only is confirmed. Pin a fresh independent release/schema policy. |

The original encryption material calls MLS a group-key/messaging layer, not graph synchronization, authorization or a complete archival key scheme. Long-lived immutable history and selective sharing require an application key policy in addition to MLS epochs; do not invent a ratchet or promise historical erasure.

## Proposed development boundaries

These are responsibility boundaries, not a requirement to create many empty crates immediately:

```text
frontend/                  editor interaction, rendering, minimap, agent/comments UI
crates/domain/             pure types, invariants, graph/occurrence operations
crates/application/        principal resolution, commands, previews and receipts
crates/storage/            canonical objects, commit durability, read models
crates/security/           keys, authenticated encryption envelopes and policy
crates/server/             HTTP/bootstrap/static embedding; final executable
proofs/lean/               models, theorems, selected extraction correspondence
tests/                    property, protocol, recovery and browser acceptance
```

Initially, adapters for future federation, providers, citations and MCP can remain module interfaces rather than empty runtime services. Do not make the domain depend on HTTP, a particular database, MLS or browser globals.

Client-held encryption would additionally need a portable plaintext-domain execution boundary, possibly reusable Rust compiled to WASM or a separately trusted local agent. A browser-only E2EE design cannot promise that the hosting server performs plaintext compilation/search/MCP operations. Specify supported capabilities per mode and refuse unsupported operations rather than uploading keys implicitly.

Proposed command flow: a frozen request and trusted principal enter application authorization; pure planning validates exact base/owners/dependencies; commit rechecks heads/policy and publishes one complete result; a receipt reconciles browser state. Preview is side-effect free. Mutable durable working drafts are separate from immutable revision commits. No automatic resubmission of an uncertain provider call or structural write.

## Proposed proof strategy

Start with small exact statements about occurrence moves/cycle rejection, same-identity parents, transformation input/output preservation, snapshot resolution determinism, permission non-escalation and security-mode transitions. Include explicit assumptions about key custody, cryptographic libraries, I/O and client integrity.

Pin Lean/extraction versions and identify trusted components. Model-only proofs must be labelled model-only. If Aeneas is chosen, test a representative safe-Rust validator before adopting verification-sensitive containers/APIs throughout the engine. Properties involving durability, entropy, browser delivery and concurrency need additional engineering evidence; a pure graph proof does not discharge them.

## Owner decisions received

1. Trusted-server mode is first/default; client-held mode is planned and unavailable until implemented.
2. Future collaboration supports both live coediting and explicit branches/merges.
3. One local human initially; users, devices and groups are modelled now.
4. Client-encryption recovery is user-held; server account reset cannot recover those keys.
5. Lean model proofs plus early Aeneas feasibility; selected actual Rust proofs where supported.
6. Reject expansion cycles; hyperlinks may cycle. Initial sharing is workspace/document scoped and full history requires explicit grant. Original application code remains AGPL-3.0-only. No legacy feature removal was requested.

Implement these confirmed decisions without reopening them routinely. Key-unlock defaults and trusted-client guarantee are now confirmed: support passphrase/keychain, default passphrase; retain both browser-only and trusted-client paths, requiring the latter for malicious-host-code protection. Exact crypto formats, key wrapping, storage publication and future replicated conflict semantics still require their own reviewed mechanisms before dependent durable writes. The first pure expansion validator introduces no data format or key custody.

## Fresh implementation sequence

1. Repository, issue, source reading and explicit decision record.
2. Reconciled canonical specification; identities, occurrence semantics, authorization/key-custody threat model and proof obligations.
3. Minimal pure domain and first checked Lean/Rust evidence, with golden canonical vectors before persistent writes.
4. Storage/crypto publication and recoverable drafts, tested against interruption/tampering and policy mismatch.
5. Independently developed whole-document editor, embedded single-binary packaging and a complete type→autosave draft→restart→explicit commit flow.
6. Branch/compare/selected merge and human/approved mock structural workflows, preserving all provenance.
7. Explicitly scoped local interfaces/citations/provider integrations, then later multi-user/offline exchange and federation according to reviewed milestones.

Keep budgets, failure diagnostics and realistic benchmarks from the beginning. Do not spend many stages building disconnected primitives before exercising the editor; do not bypass durable/auth invariants to finish that demonstration. Default current UI effort remains desktop unless changed by the owner.

## External checks at discovery

Primary references checked on 2026-10-24:

- [MLS architecture, RFC 9750](https://www.rfc-editor.org/rfc/rfc9750.html): group-messaging infrastructure and application responsibilities remain separate.
- [Aeneas project](https://github.com/AeneasVerif/aeneas): supported Rust translation and proof toolchain must be assessed against the actual selected version; no whole-application verification claim.
- [Libsodium AEAD documentation](https://doc.libsodium.org/secret-key_cryptography/aead/chacha20-poly1305): established constructions are candidates, not a license to invent cryptography or declare a suite chosen before threat-model review.

At initial discovery no crypto/proof tool was installed. Follow-up issue #2 now pins Lean 4.35.0 and checks four rank/path model theorems; see the [validation digest](../proofs/VALIDATION_DIGEST.md). Aeneas extraction and crypto implementation remain unrun/unimplemented.
