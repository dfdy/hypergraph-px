# Lean plan for finite cycle-aware selected state

**Checked model milestone, 2026-10-31:** OWNER045's semantic basis is implemented in [CycleState.lean](../../proofs/lean/Hypergraph/CycleState.lean),with31 checked named theorems and33 executed [model guards](../../proofs/lean/Hypergraph/CycleExamples.lean). [The formal digest](../../docs/08-assurance/formal-validation-digest.md#finite-cycle-state-model--2026-10-31) records exact statements,axioms,commands and remaining source-emission/resource/Rust/UI correspondence. The plan below is retained as the original work decomposition,not a claim that every original goal is complete. Physical formats and unadopted mechanisms remain open. The implemented descent measure removes one row descriptor from the finite remaining list;budget admission currently bounds result uses after construction,not operational evaluation work. Rename lemmas establish key-descriptor equality invariance,not full traversal conversion.

## Model boundary and definitions to review first

Use a pure finite mathematical model. Proposed names below describe planned definitions, not existing declarations:

| Planned definition | Required meaning |
| --- | --- |
| `SelectedBundle` | Finite scoped state table, exact root, frozen cycle/source policy and exact source/dependency descriptors. No I/O or cryptographic implementation. |
| `WellFormedBundle` | Functional row lookup; every required target resolves; exact selected owner/version/range, ordered slots and dependency projection agree with supplied verified source; no hidden head/path-dependent selection. |
| `StateKey` / `sameState` | Proposed one-step structural descriptor equality within the scoped bundle/policy. Must prove equality properties and descriptor agreement; do not define “correct recurrence” as arbitrary ID equality without relating it to selected source/dependencies. |
| `ActiveFrame` / `ActiveInvariant` | Branch-local key/state/use frames with distinct keys; exact ancestor context and immutable bundle unchanged. Siblings restore the parent active context. |
| `UseResult` | Expanded use with ordered child results, or exact cycle boundary with selected target and real matching-ancestor witness. These are model constructors, not storage kinds. |
| `Outcome` | Complete-under-cycle-rule result, or explicit invalid/missing/denied/unresolved/budget/unsupported result. Failure is never a complete stopped result. |
| `Covers` | Inductive correspondence between required ordered expansion slots and exactly one expanded child or justified cycle boundary; preserves exact target/range/context. Ordinary references remain a different projection. |
| `NavigationState` / `NavStep` | Current finite view, boundary warnings/target actions, explicit user-action events, budget and access outcome. No transition silently creates a user action. |

Represent root-relative use paths separately from `StateKey`. Prove that the key's components exclude growing path/depth/budget while preserving all selection/emission-relevant context. Treat rendering appearance as external; exact source emission requires its separately frozen policy and byte dependencies.

## Dependency order and supporting lemmas

1. Define finite tables, source/slot typing and validated-reference lookup. State where authentication, ownership, permission and exact bytes enter as assumptions about the supplied environment; they are not proved by the traversal model.
2. Prove `sameState` is an equivalence relation and that key equality implies agreement of exact source/range/mode and ordered target descriptors. Show different versions or descendant selections cannot be merged by revision/identity-only comparison. Prove invariance under consistent bijective renaming of local handles. Do not claim a semantic bisimulation quotient.
3. Define boundary construction and prove its witness is a real active ancestor with equal key; preserve the actual selected target even when its handle differs from the ancestor's. A missing reference or budget failure has no constructor for a justified cycle boundary.
4. Define traversal and prove branch-local active-stack invariants, restoration across siblings, budget accounting and finite result shape.
5. Prove coverage/completeness and determinism, then derive navigation/warning properties on results carrying those invariants. Only afterward consider executable-model comparison and actual Rust correspondence.

## HPX-PROP-006 — stopping, termination and recurrence correctness

Candidate statements:

- Given a finite well-formed selected bundle and declared budgets, the traversal returns a finite complete result or an explicit failure; it never diverges or claims budget/missing-data failure as a cycle.
- Every expanded child adds a key not previously active. Every cycle boundary has a matching active key and does not recursively evaluate that child's expansion slots in this action.
- Repeated siblings are independently visited; finite historical same-identity states are not cut merely by logical identity. Exact same-revision rows with different descendant selections retain distinct keys.

Proposed well-founded measure: the number of reachable key classes **not yet active**, with finite child-list traversal/position as a subordinate measure. Under a non-boundary descent the active set gains a fresh key, so the first measure decreases; a boundary returns directly. Finite branching and restored sibling contexts give finite unfolding, although the number of uses may exceed unique table states. Budget counters add explicit failure bounds but are not a substitute for proving state-equivalence soundness or the stopping invariant.

