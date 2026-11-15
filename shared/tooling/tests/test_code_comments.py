"""Hypergraph PX — Comment-review gate regression fixtures

Exercise inventory scope, documentation presence, exact review fingerprints and alternative export syntax using temporary synthetic projects.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/tests/test_code_comments.py) (publication pending)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Python unittest discovery and the commenting CI job; these tests check scanner boundaries, not prose quality.

Specification:
- [Commenting and exact-source review](../../../docs/09-guides/developers/code-comments.md)
- [Change-sensitive development checks](../../../docs/09-guides/reference/development-evidence.md)

Boundary: Fixtures never promote real source to reviewed status and never read archived or application workspace data.
"""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location('comments', Path(__file__).parents[1] / 'check_code_comments.py')
comments = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(comments)


class CommentGateTests(unittest.TestCase):
    """Check fail-closed scope and review evidence with minimal authored sources."""

    def setUp(self):
        """Allocate an empty project; no test reads archives or application data."""

        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)

    def source(self, name='src/example.py', text='"""Explain the module boundary."""\n'):
        """Create one exact fixture source and a corresponding pending entry."""

        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return {'path': name, 'status': 'pending', 'responsibility': 'fixture',
                'batch': 'pilot', 'risk': 'low', 'reason': 'Review outstanding'}

    def reviewed(self, entry):
        """Attach explicit fixture-only review evidence for the current bytes."""

        entry.update(status='reviewed', sha256=comments.digest(self.root / entry['path']),
                     reviewer='fixture', reviewed_on='2026-11-14', review_notes='Fixture, not real review')
        return entry

    def check(self, entries, complete=False):
        """Run only the pure inventory checks, returning evidence for assertions."""

        return comments.validate(self.root, {'version': 1, 'files': entries}, complete)

    def test_uninventoried_source_fails(self):
        """A new untracked source must still appear in the inventory."""

        self.source()
        self.assertEqual(self.check([])['result'], 'fail')

    def test_pending_is_visible_but_not_complete(self):
        """Baseline rollout passes only the incremental gate, never closeout."""

        entry = self.source()
        self.assertFalse(self.check([entry])['complete'])
        self.assertEqual(self.check([entry], complete=True)['result'], 'fail')

    def test_missing_source_and_duplicate_path_fail(self):
        """Removed/duplicate entries cannot inflate apparent reviewed coverage."""

        entry = self.source()
        self.assertEqual(self.check([entry, entry])['result'], 'fail')
        (self.root / entry['path']).unlink()
        self.assertEqual(self.check([entry])['result'], 'fail')

    def test_review_hash_detects_comment_only_changes(self):
        """Even a new comment invalidates the exact reviewed source fingerprint."""

        entry = self.reviewed(self.source())
        self.assertTrue(self.check([entry])['complete'])

        with (self.root / entry['path']).open('a') as stream:
            stream.write('# Changed rationale requires review.\n')
        self.assertEqual(self.check([entry])['result'], 'fail')

    def test_module_and_interface_documentation_are_distinct(self):
        """A module header cannot stand in for a public function contract."""

        entry = self.reviewed(self.source(text='"""Module purpose."""\ndef execute():\n    return 1\n'))
        result = self.check([entry])
        self.assertTrue(any('execute' in error for error in result['errors']))

    def test_html_header_after_doctype_and_missing_header(self):
        """Accept safe HTML doctype/header order while rejecting doctype-only or unexplained markup."""

        header = '<!-- Hypergraph PX browser document shell. -->'
        self.assertTrue(comments.module_documented('<!doctype html>\n' + header + '\n<html></html>', '.html'))
        self.assertTrue(comments.module_documented('<!DOCTYPE HTML>\n\n' + header, '.html'))
        self.assertTrue(comments.module_documented(header + '\n<!doctype html>\n<html></html>', '.html'))

        self.assertFalse(comments.module_documented('<!doctype html>\n<html></html>', '.html'))
        self.assertFalse(comments.module_documented('<!doctype html>', '.html'))

    def test_python_async_and_methods_need_docstrings(self):
        """Inspect class members without mistaking nested closures for an API."""

        missing = comments.python_interfaces('''"""Module."""
class Example:
    """Type contract."""
    async def execute(self):
        return 1
    def _helper(self):
        return 2
''')
        self.assertEqual([entry['name'] for entry in missing], ['Example.execute'])

    def test_missing_module_docstring_fails(self):
        """A well-named function does not explain the module's responsibility."""

        entry = self.reviewed(self.source(text='def execute():\n    """Return a value."""\n    return 1\n'))
        self.assertTrue(any('module explanation' in error for error in self.check([entry])['errors']))

    def test_exclusion_requires_explicit_origin(self):
        """Generated output remains inventoried with a traceable source/generator."""

        entry = self.source('src/generated/example.js', 'export const answer=42;\n')
        entry.update(status='excluded', exclusion='generated', origin='generator.js')
        self.assertTrue(self.check([entry])['complete'])
        del entry['origin']
        self.assertEqual(self.check([entry])['result'], 'fail')

    def test_archives_dependencies_hidden_paths_and_symlinks_are_not_traversed(self):
        """Discovery cannot acquire provenance or a linked external source tree."""

        for name in ['.provenance/private.py', '.local/build.js', 'frontend/node_modules/package/a.js']:
            self.source(name)
        external = self.root / 'external.txt'
        external.write_text('not source')
        (self.root / 'linked.py').symlink_to(external)
        self.assertEqual(comments.discover(self.root), set())

    def test_only_known_intake_directory_is_outside_maintained_scope(self):
        """An application namespace named incoming is not an archive exclusion."""

        self.source('frontend/incoming/reference.js')
        self.source('src/incoming/receiver.js')
        self.assertEqual(comments.discover(self.root), {'src/incoming/receiver.js'})

    def test_license_is_not_module_documentation(self):
        """Check language conventions while ignoring SPDX/shebang boilerplate."""

        for suffix, text in [('.rs', '// SPDX-License-Identifier: AGPL-3.0-only\n'),
                             ('.sh', '#!/bin/sh\n'), ('.js', '// SPDX-License-Identifier: MIT\n')]:
            self.assertFalse(comments.module_documented(text, suffix))

        for suffix, text in [('.rs', '//! Exact owned-source rules.\n'),
                             ('.lean', 'import Init\n/-! Conditional model scope. -/\n'),
                             ('.css', '/* Layout responsibility. */\n'),
                             ('.html', '<!-- Local developer page. -->\n')]:
            self.assertTrue(comments.module_documented(text, suffix))

    def test_malformed_python_reports_failure(self):
        """Syntax errors are not reclassified as missing comments or ignored."""

        entry = self.reviewed(self.source(text='def broken(:\n'))
        self.assertEqual(self.check([entry])['result'], 'fail')

    def test_duplicate_json_keys_fail(self):
        """Inventory parsing must not silently replace a review claim."""

        with self.assertRaises(ValueError):
            json.loads('{"version":1,"version":2}', object_pairs_hook=comments.unique_object)

    def test_open_findings_prevent_closeout(self):
        """Reviewed files alone cannot hide an unresolved misleading explanation."""

        entry = self.reviewed(self.source())
        inventory = {'version': 1, 'files': [entry], 'findings': [
            {'id': 'TEST-001', 'status': 'open', 'description': 'Review mismatch'}]}
        self.assertFalse(comments.validate(self.root, inventory)['complete'])
        self.assertEqual(comments.validate(self.root, inventory, True)['result'], 'fail')

    def test_malformed_inventory_shapes_are_reported(self):
        """Malformed JSON shapes fail the gate instead of producing traceback-only output."""

        for data in [None, {'version': 1, 'files': {}}, {'version': 1, 'files': [None]}]:
            self.assertEqual(comments.validate(self.root, data)['result'], 'fail')
        entry = self.source()
        entry['status'] = []
        self.assertEqual(self.check([entry])['result'], 'fail')

    def test_baseline_prevents_downgrade_or_silent_retirement(self):
        """Completed coverage cannot disappear behind the pending baseline."""

        old = self.reviewed(self.source())
        current = dict(old, status='pending')
        self.assertTrue(comments.compare_baseline({'files': [current]}, {'files': [old]}))
        self.assertTrue(comments.compare_baseline({'files': []}, {'files': [old]}))
        self.assertFalse(comments.compare_baseline({'files': [], 'retired': [
            {'path': old['path'], 'reason': 'Deliberate source removal'}]}, {'files': [old]}))

    def test_revised_hash_needs_new_review_notes(self):
        """A copied hash is insufficient evidence of reassessed explanations."""

        old = self.reviewed(self.source())
        current = dict(old, sha256='0' * 64)
        self.assertTrue(comments.compare_baseline({'files': [current]}, {'files': [old]}))
        current['review_notes'] = 'Re-read changed recovery ordering and failure paths'
        self.assertFalse(comments.compare_baseline({'files': [current]}, {'files': [old]}))

    def test_local_destructuring_and_default_exports_require_documentation(self):
        """Alternative export syntax must not silently escape declaration checks."""

        if not (comments.ROOT / 'frontend/node_modules/typescript/lib/typescript.js').is_file():
            self.skipTest('Locked TypeScript parser not installed')
        command = ['node', str(comments.ROOT / 'shared/tooling/check_code_comments.mjs'), '--root', str(self.root), 'sample.js']

        for text in ['const {a: visible}=unknown;\nexport {visible};\n', 'export default 42;\n']:
            self.source('sample.js', text)
            self.assertNotEqual(subprocess.run(command, capture_output=True).returncode, 0)
            (self.root / 'sample.js').write_text('/** Explain the exposed contract. */\n' + text)
            self.assertEqual(subprocess.run(command, capture_output=True).returncode, 0)

    def test_typescript_parser_checks_exports_without_importing_them(self):
        """JSDoc is attached to declarations, not code-like strings or re-exports."""

        if not (comments.ROOT / 'frontend/node_modules/typescript/lib/typescript.js').is_file():
            self.skipTest('Locked TypeScript parser not installed')
        name = 'sample.js'
        self.source(name, '/** Explain the operation. */\nexport function run(){ throw Error("must not execute"); }\nexport {elsewhere} from "./absent.js";\n')
        command = ['node', str(comments.ROOT / 'shared/tooling/check_code_comments.mjs'), '--root', str(self.root), name]
        self.assertEqual(subprocess.run(command, capture_output=True).returncode, 0)
        (self.root / name).write_text('export const undocumented=1;\n')
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('exported declaration', result.stdout)
        (self.root / name).write_text('function hidden(){}\nexport {hidden as visible};\n')
        self.assertNotEqual(subprocess.run(command, capture_output=True).returncode, 0)
        (self.root / name).write_text('/** Explain the local operation. */\nfunction hidden(){}\nexport {hidden as visible};\n')
        self.assertEqual(subprocess.run(command, capture_output=True).returncode, 0)



if __name__ == '__main__':
    unittest.main()
