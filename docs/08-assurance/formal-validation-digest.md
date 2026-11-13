# Human-readable formal validation digest

## Common metadata

- **ID:** `HPX-ASSUR-009`
- **Title:** Human-readable formal validation digest
- **Purpose:** Preserve the complete readable theorem/method/assumption/source inventory for developers and mathematicians.
- **Level:** `08-assurance`
- **Status:** `proposed`
- **Maintainer:** project owner; agent migration assembly
- **Applies to:** current finite cycle-state/source-emission model evidence and separately preserved 2026-10-24 DAG/extraction evidence
- **Upstream authority:** [formal obligations](../07-implementation/formal-invariants.md)
- **Downstream dependencies:** pinned proof library plus separately retained extraction scripts
- **Verification:** current pinned build/model/examples/environment/axiom checks under HPX-TEST-153/155;historical checks retain their original provenance
- **Decision/history:** `HPX-SRC-0116`; original `proofs/VALIDATION_DIGEST.md` SHA-256 `69452ea0278fd29685e133c33ed6357c0d281efad623e6b53ba6208a1386c550`
- **Last reviewed:** 2026-11-01

## Current cycle-aware evidence and preserved history

## Bounded source-emission model — 2026-11-01

HPX-OWNER-047 selects original including-source notation at a stopped cycle, with warning/navigation metadata separate. [SourceEmission.lean](../../proofs/lean/Hypergraph/SourceEmission.lean) adds **19 checked model theorems** and [SourceEmissionExamples.lean](../../proofs/lean/Hypergraph/SourceEmissionExamples.lean) adds **18 synthetic guards**. HPX-TEST-155/[machine evidence](../../architecture/evidence/source-emission-lean.json) records exact final sources, commands and axiom reports; TEST153 remains unchanged historical evidence.

`Span` bounds ranges relative to selected byte lists; `PlanOK` checks contiguous literal/notation partitions and ordered occurrence/role tags against row slots. The interpretation is a function of the whole exact row, held fixed between reconstructions. Source-faithful notation recognition, authenticated bytes, complete dependencies and UTF8 scalar boundaries are **external premises**: satisfying structural partition checks alone does not establish them. Synthetic fixture notation selects no HPX grammar. Graph-only inclusions without available authored notation need explicit treatment, not invented empty syntax.

Independent `Emits`/`EmitsParts` specify exact bounded copies: expanded children replace their notation span; boundaries copy only the incoming including-owner span and retain stopped target/path/ancestor metadata separately. `emit`/`emitParts` return copies with an emission witness, or explicit missing-interpretation, invalid-partition, arity or orphan-boundary error. Their mutual recursion terminates over the finite supplied use/child structure; it is not an early resource-limit theorem. `Ready` supplies a valid plan for every selected row; root success is proved from that premise and checked cycle-use coverage, rather than assumed successful output.

All names below are in `Hypergraph.SourceEmission`; source statements define exact quantifiers.

| Declaration(s) | Checked statement and method |
| --- | --- |
| `plan_arity` | Valid partition tags imply slot-count equality; list projection. |
| `copy_length`, `copy_index` | Bounded copies have exact span length and indexed selected-source bytes; list slicing. |
| `boundary_copies_exact`, `boundary_bytes_exact` | An emitted boundary is precisely its incoming notation copy/bytes; constructor inversion. |
| `stopped_owner_and_target` | Including owner/path and separate exact stopped context are retained; projection. |
| `parts_arity` | Emission relates exactly one part per child; mutual induction. |
| `emission_complete`, `root_emission_complete` | Covered finite uses emit successfully with supplied valid interpretations and appropriate incoming context; mutual coverage induction. |
| `reconstruction_deterministic` | Successful runs for the same frozen bundle/root and interpretation produce identical bytes; cycle-result uniqueness and function equality. |
| `presentation_separate` | Changing warning metadata cannot change authored bytes; projection. This does not prove UI warning rendering or association. |
| `map_count`, `map_end_exact` | One ordered map segment per copy; final offset equals initial offset plus emitted length; list induction. |
| `segment_slice_exact`, `map_segment_origin`, `mapped_slice_exact` | Every mapped interval has an ordered originating copy and exactly its bytes; list induction/slicing. These are byte witnesses, not edit authority or a persistent source-map format. |
| `interpretation_alias_consistent`, `interpretation_alias_exact` | Structurally equal selected rows receive the same dependent interpretation; row equality. |
| `absolute_copy_index` | Selected-relative copy indices equal full-source indices **given an exact selected-slice relation**; range arithmetic/slicing. Loading/authentication of that relation is not proved. |

The 18 guards cover self/mutual cycles, finite historical inclusion, repeated siblings, descriptor aliases with distinct actual handles, including-owner versus stopped-target metadata, occurrence paths, exact synthetic UTF8/CRLF copies, segment offsets, missing interpretations, invalid partitions, orphan boundaries and arity failure. Guards are finite executable examples, separate from the general theorems.

Final pinned build (eight jobs), direct warnings-as-errors checks of both new modules and `lake env leanchecker Hypergraph` pass. Toolchain remains Lean4.35.0 (compiler commit `eb6cafb7290e8bd5f2937522d8d804f58f02bafc`), Lake reports `5.0.0-src+eb6cafb`; no external Lake packages or new dependency/licence changes. Every named theorem has an axiom report: union `propext`, `Classical.choice`, `Quot.sound`; six declarations are axiom-free. No project axioms or proof placeholders were found. Kernel/compiler/core-library/distribution/host trust remains.

No parser/loader, UTF8/browser UTF16 correspondence, early CPU/byte/I/O/stack bounds, physical format acceptance, Rust extraction/runtime, actual UI/access/event/recovery or complete product proof follows. Historical DAG/cycle/extraction evidence retains its scope; the existing extracted Rust helper was preserved, not re-extracted or replayed. No application tests/build, manual handoff, trust/provider action, commit or publication was performed.

## Finite cycle-state model — 2026-10-31

[CycleState.lean](../../proofs/lean/Hypergraph/CycleState.lean) implements the OWNER045-selected finite selected-state table and finite occurrence-use semantics; [CycleExamples.lean](../../proofs/lean/Hypergraph/CycleExamples.lean) executes 33 model guards. HPX-TEST-153 and [machine evidence](../../architecture/evidence/finite-cycle-lean.json) bind the source/toolchain hashes, actual commands, axiom reports and preservation checks. These are **31 new checked model theorems**, in addition to the four historical DAG theorems and the separately recorded extracted spend-helper proof. No new extracted-Rust correspondence is claimed.

