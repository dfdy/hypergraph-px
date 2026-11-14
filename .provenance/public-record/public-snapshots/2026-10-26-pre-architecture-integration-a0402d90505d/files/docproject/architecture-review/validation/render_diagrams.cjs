// Analysis-only renderer. Existing Playwright + pinned temporary Mermaid; no install.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../../..');
const out = path.join(root, 'docproject/architecture-review');
const {chromium} = require(path.join(root, 'frontend/node_modules/playwright-core'));
const provenance = JSON.parse(fs.readFileSync(path.join(out,'validation/renderer-provenance.json')));
const bundle = path.join(provenance.cache,'mermaid.min.js');
if (crypto.createHash('sha256').update(fs.readFileSync(bundle)).digest('hex') !== provenance.bundle_sha256) throw Error('Renderer hash mismatch');
const diagrams = JSON.parse(fs.readFileSync(path.join(out,'diagrams/index.json')));
(async () => {
 const browser = await chromium.launch({headless:true});
 const results=[];
 try {
  const context=await browser.newContext({viewport:{width:1800,height:1200},deviceScaleFactor:1});
  await context.route('**/*',route=>route.abort());
  const page=await context.newPage();
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
  await page.addScriptTag({path:bundle});
  await page.evaluate(()=>mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'neutral',fontFamily:'Arial',themeVariables:{noteBkgColor:'#fff4cc',noteTextColor:'#222222',noteBorderColor:'#99884b'},flowchart:{htmlLabels:true,useMaxWidth:false},sequence:{useMaxWidth:false},state:{useMaxWidth:false}}));
  for (let i=0;i<diagrams.length;i++) {
   const d=diagrams[i]; const src=fs.readFileSync(path.join(root,d.path.startsWith('docproject/')?d.path:'docproject/architecture-review/'+d.path),'utf8');
   const start=Date.now();
   try {
    const rendered=await page.evaluate(async ({src,id,title,description})=>{
     await mermaid.parse(src);
     const result=await mermaid.render(id,src);
     // Mermaid HTML labels include browser HTML. Serialize the parsed SVG DOM
     // with namespace-aware XML serialization for standalone SVG portability.
     const holder=document.createElement('div'); holder.innerHTML=result.svg;
     const svg=holder.querySelector('svg');
     if(!svg) throw Error('No rendered SVG');
     svg.setAttribute('role','img');svg.setAttribute('aria-label',title);
     const titleNode=document.createElementNS('http://www.w3.org/2000/svg','title');titleNode.textContent=title;svg.prepend(titleNode);
     const desc=document.createElementNS('http://www.w3.org/2000/svg','desc');desc.textContent=description;svg.prepend(desc);
     const serialized=new XMLSerializer().serializeToString(svg);
     const doc=new DOMParser().parseFromString(serialized,'image/svg+xml');
     if(doc.querySelector('parsererror')) throw Error('Invalid SVG XML');
     const v=doc.documentElement.getAttribute('viewBox');
     return {svg:serialized,viewBox:v};
    },{src,id:'hpxDiagram'+i,title:d.id+' — '+d.title,description:d.question+' Scope: '+d.milestone+'. '+d.assumptions});
    fs.writeFileSync(path.join(out,d.svg.replace(/^diagrams\//,'diagrams/')),rendered.svg);
    results.push({id:d.id,parsed:true,rendered:true,svg_xml:true,viewBox:rendered.viewBox,elapsed_ms:Date.now()-start,source_sha256:crypto.createHash('sha256').update(src).digest('hex')});
   } catch(e) {results.push({id:d.id,parsed:false,rendered:false,error:String(e)});}
  }
  // Four contact sheets cover every rendered diagram; individual SVGs retain detail.
  const ok=diagrams.filter(d=>results.find(r=>r.id===d.id)?.rendered);
  for(let batch=0;batch<Math.ceil(ok.length/12);batch++){
   const subset=ok.slice(batch*12,batch*12+12);
   const cells=subset.map(d=>'<article><h3>'+d.id+' — '+d.title+'</h3><div>'+fs.readFileSync(path.join(out,d.svg),'utf8')+'</div></article>').join('');
   await page.setContent('<html><head><style>body{margin:20px;font:12px Arial;background:white}main{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}article{border:1px solid #aaa;padding:8px;height:340px;overflow:hidden}h3{font-size:12px;height:28px;margin:0}article>div{height:300px;display:flex;align-items:center;justify-content:center}svg{max-width:100%!important;max-height:300px!important;width:auto!important;height:auto!important}</style></head><body><main>'+cells+'</main></body></html>');
   await page.screenshot({path:path.join(out,'validation/contact-sheet-'+(batch+1)+'.png'),fullPage:true});
  }
  // Detailed previews of transaction, conceptual and threat views for inspection.
  for(const key of ['010','015','025']){
   const d=ok.find(x=>x.id==='HPX-DIAG-'+key); if(!d) continue;
   await page.setContent('<html><body style="margin:20px;background:white">'+fs.readFileSync(path.join(out,d.svg),'utf8')+'</body></html>');
   const dims=await page.locator('svg').boundingBox();
   await page.setViewportSize({width:Math.min(3200,Math.ceil(dims.width+40)),height:Math.min(2400,Math.ceil(dims.height+40))});
   await page.screenshot({path:path.join(out,'validation/detail-'+key+'.png'),fullPage:true});
  }
  await context.close();
 } finally {await browser.close();}
 fs.writeFileSync(path.join(out,'validation/diagram-results.json'),JSON.stringify({renderer:provenance.version,browser:chromium.executablePath(),headless:true,network:'All browser requests aborted; no personal profile or app server',results},null,2)+'\n');
 console.log(JSON.stringify({total:results.length,rendered:results.filter(r=>r.rendered).length,errors:results.filter(r=>!r.rendered)}));
 if(results.some(r=>!r.rendered)) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
