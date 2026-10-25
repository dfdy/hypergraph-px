# Graph Engine

## Common metadata

- **ID:** `HPX-SUB-001`
- **Title:** Graph Engine
- **Purpose:** Graph/navigation operations, predicate handling and bounded authorized projections.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../04-architecture/system-architecture.md>); [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Fixture controls and future contracts are not durable service implementations. Capabilities must report unavailable honestly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Responsibilities and boundaries

Graph/navigation operations, predicate handling and bounded authorized projections. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Inputs and outputs

Graph/navigation operations, predicate handling and bounded authorized projections. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## State and operations

A graph query names projection, consistent view, authorization scope, ordering, duplicate/cycle behavior and work/output budgets. Predicates/assertions are typed references, not a separate authoritative semantic database; n-ary roles are not reduced to independent binary claims. Rust currently implements bounded expansion validation, not the full query catalogue or durable semantic registry. The [navigation API](interfaces/domain-navigation.md) retains proposed versus actual functions.

### 7. Concepts and semantic assertions

Source `HPX-SRC-0037`, original lines 81–92. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Distinguish concept, proposition, argument, historical formulation and passage occurrence. Concepts can carry multilingual labels/aliases, definitions and competing interpretations. Same words need not imply same concept; lexical matching produces candidates, not authoritative occurrences. Occurrences use revision-specific anchors and roles such as mentions, uses, defines, qualifies or criticises.

Semantic predicates have stable namespaced identity/version, description, permitted participant types/roles and direction; inverse labels and symmetry/transitivity require explicit definitions. Families may cover ontological, process/dialectical, argument/logical, epistemological, ethical/political, conceptual, genealogical and methodological relations. For example, `semantic:develops_from` is an interpretation; an actual `core:forked_from` derivation is recorded only by the corresponding command. Do not infer logical entailment, symmetry or transitivity from English labels, or equate dialectical tension with logical contradiction.

Represent an n-ary assertion as an ordinary identifiable revisioned content entity with role-labelled reference edges; no new graph primitive is required. Record participants, qualifiers, evidence anchors, proposer and review state. Assertions may themselves be referenced or challenged, and competing assertions can coexist.

Agent proposals retain proposed/accepted/rejected/superseded states, exact branch/revision context and evidence. Only authorized review records acceptance; acceptance is an attributable contextual act, not universal truth. Retain rejected suggestion identities in the permitted scope to avoid blindly repeating them. Proposal records, accepted semantic state and reconstructible lexical indexes remain distinct. Creating/updating semantic records uses the shared authorized command path.

Snapshots bind the exact in-scope semantic/reference state or an explicit empty/excluded scope. Later annotations are separate, labelled retrospective overlays with their own view token, never inserted into old snapshots. Decide inclusion defaults and disclosure/closure rules before production snapshot formats are frozen.


## Invariants and error behavior

Graph/navigation operations, predicate handling and bounded authorized projections. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Dependencies and interfaces

Graph/navigation operations, predicate handling and bounded authorized projections. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Security and privacy

Graph/navigation operations, predicate handling and bounded authorized projections. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 81–92; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
