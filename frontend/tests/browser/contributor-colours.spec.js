// Synthetic publication facts only; this does not enable multi-user mutation.
import {test,expect} from './fixtures.js';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const frontend=fileURLToPath(new URL('../../',import.meta.url)),styles=await readFile(new URL('../../styles.css',import.meta.url),'utf8');
let moduleSource;
test.beforeAll(async()=>{const result=await build({absWorkingDir:frontend,entryPoints:['src/runtime-contributors.js'],bundle:true,format:'esm',write:false});moduleSource=result.outputFiles[0].text;});
test('contributor badges keep white initials and stable identity colours across pages in both themes',async({page})=>{
 await page.goto('about:blank');await page.addStyleTag({content:styles});
 await page.evaluate(async url=>{
  const {renderPublicationContributors}=await import(url),id=n=>Array(32).fill(n),parent=document.createElement('section');parent.style.cssText='width:340px;height:90vh;overflow:auto;margin:24px;padding:12px;background:var(--panel)';document.body.append(parent);
  const fact=n=>({principal:id(n),revision:id(n+20),snapshot:id(2),operation:id(n+40),role:'publisher'});
  const adapter={lifecycle:'unlocked',get:()=>({runtime:{snapshot:id(2)}}),publicationContributors:async(document,snapshot,cursor)=>({current_human:{principal:id(1),label:'Current synthetic human'},publications:cursor===null?[fact(1),fact(3),fact(4)]:[fact(5),fact(6)],next:cursor===null?[99]:null,complete_text_publications:cursor!==null})};
  renderPublicationContributors(parent,adapter,'synthetic-document');
 },'data:text/javascript;base64,'+Buffer.from(moduleSource).toString('base64'));
 await expect(page.locator('.contributor')).toHaveCount(3);
 const initial=await page.locator('.contributor').evaluateAll(rows=>rows.map(r=>({principal:r.dataset.principal,background:getComputedStyle(r.querySelector('.dot')).backgroundColor})));
 await page.getByRole('button',{name:'More publication evidence',exact:true}).click();await expect(page.locator('.contributor')).toHaveCount(5);
 for(const width of [1280,1600,2000]){await page.setViewportSize({width,height:1000});for(const theme of ['dark','light']){
  await page.evaluate(theme=>document.body.classList.toggle('light',theme==='light'),theme);
  const badges=await page.locator('.contributor').evaluateAll(rows=>rows.map(r=>{const e=r.querySelector('.dot'),style=getComputedStyle(e);return {principal:r.dataset.principal,background:style.backgroundColor,foreground:style.color};}));
  expect(badges.slice(0,3).map(({principal,background})=>({principal,background}))).toEqual(initial);expect(new Set(badges.map(b=>b.background)).size).toBe(5);expect(badges.every(b=>b.foreground==='rgb(255, 255, 255)')).toBe(true);
  await expect(page.getByText('No current agent',{exact:true})).toBeVisible();await expect(page.getByText('Principal kind not recorded',{exact:true})).toHaveCount(4);
  await page.locator('section').evaluate(e=>{e.scrollTop=0;});await page.screenshot({path:`../artifacts/contributor-colours-${theme}-${width}.png`,animations:'disabled'});
 }}
});
