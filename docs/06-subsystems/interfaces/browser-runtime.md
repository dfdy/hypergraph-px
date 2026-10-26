# Browser/runtime contract and capability gates

## Common metadata

- **ID:** `HPX-API-002`
- **Title:** Browser/runtime contract and capability gates
- **Purpose:** Browser/runtime capabilities, source ownership and versioned command boundary.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-002](<../../04-architecture/component-architecture.md>); [HPX-DOM-006](<../../05-domain/text-and-anchors.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Candidate endpoints in source contracts remain sketches. The local /api/v1 implementation is provisional and not a frozen complete wire contract.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Provider and consumers

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Version and compatibility

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Messages and type schemas

The current local listener is [runtime/src/main.rs](../../../crates/runtime/src/main.rs). It reports contract1, trusted_server/whole_document and unavailable graph/provider/client-held services. It implements provisional bootstrap/runtime/unlock/lock/documents/editor/commands/receipt/snapshot routes under /api/v1. This is a local implementation subset, not acceptance of the source proposal's complete endpoint catalogue. Origin/session/TLS and source ownership must be verified independently. The domain must not inherit wire encoding through Serde derives.

### Frontend integration specification

Source `HPX-SRC-0028`, original lines 1–8. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: development coordination specification, 2026-10-24. Audience: the agent building the browser interface and the developers implementing its Rust application services. Read this document with [the product specification](<../../03-requirements/system-requirements.md>), [architecture](<../../04-architecture/system-architecture.md>), [data/navigation reference](<domain-navigation.md>) and [encryption specification](<../security-cryptography.md>).

The behavioral requirements below govern frontend development. Adapter concepts and candidate HTTP routes are design targets, **not implemented endpoints, a frozen JSON schema or a durable storage format**. The product specification takes precedence. Agree executable DTO/schema fixtures with Rust implementation before connecting real data. Interface-study versions, application versions and transport-contract versions are independent.

The [workspace interface specification](<../document-engine.md>) refines the desktop layout, multi-document/reuse semantics and investigation workflows. Its sections define the durable clipboard/promotion/transclusion and backend gates. The owner has **resumed frontend-only implementation** and explicitly waived authentication for the synthetic test preview. This does not authorize backend services, real-data access or removal of future authentication gates.

### 1. Current boundary and staged delivery

Source `HPX-SRC-0028`, original lines 9–26. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The repository implements a pure Rust expansion validator and an in-memory cryptographic adapter. It has **no Rust HTTP server, authentication/session service, draft store, publication service or live REST/MCP endpoints**. Crypto functions are not browser API endpoints. A separate synthetic preview now uses reviewed, pinned CodeMirror 6 and KaTeX packages; its simulated state is not a Rust service or durability result. See [frontend setup](<../../09-guides/developers/getting-started.md>).

Build a desktop interface against a replaceable typed application adapter. A fixture adapter may simulate the required state transitions with synthetic data; an HTTP adapter will later invoke the same application use cases. Show fixture mode persistently as **Demonstration — changes in this tab only**. Do not label fixture operations durable, committed to Rust, authenticated, encrypted at rest or restart-safe. A failed live connection must never silently switch to fixtures or report a successful save.

Do not implement the complete endpoint catalogue before a usable editor slice. Stage delivery as follows:

| Stage | Frontend work | Backend acceptance gate |
|---|---|---|
| A: visual/interaction study | Four columns/split Interaction and Investigation panels, editable synthetic document, selection/undo, outline/minimap, table/maths presentation, attribution and simulated failure states | Fixture-only; no backend dependency |
| B: local editor | Create/open document, exact owned projection, draft autosave/recovery, explicit commit, error/conflict handling | Authentication/unlock design, authoritative identities/source mapping, encrypted durable drafts/publication and real recovery tests |
| C: reviewed structure | Multi-document/composite structure, anchored promotion, private clipboard, fork/pinned inclusion, history and branch comparison/integration | Exact provenance/closure, promotion approval, protected clipboard/receipt recovery, atomic expected-state/idempotency and permission checks; Live gated separately by resolver acceptance |
| D: integrations | Anchored comments, contributor/attribution services, annotations, exact export, mock then live agent, read-only Zotero and optional reviewed GitHub document publication | Per-feature contracts, disclosure/credential policy, capability checks and executed acceptance evidence |
| E: remote/client-held | Live collaboration, offline exchange, federation, client-held mode | Separate concurrency, membership, policy, key lifecycle and trusted-client gates |

Comments/agent visual panels can be demonstrated in A; their persistence/live execution belongs to D. UI presence does not mean feature availability. General backend implementation is not authorized merely by this coordination document.

### 3. Adapter design target

Source `HPX-SRC-0028`, original lines 47–67. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

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

### 7. Capabilities, errors and candidate transport surface

Source `HPX-SRC-0028`, original lines 135–157. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

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


## Preconditions, postconditions and errors

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Ordering, retry and idempotency

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Authentication and authorisation

Browser/runtime capabilities, source ownership and versioned command boundary. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Examples and conformance tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 1–8; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 9–26; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 47–67; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 135–157; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.

## Current adapter retry and lock behavior, 2026-10-25

The tab retains a frozen operation ID/request until an exact receipt is reconciled. Transport retries reuse identical bytes; HTTP failures are surfaced without inventing another operation. Receipts must match operation, document, result kind, captured sequence and next generation before local acknowledgement advances. Retrying an uncertain commit at the same captured sequence reconciles its original receipt rather than publishing another revision. Pending document creation is likewise retained and must be reconciled before a different create intent.

Each document queues captured saves/commits independently. Later typing and other documents are never overwritten by delayed replies. Lock first suspends edits, drains queued document changes and creation, then requests the idempotent server lock. Save failure restores editability while retaining source and pending operations; an unknown lock outcome keeps editing suspended until lock is confirmed. Cached editor states remain read-only while switching documents during lock. This is tested with injected transports and synthetic browser UI; trusted HTTPS/restart acceptance remains pending.

CodeMirror LF coordinates are a display projection. An owned-source state field maps changes against the exact previous source, retains unchanged CRLF/LF/CR and Unicode, preserves raw paste/copy/download, and records exact undo/redo source effects. Routine Enter adopts the nearest preceding source newline convention, then following, then LF for a new buffer. Navigation uses display coordinates. Stale/ambiguous mappings and split scalar ranges are rejected. This supports only the initial one-owner document buffer, not multi-owner whole-buffer replacement.

## Request-boundary enforcement, 2026-10-25

The current runtime bounds complete headers to 16 KiB, including fragmented reads; body declarations remain bounded to 14 MiB and duplicate framing fields are rejected. Header delimiter scanning is linear. A single ten-second deadline covers underlying socket reads/writes through TLS and is checked before a queued route starts. It does not cancel an already executing storage/KDF operation; unknown outcomes still reconcile via the same operation ID. Host/Origin/session parsing removes only HTTP ASCII optional whitespace, and duplicate __Host-hpx session cookies fail closed. UTF-8 document content remains unchanged.

[Current tests](../../registers/tests.csv) include 24 real transport/startup checks run without browser automation against isolated temporary servers. The TLS client trusts only the approved leaf, checks its exact DER hash, retains normal chain/hostname verification and uses Node's documented [partial-chain trust option](https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions) for that explicit leaf anchor. This changes no OS/browser trust store and is not a certificate-warning bypass. It does not establish clean-profile browser renewal/expiry acceptance or a full platform matrix.

## Explicit local keychain routes, 2026-10-25

The owner-approved [ADR014](../../04-architecture/decisions/0014-keychain-unlock-policy.md) adds these routes to the existing trusted-server contract 1. All require the authenticated cookie, exact same HTTPS origin/Host and JSON content type. Each POST body is the strict empty object `{}`; secrets are generated/used only in Rust. No path, workspace ID, native account, raw key or device secret is returned.

| Route relative to `/api/v1` | Result and conditions |
|---|---|
| `POST /keychain/status` | Credential-free `supported`, `schema`, `enrolled`, `cleanup_pending`; available while locked, with no native read/prompt |
| `POST /keychain/enroll` | Requires unlocked owner; verified backup and explicit upgrade before schema-1 enrollment; returns `enrolled` and `backup_created` |
| `POST /keychain/remove` | Requires unlocked owner; deletes DB wrapper before native item; returns enrollment/cleanup status |
| `POST /unlock/keychain` | Explicit native read/unlock only; shares passphrase attempt throttling; never runs automatically |

Runtime metadata includes the pure `keychain_supported` capability. macOS is the current native implementation; other platforms report unavailable and retain passphrase unlock. Startup stays locked even when enrolled. The browser quiesces edits/queued writes before enrollment/removal and reconciles a lost reply through credential-free status instead of generating or resubmitting secrets. Native denial/cancellation, missing/existing items, unavailable provider, failed backup and pending cleanup have bounded non-sensitive codes. Lock always drops unlocked keys and transient cleanup handles; retry pending cleanup before lock/exit if possible. A crash-created orphan cannot be silently replaced on reenrollment. Old backups may retain earlier access; this does not implement revocation or erasure.

## Read-only history and exact historical ranges, 2026-10-25

Contract 1 gains authenticated same-origin JSON POST routes `/history` and `/anchor/resolve` relative to `/api/v1`. Both require an unlocked workspace, reject unknown fields and use current sole-owner authorization. `/history` accepts `{document,next,limit}`: `next` is null or the inclusive next revision32 and limit is 1–32. It returns `{document,entries,next}` with the exact local publication metadata described in the [navigation reference](domain-navigation.md). The frontend defaults to 12 entries per page. Ordinary draft saves do not publish history, and browsing never commits a draft.

`/anchor/resolve` accepts `{document,snapshot,revision,occurrence_path,start_byte,end_byte}` with exact opaque references and half-open UTF-8 byte offsets. The current one-occurrence adapter checks the supplied historical snapshot and returns only `{text}`. It does not accept a client ownership map or infer an immutable revision for uncommitted text. Invalid ranges/paths return invalid-request errors, a mismatched revision returns conflict, missing exact objects fail, and locked/session/Origin/Host gates remain in force. These additive read-only routes do not change database/envelope versions or authorize cross-workspace access.

## Protected clipboard subset, 2026-10-25

The authenticated unlocked trusted-server capability `private_clipboard` provides `POST /clipboard` with strict `{generation,offset,limit}`. First-page reads use null generation and offset 0; later offsets require the previously returned generation. Limits are 1–16 and private capacity is 128 references. Responses contain generation, total, entries and next offset. Each view entry contains `id`, `available`, `source`, `preview`; unavailable source entries return only the opaque ID with null source/preview. The stored private record is still authenticated; inaccessible, missing or damaged historical sources do not disclose cached previews, and removing an opaque entry remains possible.

Writes use `/commands` and existing frozen operation IDs: `{command:clipboard,mutation:...}`. Mutation actions are `capture`, `remove`, `clear`. Every action binds the expected private generation. Capture includes the exact source binding, an exact quote for validation, and an optional expected draft generation/acknowledged sequence. For editor captures the whole acknowledged buffer must equal the supplied committed revision; a draft change is not relabelled as immutable source. Historical captures can omit draft context and still require verified snapshot/revision/path/range and current permission. No implicit source commit or promotion occurs.

Clipboard receipts have outcome `{result:clipboard,state:{generation,entry,count}}`. Entry is populated for capture, null for remove/clear. Retrying the identical operation/body returns its original result. Lost replies retain the frozen request; UI retries reconcile it before another mutation. Known precondition failures require explicit refresh/retry, never silently clearing a newer clipboard generation. Lock/keychain quiescence drains accepted private operations alongside document work. The browser stores no private entries in localStorage/cookies.

The initial UI captures acknowledged committed selections, inspects exact read-only source, restores references after unlock/restart, and supports generation-bound removal, clear, refresh and more entries. Paste-as-fork, structural promotion, multi-owner mappings and merge publication remain unavailable. The native OS clipboard remains separate. This is one principal/workspace under the current sole-owner trust model, not selective shared-key grants for future collaborators.

## Independent committed-source Fork, 2026-10-25

The additive trusted-server capability `fork` enables `/commands` with `{command:"fork",plan:{title,source,expected_draft,quote}}`. Source uses the exact clipboard binding above. Title must be nonblank and at most 512 UTF-8 bytes; selected text is nonempty, scalar-aligned and bounded by the existing document limit. Quote must equal the exact historical bytes. Editor inputs include the acknowledged draft generation/sequence, and the entire acknowledged source must equal its pinned committed revision. No implicit source save, commit or structural promotion is performed. Explicit historical requests may use null draft context while retaining all snapshot/scope/range checks. Current sole-owner authorization applies before receipt replay and publication.

The receipt outcome is `{result:"forked",document,transformation,revision,snapshot}` with independently allocated opaque identities. The frontend retains the frozen operation/body after unknown replies, malformed receipts or failed output-editor reads. “Retry fork” reconciles that operation before a different fork intent. A known HTTP precondition rejection releases its failed intent for explicit selection/review. Successful registration opens the independent document without reloading or replacing other cached editor buffers. Lock/keychain quiescence reconciles accepted pending Fork operations before dropping authority.

Authenticated unlocked `POST /derivation` accepts strictly `{document}` and returns the immutable fork derivation described in the [record reference](../../07-implementation/data-structures/sqlite-records.md#optional-immutable-fork-derivation-2026-10-25). A document without a recorded derivation returns 404; this says nothing about original authorship. Missing/corrupt source or output bindings fail rather than being replaced with current text. The read checks both pinned snapshots, occurrence/node/revision/range bindings and exact initial output bytes. The Provenance panel inspects this input through the existing read-only anchor route. This is bounded one-input/one-output Fork, not a reverse lineage search, multi-input Merge, shared embed, or private-clipboard paste publication.

The same Fork command also supports the protected clipboard's exact-source inspection dialog: an explicit “Fork captured source” name/review uses the retained historical binding with null draft context. It does not substitute the current editor head, save newer source typing, consume the reference or paste into an existing document. Pending replies use the same frozen Fork recovery path. Missing/inaccessible source still fails closed at publication even if a previous preview was available.

## Read-only committed snapshot comparison

History comparison uses the existing authenticated immutable history/snapshot reads. It first captures the latest committed history entry, then fetches that exact snapshot and the selected historical snapshot. The two read-only columns preserve exact source strings and report UTF-8 sizes and byte equality. New commits cannot redirect either pinned lookup after capture. Current draft bytes are excluded, and no save, commit, restore, merge or graph publication occurs. Navigation/lifecycle changes discard late results. This is a source inspection view, not an automatic merge or semantic equivalence checker.

## Bounded document/Fork graph projection

The additive capability `document_fork_graph` provides authenticated unlocked `POST /graph` with strict `{documents:[document32,...]}`. Choose 1–16 distinct document IDs; unknown fields, malformed/duplicate IDs and over-limit/empty selections fail. Current sole-owner/device authority and the entire requested catalog scope are checked before returning a result. All selected nodes, current committed contexts and historical Fork records are read in one consistent SQLite transaction. No graph layout, source, history, reference or receipt is written.

The response is `{projection:"document_forks",nodes,edges,inputs_outside_selection}`. Nodes retain requested order and contain `document`, logical `node`, current committed `revision`, `snapshot`, and title. Equal labels never merge identities. Edges are the existing validated immutable Fork derivations, with exact historical input and initial output bindings; current node contexts may be newer. Only edges with both document endpoints selected are included. `inputs_outside_selection` counts selected output documents whose recorded input lies outside the selection; it is not a count/search of all unselected outgoing relationships. Existing damaged/missing endpoint records fail the whole query rather than being rendered as disconnected nodes.

This is an induced **document/Fork subset**, not the full semantic/reference hypergraph. It supports one input and one output per existing Fork record; no arbitrary n-ary query is advertised. Reads are bounded by 16 selected nodes, at most 16 candidate Fork events and the existing per-object/document limits. Valid text validation may read up to three 2 MiB revision payloads per selected node plus bounded metadata; it is not a graph-wide unbounded traversal or a hard real-time guarantee. Current schemas, encrypted records, envelope and HTTP contract number remain unchanged.

The UI separates graph checkboxes from editor selection, draws labelled circles and direction-labelled historical Fork connectors, and provides keyboard/text alternatives and exact read-only source inspection. Selection changes invalidate pending results immediately; late replies cannot restore the previous graph. Closing restores focus without dispatching editor source/selection transactions. The view states that semantic relationships and connections to unselected documents are outside its supported scope. General selected-node semantic/n-ary graph acceptance remains open under HPX-RQ-029.

## Document creation without page replacement

After an exact Create receipt, the active workspace tab can read/register the new editor and open it without reloading. Unknown command replies and failed/malformed editor reads retain the original frozen creation request until registration is reconciled. “Retry new document” repeats that intent, rather than prompting for a different operation or creating another document. Existing other documents' source buffers and acknowledgement sequences remain intact while creation is in flight; registration does not force-save all cached buffers. Ordinary source checkpointing on a subsequent document switch remains separate. Lock/keychain quiescence reconciles pending registration before dropping authority; newly registered documents are synchronized into navigation without replacing existing editor states. Tab reload recovery for arbitrary unacknowledged typing remains outside this guarantee.

## Versioned retrospective semantic assertions

The trusted-server capability `semantic_assertion_overlay` enables the separately versioned view adopted in [ADR010](../../04-architecture/decisions/0010-semantic-annotation-snapshots.md). `POST /assertions` accepts strict `{document,snapshot,generation,offset,limit}`. It requires the authenticated unlocked sole-owner context, an exact existing text snapshot for that document, limits 1–8, and a bound generation for offsets beyond zero. The response contains document/snapshot, `text_snapshot_scope:"semantic_assertions_excluded"`, overlay generation/total/entries/next. Entry carries immutable assertion revision, current head generation, record and captured predicate definition/version. New reviews invalidate old cursors; missing/damaged source or unsupported records fail rather than being read as an empty overlay. Current text snapshots are never rewritten to include annotations.

Commands use the existing frozen operation/receipt route with `{command:"assertion",mutation}`. Create mutation contains `action:"create"`, predicate selection, ordered role-labelled participant inputs and declared properties. Registered selection uses `{kind:"registered",choice:<existing opaque wording ID>}`; the server resolves canonical identity, captures its exact definition and normalizes inverse/symmetric roles through the pure domain plan. Explicit owner declarations use label, description and role definitions with a new local predicate identity; a pinned captured definition object can be reused explicitly. Equal custom words alone do not collapse identities. Each participant supplies exact source binding, quote and optional acknowledged draft precondition. Uncommitted editor source is rejected before publication; no implicit save, commit or promotion occurs.

Review mutation contains `action:"review"`, assertion `node`, exact current `revision`/`generation`, and `status` (`accepted`, `rejected`, `superseded`). It appends a same-node immutable review revision; it never rewrites participants, previous judgement or text. Receipt outcome is `{result:"assertion",state:{node,revision,generation,status,deduplicated}}`. Deduplicated creation returns the existing current judgement without resetting it. Unknown replies retain the frozen body/operation; exact replay precedes another intent. Current authority is checked before replay. Lock/keychain quiescence drains accepted assertion operations, and private mutation bodies are not persisted in browser storage.

The first UI proposes relationships between two complete adjacent committed sentences/paragraphs/sibling sections and offers exact participant inspection plus explicit review. It follows the caret only when owned source and the participant's exact snapshot/range still match. “Show all retained assertions” explicitly inspects retrospective claims from earlier source versions; it does not relocate them onto edited text. Creating/reviewing annotations makes no editor transaction and publishes no text revision. The role-labelled representation supports 2–8 participants, including repeated premise roles. The additional captured-source composer described below has passed integrated synthetic verification. Assertion-to-assertion references remain unavailable; the selected semantic incidence projection is described separately below. Neither declared certainty nor owner acceptance is checked logical proof. Lean conversion remains deferred.

## Selected retrospective assertion incidence graph

The additive `semantic_overlay_graph` capability provides `POST /graph/overlay` with strict `{nodes:[selection,...]}`. A selection is `{kind:"document",document}` or `{kind:"assertion",node}`. Choose 1–16 distinct logical nodes; current owner/device and every selected assertion's source/index authority are validated in one SQLite read transaction. Unknown node families, duplicate identities, missing/corrupt objects or authority failures reject the whole query. There is no partial success disguised as an absent relationship.

The response has `projection:"retrospective_incidence"`, explicit excluded text-snapshot scope, typed node contexts, edges and an `outside_selection` count. Document contexts capture current committed revisions/snapshots; assertion contexts capture exact immutable assertion/review revisions, definitions, qualifiers and recorded status. Historical participant ranges can differ from the current document version and are not relabelled as current text. Fork edges retain their existing immutable event; participant incidences name assertion node/revision, ordered participant index, role and exact source binding. Repeated premise roles and repeated source nodes stay distinct incidences. One n-ary assertion stays one ordinary identifiable revisioned node, not a clique of independent binary claims.

Only selected endpoints are drawn. Boundary counts concern supported incidences of selected nodes, not a scan of all unselected outgoing references. A query validates at most 64 distinct assertion participant source bindings, failing with a limit error beyond that work budget; current document/Fork checks retain their own bounded reads. Queries publish nothing and do not reject reference cycles as if they were recursive document expansion. General concept/reference families, shared authority and semantic snapshot closure remain outside the current projection.

Graph selection can load bounded retained assertion pages from any listed document. The actual graph captures its own consistent current view when requested; loading choices does not change text or its selection. The renderer distinguishes role incidence from historical Fork arrows, shows assertion qualification/status without claiming proof, offers keyboard/text alternatives and exact historical range inspection, and discards stale replies after selection changes or close. Unicode labels are fitted for display without changing their identities or underlying source.

## Exact assertion judgement history

The additive `assertion_review_history` capability provides authenticated unlocked `POST /assertion/revision` with strict `{node,revision}`. The response is `{text_snapshot_scope:"semantic_assertions_excluded",entry}`. It resolves only that immutable assertion revision; current-head substitution and missing-object fallback are forbidden. Current owner/head, document indexes and participant-source permissions are revalidated. The record's origin receipt binds its node/revision/status/ordinal; a review's exact same-node parent must retain the same definition/participants/properties and have the immediately prior publication ordinal.

The UI navigates Earlier/Later judgement through exact parent revision IDs, retaining its opening revision rather than silently following a later head. It caches navigation references and fetches one bounded revision per action, with no revision-count retention cap or source write. Exact participant inspection remains available for older judgements. Missing receipts, cross-assertion revisions, changed permissions and unsupported versions fail explicitly. This is annotation history under ADR010, not an insertion of later claims into an old text snapshot and not a new proof-verification result.

## Reviewed captured-source declarations

The captured-source composer connects the existing explicit-declaration command to protected clipboard references. Each of 2–8 ordered participants has an owner-entered role and a reviewed exact historical source preview. Repeated roles and repeated source identities remain distinct incidences of one proposed assertion. The declaration records name, meaning, scope/premises, attribution, certainty and polarity; separately declared predicates receive separate identities even when their labels match. This is a manual contextual claim, not inferred truth or proof.

Only available committed captures can be chosen. More captures can be loaded through the existing generation-bound private pages; each chosen source resolves its exact revision/snapshot/occurrence/byte range. Captured historical participants use null draft preconditions and are revalidated by the same authorized server command; later source typing neither relocates the input nor forces a commit. The combined quoted input remains bounded to 2 MiB. Creating a claim leaves the source buffers and clipboard entries intact. No new storage kind, schema, capability or command format is added.

Source fetches are invalidated after changing a selection, removing a participant or closing review. Cancel publishes nothing. Publication freezes the complete reviewed declaration before queueing. An uncertain acknowledgement retains the original operation and disables a replacement submission; closing review exposes the shared Retry assertion operation control. This extension's actual integration and visual evidence is recorded separately in the development-state and test registers.

## Reviewed new-document Merge

The additive `reviewed_merge` capability enables existing authenticated `POST /commands` with `{operation,request:{command:"merge",plan:{title,text,inputs}}}`. Each ordered input is `{source,expected_draft,quote}` using the same exact Source and draft-precondition representations as Fork. Require 2–8 inputs, aggregate quoted UTF-8 length at most 2 MiB, nonempty reviewed output at most 2 MiB, and nonblank name at most 512 UTF-8 bytes. Existing 14 MiB encoded HTTP body limits remain in force, so escaping overhead can cause an otherwise byte-bounded plan to be rejected before publication. The browser rejects oversized encoded plans before creating pending intent.

The receipt outcome is `{result:"merged",document,transformation,revision,snapshot}`. Frozen commands survive unknown acknowledgement and failed output-editor registration; Retry merge reconciles the original operation before opening one registered document. Distinct deliberate operations create distinct identities. Lock/keychain quiescence reconciles pending Merge before dropping authority. No operation body is stored in browser persistence.

Authenticated unlocked `POST /merge` takes strict `{document}` and returns the versioned optional synthesis derivation described in the [storage contract](../../07-implementation/data-structures/sqlite-records.md#optional-reviewed-synthesis-derivation-kind-17-record-version-1). It names exact ordered historical inputs and the initial output, with explicit unknown original source authorship. The read checks current permission and immutable publication/receipt binding. Missing evidence is not replaced with current-head content.

The Merge review uses protected clipboard references and an owned-source editor retaining exact Unicode/mixed line endings through paste, editing, copy and undo. Source previews and reviewed output are separate; cancel publishes nothing. Publication freezes the reviewed plan and creates a new independent document, preserving source buffers/clipboard entries. Provenance offers read-only exact input inspection. The current graph explicitly excludes Merge edges; it remains a document/Fork and assertion incidence projection. Same-identity branch merging, automatic conflict resolution and provider-driven synthesis remain future scope.

## Selected transformation incidence graph

The additive `transformation_graph` capability exposes strict authenticated unlocked `POST /graph/transformations` with the existing `{nodes:[document-or-assertion selection,...]}` shape. It returns `projection: transformation_incidence`, the existing explicit excluded text-snapshot scope, selected node contexts, grouped edges and `outside_selection`. Existing `/graph` and `/graph/overlay` responses remain unchanged; the browser explicitly chooses the broader relationship scope.

A new edge is `{kind:"merge",event:<retained reviewed synthesis derivation>}`. Its one transformation ID retains all ordered historical inputs and the exact initial output; it is not a set of independent binary assertions. Read each selected output's optional Merge record in the same current-authority SQLite read view used for selected documents/Forks/assertions. A present but corrupt, missing-dependent or wrong-scope derivation fails rather than inventing a disconnected document. The shared Merge read validator checks exact sources, publication and Merged receipt. Absent optional Merge records remain ordinary unrelated document contexts within this supported projection.

Choose at most 16 distinct content nodes. Merge input and initial-output bindings share the 64-distinct-source work budget with assertion participants; overflow fails the entire query. Current document/Fork reads retain their separate existing bounds. For a selected Merge output, each unselected ordered input contributes one outside-selection incidence, including repeated inputs. The full authorized transformation remains inspectable, while the canvas draws only selected content endpoints and a smaller labelled transformation connector. Selecting only inputs does not trigger a scan of all unselected outgoing derivations.

The renderer shows ordered input labels and a directed output connector, with keyboard and text alternatives. Exact initial output and input inspection remains available after later source/output edits. A connector represents recorded synthesis, not an additional selected content identity, proof or original-authorship claim. Closing or changing graph selection/scope invalidates pending replies. This read-only extension adds no persistent records, database/record version changes, publication, provider connection or source/editor transaction. Actual evidence is recorded in the test register and development state.

## Snapshot-bound publication contributors

The additive `publication_contributors` capability exposes authenticated unlocked `POST /contributors/publications` with strict `{document,snapshot,cursor,limit}`. The requested exact text snapshot selects the first publication; subsequent pages follow only its retained immutable ancestry. `cursor` starts null and thereafter carries the opaque encrypted continuation returned by the server. `limit` is 1–32; reads share the existing history object's 16 MiB page budget. Empty, malformed, over-4096-byte, tampered, cross-document or cross-snapshot cursors fail. Newer heads never silently replace the requested historical view. Every page rechecks current owner/device and document authority in one SQLite read transaction.

Responses identify `projection: text_publication_contributors`, exact document/snapshot, `current_human:{principal,label}`, `current_agent:null`, `publications`, opaque `next`, `complete_text_publications`, `complete_contributors:false` and explicit `excluded_families`. Each publication has principal, exact revision/snapshot/operation and `role: publisher`. Pinning the current human is authenticated context, separate from contribution evidence; this runtime has no assigned agent and must not fabricate one from a provider/model label. A publisher is not necessarily the original text author. Other historical principal kinds/display names remain unknown where the records do not establish them.

This is an explicitly **incomplete contributor projection**. Original text authorship, semantic reviews, comments and interaction records are excluded. Reaching the oldest text publication completes only this snapshot's text-publication ancestry; it does not establish a complete contributor index or absence of other contributions. No presence, membership, source-author inference, shared authority or historical-key grant is introduced. The Users tab pins the current human and an explicit No current agent row, deduplicates loaded publishers by full principal ID, exposes older evidence and reports excluded families. Principal colours remain session-only and stable across later pages; source/selection/undo and the Authors preference remain independent.

Continuation tokens are nonpersistent version-1 authenticated records under the separate `1000001` cursor context and owner-derived address, bound additionally by workspace/epoch in the existing envelope. The plaintext contains only document/snapshot/next-revision identities. Tokens survive a permitted restart but confer no access without current authentication/unlock/authorization. They are never inserted into objects/slots; persistent kinds1–17 and existing schemas/payloads remain unchanged. The shared history read helper preserves existing history-route behavior and fail-closed object/event/snapshot validation.

### Inspecting loaded publication evidence

Each publisher row can inspect its already loaded facts through a read-only evidence dialog. It pages eight records at a time locally and resolves exact historical snapshots through the existing protected snapshot route. This does not enumerate additional principals or silently broaden the query scope. Closing the evidence view, changing its local page or losing the originating context invalidates delayed snapshot replies. Historical source is inserted as text, never interpreted as active HTML; publication evidence does not establish original authorship.

## Exact snapshot client validation

The frontend RuntimeAdapter snapshot read freezes its document/snapshot identifiers before handing the request to transport. Returned source must be a well-formed Unicode string within the existing 2 MiB UTF-8 document bound; invalid responses fail before read-only inspection or download. The returned text record is detached from transport-owned response objects. This preserves the existing `{text}` route response, exact source/newline bytes and storage/protocol versions; response text alone is not an independent cryptographic provenance proof.

## Desktop graph scrolling

The selected-node graph dialog keeps its node chooser and graph/inspection region independently scrollable, within the desktop dialog bounds. The inspection region is named and keyboard-focusable; reaching older choices or textual relationship inspection does not move the other pane or the dialog action row. Graph selection, exact-source lookup, view invalidation and editor source/selection/undo contracts are unchanged.
