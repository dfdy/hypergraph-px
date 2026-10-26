# Local browser certificate trust proposal

Date: 2026-10-25. Status: replacement fingerprint and SSL-only SAN scope explicitly approved and installed; Chromium TLS and real synthetic workflow verified. Upstream authority: [ADR 0004](../04-architecture/decisions/0004-local-https-bootstrap.md), which states “installing certificate trust requires explicit owner approval.” Application resumption does not waive this boundary.

## Concrete certificate and intended scope

Existing public leaf: `artifacts/local-tls/localhost.pem` (ignored). SHA-256:

```text
05:86:5B:AD:AC:E9:7A:AD:0C:B8:AB:F4:46:0E:12:F6:A1:57:4B:81:27:59:78:00:52:E8:FF:B4:86:BF:84:28
```

SANs: DNS localhost and IP 127.0.0.1. Validity: 2026-10-25 10:24:49 UTC through 2029-01-25 10:24:49 UTC. No private-key contents are included here. The existing leaf/CA/key files stay local and ignored.

Proposed change: trust this exact leaf in the current user's login keychain, for SSL with policy string `127.0.0.1`, for synthetic localhost runtime browser acceptance. Do not trust the issuing root CA, use the admin/system trust store, exempt expiration/hostname errors, enable HTTP fallback, or expand the scope if this narrow trust is insufficient. Inspect/preserve any existing user entry before changes; remove only the introduced leaf trust on rollback while preserving unrelated keychain/trust entries.

Before applying trust, copy the public leaf into a private temporary snapshot, verify that snapshot's DER SHA-256 against the explicitly approved fingerprint, and invoke `security add-trusted-cert` on that same snapshot from the same guarded process. A failed check must terminate the process before any trust command. Preserve the current user trust settings first.

The intended trust arguments remain `-r trustAsRoot -p ssl -s 127.0.0.1 -k "$HOME/Library/Keychains/login.keychain-db"`. The replacement fingerprint above was explicitly approved by the owner and applied through a guarded snapshot process.

No sudo/admin trust is proposed. Browser acceptance may still require a browser-supported trust mechanism; if the proposed user leaf trust is insufficient, report the result before expanding trust scope.

## Ready verification

`node frontend/scripts/check-runtime-tls.mjs` starts a bounded localhost HTTPS runtime with a temporary nonexistent synthetic workspace path, keeps default browser certificate verification, and checks the authenticated locked-workspace screen. It never installs trust, bypasses a warning, submits a passphrase or creates/unlocks a workspace; it keeps launch capabilities out of logs and cleans up the browser/runtime/temp directory. Its current run failed browser TLS navigation with `net::ERR_CERT_AUTHORITY_INVALID`, so no real browser/runtime data workflow was attempted.

After approved trust succeeds, run synthetic edit/autosave/restart/recover/commit/history acceptance against encrypted SQLite before claiming integrated delivery. Existing tests/builds/proof replay are documented in [the handoff](../09-guides/reference/DEVELOPMENT_STATE.md) and [test register](../registers/tests.csv). This proposal does not authorize a commit, push, release or real-document test.

## Approval attempt and rollback, 2026-10-25

The owner approved the original proposal identifying SHA-256 `38:5C:87:56:71:08:F7:C9:EE:EF:B8:58:D1:01:67:49:DA:7D:10:89:0D:3A:D6:24:72:76:8A:7F:B3:22:41:98`. A subsequent guarded DER hash check found the current leaf instead has SHA-256 `05:86:5B:AD:AC:E9:7A:AD:0C:B8:AB:F4:46:0E:12:F6:A1:57:4B:81:27:59:78:00:52:E8:FF:B4:86:BF:84:28`. The cause of the inconsistent earlier fingerprint reports has not been established. The current value was verified using both system and Homebrew OpenSSL, plus direct DER hashing; SANs and validity match the fields above.

The agent made an execution error: the shell continued to the trust command after the fingerprint assertion failed. That unintended trust was removed immediately. The prior user trust list had zero entries; the exported post-rollback list also has zero entries and compares exactly equal to the original. No broader trust was retained. Original trust settings, action results, and public certificate snapshots are preserved locally under ignored `artifacts/local-tls/trust-before-aoowca1e/`; they must not be published.

No trusted browser workflow or workspace unlock was attempted after this incident. Current work remains uncommitted. Authorization for the original fingerprint is not treated as authorization for a different certificate, so the same narrowly scoped user SSL trust now awaits approval for the replacement fingerprint.

## Approved replacement installation

