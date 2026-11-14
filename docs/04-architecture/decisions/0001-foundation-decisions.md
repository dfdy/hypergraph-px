# Existing ADR 0001, retain decision identity/status

## Common metadata

- **ID:** `HPX-ADR-001`
- **Title:** Existing ADR 0001, retain decision identity/status
- **Purpose:** Metadata view of an existing scoped decision; original decision identity and provenance retained.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../system-architecture.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-30

The underlying decision retains its recorded acceptance. This new editorial wrapper does not expand that decision or imply implemented services.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; documentation ownership does not establish implementation or verification.

## Owner baseline reconciliation, 2026-10-30

HPX-OWNER-027 supersedes “One human locally first” as a product-architecture restriction. One-human development remains permitted; multiple human/AI users and several AI agents in one workspace are mandatory baseline independent of federation. The original decision text below is retained as provenance. Other accepted foundation choices remain; [HPX-SUB-010](../../06-subsystems/ai-collaboration.md) defines the new scoped requirement.

## Status and decision date

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Problem and forces

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Alternatives considered

Metadata view of an existing scoped decision; original decision identity and provenance retained. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Chosen decision



### ADR 0001: Fresh local core with future collaboration and key-custody boundaries

Source `HPX-SRC-0041`, original lines 1–18. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: accepted foundation decisions, owner confirmed 2026-10-24. Tracking: https://github.com/dfdy/hypergraph-px/issues/1.

- Project workspace Hypergraph PX MU-F; source repository dfdy/hypergraph-px.
- One human locally first; users/devices/groups are distinct design identities now.
- Separate frontend/domain/data development with single embedded-frontend Rust executable release.
- Trusted-server encryption first/default; client-held mode planned and unavailable until implemented.
- Support passphrase and OS-keychain startup unlock, default passphrase (owner follow-up, 2026-10-24).
- Keep browser-only and independently trusted client paths; require the trusted client for the stronger malicious-host-code-delivery guarantee (owner follow-up, 2026-10-24).
- User-held recovery for client-encrypted data; server resets cannot restore those keys.
- Future live coediting and explicit branches/merges are both required design targets.
- Reject recursive expansion cycles; permit hyperlink cycles in their own projection.
- Workspace/document sharing first, full retained history only by explicit grant.
- Lean model proofs and early Aeneas feasibility; prove selected Rust where supported; no runtime Lean.
- AGPL-3.0-only original application license.

Consequences: model context/occurrence identity, immutable history, transformation provenance and encryption-independent identities before durable formats. Selective sharing, offline policy epochs, key wrapping/rotation, implementation of trusted-client distribution, storage authority and conflict semantics still need mechanism ADRs. This decision does not adopt illustrative crypto/protocol choices or inherit old implementation formats. Validation and rollback for the first pure-core increment are recorded in issue #1; no durable user data exists yet.


## Consequences and risks

Retain the scoped limits above and [open questions/conflicts](<../../02-governance/registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Revisit triggers

Retain the scoped limits above and [open questions/conflicts](<../../02-governance/registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Affected specifications and tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0041` — `docs/adr/0001-foundation-decisions.md`, lines 1–18; SHA-256 `8e36576431b39364dab6e4cc464ef40624e3ba586643a8401d6647a10b716748`. Original bytes and paths are recorded in [source manifest](<../../02-governance/registers/source-manifest.csv>); archive is local/ignored.
