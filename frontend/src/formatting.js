/**
 * # Hypergraph PX — Source-preserving Markdown formatting plans
 *
 * Inspect syntax around the current selection and construct precise local edits
 * for inline marks, quotes and list styles.
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
 * Used by: Owned-source editing and presentation through formatting controls and
 * the functions bar.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 *
 * Boundary: Plans use the exact CodeMirror document's UTF16 offsets and do not
 * dispatch or persist changes. Existing source outside the selected edit spans
 * remains unchanged.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/formatting.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 */

import {syntaxTree} from '@codemirror/language';

const names = {bold:'StrongEmphasis',italic:'Emphasis',quote:'Blockquote',bullet:'BulletList',number:'OrderedList'};

/** Find unique containing syntax nodes at both boundary biases, excluding a previous line's ended node. */
function containingNodes(state,from,to=from) {
  const nodes=[],seen=new Set(),line=state.doc.lineAt(from);


  for(const bias of [1,-1])for(let node=syntaxTree(state).resolveInner(from,bias);node;node=node.parent){
    if(node.from>from||node.to<to)continue;


    if(from===to&&node.to<=line.from&&node.from<line.from)continue;


    const key=`${node.name}:${node.from}:${node.to}`;


    if(!seen.has(key)){seen.add(key);nodes.push(node);}
  }


  return nodes.sort(/* Order containing nodes from the narrowest source extent to the broadest. */ (a,b)=>(a.to-a.from)-(b.to-b.from));
}

/** Find the active syntax node for a requested inline, list or quote formatting control. */
export function formatNode(state,type) {
  const selection=state.selection.main,nodes=containingNodes(state,selection.from,selection.to);


  if(type==='bullet'||type==='number'){
    const list=nodes.find(/* Choose the nearest containing ordered or unordered list. */ node=>node.name==='BulletList'||node.name==='OrderedList');


    return list?.name===names[type]?list:null;
  }


  return nodes.find(/* Match the requested formatting syntax without treating an ended inline mark as active at a caret. */ node=>node.name===names[type]&&(!(type==='bold'||type==='italic')||!selection.empty||selection.from<node.to))??null;
}

/** Classify the block at a position for paragraph/heading/list/quote control state. */
function blockAt(state,position){
  const nodes=containingNodes(state,position);


  if(nodes.some(/* Recognize positions within fenced or indented code. */ n=>n.name==='FencedCode'||n.name==='IndentedCode'))return {kind:'code'};


  if(nodes.some(/* Recognize positions inside a Markdown table. */ n=>n.name==='Table'))return {kind:'table'};


  const heading=nodes.find(/* Find an ATX or Setext heading containing this position. */ n=>/^(?:ATXHeading[1-6]|SetextHeading[12])$/.test(n.name));


  if(heading)return {kind:'heading',headingLevel:Number(heading.name.at(-1))};


  const list=nodes.find(/* Find the current ordered or unordered list container. */ n=>n.name==='BulletList'||n.name==='OrderedList');


  if(list)return {kind:list.name==='OrderedList'?'number':'bullet'};


  if(nodes.some(/* Recognize a blockquote container. */ n=>n.name==='Blockquote'))return {kind:'quote'};


  if(nodes.some(/* Recognize structural blocks that are not editable prose styles. */ n=>n.name==='HorizontalRule'||n.name==='HTMLBlock'||n.name==='LinkReference'))return {kind:'other'};


  if(nodes.some(/* Recognize a paragraph container or an eligible blank line. */ n=>n.name==='Paragraph')||!state.doc.lineAt(position).text.trim())return {kind:'paragraph'};


  return {kind:'other'};
}

/** Compare selected nonblank lines to report a coherent block style or mixed selection. */
export function blockStyleState(state){
  const selection=state.selection.main,positions=[];


  if(selection.empty)positions.push(selection.head);
  else{
    const first=state.doc.lineAt(selection.from).number,last=state.doc.lineAt(selection.to-1).number;


    for(let n=first;n<=last;n++){
      const line=state.doc.line(n),from=Math.max(line.from,selection.from),to=Math.min(line.to,selection.to),part=state.sliceDoc(from,to),offset=part.search(/\S/);


      if(offset>=0)positions.push(from+offset);
    }


    if(!positions.length)positions.push(selection.from);
  }


  const blocks=positions.map(/* Classify each representative selected-line position. */ position=>blockAt(state,position)),first=blocks[0];


  const same=blocks.every(/* Require all selected blocks to share the same kind and heading level. */ block=>block.kind===first.kind&&block.headingLevel===first.headingLevel);


  return {kind:same?first.kind:'mixed',paragraph:same&&first.kind==='paragraph',headingLevel:same&&first.kind==='heading'?first.headingLevel:null};
}

