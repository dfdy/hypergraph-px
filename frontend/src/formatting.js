import {syntaxTree} from '@codemirror/language';

const names = {bold:'StrongEmphasis',italic:'Emphasis',quote:'Blockquote',bullet:'BulletList',number:'OrderedList'};
function containingNodes(state,from,to=from) {
  const nodes=[],seen=new Set(),line=state.doc.lineAt(from);
  for(const bias of [1,-1])for(let node=syntaxTree(state).resolveInner(from,bias);node;node=node.parent){
    if(node.from>from||node.to<to)continue;
    if(from===to&&node.to<=line.from&&node.from<line.from)continue;
    const key=`${node.name}:${node.from}:${node.to}`;
    if(!seen.has(key)){seen.add(key);nodes.push(node);}
  }
  return nodes.sort((a,b)=>(a.to-a.from)-(b.to-b.from));
}
export function formatNode(state,type) {
  const selection=state.selection.main,nodes=containingNodes(state,selection.from,selection.to);
  if(type==='bullet'||type==='number'){
    const list=nodes.find(node=>node.name==='BulletList'||node.name==='OrderedList');
    return list?.name===names[type]?list:null;
  }
  return nodes.find(node=>node.name===names[type]&&(!(type==='bold'||type==='italic')||!selection.empty||selection.from<node.to))??null;
}
function blockAt(state,position){
  const nodes=containingNodes(state,position);
  if(nodes.some(n=>n.name==='FencedCode'||n.name==='IndentedCode'))return {kind:'code'};
  if(nodes.some(n=>n.name==='Table'))return {kind:'table'};
  const heading=nodes.find(n=>/^(?:ATXHeading[1-6]|SetextHeading[12])$/.test(n.name));
  if(heading)return {kind:'heading',headingLevel:Number(heading.name.at(-1))};
  const list=nodes.find(n=>n.name==='BulletList'||n.name==='OrderedList');
  if(list)return {kind:list.name==='OrderedList'?'number':'bullet'};
  if(nodes.some(n=>n.name==='Blockquote'))return {kind:'quote'};
  if(nodes.some(n=>n.name==='HorizontalRule'||n.name==='HTMLBlock'||n.name==='LinkReference'))return {kind:'other'};
  if(nodes.some(n=>n.name==='Paragraph')||!state.doc.lineAt(position).text.trim())return {kind:'paragraph'};
  return {kind:'other'};
}
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
  const blocks=positions.map(position=>blockAt(state,position)),first=blocks[0];
  const same=blocks.every(block=>block.kind===first.kind&&block.headingLevel===first.headingLevel);
  return {kind:same?first.kind:'mixed',paragraph:same&&first.kind==='paragraph',headingLevel:same&&first.kind==='heading'?first.headingLevel:null};
}
export function formattingState(state) {
  return Object.fromEntries(Object.keys(names).map(type => [type, !!formatNode(state, type)]));
}
export function inlinePlan(state, type) {
  const mark = type === 'bold' ? '**' : '*';
  const existing = formatNode(state, type);
  if (existing) return {changes:[{from:existing.from,to:existing.from+mark.length},{from:existing.to-mark.length,to:existing.to}]};
  const {from,to} = state.selection.main;
  return {changes:{from,to,insert:mark+state.sliceDoc(from,to)+mark},selection:{anchor:from+mark.length,head:to+mark.length}};
}
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
    const remove = !!existing || lines.every(line => /^\s{0,3}>/.test(line.text));
    return {changes:lines.map(line=>({from:line.from,to:line.to,insert:remove?line.text.replace(/^(\s{0,3})> ?/,'$1'):'> '+line.text}))};
  }
  const marker = /^((?:[ \t]*> ?)*[ \t]*)(?:(\d+)[.)]|([-+*]))[ \t]+/;
  const matches = lines.map(line=>marker.exec(line.text));
  const baseIndent = block ? Math.min(...matches.filter(Boolean).map(m=>m[1].length)) : null;
  const eligible = index => baseIndent === null || !matches[index] || matches[index][1].length === baseIndent;
  const remove = !!existing || lines.every((line,i)=>!line.text.trim()||matches[i]&&(type==='number'?matches[i][2]:matches[i][3]));
  let index = 0, indentDelta = 0;
  return {changes:lines.flatMap((line,i)=>{
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
