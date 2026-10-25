import {test} from 'node:test';
import assert from 'node:assert/strict';
import {headingTree,headingAt} from '../src/outline-tree.js';
import {documentHeadings} from '../src/context-actions.js';
test('heading hierarchy handles skipped levels, siblings and fenced examples without losing order',()=>{
 const source='# Root\n\n### Deep\n\n###### Leaf\n\n## Peer\n\n```\n# Fake\n```\n\n# Next\n';
 const headings=documentHeadings(source),tree=headingTree(headings);
 assert.deepEqual(tree.map(h=>h.label),['Root','Next']);assert.deepEqual(tree[0].children.map(h=>h.label),['Deep','Peer']);assert.equal(tree[0].children[0].children[0].label,'Leaf');
 assert.equal(headingAt(headings,source.indexOf('Leaf')).label,'Leaf');assert.equal(headingAt(headings,source.indexOf('Next')).label,'Next');assert.equal(headingAt(headings,-1),null);
});
