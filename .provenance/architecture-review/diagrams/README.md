# Coordinated diagram index — Stage C

**Historical supporting views, not independent authority.** The subsequent [specification integration](../../../docs/09-guides/reference/implementation-resumption.md#architecture-review-integration-2026-10-26) preserves the core identity, source and transaction semantics shown here. Use the [offline browser](viewer.html) for archived source links and interpretation notes. The frozen original review is preserved in the [pre-integration snapshot](../../public-record/public-snapshots/2026-10-26-pre-architecture-integration-a0402d90505d/README.md).

Freshness views025/029 describe the absence of a whole-database witness, not approval of that limitation: HPX-GAP-023 remains open. Recovery view029's missing mutating-rebuild mechanism remains open; active HPX-ASSUR-006 now distinguishes authoritative state and bounded read-only audit prerequisites. Process viewP006's future equivalence-discovery leaf must not imply that RQ028's existing manual contextual-equivalence assertion/review is unavailable. Automatic inference/proof and the deferred Lean-conversion proposal are distinct. No diagram adopts a new policy, record format, federation mechanism or guarantee.

51 text-based Mermaid views. [System context](context/001.svg) → [containers](containers/002.svg) → [components](components/003.svg) → [process families](process/004.svg) → family leaves below. The [process catalogue](../process-inventory.md) supplies contracts and gaps for every leaf. Read SVGs for rendering and `.mmd` for editable sources. C4-inspired levels are labelled; these are not claims of formal C4/UML/BPMN conformance.

Selection: context/container/component for deployment and responsibility; DFD for information movement; sequence for ordering and atomicity; activity for branching review; state for lifecycle; class/data views separate concepts from physical tables. BPMN adds little here: implemented flows have one human and one local coordinator, and future multi-actor protocols lack sufficient message semantics. No invented BPMN execution is supplied.

Common legend: L is local documented behavior, G accepted/gated code, F future, D deferred; future edges are dashed where mixed with local edges. Arrows mean the notation stated in each view, never universally data flow. A box named trusted host expresses an assumption, not protection against its compromise. Exceptional paths are explicit in ordering/recovery views. Section-level claim evidence is in the evidence register; source links below are baseline documents, whose hashes and exact section spans are retained.

| ID / title | View / question | Scope | View and source |
| --- | --- | --- | --- |
| HPX-DIAG-001 — HPX system context | context; Who uses HPX, which actors and optional services are outside its authority? | Local unless explicitly F / G | [SVG](context/001.svg) · [Mermaid](context/001.mmd) |
| HPX-DIAG-002 — Execution containers and deployment boundary | containers; Which units execute, and what is absent from the release runtime? | Local unless explicitly F / G | [SVG](containers/002.svg) · [Mermaid](containers/002.mmd) |
| HPX-DIAG-003 — Responsibility and code-level direction | components; Where do authorization, pure planning, serialization and cryptography belong? | Local unless explicitly F / G | [SVG](components/003.svg) · [Mermaid](components/003.mmd) |
| HPX-DIAG-004 — Responsibility decomposition | process; Which parent owns each reviewed process? | Local unless explicitly F / G | [SVG](process/004.svg) · [Mermaid](process/004.mmd) |
| HPX-DIAG-P001 — Application and runtime lifecycle subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P001.svg) · [Mermaid](process/P001.mmd) |
| HPX-DIAG-P002 — Workspace access and enrollment subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P002.svg) · [Mermaid](process/P002.mmd) |
| HPX-DIAG-P003 — Durable editing and publication subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P003.svg) · [Mermaid](process/P003.mmd) |
| HPX-DIAG-P004 — Owned editing and presentation subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P004.svg) · [Mermaid](process/P004.mmd) |
| HPX-DIAG-P005 — Document composition and exact closure subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P005.svg) · [Mermaid](process/P005.mmd) |
| HPX-DIAG-P006 — Graph validation and read projections subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P006.svg) · [Mermaid](process/P006.mmd) |
| HPX-DIAG-P007 — Intellectual transformations subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P007.svg) · [Mermaid](process/P007.mmd) |
| HPX-DIAG-P008 — Named and private working branches subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P008.svg) · [Mermaid](process/P008.mmd) |
| HPX-DIAG-P009 — Comments and semantic assertions subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P009.svg) · [Mermaid](process/P009.mmd) |
| HPX-DIAG-P010 — Identity, attribution and provenance subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P010.svg) · [Mermaid](process/P010.mmd) |
| HPX-DIAG-P011 — Rights, permissions and reporting subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P011.svg) · [Mermaid](process/P011.mmd) |
| HPX-DIAG-P012 — Human–agent collaboration subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P012.svg) · [Mermaid](process/P012.mmd) |
| HPX-DIAG-P013 — Export, compilation and publication artifacts subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P013.svg) · [Mermaid](process/P013.mmd) |
| HPX-DIAG-P014 — Import, backup and restore subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P014.svg) · [Mermaid](process/P014.mmd) |
| HPX-DIAG-P015 — External integrations and shared interfaces subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P015.svg) · [Mermaid](process/P015.mmd) |
| HPX-DIAG-P016 — Security, crypto and trust lifecycle subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P016.svg) · [Mermaid](process/P016.mmd) |
| HPX-DIAG-P017 — Future collaboration and federation subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P017.svg) · [Mermaid](process/P017.mmd) |
| HPX-DIAG-P018 — Assurance, build and governance subprocesses | process; What are the leaves and their temporal scope? | Mixed scope, explicitly marked per leaf | [SVG](process/P018.svg) · [Mermaid](process/P018.mmd) |
| HPX-DIAG-005 — Context DFD level 0 | data-flow; Which information crosses the whole-system boundary? | Local unless explicitly F / G | [SVG](data-flow/005.svg) · [Mermaid](data-flow/005.mmd) |
| HPX-DIAG-006 — Subsystem DFD level 1 | data-flow; How do parent information channels decompose without adding outside actors? | Local unless explicitly F / G | [SVG](data-flow/006.svg) · [Mermaid](data-flow/006.mmd) |
| HPX-DIAG-007 — Durable Save and Commit lower DFD | data-flow; Which data transforms into encrypted records and an acknowledgement? | Local unless explicitly F / G | [SVG](data-flow/007.svg) · [Mermaid](data-flow/007.mmd) |
| HPX-DIAG-008 — Transformation and annotation lower DFD | data-flow; How do exact sources feed new entities while source history stays retained? | Local unless explicitly F / G | [SVG](data-flow/008.svg) · [Mermaid](data-flow/008.mmd) |
| HPX-DIAG-009 — Future export lower DFD | data-flow; Which captured information determines an artifact and prevents silent head refresh? | Future only | [SVG](data-flow/009.svg) · [Mermaid](data-flow/009.mmd) |
| HPX-DIAG-010 — Conceptual identity, placement and immutable closure | data-model; Which relationships are conceptual identity and which are version or occurrence bindings? | Local unless explicitly F / G | [SVG](data-model/010.svg) · [Mermaid](data-model/010.mmd) |
| HPX-DIAG-011 — Working branch conceptual extension | data-model; How does pending text obtain exact provenance without becoming a committed revision? | Accepted design / gated code | [SVG](data-model/011.svg) · [Mermaid](data-model/011.mmd) |
| HPX-DIAG-012 — Physical encrypted storage responsibilities | data-model; How do conceptual objects map to storage without conflating schema and payload versions? | Local unless explicitly F / G | [SVG](data-model/012.svg) · [Mermaid](data-model/012.mmd) |
| HPX-DIAG-013 — Autosave, newer typing and lost acknowledgement | sequence; What prevents a delayed Save acknowledgement from replacing newer typing? | Local unless explicitly F / G | [SVG](sequence/013.svg) · [Mermaid](sequence/013.mmd) |
| HPX-DIAG-014 — Atomic text publication and recovery | sequence; Which objects become durable together, and what happens around COMMIT? | Local unless explicitly F / G | [SVG](sequence/014.svg) · [Mermaid](sequence/014.mmd) |
| HPX-DIAG-015 — Working Copy, promotion and separate replacement | sequence; Where is atomicity deliberately split to keep text publication independent? | Gated code; explicit A/B/C atomicity boundaries | [SVG](sequence/015.svg) · [Mermaid](sequence/015.mmd) |
| HPX-DIAG-016 — Keychain enrollment compensation | sequence; How are SQLite and native keychain partial failure handled without weakening passphrase recovery? | Local unless explicitly F / G | [SVG](sequence/016.svg) · [Mermaid](sequence/016.mmd) |
| HPX-DIAG-017 — Source transform and immutable annotation workflow | activity; How do source validation, review and publication preserve identity distinctions? | Local unless explicitly F / G | [SVG](activity/017.svg) · [Mermaid](activity/017.mmd) |
| HPX-DIAG-018 — Workspace and buffer state machines | state; Which session/unlock states permit editing and which acknowledgement states remain uncertain? | Local unless explicitly F / G | [SVG](state/018.svg) · [Mermaid](state/018.mmd) |
| HPX-DIAG-019 — Working checkpoint and reference lifecycle | state; Which transitions retain exact unpublished source and which need a later explicit operation? | Local unless explicitly F / G | [SVG](state/019.svg) · [Mermaid](state/019.mmd) |
| HPX-DIAG-020 — Annotation entity lifecycle | state; What does review change, and what does it leave immutable? | Local unless explicitly F / G | [SVG](state/020.svg) · [Mermaid](state/020.mmd) |
| HPX-DIAG-021 — Document, content branch and immutable revision lifecycles | state; Which mutable heads advance without changing logical node or retained versions? | Local unless explicitly F / G | [SVG](state/021.svg) · [Mermaid](state/021.mmd) |
| HPX-DIAG-022 — Future human-agent proposal state | state; What separates provider output, human approval and authority to apply? | Future contract only | [SVG](state/022.svg) · [Mermaid](state/022.mmd) |
| HPX-DIAG-023 — Future GitHub publication with unknown outcome | sequence; Why can an approved remote write have an unknown result without allowing blind replay? | Future optional integration | [SVG](sequence/023.svg) · [Mermaid](sequence/023.mmd) |
| HPX-DIAG-024 — Future export and Word review workflows | activity; Where must selection, review, ambiguity and egress approval remain explicit? | Future only | [SVG](activity/024.svg) · [Mermaid](activity/024.mmd) |
| HPX-DIAG-025 — Trust and plaintext boundaries | security; Where is plaintext visible, and which guarantees depend on trusted delivery or the host? | Local unless explicitly F / G | [SVG](security/025.svg) · [Mermaid](security/025.mmd) |
| HPX-DIAG-026 — Request and operation failure propagation | recovery; Which failures reject, remain uncertain, or need scoped compensation? | Local unless explicitly F / G | [SVG](recovery/026.svg) · [Mermaid](recovery/026.mmd) |
| HPX-DIAG-027 — Future independent replicas and structural conflict | federation; Why are local DAG checks insufficient to promise federation convergence? | Future only; logical counterexample | [SVG](federation/027.svg) · [Mermaid](federation/027.mmd) |
| HPX-DIAG-028 — Dependency and contention structure | dependencies; Which dependencies are acyclic and where is responsibility concentrated? | Local unless explicitly F / G | [SVG](dependencies/028.svg) · [Mermaid](dependencies/028.mmd) |
| HPX-DIAG-029 — Recovery responsibilities and irrecoverable boundaries | recovery; What can reopening, receipts, backup or repair actually recover? | Local unless explicitly F / G | [SVG](recovery/029.svg) · [Mermaid](recovery/029.mmd) |
| HPX-DIAG-030 — Assurance and authority boundaries | assurance; Which conclusions come from tests, proofs, code alignment, owner decisions or this review? | Local unless explicitly F / G | [SVG](assurance/030.svg) · [Mermaid](assurance/030.mmd) |
| HPX-DIAG-031 — Publication, branch and actor bindings | data-model; Which identities authorize a current action and which records merely retain historical attribution? | Local unless explicitly F / G | [SVG](data-model/031.svg) · [Mermaid](data-model/031.mmd) |
| HPX-DIAG-032 — N-ary relationship and selected historical graph scope | graph; How does one reviewed claim retain roles without becoming pairwise facts or complete outgoing knowledge? | Local unless explicitly F / G | [SVG](graph/032.svg) · [Mermaid](graph/032.mmd) |
| HPX-DIAG-033 — Exact owned source and browser projection | data-flow; How does a browser selection resolve to exact mixed-newline UTF8 bytes? | Local unless explicitly F / G | [SVG](data-flow/033.svg) · [Mermaid](data-flow/033.mmd) |

