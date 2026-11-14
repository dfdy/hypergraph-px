"""Independent relocation and restore guards; no owner workspace or network."""
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
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name); (self.root/'docs').mkdir()
        self.index = dict(version=1,files=[],new_active_files=[restore.INDEX],local_manifest='.provenance/docs-reorganisation/manifest.json')
        self.save()

    def save(self):
        p=self.root/restore.INDEX;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(self.index))

    def check(self):
        with patch.object(structure.subprocess,'run',return_value=SimpleNamespace(stdout=b'')):
            return structure.validate(self.root)

    def test_current_minimal_structure(self):self.assertEqual([],self.check())

    def test_legacy_root_rejected(self):
        (self.root/'docs/architecture').mkdir();self.assertTrue(self.check())

    def test_ignored_files_rejected(self):
        with patch.object(structure.subprocess,'run',return_value=SimpleNamespace(stdout=b'docs/.DS_Store\0')):
            self.assertTrue(any('Ignored' in e for e in structure.validate(self.root)))

    def test_retired_project_document_rejected(self):
        p=self.root/'docs/09-guides/reference/specification-migration-status.md'
        p.parent.mkdir(parents=True);p.write_text('retired project report')
        self.assertTrue(any('Retired project document' in e for e in self.check()))

    def test_current_link_to_retired_document_rejected(self):
        p=self.root/'docs/README.md';p.write_text('[old](09-guides/reference/specification-completion.md)')
        self.assertTrue(any('Retired/archive link' in e for e in self.check()))

    def test_external_link_to_archived_file_rejected(self):
        p=self.root/'docs/README.md';p.write_text('[old](https://example.org/repo/blob/abc/docs/09-guides/reference/specification-completion.md)')
        self.assertTrue(any('Retired/archive link' in e for e in self.check()))

    def test_current_link_into_local_archive_rejected(self):
        p=self.root/'docs/README.md';p.write_text('[old](../.provenance/old.md)')
        self.assertTrue(any('Retired/archive link' in e for e in self.check()))

    def test_archive_is_optional_for_public_checks(self):
        self.index['files']=[dict(original_path='docs/history.md',current_path='.provenance/docs-reorganisation/historical-docs/docs/history.md')];self.save()
        self.assertEqual([],self.check())

    def test_public_history_restore_does_not_overwrite(self):
        original='docs/engineering/semantic-protocol/PROTOCOL.md';current='.provenance/docs-reorganisation/historical-docs/'+original;data=b'historical UTF8 bytes\r\n'
        self.index['files']=[dict(original_path=original,current_path=current,historical_git_ref='a'*40+':'+original,sha256=hashlib.sha256(data).hexdigest(),bytes=len(data))];self.save()
        with patch.object(restore.subprocess,'check_output',return_value=data):
            self.assertEqual(restore.restore(self.root,'legacy-semantic-protocol')['created'],1)
            self.assertEqual(restore.restore(self.root,'legacy-semantic-protocol')['created'],0)
            (self.root/current).write_bytes(b'owner changed history')
            with self.assertRaisesRegex(ValueError,'overwrite'):restore.restore(self.root,'legacy-semantic-protocol')

    def test_public_history_restore_rejects_hash_mismatch(self):
        original='docs/engineering/semantic-protocol/PROTOCOL.md';current='.provenance/docs-reorganisation/historical-docs/'+original
        self.index['files']=[dict(original_path=original,current_path=current,historical_git_ref='a'*40+':'+original,sha256='0'*64,bytes=1)];self.save()
        with patch.object(restore.subprocess,'check_output',return_value=b'x'):
            with self.assertRaisesRegex(ValueError,'differ'):restore.restore(self.root,'legacy-semantic-protocol')
        self.assertFalse((self.root/current).exists())


if __name__=='__main__':unittest.main()
