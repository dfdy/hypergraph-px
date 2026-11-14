# Data and Storage Architecture


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-006-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-006-02` [Current adopted design — OWNER059](#current-adopted-design--owner059) | Prose only: Routing summary to the detailed adopted design contracts; their section bindings carry ownership. |
| `HPX-BIND-006-03` [Normative content](#normative-content) | [hpx.native.storage](diagrams/executable.c4) · `HPX-CAN-029` · [c3_integrations](navigation.md) · consumers: none |
| `HPX-BIND-006-04` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
| `HPX-BIND-006-05` [Future export compilation data](#future-export-compilation-data) | [hpx.native.integrations.export](diagrams/executable.c4) · `HPX-CAN-030` · [c3_integrations](navigation.md) · consumers: none |
| `HPX-BIND-006-06` [Working-branch design boundary, 2026-10-26](#working-branch-design-boundary-2026-10-26) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](navigation.md) · consumers: none |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-ARCH-003`
- **Title:** Data and Storage Architecture
- **Purpose:** SQLite authority, encrypted records, mutable drafts and atomic publication.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<system-architecture.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-10-30

SQLite is selected. Encryption metadata leakage and whole-database rollback limitations remain explicit; database choice does not implement policy/federation.



## Current adopted design — OWNER059

The directly selected D01–D22A briefs now have diagram-owned definitions and precise supplements: [CAN026 / Authority lifecycle and custody](../06-subsystems/contracts/authority-lifecycle.md), [CAN029 / Canonical repair restore and authenticated exchange](../06-subsystems/contracts/persistence-and-exchange.md), [CAN030 / Integration export and delivery design](../06-subsystems/contracts/integrations-and-delivery.md). These govern the listed design questions; earlier open-mechanism statements below retain their historical checkpoint scope where superseded by this explicit decision. Candidate record/profile designs are not active formats or implemented capability. Exact retained source/byte/history and accepted obligations remain; actual code, measured capacity, genuine older-reader, recovery/security/UI acceptance and proofs are separately unperformed. No original source provenance or as-run evidence is rewritten.

## Normative content

One SQLite database coordinates encrypted immutable objects, mutable head/draft slots and encrypted operation receipts. WAL/FULL is durability machinery, not application history. Ciphertext metadata leaks opaque identifiers, types, generations, lengths/counts and access patterns; no whole-database rollback witness exists. The implementation does not rewrite every retained revision on each draft save. See [record representation](../07-implementation/data-structures/sqlite-records.md) and [publication protocol](../07-implementation/protocols/draft-publication.md).

The former source-era flow is delegated to the canonical sequence below. The bounded one-owner writer now exists; [current evidence](../09-guides/reference/DEVELOPMENT_STATE.md#current-scope-and-evidence-summary) distinguishes its integrated scope from gated branch work. [Recovery responsibilities](../08-assurance/recovery.md#authoritative-state-and-repair-boundary) distinguish authoritative mutable state from genuinely reconstructible indexes; a table named “index” is not permission to discard it. The freshness acceptance conflict remains explicit in the [threat model](../08-assurance/security-threat-model.md#unresolved-freshness-acceptance-scope--architecture-review).

### Data and command flow

Source `HPX-SRC-0021`, original lines 28–43. Source-linked obligations with scoped retention, transformation or owner qualification; see the clause dispositions for `HPX-SRC-0021-S004`. Original dates and implementation observations remain historical evidence.

The accepted [core object model](<../05-domain/core-object-model.md>) and [SQLite persistence design](<../06-subsystems/formats/hpx-workspace.md>) define the initial local writer. Canonical immutable records support typed projections: occurrence structure, revision ancestry, transformation provenance, references, expansion dependencies and snapshot closure. Derive indexes rather than creating competing authoritative stores. Logical identity is independent of physical encrypted addresses. See the [mathematical model](<../05-domain/hypergraph-mathematics.md>) and [data reference](<../06-subsystems/interfaces/domain-navigation.md>).

The bounded current command flow is canonical in [Sequence / Application coordination — Authorize, reconcile and publish](../07-implementation/diagrams/sequences/application-workflows.c4), with uncertain-outcome recovery in the linked sequence (HPX-CAN-006). This implementation description is not a requirement to reproduce sole-owner authority. Exact future semantics remain in the [publication contract](../07-implementation/protocols/draft-publication.md).

This is the required application flow. The bounded one-owner transaction/receipt implementation exists; complete multi-user workspace permissions and broader target operations remain incomplete. Preview/navigation must not publish history. Changed request reuse under the same idempotency key conflicts; uncertain acknowledgements reconcile the original action. Autosave persists mutable drafts separately from immutable commits. Delayed replies must preserve newer typing, selection and undo state.


## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 28–43; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.

## Future export compilation data

HPX-RQ-030's proposed adapter consumes an immutable export view binding selected document/main/additional branch identities, exact revisions/snapshots or acknowledged draft sequence, occurrence/range contexts, selected retrospective annotation/provenance views, citation/style/locale resources and target profile/options. No later source/overlay head or browser DOM is substituted. Preserve role-labelled n-ary relationships and same-identity ancestry versus derivation, with readable per-format fallbacks and an authorized unresolved-rights appendix. Export XML/JSON schemas remain separately versioned future contracts, not a change to workspace/envelope/backup formats. [The export specification](../06-subsystems/import-export.md) defines this future scope; no persisted compilation manifest or converter implementation is claimed.

## Working-branch design boundary, 2026-10-26

[ADR019](decisions/0019-working-branches-and-reference-checkpoints.md) is adopted. Distinguish mutable autosave, immutable unpublished reference checkpoints and explicit committed snapshots. Local optional records20–27 and gated frontend wiring implement a bounded subset; complete actual-runtime and older-reader acceptance remains pending. Commit atomically stores text publication and eligible exact promotion evidence. A separate frozen, generation-bound private replacement operation retains originals; its failure never undoes already committed text. Broader reverse-reference/entity replacement remains future work. Exact fields and limits belong in the [record contract](../07-implementation/data-structures/sqlite-records.md), not duplicated architecture schemas. No SQL, record, envelope or protocol version changes here.
