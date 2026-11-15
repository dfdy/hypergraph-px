// SPDX-License-Identifier: AGPL-3.0-only
/**
 * # Hypergraph PX — Isolated headless browser fixtures
 *
 * Give each browser-test worker its own headless browser and redirect screenshots
 * into its isolated artifact directory.
 *
 * Source: [Latest source on GitHub][source]
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex (OpenAI coding agent), /root.
 * Latest editing harness: Codex; version/build: unknown.
 * Latest editing model: OpenAI; exact model identifier/revision: unknown.
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: Playwright browser regression tests through the shared test and expect
 * exports.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Development evidence and test isolation][spec-2]
 *
 * Boundary: The fixture closes its browser in a finally block. It does not attach
 * to the owner browser or prove actual encrypted-runtime integration.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/browser/fixtures.js
 * [spec-1]: ../../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../../docs/09-guides/reference/development-evidence.md
 */

import {test as base,expect} from '@playwright/test';
import {testBrowser} from '../../scripts/browser-session.mjs';
import {resolve,relative,join,basename} from 'node:path';
import {mkdir} from 'node:fs/promises';

const artifacts=resolve(import.meta.dirname,'../../../.local/artifacts');

/** Provide worker-owned headless browsers and per-test screenshot isolation to browser scenarios. */
export const test=base.extend({browser:[/* Own and close one headless browser for this worker, even when its tests fail. */ async({},use)=>{const browser=await testBrowser();

 try{await use(browser);}finally{await browser.close();}},{scope:'worker'}],page:/* Wrap this test page screenshot method before yielding it to the test scenario. */ async({page},use)=>{
 const screenshot=page.screenshot.bind(page);


 page.screenshot=/* Redirect requested screenshots below the isolated run artifact directory, retaining other screenshot options. */ async(options={})=>{if(options.path){const path=relative(artifacts,resolve(options.path));

   const isolated=join(process.env.HPX_UI_ARTIFACTS,'screenshots',path.startsWith('..')?basename(options.path):path);

   await mkdir(resolve(isolated,'..'),{recursive:true});options={...options,path:isolated};}

  return screenshot(options);};
 await use(page);
}});

export {expect};
