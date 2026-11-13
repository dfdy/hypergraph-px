# HPX Semantic Communication Protocol (HPX-SCP)

**Version:** 0.6.1  
**Status:** proposed integration package; this user-directed architectural correction is authorised for preparation, but repository adoption remains separate.  
**Purpose:** Establish a shared, verified YAML prompting language between agents, then exchange minimum-sufficient requests and responses bidirectionally; retain human authority, low context use, provenance and continuity.

## 0. Inter-agent prompting is the primary function

**SCP-WIRE-PURPOSE [baseline]:** HPX-SCP is primarily a bidirectional inter-agent prompting protocol: establish a shared verified YAML language, then exchange task requests, responses, clarifications, errors, handoffs and amendment notices with minimum sufficient context. Verification, records, compaction recovery and amendments support this exchange rather than replace it.

**SCP-WIRE-TRIGGER [negotiation]:** An agent instructed to use HPX-SCP with another agent MUST initiate protocol discovery even if the recipient is not known to support HPX-SCP. It MUST NOT assume shared protocol knowledge or proceed with an ordinary HPX-SCP request before readiness is established.

**SCP-WIRE-CHANNEL [baseline]:** HPX-SCP defines direct YAML message content and protocol-state transitions, not an agent invocation, network service, transport security or tool permission. Agents require an actual permitted communication channel carrying the literal YAML message text; the reference CLI validates and emits text through standard input/output, with local files supported as adapters only.

## 1. Discovery, propagation and negotiation

**SCP-NEG-001 [negotiation]:** The initiator sends a minimal YAML `hello` control message identifying its protocol version and a content fingerprint consumed by the receiver's verifier outside ordinary agent context. The receiver checks its locally installed canonical protocol and replies `ready` only after independent verification and exact protocol compatibility, otherwise `need` with a reason.

**SCP-NEG-002 [negotiation]:** On `need`, the initiating agent MUST offer and transfer a verified protocol bundle containing the complete canonical Markdown, appended semantic YAML and integrity manifest via the permitted transport, outside ordinary model context. The receiver stages and verifies the bundle using independently trusted tooling; a received verifier MUST NOT be executed solely because the sender supplied it.

**SCP-NEG-003 [negotiation]:** The receiver MUST NOT activate a new or divergent version merely because a received bundle passes self-consistency checks; acceptance requires supported compatibility and existing owner/repository trust policy. If verification, installation or compatibility fails, exchange `need` or `error` and refuse protocol-dependent tasks.

**SCP-NEG-004 [negotiation]:** A `ready` acknowledgement establishes a conversation-local, version-specific protocol session only when the recipient has verified the agreed protocol. The initiator must validate that readiness reply and bind it to the original `hello` before sending a task request. A claimed `ready` does not independently authenticate the sender or guarantee model obedience.

**SCP-NEG-005 [negotiation]:** Protocol upgrades during a session require renewed discovery and readiness. Agents MUST NOT silently invent a dialect, negotiate incompatible meanings, downgrade authority, or substitute natural-language prompts after establishment.

**SCP-NEG-006 [negotiation]:** Bootstrap `hello`, `ready` and `need` messages use the small fixed YAML envelope below even before full protocol agreement; these are control messages, not authorisation to run user tasks.

## 1.1 Bidirectional YAML message contracts

**SCP-MSG-001 [exchange]:** After readiness, every HPX-SCP-governed agent-to-agent prompt and response MUST be a single strict UTF-8 YAML mapping with the required envelope fields `scp`, `version`, `kind`, `id`, `sender`, `recipient`, `conversation`, and `body`; `reply_to` and `refs` are optional. The `body` MUST be a mapping, and `refs` a list of stable identifiers. No JSON, custom notation or free-form conversational substitute is an HPX-SCP message.

**SCP-MSG-002 [exchange]:** Every message MUST be checked against the agreed version, registered kind, required body fields, identifiers and existing session state before dispatch or use. Reject malformed YAML, duplicate keys, aliases, anchors, custom tags, unknown kinds, unsupported versions or requests received before readiness.

**SCP-MSG-003 [exchange]:** Requests MUST express action, target and applicable references or constraints sufficiently for safe interpretation; responses MUST reference the originating request and report truthful status, outcome, evidence references and unresolved issues as applicable. Clarifications and errors MUST reference their triggering messages; use no invented proof of work.

**SCP-MSG-004 [exchange]:** Exchange the smallest sufficient YAML body and resolvable record/source references. Do not repeat the protocol, embedded canonical prose, hashes or unchanged task history inside ordinary messages. If references cannot be resolved, ask for clarification or transfer the referenced data through the permitted transport.

**SCP-MSG-005 [exchange]:** The peer may request additional verified protocol scopes without redefining the message grammar. Structured YAML is for inter-agent messages; direct communication with humans remains ordinary natural language unless explicitly requested otherwise.

**SCP-MSG-006 [exchange]:** The sender and recipient MUST both validate outbound and inbound messages using their own verified protocol. A YAML message is a structured claim, not proof of authorisation, execution, identity or delivery; provenance and actual tool evidence remain separate.

**SCP-MSG-007 [exchange]:** Every HPX-SCP-governed agent-to-agent prompt, reply and control message MUST carry its complete YAML envelope and message body inline as the text actually delivered to the other agent. A filename, file path, URI, link, attachment pointer or instruction to read a YAML file MUST NOT substitute for the YAML message. Agents may reference external source materials and transfer protocol installation bundles out of band, but not delegate the prompting content of ordinary messages to linked YAML files. If the permitted channel cannot convey inline message text, report the limitation and do not claim an HPX-SCP exchange occurred.

**SCP-MSG-008 [exchange]:** File-backed local validation is permitted, but transport adapters MUST expose the validated YAML message itself to the receiving agent, never just a file location, delivery receipt or summary. When requesting or receiving a task, the actual YAML body MUST contain the task instruction; a pointer to another YAML prompt is nonconforming.

### 1.2 Message envelope fields

| Field | Meaning |
|---|---|
| `scp` | Constant `HPX-SCP`. |
| `version` | Negotiated semantic protocol version. |
| `kind` | One registered message kind from the table below. |
| `id` | Stable unique message identifier within its conversation. |
| `sender` | Claimed sending agent identity; transport authentication is separate. |
| `recipient` | Intended receiving agent identity. |
| `conversation` | Shared conversation/session identifier. |
| `body` | Kind-specific mapping containing minimum sufficient information. |
| `reply_to` | Optional prior message ID for replies; required for replies to requests or control messages. |
| `refs` | Optional list of accessible stable record/source references. |

