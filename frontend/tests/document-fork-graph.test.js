import {test} from 'node:test';
import assert from 'node:assert/strict';
import {documentForkGraph,identityKey as key} from '../src/document-fork-graph.js';
const id=n=>Array(32).fill(n);
const node=(n,title='Same label')=>({document:id(n),node:id(n+10),revision:id(n+20),snapshot:id(n+30),title});
const endpoint=(n,revision=n+20)=>({document:id(n),node:id(n+10),revision:id(revision),snapshot:id(n+30),occurrence_path:[id(n+40)],start_byte:0,end_byte:8});
const edge={kind:'fork',transformation:id(90),operation:id(91),actor:id(92),device:id(93),inputs:[endpoint(1)],outputs:[endpoint(2)]};
const projection=()=>({projection:'document_forks',nodes:[node(1),node(2)],edges:[structuredClone(edge)],inputs_outside_selection:0});
const requested=[key(id(1)),key(id(2))];
test('equal-labelled distinct nodes and pinned historical endpoints remain distinct in a read-only graph',()=>{
 const raw=projection();raw.nodes[0].revision=id(70);const view=documentForkGraph(raw,requested);assert.deepEqual(view,raw);assert.notEqual(key(view.nodes[0].node),key(view.nodes[1].node));assert.notDeepEqual(view.nodes[0].revision,view.edges[0].inputs[0].revision);view.nodes[0].title='Changed view';assert.equal(raw.nodes[0].title,'Same label');
});
test('duplicate/out-of-scope incidence, malformed endpoints and unsupported relationship families fail closed',()=>{
 const invalid=[];
 for(const mutate of [p=>p.nodes[1].node=p.nodes[0].node,p=>p.nodes.reverse(),p=>p.edges.push(p.edges[0]),p=>p.edges[0].inputs[0].document=id(3),p=>p.edges[0].inputs[0].node=id(99),p=>p.edges[0].outputs[0].end_byte=9,p=>p.edges[0].kind='semantic',p=>p.edges[0].inputs.push(endpoint(1)),p=>p.inputs_outside_selection=2,p=>p.projection='all_relationships']){const p=projection();mutate(p);invalid.push(p);}
 for(const p of invalid)assert.throws(()=>documentForkGraph(p,requested),/Invalid|Duplicate/);
});
test('disconnected and boundary selections retain explicit supported scope and never fabricate an edge',()=>{
 const p={projection:'document_forks',nodes:[node(2)],edges:[],inputs_outside_selection:1};assert.deepEqual(documentForkGraph(p,[key(id(2))]),p);
 assert.throws(()=>documentForkGraph(p,[]),/Invalid/);assert.throws(()=>documentForkGraph(projection(),[requested[0],requested[0]]),/Invalid/);
});
