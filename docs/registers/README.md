# Documentation registers

Source identity and file hashes are separate from accepted authority. Document status is separate from implementation and verification. The document inventory is the ID reservation ledger; reserved/unmaterialized paths are not broken promises of files. Source archive paths identify local/private originals and are not public links.

- [Documentation archive manifest](documentation-archive.json) — original/archive paths, byte counts and SHA-256, including execution-record originals.
- [Source manifest](source-manifest.csv), [source sections](source-sections.csv) and [actual migration map](migration-map.csv).
- [Document inventory](document-inventory.csv), [claims](claims.csv), [requirements](requirements.csv) and [traceability](traceability.csv).
- [Claim/section coverage](claim-coverage.csv), [conflicts](conflicts.csv), [decisions](decisions.csv), [open questions](open-questions.csv) and [technical debt](technical-debt.csv).
- [Assumptions](assumptions.csv), [risks](risks.csv), [compatibility](compatibility.csv), [contributions](contributions.csv) and [research](research.csv).
- [Original template pack](template-pack-inventory.csv), [implementation collateral](implementation-collateral.csv) and [historical broken-link findings](existing-link-findings.csv).

New requirement/claim decomposition retains complete source context. Claim-unit traces are not an assertion that every compound paragraph has become one atomic test. Do not silently renumber IDs, promote proposals, mark absent tests passed or treat historical source dates as precedence. Current owner instructions govern changes.

`original_path` records where a source came from; `current_path` records its current filesystem location. ZIP sources additionally specify `archive_member`. Coverage/mapping/requirement/conflict/trace registers carry corresponding current-location fields; old paths remain provenance, never an assertion that moved files still exist there.

Input `authority` and `apparent_status` fields record source classifications at inventory time. They do not make an archived source the active navigation/instruction file; `effective_migration_role`, current owner decisions and the document register govern current routing.

[Current implementation test evidence](tests.csv) records executed checks and limits separately from accepted requirements and inherited historical source evidence.
