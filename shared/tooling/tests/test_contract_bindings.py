"""Hypergraph PX — Contract ownership routing regression fixtures

Clone current public routing inputs into a temporary root and mutate ownership, headings or links to verify fail-closed coverage.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/tests/test_contract_bindings.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Python unittest discovery for current section bindings and direct model/prose navigation.

Specification:
- [Direct binding convention](../../../docs/04-architecture/SPECIFICATION.md#explicit-contract-bindings)
- [Current documentation authority checks](../../../docs/08-assurance/source-traceability.md)

Boundary: These fixtures inspect source routing only; they neither run LikeC4 layout nor prove semantic equivalence.
"""
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
    """Check current contract binding targets, section ownership and exact obligation coverage against isolated mutation cases."""

    @classmethod
    def setUpClass(cls):
        """Copy only current public contracts, models and routing registers into an isolated shared fixture root."""

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
        """Remove the isolated public fixture tree after every ownership test has finished."""

        cls.tmp.cleanup()

    def changed(self, field, value, expected):
        """Mutate one bound-section field and require the expected diagnostic without editing the real register."""

        data = copy.deepcopy(self.data)
        binding = next(b for d in data['documents'] for b in d['sections'] if b['disposition'] == 'bound')
        binding[field] = value
        self.assertTrue(any(expected in e for e in c.validate(self.root, data)))

    def test_current_register(self):
        """Accept the complete unchanged routing register against its copied public model/prose inputs."""

        self.assertEqual([], c.validate(self.root, self.data))

    def test_missing_owner(self):
        """Reject a section whose owning element does not exist in the model."""

        self.changed('owner', 'nonexistent', 'Missing element')

    def test_missing_view(self):
        """Reject a view identity absent from the model index."""

        self.changed('view', 'nonexistent', 'Missing view')

    def test_missing_scope(self):
        """Reject an unregistered canonical scope rather than silently weakening ownership."""

        self.changed('scope', 'HPX-CAN-999', 'Missing scope')

    def test_wrong_scope(self):
        """Reject an existing scope that does not contain the selected owner."""

        self.changed('scope', 'HPX-CAN-015', 'Owner outside scope')

    def test_wrong_view_scope(self):
        """Reject an existing view outside the selected canonical scope."""

        self.changed('view', 'c3_crypto', 'View outside scope')

    def test_missing_anchor(self):
        """Reject a section fragment that does not resolve uniquely."""

        self.changed('anchor', 'nonexistent', 'Missing or ambiguous anchor')

    def test_missing_section(self):
        """Detect a removed section record even when the rest of its document remains bound."""

        data = copy.deepcopy(self.data)
        data['documents'][0]['sections'].pop()
        self.assertTrue(any('Section coverage differs' in e for e in c.validate(self.root, data)))

    def test_missing_document(self):
        """Detect a removed document record from complete split-contract coverage."""

        data = copy.deepcopy(self.data)
        data['documents'].pop()
        self.assertTrue(any('Contract document coverage differs' in e for e in c.validate(self.root, data)))

    def test_conflicting_owner(self):
        """Reject two binding records that claim different owners for the same section."""

        data = copy.deepcopy(self.data)
        binding = next(b for b in data['documents'][0]['sections'] if b['disposition'] == 'bound')
        other = copy.deepcopy(binding)
        other.update(id='HPX-BIND-CONFLICT', owner='hpx.native')
        data['documents'][0]['sections'].append(other)
        self.assertTrue(any('Conflicting section owner' in e for e in c.validate(self.root, data)))

    def test_missing_direct_link(self):
        """Reject missing owner-element links rather than accepting overview navigation as ownership."""

        elements = copy.deepcopy(self.elements)

        for e in elements.values():
            e['links'] = []

        with patch.object(c, 'model', return_value=(elements, self.views)):
            self.assertTrue(any('Missing direct owner link' in e for e in c.validate(self.root, self.data)))

    def test_missing_backlink(self):
        """Reject a prose table whose stable binding identity no longer matches the register."""

        data = copy.deepcopy(self.data)
        data['documents'][0]['sections'][0]['id'] = 'HPX-BIND-MISSING'
        self.assertTrue(any('Missing exact backlink' in e for e in c.validate(self.root, data)))

    def test_missing_consumer(self):
        """Reject a consumer identity absent from the model."""

        self.changed('consumers', ['nonexistent'], 'Missing consumer')

    def test_missing_consumer_link(self):
        """Require consumers to point directly to the same exact contract section."""

        self.changed('consumers', ['hpx.native.crypto'], 'Missing consumer link')

    def test_prose_requires_reason(self):
        """Reject an owner-bearing binding relabelled prose-only without a valid prose disposition."""

        self.changed('disposition', 'prose-only', 'Invalid prose-only disposition')

    def test_ambiguous_anchor(self):
        """Reject duplicated headings and restore the copied file bytes after the mutation test."""

        d = self.data['documents'][0]
        path = self.root / d['path']
        original = path.read_bytes()

        try:
            path.write_bytes(original + ('\n## '+d['sections'][0]['heading']+'\n').encode())
            self.assertTrue(any('Missing or ambiguous anchor' in e for e in c.validate(self.root, self.data)))
        finally:
            path.write_bytes(original)

    def test_fences_and_nested_sections(self):
        """Ignore fenced H2 examples and let nested H3 sections inherit their parent section owner."""

        self.assertEqual([('Owner', 'owner')], c.sections('## Owner\n### Child\n```md\n## Example\n```\n'))

    def test_view_or_child_links_cannot_satisfy_owner(self):
        """Keep quoted, child and view-level links from being attributed to the enclosing owner element."""

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            p = root / 'docs/04-architecture/model.c4'
            p.parent.mkdir(parents=True)
            p.write_text('model {\n parent = component "P" {\n description \"\"\"\n link ../contract.md#fake\n \"\"\"\n child = component "C" {\n link ../contract.md#child\n }\n }\n}\nviews { view example {\n link ../contract.md#view\n } }\n')
            elements, views = c.model(root)
            self.assertEqual([], elements['parent']['links'])
            self.assertEqual(['docs/contract.md#child'], elements['parent.child']['links'])
            self.assertEqual({'example'}, views)


if __name__ == '__main__':
    unittest.main()
