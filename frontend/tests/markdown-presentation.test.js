/**
 * # Hypergraph PX — Markdown presentation regression scenarios
 *
 * Checks browser markdown presentation behaviour with isolated synthetic inputs
 * and explicit assertions.
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
 * Used by: Frontend development validation — Node unit-test runner and regression
 * suite.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: These isolated tests establish their stated scenarios, not integrated
 * product delivery or formal proof. Fixture bytes and all assertions are
 * preserved.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/markdown-presentation.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {documentPresentation} from '../src/document-presentation.js';
import {inlinePresentation,setMarkdownSource} from '../src/inline-presentation.js';

test('presentation parses nested styles and exact link ranges while preserving literal code and math',/* Verify presentation ranges render nested emphasis and links without changing source or interpreting code/math as emphasis. */ ()=>{
 const text='**bold *nested*** [a \\[label\\] 😀](#heading) `**literal**` \\(a*b*c\\)';

 const state=EditorState.create({doc:text,extensions:[inlinePresentation]});

 const model=documentPresentation(state);


 assert.ok(model.inline.some(/* Detect the expected bold presentation span. */ item=>item.className==='cm-markdown-bold'));assert.ok(model.inline.some(/* Detect the expected nested italic span. */ item=>item.className==='cm-markdown-italic'));assert.equal(model.links.length,1);assert.equal(model.links[0].target,'#heading');


 let projected=text;

 for(const range of [...model.hidden].sort(/* Remove hidden syntax in descending order so earlier source coordinates remain valid. */ (a,b)=>b.from-a.from))projected=projected.slice(0,range.from)+projected.slice(range.to);

 assert.ok(projected.includes('a [label] 😀'));assert.ok(projected.includes('`**literal**`'));assert.ok(projected.includes('\\(a*b*c\\)'));


 const raw=state.update({effects:setMarkdownSource.of(true)}).state;

 assert.equal(raw.doc.toString(),text);assert.equal(raw.field(inlinePresentation).decorations.size,0);

 const rendered=raw.update({effects:setMarkdownSource.of(false)}).state;

 assert.equal(rendered.doc.toString(),text);assert.ok(rendered.field(inlinePresentation).decorations.size>0);
});
