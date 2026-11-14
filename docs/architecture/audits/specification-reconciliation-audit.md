# Active specification reconciliation audit — 2026-10-30

## Result and authority

Removed superseded active requirements and false current-status claims under HPX-OWNER-010/019/026–031. No new architectural, permission, wire or persistence mechanism was adopted. Current user scope is defined once in [Multi-user and AI Collaboration](../../06-subsystems/ai-collaboration.md), with the shared API contract in [Browser/Runtime](../../06-subsystems/interfaces/browser-runtime.md).

## Review coverage and limits

Inventoried all 70 materialized registered contracts and scanned all 98 Markdown files under `docs/`. Reviewed matching requirement/status passages, neighbouring scope/authority and related source evidence; 32 registered files were reconciled. The inventory below distinguishes corrections from intentionally retained history. This is a detailed scoped editorial/consistency audit, not an exhaustive implementation or security audit.

Static implementation cross-checks used `crates/runtime/src/main.rs` (`run`, `route_inner`, embedded ASSETS include), runtime dependency pins, `crates/storage/src/authority.rs`, frontend dependency metadata and existing scoped evidence records. Source existence is not executed application acceptance. No tests were rerun to promote implementation status.

## Removed or corrected specifications

| Finding | Correction and evidence |
| --- | --- |
| Duplicate and competing user qualifications in 26 current documents/indexes | Replaced long supersession boilerplate with concise current scope; canonical contract now states workspace-local users, one machine user per provider per workspace and workspace-user permissions. |
| Residual mandatory node/resource-specific grants | Removed from SQLite specification/current summaries; selected nodes bind operations, not permission records. OWNER030/031 govern workspace-user rights. |
| Requirement summaries differed from their register | RQ032/033/034/038 summaries synchronised; no user reuse or multiple same-provider users is required. |
| Collaboration described as deferred with federation | User needs and repeated scope labels now make same-workspace collaboration baseline; federation stays separately future. |
| Suggestion-only capability description | Added required direct selected-node MCP editing with human-equivalent operation semantics; optional reviewed proposals remain valid. |
| No Rust HTTP/session/draft/publication server claimed | Replaced obsolete Browser/Runtime checkpoint with bounded existing HTTPS/SQLite/runtime-adapter evidence and explicit missing multi-user/AI mechanisms. |
| Backend declared entirely unimplemented/outside scope | Document-engine now distinguishes implemented bounded capabilities from unmet target scope; a specification edit does not enable code or new privileges. |
| Source-era component table marked application/transport/live UI planned | Replaced current inventory with bounded source-backed statuses and formal-digest references; original source preserved in snapshots/registers. |
| Transaction system described as nonexistent | Data architecture recognises current bounded SQLite publication/receipts; shared user permissions and broader target flows remain partial. |
| HTTPS labelled unimplemented and TLS library unselected | System/security architecture now references ADR004, runtime rustls/httparse pins and supplied-cert startup; certificate lifecycle, trust and hostile-host limits remain. |
| KaTeX still candidate-only | Frontend specification recognises pinned/bundled source evidence; rendering/security/accessibility obligations remain. |
| Copy required promotion approval or tab-only fallback | Component and anchor specifications use ADR019 private checkpoints; Copy does not Commit or silently restructure source. Later Commit/reference replacement remains separate. |
| Arbitrary-selection graph dialog remained a target | Acceptance, RQ029 register and runtime UI wording use selected-node main-editor Graph tab. Current dialog stays explicit code evidence. |
| Automatic milestone push/issue rules contradicted owner hold | Deleted automatic publication and issue-tracking mandate from active governance rules; explicit current authorisation required. |
| Obsolete current documentation paths | Governance rules now reference docs README, domain/navigation, formal digest and current development-state paths. Source-original paths remain in provenance. |
| Model inference output implied unconditional proposal-only actions | Provider response is content; authorised machine-user actions use the shared API. Actor/dependency distinction adds no extra user/permission identity. |
| Stale register status and acceptance references | Updated RQ001 bounded runtime delivery, RQ029 target, RQ037/038 permission limits, ADR action qualifications and affected review dates; preserved historical test results. |

