# Exact editing, graph and retained state

2026-11-14. OWNER059 D06–D11A engineering contract, supplementing [M1](../../05-domain/diagrams/identity-closure.c4), [M2](../../05-domain/diagrams/relationships.c4), [O1](../../05-domain/diagrams/publication-effects.c4) and the existing OWNER055/056 contracts. Types/records are in the [candidate profile](../formats/representation-profile.md). Current one-owner workflow evidence is unchanged; none of these designs is newly implemented.


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-037-01` [Working state, Save and Commit](#working-state-save-and-commit) | [hpx.native.application.publication](../diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../../04-architecture/navigation.md) · consumers: `hpx.browser.coordination` |
| `HPX-BIND-037-02` [Main branch and constructed-version capture](#main-branch-and-constructed-version-capture) | [hpx.native.domain.exact.concept_branch](../../05-domain/diagrams/identity-closure.c4) · `HPX-CAN-027` · [concept_identity_closure](../../04-architecture/navigation.md) · consumers: `hpx.native.application.dispatch` |
| `HPX-BIND-037-03` [Exact anchor relocation](#exact-anchor-relocation) | [hpx.native.domain.annotation_rules.concept_anchor](../../05-domain/diagrams/relationships.c4) · `HPX-CAN-027` · [concept_relationships](../../04-architecture/navigation.md) · consumers: `hpx.browser.editor` |
| `HPX-BIND-037-04` [Predicates, assertions and reviews](#predicates-assertions-and-reviews) | [hpx.native.domain.annotation_rules.concept_predicate](../../05-domain/diagrams/relationships.c4) · `HPX-CAN-027` · [concept_relationships](../../04-architecture/navigation.md) · consumers: `hpx.native.application.dispatch` |
| `HPX-BIND-037-05` [Selected-node Graph query and navigation](#selected-node-graph-query-and-navigation) | [hpx.native.domain.annotation_rules](../diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../../04-architecture/navigation.md) · consumers: `hpx.browser.editor` |
| `HPX-BIND-037-06` [Unexecuted conformance](#unexecuted-conformance) | [hpx.native.application.publication](../diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../../04-architecture/navigation.md) · consumers: none |
<!-- contract-bindings:end -->

## Working state, Save and Commit

Each `(workspace,user,document,branch)` identifies private working state60. Multiple sessions for the same user/context still use one expected generation/acknowledged sequence; a stale session conflicts rather than overwrites. Different users never share or overwrite a pending buffer implicitly. A shared branch head is published state, not anyone's private draft. A user changing the shared head cannot silently rebase another user's acknowledged draft.

Logical `SaveWorking` input is `{operation,context,expected_generation,expected_base,previous_ack,through_sequence,owned_edits,selection_bundle}`. `context` contains exact workspace/user/document/branch and owned buffer/source bindings; `owned_edits` replaces only explicitly identified owned buffers or exact mapped ranges, never an unconstrained multi-owner flattened buffer. Admission validates all source/selection/context/version/permission dependencies before publication. Atomically publish the new recoverable working state, every exact required recovery dependency and original receipt; acknowledge the captured sequence/generation, not later typing. Newer local typing remains modified. Missing/stale/denied dependencies fail the whole request without a partial acknowledgement.

Ordinary autosave remains mutable recoverable working state. Routine cadence does not append permanent checkpoints or immutable text revisions. Required recovery material is canonical protected evidence, not an evictable cache; replacing the current working selection cannot delete material still required by another composition, immutable reference or uncertain operation. No release/erasure policy is added: retain unreferenced recovery material pending a separately approved cleanup design and refuse on capacity instead of pruning. This is an explicit no-deletion initial design, not an unresolved eviction mechanism or a promise of unlimited writes.

Logical `CommitWorking` input freezes `{operation,context,expected_generation,expected_base,ack_sequence,bundle}`. Under current policy and shared-head CAS, atomically publish same-node immutable revisions, exact snapshot/semantic event, permitted head changes, rebased private working state and original receipt. Conflict retains outgoing work/context; no newest-head guess or fresh operation ID repairs an unknown outcome. Current OWNER010 changed-text Commit on logical node/branch departure remains; formatting/menu/comparison blur and same-context selection do not publish. A rejected or uncertain departure retains the outgoing context until original-operation reconciliation. Public shared changes never carry another user's private annotations or receipt payload.

## Main branch and constructed-version capture

One MainBranch61 slot per document names an existing same-document branch. Creation assigns the initial branch explicitly; changes require current edit/commit authority, exact expected MainBranch generation and an original receipt. Rename is a label change, not branch identity; branch deletion is not introduced. A main-only query/export resolves this exact designated branch and then freezes its selected state; it never chooses the newest revision across all nodes.

`CaptureBranch` freezes `{operation,user,document,source_context,expected_source_state,new_branch_id,label,bundle}`. Validate every required exact retained source/structural dependency, current rights and same-document identity before atomically inserting the branch/head, protected capture62 and receipt. Captured pending source becomes exact retained branch evidence, not a new Fork/content identity; the original private draft remains. Do not acknowledge until captured source bytes and nested/repeated/cyclic selections are durable. A stale/denied/partial capture leaves no new branch. Retry returns the original result; changed reuse conflicts. A constructed read-only projection is eligible only when its entire required exact state can be authorised and captured; an ordinary known branch needs no invented orphan-branch mechanism.

`DiscoverNewer` is a separate bounded protected query from a frozen view, returning only authorised alternative exact selections. Advancing a source never changes the retained acknowledged composition. Newer-version indication, OWNER056 conflict markers and cycle warnings are distinct source-neutral meanings; no indication writes history or leaks inaccessible existence/counts.

## Exact anchor relocation

Historical anchor remains `{source:SourceRef,range:Range,context:exact composition binding}`. `RelocateAnchor` names old/new exact sources and an ordered chain of retained transformation/lineage maps. Validate every map's endpoints, owner, generation, scalar-safe cuts and interval correspondence. Compose exact maps in order; relocation succeeds only when each required source interval has one total demonstrated target mapping. Insertions at boundaries use the explicit retained map's before/after positions, not a default bias or fuzzy text match.

Return `{status:exact,new_anchor,evidence_refs}` only for that demonstrated unique mapping. Return `stale` for absent/deleted/uncovered evidence and `ambiguous` for multiple demonstrated mappings. Both preserve the old historical anchor and context. Reattachment is a separately authorised explicit user action with a fresh exact target and retained relationship to the original; comparison/viewing never commits it. No nearest-quote search, equal-text ID substitution or silent mapping across unsupported CRDT states. General CRDT editing is not selected by D09A.

## Predicates, assertions and reviews

Predicate identity is stable; definition revisions63 are immutable. A definition specifies ordered role names and explicit minimum/maximum cardinality and allowed target/range kinds. Minimum/maximum come from that definition; no global minimum arity is invented. Aliases and overlapping browsing tags resolve to one predicate identity and never duplicate facts. A changed definition creates a new revision; existing assertions retain their exact old definition, participants, ranges, negation, declared certainty and attribution/context.

An inverse link names an exact compatible definition with an explicit bijection of role positions and documented meaning. If that evidence is absent, retain the original orientation and explicit direction words; no heuristic inverse is inferred. Contextual equivalence remains an attributed assertion with formalisation/premise evidence, not Node equality, automatic truth or an executed Lean proof. Review/supersession appends immutable events and current derived status; rejected/previous states remain inspectable. Retrospective annotation context is separately versioned under ADR010 and never inserted into an old text snapshot.

## Selected-node Graph query and navigation

`GraphIncidence` input is `{workspace,user,node,view_context,projection,continuation:null|opaque}`. Freeze current authorised logical node plus exact retained/draft occurrence context. Enumerate direct supported relationships in deterministic relationship-ID order, then ordered participant roles, retaining self/parallel and equal-labelled distinct identities. It is not recursive expansion by default. Return nodes/role-labelled links and a completeness marker `complete`, `partial` or `unsupported`; withheld data does not reveal its existence/count. A bounded continuation binds user, exact view/policy generation, node/projection and last emitted position; it cannot be reused after context/policy changes. Unsupported/partial incidence is never labelled complete.

Inspect and recenter modify only Graph-local focus. `OpenNode` is an explicit editing-context transition and runs the ordinary departure/recovery boundary before destination editing. Text/Graph tab changes, hovering and comparison alone preserve source, selection, Undo, draft generation and receipts. Occurrence clicks retain logical identity versus exact placement/source context; no heading label is an identity. Keyboard/text alternatives expose the same permitted roles, labels/evidence and continuation. Lock/stale replies cannot recenter or open a different target.

## Unexecuted conformance

Test two-user concurrent private Save/shared Commit, same-user delayed sessions, original-operation retry after lock/revocation, crash between receipt/publication/restart, exact nested working recovery, capacity refusal with old evidence intact, same-document branch capture, main-generation races, zero-byte/partial anchors, ambiguous maps, old predicate versions and Graph self/parallel/n-ary/stale/withheld cases. Preserve OWNER055 C1–C12, OWNER056 F1–F12 and item5 C01–C12 identities. Actual code/format/UX acceptance is separate.
