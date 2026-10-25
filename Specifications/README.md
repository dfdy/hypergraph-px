# Specifications

This directory contains the current specifications for Hypergraph PX Multi-User Federated. Requirements and accepted decisions are distinguished from proposed mechanisms and implemented behavior. No development reports belong in this directory.

| Document | Responsibility |
|---|---|
| [Product specification](SPECIFICATION.md) | Scope, mandatory invariants, desktop interface, security, staged delivery, formal assurance and release policy |
| [Frontend integration](FRONTEND_INTEGRATION.md) | Frontend-agent work order, fixture/live boundaries, source mapping, drafts, commands, contributors/authorship, maths, exact export, reviewed GitHub publication and acceptance scenarios |
| [Workspace interface](WORKSPACE_INTERFACE.md) | Multi-document compositions, split investigation panels, anchored reuse, private provenance clipboard, semantic assertions and backend gates |
| [Editor structure guides](EDITOR_STRUCTURE_GUIDES.md) | Fixed left gutter, section/paragraph rails and unchanged text indentation |
| [Content provenance](SENTENCE_PROVENANCE.md) | Sentence-start icons and paragraph/section rows, direction, exact-link inspection and operation/fixture boundaries |
| [Assertion identity and tags](ASSERTIONS_AND_TAGS.md) | Shared relationship definitions, overlapping categories, unique choices and claim-level qualifications |
| [Spell checking](SPELL_CHECKING.md) | Medium-term local prose spelling, safe corrections, dictionary/language and privacy requirements |
| [Relationship interface](RELATIONSHIP_UI.md) | Categorized relationship selection, search/custom terms, adjacent-unit markers and caret context |
| [Word review import](WORD_REVIEW_IMPORT.md) | Future branch/snapshot matching for Word tracked changes/comments and virtual Word Revision attribution |
| [Transport security](TRANSPORT_SECURITY.md) | Medium-term browser/runtime HTTPS/WSS requirement, local certificate trust/bootstrap and real-data integration gate |
| [Architecture](ARCHITECTURE.md) | Component boundaries, command/data flow, single-executable packaging and outstanding mechanism decisions |
| [Mathematical model](DATA/MATHEMATICAL_MODEL.md) | Typed graph projections, identity, temporal state, provenance and exact snapshot semantics |
| [Data structures and navigation](DATA/README.md) | Proposed data/query contracts, actual Rust APIs, complexity, budgets, errors and examples |
| [Encryption](DATA/ENCRYPTION.md) | Key custody, implemented envelopes, unlock requirements, confidentiality and future client-held core egress restrictions |

The product specification owns product requirements. The other documents refine them; an illustrative type or planned API is not an implementation claim. Record mechanism decisions before dependent code and update these documents when behavior changes. Current owner instructions take precedence; reconcile any disagreement explicitly.

Keep implementation chronology and context-compaction handoff in [docs/DEVELOPMENT_STATE.md](../docs/DEVELOPMENT_STATE.md) and issue work records. Keep technical decision rationale in [architecture decisions](../docs/adr/0001-foundation-decisions.md), executed proof evidence in the [Lean validation digest](../proofs/VALIDATION_DIGEST.md), and dependency/license accounting in [legal](../legal/TOOLING.md).
