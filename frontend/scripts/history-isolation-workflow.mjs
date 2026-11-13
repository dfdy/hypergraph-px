// SPDX-License-Identifier: AGPL-3.0-only
import {expect} from '@playwright/test';
import {resolve} from 'node:path';
export async function exerciseHistoryIsolation({page,root,checks}){
 const panel=page.locator('#investigationBody');
 for(const stage of ['snapshot','comparison-head','comparison-sources']){
  await page.evaluate(stage=>{
   const actual=window.fetch.bind(window);let once=true,start;window.__historyInspectionStarted=new Promise(resolve=>{start=resolve;});window.__restoreHistoryInspection=()=>{window.fetch=actual;};
   window.fetch=async(...args)=>{const inputUrl=args[0] instanceof Request?args[0].url:String(args[0]);const inputBody=args[0] instanceof Request?await args[0].clone().text():args[1]?.body;
    const response=await actual(...args),path=inputUrl;
    const match=stage==='comparison-head'?(path.endsWith('/api/v1/history')||path.endsWith('/api/v1/branches/history/page'))&&JSON.parse(inputBody).limit===1:path.endsWith('/api/v1/snapshot');
    if(once&&match){once=false;start();await new Promise(resolve=>{window.__releaseHistoryInspection=resolve;});}return response;
   };
  },stage);
  await panel.getByRole('button',{name:stage==='snapshot'?'View snapshot':'Compare with latest committed',exact:true}).first().click();await page.evaluate(()=>Promise.race([window.__historyInspectionStarted,new Promise((_,reject)=>setTimeout(()=>reject(Error('History inspection interception timed out')),10000))]));
  await panel.getByRole('button',{name:'Refresh',exact:true}).click();await expect(panel).toContainText('History page 1');
  await page.evaluate(async()=>{window.__releaseHistoryInspection();window.__restoreHistoryInspection();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
  await expect(page.locator('dialog')).toHaveCount(0);
 }
 await panel.getByRole('button',{name:'View snapshot',exact:true}).first().click();await expect(page.getByRole('dialog',{name:'Historical snapshot · read only'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('dialog')).toHaveCount(0);
 await panel.getByRole('button',{name:'Compare with latest committed',exact:true}).first().click();const comparison=page.getByRole('dialog',{name:'Compare committed snapshots'});await expect(comparison).toBeVisible();
 for(const width of [1280,1600,2000]){await page.setViewportSize({width,height:1000});for(const theme of ['dark','light']){await page.evaluate(theme=>document.body.classList.toggle('light',theme==='light'),theme);await page.screenshot({path:resolve(root,`artifacts/runtime-history-isolation-${theme}-${width}.png`),animations:'disabled'});}}
 await page.evaluate(()=>document.body.classList.remove('light'));await page.setViewportSize({width:1600,height:1000});await page.keyboard.press('Escape');await expect(page.locator('dialog')).toHaveCount(0);
 checks.push('history refresh invalidates delayed snapshot, comparison-head and comparison-source replies; Escape removes exact-source dialogs');
}
