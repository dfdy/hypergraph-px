/**
 * # Hypergraph PX — Synthetic display attribution spans
 *
 * Maintain source-aligned tentative attribution spans and reversible editor
 * decorations for the demonstration interface.
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
 * Used by: Owned-source editing and presentation, relationship capture and source
 * inspection in the application shell.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Provenance and history contract][spec-2]
 * - [Exact text and anchors][spec-3]
 *
 * Boundary: These synthetic/tentative display labels are neither authentication
 * nor verified authorship. Replacement spans are checked against current UTF16
 * document bounds.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/authorship.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/provenance-model.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

import {StateField,StateEffect} from '@codemirror/state';
import {EditorView,Decoration} from '@codemirror/view';
import {invertedEffects} from '@codemirror/commands';

/** Identify the explicitly synthetic local human used for tentative display attribution. */
export const currentAuthor=Object.freeze({id:'demo:human',name:'Local Writer · demo',kind:'human',source:'Synthetic fixture / tentative local edits'});

/** Identify the explicitly synthetic, disconnected machine contributor in preview attribution. */
export const currentAgent=Object.freeze({id:'demo:agent',name:'Research Assistant · demo',kind:'agent',source:'Synthetic contributor; no model connected'});

const unknownAuthor=Object.freeze({id:'unknown',name:'Unknown author',source:'Attribution unavailable'});

/** Choose a stable display hue for a known synthetic contributor identity. */
export function authorHue(id){return id===currentAuthor.id?0:id===currentAgent.id?215:id==='demo:reviewer'?140:280}

/** Attribute a nonempty synthetic sample to its initial demonstration writer. */
export function sampleAuthorship(text){return text.length?[{from:0,to:text.length,author:currentAuthor}]:[]}

/** Find the span containing a clamped UTF16 position, falling back to unknown attribution. */
export function authorAt(spans,pos,length){const p=Math.max(0,Math.min(pos,Math.max(0,length-1)));

 return spans.find(/* Match the source span containing the requested display position. */ s=>p>=s.from&&p<s.to)?.author??unknownAuthor}

/** Discard empty spans and coalesce adjacent spans only when their author identity agrees. */
export function mergeSpans(spans){const sorted=spans.filter(/* Keep only attribution spans with a nonempty source interval. */ s=>s.to>s.from).sort(/* Order spans by their starting UTF16 coordinate before adjacent-span coalescing. */ (a,b)=>a.from-b.from),result=[];

 for(const s of sorted){const last=result.at(-1);

  if(last&&last.to===s.from&&last.author.id===s.author.id)last.to=s.to;else result.push({...s})}

 return result}

/** Carry attribution over unchanged source and assign inserted ranges to the current tentative editor. */
export function mapAuthorship(spans,changes,author=currentAuthor){
 const result=[];


 changes.iterGaps(/* Intersect prior attribution with one unchanged gap and translate it into the new document coordinates. */ (oldStart,newStart,length)=>{for(const s of spans){const from=Math.max(oldStart,s.from),to=Math.min(oldStart+length,s.to);

   if(from<to)result.push({from:newStart+from-oldStart,to:newStart+to-oldStart,author:s.author})}});
 changes.iterChanges(/* Attribute each newly inserted source interval to the supplied current editor. */ (_from,_to,fromB,toB)=>{if(fromB<toB)result.push({from:fromB,to:toB,author})});


 return mergeSpans(result);
}

// Adapter-only display attribution. This is not an authentication/permission API.
/** Request replacement of display attribution only; this effect grants no authority. */
export const replaceAuthorship=StateEffect.define();

/** Track validated attribution spans alongside document changes and presentation decorations. */
export const authorshipField=StateField.define({
 /** Seed initial attribution for the current nonempty editor document. */
 create(state){return state.doc.length?[{from:0,to:state.doc.length,author:currentAuthor}]:[]},
 /** Map attribution through edits and reject malformed or overlapping explicit replacement spans. */
 update(spans,tr){let result=tr.docChanged?mapAuthorship(spans,tr.changes):spans;

 for(const e of tr.effects)if(e.is(replaceAuthorship)){const next=e.value;

  if(!Array.isArray(next)||next.some(/* Detect invalid coordinates, missing author identity or out-of-order replacement spans. */ (s,i)=>!Number.isInteger(s.from)||!Number.isInteger(s.to)||s.from<0||s.to>tr.newDoc.length||s.from>=s.to||!s.author?.id||!s.author?.name||(i>0&&s.from<next[i-1].to)))throw new Error('Invalid display attribution projection');

  result=mergeSpans(next)}

 return result},
 provide:/* Expose attribution spans as CodeMirror text decorations. */ field=>EditorView.decorations.from(field,/* Build the decoration set from the current field value. */ spans=>Decoration.set(spans.map(/* Mark one exact span with its synthetic identity and display hue. */ s=>Decoration.mark({class:'cm-author-text',attributes:{'data-author-id':s.author.id,style:`--author-hue:${authorHue(s.author.id,s.author.kind)}`}}).range(s.from,s.to)),true))
});

/** Read attribution at an editor position from the validated state field. */
export function getAuthorAt(state,pos){return authorAt(state.field(authorshipField),pos,state.doc.length)}

/** Retain the previous attribution state as an inverse effect for exact editor undo. */
export const authorshipHistory=invertedEffects.of(/* Record the previous attribution field when a text or replacement-attribution transaction must be undoable. */ tr=>tr.docChanged||tr.effects.some(/* Recognize explicit attribution replacement effects when deciding whether to retain inverse history. */ e=>e.is(replaceAuthorship))?[replaceAuthorship.of(tr.startState.field(authorshipField))]:[]);
