# Frontend integration specification

Status: development coordination specification, 2026-10-24. Audience: the agent building the browser interface and the developers implementing its Rust application services. Read this document with [the product specification](SPECIFICATION.md), [architecture](ARCHITECTURE.md), [data/navigation reference](DATA/README.md) and [encryption specification](DATA/ENCRYPTION.md).

The behavioral requirements below govern frontend development. Adapter concepts and candidate HTTP routes are design targets, **not implemented endpoints, a frozen JSON schema or a durable storage format**. The product specification takes precedence. Agree executable DTO/schema fixtures with Rust implementation before connecting real data. Interface-study versions, application versions and transport-contract versions are independent.

## 1. Current boundary and what to build now

The repository implements a pure Rust expansion validator and an in-memory cryptographic adapter. It has **no HTTP server, authentication/session service, draft store, publication service, frontend package or live REST/MCP endpoints**. Crypto functions are not browser API endpoints. Frontend library selection is not fixed by this specification.

Build a desktop interface against a replaceable typed application adapter. A fixture adapter may simulate the required state transitions with synthetic data; an HTTP adapter will later invoke the same application use cases. Show fixture mode persistently as **Demonstration — changes in this tab only**. Do not label fixture operations durable, committed to Rust, authenticated, encrypted at rest or restart-safe. A failed live connection must never silently switch to fixtures or report a successful save.

Do not implement the complete endpoint catalogue before a usable editor slice. Stage delivery as follows:

| Stage | Frontend work | Backend acceptance gate |
|---|---|---|
| A: visual/interaction study | Four columns, editable synthetic document, selection/undo, outline/minimap, tables, dialogs and simulated failure states | Fixture-only; no backend dependency |
| B: local editor | Create/open document, exact owned projection, draft autosave/recovery, explicit commit, error/conflict handling | Authentication/unlock design, authoritative identities/source mapping, encrypted durable drafts/publication and real recovery tests |
| C: reviewed structure | Fork/link/shared occurrence operations, history and branch comparison/integration | Exact provenance/closure, proposal/approval, atomic expected-state/idempotency and permission checks |
| D: integrations | Anchored comments, annotations, export, mock then live agent, read-only Zotero | Per-feature contracts, disclosure/credential policy, capability checks and executed acceptance evidence |
| E: remote/client-held | Live collaboration, offline exchange, federation, client-held mode | Separate concurrency, membership, policy, key lifecycle and trusted-client gates |

Comments/agent visual panels can be demonstrated in A; their persistence/live execution belongs to D. UI presence does not mean feature availability. General backend implementation is not authorized merely by this coordination document.

## 2. Desktop presentation and interaction responsibilities

Default left-to-right layout: **chapter/section/subsection contents → styled Markdown source editor → document minimap → discussion sidebar with Agent and Comments tabs**. Keep this order. Minimap navigation and current-viewport indication must stay synchronized with the same editor projection as the contents tree. Mobile responsiveness is deferred.

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

Optional server events may invalidate authorized projections or report progress. Treat them as hints to re-read/reconcile, not permission grants or authoritative editor patches. Bound resume state; sequence numbers are local to the negotiated stream/context, not global federation order. Polling/reconciliation is sufficient for the first editor contract; SSE and future MCP transport/protocol are separate gates.

## 8. Security, preferences and later integrations

Local live serving must bind loopback by default and validate Host/origin, same-origin requests and CSRF protection for cookie-authenticated mutation. Do not enable permissive CORS to connect a hosted mockup. Keep authentication, display preferences and storage unlock distinct. Server-derived actors/device authority, not submitted labels, authorize operations. Protect sensitive API responses and exports from unintended caches and logs; select exact headers, cookies and CSP in the transport/security contract before real data integration.

Display preferences may contain only validated theme, wrap width, editor font size, minimap visibility and panel widths, with a schema version and defaults for corrupt/unsupported values. Persistence mechanism, name and lifetime are UI choices, not an authentication or data format. Never store text, document IDs, drafts, proposals, credentials, keys or permission grants with preferences. Blocking preference persistence must not prevent editing. Browser zoom is separate from editor font size.

| Later feature | Required frontend boundary |
|---|---|
| Agent | Mock before live calls; preview exact disclosure, require explicit permission, keep model/human identities distinct; output is a proposal, never a self-approved command; cancellation cannot undo disclosure |
| Comments/annotations | Exact anchored source/context/state, independent from chat; show unresolved/ambiguous/stale anchors rather than attaching to similar text silently |
| Export | Bind an exact closed snapshot or explicitly labelled draft generation and compiler inputs; download is neither autosave nor implicit commit |
| Zotero | Read-only scoped lookup/selection; connection types/URLs/credentials separately specified; preserve exact cited metadata for reconstruction, no library write-back implied |
| History/branches/graph | Exact authorized projections, bounded traversals, explicit comparison/integration, no live-head substitution in historical views |
| Client-held/federated | Remain unavailable until their dedicated designs/tests pass; no silent server plaintext delegation, key upload or configuration downgrade |

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
| Real integration | Create → edit → five-second idle draft acknowledgement → restart recovery → explicit commit → exact historical reconstruction; interrupted publication and index rebuild tested |
| Release/development parity | Same authorization, origin, source mapping, draft/command outcomes and bundled editor behavior through both serving modes |

Before enabling live writes, both frontend and Rust developers must agree executable DTO/error fixtures, source-coordinate/mapping behavior, authentication/unlock policy, draft durability, idempotency retention and publication recovery. Keep backend-owned decisions visible as gates; the visual design can proceed with honest fixtures while those services are developed.

## 10. Work order for the frontend agent

Start with stage A and keep the visual implementation behind the adapter in §3. Use synthetic fixtures with repeated/nested content, document-local prose, inserted text, Unicode and a small table. Implement controllable delayed acknowledgements, conflicts, locked/unavailable states and uncertain commit outcomes so the UI can exercise §§4–6 without real storage. Show fixture status and keep advanced live capabilities unavailable.

Deliver the interface, adapter/fixture modules, setup instructions, dependencies/licenses and the actual browser/adapter checks executed against §9. Document unanswered transport/schema questions for the Rust developer. Do not implement graph authority, invent a database/encryption format, connect a real provider, or claim real durability to make a visual control appear finished. Move to stage B only after its backend contract and acceptance gate exist.
