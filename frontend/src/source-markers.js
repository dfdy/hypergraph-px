import {syntaxTree} from '@codemirror/language';
import {mathExpressions} from './math.js';

const markerTypes = new Set([
  'HeaderMark','EmphasisMark','StrikethroughMark','QuoteMark','ListMark',
  'LinkMark','CodeMark','CodeInfo','HardBreak','HorizontalRule','TableDelimiter',
  'TaskMarker','SubscriptMark','SuperscriptMark','HTMLTag'
]);

// Presentation ranges only: literal punctuation inside code/math is content.
export function markdownMarkerRanges(state,tree=syntaxTree(state)) {
  const source=state.doc.toString(),math=mathExpressions(source),ranges=[];
  tree.iterate({enter(node){
    if(!markerTypes.has(node.name)&&node.name!=='Escape')return;
    if(math.some(range=>node.from<range.to&&node.to>range.from))return;
    const to=node.name==='Escape'?node.from+1:node.to;
    if(to>node.from)ranges.push({from:node.from,to});
  }});
  for(const expression of math){
    ranges.push({from:expression.from,to:expression.from+2});
    ranges.push({from:expression.to-2,to:expression.to});
  }
  return ranges.sort((a,b)=>a.from-b.from||a.to-b.to);
}
