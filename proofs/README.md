# Lean and Rust assurance

The first model is checked with pinned Lean 4.35.0. [Hypergraph/Expansion.lean](lean/Hypergraph/Expansion.lean) defines nonempty paths, acyclicity and strict natural-number rank witnesses. Four theorems prove path rank increase, rank-implies-acyclicity, rank preservation by a forward insertion, and acyclicity of that insertion. Two examples cover successor edges and a reflexive self-cycle. Local Lake build passes; all four theorem dependency reports state no axioms. Hosted CI status is recorded separately in the work record.

This is a **model proof**, not a proof of the Kahn Rust implementation. The forward-insertion rule is sufficient, not a complete move validator: a safe insertion may require recomputing ranks. The model does not prove finite snapshot closure, permissions, occurrence ownership, storage integrity, encryption or client authenticity.

The [human-readable validation digest](VALIDATION_DIGEST.md) inventories all checked results, assumptions, proof methods, exact source hashes and the missing Rust correspondence.

## Reproduce

Install the toolchain specified by [lean-toolchain](lean/lean-toolchain), then run in proofs/lean:

```sh
lake build
lake env lean -DwarningAsError=true Hypergraph/Expansion.lean
lake env leanchecker Hypergraph
```

The project has no Mathlib or Aeneas package dependency. Lake treats proof warnings as errors. The pinned CI action builds and runs the bundled environment checker. Tool origins/licenses are in [TOOLING.md](../legal/TOOLING.md). Lean is not a runtime dependency. The current local binary is a temporary development installation; use elan or the official pinned distribution on another machine.

## Aeneas feasibility — actual result

Official prerelease nightly-2026.10.24-74aabd5 matched the already pinned source/Charon/Lean versions and was checksum-verified. The latest-release endpoint had omitted prereleases; enumerating them resolved local provisioning without building OCaml/Nix.

Charon extracted the unchanged domain crate. Strict whole-crate translation fails on nested-loop returns and missing Iterator::filter_map modelling; no full-validator proof exists. The isolated original `expansion::spend` helper translates and has a checked total accounting/overflow theorem. Its axiom report contains only propext, Classical.choice and Quot.sound. This is a proof about extracted semantics with an explicit translator/backend trust boundary, not the compiled application or full graph algorithm.

See [extracted Rust replay](rust/README.md), [exact pins](rust/extraction.json) and [digest §7](VALIDATION_DIGEST.md#7-actual-rust-helper-expansionspend). The replay regenerates/compares the actual source, validates dependencies, checks the theorem and its axioms, and rechecks the environment. Future full-validator proofs still need an implementation-to-rank/acyclicity connection without silently opaque control flow or containers.
