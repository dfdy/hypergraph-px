# Evidence and authority register — Stage A

The baseline is the dirty working tree on 2026-10-26, not just HEAD. [Initial assessment](evidence/preliminary-assessment.md), [312 file hashes](evidence/baseline-files.json), [Git baseline](evidence/baseline-git-status.txt), [95-document inventory](evidence/document-inventory.csv), and [1,109 heading sections](evidence/sections.json) preserve provenance. Hashes describe reviewed bytes, not signatures or accepted requirements.

Owner decisions and explicitly adopted ADRs govern their stated scope. Inherited accepted obligations survive proposed editorial assembly. Historical implementation claims retain dates; later code does not silently replace intended design. ADR019 and the latest development checkpoint explicitly separate post-Commit replacement from text publication. Reserved IDs are not missing files accidentally omitted by this review. `.oldspecs/` remains ignored provenance, not an instruction source. No private runtime/manuscript/credential material was read or reproduced.

The section ledger is a mechanical source locator, not 1,109 independently accepted atomic claims. The following curated register contains semantic claims with classifications, status and process paths. Code-only observations are explicitly separated. Negative findings mean the scanned current contracts do not supply the mechanism, not that no future design could supply one.

| Class | Meaning |
| --- | --- |
| 1 | Explicitly specified |
| 2 | Logically derived |
| 3 | Code-supported evidence |
| 4 | Hypothesis |
| 5 | Contradictory evidence |
| 6 | Unspecified mechanism |
| 7 | Deferred / future |

## HPX-CLM-001 — Explicitly specified

Owner decisions and inherited accepted passages retain scoped authority; editorial proposed status does not revoke them.

Scope: Authority, all milestones. Processes: HPX-PROC-018.

| Exact source | Evidence locator |
| --- | --- |
| [docs/README.md:7](../../docs/README.md) | HPX-EV-0959 |
| [docs/02-governance/OWNER_DECISIONS.md:1](../../docs/02-governance/OWNER_DECISIONS.md) | HPX-EV-0039 |

## HPX-CLM-002 — Explicitly specified

Release is one Rust executable with embedded browser assets; build-time Node and Lean are not runtime servers.

Scope: Accepted release constraint. Processes: HPX-PROC-001, HPX-PROC-018.

| Exact source | Evidence locator |
| --- | --- |
| [docs/registers/requirements.csv:2](../../docs/registers/requirements.csv) | HPX-EV-EXT-fef8423fcf51 |
| [docs/08-assurance/build-and-release.md:32](../../docs/08-assurance/build-and-release.md) | HPX-EV-0728 |
| [docs/06-subsystems/document-engine.md:107](../../docs/06-subsystems/document-engine.md) | HPX-EV-0434 |

## HPX-CLM-003 — Explicitly specified

Exact UTF8 bytes/newlines and owned UTF16 mapping are required; no generic multi-owner whole-buffer save.

Scope: Local whole-owner editor; general multi-owner deferred. Processes: HPX-PROC-004, HPX-PROC-006.

| Exact source | Evidence locator |
| --- | --- |
| [docs/05-domain/text-and-anchors.md:7](../../docs/05-domain/text-and-anchors.md) | HPX-EV-0408 |
| [docs/06-subsystems/interfaces/browser-runtime.md:57](../../docs/06-subsystems/interfaces/browser-runtime.md) | HPX-EV-0564 |

## HPX-CLM-004 — Explicitly specified

Revision ancestry remains same-node; cross-identity Fork/Synthesis uses separate exact derivation.

Scope: Conceptual and bounded local implementation. Processes: HPX-PROC-005, HPX-PROC-007.

| Exact source | Evidence locator |
| --- | --- |
| [docs/05-domain/core-object-model.md:42](../../docs/05-domain/core-object-model.md) | HPX-EV-0348 |
| [docs/05-domain/provenance-model.md:36](../../docs/05-domain/provenance-model.md) | HPX-EV-0395 |

## HPX-CLM-005 — Explicitly specified

Occurrence identity, order and structural parent differ from logical node identity; snapshots close exact path bindings.

Scope: General domain; one-occurrence local writer. Processes: HPX-PROC-005.