## HPX-DIAG-001 — HPX system context

Question: Who uses HPX, which actors and optional services are outside its authority? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-001](../process-catalogue/HPX-PROC-001.md), [HPX-PROC-015](../process-catalogue/HPX-PROC-015.md), [HPX-PROC-017](../process-catalogue/HPX-PROC-017.md). Child/related views: [HPX-DIAG-002](containers/002.svg), [HPX-DIAG-005](data-flow/005.svg), [HPX-DIAG-027](federation/027.svg), [HPX-DIAG-030](assurance/030.svg).

Sources: [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/04-architecture/component-architecture.md:1](../../../docs/04-architecture/component-architecture.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md).

## HPX-DIAG-002 — Execution containers and deployment boundary

Question: Which units execute, and what is absent from the release runtime? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-001](../process-catalogue/HPX-PROC-001.md), [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-016](../process-catalogue/HPX-PROC-016.md), [HPX-PROC-018](../process-catalogue/HPX-PROC-018.md). Child/related views: [HPX-DIAG-003](components/003.svg), [HPX-DIAG-004](process/004.svg), [HPX-DIAG-012](data-model/012.svg).

Sources: [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/04-architecture/component-architecture.md:1](../../../docs/04-architecture/component-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md).

## HPX-DIAG-003 — Responsibility and code-level direction

