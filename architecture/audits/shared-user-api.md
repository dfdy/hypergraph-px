# Shared user API and per-user permissions

HPX-OWNER-029 adopts HPX-RQ-037–038: one logical backend command/query API for human and machine users, with granular per-user resource/operation permissions. Browser HTTPS and AI MCP are adapters to this interface, not separate permission systems. The API need not be public, a new service, one endpoint, or an internal HTTP hop. OWNER028 remains scoped to removing the separate general external API product.

## Specification coverage

| Area | Reconciliation |
| --- | --- |
| [Browser/runtime contract and capability gates](../../docs/06-subsystems/interfaces/browser-runtime.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Scope and Non-Goals](../../docs/01-purpose/scope-and-non-goals.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [System Requirements](../../docs/03-requirements/system-requirements.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Acceptance and Conformance](../../docs/03-requirements/acceptance-criteria.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [System Architecture](../../docs/04-architecture/system-architecture.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Component and Module Architecture](../../docs/04-architecture/component-architecture.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Core Object Model](../../docs/05-domain/core-object-model.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Document, Branch and Revision Semantics](../../docs/05-domain/document-semantics.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Provenance and Event Semantics](../../docs/05-domain/provenance-model.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Multi-user and AI Collaboration](../../docs/06-subsystems/ai-collaboration.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Frontend Interaction](../../docs/06-subsystems/frontend-interaction.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Document Engine](../../docs/06-subsystems/document-engine.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Graph Engine](../../docs/06-subsystems/graph-engine.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Security and Cryptography](../../docs/06-subsystems/security-cryptography.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Workspace Storage](../../docs/06-subsystems/workspace-storage.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Future document export and compilation](../../docs/06-subsystems/import-export.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [External Integrations](../../docs/06-subsystems/external-integrations.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Domain/navigation contract](../../docs/06-subsystems/interfaces/domain-navigation.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Draft acknowledgement and atomic commit protocol](../../docs/07-implementation/protocols/draft-publication.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Encrypted SQLite records and slot schema](../../docs/07-implementation/data-structures/sqlite-records.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Security Threat Model](../../docs/08-assurance/security-threat-model.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Verification and Testing Strategy](../../docs/08-assurance/testing-strategy.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Privacy and Research Data Protection](../../docs/08-assurance/privacy-and-data-protection.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Migration, Backup and Recovery](../../docs/08-assurance/recovery.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Roadmap and Milestones](../../docs/02-governance/roadmap.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |
| [Hypergraph PX documentation](../../docs/README.md) | Shared user API and actor-specific resource/operation policy; local boundary and implementation limits retained. |

## Boundary and input/output consistency

Browser/MCP inputs retain authenticated actor, workspace/selected target, operation and exact expected state/operation ID where relevant. Shared application operations return authorised read data or attributed drafts/Commit results/receipts; denial/conflict/failure/uncertainty remain explicit. Chat/context nodes, graph/history inspection and recovery cannot use a second authority path. UI preferences/local buffers and pre-session static assets are outside protected hypergraph operations. Authentication, workspace unlock and resource permission are separate. Pure domain planning grants no rights; SQLite publication remains below application policy.

C2 labels now identify shared API access via HTTPS/MCP. Existing Rust-engine and Runtime/API elements describe the same required boundary and current gaps. No components, relationships, routes or wire/schema formats were added. All existing node/curve geometry and hierarchy navigation are preserved.

## Implementation gaps and open decisions

Current browser API and sole-owner checks are partial evidence; no complete multi-user permission model or AI MCP implementation is delivered. HPX-GAP-029 leaves permission vocabulary/granularity, representation, inheritance/conflict precedence, authorised administration, delegation/revocation, in-flight atomicity and adapter compatibility unresolved. HPX-GAP-026/028 remain relevant. No ACL/RBAC/ABAC scheme or new persistent permission format is adopted. Current OpenAPI is partial evidence, not a full approved V3 contract.

Future acceptance must exercise equivalent operations across browser/MCP, human/AI actors and differing grants, including denied reads/writes/disclosure, private drafts/receipts, changed rights and original-operation recovery. Existing single-owner tests do not establish those outcomes.

[Executed checks](../evidence/shared-user-api.json) record documentation/model review only. No application tests/build/launch, browser, generation, proof, trust/provider/workspace change, commit or publication; no rendered visual acceptance claimed.
