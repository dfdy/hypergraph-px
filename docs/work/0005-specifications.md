# Current specification publication — issue 5

Tracking: https://github.com/dfdy/hypergraph-px/issues/5. Date: 2026-10-24. Scope: owner-authorized documentation organization, with feature development remaining paused.

Assumptions/invariants: preserve all confirmed requirements, actual implementation boundaries and proof/source evidence; publish only current self-contained specifications under Specifications; retain input/reference material locally without treating it as current authority; keep reports, progress and proof evidence outside Specifications. Update every published local link and patch metadata. No Git history rewrite or runtime/proof source change.

Result: a specification index, canonical product requirements, architecture, mathematical model, data/navigation reference and encryption specification. The mathematical and encryption documents state constraints and actual implemented contracts directly, without requiring external project material. Updated README, AGENTS, changelog, ADR/work references and handoff. Locally preserved source files are excluded from Git tracking/ignored; no source content is deleted locally.

Validation required before publication: all tracked Markdown targets/code fences, current specification content scan, exact absence of the excluded source tree from the Git index, local source preservation, synchronized 0.1.2 Cargo/Lean/README/spec versions, unchanged crate/proof source, formatting and whitespace checks. No new functionality means no additional behavior tests are introduced. Publication and hosted results are recorded only when observed. Recovery is a normal documentation revert; there is no data migration.

Validation executed for 0.1.2: six current specification files, 78 published local Markdown links/code fences, source-copy byte preservation/ignore rules, excluded-tree absence from Git index, synchronized package/docs versions and unchanged runtime/proof source all passed. Cargo workspace check, formatting and staged whitespace checks passed. Hosted checks remain to be observed after push.
