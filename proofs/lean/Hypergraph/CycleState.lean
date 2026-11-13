-- SPDX-License-Identifier: AGPL-3.0-only
import Init

/-! Pure finite selected-state semantics, OWNER045. Nat tokens below are abstract
exact identities/versions/bytes, not a wire/storage encoding or a hash algorithm.
Fin bounds provide a validated total table. Authentication/access/real-byte and
source-emitter correspondence are external; no I/O, serialization or crypto. -/
namespace Hypergraph.CycleState

structure Source where
  kind : Nat
  identity : Nat
  version : Nat
  rangeStart : Nat
  rangeEnd : Nat
  mode : Nat
  bytes : List UInt8
  dependencies : List Nat
  deriving DecidableEq, Repr

structure Slot (n : Nat) where
  occurrence : Nat
  role : Nat
  target : Fin n
  deriving DecidableEq, Repr

structure Row (n : Nat) where
  source : Source
  slots : List (Slot n)
  deriving DecidableEq, Repr

structure Bundle (n : Nat) where
  scope : Nat
  cyclePolicy : Nat
  sourcePolicy : Nat
  row : Fin n → Row n

structure Key (n : Nat) where
  scope : Nat
  cyclePolicy : Nat
  sourcePolicy : Nat
  descriptor : Row n
  deriving DecidableEq

def key (b : Bundle n) (s : Fin n) : Key n :=
  ⟨b.scope, b.cyclePolicy, b.sourcePolicy, b.row s⟩

def SameState (b : Bundle n) (s t : Fin n) : Prop := key b s = key b t

instance (b : Bundle n) (s t : Fin n) : Decidable (SameState b s t) :=
  inferInstanceAs (Decidable (key b s = key b t))

theorem sameState_equivalence (b : Bundle n) : Equivalence (SameState b) :=
  ⟨fun _ => rfl, fun h => h.symm, fun h₁ h₂ => h₁.trans h₂⟩

theorem key_sound (b : Bundle n) {s t : Fin n} (h : SameState b s t) :
    b.row s = b.row t := congrArg Key.descriptor h

theorem sameState_iff (b : Bundle n) (s t : Fin n) :
    SameState b s t ↔ b.row s = b.row t := by
  constructor
  · exact key_sound b
  · intro h; unfold SameState key; rw [h]

theorem different_selection (b : Bundle n) {s t : Fin n}
    (h : (b.row s).source ≠ (b.row t).source ∨ (b.row s).slots ≠ (b.row t).slots) :
    ¬ SameState b s t := by
  intro e
  have r := key_sound b e
  cases h with
  | inl h => exact h (congrArg Row.source r)
  | inr h => exact h (congrArg Row.slots r)

structure Frame (n : Nat) where
  target : Fin n
  path : List Nat
  deriving DecidableEq, Repr

def nearest (b : Bundle n) (active : List (Frame n)) (s : Fin n) : Option (Frame n) :=
  active.find? (fun f => decide (b.row f.target = b.row s))

inductive Use (n : Nat) where
  | expanded (target : Fin n) (path : List Nat) (children : List (Use n))
  | boundary (target : Fin n) (path : List Nat) (ancestor : Frame n)
  deriving Repr

/- Independent specification: exact target/path, nearest real ancestor,
ordered children, with the same parent stack supplied independently to siblings. -/
mutual
  inductive Covers (b : Bundle n) : List (Frame n) → Fin n → List Nat → Use n → Prop where
    | boundary {active s path f} (hit : nearest b active s = some f) :
        Covers b active s path (.boundary s path f)
    | expanded {active s path children} (clear : nearest b active s = none)
        (ordered : CoversSlots b (⟨s, path⟩ :: active) path (b.row s).slots children) :
        Covers b active s path (.expanded s path children)
  inductive CoversSlots (b : Bundle n) :
      List (Frame n) → List Nat → List (Slot n) → List (Use n) → Prop where
    | nil {active path} : CoversSlots b active path [] []
    | cons {active path slot slots child children}
        (head : Covers b active slot.target (path ++ [slot.occurrence]) child)
        (tail : CoversSlots b active path slots children) :
        CoversSlots b active path (slot :: slots) (child :: children)
