# Working branches and exact reference checkpoints

## Common metadata

- **ID:** `HPX-ADR-019`
- **Title:** Working branches and exact reference checkpoints
- **Purpose:** Design pending edits as private working branches so provenance operations can capture uncommitted text safely.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; implementation agent
- **Applies to:** next local editing/reference design; not an implemented storage format
- **Upstream authority:** [core identities](../../05-domain/core-object-model.md), [immutable provenance](../../05-domain/provenance-model.md), [draft and commit requirements](../../03-requirements/system-requirements.md), [initial branches](0018-initial-local-branches.md), explicit owner request on 2026-10-26
- **Downstream dependencies:** branch/editor state, exact-source DTOs, protected clipboard, checkpoint/promotion records, retry and recovery contracts
- **Verification:** transition and executable acceptance cases below; implementation evidence remains separate
- **Decision/history:** owner proposed pending edits as a special branch with automatic save for copy/paste and replacement links; explicitly requested designing this now before continuing branch integration
- **Last reviewed:** 2026-10-26

## Authority and scope

The owner selected “Design working branches now” after adopting committed-snapshot creation in ADR018. The owner subsequently explicitly answered “Adopt the working-branch design.” The working/checkpoint/promotion policy below is accepted for implementation; acceptance does not claim implementation or fix unselected byte layouts. ADR018's named child still starts from a reviewed committed snapshot and leaves the parent's pending edits untouched. The working branch described here is the private editing state belonging to a selected content branch, not another independently named alternative chosen by that creation command.

Retain the accepted distinction between draft acknowledgement and explicit Commit. The design interprets automatic **save** as durable private editing/checkpoint state. Only explicit **Commit** advances the selected content branch's published head. Automatically committing on clipboard activity would change HPX-RQ-006 and needs a separate owner decision. Existing committed-passage comments remain within ADR017; this proposal does not automatically enable draft comment anchors, shared editing or branch Merge.

## Model

| Object | Identity and meaning | What can advance it |
|---|---|---|
| Content branch | Independently identified selection of published content for one document/node | Explicit Commit; future separately designed Merge |
| Private working branch | A distinct branch identity, explicitly typed as working, associated with one content branch and current owner/device | Draft acknowledgement and exact checkpoint operations |
| Recoverable working buffer | Mutable source plus generation, local acknowledged sequence and exact base, owned by the working branch | Existing exact-buffer autosave with compare-and-swap |
| Working checkpoint | Immutable exact source/context captured from one acknowledged working sequence, with its own typed identity and recorded operation | An explicit reference operation that needs durable exact source |
| Promotion | Immutable evidence connecting a specific working checkpoint to an exact committed result | Commit when exact correspondence is established |

The document/node identity is shared through working edits. Working-branch parentage, checkpoint ancestry, committed same-node ancestry, and cross-identity Fork derivation remain separate fields and relations. The working branch never grants authority and is not globally shared merely because it has an ID. There is no mutable global “current branch” used to resolve a retained reference; every command carries its exact branch and source context.

Keep the existing mutable acknowledgement path for idle autosave. Creating an immutable checkpoint is an additional semantic operation when a durable reference requires one, rather than creating a text revision on every keystroke or every five-second acknowledgement. A working branch can therefore have newer recoverable buffer bytes than its last immutable checkpoint. This is a branch with an editable buffer and a retained checkpoint head, not an assertion that every browser keystroke is already saved.

Working checkpoints are explicitly unpublished source evidence, not ordinary committed revisions, committed snapshots, authorship assertions or approval events. Use distinct typed checkpoint identities and source variants. Do not put a checkpoint ID in an existing `RevisionId`/`SnapshotId` field or teach an old Source decoder to infer its kind. Domain concepts/planners remain serialization-free; adapters own exact versioned DTOs, encryption, authorization and persistence.

## Reference capture transition

