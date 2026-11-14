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
- **Last reviewed:** 2026-11-14

The LikeC4 model is the canonical location for the 30 bounded scopes in [specification ownership](../02-governance/registers/specification-ownership.csv), under HPX-OWNER-032. Open C1 / System context in VS Code and follow C1 → C2 → C3 → C3 expansions → C4; use [navigation](navigation.md) for view IDs and entry points. Read source element/relationship descriptions, metadata and linked sequences as part of a definition, not just box captions.

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


## Editing workflow

1. Start with the owning view and its inputs/outputs. Reuse the same elements and meanings across views.
2. Update the model first for diagram-owned structure. Assign exact contracts,invariants,byte/coordinate rules,permission semantics,formats,security policies and acceptance criteria to their explicit linked prose homes where that is the complete intended partition. A completed split specification does not need every precise rule converted into a diagram.
3. Remove matching prose only after checking complete coverage. Record the owning scope/view and retain source/requirement IDs; do not duplicate the deleted definition in a new report.
4. Validate model syntax, navigation, links and affected mappings using the [change-sensitive LikeC4 cadence](../09-guides/reference/development-evidence.md#likec4-validation-cadence). Preserve owner layouts and stable IDs. Record only checks executed; full layout regression is reserved for coherent milestones or global impact.
5. Keep the ownership index, exact contract bindings and current source/requirement evidence consistent with changes.

The [user/chat/MCP contract](../06-subsystems/ai-collaboration.md), [API contract](../06-subsystems/interfaces/browser-runtime.md), domain/navigation, persistent formats and test/proof records remain required supplements. Detailed payloads stay in the linked OpenAPI contract; diagram coverage is not schema completeness. Definition ownership alone authorises no public service, new module or publication. OWNER058/059 separately adopt the selected permission and related design briefs; their precise candidate contracts are in [contracts](../06-subsystems/formats/representation-profile.md), without active format/runtime acceptance.


The domain concepts, operation effects and architecture views complement the exact prose contracts. Adopted design, implementation coverage and actual verification remain separate. OWNER059 selects D01–D22A; candidate records and runtime enablement keep their explicit limits.

## Explicit contract bindings

The [section binding register](../02-governance/registers/contract-bindings.json) is authoritative for node-to-prose routing. It complements the scope ownership index: each H2 section (including its nested subsections) has one existing owning element and a view showing that element, or an explicit prose-only disposition. A section can have consumers; they link to the same precise definition. Ownership here identifies the model home/responsibility, not code ownership or a new runtime mechanism. Existing acceptance, candidate-format and implementation status remains in the contract.

Open an element's details to follow its direct `link` to the exact contract heading. Each contract's opening table links back to the owning model source, identifies the stable fully qualified element ID, canonical scope and view ID, and lists consumers. Use the view ID through [navigation](navigation.md) or LikeC4 search; a source-file link alone is not a diagram deep link. `navigateTo` remains reserved for the existing C1 → C2 → C3 → focused C3 expansion → C4 hierarchy. View-level overview links remain useful but do not satisfy a section's direct owner link.

Coverage is defined by the current binding register: each section of the split specification and its linked precise contracts has one existing owner or an explicit prose-only disposition. Metadata, source identity and evidence plans do not acquire invented software components. Candidate designs and historical source claims retain their stated acceptance, implementation and proof limits. The citation-resource JSON is a resource manifest linked by the export contract, not a prose section.

Maintain section headings/slugs and binding IDs. On a changed section, update the register, the owning element/consumer links and its prose backlink together. Add a stable explicit anchor only when necessary; do not rename headings merely to make a link. `python3 shared/tooling/contract_bindings.py` checks coverage, unique owners, IDs, scopes/views, unambiguous anchors, direct owner/consumer links and exact backlinks. Current specification and documentation checks include it. LikeC4 validation and served-node/view checks separately establish that the model parses and the selected views expose the owners; neither checker proves semantic equivalence or product conformance.

## Numbered documentation project

Diagram sources are distributed by subject: system/container/executable architecture in `04-architecture/diagrams/`; conceptual domain/effect views in `05-domain/diagrams/`; focused subsystem expansions in `06-subsystems/diagrams/`; C4 implementation/workflow views in `07-implementation/diagrams/`; frontend packaging/delivery views in `08-assurance/diagrams/delivery/`. These locations do not change the visual C1→C2→C3→C3-expansion→C4 hierarchy or any stable ID. The shared project configuration is [docs/likec4.config.json](../likec4.config.json).

From the repository root use `npm --prefix docs run validate`, `npm --prefix docs run dev` or `npm --prefix docs run mcp`. `npm --prefix docs run setup` installs the locked tooling into `.provenance/docs-reorganisation/likec4/dependencies/`, never beneath `docs/`. `npm --prefix docs run build` writes the optional site under `.provenance/docs-reorganisation/likec4/generated/`. The wrapper uses polling on macOS to avoid native watcher-handle exhaustion; explicit caller environment settings take precedence. Saved layouts use the configured external directory, without symlinks inside `docs/`. Current local Codex/VS Code configuration uses these entry points.

