/**
 * # Hypergraph PX — Process tooling contract regression scenarios
 *
 * Checks generated API compatibility and change-sensitive tooling evidence without
 * altering runtime versions, publication authority or acceptance boundaries.
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
 * Used by: Frontend development validation — Node unit-test runner, schema
 * conformance and developer-tooling regression suite.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Browser runtime and API contract][spec-2]
 * - [development evidence md][spec-3]
 *
 * Boundary: Synthetic schema mutations and transport responses are verification
 * inputs, not adopted format changes. Planning checks never grant deployment,
 * trust enrollment or product-acceptance authority.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/process-tooling.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/09-guides/reference/development-evidence.md
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,utimes} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {assetDigest,hashFiles,validEntry,filesUnder} from '../scripts/build-cache.mjs';
import {planChanges} from '../../shared/tooling/verify-change.mjs';
import {handoffRequested,verifyTestedFingerprint} from '../scripts/manual-runtime-update.mjs';

test('milestone opt-in never removes tested-binary identity validation',/* Verify milestone handoff opt-in never bypasses tested-binary fingerprint checks. */ ()=>{
 assert.equal(handoffRequested([]),false);assert.equal(handoffRequested(['--handoff']),true);assert.doesNotThrow(/* Accept exactly matching valid tested fingerprints. */ ()=>verifyTestedFingerprint('a'.repeat(64),'a'.repeat(64)));assert.throws(/* Reject a different tested fingerprint. */ ()=>verifyTestedFingerprint('a'.repeat(64),'b'.repeat(64)));assert.throws(/* Reject malformed fingerprints even when their strings match. */ ()=>verifyTestedFingerprint('invalid','invalid'));
});

test('cache validation detects changed bytes with restored timestamps, corrupt output, added files and source mismatch',/* Verify cache checks use bytes and complete outputs rather than restored timestamps or partial manifests. */ async()=>{
 const directory=await mkdtemp(join(tmpdir(),'hpx-cache-test-'));

 try{
  const assets=join(directory,'assets'),file=join(assets,'app.js');

  await mkdir(assets);await writeFile(file,'original');

  const digest=await assetDigest(assets),input=await hashFiles([file]);

  await writeFile(join(directory,'manifest.json'),JSON.stringify({source:'expected',assets:digest}));assert.ok(await validEntry(directory,'expected'));assert.equal(await validEntry(directory,'other'),null);
  await writeFile(file,'modified');await utimes(file,new Date(0),new Date(0));assert.notEqual(await hashFiles([file]),input);assert.equal(await validEntry(directory,'expected'),null);
  await writeFile(file,'original');await writeFile(join(assets,'extra.js'),'unexpected');assert.equal(await validEntry(directory,'expected'),null);assert.equal((await filesUnder(assets)).length,2);
  await writeFile(join(directory,'manifest.json'),'not json');assert.equal(await validEntry(directory,'expected'),null);
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('documentation plan runs archive checks without claiming new application evidence',/* Verify documentation verification does not claim fresh application acceptance evidence. */ ()=>{
 const plan=planChanges(['docs/README.md']);

 assert.equal(plan.classification,'documentation');assert.equal(plan.tiers.A[0].command[1],'shared/tooling/verify_documentation.py');assert.equal(plan.tiers.B.length,0);assert.match(plan.omittedBroadEvidence,/no new application acceptance/);
});

test('frontend feedback never automatically compiles or deploys Rust; full browser and integration review stay required',/* Verify frontend feedback preserves browser/integration review without automatic Rust build or deployment. */ ()=>{
 const plan=planChanges(['frontend/styles.css']);

 assert.equal(plan.classification,'frontend');assert.equal(plan.tiers.A.length,2);assert.ok(plan.tiers.C.some(/* Find the required browser regression tier. */ item=>item.command.includes('test:ui')));assert.ok(!plan.tiers.A.some(/* Detect an unintended Rust compile in the fast feedback tier. */ item=>item.command.includes('cargo')));assert.match(plan.requiredReview.join(' '),/actual HTTPS/);assert.match(plan.status,/not integration/);
});

test('sensitive storage, handoff, unknown and proof changes cannot acquire a broad regression waiver',/* Verify sensitive storage/proof/dependency/unknown changes receive no broad-regression waiver. */ ()=>{
 for(const file of ['crates/storage/src/temporal_commit.rs','frontend/scripts/manual-runtime-update.mjs','scripts/new-unknown.mjs','proofs/lean/SpendProof.lean','Cargo.lock','frontend/package.json','frontend/package-lock.json']){const plan=planChanges([file]);

  assert.equal(plan.classification,'broad-or-sensitive',file);assert.ok(plan.tiers.C.some(/* Find required workspace-wide checks for sensitive changes. */ item=>item.command.includes('--workspace')),file);assert.match(plan.omittedBroadEvidence,/No broad waiver/);}


 assert.throws(/* Reject an empty changed-file plan. */ ()=>planChanges([]));assert.throws(/* Reject repository-escaping relative paths. */ ()=>planChanges(['../outside']));assert.throws(/* Reject absolute changed-file paths. */ ()=>planChanges(['/absolute']));
});

test('tooling plans do not turn their own checks into application integration',/* Verify tooling-only checks remain a plan rather than application integration evidence. */ ()=>{
 const plan=planChanges(['frontend/scripts/run-ui.mjs','frontend/build.mjs']);

 assert.equal(plan.classification,'tooling');assert.equal(plan.tiers.A.length,1);assert.match(plan.requiredReview[0],/cache invalidation/);assert.match(plan.status,/plan only/);
});

test('relocated model and tooling paths do not acquire a documentation-only regression waiver',/* Verify relocated diagram/proof/tooling paths retain sensitive classification and frontend browser checks remain present. */ ()=>{for(const p of ['docs/04-architecture/diagrams/executable.c4','docs/05-domain/diagrams/identity-closure.c4','docs/likec4.config.json','docs/02-governance/registers/contract-bindings.json','backend/proofs/lean/Hypergraph/Expansion.lean','shared/tooling/unknown.py','shared/legal/RUST_DEPENDENCIES.json'])assert.equal(planChanges([p]).classification,'broad-or-sensitive',p);

 assert.ok(planChanges(['frontend/styles.css']).tiers.A.some(/* Find the focused Markdown browser regression in the frontend plan. */ t=>t.command.includes('tests/browser/markdown-presentation.spec.js')));});
