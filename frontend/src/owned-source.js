// SPDX-License-Identifier: AGPL-3.0-only
/**
 * # Hypergraph PX — Exact owned-source editing
 *
 * Preserves original text independently of CodeMirror’s LF-only display so
 * clipboard operations, edits and undo retain exact newline forms and checked
 * source ownership.
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
 * Used by: Owned-source editing and presentation — editor setup, clipboard, undo,
 * formatting, table editing and exact runtime relation projection.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 *
 * Boundary: Coordinates here are raw or display UTF16 as explicitly mapped, not
 * persistent UTF8 bytes. Stale projections and surrogate-splitting cuts are
 * rejected before edits are applied.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/owned-source.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 */

import {Annotation,StateEffect,StateField,Transaction} from '@codemirror/state';
import {invertedEffects} from '@codemirror/commands';
import {EditorView} from '@codemirror/view';

/** Return the LF display projection; never use this as the saved source. */
/** Project newline forms for display only; the result must not replace saved owned text. */
export const editorProjection=source=>source.replace(/\r\n|\r/g,'\n');

/** Attach original pasted text and its display range to one transaction. */
export const exactInsertion=Annotation.define();

const restoreSource=StateEffect.define();

// A legal UTF16 cut cannot separate the two code units of a supplementary scalar.
/** Check that a UTF16 cut neither leaves the string nor splits a supplementary Unicode scalar. */
function scalarBoundary(text,offset){return offset>=0&&offset<=text.length&&!(offset>0&&offset<text.length&&/[\uD800-\uDBFF]/.test(text[offset-1])&&/[\uDC00-\uDFFF]/.test(text[offset]));}

// Map each LF-display cut back to a raw UTF16 cut. CRLF occupies two source
// units but one display unit; all other code units retain their individual cuts.
/** Map each display cut to its original raw UTF16 cut, accounting for collapsed CRLF pairs. */
function displayOffsets(source){
 const offsets=[0];

 for(let raw=0;raw<source.length;){raw+=source[raw]==='\r'&&source[raw+1]==='\n'?2:1;offsets.push(raw);}

 return offsets;
}

/** Read original text for a checked range in the exact pre-edit display. */
/** Read exact original text through the same checked range mapping used by edits. */
export function ownedSlice(source,before,from,to){
 return ownedRange(source,before,from,to).text;
}

/**
 * Return raw UTF16 offsets and exact text for display offsets [from,to).
 * Reject a stale projection, reversed range or a cut through a surrogate pair;
 * callers must not reuse coordinates from another buffer with equal-looking text.
 */
/** Validate source ownership and display cuts before returning exact raw offsets and text. */
export function ownedRange(source,before,from,to){
 if(editorProjection(source)!==before)throw Error('Stale owned-source mapping');


 if(from>to||!scalarBoundary(before,from)||!scalarBoundary(before,to))throw Error('Invalid owned-source range');


 const offsets=displayOffsets(source);

 return {from:offsets[from],to:offsets[to],text:source.slice(offsets[from],offsets[to])};
}

/** Choose neighbouring newline conventions for new ordinary line breaks without rewriting existing source. */
function insertedNewlines(source,at,text){
 // Enter/programmatic editor changes adopt the preceding source line's convention,
 // then the following convention, then LF. Existing source bytes are never changed.
 const before=[...source.slice(0,at).matchAll(/\r\n|\r|\n/g)].at(-1)?.[0];


 const after=source.slice(at).match(/\r\n|\r|\n/)?.[0];

 return text.replace(/\n/g,before??after??'\n');
}

/**
 * Apply ordered, nonoverlapping display-coordinate changes to original source.
 * New ordinary line breaks follow local source conventions; an exact insertion
 * instead supplies verified original text for a single matching change. Reject
 * stale, overlapping, malformed-Unicode or mismatched input before returning text.
 * Unchanged source spans are copied directly, preserving their original bytes
 * when the resulting well-formed string is subsequently encoded as UTF8.
 */
