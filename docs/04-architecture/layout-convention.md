# C3/C4 boundary layout coverage

2026-10-30 · Supporting modelling record · HPX-OWNER-023 · HPX-TEST-104

All 19 C3/C4 static views use one named subject boundary. Internal responsibilities sit inside it, with functional subgroups where useful. Callers, input/data sources, neighbouring dependencies and output consumers sit outside. Existing directional captions and relationships are retained. An outside neighbour may still execute in the same Rust process.

Nine views required regrouping and new saved layouts; ten retained their box, connector and label geometry. The Rust-engine reference arrangement is preserved. C1/C2 and all 13 sequence views are unchanged. Primary navigation remains **C1 → C2 → C3 executable overview → focused C3 expansions → C4**.

| Diagram | Internals | Outside context / I/O | Layout | Source |
| --- | ---: | ---: | --- | --- |
| C3 / HPX Rust executable | 8 | 12 | Preserved | [C3/executable.c4](diagrams/executable.c4) |
| C3 / Frontend delivery | 5 | 6 | Regrouped | [C3/frontend-delivery.c4](../08-assurance/diagrams/delivery/frontend-delivery.c4) |
| C3 / Pure domain | 5 | 2 | Preserved | [C3/pure-domain.c4](../06-subsystems/diagrams/pure-domain.c4) |
| C3 / Application coordination | 5 | 9 | Regrouped | [C3/remaining-c3.c4](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C3 / Workspace persistence | 5 | 6 | Preserved | [C3/remaining-c3.c4](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C3 / Cryptographic adapter | 5 | 2 | Preserved | [C3/remaining-c3.c4](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C3 / Keychain adapter | 5 | 5 | Preserved | [C3/remaining-c3.c4](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C3 / Integration adapters (planned) | 6 | 11 | Preserved | [C3/remaining-c3.c4](../06-subsystems/diagrams/shared-responsibilities.c4) |
| C3 / Runtime and API | 8 | 8 | Preserved | [C3/runtime-api.c4](../06-subsystems/diagrams/runtime-api.c4) |
| C4 / API dispatch and wire adapters — Implementation (shared) | 10 | 11 | Regrouped | [C4/api-implementation.c4](../07-implementation/diagrams/api-implementation.c4) |
| C4 / Command admission and transaction scope — Implementation (shared) | 4 | 3 | Regrouped | [C4/application-coordination.c4](../07-implementation/diagrams/application-coordination.c4) |
| C4 / Feature operation coordination — Implementation (shared) | 10 | 4 | Regrouped | [C4/application-coordination.c4](../07-implementation/diagrams/application-coordination.c4) |
| C4 / Protected read entry points — Implementation | 6 | 3 | Regrouped | [C4/application-coordination.c4](../07-implementation/diagrams/application-coordination.c4) |
| C4 / Frontend build tooling (development) — Implementation | 2 | 2 | Preserved | [C4/frontend-delivery-implementation.c4](../08-assurance/diagrams/delivery/frontend-delivery-implementation.c4) |
| C4 / Rust asset embedding — Implementation (shared) | 2 | 3 | Preserved | [C4/frontend-delivery-implementation.c4](../08-assurance/diagrams/delivery/frontend-delivery-implementation.c4) |
| C4 / Embedded-asset routing — Implementation (shared) | 4 | 3 | Regrouped | [C4/frontend-delivery-implementation.c4](../08-assurance/diagrams/delivery/frontend-delivery-implementation.c4) |
| C4 / Frontend delivery — Implementation overview | 6 | 5 | Regrouped | [C4/frontend-delivery-overview.c4](../08-assurance/diagrams/delivery/frontend-delivery-overview.c4) |
| C4 / Exact fragment and checkpoint plans — Implementation (shared) | 6 | 8 | Preserved | [C4/pure-domain.c4](../07-implementation/diagrams/pure-domain.c4) |
| C4 / Same-node history and passage planning — Implementation (shared) | 7 | 4 | Regrouped | [C4/pure-domain.c4](../07-implementation/diagrams/pure-domain.c4) |

## Scope of the boundaries

- Application coordination contains its five coordination responsibilities. Feature collaborators, policy, pure rules and persistence remain visible outside; this does not move their Rust code or introduce an application facade.
- API dispatch contains route-family fragments and wire conversion. Shared request/session guards, capability comparison, Workspace operations and resource authorization remain contextual neighbours. Route-family boxes still describe branches of existing code, not separate handlers or services.
- Frontend delivery spans a build/delivery chain. Its nested build-time group is explicitly development-only; it is not a deployment inside the released executable. Prepared assets remain an external handoff artifact. Browser execution and shared transport callers remain outside the focal implementation boundaries.
- Exact-source and history views contain pure code and supplied-input validation. Storage adapters and test callers remain outside. Planned integrations retain their planned status. Shared implementation remains labelled as shared.

These are presentation boundaries over existing evidence, not new modules, deployment units, approved V3 semantics or compatibility decisions. No components, dependencies, contracts, status tags or implementation claims were added.

## Executed verification

- LikeC4 1.60.0 validates all 16 source files, including saved-layout drift checks.
- All 19 boundaries have exactly their recorded internal members. Outside context is structurally and geometrically outside; internal boxes and nested groups are contained, with no overlapping leaf boxes.
- All 140 newly routed links are single cubic curves, sampled at 321 points for bounds, unrelated-box/header clearance and boundary crossings. Internal links stay inside; context-only links stay outside; input/output links cross the subject boundary once. New labels clear boxes, headers and other labels.
- Ten existing target geometries remain unchanged. Global model elements, relationships, view IDs, leaf meanings, relationship meanings and navigation remain unchanged. All 34 views are reachable; eight executable blocks open focused C3 expansions and all ten C4 views retain expansion entry points.
- All 705 local DSL source links resolve. All 429 protected application/generated/API/proof/legal/manifest/lockfile/counter file hashes remain unchanged.
- Native static approximations of the nine revised layouts were inspected without a browser. This is not actual VS Code renderer acceptance. Application tests, builds, launch, asset/contract generation and proof tools were not run.

See the membership and rationale record, saved placement plan and executed validation. Historical audit geometry claims remain records of their original runs; this owner-requested relayout supersedes the nine affected arrangements.
