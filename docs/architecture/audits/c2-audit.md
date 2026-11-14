# C2 specification coverage audit

- **ID:** `HPX-ARCH-005`
- **Title:** C2 specification coverage audit
- **Purpose:** Trace the C2 model to existing requirements and scoped decisions, without selecting unresolved mechanisms.
- **Level:** `04-architecture`
- **Status:** `proposed`
- **Maintainer:** project owner; development agent records
- **Applies to:** HPX Specification V3 modelling workbench; current/default trusted-server execution and explicitly marked future interfaces
- **Upstream authority:** [system architecture](../../04-architecture/system-architecture.md), [component architecture](../../04-architecture/component-architecture.md), [data architecture](../../04-architecture/data-architecture.md), [owner decisions](../../02-governance/OWNER_DECISIONS.md)
- **Downstream dependencies:** [C2 view](../C2/containers.c4), [context](../context.c4), [executable components](../C3/executable.c4)
- **Verification:** [machine evidence and source identities](../evidence/c2-audit.json); LikeC4 1.60.0 validation and computed layout checks
- **Decision/history:** Owner requested a specification audit and completion of C2 on 2026-10-29. No new substantive architecture decision or application implementation is adopted.
- **Last reviewed:** 2026-10-29


Current diagram names and visual entry points are listed in the [navigation map](../navigation.md); earlier checkpoint titles below retain their historical scope.


## Result and meaning of completeness

C2 covers the identified execution, authoritative storage, relevant external resource and integration boundaries in the reviewed specification clauses. It is a proposed specification-derived view, not a claim that all represented functionality exists. Solid connections describe bounded existing operations; dashed connections describe planned/future operations. Source-era delivery statements do not override later scoped owner decisions or implementation evidence.

There are three internal C2 elements: browser execution, one native Rust executable, and the authoritative encrypted `.hpx` workspace. Additional displayed files and platform resources are context/artifacts, not more running containers. Presentation groups do not assert a shared deployment, trust boundary or common provider. The future mechanisms listed below remain unselected; completeness at C2 does not resolve their designs.

## Corrections made by this audit

1. Distinguished Zotero Desktop-local REST and cloud Web API, with separate read-only planned connections under the external Zotero context.
2. Added the ordinary OS clipboard boundary, distinct from the private provenance clipboard stored in `.hpx`.
3. Added the existing verified pre-keychain-upgrade `.hpx` backup, distinct from future portable export/backup formats and general restore.
4. Added the existing owner-to-runtime launch/configuration interaction. This is startup CLI support, not a complete command-line import/export/backup suite.
5. Made TLS certificate/key provisioning, browser trust, passphrase/session separation, workspace-only required recovery evidence and unavailable client-held delivery explicit in element descriptions. These do not create speculative new services.
6. Expanded file-artifact scope to retain the older PDF/HTML, manifest and read-only provenance-archive requirements alongside the newer academic export targets.

## Coverage matrix

