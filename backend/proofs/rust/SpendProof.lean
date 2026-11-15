-- SPDX-License-Identifier: AGPL-3.0-only
import Spend

/-!
# Hypergraph PX — Extracted Rust budget-helper proof

Prove the success and exhausted-budget outcomes of the actual extracted Rust spend helper.

Source: [Latest source on GitHub][source]

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex /root (OpenAI coding agent).
Latest editing harness: Codex; version/build: unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: The pinned Rust extraction replay and Lean checker.

Specification:
- [Graph projection model][model]
- [Formal validation scope][digest]

Boundary: This theorem concerns one helper under the pinned translator and Lean assumptions, not the whole validator or application.

[source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/proofs/rust/SpendProof.lean
[model]: ../../../docs/05-domain/diagrams/graph-projections.c4
[digest]: ../../../docs/08-assurance/formal-validation-digest.md
-/
open Aeneas Aeneas.Std
open hypergraph_domain

/-- Successful or exhausted budget accounting for the real Rust helper. -/
theorem spend_spec (work budget : Usize) :
    expansion.spend work budget ⦃ out => /- Classify the returned result and updated work counter. -/
      (work.val < budget.val ∧ out.1 = .Ok () ∧ out.2.val = work.val + 1) ∨
      (budget.val ≤ work.val ∧ out.1 = .Err .Budget ∧ out.2 = work) ⦄ := by
  unfold expansion.spend
  split
  · simp_all
  · step
    scalar_tac

#print axioms spend_spec
