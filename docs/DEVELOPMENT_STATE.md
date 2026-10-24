# Development state and context-compaction handoff

Last updated: 2026-10-24. **General implementation remains PAUSED. The owner separately authorized the specification publication cleanup; do not treat it as resumption of feature development.** Read this first when resuming, then AGENTS.md and the linked authoritative documents. This file records actual state; it does not replace the specification or make proposed features implemented.

## Workspace and authorization

Work exclusively in `/Users/diaan/Documents/Work/Sites/Hypergraph PX MU-F`, repository https://github.com/dfdy/hypergraph-px (private), branch main. Keep runtime data/credentials separate from source. Owner authorizes successive routine implementation autonomously, GitHub issue tracking and milestone pushes. Increment SemVer before every push with new changes; retries of an identical commit need no extra bump. Preserve unrelated user edits. Current sandbox may require an authorized escalation for writes in this sibling workspace; do not interpret a sandbox boundary as a missing product decision.

## Requirements and decisions to preserve

Canonical requirements: [Specifications/SPECIFICATION.md](../Specifications/SPECIFICATION.md). Specification map: [Specifications/README.md](../Specifications/README.md). Detailed confirmed decisions: [ADR 0001](adr/0001-foundation-decisions.md). Data APIs: [technical reference](../Specifications/DATA/README.md).

- Fresh local-only, one human initially; model users/devices/groups now for later multi-user and federation. Future live coediting AND explicit branches/merge.
- Separate browser development, pure Rust domain, application authorization, storage/crypto and transport; one Rust executable embeds built frontend in releases. No runtime Node/Lean/database server requirement.
- Trusted-server encryption first/default. Passphrase startup unlock default; OS-keychain alternative also required before claiming complete initial unlock support. Login is separate. Client-held encryption is designed but unavailable until implemented.
- Future client recovery uses a user-held key; server account reset cannot recover client-only content. Browser-only and independently trusted client paths remain planned; stronger protection against a malicious code-serving host requires independently trusted client/update delivery.
- Reject expansion cycles; permit hyperlink cycles. Share workspace/document initially; all retained history requires explicit grant. Original code AGPL-3.0-only.
- Desktop contents/editor/minimap/Agent-or-Comments four-column layout; mobile deferred. No frontend library choice has been adopted yet. React/TypeScript, CodeMirror 6, shadcn/ui and optional Cytoscape.js were suggested for a separate mockup discussion only.
- Lean model proofs plus early Aeneas feasibility and selected actual-Rust proofs where supported. Maintain the [human-readable validation digest](../proofs/VALIDATION_DIGEST.md); distinguish model proofs, extracted Rust proofs and tests.
- SemVer 0.y.z policy: patch for compatible fixes/docs/proofs; minor for new runtime functionality/breaking development API. Synchronize Cargo workspace/lock, Lean package, README/spec and changelog for each milestone push.

## Published milestones and executed checks

Latest implemented milestone **0.1.0**, commit `4705b3f863da68e55f902780876cf770a4c6636e`, verified pushed to origin/main. Current project metadata **0.1.2** reorganizes current specifications and updates their links; no runtime/proof source changes. Use git log/origin to identify the final documentation commit, avoiding self-referential version churn. Issues 1 (foundation), 2 (Lean/extraction feasibility), 3 (version policy) and 4 (crypto adapter) are completed; issue 4 closure follows observed hosted success.

Implemented pure `hypergraph_domain::expansion::validate`: bounded Kahn DAG validator; five tests including all 512 directed three-vertex graphs versus an independent transitive-closure oracle. Source `crates/domain/src/expansion.rs` SHA-256 `74f2cc79679f4cc3a397f81ce68a3c758c24a520948a1954de391770c3f6b6ad` remains unchanged.

Four axiom-free Lean rank/path model theorems check with Lean 4.35.0. Actual extracted Rust private `spend` helper has a total-correctness theorem for success/error accounting and overflow safety; standard axioms propext, Classical.choice, Quot.sound; no sorryAx/native decision axiom. Full validator NOT proved: strict Aeneas translation fails on nested-loop returns and missing Iterator::filter_map model. Tool/source/dependency pins in proofs/rust/extraction.json; exact regeneration/check script scripts/check_rust_proof.py.

Hosted CI for 0.0.3 all observed completed/success (historical proof baseline):