Question: Where do authorization, pure planning, serialization and cryptography belong? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-018](../process-catalogue/HPX-PROC-018.md). Child/related views: [HPX-DIAG-028](dependencies/028.svg).

Sources: [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/04-architecture/component-architecture.md:1](../../../docs/04-architecture/component-architecture.md); [docs/04-architecture/decisions/0006-domain-serialization-boundary.md:1](../../../docs/04-architecture/decisions/0006-domain-serialization-boundary.md).

## HPX-DIAG-004 — Responsibility decomposition

Question: Which parent owns each reviewed process? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-001](../process-catalogue/HPX-PROC-001.md), [HPX-PROC-002](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-004](../process-catalogue/HPX-PROC-004.md), [HPX-PROC-005](../process-catalogue/HPX-PROC-005.md), [HPX-PROC-006](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-007](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-008](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-009](../process-catalogue/HPX-PROC-009.md), [HPX-PROC-010](../process-catalogue/HPX-PROC-010.md), [HPX-PROC-011](../process-catalogue/HPX-PROC-011.md), [HPX-PROC-012](../process-catalogue/HPX-PROC-012.md), [HPX-PROC-013](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-014](../process-catalogue/HPX-PROC-014.md), [HPX-PROC-015](../process-catalogue/HPX-PROC-015.md), [HPX-PROC-016](../process-catalogue/HPX-PROC-016.md), [HPX-PROC-017](../process-catalogue/HPX-PROC-017.md), [HPX-PROC-018](../process-catalogue/HPX-PROC-018.md). Child/related views: [HPX-DIAG-P001](process/P001.svg), [HPX-DIAG-P002](process/P002.svg), [HPX-DIAG-P003](process/P003.svg), [HPX-DIAG-P004](process/P004.svg), [HPX-DIAG-P005](process/P005.svg), [HPX-DIAG-P006](process/P006.svg), [HPX-DIAG-P007](process/P007.svg), [HPX-DIAG-P008](process/P008.svg), [HPX-DIAG-P009](process/P009.svg), [HPX-DIAG-P010](process/P010.svg), [HPX-DIAG-P011](process/P011.svg), [HPX-DIAG-P012](process/P012.svg), [HPX-DIAG-P013](process/P013.svg), [HPX-DIAG-P014](process/P014.svg), [HPX-DIAG-P015](process/P015.svg), [HPX-DIAG-P016](process/P016.svg), [HPX-DIAG-P017](process/P017.svg), [HPX-DIAG-P018](process/P018.svg).

