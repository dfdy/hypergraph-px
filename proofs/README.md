# Lean and Rust assurance plan

Status: obligations identified; no Lean proof has been checked and no Rust-to-Lean extraction has run yet. Lean/lake are not currently installed in the discovered execution environment. This directory is not proof evidence.

The owner selected Lean model proofs plus an early Aeneas feasibility check, followed by proofs of selected Rust functions where supported. Pin a compatible Lean/Aeneas/Charon toolchain after checking a representative extraction. Do not write `sorry` or introduce unchecked axioms to make a gate look complete.

First target: [expansion validator](../crates/domain/src/expansion.rs). Model finite declared vertices, directed expansion edges, indegrees and repeated dependencies. Specify valid vertex references and prove that successful full elimination implies absence of a directed cycle. Budget errors do not mean cyclic; successful validation does not prove snapshot completeness or authorization.

Implementation correspondence remains open. BTreeMap/VecDeque/generic support in the chosen extraction version must be investigated rather than assumed. A smaller representation or boundary lemma may be required. Keep the independent exhaustive Rust oracle as test evidence; it is not a Lean proof.

Maintain separate evidence for model theorem, Rust differential/property tests, extracted-Rust theorem, tool versions and assumptions. Later targets include same-identity ancestry, immutable history extension, exact transformation source coverage, deterministic closed-snapshot reconstruction, permission intersection and security-mode non-escalation. Storage durability/cryptographic primitives/client delivery need explicit trusted assumptions and separate tests.
