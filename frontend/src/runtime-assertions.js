/** Explicit retrospective assertion views; no editor transactions or browser persistence. */
import {assertionProperties} from './assertion-properties.js';
const id=v=>Array.isArray(v)&&v.length===32&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=255);
const same=(a,b)=>id(a)&&id(b)&&a.every((n,i)=>n===b[i]);
const count=n=>Number.isSafeInteger(n)&&n>=0;
const statuses=['proposed','accepted','rejected','superseded'];
const freeze=v=>{for(const child of Object.values(v))if(child&&typeof child==='object')freeze(child);return Object.freeze(v);};
export function validAssertionSource(s){return s&&['document','node','snapshot','revision'].every(k=>id(s[k]))&&Array.isArray(s.occurrence_path)&&s.occurrence_path.length===1&&s.occurrence_path.every(id)&&count(s.start_byte)&&count(s.end_byte)&&s.end_byte>s.start_byte&&s.end_byte<=2*1024*1024;}
export function validAssertionEntry(entry){
 const r=entry?.record,d=entry?.definition?.definition;
 if(!id(entry?.revision)||!count(entry?.generation)||!r||!['node','proposer','actor','device','operation','definition'].every(k=>id(r[k]))||r.parent!==null&&!id(r.parent)||!statuses.includes(r.status)||!Array.isArray(r.participants)||r.participants.length<2||r.participants.length>8||!id(entry.definition?.version)||!d||typeof d.predicate_id!=='string'||d.registry_version!==1||typeof d.label!=='string'||!d.label.isWellFormed()||typeof d.description!=='string'||!d.description.isWellFormed()||!Array.isArray(d.context_fields)||d.context_fields.some(v=>typeof v!=='string')||typeof d.symmetric!=='boolean'||!['binary','role_labelled'].includes(d.participant_mode)||!Array.isArray(d.roles)||!d.roles.length||d.roles.length>8||d.roles.some(role=>typeof role.id!=='string'||!role.id||typeof role.label!=='string'))return false;
 const roles=new Set(d.roles.map(role=>role.id));if(roles.size!==d.roles.length||r.participants.some(p=>!roles.has(p.role)||!validAssertionSource(p.source)||same(p.source.node,r.node))||d.roles.some(role=>!r.participants.some(p=>p.role===role.id)))return false;
 if(d.participant_mode==='binary'&&(r.participants.length!==2||r.participants[0].role!=='source'||r.participants[1].role!=='target'))return false;
 try{assertionProperties(r.properties);}catch{return false;}return true;
}
export class RuntimeAssertions{
 constructor(request,operation){this.request=request;this.operation=operation;this.pending=null;}
 async page(document,snapshot,generation=null,offset=0,limit=8){
  if(!id(document)||!id(snapshot)||generation!==null&&!count(generation)||!count(offset)||offset>1024||!Number.isInteger(limit)||limit<1||limit>8||offset>0&&generation===null)throw Error('Invalid assertion page request');
  const body=freeze(structuredClone({document,snapshot,generation,offset,limit})),page=await this.request('assertions',body);
  if(!same(page?.document,body.document)||!same(page?.snapshot,body.snapshot)||page.text_snapshot_scope!=='semantic_assertions_excluded'||!count(page.generation)||generation!==null&&page.generation!==generation||!count(page.total)||page.total>1024||!Array.isArray(page.entries)||page.entries.length!==Math.min(limit,page.total-offset)||page.entries.some(entry=>!validAssertionEntry(entry))||page.next!==(offset+page.entries.length<page.total?offset+page.entries.length:null))throw Error('Invalid retrospective assertion page');
  const seen=new Set();for(const entry of page.entries){const key=JSON.stringify(entry.record.node);if(seen.has(key))throw Error('Duplicate assertion identity');seen.add(key);}return structuredClone(page);
 }
 async revision(node,revision){
  if(!id(node)||!id(revision))throw Error('Invalid assertion revision identity');const body=freeze(structuredClone({node,revision})),result=await this.request('assertion/revision',body);
  if(result?.text_snapshot_scope!=='semantic_assertions_excluded'||!validAssertionEntry(result.entry)||!same(result.entry.record.node,body.node)||!same(result.entry.revision,body.revision))throw Error('Invalid exact assertion revision response');return structuredClone(result.entry);
 }
 async mutate(mutation){
  if(this.pending&&JSON.stringify(this.pending.request.mutation)!==JSON.stringify(mutation))throw Error('Retry the pending assertion operation before another change');
  if(!this.pending)this.pending=freeze(structuredClone({operation:this.operation(),request:{command:'assertion',mutation}}));return this.retry();
 }
 async retry(){
  if(!this.pending)throw Error('No pending assertion operation');const frozen=this.pending;let receipt;
  try{for(let attempt=0;attempt<2;attempt++){try{receipt=await this.request('commands',frozen);break;}catch(error){if(error.status||attempt===1)throw error;}}}
  catch(error){if(error.status>=400&&error.status<500)this.pending=null;throw error;}
  const state=receipt?.outcome?.state,m=frozen.request.mutation;
  if(!same(receipt?.operation,frozen.operation)||receipt?.outcome?.result!=='assertion'||!id(state?.node)||!id(state.revision)||!count(state.generation)||!statuses.includes(state.status)||typeof state.deduplicated!=='boolean')throw Error('Mismatched assertion receipt');
  if(m.action==='review'&&(!same(state.node,m.node)||state.generation!==m.generation+1||state.status!==m.status||state.deduplicated||same(state.revision,m.revision)))throw Error('Mismatched assertion review receipt');
  if(m.action==='create'&&(!state.deduplicated&&(state.generation!==0||state.status!=='proposed')||m.participants.some(p=>same(p.source.node,state.node))))throw Error('Mismatched assertion creation receipt');
  this.pending=null;return structuredClone(state);
 }
}
