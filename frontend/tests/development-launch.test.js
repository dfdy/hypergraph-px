/**
 * # Hypergraph PX — Development launch developer-boundary scenarios
 *
 * Checks development tooling boundaries using explicit output capture, isolated
 * temporary fixtures and controlled local services where required.
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
 * - [Browser runtime and API contract][spec-2]
 * - [development evidence md][spec-3]
 *
 * Boundary: Certificates and data are isolated test fixtures; no owner trust or
 * manual workspace is enrolled. Embedded fixture strings and executable assertions
 * remain byte-for-byte unchanged.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/tests/development-launch.test.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/interfaces/browser-runtime.md
 * [spec-3]: ../../docs/09-guides/reference/development-evidence.md
 */

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {developmentOutput,terminalLink} from '../../shared/tooling/development-launch.mjs';

test('backend launch is translated to frontend with complete split token, without exposing an API launch link',/* Verify split backend launch fragments become one complete frontend URL without exposing an API launch link. */ ()=>{
 let text='';

 const output=developmentOutput(3001,/* Collect emitted launch lines without terminal hyperlink formatting. */ value=>text+=value,false);


 output.data(Buffer.from('Runtime ready\nOpen https://127.0.0.1:8001/#launch=abc'));
 assert.equal(text,'Runtime ready\n');
 output.data(Buffer.from('def0123\nLocked\n'));output.end();
 assert.match(text,/Development launch \(private\): https:\/\/127\.0\.0\.1:3001\/#launch=abcdef0123\n/);
 assert.doesNotMatch(text,/:8001/);assert.match(text,/Locked\n$/);assert.doesNotMatch(text,/\u001b/);
});

test('terminal hyperlink target and visible text retain the full private fragment',/* Verify clickable terminal target and visible text preserve the complete private fragment. */ ()=>{
 const url='https://127.0.0.1:3000/#launch=abcdef';


 assert.equal(terminalLink(url,true),`\u001b]8;;${url}\u001b\\${url}\u001b]8;;\u001b\\`);
 assert.equal(terminalLink(url,false),url);


 let text='';

 const output=developmentOutput(3000,/* Collect emitted launch output including terminal hyperlink control bytes. */ value=>text+=value,true);


 output.data(Buffer.from('https://127.0.0.1:8000/#launch=abcdef\n'));output.end();
 assert.ok(text.includes(terminalLink(url,true)));
});

test('unterminated final line is processed only at EOF and unrelated UTF8 output is preserved',/* Verify incomplete final lines flush only at EOF and split UTF8 remains intact. */ ()=>{
 let text='';

 const output=developmentOutput(3000,/* Collect output from byte-by-byte input decoding. */ value=>text+=value,false);


 const bytes=Buffer.from('Ready ✓\nhttps://127.0.0.1:8000/#launch=123abc');


 for(const byte of bytes)output.data(Buffer.from([byte]));


 assert.equal(text,'Ready ✓\n');output.end();assert.match(text,/:3000\/#launch=123abc\n/);
});
