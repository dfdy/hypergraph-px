"""Hypergraph PX — Legacy literal-YAML exchange fixtures

Exercise two scoped peers through hello/ready, literal stdin/stdout task messages, bundle staging and correlation/replay refusals.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/tests/test_scp_wire.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Explicit historical exchange-adapter unittest discovery.

Specification:
- [Current installation and legacy-protocol boundary](../../../docs/09-guides/developers/vernaculum/UPGRADE_2.0.0.md)
- [Commenting and review procedure](../../../docs/09-guides/developers/code-comments.md)

Boundary: This suite uses temporary peer state but depends on explicit historical protocol material if executed. It does not test transport authentication or current Vernaculum agreement.
"""
from __future__ import annotations
import hashlib
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

import yaml

ROOT=Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'shared/tooling'))
import scp_wire as w
from bootstrap_semantic_protocol import BootstrapError, PROTOCOL, verify_path


class WireTests(unittest.TestCase):
    """Check strict typed legacy wire messages, exact agreement and refusal of unsupported or ambiguous communication state."""

    @classmethod
    def setUpClass(cls):
        """Verify the selected legacy protocol and discovery identity once for exchange scenarios."""

        cls.protocol=verify_path()
        cls.digest=w.fingerprint(PROTOCOL)

    def setUp(self):
        """Create independent temporary local peer-state roots and message paths for each test."""

        self.temp=tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base=Path(self.temp.name)
        self.state_a=self.base/'a'
        self.state_b=self.base/'b'

    def run_wire(self,action,*args,state=None,ok=True,stdin=None):
        """Invoke one legacy CLI action and require expected clean success or refusal output."""

        cmd=[sys.executable,str(ROOT/'shared/tooling'/'scp_wire.py'),action,'--state-dir',str(state or self.state_a)]+list(args)
        process=subprocess.run(cmd,text=True,capture_output=True,input=stdin)
        if ok:
            self.assertEqual(process.returncode,0,process.stderr)
        else:
            self.assertNotEqual(process.returncode,0)
            self.assertEqual(process.stdout,'')
        return process

    def connect(self):
        """Establish a fixture hello/ready pair with both sides independently recording the same conversation."""

        hello=self.base/'hello.yaml'
        ready=self.base/'ready.yaml'
        self.run_wire('hello','--sender','architect','--recipient','implementer','--conversation','thread-1','--output',str(hello))
        self.run_wire('answer-hello','--local','implementer','--input',str(hello),'--output',str(ready),state=self.state_b)
        self.run_wire('accept-ready','--local','architect','--input',str(ready))
        return hello, ready

    def test_verified_handshake_and_two_way_messages(self):
        """Exchange a request and correlated response as literal YAML while retaining original message identities."""

        hello,ready=self.connect()
        self.assertEqual(yaml.safe_load(ready.read_text())['kind'],'ready')
        body=self.base/'request-body.yaml'
        body.write_text('action: implement\ntarget: ClosedComposition\nconstraints: [preserve_provenance]\n')
        request=self.base/'request.yaml'
        self.run_wire('send','--sender','architect','--recipient','implementer','--conversation','thread-1',
                      '--kind','request','--body-file',str(body),'--output',str(request))
        recv=self.run_wire('receive','--local','implementer','--input',str(request),state=self.state_b)
        received=yaml.safe_load(recv.stdout)
        self.assertEqual(received['kind'],'request')
        self.assertEqual(received['body']['target'],'ClosedComposition')
        self.assertNotIn(str(request),recv.stdout)
        request_id=yaml.safe_load(request.read_text())['id']
        result_body=self.base/'result.yaml'
        result_body.write_text('status: completed\nverified: [unit-test-1]\n')
        result=self.base/'response.yaml'
        self.run_wire('send','--sender','implementer','--recipient','architect','--conversation','thread-1',
                      '--kind','response','--body-file',str(result_body),'--reply-to',request_id,
                      '--output',str(result),state=self.state_b)
        self.run_wire('receive','--local','architect','--input',str(result))
        sent=yaml.safe_load(result.read_text())
        self.assertEqual(sent['body']['status'],'completed')
        self.assertEqual(sent['reply_to'],request_id)
        self.assertNotIn('sha256',request.read_text())
        self.assertNotIn(self.digest,request.read_text())

    def test_inline_yaml_transport_without_files(self):
        # These are literal YAML strings delivered in a hypothetical agent channel.
        # No ordinary task message file is necessary.
        """Require stdin/stdout negotiation and task exchange to carry actual YAML without ordinary message files."""

        hello=self.run_wire('hello','--sender','architect','--recipient','implementer',
                            '--conversation','inline-thread')
        self.assertEqual(yaml.safe_load(hello.stdout)['kind'],'hello')
        ready=self.run_wire('answer-hello','--local','implementer',state=self.state_b,
                            stdin=hello.stdout)
        self.assertEqual(yaml.safe_load(ready.stdout)['kind'],'ready')
        self.run_wire('accept-ready','--local','architect',stdin=ready.stdout)
        request=self.run_wire('send','--sender','architect','--recipient','implementer',
                              '--conversation','inline-thread','--kind','request',
                              stdin='action: implement\ntarget: ClosedComposition\n')
        decoded=yaml.safe_load(request.stdout)
        self.assertEqual(decoded['body']['action'],'implement')
        self.assertEqual(decoded['body']['target'],'ClosedComposition')
        self.assertNotIn('WRITTEN:',request.stdout)
        self.assertNotIn('request.yaml',request.stdout)
        received=self.run_wire('receive','--local','implementer',state=self.state_b,
                               stdin=request.stdout)
        self.assertEqual(yaml.safe_load(received.stdout),decoded)
        response=self.run_wire('send','--sender','implementer','--recipient','architect',
                               '--conversation','inline-thread','--kind','response',
                               '--reply-to',decoded['id'],state=self.state_b,
                               stdin='status: completed\nsummary: Implemented requested change\n')
        echoed=self.run_wire('receive','--local','architect',stdin=response.stdout)
        self.assertEqual(yaml.safe_load(echoed.stdout)['body']['status'],'completed')

    def test_link_to_yaml_prompt_is_not_a_request(self):
        """Reject a file pointer that lacks the actual action/target task body."""

        self.connect()
        # A pointer cannot replace the required task instruction.
        rejected=self.run_wire('send','--sender','architect','--recipient','implementer',
                               '--conversation','thread-1','--kind','request',
                               stdin='message_file: ./another-prompt.yaml\n',ok=False)
        self.assertIn('missing required message body: action',rejected.stderr)
        self.assertEqual(rejected.stdout,'')

    def test_validation_failure_stays_out_of_inline_output(self):
        """Keep malformed duplicate-key content out of valid-looking YAML stdout."""

        self.connect()
        rejected=self.run_wire('send','--sender','architect','--recipient','implementer',
                               '--conversation','thread-1','--kind','request',
                               stdin='action: implement\naction: delete\ntarget: anything\n',ok=False)
        self.assertEqual(rejected.stdout,'')
        self.assertIn('duplicate YAML key',rejected.stderr)

    def test_cannot_send_before_ready(self):
        """Refuse ordinary task transmission without an established matching ready session."""

        body=self.base/'b.yaml'
        body.write_text('action: implement\ntarget: X\n')
        self.run_wire('send','--sender','architect','--recipient','implementer','--conversation','thread-1',
                      '--kind','request','--body-file',str(body),'--output',str(self.base/'out.yaml'),ok=False)

    def test_no_implicit_trust_for_wrong_fingerprint(self):
        """Reply need rather than ready when the offered exact protocol identity differs."""

        hello=self.base/'hello.yaml'
        need=self.base/'need.yaml'
        self.run_wire('hello','--sender','architect','--recipient','implementer','--conversation','thread-1','--output',str(hello))
        content=yaml.safe_load(hello.read_text())
        content['body']['fingerprint']='0'*64
        hello.write_text(yaml.safe_dump(content,sort_keys=False))
        self.run_wire('answer-hello','--local','implementer','--input',str(hello),'--output',str(need),state=self.state_b)
        self.assertEqual(yaml.safe_load(need.read_text())['kind'],'need')
        reply=self.run_wire('accept-ready','--local','architect','--input',str(need))
        self.assertIn('PEER NEEDS PROTOCOL',reply.stdout)
        self.assertNotEqual(w.state_read(self.state_a,'thread-1','architect','implementer')['status'],'ready')

    def test_need_then_bundle_and_staging(self):
        """Stage a complete verified bundle without silently activating it as local authority."""

        bundle=self.base/'protocol.zip'
        self.run_wire('bundle','--output',str(bundle))
        staged=self.base/'staged'
        self.run_wire('inspect-bundle','--input',str(bundle),'--stage-dir',str(staged),'--expected-fingerprint',self.digest)
        self.assertEqual((staged/'PROTOCOL.md').read_bytes(),PROTOCOL.read_bytes())

        with self.assertRaises(BootstrapError):
            w.validate_message(b'scp: HPX-SCP\nscp: duplicate\n',self.protocol)

    def test_bundle_corruption_rejected(self):
        """Reject changed bundled protocol bytes before creating a staged canonical target."""

        damaged=self.base/'damaged.zip'
        contents=PROTOCOL.read_bytes().replace(b'Inter-agent prompting is the primary function',b'Inter-agent prompting is not the primary function',1)

        with zipfile.ZipFile(damaged,'w') as z:
            z.writestr('PROTOCOL.md',contents)
        self.run_wire('inspect-bundle','--input',str(damaged),'--stage-dir',str(self.base/'stage'),ok=False)
        self.assertFalse((self.base/'stage'/'PROTOCOL.md').exists())

    def test_reject_unknown_kind(self):
        """Reject message kinds outside the verified legacy vocabulary."""

        msg=w.new_message('arbitrary','architect','implementer','thread',self.protocol['protocol_version'],{'any':'thing'})

        with self.assertRaisesRegex(BootstrapError,'unknown message kind'):
            w.validate_message(msg,self.protocol)

    def test_reject_duplicate_keys_and_aliases(self):
        """Keep duplicate keys, anchors and aliases outside the accepted wire grammar."""

        for bad in (b'scp: HPX-SCP\nscp: HPX-SCP\n',b'body: &x hello\nbody: *x\n'):
            with self.subTest(bad=bad),self.assertRaises(BootstrapError):
                w.validate_message(bad,self.protocol)

    def test_require_reply_to(self):
        """Require response correlation to an originating message identity."""

        msg=w.new_message('response','implementer','architect','thread',self.protocol['protocol_version'],{'status':'completed'})

        with self.assertRaisesRegex(BootstrapError,'reply_to'):
            w.validate_message(msg,self.protocol)

    def test_reject_response_without_existing_request(self):
        """Reject correlation to a request ID absent from the scoped session history."""

        self.connect()
        body=self.base/'result.yaml'
        body.write_text('status: completed\n')
        self.run_wire('send','--sender','implementer','--recipient','architect','--conversation','thread-1',
                      '--kind','response','--reply-to','m-does-not-exist','--body-file',str(body),
                      '--output',str(self.base/'out.yaml'),state=self.state_b,ok=False)

    def test_replayed_message_rejected(self):
        """Refuse a second reception of the same message ID within the ready session."""

        self.connect()
        body=self.base/'body.yaml'
        body.write_text('action: review\ntarget: docs\n')
        request=self.base/'request.yaml'
        self.run_wire('send','--sender','architect','--recipient','implementer','--conversation','thread-1',
                      '--kind','request','--body-file',str(body),'--output',str(request))
        self.run_wire('receive','--local','implementer','--input',str(request),state=self.state_b)
        self.run_wire('receive','--local','implementer','--input',str(request),state=self.state_b,ok=False)

    def test_forged_ready_not_bound_to_hello(self):
        """Reject a readiness reply not bound to a currently pending discovery offer."""

        self.connect()
        ready=self.base/'ready.yaml'
        self.run_wire('accept-ready','--local','architect','--input',str(ready),ok=False)

    def test_scoped_machine_packet_contains_requested_message_contract_only(self):
        """Limit message context to the requested kind and omit full canonical fingerprints."""

        result=subprocess.run([sys.executable,str(ROOT/'shared/tooling'/'protocol_context.py'),
             '--for','exchange','--message-kind','request'],capture_output=True,text=True)
        self.assertEqual(result.returncode,0,result.stderr)
        value=yaml.safe_load(result.stdout)['HPX-SCP']
        self.assertIn('message_envelope',value)
        self.assertEqual(set(value['message_kinds']),{'request'})
        self.assertNotIn('natural_sha256',result.stdout)
        self.assertNotIn(self.digest,result.stdout)

    def test_bundle_offer_is_control_not_task(self):
        """Validate explicit bundle-offer control shape without treating it as an ordinary executable request."""

        offer=w.new_message('offer','architect','implementer','thread',self.protocol['protocol_version'],
                {'bundle_ref':'channel://artifact/protocol'},'m-prior-need')
        self.assertEqual(w.validate_message(offer,self.protocol)['kind'],'offer')

        with self.assertRaisesRegex(BootstrapError,'reply_to'):
            w.validate_message(dict(offer,reply_to='bad id with spaces'),self.protocol)

    def test_version_mismatch_rejected(self):
        """Reject an ordinary request using a version different from the verified session contract."""

        msg=w.new_message('request','architect','implementer','thread','0.5.0',{'action':'do','target':'target'})

        with self.assertRaisesRegex(BootstrapError,'incompatible protocol'):
            w.validate_message(msg,self.protocol)

if __name__=='__main__':
    unittest.main()
