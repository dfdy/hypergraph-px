# Integrated workspace/interface proposal evaluation — issue 12

Reviewed 2026-10-24. Scope: documentation reconciliation only; frontend implementation remains paused by the owner. Tracking: https://github.com/dfdy/hypergraph-px/issues/12.

## Evidence and boundary

Read the complete local input `SPECS/Hypergraph_PX_Integrated_Architecture_UI_Specification.md` (28206 bytes; SHA-256 `52318be318982e1dde5043ca316e80d5f75e600781c2b52220db3ccf9ef2b00d`), existing product/frontend/architecture/mathematical/data/encryption contracts and actual implementation status. The input remains unchanged and ignored; its embedded implementation instructions are proposal material, not authorization to restart coding. Accepted behavior is published self-contained in [WORKSPACE_INTERFACE.md](../../Specifications/WORKSPACE_INTERFACE.md). No private manuscript, imported application source, dependency or executable code is published by this evaluation.

Actual Rust still contains the bounded expansion validator and in-memory crypto adapter. There is no durable database, domain identity/anchor/clipboard schema, HTTP API or accepted frontend runtime. Inspected exports are not an installed or verified application. Repository visibility was verified PUBLIC through `gh repo view`; source-code repository visibility is independent of application document-publication consent.

## Disposition

| Proposal area | Evaluation and integration |
|---|---|
| Five core constructs | Compatible with existing typed projections; expansion remains a derived constraint. No sixth semantic/clipboard graph |
| Shared workspace and composite chapters | Accepted target: collection membership distinct from placement; versioned ordered composites with exact recursive closures. Concrete entity encoding awaits ADR |
| Partial selection promotion | Accepted need, corrected side effects: ordinary copy cannot silently publish unsaved work; explicit promotion confirmation, source-preserving anchored parts, overlapping ranges outside tree children |
| Persistent provenance clipboard | Accepted protected per-user/workspace application state. Sensitive previews/anchors excluded from display cookies and plaintext browser recovery; key lifecycle and authorized restart recovery required |
| Fork-first paste | Accepted distinct destination identities per paste; same-identity parents cannot represent cross-identity ancestry. Read permission alone does not authorize source redistribution |
| Paste and Clear | Strengthened with atomic graph publication, expected clipboard generation, default atomic Paste All and receipt-linked clearing/reconciliation. Separate graph/user stores cannot pretend to be a transaction |
| Pinned/live transclusion | Accepted targets; pin includes nested closure. Live updates revalidate cycles/permissions and historical snapshots freeze resolution. Offline/branch resolution deferred until explicit ADR |
| Concepts/assertions | Accepted ordinary revisioned entities plus role-labelled references, not a primitive hypergraph or a logical theorem. Predicate registry mechanics deferred; competing contextual claims and rejected suggestions retained |
| Left lenses/right split | Accepted four-column desktop refinement with Interaction and Investigation; pinned lower context, scoped queries and keyboard alternatives. Document contributors remain distinct from presence |
| Selection controls | Accepted desired multi-click/wrap/font behavior, not an existing tested implementation. Sentence/paragraph/Unicode edge cases need executable fixtures and keyboard equivalents |
| Snapshots and annotations | Exact in-scope semantic state versus retrospective overlays made explicit. Inclusion defaults and closure/disclosure profile remain format gates |
| Runtime/storage | Single Rust executable retained; modular in-process capabilities. SQLite not selected, server-hosted deployment not authorized for the initial local-only milestone |
| Zotero | Extend plan to separately authenticated desktop-local and cloud adapters, read-only; no claim of protocol validation or provider connection |
| Proposed milestones | Adapt dependency order: immutable history, authorization and snapshot contracts precede durable multi-document reuse; first real editor workflow remains a gate, frontend implementation stays paused |

## Decisions before dependent code

1. Domain ADR: canonical identifiers/encodings, manifest kinds/order, anchor coordinates/transforms, source promotion effects/undo and contribution attribution. Existing math/source contracts constrain this choice.
2. Publication ADR: durable canonical records versus recoverable indexes, encrypted private clipboard state, multi-context generation/idempotency and atomic or receipt-linked clear/recovery. No storage engine chosen here.
3. Resolver ADR: designated branch/track, consistent view, repeated nested closure, cycle changes from source updates, access loss, branch lifecycle and offline policy. Ship pinned reuse before Live if necessary.
4. Snapshot/semantics ADR: predicate identities/versions, proposal/review records, exact semantic inclusion profile versus retrospective overlays, redistribution and cross-workspace rights.
5. UI contract fixtures: selection boundaries, mapping and disabled states, accessible keyboard tree/resize/multi-click alternatives, pin context and stale authorization responses. No framework choice or route catalogue becomes canonical through this review.

These are implementation gates rather than unanswered owner approvals. Requirements support a safe disabled state until the relevant gate passes; no consequential product choice is needed to publish this specification update. Ask the owner if a later mechanism changes a requirement or security guarantee.

## Validation and recovery implications

This is a documentation-only milestone. Validate current local links/section consistency, synchronized versions, unchanged runtime/proof sources and unchanged ignored input. Existing CI remains responsible for Rust/Lean regressions. No browser, durability, provider protocol, snapshot implementation or new Lean theorem is claimed checked. There is no data migration; future schema changes must preserve immutable records and explicitly version migration/recovery behavior.
