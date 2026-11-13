# HPX-DOM-001 staged migration — C1 complete

Authority: HPX-OWNER-034. This stage uses only existing C1 / System context and its existing human/machine actors and HPX box. No new diagram,block,model relationship or decomposition level was introduced. An existing UI-to-human presentation relationship is now projected into C1 so outputs are explicit. Stop here; no C2/C3/C4 migration is performed.

## Migrated context aspects

| Aspect | Canonical C1 location | Scope retained outside C1 |
| --- | --- | --- |
| Human/machine actor kinds and mandatory multi-user context | Existing `user`, `ai_users` and HPX boxes;HPX-CAN-007 | Principal/device/group/session record definitions and permission enforcement remain prose. |
| Mutable display names do not establish identity or authority | Human/machine box descriptions | The generic rule for other principal kinds is retained;no organisation/group/device actor was invented. |
| HPX provides versioned identifiable content and attributable exchanges | Existing HPX box description | Exact objects,events,interaction capture and contribution/provenance distinctions remain below. This is required scope,not a delivery claim. |
| View as derived presentation | Existing HPX→human output: Derived views / results | Specialised entity meanings and permission checks for each projection remain prose. No new storage engine is implied. |

Only the repeated human/machine-kind/multi-user clause and the derived-View definition in HPX-DOM-001 now delegate to C1. Other clauses remain unchanged. Partial context representation must not be mistaken for full record/schema migration.

## Not migrated in this C1 stage

| HPX-DOM-001 aspect | Existing potential later home | Reason / restriction |
| --- | --- | --- |
| Workspace as storage/key boundary | C2: encrypted .hpx workspace | Container/key scope;outside the C1 stop boundary. |
| Principal,device,group,organisation,session and grant distinctions | Runtime/API;application authority;domain records | C1 has no separate device/group/organisation blocks. Do not add actors or equate them with the credential store;retain semantics. |
| Shared API,workspace permissions,domain plans grant no authority | Runtime/API and application coordination | Enforcement is below system context;C1 actor labels do not specify it. |
| Node versus Revision;Document versus file;Branch | Pure domain / existing records block;documents/branches responsibilities | Requires object semantics and relationships below C1. |
| Occurrence identity,moves,repeated nested paths | Pure domain / existing records and expansion blocks | Existing conceptual scope,not a C1 external entity. |
| Immutable Manifest and exact closed Snapshot;no current-head reconstruction | Pure domain and workspace persistence/history | Closure/binding invariants require later scoped coverage. |
| Identifiable revisioned n-ary Hyperedge;ordered role-labelled participants and references | Domain annotation rules;graph/assertion responsibilities | Complete general relationship model is not specified by current boxes or binary context arrows. |
| Predicate versus tags;Assertion negation,certainty,attribution and context | Existing assertion/predicate blocks | Needs complete semantic coverage;do not infer truth/authority from a display arrow. |
| Event and atomic Commit boundary | Application coordination / publication;existing transaction sequence | Later-level operation/publication semantics;not migrated now. |
| Transformation versus same-node parents;exact input/output mappings | Domain source/history plans and derivation responsibilities | Cross-identity invariants remain prose;no inferred model/type implementation. |
| Interaction records versus contributions;observed/declared/inferred provenance;adoption versus verification/authorship/endorsement | Machine-user chat and provenance responsibilities | C1 states only externally observable purpose. Full record/evidence semantics remain. |
| Concepts,questions,arguments,comments and external sources as specialised entities | Existing annotation/document/graph blocks | No new C1 components or storage engines;representation remains to be engineered. |
| Whole-owned-buffer supported slice;headings/sentences as views | Browser editing,domain source plans and documents | Implementation/ownership scope below C1. |
| Mutable Draft;actor/device/base/generation/sequence;Save versus Commit;newer typing and retained history | Documents/working edits;publication/read views and existing sequences | Detailed state transitions/invariants not migrated into a context box. |
| Anchor exact revision/UTF8 ranges;UTF16 conversion;CRLF/normalisation/remapping/CRDT caveat | Domain exact-source and browser editing blocks | Exact byte/coordinate contract remains prose until fully covered below. |
| Typed logical IDs,OS entropy/application boundary,32/16-byte sizes and purity | Domain records;application/storage adapters | No ID algorithms,entropy or serialization belong in C1. |
| SecurityPolicy/epoch,key custody versus permission | Authority,persistence and crypto blocks | Detailed policy/mode changes remain unresolved/contract-owned. |
| PrivateDigest versus ciphertext StorageObjectId;deduplication/disclosure domain | Crypto addressing and persistence blocks | Existing primitive/format details are not context-level identities. |
| Prototype exclusions,client-held/federation availability,erasure exception | Existing relevant responsibilities and owner decisions | Historical/acceptance scope is not new system-context functionality. |
| Working branch,buffer,checkpoint,source identities and named-child policy | Existing working/document/source-plan blocks | Later stage only;retain source and reconcile with adopted ADR019 before migration. |

## Limits of the one-level rule

The rows above distinguish **deferred because this stage stops at C1** from **not yet demonstrated migratable under the overall constraints**. Existing later views/blocks provide candidate homes;this report does not authorise editing them. A single focused expansion of an existing block may be allowed in a later stage,but its sufficiency must be checked first. Missing object/event/interaction definitions must remain prose wherever expressing them would need additional new blocks outside an allowed expansion,more than one new decomposition level,or new owner decisions. No such expansion or exception was used here.

Source-era one-branch exclusions,absent comments/keychain claims,identifier-selection wording and the working-branch proposal status require reconciliation against later owner decisions/current evidence before a future migration. They were not silently adopted or broadly rewritten in this C1 stage.

[Retained HPX-DOM-001](../../docs/05-domain/core-object-model.md);[canonical ownership](../specification-ownership.csv);[executed checks](../evidence/dom001-c1-migration.json). Model/source and layout checks are static;no application build/tests/launch,browser,generation,proof,trust/provider/workspace change,commit or publication.
