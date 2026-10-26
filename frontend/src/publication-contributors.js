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
export function contributorColour(principal,currentHuman){
 if(!id(principal)||!id(currentHuman))throw Error('Invalid contributor colour identity');
 const scope=JSON.stringify(currentHuman);let state=palettes.get(scope);if(!state){state={colours:new Map([[scope,'#b84747']]),next:1};palettes.set(scope,state);}const key=JSON.stringify(principal);if(state.colours.has(key))return state.colours.get(key);
 let colour;do{if(state.next>0xffffff)throw Error('Contributor colour capacity exceeded');colour='#'+((state.next++*0x9e3779)&0xffffff).toString(16).padStart(6,'0');}while(colour==='#b84747'||colour==='#427dcc');state.colours.set(key,colour);return colour;
}
