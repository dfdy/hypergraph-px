import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {relationshipCategories,relationshipTypes,relationshipType,searchRelationshipCatalog,uniqueRelationshipMatches,validateRelationshipCatalog} from '../src/relationship-catalog.js';
import {adjacentPairs,selectedRelationshipPair,relationshipField,addRelationship,canonicalRelationship} from '../src/relationships.js';

test('audited vocabulary covers thirteen categories and 244 distinct scoped choices',()=>{
 assert.deepEqual(relationshipCategories.map(group=>group.types.length),[39,67,45,41,28,38,35,44,26,26,13,15,8]);
 const definitions=relationshipTypes;assert.equal(new Set(definitions.map(type=>type.id)).size,244);assert.deepEqual(validateRelationshipCatalog(relationshipCategories),[]);
 const duplicates=definitions.filter(type=>type.type==='undermines');assert.equal(duplicates.length,2);assert.notEqual(duplicates[0].id,duplicates[1].id);assert.notEqual(duplicates[0].example,duplicates[1].example);
 assert.equal(relationshipType('preview:ontological:depends_on').inverse,'is depended on by');assert.equal(relationshipType('unknown:entails'),null);
});
test('selected sibling sections include their descendants and exclude the next section, independent of direction',()=>{
 const text='# Document\n\n## One\n\nFirst body.\n\n### Child\n\nNested body.\n\n## Two\n\nSecond body.\n\n## Three\n\nThird body.\n';
 let state=EditorState.create({doc:text,extensions:[relationshipField]});const pair=adjacentPairs(state,'section').find(pair=>pair.left.text.startsWith('## One'));assert.ok(pair.left.text.includes('Nested body.'));assert.ok(pair.right.text.startsWith('## Two'));assert.ok(!pair.right.text.includes('## Three'));
 for(const selection of [{anchor:pair.left.from,head:pair.right.to},{anchor:pair.right.to,head:pair.left.from}]){const selected=selectedRelationshipPair(state.update({selection}).state);assert.equal(selected.kind,'section');assert.equal(selected.pair.position,pair.position);}
 state=state.update({effects:addRelationship.of({kind:'section',pair,predicateId:'preview:logical-argumentative:supports'})}).state;
 const record=state.field(relationshipField).records[0];assert.equal(record.name,'supports');assert.equal(Object.hasOwn(record,'categoryId'),false);assert.equal(record.left.text,pair.left.text);
 const unknown=state.update({effects:addRelationship.of({kind:'section',pair,predicateId:'unknown:supports'})}).state;assert.equal(unknown.field(relationshipField).records.length,1);
 state=state.update({changes:{from:pair.left.from+4,insert:'Changed '}}).state;assert.equal(state.field(relationshipField).records[0].stale,true);
});

test('binary logical operators distinguish all ten two-input truth functions from consequence assertions',()=>{
 const group=relationshipCategories.find(group=>group.id==='logical-operators');assert.equal(group.types.length,26);assert.equal(group.types.filter(type=>type.family==='truth-functional').length,10);assert.equal(group.types.every(type=>type.example)&&group.types.filter(type=>type.family==='truth-functional').every(type=>type.symbol),true);
 assert.equal(relationshipType('preview:logical-operators:material_implication').symbol,'→');assert.equal(relationshipType('preview:logical-operators:semantic_entailment').symbol,'⊨');assert.notEqual(relationshipType('preview:logical-operators:semantic_entailment').family,'truth-functional');
});

