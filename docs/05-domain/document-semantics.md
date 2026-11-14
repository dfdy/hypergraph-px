# Document, Branch and Revision Semantics

## Common metadata

- **ID:** `HPX-DOM-003`
- **Title:** Document, Branch and Revision Semantics
- **Purpose:** Occurrences, manifests, revision ancestry, derivation and closed snapshot reconstruction.
- **Level:** `05-domain`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-11-03

## Workspace-local users — owner clarification

User structure is canonical in [C1/C2](../architecture/context.c4) (HPX-CAN-002); [chat/MCP and permission details](../06-subsystems/ai-collaboration.md) remain supplementary contracts.


## Shared user API and per-user permissions

User document, branch, draft and Commit operations enter through the shared user API with user–workspace permissions. Draft acknowledgement remains distinct from Commit; neither UI selection nor an AI tool call grants write authority. Domain semantics remain common to humans and AI users. See the [accepted shared API scope](../06-subsystems/interfaces/browser-runtime.md) (HPX-OWNER-029; HPX-RQ-037–038).


Formal meanings do not imply every type or operation is implemented. See implementation discrepancies and requirement evidence separately.


## Entities and identities

**Reconstruction scope (HPX-OWNER-043):** [M1 closed state](../architecture/Conceptual/identity-closure.c4) now specifies an explicit logical list of the exact version at each inclusion position, including exact cycle-boundary targets. The first reconstruction guarantee is identical source text and included versions; visual appearance, font rendering and typesetting are external to that guarantee. Retain deterministic source-emission inputs and dependencies that affect source bytes; this does not require preserving a visual rendering environment. Physical record/encoding choices remain unadopted. The newer owner scope qualifies inherited renderer/profile wording below without rewriting source provenance.

