# Migration agent protocol — preserving and reorganising existing HPX specifications

**Status:** Process template for human review. This file authorises no destructive action or automatic replacement of existing documents.

## 0. Read-only discovery (mandatory first pass)

- Identify repository root, active branch, Git status, uncommitted and ignored work. Stop any operation that would obscure local changes.
- Locate *all* existing specifications and collateral (Markdown, TXT, PDFs, README files, diagrams, chats, issue descriptions, source comments). Index paths and checksums; obtain original text without rewriting. Never scan or transmit secrets indiscriminately.
- Enumerate historical fragments and current accepted design decisions separately. Where only a context summary is available, classify it as a lead awaiting verification, not a verified source.
- Record each discovered source in `source-manifest.csv` with SHA-256, provenance and disposition. Originals must remain recoverable in Git or immutable, access-controlled archival storage.

## 1. Produce a reviewable migration plan BEFORE edits

- Map each old document/section to one or more destination specifications. Do not force a one-to-one mapping: one source can cover multiple levels; one destination can cite many sources.
- For each claim classify `normative | descriptive | rationale | proposed | open | superseded | unknown`, and record original citations, confidence and status.
- Explicitly identify incompatible claims, duplicated definitions, omissions, hazardous assumptions, and possible confidential research material.
- Populate the migration map and conflicts register. Propose document IDs without duplicating or recycling any existing IDs.
- Show planned new files, unchanged files, source retention policy, and all would-be modified files for approval.

## 2. Execute only an approved, reversible migration

- Create a new Git branch; never rewrite history, force-push, delete sources or overwrite an existing root file.
- Save byte-identical source copies or retain an immutable Git commit/hash. Track integrity by SHA-256; preserve original name and title.
- Create draft documents from the relevant templates, copying meaning without changing commitments. Keep close quotations short where third-party copyright applies.
- Add source provenance by file, heading, line range and/or source commit. Do not fabricate dates, authority, tests, quantitative thresholds or resolution of contested choices.
- If text spans levels, split at semantic boundaries: link the high-level intent to lower-level design instead of duplicating normative passages.
- Existing accepted materials retain their effective status unless a human explicitly approves a change. New content starts `proposed`.
- Never move confidential/private materials into a public repository without classification and explicit clearance. Keep secrets, tokens, private data and encryption keys out of Git.

## 3. Verify before proposing merge

- Compare normalized extracted source claims against destination coverage and list every omission or paraphrase requiring review.
- Confirm source hashes and preserved history; validate all local paths, IDs, metadata, status values, and cross-references.
- Scan for secrets and sensitive information; run existing repository checks without modifying unrelated code.
- Confirm no Git history rewriting, deleted files, altered licensing or unexplained code changes.
- Generate `MIGRATION-REPORT.md`: file mapping, claim traceability, conflicts, missing information, test evidence, changed files, unresolved risks, and requested approvals.

## 4. Decision gates

**Human review is required before:** changing normative meaning; resolving conflicts; promoting proposals to requirements; deprecating or deleting source material; accepting architectural decisions; changing licences/governance; publishing potentially private data; modifying cryptographic/security guarantees; modifying executable code as part of migration.

## 5. Ongoing use

For any future change, identify affected requirement/domain/interface/invariant/test, update authoritative sources in the same pull request, add decision record for consequential alternatives, and leave a trace from the rationale to the test. Agents must not use their own prior explanations as authority absent a documented human adoption.

## Agent deliverables

1. Source manifest and migration map, with SHA-256 and stable references.
2. Coverage and conflict report.
3. Proposed new and amended Markdown specifications, each with `proposed` status.
4. Traceability register and dangling-link report.
5. Risk/security and licensing review summary.
6. Reviewable patch or pull request, with rollback instructions.
