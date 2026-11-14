# Scope and Non-Goals


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-001-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-001-02` [Workspace-local users — owner clarification](#workspace-local-users--owner-clarification) | [hpx.native.authority.concept_user](../05-domain/diagrams/authority-distinction.c4) · `HPX-CAN-026` · [concept_authority_distinctions](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-001-03` [Shared user API and per-user permissions](#shared-user-api-and-per-user-permissions) | [hpx.native.application.admission](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-001-04` [Normative content](#normative-content) | [hpx](../04-architecture/diagrams/context.c4) · `HPX-CAN-001` · [index](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-001-05` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-PRIN-004`
- **Title:** Scope and Non-Goals
- **Purpose:** Local-first delivery boundaries, mandatory same-workspace collaboration and separately deferred federation.
- **Level:** `01-purpose`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-PRIN-001](<project-purpose.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-30

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../04-architecture/diagrams/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

The human/machine distinction must not create separate hypergraph access authorities. One shared user API and permissions for each workspace-local user are mandatory; single-user development and absence of public API endpoints do not weaken this scope. See the [accepted shared API scope](../06-subsystems/interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


## Normative content


### 1. Scope and architecture

Source `HPX-SRC-0032`, original lines 5–12. Source-linked obligations with scoped retention, transformation or owner qualification; see the clause dispositions for `HPX-SRC-0032-S002`. Original dates and implementation observations remain historical evidence.

Hypergraph PX requires multiple human and AI-agent users in one deployment/workspace as baseline product scope (HPX-OWNER-027; HPX-RQ-032–036). One-human local development is permitted but must not determine architecture. Multiple agents, chat prompts/context/responses as nodes and authorised selected-node MCP editing are required. Federation remains separate future scope. The current local milestone still lacks complete multi-user/agent implementation; that is a delivery gap, not a product non-goal. See [the baseline contract](../06-subsystems/ai-collaboration.md).

Develop the browser editor in the local IDE/workspace independently from Rust domain/data/storage/transport layers. Begin with a separate local frontend development runtime and synthetic mock documents, with browser visual/interaction testing. Review imported visual prototypes against the frontend integration specification before adopting their architecture. Release packaging embeds built HTML/CSS/JavaScript in one Rust executable. No Node/frontend/database server or Lean process is required at runtime. Platform library/static-link requirements must be documented per release target rather than calling every build fully static.

Source and work tracking are maintained at https://github.com/dfdy/hypergraph-px, a public repository. Original application code is AGPL-3.0-only; user content retains its own ownership/license.


## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 5–12; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
