# Development state and context-compaction handoff

Last updated: 2026-10-24. Read this first when resuming, then AGENTS.md and the linked authoritative documents. This file records actual state; it does not replace the specification or make proposed features implemented.

## Workspace and authorization

Work exclusively in `/Users/diaan/Documents/Work/Sites/Hypergraph PX MU-F`, repository https://github.com/dfdy/hypergraph-px (private), branch main. The sibling retired Hypergraph PX project is reference-only; do not modify/copy its application or import runtime data/credentials. Owner authorizes successive routine implementation autonomously, GitHub issue tracking and milestone pushes. Increment SemVer before every push with new changes; retries of an identical commit need no extra bump. Preserve unrelated user edits. Current sandbox may require an authorized escalation for writes in this sibling workspace; do not interpret a sandbox boundary as a missing product decision.

## Requirements and decisions to preserve

Canonical requirements: [SPECS/SPECIFICATION.md](../SPECS/SPECIFICATION.md). Source authority: [SPECS/README.md](../SPECS/README.md). Detailed confirmed decisions: [ADR 0001](adr/0001-foundation-decisions.md). Data APIs: [technical reference](../SPECS/DATA/README.md).

- Fresh local-only, one human initially; model users/devices/groups now for later multi-user and federation. Future live coediting AND explicit branches/merge.
- Separate browser development, pure Rust domain, application authorization, storage/crypto and transport; one Rust executable embeds built frontend in releases. No runtime Node/Lean/database server requirement.
- Trusted-server encryption first/default. Passphrase startup unlock default; OS-keychain alternative also required before claiming complete initial unlock support. Login is separate. Client-held encryption is designed but unavailable until implemented.
- Future client recovery uses a user-held key; server account reset cannot recover client-only content. Browser-only and independently trusted client paths remain planned; stronger protection against a malicious code-serving host requires independently trusted client/update delivery.
- Reject expansion cycles; permit hyperlink cycles. Share workspace/document initially; all retained history requires explicit grant. Original code AGPL-3.0-only.
- Desktop contents/editor/minimap/Agent-or-Comments four-column layout; mobile deferred. No frontend library choice has been adopted yet. React/TypeScript, CodeMirror 6, shadcn/ui and optional Cytoscape.js were suggested for a separate mockup discussion only.
- Lean model proofs plus early Aeneas feasibility and selected actual-Rust proofs where supported. Maintain the [human-readable validation digest](../proofs/VALIDATION_DIGEST.md); distinguish model proofs, extracted Rust proofs and tests.
- SemVer 0.y.z policy: patch for compatible fixes/docs/proofs; minor for new runtime functionality/breaking development API. Synchronize Cargo workspace/lock, Lean package, README/spec and changelog for each milestone push.

## Published milestones and executed checks

Latest published version **0.0.3**, commit `3d7f2538696c13383bd05c1932f53831f4db8a57`. Verified pushed to origin/main. Issues 1 (foundation), 2 (Lean/extraction feasibility), 3 (version policy) closed after observing hosted success.

Implemented pure `hypergraph_domain::expansion::validate`: bounded Kahn DAG validator; five tests including all 512 directed three-vertex graphs versus an independent transitive-closure oracle. Source `crates/domain/src/expansion.rs` SHA-256 `74f2cc79679f4cc3a397f81ce68a3c758c24a520948a1954de391770c3f6b6ad` remains unchanged.

Four axiom-free Lean rank/path model theorems check with Lean 4.35.0. Actual extracted Rust private `spend` helper has a total-correctness theorem for success/error accounting and overflow safety; standard axioms propext, Classical.choice, Quot.sound; no sorryAx/native decision axiom. Full validator NOT proved: strict Aeneas translation fails on nested-loop returns and missing Iterator::filter_map model. Tool/source/dependency pins in proofs/rust/extraction.json; exact regeneration/check script scripts/check_rust_proof.py.

Hosted CI for 0.0.3 all observed completed/success:

- [Rust formatting/strict Clippy/tests](https://github.com/dfdy/hypergraph-px/actions/runs/40080895349)
- [Lean model build/environment](https://github.com/dfdy/hypergraph-px/actions/runs/40080895296)
- [Fresh Rust extraction and Lean proof replay](https://github.com/dfdy/hypergraph-px/actions/runs/40080895276)

## Active work (uncommitted)

Issue [4](https://github.com/dfdy/hypergraph-px/issues/4): first trusted-server in-memory cryptographic adapter. Planned next version **0.1.0** for new functionality. Before code, wrote [ADR 0002](adr/0002-trusted-server-envelopes.md) and [work record](work/0004-crypto-envelopes.md). Cargo workspace includes a fully implemented/tested crates/crypto adapter. Exact format/API/cost/error/security reference: [crates/crypto/README.md](../crates/crypto/README.md). No durable storage/database/service/frontend exists.

Selected initial adapter packages: chacha20poly1305 0.11.0 (XChaCha20-Poly1305, zeroize feature), argon2 0.6.0 (alloc+zeroize, defaults off), getrandom 0.4.3, sha2 0.11.1, zeroize 1.9.1. All 28 resolved external package manifests inspected before compiling: MIT/Apache-2.0 alternatives, with r-efi additionally offering LGPL-2.1-or-later (choose MIT). Dependency licenses/checksums are persisted in legal/RUST_DEPENDENCIES.json. Eight Rust tests, strict locked all-target Clippy, formatting/whitespace checks passed at 0.1.0. Actual extracted-helper replay after workspace expansion and model build after synchronized 0.1.0 metadata passed. Publication and hosted 0.1.0 checks remain pending.

Critical source finding: argon2 0.6.0 `hash_password_into` allocates private Blocks whose Drop deallocates WITHOUT zeroizing memory, despite zeroize feature. Resolved using explicitly allocated `Zeroizing<Vec<argon2::Block>>` with `hash_password_into_with_memory`; avoid claiming the default library allocation is cleared. Feature only clears selected intermediates. AEAD 0.11 uses AeadInOut and hybrid-array nonce conversion; avoid deprecated AeadInPlace. Allocate tag capacity before copying plaintext into a zeroizing Vec to avoid plaintext reallocation. Record limits honestly (stack copies/swap not fully erased).

## Next concrete steps

1. Finish documentation/link/version/dependency checks and review the diff for issue 4; all functional/proof checks above have already passed.
2. Commit/push 0.1.0; verify push and all three CI results. Fix failures with a new SemVer increment before any new push. Do not report hosted success before observing it. Update this record with observed publication/results at the next authorized increment; do not create version churn solely to record its own commit hash.
3. Then progress to keychain/application identities/authorization and authenticated durable publication/draft recovery, followed by complete desktop editor workflow. Do not treat crypto primitives as a complete encrypted workspace.

## Tooling notes (local convenience, not requirements)

Lean tools currently in /tmp/hypergraph-muf-tools/lean-4.35.0-darwin_aarch64/bin. Aeneas bundle in /tmp/hypergraph-muf-tools/aeneas-74aabd5; isolated Rustup/Cargo caches in /tmp/hypergraph-muf-tools/{rustup,cargo}. Ignored .verification contains local symlinks/caches; nothing there is a source artifact. Reproduction from clean CI uses scripts/check_rust_proof.py --download. Never change the personal default Rust toolchain or include tool caches/runtime data/secrets in Git. Local cache paths may disappear and must not block reproducible provisioning.
