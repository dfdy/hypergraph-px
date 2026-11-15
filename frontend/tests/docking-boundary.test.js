/**
 * # Hypergraph PX — Docking boundary ownership regression scenarios
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
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/docking-boundary.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/09-guides/reference/development-evidence.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import {workspacePanels,dockPositions} from '../src/workspace-docking.js';

/** Read a source or dependency fixture relative to this test module. */
const file=path=>readFile(new URL(path,import.meta.url),'utf8');

/** Inspect executable syntax, retaining literals while excluding documentation links and explanatory comments. */
function executableSource(source){
 const parsed=ts.createSourceFile('boundary.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);

 return ts.createPrinter({removeComments:true}).printFile(parsed);
}

test('workspace docking declares only presentation panels and bounded relative positions',/* Verify docking declares only presentation panels and bounded placement directions. */ ()=>{
 assert.deepEqual(workspacePanels.map(/* Collect panel identities to verify the declared presentation scope. */ panel=>panel.id),['explorer','editor','investigation']);
 assert.deepEqual(dockPositions,['left','right','top','bottom']);
 assert.ok(Object.isFrozen(workspacePanels));assert.ok(Object.isFrozen(dockPositions));
});

test('docking boundary owns DOM placement, not source, editor construction, API or persistent layout data',/* Verify docking owns DOM placement without source/API construction or persistent layout authority. */ async()=>{
 const source=await file('../src/workspace-docking.js');


 assert.match(source,/createDockview\(host/);assert.match(source,/renderer:'always'/);
 assert.doesNotMatch(executableSource(source),/EditorView|EditorState|fetch\(|localStorage|toJSON|fromJSON|innerHTML/);
 assert.match(source,/surface\.append\(editor,navigator\)/);
});

test('reviewed docking and component dependencies are pinned registry packages with retained MIT notices',/* Verify exact dependency versions, registry integrity, retained MIT notices and bundled local component assets. */ async()=>{
 const manifest=JSON.parse(await file('../package.json')),lock=JSON.parse(await file('../package-lock.json'));


 for(const [name,version,path] of [['dockview','8.9.0','LICENCE.md'],['dockview-core','8.9.0','LICENCE.md'],['@awesome.me/webawesome','3.14.0','LICENSE.md']]){
  const entry=lock.packages['node_modules/'+name];

  assert.equal(entry.version,version);assert.equal(entry.license,'MIT');
  assert.ok(entry.resolved.startsWith('https://registry.npmjs.org/'));assert.match(entry.integrity,/^sha512-/);


  if(name!=='dockview-core')assert.equal(manifest.dependencies[name],version);


  const license=await file('../node_modules/'+name+'/'+path);

  assert.match(license,/Permission is hereby granted, free of charge/);assert.match(license,/copyright notice/);
 }


 const build=await file('../build.mjs');

 assert.match(build,/licen\[cs\]e/);assert.match(build,/vendor\/dockview\/dockview.css/);assert.match(build,/vendor\/webawesome\/styles/);


 const components=await file('../src/workspace-layout-controls.js');

 assert.match(components,/@awesome.me\/webawesome\/dist\/components\/button\/button.js/);assert.doesNotMatch(executableSource(components),/https?:\/\/|fetch\(|innerHTML/);
});
