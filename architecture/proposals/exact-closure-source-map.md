# Exact closure and owned-source maps — design proposal

**Status: proposed mechanism; partially resolved owner review, not implemented.** Prepared at the owner's request on 2026-10-30 for HPX-GAP-004. HPX-OWNER-041 accepts cyclic saved inclusions, finite warned automatic expansion, deliberate navigation, required unproved Lean obligations and read-only-before-editing sequencing. HPX-OWNER-043 accepts an explicit per-inclusion logical version list, source-only reconstruction and a configurable Ask / Automatic latest timestamp policy with potential-conflict markers and comparison-modal links. OWNER044 resolves HPX-recorded Commit time,ties ask,per-user Ask default and shared marker lifetime. OWNER045 selects the finite table/use tree and structural recurrence/boundary semantic basis. Physical encoding,timestamp precision/missing values and detailed marker/resolution mechanisms remain unadopted. This proposal does not enable general composition editing.

**Current selected semantic basis (OWNER045):** use the [finite selected-state table and finite occurrence-use result](finite-cycle-closure-state.md), including exact stopped-cycle targets/ancestor witnesses, with the [candidate Lean plan](finite-cycle-lean-plan.md). This refines the earlier flat path-addressed sketch below: a logical per-inclusion list is finite under the accepted stopping rule, not an enumeration of infinitely many cyclic paths. Descriptor equality and semantic boundary witnesses are accepted under OWNER045; physical encoding and other explicitly open mechanisms remain proposed. Initially target pinned, read-only composite reconstruction; retain current whole-owned-buffer editing. General Live resolution and multi-owner mutations remain later capabilities, not product exclusions.

The proposed first slice stays within one workspace and current trusted-server custody. Cross-workspace inclusion, user/permission reuse and client-held custody are not enabled by a closure or source map; they require their own adopted identity, key and policy designs.

## Existing obligations and scope

The [conceptual identity/closure definition](../Conceptual/identity-closure.c4) and [current coverage](../audits/dom001-current-coverage.md) remain canonical in their existing bounds. This proposal refines an unadopted mechanism; it does not replace their definitions.

| Retained obligation | Source |
| --- | --- |
| Logical identity differs from revision and placement; non-root resolved occurrences have one structural parent; moves preserve placement identity. | [Core model](../../docs/05-domain/core-object-model.md), [document semantics](../../docs/05-domain/document-semantics.md) |
| Closed snapshots bind the root, every required reachable selection, full occurrence context and all reconstruction inputs; historical reconstruction never follows current heads. | [Document semantics](../../docs/05-domain/document-semantics.md), [navigation contract](../../docs/06-subsystems/interfaces/domain-navigation.md) |
| Exact source bytes/line endings, owner kinds, ranges and local sequence must be preserved; conversion from browser UTF16 is checked against the exact identified text. | [Text/anchor contract](../../docs/05-domain/text-and-anchors.md) |
| Application authorization and expected-state checks precede atomic publication; acknowledgement differs from Commit; uncertain outcomes reconcile the original intent. | [Publication contract](../../docs/07-implementation/protocols/draft-publication.md) |
| Historical text snapshots exclude semantic assertions under the adopted first policy; retrospective overlays have separate exact context. | [ADR010](../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md) |
| Private checkpoints have distinct unpublished source identities; adoption is separate from format/implementation acceptance. | [ADR019](../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) |
| Authentication, workspace unlock and workspace-user permission differ; permissions are currently enforced at use, not supplied by a snapshot/map token. | [Shared API](../../docs/06-subsystems/interfaces/browser-runtime.md), [chat/MCP contract](../../docs/06-subsystems/ai-collaboration.md) |

The current `SnapshotBinding` has a path, node and revision in [domain records](../../crates/domain/src/records.rs); that is bounded data, not a complete resolver/source-map implementation. Existing persistence has versioned adapter wrappers and a bounded whole-document slice. Neither is acceptance of the candidate structures below.

## Alternatives

| Design | Benefits | Costs / failure boundary |
| --- | --- | --- |
| **A. Finite root-relative use list plus selected-state references — current candidate** | Explicit exact binding for each finite expanded or stopped-cycle use; retains exact boundary targets. [Finite-state refinement](finite-cycle-closure-state.md) separates reusable selected state from path context. | Use count grows with expanded uses, not only unique records. State equivalence/boundary witnesses need review/proofs; work/output limits cannot be silently treated as cycle boundaries. |
| B. Shared nested closure objects | Can reuse identical descendant selections and reduce repeated closure metadata. | Requires an additional closure-object identity/format, complete pin semantics and composition/validation rules. Equal manifests may still need different descendant closures. This introduces more mechanisms before the first general resolver is established. |
| C. Store selections as rules and resolve on read | Smaller stored selection descriptions; convenient current/live views. | Re-reading mutable heads/queries/providers cannot reconstruct exact history. Freezing every resolution input would turn it into an explicit closure mechanism again. Reject as the sole authoritative historical representation. |

