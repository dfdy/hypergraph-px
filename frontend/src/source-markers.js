/**
 * # Hypergraph PX — Markdown notation presentation ranges
 *
 * Identify syntax-marker intervals separately from literal text so source/render
 * controls can treat notation consistently.
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
 * Used by: Owned-source editing and presentation through the full
 * document-presentation model.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 *
 * Boundary: Ranges are UTF16 display/source offsets. Punctuation inside code or
 * mathematics remains content; markers do not establish semantic entities or
 * change source bytes.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/source-markers.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 */

import {syntaxTree} from '@codemirror/language';
import {mathExpressions} from './math.js';

const markerTypes = new Set([
  'HeaderMark','EmphasisMark','StrikethroughMark','QuoteMark','ListMark',
  'LinkMark','CodeMark','CodeInfo','HardBreak','HorizontalRule','TableDelimiter',
  'TaskMarker','SubscriptMark','SuperscriptMark','HTMLTag'
]);

// Presentation ranges only: literal punctuation inside code/math is content.
/** Collect supported Markdown marker and math-delimiter intervals in stable source order. */
export function markdownMarkerRanges(state,tree=syntaxTree(state)) {
  const source=state.doc.toString(),math=mathExpressions(source),ranges=[];


  tree.iterate({/* Visit syntax nodes eligible for notation presentation without treating escaped content as whole syntax. */ enter(node){
    if(!markerTypes.has(node.name)&&node.name!=='Escape')return;


    if(math.some(/* Detect a syntax interval intersecting mathematics whose notation is handled separately. */ range=>node.from<range.to&&node.to>range.from))return;


    const to=node.name==='Escape'?node.from+1:node.to;


    if(to>node.from)ranges.push({from:node.from,to});
  }});


  for(const expression of math){
    ranges.push({from:expression.from,to:expression.from+2});
    ranges.push({from:expression.to-2,to:expression.to});
  }


  return ranges.sort(/* Order marker intervals by source start and then extent. */ (a,b)=>a.from-b.from||a.to-b.to);
}
