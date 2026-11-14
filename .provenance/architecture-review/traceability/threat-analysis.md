# Threat and trust-boundary analysis

Attacker capabilities are conditional scenarios. This is a design review, not a penetration test. [Trust view](../diagrams/security/025.svg) distinguishes plaintext host, crypto storage and future providers. Current trusted-server plaintext processing is intentional; future non-trusted egress restrictions are stronger and cannot be inferred from the current browser.

| Threat actor/capability | Asset | Documented/planned control | Residual risk / missing mechanism | Trace |
| --- | --- | --- | --- | --- |
| Network/loopback peer | Credentials and document source | Verified HTTPS, exact Host/Origin/session, bounds | TLS does not authorize content or prevent compromised delivered client | 016.003; DIAG-025 |
| Malicious same-user host | Unlocked plaintext, keys, browser scripts | Explicit trusted-host assumption and independently trusted client requirement for stronger threat | OS, process, swap and browser delivery remain trusted | 016; FIND-016 |
| Offline DB thief/modifier | Payload privacy and record integrity | Random-key AEAD and expected context; sensitive SQL/WAL ciphertext | Kinds/opaque IDs/generations/length/count/access metadata leak; no padding/ORAM | 016.001; DIAG-012 |
| Actor restores authentic old complete DB | Freshness/latest state | CAS detects selected stale operation contexts, not authentic full restore | Whole-DB rollback witness absent and acceptance wording unresolved | FIND-001 |
| Stale/revoked reader or replayer | Private source and original receipts | Current workspace/document/branch authority before protected read and replay | Future multi-user historical grant semantics incomplete | 003.001; FIND-010 |
| Untrusted package/DOCX/provider output | Integrity, code execution and resource availability | Future bounded parsing/staging, no macro/external resource execution; proposals lack authority | Exact schemas, parser quotas, sandbox and cancellation contracts future | 014 / 012; FIND-012/015 |
| Prompt/tool injection | Human authority and provider disclosure | Exact context selection, frozen proposal approval, same core commands | No live agent mutation acceptance; target/approval wire contract incomplete | 012; FIND-015 |
| Cross-mode delayed egress job | Confidential source/rights evidence | Future core mode gate rechecked before execution/delivery, invalidate pending plans on mode change | Independent trusted client and sink enforcement unavailable | 011 / 013 / 016.004 |
| Remote race/lost provider result | Repository integrity and approved publication scope | Frozen bytes/destination/provider-specific conditional head plus unknown outcome | No local/remote atomicity; exact reconcile protocol future | 015.004; FIND-013 |
| Keychain denial/orphan/executable identity change | Workspace availability and secret custody | Explicit alternative and passphrase retained; expected-item compensation | Portable signing identity/trust/cleanup lifecycle incomplete; never autoenroll | 002; FIND-016 |
| Federation peer with independent authority | Causal history, structural validity, disclosure | Future scoped identities/authority, causal validation and conflict handling | No chosen authentication/signature/key distribution/convergence protocol | 017; FIND-014 |
