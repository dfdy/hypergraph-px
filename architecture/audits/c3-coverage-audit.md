# Executable C3 responsibility coverage audit

- **ID:** `HPX-ARCH-011`
- **Title:** Executable C3 responsibility coverage audit
- **Purpose:** Cover each Rust-engine overview block with an evidenced focused C3 view, preserving existing decompositions and unresolved proposals.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; development agent records
- **Applies to:** V3 architectural modelling; current single Rust executable and separately labelled future integrations
- **Upstream authority:** [component architecture](../../docs/04-architecture/component-architecture.md), [workspace contract](../../docs/06-subsystems/workspace-storage.md), [crypto contract](../../docs/06-subsystems/interfaces/crypto-adapter.md), [ADR014](../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md), [integration specification](../../docs/06-subsystems/external-integrations.md), [owner decisions](../../docs/02-governance/OWNER_DECISIONS.md)
- **Downstream dependencies:** [five focused C3 views](../C3/remaining-c3.c4), [coverage/source/test inventory](../evidence/c3-coverage-inventory.json), existing C3/C4/workflow views
- **Verification:** [executed modelling checks](../evidence/c3-coverage-validation.json); application test sources reviewed, not executed
- **Decision/history:** Owner requested missing focused C3 diagrams on 2026-10-29. Logical decompositions are proposed source interpretations, not new modules, services, accepted V3 design or runtime acceptance.
- **Last reviewed:** 2026-10-29


Current diagram names and visual entry points are listed in the [navigation map](../navigation.md); earlier checkpoint titles below retain their historical scope.


## Coverage and navigation

The inventory starts with the **eight leaf responsibility blocks visible inside the Rust executable** in `c3_executable`. The executable boundary, Hypergraph presentation group and external C2 context are excluded. Internal elements revealed by a focused view do not recursively expand this task into further diagram requests.

| Engine overview block | Focused C3 view | Disposition / scope |
|---|---|---|
| Runtime and API | `c3_runtime_api` | Reused: startup, secure transport/request gates, API and workspace lifecycle. |
| Frontend delivery | `c3_frontend_delivery` | Reused: build-time preparation/embedding, native static delivery and browser bootstrap. |
| Pure domain | `c3_pure_domain` | Reused: supplied-input pure rules and explicit adapter/test boundaries. |
| Application coordination | `c3_application` | Added: admission/current scope, original-operation replay, feature coordination, atomic publication and direct protected reads. |
| Workspace persistence | `c3_workspace_persistence` | Added: supported opening, adapter record/envelope boundary, immutable/mutable SQLite state, retained reads and bounded audit. |
| Keychain adapter | `c3_keychain` | Added: explicit lifecycle, same-workspace unlock, native provider, verified upgrade copy and cleanup handling. |
| Cryptographic adapter | `c3_crypto` | Added: managed secrets/entropy, record authentication, wrapping, bounded derivation and the standalone address helper. |
| Integration adapters (planned) | `c3_integrations` | Added proposal: six existing planned roles and their specified context/policy relationships. No implementation is implied. |

Existing API C4 views expose code/route families, not these focused C3 decompositions. A keychain or crypto context box in another view likewise does not cover its internal responsibilities. Every overview block now links to its focused C3; relevant runtime/domain context links point onward to the new views. Existing C4 and Commit/Unlock/uncertain-result sequences are reused. **No C4 view is added.**

## Evidence and responsibility boundaries

### Application coordination

[Workspace methods](../../crates/storage/src/lib.rs) and [authority checks](../../crates/storage/src/authority.rs) host these responsibilities today. There is no separate application crate, command bus or shared read facade. Admission, replay, dispatch and publication are logical portions of the same command transaction. Existing document/branch, derivation, private-reference, assertion and comment elements are reused as feature responsibilities.