A may later be encoded or cached in chunks after separate review. The initial semantic design must not depend on deduplication, a Merkle scheme or a particular database index. Payload reuse is not identity equality or permission to disclose another encryption domain's existence.

## Candidate logical closure

The following is a semantic record sketch, **not Rust code, wire JSON or a persistent schema**:

```text
ClosedComposition
  logical snapshot identity
  exact root composition identity + root manifest revision
  entries keyed by (this closure root, full occurrence path)
    logical target / owner kind and identity
    exact content revision and/or exact composition-manifest selection
    ordered structural context needed for this use
  exact reconstruction profile + retained resource references
  explicit inclusion scope (initially text; semantic overlays separate)
```

An entry can describe content, composition-local prose or an expanded composition use; this sketch does not adopt new entity kinds or reinterpret an existing ID field. Domain ADRs must resolve concrete type distinctions before persistence. The empty path identifies the root context; child paths append the occurrence identity from their selected parent structure. Entries contain exact selections, never an unresolved “latest” instruction.

Required validation for candidate A:

- Every required expanded use has exactly one entry with a complete root-relative path. Two uses may share node/revision/manifest bytes while having different paths or descendant selections.
- Each non-root entry agrees with its selected parent's immutable ordered occurrence structure. One placement cannot acquire multiple structural parents in a resolved context. A repeated nested occurrence ID in **different full paths** is not globally rejected merely for appearing twice.
- Every selected revision/manifest belongs to the stated logical target/context. Referenced payloads and reconstruction resources are present, authenticated and within authorized scope before complete publication/read success is reported.
- An exact revision pin and a complete descendant-closure pin are distinct inputs. An imported closure pin must be expanded/composed into correct root-relative entries, or rejected as unsupported; a pinned manifest alone does not silently pin descendants.
- Missing, extra/unreachable, duplicate-path, mismatched or ambiguous entries reject a candidate presented as complete. Diagnostic partial results may be explicitly incomplete/read-only; they are never a closed snapshot or a silent successful export.
- Historical reconstruction reads only this closed selection and exact retained resources. It neither refreshes citations nor follows newer heads, mutable queries or current provider responses.

No numeric capacity limit is selected here. The implementation must separately bound loaded objects, expanded entries/path depth, bytes, work, resource reads and emitted output; charge repeated occurrences and fail explicitly rather than prune history or omit required bindings.

### Repeated/nested example

Document D includes the same nested manifest M at outer placements `a` and `b`. M contains placement `x` of P:

| Snapshot | Full path | Exact selection |
| --- | --- | --- |
| S1 | `[a,x]` | P revision p1 |
| S1 | `[b,x]` | P revision p1 |
| S2 | `[a,x]` | P revision p2 |
| S2 | `[b,x]` | P revision p1 |

M and the local occurrence `x` can be identical in all four rows. Keys based only on P, M or `x` lose information. Reading S1 after p2 exists still emits p1 twice. Moving a placement preserves its identity but changes its root-relative context in the **new** structural state; no old path or snapshot is rewritten. This example is illustrative and creates no records.

## Planning, cycles and publication

Application coordination obtains a bounded, authenticated, consistent read view and checks the acting workspace user's relevant operations. Storage adapters decode/verify versioned records. They supply immutable descriptors, exact selection inputs and any explicitly staged result descriptors to a pure planner. The planner has no database/network access, entropy, serialization or permission authority. Application/storage allocate IDs and stage any new immutable objects.

Recommended initial algorithm: bounded iterative traversal of supplied ordered structure; record each root-relative expanded use; resolve all allowed selections into exact immutable references; validate complete coverage and exact resources; return a closure plan or explicit unresolved/invalid/budget result. Pure validation consumes already supplied descriptors; application code obtains any missing dependencies through the ordinary authorized boundary and reruns/reconciles against the same frozen intent. Do not make a domain “loader callback” an authorization/I/O shortcut.

**Cycle behaviour is now accepted under HPX-OWNER-041.** Follow the [precise policy](../../docs/05-domain/hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041): cyclic inclusion relationships may be saved; stop automatic expansion at exact explicit boundaries, warn, and permit deliberate bounded navigation. Finite historical inclusion and repeated siblings remain valid. The earlier logical-identity/role-only rejection recommendation is withdrawn. A visited-object cache, logical identity alone or ever-growing occurrence path cannot choose the semantics of recurrence. Exact state equivalence, finite boundary representation and algorithm remain design work.

