"""Readable assessment and cross-view trace artefacts from the reviewed model."""
import sys
sys.dont_write_bytecode = True
from build_review import ROOT, OUT, write, dump, table
from collections import Counter
import json
model=json.loads((OUT/'traceability/process-model.json').read_text())
ps=model['processes']; counts=Counter(x['status'][0] for x in ps)
findings=json.loads((OUT/'findings/register.json').read_text())
diagrams=json.loads((OUT/'diagrams/index.json').read_text())
mr=json.loads((OUT/'formal-analysis/model-results.json').read_text())

invariants=[
 ('HPX-INV-001','Same-node ancestry differs from cross-identity derivation','003.003 / 007.002-.003 / 008.007','010 / 014 / 017','Domain planners and storage exact source checks','Fork/Synthesis/WorkingFork identity and immutable parent tests','Not proved for complete application; four rank-model theorems do not address identity'),
 ('HPX-INV-002','Logical identity differs from occurrence and ordered placement','005.002-.006','010 / 021','Domain composition contract; first writer one occurrence','Future move/reuse/repeated nested-path closure property tests','General multi-owner composition and structural publication incomplete'),
 ('HPX-INV-003','Snapshot closes exact revision/resource bindings; no live heads','005.003 / 006.003 / 013.002','010 / 014 / 024','One authorized storage read and exact retained snapshot','Unicode/newline/history/restart and cursor scope checks','General closure/export compiler resources future'),
 ('HPX-INV-004','Save is durable mutable Draft, not text Commit/checkpoint','003.002 / 008.003','013 / 019','CAS Draft and operation receipt transaction','Idle Save without revision advance; exact restart; capture separately','Review abstraction checks no Save/capture text publication; not app extraction'),
 ('HPX-INV-005','Unknown outcomes reuse frozen operation bytes and original receipt','003.001 / 003.004','013 / 026','Application authority before receipt replay and digest equality','Lost/delayed reply, changed reuse, queued edits and cross-branch checks','Review late-ack/wrong-branch mutant counterexamples; actual branch integration pending'),
 ('HPX-INV-006','Revision/snapshot/event/head/draft/receipt publish all-or-none','003.003','014 / 026','One BEGIN IMMEDIATE/COMMIT transaction','Fault checkpoints and process exits before/after COMMIT','Review partial-publication mutant caught; no fsync/hardware proof'),
 ('HPX-INV-007','Exact promotion retains checkpoint; replacement is separate batch','008.005-.006','011 / 015 / 019','Text transaction stores promotion, later CAS batch stores replacements','Changed full-source/base/range, stale list, lost batch reply/restart tests','Only latest eligible checkpoint/private list supported; broad entity replacement deferred'),
 ('HPX-INV-008','Expansion DAG constraint does not forbid reference cycles','005.005 / 006.001 / 017.002','027 / 030','Pure bounded Kahn validator on caller-supplied projection','512 three-vertex graphs differential test; future union-conflict cases','Four Lean rank/path model proofs; only spend helper extracted correspondence'),
 ('HPX-INV-009','Current authority and disclosure permission precede protected read/replay','002 / 003.001 / 011 / 016','016 / 025','Authenticated catalog owner/device, route session and source checks','Revoked/missing/cross-workspace/cross-branch/unknown outcome tests','Future delegation, group history access and policy algebra incomplete'),
 ('HPX-INV-010','Sensitive records encrypted before SQL/WAL; caller supplies context','016.001-.002','012 / 025','AEAD with expected workspace/logical binding/purpose/epoch','Tamper/substitution/nonce/resource/passphrase wrapper tests; sentinel probes','No hostile unlocked-host confidentiality or whole-DB freshness witness'),
 ('HPX-INV-011','Non-trusted mode denies core-controlled plaintext egress','011.002 / 012.002 / 013.006 / 016.004','024 / 025','Future common mode/policy boundary','Proposed deny direct/API/background/clipboard/print/mixed-source/mode-change tests','Client-held unavailable; current own-host browser cannot enforce hostile delivery isolation'),
 ('HPX-INV-012','Retrospective annotation review does not rewrite text Snapshot or truth','009.001-.004','017 / 020','Separate immutable entity revision/index family','Exact old passage/comment; assertion review ancestry; snapshot isolation tests','Replies/edit/resolve/general semantic proof not delivered'),
 ('HPX-INV-013','Native keychain side effects require ordered compensation','002.005-.007','016 / 029','Backup then native create before DB commit; remove DB before native','Denied/existing/wrong-secret/crash orphan/remove/restart/passphrase fallback tests','Crash-orphan cleanup after lock is scoped manual recovery, not automatic durable queue'),
 ('HPX-INV-014','Provider uncertainty is not proof of no external effect','012.005 / 015.004-.005','022 / 023','Future encrypted outbox and provider-specific conditional operations','Proposed lost-success-reply, restart, remote race and permission-change scenarios','No atomic cross-provider SQLite transaction or exactly-once proof'),
 ('HPX-INV-015','Immutable retention and exact bytes survive view edits and reference changes','003 / 004 / 007.007 / 008.006 / 016.007','010 / 015 / 029','Append-only canonical history; protected private list CAS; owned-source mapping','Source byte equality/undo/remove/clear/replacement tests','No arbitrary history pruning; erasure/redaction needs separate owner-approved design')]