Command shape/digest and current sole-owner scope precede protected receipt replay. An exact authorized replay returns its original result before newer mutable-state preconditions are applied; changed operation reuse conflicts. Fresh work invokes feature helpers and pure rules, stages effects in the same transaction, then binds the original outcome/receipt and COMMIT. Draft acknowledgement/checkpoint capture is distinct from immutable text Commit.

Protected `Workspace` reads are called directly by runtime handlers rather than through `execute`. Their consistent-read, resource and current-scope rules remain method-specific. The C3 grouping does not invent a unified query interface or completed multi-user rights/disclosure policy. Those broader mechanisms remain partial.

### Workspace persistence

[Storage implementation](../../crates/storage/src/lib.rs), [adapter codecs](../../crates/storage/src/encoding.rs), [history](../../crates/storage/src/history.rs) and [bounded audit](../../crates/storage/src/audit.rs) supply the decomposition. Record bodies are versioned/decoded outside the pure domain; `Cipher` derives expected workspace/kind/identity/generation context before crypto authentication. Mutable heads use explicit generation checks; immutable records and receipts participate in caller-owned SQLite transactions.

Normal creation/opening supports schemas1/2. Existing-file opening rejects final-component symlinks; WAL/FULL configuration is checked. Experimental temporal3 methods and codecs do not establish normal opening, an approved existing-workspace upgrade or two-parent publication. The database remains embedded; neither this view nor the application view introduces a storage server or a second transaction manager.

Current exact snapshots/history retain the bounded one-occurrence/current-reader scope. General composition closure, repair/rebuild, portable/remote restore and wider recovery acceptance are separate. Encrypted record bodies do not hide all bootstrap/structural metadata. WAL and a consistent SQLite backup do not authenticate provenance, detect complete authentic rollback or establish federation convergence. OWNER009 keeps required application/recovery evidence portable and withdraws the proposed external witness; existing explicit keychain/trust infrastructure is not an authorization for another witness.

### Keychain adapter

[Storage lifecycle](../../crates/storage/src/keychain.rs) and [native provider](../../crates/keychain/src/lib.rs) implement the bounded [ADR014 policy](../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md). Passphrase recovery stays the default portable route; the native item holds a separate device secret wrapping the same data key. Browser/session authentication, workspace unlock and resource authority remain separate.

**Session-authenticated status is available while locked** through bootstrap metadata and a pure capability query; it need not read a native credential. Enrollment/removal require explicit unlocked owner scope. Keychain unlock is a separate explicit operation. There is no automatic enrollment or credential lookup on ordinary startup/passphrase opening.

Schema1 enrollment first verifies a consistent encrypted sibling backup and checks that source state still matches before upgrade. Native create precedes wrapper commit; a database failure compensates by removing only the new expected item. Removal commits wrapper deletion before native deletion. Failed removal retains a cleanup handle only in the unlocked process; a crash orphan requires scoped manual recovery, not speculative overwrite/deletion or a durable cleanup daemon. Native lookup/delete are separate operations; no atomic hostile-process compare-and-delete guarantee follows. Copied old wrappers/backups can retain access.

The native implementation is macOS-only, with explicit unavailable behaviour elsewhere. Default OS-user keychain controls are not hostile-host protection. Current pre-enrollment backups are not the planned portable/remote backup system. No native operation, enrollment, backup or workspace-state change was performed for this audit.

### Cryptographic adapter

The existing [crypto crate](../../crates/crypto/src/lib.rs) supplies in-memory responsibilities, not new modules. It has OS-backed entropy and managed secret buffers; authenticated record envelopes; same-key passphrase/device wrapping; bounded password derivation; and a ciphertext-address utility. Expected context comes from authorized callers, not from trusting a file header. TLS identity, record serialization, current authorization and filesystem/network operations stay outside this adapter.

