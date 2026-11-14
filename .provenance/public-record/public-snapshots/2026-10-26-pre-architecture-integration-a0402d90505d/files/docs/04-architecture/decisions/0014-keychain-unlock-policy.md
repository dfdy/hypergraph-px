# Local keychain unlock and recovery policy

## Common metadata

- **ID:** `HPX-ADR-014`
- **Title:** Local keychain unlock and recovery policy
- **Purpose:** Resolve the missing custody/recovery choice before implementing the required OS-keychain alternative.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; implementation agent
- **Applies to:** next trusted-server unlock increment; macOS first; no client-held mode
- **Upstream authority:** [key-custody requirements](../../06-subsystems/security-cryptography.md), [open question HPX-GAP-007](../../registers/open-questions.csv)
- **Downstream dependencies:** [workspace format](../../06-subsystems/formats/hpx-workspace.md), [record representation](../../07-implementation/data-structures/sqlite-records.md), runtime unlock UI and native provider
- **Verification:** required tests below; executed evidence is recorded separately in the test register
- **Decision/history:** HPX-RQ-011 requires a keychain alternative; it does not select credential custody or recovery policy. Owner explicitly approved this policy with “Policy approved” on 2026-10-25. Implementation and verification remain separately scoped.
- **Last reviewed:** 2026-10-25

## Accepted decision

Adopt an **explicitly enabled keychain alternative with passphrase recovery always retained**. Store an independent OS-random device secret in the native keychain; never store the human passphrase or an unwrapped workspace data key there. The device secret wraps the same workspace key through the existing supported wrapping primitive. Passphrase unlock stays the default and works if this Mac/keychain is lost or unavailable.

The owner adopted this mechanism for the accepted requirement. Adoption alone does not modify existing workspaces. No keychain enrollment or credential access happens on open, startup, browser connection, or ordinary passphrase unlock. The trusted runtime continues to start locked. Keychain unlock requires an explicit action through the authenticated local HTTPS session and any native OS approval. Browser code receives neither wrapping secret nor workspace keys. Unsupported platforms report the keychain capability unavailable and retain passphrase unlock.

## Approved implementation scope

1. Introduce a native provider boundary outside the pure domain and crypto primitives. For the first implementation, macOS item lookup uses an application service name and the existing opaque workspace ID. It must not use document titles, the human passphrase or private content as keychain metadata. Provider failure, OS denial or missing items must not silently unlock, overwrite an item or change custody mode. Choose/review the native Rust dependency and its access-control behavior before compilation; workspace-owned Rust remains free of unsafe code.
2. Generate a 32-byte random device secret and use the existing `SecretKey::wrap`/unlock format and KDF parameters. Keep the passphrase wrapper intact. Add a separate fixed-length device wrapper rather than replacing the current wrapper. Clear transient secret buffers on drop using the existing zeroizing boundaries; do not claim complete hostile-host memory erasure.
3. Introduce an explicit database schema version **2** with one optional `keychain_unlock` row (`singleton = 1`, `wrapper` exactly 106 bytes). The existing bootstrap passphrase wrapper, encrypted record version 1, logical identities, revisions, snapshots, receipt encodings and crypto envelope version remain unchanged. The row holds ciphertext only. No stored device label, human passphrase, OS account name, raw data key or authentication session is added to clear metadata.
4. Upgrading a schema-1 workspace requires a separately invoked enrollment/upgrade action while unlocked. Create and verify a consistent encrypted SQLite backup with restrictive permissions before the transaction. Preserve all existing encrypted record bytes and logical history. Add the table and change `user_version` atomically; do not upgrade merely by opening a file. Define explicit readers for supported schema 1 and 2; future/unknown versions continue to fail closed. No generic downgrade or automatic recovery from a partial upgrade is invented.
5. Enrollment creates a new provider item before committing its database wrapper. On database failure, remove only the just-created item. If cleanup fails, report the orphaned-item condition while retaining the working passphrase route. Never replace an existing item whose secret/wrapper cannot be verified. Removing enrollment commits database-wrapper removal before deleting that workspace's provider item; failed deletion is reported without claiming erasure or deleting unrelated items. Copied old wrappers/backups can retain earlier access; no revocation or cryptographic erasure guarantee is added.
6. The runtime reports exact enrollment/provider capability and offers explicit enroll/remove/use-keychain operations under the existing same-origin/session and sole-owner authorization checks. The UI uses ordinary unlock choices and reports cancellation/denial honestly. One successful unlock does not authorize another workspace, a provider integration or client-held mode. Keychain usage and browser authentication remain separate.

