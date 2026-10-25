# Hypergraph PX MU-F — product specification

Status: current requirements, 2026-10-24. Project version 0.7.0. This document defines the approved product requirements. The architecture, mathematical model, data reference and encryption specification in this directory elaborate these requirements and distinguish implemented behavior from planned work.

## 1. Scope and architecture

Hypergraph PX Multi-User Federated initially operates locally with one human. Explicit user, device, group and policy identities prepare for future multi-user and federated operation. Future collaboration must accommodate both live coediting and explicit branch/merge workflows. Internet federation and multi-user deployment are not enabled by the local milestone.

Develop the browser editor in the local IDE/workspace independently from Rust domain/data/storage/transport layers. Begin with a separate local frontend development runtime and synthetic mock documents, with browser visual/interaction testing. Review imported visual prototypes against the frontend integration specification before adopting their architecture. Release packaging embeds built HTML/CSS/JavaScript in one Rust executable. No Node/frontend/database server or Lean process is required at runtime. Platform library/static-link requirements must be documented per release target rather than calling every build fully static.

Source and work tracking are maintained at https://github.com/dfdy/hypergraph-px, a public repository. Original application code is AGPL-3.0-only; user content retains its own ownership/license.

## 2. Data and history invariants

**Text encoding:** UTF-8 is required for document text, textual stored payloads, text API/wire representations and plain-text/Markdown exports. Encrypted objects and other binary containers remain binary; encode their text payloads as UTF-8 before encryption/serialization. Reject malformed UTF-8 at text boundaries rather than silently replacing characters. Preserve exact Unicode content and line endings; encoding does not authorize normalization. Browser UTF-16 indices are an internal coordinate convention and must be explicitly converted at integration boundaries.

The core is a typed temporal multigraph exposed through constrained projections, not one untyped graph database:

1. Stable logical content identities have immutable revision DAGs. Same-identity parents are distinct from cross-identity derivation.
2. Ordered occurrence placements identify where shared content appears. Repeated content and repeated nested manifests retain distinct binding contexts; moving a placement preserves its identity.
3. Immutable manifests record composition independently of constituent text changes. Links may cycle; accepted recursive expansion dependencies may not.
4. Transformation events record exact ordered immutable inputs/outputs, source ranges, operation parameters and provenance for extraction/fork/split/merge. Reverse lineage is derivable without rewriting sources.
5. Closed snapshots bind exact manifest and nested occurrence-selected revisions, rules/pins and compiler inputs. Historical reconstruction never follows newer heads, reruns mutable queries or refreshes external metadata silently.
6. Node, composition and snapshot history remain retained without arbitrary revision-count caps. Request/storage quotas reject work atomically rather than prune history silently. Restore appends a new state.

Distinguish content/revision/occurrence/transformation/snapshot/commit/principal/device/group identities, private content commitments and physical encrypted object addresses. Their canonical encodings and cryptographic bindings require explicit design before durable data writes. Public plaintext hashes must not leak equality across authorization/encryption domains by default.

Each traversal identifies its projection, order, context, permission scope, duplicate/cycle behavior and work/output budget. Query results are bounded and paginated. Read-only navigation and preview do not publish history. [DATA/README.md](DATA/README.md) documents actual types/navigation functions, invariants, complexity, errors and implementation evidence as they land.

## 3. Persistence and concurrency

Define one authoritative object/commit publication model with an explicitly recoverable index/read model. No mutable working file or unverified database cache becomes historical truth. A full history audit/read model must avoid redundant replay inside every helper; optimization must preserve integrity rather than trust stale authorization.

Transactions bind actor/action, exact affected owners, expected heads, policy and complete resulting dependency closure. Commit publishes content/structure/provenance/snapshot effects atomically. Changed idempotency-key reuse conflicts; uncertain acknowledgements reconcile the original request instead of silently resubmitting a fresh operation.

Five-second idle autosave persists mutable recoverable working drafts separately from immutable commits. Acknowledged drafts survive restart; autosave alone creates no revisions/snapshots/branch transitions. Explicit commit and reviewed structural/agent actions publish history. Older acknowledgements preserve newer typing, selection and undo history.

Future replicated operations carry causal and authenticated author/device/policy evidence; local publication order and timestamps are not a global federation order. A text CRDT alone does not validate structural moves. The concurrency ADR must specify deterministic acceptance/conflicts, offline operations and membership/policy changes before remote mutation is enabled.

Durability acceptance includes interrupted staging/publication, disk/write/fsync failures, corruption, index rebuilding and exact retry. No recoverability claim is made before the relevant mechanism/tests exist.

## 4. Encryption and authority

**Important medium-term priority:** encrypt and authenticate all browser-to-runtime communication, including loopback, using HTTPS and WSS where applicable. This is a gate before real-data browser integration, independent of storage/client-held encryption. Keep the current synthetic HTTP preview clearly separate. See [transport security](TRANSPORT_SECURITY.md) for certificate trust, bootstrap and acceptance requirements. This capability is not implemented.

