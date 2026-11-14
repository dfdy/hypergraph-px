-- SPDX-License-Identifier: AGPL-3.0-only
import Spend
open Aeneas Aeneas.Std
open hypergraph_domain

/-- Successful or exhausted budget accounting for the real Rust helper. -/
theorem spend_spec (work budget : Usize) :
    expansion.spend work budget ⦃ out =>
      (work.val < budget.val ∧ out.1 = .Ok () ∧ out.2.val = work.val + 1) ∨
      (budget.val ≤ work.val ∧ out.1 = .Err .Budget ∧ out.2 = work) ⦄ := by
  unfold expansion.spend
  split
  · simp_all
  · step
    scalar_tac

#print axioms spend_spec
