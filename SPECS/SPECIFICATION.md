# Hypergraph PX MU-F — initial canonical specification

Status: initial foundation, 2026-10-24. Current application version 0.1.0 (initial baseline 0.0.1). This specification consolidates the owner's confirmed restart decisions and the mathematics/encryption design principles. The supplied original/evolved specifications and development review are historical sources; implementation claims there do not transfer to this project.

## 1. Scope and architecture

Hypergraph PX Multi-User Federated is a fresh implementation. Its first delivered application operates locally with one human. Explicit user, device, group and policy identities prepare for future multi-user and federated operation. Future collaboration must accommodate both live coediting and explicit branch/merge workflows. Internet federation and multi-user deployment are not enabled by the local milestone.

Develop the browser editor independently from Rust domain/data/storage/transport layers. Release packaging embeds built HTML/CSS/JavaScript in one Rust executable. No Node/frontend/database server or Lean process is required at runtime. Platform library/static-link requirements must be documented per release target rather than calling every build fully static.

The old Hypergraph PX directory is retired and reference-only. Do not carry forward its application code wholesale, runtime data, credentials or schema ladder. Import/migration is a separate future feature. Source and work tracking start at https://github.com/dfdy/hypergraph-px, created private. Original application code is AGPL-3.0-only; user content retains its own ownership/license.

## 2. Data and history invariants

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

Trusted-server mode is the initial implementation and default: an unlocked trusted Rust process may decrypt permitted data for editing/search/compilation and approved integrations. Support passphrase and OS-keychain startup unlock, with passphrase unlock the default. Login authentication remains distinct from storage-key unlock; keychain use is an explicit alternative. Encrypt complete historical content and sensitive derived state at rest, including manifests/provenance, indexes/drafts and backups as applicable. Encryption suites, nonce/key envelopes, master-key unlock/recovery and authenticated contexts require an explicit security design, established libraries and tests.

Client-held encryption is designed into identities, policies and execution boundaries now, but remains explicitly unavailable until implemented. In that mode the hosting server must not gain plaintext/decryption keys through configuration. Operations requiring plaintext run at an authorized client boundary or report unavailable; no silent server delegation or mode downgrade is permitted.

Authenticated workspace/group security policy controls key custody and migration; operational TOML cannot create missing decryption authority. Mode changes and re-encryption preserve logical identities and require the applicable authorization. Client-encryption recovery uses a user-held recovery key; server account reset cannot recover client-only keys. Revocation cannot erase data already disclosed to a participant.

Initial future sharing scope is workspace/document. Full retained history is shared only by explicit grant. Current-state sharing must specify dependencies/provenance disclosure and opaque/hidden inaccessible references; read permission does not automatically imply every historical key.

Keep cryptographic transport/group-key agreement separate from document synchronization, authorization, conflict resolution and archival access. MLS is a candidate for future group transport, not an adopted implementation or complete federation protocol. Reject silent security downgrades. Retain both browser-only and independently trusted client deployment paths for future client-held mode. The stronger guarantee against a malicious hosting server changing editor code requires the independently trusted client and update channel; browser-only deployments must explicitly exclude malicious client-code delivery from their confidentiality guarantee. A client/server deployment role need not imply distinct application implementations.

## 5. Editor and integrations

Retain the desktop writing direction from the supplied application design: visible styled Markdown source, whole-document caret/selection/ownership mapping, contents, editor, minimap and Agent/Comments panel. Mobile is deferred. Document-local prose and repeated/nested source ownership are part of the core source model rather than late editor exceptions.

Human and agent principals remain distinct. Context selection, model output and document instructions grant no permissions. Proposals freeze exact targets, action scope, model/actor attribution and expected state; approval rechecks current rights. Mock proposal/approval/recovery precedes live authoring. External model disclosure is explicit and mode-dependent.

