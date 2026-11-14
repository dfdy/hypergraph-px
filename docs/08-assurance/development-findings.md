# Current development findings and acceptance constraints

These stable finding IDs retain the actionable dispositions of the architecture review. Current owner decisions and actual test evidence supersede older checkpoints only within their scope; this consolidation adopts no mechanism or expanded guarantee.

## Finding dispositions

| Finding | Subject | Current disposition |
| --- | --- | --- |
| HPX-FIND-001 | Freshness | Complete authentic database rollback is not detected by the local-only design. OWNER009 supersedes the external-witness direction and OWNER008 surviving-state scope (GAP023); no witness enrollment/upgrade or whole-workspace freshness guarantee is inferred. |
| HPX-FIND-002 | Evidence scope | Distinguish current implementation and scoped test evidence from older preview and gated checkpoints. Use the current development-state summary and test register. |
| HPX-FIND-003 | Safe repair | RQ008/019 and GAP024 distinguish authoritative source from derived indexes. Audit before mutating repair; preserve originals and require exact inputs, deterministic order, atomic publication and crash/retry handling. |
| HPX-FIND-004 | Branch lifecycle | ADR018/019 require actual branch/working/replacement lifecycle acceptance. Later tests supersede the original capability-hold checkpoint only within their recorded scope; general composition acceptance remains open. |
| HPX-FIND-005 | Receipt retention | Receipt growth follows acknowledged operations but workload impact is unmeasured. No expiry, pruning or retry horizon is authorised. |
| HPX-FIND-006 | Repeated work | Repeated serialization/read/allocation is code-supported, not a measured regression. Measure before cache/dedup redesign; retain current authority, exact bytes and transaction scope. |
| HPX-FIND-007 | Contention | Coarse serialization adequacy is unmeasured. Distinguish request deadlines from already executing KDF/transactions; no lock/server redesign follows. |
| HPX-FIND-008 | Application boundary | RQ023 / ADR006 define logical responsibility, not a mandatory crate or facade framework. Shared operation semantics remain required. |
| HPX-FIND-009 | Compatibility | RQ024/031 distinguish wrapper validity, opaque preservation by an older reader and support for new commands/receipts. Use actual current test evidence, not the earlier pending checkpoint; incompatible rollout still needs explicit approval. |
| HPX-FIND-010 | Rights | OWNER058/059 select detailed candidate authority/rights designs. Disputed rights claims remain separate from access/confidentiality denial; specification adoption does not implement them. |
| HPX-FIND-011 | Export delivery | OWNER059 selects bundled conversion and captured citation resources. Requested output/citation/supplement scope remains; dependency licences, platform capacity and release acceptance still require actual checks. |
| HPX-FIND-012 | Portable restore | The selected candidate package design does not activate a format. Enrollment SQLite backup is not portable restore; exact closure and create-only restore acceptance remain required. |
| HPX-FIND-013 | Remote outcomes | Provider-specific preconditions, frozen approved inputs, local/remote non-atomicity and explicit unknown outcomes remain. No blind overwrite or provider/credential connection is authorised. |
| HPX-FIND-014 | Federation | Local DAG validity is not convergence. Preserve causal, authority and conflict requirements; selected initial package exchange is not naive union, timestamp ordering or an adopted MLS solution. |
| HPX-FIND-015 | AI and shared API | OWNER027/029/033/058/059 require workspace-local users, machine-side inference, shared permission enforcement and normal graph/history semantics. Earlier proposal-only/protocol-incomplete descriptions do not override selected designs; implementation remains separate. |
| HPX-FIND-016 | Trust lifecycle | Local TLS/signing/keychain evidence does not establish portable supported provisioning, renewal, removal or recovery. Trust, credentials and provider actions retain separate approval gates. |
| HPX-FIND-017 | Measured targets | Supported workload/platform/accessibility targets and numeric capacity require measurement. Do not invent thresholds or reduce quality guarantees. |
| HPX-FIND-018 | Requirement granularity | Compound source seeds are not proof of atomic completeness. Decompose the next selected feature proportionately; no compulsory wholesale re-atomization or parallel tracking bureaucracy. |
| HPX-FIND-019 | Proof scope | Handwritten review models, checked Lean models, extracted actual-Rust correspondence and product acceptance are distinct. Preserve exact assumptions and the formal digest; no whole-product proof claim. |
| HPX-FIND-020 | Durability | Enrollment backups and process restart tests do not establish full restore or power-loss/VFS/fsync/hardware guarantees. Broader restore and failure acceptance remain open. |

## Evidence and authority

Use the [current execution and evidence summary](../09-guides/reference/DEVELOPMENT_STATE.md), [test register](../02-governance/registers/tests.csv), [owner decisions](../02-governance/OWNER_DECISIONS.md), [recovery contract](recovery.md), [formal digest](formal-validation-digest.md) and [roadmap](../02-governance/roadmap.md). Manual contextual-equivalence assertion/review exists; automatic discovery and Lean conversion remain deferred. No receipt/history deletion, security exception, speculative cache/service redesign or publication permission follows from these findings.