dump('traceability/invariants.json',[dict(zip(['id','invariant','processes','diagrams','mechanism','verification','limits'],r)) for r in invariants])
write('traceability/invariants.md','# Cross-subsystem invariants\n\nIDs are review contracts, not new adopted requirements. Process/diagram numbers below omit the HPX-PROC-/HPX-DIAG- prefix for compactness. Tests are existing reported evidence or explicitly proposed scenarios; none were rerun against HPX during this review.\n\n'+table(['Invariant','Processes / views','Mechanism','Verification and limits'],[[r[0]+' — '+r[1],r[2]+'; '+r[3],r[4],r[5]+'; '+r[6]] for r in invariants]))

failures=[
 ('Wrong credential/context','002.003 / 016.001','Authentication fails without protected disclosure or write','Passphrase recovery only under valid wrapper','Crypto/storage tests reported'),
 ('Invalid origin/session/framing','016.003','Reject before protected route; no plaintext fallback','Correct caller/configuration; no warning bypass','Actual transport rejection evidence reported'),
 ('Stale head/generation/source range','003.001 / 006.002','Conflict; no publication','Explicit recapture/review; never substitute newer text','Storage/domain frozen-operation tests reported'),
 ('Changed operation ID reuse','003.004','Digest mismatch conflicts','Use original frozen intent or new reviewed operation','Receipt replay tests reported'),
 ('Lost/delayed Save acknowledgement','003.002 / 003.004','Outcome unknown; preserve later source and original context','Reconcile original receipt; newer typing remains queued','Prior real workflow; latest branch integration pending'),
 ('Crash before COMMIT','003.003','No partial published object/head/receipt state','Reopen old state, retry original command','Subprocess crash/fault tests reported'),
 ('Crash after COMMIT, before reply','003.003 / 003.004','Full publication plus original receipt exists','Reopen/reconcile, never create duplicate revision','Subprocess crash/retry tests reported'),
 ('Crash between text promotion and replacement','008.005-.006','Text remains committed; links may remain exact working-source references','Inspect pending candidates; retry bounded separate batch under current permission','Backend tests; actual cross-subsystem workflow pending'),
 ('Native create succeeds, DB fails','002.005','Remove only just-created expected native item','Passphrase remains; orphan inspected explicitly after crash','Isolated keychain fault/native tests reported'),
 ('DB wrapper removed, native delete fails','002.007','No native unlock through deleted wrapper; schema stays 2','Retry exact cleanup before lock; scoped inspection after loss of memory state','Removal-order/pending cleanup evidence reported'),
 ('Corrupt/missing authenticated source','003.005 / 006.002','Fail closed; legacy clipboard can expose removable opaque entry per contract','Preserve DB; exact valid backup or separately designed repair','No automatic newest/text-match fallback; repair protocol gap FIND-003'),
 ('Resource limit/quota exceeded','006.001 / 006.004 / 007.001','Atomic reject/budget/incomplete error; no silent history pruning','Narrow scope or explicit user action; quotas are not retention deletion','Bounds unit tests; workload/latency evidence incomplete'),
 ('Unsupported schema/record version','003.007','Format error, preserve original bytes','Supported reader/approved backed-up migration only','Wrapper checks; actual older-reader 20–27 pending'),
 ('Whole DB authentic old image','016.005','Current design may authenticate old state; no freshness witness','No promised detection; owner scope resolution needed','Documented residual limit, no actual rollback experiment'),
 ('Disk-full/fsync/power loss/corrupt backup','014 / 018.002','Guarantee conditional on VFS/fsync/hardware; broader recovery unspecified','Select failure envelope and tested restore design','No power-loss/fsync fault acceptance claimed'),
 ('Provider accepts write, reply lost','015.004','Explicit unknown remote result','Provider-specific state inspection under frozen job; no blind overwrite','Future only; mock/fault protocol to specify'),
 ('Host compromise or malicious delivered client','016','Unlocked plaintext/keys accessible; TLS/at-rest crypto insufficient','Independent trusted client required for stronger hostile-host objective','Explicit environmental assumption; no whole-host protection claim'),
 ('Concurrent replicas form expansion cycle','017.002','Naive union unsafe; do not accept recursive expansion','Future convergent structural conflict policy required','Review two-edge counterexample executed')]
write('traceability/failure-analysis.md','# Failure and recovery matrix\n\nThis matrix separates local transaction guarantees, external compensation, explicit uncertainty and missing recovery. [Recovery view](../diagrams/recovery/029.svg) and [findings](../findings/README.md) explain scope.\n\n'+table(['Failure','Process','Guarantee / observation','Recovery / remaining boundary','Evidence status'],failures))

