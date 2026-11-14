import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,utimes} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {assetDigest,hashFiles,validEntry,filesUnder} from '../scripts/build-cache.mjs';
import {planChanges} from '../../shared/tooling/verify-change.mjs';
import {handoffRequested,verifyTestedFingerprint} from '../scripts/manual-runtime-update.mjs';
test('milestone opt-in never removes tested-binary identity validation',()=>{
 assert.equal(handoffRequested([]),false);assert.equal(handoffRequested(['--handoff']),true);assert.doesNotThrow(()=>verifyTestedFingerprint('a'.repeat(64),'a'.repeat(64)));assert.throws(()=>verifyTestedFingerprint('a'.repeat(64),'b'.repeat(64)));assert.throws(()=>verifyTestedFingerprint('invalid','invalid'));
});
test('cache validation detects changed bytes with restored timestamps, corrupt output, added files and source mismatch',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'hpx-cache-test-'));try{
  const assets=join(directory,'assets'),file=join(assets,'app.js');await mkdir(assets);await writeFile(file,'original');const digest=await assetDigest(assets),input=await hashFiles([file]);await writeFile(join(directory,'manifest.json'),JSON.stringify({source:'expected',assets:digest}));assert.ok(await validEntry(directory,'expected'));assert.equal(await validEntry(directory,'other'),null);
  await writeFile(file,'modified');await utimes(file,new Date(0),new Date(0));assert.notEqual(await hashFiles([file]),input);assert.equal(await validEntry(directory,'expected'),null);
  await writeFile(file,'original');await writeFile(join(assets,'extra.js'),'unexpected');assert.equal(await validEntry(directory,'expected'),null);assert.equal((await filesUnder(assets)).length,2);
  await writeFile(join(directory,'manifest.json'),'not json');assert.equal(await validEntry(directory,'expected'),null);
 }finally{await rm(directory,{recursive:true,force:true});}
});
test('documentation plan runs archive checks without claiming new application evidence',()=>{
 const plan=planChanges(['docs/README.md']);assert.equal(plan.classification,'documentation');assert.equal(plan.tiers.A[0].command[1],'shared/tooling/verify_documentation.py');assert.equal(plan.tiers.B.length,0);assert.match(plan.omittedBroadEvidence,/no new application acceptance/);
});
test('frontend feedback never automatically compiles or deploys Rust; full browser and integration review stay required',()=>{
 const plan=planChanges(['frontend/styles.css']);assert.equal(plan.classification,'frontend');assert.equal(plan.tiers.A.length,2);assert.ok(plan.tiers.C.some(item=>item.command.includes('test:ui')));assert.ok(!plan.tiers.A.some(item=>item.command.includes('cargo')));assert.match(plan.requiredReview.join(' '),/actual HTTPS/);assert.match(plan.status,/not integration/);
});
test('sensitive storage, handoff, unknown and proof changes cannot acquire a broad regression waiver',()=>{
 for(const file of ['crates/storage/src/temporal_commit.rs','frontend/scripts/manual-runtime-update.mjs','scripts/new-unknown.mjs','proofs/lean/SpendProof.lean','Cargo.lock','frontend/package.json','frontend/package-lock.json']){const plan=planChanges([file]);assert.equal(plan.classification,'broad-or-sensitive',file);assert.ok(plan.tiers.C.some(item=>item.command.includes('--workspace')),file);assert.match(plan.omittedBroadEvidence,/No broad waiver/);}
 assert.throws(()=>planChanges([]));assert.throws(()=>planChanges(['../outside']));assert.throws(()=>planChanges(['/absolute']));
});
test('tooling plans do not turn their own checks into application integration',()=>{
 const plan=planChanges(['frontend/scripts/run-ui.mjs','frontend/build.mjs']);assert.equal(plan.classification,'tooling');assert.equal(plan.tiers.A.length,1);assert.match(plan.requiredReview[0],/cache invalidation/);assert.match(plan.status,/plan only/);
});

test('relocated model and tooling paths do not acquire a documentation-only regression waiver',()=>{for(const p of ['docs/architecture/C3/executable.c4','backend/proofs/lean/Hypergraph/Expansion.lean','shared/tooling/unknown.py','shared/legal/RUST_DEPENDENCIES.json'])assert.equal(planChanges([p]).classification,'broad-or-sensitive',p);assert.ok(planChanges(['frontend/styles.css']).tiers.A.some(t=>t.command.includes('tests/browser/markdown-presentation.spec.js')));});
