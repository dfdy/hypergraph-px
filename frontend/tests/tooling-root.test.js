import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,chmod,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('relocated root build wrapper discovers the repository from an alternate cwd without real builds',async()=>{
 const root=resolve(fileURLToPath(new URL('../..',import.meta.url))),directory=await mkdtemp(join(tmpdir(),'hpx-root-discovery-'));
 try{
  for(const name of ['npm','cargo']){const p=join(directory,name);await writeFile(p,'#!'+process.execPath+'\nif(process.argv[2]==="metadata"){console.log(JSON.stringify({target_directory:process.cwd()+"/.local/target"}));process.exit(0); }console.log(JSON.stringify({tool:'+JSON.stringify(name)+',cwd:process.cwd(),args:process.argv.slice(2),build:process.env.HPX_RELEASE_BUILD_NUMBER??null}));\n');await chmod(p,0o700);}
  const result=spawnSync(process.execPath,[join(root,'shared/tooling/hpx.mjs'),'build','--build-number','7'],{cwd:directory,env:{...process.env,PATH:directory},encoding:'utf8',timeout:15000});
  assert.equal(result.status,0,result.stderr);const calls=result.stdout.split('\n').filter(l=>l.startsWith('{')).map(l=>JSON.parse(l));assert.equal(calls.length,5);assert.ok(calls.every(c=>c.cwd===root));assert.deepEqual(calls.map(c=>c.tool),['npm','cargo','npm','npm','cargo']);assert.equal(calls.at(-1).build,'7');assert.ok(!calls.at(-1).args.includes('dev-backend'));assert.match(result.stdout,/target\/release\/hypergraph/);
 }finally{await rm(directory,{recursive:true,force:true});}
});
