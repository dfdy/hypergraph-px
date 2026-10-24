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

## Aeneas feasibility — preliminary assessment

Inspected Aeneas commit 74aabd52f77001cf9eaad51b4f4b867a7dc6b111, its Lean 4.35.0 backend pin and Charon commit 260ba2c82588291b1f9efaf4f42d7100adc9c6c2. Official build instructions require a compatible Charon plus OCaml/OPAM or an appropriate Nix build environment. Those tools are not installed locally. The queried latest-release endpoint returned 404, so no prebuilt translator was obtained that way.

No Rust extraction ran. In particular, do not interpret absence of BTreeMap/VecDeque-named files in the inspected source tree as proof that these containers are supported or unsupported. The existing validator uses these containers and generic IDs; an actual pinned extraction is the next feasibility gate. Do not claim that testing a toy arithmetic function verifies the graph implementation.

Maintain separate evidence for model theorem, Rust differential/property tests, extracted-Rust theorem and trusted assumptions. Follow-on targets include same-identity ancestry, history extension, exact source coverage, closed-snapshot determinism and permission/key-custody non-escalation. Filesystem durability/cryptographic primitives/client delivery need explicit assumptions and additional tests.
