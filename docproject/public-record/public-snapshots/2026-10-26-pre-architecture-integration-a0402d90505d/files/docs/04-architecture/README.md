# Architecture

Level `04-architecture`. This is navigation, not a new requirement. See the [documentation constitution](../README.md) for status and authority.

- [Component and Module Architecture](<component-architecture.md>) — `HPX-ARCH-002`; proposed.
- [Data and Storage Architecture](<data-architecture.md>) — `HPX-ARCH-003`; proposed.
- [Existing ADR 0001, retain decision identity/status](<decisions/0001-foundation-decisions.md>) — `HPX-ADR-001`; proposed.
- [Existing ADR 0002, retain decision identity/status](<decisions/0002-trusted-server-envelopes.md>) — `HPX-ADR-002`; proposed.
- [Existing ADR 0003, retain decision identity/status](<decisions/0003-sqlite-local-writer.md>) — `HPX-ADR-003`; proposed.
- [Existing ADR 0004, retain decision identity/status](<decisions/0004-local-https-bootstrap.md>) — `HPX-ADR-004`; proposed.
- [Documentation migration and archive authority](<decisions/0005-documentation-migration.md>) — `HPX-ADR-005`; proposed.
- [Serialization outside the pure domain](<decisions/0006-domain-serialization-boundary.md>) — `HPX-ADR-006`; accepted.
- [Explicit persistent record versions](<decisions/0007-explicit-record-versions.md>) — `HPX-ADR-007`; accepted.
- [Retained immutable committed history](<decisions/0011-retained-history.md>) — `HPX-ADR-011`; accepted.
- [System Architecture](<system-architecture.md>) — `HPX-ARCH-001`; proposed.

Unpopulated future topics remain reserved in the [document register](../registers/document-inventory.csv); no empty specification implies an implemented service.

- [Accepted keychain unlock/recovery policy](decisions/0014-keychain-unlock-policy.md) — HPX-ADR-014; owner approved 2026-10-25; evidence tracked separately.
- [Accepted semantic annotation/snapshot scope](decisions/0010-semantic-annotation-snapshots.md) — HPX-ADR-010; owner adopted separate versioned overlays; implementation/evidence tracked separately.
- [Accepted first Merge workflow](decisions/0015-initial-merge-workflow.md) — HPX-ADR-015; reviewed synthesis accepted; later parent-branch intent planned in stage5.

- [Local development signing identity](decisions/0016-local-development-signing.md) — HPX-ADR-016; identity and exact user code-signing trust approved; continuity test awaits the specific temporary-item native grant.

- [Accepted first durable comments](decisions/0017-initial-durable-comments.md) — HPX-ADR-017; owner adopted committed-passage comments first; wider lifecycle and draft anchors deferred.

- [Accepted first local branch source policy](decisions/0018-initial-local-branches.md) — HPX-ADR-018; owner selected committed snapshots; implementation is in progress and branch Merge remains separate.

- [Working branches and reference checkpoints](decisions/0019-working-branches-and-reference-checkpoints.md) — HPX-ADR-019; owner adopted this design; backend checkpoint/reference verification is separate from pending frontend delivery.
