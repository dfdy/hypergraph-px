# Hypergraph PX documentation

This nine-level documentation system is the current navigation for the migrated project documentation. Earlier documentation is preserved byte-for-byte under ignored `.oldspecs/`; its immutable source IDs/hashes and exact locations are in the registers. The archive is evidence, not active agent instructions. Root/upstream license texts, application/proof sources and existing unfinished code remain in place.

## Authority and status

The owner has approved the documentation migration procedure and explicitly decided retained immutable history, serialization outside domain and explicit record versions before real-data acceptance. Those decisions are recorded in [the owner record](02-governance/OWNER_DECISIONS.md) and decision ADRs. Inherited accepted source obligations retain their scope. New editorial assemblies are `proposed` pending topic review; that does not revoke existing obligations or approve speculative additions. No implementation resumes, certificate trust installs, commits or pushes are authorized by this migration.

Accepted specifications own only their bounded subjects. Requirements constrain lower-level mechanisms; an ADR explains a choice without overriding upstream purpose or requirements. Implementation is evidence, not retroactive authority. New contradictions are recorded with competing sources and require explicit resolution. Recency and filenames do not settle authority.

## Nine abstraction levels

1. [Purpose](01-purpose/README.md): why HPX exists.
2. [Governance](02-governance/README.md): who decides and contributes.
3. [Requirements](03-requirements/README.md): observable outcomes and acceptance.
4. [Architecture](04-architecture/README.md): major boundaries and decisions.
5. [Domain](05-domain/README.md): objects, invariants and transformations.
6. [Subsystems](06-subsystems/README.md): component, format and interface contracts.
7. [Implementation](07-implementation/README.md): exact schema/protocol/algorithm/property contracts.
8. [Assurance](08-assurance/README.md): proof/test evidence, security, recovery and release.
9. [Guides](09-guides/README.md): reader/developer navigation.

These are abstraction levels, not waterfall phases. Work may refine them in both directions. Prefer concise source-backed documents and links over repeated normative definitions or empty templates.

## Constitution

Use progressive precision and one authoritative definition per claim. Separate intent, decisions, implementation and evidence. Specify proportionately to risk and preserve bidirectional traceability where practical. Keep version-controlled UTF8 text, explicit uncertainty and maintained verification; never invent missing details or promote a proposal automatically. Preserve human approval authority and publicly inspectable contribution records without publishing private inputs.

Every adopted specification has stable ID, title, purpose, level, one status, maintainer, applicability, upstream/downstream references, verification, history and review date. `accepted`, `implemented` and `verified` are different claims. `superseded` requires an explicit replacement/decision, not an edit timestamp. IDs remain stable across moves and are never reused. Source claims can retain acceptance while a newly assembled document is under editorial review.

Use the [templates](templates/README.md) and [registers](registers/README.md). Full source bodies remain recoverable in `.oldspecs`; public readers get source identity/attribution without a false promise of access to ignored/private material. Philosophy need not be forced into engineering checklists. Future governance/federation mechanisms remain deferred until approved.

## Current state and verification

Published version is0.7.0, the synthetic frontend milestone. Uncommitted encrypted storage/runtime integration is incomplete and paused. The [development evidence guide](09-guides/reference/development-evidence.md), [full formal digest](08-assurance/formal-validation-digest.md), [technical debt](registers/technical-debt.csv) and [migration report](MIGRATION-REPORT.md) state actual boundaries.

The [migration protocol](MIGRATION-AGENT-PROTOCOL.md) remains procedural guidance. Its original preservation wording is qualified by the owner's later explicit `.oldspecs` move instruction; preserve original bytes and do not expose private sources. No root files were overlaid from a template pack. No new architecture or software behavior is established by copying a checklist.
