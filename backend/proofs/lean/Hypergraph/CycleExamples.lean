-- SPDX-License-Identifier: AGPL-3.0-only
import Hypergraph.CycleState

/-!
# Hypergraph PX — Executable finite-cycle model examples

Exercise selected finite graph shapes, exact recurrence, branch-local sibling
behaviour and explicit navigation/failure outcomes with Lean guards.

Source: [Latest source on GitHub][source]

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex /root (OpenAI coding agent).
Latest editing harness: Codex; version/build: unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: The handwritten Lean library and model assurance CI; these guards
do not execute the application, permissions service or browser UI.

Specification:
- [Finite conceptual projection scope][model]
- [Model/proof assumptions and guard evidence][digest]

Boundary: Fixtures supply abstract source/state/authority data. Passing finite cases
is not a universal product proof, authenticated acquisition or operational
capacity guarantee. The independent CycleState theorems retain their own premises.

Preserved model premises:
Executed model examples, not Rust/UI tests or universal proof substitutes.

[source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/proofs/lean/Hypergraph/CycleExamples.lean
[model]: ../../../../docs/05-domain/diagrams/graph-projections.c4
[digest]: ../../../../docs/08-assurance/formal-validation-digest.md
-/
namespace Hypergraph.CycleState.Examples

/-- Create an abstract exact source/version fixture without claiming a wire encoding. -/
def src (id version : Nat) : Source := ⟨0, id, version, 0, 0, 0, [], []⟩
/-- Supply one row whose selected slot returns to itself. -/
def selfCycle : Bundle 1 := ⟨10, 1, 1, /- Resolve the only state to its self-closing descriptor. -/ fun _ => ⟨src 7 1, [⟨8, 0, 0⟩]⟩⟩
/-- Supply two distinct descriptors forming a two-step cycle. -/
def mutualCycle : Bundle 2 := ⟨10, 1, 1, /- Resolve each finite handle to this fixture’s explicitly selected row. -/ fun s =>
  if s.val = 0 then ⟨src 7 1, [⟨8, 0, 1⟩]⟩ else ⟨src 9 1, [⟨10, 0, 0⟩]⟩⟩
/-- Supply repeated siblings, optionally with a cyclic child, to test branch-local expansion. -/
def siblings (cyclic : Bool) : Bundle 2 := ⟨10, 1, 1, /- Resolve each finite handle to this fixture’s explicitly selected row. -/ fun s =>
  if s.val = 0 then ⟨src 7 1, [⟨8, 0, 1⟩, ⟨9, 0, 1⟩]⟩
  else ⟨src 10 1, if cyclic then [⟨11, 0, 1⟩] else []⟩⟩
/-- Use one logical identity at two exact versions so identity-only cutting would be wrong. -/
def historical : Bundle 2 := ⟨10, 1, 1, /- Resolve each finite handle to this fixture’s explicitly selected row. -/ fun s =>
  if s.val = 0 then ⟨src 7 2, [⟨8, 0, 1⟩]⟩ else ⟨src 7 1, []⟩⟩
/-- Use equal source/version descriptors with different selected descendants; keys must differ. -/
def descendants : Bundle 5 := ⟨10, 1, 1, /- Resolve each finite handle to this fixture’s explicitly selected row. -/ fun s =>
  match s.val with
  | 0 => ⟨src 0 1, [⟨1, 0, 1⟩, ⟨2, 0, 2⟩]⟩
  | 1 => ⟨src 7 1, [⟨3, 0, 3⟩]⟩
  | 2 => ⟨src 7 1, [⟨3, 0, 4⟩]⟩
  | 3 => ⟨src 8 1, []⟩
  | _ => ⟨src 8 2, []⟩⟩
/-- Supply two handles with equal full selected-row descriptors. -/
def aliases : Bundle 2 := ⟨10, 1, 1, /- Both handles deliberately resolve to the same structural descriptor. -/ fun _ => ⟨src 7 1, [⟨8, 0, 1⟩]⟩⟩
/-- Alternate scoped targets so equal sources alone do not imply equal selected rows. -/
def alternatingAliases : Bundle 2 := ⟨10, 1, 1, /- Resolve each finite handle to this fixture’s explicitly selected row. -/ fun s =>
  ⟨src 7 1, [⟨8, 0, if s.val = 0 then 1 else 0⟩]⟩⟩

-- Direct cycles stop at warned boundaries; finite sibling uses remain independent.
#guard useCount (complete selfCycle 0).val = 2
#guard (warnings (complete selfCycle 0).val).length = 1
#guard useCount (complete mutualCycle 0).val = 3
#guard (warnings (complete mutualCycle 0).val).length = 1
#guard useCount (complete (siblings false) 0).val = 3
#guard (warnings (complete (siblings false) 0).val).length = 0
#guard useCount (complete (siblings true) 0).val = 5
#guard (warnings (complete (siblings true) 0).val).length = 2
#guard (warnings (complete (siblings true) 0).val).map Warning.path = [[8, 11], [9, 11]]

-- Historical versions and different descendant selections must not collapse by identity.
#guard useCount (complete historical 0).val = 2
#guard (warnings (complete historical 0).val).isEmpty
#guard ¬ SameState historical 0 1
#guard useCount (complete descendants 0).val = 5
#guard (warnings (complete descendants 0).val).isEmpty
#guard (descendants.row 1).source = (descendants.row 2).source
#guard ¬ SameState descendants 1 2

-- Aliased handles retain exact boundary target/ancestor evidence without bisimulation minimization.
#guard SameState aliases 0 1
#guard useCount (complete aliases 0).val = 2
#guard (warnings (complete aliases 0).val).map (/- Compare stopped target handle with the retained real ancestor. -/ fun w => (w.target.val, w.ancestor.target.val)) = [(1, 0)]
#guard useCount (complete alternatingAliases 0).val = 3
#guard ¬ SameState alternatingAliases 0 1

/-- Recognise one exact failure outcome and reject any complete result. -/
def failedWith (r : Outcome n) (e : Failure) : Bool :=
  match r with | .failed f => f == e | .complete _ => false
#guard failedWith (run selfCycle 0 none 1) .budget
#guard match run selfCycle 0 none 2 with | .complete u => useCount u == 2 | .failed _ => false
#guard ([Failure.invalid, .missing, .denied, .unresolved, .budget, .unsupported].all
  /- Verify each supplied preflight failure remains the same failure. -/ fun e => failedWith (run selfCycle 0 (some e) 100) e)