threats=[
 ('Network/loopback peer','Credentials and document source','Verified HTTPS, exact Host/Origin/session, bounds','TLS does not authorize content or prevent compromised delivered client','016.003; DIAG-025'),
 ('Malicious same-user host','Unlocked plaintext, keys, browser scripts','Explicit trusted-host assumption and independently trusted client requirement for stronger threat','OS, process, swap and browser delivery remain trusted','016; FIND-016'),
 ('Offline DB thief/modifier','Payload privacy and record integrity','Random-key AEAD and expected context; sensitive SQL/WAL ciphertext','Kinds/opaque IDs/generations/length/count/access metadata leak; no padding/ORAM','016.001; DIAG-012'),
 ('Actor restores authentic old complete DB','Freshness/latest state','CAS detects selected stale operation contexts, not authentic full restore','Whole-DB rollback witness absent and acceptance wording unresolved','FIND-001'),
 ('Stale/revoked reader or replayer','Private source and original receipts','Current workspace/document/branch authority before protected read and replay','Future multi-user historical grant semantics incomplete','003.001; FIND-010'),
 ('Untrusted package/DOCX/provider output','Integrity, code execution and resource availability','Future bounded parsing/staging, no macro/external resource execution; proposals lack authority','Exact schemas, parser quotas, sandbox and cancellation contracts future','014 / 012; FIND-012/015'),
 ('Prompt/tool injection','Human authority and provider disclosure','Exact context selection, frozen proposal approval, same core commands','No live agent mutation acceptance; target/approval wire contract incomplete','012; FIND-015'),
 ('Cross-mode delayed egress job','Confidential source/rights evidence','Future core mode gate rechecked before execution/delivery, invalidate pending plans on mode change','Independent trusted client and sink enforcement unavailable','011 / 013 / 016.004'),
 ('Remote race/lost provider result','Repository integrity and approved publication scope','Frozen bytes/destination/provider-specific conditional head plus unknown outcome','No local/remote atomicity; exact reconcile protocol future','015.004; FIND-013'),
 ('Keychain denial/orphan/executable identity change','Workspace availability and secret custody','Explicit alternative and passphrase retained; expected-item compensation','Portable signing identity/trust/cleanup lifecycle incomplete; never autoenroll','002; FIND-016'),
 ('Federation peer with independent authority','Causal history, structural validity, disclosure','Future scoped identities/authority, causal validation and conflict handling','No chosen authentication/signature/key distribution/convergence protocol','017; FIND-014')]
write('traceability/threat-analysis.md','# Threat and trust-boundary analysis\n\nAttacker capabilities are conditional scenarios. This is a design review, not a penetration test. [Trust view](../diagrams/security/025.svg) distinguishes plaintext host, crypto storage and future providers. Current trusted-server plaintext processing is intentional; future non-trusted egress restrictions are stronger and cannot be inferred from the current browser.\n\n'+table(['Threat actor/capability','Asset','Documented/planned control','Residual risk / missing mechanism','Trace'],threats))

