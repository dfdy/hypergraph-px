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
 const snapshots=new Map(states.map(s=>[JSON.stringify(s.snapshot),s.text])),receipts=new Map();let next=80;
 window.__runtimeCalls=[];
 const request=async(path,body)=>{window.__runtimeCalls.push({path,body:structuredClone(body)});if(window.__holdRuntime)await new Promise(resolve=>{window.__releaseRuntime=resolve;});
 if(path==='lock')return {locked:true};if(path==='snapshot')return {text:snapshots.get(JSON.stringify(body.snapshot))};
 const command=body.request,state=states.find(s=>s.document[0]===command.document[0]);
 if(window.__denyDeparture&&command.command==='commit')throw Object.assign(Error('Synthetic publication denied'),{status:409});
 let receipt=receipts.get(JSON.stringify(body.operation));
 if(!receipt){state.generation++;state.acknowledged_sequence=command.sequence;if(command.command==='save')state.text=command.text;else{state.base=identity(next++);state.snapshot=identity(next++);snapshots.set(JSON.stringify(state.snapshot),state.text);}
 receipt={operation:body.operation,outcome:{result:command.command==='save'?'saved':'committed',document:state.document,generation:state.generation,sequence:command.sequence,revision:state.base,snapshot:state.snapshot}};receipts.set(JSON.stringify(body.operation),receipt);}
 if(command.command==='commit'&&window.__holdDeparture)await new Promise(resolve=>window.__releaseDeparture=resolve);
 if(command.command==='commit'&&window.__dropDeparture)throw Error('Synthetic lost departure reply');return structuredClone(receipt);};
 window.__snapshots=snapshots;
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

test('logical node departure commits exact source once while formatting and ordinary blur do not publish',async({page})=>{
 await open(page);const editor=page.getByRole('textbox',{name:'Markdown document editor'});
 await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.type('!');await page.getByRole('button',{name:'Bold',exact:true}).click();await page.locator('#undo').click();await page.locator('#documentTitle').click();
 const commits=()=>page.evaluate(()=>window.__runtimeCalls.filter(c=>c.body?.request?.command==='commit').length);expect(await commits()).toBe(0);
 const outgoing=await source(page);await page.getByRole('button',{name:'Owned document 2',exact:true}).click();await expect(page.locator('#documentTitle')).toHaveText('Owned document 2');expect(await commits()).toBe(1);
 expect(await page.evaluate(()=>{const d=window.__runtimeAdapter.get([...window.__runtimeAdapter.docs.keys()][0]);return window.__snapshots.get(JSON.stringify(d.runtime.snapshot));})).toBe(outgoing);
 await page.getByRole('button',{name:'Owned document 1',exact:true}).click();await expect(page.locator('#documentTitle')).toHaveText('Owned document 1');expect(await source(page)).toBe(outgoing);await editor.focus();await page.keyboard.press('ControlOrMeta+z');expect(await source(page)).toBe(original);
});
test('node departure waits for publication and retains source on denied or unknown acknowledgement',async({page})=>{
 await open(page);const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.type('!');
 await page.evaluate(()=>window.__denyDeparture=true);await page.getByRole('button',{name:'Owned document 2',exact:true}).click();await expect(page.locator('#toast')).toContainText('Could not leave this node');await expect(page.locator('#documentTitle')).toHaveText('Owned document 1');await expect(editor).toHaveAttribute('contenteditable','true');expect(await source(page)).toBe(original+'!');
 await page.evaluate(()=>{window.__denyDeparture=false;window.__dropDeparture=true;});await page.getByRole('button',{name:'Owned document 2',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__runtimeAdapter.get([...window.__runtimeAdapter.docs.keys()][0]).error)).toContain('lost departure');await expect(page.locator('#documentTitle')).toHaveText('Owned document 1');
 const operation=await page.evaluate(()=>window.__runtimeAdapter.get([...window.__runtimeAdapter.docs.keys()][0]).pending.operation);await page.evaluate(()=>window.__dropDeparture=false);await page.getByRole('button',{name:'Owned document 2',exact:true}).click();await expect(page.locator('#documentTitle')).toHaveText('Owned document 2');
 const operations=await page.evaluate(()=>window.__runtimeCalls.filter(c=>c.body?.request?.command==='commit').map(c=>c.body.operation));expect(operations.every(op=>JSON.stringify(op)===JSON.stringify(operation))).toBe(true);
});
test('delayed automatic publication suspends outgoing edits and competing navigation until acknowledged',async({page})=>{
 await open(page);const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.type('!');await page.evaluate(()=>window.__holdDeparture=true);
 await page.getByRole('button',{name:'Owned document 2',exact:true}).click();await expect(editor).toHaveAttribute('contenteditable','false');await expect(page.locator('#documentTitle')).toHaveText('Owned document 1');await expect.poll(()=>page.evaluate(()=>!!window.__releaseDeparture)).toBe(true);
 await page.evaluate(()=>{window.__holdDeparture=false;window.__releaseDeparture();});await expect(page.locator('#documentTitle')).toHaveText('Owned document 2');await expect(editor).toHaveAttribute('contenteditable','true');
});

