// Component-only synthetic evidence; real branch/editor integration remains separate.
import {test,expect} from './fixtures.js';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const frontend=fileURLToPath(new URL('../../',import.meta.url)),styles=await readFile(new URL('../../styles.css',import.meta.url),'utf8');let bundle;
test.beforeAll(async()=>{const result=await build({stdin:{contents:"import {openBranches} from './src/runtime-branches-panel.js';import {appendWorkingClipboard} from './src/runtime-working-clipboard-panel.js';window.__workingPanels={openBranches,appendWorkingClipboard};",resolveDir:frontend},bundle:true,format:'iife',write:false});bundle=result.outputFiles[0].text;});
async function open(page){await page.goto('about:blank');await page.addStyleTag({content:styles});await page.addScriptTag({content:bundle});await page.evaluate(()=>{
 const id=n=>Array(32).fill(n),doc=id(1),source={kind:'working_checkpoint',document:doc,node:id(2),branch:id(3),working_branch:id(4),checkpoint:id(5),occurrence_path:[id(6)],start_byte:0,end_byte:9};
 window.__selected=[];window.__created=[];window.__adapter={features:{workingCopy:true},lifecycle:'unlocked',branchPending:null,docs:new Map([[doc.map(n=>n.toString(16).padStart(2,'0')).join(''),{title:'Synthetic research'}]]),get:()=>({id:'synthetic',runtime:{document:doc,branch:id(3),snapshot:id(7)},source:'Newer private typing'}),snapshot:async()=>({text:'# Reviewed committed source\r\n\r\n| Claim | Evidence |\r\n| --- | --- |\r\n| A | B |\r\n\r\n$$x^2$$\r\n\r\nExact 😀中\rfinal'}),branchPage:async()=>({original_branch:id(3),entries:[{branch:id(8),name:'Alternative interpretation'}],next:null}),createBranch:async(_doc,name,captured)=>{window.__created.push({name,captured});return {branch:id(9)};},workingClipboard:{entries:[{id:id(10),target:{kind:'working',source},preview:'<script>😀'}],generation:1,total:1,next:null,pending:null,inspect:async()=>({passage:'<script>😀\r\n中',promotion:null})}};
 });}
test('branch review is bounded at desktop widths and explicitly excludes pending edits',async({page})=>{
 await open(page);
 for(const theme of ['light','dark'])for(const width of [1280,1600,2000]){
  await page.setViewportSize({width,height:1000});await page.evaluate(theme=>{document.body.classList.toggle('light',theme==='light');window.__workingPanels.openBranches(window.__adapter,'synthetic',{select:branch=>{window.__selected.push(branch);},notify:()=>{}});},theme);
  const popup=page.getByRole('dialog',{name:'Document branches'});await expect(popup.getByRole('button',{name:'Original branch · current'})).toBeDisabled();await expect(popup.getByRole('button',{name:'Alternative interpretation'})).toBeVisible();await expect(popup).toContainText('pending edits are excluded');await expect(popup.locator('pre')).toContainText('Exact 😀中');
  const box=await popup.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);expect(box.height).toBeLessThanOrEqual(1000);
  await page.screenshot({path:resolve(frontend,`../artifacts/branch-review-${theme}-${width}.png`)});await popup.getByRole('button',{name:'Close',exact:true}).click();await expect(popup).toHaveCount(0);
 }
});
test('child creation publishes the reviewed context while Cancel creates no branch',async({page})=>{
 await open(page);await page.evaluate(()=>window.__workingPanels.openBranches(window.__adapter,'synthetic',{select:branch=>window.__selected.push(branch),notify:()=>{}}));
 let popup=page.getByRole('dialog',{name:'Document branches'});await expect(popup.getByRole('button',{name:'Create child branch'})).toBeEnabled();await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.__created.length)).toBe(0);
 await page.evaluate(()=>window.__workingPanels.openBranches(window.__adapter,'synthetic',{select:branch=>window.__selected.push(branch),notify:()=>{}}));popup=page.getByRole('dialog',{name:'Document branches'});await popup.getByRole('textbox',{name:'New branch name'}).fill('Named child');await popup.getByRole('button',{name:'Create child branch'}).click();await expect(popup).toHaveCount(0);const created=await page.evaluate(()=>window.__created);expect(created).toHaveLength(1);expect(created[0].captured.runtime.snapshot).toEqual(Array(32).fill(7));
});
test('working-source inspection stays inert and is labelled as an unpublished checkpoint',async({page})=>{
 await open(page);await page.evaluate(()=>{const mount=document.createElement('div');mount.id='working-component';document.body.append(mount);window.__workingPanels.appendWorkingClipboard(mount,window.__adapter,{busy:false,change:fn=>fn(),notify:()=>{}});});
 await page.locator('#working-component').getByRole('button',{name:/Working checkpoint/}).click();const popup=page.getByRole('dialog',{name:'Retained working source'});await expect(popup).toContainText('It has not been promoted');expect(await popup.locator('pre').textContent()).toBe('<script>😀\r\n中');expect(await popup.locator('script').count()).toBe(0);
 for(const theme of ['light','dark']){await page.evaluate(t=>document.body.classList.toggle('light',t==='light'),theme);await page.setViewportSize({width:1280,height:1000});await page.screenshot({path:resolve(frontend,`../artifacts/working-inspection-${theme}-1280.png`)});}
 await popup.getByRole('button',{name:'Close source'}).click();await expect(popup).toHaveCount(0);
});
