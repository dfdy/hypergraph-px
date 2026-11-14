"""Stage D/E: evidence-linked independent findings, no authoritative edits."""
import sys
sys.dont_write_bytecode = True
from build_review import ROOT, OUT, write, dump, table, source, slink
import json, html
findings=[]
def F(title,category,severity,confidence,status,scope,procs,refs,problem,consequence,demo,alternative,remedy,tradeoff,next_action,approval,priority,likelihood):
    findings.append({'id':f'HPX-FIND-{len(findings)+1:03d}','title':title,'category':category,'severity':severity,'confidence':confidence,'status':status,'scope':scope,'processes':procs,'sources':[source(*r) for r in refs],'problem':problem,'consequences':consequence,'demonstration':demo,'alternative_interpretations':alternative,'possible_remedies':remedy,'tradeoffs':tradeoff,'next_action':next_action,'owner_approval':approval,'priority':priority,'likelihood':likelihood})

F('Rollback acceptance wording exceeds the bounded local freshness guarantee','Contradiction / security risk','High','High for wording; no exploit demonstrated','Confirmed documentary tension','Current durable-edit acceptance', ['HPX-PROC-003','HPX-PROC-016'],
 [('docs/08-assurance/security-threat-model.md','reject rollback/replay before durable editing'),('docs/04-architecture/data-architecture.md','no whole-database rollback witness'),('docs/06-subsystems/formats/hpx-workspace.md','not complete rollback')],
 'The inherited threat clause says storage/application must reject rollback/replay before durable editing. The local SQLite contract expressly accepts the absence of a whole-database freshness witness. CAS and authenticated receipts reject selected stale commands; AEAD does not reject restoration of a complete authentic old database.',
 'A reader cannot tell whether current bounded editing is an approved exception, whether the gate means only per-operation replay, or whether durable editing is still prohibited. This is an acceptance ambiguity, not evidence that AEAD was misimplemented.',
 'Compare the exact three passages. Thought experiment: replace the entire workspace and WAL state with an older valid consistent image. Its tags can remain authentic. No real workspace was rolled back in this review.',
 'The threat clause may have meant mixed-record substitution or stale-command replay only. That interpretation is narrower than its unqualified wording and needs authority, not inference.',
 'Clarify the threat/gate scope and explicitly accept the bounded residual risk, or design an independently retained monotonic witness and its recovery/trust model.',
 'Narrowing the gate changes acceptance policy; an external witness adds availability, backup/restore and hostile-host dependencies and does not follow automatically from a key epoch.',
 'Ask the owner to resolve gate scope before claiming real-data freshness acceptance. Preserve the residual limitation in user-facing deployment guidance.',
 'Yes — security/acceptance scope decision; this review makes no change.','P1 — clarify before real-data security acceptance','Ambiguity is present; actual rollback requires an actor able to restore storage.')

F('Current summaries retain superseded implementation status','Maintainability concern / contradiction','Medium','High','Confirmed documentation drift','Architecture and requirement status navigation',['HPX-PROC-018'],
 [('docs/04-architecture/component-architecture.md','Current domain Serde usage'),('docs/04-architecture/decisions/0006-domain-serialization-boundary.md','domain Serde/dependencies have been removed'),('docs/registers/requirements.csv','HPX-RQ-001'),('docs/registers/requirements.csv','HPX-RQ-028'),('docs/09-guides/reference/DEVELOPMENT_STATE.md','120 Rust tests')],
 'Component summaries still call domain serialization nonconforming and application/transport planned. Other current records explicitly report the refactor and integrated local increments. The requirement register also retains old delivery fields beside newer evidence. Historical passages are legitimate; unlabelled current-status entry points are misleading.',
 'Contributors may repeat finished work, infer inconsistent layering or enable unfinished capability from the wrong checkpoint. Current design rules remain coherent once historical status is separated.',
 'Compare component lines with accepted ADR006, actual domain Cargo manifest and latest state. Trace RQ001 and RQ028 status fields to their original milestone; do not replace an unknown claim with a guessed pass.',
 'Many statements are deliberately preserved historical evidence. The defect is present-tense summary/navigation scope, not retention of history or authority determined by date.',
 'Add an explicitly scoped current-status table generated from a reviewed milestone manifest; label retained source status and link to its checkpoint. Keep accepted requirements stable.',
 'A generated manifest reduces drift but needs one accountable maintainer and links to real checks; copying all history into a second current table would worsen duplication.',
 'Prepare a documentation-only reconciliation proposal with exact affected rows and dated evidence, preserving the original passages.',
 'Routine factual reconciliation can follow existing authority; any acceptance change still needs owner decision.','P1 — before another implementation handoff','High: contradictory entry-point summaries already exist.')

