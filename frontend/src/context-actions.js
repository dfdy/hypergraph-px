/**
 * # Hypergraph PX — Source-bound heading and context actions
 *
 * Determine eligible word selections and exact heading-section ranges before
 * constructing local Markdown link or section insertion edits.
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
 * Used by: Shared controls and status, heading actions, semantic selection and the
 * application shell.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 * - [Exact text and anchors][spec-3]
 *
 * Boundary: These pure helpers use UTF16 source coordinates. They generate local
 * source edits, not graph links or authorization; headings inside fenced code are
 * excluded.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/context-actions.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 * [spec-3]: ../../docs/05-domain/text-and-anchors.md
 */

/** Require a complete nonempty word-label selection whose endpoints agree with source word boundaries. */
export function selectedWords(text,from,to){
 if(from>to)[from,to]=[to,from];


 if(from===to||from<0||to>text.length)return false;


 const selection=text.slice(from,to);


 // Link labels are complete words, optionally separated by spaces, hyphens, or apostrophes.
 const word=/^[\p{L}\p{N}\p{M}]+(?:(?:[ \t]+|['’\-])[\p{L}\p{N}\p{M}]+)*$/u;


 if(!word.test(selection))return false;


 const parts=[...new Intl.Segmenter('en',{granularity:'word'}).segment(text)];


 return parts.some(/* Confirm the selection starts at the beginning of a complete word. */ p=>p.isWordLike&&p.index===from)&&parts.some(/* Confirm the selection ends at the end of a complete word. */ p=>p.isWordLike&&p.index+p.segment.length===to);
}

/** Collect source headings and unique local anchors, retaining their original source offsets and section extents. */
export function documentHeadings(text){
 const result=[],used=new Set();

 let fence=null;


 for(const matchLine of text.matchAll(/([^\r\n]*)(\r\n|\r|\n|$)/g)){
  const line=matchLine[1],offset=matchLine.index;


  const marker=/^\s{0,3}(`{3,}|~{3,})/.exec(line);


  if(marker){if(!fence)fence=marker[1][0];else if(marker[1][0]===fence)fence=null;

   continue}


  const match=!fence&&/^(#{1,6})[\t ]+(.+?)[\t ]*$/.exec(line);


  if(match){const label=match[2].replace(/[\t ]+#+[\t ]*$/,'').trim(),base=label.toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu,'').trim().replace(/\s+/g,'-')||'section';

   let n=0,anchor=base;

   while(used.has(anchor))anchor=base+'-'+(++n);

   used.add(anchor);result.push({from:offset,level:match[1].length,label,anchor})}
 }


 for(let i=0;i<result.length;i++){const h=result[i];

  h.to=result.slice(i+1).find(/* Find the following heading that closes the current section's nesting level. */ next=>next.level<=h.level)?.from??text.length}


 return result;
}

/** Recognize a collapsed caret on an otherwise whitespace-only source line. */
export function emptyLineAt(text,from,to=from){
 if(from!==to)return false;


 const start=(from===0?0:text.lastIndexOf('\n',from-1)+1),end=text.indexOf('\n',from);


 return /^[\t ]*$/.test(text.slice(start,end<0?text.length:end));
}

/** Escape a displayed link label and point it at the chosen heading's local anchor. */
export function markdownHeadingLink(label,heading){return '['+label.replace(/[\\\[\]]/g,'\\$&')+'](#'+heading.anchor+')'}

/** Construct a source edit replacing the caret's empty line with the selected exact section text. */
export function sectionInsertion(text,at,heading){
 let start=(at===0?0:text.lastIndexOf('\n',at-1)+1),end=text.indexOf('\n',at);

 if(end<0)end=text.length;


 const section=text.slice(heading.from,heading.to).trimEnd();


 return {from:start,to:end,insert:(start>0&&text[start-2]!=='\n'?'\n':'')+section+'\n\n'};
}
