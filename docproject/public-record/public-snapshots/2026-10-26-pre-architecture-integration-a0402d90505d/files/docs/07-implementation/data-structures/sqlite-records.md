# Encrypted SQLite records and slot schema

## Common metadata

- **ID:** `HPX-DATA-001`
- **Title:** Encrypted SQLite records and slot schema
- **Purpose:** Actual initial encrypted SQLite objects/slots and typed local record representation.
- **Level:** `07-implementation`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-FMT-001](<../../06-subsystems/formats/hpx-workspace.md>); [HPX-SUB-006](<../../06-subsystems/workspace-storage.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Describes local code, not proof of a complete data model. Domain serialization separation and explicit record wrappers are implemented locally; real-data browser/runtime acceptance remains pending.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Exact types and fields

Current local code is [storage/src/lib.rs](../../../crates/storage/src/lib.rs); this is implementation evidence, not a newly frozen schema.

| Physical record | Current representation | Authority/limit |
|---|---|---|
| bootstrap | workspace16, epoch1 and wrapped key106 | Clear bounded bootstrap metadata; no plaintext document content |
| objects | kind, id32, encrypted envelope; compound primary key | API insert-only immutable revisions/manifests/snapshots/events/receipts |
| slots | kind, id32, generation, encrypted envelope | Catalog/head/draft mutable state, updated under SQLite writer transaction |
| local payloads | strict JSON wrapper `{record_version:1,record_kind:<integer>,payload:<typed record>}` in storage/encoding.rs | All nine persistent kinds use the wrapper; missing/future versions, kind mismatch and malformed/unknown/duplicate fields are rejected |

Private document/node/branch/occurrence/draft references and full text are authenticated inside records. The initial one-owner document has one immutable manifest and one occurrence; this does not implement general nested composition. SQL should receive encrypted bytes, including data entering WAL/journals. JSON request digests are encrypted receipt data, not public plaintext addresses. Exact structural constraints and decode limits must remain bound to schema/record versions. No SQL migration or new JSON field was added here.


## Keys and references

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Constraints and invariants

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Indices and operations

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Migration and serialization

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Valid/invalid example records

Actual initial encrypted SQLite objects/slots and typed local record representation. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Integrity tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

Source-grounded consolidation of the documents registered for this topic in [source manifest](<../../registers/source-manifest.csv>), explicit owner decisions and source/code references above. No missing mechanism is invented.

## Current implementation and compatibility, 2026-10-25

`Cipher::seal/open` routes every persistent payload through `encoding::encode_record/decode_record`. Wrapper field order is `record_version`, `record_kind`, `payload`. Nested domain identities remain exact 32-byte JSON arrays through adapter codecs; snapshot-binding DTOs retain `path`, `node`, `revision`. Command JSON bytes used for receipt digests retain their previous representation and order. Domain types have no Serde implementation or dependency.

Database schema 1, envelope format and HTTP contract 1 are unchanged. Unversioned experimental payloads are unsupported and are never silently interpreted as version 1 or rewritten. Preserve the original file; no conversion mechanism is implemented. Typed decoders reject unsupported versions and mismatched kinds with `Error::Format`. This explicit fail-closed choice does not claim backward read compatibility with pre-versioned experimental workspaces. Current tests cover versioned restart/recovery, immutable snapshots, retry receipts, WAL ciphertext/tamper rejection and transaction fault injection; see [the test register](../../registers/tests.csv).

## Optional keychain wrapper in database schema 2

The accepted [ADR014](../../04-architecture/decisions/0014-keychain-unlock-policy.md) is implemented in [storage/keychain.rs](../../../crates/storage/src/keychain.rs). Schema 1 remains the creation format. Only explicit enrollment creates this additional strict table and sets `user_version=2` in one transaction:

```sql
CREATE TABLE keychain_unlock(
  singleton INTEGER PRIMARY KEY CHECK(singleton=1),
  wrapper BLOB NOT NULL CHECK(length(wrapper)=106)
) STRICT;
```

Zero rows means unenrolled; one row holds HGWK1 ciphertext wrapped with a random native device secret. Passphrase bootstrap, record wrapper1, object kinds/IDs, immutable history, receipts and slot ciphertext are unchanged. Bootstrap validates schema and row shape before credential reads. Missing/unknown tables or unsupported versions fail closed. Removal deletes the wrapper before native deletion, stays schema 2 and does not rewrite historical ciphertext. Failure cleanup state is transient in the unlocked process, not a new persisted plaintext field; restart/lock can leave a reported orphan requiring explicit scoped inspection.

Before schema-1 mutation, online SQLite backup captures a consistent snapshot, validates `quick_check` and a framed hash of every existing bootstrap/object/slot value, and fsyncs the file and directory entries. A writer transaction rechecks that fingerprint and authenticated owner/device before creating a native item. The fingerprint is internal and not persisted or exposed to the browser. Verified encrypted backups stay under sibling `.hypergraph-backups/`; restrictive directory/file modes are required on Unix. Existing insecure directories and symlinks fail instead of being altered. No general real-data migration, rotation or downgrade mechanism is claimed.

## Optional private clipboard record, 2026-10-25

The initial protected-reference implementation adds encrypted mutable slot kind **10**, with strict record wrapper version 1. Its slot ID is SHA-256 of `hpx/private-clipboard/v1\0` followed by the opaque principal32; the existing cipher context also binds workspace, epoch, kind, ID and generation. The payload is `{owner,entries}`. Each entry has `id`, `source`, `preview`; source has `document`, `node`, `snapshot`, `revision`, `occurrence_path`, `start_byte`, `end_byte`. IDs use the existing exact-width adapter codecs; ranges are half-open UTF-8 bytes. Preview is at most 120 Unicode scalars and stays encrypted. Request-only quote and expected draft generation/sequence are not additional persistent fields.

An absent slot is logical generation 0 with no entries. The first changing mutation creates generation 1; later changes use encrypted slot CAS. Exact-source recapture reuses its entry and generation, while each command retains its own encrypted receipt. Empty clear does not advance generation. The private clipboard admits up to 128 entries, rejecting overflow atomically rather than pruning source history. Removing/clearing references never deletes source objects, snapshots or events. Future private record versions fail before mutation and are not interpreted as empty state.

This is an optional record in the existing generic slots layout; SQL schemas 1/2, original nine payload layouts, HGOB/HGWK and contract 1 stay unchanged. Readers that do not implement the clipboard can continue ordinary document reads/writes while preserving its opaque slot. They do not implement the new capability or parse its added receipt outcome. A pre-clipboard tested build opened, saved and committed an isolated upgraded workspace while preserving kind-10 ID/generation/ciphertext byte-for-byte; the current reader then recovered the same pinned reference. See [test evidence](../../registers/tests.csv). This does not promise that an older binary can reconcile newer private-operation receipts.

## Optional immutable fork derivation, 2026-10-25

The initial independent-document Fork adds immutable encrypted object kind **11**, record wrapper version 1. Its physical lookup address is SHA-256 of `hpx/fork-derivation/by-output-node/v1\0` followed by output node32. This lookup address is separate from the freshly allocated logical transformation identity. Payload fields are `transformation`, `operation`, `actor`, `device`, `kind`, `inputs`, `outputs`; this implementation accepts only kind `fork`, exactly one input and exactly one output. Each endpoint uses the exact source binding defined for kind 10. The output is its complete initial text, with half-open byte range `[0,text.len())`. Request title, quote and draft precondition are validated but are not extra derivation fields.

The new document, node, occurrence, branch, manifest, draft, first revision, first closed snapshot, derivation, catalog update and receipt publish in the same writer transaction. The first revision has no same-node parent: the source is a cross-identity derivation input, never a revision parent. Subsequent commits retain the same output node and follow its own revision ancestry; the derivation stays pinned to its first snapshot. Repeating the same operation returns the original output; a different operation creates distinct identities even when selected bytes are equal. Source draft/head/history are unchanged.

The original nine record layouts, SQL schemas 1/2 and cipher/envelope versions remain unchanged. Kind 11 is additive in the generic objects table. Older readers cannot parse Fork commands/receipts or display derivation; ordinary document writes must preserve optional objects. Compatibility execution and limits belong in the [test register](../../registers/tests.csv). There is no automatic conversion of incompatible experimental data, generic derivation DAG index or revision-merge representation here.

## In-progress versioned semantic overlay records

Under accepted [ADR010](../../04-architecture/decisions/0010-semantic-annotation-snapshots.md), the first assertion adapter adds optional encrypted record kinds **12–16**, each strict record wrapper 1. Physical schemas 1/2, existing text revisions/snapshots and cipher/envelope versions remain unchanged. These records are a local implementation under verification, not production real-data format acceptance.

| Kind | Storage | Payload and identity |
|---|---|---|
| 12 | immutable object at a random ID | Captured predicate `version` digest and full `definition`: stable predicate ID, registry version, label/description, role definitions, participant mode, context fields, symmetry and optional family |
| 13 | immutable object at revision32 | Assertion node, optional same-node parent, captured definition object ID, ordered role-labelled participants, declared properties/review state, proposer, publisher actor/device and operation |
| 14 | mutable slot at assertion node32 | Current owner/node/revision with authenticated CAS generation |
| 15 | mutable slot at document32 | Document-scoped overlay index of assertion node IDs and encrypted normalized-identity fingerprints |
| 16 | mutable workspace slot at existing zero root | Owner-scoped private registry mapping encrypted definition-version digests to random definition-object IDs |

Definition-version and fact fingerprints stay inside encrypted payloads. They are not public physical object addresses, avoiding a dictionary of clear predicate hashes in SQLite metadata. New semantic nodes/revisions/definition addresses are independently random. The frontend and Rust adapter share `crates/storage/src/predicate-catalog-v1.json`; its 244 wording choices still normalize to 210 existing opaque predicate identities. Inverse choices reverse canonical roles; symmetric binary choices normalize exact participant ordering for duplicate detection. Aliases/tags do not create new predicate identities. Captured definition versions retain their original meaning after future catalogue edits. Owner-declared predicates get fresh opaque local IDs; equal words alone do not unify declarations.

A creation starts Proposed and atomically publishes definition capture, assertion revision/head, every participant document's overlay index and receipt. Exact registered facts deduplicate without resetting an existing review; changed qualifiers or exact source contexts remain separate. An explicit review appends an immutable same-node revision and advances all affected overlay generations; rejected/superseded revisions remain retained. Current reads verify publisher receipt binding and parent identity/content continuity. Recorded acceptance is an attributable judgement, not a checked proof or original text authorship.

Participants are 2–8 exact committed text references with explicit roles and half-open UTF-8 ranges. They retain the source snapshot/revision/path; request quotes and expected draft generations/sequences are validation inputs rather than extra persistent source fields. Aggregate request quotes are at most 2 MiB. The pure planner preserves n-ary incidence and checks role coverage, byte/scalar bounds and quotes; authorization/crypto/serialization remain adapters. Initial indexes admit up to 1024 assertions/definitions, rejecting overflow atomically rather than pruning retained history. Overlay pages are 1–8 entries and bind expected generation on later pages; review invalidates a stale cursor instead of mixing views. These bounded reads can validate up to eight source revisions per entry; broader performance/production acceptance remains open.

Existing text snapshots exclude semantic assertions. A separate overlay page identifies its exact text snapshot and returns `text_snapshot_scope:"semantic_assertions_excluded"`; later review never rewrites historical text. Current explicit historical overlay views do not assert that their claims existed when the text snapshot was published. General semantic closure, shared authorisation, assertion-to-assertion endpoints, exports and automatic inference are outside this first adapter. Older-reader preservation of these new optional kinds still needs actual compatibility execution before delivery claims.

## Optional reviewed synthesis derivation (kind 17, record version 1)

HPX-ADR-015 uses one additive immutable encrypted object, addressed by SHA-256 of `hpx/merge-derivation/by-output-node/v1\0` plus the independently random output node ID. Kind 17 has the existing authenticated version/kind/payload wrapper, without changing schemas 1/2, existing record payloads or HGOB/HGWK framing. Its payload has transformation/operation/actor/device IDs, `kind: reviewed_synthesis`, `source_authorship: unknown`, 2–8 ordered exact input Source bindings and one whole initial output Source binding. Inputs are derivation references, never same-node revision parents. No sentence-copy/authorship mapping is inferred.

Merge publication validates every exact committed quote/current permission and optional acknowledged draft precondition before creating the independent document, first parentless revision/snapshot, draft/head/catalogue update, derivation and receipt in one writer transaction. Aggregate quoted inputs and reviewed output each have a 2 MiB bound. Quotes/preconditions validate the command; retained immutable source revisions reconstruct the evidence. Explicitly captured historical inputs use null draft preconditions. Original drafts, snapshots and private clipboard entries are not changed.

Reads validate current owner/device/catalogue scope, all exact source bindings, whole initial output, parentless publication event and matching Merged receipt. Missing, damaged, wrong-scope or mismatched evidence fails without fabricating an origin. Later output edits leave the original derivation intact. Existing readers may open/edit the ordinary output document while preserving the unknown optional object; they cannot replay a Merged receipt or expose its provenance. Actual compatibility evidence is recorded separately.

## Optional immutable passage comments (kinds 18–19, record version 1)

Under accepted HPX-ADR-017, `crates/storage/src/comments.rs` adds immutable encrypted comment objects (kind 18, random revision address) and an optional encrypted document index slot (kind 19). Existing kinds1–17, database schemas1/2, HGOB/HGWK framing and text snapshots remain unchanged. Every new payload retains the strict version1/kind wrapper. The head slot address is SHA-256 of `hpx/document-comments/v1\0` followed by the document ID.

A comment record carries independently allocated node/revision IDs, exact committed Source binding, body, original optional acknowledged draft precondition, actor/device/operation, ordinal and `previous_document_comment`. This last field is an immutable document paging link between separate comment entities, never same-node revision ancestry. Body is nonblank, preserved byte-for-byte and bounded to 16 KiB UTF-8; passage is nonempty/scalar-aligned and at most the existing 2 MiB source limit. A historical capture uses null draft preconditions. The pure planner in `crates/domain/src/comment.rs` checks exact quote/context/body without serialization, authorization or persistence.

Index payload is `{document,head,count}`; a first slot has generation0/count1 and each publication increments both. Comments, index and Commented receipt publish in the existing immediate writer transaction. Receipt state names document/node/revision/ordinal. Reads reconstruct the original command from the retained passage/body/precondition and verify its digest against the immutable receipt, current owner/device/document scope, exact source binding and strictly decreasing paging ordinals. This binds body/source to the recorded operation without inferring original passage authorship.

Pages accept 1–8 entries and an inclusive immutable comment revision cursor. New publications do not shift an older cursor. There is no retained-comment count cap or pruning: the safe integer ordinal limit rejects new publication atomically. A page validates at most eight returned source bindings plus one lookahead to check the boundary link; each source retains its 2 MiB limit and body its 16 KiB limit. One requested text snapshot is separately validated. Results contain bounded comment bodies/metadata, not source text; inspection resolves the exact historical range. Missing receipts/sources, cross-document cursors, corrupt links and unsupported versions fail rather than substituting current text. This is a bounded initial adapter, not general DAG/shared comment lifecycle or hostile-storage rollback witnessing.

The index is optional for older readers; actual preservation/exact reconstruction evidence must pass before integrated delivery claims. Older binaries cannot decode/replay a Commented receipt or display these annotations. No legacy migration or production format acceptance is implied.

## In-progress named branch adapter (kinds20/21)

The local ADR018 foundation in `crates/storage/src/branches.rs` is under verification, without frontend integration or a completed branch capability. It does not implement the owner-requested working-checkpoint design in ADR019. Both new kinds retain strict record wrapper1; original kinds1–19, saved Document payloads, SQL schemas1/2, HGOB/HGWK framing and network contract1 remain unchanged.

Kind20 is an immutable object addressed by the independently random child BranchId. Payload is `{document,node,branch,draft,parent,revision,snapshot,name,actor,device,operation,ordinal,previous}`. `parent` is fixed content-branch parentage; `revision/snapshot` pin the parent's reviewed committed head at creation. `previous` is an immutable newest-first document listing link, not revision ancestry or branch parentage. Name is nonblank and at most512 UTF-8 bytes. The child retains the document/node/manifest/occurrence, allocates its own draft and head slots using existing kinds7/6, and begins at the exact selected committed bytes. The stored Document continues designating its original branch/draft.

Kind21 is an optional document-addressed index slot `{document,head,count}`. Initial generation0/count1 advances together; count is bounded by the JavaScript safe-integer ceiling with overflow rejection rather than pruning. Creation atomically writes metadata, independent head/draft, index and receipt. A changed parent head conflicts; the parent draft is not saved, committed or reset by creation. Named child saves/commits share the established draft writer, preserving exact generations/base/sequences and same-node ancestry.

The new Command is `{command:branch,mutation:<strict action>}`. Create fields are `document,parent,revision,snapshot,name`. Save fields are `document,branch,generation,base,previous_sequence,sequence,text`; Commit fields are `document,branch,generation,base,sequence`. Receipt outcome is `{result:branch,state:{branch,outcome:<created|saved|committed outcome>}}`, with the existing inner outcome field shapes. Current catalog owner/device and document/branch scope are checked before replay. Reads reconstruct the original creation command and verify its digest and receipt binding; corrupt metadata is not interpreted as an ordinary branch.

Listings return at most16 metadata records per page and follow decreasing immutable ordinals, with an inclusive BranchId continuation. Branch editor reads validate independent draft/head/base, exact revision and closed snapshot. Branch history starts from the explicitly selected branch head and uses the existing16MiB/1–32-entry exact same-node ancestry reader. As with the original history API, a supplied revision continuation is an authorized same-document ancestry starting point; it does not independently prove membership in the selected branch. Before frontend delivery, cursor binding and branch-view labelling must be resolved rather than treating an arbitrary supplied revision as branch-membership evidence.

Actual old-reader preservation of kinds20/21, branch-specific editor/retry/undo integration and working-checkpoint formats remain unverified. An older reader cannot decode the new command/outcome; ordinary document-only routes still address the designated original branch. No manual workspace mutation, format migration or real-data acceptance is claimed by these unit checks.

## Working-checkpoint foundation (kinds22–24), local verification

Accepted [ADR019](../../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) is being implemented in `crates/storage/src/working.rs`. This first backend increment retains the existing mutable Draft buffer and adds optional working identity/checkpoint/promotion evidence; it does not yet implement protected clipboard integration, replacement references or branch UI. Existing strict payloads/SQL schemas/envelopes remain unchanged. New records use the existing authenticated version1/kind wrapper. `CheckpointId` is a distinct dependency-free domain identity; codecs remain in the storage adapter.

| Kind | Lookup/storage | Payload |
|---|---|---|
| 22 | optional mutable slot at content BranchId | `document,node,branch,working_branch,draft,actor,device,head,count` |
| 23 | immutable object at random CheckpointId | `state,draft,manifest,occurrence,actor,device,operation,previous,request` |
| 24 | optional immutable object at CheckpointId | `checkpoint,document,branch,working_branch,revision,snapshot,operation` |

Working state is created lazily on the first explicit checkpoint capture, without a schema upgrade or manual workspace enrollment. Its distinct working BranchId remains associated with the selected content branch and the existing recoverable DraftId. First generation0/count1 advances once per checkpoint; ordinals are safe integers and strictly linked through `previous`, not committed revision ancestry. Ordinary autosave updates that same mutable Draft buffer and creates no immutable checkpoint or text revision. Checkpoints retain complete exact owned source and original command preconditions, even after later buffer/head changes.

Checkpoint command is `{command:checkpoint,plan:{document,branch,generation,base,sequence,text,start_byte,end_byte,quote}}`. The complete owned text and quote are at most2MiB each, ranges are nonempty/scalar aligned, generation/sequence are safe integers and encoded plan is at most14MiB minus2048 bytes for command/record framing. The pure `domain/working.rs` planner validates exact acknowledged text/range/quote. Storage additionally checks current catalog authority and branch before replay, then exact draft generation/base/sequence and text before new capture. Metadata, checkpoint and Checkpointed receipt publish atomically. Different operations may create separate immutable checkpoints for identical source; identical retry returns its original receipt.

Receipt state is `{document,node,branch,working_branch,checkpoint,ordinal}`. Kind23 `state` retains this state; `request` retains the complete original strict plan. Reads reconstruct the command and verify its digest/receipt, complete document/node/branch/draft/manifest/occurrence binding, same-node base and retained exact range. No digest is used as a public logical identity or cross-domain deduplication key. Historical source is not reconstructed from the current mutable buffer.

The new strict Working Source is `{kind:working_checkpoint,document,node,branch,working_branch,checkpoint,occurrence_path,start_byte,end_byte}`. It carries no committed RevisionId/SnapshotId masquerading as a draft. The sole supported occurrence path is the exact owned document occurrence. Current authorization applies to every read and requested subrange. The existing committed Source type remains unchanged.

Commit uses the shared original/child branch writer. If that branch's latest checkpoint has the same complete owned text and base as the captured draft, kind24 records a promotion to the newly published exact revision/snapshot in the same transaction. A differing source remains historical working evidence; no quote matching or range relocation is attempted. A prior promotion remains immutable and is not redirected by another Commit. Reads verify checkpoint/full text, closed snapshot, same-node revision parent, publication event, selected branch and reconstructed Commit command digest/receipt. Only the latest checkpoint is considered by this first bounded Commit hook; it does not scan historical checkpoints or incoming links. Other eligible historical checkpoints may remain unpromoted; this is not complete automatic replacement.

Lazy metadata does not redirect older readers. Their ordinary writes still update the original designated Draft/head, leaving checkpoint evidence immutable; fresh checkpoint commands must revalidate current generations/base/text. An older Commit does not create a promotion. No background reconciliation or actual old-reader preservation run for22–24 has been completed. Failure of present metadata/receipt/source integrity is not interpreted as an empty working state. No migration, real-data format acceptance, full provenance-copy workflow or branch/checkpoint delivery claim follows from this adapter alone.

## Private working references and replacements (kinds25/26), local verification

`crates/storage/src/working_clipboard.rs` adds an optional owner-addressed encrypted mutable index (kind25) and immutable independently identified references (kind26), each strict wrapper1. Existing committed-reference clipboard kind10 is unchanged. This new family permits128 live references, with overflow rejection rather than source/history deletion. The families are independent; there is no implied combined128-entry limit. An index payload is `{owner,entries:[EntryId,...]}`. Logical absent generation0 becomes persisted generation1 on first copy; each mutation/replacement advances once. Paging is1–16 entries, with expected generation plus offset, and rejects duplicate IDs, stale generations or unsupported payloads.

Reference payload is `{id,actor,device,operation,target,preview}`. Initial target is `{kind:working,source:<explicit Working Source>}`. A replacement target is `{kind:committed,source:<unchanged committed Source>,previous:<original EntryId>,promotion:<exact kind24 evidence>}`. `preview` is the first120 Unicode scalars of the exact captured passage, retained encrypted and verified on read. Original/reference IDs are independent random adapter identities, not content addresses. The predecessor is a retained private reference, not same-node text ancestry or automatic assertion adoption.

`{command:working_copy,plan:<Checkpoint Request>,generation:<working clipboard generation>}` atomically captures kind23 checkpoint, kind22 working head, kind26 reference, kind25 index and immutable receipt. Receipt is `{result:working_copied,state:{checkpoint:<Checkpoint Change>,source:<Working Source>,entry,generation,count}}`. The checkpoint retains its original full request; reads reconstruct this WorkingCopy command using the receipt's previous clipboard generation and verify its digest, source/range and complete checkpoint identity. Standalone Checkpoint records retain their original command/receipt interpretation. No existing kind22/23 payload shape or committed Source interpretation changes.

A Commit creates exact kind24 promotion without modifying the private reference index. A separate strict WorkingClipboard Promote command replaces matching live references in its own transaction after that Commit is durable. Scan at most128 small reference records; source validation remains bounded by the retained2MiB checkpoint limit. Only references to a checkpoint promoted by this exact Commit operation qualify. Each replacement appends a new immutable reference with predecessor/promotion and updates the current index; one index generation increment covers the bounded set. No other principal, semantic assertion/comment/derivation or unbounded backlink graph is rewritten. A replacement-batch fault rolls back only that batch and its receipt; the prior text Commit/promotion remains durable. A lost batch reply replays its original receipt without producing more replacements. The current index generation is checked before a new batch; current publication/document/branch authority is checked before replay. Reference `operation` continues naming its source Copy or promotion publication; the separate batch has its own encrypted operation receipt.

Old references and checkpoints remain inspectable after replacement or current-index removal/clear. A changed source remains a working target. Reads verify current authority, the originating WorkingCopy receipt/source, exact checkpoint, preview, full source equality and promotion/Commit evidence before exposing a replacement. New strict `{command:working_clipboard,mutation:{action:remove,generation,entry}|{action:clear,generation}|{action:promote,generation,publication}}` returns `{result:working_clipboard,state:{generation,count}}`; removal affects only the private current list and never deletes immutable reference/source records.

This adapter is not yet frontend-delivered. The first promotion hook considers only the branch's latest checkpoint; other exact historical checkpoints and non-private link families are not automatically promoted. Frontend branch buffers, source capture, batch reconciliation and working-source Fork transport are locally wired behind unadvertised capabilities; actual integration/older-reader preservation and broader graph batches remain pending. There is no publication capability claim or manual-runtime deployment from these unit tests.

## Working-source Fork and scoped history additions, 2026-10-26

Optional immutable encrypted kind27, strict wrapper1, is addressed by the independent output DocumentId. `storage/working_forks.rs` stores `{kind:working_fork,transformation,operation,actor,device,input:<Working Source>,output:<committed Source>}`. `{command:working_fork,plan:{title,source,quote}}` validates the exact retained checkpoint passage and current permission before creating the independent node/document, parentless first revision/closed snapshot, draft/head/catalog, derivation and receipt atomically. Receipt is `{result:working_forked,state:{document,transformation,revision,snapshot}}`. Equal text does not unify node identity. Later source/output edits retain the exact original checkpoint and initial output. Reads verify source/output bytes, parentless output event and reconstructed command digest/receipt. This is an explicit unpublished-source derivation, not a committed-source disguise, original-authorship claim or same-identity branch Merge. Actual older-reader/graph integration is unverified; no existing payload/schema/envelope version changes.

New branch history uses ephemeral encrypted cursor context kind1000002, bound to current owner/workspace key and `{document,branch,snapshot,next}`. These envelopes are not persisted as objects/slots. First-page selection must match the selected branch's current exact committed snapshot; stale heads conflict. Thereafter an opaque token follows that retained ancestry even after newer commits, and cannot be moved to another branch or snapshot. Cursor input is bounded to4096 bytes; reads retain1–32-entry/16MiB bounds and current authorization. Response includes an opaque current-page `cursor` for stable back navigation, opaque/null `next` and explicit document/branch/snapshot. Original raw same-document ancestry APIs remain unchanged; the new frontend uses the scoped endpoint and retains each history view's pinned snapshot while paging.
