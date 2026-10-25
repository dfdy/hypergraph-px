import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {assertionProperties,assertionPropertyLabels} from '../src/assertion-properties.js';
import {relationshipField,adjacentPairs,addRelationship,canonicalRelationship} from '../src/relationships.js';
test('polarity, uncertainty, attribution and scope qualify an assertion without changing its predicate',()=>{
 let state=EditorState.create({doc:'A happens. B happens.',extensions:[relationshipField]});const pair=adjacentPairs(state,'sentence')[0],properties={negated:true,certainty:'possible',attribution:' Reviewer ',scope:' Within this study '};
 state=state.update({effects:addRelationship.of({kind:'sentence',pair,predicateId:'preview:causal-empirical:causes',properties})}).state;
 const records=state.field(relationshipField).records;assert.equal(records.length,1);assert.equal(records[0].predicateId,'preview:causal-empirical:causes');assert.equal(records[0].name,'causes');assert.deepEqual(records[0].properties,{negated:true,certainty:'possible',attribution:'Reviewer',scope:'Within this study'});assert.deepEqual(canonicalRelationship(records[0]).properties,records[0].properties);assert.equal(state.doc.toString(),'A happens. B happens.');
 assert.deepEqual(assertionPropertyLabels(records[0].properties),['Negated','Certainty: possible','Attributed to: Reviewer','Scope: Within this study']);assert.deepEqual(assertionPropertyLabels(),[]);
});
test('assertion properties have neutral defaults and reject unsupported or oversized values before record creation',()=>{
 assert.deepEqual(assertionProperties(),{negated:false,certainty:'unspecified',attribution:'',scope:''});
 for(const properties of [{negated:'yes'},{certainty:'proven'},{scope:'x'.repeat(501)},{attribution:'x'.repeat(201)},{permissions:'admin'},null,[]])assert.throws(()=>assertionProperties(properties));
 const state=EditorState.create({doc:'One sentence. Two sentence.',extensions:[relationshipField]}),pair=adjacentPairs(state,'sentence')[0];assert.equal(state.update({effects:addRelationship.of({kind:'sentence',pair,predicateId:'preview:logical-argumentative:supports',properties:{permissions:'admin'}})}).state.field(relationshipField).records.length,0);
});
test('browsing category never changes the stored qualified fact or the inverse canonical roles',()=>{
 const state=EditorState.create({doc:'One sentence. Two sentence.',extensions:[relationshipField]}),pair=adjacentPairs(state,'sentence')[0];
 const create=categoryId=>state.update({effects:addRelationship.of({kind:'sentence',pair,predicateId:'preview:logical-argumentative:is_supported_by',categoryId,properties:{certainty:'probable'}})}).state.field(relationshipField).records[0];
 assert.deepEqual(create('epistemological'),create('logical-argumentative'));const meaning=canonicalRelationship(create('epistemological'));assert.equal(meaning.source.from,pair.right.from);assert.equal(meaning.predicateId,'preview:logical-argumentative:supports');assert.equal(meaning.properties.certainty,'probable');
});


test('repeating a typed assertion through another browsing tag reuses one record, but changed properties remain distinct',()=>{
 let state=EditorState.create({doc:'One sentence. Two sentence.',extensions:[relationshipField]}),pair=adjacentPairs(state,'sentence')[0];
 const effect=(categoryId,properties={})=>addRelationship.of({kind:'sentence',pair,predicateId:'preview:causal-empirical:causes',categoryId,properties});
 state=state.update({effects:effect('causal-empirical')}).state;const id=state.field(relationshipField).lastAddedId;
 state=state.update({effects:effect('dialectical-process')}).state;assert.equal(state.field(relationshipField).records.length,1);assert.equal(state.field(relationshipField).lastAddedId,id);
 state=state.update({effects:effect('dialectical-process',{certainty:'possible'})}).state;assert.equal(state.field(relationshipField).records.length,2);assert.notEqual(state.field(relationshipField).lastAddedId,id);
});
