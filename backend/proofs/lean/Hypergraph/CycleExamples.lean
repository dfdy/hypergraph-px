-- SPDX-License-Identifier: AGPL-3.0-only
import Hypergraph.CycleState

/-! Executed model examples, not Rust/UI tests or universal proof substitutes. -/
namespace Hypergraph.CycleState.Examples

def src (id version : Nat) : Source := ⟨0, id, version, 0, 0, 0, [], []⟩
def selfCycle : Bundle 1 := ⟨10, 1, 1, fun _ => ⟨src 7 1, [⟨8, 0, 0⟩]⟩⟩
def mutualCycle : Bundle 2 := ⟨10, 1, 1, fun s =>
  if s.val = 0 then ⟨src 7 1, [⟨8, 0, 1⟩]⟩ else ⟨src 9 1, [⟨10, 0, 0⟩]⟩⟩
def siblings (cyclic : Bool) : Bundle 2 := ⟨10, 1, 1, fun s =>
  if s.val = 0 then ⟨src 7 1, [⟨8, 0, 1⟩, ⟨9, 0, 1⟩]⟩
  else ⟨src 10 1, if cyclic then [⟨11, 0, 1⟩] else []⟩⟩
def historical : Bundle 2 := ⟨10, 1, 1, fun s =>
  if s.val = 0 then ⟨src 7 2, [⟨8, 0, 1⟩]⟩ else ⟨src 7 1, []⟩⟩
def descendants : Bundle 5 := ⟨10, 1, 1, fun s =>
  match s.val with
  | 0 => ⟨src 0 1, [⟨1, 0, 1⟩, ⟨2, 0, 2⟩]⟩
  | 1 => ⟨src 7 1, [⟨3, 0, 3⟩]⟩
  | 2 => ⟨src 7 1, [⟨3, 0, 4⟩]⟩
  | 3 => ⟨src 8 1, []⟩
  | _ => ⟨src 8 2, []⟩⟩
def aliases : Bundle 2 := ⟨10, 1, 1, fun _ => ⟨src 7 1, [⟨8, 0, 1⟩]⟩⟩
def alternatingAliases : Bundle 2 := ⟨10, 1, 1, fun s =>
  ⟨src 7 1, [⟨8, 0, if s.val = 0 then 1 else 0⟩]⟩⟩

#guard useCount (complete selfCycle 0).val = 2
#guard (warnings (complete selfCycle 0).val).length = 1
#guard useCount (complete mutualCycle 0).val = 3
#guard (warnings (complete mutualCycle 0).val).length = 1
#guard useCount (complete (siblings false) 0).val = 3
#guard (warnings (complete (siblings false) 0).val).length = 0
#guard useCount (complete (siblings true) 0).val = 5
#guard (warnings (complete (siblings true) 0).val).length = 2
#guard (warnings (complete (siblings true) 0).val).map Warning.path = [[8, 11], [9, 11]]
#guard useCount (complete historical 0).val = 2
#guard (warnings (complete historical 0).val).isEmpty
#guard ¬ SameState historical 0 1
#guard useCount (complete descendants 0).val = 5
#guard (warnings (complete descendants 0).val).isEmpty
#guard (descendants.row 1).source = (descendants.row 2).source
#guard ¬ SameState descendants 1 2
#guard SameState aliases 0 1
#guard useCount (complete aliases 0).val = 2
#guard (warnings (complete aliases 0).val).map (fun w => (w.target.val, w.ancestor.target.val)) = [(1, 0)]
#guard useCount (complete alternatingAliases 0).val = 3
#guard ¬ SameState alternatingAliases 0 1

def failedWith (r : Outcome n) (e : Failure) : Bool :=
  match r with | .failed f => f == e | .complete _ => false
#guard failedWith (run selfCycle 0 none 1) .budget
#guard match run selfCycle 0 none 2 with | .complete u => useCount u == 2 | .failed _ => false
#guard ([Failure.invalid, .missing, .denied, .unresolved, .budget, .unsupported].all
  fun e => failedWith (run selfCycle 0 (some e) 100) e)

def initial : Navigation 1 := ⟨(complete selfCycle 0).val, true, false, none⟩
def warning : Warning 1 := ⟨0, [8], ⟨0, []⟩, true, true⟩
#guard warning ∈ warnings initial.view
#guard (step selfCycle 2 (fun _ => true) initial (.click warning)).conflictPending
#guard useCount (step selfCycle 2 (fun _ => true) initial (.click warning)).view = 2
#guard (step selfCycle 2 (fun _ => false) initial (.click warning)).lastFailure = some .denied
#guard (step selfCycle 1 (fun _ => true) initial (.click warning)).lastFailure = some .budget
#guard (step selfCycle 2 (fun _ => true) initial .openComparison).conflictPending
#guard (step selfCycle 2 (fun _ => true) initial .openComparison).comparisonOpen
#guard (step selfCycle 2 (fun _ => true) initial (.resolve false)).conflictPending
#guard !(step selfCycle 2 (fun _ => true) initial (.resolve true)).conflictPending

end Hypergraph.CycleState.Examples