F('Recoverable-index repair is a named responsibility without a complete protocol','Missing specification / data integrity risk','High','High','Confirmed specification gap','Local corruption recovery, future general indexes',['HPX-PROC-003.006','HPX-PROC-014'],
 [('docs/04-architecture/component-architecture.md','index rebuilding'),('docs/07-implementation/data-structures/sqlite-records.md','Indices and operations'),('docs/08-assurance/recovery.md','Failure and recovery')],
 'The architecture calls indexes recoverable but does not exhaustively classify every catalog/head/private-reference/assertion index as canonical or derived, define authoritative rebuild inputs, or specify deterministic head choice, quarantine, repair atomicity and interrupted repair recovery. Mutable acknowledged drafts are authoritative state, not disposable indexes.',
 'A future repair tool might invent a current head from unordered history, lose the latest acknowledged draft, or silently erase opaque optional records. Current fail-closed corruption behavior is safer than an unspecified repair.',
 'The record document’s index section is generic scaffolding. Compare actual mutable slots and encrypted receipts: a save receipt digest alone is insufficient to recreate overwritten draft text.',
 'A fail-closed first slice may intentionally defer repair. That is acceptable if explicitly framed as a limitation and not a rebuild guarantee.',
 'Create an authoritative/derived-state matrix and repair design: exact inputs, authorization, deterministic output, preserving originals, backup/quarantine, atomic swap and interruption tests.',
 'Retaining full request text solely for repair increases plaintext-history sensitivity and storage; refusing repair preserves integrity but reduces availability.',
 'Design a minimal offline audit report before any mutating repair; define which acknowledged data can only come from a valid backup.',
 'Yes for reconstruction/repair policy and any retention change.','P1 — before claiming corruption recovery','Corruption frequency unmeasured; consequences are high if repair is attempted.')

F('Working branches have not passed their required integrated lifecycle','Verification gap / data integrity risk','High','High','Confirmed remaining gate; no failing app workflow demonstrated','Gated branch/checkpoint/reference increment',['HPX-PROC-004.005','HPX-PROC-008'],
 [('docs/09-guides/reference/DEVELOPMENT_STATE.md','advertises neither capability'),('docs/09-guides/reference/DEVELOPMENT_STATE.md','On a future owner resume'),('docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md','Required checks before delivery')],
 'Backend, transport and component checks do not establish actual branch-switch undo/recovery, live checkpoint capture, lost/delayed acknowledgement, text promotion and separately retried replacement across HTTPS/SQLite/restart. The general Provenance panel reader for working-source Fork also remains unconnected.',
 'Advertising these capabilities prematurely could expose source/context confusion or incomplete inspection despite sound local primitives. The current non-advertisement is a useful containment boundary.',
 'Latest state explicitly lists unexecuted runtime/reader/below-widget gates. The bounded abstract review model catches hypothetical wrong-branch acknowledgement and partial-publication mutants but cannot establish implementation correctness.',
 'This is unfinished authorized work rather than a known implementation bug. Existing committed-passage features retain their prior acceptance.',
 'Keep capabilities gated; connect missing reader, then execute the exact synthetic matrix already demanded by ADR019, including crash between text Commit and replacement and original receipt replay.',
 'A narrow test-only capability setup exercises code without publishing unsupported UI. More unit tests alone will not close the cross-subsystem gate.',
 'On a future implementation resume, finish the reader and one real isolated lifecycle before widening scope. No implementation is performed here.',
 'No new design approval for existing adopted scope; explicit resume is needed after the owner stop.','P1 — before enabling branch/working capabilities','Integration failure likelihood unknown; evidence absence is certain.')

F('Immutable retry receipts cause growth beyond retained text history','Scalability risk / inefficiency','Medium','High for growth; low for practical impact','Confirmed structural growth; resource exhaustion hypothetical','All acknowledged local mutations',['HPX-PROC-003.002','HPX-PROC-003.004','HPX-PROC-018.003'],
 [('docs/07-implementation/data-structures/sqlite-records.md','each command retains its own encrypted receipt'),('crates/storage/src/lib.rs','let receipt = Receipt { operation, outcome };'),('docs/04-architecture/decisions/0011-retained-history.md',None)],
 'Every successful mutating operation retains an immutable encrypted receipt even though autosave overwrites mutable Draft. With S changing Save operations, receipt count is Θ(S), independent of explicit Commit count. Five-second idle is a trigger, not a mandatory perpetual save frequency.',
 'Long-lived editing may grow the DB and backup cost despite few committed revisions. This is not evidence that each save rewrites all historical text; receipts normally retain outcome/digest rather than the whole request.',
 'Inspect the unconditional receipt insertion after the successful command dispatch. A hypothetical one changing save every five seconds of eight active hours gives 5,760 receipts/day; this is an input assumption, not an observed usage or size measurement.',
 'Durable idempotency deliberately needs receipts; operation rate may be modest and storage cheap. No benchmark establishes an unacceptable cost.',
 'Measure real encrypted receipt/index/WAL growth with representative workloads. Consider explicit quotas/backpressure, safe no-op suppression or owner-approved retry/retention semantics before any compaction design.',
 'Deleting receipts can break original-result replay and violate retained-history rules. Reusing IDs for changed commands is never an optimization. Full-history pruning is not an authorized remedy.',
 'Add storage-growth measurements to acceptance and state the supported retry horizon/retention policy before proposing mutation.',
 'Measurements routine; receipt expiry/erasure or semantic retention changes require owner approval.','P2 — before long-lived workspace scale claims','Certain asymptotic growth; capacity impact workload dependent.')

