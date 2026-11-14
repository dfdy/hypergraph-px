# Initial Merge output and review workflow

## Common metadata

- **ID:** `HPX-ADR-015`
- **Title:** Initial Merge output and review workflow
- **Purpose:** Choose the first product meaning of Merge before implementing its publication semantics.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; implementation agent
- **Applies to:** first one-owner trusted-server Merge increment; existing snapshots/history and original authorship remain protected
- **Upstream authority:** [five-action requirement](../../06-subsystems/document-engine.md#owner-directed-action-set-fork-link-embed-merge-and-copy), [revision versus derivation](../../05-domain/provenance-model.md), [retained history](0011-retained-history.md)
- **Downstream dependencies:** future Merge planner, immutable transformation record, review UI and compatibility evidence
- **Verification:** explicit owner scope choice and required checks below; no implementation claim from this proposal
- **Decision/history:** the owner required Merge alongside Fork/Link/Embed/Copy. Existing specifications deliberately leave exact output-identity/conflict mechanics open. On 2026-10-26 the owner explicitly selected “Reviewed new-document synthesis.” This adopts the first scope below.
- **Last reviewed:** 2026-10-26

## Adopted first scope: reviewed synthesis into a new document

Select multiple exact committed source ranges, review their pinned text together, and compose/edit a proposed result before explicit publication into a **new document and logical content identity**. Preserve each original source and its history. Atomically record the ordered exact inputs, reviewed output's first revision/snapshot, operation and editor/publisher attribution. Unknown acknowledgement retries reconcile one operation/output. Cancelling, changing source context or review failure publishes nothing and leaves input buffers intact.

This is a cross-identity transformation, so source revisions are derivation inputs rather than same-node revision parents. The new output starts its own history. The user can deliberately combine or rewrite the inputs; the application does not resolve intellectual disagreements or connect an AI provider automatically. Source selection demonstrates what the operation used, not that every output sentence is an exact copy or that all sources support it. Preserve exact source-copy mappings only where validated; edited/uncertain contributions stay explicitly unknown rather than being assigned invented original authorship. The initial runtime still cannot claim complete fine-grained authorship reconstruction.

## Simpler alternative: exact combination first

Create a new document by concatenating the ordered committed source ranges with an explicitly reviewed separator. Source bytes remain unchanged; new separator bytes are explicit. This supports complete exact range mapping and a smaller first planner, but does not provide an editable synthesis result within Merge itself. Later edits follow ordinary output history. Label this scope clearly rather than promising conflict resolution or a semantic synthesis engine.

## Different priority: same-identity branch merge

Begin with integrating divergent revisions of one logical content identity. This requires choosing conflict presentation, multiple exact same-node parents, and explicit representation/compatibility for the current single-parent text revision shape. It is a different mechanism from combining distinct identities, and must not put cross-identity source revisions into a same-node parent list. It remains valid future scope whichever first workflow is selected.

## Shared safeguards and required verification

Every alternative retains prior immutable states, current permission checks, exact Unicode/mixed line endings, source identity versus occurrence context, reviewed publication and frozen receipt recovery. No automatic source commit/promotion, source deletion, history rewrite, confidentiality weakening or provider/publication permission follows. Verify cancellation/staleness, exact input/output retention, separate identity or same-node parent semantics as applicable, repeated operations versus retries, all-or-nothing failures/restart, old-reader preservation or explicit rejection, and honest contribution/uncertainty labels. Output/parameter records need explicit versions; production real-data acceptance remains separate.

## Current state

Owner-approved on 2026-10-26. Implement the reviewed synthesis scope above; the other alternatives remain future work. Acceptance of this policy is distinct from implementation or production format acceptance.

## Later owner clarification: parent-branch Merge

On 2026-10-26 the owner clarified that the original intention for the interface Merge function was to allow **the current text to be merged into a parent branch**. The owner explicitly requested documentation at the appropriate point in the development plan, with **no immediate implementation requirement**. This establishes the planned branch-parent workflow; it does not rewrite the earlier approval or executable evidence for the first reviewed new-document synthesis increment.

Place the clarified workflow in [roadmap stage 5](../../02-governance/roadmap.md#planned-branch-parent-merge-workflow--owner-clarification-2026-10-26), after durable branch creation/selection and branch-specific draft recovery. The source is the current document branch and the intended destination is its identified parent branch. Preserve document/content identity, retained divergent revisions and explicit same-identity merge ancestry; branch parentage must not be confused with a previous revision or a cross-identity Fork derivation. The existing synthesis action creates an independent document and is a different operation.

Parent selection/validation, merge-base rules, handling of uncommitted current text, conflict presentation and versioned multiple-parent publication remain future mechanism decisions before enabling writes. The interface must make the parent destination and reviewed result clear. This clarification neither silently changes the current command nor schedules it ahead of the required branching foundation.
