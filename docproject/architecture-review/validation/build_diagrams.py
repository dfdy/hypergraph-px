"""Stage C. Derive diagrams from the already-written Stage B process model."""
import sys
sys.dont_write_bytecode = True
from build_review import OUT, ROOT, write, dump, table, source, slink
import json
model=json.loads((OUT/'traceability/process-model.json').read_text())
diagrams=[]
def D(key,title,view,scope,body,procs,paths,children=(),milestone='Local unless explicitly F / G',assumptions='No inferred mechanism; F nodes are future contracts, G nodes are gated code.'):
    d={'id':'HPX-DIAG-'+key,'title':title,'viewpoint':view,'question':scope,'level':'System/component/process as stated in title','milestone':milestone,'processes':procs,'sources':[source(p) for p in paths],'children':['HPX-DIAG-'+x for x in children],'assumptions':assumptions,'path':f'diagrams/{view}/{key}.mmd','svg':f'diagrams/{view}/{key}.svg'}
    header='%% '+d['id']+' — '+title+'\n%% Scope: '+scope+'\n%% '+milestone+'\n'
    if body.strip().startswith(('sequenceDiagram','stateDiagram')):
        body=body.replace(';',',').replace('Applied: F: concrete','Applied: Future concrete')
    write(d['path'],header+body.strip()+'\n')
    diagrams.append(d)
    return d

arch=['docs/04-architecture/system-architecture.md','docs/04-architecture/component-architecture.md']
store=['docs/07-implementation/protocols/draft-publication.md','docs/07-implementation/data-structures/sqlite-records.md']
branch=['docs/04-architecture/decisions/0018-initial-local-branches.md','docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md','docs/09-guides/reference/DEVELOPMENT_STATE.md']
sec=['docs/06-subsystems/interfaces/browser-runtime.md','docs/08-assurance/security-threat-model.md']
ext=['docs/06-subsystems/external-integrations.md','docs/06-subsystems/import-export.md']
domain=['docs/05-domain/core-object-model.md','docs/05-domain/document-semantics.md']

D('001','HPX system context','context','Who uses HPX, which actors and optional services are outside its authority?', '''flowchart LR
  U["Owner / local human"] -->|"read, edit, review"| H
  subgraph HOST["Trusted local host - current boundary"]
    H["HPX local application"] --> S[("Encrypted workspace SQLite")]
    H -->|"explicit native enrollment / unlock"| K["OS keychain - external trust"]
  end
  H -.->|"F: approved context"| A["Agent provider"]
  Z["F: Zotero desktop / cloud"] -.->|"read-only metadata"| H
  H -.->|"F: reviewed export / encrypted backup"| G["GitHub"]
  P["F: portable packages / Word reviews"] -.->|"untrusted input"| H
  H -.->|"F: authorized exchange"| R["Independent replica"]
  L["Legend: solid = local responsibility; dashed F = future; outside boxes have independent authority"]
''',['HPX-PROC-001','HPX-PROC-015','HPX-PROC-017'],arch+ext,['002','005','027','030'])

D('002','Execution containers and deployment boundary','containers','Which units execute, and what is absent from the release runtime?', '''flowchart TB
 subgraph HOST["Trusted host / current trusted-server mode"]
  subgraph B["Isolated browser origin"]
   UI["CodeMirror / KaTeX / panels"] --> AD["Owned-buffer RuntimeAdapter"]
  end
  subgraph EXE["One Rust release executable"]
   TLS["HTTPS / exact origin / cookie"] --> APP["Authorized operation coordinator"]
   APP --> DOM["Pure domain plans and validators"]
   APP --> ST["Storage DTO / SQLite coordinator"]
   ST --> CR["Crypto adapter"]
   AS["Embedded frontend asset bytes"]
  end
  AD -->|"authenticated encrypted loopback"| TLS
  AS --> UI
  ST --> DB[("Encrypted SQLite objects / slots / WAL")]
  ST --> KC["Native keychain, explicit only"]
 end
 BUILD["Build-time Node / Lean / bundler"] -.->|"assets and assurance; no runtime server"| EXE
 L["Legend: execution units are boxes; DB is storage; build dependency is dashed"]
''',['HPX-PROC-001','HPX-PROC-003','HPX-PROC-016','HPX-PROC-018'],arch+sec,['003','004','012'])

D('003','Responsibility and code-level direction','components','Where do authorization, pure planning, serialization and cryptography belong?', '''flowchart TD
 RT["crates/runtime - transport DTOs and sessions"] --> ST["crates/storage - application coordinator and storage DTOs"]
 RT --> DM["crates/domain - pure records / plans"]
 RT --> KC["crates/keychain - native provider"]
 ST --> DM
 ST --> CR["crates/crypto - byte envelopes / KDF"]
 ST --> KC
 ST --> SQ["rusqlite / bundled SQLite"]
 FE["Browser modules"] -->|"strict HTTPS commands; no Rust import"| RT
 DM --> NIL["No Serde / database / HTTP / crypto dependency"]
 WARN["Application responsibility is hosted in storage today; intended layer is not a separate running service"]
 L["Legend: solid arrow = dependency / invocation; process boundaries are in DIAG-002"]
''',['HPX-PROC-003','HPX-PROC-018'],arch+['docs/04-architecture/decisions/0006-domain-serialization-boundary.md'],['028'])

