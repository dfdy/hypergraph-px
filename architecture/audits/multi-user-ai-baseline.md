# Mandatory multi-user and AI-user baseline

2026-10-30 · HPX-OWNER-027 · HPX-RQ-032–036 · HPX-TEST-112

## Pre-change backup

Before editing any project specification/model, copied and independently SHA-256 verified **236 files / 6586945 bytes** under local ignored `artifacts/specification-backups/before-multi-user-agents-2026-10-30_161739`. `MANIFEST.json` records original workspace-relative paths/sizes/hashes; `SHA256SUMS` and `VERIFIED.json` support inspection/restore. Manifest SHA-256: `7e6bf5044fba5c778a76c0df4e4fe0db7482b977095429ac75efc1d5d50004b7`. Includes current docs/registers, LikeC4 sources/config/evidence/saved layouts and root AGENTS/README/INPUT. Installed dependencies/build output, source application/runtime data, credentials and private historical archives are excluded. This backup is local and unpublished;restore selected files only after comparing later work.

## Adopted requirements and implementation gaps

| Requirement | Mandatory product scope | Evidence / remaining gap |
| --- | --- | --- |
| HPX-RQ-032 | Multiple users in one deployment/workspace;single-human development is not architecture;federation separate | Current owner/device catalog and authority code remain single-owner. Membership/session/isolation/concurrency mechanisms pending. |
| HPX-RQ-033 | AI agents are a distinguishable user kind under the principal/policy model | Provider/model labels and current mock chat do not establish a user or authority. |
| HPX-RQ-034 | Several independently authorised AI users per workspace,including overlapping activity | Per-agent context/draft/receipt isolation and conflict/recovery acceptance pending. One focused UI agent is not a workspace limit. |
| HPX-RQ-035 | Supplied prompts/context/messages/responses are workspace nodes with graph/history/provenance/protection | No durable chat-node format/path is claimed. Exact captured node references/records and provider disclosure need design. |
| HPX-RQ-036 | Direct selected-node MCP edits use human-equivalent graph/source/draft/Commit/history/recovery | Product MCP/auth/target/tool contracts unimplemented;not a privileged writer or forced proposal-per-keystroke workflow. |

The detailed accepted requirement contract is [HPX-SUB-010](../../docs/06-subsystems/ai-collaboration.md),materialising its previously reserved ID. Mechanism designs remain unadopted (HPX-GAP-026–028). Current APIs/persistent bytes/tool names/providers are unchanged.

## Reconciliation and diagrams

Product requirements, purpose/scope, architecture, principal model, UI/runtime/security/publication contracts and roadmap now point to the mandatory baseline. ADR001's original one-human-first statement is retained as provenance with explicit scoped supersession;ADR003's single SQLite writer is distinguished from user cardinality. Proposal review remains conditional on applicable operation policy;authorised AI MCP editing is a normal selected-node path. Chat recording does not turn text/model output into authority.

C1 now distinguishes Human users (current prototype partial) from required AI users (planned implementation). C2 shows required chat-node and selected-node MCP interactions outside the HPX boundary. Actor categories represent multiple principals,not a separate server per user. Existing application-authority,required AI chat/context and API/MCP responsibilities distinguish mandatory scope from implementation. Other integrations/peers remain future scope;federation is not the baseline collaboration mechanism. All existing diagram geometry is retained;only new actor geometry is added.

## Planned acceptance

See [baseline acceptance](../../docs/03-requirements/acceptance-criteria.md#multi-user-and-ai-user-baseline-acceptance): two humans/two AI users in one workspace without federation,rights/private-state isolation,attribution,overlapping stale/conflicting edits,chat-node reconstruction and MCP/human edit/graph/history/retry parity. These are requirements,not results of this task.

## Executed verification

[Machine evidence](../evidence/multi-user-ai-baseline-validation.json) records backup rehash,document/model/source/link/navigation/layout checks and protected application hashes. Static native previews are not actual VS Code or application acceptance. No application code,build,launch,tests,provider/trust/workspace action,asset/contract generation,proof,commit or publication was performed.