### Definitions and exact boundary

`Source` carries abstract exact kind/identity/version/range/mode, selected bytes (`List UInt8`) and source-dependency tokens. `Row` adds ordered occurrence/role/target slots. `Bundle n` supplies frozen scope/cycle/source-policy identities and a total `Fin n → Row n` table: every target is typed in that finite table. This models already resolved inputs, not a decoder, authenticated loader or finite-graph discovery algorithm. `WellFormed` records unique local occurrence slots; no runtime validator or source-faithfulness theorem establishes that predicate. The coverage results hold for ordered slot lists even without that additional input premise; they must not be interpreted as validating malformed source.

`Key` contains scope, both policies and the entire one-step row descriptor, including exact child handles. `SameState` is structural equality; it excludes path, depth, mutable heads and budgets. Distinct descriptors are not merged by content identity or version alone. Renaming proofs establish descriptor-equality invariance under consistent invertible handle renaming, not a bisimulation quotient or a full traversal-renaming/Rust conversion theorem.

`Frame` retains actual selected target and root-relative path. `Use` is an expanded use with an ordered child list, or a boundary retaining its actual target/path and nearest matching active ancestor. Independent mutually inductive `Covers`/`CoversSlots` specify exactly those allowed outputs. `build` constructs a result **and proves coverage**, rather than assuming coverage in its input. It terminates by strictly decreasing the length of the finite remaining-descriptor list on every fresh descent (`erase` removes one matching descriptor); finite child-list mapping accounts for branching. Duplicate aliases can leave redundant descriptors in that list, so the measure is conservative. Branch-local stacks are passed unchanged between siblings. Saved graphs need not be DAGs.

`complete` starts with every supplied row available and an empty active stack. `run` preserves a supplied preflight failure or admits the unique finite result only when its use count fits a declared budget. **That budget is a declarative output-use bound checked after mathematical construction.** This stage does not prove early CPU/byte/I/O/stack exhaustion, actual scheduler accounting, or termination of an unbounded source-discovery process. Finite output can still be large. Supplied missing/denied/invalid/unresolved/unsupported failures never become cycle boundaries or success; the model does not itself detect authentication/access/source failures. A future operational evaluator must establish those input and resource bridges.

`warnings` converts every boundary into exact target/path/ancestor presentation metadata with warning/action flags. `step` accepts only a warning actually present in the current view, uses a supplied current-access result, and on an explicit click performs at most one `run` at its exact target, with the same bundle/policy and a fresh active stack. Denial, invalid warning and budget failure are explicit navigation outcomes. Render/retry/comparison cannot implicitly reopen boundaries. Pending conflict review is separate; only the explicit authorised-resolution event may clear it. This models warning/action obligations, not rendered visibility, screen-reader behaviour or authenticity of an event/permission result.

### Complete theorem inventory

All names below are in `Hypergraph.CycleState`; source statements are authoritative. “Checked” means pinned Lean accepted the proofs and `leanchecker Hypergraph` rechecked the compiled library.

| Declaration(s) | Guarantee and proof method |
| --- | --- |
| `sameState_equivalence` | Reflexive, symmetric, transitive structural-key equality; equality laws. |
| `key_sound`, `sameState_iff` | Same key implies exact row equality; within a bundle the converse holds; projection and rewriting. |
| `different_selection` | Different selected source or ordered slot descriptors cannot compare equal; contradiction by projection. |
| `coversSlots_map` | Mapping a supplied proof-producing child construction yields ordered one-for-one coverage; list induction. |
| `nearest_witness`, `nearest_none` | A found frame is a real active member with equal descriptor; no match excludes all active equal descriptors; list-search lemmas. |
| `available_descend` | Removing the expanded descriptor and pushing its exact frame preserves availability of every state, including aliases; membership/equality cases. |
| `complete_covers` | Total well-founded construction at the exact root supplies independent coverage from an empty stack; construction invariant. |
| `active_descend` | Distinct active descriptors remain distinct when pushing a state with no active match; list membership and non-match. |
| `rename_roundtrip`, `renamed_descriptor_equality` | Invertible consistent handle renaming preserves/reflects row equality; row/slot structural rewriting. |
| `covers_unique`, `coversSlots_unique` | Coverage permits only one result and one ordered child list for fixed bundle/stack/target/path; mutual induction, unique nearest match. |
| `ordered_length` | Every ordered slot has exactly one child use; mutual coverage recursor. |
| `boundary_justified` | A covered boundary retains a real active ancestor with the same structural state; constructor inversion and search soundness. |
| `preflight_failure` | Every supplied failure is returned, never success; evaluation. |
| `successful_coverage` | Every successful run has independent root coverage, fits the output-use budget and had no preflight failure; result cases. |
| `adequate_budget` | With no supplied failure and sufficient output-use budget, the unique finite result succeeds; budget branch evaluation. |
| `output_deterministic` | Two successful runs on the same frozen bundle/root have identical exact-use results, even with different adequate budgets; coverage uniqueness. |
| `warnings_visible` | Every generated warning has both model warning/action flags; finite use/list recursion. |
| `every_boundary_warned` | Every boundary at any depth yields the exact target/path/ancestor warning/action metadata; occurrence induction. |
| `no_automatic_open` | Any non-click event preserves the current view; event cases. |
| `authorized_click` | A current warned/allowed target triggers exactly one bounded result admission with fresh-stack exact-target traversal; branch evaluation. |
| `denied_click` | Denied current warning preserves the view and explicitly records denial; branch evaluation. |
| `comparison_keeps_marker`, `click_keeps_marker` | Opening comparison or navigating a cycle never clears pending conflict review; transition cases. |
| `covered_target_path`, `ordered_targets_paths` | Covered roots and ordered children retain exact incoming target and full occurrence path, in authorial slot order; constructor inversion/mutual recursor. |
| `only_resolution_clears` | Every event other than explicit authorised resolution preserves pending review; event cases. |
| `no_click_trace` | Any finite event trace containing no click preserves the view; event-list induction. |

### Obligation disposition and trusted assumptions

