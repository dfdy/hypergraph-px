# HPX-PROC-016 — Security, crypto and trust lifecycle

[Inventory](../process-inventory.md) · [Diagram navigation](../diagrams/README.md) · [Machine-readable contracts](../traceability/process-model.json)

| Parent contract field | Definition |
| --- | --- |
| Stable ID | HPX-PROC-016 |
| Purpose | Security, crypto and trust lifecycle |
| Parent | HPX system boundary |
| Actors and initiating events | Union of explicit child triggers; no autonomous background job implied |
| Preconditions | Each child retains its own authority, milestone and expected-state constraints |
| Inputs | Union of listed child inputs |
| Outputs | Union of listed child outputs |
| Transformations | Orchestration/decomposition only; parent is not an additional hidden operation |
| Data read | Expected record context, workspace data key, wrapped key, authenticated mode |
| Data modified | Union of listed child writes; no additional parent-owned store |
| Core objects | See child contracts; conceptual model and physical storage are distinct |
| Invoked subprocesses | HPX-PROC-016.001, HPX-PROC-016.002, HPX-PROC-016.003, HPX-PROC-016.004, HPX-PROC-016.005, HPX-PROC-016.006, HPX-PROC-016.007 |
| Dependencies | Crypto adapter / runtime guards / future core policy |
| State transitions | See child lifecycles; no new aggregate state |
| Transaction boundaries | Parent spans multiple operations; no family-wide atomic transaction |
| Side effects | Only explicitly listed child effects |
| Errors | Propagate child failures without inventing successful outcomes |
| Recovery | Child-specific retry/compensation; incomplete future contracts remain open |
| Security | OS entropy and trusted client delivery assumed; AEAD is not freshness, authorization or hostile-host confidentiality |
| Requirements | HPX-RQ-009, HPX-RQ-010, HPX-RQ-011, HPX-RQ-012, HPX-RQ-013, HPX-RQ-019, HPX-RQ-023 |
| Specification evidence | [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md); [docs/06-subsystems/formats/crypto-envelopes.md:1](../../../docs/06-subsystems/formats/crypto-envelopes.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md) |
| Implementation | Only child code evidence; family coverage is not whole-feature delivery |
| Verification | Review structural checks only; prior application tests are reported, not rerun |

