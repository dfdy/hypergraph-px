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
