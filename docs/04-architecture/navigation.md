# Visual diagram navigation

**Standing hierarchy:** C1 → C2 → C3 overview → C3 expansions → C4. Main overview component boxes always open the corresponding C3 expansion; C4 shortcuts must not replace that route.

**Frontend delivery:** click **Frontend delivery** in **C3 / HPX Rust executable** to open **C3 / Frontend delivery**. Within that expansion, **Prepared frontend/dist** explicitly opens **C4 / Frontend delivery — Implementation overview**;other responsibility boxes open focused C4 views.

**Standing layout:** keep the subject’s internals inside one named boundary and its callers,data/input sources,neighbouring dependencies and output consumers outside. Nest functional groups inside as needed;label directional boundary links. This convention governs future creation/refinement;the navigation correction does not claim that all older layouts have already been revised. Sequence views retain standard lifelines.

| Diagram | Open from | Click | Source |
|---|---|---|---|
| C1 / System context | Start here | System context | [source](diagrams/context.c4) |
| C2 / HPX containers | C1 / System context | Hypergraph PX | [source](diagrams/containers.c4) |
| C3 / User interface | C3 / Browser interface | User interface | [source](../06-subsystems/diagrams/browser/organisation.c4) |
| C3 / Interface functions | C3 / Browser interface | Interface functions | [source](../06-subsystems/diagrams/browser/organisation.c4) |
| C3 / Browser interface | C2 / HPX containers | Browser interface | [source](../06-subsystems/diagrams/browser/interface.c4) |
| C3 / Application coordination | C3 / HPX Rust executable | Application coordination | [source](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C3 / Cryptographic adapter | C3 / HPX Rust executable | Cryptographic adapter | [source](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C3 / Frontend delivery | C3 / HPX Rust executable | Frontend delivery | [source](../08-assurance/diagrams/delivery/frontend-delivery.c4) |
| C3 / HPX Rust executable | C2 / HPX containers | HPX Rust executable | [source](diagrams/executable.c4) |
| C3 / Integration adapters (planned) | C3 / HPX Rust executable | Integration adapters (planned) | [source](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C3 / Keychain adapter | C3 / HPX Rust executable | Keychain adapter | [source](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C3 / Pure domain | C3 / HPX Rust executable | Pure domain | [source](../06-subsystems/diagrams/pure-domain.c4) |
| C3 / Runtime and API | C3 / HPX Rust executable | Runtime and API | [source](../06-subsystems/diagrams/runtime-api.c4) |
| C3 / Workspace persistence | C3 / HPX Rust executable | Workspace persistence | [source](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C4 / Workspace and contents navigation — Implementation | C3 / User interface | Workspace and contents navigation | [source](../07-implementation/diagrams/workspace-navigation.c4) |
| C4 / API dispatch and wire adapters — Implementation (shared) | C3 / Runtime and API | Request, session and lock gates | [source](../07-implementation/diagrams/api-implementation.c4) |
| C4 / Command admission and transaction scope — Implementation (shared) | C3 / Application coordination | Command admission and transaction scope | [source](../07-implementation/diagrams/application-coordination.c4) |
| C4 / Embedded-asset routing — Implementation (shared) | C3 / Runtime and API | Embedded-asset routing | [source](../08-assurance/diagrams/delivery/frontend-delivery-implementation.c4) |
| C4 / Exact fragment and checkpoint plans — Implementation (shared) | C3 / Pure domain | Exact fragment and checkpoint plans | [source](../07-implementation/diagrams/pure-domain.c4) |
| C4 / Feature operation coordination — Implementation (shared) | C3 / Application coordination | Feature operation coordination | [source](../07-implementation/diagrams/application-coordination.c4) |
| C4 / Frontend build tooling (development) — Implementation | C3 / Frontend delivery | Frontend source, assets and build inputs | [source](../08-assurance/diagrams/delivery/frontend-delivery-implementation.c4) |
| C4 / Frontend delivery — Implementation overview | C3 / Frontend delivery | Prepared frontend/dist | [source](../08-assurance/diagrams/delivery/frontend-delivery-overview.c4) |
| C4 / Protected read entry points — Implementation | C3 / Application coordination | Protected read entry points | [source](../07-implementation/diagrams/application-coordination.c4) |
| C4 / Rust asset embedding — Implementation (shared) | C3 / Frontend delivery | Rust version and build-counter inputs | [source](../08-assurance/diagrams/delivery/frontend-delivery-implementation.c4) |
| C4 / Same-node history and passage planning — Implementation (shared) | C3 / Pure domain | Supplied expansion projection | [source](../07-implementation/diagrams/pure-domain.c4) |
| Sequence / Application coordination — Authorize, reconcile and publish | C4 / Command admission and transaction scope — Implementation (shared) | Workspace • Publication / receipts | [source](../07-implementation/diagrams/sequences/application-workflows.c4) |
| Sequence / Application coordination — Capture and promote a working reference | C4 / Feature operation coordination — Implementation (shared) | working • existing adapter code | [source](../07-implementation/diagrams/sequences/application-workflows.c4) |
| Sequence / Application coordination — Commit captured draft | C4 / API dispatch and wire adapters — Implementation (shared) | route_inner • Publication / receipts | [source](../07-implementation/diagrams/sequences/api-workflows.c4) |
| Sequence / Application coordination — Read an exact retained snapshot | C4 / Protected read entry points — Implementation | Workspace • Documents / editor reads | [source](../07-implementation/diagrams/sequences/application-workflows.c4) |
| Sequence / Application coordination — Recover uncertain command outcome | C4 / API dispatch and wire adapters — Implementation (shared) | RuntimeAdapter / initializeRuntime | [source](../07-implementation/diagrams/sequences/api-workflows.c4) |
| Sequence / Application coordination — Save draft | C4 / API dispatch and wire adapters — Implementation (shared) | Workspace • Publication / receipts | [source](../07-implementation/diagrams/sequences/api-workflows.c4) |
| Sequence / Frontend delivery — Build and embed assets | C4 / Frontend build tooling (development) — Implementation | buildFrontend • bundle and copy | [source](../08-assurance/diagrams/delivery/frontend-delivery-workflows.c4) |
| Sequence / Frontend delivery — Establish launch session | C3 / Frontend delivery | Browser interface | [source](../08-assurance/diagrams/delivery/frontend-delivery-workflows.c4) |
| Sequence / Frontend delivery — Load browser interface | C4 / Embedded-asset routing — Implementation (shared) | write_response • headers and body | [source](../08-assurance/diagrams/delivery/frontend-delivery-workflows.c4) |
| Sequence / Pure domain — Plan a Fork and hand off publication | C4 / Feature operation coordination — Implementation (shared) | forks • existing adapter code | [source](../07-implementation/diagrams/sequences/pure-domain-workflows.c4) |
| Sequence / Pure domain — Select a supplied parent-Merge result | C4 / Same-node history and passage planning — Implementation (shared) | parent_merge • plan | [source](../07-implementation/diagrams/sequences/pure-domain-workflows.c4) |
| Sequence / Pure domain — Validate supplied expansion | C4 / Same-node history and passage planning — Implementation (shared) | Existing domain unit-test call sites | [source](../07-implementation/diagrams/sequences/pure-domain-workflows.c4) |
| Sequence / Runtime and API — Unlock workspace | C3 / Runtime and API | Workspace session lifecycle | [source](../07-implementation/diagrams/sequences/api-workflows.c4) |

**Browser interface:** its box in C2 / HPX containers opens C3 / Browser interface directly. The overview has exactly two blocks: User interface and Interface functions, each opening a focused C3 expansion. The original six responsibilities are retained in Interface functions; C4 remains later work. Rust context boxes open their existing focused C3 views.

**User interface expansion:** top/bottom toolbars surround Navigator (left),Editor (centre,including minimap),and Functions (right: Collaborators above Relations). Shared Interface functions remains external to this UI boundary.

**Workspace and contents navigation:** click its box in the left Navigator group of C3 / User interface to open the source-linked C4 implementation and its providers/consumers.

**Graph target:** the User interface Editor (centre) group now shows a planned Graph tab alongside the existing document editor in a planned shared tab host. Navigation C4 separates the current dialog callback from the dashed planned tab route. No Graph-tab implementation view is claimed.

Supplemental conceptual navigation: **C3 / Pure domain** links to [Distinct graph projections](../05-domain/diagrams/graph-projections.c4), HPX-CAN-025. This flat conceptual view complements the existing architectural hierarchy; no C4 shortcut or new runtime component is introduced.

Contract navigation uses element-detail links, independently of diagram drill-down. The [binding convention](SPECIFICATION.md#explicit-contract-bindings) and [section register](../02-governance/registers/contract-bindings.json) provide exact prose targets and reverse element/scope/view IDs. All existing `navigateTo` routes remain unchanged.
