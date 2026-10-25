import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isDescriptiveControlLabel} from '../src/control-labels.js';
test('self-explanatory control labels omit redundant tips while formatting abbreviations and glyphs retain names',()=>{
 for(const label of ['Fork','Agent','↓ Markdown','Follow editor','Use custom','Source document','Copy selection to provenance clipboard'])assert.equal(isDescriptiveControlLabel(label),true,label);
 for(const label of ['', '¶','B','I','H4','H₁','Aa','↔','1 2 3'])assert.equal(isDescriptiveControlLabel(label),false,label);
});
