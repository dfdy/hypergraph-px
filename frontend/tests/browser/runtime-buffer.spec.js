// Synthetic runtime UI contract only. No HTTPS runtime, certificate bypass or trust changes.
import {test,expect} from './fixtures.js';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const frontend=fileURLToPath(new URL('../../',import.meta.url));
const original='A😀e\u0301\r\nB\nC\rD';
let mockBundle;
test.beforeAll(async()=>{
 const fixture=`
 const original=${JSON.stringify(original)},identity=n=>Array(32).fill(n);
 const states=[1,2].map(n=>({document:identity(n),base:identity(n+10),snapshot:identity(n+20),title:'Owned document '+n,text:original,generation:0,acknowledged_sequence:0}));
 window.__runtimeCalls=[];
 const request=async(path,body)=>{window.__runtimeCalls.push({path,body:structuredClone(body)});if(window.__holdRuntime)await new Promise(resolve=>{window.__releaseRuntime=resolve;});
 if(path==='lock')return {locked:true};if(path==='snapshot')return {text:original};
 const command=body.request,state=states.find(s=>s.document[0]===command.document[0]);
 state.generation++;state.acknowledged_sequence=command.sequence;return {operation:body.operation,outcome:{result:command.command==='save'?'saved':'committed',document:state.document,generation:state.generation,sequence:command.sequence,revision:identity(80),snapshot:identity(81)}};};
 const adapter=new RuntimeAdapter(states,request);window.__runtimeAdapter=adapter;
 return {adapter,documents:[...adapter.docs.values()].map(d=>({id:d.id,title:d.title,source:d.source}))};`;
 const result=await build({absWorkingDir:frontend,entryPoints:['src/app.js'],bundle:true,format:'esm',write:false,plugins:[{name:'synthetic-runtime-only',setup(builder){builder.onLoad({filter:/runtime-adapter\.js$/},async args=>{
  const source=await readFile(args.path,'utf8');
  return {contents:source.replace("if(location.protocol!=='https:')return null;",fixture),loader:'js'};
 });}}]});mockBundle=result.outputFiles[0].text;
});
async function open(page){
 page.on('dialog',dialog=>dialog.accept());await page.route('**/app.js',route=>route.fulfill({contentType:'text/javascript',body:mockBundle}));await page.goto('/');await expect(page.locator('.demo-badge')).toHaveText('Encrypted local workspace');await expect(page.locator('.cm-content')).toBeVisible();
}
const source=page=>page.evaluate(()=>window.__runtimeAdapter.get([...window.__runtimeAdapter.docs.keys()][0]).source);

test('synthetic runtime UI preserves exact mixed newlines through typing, copy, download and undo',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await open(page);const editor=page.getByRole('textbox',{name:'Markdown document editor'});
 await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.type('!');await expect.poll(()=>source(page)).toBe(original+'!');
 await page.keyboard.press('ControlOrMeta+z');await expect.poll(()=>source(page)).toBe(original);await page.keyboard.press('ControlOrMeta+Shift+z');await expect.poll(()=>source(page)).toBe(original+'!');
 await page.keyboard.press('ControlOrMeta+A');const copied=await editor.evaluate(element=>{const data=new DataTransfer();element.dispatchEvent(new ClipboardEvent('copy',{bubbles:true,cancelable:true,clipboardData:data}));return data.getData('text/plain');});expect(copied).toBe(original+'!');
 const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;expect((await readFile(await download.path())).toString('utf8')).toBe(original+'!');
 await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__runtimeCalls.at(-1)?.body?.request?.text)).toBe(original+'!');expect(errors).toEqual([]);
});

test('synthetic runtime paste retains exact newlines, and locking blocks edits across document switches',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await open(page);const editor=page.getByRole('textbox',{name:'Markdown document editor'}),pasted='P😀\rQ\r\nR\n';
 await editor.focus();await page.keyboard.press('ControlOrMeta+A');await editor.evaluate((element,text)=>{const data=new DataTransfer();data.setData('text/plain',text);element.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));},pasted);
 await expect.poll(()=>source(page)).toBe(pasted);await page.keyboard.press('ControlOrMeta+z');await expect.poll(()=>source(page)).toBe(original);await page.keyboard.press('ControlOrMeta+Shift+z');await expect.poll(()=>source(page)).toBe(pasted);
 await page.evaluate(()=>{window.__holdRuntime=true;});await page.getByRole('button',{name:'Lock',exact:true}).click();await expect(editor).toHaveAttribute('contenteditable','false');
 await page.getByRole('button',{name:'Owned document 2',exact:true}).click();await expect(editor).toHaveAttribute('contenteditable','false');await page.getByRole('button',{name:'Owned document 1',exact:true}).click();await expect(editor).toHaveAttribute('contenteditable','false');
 await editor.focus();await page.keyboard.type('Must not be inserted');expect(await source(page)).toBe(pasted);expect(errors).toEqual([]);
});
