# Changelog

## 1.0.0 — 2026-10-26

- Separate pure domain records from serialization and require explicit version/kind wrappers at the encrypted adapter boundary. This is a MAJOR compatibility increment: public domain Serde implementations are removed and pre-versioned experimental encrypted payloads are rejected without automatic migration.
- Connect exact owned-source autosave/retry/lock/restart/commit history over authenticated HTTPS and encrypted SQLite; preserve UTF-8 bytes and mixed line endings through browser editing and historical inspection.
- Add explicit opt-in macOS Keychain unlock with passphrase recovery and a verified-backup schema-2 upgrade, protected provenance clipboard, independent Fork and reviewed new-document synthesis.
- Add versioned retrospective n-ary assertions, explicit review/history, captured-source declaration, selected document/assertion/transformation graphs, and incomplete snapshot-bound publication-contributor evidence.
- Improve desktop graph selection/inspection scrolling and validate exact snapshot client response bounds. Restore the owner-approved ad-hoc development handoff after the experimental local signer failed native update-continuity checks.
- Publish source and specifications with scoped synthetic verification evidence. Real-document acceptance, parent-branch Merge, shared editing, client-held mode, federation and broader platform acceptance remain unfinished. No binary release or release tag is created.

See [publication scope and validation](docs/09-guides/reference/source-publication-1.0.0.md).

## 0.8.0 — 2026-10-25

- Add encrypted SQLite draft recovery and immutable commit/snapshot storage source, plus an embedded HTTPS runtime scaffold and initial frontend runtime adapter. Integrated browser delivery remains unfinished and unavailable for real documents.
- Reorganize documentation into nine abstraction levels with source, decision, coverage and assurance registers. Preserve historical inputs locally under ignored `.oldspecs/`.
- Maintain owner decisions and verification records in docs; provide a reusable documentation checker without private-baseline dependencies.
- Synchronize Rust, frontend and Lean package versions. This is a MINOR source publication for backward-compatible functionality; no schema/protocol/toolchain versions change and no new whole-application proof claim is made.

See [publication scope and validation](docs/09-guides/reference/source-publication-0.8.0.md). The previously published 0.7.0 milestone provides the synthetic frontend preview; its historical changelog remains preserved locally with the earlier documentation.