The flat-closure sketch above must be refined to represent cycle-closing dependencies without infinitely enumerating occurrence paths. A successful result must retain exact boundaries and all required selections under that rule; it cannot simply omit cyclic edges or present an exhausted traversal as complete. This remains a semantic obligation, not adoption of a marker record or schema. [Lean boundary/termination, completeness and navigation-state proofs](../../docs/07-implementation/formal-invariants.md#required-cycle-aware-expansion-proofs--hpx-owner-041) are required and unproved; the existing Kahn validator still has only its earlier acyclic-input role.

The [next bounded state proposal](finite-cycle-closure-state.md) now defines a candidate descriptor equality, exact boundary witnesses, finite result outcomes and the required worked cases. [Its proof plan](finite-cycle-lean-plan.md) identifies what must be proved before claiming correctness. Neither document adopts the mechanism or supplies a checked theorem.

For publication, freeze root/branch/draft context and every exact selection/source-profile/resource input,with current authority and expected-state rechecks. OWNER043/044 adopt the [Ask / Automatic latest timestamp policy](../../docs/06-subsystems/frontend-interaction.md#changed-source-conflict-handling--hpx-owner-043):use HPX-recorded Commit time,ask on ties,and keep the preference per workspace user with Ask as default. Automatic choice marks the affected sentence/paragraph/section with a comparison-modal link. All authorised viewers of the affected committed version see its marker until an authorised explicit resolution;opening the modal does not clear it. Private drafts remain private. This is neither proof of resolution nor automatic Commit. Timestamp precision/encoding,missing/incomparable values and marker/resolution representation remain open. A pinned immutable dependency remains exact despite later heads changing;frozen submitted operations and receipts cannot be retargeted.

Publish new objects, the complete closure, selected head/draft changes, semantic event and original receipt within the existing application's required atomic boundary. If the caller cannot establish that complete boundary, fail rather than publish a “closed” result with missing members. Preserve newer browser typing and settle unknown outcomes through the original operation. SQLite/WAL alone proves neither closure nor authenticated provenance.

## Candidate source map

Derive an ordered source map from an exact closure plus an exact projection profile. Treat it as reproducible derived data; an optional cache is discardable and must be revalidated. It is not another authoritative content store or a persisted grant.

Each nonempty output segment describes:

```text
output UTF8 half-open range
segment class: exact copied source | generated/read-only
for copied source:
  owner kind/id + exact revision/manifest-local source identity
  full occurrence path + source UTF8 half-open range
projection context and, for draft overlays, exact owner/base/generation/sequence
```

For the initial editable class, copied output bytes must equal the indicated exact source bytes, with scalar-boundary endpoints; CR/LF/CRLF and Unicode normalization remain untouched. Generated separators, labels or transformed output have explicit read-only classification. Non-isometric transformed text cannot be advertised as directly editable using a guessed affine map. HTML/math/table display coordinates need a separately checked presentation mapping back to the exact source projection.

Segments form an ordered, gap-free, non-overlapping partition of the output bytes; generated segments cover any bytes without an original source. Preserve separate segments for repeated uses and discontiguous ranges even when owner/revision IDs match. An empty source or caret at a boundary is handled by an explicit insertion-site result, not an invented zero-width ownership span. Boundary bias and intended owner must be resolved; ambiguity is an error, not a choice made by “nearest text.”

The application attaches current authorized operation hints after constructing the map. Those hints and any opaque projection/state token are not durable permissions. Revalidate current workspace-user authority, exact map/source context and expected state on every protected action, including history and receipt replay. Do not trust a client-supplied map or relabel an old map with a new local sequence.

### Editing and draft boundary

| Situation | Recommended first behavior |
| --- | --- |
| Existing exact whole-owned buffer | Retain its current acknowledged-generation/base/sequence contract; no generic multi-owner full-buffer replacement. |
| Pinned composite/transcluded source | Read-only by default. Explicit **Go to source / Edit source** requires source authority and clear shared-source intent; **Fork** requests independent identity. A path identifies a use, not an independent copy of its content owner. |
| Multiple owners or generated bytes in a mutation selection | Reject mutation in the initial composite slice. A future explicit multi-owner plan must name all exact ranges/owners and recheck them atomically; this map does not implement it. Ordered read/quote fragments can retain exact per-component context. |
| New typing after a captured request | Keep a draft-local binding to the intended owner/base; never fabricate a revision ID. Rebase through validated local operations at the exact generation/sequence or report stale/unsupported. |
| Browser UTF16 selection | Check conversion against the exact identified projection buffer, then resolve source/context. Reject split-surrogate/scalar endpoints, stale context and ambiguous ownership. |

A source edit may affect other permitted live uses of that logical owner; it must not be disguised as editing only the visible placement. Conversely, typing in a destination must not silently mutate shared source. General composite editing remains a separate acceptance gate.

## Reconstruction profile and compatibility

HPX-OWNER-043 selects identical source text and included versions as the first reconstruction guarantee. Visual appearance, font rendering and typesetting are external to it; retaining a historical visual rendering environment is not required for this source-only guarantee. Retain exact source-emission inputs and citation/resource selections where they affect source bytes, under current confidentiality/permission rules. A separate future visual-reproduction capability would need its own explicit resources/guarantees. Projection maps still bind their actual exact text/profile; a changed display cannot reuse a stale source map.

Recommend starting with the existing text scope and separately selected exact ADR010 overlays. Do not expand old text snapshots to include today's semantic assertions. Different output profiles may derive different maps from one closed state; cache keys therefore include the exact closure, profile/resources and draft context where applicable. No public plaintext fingerprint, new ID algorithm or deduplication policy is selected.

Adoption of the logical design must **not** accept a persistent format. Before real-data writes:

1. Specify adapter-owned DTOs/codecs, explicit record version/kind and feature/capability boundaries. Never add serialization dependencies to pure domain or put checkpoint IDs into revision fields.
2. Decide an explicit compatibility strategy for readers unable to reconstruct/edit general closures. Preserving unknown optional ciphertext is insufficient if an old reader can overwrite affected heads or publish incomplete new state. Refuse unsupported operations or require a separately approved backed-up upgrade; do not claim that option as already supported.
3. Keep existing database/envelope/protocol versions and old snapshot bytes unchanged until an explicit format decision. No silent migration or reinterpretation; no copy of private workspaces for proposal validation.
4. First validate logical planning/maps in disposable synthetic fixtures. A proof-of-concept must remain clearly gated; existing application capabilities are not broadened by this document.

## Validation and review gates

**Planned tests, not executed here:** repeated/nested divergent closure bindings and old-snapshot reconstruction after head changes; local prose versus shared owners; content-only edits without artificial parent-manifest history; missing/extra/wrong-kind/wrong-owner/corrupt dependencies; recursive expansion versus permitted reference cycles; repeated sibling expansion; path/work/output exhaustion; pinned versus changed-followed-head behavior; exact renderer/resource changes and ADR010 overlays.

Map/operation tests must include empty text, generated separators, multiple owners, repeated identical text, insertions at boundaries, discontiguous ranges, non-ASCII/combining characters/supplementary scalars, LF/CRLF/CR and transformed widgets; stale maps/draft sequence, delayed/lost ACK, permission revocation before reads/replay/publication, crash/restart and no partial publication. After a format proposal, require actual compatibility and older-reader scenarios, including fail-closed unsupported writes. Record only checks actually run; no whole-system proof claim follows.

### Decisions requested at owner review

| Choice | Recommendation | Consequence of adoption |
| --- | --- | --- |
| Logical representation | OWNER043 accepts an explicit logical list of exact versions at every inclusion position, including exact cycle-boundary targets. | Concrete record/encoding, boundary representation and implementation remain open; no persistent format adoption. |
| Initial capability boundary | Read-only before editing is approved sequencing; pinned reconstruction remains the recommended first technical slice. Retain current whole-owned editing and ADR010 overlays. | Approval of sequencing does not adopt representation, waive complete cyclic-boundary handling or remove future editing requirements. |
| Expansion-cycle policy | Accepted HPX-OWNER-041: allow saved cyclic inclusions and finite historical inclusion; stop automatic expansion at warned exact boundaries with deliberate bounded navigation. | Behaviour accepted; exact state key/boundary representation and required Lean proofs remain unimplemented/unproved. |
| Reconstruction guarantee | OWNER043 accepts identical source text and selected versions; appearance/font rendering/typesetting are external. | Exact source-emission dependencies remain; visual reproduction is outside the first guarantee. |
| Followed-head changes during planning | OWNER043/044 accept Ask / automatic HPX-recorded Commit time;ties ask. Per-workspace-user preference defaults to Ask. The marker/comparison link is shared with authorised viewers of the affected committed version until explicit authorised resolution. | Timestamp precision/encoding,missing/incomparable values and exact marker/resolution mechanics remain open;no runtime/storage implementation is implied. |
| Persistence rollout | Defer byte/schema/capability acceptance until a concrete compatibility ADR and evidence. | Keeps current workspaces/runtime unchanged; proposal approval alone cannot enable writes. |

The other tracked gaps—general user/permission administration, chat/MCP records, authenticated policy epochs/key custody and formal correspondence—remain open. This proposal grants no new inference, actor, ACL or plaintext egress path. Only the explicitly recorded OWNER041/043/044 choices are accepted; remaining mechanisms still require review.