### 1.3 Message kinds

| Kind | Required body | Meaning |
|---|---|---|
| `hello` | `fingerprint` | Bootstrap discovery; content fingerprint is checked outside ordinary agent context. |
| `ready` | `accepted_version` | Recipient has verified the offered protocol and is ready for YAML exchange. |
| `need` | `reason` | Recipient lacks a verified compatible protocol or needs external installation. |
| `offer` | `bundle_ref` | Location/identifier for a separately transmitted complete protocol bundle. |
| `request` | `action`, `target` | Prompt assigning a task or requesting an operation. |
| `response` | `status` | Result linked to a request; allowed statuses are `completed`, `partial`, `failed`, `blocked`. |
| `clarification` | `question` | Targeted question about a prior message. |
| `error` | `code`, `explanation` | Explicit rejection or processing failure. |
| `handoff` | `objective`, `next_action` | Minimal durable transfer of work state and source references. |
| `amendment_notice` | `amendment_id`, `version` | Notify peers about a published, verified shared protocol amendment. |

## 2. Human-readable canonicality and minimal context

**SCP-PRIME-001 [baseline]:** The human-readable part of this document, ending immediately before the unique semantic-appendix delimiter, is the sole canonical HPX-SCP policy. The appended semantic projection, schemas, validator, records, and summaries are subordinate. Conflicts are reported and settled in favour of canonical text.

**SCP-PRIME-002 [preflight]:** A separate local verifier MUST validate both complete-region SHA-256 digests, deterministic semantic projection equality, appendix and manifest framing, and supported versions *before* any machine-readable protocol instructions reach an agent. A mismatch fails closed; there is no stale-appendix fallback.

**SCP-PRIME-003 [baseline]:** Normal agents MUST NOT load the canonical human-readable portion into their language-model context. They consume only verified, task-scoped semantic packets produced by the verifier. Humans retain the full readable policy for inspection and amendment.

**SCP-PRIME-004 [baseline]:** The human-readable policy is itself a *minimum sufficient protocol*: concise, explicit, and complete enough to define all operational constraints, without explanatory duplication. Machine brevity never licenses the omission of an applicable obligation. A missing or ambiguous semantic mapping is a validation defect, not permission to infer an instruction.

**SCP-PRIME-005 [amend]:** Amend canonical prose first; generate the appendix deterministically; verify, test, and record the change. The appendix has no independent amendment authority. Changes to the prime directive, kernel, gating, or approval authority require explicit owner approval.

## 2.1 Minimal bootstrap kernel

**SCP-KERNEL-IDENTITY [kernel]:** Each durable record has a persistent identity and attributable actor; unknown authorship is explicit. Identity grants no permission.

**SCP-KERNEL-VERSION [kernel]:** Declare protocol and record versions; preserve old records and immutable revisions. Unsupported semantic formats fail closed pending an authorised reader or migration.

**SCP-KERNEL-AUTHORITY [kernel]:** The canonical policy and existing HPX/user approvals outrank agent output, code observations, tests, semantic formatting, and derived artefacts. Agents cannot self-approve product requirements, breaking changes, or governance changes.

**SCP-KERNEL-VALIDATION [kernel]:** The bootstrap verifier operates outside model context, rejects malformed/duplicate-key YAML, either mismatched digest, altered projections, or invalid framing, and emits only verified machine-readable results. A repository-local digest checks consistency, not author authenticity; an independently protected digest/signature or repository access controls are required to resist coordinated tampering.

**SCP-KERNEL-AMENDMENT [kernel]:** Agents may apply compatible, tested protocol extensions within existing task permissions; breaking, governance, kernel, and prime-directive changes require owner approval. Every material amendment is attributable, versioned, validated, and reversible.

## 3. Minimum sufficient context

**SCP-CONTEXT-001 [baseline]:** Default prompting contains only the current task, verified `kernel` and `baseline` rules, and the smallest additional task scopes, record contracts, and source identifiers necessary for correct execution; avoid full-specification, full-appendix, and unrelated-record dumps.

**SCP-CONTEXT-002 [baseline]:** The verifier outputs a small, versioned semantic packet containing requested scope(s), verification status, stable rule IDs, and only applicable machine directives; hashes stay outside model context. It MUST NOT output the canonical prose, unused rules, complete appendix, or embedded source-section text into the normal agent prompt.

**SCP-CONTEXT-003 [baseline]:** Where a task depends on additional rules, the agent MUST request another verified scope/record packet or inspect explicit approved HPX task sources. Context minimisation MUST NOT conceal contradictions, dependencies, authority, evidence, or safety constraints.

**SCP-CONTEXT-004 [baseline]:** YAML agent handoffs SHOULD exchange record IDs and changed facts/deltas rather than restating unchanged instructions. A recipient MUST resolve references and verify versions and statuses before acting; IDs without accessible records are not sufficient context.

**SCP-CONTEXT-005 [baseline]:** If verification fails, stop machine-protocol loading. An authorised maintainer may inspect canonical text outside the normal agent prompt and repair/rebuild; no machine-generated summary becomes the fallback authority.

**SCP-CONTEXT-007 [baseline]:** Compaction or recovery does not guarantee previous instructions survived. Independently reverify and reload the current minimum sufficient packet at every recognised recovery boundary; never rely on remembered verification flags.

**SCP-CONTEXT-006 [verify]:** Evaluate efficiency by measured token use, repeated context, correction loops, interpretation disagreements, missed constraints, and test regressions against the prior workflow; prioritise correctness over smaller packets.

## 4. Agent task rules

**SCP-TASK-PLAN [plan]:** Identify relevant approved specifications, unresolved conflicts, and expected outcome before proposing changes; distinguish observed implementation, conjecture, and obligation.

**SCP-TASK-IMPLEMENT [implement]:** Implement only within assigned authority; record material implementation evidence with exact paths/revisions and do not claim unexecuted tests.

**SCP-TASK-VERIFY [verify]:** Report verification as `pass`, `fail`, `partial`, or `not_run`, including commands, targets, results, and limitations; checks do not confer approval.