| Exact source | Evidence locator |
| --- | --- |
| [docs/05-domain/document-semantics.md:30](../../docs/05-domain/document-semantics.md) | HPX-EV-0364 |
| [docs/05-domain/core-object-model.md:42](../../docs/05-domain/core-object-model.md) | HPX-EV-0348 |

## HPX-CLM-006 — Explicitly specified

Save acknowledges mutable Draft; explicit Commit appends revision/snapshot/publication/head/draft/receipt atomically.

Scope: Local publication. Processes: HPX-PROC-003.

| Exact source | Evidence locator |
| --- | --- |
| [docs/07-implementation/protocols/draft-publication.md:78](../../docs/07-implementation/protocols/draft-publication.md) | HPX-EV-0716 |
| [docs/04-architecture/data-architecture.md:32](../../docs/04-architecture/data-architecture.md) | HPX-EV-0160 |

## HPX-CLM-007 — Explicitly specified

Original frozen operation and digest reconcile unknown acknowledgements without replacing later typing.

Scope: Local bounded retry protocol. Processes: HPX-PROC-003, HPX-PROC-004.

| Exact source | Evidence locator |
| --- | --- |
| [docs/06-subsystems/interfaces/browser-runtime.md:18](../../docs/06-subsystems/interfaces/browser-runtime.md) | HPX-EV-0559 |
| [docs/07-implementation/protocols/draft-publication.md:47](../../docs/07-implementation/protocols/draft-publication.md) | HPX-EV-0715 |

## HPX-CLM-008 — Explicitly specified

Current optional record kinds reach 27; SQL schema, record wrappers, crypto envelopes and HTTP contract versions are independent.

Scope: Local dirty working tree; integration incomplete. Processes: HPX-PROC-003, HPX-PROC-008.

| Exact source | Evidence locator |
| --- | --- |
| [docs/07-implementation/data-structures/sqlite-records.md:193](../../docs/07-implementation/data-structures/sqlite-records.md) | HPX-EV-0697 |
| [docs/04-architecture/decisions/0007-explicit-record-versions.md:1](../../docs/04-architecture/decisions/0007-explicit-record-versions.md) | HPX-EV-0238 |

## HPX-CLM-009 — Explicitly specified

Keychain enrollment is explicit with retained passphrase recovery, verified encrypted backup and opt-in schema 2.

Scope: Accepted and bounded local native evidence. Processes: HPX-PROC-002, HPX-PROC-014.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:29](../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md) | HPX-EV-0268 |

## HPX-CLM-010 — Explicitly specified

Native secret creation and DB commit require ordered compensation; crash-created orphan is not speculatively overwritten.

Scope: Keychain failure lifecycle. Processes: HPX-PROC-002.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:30](../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md) | HPX-EV-0268 |

## HPX-CLM-011 — Explicitly specified

HTTPS verified loopback and exact origin/session checks precede protected routes; no HTTP fallback.

Scope: Current trusted-server loopback. Processes: HPX-PROC-001, HPX-PROC-016.

| Exact source | Evidence locator |
| --- | --- |
| [docs/06-subsystems/interfaces/browser-runtime.md:140](../../docs/06-subsystems/interfaces/browser-runtime.md) | HPX-EV-0572 |
| [docs/04-architecture/decisions/0004-local-https-bootstrap.md:1](../../docs/04-architecture/decisions/0004-local-https-bootstrap.md) | HPX-EV-0207 |

## HPX-CLM-012 — Explicitly specified

Non-trusted future plaintext egress is denied in core policy; client-held mode remains unavailable.

Scope: Future mode gate, not delivered client-held mode. Processes: HPX-PROC-011, HPX-PROC-012, HPX-PROC-013, HPX-PROC-016.

| Exact source | Evidence locator |
| --- | --- |
| [docs/08-assurance/privacy-and-data-protection.md:38](../../docs/08-assurance/privacy-and-data-protection.md) | HPX-EV-0776 |
| [docs/03-requirements/system-requirements.md:85](../../docs/03-requirements/system-requirements.md) | HPX-EV-0109 |

## HPX-CLM-013 — Explicitly specified

AEAD binds expected context and ciphertext; it is neither authorization nor a freshness witness.

Scope: Current crypto assumption. Processes: HPX-PROC-016.