# Parent process tree remains readable; children are separate diagrams.
body='flowchart LR\n H["HPX process responsibilities"]\n'
for f in model['families']: body+=f' H --> P{f["id"][-3:]}["{f["id"]}<br/>{f["name"]}"]\n'
body+=' L["Legend: decomposition only; arrows are not time, data, or dependencies"]\n'
D('004','Responsibility decomposition','process','Which parent owns each reviewed process?',body,[f['id'] for f in model['families']],arch, [f'P{n:03d}' for n in range(1,19)])
for f in model['families']:
    body=f'flowchart LR\n P["{f["id"]}<br/>{f["name"]}"]\n'
    for i,p in enumerate(f['leaves']): body+=f' P --> C{i}["{p["id"]}<br/>{p["name"]}<br/>{p["status"][0]}"]\n'
    body+=' L["Legend: parent-child responsibility, not flow; L local, G gated, F future, D deferred"]\n'
    D('P'+f['id'][-3:],f['name']+' subprocesses','process','What are the leaves and their temporal scope?',body,[p['id'] for p in f['leaves']],f['paths'],milestone='Mixed scope, explicitly marked per leaf')

# DFD boundary channels explicitly match across level 0 and level 1. Control is excluded.
channels=[('U','H','owned source and reviewed operation','P'),('H','U','views receipts and permitted artifacts','E'),('X','H','untrusted package or review bytes','I'),('H','X','approved package or backup bytes','I'),('H','V','approved provider request','I'),('V','H','provider metadata or outcome','I'),('H','K','explicit native credential request','A'),('K','H','native credential result','A')]
dfd0='flowchart LR\n U["Human"]\n X["F: package/file boundary"]\n V["F: external provider"]\n K["Native keychain"]\n subgraph SYS["HPX boundary"]\n H(("0 HPX"))\n end\n'
for a,b,label,_ in channels: dfd0+=f' {a} -->|"{label}"| {b}\n'
dfd0+=' L["Legend: arrows carry named information, not control; F = future"]\n'
D('005','Context DFD level 0','data-flow','Which information crosses the whole-system boundary?',dfd0,['HPX-PROC-001','HPX-PROC-003','HPX-PROC-013','HPX-PROC-015'],arch+ext,['006'])
dfd1='''flowchart LR
 U["Human"]
 X["F: package/file boundary"]
 V["F: external provider"]
 K["Native keychain"]
 subgraph SYS["Same HPX boundary as DIAG-005"]
 A(("Access / crypto<br/>002 and 016"))
 P(("Owned editing and publication<br/>003 / 004 / 008 / 009"))
 E(("Exact read and presentation<br/>005 / 006 / 007"))
 I(("F: import export providers<br/>011 through 015"))
 D[("Encrypted canonical objects / mutable slots")]
 P -->|"authorized encrypted records"| D
 D -->|"authorized exact state"| E
 A -->|"scoped access context"| P
  P -->|"unlock and scoped access request"| A
  A -->|"session and lock or unlock outcome"| E
 P -->|"publication and draft facts"| E
 E -->|"frozen authorized closure"| I
 I -->|"validated proposed input"| P
  I -->|"artifact and job result"| E
 end
'''
for a,b,label,child in channels: dfd1+=f' {child if a=="H" else a} -->|"{label}"| {child if b=="H" else b}\n'
dfd1+=' L["Legend: process circles; data stores cylinders; arrows are information; no implicit provider execution"]\n'
D('006','Subsystem DFD level 1','data-flow','How do parent information channels decompose without adding outside actors?',dfd1,['HPX-PROC-002','HPX-PROC-003','HPX-PROC-006','HPX-PROC-013','HPX-PROC-015'],arch+store+ext,['007','008','009'])
dump('traceability/dfd-balancing.json',{'parent':'HPX-DIAG-005','child':'HPX-DIAG-006','channels':[{'entity':a if a!='H' else b,'direction':'in' if b=='H' else 'out','label':c,'child_process':d} for a,b,c,d in channels], 'limits':'Balances named system-boundary channels, not a proof of all semantic payload fields. Lower DFDs explicitly expose their own application/policy/store boundary.'})

