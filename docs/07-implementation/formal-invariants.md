# Formal Invariants and Proof Obligations

## Common metadata

- **ID:** `HPX-ALG-001`
- **Title:** Formal Invariants and Proof Obligations
- **Purpose:** Formal obligations and exact assurance limits for Lean models and selected extracted Rust.
- **Level:** `07-implementation`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-DOM-002](<../05-domain/hypergraph-mathematics.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-11-01

Four historical DAG model theorems and one separately retained extracted spend-helper theorem are joined by31 checked finite-cycle and19 bounded source-emission model theorems; full-validator,authenticated source/parser,operational-resource,storage,crypto and app correspondence remain unproved.


## Formal property

The [human-readable validation digest](../08-assurance/formal-validation-digest.md) retains historical archive/source-ID evidence and the current cycle-aware model results;its proof sources remain active in [proofs](../../backend/proofs/lean/Hypergraph/Expansion.lean).

| Property identity | Checked declaration | Existing recorded assurance |
|---|---|---|
| HPX-PROP-001 | Hypergraph.path_increases | Lean model theorem; path induction under strict edge-rank assumption |
| HPX-PROP-002 | Hypergraph.rank_implies_acyclic | Lean model theorem; a self-returning path would imply rank(v)<rank(v) |
| HPX-PROP-003 | Hypergraph.forward_insertion_preserves_rank | Lean model theorem for adding a lower→higher rank edge |
| HPX-PROP-004 | Hypergraph.forward_insertion_preserves_acyclic | Model corollary combining rank preservation and acyclicity |
| HPX-PROP-005 | spend_spec in proofs/rust/SpendProof.lean | Selected actual Rust helper extracted via Charon/Aeneas; accounting/exhaustion and overflow guarantees within extraction assumptions |

The four model theorems do not prove Rust Kahn execution. Full-validator extraction encountered nested-loop return and Iterator::filter_map model limits. No storage/encryption/authorization or compiled-application proof follows. Maintain exact source/toolchain hashes, theorem dependencies and replay evidence; do not duplicate an unverified proof claim into a success table.

### Required cycle-aware expansion proofs — HPX-OWNER-041

The owner requires the following Lean work for the [accepted cycle-aware inclusion policy](../05-domain/hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041). These accepted obligations now have [checked finite supplied-state model results](../08-assurance/formal-validation-digest.md#finite-cycle-state-model--2026-10-31); precise scope and remaining emitter/resource/implementation bridges are retained below. No cycle-aware extracted implementation correspondence exists.

| Property identity | Required guarantee | Status |
| --- | --- | --- |
| HPX-PROP-006 | For a finite authenticated selected dependency graph and explicit budgets, automatic expansion terminates with a correct finite result or explicit failure; cycle-closing dependencies stop at the defined boundary. Distinguish active recursion from repeated siblings and finite historical inclusion; prove the chosen exact-state equivalence and traversal invariant rather than assuming them. | Checked finite typed-table stopping/recurrence model; operational resource and implementation correspondence remain open. |
| HPX-PROP-007 | A successful result covers every required expanded use and exact cycle boundary under the frozen rule, with no silently omitted, duplicated, substituted or wrongly cut contribution; reconstruction is deterministic from exact closure/policy/profile inputs. Missing/unauthorised data and budget exhaustion cannot produce a falsely complete result. | Checked ordered exact-use coverage/state determinism plus OWNER047 bounded emission/byte-map witnesses under supplied frozen source-faithful partitions (TEST155); authenticated source/parser and implementation correspondence remain open. |
| HPX-PROP-008 | In a formal navigation/presentation state machine, each detected cycle boundary has a warning state and an explicit authorised navigation action; absent a new user action, it cannot automatically reopen recursively. Each click is bounded, may revisit valid cyclic content, and retains the correct target/context and warning state. | Checked warning/action/no-click/denial/conflict-review model; actual UI/access/event correspondence remains open. |

Prove model results first and record exact definitions, assumptions, source/toolchain hashes and axiom reports in the [full digest](../08-assurance/formal-validation-digest.md). Establish correspondence for the actual selected Rust traversal/navigation logic where supported; explicitly document remaining bridges. Lean state-machine proofs alone cannot prove that browser pixels, keyboard/screen-reader behaviour, transport permission checks or UI event handlers match the model: require targeted implementation, accessibility and recovery tests as separate evidence. The four existing DAG model proofs and extracted `spend_spec` retain their original scope and cannot be relabelled as these proofs.

The [finite-state candidate](../architecture/proposals/finite-cycle-closure-state.md) and [Lean proof plan](../architecture/proposals/finite-cycle-lean-plan.md) now propose definitions, key-soundness/coverage invariants and proof dependencies for these identities. OWNER045 adopts the finite-state/structural-key/boundary semantic basis; 31 named finite-state model theorems/33 guards are checked under HPX-TEST-153; OWNER047 adds19 source-emission theorems/18 guards under HPX-TEST-155 with explicit input premises in the digest. [Exact definitions,axioms and remaining proof limits](../08-assurance/formal-validation-digest.md#finite-cycle-state-model--2026-10-31) prevent treating those results as complete emitted-source,Rust/UI or operational-resource proofs.

### 6. Formal validation

Source `HPX-SRC-0032`, original lines 72–81. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Keep critical validators pure and deterministic. Lean models/proofs target occurrence/expansion invariants, immutable history/provenance, snapshot determinism, authorization and key-custody transitions. Perform an early Aeneas feasibility check on representative Rust; prove selected actual Rust functions where supported.

For every property distinguish proposed obligation, checked Lean model, differential/property-test evidence and actual extracted-Rust correspondence proof. Document toolchain versions and trusted assumptions, including cryptographic libraries, entropy, I/O and client integrity. No whole-application security or Rust correctness claim follows from model-only proofs.

Lean/Aeneas are build/CI tools, not runtime requirements. Preserve a testable pure core even for functions not supported by extraction. All proof/test results must be actual executed evidence. Maintain a human-readable digest of every Lean-validated function/theorem for developer/mathematician evaluation, including its guarantee, assumptions, proof technique, exact source/toolchain and Rust correspondence status.

Future Word review import must match tracked changes and comments to an explicitly selected branch or snapshot, with imported contributions attributed to the virtual **Word Revision** user. Preserve immutable snapshots and review conflicts before applying to a writable branch; see [Word review import](<../06-subsystems/external-integrations.md>). This capability is not implemented.

### 6. Formal obligations and implementation correspondence

Source `HPX-SRC-0026`, original lines 100–112. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Candidate initial properties:

1. A valid occurrence move preserves rooted-parent invariants and chosen expansion acyclicity.
2. Successful immutable commit preserves prior revisions and same-identity parent validity.
3. Transformation outputs retain valid ordered inputs/ranges and complete intended output coverage.
4. Reconstruction is a deterministic function of the exact closed snapshot and explicit compiler inputs.
5. An accepted operation satisfies the applicable actor/device/policy authority; configuration cannot create client-only decryption authority.
6. A future conflict resolver is deterministic under its specified causal input/accepted-operation set; encryption delivery order does not define graph validity.

For each theorem record its definitions, preconditions, trusted assumptions, Lean file/symbol, corresponding Rust function and actual checked evidence. Model-only proof, differential tests and Rust extraction proof are separate columns. The first rank/path model proofs are now checked under Lean 4.35.0; see [formal assurance](<formal-invariants.md>) and the [validation digest](<formal-invariants.md>). The unchanged Rust budget helper now has a checked Aeneas-extracted theorem; full graph validation remains unproved. Cryptographic primitives, randomness, host/client integrity and filesystem durability require explicit assumptions and additional validation.


## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 72–81; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 100–112; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