Sources: [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/04-architecture/component-architecture.md:1](../../../docs/04-architecture/component-architecture.md).

## HPX-DIAG-P001 — Application and runtime lifecycle subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-001.001](../process-catalogue/HPX-PROC-001.md), [HPX-PROC-001.002](../process-catalogue/HPX-PROC-001.md), [HPX-PROC-001.003](../process-catalogue/HPX-PROC-001.md), [HPX-PROC-001.004](../process-catalogue/HPX-PROC-001.md), [HPX-PROC-001.005](../process-catalogue/HPX-PROC-001.md), [HPX-PROC-001.006](../process-catalogue/HPX-PROC-001.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md).

## HPX-DIAG-P002 — Workspace access and enrollment subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-002.001](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-002.002](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-002.003](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-002.004](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-002.005](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-002.006](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-002.007](../process-catalogue/HPX-PROC-002.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md).

## HPX-DIAG-P003 — Durable editing and publication subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-003.001](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-003.002](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-003.003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-003.004](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-003.005](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-003.006](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-003.007](../process-catalogue/HPX-PROC-003.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/workspace-storage.md:1](../../../docs/06-subsystems/workspace-storage.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md).

## HPX-DIAG-P004 — Owned editing and presentation subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-004.001](../process-catalogue/HPX-PROC-004.md), [HPX-PROC-004.002](../process-catalogue/HPX-PROC-004.md), [HPX-PROC-004.003](../process-catalogue/HPX-PROC-004.md), [HPX-PROC-004.004](../process-catalogue/HPX-PROC-004.md), [HPX-PROC-004.005](../process-catalogue/HPX-PROC-004.md), [HPX-PROC-004.006](../process-catalogue/HPX-PROC-004.md), [HPX-PROC-004.007](../process-catalogue/HPX-PROC-004.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md).

## HPX-DIAG-P005 — Document composition and exact closure subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-005.001](../process-catalogue/HPX-PROC-005.md), [HPX-PROC-005.002](../process-catalogue/HPX-PROC-005.md), [HPX-PROC-005.003](../process-catalogue/HPX-PROC-005.md), [HPX-PROC-005.004](../process-catalogue/HPX-PROC-005.md), [HPX-PROC-005.005](../process-catalogue/HPX-PROC-005.md), [HPX-PROC-005.006](../process-catalogue/HPX-PROC-005.md), [HPX-PROC-005.007](../process-catalogue/HPX-PROC-005.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md).

## HPX-DIAG-P006 — Graph validation and read projections subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-006.001](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-006.002](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-006.003](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-006.004](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-006.005](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-006.006](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-006.007](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-006.008](../process-catalogue/HPX-PROC-006.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/algorithms/expansion-validation.md:1](../../../docs/07-implementation/algorithms/expansion-validation.md).

## HPX-DIAG-P007 — Intellectual transformations subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-007.001](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-007.002](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-007.003](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-007.004](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-007.005](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-007.006](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-007.007](../process-catalogue/HPX-PROC-007.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md); [docs/04-architecture/decisions/0015-initial-merge-workflow.md:1](../../../docs/04-architecture/decisions/0015-initial-merge-workflow.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md).

## HPX-DIAG-P008 — Named and private working branches subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-008.001](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.002](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.003](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.004](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.005](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.006](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.007](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.008](../process-catalogue/HPX-PROC-008.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md).

## HPX-DIAG-P009 — Comments and semantic assertions subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-009.001](../process-catalogue/HPX-PROC-009.md), [HPX-PROC-009.002](../process-catalogue/HPX-PROC-009.md), [HPX-PROC-009.003](../process-catalogue/HPX-PROC-009.md), [HPX-PROC-009.004](../process-catalogue/HPX-PROC-009.md), [HPX-PROC-009.005](../process-catalogue/HPX-PROC-009.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/04-architecture/decisions/0017-initial-durable-comments.md:1](../../../docs/04-architecture/decisions/0017-initial-durable-comments.md); [docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md:1](../../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md); [docs/05-domain/assertions-and-predicates.md:1](../../../docs/05-domain/assertions-and-predicates.md).

