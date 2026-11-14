#!/usr/bin/env node
// Local-only browser publication of current docs. No archives, workspaces or keys.
import {readFile,writeFile,mkdir,mkdtemp,readdir,cp,stat,realpath} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {terminalLink} from './shared/tooling/development-launch.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);let port=4175,buildOnly=false,serveOnly=false;
for(let i=0;i<args.length;i++){
 if(args[i]==='--help'){console.log('Usage: ./browse-docs.mjs [--port 4175] [--build-only | --serve-only]\nBuilds all current documentation and LikeC4 views, then serves a local browser index.\nCtrl-C stops only this documentation server. Output stays under .local/browser-docs/.');process.exit(0);}
 else if(args[i]==='--port'&&args[i+1])port=Number(args[++i]);
 else if(args[i]==='--build-only')buildOnly=true;
 else if(args[i]==='--serve-only')serveOnly=true;
 else throw Error('Unknown/missing option: '+args[i]);
}
if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid documentation port');
if(buildOnly&&serveOnly)throw Error('Choose --build-only or --serve-only');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s).toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu,'').replaceAll(' ','-');
const urlPath=s=>s.split('/').map(encodeURIComponent).join('/');
async function run(program,params){await new Promise((yes,no)=>{const p=spawn(program,params,{cwd:root,stdio:'inherit',env:{...process.env,CHOKIDAR_USEPOLLING:process.env.CHOKIDAR_USEPOLLING??'1'}});p.once('error',no);p.once('exit',n=>n===0?yes():no(Error(program+' exited '+n)));});}
const skip=new Set(['node_modules','target','dist','.lake','incoming','test-results','playwright-report']);
const sources=new Map();
async function walk(directory,all=false){
 for(const e of await readdir(path.join(root,directory),{withFileTypes:true})){
  if(e.name.startsWith('.')||skip.has(e.name)||e.isSymbolicLink())continue;
  const relative=directory+'/'+e.name;
  if(e.isDirectory())await walk(relative,all);
  else if(e.isFile()&&(all||e.name.endsWith('.md')))sources.set(relative,path.extname(e.name).toLowerCase());
 }
}
await walk('docs',true);
for(const dir of ['backend','frontend','shared'])await walk(dir);
for(const name of ['README.md','AGENTS.md','LICENSE'])if(existsSync(path.join(root,name)))sources.set(name,path.extname(name));
const base=path.join(root,'.local/browser-docs');await mkdir(base,{recursive:true});let output;
if(!serveOnly){
// Include current source files linked from prose/diagrams, never ignored data.
for(const [name,ext]of sources){
 if(!['.md','.c4'].includes(ext))continue;
 const text=await readFile(path.join(root,name),'utf8');
 const targets=[...text.matchAll(/\]\((<[^>]+>|[^\s)]+)/g),...text.matchAll(/^\s*link\s+(\S+)/gm)].map(m=>m[1].replace(/^<|>$/g,''));
 for(const target of targets){
  if(/^[a-z][\w+.-]*:/i.test(target)||target.startsWith('#')||target.startsWith('//'))continue;
  let decoded;try{decoded=decodeURIComponent(target.split('#')[0]);}catch{continue;}
  const relative=path.posix.normalize(path.posix.join(path.posix.dirname(name),decoded));
  if(relative.startsWith('../')||relative.split('/').some(p=>p.startsWith('.')||skip.has(p)))continue;
  if(!/\.(md|c4|rs|js|mjs|ts|toml|json|lock|txt|yml|yaml)$/i.test(relative))continue;
  const file=path.join(root,relative);if(!existsSync(file))continue;
  const actual=await realpath(file);if(!actual.startsWith(root+path.sep)||!(await stat(actual)).isFile())continue;
  sources.set(relative,path.extname(relative).toLowerCase());
 }
}
const markedPath=path.join(root,'frontend/node_modules/marked/lib/marked.esm.js');
if(!existsSync(markedPath))throw Error('Locked frontend Markdown tooling is missing. Run npm --prefix frontend ci --ignore-scripts.');
const {Marked,Renderer}=await import(pathToFileURL(markedPath));
const katex=(await import(pathToFileURL(path.join(root,'frontend/node_modules/katex/dist/katex.mjs')))).default;
output=await mkdtemp(path.join(base,'build-'));
const diagramBinary=path.join(root,'.provenance/docs-reorganisation/likec4/dependencies/node_modules/.bin/likec4');
if(!existsSync(diagramBinary))throw Error('Locked LikeC4 tooling is missing. Run npm --prefix docs run setup.');
console.log('Building the complete LikeC4 browser site…');
await run(diagramBinary,['build','--use-hash-history','--base','/diagrams/','-o',path.join(output,'diagrams'),path.join(root,'docs')]);
await mkdir(path.join(output,'assets'),{recursive:true});
await cp(path.join(root,'frontend/node_modules/katex/dist/katex.min.css'),path.join(output,'assets/katex.min.css'));
await cp(path.join(root,'frontend/node_modules/katex/dist/fonts'),path.join(output,'assets/fonts'),{recursive:true});
await writeFile(path.join(output,'assets/marked-LICENSE.md'),await readFile(path.join(root,'frontend/node_modules/marked/LICENSE.md')));
await writeFile(path.join(output,'assets/katex-LICENSE'),await readFile(path.join(root,'frontend/node_modules/katex/LICENSE')));
const views=new Map();
for(const [name,ext]of sources)if(ext==='.c4')views.set(name,[...((await readFile(path.join(root,name),'utf8')).matchAll(/^\s*(?:dynamic\s+)?view\s+(\w+)\b/gm))].map(m=>m[1]));
const fileURL=name=>'/files/'+urlPath(name)+'.html';
function link(target,source,image=false){
 const value=String(target??'');
 if(value.startsWith('#'))return value;
 if(/^(https?:|mailto:)/i.test(value))return image?null:value;
 if(/^[a-z][\w+.-]*:/i.test(value)||value.startsWith('//'))return null;
 const hash=value.indexOf('#'),raw=hash<0?value:value.slice(0,hash),fragment=hash<0?'':value.slice(hash);
 let decoded;try{decoded=decodeURIComponent(raw);}catch{return null;}
 const name=path.posix.normalize(decoded.startsWith('/')?decoded.slice(1):path.posix.join(path.posix.dirname(source),decoded));
 if(!sources.has(name))return null;
 const ext=sources.get(name);
 if(image)return ['.png','.jpg','.jpeg','.gif','.webp','.svg'].includes(ext)?'/raw/'+urlPath(name):null;
 if(ext==='.c4'&&views.get(name)?.length)return '/diagrams/#/view/'+views.get(name)[0];
 if(['.png','.jpg','.jpeg','.gif','.webp','.svg'].includes(ext))return '/raw/'+urlPath(name)+fragment;
 return fileURL(name)+fragment;
}
const css=`:root{color-scheme:light dark;--bg:#fff;--fg:#20252b;--muted:#64748b;--border:#d8dee7;--panel:#f5f7fa;--accent:#1859a5}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 system-ui,sans-serif}header{padding:14px 25px;background:var(--panel);border-bottom:1px solid var(--border);display:flex;gap:22px;flex-wrap:wrap}header a{font-weight:650}main{max-width:1200px;margin:auto;padding:30px 32px 80px}a{color:var(--accent);overflow-wrap:anywhere}h1,h2,h3{line-height:1.3;scroll-margin-top:20px}h2{margin-top:2em}p,li{overflow-wrap:anywhere}pre{padding:18px;overflow:auto;background:var(--panel);border:1px solid var(--border);border-radius:7px}code{font-size:.9em}table{display:block;overflow:auto;border-collapse:collapse;margin:20px 0;max-height:75vh}th,td{border:1px solid var(--border);padding:8px 12px;text-align:left;vertical-align:top}th{position:sticky;top:0;background:var(--panel)}img{max-width:100%;height:auto}blockquote{border-left:4px solid var(--border);margin-left:0;padding-left:20px;color:var(--muted)}.path,.muted{color:var(--muted);font-size:.85em}.katex-display{overflow:auto;padding:8px}input{width:100%;padding:12px;font:inherit;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--fg)}.document-tree ul{list-style:none;margin:0;padding-left:22px;border-left:1px solid var(--border)}.document-tree>ul{padding-left:0;border-left:0}.document-tree summary{cursor:pointer;padding:8px 0;font-weight:650;overflow-wrap:anywhere}.document-tree summary:hover{color:var(--accent)}.document-tree summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px}.folder-count{color:var(--muted);font-size:.85em;font-weight:400}[hidden]{display:none!important}.entry{padding:8px 0;border-bottom:1px solid var(--border)}.entry a{font-weight:600}.entry small{margin-left:12px}.tools{display:flex;gap:20px;flex-wrap:wrap;margin:20px 0}.tools a{padding:10px 16px;background:var(--panel);border-radius:6px}@media(prefers-color-scheme:dark){:root{--bg:#17202c;--fg:#e4e9ef;--muted:#a6b3c5;--border:#3d4858;--panel:#202c3c;--accent:#8dc5ff}}`;
await writeFile(path.join(output,'assets/docs.css'),css);
function page(title,body,source=''){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · HPX</title><link rel="icon" href="/raw/docs/01-purpose/assets/logo.png"><link rel="stylesheet" href="/assets/docs.css"><link rel="stylesheet" href="/assets/katex.min.css"></head><body><header><a href="/index.html">Documentation index</a><a href="/diagrams/#/view/index">LikeC4 diagrams</a><a href="${fileURL('docs/04-architecture/SPECIFICATION.md')}">Specification</a></header><main>${source?'<p class="path">'+esc(source)+'</p>':''}${body}</main></body></html>`;}
function csvRows(text){let rows=[],row=[],field='',quoted=false;for(let i=0;i<text.length;i++){let c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);rows.push(row);row=[];field='';}else field+=c;}if(field||row.length){row.push(field);rows.push(row);}return rows;}
let current='',anchors;
const renderer=new Renderer();
renderer.heading=(text,level,raw)=>{const id=slug(raw);const count=anchors.get(id)??0;anchors.set(id,count+1);return `<h${level} id="${esc(id+(count?'-'+count:''))}">${text}</h${level}>\n`;};
renderer.html=html=>esc(html.replace(/<!--[\s\S]*?-->/g,''));
renderer.link=(href,title,text)=>{const url=link(href,current);return url?`<a href="${esc(url)}"${/^https?:/.test(url)?' rel="noreferrer"':''}>${text}</a>`:text;};
renderer.image=(href,title,text)=>{const url=link(href,current,true);return url?`<img src="${esc(url)}" alt="${esc(text)}" loading="lazy">`:`<span>${esc(text)}</span>`;};
const md=new Marked({gfm:true,renderer});
md.use({extensions:[{name:'displaymath',level:'block',start:s=>s.indexOf('$$'),tokenizer(s){const m=s.match(/^(?:\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\])(?:\s*\n|$)/);if(m)return{type:'displaymath',raw:m[0],text:m[1]??m[2]};},renderer(t){return katex.renderToString(t.text,{displayMode:true,throwOnError:false,trust:false});}},{name:'inlinemath',level:'inline',start:s=>s.indexOf('$'),tokenizer(s){const m=s.match(/^\$([^$\n]+)\$/);if(m)return{type:'inlinemath',raw:m[0],text:m[1]};},renderer(t){return katex.renderToString(t.text,{throwOnError:false,trust:false});}}]});
const entries=[];
for(const [name,ext]of [...sources].sort((a,b)=>a[0].localeCompare(b[0]))){
 if(['.png','.jpg','.jpeg','.gif','.webp','.svg','.woff','.woff2','.ttf'].includes(ext)){
  const dest=path.join(output,'raw',name);await mkdir(path.dirname(dest),{recursive:true});await cp(path.join(root,name),dest);continue;
 }
 const text=await readFile(path.join(root,name),'utf8');current=name;anchors=new Map();let body,title;
 if(ext==='.md'){title=text.match(/^#\s+(.+)$/m)?.[1]??path.basename(name);body=md.parse(text);}
 else{title=path.basename(name);body='<h1>'+esc(title)+'</h1>';if(ext==='.c4'&&views.get(name)?.length)body+='<div class="tools">'+views.get(name).map(id=>`<a href="/diagrams/#/view/${esc(id)}">${esc(id)}</a>`).join('')+'</div>';
 if(ext==='.csv'){const rows=csvRows(text);body+='<table><thead><tr>'+rows.shift().map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';}
 else body+='<pre><code>'+esc(ext==='.json'?JSON.stringify(JSON.parse(text),null,2):text)+'</code></pre>';}
 const dest=path.join(output,'files',name+'.html');await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,page(title,body,name));entries.push({name,title,url:fileURL(name),kind:ext.slice(1)||'text'});
}
entries.sort((a,b)=>{const rank=e=>e.name.startsWith('docs/')?0:e.kind==='md'?1:2;return rank(a)-rank(b)||a.name.localeCompare(b.name);});
const tree={folders:new Map(),files:[]};
for(const entry of entries){
 const parts=entry.name.split('/');parts.pop();let node=tree;
 for(const part of parts){if(!node.folders.has(part))node.folders.set(part,{folders:new Map(),files:[]});node=node.folders.get(part);}
 node.files.push(entry);
}
function treeHTML(node,depth=0){
 const folders=[...node.folders].sort(([a],[b])=>(a==='docs'?-1:b==='docs'?1:a.localeCompare(b,undefined,{numeric:true})));
 return '<ul>'+folders.map(([name,child])=>`<li class="folder"><details${depth===0?' open':''}><summary>${esc(name)}<span class="folder-count"></span></summary>${treeHTML(child,depth+1)}</details></li>`).join('')+node.files.map(e=>`<li class="entry" data-search="${esc((e.title+' '+e.name).toLowerCase())}"><a href="${e.url}">${esc(e.title)}</a><small>${esc(e.kind)}</small><div class="path">${esc(path.basename(e.name))}</div></li>`).join('')+'</ul>';
}
const list='<nav class="document-tree" aria-label="Document folders">'+treeHTML(tree)+'</nav>';
await writeFile(path.join(output,'assets/search.js'),`const q=document.querySelector('#search');
const rows=[...document.querySelectorAll('.entry')];
const folders=[...document.querySelectorAll('.folder')];
const status=document.querySelector('#search-status');let savedOpen=null;
function filter(){
 const terms=q.value.trim().toLowerCase().split(/\\s+/).filter(Boolean);
 if(terms.length&&!savedOpen)savedOpen=new Map(folders.map(f=>[f,f.firstElementChild.open]));
 let count=0;
 for(const row of rows){row.hidden=!terms.every(term=>row.dataset.search.includes(term));if(!row.hidden)count++;}
 for(const folder of [...folders].reverse()){
  const matching=[...folder.querySelectorAll('.entry')].filter(row=>!row.hidden).length;
  folder.hidden=matching===0;
  folder.querySelector('.folder-count').textContent=' ('+matching+')';
  if(terms.length)folder.firstElementChild.open=matching>0;
  else if(savedOpen)folder.firstElementChild.open=savedOpen.get(folder);
 }
 if(!terms.length)savedOpen=null;
 status.textContent=terms.length?(count?count+' matching documents':'No matching documents'):rows.length+' documents';
}
q.addEventListener('input',filter);filter();`);
await writeFile(path.join(output,'index.html'),page('Project documentation',`<h1>Hypergraph PX documentation</h1><p>${entries.length} readable documents and source records · ${[...views.values()].flat().length} LikeC4 views</p><div class="tools"><a href="/diagrams/#/view/index">Open interactive diagrams</a><a href="${fileURL('docs/README.md')}">Read documentation guide</a><a href="${fileURL('docs/09-guides/reference/DEVELOPMENT_STATE.md')}">Current development state</a></div><label for="search">Find a document</label><input id="search" type="search" placeholder="Search titles and paths…"><p id="search-status" class="muted" role="status" aria-live="polite"></p>${list}<script src="/assets/search.js"></script>`));
// LikeC4 stores source links as project-relative paths/file URIs. Translate
// generated data to this browser's readable documentation/source pages.
function diagramLink(value){
 const [raw,...hash]=value.split('#');let name;
 try{
  if(raw.startsWith('file:'))name=path.relative(root,fileURLToPath(raw)).split(path.sep).join('/');
  else if(/^[a-z][\w+.-]*:/i.test(raw))return null;
  else name=path.posix.normalize('docs/'+decodeURIComponent(raw));
 }catch{return null;}
 if(!sources.has(name))return null;
 const ext=sources.get(name);const target=['.png','.jpg','.jpeg','.svg','.gif','.webp'].includes(ext)?'/raw/'+urlPath(name):fileURL(name);
 return target+(hash.length?'#'+hash.join('#'):'');
}
async function patchDiagrams(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())await patchDiagrams(file);
  else if(entry.name.endsWith('.js')){
   const original=await readFile(file,'utf8');
   const rewritten=original.replace(/url:([`"'])([^`"']*)\1,relative:([`"'])([^`"']*)\3/g,(whole,_a,_url,_b,relative)=>{
    const href=diagramLink(relative);return href?'url:'+JSON.stringify(href)+',relative:'+JSON.stringify(href):whole;
   });
   if(rewritten!==original)await writeFile(file,rewritten);
  }
 }
}
await patchDiagrams(path.join(output,'diagrams'));
await writeFile(path.join(output,'build.json'),JSON.stringify({created:new Date().toISOString(),documents:entries.length,views:[...views.values()].flat(),sources:[...sources.keys()]},null,2)+'\n');
await writeFile(path.join(base,'latest.json'),JSON.stringify({output})+'\n');
console.log('Built index: '+path.join(output,'index.html'));
}else{
 output=await realpath(JSON.parse(await readFile(path.join(base,'latest.json'),'utf8')).output);
 if(!output.startsWith(base+path.sep)||!existsSync(path.join(output,'build.json')))throw Error('No valid documentation build; run without --serve-only first.');
}

if(buildOnly){console.log('Build complete. Run without --build-only to build and serve a clickable browser index.');process.exit(0);}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.wasm':'application/wasm','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{try{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 const host=req.headers.host;if(host!==`127.0.0.1:${server.address().port}`&&host!==`localhost:${server.address().port}`){res.writeHead(403);res.end();return;}
 const decoded=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);const candidate=path.resolve(output,'.'+(decoded.endsWith('/')?decoded+'index.html':decoded));
 if(!candidate.startsWith(output+path.sep)){res.writeHead(404);res.end();return;}
 const file=await realpath(candidate);if(!file.startsWith(output+path.sep)||!(await stat(file)).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.writeHead(404);res.end();}});
await new Promise((yes,no)=>{server.once('error',no);server.listen(port,'127.0.0.1',yes);});
console.log('\nDocumentation ready: '+terminalLink(`http://127.0.0.1:${server.address().port}/index.html`));
console.log('Keep this terminal open. Ctrl-C stops the documentation server.');
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>process.exit(0)));
