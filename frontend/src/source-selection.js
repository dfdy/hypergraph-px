/**
 * # Hypergraph PX — Mouse semantic-selection coordination
 *
 * Translate eligible mouse gestures into exact source selections while retaining
 * native keyboard and modified-selection behaviour.
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
 * Used by: Owned-source editing and presentation through the CodeMirror
 * mouse-selection extension.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 *
 * Boundary: Positions are editor UTF16 coordinates. Snapping avoids code,
 * mathematics and tables; mapping through later edits does not establish
 * persistent or multi-owner selection authority.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/source-selection.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 */

import {EditorSelection} from '@codemirror/state';
import {clickRange,gestureRange} from './selection.js';
import {codeRanges,mathExpressions} from './math.js';
import {parseTables} from './tables.js';

// Mouse presentation only; keyboard/Shift selection remains native.
/** Create a mouse-selection gesture only for supported unmodified primary-button actions. */
export function sourceSelectionStyle(view,event){
 if(event.button!==0||event.altKey||event.shiftKey)return null;


 const snap=document.querySelector('#dragSnapping').checked,count=Math.min(5,Math.max(1,event.detail));


 if(!snap&&count===1)return null;


 let text=view.state.doc.toString(),protectedRanges=snap?[...codeRanges(text),...mathExpressions(text),...parseTables(text)]:[];


 let origin=view.posAtCoords({x:event.clientX,y:event.clientY}),original=view.state.selection;


 if(origin==null)return null;


 // In snapping mode a new drag redraws selection, rather than starting native text drag/drop.
 if(snap&&count===1&&!event.metaKey&&!event.ctrlKey&&!original.main.empty)view.dispatch({selection:{anchor:origin}});


 return {
  /** Compute the current directional selection, preserving existing multiple selections when requested. */
  get(current,_extend,multiple){
   const position=view.posAtCoords({x:current.clientX,y:current.clientY},false)??origin;


   let range;


   if(position===origin){const unit=clickRange(text,origin,count);

   range={anchor:unit.from,head:unit.to};}
   else if(snap){
    /** Check whether an endpoint lies in code, math or table source that should not be semantically snapped. */
    const protectedPoint=p=>protectedRanges.some(/* Test containment in one protected source interval. */ r=>p>=r.from&&p<r.to);


    range=count===1&&(protectedPoint(origin)||protectedPoint(position))?{anchor:origin,head:position}:gestureRange(text,origin,position,count);
   }else{
    const first=clickRange(text,origin,count),last=clickRange(text,position,count);


    range=position>origin?{anchor:first.from,head:last.to}:{anchor:first.to,head:last.from};
   }


   const selected=EditorSelection.range(range.anchor,range.head);


   return multiple?original.addRange(selected):EditorSelection.create([selected]);
  },
  /** Map the gesture origin and prior selection through document edits and refresh protected ranges. */
  update(update){if(update.docChanged){origin=update.changes.mapPos(origin);original=original.map(update.changes);text=update.state.doc.toString();protectedRanges=snap?[...codeRanges(text),...mathExpressions(text),...parseTables(text)]:[];}}
 };
}
