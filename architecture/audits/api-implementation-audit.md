# API C4 implementation and workflow audit

- **ID:** `HPX-ARCH-008`
- **Title:** API C4 implementation and workflow audit
- **Purpose:** Map current API route families to real code and inspect unlock, Save, Commit and uncertain-result workflows as V3 evidence.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; development agent records
- **Applies to:** Current local trusted-server API1, ordinary schema1/2 and bounded source-linked C4 interpretation
- **Upstream authority:** [Runtime/API audit](runtime-api-audit.md), [runtime contract](../../docs/06-subsystems/interfaces/browser-runtime.md), [publication protocol](../../docs/07-implementation/protocols/draft-publication.md), [owner decisions](../../docs/02-governance/OWNER_DECISIONS.md)
- **Downstream dependencies:** [C4 view](../C4/api-implementation.c4), [sequence views](../Sequence/api-workflows.c4), [route/code inventory](../evidence/api-implementation-inventory.json), [workflow inventory](../evidence/api-workflow-inventory.json)
- **Verification:** [executed modelling checks](../evidence/api-implementation-validation.json); existing application tests reviewed, not rerun
- **Decision/history:** Owner requested code-linked C4 and four workflow sequences on 2026-10-29. Source observations are evidence, not retroactive requirements or adopted V3 module boundaries.
- **Last reviewed:** 2026-10-29


Current diagram names and visual entry points are listed in the [navigation map](../navigation.md); earlier checkpoint titles below retain their historical scope.


## Navigation and interpretation

From **C3 / Runtime and API**, click API dispatch or security gates for **C4 / API handlers and operations**. Workspace lifecycle opens Unlock. In C4, bootstrap/lifecycle opens Unlock, publication branch opens Commit, its Workspace methods open Save, and browser protocol opens uncertain-outcome recovery. Sequence participants link back to C4; Commit links to Save, and Save/Commit link to recovery.

All eight route-family handlers are labelled fragments of the **same `route_inner` function**. Workspace boxes are real method sets, not new services/classes/modules. Twenty-three code aliases associate real symbols/source fragments with stable model IDs;21 are shown in the static view, with crypto/native provider detail used in Unlock. Static links describe source dependencies; sequence lifelines are source responsibilities, not separate processes or a mechanically extracted call-stack proof. C4-only links are filtered out of higher-level projections. Existing diagrams and owner geometry are preserved.

Blue/grey fills and green/amber/grey status tags retain the existing conventions. An implemented badge is bounded to the described existing code; it does not imply the entire feature family, schema or V3 requirement is complete. Future MCP/client-held/general-rights designs have no invented C4 functions; they remain explicitly planned at C3. Static C4 links are single smooth cubic curves. Sequence views use LikeC4's standard UML lifelines/messages, whose routing is controlled by the sequence renderer.

## Route coverage and real operations

The inventory matches all36 current source routes to the unchanged generated OpenAPI contract. It preserves 11 typed, two typed-response, one typed-Fork/legacy-command mixture and22 route-only operations. Exact methods/paths/payloads/responses remain authoritative in [OpenAPI](../../frontend/src/generated/openapi.json); inventory entries store pointers, references and source mappings rather than copying schemas. Every route belongs to exactly one family:

| Family | Routes | Handler and actual target |
| --- | ---: | --- |
| Bootstrap | 1 | `route_inner` branch → `secure_equal` |
| Workspace lifecycle | 7 | `route_inner` branch → `create`, `current_keychain_status`, `enroll_keychain`; full method set in inventory |
| Documents / editor reads | 2 | `route_inner` branch → `list_documents`, `open_document` |
| Branches / history / audit | 10 | `route_inner` branch → `audit_document`, `branch_comparison`, `branch_history`; full method set in inventory |
| Graph projections | 3 | `route_inner` branch → `document_fork_graph`, `overlay_graph`, `transformation_graph` |
| Annotations / contributors | 4 | `route_inner` branch → `assertion_page`, `assertion_revision`, `comments_page`; full method set in inventory |
| Working references / derivation | 7 | `route_inner` branch → `clipboard_page`, `document_derivation`, `document_merge`; full method set in inventory |
| Publication / receipts | 2 | `route_inner` branch → `execute`, `execute_inner`, `receipt`; full method set in inventory |

`decode<T>` and adapter-owned DTO/Id conversion remain branch-local. Documents/Lock ignore their bodies; GET runtime has none. Committed Fork conversion borrows `RawValue` and has its typed adapter, while Save/Commit retain existing legacy codecs. Generated types are not runtime resource authorization or transaction validation. Pure domain remains free of serialization. Recorded synthesis lookup is not a Merge preview or publication; actual mutation goes through the command path. Child-branch Save/Commit use `Command::Branch` and `branches::apply`, with branch authorization before replay.

