# Hypergraph PX MU-F

Hypergraph PX Multi-User Federated is a new implementation, beginning with local-only operation while designing identities, authorization, data formats and encryption boundaries for future multi-user and federated instances.

Source repository: https://github.com/dfdy/hypergraph-px (created private). Active project directory: `Hypergraph PX MU-F`. The preceding `Hypergraph PX` project is retired and may be consulted as a reference; its code, runtime data, credentials and intermediate formats are not the starting implementation.

## Current status

Architecture decisions and the first pure Rust expansion validator. No durable storage format, crypto suite, checked Lean proof, browser editor or running service is implemented in this repository yet. The old application's tests and implementation status do not describe this project.

Confirmed starting constraints:

- Independently developed browser frontend and Rust domain/data processes, packaged as one Rust-based executable with built frontend assets embedded for releases.
- Local-only first release; future multi-user/federation concerns inform the core now without enabling remote sharing prematurely.
- Trusted-server encryption/key custody is the default; client-held encryption is a future supported alternative and remains unavailable until implemented.
- Pure, deterministic core validators suitable for selective Lean verification; distinguish model proofs, Rust correspondence tests and direct implementation proofs.
- A technical data-structure/navigation reference maintained alongside the implementation.
- GitHub tracking and source control from the beginning.

Start with [source-document status](SPECS/README.md), the [foundation review](SPECS/ARCHITECTURE_REVIEW.md) and the [data architecture/navigation reference](SPECS/DATA/README.md). These identify confirmed decisions and pending proposals separately. The [initial canonical specification](SPECS/SPECIFICATION.md) consolidates confirmed requirements; the historical evolved specification is not silently adopted as current authority.

No application launch command exists yet; the pure-core check commands are below. Original code is AGPL-3.0-only, confirmed by the owner. Initial package version is 0.0.1; release/schema policy will be refined separately.

Initial core checks:

```sh
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo test --workspace --locked
```


## Initial verification

Five Rust tests pass, including all 512 directed three-vertex graphs against an independent reachability oracle, repeated dependencies, invalid inputs and exact resource budgets. Formatting and strict all-target Clippy pass. Lean/Aeneas execution, storage encryption, the editor and single-executable runtime packaging remain implementation work; no retired-project evidence is counted here.
