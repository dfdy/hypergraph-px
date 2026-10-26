import {test,expect} from './fixtures.js';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';

const frontend=fileURLToPath(new URL('../../',import.meta.url));
let moduleSource;
test.beforeAll(async()=>{
 const result=await build({absWorkingDir:frontend,entryPoints:['src/runtime-graph.js'],bundle:true,format:'esm',write:false});
 moduleSource=result.outputFiles[0].text;
});

test('graph choices and keyboard-accessible inspection scroll independently at desktop widths in both themes',async({page})=>{
 await page.route('**/graph-layout-test.js',route=>route.fulfill({contentType:'text/javascript',body:moduleSource}));await page.goto('/');
 await page.evaluate(async url=>{
  const {openRuntimeGraph}=await import(url),id=n=>Array(32).fill(n);
  const docs=new Map(Array.from({length:40},(_,i)=>[String(i),{id:String(i),title:`Synthetic document ${i+1} · retained Unicode 😀 context`} ]));
  const adapter={docs,lifecycle:'unlocked',get:key=>({runtime:{document:id(Number(key)+1)}}),documentGraph:async selection=>({projection:'document_forks',nodes:selection.map(key=>({document:id(Number(key)+1),node:id(Number(key)+101),title:docs.get(key).title})),edges:[],inputs_outside_selection:0})};
  window.__graphNotifications=[];openRuntimeGraph(adapter,'0',message=>window.__graphNotifications.push(message),()=>{});
 },'/graph-layout-test.js');
 const dialog=page.getByRole('dialog',{name:'Document fork graph'}),chooser=dialog.locator('.graph-chooser'),main=dialog.getByRole('region',{name:'Graph and inspection'});
 for(let i=1;i<16;i++)await chooser.getByRole('checkbox').nth(i).check();
 await dialog.getByRole('button',{name:'Show graph',exact:true}).click();await expect(dialog.locator('.graph-node')).toHaveCount(16);
 await main.getByText('Nodes and recorded relationships',{exact:true}).click();
 for(const width of [1280,1600,2000]){
  await page.setViewportSize({width,height:1000});
  for(const theme of ['dark','light']){
   await page.evaluate(theme=>document.body.classList.toggle('light',theme==='light'),theme);
   await chooser.evaluate(e=>{e.scrollTop=120;});const chosenTop=await chooser.evaluate(e=>e.scrollTop);
   await main.focus();await main.press('End');await expect.poll(()=>main.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);await expect.poll(()=>main.evaluate(e=>Math.abs(e.scrollHeight-e.clientHeight-e.scrollTop))).toBeLessThanOrEqual(1);
   expect(await chooser.evaluate(e=>e.scrollTop)).toBe(chosenTop);expect(await dialog.locator('.runtime-graph-layout').evaluate(e=>e.scrollTop)).toBe(0);
   const inspectionTop=await main.evaluate(e=>e.scrollTop);await chooser.getByRole('checkbox').last().focus();await expect(chooser.getByRole('checkbox').last()).toBeInViewport();
   expect(await main.evaluate(e=>e.scrollTop)).toBe(inspectionTop);await expect(dialog.getByRole('button',{name:'Close',exact:true})).toBeInViewport();
   await main.evaluate(e=>{e.scrollTop=0;});await chooser.evaluate(e=>{e.scrollTop=0;});
   const bounds=await dialog.boundingBox();expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(width);expect(bounds.y+bounds.height).toBeLessThanOrEqual(1000);
   await page.screenshot({path:`../artifacts/runtime-graph-layout-${theme}-${width}.png`,animations:'disabled'});
  }
 }
 expect(await page.evaluate(()=>window.__graphNotifications)).toEqual([]);
 await dialog.getByRole('button',{name:'Close',exact:true}).click();await expect(dialog).toHaveCount(0);
});
