# Hypergraph PX documentation

**Start with the [LikeC4 specification](04-architecture/SPECIFICATION.md).** Diagrams own the scopes in the [ownership index](02-governance/registers/specification-ownership.csv). Supporting prose intentionally owns precise contracts,invariants,rationale and evidence within completed split specifications;do not maintain duplicate authoritative definitions. HPX-OWNER-032 changes definition ownership, not the status of proposed designs or implementation evidence.

## Authority and status

[Owner decisions](02-governance/OWNER_DECISIONS.md) and accepted obligations retain authority. Diagram-first ownership does not promote planned features to implemented ones. Current users are workspace-local, with one machine user per provider per workspace; see [canonical actor definitions](04-architecture/diagrams/context.c4) and the [supplemental chat/MCP contract](06-subsystems/ai-collaboration.md). No public API, new code or publication is authorised by documentation changes.

## Nine abstraction levels

These organise supporting documents; they do not duplicate the C1–C4 model:

1. [Purpose](01-purpose/README.md)
2. [Governance](02-governance/README.md)
3. [Requirements and acceptance](03-requirements/README.md)
4. [Architecture supplements and ADRs](04-architecture/README.md)
5. [Domain invariants](05-domain/README.md)
6. [Subsystems, interfaces and formats](06-subsystems/README.md)
7. [Exact implementation contracts](07-implementation/README.md)
8. [Assurance and evidence](08-assurance/README.md)
9. [Guides](09-guides/README.md)


## Constitution

Maintain one definition per claim. Update diagram-owned structure in its owning view; retain exact wire/schema/byte/permission/security rules and acceptance criteria in their assigned precise contracts;a deliberate model/prose partition keeps those rules in their precise homes. Preserve stable IDs and source provenance. Requirements, proposals, implementation and actual verification are separate. Do not invent missing mechanisms, infer acceptance by recency or discard evidence.

## Current state and verification

Read [current execution status](09-guides/reference/DEVELOPMENT_STATE.md#current-execution-status) and the [current scope/evidence summary](09-guides/reference/DEVELOPMENT_STATE.md#current-scope-and-evidence-summary), then only the affected contracts. Read chronological logs, audit reports and full proof details when their evidence is relevant. Use the [test register](02-governance/registers/tests.csv) for checks actually executed. No application acceptance follows from model validation.

The [shared LikeC4 workflow](04-architecture/SPECIFICATION.md#numbered-documentation-project) describes commands and external local tooling state. Active documentation lives in the numbered01–09 folders; the root retains this entry point and the shared model configuration/package files.