F('Working-source capture repeats whole-source serialization and validation','Inefficiency / potential opportunity','Medium','Medium','Code-supported hypothesis; no measured bottleneck','Gated WorkingCopy and private reference reads',['HPX-PROC-008.003','HPX-PROC-008.004','HPX-PROC-008.006'],
 [('crates/storage/src/working.rs','serde_json::to_vec(request)'),('crates/storage/src/working_clipboard.rs','let view = working::source_view'),('crates/storage/src/lib.rs','pub const MAX_TEXT_BYTES')],
 'Working requests carry complete text plus selected quote; validation serializes them to enforce wire-size limits. Source view reconstruction is repeated from private-reference paths. A required pending save plus checkpoint can logically persist N bytes in Draft and N+Q in retained checkpoint payload, before JSON/envelope overhead.',
 'Time and transient memory scale at least linearly with source bytes; repeated exact-source resolution across K entries can approach O(KN) bytes processed without an authorization-safe transaction cache. This estimate is conditional on shared sources and actual call paths, not a benchmark.',
 'Static call inspection identifies serialization and source_view calls. N≤2 MiB, Q≤N currently; 2N+Q is logical stored source duplication, not exact SQL bytes. JSON escaping can expand a control-heavy payload and is explicitly bounded/rejected.',
 'Repeated validation intentionally catches tampered/authenticated references. The small bounded list and text ceiling may make cost acceptable.',
 'Profile large mixed-Unicode/control-character capture and list reads. If needed, cache validated immutable source within one authorized read transaction and avoid duplicate serialization using an exact bounded encoder.',
 'Cross-transaction caching risks stale permission/context. Public plaintext hashes or global dedup would change privacy/identity assumptions and are not justified by this finding.',
 'Measure allocation/serialization/decryption counts per operation before refactoring; preserve exact bytes and fail-closed bounds.',
 'Routine bounded optimization can follow specifications; privacy/format changes require owner decision.','P2 — investigate after integration correctness','Repeated work is present; user-visible latency unknown.')

F('One workspace mutex can couple slow crypto and reads to edit latency','Scalability risk / architectural coupling','Medium','Medium','Confirmed serialization structure; impact hypothetical','Current local runtime contention',['HPX-PROC-002.003','HPX-PROC-003','HPX-PROC-006','HPX-PROC-016.003'],
 [('crates/runtime/src/main.rs','match state.lock()'),('docs/09-guides/reference/DEVELOPMENT_STATE.md','does not cancel an already executing KDF/transaction'),('docs/06-subsystems/interfaces/browser-runtime.md','16')],
 'The service admits bounded workers but routes workspace work through shared state. KDF or a long authorized storage/read operation may serialize other requests. The socket deadline prevents stale queued work from starting but is not cancellation of an executing KDF or transaction.',
 'A slow unlock/query/capture can delay Save or lock response and create unknown transport outcomes. Sixteen ingress workers do not mean sixteen parallel workspace operations; local single-user scope limits expected load.',
 'Static runtime lock acquisition and documented deadline limit confirm structure. Argon2 uses 64 MiB per derivation; do not multiply by sixteen as if all derivations run concurrently under the same lock.',
 'Coarse serialization is a deliberate simple consistency boundary and may be entirely adequate for one user.',
 'Measure concurrent save/history/unlock/lock workloads. If needed separate session state and safe immutable reads or use an explicit bounded coordinator queue while preserving current authorization and writer ordering.',
 'Finer locks/read caches increase race and stale-authority risks; a new server architecture is not justified without measurements.',
 'Publish supported latency/load budgets and profile contention before changing concurrency.',
 'No approval for measurement; concurrency/authorization redesign should be reviewed.','P2 — before multi-user/performance claims','Contention possible; workload incidence unknown.')

