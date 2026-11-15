-- SPDX-License-Identifier: AGPL-3.0-only
import Hypergraph.CycleState

/-!
# Hypergraph PX — Conditional exact source-emission model

Emit exact owned byte slices from a finite covered use tree under one frozen
source interpretation, keeping warnings outside authored source.

Source: [Latest source on GitHub][source]

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex /root (OpenAI coding agent).
Latest editing harness: Codex; version/build: unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Lean source-emission examples and formal assurance CI; the model
is a verification input, not a runtime parser or persistence format.

Specification:
- [Conceptual projection and boundary scope][model]
- [Boundary source policy][boundary]
- [Exact formal assurance digest][digest]

Boundary: Source faithfulness, authentication, selected-to-full-source binding and
UTF8/browser correspondence are supplied premises. Structural partition validity
alone does not establish notation grammar or actual application correspondence.

Preserved model premises:
OWNER047 source-emission model. This is an in-memory mathematical witness
format, not an adopted parser, source grammar, persistent DTO or runtime API.
A frozen interpretation supplies exact source-faithful partitions; bounds/order
are checked here, but grammar/authentication/UTF8 scalar validity are external.

[source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/proofs/lean/Hypergraph/SourceEmission.lean
[model]: ../../../../docs/05-domain/diagrams/graph-projections.c4
[boundary]: ../../../../docs/05-domain/proposals/cycle-boundary-source-emission.md
[digest]: ../../../../docs/08-assurance/formal-validation-digest.md
-/
namespace Hypergraph.SourceEmission
open CycleState

/-- Ordered bounded cuts into one supplied selected-source byte list; scalar validity is external. -/
structure Span (length : Nat) where
  lo : Nat
  hi : Nat
  ordered : lo ≤ hi
  bounded : hi ≤ length
  deriving Repr

/-- Compute the exact selected byte length from ordered bounds without normalization. -/
def Span.length (s : Span n) : Nat := s.hi - s.lo

/-- One ordered inclusion tag with preceding literal bytes and original including-source notation. -/
structure Part (length : Nat) where
  occurrence : Nat
  role : Nat
  before : Span length
  originalRange : Span length
  deriving Repr

/-- Frozen literal/notation partition and tail for one exact selected row. -/
structure Plan (r : Row n) where
  parts : List (Part r.source.bytes.length)
  tail : Span r.source.bytes.length
  deriving Repr

/-- Partition the original selected source into literal/notation intervals.
No interpretation of notation grammar is inferred from an arbitrary partition. -/
def Chain (cursor : Nat) (parts : List (Part len)) (tail : Span len) : Bool :=
  match parts with
  | [] => decide (tail.lo = cursor ∧ tail.hi = len)
  | p :: ps => decide (p.before.lo = cursor ∧ p.before.hi = p.originalRange.lo) &&
      Chain p.originalRange.hi ps tail

/-- Require tag order to equal selected slots and ranges to partition the source;
    this structural relation does not prove parser or source faithfulness. -/
def PlanOK (r : Row n) (p : Plan r) : Prop :=
  p.parts.map (/- Project only occurrence/role tags for ordered alignment. -/ fun x => (x.occurrence, x.role)) =
    r.slots.map (/- Project only occurrence/role tags for ordered alignment. -/ fun x => (x.occurrence, x.role)) ∧ Chain 0 p.parts p.tail = true

/-- Decide the finite structural tag/partition checks, not interpretation faithfulness. -/
instance (r : Row n) (p : Plan r) : Decidable (PlanOK r p) :=
  inferInstanceAs (Decidable (_ ∧ _))

/-- Same descriptor has the same interpretation, including aliases. Reproduction
requires the same frozen function, not merely an equal policy-ID token. -/
def Interpretation (n : Nat) := (r : Row n) → Option (Plan r)

/-- Exact including owner/path/notation range carried into one selected child use. -/
structure Incoming (b : Bundle n) where
  owner : Fin n
  ownerPath : List Nat
  range : Span (b.row owner).source.bytes.length
  deriving Repr

/-- Stopped target/path and real ancestor metadata, distinct from the source owner. -/
structure Stop (n : Nat) where
  target : Fin n
  path : List Nat
  ancestor : Frame n
  deriving Repr

/-- One bounded owned-source slice plus optional stop metadata; no generated warning bytes. -/
structure Copy (b : Bundle n) where
  owner : Fin n
  ownerPath : List Nat
  range : Span (b.row owner).source.bytes.length
  stop : Option (Stop n)
  deriving Repr

/-- Create an ordinary source slice owned by the exact row and occurrence context. -/
def literal (b : Bundle n) (owner : Fin n) (path : List Nat)
    (span : Span (b.row owner).source.bytes.length) : Copy b := ⟨owner, path, span, none⟩

/-- Preserve the incoming including-source notation while recording exact stopped target/ancestor. -/
def stopped {b : Bundle n} (incoming : Incoming b) (s : Fin n) (path : List Nat) (ancestor : Frame n) : Copy b :=
  ⟨incoming.owner, incoming.ownerPath, incoming.range, some ⟨s, path, ancestor⟩⟩

/-- Read this copy’s exact selected-source byte slice from its owner, not from a newer head. -/
def copyBytes (c : Copy b) : List UInt8 :=
  ((b.row c.owner).source.bytes.drop c.range.lo).take c.range.length

/-- Concatenate only owned copy slices in order; presentation warnings are not inputs. -/
def sourceBytes (copies : List (Copy b)) : List UInt8 := copies.flatMap copyBytes

/- Independent emission specification: every chunk is a bounded exact owned
slice. At a boundary it is the incoming notation, never the target body or a
warning/placeholder string. Expanded children replace only their notation span. -/
mutual
  /-- Independently specify exact boundary or expanded source contribution for a finite use. -/
  inductive Emits (b : Bundle n) (interpret : Interpretation n) :
      Option (Incoming b) → Use n → List (Copy b) → Prop where
    | boundary {incoming s path ancestor} :
        Emits b interpret (some incoming) (.boundary s path ancestor)
          [stopped incoming s path ancestor]
    | expanded {incoming s path children plan copies}
        (loaded : interpret (b.row s) = some plan) (valid : PlanOK (b.row s) plan)
        (parts : EmitsParts b interpret s path plan.parts children copies) :
        Emits b interpret incoming (.expanded s path children)
          (copies ++ [literal b s path plan.tail])
  /-- Specify ordered literal/child contributions and exact one-to-one child/part coverage. -/
  inductive EmitsParts (b : Bundle n) (interpret : Interpretation n) :
      (owner : Fin n) → List Nat →
      List (Part (b.row owner).source.bytes.length) → List (Use n) → List (Copy b) → Prop where
    | nil {owner path} : EmitsParts b interpret owner path [] [] []
    | cons {owner path part parts child children head tail}
        (childSource : Emits b interpret (some ⟨owner, path, part.originalRange⟩) child head)
        (rest : EmitsParts b interpret owner path parts children tail) :
        EmitsParts b interpret owner path (part :: parts) (child :: children)
          (literal b owner path part.before :: (head ++ tail))
end

/-- Missing/invalid interpretation, wrong arity or missing boundary context; none is success. -/
inductive Error where
  | missingInterpretation | invalidPartition | arity | orphanBoundary
  deriving DecidableEq, Repr

mutual
  /-- Construct bounded source-copy witnesses for one use or return an explicit error;
      a cycle boundary requires incoming including-source context. -/
  def emit (b : Bundle n) (interpret : Interpretation n) (incoming : Option (Incoming b))
      (u : Use n) : Except Error {copies : List (Copy b) // Emits b interpret incoming u copies} :=
    match u with
    | .boundary s path ancestor =>
      match incoming with
      | none => .error .orphanBoundary
      | some i => .ok ⟨[stopped i s path ancestor], .boundary⟩
    | .expanded s path children =>
      match loaded : interpret (b.row s) with
      | none => .error .missingInterpretation
      | some plan =>
        if valid : PlanOK (b.row s) plan then
          match emitParts b interpret s path plan.parts children with
          | .error e => .error e
          | .ok out => .ok ⟨out.val ++ [literal b s path plan.tail],
              .expanded loaded valid out.property⟩
        else .error .invalidPartition
  termination_by sizeOf u
  /-- Emit one child per notation part in order, retaining preceding literals
      and rejecting unequal part/child arity rather than truncating. -/
  def emitParts (b : Bundle n) (interpret : Interpretation n) (owner : Fin n)
      (path : List Nat) (parts : List (Part (b.row owner).source.bytes.length))
      (children : List (Use n)) :
      Except Error {copies : List (Copy b) // EmitsParts b interpret owner path parts children copies} :=
    match parts, children with
    | [], [] => .ok ⟨[], .nil⟩
    | part :: ps, child :: cs =>
      match emit b interpret (some ⟨owner, path, part.originalRange⟩) child with
      | .error e => .error e
      | .ok head =>
        match emitParts b interpret owner path ps cs with
        | .error e => .error e
        | .ok tail => .ok ⟨literal b owner path part.before :: (head.val ++ tail.val),
            .cons head.property tail.property⟩
    | _, _ => .error .arity
  termination_by sizeOf children
end

/-- Project tag-list equality to prove a valid plan has one part per selected slot. -/
theorem plan_arity {r : Row n} {p : Plan r} (h : PlanOK r p) :
    p.parts.length = r.slots.length := by
  have e := congrArg List.length h.1
  simpa only [List.length_map] using e

/-- Use ordered bounded cuts to prove a copy emits exactly its declared byte length. -/
theorem copy_length {b : Bundle n} (c : Copy b) :
    (copyBytes c).length = c.range.length := by
  simp only [copyBytes, List.length_take, List.length_drop, Span.length]
  exact Nat.min_eq_left (Nat.sub_le_sub_right c.range.bounded c.range.lo)

/-- Relate an emitted copy index to its exact selected owner’s source offset. -/
theorem copy_index {b : Bundle n} (c : Copy b) (i : Nat) (h : i < c.range.length) :
    (copyBytes c)[i]? = (b.row c.owner).source.bytes[c.range.lo + i]? := by
  simp [copyBytes, h]

/-- A specified boundary emits precisely its incoming notation copy, not target content. -/
theorem boundary_copies_exact {b : Bundle n} {interpret : Interpretation n}
    {incoming : Incoming b} {s path ancestor copies}
    (h : Emits b interpret (some incoming) (.boundary s path ancestor) copies) :
    copies = [stopped incoming s path ancestor] := by cases h; rfl

/-- Reduce boundary source bytes to the exact including-source notation slice. -/
theorem boundary_bytes_exact {b : Bundle n} {interpret : Interpretation n}
    {incoming : Incoming b} {s path ancestor copies}
    (h : Emits b interpret (some incoming) (.boundary s path ancestor) copies) :
    sourceBytes copies =
      ((b.row incoming.owner).source.bytes.drop incoming.range.lo).take incoming.range.length := by
  rw [boundary_copies_exact h]
  simp [sourceBytes, copyBytes, stopped]

/-- Separate including-source ownership from stopped target/path/ancestor metadata. -/
theorem stopped_owner_and_target {b : Bundle n} (incoming : Incoming b)
    (s : Fin n) (path : List Nat) (ancestor : Frame n) :
    (stopped incoming s path ancestor).owner = incoming.owner ∧
    (stopped incoming s path ancestor).ownerPath = incoming.ownerPath ∧
    (stopped incoming s path ancestor).stop = some ⟨s, path, ancestor⟩ := ⟨rfl, rfl, rfl⟩

/-- Induct on independent emission to prove equal numbers of ordered parts and children. -/
theorem parts_arity {b : Bundle n} {interpret : Interpretation n} {owner path parts children copies}
    (h : EmitsParts b interpret owner path parts children copies) :
    parts.length = children.length := by
  exact EmitsParts.rec (motive_1 := /- Emission coverage itself needs no extra use-side length predicate. -/ fun _ _ _ _ => True)
    (motive_2 := /- Track one notation part per ordered child. -/ fun _ _ parts children _ _ => parts.length = children.length)
    True.intro (/- The expanded-use case imposes no additional part-length claim. -/ fun _ _ _ _ => True.intro) rfl
    (/- Extend equal tails by one part/child contribution. -/ fun _ _ _ ih => congrArg Nat.succ ih) h

/-- Source-faithful interpretation is an input premise, not emitted-byte
correctness or success assumed as an axiom. Empty/false parses do not acquire
source fidelity from satisfying this structural predicate alone. -/
def Ready (b : Bundle n) (interpret : Interpretation n) : Prop :=
  ∀ s, ∃ plan, interpret (b.row s) = some plan ∧ PlanOK (b.row s) plan

-- Universal success for covered input and supplied valid interpretations.
/-- Given covered uses and supplied valid interpretations, prove emission succeeds
    for permitted incoming/root context by coverage induction. -/
theorem emission_complete {b : Bundle n} {interpret : Interpretation n}
    (ready : Ready b interpret) {active s path u} (covered : Covers b active s path u) :
    ∀ incoming, incoming.isSome = true ∨ active = [] →
      ∃ out, emit b interpret incoming u = .ok out := by
  apply Covers.rec
    (motive_1 := /- Carry the exact permitted incoming/root context through use induction. -/ fun active _ _ u _ => ∀ incoming, incoming.isSome = true ∨ active = [] →
      ∃ out, emit b interpret incoming u = .ok out)
    (motive_2 := /- Carry part/child arity into the ordered emission induction. -/ fun _ _ _ children _ => ∀ owner ownerPath parts,
      parts.length = children.length → ∃ out, emitParts b interpret owner ownerPath parts children = .ok out)
    ?_ ?_ ?_ ?_ covered
  · intro active s path ancestor hit incoming permitted
    cases incoming with
    | some i =>
      rw [emit.eq_2]
      exact ⟨_, rfl⟩
    | none =>
      have empty : active = [] := by simpa using permitted
      simp [empty, nearest] at hit
  · intro active s path children clear ordered ih incoming _
    rcases ready s with ⟨plan, loaded, valid⟩
    rcases ih s path plan.parts ((plan_arity valid).trans (ordered_length ordered).symm) with ⟨out, done⟩
    rw [emit.eq_3]
    split
    · rename_i absent
      rw [loaded] at absent
      contradiction
    · rename_i plan' present
      have e : plan' = plan := Option.some.inj (present.symm.trans loaded)
      subst plan'
      simp only [valid, dite_true, done]
      exact ⟨_, rfl⟩
  · intro active path owner ownerPath parts lengths
    cases parts with
    | nil =>
      rw [emitParts.eq_1]
      exact ⟨_, rfl⟩
    | cons p ps => simp at lengths
  · intro active path slot slots child children head tail ihHead ihTail owner ownerPath parts lengths
    cases parts with
    | nil => simp at lengths
    | cons part ps =>
      rcases ihHead (some ⟨owner, ownerPath, part.originalRange⟩) (Or.inl rfl) with ⟨h, doneHead⟩
      rcases ihTail owner ownerPath ps (by simpa using lengths) with ⟨t, doneTail⟩
      rw [emitParts.eq_2]
      simp only [doneHead, doneTail]
      exact ⟨_, rfl⟩

/-- Apply conditional emission completeness to the covered root with no incoming notation. -/
theorem root_emission_complete (b : Bundle n) (interpret : Interpretation n)
    (ready : Ready b interpret) (root : Fin n) :
    ∃ out, emit b interpret none (complete b root).val = .ok out :=
  emission_complete ready (complete_covers b root) none (Or.inr rfl)

/-- Lift cycle-use determinism to identical successful source bytes under the
same frozen interpretation. Equal policy-ID tokens alone are insufficient. -/
theorem reconstruction_deterministic {b : Bundle n} {interpret : Interpretation n}
    {root p₁ p₂ k₁ k₂ u v out₁ out₂}
    (run₁ : run b root p₁ k₁ = .complete u) (run₂ : run b root p₂ k₂ = .complete v)
    (emit₁ : emit b interpret none u = .ok out₁)
    (emit₂ : emit b interpret none v = .ok out₂) :
    sourceBytes out₁.val = sourceBytes out₂.val := by
  have uv := output_deterministic run₁ run₂
  cases uv
  have eq : out₁ = out₂ := Except.ok.inj (emit₁.symm.trans emit₂)
  cases eq
  rfl

/-- Warnings are an independent projection; no warning bytes are an emitter input. -/
structure Presented (b : Bundle n) where
  authored : List (Copy b)
  warnings : List (Warning n)

/-- Project authored bytes alone from presentation, ignoring warning metadata. -/
def presentedBytes (p : Presented b) : List UInt8 := sourceBytes p.authored

/-- Changing only warnings cannot change the authored byte projection. -/
theorem presentation_separate {b : Bundle n} (copies : List (Copy b))
    (w₁ w₂ : List (Warning n)) :
    presentedBytes (⟨copies, w₁⟩ : Presented b) = presentedBytes ⟨copies, w₂⟩ := rfl

/-- One copy and its absolute interval in the concatenated emitted result. -/
structure Segment (b : Bundle n) where
  copy : Copy b
  outputStart : Nat
  outputEnd : Nat
  deriving Repr

/-- Lay out one segment per ordered source copy from the supplied output offset. -/
def mapAt (offset : Nat) (copies : List (Copy b)) : List (Segment b) :=
  match copies with
  | [] => []
  | c :: cs => ⟨c, offset, offset + c.range.length⟩ :: mapAt (offset + c.range.length) cs

/-- Compute the final output offset by summing exact copy lengths in order. -/
def endAt (offset : Nat) (copies : List (Copy b)) : Nat :=
  match copies with
  | [] => offset
  | c :: cs => endAt (offset + c.range.length) cs

/-- Induct over copies to prove output mapping has one segment per copy. -/
theorem map_count (offset : Nat) (copies : List (Copy b)) :
    (mapAt offset copies).length = copies.length := by
  induction copies generalizing offset with
  | nil => rfl
  | cons c cs ih => simp [mapAt, ih]

/-- Use exact copy lengths to equate the final mapped offset with concatenated byte length. -/
theorem map_end_exact (offset : Nat) (copies : List (Copy b)) :
    endAt offset copies = offset + (sourceBytes copies).length := by
  induction copies generalizing offset with
  | nil => simp [endAt, sourceBytes]
  | cons c cs ih =>
    simp only [endAt, ih, sourceBytes, List.flatMap_cons, List.length_append, copy_length]
    omega

/-- Recover one copy’s emitted bytes by slicing after all preceding contributions. -/
theorem segment_slice_exact (leading : List (Copy b)) (c : Copy b) (suffix : List (Copy b)) :
    ((sourceBytes (leading ++ c :: suffix)).drop (sourceBytes leading).length).take c.range.length =
      copyBytes c := by
  simp only [sourceBytes, List.flatMap_append, List.flatMap_cons]
  rw [List.drop_left]
  rw [← copy_length c]
  simp

/-- Locate a mapped segment in the original copy list and derive exact start/end offsets. -/
theorem map_segment_origin (offset : Nat) (copies : List (Copy b)) (seg : Segment b)
    (mem : seg ∈ mapAt offset copies) :
    ∃ leading suffix, copies = leading ++ seg.copy :: suffix ∧
      seg.outputStart = offset + (sourceBytes leading).length ∧
      seg.outputEnd = seg.outputStart + seg.copy.range.length := by
  induction copies generalizing offset with
  | nil => simp [mapAt] at mem
  | cons c cs ih =>
    simp only [mapAt, List.mem_cons] at mem
    rcases mem with same | tail
    · subst seg
      exact ⟨[], cs, rfl, by simp [sourceBytes], rfl⟩
    · rcases ih _ tail with ⟨leading, suffix, shape, start, finish⟩
      refine ⟨c :: leading, suffix, ?_, ?_, finish⟩
      · simp only [List.cons_append, shape]
      · simp only [sourceBytes, List.flatMap_cons, List.length_append, copy_length]
        rw [start]
        simp only [sourceBytes]
        omega

/-- Recover the exact selected owner’s bytes from any emitted mapped segment. -/
theorem mapped_slice_exact (offset : Nat) (copies : List (Copy b)) (seg : Segment b)
    (mem : seg ∈ mapAt offset copies) :
    ((sourceBytes copies).drop (seg.outputStart - offset)).take seg.copy.range.length =
      copyBytes seg.copy := by
  rcases map_segment_origin offset copies seg mem with ⟨leading, suffix, shape, start, _⟩
  rw [shape, start, Nat.add_sub_cancel_left]
  exact segment_slice_exact leading seg.copy suffix

/-- Equal descriptors under the same frozen interpretation agree on availability. -/
theorem interpretation_alias_consistent (b : Bundle n) (interpret : Interpretation n)
    {s t : Fin n} (same : SameState b s t) :
    (interpret (b.row s)).isSome = (interpret (b.row t)).isSome :=
  congrArg (/- Compare availability under the same frozen interpretation function. -/ fun r => (interpret r).isSome) (key_sound b same)

/-- Lift equal row descriptors through the dependent interpretation type without
    claiming parser/Rust conversion or semantic bisimulation. -/
theorem interpretation_alias_exact (b : Bundle n) (interpret : Interpretation n)
    {s t : Fin n} (same : SameState b s t) :
    HEq (interpret (b.row s)) (interpret (b.row t)) := by
  have lift : ∀ {r q : Row n}, r = q → HEq (interpret r) (interpret q) := by
    intro r q e
    cases e
    rfl
  exact lift (key_sound b same)

/-- Conditional bridge to full immutable-source offsets. The exact selected-slice
relation is a supplied premise; authentication and source loading are not proved. -/
theorem absolute_copy_index {b : Bundle n} (c : Copy b) (full : List UInt8)
    (selected : (b.row c.owner).source.bytes =
      (full.drop (b.row c.owner).source.rangeStart).take
        ((b.row c.owner).source.rangeEnd - (b.row c.owner).source.rangeStart))
    (i : Nat) (within : i < c.range.length) :
    (copyBytes c)[i]? = full[(b.row c.owner).source.rangeStart + c.range.lo + i]? := by
  have selectedLength : (b.row c.owner).source.bytes.length ≤
      (b.row c.owner).source.rangeEnd - (b.row c.owner).source.rangeStart := by
    rw [selected]
    exact List.length_take_le _ _
  have bound : c.range.lo + i <
      (b.row c.owner).source.rangeEnd - (b.row c.owner).source.rangeStart := by
    have ordered := c.range.ordered
    have bounded := c.range.bounded
    simp only [Span.length] at within
    omega
  rw [copy_index c i within]
  calc
    (b.row c.owner).source.bytes[c.range.lo + i]? =
      ((full.drop (b.row c.owner).source.rangeStart).take
        ((b.row c.owner).source.rangeEnd - (b.row c.owner).source.rangeStart))[c.range.lo + i]? :=
      congrArg (/- Project this exact selected-byte index through the supplied source equality. -/ fun xs => xs[c.range.lo + i]?) selected
    _ = full[(b.row c.owner).source.rangeStart + c.range.lo + i]? := by
      simp [bound, Nat.add_assoc]

end Hypergraph.SourceEmission

#print axioms Hypergraph.SourceEmission.plan_arity
#print axioms Hypergraph.SourceEmission.copy_length
#print axioms Hypergraph.SourceEmission.copy_index
#print axioms Hypergraph.SourceEmission.boundary_copies_exact
#print axioms Hypergraph.SourceEmission.boundary_bytes_exact
#print axioms Hypergraph.SourceEmission.stopped_owner_and_target
#print axioms Hypergraph.SourceEmission.parts_arity
#print axioms Hypergraph.SourceEmission.emission_complete
#print axioms Hypergraph.SourceEmission.root_emission_complete
#print axioms Hypergraph.SourceEmission.reconstruction_deterministic
#print axioms Hypergraph.SourceEmission.presentation_separate
#print axioms Hypergraph.SourceEmission.map_count
#print axioms Hypergraph.SourceEmission.map_end_exact
#print axioms Hypergraph.SourceEmission.segment_slice_exact
#print axioms Hypergraph.SourceEmission.map_segment_origin
#print axioms Hypergraph.SourceEmission.mapped_slice_exact
#print axioms Hypergraph.SourceEmission.interpretation_alias_consistent
#print axioms Hypergraph.SourceEmission.interpretation_alias_exact
#print axioms Hypergraph.SourceEmission.absolute_copy_index
