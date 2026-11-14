# Development/source provenance navigation

## Common metadata

- **ID:** `HPX-GUIDE-006`
- **Title:** Development/source provenance navigation
- **Purpose:** Source provenance, work history, proof inventory and current paused state.
- **Level:** `09-guides`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-GOV-004](<../../02-governance/roadmap.md>); [HPX-ASSUR-001](<../../08-assurance/testing-strategy.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25



Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Audience and prerequisites

Source provenance, work history, proof inventory and current paused state. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Task and expected result

Source provenance, work history, proof inventory and current paused state. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Procedure

Published version0.7.0: commit2ebe35b8c966ab83530174fcebc8f245238625cb. The working tree includes unfinished encrypted storage/runtime integration from before migration; do not discard it or call it delivered. Application development is paused, publication held. Current documentation migration [owner decisions](../../02-governance/OWNER_DECISIONS.md) and [historical verification](../../08-assurance/migration-verification.md) are maintained in docs; the [relocation record](../../08-assurance/documentation-records-move.md) describes current checks. Dated earlier work records, source studies, proof digest and review reports are retained byte-for-byte under ignored .oldspecs with SHA256/source IDs in registers. Public readers must not be promised access to local/private originals; hashes preserve identity, not access rights.

### 9. Implementation evidence and resumable progress

Source `HPX-SRC-0032`, original lines 108–112. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Maintain [docs/DEVELOPMENT_STATE.md](<development-evidence.md>) as the context-compaction handoff, with confirmed decisions or authoritative links, published milestone/CI evidence, active issue and uncommitted work, actual boundaries, unresolved findings and exact next steps. Update it before significant transitions or compaction; never record credentials. Bounded issue work records retain chronological implementation/verification findings; ADRs record design reasons; the data reference and Lean digest record actual APIs and assurance. A context reset must not silently convert proposed features or unobserved checks into completed work.

### 10. Work order for the frontend agent

Source `HPX-SRC-0028`, original lines 284–289. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Start with stage A and keep the visual implementation behind the adapter in §3. Use synthetic fixtures with repeated/nested content, document-local prose, inserted text, Unicode, a small table and mapped formula source. Include pinned human/agent, other/offline contributors, a logged-in noncontributor, missing-agent and unknown/mixed authorship fixtures without inventing authenticated peers or crediting imported text to the current user. Implement controllable delayed acknowledgements, conflicts, locked/unavailable states and uncertain commit outcomes so the UI can exercise §§4–6 without real storage. Show fixture status and keep advanced live capabilities unavailable.

Deliver the interface, adapter/fixture modules, setup instructions, dependencies/licenses and the actual browser/adapter checks executed against §9. Document unanswered transport/schema questions for the Rust developer. Do not implement graph authority, invent a database/encryption format, connect a real provider, or claim real durability to make a visual control appear finished. Move to stage B only after its backend contract and acceptance gate exist.


## Examples

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Troubleshooting and limitations

Retain the scoped limits above and [open questions/conflicts](<../../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Related references

Source provenance, work history, proof inventory and current paused state. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 108–112; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 284–289; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
