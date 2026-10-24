export function selectedWords(text,from,to){
 if(from>to)[from,to]=[to,from];
 if(from===to||from<0||to>text.length)return false;
 const selection=text.slice(from,to);
 // Link labels are complete words, optionally separated by spaces, hyphens, or apostrophes.
 const word=/^[\p{L}\p{N}\p{M}]+(?:(?:[ \t]+|['’\-])[\p{L}\p{N}\p{M}]+)*$/u;
 if(!word.test(selection))return false;
 const parts=[...new Intl.Segmenter('en',{granularity:'word'}).segment(text)];
 return parts.some(p=>p.isWordLike&&p.index===from)&&parts.some(p=>p.isWordLike&&p.index+p.segment.length===to);
}
export function documentHeadings(text){
 const result=[],used=new Set();let offset=0,fence=null;
 for(const line of text.split('\n')){
  const marker=/^\s{0,3}(`{3,}|~{3,})/.exec(line);
  if(marker){if(!fence)fence=marker[1][0];else if(marker[1][0]===fence)fence=null;offset+=line.length+1;continue}
  const match=!fence&&/^(#{1,6})[\t ]+(.+?)[\t ]*$/.exec(line);
  if(match){const label=match[2].replace(/[\t ]+#+[\t ]*$/,'').trim(),base=label.toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s_-]/gu,'').trim().replace(/\s+/g,'-')||'section';let n=0,anchor=base;while(used.has(anchor))anchor=base+'-'+(++n);used.add(anchor);result.push({from:offset,level:match[1].length,label,anchor})}
  offset+=line.length+1;
 }
 for(let i=0;i<result.length;i++){const h=result[i];h.to=result.slice(i+1).find(next=>next.level<=h.level)?.from??text.length}
 return result;
}
export function emptyLineAt(text,from,to=from){
 if(from!==to)return false;
 const start=(from===0?0:text.lastIndexOf('\n',from-1)+1),end=text.indexOf('\n',from);
 return /^[\t ]*$/.test(text.slice(start,end<0?text.length:end));
}
export function markdownHeadingLink(label,heading){return '['+label.replace(/[\\\[\]]/g,'\\$&')+'](#'+heading.anchor+')'}
export function sectionInsertion(text,at,heading){
 let start=(at===0?0:text.lastIndexOf('\n',at-1)+1),end=text.indexOf('\n',at);if(end<0)end=text.length;
 const section=text.slice(heading.from,heading.to).trimEnd();
 return {from:start,to:end,insert:(start>0&&text[start-2]!=='\n'?'\n':'')+section+'\n\n'};
}
