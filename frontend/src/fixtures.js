/**
 * # Hypergraph PX — Synthetic workspace demonstration content
 *
 * Provide original artificial contributors and chapters for browser-only
 * exploration of selection, rendering and navigation.
 *
 * Source: [Latest source on GitHub][source]
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex (OpenAI coding agent), /root/frontend_comments.
 * Latest editing harness: Codex; version/build: unknown.
 * Latest editing model: OpenAI; exact model identifier/revision: unknown.
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: The synthetic document adapter, application shell and preview-only
 * contributor demonstrations.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: No manuscript, real identity, provider connection or durable workspace
 * data is included. Fixture text is not an adopted product requirement.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/fixtures.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

/** List synthetic contributors with explicit disconnected/demo labels for preview panels. */
export const contributors = [
 {id:'demo:human',name:'Local Writer',role:'Current human · synthetic',color:'#e57474',pinned:true},
 {id:'demo:agent',name:'Research Assistant',role:'Current agent · synthetic, not connected',color:'#74a9f0',pinned:true},
 {id:'demo:reviewer',name:'Avery Example',role:'Earlier reviewer · synthetic',color:'#71c9a0'}
];

const titles=['Introduction','Conceptual foundations','Methodology','Observations','Discussion','Conclusion'];

/** Build independent synthetic chapters with enough source for navigation and editing demonstrations. */
export const documents=titles.map(/* Build one synthetic chapter with a tab-local identity and illustrative Markdown source. */ (title,i)=>({id:`demo:chapter:${i+1}`,title,source:`# ${i+1}. ${title}\n\n${i===0?'Welcome to the Hypergraph research workspace. This is an entirely synthetic document for exploring the interface. Type freely: changes stay in this browser tab.':'This independent synthetic chapter explores how ideas, evidence and interpretations can be assembled without losing their origins.'}\n\n## ${i===0?'A workspace for connected writing':'Research questions'}\n\nA document can be read as a composition of smaller contributions. A collection organizes documents, while a composite work gives them a reading order. These relationships have different meanings.\n\nEditing should preserve the distinction between a passage, its identity and the place where it appears. Shared wording does not establish shared authorship.\n\n## Working with evidence\n\nThe example below is editable. Double-click a table cell or focus it and press Enter. Changes update Markdown source and can be undone.\n\n| Material | Interpretation | Status |\n| --- | --- | --- |\n| Field note | A possible connection | Proposed |\n| Interview | A contrasting account | In review |\n\n### A small mathematical example\n\nThe relation \\(a^2 + b^2 = c^2\\) is shown as source until you choose Rendered. Rendering is a visual aid, not a proof.\n\n\\[\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n\\]\n\n## Reuse without losing context\n\nSelect a passage and copy it to the demonstration provenance clipboard. A simulated fork paste inserts independent text from the captured version. It does not publish graph records.\n\n1. Capture a meaningful passage.\n2. Choose a destination in this or another chapter.\n3. Inspect the result and its original source label.\n\n## Questions for further investigation\n\nWhat counts as evidence for an interpretation? How can a claim retain its context as a document evolves? There may be several legitimate answers.\n\n### Concepts and formulations\n\nA concept can have several names and competing definitions. An agent suggestion is a proposal until a human reviews it. Follow a concept occurrence to inspect its context.\n\n## Research notes\n\n${Array.from({length:8},/* Generate one clearly synthetic research note to exercise long-document scrolling and minimap behaviour. */ (_,n)=>`### Note ${n+1}\n\nThis synthetic research note provides room to test scrolling, selection and the document minimap. Connections between observations should be recorded with evidence and explicit interpretation. Unicode examples: café, αβ, and 🧭.\n`).join('\n')}\n## Closing reflection\n\nKeep sources, claims and interpretations distinguishable. A useful workspace helps a writer navigate these differences while continuing to write.\n` }));
