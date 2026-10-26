// SPDX-License-Identifier: AGPL-3.0-only
// Exact owned source alongside CodeMirror's LF-only display coordinates.
import {Annotation,StateEffect,StateField,Transaction} from '@codemirror/state';
import {invertedEffects} from '@codemirror/commands';
import {EditorView} from '@codemirror/view';

export const editorProjection=source=>source.replace(/\r\n|\r/g,'\n');
export const exactInsertion=Annotation.define();
const restoreSource=StateEffect.define();
function scalarBoundary(text,offset){return offset>=0&&offset<=text.length&&!(offset>0&&offset<text.length&&/[\uD800-\uDBFF]/.test(text[offset-1])&&/[\uDC00-\uDFFF]/.test(text[offset]));}
function displayOffsets(source){
 const offsets=[0];for(let raw=0;raw<source.length;){raw+=source[raw]==='\r'&&source[raw+1]==='\n'?2:1;offsets.push(raw);}return offsets;
}
export function ownedSlice(source,before,from,to){
 return ownedRange(source,before,from,to).text;
}
export function ownedRange(source,before,from,to){
 if(editorProjection(source)!==before)throw Error('Stale owned-source mapping');
 if(from>to||!scalarBoundary(before,from)||!scalarBoundary(before,to))throw Error('Invalid owned-source range');
 const offsets=displayOffsets(source);return {from:offsets[from],to:offsets[to],text:source.slice(offsets[from],offsets[to])};
}
function insertedNewlines(source,at,text){
 // Enter/programmatic editor changes adopt the preceding source line's convention,
 // then the following convention, then LF. Existing source bytes are never changed.
 const before=[...source.slice(0,at).matchAll(/\r\n|\r|\n/g)].at(-1)?.[0];
 const after=source.slice(at).match(/\r\n|\r|\n/)?.[0];return text.replace(/\n/g,before??after??'\n');
}
export function applyOwnedChanges(source,before,changes,exact){
 if(editorProjection(source)!==before)throw Error('Stale owned-source mapping');
 const offsets=displayOffsets(source);let result='',last=0;
 if(exact&&changes.length!==1)throw Error('Ambiguous exact insertion');
 for(const change of changes){
  const {from,to,text}=change;
  if(!Number.isInteger(from)||!Number.isInteger(to)||from>to||!scalarBoundary(before,from)||!scalarBoundary(before,to)||from<last)throw Error('Invalid owned-source range');
  let insertion=insertedNewlines(source,offsets[from],text);
  if(exact){if(exact.from!==from||exact.to!==to||editorProjection(exact.source)!==text)throw Error('Mismatched exact insertion');insertion=exact.source;}
  if(!insertion.isWellFormed())throw Error('Invalid Unicode source');
  result+=source.slice(offsets[last],offsets[from])+insertion;last=to;
 }
 return result+source.slice(offsets[last]);
}
export const ownedSource=StateField.define({
 create:()=>{throw Error('Owned source must be initialized explicitly');},
 update(source,tr){
  const restored=tr.effects.filter(effect=>effect.is(restoreSource)).at(-1);
  if(restored){if(editorProjection(restored.value)!==tr.newDoc.toString())throw Error('Stale owned-source history');return restored.value;}
  if(!tr.docChanged)return source;
  const changes=[];tr.changes.iterChanges((from,to,_fromB,_toB,text)=>changes.push({from,to,text:text.toString()}));
  const result=applyOwnedChanges(source,tr.startState.doc.toString(),changes,tr.annotation(exactInsertion));
  if(editorProjection(result)!==tr.newDoc.toString())throw Error('Owned-source projection differs from editor');return result;
 }
});
export function ownedSourceExtension(source,onInvalid=()=>{}){
 if(typeof source!=='string'||!source.isWellFormed())throw Error('Invalid initial owned source');
 const copy=(event,view,cut)=>{
  const {from,to}=view.state.selection.main;if(from===to||!event.clipboardData)return false;
  event.preventDefault();event.clipboardData.setData('text/plain',ownedSlice(view.state.field(ownedSource),view.state.doc.toString(),from,to));
  if(cut&&!view.state.readOnly)view.dispatch({changes:{from,to},selection:{anchor:from},annotations:Transaction.userEvent.of('delete.cut')});return true;
 };
 return [ownedSource.init(()=>source),invertedEffects.of(tr=>tr.docChanged?[restoreSource.of(tr.startState.field(ownedSource))]:[]),EditorView.domEventHandlers({copy:(event,view)=>copy(event,view,false),cut:(event,view)=>copy(event,view,true),paste(event,view){
  if(view.state.readOnly||!event.clipboardData)return false;
  const raw=event.clipboardData.getData('text/plain');if(!raw)return false;
  event.preventDefault();if(!raw.isWellFormed()){onInvalid('Paste contains an invalid Unicode character.');return true;}
  const {from,to}=view.state.selection.main,text=editorProjection(raw);
  view.dispatch({changes:{from,to,insert:text},selection:{anchor:from+text.length},annotations:[Transaction.userEvent.of('input.paste'),exactInsertion.of({from,to,source:raw})]});return true;
 }})];
}