/-- Start a warned self-cycle view with a pending conflict and closed comparison. -/
def initial : Navigation 1 := ⟨(complete selfCycle 0).val, true, false, none⟩
/-- Name the exact warned target/path/ancestor already present in the initial view. -/
def warning : Warning 1 := ⟨0, [8], ⟨0, []⟩, true, true⟩
#guard warning ∈ warnings initial.view
#guard (step selfCycle 2 (/- Supply allowed access to isolate the explicit navigation transition. -/ fun _ => true) initial (.click warning)).conflictPending
#guard useCount (step selfCycle 2 (/- Supply allowed access to isolate the explicit navigation transition. -/ fun _ => true) initial (.click warning)).view = 2
#guard (step selfCycle 2 (/- Deny every target to check that protected navigation fails explicitly. -/ fun _ => false) initial (.click warning)).lastFailure = some .denied
#guard (step selfCycle 1 (/- Supply allowed access to isolate the explicit navigation transition. -/ fun _ => true) initial (.click warning)).lastFailure = some .budget
#guard (step selfCycle 2 (/- Supply allowed access to isolate the explicit navigation transition. -/ fun _ => true) initial .openComparison).conflictPending
#guard (step selfCycle 2 (/- Supply allowed access to isolate the explicit navigation transition. -/ fun _ => true) initial .openComparison).comparisonOpen
#guard (step selfCycle 2 (/- Supply allowed access to isolate the explicit navigation transition. -/ fun _ => true) initial (.resolve false)).conflictPending
#guard !(step selfCycle 2 (/- Supply allowed access to isolate the explicit navigation transition. -/ fun _ => true) initial (.resolve true)).conflictPending

end Hypergraph.CycleState.Examples