Branch comparison/selected integration, anchored comments, typed reasoning annotations, graph navigation, read-only Zotero citation integration, export and shared REST/MCP interfaces remain planned product areas derived from the historical design. They have no implementation claim here. Confirm detailed milestones/contracts before enabling them; historical provider IDs/protocol revisions and configuration sketches are not fixed choices for this new codebase.

## 6. Formal validation

Keep critical validators pure and deterministic. Lean models/proofs target occurrence/expansion invariants, immutable history/provenance, snapshot determinism, authorization and key-custody transitions. Perform an early Aeneas feasibility check on representative Rust; prove selected actual Rust functions where supported.

For every property distinguish proposed obligation, checked Lean model, differential/property-test evidence and actual extracted-Rust correspondence proof. Document toolchain versions and trusted assumptions, including cryptographic libraries, entropy, I/O and client integrity. No whole-application security or Rust correctness claim follows from model-only proofs.

Lean/Aeneas are build/CI tools, not runtime requirements. Preserve a testable pure core even for functions not supported by extraction. All proof/test results must be actual executed evidence. Maintain a human-readable digest of every Lean-validated function/theorem for developer/mathematician evaluation, including its guarantee, assumptions, proof technique, exact source/toolchain and Rust correspondence status.

## 7. Initial implementation order and gates

1. Repository/issue/source reading, confirmed architecture decisions and this specification.
2. Pure constrained-graph validators and documented navigation contracts; first model obligations and Aeneas feasibility.
3. Reviewed identities/canonical object and signed/encrypted envelope design, key lifecycle, authorization and storage publication/recovery.
4. Minimal local encrypted persistence/drafts and independently developed whole-document editor, packaged/tested in the Rust executable.
5. Branch/compare/selected integration and human/mock-agent structural workflows with crash/permission/provenance evidence.
6. Remaining local integrations and hardening; future multi-user, offline exchange, federation and client-held mode through separate explicit acceptance gates.

Use a bounded issue per increment, reproducible checks, license/provenance accounting, pure-core property/differential tests, recovery/failpoint tests and real-browser embedded/development parity. Do not treat disconnected internal primitives as a complete editor milestone. The in-memory trusted-server adapter now defines versioned object/key envelope bytes in ADR 0002. This is not a complete encrypted storage mode: durable publication, policy enforcement, OS-keychain integration, the editor and federation remain unimplemented.


## 8. Semantic versioning and milestone publication

Use [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). Before each milestone push introducing new commits, increase the project version, synchronize Rust package/lockfile and Lean package metadata plus current documentation, and record the change in CHANGELOG.md. A retry of the identical versioned commit does not need another bump. Do not rewrite already published version contents or bump unrelated schema/protocol/toolchain versions.

The public contract comprises exported Rust APIs and documented behavior, and subsequently the supported CLI/HTTP/MCP interfaces and durable/import formats as each is implemented. The 0.y.z line is initial development with no stable-API promise. Project convention before 1.0: PATCH for compatible fixes, documentation/build/proof-only maintenance; MINOR (reset PATCH) for new functionality or breaking development-API changes, documenting any breaks. From 1.0: PATCH for compatible fixes/maintenance, MINOR for compatible functionality/deprecation, MAJOR (reset MINOR/PATCH) for incompatible public-contract changes. Select the largest applicable change class in a milestone. A version bump alone does not establish feature completeness or formal verification; 1.0 requires an explicitly documented stable public contract and readiness assessment.

## 9. Implementation evidence and resumable progress

Maintain [docs/DEVELOPMENT_STATE.md](../docs/DEVELOPMENT_STATE.md) as the context-compaction handoff, with confirmed decisions or authoritative links, published milestone/CI evidence, active issue and uncommitted work, actual boundaries, unresolved findings and exact next steps. Update it before significant transitions or compaction; never record credentials. Bounded issue work records retain chronological implementation/verification findings; ADRs record design reasons; the data reference and Lean digest record actual APIs and assurance. A context reset must not silently convert proposed features or unobserved checks into completed work.
