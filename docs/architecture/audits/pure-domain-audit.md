# Pure domain responsibility and implementation audit

- **ID:** `HPX-ARCH-010`
- **Title:** Pure domain responsibility and implementation audit
- **Purpose:** Locate actual pure rules, adapter enforcement and incomplete specification obligations without adopting a V3 redesign.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; development agent records
- **Applies to:** V3 modelling; current dependency-free domain crate, normal local API1 and separately guarded temporal foundations
- **Upstream authority:** [core model](../../05-domain/core-object-model.md), [graph projections](../../05-domain/hypergraph-mathematics.md), [navigation contract](../../06-subsystems/interfaces/domain-navigation.md), [parent-Merge algorithm](../../07-implementation/algorithms/parent-merge.md), [owner decisions](../../02-governance/OWNER_DECISIONS.md)
- **Downstream dependencies:** [C3 view](../C3/pure-domain.c4), [C4 views](../C4/pure-domain.c4), [workflows](../Sequence/pure-domain-workflows.c4), [source/module/test inventory](../evidence/pure-domain-inventory.json)
- **Verification:** [executed modelling checks](../evidence/pure-domain-validation.json); test/proof source review is not execution
- **Decision/history:** Owner requested a source-grounded Pure domain decomposition on 2026-10-29. Groupings remain proposed; no new Rust boundary, domain semantics, format or architectural decision is adopted.
- **Last reviewed:** 2026-10-29


Current diagram names and visual entry points are listed in the [navigation map](../navigation.md); earlier checkpoint titles below retain their historical scope.


## Scope and navigation

Click **Pure domain** in the Rust engine overview to open **C3 / Pure domain**. Five source-backed responsibilities lead to two C4 views: **Domain exact-source plans** and **Domain graph and history foundations**. Functions and grouped data types link to source; Fork, expansion and parent selection link to three sequence views. Existing writer/API/Commit/uncertain-result views are reused.

The C3 group names describe responsibilities across existing modules, not selected new modules/crates/services. Application coordination and storage are co-located caller responsibilities in the same Rust executable. C4 distinguishes calls from dotted type dependencies and explicitly test-only calls. In particular, an import of `Base`/`Limits` does not call the parent-Merge selector. No ancestry → trace → origins → selector production pipeline is invented.

C2 blue/grey block conventions and green/amber/grey status badges are retained. Bounded functions can be implemented while their broader feature is partial: the history responsibility includes implemented helpers but lacks wider parent-Merge composition/orchestration. Existing planned functionality stays explicitly identified in the specification/gap discussion, without adding fictitious implementation components. Static connectors are single smooth cubics; sequences use standard lifelines/messages.

## Responsibility and source mapping

| Responsibility | Actual pure source / symbols | Actual consumers / limits |
|---|---|---|
| Typed identities and coordinates | [records.rs](../../../backend/crates/domain/src/records.rs): ID wrappers, `Anchor`, `SnapshotBinding`, `utf16_to_byte`, `validate_byte_range` | Adapter codecs, historical anchors and source planners use the types/ranges. No production Rust caller of `utf16_to_byte` was found; browser mapping is separate. IDs are supplied, not allocated by domain. |
| Supplied expansion projection | [expansion.rs](../../../backend/crates/domain/src/expansion.rs): `validate`, `spend`, `Budget`, `Validated` | Existing unit/exhaustive tests call it. No production caller found. It validates only supplied vertices/edges and returns counts. |
| Exact fragment/checkpoint plans | [fork.rs](../../../backend/crates/domain/src/fork.rs): `plan`; [merge.rs](../../../backend/crates/domain/src/merge.rs): `validate`; [working.rs](../../../backend/crates/domain/src/working.rs): `capture` | Storage Fork/Merge/working helpers verify/load context and call these rules. Cross-identity synthesis reuses Fork checks; checkpoint capture is not Commit. |
| Anchored comments/assertions | [comment.rs](../../../backend/crates/domain/src/comment.rs): `plan`; [assertion.rs](../../../backend/crates/domain/src/assertion.rs): `validate`, `binary_order`, `review` | Storage comment/assertion adapters supply authenticated sources, predicate definitions and ordering keys. Review state is attributable judgement, not truth or architecture approval. |
| Same-node planning | [parent_merge.rs](../../../backend/crates/domain/src/parent_merge.rs): shared data, `plan`, `validate_side`; [ancestry.rs](../../../backend/crates/domain/src/parent_merge/ancestry.rs): `common_base` | The selector has test callers, not production orchestration. The ancestry helper is called by the bounded authorized legacy-history reader. Supplied ancestry can have two parents; that does not enable a two-parent persistent codec. |
| Immediate-base lineage/origins | [lineage.rs](../../../backend/crates/domain/src/parent_merge/lineage.rs): `Trace::{new,restore,apply}`; [origins.rs](../../../backend/crates/domain/src/parent_merge/origins.rs): `Map::{root,publish}` | Candidate codecs and guarded schema3 temporal drivers consume these helpers. `Map::publish` returns an in-memory map; clock allocation, authenticated records and SQL COMMIT remain outside domain. |