write('formal-analysis/README.md',f'''# Formal and analytical evidence

This directory contains a new **handwritten architectural abstraction**, not a new Lean proof or an extraction of HPX. Existing checked evidence stays in the [formal validation digest](../../../docs/08-assurance/formal-validation-digest.md): four rank/path model theorems and one actual extracted Rust spend-helper theorem. No full Kahn, authorization, storage, crypto, browser or binary correspondence is asserted.

## Transition model

[check_model.py](check_model.py) explores two content branches, source sequences 0–2, at most one new Commit per branch and one globally outstanding frozen operation, through ten transitions. Its state records current UI source, durable Draft source, immutable committed sequence history, selected branch, frozen pending operation, retained receipts, latest abstract checkpoint, exact promotion and a replacement flag.

Abstract actions are type, switch, freeze Save/Commit/capture, atomic persist, original-result replay, acknowledgement, precommit failure, replacement and replacement failure. Unknown/lost replies remain pending. Branch IDs are fixed and node identity cannot change in the model. A source sequence denotes exact bytes by assumption: this model does not prove UTF8 or range conversion.

For every examined transition it checks that acknowledgements do not mutate UI/durable source, Save/capture do not append text history, history remains a prefix, a new publication has an atomic Commit receipt, replacement implies exact promotion, and failed post-Commit replacement does not undo text. Source checkpoint retention beyond the latest abstract sequence is outside this small model; actual HPX must retain originals.

Executed result: **{mr['valid_model']['states']:,} unique reachable states, {mr['valid_model']['edges']:,} transitions, no violation within the stated bounds**. Full inputs, source digest, interpreter and results are in [model-results.json](model-results.json). This is bounded reachability, not induction, an unbounded proof, a liveness proof, generation-CAS completeness, or executable refinement. Precommit atomicity is assumed by the valid transition, so it is not independently established for SQLite by this model.

Three deliberately bad variants produce counterexamples: late acknowledgement overwrites newer typing; acknowledgement changes the focused branch; Commit appends history without receipt. These are sensitivity checks for the model, not HPX bugs. A separate two-replica example confirms acyclic edge sets X→Y and Y→X form a cyclic union.

## Contracts and proof obligations

Let D(b) be mutable acknowledged source, H(b) an immutable sequence of committed states, P(o) the frozen payload of operation o, and R(o) its original receipt. Successful Save changes D but not H. Commit extends H by one exact same-node state and publishes its snapshot/event/head/rebased Draft/R(o) together. Retrying o requires the original P(o); changed reuse conflicts. An acknowledgement advances evidence about the frozen source, never overwrites source typed after capture.

For checkpoint c and committed result r, initial promotion requires full source/context equality, not merely equality of a selected quote. Replacement e′ retains predecessor e and exact promotion evidence. The transaction order is capture T₁, text Commit/promotion T₂, separate replacement batch T₃. Failure of T₃ cannot invalidate T₂. This deliberately follows the accepted latest ADR019 semantics; the older atomic-with-Commit private batch checkpoint is superseded.

Future useful implementation-connected checks include multi-tab/multi-context in-flight operations, generation conflicts and revoked authorization before replay, exact payload equality, restart after T₂ before T₃, old-reader draft invalidation, malformed/future DTOs, bounded list capacity and immutable historical reconstruction. See [invariant matrix](../traceability/invariants.md) and [failure analysis](../traceability/failure-analysis.md).

## Complexity estimates

These are analytical observations, not measurements. V/E count the caller-supplied expansion projection; N is exact source bytes, Q selected quote bytes, K a bounded reference count, S acknowledged mutation count, B bytes in an exported closure.

{table(['Operation','Time / space or storage estimate','Evidence / limit'],[
['Expansion validator','Time O((V+E) log V), space O(V+E); successful charged work exactly 2V+2E','Ordered BTreeMap implementation and algorithm contract; full Rust validator unproved'],
['One changing Save','At least Ω(N) source serialization/encryption; mutable text slot overwritten; Θ(S) retained receipts over S operations','No replay of all history per Save; exact DB/envelope overhead unmeasured'],
['Working checkpoint/copy','At least Ω(N+Q) payload work; pending Save plus checkpoint logically 2N+Q source bytes before serialization overhead','N≤2 MiB; escaped JSON/request envelope limit checked separately; not a size benchmark'],
['Repeated source validation','Potential O(KN) processed bytes if K entries each reconstruct same N-byte source without transaction cache','K bounded by list capacity; exact invocation/allocation count requires profiling'],
['Selected graph','Selected nodes ≤16; shared assertion/Synthesis distinct-source work ≤64, plus separately bounded original Fork reads','Not an unbounded all-outgoing query or an O(1) operation; emitted records still cost bytes'],
['History page','O(returned chain steps + authenticated bytes), page ≤32 / 16 MiB read budget after catalog/head','No retention count cap or fabricated timestamp sort; current catalog bounds still apply'],
['Complete compile/render','At least Ω(B + output bytes); repeated occurrence expansion can grow output above unique source size','General closure/compiler budgets remain future; no claim an index avoids output-size cost'],
['Encrypted backup','At least Ω(DB snapshot bytes), plus verification reads and fsync','Enrollment path uses consistent SQLite backup; portable restore is future'],
['Runtime contention','Workspace routes serialized under state mutex; bounded ingress is not parallel execution','Socket deadline excludes starting stale queued route, not preemption of executing KDF/SQL']])}

## Dependency structure

The [static graph](../traceability/dependencies.json) records five local Rust crates/six normal local dependency edges and 52 frontend modules/101 recognized static relative import edges. Tarjan SCC analysis found no cycles in these graphs. Storage shared-parent imports and callback/global state are not a precise function call graph; dynamic dependencies and target/build/dev dependency graphs are outside this parser. No blanket cycle-free architecture claim follows.
''')

