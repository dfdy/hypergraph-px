import {test,expect} from './fixtures.js';
import {readFile} from 'node:fs/promises';
const styles=await readFile(new URL('../../styles.css',import.meta.url),'utf8');
const source=await readFile(new URL('../../src/history-panel.js',import.meta.url),'utf8');
async function open(page){
 await page.goto('about:blank');await page.addStyleTag({content:styles});
 await page.evaluate(async url=>{
  const {renderHistory}=await import(url),id=n=>Array(32).fill(n),entry=n=>({revision:id(n),snapshot:id(n+10),parent:n===1?null:id(n-1),text_bytes:12});
  const container=document.createElement('div');document.body.append(container);window.__notices=[];window.__snapshots=[];window.__heads=[];
  const adapter={lifecycle:'unlocked',history:async(document,cursor,limit)=>{
   if(limit===1){if(window.__holdHead)return new Promise(resolve=>window.__heads.push(()=>resolve({entries:[entry(50)]})));return {entries:[entry(50)]};}
   return cursor===null?{entries:[entry(3),entry(2)],next:id(1)}:{entries:[entry(1)],next:null};
  },snapshot:async(document,snapshot)=>new Promise((resolve,reject)=>window.__snapshots.push({snapshot,resolve,reject}))};
  window.__reply=(i,text,error)=>{const p=window.__snapshots[i];error?p.reject(Error(error)):p.resolve({text});};
  renderHistory(container,adapter,'synthetic-document',message=>window.__notices.push(message));
 },'data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 await expect(page.getByRole('button',{name:'View snapshot',exact:true})).toHaveCount(2);
}

test('history inspection keeps exact untrusted source/download and removes dialogs on Escape',async({page})=>{
 await open(page);const text='Exact 😀 e\u0301\r\n中\r<img src=x onerror="window.__executed=true">\n';
 await page.getByRole('button',{name:'View snapshot',exact:true}).first().click();await page.evaluate(text=>window.__reply(0,text),text);
 let dialog=page.getByRole('dialog',{name:'Historical snapshot · read only'});expect(await dialog.locator('pre').textContent()).toBe(text);await expect(dialog.locator('img')).toHaveCount(0);
 const ready=page.waitForEvent('download');await dialog.getByRole('button',{name:'Download snapshot',exact:true}).click();expect(await readFile(await(await ready).path(),'utf8')).toBe(text);
 await page.keyboard.press('Escape');await expect(page.locator('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Compare with latest committed',exact:true}).first().click();await expect.poll(()=>page.evaluate(()=>window.__snapshots.length)).toBe(3);
 await page.evaluate(text=>{window.__reply(1,text);window.__reply(2,text);},text);dialog=page.getByRole('dialog',{name:'Compare committed snapshots'});await expect(dialog.getByRole('status')).toHaveText('These snapshots contain exactly the same bytes.');
 expect(await dialog.locator('pre').allTextContents()).toEqual([text,text]);expect(await page.evaluate(()=>window.__executed)).toBeUndefined();await page.keyboard.press('Escape');await expect(page.locator('dialog')).toHaveCount(0);
});

test('history page and refresh changes cancel old snapshots/errors while latest inspection wins',async({page})=>{
 await open(page);await page.getByRole('button',{name:'View snapshot',exact:true}).first().click();await page.getByRole('button',{name:'Older',exact:true}).click();await expect(page.getByRole('button',{name:'View snapshot',exact:true})).toHaveCount(1);
 await page.evaluate(()=>window.__reply(0,'Stale previous page'));await expect(page.locator('dialog')).toHaveCount(0);
 const inspect=page.getByRole('button',{name:'View snapshot',exact:true});await inspect.click();await inspect.click();await page.evaluate(()=>window.__reply(2,'Latest inspection'));
 const dialog=page.getByRole('dialog',{name:'Historical snapshot · read only'});await expect(dialog.locator('pre')).toHaveText('Latest inspection');await page.evaluate(()=>window.__reply(1,'Superseded inspection'));await expect(page.locator('dialog')).toHaveCount(1);await expect(dialog.locator('pre')).toHaveText('Latest inspection');await dialog.getByRole('button',{name:'Close',exact:true}).click();
 await inspect.click();await page.getByRole('button',{name:'Refresh',exact:true}).click();await page.evaluate(()=>window.__reply(3,null,'Stale error'));expect(await page.evaluate(()=>window.__notices)).toEqual([]);await expect(page.locator('dialog')).toHaveCount(0);
});

test('history navigation invalidates comparisons during both head capture and exact source reads',async({page})=>{
 await open(page);await page.getByRole('button',{name:'Compare with latest committed',exact:true}).first().click();await expect.poll(()=>page.evaluate(()=>window.__snapshots.length)).toBe(2);
 await page.getByRole('button',{name:'Older',exact:true}).click();await page.evaluate(()=>{window.__reply(0,'Old selected source');window.__reply(1,'Captured committed source');});await expect(page.locator('dialog')).toHaveCount(0);
 await page.evaluate(()=>{window.__holdHead=true;});await page.getByRole('button',{name:'Compare with latest committed',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__heads.length)).toBe(1);
 await page.getByRole('button',{name:'Newer',exact:true}).click();await page.evaluate(()=>window.__heads[0]());expect(await page.evaluate(()=>window.__snapshots.length)).toBe(2);await expect(page.locator('dialog')).toHaveCount(0);expect(await page.evaluate(()=>window.__notices)).toEqual([]);
});