## HPX-DIAG-P010 — Identity, attribution and provenance subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-010.001](../process-catalogue/HPX-PROC-010.md), [HPX-PROC-010.002](../process-catalogue/HPX-PROC-010.md), [HPX-PROC-010.003](../process-catalogue/HPX-PROC-010.md), [HPX-PROC-010.004](../process-catalogue/HPX-PROC-010.md), [HPX-PROC-010.005](../process-catalogue/HPX-PROC-010.md), [HPX-PROC-010.006](../process-catalogue/HPX-PROC-010.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/provenance-model.md:1](../../../docs/05-domain/provenance-model.md); [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md).

## HPX-DIAG-P011 — Rights, permissions and reporting subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-011.001](../process-catalogue/HPX-PROC-011.md), [HPX-PROC-011.002](../process-catalogue/HPX-PROC-011.md), [HPX-PROC-011.003](../process-catalogue/HPX-PROC-011.md), [HPX-PROC-011.004](../process-catalogue/HPX-PROC-011.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/01-purpose/principles.md:1](../../../docs/01-purpose/principles.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md).

## HPX-DIAG-P012 — Human–agent collaboration subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-012.001](../process-catalogue/HPX-PROC-012.md), [HPX-PROC-012.002](../process-catalogue/HPX-PROC-012.md), [HPX-PROC-012.003](../process-catalogue/HPX-PROC-012.md), [HPX-PROC-012.004](../process-catalogue/HPX-PROC-012.md), [HPX-PROC-012.005](../process-catalogue/HPX-PROC-012.md), [HPX-PROC-012.006](../process-catalogue/HPX-PROC-012.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/frontend-interaction.md:1](../../../docs/06-subsystems/frontend-interaction.md); [docs/02-governance/ai-development-protocol.md:1](../../../docs/02-governance/ai-development-protocol.md).

## HPX-DIAG-P013 — Export, compilation and publication artifacts subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-013.001](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-013.002](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-013.003](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-013.004](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-013.005](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-013.006](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-013.007](../process-catalogue/HPX-PROC-013.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/document-engine.md:1](../../../docs/06-subsystems/document-engine.md).

## HPX-DIAG-P014 — Import, backup and restore subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-014.001](../process-catalogue/HPX-PROC-014.md), [HPX-PROC-014.002](../process-catalogue/HPX-PROC-014.md), [HPX-PROC-014.003](../process-catalogue/HPX-PROC-014.md), [HPX-PROC-014.004](../process-catalogue/HPX-PROC-014.md), [HPX-PROC-014.005](../process-catalogue/HPX-PROC-014.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md); [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md); [docs/06-subsystems/formats/hpx-workspace.md:1](../../../docs/06-subsystems/formats/hpx-workspace.md).

## HPX-DIAG-P015 — External integrations and shared interfaces subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-015.001](../process-catalogue/HPX-PROC-015.md), [HPX-PROC-015.002](../process-catalogue/HPX-PROC-015.md), [HPX-PROC-015.003](../process-catalogue/HPX-PROC-015.md), [HPX-PROC-015.004](../process-catalogue/HPX-PROC-015.md), [HPX-PROC-015.005](../process-catalogue/HPX-PROC-015.md), [HPX-PROC-015.006](../process-catalogue/HPX-PROC-015.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md).

## HPX-DIAG-P016 — Security, crypto and trust lifecycle subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-016.001](../process-catalogue/HPX-PROC-016.md), [HPX-PROC-016.002](../process-catalogue/HPX-PROC-016.md), [HPX-PROC-016.003](../process-catalogue/HPX-PROC-016.md), [HPX-PROC-016.004](../process-catalogue/HPX-PROC-016.md), [HPX-PROC-016.005](../process-catalogue/HPX-PROC-016.md), [HPX-PROC-016.006](../process-catalogue/HPX-PROC-016.md), [HPX-PROC-016.007](../process-catalogue/HPX-PROC-016.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md); [docs/06-subsystems/formats/crypto-envelopes.md:1](../../../docs/06-subsystems/formats/crypto-envelopes.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/08-assurance/privacy-and-data-protection.md:1](../../../docs/08-assurance/privacy-and-data-protection.md).

## HPX-DIAG-P017 — Future collaboration and federation subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-017.001](../process-catalogue/HPX-PROC-017.md), [HPX-PROC-017.002](../process-catalogue/HPX-PROC-017.md), [HPX-PROC-017.003](../process-catalogue/HPX-PROC-017.md), [HPX-PROC-017.004](../process-catalogue/HPX-PROC-017.md), [HPX-PROC-017.005](../process-catalogue/HPX-PROC-017.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/04-architecture/component-architecture.md:1](../../../docs/04-architecture/component-architecture.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md).

## HPX-DIAG-P018 — Assurance, build and governance subprocesses

