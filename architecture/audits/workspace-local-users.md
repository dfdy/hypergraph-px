# Workspace-local users and permissions

HPX-OWNER-030/031 narrow HPX-RQ-032/033/034/038. Both human and machine users belong to one workspace; no user/principal is reusable across workspaces. Each workspace supports at most one machine user per provider, while different providers can participate together. A person/provider represented elsewhere has a separate workspace-local user with separate permissions. Models/sessions/chats are not additional users.

Permissions are assigned to that workspace user, not to separate selected nodes or graph edges. Common user API enforcement and human/AI edit/history/draft/Commit/receipt parity remain. Private drafts/clipboard remain per-user workflow state. Provider inference endpoints are dependencies of their machine user, not additional user/permission principals. Existing two technical roles do not introduce duplicate accounts.

The agent's earlier cross-workspace reuse interpretation was wrong and is explicitly corrected by OWNER031. Current specification qualifications, requirement rows and GAP026/028/029 are reconciled; historical as-run audits/tests retain their original scope. The 26-file cross-specification coverage follows the [shared API inventory](shared-user-api.md), now qualified by the workspace-local rule. Root guidance and C1/C2/Rust-engine/Runtime/API descriptions agree. Stable element/view IDs and all saved geometry remain.

[Accepted user contract](../../docs/06-subsystems/ai-collaboration.md); [owner records](../../docs/02-governance/OWNER_DECISIONS.md); [checks](../evidence/workspace-local-users.json).

No schema, provider-identity canonicalisation, credential/session design, user lifecycle or permission capability vocabulary is selected. Current single-owner source does not implement this multi-user design. Future acceptance must check different-provider coexistence, same-provider duplicate rejection within a workspace, separate identities/permissions between workspaces, and common browser/MCP authorisation. Only documentation/model checks were executed.