D('007','Durable Save and Commit lower DFD','data-flow','Which data transforms into encrypted records and an acknowledgement?', '''flowchart LR
 U["Authenticated operation boundary"] -->|"frozen operation and expected context"| P(("003.001 Validate plan"))
 D[("Encrypted catalog / head / draft / receipts")] -->|"current authority and state"| P
 P -->|"authorized exact plan"| W(("003.002 Save or 003.003 Commit"))
 W -->|"mutable draft and original receipt; Commit also immutable publication"| D
 W -->|"committed receipt / conflict / error"| U
 L["Legend: data arrows only; one BEGIN IMMEDIATE transaction encloses protected read-check-write-receipt"]
''',['HPX-PROC-003.001','HPX-PROC-003.002','HPX-PROC-003.003'],store,['013','014'])
D('008','Transformation and annotation lower DFD','data-flow','How do exact sources feed new entities while source history stays retained?', '''flowchart LR
 U["Reviewed command boundary"] -->|"source bindings / quote / target plan"| V(("006.002 exact validation"))
 D[("Encrypted source history and current authority")] -->|"exact owned source"| V
 V -->|"validated source evidence"| T(("007 Fork / Synthesis or 009 annotation"))
 T -->|"new identity derivation OR annotation revision; original receipt"| O[("Encrypted canonical objects / indexes")]
 T -->|"new entity IDs / rejection"| U
 L["Legend: source data is read, never rewritten; derivation differs from same-node parents"]
''',['HPX-PROC-006.002','HPX-PROC-007.002','HPX-PROC-007.003','HPX-PROC-009'],['docs/06-subsystems/interfaces/domain-navigation.md']+store,['017','020'])
D('009','Future export lower DFD','data-flow','Which captured information determines an artifact and prevents silent head refresh?', '''flowchart LR
 U["Approved selection / format boundary"] -->|"exact selection and profile"| C(("013.002 freeze closure"))
 S[("Authorized retained source / citation resources")] -->|"exact bindings"| C
 C -->|"closed inputs and versioned resources"| P(("013.003-.005 compile"))
 R["011 policy / rights evidence"] -->|"permitted report and egress decision"| P
 P -->|"artifact plus losses / rights appendix"| E(("013.006 deliver"))
 E -->|"permitted artifact or failed/unknown result"| U
 L["Legend: all processes F; compiler, schemas and job lifecycle remain incomplete; no current integration claim"]
''',['HPX-PROC-011','HPX-PROC-013'],ext,['023','024'],milestone='Future only')

D('010','Conceptual identity, placement and immutable closure','data-model','Which relationships are conceptual identity and which are version or occurrence bindings?', '''classDiagram
 class Document
 class Node
 class Revision
 class Occurrence
 class Manifest
 class Snapshot
 class Transformation
 class ExactSource
 class AssertionRevision
 class Comment
 Document --> Node : local content identity
 Node "1" <-- "many" Revision : same node only
 Revision --> Revision : immutable same-node parent
 Manifest "1" --> "many" Occurrence : ordered placement
 Occurrence --> Node : references identity
 Snapshot --> Manifest : exact version
 Snapshot --> Revision : occurrence-path bindings
 ExactSource --> Snapshot : exact range and path
 Transformation --> ExactSource : typed inputs / outputs
 AssertionRevision --> ExactSource : ordered roles
 Comment --> ExactSource : committed passage
 note for Transformation "Cross-identity derivation is not a Revision parent"
 note for Snapshot "Closed historical resources; no moving head lookup"
''',['HPX-PROC-005','HPX-PROC-007','HPX-PROC-009'],domain+['docs/05-domain/assertions-and-predicates.md'],['011','012'])
D('011','Working branch conceptual extension','data-model','How does pending text obtain exact provenance without becoming a committed revision?', '''flowchart LR
 CB["Content branch same document/node"] --> DR["Mutable Draft / private working context"]
 DR -->|"provenance capture only"| CP["Immutable typed CheckpointId"]
 CP --> WR["Private working reference exact path/range"]
 CP -->|"latest full-source exact match on Commit"| PR["Promotion fact"]
 PR --> RV["Committed Revision / Snapshot"]
 WR -->|"separate bounded post-Commit CAS batch"| RR["Replacement reference"]
 RR -->|"retains predecessor"| WR
 CP -->|"retained source"| WF["G: independent WorkingFork derivation"]
 L["Legend: solid = accepted G design, not integrated delivery; autosave does not create CP; originals remain immutable"]
''',['HPX-PROC-008'],branch,['015','019'],milestone='Accepted design / gated code')
D('012','Physical encrypted storage responsibilities','data-model','How do conceptual objects map to storage without conflating schema and payload versions?', '''flowchart TB
 DB["SQLite application_id 0x48505831<br/>default schema 1; explicit enrollment schema 2"]
 DB --> BOOT["bootstrap: workspace / epoch / HGWK wrapper"]
 DB --> OB[("objects: kind + opaque id32 + HGOB ciphertext<br/>insert-only API")]
 DB --> SL[("slots: kind + opaque id32 + generation + HGOB ciphertext<br/>CAS mutable state")]
 DB --> KC["schema 2 optional keychain_unlock wrapper"]
 OB --> PAY["Authenticated strict payload<br/>record_version 1 / record_kind / payload"]
 SL --> PAY
 PAY --> K["Kinds 1-9 original; 10-19 additive local; 20-27 gated branches/working"]
 DB --> WAL["WAL / FULL durability, not provenance history"]
 NOTE["Clear metadata leaks kind/opaque ID/generation/size/count; no whole-DB rollback witness"]
 L["Legend: conceptual model is DIAG-010/011; transport contract and envelope versions are separate"]
''',['HPX-PROC-003','HPX-PROC-016'],store+['docs/06-subsystems/formats/hpx-workspace.md'],['029'])