- **PROP006:** finite supplied-table traversal, structural recurrence, justified boundaries and explicit model outcome/output-use bound are checked. Actual loader/validator/authentication, operational CPU/byte/I/O/stack budgets and Rust correspondence remain open. This is stronger than a fuel-cutoff example, but not an operational complexity or host-resource theorem.
- **PROP007:** ordered exact target/path/use coverage, unique boundary decisions and deterministic state result are checked. OWNER047 adopts retained original boundary notation with separate warnings; the bounded source-emission model below checks copied bytes and source-map witnesses under a supplied frozen interpretation. **Authenticated source/parser and product composite-source correspondence remain unproved**; policy tokens alone do not establish input fidelity or dependency completeness.
- **PROP008:** warned exact-target actions, no automatic reopening (including finite no-click traces), denied access, one bounded click and independent conflict-review transitions are checked **in the model**. Actual UI/accessibility, event provenance, backend permissions, persistence/recovery and implementation correspondence remain open.

Pinned Lean/Lake 4.35.0 reports compiler commit `eb6cafb7290e8bd5f2937522d8d804f58f02bafc`, Darwin arm64. Imports remain `Init` plus this project's modules; the external Lake package list remains empty. The existing [Apache-2.0 Lean/Lake licence review](../02-governance/licensing-policy.md) applies. Missing temporary binaries were restored from the official exact-version release; its independently retrieved release digest and actual archive hash match in machine evidence. No pin/package/format upgrade occurred.

All 31 named declarations have recorded `#print axioms` output. Their union is the standard Lean axioms **`propext`, `Classical.choice`, `Quot.sound`**; ten named declarations use no axioms. There are no project-defined axioms or `sorry` placeholders. This does not remove trust in Lean's kernel/checker, compiler/core library, distribution integrity or host. Abstract identity/version/dependency tokens are not a cryptographic commitment mechanism. Actual source fidelity, authentication, permission decisions, input-table completeness and adapter encoding require separate correspondence/validation. The existing extracted-helper evidence was preserved, not re-extracted or replayed.

Successful commands, executed in `proofs/lean` with the restored pinned `bin` on `PATH`:

```sh
lake build
lake env lean -DwarningAsError=true Hypergraph/CycleState.lean
lake env lean -DwarningAsError=true Hypergraph/CycleExamples.lean
lake env leanchecker Hypergraph
```

Initial local proof-development errors (core-list API names, mutual inductive/recursor obligations, explicit comparison instance) were corrected; wrong-directory Lake invocations failed before finding a project. Those failures are not counted as successful checks. Final source hashes, process exit codes and all axiom reports are retained in machine evidence. Both affected served manual layouts are verified separately; no rendered visual inspection or application build/test is claimed.


The following historical digest is retained in full with relative links rebased. Its dated inventory describes that earlier evaluation;the current additional model results are recorded above. Its original evidence dates, hashes, toolchain assumptions, failed extraction findings and theorem limitations remain intact. No new proof check, storage/crypto assurance or whole-validator proof is claimed by this migration. Its source references now route through the new guide/contract system; original bytes remain in the ignored local archive.

## Retained digest

# Human-readable Lean validation digest

**Evidence date:** 2026-10-24. **Toolchain:** Lean/Lake 4.35.0. **Current inventory:** four checked Lean model theorems and one checked theorem about an Aeneas-extracted real Rust helper. The full Rust graph validator remains unproved. This is a maintained evaluation record for developers and mathematicians, not a claim that the application or Rust graph algorithm is formally verified.

The word “checked” below means Lean accepted a proof term for the stated proposition, and the compiled project environment was also checked with `leanchecker`. This differs from executing examples or passing a Rust test suite. The checked source is [Expansion.lean](../../proofs/lean/Hypergraph/Expansion.lean); the package entry imports it through [Hypergraph.lean](../../proofs/lean/Hypergraph.lean).

## 1. Inventory and implementation connection

| Checked Lean declaration | Human-readable result | Implementation connection | Assurance status |
|---|---|---|---|
| `Hypergraph.path_increases` | Every nonempty path strictly increases the supplied natural-number rank if every edge does. | Mathematical prerequisite for rank-certified expansion validation. | Model proof checked; no extracted Rust correspondence |
| `Hypergraph.rank_implies_acyclic` | A graph whose edges strictly increase a rank has no nonempty directed cycle. | Desired soundness criterion for the expansion projection. | Model proof checked; does not prove Rust Kahn execution |
| `Hypergraph.forward_insertion_preserves_rank` | Adding an edge from lower to higher rank preserves the same rank witness. | A sufficient condition for a future incremental structural validator. | Model proof checked; no Rust insertion function exists yet |
| `Hypergraph.forward_insertion_preserves_acyclic` | That forward insertion leaves the expansion graph acyclic. | Combines the preceding sufficient insertion condition with cycle exclusion. | Model proof checked; not a complete occurrence-move specification |

Rust implementation status:

| Rust function | Existing evidence | Lean validation status |
|---|---|---|
| [`hypergraph_domain::expansion::validate`](../../crates/domain/src/expansion.rs) | Five Rust tests, including exhaustive comparison of all 512 directed three-vertex graphs against a separate reachability oracle; formatting/Clippy/CI evidence in the foundation record | **Not formally verified.** Its Kahn elimination, declared-vertex checks, multiedges, maps/queue, work budgets and machine arithmetic have not been translated/proved in Lean. |
| Internal `expansion::spend` | Charon extraction from unchanged Rust, Aeneas translation, exact generated-source replay and `spend_spec` theorem | **Extracted semantics checked.** Exhaustion preserves the counter; successful accounting increments once without overflow/panic. This trusts the extraction/translation/backend boundary; see §7. |

The four graph results concern mathematical relations/rank witnesses. A separate extracted-helper proof is detailed in §7. None proves the compiled application binary, filesystem, authorization or complete graph catalogue.

## 2. Definitions and assumptions

Let V be an arbitrary type, E(u,v) a proposition describing an expansion edge, and rank: V → Nat a function. `Nat` here means unbounded mathematical natural numbers, not Rust `usize`.

- `Path E a b` is an **inductive nonempty path**. `single` constructs a one-edge path; `extend` appends one edge to an existing path. There is no zero-edge constructor, so a vertex is not a cycle merely because it exists.
- `Acyclic E` means that for every vertex v there is no `Path E v v`.
- `RespectsRank E rank` means every edge E(a,b) satisfies rank(a) < rank(b).
- `AddEdge E s t` is the original relation plus the single pair (s,t).

The proofs quantify over any supplied relation and rank. They do not assume a valid rank exists for arbitrary input, compute one, or prove a caller supplied a complete graph. They do not need finiteness for these implications; the production Rust input is finite. A natural-number rank is a sufficient witness, not a representation theorem for every infinite acyclic relation.

