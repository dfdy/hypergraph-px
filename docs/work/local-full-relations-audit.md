# Full relationship audit implementation

2026-10-25. Local implementation authorized by owner. Publication hold remains active; no GitHub changes, commit or version bump.

Scope: implement all candidate rows and additional families in docs/research/RELATIONSHIP_VOCABULARY_AUDIT.md in the synthetic frontend. Preserve existing preview IDs; avoid duplicate aliases and conflating concept/term, causal/temporal, argument/process or annotation/authoritative provenance meanings. Add per-choice definitions, examples and explicit role/context/direction assessments. Make reviewed inverse orientations selectable and normalize their local predicate roles without producing a second record or mutating Markdown. Custom terms remain unregistered. No Rust graph, external inference, ACL, source-history mutation or new Lean claim is authorized by these labels.

Plan: inventory coverage against the audit, expand the catalogue and metadata, integrate orientation-aware local records/details, add semantic integrity/coverage and real browser creation regressions, update specifications/inventory/audit/handoff, rebuild the shared preview. Record actual validation below after execution.


## Implemented outcome

244 choices in 13 categories (115 additions to the 129-choice baseline): counts [30,23,23,21,24,21,23,23,26,6,13,5,6]. All named audit candidates and omitted-role terms are selectable or deliberately aliased; has part is reused once, suffices for aliases is sufficient for, is a subtype of aliases is a, and is an instance of aliases instantiates. Existing IDs and category-specific senses remain intact. Practical requires is not silently equated with logical necessity.

All entries have individual definitions/examples, roles, context guidance and direction assessment. Thirty-four converse pairs and nineteen contextual symmetric choices are registered; custom terms remain unregistered. Reviewed inverse choices store selected wording plus normalized local predicate/orientation. canonicalRelationship(record) resolves reversed roles using the currently mapped anchors without generating mirrored records or editing source. A fail-fast validator checks IDs/labels/metadata, reciprocal converse links and reversed-role consistency. Nonregistered converses cannot become inferred facts.

New relationship-details.js supplies collapsed Roles and context disclosures in the modal and cards. Extra roles (adapted material, stimulus, premises, beneficiary, parties, predictor/outcome) remain visible guidance; a binary annotation is not a complete multi-participant canonical fact. Normative/provenance vocabulary never changes permissions or authenticated history. No new dependencies, Rust behavior or Lean guarantee.

Updated Specifications/RELATIONSHIP_UI.md, frontend README, Unreleased changelog and the research audit. Regenerated the complete inventory with definitions/examples/roles/context/aliases/normalized direction and SHA-256 of actual catalogue source. The audit now distinguishes the original findings from implemented preview behavior and future backend gates.

## Executed validation

- 38 Node tests passed, including complete audit-term/alias coverage, scoped identity/metadata integrity, inverse anchor mapping after Unicode source insertion, and role/temporal/provenance distinctions.
- Static frontend build passed.
- All 47 sequential Chromium scenarios passed (55.8s), including all thirteen dropdowns, inverse creation, temporal/causal semantics, search/custom terms, caret filtering and existing editor workflows.
- After correcting only two inherited example sentences to use their forward wording, reran all 38 Node tests, rebuilt, and both affected catalogue/inverse browser scenarios passed (2.1s).
- Visually inspected artifacts/ui/full-relations-audit.png: selected inverse connector between the two source excerpts, individual definition/example and expanded context disclosure, with the source-neutral arrow at the editor boundary.
- git diff --check passed. No commit, version bump or GitHub mutation. Live synthetic preview remains http://127.0.0.1:5173/; reload shows the new vocabulary.