## Deliberately retained

Historical owner decisions, source-era accepted ADR records, immutable source/claim hashes and as-run test/proof/publication evidence are retained with their dates/scopes. In particular, ADR001’s original one-human checkpoint is provenance already superseded by owner direction, not a current architecture restriction. Current one-owner implementation descriptions remain truthful evidence. Model/C4 current-dialog mappings and historical format/proof checkpoints must not be rewritten as delivered V3 designs.

Unimplemented but still-required or approved planned features were not deleted merely because they are unfinished: shared workspace users/API/MCP/chat, Graph tab, exact composition, deferred federation/client-held mode, optional citation/export and specifically approved parent-Merge work retain their statuses. No legal/license text, accepted history/identity/source-byte invariant, persistent format or API contract changed.

## Open V3 work

HPX-GAP-026–029 remain open for workspace-local user/provider identity and concurrency, chat/context representation/disclosure, MCP selection/tool/recovery contracts and workspace permission administration/revocation. The permission vocabulary and provider canonicalisation are not invented by this cleanup. Full Graph tab adjacency/selection/query design and complete schema/API coverage remain unimplemented. Current tests do not establish multi-user security or full V3 acceptance.

## Executed verification

[Machine evidence](../evidence/specification-reconciliation-audit.json): LikeC4 validates19 source files; all38 views reachable; 25 saved frames retain 349 box and 368 edge geometries; 1120 local model file links resolve. Verified 243 pre-cleanup snapshot payload hashes and the original 236-file owner-requested backup; 772 protected application/public-archive/manifest hashes unchanged. Documentation checks are recorded in the machine evidence after execution. No application tests/build/launch,browser,generation,proof,trust/provider/workspace changes,commit or publication.

## Registered-contract disposition

