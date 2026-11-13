-- SPDX-License-Identifier: AGPL-3.0-only
import Hypergraph.SourceEmission

/-! Synthetic notation fixtures only: these byte strings do not select HPX syntax.
Exact UTF8/CRLF copying is tested; parser/scalar-boundary fidelity is not proved. -/
namespace Hypergraph.SourceEmission.Examples
open CycleState

def source (id rev : Nat) (bytes : List UInt8) : Source := ⟨0,id,rev,0,bytes.length,0,bytes,[]⟩
def unicodeSelfBytes : List UInt8 := [206,177,13,10,60,65,62,13,10]
def siblingsBytes : List UInt8 := [40,60,83,62,124,60,83,62,41]
def self : Bundle 1 := ⟨2,1,1,fun _ => ⟨source 7 1 unicodeSelfBytes,[⟨8,0,0⟩]⟩⟩
def mutualCycle : Bundle 2 := ⟨2,1,1,fun s =>
  if s.val=0 then ⟨source 7 1 [65,60,66,62],[⟨8,0,1⟩]⟩
  else ⟨source 9 1 [66,60,65,62],[⟨10,0,0⟩]⟩⟩
def siblings (cyclic : Bool) : Bundle 2 := ⟨2,1,1,fun s =>
  if s.val=0 then ⟨source 7 1 siblingsBytes,[⟨8,0,1⟩,⟨9,0,1⟩]⟩
  else if cyclic then ⟨source 10 1 [83,60,83,62],[⟨11,0,1⟩]⟩
  else ⟨source 10 1 [83],[]⟩⟩
def historical : Bundle 2 := ⟨2,1,1,fun s =>
  if s.val=0 then ⟨source 7 2 [78,60,79,62],[⟨8,0,1⟩]⟩
  else ⟨source 7 1 [79],[]⟩⟩
def aliases : Bundle 2 := ⟨2,1,1,fun _ => ⟨source 7 1 [83,60,83,62],[⟨8,0,1⟩]⟩⟩

def tag (r : Row n) (i : Nat) : Nat × Nat :=
  ((r.slots.map fun s => (s.occurrence,s.role))[i]?).getD (0,0)

def interpreted : Interpretation n := fun r =>
  if leaf : r.slots = [] then
    some ⟨[],⟨0,r.source.bytes.length,Nat.zero_le _,Nat.le_refl _⟩⟩
  else if nine : r.source.bytes.length = 9 then
    if two : r.slots.length = 2 then
      some ⟨[⟨(tag r 0).1,(tag r 0).2,⟨0,1,by omega,by omega⟩,⟨1,4,by omega,by omega⟩⟩,
        ⟨(tag r 1).1,(tag r 1).2,⟨4,5,by omega,by omega⟩,⟨5,8,by omega,by omega⟩⟩],
        ⟨8,9,by omega,by omega⟩⟩
    else
      some ⟨[⟨(tag r 0).1,(tag r 0).2,⟨0,4,by omega,by omega⟩,⟨4,7,by omega,by omega⟩⟩],
        ⟨7,9,by omega,by omega⟩⟩
  else if four : r.source.bytes.length = 4 then
    some ⟨[⟨(tag r 0).1,(tag r 0).2,⟨0,1,by omega,by omega⟩,⟨1,4,by omega,by omega⟩⟩],
      ⟨4,4,by omega,by omega⟩⟩
  else none

def copies (b : Bundle n) (i : Interpretation n) (root : Fin n) : Option (List (Copy b)) :=
  match emit b i none (complete b root).val with
  | .error _ => none
  | .ok out => some out.val

def bytes (b : Bundle n) (i : Interpretation n) (root : Fin n) : Option (List UInt8) :=
  (copies b i root).map sourceBytes

#guard bytes self interpreted 0 = some unicodeSelfBytes
#guard bytes mutualCycle interpreted 0 = some [65,66,60,65,62]
#guard bytes (siblings false) interpreted 0 = some [40,83,124,83,41]
#guard bytes (siblings true) interpreted 0 = some [40,83,60,83,62,124,83,60,83,62,41]
#guard bytes historical interpreted 0 = some [78,79]
#guard bytes aliases interpreted 0 = some [83,60,83,62]
#guard (copies mutualCycle interpreted 0).map (fun cs =>
  (cs.filter fun c => c.stop.isSome).map fun c => (c.owner.val,c.stop.map fun x => x.target.val)) =
  some [(1,some 0)]
#guard (copies aliases interpreted 0).map (fun cs =>
  (cs.filter fun c => c.stop.isSome).map fun c =>
    (c.owner.val,c.stop.map fun x => (x.target.val,x.ancestor.target.val))) = some [(0,some (1,0))]
#guard (copies (siblings true) interpreted 0).map (fun cs =>
  (cs.filter fun c => c.stop.isSome).map fun c => c.ownerPath) = some [[8],[9]]
#guard (copies self interpreted 0).map (fun cs =>
  (mapAt 0 cs).map fun s => (s.outputStart,s.outputEnd)) = some [(0,4),(4,7),(7,9)]
#guard (copies self interpreted 0).map (endAt 0) = some unicodeSelfBytes.length
#guard bytes self (fun _ => none) 0 = none
#guard match emit self interpreted none (.boundary 0 [] ⟨0,[]⟩) with
  | .error .orphanBoundary => true | _ => false
#guard match emit self interpreted none (.expanded 0 [] []) with
  | .error .arity => true | _ => false

def invalid : Interpretation 1 := fun r =>
  some ⟨[],⟨0,r.source.bytes.length,Nat.zero_le _,Nat.le_refl _⟩⟩
#guard match emit self invalid none (complete self 0).val with
  | .error .invalidPartition => true | _ => false
#guard (copies self interpreted 0).map (fun cs =>
  presentedBytes (⟨cs,warnings (complete self 0).val⟩ : Presented self)) = some unicodeSelfBytes

def selectedRange : Bundle 1 := {self with row := fun s =>
  let r := self.row s
  {r with source := {r.source with rangeStart := 2, rangeEnd := 11}}}
#guard bytes selectedRange interpreted 0 = some unicodeSelfBytes
#guard (copies selectedRange interpreted 0).map (fun cs => cs.map fun c =>
  ((selectedRange.row c.owner).source.rangeStart+c.range.lo,
   (selectedRange.row c.owner).source.rangeStart+c.range.hi)) = some [(2,6),(6,9),(9,11)]

end Hypergraph.SourceEmission.Examples
