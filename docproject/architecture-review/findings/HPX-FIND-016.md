# HPX-FIND-016 — Local TLS trust evidence does not close portable distribution lifecycle

[Register](README.md) · [Recommendations](../recommendations.md)

## Category

Missing specification / portability risk

## Severity

High

## Confidence

High

## Confirmed versus hypothetical

Confirmed release-readiness gap

## Affected components / scope

Installer, certificate renewal/removal, platform support

## Affected processes

HPX-PROC-001, HPX-PROC-016.006

## Priority and dependency gate

P1 before portable release

## Likelihood / evidence limit

Certain missing platform coverage; failure incidence outside tested host unknown.

## Problem

An approved local certificate and verified Chromium preflight establish a scoped development workflow. They do not supply portable trust enrollment, certificate expiry/renewal/removal, distribution signing identity continuity or a complete supported-platform keychain/browser matrix. The failed self-signing experiment was reverted to approved ad-hoc development signing.

## Architectural consequences

New users may face blocked startup or repeated credential prompts; tempting certificate-warning bypasses would violate the trust requirement. Signing an executable does not itself establish TLS browser trust.

## Reproduction / demonstration

Compare bounded local trust evidence, ADR016 outcome and future release/platform gates. No trust store, certificate or native secret was touched in this review.

## Alternative interpretations

A local developer-only milestone can be valid with explicit manual steps; it need not promise a consumer installer.

## Possible remedies

Define the intended release audience/platform matrix and a reviewed certificate lifecycle with fingerprint checks, failure rollback and uninstall. Evaluate Apple-issued signing separately with its own credentials.

## Trade-offs

Automated trust installation needs explicit owner/user authorization and platform-specific handling; stronger independent client delivery is a distinct hostile-host requirement.

## Recommended next action

Owner chooses distribution support and signing route before portable release claims.

## Human architectural approval

Yes — trust installation and signing credentials require separate authorization.

## Exact evidence

| Source / line | Quoted locator (not an entire source passage) |
| --- | --- |
| [docs/08-assurance/local-browser-trust-proposal.md:1](../../../docs/08-assurance/local-browser-trust-proposal.md) | # Local browser certificate trust proposal |
| [docs/04-architecture/decisions/0016-local-development-signing.md:1](../../../docs/04-architecture/decisions/0016-local-development-signing.md) | # Stable local development signing identity |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:92](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | Keychain UI visual/browser acceptance remains unexecuted under the owner&#x27;s browser preference; earlier UI screenshots do not verify the new controls. No real-data acceptance, portable keychain/support matrix, hostile-host protection, rotation/rollback witness, revocation/erasure, complete trust lifecycle or publication is claimed. Use &#91;ADR014&#93;&#40;../../04-architecture/decisions/0014-keychain-unlock-policy.md&#41; and &#91;HPX-TEST-009&#93;&#40;../../registers/tests |