test('catalogue search finds ordinary terms, symbols, aliases and custom record identity stays separate',()=>{
 for(const [query,expected] of [['and','conjunction'],['or','inclusive_disjunction'],['xor','exclusive_disjunction'],['iff','biconditional'],['therefore','therefore'],['∴','therefore']]){
  const matches=searchRelationshipCatalog(query).flatMap(group=>group.types).sort((a,b)=>a.score-b.score);assert.equal(matches[0].type.type,expected);
 }
 assert.equal(searchRelationshipCatalog('zxxy nonexistent label').length,0);
 const state=EditorState.create({doc:'One statement. Another statement.',extensions:[relationshipField]}),pair=adjacentPairs(state,'sentence')[0];
 const custom=state.update({effects:addRelationship.of({kind:'sentence',pair,name:'supports',custom:true,categoryId:null})}).state.field(relationshipField).records[0];assert.equal(custom.custom,true);assert.equal(custom.predicateId,undefined);assert.equal(custom.name,'supports');
});

test('display labels use ordinary spaces and paired marker words are individual, nonduplicate choices',()=>{
 const operators=relationshipCategories.find(group=>group.id==='logical-operators').types;for(const word of ['if','then','neither','nor','not','but'])assert.equal(operators.filter(type=>type.label===word).length,1);
 assert.equal(new Set(operators.map(type=>type.label)).size,operators.length);assert.equal(relationshipCategories.flatMap(group=>group.types).some(type=>type.label.includes('_')),false);assert.equal(relationshipType('preview:ethical-political:liberates_from').label,'liberates from');
});


test('adaptation roles and determination directions remain distinct searchable choices',()=>{
 const adapts=relationshipType('preview:genealogical-historical:adapts'),adaptsTo=relationshipType('preview:dialectical-process:adapts_to');
 assert.equal(adapts.label,'adapts');assert.equal(adaptsTo.label,'adapts to');assert.notEqual(adapts.definition,adaptsTo.definition);
 for(const [category,name,inverse] of [['ontological','determines','is determined by'],['ontological','is_determined_by','determines'],['epistemological','underdetermines','is underdetermined by']]){
  const entry=relationshipType(`preview:${category}:${name}`);assert.equal(entry.inverse,inverse);assert.equal(searchRelationshipCatalog(entry.label).flatMap(g=>g.types).some(m=>m.type.id===entry.id&&m.score===0),true);
 }
 assert.notEqual(relationshipType('preview:ontological:determines').id,relationshipType('preview:epistemological:underdetermines').id);
});


test('every audit candidate and omitted role is selectable or a deliberate alias, without duplicating aliases',()=>{
 const labels=[
 'grounds;is grounded in;has part;has property;is a property of;sustains;disrupts;stabilises;destabilises;replaces;is replaced by;results in;results from',
 'rebuts;undercuts;argues for;argues against;concedes;is an exception to;reformulates;corroborates;disconfirms;predicts;explains;is explained by;estimates',
 'authorises;delegates to;represents;is accountable to;protects;harms;benefits;exploits;resists',
 'denotes;is denoted by;defines;abbreviates;is coextensive with;is disjoint from;closely matches;exactly matches',
 'cites;quotes;paraphrases;translates;is a translation of;corrects;extends;supersedes',
 'uses a method from;uses data from;replicates;reproduces results from;applies to;measures;is measured by;conforms to',
 'unless;even if;otherwise;although;provided that;elaborates;summarises;restates;contrasts;gives background to;gives a purpose for',
 'precedes;follows;meets;is met by;occurs during;temporally contains;starts with;finishes with',
 'is derived from;is quoted from;is a revision of;is attributed to;is generated by;causes;prevents;increases;decreases;correlates with;moderates',
 'is adapted by;adapts for;is depended on by;is constituted by;is embodied in;is constrained by;is enabled by;is presupposed by;is instantiated by;is conditioned by;gives rise to;is realised through;supplies a basis for;responds with;is implemented by;is tested by;is evaluated by;is supported by;infers',
 'suffices for;is a subtype of;is an instance of'
 ].flatMap(row=>row.split(';'));
 for(const label of labels){const exact=searchRelationshipCatalog(label).flatMap(g=>g.types).filter(m=>m.score===0);assert.ok(exact.length,`Missing audit choice/alias: ${label}`);}
 const types=relationshipCategories.flatMap(g=>g.types);assert.equal(types.filter(t=>t.label==='is sufficient for').length,1);assert.equal(types.some(t=>t.label==='suffices for'),false);
 assert.notEqual(relationshipType('preview:conceptual-semantic:is_a').targetRole,relationshipType('preview:ontological:instantiates').targetRole);
});

