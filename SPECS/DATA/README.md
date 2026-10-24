# Data structures and navigation: MU-F technical reference

Status: initial design vocabulary, 2026-10-24. The navigation/type table below remains proposed. The first implemented validator is documented in §9. Proposed names/contracts below will be replaced or linked to actual symbols as implementation proceeds. Domain wire fields and container choices await accepted decisions; the separate crypto envelope adapter is now documented in §10.

Design inputs: [underlying mathematics](Underlying%20mathematics.md), [encryption design](Encryption%20specification.md), and the [new-project reconciliation](../ARCHITECTURE_REVIEW.md). This reference explains mechanisms; a future canonical specification will own product requirements.

## 1. Distinct record identities

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

Identifier algorithms and serialization must be selected together with canonical signing/encryption rules. UUIDv7 was used previously but is not silently fixed here. Content equality is neither identity equality nor permission to disclose cross-domain existence.

## 2. Typed graph projections

- **Occurrence structure:** an ordered rooted forest per resolved document view. Sharing happens through occurrence→content references, not by giving a single placement multiple structural parents.
- **Revision ancestry:** an immutable same-node DAG; divergent revisions remain retained and merge parents cannot name unrelated identities.
- **Transformation provenance:** an incidence graph linking immutable input revisions to an event and that event to output revisions. Source context/ranges matter for split/extraction and ordered multi-source merges.
- **References/semantic links:** a typed directed multigraph; hyperlinks/self-links may cycle. An asserted semantic relation is not proof or permission.
- **Expansion dependencies:** a separately validated projection. The owner confirmed rejection of recursive expansion cycles; hyperlinks remain a different projection. Untrusted cyclic imports must fail validation rather than become accepted complete states.
- **Snapshot resolution:** a finite context graph recording every required occurrence binding, including nested/repeated and revision/closure-pinned uses.

Store canonical records once and derive graph indexes; do not create one independent authoritative database per projection. Topological dependency order is not authorial reading order. Wall-clock timestamps are display/search metadata, not ancestry or accepted-operation ordering.

## 3. Proposed navigation contracts

All names below are interface sketches. Every query needs an explicit consistent read view or exact snapshot, authorized principal/scope, and resource budget. Historical lookup does not grant current access. Return incomplete/denied/budget errors honestly; do not silently substitute a current revision.

| Proposed operation | Inputs and result | Algorithm / expected baseline cost |
|---|---|---|
| `get_node` / `get_revision` | Authorized identity → verified record | Indexed lookup plus object verification/decoding bytes |
| `children` / `parent_occurrence` | Manifest/context occurrence → ordered placements / exact parent | Adjacency/parent index; cost proportional to returned children after lookup |
| `walk_document` | Resolved root → ordered occurrence/source spans | Iterative traversal, active-path tracking, O(expanded occurrences + emitted bytes) |
| `find_occurrences` | Node and view scope → every permitted placement | Reverse occurrence index and bounded pagination; do not scan/render every document |
| `outgoing_links` / `backlinks` | Identity/revision, edge type, scope → edges | Forward/reverse adjacency indexes; O(lookup + page) |
| `ancestors` / `descendants` | Exact revision or occurrence graph → bounded reachability | O(V + E) over visited projection without an additional index |
| `is_ancestor` / `common_bases` | Exact retained states → ancestry result/candidate bases | DAG traversal with budget; multiple bases remain explicit, not timestamp-selected |
| `derivation_inputs` / `derived_outputs` | Immutable revision/event → ordered origins/results | Forward/reverse event index; preserve original revision rather than following result heads |
| `resolve_snapshot` | Manifest + consistent selected view → complete bindings | Resolve reachable contexts/rules; validate ownership/permission/completeness before publication |
| `reconstruct_snapshot` | Exact snapshot/profile → bytes + ordered source map | No live-head/provider/query lookup; bounded repeated rendering |
| `impact_of_change` | Source revision/rule and scope → affected live dependants | Reverse reachability; pinned historical uses do not advance automatically |
| `history_page` | Node/manifest/snapshot scope + cursor → immutable event page | Indexed causal/local publication order; stable cursor, no retained-history count cap |
| `validate_move` | Exact structure/base, occurrence, destination → valid plan/conflict | Reachability from destination before edge insertion; preserve one parent and order |

Here V/E refer to the traversed authorized projection, not automatically the entire workspace. Physical storage/index choice is unresolved, so logarithmic index access is a design target rather than a benchmarked guarantee. No algorithm avoids output-size cost for a complete rendering. An index must specify its exact scope—current state, retained history metadata, or optional historical full text.

## 4. Planned mutation and recovery boundary

Keep pure planning/validation separate from I/O and grants:

```text
frozen request + trusted actor + exact base/policy
  -> authorize source/target operations
  -> validate/plan complete immutable result and closure
  -> recheck expected heads and policy
  -> durably publish one atomic commit
  -> update recoverable read models/projections
  -> return original action/commit receipt
```

Required behavior to specify and test before enabling writes:

- Revision parents belong to the same identity; new identity origins use transformation provenance.
- Move/reorder preserves placement identity. Remove detaches a use rather than deleting its source history.
- Split/merge plans preserve exact raw source bytes/ranges and ordered contribution mapping, unless the operation explicitly proposes text changes.
- Content-only edits do not duplicate every containing manifest history; historical closed snapshots remain exact.
- Draft autosave changes mutable working state only; explicit commit publishes history. Acknowledged drafts survive crash/rebuild.
- Atomic expected-head checks cover every affected owner/manifest/branch; stale plans conflict without partial publication.
- Exact retries reconcile original outcomes; changed request reuse conflicts. Uncertain acknowledgement is not permission to issue a fresh mutation.
- Full result closure is present before commit visibility. Missing committed data fails integrity checks; current heads are never a historical repair substitute.
- Reject capacity/work exhaustion without silently pruning retained history.

