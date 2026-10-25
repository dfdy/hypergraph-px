# Creating and splitting specifications

1. Choose the level from `docs/README.md` based on the claim's meaning, not its originating file.
2. Use a subject-specific template (or `specification.md` if no specialized form exists).
3. Assign the next unused ID within the appropriate namespace; examples: `HPX-PRIN-004`, `HPX-REQ-017`, `HPX-ADR-002`, `HPX-DOM-008`, `HPX-IF-003`, `HPX-ALG-011`, `HPX-TEST-005`. Never derive ID from current sort order.
4. Create a sibling document for independently versioned/owned/testable concepts. Use a directory and index for subject clusters. Reference canonical definitions across files.
5. Fill common metadata and provenance, mark `proposed`, add inventory and traceability rows, obtain human review.
6. Never promote absent or conflicting source content into an accepted requirement.

## Level-to-template mapping

- 01: `principle.md` or `specification.md`.
- 02: `specification.md` or `proposal.md`.
- 03: `requirement.md` (one obligation), plus consolidated `specification.md` indexes.
- 04: `adr.md` or `specification.md`.
- 05: `domain-model.md` and `formal-property.md`.
- 06: `subsystem.md`, `interface.md`, or `format.md`.
- 07: `algorithm.md`, `data-structure.md`, `formal-property.md`.
- 08: `test-plan.md`, `specification.md`.
- 09: `guide.md` and generated reference.