F('Application authorization is concentrated in the storage crate','Architectural coupling / maintainability concern','Medium','High for structure; medium for remedy','Confirmed implementation concentration; improvement proposal','Storage feature growth and alternate interfaces',['HPX-PROC-003','HPX-PROC-008','HPX-PROC-015.006'],
 [('docs/04-architecture/component-architecture.md','Application layer'),('crates/storage/src/lib.rs','pub fn receipt'),('crates/storage/src/working.rs','use super::*;'),('crates/domain/Cargo.toml',None)],
 'The intended application responsibility is separate from persistence, but the present storage crate hosts principal/device checks, command dispatch/replay and transaction orchestration. Sibling feature modules share the parent namespace. Cargo dependencies are acyclic and domain remains dependency-free; no missing microservice is implied.',
 'Adding MCP/providers may tempt duplication of authorization/expected-state semantics. Shared namespace access makes it harder to identify the minimum privilege/data interface for each feature.',
 'Static dependency report: five local crates, six path edges, no local crate SCC; 52 frontend modules/101 recognized imports/no static SCC. Thirty-eight storage super::* occurrences include tests, not thirty-eight production cycles.',
 'A single crate can contain well-separated layers; separate packages do not guarantee architecture. Current code may be a proportionate local slice.',
 'First document a narrow application operation facade and storage transaction capabilities. Consider an internal application module only when a second real adapter needs it; avoid empty services.',
 'Moving serialization or pure validation back into domain would violate adopted boundaries. Over-abstracting every feature adds indirection and transaction-lifetime complexity.',
 'Draw a precise call/data-access map for the next interface and enforce domain purity, current-authority-before-replay and one-operation semantics.',
 'Routine internal separation within contracts; public API changes follow explicit compatibility policy.','P2 — before a second command transport','Growth-driven maintenance risk; no present dependency cycle demonstrated.')

F('Additive branch records lack actual older-reader preservation evidence','Verification gap / interoperability risk','High','High','Confirmed remaining compatibility gate','Gated kinds 20–27 and strict command outcomes',['HPX-PROC-003.007','HPX-PROC-008'],
 [('docs/09-guides/reference/DEVELOPMENT_STATE.md','actual older-reader preservation for20–27'),('docs/07-implementation/data-structures/sqlite-records.md','Readers that do not implement the clipboard'),('docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md','Old readers must preserve')],
 'Wrapper tests establish shape/authentication for new records, but do not establish that an actual older executable preserves them during ordinary writes, or that old-reader writes safely invalidate cached working-base assumptions. Strict new receipt outcomes cannot be reconciled by unaware clients merely because HTTP contract remains 1.',
 'An unaware writer might preserve opaque rows yet make cached working lineage stale; supported readers need honest capability/receipt limits. Independent version domains are correct but require a compatibility matrix.',
 'Earlier recorded old-reader checks cover prior optional kinds; the newest checkpoint explicitly lists 20–27 as pending. No old binary is executed during this review.',
 'New features are currently gated, containing the exposure. Generic tables do permit opaque preservation, but that is a design claim until exercised.',
 'Execute a representative old/new reader matrix with byte-identical optional ciphertext checks and current-reader revalidation after old Save/Commit. Specify command/outcome support separately from ordinary document compatibility.',
 'Requiring a minimum reader is simpler than preserving every old behavior but changes rollout/backup expectations; do not bump unrelated formats automatically.',
 'Close the actual matrix before advertising capabilities or accepting persistent real data in this increment.',
 'No new approval for existing required tests; incompatible rollout policy needs owner approval.','P1 — before enabling branch/working writes','Unknown compatibility failure probability; evidence absence certain.')

F('Rights and mandate requirements lack an executable core policy model','Missing specification / security risk','High','High','Confirmed future contract gap','Future exports, sharing and provider context',['HPX-PROC-011','HPX-PROC-012','HPX-PROC-013','HPX-PROC-015'],
 [('docs/06-subsystems/import-export.md','Unresolved attribution/licensing conflicts'),('docs/08-assurance/privacy-and-data-protection.md','one authoritative policy/command boundary'),('docs/08-assurance/security-threat-model.md','Group membership and current read rights')],
 'The contracts establish scoped authorization, contested attribution/licensing and confidentiality gates, but do not select versioned policy inputs, grant/delegation algebra, conflict precedence representation, revocation timing or a minimal decision interface. Named-holder and mandate workflows are requested review topics; separate adoption or executable schemas were not located. Rights reporting itself can reveal sensitive claims.',
 'Independent exporters/agents may implement different allow/deny rules, or confuse unresolved rights with access denial. Mixed-input output could launder confidential material if the mode gate is only a UI check.',
 'Construct a decision table for authorized source plus disputed licence, unauthorized source plus consent, and mixed trusted/non-trusted sources. The high-level outcomes are constrained; exact persisted authority evidence and evaluator remain unspecified.',
 'The current sole-owner local slice does not require a complete multi-user rights engine. This finding gates the dependent future features, not existing editing.',
 'Specify a small shared authorization/egress decision contract, evidence versions, precedence and explainable denial/report scopes before implementing each outbound adapter.',
 'A universal legal rules engine would be excessive. Preserve claim uncertainty and owner decisions without asserting legal truth or blocking authorized exports solely for unresolved claims.',
 'Owner review of the minimal policy decision table and historical disclosure rules.',
 'Yes — authority, disclosure and conflict policy.','P1 when outbound or shared features are selected','High risk of divergent implementations if deferred past adapter implementation.')

