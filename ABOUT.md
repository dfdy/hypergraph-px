# The Purpose of Hypergraph PX

Hypergraph PX (HPX) is a writing and thinking environment conceived to support the development of my doctoral dissertation, with the longer-term ambition of becoming a **federated, collaborative writing and thinking tool**. Its purpose is to extend the ways in which ideas can be developed, organised, examined, and transformed, while enabling transparent and ethically accountable collaboration between humans and artificial intelligence.

## The Dissertation’s Central Need

My doctoral dissertation requires me to develop and communicate a complex body of philosophical reasoning in which concepts, arguments, evidence, and interpretations are interconnected, continually evolving, and not necessarily reducible to a linear hierarchy. Although the completed dissertation must take the form of a coherent, sequential document, the thinking through which it develops is relational, recursive, and dialectical.

The central need is therefore to **bridge the difference between the structure of thought and the structure of its written presentation**, without sacrificing either the complexity of the reasoning or the clarity of the final text.

Writing is already a means of developing, questioning, and transforming thought. HPX seeks to extend this capacity through a **hypergraph architecture**, which allows multiple ideas, arguments, sources, and interpretations to be connected within relationships that can themselves be examined and revised. Unlike conventional document structures, HPX allows ideas to be organised independently of their location in a chapter or section, while remaining available for assembly into coherent, linear writing. Their relationships, alternative developments, and intellectual histories can be preserved even as the document changes.

## Transparent Human–AI Collaboration

A second foundational purpose is to enable transparent and ethically accountable collaboration with artificial intelligence. HPX maintains a provenance graph: a structured record of human and AI contributions, including questions, suggestions, objections, revisions, and the ways these interactions influence the development of ideas.

Rather than concealing AI involvement within a finished text, HPX seeks to preserve the observable history of collaboration, making it possible to distinguish between authorship, influence, adoption, and responsibility. This allows AI to contribute meaningfully to intellectual work without obscuring the human researcher's agency or the processes through which knowledge is produced.

## Writing, Reflection, and Transformative Practice

These capabilities connect to the reciprocal relationship between the *praxis of practice* and the *practice of praxis*. These terms describe two interconnected movements: how our understanding develops through practical engagement with the world, and how deliberate reflection on our actions, assumptions, and experiences can transform what we do next.

HPX supports this relationship by making the development of thought more accessible to reflection. Ideas can be revisited alongside the arguments, experiences, disagreements, and decisions that shaped them. The process of reasoning becomes something that can itself be investigated and transformed, supporting a continuing movement between experience, reflection, understanding, and action.

## From Individual Inquiry to Federated Collaboration

Although HPX begins as a tool for individual doctoral research, its ultimate form is intended to be a **federated collaborative writing environment**, in which individuals and groups can develop shared intellectual work while retaining autonomy over their own contributions, documents, and systems.

Federation means that collaboration need not depend on a single central server or authority. Independently operated HPX instances could exchange selected contributions, establish relationships between documents, and support shared writing, forking, and revision without requiring participants to surrender control over their own work.

This ambition connects HPX to *emancipatory commoning*: the collective process through which people develop their abilities to understand and shape the conditions of their lives, while creating, sharing, and governing knowledge, resources, and institutions together.

By enabling people to collaborate without erasing differences, preserve the origins and development of their contributions, and collectively question and transform their understandings, HPX seeks to support intellectual cooperation grounded in transparency, autonomy, and shared agency.

## The Broader Purpose

HPX is not intended to replace human thought or prescribe how people should reason. It is intended to extend the capacities already present in writing by making intellectual relationships and their histories more accessible, navigable, and open to transformation.

**Ultimately, Hypergraph PX seeks to bridge the relational complexity of thought and the linear demands of writing, preserve an accountable history of human–AI intellectual collaboration, and develop into a federated environment for collective inquiry in which people can think, write, learn, and transform their understandings together without surrendering their intellectual autonomy.**

---

# Practical User Capabilities of Hypergraph PX

The following are the intended user-facing capabilities of HPX, distinguishing its immediate purpose as a dissertation writing environment from its longer-term development as a federated collaborative platform.

## 1. Writing and Document Organisation

- Write and edit documents using Markdown, with source and rendered views.
- Organise writing into chapters, sections, paragraphs, and smaller selectable passages.
- Rearrange text without losing its relationships, provenance, or revision history.
- Navigate large documents through structural outlines and miniature document overviews.
- Work with mathematical notation, tables, citations, and academic formatting.
- Export conventional documents, including Markdown, PDF, HTML, and Word.
- Assemble different selections and arrangements of interconnected material into coherent documents.

## 2. Hypergraph-Based Thinking and Reasoning

- Link words, passages, concepts, arguments, and entire sections across documents.
- Represent relationships involving multiple ideas simultaneously, rather than only pairs of items.
- Connect premises, conclusions, evidence, objections, assumptions, and interpretations.
- Explore how arguments depend on one another and identify potentially contradictory claims.
- Develop alternative interpretations or lines of reasoning without discarding existing ones.
- Navigate writing through conceptual relationships as well as its linear structure.
- Examine how changing one idea might affect related arguments elsewhere.
- Record unresolved questions and return to earlier stages of reasoning.