Question: What are the leaves and their temporal scope? Level: System/component/process as stated in title. Milestone: Mixed scope, explicitly marked per leaf.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-018.001](../process-catalogue/HPX-PROC-018.md), [HPX-PROC-018.002](../process-catalogue/HPX-PROC-018.md), [HPX-PROC-018.003](../process-catalogue/HPX-PROC-018.md), [HPX-PROC-018.004](../process-catalogue/HPX-PROC-018.md), [HPX-PROC-018.005](../process-catalogue/HPX-PROC-018.md), [HPX-PROC-018.006](../process-catalogue/HPX-PROC-018.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/08-assurance/formal-validation-digest.md:1](../../../docs/08-assurance/formal-validation-digest.md); [docs/08-assurance/testing-strategy.md:1](../../../docs/08-assurance/testing-strategy.md); [docs/08-assurance/build-and-release.md:1](../../../docs/08-assurance/build-and-release.md); [docs/02-governance/OWNER_DECISIONS.md:1](../../../docs/02-governance/OWNER_DECISIONS.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md).

## HPX-DIAG-005 — Context DFD level 0

Question: Which information crosses the whole-system boundary? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-001](../process-catalogue/HPX-PROC-001.md), [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-013](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-015](../process-catalogue/HPX-PROC-015.md). Child/related views: [HPX-DIAG-006](data-flow/006.svg).

Sources: [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/04-architecture/component-architecture.md:1](../../../docs/04-architecture/component-architecture.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md).

## HPX-DIAG-006 — Subsystem DFD level 1

Question: How do parent information channels decompose without adding outside actors? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-002](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-006](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-013](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-015](../process-catalogue/HPX-PROC-015.md). Child/related views: [HPX-DIAG-007](data-flow/007.svg), [HPX-DIAG-008](data-flow/008.svg), [HPX-DIAG-009](data-flow/009.svg).

Sources: [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/04-architecture/component-architecture.md:1](../../../docs/04-architecture/component-architecture.md); [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md).

## HPX-DIAG-007 — Durable Save and Commit lower DFD

Question: Which data transforms into encrypted records and an acknowledgement? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-003.001](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-003.002](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-003.003](../process-catalogue/HPX-PROC-003.md). Child/related views: [HPX-DIAG-013](sequence/013.svg), [HPX-DIAG-014](sequence/014.svg).

Sources: [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md).

## HPX-DIAG-008 — Transformation and annotation lower DFD

Question: How do exact sources feed new entities while source history stays retained? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-006.002](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-007.002](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-007.003](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-009](../process-catalogue/HPX-PROC-009.md). Child/related views: [HPX-DIAG-017](activity/017.svg), [HPX-DIAG-020](state/020.svg).

Sources: [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md); [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md).

## HPX-DIAG-009 — Future export lower DFD

Question: Which captured information determines an artifact and prevents silent head refresh? Level: System/component/process as stated in title. Milestone: Future only.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-011](../process-catalogue/HPX-PROC-011.md), [HPX-PROC-013](../process-catalogue/HPX-PROC-013.md). Child/related views: [HPX-DIAG-023](sequence/023.svg), [HPX-DIAG-024](activity/024.svg).

Sources: [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md).

## HPX-DIAG-010 — Conceptual identity, placement and immutable closure

Question: Which relationships are conceptual identity and which are version or occurrence bindings? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-005](../process-catalogue/HPX-PROC-005.md), [HPX-PROC-007](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-009](../process-catalogue/HPX-PROC-009.md). Child/related views: [HPX-DIAG-011](data-model/011.svg), [HPX-DIAG-012](data-model/012.svg).

Sources: [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/05-domain/assertions-and-predicates.md:1](../../../docs/05-domain/assertions-and-predicates.md).

## HPX-DIAG-011 — Working branch conceptual extension

Question: How does pending text obtain exact provenance without becoming a committed revision? Level: System/component/process as stated in title. Milestone: Accepted design / gated code.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-008](../process-catalogue/HPX-PROC-008.md). Child/related views: [HPX-DIAG-015](sequence/015.svg), [HPX-DIAG-019](state/019.svg).

Sources: [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md).

## HPX-DIAG-012 — Physical encrypted storage responsibilities

Question: How do conceptual objects map to storage without conflating schema and payload versions? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-016](../process-catalogue/HPX-PROC-016.md). Child/related views: [HPX-DIAG-029](recovery/029.svg).

Sources: [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/formats/hpx-workspace.md:1](../../../docs/06-subsystems/formats/hpx-workspace.md).

## HPX-DIAG-013 — Autosave, newer typing and lost acknowledgement

Question: What prevents a delayed Save acknowledgement from replacing newer typing? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-003.002](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-003.004](../process-catalogue/HPX-PROC-003.md). Child/related views: [HPX-DIAG-014](sequence/014.svg), [HPX-DIAG-018](state/018.svg).

Sources: [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md).

## HPX-DIAG-014 — Atomic text publication and recovery

Question: Which objects become durable together, and what happens around COMMIT? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-003.003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-008.005](../process-catalogue/HPX-PROC-008.md). Child/related views: [HPX-DIAG-015](sequence/015.svg), [HPX-DIAG-029](recovery/029.svg).

Sources: [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md).

## HPX-DIAG-015 — Working Copy, promotion and separate replacement