F('Bundled academic compiler must reconcile packaging and determinism','Missing specification / architectural trade-off','Medium','High','Confirmed future design choice','Future Pandoc/academic export',['HPX-PROC-001','HPX-PROC-013'],
 [('docs/06-subsystems/import-export.md','single-Rust-executable packaging requirement'),('docs/registers/requirements.csv','HPX-RQ-001'),('docs/06-subsystems/import-export.md','Generic XML')],
 'Owner-confirmed bundled/embedded Pandoc removes a separate installation step but does not select a binding/helper distribution. The one-executable runtime constraint, writer versions, XML/JSON schemas, templates/styles/locale and external resource behavior are not yet reconciled in an executable format profile.',
 'A later exporter could silently depend on another installed process, fetch mutable resources or generate non-reconstructible citations/relationships. This is an unresolved design constraint, not proof that the requirements are impossible together.',
 'Compare release packaging and future compiler clauses. Enumerate embedded library versus bundled/extracted helper versus narrower compatible writer; no package or compiler was installed for this review.',
 'A bundled helper may satisfy user experience while requiring an explicit interpretation of one executable. An embedded implementation may satisfy packaging but increase build/licensing complexity.',
 'Write a compiler ADR with licence/provenance, packaging, sandbox/resource limits and exact reproducibility profile; separately select XML/JSON semantics and PDF route.',
 'More formats increase maintenance and loss mappings. Avoid general compiler abstractions beyond the owner-confirmed targets.',
 'Owner decides packaging interpretation after a concrete alternatives study; freeze a minimal MD/HTML academic profile first.',
 'Yes — packaging/format scope; no decision inferred here.','P2 before academic export implementation','Future contradiction possible, not a confirmed impossible requirement.')

F('Portable package and restore contracts are not ready for durable interchange','Missing specification / data integrity risk','High','High','Confirmed future format gap','Portable import/export/backup/restore',['HPX-PROC-013.007','HPX-PROC-014'],
 [('docs/06-subsystems/external-integrations.md','.hpxz'),('docs/06-subsystems/formats/hpx-workspace.md','Compatibility and migration'),('docs/08-assurance/recovery.md','copying a live database')],
 'Names .hpxz/.hpx.json/.hpxe do not supply complete bytes/schema, closure, size/stream limits, identity collision rules, algorithm negotiation, signatures, key recovery or roundtrip guarantees. Current consistent SQLite backup is specific to native enrollment, not a delivered portable restore.',
 'Premature formats can permanently lose nested source bindings or import misleading identity/authority. Copying a live WAL DB is explicitly unsupported and must not substitute for backup.',
 'Attempt a paper roundtrip of repeated occurrence paths, retrospective assertions, private checkpoints and unknown optional records. Current high-level contracts do not define all encodings or inclusion/disclosure rules.',
 'Deferral is intentional; a native encrypted snapshot is useful within its documented scope and need not solve general interchange.',
 'Design a minimal versioned interchange manifest with exact closure and unknown-record policy; bounded staged validation; create-only restore; corruption/roundtrip vectors and migration strategy.',
 'Streaming reduces memory but complicates authenticated all-or-nothing import; packaging every private record may disclose more than a recipient is authorized to see.',
 'Owner selects inclusion/privacy and identity policy before any real package acceptance.',
 'Yes for durable format acceptance and selective disclosure.','P1 before portable real-data interchange','High cost of format mistakes after distribution; no current import failure demonstrated.')

F('Remote job recovery has sound high-level states but missing executable reconciliation','Missing specification / reliability risk','High','High','Confirmed future recovery gap','GitHub and other provider side effects',['HPX-PROC-015.004','HPX-PROC-015.005','HPX-PROC-012.005'],
 [('docs/06-subsystems/external-integrations.md','unknown'),('docs/06-subsystems/external-integrations.md','expectedHeadOid')],
 'The documentation correctly separates approval, local outbox and provider conditional writes, including unknown outcomes. Exact durable job schema, provider-specific identity/equality probes, lease/retry rules, cancellation, credential revocation and crash recovery remain to select.',
 'A naive retry could duplicate a foreign change or overwrite a concurrent remote update even though the local job appears failed. A local receipt cannot by itself prove a provider did or did not write.',
 'Sequence: provider accepts conditional write; reply is lost; process crashes before recording success. The planned unknown state is necessary, but precise probe/reconcile behavior remains unspecified.',
 'This is a deliberate future gate, not a discovered bug in an existing GitHub publisher; no such live publisher is claimed.',
 'Define one provider operation end-to-end: frozen exact bytes/precondition, encrypted job, transition table, reconciliation evidence and user review of still-unknown state. Keep create-only backup distinct from Markdown update.',
 'Provider APIs have different preconditions (branch expectedHeadOid versus file SHA); hiding them behind a false exactly-once abstraction harms correctness.',
 'Design/fault-model the smallest GitHub publication before provider connection and implementation.',
 'Yes for connection, credentials and publication; routine mock modelling is already within future design scope.','P1 before any provider write implementation','Lost reply and remote races are ordinary distributed-system failure modes.')

