"""Fail-closed contract routing tests against an isolated copy of the current registry."""
import copy
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import contract_bindings as c


class ContractBindingsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.tmp.name)
        cls.data = json.loads((c.ROOT / c.REGISTER).read_text())
        paths = c.required_documents(c.ROOT) | {c.REGISTER, 'docs/02-governance/registers/document-inventory.csv', 'docs/02-governance/registers/specification-ownership.csv'}
        paths.update(str(p.relative_to(c.ROOT)) for p in (c.ROOT / 'docs').rglob('*.c4'))
        for path in paths:
            target = cls.root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(c.ROOT / path, target)
        cls.elements, cls.views = c.model(cls.root)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def changed(self, field, value, expected):
        data = copy.deepcopy(self.data)
        binding = next(b for d in data['documents'] for b in d['sections'] if b['disposition'] == 'bound')
        binding[field] = value
        self.assertTrue(any(expected in e for e in c.validate(self.root, data)))

    def test_current_register(self):
        self.assertEqual([], c.validate(self.root, self.data))

    def test_missing_owner(self):
        self.changed('owner', 'nonexistent', 'Missing element')

    def test_missing_view(self):
        self.changed('view', 'nonexistent', 'Missing view')

    def test_missing_scope(self):
        self.changed('scope', 'HPX-CAN-999', 'Missing scope')

    def test_wrong_scope(self):
        self.changed('scope', 'HPX-CAN-015', 'Owner outside scope')

    def test_wrong_view_scope(self):
        self.changed('view', 'c3_crypto', 'View outside scope')

    def test_missing_anchor(self):
        self.changed('anchor', 'nonexistent', 'Missing or ambiguous anchor')

    def test_missing_section(self):
        data = copy.deepcopy(self.data)
        data['documents'][0]['sections'].pop()
        self.assertTrue(any('Section coverage differs' in e for e in c.validate(self.root, data)))

    def test_missing_document(self):
        data = copy.deepcopy(self.data)
        data['documents'].pop()
        self.assertTrue(any('Contract document coverage differs' in e for e in c.validate(self.root, data)))

    def test_conflicting_owner(self):
        data = copy.deepcopy(self.data)
        binding = next(b for b in data['documents'][0]['sections'] if b['disposition'] == 'bound')
        other = copy.deepcopy(binding)
        other.update(id='HPX-BIND-CONFLICT', owner='hpx.native')
        data['documents'][0]['sections'].append(other)
        self.assertTrue(any('Conflicting section owner' in e for e in c.validate(self.root, data)))

    def test_missing_direct_link(self):
        elements = copy.deepcopy(self.elements)
        for e in elements.values(): e['links'] = []
        with patch.object(c, 'model', return_value=(elements, self.views)):
            self.assertTrue(any('Missing direct owner link' in e for e in c.validate(self.root, self.data)))

    def test_missing_backlink(self):
        data = copy.deepcopy(self.data)
        data['documents'][0]['sections'][0]['id'] = 'HPX-BIND-MISSING'
        self.assertTrue(any('Missing exact backlink' in e for e in c.validate(self.root, data)))

    def test_missing_consumer(self):
        self.changed('consumers', ['nonexistent'], 'Missing consumer')

    def test_missing_consumer_link(self):
        self.changed('consumers', ['hpx.native.crypto'], 'Missing consumer link')

    def test_prose_requires_reason(self):
        self.changed('disposition', 'prose-only', 'Invalid prose-only disposition')

    def test_ambiguous_anchor(self):
        d = self.data['documents'][0]
        path = self.root / d['path']
        original = path.read_bytes()
        try:
            path.write_bytes(original + ('\n## '+d['sections'][0]['heading']+'\n').encode())
            self.assertTrue(any('Missing or ambiguous anchor' in e for e in c.validate(self.root, self.data)))
        finally:
            path.write_bytes(original)

    def test_fences_and_nested_sections(self):
        self.assertEqual([('Owner', 'owner')], c.sections('## Owner\n### Child\n```md\n## Example\n```\n'))

    def test_view_or_child_links_cannot_satisfy_owner(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            p = root / 'docs/04-architecture/model.c4'; p.parent.mkdir(parents=True)
            p.write_text('model {\n parent = component "P" {\n description \"\"\"\n link ../contract.md#fake\n \"\"\"\n child = component "C" {\n link ../contract.md#child\n }\n }\n}\nviews { view example {\n link ../contract.md#view\n } }\n')
            elements, views = c.model(root)
            self.assertEqual([], elements['parent']['links'])
            self.assertEqual(['docs/contract.md#child'], elements['parent.child']['links'])
            self.assertEqual({'example'}, views)


if __name__ == '__main__':
    unittest.main()
