import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
async function source(page){const ready=page.waitForEvent('download');await page.getByRole('button',{name:'↓ Markdown',exact:true}).click();return readFile(await(await ready).path(),'utf8');}
test.beforeEach(async({page})=>{page.on('dialog',d=>d.accept());await page.goto('/');await expect(page.getByRole('textbox',{name:'Markdown document editor'})).toBeVisible();});
test('sentence and paragraph arrows name and inspect each relationship without changing source',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const original=await source(page);
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
 await page.getByRole('tab',{name:'Relations',exact:true}).click();await page.getByRole('textbox',{name:'Relationship name',exact:true}).fill('Supports');await page.getByRole('button',{name:'Add test relationship',exact:true}).click();await expect(page.locator('#editorHost .relationship-sentence').first().locator('button')).toHaveCount(3);expect(await source(page)).toBe(original);
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
 await page.getByRole('tab',{name:'Relations',exact:true}).click();await page.getByLabel('Relationship units',{exact:true}).selectOption('paragraph');
 await page.getByRole('textbox',{name:'Relationship name',exact:true}).fill('Builds upon');await page.getByRole('button',{name:'Add test relationship',exact:true}).click();
 await expect(page.locator('#editorHost .relationship-paragraph').first().locator('button')).toHaveCount(2);
 await page.locator('#editorHost .relationship-paragraph').first().getByRole('button',{name:'Builds upon',exact:true}).click();await expect(page.locator('.relationship-card.inspected h3')).toHaveText('Builds upon');await expect(page.locator('#pinContext')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#investigationBody')).toContainText('Pinned editor context retained.');
 expect(await source(page)).toBe(original);
 await page.reload();await page.getByRole('tab',{name:'Relations',exact:true}).click();await expect(page.locator('.relationship-card').filter({hasText:'Builds upon'})).toHaveCount(0);
});
