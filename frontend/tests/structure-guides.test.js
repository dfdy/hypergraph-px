import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {structureGuideModel,structureGuideSegments} from '../src/structure-guides.js';
const stateFor=doc=>EditorState.create({doc});
test('structure lanes follow actual section nesting and paragraphs without changing source indentation',()=>{
 const text='# Root\n\nOpening paragraph.\n\n### Child\n\nChild paragraph\ncontinued softly.\n\n#### Grandchild\n\nNested paragraph.\n\n## Sibling\n\nLast paragraph.\n',state=stateFor(text),model=structureGuideModel(state);
 assert.deepEqual(model.ranges.filter(range=>range.kind==='section').map(range=>range.lane),[0,1,2,1]);assert.equal(model.width,90);assert.deepEqual(model.ranges.filter(range=>range.kind==='paragraph').map(range=>range.lane),[1,2,3,2]);
 const child=state.doc.lineAt(text.indexOf('Child paragraph')),continuation=state.doc.lineAt(text.indexOf('continued'));assert.equal(structureGuideSegments(state,child.from).length,3);assert.equal(structureGuideSegments(state,continuation.from).filter(range=>range.kind==='paragraph')[0].start,false);assert.equal(structureGuideSegments(state,continuation.from).filter(range=>range.kind==='paragraph')[0].end,true);assert.equal(state.doc.toString(),text);
});
test('only document headings drive section nesting; Setext works and code/table rows have no paragraph rail',()=>{
 const text='Root\n====\n\n> ## Quoted heading\n\n```\n## Code heading\n```\n\n| A | B |\n|---|---|\n| C | D |\n\nChild\n-----\n\nBody.\n',state=stateFor(text),model=structureGuideModel(state);assert.equal(model.ranges.filter(range=>range.kind==='section').length,2);
 for(const needle of ['## Code heading','| C | D |'])assert.equal(structureGuideSegments(state,text.indexOf(needle)).filter(range=>range.kind==='paragraph').length,0);
 assert.ok(structureGuideSegments(state,text.indexOf('| A |'),text.indexOf('Child')-2).some(range=>range.kind==='section'));
});
test('guide models recompute after edits and sibling/blank boundaries do not retain a previous paragraph',()=>{
 const state=stateFor('## One\n\nFirst paragraph.\n\n## Two\n\nSecond paragraph.'),first=structureGuideModel(state),blank=state.doc.line(4);assert.equal(structureGuideSegments(state,blank.from).some(range=>range.kind==='paragraph'),false);
 const next=state.update({changes:{from:0,to:1,insert:''}}).state;assert.notEqual(structureGuideModel(next),first);assert.equal(structureGuideModel(next).ranges.filter(range=>range.kind==='section').length,2);
});


test('one common gutter fits the document depth instead of reserving unused lanes next to the text',()=>{
 const shallow=structureGuideModel(stateFor('A paragraph.')),deep=structureGuideModel(stateFor('# One\n\n## Two\n\n### Three\n\n#### Four\n\n##### Five\n\n###### Six\n\nA paragraph.'));assert.equal(shallow.width,36);assert.equal(deep.maxLane,6);assert.equal(deep.width,144);
});
