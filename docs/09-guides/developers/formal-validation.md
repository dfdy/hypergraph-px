# Formal validation reproduction

## Common metadata

- **ID:** `HPX-GUIDE-005`
- **Title:** Formal validation reproduction
- **Purpose:** Reproduce existing model/helper evidence with exact tool/source pins and explicit limits.
- **Level:** `09-guides`
- **Status:** `proposed`
- **Maintainer:** project owner
- **Applies to:** scoped historical evidence and current pinned model/helper replay
- **Upstream authority:** [formal obligations](../../07-implementation/formal-invariants.md), [full digest](../../08-assurance/formal-validation-digest.md)
- **Downstream dependencies:** existing proofs and shared/tooling/check_rust_proof.py; current exact pins distinguish comment refreshes
- **Verification:** TEST204 pinned model build/environment and extracted-helper replay; historical checks retain exact original scope
- **Decision/history:** HPX-SRC-0115 and HPX-SRC-0117, hashes/current locations in source register
- **Last reviewed:** 2026-11-15

## Current Stage1 invocation paths

Proofs now live under `backend/proofs/`; the driver is `shared/tooling/check_rust_proof.py`. Run `lake -d backend/proofs/lean build` and `python3 shared/tooling/check_rust_proof.py` with the pinned tools available. The source guides quoted below preserve their historical path spellings and as-run results; those are not current root invocation paths. TEST176 closes the initial Stage1 tool-availability gate:actual model build/checker/54 axiom reports and extracted-Rust replay pass with project-local `.verification/cargo`, `.verification/rustup` and `.verification/lean-v4.35.0` homes. `artifacts/stage1-proof-replay.py` sets child-only PATH/toolchain variables;it does not modify a shell profile or owner default. Run `lake env lean` model commands from `backend/proofs/lean`;the Rust driver runs from the repository root. Earlier source/theorem/correspondence limits below remain unchanged.

TEST204 records a fresh comment-only whole-source model/build/environment and extracted-helper replay. Current pins include changed comments and translator source spans; frozen prior reports remain unchanged. Tool homes are under `.local/verification/`; set child-only PATH to its `cargo/bin` and `lean-v4.35.0/bin` when the shell lacks rustup or Lake. This changes no owner default toolchain.

## Scope and limitations

The following source guides retain their original evidence scope. Any later domain/dependency changes need replay compatibility checks before claiming fresh extraction success. No migration command below was executed as a proof check. Installation may fetch tool/dependency assets; owner publication/privacy restrictions remain in effect.


## Preserved guide: proofs/README.md

# Lean and Rust assurance

The first model is checked with pinned Lean 4.35.0. [Hypergraph/Expansion.lean](<../../../backend/proofs/lean/Hypergraph/Expansion.lean>) defines nonempty paths, acyclicity and strict natural-number rank witnesses. Four theorems prove path rank increase, rank-implies-acyclicity, rank preservation by a forward insertion, and acyclicity of that insertion. Two examples cover successor edges and a reflexive self-cycle. Local Lake build passes; all four theorem dependency reports state no axioms. Hosted CI status is recorded separately in the work record.

This is a **model proof**, not a proof of the Kahn Rust implementation. The forward-insertion rule is sufficient, not a complete move validator: a safe insertion may require recomputing ranks. The model does not prove finite snapshot closure, permissions, occurrence ownership, storage integrity, encryption or client authenticity.

The [human-readable validation digest](<../../08-assurance/formal-validation-digest.md>) inventories all checked results, assumptions, proof methods, exact source hashes and the missing Rust correspondence.

## Reproduce

Install the toolchain specified by [lean-toolchain](<../../../backend/proofs/lean/lean-toolchain>), then run in proofs/lean:

```sh
lake build
lake env lean -DwarningAsError=true Hypergraph/Expansion.lean
lake env leanchecker Hypergraph
```