test('Lock remains available while a departure Commit acknowledgement is delayed',async({page})=>{
 await open(page);const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.type('!');await page.evaluate(()=>window.__holdDeparture=true);
 await page.getByRole('button',{name:'Owned document 2',exact:true}).click();await expect.poll(()=>page.evaluate(()=>!!window.__releaseDeparture)).toBe(true);await page.getByRole('button',{name:'Lock',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__runtimeAdapter.lifecycle)).toBe('locking');await expect(editor).toHaveAttribute('contenteditable','false');
 const reloaded=page.waitForEvent('load');await page.evaluate(()=>{window.__holdDeparture=false;window.__releaseDeparture();});await reloaded;await expect(editor).toBeVisible();
});
test('Link accepts partial words, punctuation and emoji below widgets, with cancellation and one-step Undo',async({page})=>{
 await open(page);const editor=page.getByRole('textbox',{name:'Markdown document editor'}),text='# Target\r\n\r\n| A | B |\r\n| --- | --- |\r\n| a | b |\r\n\r\n$$\r\nx=1\r\n$$\r\n\r\nx partial 😀, [text]! y';
 await editor.focus();await page.keyboard.press('ControlOrMeta+A');await editor.evaluate((e,text)=>{const d=new DataTransfer();d.setData('text/plain',text);e.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:d}));},text);
 await page.keyboard.press('ControlOrMeta+End');await expect(page.getByRole('button',{name:'Link',exact:true})).toBeDisabled();await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowLeft');await page.keyboard.press('Shift+Home');for(let i=0;i<3;i++)await page.keyboard.press('Shift+ArrowRight');
 const link=page.getByRole('button',{name:'Link',exact:true});await expect(link).toBeEnabled();await link.click();await expect(page.getByLabel('Link text')).toHaveValue('artial 😀, [text]!');await page.getByRole('button',{name:'Cancel',exact:true}).click();expect(await source(page)).toBe(text);
 await link.click();await expect(page.getByLabel('Link text')).toHaveValue('artial 😀, [text]!');await page.getByLabel('Target heading').selectOption({label:'Target'});await page.getByRole('button',{name:'Insert Markdown link'}).click();expect(await source(page)).toBe(text.replace('artial 😀, [text]!','[artial 😀, \\[text\\]!](#target)'));
 await page.keyboard.press('ControlOrMeta+z');expect(await source(page)).toBe(text);expect(await page.evaluate(()=>window.__runtimeCalls.filter(c=>c.path==='commands'&&c.body.request.command==='commit').length)).toBe(0);
});
test('Link preserves selected multiline source bytes and stays unavailable without a target heading',async({page})=>{
 await open(page);const editor=page.getByRole('textbox',{name:'Markdown document editor'}),link=page.getByRole('button',{name:'Link',exact:true});await expect(link).toBeDisabled();
 const text='# Target\r\n\r\nalpha 😀\r\nbeta\rgamma';await editor.focus();await page.keyboard.press('ControlOrMeta+A');await editor.evaluate((e,text)=>{const d=new DataTransfer();d.setData('text/plain',text);e.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:d}));},text);
 await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await page.keyboard.press('ControlOrMeta+Shift+End');await link.click();await expect(page.getByLabel('Link text')).toHaveValue('alpha 😀\nbeta\ngamma');await page.getByRole('button',{name:'Insert Markdown link'}).click();expect(await source(page)).toBe('# Target\r\n\r\n[alpha 😀\r\nbeta\rgamma](#target)');await page.keyboard.press('ControlOrMeta+z');expect(await source(page)).toBe(text);
});
