Question:
Describe this type of document structure through the mathematics of graphs and trees. The aim is understanding the relationships in order to optimise storage, retrieval, version management, sorting, logical evaluation of links between nodes, and more.

Answer:
# The mathematics of a versioned hypertext document graph

The structure you are proposing for Hypergraph PX is best understood not as a tree, nor even as a single graph, but as a typed, directed, attributed, temporal multigraph with several constrained subgraphs.

This distinction is fundamental to optimising the system.

A conventional document is largely a tree: documents contain sections, sections contain paragraphs, and paragraphs contain sentences. Your system introduces additional relationships: reusable content, hyperlinks, independent forks, revision histories, shared ancestors, citations, and compositions assembled from multiple documents.

These additional relationships turn the overall structure into a graph, but crucially, not every kind of relationship needs to obey the same mathematical rules.

For example, hyperlinks may contain cycles, while revision ancestry should not. A paragraph can be included in multiple documents, but a section cannot structurally contain itself. A fork may share an ancestor with another fork, while their subsequent revision histories remain independent.

This creates opportunities to use specialised data structures and algorithms for different operations.

## 1. The fundamental mathematical model

A conventional directed graph is defined as:

\\[ G=(V,E) \\]

where:

- \\(V\\) is the set of vertices (nodes).
- \\(E\subseteq V\times V\\) is the set of directed edges (relationships).

For Hypergraph PX, we need a richer definition:

\\[ \boxed{G=(V,E,\tau_V,\tau_E,\alpha,\mathcal T)} \\]

Here:

| Symbol           | Meaning                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| \\(V\\)          | Content nodes, documents, revisions, citations, and other identifiable objects |
| \\(E\\)          | Directed relationships between objects                                         |
| \\(\tau_V\\)     | Function identifying each node's type                                          |
| \\(\tau_E\\)     | Function identifying each relationship's type                                  |
| \\(\alpha\\)     | Attributes associated with nodes and edges                                     |
| \\(\mathcal T\\) | Temporal information about revisions, transactions, and recorded states        |

Strictly, this is a typed, attributed directed multigraph: multiple differently typed edges may connect the same two vertices.

For example, document A could both contain paragraph B and link to paragraph B. These are different relationships, even though their endpoints are identical.

There is a second important distinction: a logical content node should not be confused with a particular immutable revision of that node.

Let:

\\[ V_L=\\{\text{logical content identities}\\} \\]

\\[ V_R=\\{\text{immutable revisions}\\} \\]

A logical paragraph might retain identity \\(p\\) throughout its existence, while its successive states are \\(p_1,p_2,p_3,\ldots\\).

Separating these identities allows a document to reference either the paragraph as an evolving object or a specific historical state.

## 2. Four fundamental graph structures

A. Ordered containment tree

Ordered hierarchy of sections, paragraphs, and fragments

B. General reference graph

Hyperlinks, cross-references, and conceptual relationships; cycles permitted

C. Revision DAG

Immutable historical states with branching and merging, without directed cycles

D. Composition DAG

Reusable content included in multiple documents, with acyclic expansion

Conceptual diagrams. Each represents a constrained view over related objects, rather than four unrelated databases.

We can define these graph projections as:

\\[ G_C=(V,E_C) \\]

\\[ G_H=(V,E_H) \\]

\\[ G_R=(V_R,E_R) \\]

\\[ G_I=(V,E_I) \\]

where:

- \\(G_C\\): structural containment.
- \\(G_H\\): hyperlinks and references.
- \\(G_R\\): revision ancestry.
- \\(G_I\\): inclusion and transclusion.

Fork provenance forms an additional DAG, \\(G_F\\).

The complete application graph is the typed union of these relationships. However, each projection has its own invariants and algorithms.

This is the most important architectural principle: enforce constraints on relationship types and their relevant combinations, not indiscriminately on the entire graph.

For example, a hyperlink from a paragraph to its own document is legitimate, but a transclusion that recursively expands itself is not.