| Specification subject | C2 representation and status | Evidence |
| --- | --- | --- |
| One executable embeds frontend; no Node, Lean or database server at runtime | `hpx.native`, browser delivery connection; existing bounded slice | [System architecture](../../04-architecture/system-architecture.md), [scope](../../01-purpose/scope-and-non-goals.md) |
| Browser editing, navigation, graph, comments, contributor and history UI | `hpx.browser`; panels and domain capabilities are lower-level responsibilities, not extra containers | [Frontend interaction](../../06-subsystems/frontend-interaction.md), [document engine](../../06-subsystems/document-engine.md) |
| Owned source, drafts, commits, exact history and current authority | Browser/runtime/workspace boundaries; exact mechanics belong at C3/C4 | [Workspace storage](../../06-subsystems/workspace-storage.md), [browser contract](../../06-subsystems/interfaces/browser-runtime.md) |
| Portable authoritative SQLite workspace and WAL recovery | `hpx.workspace`, outside executable; no separate database server | [Workspace format](../../06-subsystems/formats/hpx-workspace.md), [data architecture](../../04-architecture/data-architecture.md) |
| Required recovery evidence inside workspace; no external witness | Workspace description retains OWNER-009; no witness/registration box | [Owner decisions](../../02-governance/OWNER_DECISIONS.md), [recovery](../../08-assurance/recovery.md) |
| Secure startup, assets and authenticated loopback API | Browser/runtime connections; launch, trusted TLS and restrictive transport-key file requirements described | [ADR004](../../04-architecture/decisions/0004-local-https-bootstrap.md), [runtime source](../../../backend/crates/runtime/src/main.rs) |
| Authentication versus storage unlock | Browser/native descriptions; passphrase default, workspace keys remain Rust-only; no separate identity server selected | [System requirements](../../03-requirements/system-requirements.md), [ADR004](../../04-architecture/decisions/0004-local-https-bootstrap.md) |
| Optional OS keychain with portable passphrase recovery | `credentials` and explicit native connection; existing bounded macOS adapter | [ADR014](../../04-architecture/decisions/0014-keychain-unlock-policy.md) |
| Backup before explicit keychain schema upgrade | `enrollment_backups`; existing bounded verified snapshot, not general portable restore | [ADR014](../../04-architecture/decisions/0014-keychain-unlock-policy.md), [storage source](../../../backend/crates/storage/src/keychain.rs) |
| Ordinary copy/paste versus protected provenance clipboard | `os_clipboard` boundary; private acknowledged reference/checkpoint state remains in `.hpx` | [Document engine](../../06-subsystems/document-engine.md), [owned-source implementation](../../../frontend/src/owned-source.js) |
| Temporary exact Markdown download | Browser to `exchange_files`; existing subset; no durable-save or Commit claim | [External integrations](../../06-subsystems/external-integrations.md) |
| Word tracked-change/comment import | File to runtime; planned, untrusted bounded import; no Word-cloud connection or new contributor service | [External integrations](../../06-subsystems/external-integrations.md) |
| Conventional and academic exports, citations, exact supplements, rights reports | Runtime to file artifacts; planned; existing PDF/Markdown/HTML scope retained alongside RQ-030 targets | [User needs](../../03-requirements/user-needs.md), [export contract](../../06-subsystems/import-export.md) |
| Portable packages, interchange, encrypted backup and provenance archives | `exchange_files`; future formats/round trips remain gated, distinct from native `.hpx` | [User needs](../../03-requirements/user-needs.md), [external integrations](../../06-subsystems/external-integrations.md) |
| Separately selected/authenticated Zotero desktop and cloud adapters | `zotero.desktop`, `zotero.cloud`; two planned read-only connections | [Document engine](../../06-subsystems/document-engine.md), [user needs](../../03-requirements/user-needs.md) |
| Scoped human-approved model disclosure and agent proposals | `model_providers`; planned; no vendor/protocol selected and no implicit authoring authority | [Security](../../06-subsystems/security-cryptography.md), [system requirements](../../03-requirements/system-requirements.md) |
| Shared application semantics for REST/MCP clients | `api_clients` to native runtime; planned; development LikeC4 MCP is separate | [Component architecture](../../04-architecture/component-architecture.md) |
| GitHub release checks, reviewed document publication and create-only encrypted backup | `github`; planned; separate approval/disclosure/recovery purposes retained in descriptions | [External integrations](../../06-subsystems/external-integrations.md) |
| Collaboration, offline exchange and federation | `peers`; future; local-only listener and database transactions do not imply remote access/convergence | [System requirements](../../03-requirements/system-requirements.md), [roadmap](../../02-governance/roadmap.md) |
| Client-held custody, browser-only and independently trusted delivery paths | Explicit unavailable/gated constraints on browser/native roles; no unapproved new client container or remote topology selected | [Security](../../06-subsystems/security-cryptography.md), [system requirements](../../03-requirements/system-requirements.md) |
| Export/provider/clipboard/print egress restrictions | Existing trusted-server context; future core-policy obligation applies to every planned sink; no general client-held plaintext route claimed | [Security](../../06-subsystems/security-cryptography.md), [document engine](../../06-subsystems/document-engine.md) |
| Spell checking and user dictionaries | Planned local editor capability; packaging/persistence undecided, not a selected external checking service or new container | [Frontend interaction](../../06-subsystems/frontend-interaction.md) |
| Pandoc conversion packaging | Planned runtime adapter responsibility; no external installation or helper process selected | [Export contract](../../06-subsystems/import-export.md) |
| Domain, rights, composition, provenance and internal indexes | Inside native/browser/workspace responsibilities; no microservices or extra authoritative stores inferred | [Component architecture](../../04-architecture/component-architecture.md), [document engine](../../06-subsystems/document-engine.md) |
| Lean, bundlers, test servers, local development signing and deferred argument conversion | Development tools/assurance stay outside product runtime; INPUT's owner-deferred conversion is not enabled | [Scope](../../01-purpose/scope-and-non-goals.md), [INPUT](../../02-governance/requests.md), [ADR016](../../04-architecture/decisions/0016-local-development-signing.md) |

## Unresolved mechanisms and competing source statements

- **Zotero:** The two interface categories are specified; credentials, origins, endpoint profiles and exact selection contracts remain open. No automatic fallback is adopted.
- **Conversion:** Embedded Pandoc versus packaged resource/helper remains HPX-GAP-021. A separate converter process cannot be assumed from the product requirement.
- **Portable exchange and GitHub jobs:** Formats, restore semantics, remote expected-head reconciliation and credential lifecycle remain HPX-GAP-012/013 and related integration gates. One GitHub context box does not make these one atomic operation.
- **Client-held and federation:** Trusted-client delivery, egress enforcement, remote membership, key lifecycle and convergence remain HPX-GAP-008/014 and related requirements. Their absence from current execution is explicit, not evidence that those requirements were removed.
- **Spell checking:** Local baseline and release packaging are specified; engine, dictionary ownership and persistence location remain unselected. No standalone dictionary store is invented.
- **Historical conflicts:** `document-engine.md` retains an earlier “SQLite not selected” passage; accepted persistence contracts and later owner decisions select embedded SQLite. Earlier “no runtime/TLS/keychain” delivery passages retain historical scope. OWNER-009 expressly supersedes the external-witness proposal still preserved in recovery history. This audit changes none of those original passages or their acceptance records.

## Verification and limits

LikeC4 1.60.0 reports zero syntax/semantic diagnostics across three source files. Layout generation passes for C1, C2 and C3. Checks cover 16 named C2 elements, 17 connections (nine existing, eight planned), no leaked C3 internals, workspace/backup placement, local source links, status styling, curved C2 routing and C1 → C2 → C3 navigation. All 128 captured application/proof inputs remained byte-identical during this audit.

No browser was opened or automated. This is computed-model/layout verification, not a visual inspection of the owner's preview. No Rust compilation, application regression, runtime deployment, provider connection, trust action, format change, publication or new formal proof occurred. [Machine evidence](../evidence/c2-audit.json) records as-read source identities before the handoff documentation entry.