Review the exact recursive/iterative formulation before coding Lean. Prove `validateBundle = success` implies the model's well-formedness properties if a validator is later defined; do not silently assume the runtime decoder or graph builder establishes them.

## HPX-PROP-007 — complete results and deterministic reconstruction

Candidate statements:

- Successful expansion satisfies `Covers(root, emptyActive, result)`: every required slot occurs exactly once, in authorial order, with its exact selection or justified boundary. No extra use, substitution, silent omission or false cut appears.
- Every complete boundary retains the selected target reference, policy identity and matching ancestor witness. The finite per-inclusion list extracted from the use tree includes boundary targets; it is not an enumeration of all infinitely repeated paths.
- Missing, denied or invalid references, unresolved Ask/tied selection and work/output exhaustion cannot yield `Complete`. A pending potential-conflict review marker is a separate axis: once an exact automatic choice exists, unresolved review does not make that selection ambiguous.
- For equal frozen bundles, key/source policies and adequate successful evaluations under a fixed access premise, results and boundary decisions are deterministic. Differences in current permission can cause denial, not a different silently substituted history.
- Exact emitted source/version reconstruction follows only with a separately specified deterministic source emitter and boundary/source-map relation. Prove that relation when its representation is chosen; do not infer byte correctness from a finite use tree alone. Fonts/pixels/typesetting are outside the accepted first guarantee.

Proof structure: induction on the stopping measure/result derivation; ordered slot coverage and lookup exactness; key-soundness and unique-witness lemmas; extraction preserving paths/versions and boundary entries; then deterministic evaluation. State byte lookup/emission assumptions explicitly. Do not assume the completeness or warning property being proved as an input axiom.

## HPX-PROP-008 — warning and deliberate navigation

Candidate statements:

- Every model cycle boundary gives a visible/accessibility warning obligation and an exact target action in presentation state. No correctly constructed boundary is silently presented as ordinary complete expanded text.
- With no fresh explicit user navigation event, a warned boundary cannot transition to an opened target or schedule recursive continuation. System/render completion/retry events are not fabricated clicks.
- An authorised click consumes one explicit action and starts one finite bounded target traversal with a fresh active stack and the same frozen exact target/policy. Denial leaves an explicit non-disclosing outcome. The new view may contain another warning; the model does not automatically take its action.
- Repeated deliberate clicks can revisit a valid cycle without modifying saved source, past closure/history or falsely clearing the cycle warning on a newly encountered boundary.

Keep the accepted conflict-comparison state separate. A supporting invariant should ensure that `OpenComparison` does not perform `ResolveConflict`, and that cycle navigation cannot implicitly clear shared potential-conflict markers. Only a separately authorised resolution event may do that. This is a model obligation derived from OWNER044, not a selected marker persistence protocol.

## Worked-example and implementation evidence plan

Instantiate the [proposal's examples](finite-cycle-closure-state.md#5-worked-cases): self-cycle, mutual cycle, repeated leaf/cyclic siblings, finite historical same-identity inclusion, same manifest/version with different descendant selections, equivalent descriptors with distinct handles and an unminimized alias cycle. Add negative cases for identity-only/revision-only/path/global-visited detectors, missing references, denied reads, unresolved selection and exhausted budgets. The listed cycle/history/context/alias and failure/navigation cases now have33 checked guards in CycleExamples.lean;they are model execution,not application correspondence tests.

After semantic adoption, planned evidence tiers are:

1. Check Lean model definitions, supporting lemmas and PROP006–008 in a reviewed toolchain; record exact source/toolchain hashes, commands, axiom reports and failures in the [formal digest](../../docs/08-assurance/formal-validation-digest.md). Do not silently upgrade toolchains.
2. Compare an executable model and a future selected pure Rust traversal on the reviewed graph cases, boundary/coverage traces and budget outcomes. These ordinary comparisons are not extracted correspondence proofs.
3. Establish actual extracted-Rust correspondence only where supported, documenting conversion, table validation, equality, ordering and error bridges. Existing Kahn/rank/path and extracted budget-helper results keep their old acyclic/helper scope.
4. Separately test actual permission/load/publication/recovery behavior, browser event handling, visible/accessibility warning and focus/navigation behavior, original-intent retries, comparison/resolution semantics and source maps. A Lean state-machine theorem does not prove pixels, screen-reader output, cryptography, I/O or deployed UI correspondence.

The original plan does not adopt persistent formats,runtime mechanisms or application capabilities. OWNER045 resolved the semantic key/boundary choice. The checked model has only the standard Lean axioms recorded in the digest;exact source-emission/boundary byte policy remains the next substantive design dependency for a full emitted-source reconstruction proof.
