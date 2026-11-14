# Build and Release


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-031-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-031-02` [Current adopted design — OWNER059](#current-adopted-design--owner059) | Prose only: Routing summary to the detailed adopted design contracts; their section bindings carry ownership. |
| `HPX-BIND-031-03` [Normative content](#normative-content) | [hpx.native.frontend_assets](../04-architecture/diagrams/executable.c4) · `HPX-CAN-003` · [c3_executable](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-031-04` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
| `HPX-BIND-031-05` [Release qualification](#release-qualification) | [hpx.native.frontend_assets](../04-architecture/diagrams/executable.c4) · `HPX-CAN-003` · [c3_executable](../04-architecture/navigation.md) · consumers: none |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-ASSUR-005`
- **Title:** Build and Release
- **Purpose:** Build/release procedures, SemVer and publication hold.
- **Level:** `08-assurance`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-30

Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.



## Current adopted design — OWNER059

The directly selected D01–D22A briefs now have diagram-owned definitions and precise supplements: [CAN030 / Integration export and delivery design](../06-subsystems/contracts/integrations-and-delivery.md). These govern the listed design questions; earlier open-mechanism statements below retain their historical checkpoint scope where superseded by this explicit decision. Candidate record/profile designs are not active formats or implemented capability. Exact retained source/byte/history and accepted obligations remain; actual code, measured capacity, genuine older-reader, recovery/security/UI acceptance and proofs are separately unperformed. No original source provenance or as-run evidence is rewritten.

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


## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 94–107; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.


## Release qualification

State platform libraries and static-link limits accurately for each release target. A diagram-owned deployment boundary does not establish a fully static build or production acceptance.

Current release-history location: [CHANGELOG.md](releases/CHANGELOG.md). Retained source wording above keeps its historical basename.
