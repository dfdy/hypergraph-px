# Hypergraph PX: The Graph Is More Than a Storage Mechanism

**Hypergraph PX is a graph-based document editing system that treats documents not as isolated, static files, but as evolving compositions of interconnected, reusable, and independently versioned content.**

Conventional documents are organised as trees: documents contain sections, sections contain paragraphs, and paragraphs contain sentences. Hypergraph PX preserves this familiar structure while extending it through a network of relationships between content, its origins, its revisions, and its uses across different documents.

At its core, Hypergraph PX is built around a **typed, directed, attributed, temporal multigraph composed of several mathematically constrained subgraphs**. Each represents a different relationship between content and its development:

- **Composition trees** describe how content is organised into documents, preserving the order and hierarchy needed for reading and editing.
- **Reference graphs** connect content through hyperlinks, citations, and other relationships, allowing connections across documents and back to their ancestors.
- **Revision graphs** preserve the history of every independently identifiable piece of content, allowing revisions to branch and merge without overwriting earlier versions.
- **Provenance graphs** record how content originated, was extracted, forked, combined, or transformed, preserving traceable relationships between original and derived material.
- **Document snapshots** preserve reproducible historical states, allowing an entire document to be reconstructed as it existed at a particular recorded revision.

These structures coexist within a common graph but obey different mathematical rules. Document containment requires a coherent hierarchy, while hyperlinks may form cycles. Revision histories can branch and merge but must preserve their causal ancestry. A paragraph may appear in several documents without duplicating its identity or losing its individual history.

The distinction between **content, its identity, its history, and its position within a document** is fundamental. A sentence, paragraph, or section can be edited independently, reused elsewhere, or forked into a new version while retaining a navigable connection to its source. Documents can consequently be assembled from existing material without sacrificing the independence or historical continuity of their constituent parts.

This architecture makes it possible to optimise storage, retrieval, version management, document compilation, and graph traversal using algorithms suited to each relationship. More importantly, it extends the possibilities of document editing beyond the production of successive, self-contained texts.

**A document becomes a historically situated composition of identifiable and reusable intellectual material.**

Its structure shows how ideas are organised. Its references show how they relate. Its provenance reveals how they came into existence. Its revision history records how they developed, diverged, and converged.

Hypergraph PX is therefore intended not merely as a system for writing and organising documents, but as a means of exploring the relationships, transformations, and histories through which knowledge is developed, revised, shared, and collectively constructed.

See [development state and handoff](docs/DEVELOPMENT_STATE.md) for current progress, validation evidence and resumption steps.

## Current status

Architecture decisions, a pure Rust expansion validator and an in-memory trusted-server cryptographic adapter. Authenticated object/passphrase-key envelopes are implemented; no durable workspace storage, browser editor or running service is implemented in this repository yet.

Confirmed starting constraints:

- Independently developed browser frontend and Rust domain/data processes, packaged as one Rust-based executable with built frontend assets embedded for releases.
- Local-only first release; future multi-user/federation concerns inform the core now without enabling remote sharing prematurely.
- Trusted-server encryption/key custody is the default, with passphrase unlock by default and an OS-keychain alternative; client-held encryption remains unavailable until implemented. Its future browser-only and trusted-client paths have explicitly different malicious-server-code guarantees.
- Pure, deterministic core validators suitable for selective Lean verification; distinguish model proofs, Rust correspondence tests and direct implementation proofs.
- A technical data-structure/navigation reference maintained alongside the implementation.
- GitHub tracking and source control from the beginning.

Start with the [specification index](Specifications/README.md), [architecture](Specifications/ARCHITECTURE.md) and [data structures/navigation reference](Specifications/DATA/README.md). The [product specification](Specifications/SPECIFICATION.md) defines confirmed requirements. The [mathematical model](Specifications/DATA/MATHEMATICAL_MODEL.md) and [encryption specification](Specifications/DATA/ENCRYPTION.md) explain core invariants and security boundaries. These documents distinguish implemented behavior from planned work.

No application launch command exists yet; the pure-core check commands are below. Original code is AGPL-3.0-only, confirmed by the owner. Current project version is **0.1.2**. Follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html); increment the version before each milestone push introducing new changes. See [CHANGELOG.md](CHANGELOG.md).

Initial core checks:

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo test --workspace --locked
```


## Initial verification

Eight Rust tests pass: three envelope tests cover context/tamper/resource rejection and passphrase rewrapping, and five domain tests include all 512 directed three-vertex graphs against an independent reachability oracle, repeated dependencies, invalid inputs and exact resource budgets. Formatting and strict all-target Clippy pass. Four Lean graph-model theorems now check with Lean 4.35.0 and report no axioms. This does not prove the Rust validator: strict whole-validator translation currently fails on supported-subset/model limits, while its unchanged real Rust budget helper has a checked extracted-semantics proof. Durable encrypted storage, OS-keychain integration, the editor and single-executable runtime packaging remain implementation work. See [formal assurance](proofs/README.md) and the [human-readable Lean validation digest](proofs/VALIDATION_DIGEST.md).

The [crypto adapter reference](crates/crypto/README.md) and [ADR 0002](docs/adr/0002-trusted-server-envelopes.md) describe the implemented byte formats, keys, resource limits and security assumptions. Its tests are separate from the Lean evidence; no crypto proof is claimed.