**SCP-TASK-HANDOFF [handoff]:** Transfer objective, confirmed facts, record references, unresolved questions, and next actions; verify received references before relying on them.

**SCP-TASK-CONFLICT [baseline]:** When records conflict or required context is missing, retain the higher-authority source, surface an `issue`, and seek appropriate review rather than guessing or silently replacing an approved requirement.

**SCP-TASK-BOUNDARY [baseline]:** HPX-SCP is a bidirectional agent-prompting convention, not HPX runtime architecture, not a tool permission grant, and not a replacement for HPX specifications or repository restrictions.

## 5. Durable records

**SCP-RECORD-001 [records]:** Persistent records are UTF-8 JSON with no duplicate keys, one object per `records/<id>.json`, validated against local Draft 2020-12 JSON Schema. Sketches and ordinary discussion do not automatically become records.

**SCP-RECORD-002 [records]:** Require stable identity, `protocol_version`, monotone `record_version`, truthful status and authority basis, actor, source references, typed relations, date, and type-specific content. Cite exact source paths/commits/approvals; do not invent evidence.

**SCP-RECORD-003 [records]:** Accepted decisions or requirements may only be materially superseded through a new, traceable authorised record; an agent cannot promote its own proposal or passing test into approval. Relationships do not transfer authority.

**SCP-RECORD-004 [records]:** Namespaced `extensions` must be registered with local safe JSON Schemas; reject unknown extensions and external schema loading. Preserve readability of v0.1.0–v0.3.0 records; do not rewrite their declared protocol versions.

### 5.1 Required record envelope

| Field | Meaning |
|---|---|
| `protocol_version` | Declared interpretation version, including supported legacy versions |
| `record_version` | Monotonically increasing integer, starting at 1 |
| `id` | Stable `HPX-<KIND>-YYYYMMDD-<slug>` identifier |
| `kind` | Defined semantic record type |
| `subject` | Affected concept, requirement or component |
| `summary` | One concise declarative sentence |
| `status` | Lifecycle state appropriate to the kind |
| `authority.basis` | `agent_proposal`, `user_directive`, `approved_specification`, `observed_implementation`, `external_standard`, or `agent_report` |
| `source_refs` | Exact supporting reference and role (`normative`, `observed`, `context`, `approval`, `external`) |
| `relations` | Typed links to existing record IDs |
| `actor` | Actual person or agent identifier/role |
| `created_on` | ISO date `YYYY-MM-DD` |
| `content` | Type-specific mandatory payload |
| `extensions` | Optional registered `x.<namespace>.<name>` entries |

### 5.2 Record kinds

| Kind | Statuses | Required content | Meaning |
|---|---|---|---|
| `requirement` | `proposed`, `accepted`, `rejected`, `superseded` | `statement`, `acceptance_criteria` | Normative obligation; acceptance requires approval evidence |
| `proposal` | `proposed`, `accepted`, `rejected`, `superseded` | `change`, `rationale`, `acceptance_criteria`, `open_questions` | Suggested modification, not self-authorising |
| `decision` | `accepted`, `superseded` | `resolution`, `approved_by`, `approval_ref` | Verifiable owner-approved decision |
| `implementation_evidence` | `reported`, `superseded` | `observations`, `paths` | Observed code/behaviour, not normative authority |
| `verification_result` | `reported`, `superseded` | `target`, `outcome`, `method`, `evidence` | Truthful check result, including `not_run` |
| `issue` | `open`, `blocked`, `resolved`, `superseded` | `problem`, `impact`, `blocking`, `next_action` | Uncertainty, contradiction or blocker |
| `handoff` | `open`, `acknowledged`, `completed` | `from_agent`, `to_agent`, `objective`, `confirmed`, `next_actions`, `open_questions` | Persisted transfer of known state and unresolved work |
| `protocol_change` | `proposed`, `applied`, `rejected`, `reverted` | `change_class`, `change_summary`, `rationale`, `files_changed`, `compatibility`, `rollback`, `validation` | Audited evolution; applied changes require correct authorisation and passing checks |

### 5.3 Relationships

- `derived_from`: based on another record; no inherited approval.
- `proposes_change_to`: recommends modifying another record.
- `implements`: observed implementation associated with a requirement or decision.
- `verifies`: verification evidence for another record.
- `contradicts`: points to incompatible assertions requiring investigation.
- `supersedes`: reviewed replacement; cycles forbidden.
- `blocks`: records a specific workflow obstruction, not universal veto power.
- `affects`: potentially impacted dependency.
- `resolves`: reviewed resolution of an issue.
- `hands_off`: persisted handoff of another record.

## 6. Context continuity and recovery

**SCP-RECOVERY-001 [baseline]:** Persistent repository guidance MUST point to verifier and recovery commands, not copy the full protocol. At session start, after known compaction, at session resumption, or when state is uncertain, load fresh verified semantic instructions before protocol-governed work.

**SCP-RECOVERY-002 [recovery]:** Persist a small per-session checkpoint outside model context before an expected interruption: objective, constraints, sourced decisions, evidence, blockers, changed files, record IDs and next action. Checkpoints are untrusted working claims, not authority; never include secrets, complete protocol copies or hashes.

**SCP-RECOVERY-003 [recovery]:** Recovery MUST verify both integrity digests and semantic correspondence outside model context, load only applicable scopes, then reconcile checkpoint claims against current workspace and records before mutations. Invalid or stale checkpoints never override the current protocol.

**SCP-RECOVERY-004 [recovery]:** Optional supported pre/post-compaction integrations MAY trigger checkpoint or recovery, but MUST NOT assume hooks exist or inject unverified instructions. Session-start checks and explicit commands are the fallback; the protocol cannot itself intercept every compaction or write.

**SCP-RECOVERY-005 [baseline]:** Unverified or uncertain protocol state forbids consequential protocol-dependent repository mutations until revalidation and reconciliation. External write guards or CI are necessary for stronger enforcement; prompt instructions do not grant permissions.

## 7. Agent-maintained protocol amendments

**SCP-CHANGE-001 [amend]:** Before extending the protocol, demonstrate a concrete recurring communication gap and prefer reusing existing vocabulary, concise prose, or an optional extension. Change the smallest part necessary.

