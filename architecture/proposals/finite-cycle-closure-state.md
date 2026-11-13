# Finite cycle-aware selected state — accepted semantic basis

**Semantic basis accepted under [HPX-OWNER-045](../../docs/02-governance/OWNER_DECISIONS.md#finite-cycle-state-semantic-basis-2026-10-31); finite-state Lean model checked, with complete emitted-source/resource/implementation correspondence still open.** The original candidate wording below is retained as design/proposal provenance; OWNER045 selects the recommended finite table/use tree and structural recurrence equality, not the separately identified open mechanisms. Prepared from `HPX-HANDOFF-20261031-finite-cycle-closure@1` on 2026-10-31. This refines the [closure/source-map proposal](exact-closure-source-map.md); it does not select bytes, a new runtime record kind or a clock algorithm. [The accompanying Lean plan](finite-cycle-lean-plan.md) now links31 checked finite-state model theorems and33 model guards;[the digest](../../docs/08-assurance/formal-validation-digest.md#finite-cycle-state-model--2026-10-31) distinguishes exact checked scope from remaining source-emission/resource/implementation proof obligations. Original candidate text/examples below are retained as design provenance.

## Authority and bounded outcome

| Authority | Accepted obligation retained | Still proposed here |
| --- | --- | --- |
| [OWNER041 cycle policy](../../docs/05-domain/hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041) | Cyclic inclusions may be saved. Automatic expansion is finite with explicit warned boundaries and deliberate bounded navigation. Repeated siblings and finite historical inclusion are valid. Revision ancestry stays acyclic; ordinary reference cycles are distinct. | Exact expansion-state equivalence, boundary witnesses and finite result representation. |
| [OWNER043](../../docs/engineering/semantic-protocol/records/HPX-DEC-20261031-reconstruction-conflict-policy.json) | Exact source text and per-inclusion versions, including cycle targets, are retained. Appearance/fonts/typesetting are external. Ask/automatic changed-source selection and potential-conflict comparison are required. | Logical tables/use records, source-emission boundary representation and mapping mechanics. |
| [OWNER044](../../docs/engineering/semantic-protocol/records/HPX-DEC-20261031-conflict-policy-followup.json) | Compare HPX-recorded Commit times; ties ask. Preference belongs to each workspace user, default Ask. Shared committed-version markers remain until authorised explicit resolution; opening comparison does not resolve. | Missing/incomparable time handling, precision/encoding, marker storage/resolution and publication mechanics. |

The recommendation is a **finite exact selected-state table plus a finite occurrence-use tree with explicit cycle-boundary references**. It preserves the accepted logical selection list without trying to enumerate infinitely many cyclic paths. These are semantic structures; they are not extra users, software components or mandatory persistent entities. Current schemas, wrappers, APIs and whole-owned editing remain unchanged.

## 1. Freeze a finite selected-state bundle

Candidate input:

```text
Bundle = finite local scope + root state reference
       + exact source-emission/cycle policy identities
       + finite state-reference -> immutable selected-row table

SelectedRow = exact owner/source kind and logical identity
            + exact content/manifest version and selected range/mode
            + all source-emission dependency references relevant to this state
            + ordered inclusion slots:
                local occurrence identity + dependency role + exact target state reference
```

A local state reference is a scoped handle, not a new logical content ID, ciphertext address or version algorithm. One handle denotes one immutable row; every required target handle resolves within this frozen bundle. Source/manifest ownership, ordered slots and exact target versions must match authenticated supplied inputs. Extra phantom, missing, duplicate-slot or contradictory rows/targets fail validation. Payloads may be shared, while selected rows differ by descendant selections. Do not infer Node/Document subtyping, new entity kinds or storage layouts.

The table is supplied and validated as **finite before complete expansion**. A builder may discover dependencies through ordinary authorised application reads, but it must either finish a finite table with all references resolved or return an explicit incomplete/error result. It cannot keep allocating a fresh state handle for every growing path and call that cycle handling. Ordinary references are retained according to the declared source scope; they are not automatically expansion slots.

Current user permission is checked by the application at access/publication, not frozen into a durable grant. If required inputs become unavailable/unauthorised, no complete result is returned. The planner consumes already verified descriptors and exact bytes; no domain I/O, serialization, entropy or new policy engine is introduced.

## 2. Proposed recurrence equivalence

Let `D(s)` be the finite, **one-step structural descriptor** of the selected row above, including the ordered exact target references. Recommend:

```text
Key(s) = (bundle scope, frozen expansion/source policy identities, D(s))
SameState(a,b) iff Key(a) = Key(b)
```

Equality is structural, not an assumed collision-free digest and not recursive equality of infinitely unfolded trees. Source bytes retain their exact versions/ranges; no Unicode or line-ending normalization is involved. A cache/hash may accelerate comparison only if structural equality is still established. This proposal introduces no public plaintext fingerprint.

The key **excludes** the current occurrence path, navigation history, depth, remaining budget, current head and other changing traversal variables. Any context that actually changes selected children or emitted source must already be explicit in the row or frozen bundle policy; hidden path-dependent resolution is invalid. A row's exact local occurrence-slot identities and child selections remain in its descriptor.

Consequences to prove, not assume:

- Equal keys imply equal exact source/range/mode and equal ordered inclusion-slot/target descriptors. Same handle implies the same row by validated table functionality; different handles can also have equal descriptors.
- Same logical identity or source revision is insufficient when selections differ. Equal ever-growing paths are neither necessary nor useful for recurrence detection.
- Equality is scoped to one frozen table/policy. Renaming handles consistently with a bijection must preserve expansion up to that renaming; this is not cross-bundle content deduplication or authority.
- No semantic bisimulation quotient is claimed. Distinct rows whose child handles differ can remain distinct even if their infinite unfoldings look alike. A finite alternating alias cycle may therefore cut later than a minimal quotient, but still finitely and deterministically. Work/output budgets remain explicit.

### Alternatives requiring review

| Equivalence | Assessment |
| --- | --- |
| **One-step exact descriptor equality — recommend** | Distinguishes selected descendant environments and can identify duplicated identical rows without recursive expansion. Its finite-table and key-soundness obligations are explicit. |
| Scoped handle identity only | Simple finite graph recurrence; duplicate identical rows remain separate, so boundary depth depends more strongly on alias allocation. Does not establish descriptor equivalence merely by naming an ID. |
| Bisimulation/canonical quotient of selected graph | Could merge more observationally equivalent cycles, but requires additional equality/normalization semantics and proofs. Not necessary for the first candidate. |
| Logical identity, revision alone, growing path or global visited set | Reject as the proposed detector: respectively cuts valid historical uses, conflates descendant choices, fails to repeat, or falsely cuts siblings. |

## 3. Finite uses and exact cycle boundaries

Traverse ordered expansion slots with a branch-local active stack of `(key, state reference, use reference)` frames. The candidate rule is:

1. If the target key is absent from the current active stack, emit an `ExpandedUse` and visit every required slot in stored authorial order with that frame active.
2. If the target key is already active, emit one `CycleBoundaryUse` for this incoming inclusion; do not expand that target's children in this action. Its witness points to the active ancestor with the matching key.
3. Restore the parent's active stack after each child. A cache may reuse loaded immutable payloads but cannot suppress a later required occurrence use.

Candidate semantic result:

```text
Use = ExpandedUse(exact state reference, finite path/context, ordered child uses)
    | CycleBoundaryUse(incoming exact slot/context,
                       exact selected target reference,
                       matching active-ancestor witness,
                       frozen rule + required warning/navigation obligation)
```

Use references are local to this finite result. The ancestor witness must identify a real active ancestor with equal key; it is not a licence to substitute the ancestor's handle for the **actual selected target**. Both are retained when handles differ. Successful expanded branches have no repeated active key, so the witness is unique under the proposed invariant. The underlying saved graph may remain cyclic; do not present the stopped result as an acyclic original graph.

The root-relative per-inclusion selection list is the finite enumeration of these uses, **including boundary uses**. Expanded uses state their exact selected source; boundary uses state the exact selected target and why automatic expansion stopped. No infinitely many paths, silently omitted edges or renamed content IDs are required. Physical encoding of the table, use tree, references and warning state remains unadopted.

## 4. Outcomes, completeness and exact reconstruction

Keep these axes separate:

- `CompleteUnderCycleRule`: every required use is expanded or has a justified exact cycle boundary; all required selected inputs are available, authenticated and permitted for the operation.
- `Incomplete/Error`: missing/unauthorised input, invalid state table, unresolved selection, exhausted work/depth/output budget or unsupported dependency. These are not cycle boundaries and must not claim completeness.
- `ConflictReviewed`: independent of exact selection/completeness. Automatic timestamp selection can produce a definite version plus an unresolved potential-conflict marker; it does not prove review or cause Commit.

A proof of finite output is not by itself a completeness proof. The result must preserve each slot exactly once in order and retain target/version/range/context on every expanded or stopped use. Budgets charge table validation, expanded uses/slots, bytes, path growth, emission and resource reads; exceeding any limit returns an explicit non-complete outcome. Numeric limits and runtime strategy are not chosen here.

Historical reconstruction uses only frozen selected rows, exact source bytes and the frozen source-emission/boundary policy. OWNER043 excludes appearance/fonts/typesetting from the first guarantee. A warning is structured presentation state, not an automatic edit to original source. Source-emission treatment of boundary syntax/placeholders must be specified and frozen before claiming byte-for-byte emitted-source correspondence; this proposal does not silently select such an encoding. A source map must distinguish exact copied bytes from generated/read-only boundary presentation and never grant edit authority.

## 5. Worked cases

Notation: `S:A@a1 {x -> T}` means a finite selected row with exact source version and an ordered inclusion slot; references name rows, not mutable heads. Paths describe output uses, not recurrence keys.

| Case | Finite rows | Candidate automatic result |
| --- | --- | --- |
| Self-cycle | `S:A@a1 {x -> S}` | Expand root S; `[x]` is a boundary retaining target S and witness root. One expanded use and one boundary. |
| Mutual cycle | `S:A@a1 {x -> T}`; `T:B@b1 {y -> S}` | Expand S then T; `[x,y]` stops at exact S with root witness. Two expanded uses and one boundary. |
| Repeated siblings | `R {left -> S, right -> S}`; S is a leaf | Expand both uses independently. Root plus two leaf uses; no boundary. If S itself cycles, each sibling gets its own justified boundary, not a false sibling cut. |
| Finite historical same-identity inclusion | `S:A@a2 {old -> T}`; `T:A@a1 {}` | Both expand; a2 and a1 differ in exact selected state. No boundary merely because A repeats. |
| Same revision/manifest, different descendants | R selects U at left and V at right; U and V both use exact M@m1 but `U.x -> P@p1`, `V.x -> P@p2` | U/V descriptors differ; preserve `[left,x]=p1` and `[right,x]=p2`. A map keyed only by M@m1 cannot replace them. |
| Identical row descriptors, different handles | `S:A@a1 {x -> S}` and `Alias:A@a1 {x -> S}` | Starting at Alias, child x stops because target S has the active key. Retain selected target S **and** ancestor use Alias; do not rewrite either identity. |
| Finite alias cycle not minimized | `U:A@a1 {x -> V}`; `V:A@a1 {x -> U}` | Child-handle descriptors differ, so expand U/V then stop at U. The proposed key is not an infinite-unfolding bisimulation quotient. |
| Failure/selection cases | Missing row, denied target, exhausted output, Ask pending or tied Commit times | No falsely complete result and no fabricated cycle boundary. A definite automatic selection retains the required unresolved conflict marker. |

Originally design examples;the corresponding worked cases now have executed Lean model guards under HPX-TEST-153. They remain distinct from universal theorem statements and actual Rust/UI tests;see the linked digest.

## 6. Deliberate navigation and two distinct warning lifecycles

Every cycle boundary must yield an accessible warning and an explicit authorised target-navigation action. A successful click starts a **new bounded action** at the exact retained target state with a fresh active stack and explicit resource budget. It may revisit previously seen saved content; no previous complete use tree or source graph is rewritten. It cannot automatically recurse through another boundary, queue background opening or silently select newer target versions. Current permission is rechecked; denial remains explicit and cannot disclose private drafts/history.

This cycle warning differs from OWNER043/044's **potential-conflict marker**. In Ask mode (the per-user default), unresolved competing versions require a choice. Automatic mode uses HPX-recorded Commit time; ties still ask. After a definite automatic choice, preserve its exact selected target and the pending comparison marker. Authorised viewers of the affected committed version share that marker until explicit authorised resolution; opening the modal or following a cycle target does not clear it. No private draft is made public by this requirement.

Missing/incomparable timestamps should conservatively suspend automatic choice and ask **as a proposal**, not as a new accepted policy. Precision, representation, marker/range attachment and resolution persistence remain separate design questions. Apply selection before freezing a submitted intent; do not retarget a frozen operation or receipt during a retry. Commit time remains a heuristic, not ancestry, correctness or permission.

## Original review recommendation and boundary (resolved by OWNER045)

Recommend adopting the semantic pair **finite selected-state table + finite use tree with exact boundary/ancestor references**, with the one-step structural descriptor equality above, before starting a Lean model of that selected semantics. This is one concrete mechanism choice for owner review; accepted cycle/reconstruction/conflict behaviours are not being re-asked.

If the owner prefers handle-only equality or a bisimulation quotient, adjust the proof definitions before proving anything. The [Lean plan](finite-cycle-lean-plan.md) exposes that dependency and does not assume the choice is already approved. No persistent kind/version, source-emission encoding, timestamp fallback, identity/permission format or UI implementation is selected by this proposal. All five tracked migration gaps retain their precise contracts and unadopted parts.