The [format/reference](../../docs/06-subsystems/formats/crypto-envelopes.md) retains exact layouts, limits and KDF parameters. Unknown wrapper framing/profile is rejected before expensive derivation. Zeroizing owned buffers does not establish complete host-memory erasure; per-call limits do not alone bound concurrent aggregate work. No algorithm, parameter, key epoch or envelope version changes here.

`storage_address` exists and is used in [crypto tests](../../crates/crypto/tests/envelopes.rs); no production consumer was found. Current SQLite objects are keyed by kind/logical ID, with authenticated expected context—not by that ciphertext-hash helper. The C3 view leaves the helper unconnected to production storage rather than inventing a call or claiming plaintext identity/authentication from a hash.

### Planned integration adapters

The view reuses the six existing planned roles: agent context/proposals, separately selected citation interfaces, document/Word import, frozen export/academic compilation, GitHub jobs and peer exchange. Existing planned policy/application/history/storage relationships are retained. Seven proposed external relationships refine those roles using the [integration](../../docs/06-subsystems/external-integrations.md), [import/export](../../docs/06-subsystems/import-export.md) [security](../../docs/06-subsystems/security-cryptography.md), [system requirements](../../docs/03-requirements/system-requirements.md) and [document-engine](../../docs/06-subsystems/document-engine.md) contracts. Dashed connectors are proposals, not executed calls.

The current exact Markdown download is [browser code](../../frontend/src/app.js), shown with its existing solid relationship. It does not implement native conversion, a provider adapter or the complete export specification. Development/release scripts and repository CI likewise do not implement the native GitHub document-publication/backup/update adapter.

Broader disclosure/egress policy is a required future boundary, not a delivered general policy engine. Provider credentials do not grant disclosure rights. Citation desktop/cloud selection has no automatic fallback. Import must bound untrusted parsing and review exact mappings. Remote jobs cannot join a local atomic graph transaction or promise exactly-once writes merely by attaching an operation ID. Federation membership/causality/conflict mechanisms remain unselected. Pandoc packaging/bindings and deterministic resource capture remain unresolved; no helper process, Node service, proxy, converter installation or wire protocol is selected.

## Discrepancies and open V3 questions

1. **Logical versus physical decomposition:** coordination, validation and persistence currently share code. Which boundaries should eventually become explicit interfaces, and which should stay co-located? The model does not approve that refactor.
2. **Broader graph/rights/recovery scope:** bounded current reads, one-owner checks and immediate audit are narrower than general closure, disclosure and repair obligations. Define exact enforcement/acceptance boundaries before claiming the broader model implemented.
3. **Custody and portability:** review future platform support, orphan-recovery experience and portable backup guarantees without conflating explicit keychain backups with general restore, revocation or complete rollback detection.
4. **Crypto integration:** decide whether ciphertext-address calculation has an intended production role. Current existence/test evidence is not evidence of SQLite adoption, proof correspondence, rotation or hostile-host confidentiality.
5. **Future adapters:** select exact input/view capture, below-UI egress enforcement, provider concurrency/reconciliation, packaging and protocol mechanisms before enabling them. Pandoc packaging must be reconciled with the single-executable constraint rather than silently adding a release service.

## Executed checks and limits

[Machine evidence](../evidence/c3-coverage-validation.json) and HPX-TEST-096 record coverage/navigation, source/symbol/relationship checks, old-model and saved-layout preservation, static curve/label/containment checks, LikeC4 export/validation and documentation validation. Existing test declarations and relevant workflow assertions were inspected; no application test suite, native keychain test or proof tool ran. Native AppKit approximations inspect basic static spacing/routing only; they do not establish actual VS Code/webview visual acceptance.

The engine saved arrangement changed externally during modelling; its latest geometry is retained instead of resetting to the initial backup. Other existing saved arrangements remain unchanged. Only architecture/supporting records change. The single executable/embedded SQLite boundary, application/generated/API/proof/legal bytes and existing accepted specifications remain unchanged. No browser, application build/launch, generation, trust/provider/workspace action, commit or publication was performed.
