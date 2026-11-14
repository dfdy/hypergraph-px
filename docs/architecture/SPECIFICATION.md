# HPX specification — diagram first

## Common metadata

- **ID:** `HPX-ARCH-013`
- **Title:** Canonical Specification Ownership
- **Purpose:** Route definitions to diagram-owned scopes and retain necessary supplemental contracts.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner
- **Applies to:** HPX specification engineering; bounded ownership only
- **Upstream authority:** HPX-OWNER-032/035; existing owner decisions retain their scope
- **Downstream dependencies:** specification-ownership.csv and linked supplemental contracts
- **Verification:** HPX-TEST-117; ownership, navigation, byte/geometry and documentation checks
- **Decision/history:** HPX-OWNER-032/035; no blanket design/implementation adoption
- **Last reviewed:** 2026-11-03

The LikeC4 model is the canonical location for the 24 bounded scopes in [specification ownership](specification-ownership.csv), under HPX-OWNER-032. Open C1 / System context in VS Code and follow C1 → C2 → C3 → C3 expansions → C4; use [navigation](navigation.md) for view IDs and entry points. Read source element/relationship descriptions, metadata and linked sequences as part of a definition, not just box captions.

Canonical means **where a definition lives**, not that every proposal is accepted or every feature implemented. Existing owner decisions and accepted obligations keep their authority. Green/amber/grey tags describe implementation coverage; planned designs and unresolved choices remain identified. Code mappings and current-workflow sequences are evidence, not a mandate to reproduce the prototype. Unlisted scopes remain under their existing contracts.

## Standing modelling convention

HPX-OWNER-035 requires four complementary forms in the LikeC4 specification:

| Form | Purpose |
| --- | --- |
| Architecture views | Show which software components own and use the concepts. |
| Domain views | Explicitly labelled conceptual diagrams showing identities, relationships, cardinalities and lifecycle distinctions. Domain concepts are not automatically software components. |
| Sequences | Show how operations affect those concepts. |
| Descriptions and linked contracts | State precise invariants that diagrams cannot express clearly; arrows alone do not define an invariant. |

Link conceptual views from their relevant architectural blocks and preserve traceability between concepts, responsible components and operations. Preserve the primary C1→C2→C3→C3-expansion→C4 navigation; a conceptual view is a complementary view type, not a new architectural level. Keep implementation, proposal and unresolved status explicit. Remove prose only when its complete meaning is preserved in the owning model/contract.

Completed prior stages remain intact. HPX-OWNER-039 authorises successive existing responsibility allocations until an actual owner decision is needed; see [staged allocations and all five gap dispositions](audits/dom001-c2-migration.md#successive-responsibility-allocations--hpx-owner-039). Verify each stage and report in the visible chat under OWNER040, or directly to an assigning coordinator when the current task explicitly requires it, then continue routine allocations. Assess conceptual sufficiency before any conceptual addition, C4 or sequence change; do not infer conceptual coverage from component notes.

## Editing workflow

1. Start with the owning view and its inputs/outputs. Reuse the same elements and meanings across views.
2. Update the model first for diagram-owned structure. Keep exact contracts, invariants, byte/coordinate rules, permission semantics, formats, security policies and acceptance criteria in their linked homes until fully represented.
3. Remove matching prose only after checking complete coverage. Record the owning scope/view and retain source/requirement IDs; do not duplicate the deleted definition in a new report.
4. Validate model syntax, navigation, links and affected mappings using the [change-sensitive LikeC4 cadence](../09-guides/reference/development-evidence.md#likec4-validation-cadence). Preserve owner layouts and stable IDs. Record only checks executed; full layout regression is reserved for coherent milestones or global impact.
5. Keep the [living migration inventory](audits/specification-migration-status.md) current with each stage or changed coverage assessment: update affected rows, remaining definitions, canonical links and aggregate counts where applicable. Current summaries must match the contracts and ownership index; appended history alone is insufficient.

The [user/chat/MCP contract](../06-subsystems/ai-collaboration.md), [API contract](../06-subsystems/interfaces/browser-runtime.md), domain/navigation, persistent formats and test/proof records remain required supplements. Detailed payloads stay in the linked OpenAPI contract; diagram coverage is not schema completeness. No public service, new module, permission mechanism or publication is authorised by this ownership migration.

Historical sources and executed evidence are retained for provenance, not normal reading. Start here and consult only the affected supporting contracts. [First migration and measured reduction](audits/diagram-canonicalization.md).


[Document migration status](audits/specification-migration-status.md) classifies every registered document. A scope being canonical does not mean its entire supporting document has migrated.


[Conceptual-sufficiency assessment](audits/dom001-conceptual-sufficiency.md) distinguishes source-backed one-level conceptual restatement from changes requiring additional authority or design adoption. This assessment creates no conceptual view and transfers no further definition ownership.


Latest bounded stage: [O3 retained evidence and interaction effects](Conceptual/evidence-effects.c4), HPX-CAN-024, under OWNER040. Existing-block/one-level scope only; precise contracts and unresolved mechanisms remain. Direct visible-chat reporting supersedes coordinating-chat messages.


[Current conceptual/effect coverage and bounded C4 correspondence](audits/dom001-current-coverage.md) completes the source-sufficient pass. Exact contracts and actual mechanism decisions remain;no whole-system completion or proof is implied.