## 3. Trees: the efficient representation of document structure

A rooted tree is a directed graph in which every non-root vertex has exactly one parent, and there is a unique path from the root to every vertex.

For a document:

\\[ T_d=(V_d,E_C) \\]

Every paragraph or section has a unique structural parent within that document.

A useful representation is:

```
Document D
├── Section A
│   ├── Paragraph P1
│   └── Paragraph P2
├── Section B
│   ├── Paragraph P3
│   └── Paragraph P4
└── Section C
    └── Paragraph P5
```

This gives a hierarchy that is easy to traverse, render, reorder, and index.

### The problem of shared content

Suppose P2 also appears in Document E.

If both documents have direct containment edges to the same P2 vertex, the structure is no longer a tree, because P2 has more than one parent.

It might still be a directed acyclic graph, but tree algorithms that assume a unique parent would no longer be valid.

I recommend solving this with composition occurrences.

An occurrence is a separate identity representing a particular placement of a content node in a document.

For example:

```
Document D                   Document E
    │                            │
Occurrence O1              Occurrence O2
    │                            │
    └──────────┬─────────────────┘
               │
         Content P2
```

The document trees contain occurrence nodes. Each occurrence points to the logical content it displays.

Mathematically, let \\(O\\) be the set of occurrences, and let:

\\[ c:O\rightarrow V_L \\]

map each occurrence to its content identity.

Two occurrences can point to the same paragraph:

\\[ c(o_1)=c(o_2)=p_2 \\]

without violating the tree structure of either document.

This has several advantages:

- A paragraph can appear in many documents without duplicating its text.
- Each placement can have its own order, heading context, visibility, and revision pin.
- Reordering one document does not rearrange another.
- The content node retains a single revision history.
- The application can efficiently answer both "where does this occur?" and "what does this document contain?"

It also makes the meaning of document-level edits precise: moving an occurrence is different from editing the content referenced by that occurrence.

### Ordering within trees

Document children must be ordered, unlike vertices in an ordinary mathematical graph.

If a section has children:

\\[ (p_1,p_2,p_3,p_4) \\]

their order is part of the document state.

An implementation should avoid renumbering every sibling when a new paragraph is inserted between \\(p_2\\) and \\(p_3\\).

Possible strategies include fractional ordering keys, order-maintenance data structures, and sequence CRDTs for concurrent editing.

For the initial single-user system, sortable fractional keys with occasional rebalancing would be a reasonable choice.

For collaboration, a sequence CRDT may eventually provide better semantics, although it introduces additional complexity.

## 4. Directed acyclic graphs: versioning, forks, and provenance

A directed acyclic graph (DAG) is a directed graph without directed cycles.

Its usefulness here is that it supports branching, merging, and shared ancestry without making historical causality ambiguous.

Define the revision ancestry graph as:

\\[ G_R=(V_R,E_R) \\]

where an edge \\(r_i\rightarrow r_j\\) means that revision \\(r_j\\) was derived from revision \\(r_i\\).

For a simple linear history:

\\[ r_1\rightarrow r_2\rightarrow r_3 \\]

For a fork:

The fork inherits a specific historical state, but subsequent versions belong to a separate logical identity.

In the diagram, \\(r_3\\) is the source revision of a new content identity whose first revision is \\(b_1\\).

I recommend distinguishing two edge types even here:

- `revision_parent`: links revisions of the same logical identity.
- `derived_from`: links the first revision of a fork to a revision of another identity.

This distinction is useful when answering different questions.

"What is the history of this paragraph?" should normally follow `revision_parent`.

"What ideas or fragments was this paragraph derived from?" should additionally follow `derived_from`.

A merge may have several predecessor revisions. The DAG allows this, provided the merge represents a new immutable state and does not retroactively alter its parents.

### Ancestry and the partial-order relation

Define:

\\[ r_i\preceq r_j \\]

