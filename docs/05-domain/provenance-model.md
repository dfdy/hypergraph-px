# Provenance and Event Semantics

## Common metadata

- **ID:** `HPX-DOM-004`
- **Title:** Provenance and Event Semantics
- **Purpose:** Authorship, influence, derivation, events and immutable historical provenance.
- **Level:** `05-domain`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Formal meanings do not imply every type or operation is implemented. See implementation discrepancies and requirement evidence separately.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Vocabulary and mathematical notation

Authorship, influence, derivation, events and immutable historical provenance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Entities and identities



### Revision and transformation histories

Source `HPX-SRC-0025`, original lines 28–33. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

For one logical identity, revision ancestry is a DAG. Every revision parent belongs to that identity and names an exact retained immutable revision. Divergent revisions remain retained; merges append a revision with explicit parents. Restore appends a new state rather than rewriting history. Wall-clock timestamps do not establish ancestry.

Fork/extraction creates a new content identity with explicit provenance from exact source revisions/ranges. A source from another identity is not a same-identity revision parent. Represent a multi-input/multi-output transformation as an event with ordered input and output revision references, operation parameters, actor/device attribution, exact source ranges and contribution mappings. This incidence representation preserves the distinction between lineage and same-identity ancestry. Preserve source bytes/ranges unless an explicit reviewed operation changes them.

### 8.2 Authorship and context lookup

Source `HPX-SRC-0028`, original lines 188–199. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Provide an **Authors** display toggle, initially off. Attribution comes from authorized spans bound to the exact projection/source map, occurrence context and immutable revision or tentative draft sequence. A lazy `getAuthorship` adapter may use candidate `GET /documents/{document}/authorship` with that exact context and pagination/bounds. This is not an unscoped mutable author lookup or an implemented endpoint.

The contract must name the attribution role shown: recorded original contributor, last editor, importer, agent proposer, human approver and content owner are different facts. Return known, mixed, unknown or undisclosed attribution plus only permitted evidence. Presence or ownership cannot determine the author. **Importing, copying, forking or including text does not automatically make the current human its original author.** Imported material without evidence remains unknown in the relevant authorship role; the importer may be recorded separately. Newly typed bytes can carry tentative current-human draft attribution until validated publication. Do not invent coauthors or verified provenance for a visual demonstration.

Default visual convention: the authenticated current human uses red (hue 0); the current agent uses blue; other known authors use distinct session-stable hues outside reserved red and blue ranges. The palette is display state, not a principal ID, evidence or globally stable identity. Use the distinct contributor palette in §8.1, labels/role indicators and accessible contrast as well as colour; colour differences alone do not provide accessible identity. Do not persist author identities/hue maps in the display cookie. Imported unknown text must not receive current-user red merely because the document was opened by that user.

Context-menu lookup uses the **clicked source position**, not the existing selection's anchor/head. A right-click inside the selection preserves it while showing attribution for the clicked position. Keyboard invocation uses the caret context. Show an attribution header even when colouring is off or other actions are unavailable; use a safe unknown/undisclosed or mixed result where appropriate. Table cells and maths widgets map their actual clicked content back to exact source spans; repeated visible text is never a unique anchor.

Reconcile attribution through typing, delete, undo/redo, structural results and delayed acknowledgements at the same originating sequence as source mappings. Do not relabel a tentative attribution map as verified, assign all replacement text to the current user or reuse an out-of-date attribution response after editing. Attribution lookup/toggle and presence display publish no history.


## Relationships and permitted states

Authorship, influence, derivation, events and immutable historical provenance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Operations and transitions

Authorship, influence, derivation, events and immutable historical provenance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Invariants

Authorship, influence, derivation, events and immutable historical provenance. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Unresolved semantics

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Verification/proofs

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 28–33; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 188–199; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.

## Owner-directed Merge and Copy action distinction, 2026-10-25

The [five-action document contract](../06-subsystems/document-engine.md#owner-directed-action-set-fork-link-embed-merge-and-copy) includes Merge and Copy by explicit owner request. A same-identity merge appends a revision with exact same-identity parents; combining distinct logical identities records their exact inputs as transformation provenance. Both retain prior histories. Clipboard capture alone is not a derivation or a committed revision; an eventual copy/paste publication records the actual inputs/outputs and does not relabel the copier as original author. Exact output-identity/conflict mechanics and durable command support remain explicit implementation gates.

## Current independent Fork projection

The initial durable Fork records an exact committed input range and the new identity's initial output revision/snapshot in one immutable transformation record. The new node's first revision has no same-node parent. Subsequent edits change its revision history while the derivation stays pinned. The read-only document/Fork graph displays those historical incidences against separately labelled current committed node contexts; it does not claim that the current source/output texts remain equal, that ownership establishes original authorship, or that a recorded derivation is a logical proof. General semantic assertions and their snapshot inclusion policy remain under [accepted HPX-ADR-010](../04-architecture/decisions/0010-semantic-annotation-snapshots.md), with separately versioned retrospective overlays adopted by the owner; durable implementation follows.

## Working-source and promotion proposal, 2026-10-26

[ADR019](../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) designs exact private working checkpoints for provenance-bearing copy/paste at the owner's request. References retain their captured source; a later exact Commit may publish promotion and replacement evidence without mutating original links or inferring an anchor relocation. Semantic assertion/comment/derivation participant changes require new authorized entity revisions. No draft-reference or replacement mechanism is delivered.