statusrows=[['L — documented local responsibilities',counts['L'],'Includes governance/development processes and mixed limited local views; not 50 fully delivered product features'],['G — accepted/gated local increment',counts['G'],'Branch/working runtime workflow and old-reader acceptance pending'],['F — future/incomplete mechanism',counts['F'],'Scope reconstructed; exact implementation contract deliberately incomplete'],['D — explicitly deferred',counts['D'],'Lean conversion retained as deferred']]
write('coverage-report.md','# Coverage and reconstruction limits\n\n'+
      '**All 60 materialized registered contracts have a responsibility/constraint path, and all 31 registered requirement seeds have a design and verification path or explicit gap.** This is 100% of those inventory denominators, not 100% of atomic requirements or an implementation-complete architecture. The current local workflow is reconstructed in substantially more detail than future collaboration/integrations.\n\n'+
      table(['Coverage denominator','Covered / total','What this proves'],[['Markdown inventory','95 / 95','Files hashed and all 1,109 headings indexed; navigation/templates included'],['Materialized registered contracts','60 / 60','Direct source or supporting governance/constraint disposition'],['Reserved contract IDs','28 reserved','No fake contents/implementation inferred; not part of materialized denominator'],['Direct process source documents','38','Referenced directly by family contracts; other documents carry supporting constraints/assurance'],['Registered compound requirement seeds','31 / 31','Family/leaf design and verification paths; explicit granularity gap'],['Parent responsibilities','18 / 18','Ownership tree, child contracts and linked diagrams'],['Leaf subprocesses','114 / 114','Required fields present; missing future mechanisms stated rather than filled'],['Code-aligned leaf entries','57 / 114','Named source files inspected statically; remaining leaves lack implementation claims'],['Semantic evidence claims','38','All seven classifications represented with source locators'],['Coordinated diagrams',str(len(diagrams))+' sources / target renders','Actual final render result is independently reported in validation-report.md'],['Findings','20 / 20','Exact evidence, alternative interpretation, consequence and next action recorded']])+'\n'+
      table(['Leaf temporal class','Count','Meaning'],statusrows)+'\n'+
      'Coverage is based on a mechanical whole-document scan plus targeted semantic examination of requirements, authority, core model, protocols, ADRs, subsystem contracts and assurance. A heading index does not prove equal depth of human inspection for every line; broad source disposition is not independent validation of every retained claim. Historical proof/test reports were read as evidence, not rerun. Existing archival claim counts were not re-audited as a semantic-completeness proof.\n\n'+
      'Known reconstruction limits: no adopted federation causal/authority/conflict protocol; no complete multi-owner source/occurrence writer; no general same-identity branch Merge; no full rights/delegation algebra or separately adopted named-holder/mandate mechanism; no portable package byte schemas or general restore; no deterministic academic compiler/writer profile, XML/JSON schema or complete citation capture representation; no live agent/MCP/provider job protocol. Future diagrams show required boundaries and open transitions, not invented messages or persisted types.\n\n'+
      'The DFD context and Level 1 balance eight explicitly named boundary channels. Lower DFDs are scoped operation zooms, not claims to exhaust every operation inside the grouped Level-1 circles. Conceptual and physical data views are separate. All process leaves are reachable through family diagrams and catalogues, but only ordering-sensitive workflows receive sequence/state detail; forcing all leaves into every notation would add no evidence.\n\n'+
      'The source contains compound normative passages beyond the 31 seeds. A defensible percentage of all atomic obligations cannot be computed without owner-reviewed decomposition. See [FIND-018](findings/HPX-FIND-018.md). The right conclusion is complete inventory coverage with explicit semantic gaps, not “the entire future system is fully specified.”\n')

write('architecture-assessment.md','''# Architecture assessment

HPX has a coherent local core: exact owned source, mutable acknowledged drafts, explicit immutable publication, stable logical identity, distinct occurrence context, closed historical snapshots and separate cross-identity derivation. One encrypted SQLite transaction combines publication objects, mutable pointers and retry evidence. The current code dependency direction supports a pure domain with adapter-owned serialization. These are useful boundaries worth preserving.

The main immediate problem is **acceptance and evidence clarity**, rather than a demonstrated failure of the core algorithms. The rollback gate has broader wording than the documented local freshness guarantee. Current architecture/status summaries retain superseded implementation descriptions. Index repair is required as a responsibility but lacks a complete authoritative/derived-state protocol. Gated branch/checkpoint/reference code still needs its actual runtime, older-reader, restart and undo workflow acceptance. See [FIND-001](findings/HPX-FIND-001.md), [FIND-002](findings/HPX-FIND-002.md), [FIND-003](findings/HPX-FIND-003.md), [FIND-004](findings/HPX-FIND-004.md) and [FIND-009](findings/HPX-FIND-009.md).

## Quality and integrity

| Quality concern | Assessment | Main evidence / limitation |
| --- | --- | --- |
| Correctness / history | Strong semantic separation and local atomic publication; exact sources retained | Complete branch/reference integration pending; general multi-owner/branch Merge unspecified |
| Reliability / recovery | Original receipts and bounded transactions give honest unknown outcomes | No complete index repair, portable restore or hardware/fsync failure acceptance |
| Security / privacy | Explicit trusted-host boundary, HTTPS/session guards, randomized context-bound encryption | No whole-DB freshness witness, hostile-host protection or complete multi-user rights/key policy |
| Performance / scalability | Bounded graph/input APIs; no whole-history rewrite per Save | Receipt growth, repeated source work and coarse mutex need workloads/measurements |
| Maintainability | Pure domain and dependency DAG; stable record/version boundaries | Application authority concentrated in storage and status repetition across documentation |
| Interoperability / evolvability | Independent version domains and optional-record preservation design | Actual older-reader 20–27 checks, packages, MCP/provider protocols and writer schemas incomplete |
| Usability / accessibility | Source-neutral view controls, desktop themes/widths and exact undo concerns explicit | Latest live branch-switch/below-widget acceptance and complete keyboard/screenreader criteria missing |
| Portability / distribution | One embedded executable; development tooling excluded from release runtime | Portable TLS/keychain/signing lifecycle and academic converter packaging unresolved |
| Formal assurance | Proof digest accurately distinguishes model and extracted-helper evidence | Neither tests nor review abstraction establish whole-application correctness |

## Complexity and alternatives

Private working branches are an adopted design with a concrete need: retaining exact unpublished source for provenance without forcing Commit. Treating them as merely another public branch would lose privacy/source-type distinctions. The corrected split between text publication and private replacement batches is also intentional: a failed navigation update cannot undo already published text. The review does **not** recommend reverting those decisions or mutating immutable links. It recommends clear transaction ownership, bounded recovery and measured costs.

Some complexity is potentially avoidable: repeated serialization/decryption within one authorized transaction, duplicated current-status tables, and broad shared module access. These are improvement hypotheses until measured or shown to cause defects. Immutable retry receipts intentionally trade storage for durable reconciliation. Any receipt expiry or history deletion needs explicit policy; silent pruning is not an optimization allowed by this architecture.

Future integrations have sensible high-level safety rules: exact preview and approval, retained resources, separate identities, scoped context, provider uncertainty, bounded untrusted inputs and non-trusted egress denial. They remain **design gates**, not an executable architecture. The absence of precise federation/rights/package/compiler mechanisms should prevent premature implementation claims, without blocking the bounded local editor.

## Independent cross-view conclusions

Every catalogue write has a listed storage/transaction responsibility or an explicit missing-protocol marker. Every implemented read/write leaf cites code; future leaves do not acquire implementation through diagrams. Security-sensitive families carry current authority/source constraints. Data stores resolve to encrypted canonical objects, mutable protected slots, bootstrap/wrappers, process/browser display state, or explicitly future artifacts/outboxes. Provenance effects retain earlier sources and identity distinctions. The invariant, threat and failure matrices link these conclusions across process, ordering, state and data views.

The review found no cycle in the recognized static local crate/import graphs; it did not establish absence of runtime/callback/semantic cycles. It demonstrated a future two-replica structural counterexample and bounded acknowledgement/publication model properties, without claiming code correspondence. Documented limits are carried into findings rather than silently “fixed” in the diagrams.
''')

