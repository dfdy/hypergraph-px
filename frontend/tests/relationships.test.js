import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {adjacentPairs,relationshipField,addRelationship,removeRelationship,relationshipBoundaries} from '../src/relationships.js';
function state(doc){return EditorState.create({doc,extensions:[relationshipField]});}
function add(s,name='Supports',kind='sentence'){return s.update({effects:addRelationship.of({kind,name,pair:adjacentPairs(s,kind)[0]})}).state;}
test('adjacency stays inside prose and rejects intervening headings, code and tables',()=>{
 const s=state('# Title\n\nFirst sentence. Second sentence.\n\nNext paragraph.\n\n## Other\n\nDifferent section.\n\n```\nFake sentence. Fake second.\n```\n\nAfter code.\n\n| A | B |\n|---|---|\n| x | y |\n\nAfter table.');
 const pairs=adjacentPairs(s,'paragraph');assert.equal(pairs.length,1);assert.equal(pairs[0].right.text,'Next paragraph.');
 assert.equal(adjacentPairs(s,'sentence').length,1);
 assert.equal(adjacentPairs(state('A `code. value` sentence. Another sentence.'),'sentence').length,0);
});
test('multiple relationships retain distinct identity without touching source; removal is exact',()=>{
 let s=state('Café 🧭 first. Second sentence.\n\nAnother paragraph.');const source=s.doc.toString();s=add(add(s,'Supports'),'Clarifies');
 const records=s.field(relationshipField).records;assert.equal(records.length,2);assert.notEqual(records[0].id,records[1].id);assert.equal(relationshipBoundaries(s)[0].records.length,2);assert.equal(s.doc.toString(),source);
 s=s.update({effects:removeRelationship.of(records[0].id)}).state;assert.deepEqual(s.field(relationshipField).records.map(r=>r.name),['Clarifies']);
});
test('unrelated Unicode insertion maps exact anchors; content changes or broken adjacency become review-needed',()=>{
 let s=add(state('First sentence. Second sentence.\n\nNext paragraph.'));
 s=s.update({changes:{from:0,insert:'# 🧭\n\n'}}).state;
 assert.equal(s.field(relationshipField).records[0].stale,false);assert.equal(s.field(relationshipField).records[0].left.from,6);
 s=s.update({changes:{from:s.doc.toString().indexOf('Second'),insert:'Changed '}}).state;
 assert.equal(s.field(relationshipField).records[0].stale,true);assert.equal(relationshipBoundaries(s).length,0);
 let paragraph=add(state('One paragraph.\n\nAnother paragraph.'),'Contrasts','paragraph');
 paragraph=paragraph.update({changes:{from:paragraph.doc.toString().indexOf('Another'),insert:'## Intervening heading\n\n'}}).state;
 assert.equal(paragraph.field(relationshipField).records[0].stale,true);
});
