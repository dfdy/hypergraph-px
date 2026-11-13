# Multi-user and AI Collaboration

## Common metadata

- **ID:** `HPX-SUB-010`
- **Title:** Multi-user and AI Collaboration
- **Purpose:** Mandatory multi-user baseline, AI-user identity, workspace chat nodes and selected-node MCP editing parity.
- **Level:** `06-subsystems`
- **Status:** `accepted`
- **Maintainer:** project owner; agent records scoped requirements
- **Applies to:** V3 product baseline within a single HPX deployment/workspace; current implementation gaps explicitly retained
- **Upstream authority:** [owner direction HPX-OWNER-027](../02-governance/OWNER_DECISIONS.md#mandatory-multi-user-and-ai-user-baseline-2026-10-30); [product requirements](../03-requirements/system-requirements.md#mandatory-multi-user-and-ai-user-baseline-2026-10-30)
- **Downstream dependencies:** [browser/runtime contract](interfaces/browser-runtime.md); [publication](../07-implementation/protocols/draft-publication.md); [acceptance](../03-requirements/acceptance-criteria.md#multi-user-and-ai-user-baseline-acceptance)
- **Verification:** HPX-TEST-112 checks documentation/model reconciliation only; no implementation or product-acceptance claim
- **Decision/history:** Reserved HPX-SUB-010 materialised under explicit owner direction; earlier single-human product staging/proposal-only restrictions are qualified below
- **Last reviewed:** 2026-11-01

## 1. Mandatory multi-user baseline — HPX-RQ-032

User structure and cardinality are canonical in [C1/C2](../../architecture/context.c4), HPX-CAN-002. Development with one human does not constrain product architecture; a single SQLite writer is not a user limit. The interaction and enforcement obligations below supplement the diagrams.

## 2. AI agents are users — HPX-RQ-033

The machine user performs inference on its own side. HPX communicates with that user through chat and MCP; HPX has no separate inference endpoint, model-call orchestrator or inference-provider account. Chat/context disclosure obeys workspace-user permissions; provider identity is not a second permission principal (HPX-OWNER-033).

Provider models, sessions, chats and requests are not additional user principals. Verify authenticated workspace context; a provider name, model response or connection is not authority. User/provider lifecycle mechanisms remain unresolved.

## 3. Multiple AI agents in one workspace — HPX-RQ-034

Preserve actor attribution, private workflow state, pending operations and receipts during overlapping activity. Reject stale or conflicting changes rather than silently overwrite accepted work. Concurrency/conflict mechanisms remain design work; no CRDT or federation topology is selected.

## 4. Chat is workspace graph content — HPX-RQ-035

Every supplied prompt, all context actually supplied to the AI and every observed response/message must be represented as workspace nodes. This includes application-supplied instructions and retrieval/tool context. Retain exact content and links to attributable participants, source-node revisions and resulting responses using normal node identity, graph, history, provenance and protection rules. Context itself remains identifiable; existing content can be bound by exact retained links rather than needlessly copied. Do not substitute later mutable heads for historical context.

Do not claim to capture unavailable provider-internal instructions or thoughts. Record observed partial, cancelled and failed interactions honestly. Workspace permissions and confidentiality/disclosure policy apply; credentials and keys are not model context. Chat nodes are not grants or automatic edits to another node. Retained-history policy continues; no silent pruning is adopted.

## 5. Selected-node editing through MCP — HPX-RQ-036

An authorised machine user can edit a specifically selected node directly through MCP, using the same source, graph, draft acknowledgement, Commit, version/history, provenance, receipt and recovery semantics as human editing. Bind operations to the workspace-local actor, selected node/context, exact owned source and relevant expected state/operation identity. Selection defines the target, not a separate permission grant; it cannot broaden the operation or access another user's unrelated draft. Editing preserves logical identity unless Fork/derivation is explicitly requested.

MCP adapts the shared user API. It is not a direct SQLite writer, alternate permission engine or privileged graph path. Human and machine operations share exact UTF8/line endings, explicit browser-coordinate conversion, conflict detection and original-operation reconciliation. Direct authorised editing is not restricted to suggestions or mandatory human approval per keystroke. Review applies where the same workspace policy requires it for a human; no self-grants or self-approval. Draft acknowledgement remains distinct from Commit.

## 6. Interfaces and boundaries — HPX-RQ-037/038

All protected human/machine hypergraph operations use one logical command/query API, reached by browser HTTPS and AI MCP adapters. Permissions are set for each workspace-local user, not independently per node/edge/occurrence. Authenticate the acting user, distinguish workspace unlock from authority, and enforce current workspace permissions before reads, changes and protected receipt replay. Users cannot administer their own permissions without authority. Private drafts/clipboard are user workflow state, not an additional node ACL scheme.

Inputs: workspace-local authenticated user, workspace permissions, selected-node/context, prompts/context nodes and exact operation/state. Outputs: authorised data and graph links, attributed drafts/revisions/receipts, or explicit denial/conflict/failure/uncertainty. Rust application coordination owns authority/publication; pure domain planning grants no rights. Serialization stays in adapters. The [shared API contract](interfaces/browser-runtime.md#shared-human-and-ai-user-api--accepted-owner-scope) defines this interface. No public external API product or additional runtime service is required.

### Creation context for human and machine users — HPX-RQ-039

Every created node, including chat/context/result nodes, obeys [M1's accepted creation-origin invariant](../../architecture/Conceptual/identity-closure.c4) and the [context contract](../05-domain/core-object-model.md#creation-origin-and-placement--hpx-owner-048). Machine requests require explicit equivalent initiating placement context, not a literal browser caret. Backend validation must determine the parent or position and reject missing/ambiguous context under ordinary permissions; inference, provider identity and node selection cannot invent placement or grant authority. This selects no chat, identity, context-payload or MCP wire format.

## 7. Authority and implementation limits

HPX-OWNER-027–031 establish the current scope. Single-human product staging, collaboration postponed behind federation, unconditional proposal-only AI editing, multiple machine users from one provider in one workspace, cross-workspace user reuse and mandatory target-specific ACLs are superseded. Historical decisions/source bytes and as-run evidence remain preserved; they are not current requirements.

Current source is a bounded one-owner implementation, not delivery of workspace-local multi-user authority, chat-node retention or product MCP editing. No wire endpoint, schema, permission format, provider connection or migration is adopted here. Open mechanisms: workspace user/provider lifecycle and concurrency (HPX-GAP-026); chat representation/disclosure (HPX-GAP-027); MCP tool/target/state/recovery binding (HPX-GAP-028); workspace permission capabilities/administration/revocation (HPX-GAP-029).

## 8. Acceptance obligations

Future checks must cover two humans and two machine users from different providers within one workspace; rejection of a duplicate machine user for the same provider there; no cross-workspace reuse of either user kind or carried-over rights; workspace permission denial and private workflow isolation; attributable overlapping edits/conflicts; exact prompt/context/response reconstruction; and browser/MCP parity for graph, history, draft, Commit and uncertain-outcome recovery. These are requirements, not executed application tests.

## Source and authority

HPX-SRC-0014 was provenance for the formerly reserved topic ID. This is an owner-directed contract under HPX-OWNER-027–031, not a verbatim recovery or adoption of that archive. Verified local pre-change snapshots retain earlier specifications; source registers preserve original paths and hashes.
