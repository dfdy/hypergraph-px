# Endpoint proposal evaluation and frontend handoff — issue 8

Date: 2026-10-24. Tracking: https://github.com/dfdy/hypergraph-px/issues/8. Scope recorded before authoring: evaluate a noncanonical design input, preserve approved product/data/security requirements and source/proof code, publish a self-contained specification for a frontend agent, and make no claim of implemented endpoints or verified prototype behavior. Feature implementation remains paused.

## Evidence and scope

Read the complete 245-line local input `SPECS/Hypergraph-PX-Rust-Endpoint-Integration.md` (31,145 bytes), SHA-256 `13263d8791dbdc327143f796cf543ed78141bca94ffa44ab265af342ed7934c3`. It is an interface-design model's proposal. It remains unchanged and ignored locally; no imported report is added under Specifications. Its references to prototype files, a 0.9.0 interface study, CodeMirror behavior, display cookie and flat draft are assertions from that document, not independently inspected frontend source.

Compared against Specifications/SPECIFICATION.md, ARCHITECTURE.md, DATA/README.md and ENCRYPTION.md, Cargo workspace membership and actual source. Runtime Rust consists of domain expansion validation and the in-memory crypto adapter only. There is no HTTP/application/draft/frontend implementation. Existing Lean proofs do not verify endpoint, editor, storage or crypto behavior. The resulting self-contained handoff is Specifications/FRONTEND_INTEGRATION.md; the evaluation stays outside Specifications.

## Findings and dispositions

| Proposal area | Evaluation | Disposition in the handoff |
|---|---|---|
| Browser/application separation, shared REST/MCP use cases, one embedded executable | Consistent with approved architecture | Retain; do not let UI recreate graph/security/publication logic |
| Proposed endpoint inventory | Honest about proposal status, but too broad for immediate frontend dependency and omits explicit document creation | Stage a fixture editor first, then a small local slice including atomic create/open/draft/commit/reconcile; advanced areas stay gated |
| Prototype filenames, library and version claims | No corresponding source was supplied/inspected | Do not make them canonical facts or select frontend libraries from them |
| Source ownership and nested occurrences | Correct requirement, but immutable bindings alone cannot describe a buffer after local typing | Bind selections to exact projection/generation/context/local sequence, track ordered edits and require Rust validation of resulting mappings |
| UTF-16 browser coordinates | Reasonable local coordinate boundary; not a storage anchor specification | Retain with a concrete UTF-16/UTF-8 example, scalar-boundary rejection, normalization constraints and tests; durable encoding remains gated |
| Fork eligibility | Complete-sentence/paragraph restrictions are described as prototype UI rules, not approved domain semantics | Do not promote them; expose backend-validated action eligibility and defer segmentation rules |
| Draft autosave and delayed acknowledgements | Correct separation from immutable history | Add explicit state machine, one-save-in-flight guidance, two-context isolation and exact sequence/generation behavior |
| Draft full replacement/client ownership map | Cannot be generally trusted for multi-owner editing | Permit only under a verified supported ownership contract; no generic overwrite-all shortcut |
| `edit_table` command discriminator | Ambiguous between saving mutable draft text and publishing history | Keep ordinary table changes in draft edits; no publication-per-cell command; rendering remains UI-only |
| Link/copy/embedding | Correctly separates copying from occurrences; needs clear user-facing distinction | Also distinguish Markdown URL formatting from durable typed relations; require exact opaque heading targets and explicit inclusion policy |
| Proposals/approvals | Correct review flow, but easy to overapply to every edit | Use for reviewed structural/agent actions; ordinary typing stays local/draft, explicit human commit freezes acknowledged generation |
| HTTP success/status list | Suggested mappings do not define semantic success, durability or safe retry | Define result/error categories first; 202/timeout/aborted fetch do not establish commit or rollback |
| Idempotency and unknown outcomes | Same-key retry is correct; retention expiry, duplicate save after generation advance and operation-vs-attempt identity need clarification | Use stable semantic operation identity, identical retries and current authorization; unknown/expired result never justifies a fresh duplicate |
| Post-command editor replacement/undo | Proposal warns against old-response overwrite but needs immutable-history undo behavior | Preserve later typing or explicit conflict; structural undo is a new authorized operation, not deletion of a committed event |
| Permissions/capabilities | Correct direction | Separate feature support, current availability and per-target eligibility; filter bootstrap/resources/events and fail closed |
| Events | Useful eventual invalidations, unnecessary initial dependency | Optional; polling/reconciliation suffices initially; events do not authorize or directly prove publication |
| Loopback, origin/CSRF, unlock | Consistent security direction, no implemented auth service | Keep security gates and separate session/unlock; add untrusted Markdown/URL rendering and cache/browser-persistence boundaries |
| Display cookie and 400-day lifetime | Prototype preference implementation detail, not product authority | Adopt safe preference contents/version/defaults only; leave mechanism/name/lifetime optional |
| Zotero local/cloud routes and provider/MCP details | Not selected contracts | Keep read-only citation intent; defer provider connection mechanisms, protocol/version, credentials and remote transport |
| Client-held encryption/federation | Correctly recognizes separate gates | Retain unavailable state and no server plaintext/key delegation; do not infer availability from REST/MCP |
| Acceptance tests | Broad and useful, but not evidence they ran | Convert to frontend-observable scenarios plus separate real-backend durability/parity gates; no runtime/UI acceptance result claimed |

