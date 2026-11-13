# Specification migration audit — 2026-10-30

This is a living inventory, kept current under the owner's standing instruction of 2026-10-30. Update affected rows, remaining coverage, canonical links and aggregate counts as migration stages or assessments change them; chronological entries do not replace accurate current summaries. Check coverage against the source contracts and [ownership index](../specification-ownership.csv).

## Current conceptual coverage

**OWNER048 / RQ039:** [M1](../Conceptual/identity-closure.c4) and [O2](../Conceptual/placement-effects.c4) now define the accepted universal creation-origin/contextual parent-or-position precondition, with [precise supporting distinctions](../../docs/05-domain/core-object-model.md#creation-origin-and-placement--hpx-owner-048). [Input proposal revision2](../proposals/trustworthy-reconstruction-inputs.md) withdraws its unsupported marker-based refusal/clipping recommendations. This is a bounded canonical requirement refinement, not parser/projection or creation-format adoption;all five gaps and24 scopes/45 views/1 fully/24 partially/46 not migrated remain unchanged.


**Current bounded semantic decision (OWNER045):** [finite selected states/cycle boundaries](../proposals/finite-cycle-closure-state.md) and [Lean plan](../proposals/finite-cycle-lean-plan.md), prepared from `HPX-HANDOFF-20261031-finite-cycle-closure@1`. OWNER041/043/044 behaviours remain accepted;OWNER045 accepts finite selected-state table/use tree,structural recurrence equality and exact semantic boundary witnesses;physical encoding remains unadopted. [31 finite-state model theorems and33 guards are checked](../../docs/08-assurance/formal-validation-digest.md#finite-cycle-state-model--2026-10-31);emitter,operational-resource and Rust/UI correspondence remain open. Owning C3/M1 proof notes are current;this transfers no canonical scope or model structure:24 scopes,45 views and1 fully/24 partially/46 not migrated remain. Exact invariants and all five migration gaps retain their linked contracts.

**HPX-OWNER-043:** [M1](../Conceptual/identity-closure.c4) owns explicit exact per-inclusion versions/cycle targets and source-only reconstruction;[Editor notes](../C3/browser-organisation.c4) allocate the [Ask / Automatic latest timestamp setting, potential-conflict marker and comparison modal](../../docs/06-subsystems/frontend-interaction.md#changed-source-conflict-handling--hpx-owner-043). Appearance/fonts/typesetting are external to the source guarantee. OWNER044 resolves HPX-recorded Commit time,ties ask,per-user Ask default and shared markers until authorised explicit resolution. Concrete timestamp encoding/missing-value,physical encoding/authenticated source interpretation and marker/resolution mechanisms remain open. Existing CAN014/018 scopes are refined;24 scopes,45 views and1/24/46 document classifications remain unchanged.

**OWNER047 / TEST155:** [Canonical M1](../Conceptual/identity-closure.c4) retains original including-source cycle notation with separate warning/navigation metadata. [Bounded emission evidence](../evidence/source-emission-lean.json) checks19 theorems/18 guards for supplied frozen source-faithful partitions; authenticated parsing/loading, early resources and product correspondence remain open. This assurance refinement changes no document coverage classification, structure or ownership:24 scopes/45 views;1 fully/24 partially/46 not migrated.

**Current owner refinement, HPX-OWNER-041:** [cyclic saved inclusion and bounded expansion/navigation](../../docs/05-domain/hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041) are accepted behaviour; [HPX-PROP-006–008 Lean proofs](../../docs/07-implementation/formal-invariants.md#required-cycle-aware-expansion-proofs--hpx-owner-041) have checked finite typed-table model results,with exact source-emission,operational-resource and Rust/UI limits retained in the linked digest. Existing Pure domain notes reflect this policy; OWNER045 resolves the finite-state/structural-key/boundary semantic basis; other exact mechanisms and the rest of the closure proposal remain unadopted. Read-only-before-editing is accepted sequencing. No document becomes fully migrated; counts, model structure and 24 ownership scopes remain unchanged.

24 ownership scopes;45 model views:38 pre-existing views plus4 conceptual views and3 supporting operation-effect sequences. [Current bounded coverage and C4 correspondence](dom001-current-coverage.md) names all five gap dispositions,canonical locations and exact remaining contracts. Source-backed mappings/effects are complete in scope;remaining closure physical/source-map,identity/permission,interaction and security representation mechanisms remain unadopted. No component label or effect sequence is implementation/proof. Aggregate document statuses remain **1 fully /24 partially /46 not migrated** (71 materialized;27 reserved excluded),checked against current table rows and ownership index. HPX-DOM-001 remains partial. A separate [HPX-GAP-004 closure/source-map proposal](../proposals/exact-closure-source-map.md) has accepted cycle behaviour/proof obligations and read-only sequencing under OWNER041;its remaining mechanisms are unadopted;document classifications,24 ownership scopes and45 model views are unchanged.

HPX-SCP v0.5.0 is now [explicitly adopted for local engineering communication](../../docs/engineering/semantic-protocol/LOCAL_ADOPTION.md) under HPX-OWNER-042. This governance-status change is not product specification migration:24 canonical scopes,45 model views and1 fully/24 partially/46 not migrated document classifications remain unchanged. Original protocol/package/installation evidence remains historical and byte-preserved.

## Meaning of migration status

This audit covers all71 materialized registered documents. The C4 system means the navigable LikeC4 model across C1–C4 and its sequences, not just level4 implementation views. Migration is definition ownership, separate from acceptance, implementation and test status.

- **Fully migrated:** all definitions belonging to this document’s subject are owned by the model; the retained file is metadata/provenance and links. This does not imply the whole system has complete C4 detail.
- **Partially migrated:** at least one definition was explicitly delegated and its prose duplicate removed; unique contracts or behavioural obligations still remain.
- **Not migrated:** no definition of the document’s own subject has been transferred. A related diagram, source link or boilerplate deletion alone does not count. Decision rationale, philosophy, formats, proofs and governance need not be forced into diagrams.

**Result:** 1 fully migrated;24 partially migrated;46 not migrated. Of those46,13 are subject specifications and33 are intentionally retained governance/decision/guide/audit/proof/ownership records. The27 reserved IDs have no materialized specification to migrate and are excluded.

## Fully migrated

| ID | Specification | Canonical home |
| --- | --- | --- |
| `HPX-ARCH-001` | [System Architecture](../../docs/04-architecture/system-architecture.md) | C1/C2 and executable overview;HPX-CAN-001/002/003. |

## Partially migrated

For most entries only the shared actor-structure definition has moved (HPX-CAN-002). Component/data architecture and frontend organisation also transfer their explicitly indexed structure/flow. The following lists the unique content still required in prose; this is not a claim of substantial algorithm/schema migration.

| ID | Specification | What remains outside the model |
| --- | --- | --- |
| `HPX-PRIN-004` | [Scope and Non-Goals](../../docs/01-purpose/scope-and-non-goals.md) | Development,licensing and non-goals. |
| `HPX-REQ-004` | [Acceptance and Conformance](../../docs/03-requirements/acceptance-criteria.md) | Development,licensing and non-goals. |
| `HPX-REQ-002` | [System Requirements](../../docs/03-requirements/system-requirements.md) | Development,licensing and non-goals. |
| `HPX-ARCH-002` | [Component and Module Architecture](../../docs/04-architecture/component-architecture.md) | Purity,composition,authority and unresolved design rules. |
| `HPX-ARCH-003` | [Data and Storage Architecture](../../docs/04-architecture/data-architecture.md) | Authoritative storage,leakage,freshness,export and working-state rules. |
| `HPX-DOM-001` | [Core Object Model](../../docs/05-domain/core-object-model.md) | Bounded context/container/responsibility scopes CAN007–017 and [M1](../Conceptual/identity-closure.c4)/[M2](../Conceptual/relationships.c4)/[M3](../Conceptual/provenance-working.c4)/[M4](../Conceptual/authority-distinction.c4), CAN018–021; [O1](../Conceptual/publication-effects.c4)/[O2](../Conceptual/placement-effects.c4)/[O3](../Conceptual/evidence-effects.c4), CAN022–024. Exact byte/closure/source-map/attribution/authority/recovery invariants and unadopted mechanisms remain linked contracts; [closure/source-map proposal](../proposals/exact-closure-source-map.md) is partially adopted as explicitly bounded by OWNER041/043/044/045/047; [all five current gap dispositions](dom001-current-coverage.md). [Finite-state proposal](../proposals/finite-cycle-closure-state.md)/[proof plan](../proposals/finite-cycle-lean-plan.md) have their finite-state/structural-key/boundary semantic basis accepted under OWNER045;physical encoding remains open;PROP006-008 have checked cycle-model scope;OWNER047 adds TEST155 bounded emission/byte-map witnesses under supplied frozen source-faithful partitions;authenticated input/resource/implementation bridges remain open. [Trustworthy input proposal revision2](../proposals/trustworthy-reconstruction-inputs.md) prepares that next design boundary;OWNER048/RQ039 is accepted in M1/O2 while structural-position/source-projection mechanisms remain unadopted. No whole-document migration or implementation follows. |
| `HPX-DOM-003` | [Document, Branch and Revision Semantics](../../docs/05-domain/document-semantics.md) | Identity/placement/manifest/snapshot concepts are represented in [M1](../Conceptual/identity-closure.c4); [O1/O2 effects](dom001-current-coverage.md) are bounded;exact closure/source mapping,composition/pin distinctions and unadopted encodings remain precise contracts. |
| `HPX-DOM-004` | [Provenance and Event Semantics](../../docs/05-domain/provenance-model.md) | [M3](../Conceptual/provenance-working.c4) represents ancestry/derivation/observable-exchange distinctions; [O2/O3 effects](dom001-current-coverage.md) are bounded;exact attribution/source mappings and unadopted capture/security formats remain contract-owned. |
| `HPX-SUB-010` | [Multi-user and AI Collaboration](../../docs/06-subsystems/ai-collaboration.md) | Chat-node capture,MCP parity,target binding and concurrency. |
| `HPX-SUB-002` | [Document Engine](../../docs/06-subsystems/document-engine.md) | Development,licensing and non-goals. |
| `HPX-SUB-011` | [External Integrations](../../docs/06-subsystems/external-integrations.md) | Development,licensing and non-goals. |
| `HPX-SUB-009` | [Frontend Interaction](../../docs/06-subsystems/frontend-interaction.md) | Editor/control/coordinate/Graph-tab behaviour and acceptance. |
| `HPX-SUB-001` | [Graph Engine](../../docs/06-subsystems/graph-engine.md) | Development,licensing and non-goals. |
| `HPX-SUB-008` | [Import and Export](../../docs/06-subsystems/import-export.md) | Development,licensing and non-goals. |
| `HPX-SUB-012` | [Security and Cryptography](../../docs/06-subsystems/security-cryptography.md) | [M4 distinctions](../Conceptual/authority-distinction.c4) preserve accepted boundaries;exact authentication/authority/egress,epoch/key/custody,transport and leakage contracts plus unadopted mechanisms remain. |
| `HPX-SUB-006` | [Workspace Storage](../../docs/06-subsystems/workspace-storage.md) | Development,licensing and non-goals. |
| `HPX-ASSUR-003` | [Privacy and Research Data Protection](../../docs/08-assurance/privacy-and-data-protection.md) | Development,licensing and non-goals. |
| `HPX-ASSUR-006` | [Migration, Backup and Recovery](../../docs/08-assurance/recovery.md) | Development,licensing and non-goals. |
| `HPX-ASSUR-002` | [Security Threat Model](../../docs/08-assurance/security-threat-model.md) | Development,licensing and non-goals. |
| `HPX-ASSUR-001` | [Verification and Testing Strategy](../../docs/08-assurance/testing-strategy.md) | Development,licensing and non-goals. |
| `HPX-API-001` | [Domain/navigation contract](../../docs/06-subsystems/interfaces/domain-navigation.md) | Development,licensing and non-goals. |
| `HPX-API-002` | [Browser/runtime contract and capability gates](../../docs/06-subsystems/interfaces/browser-runtime.md) | Development,licensing and non-goals. |
| `HPX-DATA-001` | [Encrypted SQLite records and slot schema](../../docs/07-implementation/data-structures/sqlite-records.md) | Development,licensing and non-goals. |
| `HPX-PROTO-001` | [Draft acknowledgement and atomic commit protocol](../../docs/07-implementation/protocols/draft-publication.md) | Development,licensing and non-goals. |

## Not migrated — subject specifications

These retain substantive definitions in prose. Related implementation diagrams do not make those contracts migrated.

| ID | Specification |
| --- | --- |
| `HPX-PRIN-002` | [Foundational Principles and Ethics](../../docs/01-purpose/principles.md) |
| `HPX-PRIN-001` | [Project Purpose and Vision](../../docs/01-purpose/project-purpose.md) |
| `HPX-REQ-001` | [Stakeholders and User Needs](../../docs/03-requirements/user-needs.md) |
| `HPX-DOM-002` | [Hypergraph Mathematics](../../docs/05-domain/hypergraph-mathematics.md) |
| `HPX-DOM-006` | [Text Anchors and Selection Semantics](../../docs/05-domain/text-and-anchors.md) |
| `HPX-ALG-001` | [Formal Invariants and Proof Obligations](../../docs/07-implementation/formal-invariants.md) |
| `HPX-ASSUR-005` | [Build and Release](../../docs/08-assurance/build-and-release.md) |
| `HPX-DOM-008` | [Assertions, stable predicates and browsing tags](../../docs/05-domain/assertions-and-predicates.md) |
| `HPX-FMT-001` | [Native encrypted .hpx workspace format](../../docs/06-subsystems/formats/hpx-workspace.md) |
| `HPX-FMT-002` | [HGOB/HGWK envelope formats](../../docs/06-subsystems/formats/crypto-envelopes.md) |
| `HPX-API-003` | [Crypto adapter API](../../docs/06-subsystems/interfaces/crypto-adapter.md) |
| `HPX-ALGO-001` | [Bounded expansion DAG validation](../../docs/07-implementation/algorithms/expansion-validation.md) |
| `HPX-ALGO-002` | [Per-node temporal parent-Merge planning](../../docs/07-implementation/algorithms/parent-merge.md) |

## Not migrated — supporting records

These are deliberately retained records, not a queue of functional specifications that all need diagrams.

| ID | Record | Kind |
| --- | --- | --- |
| `HPX-GOV-006` | [AI Development Agent Protocol](../../docs/02-governance/ai-development-protocol.md) | governance/plan/policy |
| `HPX-GOV-002` | [Licensing and Intellectual Property](../../docs/02-governance/licensing-policy.md) | governance/plan/policy |
| `HPX-GOV-004` | [Roadmap and Milestones](../../docs/02-governance/roadmap.md) | governance/plan/policy |
| `HPX-GUIDE-001` | [Documentation Publishing Plan](../../docs/09-guides/documentation-plan.md) | guide/evidence |
| `HPX-GUIDE-002` | [Developer setup and runtime/fixture modes](../../docs/09-guides/developers/getting-started.md) | guide/evidence |
| `HPX-GUIDE-005` | [Formal validation reproduction guide](../../docs/09-guides/developers/formal-validation.md) | guide/evidence |
| `HPX-GUIDE-006` | [Development/source provenance navigation](../../docs/09-guides/reference/development-evidence.md) | guide/evidence |
| `HPX-ADR-001` | [Existing ADR 0001, retain decision identity/status](../../docs/04-architecture/decisions/0001-foundation-decisions.md) | decision record |
| `HPX-ADR-002` | [Existing ADR 0002, retain decision identity/status](../../docs/04-architecture/decisions/0002-trusted-server-envelopes.md) | decision record |
| `HPX-ADR-003` | [Existing ADR 0003, retain decision identity/status](../../docs/04-architecture/decisions/0003-sqlite-local-writer.md) | decision record |
| `HPX-ADR-004` | [Existing ADR 0004, retain decision identity/status](../../docs/04-architecture/decisions/0004-local-https-bootstrap.md) | decision record |
| `HPX-ADR-005` | [Documentation migration and archive authority](../../docs/04-architecture/decisions/0005-documentation-migration.md) | decision record |
| `HPX-ADR-006` | [Serialization outside the pure domain](../../docs/04-architecture/decisions/0006-domain-serialization-boundary.md) | decision record |
| `HPX-ADR-007` | [Explicit persistent record versions](../../docs/04-architecture/decisions/0007-explicit-record-versions.md) | decision record |
| `HPX-ADR-011` | [Retained immutable committed history](../../docs/04-architecture/decisions/0011-retained-history.md) | decision record |
| `HPX-ASSUR-009` | [Human-readable formal validation digest](../../docs/08-assurance/formal-validation-digest.md) | audit/proof evidence |
| `HPX-GUIDE-007` | [Current development state](../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | guide/evidence |
| `HPX-ADR-014` | [Local keychain unlock and recovery policy](../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md) | decision record |
| `HPX-ADR-010` | [First durable semantic assertions and snapshot scope](../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md) | decision record |
| `HPX-ADR-015` | [Initial Merge output and review workflow](../../docs/04-architecture/decisions/0015-initial-merge-workflow.md) | decision record |
| `HPX-ADR-016` | [Stable local development signing identity](../../docs/04-architecture/decisions/0016-local-development-signing.md) | decision record |
| `HPX-ADR-017` | [First durable document comments](../../docs/04-architecture/decisions/0017-initial-durable-comments.md) | decision record |
| `HPX-ADR-018` | [First local branch creation and editing](../../docs/04-architecture/decisions/0018-initial-local-branches.md) | decision record |
| `HPX-ADR-019` | [Working branches and exact reference checkpoints](../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) | decision record |
| `HPX-ARCH-005` | [C2 specification coverage audit](c2-audit.md) | audit/proof evidence |
| `HPX-ARCH-006` | [Rust executable C3 specification audit](c3-audit.md) | audit/proof evidence |
| `HPX-ARCH-007` | [Runtime and API C3 specification audit](runtime-api-audit.md) | audit/proof evidence |
| `HPX-ARCH-008` | [API C4 implementation and workflow audit](api-implementation-audit.md) | audit/proof evidence |
| `HPX-ARCH-009` | [Frontend delivery implementation audit](frontend-delivery-audit.md) | audit/proof evidence |
| `HPX-ARCH-010` | [Pure domain responsibility and implementation audit](pure-domain-audit.md) | audit/proof evidence |
| `HPX-ARCH-011` | [Executable C3 responsibility coverage audit](c3-coverage-audit.md) | audit/proof evidence |
| `HPX-ARCH-012` | [Application coordination hierarchy audit](application-coordination-audit.md) | audit/proof evidence |
| `HPX-ARCH-013` | [Canonical Specification Ownership](../SPECIFICATION.md) | ownership policy |

## Audit corrections and remaining documentation

Removed37 repeated global authority paragraphs and87 generic example/verification/open-question template sections;their rules already exist in the canonical entry point and agent instructions. Removed the remaining duplicated workspace-user/cardinality definition from the AI supplement while preserving unique concurrency, authentication, chat, MCP and permission rules. Corrected stale references to already-deleted tables/flows. Release qualification has one home in Build and Release, allowing System Architecture to remain a forwarding document.

No model definitions, design/implementation statuses, source/claim IDs, diagrams or existing saved layouts changed. Historical decisions/as-run evidence, exact wire/format examples, domain invariants, editor byte/coordinate rules, security policy, acceptance obligations and unresolved mechanisms are retained. These are necessary supplements, not superfluous prose. Remaining prose must not be deleted just to increase migration counts.

[Executed checks and measured net reduction](../evidence/specification-migration-audit.json). Static checks cover the classification inventory, model/nav/links, fenced examples, protected source/archive/backup bytes and duplicate removal. Documentation verification is recorded after execution. No application tests/build/launch,browser,generation,proof,trust/provider/workspace action,commit or publication;no rendered acceptance claimed.


Subsequent HPX-OWNER-033 removes separate inference endpoints and consolidates AI interaction under machine-user chat/MCP. The definition-ownership classifications above are unchanged; [current consolidation checks](../evidence/machine-user-consolidation.json) supersede earlier model counts.


HPX-DOM-001 C1 (HPX-OWNER-034 / HPX-CAN-007) and bounded C2 (HPX-OWNER-036 / HPX-CAN-008) are complete;the document remains partially migrated. [C2 clause mapping and deferments](dom001-c2-migration.md) supplements the preserved [C1 record](dom001-c1-migration.md). No C3/C4, conceptual-view or sequence migration is implied.


HPX-OWNER-037 / HPX-CAN-009 add only C3 executable-overview responsibility allocation. HPX-DOM-001 remains partially migrated; [all five gap dispositions](dom001-c2-migration.md#c3-executable-overview-allocation--hpx-owner-037) retain conceptual definitions, precise contracts and unresolved mechanisms. No focused expansion, C4, conceptual-view or sequence migration.


HPX-OWNER-038 / HPX-CAN-010 add only five Pure domain expansion allocation notes and contract links. HPX-DOM-001 remains partially migrated; [all five gaps remain tracked](dom001-c2-migration.md#c3-pure-domain-allocation--hpx-owner-038). No conceptual definition is removed; no other expansion, C4 or sequence migration.


HPX-CAN-011 / OWNER039: Application coordination allocation complete; [all five dispositions](dom001-c2-migration.md#successive-responsibility-allocations--hpx-owner-039) retained. HPX-DOM-001 remains partially migrated; no conceptual definition, C4 or sequence transferred.


HPX-CAN-012 / OWNER039: Workspace persistence allocation complete; [all five dispositions](dom001-c2-migration.md#successive-responsibility-allocations--hpx-owner-039) retained. HPX-DOM-001 remains partially migrated; no conceptual definition, C4 or sequence transferred.


HPX-CAN-013 / OWNER039: Runtime and API allocation complete; [all five dispositions](dom001-c2-migration.md#successive-responsibility-allocations--hpx-owner-039) retained. HPX-DOM-001 remains partially migrated; no conceptual definition, C4 or sequence transferred.


HPX-CAN-014 / OWNER039: Browser presentation and interface functions allocation complete; [all five dispositions](dom001-c2-migration.md#successive-responsibility-allocations--hpx-owner-039) retained. HPX-DOM-001 remains partially migrated; no conceptual definition, C4 or sequence transferred.


HPX-CAN-015 / OWNER039: Cryptographic adapter supporting scope allocation complete; [all five dispositions](dom001-c2-migration.md#successive-responsibility-allocations--hpx-owner-039) retained. HPX-DOM-001 remains partially migrated; no conceptual definition, C4 or sequence transferred.


HPX-CAN-016 / OWNER039: Keychain supporting scope allocation complete; [all five dispositions](dom001-c2-migration.md#successive-responsibility-allocations--hpx-owner-039) retained. HPX-DOM-001 remains partially migrated; no conceptual definition, C4 or sequence transferred.


HPX-CAN-017 / OWNER039: Integration supporting scope allocation complete; [all five dispositions](dom001-c2-migration.md#successive-responsibility-allocations--hpx-owner-039) retained. HPX-DOM-001 remains partially migrated; no conceptual definition, C4 or sequence transferred.


[Post-allocation conceptual-sufficiency assessment](dom001-conceptual-sufficiency.md) retains HPX-DOM-001 as partially migrated. No new canonical ownership or concept is registered; all five gap dispositions and exact contracts remain. Recommended first source-backed one-level conceptual drill-down fits standing authority; substantive mechanism decisions stay deferred.
