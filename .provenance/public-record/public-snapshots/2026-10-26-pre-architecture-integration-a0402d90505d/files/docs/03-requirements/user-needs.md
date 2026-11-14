# Stakeholders and User Needs

## Common metadata

- **ID:** `HPX-REQ-001`
- **Title:** Stakeholders and User Needs
- **Purpose:** Owner-stated practical user needs, including future aspirations.
- **Level:** `03-requirements`
- **Status:** `proposed`
- **Maintainer:** project owner; agent-authored migration assembly
- **Applies to:** local-first HPX; published 0.7.0 and explicitly labelled unfinished working-tree/future scope
- **Upstream authority:** [HPX-PRIN-001](<../01-purpose/project-purpose.md>)
- **Downstream dependencies:** [requirements and implementation traces](<../registers/requirements.csv>); application code remains unchanged
- **Verification:** source coverage/hash/link/metadata review in [migration report](<../MIGRATION-REPORT.md>); software evidence is separately scoped
- **Decision/history:** Phase C owner authorization and decisions in [owner record](<../02-governance/OWNER_DECISIONS.md>); source IDs/hashes below
- **Last reviewed:** 2026-10-25

Lists are intended capabilities, not a current implementation inventory. Sharing/federation and integrations retain their deferred status.

Inherited accepted source obligations retain their original scope. `proposed` describes the editorial assembly, not revocation of those obligations. Current owner decisions override preserved contradictory wording; no unimplemented capability becomes delivered through this migration.

## Context and problem

Owner-stated practical user needs, including future aspirations. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Scope and exclusions

Owner-stated practical user needs, including future aspirations. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Normative content



### Practical User Capabilities of Hypergraph PX

Source `HPX-SRC-0001`, original lines 43–46. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

The following are the intended user-facing capabilities of HPX, distinguishing its immediate purpose as a dissertation writing environment from its longer-term development as a federated collaborative platform.

### 1. Writing and Document Organisation

Source `HPX-SRC-0001`, original lines 47–56. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- Write and edit documents using Markdown, with source and rendered views.
- Organise writing into chapters, sections, paragraphs, and smaller selectable passages.
- Rearrange text without losing its relationships, provenance, or revision history.
- Navigate large documents through structural outlines and miniature document overviews.
- Work with mathematical notation, tables, citations, and academic formatting.
- Export conventional documents, including Markdown, PDF, HTML, and Word.
- Assemble different selections and arrangements of interconnected material into coherent documents.

### 2. Hypergraph-Based Thinking and Reasoning

Source `HPX-SRC-0001`, original lines 57–67. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- Link words, passages, concepts, arguments, and entire sections across documents.
- Represent relationships involving multiple ideas simultaneously, rather than only pairs of items.
- Connect premises, conclusions, evidence, objections, assumptions, and interpretations.
- Explore how arguments depend on one another and identify potentially contradictory claims.
- Develop alternative interpretations or lines of reasoning without discarding existing ones.
- Navigate writing through conceptual relationships as well as its linear structure.
- Examine how changing one idea might affect related arguments elsewhere.
- Record unresolved questions and return to earlier stages of reasoning.

### 3. Forking, Transclusion, and Intellectual Development

Source `HPX-SRC-0001`, original lines 68–77. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- **Fork:** Create an independently editable version of selected text while preserving its relationship to the original.
- **Transclude:** Display the same source content in multiple locations without creating independent copies.
- **Provenance paste:** Copy material into a new context as a fork that retains its intellectual ancestry.
- Maintain a special clipboard containing multiple reusable passages or nodes.
- Compare alternative versions of ideas and arguments.
- Merge compatible developments while preserving their distinct histories.
- Trace how a concept, passage, or argument developed through successive revisions.

### 4. Transparent Human–AI Collaboration

Source `HPX-SRC-0001`, original lines 78–90. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

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

### 5. Intellectual History and Cognitive Continuity