write('recommendations.md','''# Prioritized recommendations

These are review proposals. Application work remains stopped, accepted decisions remain unchanged, and no publication is authorized by this report.

## Before extending the current implementation

1. Resolve the rollback acceptance wording: decide whether the current local slice explicitly accepts full-database rollback as residual risk or needs a separate freshness witness. Record the exact threat and recovery scope. [FIND-001](findings/HPX-FIND-001.md).
2. Reconcile current-status summaries and requirement delivery rows with exact dated evidence, preserving historical source passages. Keep accepted semantics separate from readiness. [FIND-002](findings/HPX-FIND-002.md), [FIND-018](findings/HPX-FIND-018.md).
3. On an explicit implementation resume, finish the working-source Provenance reader and close the already-required real branch/working lifecycle plus actual older-reader 20–27 preservation. Keep capabilities gated until then. Exercise the separate text Commit and replacement batch under interruption, lost replies, changed source, branch switching and undo. [FIND-004](findings/HPX-FIND-004.md), [FIND-009](findings/HPX-FIND-009.md).
4. Define an authoritative-versus-derived storage matrix and a non-mutating audit contract before building any repair command. Separately select a supported backup/restore and failure envelope. [FIND-003](findings/HPX-FIND-003.md), [FIND-020](findings/HPX-FIND-020.md).

## Measure before simplifying

Measure receipt/DB growth, whole-source serialization/decryption allocations and concurrent Save/history/unlock contention using supported workloads. Optimize only demonstrated work, preferably within one authorized transaction. Preserve original receipts, exact bytes and immutable history; do not introduce public plaintext hashes, global dedup or finer locks merely for stylistic reasons. Document a narrow application facade when another real command transport needs it. [FIND-005](findings/HPX-FIND-005.md), [FIND-006](findings/HPX-FIND-006.md), [FIND-007](findings/HPX-FIND-007.md), [FIND-008](findings/HPX-FIND-008.md).

## Before selecting each future dependent feature

| Feature | Required design decision/evidence | Finding |
| --- | --- | --- |
| Outbound export / provider context | Minimal mode/permission/claim decision interface; scoped rights reporting, historical disclosure and revocation | [010](findings/HPX-FIND-010.md) |
| Academic formats | Compiler packaging interpretation, licence/provenance, exact writer/profile/resources and XML/JSON semantics | [011](findings/HPX-FIND-011.md) |
| Portable workspace / backup | Versioned closure, inclusion/privacy, identity collisions, quotas, authenticated recovery and create-only restore | [012](findings/HPX-FIND-012.md) |
| GitHub / remote side effects | Provider-specific preconditions, encrypted outbox transition table and unknown-outcome reconciliation | [013](findings/HPX-FIND-013.md) |
| Collaboration / federation | Causal authority, deterministic structural conflict acceptance and key/membership history policy | [014](findings/HPX-FIND-014.md) |
| Live agents / MCP | Exact versioned proposal/approval binding, target stale checks, delegation and disclosure | [015](findings/HPX-FIND-015.md) |
| Portable distribution | Supported platform/audience, certificate/signing lifecycle and separately authorized trust/credentials | [016](findings/HPX-FIND-016.md) |
| Quality claims | Owner-selected measurable workloads and accessibility/platform scenarios | [017](findings/HPX-FIND-017.md) |

Do not implement these future features simply because the review identifies their gaps. Follow the roadmap and adopted owner scope. Extend formal/property evidence incrementally around the highest-value contracts and retain exact implementation correspondence limits. [FIND-019](findings/HPX-FIND-019.md).
''')

