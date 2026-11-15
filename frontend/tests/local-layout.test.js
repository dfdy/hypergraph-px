/**
 * # Hypergraph PX — Local layout ownership regression scenarios
 *
 * Checks presentation/tooling ownership, exact dependency provenance or local
 * output/manual-record guards using read-only inputs and isolated synthetic
 * fixtures.
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
 * - [development evidence md][spec-2]
 *
 * Boundary: Tests do not migrate or create manual workspaces, install trust,
 * execute real builds or grant handoff authority. Embedded subprocess fixtures and
 * executable assertions remain unchanged.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/local-layout.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/09-guides/reference/development-evidence.md
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {cargoTargetDirectory,cargoExecutable} from '../../shared/tooling/cargo-path.mjs';
import {resolve} from 'node:path';
import {requireCurrentManualRecord} from '../../shared/tooling/manual-record.mjs';

const root=resolve('/fixture checkout with spaces');

test('Cargo metadata owns output directory including environment/config override',/* Verify Cargo metadata determines output directory from the explicitly injected environment. */ ()=>{
 const env={CARGO_TARGET_DIR:'/external/cache'};


 /** Check program, cwd, environment and offline arguments before returning synthetic metadata. */
 const execute=(program,args,options)=>{assert.equal(program,'cargo');assert.equal(options.cwd,root);assert.equal(options.env,env);assert.ok(args.includes('--offline'));

  return JSON.stringify({target_directory:'/external/cache'});};


 assert.equal(cargoTargetDirectory({root,env,execute}),'/external/cache');
});

test('Cargo executable lookup supports release/custom profiles,cross targets and examples',/* Verify executable paths support release/custom profiles, target triples and examples. */ ()=>{
 /** Return deterministic synthetic Cargo output metadata without invoking Cargo. */
 const execute=()=>JSON.stringify({target_directory:'/external/cache'});


 assert.equal(cargoExecutable({root,execute,profile:'release',target:'aarch64-apple-darwin'}),'/external/cache/aarch64-apple-darwin/release/hypergraph');
 assert.equal(cargoExecutable({root,execute,profile:'bench',target:'/configs/custom.json',name:'probe',example:true}),'/external/cache/custom/bench/examples/probe');
});

test('Cargo lookup rejects malformed metadata rather than silently using a hardcoded target',/* Verify malformed metadata and escaping profile names are rejected rather than guessed. */ ()=>{
 assert.throws(/* Attempt metadata discovery without its required target directory. */ ()=>cargoTargetDirectory({execute:/* Return malformed metadata lacking target_directory. */ ()=>JSON.stringify({})}),/target_directory/);
 assert.throws(/* Attempt executable lookup with a repository-escaping profile. */ ()=>cargoExecutable({execute:/* Return valid metadata to isolate profile validation. */ ()=>JSON.stringify({target_directory:'/x'}),profile:'../bad'}),/Invalid/);
});

test('legacy stopped manual records cannot redirect an old workspace identity',/* Verify legacy stopped records cannot silently redirect workspace identity. */ ()=>{
 const record={synthetic:true,pid:123,origin:'https://127.0.0.1:8388',workspace:root+'/artifacts/old/workspace.hpx'};


 assert.throws(/* Attempt to use an unmigrated historical manual record. */ ()=>requireCurrentManualRecord(root,record,{exists:/* Model an existing fixture path without touching a real workspace. */ ()=>true}),/explicit stopped-record migration/);
 assert.equal(record.workspace,root+'/artifacts/old/workspace.hpx');
});

test('missing canonical manual workspace is refused rather than recreated',/* Verify missing canonical manual workspace is refused rather than recreated. */ ()=>{
 const record={synthetic:true,pid:123,origin:'https://127.0.0.1:8388',workspace:root+'/.local/workspaces/manual.hpx'};


 assert.throws(/* Attempt use of a missing canonical workspace record. */ ()=>requireCurrentManualRecord(root,record,{exists:/* Model the fixture workspace as absent. */ ()=>false}),/missing/);
 assert.equal(requireCurrentManualRecord(root,record,{exists:/* Model the fixture canonical path as present for the success case. */ ()=>true}),record);
});

test('manual record guard rejects path escapes and nonloopback identity without mutating facts',/* Verify path escapes and remote origins are rejected without rewriting recorded facts. */ ()=>{
 const record={synthetic:true,pid:123,origin:'https://127.0.0.1:8388',workspace:root+'/.local/workspaces/../elsewhere.hpx'};


 assert.throws(/* Attempt a workspace path containing a parent escape. */ ()=>requireCurrentManualRecord(root,record,{exists:/* Model the path as present so path validation is exercised. */ ()=>true}),/Legacy/);
 assert.throws(/* Attempt a nonloopback origin on the recorded manual identity. */ ()=>requireCurrentManualRecord(root,{...record,origin:'https://example.com'},{exists:/* Model the remote-origin fixture’s path as present. */ ()=>true}),/Unexpected/);
});

test('Cargo executable lookup uses the same injected environment for metadata and cross-target selection',/* Verify metadata and target selection share the exact injected environment. */ ()=>{
 const env={CARGO_TARGET_DIR:'/injected/cache',CARGO_BUILD_TARGET:'injected-target'};


 /** Assert environment identity and return its declared output directory. */
 const execute=(program,args,options)=>{assert.equal(options.env,env);

  return JSON.stringify({target_directory:env.CARGO_TARGET_DIR});};


 assert.equal(cargoExecutable({root,env,execute,profile:'release'}),'/injected/cache/injected-target/release/hypergraph');
 assert.equal(cargoExecutable({root,env,execute,target:'explicit-target'}),'/injected/cache/explicit-target/debug/hypergraph');
});

test('An injected host environment does not inherit an unrelated ambient Cargo target',/* Verify an explicitly empty host environment does not inherit an ambient Cargo target in an isolated subprocess. */ async()=>{
 const {spawnSync}=await import('node:child_process');


 const moduleURL=new URL('../../shared/tooling/cargo-path.mjs',import.meta.url).href;


 const source='import {cargoExecutable} from '+JSON.stringify(moduleURL)+'; console.log(cargoExecutable({env:{},execute:()=>JSON.stringify({target_directory:"/injected/cache"})}));';


 const result=spawnSync(process.execPath,['--input-type=module','-e',source],{env:{...process.env,CARGO_BUILD_TARGET:'unrelated-ambient-target'},encoding:'utf8',timeout:10000});


 assert.equal(result.status,0,result.stderr);
 assert.equal(result.stdout.trim(),'/injected/cache/debug/hypergraph');
});