/** Apply validated nonoverlapping display edits to exact original source, preserving untouched spans. */
export function applyOwnedChanges(source,before,changes,exact){
 if(editorProjection(source)!==before)throw Error('Stale owned-source mapping');


 const offsets=displayOffsets(source);

 let result='',last=0;


 if(exact&&changes.length!==1)throw Error('Ambiguous exact insertion');


 for(const change of changes){
  const {from,to,text}=change;


  if(!Number.isInteger(from)||!Number.isInteger(to)||from>to||!scalarBoundary(before,from)||!scalarBoundary(before,to)||from<last)throw Error('Invalid owned-source range');


  let insertion=insertedNewlines(source,offsets[from],text);


  if(exact){if(exact.from!==from||exact.to!==to||editorProjection(exact.source)!==text)throw Error('Mismatched exact insertion');

   insertion=exact.source;}


  if(!insertion.isWellFormed())throw Error('Invalid Unicode source');


  result+=source.slice(offsets[last],offsets[from])+insertion;last=to;
 }


 return result+source.slice(offsets[last]);
}

/**
 * CodeMirror field storing the exact owned string independently of its display.
 * Undo restores the earlier exact string through an inverse effect. Each update
 * verifies that the resulting projection still equals the editor document.
 */
export const ownedSource=StateField.define({
 create:/* Reject implicit field creation so callers must supply the exact owned source. */ ()=>{throw Error('Owned source must be initialized explicitly');},
 /** Restore exact undo source or apply checked changes and verify the resulting display projection. */
 update(source,tr){
  const restored=tr.effects.filter(/* Select only source-restoration effects from this transaction. */ effect=>effect.is(restoreSource)).at(-1);


  if(restored){if(editorProjection(restored.value)!==tr.newDoc.toString())throw Error('Stale owned-source history');

  return restored.value;}


  if(!tr.docChanged)return source;


  const changes=[];

 tr.changes.iterChanges(/* Collect ordered editor changes in their original display coordinate space. */ (from,to,_fromB,_toB,text)=>changes.push({from,to,text:text.toString()}));


  const result=applyOwnedChanges(source,tr.startState.doc.toString(),changes,tr.annotation(exactInsertion));


  if(editorProjection(result)!==tr.newDoc.toString())throw Error('Owned-source projection differs from editor');

 return result;
 }
});

/**
 * Install explicit source initialization, exact-text undo and clipboard handlers.
 * Copy/cut uses the owned slice. Paste validates raw Unicode, projects only for
 * display and annotates the transaction with original text. Invalid paste reports
 * through onInvalid without dispatch; read-only views retain native handling.
 */
/** Install exact source initialization, inverse undo effects and source-preserving clipboard handlers. */
export function ownedSourceExtension(source,onInvalid=/* Allow callers to omit a user-facing invalid-paste reporter. */ ()=>{}){
 if(typeof source!=='string'||!source.isWellFormed())throw Error('Invalid initial owned source');


 /** Copy the exact owned selection and perform a checked deletion only for writable cuts. */
 const copy=(event,view,cut)=>{
  const {from,to}=view.state.selection.main;

  if(from===to||!event.clipboardData)return false;


  event.preventDefault();event.clipboardData.setData('text/plain',ownedSlice(view.state.field(ownedSource),view.state.doc.toString(),from,to));


  if(cut&&!view.state.readOnly)view.dispatch({changes:{from,to},selection:{anchor:from},annotations:Transaction.userEvent.of('delete.cut')});

  return true;
 };


 return [ownedSource.init(/* Initialize this editor with the caller’s exact original string. */ ()=>source),invertedEffects.of(/* Retain pre-edit owned source as the inverse effect for text-changing transactions. */ tr=>tr.docChanged?[restoreSource.of(tr.startState.field(ownedSource))]:[]),EditorView.domEventHandlers({copy:/* Route copy events through exact-source clipboard handling. */ (event,view)=>copy(event,view,false),cut:/* Route cut events through exact-source clipboard handling with deletion enabled. */ (event,view)=>copy(event,view,true),/* Validate pasted Unicode and attach its original text while inserting only the display projection. */ paste(event,view){
  if(view.state.readOnly||!event.clipboardData)return false;


  const raw=event.clipboardData.getData('text/plain');

  if(!raw)return false;


  event.preventDefault();

  if(!raw.isWellFormed()){onInvalid('Paste contains an invalid Unicode character.');

   return true;}


  const {from,to}=view.state.selection.main,text=editorProjection(raw);


  view.dispatch({changes:{from,to,insert:text},selection:{anchor:from+text.length},annotations:[Transaction.userEvent.of('input.paste'),exactInsertion.of({from,to,source:raw})]});

  return true;
 }})];
}
