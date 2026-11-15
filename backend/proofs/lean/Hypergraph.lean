-- SPDX-License-Identifier: AGPL-3.0-only
import Hypergraph.Expansion
import Hypergraph.CycleState
import Hypergraph.CycleExamples
import Hypergraph.SourceEmission
import Hypergraph.SourceEmissionExamples

/-!
# Hypergraph PX — Formal model import entry

Collect the bounded graph models and executable examples into one Lean build target.

Source: [Latest source on GitHub][source]

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex /root (OpenAI coding agent).
Latest editing harness: Codex; version/build: unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: The pinned Lake build and formal-assurance checks.

Specification:
- [Graph projection model][model]
- [Formal validation scope][digest]

Boundary: Imports collect scoped models; they do not establish implementation correspondence.

[source]: https://github.com/dfdy/hypergraph-px/blob/main/backend/proofs/lean/Hypergraph.lean
[model]: ../../../docs/05-domain/diagrams/graph-projections.c4
[digest]: ../../../docs/08-assurance/formal-validation-digest.md
-/