| Exact source | Evidence locator |
| --- | --- |
| [docs/08-assurance/security-threat-model.md:32](../../docs/08-assurance/security-threat-model.md) | HPX-EV-0797 |
| [docs/06-subsystems/formats/crypto-envelopes.md:1](../../docs/06-subsystems/formats/crypto-envelopes.md) | HPX-EV-0465 |

## HPX-CLM-014 — Explicitly specified

The bounded local database has no whole-database rollback witness.

Scope: Explicit local residual limit. Processes: HPX-PROC-003, HPX-PROC-016.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/data-architecture.md:32](../../docs/04-architecture/data-architecture.md) | HPX-EV-0160 |
| [docs/06-subsystems/formats/hpx-workspace.md:48](../../docs/06-subsystems/formats/hpx-workspace.md) | HPX-EV-0482 |

## HPX-CLM-015 — Contradictory evidence

The inherited threat statement requires rejecting rollback/replay before durable editing, while the local architecture explicitly lacks whole-DB freshness.

Scope: Gate wording tension; distinguish replay/CAS from restoration of authentic old database. Processes: HPX-PROC-003, HPX-PROC-016.

| Exact source | Evidence locator |
| --- | --- |
| [docs/08-assurance/security-threat-model.md:60](../../docs/08-assurance/security-threat-model.md) | HPX-EV-0800 |
| [docs/04-architecture/data-architecture.md:32](../../docs/04-architecture/data-architecture.md) | HPX-EV-0160 |

## HPX-CLM-016 — Contradictory evidence

Component status still calls domain Serde present and application/transport planned; accepted refactor and later evidence describe implemented local behavior.

Scope: Historical status presented in current summaries; not competing domain rules. Processes: HPX-PROC-018.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/component-architecture.md:18](../../docs/04-architecture/component-architecture.md) | HPX-EV-0143 |
| [docs/04-architecture/decisions/0006-domain-serialization-boundary.md:1](../../docs/04-architecture/decisions/0006-domain-serialization-boundary.md) | HPX-EV-0228 |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:30](../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | HPX-EV-0850 |

## HPX-CLM-017 — Explicitly specified

Comments attach to exact committed passages as immutable retrospective entities; replies/edit/resolve are excluded.

Scope: Accepted bounded comments. Processes: HPX-PROC-009.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/decisions/0017-initial-durable-comments.md:1](../../docs/04-architecture/decisions/0017-initial-durable-comments.md) | HPX-EV-0289 |

## HPX-CLM-018 — Explicitly specified

Typed assertions retain ordered roles, definition versions, immutable review ancestry and distinct text-snapshot binding.

Scope: Local assertion overlays; review is not truth. Processes: HPX-PROC-009.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md:1](../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md) | HPX-EV-0248 |
| [docs/05-domain/assertions-and-predicates.md:7](../../docs/05-domain/assertions-and-predicates.md) | HPX-EV-0328 |

## HPX-CLM-019 — Explicitly specified

Named child starts from reviewed committed snapshot and preserves parent pending draft.

Scope: Accepted gated local branch design. Processes: HPX-PROC-008.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../docs/04-architecture/decisions/0018-initial-local-branches.md) | HPX-EV-0296 |

## HPX-CLM-020 — Explicitly specified

Autosave remains mutable private working state; provenance operations checkpoint exact pending source without Commit.

Scope: Accepted working-branch design; gated implementation. Processes: HPX-PROC-003, HPX-PROC-008.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:55](../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) | HPX-EV-0309 |

## HPX-CLM-021 — Explicitly specified

Exact promotion belongs to Commit; replacement links use bounded separately acknowledged post-Commit batch and retain original references.

