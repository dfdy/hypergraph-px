// Capture only the built synthetic preview, never a user's running browser/session.
import {spawn,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';

const frontend=fileURLToPath(new URL('../',import.meta.url));
const output=fileURLToPath(new URL('../../docs/images/Screenshot.png',import.meta.url));
execFileSync(process.execPath,['build.mjs'],{cwd:frontend,stdio:'inherit'});
const server=spawn(process.execPath,['server.mjs'],{
 cwd:frontend,env:{...process.env,HYPERGRAPH_PREVIEW_PORT:'5193'},stdio:['ignore','pipe','pipe']
});
let browser;
try{
 await new Promise((resolve,reject)=>{
  let diagnostic='';
  const timeout=setTimeout(()=>reject(new Error('Screenshot preview startup timed out')),15000);
  const finish=error=>{clearTimeout(timeout);error?reject(error):resolve();};
  server.once('error',finish);
  server.once('exit',code=>finish(new Error(`Screenshot preview exited (${code}): ${diagnostic}`)));
  server.stderr.on('data',chunk=>{diagnostic+=chunk;});
  server.stdout.on('data',chunk=>{if(String(chunk).includes('http://127.0.0.1:5193'))finish();});
 });
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5193/',{waitUntil:'networkidle'});
 await page.getByRole('textbox',{name:'Markdown document editor'}).waitFor();
 await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
 if(errors.length)throw new Error(errors.join('\n'));
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Preview overflows screenshot viewport');
 await page.screenshot({path:output,animations:'disabled'});
 console.log(`Updated ${output} (1600 × 1000, synthetic data).`);
}finally{
 try{await browser?.close();}finally{server.kill();}
}