if \\(r_i=r_j\\), or if there is a directed ancestry path from \\(r_i\\) to \\(r_j\\).

Because the history is acyclic, this forms a partial order.

Not all revisions are comparable. Two revisions on separate branches may have a common ancestor but neither is a descendant of the other.

That matters for merging. It allows the application to calculate a common ancestor and distinguish shared edits from branch-specific changes.

The complexity of finding ancestors depends on the graph size and indexing strategy. In an ordinary adjacency-list representation, traversal is \\(O(|V|+|E|)\\) in the relevant history subgraph. Memoisation, cached ancestry summaries, and revision generations can accelerate common queries.

### Forks versus splits

These should not be treated as the same operation.

Forking creates a new identity derived from some existing content.

Splitting changes the structural boundaries of content. For example, paragraph P becomes paragraphs P1 and P2.

A split should create an explicit transformation record:

\\[ S:(P,r_k)\mapsto\\{(P_1,r_1),(P_2,r_1)\\} \\]

The relationship between the output nodes and their source is then recoverable.

Unlike a simple fork, a split has multiple outputs. A merge of two paragraphs into one may have multiple inputs.

This is where the model benefits from something more expressive than a simple pairwise edge.

## 5. Hypergraphs: representing transformations involving several nodes

The word hypergraph has a specific mathematical meaning.

A conventional edge connects two vertices. A hyperedge can connect an arbitrary number of vertices.

For the project, this is particularly relevant to:

- Splitting one paragraph into several.
- Merging several fragments into one.
- Combining sections into a new document.
- Recording a transformation that draws from multiple historical sources.

For example:

\\[ \\{P_1,P_2,P_3\\}\rightarrow Q \\]

This means Q was derived from the combined material of P1, P2, and P3.

The appropriate formalism is a directed hypergraph, or more concretely, a provenance graph using transformation vertices.

A transformation vertex can record multiple inputs, multiple outputs, operation parameters, author, time, and provenance.

Instead of implementing hyperedges directly, Hypergraph PX could represent each transformation as an ordinary vertex.

The model becomes a bipartite graph containing content revisions and transformation events.

For example:

\\[ P_1\rightarrow T_1 \\]

\\[ P_2\rightarrow T_1 \\]

\\[ T_1\rightarrow Q \\]

This is sometimes called an incidence graph representation.

It has practical advantages because SQLite and standard Rust graph libraries work naturally with binary relationships.

Crucially, the transformation should reference exact immutable input and output revisions, not mutable `latest` pointers.

That makes the history reproducible and allows the application to track which portions of an argument were reused, combined, or substantially rewritten.

The model does not prove that Q logically follows from its inputs. It records derivation. Logical entailment requires a separate semantic system.

## 6. Temporal graphs: how documents change over time

Your application also needs to represent relationships that exist at different moments.

For example, Document A may contain P1 and P2 today but only P1 tomorrow.

It would be incorrect to delete the historical relationship between Document A and P2.

The general mathematical idea is a temporal graph:

\\[ G(t)=(V(t),E(t)) \\]

where vertices and relationships are interpreted relative to some historical state.

However, I recommend avoiding a design in which the application reconstructs history primarily by filtering timestamps.

Instead, use immutable states and explicit transaction ancestry.

A document state can be represented as:

\\[ D_k=(M_k,R_k) \\]

where:

- \\(M_k\\) is an immutable document composition manifest.
- \\(R_k\\) maps every reachable content occurrence to an exact revision.

For example:

```
Document A / Snapshot 17
├── Manifest revision: M8
├── Occurrence O1 → Paragraph P1 @ revision 4
├── Occurrence O2 → Paragraph P2 @ revision 12
└── Occurrence O3 → Section S3 @ revision 6
    ├── Paragraph P4 @ revision 2
    └── Paragraph P5 @ revision 8
```

Even if P2 later advances to revision 900, Snapshot 17 still identifies revision 12.

The snapshot should be a closed representation: all nested inclusions must ultimately resolve to fixed revisions.