F('Concurrent structural acceptance needs more than local acyclicity','Data integrity risk / missing specification','High','High for counterexample','Confirmed mathematical risk; future mechanism absent','Future federation and multi-user structure',['HPX-PROC-005.005','HPX-PROC-017.002'],
 [('docs/05-domain/hypergraph-mathematics.md','acyclic'),('docs/04-architecture/component-architecture.md','a text CRDT does not validate graph moves'),('docs/07-implementation/algorithms/expansion-validation.md','projection')],
 'Two locally accepted acyclic expansion updates may form a cycle when combined. Single-parent occurrence constraints can likewise conflict. The local Kahn validator checks a supplied projection; it does not choose a globally convergent rejection/acceptance policy or prove the caller closure complete.',
 'Replicas might accept different documents or repeatedly reject each other without a specified causal/authority conflict rule. Reading order and DAG order cannot substitute for conflict semantics.',
 'Actual review counterexample in model-results.json: A accepts X→Y, B accepts Y→X; each is acyclic, union is cyclic. This is independent of text CRDT correctness.',
 'The architecture explicitly recognizes federation as gated. No claim that current local operation is defective follows.',
 'Specify authoritative operation identity, causal context, deterministic structural acceptance/conflict representation, rights evaluation and partial-knowledge behavior before choosing replication transport.',
 'Central ordering simplifies validity but changes availability/authority; decentralized deterministic conflict policy needs explicit user-visible outcomes and retained rejected proposals.',
 'Owner chooses availability/conflict semantics after a two-replica bounded model; do not infer MLS solves graph convergence.',
 'Yes — distributed authority and conflict semantics.','P1 before collaboration/federation architecture commitment','Counterexample certain under naive union; actual future policy unselected.')

F('Agent proposal approval needs a versioned target and authority contract','Missing specification / security risk','High','High','Confirmed future application-boundary gap','Future AI and MCP mutation',['HPX-PROC-012','HPX-PROC-015.006'],
 [('docs/06-subsystems/document-engine.md','Browser, REST and MCP converge'),('docs/03-requirements/system-requirements.md','Proposals freeze exact targets'),('docs/02-governance/ai-development-protocol.md','approval')],
 'High-level rules require explicit provider connection, permitted exact context, proposals and human authorization, but do not yet define complete proposal schema, target/expected-head binding, approval expiry, delegated tool scopes, cancellation/replay and consequential interaction retention.',
 'A stale or changed tool payload could inherit an approval intended for a different exact plan; untrusted model text may be mistaken for authority if alternate interfaces bypass the coordinator.',
 'Paper test: human reviews target revision R, another action advances to R2, agent submits a modified patch under old approval. Required rejection/review principle is clear; exact message/evidence protocol remains missing.',
 'No live agent mutation feature is delivered; UI placeholders and future specification are correctly distinct from integration.',
 'Define minimal frozen proposal/approval data and route all accepted edits through existing application expected-state and receipt semantics. Mock prompt injection, stale target, revoked grant, lost reply and changed-operation cases before live providers.',
 'Recording every provider message can increase sensitive retention; capture consequential observable evidence with approved scope rather than private chain-of-thought.',
 'Review scoped approval and disclosure design before any live credential or tool mutation.',
 'Yes — provider connection, disclosure and delegation policy.','P1 before live agent mutation','Known general failure mode; no present exploit demonstrated.')

F('Local TLS trust evidence does not close portable distribution lifecycle','Missing specification / portability risk','High','High','Confirmed release-readiness gap','Installer, certificate renewal/removal, platform support',['HPX-PROC-001','HPX-PROC-016.006'],
 [('docs/08-assurance/local-browser-trust-proposal.md',None),('docs/04-architecture/decisions/0016-local-development-signing.md',None),('docs/09-guides/reference/DEVELOPMENT_STATE.md','portable')],
 'An approved local certificate and verified Chromium preflight establish a scoped development workflow. They do not supply portable trust enrollment, certificate expiry/renewal/removal, distribution signing identity continuity or a complete supported-platform keychain/browser matrix. The failed self-signing experiment was reverted to approved ad-hoc development signing.',
 'New users may face blocked startup or repeated credential prompts; tempting certificate-warning bypasses would violate the trust requirement. Signing an executable does not itself establish TLS browser trust.',
 'Compare bounded local trust evidence, ADR016 outcome and future release/platform gates. No trust store, certificate or native secret was touched in this review.',
 'A local developer-only milestone can be valid with explicit manual steps; it need not promise a consumer installer.',
 'Define the intended release audience/platform matrix and a reviewed certificate lifecycle with fingerprint checks, failure rollback and uninstall. Evaluate Apple-issued signing separately with its own credentials.',
 'Automated trust installation needs explicit owner/user authorization and platform-specific handling; stronger independent client delivery is a distinct hostile-host requirement.',
 'Owner chooses distribution support and signing route before portable release claims.',
 'Yes — trust installation and signing credentials require separate authorization.','P1 before portable release','Certain missing platform coverage; failure incidence outside tested host unknown.')

