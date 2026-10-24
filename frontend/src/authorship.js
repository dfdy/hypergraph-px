import {StateField,StateEffect} from '@codemirror/state';
import {EditorView,Decoration} from '@codemirror/view';
import {invertedEffects} from '@codemirror/commands';
export const currentAuthor=Object.freeze({id:'demo:human',name:'Local Writer · demo',kind:'human',source:'Synthetic fixture / tentative local edits'});
export const currentAgent=Object.freeze({id:'demo:agent',name:'Research Assistant · demo',kind:'agent',source:'Synthetic contributor; no model connected'});
const unknownAuthor=Object.freeze({id:'unknown',name:'Unknown author',source:'Attribution unavailable'});
export function authorHue(id){return id===currentAuthor.id?0:id===currentAgent.id?215:id==='demo:reviewer'?140:280}
export function sampleAuthorship(text){return text.length?[{from:0,to:text.length,author:currentAuthor}]:[]}
export function authorAt(spans,pos,length){const p=Math.max(0,Math.min(pos,Math.max(0,length-1)));return spans.find(s=>p>=s.from&&p<s.to)?.author??unknownAuthor}
export function mergeSpans(spans){const sorted=spans.filter(s=>s.to>s.from).sort((a,b)=>a.from-b.from),result=[];for(const s of sorted){const last=result.at(-1);if(last&&last.to===s.from&&last.author.id===s.author.id)last.to=s.to;else result.push({...s})}return result}
export function mapAuthorship(spans,changes,author=currentAuthor){
 const result=[];
 changes.iterGaps((oldStart,newStart,length)=>{for(const s of spans){const from=Math.max(oldStart,s.from),to=Math.min(oldStart+length,s.to);if(from<to)result.push({from:newStart+from-oldStart,to:newStart+to-oldStart,author:s.author})}});
 changes.iterChanges((_from,_to,fromB,toB)=>{if(fromB<toB)result.push({from:fromB,to:toB,author})});
 return mergeSpans(result);
}
// Adapter-only display attribution. This is not an authentication/permission API.
export const replaceAuthorship=StateEffect.define();
export const authorshipField=StateField.define({
 create(state){return state.doc.length?[{from:0,to:state.doc.length,author:currentAuthor}]:[]},
 update(spans,tr){let result=tr.docChanged?mapAuthorship(spans,tr.changes):spans;for(const e of tr.effects)if(e.is(replaceAuthorship)){const next=e.value;if(!Array.isArray(next)||next.some((s,i)=>!Number.isInteger(s.from)||!Number.isInteger(s.to)||s.from<0||s.to>tr.newDoc.length||s.from>=s.to||!s.author?.id||!s.author?.name||(i>0&&s.from<next[i-1].to)))throw new Error('Invalid display attribution projection');result=mergeSpans(next)}return result},
 provide:field=>EditorView.decorations.from(field,spans=>Decoration.set(spans.map(s=>Decoration.mark({class:'cm-author-text',attributes:{'data-author-id':s.author.id,style:`--author-hue:${authorHue(s.author.id,s.author.kind)}`}}).range(s.from,s.to)),true))
});
export function getAuthorAt(state,pos){return authorAt(state.field(authorshipField),pos,state.doc.length)}

export const authorshipHistory=invertedEffects.of(tr=>tr.docChanged||tr.effects.some(e=>e.is(replaceAuthorship))?[replaceAuthorship.of(tr.startState.field(authorshipField))]:[]);