/** Report whether each supported formatting control is active at the selection. */
export function formattingState(state) {
  return Object.fromEntries(Object.keys(names).map(/* Pair a formatting type with presence of its matching syntax node. */ type => [type, !!formatNode(state, type)]));
}

/** Create minimal edits that add or remove bold/italic source delimiters around the current selection. */
export function inlinePlan(state, type) {
  const mark = type === 'bold' ? '**' : '*';


  const existing = formatNode(state, type);


  if (existing) return {changes:[{from:existing.from,to:existing.from+mark.length},{from:existing.to-mark.length,to:existing.to}]};


  const {from,to} = state.selection.main;


  return {changes:{from,to,insert:mark+state.sliceDoc(from,to)+mark},selection:{anchor:from+mark.length,head:to+mark.length}};
}

/** Create quote/list source edits while preserving unrelated lines and nested indentation. */
export function blockPlan(state, type) {
  const selection = state.selection.main;


  const existing = formatNode(state, type);


  const otherList = type === 'quote' ? null : formatNode(state, type === 'bullet' ? 'number' : 'bullet');


  const block = selection.empty ? existing || otherList : null;


  const from = block?.from ?? selection.from, to = block?.to ?? selection.to;


  const first = state.doc.lineAt(from);


  const endLine = state.doc.lineAt(to);


  const last = to > from && endLine.from === to ? state.doc.lineAt(to-1) : endLine;


  const lines = [];


  for (let n=first.number; n<=last.number; n++) lines.push(state.doc.line(n));


  if (type === 'quote') {
    const remove = !!existing || lines.every(/* Determine whether every selected line already has quote syntax to remove. */ line => /^\s{0,3}>/.test(line.text));


    return {changes:lines.map(/* Build the quoted or unquoted source replacement for one selected line. */ line=>({from:line.from,to:line.to,insert:remove?line.text.replace(/^(\s{0,3})> ?/,'$1'):'> '+line.text}))};
  }


  const marker = /^((?:[ \t]*> ?)*[ \t]*)(?:(\d+)[.)]|([-+*]))[ \t]+/;


  const matches = lines.map(/* Read each selected line's existing list-marker prefix. */ line=>marker.exec(line.text));


  const baseIndent = block ? Math.min(...matches.filter(Boolean).map(/* Measure marker indentation to distinguish the selected list level. */ m=>m[1].length)) : null;


  /** Determine whether a line belongs to the list level being restyled. */
  const eligible = index => baseIndent === null || !matches[index] || matches[index][1].length === baseIndent;


  const remove = !!existing || lines.every(/* Determine whether all nonblank eligible lines already use the requested list style. */ (line,i)=>!line.text.trim()||matches[i]&&(type==='number'?matches[i][2]:matches[i][3]));


  let index = 0, indentDelta = 0;


  return {changes:lines.flatMap(/* Build one selected-line edit, preserving nested list indentation and untouched source where no edit is needed. */ (line,i)=>{
    if (!line.text.trim() && lines.length > 1) return [];


    const match = matches[i];


    if (block && (!match || !eligible(i))) {
      const indent = /^((?:[ \t]*> ?)*)([ \t]*)/.exec(line.text);


      if (!remove && indentDelta && indent[0].length > baseIndent) {
        const spaces = indentDelta > 0 ? ' '.repeat(indentDelta) + indent[2] : indent[2].slice(Math.min(indent[2].length, -indentDelta));


        return [{from:line.from,to:line.from+indent[0].length,insert:indent[1]+spaces}];
      }


      return [];
    }


    const prefix = match?.[1] ?? (/^((?:[ \t]*> ?)*[ \t]*)/.exec(line.text)?.[1] || '');


    const body = line.text.slice(match ? match[0].length : prefix.length);


    const nextMarker = remove ? '' : type==='number'?`${++index}. `:'- ';


    indentDelta = nextMarker.length - (match ? match[0].length-prefix.length : 0);


    const insert = prefix + nextMarker + body;


    return [{from:line.from,to:line.to,insert}];
  })};
}