F('Quality acceptance lacks measurable workloads and platform thresholds','Verification gap / excessive specification placement','Medium','High','Confirmed assurance gap','Performance, accessibility, recovery and portability',['HPX-PROC-004','HPX-PROC-018.003'],
 [('docs/08-assurance/testing-strategy.md','Pass/fail or measurement thresholds'),('docs/06-subsystems/frontend-interaction.md','1500'),('docs/03-requirements/acceptance-criteria.md',None)],
 'Some interaction details are precise (desktop widths, source-neutral widgets and tooltip delay), while generic assurance sections defer performance, accessibility and platform thresholds. Exact UI constraints are owner requirements, not defects; their repetition across levels increases maintenance cost when no single current assurance matrix exists.',
 'A feature can pass examples yet have no agreed latency, workload size, keyboard/screenreader or failure budget. Repeated presentation details may drift while major quality risks remain unmeasurable.',
 'The testing strategy explicitly forbids fabricated benchmark/WCAG/platform claims and provides generic threshold text. Existing synthetic desktop evidence is valuable but narrower than full quality acceptance.',
 'Early local scope may intentionally prioritize source correctness over performance and broad platform support. Do not manufacture numerical targets.',
 'Create a small owner-reviewed quality scenario matrix: input size, concurrent contexts, operation, environment, required behavior and measurement; keep detailed presentation values in one source with cross-references.',
 'Premature hard targets can constrain implementation without user value. Choose workloads from actual use and clearly label observations versus acceptance thresholds.',
 'Agree first supported workloads and accessibility scenarios before scale/conformance claims.',
 'Yes for new acceptance thresholds; measuring current behavior is routine.','P2 before broader quality claims','Coverage gap certain; practical dissatisfaction unknown.')

F('Compound requirement seeds and source counts overstate completeness if treated as proof','Maintainability concern / verification gap','Medium','High','Confirmed traceability granularity limit','All requirements and migration evidence',['HPX-PROC-018.005'],
 [('docs/registers/requirements.csv','HPX-RQ-030'),('docs/registers/claim-coverage.csv',None),('docs/MIGRATION-REPORT.md','coverage'),('docs/03-requirements/system-requirements.md',None)],
 'The register has 31 compound seeds rather than an exhaustive atomized requirement set. Existing historical claim/coverage counts and this review’s 60-document paths demonstrate coverage bookkeeping, not individual correctness or complete architecture. Broad academic export and working-branch rows contain many independent acceptance obligations.',
 'A nominal 31/31 mapping can hide missing rights-policy types, exact formats, error cases and verification targets. Generic template headings are not implemented mechanisms.',
 'Decompose RQ030 into selection/closure, compiler packaging, citations, per-format role mapping, rights reports and schemas. One row cannot certify all six independently. This review maps all seeds but explicitly refuses atomic coverage percentage.',
 'Compound seeds are reasonable during migration when original statements and acceptance are preserved. The risk arises only when consumers treat them as exhaustive testable units.',
 'Incrementally derive atomic obligations only for the next selected feature, retaining source lines, adoption scope, process leaf, verification method and unresolved mechanism. Keep source coverage separate from semantic coverage.',
 'Full retroactive atomization is costly and could accidentally invent requirements; do not replace adopted source meaning with editorial decomposition.',
 'Use the next branch integration and export design as two small traceability pilots.',
 'Routine trace maintenance; changing requirement meaning needs owner decision.','P2 — before declaring feature completeness','High risk of reporting misuse; no source-loss claim made.')

F('Formal correspondence should target cross-subsystem contracts incrementally','Potential opportunity / verification gap','Medium','High','Confirmed assurance boundary; proposed next step','Publication, checkpoint promotion and request reconciliation',['HPX-PROC-003','HPX-PROC-008','HPX-PROC-018.001'],
 [('docs/08-assurance/formal-validation-digest.md','full Rust graph validator remains unproved'),('docs/08-assurance/formal-validation-digest.md','spend'),('docs/07-implementation/protocols/draft-publication.md',None)],
 'Existing proofs accurately disclose their narrow scope. Cross-subsystem properties—late acknowledgement preserving newer source, source-type separation, atomic publication/receipt, and failure-independent post-Commit replacement—remain primarily executable-test contracts. The review model checks an abstraction, not extracted Rust or browser execution.',
 'Correct local validators do not by themselves prevent context or ordering errors in the complete workflow. A whole-application proof would be disproportionate and is not implied by current formal evidence.',
 'The review explores 8,131 abstract states/18,317 transitions through depth 10, and finds short counterexamples in three deliberately wrong variants. Those mutants are not HPX defects. Crypto/fsync/auth revocation/Unicode are outside the model.',
 'Existing integration/fault tests may provide sufficient practical assurance; formalization is an opportunity, not a prerequisite invented by this review.',
 'Promote a few critical invariants into reusable state-machine contracts and property/fault tests; consider extraction/model correspondence only where source/toolchain boundaries are tractable.',
 'Every extra model needs correspondence maintenance. Strong claims about code require extraction/refinement evidence, not a bigger handwritten state machine.',
 'Keep the small model as review evidence and select one high-value property for implementation-connected checking after integration.',
 'No new approval for analysis; choosing new acceptance/proof obligations needs owner review.','P2 — after closing immediate integration gaps','Potential benefit supported; no proof defect found.')

