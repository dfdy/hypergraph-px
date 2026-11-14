# HPX-DOM-001 staged migration — C2 complete

Authority: HPX-OWNER-036, the owner's explicit C2 prompt following the visible-chat diagnostic. This supersedes the C1 stopping instruction only for this stage. HPX-CAN-008 owns the bounded transfer below. C1 and all C3/C4/sequence sources remain unchanged. Only descriptions in the existing `c2_containers` view change; no view, element, relationship, caption, navigation target, grouping, layout instruction or saved layout is added or changed.

## Exact clause ownership

Locations below are existing view includes in [C2 / HPX containers](../C2/containers.c4), not new global element definitions. Source spans identify inherited clauses; source files, hashes, claim wording and historical registers remain unchanged. The [retained contract](../../05-domain/core-object-model.md) links to these definitions.

| HPX-DOM-001 clause / source | Canonical C2 location | Transfer limit / retained contract |
| --- | --- | --- |
| “Workspace is the storage/key boundary.” HPX-SRC-0023:L7, HPX-CLAIM-00104 | `c2_containers`: `include hpx.workspace` description | Complete boundary meaning transfers. Device/group/session/grant distinctions and chat-node record meaning remain prose. |
| Shared-user-API paragraph: attributable human/AI users; identity, ownership/contribution, occurrence, session and key availability distinct from permission; pure plans grant no authority. Later clarification, HPX-OWNER-029–033 / HPX-RQ-037–038 | `include hpx.native` and `include hpx.browser -> hpx.native` descriptions | Complete paragraph delegates container responsibility. Exact enforcement/replay/disclosure obligations remain in [API contract](../../06-subsystems/interfaces/browser-runtime.md); user cardinality remains HPX-CAN-002. No new mechanism. |
| View's container allocation and “Sharing and permission checks apply to every projection.” HPX-SRC-0023:L15, HPX-CLAIM-00108 | `include hpx.browser` description | Complete projection-permission clause transfers. View's definition stays at completed C1 / HPX-CAN-007; specialised-entity meanings remain prose. |
| “Heading/sentence boundaries are views, not physical nodes created on every keystroke.” HPX-SRC-0023:L19, HPX-CLAIM-00109 | `include hpx.browser` description, responsibility only | Retained in the precise whole-owned-buffer contract; C2 allocates presentation but does not migrate source-binding or editing semantics. |
| Domain purity and application/storage generation boundary. HPX-SRC-0023:L25, HPX-CLAIM-00112 | `include hpx.native` description, execution responsibility only | Typed IDs, OS entropy, exact sizes and generation rules stay prose. No serialization, randomness or authority moves into the pure domain. |
| Logical IDs are not digests/physical addresses; PrivateDigest versus StorageObjectId; equality grants no disclosure. HPX-SRC-0023:L25 and HPX-SRC-0026:L15–29, HPX-CLAIM-00112/00114/00115 | `include hpx.workspace` and `include hpx.native -> hpx.workspace` descriptions, boundary only | Full typed record table, deduplication/encryption-domain decisions, algorithms, canonical signing and epochs stay prose / [crypto contract](../../06-subsystems/interfaces/crypto-adapter.md) / [workspace format](../../06-subsystems/formats/hpx-workspace.md). |

The view description binds the allocations together inside the existing HPX subject boundary; human/machine callers, dependencies and artifacts remain outside. Existing directional captions remain intact. Workspace is a data/key boundary, not a new domain-object component. Architectural descriptions cover responsibility; conceptual relationships, operation effects and precise invariants retain their separate homes under HPX-OWNER-035. No conceptual or sequence view was created.

## Reconciliation without source rewriting

HPX-DOM-001 explicitly qualifies its historical one-branch slice, initial absent-comment/keychain list and source-era no-ID-algorithm statement. ADR014, ADR018/019 and current evidence retain their respective authority; none becomes a new C2 mechanism. The stale working-branch proposal-only summary reflects ADR019's explicit adoption. Generic organisation/group principal wording remains source-era record scope, not a new user kind/container or permission scheme. HPX-OWNER-030/031/033 govern current workspace-local human/machine scope. Original source hashes, paths and claim text remain in existing registers; no private source/archive is copied or published.

## Deferred levels versus genuine gaps

| Classification | Remaining material | Before a later stage |
| --- | --- | --- |
| Later-level responsibility/invariant coverage | Node/Revision, Document/Branch, Occurrence paths and moves, immutable Manifest/closed Snapshot; hyperedges/predicates/assertions; Event/atomic Commit; transformation versus same-node ancestry; interaction versus contribution/provenance/adoption | Check existing C3 ownership before transferring any clause. Retain the [complete C1 deferment inventory](dom001-c1-migration.md) and HPX-DOM-001 precision. Candidate components do not establish complete conceptual definitions. |
| Later-level execution/format coverage | Whole-owned-buffer/draft acknowledgement versus Commit/newer typing/recovery; anchors/UTF8/UTF16/exact bytes; typed IDs/entropy/purity; working branches/checkpoints/named-child policy; epochs, addressing and immutable retention/erasure exception | Keep linked contracts, accepted ADRs and bounded evidence separate. No type, field, format, operation sequence or runtime change is selected. |
| Genuine modelling sufficiency gap | Full conceptual identities, cardinalities and lifecycle relationships, plus operation effects, are not expressed by container descriptions | A later owner-authorised stage must determine whether existing blocks/descriptions suffice or permit complementary conceptual/sequence work under HPX-OWNER-035. The present no-new-view/block/relationship limit cannot be bypassed. |
| Genuine design gaps | User/device/group/session/grant representations; permission vocabulary/administration; chat/MCP records/adapters; general signing/addressing/deduplication/custody and federation mechanisms | Remain unadopted mechanisms in existing contracts/open questions. C3 allocation need not invent them or treat accepted scope as delivery. |