The project has no Mathlib or Aeneas package dependency. Lake treats proof warnings as errors. The pinned CI action builds and runs the bundled environment checker. Tool origins/licenses are in [TOOLING.md](<../../02-governance/licensing-policy.md>). Lean is not a runtime dependency. The current local binary is a temporary development installation; use elan or the official pinned distribution on another machine.

## Aeneas feasibility — actual result

Official prerelease nightly-2026.10.24-74aabd5 matched the already pinned source/Charon/Lean versions and was checksum-verified. The latest-release endpoint had omitted prereleases; enumerating them resolved local provisioning without building OCaml/Nix.

Charon extracted the unchanged domain crate. Strict whole-crate translation fails on nested-loop returns and missing Iterator::filter_map modelling; no full-validator proof exists. The isolated original `expansion::spend` helper translates and has a checked total accounting/overflow theorem. Its axiom report contains only propext, Classical.choice and Quot.sound. This is a proof about extracted semantics with an explicit translator/backend trust boundary, not the compiled application or full graph algorithm.

See [extracted Rust replay](<formal-validation.md>), [exact pins](<../../../backend/proofs/rust/extraction.json>) and [digest §7](<../../08-assurance/formal-validation-digest.md#7-actual-rust-helper-expansionspend>). The replay regenerates/compares the actual source, validates dependencies, checks the theorem and its axioms, and rechecks the environment. Future full-validator proofs still need an implementation-to-rank/acyclicity connection without silently opaque control flow or containers.


## Preserved guide: proofs/rust/README.md

# Extracted Rust budget proof

This package records a proof about the actual private `expansion::spend` function in `crates/domain/src/expansion.rs`, generated by Charon/Aeneas from that file. It is not a handwritten replacement model. `Spend.lean` is checked-in generated output; `SpendProof.lean` is the original project theorem. `extraction.json` binds exact source/generated/proof hashes, compiler/translator/toolchain pins, official asset digests and reviewed Lean dependencies.

Run from repository root (requires Python 3.12+, GitHub CLI, rustup and the pinned Lean/Lake on PATH):

```sh
python3 scripts/check_rust_proof.py --download
```

Or reuse an already checksum-verified official matching bundle:

```sh
python3 scripts/check_rust_proof.py --tools /path/to/aeneas-bundle
```

The script isolates Rust nightly, Cargo output and proof packages under ignored `.verification`, keeps normal user toolchains unchanged, regenerates the helper, compares exact generated bytes, checks pinned dependency revisions, proves the theorem, checks its axiom report and rechecks the compiled proof environment. It does not treat the full graph validator as verified. The strict whole-crate probe currently fails on nested-loop returns and Iterator::filter_map modelling. Do not turn these boundaries opaque and call the result a complete graph proof.

A source/proof change deliberately fails the recorded hash check until reviewed and re-extracted. Update the human-readable digest and evidence with the new hashes and actual results. Never edit generated Spend.lean to make a proof easier. Official prereleases must be enumerated explicitly; GitHub's latest-release endpoint excludes these builds.

The theorem gives total success in the Aeneas outer result: exhausted budget returns the ordinary Rust Budget error and unchanged work; otherwise it returns Rust Ok and work+1. With work<budget and budget bounded by usize, addition cannot overflow. Aeneas models mutation through the returned counter. Trust includes Rust-MIR extraction, Aeneas translation, its standard-library models, Lean's checking infrastructure and the pinned build environment. See ../VALIDATION_DIGEST.md for precise guarantees and assumptions.


## Current Stage3 local paths

The current command reference is [repository development](repository-development.md). Local verification tools/caches live in `.local/verification`,approved TLS material in `.local/credentials/tls`,persistent workspaces in `.local/workspaces`,and evidence in `.local/artifacts`. The default executable path is `.local/target/debug/hypergraph` or `.local/target/release/hypergraph`;use `node shared/tooling/cargo-path.mjs --profile debug` (or `release`) for the effective Cargo metadata path,including environment/cross-target overrides. Retained source/as-run blocks above preserve historical path wording and are not current invocation recipes.