The owner approved the replacement fingerprint. A single guarded process copied the public leaf into a private snapshot, checked its DER SHA-256 against `05865badace97aad0cb8abf4460e12f6a1574b812759780052e8ffb486bf8428`, exported the prior user trust settings, and only then invoked the approved command on that same snapshot. The post-install export confirms exactly one leaf entry was added and all original entries are unchanged. Its policy is sslServer, policy string 127.0.0.1, trustAsRoot. Local receipts are under ignored `artifacts/local-tls/approved-trust-5xi4ex2x/`.

macOS `security verify-cert` succeeds for SSL hostname 127.0.0.1 under the installed policy. Bundled Chromium still rejects navigation with ERR_CERT_AUTHORITY_INVALID. Chromium's [macOS trust-store implementation](https://chromium.googlesource.com/chromium/src/+/main/net/cert/internal/trust_store_mac.cc#112) explicitly skips trust dictionaries containing kSecTrustSettingsPolicyString; this is consistent with the observed hostname-restricted policy rejection. No issuer/root CA or system trust was added and no hostname restriction was removed.

A pinned Playwright WebKit test browser is being prepared in a temporary directory to test the same approved OS trust scope. The reusable real-runtime synthetic workflow harness is `frontend/scripts/check-runtime-workflow.mjs`; it is prepared but has not yet passed a real browser workflow. It covers exact source/autosave, dropped acknowledgements, queued edits, commit retry, document switches, lock/unlock, abrupt restart, exact snapshots, persisted receipts, embedded asset hashes and plaintext sentinels. Both harnesses keep browser TLS validation enabled. Any additional trust-scope change still requires separate approval.

## Additional Chromium-compatible scope, explicitly approved

Chromium deliberately skips hostname-scoped macOS trust entries. The smallest proposed change for Chromium is to keep the same approved leaf fingerprint, the current user login keychain, SSL-only policy and trustAsRoot, while removing only the policy-string restriction. Certificate hostname checks remain enabled and still constrain the exact leaf to its SANs: localhost and 127.0.0.1. The certificate is not a CA; no issuer/root CA or admin/system trust is added. The owner explicitly approved this scope through the clarification question; it was then applied through a guarded fingerprint/snapshot process.

The approved procedure uses the same guarded certificate snapshot/fingerprint check, back up current trust settings, and invoke `security add-trusted-cert -r trustAsRoot -p ssl -k "$HOME/Library/Keychains/login.keychain-db" <verified-leaf-snapshot>` (without `-s`). Verify that only this leaf's trust entry changed, SSL remains the sole policy and the hostname policy-string key is absent. Restore its prior entry if the scope is not exactly as approved. Then rerun default Chromium verification with no TLS error bypass.

## Chromium-compatible installation and acceptance

The owner explicitly approved keeping the same leaf and user login-keychain SSL policy while removing the hostname policy-string restriction. A guarded process verified the leaf's exact SHA-256, exported before/after trust settings and confirmed that only this leaf entry changed. The new entry has one sslServer policy, trustAsRoot, no policy-string restriction and no allowed-error exemption. Receipt: ignored `artifacts/local-tls/approved-ssl-trust-wwzukrw9/`. No issuing/root CA or admin/system trust was added.

Chromium's normal TLS preflight passed and reached the authenticated locked-workspace UI. The real Chromium HTTPS/SQLite workflow then passed ten synthetic-data checks: source/autosave, dropped save/commit acknowledgements, exact retries, queued edits, document switching, lock/unlock, abrupt restart recovery, exact historical snapshots, persisted receipts, embedded asset hashes and plaintext-sentinel absence. Follow-up desktop checks and actual test receipts are recorded in the current handoff. No TLS warning bypass was used. Temporary workspaces were cleaned up; launch capabilities and passphrases were not written to receipts or diagnostics.

The temporary WebKit downloads were canceled once Chromium succeeded. WebKit was neither installed nor tested. This establishes only the current macOS/Chromium synthetic workflow, not portable first-run provisioning, renewal, the full startup/unlock feature set or real-document acceptance. The installed leaf's SSL trust remains as approved; any different certificate or broader trust scope requires new approval.

## Headed observation and retained session

After the owner requested headed Chromium, the final real workflow passed 11 checks in the dedicated visible browser, including desktop widths/themes. Its last page, synthetic backend and encrypted test workspace are deliberately retained for observation and reuse. Private session/profile/workspace paths stay ignored. The test runner also reuses the visible browser with isolated contexts; two runtime-buffer scenarios passed through that runner. Do not revert to headless without explicit owner instruction. This supersedes the earlier cleanup-only workflow behavior for successful runs; failed runs still clean their temporary backend/workspace while leaving the browser window open.
