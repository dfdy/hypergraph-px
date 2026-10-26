# First durable document comments

## Common metadata

- **ID:** `HPX-ADR-017`
- **Title:** First durable document comments
- **Purpose:** Choose the first durable comment anchor and historical scope before connecting the Comments tab.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; implementation agent
- **Applies to:** proposed first one-owner trusted-server comment increment
- **Upstream authority:** [frontend interaction](../../06-subsystems/frontend-interaction.md), [system requirements](../../03-requirements/system-requirements.md), [retained history](0011-retained-history.md), [semantic overlay precedent](0010-semantic-annotation-snapshots.md)
- **Downstream dependencies:** future comment commands, explicit record formats, historical queries and Comments UI
- **Verification:** owner scope choice followed by the executable checks below; no implementation or acceptance claimed
- **Decision/history:** prepared after publication of 1.0.0 under renewed autonomous implementation; the owner explicitly adopted committed-passage comments first on 2026-10-26
- **Last reviewed:** 2026-10-26

## Decision needed

The product requires user-authored document annotations separate from agent conversation. The current Comments tab is unavailable in the durable runtime; preview comments are disposable local simulations. Existing committed-range validation is implemented, but durable draft anchors, automatic relocation and comment inclusion in historical snapshots are unspecified. The accepted semantic assertion overlay policy provides a precedent, not automatic acceptance of a new comment mechanism.

## Accepted first scope

Publish an immutable human-authored comment against one exact committed document passage, using the protected capture's document/node/revision/snapshot/full occurrence path and half-open UTF-8 byte range. Require explicit review of the passage and comment before publication. Permit a historical committed passage; reject uncommitted or stale editor-source bindings rather than saving, committing or relocating them automatically. Retain exact comment source and Unicode/newline bytes, separately recording the authenticated publisher without inferring original passage authorship.

Keep existing text snapshots unchanged. Comments form separately versioned, explicitly retrospective annotations; they must never appear as if present when the underlying text snapshot was published. After editing the document, a retained comment remains available with exact historical passage inspection and clear earlier-source context. Do not guess a matching current passage. A comment is an identifiable ordinary annotation entity, not a new graph primitive or a same-node text ancestor.

The first increment has immutable single comments and bounded authorized paging, with exact operation replay and locked/restart recovery. Replies, comment edits, resolve/reopen workflows, deletion/redaction, draft comments, shared users, provider calls, inline relocation/highlighting and contributor-index expansion remain future separately specified increments. Absence of those operations is explicit; no buttons imply them. Retain all accepted comment history and do not impose a revision-count retention cap. Normal request quotas reject atomically rather than prune existing comments.

Persistent records retain strict version/kind wrappers outside the pure domain; exact adapter fields, optional kind allocation, indexes and request budgets must be specified with implementation evidence before enabling the feature. Existing schema/envelope/protocol versions and text payloads must not be silently changed. Reads and retries recheck current authenticated scope. Historical references never grant access.

## Alternatives

Prioritize draft-attached comments: first specify stable draft identity/sequence, crash recovery, publication promotion and stale/ambiguous relocation. That is a broader first feature and cannot be approximated with committed IDs. Alternatively defer durable comments and continue other specification-bound work. Neither alternative is selected by elapsed time or this proposal's recommendation.

## Required executable evidence

Test exact Unicode/mixed-newline and repeated-source anchors; explicit uncommitted/stale rejection; atomic rollback and identical retry after lost acknowledgements; current permission, lock and restart recovery; immutable historical text/comment reconstruction after later document edits; pagination and resource bounds without silent truncation; and earlier-reader preservation or honest format rejection. Browser checks cover source/selection/undo preservation, inert hostile comment text, cancellation, late responses, desktop themes/widths and source below table/math widgets. Separate ordinary test evidence from Lean models and extracted-Rust correspondence. No real-document or whole-application proof claim follows.

## Current state

The owner explicitly selected "Adopt committed-passage comments first" on 2026-10-26. The recommended first scope is accepted; routine planner/adapter/UI implementation may proceed within it. Wider comment lifecycle, draft anchoring and production format acceptance remain excluded. Adoption alone is not implementation evidence.
