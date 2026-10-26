# Implementation resumption

Date: 2026-10-25. Authority: the owner explicitly directed following the specification and continuing through successive implementation steps autonomously, making routine decisions and stopping only at a missing decision, credential or approval that prevents further useful work. This resumes application work after the documentation migration. It does not authorize new commits/pushes/releases, installing certificate trust, provider connections or publishing private material.

## Scope and rationale

Follow HPX-ADR-006/HPX-OWNER-003 by removing domain Serde/dependencies and keeping exact-width identifier and snapshot-binding codecs at the storage/runtime adapter boundary. Preserve typed JSON field order/bytes for command receipts; test compatibility and malformed identifiers. Domain scalar/UTF-16 validators remain unchanged.

Follow HPX-ADR-007/HPX-OWNER-002 with an authenticated JSON record wrapper: `record_version` (integer 1), `record_kind` (existing integer kind), `payload` (strict typed record). Every catalog/document/manifest/revision/snapshot/head/draft/receipt/event is wrapped at the common cipher boundary. Database schema 1, HGOB crypto envelope and HTTP contract 1 remain unchanged. Missing/future/unknown/duplicate fields and mismatched kinds fail closed. Unversioned experimental payloads have no automatic conversion or rewrite path; preserve the original file and report an unsupported format. This is an implementation choice within the approved version requirement, not acceptance of the whole real-data format or a new migration mechanism.

Next: exercise lost/delayed acknowledgements, exact operation retries, queued typing, document switches and lock behavior; review dependency notices and replay existing proofs when tools are available. A trusted browser/runtime acceptance run still requires explicit certificate trust approval. No bypass or real-document testing is authorized.

## Work and checks

Completed the serialization, record-version, adapter retry/lock and exact-owned-source steps. See [current handoff](DEVELOPMENT_STATE.md) and [test register](../../registers/tests.csv) for executed checks and limits. No application source was taken from private migration inputs; no new registry dependencies were introduced.

New evidence: adapter tests exposed duplicate commit publication after an unknown acknowledgement; exact-operation reconciliation now covers it. Source review exposed CRLF/CR loss through the CodeMirror LF display buffer; owned-source/history/paste codecs now preserve original bytes and reject stale mappings. These are corrections under HPX-RQ-002/006/007/023/024, not new requirements.

The real browser TLS preflight failed with `net::ERR_CERT_AUTHORITY_INVALID`, without bypassing validation. Its temporary runtime/browser were cleaned up without creating or unlocking a workspace. Work now awaits the separate certificate trust approval in [the concrete proposal](../../08-assurance/local-browser-trust-proposal.md). No trust changes, new commits, pushes or releases occurred.

Final checks: 22 Rust tests passed (plus the subprocess crash worker exercised through its parent test); 71 Node tests and all 58 synthetic browser scenarios passed. Rust formatting, Clippy with warnings denied, frontend/Rust builds, documentation/register/archive integrity and bounded credential-pattern checks passed. The extracted helper and four model theorem environments replayed successfully. The live runtime TLS preflight remains blocked specifically by `net::ERR_CERT_AUTHORITY_INVALID`. These changes remain uncommitted and unpublished.

## Approved trust and real workflow follow-up

The owner approved the replacement leaf and then its SSL-only scope across certificate SANs. Guarded installation/export checks confirm only the approved leaf's trust entry changed. Chromium preflight and the real HTTPS/SQLite synthetic workflow passed; the final headed run added desktop widths/themes, giving 11 checks. See [the handoff](DEVELOPMENT_STATE.md) and [test register](../../registers/tests.csv) for the exact scope. The user requires headed Chromium and an open/reusable window; this is persisted in AGENTS and browser tooling. The final synthetic runtime/browser are intentionally left open, with private session records/profile/runtime data under ignored artifacts. No new commits, pushes or releases occurred. Portable certificate lifecycle, keychain unlock and real-document acceptance remain open.

## Further autonomous request hardening