Question: Where is atomicity deliberately split to keep text publication independent? Level: System/component/process as stated in title. Milestone: Gated code; explicit A/B/C atomicity boundaries.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-008.003](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.004](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.005](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-008.006](../process-catalogue/HPX-PROC-008.md). Child/related views: [HPX-DIAG-011](data-model/011.svg), [HPX-DIAG-019](state/019.svg), [HPX-DIAG-029](recovery/029.svg).

Sources: [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md).

## HPX-DIAG-016 — Keychain enrollment compensation

Question: How are SQLite and native keychain partial failure handled without weakening passphrase recovery? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-002.005](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-002.007](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-014.003](../process-catalogue/HPX-PROC-014.md). Child/related views: [HPX-DIAG-029](recovery/029.svg).

Sources: [docs/04-architecture/decisions/0014-keychain-unlock-policy.md:1](../../../docs/04-architecture/decisions/0014-keychain-unlock-policy.md).

## HPX-DIAG-017 — Source transform and immutable annotation workflow

Question: How do source validation, review and publication preserve identity distinctions? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-007](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-009](../process-catalogue/HPX-PROC-009.md). Child/related views: [HPX-DIAG-020](state/020.svg), [HPX-DIAG-021](state/021.svg).

Sources: [docs/06-subsystems/interfaces/domain-navigation.md:1](../../../docs/06-subsystems/interfaces/domain-navigation.md).

## HPX-DIAG-018 — Workspace and buffer state machines

Question: Which session/unlock states permit editing and which acknowledgement states remain uncertain? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-002](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-003.004](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-004.005](../process-catalogue/HPX-PROC-004.md). Child/related views: [HPX-DIAG-019](state/019.svg).

Sources: [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md).

## HPX-DIAG-019 — Working checkpoint and reference lifecycle

Question: Which transitions retain exact unpublished source and which need a later explicit operation? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-008](../process-catalogue/HPX-PROC-008.md). Child/related views: [HPX-DIAG-015](sequence/015.svg).

Sources: [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md).

## HPX-DIAG-020 — Annotation entity lifecycle

Question: What does review change, and what does it leave immutable? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-009](../process-catalogue/HPX-PROC-009.md). Child/related views: [HPX-DIAG-021](state/021.svg).

Sources: [docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md:1](../../../docs/04-architecture/decisions/0010-semantic-annotation-snapshots.md); [docs/04-architecture/decisions/0017-initial-durable-comments.md:1](../../../docs/04-architecture/decisions/0017-initial-durable-comments.md).

## HPX-DIAG-021 — Document, content branch and immutable revision lifecycles

Question: Which mutable heads advance without changing logical node or retained versions? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-005.001](../process-catalogue/HPX-PROC-005.md), [HPX-PROC-007.002](../process-catalogue/HPX-PROC-007.md), [HPX-PROC-008.001](../process-catalogue/HPX-PROC-008.md). Child/related views: [HPX-DIAG-010](data-model/010.svg), [HPX-DIAG-014](sequence/014.svg).

Sources: [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/04-architecture/decisions/0018-initial-local-branches.md:1](../../../docs/04-architecture/decisions/0018-initial-local-branches.md); [docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md:1](../../../docs/04-architecture/decisions/0019-working-branches-and-reference-checkpoints.md); [docs/09-guides/reference/DEVELOPMENT_STATE.md:1](../../../docs/09-guides/reference/DEVELOPMENT_STATE.md).

## HPX-DIAG-022 — Future human-agent proposal state

Question: What separates provider output, human approval and authority to apply? Level: System/component/process as stated in title. Milestone: Future contract only.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-012](../process-catalogue/HPX-PROC-012.md). Child/related views: [HPX-DIAG-023](sequence/023.svg).

Sources: [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md).

## HPX-DIAG-023 — Future GitHub publication with unknown outcome

Question: Why can an approved remote write have an unknown result without allowing blind replay? Level: System/component/process as stated in title. Milestone: Future optional integration.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-015.004](../process-catalogue/HPX-PROC-015.md). Child/related views: [HPX-DIAG-024](activity/024.svg).

Sources: [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md).

## HPX-DIAG-024 — Future export and Word review workflows

Question: Where must selection, review, ambiguity and egress approval remain explicit? Level: System/component/process as stated in title. Milestone: Future only.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-013](../process-catalogue/HPX-PROC-013.md), [HPX-PROC-014.002](../process-catalogue/HPX-PROC-014.md), [HPX-PROC-011](../process-catalogue/HPX-PROC-011.md). Child/related views: [HPX-DIAG-009](data-flow/009.svg), [HPX-DIAG-023](sequence/023.svg).

Sources: [docs/06-subsystems/external-integrations.md:1](../../../docs/06-subsystems/external-integrations.md); [docs/06-subsystems/import-export.md:1](../../../docs/06-subsystems/import-export.md).

## HPX-DIAG-025 — Trust and plaintext boundaries

Question: Where is plaintext visible, and which guarantees depend on trusted delivery or the host? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-011](../process-catalogue/HPX-PROC-011.md), [HPX-PROC-012](../process-catalogue/HPX-PROC-012.md), [HPX-PROC-016](../process-catalogue/HPX-PROC-016.md). Child/related views: [HPX-DIAG-026](recovery/026.svg), [HPX-DIAG-029](recovery/029.svg).