The [inventory](../evidence/pure-domain-inventory.json) records all **12 domain Rust files**, public function declarations, **47 existing test declarations**, source identities and **27 new architectural/source aliases with 41 relationships**. Tests were reviewed, not run. Serialization remains in [encoding.rs](../../../backend/crates/storage/src/encoding.rs); [domain Cargo.toml](../../../backend/crates/domain/Cargo.toml) has no third-party dependencies. No domain serialization derive, IO, cryptography or implicit authority is introduced.

## Invariants and actual enforcement

| Obligation | What exists | Scope / missing mechanism |
|---|---|---|
| Logical identity ≠ occurrence | Separate typed IDs; exact `Anchor` occurrence paths and planner comparisons | Constructors do not prove uniqueness, ownership or permissions. OS-random allocation and record/context checks belong to adapters. Current documents have one owned occurrence; general repeated/nested composition is not delivered. |
| UTF8 bytes and exact ownership | Range helpers reject reversed/outside/split-scalar ranges; Fork/capture/comment/assertion compare exact context/quotes; Trace reconstructs exact supplied bytes | UTF16 conversion needs exact owned text. The Rust helper is not a wired browser editing pipeline. Current sequence/generation/ownership guards live in adapters/browser mapping; a matching supplied string alone is not authenticated acknowledgement. No generic multi-owner whole-buffer Save follows. |
| Exact closed snapshots | `SnapshotBinding` is data; adapter `snapshot_revision`/`reconstruct` validate the current single-binding document/manifest/occurrence/node scope | No pure general closure resolver, recursive renderer or complete publication-wide structural validator. Do not replace missing historical bindings with live heads. |
| Expansion DAG vs reference cycles | Kahn validator checks finite supplied expansion endpoints/duplicates/budgets/cycles; parallel/repeated dependencies are legitimate | It does not discover edges, establish completeness, validate placement ownership or reject reference cycles. It is not a reading-order algorithm and is not called by current publication code. |
| Same-node ancestry vs derivation | `common_base` validates reachable supplied same-node metadata; Fork requires a different output identity; adapter creates new output history and pinned transformation evidence | Current legacy history reader is single-parent. Cross-identity `merge::validate` is distinct from same-node `parent_merge::plan`. No ancestry is inferred from copying, equal bytes, branch names or publication age. |
| Draft acknowledgement vs Commit | `working::capture` and Trace operate on supplied exact text; ordinary writer owns draft/receipt/Commit transactions | No pure Save or Commit service exists. Single-parent temporal Save/Commit components remain guarded experimental schema3; normal creation/opening remains schemas1/2. See existing Save/Commit sequences and [publication protocol](../../07-implementation/protocols/draft-publication.md). |
| Deterministic bounded decisions | Exact quote/reconstruction checks, explicit resource limits, ordered maps and supplied edit order; parent selection distinguishes Merged/Unresolved/error | Bounds are logical work/output guards, not benchmarked latency or a complete navigation index. Unknown order/mapping cannot become known through deduplication; nonoverlapping or identical-byte alternatives need not be rejected merely for unknown age. |
| Invariants before publication | Normal `Workspace::execute_inner` rechecks current authority before protected replay and calls relevant adapter/pure checks inside its existing transaction | Pure plans are not grants. Full recursive composition, cross-owner affected-head checks and general closure publication remain absent/unselected; do not claim these from the single-owner writer. |

