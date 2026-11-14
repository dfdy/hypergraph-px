# First durable semantic assertions and snapshot scope

## Common metadata

- **ID:** `HPX-ADR-010`
- **Title:** First durable semantic assertions and snapshot scope
- **Purpose:** Resolve what a historical document snapshot includes before connecting durable semantic relationships.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; implementation agent
- **Applies to:** first one-owner trusted-server semantic relationship increment; future production format acceptance remains separate
- **Upstream authority:** [assertion model](../../05-domain/assertions-and-predicates.md), [graph-engine snapshot rule](../../06-subsystems/graph-engine.md), [immutable history](0011-retained-history.md)
- **Downstream dependencies:** [snapshot/document semantics](../../05-domain/document-semantics.md), [record formats](../../07-implementation/data-structures/sqlite-records.md), future assertion commands and graph projection
- **Verification:** explicit owner decision; required executable checks below; current evidence in [test register](../../registers/tests.csv)
- **Decision/history:** materializes the reserved HPX-ADR-010 topic. The owner adopted a read-only selected-node graph requirement; that adoption does not choose semantic snapshot inclusion. The owner explicitly chose “Adopt separate versioned overlays” on 2026-10-25.
- **Last reviewed:** 2026-10-25

## The unresolved choice

The existing graph-engine contract requires snapshots to bind exact in-scope semantic/reference state, or an explicit empty/excluded scope; later annotations must remain labelled retrospective overlays. It says to decide inclusion defaults before production snapshot formats are frozen. Current stored snapshots pin the initial whole-document text projection and have no semantic-assertion field. Rewriting them to add relationships would violate retained history. Showing today's assertions as if they belonged to yesterday's snapshot would misstate historical evidence.

## Accepted first policy: text snapshots plus separate versioned overlays

Keep all existing text snapshots and their bytes/meaning unchanged. First durable semantic relationships are separately versioned annotations bound to exact committed participant revisions, occurrence paths and ranges. A historical text view explicitly says that its text snapshot excludes semantic assertions. If the user chooses to view later annotations, show them as a separately selected retrospective overlay with its own exact view/revision context; do not insert them into the text snapshot or represent them as claims present at its publication.

An assertion is an ordinary identifiable revisioned entity with role-labelled participant references, predicate identity/definition version, declared qualifiers, recorded proposer and explicit review state. Preserve n-ary incidence, competing claims and prior rejected/superseded revisions. Browsing categories and aliases do not create new predicate identities. The first scope can use committed text participants and one owner; general assertion-to-assertion references, shared authority and semantic closure inside compound snapshots stay separately gated. Creation alone does not verify a logical claim or establish original authorship. Lean conversion remains explicitly deferred.

New assertion record codecs must have explicit kinds/versions and bounded exact reads. No new implementation may overload an existing text payload, silently upgrade an old record, physically erase rejected assertions or treat a view token as an access grant. Exact optional record layouts and ordinary planner/transaction/query choices can proceed under this policy after adoption; production format acceptance remains a later evidence gate.

## Alternative: include semantic closure before connecting the feature

Require a new closed snapshot representation that pins all selected semantic definition/assertion revisions alongside text before durable relationship UI is enabled. This gives one historical package for both, but requires choosing closure/disclosure bounds and a backed-up explicit compatibility/migration path now. Existing snapshots still remain unchanged; old readers cannot be assumed to understand the new semantic snapshot shape.

Neither choice changes encryption custody, grants cross-workspace access, authorizes publication, adopts logical inference, or resumes Lean conversion. The owner should choose the historical meaning and product scope; routine implementation details follow from that decision.

## Required verification

Exact historical text and annotation reconstruction after later edits/review and restart; no rewriting of old snapshots; explicit overlay context and stale-view rejection; n-ary role/identity preservation; exact Unicode/repeated-source binding; current permission checks before reads/replay; atomic command/receipt/review publication; unknown acknowledgement recovery; retention of rejected and competing claims; earlier-reader preservation or explicit rejection for each new format. Browser labels must distinguish asserted/accepted claims from actually checked proof evidence. No whole-application proof follows from ordinary tests.

## Current state

The owner adopted the separate-overlay policy on 2026-10-25. Routine bounded assertion/planner/codec/query work may proceed within that choice. Adoption does not itself implement an endpoint, freeze a production format, authorize publication or resume Lean conversion.