D('013','Autosave, newer typing and lost acknowledgement','sequence','What prevents a delayed Save acknowledgement from replacing newer typing?', '''sequenceDiagram
 actor U as Human
 participant B as Browser context (document,branch)
 participant R as Authorized Rust route
 participant D as Encrypted SQLite
 U->>B: Type source at sequence s
 B->>B: Freeze op ID, bytes, generation, branch
 B->>R: Save exact frozen request
 R->>D: BEGIN IMMEDIATE / current authority / receipt lookup
 R->>D: CAS Draft + original Receipt / COMMIT
 U->>B: Type newer source at s+1
 alt Reply received
 R-->>B: Exact op receipt for s
 B->>B: Advance acknowledged base, preserve s+1 bytes
 else Reply lost or delayed
 B->>R: Retry same ID and same bytes
 R->>D: Current authority then original receipt
 R-->>B: Original outcome (or explicit conflict)
 end
 Note over B,D: Save is not Commit; tab reload durability for unacknowledged typing is not promised
''',['HPX-PROC-003.002','HPX-PROC-003.004'],store+['docs/06-subsystems/interfaces/browser-runtime.md'],['014','018'])
D('014','Atomic text publication and recovery','sequence','Which objects become durable together, and what happens around COMMIT?', '''sequenceDiagram
 actor U as Human
 participant B as Frozen browser context
 participant R as Application coordinator
 participant D as SQLite writer
 U->>B: Explicit Commit reviewed source
 B->>R: Operation + expected head/generation + exact bytes
 R->>D: BEGIN IMMEDIATE
 R->>D: Current owner/device, branch state, original receipt check
 alt Preconditions fail
 D-->>R: Conflict / authorization / integrity error
 R-->>B: No publication
 else Valid exact plan
 R->>D: Insert same-node Revision, closed Snapshot, Publication
 R->>D: Advance selected head, rebase Draft, eligible promotion, Receipt
 R->>D: COMMIT
 Note over R,D: Crash before commit = old state; after commit = complete new state
 R-->>B: Original receipt or unknown transport outcome
 end
 Note over B,D: Reference replacement is a separate later operation; no cross-identity parent is created
''',['HPX-PROC-003.003','HPX-PROC-008.005'],store+branch,['015','029'])
D('015','Working Copy, promotion and separate replacement','sequence','Where is atomicity deliberately split to keep text publication independent?', '''sequenceDiagram
 actor U as Human
 participant B as Gated branch buffer
 participant R as Application / storage
 participant D as Encrypted SQLite
 U->>B: Protected Copy pending exact selection
 B->>R: Frozen WorkingCopy + current reference generation
 R->>D: Tx A: authorize, save/checkpoint, reference/list, Receipt; COMMIT
 R-->>B: Exact checkpoint source, not committed revision
 U->>B: Explicit Commit
 B->>R: Frozen selected branch Commit
 R->>D: Tx B: text publication + exact eligible promotion + Receipt; COMMIT
 R-->>B: Text committed
 B->>R: Separate frozen Promote(publication,list generation)
 R->>D: Tx C: authorize promotion, replacement retaining predecessor, Receipt; COMMIT
 alt Batch fails or reply unknown
 R-->>B: Pending / conflict / unknown batch
 B->>B: Keep published text; reconcile original batch receipt
 else Batch known
 R-->>B: Actual replacement and retained original
 end
 Note over B,D: Gated implementation only; full runtime/older-reader/undo/restart evidence pending
''',['HPX-PROC-008.003','HPX-PROC-008.004','HPX-PROC-008.005','HPX-PROC-008.006'],branch,['011','019','029'],milestone='Gated code; explicit A/B/C atomicity boundaries')
D('016','Keychain enrollment compensation','sequence','How are SQLite and native keychain partial failure handled without weakening passphrase recovery?', '''sequenceDiagram
 actor U as Unlocked owner
 participant S as Storage
 participant F as Encrypted backup
 participant K as Native keychain
 participant D as SQLite
 U->>S: Explicit enroll
 S->>F: Consistent backup / verify fingerprint / fsync
 S->>D: BEGIN writer; recheck current fingerprint and authority
 S->>K: Create unique random device secret
 alt Native create denied / existing
 K-->>S: Failure, never overwrite existing item
 S->>D: ROLLBACK
 else New item created
 S->>D: Optional wrapper and schema 2; COMMIT
 alt DB fails before COMMIT
 S->>K: Compensate only newly created expected item
 else Crash leaves orphan
 Note over S,K: Scoped manual inspection; no speculative reenrollment overwrite
 end
 end
 Note over S,D: Original passphrase wrapper and record ciphertext remain; removal commits DB deletion before native deletion
''',['HPX-PROC-002.005','HPX-PROC-002.007','HPX-PROC-014.003'],['docs/04-architecture/decisions/0014-keychain-unlock-policy.md'],['029'])
D('017','Source transform and immutable annotation workflow','activity','How do source validation, review and publication preserve identity distinctions?', '''flowchart TD
 A["Capture exact committed source"] --> V{"Current scope / exact UTF8 quote valid?"}
 V -->|"no"| X["Reject; recapture explicitly"]
 V -->|"yes"| T{"Reviewed operation"}
 T -->|"Fork one input"| F["New Node; parentless first Revision; separate derivation"]
 T -->|"Synthesis 2-8 inputs"| S["Reviewed output; new Node; ordered derivation"]
 T -->|"Comment"| C["Immutable exact-passage retrospective entity"]
 T -->|"Assertion"| R["Role-labelled claim / review ancestry"]
 F --> W["Atomic encrypted objects/indexes/receipt"]
 S --> W
 C --> W
 R --> W
 W --> E["Return exact entity IDs; source history unchanged"]
 L["Legend: diamonds are decisions/control; arrows here are workflow, not DFD information channels"]
''',['HPX-PROC-007','HPX-PROC-009'],['docs/06-subsystems/interfaces/domain-navigation.md'],['020','021'])
D('018','Workspace and buffer state machines','state','Which session/unlock states permit editing and which acknowledgement states remain uncertain?', '''stateDiagram-v2
 [*] --> Locked
 Locked --> Unlocked: explicit successful passphrase / enrolled native unlock
 Locked --> Locked: wrong credential / invalid format
 Unlocked --> Editing: select owned document and branch
 Editing --> SaveInFlight: freeze exact Save
 SaveInFlight --> Editing: exact acknowledgement, preserve later typing
 SaveInFlight --> UnknownReadOnly: outcome uncertain / lock requested
 UnknownReadOnly --> Editing: reconcile original receipt and context
 Editing --> LockDraining: explicit lock
 LockDraining --> Locked: pending operations resolved, server lock known
 LockDraining --> UnknownReadOnly: lock outcome unknown
 Unlocked --> Locked: explicit lock
 note right of Locked: Bootstrap cookie is separate from data-key unlock
 note right of UnknownReadOnly: Do not silently enable another context or replace source
''',['HPX-PROC-002','HPX-PROC-003.004','HPX-PROC-004.005'],sec+store,['019'])
D('019','Working checkpoint and reference lifecycle','state','Which transitions retain exact unpublished source and which need a later explicit operation?', '''stateDiagram-v2
 [*] --> MutableDraft
 MutableDraft --> MutableDraft: idle autosave; no checkpoint/Commit
 MutableDraft --> ExactCheckpoint: provenance operation atomically captures source
 ExactCheckpoint --> ExactCheckpoint: later typing leaves checkpoint unchanged
 ExactCheckpoint --> Promoted: explicit Commit with full latest exact match
 ExactCheckpoint --> RetainedWorkingHistory: changed source or ineligible older checkpoint
 Promoted --> PendingReplacement: private reference candidate exists
 PendingReplacement --> ActualReplacement: separate authorized CAS batch commits
 PendingReplacement --> PendingReplacement: denied / stale / unknown batch; text remains committed
 ActualReplacement --> ActualReplacement: original checkpoint and predecessor retained
 note right of MutableDraft: Gated implementation; content branch identity stays separate
''',['HPX-PROC-008'],branch,['015'])
D('020','Annotation entity lifecycle','state','What does review change, and what does it leave immutable?', '''stateDiagram-v2
 [*] --> ProposedAssertion: reviewed create exact role bindings
 ProposedAssertion --> AcceptedRevision: authorized append review
 ProposedAssertion --> RejectedRevision: authorized append review
 AcceptedRevision --> SupersedingRevision: authorized append
 RejectedRevision --> SupersedingRevision: authorized append
 [*] --> ImmutableComment: exact committed passage and body
 ImmutableComment --> ImmutableComment: historical inspect; no edit/reply/resolve in initial scope
 note right of AcceptedRevision: Accepted is review status, not proof of truth
 note right of ImmutableComment: Text Snapshot is unchanged; later overlays stay retrospective
''',['HPX-PROC-009'],['docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md','docs/04-architecture/decisions/0017-initial-durable-comments.md'],['021'])
D('021','Document, content branch and immutable revision lifecycles','state','Which mutable heads advance without changing logical node or retained versions?', '''stateDiagram-v2
 [*] --> InitialDocument: atomic create new document/node/root occurrence
 InitialDocument --> EditingOriginalBranch: selected owned buffer
 EditingOriginalBranch --> EditingOriginalBranch: mutable Save; same published head
 EditingOriginalBranch --> NewCommittedHead: explicit same-node Commit
 NewCommittedHead --> EditingOriginalBranch: rebase draft; old revisions immutable
 NewCommittedHead --> IndependentNamedChild: G reviewed committed-snapshot child
 IndependentNamedChild --> IndependentNamedChild: own Save / Commit, same document/node
 NewCommittedHead --> IndependentForkDocument: reviewed Fork; distinct node
 note right of IndependentNamedChild: Branch creation relation is not a cross-node derivation
 note right of NewCommittedHead: A Revision has no mutable content transition; new revision gets new identity
 note right of IndependentForkDocument: Original parent pending draft remains untouched
''',['HPX-PROC-003','HPX-PROC-005.001','HPX-PROC-007.002','HPX-PROC-008.001'],domain+branch,['010','014'])
D('022','Future human-agent proposal state','state','What separates provider output, human approval and authority to apply?', '''stateDiagram-v2
 [*] --> Disconnected
 Disconnected --> Connected: explicit scoped provider setup
 Connected --> ContextReviewed: exact permitted context and mode gate
 ContextReviewed --> RequestInFlight: approved frozen request
 RequestInFlight --> Proposal: bounded untrusted response
 RequestInFlight --> UnknownExternalOutcome: timeout / cancellation uncertainty
 Proposal --> Rejected: human rejects
 Proposal --> ReviewedPlan: human reviews exact targets and payload
 ReviewedPlan --> Applied: current authority and expected heads revalidated
 ReviewedPlan --> StaleOrDenied: target changed / authority denied
 note right of Applied: F: concrete schemas, durable journal and cancellation protocol unspecified
''',['HPX-PROC-012'],ext,['023'],milestone='Future contract only')
D('023','Future GitHub publication with unknown outcome','sequence','Why can an approved remote write have an unknown result without allowing blind replay?', '''sequenceDiagram
 actor U as Human
 participant H as HPX policy and job coordinator
 participant D as Encrypted local outbox
 participant G as GitHub API
 H-->>U: Exact bytes, destination/visibility, remote precondition
 U->>H: Approve frozen plan
 H->>D: Persist scoped queued job
 H->>G: Conditional write with provider-specific expected head
 alt Known provider response
 G-->>H: Success / conflict / failure
 H->>D: Record known outcome
 else Reply lost
 H->>D: Record UNKNOWN, not failed/no-write
 H->>G: Inspect actual remote state under exact job
 G-->>H: Reconciliation evidence or still unknown
 end
 Note over D,G: No atomic transaction spans SQLite and provider; no exactly-once guarantee
''',['HPX-PROC-015.004'],ext,['024'],milestone='Future optional integration')
D('024','Future export and Word review workflows','activity','Where must selection, review, ambiguity and egress approval remain explicit?', '''flowchart LR
 U["Human chooses operation"] --> Q{"Export or Word review?"}
 Q -->|"export"| C["Freeze exact branch/graph closure and resources"]
 C --> P["Compile versioned profile; role fallback and rights report"]
 P --> E{"Current egress permitted?"}
 E -->|"yes"| A["Deliver exact approved artifact"]
 E -->|"no"| X["Denied; no plaintext destination"]
 Q -->|"import Word review"| W["Bound archive; no macros/network; choose exact base"]
 W --> M{"Exact / ambiguous / unmatched?"}
 M --> R["Explicit human review; unverified Word identity kept separate"]
 R --> H["Revalidate targets and authority before apply"]
 L["Legend: all F; no selected compiler, DOCX apply protocol or XML/JSON schema is implied"]
''',['HPX-PROC-013','HPX-PROC-014.002','HPX-PROC-011'],ext,['009','023'],milestone='Future only')
D('025','Trust and plaintext boundaries','security','Where is plaintext visible, and which guarantees depend on trusted delivery or the host?', '''flowchart TB
 subgraph UNTRUSTED["Untrusted inputs / external services"]
 I["Requests / packages / provider output"]
 P["F: model / GitHub / export recipient"]
 end
 subgraph HOST["Trusted host assumption - unlocked process and browser can see plaintext"]
 B["Same-origin client code and owned plaintext"] -->|"verified HTTPS / exact Origin / cookie"| R["Authorized application route"]
 R --> A{"Current authority and expected source?"}
 A -->|"yes"| C["Plaintext processing in trusted-server mode"]
 A -->|"no"| X["Deny without mutation/disclosure"]
 C --> K["AEAD using caller-expected context"]
 K --> D[("Encrypted SQLite and WAL; metadata remains visible")]
 end
 I -->|"strict parser and bounds"| R
 C -.->|"F: approved trusted-mode egress only"| P
 N["Client-held unavailable; non-trusted plaintext egress denied; independent trusted client needed against hostile host delivery"]
 L["Legend: dashed = gated future egress; encryption at rest does not protect unlocked host compromise or whole-DB rollback"]
''',['HPX-PROC-011','HPX-PROC-012','HPX-PROC-016'],sec+['docs/06-subsystems/security-cryptography.md'],['026','029'])
D('026','Request and operation failure propagation','recovery','Which failures reject, remain uncertain, or need scoped compensation?', '''flowchart TD
 A["Incoming operation"] --> G{"TLS/session/framing/limit valid?"}
 G -->|"no"| R["Reject before application route"]
 G -->|"yes"| V{"Current authority / exact source / generation valid?"}
 V -->|"no"| C["Conflict or integrity error; no writes"]
 V -->|"yes"| T["One SQLite mutation transaction"]
 T -->|"error/crash before COMMIT"| O["Old state after reopen"]
 T -->|"COMMIT durable"| N["New state plus original receipt"]
 N --> Q{"Reply known?"}
 Q -->|"no"| U["Unknown; reconcile frozen receipt, preserve later typing"]
 Q -->|"yes"| E["Exact outcome"]
 L["Legend: workflow/control; external keychain/provider effects use their separate compensation views"]
''',['HPX-PROC-003','HPX-PROC-016.003'],store+sec,['016','023','029'])
D('027','Future independent replicas and structural conflict','federation','Why are local DAG checks insufficient to promise federation convergence?', '''flowchart LR
 subgraph SA["Instance A - independent authority"]
 A["Local expansion: X to Y<br/>acyclic"] --> OA["Authorized causal operation set A"]
 end
 subgraph SB["Instance B - independent authority"]
 B["Local expansion: Y to X<br/>acyclic"] --> OB["Authorized causal operation set B"]
 end
 OA -.->|"F causal exchange, protocol unselected"| M{"Validate combined projection and authority"}
 OB -.->|"F causal exchange, protocol unselected"| M
 M -->|"naive union"| CY["X to Y to X cycle - cannot accept"]
 M -->|"required future mechanism"| Q["Explicit convergent rejection / conflict / acceptance policy TBD"]
 L["Legend: counterexample, not an implemented replication protocol; text CRDT / MLS alone do not resolve structure"]
''',['HPX-PROC-017'],['docs/05-domain/hypergraph-mathematics.md','docs/04-architecture/component-architecture.md'],[],milestone='Future only; logical counterexample')
D('028','Dependency and contention structure','dependencies','Which dependencies are acyclic and where is responsibility concentrated?', '''flowchart TD
 RT["Rust runtime"] --> ST["Storage coordinator and sibling modules"]
 RT --> DM["Pure domain"]
 RT --> KC["Native keychain"]
 ST --> DM
 ST --> CR["Crypto"]
 ST --> KC
 ST --> SQ["SQLite"]
 FE["Frontend app.js coordinator"] --> AD["runtime-adapter and feature panels"]
 AD --> HTTP["Strict HTTPS contract"]
 RT --> MUT["One workspace mutex; bounded 16-worker ingress"]
 MUT --> ST
 WARN["Observed local crate graph DAG; storage modules share super imports; broad frontend orchestration is a maintenance risk, not proof of a cycle"]
 L["Legend: dependency arrows; frontend and Rust are connected by protocol, not linked imports; regex graph limits in dependency report"]
''',['HPX-PROC-003','HPX-PROC-004','HPX-PROC-018'],arch+sec,[],assumptions='Static Cargo/import analysis corroborates edges; shared super imports are not a precise call graph.')
D('029','Recovery responsibilities and irrecoverable boundaries','recovery','What can reopening, receipts, backup or repair actually recover?', '''flowchart LR
 F{"Failure class"} -->|"transaction interruption"| T["SQLite reopen: old or complete new state"]
 F -->|"lost reply"| R["Current authority plus original receipt"]
 F -->|"acknowledged draft restart"| D["Exact authenticated mutable Draft slot"]
 F -->|"keychain orphan"| K["Passphrase recovery and explicit scoped cleanup"]
 F -->|"corrupt canonical record"| C["Fail closed; preserve file; valid backup/repair design needed"]
 F -->|"derived index corruption"| I["TBD classify and deterministically rebuild; not every slot is derivable"]
 F -->|"authentic old whole database"| O["Current local design has no freshness witness"]
 F -->|"future remote uncertainty"| P["Explicit unknown and provider reconciliation"]
 L["Legend: recovery responsibility, not guaranteed hardware survival; process-exit tests do not exhaust power loss"]
''',['HPX-PROC-002','HPX-PROC-003','HPX-PROC-014','HPX-PROC-015'],store+['docs/08-assurance/recovery.md'],['026'])
D('030','Assurance and authority boundaries','assurance','Which conclusions come from tests, proofs, code alignment, owner decisions or this review?', '''flowchart LR
 SPEC["Scoped accepted requirements and decisions"] --> TEST["Ordinary unit / integration / crash / browser tests"]
 SPEC --> MODEL["Four Lean rank/path model theorems"]
 SRC["Actual Rust spend helper"] --> EXT["Pinned Charon / Aeneas translation"]
 EXT --> PROOF["One checked extracted-helper theorem"]
 REVIEW["This review: source trace, diagram rendering, bounded abstract model, static dependencies"] --> GAPS["Findings and proposed checks; no app correctness proof"]
 TEST --> BOUND["Retain exact tested version, scope and environment"]
 MODEL --> BOUND
 PROOF --> BOUND
 BOUND --> NO["No whole Kahn / storage / crypto / binary / federation proof"]
 OWNER["Owner approval authority"] --> SPEC
 L["Legend: arrows are evidence relationships, not automatic acceptance or publication permission"]
''',['HPX-PROC-018'],['docs/08-assurance/formal-validation-digest.md','docs/08-assurance/testing-strategy.md'],['004'])