questions=[
 ('HPX-QUESTION-001','What does “reject rollback/replay before durable editing” require for the accepted local slice?','An explicit bounded residual-risk exception versus a separately trusted freshness witness.','FIND-001','Owner/security acceptance authority','Before real-data freshness acceptance'),
 ('HPX-QUESTION-002','Which state is authoritative, which is derived, and what can repair reconstruct?','Draft/private order cannot be assumed reconstructible from receipt digests; select backup/quarantine and repair semantics.','FIND-003 / 020','Owner + storage design review','Before mutating repair/disaster recovery claim'),
 ('HPX-QUESTION-003','What retention/retry horizon is intended for immutable receipts and private checkpoints?','No arbitrary pruning is currently authorized; any expiry/erasure changes history/idempotency policy.','FIND-005','Owner','Before compaction/retention change'),
 ('HPX-QUESTION-004','What supported workloads, latency and accessibility/platform targets should be accepted?','Measure observations first; do not invent hard budgets or WCAG conformance.','FIND-007 / 017','Owner with representative user scenarios','Before performance/accessibility/portable quality claims'),
 ('HPX-QUESTION-005','What minimal rights/delegation/history-disclosure policy should future adapters share?','Named holders/mandates are review topics without separately located adopted workflows; do not invent policy schema.','FIND-010','Owner/authority and disclosure decision','Before outbound/shared features'),
 ('HPX-QUESTION-006','Does one executable allow a bundled/extracted converter helper, or require an embedded binding?','Choose packaging/licensing trade-off and exact writer profiles; XML/JSON semantics also need selection.','FIND-011','Owner','Before academic compiler implementation'),
 ('HPX-QUESTION-007','What package inclusion, identity collision and recipient/key recovery policy is acceptable?','Private checkpoints/claims may exceed intended disclosure; restore should create a new workspace by default.','FIND-012','Owner','Before accepting portable real data'),
 ('HPX-QUESTION-008','What remote unknown-outcome reconciliation evidence permits retry or user resolution?','Provider-specific expected head and exact bytes differ from a local transaction receipt.','FIND-013','Owner for disclosure/publication; adapter design for mechanism','Before provider write setup'),
 ('HPX-QUESTION-009','Which availability and convergent rejection/conflict semantics govern concurrent structural edits?','Naive acyclic local union is unsafe; no chosen causal/authority protocol exists.','FIND-014','Owner / distributed architecture review','Before federation implementation'),
 ('HPX-QUESTION-010','What exact approval/delegation scope and observable-interaction retention apply to agents?','A stale/changed payload cannot inherit an old approval; live provider connection requires separate authorization.','FIND-015','Owner','Before live agent mutation'),
 ('HPX-QUESTION-011','What release audience/platforms and signing/trust lifecycle are intended?','Local development trust is scoped; Apple-issued route needs separate credentials and approval.','FIND-016','Owner','Before portable release'),
 ('HPX-QUESTION-012','When implementation resumes, is the remaining adopted branch integration still the next step?','No new design choice is needed to preserve existing ADR019 semantics; current review does not resume work.','FIND-004 / 009','Owner resume instruction','After review')]
write('open-questions.md','# Decisions and additional evidence\n\nNo answer is required to complete this analysis: unresolved choices are preserved here. They become blockers only for the named dependent work, so this review does not request credentials, alter trust, connect providers or resume implementation.\n\n'+table(['ID / question','Choice / evidence needed','Findings','Authority','When needed'],[[r[0]+' — '+r[1],r[2],r[3],r[4],r[5]] for r in questions]))