Native item protection must be verified against the selected provider API before implementation claims are made. Do not silently accept plaintext-file storage, environment-variable storage, an unrestricted fallback provider or an API that cannot meet the documented OS-user protection. Platform scope is macOS first, with no promise of Linux/Windows delivery in this increment.

## Alternatives and consequences

- **Recommended:** independent device secret plus retained passphrase wrapper. Adds an explicit format upgrade but preserves portable passphrase recovery and avoids storing the user's passphrase or a raw data key in the keychain.
- Store the human passphrase in the keychain. Avoids the second-wrapper format initially, but couples an application secret to the user's human password and changes disclosure/recovery consequences. Not selected by the existing requirement.
- Replace passphrase custody with a keychain-only workspace. This risks loss of access when the device/keychain is unavailable and needs a separately accepted recovery mechanism. It is not the recommendation.

The choice changes custody, recovery behavior and database compatibility, and was explicitly adopted by the owner under the keychain/lifecycle gate. Routine provider implementation details can proceed autonomously after that policy choice, provided the selected API meets it; weaker behavior must be reported rather than substituted.

## Required verification before claiming delivery

Use a fake provider to exercise enrollment/read/delete failures, denial, orphan cleanup, wrong-workspace/secret substitution, concurrent enrollment and retry outcomes. Verify explicit version-1 compatibility and version-2 unknown/future rejection; migration backup verification and transaction failures must leave passphrase recovery intact and immutable history byte-identical. Test restart, lock, explicit keychain unlock, passphrase fallback after provider loss, independent workspaces, and no browser/session/diagnostic secret exposure. Native tests use only uniquely named synthetic items and remove only items they create; an OS credential/consent prompt is a real user-interaction boundary, not permission to bypass it.

Do not enroll the owner's manual-review workspace or restart that instance as a side effect of development/tests. No real-document acceptance, key rotation, rollback witness, recovery-key hierarchy, client-held mode, release or publication is authorized by adopting this bounded unlock policy.

## Native provider and implementation evidence

The local implementation uses pinned `security-framework` 3.7.0 safe APIs. `SecKeychainAddGenericPassword` creates a generic password in the current user's default file keychain with the native default access control; it does not update an existing item. Lookup and checked deletion use the same service `org.hypergraph-px.workspace-unlock.v1` and lower-case hexadecimal workspace ID account. This is local macOS keychain storage, with no cloud synchronisation, entitlement-dependent data-protection fallback, environment or plaintext-file provider. Native ACLs and access prompts remain macOS responsibilities; this is not protection against a compromised logged-in host. Reviewed upstream API sources are in the pinned dependency inventory, with [Apple's API reference](https://developer.apple.com/documentation/security/seckeychainaddgenericpassword) and [the upstream Rust adapter](https://github.com/kornelski/rust-security-framework).

Removal verifies the expected secret before checked service/account deletion. The native read and delete are separate operations; no atomic compare-and-delete guarantee against another hostile process with keychain access is claimed. Application workspace writers are serialized through SQLite. Transient Rust secret buffers zeroize on drop; OS allocation handling follows the native API, without a complete host-memory erasure claim.

A failed item cleanup is reported and its expected secret is retained only in the unlocked process for retrying removal. Locking/exiting drops that handle. A crash between native creation and database commit can leave an orphan with no wrapper; a subsequent enrollment reports the existing item and never overwrites or deletes it speculatively. Manual scoped inspection/removal is then required before reenrollment. Passphrase recovery stays available. Backups are verified schema-1 SQLite snapshots under sibling `.hypergraph-backups/`, with mode 0700 on the directory and 0600 on files on Unix; the upgrade aborts before native creation if backup verification fails or another writer changes the source after the backup snapshot. These backups do not implement the deferred portable/remote backup design.

See [current implementation state](../../09-guides/reference/DEVELOPMENT_STATE.md) and [test register](../../registers/tests.csv) for executed checks and remaining UI acceptance limits. The owner's manual runtime is excluded from enrollment and testing.
