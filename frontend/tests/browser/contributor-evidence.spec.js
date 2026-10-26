import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const styles=await readFile(new URL('../../styles.css',import.meta.url),'utf8');
const source=await readFile(new URL('../../src/contributor-evidence.js',import.meta.url),'utf8');
async function open(page,delayed=false){
 await page.goto('about:blank');await page.addStyleTag({content:styles});
 await page.evaluate(async({url,delayed})=>{
  const {openContributorEvidence}=await import(url),id=n=>Array(32).fill(n);window.__evidenceCalls=[];
  const adapter={lifecycle:'unlocked',snapshot:async(document,snapshot)=>{window.__evidenceCalls.push({document,snapshot});if(delayed)return new Promise(r=>{window.__releaseEvidence=()=>r({text:'Delayed source'});});return {text:'Exact 😀\r\n中\r<img src=x onerror="window.__executed=true">\n'};}};
  const facts=Array.from({length:10},(_,i)=>({principal:id(1),revision:id(i+2),snapshot:id(i+40),operation:id(i+80),role:'publisher'}));openContributorEvidence(adapter,'synthetic-document',id(1),facts,()=>true);
 },{url:'data:text/javascript;base64,'+Buffer.from(source).toString('base64'),delayed});
}
test('loaded publisher evidence pages and exact snapshots remain read-only untrusted text',async({page})=>{
 await open(page);const dialog=page.getByRole('dialog',{name:'Recorded publication evidence'});await expect(dialog.locator('article')).toHaveCount(8);await dialog.getByRole('button',{name:'Inspect publication snapshot'}).first().click();const snapshot=page.getByRole('dialog').filter({hasText:'Publication snapshot · read only'});expect(await snapshot.locator('pre').textContent()).toBe('Exact 😀\r\n中\r<img src=x onerror="window.__executed=true">\n');await expect(snapshot.locator('img')).toHaveCount(0);expect(await page.evaluate(()=>window.__executed)).toBeUndefined();await snapshot.getByRole('button',{name:'Close snapshot'}).click();await dialog.getByRole('button',{name:'Older evidence'}).click();await expect(dialog.locator('article')).toHaveCount(2);await expect(dialog.getByRole('button',{name:'Older evidence'})).toBeDisabled();await dialog.getByRole('button',{name:'Newer evidence'}).click();await expect(dialog.locator('article')).toHaveCount(8);
 for(const width of [1280,1600,2000]){await page.setViewportSize({width,height:1000});for(const theme of ['dark','light']){if(theme==='light')await page.evaluate(()=>document.body.classList.add('light'));for(const section of ['top','bottom']){await dialog.evaluate((e,section)=>{e.scrollTop=section==='top'?0:e.scrollHeight;},section);await page.screenshot({path:fileURLToPath(new URL(`../../../artifacts/contributor-evidence-component-${section}-${theme}-${width}.png`,import.meta.url)),animations:'disabled'});}}await page.evaluate(()=>document.body.classList.remove('light'));}
});
test('closing evidence or changing its page discards an outstanding exact-snapshot reply',async({page})=>{
 await open(page,true);let dialog=page.getByRole('dialog',{name:'Recorded publication evidence'});await dialog.getByRole('button',{name:'Inspect publication snapshot'}).first().click();await dialog.getByRole('button',{name:'Older evidence'}).click();await page.evaluate(()=>window.__releaseEvidence());await expect(page.getByRole('dialog')).toHaveCount(1);await dialog.getByRole('button',{name:'Inspect publication snapshot'}).first().click();await dialog.getByRole('button',{name:'Close evidence'}).click();await page.evaluate(()=>window.__releaseEvidence());await expect(page.getByRole('dialog')).toHaveCount(0);
});
