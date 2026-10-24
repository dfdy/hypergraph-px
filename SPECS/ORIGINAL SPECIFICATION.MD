Please revise the unified `SPECIFICATION.md` to strengthen and formalise the version-history architecture, particularly how histories are preserved when documents are split, forked, merged, rearranged, or composed from independently versioned content nodes.

**The system must support three complementary forms of unlimited, immutable history:**

1. **Node history:** Every independently identifiable content node (sentence, paragraph, section, etc.) must maintain its own append-only revision history. Extracting content into a separate node must preserve its historical provenance. Restoring an earlier version must create a new revision rather than overwrite history.

2. **Composition history:** Every structural change to a document must be recorded, including extracting, inserting, removing, reordering, forking, and transcluding content nodes, as well as changing inclusion rules or revision pins. A document's structural history must remain independent of revisions to its constituent nodes.

3. **Document snapshot history:** The system must support immutable snapshots recording the exact document manifest revision and the precise revisions of every included content node, including nested transclusions. This must allow any recorded document state to be reconstructed deterministically, even after its constituent nodes have undergone further revisions.

**Additional architectural requirements:**

- Use immutable, preferably content-addressed revision objects and atomic transactions that maintain consistency between content revisions, structural changes, and provenance records.
- Distinguish clearly between live references, which follow subsequent revisions, and pinned references, which point to specific immutable revisions.
- Forking must create a new content identity with an independent revision history while retaining a permanent, bidirectionally navigable relationship to the exact source revision.
- Splitting or extracting content must never destroy or obscure its earlier history or its relationship to the original document.
- Shared transcluded content must maintain a single node history, without unnecessarily duplicating revisions across every document that references it.
- Historical snapshots must remain reproducible regardless of later edits, restructuring, or changes to live references.
- Preserve legitimate graph cycles for hyperlinks, while preventing recursive transclusion or containment from producing infinite expansion.
- No arbitrary limit should be imposed on revision count, subject to available storage and explicitly documented retention policies.
- Ensure histories remain recoverable after crashes, interrupted writes, and index rebuilding.

**Integration requirements:**

Do not simply append these requirements as a new section. Incorporate them into the existing data model, storage architecture, graph relationships, editing operations, document compiler, APIs, MCP capabilities, user interface, security and recovery provisions, and staged implementation plan wherever relevant.

Include acceptance criteria and automated tests covering extraction, splitting, forking, merging, transclusion, historical reconstruction, and recovery. In particular, test that a document can be reconstructed exactly after its original paragraphs have been independently edited, forked, or rearranged.

Maintain `SPECIFICATION.md` as the single authoritative project specification. Resolve contradictions with existing requirements, avoid duplicating definitions, and preserve the specification's overall structure and clarity.

Before implementing code, provide a concise summary of the architectural changes, any unresolved design decisions, and the implementation stages affected.