- [Rust formatting/strict Clippy/tests](https://github.com/dfdy/hypergraph-px/actions/runs/40080895349)
- [Lean model build/environment](https://github.com/dfdy/hypergraph-px/actions/runs/40080895296)
- [Fresh Rust extraction and Lean proof replay](https://github.com/dfdy/hypergraph-px/actions/runs/40080895276)

## Completed encryption increment and current pause

Issue [4](https://github.com/dfdy/hypergraph-px/issues/4): trusted-server in-memory cryptographic adapter, completed at **0.1.0**. Before code, wrote [ADR 0002](adr/0002-trusted-server-envelopes.md) and [work record](work/0004-crypto-envelopes.md). Actual format/API/cost/error/security reference: [crates/crypto/README.md](../crates/crypto/README.md). No durable storage/database/service/frontend exists.

Implemented chacha20poly1305 0.11.0 (XChaCha20-Poly1305, zeroize feature), argon2 0.6.0 (alloc+zeroize, defaults off), getrandom 0.4.3, sha2 0.11.1, zeroize 1.9.1. All 28 resolved external package manifests inspected before compilation: MIT/Apache-2.0 alternatives, with r-efi additionally offering LGPL-2.1-or-later (choose MIT). Dependency licenses/checksums are persisted in legal/RUST_DEPENDENCIES.json.

Eight Rust tests, strict locked all-target Clippy, formatting/whitespace checks passed at 0.1.0. Actual extracted-helper replay after workspace expansion and model build after synchronized 0.1.0 metadata passed. Fifty-five current-document local links, synchronized package versions, exact dependency inventory and unchanged proven Rust hash were checked.

Hosted CI for commit `4705b3f863da68e55f902780876cf770a4c6636e` all observed completed/success before recording the pause:

- [Rust formatting/strict Clippy/eight tests](https://github.com/dfdy/hypergraph-px/actions/runs/40082126475)
- [Lean models](https://github.com/dfdy/hypergraph-px/actions/runs/40082126469)
- [Actual extracted-Rust proof replay](https://github.com/dfdy/hypergraph-px/actions/runs/40082126476)

Critical resolved finding: argon2 0.6.0 `hash_password_into` allocates private Blocks whose Drop deallocates WITHOUT zeroizing memory, despite zeroize feature. Resolved using explicitly allocated `Zeroizing<Vec<argon2::Block>>` with `hash_password_into_with_memory`; avoid claiming default library allocation is cleared. Feature clears only selected intermediates. AEAD 0.11 uses AeadInOut, not deprecated AeadInPlace. Allocate tag capacity before copying plaintext into a zeroizing Vec to avoid plaintext reallocation. Do not claim complete erasure of compiler copies/registers/swap.

A passphrase rewrap preserves object access because it wraps the existing data key. Copied old wrappers still work with their old passphrases; replacement is not revocation. AEAD accepts authentic old objects; rollback/replay requires a later authenticated publication/head model. Key epochs alone do not rotate keys or authorize history. Client-held mode, OS-keychain implementation, full per-domain key hierarchy, identity/authorization, durable commit/draft recovery and the whole editor remain unimplemented.

## Concrete steps when the owner resumes

1. Read this handoff, AGENTS, canonical requirements and actual API/proof references. Verify git status/origin and final documentation CI with gh; preserve unrelated user changes. Issue 5 tracks the documentation publication cleanup only. No data-model ADR or next feature code has been created.
2. Before durable storage, open a bounded issue and record typed identity/immutable-history contracts: users/devices/groups, content/revision versus placement/manifest, exact snapshot bindings including repeated nested occurrences. Read Specifications/DATA/MATHEMATICAL_MODEL.md and the data reference. Existing expansion validation does not implement these records. Preliminary review only has occurred; no additional detailed model decision is accepted yet.
3. Implement/test those contracts with source ownership and exact historical reconstruction in mind; do not silently introduce live-head lookup into a snapshot. Preserve the existing expansion.rs extraction hash or explicitly review/update/reprove any change. Keep domain purity and crypto separation.
4. Progress to application authorization/key lifecycle (including the required explicit OS-keychain alternative), authenticated durable publication and crash-safe drafts, then one complete desktop editor workflow embedded in Rust. Avoid spending indefinitely on disconnected primitives. Decide publication/encoding/recovery mechanisms in an ADR before enabling durable writes; no storage choice is finalized.
5. Update technical reference, work record, validation digest for any new Lean checks, and this handoff. Bump SemVer for the next functionality milestone (normally 0.2.0 under current convention), synchronize metadata/changelog, run relevant checks, commit/push and observe CI. Never claim unexecuted tests, durability checks or proofs.

## Pause closeout

The owner requested “Finish what you're doing and then pause your processing for a while.” The 0.1.0 adapter and hosted validation are complete. The 0.1.1 documentation-only closeout records this status and pause; no new implementation increment is started. Its workflow status can be read from GitHub on resume without another evidence-only push. No credentials or runtime data are recorded here.

## Tooling notes (local convenience, not requirements)

Lean tools currently in /tmp/hypergraph-muf-tools/lean-4.35.0-darwin_aarch64/bin. Aeneas bundle in /tmp/hypergraph-muf-tools/aeneas-74aabd5; isolated Rustup/Cargo caches in /tmp/hypergraph-muf-tools/{rustup,cargo}. Ignored .verification contains local symlinks/caches; nothing there is a source artifact. Reproduction from clean CI uses scripts/check_rust_proof.py --download. Never change the personal default Rust toolchain or include tool caches/runtime data/secrets in Git. Local cache paths may disappear and must not block reproducible provisioning.

## Specification publication cleanup — issue 5

The owner authorized a self-contained `Specifications` directory containing only current specifications. Current product requirements, architecture, data/navigation, mathematical model and encryption contracts are published there; ADRs, implementation work records and proof evidence stay in their own directories. The specification index and all current links now target this directory. Source materials retained locally are ignored and are not specification authority. No Git history rewrite is part of this update.

Version 0.1.1 commit `4dd2f31368e8dcd87cee052c732c28f2c401f141` was pushed and all three CI workflows observed successful (Rust 40082444165, models 40082444104, extracted proof 40082444180). Version 0.1.2 is documentation-only; track publication/checks via GitHub rather than a self-referential evidence commit. Feature implementation remains paused after this requested cleanup.

Validation executed for 0.1.2: six current specification files, 78 published local Markdown links/code fences, source-copy byte preservation/ignore rules, excluded-tree absence from Git index, synchronized package/docs versions and unchanged runtime/proof source all passed. Cargo workspace check, formatting and staged whitespace checks passed. Hosted checks remain to be observed after push.
