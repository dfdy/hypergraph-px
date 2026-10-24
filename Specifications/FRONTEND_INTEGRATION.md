# Frontend integration specification

Status: development coordination specification, 2026-10-24. Audience: the agent building the browser interface and the developers implementing its Rust application services. Read this document with [the product specification](SPECIFICATION.md), [architecture](ARCHITECTURE.md), [data/navigation reference](DATA/README.md) and [encryption specification](DATA/ENCRYPTION.md).

The behavioral requirements below govern frontend development. Adapter concepts and candidate HTTP routes are design targets, **not implemented endpoints, a frozen JSON schema or a durable storage format**. The product specification takes precedence. Agree executable DTO/schema fixtures with Rust implementation before connecting real data. Interface-study versions, application versions and transport-contract versions are independent.

## 1. Current boundary and what to build now

The repository implements a pure Rust expansion validator and an in-memory cryptographic adapter. It has **no HTTP server, authentication/session service, draft store, publication service, frontend package or live REST/MCP endpoints**. Crypto functions are not browser API endpoints. Frontend library selection is not fixed by this specification.

Build a desktop interface against a replaceable typed application adapter. A fixture adapter may simulate the required state transitions with synthetic data; an HTTP adapter will later invoke the same application use cases. Show fixture mode persistently as **Demonstration — changes in this tab only**. Do not label fixture operations durable, committed to Rust, authenticated, encrypted at rest or restart-safe. A failed live connection must never silently switch to fixtures or report a successful save.

Do not implement the complete endpoint catalogue before a usable editor slice. Stage delivery as follows:

| Stage | Frontend work | Backend acceptance gate |
|---|---|---|
| A: visual/interaction study | Four columns/three sidebar tabs, editable synthetic document, selection/undo, outline/minimap, table/maths presentation, attribution and simulated failure states | Fixture-only; no backend dependency |
| B: local editor | Create/open document, exact owned projection, draft autosave/recovery, explicit commit, error/conflict handling | Authentication/unlock design, authoritative identities/source mapping, encrypted durable drafts/publication and real recovery tests |
| C: reviewed structure | Fork/link/shared occurrence operations, history and branch comparison/integration | Exact provenance/closure, proposal/approval, atomic expected-state/idempotency and permission checks |
| D: integrations | Anchored comments, contributor/attribution services, annotations, exact export, mock then live agent, read-only Zotero and optional reviewed GitHub document publication | Per-feature contracts, disclosure/credential policy, capability checks and executed acceptance evidence |
| E: remote/client-held | Live collaboration, offline exchange, federation, client-held mode | Separate concurrency, membership, policy, key lifecycle and trusted-client gates |

Comments/agent visual panels can be demonstrated in A; their persistence/live execution belongs to D. UI presence does not mean feature availability. General backend implementation is not authorized merely by this coordination document.

## 2. Desktop presentation and interaction responsibilities

Default left-to-right layout: **chapter/section/subsection contents → styled Markdown source editor → document minimap → discussion sidebar with Agent, Comments and Users tabs**. Keep this order. Minimap navigation and current-viewport indication must stay synchronized with the same editor projection as the contents tree. Mobile responsiveness is deferred.

The browser owns presentation, input/IME, local transactions, caret/selection, focus, undo/redo and display preferences. Rust application services own authoritative identities, source ownership, permissions, validation, draft durability, proposal approval, publication, provenance and recovery. The browser may track tentative mappings to preserve editing responsiveness; Rust independently validates mappings before accepting writes.

Keep buttons and labels honest. Distinguish document text editing from structural publication and distinguish a temporary download from a saved draft. Provide keyboard operation/focus restoration for contents, minimap, dialogs, resizable panels and tabs. Unsupported actions have an explanatory unavailable state; a visually enabled control is never an authorization grant.

Treat document text, comments, model output, remote labels and link destinations as untrusted display inputs. Escape/sanitize rendered markup, constrain active URL schemes and prevent raw document HTML from executing scripts. Rendering a table, switching source/render view, navigating or changing appearance creates no history.

## 3. Adapter design target

Use one frontend boundary; UI components must not make unrelated fetch calls or manufacture backend graph records. The names below describe use cases and are not a requirement for a particular framework, filename or DTO-generation tool.

