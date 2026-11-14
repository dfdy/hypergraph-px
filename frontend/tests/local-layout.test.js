import test from 'node:test';
import assert from 'node:assert/strict';
import {cargoTargetDirectory,cargoExecutable} from '../../shared/tooling/cargo-path.mjs';
import {resolve} from 'node:path';
import {requireCurrentManualRecord} from '../../shared/tooling/manual-record.mjs';
const root=resolve('/fixture checkout with spaces');
test('Cargo metadata owns output directory including environment/config override',()=>{
 const env={CARGO_TARGET_DIR:'/external/cache'};
 const execute=(program,args,options)=>{assert.equal(program,'cargo');assert.equal(options.cwd,root);assert.equal(options.env,env);assert.ok(args.includes('--offline'));return JSON.stringify({target_directory:'/external/cache'});};
 assert.equal(cargoTargetDirectory({root,env,execute}),'/external/cache');
});
test('Cargo executable lookup supports release/custom profiles,cross targets and examples',()=>{
 const execute=()=>JSON.stringify({target_directory:'/external/cache'});
 assert.equal(cargoExecutable({root,execute,profile:'release',target:'aarch64-apple-darwin'}),'/external/cache/aarch64-apple-darwin/release/hypergraph');
 assert.equal(cargoExecutable({root,execute,profile:'bench',target:'/configs/custom.json',name:'probe',example:true}),'/external/cache/custom/bench/examples/probe');
});
test('Cargo lookup rejects malformed metadata rather than silently using a hardcoded target',()=>{
 assert.throws(()=>cargoTargetDirectory({execute:()=>JSON.stringify({})}),/target_directory/);
 assert.throws(()=>cargoExecutable({execute:()=>JSON.stringify({target_directory:'/x'}),profile:'../bad'}),/Invalid/);
});
test('legacy stopped manual records cannot redirect an old workspace identity',()=>{
 const record={synthetic:true,pid:123,origin:'https://127.0.0.1:8388',workspace:root+'/artifacts/old/workspace.hpx'};
 assert.throws(()=>requireCurrentManualRecord(root,record,{exists:()=>true}),/explicit stopped-record migration/);
 assert.equal(record.workspace,root+'/artifacts/old/workspace.hpx');
});
test('missing canonical manual workspace is refused rather than recreated',()=>{
 const record={synthetic:true,pid:123,origin:'https://127.0.0.1:8388',workspace:root+'/.local/workspaces/manual.hpx'};
 assert.throws(()=>requireCurrentManualRecord(root,record,{exists:()=>false}),/missing/);
 assert.equal(requireCurrentManualRecord(root,record,{exists:()=>true}),record);
});
test('manual record guard rejects path escapes and nonloopback identity without mutating facts',()=>{
 const record={synthetic:true,pid:123,origin:'https://127.0.0.1:8388',workspace:root+'/.local/workspaces/../elsewhere.hpx'};
 assert.throws(()=>requireCurrentManualRecord(root,record,{exists:()=>true}),/Legacy/);
 assert.throws(()=>requireCurrentManualRecord(root,{...record,origin:'https://example.com'},{exists:()=>true}),/Unexpected/);
});

test('Cargo executable lookup uses the same injected environment for metadata and cross-target selection',()=>{
 const env={CARGO_TARGET_DIR:'/injected/cache',CARGO_BUILD_TARGET:'injected-target'};
 const execute=(program,args,options)=>{assert.equal(options.env,env);return JSON.stringify({target_directory:env.CARGO_TARGET_DIR});};
 assert.equal(cargoExecutable({root,env,execute,profile:'release'}),'/injected/cache/injected-target/release/hypergraph');
 assert.equal(cargoExecutable({root,env,execute,target:'explicit-target'}),'/injected/cache/explicit-target/debug/hypergraph');
});
test('An injected host environment does not inherit an unrelated ambient Cargo target',async()=>{
 const {spawnSync}=await import('node:child_process');
 const moduleURL=new URL('../../shared/tooling/cargo-path.mjs',import.meta.url).href;
 const source='import {cargoExecutable} from '+JSON.stringify(moduleURL)+'; console.log(cargoExecutable({env:{},execute:()=>JSON.stringify({target_directory:"/injected/cache"})}));';
 const result=spawnSync(process.execPath,['--input-type=module','-e',source],{env:{...process.env,CARGO_BUILD_TARGET:'unrelated-ambient-target'},encoding:'utf8',timeout:10000});
 assert.equal(result.status,0,result.stderr);
 assert.equal(result.stdout.trim(),'/injected/cache/debug/hypergraph');
});
