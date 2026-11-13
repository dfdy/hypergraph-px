// Synthetic component checks; retained-source persistence is tested separately.
import {test,expect} from './fixtures.js';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
let bundle;
test.beforeAll(async()=>{const result=await build({stdin:{contents:"import {renderDerivation} from './src/runtime-derivation.js';import {RuntimeWorkingClipboard} from './src/runtime-working-clipboard.js';window.renderDerivation=renderDerivation;window.WorkingClipboard=RuntimeWorkingClipboard;",resolveDir:fileURLToPath(new URL('../../',import.meta.url))},bundle:true,format:'iife',write:false});bundle=result.outputFiles[0].text;});
async function setup(page){
 await page.goto('about:blank');await page.addScriptTag({content:bundle});await page.evaluate(()=>{
  const id=n=>Array(32).fill(n),key=id=>id.map(n=>n.toString(16).padStart(2,'0')).join(''),text='<script>😀\r\n中\r';
  const source={kind:'working_checkpoint',document:id(1),node:id(2),branch:id(3),working_branch:id(4),checkpoint:id(5),occurrence_path:[id(6)],start_byte:0,end_byte:new TextEncoder().encode(text).length};
  window.eventRecord={kind:'working_fork',transformation:id(7),operation:id(8),actor:id(9),device:id(10),input:source,output:{document:id(11),node:id(12),snapshot:id(13),revision:id(14),occurrence_path:[id(15)],start_byte:0,end_byte:source.end_byte}};
  window.calls=[];window.errors=[];window.deny=false;window.delay=false;
  const missing=()=>{throw Object.assign(Error('Missing'),{status:404});};
  const request=async(path,body)=>{window.calls.push({path,body:structuredClone(body)});if(path==='working/derivation')return structuredClone(window.eventRecord);if(path==='working/source'){if(window.deny)throw Object.assign(Error('Denied'),{status:403});if(window.delay)await new Promise(resolve=>window.release=resolve);return {source:structuredClone(source),text,base:id(16),sequence:3,publication:'private_working_checkpoint',promotion:null};}return missing();};
  window.adapter={features:{workingCopy:true},lifecycle:'unlocked',get:()=>({runtime:{document:id(11)}}),docs:new Map(),request,derivation:missing,workingClipboard:new window.WorkingClipboard(request,()=>id(17))};
  window.mount=document.createElement('div');document.body.append(window.mount);window.render=()=>window.renderDerivation(window.mount,window.adapter,key(id(11)),message=>window.errors.push(message));window.render();
 });
 await expect(page.getByRole('button',{name:'Inspect exact working fork source'})).toBeVisible();
}
test('working Fork inspects exact inert checkpoint bytes through the protected source reader',async({page})=>{
 await setup(page);await expect(page.locator('h3')).toHaveText('Forked from unpublished working source');await page.getByRole('button',{name:'Inspect exact working fork source'}).click();
 const dialog=page.getByRole('dialog');expect(await dialog.locator('pre').textContent()).toBe('<script>😀\r\n中\r');await expect(dialog.locator('script')).toHaveCount(0);await expect(dialog).toContainText('unpublished source');
 expect((await page.evaluate(()=>window.calls)).map(c=>c.path)).toEqual(['merge','working/derivation','working/source']);await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
});
test('working Fork rejects mismatched evidence and current access denial',async({page})=>{
 await setup(page);await page.evaluate(()=>{window.deny=true;});await page.getByRole('button',{name:'Inspect exact working fork source'}).click();await expect.poll(()=>page.evaluate(()=>window.errors)).toEqual(['Denied']);await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.evaluate(()=>{window.eventRecord.output.node=window.eventRecord.input.node;window.mount.replaceChildren();window.render();});await expect(page.locator('p')).toContainText('Invalid recorded working-source derivation');await expect(page.getByRole('button')).toHaveCount(0);
});
test('delayed protected source cannot open after lock or panel replacement',async({page})=>{
 for(const action of ['lock','replace']){
  await setup(page);await page.evaluate(()=>{window.delay=true;});await page.getByRole('button',{name:'Inspect exact working fork source'}).click();await expect.poll(()=>page.evaluate(()=>!!window.release)).toBe(true);
  await page.evaluate(action=>{if(action==='lock')window.adapter.lifecycle='locked';else window.mount.replaceChildren();window.release();},action);await expect(page.getByRole('dialog')).toHaveCount(0);
 }
});
