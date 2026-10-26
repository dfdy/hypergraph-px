// SPDX-License-Identifier: AGPL-3.0-only
// Each worker owns a headless browser; tests retain isolated contexts.
import {test as base,expect} from '@playwright/test';
import {testBrowser} from '../../scripts/browser-session.mjs';
export const test=base.extend({browser:[async({},use)=>{const browser=await testBrowser();try{await use(browser);}finally{await browser.close();}},{scope:'worker'}]});
export {expect};
