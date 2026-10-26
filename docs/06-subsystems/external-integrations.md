# External Integrations

## Common metadata

- **ID:** `HPX-SUB-011`
- **Title:** External Integrations
- **Purpose:** Explicitly gated citations, providers, Word import, GitHub, exports and future updates.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-ARCH-001](<../04-architecture/system-architecture.md>); [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Fixture controls and future contracts are not durable service implementations. Capabilities must report unavailable honestly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Responsibilities and boundaries

Explicitly gated citations, providers, Word import, GitHub, exports and future updates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Inputs and outputs

Explicitly gated citations, providers, Word import, GitHub, exports and future updates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## State and operations

Source inputs propose workspace-centric .hpx, .hpxz portable packages, .hpx.json interchange and .hpxe encrypted backups. Only the .hpx local slice has accepted implementation design. The other byte formats, streaming encryption, compression, dependency/asset packaging and round-trip contracts remain TBD. Proposed GitHub backup is separate from Markdown publication: locally encrypt, create-only remote names with race-safe preconditions, verify before success and restore as new workspace by default. These proposal details are retained in the source register, not silently adopted as implemented APIs. No credentials or provider connections are created by migration.

### 10. Future release discovery and runtime updates

Source `HPX-SRC-0032`, original lines 113–123. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Planned; not implemented. The application should check the project's GitHub releases for a newer applicable version and notify the user. Compare semantic versions and select a compatible release artifact for the operating system/architecture; prerelease or development builds must not silently switch release channels.

Distinguish installation origin using explicit build/distribution metadata rather than the executable's location or version string alone:

- **Downloaded official runtime:** offer to download and install the release after explicit user approval. Do not silently replace a running executable or interrupt unsaved work. Verify the artifact's authenticity and integrity before installation; define safe replacement/restart, failure recovery and any storage-format migration/rollback constraints before enabling updates. The release remains one Rust executable containing the built frontend assets.
- **Self-compiled build:** notify that a newer release exists and provide its release notes/source link. Do not overwrite the developer's executable or automatically rebuild their checkout.
- **Unknown origin or externally managed installation:** use notification-only behavior until a supported installation/update mechanism is identified.

Allow users to disable automatic checks and request a manual check. A release check sends no document/workspace content, keys or credentials; network activity remains subject to the active security/egress policy. Failure to reach GitHub must not prevent local work. Scheduling, artifact signing/trust bootstrap, platform installation permissions and restart/migration mechanics require a concrete design before implementation. These requirements do not authorize publication of application source or user documents to GitHub.

### 8.4 Current-branch Markdown export

Source `HPX-SRC-0028`, original lines 210–223. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Keep three explicit source choices:

| Choice | Exact input and honest result |
|---|---|
| Temporary local download | Exact captured tab buffer/local sequence, including unacknowledged typing; label temporary/uncommitted, no backend persistence or durable device-write claim |
| Acknowledged draft export | Authorized draft ID, exact acknowledged sequence/generation and base composition closure |
| Committed branch/snapshot export | Opaque Hypergraph document/branch identity, exact expected head or immutable snapshot and complete permitted dependency closure |

The optional export service may use candidate `POST /exports`, `GET /exports/{export}` and `GET /exports/{export}/content` under the candidate base. Its result binds the actual input head/sequence, format, safe filename/content type, expiry and bounded download reference. A stale current-head precondition conflicts; never substitute a newer head, unacknowledged buffer or rendered HTML. Later typing stays in the editor and does not change the captured export. The browser may request a download but cannot confirm that the user has durably saved it.

For shared/nested occurrences, agree flattening versus reference-preserving Markdown, ownership/lineage disclosure, inaccessible dependencies, citations and closure semantics before claiming production export fidelity. Retain exact Markdown/LaTeX rather than scraping rendered DOM. Formatting/conversion choices are explicit export options, not hidden source edits. Resolve only authorized dependencies; export permission does not grant all history or provenance. Protect temporary artifacts and recheck download rights. Export publishes no implicit snapshot, commit or branch transition; client-held/non-trusted mode prohibits document export at the core policy boundary, including client-local downloads, under the [egress policy](<security-cryptography.md>).

### 8.5 Optional GitHub connection and reviewed document publication

Source `HPX-SRC-0028`, original lines 224–252. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

This is a **planned, capability-gated external integration**, not an implemented service or a requirement for the first local editor. A visual dialog may demonstrate unavailable/fixture states. Neither opening it nor connecting an account creates a repository or transmits content. The application's GitHub authorization is separate from developer tools/connectors and from authorization to push this software's source repository. Those existing permissions are not document-disclosure consent.

Hypergraph branch IDs, destination Git branch names, repository identities, remote file blob SHAs and remote commit/head IDs are distinct. Review a selected Markdown document export only, not workspace directories, hidden history, graph/crypto objects, credentials or unrelated files. Production must reject fixture source/branch identities and derive the exact authorized export through application services.

Planned flow: connect explicitly → choose authorized account/repository/branch/path → select exact export source → preview bytes/diff, visibility and expected remote state → approve the frozen plan → enqueue external job → reconcile its verified result. Repository/branch creation is a separate explicit side effect with separate operation identity and expected-absence conditions; default repository creation to private, and require explicit review for public disclosure. Creation does not imply pushing. A Hypergraph commit, if needed, is a separately reviewed local action rather than a hidden prerequisite/side effect.

Optional adapter operations include `getGitHubConnection`, `beginGitHubAuthorization`, `listGitHubRepositories`, `prepareGitHubPush`, `executeGitHubPush` and `getGitHubPush`; repository creation/cancellation/disconnect are separate operations. Candidate application routes, **all unimplemented**, are relative to `/api/v1/integrations/github` and are not GitHub provider API routes:

| Surface | Candidate methods/paths and behavior |
|---|---|
| Connection/authorization | `GET /status`, `POST /authorizations`, `GET /authorizations/{authorization}`, `DELETE /authorizations/{authorization}`, `DELETE /connection`; session-owned state, cancellation/expiry/revocation, no provider credentials returned |
| Destinations | `GET /owners`, `GET /repositories`, `GET /repositories/{repository}/branches`; authorized bounded choices and exact write/visibility/head information |
| Explicit creation | `POST /repositories`; reviewed owner/name/visibility, operation ID and expected connection; new branch creation needs a separately agreed contract |
| Reviewed push | `POST /pushes/preview`, `POST /pushes`, `GET /pushes/{push}`; exact frozen source/bytes, destination/visibility, remote preconditions, approval, job/reconciliation |

The frozen plan binds account/connection, stable repository identity, destination branch/path, source head or acknowledged draft sequence, exact bytes and permitted metadata, visibility/disclosure scope, expected remote head and file SHA or explicit absence, expiry, and approval scope. Changes to a current-state precondition, destination, visibility or payload require a new preview/approval. Recheck rights, connection/account, visibility and expectations at execution. Never silently force-push or overwrite newer remote state. Validate paths against traversal/absolute paths, sensitive reserved destinations and scope expansion; a Markdown push is not permission to edit GitHub workflow/configuration files.

Choose a registered GitHub App or approved OAuth/device flow with reviewed least-privilege access, session-bound state, expiry, callback/return allowlists and PKCE where applicable. Provider scopes, endpoints and registration are implementation decisions; do not freeze a prototype's two-URL allowlist as the complete authorization design. Rust handles any provider token exchange/polling and holds credentials under the approved encrypted/keychain design. Application login, storage unlock and GitHub authorization remain distinct. Never return provider secrets or persist approval/CSRF tokens with display preferences; short-lived application tokens may live in browser memory. Cancelled/expired authorization cannot be revived by a late callback. See [official authorization contracts](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps).

GitHub writes cannot participate in an atomic local graph transaction. Use an encrypted/authenticated durable job/outbox with the approved input and explicit queued/running/succeeded/conflict/failed/**outcome unknown** states; add cancellation-requested/irreversible-result handling as applicable. Success needs a verified remote commit/result bound to that job and destination. A local response failure after provider success is not evidence that no remote write occurred. Preserve the exact operation ID, reconcile original provider evidence before another mutation, and do not assume provider correlation IDs guarantee deduplication. Equal remote file bytes alone do not prove which job produced a commit. Unknown results must remain unknown/manual-recovery-required when safe reconciliation is impossible; do not promise exactly-once external writes without evidence. Cancellation/disconnect cannot retract already disclosed plaintext or completed remote commits.

Enforce a provider-side concurrency condition matching the promised remote-head contract. Reading a head then performing an unconditional write is a check/write race; the Contents API's file blob SHA is not itself an expected branch-head condition. Evaluate a suitable atomic expected-head operation and prove its actual failure/retry semantics during implementation. GitHub documents file SHA in [Contents API](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents) and `expectedHeadOid` for [CreateCommitOnBranchInput](https://docs.github.com/en/graphql/reference/commits#createcommitonbranchinput); this does not select a provider transport or prove application crash/retry correctness. Repository creation/new-branch absence and provider visibility changes need their own explicit limitations and acceptance checks.

Require tests for denied/expired/cancelled/replayed authorization, account changes, inadequate permissions, pagination, public visibility review, stale local/remote state, creation collisions, malicious paths/URLs, rate limits, disconnect, provider success with lost reply, restart reconciliation and unchanged approval payload. No live login, repository creation, provider push or remote durability is established by a mock dialog. Client-held/non-trusted mode disables GitHub publication at the core, including authorized-client paths; read access, keys, consent or provider credentials cannot bypass the [egress policy](<security-cryptography.md>). Never upload decryption keys to enable the integration.

No frontend provider ID, database schema, cryptographic format, MLS transport or sentence segmentation algorithm is adopted here. Release bundling, keychain startup support and client-held trusted-client requirements remain as specified in the product/encryption documents.

### Future Word review import

Source `HPX-SRC-0028`, original lines 306–310. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Provide a branch/snapshot-bound import review for Word tracked changes and comments, with explicit exact/ambiguous/unmatched/conflicting results. Imported contributions use the virtual **Word Revision** identity in comments, attribution and the Users contributor projection; importing/approving humans remain separate actors. Snapshot review never mutates a snapshot. See [Word review import](<external-integrations.md>) for core application and acceptance requirements. This is future functionality, not an enabled fixture operation or endpoint.

### Word review import — future functionality

Source `HPX-SRC-0036`, original lines 1–2. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Source title/navigation context retained by this subsection; no additional requirement is inferred.

### Scope and status

Source `HPX-SRC-0036`, original lines 3–6. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Import tracked changes and comments from a Word document and reconcile them with a specifically selected Hypergraph branch or immutable snapshot. This is a future requirement, not an implemented importer, endpoint or supported file-format contract. Initial format support should be specified before implementation; `.docx` is the intended starting point.

### Target and matching

Source `HPX-SRC-0036`, original lines 7–14. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The user selects the workspace/document and branch or exact snapshot to which the review relates. Record the selected base identity and, for a branch, its exact revision at planning time. Where available, use a compilation/export manifest binding Word content to source revisions, placement occurrences and ranges. Never infer the destination branch from a file name alone.

Match changes and comment anchors against that base, preserving source ownership and repeated/nested occurrence context. Separate exact, ambiguous, unmatched and unsupported results; show a preview and require resolution rather than guessing from similar text. If the branch has advanced, reconcile base, current branch state and imported review explicitly; report overlaps/conflicts and recheck the head before applying. Repeated text, Unicode, tables, headings and equations must not silently attach a comment or revision to the wrong range. Unsupported Word structure or formatting is reported without silently flattening or discarding review information.

Snapshots remain immutable. An import matched to a snapshot produces a review/proposal against it and applies accepted changes only to a writable draft/branch derived from or explicitly reconciled with that snapshot. Reading or importing a review never rewrites the recorded snapshot.

### Attribution and comments

Source `HPX-SRC-0036`, original lines 15–22. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Attribute imported changes and comments to a dedicated virtual **Word Revision** contributor. Give that identity a stable internal identifier in its workspace and a distinct display colour under the existing contributor palette. It is an external-review identity, not a logged-in human, current agent or account with mutation authority. The Users tab includes it when actual imported contribution records establish a contribution to the current document, under the same history/permission scope as other contributors.

Keep original Word author labels, revision/comment identifiers, timestamps and thread relationships as external metadata when available and permitted. These labels are unverified input, not proof of a Hypergraph user's identity; they do not replace the requested Word Revision attribution. Record the actual importing and approving human separately. Preserve original attribution on unchanged Hypergraph content; accepted insertions/edits and imported comments carry Word Revision contribution provenance without relabelling the whole document.

Map imported comments into anchored document comments, retaining replies/resolution information where supported. An anchor on deleted or changed text may remain attached to its historical base or be reported unresolved; do not silently move it. Reviewing or rejecting an imported proposal must remain distinguishable from accepting a content change.

### Application and architectural boundary

Source `HPX-SRC-0036`, original lines 23–28. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Use an isolated Word parsing/conversion adapter to create a deterministic import plan, with source-file digest, chosen base/target, mappings, changes, comments and diagnostics. Core application commands validate authorization, exact source ranges, provenance and target state before publication; UI actions do not bypass these checks. Keep import history and retry identities so retrying the same applied plan cannot duplicate changes or comments, while a deliberate new review remains distinguishable. Specify atomic application/recovery behavior before enabling durable import.

Treat the file as untrusted input: bound archive expansion, document size and parser work; do not execute macros or retrieve external relationships/resources. Store any retained originals, extracted text, anchors and diagnostic artifacts under workspace confidentiality rules. This inbound feature does not authorize exporting documents or contacting Word/cloud services. Future client-held/non-trusted mode remains subject to the [core egress restrictions](<security-cryptography.md>), including disabled document export.

### Acceptance requirements before enabling

Source `HPX-SRC-0036`, original lines 29–37. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- Import tracked insertions/deletions and anchored comments/replies against an exact base; preview accepted/rejected/unresolved outcomes and preserve exact unaffected source.
- Reconcile a diverged branch with explicit conflicts; preserve an immutable snapshot and apply only through a writable destination.
- Reject ambiguous matches, including repeated placements, and report unsupported formatting/objects without hidden loss.
- Attribute imported contributions to Word Revision; retain external labels as unverified metadata and the importing/approving human as a separate actor.
- Cover deleted-text comments, Unicode, lists/tables/equations, replay/deduplication, stale heads, permissions, locked workspaces, malformed/oversized archives and recovery from interrupted application.

No parser, storage schema, new dependency or formal proof result is selected by this requirement.


## Invariants and error behavior

Explicitly gated citations, providers, Word import, GitHub, exports and future updates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Dependencies and interfaces

Explicitly gated citations, providers, Word import, GitHub, exports and future updates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Security and privacy

Explicitly gated citations, providers, Word import, GitHub, exports and future updates. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0032` — `Specifications/SPECIFICATION.md`, lines 113–123; SHA-256 `5c3b5ea4054e8528a7a8849b42d6ed1f0fdde1a8875734ce40b5893c455b585a`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 210–223; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 224–252; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 306–310; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0036` — `Specifications/WORD_REVIEW_IMPORT.md`, lines 1–2; SHA-256 `cee7d219d32c14ab11c5844eb44847174a339f0f8dc220e3dc90525aaf425804`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0036` — `Specifications/WORD_REVIEW_IMPORT.md`, lines 3–6; SHA-256 `cee7d219d32c14ab11c5844eb44847174a339f0f8dc220e3dc90525aaf425804`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0036` — `Specifications/WORD_REVIEW_IMPORT.md`, lines 7–14; SHA-256 `cee7d219d32c14ab11c5844eb44847174a339f0f8dc220e3dc90525aaf425804`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0036` — `Specifications/WORD_REVIEW_IMPORT.md`, lines 15–22; SHA-256 `cee7d219d32c14ab11c5844eb44847174a339f0f8dc220e3dc90525aaf425804`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0036` — `Specifications/WORD_REVIEW_IMPORT.md`, lines 23–28; SHA-256 `cee7d219d32c14ab11c5844eb44847174a339f0f8dc220e3dc90525aaf425804`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0036` — `Specifications/WORD_REVIEW_IMPORT.md`, lines 29–37; SHA-256 `cee7d219d32c14ab11c5844eb44847174a339f0f8dc220e3dc90525aaf425804`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.

## Future bundled Pandoc compilation

The owner confirmed HPX-RQ-030 as future scope on 2026-10-26. [Import/export specification HPX-SUB-008](import-export.md) now records the target formats, captured academic citation styles and bibliographies, explicit main/additional branch and hypergraph-content selection, native/fallback relationship representations and appended unresolved-rights report. Keep existing exact-source choices and confidentiality/authorization gates. Packaging, binding, profile schemas and deterministic resource capture remain design gates; no new converter/provider is enabled or installed.
