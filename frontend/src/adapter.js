/** Fixture-only boundary. All coordinates are UTF-16 within one local document owner.
 * No authorization, durable acknowledgements, canonical identities or HTTP API.
 */
export class FixtureAdapter {
 constructor(documents){this.docs=new Map(documents.map(d=>[d.id,{...d,sequence:0,acknowledged:0}]));this.clipboard=[];this.serial=0;this.pastes=[];}
 get(id){const d=this.docs.get(id);if(!d)throw new Error('Unknown fixture document');return {...d};}
 edit(id,source){const d=this.docs.get(id);if(!d)throw new Error('Unknown fixture document');d.source=source;return ++d.sequence;}
 async checkpoint(id,delay=350){const captured=this.get(id);await new Promise(r=>setTimeout(r,delay));const d=this.docs.get(id);d.acknowledged=Math.max(d.acknowledged,captured.sequence);return {document:id,sequence:captured.sequence,tabOnly:true};}
 capture(id,from,to){const d=this.get(id);if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<=from||to>d.source.length)throw new Error('Select a source range first');for(const p of [from,to]){const c=d.source.charCodeAt(p),prev=d.source.charCodeAt(p-1);if(c>=0xDC00&&c<=0xDFFF&&prev>=0xD800&&prev<=0xDBFF)throw new Error('Selection splits a Unicode character');}const found=this.clipboard.find(e=>e.document===id&&e.sequence===d.sequence&&e.from===from&&e.to===to);if(found)return found;const entry={id:`demo:clip:${++this.serial}`,document:id,title:d.title,sequence:d.sequence,from,to,text:d.source.slice(from,to)};this.clipboard.push(entry);return entry;}
 remove(id){this.clipboard=this.clipboard.filter(e=>e.id!==id);}
 forkPlan(ids){const entries=ids.map(id=>this.clipboard.find(e=>e.id===id));if(!entries.length||entries.some(e=>!e))throw new Error('Clipboard selection changed');return {id:`demo:paste:${++this.serial}`,entries:entries.map(e=>({...e})),text:entries.map(e=>e.text).join('\n\n')};}
 finishFork(plan,clear){this.pastes.push({id:plan.id,sources:plan.entries.map(e=>({document:e.document,sequence:e.sequence,from:e.from,to:e.to}))});if(clear){const ids=new Set(plan.entries.map(e=>e.id));this.clipboard=this.clipboard.filter(e=>!ids.has(e.id));}}
}