This gives a mathematical reconstruction function:

\\[ \operatorname{Render}(D_k)=\text{historically fixed output} \\]

Assuming the same renderer version and external formatting dependencies, repeated evaluation yields the same result.

For exact byte-for-byte historical exports, the application must additionally preserve or identify the Markdown renderer, citation styles, compiler settings, and any other resources affecting output.

### Why timestamps alone are insufficient

Timestamps do not necessarily express transaction causality. Two operations may share a timestamp, transactions may have different durations, and concurrency introduces additional ordering problems.

A transaction sequence number or immutable commit identifier is a more reliable basis for snapshots.

Wall-clock time remains useful for searching and displaying history, but should not be the sole source of reconstruction truth.

## 7. Merkle DAGs and content-addressed storage

One of the strongest mathematical techniques for optimising immutable revision storage is the Merkle directed acyclic graph.

In a Merkle DAG, an object's identifier is derived from its contents, typically using a cryptographic hash.

For a revision object:

\\[ h(r)=H(\operatorname{canonical}(r)) \\]

Here \\(H\\) is a cryptographic hash function and `canonical` is a deterministic encoding.

Identical encoded objects produce identical hashes, so the storage system can deduplicate them.

A revision could reference its immutable parent hashes, making ancestry cryptographically identifiable.

This approach is well established in systems such as Git and IPFS.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.ipfs.tech\&sz=32)

IPFS Docs



It has direct advantages for Hypergraph PX:

- Historical objects do not need to be overwritten.
- Exact duplicate content objects can be deduplicated.
- Corrupted objects can be detected by checking hashes.
- Unchanged substructures can be shared among snapshots.
- Backups and future synchronisation can transfer only missing objects.
- A snapshot can identify an entire immutable composition through its root hash.

But there is a critical qualification.

The entire Hypergraph PX relationship graph should not itself be a Merkle DAG.

Why? Because ordinary hyperlinks may form cycles, while cryptographic hashes that recursively include one another do not admit such cycles in the usual Merkle construction.

Instead, content-address the immutable revision and snapshot graph. Store hyperlinks as references to stable logical identities or fixed revision identifiers.

This separates the immutable, acyclic storage model from the general, cyclic semantic graph.

### Storage optimisation through structural sharing

Suppose a document has 100 paragraphs and you edit only one.

A naive snapshot implementation might duplicate the content of all 100 paragraphs.

A persistent data structure instead creates new objects only for changed portions of the structure, retaining references to unchanged objects.

For a balanced persistent tree, changing a leaf typically requires copying only the path from that leaf to the root, which is \\(O(\log n)\\) nodes in a balanced tree.

By contrast, a flat serialised manifest may require \\(O(n)\\) work to rewrite.

This provides a reason to consider a persistent sequence tree or Merkle-tree-backed composition manifest if profiling eventually shows that manifest rewriting is expensive.

I would not introduce this complexity prematurely. At modest document sizes, flat manifests plus immutable fragment revisions may be simpler and sufficiently efficient.

## 8. Graph algorithms for storage, retrieval, and logical evaluation

Once the graph relationships are explicitly typed, different mathematical algorithms become available.

The following are particularly useful for Hypergraph PX.

| Problem                   | Algorithm or structure               | Purpose                                                            |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| Document rendering        | Depth-first traversal                | Visit content in document order                                    |
| Contents generation       | Ordered tree traversal               | Construct hierarchical tables of contents                          |
| Backlink lookup           | Reverse adjacency index              | Identify nodes linking to a target                                 |
| Cycle detection           | DFS or strongly connected components | Detect dangerous recursive inclusions                              |
| Revision comparison       | DAG ancestry traversal               | Establish historical relationships                                 |
| Merge preparation         | Common-ancestor search               | Find a shared historical baseline                                  |
| Dependency compilation    | Topological sorting                  | Process dependencies before their consumers                        |
| Related-content discovery | Breadth-first traversal              | Explore nearby relationships                                       |
| Change impact             | Reverse reachability                 | Find documents affected by changed content                         |
| Redundancy reduction      | Transitive reduction                 | Remove redundant derived reachability edges where semantics permit |
| Historical retrieval      | Persistent structures, hash lookup   | Reconstruct immutable document states                              |