Scope: Latest local gated implementation explicitly supersedes earlier atomic-with-Commit replacement. Processes: HPX-PROC-008.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:61](../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) | HPX-EV-0309 |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:444](../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | HPX-EV-0911 |

## HPX-CLM-022 — Explicitly specified

Neither branch nor working-copy capability is advertised at the current wiring checkpoint; actual runtime/older-reader integration remains pending.

Scope: Latest baseline checkpoint. Processes: HPX-PROC-008, HPX-PROC-018.

| Exact source | Evidence locator |
| --- | --- |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:442](../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | HPX-EV-0911 |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:452](../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | HPX-EV-0911 |

## HPX-CLM-023 — Explicitly specified

Selected graph is bounded and scoped; n-ary assertions are incidence groups; working-source Fork is excluded from this projection.

Scope: Local read model; no general graph completeness claim. Processes: HPX-PROC-006.

| Exact source | Evidence locator |
| --- | --- |
| [docs/06-subsystems/interfaces/browser-runtime.md:223](../../docs/06-subsystems/interfaces/browser-runtime.md) | HPX-EV-0582 |
| [docs/06-subsystems/graph-engine.md:85](../../docs/06-subsystems/graph-engine.md) | HPX-EV-0548 |
| [docs/09-guides/reference/DEVELOPMENT_STATE.md:452](../../docs/09-guides/reference/DEVELOPMENT_STATE.md) | HPX-EV-0911 |

## HPX-CLM-024 — Explicitly specified

Contributor publication evidence is not authorship, presence or complete attribution.

Scope: Bounded exact-snapshot local view. Processes: HPX-PROC-006, HPX-PROC-010.

| Exact source | Evidence locator |
| --- | --- |
| [docs/06-subsystems/interfaces/domain-navigation.md:109](../../docs/06-subsystems/interfaces/domain-navigation.md) | HPX-EV-0627 |

## HPX-CLM-025 — Deferred / future

Portable package bytes/schemas and full restore, general rights policy and federation mechanisms remain open future work.

Scope: Future; no delivered roundtrip/convergence claim. Processes: HPX-PROC-011, HPX-PROC-014, HPX-PROC-017.

| Exact source | Evidence locator |
| --- | --- |
| [docs/06-subsystems/external-integrations.md:32](../../docs/06-subsystems/external-integrations.md) | HPX-EV-0448 |
| [docs/04-architecture/component-architecture.md:60](../../docs/04-architecture/component-architecture.md) | HPX-EV-0148 |

## HPX-CLM-026 — Deferred / future

Academic export includes retained citations, selectable graph/branch content, relationship fallbacks and rights reports; exact compiler and XML/JSON schemas unselected.

Scope: Owner-confirmed future inclusion. Processes: HPX-PROC-013.

| Exact source | Evidence locator |
| --- | --- |
| [docs/06-subsystems/import-export.md:20](../../docs/06-subsystems/import-export.md) | HPX-EV-0552 |

## HPX-CLM-027 — Deferred / future

GitHub jobs require approved exact bytes/destination/remote precondition and explicit unknown state; SQLite and provider writes cannot be atomic.

Scope: Future optional integration. Processes: HPX-PROC-015.

| Exact source | Evidence locator |
| --- | --- |
| [docs/06-subsystems/external-integrations.md:87](../../docs/06-subsystems/external-integrations.md) | HPX-EV-0451 |

## HPX-CLM-028 — Deferred / future

Word reviews require selected exact base and explicit ambiguity; Zotero desktop and cloud remain separately authenticated read-only paths.

Scope: Future optional integrations. Processes: HPX-PROC-014, HPX-PROC-015.

| Exact source | Evidence locator |
| --- | --- |
| [docs/06-subsystems/external-integrations.md:113](../../docs/06-subsystems/external-integrations.md) | HPX-EV-0455 |
| [docs/03-requirements/system-requirements.md:105](../../docs/03-requirements/system-requirements.md) | HPX-EV-0110 |

## HPX-CLM-029 — Deferred / future

AI providers and MCP must converge on core scoped operations; observable interaction evidence is not hidden reasoning.

Scope: Future agent/tool contract; detailed interaction schemas missing. Processes: HPX-PROC-012, HPX-PROC-015.

| Exact source | Evidence locator |
| --- | --- |
| [docs/06-subsystems/document-engine.md:107](../../docs/06-subsystems/document-engine.md) | HPX-EV-0434 |
| [docs/03-requirements/system-requirements.md:101](../../docs/03-requirements/system-requirements.md) | HPX-EV-0110 |

## HPX-CLM-030 — Explicitly specified

Four checked Lean model theorems and one extracted spend-helper theorem do not prove full Rust Kahn or application.

Scope: Dated checked evidence, not rerun. Processes: HPX-PROC-006, HPX-PROC-018.

| Exact source | Evidence locator |
| --- | --- |
| [docs/08-assurance/formal-validation-digest.md:26](../../docs/08-assurance/formal-validation-digest.md) | HPX-EV-0743 |

## HPX-CLM-031 — Logically derived

Union of locally acyclic structural edge sets need not be acyclic; convergence requires additional acceptance semantics.

Scope: Logical counterexample, future federation. Processes: HPX-PROC-017.

| Exact source | Evidence locator |
| --- | --- |
| [docs/05-domain/hypergraph-mathematics.md:7](../../docs/05-domain/hypergraph-mathematics.md) | HPX-EV-0377 |
| [docs/04-architecture/component-architecture.md:56](../../docs/04-architecture/component-architecture.md) | HPX-EV-0148 |

## HPX-CLM-032 — Unspecified mechanism

No complete deterministic repair protocol classifies authoritative mutable drafts versus reconstructible indexes.

Scope: Missing local recovery contract, not proof all records are reconstructible. Processes: HPX-PROC-003.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/component-architecture.md:57](../../docs/04-architecture/component-architecture.md) | HPX-EV-0148 |
| [docs/07-implementation/data-structures/sqlite-records.md:44](../../docs/07-implementation/data-structures/sqlite-records.md) | HPX-EV-0682 |

