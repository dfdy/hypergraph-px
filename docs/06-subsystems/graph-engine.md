# Graph Engine

## Common metadata

- **ID:** `HPX-SUB-001`
- **Title:** Graph Engine
- **Purpose:** Graph/navigation operations, predicate handling and bounded authorized projections.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../04-architecture/system-architecture.md>); [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-30

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../architecture/context.c4) (HPX-CAN-002); [chat/MCP and permission details](ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

Graph queries and relationship changes use the shared user API with per-user-per-workspace permissions. Interactive graph views must not expose unauthorised nodes, edges or protected context through a different browser/MCP path. Exact visibility/completeness policy remains to be designed; no new graph query implementation is claimed. See the [accepted shared API scope](interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


Fixture controls and future contracts are not durable service implementations. Capabilities must report unavailable honestly.


## State and operations

A graph query names projection, consistent view, authorization scope, ordering, duplicate/cycle behavior and work/output budgets. Predicates/assertions are typed references, not a separate authoritative semantic database; n-ary roles are not reduced to independent binary claims. Rust currently implements bounded expansion validation, not the full query catalogue or durable semantic registry. The [navigation API](interfaces/domain-navigation.md) retains proposed versus actual functions.

### 7. Concepts and semantic assertions

Source `HPX-SRC-0037`, original lines 81–92. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Distinguish concept, proposition, argument, historical formulation and passage occurrence. Concepts can carry multilingual labels/aliases, definitions and competing interpretations. Same words need not imply same concept; lexical matching produces candidates, not authoritative occurrences. Occurrences use revision-specific anchors and roles such as mentions, uses, defines, qualifies or criticises.

Semantic predicates have stable namespaced identity/version, description, permitted participant types/roles and direction; inverse labels and symmetry/transitivity require explicit definitions. Families may cover ontological, process/dialectical, argument/logical, epistemological, ethical/political, conceptual, genealogical and methodological relations. For example, `semantic:develops_from` is an interpretation; an actual `core:forked_from` derivation is recorded only by the corresponding command. Do not infer logical entailment, symmetry or transitivity from English labels, or equate dialectical tension with logical contradiction.

Represent an n-ary assertion as an ordinary identifiable revisioned content entity with role-labelled reference edges; no new graph primitive is required. Record participants, qualifiers, evidence anchors, proposer and review state. Assertions may themselves be referenced or challenged, and competing assertions can coexist.

Agent proposals retain proposed/accepted/rejected/superseded states, exact branch/revision context and evidence. Only authorized review records acceptance; acceptance is an attributable contextual act, not universal truth. Retain rejected suggestion identities in the permitted scope to avoid blindly repeating them. Proposal records, accepted semantic state and reconstructible lexical indexes remain distinct. Creating/updating semantic records uses the shared authorized command path.

Snapshots bind the exact in-scope semantic/reference state or an explicit empty/excluded scope. Later annotations are separate, labelled retrospective overlays with their own view token, never inserted into old snapshots. Decide inclusion defaults and disclosure/closure rules before production snapshot formats are frozen.


## Source provenance

- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 81–92; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.

## Owner-approved selected-node graph view, 2026-10-25

Provide a **read-only graph visualisation of any user-selected authorised nodes**. Draw nodes as labelled circles and their relationships as labelled lines, with explicit direction and participant roles where meaningful. “Any selection” permits arbitrary in-scope node identities, including disconnected nodes; it does not grant access outside the authorised query view. Selection for the graph is separate from document-text selection and must not rewrite editor source, undo or the originating selection.

Binary relationships can use direct labelled connectors. N-ary relationships retain one relationship identity and explicit role-labelled incidences through a relationship connector; they must not be projected into a set of independent binary facts. Keep asserted semantic relationships, recorded derivations and checked formal results visibly distinguishable. A semantic “proves” or “logically equivalent” label alone is not checked evidence. Distinct nodes remain distinct when labels/text are equal; repeated occurrences/versions require context rather than inferred identity merging.

The projection names an authorised consistent view, exact node/reference context, ordering and resource/output bounds. Missing, inaccessible or truncated relationships are reported honestly; an incomplete result must not be described as a complete absence of connections. Read-only inspection publishes no relationship, revision, source promotion or layout-derived semantic claim. Exact durable query/namespace/annotation-snapshot mechanisms retain their existing implementation gates. The owner adopted this product requirement separately from the deferred Lean-conversion request.

## Initial document/Fork graph implementation

The first connected projection reads arbitrary selected document nodes and recorded Fork edges from the encrypted runtime. It preserves distinct logical node IDs and exact historical edge endpoints, including after current source revisions change. Selection is bounded to 16 documents and all query results share one SQLite read transaction. Missing/damaged existing derivation records fail instead of becoming invented disconnections; inputs outside the selection are explicitly counted for selected outputs. No new persistent graph/index object is created. The [runtime contract](interfaces/browser-runtime.md#bounded-documentfork-graph-projection) specifies the exact supported subset and bounds.

This delivers a first read-only document/derivation view toward HPX-RQ-029. It does not enable the deferred Lean-conversion request, persist fixture assertions, query arbitrary semantic nodes or implement n-ary predicate storage. The owner-adopted role-preserving n-ary requirement remains in force for that future projection; binary Fork evidence cannot stand in for its acceptance.

## Selected assertion-node incidence extension

The graph now additionally supports explicitly selected assertion nodes alongside document nodes. Each n-ary claim remains one revisioned content entity, with ordered, role-labelled incidences to the selected historical participant contexts. Duplicate roles/ranges remain explicit occurrences; no pairwise-fact expansion or logical inference is performed. Owner review/qualifiers remain visible and distinct from checked proof. Exact source inspection uses the retained immutable range even when the displayed document node has a newer committed context. The [projection contract](interfaces/browser-runtime.md#selected-retrospective-assertion-incidence-graph) defines bounds, completeness and unsupported families. Concept nodes, assertion-to-assertion participants, general reference queries and shared access remain future scope.

## Reviewed synthesis incidence extension

The explicit transformation graph scope adds recorded Merge groups to document/Fork and assertion incidence. Each Merge retains one transformation identity, ordered pinned inputs and its independent initial output. The canvas uses a labelled connector with separate input incidences and a directed output; it does not turn synthesis into unrelated binary facts or a logical proof. Outside-selection inputs are counted without drawing additional content nodes, and exact original inputs/output remain inspectable. Existing graph scopes retain their formats and exclusions. See the [runtime projection contract](interfaces/browser-runtime.md#selected-transformation-incidence-graph) for authorization, bounds and incomplete-view semantics.


## Selected-node editor Graph tab, 2026-10-30

HPX-OWNER-026 refines presentation of HPX-RQ-029: the main editor hosts a Graph tab focused on the currently selected logical node and all its linkages, with interactive visual inspection/navigation. Replace the dialog as the intended UI destination; retain the dialog as current implementation evidence. The existing arbitrary-selected-nodes graph requirement is not revoked: this establishes the editor's default focus, not a restriction of the underlying permitted query scope.

Preserve exact identity/view context, labelled direction, parallel/self links, role-labelled n-ary incidences and the distinction between asserted relationships, derivation and checked evidence. No binary expansion or proof inference follows from drawing a link. Read-only exploration does not publish graph or text changes. The frontend [Graph tab contract](frontend-interaction.md#selected-node-graph-tab-owner-direction-2026-10-30) owns tab placement/editor-state preservation.

“All linkages” is the intended product coverage, subject to authorisation and explicit resource/completeness bounds. It does not establish that the current document/Fork/assertion/Merge projections provide general adjacency for every node family. The design must define relationship-family discovery and continuation without revealing hidden objects, and distinguish unavailable, unsupported, truncated and genuinely empty results.

The initial interpretation is a node-centred relationship view; direct incidence versus recursively expanded neighbourhood, draft versus retained-view projection, heading-to-node mapping, and inspect/recentre/open behaviour remain unresolved (HPX-GAP-025). Do not implement an unbounded reachable-graph traversal or invent an adjacency API by implication. No persisted graph format, custody/security boundary or graph-writing permission changes here.