## HPX-PROC-016.001 — Seal and open authenticated record

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-016.001 |
| Name | Seal and open authenticated record |
| Parent process | HPX-PROC-016 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | XChaCha20-Poly1305 random nonce; reject context substitution, malformed size/version and tag failures |
| Actors / initiating event | Storage invokes crypto |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Storage invokes crypto; expected workspace/logical binding/purpose/epoch and bounded bytes |
| Outputs | Randomized ciphertext or authenticated plaintext |
| Internal transformation | XChaCha20-Poly1305 random nonce; reject context substitution, malformed size/version and tag failures |
| Data read | Expected record context, workspace data key, wrapped key, authenticated mode |
| Data modified | Encrypted envelope bytes only |
| Core objects | HGOB envelope; expected context |
| Invoked subprocesses | None |
| Dependencies | Crypto adapter / runtime guards / future core policy |
| State changes | Encrypted envelope bytes only |
| Transaction boundary | Cryptographic operation, publication belongs to caller |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | At most 16 MiB object; fail closed on unsupported format/context/tag |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | OS entropy and trusted client delivery assumed; AEAD is not freshness, authorization or hostile-host confidentiality |
| Contract / postcondition | Envelope-supplied context never substitutes for caller expectation |
| Requirement seed paths | HPX-RQ-009, HPX-RQ-010, HPX-RQ-011, HPX-RQ-012, HPX-RQ-013, HPX-RQ-019, HPX-RQ-023 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/crypto/src/lib.rs; crates/crypto/tests/envelopes.rs |
| Verification evidence / proposed acceptance | Tamper/context/randomization/limit vectors; no crypto Lean proof |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md); [docs/06-subsystems/formats/crypto-envelopes.md:1](../../../docs/06-subsystems/formats/crypto-envelopes.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0631, HPX-EV-0465, HPX-EV-0793, HPX-EV-0771 |

## HPX-PROC-016.002 — Derive and rewrap passphrase key

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-016.002 |
| Name | Derive and rewrap passphrase key |
| Parent process | HPX-PROC-016 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | Argon2id v19 64 MiB/3 passes/1 lane; zeroize managed key/KDF/plaintext buffers |
| Actors / initiating event | Owner passphrase request |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Owner passphrase request; raw 1–1024-byte passphrase and random salt |
| Outputs | HGWK key wrapper; unchanged data ciphertext on rewrap |
| Internal transformation | Argon2id v19 64 MiB/3 passes/1 lane; zeroize managed key/KDF/plaintext buffers |
| Data read | Expected record context, workspace data key, wrapped key, authenticated mode |
| Data modified | Wrapper only when authorized |
| Core objects | HGWK wrapper; data key |
| Invoked subprocesses | None |
| Dependencies | Crypto adapter / runtime guards / future core policy |
| State changes | Wrapper only when authorized |
| Transaction boundary | KDF then caller-controlled wrapper publication |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | OS entropy and trusted client delivery assumed; AEAD is not freshness, authorization or hostile-host confidentiality |
| Contract / postcondition | No complete memory/swap erasure guarantee; no silent normalization |
| Requirement seed paths | HPX-RQ-009, HPX-RQ-010, HPX-RQ-011, HPX-RQ-012, HPX-RQ-013, HPX-RQ-019, HPX-RQ-023 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/crypto/src/lib.rs |
| Verification evidence / proposed acceptance | Passphrase wrap/rewrap/error tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md); [docs/06-subsystems/formats/crypto-envelopes.md:1](../../../docs/06-subsystems/formats/crypto-envelopes.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0631, HPX-EV-0465, HPX-EV-0793, HPX-EV-0771 |

## HPX-PROC-016.003 — Enforce HTTPS/session/request guards

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-016.003 |
| Name | Enforce HTTPS/session/request guards |
| Parent process | HPX-PROC-016 |
| Applicable milestone/status | L — documented local implementation; historical checks reported, not rerun |
| Purpose | No HTTP fallback; exact origin and cookie checks, 16 KiB headers, 14 MiB bodies, ten-second socket budget, 16 worker slots |
| Actors / initiating event | Untrusted loopback peer |
| Preconditions | Exact scoped authority and supported version; unlocked workspace for protected data; expected context must match |
| Inputs | Untrusted loopback peer; TLS, Host/Origin, headers/body, cookie |
| Outputs | Accepted bounded authenticated route or rejection |
| Internal transformation | No HTTP fallback; exact origin and cookie checks, 16 KiB headers, 14 MiB bodies, ten-second socket budget, 16 worker slots |
| Data read | Expected record context, workspace data key, wrapped key, authenticated mode |
| Data modified | Session memory; route-specific writes only |
| Core objects | TLS; Session; Request |
| Invoked subprocesses | None |
| Dependencies | Crypto adapter / runtime guards / future core policy |
| State changes | Session memory; route-specific writes only |
| Transaction boundary | Deadline before route does not cancel already executing KDF/transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | OS entropy and trusted client delivery assumed; AEAD is not freshness, authorization or hostile-host confidentiality |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-009, HPX-RQ-010, HPX-RQ-011, HPX-RQ-012, HPX-RQ-013, HPX-RQ-019, HPX-RQ-023 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | crates/runtime/src/main.rs |
| Verification evidence / proposed acceptance | Actual transport rejection harness and parser tests |
| Review verification scope | No application checks executed in this review. Static alignment evidence only; prior check scope stays in the cited development/test records. |
| Source sections | [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md); [docs/06-subsystems/formats/crypto-envelopes.md:1](../../../docs/06-subsystems/formats/crypto-envelopes.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0631, HPX-EV-0465, HPX-EV-0793, HPX-EV-0771 |

## HPX-PROC-016.004 — Enforce future mode-based egress

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-016.004 |
| Name | Enforce future mode-based egress |
| Parent process | HPX-PROC-016 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Core policy blocks mixed-source laundering; UI convenience is not authorization |
| Actors / initiating event | Any export/provider/clipboard/print/job |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Any export/provider/clipboard/print/job; authenticated mode and input policy |
| Outputs | Permit trusted-server route or deny non-trusted plaintext egress |
| Internal transformation | Core policy blocks mixed-source laundering; UI convenience is not authorization |
| Data read | Expected record context, workspace data key, wrapped key, authenticated mode |
| Data modified | None |
| Core objects | ModePolicy; SourceSet; egress plan |
| Invoked subprocesses | None |
| Dependencies | Crypto adapter / runtime guards / future core policy |
| State changes | No persistent state change |
| Transaction boundary | Read-only / no durable transaction |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Client-held mode unavailable; policy algebra and independent client delivery incomplete |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | OS entropy and trusted client delivery assumed; AEAD is not freshness, authorization or hostile-host confidentiality |
| Contract / postcondition | Consent, keys and server config do not override non-trusted denial |
| Requirement seed paths | HPX-RQ-009, HPX-RQ-010, HPX-RQ-011, HPX-RQ-012, HPX-RQ-013, HPX-RQ-019, HPX-RQ-023 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md); [docs/06-subsystems/formats/crypto-envelopes.md:1](../../../docs/06-subsystems/formats/crypto-envelopes.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0631, HPX-EV-0465, HPX-EV-0793, HPX-EV-0771 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-016.005 — Rotate keys and recover freshness

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-016.005 |
| Name | Rotate keys and recover freshness |
| Parent process | HPX-PROC-016 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Specify key distribution, rollback witness and recovery; epoch number alone does not rotate keys |
| Actors / initiating event | Owner recovery/rotation request |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner recovery/rotation request; authenticated key policy and retained history |
| Outputs | Approved new epoch/access without silently granting history |
| Internal transformation | Specify key distribution, rollback witness and recovery; epoch number alone does not rotate keys |
| Data read | Expected record context, workspace data key, wrapped key, authenticated mode |
| Data modified | Unspecified wrappers/policy/witness |
| Core objects | KeyEpoch; policy; freshness witness |
| Invoked subprocesses | None |
| Dependencies | Crypto adapter / runtime guards / future core policy |
| State changes | Unspecified wrappers/policy/witness |
| Transaction boundary | Unspecified migration and failure recovery |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Whole-database rollback not detected in current bounded design |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | OS entropy and trusted client delivery assumed; AEAD is not freshness, authorization or hostile-host confidentiality |
| Contract / postcondition | Identity, source bytes and immutable history remain unchanged |
| Requirement seed paths | HPX-RQ-009, HPX-RQ-010, HPX-RQ-011, HPX-RQ-012, HPX-RQ-013, HPX-RQ-019, HPX-RQ-023 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md); [docs/06-subsystems/formats/crypto-envelopes.md:1](../../../docs/06-subsystems/formats/crypto-envelopes.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0631, HPX-EV-0465, HPX-EV-0793, HPX-EV-0771 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-016.006 — Install, renew and remove browser trust

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-016.006 |
| Name | Install, renew and remove browser trust |
| Parent process | HPX-PROC-016 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Define enrollment, expiry, renewal, rollback and removal without warning bypass; code signing is separate |
| Actors / initiating event | Owner reviews exact certificate and trust scope |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner reviews exact certificate and trust scope; target platform |
| Outputs | Verified trust state or explicit failure |
| Internal transformation | Define enrollment, expiry, renewal, rollback and removal without warning bypass; code signing is separate |
| Data read | Expected record context, workspace data key, wrapped key, authenticated mode |
| Data modified | Explicit OS trust settings only when approved |
| Core objects | TLS certificate; trust scope; executable identity |
| Invoked subprocesses | None |
| Dependencies | Crypto adapter / runtime guards / future core policy |
| State changes | Explicit OS trust settings only when approved |
| Transaction boundary | External OS lifecycle; portable mechanism unresolved |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | OS entropy and trusted client delivery assumed; AEAD is not freshness, authorization or hostile-host confidentiality |
| Contract / postcondition | No implicit trust install; current ad-hoc development signing does not solve portable release trust |
| Requirement seed paths | HPX-RQ-009, HPX-RQ-010, HPX-RQ-011, HPX-RQ-012, HPX-RQ-013, HPX-RQ-019, HPX-RQ-023 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md); [docs/06-subsystems/formats/crypto-envelopes.md:1](../../../docs/06-subsystems/formats/crypto-envelopes.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0631, HPX-EV-0465, HPX-EV-0793, HPX-EV-0771 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |

## HPX-PROC-016.007 — Revoke access and protect diagnostics

| Field | Definition |
| --- | --- |
| Stable process ID | HPX-PROC-016.007 |
| Name | Revoke access and protect diagnostics |
| Parent process | HPX-PROC-016 |
| Applicable milestone/status | F — future obligation; mechanism incomplete |
| Purpose | Separate inability to undo prior disclosure from future denial; avoid plaintext logs/keys/private identifiers |
| Actors / initiating event | Owner revokes membership or requests diagnostics |
| Preconditions | Exact scoped authority and supported version; future mechanism must be approved before use |
| Inputs | Owner revokes membership or requests diagnostics; scoped subject |
| Outputs | Future access policy; bounded permitted diagnostic output |
| Internal transformation | Separate inability to undo prior disclosure from future denial; avoid plaintext logs/keys/private identifiers |
| Data read | Expected record context, workspace data key, wrapped key, authenticated mode |
| Data modified | Unspecified policy/audit records |
| Core objects | Membership; grant; diagnostic record |
| Invoked subprocesses | None |
| Dependencies | Crypto adapter / runtime guards / future core policy |
| State changes | Unspecified policy/audit records |
| Transaction boundary | Unspecified revocation and retention protocol |
| Side effects | Only listed writes/output delivery; no implied provider call or publication |
| Failure conditions | Malformed, stale or unauthorized context fails without mutation |
| Recovery / compensation | Retain exact intent; repair or retry only under current authority |
| Security / trust | OS entropy and trusted client delivery assumed; AEAD is not freshness, authorization or hostile-host confidentiality |
| Contract / postcondition | Erasure/redaction requires separate approved design |
| Requirement seed paths | HPX-RQ-009, HPX-RQ-010, HPX-RQ-011, HPX-RQ-012, HPX-RQ-013, HPX-RQ-019, HPX-RQ-023 |
| Traceability limit | Family-level design paths, not proof that every compound obligation is implemented. |
| Implementation evidence | Unspecified / no implementation or executed test evidence claimed. |
| Verification evidence / proposed acceptance | Unspecified / no implementation or executed test evidence claimed. |
| Review verification scope | No application checks executed in this review. No implementation evidence claimed; acceptance cases are proposed. |
| Source sections | [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md); [docs/06-subsystems/formats/crypto-envelopes.md:1](../../../docs/06-subsystems/formats/crypto-envelopes.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md); section IDs HPX-EV-0631, HPX-EV-0465, HPX-EV-0793, HPX-EV-0771 |
| Unspecified mechanism | Exact wire/record schema, algorithm, quotas, compensation and executable tests remain unselected except where the cited contract explicitly fixes them. This gap prevents an implementation-complete leaf claim. |
