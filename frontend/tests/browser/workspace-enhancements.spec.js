import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const errors=new WeakMap();
test.beforeEach(async({page})=>{errors.set(page,[]);page.on('pageerror',e=>errors.get(page).push(e.message));page.on('dialog',d=>d.accept());await page.goto('/');await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();});
test.afterEach(async({page})=>expect(errors.get(page)).toEqual([]));
async function source(page){const ready=page.waitForEvent('download');await page.getByRole('button',{name:'↓ Markdown',exact:true}).click();return readFile(await (await ready).path(),'utf8');}
async function point(page,word,offset=2){return page.locator('.cm-content').evaluate((root,{word,offset})=>{const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode())){const at=n.textContent.indexOf(word);if(at>=0){const r=document.createRange();r.setStart(n,at+offset);r.setEnd(n,at+offset+1);const box=r.getBoundingClientRect();return {x:box.left+box.width*.25,y:box.top+box.height/2};}}throw new Error('Missing source word '+word);},{word,offset});}
async function drag(page,from,to){await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:12});await page.mouse.up();}
// CodeMirror paints the DOM selection during its next measured view update.
// Assert the resulting range after it settles, rather than reading the prior drag.
async function expectSelected(page,text){await expect.poll(()=>page.evaluate(()=>window.getSelection().toString())).toBe(text);}
async function selected(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));return page.evaluate(()=>window.getSelection().toString());}
const count=async(page,id)=>Number((await page.locator(id).innerText()).replaceAll(',',''));

test('workspace/document totals follow edits, undo and independent forks; requested layout placements',async({page})=>{
 const original=await source(page),document=await count(page,'#wordCount'),workspace=await count(page,'#workspaceWordCount');expect(workspace).toBeGreaterThan(document);
 await expect(page.locator('#position')).toContainText(new RegExp('characters · Document .* words · Workspace .* words'));
 await expect(page.locator('#wordCount')).toHaveCSS('font-weight','700');await expect(page.locator('#workspaceWordCount')).toHaveCSS('font-weight','700');
 expect(await page.locator('.brand-px').evaluate(e=>getComputedStyle(e).fontSize)).toBe(await page.locator('.brand').evaluate(e=>getComputedStyle(e).fontSize));
 await expect(page.locator('.navigator-foot #download')).toBeVisible();await expect(page.locator('header #download')).toHaveCount(0);
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.insertText('Extra words\n\n');
 await expect.poll(()=>count(page,'#wordCount')).toBe(document+2);await expect.poll(()=>count(page,'#workspaceWordCount')).toBe(workspace+2);
 await page.getByRole('button',{name:'Undo',exact:true}).click();await expect.poll(()=>count(page,'#workspaceWordCount')).toBe(workspace);expect(await source(page)).toBe(original);
 await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('ControlOrMeta+Shift+End');await page.getByRole('button',{name:'Fork',exact:true}).click();await page.getByLabel('Fork name').fill('Counted test fork');await page.getByRole('button',{name:'Create demo fork'}).click();
 await expect.poll(()=>count(page,'#wordCount')).toBe(document);await expect.poll(()=>count(page,'#workspaceWordCount')).toBe(workspace+document);
});

test('column separators drag and resize by keyboard while Navigator stays fixed',async({page})=>{
 const original=await source(page),map=page.locator('#documentNavigator'),initial=(await map.boundingBox()).width,outline=page.locator('.workspace > .navigator');
 const before=(await outline.boundingBox()).width,handle=page.getByRole('separator',{name:'Resize workspace column',exact:true}),box=await handle.boundingBox();
 await drag(page,{x:box.x+4,y:box.y+150},{x:box.x+64,y:box.y+150});expect((await outline.boundingBox()).width).toBeCloseTo(before+60,0);expect((await map.boundingBox()).width).toBe(initial);
 const side=page.getByRole('separator',{name:'Resize interaction and investigation column',exact:true});await side.focus();await page.keyboard.press('ArrowLeft');expect((await map.boundingBox()).width).toBe(initial);
 await page.getByRole('button',{name:'Move navigator to left',exact:true}).click();expect((await map.boundingBox()).width).toBe(initial);expect(await source(page)).toBe(original);
 const width=(await outline.boundingBox()).width,again=await handle.boundingBox();await page.mouse.move(again.x+4,again.y+150);await page.mouse.down();await page.mouse.move(again.x+44,again.y+150);await page.keyboard.press('Escape');await page.mouse.up();expect((await outline.boundingBox()).width).toBeCloseTo(width,0);await page.reload();expect((await outline.boundingBox()).width).toBeCloseTo(width,0);
});

