# Human-readable Lean validation digest

**Evidence date:** 2026-10-24. **Toolchain:** Lean/Lake 4.35.0. **Current inventory:** four checked Lean model theorems; zero Rust functions formally verified through Lean. This is a maintained evaluation record for developers and mathematicians, not a claim that the application or Rust graph algorithm is formally verified.

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
| Internal `expansion::spend` | Exact boundary behavior exercised through validator tests | **Not formally verified.** No corresponding extracted function or overflow/budget theorem exists yet. |

The Lean results currently concern mathematical relations/rank witnesses. They are not theorems about the compiled Rust binary, its filesystem, its authorization or a particular in-memory graph catalogue.

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

The Rust hash identifies the *related unverified implementation*, not a proven extraction. Tool licenses/origins are in [TOOLING.md](../legal/TOOLING.md). [Issue 2](https://github.com/dfdy/hypergraph-px/issues/2) and [work record](../docs/work/0002-lean-foundation.md) retain scope and CI evidence. No retired-project proof/test result is reused.

## 5. Reproducing and extending the evaluation

Install the exact pinned Lean toolchain, then run the commands above. With elan installed, `lake` selects the toolchain from the file. With an official unpacked distribution, prepend its `bin` directory to PATH. Recompute the source hashes before treating these results as evidence for modified code. The CI workflow builds with the pinned Lean action, rechecks the environment and prints theorem dependencies. Its checker must explicitly target `Hypergraph`: the Lake package is named `hypergraphProofs`, while the library module is `Hypergraph`. The initial hosted build passed but the helper guessed `HypergraphProofs` and could not find that module; specifying `leanchecker-args: Hypergraph` corrects the integration without weakening the check. Final hosted results belong to the work record.

Actual Rust-to-Lean extraction remains **unrun**. The preliminary Aeneas assessment pins a candidate Aeneas/Charon/Lean combination and records missing local translator build tools; it is not a pass/fail result for Rust support. Next evaluate a representative extraction, then prove that successful Rust validation produces or entails an accepted mathematical witness, including machine arithmetic, error paths and budgets. If containers are opaque, document required verified specifications or choose a smaller verification boundary rather than assuming equivalence.

## 6. Maintenance requirement for future validated functions

For every additional Lean-validated function or theorem, append an inventory row and a readable explanation including:

1. Exact Lean symbol and actual Rust counterpart, or an explicit “model only/no implementation counterpart.”
2. Plain-language guarantee, formal inputs/output, quantifiers, preconditions and excluded cases.
3. Proof method, key lemmas and the model/representation bridge.
4. Checked source revision/hash, toolchain/extraction versions, commands, results and CI evidence.
5. Axiom/trusted-assumption report; treatment of panics, integer bounds, I/O, concurrency and cryptography where relevant.
6. Whether a source change invalidates the claim, what must be rerun, and the remaining unproved obligations.

Never promote an ordinary test, a proposed proof, a failed build, or a model-only theorem into “Rust function verified.” Keep unsuccessful attempts and their corrections in the work record, so later evaluations can distinguish a sound result from an attractive but unconnected mathematical model.