The storage ADR must define fsync/publication order, journal/database authority, writer isolation, crash states, index rebuild, import validation and corruption handling. These contracts are not proved merely by choosing SQLite or a content-addressed object directory.

## 5. Encryption-aware access and execution

Mode-independent domain identities must survive re-encryption and authorized transfer. The encrypted envelope needs version/algorithm/key-epoch identifiers, nonce and authenticated context binding; exact fields are pending security design. Signatures/commitments, encrypted physical lookup and private payload hashes must have separate responsibilities.

Trusted-server mode permits an unlocked Rust service to run plaintext graph queries, compilation and permitted agent context. In client-held mode those operations must run at an authorized client boundary or be explicitly unavailable. The server cannot perform plaintext search simply because its config says it may. Plaintext drafts, indexes, backups, working Markdown, logs and exports are all part of the confidentiality boundary.

Queries must distinguish missing data from inaccessible historical references without leaking unauthorized existence. Decide whether an authorized user may see an opaque reference or whether even the relation must be hidden. Group membership and current read rights are not automatically access to all historical keys. Revocation cannot undo prior plaintext disclosure.

## 6. Formal obligations and implementation correspondence

Candidate initial properties:

1. A valid occurrence move preserves rooted-parent invariants and chosen expansion acyclicity.
2. Successful immutable commit preserves prior revisions and same-identity parent validity.
3. Transformation outputs retain valid ordered inputs/ranges and complete intended output coverage.
4. Reconstruction is a deterministic function of the exact closed snapshot and explicit compiler inputs.
5. An accepted operation satisfies the applicable actor/device/policy authority; configuration cannot create client-only decryption authority.
6. A future conflict resolver is deterministic under its specified causal input/accepted-operation set; encryption delivery order does not define graph validity.

For each theorem record its definitions, preconditions, trusted assumptions, Lean file/symbol, corresponding Rust function and actual checked evidence. Model-only proof, differential tests and Rust extraction proof are separate columns. The first rank/path model proofs are now checked under Lean 4.35.0; see [formal assurance](../../proofs/README.md) and the [validation digest](../../proofs/VALIDATION_DIGEST.md). The unchanged Rust budget helper now has a checked Aeneas-extracted theorem; full graph validation remains unproved. Cryptographic primitives, randomness, host/client integrity and filesystem durability require explicit assumptions and additional validation.

## 7. Worked conceptual example

```text
Node P: revisions p1 -> p2
Document D, manifest m1: occurrence o1 -> P live; o2 -> P pinned p1
Snapshot s1: o1 binds p1; o2 binds p1
Later snapshot s2: o1 binds p2; o2 still binds p1
```

The two placements are different even in s1 when their bytes match. Reading s1 after p2 exists still returns p1 at both placements. Moving o2 keeps its identity. Forking o1 creates a new node Q with a first revision derived from the exact P revision/range, replaces only that placement according to a reviewed plan, and does not relabel P's revisions as Q's parents.

A nested manifest included twice can resolve its descendants differently under two historical closure pins. Its resolution key therefore includes binding context/path, not only the shared manifest revision. A new collaborator permitted to read Q does not automatically receive the decryption keys for all of P's historical provenance.

## 8. Implementation documentation rule

As code lands, replace sketches with real Rust symbol/source links, canonical examples, error enums, query pagination and proof/test references. Record measured complexity/latency separately from expected asymptotics. Each new traversal must state edge projection, ordering, duplicate/cycle behavior, budget, authorization and what ciphertext/plaintext it needs. Each mutation must additionally state identity effects, immutable history, expected heads, provenance and crash/retry behavior.


## 9. Implemented initial Rust API

[`hypergraph_domain::expansion::validate`](../../crates/domain/src/expansion.rs) accepts an explicit vertex list, directed expansion edges and a `Budget { vertices, edges, work }`. IDs are opaque ordered values supplied by the caller; no persistent ID or wire format is chosen. It returns `Validated { vertices, edges, work }` or `Error::{Budget, DuplicateVertex, UnknownVertex, Cycle}`.

The implementation uses iterative Kahn validation and ordered maps. Parallel edges and repeated dependencies are valid. A successful run spends exactly 2V + 2E defined work units, stores O(V + E) data and performs O((V + E) log V) ordered-map work (with a constant empty case). It mutates no input and does not require storage, network, keys or a principal. Its caller must supply the complete correct projection and authorize any records used to build it. It is not a renderer, forest-owner validator, durable commit or permission grant.

Five tests cover repeated/parallel/isolated dependencies, self/long/disconnected cycles, invalid vertex catalogues/endpoints and exact independent budgets. The last exhaustively checks all 512 directed graphs on three vertices against an independent transitive-closure oracle, with reversed input order and input preservation. Actual execution evidence belongs to the issue/work record; these tests are not Lean/Rust correspondence proofs. Separate rank/path model theorems are checked, as documented in the formal-assurance record.

## 10. Implemented encryption adapter boundary

[hypergraph-crypto](../../crates/crypto/README.md) implements `Context`, `Purpose`, `SecretKey::{generate,seal,open,wrap,unlock}`, `StorageAddress` and `storage_address`. Its reference provides exact canonical byte layouts, algorithm/resource costs, errors, authorization responsibilities, plaintext/ciphertext visibility, a synthetic example and tests. [ADR 0002](../../docs/adr/0002-trusted-server-envelopes.md) explains the choices. Logical binding IDs and encrypted physical addresses remain separate; envelope context is supplied by an authorized application, not trusted from the file. These APIs add no graph navigation, history, storage publication, policy grant or client-held encryption. They are tested Rust, not Lean-verified functions.
