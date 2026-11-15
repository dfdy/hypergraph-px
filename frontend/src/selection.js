/**
 * # Hypergraph PX — Source-bound semantic selection ranges
 *
 * Calculate word, sentence, paragraph and heading-section selections against the
 * exact document text used by the editor.
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
 * Used by: Owned-source editing and presentation, mouse drag selection and
 * assertion/relationship capture.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 *
 * Boundary: Ranges use JavaScript UTF16 coordinates and English Intl.Segmenter
 * rules. Semantic grouping never grants authority or establishes persistent source
 * ownership.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/selection.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 */

import {documentHeadings} from './context-actions.js';

// Pure source-range selection helpers. Offsets are UTF-16, matching CodeMirror.
/** Partition exact text into paragraph-like ranges while keeping fenced code and list-item boundaries explicit. */
export function paragraphs(text){
 const result=[];

 let start=null,offset=0,lastEnd=0,fence=null;


 /** Finish the current non-whitespace paragraph range before starting another block. */
 const flush=()=>{if(start!==null&&/\S/.test(text.slice(start,lastEnd)))result.push({from:start,to:lastEnd});

  start=null};


 for(const line of text.split('\n')){
  const marker=/^\s{0,3}(`{3,}|~{3,})/.exec(line);


  const listItem=!fence&&/^[\t ]*(?:\d+[.)]|[-+*])[\t ]+\S/.test(line);


  if(!line.trim()){flush()}
  else {if(listItem)flush();

   if(start===null)start=offset;

   lastEnd=offset+line.length}


  if(marker){if(!fence)fence=marker[1][0];else if(marker[1][0]===fence)fence=null}


  offset+=line.length+1;
 }


 flush();

 return result.length?result:[{from:0,to:text.length}];
}

/** Choose the containing or nearest preceding ordered range for a display position. */
function containing(ranges,pos){
 let previous=ranges[0];


 for(const range of ranges){if(pos<range.from)return previous;

  if(pos<=range.to)return range;

  previous=range;}


 return previous;
}

/** Resolve a position to its paragraph-like source interval. */
export function paragraphAt(text,pos){return containing(paragraphs(text),pos)}

/** Resolve sentence boundaries within the current paragraph without changing source whitespace. */
export function sentenceAt(text,pos){
 const block=paragraphAt(text,pos),source=text.slice(block.from,block.to),ranges=[];


 const segments=new Intl.Segmenter('en',{granularity:'sentence'}).segment(source);


 for(const s of segments){const leading=s.segment.length-s.segment.trimStart().length,body=s.segment.trim();

  if(body)ranges.push({from:block.from+s.index+leading,to:block.from+s.index+leading+body.length})}


 return ranges.length?containing(ranges,pos):block;
}

/** Resolve a position to a segmented word interval within its paragraph. */
export function wordAt(text,pos){
 const block=paragraphAt(text,pos),source=text.slice(block.from,block.to);


 for(const s of new Intl.Segmenter('en',{granularity:'word'}).segment(source)){let from=block.from+s.index,to=from+s.segment.length;

  if(pos<to)return {from,to}}


 return {from:pos,to:pos};
}

/** Translate click count into caret, word, sentence, paragraph or section selection. */
export function clickRange(text,pos,count){return count>=5?sectionContaining(text,pos):count===4?paragraphAt(text,pos):count===3?sentenceAt(text,pos):count===2?wordAt(text,pos):{from:pos,to:pos}}

/** Expand a directional drag to coherent semantic units while retaining anchor/head direction. */
export function gestureRange(text,origin,current,count=1){
 const firstBlock=paragraphAt(text,origin),lastBlock=paragraphAt(text,current);


 let first,last;


 if(count>=5){first=sectionContaining(text,origin);last=sectionContaining(text,current)}
 else if(firstBlock.from!==lastBlock.from||count===4){first=firstBlock;last=lastBlock}
 else {const firstSentence=sentenceAt(text,origin),lastSentence=sentenceAt(text,current);


  if(firstSentence.from!==lastSentence.from||count===3){first=firstSentence;last=lastSentence}
  else {first=clickRange(text,origin,count);last=clickRange(text,current,count)}
 }


 if(current===origin)return {anchor:first.from,head:first.to};


 if(count>=5){const from=Math.min(first.from,last.from),to=Math.max(first.to,last.to);

  return current>origin?{anchor:from,head:to}:{anchor:to,head:from}}


 return current>origin?{anchor:first.from,head:last.to}:{anchor:first.to,head:last.from};
}

/** Return the exact heading section beginning at the requested source offset. */
export function sectionAt(text,start){const heading=documentHeadings(text).find(/* Match only a heading starting at the supplied offset. */ h=>h.from===start);

 return heading?{from:start,to:heading.to}:{from:start,to:start};}

/** Find the active heading section, including the introduction before the first heading. */
export function sectionContaining(text,pos){const headings=documentHeadings(text);

 let current=null;

 for(const h of headings){if(h.from>pos)break;

  current=h;}

 return current?{from:current.from,to:current.to}:{from:0,to:headings[0]?.from??text.length};}

/** Compute whitespace-trimmed boundaries for comparison while leaving the source untouched. */
function trimmedRange(text,from,to){
 const raw=text.slice(from,to),start=raw.length-raw.trimStart().length;


 return {from:from+start,to:to-(raw.length-raw.trimEnd().length)};
}

/** Classify an exact nonempty selection as complete sections, prose paragraphs or sentences when its boundaries agree. */
export function selectionKind(text,from,to){
 if(from>to)[from,to]=[to,from];


 if(from<0||to>text.length||from===to)return null;


 const selected=trimmedRange(text,from,to);

 if(selected.from>=selected.to)return null;


 /** Compare the candidate unit's trimmed boundaries to the explicitly selected range. */
 const same=r=>{const t=trimmedRange(text,r.from,r.to);

  return t.from===selected.from&&t.to===selected.to};


 const headings=[...text.matchAll(/^#{1,6}[\t ]+.*$/gm)];


 if(headings.some(/* Recognize a selected heading section with exact start and extent. */ h=>h.index===selected.from&&same(sectionAt(text,h.index)))||(!headings.length&&same({from:0,to:text.length})))return {kind:'section',count:1,...selected};


 const blocks=paragraphs(text).filter(/* Collect paragraph ranges intersecting the selected source interval. */ p=>p.to>selected.from&&p.from<selected.to);


 // A heading or structural source block is not prose merely because it is blank-line delimited.
 if(!blocks.length||blocks.some(/* Reject heading, fenced-code or table source blocks as ordinary prose selection units. */ p=>/^\s*(?:#{1,6}\s|`{3}|~{3}|\|)/.test(text.slice(p.from,p.to))))return null;


 const first=trimmedRange(text,blocks[0].from,blocks[0].to),last=trimmedRange(text,blocks.at(-1).from,blocks.at(-1).to);


 if(selected.from===first.from&&selected.to===last.to)return {kind:'paragraph',count:blocks.length,...selected};


 const sentences=[];


 for(const p of blocks){for(const segment of new Intl.Segmenter('en',{granularity:'sentence'}).segment(text.slice(p.from,p.to))){const r=trimmedRange(text,p.from+segment.index,p.from+segment.index+segment.segment.length);

   if(r.from<r.to&&r.to>selected.from&&r.from<selected.to)sentences.push(r)}}


 if(sentences.length&&selected.from===sentences[0].from&&selected.to===sentences.at(-1).to)return {kind:'sentence',count:sentences.length,...selected};


 return null;
}