end

theorem coversSlots_map (b : Bundle n) (active : List (Frame n)) (path : List Nat)
    (f : (slot : Slot n) → {u : Use n // Covers b active slot.target
      (path ++ [slot.occurrence]) u}) (slots : List (Slot n)) :
    CoversSlots b active path slots (slots.map fun slot => (f slot).val) := by
  induction slots with
  | nil => exact .nil
  | cons s ss ih => exact .cons (f s).property ih

/-- All states are either still available for descent or have a real active frame. -/
def Available (b : Bundle n) (remaining : List (Row n)) (active : List (Frame n)) : Prop :=
  ∀ s, b.row s ∈ remaining ∨ ∃ f ∈ active, b.row f.target = b.row s

theorem nearest_witness (b : Bundle n) {active : List (Frame n)} {s : Fin n} {f : Frame n}
    (h : nearest b active s = some f) : f ∈ active ∧ b.row f.target = b.row s := by
  exact ⟨List.mem_of_find?_eq_some h, of_decide_eq_true (List.find?_some (p := fun (g : Frame n) => decide (b.row g.target = b.row s)) h)⟩

theorem nearest_none (b : Bundle n) {active : List (Frame n)} {s : Fin n}
    (h : nearest b active s = none) : ∀ f ∈ active, b.row f.target ≠ b.row s := by
  simpa [nearest, List.find?_eq_none] using h

/-- Removing the just-expanded descriptor preserves exhaustiveness: all aliases
of it are witnessed by the new frame; every other state stays available. -/
theorem available_descend (b : Bundle n) {remaining : List (Row n)}
    {active : List (Frame n)} (h : Available b remaining active) (s : Fin n) (path : List Nat) :
    Available b (remaining.erase (b.row s)) (⟨s, path⟩ :: active) := by
  intro t
  by_cases eq : b.row t = b.row s
  · exact Or.inr ⟨⟨s, path⟩, List.mem_cons_self, eq.symm⟩
  · rcases h t with mem | ⟨f, mem, same⟩
    · exact Or.inl ((List.mem_erase_of_ne eq).mpr mem)
    · exact Or.inr ⟨f, List.mem_cons_of_mem _ mem, same⟩

