import {test,expect} from './fixtures.js';
import {readFile} from 'node:fs/promises';
async function source(page){const ready=page.waitForEvent('download');await page.getByRole('button',{name:'↓ Markdown',exact:true}).click();return readFile(await(await ready).path(),'utf8');}
async function selectRange(page,from,to){
 await page.getByRole('textbox',{name:'Markdown document editor'}).focus();await page.keyboard.press('ControlOrMeta+Home');for(let i=0;i<from;i++)await page.keyboard.press('ArrowRight');await page.keyboard.down('Shift');for(let i=from;i<to;i++)await page.keyboard.press('ArrowRight');await page.keyboard.up('Shift');
}
async function createCustom(page,name){
 await page.keyboard.press('Shift+F10');await page.getByRole('menuitem',{name:'Add relations',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Add relations',exact:true});await dialog.getByRole('combobox',{name:'Search relationships',exact:true}).fill(name);await dialog.getByRole('button',{name:'Use search as custom term',exact:true}).click();await dialog.getByRole('button',{name:'Add relation',exact:true}).click();await expect(dialog).toHaveCount(0);await expect(page.locator('.relationship-card.inspected h3')).toHaveText(name);
}
test.beforeEach(async({page})=>{page.on('dialog',d=>d.accept());await page.goto('/');await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();});
test('sentence and paragraph arrows name and inspect each relationship without changing source',async({page})=>{
 await expect(page.locator('.relationship-form')).toHaveCount(0);await expect(page.getByRole('button',{name:'Add test relationship',exact:true})).toHaveCount(0);await expect(page.getByRole('textbox',{name:'Relationship name',exact:true})).toHaveCount(0);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const original=await source(page);
 await expect(page.locator('#editorHost .relationship-gap')).toHaveCSS('font-size','0px');expect(await page.locator('#editorHost .relationship-gap').evaluate(element=>element.getBoundingClientRect().width)).toBe(0);await expect(page.locator('#mapText .relationship-gap')).toHaveCSS('font-size','0px');
 const sentence=page.locator('#editorHost .relationship-sentence');await expect(sentence.first().locator('button')).toHaveCount(2);
 const clarifies=sentence.first().getByRole('button',{name:'Clarifies',exact:true});await clarifies.hover();await expect(page.getByRole('tooltip')).toHaveText('Clarifies',{timeout:5000});
 await clarifies.click();await expect(page.getByRole('tab',{name:'Relations',exact:true})).toHaveAttribute('aria-selected','true');await expect(page.locator('.relationship-card.inspected h3')).toHaveText('Clarifies');
 await page.getByRole('button',{name:'Collapse investigation panel',exact:true}).click();await page.locator('#editorHost .relationship-sentence').first().getByRole('button',{name:'Elaborates',exact:true}).click();await expect(page.locator('#investigation')).not.toHaveClass(/collapsed/);await expect(page.locator('.relationship-card.inspected h3')).toHaveText('Elaborates');
 const paragraph=page.locator('#editorHost .relationship-paragraph').first();await paragraph.scrollIntoViewIfNeeded();await paragraph.getByRole('button',{name:'Contrasts',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('.relationship-card.inspected h3')).toHaveText('Contrasts');
 const sizes=await page.locator('#editorHost').evaluate(root=>({sentence:root.querySelector('.relationship-sentence svg').getBoundingClientRect().height,paragraph:root.querySelector('.relationship-paragraph svg').getBoundingClientRect().height}));expect(sizes.paragraph).toBeGreaterThan(sizes.sentence);
 expect(await source(page)).toBe(original);expect(errors).toEqual([]);await page.screenshot({path:'../artifacts/ui/relationship-arrows.png'});
});
test('multiple local relationships follow document state and invalidate edited source anchors',async({page})=>{
 const original=await source(page),editor=page.getByRole('textbox',{name:'Markdown document editor'});await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');
 const from=original.indexOf('Welcome to');await selectRange(page,from,original.indexOf('interface.',from)+'interface.'.length);await createCustom(page,'Supports');await expect(page.locator('#editorHost .relationship-sentence').first().locator('button')).toHaveCount(3);expect(await source(page)).toBe(original);
 await page.locator('#editorHost .relationship-sentence').first().getByRole('button',{name:'Supports',exact:true}).click();await expect(page.locator('.relationship-card.inspected h3')).toHaveText('Supports');
 await page.getByRole('button',{name:'Next chapter',exact:true}).click();await page.getByRole('button',{name:'Previous chapter',exact:true}).click();await expect(page.locator('#editorHost .relationship-sentence').first().locator('button')).toHaveCount(3);
 await editor.focus();await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.insertText('# New heading 🧭\n\n');await expect(page.locator('#editorHost .relationship-sentence').first().locator('button')).toHaveCount(3);
 await page.keyboard.press('ControlOrMeta+Home');for(let i=0;i<4;i++)await page.keyboard.press('ArrowDown');await page.keyboard.insertText('Changed ');await expect(page.locator('#editorHost .relationship-sentence')).toHaveCount(0);await expect(page.locator('.relationship-card').filter({hasText:'Source changed — anchor needs review'})).toHaveCount(3);
 await page.getByRole('button',{name:'Remove Supports relationship',exact:true}).click();await expect(page.locator('.relationship-card').filter({hasText:'Supports'})).toHaveCount(0);
});

test('paragraph boundaries support multiple arrows and pinned context survives explicit inspection',async({page})=>{
 const original=await source(page);
 await page.locator('#editorHost .cm-line').filter({hasText:'A document can be read as a composition'}).click({position:{x:40,y:12}});
 await page.getByRole('button',{name:'◇ Pin context',exact:true}).click();
 const from=original.indexOf('A document can be read'),to=original.indexOf('## Working with evidence');await selectRange(page,from,to);await createCustom(page,'Builds upon');
 await expect(page.locator('#editorHost .relationship-paragraph').first().locator('button')).toHaveCount(2);
 await page.locator('#editorHost .relationship-paragraph').first().getByRole('button',{name:'Builds upon',exact:true}).click();await expect(page.locator('.relationship-card.inspected h3')).toHaveText('Builds upon');await expect(page.locator('#pinContext')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#investigationBody')).toContainText('Pinned editor context retained.');
 expect(await source(page)).toBe(original);
 await page.reload();await page.getByRole('tab',{name:'Relations',exact:true}).click();await expect(page.locator('.relationship-card').filter({hasText:'Builds upon'})).toHaveCount(0);
});

test('selected second and third sentences place arrows at their shared boundary in either direction',async({page})=>{
 const editor=page.getByRole('textbox',{name:'Markdown document editor'}),text='# Pair\n\nFirst sentence. Second sentence. Third sentence.';
 await editor.focus();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.insertText(text);
 for(const reverse of [false,true]){
  await editor.focus();
  if(reverse){await page.keyboard.press('ControlOrMeta+End');await page.keyboard.down('Shift');for(let i=0;i<'Second sentence. Third sentence.'.length;i++)await page.keyboard.press('ArrowLeft');await page.keyboard.up('Shift');}
  else{await page.keyboard.press('ControlOrMeta+Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await page.keyboard.press('Home');for(let i=0;i<'First sentence. '.length;i++)await page.keyboard.press('ArrowRight');await page.keyboard.press('ControlOrMeta+Shift+End');}
  const name=reverse?'Reverse selection':'Forward selection';await createCustom(page,name);
  const arrow=page.locator('#editorHost .relationship-sentence').getByRole('button',{name,exact:true});
  expect(await arrow.evaluate(button=>{const marker=button.parentElement,line=marker.closest('.cm-line'),before=document.createRange(),after=document.createRange();before.selectNodeContents(line);before.setEndBefore(marker);after.selectNodeContents(line);after.setStartAfter(marker);return {before:before.toString(),after:after.toString()};})).toEqual({before:'First sentence. Second sentence. ',after:'Third sentence.'});
  await arrow.click();await expect(page.locator('.relationship-card.inspected')).toContainText('Second sentence.');await expect(page.locator('.relationship-card.inspected')).toContainText('Third sentence.');
 }
 await expect(page.locator('#editorHost .relationship-sentence').locator('button')).toHaveCount(2);expect(await source(page)).toBe(text);
 await editor.focus();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.press('Shift+F10');await expect(page.getByRole('menuitem',{name:'Add relations',exact:true})).toBeDisabled();
});

test('removing every sentence relationship restores its original visible separator',async({page})=>{
 const original=await source(page);await page.locator('#editorHost .relationship-sentence').getByRole('button',{name:'Elaborates',exact:true}).click();
 await page.getByRole('button',{name:'Remove Elaborates relationship',exact:true}).click();await expect(page.locator('#editorHost .relationship-gap')).toHaveCount(1);
 await page.locator('#editorHost .relationship-sentence').getByRole('button',{name:'Clarifies',exact:true}).click();await page.getByRole('button',{name:'Remove Clarifies relationship',exact:true}).click();await expect(page.locator('#editorHost .relationship-gap')).toHaveCount(0);await expect(page.locator('#editorHost .relationship-sentence')).toHaveCount(0);expect(await source(page)).toBe(original);
});

test('Relations follows the caret for sentence and paragraph links together, independently of retained pins',async({page})=>{
 const editor=page.getByRole('textbox',{name:'Markdown document editor'}),text='Alpha one. Beta two.\n\nGamma three. Delta four.\n\nUnrelated paragraph.';await editor.focus();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.insertText(text);await page.keyboard.press('ControlOrMeta+Home');await page.getByRole('tab',{name:'Relations',exact:true}).click();
 await selectRange(page,0,text.indexOf('\n\n'));await createCustom(page,'Sentence connection');await selectRange(page,0,text.indexOf('\n\nUnrelated'));await createCustom(page,'Paragraph connection');await editor.focus();await page.keyboard.press('ControlOrMeta+Home');
 await expect(page.locator('.relationship-card')).toHaveCount(2);await expect(page.locator('.relationship-card').filter({hasText:'Sentence connection'})).toHaveCount(1);await expect(page.locator('.relationship-card').filter({hasText:'Paragraph connection'})).toHaveCount(1);
 await page.locator('#editorHost .cm-line').filter({hasText:'Gamma three. Delta four.'}).click({position:{x:30,y:12}});await expect(page.locator('.relationship-card')).toHaveCount(1);await expect(page.locator('.relationship-card h3')).toHaveText('Paragraph connection');
 await page.locator('#pinContext').click();await page.locator('#editorHost .cm-line').filter({hasText:'Unrelated paragraph.'}).click({position:{x:30,y:12}});await expect(page.locator('.relationship-card')).toHaveCount(0);await expect(page.locator('#investigationBody')).toContainText('No relationships at the current caret.');await expect(page.locator('#pinContext')).toHaveAttribute('aria-pressed','true');
 await page.locator('#editorHost .relationship-sentence').getByRole('button',{name:'Sentence connection',exact:true}).click();await expect(page.locator('.relationship-card.inspected h3')).toHaveText('Sentence connection');await page.locator('#editorHost .cm-line').filter({hasText:'Gamma three. Delta four.'}).click({position:{x:35,y:12}});await expect(page.locator('.relationship-card.inspected')).toHaveCount(0);await expect(page.locator('.relationship-card h3')).toHaveText('Paragraph connection');expect(await source(page)).toBe(text);
});
