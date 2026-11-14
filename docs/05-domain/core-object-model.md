# Core Object Model


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-008-01` [Common metadata](#common-metadata) | Prose only: Document identity, authority and verification metadata; no component definition. |
| `HPX-BIND-008-02` [Workspace-local users — owner clarification](#workspace-local-users--owner-clarification) | [hpx.native.authority.concept_user](diagrams/authority-distinction.c4) · `HPX-CAN-026` · [concept_authority_distinctions](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-008-03` [Shared user API and per-user permissions](#shared-user-api-and-per-user-permissions) | [hpx.native.application.admission](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-008-05` [Entities and identities](#entities-and-identities) | [hpx.native.domain.exact](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-008-06` [Source provenance](#source-provenance) | Prose only: Source/approval provenance retained as prose; no runtime owner is implied. |
| `HPX-BIND-008-07` [Working-branch design, 2026-10-26](#working-branch-design-2026-10-26) | [hpx.native.application.publication](../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-008-08` [Creation origin and placement — HPX-OWNER-048](#creation-origin-and-placement--hpx-owner-048) | [hpx.native.domain.exact](../06-subsystems/diagrams/pure-domain.c4) · `HPX-CAN-010` · [c3_pure_domain](../04-architecture/navigation.md) · consumers: none |
<!-- contract-bindings:end -->

## Common metadata

- **ID:** `HPX-DOM-001`
- **Title:** Core Object Model
- **Purpose:** Distinct intellectual identities, content, events and views; multi-user product scope and bounded current writer evidence.
- **Level:** `05-domain`
- **Status:** `proposed`
- **Maintainer:** project owner; current specification maintenance
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../02-governance/registers/requirements.csv>); application code remains unchanged
- **Verification:** current metadata, source-authority and contract-link validation; software/proof evidence is separately scoped
- **Decision/history:** current governing owner decisions and stable source identities
- **Last reviewed:** 2026-11-02

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../04-architecture/diagrams/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

Container responsibility for the shared API, workspace-local users and the distinction between identity, unlock and permission is canonical in [C2 / HPX containers](../04-architecture/diagrams/containers.c4), HPX-CAN-008. The [accepted shared API contract](../06-subsystems/interfaces/browser-runtime.md) retains precise enforcement obligations (HPX-OWNER-029–033; HPX-RQ-037–038).


Formal meanings do not imply every type or operation is implemented. See implementation discrepancies and requirement evidence separately.



## Entities and identities


### Core object model

Source `HPX-SRC-0023`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: accepted local implementation design, 2026-10-25. Implementation evidence belongs in the data reference and development state.

### Identity and representations

Source `HPX-SRC-0023`, original lines 5–16. Source-linked obligations with scoped retention, transformation or owner qualification; see the clause dispositions for `HPX-SRC-0023-S002`. Original dates and implementation observations remain historical evidence.

Workspace's storage/key-boundary meaning is defined on the existing encrypted workspace in [C2 / HPX containers](../04-architecture/diagrams/containers.c4), HPX-CAN-008. Principal, device and group identities are distinct from authentication sessions and grants. A principal may represent a human, agent or organisation; display names are mutable labels, not identifiers or authority. Actor kinds and required multi-user scope are defined in [C1 / System context](../04-architecture/diagrams/context.c4), HPX-CAN-007. The current catalog records one owner/device and lacks the required multi-user/AI mutation mechanisms; that is development evidence, not an identity cardinality rule. Chat prompts/context/responses are nodes under ordinary graph/version/history semantics; their record representation remains to be designed. Remote access remains gated. See [baseline contract](../06-subsystems/ai-collaboration.md).

The source-era generic principal wording above does not introduce an organisation/group user container or cross-workspace identity reuse. HPX-OWNER-030/031/033 govern current workspace-local human/machine users; device/group/organisation record and authority mechanisms remain undefined here.

[M1 conceptual identities](diagrams/identity-closure.c4) now define Node and its immutable same-node Revision (HPX-CAN-018). Document is a named composition identity, not a plaintext file. Branch is an independently identified evolving selection. Occurrence is a placement, distinct from content and preserved on moves. Manifest is immutable ordered structure. Snapshot closes an exact manifest plus occurrence-path-specific revision bindings; it must never resolve using current heads. Repeated nested uses require distinct full occurrence paths.

Hyperedges are identifiable revisioned relationships with ordered, role-labelled participants; participants may reference content, exact revisions, anchors or other relationships. Binary UI arrows are a subset, not a storage restriction. Predicate identity and definition are independent of overlapping browsing tags. Assertion is an attributed claim using such a predicate with negation, certainty, attribution and context; it is not a truth judgement or authority grant.

Event records an attributable semantic operation and causal inputs/results. Commit is its atomic publication boundary. Transformation events describe cross-identity fork/split/merge/extraction; same-identity revision parents must never be used for these origins. Interaction records observable human/agent exchanges independently of resulting contributions. Observed, declared and inferred provenance remain distinct. Adoption is not verification, authorship or endorsement.

The derived-presentation meaning of View is defined on the C1 system-to-human output (HPX-CAN-007); browser responsibility and permission-checked projections are defined in [C2 / HPX containers](../04-architecture/diagrams/containers.c4), HPX-CAN-008. Concepts, questions, arguments, comments and external sources are specialised entities rather than new storage engines.

### Local vertical slice

Source `HPX-SRC-0023`, original lines 17–26. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The first integrated writer supports multiple independent documents, each with one branch, one immutable root manifest and one content occurrence referencing one whole-Markdown node. A source binding owns the entire exact buffer. This is deliberately an explicit supported ownership contract; it must reject generic multi-owner save/reuse rather than flattening them. Heading/sentence boundaries are views, not physical nodes created on every keystroke.

Draft is mutable recoverable state bound to document, branch, base revision, principal, device, generation and acknowledged local sequence. Draft saves create no immutable revision. Explicit commit creates a new same-node revision, closed snapshot, semantic commit event and branch update atomically, and rebases that draft without deleting newer browser typing. Prior revisions remain readable. History has no automatic retention/pruning limit.

Anchor binds an exact revision and half-open UTF-8 byte range; both endpoints must be scalar boundaries. Browser selections use UTF-16 code units and require checked conversion against that exact buffer. CRLF, Unicode normalization and whitespace are never silently changed. Deleted/edited anchors become unresolved or explicitly remapped; heuristic matches cannot become silently accepted facts. Future CRDT-relative positions can supplement exact historical anchors without changing them.

IDs are opaque independent OS-random bytes, generated at application/storage boundary. Local implementation uses 32-byte logical IDs and 16-byte workspace IDs; they are not timestamps, content digests, physical addresses or federation authority. Typed Rust wrappers prevent accidental cross-kind substitution. Domain code remains pure; ID generation is outside it.

### Explicit exclusions

Source `HPX-SRC-0023`, original lines 27–29. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The initial durable slice does not implement live coediting, branch merge, shared-node editing, relationship/comment persistence, interaction capture, keychain unlock, client-held mode or federation. Their identities and invariants must remain representable, but no empty service or success placeholder is required. Client-held mode remains unavailable. Retained history is not silently discarded; future lawful redaction/erasure requires a separate policy and migration design.

This is the initial slice's historical exclusion list, not current product or container scope. In particular, [ADR014](../04-architecture/decisions/0014-keychain-unlock-policy.md) adopts optional explicit keychain enrollment with passphrase recovery; comments and bounded branch work have later evidence in [current development state](../09-guides/reference/DEVELOPMENT_STATE.md#current-scope-and-evidence-summary). The one-branch wording above is likewise historical, superseded for current branch design by [ADR018](../04-architecture/decisions/0018-initial-local-branches.md) and [ADR019](../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md). None implies delivery of full composition, multi-user/MCP, client-held mode or federation.

### 1. Distinct record identities

Source `HPX-SRC-0026`, original lines 13–30. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

| Proposed type | Meaning | Stability / relationships |
|---|---|---|
| `NodeId` / `Node` | Logical content/composition identity | Stable through edits; fork/extraction creates a new identity |
| `RevisionId` / `Revision` | Immutable state/event of one node | Same-identity parent DAG, payload reference and immutable actor/action attribution |
| `OccurrenceId` / `Occurrence` | Placement of content within an evolving composition | Distinct for repeated uses; preserve identity on move; binding context disambiguates repeated nested subtrees |
| `ManifestRevision` | Immutable ordered occurrence/local-content structure | Structural changes append history; does not duplicate constituent revision histories |
| `TransformationId` / `Transformation` | Multi-input/output derivation event | Ordered exact source/result revisions, ranges, output mappings and operation parameters |
| `SnapshotId` / `ResolvedSnapshot` | Closed exact document state | Root manifest, occurrence-context bindings and reconstruction profile; no hidden latest-head lookup |
| `CommitId` / `Commit` | Atomic publication/audit boundary | Causal dependencies and affected-head preconditions; local storage order is not global federation time |
| `DraftId` / `Draft` | Mutable recoverable editing state | Actor/device/branch/base/generation/checksum-bound; separate from immutable history |
| `PrincipalId`, `DeviceId`, `GroupId` | Authenticated actor, signing client and collaboration scope | Distinct from hosting instance and local workspace IDs |
| `SecurityPolicy` / epoch | Authenticated authority and key-custody rules | Mode changes require authority and keys; configuration alone cannot grant decryption |
| `PrivateDigest`, `StorageObjectId` | Internal plaintext commitment and physical ciphertext lookup | Do not conflate with logical revision IDs; deduplication and metadata disclosure are encryption-domain decisions |

Identifier algorithms and serialization must be selected together with canonical signing/encryption rules. No domain identifier generation algorithm has been selected yet. Content equality is neither identity equality nor permission to disclose cross-domain existence.

The no-algorithm-selected sentence retains the proposed source's scope; it does not revoke the separately recorded local OS-random implementation above or select future signing/encryption rules. Container-level logical identity versus physical ciphertext addressing/disclosure is canonical in [C2 / HPX containers](../04-architecture/diagrams/containers.c4), HPX-CAN-008; the typed records and exact rules in this section remain supplemental.


## Source provenance

- `HPX-SRC-0023` — `Specifications/CORE_OBJECT_MODEL.md`, lines 1–4; SHA-256 `0f49701674dc75f229cddfe447d9432706badbecbb0556823534d101b356e489`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0023` — `Specifications/CORE_OBJECT_MODEL.md`, lines 5–16; SHA-256 `0f49701674dc75f229cddfe447d9432706badbecbb0556823534d101b356e489`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0023` — `Specifications/CORE_OBJECT_MODEL.md`, lines 17–26; SHA-256 `0f49701674dc75f229cddfe447d9432706badbecbb0556823534d101b356e489`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0023` — `Specifications/CORE_OBJECT_MODEL.md`, lines 27–29; SHA-256 `0f49701674dc75f229cddfe447d9432706badbecbb0556823534d101b356e489`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 13–30; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../02-governance/registers/source-manifest.csv>); archive is local/ignored.

## Working-branch design, 2026-10-26

The owner requested designing pending edits as private working branches and subsequently adopted [ADR019](../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md): an explicitly typed working branch, mutable recoverable buffer and immutable exact checkpoint only when a provenance operation requires retained source. Checkpoints are unpublished evidence with distinct typed source identities; ordinary autosave remains acknowledgement rather than Commit. Named child creation retains the accepted ADR018 committed-snapshot policy. The earlier proposal-only label is superseded by ADR019's explicit adoption; acceptance remains distinct from the bounded implementation evidence in current development state. These lower-level definitions remain here pending a later authorised migration stage.



## Creation origin and placement — HPX-OWNER-048

The universal accepted creation precondition is defined in [M1 identity/closure](diagrams/identity-closure.c4) and applied before creation effects in [O2](diagrams/placement-effects.c4), HPX-RQ-039. [Owner provenance](../02-governance/OWNER_DECISIONS.md#known-creation-origin-and-contextual-placement--2026-11-01) records the explicit instruction. These supporting distinctions constrain its interpretation:

| Context | Meaning and boundary |
| --- | --- |
| Creation origin | The known initiating context from which the new node's parent or position is determinable. Every node kind is covered; missing or ambiguous context prevents creation rather than licensing an arbitrary default. |
| Structural parent/position | Placement in the applicable creation context. A non-root occurrence has its structural parent in that resolved composition; a root still has a determinable initiating position/context without a fabricated structural parent. This adopts no container kind or position encoding. |
| Logical identity and occurrence/use | Reusable content identity remains distinct from each placement. Known creation origin does not require one permanent containment parent; later move/reuse does not erase that distinction or rewrite exact historical use contexts. |
| Same-node ancestry and derivation | Revision parents remain exact same-identity DAG edges. Fork/extraction records cross-identity derivation separately; creation position is neither a revision-parent edge nor proof of derivation. |
| Actor and authorship | The creating operation's actor/context is not evidence of original authorship of imported/reused text. Existing attribution and permission distinctions remain. |
| UI, caret and machine context | UI actions must bind their initiating view/position or exact caret/source context as applicable; machine/other shared-API requests provide an explicit equivalent creation context. Backend validation checks determinacy, exact state and current authority without depending on a literal browser caret. Missing/stale/ambiguous context is not repaired by guessing. The context payload and validation mechanism remain undesigned. |

Known origin does not imply inline textual inclusion syntax. Structural placement may be known without a written token; [M1](diagrams/identity-closure.c4) now owns OWNER051's accepted reconstruction contribution/stop rules, OWNER053 now owns selection meaning in the [precise selection contract](text-and-anchors.md#structural-membership-and-exact-partial-fragments--owner053), while exact structural/source acquisition, endpoint representation and physical encoding remain unresolved. No originless graph-node case is inferred. Preserve exact UTF8/UTF16 mappings whenever caret coordinates are used. Ordinary draft acknowledgement, Commit, history, recovery, current workspace-user permissions and source-only reconstruction scope continue; this requirement selects no record format or general creation API.