Trusted-server mode is the initial implementation and default: an unlocked trusted Rust process may decrypt permitted data for editing/search/compilation and approved integrations. Support passphrase and OS-keychain startup unlock, with passphrase unlock the default. Login authentication remains distinct from storage-key unlock; keychain use is an explicit alternative. Encrypt complete historical content and sensitive derived state at rest, including manifests/provenance, indexes/drafts and backups as applicable. Encryption suites, nonce/key envelopes, master-key unlock/recovery and authenticated contexts require an explicit security design, established libraries and tests.

Client-held encryption is designed into identities, policies and execution boundaries now, but remains explicitly unavailable until implemented. In that mode the hosting server must not gain plaintext/decryption keys through configuration. Operations requiring plaintext run at an authorized client boundary or report unavailable; no silent server delegation or mode downgrade is permitted.

Future client-held/non-trusted mode must deny application-controlled plaintext egress at the core, including GitHub publication and document export, across all UI/API/MCP/client/background paths. Client keys, read rights and confirmation cannot bypass that mode policy. See the [future egress requirement](DATA/ENCRYPTION.md). This stricter rule supersedes earlier client-side export/disclosure allowances; it remains unimplemented.

Authenticated workspace/group security policy controls key custody and migration; operational TOML cannot create missing decryption authority. Mode changes and re-encryption preserve logical identities and require the applicable authorization. Client-encryption recovery uses a user-held recovery key; server account reset cannot recover client-only keys. Revocation cannot erase data already disclosed to a participant.

Initial future sharing scope is workspace/document. Full retained history is shared only by explicit grant. Current-state sharing must specify dependencies/provenance disclosure and opaque/hidden inaccessible references; read permission does not automatically imply every historical key.

Keep cryptographic transport/group-key agreement separate from document synchronization, authorization, conflict resolution and archival access. MLS is a candidate for future group transport, not an adopted implementation or complete federation protocol. Reject silent security downgrades. Retain both browser-only and independently trusted client deployment paths for future client-held mode. The stronger guarantee against a malicious hosting server changing editor code requires the independently trusted client and update channel; browser-only deployments must explicitly exclude malicious client-code delivery from their confidentiality guarantee. A client/server deployment role need not imply distinct application implementations.

## 5. Editor and integrations

Provide a desktop writing interface with four default columns, from left to right: (1) a contents tree of chapters, sections and subsections; (2) an editor showing styled Markdown source; (3) a document minimap labelled Navigator, supporting wheel/click/drag/keyboard navigation and current-viewport indication, hide/show and placement on either side of the editor; (4) a split sidebar with upper Interaction tabs (Agent, Comments, Users) and lower Investigation tabs (Relationships, Concepts, Sources, Provenance, History). The left navigator provides Workspace, Document, Graph and History lenses while keeping the heading tree accessible. Preserve whole-document caret, selection and source-ownership mapping. Comments are user-authored document annotations and remain separate from agent conversation. Users shows the known contributors to the current document, with the current human and current agent pinned above other contributing users/agents, each with a distinct display colour. It is a permission-scoped contribution/provenance view rather than a logged-in-user list; showing a contributor does not enable remote editing or grant historical access. Mobile is deferred. Document-local prose and repeated/nested source ownership are part of the core source model rather than late editor exceptions.

The [frontend integration specification](FRONTEND_INTEGRATION.md) defines browser/Rust responsibilities, exact selection and source-mapping rules, draft/commit state handling, staged capabilities and frontend acceptance scenarios. Its candidate endpoints and adapter shapes are not implemented or frozen wire formats.

Human and agent principals remain distinct. Context selection, model output and document instructions grant no permissions. Proposals freeze exact targets, action scope, model/actor attribution and expected state; approval rechecks current rights. Mock proposal/approval/recovery precedes live authoring. External model disclosure is explicit and mode-dependent.

Branch comparison/selected integration, anchored comments, typed reasoning annotations, graph navigation, read-only Zotero citation integration, export and shared REST/MCP interfaces are planned product areas. They are not implemented yet. Specify and validate detailed capability, provider and protocol contracts before enabling them.

The [workspace interface specification](WORKSPACE_INTERFACE.md) extends the desktop contract with independent chapter documents in versioned composite works, per-user/workspace protected provenance clipboards, explicit selection promotion, repeated paste-as-fork, pinned/live transclusion and contextual semantic assertions. Exact history, ownership, authorization and recovery are prerequisites for these durable capabilities. Clipboard previews and anchors are sensitive private state; ordinary copy never silently commits unsaved work. Lower-panel context pinning and accessible navigation are required. Zotero targets separately authenticated desktop-local REST and cloud Web API adapters, read-only initially. All these capabilities remain planned.

## 6. Formal validation

Keep critical validators pure and deterministic. Lean models/proofs target occurrence/expansion invariants, immutable history/provenance, snapshot determinism, authorization and key-custody transitions. Perform an early Aeneas feasibility check on representative Rust; prove selected actual Rust functions where supported.

For every property distinguish proposed obligation, checked Lean model, differential/property-test evidence and actual extracted-Rust correspondence proof. Document toolchain versions and trusted assumptions, including cryptographic libraries, entropy, I/O and client integrity. No whole-application security or Rust correctness claim follows from model-only proofs.

