import {test,expect} from './fixtures.js';
import {readFile} from 'node:fs/promises';
async function source(page){const ready=page.waitForEvent('download');await page.getByRole('button',{name:'↓ Markdown',exact:true}).click();return readFile(await (await ready).path(),'utf8');}
async function movePanel(page,panel,position){await page.getByRole('button',{name:'Layout',exact:true}).click();await page.getByLabel('Panel to move').selectOption(panel);await page.getByLabel('Position relative to document').selectOption(position);await page.getByRole('button',{name:'Move panel',exact:true}).click();await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeFocused();}
test('docking preserves the same editor, exact source, selection, and undo across moves and resize',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());await page.goto('/');
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});await expect(editor).toBeVisible();const original=await source(page);
 await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.insertText('Docking 🧭 test\n\n');await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('Shift+End');
 await page.locator('.cm-editor').evaluate(element=>{window.dockingEditor=element;});
 for(const position of ['left','bottom','right']){
  await movePanel(page,'investigation',position);
  expect(await page.locator('.cm-editor').evaluate(element=>element===window.dockingEditor)).toBe(true);
  await editor.focus();await expect.poll(()=>page.evaluate(()=>getSelection().toString())).toBe('Docking 🧭 test');
  expect(await source(page)).toBe('Docking 🧭 test\n\n'+original);
 }
 await page.getByRole('separator',{name:'Resize interaction and investigation column',exact:true}).focus();await page.keyboard.press('ArrowLeft');await editor.focus();await expect.poll(()=>page.evaluate(()=>getSelection().toString())).toBe('Docking 🧭 test');
  await page.setViewportSize({width:1440,height:900});await page.getByRole('button',{name:'Undo',exact:true}).click();expect(await source(page)).toBe(original);
 await page.getByRole('button',{name:'Redo',exact:true}).click();expect(await source(page)).toBe('Docking 🧭 test\n\n'+original);expect(errors).toEqual([]);
});

test('desktop viewport resizing settles Dockview overlays without overflow or replacing the editor',async({page})=>{
 await page.goto('/');await expect(page.locator('.cm-editor')).toBeVisible();await page.locator('.cm-editor').evaluate(element=>window.resizingEditor=element);
 for(const width of [2000,1280,1600,2000,1280]){
  await page.setViewportSize({width,height:1000});
  await expect.poll(()=>page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,right:document.querySelector('.right-sidebar').getBoundingClientRect().right,editor:document.querySelector('.cm-editor')===window.resizingEditor}))).toEqual({overflow:false,right:width,editor:true});
 }
});

test('column resize cancellation remains reversible',async({page})=>{

 await page.goto('/');await expect(page.locator('.cm-editor')).toBeVisible();
 const handle=page.getByRole('separator',{name:'Resize workspace column',exact:true}),outline=page.locator('.workspace .navigator');

 const before=(await outline.boundingBox()).width,box=await handle.boundingBox();await page.mouse.move(box.x+4,box.y+150);await page.mouse.down();await page.mouse.move(box.x+44,box.y+150);await page.keyboard.press('Escape');await page.mouse.up();await expect.poll(async()=>(await outline.boundingBox()).width).toBeCloseTo(before,0);
});

test('pointer drag docks a real Dockview panel below the document without replacing the editor',async({page})=>{
 page.on('dialog',dialog=>dialog.accept());await page.goto('/');await expect(page.locator('.cm-editor')).toBeVisible();const original=await source(page);
  const content=page.getByRole('textbox',{name:'Markdown document editor'});await content.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('Shift+End');
  await page.locator('.cm-editor').evaluate(element=>window.dockingEditor=element);
 const tab=page.locator('.workspace-dock-tab').filter({hasText:'Interaction & Investigation'}),from=await tab.boundingBox(),document=await page.locator('.editor-surface').boundingBox();
 await page.mouse.move(from.x+40,from.y+12);await page.mouse.down();await page.mouse.move(document.x+document.width/2,document.y+document.height-45,{steps:20});await page.mouse.up();
 await expect.poll(async()=>{const side=await page.locator('.right-sidebar').boundingBox(),editor=await page.locator('.editor-surface').boundingBox();return side.y>=editor.y+editor.height;}).toBe(true);
 expect(await page.locator('.cm-editor').evaluate(element=>element===window.dockingEditor)).toBe(true);
 await expect(page.getByRole('separator',{name:'Resize interaction and investigation column',exact:true})).toBeHidden();
  await content.focus();await expect.poll(()=>page.evaluate(()=>getSelection().toString())).toBe('# 1. Introduction');expect(await source(page)).toBe(original);
});