## 3. Forking, Transclusion, and Intellectual Development

- **Fork:** Create an independently editable version of selected text while preserving its relationship to the original.
- **Transclude:** Display the same source content in multiple locations without creating independent copies.
- **Provenance paste:** Copy material into a new context as a fork that retains its intellectual ancestry.
- Maintain a special clipboard containing multiple reusable passages or nodes.
- Compare alternative versions of ideas and arguments.
- Merge compatible developments while preserving their distinct histories.
- Trace how a concept, passage, or argument developed through successive revisions.

## 4. Transparent Human–AI Collaboration

- Connect AI agents through MCP-compatible interfaces.
- Converse with agents alongside the document being written.
- Allow agents to read, analyse, question, and propose changes to selected material, subject to permissions.
- Visually distinguish human and agent contributions.
- Inspect the authorship and provenance of individual passages.
- Preserve prompts, responses, supplied context, tool interactions, and proposed edits where observable.
- Distinguish AI-generated wording from AI influence on human-written arguments.
- Accept, modify, reject, or fork agent suggestions.
- Trace how interactions with agents influenced the development of particular ideas.
- Generate reports documenting AI involvement for academic accountability.

## 5. Intellectual History and Cognitive Continuity

- Revisit earlier formulations without losing subsequent developments.
- Recover the reasoning, sources, questions, and objections associated with a passage.
- Create reasoning checkpoints recording the current state of an intellectual problem.
- Identify unresolved arguments, incomplete justifications, and planned investigations.
- Explore the intellectual genealogy of concepts across different chapters and drafts.
- Compare earlier and current understandings.
- Return to interrupted work with its relevant intellectual context preserved.

## 6. Research and Reference Integration

- Connect to Zotero through its local desktop API or cloud Web API.
- Insert and manage academic citations.
- Link bibliographic sources to the arguments and passages they inform.
- Distinguish source claims from interpretations and conclusions.
- Trace the evidence supporting particular arguments.
- Maintain relationships between research notes, references, and dissertation text.
- Support research workflows without requiring a separate document-management system.

## 7. Rights, Attribution, and Accountability

- Associate contributions with named human, agent, or organisational identities.
- Record licences and intellectual-property relationships.
- Distinguish authorship, influence, endorsement, verification, and responsibility.
- Identify unresolved attribution or licensing conflicts.
- Export documents without blocking them because of rights conflicts, appending a report of unresolved issues instead.
- Preserve detailed provenance records while supporting selective disclosure and confidentiality.
- Produce an inspectable archive of the intellectual development of a document.

## 8. Local Ownership, Portability, and Publication

- Run HPX as a standalone application without requiring Docker or a central service.
- Store work locally in an embedded SQLite workspace.
- Open and save native `.hpx` workspace files.
- Create portable `.hpxz` packages and structured `.hpx.json` interchange files.
- Maintain control over local data and backups.
- Create encrypted `.hpxe` backups for GitHub, without overwriting existing backups.
- Export the current document branch as Markdown to GitHub.
- Publish conventional documents independently of HPX.
- Produce read-only provenance archives for accompanying published work.

## 9. Collaborative Writing and Federation

*Long-term capabilities*

- Collaborate with multiple human authors and AI agents in shared documents.
- Attribute individual contributions while preserving their relationships and histories.
- Support simultaneous editing and asynchronous collaboration.
- Fork and merge documents or arguments across independently maintained workspaces.
- Exchange selected nodes, documents, and relationships between HPX instances.
- Maintain independently governed workspaces without dependence on a central server.
- Establish permissions and sharing agreements between collaborators.
- Preserve different interpretations and competing arguments without forcing consensus.
- Support collective inquiry across autonomous groups and organisations.

## 10. Reflective and Collective Learning

- Connect practical experiences and observations to theoretical interpretations.
- Record how reflection leads to revised arguments, decisions, and subsequent actions.
- Compare different interpretations of shared experiences.
- Preserve disagreements as resources for further inquiry.
- Make the historical development of collective knowledge inspectable.
- Support collaborative reflection without replacing individual intellectual judgement.
- Enable communities to develop and transform shared understandings while preserving their members' autonomy.

---

# The Central User Experience

The practical objective is that a person can **write naturally while progressively building an interconnected, inspectable history of their thinking**.

A user should be able to select a sentence, paragraph, argument, or section and ask:

- What other ideas does this relate to?
- What evidence supports or challenges it?
- How did this argument develop?
- What alternative versions exist?
- Which human or AI contributions influenced it?
- What happens to other arguments if I change it?
- How can I reuse or develop it elsewhere without losing its origins?

HPX should make these questions answerable without requiring the user to abandon the writing process or manually construct a complex graph.

**Its defining practical capability is to allow people to write in a conventional, readable form while working with the richer relational, historical, and collaborative structure of the thinking that produces that writing.**