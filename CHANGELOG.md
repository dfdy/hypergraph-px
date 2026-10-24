# Changelog

Project versions follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html); see SPECS/SPECIFICATION.md §8 for the initial-development convention and push policy.

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