| Adapter operation | Minimum semantic input | Required result |
|---|---|---|
| `getRuntime` | Requested contract compatibility | Capabilities, contract/app versions, limits, deployment mode, authentication/storage availability; no secrets |
| `getSession`, `getStorageState` | Current connection context | Separate authenticated-principal/device and storage locked/unlocked state |
| `unlockStorage`, `lockStorage` | Explicit supported unlock method or confirmed lock intent; mutation identity | Resulting storage state, safe errors; never raw keys |
| `listDocuments`, `createDocument` | Workspace/page or requested name/initial content and mutation identity | Authorized summaries or one atomically created initial document state/projection |
| `openEditor` | Workspace/document, branch or exact historical reference, optional draft reference | Text plus complete source map, projection/state tokens, permissions, headings and draft state |
| `openDraft`, `recoverDraft` | Exact base and editing context, or authorized draft reference | Draft reference, generation, acknowledged local sequence and its exact mapped content |
| `saveDraft` | Exact draft/generation, editing context, prior acknowledged sequence, ordered changes through a local sequence, operation identity | Acknowledged sequence, new generation, exact resulting mapping/state token; no immutable commit |
| `resolveSelection`, `searchTargets` | Exact editor/draft context and selection, or bounded query | Authorized stable targets and exact resolved source bindings, or explicit ambiguity/staleness |
| `prepareProposal`, `approveProposal` | One action with exact inputs/state, or frozen proposal reference/scope | Frozen effects/disclosure/ownership and an approval bound to that exact proposal |
| `executeCommand`, `getRequest` | Frozen command/proposal plus expected state and operation identity, or original operation reference | Pending/committed/rejected/unknown result; exact receipt where authorized |

Do not expose fictional success implementations for absent methods. Adapter results must represent unavailable, denied, locked, stale, conflict and uncertain-outcome states. Later adapters extend this boundary for history/compare, comments/annotations, exports, agents and Zotero without bypassing the same authorization and publication semantics.

Keep opaque references semantically distinct: workspace, document/content identity, revision, placement occurrence, manifest revision, snapshot, transformation, branch, commit, draft, proposal, principal, device, group and operation. A document may refer to a composition identity; a new ID representation is not decided here. Backend-issued references must not be derived from labels, heading slugs, text equality or ciphertext addresses. Synthetic fixture references stay confined to fixture mode.

## 4. Editor projection and coordinate contract

Every editable projection provides the exact text and source bindings for all editable spans. Each binding must identify its owner kind (shared content or document-local prose), logical owner, exact revision/base, occurrence path/nested inclusion context, source range, editing permission and any generated/read-only boundary. A shared manifest used twice may require different descendant bindings. Neither heading position nor a map keyed only by content ID establishes ownership.

Inserted text may have a draft-local binding under its intended owner/base; it does not receive a fabricated immutable revision ID before commit. Insertion at an ownership boundary needs an explicit resolved owner/bias. Generated separators may be read-only. A historical projection is read-only unless an explicit authorized draft/branch/restore workflow creates a new state from that base.

Conceptual shape, **not an executable wire schema**:

```text
EditorProjection
  reference: workspace + document + branch OR exact snapshot
  projection_token + expected_state_token
  text + coordinate_encoding
  source_bindings[]: display span -> exact source/context/owner + allowed edits
  headings[]: hierarchy + display span + opaque target reference
  draft?: reference + generation + editing_context + acknowledged_sequence
```

