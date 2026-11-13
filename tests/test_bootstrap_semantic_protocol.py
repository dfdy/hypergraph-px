"""Human canonical, strict YAML, exact two-hash preflight, scoped agent packets."""
from __future__ import annotations
import hashlib
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import yaml
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import bootstrap_semantic_protocol as gate
import rebuild_semantic_appendix as writer
from protocol_context import packet_for, scoped_packet_as_yaml


class BootstrapTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = gate.PROTOCOL.read_bytes()
        cls.natural = gate.natural_prefix(cls.data)
        cls.projection = gate.verify_document(cls.data)
        cls.appendix, cls.machine_bytes, cls.manifest = gate.parse_appendix(cls.data)

    def test_yaml_projection_and_two_hashes(self):
        self.assertEqual(set(self.manifest), {'natural_sha256', 'machine_sha256'})
        self.assertEqual(self.manifest['natural_sha256'], hashlib.sha256(self.natural).hexdigest())
        self.assertEqual(self.manifest['machine_sha256'], hashlib.sha256(self.machine_bytes).hexdigest())
        self.assertEqual(set(self.appendix), {'HPX-SCP'})
        self.assertEqual(self.appendix['HPX-SCP']['format'], 4)
        self.assertEqual(self.projection['protocol_version'], '0.6.1')
        self.assertEqual(len(self.projection['record_types']), 8)
        self.assertIn('implements',self.appendix['HPX-SCP']['relationships'])
        self.assertIn('request', self.appendix['HPX-SCP']['message_types'])
        self.assertIn('negotiation', self.appendix['HPX-SCP']['scopes'])
        self.assertIn('exchange', self.appendix['HPX-SCP']['scopes'])
        self.assertEqual(set(self.appendix['HPX-SCP']['amendment_classes']), {'compatible','breaking','governance'})
        self.assertIn('SCP-CONTEXT-001', self.appendix['HPX-SCP']['scopes']['baseline'])
        self.assertEqual(set(self.appendix['HPX-SCP']), {'version','format','authority','scopes','message_envelope','message_types','record_envelope','record_types','relationships','amendment_classes'})
        self.assertNotIn('source_text', self.machine_bytes.decode())
        self.assertGreater(len(self.natural), 3000)

    def test_rebuild_idempotent(self):
        self.assertEqual(writer.rebuild_bytes(self.data), self.data)

    def test_prose_tampering_blocks(self):
        altered = self.data.replace(b'Inter-agent prompting is the primary function', b'Inter-agent prompting is not the primary function', 1)
        with self.assertRaisesRegex(gate.BootstrapError, 'SHA-256 mismatch'):
            gate.verify_document(altered)

    def test_natural_hash_tampering_blocks(self):
        bad=self.data.replace(self.manifest['natural_sha256'].encode(), b'0'*64, 1)
        with self.assertRaisesRegex(gate.BootstrapError,'natural SHA-256'):
            gate.verify_document(bad)

    def test_machine_hash_tampering_blocks(self):
        bad=self.data.replace(self.manifest['machine_sha256'].encode(), b'0'*64, 1)
        with self.assertRaisesRegex(gate.BootstrapError,'machine SHA-256'):
            gate.verify_document(bad)

    def test_semantic_tampering_blocks(self):
        bad=self.data.replace(b'authority: canonical_natural_language_only', b'authority: agent_supremacy', 1)
        with self.assertRaisesRegex(gate.BootstrapError,'machine SHA-256'):
            gate.verify_document(bad)

    def test_semantic_divergence_with_updated_hash_blocks(self):
        bad=self.data.replace(b'authority: canonical_natural_language_only', b'authority: agent_supremacy', 1)
        _, changed_bytes, _=gate.parse_appendix(bad)
        bad=bad.replace(self.manifest['machine_sha256'].encode(),hashlib.sha256(changed_bytes).hexdigest().encode(),1)
        with self.assertRaisesRegex(gate.BootstrapError,'semantic projection differs'):
            gate.verify_document(bad)

    def test_duplicate_delimiter_blocks(self):
        with self.assertRaisesRegex(gate.BootstrapError,'exactly once'):
            gate.verify_document(self.data.replace(gate.DELIMITER, gate.DELIMITER*2,1))

    def test_missing_delimiter_blocks(self):
        with self.assertRaisesRegex(gate.BootstrapError,'exactly once'):
            gate.verify_document(self.data.replace(gate.DELIMITER,b'',1))

    def test_duplicate_yaml_mapping_key_blocks(self):
        bad=self.data.replace(b'  format: 4\n', b'  format: 4\n  format: 4\n',1)
        with self.assertRaisesRegex(gate.BootstrapError,'duplicate YAML key'):
            gate.verify_document(bad)

    def test_yaml_alias_and_anchor_blocks(self):
        for text in [b'  evil: &evil foo\n', b'  evil: *evil\n']:
            with self.subTest(text=text):
                bad=self.data.replace(b'  format: 4\n', b'  format: 4\n'+text,1)
                with self.assertRaises(gate.BootstrapError):
                    gate.verify_document(bad)

    def test_custom_yaml_tags_block(self):
        bad=self.data.replace(b'  version: 0.6.1\n', b'  version: !python/object/a.b.C 0.5.0\n',1)
        with self.assertRaises(gate.BootstrapError):
            gate.verify_document(bad)

    def test_wrong_appendix_version_blocks(self):
        bad=self.data.replace(b'  format: 4\n',b'  format: 77\n',1)
        with self.assertRaisesRegex(gate.BootstrapError,'machine SHA-256'):
            gate.verify_document(bad)
        _, raw, _ = gate.parse_appendix(bad)
        corrected_hash = bad.replace(self.manifest['machine_sha256'].encode(),
                                     hashlib.sha256(raw).hexdigest().encode(),1)
        with self.assertRaisesRegex(gate.BootstrapError,'unsupported'):
            gate.verify_document(corrected_hash)

    def test_trust_anchor(self):
        self.assertEqual(gate.verify_document(self.data, self.manifest['natural_sha256']), self.projection)
        with self.assertRaisesRegex(gate.BootstrapError,'independent trusted digest mismatch'):
            gate.verify_document(self.data,'0'*64)

    def test_prose_change_needs_explicit_rebuild(self):
        bad=self.data.replace(b'without explanatory duplication', b'without avoidable explanatory duplication',1)
        with self.assertRaises(gate.BootstrapError):
            gate.verify_document(bad)
        repaired=writer.rebuild_bytes(bad)
        self.assertEqual(gate.verify_document(repaired)['protocol_version'],'0.6.1')
        self.assertNotEqual(repaired,self.data)

    def test_untagged_natural_prose_blocks(self):
        with self.assertRaisesRegex(gate.BootstrapError,'untagged canonical prose'):
            gate.semantic_projection(self.natural+b'Agents may secretly change code.\n')

    def test_default_scopes_filtered(self):
        p=packet_for(self.projection,[])
        self.assertEqual(p['scopes'], ['baseline','kernel'])
        ids={r['id'] for r in p['rules']}
        self.assertIn('SCP-CONTEXT-001',ids)
        self.assertIn('SCP-KERNEL-IDENTITY',ids)
        self.assertNotIn('SCP-TASK-IMPLEMENT',ids)
        self.assertNotIn('SCP-NEG-001',ids)
        self.assertNotIn('SCP-CHANGE-005',ids)
        self.assertNotIn('record_contracts',p)

    def test_selected_scope_and_record(self):
        p=packet_for(self.projection,['implement'],['implementation_evidence'])
        self.assertIn('SCP-TASK-IMPLEMENT',{r['id'] for r in p['rules']})
        self.assertEqual([r['kind'] for r in p['record_contracts']], ['implementation_evidence'])
        self.assertIn('records',p['scopes'])

    def test_unknown_context_request_rejected(self):
        for scopes,kinds,rels in [(['bad'],[],[]),([],['bad'],[]),([],[],['bad'])]:
            with self.assertRaises(gate.BootstrapError):
                packet_for(self.projection,scopes,kinds,rels)

    def test_no_output_when_corrupted(self):
        with tempfile.TemporaryDirectory() as d:
            target=Path(d)/'PROTOCOL.md'
            target.write_bytes(self.data.replace(b'Inter-agent prompting is the primary function',b'Broken Protocol',1))
            result=subprocess.run([sys.executable,str(ROOT/'scripts/protocol_context.py'),
                                   '--protocol',str(target),'--for','implement'],capture_output=True,text=True)
            self.assertNotEqual(result.returncode,0)
            self.assertEqual(result.stdout,'')
            self.assertIn('CONTEXT REFUSED',result.stderr)

    def test_default_packet_is_indented_yaml_no_hashes(self):
        result=subprocess.run([sys.executable,str(ROOT/'scripts/protocol_context.py'),'--for','handoff'],capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        packet=yaml.safe_load(result.stdout)['HPX-SCP']
        self.assertTrue(packet['verified'])
        self.assertIn('SCP-TASK-HANDOFF',packet['scopes']['handoff'])
        self.assertNotIn('SCP-TASK-IMPLEMENT', result.stdout)
        self.assertNotIn('sha256',result.stdout)
        self.assertLess(len(result.stdout),len(self.natural))

    def test_legacy_json_packet_explicit(self):
        result=subprocess.run([sys.executable,str(ROOT/'scripts/protocol_context.py'),
                               '--for','implement','--format','json'],capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        import json
        packet=json.loads(result.stdout)
        self.assertTrue(packet['verified'])
        self.assertEqual(packet['protocol'],'HPX-SCP')

if __name__=='__main__':
    unittest.main()
