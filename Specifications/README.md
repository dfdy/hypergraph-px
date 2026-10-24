# Specifications

This directory contains the current specifications for Hypergraph PX Multi-User Federated. Requirements and accepted decisions are distinguished from proposed mechanisms and implemented behavior. No development reports belong in this directory.

| Document | Responsibility |
|---|---|
| [Product specification](SPECIFICATION.md) | Scope, mandatory invariants, desktop interface, security, staged delivery, formal assurance and release policy |
| [Architecture](ARCHITECTURE.md) | Component boundaries, command/data flow, single-executable packaging and outstanding mechanism decisions |
| [Mathematical model](DATA/MATHEMATICAL_MODEL.md) | Typed graph projections, identity, temporal state, provenance and exact snapshot semantics |
| [Data structures and navigation](DATA/README.md) | Proposed data/query contracts, actual Rust APIs, complexity, budgets, errors and examples |
| [Encryption](DATA/ENCRYPTION.md) | Key custody, implemented envelope formats, unlock requirements, confidentiality boundaries and future client-held mode |

The product specification owns product requirements. The other documents refine them; an illustrative type or planned API is not an implementation claim. Record mechanism decisions before dependent code and update these documents when behavior changes. Current owner instructions take precedence; reconcile any disagreement explicitly.

Keep implementation chronology and context-compaction handoff in [docs/DEVELOPMENT_STATE.md](../docs/DEVELOPMENT_STATE.md) and issue work records. Keep technical decision rationale in [architecture decisions](../docs/adr/0001-foundation-decisions.md), executed proof evidence in the [Lean validation digest](../proofs/VALIDATION_DIGEST.md), and dependency/license accounting in [legal](../legal/TOOLING.md).
