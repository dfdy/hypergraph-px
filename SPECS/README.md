# Specification sources and authority

This folder belongs to the new Hypergraph PX MU-F project. Source documents are preserved as supplied; none is treated as a complete, internally consistent current specification.

| Document | Status and purpose |
|---|---|
| [ORIGINAL SPECIFICATION.MD](ORIGINAL%20SPECIFICATION.MD) | Historical request formalizing node/composition/snapshot histories |
| [DEVELOPMENT_REVIEW.md](DEVELOPMENT_REVIEW.md) | Retrospective of the retired implementation; architecture lessons, errors and verification limitations |
| [EVOLVED SPECIFICATION.md](EVOLVED%20SPECIFICATION.md) | Historical application specification; single-human restrictions, old release/runtime details and separate-MU assumptions are outdated |
| [DATA/Underlying mathematics.md](DATA/Underlying%20mathematics.md) | Foundational design input: typed graph projections, occurrence identity, revision DAGs, transformation events and exact snapshots |
| [DATA/Encryption specification.md](DATA/Encryption%20specification.md) | Foundational design input: key custody, encrypted objects/history, collaboration groups, downgrade resistance and selective Lean verification |
| [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md) | New-project reconciliation, proposed module boundaries and outstanding decisions; proposals remain labelled |
| [DATA/README.md](DATA/README.md) | Technical data/navigation reference; currently proposed interfaces, to be updated to real implementation |

Current owner instructions take precedence over historical text. Mathematics and encryption are the principal new core-design inputs and must be reconciled together. Neither becomes correct merely by appearing in a supplied conversation: ambiguous or conflicting claims require an explicit decision and testable definition.

[SPECIFICATION.md](SPECIFICATION.md) now records the initial confirmed requirements; [ADR 0001](../docs/adr/0001-foundation-decisions.md) records owner decisions. Refine them before implementing dependent durable formats/algorithms. Do not edit historical sources to make them appear current, inherit old file-path instructions, or claim the retired application's tests establish this project's behavior. Links inside historical copied documents may refer to old-project files that are deliberately not imported.
