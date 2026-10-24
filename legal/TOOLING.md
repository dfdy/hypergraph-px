# Verification tooling and provenance

Reviewed 2026-10-24. Development/CI tools are not linked into the application. Runtime Cargo currently has no external package dependencies. No upstream application or proof example was copied; the graph model/proofs are original code.

| Item | Version / origin | License / use |
|---|---|---|
| Lean and Lake | leanprover/lean4 v4.35.0; official Darwin arm64 release; compiler reports commit eb6cafb7290e8bd5f2937522d8d804f58f02bafc | Apache-2.0; project model checking, temporary local install and CI only |
| Lean CI action | leanprover/lean-action commit 24581d74d674803a25a81b10b059c5c0cdd344c6 | Apache-2.0; pinned CI action, with its upstream notices retained by use of the action |
| Aeneas | AeneasVerif/aeneas commit 74aabd52f77001cf9eaad51b4f4b867a7dc6b111 | Apache-2.0; inspected candidate toolchain, not yet installed/executed or a runtime dependency |
| Charon compatibility | Aeneas charon-pin selects 260ba2c82588291b1f9efaf4f42d7100adc9c6c2 | Compatibility research only; Charon not installed/executed or included |

Primary sources: [Lean release](https://github.com/leanprover/lean4/releases/tag/v4.35.0), [Lean license](https://github.com/leanprover/lean4/blob/v4.35.0/LICENSE), [pinned action](https://github.com/leanprover/lean-action/tree/24581d74d674803a25a81b10b059c5c0cdd344c6), [Aeneas source](https://github.com/AeneasVerif/aeneas/tree/74aabd52f77001cf9eaad51b4f4b867a7dc6b111). The Aeneas backend's lean-toolchain agrees with the chosen Lean version. Pin the extraction environment and record actual execution before claiming Rust correspondence.

No cryptographic implementation/library has been selected by this tooling change. Old-project dependency inventories do not apply. Complete packaged-dependency/copied-source/SBOM accounting as those categories become nonempty.
