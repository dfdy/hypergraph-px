import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {sentenceUnits,provenanceKinds,provenancePair,provenanceLabel,sentenceProvenanceField,addSentenceProvenance,sentenceProvenanceGroups} from '../src/sentence-provenance.js';
const stateFor=text=>EditorState.create({doc:text,extensions:[sentenceProvenanceField]});
function pair(state,kind='fork',extra={}){const units=sentenceUnits(state);return provenancePair({eventId:'event:1',kind,source:{document:'a',title:'A',sequence:0,anchor:units[0]},target:{document:'a',title:'A',sequence:0,anchor:units[1]},...extra});}
test('sentence provenance distinguishes directions for all link kinds and embed policies',()=>{
 const state=stateFor('One sentence. Another sentence.');assert.equal(Object.keys(provenanceKinds).length,9);
 for(const kind of Object.keys(provenanceKinds)){const records=pair(state,kind,kind==='embed'?{policy:'pinned'}:{});assert.notEqual(provenanceLabel(records[0]),provenanceLabel(records[1]));assert.equal(records[0].other.endpointId,records[1].id);}
 assert.match(provenanceLabel(pair(state,'embed',{policy:'live'})[1]),/live/);assert.throws(()=>pair(state,'embed'));assert.throws(()=>pair(state,'unknown'));
});
test('all sentence links remain separate, map exactly and become review-needed after a source edit',()=>{
 let state=stateFor('One sentence. Another sentence.');const records=[...pair(state),...provenancePair({eventId:'event:2',kind:'copy',source:{document:'a',anchor:sentenceUnits(state)[0]},target:{document:'a',anchor:sentenceUnits(state)[1]}})];
 state=state.update({effects:addSentenceProvenance.of(records)}).state;assert.equal(state.field(sentenceProvenanceField).length,4);assert.equal(sentenceProvenanceGroups(state)[0].records.length,2);assert.equal(state.doc.toString(),'One sentence. Another sentence.');
 state=state.update({changes:{from:0,insert:'# 🧭 Header\n\n'}}).state;assert.equal(state.field(sentenceProvenanceField).every(r=>!r.stale),true);assert.equal(sentenceProvenanceGroups(state)[0].position,'# 🧭 Header\n\n'.length);
 const at=sentenceProvenanceGroups(state)[0].position;state=state.update({changes:{from:at+1,insert:'Changed'}}).state;assert.equal(state.field(sentenceProvenanceField).filter(r=>r.stale).length,2);assert.equal(sentenceProvenanceGroups(state).length,1);
 state=state.update({changes:{from:at+1,to:at+8,insert:''}}).state;assert.equal(state.field(sentenceProvenanceField).filter(r=>r.stale).length,2);
});
test('sentence anchors are structural, not text matching, and exclude headings/fences/table cells',()=>{
 let state=stateFor('# Heading.\n\nRepeated sentence. Repeated sentence.\n\n```\nCode sentence.\n```\n\n| Table | Cell |\n|---|---|\n| Hidden sentence. | Other. |\n');const units=sentenceUnits(state);assert.equal(units.length,2);assert.notEqual(units[0].from,units[1].from);
 const records=pair(state);state=state.update({effects:addSentenceProvenance.of([...records,{...records[0],id:'bad',anchor:{from:0,to:10,text:'# Heading.'}}])}).state;assert.equal(state.field(sentenceProvenanceField).length,2);
 state=state.update({effects:addSentenceProvenance.of(records)}).state;assert.equal(state.field(sentenceProvenanceField).length,2);
});


test('multiple parents in one merge event retain distinct link endpoints and frozen capture coordinates',()=>{
 const state=stateFor('One sentence. Another sentence. A result sentence.'),units=sentenceUnits(state),source={document:'a',sequence:7,anchor:units[0]},target={document:'a',sequence:8,anchor:units[2]};
 const first=provenancePair({eventId:'merge:1',linkId:'merge:1:parent:1',kind:'merge',source,target}),second=provenancePair({eventId:'merge:1',linkId:'merge:1:parent:2',kind:'merge',source:{...source,anchor:units[1]},target});
 const records=state.update({effects:addSentenceProvenance.of([...first,...second])}).state.field(sentenceProvenanceField);assert.equal(records.length,4);assert.equal(new Set(records.map(record=>record.eventId)).size,1);assert.equal(new Set(records.map(record=>record.id)).size,4);assert.deepEqual(first[0].captured,{sequence:7,anchor:units[0]});
});

test('paragraph and section provenance use their own exact structural anchors, not inherited sentence links',async()=>{
 const {provenanceUnits}=await import('../src/sentence-provenance.js');let state=stateFor('# Root\n\n## One\n\nFirst sentence. Second sentence.\n\nAnother paragraph.\n\n### Child\n\nNested body.\n\n## Two\n\nFinal body.\n');
 const paragraphs=provenanceUnits(state,'paragraph'),sections=provenanceUnits(state,'section');assert.equal(paragraphs.length,4);assert.ok(sections.find(s=>s.text.startsWith('## One')).text.includes('Nested body.'));assert.ok(!sections.find(s=>s.text.startsWith('## One')).text.includes('## Two'));
 const create=(kind,units)=>provenancePair({eventId:'event:'+kind,kind:'fork',unitKind:kind,source:{document:'a',anchor:units[0]},target:{document:'a',anchor:units[1]}});
 state=state.update({effects:addSentenceProvenance.of([...create('sentence',sentenceUnits(state)),...create('paragraph',paragraphs),...create('section',sections)])}).state;
 assert.equal(state.field(sentenceProvenanceField).length,6);assert.equal(sentenceProvenanceGroups(state).filter(g=>g.unitKind==='paragraph').length,2);assert.equal(sentenceProvenanceGroups(state).filter(g=>g.unitKind==='section').length,2);
 const at=paragraphs[0].from+1;state=state.update({changes:{from:at,insert:'Changed '}}).state;assert.equal(state.field(sentenceProvenanceField).filter(r=>r.unitKind==='paragraph'&&r.stale).length,1);assert.equal(state.field(sentenceProvenanceField).filter(r=>r.unitKind==='section'&&r.stale).length,2);assert.equal(state.field(sentenceProvenanceField).filter(r=>r.unitKind==='paragraph'&&!r.stale).length,1);
});

test('section units include Setext headings and ignore heading-like text in fenced code',async()=>{
 const {provenanceUnits}=await import('../src/sentence-provenance.js');const state=stateFor('Root\n====\n\nText.\n\n```\n## Not a section\n```\n\nNext\n----\n\nBody.\n');const sections=provenanceUnits(state,'section');assert.equal(sections.length,2);assert.equal(sections[0].from,0);assert.ok(sections[1].text.startsWith('Next\n----'));
});
