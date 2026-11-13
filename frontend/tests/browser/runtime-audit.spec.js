// Synthetic component evidence; actual HTTPS/SQLite is verified by the runtime workflow.
import {test,expect} from './fixtures.js';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
let bundle;const styles=await readFile(new URL('../../styles.css',import.meta.url),'utf8');
test.beforeAll(async()=>{const result=await build({stdin:{contents:"import {openDocumentAudit} from './src/runtime-audit-panel.js';window.openAudit=openDocumentAudit;",resolveDir:fileURLToPath(new URL('../../',import.meta.url))},bundle:true,format:'iife',write:false});bundle=result.outputFiles[0].text;});
async function open(page){await page.goto('about:blank');await page.addStyleTag({content:styles});await page.addScriptTag({content:bundle});await page.evaluate(()=>{
 window.calls=0;window.delayed=false;window.finding=null;window.denied=false;
 window.adapter={lifecycle:'unlocked',get:()=>({title:'<script>Untouched child source',runtime:{branch:Array(32).fill(9)}}),auditDocument:async()=>{window.calls++;if(window.delayed)await new Promise(r=>window.release=r);if(window.denied)throw Error('Current scope denied');return {finding:window.finding};}};
 window.openAudit(window.adapter,'captured-document');
 });}
test('audit explains original-branch scope before running and labels the bounded success',async({page})=>{
 await open(page);const dialog=page.getByRole('dialog',{name:'Original branch integrity'});await expect(dialog).toContainText('does not save typing');await expect(dialog).toContainText('Named branches');expect(await page.evaluate(()=>window.calls)).toBe(0);await expect(dialog.locator('script')).toHaveCount(0);
 await dialog.getByRole('button',{name:'Run integrity check'}).click();await expect(dialog.getByRole('status')).toHaveText('All 8 selected records passed this check.');await expect(dialog).toContainText('No repair was performed');await dialog.getByRole('button',{name:'Close',exact:true}).click();await expect(dialog).toHaveCount(0);
});
test('partial findings and denied reads never become a successful workspace status',async({page})=>{
 await open(page);const dialog=page.getByRole('dialog',{name:'Original branch integrity'});await page.evaluate(()=>window.finding={record:'draft',problem:'budget'});await dialog.getByRole('button',{name:'Run integrity check'}).click();await expect(dialog).toContainText('Check incomplete · stopped at saved working buffer');await expect(dialog).toContainText('Remaining dependent records were not checked');await page.evaluate(()=>window.denied=true);await dialog.getByRole('button',{name:'Run integrity check'}).click();await expect(dialog.getByRole('status')).toHaveText('Integrity check unavailable.');await expect(dialog).toContainText('Current scope denied');
});
test('closing or locking discards delayed audit results',async({page})=>{
 for(const action of ['close','lock']){await open(page);const dialog=page.getByRole('dialog',{name:'Original branch integrity'});await page.evaluate(()=>window.delayed=true);await dialog.getByRole('button',{name:'Run integrity check'}).click();await expect.poll(()=>page.evaluate(()=>!!window.release)).toBe(true);if(action==='close')await page.keyboard.press('Escape');else await page.evaluate(()=>window.adapter.lifecycle='locked');await page.evaluate(()=>window.release());if(action==='close')await expect(dialog).toHaveCount(0);else await expect(dialog.getByRole('status')).toHaveText('Checking saved original-branch records…');}
});
