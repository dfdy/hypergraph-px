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
- **Last reviewed:** 2026-10-25

Four model theorems and one extracted spend-helper theorem are recorded in preserved evidence; full validator, storage, crypto and app are not formally proved.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## State-space and notation

Formal obligations and exact assurance limits for Lean models and selected extracted Rust. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Formal property

The unchanged [human-readable validation digest](../08-assurance/formal-validation-digest.md) is preserved in the local source archive and linked by source ID; its proof sources remain active in [proofs](../../proofs/lean/Hypergraph/Expansion.lean).

| Property identity | Checked declaration | Existing recorded assurance |
|---|---|---|
| HPX-PROP-001 | Hypergraph.path_increases | Lean model theorem; path induction under strict edge-rank assumption |
| HPX-PROP-002 | Hypergraph.rank_implies_acyclic | Lean model theorem; a self-returning path would imply rank(v)<rank(v) |
| HPX-PROP-003 | Hypergraph.forward_insertion_preserves_rank | Lean model theorem for adding a lower→higher rank edge |
| HPX-PROP-004 | Hypergraph.forward_insertion_preserves_acyclic | Model corollary combining rank preservation and acyclicity |
| HPX-PROP-005 | spend_spec in proofs/rust/SpendProof.lean | Selected actual Rust helper extracted via Charon/Aeneas; accounting/exhaustion and overflow guarantees within extraction assumptions |

The four model theorems do not prove Rust Kahn execution. Full-validator extraction encountered nested-loop return and Iterator::filter_map model limits. No storage/encryption/authorization or compiled-application proof follows. Maintain exact source/toolchain hashes, theorem dependencies and replay evidence; do not duplicate an unverified proof claim into a success table.

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


## Assumptions and scope

Formal obligations and exact assurance limits for Lean models and selected extracted Rust. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Safety/liveness classification

Formal obligations and exact assurance limits for Lean models and selected extracted Rust. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Proof or model-check plan

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Counterexample model

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Related tests

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 72–81; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 100–112; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
