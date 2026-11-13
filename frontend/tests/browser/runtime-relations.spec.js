// Exact committed semantic-label projection through the app; no real server in these fixtures.
import {test,expect} from './fixtures.js';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const raw='# Scope\r\n\r\n| A | B |\r\n| --- | --- |\r\n| a | b |\r\n\r\n$$\r\nx=1\r\n$$\r\n\r\n## Below widgets\r\n\r\nFirst claim 😀. Second claim e\u0301.\r\n\r\nThird paragraph.\r\n\r\nFourth paragraph.';
let bundle;
test.beforeAll(async()=>{
 const fixture=`
 const original=${JSON.stringify(raw)},identity=n=>Array(32).fill(n),bytes=text=>new TextEncoder().encode(text).length;
 const state={document:identity(1),node:identity(2),branch:identity(3),base:identity(4),snapshot:identity(5),occurrence:identity(6),manifest:identity(7),draft:identity(8),title:'Relations fixture',text:original,generation:0,acknowledged_sequence:0};
 const source=text=>{const from=original.indexOf(text);return {document:state.document,node:state.node,snapshot:state.snapshot,revision:state.base,occurrence_path:[state.occurrence],start_byte:bytes(original.slice(0,from)),end_byte:bytes(original.slice(0,from+text.length))};};
 const entry=(n,label,left,right,status='proposed')=>({revision:identity(n+1),generation:0,record:{node:identity(n),parent:null,definition:identity(n+100),participants:[{role:'source',source:source(left)},{role:'target',source:source(right)}],properties:{negated:false,certainty:'unspecified',attribution:'',scope:''},status,proposer:identity(40),actor:identity(40),device:identity(41),operation:identity(n+2)},definition:{version:identity(n+100),definition:{predicate_id:'test:relation:'+n,registry_version:1,label,description:'Retrospective claim, not a checked proof.',context_fields:[],symmetric:false,participant_mode:'binary',roles:[{id:'source',label:'Source'},{id:'target',label:'Target'}]}}});
 const entries=[entry(20,'determines','First claim 😀.','Second claim é.'),entry(24,'justifies','First claim 😀.','Second claim é.','accepted'),entry(28,'contrasts','Third paragraph.','Fourth paragraph.'),entry(32,'rejects','First claim 😀.','Second claim é.','rejected')];
 if(window.__twoParagraphRelations)entries.push(entry(44,'justifies','Third paragraph.','Fourth paragraph.'));
 if(window.__manyRelations)for(let n=0;n<8;n++)entries.push(entry(80+n*4,'extra '+n,'First claim 😀.','Second claim é.'));
 const snapshots=new Map([[JSON.stringify(state.snapshot),original]]);let next=70,assertionGeneration=1;
 window.__relationCalls=[];window.__pendingRelationReads=[];
 const request=async(path,body)=>{
  window.__relationCalls.push({path,body:structuredClone(body)});
  if(path==='assertions'){if(window.__delayRelationReads)await new Promise(resolve=>window.__pendingRelationReads.push(resolve));if(window.__denyRelations)throw Object.assign(Error('Denied'),{status:403});const selected=entries.slice(body.offset,body.offset+body.limit);return {document:body.document,snapshot:body.snapshot,text_snapshot_scope:'semantic_assertions_excluded',generation:assertionGeneration,total:entries.length,entries:structuredClone(selected),next:body.offset+selected.length<entries.length?body.offset+selected.length:null};}
  if(path==='snapshot')return {text:snapshots.get(JSON.stringify(body.snapshot))};
  if(path==='lock'){if(window.__holdRelationLock)await new Promise(resolve=>window.__releaseRelationLock=resolve);return {locked:true};}
  if(path==='anchor/resolve')return {text:new TextDecoder().decode(new TextEncoder().encode(original).slice(body.start_byte,body.end_byte))};
  if(path==='commands'){const command=body.request;if(command.command==='assertion'){const mutation=command.mutation,e=entries.find(e=>JSON.stringify(e.record.node)===JSON.stringify(mutation.node));e.record.parent=e.revision;e.revision=identity(next++);e.generation++;e.record.status=mutation.status;e.record.operation=body.operation;assertionGeneration++;return {operation:body.operation,outcome:{result:'assertion',state:{node:e.record.node,revision:e.revision,generation:e.generation,status:e.record.status,deduplicated:false}}};}state.generation++;if(command.command==='save'){state.text=command.text;state.acknowledged_sequence=command.sequence;}else{state.base=identity(next++);state.snapshot=identity(next++);snapshots.set(JSON.stringify(state.snapshot),state.text);}return {operation:body.operation,outcome:{result:command.command==='save'?'saved':'committed',document:state.document,generation:state.generation,sequence:state.acknowledged_sequence,revision:state.base,snapshot:state.snapshot}};}
  throw Error('Unexpected fixture request: '+path);
 };
 const adapter=new RuntimeAdapter([state],request);window.__relationAdapter=adapter;
 return {adapter,documents:[...adapter.docs.values()].map(d=>({id:d.id,title:d.title,source:d.source})),assertionsSupported:true};`;
 const result=await build({entryPoints:['src/app.js'],absWorkingDir:fileURLToPath(new URL('../../',import.meta.url)),bundle:true,format:'esm',write:false,plugins:[{name:'relation-fixture',setup(builder){builder.onLoad({filter:/runtime-adapter\.js$/},async args=>({contents:(await readFile(args.path,'utf8')).replace("if(location.protocol!=='https:')return null;",()=>fixture),loader:'js'}));}}]});bundle=result.outputFiles[0].text;
});
async function open(page,expected=3){await page.route('**/app.js',route=>route.fulfill({body:bundle,contentType:'text/javascript'}));await page.goto('/');await expect(page.locator('#editorHost .relationship-label')).toHaveCount(expected);}
const labels=page=>page.locator('#editorHost .relationship-label');
const source=page=>page.evaluate(()=>window.__relationAdapter.get([...window.__relationAdapter.docs.keys()][0]).source);
const copy=editor=>editor.evaluate(e=>{const data=new DataTransfer();e.dispatchEvent(new ClipboardEvent('copy',{bubbles:true,cancelable:true,clipboardData:data}));return data.getData('text/plain');});
test('durable brace labels preserve exact source/selection and inspect one relation with its roles',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await open(page);await expect(labels(page)).toHaveText(['{determines}','{justifies}','{contrasts}']);await expect(page.locator('#mapText .relationship-label')).toHaveCount(3);await expect(page.locator('.text-relation-scope')).toContainText('3 in text · 4 of 4 loaded');
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+A');expect(await copy(editor)).toBe(raw);await page.getByRole('button',{name:'Collapse investigation panel'}).click();await labels(page).first().click();await expect(page.locator('#investigation')).not.toHaveClass(/collapsed/);await expect(page.locator('.assertion-card.inspected')).toContainText('determines');await expect(page.locator('.assertion-card.inspected')).toContainText('Source · exact historical participant');expect(await copy(editor)).toBe(raw);
 await page.getByRole('button',{name:'Inspect source participant',exact:true}).click();await expect(page.getByRole('dialog').locator('pre')).toHaveText('First claim 😀.');await page.getByRole('button',{name:'Close source',exact:true}).click();await labels(page).nth(1).focus();await page.keyboard.press('Enter');await expect(page.locator('.assertion-card.inspected')).toContainText('justifies');expect(await source(page)).toBe(raw);expect(errors).toEqual([]);
});
test('typing hides durable labels without relocating them; Undo restores exact matching source and later Commit does not retarget old claims',async({page})=>{
 await open(page);const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.type('!');await expect(labels(page)).toHaveCount(0);await expect(page.locator('.text-relation-scope')).toContainText('hidden while writing');await page.keyboard.press('ControlOrMeta+z');await expect(labels(page)).toHaveCount(3);expect(await source(page)).toBe(raw);
 await page.keyboard.type('!');await page.getByRole('button',{name:'Commit',exact:true}).click();await expect(labels(page)).toHaveCount(0);await expect(page.locator('.text-relation-scope')).toContainText('0 in text');await page.getByRole('checkbox',{name:'Show all retained assertions in this document'}).check();await expect(page.locator('.assertion-card')).toHaveCount(4);
});
test('delayed and denied reads never redraw labels into changed or locked text',async({page})=>{
 await open(page);await page.evaluate(()=>window.__delayRelationReads=true);await page.getByRole('button',{name:'Refresh text relations',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__pendingRelationReads.length)).toBeGreaterThan(0);
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.type('!');await page.evaluate(()=>{window.__delayRelationReads=false;window.__pendingRelationReads.splice(0).forEach(resolve=>resolve());});await expect(labels(page)).toHaveCount(0);
 await page.keyboard.press('ControlOrMeta+z');await expect(labels(page)).toHaveCount(3);await page.evaluate(()=>window.__denyRelations=true);await page.getByRole('button',{name:'Refresh text relations',exact:true}).click();await expect(labels(page)).toHaveCount(0);await expect(page.locator('.text-relation-scope')).toContainText('unavailable');
 await page.evaluate(()=>{window.__denyRelations=false;window.__holdRelationLock=true;});await page.getByRole('button',{name:'Refresh text relations',exact:true}).click();await expect(labels(page)).toHaveCount(3);await page.getByRole('button',{name:'Lock',exact:true}).click();await expect(labels(page)).toHaveCount(0);await expect(editor).toHaveAttribute('contenteditable','false');
});