## HPX-CLM-033 — Unspecified mechanism

Exact portable certificate lifecycle and supported distribution/platform matrix are not completed by one local trust enrollment.

Scope: Portable deployment gate. Processes: HPX-PROC-001, HPX-PROC-016.

| Exact source | Evidence locator |
| --- | --- |
| [docs/08-assurance/local-browser-trust-proposal.md:1](../../docs/08-assurance/local-browser-trust-proposal.md) | HPX-EV-0760 |
| [docs/04-architecture/decisions/0016-local-development-signing.md:1](../../docs/04-architecture/decisions/0016-local-development-signing.md) | HPX-EV-0280 |

## HPX-CLM-034 — Logically derived

Persistent receipt count grows with acknowledged operation count even when draft text slot is overwritten.

Scope: Analytical storage growth, no measured exhaustion. Processes: HPX-PROC-003.

| Exact source | Evidence locator |
| --- | --- |
| [docs/07-implementation/data-structures/sqlite-records.md:89](../../docs/07-implementation/data-structures/sqlite-records.md) | HPX-EV-0689 |

## HPX-CLM-035 — Code-supported evidence

The storage execute function inserts a StoredReceipt for successful Save as well as publication commands.

Scope: Code corroboration of receipt growth; code is not source of intended requirement. Processes: HPX-PROC-003.

| Exact source | Evidence locator |
| --- | --- |
| [crates/storage/src/lib.rs:837](../../crates/storage/src/lib.rs) | HPX-EV-EXT-ca59a3bc2570 |

## HPX-CLM-036 — Hypothesis

Repeated source validation/serialization may dominate large working-copy operations; no latency benchmark establishes a bottleneck.

Scope: Performance hypothesis supported by call shape. Processes: HPX-PROC-008.

| Exact source | Evidence locator |
| --- | --- |
| [crates/storage/src/working.rs:151](../../crates/storage/src/working.rs) | HPX-EV-EXT-6d3b17f99de8 |
| [crates/storage/src/working_clipboard.rs:222](../../crates/storage/src/working_clipboard.rs) | HPX-EV-EXT-db1c097f776c |

## HPX-CLM-037 — Unspecified mechanism

Quantitative performance, complete accessibility and portable platform acceptance thresholds remain unspecified.

Scope: Assurance completeness gap. Processes: HPX-PROC-018.

| Exact source | Evidence locator |
| --- | --- |
| [docs/08-assurance/testing-strategy.md:51](../../docs/08-assurance/testing-strategy.md) | HPX-EV-0814 |

## HPX-CLM-038 — Explicitly specified

Retention is immutable by default; deletion/redaction requires separate approved design, not an automatic quota remedy.

Scope: All retained canonical history. Processes: HPX-PROC-003, HPX-PROC-008, HPX-PROC-016.

| Exact source | Evidence locator |
| --- | --- |
| [docs/04-architecture/decisions/0011-retained-history.md:1](../../docs/04-architecture/decisions/0011-retained-history.md) | HPX-EV-0255 |
