# Changelog

Project versions follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html); see Specifications/SPECIFICATION.md §8 for the initial-development convention and push policy.

## 0.1.4 — 2026-10-24

- Shorten README Current status to a brief implementation outline and remove Initial verification.
- Add developer prerequisites, private-repository clone instructions, stable Rust setup and locked build/test/lint commands.
- Link optional proof reproduction and technical documentation; clarify that no application executable or frontend setup is available yet. No runtime/proof changes.

## 0.1.3 — 2026-10-24

- Add README future design aims covering read-only Zotero citations, desktop editing/navigation, reusable content/history, agent/comments workflows, reproducible export, collaboration/federation and client-held encryption.
- Mark planned capabilities explicitly unimplemented; retain staged delivery and mobile deferral. No runtime or proof changes.

## 0.1.2 — 2026-10-24

- Publish a self-contained Specifications directory for current product, architecture, mathematical, data/navigation and encryption contracts.
- Keep reference/source material local and excluded from publication; keep reports and proof evidence outside Specifications.
- Update documentation links and resumption instructions without changing runtime behavior, proof source or data formats.

## 0.1.1 — 2026-10-24

- Record observed successful 0.1.0 hosted Rust, Lean model and extracted-Rust proof checks.
- Finalize the context-compaction handoff, resolved findings, explicit unimplemented boundaries and concrete resumption steps.
- Record the owner's requested pause after the completed increment. No runtime/proof source or format changes.

## 0.1.0 — 2026-10-24

- Add a separate trusted-server crypto adapter: XChaCha20-Poly1305 object envelopes, ciphertext-only SHA-256 storage addresses and bounded Argon2id passphrase-key wrapping.
- Bind workspace/record/purpose/epoch, clear managed secret/KDF buffers, and reject malformed/unknown/resource-heavy inputs before cryptographic processing.
- Test round-trip, independent encryption of equal content, tampering/context substitution, limits and passphrase rewrapping without re-encrypting prior objects.
- Record dependency licenses/checksums, the envelope ADR, actual API reference and persistent context-compaction handoff.
- No durable workspace, keychain implementation, authorization, client-held encryption or complete application is claimed. Existing domain/proof source is unchanged.

## 0.0.3 — 2026-10-24

- Execute pinned Charon/Aeneas extraction against the actual Rust domain crate and document nested-loop/iterator-model limits.
- Prove the unchanged real Rust budget helper's extracted semantics, including exhausted accounting and overflow-free increment.
- Add exact source/tool/dependency pins, strict regeneration/proof replay, hosted verification workflow and updated human-readable digest.
- Runtime APIs and Rust source remain unchanged; full-validator verification is not claimed.

## 0.0.2 — 2026-10-24

- Adopt version increments for milestone pushes, with synchronized Rust/Lake metadata and changelog records.
- Declare the public-contract scope and pre-/post-1.0 version conventions.
- No runtime API, graph algorithm, encryption, storage format or Lean theorem changed.

## 0.0.1 — initial foundation

- New MU-F repository, supplied design sources and owner-confirmed architecture decisions.
- Pure bounded Rust expansion validator and five regression tests.
- Four checked Lean rank/path model theorems, validation digest and Rust/Lean CI.
- Project-purpose introduction and automatic milestone publication instruction.

Earlier commits retained this initial version; the increment-on-push policy takes effect at 0.0.2. Model proofs do not establish Rust implementation correspondence.