## Source-derived workflow boundaries

| View | Preserved behavior and failure paths |
| --- | --- |
| Unlock | Optional launch-capability exchange establishes a process cookie, not decryption authority. Session/Origin/Host gates precede explicit lifecycle actions. Existing-workspace passphrase unwrap is default; enrolled native keychain is an explicitly selected alternative. Invalid/throttled/already-unlocked/provider/crypto cases do not install a workspace. Only authenticated catalog success sets `State.workspace=Some`. No key enters the browser. |
| Save | Capture exact owned text/context and serialize per document; resolve retained pending work first. Freeze one operation/payload. Transport and decode rejection do not invoke the writer. `execute_inner` validates/digests, begins an immediate transaction, authorizes current source/branch scope, then checks receipts. A new valid Save changes only the mutable encrypted draft and writes its receipt in the same transaction. ACK is not immutable Commit; receipt/context validation cannot replace newer typing. |
| Commit | Replay a matching pending captured Commit, or acknowledge captured Save first; failed/unknown Save stops that Commit call. New publication retains expected base/generation/sequence, one-parent revision/snapshot/head CAS, draft rebase, retained promotions and receipt atomically. Retained original receipts produce no duplicate revision. Clipboard replacement after Commit is separately acknowledged and can fail without undoing text publication. Logical departure additionally skips unchanged captured text; ordinary blur/autosave does not Commit. |
| Uncertain command | The browser auto-retries a status-less transport error only once per `retryTransport` invocation. If still unknown, retain the exact pending envelope. A later retry rechecks current transport/unlock and resource authority before protected replay, returns the original authorized result when present, or applies the original once only if expected state remains valid. Changed payload/stale state conflicts; no fresh operation is inferred safe. Receipt-binding failures do not advance ACK. |

These are ordinary supported local workflows, not acceptance of experimental schema3, two-parent parent-Merge, multi-owner whole-buffer save, federation or general recovery. Alternative/optional/break frames describe source conditions; they do not add Rust/JavaScript modules or exception handlers. Returns and error propagation through shared response code are summarized rather than claiming a new middleware stack.

## Discrepancies, limits and open V3 questions

- **Pending identity is tab-local.** `RuntimeAdapter` retains frozen commands in memory. Reload/restart can recover acknowledged editor state but does not recover a browser-side pending-command journal. The uncertain-result sequence is explicitly same-tab. Decide a durable pending/reconciliation design before promising continuity across reload; no such mechanism is implemented here.
- **Unlock is not a command receipt workflow.** Initialization has no explicit lost-unlock-ack reconciliation branch; if the server unlocked but its reply was lost, a repeat may receive `already_unlocked`. This is a source observation, not a newly executed fault test. Decide whether V3 should reconcile with authenticated metadata or another approved mechanism; do not automatically apply command retry rules to credentials.
- **Receipt API versus adapter behavior.** An authorized receipt-read operation exists. Current Save/Commit recovery uses frozen command replay, not automatic receipt polling. A future client strategy must preserve current authority/outcome checks and exact-operation identity.
- **Schema/compatibility gaps remain.** Twenty-two operations are route-only; documents/Lock retain ignored bodies; `EmptyRequest` preserves `{}` plus legacy empty-sequence acceptance. Do not tighten these through diagram cleanup. Complete typed coverage and any versioned acceptance evolution remain reviewable V3 work.
- **Error/time limits are not cancellation.** The socket deadline does not cancel an already running storage/KDF operation. Known HTTP errors are not automatically retried; a missing response does not prove failure. Partial problem-details negotiation remains distinct from full target error coverage.
- **Code layout is not a target architecture.** Most handlers share one large function and many application operations remain in storage. This model identifies that coupling without adopting a refactor, middleware framework, async runtime or new service split. Existing accepted source obligations retain scope; historical checkpoint wording is not current delivery evidence.

## Evidence and executed-check scope

The [inventory](../evidence/api-implementation-inventory.json) records exact source identities, all route dispositions, real handler branch lines, public Workspace methods, wire references and relevant test names. Existing frontend tests cover delayed/lost ACKs, uncertain Commit replay and newer typing; existing storage tests describe restart/crash atomicity. They were reviewed, not run. No application test, compile, API generation, server/browser launch, credential/trust/provider/workspace action or publication occurred.

The [modelling record](../evidence/api-implementation-validation.json) records only executed DSL/layout/navigation/source/coverage/geometry/preservation checks. Native AppKit preview is an approximation of the static view; actual VS Code/UML rendering was not visually inspected. No whole-application proof, security/durability acceptance, protocol adoption or application delivery checkpoint follows from these diagrams.