Parallel edges collapse to the same binary relation in this model. Their multiplicity does not change mathematical reachability, but correspondence to Rust's individual indegree increments/decrements remains a separate proof obligation. Vertices represent the expansion projection; hyperlink cycles are deliberately outside this constraint. Topological rank is not reading order or user-chosen placement order.

## 3. How each proof works

### 3.1 `path_increases`

**Statement:** if every edge increases rank, then any nonempty directed path from a to b satisfies rank(a) < rank(b).

**Method:** structural induction on the Lean `Path` proof. The `single` case applies the edge-rank assumption directly. The `extend` case uses the induction hypothesis for the existing path and the edge-rank assumption for its final edge, then combines them with `Nat.lt_trans`.

**Technical significance:** this is a universal proof over the inductively defined paths, not enumeration of bounded path lengths. It supplies the strict inequality needed to rule out a return to the same vertex.

### 3.2 `rank_implies_acyclic`

**Statement:** `RespectsRank E rank → Acyclic E`.

**Method:** assume an arbitrary vertex v has a nonempty path back to itself. `path_increases` would give rank(v) < rank(v). Lean's natural-order irreflexivity theorem, `Nat.lt_irrefl`, contradicts that result.

**Technical significance:** this establishes the soundness of a *supplied valid rank certificate*. It does not establish that the Rust validator returns success only when such a certificate exists. That missing implementation connection is deliberately not hidden behind the word “acyclic.”

### 3.3 `forward_insertion_preserves_rank`

**Statement:** if the old relation respects rank and rank(source) < rank(target), adding that edge preserves the same rank relation.

**Method:** case analysis on the disjunction defining `AddEdge`. An original edge uses the original rank assumption. For the inserted pair, equality substitution identifies its endpoints with source/target and the explicit forward inequality proves the goal.

**Technical significance:** the new edge cannot defeat the existing witness under this condition. A backward-ranked insertion can still be acyclic after recomputing ranks; this theorem does not claim otherwise. It also says nothing about single-parent occurrence ownership, membership rights or authorial order.

### 3.4 `forward_insertion_preserves_acyclic`

**Statement:** the same original-rank and forward-edge assumptions imply the extended relation is acyclic.

**Method:** compose the preserved-rank theorem with `rank_implies_acyclic`. This is a checked theorem application, not a separate unverified graph algorithm.

**Technical significance:** it illustrates how a small reusable invariant can support an incremental validation rule without reproving path reasoning at every operation. A complete move/removal/merge validator needs additional statements and implementation correspondence.

## 4. Actual checking procedure and provenance

The project pins [lean-toolchain](../../proofs/lean/lean-toolchain) to `leanprover/lean4:v4.35.0`. The local compiler reports commit `eb6cafb7290e8bd5f2937522d8d804f58f02bafc`, Darwin arm64. The project imports `Init`, with no Mathlib or Aeneas package dependency. The Lake manifest has an empty external-package list.

Executed successfully in `proofs/lean`:

```sh
lake build
lake env lean Hypergraph/Expansion.lean
lake env leanchecker Hypergraph
```

`lake build` uses `-DwarningAsError=true` from [lakefile.toml](../../proofs/lean/lakefile.toml). It builds both the proof module and the package entry module. `leanchecker` returned exit 0 for the compiled project environment. Four `#print axioms` commands in the model reported:

```text
'Hypergraph.path_increases' does not depend on any axioms
'Hypergraph.rank_implies_acyclic' does not depend on any axioms
'Hypergraph.forward_insertion_preserves_rank' does not depend on any axioms
'Hypergraph.forward_insertion_preserves_acyclic' does not depend on any axioms
```

There are no `sorry` placeholders or project-defined axioms in these proofs. This is not a claim of a foundational proof of the Lean kernel or compiler. Trust includes Lean's checking implementation, its loaded environment, the toolchain/artifact integrity and the host executing it. The environment checker is part of the Lean distribution, not an independently established verification of that entire toolchain.

Two additional Lean examples check successor edges over natural numbers and rejection of a reflexive self-cycle. They are examples supporting interpretation of the definitions, not Rust tests or substitutes for the general theorems.

The first compile failed because implicit theorem parameters were inferred incorrectly; those applications now pass the vertex type, relation and rank explicitly. The failed build was not counted as proof evidence. Final build and axiom reports succeeded after that correction.

Source SHA-256 at this evaluation:

```text
ff74aa4802f979d79e9c25e69f514379148abf890e58619dc916aa77214c3f7d  proofs/lean/Hypergraph/Expansion.lean
e689f045cddc89a7d4e8acf0533edec9d0f7ffdb113d6566f7d890405c7f387e  proofs/lean/Hypergraph.lean
74f2cc79679f4cc3a397f81ce68a3c758c24a520948a1954de391770c3f6b6ad  crates/domain/src/expansion.rs
```

