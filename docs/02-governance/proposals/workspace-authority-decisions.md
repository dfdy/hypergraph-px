# Workspace authority — first owner decision packet

2026-11-14. **Policy choices 1A/2A/3A/4A accepted under HPX-OWNER-058; implementation and exact mechanisms remain unfinished.** Prepared under the owner-approved specification completion programme, stage3. Sources: [M4 canonical distinctions](../../05-domain/diagrams/authority-distinction.c4), [shared API scope](../../06-subsystems/interfaces/browser-runtime.md#shared-human-and-ai-user-api--accepted-owner-scope), [chat/MCP contract](../../06-subsystems/ai-collaboration.md), [security](../../06-subsystems/security-cryptography.md) and OWNER027–033. Resolves an initial policy batch for GAP026/029 and historical-disclosure aspects of GAP006; does not close those gaps.


<!-- contract-bindings:start -->
Section ownership below includes nested subsections. [Binding register](../registers/contract-bindings.json) is authoritative for this routing. Links preserve existing acceptance, design and implementation status.

| Contract section | C4 owner / scope / view and consumers, or prose disposition |
| --- | --- |
| `HPX-BIND-046-01` [Fixed constraints and recorded choice alternatives](#fixed-constraints-and-recorded-choice-alternatives) | [hpx.native.authority.concept_user](../../05-domain/diagrams/authority-distinction.c4) · `HPX-CAN-026` · [concept_authority_distinctions](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-046-02` [Accepted logical capability vocabulary — choice 2A](#accepted-logical-capability-vocabulary--choice-2a) | [hpx.native.authority.concept_permission](../../05-domain/diagrams/authority-distinction.c4) · `HPX-CAN-026` · [concept_authority_distinctions](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-046-03` [Logical enforcement interface and flow](#logical-enforcement-interface-and-flow) | [hpx.native.application.admission](../../06-subsystems/diagrams/shared-responsibilities.c4) · `HPX-CAN-006` · [c3_application](../../04-architecture/navigation.md) · consumers: none |
| `HPX-BIND-046-04` [Required unexecuted policy acceptance cases](#required-unexecuted-policy-acceptance-cases) | [hpx.native.authority](../../04-architecture/diagrams/executable.c4) · `HPX-CAN-026` · [c3_application](../../04-architecture/navigation.md) · consumers: none |
<!-- contract-bindings:end -->

## Fixed constraints and recorded choice alternatives

Users belong to exactly one workspace; at most one machine user per provider there. Sessions/models/chats do not create users. Authentication, key availability and current resource authority are independent. Browser/MCP use the same backend policy. No node/edge ACL, inference service, new process or public API product is introduced.

| Decision | A — recommended | B — alternative | Consequence |
| --- | --- | --- | --- |
| 1. User lifecycle | Explicit authorised creation/activation/suspension with stable workspace-local user identity; suspended identities and attribution remain. Bootstrap the initial human administrator only through an explicit workspace-creation/recovery ceremony, never through first login. | Authorised creation followed by invitation acceptance before activation for every additional user. Initial administrator still requires explicit bootstrap. | A is simpler for local administration; B adds invitation expiry/replay/recovery design. Neither authenticates a request merely from a supplied user/provider label. |
| 2. Permission representation | Explicit per-user capability sets, with no role inheritance. Use the accepted vocabulary below. | Named role presets expand to explicit capability sets; no hidden inheritance and no node ACL. | B needs role-definition/version/change semantics; A exposes exact assignments directly. Assignment changes remain authorised operations. |
| 3. Revocation/in-flight changes | Serialise authoritative permission changes with final publication admission; revalidate current capabilities immediately before mutation publication and protected read/receipt release. A revoked request may compute but cannot subsequently publish or release protected output. | Conservatively cancel all affected in-flight work and sessions when permissions change, then require fresh authentication. Still revalidate at publication/release. | A preserves unaffected sessions and avoids treating cancellation as rollback. B is more disruptive and still cannot retract bytes already released or cancel a completed transaction. |
| 4. Current versus retained-history disclosure | Separate current-content and historical-content read capabilities. Every exact nested dependency and receipt payload must be authorised; if required input is unavailable, deny/fail the complete protected operation without silent omission. | One combined content/history read capability with explicit disclosure of its full retained-history consequence before assignment. Private workflow isolation still applies. | A permits narrower current access. B simplifies assignment but grants all retained historical content covered by the user's workspace authority. Neither grants other users' private drafts. |

The owner directly selected `1A, 2A, 3A, 4A` on 2026-11-14 in this conversation. The A column is adopted; B remains an unselected alternative. This is approval of policy choices only. Exact authentication enrolment, credential/device/session mechanisms, policy record/epoch encoding, cryptographic historical grants, upgrade and wire layouts remain a subsequent reviewable design packet. No permission/version changes in existing code or workspace bytes follow from this packet.

## Accepted logical capability vocabulary — choice 2A

| Capability | Proposed meaning |
| --- | --- |
| `read_current` | Protected current graph/source queries within shared workspace content, subject to exact dependency checks. Does not read another user's private workflow. |
| `read_history` | Retained published version/history reads and reconstruction; not private drafts or administrative secrets. |
| `edit` | Create and mutate authorised graph content and the acting user's drafts; exact context/expected-state checks remain mandatory. |
| `commit` | Publish the acting user's validated prepared changes through ordinary atomic Commit semantics; requires `edit`. |
| `disclose_machine_context` | Supply authorised exact content as machine context; requires corresponding content/history access and applicable egress policy. Machine/provider identity alone grants nothing. |
| `export` | Produce authorised export files/packages with explicit selected scope and confidentiality checks; requires the reads necessary for that scope. |
| `administer_users` | Explicit lifecycle changes for other workspace users; not arbitrary graph/history access. |
| `administer_permissions` | Assign capabilities to other users, within the administrator's explicitly delegated assignment ceiling; no self-escalation. |

These names are accepted logical capabilities, not current wire/storage identifiers. Chat nodes use ordinary `edit`/`commit` and source-access checks, not a privileged chat capability. Receipt reads use current required authority for the original operation/result and the acting user's workflow; knowing an operation ID is not permission. Private drafts/clipboard/receipts are scoped by the acting user and operation context, not node ACLs. Authority to edit is not permission to mutate another user's pending draft.

Choice2A adopts this vocabulary. Assignment ceilings, last-administrator protection and recovery are required follow-up definitions: the follow-up design must not permit self-grants, administrator lockout by routine operations or bootstrap by an unauthenticated caller. Bootstrap/recovery are explicit owner-controlled ceremonies distinct from keychain/passphrase unlock. No ambient OS-login privilege is inferred.

## Logical enforcement interface and flow

Logical application inputs: authenticated workspace-user/session context, operation and exact target/state, operation identity, current policy observation and required capability set. Outputs: authorised prepared operation/query result, or denial/conflict/failure/uncertainty with no unauthorised payload. This is a logical interface, not an adopted Rust type, HTTP schema or MCP payload.

The adapter authenticates and maps input; application admission resolves current workspace-user authority before protected loading; pure-domain planning receives only authorised exact inputs. Final publication/release revalidates authority and expected state. Persistence publishes atomically below that boundary. Retries reconcile original outcomes rather than execute a new intent; current revocation can deny protected receipt content without falsifying whether an earlier operation completed. Define a disclosure-safe outcome for that case in the next API packet; do not leak prior result metadata by default.

## Required unexecuted policy acceptance cases

1. Two humans and two machine users from different providers can participate; duplicate-provider creation in one workspace is rejected. Workspace users and grants never transfer to another workspace.
2. User-supplied labels, provider/model/session/chat identifiers, selection and possession of unlocked keys cannot authorise a protected request.
3. Missing required capability denies the same browser and MCP operation; no direct storage path bypasses policy. An editor without `commit` may prepare only its authorised private draft.
4. Revocation between preparation and publication/release produces no later unauthorised publication/output. Already completed operations are not rolled back; no claim to recall previously disclosed plaintext.
5. Retry after revocation preserves the original operation's actual outcome without releasing protected original payload; changed-request reuse still conflicts.
6. Current-only readers cannot traverse unauthorised historical dependencies. Full-history readers still cannot read another user's private drafts or credentials. Denial reveals no hidden labels/content/counts.
7. Suspension retains immutable attribution/history; routine lifecycle changes cannot erase a user or create a second active machine user for the same provider.
8. Capability administration cannot grant oneself additional rights or assign beyond an explicit ceiling. Recovery of a lost final administrator requires the separately specified explicit recovery ceremony.

These are **unexecuted design acceptance cases**. Further stage3 packets must settle credential/session protocol and theft/replay resistance, initial/recovery authority, complete delegation/admin invariants, authenticated policy/history key grants, key rotation/custody and certificate provisioning/renewal. M4 remains canonical for the accepted policy; this linked contract retains precise capability meanings and acceptance obligations. Adoption does not select the remaining mechanism alternatives or change active product formats.
