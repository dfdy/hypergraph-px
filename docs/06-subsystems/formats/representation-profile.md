# OWNER059 representation profile — design, not active format

2026-11-14. Common adapter representation for the selected D01–D22A briefs. OWNER059 adopts the briefs; this is their engineering specification, not implemented codecs, a schema upgrade, dependency installation or real-data format acceptance. Pure domain records remain dependency-free. Existing normal schemas1/2, experimental3, candidate4, HGOB/HGWK, record wrapper1 and HTTP contract1 keep their identities.


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../../02-governance/registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-040-01` [Types, decoding and compatibility](#types-decoding-and-compatibility) | [hpx.native.storage.records](../diagrams/shared-responsibilities.c4) · `HPX-CAN-029` · [c3_workspace_persistence](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-040-02` [Upgrade and unknown readers](#upgrade-and-unknown-readers) | [hpx.native.storage.records](../diagrams/shared-responsibilities.c4) · `HPX-CAN-029` · [c3_workspace_persistence](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-040-03` [Runtime interface versus persistence](#runtime-interface-versus-persistence) | [hpx.native.transport.api](../diagrams/runtime-api.c4) · `HPX-CAN-028` · [c3_runtime_api](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-040-04` [Subsystem contracts](#subsystem-contracts) | Prose only: Authority, routing, qualification or documentation disposition remains prose; no additional software responsibility is defined. |
<!-- contract-bindings:end -->

## Types, decoding and compatibility

Reuse OWNER055 `Workspace16`, `Id32`, `U53`, `L32`, `Range`, `RecordRef`, `SourceRef` and exact interpretation/bundle references. IDs are typed by field role; equal width does not permit substituting an address, digest, Node, User, Operation or Occurrence. `Bytes` is an exact JSON integer array0..255; text is exact valid UTF8 without normalization. Human-visible names are labels, not authority. Counters must not wrap; exhaustion fails before mutation. Every array preserves order unless explicitly specified as a set; capability sets encode sorted unique ASCII names from OWNER058. Duplicate elements, fields, unknown/missing fields, wrong enum variants, non-integer counters and context/type mismatches reject. Null is allowed only for fields explicitly shown nullable.

Candidate **SQL schema5 / catalogue3 / feature38 version3** is the incompatible-reader gate for the new multi-user profile. It includes the exact candidate schema4 closure/conflict meanings rather than reinterpreting their records. New record wrapper stays `{record_version:1,record_kind:<registered kind>,payload:<typed payload>}` with canonical compact UTF8 JSON field order shown below/in the linked contracts. No Serde or JSON dependency moves into the domain. Existing kinds1–54 retain their exact version/layout; unsupported kind/version/profile is not silently skipped. Numeric assignments below are design reservations, not activated SQL or a claim that earlier candidate records exist.

| Kind | Name / storage | Exact payload field order |
| --- | --- | --- |
| 55 | WorkspaceUser / immutable lifecycle revision | `workspace,user,previous:null\|RecordRef,kind:human\|machine,provider:null\|Id32,label,status:active\|suspended,actor,operation` |
| 56 | Credential / protected mutable slot | `workspace,user,credential,kind:password\|machine,salt:Bytes,verifier:Bytes,status:active\|revoked,generation` |
| 57 | Policy / protected mutable slot | `workspace,generation,previous:null\|RecordRef,users:[{user,capabilities:[name],ceiling:[name],history_epochs:[U53]}],receipt` |
| 58 | PolicyChange / immutable | `workspace,previous_generation,next_generation,actor,target,before:RecordRef,after:RecordRef,operation,reason` |
| 59 | AuthenticationRecovery / protected mutable slot | `workspace,recovery,generation,salt:Bytes,verifier:Bytes,status:active\|consumed,operation` |
| 60 | UserWorkingState / protected mutable slot | `workspace,user,document,branch,base:RecordRef,generation,ack_sequence,bundle:RecordRef,recovery:RecordRef,operation` |
| 61 | MainBranch / protected mutable slot | `workspace,document,branch,generation,actor,operation` |
| 62 | BranchCapture / immutable | `workspace,user,document,new_branch,source_context:RecordRef,bundle:RecordRef,recovery:RecordRef,operation` |
| 63 | PredicateDefinitionRevision / immutable | `workspace,predicate,previous:null\|RecordRef,name,aliases:[text],roles:[{name,minimum:L32,maximum:null\|L32,target_kinds:[name],range_allowed:bool}],inverse:null\|{definition:RecordRef,roles:[{from:L32,to:L32}]},explanation,actor,operation` |
| 64 | InteractionManifest / immutable | `workspace,interaction,previous:null\|RecordRef,participants:[Id32],context:[{source:RecordRef,range:null\|Range,interpretation:RecordRef}],messages:[{node:RecordRef,participant,role:prompt\|context\|response\|tool_observation,ordinal:L32}],terminal:complete\|failed\|cancelled,observed_through:U53,actor,operation` |
| 65 | PendingInteraction / protected user slot | `workspace,user,interaction,generation,context:[RecordRef],observed:[RecordRef],state:prepared\|disclosing\|observing\|closing\|uncertain,operation` |
| 66 | RightsEvidence / immutable | `workspace,subject:RecordRef,claimant_label,attributed_user:null\|Id32,licence_text,source_refs:[RecordRef],status:declared\|disputed\|reviewed,previous:null\|RecordRef,actor,operation` |
| 67 | ExternalJob / protected mutable slot | `workspace,user,job,kind:backup\|export\|exchange,generation,intent:RecordRef,state:prepared\|approved\|executing\|uncertain\|verified\|failed,approval:null\|RecordRef,outcome:null\|RecordRef,operation` |
| 68 | RepairReport / immutable | `workspace,source_catalogue:RecordRef,source_fingerprint:Bytes,scope:[name],findings:[{class:name,record:null\|RecordRef}],derived_output_fingerprint:Bytes,result:valid\|incomplete\|invalid,actor,operation` |
| 69 | CitationCapture / immutable | `workspace,citation,origin:desktop\|cloud,origin_label,metadata_utf8:Bytes,resource_refs:[RecordRef],actor,operation` |
| 70 | ExportPlan / immutable private intent | `workspace,user,document,branch,bundle:RecordRef,interpretation:RecordRef,profile:name,resource_refs:[RecordRef],supplements:[name],rights:[RecordRef],policy_generation,operation` |
| 71 | ExchangeMapping / immutable | `workspace,package_id:Id32,source_namespace:Id32,foreign_refs:[{foreign:Bytes,local:RecordRef}],authority_bindings:[{foreign_label,local_user}],actor,operation` |
| 72 | AcceptanceProfile / immutable evidence/configuration | `workspace,profile,platform,toolchain,workloads:[{id,source_bytes:U53,occurrences:U53,operations:U53}],measurements:[{id,metric,unit,value_utf8}],limits_ref:RecordRef,review_ref:RecordRef,actor,operation` |
| 75 | UserHead / protected mutable slot | `workspace,user,revision:RecordRef,generation,operation` |
| 74 | ProviderIdentity / immutable administrative registry revision | `workspace,provider,canonical_key,aliases:[text],previous:null\|RecordRef,actor,operation` |
| 73 | RetainedPolicy / immutable exact policy snapshot | Same fields as57, frozen at its recorded generation; no mutable-slot reference masquerades as immutable history. |

Provider registry74 uses an explicitly administered immutable workspace-local Provider ID and a lowercase ASCII canonical provider key with unique explicit aliases; labels/models/endpoints cannot create a second provider identity by themselves. Enrolment resolves that registry before user55 creation and atomically enforces one machine user per provider, including suspended users. Registry labels are administrative bindings, not proof of remote provider identity or an HPX inference account.

Human55 requires provider=null;machine55 requires an existing ProviderIdentity74. New users begin suspended until explicit credential enrolment/activation;initial bootstrap alone creates the first active human under its special ceremony. Workspace/user/provider ownership and immutable previous links are validated before transaction publication.

UserHead75 is canonical current lifecycle state and changes atomically with immutable55, policy generation, uniqueness validation and receipt; a guessed latest55 object cannot replace it. No user deletion or implicit provider-slot release is selected.

`name` is a registered lower-ASCII identifier, not an arbitrary enum accepted by the decoder. Predicate target kinds are explicitly from node/revision/document/branch/occurrence/anchor/hyperedge/assertion/context; package roles are canonical_record/resource/keyring/resource_slice. Other positions use only their contract-defined registry. Unknown names reject.

Additional candidate records use the same wrapper1 and decoder rules. These complete durable private intents and retained foreign evidence; none is a new domain serialization dependency.

| Kind | Name / storage | Exact payload field order |
| --- | --- | --- |
| 76 | ExternalIntent / immutable private | `workspace,user,job,purpose:backup\|exchange,package_id,manifest_digest:Bytes,source:RecordRef,destination:Destination,policy:RecordRef,scope:RecordRef,operation` |
| 77 | ExplicitApproval / immutable private | `workspace,user,intent:RecordRef,intent_fingerprint:Bytes,approved_by:Id32,operation` |
| 78 | ForeignNamespace / immutable | `workspace,source_namespace,source_profile,source_catalogue_digest:Bytes,objects:[{foreign:Bytes,parts:[RecordRef]}],interpretation_refs:[RecordRef],key_refs:[RecordRef],origin_evidence:RecordRef,operation` |
| 79 | RetainedEvidencePart / immutable protected | `workspace,role:foreign_record\|resource\|key_wrap,source_identity:Bytes,start:U53,total:U53,bytes:Bytes,operation` |
| 80 | KeyCatalogue / protected mutable slot | `workspace,generation,current_epoch,entries:[{epoch:U53,suite:xchacha20poly1305_v1,wrapped_key:RecordRef,retained:bool}],receipt:RecordRef` |

`Destination` is tagged `{kind:"github",account,repository,branch,path,visibility:private|public,expected_absent:true}` or `{kind:"workspace",namespace:Workspace16,channel_fingerprint:Bytes}`. These are exact approved target labels/identities, never credential storage. `manifest_digest` fingerprints the exact encrypted package manifest. Jobs67 reference intent76/export-plan70 and explicit approval77; approval binds the immutable intent rather than a circular mutable intent/approval reference. ForeignNamespace78 retains source-qualified identity and ordered part79 references; validate total lengths/ranges before reassembly/authentication and never equate an imported user label with local authority. Evidence parts respect the encoded16MiB envelope limit including JSON overhead; splitting changes physical parts, not original bytes or logical historical source identity. KeyCatalogue80 is canonical and has supported unique epochs; wrapping uses managed adapters with no raw key export or new envelope suite.

`actor`, `target` and `user` are workspace-local User IDs; `operation` is the original operation ID; `generation/ack_sequence` are U53. `reason/explanation/labels` are exact text. `RecordRef` carries kind/version/id/generation and must be valid at that field position; permission is independently checked. Set-valued user/policy/epoch lists are unique and canonically sorted by ID/integer. No user/group/node ACL or extra machine user is implied. Assertion definitions use kind63 only in this future profile; current predicate kinds12–16 are not changed.

Immutable audit/receipt/reference payloads use an immutable exact policy73 when they require historical policy evidence; a current57 slot is never treated as a retained old generation. Object and mutable-slot IDs are independently allocated opaque values with expected workspace/kind/generation supplied by the application. The key catalogue is protected canonical state, never a derived index. Existing encryption contexts bind expected workspace, kind, logical ID and generation; no caller chooses context from untrusted envelope headers. New payloads remain within the existing16MiB per-object crypto limit; larger logical resources use explicit authenticated bounded part references. Operational profiles may impose lower measured limits.

## Upgrade and unknown readers

Opening never upgrades. An explicit authorised upgrade freezes source schema/catalogue and creates/verifies a consistent encrypted backup before writing an isolated candidate schema5 copy. Preserve all original immutable records and original receipts; bind new policy/user mappings explicitly rather than relabel historical publishers. Validate all supported record families, closure references, catalogue/key access and source bytes, then report exact compatibility and activate only the expected unchanged source. Any failure leaves the original usable; no missing record is fabricated. A genuine retained older executable must reject schema5 before interpreting the new catalogue. Actual older-reader, crash, wrong-key and backed-up upgrade cases are unexecuted.

## Runtime interface versus persistence

These are persistent adapter DTOs, not a new public API or generated OpenAPI update. Logical commands below are mapped by browser/MCP adapters into one application interface. All results use explicit `ok`, `denied`, `conflict`, `unsupported`, `invalid`, `resource`, `locked` or `uncertain` outcomes. Errors disclose no protected labels/counts/receipts. Unsupported software/profile never resets a workspace or falls back to plaintext. Existing wire acceptance remains unchanged until its own reviewed implementation/compatibility work.

## Subsystem contracts

- [Authority lifecycle, policy, keys and custody](../contracts/authority-lifecycle.md) — D01–D05A.
- [Exact editing, working state and Graph](../contracts/editing-and-graph.md) — D06–D11A.
- [Shared user API, chat and MCP](../contracts/shared-api-chat-mcp.md) — D12–D13A.
- [Persistence, repair, packages and exchange](../contracts/persistence-and-exchange.md) — D14–D16A and D20A.
- [Rights, export, integrations and delivery](../contracts/integrations-and-delivery.md) — D17–D22A.
- Selected-brief completion and evidence.
