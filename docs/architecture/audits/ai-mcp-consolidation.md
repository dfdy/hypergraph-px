# AI-user MCP scope correction

HPX-OWNER-028 removes the independent general-purpose external API client requirement. MCP is an interaction mode of AI users. The separate `api_clients` external system and its C1/C2/C3 connections are removed; existing AI-user chat and selected-node MCP connections remain. Rust-engine and Runtime/API views use the same AI-user actor. The internal responsibility is now **AI-user MCP access**; it is planned, not a new container or delivered endpoint.

The browser internal HTTPS API, route/OpenAPI evidence, contract tooling, application authority, draft acknowledgement/Commit distinction and same-instance multi-user requirements remain. Human/AI permission and history parity still apply. No generic external API or remote listener is required. Transport/authentication/tools remain unresolved in HPX-GAP-028; federation remains separate. Earlier audit descriptions of generic external clients are historical and superseded in this scope, not implementation acceptance.

[Owner decision](../../02-governance/OWNER_DECISIONS.md), [accepted contract](../../06-subsystems/ai-collaboration.md), [executed checks](../evidence/ai-mcp-consolidation.json). Existing view IDs, navigation destinations and retained box/curve geometry are preserved; removed client boxes leave space deliberately. No rendered visual acceptance or application testing is claimed.
