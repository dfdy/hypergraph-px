import {test} from 'node:test';
import assert from 'node:assert/strict';
import {documentHeadings,markdownHeadingLink} from '../src/context-actions.js';
test('heading links discover exact targets across LF, CRLF, CR and mixed endings without normalization',()=>{
 for(const newline of ['\n','\r\n','\r']){
  const text=['# Target','body','## Repeated 😀','x','## Repeated 😀','```','# Hidden','```','# Final'].join(newline),headings=documentHeadings(text);
  assert.deepEqual(headings.map(h=>h.label),['Target','Repeated 😀','Repeated 😀','Final']);
  assert.deepEqual(headings.map(h=>h.anchor),['target','repeated','repeated-1','final']);
  assert.deepEqual(headings.map(h=>h.from),['# Target','## Repeated 😀','## Repeated 😀','# Final'].map((value,i)=>i===2?text.indexOf(value,text.indexOf(value)+1):text.indexOf(value)));
  assert.equal(headings[0].to,text.indexOf('# Final'));assert.equal(headings.at(-1).to,text.length);
 }
 assert.deepEqual(documentHeadings('# One\r\n## Two\r### Three\n').map(h=>h.label),['One','Two','Three']);
 assert.equal(markdownHeadingLink('artial 😀, [text]!\r\nnext',{anchor:'target'}),'[artial 😀, \\[text\\]!\r\nnext](#target)');
});
