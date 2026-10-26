// Verify the review's standalone viewer, not the HPX frontend or runtime.
const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'../../..');const out=path.join(root,'docproject/architecture-review');
const {chromium}=require(path.join(root,'frontend/node_modules/playwright-core'));
(async()=>{const browser=await chromium.launch({headless:true});const errors=[];
try{const context=await browser.newContext({viewport:{width:1600,height:1100}});await context.route('**/*',r=>r.abort());const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
await page.goto('about:blank');await page.setContent(fs.readFileSync(path.join(out,'diagrams/viewer.html'),'utf8'));
const optionCount=await page.locator('#choice option').count();if(optionCount!==51)throw Error('Wrong option count '+optionCount);
await page.selectOption('#choice','HPX-DIAG-015');if(!(await page.locator('#title').innerText()).includes('HPX-DIAG-015'))throw Error('Selection failed');
await page.fill('#filter','003.002');const filtered=await page.locator('#choice option').count();if(filtered<1||filtered===51)throw Error('Filter failed');
await page.fill('#filter','');await page.selectOption('#choice','HPX-DIAG-001');await page.locator('#children button').first().click();if(!(await page.locator('#title').innerText()).includes('HPX-DIAG-002'))throw Error('Child navigation failed');
await page.locator('#zoom').evaluate(el=>{el.value='150';el.dispatchEvent(new Event('input',{bubbles:true}));});if((await page.locator('#scale').innerText())!=='150%')throw Error('Zoom failed');
await page.selectOption('#choice','HPX-DIAG-033');await page.screenshot({path:path.join(out,'validation/viewer-desktop.png'),fullPage:true});
if(errors.length)throw Error(errors.join('\n'));const result={headless:true,network:'All requests aborted; inline SVG and JS only',personal_profile:false,application_runtime:false,checks:['51 selectable diagrams','exact selection','process search','linked child navigation','zoom control','no page JavaScript errors'],passed:true};
fs.writeFileSync(path.join(out,'validation/viewer-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));await context.close();}
finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
