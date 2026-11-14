# Per-node temporal parent-Merge planning

## Common metadata

- **ID:** `HPX-ALGO-002`
- **Title:** Per-node temporal parent-Merge planning
- **Purpose:** Bound exact source planning and distinguish implemented selection from remaining lineage, ancestry, format and publication work.
- **Level:** `07-implementation`
- **Status:** `proposed`
- **Maintainer:** project owner; development agent
- **Applies to:** staged local one-owner parent-Merge under HPX-OWNER-013/014; no existing-workspace upgrade
- **Upstream authority:** [ADR015](../../04-architecture/decisions/0015-initial-merge-workflow.md#proposed-per-node-temporal-parent-merge-design-2026-10-27), [owner decisions](../../02-governance/OWNER_DECISIONS.md), [publication protocol](../protocols/draft-publication.md)
- **Downstream dependencies:** [storage records](../data-structures/sqlite-records.md), [navigation](../../06-subsystems/interfaces/domain-navigation.md), domain parent_merge module and future adapters
- **Verification:** ordinary domain tests and HPX-TEST-051; inherited formal evidence retains separate scope
- **Decision/history:** HPX-OWNER-013/014 adopt temporal interpretation and staged direction; routine bounded planning is implementation evidence, not format/real-data acceptance
- **Last reviewed:** 2026-10-27

## Implemented pure selection boundary

[domain/parent_merge.rs](../../../backend/crates/domain/src/parent_merge.rs) accepts one exact base and two same-node revision texts with **supplied base-aligned edit maps**. It does not infer a diff, discover ancestry, authenticate/allocate clocks, read snapshots, serialize DTOs or publish. The adapter must establish a unique valid common base, exact closed snapshots, current authority and lineage mapping before calling it; the browser cannot supply trusted origin/order claims directly.

Each edit has UTF8 base-byte `start/end`, exact expected base quote, exact replacement bytes and a nonempty set of revision/order origins. A zero-width edit inserts; an empty replacement of a nonempty span deletes. A replacement equal to the common base is allowed: an actual later reversion is not an unchanged span merely because its bytes match that base. Unknown order still carries an exact origin revision. Order0 is not an allocated edit; positive u64 ordering is domain-only, with eventual adapter encoding/range checks required. One revision cannot claim different orders and two different revisions cannot claim the same known per-node order.

Validate all ranges against the exact base, source-map ordering, non-overlap, quotes, origin consistency and byte-for-byte reconstruction of each input before selection. Insertion touching a replacement boundary within one side needs a coalesced map, rather than an arbitrary tie-break. Supplied revision identities remain in the returned plan, including the losing complete input. Origin claims are revision/order metadata, not independently checked original passage coordinates or authorship.

Selection proceeds through ordered maps:

- Non-overlapping changes combine without a conflict question, even when their order is unknown.
- Exactly coincident ranges with identical replacement bytes preserve the union of both origin sets; any retained unknown origin remains unknown for later temporal competition.
- Exactly coincident competing replacements with fully known different effective passage orders select the later one. Effective order is the maximum retained comparable origin, never the most recent unrelated node/branch publication.
- Unknown/equal order or complex partial overlap returns the first unresolved input-index pair and reason, **without any partial merged text**. Insertion touching a cross-side replacement boundary is conservatively unresolved. This deliberately leaves a more capable overlap mapper to later work.

The result keeps chosen origins; no new order is assigned by this planner. The publication adapter separately retains both exact inputs and same-node parents. It must distinguish already-incorporated ancestry from equal content: equal text alone does not prove no integration is needed. Repeated-Merge base selection remains the ancestry layer's responsibility, not a creation-snapshot shortcut.

## Resource and failure boundary

Caller supplies maximum text bytes and a positive logical work budget. The function charges input/reconstruction/output bytes, quotes/replacements, origin records, selected edits and pair steps before corresponding allocation/work. It validates each input before constructing a result, computes exact output length before allocation and rejects a combined output larger than the text bound even if each input fits. No normalization, byte truncation or partial output on budget failure.

Logical work units are not exact CPU cycles or a latency guarantee. Ordered map traversal/output is linear in supplied edits and text, with BTreeMap/origin sorting costs bounded by supplied origin counts (O(O log O)); size/work limits bound that input. This is no claim that arbitrary document diff/ancestry discovery is linear or that the entire application has a proof.

## Remaining exact mapping work

A whole-buffer Save plus a generic text diff cannot establish which identical repeated passage actually moved or changed. The immediate-base working trace below derives compact base-relative ranges from supplied exact splices; the remaining committed-history mapper must derive validated ranges from retained exact lineage evidence, preserving unchanged spans across autosave and Commit. It must compose through intervening same-node revisions, tombstones and imported Merge origins; validate every splice against exact owned bytes/expected generation and reconstruct the submitted whole source. Browser UTF16 coordinates must first convert against the exact owned UTF8 source. A stale or ambiguous map cannot establish chronology merely because its final text matches.

The working-trace component below implements a compact immediate-base draft trace in memory, updated atomically with Save and checked against its prior acknowledged draft/base. Commit consumes that trace to stamp only actual changed passages; imported Merge spans carry prior origins. Its adapter codec prototype is specified in the storage contract; it is not an implemented persistent log of every keystroke or permission to retain intermediate typing forever. Exact trace composition, no-op/Undo coalescing, reload of schema1/2 drafts and move/repeated-text ambiguity must be specified and tested before assigning new durable order claims. Until then, this domain selector must not be exposed as automatic paragraph-level Merge.

## Retained format contract to implement next

All required data/backup/upgrade evidence stays inside the portable workspace. The following are the full format **design responsibilities**. The isolated draft-lineage driver below now has experimental kinds31–33/marker3; the remaining families are not emitted or allocated, and ordinary workspace opening has not activated a new schema:

| Record / evidence | Required bindings and validation |
| --- | --- |
| Required-format binding | Explicit supported minimum-reader/feature policy, bound to the authenticated workspace root and consistent SQL format marker. Distinguish ordinary old-reader rejection from unavailable whole-workspace rollback detection. |
| Per-node order allocator | Exact node identity and next unused monotone order, advanced in the same transaction as content-changing publication; overflow denies without partial publication. Original-operation retry does not consume another order. |
| Revision variant | Exact same node, operation, text, explicitly versioned one/two-parent roles and retained origin-map binding. Legacy single-parent records remain immutable and readable. |
| Publication-event variant | Exact operation/actor/device/document/revision/snapshot plus the same ordered parent bindings. Do not create a cross-identity derivation for a same-node Merge. |
| Origin/lineage evidence | Exact revision/snapshot/byte-run bindings, inherited or newly allocated origin sets, explicit unknown legacy order and deletion tombstones. Adjacent equal bytes cannot erase distinct origins. |
| Integration record | Exact child/fixed-parent branches, pinned input heads/snapshots, selected common base, planner version, result and explicit resolution evidence. Both alternatives remain recoverable. |
| Draft lineage state | Exact document/node/branch/base, acknowledged draft generation/sequence and compact mapping to its committed base, atomically consistent with Save text. No generic multi-owner overwrite. |
| Existing frozen receipt | Original operation/result binding before later precondition revalidation, current source/result permission and no second publication after an unknown acknowledgement. |

Exact wrapper version dispatch, encrypted purpose/kind/slot addressing, strict DTO field order/golden bytes, bounds and explicit minimum-reader/schema level must be documented before codec/storage integration. This is routine format-design work within the adopted direction; it does not authorize upgrading existing data. In particular, merely adding optional origin records to schema1/2 would allow older writers to omit clock updates, so cannot claim temporal correctness.

## Upgrade and application integration acceptance

Before an existing workspace upgrade: explicit owner approval, verified consistent workspace-contained backup, retained passphrase recovery, no automatic keychain enrollment and recoverable interrupted-upgrade ordering. A new reader must not invent legacy passage chronology. Handle existing optional keychain schema2 by actual custody metadata; a future minimum-reader format marker must not itself imply native enrollment. Unmodified older readers must reject upgraded workspaces before ordinary writes; future codec tests alone are not that executable compatibility evidence.

Before enabling parent Merge: exact mapper/lineage and ancestry discovery, bounded incomplete outcomes, precise codecs and upgrade path, current authorization, stale source/target/dirty-target checks, atomic target revision/snapshot/head/draft/event/origin/integration/receipt publication and original-operation recovery. Source head/branch history and fixed parentage stay unchanged. Private reference promotion/replacement remains separately acknowledged. An explicit Merge click may publish a fully determined result; ask only about truly unresolved regions, never routine writing/navigation.

Domain tests establish the supplied-map selector (including a64-case independent per-position oracle), immediate-base working trace and supplied-metadata common-base selection; their storage/application integration remains separate. They do not establish production Merge delivery, storage compatibility, replay/crash recovery, real-data acceptance, passage attribution or new Lean/Rust correspondence.

## Immediate-base working lineage trace

The next pure component composes **supplied exact sequential UTF8 splices** within one node's current committed base. It holds that immutable node/base/text binding, current whole text and a canonical compact set of base-relative replacements. Splices are relative to the preceding intermediate text in the supplied batch, carry an exact old quote, and must reconstruct the exact expected final whole text. Caller authorization/generation/branch ownership and UTF16 conversion stay outside this pure component.

Only unchanged copied base fragments retain base identity. Pasted equal text is not inferred to come from a different repeated passage; inserted bytes remain replacement text. A whole changed interval restored exactly to its immediate base bytes can cancel before Commit. Empty or byte-identical splices do not create changed history. Neighboring changed intervals coalesce; deletion is represented by a nonempty base range with empty replacement. No per-keystroke append history or clock is generated. A changed span is not split into allegedly inherited character origins merely by finding equal characters inside its replacement.

This immediate-base normalization must **not** be used to cancel a genuine reversion across already committed revisions: if Tuesday was committed and the next edit restores Monday, its immediate base is Tuesday, so Monday remains a new change. Composition through older committed origin maps and Merge DAGs remains separate. Complex partial-overlap maps can remain unresolved in the selector; the trace does not invent semantic passage identity.

Budget input/output text and each splice/piece scan/allocation; reject stale text, invalid ranges/quotes, noncanonical restored state, exceeded work/output or wrong final reconstruction without changing the prior trace. Restore only an exact canonical trace bound to its committed base; it does not authenticate bytes or a record version. This component supplies input maps, not a durable draft format or an exposed application Merge capability.

The working-trace component is `domain/parent_merge/lineage.rs`. It is immutable-on-error and validates restoration of a canonical compact trace. Its change extents describe supplied editing operations; it does not prove semantic passage boundaries or infer untouched character origins inside a coarse replacement. UI Undo/Redo must retain/restore the corresponding exact trace with its owned-source history, not guess origin from an inverse text patch. The tests include this distinction. Assigning durable per-passage clocks still requires the committed-origin layer to reject or explicitly retain unknown mapping where a coarse extent cannot establish that distinction.

## Bounded common-base selection

The pure ancestry component accepts a bounded supplied batch of exact revision IDs, same-node IDs and zero/one/two distinct same-node parent IDs. It validates duplicate identities and parent shape, then iteratively visits the reachable union from both captured heads (no recursion). Missing records, cycles, cross-node records and exhausted logical work return explicit errors. It does not read storage, trust unauthenticated graph claims or silently fetch more history.

Propagate source/target reachability through the validated parent-first order. Common ancestors have both marks; a common ancestor that is a parent of another common ancestor cannot be maximal. Exactly one remaining maximal common ancestor is the automatic base; none means unrelated, and multiple candidates mean unresolved ancestry. In particular, do not fall back to branch creation's revision. Return source-already-in-target and target-already-in-source flags for later publication planning; they are not authorization or instructions to move a head. The storage reader still must enforce its own encrypted-byte/view/authority limits while constructing this batch and report incomplete discovery honestly.

## Retained immediate-parent passage origins

`domain/parent_merge/origins.rs` adds a pure immutable-on-error origin map. Each map binds one node/revision, its immediate parent and optional supplied publication order, exact text, contiguous byte runs, exact immediate-parent changes and deletion evidence. Runs carry retained origin sets, explicit mapping confidence and, for inherited bytes, their exact immediate-parent offset. Adjacent runs coalesce only when confidence/origins agree and inherited parent coordinates are contiguous. Deletions cover only removed parent intervals: explicitly copied inner spans are excluded. Retain earlier revision maps through their parent links rather than copying all old tombstones into each revision.

Publication accepts the matching immediate-base trace plus explicit per-change evidence. Fresh pieces receive the supplied new revision/order; copied pieces preserve earlier origins and must match exact bytes at monotone coordinates within that changed interval. Equal bytes at another repeated locus do not establish inheritance. A coarse replacement whose internal mapping is unknown retains that uncertainty even when its publication order is known. Unchanged runs keep their previous passage age; an unrelated later publication cannot refresh them. Genuine committed reversions receive new edge evidence. A byte-identical normalized trace is a no-op and cannot allocate an age through this function.

The selector now distinguishes `Mapping::Exact` from `Mapping::Unknown`. Unequal coincident competition with uncertain mapping is unresolved before comparing order. Equal-byte alternatives retain both origin sets and the weaker confidence; deduplication never repairs unknown evidence. Known order and exact mapping are distinct facts. The map validates supplied own/retained orders and bounds, but does not allocate/authenticate a workspace-wide per-node clock, prove evidence supplied by its caller, infer a general diff, compose arbitrary older revision/Merge maps, serialize origins or publish to storage. HPX-TEST-055 covers the Tuesday/Wednesday example with a later unrelated edit and these failure boundaries.

## Guarded encrypted draft-lineage Save

The [storage contract](../data-structures/sqlite-records.md#guarded-experimental-temporal-save-transaction) now specifies an experimental SQL-marker3 driver for atomic draft text/lineage/receipt writes. HPX-TEST-056 exercises disposable encrypted SQLite fixtures only. Normal creation/opening remains schemas1/2; no upgrade path, runtime endpoint, temporal Commit, clock/origin codec or parent-write capability is enabled. The table above remains the remaining full format responsibility list; draft lineage is the first isolated persisted component, not a completed format.

## Authenticated legacy-history loading boundary

The next read-only adapter loads the reachable union from the current named child and its fixed parent's committed heads inside one authorized SQLite read transaction. It reuses exact revision/event/closed-snapshot/manifest checks; publication text is authenticated during traversal but not returned. Capture both heads and their snapshot IDs together; dirty drafts do not enter base selection. Caller limits are positive and capped at1024 unique revisions,64MiB charged encrypted immutable publication/manifest bytes and1Mi logical planner work units. Existing bounded catalog/branch metadata validation precedes that traversal and is not included in the publication-byte allowance.

Deduplicate reachable revision IDs before fetching but still pass complete retained edges to the pure cycle/common-base validator. Missing/corrupt/cross-node/cyclic evidence fails; exhausted record/byte/work limits return incomplete failure, never unrelated or a creation-root fallback. Return the pinned comparison, unique base's authenticated snapshot and incorporation flags only after full success. This first adapter reads the existing strict single-parent revision/event payloads; future multi-parent records require explicit codec dispatch and tests. No runtime endpoint, chronology inference, Merge publication or database upgrade follows.

## Candidate single-parent origin evidence replay

Candidate kind34/wrapper1 records exact publication/parent snapshot bindings, positive safe publication order, canonical immediate-parent changes and explicit fresh/copy/unknown evidence. Encoding and decoding replay `origins::Map::publish` against the supplied exact parent map. This derives retained ages/copy coordinates/deletion complements rather than accepting arbitrary serialized origin lists. It has no SQL/crypto writer, clock allocator or two-parent Merge variant. An authorized loader must authenticate both snapshots and the complete parent map; absence of a required future record cannot silently become a legacy seed. HPX-TEST-059 records codec evidence; this remains separate from durable temporal Commit/upgrade and historical Merge-map composition.

## Guarded single-parent temporal publication component

HPX-TEST-068 adds the experimental3 single-parent storage transaction described in the publication protocol. It publishes exact acknowledged draft/trace evidence and advances one node-local committed-change clock across independently selected branches, retaining inherited ages and explicit unknown mapping. Unchanged or fully reverted immediate-base text consumes no passage age. Dedicated frozen37 retries precede newer mutable-state checks; old ordinary8 and temporal Save33 intents cannot share the operation ID. This is ordinary adapter evidence, not a parent-Merge feature or a proof of chronology allocation. Separate reference replacement and production format opening/backup/upgrade/old-reader rejection precede two-parent format/map composition, publication and UI work. Existing-workspace upgrade remains separately explicit.

## Temporal capacity and result readback

HPX-TEST-070 adds raw-source/retained-history capacity cases. Before publishing a changed head the adapter reserves the result's retained-reader slot, then reconstructs its exact resulting origin map within ordinary reader ceilings before COMMIT. A resource limit is an atomic failure; it never authorizes history pruning, implicit seeding, missing-origin fallback or a new operation after an uncertain reply. The latest protocol/storage contract gives the revised bounded phase allowances. This remains single-parent adapter evidence with no two-parent map composition, upgraded application workflow or new proof.
