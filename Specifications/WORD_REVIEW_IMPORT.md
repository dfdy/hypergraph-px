# Word review import — future functionality

## Scope and status

Import tracked changes and comments from a Word document and reconcile them with a specifically selected Hypergraph branch or immutable snapshot. This is a future requirement, not an implemented importer, endpoint or supported file-format contract. Initial format support should be specified before implementation; `.docx` is the intended starting point.

## Target and matching

The user selects the workspace/document and branch or exact snapshot to which the review relates. Record the selected base identity and, for a branch, its exact revision at planning time. Where available, use a compilation/export manifest binding Word content to source revisions, placement occurrences and ranges. Never infer the destination branch from a file name alone.

Match changes and comment anchors against that base, preserving source ownership and repeated/nested occurrence context. Separate exact, ambiguous, unmatched and unsupported results; show a preview and require resolution rather than guessing from similar text. If the branch has advanced, reconcile base, current branch state and imported review explicitly; report overlaps/conflicts and recheck the head before applying. Repeated text, Unicode, tables, headings and equations must not silently attach a comment or revision to the wrong range. Unsupported Word structure or formatting is reported without silently flattening or discarding review information.

Snapshots remain immutable. An import matched to a snapshot produces a review/proposal against it and applies accepted changes only to a writable draft/branch derived from or explicitly reconciled with that snapshot. Reading or importing a review never rewrites the recorded snapshot.

## Attribution and comments

Attribute imported changes and comments to a dedicated virtual **Word Revision** contributor. Give that identity a stable internal identifier in its workspace and a distinct display colour under the existing contributor palette. It is an external-review identity, not a logged-in human, current agent or account with mutation authority. The Users tab includes it when actual imported contribution records establish a contribution to the current document, under the same history/permission scope as other contributors.

Keep original Word author labels, revision/comment identifiers, timestamps and thread relationships as external metadata when available and permitted. These labels are unverified input, not proof of a Hypergraph user's identity; they do not replace the requested Word Revision attribution. Record the actual importing and approving human separately. Preserve original attribution on unchanged Hypergraph content; accepted insertions/edits and imported comments carry Word Revision contribution provenance without relabelling the whole document.

Map imported comments into anchored document comments, retaining replies/resolution information where supported. An anchor on deleted or changed text may remain attached to its historical base or be reported unresolved; do not silently move it. Reviewing or rejecting an imported proposal must remain distinguishable from accepting a content change.

## Application and architectural boundary

Use an isolated Word parsing/conversion adapter to create a deterministic import plan, with source-file digest, chosen base/target, mappings, changes, comments and diagnostics. Core application commands validate authorization, exact source ranges, provenance and target state before publication; UI actions do not bypass these checks. Keep import history and retry identities so retrying the same applied plan cannot duplicate changes or comments, while a deliberate new review remains distinguishable. Specify atomic application/recovery behavior before enabling durable import.

Treat the file as untrusted input: bound archive expansion, document size and parser work; do not execute macros or retrieve external relationships/resources. Store any retained originals, extracted text, anchors and diagnostic artifacts under workspace confidentiality rules. This inbound feature does not authorize exporting documents or contacting Word/cloud services. Future client-held/non-trusted mode remains subject to the [core egress restrictions](DATA/ENCRYPTION.md), including disabled document export.

## Acceptance requirements before enabling

- Import tracked insertions/deletions and anchored comments/replies against an exact base; preview accepted/rejected/unresolved outcomes and preserve exact unaffected source.
- Reconcile a diverged branch with explicit conflicts; preserve an immutable snapshot and apply only through a writable destination.
- Reject ambiguous matches, including repeated placements, and report unsupported formatting/objects without hidden loss.
- Attribute imported contributions to Word Revision; retain external labels as unverified metadata and the importing/approving human as a separate actor.
- Cover deleted-text comments, Unicode, lists/tables/equations, replay/deduplication, stale heads, permissions, locked workspaces, malformed/oversized archives and recovery from interrupted application.

No parser, storage schema, new dependency or formal proof result is selected by this requirement.
