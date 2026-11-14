# Documentation migration report

Date:2026-10-25. Phase C editorial assembly, with mechanical Phase D checks. This report does not claim independent mathematical equivalence or new software validation.

## Scope and authority

Owner preliminarily approved Phase C after decisions: retain immutable history; keep serialization outside domain; require explicit record versions before real-data acceptance. Owner then instructed archiving all previous documentation under ignored .oldspecs. New editorial assemblies remain proposed while inherited accepted source obligations retain scope. No software code, tests, schema code, build/CI configuration or proof source is changed by migration. The sole executable-configuration exception is appending the owner-requested archive exclusion to .gitignore; original ignore bytes are preserved.

## Deliverables and coverage

The nine-level index and scoped documents separate purpose, governance, requirements, architecture, domain, subsystem, implementation, assurance and guides. Source registers retain original and current paths, file/section hashes and statuses. Canonical source bodies are transcribed with relative links rebased and current decision/status qualifications explicit. Root README/AGENTS become current navigation/instructions; their original bytes are archived.

All116 non-index canonical sections are accounted for. In total169 canonical/policy/proof-evidence sections and509 claim units are covered, plus25 individually tracked requirement seeds (including the three current decision/archive requirements). Compound claim units retain context; further atomic requirement decomposition can be reviewed without loss of the preserved text. No unsupported claim of perfect semantic equivalence is made.

All119 original source entries plus five explicit owner-decision entries remain registered. Historical/private proposal/report sections are preserved as evidence rather than promoted into requirements. Reserved future topics are listed without creating empty specifications. The complete human-readable Lean validation digest remains active with its methods, assumptions, exact hashes and extraction limits; original proof artifacts are unchanged.

## Verification status

Mechanical verification and exact archive counts are recorded after execution in [verification results](08-assurance/migration-verification.md). Run `python3 scripts/verify_documentation.py` to check current metadata, links and register consistency without private baselines. Add `--check-local-sources` to verify archived source bytes and spans when local originals are available. Historical baseline/Git-state checks are not part of this reusable checker. The checker never overwrites drift. Tests/proof success cited in the migrated documents remains dated source evidence; no application/browser/Rust/Lean tests or remote CI are run for this documentation-only migration.

## Known findings and next steps

Owner-resolved conflicts002/003/012 are decisions, not completed code fixes. Current domain Serde and implicit payload record versions remain implementation debt. Live HTTPS browser integration remains unfinished and paused. Other future privacy/rights/federation/package mechanisms remain open/deferred; no format, encryption change, retention exception or institutional governance is invented.

Original historical missing-path references remain unchanged inside the archive. Active links must resolve without relying on ignored documentation. Current source-manifest/current_path fields identify the actual archive locations, including ZIP-member sources separately from filesystem paths. Original paths remain provenance.

.oldspecs is excluded from future Git additions; existing published Git history is not rewritten. No files are staged, committed, pushed or published. Review editorial topic assemblies and unresolved findings before any publication. Resume application development only on owner instruction.

## Owner-authorized execution-record relocation

Owner decisions and historical verification are maintained under docs; the reusable read-only checker is under scripts. The remaining execution material, including original versions of the retained records/checker, is archived byte-for-byte. [Relocation plan, mapping, rollback and results](08-assurance/documentation-records-move.md) and [archive hashes](registers/documentation-archive.json) distinguish this follow-up from the original Phase C results. No requirement meaning, acceptance, application behavior, licensing or publication authority changes.