Browser-local text ranges use half-open UTF-16 code-unit offsets into the **exact identified buffer**. A target includes the projection token, draft generation where applicable, editing context/local sequence, occurrence context and range. JavaScript strings use UTF-16 code units; Rust `str` byte boundaries differ. In `A😀B`, the emoji is browser range `[1,3)` and UTF-8 byte range `[1,5)`; an endpoint at UTF-16 offset 2 splits a surrogate pair and must fail. See [ECMAScript strings](https://tc39.es/ecma262/multipage/text-processing.html#sec-string-objects) and [Rust string boundaries](https://doc.rust-lang.org/std/primitive.str.html#method.is_char_boundary).

These browser coordinates do not adopt a durable anchor encoding. Conversion must be checked against the exact text and source-map token, with no silent Unicode, CRLF or whitespace normalization. Reject invalid scalar boundaries, out-of-range, stale or ambiguous targets. Combining marks and emoji sequences require tests; scalar boundaries alone do not define grapheme or sentence boundaries. Do not invent a complete-sentence-only eligibility rule: backend action contracts must report eligible scope and reasons.

Typing changes offsets. A base source map is not automatically valid for the edited buffer. Track ordered local transactions and their source mapping; `saveDraft` validates them against the acknowledged base and returns updated mappings. Subsequent selections identify their exact local sequence. Never relabel a stale map with a newer sequence or trust a client-submitted ownership map without Rust validation. If mapping across owners is not supported, reject that edit explicitly. Full-buffer replacement is permitted only under an explicitly supported, verified ownership contract; it is not a generic multi-owner save or agent endpoint.

Selection/search responses apply only to their originating document, projection, generation and local sequence. Discard or explicitly remap stale picker/preview results. Headings are display/search labels; stable links use opaque target references and explicit pin/follow policy. Duplicate or renamed headings must not retarget stored relations.

## 5. Draft autosave state machine

Track independent values: current local sequence, last acknowledged sequence, server draft generation, in-flight operation and current projection/base. Sequences are monotone safe integers within an editing context; server generations/state tokens are opaque. Different tabs/contexts must not share counters or assume exclusive access. Server preconditions protect shared drafts even for one human.

After five seconds of input inactivity, submit ordered changes to the mutable draft. Ordinary typing, formatting and table cell/row/column text edits use this path. Prefer one in-flight save per editing context; queue newer local changes. Retrying a save with an uncertain result uses the original operation identity and identical payload, not an updated generation/payload under the same key.

| UI state | Meaning / required behavior |
|---|---|
| Temporary/demo | Fixture data only; no durability claim |
| Modified | Current local sequence exceeds the acknowledged sequence |
| Saving | An exact sequence is in flight; later typing remains intact |
| Draft saved | Current sequence has been acknowledged by the durable draft service; no immutable publication implied |
| Save outcome unknown | Connection/reply lost; preserve text and reconcile the original operation |
| Conflict/stale | Preconditions or ownership no longer match; keep local text, offer explicit recovery/compare when supported |
| Locked/denied/unavailable | Stop prohibited work and show the cause; never report saved or fall back to another security mode |

Example: sequence 10 is sent, then the user types sequence 12. An acknowledgement for 10 advances acknowledged state only to 10; it cannot replace the current buffer, clear the dirty marker, move the caret, reset undo or claim 12 saved. Verify response context before applying it. Sequence/mapping reconciliation uses editor transactions rather than wholesale document replacement.

Draft save creates no content revision, manifest commit, snapshot or branch transition. Label successful autosave **Draft saved**, not **Committed**. A durable acknowledgement must survive restart before the UI may promise recovery. The server must return original outcomes for authorized duplicate operations, including when the first save already advanced the generation. Transport success alone is insufficient without a valid matching acknowledgement.

Do not put real drafts in plaintext localStorage, IndexedDB, cookies, service-worker caches, diagnostics or telemetry as an improvised recovery system. Browser persistence of sensitive data needs its own approved encryption/lifecycle design. On lock/logout or lost authorization, stop requests and stale-result application; revoke relevant views and stop further plaintext access. Warn before a user-initiated lock with unsaved work; define the actual draft/session/key-lock relationship in the security contract. Browser/OS memory erasure cannot be guaranteed by clearing a panel.

## 6. Explicit commit and reviewed structural actions

Commit freezes an exact draft generation/local sequence and affected owner bases, then publishes one complete permitted result. Flush/acknowledge the intended draft before executing `commit_draft`; autosave is not this operation. Structural actions require a resolved selection/destination, known ownership and a current compatible base. Block them while mapping/save outcomes are unresolved. If the user types after an action is frozen, preserve the later changes and rebase only through a validated mapping; otherwise show a recoverable conflict. An initial implementation may temporarily pause input during publication rather than claim unsupported rebasing.

For a reviewed structural/agent action: resolve intent → prepare frozen proposal → show exact targets/effects/disclosure → explicit human approval → execute atomically → reconcile receipt and projection. A preview may allocate encrypted workflow state but publishes no document history. Approval of a proposal is not publication, and execution rechecks heads, rights, policy and dependency closure. Ordinary human commits need an explicit commit action, not a proposal for each keystroke.

| User intent | Required distinction |
|---|---|
| Fork/extract | New logical content/revision and exact transformation provenance; retain source history; placement effects are explicit |
| Link | Stable target/reference and source anchors, separate from display text/slug; plain Markdown URL formatting must not pretend to create a typed graph relation |
| Copy versus shared inclusion | A Markdown copy is independent text; shared inclusion creates an occurrence with explicit pin/follow/closure and ownership semantics |
| Move/remove occurrence | Preserve occurrence identity on move; detach placement without erasing source history; reject illegal expansion cycles atomically |
| Table editing | Draft text transaction by default; table rendering is UI-only; no publication command per cell |
| Branch integration/restore | Review exact base/target/closure; append state, never rewrite retained history |

Rust performs the complete authorized content/composition/provenance/snapshot/branch publication. The browser cannot emulate it with separate create-text/place/provenance/update-head calls. Undo after publication cannot delete immutable history; an inverse structural operation needs an explicit valid command. Local text undo remains a draft edit with its own sequence.

Every mutation has an opaque `operation_id` scoped to the authenticated context and exact payload; per-attempt tracing is separate. Reconcile pending, committed, rejected or unknown outcomes using that original ID. A timeout, aborted fetch, event or HTTP `202` is not evidence of commit or rollback. Retry only the identical operation, or wait for reconciliation. An unknown/expired operation record does not authorize a fresh key that could duplicate a commit; retention/reconciliation guarantees must be agreed before live publication. Changed payload under one ID conflicts. Current authorization governs disclosure of the original receipt.

## 7. Capabilities, errors and candidate transport surface

Use same-origin relative paths with a candidate base `/api/v1`; never hard-code host/port in the bundle. Development proxying and release asset embedding must reach the same Rust application services. A future API contract negotiation must reject incompatible shapes/encodings rather than accepting a matching application version. No Node/frontend server or Lean process is required in the released product.

Capability results distinguish implemented support, deployment availability and current permission. Action eligibility also depends on the exact document/selection/state and lock status; capability flags are not authority. Missing capabilities disable the action. Preserve bounded/paginated results and only the completeness/denial information the backend permits. Do not probe or reveal hidden-object existence, fabricate missing bindings or infer permission from visible counts.

Candidate minimum surface, **all currently unimplemented**. Paths are relative to the candidate base and require DTO/security agreement before use:

| Surface | Candidate routes |
|---|---|
| Bootstrap/session/storage | `GET /capabilities`, `GET /session`, `GET /storage/state`; supported login/logout and `POST /storage/unlock`, `POST /storage/lock` after security design |
| Document discovery/creation | `GET /workspaces`, `GET /workspaces/{workspace}/documents`; `POST /commands` with gated `create_document` use case for initial atomic creation |
| Editor/navigation | `GET /documents/{document}/editor`, `GET /documents/{document}/headings`, `POST /documents/{document}/navigation/resolve` |
| Drafts | `POST /documents/{document}/working-drafts`, `GET /working-drafts/{draft}`, `PUT /working-drafts/{draft}` |
| Explicit publication/retry | `POST /commands` with `commit_draft`, `GET /requests/{operation}` |
| Reviewed structural actions | `POST /proposals`, `GET /proposals/{proposal}`, `POST /proposals/{proposal}/approvals`, `POST /commands` |

Require workspace/resource relationship validation even when a path only names a document or draft. Login/bootstrap must not depend on having document decryption keys; permission-filtered bootstrap metadata must not reveal protected content. DTO field spellings, authentication mechanism, cursor format, range conversion, request retention, resource limits, commit receipt and lock lifecycle remain integration gates, not frontend guesses.

Errors need a safe code/category, operation/correlation reference, permitted conflict details and recovery action. Model authentication-required, denied/undisclosed, locked, unsupported, invalid range, stale projection/draft, expected-state conflict, changed-key conflict, limit exceeded, disconnected, pending and unknown outcome. Do not blindly retry publication based on a generic retryable flag. HTTP mappings are subordinate to the agreed error contract; `If-Match` may carry a draft resource precondition, while a multi-owner command needs its full expected-state vector. See [HTTP preconditions and status semantics](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match).

Optional server events may invalidate authorized projections or report progress. Treat them as hints to re-read/reconcile, not permission grants or authoritative editor patches. Connection/presence invalidations do not establish document contribution, authorship or workspace membership. Bound resume state; sequence numbers are local to the negotiated stream/context, not global federation order. Polling/reconciliation is sufficient for the first editor contract; SSE and future MCP transport/protocol are separate gates.

## 8. Security, preferences and later integrations

Local live serving must bind loopback by default and validate Host/origin, same-origin requests and CSRF protection for cookie-authenticated mutation. Do not enable permissive CORS to connect a hosted mockup. Keep authentication, display preferences and storage unlock distinct. Server-derived actors/device authority, not submitted labels, authorize operations. Protect sensitive API responses and exports from unintended caches and logs; select exact headers, cookies and CSP in the transport/security contract before real data integration.

Display preferences may contain only validated theme, wrap width, editor font size, minimap visibility, panel widths, authorship-colour visibility and maths Source/Rendered mode, with a schema version and defaults for corrupt/unsupported values. Persistence mechanism, name and lifetime are UI choices, not an authentication or data format. Never store text, document IDs, drafts, proposals, credentials, keys or permission grants with preferences. Blocking preference persistence must not prevent editing. Browser zoom is separate from editor font size.

| Later feature | Required frontend boundary |
|---|---|
| Agent | Mock before live calls; preview exact disclosure, require explicit permission, keep model/human identities distinct; output is a proposal, never a self-approved command; cancellation cannot undo disclosure |
| Comments/annotations | Exact anchored source/context/state, independent from chat; show unresolved/ambiguous/stale anchors rather than attaching to similar text silently |
| Export | Distinguish temporary local-buffer downloads from exact committed/acknowledged-draft exports; neither is autosave or implicit commit (§8.4) |
| GitHub document publication | Optional external disclosure/job workflow with its own authorization, frozen review and remote concurrency/reconciliation gate (§8.5) |
| Zotero | Read-only scoped lookup/selection; connection types/URLs/credentials separately specified; preserve exact cited metadata for reconstruction, no library write-back implied |
| History/branches/graph | Exact authorized projections, bounded traversals, explicit comparison/integration, no live-head substitution in historical views |
| Client-held/federated | Remain unavailable until their dedicated designs/tests pass; no silent server plaintext delegation, key upload or configuration downgrade |

### 8.1 Users as document contributors

The owner-approved sidebar has three tabs: **Agent, Comments, Users**. **Users lists all known contributors to the current document, not logged-in or connected users.** Derive it from authorized contribution/attribution/provenance records for the viewed document/state. A disconnected contributor remains listed; connecting alone does not make anyone a contributor. This read projection is compatible with one active local human and does not enable multi-user mutation or federation.

At the top, pin **current human** and **current agent**, resolved by opaque principal identity from the authenticated human and the agent assigned to this document/editing context. They remain distinguishable from historical contribution claims: pinning someone does not assert they wrote text. If no current agent is assigned, show an explicit “No current agent” row rather than fabricate a connected agent/principal. Fixture identities are clearly labelled synthetic/display-only; a provider label, model name, MCP connection or sample chat message is not an authoritative agent identity.

Below the pinned entries, list **other contributing users/agents**, one entry per authorized principal, without duplicating the pinned principals. Deduplicate by principal ID, never display name or device. Show permitted contribution roles rather than calling every contributor a text author: author, editor, structural contributor, recorded reviewer/approver or commenter where the application's contribution records establish that role. Merely opening a document, logging in, configuring a provider or generating an unaccepted proposal is not evidence of a document contribution. Reused-source authors are included when explicit authorized provenance establishes their contribution; arbitrary linked/ancestor identities are not inferred to be authors.

“All known” includes recorded earlier contributions, including edits to content no longer present, within the viewer's authorized document/provenance/history scope. Full retained-history access is not granted by opening this tab. Return only identities/roles and completeness information the policy allows; do not reveal withheld identities or counts. A historical snapshot query binds its exact permitted state and cannot acquire contributors from newer heads. An unavailable/incomplete contributor index is reported honestly, never replaced by current presence. Queries are bounded/paginated, with navigation to all available contributors rather than silent truncation. A recoverable contributor index derives from authoritative records rather than becoming a second history authority.

Use one session-stable **distinct assigned colour per displayed principal**, including pinned entries, and reuse that palette in inline attribution and context-menu indicators. Reserve current-human red (hue 0) under the display convention in §8.2; assign the agent and other contributors different colours with collision handling. Loading later pages must not reshuffle existing colours or merge different identities. Names, human/agent kind and role labels remain necessary for accessibility; colour alone is not an identity or evidence. The Authors toggle controls inline highlighting, not whether the Users list shows contributor colours. Do not persist principal/hue maps in display cookies.

The optional `getContributors` adapter may use candidate `GET /documents/{document}/contributors`, bound to exact projection/snapshot, authorized contribution scope and cursor. Return permitted principals/roles and current-context references separately from historical contribution facts. This is a planned read model, not an implemented endpoint. `GET /documents/{document}/presence` and `GET /workspaces/{workspace}/members`, if later supported, remain separate connection/membership projections and **must not populate the Users contributor list**. Current-agent context resolution and contributor-role/completeness rules must be specified before live integration; no new graph primitive or identity model is required.

### 8.2 Authorship and context lookup

Provide an **Authors** display toggle, initially off. Attribution comes from authorized spans bound to the exact projection/source map, occurrence context and immutable revision or tentative draft sequence. A lazy `getAuthorship` adapter may use candidate `GET /documents/{document}/authorship` with that exact context and pagination/bounds. This is not an unscoped mutable author lookup or an implemented endpoint.

The contract must name the attribution role shown: recorded original contributor, last editor, importer, agent proposer, human approver and content owner are different facts. Return known, mixed, unknown or undisclosed attribution plus only permitted evidence. Presence or ownership cannot determine the author. **Importing, copying, forking or including text does not automatically make the current human its original author.** Imported material without evidence remains unknown in the relevant authorship role; the importer may be recorded separately. Newly typed bytes can carry tentative current-human draft attribution until validated publication. Do not invent coauthors or verified provenance for a visual demonstration.

Default visual convention: the authenticated current human uses red (hue 0); other known authors use session-stable hues outside the reserved red range. The palette is display state, not a principal ID, evidence or globally stable identity. Use the distinct contributor palette in §8.1, labels/role indicators and accessible contrast as well as colour; colour differences alone do not provide accessible identity. Do not persist author identities/hue maps in the display cookie. Imported unknown text must not receive current-user red merely because the document was opened by that user.

Context-menu lookup uses the **clicked source position**, not the existing selection's anchor/head. A right-click inside the selection preserves it while showing attribution for the clicked position. Keyboard invocation uses the caret context. Show an attribution header even when colouring is off or other actions are unavailable; use a safe unknown/undisclosed or mixed result where appropriate. Table cells and maths widgets map their actual clicked content back to exact source spans; repeated visible text is never a unique anchor.

Reconcile attribution through typing, delete, undo/redo, structural results and delayed acknowledgements at the same originating sequence as source mappings. Do not relabel a tentative attribution map as verified, assign all replacement text to the current user or reuse an out-of-date attribution response after editing. Attribution lookup/toggle and presence display publish no history.

### 8.3 Mathematics source and rendered presentation

Provide a **Source/Rendered** mathematics display toggle, default Source. Save/export the original Markdown/LaTeX source; generated HTML/MathML is presentation only. Support the planned delimiters `\(...\)`, `\[...\]` and `$$...$$` outside code spans/fences, including mapped table-cell source. Toggling must preserve source bytes, source ownership, draft sequence, attribution, selection and undo; it creates no save, revision or mathematical proof.

Use a locally bundled browser renderer and its CSS/fonts/license notices, embedded with the final release assets. This preview needs no CDN, TeX service, Node runtime or Rust maths-render endpoint. **KaTeX is a candidate**, not a package/version adopted by this specification; select and pin it through frontend dependency/license review before use. If selected, disable trust, apply finite size/macro-expansion/input/output budgets, isolate mutable macro state to the explicit rendering context, and escape/sanitize errors without leaking raw source into executable HTML. See the renderer's [security guidance](https://katex.org/docs/security) and [options](https://katex.org/docs/options). Accessibility output does not replace actual keyboard/screen-reader acceptance.

Invalid/unsupported formulas remain visibly recoverable as source. Widgets must map actions to exact source context even when rendering changes visual width. Escape-doubled fixture strings must not establish a production source encoding: any narrow fixture compatibility decoder is explicit, render-only and source-mapped. Do not broadly unescape/backslash-normalize stored documents or silently change legitimate LaTeX. Render success is not a mathematical correctness or Lean proof result.

Exact rendered exports bind renderer/version, fonts, options, macro inputs and other compiler dependencies in their reconstruction profile. Plain Markdown export preserves formula source and needs no formula rendering pass. No renderer asset or fixture-expression test is claimed executed by this specification.

### 8.4 Current-branch Markdown export

Keep three explicit source choices:

| Choice | Exact input and honest result |
|---|---|
| Temporary local download | Exact captured tab buffer/local sequence, including unacknowledged typing; label temporary/uncommitted, no backend persistence or durable device-write claim |
| Acknowledged draft export | Authorized draft ID, exact acknowledged sequence/generation and base composition closure |
| Committed branch/snapshot export | Opaque Hypergraph document/branch identity, exact expected head or immutable snapshot and complete permitted dependency closure |

The optional export service may use candidate `POST /exports`, `GET /exports/{export}` and `GET /exports/{export}/content` under the candidate base. Its result binds the actual input head/sequence, format, safe filename/content type, expiry and bounded download reference. A stale current-head precondition conflicts; never substitute a newer head, unacknowledged buffer or rendered HTML. Later typing stays in the editor and does not change the captured export. The browser may request a download but cannot confirm that the user has durably saved it.

For shared/nested occurrences, agree flattening versus reference-preserving Markdown, ownership/lineage disclosure, inaccessible dependencies, citations and closure semantics before claiming production export fidelity. Retain exact Markdown/LaTeX rather than scraping rendered DOM. Formatting/conversion choices are explicit export options, not hidden source edits. Resolve only authorized dependencies; export permission does not grant all history or provenance. Protect temporary artifacts and recheck download rights. Export publishes no implicit snapshot, commit or branch transition; client-held mode requires an authorized plaintext-capable client or reports unavailable.

### 8.5 Optional GitHub connection and reviewed document publication

This is a **planned, capability-gated external integration**, not an implemented service or a requirement for the first local editor. A visual dialog may demonstrate unavailable/fixture states. Neither opening it nor connecting an account creates a repository or transmits content. The application's GitHub authorization is separate from developer tools/connectors and from authorization to push this software's source repository. Those existing permissions are not document-disclosure consent.

Hypergraph branch IDs, destination Git branch names, repository identities, remote file blob SHAs and remote commit/head IDs are distinct. Review a selected Markdown document export only, not workspace directories, hidden history, graph/crypto objects, credentials or unrelated files. Production must reject fixture source/branch identities and derive the exact authorized export through application services.

Planned flow: connect explicitly → choose authorized account/repository/branch/path → select exact export source → preview bytes/diff, visibility and expected remote state → approve the frozen plan → enqueue external job → reconcile its verified result. Repository/branch creation is a separate explicit side effect with separate operation identity and expected-absence conditions; default repository creation to private, and require explicit review for public disclosure. Creation does not imply pushing. A Hypergraph commit, if needed, is a separately reviewed local action rather than a hidden prerequisite/side effect.

Optional adapter operations include `getGitHubConnection`, `beginGitHubAuthorization`, `listGitHubRepositories`, `prepareGitHubPush`, `executeGitHubPush` and `getGitHubPush`; repository creation/cancellation/disconnect are separate operations. Candidate application routes, **all unimplemented**, are relative to `/api/v1/integrations/github` and are not GitHub provider API routes:

| Surface | Candidate methods/paths and behavior |
|---|---|
| Connection/authorization | `GET /status`, `POST /authorizations`, `GET /authorizations/{authorization}`, `DELETE /authorizations/{authorization}`, `DELETE /connection`; session-owned state, cancellation/expiry/revocation, no provider credentials returned |
| Destinations | `GET /owners`, `GET /repositories`, `GET /repositories/{repository}/branches`; authorized bounded choices and exact write/visibility/head information |
| Explicit creation | `POST /repositories`; reviewed owner/name/visibility, operation ID and expected connection; new branch creation needs a separately agreed contract |
| Reviewed push | `POST /pushes/preview`, `POST /pushes`, `GET /pushes/{push}`; exact frozen source/bytes, destination/visibility, remote preconditions, approval, job/reconciliation |

The frozen plan binds account/connection, stable repository identity, destination branch/path, source head or acknowledged draft sequence, exact bytes and permitted metadata, visibility/disclosure scope, expected remote head and file SHA or explicit absence, expiry, and approval scope. Changes to a current-state precondition, destination, visibility or payload require a new preview/approval. Recheck rights, connection/account, visibility and expectations at execution. Never silently force-push or overwrite newer remote state. Validate paths against traversal/absolute paths, sensitive reserved destinations and scope expansion; a Markdown push is not permission to edit GitHub workflow/configuration files.

Choose a registered GitHub App or approved OAuth/device flow with reviewed least-privilege access, session-bound state, expiry, callback/return allowlists and PKCE where applicable. Provider scopes, endpoints and registration are implementation decisions; do not freeze a prototype's two-URL allowlist as the complete authorization design. Rust handles any provider token exchange/polling and holds credentials under the approved encrypted/keychain design. Application login, storage unlock and GitHub authorization remain distinct. Never return provider secrets or persist approval/CSRF tokens with display preferences; short-lived application tokens may live in browser memory. Cancelled/expired authorization cannot be revived by a late callback. See [official authorization contracts](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps).

GitHub writes cannot participate in an atomic local graph transaction. Use an encrypted/authenticated durable job/outbox with the approved input and explicit queued/running/succeeded/conflict/failed/**outcome unknown** states; add cancellation-requested/irreversible-result handling as applicable. Success needs a verified remote commit/result bound to that job and destination. A local response failure after provider success is not evidence that no remote write occurred. Preserve the exact operation ID, reconcile original provider evidence before another mutation, and do not assume provider correlation IDs guarantee deduplication. Equal remote file bytes alone do not prove which job produced a commit. Unknown results must remain unknown/manual-recovery-required when safe reconciliation is impossible; do not promise exactly-once external writes without evidence. Cancellation/disconnect cannot retract already disclosed plaintext or completed remote commits.

Enforce a provider-side concurrency condition matching the promised remote-head contract. Reading a head then performing an unconditional write is a check/write race; the Contents API's file blob SHA is not itself an expected branch-head condition. Evaluate a suitable atomic expected-head operation and prove its actual failure/retry semantics during implementation. GitHub documents file SHA in [Contents API](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents) and `expectedHeadOid` for [CreateCommitOnBranchInput](https://docs.github.com/en/graphql/reference/commits#createcommitonbranchinput); this does not select a provider transport or prove application crash/retry correctness. Repository creation/new-branch absence and provider visibility changes need their own explicit limitations and acceptance checks.

Require tests for denied/expired/cancelled/replayed authorization, account changes, inadequate permissions, pagination, public visibility review, stale local/remote state, creation collisions, malicious paths/URLs, rate limits, disconnect, provider success with lost reply, restart reconciliation and unchanged approval payload. No live login, repository creation, provider push or remote durability is established by a mock dialog. Client-held mode must perform approved plaintext disclosure at an authorized client boundary or report unavailable; it cannot upload decryption keys to make this integration work.

No frontend provider ID, database schema, cryptographic format, MLS transport or sentence segmentation algorithm is adopted here. Release bundling, keychain startup support and client-held trusted-client requirements remain as specified in the product/encryption documents.

## 9. Acceptance scenarios and handoff checklist

The frontend agent should deliver its interface code, an adapter boundary, synthetic fixtures and executable UI/adapter tests for these scenarios. Report which were actually run; fixtures cannot establish Rust durability/security. Tests against a real backend are required for the corresponding integration gate.

| Scenario | Expected observable result |
|---|---|
| Fixture mode and unavailable server | Persistent demo indicator; no fabricated durable save/commit; failed live connection does not fall back silently |
| Desktop editing | Four columns, outline/minimap synchronized to editor, keyboard navigation, focus/selection/IME/undo preserved |
| Delayed save 10 while typing 12 | Text 12 intact, acknowledgement at 10, draft still modified until 12 acknowledged |
| Lost save/commit reply | Original operation reconciled; no fresh-key duplicate and no false saved/committed label |
| Two editing contexts | Sequence/ack isolation; stale shared draft generation conflicts rather than overwrites |
| Repeated/nested/shared/local prose | Exact intended owners and context retained; ambiguous cross-owner edit rejected or explicitly resolved |
| Unicode and line endings | Non-BMP, combining/emoji sequences, invalid surrogate boundaries and CRLF mapping handled without silent normalization |
| Stale heading picker/proposal | Discard/remap against exact originating state; duplicate headings/rename do not retarget links |
| Table edits/source switch | Undoable mapped draft changes; view switch does not save or publish |
| Copy versus inclusion | Different labels and semantics; shared inclusion awaits real occurrence/closure service |
| Permission change, lock or incompatible capability | No stale action execution, data disclosure or fake success; unsaved-state recovery is explicit |
| Explicit commit with later typing | Frozen generation only; later local text retained or recoverable conflict, never replaced by an old result |
| Agent/comments/export/Zotero | Separate gated services and accurate labels; no implicit model disclosure, publication, anchor reassignment or external-library write |
| Untrusted markup | No script execution/active unsafe URL from source, comments or model output |
| Users/contributors | Current human and agent pinned, other recorded contributors below with distinct stable colours; disconnected contributors retained and logged-in noncontributors excluded; no duplicate pinned IDs, withheld-history disclosure or presence substitution |
| Authorship/context menu | Imported unknown authors not relabelled current human; clicked position independent of selection; keyboard/table/formula lookup maps exactly; mixed/undisclosed attribution preserved |
| Authorship styling/undo | Default off, current-human red only by authenticated identity; labels/contrast; attribution maps survive local transactions/undo and delayed replies |
| Maths display | Source default, code exclusions, exact original syntax retained; bounded untrusted rendering, source-mapped widgets, visible errors and actual accessibility checks |
| Export source choices | Temporary buffer, acknowledged draft and committed source labelled distinctly; stale-head conflict; shared/nested closure, LaTeX and safe filename preserved |
| GitHub review/recovery | No side effects on open/connect; exact approval and account/visibility/path scope; provider-side head conflict; lost-reply/restart uncertainty never produces a blind second write |
| Real integration | Create → edit → five-second idle draft acknowledgement → restart recovery → explicit commit → exact historical reconstruction; interrupted publication and index rebuild tested |
| Release/development parity | Same authorization, origin, source mapping, draft/command outcomes and bundled editor behavior through both serving modes |

Before enabling live writes, both frontend and Rust developers must agree executable DTO/error fixtures, source-coordinate/mapping behavior, authentication/unlock policy, draft durability, idempotency retention and publication recovery. Keep backend-owned decisions visible as gates; the visual design can proceed with honest fixtures while those services are developed.

## 10. Work order for the frontend agent

Start with stage A and keep the visual implementation behind the adapter in §3. Use synthetic fixtures with repeated/nested content, document-local prose, inserted text, Unicode, a small table and mapped formula source. Include pinned human/agent, other/offline contributors, a logged-in noncontributor, missing-agent and unknown/mixed authorship fixtures without inventing authenticated peers or crediting imported text to the current user. Implement controllable delayed acknowledgements, conflicts, locked/unavailable states and uncertain commit outcomes so the UI can exercise §§4–6 without real storage. Show fixture status and keep advanced live capabilities unavailable.

Deliver the interface, adapter/fixture modules, setup instructions, dependencies/licenses and the actual browser/adapter checks executed against §9. Document unanswered transport/schema questions for the Rust developer. Do not implement graph authority, invent a database/encryption format, connect a real provider, or claim real durability to make a visual control appear finished. Move to stage B only after its backend contract and acceptance gate exist.

## 11. Local frontend intake and runtime transition

Frontend development takes place in this IDE/workspace. Receive exported source/assets in the local [frontend inbox](../frontend/incoming/README.md), preserving raw input and reviewing it against this specification and the integration evaluation before adoption. An export is reference code/design, not an accepted data/storage/application architecture. Refactor or replace its internals where needed.

The initial accepted frontend runs as a separate local development server with synthetic mock document data and a typed fixture adapter. Configure browser automation/screenshots and interactive checks against the actual local page. Do not claim a working frontend, screenshots or behavior tests before an implementation runs. The eventual Rust release embeds the built static frontend and assets in one executable; the development server and browser-test tools do not become production runtime dependencies. See [frontend development](../frontend/README.md) for intake state and workflow.