write('README.md','''# HPX architecture process review

The review reconstructs HPX’s documented local architecture and separates accepted gated work from incomplete future mechanisms. It contains **18 parent responsibilities, 114 subprocesses, 51 coordinated diagram sources/renders and 20 evidence-linked findings**. All output is confined to this directory. Application code, authoritative specifications, accepted decisions and the pre-existing working tree are preserved; nothing is committed or pushed.

Start with the [architecture assessment](architecture-assessment.md), [prioritized recommendations](recommendations.md) and [findings register](findings/README.md). The main immediate concerns are rollback acceptance wording, stale current-status summaries, missing index repair semantics, and the required branch/working integration and older-reader gates. Performance concerns are analytical hypotheses, not measured failures or discovered cryptographic exploits.

## Navigate the reconstruction

- [Evidence and authority](evidence-register.md), [initial inventory/completeness assessment](evidence/preliminary-assessment.md), [source document inventory](evidence/document-inventory.csv)
- [Process hierarchy](process-inventory.md) and [detailed contracts](process-catalogue/HPX-PROC-001.md)
- [Diagram index](diagrams/README.md) and [offline interactive diagram browser](diagrams/viewer.html)
- [Requirement paths](traceability/requirements.md), [document dispositions](traceability/documents.md), [invariants](traceability/invariants.md), [failure analysis](traceability/failure-analysis.md), [threat analysis](traceability/threat-analysis.md)
- [Formal/complexity analysis](formal-analysis/README.md), [executed abstract-model results](formal-analysis/model-results.json), [static dependency graph](traceability/dependencies.json)
- [Coverage and missing mechanisms](coverage-report.md), [owner questions](open-questions.md), [validation and preservation evidence](validation-report.md)

## Scope and authority

Baseline: current dirty working tree, 2026-10-26, published 1.0.0 source plus unpublished local increments. [Baseline commit](evidence/baseline-commit.txt) alone does not identify the reviewed bytes; [312 file hashes](evidence/baseline-files.json) and [original status](evidence/baseline-git-status.txt) preserve that context. Current integrated comments/contributor behavior is distinct from gated branch/working wiring. No application test, compilation, proof replay, manual-runtime update or personal browser automation was performed for this review. Historical check counts retain their reported milestone scope.

Owner decisions and explicitly adopted ADRs govern scoped requirements. Inherited accepted passages retain authority inside proposed editorial assemblies; historical implementation prose is not current readiness merely because it appears in a current file. Code supports alignment observations and never silently replaces intended design. Seven evidence classifications distinguish specified, derived, code-only, hypothesized, contradictory, unspecified and future claims.

The complete current Markdown body is indexed; 60 materialized contracts and 31 compound requirement seeds have explicit dispositions. Reserved IDs and future missing mechanisms are exposed. This gives complete inventory coverage, not an invented percentage of all atomic requirements or a claim the entire future system is executable. Fifty leaf entries describe documented local responsibilities, eight gated ones, 55 future/incomplete areas and one explicitly deferred capability. Some local responsibilities are governance/development rather than product features.

## Method and limits

Stage A records evidence and completeness, Stage B establishes responsibility and leaf contracts, Stage C builds coordinated views, Stage D performs cross-view/quality/threat/failure/complexity checks, Stage E records alternatives and next actions. [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) informs stakeholder concerns, viewpoints and consistency; [29148:2018](https://www.iso.org/standard/72089.html) informs verifiability and traceability. Only public standard descriptions were consulted: no standards compliance audit or access to full paid texts is claimed.

[Official C4 guidance](https://c4model.com/diagrams) informs context/container/component levels. [UML 2.5.1](https://www.omg.org/spec/UML/2.5.1) informs activity/sequence/state distinctions. These Mermaid views are purpose-selected approximations, not executable UML. [BPMN 2.0.2](https://www.omg.org/spec/BPMN/2.0.2) was considered; no fully specified multi-party business protocol benefits from another notation here, so none is invented. DFD arrows describe information; workflow arrows describe control; state edges describe permitted lifecycle transitions. Conceptual and physical models stay separate.

Static SVGs are actually parsed/rendered using pinned [Mermaid 11.12.2](https://github.com/mermaid-js/mermaid/releases/tag/mermaid@11.12.2) in isolated headless Chromium. Renderer provenance, integrity and MIT licence review are recorded; no production dependency is added. [Mermaid usage](https://mermaid.js.org/config/usage.html) supplies parser/render conventions. The abstract model is bounded, handwritten and not extracted from HPX; existing Lean/extraction claims are not broadened.

The report intentionally preserves uncertainties: no real-data deployment/security attestation, no new performance measurement, no whole-host confidentiality, no rollback freshness witness, no portable package/compiler/federation/rights implementation and no whole-application proof. Findings challenge wording and scope where evidence supports it without changing adopted designs or initiating future implementation.

## Reproduce this review

Run from the repository root; all generators write only here. Python 3.11+ is required for `tomllib`. Existing Node/Playwright and Chromium are reused. The renderer requires the pinned temporary static bundle identified in its provenance file; if the cache is gone, fetch and integrity-verify that exact package through a reviewed tool setup before rendering. Do not execute unrelated repository scripts for this exercise.

```sh
python3 docproject/architecture-review/validation/build_diagrams.py
python3 docproject/architecture-review/validation/build_findings.py
python3 docproject/architecture-review/formal-analysis/check_model.py
python3 docproject/architecture-review/validation/dependencies.py
node docproject/architecture-review/validation/render_diagrams.cjs
python3 docproject/architecture-review/validation/build_reports.py
python3 docproject/architecture-review/validation/build_viewer.py
python3 docproject/architecture-review/validation/validate_review.py
```

Generators may replace their own generated review artifacts during an explicit refresh. They do not overwrite pre-existing repository material. If the documentation baseline changes, preserve this review as historical evidence and create a new baseline rather than silently passing different source hashes.
''')
print(json.dumps({'invariants':len(invariants),'failure_scenarios':len(failures),'threat_scenarios':len(threats),'open_questions':len(questions),'reports':'written'}))