## Primary technical references

Checked ECMAScript string representation, Rust str boundary documentation and RFC 9110 HTTP preconditions/status semantics; links are included beside the relevant requirements in the handoff. These references substantiate coordinate/HTTP distinctions, not the existence of project endpoints. No source library, framework, cookie retention policy or durable encoding was selected by reviewing them.

## Validation and recovery

Before publication: check every published Markdown link/code fence, consistency with approved product rules, explicit unimplemented/candidate labels, preservation of the ignored input hash, synchronized patch metadata and unchanged runtime/proof source. Existing compiled behavior is unchanged; do not add tests pretending to verify an unimplemented adapter. Record only checks actually executed. Documentation rollback changes no user data, identity, cryptographic format or protocol.

Executed validation for 0.1.5: 87 published local Markdown links/code fences, source-input preservation/hash/ignore status, specification-content scan, synchronized package/docs versions, explanatory Unicode offsets and unchanged runtime/proof source/hash passed. Cargo workspace check, formatting and whitespace checks passed. These are documentation checks, not executed frontend/backend acceptance scenarios. Publication/hosted results remain pending until observed.

## Updated proposal review — issue 9

Date: 2026-10-24. Tracking: https://github.com/dfdy/hypergraph-px/issues/9. Compared the second local input `SPECS/Hypergraph-PX-Rust-Endpoint-Integration(1).md` (325 lines, 47,985 bytes), SHA-256 `8dd5fb621d507488e51cd2afe778411ece1d5eaaade5deb5857e64722e5dc439`, with the first input and the complete current frontend contract. The unchanged original body and complete delta were evaluated; both inputs stay ignored and unchanged. Runtime/proof code remains outside this documentation increment.

The update reports an interface study 0.13.0, new presence/authorship modules, KaTeX 0.19.1, successful rendering of 77 expressions and GitHub adapter/dialog tests. Those application artifacts/test outputs were not supplied or executed here, so none is treated as verified implementation evidence. Official KaTeX and GitHub documentation was checked for renderer limits, authentication and remote concurrency distinctions; that does not verify the prototype or select a production dependency/provider flow.

### Owner decisions and compatibility

The owner explicitly approved a third **Users** sidebar tab. The owner then clarified that it must show all known contributors to the current document rather than logged-in users, with current human and current agent pinned above the other contributors, each with its own colour. This **supersedes the proposal's presence-based Users interpretation**. The current product/frontend/architecture documents and README now agree on three tabs and contributor semantics.

This is compatible with the core model: derive a permission-scoped document-contributor read projection/index from contribution/attribution/provenance, with current-context principal references pinned separately. It needs no new graph primitive, second history authority, login-based membership inference or remote-editing capability. Contributor-role/scope/completeness rules still need real record/API implementation. Earlier contributors can remain listed after their text is removed when that metadata is authorized; snapshot queries cannot disclose later contributors. Showing identities does not grant access to all retained history. A missing current agent is explicit; pinned context is not evidence of having contributed.

### Updated findings and disposition