test('additional protected pages extend the exact label projection without claiming unloaded relations are absent',async({page})=>{
 await page.addInitScript(()=>window.__manyRelations=true);await open(page,7);await expect(page.locator('.text-relation-scope')).toContainText('8 of 12 loaded');await page.getByRole('button',{name:'More assertions',exact:true}).click();await expect(labels(page)).toHaveCount(11);await expect(page.locator('.text-relation-scope')).toContainText('12 of 12 loaded');expect(await source(page)).toBe(raw);
});

test('an unchanged explicit Commit cannot carry old-snapshot labels into a newer head while another pane is open',async({page})=>{
 await open(page);await page.getByRole('tab',{name:'Concepts',exact:true}).click();await page.getByRole('button',{name:'Commit',exact:true}).click();await expect(labels(page)).toHaveCount(0);await expect(page.locator('.text-relation-scope')).toContainText('0 in text');expect(await source(page)).toBe(raw);
});

test('review updates word status and hides rejected controls without rewriting source or deleting retained claims',async({page})=>{
 await open(page);await labels(page).first().click();await page.getByRole('button',{name:'Accept assertion',exact:true}).click();await expect(labels(page).filter({hasText:'{determines}'})).toHaveAttribute('data-status','accepted');await expect(page.locator('.assertion-card.inspected')).toContainText('Accepted');
 await page.getByRole('button',{name:'Reject assertion',exact:true}).click();await expect(labels(page)).toHaveCount(2);await expect(page.locator('.assertion-card.inspected')).toContainText('Rejected');expect(await source(page)).toBe(raw);expect(await page.evaluate(()=>window.__relationCalls.filter(c=>c.path==='commands'&&['save','commit'].includes(c.body.request.command)).length)).toBe(0);
});

test('multiple paragraph word controls float together at the centered source gap',async({page})=>{
 await page.addInitScript(()=>window.__twoParagraphRelations=true);await open(page,4);const group=page.locator('#editorHost .relationship-paragraph');await expect(group.locator('button')).toHaveText(['{contrasts}','{justifies}']);const delta=await group.evaluate(marker=>{const a=marker.getBoundingClientRect(),b=marker.closest('.cm-line').getBoundingClientRect();return (a.left+a.right-b.left-b.right)/2;});expect(Math.abs(delta)).toBeLessThan(2);expect(await source(page)).toBe(raw);
});
