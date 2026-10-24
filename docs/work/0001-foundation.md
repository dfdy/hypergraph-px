# Foundation increment — issue 1

Date: 2026-10-24. Tracking: https://github.com/dfdy/hypergraph-px/issues/1.

Scope and assumptions were recorded in the GitHub issue before implementation. Fresh project; supplied documents retained unchanged; prior application referenced only for source comparison and standard AGPL license text. Owner-confirmed scope and security/proof decisions are in ADR 0001 and SPECS/SPECIFICATION.md.

Implemented: independent Cargo domain crate, pure bounded expansion validator, initial CI workflow, canonical foundation specification, data/navigation README, source-reading/authority records and proof plan. No external Rust dependencies, durable data format, user data, listener, editor, cryptographic implementation, federation or checked Lean theorem introduced.

Invariants: complete declared endpoint validation; cycles rejected only in the selected expansion projection; repeated/parallel dependencies preserved; finite input/work budgets; input immutability; no storage or authorization side effects. Hyperlinks, occurrence forest ownership, snapshot completeness and permission resolution are separate caller responsibilities.

Executed locally: cargo fmt --all; strict all-target Clippy; cargo test --workspace (5 passed, including exhaustive 512-graph differential test); new-document local-link validation passed. Final locked checks follow before push. This is no claim of formal verification or application completion. Hosted CI results are reported separately after the initial push.

Rollback: remove the initial code/docs commit without affecting any runtime workspace; no persistent data exists in the project. Remaining mechanism decisions include trusted-server startup unlock, trusted-client delivery guarantees, storage publication/encryption formats and replication conflict semantics. Early Lean/Aeneas feasibility is next core work.
