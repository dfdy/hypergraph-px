# HPX-FIND-002 — Current summaries retain superseded implementation status

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Maintainability concern / contradiction

## Severity

Medium

## Confidence

High

## Confirmed versus hypothetical

Confirmed documentation drift

## Affected components / scope

Architecture and requirement status navigation

## Affected processes

HPX-PROC-018

## Priority and dependency gate

P1 — before another implementation handoff

## Likelihood / evidence limit

High: contradictory entry-point summaries already exist.

## Problem

Component summaries still call domain serialization nonconforming and application/transport planned. Other current records explicitly report the refactor and integrated local increments. The requirement register also retains old delivery fields beside newer evidence. Historical passages are legitimate; unlabelled current-status entry points are misleading.

## Architectural consequences

Contributors may repeat finished work, infer inconsistent layering or enable unfinished capability from the wrong checkpoint. Current design rules remain coherent once historical status is separated.

## Reproduction / demonstration

Compare component lines with accepted ADR006, actual domain Cargo manifest and latest state. Trace RQ001 and RQ028 status fields to their original milestone; do not replace an unknown claim with a guessed pass.

## Alternative interpretations

Many statements are deliberately preserved historical evidence. The defect is present-tense summary/navigation scope, not retention of history or authority determined by date.

## Possible remedies

Add an explicitly scoped current-status table generated from a reviewed milestone manifest; label retained source status and link to its checkpoint. Keep accepted requirements stable.

## Trade-offs

A generated manifest reduces drift but needs one accountable maintainer and links to real checks; copying all history into a second current table would worsen duplication.

## Recommended next action

Prepare a documentation-only reconciliation proposal with exact affected rows and dated evidence, preserving the original passages.

## Human architectural approval

Routine factual reconciliation can follow existing authority; any acceptance change still needs owner decision.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/04-architecture/component-architecture.md:18](../../../docs/04-architecture/component-architecture.md) | OWNER-003 requires serialization outside domain. Current domain Serde usage is nonconforming local work to refactor later, without changing code here. |
| [docs/04-architecture/decisions/0006-domain-serialization-boundary.md:18](../../../docs/04-architecture/decisions/0006-domain-serialization-boundary.md) | Implementation update, 2026-10-25: domain Serde/dependencies have been removed. The &#91;adapter codecs&#93;&#40;../../../crates/storage/src/encoding.rs&#41; preserve identifier/command encodings; &#91;current evidence&#93;&#40;../../09-guides/reference/implementation-resumption.md&#41; distinguishes ordinary tests and proof replay. |
| [docs/registers/requirements.csv:2](../../../docs/registers/requirements.csv) | HPX-RQ-001,HPX-REQ-002,One Rust release executable embeds frontend assets; no Node/Lean/database server at runtime,HPX-SRC-0032; Specifications/SPECIFICATION.md:L1; # Hypergraph PX MU-F — product specification,preserve source priority; no new ranking,existing source scope; no invented date,HPX-ARCH-001,crates/runtime/build.rs,Pending embedded/browser parity,local code builds; delivery unverified,source-reported evidence; not rerun in documentatio |
| [docs/registers/requirements.csv:29](../../../docs/registers/requirements.csv) | HPX-RQ-028,HPX-REQ-002,Explicitly discover contextual logical equivalence while preserving predicate identity and proof/identity distinctions,Explicit owner separate review 2026-10-25; adopted clarification/graph; Lean conversion deferred,explicit owner requirement,current target specification,HPX-DOM-008;HPX-SUB-009,crates/storage/src/predicate-catalog-v1.json;crates/storage/src/predicates.rs;frontend/src/relationship-catalog.js,HPX-TEST-017;HPX |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:448](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | Validation: **120 Rust tests** pass &#40;3 crypto +20 domain +1 keychain +6 runtime +90 storage&#41;, including new cross-branch/snapshot cursor checks, independent working-source Fork/restart/fault/replay and all kind1–27 authenticated wrappers. Existing native opt-in/crash-worker entries remain directly ignored; the crash parent invokes its worker. Full **133 Node tests** pass, including six new branch/reference transport cases. **Eight targeted isolat |
