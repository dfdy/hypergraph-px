import test from 'node:test';
import assert from 'node:assert/strict';
import {EditorState} from '@codemirror/state';
import {documentPresentation} from '../src/document-presentation.js';
import {inlinePresentation,setMarkdownSource} from '../src/inline-presentation.js';
test('presentation parses nested styles and exact link ranges while preserving literal code and math',()=>{
 const text='**bold *nested*** [a \\[label\\] 😀](#heading) `**literal**` \\(a*b*c\\)';const state=EditorState.create({doc:text,extensions:[inlinePresentation]});const model=documentPresentation(state);
 assert.ok(model.inline.some(item=>item.className==='cm-markdown-bold'));assert.ok(model.inline.some(item=>item.className==='cm-markdown-italic'));assert.equal(model.links.length,1);assert.equal(model.links[0].target,'#heading');
 let projected=text;for(const range of [...model.hidden].sort((a,b)=>b.from-a.from))projected=projected.slice(0,range.from)+projected.slice(range.to);assert.ok(projected.includes('a [label] 😀'));assert.ok(projected.includes('`**literal**`'));assert.ok(projected.includes('\\(a*b*c\\)'));
 const raw=state.update({effects:setMarkdownSource.of(true)}).state;assert.equal(raw.doc.toString(),text);assert.equal(raw.field(inlinePresentation).decorations.size,0);const rendered=raw.update({effects:setMarkdownSource.of(false)}).state;assert.equal(rendered.doc.toString(),text);assert.ok(rendered.field(inlinePresentation).decorations.size>0);
});