The Rust library [petgraph](https://docs.rs/petgraph/latest/petgraph/?utm_source=chatgpt.com) already implements many of these algorithms, including strongly connected components, topological sorting, reachability, and transitive reduction.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.rs\&sz=32)

Rust

+1



### Strongly connected components

Consider three sections with transclusions:

\\[ A\rightarrow B,\quad B\rightarrow C,\quad C\rightarrow A \\]

These form a directed cycle.

A strongly connected component is a maximal set of vertices in which every vertex can reach every other vertex.

Finding strongly connected components identifies recursive groups in a graph.

Tarjan's and Kosaraju's algorithms can compute these components in:

\\[ O(|V|+|E|) \\]

time.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://docs.rs\&sz=32)

Rust



For Hypergraph PX, this is useful for validating imported documents, reporting problematic inclusion chains, and analysing cyclic hyperlink communities.

However, there is an important distinction between detecting cycles and deciding whether they are invalid.

A hyperlink cycle is acceptable. A recursive transclusion cycle is generally not.

Consequently, cycle detection must be performed on the expansion dependency projection, not across every edge type.

### Incremental cycle detection

It would be wasteful to scan the entire graph every time a user adds one transclusion.

Suppose the user wants to add:

\\[ A\rightarrow B \\]

The application only needs to ask:

\\[ B\leadsto A\\;? \\]

That is, can B already reach A through the expansion dependency graph?

If yes, the new edge would create a cycle.

If no, the edge is safe with respect to cycles.

This is a straightforward reachability query, although its worst-case cost is still linear in the graph traversed.

A related safeguard is to reject expansions exceeding configured depth, node-count, or byte limits, even when no cycle exists.

## 9. Logical evaluation: what can the graph tell us?

Beyond storage and versioning, the graph can support a small formal query and reasoning system.

This is where it becomes particularly interesting as a tool for scholarly work.

### Graph predicates

Represent relationships as predicates:

\\[ \operatorname{Contains}(A,B) \\]

\\[ \operatorname{LinksTo}(A,B) \\]

\\[ \operatorname{DerivedFrom}(A,B) \\]

\\[ \operatorname{Cites}(A,Z) \\]

where \\(Z\\) is a Zotero bibliographic item.

We can then define higher-order relations.

For example, a document indirectly contains a paragraph if there is a containment path from the document to the paragraph:

\\[ \operatorname{Descendant}(x,y) \iff \operatorname{Contains}^{+}(x,y) \\]

Here \\(+\\) denotes transitive closure: one or more containment steps.

We could also define:

\\[ \operatorname{RelatedByAncestry}(a,b) \iff \exists c: \operatorname{Ancestor}(c,a) \land \operatorname{Ancestor}(c,b) \\]

This identifies two content revisions with shared ancestry.

But shared provenance does not imply semantic equivalence. Two paragraphs derived from the same source could contain contradictory arguments.

That distinction should be central to the logical model.

### A useful hierarchy of reasoning

I would distinguish three levels:

| Level      | Example                                         | Reliability                                                          |
| ---------- | ----------------------------------------------- | -------------------------------------------------------------------- |
| Structural | "This paragraph occurs in three documents"      | Exact, from graph records                                            |
| Historical | "These passages descend from the same revision" | Exact, from provenance                                               |
| Semantic   | "These passages express contradictory claims"   | Requires additional interpretation or explicitly modelled assertions |

Semantic relations could be introduced as user-asserted or computationally suggested edge types:

- `supports`
- `contradicts`
- `elaborates`
- `qualifies`
- `responds_to`
- `equivalent_to`

Such relationships should carry provenance and confidence or verification status.

For example, a human-confirmed `contradicts` edge should be distinguishable from one suggested by an AI model.

This would allow Hypergraph PX eventually to support something approaching an argumentation graph as well as a document graph.

### Querying the graph

A recursive SQL query could retrieve all descendants of a given document or all revision ancestors of a paragraph.

SQLite supports recursive common table expressions for tree and graph traversal.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://sqlite.org\&sz=32)

SQLite



A query engine could expose operations such as:

```
FIND paragraphs
WHERE derived_from("paragraph-123")
AND cites("zotero-item-456")
ORDER BY first_created
```

Or:

```
FIND documents
WHERE contains_descendant("section-789")
AND snapshot_date < "2026-10-01"
```

These examples represent a prospective Hypergraph PX query language, not existing SQL syntax.

For the initial implementation, parameterised SQL and well-defined Rust query operations would be preferable to inventing a full query language.

## 10. Indexing and retrieval performance

A graph is a mathematical model, not a mandate to use a specialised graph database.

Given the initial requirements—single executable, embedded storage, local operation, and a browser interface—I would favour SQLite plus immutable object storage.

The logical graph could be represented through ordinary relational tables:

```
content_nodes
    id
    kind
    created_transaction

revisions
    revision_id
    node_id
    content_hash
    created_transaction

revision_parents
    child_revision_id
    parent_revision_id

occurrences
    occurrence_id
    content_node_id
    revision_policy

composition_edges
    manifest_revision_id
    parent_occurrence_id
    child_occurrence_id
    order_key

relationships
    source_id
    target_id
    relationship_type
    metadata

transformations
    transformation_id
    operation_type
    transaction_id

transformation_inputs
    transformation_id
    revision_id

transformation_outputs
    transformation_id
    revision_id

snapshots
    snapshot_id
    manifest_revision_id
    resolved_root_hash
```

This is a conceptual schema; a production design would additionally require constraints, scoped IDs, authorisation metadata, referential integrity, and immutable manifests.

A particularly important rule is that mutable working composition edges must not overwrite historical composition edges. Historical edges belong to immutable manifest revisions or immutable ordered occurrence trees.

### Recommended index structures

B-tree indexes

For exact node lookup, revision lookup, transaction ordering, and composition order. Typically logarithmic lookup complexity.

Bidirectional adjacency indexes

Index both `(source, type, target)` and `(target, type, source)`, allowing efficient forward-link and backlink queries without duplicating canonical relationships.

Full-text inverted indexes

Use SQLite FTS5 to locate paragraphs containing words or phrases without scanning every historical object.

Content-addressed object lookup

Map revision hashes directly to immutable objects. Deduplicate identical content and support snapshot reconstruction.

It would be wasteful to fully index every historical revision for every query.

I recommend separating the index into:

1. A primary index of current graph state.
2. Indexes of immutable history metadata, including ancestry and provenance.
3. Optional full-text indexes of historical content, created or populated according to search requirements.

The system must always be able to rebuild indexes from canonical stored information. Indexes must never be the sole record of historical relationships.

## 11. Optimising sorting and document compilation

Sorting in Hypergraph PX is not one problem but several.

Document order is explicit and must preserve authorial intent.

Historical order follows revision ancestry and transaction ordering.

Dependency order is determined by topological sorting.

Query-result order may depend on titles, timestamps, citation metadata, search relevance, or manually defined priorities.

These must not be conflated.

For example, a topological sort of the transclusion DAG yields an order suitable for dependency evaluation, but it does not necessarily yield a useful reading order for a document.

A document compiler should therefore combine two processes:

\\[ \operatorname{Compile}(D) = \operatorname{RenderOrdered} \bigl( \operatorname{ResolveDependencies}(D) \bigr) \\]

First resolve and validate all required dependencies, then render them according to the document's ordered composition.

The distinction also enables incremental compilation.

Suppose paragraph P changes. Using reverse inclusion indexes, the system can find every composition depending on P.

It then invalidates only affected cached outputs rather than rebuilding every document.

For live references, the dependency is dynamic. For pinned references, changing the latest version of P should not invalidate a document pinned to an older revision.

That produces a potentially substantial performance improvement as the repository grows.

## 12. An important distinction: occurrence graphs and identity graphs

I consider this the central design decision to formalise before implementation.

Hypergraph PX should distinguish at least five object identities.

| Object               | Identity persists across                                           | New identity created by                        |
| -------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| Logical content node | Edits and revisions                                                | Forking or extraction into a new reusable node |
| Content revision     | Nothing; immutable                                                 | Any committed content change                   |
| Occurrence           | Changes in placement metadata within the same evolving composition | A new placement of content                     |
| Manifest revision    | Nothing; immutable                                                 | Structural changes to a document               |
| Snapshot             | Nothing; immutable                                                 | Recording a closed historical document state   |

A sixth identity, the transformation event, should record multi-input and multi-output derivations.

This architecture prevents a common source of ambiguity.

A sentence being displayed in two places does not necessarily mean two copies of that sentence exist. Similarly, a sentence occurring twice in one document does not necessarily imply two logical content identities.

The application can therefore maintain a reliable distinction between what the content is, where it occurs, what historical state is being displayed, and how it came to exist.

## 13. Recommended formal architecture

I would express Hypergraph PX as a collection of related graph projections over an authoritative event and object store:

\\[ \boxed{ \mathcal H= (T_C,G_H,G_I,G_R,G_F,G_P,\Sigma) } \\]

where:

| Structure    | Mathematical form                    | Main responsibility                              |
| ------------ | ------------------------------------ | ------------------------------------------------ |
| \\(T_C\\)    | Ordered rooted forest of occurrences | Document structure                               |
| \\(G_H\\)    | General directed multigraph          | Hyperlinks, citations, semantic relationships    |
| \\(G_I\\)    | Acyclic expansion dependency graph   | Transclusion and composition                     |
| \\(G_R\\)    | DAG                                  | Revision ancestry                                |
| \\(G_F\\)    | DAG                                  | Fork and derivation lineage                      |
| \\(G_P\\)    | Bipartite provenance graph           | Splits, merges, and multi-source transformations |
| \\(\Sigma\\) | Immutable snapshot set               | Historical reconstruction                        |

The subgraphs share identities, but different edge types obey different constraints.

A final simplification is possible: the persistent graph data does not have to be stored as separate graph structures. It can be stored canonically as immutable objects, transformation records, and relationships, with derived indexes implementing these different mathematical views.

### Architectural priorities

I would adopt the following ordering:

First

Formalise identities, typed edges, occurrence trees, and immutable revision semantics.

Second

Implement append-only history, provenance, graph validation, and deterministic snapshots.

Third

Add indexes and efficient traversal for current-state editing and historical reconstruction.

Fourth

Optimise compilation through dependency tracking, caching, and selective invalidation.

Fifth

Introduce more advanced graph queries, semantic relationships, and collaborative concurrency when justified.

## Final observation: the graph is more than a storage mechanism

The most consequential property of this architecture is that a document becomes a historically situated composition of identifiable and reusable intellectual material.

A tree represents how material is organised for reading. A provenance graph represents how it came into existence. A revision DAG represents how it changed. A reference graph represents what it connects to. A snapshot represents a particular reproducible state.

These are mathematically different descriptions of related material.

Keeping them distinguishable makes the system more efficient, but it also makes it far more analytically powerful: it becomes possible to investigate the development of ideas, compare divergent arguments, trace transformations, and reconstruct how documents were assembled.

For Hypergraph PX, I would make the typed graph model, ordered occurrence trees, immutable Merkle-style history, and explicit transformation provenance the foundational architecture. Everything else—the Markdown editor, browser interface, Zotero integration, MCP interface, and index builder—would operate over those same well-defined structures.