**SCP-CHANGE-002 [amend]:** Amend canonical natural-language rules first; then update subordinate schema, projection generator, examples, registry, tests, and documentation as applicable. Regenerate both representations together; never edit the semantic appendix independently.

**SCP-CHANGE-003 [amend]:** Additive backward-compatible vocabulary and optional fields may be applied by an agent under standing delegation after tests; breaking semantics, approval/authority, security, kernel, verification gates, and prime-directive changes require explicit owner approval. A change's actual effects, not its label, determine its class.

**SCP-CHANGE-004 [amend]:** Maintain old-record validity and stable meanings; bump minor version for additive changes, patch for non-semantic corrections, major for reviewed breaking migrations. Never defeat a check by weakening tests or silently rewriting historical records.

**SCP-CHANGE-005 [amend]:** Record each material amendment with `protocol_change`, truthful validation results, authorisation basis, source refs, affected artefacts, compatibility statement, and rollback procedure; commit atomically under repository review controls.

**SCP-CHANGE-006 [amend]:** Every applied compatible extension MUST be integrated into the shared canonical natural-language protocol, assigned a persistent `protocol_change` identity, regenerated, verified and indexed in `amendments/registry.json` before other agents use it. Agent-local dialects have no protocol authority.

**SCP-CHANGE-007 [amend]:** Agents MUST discover current amendments through the shared repository registry and verified packets rather than remembered versions. Validate registry IDs, statuses, linked records, current protocol version and registered extension schemas outside model context; refuse activation of unindexed or divergent changes. Discovery emits identifiers and versions, never digests.

**SCP-CHANGE-008 [amend]:** Concurrent amendments MUST be serialised by repository merge/review controls: verify both hashes, semantic correspondence and the current registry at commit, resolve competing amendments, rerun tests and never silently overwrite an agent's extension.

**SCP-CHANGE-009 [amend]:** Applied amendments become available to other agents only after shared index publication and verification. Existing agent sessions must reverify and reload before consuming amended vocabulary; checkpoint or notification is insufficient.

### 7.1 Change classes

| Class | Examples | Activation |
|---|---|---|
| **Compatible** | Optional fields, new kinds/relations retaining prior meanings, stricter tests that do not reject valid history | Delegated agent after passing checks |
| **Breaking** | Renamed/removed fields, changed semantics, invalidated earlier valid records | Explicit owner approval and migration |
| **Governance** | Changed authority, validation, kernel, security or amendment permissions | Explicit owner approval |

## 8. Verification, projection and context boundaries

**SCP-FRAME-001 [preflight]:** The file is UTF-8 without BOM and uses LF. One `<!-- HPX-SCP:SEMANTIC-APPENDIX-BEGIN v4 -->` separates canonical prose from a fenced semantic YAML block; one subsequent `<!-- HPX-SCP:INTEGRITY-MANIFEST-BEGIN v4 -->` separates that YAML from a final fenced YAML integrity manifest. No trailing material is permitted.

**SCP-FRAME-002 [preflight]:** Calculate exactly two stored SHA-256 digests: one over the complete canonical natural-language bytes and one over the complete semantic YAML bytes, without normalisation. Store both exclusively in the external manifest as `natural_sha256` and `machine_sha256`, outside both hashed regions. An optional independent protected trust anchor may verify canonical authorisation.

**SCP-FRAME-003 [preflight]:** Verify both hashes, then independently regenerate the expected semantic projection from the canonical text and require byte-exact equality with appended semantic YAML. Matching hashes alone do not demonstrate semantic correspondence; any mismatch refuses all protocol loading.

**SCP-FRAME-004 [preflight]:** The YAML semantic representation uses indented, scope-keyed rule mappings, typed record definitions and relationship vocabulary, but no per-section or per-rule hashes, redundant byte offsets, or complete duplicates of prose sections. Every normative requirement must be a tagged rule or typed table; reject unrepresented prose.

**SCP-BOOT-001 [preflight]:** `scripts/bootstrap_semantic_protocol.py` is the fail-closed independent preflight. It loads and checks canonical bytes without sending them into agent context. `scripts/protocol_context.py` may output a verified minimal semantic packet only after the preflight succeeds.

**SCP-BOOT-002 [preflight]:** Default agent packet selection is `kernel` plus `baseline` and explicitly selected work scopes; inter-agent sessions additionally load `negotiation` during establishment and `exchange` for normal messages. A packet includes version, verification status, requested scopes, and their applicable directives; optional record kinds or relationship definitions are included only when asked for. Scope selection is a relevance filter, not a permissions or authority filter.

**SCP-BOOT-003 [kernel]:** When scope coverage is uncertain, the agent must expand the verified packet rather than assume absent directives do not apply. Protocol-specific amendments additionally load `amend`; durable record writing additionally loads `records` and the required kind definitions.

**SCP-BOOT-004 [preflight]:** On a failed preflight, no semantic packets, schema-dependent agent workflows, or semantic record processing may proceed. Canonical prose may be repaired through an authorised maintenance workflow, outside ordinary agent context, then regenerated and reverified.

**SCP-BOOT-006 [recovery]:** `scripts/protocol_recovery.py` provides explicit checkpoint and recovery commands, issuing a fresh machine-only packet and non-authoritative checkpoint requiring workspace reconciliation; it does not claim automatic Codex compaction detection.

**SCP-BOOT-007 [amend]:** `scripts/protocol_amendments.py` validates shared amendment index against current verified protocol version and indexed applied `protocol_change` records. Refuse duplicate, missing, divergent, or unindexed applied changes.

**SCP-BOOT-008 [preflight]:** The canonical semantic appendix and ordinary agent packets use a restricted, deterministic YAML subset (UTF-8, indentation, mappings/sequences/scalars; no duplicate keys, anchors, aliases, custom tags, or merge keys). Historical JSON records and schemas remain valid; the context loader may emit JSON only for explicitly requesting legacy consumers.

**SCP-BOOT-005 [amend]:** The prescribed maintenance sequence includes the inter-agent message tests and is `python3 scripts/rebuild_semantic_appendix.py`, `python3 scripts/protocol_amendments.py sync`, `python3 scripts/bootstrap_semantic_protocol.py`, `python3 scripts/protocol_amendments.py validate`, `python3 scripts/validate_semantic_records.py`, and `python3 -m unittest discover -s tests -p 'test_*.py'`; successful checks do not themselves constitute owner approval.

