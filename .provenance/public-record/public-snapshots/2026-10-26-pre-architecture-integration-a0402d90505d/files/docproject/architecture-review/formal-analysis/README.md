# Formal and analytical evidence

This directory contains a new **handwritten architectural abstraction**, not a new Lean proof or an extraction of HPX. Existing checked evidence stays in the [formal validation digest](../../../docs/08-assurance/formal-validation-digest.md): four rank/path model theorems and one actual extracted Rust spend-helper theorem. No full Kahn, authorization, storage, crypto, browser or binary correspondence is asserted.

## Transition model

[check_model.py](check_model.py) explores two content branches, source sequences 0–2, at most one new Commit per branch and one globally outstanding frozen operation, through ten transitions. Its state records current UI source, durable Draft source, immutable committed sequence history, selected branch, frozen pending operation, retained receipts, latest abstract checkpoint, exact promotion and a replacement flag.

Abstract actions are type, switch, freeze Save/Commit/capture, atomic persist, original-result replay, acknowledgement, precommit failure, replacement and replacement failure. Unknown/lost replies remain pending. Branch IDs are fixed and node identity cannot change in the model. A source sequence denotes exact bytes by assumption: this model does not prove UTF8 or range conversion.

For every examined transition it checks that acknowledgements do not mutate UI/durable source, Save/capture do not append text history, history remains a prefix, a new publication has an atomic Commit receipt, replacement implies exact promotion, and failed post-Commit replacement does not undo text. Source checkpoint retention beyond the latest abstract sequence is outside this small model; actual HPX must retain originals.

Executed result: **8,131 unique reachable states, 18,317 transitions, no violation within the stated bounds**. Full inputs, source digest, interpreter and results are in [model-results.json](model-results.json). This is bounded reachability, not induction, an unbounded proof, a liveness proof, generation-CAS completeness, or executable refinement. Precommit atomicity is assumed by the valid transition, so it is not independently established for SQLite by this model.

Three deliberately bad variants produce counterexamples: late acknowledgement overwrites newer typing; acknowledgement changes the focused branch; Commit appends history without receipt. These are sensitivity checks for the model, not HPX bugs. A separate two-replica example confirms acyclic edge sets X→Y and Y→X form a cyclic union.

## Contracts and proof obligations

Let D(b) be mutable acknowledged source, H(b) an immutable sequence of committed states, P(o) the frozen payload of operation o, and R(o) its original receipt. Successful Save changes D but not H. Commit extends H by one exact same-node state and publishes its snapshot/event/head/rebased Draft/R(o) together. Retrying o requires the original P(o); changed reuse conflicts. An acknowledgement advances evidence about the frozen source, never overwrites source typed after capture.

For checkpoint c and committed result r, initial promotion requires full source/context equality, not merely equality of a selected quote. Replacement e′ retains predecessor e and exact promotion evidence. The transaction order is capture T₁, text Commit/promotion T₂, separate replacement batch T₃. Failure of T₃ cannot invalidate T₂. This deliberately follows the accepted latest ADR019 semantics; the older atomic-with-Commit private batch checkpoint is superseded.

Future useful implementation-connected checks include multi-tab/multi-context in-flight operations, generation conflicts and revoked authorization before replay, exact payload equality, restart after T₂ before T₃, old-reader draft invalidation, malformed/future DTOs, bounded list capacity and immutable historical reconstruction. See [invariant matrix](../traceability/invariants.md) and [failure analysis](../traceability/failure-analysis.md).

## Complexity estimates

These are analytical observations, not measurements. V/E count the caller-supplied expansion projection; N is exact source bytes, Q selected quote bytes, K a bounded reference count, S acknowledged mutation count, B bytes in an exported closure.

| Operation | Time / space or storage estimate | Evidence / limit |
| --- | --- | --- |
| Expansion validator | Time O((V+E) log V), space O(V+E); successful charged work exactly 2V+2E | Ordered BTreeMap implementation and algorithm contract; full Rust validator unproved |
| One changing Save | At least Ω(N) source serialization/encryption; mutable text slot overwritten; Θ(S) retained receipts over S operations | No replay of all history per Save; exact DB/envelope overhead unmeasured |
| Working checkpoint/copy | At least Ω(N+Q) payload work; pending Save plus checkpoint logically 2N+Q source bytes before serialization overhead | N≤2 MiB; escaped JSON/request envelope limit checked separately; not a size benchmark |
| Repeated source validation | Potential O(KN) processed bytes if K entries each reconstruct same N-byte source without transaction cache | K bounded by list capacity; exact invocation/allocation count requires profiling |
| Selected graph | Selected nodes ≤16; shared assertion/Synthesis distinct-source work ≤64, plus separately bounded original Fork reads | Not an unbounded all-outgoing query or an O(1) operation; emitted records still cost bytes |
| History page | O(returned chain steps + authenticated bytes), page ≤32 / 16 MiB read budget after catalog/head | No retention count cap or fabricated timestamp sort; current catalog bounds still apply |
| Complete compile/render | At least Ω(B + output bytes); repeated occurrence expansion can grow output above unique source size | General closure/compiler budgets remain future; no claim an index avoids output-size cost |
| Encrypted backup | At least Ω(DB snapshot bytes), plus verification reads and fsync | Enrollment path uses consistent SQLite backup; portable restore is future |
| Runtime contention | Workspace routes serialized under state mutex; bounded ingress is not parallel execution | Socket deadline excludes starting stale queued route, not preemption of executing KDF/SQL |


## Dependency structure

The [static graph](../traceability/dependencies.json) records five local Rust crates/six normal local dependency edges and 52 frontend modules/101 recognized static relative import edges. Tarjan SCC analysis found no cycles in these graphs. Storage shared-parent imports and callback/global state are not a precise function call graph; dynamic dependencies and target/build/dev dependency graphs are outside this parser. No blanket cycle-free architecture claim follows.
