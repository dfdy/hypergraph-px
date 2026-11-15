/**
 * # Hypergraph PX — Shared input boundary developer-boundary scenarios
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/shared-input-boundary.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/09-guides/reference/development-evidence.md
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,symlink} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {sharedBrowserInputFiles,hashFiles,isSharedBrowserInput} from '../scripts/build-cache.mjs';

test('browser shared input identity excludes tooling, credentials and runtime but includes each consumed schema/catalogue/notice',/* Verify browser input hashing includes only consumed public schema/catalog/notice files and excludes private/tooling/runtime paths. */ async()=>{
 const root=await mkdtemp(join(tmpdir(),'hpx-shared-boundary-'));


 try{
  for(const p of ['shared','shared/legal/upstream-notices','shared/tooling','shared/credentials','shared/runtime'])await mkdir(join(root,p),{recursive:true});


  const inputs=['shared/openapi.json','shared/predicate-catalog-v1.json','shared/legal/upstream-notices/example-LICENSE'];


  for(const p of inputs)await writeFile(join(root,p),'original');


  const identity=/* Calculate the isolated fixture’s selected-input hash after each mutation. */ async()=>hashFiles(await sharedBrowserInputFiles(root)),before=await identity();


  for(const p of ['shared/tooling/script.py','shared/credentials/private.key','shared/runtime/workspace.sqlite','shared/README.md','shared/legal/upstream-notices/private.log'])await writeFile(join(root,p),'must not hash');


  assert.equal(await identity(),before);assert.equal((await sharedBrowserInputFiles(root)).length,3);


  for(const p of inputs){await writeFile(join(root,p),'changed');assert.notEqual(await identity(),before,p);await writeFile(join(root,p),'original');assert.equal(await identity(),before);}


  await writeFile(join(root,'shared/legal/upstream-notices/new-LICENSE'),'new notice');assert.notEqual(await identity(),before);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('shared watch scope matches explicit public browser inputs, never tooling/private trees',/* Verify watcher scope matches only explicit public browser inputs and excludes nested/private trees. */ ()=>{
 for(const p of ['openapi.json','predicate-catalog-v1.json','legal/upstream-notices/example-LICENSE'])assert.equal(isSharedBrowserInput(p),true,p);


 for(const p of [null,'','tooling/script.py','credentials/private.key','runtime/workspace.sqlite','README.md','shared/legal/ASSETS.md','shared/legal/upstream-notices/private.log','shared/legal/upstream-notices/nested/a-LICENSE'])assert.equal(isSharedBrowserInput(p),false,p);
});

test('selected legal notices cannot be symlinks into unrelated/private inputs',/* Verify selected legal-notice symlinks cannot pull unrelated private inputs into browser hashing. */ async()=>{
 const root=await mkdtemp(join(tmpdir(),'hpx-notice-boundary-'));


 try{await mkdir(join(root,'shared/legal/upstream-notices'),{recursive:true});await writeFile(join(root,'private'),'secret fixture');await symlink(join(root,'private'),join(root,'shared/legal/upstream-notices/bad-LICENSE'));await assert.rejects(sharedBrowserInputFiles(root),/regular file/);}
 finally{await rm(root,{recursive:true,force:true});}
});
