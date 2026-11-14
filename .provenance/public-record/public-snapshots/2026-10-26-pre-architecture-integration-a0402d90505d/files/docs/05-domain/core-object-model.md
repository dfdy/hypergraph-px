# Core Object Model

## Common metadata

- **ID:** `HPX-DOM-001`
- **Title:** Core Object Model
- **Purpose:** Distinct intellectual identities, content, events and views; one-owner initial writer scope.
- **Level:** `05-domain`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Formal meanings do not imply every type or operation is implemented. See implementation discrepancies and requirement evidence separately.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Vocabulary and mathematical notation

Distinct intellectual identities, content, events and views; one-owner initial writer scope. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Entities and identities



### Core object model

Source `HPX-SRC-0023`, original lines 1–4. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: accepted local implementation design, 2026-10-25. Implementation evidence belongs in the data reference and development state.

### Identity and representations

Source `HPX-SRC-0023`, original lines 5–16. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Workspace is the storage/key boundary. Principal, device and group identities are distinct from authentication sessions and grants. A principal may represent a human, agent or organisation; display names are mutable labels, not identifiers or authority. Initial workspace ownership is one human with one recorded device. Remote access and agent mutation remain unavailable.

Node is stable intellectual content identity; Revision is an immutable same-node content state. Document is a named composition identity, not a plaintext file. Branch is an independently identified evolving selection. Occurrence is a placement, distinct from content and preserved on moves. Manifest is immutable ordered structure. Snapshot closes an exact manifest plus occurrence-path-specific revision bindings; it must never resolve using current heads. Repeated nested uses require distinct full occurrence paths.

Hyperedges are identifiable revisioned relationships with ordered, role-labelled participants; participants may reference content, exact revisions, anchors or other relationships. Binary UI arrows are a subset, not a storage restriction. Predicate identity and definition are independent of overlapping browsing tags. Assertion is an attributed claim using such a predicate with negation, certainty, attribution and context; it is not a truth judgement or authority grant.

Event records an attributable semantic operation and causal inputs/results. Commit is its atomic publication boundary. Transformation events describe cross-identity fork/split/merge/extraction; same-identity revision parents must never be used for these origins. Interaction records observable human/agent exchanges independently of resulting contributions. Observed, declared and inferred provenance remain distinct. Adoption is not verification, authorship or endorsement.

View is a derived presentation. Concepts, questions, arguments, comments and external sources are specialised entities rather than new storage engines. Sharing and permission checks apply to every projection.

### Local vertical slice

Source `HPX-SRC-0023`, original lines 17–26. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The first integrated writer supports multiple independent documents, each with one branch, one immutable root manifest and one content occurrence referencing one whole-Markdown node. A source binding owns the entire exact buffer. This is deliberately an explicit supported ownership contract; it must reject generic multi-owner save/reuse rather than flattening them. Heading/sentence boundaries are views, not physical nodes created on every keystroke.

Draft is mutable recoverable state bound to document, branch, base revision, principal, device, generation and acknowledged local sequence. Draft saves create no immutable revision. Explicit commit creates a new same-node revision, closed snapshot, semantic commit event and branch update atomically, and rebases that draft without deleting newer browser typing. Prior revisions remain readable. History has no automatic retention/pruning limit.

Anchor binds an exact revision and half-open UTF-8 byte range; both endpoints must be scalar boundaries. Browser selections use UTF-16 code units and require checked conversion against that exact buffer. CRLF, Unicode normalization and whitespace are never silently changed. Deleted/edited anchors become unresolved or explicitly remapped; heuristic matches cannot become silently accepted facts. Future CRDT-relative positions can supplement exact historical anchors without changing them.

IDs are opaque independent OS-random bytes, generated at application/storage boundary. Local implementation uses 32-byte logical IDs and 16-byte workspace IDs; they are not timestamps, content digests, physical addresses or federation authority. Typed Rust wrappers prevent accidental cross-kind substitution. Domain code remains pure; ID generation is outside it.

### Explicit exclusions

Source `HPX-SRC-0023`, original lines 27–29. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The initial durable slice does not implement live coediting, branch merge, shared-node editing, relationship/comment persistence, interaction capture, keychain unlock, client-held mode or federation. Their identities and invariants must remain representable, but no empty service or success placeholder is required. Client-held mode remains unavailable. Retained history is not silently discarded; future lawful redaction/erasure requires a separate policy and migration design.

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


## Relationships and permitted states

Distinct intellectual identities, content, events and views; one-owner initial writer scope. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Operations and transitions

Distinct intellectual identities, content, events and views; one-owner initial writer scope. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Invariants

Distinct intellectual identities, content, events and views; one-owner initial writer scope. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Unresolved semantics

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Verification/proofs

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0023` — `Specifications/CORE_OBJECT_MODEL.md`, lines 1–4; SHA-256 `0f49701674dc75f229cddfe447d9432706badbecbb0556823534d101b356e489`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0023` — `Specifications/CORE_OBJECT_MODEL.md`, lines 5–16; SHA-256 `0f49701674dc75f229cddfe447d9432706badbecbb0556823534d101b356e489`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0023` — `Specifications/CORE_OBJECT_MODEL.md`, lines 17–26; SHA-256 `0f49701674dc75f229cddfe447d9432706badbecbb0556823534d101b356e489`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0023` — `Specifications/CORE_OBJECT_MODEL.md`, lines 27–29; SHA-256 `0f49701674dc75f229cddfe447d9432706badbecbb0556823534d101b356e489`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 13–30; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.

## Working-branch proposal, 2026-10-26

The owner requested designing pending edits as private working branches now. [ADR019](../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) proposes an explicitly typed working branch, mutable recoverable buffer and immutable exact checkpoint only when a provenance operation requires retained source. Checkpoints are unpublished evidence with distinct typed source identities; ordinary autosave remains acknowledgement rather than Commit. Named child creation retains the accepted ADR018 committed-snapshot policy. This is a new mechanism proposal, not a rewrite of retained source passages or delivered checkpoint functionality.
