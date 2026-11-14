# Prioritized recommendations

These are review proposals. Application work remains stopped, accepted decisions remain unchanged, and no publication is authorized by this report.

## Before extending the current implementation

1. Resolve the rollback acceptance wording: decide whether the current local slice explicitly accepts full-database rollback as residual risk or needs a separate freshness witness. Record the exact threat and recovery scope. [FIND-001](findings/HPX-FIND-001.md).
2. Reconcile current-status summaries and requirement delivery rows with exact dated evidence, preserving historical source passages. Keep accepted semantics separate from readiness. [FIND-002](findings/HPX-FIND-002.md), [FIND-018](findings/HPX-FIND-018.md).
3. On an explicit implementation resume, finish the working-source Provenance reader and close the already-required real branch/working lifecycle plus actual older-reader 20–27 preservation. Keep capabilities gated until then. Exercise the separate text Commit and replacement batch under interruption, lost replies, changed source, branch switching and undo. [FIND-004](findings/HPX-FIND-004.md), [FIND-009](findings/HPX-FIND-009.md).
4. Define an authoritative-versus-derived storage matrix and a non-mutating audit contract before building any repair command. Separately select a supported backup/restore and failure envelope. [FIND-003](findings/HPX-FIND-003.md), [FIND-020](findings/HPX-FIND-020.md).

## Measure before simplifying

Measure receipt/DB growth, whole-source serialization/decryption allocations and concurrent Save/history/unlock contention using supported workloads. Optimize only demonstrated work, preferably within one authorized transaction. Preserve original receipts, exact bytes and immutable history; do not introduce public plaintext hashes, global dedup or finer locks merely for stylistic reasons. Document a narrow application facade when another real command transport needs it. [FIND-005](findings/HPX-FIND-005.md), [FIND-006](findings/HPX-FIND-006.md), [FIND-007](findings/HPX-FIND-007.md), [FIND-008](findings/HPX-FIND-008.md).

## Before selecting each future dependent feature

| Feature | Required design decision/evidence | Finding |
| --- | --- | --- |
| Outbound export / provider context | Minimal mode/permission/claim decision interface; scoped rights reporting, historical disclosure and revocation | [010](findings/HPX-FIND-010.md) |
| Academic formats | Compiler packaging interpretation, licence/provenance, exact writer/profile/resources and XML/JSON semantics | [011](findings/HPX-FIND-011.md) |
| Portable workspace / backup | Versioned closure, inclusion/privacy, identity collisions, quotas, authenticated recovery and create-only restore | [012](findings/HPX-FIND-012.md) |
| GitHub / remote side effects | Provider-specific preconditions, encrypted outbox transition table and unknown-outcome reconciliation | [013](findings/HPX-FIND-013.md) |
| Collaboration / federation | Causal authority, deterministic structural conflict acceptance and key/membership history policy | [014](findings/HPX-FIND-014.md) |
| Live agents / MCP | Exact versioned proposal/approval binding, target stale checks, delegation and disclosure | [015](findings/HPX-FIND-015.md) |
| Portable distribution | Supported platform/audience, certificate/signing lifecycle and separately authorized trust/credentials | [016](findings/HPX-FIND-016.md) |
| Quality claims | Owner-selected measurable workloads and accessibility/platform scenarios | [017](findings/HPX-FIND-017.md) |

Do not implement these future features simply because the review identifies their gaps. Follow the roadmap and adopted owner scope. Extend formal/property evidence incrementally around the highest-value contracts and retain exact implementation correspondence limits. [FIND-019](findings/HPX-FIND-019.md).
