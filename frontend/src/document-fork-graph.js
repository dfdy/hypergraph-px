/** Validate the bounded document/Fork projection before giving it to a renderer. */
export const identityKey=id=>id.map(n=>n.toString(16).padStart(2,'0')).join('');
const validId=id=>Array.isArray(id)&&id.length===32&&id.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
const counter=n=>Number.isSafeInteger(n)&&n>=0;
function endpoint(s){return s&&['document','node','revision','snapshot'].every(k=>validId(s[k]))&&Array.isArray(s.occurrence_path)&&s.occurrence_path.length===1&&s.occurrence_path.every(validId)&&counter(s.start_byte)&&counter(s.end_byte)&&s.end_byte>s.start_byte&&s.end_byte<=2*1024*1024;}
export function documentForkGraph(raw,requested){
 if(raw?.projection!=='document_forks'||!Array.isArray(raw.nodes)||raw.nodes.length!==requested.length||!requested.length||requested.length>16||new Set(requested).size!==requested.length||!Array.isArray(raw.edges)||raw.edges.length>raw.nodes.length||!counter(raw.inputs_outside_selection)||raw.inputs_outside_selection+raw.edges.length>raw.nodes.length)throw Error('Invalid graph projection');
 const nodes=new Map(),documents=new Map();
 for(const [i,n] of raw.nodes.entries()){
  if(!n||!['document','node','revision','snapshot'].every(k=>validId(n[k]))||identityKey(n.document)!==requested[i]||typeof n.title!=='string'||!n.title.isWellFormed()||new TextEncoder().encode(n.title).length>512)throw Error('Invalid graph node');
  const key=identityKey(n.node),document=identityKey(n.document);if(nodes.has(key)||documents.has(document))throw Error('Duplicate graph identity');nodes.set(key,n);documents.set(document,n);
 }
 const transformations=new Set(),outputs=new Set();
 for(const e of raw.edges){
  if(e?.kind!=='fork'||!['transformation','operation','actor','device'].every(k=>validId(e[k]))||e.inputs?.length!==1||e.outputs?.length!==1||!endpoint(e.inputs[0])||!endpoint(e.outputs[0]))throw Error('Invalid graph relationship');
  const input=e.inputs[0],output=e.outputs[0],from=identityKey(input.node),to=identityKey(output.node),event=identityKey(e.transformation);
  if(!nodes.has(from)||!nodes.has(to)||identityKey(nodes.get(from).document)!==identityKey(input.document)||identityKey(nodes.get(to).document)!==identityKey(output.document)||from===to||transformations.has(event)||outputs.has(to)||output.start_byte!==0||output.end_byte!==input.end_byte-input.start_byte)throw Error('Invalid graph incidence');
  transformations.add(event);outputs.add(to);
 }
 return structuredClone(raw);
}
