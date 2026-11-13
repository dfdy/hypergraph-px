"""Self-tests for HPX-SCP validation and example records."""
from __future__ import annotations
import importlib.util
import json
import tempfile
import unittest
from copy import deepcopy
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('hpx_semantic_validator', ROOT / 'scripts' / 'validate_semantic_records.py')
validator_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator_module)

class ProtocolTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = validator_module.read_json(validator_module.SCHEMA)
        cls.v = Draft202012Validator(cls.schema, format_checker=FormatChecker())
        cls.examples = [validator_module.read_json(p) for p in sorted(validator_module.EXAMPLES.glob('*.json'))]

    def test_schema_and_examples(self):
        Draft202012Validator.check_schema(self.schema)
        self.assertEqual(len(self.examples), 5)
        for example in self.examples:
            with self.subTest(example=example['id']):
                self.assertEqual(list(self.v.iter_errors(example)), [])
        errors, counts = validator_module.validate()
        self.assertEqual(errors, [])
        self.assertEqual(counts['examples'], 5)

    def test_old_protocol_record_still_valid(self):
        old = [r for r in self.examples if r['protocol_version']=='0.1.0']
        self.assertEqual(len(old), 3)
        for record in old:
            self.assertFalse(list(self.v.iter_errors(record)))

    def test_registered_extension(self):
        proposal = next(r for r in self.examples if r['id']=='HPX-PROP-20261030-impact-example')
        self.assertFalse(list(self.v.iter_errors(proposal)))
        with tempfile.TemporaryDirectory() as d:
            path = Path(d)/(proposal['id']+'.json')
            path.write_text(json.dumps(proposal))
            errors,_ = validator_module.check_set([path], self.v, 'test')
            self.assertEqual(errors, [])

    def test_unknown_extension_rejected(self):
        record = deepcopy(next(r for r in self.examples if r['id']=='HPX-PROP-20261030-impact-example'))
        record['extensions'] = {'x.unknown.key': {}}
        with tempfile.TemporaryDirectory() as d:
            path = Path(d)/(record['id']+'.json')
            path.write_text(json.dumps(record))
            errors,_ = validator_module.check_set([path], self.v, 'test')
            self.assertTrue(any('unregistered extension' in e for e in errors))

    def test_extension_payload_schema_rejected(self):
        record = deepcopy(next(r for r in self.examples if r['id']=='HPX-PROP-20261030-impact-example'))
        record['extensions']['x.hpx.impact']['risk'] = 'critical'
        with tempfile.TemporaryDirectory() as d:
            path = Path(d)/(record['id']+'.json')
            path.write_text(json.dumps(record))
            errors,_ = validator_module.check_set([path], self.v, 'test')
            self.assertTrue(any('x.hpx.impact' in e for e in errors))

    def test_legacy_record_cannot_have_extension(self):
        record = deepcopy(next(r for r in self.examples if r['protocol_version']=='0.1.0'))
        record['extensions']={'x.hpx.impact':{'components':[],'risk':'unknown'}}
        self.assertTrue(list(self.v.iter_errors(record)))

    def test_applied_compatible_change_can_use_delegated_authorisation(self):
        rec = deepcopy(next(r for r in self.examples if r['kind']=='protocol_change'))
        rec['status'] = 'applied'
        rec['content']['authorisation'] = {'basis':'delegated_compatible','ref':'docs/engineering/semantic-protocol/PROTOCOL.md#11-agent-maintained-extension-process'}
        rec['content']['validation'] = {'outcome':'pass','commands':['python3 -m unittest'], 'evidence':['test-output.txt']}
        self.assertFalse(list(self.v.iter_errors(rec)))

    def test_unapproved_breaking_change_cannot_be_applied(self):
        rec = deepcopy(next(r for r in self.examples if r['kind']=='protocol_change'))
        rec['status'] = 'applied'
        rec['content']['change_class'] = 'breaking'
        rec['content']['authorisation'] = {'basis':'delegated_compatible','ref':'protocol-section-10'}
        rec['content']['validation'] = {'outcome':'pass','commands':['python3 -m unittest'], 'evidence':['test-output.txt']}
        self.assertTrue(list(self.v.iter_errors(rec)))

    def test_applied_change_requires_passing_validation(self):
        rec = deepcopy(next(r for r in self.examples if r['kind']=='protocol_change'))
        rec['status'] = 'applied'
        rec['content']['authorisation'] = {'basis':'delegated_compatible','ref':'protocol-section-10'}
        self.assertTrue(list(self.v.iter_errors(rec)))

    def test_owner_authorised_change_requires_matching_reference(self):
        rec = deepcopy(next(r for r in self.examples if r['kind']=='protocol_change'))
        rec['status'] = 'applied'
        rec['content']['change_class'] = 'governance'
        rec['content']['authorisation'] = {'basis':'owner_review','ref':'approval-from-owner'}
        rec['content']['validation'] = {'outcome':'pass','commands':['python3 -m unittest'], 'evidence':['test-output.txt']}
        rec['source_refs'] = [{'role':'approval','ref':'different-owner-approval'}]
        self.assertFalse(list(self.v.iter_errors(rec)))
        with tempfile.TemporaryDirectory() as d:
            path = Path(d)/(rec['id']+'.json')
            path.write_text(json.dumps(rec))
            errors,_ = validator_module.check_set([path], self.v, 'test')
            self.assertTrue(any('owner approval ref' in e for e in errors))

    def test_invalid_accepted_without_approval(self):
        proposed = next(e for e in self.examples if e['kind']=='proposal')
        record = deepcopy(proposed)
        record['status'] = 'accepted'
        self.assertTrue(list(self.v.iter_errors(record)))

    def test_invalid_kind_id_mismatch(self):
        proposed = next(e for e in self.examples if e['kind']=='proposal')
        record = deepcopy(proposed)
        record['id'] = 'HPX-REQ-20261030-closed-composition'
        self.assertTrue(list(self.v.iter_errors(record)))

    def test_approved_spec_requires_normative_source(self):
        proposed = next(e for e in self.examples if e['kind']=='proposal')
        record = deepcopy(proposed)
        record['authority'] = {'basis': 'approved_specification'}
        self.assertTrue(list(self.v.iter_errors(record)))

    def test_duplicate_json_property(self):
        with self.assertRaises(validator_module.DuplicateKeyError):
            json.loads('{"id":"first","id":"second"}', object_pairs_hook=validator_module.no_duplicate_keys)

    def test_dangling_relation(self):
        proposed = deepcopy(next(e for e in self.examples if e['kind']=='proposal'))
        proposed['relations'] = [{'type':'affects','target':'HPX-REQ-20261030-missing'}]
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/f'{proposed["id"]}.json'
            path.write_text(json.dumps(proposed))
            errors,_ = validator_module.check_set([path],self.v,'test')
            self.assertTrue(any('dangling' in e for e in errors))

    def test_supersedes_cycle(self):
        first = deepcopy(next(e for e in self.examples if e['kind']=='proposal'))
        second = deepcopy(first)
        second['id'] = 'HPX-PROP-20261030-other-composition'
        first['relations'] = [{'type':'supersedes','target':second['id']}]
        second['relations'] = [{'type':'supersedes','target':first['id']}]
        with tempfile.TemporaryDirectory() as d:
            paths=[]
            for rec in [first,second]:
                path=Path(d)/f'{rec["id"]}.json'
                path.write_text(json.dumps(rec))
                paths.append(path)
            errors,_ = validator_module.check_set(paths,self.v,'test')
            self.assertTrue(any('cycle' in e for e in errors))

if __name__=='__main__':
    unittest.main()
