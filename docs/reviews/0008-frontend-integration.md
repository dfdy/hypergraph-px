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