test('Web Awesome controls and Dockview are self-contained and do not introduce external assets or CSP violations',async({page,request})=>{
 const remote=[],violations=[];await page.exposeFunction('recordDockViolation',value=>violations.push(value));
 await page.addInitScript(()=>document.addEventListener('securitypolicyviolation',event=>window.recordDockViolation({uri:event.blockedURI,directive:event.effectiveDirective})));
 page.on('request',request=>{if(/^https?:/.test(request.url())&&new URL(request.url()).hostname!=='127.0.0.1')remote.push(request.url());});
 await page.goto('/');await expect(page.locator('.cm-editor')).toBeVisible();
 await page.getByRole('button',{name:'Layout',exact:true}).click();await expect(page.getByRole('dialog',{name:'Workspace layout'})).toBeVisible();
 expect(await page.locator('#workspaceLayout').evaluate(element=>!!element.shadowRoot?.querySelector('button'))).toBe(true);
 await page.getByRole('button',{name:'Reset layout',exact:true}).click();await expect(page.getByRole('dialog',{name:'Workspace layout'})).not.toBeVisible();
 expect(remote).toEqual([]);
 // The pre-existing preview build-version fetch is blocked by connect-src none.
 expect(violations.filter(value=>!value.uri.endsWith('/build-version.json'))).toEqual([]);
 const notices=await (await request.get('/THIRD_PARTY_NOTICES.txt')).text();for(const name of ['dockview 8.9.0','dockview-core 8.9.0','@awesome.me/webawesome 3.14.0'])expect(notices).toContain(name);
});

for(const width of [1280,1440,1920])for(const light of [false,true])test(`desktop geometry and below-widget inspection ${width} ${light?'light':'dark'}`,async({page},info)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.setViewportSize({width,height:1000});await page.goto('/');await expect(page.locator('.cm-editor')).toBeVisible();
 if(light)await page.getByRole('button',{name:'Switch theme'}).click();await page.getByLabel('Maths display').selectOption('rendered');
 await page.locator('.outline button').filter({hasText:'Working with evidence'}).click();await expect(page.locator('#editorHost .rendered-table-block')).toHaveCount(1);
  await page.screenshot({path:info.outputPath(`table-${width}-${light?'light':'dark'}.png`)});
  await page.locator('.outline button').filter({hasText:'A small mathematical example'}).click();await expect(page.locator('#editorHost .math-rendered')).toHaveCount(2);
  await page.screenshot({path:info.outputPath(`math-${width}-${light?'light':'dark'}.png`)});
  await page.locator('.outline button').filter({hasText:'Closing reflection'}).click();await page.locator('.cm-scroller').evaluate(element=>{element.scrollTop=Math.max(0,element.scrollTop-180);});
 await page.evaluate(()=>document.fonts.ready);
 const geometry=await page.evaluate(()=>{const box=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();return {outline:box('.navigator'),editor:box('.editor-pane'),map:box('#documentNavigator'),sidebar:box('.right-sidebar'),overflow:document.documentElement.scrollWidth>innerWidth};});
 expect(geometry.overflow).toBe(false);expect(geometry.outline.width).toBe(226);expect(geometry.sidebar.width).toBe(348);expect(geometry.map.width).toBe(90);expect(geometry.outline.right).toBeLessThanOrEqual(geometry.editor.left+1);expect(geometry.editor.right).toBeLessThanOrEqual(geometry.map.left+1);expect(geometry.map.right).toBeLessThanOrEqual(geometry.sidebar.left+1);

 await page.screenshot({path:info.outputPath(`workspace-${width}-${light?'light':'dark'}.png`)});expect(errors).toEqual([]);
});