| New proposal area | Evaluation / change |
|---|---|
| Users as active presence; separate membership route | Retain presence/membership distinction, but do not feed Users from either. Add planned `getContributors` / `/documents/{document}/contributors`, exact state/history disclosure scope, pinned human/agent, ID-based deduplication, bounded complete navigation and honest unknown/incomplete states. |
| Contributor colours | Per-owner direction, require distinct assigned colours per displayed principal, stable while paging; reuse the palette for attribution. Keep labels/accessibility and current-human red as a visual convention. Remove the earlier allowance for duplicate session hues. |
| Current human/agent at top | Resolve authenticated human and assigned document-agent context by opaque identity. Neither a provider name nor MCP connection is sufficient evidence. Pinned entries can be marked as current context without falsely asserting a contribution; unknown agent gets a placeholder. |
| Authorship spans and context lookup | Adopt exact projection/sequence/occurrence-scoped evidence, explicit role/known/mixed/unknown/undisclosed states, clicked-position lookup independent of selection, keyboard caret behavior, and source mapping for cells/formulas. This is distinct from contributor listing, content ownership and presence. |
| Blanket attribution of supplied manuscript to current human | Do not turn display assumptions into verified authorship. Imported/copied/shared content retains known attribution or remains unknown; record importer separately. New typing can be tentative draft attribution. |
| Authors toggle and colours | Adopt display-only default off, current-human red by actual principal and stable distinct contributor palette, with names/kind/roles and contrast. Do not store principal maps in display preferences. The toggle does not hide Users colours. |
| Mathematics Source/Rendered toggle | Adopt source-default, source-preserving local browser presentation, safe mapping, code exclusions, visible errors, renderer budgets and accessible fallback. KaTeX is a candidate; version/assets/license review is pending actual dependency selection. No new renderer or endpoint is implemented. |
| Doubled delimiter/brace fixture handling | Do not adopt broad source normalization or a production encoding from a fixture. Permit only explicit fixture-local render decoding with source mapping, preserving original text. Normal planned delimiter examples use single source backslashes. |
| Claimed 77-expression validation | Unverified source claim, not this project's test evidence or mathematical/Lean proof. Add future actual rendering/accessibility acceptance, not a passing count. |
| Markdown download and production export | Distinguish exact temporary tab buffer from acknowledged draft and committed/snapshot source. Bind heads/sequences/closure, reject stale substitution, preserve LaTeX and safe filenames; do not claim browser-confirmed durable device writes or implicit publication. |
| Shared/nested Markdown export | Require an explicit flatten/reference/lineage/citation policy and authorized dependency closure before fidelity claims. No default that leaks hidden provenance or silently refreshes content. |
| GitHub account/connection/push workflow | Add only an optional capability-gated external integration. Existing developer/connector access is not app authorization or document-disclosure consent. Opening/connecting does not create repositories or push content. |
| Authorization, creation and frozen disclosure review | Require registered provider flow, reviewed permissions, state/session/expiry/callback controls and PKCE where applicable; no fixed prototype allowlist/scopes. Repository/branch creation is separately approved, private by default, with distinct operation/absence semantics. Review exact content, stable repo/account, Git branch/path, visibility and source/remote expectations. |
| Local commits versus external jobs | GitHub cannot join a local atomic graph transaction. Add encrypted/authenticated outbox/job design, exact frozen approved input, separate local publication, explicit unknown/irreversible outcomes and restart reconciliation. No implementation or exactly-once guarantee. |
| Remote file SHA plus branch-head check | A preflight GET followed by a write is not atomic compare-and-set; file blob SHA is not the branch head. Require a provider-side expected-head condition matching the promised contract. Official GraphQL CreateCommitOnBranchInput has expectedHeadOid; evaluate actual operation/scopes/failure semantics before choosing it. |
| Idempotency/lost provider response | Application operation identity does not prove provider deduplication; correlation fields alone cannot guarantee it. Same bytes do not identify which job committed them. Reconcile exact job/provider evidence; retain unknown/manual-recovery when safe certainty is unavailable rather than creating a second commit. |
| Cancellation/disconnect | Cancelled authorization cannot revive through a late callback. Completed remote publication/disclosure cannot be undone by local cancellation or revocation; represent cancellation requested versus irreversible completion honestly. |
| Proposed extension routes and implementation seams | Preserve as candidate concepts under separate gates, not implemented APIs, required early-editor dependencies or canonical filenames/library choices. The minimum editor surface remains small. |

### Documentation outcome and verification boundary

Updated the existing frontend handoff with contributor/authorship, maths, export and optional external-publication subsections, plus adapter/route concepts and acceptance scenarios. Updated current product/sidebar wording, architecture, specification index and README for the explicit Users decision. General feature implementation remains paused. All endpoints/services, contributor records, rendering assets and external jobs remain planned.

Before publication verify local input hashes/ignore status, current-document consistency, safe example syntax, published links/code fences, synchronized 0.1.6 metadata and unchanged runtime/proof source. No frontend rendering, OAuth, export, push or contributor durability test is claimed executed. Documentation rollback changes no stored data or cryptographic format.

Executed validation for 0.1.6: 87 published local Markdown links/code fences, both preserved ignored input hashes, owner-confirmed contributor/sidebar consistency, normal formula delimiter examples, synchronized version metadata and unchanged runtime/proof source/hash passed. Cargo workspace check, formatting and whitespace checks passed. These do not execute the planned contributor, renderer, export, OAuth or remote-publication acceptance scenarios. Hosted results remain pending until observed after push.