Comments retain original body bytes; `trim()` only tests blankness. Assertions validate role coverage, exact participants and bounded quoted material; predicate catalogues, retrospective records and indexes remain in storage. Neither assertion acceptance nor a transformation record proves logical entailment or original authorship.

## Workflow coverage

- **Supplied expansion validation** follows actual test calls: size guards, charged registration/endpoint checks, Kahn elimination, budget/cycle failures and successful counts. It does not depict an application caller or a runtime mutation.
- **Pure Fork plan and publication boundary** follows the normal committed-source path: command validation/current authority before replay, authenticated pinned capture, externally allocated output identity, pure identity/context/range checks, staged independent output/derivation and the writer's result/receipt/COMMIT. Failure is not represented as partial success; uncertain outcomes link to existing receipt recovery. Working-source Fork is a separate adapter path, not silently equated with this sequence.
- **Supplied parent-Merge selection** follows actual selector tests: same-node/initial limits, exact supplied side validation, regional competition and final output limits. Complex overlaps or uncertain unequal coincident competition remain unresolved; a returned plan neither changes a head nor allocates a clock. No production orchestrator is implied.

## Discrepancies and evidence limits

1. The specifications describe a substantially broader graph/composition/navigation model than the pure crate implements. Proposed navigation names are not Rust symbols; some related queries exist in adapters. The focused views therefore show actual rules rather than filling the design with empty services.
2. The current runtime **does expose** `parent_merge_base` through its existing parent-base handler in [main.rs](../../../backend/crates/runtime/src/main.rs). Earlier algorithm/navigation paragraphs saying “no runtime endpoint” describe their original checkpoint. This read does not establish parent-Merge publication, two-parent history decoding or temporal capability delivery. Accepted specifications were not rewritten during this audit.
3. Parent-Merge selection, ancestry, trace and origin helpers are independent foundations. General older/two-parent map composition, complete publication orchestration and production upgrade/reader compatibility acceptance remain separate. Normal runtime command execution accepts schemas1/2; the presence of experimental methods does not authorize opening or upgrading the owner's workspace.
4. The [formal digest](../../08-assurance/formal-validation-digest.md) records four Lean rank/path model theorems and extracted correspondence for the small `expansion::spend` helper. These are different claims. Full Rust Kahn validation, snapshot closure, authorization, newer planners and the application binary are not proved by them. The pinned [extraction manifest](../../../backend/proofs/rust/extraction.json), generated helper and proof hashes were compared as files; no extraction, Lean check or theorem replay ran here.
5. Source/test inventory and mechanical diagram checks are not integrated delivery, security assurance or a performance result. Existing tests include exhaustive small graph comparison, exact Unicode/newline ranges, invalid anchors, unknown competing origins, canonical traces and bounded ancestry cases. Their existing historical evidence retains its recorded scope.

## Open V3 questions

- What should be the minimal domain representation and validation contract for general occurrences, composition rules and closed snapshots? Which adapter must establish complete authorized inputs before pure validation?
- Which currently scattered invariants should eventually become shared pure rules, and which must remain transactional/current-authority checks? Moving them would require a separate approved refactor.
- What exact older/two-parent mapping and uncertain-origin policy is required before exposing parent-Merge publication? Keep the adopted temporal interpretation while leaving missing mechanisms explicit.
- Which broader navigation interfaces are needed, with what projections, view/permission scopes and budgets? Do not promote the existing interface sketches into implemented APIs.
- Which proof obligations merit actual Rust correspondence next? A rank theorem, passing ordinary tests and an extracted helper theorem should remain separately reported.

## Executed verification

[Modelling evidence](../evidence/pure-domain-validation.json) and HPX-TEST-095 record LikeC4 export/validation, navigation/source/symbol checks, source-module/relationship coverage, guarded sequence correspondence, layout/palette checks, documentation checks and unchanged protected-input hashes. The engine saved layout changed externally during this task; its latest arrangement is retained rather than reset to the initial backup. Other existing owner geometry is unchanged; static native AppKit approximations are inspected only for basic spacing/routing and are not actual VS Code/UML visual acceptance. No application tests/build/launch, browser, asset/contract generation, proof extraction/replay, trust/provider/workspace action, commit or publication was performed.
