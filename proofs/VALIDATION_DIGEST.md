# Human-readable Lean validation digest

**Evidence date:** 2026-10-24. **Toolchain:** Lean/Lake 4.35.0. **Current inventory:** four checked Lean model theorems and one checked theorem about an Aeneas-extracted real Rust helper. The full Rust graph validator remains unproved. This is a maintained evaluation record for developers and mathematicians, not a claim that the application or Rust graph algorithm is formally verified.

The word “checked” below means Lean accepted a proof term for the stated proposition, and the compiled project environment was also checked with `leanchecker`. This differs from executing examples or passing a Rust test suite. The checked source is [Expansion.lean](lean/Hypergraph/Expansion.lean); the package entry imports it through [Hypergraph.lean](lean/Hypergraph.lean).

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
| [`hypergraph_domain::expansion::validate`](../crates/domain/src/expansion.rs) | Five Rust tests, including exhaustive comparison of all 512 directed three-vertex graphs against a separate reachability oracle; formatting/Clippy/CI evidence in the foundation record | **Not formally verified.** Its Kahn elimination, declared-vertex checks, multiedges, maps/queue, work budgets and machine arithmetic have not been translated/proved in Lean. |
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

The project pins [lean-toolchain](lean/lean-toolchain) to `leanprover/lean4:v4.35.0`. The local compiler reports commit `eb6cafb7290e8bd5f2937522d8d804f58f02bafc`, Darwin arm64. The project imports `Init`, with no Mathlib or Aeneas package dependency. The Lake manifest has an empty external-package list.

Executed successfully in `proofs/lean`:

```sh
lake build
lake env lean Hypergraph/Expansion.lean
lake env leanchecker Hypergraph
```

`lake build` uses `-DwarningAsError=true` from [lakefile.toml](lean/lakefile.toml). It builds both the proof module and the package entry module. `leanchecker` returned exit 0 for the compiled project environment. Four `#print axioms` commands in the model reported:

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

The Rust hash identifies the related implementation. The full validator remains unverified; §7 now binds a checked extraction of its private spend helper to that same source. Tool licenses/origins are in [TOOLING.md](../legal/TOOLING.md). [Issue 2](https://github.com/dfdy/hypergraph-px/issues/2) and [work record](../docs/work/0002-lean-foundation.md) retain scope and CI evidence. No retired-project proof/test result is reused.

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

**Checked symbol:** `spend_spec` in [SpendProof.lean](rust/SpendProof.lean), about `hypergraph_domain.expansion.spend` in [generated Spend.lean](rust/Spend.lean). **Original Rust:** the private helper in [expansion.rs](../crates/domain/src/expansion.rs). This source was extracted by Charon; the Lean body was not manually rewritten.

The Rust function receives mutable machine-sized `work` and a `budget`, returning Rust `Result<(), Error>`. The generated Lean function receives two `Usize` values and returns an outer Aeneas result containing both the ordinary Rust result and the post-mutation counter. The outer result models successful execution versus panic/divergence; a returned Rust `Err(Budget)` is an ordinary successful execution of that function.

The theorem quantifies over every represented pair of machine-sized inputs. Its total postcondition is the following disjunction:

- If work < budget: ordinary Rust result is Ok and the returned counter equals the original work + 1.
- If budget ≤ work: ordinary Rust result is Err(Budget) and the returned counter is unchanged.

**Technical proof:** unfold the automatically generated function and split its guard. Simplification proves the exhausted branch. In the available-budget branch, the Aeneas `step` tactic applies the checked addition specification; `scalar_tac` discharges arithmetic obligations using work < budget and the bounded Usize representation. These facts imply work + 1 ≤ budget ≤ machine maximum, so addition cannot overflow. The total weakest-precondition specification proves outer successful return, rather than allowing panic/divergence vacuously. This proves this helper's accounting rule, not the validity of the graph, the chosen work-cost model, the surrounding loops or authorization.

**Actual sequence:** pinned Charon compiled/extracted the original crate from the helper root; Aeneas translated it with warnings as errors; the generated file was byte-compared against the tracked output; pinned backend dependencies were checked; Lake built the theorem; theorem axioms were printed; `leanchecker SpendProof` rechecked the environment. The end-to-end [replay script](../scripts/check_rust_proof.py) passed locally, including fresh extraction from the unchanged Rust source. It isolates Rust nightly/Cargo/proof caches rather than changing the normal user toolchain.

**Axiom report:** `spend_spec` depends on `[propext, Classical.choice, Quot.sound]`. These are Lean's standard foundations used by the backend/tactics. There is no sorryAx or native-decision axiom in the theorem report. Unlike the four initial graph theorems, this theorem is not axiom-free; evaluation must retain that distinction.

**Tool boundary:** Aeneas commit 74aabd52f77001cf9eaad51b4f4b867a7dc6b111; Charon 0.1.294 at 260ba2c82588291b1f9efaf4f42d7100adc9c6c2; Rust nightly-2026-09-17; Lean 4.35.0. Trust includes Rust compilation/MIR extraction, the translator, the Aeneas standard-library semantics and Lean's checking/host/artifact infrastructure. The theorem is about the translated semantics, not an independent proof of emitted machine code. The existing graph validator's BTreeMap/VecDeque/control flow remains outside this result.

Reproduce with `python3 scripts/check_rust_proof.py --download` after installing the pinned Lean/Lake, Python 3.12+, GitHub CLI and rustup. See [Rust proof README](rust/README.md) for tool reuse and [extraction.json](rust/extraction.json) for exact asset/source/proof/dependency pins. A source-hash change fails until reviewed and re-extracted; no dependency or generated-source mismatch is silently accepted. Hosted replay is a separate workflow whose actual results are recorded in the work record.

Checked artifact hashes:

```text
feef095d9ad83706fa45ff0112cf40a9cced536527db7d7e48d200855b32cc9b  proofs/rust/Spend.lean
e61df9d66ff4da04af2e6ca860a8a01eab195811d7562032fc0732d2578e0875  proofs/rust/SpendProof.lean
```

The original Rust module hash remains the one recorded in §4. Added nine development-only Lean packages are revision/license-pinned in the extraction record; no runtime Cargo dependency or Rust code was added by this proof.