C2 needs no new substantive design decision. Before C3, the owner must authorise its bounded scope; any new conceptual views, elements, relationships or operation-effect changes require permission beyond this stage.

## Executed verification

[Machine evidence](../evidence/dom001-c2-migration.json) and HPX-TEST-122 record actual syntax, computed-model, navigation, link, scope and byte-preservation checks. Static layout preservation is not rendered visual acceptance. No browser, application build/test/launch, provider/trust/workspace action, commit, push or publication occurred.

Initial sandboxed Git/Python calls reported an invalid developer path; sandboxed Perl could not load its system library and Node was inaccessible. These are sandbox-access limitations, not a broken macOS installation. Escalated read-only Git status and installed interpreter calls succeeded. The first model snapshot attempt encountered a circular wrapper; capturing plain model data succeeded before edits. No repair, reinstall or tool reset occurred.


## Owner-reported layout correction

The initial saved-geometry check missed LikeC4 label drift: the preview comparison displayed the tall automatic arrangement although owner coordinates were intact. HPX-TEST-123 records the correction: synchronize only description metadata and hash in the existing C2 saved snapshot, preserving its original formatting, all17 box positions/sizes and17 curve paths. Current model source and labels remain unchanged. Explicit manual, automatic-comparison and served-diagram checks now report zero node/edge/view drift; diagram-serving path returns the saved manual arrangement. This supersedes any implication that HPX-TEST-122 established drift-free visual delivery. Its original as-run checks remain evidence; no browser or rendered inspection is claimed.

## C3 executable overview allocation — HPX-OWNER-037

The owner subsequently authorises responsibility allocation in the existing [C3 Rust executable overview](../C3/executable.c4) only. HPX-CAN-009 owns the complete allocation, not the underlying conceptual definitions. Eight overview-only `notes` overrides allocate pure identities/invariants/plans to `hpx.native.domain`; authorization, editing/operation coordination, atomic publication and protected reads to `hpx.native.application`; versioned adapter records/history/heads/recovery to `hpx.native.storage`; shared human/machine admission and policy routing/enforcement to `hpx.native.transport`. Crypto, keychain, integrations and frontend delivery retain supporting scopes only. These notes are canonical; the table below tracks gaps rather than repeating their contracts. Global elements/relationships, labels, C1/C2, focused expansions, C4 and sequences remain unchanged. No HPX-DOM-001 definition is removed in this stage.

