import {test,expect} from './fixtures.js';
import {readFile} from 'node:fs/promises';
async function source(page){const event=page.waitForEvent('download');await page.getByRole('button',{name:'↓ Markdown',exact:true}).click();const download=await event;return readFile(await download.path(),'utf8');}
const pageErrors=new WeakMap();
test.afterEach(async({page})=>{expect(pageErrors.get(page)||[]).toEqual([]);});
test.beforeEach(async({page})=>{pageErrors.set(page,[]);page.on('pageerror',e=>pageErrors.get(page).push(e.message));page.on('dialog',d=>d.accept());await page.goto('/');await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();});
test('desktop layout, outline, minimap, tabs, contributor roles and independent split panels',async({page})=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await expect(page.locator('.outline .heading-open').first()).toHaveText('1. Introduction');await page.getByRole('tab',{name:'Users'}).click();await expect(page.locator('.contributor')).toHaveCount(3);await expect(page.locator('.contributor').first()).toContainText('Current human');await expect(page.locator('.contributor').nth(1)).toContainText('not connected');await page.getByRole('separator',{name:'Resize interaction and investigation panels',exact:true}).focus();await page.keyboard.press('ArrowDown');await expect(page.locator('#panelDivider')).toHaveAttribute('aria-valuenow','51');await page.getByRole('button',{name:'Collapse interaction panel'}).click();await expect(page.locator('#interaction')).toHaveClass(/collapsed/);await page.getByRole('button',{name:'Collapse interaction panel'}).click();await page.locator('.outline button').filter({hasText:'Closing reflection'}).click();await expect.poll(()=>page.locator('.cm-scroller').evaluate(element=>element.scrollTop)).toBeGreaterThan(0);await page.locator('#mapViewport').focus();await page.keyboard.press('Home');await expect(page.locator('#mapViewport')).toHaveAttribute('aria-valuenow','0');await page.screenshot({path:'../artifacts/ui/workspace-dark.png'});expect(errors).toEqual([]);});
test('typing, undo, document switching and exact buffer download',async({page})=>{const initial=await source(page),editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.type('New thought 🧭\n\n');await expect(page.locator('#draftStatus')).toContainText('Modified');expect(await source(page)).toBe('New thought 🧭\n\n'+initial);await page.getByRole('button',{name:'Next chapter'}).click();await expect(page.locator('#documentTitle')).toHaveText('Conceptual foundations');await page.getByRole('button',{name:'Previous chapter'}).click();expect(await source(page)).toBe('New thought 🧭\n\n'+initial);const edited=await source(page);await page.getByRole('button',{name:'Undo',exact:true}).click();expect(await source(page)).not.toBe(edited);await page.getByRole('button',{name:'Redo',exact:true}).click();expect(await source(page)).toBe(edited);});
test('table edit is undoable and math rendering preserves exact Markdown',async({page})=>{const initial=await source(page);await page.locator('.outline button').filter({hasText:'Working with evidence'}).click();const cell=page.getByRole('cell',{name:'Row 2, column 2:'});await cell.dblclick();const input=page.getByRole('textbox',{name:'Edit row 2, column 2'});await input.fill('Edited interpretation');await input.press('Enter');expect(await source(page)).toContain('Edited interpretation');await expect(page.getByRole('cell',{name:'Row 2, column 2:'})).toHaveAttribute('data-author-id','demo:human');await expect(page.getByRole('cell',{name:'Row 2, column 1:'})).toHaveAttribute('data-author-id','demo:agent');await page.getByRole('button',{name:'Undo',exact:true}).click();expect(await source(page)).toBe(initial);await page.getByLabel('Maths display').selectOption('rendered');await page.locator('.outline button').filter({hasText:'A small mathematical example'}).click();await expect(page.locator('.math-rendered .katex').first()).toBeVisible();expect(await source(page)).toBe(initial);await page.getByLabel('Maths display').selectOption('source');expect(await source(page)).toBe(initial);});
test('captured clipboard source crosses documents, simulated paste and clear, pinning and reload reset',async({page})=>{const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('Shift+End');await page.getByRole('button',{name:'Copy selection to clipboard',exact:true}).click();await expect(page.locator('.clip-chip')).toHaveCount(1);await page.getByRole('tab',{name:'Concepts',exact:true}).click();await page.getByRole('button',{name:'Pin context',exact:false}).click();await page.getByRole('button',{name:'Next chapter'}).click();await expect(page.locator('.context-label')).toContainText('Pinned · Introduction');await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.getByRole('button',{name:'Simulate fork paste',exact:true}).click();expect(await source(page)).toMatch(/# 1\. Introduction$/);await expect(page.locator('.clip-chip')).toHaveCount(1);await page.getByRole('button',{name:'Remove clipboard entry from Introduction'}).click();await expect(page.locator('.clip-chip')).toHaveCount(0);expect(await source(page)).toMatch(/# 1\. Introduction$/);await page.reload();await expect(page.locator('#documentTitle')).toHaveText('Introduction');await expect(page.locator('#draftStatus')).toContainText('Synthetic fixture');});
test('preview has no provider calls or unsafe markup execution; appearance persists only display values',async({page})=>{const remote=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5173/')&&!r.url().startsWith('blob:'))remote.push(r.url());});await page.getByRole('textbox',{name:'Demonstration agent prompt'}).fill('<script>window.pwned=true</script>');await page.getByRole('button',{name:'Send demo prompt'}).click();await expect(page.locator('#toast')).toContainText('No agent connected');await page.getByRole('button',{name:'Switch theme'}).click();await expect(page.locator('body')).toHaveClass(/light/);await page.screenshot({path:'../artifacts/ui/workspace-light.png'});expect(await page.evaluate(()=>window.pwned)).toBeUndefined();const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('hypergraph-display-v1')));expect(Object.keys(persisted).sort()).toEqual(['authors','columnWidths','dragSnapping','followTree','font','light','math','navigatorSide','navigatorVisible','redCaret','upper','wrap']);expect(remote).toEqual([]);});

test('keyboard context actions preserve selection and clear only completed simulated pastes',async({page})=>{const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('Shift+End');await page.keyboard.press('Shift+F10');await page.getByRole('menuitem',{name:'Copy selection to provenance clipboard'}).click();await editor.focus();await page.keyboard.press('ControlOrMeta+End');await page.keyboard.press('Shift+F10');await page.getByRole('menuitem',{name:'Simulate fork paste and clear',exact:true}).click();await expect(page.locator('.clip-chip')).toHaveCount(0);expect(await source(page)).toMatch(/# 1\. Introduction$/);await page.getByRole('tab',{name:'Provenance',exact:true}).click();await expect(page.locator('#investigationBody')).toContainText('demo:paste:');});
test('local comments and semantic reviews stay contextual, attributable simulations',async({page})=>{const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('Shift+End');await page.getByRole('tab',{name:'Comments'}).click();await page.getByRole('textbox',{name:'Local test comment'}).fill('Keep this source distinction visible.');await page.getByRole('button',{name:'Add test comment'}).click();await expect(page.locator('#interactionBody')).toContainText('Keep this source distinction visible.');await page.getByRole('tab',{name:'Relations',exact:true}).click();await page.locator('#editorHost .cm-line').filter({hasText:'Welcome to the Hypergraph'}).click();await page.getByRole('button',{name:'Reject Elaborates relation',exact:true}).click();await expect(page.locator('#investigationBody')).toContainText('Rejected locally');await page.getByRole('button',{name:'Next chapter'}).click();await expect(page.locator('#investigationBody')).toContainText('No relationships at the current caret.');await expect(page.locator('#interactionBody')).not.toContainText('Keep this source distinction visible.');await page.getByRole('button',{name:'Previous chapter'}).click();await expect(page.locator('#investigationBody')).toContainText('Rejected locally');await expect(page.locator('#interactionBody')).toContainText('Keep this source distinction visible.');});
test('plain manuscript markup remains inert source and preview server exposes no input/source files',async({page,request})=>{const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.insertText('<img src=x onerror="window.injected=1"><script>window.injected=2</script>\n\n');expect(await page.evaluate(()=>window.injected)).toBeUndefined();await expect(page.locator('#editorHost img:not(.cm-widgetBuffer),#editorHost script')).toHaveCount(0);expect(await page.locator('#editorHost img.cm-widgetBuffer').evaluateAll(nodes=>nodes.every(node=>node.getAttribute('aria-hidden')==='true'&&!node.hasAttribute('src')&&[...node.attributes].every(attribute=>!/^on/i.test(attribute.name))))).toBe(true);for(const path of ['/src/fixtures.js','/incoming/sites-export/','/package.json','/api/v1/session'])expect((await request.get(path)).status()).toBe(404);expect((await request.post('/')).status()).toBe(405);expect((await request.get('/',{headers:{Host:'example.invalid'}})).status()).toBe(403);});

test('chapter arrows expand independently without changing the open document',async({page})=>{
 await page.getByRole('button',{name:'Collapse Introduction headings'}).click();
 await expect(page.locator('.outline')).toHaveCount(0);
 await expect(page.locator('#documentTitle')).toHaveText('Introduction');
 await page.getByRole('button',{name:'Expand Conceptual foundations headings'}).click();
 await expect(page.locator('.outline[data-document="demo:chapter:2"] .heading-open').first()).toHaveText('2. Conceptual foundations');
 await expect(page.locator('#documentTitle')).toHaveText('Introduction');
 await page.getByRole('button',{name:'Expand Introduction headings'}).click();
 await expect(page.locator('.outline')).toHaveCount(2);
 await page.locator('.outline[data-document="demo:chapter:2"] button').filter({hasText:'Closing reflection'}).click();
 await expect(page.locator('#documentTitle')).toHaveText('Conceptual foundations');
 await expect.poll(()=>page.locator('.cm-scroller').evaluate(element=>element.scrollTop)).toBeGreaterThan(0);
});

test('P and H1–H4 styles follow caret context and update source undoably',async({page})=>{
 await expect(page.getByRole('button',{name:'Heading 1 style',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.locator('.cm-editor .cm-line').filter({hasText:'Welcome to the Hypergraph'}).click();
 await expect(page.getByRole('button',{name:'Paragraph style',exact:true})).toHaveAttribute('aria-pressed','true');
 for(const level of [4,3,2,1]){
  await page.getByRole('button',{name:`Heading ${level} style`,exact:true}).click();
  await expect(page.getByRole('button',{name:`Heading ${level} style`,exact:true})).toHaveAttribute('aria-pressed','true');
  expect(await source(page)).toContain('#'.repeat(level)+' Welcome to the Hypergraph');
 }
 await page.getByRole('button',{name:'Paragraph style',exact:true}).click();
 await expect(page.getByRole('button',{name:'Paragraph style',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Undo',exact:true}).click();
 await expect(page.getByRole('button',{name:'Heading 1 style',exact:true})).toHaveAttribute('aria-pressed','true');
});

test('minimap viewport uses the same line geometry after scroll, wrap, font and rendered maths changes',async({page})=>{
 async function checkGeometry(){
  await expect.poll(()=>page.evaluate(()=>{
   const scroll=document.querySelector('.cm-scroller'),sb=scroll.getBoundingClientRect(),track=document.querySelector('#mapTrack'),scale=Number(track.dataset.scale),box=document.querySelector('#mapViewport').getBoundingClientRect();
   const line=[...document.querySelectorAll('.cm-editor .cm-line')].find(e=>e.textContent.trim().startsWith('#')&&e.getBoundingClientRect().top>sb.top+5&&e.getBoundingClientRect().bottom<sb.bottom-5);
   if(!line)return 999;
   const miniature=[...document.querySelectorAll('#mapText .mini-source-line')].find(e=>e.textContent===line.textContent);
   if(!miniature)return 999;
   return Math.abs((miniature.getBoundingClientRect().top-box.top)-(line.getBoundingClientRect().top-sb.top)*scale);
  })).toBeLessThan(1.5);
 }
 await checkGeometry();
 await page.locator('.outline button').filter({hasText:'A small mathematical example'}).click();
 await checkGeometry();
 await page.getByLabel('Wrap width').selectOption('60');
 await page.getByLabel('Editor font size').fill('21');
 await page.getByLabel('Maths display').selectOption('rendered');
 await checkGeometry();
 await page.locator('#mapViewport').focus();await page.keyboard.press('End');await checkGeometry();
 await page.screenshot({path:'../artifacts/ui/minimap-aligned.png'});
});

test('control names appear after 1500 milliseconds and reset on leaving',async({page})=>{
 const button=page.getByRole('button',{name:'Heading 4 style',exact:true});
 await button.hover();
 await page.waitForTimeout(900);await expect(page.getByRole('tooltip')).not.toBeVisible();
 await expect(page.getByRole('tooltip')).toHaveText('Heading 4 style',{timeout:2000});
 await page.mouse.move(5,5);await expect(page.getByRole('tooltip')).not.toBeVisible();
 await page.getByRole('button',{name:'Expand Conclusion headings'}).hover();
 await expect(page.getByRole('tooltip')).toHaveText('Expand Conclusion headings',{timeout:4500});
 await expect(page.getByRole('button',{name:'Expand Conclusion headings'})).not.toHaveAttribute('title');
});
test('bold, italic, quote and both list controls reflect and toggle their source context',async({page})=>{
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});
 await editor.focus();await page.keyboard.press('ControlOrMeta+Home');
 await page.keyboard.insertText('**Bold text** and *italic text*.\n\n> Quote text.\n\n- Bullet item.\n\n1. Numbered item.\n\n');
 await page.keyboard.press('ControlOrMeta+Home');for(let i=0;i<4;i++)await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('button',{name:'Bold',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Bold',exact:true}).click();
 await expect(page.getByRole('button',{name:'Bold',exact:true})).toHaveAttribute('aria-pressed','false');
 expect(await source(page)).toMatch(/^Bold text and \*italic text\*\./);
 await page.getByRole('button',{name:'Undo',exact:true}).click();
 await editor.focus();await page.keyboard.press('ControlOrMeta+Home');for(let i=0;i<22;i++)await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('button',{name:'Italic',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:'Bold',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.locator('.cm-editor .cm-line').filter({hasText:'> Quote text.'}).click();
 await expect(page.getByRole('button',{name:'Blockquote',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Blockquote',exact:true}).click();
 await expect(page.getByRole('button',{name:'Blockquote',exact:true})).toHaveAttribute('aria-pressed','false');
 await page.locator('.cm-editor .cm-line').filter({hasText:'- Bullet item.'}).click();
 await expect(page.getByRole('button',{name:'Bulleted list',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Numbered list',exact:true}).click();
 await expect(page.getByRole('button',{name:'Numbered list',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:'Bulleted list',exact:true})).toHaveAttribute('aria-pressed','false');
 expect(await source(page)).toContain('1. Bullet item.');
 await page.getByRole('button',{name:'Numbered list',exact:true}).click();
 await expect(page.getByRole('button',{name:'Numbered list',exact:true})).toHaveAttribute('aria-pressed','false');
});
test('large editor and panel surfaces have no tooltips',async({page})=>{
 await page.locator('.cm-editor .cm-line').filter({hasText:'Welcome to the Hypergraph'}).hover();
 await page.waitForTimeout(3300);await expect(page.getByRole('tooltip')).not.toBeVisible();
 await page.locator('.right-sidebar .pane-heading').first().hover({position:{x:20,y:15}});
 await page.waitForTimeout(3300);await expect(page.getByRole('tooltip')).not.toBeVisible();
});
test('navigator wheel scrolling moves editor and synchronized viewport from label and map',async({page})=>{
 const navigator=page.getByRole('complementary',{name:'Document navigator',exact:true});
 await expect(navigator.locator(':scope > span')).toHaveText('NAVIGATOR');
 await navigator.locator(':scope > span').hover();
 await page.mouse.wheel(0,500);
 await expect.poll(()=>page.locator('.cm-scroller').evaluate(e=>e.scrollTop)).toBeGreaterThan(200);
 await expect.poll(()=>page.locator('#mapViewport').getAttribute('aria-valuenow').then(Number)).toBeGreaterThan(0);
 await navigator.locator('#mapTrack').hover();
 await page.mouse.wheel(0,-10000);
 await expect.poll(()=>page.locator('.cm-scroller').evaluate(e=>e.scrollTop)).toBe(0);
 await expect(page.locator('#mapViewport')).toHaveAttribute('aria-valuenow','0');
 // Synthetic events cover delta units and verify zoom is not intercepted.
 const result=await navigator.evaluate(element=>{const zoom=new WheelEvent('wheel',{deltaY:100,ctrlKey:true,cancelable:true,bubbles:true});element.dispatchEvent(zoom);const line=new WheelEvent('wheel',{deltaY:3,deltaMode:1,cancelable:true,bubbles:true});element.dispatchEvent(line);const lineTop=document.querySelector('.cm-scroller').scrollTop;const page=new WheelEvent('wheel',{deltaY:1,deltaMode:2,cancelable:true,bubbles:true});element.dispatchEvent(page);return {zoomPrevented:zoom.defaultPrevented,lineTop,pageTop:document.querySelector('.cm-scroller').scrollTop};});
 expect(result.zoomPrevented).toBe(false);expect(result.lineTop).toBeGreaterThan(0);expect(result.pageTop).toBeGreaterThan(result.lineTop);
});
test('navigator hides, moves left/right and restores display preferences without source changes',async({page})=>{
 const original=await source(page),navigator=page.getByRole('complementary',{name:'Document navigator',exact:true});
 await page.getByRole('button',{name:'Move navigator to left',exact:true}).click();
 await expect.poll(async()=>{const n=await navigator.boundingBox(),e=await page.locator('.editor-pane').boundingBox();return n.x+n.width<=e.x+1;}).toBe(true);
 await page.getByRole('button',{name:'Hide navigator',exact:true}).click();await expect(navigator).toBeHidden();
 expect(await source(page)).toBe(original);
 await page.reload();await expect(navigator).toBeHidden();
 await page.getByRole('button',{name:'Show navigator',exact:true}).click();await expect(navigator).toBeVisible();
 await expect(page.getByRole('button',{name:'Move navigator to right',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Move navigator to right',exact:true}).click();
 await expect.poll(async()=>{const n=await navigator.boundingBox(),e=await page.locator('.editor-pane').boundingBox();return n.x>=e.x+e.width-1;}).toBe(true);
 expect(await source(page)).toBe(original);
 await navigator.locator('#mapTrack').hover();await page.mouse.wheel(0,400);
 await expect.poll(()=>page.locator('.cm-scroller').evaluate(e=>e.scrollTop)).toBeGreaterThan(100);
});
test('Functions bar forks selected content into an independent tab-only document',async({page})=>{
 const original=await source(page),editor=page.getByRole('textbox',{name:'Markdown document editor'});
 await expect(page.getByRole('button',{name:'Fork',exact:true})).toBeDisabled();
 await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('ControlOrMeta+Shift+End');
 await page.getByRole('button',{name:'Fork',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Fork selected content'})).toBeVisible();
 await page.getByLabel('Fork name').fill('Independent test fork');await page.getByRole('button',{name:'Create demo fork'}).click();
 await expect(page.locator('#documentTitle')).toHaveText('Independent test fork');
 await expect(page.locator('#editorHost .provenance-section').getByRole('button',{name:'Is a fork',exact:true})).not.toHaveCount(0);await expect(page.locator('#editorHost .provenance-paragraph').getByRole('button',{name:'Is a fork',exact:true})).not.toHaveCount(0);
 expect(await source(page)).toBe(original);
 await expect(page.getByRole('button',{name:'Previous chapter'})).toBeDisabled();await expect(page.getByRole('button',{name:'Next chapter'})).toBeDisabled();
 await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.insertText('Independent edit.\n\n');
 await page.getByRole('button',{name:'Introduction',exact:true}).click();expect(await source(page)).toBe(original);
 await page.getByRole('button',{name:'Independent test fork',exact:true}).click();expect(await source(page)).toBe('Independent edit.\n\n'+original);
 await page.getByRole('tab',{name:'Users'}).click();await expect(page.locator('.contributor')).toHaveCount(2);
});
test('Functions bar Link inserts exact Markdown and supports cancellation/undo',async({page})=>{
 const original=await source(page),editor=page.getByRole('textbox',{name:'Markdown document editor'});
 await editor.focus();await page.keyboard.press('ControlOrMeta+Home');for(let i=0;i<5;i++)await page.keyboard.press('ArrowRight');await page.keyboard.press('Shift+End');
 await page.getByRole('button',{name:'Link',exact:true}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();expect(await source(page)).toBe(original);
 await page.getByRole('button',{name:'Link',exact:true}).click();await page.getByLabel('Target heading').selectOption({label:'Working with evidence'});await page.getByLabel('Link text').fill('Linked introduction');await page.getByRole('button',{name:'Insert Markdown link'}).click();
 expect(await source(page)).toBe(original.replace('Introduction','[Linked introduction](#working-with-evidence)'));
 await page.getByRole('button',{name:'Undo',exact:true}).click();expect(await source(page)).toBe(original);
});
test('Functions bar Embed previews a captured source without pretending to insert shared content',async({page})=>{
 const original=await source(page);await page.getByRole('button',{name:'Embed',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Embed content'});await expect(dialog).toBeVisible();
 await page.getByLabel('Source document').hover();await page.waitForTimeout(3300);await expect(page.getByRole('tooltip')).toBeHidden();
 await page.getByLabel('Source document').selectOption('demo:chapter:2');await page.getByLabel('Source section').selectOption({label:'Research questions'});
 await expect(dialog.locator('.source-preview')).toContainText('## Research questions');
 await expect(page.getByRole('button',{name:'Insert embed',exact:true})).toBeDisabled();
 await expect(page.getByLabel('Resolution policy').locator('option[value="live"]')).toHaveJSProperty('disabled',true);
 await page.getByRole('button',{name:'Close',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeFocused();
 expect(await source(page)).toBe(original);
});
test('Paragraph stays off in numbered/bullet/quote/code styles and nested indicators follow the caret',async({page})=>{
 const editor=page.getByRole('textbox',{name:'Markdown document editor'}),paragraph=page.getByRole('button',{name:'Paragraph style',exact:true});
 await editor.focus();await page.keyboard.press('ControlOrMeta+Home');const inserted='Ordinary paragraph\n\n1. Numbered example\n\n- Bullet example\n\n> Quote example\n\n```\n# Code example\n```\n\n> ## Nested heading example\n\n1. Outer numbered\n   - Inner bullet example\n\n**Bold paragraph example**\n\n';await page.keyboard.insertText(inserted);
 async function caret(text){
  // Reveal the source before querying a virtualized line; the inserted prefix may exceed the viewport.
  await editor.focus();await page.keyboard.press('ControlOrMeta+Home');
  const offset=inserted.indexOf(text);expect(offset).toBeGreaterThanOrEqual(0);for(let i=0;i<offset+2;i++)await page.keyboard.press('ArrowRight');
  await page.locator('.cm-editor .cm-line').filter({hasText:text==='- Bullet example'?/^\s*- Bullet example$/:text}).click();
 }
 await caret('Numbered example');await expect(paragraph).toHaveAttribute('aria-pressed','false');await expect(page.getByRole('button',{name:'Numbered list',exact:true})).toHaveAttribute('aria-pressed','true');
 await caret('- Bullet example');await expect(paragraph).toHaveAttribute('aria-pressed','false');await expect(page.getByRole('button',{name:'Bulleted list',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('button',{name:'Numbered list',exact:true})).toHaveAttribute('aria-pressed','false');
 await caret('Quote example');await expect(paragraph).toHaveAttribute('aria-pressed','false');await expect(page.getByRole('button',{name:'Blockquote',exact:true})).toHaveAttribute('aria-pressed','true');
 await caret('Code example');await expect(paragraph).toHaveAttribute('aria-pressed','false');await expect(page.getByRole('button',{name:'Heading 1 style',exact:true})).toHaveAttribute('aria-pressed','false');
 await caret('Nested heading example');await expect(paragraph).toHaveAttribute('aria-pressed','false');await expect(page.getByRole('button',{name:'Heading 2 style',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('button',{name:'Blockquote',exact:true})).toHaveAttribute('aria-pressed','true');
 await caret('Inner bullet example');await expect(paragraph).toHaveAttribute('aria-pressed','false');await expect(page.getByRole('button',{name:'Bulleted list',exact:true})).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('button',{name:'Numbered list',exact:true})).toHaveAttribute('aria-pressed','false');
 await caret('Ordinary paragraph');await expect(paragraph).toHaveAttribute('aria-pressed','true');await expect(page.getByRole('button',{name:'Blockquote',exact:true})).toHaveAttribute('aria-pressed','false');await expect(page.getByRole('button',{name:'Bulleted list',exact:true})).toHaveAttribute('aria-pressed','false');
});


test('self-labelled buttons, tabs and fields have no redundant hover tips while icon names remain available',async({page})=>{
 await page.getByRole('tab',{name:'Agent',exact:true}).hover();await page.waitForTimeout(3300);await expect(page.getByRole('tooltip')).toBeHidden();
 await page.getByRole('button',{name:'Embed',exact:true}).hover();await page.waitForTimeout(3300);await expect(page.getByRole('tooltip')).toBeHidden();
 const editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+A');await page.getByRole('button',{name:'Fork',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Fork selected content'});await dialog.getByLabel('Fork name',{exact:true}).hover();await page.waitForTimeout(3300);await expect(page.getByRole('tooltip')).toBeHidden();await dialog.getByRole('button',{name:'Cancel',exact:true}).click();
 await page.getByRole('button',{name:'Heading 4 style',exact:true}).hover();await expect(page.getByRole('tooltip')).toHaveText('Heading 4 style',{timeout:5000});
});
