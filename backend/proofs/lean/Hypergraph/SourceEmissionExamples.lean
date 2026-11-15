-- SPDX-License-Identifier: AGPL-3.0-only
import Hypergraph.SourceEmission

/-!
# Hypergraph PX — Executable exact-source emission examples

Exercise supplied notation partitions, including-source boundary bytes,
repeated contexts and selected-to-full-source offsets with Lean guards.

Source: [Latest source on GitHub][source]

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex /root (OpenAI coding agent).
Latest editing harness: Codex; version/build: unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: The Lean source-emission model library and assurance CI, not any
application parser, source loader or browser rendering path.

Specification:
- [Finite conceptual projection scope][model]
- [Model/proof assumptions and guard evidence][digest]

Boundary: The fixture notation is synthetic and selects no HPX grammar. Supplied
interpretations and ranges are mathematical inputs; these examples do not prove
source authentication, Unicode scalar parsing or Rust/UI correspondence.

Preserved model premises:
Synthetic notation fixtures only: these byte strings do not select HPX syntax.
Exact UTF8/CRLF copying is tested; parser/scalar-boundary fidelity is not proved.

[source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/proofs/lean/Hypergraph/SourceEmissionExamples.lean
[model]: ../../../../docs/05-domain/diagrams/graph-projections.c4
[digest]: ../../../../docs/08-assurance/formal-validation-digest.md
-/
namespace Hypergraph.SourceEmission.Examples
open CycleState

/-- Construct one abstract exact selected byte-source descriptor for these fixtures. -/
def source (id rev : Nat) (bytes : List UInt8) : Source := ⟨0,id,rev,0,bytes.length,0,bytes,[]⟩
/-- Retain the exact UTF8 alpha/CRLF and synthetic self-notation fixture bytes. -/
def unicodeSelfBytes : List UInt8 := [206,177,13,10,60,65,62,13,10]
/-- Supply two synthetic notation positions separated by literal punctuation. -/
def siblingsBytes : List UInt8 := [40,60,83,62,124,60,83,62,41]
/-- Supply a self-cycle whose stopped output must preserve including-source notation. -/
def self : Bundle 1 := ⟨2,1,1,/- Resolve an aliased/self fixture to its explicitly supplied row. -/ fun _ => ⟨source 7 1 unicodeSelfBytes,[⟨8,0,0⟩]⟩⟩
/-- Supply distinct two-row notation sources that close after one expanded child. -/
def mutualCycle : Bundle 2 := ⟨2,1,1,/- Resolve this finite handle to its exact fixture row or shifted source. -/ fun s =>
  if s.val=0 then ⟨source 7 1 [65,60,66,62],[⟨8,0,1⟩]⟩
  else ⟨source 9 1 [66,60,65,62],[⟨10,0,0⟩]⟩⟩
/-- Supply two uses of the same child with independent paths, optionally cyclic. -/
def siblings (cyclic : Bool) : Bundle 2 := ⟨2,1,1,/- Resolve this finite handle to its exact fixture row or shifted source. -/ fun s =>
  if s.val=0 then ⟨source 7 1 siblingsBytes,[⟨8,0,1⟩,⟨9,0,1⟩]⟩
  else if cyclic then ⟨source 10 1 [83,60,83,62],[⟨11,0,1⟩]⟩
  else ⟨source 10 1 [83],[]⟩⟩
/-- Supply one logical identity at old/new versions so finite history is not mistaken for recurrence. -/
def historical : Bundle 2 := ⟨2,1,1,/- Resolve this finite handle to its exact fixture row or shifted source. -/ fun s =>
  if s.val=0 then ⟨source 7 2 [78,60,79,62],[⟨8,0,1⟩]⟩
  else ⟨source 7 1 [79],[]⟩⟩
/-- Supply distinct handles with equal descriptors to test retained target/ancestor identities. -/
def aliases : Bundle 2 := ⟨2,1,1,/- Resolve an aliased/self fixture to its explicitly supplied row. -/ fun _ => ⟨source 7 1 [83,60,83,62],[⟨8,0,1⟩]⟩⟩

/-- Read a fixture slot’s occurrence/role pair, with a fixture-only fallback for absent slots. -/
def tag (r : Row n) (i : Nat) : Nat × Nat :=
  ((r.slots.map /- Project ordered slot tags for the synthetic interpretation. -/ fun s => (s.occurrence,s.role))[i]?).getD (0,0)

/-- Supply synthetic partitions for the exact fixture shapes; this is not a notation parser. -/
def interpreted : Interpretation n := /- Choose only the stated synthetic fixture partitions. -/ fun r =>
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

/-- Expose copies only after successful covered-root emission, keeping errors explicit as None. -/
def copies (b : Bundle n) (i : Interpretation n) (root : Fin n) : Option (List (Copy b)) :=
  match emit b i none (complete b root).val with
  | .error _ => none
  | .ok out => some out.val

/-- Project source bytes from a successful ordered copy result. -/
def bytes (b : Bundle n) (i : Interpretation n) (root : Fin n) : Option (List UInt8) :=
  (copies b i root).map sourceBytes

-- Successful cases preserve literal source, exact boundary notation and context order.
#guard bytes self interpreted 0 = some unicodeSelfBytes
#guard bytes mutualCycle interpreted 0 = some [65,66,60,65,62]
#guard bytes (siblings false) interpreted 0 = some [40,83,124,83,41]
#guard bytes (siblings true) interpreted 0 = some [40,83,60,83,62,124,83,60,83,62,41]
#guard bytes historical interpreted 0 = some [78,79]
#guard bytes aliases interpreted 0 = some [83,60,83,62]
#guard (copies mutualCycle interpreted 0).map (/- Inspect metadata only when complete emission supplied an ordered copy list. -/ fun cs =>
  (cs.filter /- Select only copies carrying a stopped-target witness. -/ fun c => c.stop.isSome).map /- Compare including-source owner with the stopped target. -/ fun c => (c.owner.val,c.stop.map /- Read the retained stopped target handle. -/ fun x => x.target.val)) =
  some [(1,some 0)]
