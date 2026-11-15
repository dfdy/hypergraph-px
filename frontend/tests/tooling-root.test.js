/**
 * # Hypergraph PX — Tooling root developer-boundary scenarios
 *
 * Checks development tooling boundaries using explicit output capture, isolated
 * temporary fixtures and controlled local services where required.
 *
 * Source: [Latest source on GitHub][source]
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex (OpenAI coding agent), /root/frontend_comments.
 * Latest editing harness: Codex; version/build: unknown.
 * Latest editing model: OpenAI; exact model identifier/revision: unknown.
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: Frontend development validation — Node unit-test runner and
 * developer-tooling regression suite.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [development evidence md][spec-3]
 *
 * Boundary: Certificates and data are isolated test fixtures; no owner trust or
 * manual workspace is enrolled. Embedded fixture strings and executable assertions
 * remain byte-for-byte unchanged.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/tooling-root.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/09-guides/reference/development-evidence.md
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,chmod,rm} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('relocated root build wrapper discovers the repository from an alternate cwd without real builds',/* Verify relocated wrapper resolves repository root from another cwd using temporary fake tools and no real build. */ async()=>{
 const root=resolve(fileURLToPath(new URL('../..',import.meta.url))),directory=await mkdtemp(join(tmpdir(),'hpx-root-discovery-'));


 try{
  for(const name of ['npm','cargo']){const p=join(directory,name);

   await writeFile(p,'#!'+process.execPath+'\nif(process.argv[2]==="metadata"){console.log(JSON.stringify({target_directory:process.cwd()+"/.local/target"}));process.exit(0); }console.log(JSON.stringify({tool:'+JSON.stringify(name)+',cwd:process.cwd(),args:process.argv.slice(2),build:process.env.HPX_RELEASE_BUILD_NUMBER??null}));\n');await chmod(p,0o700);}


  const result=spawnSync(process.execPath,[join(root,'shared/tooling/hpx.mjs'),'build','--build-number','7'],{cwd:directory,env:{...process.env,PATH:directory},encoding:'utf8',timeout:15000});


  assert.equal(result.status,0,result.stderr);

  const calls=result.stdout.split('\n').filter(/* Select structured fake-tool output lines. */ l=>l.startsWith('{')).map(/* Decode each recorded invocation for root/ordering checks. */ l=>JSON.parse(l));

  assert.equal(calls.length,5);assert.ok(calls.every(/* Require every tool invocation to use the repository root. */ c=>c.cwd===root));assert.deepEqual(calls.map(/* Collect tool names to verify wrapper stage order. */ c=>c.tool),['npm','cargo','npm','npm','cargo']);assert.equal(calls.at(-1).build,'7');assert.ok(!calls.at(-1).args.includes('dev-backend'));assert.match(result.stdout,/target\/release\/hypergraph/);
 }finally{await rm(directory,{recursive:true,force:true});}
});
