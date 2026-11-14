import {test} from 'node:test';
import assert from 'node:assert/strict';
import {developmentOutput,terminalLink} from '../../shared/tooling/development-launch.mjs';

test('backend launch is translated to frontend with complete split token, without exposing an API launch link',()=>{
 let text='';const output=developmentOutput(3001,value=>text+=value,false);
 output.data(Buffer.from('Runtime ready\nOpen https://127.0.0.1:8001/#launch=abc'));
 assert.equal(text,'Runtime ready\n');
 output.data(Buffer.from('def0123\nLocked\n'));output.end();
 assert.match(text,/Development launch \(private\): https:\/\/127\.0\.0\.1:3001\/#launch=abcdef0123\n/);
 assert.doesNotMatch(text,/:8001/);assert.match(text,/Locked\n$/);assert.doesNotMatch(text,/\u001b/);
});
test('terminal hyperlink target and visible text retain the full private fragment',()=>{
 const url='https://127.0.0.1:3000/#launch=abcdef';
 assert.equal(terminalLink(url,true),`\u001b]8;;${url}\u001b\\${url}\u001b]8;;\u001b\\`);
 assert.equal(terminalLink(url,false),url);
 let text='';const output=developmentOutput(3000,value=>text+=value,true);
 output.data(Buffer.from('https://127.0.0.1:8000/#launch=abcdef\n'));output.end();
 assert.ok(text.includes(terminalLink(url,true)));
});
test('unterminated final line is processed only at EOF and unrelated UTF8 output is preserved',()=>{
 let text='';const output=developmentOutput(3000,value=>text+=value,false);
 const bytes=Buffer.from('Ready ✓\nhttps://127.0.0.1:8000/#launch=123abc');
 for(const byte of bytes)output.data(Buffer.from([byte]));
 assert.equal(text,'Ready ✓\n');output.end();assert.match(text,/:3000\/#launch=123abc\n/);
});
