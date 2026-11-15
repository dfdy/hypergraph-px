/**
 * # Hypergraph PX — Snapshot-bound publisher evidence validation
 *
 * Validate bounded committed-publication contributor pages and assign scoped,
 * contrast-aware badge colours to recorded principals.
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
 * Used by: Annotations and provenance panels through runtime contributor evidence
 * views.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [Provenance and history contract][spec-3]
 *
 * Boundary: Publisher evidence is not session presence or original authorship. The
 * view remains explicitly incomplete for other contribution families; badge
 * colours are display assignments, not identity or authority.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/publication-contributors.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/05-domain/provenance-model.md
 */

/** Validate the supported32-byte opaque identity representation. */
const id=v=>Array.isArray(v)&&v.length===32&&v.every(/* Require each identity value to be an integer byte. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

/** Compare two validated opaque identities byte for byte. */
const same=(a,b)=>id(a)&&id(b)&&a.every(/* Compare corresponding principal/snapshot identity bytes. */ (n,i)=>n===b[i]);

/** Accept only null or a bounded nonempty opaque continuation-token byte array. */
const validCursor=v=>v===null||Array.isArray(v)&&v.length>0&&v.length<=4096&&v.every(/* Validate one continuation-token byte value. */ n=>Number.isInteger(n)&&n>=0&&n<=255);

const excluded=['original_text_authorship','semantic_reviews','comments','interaction_records'];

/** Read a captured snapshot's publication page and validate its identity, exclusions, publisher roles and continuation scope. */
export async function publicationContributors(request,document,snapshot,cursor=null,limit=16){
 if(!id(document)||!id(snapshot)||!validCursor(cursor)||!Number.isInteger(limit)||limit<1||limit>32)throw Error('Invalid publication contributor request');


 const body=structuredClone({document,snapshot,cursor,limit}),expected=structuredClone(body),page=await request('contributors/publications',body);


 if(page?.projection!=='text_publication_contributors'||!same(page.document,expected.document)||!same(page.snapshot,expected.snapshot)||!id(page.current_human?.principal)||typeof page.current_human.label!=='string'||!page.current_human.label.isWellFormed()||new TextEncoder().encode(page.current_human.label).length>4096||page.current_agent!==null||page.complete_contributors!==false||!validCursor(page.next)||page.complete_text_publications!==(page.next===null)||JSON.stringify(page.excluded_families)!==JSON.stringify(excluded)||!Array.isArray(page.publications)||!page.publications.length||page.publications.length>limit)throw Error('Invalid publication contributor page');


 const seen=new Set();

 for(const entry of page.publications){if(!['principal','revision','snapshot','operation'].every(/* Validate each mandatory identity field on one recorded publication. */ k=>id(entry[k]))||entry.role!=='publisher'||seen.has(JSON.stringify(entry.revision)))throw Error('Invalid publication evidence');

  seen.add(JSON.stringify(entry.revision));}


 if(cursor===null&&!same(page.publications[0].snapshot,expected.snapshot))throw Error('Contributor evidence does not start at the requested snapshot');

 return structuredClone(page);
}

const palettes=new Map();

/** Reject badge colours outside reserved-hue and luminance/contrast constraints. */
function permittedBadgeColour(value){
 const rgb=[value>>16&255,value>>8&255,value&255].map(/* Convert an RGB byte channel to the normalized range used for hue/contrast calculations. */ n=>n/255),maximum=Math.max(...rgb),minimum=Math.min(...rgb),chroma=maximum-minimum;


 if(chroma<.25)return false;


 const [r,g,b]=rgb,hue=((maximum===r?(g-b)/chroma:maximum===g?(b-r)/chroma+2:(r-g)/chroma+4)*60+360)%360;


 // Keep the current-human red and current-agent blue hue ranges distinct.
 if(hue<30||hue>=330||hue>=195&&hue<=255)return false;


 const linear=rgb.map(/* Convert one normalized sRGB channel to linear light for luminance calculation. */ n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4),luminance=.2126*linear[0]+.7152*linear[1]+.0722*linear[2];


 // White initials retain >=4.5:1 contrast, with a visible badge in both themes.
 return luminance>=.14&&luminance<=.18;
}

/** Assign a stable collision-free permitted colour within one current-human display scope. */
export function contributorColour(principal,currentHuman){
 if(!id(principal)||!id(currentHuman))throw Error('Invalid contributor colour identity');


 const scope=JSON.stringify(currentHuman);

 let state=palettes.get(scope);

 if(!state){state={colours:new Map([[scope,'#b84747']]),next:1};palettes.set(scope,state);}

 const key=JSON.stringify(principal);

 if(state.colours.has(key))return state.colours.get(key);


 let value;

 do{if(state.next>0xffffff)throw Error('Contributor colour capacity exceeded');

  value=(state.next++*0x9e3779)&0xffffff;}while(!permittedBadgeColour(value));

 const colour='#'+value.toString(16).padStart(6,'0');

 state.colours.set(key,colour);

 return colour;
}
