/**
 * # Hypergraph PX — Exact Markdown table structure and edits
 *
 * Parse pipe-table structure and identify exact cell source intervals so table
 * widgets can produce bounded, undoable text changes.
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
 * Used by: Owned-source editing and presentation, rendered table editing, source
 * selection and minimap projections.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Exact text and anchors][spec-2]
 *
 * Boundary: Positions are UTF16 source offsets. Parsing and serialization do not
 * establish graph identity or normalize untouched document text; whole-table
 * actions deliberately serialize only the selected table.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/tables.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/text-and-anchors.md
 */

/** Split a pipe-table row without treating escaped pipes or code-span pipes as column separators. */
export function splitCells(line){
 let s=line.trim();

 if(s.startsWith('|'))s=s.slice(1);

 if(s.endsWith('|')&&!s.endsWith('\\|'))s=s.slice(0,-1);


 let cells=[],part='',ticks=0;


 for(let i=0;i<s.length;i++){
  const c=s[i];

  if(c==='\\'&&i+1<s.length){part+=c+s[++i];

   continue}


  if(c==='`'){let run=1;

   while(s[i+1]==='`'){run++;i++}

   ticks=ticks===run?0:ticks||run;part+='`'.repeat(run);

   continue}


  if(c==='|'&&!ticks){cells.push(part.trim());part=''}else part+=c;
 }


 cells.push(part.trim());

 return cells;
}

/** Collect table source ranges, rows and alignment while ignoring fenced code. */
export function parseTables(text){
 const lines=text.split('\n'),offsets=[];

 let p=0;

 for(const l of lines){offsets.push(p);p+=l.length+1}


 const tables=[];

 let fence=null;


 for(let i=0;i<lines.length-1;i++){
  const marker=/^\s{0,3}(`{3,}|~{3,})/.exec(lines[i]);

  if(marker){if(!fence)fence=marker[1][0];else if(marker[1][0]===fence)fence=null;

   continue}

  if(fence)continue;


  if(!lines[i].includes('|')||!lines[i+1].includes('|'))continue;


  const separator=splitCells(lines[i+1]);

  if(!separator.length||!separator.every(/* Require each separator cell to contain supported Markdown alignment syntax. */ c=>/^:?-{3,}:?$/.test(c)))continue;


  const rows=[splitCells(lines[i])];

  let end=i+2;


  while(end<lines.length&&lines[end].trim()&&lines[end].includes('|')){rows.push(splitCells(lines[end]));end++}


  const columns=Math.max(separator.length,...rows.map(/* Measure each row width when determining the complete table column count. */ r=>r.length));

  for(const row of rows)while(row.length<columns)row.push('');


  const align=Array.from({length:columns},/* Derive each column's display alignment from its separator cell. */ (_,c)=>separator[c]?.startsWith(':')?(separator[c]?.endsWith(':')?'center':'left'):separator[c]?.endsWith(':')?'right':'left');


  const from=offsets[i],to=offsets[end-1]+lines[end-1].length;


  tables.push({from,to,rows,align,columns,source:text.slice(from,to)});i=end-1;
 }


 return tables;
}

/** Serialize the supplied table model as explicit escaped Markdown rows and alignment markers. */
export function serializeTable(table){
 /** Render one row with escaped pipes and no embedded line breaks. */
 const row=cells=>'| '+cells.map(/* Escape a cell's unescaped pipes and flatten line breaks for table-row syntax. */ c=>c.replace(/\n/g,' ').replace(/(?<!\\)\|/g,'\\|')).join(' | ')+' |';


 const separators=Array.from({length:table.columns},/* Choose the alignment separator for one table column. */ (_,i)=>table.align[i]==='center'?':---:':table.align[i]==='right'?'---:':'---');


 return [row(table.rows[0]),row(separators),...table.rows.slice(1).map(row)].join('\n');
}

/** Apply a requested structural or cell edit to a copied table model and serialize the result. */
export function editTable(table,action,row,col,value){
 const t={...table,rows:table.rows.map(/* Copy a row so an edit does not mutate the parsed source model. */ r=>[...r]),align:[...table.align]};


 if(action==='cell')t.rows[row][col]=value;


 if(action==='rowAbove'&&row>0)t.rows.splice(row,0,Array(t.columns).fill(''));


 if(action==='rowBelow')t.rows.splice(row+1,0,Array(t.columns).fill(''));


 if(action==='deleteRow'&&row>0)t.rows.splice(row,1);


 if(action==='columnLeft'||action==='columnRight'){let at=col+(action==='columnRight'?1:0);

  for(const r of t.rows)r.splice(at,0,'');

  t.align.splice(at,0,'left');t.columns++}


 if(action==='deleteColumn'&&t.columns>1){for(const r of t.rows)r.splice(col,1);

  t.align.splice(col,1);t.columns--}


 return serializeTable(t);
}

// Exact trimmed UTF-16 range of one source cell; repeated values are distinct.
/** Locate the exact trimmed UTF16 source interval of one cell, preserving repeated equal cells as distinct positions. */
export function cellSourceRange(table,row,col){
 const lines=table.source.split('\n'),lineIndex=row===0?0:row+1,line=lines[lineIndex];


 if(line===undefined)return null;


 const offset=table.from+lines.slice(0,lineIndex).reduce(/* Accumulate original row lengths and newlines before the selected cell row. */ (n,l)=>n+l.length+1,0);


 const separators=[];

 let ticks=0;


 for(let i=0;i<line.length;i++){
  if(line[i]==='\\'){i++;

   continue;}


  if(line[i]==='`'){let run=1;

   while(line[i+1]==='`'){run++;i++;}

   ticks=ticks===run?0:ticks||run;

   continue;}


  if(line[i]==='|'&&!ticks)separators.push(i);
 }


 let edges=[-1,...separators,line.length],ranges=[];


 for(let i=0;i<edges.length-1;i++)ranges.push({from:edges[i]+1,to:edges[i+1]});


 if(separators.length&&!line.slice(0,separators[0]).trim())ranges.shift();


 if(separators.length&&!line.slice(separators.at(-1)+1).trim())ranges.pop();


 const range=ranges[col];

 if(!range)return null;


 const raw=line.slice(range.from,range.to),leading=raw.length-raw.trimStart().length;


 const from=offset+range.from+leading;

 return {from,to:Math.max(from,offset+range.to-(raw.length-raw.trimEnd().length))};
}
