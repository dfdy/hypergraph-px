-- SPDX-License-Identifier: AGPL-3.0-only
import Init

namespace Hypergraph

universe u

/-- A nonempty directed path in the selected expansion projection. -/
inductive Path {V : Type u} (edge : V → V → Prop) : V → V → Prop where
  | single {a b : V} : edge a b → Path edge a b
  | extend {a b c : V} : Path edge a b → edge b c → Path edge a c

def Acyclic {V : Type u} (edge : V → V → Prop) : Prop :=
  ∀ v, ¬ Path edge v v

/-- A strict topological rank witness, not authorial reading order. -/
def RespectsRank {V : Type u} (edge : V → V → Prop) (rank : V → Nat) : Prop :=
  ∀ {a b}, edge a b → rank a < rank b

theorem path_increases {V : Type u} {edge : V → V → Prop} {rank : V → Nat}
    (ordered : RespectsRank edge rank) {a b : V} (path : Path edge a b) :
    rank a < rank b := by
  induction path with
  | single h => exact ordered h
  | extend _ h ih => exact Nat.lt_trans ih (ordered h)

theorem rank_implies_acyclic {V : Type u} {edge : V → V → Prop} {rank : V → Nat}
    (ordered : RespectsRank edge rank) : Acyclic edge := by
  intro v path
  exact Nat.lt_irrefl (rank v) (@path_increases V edge rank ordered v v path)

def AddEdge {V : Type u} (edge : V → V → Prop) (source target : V) : V → V → Prop :=
  fun a b => edge a b ∨ (a = source ∧ b = target)

/-- A sufficient safe-insertion rule; not every valid insertion retains an old rank. -/
theorem forward_insertion_preserves_rank {V : Type u}
    {edge : V → V → Prop} {rank : V → Nat} {source target : V}
    (ordered : RespectsRank edge rank) (forward : rank source < rank target) :
    RespectsRank (AddEdge edge source target) rank := by
  intro a b h
  cases h with
  | inl original => exact ordered original
  | inr inserted =>
    rcases inserted with ⟨rfl, rfl⟩
    exact forward

theorem forward_insertion_preserves_acyclic {V : Type u}
    {edge : V → V → Prop} {rank : V → Nat} {source target : V}
    (ordered : RespectsRank edge rank) (forward : rank source < rank target) :
    Acyclic (AddEdge edge source target) :=
  @rank_implies_acyclic V (AddEdge edge source target) rank
    (@forward_insertion_preserves_rank V edge rank source target ordered forward)

example : Acyclic (fun a b : Nat => b = a + 1) := by
  apply rank_implies_acyclic (rank := fun n => n)
  intro a b h
  rw [h]
  exact Nat.lt_succ_self a

example : ¬ Acyclic (fun a b : Nat => a = b) := by
  intro acyclic
  exact acyclic 0 (Path.single rfl)

end Hypergraph

#print axioms Hypergraph.path_increases
#print axioms Hypergraph.rank_implies_acyclic
#print axioms Hypergraph.forward_insertion_preserves_rank
#print axioms Hypergraph.forward_insertion_preserves_acyclic
