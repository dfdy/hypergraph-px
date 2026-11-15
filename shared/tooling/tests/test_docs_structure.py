"""Hypergraph PX — Documentation structure and restore fixtures

Use temporary projects and mocked Git output to test numbered-folder boundaries, retired links and exact no-overwrite history restoration.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/tests/test_docs_structure.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Python unittest discovery for the structure/archive-boundary and explicit-history tools.

Specification:
- [Current documentation authority checks](../../../docs/08-assurance/source-traceability.md)
- [Commenting review and exact-source checks](../../../docs/09-guides/developers/code-comments.md)

Boundary: Only synthetic fixture paths and bytes are created; no actual archive or owner workspace is opened.
"""
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import check_docs_structure as structure
import restore_documentation_history as restore


class StructureTests(unittest.TestCase):
    """Check numbered documentation boundaries and active-link/archive exclusions through isolated repository layouts."""

    def setUp(self):
        """Create an isolated documentation root and minimal historical fixture index for each mutation test."""

        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root/'docs').mkdir()
        self.index = dict(version=1,files=[],new_active_files=[restore.INDEX],local_manifest='.provenance/docs-reorganisation/manifest.json')
        self.save()

    def save(self):
        """Publish the current synthetic fixture index under the same relative location the restore tool expects."""

        p=self.root/restore.INDEX
        p.parent.mkdir(parents=True,exist_ok=True)
        p.write_text(json.dumps(self.index))

    def check(self):
        """Run structure validation with a deterministic empty Git ignored-file result."""

        with patch.object(structure.subprocess,'run',return_value=SimpleNamespace(stdout=b'')):
            return structure.validate(self.root)

    def test_current_minimal_structure(self):
        """Accept an isolated current docs root without requiring historical archives."""

        self.assertEqual([],self.check())

    def test_legacy_root_rejected(self):
        """Reject a recreated unnumbered architecture root rather than allowing stale active locations."""

        (self.root/'docs/architecture').mkdir()
        self.assertTrue(self.check())

    def test_ignored_files_rejected(self):
        """Reject ignored payloads inside docs even when the surrounding root shape is valid."""

        with patch.object(structure.subprocess,'run',return_value=SimpleNamespace(stdout=b'docs/.DS_Store\0')):
            self.assertTrue(any('Ignored' in e for e in structure.validate(self.root)))

    def test_retired_project_document_rejected(self):
        """Reject an old completion report physically retained in active docs."""

        p=self.root/'docs/09-guides/reference/specification-migration-status.md'
        p.parent.mkdir(parents=True)
        p.write_text('retired project report')
        self.assertTrue(any('Retired project document' in e for e in self.check()))

    def test_current_link_to_retired_document_rejected(self):
        """Reject a local active navigation link to a retired completion document."""

        p=self.root/'docs/README.md'
        p.write_text('[old](09-guides/reference/specification-completion.md)')
        self.assertTrue(any('Retired/archive link' in e for e in self.check()))

    def test_external_link_to_archived_file_rejected(self):
        """Reject a hosted historical URL that would make a retired document an active dependency."""

        p=self.root/'docs/README.md'
        p.write_text('[old](https://example.org/repo/blob/abc/docs/09-guides/reference/specification-completion.md)')
        self.assertTrue(any('Retired/archive link' in e for e in self.check()))

    def test_current_link_into_local_archive_rejected(self):
        """Reject active Markdown navigation into local-only provenance."""

        p=self.root/'docs/README.md'
        p.write_text('[old](../.provenance/old.md)')
        self.assertTrue(any('Retired/archive link' in e for e in self.check()))

    def test_archive_is_optional_for_public_checks(self):
        """Keep ordinary public structure validation independent of unavailable local history."""

        self.index['files']=[dict(original_path='docs/history.md',current_path='.provenance/docs-reorganisation/historical-docs/docs/history.md')]
        self.save()
        self.assertEqual([],self.check())

    def test_public_history_restore_does_not_overwrite(self):
        """Restore exact verified missing bytes once, then refuse to replace owner-modified historical content."""

        original='docs/engineering/semantic-protocol/PROTOCOL.md'
        current='.provenance/docs-reorganisation/historical-docs/'+original
        data=b'historical UTF8 bytes\r\n'
        self.index['files']=[dict(original_path=original,current_path=current,historical_git_ref='a'*40+':'+original,sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))]
        self.save()

        with patch.object(restore.subprocess,'check_output',return_value=data):
            self.assertEqual(restore.restore(self.root,'legacy-semantic-protocol')['created'],1)
            self.assertEqual(restore.restore(self.root,'legacy-semantic-protocol')['created'],0)
            (self.root/current).write_bytes(b'owner changed history')

            with self.assertRaisesRegex(ValueError,'overwrite'):
                restore.restore(self.root,'legacy-semantic-protocol')

    def test_public_history_restore_rejects_hash_mismatch(self):
        """Reject changed Git payload bytes before any restoration destination is created."""

        original='docs/engineering/semantic-protocol/PROTOCOL.md'
        current='.provenance/docs-reorganisation/historical-docs/'+original
        self.index['files']=[dict(original_path=original,current_path=current,historical_git_ref='a'*40+':'+original,sha256='0'*64,bytes=1)]
        self.save()

        with patch.object(restore.subprocess,'check_output',return_value=b'x'):
            with self.assertRaisesRegex(ValueError,'differ'):
                restore.restore(self.root,'legacy-semantic-protocol')
        self.assertFalse((self.root/current).exists())


if __name__=='__main__':
    unittest.main()
