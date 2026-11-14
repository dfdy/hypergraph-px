# Stable local development signing identity

## Common metadata

- **ID:** `HPX-ADR-016`
- **Title:** Stable local development signing identity
- **Purpose:** Avoid repeated workspace-Keychain consent caused by changing ad-hoc development builds.
- **Level:** `04-architecture`
- **Status:** `accepted`
- **Maintainer:** project owner; implementation agent
- **Applies to:** local macOS development/manual-runtime updates only; not distribution signing or TLS
- **Upstream authority:** [approved unlock policy](0014-keychain-unlock-policy.md), [manual handoff](../../09-guides/reference/DEVELOPMENT_STATE.md)
- **Downstream dependencies:** future local signing preparation/verification, native synthetic validation and guarded manual updater
- **Verification:** explicit owner approval before identity installation; required evidence below
- **Decision/history:** on 2026-10-26 the owner reported repeated Keychain password prompts despite Always Allow, mainly after runtime updates. The owner then explicitly approved the dedicated local signing identity.
- **Last reviewed:** 2026-10-26

## Evidence and diagnosis

The native provider uses the default file keychain and native application access controls. The guarded updater runs immutable hash-named executable snapshots. Read-only `codesign` inspection of the current development executable reports an ad-hoc linker signature, no TeamIdentifier and no internal requirements. Each rebuild changes code bytes and the deployed executable path. Combined with the owner's update-specific observation, this strongly suggests that macOS is correctly treating successive builds as different access-requesting applications, rather than forgetting the selected permission for one unchanged app. No workspace credential was accessed or native password prompt triggered during diagnosis.

