# Scope and Non-Goals

## Common metadata

- **ID:** `HPX-PRIN-004`
- **Title:** Scope and Non-Goals
- **Purpose:** Local-first delivery boundaries, mandatory same-workspace collaboration and separately deferred federation.
- **Level:** `01-purpose`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-PRIN-001](<project-purpose.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-30

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../architecture/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

The human/machine distinction must not create separate hypergraph access authorities. One shared user API and permissions for each workspace-local user are mandatory; single-user development and absence of public API endpoints do not weaken this scope. See the [accepted shared API scope](../06-subsystems/interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


## Normative content


### 1. Scope and architecture

Source `HPX-SRC-0032`, original lines 5–12. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Hypergraph PX requires multiple human and AI-agent users in one deployment/workspace as baseline product scope (HPX-OWNER-027; HPX-RQ-032–036). One-human local development is permitted but must not determine architecture. Multiple agents, chat prompts/context/responses as nodes and authorised selected-node MCP editing are required. Federation remains separate future scope. The current local milestone still lacks complete multi-user/agent implementation; that is a delivery gap, not a product non-goal. See [the baseline contract](../06-subsystems/ai-collaboration.md).

Develop the browser editor in the local IDE/workspace independently from Rust domain/data/storage/transport layers. Begin with a separate local frontend development runtime and synthetic mock documents, with browser visual/interaction testing. Review imported visual prototypes against the frontend integration specification before adopting their architecture. Release packaging embeds built HTML/CSS/JavaScript in one Rust executable. No Node/frontend/database server or Lean process is required at runtime. Platform library/static-link requirements must be documented per release target rather than calling every build fully static.

Source and work tracking are maintained at https://github.com/dfdy/hypergraph-px, a public repository. Original application code is AGPL-3.0-only; user content retains its own ownership/license.


## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 5–12; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