Sources: [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md); [docs/06-subsystems/security-cryptography.md:1](../../../docs/06-subsystems/security-cryptography.md).

## HPX-DIAG-026 — Request and operation failure propagation

Question: Which failures reject, remain uncertain, or need scoped compensation? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-016.003](../process-catalogue/HPX-PROC-016.md). Child/related views: [HPX-DIAG-016](sequence/016.svg), [HPX-DIAG-023](sequence/023.svg), [HPX-DIAG-029](recovery/029.svg).

Sources: [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md).

## HPX-DIAG-027 — Future independent replicas and structural conflict

Question: Why are local DAG checks insufficient to promise federation convergence? Level: System/component/process as stated in title. Milestone: Future only; logical counterexample.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-017](../process-catalogue/HPX-PROC-017.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/05-domain/hypergraph-mathematics.md:1](../../../docs/05-domain/hypergraph-mathematics.md); [docs/04-architecture/component-architecture.md:1](../../../docs/04-architecture/component-architecture.md).

## HPX-DIAG-028 — Dependency and contention structure

Question: Which dependencies are acyclic and where is responsibility concentrated? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: Static Cargo/import analysis corroborates edges; shared super imports are not a precise call graph.

Processes: [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-004](../process-catalogue/HPX-PROC-004.md), [HPX-PROC-018](../process-catalogue/HPX-PROC-018.md). Child/related views: Leaf view; return to process inventory.

Sources: [docs/04-architecture/system-architecture.md:1](../../../docs/04-architecture/system-architecture.md); [docs/04-architecture/component-architecture.md:1](../../../docs/04-architecture/component-architecture.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md); [docs/08-assurance/security-threat-model.md:1](../../../docs/08-assurance/security-threat-model.md).

## HPX-DIAG-029 — Recovery responsibilities and irrecoverable boundaries

Question: What can reopening, receipts, backup or repair actually recover? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-002](../process-catalogue/HPX-PROC-002.md), [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-014](../process-catalogue/HPX-PROC-014.md), [HPX-PROC-015](../process-catalogue/HPX-PROC-015.md). Child/related views: [HPX-DIAG-026](recovery/026.svg).

Sources: [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md); [docs/08-assurance/recovery.md:1](../../../docs/08-assurance/recovery.md).

## HPX-DIAG-030 — Assurance and authority boundaries

Question: Which conclusions come from tests, proofs, code alignment, owner decisions or this review? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-018](../process-catalogue/HPX-PROC-018.md). Child/related views: [HPX-DIAG-004](process/004.svg).

Sources: [docs/08-assurance/formal-validation-digest.md:1](../../../docs/08-assurance/formal-validation-digest.md); [docs/08-assurance/testing-strategy.md:1](../../../docs/08-assurance/testing-strategy.md).

## HPX-DIAG-031 — Publication, branch and actor bindings

Question: Which identities authorize a current action and which records merely retain historical attribution? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-003](../process-catalogue/HPX-PROC-003.md), [HPX-PROC-008](../process-catalogue/HPX-PROC-008.md), [HPX-PROC-010](../process-catalogue/HPX-PROC-010.md). Child/related views: [HPX-DIAG-010](data-model/010.svg), [HPX-DIAG-011](data-model/011.svg), [HPX-DIAG-014](sequence/014.svg).

Sources: [docs/05-domain/core-object-model.md:1](../../../docs/05-domain/core-object-model.md); [docs/05-domain/document-semantics.md:1](../../../docs/05-domain/document-semantics.md); [docs/07-implementation/protocols/draft-publication.md:1](../../../docs/07-implementation/protocols/draft-publication.md); [docs/07-implementation/data-structures/sqlite-records.md:1](../../../docs/07-implementation/data-structures/sqlite-records.md).

## HPX-DIAG-032 — N-ary relationship and selected historical graph scope

Question: How does one reviewed claim retain roles without becoming pairwise facts or complete outgoing knowledge? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-006.004](../process-catalogue/HPX-PROC-006.md), [HPX-PROC-009.003](../process-catalogue/HPX-PROC-009.md). Child/related views: [HPX-DIAG-017](activity/017.svg), [HPX-DIAG-020](state/020.svg).

Sources: [docs/06-subsystems/graph-engine.md:1](../../../docs/06-subsystems/graph-engine.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md).

## HPX-DIAG-033 — Exact owned source and browser projection

Question: How does a browser selection resolve to exact mixed-newline UTF8 bytes? Level: System/component/process as stated in title. Milestone: Local unless explicitly F / G.

Assumptions/limits: No inferred mechanism; F nodes are future contracts, G nodes are gated code.

Processes: [HPX-PROC-004.001](../process-catalogue/HPX-PROC-004.md), [HPX-PROC-006.002](../process-catalogue/HPX-PROC-006.md). Child/related views: [HPX-DIAG-013](sequence/013.svg), [HPX-DIAG-017](activity/017.svg).

Sources: [docs/05-domain/text-and-anchors.md:1](../../../docs/05-domain/text-and-anchors.md); [docs/06-subsystems/interfaces/browser-runtime.md:1](../../../docs/06-subsystems/interfaces/browser-runtime.md).