D('031','Publication, branch and actor bindings','data-model','Which identities authorize a current action and which records merely retain historical attribution?', '''flowchart LR
 C["Authenticated encrypted catalog"] --> P["Current Principal / Device"]
 P -->|"current authorization before replay"| OP["Frozen OperationId and exact command digest"]
 OP --> RC["Original encrypted Receipt"]
 OP --> EV["Immutable publication event: actor / device / operation"]
 EV --> RV["Same-node Revision and closed Snapshot"]
 CB["Content branch mutable head"] --> RV
 DR["Independent branch Draft"] -->|"selected content branch context"| CB
 DR -->|"exact base revision; mutable Save with generation"| RV
 EV -->|"recorded publisher evidence only"| CV["Contributor view - not original authorship or presence"]
 L["Legend: historical actor identity is evidence, never a current permission grant; general groups/delegation are future"]
''',['HPX-PROC-003','HPX-PROC-008','HPX-PROC-010'],domain+store,['010','011','014'])
D('032','N-ary relationship and selected historical graph scope','graph','How does one reviewed claim retain roles without becoming pairwise facts or complete outgoing knowledge?', '''flowchart LR
 A["Selected Assertion node<br/>one identity and revision<br/>predicate version / review / qualifiers"]
 A -->|"role 1; exact historical range"| S1["Selected document A context<br/>retained source binding"]
 A -->|"role 2; exact historical range"| S2["Selected document B context<br/>retained source binding"]
 A -->|"repeated role remains distinct incidence"| S1
 A -.->|"outside-selection incidence count only"| O["Unselected participant not drawn as a content node"]
 S1 -->|"inspect exact passage, never current-head substitution"| H["Historical source view"]
 L["Legend: illustrative claim, not a real user record; at most 16 selected nodes, shared source-work budget 64; no clique or logical proof"]
''',['HPX-PROC-006.004','HPX-PROC-009.003'],['docs/06-subsystems/graph-engine.md','docs/06-subsystems/interfaces/browser-runtime.md'],['017','020'])
D('033','Exact owned source and browser projection','data-flow','How does a browser selection resolve to exact mixed-newline UTF8 bytes?', '''flowchart LR
 S["Owned source: A + CRLF + emoji<br/>UTF8 total 7 bytes"] -->|"explicit projection"| B["Browser: A + LF + emoji<br/>UTF16 total 4 code units"]
 B -->|"selection code units 2 through 4"| M(("004.001 exact owned mapping"))
 S -->|"exact owned bytes and newline map"| M
 M -->|"half-open UTF8 bytes 3 through 7"| V(("006.002 scalar/range/quote validation"))
 V -->|"exact emoji quote"| R["Source binding for reviewed operation"]
 V -->|"split scalar / stale source / wrong quote"| E["Reject; do not normalize or heuristic-remap"]
 L["Legend: derived illustrative example, not real data; mapping depends on exact owned source; general multi-owner save is unsupported"]
''',['HPX-PROC-004.001','HPX-PROC-006.002'],['docs/05-domain/text-and-anchors.md','docs/06-subsystems/interfaces/browser-runtime.md'],['013','017'])