1. Capture the owned source, document/node, content and working branch IDs, occurrence context, base, browser sequence and selected UTF-8 range before asynchronous work. Convert browser UTF-16 coordinates against those exact owned bytes; preserve CRLF and scalar boundaries.
2. Settle any earlier uncertain operation using its original operation ID/body. Acknowledge the captured buffer with its expected generation/base/previous sequence. Later typing remains in the same branch's browser buffer and is neither lost nor silently included in this capture.
3. In one authorized transaction, validate that exact acknowledged state and create/reuse its immutable working checkpoint, the protected reference and operation receipt. Checkpoint reuse requires complete context and byte equality; a digest alone does not merge identities. A reference names the checkpoint and exact occurrence/range, never the moving working-branch head.
4. Only acknowledge a durable provenance reference after that transaction commits. An unknown reply is reconciled through the original receipt; retry cannot capture newer text or create a second semantic copy. A conflict keeps the original frozen intent visible for explicit recapture rather than substituting another source.

The existing committed-reference path remains available when the selected bytes are already in a reviewed committed snapshot. Pending edits no longer need a forced Commit solely to obtain durable source evidence once this checkpoint path is implemented. The current implementation still has that restriction.

Ordinary operating-system text copy/paste is not itself a request to publish provenance or export the workspace. Apply the checkpoint transition to HPX operations that require a retained source, including protected Copy source reference and provenance-bearing paste/Fork. A plain external paste retains the existing exact owned-buffer behaviour and does not invent an authenticated origin.

For a provenance-bearing paste, resolve the exact captured source under current permission and record source evidence separately from the target's independent content identity or insertion context. Do not silently substitute the source's newest working checkpoint. Target autosave has its own sequence, operation and acknowledgement; no generic whole-buffer write spans different owners. General multi-owner/occurrence insertion remains outside the first whole-document adapter until separately specified.

## Save, Commit and replacement links

Automatic saving/checkpointing advances private working state only. Explicit Commit validates the captured working state against the selected content branch's expected head, appends the ordinary immutable same-node revision/closed snapshot/event, advances that content branch and rebases the working buffer atomically. Browser typing after the captured sequence remains pending. The working branch survives as the editing context for subsequent work; promotion does not delete it or its retained checkpoints.

A checkpoint that exactly matches the committed result can gain a **promoted-to** relation. The first implementation should require equality of the complete owned source, document/node and occurrence binding, plus exact byte range for any replacement reference. Equal selected words somewhere in changed text are insufficient. Merely sharing a base, title or branch name is insufficient. If later edits changed the source before Commit, earlier checkpoint references retain their exact historical targets; show that they still refer to working history and offer explicit review rather than guessing a remap.

Where a current navigational/private reference should move to the committed result, create a replacement reference with explicit predecessor and promotion evidence. Retain the old reference and original source as history. Immutable assertion/comment/derivation records are not rewritten: any change to their semantic participants needs a new authorized entity revision under that entity's own rules. Publishing a new source revision does not automatically republish every assertion about it.

Do not scan and rewrite an unbounded set of incoming links in the Commit transaction. The design requires an encrypted bounded reverse-reference query before automatic replacement is enabled. Publish the promotion fact with Commit, then process explicitly scoped replacement batches using frozen operation IDs, current authorization and compare-and-swap on each mutable reference head. Keep incomplete work inspectable and restartable; a failed batch does not invalidate the already committed text. A current view must distinguish an actual replacement from a still-pending candidate. This batch/index mechanism remains a proposal, not an implemented queue or permission to mutate other principals' links.

Example: type `A\r\n😀`, capture `😀`, then paste it elsewhere. The source checkpoint retains the complete exact text and byte range. If Commit publishes exactly that checkpoint, a replacement can point to the exact committed snapshot while retaining the checkpoint/promotion evidence. If the text instead becomes `B\r\n😀`, the first implementation keeps the original checkpoint target despite the repeated emoji. Undo of newer browser typing does not mutate either captured state.

## Compatibility and rollout boundary