Implemented exact fragmented-header bounds, linear header delimiter scanning, total TLS socket-operation deadlines, ASCII-only HTTP whitespace handling and rejection of duplicate session cookies. Four runtime unit tests cover parser/auth behavior; the full workspace now passes 24 Rust tests. The separate non-browser security harness passes 24 real rejection checks, including unsafe/mismatched/empty key startup, session/Origin/Host/metadata/type/framing bounds, slow continuous requests, plaintext rejection and verified-client certificate failures. It makes no trust changes and leaves the manual instance alone. See [current handoff](DEVELOPMENT_STATE.md) and [test register](../../registers/tests.csv).

The requested OS-keychain alternative now has a concrete [policy proposal](../../04-architecture/decisions/0014-keychain-unlock-policy.md) for owner review. Existing specifications require the alternative but do not choose device-secret custody, retained passphrase recovery or its database compatibility path. That consequential missing decision is the next gate; the proposal has not been promoted to acceptance.

## Approved keychain policy implementation

The owner explicitly approved HPX-ADR-014 on 2026-10-25. Implementation proceeds within that policy: random native device secret, same-key wrapping with passphrase recovery retained, explicit backed-up schema-2 upgrade, locked startup and explicit authenticated use/enroll/remove actions. The new pinned macOS dependency and its transitive licenses were reviewed before compilation. No manual-workspace enrollment, browser automation, trust change, commit, push or release is implied. Executed checks and remaining acceptance are recorded in the current handoff and test register.

The keychain increment passed 36 Rust tests, 74 Node tests, explicit native create/read/duplicate/wrong-secret/removal, five real HTTPS/native workflow checks and the 24-check transport suite. Builds, formatting and Clippy passed. Synthetic native items and test servers/workspaces were cleaned up. UI visual acceptance remains pending because dedicated/personal browser automation is not authorized under the current preference. The existing manual runtime/workspace and trust settings were unchanged. See HPX-TEST-009 and ADR014 for custody, backup, cleanup and platform limits.

## Continued history, exact ranges and manual handoff

The earlier keychain milestone was not a valid stopping gate under the owner's autonomous instruction. Work continued through bounded immutable history, exact historical range resolution and their runtime/frontend integration. Headless testing is now permanently authorized by the owner; the 58-scenario editor suite and the expanded 14-check real HTTPS/SQLite workflow passed, including paginated history, exact historical download, stale-response/document isolation and explicit native keychain UI actions. Desktop history/keychain screenshots in both themes were visually inspected. New ordinary storage tests cover budget boundaries, immutable older-page cursors, corruption/missing bindings and exact repeated Unicode/mixed-line-ending anchors. These are bounded executable checks, not new Lean/Rust correspondence claims.

The owner also requires manual-runtime updates after successful synthetic test runs. Integration harnesses now hand off only their exact binary fingerprint after isolated cleanup; the guard skips restart for an unchanged tested binary. The first update preserved the manual workspace and origin, started locked, and refreshed the private shortcuts. A mismatched fingerprint was rejected without changing the record and the update lock was released. The owner must reopen the private shortcut after an actual restart to establish a fresh browser session.

## Renewed autonomous work and exact snapshot reads, 2026-10-26

The owner resumed successive implementation after the native signing stop. Independent frontend snapshot-read hardening freezes exact request identities and rejects malformed Unicode or source exceeding the existing 2 MiB UTF-8 bound before inspection/download. Exact mixed line endings remain unchanged. All 122 Node tests and four isolated headless runtime-buffer/publication-evidence checks passed; the static frontend built successfully. No Rust, persisted format, dependency or visual layout changed. The next actual integration/manual handoff awaits the explicit signing-flow choice recorded in the current development state. No signing/trust/workspace credential change or publication occurred.

## Approved signing restoration and integrated follow-up

On 2026-10-26 the owner approved restoring the previous development signing flow. Ordinary handoff no longer requires the failed experimental identity; all tested-binary/workspace/TLS guards remain. The installed identity/trust and workspace credentials are untouched. Reviewed dependency inventories match; a new offline locked build has its ordinary linker ad-hoc signature. The 29-check actual headless HTTPS/SQLite/old-reader workflow passed and handed off that exact build to the same locked manual workspace/origin after isolated cleanup. This verifies the restored development path and snapshot-read hardening, not prompt-free Keychain continuity.
