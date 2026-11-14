# First local branch creation and editing

## Common metadata

- **ID:** `HPX-ADR-018`
- **Title:** First local branch creation and editing
- **Purpose:** Choose the initial source/draft policy for durable branches before implementing branch-specific editing.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; implementation agent
- **Applies to:** first one-owner local branch increment in roadmap stage5
- **Upstream authority:** [core identities](../../05-domain/core-object-model.md), [retained revision ancestry](../../05-domain/provenance-model.md), [branch roadmap](../../02-governance/roadmap.md), [parent-branch Merge clarification](0015-initial-merge-workflow.md#later-owner-clarification-parent-branch-merge)
- **Downstream dependencies:** future branch record/command/navigation contracts and branch-specific editor buffers
- **Verification:** explicit owner scope choice followed by the executable evidence below
- **Decision/history:** prepared after the accepted first durable comment workflow; does not implement or accelerate the separately planned parent-branch Merge workflow
- **Last reviewed:** 2026-10-26


## Current adopted design — OWNER059

The directly selected D01–D22A briefs now have diagram-owned definitions and precise supplements: [CAN027 / Working state exact editing and graph policy](../../06-subsystems/contracts/editing-and-graph.md). These govern the listed design questions; earlier open-mechanism statements below retain their historical checkpoint scope where superseded by this explicit decision. Candidate record/profile designs are not active formats or implemented capability. Exact retained source/byte/history and accepted obligations remain; actual code, measured capacity, genuine older-reader, recovery/security/UI acceptance and proofs are separately unperformed. No original source provenance or as-run evidence is rewritten.

## Decision context

Branch identity, same-node revision ancestry and independently recoverable drafts are required, but the first branch's treatment of current uncommitted text is unresolved. The current one-owner writer stores one designated branch/draft per document. Silently cloning a draft, committing it or discarding it when creating/switching branches would choose product semantics that are not specified.

## Accepted first scope: branch from an exact committed snapshot

Create an independently identified named child branch of the same document/content node from an explicitly reviewed exact committed snapshot of a selected parent branch. Retain the parent branch ID, creation-time revision/snapshot and publisher/operation in immutable branch-creation metadata. Branch parentage is distinct from revision parents and cross-identity Fork provenance. Parentage is fixed at creation in this first increment; it does not choose a future Merge base automatically.

The new branch initially points to the chosen retained revision/snapshot. Its separate recoverable draft begins with those exact committed bytes. Branch creation does not publish a new text revision or commit any current draft. Leave the parent's acknowledged and newer browser draft bytes intact and make exclusion of uncommitted text explicit before creation. Allow explicit user Commit before branching if they want those edits included. Missing/changed committed-source preconditions conflict rather than silently substituting a newer state.

Support branch listing, creation, selection, independent edit/autosave/commit/restart recovery and exact branch history. Keep one document/node identity with distinct branch IDs, head/draft generations, sequences and editor caches. A commit's parent remains the selected branch's exact same-node base; later commits can diverge without deleting the other branch's states. Switching must drain or retain pending source work safely and preserve each branch's source/selection/undo; uncertain acknowledgements cannot apply to another branch. Startup remains locked and current authority applies to every branch read/write/replay.

Keep existing document-only routes and saved document records explicitly associated with their original designated branch. Add separately scoped branch-capable operations and versioned optional metadata rather than silently redirecting older readers to a different active branch. Before enabling writes, document exact DTOs/record kinds, supported query scopes and reader compatibility. Existing schemas/envelope/protocol versions must not be silently changed. Exact snapshots remain closed text/occurrence bindings; a branch name is not a stable identity or source reference.

Keep the first graph/contributor/annotation views honest about which branch or exact text snapshot they inspect. A branch selector must not relabel a query of the original branch as a selected-child result. Expose supported scope or disable an unavailable view. Existing exact historical reference captures remain pinned and never follow a branch head automatically.

This first scope excludes branch deletion/rename/reparenting, copying uncommitted draft contents to a child, same-identity merge, conflict resolution, shared authority/coediting and federation. The independently implemented reviewed synthesis remains distinct. The planned parent-branch Merge operation still needs its own merge-base/conflict/draft/publication design after functional branch support.

## Alternative

Copy an exact acknowledged draft into the new branch instead. Specify how its base, initial commit status, captured draft sequence, crash recovery and attribution relate before implementation. Do not approximate this by labelling draft bytes as a committed snapshot. The alternative leaves parent state intact but has broader first-publication semantics than the recommended committed-snapshot source.

## Required executable evidence

Create two branches sharing an initial revision, edit/commit each independently, switch with unsaved/newer typing and frozen lost/delayed acknowledgements, lock/restart/recover branch-specific drafts and reconstruct exact older snapshots. Verify same document/node identity, retained ancestry and immutable creation parentage without cross-identity derivation. Test stale expected heads/draft generations, source/target scope, operation reuse, atomic faults, bounded listing/history, malformed records and current permission before replay. Prove older-reader preservation or explicit incompatibility with actual synthetic binaries. Desktop branch controls and source below table/math widgets require both-theme visual/selection/undo checks. Ordinary executable checks do not establish new Lean/Rust correspondence or real-document acceptance.

## Current state

The owner explicitly answered “Start from committed snapshots” on 2026-10-26. The committed-source scope above is accepted; this records policy adoption, not implementation or acceptance-test completion. The first creation command reviews and pins the selected parent’s current committed revision/snapshot; a changed parent head conflicts. Historical-snapshot creation is not exposed in this first command.

## Working-branch design requested before integration

The owner subsequently proposed pending edits as a special branch, automatically saved when copy/paste needs retained source, with new links replacing draft links after saving. The owner explicitly selected designing this now. [ADR019](0019-working-branches-and-reference-checkpoints.md) distinguishes the private working branch/checkpoint from this named content branch and retains explicit Commit and immutable history. The in-progress branch storage adapter is not integrated delivery; reconcile working-source formats and editor state before enabling branch UI. ADR018's accepted committed-source creation policy remains intact.

## Later bounded delivery evidence, 2026-10-27

HPX-TEST-040 supersedes the historical in-progress implementation status above for the scoped named/working-branch lifecycle. HPX-TEST-046 adds read-only comparison of a named child's current committed version with its fixed parent's current committed version. One authorized SQLite view pins both exact snapshots; both drafts remain excluded. This is stage5 comparison evidence, not parent-branch Merge, witness adoption or real-data acceptance. Accepted committed-source child creation and immutable history semantics remain unchanged.

## Navigation publication policy refinement, 2026-10-27

HPX-OWNER-010 supersedes explicit-user-action-only Commit at logical node/branch departure. Child creation still starts from the reviewed committed snapshot and does not itself publish parent draft text. Selecting the new child then leaves the parent and automatically commits its changed outgoing text, without changing the child's pinned creation source. Ordinary formatting/menu/comparison focus changes do not Commit. Existing branch identity, exact snapshot, independent Undo and frozen-operation rules remain unchanged.

## Current composition/retention refinement — OWNER049/050, 2026-11-01

The original accepted policy and dated implementation evidence above retain their interpretations. [OWNER049/050](../../02-governance/OWNER_DECISIONS.md#last-autosaved-composition-and-historical-version-accumulation--2026-11-01) now requires last-acknowledged-autosave restoration of exact general composition selections and no historical-version accumulation merely from routine autosaves; universal future autosave/Commit separation is reopened, not newly reaffirmed. Existing private working-state visibility, immutable history and OWNER010 departure Commit are not silently revoked. Branch reconciliation separates the requested arbitrary constructed-composition save-as capability from this existing committed-parent child creation/working-source subset. Main construction, capture/publication and general nested-selection recovery mechanisms remain unadopted; no implementation or format change follows.
