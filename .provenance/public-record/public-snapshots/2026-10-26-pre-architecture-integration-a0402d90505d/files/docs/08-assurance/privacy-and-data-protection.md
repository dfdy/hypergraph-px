# Privacy and Research Data Protection

## Common metadata

- **ID:** `HPX-ASSUR-003`
- **Title:** Privacy and Research Data Protection
- **Purpose:** Confidentiality, egress, disclosure and retained-history privacy limits.
- **Level:** `08-assurance`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-REQ-002](<../03-requirements/system-requirements.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Recorded checks retain original source/toolchain/time scope. No new software validation claim follows from documentation assembly.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Confidentiality, egress, disclosure and retained-history privacy limits. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Confidentiality, egress, disclosure and retained-history privacy limits. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content

OWNER-001 retains immutable committed history. Redaction, erasure and retention exceptions in design inputs remain deferred proposals requiring a separately approved mechanism; no silent pruning, payload deletion or history weakening is introduced. This is not a statement of legal compliance. Rights-conflict reporting does not override access restrictions or future non-trusted egress denial. Documents/user manuscripts remain outside application licensing unless separately granted.

### Future core egress policy for client-held/non-trusted mode

Source `HPX-SRC-0024`, original lines 15–30. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: required future functionality, unimplemented. When client-held/local encryption with a non-trusted server is selected, the core must deny application-controlled plaintext disclosure paths. **GitHub publication/pushing and document export are disabled**, including local Markdown/HTML/PDF/LaTeX/Word downloads and direct browser Blob/download shortcuts. Possession of client keys, read access, an integration credential or a confirmation dialog cannot override this mode policy.

Use one authoritative policy/command boundary across browser, native/trusted client, REST, MCP, plugins and background workers. UI capability flags and disabled buttons reflect the decision; every direct command, retry and sink must independently enforce it. The future trusted client must route file/download, OS clipboard, printing, integrations and provider network calls through its core execution boundary. An authorized plaintext-capable client is not an automatic export exception.

Audit and block additional application disclosure sinks: external model/agent/provider requests carrying protected content; citation or integration queries derived from protected text; plaintext OS clipboard/share sheets; printing; public previews/share links; file/temporary/export artifacts; plaintext caches, indexes, service-worker storage, logs, errors, traces, crash reports and telemetry. Internal encrypted workspace drafts, protected application clipboard references and authorized local viewing/editing require their own permitted flows. Keep protected plaintext from the hosting server and third-party assets.

Ciphertext-only synchronization and separately designed encrypted recovery/backup flows need an explicit policy, metadata/disclosure bounds and authorization. They cannot reuse a disabled document-export/publish operation as an escape hatch. Mixed-source operations inherit restrictions from every protected input; moving content into a trusted destination cannot launder its source policy.

Freeze the applicable policy context in plans and recheck before execution and artifact delivery. Switching to non-trusted mode invalidates pending export/push/disclosure plans, jobs, temporary artifacts and outstanding plaintext access links; no delayed task may execute under an older permissive policy. Mode changes must not silently downgrade protection. Earlier disclosures cannot be recalled.

Acceptance requires negative tests through all transports and clients, UI bypass/direct commands, stale plans, retry/outbox/restart, mixed protected inputs, provider/OS sinks, caches/logs and mode transitions. Model the decision as a pure exhaustive policy function and consider Lean denial-invariant proofs; this requirement establishes no checked theorem or implemented guarantee.

The threat model must distinguish application-controlled egress from a reader copying a screen, OS screenshots, compromised endpoints and side channels. Protection against a malicious host replacing browser code still requires independently trusted client/update delivery. Do not claim that an ordinary browser can prevent a malicious host or privileged user from extracting plaintext already available to it. These limits must not weaken enforcement of the application's supported disclosure paths.


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Confidentiality, egress, disclosure and retained-history privacy limits. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0024` — `Specifications/DATA/ENCRYPTION.md`, lines 15–30; SHA-256 `5d38ac394760cbf83720f2de41f2494cc051cd014b6b46f0ee4e5b0369eb06e6`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
