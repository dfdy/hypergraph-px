import {markdownLanguage} from '@codemirror/lang-markdown';
import {markdownMarkerRanges} from './source-markers.js';
import {mathExpressions} from './math.js';
const cache=new WeakMap();
// Full source tree is independent of CodeMirror viewport/background parse progress.
export function documentPresentation(state){
 let model=cache.get(state.doc);if(model)return model;
 const source=state.doc.toString(),tree=markdownLanguage.parser.parse(source),headings=new Map(),gaps=new Set(),inline=[],links=[],hidden=[],math=mathExpressions(source);
 tree.iterate({enter(node){
  const match=/^(?:ATXHeading([1-6])|SetextHeading([12]))$/.exec(node.name);
  const line=state.doc.lineAt(node.from);
  if(match)headings.set(line.from,Number(match[1]||match[2]));
  const block=match||['Paragraph','FencedCode','Table','Blockquote','BulletList','OrderedList'].includes(node.name);
  if(block&&line.number!==1&&state.doc.line(line.number-1).text.trim()&&node.from===line.from)gaps.add(line.from);
  if(['InlineCode','FencedCode','CodeBlock','HTMLBlock'].includes(node.name)){
   if(node.name==='InlineCode')inline.push({from:node.from,to:node.to,className:'cm-inline-code'});
   return false;
  }
  if(math.some(range=>node.from>=range.from&&node.to<=range.to))return false;
  const className={StrongEmphasis:'cm-markdown-bold',Emphasis:'cm-markdown-italic',Strikethrough:'cm-markdown-strike'}[node.name];
  if(className)inline.push({from:node.from,to:node.to,className});
  if(node.name==='Escape'){
   let parent=node.node.parent;while(parent&&parent.name!=='Link')parent=parent.parent;
   if(parent)hidden.push({from:node.from,to:node.from+1});
  }
  if(node.name==='Link'){
   const marks=node.node.getChildren('LinkMark');
   if(marks.length>=2&&source[marks[0].from]==='['){
    const from=marks[0].to,to=marks[1].from;
    if(from<to){const url=node.node.getChild('URL');links.push({from,to,target:url?source.slice(url.from,url.to):null});inline.push({from,to,className:'cm-rendered-link'});hidden.push({from:node.from,to:from},{from:to,to:node.to});}
   }
  }
 }});
 model={tree,headings,gaps,inline,links,hidden,markers:markdownMarkerRanges(state,tree)};cache.set(state.doc,model);return model;
}
export function presentationLineClasses(model,from){
 return [model.headings.has(from)?'cm-h'+model.headings.get(from):'',model.gaps.has(from)?'cm-block-gap':''].filter(Boolean).join(' ');
}
