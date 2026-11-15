-- SPDX-License-Identifier: AGPL-3.0-only
import Init
/-!
# Hypergraph PX — Conditional acyclic projection lemmas

Explain the rank witness sufficient for acyclic paths and forward edge insertion.

Source: [Latest source on GitHub][source]

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex /root (OpenAI coding agent).
Latest editing harness: Codex; version/build: unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Lean model checks and formal-assurance reviewers.

Specification:
- [Graph projection model][model]
- [Formal validation scope][digest]

Boundary: Conditional DAG lemmas do not forbid accepted cyclic inclusion or prove production traversal.

Preserved model premises:
# Conditional rank/path model

These historical DAG results assume a strict natural-number rank for every edge
in a selected projection. They do not prohibit the subsequently accepted cyclic
inclusion relationships: CycleState models bounded cycle-aware traversal instead.
Nothing here authenticates inputs or proves the Rust validator/storage/UI correct.
Each induction uses only the supplied edge/rank hypotheses; axiom reports at EOF
make the trusted declaration dependencies visible during direct Lean checks.

[source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/proofs/lean/Hypergraph/Expansion.lean
[model]: ../../../../docs/05-domain/diagrams/graph-projections.c4
[digest]: ../../../../docs/08-assurance/formal-validation-digest.md
-/

namespace Hypergraph

universe u

/-- A nonempty directed path in the selected expansion projection. -/
inductive Path {V : Type u} (edge : V → V → Prop) : V → V → Prop where
  | single {a b : V} : edge a b → Path edge a b
  | extend {a b c : V} : Path edge a b → edge b c → Path edge a c

/-- No nonempty selected path returns to its starting vertex. -/
def Acyclic {V : Type u} (edge : V → V → Prop) : Prop :=
  ∀ v, ¬ Path edge v v

/-- A strict topological rank witness, not authorial reading order. -/
def RespectsRank {V : Type u} (edge : V → V → Prop) (rank : V → Nat) : Prop :=
  ∀ {a b}, edge a b → rank a < rank b

/-- Induct on path construction: a single edge increases rank by assumption;
    extending a path composes two strict inequalities by transitivity. -/
theorem path_increases {V : Type u} {edge : V → V → Prop} {rank : V → Nat}
    (ordered : RespectsRank edge rank) {a b : V} (path : Path edge a b) :
    rank a < rank b := by
  induction path with
  | single h => exact ordered h
  | extend _ h ih => exact Nat.lt_trans ih (ordered h)

/-- A self-returning path would make a natural rank strictly less than itself.
    This is conditional on the rank witness, not a proof that one can be found. -/
theorem rank_implies_acyclic {V : Type u} {edge : V → V → Prop} {rank : V → Nat}
    (ordered : RespectsRank edge rank) : Acyclic edge := by
  intro v path
  exact Nat.lt_irrefl (rank v) (@path_increases V edge rank ordered v v path)

/-- Retain every original edge and allow exactly the specified new endpoint pair. -/
def AddEdge {V : Type u} (edge : V → V → Prop) (source target : V) : V → V → Prop :=
  -- Test the original edge or the single explicitly inserted endpoint pair.
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

/-- Reuse the preserved rank witness and the preceding no-self-path result.
    This sufficient insertion rule makes no claim about all safe insertions. -/
theorem forward_insertion_preserves_acyclic {V : Type u}
    {edge : V → V → Prop} {rank : V → Nat} {source target : V}
    (ordered : RespectsRank edge rank) (forward : rank source < rank target) :
    Acyclic (AddEdge edge source target) :=
  @rank_implies_acyclic V (AddEdge edge source target) rank
    (@forward_insertion_preserves_rank V edge rank source target ordered forward)

-- Concrete positive case: successor edges increase the identity rank.
example : Acyclic (fun a b : Nat => /- Select successor edges for the positive example. -/ b = a + 1) := by
  apply rank_implies_acyclic (rank := fun n => /- Use each natural vertex as its own rank. -/ n)
  intro a b h
  rw [h]
  exact Nat.lt_succ_self a

-- Negative guard: one self-edge already witnesses a nonempty cycle.
example : ¬ Acyclic (fun a b : Nat => /- Select self-edges to witness the negative guard. -/ a = b) := by
  intro acyclic
  exact acyclic 0 (Path.single rfl)

end Hypergraph

#print axioms Hypergraph.path_increases
#print axioms Hypergraph.rank_implies_acyclic
#print axioms Hypergraph.forward_insertion_preserves_rank
#print axioms Hypergraph.forward_insertion_preserves_acyclic
