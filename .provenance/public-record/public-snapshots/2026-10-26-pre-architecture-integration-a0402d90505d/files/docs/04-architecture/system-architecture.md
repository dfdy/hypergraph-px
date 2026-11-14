# System Architecture

## Common metadata

- **ID:** `HPX-ARCH-001`
- **Title:** System Architecture
- **Purpose:** Single-executable deployment and high-level responsibility boundaries.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Rustls runtime and encrypted SQLite exist locally; trusted-browser startup/parity and adapter reliability remain unverified.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Single-executable deployment and high-level responsibility boundaries. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Single-executable deployment and high-level responsibility boundaries. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content



### Software architecture

Source `HPX-SRC-0021`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: current architecture, 2026-10-24. Requirements are defined by [SPECIFICATION.md](<../03-requirements/system-requirements.md>). Implemented components are identified below; planned directories are responsibility boundaries, not existing services.

### Deployment and development

Source `HPX-SRC-0021`, original lines 5–12. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The initial application runs locally for one human. Model users, devices, groups, policy authority and causal operations so later live collaboration, explicit branches and federated instances do not depend on process-local identities or wall-clock ordering. Remote operation remains unavailable until its acceptance gates pass.

Develop the browser frontend independently from Rust data and application processes. Development may use a frontend development server with a defined API/proxy contract. Production builds embed the compiled HTML/CSS/JavaScript in one Rust executable that owns startup, storage, application services, transport and asset delivery. Node, Lean and a separate database/frontend server are not runtime requirements. Describe platform libraries accurately for each release target.

Medium-term integration gate: the browser/runtime boundary uses authenticated encrypted transport, including loopback. The Rust executable owns secure asset/API delivery; certificate trust/bootstrap and development parity require an ADR before implementation. See [transport security](<../06-subsystems/security-cryptography.md>). This is independent of content-key custody and remains unimplemented.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Single-executable deployment and high-level responsibility boundaries. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 1–4; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 5–12; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
