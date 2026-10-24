import {EditorSelection} from '@codemirror/state';
import {clickRange,gestureRange} from './selection.js';
import {codeRanges,mathExpressions} from './math.js';
import {parseTables} from './tables.js';

// Mouse presentation only; keyboard/Shift selection remains native.
export function sourceSelectionStyle(view,event){
 if(event.button!==0||event.altKey||event.shiftKey)return null;
 const snap=document.querySelector('#dragSnapping').checked,count=Math.min(5,Math.max(1,event.detail));
 if(!snap&&count===1)return null;
 let text=view.state.doc.toString(),protectedRanges=snap?[...codeRanges(text),...mathExpressions(text),...parseTables(text)]:[];
 let origin=view.posAtCoords({x:event.clientX,y:event.clientY}),original=view.state.selection;
 if(origin==null)return null;
 return {
  get(current,_extend,multiple){
   const position=view.posAtCoords({x:current.clientX,y:current.clientY},false)??origin;
   let range;
   if(position===origin){const unit=clickRange(text,origin,count);range={anchor:unit.from,head:unit.to};}
   else if(snap){
    const protectedPoint=p=>protectedRanges.some(r=>p>=r.from&&p<r.to);
    range=count===1&&(protectedPoint(origin)||protectedPoint(position))?{anchor:origin,head:position}:gestureRange(text,origin,position,count);
   }else{
    const first=clickRange(text,origin,count),last=clickRange(text,position,count);
    range=position>origin?{anchor:first.from,head:last.to}:{anchor:first.to,head:last.from};
   }
   const selected=EditorSelection.range(range.anchor,range.head);
   return multiple?original.addRange(selected):EditorSelection.create([selected]);
  },
  update(update){if(update.docChanged){origin=update.changes.mapPos(origin);original=original.map(update.changes);text=update.state.doc.toString();protectedRanges=snap?[...codeRanges(text),...mathExpressions(text),...parseTables(text)]:[];}}
 };
}