test('reviewed inverse wording creates one assertion with swapped canonical roles and mapped anchors',()=>{
 let state=EditorState.create({doc:'The institution persists. Social relations persist.',extensions:[relationshipField]});const pair=adjacentPairs(state,'sentence')[0];
 state=state.update({effects:addRelationship.of({kind:'sentence',pair,predicateId:'preview:ontological:is_constituted_by'})}).state;
 let records=state.field(relationshipField).records;assert.equal(records.length,1);assert.equal(records[0].name,'is constituted by');assert.equal(records[0].canonicalPredicateId,'preview:ontological:constitutes');assert.equal(records[0].orientation,'reverse');
 let meaning=canonicalRelationship(records[0]);assert.equal(meaning.source.text,'Social relations persist.');assert.equal(meaning.target.text,'The institution persists.');assert.equal(meaning.predicateId,'preview:ontological:constitutes');
 state=state.update({changes:{from:0,insert:'# New 🧭\n\n'}}).state;records=state.field(relationshipField).records;meaning=canonicalRelationship(records[0]);assert.equal(records[0].stale,false);assert.equal(meaning.source.from,pair.right.from+'# New 🧭\n\n'.length);assert.equal(meaning.target.from,'# New 🧭\n\n'.length);
 assert.equal(canonicalRelationship({...records[0],predicateId:undefined,custom:true}),null);
});

test('metadata distinguishes terms, time, causation and authoritative provenance, and rejects broken inverse links',()=>{
 const type=(group,name)=>relationshipType(`preview:${group}:${name}`);
 assert.equal(type('source-provenance','is_generated_by').targetRole,'activity');assert.equal(type('source-provenance','is_attributed_to').targetRole,'agent');
 assert.ok(type('causal-empirical','moderates').contextFields.includes('predictor and outcome'));assert.ok(type('genealogical-historical','adapts_for').contextFields.includes('adapted material'));assert.ok(type('epistemological','infers').contextFields.includes('premises'));
 assert.match(type('temporal','starts_with').definition,/ends later/);assert.match(type('temporal','starts').definition,/ends earlier/);assert.match(type('causal-empirical','correlates_with').definition,/not causation/);assert.match(type('source-provenance','is_a_revision_of').definition,/no snapshot is changed/);
 assert.equal(type('conceptual-semantic','closely_matches').symmetry,'symmetric');assert.equal(type('causal-empirical','moderates').symmetry,'not asserted');
 const broken=structuredClone(relationshipCategories);broken[0].types.find(t=>t.type==='constitutes').inverseId='unknown';assert.ok(validateRelationshipCatalog(broken).some(error=>error.includes('Invalid converse')));
});


test('overlapping tags share one definition and cross-tag search has one result per stable identity',()=>{
 const causes=relationshipType('preview:causal-empirical:causes');assert.ok(causes.categoryIds.includes('dialectical-process'));
 for(const tag of causes.categoryIds)assert.equal(relationshipCategories.find(group=>group.id===tag).types.find(type=>type.id===causes.id),causes);
 const matches=searchRelationshipCatalog('causes');assert.ok(matches.flatMap(group=>group.types).filter(match=>match.type.id===causes.id).length>1);assert.equal(uniqueRelationshipMatches(matches).filter(match=>match.type.id===causes.id).length,1);
 assert.equal(relationshipTypes.length,244);assert.ok(relationshipCategories.reduce((n,g)=>n+g.types.length,0)>244);assert.equal(new Set(relationshipCategories.flatMap(g=>g.types)).size,244);
 assert.notEqual(relationshipType('preview:dialectical-process:undermines').id,relationshipType('preview:logical-argumentative:undermines').id);
});