#guard (copies aliases interpreted 0).map (/- Inspect metadata only when complete emission supplied an ordered copy list. -/ fun cs =>
  (cs.filter /- Select only copies carrying a stopped-target witness. -/ fun c => c.stop.isSome).map /- Retain source owner and both target/ancestor handles for alias checks. -/ fun c =>
    (c.owner.val,c.stop.map /- Project the exact target and ancestor pair. -/ fun x => (x.target.val,x.ancestor.target.val))) = some [(0,some (1,0))]
#guard (copies (siblings true) interpreted 0).map (/- Inspect metadata only when complete emission supplied an ordered copy list. -/ fun cs =>
  (cs.filter /- Select only copies carrying a stopped-target witness. -/ fun c => c.stop.isSome).map /- Read each stopped contribution’s exact including occurrence path. -/ fun c => c.ownerPath) = some [[8],[9]]
#guard (copies self interpreted 0).map (/- Inspect metadata only when complete emission supplied an ordered copy list. -/ fun cs =>
  (mapAt 0 cs).map /- Inspect exact concatenated-output segment boundaries. -/ fun s => (s.outputStart,s.outputEnd)) = some [(0,4),(4,7),(7,9)]
#guard (copies self interpreted 0).map (endAt 0) = some unicodeSelfBytes.length

-- Missing interpretations and malformed boundary/arity/partition evidence fail explicitly.
#guard bytes self (/- Simulate an unavailable interpretation rather than empty successful source. -/ fun _ => none) 0 = none
#guard match emit self interpreted none (.boundary 0 [] ⟨0,[]⟩) with
  | .error .orphanBoundary => true | _ => false
#guard match emit self interpreted none (.expanded 0 [] []) with
  | .error .arity => true | _ => false

/-- Deliberately omit required slot parts to test invalid-partition rejection. -/
def invalid : Interpretation 1 := /- Supply a deliberately incomplete plan for every row. -/ fun r =>
  some ⟨[],⟨0,r.source.bytes.length,Nat.zero_le _,Nat.le_refl _⟩⟩
#guard match emit self invalid none (complete self 0).val with
  | .error .invalidPartition => true | _ => false
#guard (copies self interpreted 0).map (/- Inspect metadata only when complete emission supplied an ordered copy list. -/ fun cs =>
  presentedBytes (⟨cs,warnings (complete self 0).val⟩ : Presented self)) = some unicodeSelfBytes

/-- Shift selected-source origin offsets while preserving exact selected bytes and uses. -/
def selectedRange : Bundle 1 := {self with row := /- Resolve this finite handle to its exact fixture row or shifted source. -/ fun s =>
  let r := self.row s
  {r with source := {r.source with rangeStart := 2, rangeEnd := 11}}}
#guard bytes selectedRange interpreted 0 = some unicodeSelfBytes
#guard (copies selectedRange interpreted 0).map (/- Inspect metadata only when complete emission supplied an ordered copy list. -/ fun cs => cs.map /- Lift each selected byte range by its declared full-source origin. -/ fun c =>
  ((selectedRange.row c.owner).source.rangeStart+c.range.lo,
   (selectedRange.row c.owner).source.rangeStart+c.range.hi)) = some [(2,6),(6,9),(9,11)]

end Hypergraph.SourceEmission.Examples