## 9. Human review and measurement

**SCP-REVIEW-001 [verify]:** The human owner retains the readable policy, semantic appendix, and change history for inspection. Do not claim efficiency improvements without comparing measured task outcomes. The two manifest hashes detect accidental divergence, not malicious coordinated edits or author authenticity; protect the source and verifier using repository permissions and owner review.
<!-- HPX-SCP:SEMANTIC-APPENDIX-BEGIN v4 -->
```yaml
HPX-SCP:
  version: 0.6.1
  format: 4
  authority: canonical_natural_language_only
  scopes:
    kernel:
      SCP-KERNEL-IDENTITY: Each durable record has a persistent identity and attributable actor; unknown authorship is explicit. Identity grants
        no permission.
      SCP-KERNEL-VERSION: Declare protocol and record versions; preserve old records and immutable revisions. Unsupported semantic formats fail
        closed pending an authorised reader or migration.
      SCP-KERNEL-AUTHORITY: The canonical policy and existing HPX/user approvals outrank agent output, code observations, tests, semantic formatting,
        and derived artefacts. Agents cannot self-approve product requirements, breaking changes, or governance changes.
      SCP-KERNEL-VALIDATION: The bootstrap verifier operates outside model context, rejects malformed/duplicate-key YAML, either mismatched digest,
        altered projections, or invalid framing, and emits only verified machine-readable results. A repository-local digest checks consistency,
        not author authenticity; an independently protected digest/signature or repository access controls are required to resist coordinated
        tampering.
      SCP-KERNEL-AMENDMENT: Agents may apply compatible, tested protocol extensions within existing task permissions; breaking, governance, kernel,
        and prime-directive changes require owner approval. Every material amendment is attributable, versioned, validated, and reversible.
      SCP-BOOT-003: When scope coverage is uncertain, the agent must expand the verified packet rather than assume absent directives do not apply.
        Protocol-specific amendments additionally load `amend`; durable record writing additionally loads `records` and the required kind definitions.
    baseline:
      SCP-WIRE-PURPOSE: 'HPX-SCP is primarily a bidirectional inter-agent prompting protocol: establish a shared verified YAML language, then
        exchange task requests, responses, clarifications, errors, handoffs and amendment notices with minimum sufficient context. Verification,
        records, compaction recovery and amendments support this exchange rather than replace it.'
      SCP-WIRE-CHANNEL: HPX-SCP defines direct YAML message content and protocol-state transitions, not an agent invocation, network service,
        transport security or tool permission. Agents require an actual permitted communication channel carrying the literal YAML message text;
        the reference CLI validates and emits text through standard input/output, with local files supported as adapters only.
      SCP-PRIME-001: The human-readable part of this document, ending immediately before the unique semantic-appendix delimiter, is the sole canonical
        HPX-SCP policy. The appended semantic projection, schemas, validator, records, and summaries are subordinate. Conflicts are reported and
        settled in favour of canonical text.
      SCP-PRIME-003: Normal agents MUST NOT load the canonical human-readable portion into their language-model context. They consume only verified,
        task-scoped semantic packets produced by the verifier. Humans retain the full readable policy for inspection and amendment.
      SCP-PRIME-004: 'The human-readable policy is itself a *minimum sufficient protocol*: concise, explicit, and complete enough to define all
        operational constraints, without explanatory duplication. Machine brevity never licenses the omission of an applicable obligation. A missing
        or ambiguous semantic mapping is a validation defect, not permission to infer an instruction.'
      SCP-CONTEXT-001: Default prompting contains only the current task, verified `kernel` and `baseline` rules, and the smallest additional task
        scopes, record contracts, and source identifiers necessary for correct execution; avoid full-specification, full-appendix, and unrelated-record
        dumps.
      SCP-CONTEXT-002: The verifier outputs a small, versioned semantic packet containing requested scope(s), verification status, stable rule
        IDs, and only applicable machine directives; hashes stay outside model context. It MUST NOT output the canonical prose, unused rules,
        complete appendix, or embedded source-section text into the normal agent prompt.
      SCP-CONTEXT-003: Where a task depends on additional rules, the agent MUST request another verified scope/record packet or inspect explicit
        approved HPX task sources. Context minimisation MUST NOT conceal contradictions, dependencies, authority, evidence, or safety constraints.
      SCP-CONTEXT-004: YAML agent handoffs SHOULD exchange record IDs and changed facts/deltas rather than restating unchanged instructions. A
        recipient MUST resolve references and verify versions and statuses before acting; IDs without accessible records are not sufficient context.
      SCP-CONTEXT-005: If verification fails, stop machine-protocol loading. An authorised maintainer may inspect canonical text outside the normal
        agent prompt and repair/rebuild; no machine-generated summary becomes the fallback authority.
      SCP-CONTEXT-007: Compaction or recovery does not guarantee previous instructions survived. Independently reverify and reload the current
        minimum sufficient packet at every recognised recovery boundary; never rely on remembered verification flags.
      SCP-TASK-CONFLICT: When records conflict or required context is missing, retain the higher-authority source, surface an `issue`, and seek
        appropriate review rather than guessing or silently replacing an approved requirement.
      SCP-TASK-BOUNDARY: HPX-SCP is a bidirectional agent-prompting convention, not HPX runtime architecture, not a tool permission grant, and
        not a replacement for HPX specifications or repository restrictions.
      SCP-RECOVERY-001: Persistent repository guidance MUST point to verifier and recovery commands, not copy the full protocol. At session start,
        after known compaction, at session resumption, or when state is uncertain, load fresh verified semantic instructions before protocol-governed
        work.
      SCP-RECOVERY-005: Unverified or uncertain protocol state forbids consequential protocol-dependent repository mutations until revalidation
        and reconciliation. External write guards or CI are necessary for stronger enforcement; prompt instructions do not grant permissions.
    negotiation:
      SCP-WIRE-TRIGGER: An agent instructed to use HPX-SCP with another agent MUST initiate protocol discovery even if the recipient is not known
        to support HPX-SCP. It MUST NOT assume shared protocol knowledge or proceed with an ordinary HPX-SCP request before readiness is established.
      SCP-NEG-001: The initiator sends a minimal YAML `hello` control message identifying its protocol version and a content fingerprint consumed
        by the receiver's verifier outside ordinary agent context. The receiver checks its locally installed canonical protocol and replies `ready`
        only after independent verification and exact protocol compatibility, otherwise `need` with a reason.
      SCP-NEG-002: On `need`, the initiating agent MUST offer and transfer a verified protocol bundle containing the complete canonical Markdown,
        appended semantic YAML and integrity manifest via the permitted transport, outside ordinary model context. The receiver stages and verifies
        the bundle using independently trusted tooling; a received verifier MUST NOT be executed solely because the sender supplied it.
      SCP-NEG-003: The receiver MUST NOT activate a new or divergent version merely because a received bundle passes self-consistency checks;
        acceptance requires supported compatibility and existing owner/repository trust policy. If verification, installation or compatibility
        fails, exchange `need` or `error` and refuse protocol-dependent tasks.
      SCP-NEG-004: A `ready` acknowledgement establishes a conversation-local, version-specific protocol session only when the recipient has verified
        the agreed protocol. The initiator must validate that readiness reply and bind it to the original `hello` before sending a task request.
        A claimed `ready` does not independently authenticate the sender or guarantee model obedience.
      SCP-NEG-005: Protocol upgrades during a session require renewed discovery and readiness. Agents MUST NOT silently invent a dialect, negotiate
        incompatible meanings, downgrade authority, or substitute natural-language prompts after establishment.
      SCP-NEG-006: Bootstrap `hello`, `ready` and `need` messages use the small fixed YAML envelope below even before full protocol agreement;
        these are control messages, not authorisation to run user tasks.
    exchange:
      SCP-MSG-001: After readiness, every HPX-SCP-governed agent-to-agent prompt and response MUST be a single strict UTF-8 YAML mapping with
        the required envelope fields `scp`, `version`, `kind`, `id`, `sender`, `recipient`, `conversation`, and `body`; `reply_to` and `refs`
        are optional. The `body` MUST be a mapping, and `refs` a list of stable identifiers. No JSON, custom notation or free-form conversational
        substitute is an HPX-SCP message.
      SCP-MSG-002: Every message MUST be checked against the agreed version, registered kind, required body fields, identifiers and existing session
        state before dispatch or use. Reject malformed YAML, duplicate keys, aliases, anchors, custom tags, unknown kinds, unsupported versions
        or requests received before readiness.
      SCP-MSG-003: Requests MUST express action, target and applicable references or constraints sufficiently for safe interpretation; responses
        MUST reference the originating request and report truthful status, outcome, evidence references and unresolved issues as applicable. Clarifications
        and errors MUST reference their triggering messages; use no invented proof of work.
      SCP-MSG-004: Exchange the smallest sufficient YAML body and resolvable record/source references. Do not repeat the protocol, embedded canonical
        prose, hashes or unchanged task history inside ordinary messages. If references cannot be resolved, ask for clarification or transfer
        the referenced data through the permitted transport.
      SCP-MSG-005: The peer may request additional verified protocol scopes without redefining the message grammar. Structured YAML is for inter-agent
        messages; direct communication with humans remains ordinary natural language unless explicitly requested otherwise.
      SCP-MSG-006: The sender and recipient MUST both validate outbound and inbound messages using their own verified protocol. A YAML message
        is a structured claim, not proof of authorisation, execution, identity or delivery; provenance and actual tool evidence remain separate.
      SCP-MSG-007: Every HPX-SCP-governed agent-to-agent prompt, reply and control message MUST carry its complete YAML envelope and message body
        inline as the text actually delivered to the other agent. A filename, file path, URI, link, attachment pointer or instruction to read
        a YAML file MUST NOT substitute for the YAML message. Agents may reference external source materials and transfer protocol installation
        bundles out of band, but not delegate the prompting content of ordinary messages to linked YAML files. If the permitted channel cannot
        convey inline message text, report the limitation and do not claim an HPX-SCP exchange occurred.
      SCP-MSG-008: File-backed local validation is permitted, but transport adapters MUST expose the validated YAML message itself to the receiving
        agent, never just a file location, delivery receipt or summary. When requesting or receiving a task, the actual YAML body MUST contain
        the task instruction; a pointer to another YAML prompt is nonconforming.
    records:
      SCP-RECORD-001: Persistent records are UTF-8 JSON with no duplicate keys, one object per `records/<id>.json`, validated against local Draft
        2020-12 JSON Schema. Sketches and ordinary discussion do not automatically become records.
      SCP-RECORD-002: Require stable identity, `protocol_version`, monotone `record_version`, truthful status and authority basis, actor, source
        references, typed relations, date, and type-specific content. Cite exact source paths/commits/approvals; do not invent evidence.
      SCP-RECORD-003: Accepted decisions or requirements may only be materially superseded through a new, traceable authorised record; an agent
        cannot promote its own proposal or passing test into approval. Relationships do not transfer authority.
      SCP-RECORD-004: Namespaced `extensions` must be registered with local safe JSON Schemas; reject unknown extensions and external schema loading.
        Preserve readability of v0.1.0–v0.3.0 records; do not rewrite their declared protocol versions.
    plan:
      SCP-TASK-PLAN: Identify relevant approved specifications, unresolved conflicts, and expected outcome before proposing changes; distinguish
        observed implementation, conjecture, and obligation.
    implement:
      SCP-TASK-IMPLEMENT: Implement only within assigned authority; record material implementation evidence with exact paths/revisions and do
        not claim unexecuted tests.
    verify:
      SCP-CONTEXT-006: Evaluate efficiency by measured token use, repeated context, correction loops, interpretation disagreements, missed constraints,
        and test regressions against the prior workflow; prioritise correctness over smaller packets.
      SCP-TASK-VERIFY: Report verification as `pass`, `fail`, `partial`, or `not_run`, including commands, targets, results, and limitations;
        checks do not confer approval.
      SCP-REVIEW-001: The human owner retains the readable policy, semantic appendix, and change history for inspection. Do not claim efficiency
        improvements without comparing measured task outcomes. The two manifest hashes detect accidental divergence, not malicious coordinated
        edits or author authenticity; protect the source and verifier using repository permissions and owner review.
    handoff:
      SCP-TASK-HANDOFF: Transfer objective, confirmed facts, record references, unresolved questions, and next actions; verify received references
        before relying on them.
    amend:
      SCP-PRIME-005: Amend canonical prose first; generate the appendix deterministically; verify, test, and record the change. The appendix has
        no independent amendment authority. Changes to the prime directive, kernel, gating, or approval authority require explicit owner approval.
      SCP-CHANGE-001: Before extending the protocol, demonstrate a concrete recurring communication gap and prefer reusing existing vocabulary,
        concise prose, or an optional extension. Change the smallest part necessary.
      SCP-CHANGE-002: Amend canonical natural-language rules first; then update subordinate schema, projection generator, examples, registry,
        tests, and documentation as applicable. Regenerate both representations together; never edit the semantic appendix independently.
      SCP-CHANGE-003: Additive backward-compatible vocabulary and optional fields may be applied by an agent under standing delegation after tests;
        breaking semantics, approval/authority, security, kernel, verification gates, and prime-directive changes require explicit owner approval.
        A change's actual effects, not its label, determine its class.
      SCP-CHANGE-004: Maintain old-record validity and stable meanings; bump minor version for additive changes, patch for non-semantic corrections,
        major for reviewed breaking migrations. Never defeat a check by weakening tests or silently rewriting historical records.
      SCP-CHANGE-005: Record each material amendment with `protocol_change`, truthful validation results, authorisation basis, source refs, affected
        artefacts, compatibility statement, and rollback procedure; commit atomically under repository review controls.
      SCP-CHANGE-006: Every applied compatible extension MUST be integrated into the shared canonical natural-language protocol, assigned a persistent
        `protocol_change` identity, regenerated, verified and indexed in `amendments/registry.json` before other agents use it. Agent-local dialects
        have no protocol authority.
      SCP-CHANGE-007: Agents MUST discover current amendments through the shared repository registry and verified packets rather than remembered
        versions. Validate registry IDs, statuses, linked records, current protocol version and registered extension schemas outside model context;
        refuse activation of unindexed or divergent changes. Discovery emits identifiers and versions, never digests.
      SCP-CHANGE-008: 'Concurrent amendments MUST be serialised by repository merge/review controls: verify both hashes, semantic correspondence
        and the current registry at commit, resolve competing amendments, rerun tests and never silently overwrite an agent''s extension.'
      SCP-CHANGE-009: Applied amendments become available to other agents only after shared index publication and verification. Existing agent
        sessions must reverify and reload before consuming amended vocabulary; checkpoint or notification is insufficient.
      SCP-BOOT-007: '`scripts/protocol_amendments.py` validates shared amendment index against current verified protocol version and indexed applied
        `protocol_change` records. Refuse duplicate, missing, divergent, or unindexed applied changes.'
      SCP-BOOT-005: The prescribed maintenance sequence includes the inter-agent message tests and is `python3 scripts/rebuild_semantic_appendix.py`,
        `python3 scripts/protocol_amendments.py sync`, `python3 scripts/bootstrap_semantic_protocol.py`, `python3 scripts/protocol_amendments.py
        validate`, `python3 scripts/validate_semantic_records.py`, and `python3 -m unittest discover -s tests -p 'test_*.py'`; successful checks
        do not themselves constitute owner approval.
    recovery:
      SCP-RECOVERY-002: 'Persist a small per-session checkpoint outside model context before an expected interruption: objective, constraints,
        sourced decisions, evidence, blockers, changed files, record IDs and next action. Checkpoints are untrusted working claims, not authority;
        never include secrets, complete protocol copies or hashes.'
      SCP-RECOVERY-003: Recovery MUST verify both integrity digests and semantic correspondence outside model context, load only applicable scopes,
        then reconcile checkpoint claims against current workspace and records before mutations. Invalid or stale checkpoints never override the
        current protocol.
      SCP-RECOVERY-004: Optional supported pre/post-compaction integrations MAY trigger checkpoint or recovery, but MUST NOT assume hooks exist
        or inject unverified instructions. Session-start checks and explicit commands are the fallback; the protocol cannot itself intercept every
        compaction or write.
      SCP-BOOT-006: '`scripts/protocol_recovery.py` provides explicit checkpoint and recovery commands, issuing a fresh machine-only packet and
        non-authoritative checkpoint requiring workspace reconciliation; it does not claim automatic Codex compaction detection.'
    preflight:
      SCP-PRIME-002: A separate local verifier MUST validate both complete-region SHA-256 digests, deterministic semantic projection equality,
        appendix and manifest framing, and supported versions *before* any machine-readable protocol instructions reach an agent. A mismatch fails
        closed; there is no stale-appendix fallback.
      SCP-FRAME-001: The file is UTF-8 without BOM and uses LF. One `<!-- HPX-SCP:SEMANTIC-APPENDIX-BEGIN v4 -->` separates canonical prose from
        a fenced semantic YAML block; one subsequent `<!-- HPX-SCP:INTEGRITY-MANIFEST-BEGIN v4 -->` separates that YAML from a final fenced YAML
        integrity manifest. No trailing material is permitted.
      SCP-FRAME-002: 'Calculate exactly two stored SHA-256 digests: one over the complete canonical natural-language bytes and one over the complete
        semantic YAML bytes, without normalisation. Store both exclusively in the external manifest as `natural_sha256` and `machine_sha256`,
        outside both hashed regions. An optional independent protected trust anchor may verify canonical authorisation.'
      SCP-FRAME-003: Verify both hashes, then independently regenerate the expected semantic projection from the canonical text and require byte-exact
        equality with appended semantic YAML. Matching hashes alone do not demonstrate semantic correspondence; any mismatch refuses all protocol
        loading.
      SCP-FRAME-004: The YAML semantic representation uses indented, scope-keyed rule mappings, typed record definitions and relationship vocabulary,
        but no per-section or per-rule hashes, redundant byte offsets, or complete duplicates of prose sections. Every normative requirement must
        be a tagged rule or typed table; reject unrepresented prose.
      SCP-BOOT-001: '`scripts/bootstrap_semantic_protocol.py` is the fail-closed independent preflight. It loads and checks canonical bytes without
        sending them into agent context. `scripts/protocol_context.py` may output a verified minimal semantic packet only after the preflight
        succeeds.'
      SCP-BOOT-002: Default agent packet selection is `kernel` plus `baseline` and explicitly selected work scopes; inter-agent sessions additionally
        load `negotiation` during establishment and `exchange` for normal messages. A packet includes version, verification status, requested
        scopes, and their applicable directives; optional record kinds or relationship definitions are included only when asked for. Scope selection
        is a relevance filter, not a permissions or authority filter.
      SCP-BOOT-004: On a failed preflight, no semantic packets, schema-dependent agent workflows, or semantic record processing may proceed. Canonical
        prose may be repaired through an authorised maintenance workflow, outside ordinary agent context, then regenerated and reverified.
      SCP-BOOT-008: The canonical semantic appendix and ordinary agent packets use a restricted, deterministic YAML subset (UTF-8, indentation,
        mappings/sequences/scalars; no duplicate keys, anchors, aliases, custom tags, or merge keys). Historical JSON records and schemas remain
        valid; the context loader may emit JSON only for explicitly requesting legacy consumers.
  message_envelope:
    scp: Constant `HPX-SCP`.
    version: Negotiated semantic protocol version.
    kind: One registered message kind from the table below.
    id: Stable unique message identifier within its conversation.
    sender: Claimed sending agent identity; transport authentication is separate.
    recipient: Intended receiving agent identity.
    conversation: Shared conversation/session identifier.
    body: Kind-specific mapping containing minimum sufficient information.
    reply_to: Optional prior message ID for replies; required for replies to requests or control messages.
    refs: Optional list of accessible stable record/source references.
  message_types:
    hello:
      required:
      - fingerprint
      meaning: Bootstrap discovery; content fingerprint is checked outside ordinary agent context.
    ready:
      required:
      - accepted_version
      meaning: Recipient has verified the offered protocol and is ready for YAML exchange.
    need:
      required:
      - reason
      meaning: Recipient lacks a verified compatible protocol or needs external installation.
    offer:
      required:
      - bundle_ref
      meaning: Location/identifier for a separately transmitted complete protocol bundle.
    request:
      required:
      - action
      - target
      meaning: Prompt assigning a task or requesting an operation.
    response:
      required:
      - status
      meaning: Result linked to a request; allowed statuses are `completed`, `partial`, `failed`, `blocked`.
    clarification:
      required:
      - question
      meaning: Targeted question about a prior message.
    error:
      required:
      - code
      - explanation
      meaning: Explicit rejection or processing failure.
    handoff:
      required:
      - objective
      - next_action
      meaning: Minimal durable transfer of work state and source references.
    amendment_notice:
      required:
      - amendment_id
      - version
      meaning: Notify peers about a published, verified shared protocol amendment.
  record_envelope:
    protocol_version: Declared interpretation version, including supported legacy versions
    record_version: Monotonically increasing integer, starting at 1
    id: Stable `HPX-<KIND>-YYYYMMDD-<slug>` identifier
    kind: Defined semantic record type
    subject: Affected concept, requirement or component
    summary: One concise declarative sentence
    status: Lifecycle state appropriate to the kind
    authority.basis: '`agent_proposal`, `user_directive`, `approved_specification`, `observed_implementation`, `external_standard`, or `agent_report`'
    source_refs: Exact supporting reference and role (`normative`, `observed`, `context`, `approval`, `external`)
    relations: Typed links to existing record IDs
    actor: Actual person or agent identifier/role
    created_on: ISO date `YYYY-MM-DD`
    content: Type-specific mandatory payload
    extensions: Optional registered `x.<namespace>.<name>` entries
  record_types:
    requirement:
      statuses:
      - proposed
      - accepted
      - rejected
      - superseded
      required:
      - statement
      - acceptance_criteria
      meaning: Normative obligation; acceptance requires approval evidence
    proposal:
      statuses:
      - proposed
      - accepted
      - rejected
      - superseded
      required:
      - change
      - rationale
      - acceptance_criteria
      - open_questions
      meaning: Suggested modification, not self-authorising
    decision:
      statuses:
      - accepted
      - superseded
      required:
      - resolution
      - approved_by
      - approval_ref
      meaning: Verifiable owner-approved decision
    implementation_evidence:
      statuses:
      - reported
      - superseded
      required:
      - observations
      - paths
      meaning: Observed code/behaviour, not normative authority
    verification_result:
      statuses:
      - reported
      - superseded
      required:
      - target
      - outcome
      - method
      - evidence
      meaning: Truthful check result, including `not_run`
    issue:
      statuses:
      - open
      - blocked
      - resolved
      - superseded
      required:
      - problem
      - impact
      - blocking
      - next_action
      meaning: Uncertainty, contradiction or blocker
    handoff:
      statuses:
      - open
      - acknowledged
      - completed
      required:
      - from_agent
      - to_agent
      - objective
      - confirmed
      - next_actions
      - open_questions
      meaning: Persisted transfer of known state and unresolved work
    protocol_change:
      statuses:
      - proposed
      - applied
      - rejected
      - reverted
      required:
      - change_class
      - change_summary
      - rationale
      - files_changed
      - compatibility
      - rollback
      - validation
      meaning: Audited evolution; applied changes require correct authorisation and passing checks
  relationships:
    derived_from: based on another record; no inherited approval.
    proposes_change_to: recommends modifying another record.
    implements: observed implementation associated with a requirement or decision.
    verifies: verification evidence for another record.
    contradicts: points to incompatible assertions requiring investigation.
    supersedes: reviewed replacement; cycles forbidden.
    blocks: records a specific workflow obstruction, not universal veto power.
    affects: potentially impacted dependency.
    resolves: reviewed resolution of an issue.
    hands_off: persisted handoff of another record.
  amendment_classes:
    compatible:
      examples: Optional fields, new kinds/relations retaining prior meanings, stricter tests that do not reject valid history
      activation: Delegated agent after passing checks
    breaking:
      examples: Renamed/removed fields, changed semantics, invalidated earlier valid records
      activation: Explicit owner approval and migration
    governance:
      examples: Changed authority, validation, kernel, security or amendment permissions
      activation: Explicit owner approval
```
<!-- HPX-SCP:INTEGRITY-MANIFEST-BEGIN v4 -->
```yaml
natural_sha256: 01f7eddba8d9d5707fb715a4cf3fd09032198a2eaa9c113f7228d81f5e3f0e41
machine_sha256: 098acd10c355a4419e3cef456ef82139f73170e8e9774d27bb5787693df6c4f8
```
