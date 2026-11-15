/**
 * # Hypergraph PX — Publication contributors runtime regression scenarios
 *
 * Checks bounded publication contributors responses and exact-source invariants
 * using explicit synthetic runtime fixtures.
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
 * - [Browser runtime and API contract][spec-2]
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Transport fixtures establish isolated validation and retry behaviour,
 * not real-data acceptance, authenticated provenance or whole-application proof.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/publication-contributors.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicationContributors,contributorColour} from '../src/publication-contributors.js';

/** Allocate deterministic synthetic principal and publication identities. */
const id=n=>Array(32).fill(n);

/** Build an explicitly incomplete contribution projection scoped to one exact text snapshot. */
const page=()=>({projection:'text_publication_contributors',document:id(1),snapshot:id(2),current_human:{principal:id(3),label:'Actual owner'},current_agent:null,publications:[{principal:id(3),revision:id(4),snapshot:id(2),operation:id(5),role:'publisher'}],next:null,complete_text_publications:true,complete_contributors:false,excluded_families:['original_text_authorship','semantic_reviews','comments','interaction_records']});

test('publication projection binds exact snapshot and separates context pins from incomplete contribution evidence',/* Verify snapshot freezing, absent machine users and detached returned contribution evidence. */ async()=>{const p=page(),input=id(2);

 let release;

 const wait=new Promise(/* Expose a release gate so caller mutation occurs before response completion. */ r=>{release=r;});

 const pending=publicationContributors(/* Check the requested route and frozen snapshot before returning the synthetic page. */ async(path,body)=>{assert.equal(path,'contributors/publications');await wait;assert.deepEqual(body.snapshot,id(2));

  return p;},id(1),input);

 input[0]=99;release();

 const result=await pending;

 assert.equal(result.current_agent,null);assert.equal(result.complete_contributors,false);result.current_human.label='Changed';assert.equal(p.current_human.label,'Actual owner');});

test('newer head substitution, agent fabrication, original-author roles and misleading completeness fail',/* Verify head substitution, fabricated users and misleading authorship/completeness fail closed. */ async()=>{for(const mutate of [/* Substitute a newer snapshot. */ p=>p.snapshot=id(99),/* Substitute another document. */ p=>p.document=id(99),/* Fabricate an unrecorded current machine user. */ p=>p.current_agent={principal:id(6),label:'Provider'},/* Mislabel a publisher as an original author. */ p=>p.publications[0].role='author',/* Claim complete contribution evidence. */ p=>p.complete_contributors=true,/* Remove required text-publication completeness. */ p=>p.complete_text_publications=false,/* Duplicate a publication entry. */ p=>p.publications.push(p.publications[0]),/* Change an initial publication’s pinned snapshot. */ p=>p.publications[0].snapshot=id(9),/* Remove the declared excluded evidence families. */ p=>p.excluded_families=[]]){const p=page();

  mutate(p);await assert.rejects(publicationContributors(/* Return the independently mutated response for validation. */ async()=>p,id(1),id(2)));}});

test('bounded opaque continuation permits older evidence and colours remain distinct and stable across later pages',/* Verify bounded continuation, stable distinct colours and reserved owner/agent colours. */ async()=>{const p=page();

 p.publications[0].snapshot=id(7);await publicationContributors(/* Return an older publication behind an explicit continuation. */ async()=>p,id(1),id(2),[1,2,3],1);await assert.rejects(publicationContributors(/* Return the same page for the malformed empty-cursor rejection. */ async()=>p,id(1),id(2),[],1));

 const owner=id(3),a=id(8),b=id(9),first=contributorColour(a,owner);

 assert.equal(contributorColour(owner,owner),'#b84747');assert.notEqual(first,contributorColour(b,owner));assert.equal(contributorColour(a,owner),first);

 const colours=new Set();

 for(let i=10;i<255;i++)colours.add(contributorColour(id(i),owner));

 assert.equal(colours.size,245);assert.ok(!colours.has('#b84747')&&!colours.has('#427dcc'));});

test('later principal badges preserve reserved hue ranges and white-initial contrast without colour reuse',/* Verify 1024 later principal colours retain reserved hue ranges and readable white initials. */ ()=>{
 const owner=id(249),assigned=new Map(),colours=new Set();


 for(let n=0;n<1024;n++){
  const principal=[n&255,n>>8,...Array(30).fill(0)],colour=contributorColour(principal,owner);

  assert.match(colour,/^#[0-9a-f]{6}$/);assert.ok(!colours.has(colour));colours.add(colour);assigned.set(n,colour);


  const rgb=[1,3,5].map(/* Decode hexadecimal channels into normalised RGB. */ at=>Number.parseInt(colour.slice(at,at+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min;


  let h;

  if(max===rgb[0])h=(rgb[1]-rgb[2])/delta;else if(max===rgb[1])h=2+(rgb[2]-rgb[0])/delta;else h=4+(rgb[0]-rgb[1])/delta;

  h=(h*60+360)%360;
  assert.ok(h>=30&&h<330&&(h<195||h>255),`${colour}: reserved hue ${h}`);


  const linear=rgb.map(/* Linearise sRGB channels for actual contrast calculation. */ c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4),l=.2126*linear[0]+.7152*linear[1]+.0722*linear[2];

  assert.ok(1.05/(l+.05)>=4.5,`${colour}: insufficient initial contrast`);
 }


 for(const [n,colour] of [...assigned].reverse())assert.equal(contributorColour([n&255,n>>8,...Array(30).fill(0)],owner),colour);
});
