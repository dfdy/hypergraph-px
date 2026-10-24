# First Lean model — issue 2

Tracking: https://github.com/dfdy/hypergraph-px/issues/2. Date: 2026-10-24. Status: first model proofs validated; Rust extraction remains follow-up work.

Owner follow-up resolves startup unlock (both passphrase/keychain, default passphrase) and future client distribution (both browser-only and independently trusted clients, stronger malicious-code-serving protection only for trusted clients). Updated canonical specification and ADR 0001 before dependent storage work.

Assumptions/invariants recorded before proof code: model edges are the expansion projection; nonempty paths distinguish genuine cycles; strict natural-number ranks are sufficient witnesses. Prove path rank growth, absence of cycles, and safe insertion preserving the same rank. This is not proof of the existing Kahn Rust algorithm, a complete occurrence move rule, storage integrity or cryptographic enforcement. No proof holes/custom axioms. Runtime Rust remains dependency-free and unchanged.

Tool choice: Lean 4.35.0 matches the Lean backend of inspected Aeneas revision 74aabd52f77001cf9eaad51b4f4b867a7dc6b111. Tooling runs from temporary development storage and is not bundled in the application. Actual results and the preliminary Aeneas assessment are recorded below. Rollback changes no durable user data or format.


Local validation: Lake build under Lean 4.35.0 passed with warnings as errors. Direct model checking printed all four theorem dependency reports as no axioms. `lake env leanchecker Hypergraph` returned exit 0. The initial proof compile failed due to inference of implicit theorem arguments; explicit argument bindings resolved it, with no proof holes/custom axioms. Five Rust tests, locked strict Clippy, formatting and git diff whitespace checks passed. Rust code and its hash were unchanged.

Owner requested an ongoing human-readable digest for developers/mathematicians during this increment. Added proofs/VALIDATION_DIGEST.md, linked it from root/proof/data documentation, and recorded the requirement in AGENTS/canonical specification. The digest includes each guarantee, definitions/assumptions, proof method, actual source/toolchain/hash evidence, reproduction steps, limitations and maintenance rules. Automated document checks confirmed all four theorem symbols, three source hashes and 24 local links/code fences.

Aeneas assessment: pinned source/Lean/Charon compatibility reviewed, no local OCaml/OPAM/Nix translator build available, queried latest-release endpoint returned 404. No extraction ran. This is an explicit unfinished implementation-correspondence gate, not evidence BTreeMap/VecDeque are supported or unsupported. No actual Rust function is claimed Lean-verified.

Added pinned Lean CI action with compiled-environment checking. Hosted CI results will be evaluated on the pushed commit; local success is not labelled hosted success. No runtime dependency, crypto implementation, durable data format or user-data write introduced. Issue #2 stays open for the actual extraction/correspondence feasibility step.


Initial hosted Rust CI passed. Initial hosted Lean build also compiled all theorems, but its environment-check helper inferred the package name HypergraphProofs rather than the actual library module Hypergraph and failed to find compiled modules. Fixed workflow by explicitly passing leanchecker-args: Hypergraph, matching the already-passing local command. No proof/source theorem change or check removal. Recheck the full workflow after this correction before claiming hosted proof success.


Hosted verification succeeded for proof/workflow revision 756915a74738555f8893d2f00d7261c6d5ac8d91: Lean build, explicit Hypergraph environment check and theorem-axiom report passed at https://github.com/dfdy/hypergraph-px/actions/runs/40078687517; Rust formatting/strict Clippy/tests passed at https://github.com/dfdy/hypergraph-px/actions/runs/40078687500. The subsequent evidence-only update changes no proof or Rust source hash. Digest delivered; actual Rust extraction/correspondence remains open.
