/** Authenticated, snapshot-bound publication evidence, never session presence. */
const id=v=>Array.isArray(v)&&v.length===32&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
const same=(a,b)=>id(a)&&id(b)&&a.every((n,i)=>n===b[i]);
const validCursor=v=>v===null||Array.isArray(v)&&v.length>0&&v.length<=4096&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
const excluded=['original_text_authorship','semantic_reviews','comments','interaction_records'];
export async function publicationContributors(request,document,snapshot,cursor=null,limit=16){
 if(!id(document)||!id(snapshot)||!validCursor(cursor)||!Number.isInteger(limit)||limit<1||limit>32)throw Error('Invalid publication contributor request');
 const body=structuredClone({document,snapshot,cursor,limit}),expected=structuredClone(body),page=await request('contributors/publications',body);
 if(page?.projection!=='text_publication_contributors'||!same(page.document,expected.document)||!same(page.snapshot,expected.snapshot)||!id(page.current_human?.principal)||typeof page.current_human.label!=='string'||!page.current_human.label.isWellFormed()||new TextEncoder().encode(page.current_human.label).length>4096||page.current_agent!==null||page.complete_contributors!==false||!validCursor(page.next)||page.complete_text_publications!==(page.next===null)||JSON.stringify(page.excluded_families)!==JSON.stringify(excluded)||!Array.isArray(page.publications)||!page.publications.length||page.publications.length>limit)throw Error('Invalid publication contributor page');
 const seen=new Set();for(const entry of page.publications){if(!['principal','revision','snapshot','operation'].every(k=>id(entry[k]))||entry.role!=='publisher'||seen.has(JSON.stringify(entry.revision)))throw Error('Invalid publication evidence');seen.add(JSON.stringify(entry.revision));}
 if(cursor===null&&!same(page.publications[0].snapshot,expected.snapshot))throw Error('Contributor evidence does not start at the requested snapshot');return structuredClone(page);
}
const palettes=new Map();
function permittedBadgeColour(value){
 const rgb=[value>>16&255,value>>8&255,value&255].map(n=>n/255),maximum=Math.max(...rgb),minimum=Math.min(...rgb),chroma=maximum-minimum;
 if(chroma<.25)return false;
 const [r,g,b]=rgb,hue=((maximum===r?(g-b)/chroma:maximum===g?(b-r)/chroma+2:(r-g)/chroma+4)*60+360)%360;
 // Keep the current-human red and current-agent blue hue ranges distinct.
 if(hue<30||hue>=330||hue>=195&&hue<=255)return false;
 const linear=rgb.map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4),luminance=.2126*linear[0]+.7152*linear[1]+.0722*linear[2];
 // White initials retain >=4.5:1 contrast, with a visible badge in both themes.
 return luminance>=.14&&luminance<=.18;
}
export function contributorColour(principal,currentHuman){
 if(!id(principal)||!id(currentHuman))throw Error('Invalid contributor colour identity');
 const scope=JSON.stringify(currentHuman);let state=palettes.get(scope);if(!state){state={colours:new Map([[scope,'#b84747']]),next:1};palettes.set(scope,state);}const key=JSON.stringify(principal);if(state.colours.has(key))return state.colours.get(key);
 let value;do{if(state.next>0xffffff)throw Error('Contributor colour capacity exceeded');value=(state.next++*0x9e3779)&0xffffff;}while(!permittedBadgeColour(value));const colour='#'+value.toString(16).padStart(6,'0');state.colours.set(key,colour);return colour;
}
