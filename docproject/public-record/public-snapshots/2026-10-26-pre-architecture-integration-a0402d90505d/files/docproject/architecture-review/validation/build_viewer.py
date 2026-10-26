"""Generate a fully offline interactive browser for the validated diagram set."""
from pathlib import Path
import json, html
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'docproject/architecture-review'
diagrams=json.loads((OUT/'diagrams/index.json').read_text())
for d in diagrams:
    d['svg_text']=(OUT/d['svg']).read_text()
data=json.dumps(diagrams,ensure_ascii=False).replace('<','\\u003c')
page='''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>HPX architecture review — offline diagram browser</title>
<style>
*{box-sizing:border-box}body{font:16px system-ui,sans-serif;line-height:1.5;color:#17212b;background:#f7f8fa;margin:0}header,main{max-width:1600px;margin:auto;padding:20px}header{padding-bottom:0}h1{font-size:25px;margin:0}p{margin:8px 0}a{color:#1554a0}nav{display:flex;gap:16px;flex-wrap:wrap}section{background:white;border:1px solid #cbd1d8;border-radius:6px;padding:16px;margin:14px 0}.controls{display:grid;grid-template-columns:1fr 2fr 1fr;gap:14px;align-items:end}input,select{font:inherit;padding:8px;width:100%}label{display:block;font-weight:600}h2{font-size:21px;margin:0 0 8px}#canvas{overflow:auto;max-height:76vh;padding:14px;border:1px solid #ddd;background:white}#canvas svg{display:block;max-width:none!important;width:var(--zoom,100%)!important;height:auto!important;margin:auto}small{color:#45525f}button{font:inherit;padding:6px 10px;cursor:pointer}.children{display:flex;flex-wrap:wrap;gap:8px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media(max-width:900px){.controls,.meta{grid-template-columns:1fr}}
</style></head><body><header>
<h1>HPX architecture process review</h1><p>Offline diagram browser. Scope and source evidence accompany every view. This review does not enable future features or change accepted decisions.</p>
<nav><a href="../README.md">Review guide</a><a href="README.md">Full diagram index</a><a href="../process-inventory.md">Processes</a><a href="../findings/README.md">Findings</a><a href="../coverage-report.md">Coverage</a></nav>
</header><main>
<section class="controls"><div><label for="filter">Filter title, ID or process</label><input id="filter" type="search" placeholder="e.g. branch or 003.002"></div><div><label for="choice">Diagram</label><select id="choice"></select></div><div><label for="zoom">Diagram width: <span id="scale">100%</span></label><input type="range" id="zoom" min="50" max="220" value="100" step="10"></div></section>
<section><h2 id="title"></h2><p id="question"></p><p><strong>Scope:</strong> <span id="scope"></span></p><div id="canvas" aria-label="Architecture diagram"></div><p id="files"></p></section>
<section class="meta"><div><h2>Evidence and limits</h2><p id="limits"></p><div id="sources"></div></div><div><h2>Navigate responsibilities</h2><p id="processes"></p><div class="children" id="children"></div><p><small>L local documented behavior; G accepted/gated code; F future; D deferred. Interpret arrows by the stated notation. A trusted boundary is an assumption, not a hostile-host guarantee.</small></p></div></section>
</main><script>
const diagrams=DIAGRAM_DATA;
const byId=new Map(diagrams.map(d=>[d.id,d]));const sel=document.querySelector('#choice');
function text(id,s){document.getElementById(id).textContent=s}
function link(label,target){const a=document.createElement('a');a.textContent=label;a.href=target;return a}
function options(){const q=document.querySelector('#filter').value.toLowerCase();const current=sel.value;sel.replaceChildren();for(const d of diagrams){if(!(d.id+' '+d.title+' '+d.processes.join(' ')).toLowerCase().includes(q))continue;const o=document.createElement('option');o.value=d.id;o.textContent=d.id+' — '+d.title;sel.append(o)}if(byId.has(current)&&[...sel.options].some(o=>o.value===current))sel.value=current;if(sel.value)show(sel.value)}
function show(id){const d=byId.get(id);if(!d)return;sel.value=id;text('title',d.id+' — '+d.title);text('question',d.question);text('scope',d.milestone+' / '+d.viewpoint);text('limits',d.assumptions);document.querySelector('#canvas').innerHTML=d.svg_text;document.querySelector('#canvas').scrollTop=0;const files=document.querySelector('#files');files.replaceChildren(link('Standalone SVG',d.svg.replace('diagrams/','')),document.createTextNode(' · '),link('Editable Mermaid',d.path.replace('diagrams/','')));const src=document.querySelector('#sources');src.replaceChildren();for(const s of d.sources){const p=document.createElement('p');p.append(link(s.path+':'+s.line,'../../../'+s.path));src.append(p)}const ps=document.querySelector('#processes');ps.replaceChildren();for(const p of d.processes){ps.append(link(p,'../process-catalogue/'+p.split('.')[0]+'.md'),document.createTextNode(' '))}const ch=document.querySelector('#children');ch.replaceChildren();for(const c of d.children){const b=document.createElement('button');b.textContent=c;b.onclick=()=>{document.querySelector('#filter').value='';options();show(c)};ch.append(b)}history.replaceState(null,'','#'+id)}
document.querySelector('#filter').addEventListener('input',options);sel.addEventListener('change',()=>show(sel.value));document.querySelector('#zoom').addEventListener('input',e=>{document.querySelector('#canvas').style.setProperty('--zoom',e.target.value+'%');text('scale',e.target.value+'%')});options();if(byId.has(location.hash.slice(1)))show(location.hash.slice(1));
</script></body></html>
'''.replace('DIAGRAM_DATA',data)
(OUT/'diagrams/viewer.html').write_text(page)
print(json.dumps({'offline_viewer_diagrams':len(diagrams),'bytes':len(page.encode())}))
