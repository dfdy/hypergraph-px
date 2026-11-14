# Build and Release

## Common metadata

- **ID:** `HPX-ASSUR-005`
- **Title:** Build and Release
- **Purpose:** Build/release procedures, SemVer and publication hold.
- **Level:** `08-assurance`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Build/release procedures, SemVer and publication hold. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Build/release procedures, SemVer and publication hold. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

The current full-workspace build includes an embedded runtime and therefore needs prepared frontend assets. Earlier library-only installation prose is historical. See [developer setup](../09-guides/developers/getting-started.md) for the distinct fixture and full-build paths. Source-derived commands are documentation, not proof that the newest working tree has passed every check. Publication remains held; migration approval is not commit/push authorization.

### 8. Semantic versioning and milestone publication

Source `HPX-SRC-0032`, original lines 94–107. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Use [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). Before each milestone push introducing new commits, increase the project version, synchronize Rust package/lockfile and Lean package metadata plus current documentation, and record the change in CHANGELOG.md. A retry of the identical versioned commit does not need another bump. Do not rewrite already published version contents or bump unrelated schema/protocol/toolchain versions.

The owner requires the following MAJOR.MINOR.PATCH classification for future increments:

1. MAJOR for incompatible API changes.
2. MINOR for functionality added in a backward-compatible manner.
3. PATCH for backward-compatible bug fixes.

Pre-release labels and build metadata may extend this format. Reset subordinate components when incrementing MAJOR or MINOR. Select the largest applicable change class in a milestone and document compatibility impact. Do not classify an incompatible API change as MINOR merely because the current version starts with 0; this supersedes the earlier project-specific initial-development convention.

The public contract comprises exported Rust APIs and documented behavior, and subsequently the supported CLI/HTTP/MCP interfaces and durable/import formats as each is implemented. Documentation/build/proof-only maintenance introduces no new feature or API break by itself; if published independently under the milestone increment policy, use PATCH and identify its maintenance-only scope. A version bump alone does not establish feature completeness or formal verification; readiness and assurance must be documented separately.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Build/release procedures, SemVer and publication hold. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 94–107; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
