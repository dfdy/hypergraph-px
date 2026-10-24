# ADR 0001: Fresh local core with future collaboration and key-custody boundaries

Status: accepted foundation decisions, owner confirmed 2026-10-24. Tracking: https://github.com/dfdy/hypergraph-px/issues/1.

- Project workspace Hypergraph PX MU-F; source repository dfdy/hypergraph-px.
- One human locally first; users/devices/groups are distinct design identities now.
- Separate frontend/domain/data development with single embedded-frontend Rust executable release.
- Trusted-server encryption first/default; client-held mode planned and unavailable until implemented.
- Support passphrase and OS-keychain startup unlock, default passphrase (owner follow-up, 2026-10-24).
- Keep browser-only and independently trusted client paths; require the trusted client for the stronger malicious-host-code-delivery guarantee (owner follow-up, 2026-10-24).
- User-held recovery for client-encrypted data; server resets cannot restore those keys.
- Future live coediting and explicit branches/merges are both required design targets.
- Reject recursive expansion cycles; permit hyperlink cycles in their own projection.
- Workspace/document sharing first, full retained history only by explicit grant.
- Lean model proofs and early Aeneas feasibility; prove selected Rust where supported; no runtime Lean.
- AGPL-3.0-only original application license.

Consequences: model context/occurrence identity, immutable history, transformation provenance and encryption-independent identities before durable formats. Selective sharing, offline policy epochs, key wrapping/rotation, implementation of trusted-client distribution, storage authority and conflict semantics still need mechanism ADRs. This decision does not adopt illustrative crypto/protocol choices or inherit old implementation formats. Validation and rollback for the first pure-core increment are recorded in issue #1; no durable user data exists yet.
