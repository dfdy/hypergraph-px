/**
 * # Hypergraph PX — Derived Markdown presentation model
 *
 * Parse the full document independently of viewport progress and cache heading,
 * gap, inline-style, link and hidden-syntax projections.
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
 * Used by: Owned-source editing and presentation, source markers, inline rendering
 * and navigation previews.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 *
 * Boundary: The WeakMap cache is derived from immutable editor document objects;
 * it is not durable recovery evidence. Presentation never changes source bytes or
 * interprets displayed formatting as proof.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/document-presentation.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 */

import {markdownLanguage} from '@codemirror/lang-markdown';
import {markdownMarkerRanges} from './source-markers.js';
import {mathExpressions} from './math.js';

const cache=new WeakMap();

// Full source tree is independent of CodeMirror viewport/background parse progress.
/** Build or reuse the complete document's derived Markdown presentation and source-marker ranges. */
export function documentPresentation(state){
 let model=cache.get(state.doc);

 if(model)return model;


 const source=state.doc.toString(),tree=markdownLanguage.parser.parse(source),headings=new Map(),gaps=new Set(),inline=[],links=[],hidden=[],math=mathExpressions(source);


 tree.iterate({/* Collect supported presentation spans while excluding code and mathematics from conflicting inline interpretations. */ enter(node){
  const match=/^(?:ATXHeading([1-6])|SetextHeading([12]))$/.exec(node.name);


  const line=state.doc.lineAt(node.from);


  if(match)headings.set(line.from,Number(match[1]||match[2]));


  const block=match||['Paragraph','FencedCode','Table','Blockquote','BulletList','OrderedList'].includes(node.name);


  if(block&&line.number!==1&&state.doc.line(line.number-1).text.trim()&&node.from===line.from)gaps.add(line.from);


  if(['InlineCode','FencedCode','CodeBlock','HTMLBlock'].includes(node.name)){
   if(node.name==='InlineCode')inline.push({from:node.from,to:node.to,className:'cm-inline-code'});


   return false;
  }


  if(math.some(/* Detect syntax nodes already contained within an exact mathematics range. */ range=>node.from>=range.from&&node.to<=range.to))return false;


  const className={StrongEmphasis:'cm-markdown-bold',Emphasis:'cm-markdown-italic',Strikethrough:'cm-markdown-strike'}[node.name];


  if(className)inline.push({from:node.from,to:node.to,className});


  if(node.name==='Escape'){
   let parent=node.node.parent;

   while(parent&&parent.name!=='Link')parent=parent.parent;


   if(parent)hidden.push({from:node.from,to:node.from+1});
  }


  if(node.name==='Link'){
   const marks=node.node.getChildren('LinkMark');


   if(marks.length>=2&&source[marks[0].from]==='['){
    const from=marks[0].to,to=marks[1].from;


    if(from<to){const url=node.node.getChild('URL');

     links.push({from,to,target:url?source.slice(url.from,url.to):null});inline.push({from,to,className:'cm-rendered-link'});hidden.push({from:node.from,to:from},{from:to,to:node.to});}
   }
  }
 }});
 model={tree,headings,gaps,inline,links,hidden,markers:markdownMarkerRanges(state,tree)};cache.set(state.doc,model);

 return model;
}

/** Return the heading and inter-block spacing classes for a particular source line. */
export function presentationLineClasses(model,from){
 return [model.headings.has(from)?'cm-h'+model.headings.get(from):'',model.gaps.has(from)?'cm-block-gap':''].filter(Boolean).join(' ');
}
