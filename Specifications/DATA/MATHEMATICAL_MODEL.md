# Mathematical data model

Status: required semantics with implementation boundaries, 2026-10-24. Exact Rust record schemas and wire encodings remain to be implemented. [The data reference](README.md) identifies actual APIs.

## Typed temporal multigraph

Represent the workspace as immutable canonical records and typed relationships with derived projections. Multiple edges between the same endpoints may carry different types, occurrence context, order and provenance. Do not impose one global graph constraint on every relationship.

| Projection | Mathematical constraint | Meaning |
|---|---|---|
| Composition | Ordered rooted forest of placement occurrences in a resolved view | Authorial structure and reading order |
| References | Typed directed multigraph, cycles allowed | Hyperlinks, citations and semantic assertions |
| Expansion | Directed acyclic dependency projection | Recursively included content; reject accepted expansion cycles |
| Revision ancestry | Immutable same-identity DAG | Content/manifest evolution, branches and merge parents |
| Derivation | Explicit cross-identity lineage through transformation events | Fork, extraction, split, merge and reuse provenance |
| Snapshot closure | Finite exact bindings for all reachable occurrence contexts | Historically fixed document reconstruction |

Dependency/topological order is not authorial reading order. A semantic assertion or recorded derivation is neither a proof of logical entailment nor an authority grant.

## Identities, occurrences and temporal state

Distinguish logical content, immutable revision, placement occurrence, manifest revision, transformation event, snapshot, atomic commit, draft, principal, device and group. Physical encrypted addresses and private content commitments are separate again. Equal text does not imply equal identity; re-encryption does not create a new logical revision.

An occurrence references a logical content identity. Two occurrences may reference the same content while retaining different placement order, parent, metadata and revision/closure selection. In a resolved composition, each non-root occurrence has exactly one structural parent. Moving a placement preserves its identity; reusing content creates a distinct placement. Removing one placement does not erase its source or retained history.

An immutable manifest captures ordered structure and document-local prose independently of separately versioned constituent content. Content-only edits must not manufacture a new manifest history in every containing document. Ordering representation remains a mechanism decision; vectors, fractional keys and sequence CRDTs must not be treated as equivalent concurrency guarantees.

## Revision and transformation histories

For one logical identity, revision ancestry is a DAG. Every revision parent belongs to that identity and names an exact retained immutable revision. Divergent revisions remain retained; merges append a revision with explicit parents. Restore appends a new state rather than rewriting history. Wall-clock timestamps do not establish ancestry.

Fork/extraction creates a new content identity with explicit provenance from exact source revisions/ranges. A source from another identity is not a same-identity revision parent. Represent a multi-input/multi-output transformation as an event with ordered input and output revision references, operation parameters, actor/device attribution, exact source ranges and contribution mappings. This incidence representation preserves the distinction between lineage and same-identity ancestry. Preserve source bytes/ranges unless an explicit reviewed operation changes them.

## Closed snapshots and source ownership

A snapshot binds an exact root manifest, every reachable content/manifest selection and all reconstruction inputs. Its binding key includes the occurrence context/path needed to distinguish repeated nested inclusions; a map keyed only by content ID, occurrence ID or shared manifest revision is insufficient in general. A revision pin and a complete nested closure pin have different semantics and need explicit representation.

Example: document D uses paragraph P twice as placements o1 and o2. Snapshot s1 binds both to p1. After P advances to p2, snapshot s2 may bind o1 to p2 and o2 to p1. Reading s1 still selects p1 twice. If the same nested manifest is included in two contexts, each context may have a different closed descendant selection without changing source identity.

Reconstruction is a deterministic function of the closed snapshot and explicit rendering/compiler inputs. Never follow current heads, rerun mutable queries or refresh external citation metadata during historical reconstruction. Exact export requires a bound renderer/compiler profile and citation/style resources. Missing or inaccessible dependencies are explicit failures/incomplete results, not permission to substitute another revision.

Whole-document rendering must produce an ordered source map distinguishing shared node revisions, document-local prose, repeated occurrences and nested inclusion contexts. Caret/selection edits must map to exact intended owners and byte ranges; ambiguous ownership must not silently edit every reuse.

## Algorithms, bounds and validation

Every traversal declares its edge projection, consistent view, authorization scope, ordering, duplicate/cycle behavior and work/output bounds. Reachability costs O(V+E) over the visited projection before index overhead; full rendering additionally costs at least its emitted bytes/occurrences. Repeated expansion can exceed the number of unique records, so budgets must bound expanded output and context growth as well.

Validate unique placement ownership, complete endpoints, same-identity parents, transformation coverage, expansion acyclicity and snapshot closure before publication. Cross-owner mutations recheck every affected expected head and policy atomically. Request/storage exhaustion rejects work without silently pruning history. A recoverable index cannot become historical authority.

The implemented `expansion::validate` is a bounded Kahn validator over caller-supplied vertices and edges; it does not implement the entire model above. Four Lean rank/path theorems check a mathematical acyclicity model, and the actual Rust budget helper has an extracted proof. Full graph-validator correspondence and the additional invariants remain unproved. See the [validation digest](../../proofs/VALIDATION_DIGEST.md).
