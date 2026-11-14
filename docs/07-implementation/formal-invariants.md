# Formal Invariants and Proof Obligations


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-029-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-029-02` [Current adopted design — OWNER059](#current-adopted-design--owner059) | Prose only: Routing summary to the detailed adopted design contracts; their section bindings carry ownership. |
| `HPX-BIND-029-03` [Formal property](#formal-property) | [hpx.native.domain.exact](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-029-04` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
| `HPX-BIND-029-05` [Reconstruction correspondence obligations — item5](#reconstruction-correspondence-obligations--item5) | [hpx.native.domain.exact](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-050-01` [Model boundary and definitions to review first](#model-boundary-and-definitions-to-review-first) | [hpx.native.domain.projection_expansion](../05-domain/diagrams/graph-projections.c4) · `HPX-CAN-025` · [concept_graph_projections](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-050-02` [Dependency order and supporting lemmas](#dependency-order-and-supporting-lemmas) | [hpx.native.domain.projection_expansion](../05-domain/diagrams/graph-projections.c4) · `HPX-CAN-025` · [concept_graph_projections](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-050-03` [HPX-PROP-006 — stopping, termination and recurrence correctness](#hpx-prop-006--stopping-termination-and-recurrence-correctness) | [hpx.native.domain.projection_expansion](../05-domain/diagrams/graph-projections.c4) · `HPX-CAN-025` · [concept_graph_projections](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-050-04` [HPX-PROP-007 — complete results and deterministic reconstruction](#hpx-prop-007--complete-results-and-deterministic-reconstruction) | [hpx.native.domain.projection_expansion](../05-domain/diagrams/graph-projections.c4) · `HPX-CAN-025` · [concept_graph_projections](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-050-05` [HPX-PROP-008 — warning and deliberate navigation](#hpx-prop-008--warning-and-deliberate-navigation) | [hpx.native.domain.projection_expansion](../05-domain/diagrams/graph-projections.c4) · `HPX-CAN-025` · [concept_graph_projections](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-050-06` [Worked-example and implementation evidence plan](#worked-example-and-implementation-evidence-plan) | Prose only: Historical proposal/review, authority, provenance or evidence plan; retain its stated status without inventing a software owner. |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-ALG-001`
- **Title:** Formal Invariants and Proof Obligations
- **Purpose:** Formal obligations and exact assurance limits for Lean models and selected extracted Rust.
- **Level:** `07-implementation`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-DOM-002](<../05-domain/hypergraph-mathematics.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-11-01

Four historical DAG model theorems and one separately retained extracted spend-helper theorem are joined by31 checked finite-cycle and19 bounded source-emission model theorems; full-validator,authenticated source/parser,operational-resource,storage,crypto and app correspondence remain unproved.



## Current adopted design — OWNER059

The directly selected D01–D22A briefs now have diagram-owned definitions and precise supplements: [CAN027 / Working state exact editing and graph policy](../06-subsystems/contracts/editing-and-graph.md). These govern the listed design questions; earlier open-mechanism statements below retain their historical checkpoint scope where superseded by this explicit decision. Candidate record/profile designs are not active formats or implemented capability. Exact retained source/byte/history and accepted obligations remain; actual code, measured capacity, genuine older-reader, recovery/security/UI acceptance and proofs are separately unperformed. No original source provenance or as-run evidence is rewritten.

## Formal property

The [human-readable validation digest](../08-assurance/formal-validation-digest.md) retains historical archive/source-ID evidence and the current cycle-aware model results;its proof sources remain active in [proofs](../../backend/proofs/lean/Hypergraph/Expansion.lean).

| Property identity | Checked declaration | Existing recorded assurance |
|---|---|---|
| HPX-PROP-001 | Hypergraph.path_increases | Lean model theorem; path induction under strict edge-rank assumption |
| HPX-PROP-002 | Hypergraph.rank_implies_acyclic | Lean model theorem; a self-returning path would imply rank(v)<rank(v) |
| HPX-PROP-003 | Hypergraph.forward_insertion_preserves_rank | Lean model theorem for adding a lower→higher rank edge |
| HPX-PROP-004 | Hypergraph.forward_insertion_preserves_acyclic | Model corollary combining rank preservation and acyclicity |
| HPX-PROP-005 | spend_spec in proofs/rust/SpendProof.lean | Selected actual Rust helper extracted via Charon/Aeneas; accounting/exhaustion and overflow guarantees within extraction assumptions |

The four model theorems do not prove Rust Kahn execution. Full-validator extraction encountered nested-loop return and Iterator::filter_map model limits. No storage/encryption/authorization or compiled-application proof follows. Maintain exact source/toolchain hashes, theorem dependencies and replay evidence; do not duplicate an unverified proof claim into a success table.

### Required cycle-aware expansion proofs — HPX-OWNER-041

The owner requires the following Lean work for the [accepted cycle-aware inclusion policy](../05-domain/hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041). These accepted obligations now have [checked finite supplied-state model results](../08-assurance/formal-validation-digest.md#finite-cycle-state-model--2026-10-31); precise scope and remaining emitter/resource/implementation bridges are retained below. No cycle-aware extracted implementation correspondence exists.

| Property identity | Required guarantee | Status |
| --- | --- | --- |
| HPX-PROP-006 | For a finite authenticated selected dependency graph and explicit budgets, automatic expansion terminates with a correct finite result or explicit failure; cycle-closing dependencies stop at the defined boundary. Distinguish active recursion from repeated siblings and finite historical inclusion; prove the chosen exact-state equivalence and traversal invariant rather than assuming them. | Checked finite typed-table stopping/recurrence model; operational resource and implementation correspondence remain open. |
| HPX-PROP-007 | A successful result covers every required expanded use and exact cycle boundary under the frozen rule, with no silently omitted, duplicated, substituted or wrongly cut contribution; reconstruction is deterministic from exact closure/policy/profile inputs. Missing/unauthorised data and budget exhaustion cannot produce a falsely complete result. | Checked ordered exact-use coverage/state determinism plus OWNER047 bounded emission/byte-map witnesses under supplied frozen source-faithful partitions (TEST155); authenticated source/parser and implementation correspondence remain open. |
| HPX-PROP-008 | In a formal navigation/presentation state machine, each detected cycle boundary has a warning state and an explicit authorised navigation action; absent a new user action, it cannot automatically reopen recursively. Each click is bounded, may revisit valid cyclic content, and retains the correct target/context and warning state. | Checked warning/action/no-click/denial/conflict-review model; actual UI/access/event correspondence remains open. |

Prove model results first and record exact definitions, assumptions, source/toolchain hashes and axiom reports in the [full digest](../08-assurance/formal-validation-digest.md). Establish correspondence for the actual selected Rust traversal/navigation logic where supported; explicitly document remaining bridges. Lean state-machine proofs alone cannot prove that browser pixels, keyboard/screen-reader behaviour, transport permission checks or UI event handlers match the model: require targeted implementation, accessibility and recovery tests as separate evidence. The four existing DAG model proofs and extracted `spend_spec` retain their original scope and cannot be relabelled as these proofs.

The [finite-state candidate](../05-domain/proposals/finite-cycle-closure-state.md) and [Lean proof plan](formal-invariants.md#formal-property) now propose definitions, key-soundness/coverage invariants and proof dependencies for these identities. OWNER045 adopts the finite-state/structural-key/boundary semantic basis; 31 named finite-state model theorems/33 guards are checked under HPX-TEST-153; OWNER047 adds19 source-emission theorems/18 guards under HPX-TEST-155 with explicit input premises in the digest. [Exact definitions,axioms and remaining proof limits](../08-assurance/formal-validation-digest.md#finite-cycle-state-model--2026-10-31) prevent treating those results as complete emitted-source,Rust/UI or operational-resource proofs.

### 6. Formal validation

Source `HPX-SRC-0032`, original lines 72–81. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Keep critical validators pure and deterministic. Lean models/proofs target occurrence/expansion invariants, immutable history/provenance, snapshot determinism, authorization and key-custody transitions. Perform an early Aeneas feasibility check on representative Rust; prove selected actual Rust functions where supported.

For every property distinguish proposed obligation, checked Lean model, differential/property-test evidence and actual extracted-Rust correspondence proof. Document toolchain versions and trusted assumptions, including cryptographic libraries, entropy, I/O and client integrity. No whole-application security or Rust correctness claim follows from model-only proofs.

Lean/Aeneas are build/CI tools, not runtime requirements. Preserve a testable pure core even for functions not supported by extraction. All proof/test results must be actual executed evidence. Maintain a human-readable digest of every Lean-validated function/theorem for developer/mathematician evaluation, including its guarantee, assumptions, proof technique, exact source/toolchain and Rust correspondence status.

Future Word review import must match tracked changes and comments to an explicitly selected branch or snapshot, with imported contributions attributed to the virtual **Word Revision** user. Preserve immutable snapshots and review conflicts before applying to a writable branch; see [Word review import](<../06-subsystems/external-integrations.md>). This capability is not implemented.

### 6. Formal obligations and implementation correspondence

Source `HPX-SRC-0026`, original lines 100–112. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Candidate initial properties:

1. A valid occurrence move preserves rooted-parent invariants and chosen expansion acyclicity.
2. Successful immutable commit preserves prior revisions and same-identity parent validity.
3. Transformation outputs retain valid ordered inputs/ranges and complete intended output coverage.
4. Reconstruction is a deterministic function of the exact closed snapshot and explicit compiler inputs.
5. An accepted operation satisfies the applicable actor/device/policy authority; configuration cannot create client-only decryption authority.
6. A future conflict resolver is deterministic under its specified causal input/accepted-operation set; encryption delivery order does not define graph validity.

For each theorem record its definitions, preconditions, trusted assumptions, Lean file/symbol, corresponding Rust function and actual checked evidence. Model-only proof, differential tests and Rust extraction proof are separate columns. The first rank/path model proofs are now checked under Lean 4.35.0; see [formal assurance](<formal-invariants.md>) and the [validation digest](<formal-invariants.md>). The unchanged Rust budget helper now has a checked Aeneas-extracted theorem; full graph validation remains unproved. Cryptographic primitives, randomness, host/client integrity and filesystem durability require explicit assumptions and additional validation.


## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 72–81; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 100–112; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.

## Reconstruction correspondence obligations — item5

The [item5 correspondence specification](../05-domain/proposals/reconstruction-correspondence.md) defines twelve explicit bridges from actual authenticated suppliers through selected-state conversion, traversal/emission, owned coordinates, resource accounting, authority/publication/recovery, formats, conflicts and actual cycle-navigation UI. These are refinements of existing obligations, not newly checked theorems. Existing HPX-PROP identities and their model/extracted-source assumptions remain unchanged; no current Rust, cryptographic, storage or application correspondence is inferred. The contract preserves separate item1–4 conformance identities and requires actual implementation-bound evidence before integrated guarantees.

## Model boundary and definitions to review first

The following decomposition preserves HPX-PROP-006–008 obligations and their original proof dependencies. It is a maintenance/remaining-correspondence contract: the checked model results in the formal digest supersede plan-era future tense only for the exact theorems actually recorded there. Proposed proof measures and future Rust/UI/source bridges are not thereby checked.

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

The checked CycleState traversal instead decreases a finite remaining-descriptor list, with child traversal as a secondary measure. The original reachable-key-class measure above is not claimed as its implemented proof. Consistent renaming results cover descriptor equality, not full traversal-conversion or bisimulation. Review the exact recursive/iterative formulation for any later correspondence proof. Prove `validateBundle = success` implies the model's well-formedness properties if a validator is later defined; do not silently assume the runtime decoder or graph builder establishes them.

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

Instantiate the [proposal's examples](../05-domain/proposals/finite-cycle-closure-state.md#5-worked-cases): self-cycle, mutual cycle, repeated leaf/cyclic siblings, finite historical same-identity inclusion, same manifest/version with different descendant selections, equivalent descriptors with distinct handles and an unminimized alias cycle. Add negative cases for identity-only/revision-only/path/global-visited detectors, missing references, denied reads, unresolved selection and exhausted budgets. The listed cycle/history/context/alias and failure/navigation cases now have33 checked guards in CycleExamples.lean;they are model execution,not application correspondence tests.

After semantic adoption, planned evidence tiers are:

1. Check Lean model definitions, supporting lemmas and PROP006–008 in a reviewed toolchain; record exact source/toolchain hashes, commands, axiom reports and failures in the [formal digest](../08-assurance/formal-validation-digest.md). Do not silently upgrade toolchains.
2. Compare an executable model and a future selected pure Rust traversal on the reviewed graph cases, boundary/coverage traces and budget outcomes. These ordinary comparisons are not extracted correspondence proofs.
3. Establish actual extracted-Rust correspondence only where supported, documenting conversion, table validation, equality, ordering and error bridges. Existing Kahn/rank/path and extracted budget-helper results keep their old acyclic/helper scope.
4. Separately test actual permission/load/publication/recovery behavior, browser event handling, visible/accessibility warning and focus/navigation behavior, original-intent retries, comparison/resolution semantics and source maps. A Lean state-machine theorem does not prove pixels, screen-reader output, cryptography, I/O or deployed UI correspondence.

The original plan does not adopt persistent formats,runtime mechanisms or application capabilities. OWNER045 resolved the semantic key/boundary choice. The checked model has only the standard Lean axioms recorded in the digest;exact source-emission/boundary byte policy remains the next substantive design dependency for a full emitted-source reconstruction proof.