| ID | Document | Disposition |
| --- | --- | --- |
| HPX-PRIN-002 | [principles.md](../../01-purpose/principles.md) | No superseded requirement identified in scoped text/status review |
| HPX-PRIN-001 | [project-purpose.md](../../01-purpose/project-purpose.md) | No superseded requirement identified in scoped text/status review |
| HPX-PRIN-004 | [scope-and-non-goals.md](../../01-purpose/scope-and-non-goals.md) | Reconciled current text |
| HPX-GOV-006 | [ai-development-protocol.md](../../02-governance/ai-development-protocol.md) | Reconciled current text |
| HPX-GOV-002 | [licensing-policy.md](../../02-governance/licensing-policy.md) | No superseded requirement identified in scoped text/status review |
| HPX-GOV-004 | [roadmap.md](../../02-governance/roadmap.md) | Reconciled current text |
| HPX-REQ-004 | [acceptance-criteria.md](../../03-requirements/acceptance-criteria.md) | Reconciled current text |
| HPX-REQ-002 | [system-requirements.md](../../03-requirements/system-requirements.md) | Reconciled current text |
| HPX-REQ-001 | [user-needs.md](../../03-requirements/user-needs.md) | Reconciled current text |
| HPX-ARCH-002 | [component-architecture.md](../../04-architecture/component-architecture.md) | Reconciled current text |
| HPX-ARCH-003 | [data-architecture.md](../../04-architecture/data-architecture.md) | Reconciled current text |
| HPX-ARCH-001 | [system-architecture.md](../../04-architecture/system-architecture.md) | Reconciled current text |
| HPX-DOM-001 | [core-object-model.md](../../05-domain/core-object-model.md) | Reconciled current text |
| HPX-DOM-003 | [document-semantics.md](../../05-domain/document-semantics.md) | Reconciled current text |
| HPX-DOM-002 | [hypergraph-mathematics.md](../../05-domain/hypergraph-mathematics.md) | No superseded requirement identified in scoped text/status review |
| HPX-DOM-004 | [provenance-model.md](../../05-domain/provenance-model.md) | Reconciled current text |
| HPX-DOM-006 | [text-and-anchors.md](../../05-domain/text-and-anchors.md) | Reconciled current text |
| HPX-SUB-010 | [ai-collaboration.md](../../06-subsystems/ai-collaboration.md) | Reconciled current text |
| HPX-SUB-002 | [document-engine.md](../../06-subsystems/document-engine.md) | Reconciled current text |
| HPX-SUB-011 | [external-integrations.md](../../06-subsystems/external-integrations.md) | Reconciled current text |
| HPX-SUB-009 | [frontend-interaction.md](../../06-subsystems/frontend-interaction.md) | Reconciled current text |
| HPX-SUB-001 | [graph-engine.md](../../06-subsystems/graph-engine.md) | Reconciled current text |
| HPX-SUB-008 | [import-export.md](../../06-subsystems/import-export.md) | Reconciled current text |
| HPX-SUB-012 | [security-cryptography.md](../../06-subsystems/security-cryptography.md) | Reconciled current text |
| HPX-SUB-006 | [workspace-storage.md](../../06-subsystems/workspace-storage.md) | Reconciled current text |
| HPX-ALG-001 | [formal-invariants.md](../../07-implementation/formal-invariants.md) | No superseded requirement identified in scoped text/status review |
| HPX-ASSUR-005 | [build-and-release.md](../../08-assurance/build-and-release.md) | No superseded requirement identified in scoped text/status review |
| HPX-ASSUR-003 | [privacy-and-data-protection.md](../../08-assurance/privacy-and-data-protection.md) | Reconciled current text |
| HPX-ASSUR-006 | [recovery.md](../../08-assurance/recovery.md) | Reconciled current text |
| HPX-ASSUR-002 | [security-threat-model.md](../../08-assurance/security-threat-model.md) | Reconciled current text |
| HPX-ASSUR-001 | [testing-strategy.md](../../08-assurance/testing-strategy.md) | Reconciled current text |
| HPX-GUIDE-001 | [documentation-plan.md](../../09-guides/documentation-plan.md) | No superseded requirement identified in scoped text/status review |
| HPX-DOM-008 | [assertions-and-predicates.md](../../05-domain/assertions-and-predicates.md) | No superseded requirement identified in scoped text/status review |
| HPX-FMT-001 | [hpx-workspace.md](../../06-subsystems/formats/hpx-workspace.md) | No superseded requirement identified in scoped text/status review |
| HPX-FMT-002 | [crypto-envelopes.md](../../06-subsystems/formats/crypto-envelopes.md) | No superseded requirement identified in scoped text/status review |
| HPX-API-001 | [domain-navigation.md](../../06-subsystems/interfaces/domain-navigation.md) | Reconciled current text |
| HPX-API-002 | [browser-runtime.md](../../06-subsystems/interfaces/browser-runtime.md) | Reconciled current text |
| HPX-API-003 | [crypto-adapter.md](../../06-subsystems/interfaces/crypto-adapter.md) | No superseded requirement identified in scoped text/status review |
| HPX-DATA-001 | [sqlite-records.md](../../07-implementation/data-structures/sqlite-records.md) | Reconciled current text |
| HPX-PROTO-001 | [draft-publication.md](../../07-implementation/protocols/draft-publication.md) | Reconciled current text |
| HPX-ALGO-001 | [expansion-validation.md](../../07-implementation/algorithms/expansion-validation.md) | No superseded requirement identified in scoped text/status review |
| HPX-GUIDE-002 | [getting-started.md](../../09-guides/developers/getting-started.md) | Reconciled current text |
| HPX-GUIDE-005 | [formal-validation.md](../../09-guides/developers/formal-validation.md) | No superseded requirement identified in scoped text/status review |
| HPX-GUIDE-006 | [development-evidence.md](../../09-guides/reference/development-evidence.md) | Reconciled current text |
| HPX-ADR-001 | [0001-foundation-decisions.md](../../04-architecture/decisions/0001-foundation-decisions.md) | Retained historical/decision/evidence scope |
| HPX-ADR-002 | [0002-trusted-server-envelopes.md](../../04-architecture/decisions/0002-trusted-server-envelopes.md) | Retained historical/decision/evidence scope |
| HPX-ADR-003 | [0003-sqlite-local-writer.md](../../04-architecture/decisions/0003-sqlite-local-writer.md) | Retained historical/decision/evidence scope |
| HPX-ADR-004 | [0004-local-https-bootstrap.md](../../04-architecture/decisions/0004-local-https-bootstrap.md) | Retained historical/decision/evidence scope |
| HPX-ADR-005 | [0005-documentation-migration.md](../../04-architecture/decisions/0005-documentation-migration.md) | Retained historical/decision/evidence scope |
| HPX-ADR-006 | [0006-domain-serialization-boundary.md](../../04-architecture/decisions/0006-domain-serialization-boundary.md) | Retained historical/decision/evidence scope |
| HPX-ADR-007 | [0007-explicit-record-versions.md](../../04-architecture/decisions/0007-explicit-record-versions.md) | Retained historical/decision/evidence scope |
| HPX-ADR-011 | [0011-retained-history.md](../../04-architecture/decisions/0011-retained-history.md) | Retained historical/decision/evidence scope |
| HPX-ASSUR-009 | [formal-validation-digest.md](../../08-assurance/formal-validation-digest.md) | Retained historical/decision/evidence scope |
| HPX-GUIDE-007 | [DEVELOPMENT_STATE.md](../../09-guides/reference/DEVELOPMENT_STATE.md) | Reconciled current text |
| HPX-ADR-014 | [0014-keychain-unlock-policy.md](../../04-architecture/decisions/0014-keychain-unlock-policy.md) | Retained historical/decision/evidence scope |
| HPX-ADR-010 | [0010-semantic-annotation-snapshots.md](../../04-architecture/decisions/0010-semantic-annotation-snapshots.md) | Retained historical/decision/evidence scope |
| HPX-ADR-015 | [0015-initial-merge-workflow.md](../../04-architecture/decisions/0015-initial-merge-workflow.md) | Retained historical/decision/evidence scope |
| HPX-ADR-016 | [0016-local-development-signing.md](../../04-architecture/decisions/0016-local-development-signing.md) | Retained historical/decision/evidence scope |
| HPX-ADR-017 | [0017-initial-durable-comments.md](../../04-architecture/decisions/0017-initial-durable-comments.md) | Retained historical/decision/evidence scope |
| HPX-ADR-018 | [0018-initial-local-branches.md](../../04-architecture/decisions/0018-initial-local-branches.md) | Retained historical/decision/evidence scope |
| HPX-ADR-019 | [0019-working-branches-and-reference-checkpoints.md](../../04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md) | Retained historical/decision/evidence scope |
| HPX-ALGO-002 | [parent-merge.md](../../07-implementation/algorithms/parent-merge.md) | No superseded requirement identified in scoped text/status review |
| HPX-ARCH-005 | [c2-audit.md](c2-audit.md) | Retained historical/decision/evidence scope |
| HPX-ARCH-006 | [c3-audit.md](c3-audit.md) | Retained historical/decision/evidence scope |
| HPX-ARCH-007 | [runtime-api-audit.md](runtime-api-audit.md) | Retained historical/decision/evidence scope |
| HPX-ARCH-008 | [api-implementation-audit.md](api-implementation-audit.md) | Retained historical/decision/evidence scope |
| HPX-ARCH-009 | [frontend-delivery-audit.md](frontend-delivery-audit.md) | Retained historical/decision/evidence scope |
| HPX-ARCH-010 | [pure-domain-audit.md](pure-domain-audit.md) | Retained historical/decision/evidence scope |
| HPX-ARCH-011 | [c3-coverage-audit.md](c3-coverage-audit.md) | Retained historical/decision/evidence scope |
| HPX-ARCH-012 | [application-coordination-audit.md](application-coordination-audit.md) | Retained historical/decision/evidence scope |
