# Hypergraph PX documentation

**Start with the [LikeC4 specification](architecture/SPECIFICATION.md).** Diagrams own the scopes in the [ownership index](architecture/specification-ownership.csv). Supporting prose supplies details not yet sufficiently modelled; do not maintain parallel definitions. HPX-OWNER-032 changes definition ownership, not the status of proposed designs or implementation evidence.

## Authority and status

[Owner decisions](02-governance/OWNER_DECISIONS.md) and accepted obligations retain authority. Diagram-first ownership does not promote planned features to implemented ones. Current users are workspace-local, with one machine user per provider per workspace; see [canonical actor definitions](architecture/context.c4) and the [supplemental chat/MCP contract](06-subsystems/ai-collaboration.md). No public API, new code or publication is authorised by documentation changes.

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

## Architectural review integration

Past review and migration records are provenance, not routine reading. Consult [implementation dispositions](09-guides/reference/implementation-resumption.md#architecture-review-integration-2026-10-26) or the previously published [historical snapshot](https://github.com/dfdy/hypergraph-px/blob/1c5f9e5/.provenance/public-record/public-snapshots/2026-10-26-pre-architecture-integration-a0402d90505d/README.md) only when needed. All provenance archives are now local-only under ignored `.provenance/`; the [historical index](https://github.com/dfdy/hypergraph-px/blob/1c5f9e5/.provenance/README.md) describes the retained layout. A fresh clone contains metadata and historical Git links, not local archive payloads. Private originals and unredacted masters remain unpublished; original/current locations and byte hashes are retained in the registers.

## Constitution

Maintain one definition per claim. Update diagram-owned structure in its owning view; keep exact wire/schema/byte/permission/security rules and acceptance criteria in linked contracts until completely modelled. Preserve stable IDs and source provenance. Requirements, proposals, implementation and actual verification are separate. Do not invent missing mechanisms, infer acceptance by recency or discard evidence.

## Current state and verification

Read [current execution status](09-guides/reference/DEVELOPMENT_STATE.md#current-execution-status) and the [current scope/evidence summary](09-guides/reference/DEVELOPMENT_STATE.md#current-scope-and-evidence-summary), then only the affected contracts. Read chronological logs, audit reports and full proof details when their evidence is relevant. Use the [test register](registers/tests.csv) for checks actually executed. No application acceptance follows from model validation.

## Current specification reconciliation

[The scoped audit](architecture/audits/specification-reconciliation-audit.md) records obsolete-requirement corrections. [Diagram ownership migration](architecture/audits/diagram-canonicalization.md) records removed duplication and measured reduction. Exact source/claim identities remain in [registers](registers/README.md); no source archive or as-run test/proof record was deleted.


[Complete migration status](architecture/audits/specification-migration-status.md): fully/partially/not migrated, with intentionally retained supporting records separated.