Apple explains that [changed trusted apps can require fresh Keychain approval](https://support.apple.com/en-ca/guide/keychain-access/kyca1331/mac). Its [requirement-language guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/RequirementLang/RequirementLang.html) explains that ad-hoc signatures identify one particular program, while certificate requirements can identify a stable signer. Its [signing guide](https://developer.apple.com/library/archive/documentation/Security/Conceptual/CodeSigningGuide/Procedures/Procedures.html) describes local self-signed identities for internal development. This is a supported diagnosis and proposed remedy, not yet an executed fix.

## Proposed bounded change

With explicit owner approval, create one dedicated **Hypergraph PX Local Development** code-signing certificate/private-key identity in the current user's login Keychain. Keep the signing private key protected there; never place it, the human passphrase or workspace device secret in the repository, logs, command arguments or browser storage. Restrict the certificate to code signing with digital-signature usage and no CA authority. Restrict automatic private-key use to the system code-signing tool, subject to native owner consent. Signing may itself require native permission; do not capture or script the owner's macOS password.

Sign development runtime builds with stable identifier `org.hypergraph-px.runtime.local-development` and an explicit designated requirement bound to that identifier and the exact dedicated signing certificate. Pin and record public certificate fingerprints and the verified requirement. A same-name certificate, ad-hoc signature or different signer must not substitute. Retain the same identity across ordinary builds. Expiry, loss or replacement needs explicit review rather than silent signer rotation.

This proposal permits adding the dedicated identity, not changing system/TLS trust. Do not add a certificate authority, disable Gatekeeper, relax the workspace item's ACL to all applications, expose a credential through a general helper, or alter the existing HTTPS leaf trust. If successful signing/validation requires any extra trust-store setting beyond this identity import, stop and present that exact additional scope before applying it.

Sign before capturing the integration binary fingerprint. Verify signature and pinned designated requirement before tests and again before handoff. Test and deploy precisely those signed bytes; never re-sign or mutate an already tested immutable snapshot afterward. Existing workspace encryption, keychain service/account, passphrase recovery and locked startup remain unchanged. The owner may need to approve the newly signed app once for an existing workspace item; do not rewrite its access policy or read its secret automatically as an installation side effect.

## Required verification and recovery

Use two different development builds/paths with the same verified signer/requirement against a uniquely named synthetic credential/workspace. Record actual native access behavior after initial owner consent, including whether a further prompt occurs; do not claim prompt-free updates merely from matching signature text. Verify wrong signer/identifier rejection, exact tested-binary handoff, unchanged workspace ciphertext and passphrase fallback. Synthetic cleanup deletes only created test items. Keep original manual binaries available for rollback, and retain the old TLS trust and manual workspace. No owner workspace enrollment, automatic unlock or login bypass is authorized by this proposal.

The owner approved this exact identity-installation scope on 2026-10-26. Proceed within these bounds; additional trust-store changes remain unapproved. Do not claim Keychain persistence across rebuilds is fixed until the required native verification passes.

## Additional code-signing trust scope awaiting approval

The dedicated identity was successfully imported, with non-extractable private key and code-signing-tool access, but this Mac rejects verification with `CSSMERR_TP_NOT_TRUSTED`. A matching identifier/certificate requirement alone does not satisfy its signing-certificate trust evaluation. The approved identity-only scope explicitly requires separate approval before changing trust settings. No such setting has been applied.

The requested additional scope is **only the current user's code-signing-policy trust for this exact self-signed signing leaf**:

- SHA-256: `76e90b6b05a67bb7cd1649d2dcdb7a13de40b03eb5b5ce46c1a94de0508593a4`
- SHA-1 selector: `d06916f5201e1c615a4d91cbe0fbb8b0634b262b`
- Name: Hypergraph PX Local Development
- Policy: `codeSign` only, exact leaf as trusted endpoint (`trustRoot` for this self-signed certificate), user domain/login keychain only

Before application, snapshot current user trust settings and verify the DER certificate against the pinned SHA-256 in the same guarded process. The proposed native command is `security add-trusted-cert -r trustRoot -p codeSign -k <login-keychain> <verified-exact-certificate>`, without admin/system flags, TLS policy, broad basic policy or allowed-error bypasses. Verify afterward that only this leaf's entry changed and its only trust policy is code signing; restore its prior entry if scope differs. Its certificate retains CA:false and code-signing-only usage. Preserve the separate approved HTTPS leaf trust unchanged. Only then rerun exact signature validation and the synthetic two-build/no-prompt positive and wrong-identity negative probes. This addition remains unapproved until the owner explicitly consents.

The owner explicitly approved the exact user code-signing trust above. Native macOS headers require `trustRoot` for a self-signed certificate; `trustAsRoot` is valid only for a non-root certificate and was rejected without a trust change. This is the native encoding of the approved exact codeSign-only scope, not CA authority or general TLS trust.

## Executed trust verification and continuity limits

The owner approved the exact codeSign-only user trust on 2026-10-26. The guarded script verified the certificate fingerprint, backed up user trust and confirmed a single CodeSigning policy entry with native default trustRoot; all other entries, including the approved HTTPS leaf, remained unchanged. Signature verification succeeds outside the development filesystem sandbox, which cannot evaluate this login-Keychain trust reliably.

Two signed builds passed cryptographic certificate/identifier checks, but no-prompt access to an item automatically created by the first build was denied to the second. A fixed executable-path experiment was also denied, so moving the runtime to a fixed path alone is not established as a fix. Every created synthetic item was cleaned up. Stable local signing is therefore **not yet verified to eliminate repeated prompts**.

The next diagnostic explicitly models initial native Always Allow consent for the newly signed probe's temporary item, followed by no-prompt access from a third distinct build. Automatic approval review rejected triggering that persistent item-specific grant under the prior identity/trust approvals; a concrete owner question now requests approval for this one temporary synthetic-item ACL grant and subsequent scoped item removal. No owner workspace item or access list is changed by that test. Do not bypass the review rejection or trigger the native prompt before the explicit answer.

On 2026-10-26 the owner explicitly approved the temporary synthetic-item native Always Allow grant for probe second. This permits that single item-specific consent transition, subsequent no-prompt third-build/negative checks and removal of the synthetic item. It does not authorize access to or ACL changes for the manual workspace credential. The approved probe is running; results remain to be recorded.

## Native consent result and revised diagnosis

The owner approved the temporary-item grant and the native test ran. The second signed build successfully completed the interactive read, but a third independently built, correctly signed executable was **denied** with native interaction disabled. Cleanup removed the synthetic item. The experiment therefore does not verify local self-signing as a solution to update-related prompts, even after the initial grant. No owner workspace credential was accessed or its ACL changed.

Apple's [current securityd client classification source](https://raw.githubusercontent.com/apple-oss-distributions/Security/main/securityd/src/clientid.cpp) distinguishes Apple-authorized developer/team identities from other signed code. The latter receives a `cdhash:` partition identity, which changes with code contents; an arbitrary self-signed certificate requirement does not establish the Apple-backed team partition. This explains the observed failure and corrects the initial expectation that local certificate continuity alone would fix it. Public identity metadata inspection found no existing Apple-issued development/distribution signing identity available on this machine. An Apple-issued signing route therefore requires an additional account/credential decision; no account was connected or identity substituted.

The dedicated local key/certificate and explicitly approved user CodeSigning trust remain installed, but are experimental for this goal. No fix is claimed or signed target handed off. The existing manual runtime stays on its previously tested contributor-evidence build. The owner requested stopping after this result; do not run further consent tests or change access/trust as a cleanup shortcut.

## Owner-approved restoration of the prior development flow

On 2026-10-26 the owner explicitly selected “Restore the previous development signing flow.” The ordinary linker-provided ad-hoc signature is again used for local builds and tested manual handoffs. The experimental pinned-identity verification imports were removed from the fingerprint/updater path; exact SHA-256 capture, post-test equality, immutable snapshot verification and guarded workspace/process checks remain. The installed experimental identity and exact CodeSigning trust remain untouched. Explicit experiment helpers remain historical diagnostic tooling, outside ordinary build/handoff; do not invoke them as a presumed fix. Apple-issued signing remains a separate future decision/credential gate.

A fresh offline build was publicly inspected as `Signature=adhoc`, `flags=adhoc,linker-signed`, without a TeamIdentifier or certificate requirement. The actual headless HTTPS/SQLite/older-reader workflow passed 29 checks and deployed precisely that tested binary to the same manual workspace/origin, locked. No owner workspace secret or ACL was read/modified. This restores the approved development behavior; it does not eliminate update-related native Keychain prompts.