The Rust hash identifies the related implementation. The full validator remains unverified; §7 now binds a checked extraction of its private spend helper to that same source. Tool licenses/origins are in [TOOLING.md](../02-governance/licensing-policy.md). [Issue 2](https://github.com/dfdy/hypergraph-px/issues/2) and [work record](../09-guides/reference/development-evidence.md) retain scope and CI evidence.

## 5. Reproducing and extending the evaluation

Install the exact pinned Lean toolchain, then run the commands above. With elan installed, `lake` selects the toolchain from the file. With an official unpacked distribution, prepend its `bin` directory to PATH. Recompute the source hashes before treating these results as evidence for modified code. The CI workflow builds with the pinned Lean action, rechecks the environment and prints theorem dependencies. Its checker must explicitly target `Hypergraph`: the Lake package is named `hypergraphProofs`, while the library module is `Hypergraph`. The initial hosted build passed but the helper guessed `HypergraphProofs` and could not find that module; specifying `leanchecker-args: Hypergraph` corrects the integration without weakening the check. The corrected [Lean CI run](https://github.com/dfdy/hypergraph-px/actions/runs/40078687517) passed for revision `756915a74738555f8893d2f00d7261c6d5ac8d91`, including build, environment checking and axiom output. The matching [Rust CI run](https://github.com/dfdy/hypergraph-px/actions/runs/40078687500) also passed. This evidence-only documentation update changes none of the source hashes above.

Actual extraction has now run. The unchanged whole crate reaches unsupported nested-loop returns and a missing Iterator::filter_map model; it has no complete generated validator proof. Isolating the real budget helper succeeds, with the theorem in §7. A diagnostic printer also failed on tuple-name formatting; dropping only that printer retained strict translation checks. A future full-validator proof must connect successful Rust validation to a mathematical witness, including containers, arithmetic, errors and budgets. Do not hide those obligations behind opaque declarations.

## 6. Maintenance requirement for future validated functions

For every additional Lean-validated function or theorem, append an inventory row and a readable explanation including:

1. Exact Lean symbol and actual Rust counterpart, or an explicit “model only/no implementation counterpart.”
2. Plain-language guarantee, formal inputs/output, quantifiers, preconditions and excluded cases.
3. Proof method, key lemmas and the model/representation bridge.
4. Checked source revision/hash, toolchain/extraction versions, commands, results and CI evidence.
5. Axiom/trusted-assumption report; treatment of panics, integer bounds, I/O, concurrency and cryptography where relevant.
6. Whether a source change invalidates the claim, what must be rerun, and the remaining unproved obligations.

Never promote an ordinary test, a proposed proof, a failed build, or a model-only theorem into “Rust function verified.” Keep unsuccessful attempts and their corrections in the work record, so later evaluations can distinguish a sound result from an attractive but unconnected mathematical model.


## 7. Actual Rust helper: `expansion::spend`

**Checked symbol:** `spend_spec` in [SpendProof.lean](../../proofs/rust/SpendProof.lean), about `hypergraph_domain.expansion.spend` in [generated Spend.lean](../../proofs/rust/Spend.lean). **Original Rust:** the private helper in [expansion.rs](../../crates/domain/src/expansion.rs). This source was extracted by Charon; the Lean body was not manually rewritten.

The Rust function receives mutable machine-sized `work` and a `budget`, returning Rust `Result<(), Error>`. The generated Lean function receives two `Usize` values and returns an outer Aeneas result containing both the ordinary Rust result and the post-mutation counter. The outer result models successful execution versus panic/divergence; a returned Rust `Err(Budget)` is an ordinary successful execution of that function.

The theorem quantifies over every represented pair of machine-sized inputs. Its total postcondition is the following disjunction:

- If work < budget: ordinary Rust result is Ok and the returned counter equals the original work + 1.
- If budget ≤ work: ordinary Rust result is Err(Budget) and the returned counter is unchanged.

**Technical proof:** unfold the automatically generated function and split its guard. Simplification proves the exhausted branch. In the available-budget branch, the Aeneas `step` tactic applies the checked addition specification; `scalar_tac` discharges arithmetic obligations using work < budget and the bounded Usize representation. These facts imply work + 1 ≤ budget ≤ machine maximum, so addition cannot overflow. The total weakest-precondition specification proves outer successful return, rather than allowing panic/divergence vacuously. This proves this helper's accounting rule, not the validity of the graph, the chosen work-cost model, the surrounding loops or authorization.

**Actual sequence:** pinned Charon compiled/extracted the original crate from the helper root; Aeneas translated it with warnings as errors; the generated file was byte-compared against the tracked output; pinned backend dependencies were checked; Lake built the theorem; theorem axioms were printed; `leanchecker SpendProof` rechecked the environment. The end-to-end [replay script](../../scripts/check_rust_proof.py) passed locally, including fresh extraction from the unchanged Rust source. It isolates Rust nightly/Cargo/proof caches rather than changing the normal user toolchain.

**Axiom report:** `spend_spec` depends on `[propext, Classical.choice, Quot.sound]`. These are Lean's standard foundations used by the backend/tactics. There is no sorryAx or native-decision axiom in the theorem report. Unlike the four initial graph theorems, this theorem is not axiom-free; evaluation must retain that distinction.

**Tool boundary:** Aeneas commit 74aabd52f77001cf9eaad51b4f4b867a7dc6b111; Charon 0.1.294 at 260ba2c82588291b1f9efaf4f42d7100adc9c6c2; Rust nightly-2026-09-17; Lean 4.35.0. Trust includes Rust compilation/MIR extraction, the translator, the Aeneas standard-library semantics and Lean's checking/host/artifact infrastructure. The theorem is about the translated semantics, not an independent proof of emitted machine code. The existing graph validator's BTreeMap/VecDeque/control flow remains outside this result.

Reproduce with `python3 scripts/check_rust_proof.py --download` after installing the pinned Lean/Lake, Python 3.12+, GitHub CLI and rustup. See [Rust proof README](../09-guides/developers/formal-validation.md) for tool reuse and [extraction.json](../../proofs/rust/extraction.json) for exact asset/source/proof/dependency pins. A source-hash change fails until reviewed and re-extracted; no dependency or generated-source mismatch is silently accepted. Hosted replay is a separate workflow whose actual results are recorded in the work record.

Checked artifact hashes:

```text
feef095d9ad83706fa45ff0112cf40a9cced536527db7d7e48d200855b32cc9b  proofs/rust/Spend.lean
e61df9d66ff4da04af2e6ca860a8a01eab195811d7562032fc0732d2578e0875  proofs/rust/SpendProof.lean
```

The original Rust module hash remains the one recorded in §4. Added nine development-only Lean packages are revision/license-pinned in the extraction record; no runtime Cargo dependency or Rust code was added by this proof.

## 8. Hosted replay and later adapter boundary

For published commit `3d7f2538696c13383bd05c1932f53831f4db8a57` (0.0.3), all three hosted workflows were observed completed successfully: [Rust checks](https://github.com/dfdy/hypergraph-px/actions/runs/40080895349), [Lean models](https://github.com/dfdy/hypergraph-px/actions/runs/40080895296), and [fresh extracted-Rust proof replay](https://github.com/dfdy/hypergraph-px/actions/runs/40080895276). This closes initial extraction feasibility, not full-validator correctness.

The subsequent crypto adapter adds tested runtime code in a separate crate. No cryptographic or key-lifecycle function has been Lean verified; this inventory remains four model theorems and one extracted-helper theorem. Cryptographic library correctness/entropy/zeroization and filesystem/application policy remain outside these proofs.

## Replay after domain serialization separation, 2026-10-25

The pinned Aeneas bundle SHA-256, translator/Charon revisions, Rust source hash and proof/generated-source hashes were checked again. `scripts/check_rust_proof.py` now copies byte-identical dependency-free domain sources and the original domain manifest into an isolated workspace with only the domain member; package/resolver/lint settings and workspace-relative source paths are retained. This avoids resolving unrelated storage/crypto dependencies in the pinned nightly environment. Generated Spend.lean matches the pinned file exactly; locked Lean dependencies, build, axiom report and `leanchecker SpendProof` passed. The four unchanged graph model theorems also passed `lake build` and `lake env leanchecker Hypergraph` with Lean 4.35.0.

Initial replay attempts failed on unrelated registry resolution, then on changed source-path comments in a flat isolated crate; neither was recorded as success. The final isolated workspace preserves the original paths and passes the exact comparison. Existing extraction/compiler/kernel assumptions and the limited spend-helper scope are unchanged; no proof of storage, encryption, authorization, the whole validator or the compiled application is claimed.

## 1.0.0 source-publication replay, 2026-10-26

The existing pinned translator/Charon bundle was selected explicitly from its local cache, and Lean/Lake 4.35.0 was selected explicitly after default-path attempts reported missing tools. Fresh extraction from the unchanged Rust helper again matched the tracked generated Spend.lean bytes; locked backend dependencies, theorem build, the same three-standard-axiom report and leanchecker SpendProof passed. The four unchanged graph model theorems and leanchecker Hypergraph also passed. Project package metadata is now 1.0.0; source/proof hashes and toolchain pins remain unchanged. Ordinary Rust/storage/browser checks are recorded separately in the current development state and do not extend this bounded proof correspondence.

## Replay with the added comment planner, 2026-10-26

Adding the dependency-free `comment` module did not change the pinned expansion/spend source or existing Lean models. Fresh Charon/Aeneas extraction again matched Spend.lean exactly; locked dependency/build checks, the unchanged three-standard-axiom report and leanchecker SpendProof passed. The comment planner has ordinary executable tests only; this replay establishes no new comment/storage/crypto/UI correspondence theorem. The four graph-model results retain their prior recorded replay scope.

## Working-checkpoint planner boundary, 2026-10-26

`crates/domain/src/working.rs` adds a dependency-free exact acknowledged-source/range/quote capture planner and the distinct CheckpointId identity. Ordinary Rust cases exercise repeated Unicode/mixed newlines and stale/split/empty/mismatched inputs. These additions are not extracted or checked by the recorded spend-helper/graph Lean correspondence. The spend/expansion sources are unchanged; no new proof replay, checkpoint theorem or whole-application correspondence is claimed. Storage checkpoint/promotion and branch operations are separate executable-test evidence.

## Branch delivery, authority and bounded audit boundary, 2026-10-27

HPX-TEST-040/041/042 add actual branch/working browser evidence and ordinary Rust authority/audit tests. `storage/authority.rs` rechecks current catalog/input/result scope on reads and frozen replay; `storage/audit.rs` checks only selected immediate original-branch records under an encrypted-byte budget. Neither adapter is extracted or Lean verified. Domain expansion/spend helpers, generated Lean/model sources and toolchain pins remain unchanged; no new proof replay or whole-application/storage/security correspondence is claimed. Exact executable counts and manual-runtime handoffs remain in the current development-state guide and test register.

## Proposed local-witness decision-table model, 2026-10-27

HPX-OWNER-008 selects workspace-only restoration scope. [check_witness_proposal.py](../../scripts/check_witness_proposal.py) is a separate executable model of a **proposed, unadopted** cross-store witness protocol, not runtime/domain implementation. Python3.14.8 passes33 assertions over12 database/witness restoration pairs. Exact model source SHA-256: `cf71c79a7843589bf009ba90435694b27a3a8b8ce1ebb09ff6f5b5c1db2fe020`. The model assumes symbolic collision-free state roots, a surviving authenticated durable local witness and supplied original-receipt/current-authority predicates. It checks acknowledgement ordering and conservative missing/mismatched/prepared-state outcomes, including explicit exclusion of restoring both stores.

No Merkle/canonicalization algorithm, cryptography, SQLite/file-view binding, locks, fsync, enrollment/upgrade or actual backup/restore is implemented or verified by that model. It is not Lean checked or extracted from Rust and establishes no new storage/security/application theorem. Existing Lean/spend source, extraction hashes/toolchains and correspondence claims are unchanged; no proof replay occurred. HPX-TEST-045 and the [recovery proposal](recovery.md#workspace-only-local-witness-proposal) retain those assumptions and pending owner review.

## Read-only parent comparison evidence boundary, 2026-10-27

HPX-TEST-046 covers ordinary storage/runtime/Node/headless and actual synthetic HTTPS/SQLite/older-reader checks for paired committed snapshots. The storage adapter's single read view, shared budget and authority checks are executable-test evidence; no new domain/Lean source, extraction, toolchain or theorem is introduced. The pending witness decision-table model remains a distinct unadopted proposal and supplies no runtime freshness guarantee.

## Automatic departure Commit evidence boundary, 2026-10-27

HPX-OWNER-010 changes frontend application policy using existing protected Save/Commit operations. HPX-TEST-047 records adapter, headless and actual runtime checks separately. Domain Rust, generated Lean, extraction/toolchain pins and existing correspondence assumptions are unchanged; no new proof replay or whole-application theorem follows. HPX-OWNER-009 supersedes the external-witness proposal: HPX-TEST-045's symbolic model is historical proposal evidence only, not an active implementation plan or portable freshness guarantee.

## Proposed temporal parent-Merge rule model, 2026-10-27

HPX-TEST-050 records55 executable Python3.14.8 checks of an unadopted ADR015 mechanism proposal. Exact script SHA256: `ec807724699134700b32a218ab9359f5a78e8b4b5d0ff67f7f1b54ce0655e38d`. The model assumes aligned stable regions, supplied exact origin labels, trusted passage-change orders and a symbolic revision DAG. It checks rule examples, inheritance/reversion/deletion, retained alternatives, repeat integration and bounded ancestry exceptions; it does not implement text diff/mapping, global order allocation, authenticated persistence, migration, current authority, receipt/crash handling or parent Merge in the application. The model deliberately retains unknown legacy chronology and distinct origin identities even for equal bytes.

No domain/Rust/Lean/extraction source or toolchain changed; no proof replay, new correspondence theorem or whole-application claim. No app compile/integration/manual handoff follows a Python-only proposal check; the test build counter is unrelated to passage order. Exact byte preservation and actual application acceptance still require their own implementation evidence.

## Adopted temporal direction and supplied-map Rust planner, 2026-10-27

HPX-OWNER-013/014 now adopt passage-specific committed-change order and staged one-click determined parent Merge. `crates/domain/src/parent_merge.rs` implements a dependency-free selector for supplied exact base-relative maps. It validates node/range/quote/reconstruction/origin consistency and budgets, combines independent edits, preserves equal-byte origins and returns no partial text for unresolved competition. It does not infer repeated-passage identity, derive a diff/lineage, discover a common ancestor, authenticate/allocate clocks, serialize/upgrade or publish.

HPX-TEST-051: full140 Rust tests pass (3 crypto +29 domain +1 keychain +6 runtime +101 storage), including nine new planner cases and64 independent region-mask combinations. All-target warnings-denied Clippy and formatting pass. Existing directly ignored native opt-in/crash-worker entries retain their scope; the parent still invokes its crash worker. The55-check Python model reruns with only its direction-status header corrected; current source SHA256 `c43e4c78327676caef2d7012bca64b9ae08aeb653ded2f1c91f80daff169adfb`, Python3.14.8. HPX-TEST-050 retains the earlier exact source/status scope.

No Lean/extraction/helper/model/theorem source or pinned toolchain was changed or replayed. The added domain module has ordinary executable evidence only; previous spend-helper/graph proofs do not establish this planner or whole-application correspondence. Runtime test/check compiles may consume local test build numbers; they are not a new main-binary delivery or authenticated passage chronology. No new durable data format or existing-workspace upgrade is claimed.

## Working-lineage, candidate codec and common-base components, 2026-10-27

HPX-TEST-052/053/054 add seven pure working-lineage cases (including50 single-splice/inverse combinations), four inactive adapter-codec cases and five supplied-metadata ancestry cases. Full156 Rust tests pass:3 crypto +41 domain +1 keychain +6 runtime +105 storage. Existing directly ignored native opt-in/crash-worker entries retain their scope; the parent invokes its crash worker. Formatting and all-target warnings-denied Clippy pass against unchanged reviewed75 Rust dependencies.

The working trace composes exact supplied UTF8 splices relative to an immediate committed base; it does not establish semantic passage identity inside coarse replacements or deduce Undo provenance from an inverse patch. Candidate codec31 preserves that trace's exact context/golden representation but performs no authentication/SQL/crypto or upgrade. The ancestry selector validates a supplied same-node DAG, including an8192-node chain, and finds a unique maximal common base; it does not fetch authenticated history. Logical budgets bound supplied work, not measured time. These are ordinary executable checks, not extracted-Rust/Lean theorems.

Existing spend/expansion/Lean/extraction/model/theorem sources and pinned toolchains were not changed or replayed. New parent-Merge modules are outside the previous bounded correspondence claim. No live Save/Commit lineage, durable clock allocation, minimum-reader migration, parent publication or UI acceptance follows. Runtime test/check compilation may consume test-build numbers; it does not itself update the manual executable. No Node/browser/Lean run or synthetic HTTPS handoff is claimed for this backend-foundation increment.

## Retained origins and isolated temporal Save, 2026-10-27

HPX-TEST-055 adds six ordinary pure-origin cases; HPX-TEST-056 adds seven encrypted SQLite driver cases. Full169 Rust tests and all-target warnings-denied Clippy/formatting pass against unchanged reviewed dependencies. Mapping confidence and supplied order remain distinct; no unrelated publication age refresh, cross-locus copy inference or unknown-confidence winner. The isolated driver proves tested atomic text/trace/receipt behavior, current authority, exact retry and bounded escaped-source handling, not temporal Commit or backed-up migration. Marker3 is installed only in disposable fixtures; same-key reconnect does not establish fresh process unlocking.

HPX-TEST-057 records the13-check actual normal-schema HTTPS regression and guarded exact-binary v1.0.0.18 handoff. It does not network-test the inactive marker3 driver or repeat all46 historical old-reader checks. Existing Lean/extraction/model/helper/theorem source and pinned toolchain were not changed or replayed. New origin and storage modules have ordinary executable evidence only, outside prior extracted-Rust correspondence; there is no whole-application proof or new real-data acceptance.

## Authenticated base inspection and origin-evidence codec, 2026-10-27

HPX-TEST-058/059/060 record full177 Rust tests (3crypto47domain1keychain6runtime120storage), all-target warnings-denied Clippy/formatting,144 Node tests,84 full headless frontend checks, six final-layout comparison checks and14 actual HTTPS workflow checks. Four SQLite cases authenticate reachable legacy single-parent history under bounds/current authority/one read view; four inactive codec34 cases reconstruct exact parent-derived origins and reject malformed/counter/copy/budget failures. Visible inspection resolves the pinned base's exact authorized snapshot and preserves drafts/ciphertext/source/Undo. Six desktop/theme views were inspected; exact tested v1.0.0.24 was guardedly handed off locked.

This is ordinary executable evidence. No Lean/extraction/helper/theorem source or pinned toolchain changed or was replayed; the pure ancestry selector's supplied-graph assumptions are now discharged only for the tested legacy SQLite reader scope. No multi-parent encrypted reader/temporal clock/publication/upgrade, general history proof, real-data acceptance or whole-application correspondence follows. Full older-reader46-check evidence retains its prior scope.

## Inactive clock and explicit-seed origin reader, 2026-10-27

HPX-TEST-061/062 record three clock codec/planning and four encrypted-reader cases; full184 Rust tests and full all-target warnings-denied Clippy/formatting pass. Counter planning is immutable-on-error and bounded to safe integers; it does not persist an order or authenticate allocation history. The reader validates marker/current scope, clock generation/last-change publication and exact parent/snapshot origin links until an explicit unknown-order seed, with no missing-evidence fallback. Tests reconnect with the same retained key, not a fresh process unlock. Fixture record installation is not an upgrade or atomic temporal Commit implementation.

No Lean/extraction/helper/theorem source/toolchain or existing correspondence scope changed or was replayed. Ordinary component evidence does not establish global chronological correctness, two-parent Merge, whole-workspace freshness or real-data acceptance. No new actual HTTPS run/manual executable handoff follows this backend-only checkpoint; HPX-TEST-060's v1.0.0.24 visible delivery retains its scope.

## Frozen temporal intent and promotion-read compatibility, 2026-10-27

HPX-TEST-063 adds three strict candidate37 receipt cases and one encrypted working-promotion fixture. It retains exact changed/unchanged request/result bindings, detects changed intent/digest/unsafe counters/malformed shapes and verifies the actual temporal request against retained origin34 when legacy receipt8 is absent. Existing current scope and immutable publication/event/text checks precede that read. The original source is not relabelled by synthesizing a different plain Commit request. Marker3 is still installed only by disposable test fixtures; no public opener/upgrade, durable counter advance or temporal Commit writer is implemented.

An independent Python standard-library compact-JSON/SHA256 vector fixes the changed request digest to `96288f2272ac2e5c74328153ac049ea4b699196bf6944669619bb1aee755f386`; the Rust codec test checks that exact byte digest, including field order, IDs, explicit unknown mapping and UTF8/CRLF/CR. These are executable format/replay checks, not a formal proof of allocation, mapping provenance or whole-application behavior. No Lean/extraction/toolchain source was changed/replayed. Later full checks and actual runtime regression retain separate scopes in the development-state guide.

Final HPX-TEST-063/064 checkpoint: full188 Rust tests and full warnings-denied all-target Clippy/formatting pass; the independent kind37 canonical digest vector passes. The14-check actual normal-schema HTTPS regression passes with exact v1.0.0.30 guarded handoff. No marker3 publication writer, fresh process unlock, two-parent Merge, backup/upgrade acceptance or whole-application proof follows. Existing Lean/extraction/toolchain evidence remains unchanged. Exact counts and byte SHA are in the development-state guide and test register.

## Selected-text heading Link regression, 2026-10-27

HPX-TEST-065 records145 Node tests,86 full headless checks before the final caret-only eligibility gate, three focused final-gate checks and15 actual HTTPS/SQLite workflow checks. Exact CRLF/CR heading recognition and unedited multiline Link insertion preserve owned bytes; no plain keyboard-focus Commit. Six desktop/theme dialogs inspected; final exact v1.0.0.32 guarded handoff locked. Backend/domain/crypto/Lean/extraction/toolchain source and proof assumptions are unchanged; prior188 Rust tests retain their earlier scope and no new formal correspondence or format acceptance follows.

## Exact in-text semantic word projection, 2026-10-27

HPX-OWNER-017 replaces arrow glyphs with brace-enclosed relation words. The new frontend projector checks complete owned-source equality, exact closed participant bindings and valid UTF8-to-UTF16/LF boundaries before matching parsed adjacent units. Requested-offset conversion does not build a per-character mapping table or quote-search repeated source. Runtime effects drop on edits; cached labels can return only when exact source/snapshot/context matches, and metadata-only head changes refresh scope even outside Relations. Registered converse display requires matching captured definition/roles; absent converses use explicit spatial words. Negation and declared certainty remain visible without changing predicate identity.

This is executable frontend projection/inspection evidence, not new pure-domain/Rust/Lean/extraction/crypto proof. Existing188 Rust tests, extracted-helper/model theorems and pinned toolchains retain their earlier scopes; none is replayed or extended by these frontend changes. Text snapshots still exclude assertions. No new wire/schema/record version, backend authorization, semantic mutation, provider or real-data acceptance follows from rendering. Actual counts/guarded binary identity and remaining nonadjacent/n-ary/composition scope are recorded in the current state and test register.

HPX-TEST-066/067 final evidence:151 Node tests,91 full headless checks on final production source plus seven final focused cases,22 actual HTTPS/SQLite checks and six desktop/theme views. Guarded exact v1.0.0.36 handoff retains the same manual workspace/origin. These are ordinary bounded UI/projection/integration checks, not a new formal correspondence, authenticated rollback guarantee or new Rust/Lean replay.

## Experimental atomic temporal Commit evidence, 2026-10-27

HPX-TEST-068 adds ten ordinary adapter cases, including actual subprocess termination after every individual write and after COMMIT, under experimental3 fixtures. Full198 Rust tests and all-target warnings-denied Clippy/formatting pass;22 actual normal-schema HTTPS checks precede exact v1.0.0.39 handoff. Same-key reconnect and test-only fresh-process passphrase unlock test encrypted recovery, not a production3 opener or accepted upgrade. Per-branch origin ages/unknown evidence, shared node order, no-op and original-operation replay retain their bounded model/format assumptions. No new Lean/extraction/toolchain source or proof replay; no whole-workspace freshness or whole-application proof follows. Separate reference replacement and backed-up format acceptance remain outstanding.

## Separate temporal reference batch evidence, 2026-10-27

HPX-TEST-069 adds three ordinary replacement cases and process-exit workers; all13 temporal cases/full201 Rust tests/Clippy/formatting pass.22 normal-schema actual HTTPS checks precede exact v1.0.0.42 guarded handoff. Reference replacement retains its own receipt and original private entries after acknowledged text publication. Tests verify exact retry/current authority and atomic recovery; no formal proof or new Lean/extraction replay, production3 opener/upgrade or whole-workspace freshness guarantee follows. Capacity and broader compatibility acceptance remain separate.

## Temporal capacity/readback evidence, 2026-10-27

HPX-TEST-070 adds two capacity cases and expanded error/process termination probes after result readback. All15 temporal cases/full203 Rust tests/Clippy/formatting pass. Full raw2MiB escaped source initially hit insufficient admission budgets; revised explicit phase allowances pass successive publication, exact origin-map reconstruction and frozen retry. The64-record boundary reserves a result slot, rejects another changed publication atomically and preserves no-op/old receipt recovery. Post-write exact map reconstruction precedes COMMIT; neither resource denial nor the test permits pruning/reseeding.22 actual normal-schema HTTPS checks precede exact v1.0.0.45 guarded handoff. These are ordinary tests with bounded admission/work-model parameters, not exact wall-clock/resource proofs, arbitrary-history production readiness or a new Lean/extraction replay. Long-lived evidence/checkpoint and concrete backed-up/two-parent format acceptance remain outstanding.

## Readable Markdown partial UI checkpoint, 2026-10-27

HPX-TEST-071 records152 Node tests and95 final single fresh-server isolated headless scenarios, with six desktop/theme views. Exact source/copy/download/Undo and presentation behavior have frontend evidence; no actual HTTPS/SQLite integration/final tested-binary handoff occurred for this slice before the owner stopped development. Intermediate46 predates the final source-mode correction; manual45 remains the last verified executable. Earlier shared test-output/stale-bundle failures are distinguished from final passing checks. No backend/domain/Lean/extraction/toolchain source or proof assumptions changed; no new Rust replay, formal correspondence or real-data acceptance follows.
