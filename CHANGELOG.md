# Changelog

## 0.8.0 — 2026-10-25

- Add encrypted SQLite draft recovery and immutable commit/snapshot storage source, plus an embedded HTTPS runtime scaffold and initial frontend runtime adapter. Integrated browser delivery remains unfinished and unavailable for real documents.
- Reorganize documentation into nine abstraction levels with source, decision, coverage and assurance registers. Preserve historical inputs locally under ignored `.oldspecs/`.
- Maintain owner decisions and verification records in docs; provide a reusable documentation checker without private-baseline dependencies.
- Synchronize Rust, frontend and Lean package versions. This is a MINOR source publication for backward-compatible functionality; no schema/protocol/toolchain versions change and no new whole-application proof claim is made.

See [publication scope and validation](docs/09-guides/reference/source-publication-0.8.0.md). The previously published 0.7.0 milestone provides the synthetic frontend preview; its historical changelog remains preserved locally with the earlier documentation.
