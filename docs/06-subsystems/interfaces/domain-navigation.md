# Domain/navigation contract

## Common metadata

- **ID:** `HPX-API-001`
- **Title:** Domain/navigation contract
- **Purpose:** Pure domain and planned navigation APIs, with exact implemented versus proposed boundaries.
- **Level:** `06-subsystems`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-DOM-001](<../../05-domain/core-object-model.md>); [HPX-DOM-002](<../../05-domain/hypergraph-mathematics.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25



Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Provider and consumers

Pure domain and planned navigation APIs, with exact implemented versus proposed boundaries. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Version and compatibility

Pure domain and planned navigation APIs, with exact implemented versus proposed boundaries. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Messages and type schemas



### Data structures and navigation: MU-F technical reference

Source `HPX-SRC-0026`, original lines 1–6. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

Status: current data and navigation contract, 2026-10-24. The navigation/type table below remains proposed. The first implemented validator is documented in §9. Proposed names/contracts below will be replaced or linked to actual symbols as implementation proceeds. Domain wire fields and container choices await accepted decisions; the separate crypto envelope adapter is now documented in §10.

Related requirements: [mathematical model](<../../05-domain/hypergraph-mathematics.md>), [encryption](<../security-cryptography.md>), [architecture](<../../04-architecture/system-architecture.md>) and the [product specification](<../../03-requirements/system-requirements.md>). This reference defines data/navigation mechanisms and marks proposed interfaces explicitly.

### 3. Proposed navigation contracts

Source `HPX-SRC-0026`, original lines 42–63. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

All names below are interface sketches. Every query needs an explicit consistent read view or exact snapshot, authorized principal/scope, and resource budget. Historical lookup does not grant current access. Return incomplete/denied/budget errors honestly; do not silently substitute a current revision.

| Proposed operation | Inputs and result | Algorithm / expected baseline cost |
|---|---|---|
| `get_node` / `get_revision` | Authorized identity → verified record | Indexed lookup plus object verification/decoding bytes |
| `children` / `parent_occurrence` | Manifest/context occurrence → ordered placements / exact parent | Adjacency/parent index; cost proportional to returned children after lookup |
| `walk_document` | Resolved root → ordered occurrence/source spans | Iterative traversal, active-path tracking, O(expanded occurrences + emitted bytes) |
| `find_occurrences` | Node and view scope → every permitted placement | Reverse occurrence index and bounded pagination; do not scan/render every document |
| `outgoing_links` / `backlinks` | Identity/revision, edge type, scope → edges | Forward/reverse adjacency indexes; O(lookup + page) |
| `ancestors` / `descendants` | Exact revision or occurrence graph → bounded reachability | O(V + E) over visited projection without an additional index |
| `is_ancestor` / `common_bases` | Exact retained states → ancestry result/candidate bases | DAG traversal with budget; multiple bases remain explicit, not timestamp-selected |
| `derivation_inputs` / `derived_outputs` | Immutable revision/event → ordered origins/results | Forward/reverse event index; preserve original revision rather than following result heads |
| `resolve_snapshot` | Manifest + consistent selected view → complete bindings | Resolve reachable contexts/rules; validate ownership/permission/completeness before publication |
| `reconstruct_snapshot` | Exact snapshot/profile → bytes + ordered source map | No live-head/provider/query lookup; bounded repeated rendering |
| `impact_of_change` | Source revision/rule and scope → affected live dependants | Reverse reachability; pinned historical uses do not advance automatically |
| `history_page` | Node/manifest/snapshot scope + cursor → immutable event page | Indexed causal/local publication order; stable cursor, no retained-history count cap |
| `validate_move` | Exact structure/base, occurrence, destination → valid plan/conflict | Reachability from destination before edge insertion; preserve one parent and order |

Here V/E refer to the traversed authorized projection, not automatically the entire workspace. Physical storage/index choice is unresolved, so logarithmic index access is a design target rather than a benchmarked guarantee. No algorithm avoids output-size cost for a complete rendering. An index must specify its exact scope—current state, retained history metadata, or optional historical full text.

### 11. Planned workspace/reuse queries

Source `HPX-SRC-0026`, original lines 144–146. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The [workspace interface contract](<../document-engine.md>) adds unimplemented requirements, not Rust symbols: list collection memberships versus composition children; resolve revision-bound selection anchors; trace cross-document derivation; inspect contextual assertions; resolve a designated live track; and manage protected per-principal/workspace clipboard entries. All queries bind exact view/context, permissions and budgets. Anchor transforms report ambiguity rather than silently quote-matching another occurrence. Reverse occurrence/backlink/lineage indexes are reconstructible; private clipboard order and acknowledged entries are protected application state, not a graph index. Query/renderer results never grant mutation or historical-key authority. Actual APIs in §§9–10 are unchanged.


## Preconditions, postconditions and errors

Pure domain and planned navigation APIs, with exact implemented versus proposed boundaries. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Ordering, retry and idempotency

Pure domain and planned navigation APIs, with exact implemented versus proposed boundaries. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Authentication and authorisation

Pure domain and planned navigation APIs, with exact implemented versus proposed boundaries. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Examples and conformance tests

Use the source-grounded examples/evidence above and [acceptance gates](<../../03-requirements/acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 1–6; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 42–63; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0026` — `Specifications/DATA/README.md`, lines 144–146; SHA-256 `1b821f333c1bd2db9cfd3499017a6c43597403b66fbc0520f91429616febd800`. Original bytes and paths are recorded in [source manifest](<../../registers/source-manifest.csv>); archive is local/ignored.
