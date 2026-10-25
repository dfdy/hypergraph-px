# Acceptance and Conformance

## Common metadata

- **ID:** `HPX-REQ-004`
- **Title:** Acceptance and Conformance
- **Purpose:** Acceptance gates for owned-source editing, persistence and integration.
- **Level:** `03-requirements`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Acceptance criteria are requirements, not passing evidence. No application or proof tests are rerun by this migration.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Requirements and invariants covered

Acceptance gates for owned-source editing, persistence and integration. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Test fixtures and inputs

Use the source-grounded examples/evidence above and [acceptance gates](<acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Unit/integration/property/fuzz cases



### Verification and delivery gates

Source `HPX-SRC-0021`, original lines 61–71. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Preserve pure deterministic validators and bounded traversals. Distinguish tests, Lean model proofs and extracted-Rust correspondence. Current full-validator translation is blocked by concrete Aeneas subset/model limits; its budget helper is proved through extraction. No cryptographic primitive, filesystem or complete application proof is claimed.

Require an early complete editor workflow: owned whole-buffer editing, five-second-idle draft persistence, restart recovery, explicit commit and delayed acknowledgement handling. Verify crash/failure states, exact historical reconstruction, authorization and development/embedded browser parity. The current domain and crypto primitives do not constitute this delivered workflow.

Frontend implementation coordination is defined in [FRONTEND_INTEGRATION.md](<../06-subsystems/interfaces/browser-runtime.md>). Its fixture-first work order and behavioral contracts do not settle the outstanding durable-format, transport DTO, authentication or recovery mechanisms listed above.

The Users tab is a permission-scoped document-contributor projection over attribution/provenance, with current human/agent context pinned separately; it is independent of session presence and workspace membership. A derived contributor index requires no change to the core typed-graph model and grants no additional historical access.

### 9. Acceptance scenarios and handoff checklist

Source `HPX-SRC-0028`, original lines 253–283. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The frontend agent should deliver its interface code, an adapter boundary, synthetic fixtures and executable UI/adapter tests for these scenarios. Report which were actually run; fixtures cannot establish Rust durability/security. Tests against a real backend are required for the corresponding integration gate.

| Scenario | Expected observable result |
|---|---|
| Fixture mode and unavailable server | Persistent demo indicator; no fabricated durable save/commit; failed live connection does not fall back silently |
| Desktop editing | Four columns, outline/minimap synchronized to editor, keyboard navigation, focus/selection/IME/undo preserved |
| Delayed save 10 while typing 12 | Text 12 intact, acknowledgement at 10, draft still modified until 12 acknowledged |
| Lost save/commit reply | Original operation reconciled; no fresh-key duplicate and no false saved/committed label |
| Two editing contexts | Sequence/ack isolation; stale shared draft generation conflicts rather than overwrites |
| Repeated/nested/shared/local prose | Exact intended owners and context retained; ambiguous cross-owner edit rejected or explicitly resolved |
| Unicode and line endings | Non-BMP, combining/emoji sequences, invalid surrogate boundaries and CRLF mapping handled without silent normalization |
| Stale heading picker/proposal | Discard/remap against exact originating state; duplicate headings/rename do not retarget links |
| Table edits/source switch | Undoable mapped draft changes; view switch does not save or publish |
| Copy versus inclusion | Different labels and semantics; shared inclusion awaits real occurrence/closure service |
| Permission change, lock or incompatible capability | No stale action execution, data disclosure or fake success; unsaved-state recovery is explicit |
| Explicit commit with later typing | Frozen generation only; later local text retained or recoverable conflict, never replaced by an old result |
| Agent/comments/export/Zotero | Separate gated services and accurate labels; no implicit model disclosure, publication, anchor reassignment or external-library write |
| Untrusted markup | No script execution/active unsafe URL from source, comments or model output |
| Users/contributors | Current human and agent pinned, other recorded contributors below with distinct stable colours; disconnected contributors retained and logged-in noncontributors excluded; no duplicate pinned IDs, withheld-history disclosure or presence substitution |
| Authorship/context menu | Imported unknown authors not relabelled current human; clicked position independent of selection; keyboard/table/formula lookup maps exactly; mixed/undisclosed attribution preserved |
| Authorship styling/undo | Default off, current-human red only by authenticated identity; labels/contrast; attribution maps survive local transactions/undo and delayed replies |
| Maths display | Source default, code exclusions, exact original syntax retained; bounded untrusted rendering, source-mapped widgets, visible errors and actual accessibility checks |
| Export source choices | Temporary buffer, acknowledged draft and committed source labelled distinctly; stale-head conflict; shared/nested closure, LaTeX and safe filename preserved |
| GitHub review/recovery | No side effects on open/connect; exact approval and account/visibility/path scope; provider-side head conflict; lost-reply/restart uncertainty never produces a blind second write |
| Real integration | Create → edit → five-second idle draft acknowledgement → restart recovery → explicit commit → exact historical reconstruction; interrupted publication and index rebuild tested |
| Release/development parity | Same authorization, origin, source mapping, draft/command outcomes and bundled editor behavior through both serving modes |

Before enabling live writes, both frontend and Rust developers must agree executable DTO/error fixtures, source-coordinate/mapping behavior, authentication/unlock policy, draft durability, idempotency retention and publication recovery. Keep backend-owned decisions visible as gates; the visual design can proceed with honest fixtures while those services are developed.

### Acceptance gate

Source `HPX-SRC-0035`, original lines 21–31. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Before enabling a real-data editor connection:

- Verify trusted HTTPS startup and browser access from a clean supported-machine profile, with documented first-run trust and renewal procedures.
- Verify API requests/responses, assets, streaming and optional WebSockets use protected channels; reject mixed content, HTTP/WS downgrade and invalid/mismatched/expired certificates.
- Verify authentication, authorization, origin/Host/session controls and workspace unlock semantics remain enforced through both embedded-release and development paths.
- Verify private-key permissions/storage, renewal failure, restart and trust removal fail safely, without plaintext fallback or sensitive diagnostics.
- Verify representative payloads cannot be read or modified by an observer on the transport path, while documenting endpoint and local trust-store limits.

No transport implementation, cryptographic proof or delivered confidentiality guarantee is claimed by these requirements.


## Failure cases

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Platform matrix

Use the source-grounded examples/evidence above and [acceptance gates](<acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Pass/fail or measurement thresholds

Use the source-grounded examples/evidence above and [acceptance gates](<acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Automated reports

Use the source-grounded examples/evidence above and [acceptance gates](<acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0021` — `Specifications/ARCHITECTURE.md`, lines 61–71; SHA-256 `74465205832e350d98953dbfd1f704e590523297d31cdc40f4e4a8d05ee636a7`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0028` — `Specifications/FRONTEND_INTEGRATION.md`, lines 253–283; SHA-256 `71d477947a404e9c60b9f99150ff6c681e266d18d62ef56b27c1b3f94501936d`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0035` — `Specifications/TRANSPORT_SECURITY.md`, lines 21–31; SHA-256 `96688214826d64bb9d96f01f98c3f717c7327c9e8ec8487eb461bc71098fa0eb`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