Lean/Aeneas are build/CI tools, not runtime requirements. Preserve a testable pure core even for functions not supported by extraction. All proof/test results must be actual executed evidence. Maintain a human-readable digest of every Lean-validated function/theorem for developer/mathematician evaluation, including its guarantee, assumptions, proof technique, exact source/toolchain and Rust correspondence status.

Future Word review import must match tracked changes and comments to an explicitly selected branch or snapshot, with imported contributions attributed to the virtual **Word Revision** user. Preserve immutable snapshots and review conflicts before applying to a writable branch; see [Word review import](WORD_REVIEW_IMPORT.md). This capability is not implemented.

## 7. Initial implementation order and gates

1. Repository/issue tracking, confirmed architecture decisions and current specifications.
2. Pure constrained-graph validators and documented navigation contracts; first model obligations and Aeneas feasibility.
3. Reviewed identities/canonical object and signed/encrypted envelope design, key lifecycle, authorization and storage publication/recovery.
4. Minimal local encrypted persistence/drafts and independently developed whole-document editor, packaged/tested in the Rust executable. Prioritize authenticated encrypted browser/runtime transport before connecting real document data.
5. Branch/compare/selected integration and human/mock-agent structural workflows with crash/permission/provenance evidence.
6. Remaining local integrations and hardening; future multi-user, offline exchange, federation and client-held mode through separate explicit acceptance gates.

Use a bounded issue per increment, reproducible checks, license/provenance accounting, pure-core property/differential tests, recovery/failpoint tests and real-browser embedded/development parity. Do not treat disconnected internal primitives as a complete editor milestone. The in-memory trusted-server adapter now defines versioned object/key envelope bytes in [the encryption specification](DATA/ENCRYPTION.md) and [ADR 0002](../docs/adr/0002-trusted-server-envelopes.md). This is not a complete encrypted storage mode: durable publication, policy enforcement, OS-keychain integration, the live Rust-integrated editor and federation remain unimplemented. A synthetic browser-only preview is separately runnable without authentication; its tab-only simulations do not satisfy the durable editor gate.


## 8. Semantic versioning and milestone publication

Use [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). Before each milestone push introducing new commits, increase the project version, synchronize Rust package/lockfile and Lean package metadata plus current documentation, and record the change in CHANGELOG.md. A retry of the identical versioned commit does not need another bump. Do not rewrite already published version contents or bump unrelated schema/protocol/toolchain versions.

The public contract comprises exported Rust APIs and documented behavior, and subsequently the supported CLI/HTTP/MCP interfaces and durable/import formats as each is implemented. The 0.y.z line is initial development with no stable-API promise. Project convention before 1.0: PATCH for compatible fixes, documentation/build/proof-only maintenance; MINOR (reset PATCH) for new functionality or breaking development-API changes, documenting any breaks. From 1.0: PATCH for compatible fixes/maintenance, MINOR for compatible functionality/deprecation, MAJOR (reset MINOR/PATCH) for incompatible public-contract changes. Select the largest applicable change class in a milestone. A version bump alone does not establish feature completeness or formal verification; 1.0 requires an explicitly documented stable public contract and readiness assessment.

## 9. Implementation evidence and resumable progress

Maintain [docs/DEVELOPMENT_STATE.md](../docs/DEVELOPMENT_STATE.md) as the context-compaction handoff, with confirmed decisions or authoritative links, published milestone/CI evidence, active issue and uncommitted work, actual boundaries, unresolved findings and exact next steps. Update it before significant transitions or compaction; never record credentials. Bounded issue work records retain chronological implementation/verification findings; ADRs record design reasons; the data reference and Lean digest record actual APIs and assurance. A context reset must not silently convert proposed features or unobserved checks into completed work.


## 10. Future release discovery and runtime updates

Planned; not implemented. The application should check the project's GitHub releases for a newer applicable version and notify the user. Compare semantic versions and select a compatible release artifact for the operating system/architecture; prerelease or development builds must not silently switch release channels.

Distinguish installation origin using explicit build/distribution metadata rather than the executable's location or version string alone:

- **Downloaded official runtime:** offer to download and install the release after explicit user approval. Do not silently replace a running executable or interrupt unsaved work. Verify the artifact's authenticity and integrity before installation; define safe replacement/restart, failure recovery and any storage-format migration/rollback constraints before enabling updates. The release remains one Rust executable containing the built frontend assets.
- **Self-compiled build:** notify that a newer release exists and provide its release notes/source link. Do not overwrite the developer's executable or automatically rebuild their checkout.
- **Unknown origin or externally managed installation:** use notification-only behavior until a supported installation/update mechanism is identified.

Allow users to disable automatic checks and request a manual check. A release check sends no document/workspace content, keys or credentials; network activity remains subject to the active security/egress policy. Failure to reach GitHub must not prevent local work. Scheduling, artifact signing/trust bootstrap, platform installation permissions and restart/migration mechanics require a concrete design before implementation. These requirements do not authorize publication of application source or user documents to GitHub.
