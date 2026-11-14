# Scope and Non-Goals

## Common metadata

- **ID:** `HPX-PRIN-004`
- **Title:** Scope and Non-Goals
- **Purpose:** Local-first delivery boundaries and explicitly deferred collaboration.
- **Level:** `01-purpose`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-PRIN-001](<project-purpose.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25



Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Local-first delivery boundaries and explicitly deferred collaboration. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Local-first delivery boundaries and explicitly deferred collaboration. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content



### 1. Scope and architecture

Source `HPX-SRC-0032`, original lines 5–12. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Hypergraph PX Multi-User Federated initially operates locally with one human. Explicit user, device, group and policy identities prepare for future multi-user and federated operation. Future collaboration must accommodate both live coediting and explicit branch/merge workflows. Internet federation and multi-user deployment are not enabled by the local milestone.

Develop the browser editor in the local IDE/workspace independently from Rust domain/data/storage/transport layers. Begin with a separate local frontend development runtime and synthetic mock documents, with browser visual/interaction testing. Review imported visual prototypes against the frontend integration specification before adopting their architecture. Release packaging embeds built HTML/CSS/JavaScript in one Rust executable. No Node/frontend/database server or Lean process is required at runtime. Platform library/static-link requirements must be documented per release target rather than calling every build fully static.

Source and work tracking are maintained at https://github.com/dfdy/hypergraph-px, a public repository. Original application code is AGPL-3.0-only; user content retains its own ownership/license.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Local-first delivery boundaries and explicitly deferred collaboration. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 5–12; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
