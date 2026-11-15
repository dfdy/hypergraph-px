"""Hypergraph PX — Legacy continuity and amendment fixtures

Exercise exact registry/version coherence, explicit compatible synchronization and untrusted checkpoint recovery under verified legacy context.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/tests/test_recovery_and_amendments.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Explicit legacy protocol unittest discovery, not current product execution.

Specification:
- [Current installation and legacy-protocol boundary](../../../docs/09-guides/developers/vernaculum/UPGRADE_2.0.0.md)
- [Commenting and review procedure](../../../docs/09-guides/developers/code-comments.md)

Boundary: These tests depend on historical fixtures if run; no actual archive, checkpoint state or amendment registry is opened by this documentation edit.
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from copy import deepcopy
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'shared/tooling'))
import bootstrap_semantic_protocol as bootstrap
import protocol_amendments as amendments
import protocol_recovery as recovery
from protocol_context import packet_for


class ContinuityAndAmendments(unittest.TestCase):
    """Check scoped legacy context recovery and amendment lifecycle rules against controlled registry mutations."""

    @classmethod
    def setUpClass(cls):
        """Read the verified legacy projection and a retained example solely for explicit regression setup."""

        cls.projection=bootstrap.verify_path()
        cls.example=json.loads((amendments.BASE/'examples'/'HPX-PROTO-20261030-add-impact-extension.json').read_text())

    def staged_root(self,location: Path) -> Path:
        """Create an isolated empty legacy amendment layout with its current fixture protocol version."""

        base=location/'.provenance'/'docs-reorganisation'/'historical-docs'/'docs'/'engineering'/'semantic-protocol'
        (base/'amendments').mkdir(parents=True)
        (base/'records').mkdir(parents=True)
        (base/'amendments'/'registry.json').write_text(json.dumps({
            'registry_version':1,'protocol_version':'0.6.1',
            'amendments':[]},indent=2))
        return base

    def applied_record(self,base: Path,kind='compatible') -> dict:
        """Prepare one synthetic applied change with explicit validation and authority fields for registry mutation tests."""

        record=deepcopy(self.example)
        record['status']='applied'
        record['protocol_version']='0.6.1'
        record['content']['change_class']=kind
        record['content']['authorisation']={'basis':'standing_delegation' if kind=='compatible' else 'owner_review','ref':'owner-approved-reference'}
        record['content']['validation']={'outcome':'pass','commands':['python -m unittest'],'evidence':['tests passed']}
        (base/'records'/(record['id']+'.json')).write_text(json.dumps(record))
        return record

    def test_normal_packet_excludes_hashes(self):
        """Keep ordinary scoped context verified while omitting canonical trust digests."""

        packet=packet_for(self.projection,['implement'])
        self.assertNotIn('canonical_sha256',packet)
        self.assertNotIn(bootstrap.parse_appendix(bootstrap.PROTOCOL.read_bytes())[2]['natural_sha256'],json.dumps(packet))
        self.assertTrue(packet['verified'])

    def test_verifier_suppresses_full_digest_by_default(self):
        """Require a deliberate diagnostic option before printing the full canonical fingerprint."""

        p=subprocess.run([sys.executable,str(ROOT/'shared/tooling/bootstrap_semantic_protocol.py')],capture_output=True,text=True)
        self.assertEqual(p.returncode,0,p.stderr)
        self.assertNotIn(bootstrap.parse_appendix(bootstrap.PROTOCOL.read_bytes())[2]['natural_sha256'],p.stdout)
        verbose=subprocess.run([sys.executable,str(ROOT/'shared/tooling/bootstrap_semantic_protocol.py'),'--show-digest'],capture_output=True,text=True)
        self.assertEqual(verbose.returncode,0,verbose.stderr)
        self.assertIn(bootstrap.parse_appendix(bootstrap.PROTOCOL.read_bytes())[2]['natural_sha256'],verbose.stdout)

    def test_registry_valid(self):
        """Accept the unchanged current legacy registry with its expected empty applied list."""

        reg=amendments.validate_registry(self.projection)
        self.assertEqual(reg['amendments'],[])

    def test_stale_registry_rejected(self):
        """Refuse a registry whose version no longer matches the verified canonical projection."""

        with tempfile.TemporaryDirectory() as d:
            base=self.staged_root(Path(d))
            p=base/'amendments'/'registry.json'
            v=json.loads(p.read_text())
            v['protocol_version']='0.4.0'
            p.write_text(json.dumps(v))

            with self.assertRaisesRegex(bootstrap.BootstrapError,'version mismatch'):
                amendments.validate_registry(self.projection,root=Path(d))

    def test_agent_can_sync_registry_after_compatible_version_bump(self):
        """Allow explicit forward-compatible synchronization while refusing a backwards registry move."""

        with tempfile.TemporaryDirectory() as d:
            base=self.staged_root(Path(d))
            path=base/'amendments'/'registry.json'
            stale=json.loads(path.read_text())
            stale['protocol_version']='0.4.0'
            path.write_text(json.dumps(stale))
            fixed=amendments.sync(self.projection,root=Path(d))
            self.assertEqual(fixed['protocol_version'],'0.6.1')

            with self.assertRaisesRegex(bootstrap.BootstrapError,'cannot sync .* backwards'):
                older=dict(self.projection)
                older['protocol_version']='0.4.0'
                amendments.sync(older,root=Path(d))

    def test_duplicate_entries_rejected(self):
        """Reject repeated registry identities even when both entries point to the same applied record."""

        with tempfile.TemporaryDirectory() as d:
            base=self.staged_root(Path(d))
            rec=self.applied_record(base)
            ent={'id':rec['id'],'record_path':f"records/{rec['id']}.json",'introduced_in':'0.6.1','status':'applied'}
            path=base/'amendments'/'registry.json'
            reg=json.loads(path.read_text())
            reg['amendments']=[ent,ent]
            path.write_text(json.dumps(reg))

            with self.assertRaisesRegex(bootstrap.BootstrapError,'duplicate'):
                amendments.validate_registry(self.projection,root=Path(d))

    def test_applied_record_requires_registration(self):
        """Refuse unindexed applied changes until the exact record is explicitly registered."""

        with tempfile.TemporaryDirectory() as d:
            base=self.staged_root(Path(d))
            rec=self.applied_record(base)

            with self.assertRaisesRegex(bootstrap.BootstrapError,'unindexed'):
                amendments.validate_registry(self.projection,root=Path(d))
            amendments.sync(self.projection,root=Path(d),register=rec['id'])
            self.assertEqual(len(amendments.validate_registry(self.projection,root=Path(d))['amendments']),1)

    def test_governance_change_without_owner_review_refused(self):
        """Keep governance changes outside ordinary compatible-change delegation."""

        with tempfile.TemporaryDirectory() as d:
            base=self.staged_root(Path(d))
            rec=self.applied_record(base,kind='governance')
            rec['content']['authorisation']={'basis':'standing_delegation','ref':'incorrect'}
            (base/'records'/(rec['id']+'.json')).write_text(json.dumps(rec))

            with self.assertRaisesRegex(bootstrap.BootstrapError,'owner approval'):
                amendments.sync(self.projection,root=Path(d),register=rec['id'])

    def test_missing_record_refused(self):
        """Reject registry entries that refer to no applied canonical record."""

        with tempfile.TemporaryDirectory() as d:
            base=self.staged_root(Path(d))
            path=base/'amendments'/'registry.json'
            reg=json.loads(path.read_text())
            reg['amendments']=[{'id':'HPX-PROTO-20261030-missing','record_path':'records/HPX-PROTO-20261030-missing.json','introduced_in':'0.6.1','status':'applied'}]
            path.write_text(json.dumps(reg))

            with self.assertRaisesRegex(bootstrap.BootstrapError,'missing'):
                amendments.validate_registry(self.projection,root=Path(d))

    def test_no_full_hashes_in_discovery(self):
        """Keep ordinary amendment discovery limited to identities and versions."""

        p=subprocess.run([sys.executable,str(ROOT/'shared/tooling/protocol_amendments.py'),'list'],text=True,capture_output=True)
        self.assertEqual(p.returncode,0,p.stderr)
        self.assertNotIn('sha256',p.stdout)
        self.assertEqual(json.loads(p.stdout)['version'],'0.6.1')

    def test_checkpoint_and_recovery(self):
        """Recover exact bounded task state only alongside a verified packet and mandatory workspace reconciliation."""

        checkpoint={
            'objective':'Review snapshot closure','constraints':['No mutation before verification'],
            'decisions':['Proposal pending review'], 'evidence':['Graph tests passed'],
            'blockers':['Pending authority'], 'changed_files':['src/lib.rs'],
            'record_ids':['HPX-PROP-20261030-closed-composition'], 'next_action':'Check current workspace'
        }

        with tempfile.TemporaryDirectory() as d:
            state=Path(d)
            recovery.save_checkpoint('session_1',checkpoint,'0.6.1',state)
            result=recovery.recover('session_1',['implement'],state)
            self.assertTrue(result['requires_workspace_reconciliation'])
            self.assertFalse(result['checkpoint_authoritative'])
            self.assertEqual(result['checkpoint']['state']['objective'],checkpoint['objective'])
            self.assertNotIn('sha256',json.dumps(result))
            self.assertNotIn('canonical_sha256',json.dumps(result))
            self.assertTrue(result['protocol_packet']['verified'])

    def test_checkpoint_malformed_rejected(self):
        """Reject extra credential-shaped fields and unsafe session path identifiers."""

        with tempfile.TemporaryDirectory() as d:
            state=Path(d)

            with self.assertRaisesRegex(bootstrap.BootstrapError,'unexpected'):
                recovery.save_checkpoint('session',{'objective':'x','token':'secret'},'0.6.1',state)

            with self.assertRaisesRegex(bootstrap.BootstrapError,'invalid session'):
                recovery.read_checkpoint('../unsafe',state)

    def test_recovery_without_checkpoint_never_claims_reconciled(self):
        """Keep missing continuity state explicit and require reconciliation even after protocol verification."""

        with tempfile.TemporaryDirectory() as d:
            result=recovery.recover('new-session',['handoff'],Path(d))
            self.assertIsNone(result['checkpoint'])
            self.assertTrue(result['requires_workspace_reconciliation'])

    def test_corrupted_canonical_prevents_recovery(self):
        """Refuse recovery entirely when its canonical protocol bytes fail verification."""

        with tempfile.TemporaryDirectory() as d:
            bad=Path(d)/'PROTOCOL.md'
            bad.write_bytes(bootstrap.PROTOCOL.read_bytes().replace(b'Inter-agent prompting is the primary function',b'Broken Protocol',1))

            with self.assertRaisesRegex(bootstrap.BootstrapError,'SHA-256 mismatch'):
                recovery.recover('session',[],Path(d),protocol=bad)

if __name__=='__main__':
    unittest.main()
