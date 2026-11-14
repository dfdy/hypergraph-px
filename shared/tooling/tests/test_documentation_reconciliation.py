"""Isolated documentation fixtures; no private repository data or live processes."""
import contextlib
import copy
import csv
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import documentation_reconciliation as R
import verify_documentation as D


class ReconciliationTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        self.sid = 'HPX-SRC-0001-S001'
        self.source = 'HPX-SRC-0001'
        self.current = '.provenance/oldspecs/original/source.md'
        self.original = 'original/source.md'
        self.target = 'docs/contract.md#reviewed-action'
        self.data = b'# Source\r\nOriginal targets and model/actor attribution.\r\n'
        self.put(self.current, self.data)
        self.put('docs/contract.md', '# Contract\n\n' + '\n'.join('- **' + k + ':** fixture' for k in ['ID','Title','Purpose','Level','Status','Maintainer','Applies to','Upstream authority','Downstream dependencies','Verification','Decision/history','Last reviewed']) + '\n\n## Reviewed action\nFreeze model and actor attribution with targets, scope and expected state.\n\n## Unrelated\nOther content.\n')
        self.put('docs/02-governance/OWNER_DECISIONS.md', '# Owners\n\n## Applicable policy\nHPX-OWNER-027: review is policy-dependent, attribution retained.\n\n## Other policy\nNothing else.\n')
        self.put('.gitignore', '/.provenance/\n')
        # This isolated source fixture has no split-contract or LikeC4 scope.
        self.put('docs/02-governance/registers/contract-bindings.json', json.dumps({'version': 1, 'documents': []}))
        
        section_hash = R.digest('\n'.join(self.data.decode().splitlines()).encode())
        source = {'source_id':self.source,'original_path':self.original,'sha256':R.digest(self.data),'current_path':self.current,'archive_member':''}
        coverage = {'section_id':self.sid,'source_id':self.source,'original_path':self.original,'start_line':'1','end_line':'2','destination_id':'HPX-REQ-001','destination_path':'docs/contract.md','destination_section':'Reviewed action','disposition':'Reviewed source-obligations.json for '+self.sid,'source_section_sha256':section_hash,'current_source_path':self.current,'archive_member':''}
        section = {'section_id':self.sid,'source_id':self.source,'original_path':self.original,'start_line':'1','end_line':'2','section_sha256':section_hash,'current_path':self.current,'archive_member':''}
        claim = {'claim_id':'HPX-CLAIM-00001','source_id':self.source,'start_line':'2','end_line':'2','current_source_path':self.current,'archive_member':''}
        mapping = {'mapping_id':'HPX-MAP-00001','source_id':self.source,'source_section_or_lines':'L1-L2: Source','destination_doc_id':'HPX-REQ-001','current_source_path':self.current,'archive_member':''}
        document = {'id':'HPX-REQ-001','path':'docs/contract.md','materialized':'yes','upstream_ids':''}
        for name, data in [('sources',source),('coverage',coverage),('sections',section),('claims',claim),('maps',mapping),('documents',document)]:
            file,key=R.TABLES[name];self.csv('docs/02-governance/registers/'+file,[data])
        self.csv('docs/02-governance/registers/requirements.csv',[],['requirement_id'])
        self.csv('docs/02-governance/registers/specification-ownership.csv',[],['scope_id'])
        self.csv('docs/02-governance/registers/traceability.csv',[],['from_id','to_id','relation_id'])
        self.csv('.provenance/specification-migration/records/docs/02-governance/registers/template-pack-inventory.csv',[],['current_archive_path','archive_entry','sha256'])
        self.put('.provenance/specification-migration/records/docs/02-governance/registers/documentation-archive.json',json.dumps([{'original_path':self.original,'archive_path':self.current,'sha256':R.digest(self.data),'bytes':len(self.data)}]))
        span={'source_id':self.source,'original_path':self.original,'current_path':self.current,'start_line':1,'end_line':2,'section_sha256':section_hash}
        self.c={'obligation_id':self.sid+'-O01','summary':'Freeze model/actor attribution with reviewed targets,scope and expected state.','disposition':'owner-superseded','component_dispositions':['retained','owner-superseded'],'source_span':span,'source_claim_ids':['HPX-CLAIM-00001'],'source_mapping_ids':['HPX-MAP-00001'],'current_refs':[self.target],'authority':['HPX-OWNER-027'],'basis':'Inherited source;policy-dependent review does not waive attribution.','changed_source_clause_scope':'Unconditional review only;attribution survives.','unresolved_scope':None,'components':[{'disposition':'retained','scope':'Frozen attribution and exact targets,state,scope remain.','basis':'Inherited source.','current_refs':[self.target],'authority':['HPX-OWNER-027']},{'disposition':'owner-superseded','scope':'Unconditional review only;attribution survives.','basis':'Owner policy qualification.','current_refs':[self.target],'authority':['HPX-OWNER-027']}]}
        self.entry={'section_id':self.sid,'source_id':self.source,'source_original_path':self.original,'source_current_path':self.current,'source_start_line':1,'source_end_line':2,'source_section_sha256':section_hash,'source_file_sha256':source['sha256'],'archive_member':'','overlapping_claim_ids':['HPX-CLAIM-00001'],'mapping_ids':['HPX-MAP-00001'],'requirement_refs':[],'canonical_scope_ids':[],'current_refs':[self.target],'canonical_sources':[],'authority_refs':['HPX-OWNER-027'],'current_destination':{'document_id':'HPX-REQ-001','path':'docs/contract.md','section':'Reviewed action'},'postrepair_dispositions':[self.c],'reviewed_obligations':[self.c['summary']]}
        self.record={'verification_schema_version':1,'obligation_disposition_count':1,'entries':[self.entry]}
        self.seal()

    def put(self,path,data):
        p=self.root/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data.encode() if isinstance(data,str) else data)

    def csv(self,path,rows,fields=None):
        out=io.StringIO(newline='');w=csv.DictWriter(out,fieldnames=fields or list(rows[0]));w.writeheader();w.writerows(rows);self.put(path,out.getvalue())

    def save(self):
        self.put(R.REGISTER,json.dumps(self.record))

    def seal(self):
        self.entry['review_binding']={'version':1,'review_ref':'docs/contract.md#reviewed-action','basis':'Explicit isolated reviewed assessment,not semantic proof.','assessment_sha256':R.assessment_digest(self.entry),'bindings':R.expected_bindings(self.root,self.entry,R.tables(self.root))};self.save()

    def check_bad(self):
        self.save();valid,errors=R.validate(self.root);self.assertEqual(valid,set());self.assertTrue(errors)

    def verify(self,local=False,raw=False):
        # Git ignore/index reads are fixture responses, never repository operations.
        with patch.object(D,'ROOT',self.root),patch.object(D.subprocess,'run',return_value=SimpleNamespace(stdout=(self.current+'\0').encode())),patch.object(D.subprocess,'check_output',return_value=''),contextlib.redirect_stdout(io.StringIO()) as output:
            try:D.verify(local,raw);code=0
            except (SystemExit,FileNotFoundError) as e:code=e.code if isinstance(e,SystemExit) else 1
        return code,output.getvalue()

    def test_valid_reviewed_public_without_private_payload(self):
        (self.root/self.current).unlink();self.assertEqual(R.validate(self.root),(set([self.sid]),[]));self.assertEqual(self.verify()[0],0)

    def test_valid_reviewed_full_local(self):
        self.assertEqual(self.verify(True)[0],0)

    def test_raw_audit_exposes_original_difference(self):
        code,out=self.verify(raw=True);self.assertEqual(code,1);self.assertIn('Retained source body differs '+self.sid,out)

    def test_valid_verbatim_unreviewed(self):
        p=self.root/'docs/contract.md';p.write_text(p.read_text()+'\nOriginal targets and model/actor attribution.\n')
        rows=list(R.tables(self.root)['coverage'].values());rows[0]['disposition']='verbatim retained';self.csv('docs/02-governance/registers/claim-coverage.csv',rows);(self.root/R.REGISTER).unlink()
        self.assertEqual(self.verify(True)[0],0)

    def test_unreviewed_difference_stays_strict(self):
        rows=list(R.tables(self.root)['coverage'].values());rows[0]['disposition']='verbatim retained';self.csv('docs/02-governance/registers/claim-coverage.csv',rows);(self.root/R.REGISTER).unlink()
        code,out=self.verify(True);self.assertEqual(code,1);self.assertIn('Retained source body differs',out)

    def test_private_bytes_required_only_when_requested(self):
        (self.root/self.current).unlink();self.assertEqual(self.verify()[0],0);self.assertEqual(self.verify(True)[0],1)

    def test_source_corruption(self):
        self.put(self.current,self.data+b'corrupt');code,out=self.verify(True);self.assertEqual(code,1);self.assertIn('Source current bytes differ',out)

    def test_source_span_drift(self):
        rows=list(R.tables(self.root)['coverage'].values());rows[0]['end_line']='1';self.csv('docs/02-governance/registers/claim-coverage.csv',rows);self.check_bad();code,out=self.verify(True);self.assertEqual(code,1);self.assertIn('Coverage source span drift',out)

    def test_duplicate_section(self):
        self.record['entries'].append(copy.deepcopy(self.entry));self.check_bad()

    def test_unknown_section(self):
        self.entry['section_id']='HPX-SRC-9999-S001';self.check_bad()

    def test_missing_section_mapping(self):
        self.record['entries']=[];self.record['obligation_disposition_count']=0;self.check_bad()

    def test_missing_register(self):
        (self.root/R.REGISTER).unlink();self.assertTrue(R.validate(self.root)[1])

    def test_missing_obligations(self):
        self.entry['postrepair_dispositions']=[];self.record['obligation_disposition_count']=0;self.check_bad()

    def test_deleted_obligation_even_with_summary_count_adjusted(self):
        self.entry['postrepair_dispositions']=[];self.entry['reviewed_obligations']=[];self.record['obligation_disposition_count']=0;self.check_bad()

    def test_changed_target_fails(self):
        self.put('docs/contract.md','# Contract\n## Reviewed action\nDifferent obligation.\n');self.assertTrue(R.validate(self.root)[1])

    def test_deleted_model_attribution_fails_even_when_anchor_remains(self):
        p=self.root/'docs/contract.md';p.write_text(p.read_text().replace('Freeze model and actor attribution with targets, scope and expected state.','Targets only.'));self.assertTrue(R.validate(self.root)[1])
        # A heading-looking code example must not truncate the fingerprint before
        # the retained attribution clause. Re-sealing is fixture setup only.
        self.put('docs/contract.md','# Contract\n## Reviewed action\n```markdown\n## Example, not a section boundary\n```\nFreeze model and actor attribution.\n## Unrelated\nOther.\n');self.seal()
        p.write_text(p.read_text().replace('Freeze model and actor attribution.','Targets only.'));self.assertTrue(R.validate(self.root)[1])

    def test_missing_target(self):
        (self.root/'docs/contract.md').unlink();self.assertTrue(R.validate(self.root)[1])

    def test_missing_anchor(self):
        p=self.root/'docs/contract.md';p.write_text(p.read_text().replace('## Reviewed action','## Renamed action'));self.assertTrue(R.validate(self.root)[1])

    def test_duplicate_anchor(self):
        p=self.root/'docs/contract.md';p.write_text(p.read_text()+'\n## Reviewed action\nDuplicate.\n');self.assertTrue(R.validate(self.root)[1])

    def test_unrelated_target_section_does_not_stale_pin(self):
        p=self.root/'docs/contract.md';p.write_text(p.read_text().replace('Other content.','Other changed content.'));self.assertFalse(R.validate(self.root)[1])

    def test_changed_authority(self):
        p=self.root/'docs/02-governance/OWNER_DECISIONS.md';p.write_text(p.read_text().replace('policy-dependent','mandatory'));self.assertTrue(R.validate(self.root)[1])

    def test_unknown_authority_even_if_resealed(self):
        self.c['authority']=['HPX-OWNER-999'];self.c['components'][1]['authority']=['HPX-OWNER-999']
        with self.assertRaises(ValueError):self.seal()

    def test_invalid_disposition(self):
        self.c['components'][0]['disposition']='waived';self.check_bad()

    def test_empty_supersession_scope(self):
        self.c['changed_source_clause_scope']=' ';self.c['components'][1]['scope']=' ';self.entry['review_binding']['assessment_sha256']=R.assessment_digest(self.entry);self.check_bad()

    def test_blanket_supersession_without_retained_component(self):
        self.c['component_dispositions']=['owner-superseded'];self.c['components']=self.c['components'][1:];self.entry['review_binding']['assessment_sha256']=R.assessment_digest(self.entry);self.check_bad()

    def test_missing_retained_component_even_if_aggregate_superseded(self):
        self.c['components']=self.c['components'][1:];self.check_bad()

    def test_missing_owner_authority(self):
        self.c['components'][1]['authority']=[];self.entry['review_binding']['assessment_sha256']=R.assessment_digest(self.entry);self.check_bad()

    def test_missing_component_home(self):
        self.c['components'][0]['current_refs']=[];self.check_bad()

    def test_unresolved_scope_remains_open(self):
        self.c.update(disposition='unresolved',component_dispositions=['unresolved'],unresolved_scope='Universal future Save/Commit relation remains undecided.')
        self.c['components']=[{'disposition':'unresolved','scope':'Future relationship only.','basis':'Owner explicitly leaves choice open.','current_refs':[self.target],'authority':['HPX-OWNER-027'],'open_scope':self.c['unresolved_scope'],'resolution':'open-not-adopted'}];self.seal();self.assertFalse(R.validate(self.root)[1])
        self.c['components'][0]['resolution']='adopted';self.entry['review_binding']['assessment_sha256']=R.assessment_digest(self.entry);self.check_bad()

    def test_malformed_json(self):
        self.put(R.REGISTER,'{not JSON private payload');self.assertTrue(R.validate(self.root)[1]);self.assertNotIn('private payload',str(R.validate(self.root)[1]))

    def test_duplicate_json_keys(self):
        self.put(R.REGISTER,'{"entries":[],"entries":[]}');self.assertTrue(R.validate(self.root)[1])

    def test_unknown_schema(self):
        self.record['verification_schema_version']=2;self.check_bad()

    def test_source_identity_mutation(self):
        self.entry['source_section_sha256']='0'*64;self.check_bad()

    def test_traceability_claim_removed(self):
        self.entry['overlapping_claim_ids']=[];self.check_bad()

    def test_changed_mapping_record(self):
        rows=list(R.tables(self.root)['maps'].values());rows[0]['destination_doc_id']='UNKNOWN';self.csv('docs/02-governance/registers/source-destinations.csv',rows);self.assertTrue(R.validate(self.root)[1])

    def test_path_escape_rejected(self):
        for ref in ['../outside','/tmp/outside','docs/../outside','.local/private.md','.provenance/private.md']:
            with self.subTest(ref=ref),self.assertRaises(ValueError):R.evidence_bytes(self.root,ref)

    def test_verification_never_refreshes_pins(self):
        before=(self.root/R.REGISTER).read_bytes();self.verify(True);self.assertEqual(before,(self.root/R.REGISTER).read_bytes())

    def test_no_allowlist_unknown_arbitrary_section_cannot_be_exempted(self):
        other=copy.deepcopy(self.entry);other['section_id']='HPX-SRC-0001-S002';self.record['entries'].append(other);self.check_bad()


    def test_literal_blanket_scope_rejected_even_with_retained_label(self):
        self.c['changed_source_clause_scope']='all';self.c['components'][1]['scope']='all';self.entry['review_binding']['assessment_sha256']=R.assessment_digest(self.entry);self.check_bad()

    def test_duplicate_component_labels_rejected(self):
        self.c['component_dispositions']=['retained','retained'];self.c['components']=[copy.deepcopy(self.c['components'][0]) for _ in range(2)];self.c['disposition']='retained';self.entry['review_binding']['assessment_sha256']=R.assessment_digest(self.entry);self.check_bad()

    def test_private_zip_member_hash_remains_mandatory(self):
        import zipfile
        path='fixture.zip'
        with zipfile.ZipFile(self.root/path,'w') as z:z.writestr('member.txt',b'corrupt')
        sources=list(R.tables(self.root)['sources'].values());sources.append({'source_id':'HPX-SRC-0002','original_path':'zip/member','sha256':R.digest(b'expected'),'current_path':path,'archive_member':'member.txt'});self.csv('docs/02-governance/registers/source-manifest.csv',sources)
        maps=list(R.tables(self.root)['maps'].values());maps.append({'mapping_id':'HPX-MAP-00002','source_id':'HPX-SRC-0002','source_section_or_lines':'L1-L1: member','destination_doc_id':'HPX-REQ-001','current_source_path':path,'archive_member':'member.txt'});self.csv('docs/02-governance/registers/source-destinations.csv',maps)
        code,out=self.verify(True);self.assertEqual(code,1);self.assertIn('Source current bytes differ HPX-SRC-0002',out)

    def test_template_zip_member_hash_remains_mandatory(self):
        import zipfile
        with zipfile.ZipFile(self.root/'template.zip','w') as z:z.writestr('member.txt',b'corrupt')
        self.csv('.provenance/specification-migration/records/docs/02-governance/registers/template-pack-inventory.csv',[{'current_archive_path':'template.zip','archive_entry':'member.txt','sha256':R.digest(b'expected')}])
        code,out=self.verify(True);self.assertEqual(code,1);self.assertIn('Template member hash differs member.txt',out)

    def test_public_malformed_entry_fails_closed(self):
        self.record['entries']=[None];self.check_bad()

    def test_nonboolean_schema_version_required(self):
        self.record['verification_schema_version']=True;self.check_bad()


    def unreview(self):
        rows=list(R.tables(self.root)['coverage'].values());rows[0]['disposition']='verbatim retained';self.csv('docs/02-governance/registers/claim-coverage.csv',rows);(self.root/R.REGISTER).unlink()
        return rows

    def test_unreviewed_missing_coverage_destination_rejected(self):
        rows=self.unreview();rows[0]['destination_path']='docs/missing.md';self.csv('docs/02-governance/registers/claim-coverage.csv',rows)
        for local in (False,True):
            code,out=self.verify(local);self.assertEqual(code,1);self.assertIn('Coverage destination missing '+self.sid,out)

    def test_unreviewed_mismatched_existing_destination_rejected(self):
        rows=self.unreview();self.put('docs/other.md',self.data);rows[0]['destination_path']='docs/other.md';self.csv('docs/02-governance/registers/claim-coverage.csv',rows)
        for local in (False,True):
            code,out=self.verify(local);self.assertEqual(code,1);self.assertIn('Coverage destination path mismatch '+self.sid,out)

    def test_unreviewed_registered_destination_must_exist(self):
        self.unreview();(self.root/'docs/contract.md').unlink();code,out=self.verify();self.assertEqual(code,1);self.assertIn('Coverage destination missing '+self.sid,out)

    def test_missing_review_locator_or_anchor_rejected(self):
        for ref in ('docs/missing-review.md','docs/contract.md#missing-review',''):
            with self.subTest(ref=ref):
                self.entry['review_binding']['review_ref']=ref;self.check_bad()

    def test_private_url_or_nonstring_review_locator_rejected(self):
        self.put('.local/private-review.md','private fixture')
        for ref in ('.local/private-review.md','.provenance/review.md','https://example.invalid/review',42,['private-payload']):
            with self.subTest(ref=ref):
                self.entry['review_binding']['review_ref']=ref;self.check_bad()

    def test_malformed_authority_types_fail_generically(self):
        original=copy.deepcopy(self.entry)
        for value in (42,['private-payload'],None,{'private-payload':'secret'}):
            for level in ('entry','obligation','component'):
                with self.subTest(value=value,level=level):
                    self.entry=copy.deepcopy(original);self.record['entries']=[self.entry]
                    target=self.entry if level=='entry' else self.entry['postrepair_dispositions'][0] if level=='obligation' else self.entry['postrepair_dispositions'][0]['components'][0]
                    target['authority_refs' if level=='entry' else 'authority']=[value];self.check_bad();self.assertNotIn('private-payload',str(R.validate(self.root)[1]))
            with self.assertRaises(ValueError):R.authority_ref(self.root,value,R.tables(self.root))

    def test_malformed_source_ids_and_reference_lists_fail_generically(self):
        original=copy.deepcopy(self.entry)
        for field,value in [('source_id',42),('source_id',['private-payload']),('section_id',None),('current_refs',[42]),('canonical_sources',[['private-payload']]),('mapping_ids',[None]),('source_start_line','private-payload')]:
            with self.subTest(field=field):
                self.entry=copy.deepcopy(original);self.record['entries']=[self.entry];self.entry[field]=value;self.check_bad();self.assertNotIn('private-payload',str(R.validate(self.root)[1]))

    def test_malformed_nested_objects_fail_generically(self):
        original=copy.deepcopy(self.entry)
        for field,value in [('postrepair_dispositions',[42]),('postrepair_dispositions',None),('review_binding',42)]:
            with self.subTest(field=field,value=value):
                self.entry=copy.deepcopy(original);self.record['entries']=[self.entry];self.entry[field]=value;self.check_bad()
        self.entry=copy.deepcopy(original);self.record['entries']=[self.entry];self.entry['postrepair_dispositions'][0]['components']=[42];self.check_bad()


if __name__=='__main__':
    unittest.main()