| Original gap | Represented at this stage | Precise contract retained | Named later stage / decision disposition |
| --- | --- | --- | --- |
| 1. Node/Revision/Document/Branch/Occurrence/Manifest/closed Snapshot; cardinalities/lifecycle and exact occurrence-path closure | Domain owns pure rules/plans; application validates full results and coordinates publication; persistence retains exact bindings/history. Responsibility allocation only. | [HPX-DOM-001 identities](../../05-domain/core-object-model.md#identity-and-representations); [domain/navigation](../../06-subsystems/interfaces/domain-navigation.md) | Proposed next: existing `c3_pure_domain` expansion; then separately authorised conceptual identity/closure work and operation-effect sequences. Complete conceptual coverage remains open; no new schema/closure algorithm adopted. |
| 2. Revisioned n-ary hyperedges, ordered role-labelled participants, predicates/assertions, events and observable interactions/provenance | Domain validates meanings/plans; application coordinates attributable operations/interactions; persistence stores authorised evidence. No binary-arrow limitation or inferred authorship/endorsement. | [HPX-DOM-001](../../05-domain/core-object-model.md#identity-and-representations); [assertions](../../05-domain/assertions-and-predicates.md); [provenance](../../05-domain/provenance-model.md); [chat/MCP](../../06-subsystems/ai-collaboration.md) | Later `c3_pure_domain` / `c3_application` expansions, then authorised conceptual relationship/provenance views and operation-effect sequences; existing C4 implementation mapping only afterwards. General hyperedge/interaction representations remain design gaps, not delivered by overview notes. |
| 3. Principal/device/group/session/permission; policy epochs; logical IDs/private digests/ciphertext addresses | Runtime/API admits workspace-local users; application enforces current authority; domain plans grant none; persistence/crypto/keychain support distinct addressing, context and unlock. | [API](../../06-subsystems/interfaces/browser-runtime.md); [security](../../06-subsystems/security-cryptography.md); [crypto](../../06-subsystems/interfaces/crypto-adapter.md); [record format](../../07-implementation/data-structures/sqlite-records.md); [HPX-DOM-001 record categories](../../05-domain/core-object-model.md#1-distinct-record-identities) | Later `c3_runtime_api`, `c3_application`, `c3_workspace_persistence` and supporting crypto/keychain expansions. Actual owner/design gaps: permission administration/representation, user/device/group/session records, authenticated policy epochs and general commitments/signing/custody. OWNER030/031/033 retain workspace-local users, one machine user/provider/workspace, no separate node ACL and machine-side inference; source categories authorise no new actor or format. |
| 4. Conceptual versus architectural views | Overview explicitly allocates ownership/use only. Notes do not establish identities, cardinalities, lifecycle or operation effects. | [Standing four-part convention](../SPECIFICATION.md#standing-modelling-convention) and all precise contracts above | Separate owner-authorised conceptual-view and operation-effect-sequence stages remain necessary where existing descriptions cannot express complete coverage. No conceptual gap is closed here and no new view is authorised. |
| 5. Stale single-branch/exclusion, identifier-selection and checkpoint-proposal wording | C2 reconciliation inspected and retained: initial slices/exclusions remain historical, local OS-random evidence does not adopt general signing rules, ADR019 is adopted. Notes distinguish requirements and bounded current evidence. | [C2 reconciliation](#reconciliation-without-source-rewriting); [HPX-DOM-001 qualifications](../../05-domain/core-object-model.md); [adopted ADR019](../../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) | No additional wording conflict needs a new decision in this overview scope. Later `c3_pure_domain` / `c3_application` checkpoint/branch allocation must retain adopted design versus actual implementation and historical source provenance; no implementation is inferred here. |

Existing accepted product obligations remain accepted; current one-owner code is partial evidence and proposed mechanisms remain unadopted. No public API, identity/grant format, security-policy mechanism or inference service is selected. [C3 overview evidence](../evidence/dom001-c3-overview.json), HPX-TEST-124, records pre-edit saved/served layout capture and post-edit syntax, isolation, navigation, links, scope and served-manual zero-drift checks. No rendered inspection is available or claimed. Stop here for owner review; the proposed next focused expansion is `c3_pure_domain`, requiring a new instruction.

## C3 Pure domain allocation — HPX-OWNER-038

The owner subsequently authorises only the existing [Pure domain expansion](../C3/pure-domain.c4). HPX-CAN-010 owns its five view-only allocation notes: `exact` for typed identities/exact coordinates; `source_plans` for exact fragment/derivation/checkpoint plans; `annotation_rules` for relationship/assertion checks; `history_plans` for supplied same-node history/provenance planning; `expansion_rules` for supplied expansion validation. Required scope and actual helper limits are distinct. View-level links retain the full contracts; no conceptual definition or invariant prose is removed. Global elements, labels, relationships and navigation remain unchanged; C4 and sequences are untouched.

| Original gap | This stage's bounded disposition | Remaining work / retained authority |
| --- | --- | --- |
| 1. Core identities, cardinalities/lifecycle and exact occurrence-path closure | Allocated to `exact`, `history_plans` and `expansion_rules`; typed data and Kahn validation are explicitly incomplete coverage. | [Core identities](../../05-domain/core-object-model.md#identity-and-representations) and [navigation](../../06-subsystems/interfaces/domain-navigation.md) remain precise authority. Later separately authorised conceptual identity/lifecycle/closure work and operation-effect sequences; no closure algorithm adopted. |
| 2. Revisioned n-ary relationships, predicates/assertions, events and interactions/provenance | `annotation_rules`, `source_plans` and `history_plans` identify required pure checks versus bounded binary/comment/capture/history helpers. | [Core model](../../05-domain/core-object-model.md), [assertions](../../05-domain/assertions-and-predicates.md) and [provenance](../../05-domain/provenance-model.md) retained. General relationship/event/interaction representation and conceptual coverage remain open; application capture/publication needs its own expansion stage, then authorised sequences/C4 evidence. |
| 3. Principal/device/group/session/permission, epochs and ID/digest/address distinctions | `exact` retains distinctions without implementing authority or formats; all five notes exclude authority/I/O/persistence where relevant. | OWNER030/031/033, [API](../../06-subsystems/interfaces/browser-runtime.md) and [security](../../06-subsystems/security-cryptography.md) remain governing. Later application/runtime/persistence/supporting-adapter allocations; actual identity/permission/policy-epoch/signing/custody mechanisms remain unadopted. No actors, ACLs or formats invented. |
| 4. Conceptual versus architectural coverage | Five existing responsibilities receive allocation only; no conceptual gap is closed. | [Four-part convention](../SPECIFICATION.md#standing-modelling-convention) retained. Conceptual cardinalities/lifecycle and operation-effect sequences need separate authorisation. Existing C4 links remain navigation, not proof of concept completeness. |
| 5. Historical exclusions/identifier selection/checkpoint proposal status | C2 reconciliation remains intact; `source_plans` expressly distinguishes adopted ADR019 from current bounded capture helpers. | [Historical qualifications and source provenance](../../05-domain/core-object-model.md) and [ADR019](../../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) retained. No new affected wording conflict or owner decision is needed here; future checkpoint/Commit coordination must preserve adoption versus implementation. |

[Executed evidence](../evidence/dom001-c3-pure-domain.json), HPX-TEST-125, records syntax, links, scoped ownership, model/navigation preservation and exact saved/served manual geometry with zero drift. No rendered inspection is claimed. Stop after this expansion. Recommended next stage: existing `c3_application` expansion for authority, draft/Commit coordination, events/interactions and protected reads; not yet authorised. Conceptual views and sequences remain separate future work.


## Successive responsibility allocations — HPX-OWNER-039

OWNER039 supersedes earlier routine stage-stop requirements. Each verified allocation below retains all five gaps and exact contracts, adds no conceptual completeness claim and changes no C4 or sequence. Final conceptual sufficiency is assessed after independent allocations.


### Application coordination allocation — HPX-CAN-011

Existing view-only notes own the bounded responsibility allocation; required obligations and current implementation limits remain distinct. Canonical locations: `c3_application` (`hpx.native.application.admission`, `hpx.native.application.replay`, `hpx.native.application.dispatch`, `hpx.native.application.publication`, `hpx.native.application.reads`). Precise linked contracts remain: [core-object-model](../../05-domain/core-object-model.md); [draft-publication](../../07-implementation/protocols/draft-publication.md); [browser-runtime](../../06-subsystems/interfaces/browser-runtime.md); [ai-collaboration](../../06-subsystems/ai-collaboration.md); [provenance-model](../../05-domain/provenance-model.md). No conceptual definition is removed.

| Gap | Current disposition |
| --- | --- |
| 1 | Core identities/closure: coordinating complete plans/results allocated; conceptual cardinalities/lifecycle and full closure stay in domain/navigation contracts. |
| 2 | Relationships/events/interactions: dispatch/publication responsibilities allocated; general n-ary/interaction representations and conceptual provenance remain open. |
| 3 | Identity/permission/epochs/addressing: admission/replay/reads distinguish authority from identity/unlock; exact schemes remain unadopted under OWNER030/031/033. |
| 4 | Conceptual versus architectural: allocation and current writer evidence do not establish conceptual coverage; later conceptual/operation-effect work remains separate. |
| 5 | Historical wording: C2 qualifications and adopted ADR019 retained; no new wording conflict or implicit implementation claim. |

HPX-TEST-126 / [executed evidence](../evidence/dom001-allocation-application.json) verify syntax, source/link/navigation/ownership, unchanged other views and saved/served manual layout with zero drift; labels, bounds and paths preserved. Static evidence only, no rendered inspection. Next authorised allocation: Workspace persistence.


### Workspace persistence allocation — HPX-CAN-012

Existing view-only notes own the bounded responsibility allocation; required obligations and current implementation limits remain distinct. Canonical locations: `c3_workspace_persistence` (`hpx.native.storage.access`, `hpx.native.storage.records`, `hpx.native.storage.record_store`, `hpx.native.history`, `hpx.native.recovery`). Precise linked contracts remain: [core-object-model](../../05-domain/core-object-model.md); [workspace-storage](../../06-subsystems/workspace-storage.md); [hpx-workspace](../../06-subsystems/formats/hpx-workspace.md); [sqlite-records](../../07-implementation/data-structures/sqlite-records.md); [recovery](../../08-assurance/recovery.md). No conceptual definition is removed.

| Gap | Current disposition |
| --- | --- |
| 1 | Core identities/closure: versioned persistence and exact reconstruction allocated; full occurrence-path/cardinality/lifecycle definitions remain contract-owned. |
| 2 | Relationships/events/interactions: authorised immutable evidence storage allocated; general record layouts/interaction representation remain unadopted, not inferred from current kinds. |
| 3 | Identity/permission/epochs/addressing: storage/key boundary and address distinctions retained; application authority and unadopted policy/key mechanisms remain separate. |
| 4 | Conceptual versus architectural: persistence blocks and SQLite transactions do not complete conceptual or authenticated-provenance definitions. |
| 5 | Historical wording: original one-branch/exclusion/ID-selection statements remain historically qualified;ADR019 acceptance does not select new persisted bytes or establish full delivery. |

HPX-TEST-127 / [executed evidence](../evidence/dom001-allocation-persistence.json) verify syntax, source/link/navigation/ownership, unchanged other views and saved/served manual layout with zero drift; labels, bounds and paths preserved. Static evidence only, no rendered inspection. Next authorised allocation: Runtime/API.


### Runtime and API allocation — HPX-CAN-013

Existing view-only notes own the bounded responsibility allocation; required obligations and current implementation limits remain distinct. Canonical locations: `c3_runtime_api` (`hpx.native.transport.security`, `hpx.native.transport.api`, `hpx.native.transport.lifecycle`, `hpx.native.transport.client_access`, `hpx.native.transport.responses`). Precise linked contracts remain: [core-object-model](../../05-domain/core-object-model.md); [browser-runtime](../../06-subsystems/interfaces/browser-runtime.md); [ai-collaboration](../../06-subsystems/ai-collaboration.md); [security-cryptography](../../06-subsystems/security-cryptography.md). No conceptual definition is removed.

| Gap | Current disposition |
| --- | --- |
| 1 | Core identities/closure: API carries exact logical targets/context;does not define cardinalities/lifecycle or resolve general snapshot closure. |
| 2 | Relationships/events/interactions: shared operation admission includes required graph/chat semantics;wire and record mechanisms remain unadopted. |
| 3 | Identity/permission/epochs/addressing: authentication/unlock/resource authority explicitly separated;workspace-local cardinality and no extra ACL retained;permission/session/epoch formats remain decisions. |
| 4 | Conceptual versus architectural: admission/response components are adapter responsibilities,not a conceptual object or security model. |
| 5 | Historical wording: current one-owner endpoints remain bounded evidence;C2 qualifications and adopted ADR019 remain authoritative without new delivery claims. |

HPX-TEST-128 / [executed evidence](../evidence/dom001-allocation-runtime.json) verify syntax, source/link/navigation/ownership, unchanged other views and saved/served manual layout with zero drift; labels, bounds and paths preserved. Static evidence only, no rendered inspection. Next authorised allocation: Browser presentation and interface functions.


### Browser presentation and interface functions allocation — HPX-CAN-014

Existing view-only notes own the bounded responsibility allocation; required obligations and current implementation limits remain distinct. Canonical locations: `c3_browser` (`hpx.browser.ui`, `hpx.browser.functions`), `c3_browser_ui` (`hpx.browser.ui.editor`, `hpx.browser.ui.contents`, `hpx.browser.ui.graph_tab`, `hpx.browser.ui.interaction`, `hpx.browser.ui.investigation`), `c3_browser_functions` (`hpx.browser.shell`, `hpx.browser.access`, `hpx.browser.editor`, `hpx.browser.coordination`, `hpx.browser.history`, `hpx.browser.annotations`). Precise linked contracts remain: [core-object-model](../../05-domain/core-object-model.md); [text-and-anchors](../../05-domain/text-and-anchors.md); [frontend-interaction](../../06-subsystems/frontend-interaction.md); [browser-runtime](../../06-subsystems/interfaces/browser-runtime.md); [ai-collaboration](../../06-subsystems/ai-collaboration.md); [draft-publication](../../07-implementation/protocols/draft-publication.md). No conceptual definition is removed.

| Gap | Current disposition |
| --- | --- |
| 1 | Core identities/closure: presentation/request contexts allocated;general cardinalities,lifecycle and exact nested occurrence closure remain conceptual/domain contracts. |
| 2 | Relationships/events/interactions: UI and request responsibilities allocated;panels/planned graph tab do not define or deliver general hyperedge/chat/provenance records. |
| 3 | Identity/permission/epochs/addressing: browser admission/unlock/authority distinctions retained;no client key-custody,actor,ACL or wire mechanism invented. |
| 4 | Conceptual versus architectural: derived views and interface responsibilities are not conceptual identity/relationship models;separate conceptual work remains. |
| 5 | Historical wording: current whole-buffer/one-owner browser evidence stays scoped;ADR019 and adopted navigation policy remain distinct from unimplemented general collaboration. |

HPX-TEST-129 / [executed evidence](../evidence/dom001-allocation-browser.json) verify syntax, source/link/navigation/ownership, unchanged other views and saved/served manual layout with zero drift; labels, bounds and paths preserved. Static evidence only, no rendered inspection. Next authorised allocation: Cryptographic adapter supporting allocation.


### Cryptographic adapter supporting scope allocation — HPX-CAN-015

Existing view-only notes own the bounded responsibility allocation; required obligations and current implementation limits remain distinct. Canonical locations: `c3_crypto` (`hpx.native.crypto.envelopes`, `hpx.native.crypto.wrapping`, `hpx.native.crypto.addressing`). Precise linked contracts remain: [core-object-model](../../05-domain/core-object-model.md); [security-cryptography](../../06-subsystems/security-cryptography.md); [crypto-adapter](../../06-subsystems/interfaces/crypto-adapter.md); [crypto-envelopes](../../06-subsystems/formats/crypto-envelopes.md). No conceptual definition is removed.

| Gap | Current disposition |
| --- | --- |
| 1 | Core identities/closure: crypto supports supplied logical bindings but does not define conceptual identities or occurrence-path closure. |
| 2 | Relationships/events/interactions: authenticated ciphertext alone does not establish attribution,authorship or complete provenance/event semantics. |
| 3 | Identity/permission/epochs/addressing: supporting distinctions allocated;general authenticated policy,commitment/signature/custody mechanisms remain decisions. |
| 4 | Conceptual versus architectural: primitive/envelope blocks are supporting responsibilities,not a conceptual authority or object model. |
| 5 | Historical wording: local OS-random identity evidence and retained future signing-selection wording stay scoped;no algorithm or format adoption inferred. |

HPX-TEST-130 / [executed evidence](../evidence/dom001-allocation-crypto.json) verify syntax, source/link/navigation/ownership, unchanged other views and saved/served manual layout with zero drift; labels, bounds and paths preserved. Static evidence only, no rendered inspection. Next authorised allocation: Keychain supporting allocation;material/derivation unchanged because existing key-entropy/KDF scopes add no DOM001 allocation.


### Keychain supporting scope allocation — HPX-CAN-016

Existing view-only notes own the bounded responsibility allocation; required obligations and current implementation limits remain distinct. Canonical locations: `c3_keychain` (`hpx.native.keychain.lifecycle`, `hpx.native.keychain.unlock`). Precise linked contracts remain: [core-object-model](../../05-domain/core-object-model.md); [0014-keychain-unlock-policy](../../04-architecture/decisions/0014-keychain-unlock-policy.md); [security-cryptography](../../06-subsystems/security-cryptography.md). No conceptual definition is removed.

| Gap | Current disposition |
| --- | --- |
| 1 | Core identities/closure: workspace key support does not define content/occurrence identity or closed-snapshot lifecycle. |
| 2 | Relationships/events/interactions: unlock neither publishes graph events nor establishes provenance/authorship;ordinary application semantics remain required. |
| 3 | Identity/permission/epochs/addressing: key availability and principal/session/resource permission remain distinct;no new directory,policy epoch or custody mechanism. |
| 4 | Conceptual versus architectural: keychain adapter is supporting infrastructure,not a conceptual user/authority model. |
| 5 | Historical wording: ADR014 supersedes initial no-keychain exclusion;retained source history and bounded macOS evidence are distinct from accepted policy. |

HPX-TEST-131 / [executed evidence](../evidence/dom001-allocation-keychain.json) verify syntax, source/link/navigation/ownership, unchanged other views and saved/served manual layout with zero drift; labels, bounds and paths preserved. Static evidence only, no rendered inspection. Next authorised allocation: Integration supporting allocation;provider/backup/cleanup unchanged because existing ADR014 scopes already preserve exact key/recovery boundaries.


### Integration supporting scope allocation — HPX-CAN-017

Existing view-only notes own the bounded responsibility allocation; required obligations and current implementation limits remain distinct. Canonical locations: `c3_integrations` (`hpx.native.integrations.agents`, `hpx.native.integrations.word_import`, `hpx.native.integrations.export`). Precise linked contracts remain: [core-object-model](../../05-domain/core-object-model.md); [provenance-model](../../05-domain/provenance-model.md); [ai-collaboration](../../06-subsystems/ai-collaboration.md); [import-export](../../06-subsystems/import-export.md); [browser-runtime](../../06-subsystems/interfaces/browser-runtime.md). No conceptual definition is removed.

| Gap | Current disposition |
| --- | --- |
| 1 | Core identities/closure: exact input/output context allocated;general occurrence closure and conceptual lifecycle remain domain contracts. |
| 2 | Relationships/events/interactions: source mappings and observable chat/contribution distinctions allocated;general interaction/derivation/relationship record mechanisms remain unadopted. |
| 3 | Identity/permission/epochs/addressing: integrations use shared workspace-user permissions;no separate inference endpoint/account,privileged writer,ACL or crypto format introduced. |
| 4 | Conceptual versus architectural: planned adapter roles do not establish conceptual representations or implementation;new conceptual coverage remains separate work. |
| 5 | Historical wording: original exclusions remain scoped development history;mandatory machine-user scope and adopted ADR019 are not inferred implemented from planned integrations. |

HPX-TEST-132 / [executed evidence](../evidence/dom001-allocation-integrations.json) verify syntax, source/link/navigation/ownership, unchanged other views and saved/served manual layout with zero drift; labels, bounds and paths preserved. Static evidence only, no rendered inspection. Next authorised allocation: Stopped at owner request after this stage;conceptual-sufficiency assessment remains pending. Citations/GitHub/federation unchanged:existing frozen-metadata,external-outcome and future-convergence scopes already preserve relevant distinctions;frontend-delivery expansion unchanged because C2/overview already allocate asset delivery without domain authority.


## Conceptual-sufficiency assessment after allocations

[Clause-to-coverage assessment and bounded next steps](dom001-conceptual-sufficiency.md) evaluate all five gaps against OWNER034/035/039. Allocations remain complete only in their bounded scopes; no conceptual definition is transferred or removed. A source-backed one-level conceptual identity/closure drill-down from existing Pure domain/exact fits standing authority; no immediate substantive owner decision blocks it. Full conceptual migration remains incomplete, with precise contracts and unadopted mechanisms retained. Assessment only: no concept, model/layout, C4 or sequence changes. HPX-TEST-133/[evidence](../evidence/dom001-conceptual-sufficiency.json).


## M1 content identity and closed state — HPX-CAN-018

One flat conceptual expansion of existing `hpx.native.domain.exact`, reached by the supplemental source link in `c3_pure_domain`; primary navigation is unchanged. Canonical [view definition](../Conceptual/identity-closure.c4) owns only displayed conceptual meanings/relations. Precise contracts remain: [core-object-model](../../05-domain/core-object-model.md); [document-semantics](../../05-domain/document-semantics.md); [domain-navigation](../../06-subsystems/interfaces/domain-navigation.md). No schema or implementation is inferred; no precise invariant prose is removed.

Core identity relationships are now explicit in M1; full closure mechanisms, relationship/event/interaction concepts, authority formats and operation effects remain open. Conceptual and architectural views remain distinct; historical source qualifications and adopted ADR019 remain intact.

HPX-TEST-134 / [evidence](../evidence/dom001-concept-m1.json) record no-layout syntax, model/source/navigation/ownership checks and only affected served manual layouts. Existing labels/bounds/positions/paths are preserved; unrelated snapshots are hash-checked. Full layout regression is deferred to the coherent milestone under AGENTS26. No rendered inspection or application/runtime/publication action. Next: M2 relationships and assertion context.


## M2 relationships and assertion context — HPX-CAN-019

One flat conceptual expansion of existing `hpx.native.domain.annotation_rules`, reached by the supplemental source link in `c3_pure_domain`; primary navigation is unchanged. Canonical [view definition](../Conceptual/relationships.c4) owns only displayed conceptual meanings/relations. Precise contracts remain: [core-object-model](../../05-domain/core-object-model.md); [assertions-and-predicates](../../05-domain/assertions-and-predicates.md); [0010-semantic-annotation-snapshots](../../04-architecture/decisions/0010-semantic-annotation-snapshots.md); [text-and-anchors](../../05-domain/text-and-anchors.md). No schema or implementation is inferred; no precise invariant prose is removed.

Gap1 reuses M1 identities/closed states;exact closure/bytes remain contracts. Gap2 now adds bounded relationship/claim/anchor/overlay concepts,not full event/interaction lifecycle. Gap3 authority/formats remain unadopted. Gap4 is explicitly conceptual,not software. Gap5 keeps original fixture evidence scoped and adopted ADR010/019 separate from implementation.

HPX-TEST-135 / [evidence](../evidence/dom001-concept-m2.json) record no-layout syntax, model/source/navigation/ownership checks and only affected served manual layouts. Existing labels/bounds/positions/paths are preserved; unrelated snapshots are hash-checked. Full layout regression is deferred to the coherent milestone under AGENTS26. No rendered inspection or application/runtime/publication action. Next: M3 provenance and working state.


## M3 provenance and working state — HPX-CAN-020

One flat conceptual expansion of existing `hpx.native.domain.source_plans`, reached by the supplemental source link in `c3_pure_domain`; primary navigation is unchanged. Canonical [view definition](../Conceptual/provenance-working.c4) owns only displayed conceptual meanings/relations. Precise contracts remain: [core-object-model](../../05-domain/core-object-model.md); [provenance-model](../../05-domain/provenance-model.md); [0019-working-branches-and-reference-checkpoints](../../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [ai-collaboration](../../06-subsystems/ai-collaboration.md); [draft-publication](../../07-implementation/protocols/draft-publication.md). No schema or implementation is inferred; no precise invariant prose is removed.

Gap1 reuses exact M1 identities/closure and separates working lifecycle. Gap2 now represents event/transformation incidence and observed exchange versus contribution/evidence roles;full capture formats/effects remain open. Gap3 authority/security mechanisms remain unadopted. Gap4 conceptual roles are not modules or twelve mandatory records. Gap5 adopted ADR019 is explicit;historical provenance wording is qualified without implying new implementation.

HPX-TEST-136 / [evidence](../evidence/dom001-concept-m3.json) record no-layout syntax, model/source/navigation/ownership checks and only affected served manual layouts. Existing labels/bounds/positions/paths are preserved; unrelated snapshots are hash-checked. Full layout regression is deferred to the coherent milestone under AGENTS26. No rendered inspection or application/runtime/publication action. Next: M4 authority and representation distinctions.


## M4 authority and representation distinctions — HPX-CAN-021

One flat conceptual expansion of existing `hpx.native.authority`, reached by the supplemental source link in `c3_application`; primary navigation is unchanged. Canonical [view definition](../Conceptual/authority-distinction.c4) owns only displayed conceptual meanings/relations. Precise contracts remain: [core-object-model](../../05-domain/core-object-model.md); [browser-runtime](../../06-subsystems/interfaces/browser-runtime.md); [ai-collaboration](../../06-subsystems/ai-collaboration.md); [security-cryptography](../../06-subsystems/security-cryptography.md); [crypto-adapter](../../06-subsystems/interfaces/crypto-adapter.md). No schema or implementation is inferred; no precise invariant prose is removed.

Gap1 reuses content identity and retains exact closure contracts. Gap2 provenance/interaction concepts remain separate from authority. Gap3 now explicitly shows accepted distinctions and workspace cardinality without choosing identity,permission,epoch,grant or address mechanisms. Gap4 remains conceptual,not software decomposition. Gap5 retains local ID-generation evidence,source-era future selection and adopted ADR014/019 status.

HPX-TEST-137 / [evidence](../evidence/dom001-concept-m4.json) record no-layout syntax, model/source/navigation/ownership checks and only affected served manual layouts. Existing labels/bounds/positions/paths are preserved; unrelated snapshots are hash-checked. Full layout regression is deferred to the coherent milestone under AGENTS26. No rendered inspection or application/runtime/publication action. Next: Bounded operation-effect and existing C4 correspondence assessment.


## O1 draft acknowledgement and atomic Commit effects — HPX-CAN-022

One flat conceptual expansion of existing `hpx.native.application.publication`, reached by the supplemental source link in `c3_application`; primary navigation is unchanged. Canonical [view definition](../Conceptual/publication-effects.c4) owns only displayed conceptual meanings/relations. Precise contracts remain: [core-object-model](../../05-domain/core-object-model.md); [draft-publication](../../07-implementation/protocols/draft-publication.md); [recovery](../../08-assurance/recovery.md). No schema or implementation is inferred; no precise invariant prose is removed.

Gap1 lifecycle effects now distinguish mutable acknowledgement from immutable exact publication. Gap2 semantic event/Commit effects are source-backed,not a wire protocol. Gap3 current authority and exact preconditions remain contract requirements,not a chosen permission format. Gap4 standard lifelines show concept effects,not software calls. Gap5 adopted triggers and historical implementation limits remain separately scoped.

HPX-TEST-138 / [evidence](../evidence/dom001-concept-o1.json) record no-layout syntax, model/source/navigation/ownership checks and only affected served manual layouts. Existing labels/bounds/positions/paths are preserved; unrelated snapshots are hash-checked. Full layout regression is deferred to the coherent milestone under AGENTS26. No rendered inspection or application/runtime/publication action. Next: O2 placement and derivation effects.


## O2 placement and derivation effects — HPX-CAN-023

One flat conceptual expansion of existing `hpx.native.application.dispatch`, reached by the supplemental source link in `c3_application`; primary navigation is unchanged. Canonical [view definition](../Conceptual/placement-effects.c4) owns only displayed conceptual meanings/relations. Precise contracts remain: [core-object-model](../../05-domain/core-object-model.md); [document-semantics](../../05-domain/document-semantics.md); [provenance-model](../../05-domain/provenance-model.md). No schema or implementation is inferred; no precise invariant prose is removed.

Gap1 Move/reuse/removal/restore effects preserve identity and retained history. Gap2 Fork preserves exact cross-identity origins rather than foreign revision parents. Gap3 current authority/exact-state validation is required but mechanisms unadopted. Gap4 effect lifelines are conceptual roles,not module calls. Gap5 bounded implementation and adopted source obligations remain distinct.

HPX-TEST-139 / [evidence](../evidence/dom001-concept-o2.json) record no-layout syntax, model/source/navigation/ownership checks and only affected served manual layouts. Existing labels/bounds/positions/paths are preserved; unrelated snapshots are hash-checked. Full layout regression is deferred to the coherent milestone under AGENTS26. No rendered inspection or application/runtime/publication action. Next: O3 retained-evidence and interaction effects.


## O3 retained evidence and interaction effects — HPX-CAN-024

One flat conceptual expansion of existing `hpx.native.domain.source_plans`, reached by the supplemental source link in `c3_pure_domain`; primary navigation is unchanged. Canonical [view definition](../Conceptual/evidence-effects.c4) owns only displayed conceptual meanings/relations. Precise contracts remain: [0019-working-branches-and-reference-checkpoints](../../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [0010-semantic-annotation-snapshots](../../04-architecture/decisions/0010-semantic-annotation-snapshots.md); [provenance-model](../../05-domain/provenance-model.md); [ai-collaboration](../../06-subsystems/ai-collaboration.md). No schema or implementation is inferred; no precise invariant prose is removed.

Gap1 exact working-source/checkpoint/committed correspondence effects retain lifecycle distinctions. Gap2 retrospective claim review and observable context/response effects preserve evidence roles. Gap3 all operations retain shared current authority without selecting mechanisms. Gap4 effect views are not software calls or record formats. Gap5 ADR010/019 adoption and historical implementation statements remain distinct.

HPX-TEST-140 / [evidence](../evidence/dom001-concept-o3.json) record no-layout syntax, model/source/navigation/ownership checks and only affected served manual layouts. Existing labels/bounds/positions/paths are preserved; unrelated snapshots are hash-checked. Full layout regression is deferred to the coherent milestone under AGENTS26. No rendered inspection or application/runtime/publication action. Next: Coherent milestone regression and existing C4 correspondence disposition.


## Source-backed milestone and remaining design boundary

[Current coverage/C4 correspondence](dom001-current-coverage.md) records completed M1–M4/O1–O3,all five gaps and precise retained contracts. HPX-TEST-141/[milestone evidence](../evidence/dom001-conceptual-milestone.json) close the deferred full-layout regression once at the coherent boundary. Existing C4/original sequences are unchanged;no mechanisms are silently adopted. Next scope decision is a separate closure/source-map design proposal or deferring mechanism design.