Existing Document, Draft, Revision, Snapshot, Source, comment and clipboard payloads keep their current interpretation. New checkpoint source variants require explicit strict record versions/kinds and separate route/capability discrimination. Do not append fields to strict version1 payloads or silently bump SQL, envelope or HTTP contract versions. No kind numbers or byte layouts are adopted by this conceptual design.

The in-progress ADR018 adapter reserves local optional branch metadata kinds20/21 but does not implement working checkpoints. It is not integrated into the frontend or manual runtime and advertises no completed branch capability. Its ordinary save/commit writer is shared with the checkpoint foundation; branch/working editor integration still precedes enabling the feature.

Before durable writes are enabled, specify whether an existing workspace gets working metadata lazily or through an explicit backed-up upgrade, and how an older reader's ordinary writes invalidate any cached working-base claims. A missing checkpoint is an error, never permission to reconstruct it from a newer draft. Old readers must preserve unknown optional ciphertext byte-for-byte, or the upgrade must explicitly require a newer reader with backup. A legacy clipboard cannot be assumed to understand working sources; its entries/index cannot silently become a new shape under the same record version.

Private source/checkpoint text, reverse indexes, promotion evidence and receipts stay authenticated and encrypted. Current permission is checked before reads, capture, replay, replacement and export. Existence/identity never implies disclosure authority. Retention follows the existing immutable-history rule; no automatic pruning or background erasure is introduced. Checkpoint retention and reference replacement do not grant non-trusted plaintext egress, provider access or client-held custody.

## Required checks before delivery

- Exact pending mixed-newline/Unicode selection can be copied with a retained checkpoint without advancing the published head; the target can inspect that exact source after source edits and restart.
- Newer typing, branch switches, undo/redo, stale/delayed/lost acknowledgements and lock never redirect a frozen operation or overwrite another branch's source/selection/undo state.
- Checkpoint/reference/receipt creation is atomic under injected faults; replay is idempotent and changed operation reuse conflicts. Current scope and authority apply before replay.
- Exact Commit creates inspectable promotion and replacement evidence. Changed source, occurrence mismatch, stale reference heads and uncertain replacement batches cannot retarget history. Batch recovery stays bounded and preserves the original reference.
- Named child creation still uses the reviewed committed snapshot, retains document/node identity and leaves parent pending edits untouched. Working branches are not exposed as ordinary named children or Merge participants without an explicit supported workflow.
- Strict future/malformed DTOs fail; encrypted sentinels and actual old-reader preservation/upgrade behaviour pass. No schema/format compatibility claim comes from unit tests alone.
- Visually inspect branch/reference status, retry/review states and source below table/math widgets at supported desktop widths in both themes. Run the real isolated headless workflow and guarded exact-binary manual handoff only after successful integration.

## Implementation state and remaining format work

The first local backend foundation now implements explicit private checkpoints and a bounded latest-checkpoint exact Commit promotion hook; see the [record contract](../../07-implementation/data-structures/sqlite-records.md#working-checkpoint-foundation-kinds2224-local-verification). It is not frontend/clipboard delivery. A separate bounded private working-reference family now supports atomic checkpoint/copy and exact current-list replacement through a separately acknowledged bounded batch after Commit, retaining originals. Working-source Fork storage/transport and gated frontend branch/reference controls are now locally wired; its Provenance panel and complete actual-runtime/reader integration remain unfinished. Broader reverse-reference indexes/batches remain outside the current private-reference scope. Actual reader compatibility and integration remain to verify. The existing committed-passage feature remains delivered within its previous evidence; it is not relabelled as supporting working sources. Same-identity branch Merge remains a later separate design.

## Adoption

Owner explicitly adopted this design on 2026-10-26 after reviewing the concrete checkpoint/Commit/exact replacement scope. Routine implementation and compatible versioned contract work may proceed. Current source comparison for promotion is deliberately conservative: complete owned text and exact document/node/occurrence binding must match. Shared participant mutation, inferred anchor remapping and automatic Commit remain outside the adopted design.
