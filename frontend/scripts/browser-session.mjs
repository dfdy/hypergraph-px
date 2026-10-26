// SPDX-License-Identifier: AGPL-3.0-only
// Owner preference: permanently headless, isolated test sessions only.
import {chromium} from '@playwright/test';
export async function testBrowser(){
 const browser=await chromium.launch({headless:true});
 await browser.newContext();
 return browser;
}