F('Crash tests and enrollment backup do not establish complete disaster recovery','Verification gap / reliability risk','High','High','Confirmed evidence limit','Disk failure, power loss, corruption and restore',['HPX-PROC-003.005','HPX-PROC-014','HPX-PROC-018.002'],
 [('docs/08-assurance/recovery.md','No claim is made that process exits exhaust power-loss'),('docs/04-architecture/decisions/0014-keychain-unlock-policy.md','backup'),('docs/08-assurance/recovery.md','functioning SQLite VFS/fsync')],
 'Process-exit injections show transaction-boundary behavior under the tested filesystem. They do not exhaust disk-full, fsync/VFS errors, torn storage, damaged backup, credential loss or restoration to a new trusted environment. Enrollment’s verified encrypted backup is a useful narrow increment, not a complete recovery product.',
 'Acknowledged data durability is conditional on the local storage stack; users lack a fully specified general restore procedure. Failure to distinguish these scopes can overstate survivability.',
 'Read the explicit filesystem/hardware assumptions and narrow backup evidence. No hardware/power-loss or corrupt-backup experiment is executed in this review.',
 'SQLite/FULL and OS guarantees can be reasonable assumptions for the first slice; exhaustive fault simulation is not always cost-effective.',
 'Specify supported failure envelope and an isolated backup/restore rehearsal with missing/corrupt key wrapper, truncated backup, disk-full/fsync failure and process restart outcomes. Preserve originals and distinguish unavailable from irrecoverable data.',
 'Fault-injection adapters and platform testing cost effort; portable recovery must also avoid granting historical keys beyond intended recipients.',
 'Before real-data recovery claims, select a minimal supported restore design and evidence plan.',
 'Yes for recovery guarantees, format and credential policy; isolated analytical/fault tests are routine.','P1 before disaster-recovery claims','Hardware failure likelihood unmeasured; evidence limit certain.')

dump('findings/register.json',findings)
index='# Findings register — Stage D/E\n\nSeverity applies within the stated milestone. A high future-impact gap is not a current exploitable defect. P1 is a gate before the named dependent acceptance, not an instruction to implement every future feature now. Confidence in missing evidence differs from confidence that a failure will occur. No confirmed cryptographic exploit or source-corruption execution is reported.\n\n'
index+=table(['Finding','Category / severity','Evidence status','Priority'],[[f"[{f['id']}: {f['title']}]({f['id']}.md)",f['category']+'; '+f['severity'],f['status'],f['priority']] for f in findings])
write('findings/README.md',index)
for f in findings:
    text=f"# {f['id']} — {f['title']}\n\n[Register](README.md) · [Recommendations](../recommendations.md)\n\n"
    labels={'category':'Category','severity':'Severity','confidence':'Confidence','status':'Confirmed versus hypothetical','scope':'Affected components / scope','processes':'Affected processes','priority':'Priority and dependency gate','likelihood':'Likelihood / evidence limit','problem':'Problem','consequences':'Architectural consequences','demonstration':'Reproduction / demonstration','alternative_interpretations':'Alternative interpretations','possible_remedies':'Possible remedies','tradeoffs':'Trade-offs','next_action':'Recommended next action','owner_approval':'Human architectural approval'}
    for k,label in labels.items():
        value=f[k]; value=', '.join(value) if isinstance(value,list) else value
        text+=f'## {label}\n\n{value}\n\n'
    def literal(q):
        q=html.escape(q)
        for a,b in [('[','&#91;'),(']','&#93;'),('(','&#40;'),(')','&#41;'),('`','&#96;')]: q=q.replace(a,b)
        return q
    text+='## Exact evidence\n\n'+table(['Source / line','Quoted locator (not an entire source passage)'],[[slink(s,'../../../'),literal(s['quote'])] for s in f['sources']])
    write(f"findings/{f['id']}.md",text)
print(json.dumps({'findings':len(findings),'source_locators_not_matched':[[f['id'],s['path'],s['needle']] for f in findings for s in f['sources'] if not s['matched']]}))