**Current cycle qualification (HPX-OWNER-041):** [cyclic inclusions may be saved](hypergraph-mathematics.md#accepted-cycle-aware-inclusion-policy--hpx-owner-041). A complete finite reconstruction accounts for exact expanded contexts and explicit cycle boundaries under the frozen stopping rule, rather than infinitely enumerating cyclic occurrence paths. Missing dependencies or exhausted budgets are not cycle boundaries or complete closure. Exact boundary/state encoding remains unadopted; immutable revision ancestry and historical selections are unchanged. Source passages below retain their provenance subject to this qualification.


### Identities, occurrences and temporal state

Source `HPX-SRC-0025`, original lines 20–27. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Distinguish logical content, immutable revision, placement occurrence, manifest revision, transformation event, snapshot, atomic commit, draft, principal, device and group. Physical encrypted addresses and private content commitments are separate again. Equal text does not imply equal identity; re-encryption does not create a new logical revision.

An occurrence references a logical content identity. Two occurrences may reference the same content while retaining different placement order, parent, metadata and revision/closure selection. In a resolved composition, each non-root occurrence has exactly one structural parent. Moving a placement preserves its identity; reusing content creates a distinct placement. Removing one placement does not erase its source or retained history.

An immutable manifest captures ordered structure and document-local prose independently of separately versioned constituent content. Content-only edits must not manufacture a new manifest history in every containing document. Ordering representation remains a mechanism decision; vectors, fractional keys and sequence CRDTs must not be treated as equivalent concurrency guarantees.

### Closed snapshots and source ownership

Source `HPX-SRC-0025`, original lines 34–43. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

A snapshot binds an exact root manifest, every reachable content/manifest selection and all reconstruction inputs. Its binding key includes the occurrence context/path needed to distinguish repeated nested inclusions; a map keyed only by content ID, occurrence ID or shared manifest revision is insufficient in general. A revision pin and a complete nested closure pin have different semantics and need explicit representation.

Example: document D uses paragraph P twice as placements o1 and o2. Snapshot s1 binds both to p1. After P advances to p2, snapshot s2 may bind o1 to p2 and o2 to p1. Reading s1 still selects p1 twice. If the same nested manifest is included in two contexts, each context may have a different closed descendant selection without changing source identity.

Reconstruction is a deterministic function of the closed snapshot and explicit rendering/compiler inputs. Never follow current heads, rerun mutable queries or refresh external citation metadata during historical reconstruction. Exact export requires a bound renderer/compiler profile and citation/style resources. Missing or inaccessible dependencies are explicit failures/incomplete results, not permission to substitute another revision.

Whole-document rendering must produce an ordered source map distinguishing shared node revisions, document-local prose, repeated occurrences and nested inclusion contexts. Caret/selection edits must map to exact intended owners and byte ranges; ambiguous ownership must not silently edit every reuse.

### Workspace composition, anchors and semantic entities

Source `HPX-SRC-0025`, original lines 53–59. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Collections organize membership without embedding; versioned composite works reuse manifest/occurrence semantics to assemble independent documents. The concrete entity-kind encoding remains undecided. Exact snapshot closure includes ordered chapter revisions and repeated nested contexts; a pin on one revision alone does not necessarily pin its descendants.

Revision-bound anchors identify partial/overlapping ranges without creating overlapping composition children. Explicit promotion preserves visible bytes and earlier snapshots. Ordered multi-owner ranges retain per-component identity, revision, occurrence context and coordinates. Every fork creates a fresh identity and exact transformation event; repeated fork pastes derive from the captured revision, not a later head. Clipboard entries reference sources as protected private state, not canonical derivation events until an actual derivation occurs.

Concepts, propositions and assertions are ordinary identifiable revisioned entities. Role-labelled reference edges encode n-ary assertions; namespaced semantic predicates cannot masquerade as structural commands. Proposed/accepted/rejected/superseded states carry context and actor evidence, not universal truth. Snapshot inclusion profiles bind exact reference/assertion state separately from later retrospective overlays. See [workspace interface](<../06-subsystems/document-engine.md>) for behavior and unresolved format gates. These are proposed obligations, not newly proved or implemented types.

### 7. Worked conceptual example

Source `HPX-SRC-0026`, original lines 113–125. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

```text
Node P: revisions p1 -> p2
Document D, manifest m1: occurrence o1 -> P live; o2 -> P pinned p1
Snapshot s1: o1 binds p1; o2 binds p1
Later snapshot s2: o1 binds p2; o2 still binds p1
```

The two placements are different even in s1 when their bytes match. Reading s1 after p2 exists still returns p1 at both placements. Moving o2 keeps its identity. Forking o1 creates a new node Q with a first revision derived from the exact P revision/range, replaces only that placement according to a reviewed plan, and does not relabel P's revisions as Q's parents.

A nested manifest included twice can resolve its descendants differently under two historical closure pins. Its resolution key therefore includes binding context/path, not only the shared manifest revision. A new collaborator permitted to read Q does not automatically receive the decryption keys for all of P's historical provenance.

### 3. Documents, collections and composite works

Source `HPX-SRC-0037`, original lines 28–37. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

A workspace supplies an authorized identity/query context. A collection organizes membership without embedding or cloning text. A document is an independent identifiable composition with its own history. A composite work is an ordered, versioned assembly of document/fragment placements. One document can belong to several collections and appear in several compositions with distinct placement contexts.

Create/rename/open, reorder/move/remove placement, fork, archive and history are distinct actions. Removing a collection membership or placement never deletes source/history. A drag between documents offers **Move / Fork / Transclude** explicitly; do not guess. Moving a placement preserves its identity where the operation permits it; repeated reuse allocates another placement. Cross-owner changes recheck all heads and policies atomically.

Composite manifests bind ordered child identities and pin/follow rules. Reordering chapters changes composition history, not chapter content identities. Adopt the existing manifest/occurrence semantics; decide concrete entity kinds/serialization in a domain ADR before persistence. A new database or separate service per graph is not required.

Compilation targets Markdown and HTML, with a machine-readable source/revision manifest; PDF is later. Outputs bind an exact authorized closure, citation resources and compiler profile. Multi-owner source exports and flattened assembly are distinct formats/options. Export failure cannot silently omit inaccessible material or use newer revisions. Temporary local-buffer downloads retain their existing uncommitted label.


## Source provenance

- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 20–27; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 34–43; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0025` — `Specifications/DATA/MATHEMATICAL_MODEL.md`, lines 53–59; SHA-256 `3320a86703c95f61a357d88a972f43eb1ff8bf1756f5abe9ab3f844b3a461117`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 113–125; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0037` — `Specifications/WORKSPACE_INTERFACE.md`, lines 28–37; SHA-256 `2a3eda5c15638cc67be928fd6afa7c0583c07c2b8cc5bdd85715bb197dcc321e`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.

## Retained autosaved selections and branch preservation — OWNER049/050

[M1](../architecture/Conceptual/identity-closure.c4) owns RQ040–041's retained-selection and constructed-version branch scope; [decision provenance](../02-governance/OWNER_DECISIONS.md#last-autosaved-composition-and-historical-version-accumulation--2026-11-01) retains the owner's successive refinements. Reopen A using its last successful acknowledged autosave, with exact occurrence-specific nested selections, not B's newest head or merely A's last Commit. Unacknowledged typing is not claimed durable. Newer authorised versions have a separate source-neutral indication; the comparison relation remains undesigned and cannot expose inaccessible versions or retarget history.

Routine autosaves must not accumulate historical versions merely because they occur. The future universal autosave/Commit relationship is reopened; current ADR019 private Save/checkpoint versus Commit and OWNER010 departure Commit keep their original scoped meanings and implementation evidence. No deletion/coalescing or mutable-history exception is adopted. Current private visibility and authority remain; current whole-owned draft records do not establish general nested composition recovery.

Save-as-branch must preserve an authorised constructed current-document composition and its exact selections without silently changing document/content identity into a Fork. Ordinary current editing already has an owning branch; selected constituent versions and read-only projections are separate. [Branch reconciliation](../architecture/proposals/branch-selection-reconciliation.md) explains the tentative known-branch hypothesis, main designation, graph reconstruction and non-authoritative caching. Exact branch-capture publication/parentage, general working-state representation and main designation/construction remain design work, not accepted schemas or a latest-all-nodes rule.

## Structural contributions without notation — OWNER051

[Canonical M1](../architecture/Conceptual/identity-closure.c4) now includes the accepted no-notation reconstruction case and its stopped-cycle source contribution, alongside OWNER047's exact original-notation rule. [Approval and exact scope](../02-governance/OWNER_DECISIONS.md#structural-inclusion-contributions-and-no-notation-cycle-stops--2026-11-02) and [marker-versus-structure example](../architecture/proposals/trustworthy-reconstruction-inputs.md#revision5--bounded-owner-adoption) distinguish semantic adoption from an implemented graph-only editor or physical placement encoding. OWNER053 now defines structural membership and exact partial-fragment meaning in the [selection contract](text-and-anchors.md#structural-membership-and-exact-partial-fragments--owner053);endpoint representation and exact structural/source acquisition remain design work; no silently dropped inclusion, guessed position or new retention rule follows.

## Recovery purpose and immutable reference evidence — OWNER052

[Canonical M1](../architecture/Conceptual/identity-closure.c4) and [approval provenance](../02-governance/OWNER_DECISIONS.md#ordinary-composition-recovery-and-durable-reference-evidence--2026-11-02) distinguish ordinary acknowledged-composition recovery from an operation requiring immutable durable-reference evidence. Preserve the exact selected unpublished source and nested context required by the acknowledged composition after its constituent drafts advance. Ordinary reopening retention does not itself create a permanent checkpoint; repeated autosaves are not permanent-capture events by themselves. Existing immutable revisions/checkpoints/references remain intact.

Recovery evidence is required state, not an evictable cache. Another composition or unresolved operation must not lose required evidence when a recovery state changes. This does not authorise deletion/release, adopt physical copying/deduplication/storage/format, define general durable-reference events, settle branch capture/publication, change private-state authority/permissions or establish universal autosave/Commit separation. OWNER053 defines selection meaning;exact acquisition/acknowledgement consistency and endpoint representation remain unresolved; no current implementation or new theorem is claimed.

## Selected bundle authority and derived use contexts — OWNER055

[M1](../architecture/Conceptual/identity-closure.c4) and the [concrete closure contract](../architecture/proposals/exact-closure-source-map.md) select the exact bundle as authority, with finite uses/maps derived on read. Source-state variants preserve committed,checkpoint and retained-working bindings/lifetimes; local parent/occurrence chains preserve repeated uses and distinct descendant selections without making the selected graph a tree. Only validated reproducible caches are discardable. Exact acknowledged recovery and immutable reference evidence remain protected under OWNER050/052; no routine permanent history,cleanup/release or universal Save/Commit coupling is introduced. Storage formats are specified as design,not implemented or accepted for real-data use.