Source `HPX-SRC-0001`, original lines 91–100. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- Revisit earlier formulations without losing subsequent developments.
- Recover the reasoning, sources, questions, and objections associated with a passage.
- Create reasoning checkpoints recording the current state of an intellectual problem.
- Identify unresolved arguments, incomplete justifications, and planned investigations.
- Explore the intellectual genealogy of concepts across different chapters and drafts.
- Compare earlier and current understandings.
- Return to interrupted work with its relevant intellectual context preserved.

### 6. Research and Reference Integration

Source `HPX-SRC-0001`, original lines 101–110. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- Connect to Zotero through its local desktop API or cloud Web API.
- Insert and manage academic citations.
- Link bibliographic sources to the arguments and passages they inform.
- Distinguish source claims from interpretations and conclusions.
- Trace the evidence supporting particular arguments.
- Maintain relationships between research notes, references, and dissertation text.
- Support research workflows without requiring a separate document-management system.

### 7. Rights, Attribution, and Accountability

Source `HPX-SRC-0001`, original lines 111–120. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- Associate contributions with named human, agent, or organisational identities.
- Record licences and intellectual-property relationships.
- Distinguish authorship, influence, endorsement, verification, and responsibility.
- Identify unresolved attribution or licensing conflicts.
- Export documents without blocking them because of rights conflicts, appending a report of unresolved issues instead.
- Preserve detailed provenance records while supporting selective disclosure and confidentiality.
- Produce an inspectable archive of the intellectual development of a document.

### 8. Local Ownership, Portability, and Publication

Source `HPX-SRC-0001`, original lines 121–132. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- Run HPX as a standalone application without requiring Docker or a central service.
- Store work locally in an embedded SQLite workspace.
- Open and save native `.hpx` workspace files.
- Create portable `.hpxz` packages and structured `.hpx.json` interchange files.
- Maintain control over local data and backups.
- Create encrypted `.hpxe` backups for GitHub, without overwriting existing backups.
- Export the current document branch as Markdown to GitHub.
- Publish conventional documents independently of HPX.
- Produce read-only provenance archives for accompanying published work.

### 9. Collaborative Writing and Federation

Source `HPX-SRC-0001`, original lines 133–146. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

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

### 10. Reflective and Collective Learning

Source `HPX-SRC-0001`, original lines 147–158. Preserved contract/evidence wording; original dates and implementation claims retain their recorded scope.

- Connect practical experiences and observations to theoretical interpretations.
- Record how reflection leads to revised arguments, decisions, and subsequent actions.
- Compare different interpretations of shared experiences.
- Preserve disagreements as resources for further inquiry.
- Make the historical development of collective knowledge inspectable.
- Support collaborative reflection without replacing individual intellectual judgement.
- Enable communities to develop and transform shared understandings while preserving their members' autonomy.

---


## Examples and counterexamples

Use the source-grounded examples/evidence above and [acceptance gates](<acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Dependencies and consequences

Owner-stated practical user needs, including future aspirations. The retained contract passages, upstream links and requirement register define this boundary; subordinate implementation details must not change its meaning.

## Open questions and conflicts

Retain the scoped limits above and [open questions/conflicts](<../registers/open-questions.csv>). Missing mechanisms remain TBD; no silent resolution or software change is made.

## Acceptance and verification

Use the source-grounded examples/evidence above and [acceptance gates](<acceptance-criteria.md>). Where the source supplies no fixture, platform or quantitative threshold, it remains unspecified; do not fabricate a passing result.

## Source provenance

- `HPX-SRC-0001` — `ABOUT.md`, lines 43–46; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 47–56; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 57–67; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 68–77; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 78–90; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 91–100; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 101–110; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 111–120; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 121–132; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 133–146; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
- `HPX-SRC-0001` — `ABOUT.md`, lines 147–158; SHA-256 `b4d8dcb49719c422ee43fa3a40563bf95d9e0a15018968411ea17ca599c7f000`. Original bytes and paths are recorded in [source manifest](<../registers/source-manifest.csv>); archive is local/ignored.
