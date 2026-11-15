/**
 * # Hypergraph PX — Exact-source code and mathematics ranges
 *
 * Locate Markdown code regions and explicit mathematics delimiters so rendering
 * and selection can respect protected source syntax.
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
 * Used by: Owned-source editing and presentation, source selection, tables and
 * minimap projections.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 * - [Frontend interaction contract][spec-3]
 *
 * Boundary: Offsets remain exact JavaScript UTF16 coordinates. The parser neither
 * normalizes source nor proves mathematical statements; code and Markdown link
 * ranges are excluded from math recognition.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/math.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 * [spec-3]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {markdownLanguage} from '@codemirror/lang-markdown';

// Exact source parser: no fixture transport unescaping or source normalization.
/** Collect fenced and inline code intervals while respecting the original delimiter lengths and source offsets. */
export function codeRanges(text){const result=[];

 let offset=0,start=0,fence=null;

 for(const line of text.split('\n')){const m=/^\s{0,3}(`{3,}|~{3,})/.exec(line);

  if(m){if(!fence){fence=m[1];start=offset;}else if(m[1][0]===fence[0]&&m[1].length>=fence.length){result.push({from:start,to:offset+line.length});fence=null;}}

  offset+=line.length+1;}

 if(fence)result.push({from:start,to:text.length});

 const re=/`+/g;

 let m;

 while((m=re.exec(text))){if(result.some(/* Check whether an inline backtick opening lies inside an already protected fenced-code interval. */ r=>m.index>=r.from&&m.index<r.to))continue;

  const end=text.indexOf(m[0],re.lastIndex);

  if(end>=0){result.push({from:m.index,to:end+m[0].length});re.lastIndex=end+m[0].length;}}

 return result;}

/** Recognize supported TeX delimiters outside code, links and caller-supplied exclusions without altering source. */
export function mathExpressions(text,{exclude=[]}={}){const links=[];

 markdownLanguage.parser.parse(text).iterate({/* Collect Markdown link/image/reference intervals so their notation is not mistaken for mathematics. */ enter(node){if(node.name==='Link'||node.name==='Image'||node.name==='LinkReference'){links.push({from:node.from,to:node.to});

   return false;}}});

 const ignored=[...codeRanges(text),...exclude],result=[],re=/\\[\[(]|\$\$/g;

 let m;

 while((m=re.exec(text))){const from=m.index;

  if(links.some(/* Check whether this math opening is inside Markdown link syntax. */ r=>from>=r.from&&from<r.to)||text[from-1]==='\\'||ignored.some(/* Check whether this math opening lies within a protected code or caller exclusion range. */ r=>from>=r.from&&from<r.to))continue;

  const display=m[0]!=='\\(',close=m[0]==='$$'?'$$':display?'\\]':'\\)',end=text.indexOf(close,re.lastIndex);

  if(end<0)continue;

  const to=end+close.length;

  if(ignored.some(/* Reject a candidate expression whose full interval intersects protected source. */ r=>r.from<to&&r.to>from))continue;

  const raw=text.slice(re.lastIndex,end),lineFrom=text.lastIndexOf('\n',from-1)+1,next=text.indexOf('\n',to),lineTo=next<0?text.length:next,block=display&&!text.slice(lineFrom,from).trim()&&!text.slice(to,lineTo).trim();

  result.push({from,to,tex:raw,raw,display,block,renderFrom:block?lineFrom:from,renderTo:block?lineTo:to});re.lastIndex=to;}

 return result;}