/-- Well-founded finite unfolding; no fuel/budget axiom and no cycle rejection.
Each descent strictly reduces available descriptors. Child mapping is finite. -/
def build (b : Bundle n) (remaining : List (Row n)) (active : List (Frame n))
    (available : Available b remaining active) (s : Fin n) (path : List Nat) :
    {u : Use n // Covers b active s path u} :=
  match hit : nearest b active s with
  | some f => ⟨.boundary s path f, .boundary hit⟩
  | none =>
    have mem : b.row s ∈ remaining := by
      rcases available s with mem | ⟨f, mem, eq⟩
      · exact mem
      · exact False.elim (nearest_none b hit f mem eq)
    let children : List (Use n) := (b.row s).slots.map fun slot =>
      (build b (remaining.erase (b.row s)) (⟨s, path⟩ :: active)
        (available_descend b available s path) slot.target (path ++ [slot.occurrence])).val
    ⟨.expanded s path children, .expanded hit (by
      simpa [children, List.map_map] using
        coversSlots_map b (⟨s, path⟩ :: active) path (fun slot => build b (remaining.erase (b.row s)) (⟨s, path⟩ :: active)
          (available_descend b available s path) slot.target (path ++ [slot.occurrence]))
          (b.row s).slots)⟩
termination_by remaining.length
decreasing_by
  all_goals
    rw [List.length_erase_of_mem mem]
    have := List.length_pos_of_mem mem
    omega

def complete (b : Bundle n) (root : Fin n) : {u : Use n // Covers b [] root [] u} :=
  build b (List.ofFn b.row) [] (by
    intro s
    exact Or.inl (List.mem_ofFn.mpr ⟨s, rfl⟩)) root []

theorem complete_covers (b : Bundle n) (root : Fin n) :
    Covers b [] root [] (complete b root).val := (complete b root).property

def ActiveInvariant (b : Bundle n) (active : List (Frame n)) : Prop :=
  (active.map fun f => b.row f.target).Nodup

theorem active_descend {b : Bundle n} {active : List (Frame n)} {s path}
    (inv : ActiveInvariant b active) (clear : nearest b active s = none) :
    ActiveInvariant b (⟨s, path⟩ :: active) := by
  simp only [ActiveInvariant, List.map_cons, List.nodup_cons]
  constructor
  · intro mem
    rcases List.mem_map.mp mem with ⟨f, hf, eq⟩
    exact nearest_none b clear f hf eq
  · exact inv

/-- Consistent handle renaming acts only on scoped target references. -/
def renameSlot (f : Fin n → Fin m) (s : Slot n) : Slot m :=
  ⟨s.occurrence, s.role, f s.target⟩

def renameRow (f : Fin n → Fin m) (r : Row n) : Row m :=
  ⟨r.source, r.slots.map (renameSlot f)⟩

theorem rename_roundtrip (f : Fin n → Fin m) (g : Fin m → Fin n)
    (inverse : ∀ s, g (f s) = s) (r : Row n) :
    renameRow g (renameRow f r) = r := by
  cases r with
  | mk source slots =>
    simp only [renameRow, List.map_map]
    congr 1
    have h : renameSlot g ∘ renameSlot f = id := by
      funext x
      cases x
      simp [renameSlot, inverse]
    rw [h, List.map_id]

theorem renamed_descriptor_equality (f : Fin n → Fin m) (g : Fin m → Fin n)
    (inverse : ∀ s, g (f s) = s) (r t : Row n) :
    renameRow f r = renameRow f t ↔ r = t := by
  constructor
  · intro h
    have e := congrArg (renameRow g) h
    simpa only [rename_roundtrip f g inverse] using e
  · intro h; rw [h]

/- Uniqueness is proved from the independent coverage relation, not by assuming
that construction output is canonical. -/
mutual
  theorem covers_unique {b : Bundle n} {active s path u v}
      (h : Covers b active s path u) (g : Covers b active s path v) : u = v := by
    cases h with
    | boundary hit =>
      cases g with
      | boundary hit' => rw [hit] at hit'; cases hit'; rfl
      | expanded clear _ => rw [hit] at clear; contradiction
    | expanded clear ordered =>
      cases g with
      | boundary hit => rw [clear] at hit; contradiction
      | expanded _ ordered' => rw [coversSlots_unique ordered ordered']
  theorem coversSlots_unique {b : Bundle n} {active path slots us vs}
      (h : CoversSlots b active path slots us) (g : CoversSlots b active path slots vs) : us = vs := by
    cases h with
    | nil => cases g; rfl
    | cons head tail =>
      cases g with
      | cons head' tail' => rw [covers_unique head head', coversSlots_unique tail tail']
end

theorem ordered_length {b : Bundle n} {active path slots children}
    (h : CoversSlots b active path slots children) : children.length = slots.length := by
  exact CoversSlots.rec (motive_1 := fun _ _ _ _ _ => True)
    (motive_2 := fun _ _ slots children _ => children.length = slots.length)
    (fun _ => True.intro) (fun _ _ _ => True.intro) rfl
    (fun _ _ _ ih => congrArg Nat.succ ih) h

theorem boundary_justified {b : Bundle n} {active s path f}
    (h : Covers b active s path (.boundary s path f)) :
    f ∈ active ∧ SameState b f.target s := by
  cases h with
  | boundary hit =>
    have w := nearest_witness b hit
    exact ⟨w.1, (sameState_iff b _ _).mpr w.2⟩

/-- Cost is the number of uses in the mathematical finite result. It is NOT
an operational CPU/bytes/stack bound for evaluating build in Lean or Rust. -/
def useCount : Use n → Nat
  | .boundary _ _ _ => 1
  | .expanded _ _ children => 1 + (children.map useCount).sum

inductive Failure where
  | invalid | missing | denied | unresolved | budget | unsupported
  deriving DecidableEq, Repr

inductive Outcome (n : Nat) where
  | complete (result : Use n)
  | failed (reason : Failure)
  deriving Repr

/-- Supplied preflight failures cannot become cycle boundaries or success.
Budget admission is a declarative result-size bound, not a production scheduler. -/
def run (b : Bundle n) (root : Fin n) (preflight : Option Failure) (budget : Nat) : Outcome n :=
  match preflight with
  | some e => .failed e
  | none =>
    let u := (complete b root).val
    if useCount u ≤ budget then .complete u else .failed .budget

theorem preflight_failure (b : Bundle n) (root : Fin n) (e : Failure) (budget : Nat) :
    run b root (some e) budget = .failed e := rfl

theorem successful_coverage {b : Bundle n} {root preflight budget u}
    (h : run b root preflight budget = .complete u) :
    Covers b [] root [] u ∧ useCount u ≤ budget ∧ preflight = none := by
  cases preflight with
  | some e => simp [run] at h
  | none =>
    simp only [run] at h
    split at h
    · cases h; exact ⟨complete_covers b root, ‹_›, rfl⟩
    · contradiction

theorem adequate_budget (b : Bundle n) (root : Fin n)
    (budget : Nat) (h : useCount (complete b root).val ≤ budget) :
    run b root none budget = .complete (complete b root).val := by simp [run, h]

theorem output_deterministic {b : Bundle n} {root p₁ p₂ k₁ k₂ u v}
    (h : run b root p₁ k₁ = .complete u) (g : run b root p₂ k₂ = .complete v) : u = v :=
  covers_unique (successful_coverage h).1 (successful_coverage g).1

structure Warning (n : Nat) where
  target : Fin n
  path : List Nat
  ancestor : Frame n
  visible : Bool
  action : Bool
  deriving DecidableEq, Repr

def warnings : Use n → List (Warning n)
  | .boundary t p a => [⟨t, p, a, true, true⟩]
  | .expanded _ _ cs => (cs.map warnings).flatten

/-- Every presented boundary includes both warning and deliberate target action. -/
theorem warnings_visible (u : Use n) :
    ∀ w ∈ warnings u, w.visible = true ∧ w.action = true := by
  cases u with
  | boundary t p a => simp [warnings]
  | expanded t p cs =>
    intro w mem
    simp only [warnings, List.mem_flatten, List.mem_map] at mem
    rcases mem with ⟨ws, ⟨c, hc, rfl⟩, hw⟩
    exact warnings_visible c w hw

inductive BoundaryAt : Use n → Fin n → List Nat → Frame n → Prop where
  | here : BoundaryAt (.boundary t p a) t p a
  | child : c ∈ cs → BoundaryAt c t p a → BoundaryAt (.expanded s path cs) t p a

theorem every_boundary_warned {u : Use n} {t p a} (h : BoundaryAt u t p a) :
    (⟨t, p, a, true, true⟩ : Warning n) ∈ warnings u := by
  induction h with
  | here => simp [warnings]
  | child hc _ ih =>
    simp only [warnings, List.mem_flatten, List.mem_map]
    exact ⟨_, ⟨_, hc, rfl⟩, ih⟩

inductive Event (n : Nat) where
  | render | retry | openComparison
  | click (warning : Warning n)
  | resolve (authorized : Bool)
  deriving Repr

structure Navigation (n : Nat) where
  view : Use n
  conflictPending : Bool
  comparisonOpen : Bool
  lastFailure : Option Failure := none

/-- One click performs at most one finite run at the retained exact target.
Permission result is supplied, not granted or proved by this model. -/
def step (b : Bundle n) (budget : Nat) (access : Fin n → Bool)
    (state : Navigation n) (event : Event n) : Navigation n :=
  match event with
  | .render | .retry => state
  | .openComparison => {state with comparisonOpen := true}
  | .resolve authorized => if authorized then {state with conflictPending := false} else state
  | .click w =>
    if w ∈ warnings state.view then
      if access w.target = true then
        match run b w.target none budget with
        | .complete u => {state with view := u, lastFailure := none}
        | .failed e => {state with lastFailure := some e}
      else {state with lastFailure := some .denied}
    else {state with lastFailure := some .invalid}

/-- Non-click events cannot change the view, including render/retry/comparison. -/
theorem no_automatic_open (b : Bundle n) (budget : Nat) (access : Fin n → Bool)
    (state : Navigation n) (event : Event n)
    (h : ∀ w, event ≠ .click w) : (step b budget access state event).view = state.view := by
  cases event with
  | render => rfl
  | retry => rfl
  | openComparison => rfl
  | resolve a => cases a <;> rfl
  | click w => exact False.elim (h w rfl)

theorem authorized_click (b : Bundle n) (budget : Nat) (access : Fin n → Bool)
    (state : Navigation n) (w : Warning n) (mem : w ∈ warnings state.view)
    (allowed : access w.target = true) :
    (step b budget access state (.click w)).view =
      match run b w.target none budget with
      | .complete u => u
      | .failed _ => state.view := by
  simp only [step, mem, allowed, ite_true]
  cases run b w.target none budget <;> rfl

theorem denied_click (b : Bundle n) (budget : Nat) (access : Fin n → Bool)
    (state : Navigation n) (w : Warning n) (mem : w ∈ warnings state.view)
    (denied : access w.target = false) :
    (step b budget access state (.click w)).view = state.view ∧
    (step b budget access state (.click w)).lastFailure = some .denied := by
  simp [step, mem, denied]

theorem comparison_keeps_marker (b : Bundle n) (budget : Nat) (access : Fin n → Bool)
    (state : Navigation n) :
    (step b budget access state .openComparison).conflictPending = state.conflictPending := rfl

theorem click_keeps_marker (b : Bundle n) (budget : Nat) (access : Fin n → Bool)
    (state : Navigation n) (w : Warning n) :
    (step b budget access state (.click w)).conflictPending = state.conflictPending := by
  simp only [step]
  split
  · split
    · split <;> rfl
    · rfl
  · rfl

def useTarget : Use n → Fin n
  | .expanded t _ _ | .boundary t _ _ => t

def usePath : Use n → List Nat
  | .expanded _ p _ | .boundary _ p _ => p

theorem covered_target_path {b : Bundle n} {active s path u}
    (h : Covers b active s path u) : useTarget u = s ∧ usePath u = path := by
  cases h <;> exact ⟨rfl, rfl⟩

theorem ordered_targets_paths {b : Bundle n} {active path slots children}
    (h : CoversSlots b active path slots children) :
    children.map useTarget = slots.map Slot.target ∧
    children.map usePath = slots.map (fun slot => path ++ [slot.occurrence]) := by
  exact CoversSlots.rec
    (motive_1 := fun _ s path u _ => useTarget u = s ∧ usePath u = path)
    (motive_2 := fun _ path slots children _ =>
      children.map useTarget = slots.map Slot.target ∧
      children.map usePath = slots.map (fun slot => path ++ [slot.occurrence]))
    (fun _ => ⟨rfl, rfl⟩) (fun _ _ _ => ⟨rfl, rfl⟩) ⟨rfl, rfl⟩
    (fun _ _ head tail => by
      simp only [List.map_cons]
      exact ⟨by rw [head.1, tail.1], by rw [head.2, tail.2]⟩) h

/-- A current access predicate can deny navigation; it never selects another
historical target. Only explicit authorised resolution can clear the marker. -/
theorem only_resolution_clears (b : Bundle n) (budget : Nat) (access : Fin n → Bool)
    (state : Navigation n) (event : Event n) (notResolve : event ≠ .resolve true) :
    (step b budget access state event).conflictPending = state.conflictPending := by
  cases event with
  | render => rfl
  | retry => rfl
  | openComparison => rfl
  | click w => exact click_keeps_marker b budget access state w
  | resolve a => cases a with
    | false => rfl
    | true => exact False.elim (notResolve rfl)

def events (b : Bundle n) (budget : Nat) (access : Fin n → Bool)
    (state : Navigation n) (es : List (Event n)) : Navigation n :=
  es.foldl (step b budget access) state

theorem no_click_trace (b : Bundle n) (budget : Nat) (access : Fin n → Bool)
    (es : List (Event n)) (noClick : ∀ e ∈ es, ∀ w, e ≠ .click w) (state : Navigation n) :
    (events b budget access state es).view = state.view := by
  induction es generalizing state with
  | nil => rfl
  | cons e es ih =>
    simp only [events, List.foldl_cons]
    have tail := ih (fun a ha => noClick a (List.mem_cons_of_mem e ha))
      (step b budget access state e)
    exact tail.trans (no_automatic_open b budget access state e
      (noClick e List.mem_cons_self))

/-- Ordered slots must also be faithful to authenticated source, which this
structural predicate does not establish. No parser/lookup validator is proved. -/
def WellFormed (b : Bundle n) : Prop :=
  ∀ s, ((b.row s).slots.map Slot.occurrence).Nodup

end Hypergraph.CycleState

#print axioms Hypergraph.CycleState.sameState_equivalence
#print axioms Hypergraph.CycleState.key_sound
#print axioms Hypergraph.CycleState.sameState_iff
#print axioms Hypergraph.CycleState.different_selection
#print axioms Hypergraph.CycleState.coversSlots_map
#print axioms Hypergraph.CycleState.nearest_witness
#print axioms Hypergraph.CycleState.nearest_none
#print axioms Hypergraph.CycleState.available_descend
#print axioms Hypergraph.CycleState.complete_covers
#print axioms Hypergraph.CycleState.active_descend
#print axioms Hypergraph.CycleState.rename_roundtrip
#print axioms Hypergraph.CycleState.renamed_descriptor_equality
#print axioms Hypergraph.CycleState.covers_unique
#print axioms Hypergraph.CycleState.coversSlots_unique
#print axioms Hypergraph.CycleState.ordered_length
#print axioms Hypergraph.CycleState.boundary_justified
#print axioms Hypergraph.CycleState.preflight_failure
#print axioms Hypergraph.CycleState.successful_coverage
#print axioms Hypergraph.CycleState.adequate_budget
#print axioms Hypergraph.CycleState.output_deterministic
#print axioms Hypergraph.CycleState.warnings_visible
#print axioms Hypergraph.CycleState.every_boundary_warned
#print axioms Hypergraph.CycleState.no_automatic_open
#print axioms Hypergraph.CycleState.authorized_click
#print axioms Hypergraph.CycleState.denied_click
#print axioms Hypergraph.CycleState.comparison_keeps_marker
#print axioms Hypergraph.CycleState.click_keeps_marker
#print axioms Hypergraph.CycleState.covered_target_path
#print axioms Hypergraph.CycleState.ordered_targets_paths
#print axioms Hypergraph.CycleState.only_resolution_clears
#print axioms Hypergraph.CycleState.no_click_trace
