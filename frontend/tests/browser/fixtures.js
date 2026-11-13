// SPDX-License-Identifier: AGPL-3.0-only
// Each worker owns a headless browser; tests retain isolated contexts.
import {test as base,expect} from '@playwright/test';
import {testBrowser} from '../../scripts/browser-session.mjs';
import {resolve,relative,join,basename} from 'node:path';
import {mkdir} from 'node:fs/promises';
const artifacts=resolve(import.meta.dirname,'../../../artifacts');
export const test=base.extend({browser:[async({},use)=>{const browser=await testBrowser();try{await use(browser);}finally{await browser.close();}},{scope:'worker'}],page:async({page},use)=>{
 const screenshot=page.screenshot.bind(page);
 page.screenshot=async(options={})=>{if(options.path){const path=relative(artifacts,resolve(options.path));const isolated=join(process.env.HPX_UI_ARTIFACTS,'screenshots',path.startsWith('..')?basename(options.path):path);await mkdir(resolve(isolated,'..'),{recursive:true});options={...options,path:isolated};}return screenshot(options);};
 await use(page);
}});
export {expect};
