import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {workspacePanels,dockPositions} from '../src/workspace-docking.js';
const file=path=>readFile(new URL(path,import.meta.url),'utf8');

test('workspace docking declares only presentation panels and bounded relative positions',()=>{
 assert.deepEqual(workspacePanels.map(panel=>panel.id),['explorer','editor','investigation']);
 assert.deepEqual(dockPositions,['left','right','top','bottom']);
 assert.ok(Object.isFrozen(workspacePanels));assert.ok(Object.isFrozen(dockPositions));
});

test('docking boundary owns DOM placement, not source, editor construction, API or persistent layout data',async()=>{
 const source=await file('../src/workspace-docking.js');
 assert.match(source,/createDockview\(host/);assert.match(source,/renderer:'always'/);
 assert.doesNotMatch(source,/EditorView|EditorState|fetch\(|localStorage|toJSON|fromJSON|innerHTML/);
 assert.match(source,/surface\.append\(editor,navigator\)/);
});

test('reviewed docking and component dependencies are pinned registry packages with retained MIT notices',async()=>{
 const manifest=JSON.parse(await file('../package.json')),lock=JSON.parse(await file('../package-lock.json'));
 for(const [name,version,path] of [['dockview','8.9.0','LICENCE.md'],['dockview-core','8.9.0','LICENCE.md'],['@awesome.me/webawesome','3.14.0','LICENSE.md']]){
  const entry=lock.packages['node_modules/'+name];assert.equal(entry.version,version);assert.equal(entry.license,'MIT');
  assert.ok(entry.resolved.startsWith('https://registry.npmjs.org/'));assert.match(entry.integrity,/^sha512-/);
  if(name!=='dockview-core')assert.equal(manifest.dependencies[name],version);
  const license=await file('../node_modules/'+name+'/'+path);assert.match(license,/Permission is hereby granted, free of charge/);assert.match(license,/copyright notice/);
 }
 const build=await file('../build.mjs');assert.match(build,/licen\[cs\]e/);assert.match(build,/vendor\/dockview\/dockview.css/);assert.match(build,/vendor\/webawesome\/styles/);
 const components=await file('../src/workspace-layout-controls.js');assert.match(components,/@awesome.me\/webawesome\/dist\/components\/button\/button.js/);assert.doesNotMatch(components,/https?:\/\/|fetch\(|innerHTML/);
});