test('Navigator content stays stable across scrolling with full table and formula rendering',async({page})=>{
 await page.getByLabel('Maths display').selectOption('rendered');await expect(page.locator('#mapText .rendered-table-block')).toHaveCount(1);await expect(page.locator('#mapText .math-rendered')).toHaveCount(2);await page.evaluate(async()=>{await document.fonts.ready;});
 const initial=await page.locator('#mapText').innerHTML();const total=Number(await page.locator('#mapTrack').getAttribute('data-total-height'));
 for(const fraction of [0,.2,.65,1,.4,0]){await page.locator('.cm-scroller').evaluate((e,f)=>{e.scrollTop=f*(e.scrollHeight-e.clientHeight);},fraction);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));expect(await page.locator('#mapText').innerHTML()).toBe(initial);expect(Number(await page.locator('#mapTrack').getAttribute('data-total-height'))).toBeCloseTo(total,0);}
 await page.locator('#documentNavigator').screenshot({path:'../artifacts/ui/navigator-stable.png'});
});

test('one through five repeated clicks select caret, word, sentence, paragraph, section',async({page})=>{
 const original=await source(page),p=await point(page,'Hypergraph');
 await page.mouse.click(p.x,p.y,{clickCount:1});await expect(page.getByRole('button',{name:'Copy selection to clipboard',exact:true})).toBeDisabled();
 await page.mouse.click(p.x,p.y,{clickCount:2});expect(await selected(page)).toBe('Hypergraph');
 const paragraph='Welcome to the Hypergraph research workspace. This is an entirely synthetic document for exploring the interface. Type freely: changes stay in this browser tab.';
 for(const [clicks,expected] of [[3,'Welcome to the Hypergraph research workspace.'],[4,paragraph],[5,original]]){await page.mouse.click(p.x,p.y,{clickCount:clicks});await page.getByRole('button',{name:'Fork',exact:true}).click();await expect(page.locator('.function-dialog .source-preview')).toHaveText(expected);await page.getByRole('button',{name:'Cancel',exact:true}).click();}
 expect(await source(page)).toBe(original);
});

test('drag snapping promotes sentences/paragraphs in both directions and can be disabled',async({page})=>{
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.insertText('# Snap tests\n\nAlpha one. Beta two.\n\nGamma three. Delta four.\n\n`code one. code two.`\n\n\\(math one. math two.\\)\n\n');const original=await source(page);
 const alpha=await point(page,'Alpha'),beta=await point(page,'Beta'),gamma=await point(page,'Gamma');
 await drag(page,alpha,beta);await expectSelected(page,'Alpha one. Beta two.');
 await drag(page,alpha,gamma);await expectSelected(page,'Alpha one. Beta two.\n\nGamma three. Delta four.');
 await drag(page,gamma,alpha);await expectSelected(page,'Alpha one. Beta two.\n\nGamma three. Delta four.');
 const codeOne=await point(page,'code one'),codeTwo=await point(page,'code two');await drag(page,codeOne,codeTwo);expect((await selected(page)).length).toBeLessThan('code one. code two.'.length);
 const mathOne=await point(page,'math one'),mathTwo=await point(page,'math two');await drag(page,mathOne,mathTwo);expect((await selected(page)).length).toBeLessThan('math one. math two.'.length);

 await page.getByRole('checkbox',{name:'Drag snapping',exact:true}).uncheck();await drag(page,alpha,beta);expect(await selected(page)).not.toBe('Alpha one. Beta two.');expect((await selected(page)).length).toBeLessThan('Alpha one. Beta two.'.length);expect(await source(page)).toBe(original);
 await page.reload();await expect(page.getByRole('checkbox',{name:'Drag snapping',exact:true})).not.toBeChecked();
});

test('semantic blocks have presentation spacing without rewriting source or splitting soft lines',async({page})=>{
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.insertText('# Adjacent heading\nParagraph without an empty line.\nA soft continuation.\n## Next heading\nMore prose.\n\n');
 const current=await source(page);await expect(page.locator('.cm-editor .cm-line').filter({hasText:'Paragraph without an empty line.'})).toHaveCSS('padding-top','12px');await expect(page.locator('.cm-editor .cm-line').filter({hasText:'A soft continuation.'})).toHaveCSS('padding-top','0px');await expect(page.locator('.cm-editor .cm-line').filter({hasText:'## Next heading'})).toHaveCSS('padding-top','12px');expect(await source(page)).toBe(current);
});
