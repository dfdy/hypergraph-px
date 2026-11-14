# System Architecture

## Common metadata

- **ID:** `HPX-ARCH-001`
- **Title:** System Architecture
- **Purpose:** Single-executable deployment and high-level responsibility boundaries.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-30

## Canonical architecture

Deployment and container structure is defined in [C1 / System context](diagrams/context.c4) and [C2 / HPX containers](diagrams/containers.c4), HPX-CAN-001/002. Responsibility decomposition continues in [C3 / HPX Rust executable](diagrams/executable.c4). These definitions are not repeated here.

## Retained contracts

- [Workspace users, chat and MCP](../06-subsystems/ai-collaboration.md) and the [shared API](../06-subsystems/interfaces/browser-runtime.md) retain detailed identity, permissions and interaction obligations.
- [Security](../06-subsystems/security-cryptography.md), [ADR004](decisions/0004-local-https-bootstrap.md) and [workspace format](../06-subsystems/formats/hpx-workspace.md) retain transport, custody, storage and compatibility rules.
- [Development state](../09-guides/reference/DEVELOPMENT_STATE.md#current-execution-status) records current evidence/limits. [Release qualification](../08-assurance/build-and-release.md) remains a separate contract.

See [ownership and editing rules](SPECIFICATION.md). Other proposed designs remain proposed.

## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 1–4; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 5–12; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
