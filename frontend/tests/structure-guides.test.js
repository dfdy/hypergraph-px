/**
 * # Hypergraph PX — Structure guides exact-source regression scenarios
 *
 * Checks editor source and display boundaries with isolated Unicode, newline,
 * Markdown and structural fixtures.
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
 * - [Exact text and anchors][spec-2]
 * - [Frontend interaction contract][spec-3]
 *
 * Boundary: Assertions cover isolated editor models, not integrated persistence or
 * browser acceptance. Original fixture text and all executable assertions remain
 * unchanged.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/structure-guides.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 * [spec-3]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {structureGuideModel,structureGuideSegments} from '../src/structure-guides.js';

/** Create an isolated editor document for structure-guide measurement. */
const stateFor=doc=>EditorState.create({doc});

test('structure lanes follow actual section nesting and paragraphs without changing source indentation',/* Verify nesting lanes follow actual heading depth and paragraphs without editing source indentation. */ ()=>{
 const text='# Root\n\nOpening paragraph.\n\n### Child\n\nChild paragraph\ncontinued softly.\n\n#### Grandchild\n\nNested paragraph.\n\n## Sibling\n\nLast paragraph.\n',state=stateFor(text),model=structureGuideModel(state);


 assert.deepEqual(model.ranges.filter(/* Select section ranges for hierarchy assertions. */ range=>range.kind==='section').map(/* Collect section lanes to check skipped-level nesting. */ range=>range.lane),[0,1,2,1]);assert.equal(model.width,90);assert.deepEqual(model.ranges.filter(/* Select paragraph ranges for content-depth assertions. */ range=>range.kind==='paragraph').map(/* Collect paragraph lanes to check section-relative depth. */ range=>range.lane),[1,2,3,2]);


 const child=state.doc.lineAt(text.indexOf('Child paragraph')),continuation=state.doc.lineAt(text.indexOf('continued'));

 assert.equal(structureGuideSegments(state,child.from).length,3);assert.equal(structureGuideSegments(state,continuation.from).filter(/* Select the paragraph rail at its soft continuation start. */ range=>range.kind==='paragraph')[0].start,false);assert.equal(structureGuideSegments(state,continuation.from).filter(/* Select the paragraph rail at its soft continuation end. */ range=>range.kind==='paragraph')[0].end,true);assert.equal(state.doc.toString(),text);
});

test('only document headings drive section nesting; Setext works and code/table rows have no paragraph rail',/* Verify only document headings affect nesting and code/table rows receive no paragraph rail. */ ()=>{
 const text='Root\n====\n\n> ## Quoted heading\n\n```\n## Code heading\n```\n\n| A | B |\n|---|---|\n| C | D |\n\nChild\n-----\n\nBody.\n',state=stateFor(text),model=structureGuideModel(state);

 assert.equal(model.ranges.filter(/* Count actual section ranges rather than quoted or fenced headings. */ range=>range.kind==='section').length,2);


 for(const needle of ['## Code heading','| C | D |'])assert.equal(structureGuideSegments(state,text.indexOf(needle)).filter(/* Select paragraph rails that must be absent inside code/table content. */ range=>range.kind==='paragraph').length,0);


 assert.ok(structureGuideSegments(state,text.indexOf('| A |'),text.indexOf('Child')-2).some(/* Find a section rail spanning a requested source interval. */ range=>range.kind==='section'));
});

test('guide models recompute after edits and sibling/blank boundaries do not retain a previous paragraph',/* Verify edited states rebuild models and blank separators do not retain paragraph rails. */ ()=>{
 const state=stateFor('## One\n\nFirst paragraph.\n\n## Two\n\nSecond paragraph.'),first=structureGuideModel(state),blank=state.doc.line(4);

 assert.equal(structureGuideSegments(state,blank.from).some(/* Detect any incorrectly retained paragraph rail on a blank line. */ range=>range.kind==='paragraph'),false);


 const next=state.update({changes:{from:0,to:1,insert:''}}).state;

 assert.notEqual(structureGuideModel(next),first);assert.equal(structureGuideModel(next).ranges.filter(/* Count sections after an edit changes heading syntax. */ range=>range.kind==='section').length,2);
});


test('one common gutter fits the document depth instead of reserving unused lanes next to the text',/* Verify a shared gutter grows with actual document depth instead of reserving unused lanes. */ ()=>{
 const shallow=structureGuideModel(stateFor('A paragraph.')),deep=structureGuideModel(stateFor('# One\n\n## Two\n\n### Three\n\n#### Four\n\n##### Five\n\n###### Six\n\nA paragraph.'));

 assert.equal(shallow.width,36);assert.equal(deep.maxLane,6);assert.equal(deep.width,144);
});
