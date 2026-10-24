// Pure source-range selection helpers. Offsets are UTF-16, matching CodeMirror.
export function paragraphs(text){
 const result=[];let start=null,offset=0,lastEnd=0,fence=null;
 const flush=()=>{if(start!==null&&/\S/.test(text.slice(start,lastEnd)))result.push({from:start,to:lastEnd});start=null};
 for(const line of text.split('\n')){
  const marker=/^\s{0,3}(`{3,}|~{3,})/.exec(line);
  const listItem=!fence&&/^[\t ]*(?:\d+[.)]|[-+*])[\t ]+\S/.test(line);
  if(!line.trim()){flush()}
  else {if(listItem)flush();if(start===null)start=offset;lastEnd=offset+line.length}
  if(marker){if(!fence)fence=marker[1][0];else if(marker[1][0]===fence)fence=null}
  offset+=line.length+1;
 }
 flush();return result.length?result:[{from:0,to:text.length}];
}

function containing(ranges,pos){
 for(let i=0;i<ranges.length;i++){let r=ranges[i];if(pos<r.to||i===ranges.length-1)return r}
 return ranges[ranges.length-1];
}
export function paragraphAt(text,pos){return containing(paragraphs(text),pos)}
export function sentenceAt(text,pos){
 const block=paragraphAt(text,pos),source=text.slice(block.from,block.to),ranges=[];
 const segments=new Intl.Segmenter('en',{granularity:'sentence'}).segment(source);
 for(const s of segments){const leading=s.segment.length-s.segment.trimStart().length,body=s.segment.trim();if(body)ranges.push({from:block.from+s.index+leading,to:block.from+s.index+leading+body.length})}
 return ranges.length?containing(ranges,pos):block;
}
export function wordAt(text,pos){
 const block=paragraphAt(text,pos),source=text.slice(block.from,block.to);
 for(const s of new Intl.Segmenter('en',{granularity:'word'}).segment(source)){let from=block.from+s.index,to=from+s.segment.length;if(pos<to)return {from,to}}
 return {from:pos,to:pos};
}
export function clickRange(text,pos,count){return count>=5?sectionContaining(text,pos):count===4?paragraphAt(text,pos):count===3?sentenceAt(text,pos):count===2?wordAt(text,pos):{from:pos,to:pos}}
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
 if(count>=5){const from=Math.min(first.from,last.from),to=Math.max(first.to,last.to);return current>origin?{anchor:from,head:to}:{anchor:to,head:from}}
 return current>origin?{anchor:first.from,head:last.to}:{anchor:first.to,head:last.from};
}
export function sectionAt(text,start){
 const heading=/^(#{1,6})[\t ]+/.exec(text.slice(start));if(!heading)return {from:start,to:start};
 const tail=text.slice(start);const next=/^#{1,6}[\t ]+.*$/gm;next.exec(tail);let m;
 while((m=next.exec(tail))){if(/^#+/.exec(m[0])[0].length<=heading[1].length)return {from:start,to:start+m.index}}
 return {from:start,to:text.length};
}

export function sectionContaining(text,pos){
 const headings=[...text.matchAll(/^#{1,6}[\t ]+.*$/gm)];
 let current=null;
 for(const h of headings){if(h.index>pos)break;current=h}
 return current?sectionAt(text,current.index):{from:0,to:headings[0]?.index??text.length};
}
function trimmedRange(text,from,to){
 const raw=text.slice(from,to),start=raw.length-raw.trimStart().length;
 return {from:from+start,to:to-(raw.length-raw.trimEnd().length)};
}
export function selectionKind(text,from,to){
 if(from>to)[from,to]=[to,from];
 if(from<0||to>text.length||from===to)return null;
 const selected=trimmedRange(text,from,to);if(selected.from>=selected.to)return null;
 const same=r=>{const t=trimmedRange(text,r.from,r.to);return t.from===selected.from&&t.to===selected.to};
 const headings=[...text.matchAll(/^#{1,6}[\t ]+.*$/gm)];
 if(headings.some(h=>h.index===selected.from&&same(sectionAt(text,h.index)))||(!headings.length&&same({from:0,to:text.length})))return {kind:'section',count:1,...selected};
 const blocks=paragraphs(text).filter(p=>p.to>selected.from&&p.from<selected.to);
 // A heading or structural source block is not prose merely because it is blank-line delimited.
 if(!blocks.length||blocks.some(p=>/^\s*(?:#{1,6}\s|`{3}|~{3}|\|)/.test(text.slice(p.from,p.to))))return null;
 const first=trimmedRange(text,blocks[0].from,blocks[0].to),last=trimmedRange(text,blocks.at(-1).from,blocks.at(-1).to);
 if(selected.from===first.from&&selected.to===last.to)return {kind:'paragraph',count:blocks.length,...selected};
 const sentences=[];
 for(const p of blocks){for(const segment of new Intl.Segmenter('en',{granularity:'sentence'}).segment(text.slice(p.from,p.to))){const r=trimmedRange(text,p.from+segment.index,p.from+segment.index+segment.segment.length);if(r.from<r.to&&r.to>selected.from&&r.from<selected.to)sentences.push(r)}}
 if(sentences.length&&selected.from===sentences[0].from&&selected.to===sentences.at(-1).to)return {kind:'sentence',count:sentences.length,...selected};
 return null;
}
