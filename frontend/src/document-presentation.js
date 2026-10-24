import {markdownLanguage} from '@codemirror/lang-markdown';
import {markdownMarkerRanges} from './source-markers.js';
const cache=new WeakMap();
// Full source tree is independent of CodeMirror viewport/background parse progress.
export function documentPresentation(state){
 let model=cache.get(state.doc);if(model)return model;
 const tree=markdownLanguage.parser.parse(state.doc.toString()),headings=new Map(),gaps=new Set();
 tree.iterate({enter(node){
  const match=/^(?:ATXHeading([1-6])|SetextHeading([12]))$/.exec(node.name);
  const line=state.doc.lineAt(node.from);
  if(match)headings.set(line.from,Number(match[1]||match[2]));
  const block=match||['Paragraph','FencedCode','Table','Blockquote','BulletList','OrderedList'].includes(node.name);
  if(!block||line.number===1)return;
  // Existing blank source lines already provide space; never double it.
  if(state.doc.line(line.number-1).text.trim()&&node.from===line.from)gaps.add(line.from);
 }});
 model={tree,headings,gaps,markers:markdownMarkerRanges(state,tree)};cache.set(state.doc,model);return model;
}
export function presentationLineClasses(model,from){
 return [model.headings.has(from)?'cm-h'+model.headings.get(from):'',model.gaps.has(from)?'cm-block-gap':''].filter(Boolean).join(' ');
}