dump('diagrams/index.json',diagrams)
nav='# Coordinated diagram index — Stage C\n\n'+str(len(diagrams))+' text-based Mermaid views. [System context](context/001.svg) → [containers](containers/002.svg) → [components](components/003.svg) → [process families](process/004.svg) → family leaves below. The [process catalogue](../process-inventory.md) supplies contracts and gaps for every leaf. Read SVGs for rendering and `.mmd` for editable sources. C4-inspired levels are labelled; these are not claims of formal C4/UML/BPMN conformance.\n\n'
nav+='Selection: context/container/component for deployment and responsibility; DFD for information movement; sequence for ordering and atomicity; activity for branching review; state for lifecycle; class/data views separate concepts from physical tables. BPMN adds little here: implemented flows have one human and one local coordinator, and future multi-actor protocols lack sufficient message semantics. No invented BPMN execution is supplied.\n\n'
nav+='Common legend: L is local documented behavior, G accepted/gated code, F future, D deferred; future edges are dashed where mixed with local edges. Arrows mean the notation stated in each view, never universally data flow. A box named trusted host expresses an assumption, not protection against its compromise. Exceptional paths are explicit in ordering/recovery views. Section-level claim evidence is in the evidence register; source links below are baseline documents, whose hashes and exact section spans are retained.\n\n'
nav+=table(['ID / title','View / question','Scope','View and source'],[[d['id']+' — '+d['title'],d['viewpoint']+'; '+d['question'],d['milestone'],f"[SVG]({d['svg'].removeprefix('diagrams/')}) · [Mermaid]({d['path'].removeprefix('diagrams/')})"] for d in diagrams])
for d in diagrams:
    childlinks=', '.join(f"[{key}]({next(x['svg'].removeprefix('diagrams/') for x in diagrams if x['id']==key)})" for key in d['children']) or 'Leaf view; return to process inventory'
    proclinks=', '.join(f"[{p}](../process-catalogue/{p.split('.')[0]}.md)" for p in d['processes'])
    nav+=f"\n## {d['id']} — {d['title']}\n\nQuestion: {d['question']} Level: {d['level']}. Milestone: {d['milestone']}.\n\nAssumptions/limits: {d['assumptions']}\n\nProcesses: {proclinks}. Child/related views: {childlinks}.\n\nSources: "+'; '.join(slink(s,'../../../') for s in d['sources'])+'.\n'
write('diagrams/README.md',nav)
print(json.dumps({'diagrams':len(diagrams),'process_family_views':18,'dfd_channels':len(channels)}))
