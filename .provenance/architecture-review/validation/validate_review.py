"""Validate this analysis package, never execute HPX or alter the original baseline."""
from pathlib import Path
from collections import Counter
import hashlib, html, json, re, subprocess, sys, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[3]; OUT=ROOT/'docproject/architecture-review'
def read(p):return json.loads((OUT/p).read_text())
checks=[]; failures=[]
def check(name,ok,detail):
    checks.append({'check':name,'passed':bool(ok),'detail':detail})
    if not ok:failures.append(name)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
model=read('traceability/process-model.json'); ps=model['processes']; fs=model['families']; claims=read('evidence/claims.json'); findings=read('findings/register.json'); diagrams=read('diagrams/index.json')
ids={p['id'] for p in ps}|{f['id'] for f in fs}
check('process_ids_unique',len(ids)==len(ps)+len(fs),f'{len(fs)} parents and {len(ps)} leaves')
required={'id','name','parent','status','purpose','actors_and_trigger','preconditions','inputs','outputs','transformations','reads','writes','core_objects','invokes','dependencies','state_changes','transaction','side_effects','errors','recovery','security','invariants','requirements','specifications','evidence','code','tests','verification'}
check('process_fields',all(required<=p.keys() for p in ps),'All requested fields, including explicit empty implementation/test evidence for future mechanisms')
check('tree_and_calls',all(p['parent'] in ids and p['id'].startswith(p['parent']+'.') and all(c in ids for c in p['invokes']) for p in ps),'One responsibility parent per leaf; cross-family calls separately identified')
check('write_responsibility',all(p['writes']=='None' or (p['transaction'] and p['dependencies'] and p['security']) for p in ps),'Structural check only: listed mechanism/authority; future unspecified protocols remain gaps, not passes of implementation')
check('future_status_honest',all(not p['code'] for p in ps if p['status'][0] in 'FD'),'No future/deferred leaf has an implementation claim')
missingcode=[(p['id'],c) for p in ps for c in p['code'].split('; ') if c and not (ROOT/c).is_file()]
check('implementation_paths',not missingcode,{'code_supported_leaves':sum(bool(p['code']) for p in ps),'missing':missingcode})
check('authority_boundary_present',all(p['security'] and p['preconditions'] for p in ps),'Contract presence only; not a proof of authorization enforcement')
check('evidence_classes',set(c['classification'] for c in claims)==set(range(1,8)),'All seven requested semantic classes')
locators=[s for c in claims for s in c['sources']]+[s for f in findings for s in f['sources']]
badsource=[s for s in locators if not (ROOT/s['path']).exists() or not s['matched'] or not (1<=s['line']<=len((ROOT/s['path']).read_text().splitlines()))]
check('exact_source_locators',not badsource,{'locators':len(locators),'unmatched':badsource})
check('finding_schema',all(all(k in f and f[k] for k in ('id','category','severity','confidence','status','scope','processes','sources','problem','consequences','demonstration','alternative_interpretations','possible_remedies','tradeoffs','next_action','owner_approval','priority','likelihood')) and all(p in ids for p in f['processes']) for f in findings),f'{len(findings)} fully attributed findings')
rq=read('traceability/requirements.json'); docs=read('traceability/documents.json')
check('requirements',len(rq)==31 and all(r['leaf_processes'] and all(p in ids for p in r['leaf_processes']) and r['leaf_verification'] and r['gap'] for r in rq),'31 compound seeds, selected leaf/component/verification path and explicit atomic-coverage gap')
check('document_paths',len(docs)==60 and all((ROOT/d['path']).is_file() and d['processes'] for d in docs),'60 materialized contracts; reserved IDs explicitly excluded')
sections=read('evidence/sections.json'); badsections=[]
for s in sections:
    raw=(ROOT/s['path']).read_bytes().splitlines(keepends=True)
    h=hashlib.sha256(b''.join(raw[s['start_line']-1:s['end_line']])).hexdigest()
    text='\n'.join((ROOT/s['path']).read_text().splitlines()[s['start_line']-1:s['end_line']])
    if h!=s['raw_span_sha256'] or hashlib.sha256(text.encode()).hexdigest()!=s['sha256']:badsections.append(s['evidence_id'])
check('source_section_bytes',not badsections,{'sections':len(sections),'mismatches':badsections,'encoding':'Raw span hash plus separately labelled LF-joined locator text hash; original whole-file hashes retained'})
renders=read('validation/diagram-results.json'); byrender={r['id']:r for r in renders['results']}
bad=[]
for d in diagrams:
    r=byrender.get(d['id'],{})
    if not (r.get('parsed') and r.get('rendered') and r.get('svg_xml') and r.get('source_sha256')==sha(OUT/d['path'])):bad.append(d['id'])
    try:
        svg=ET.parse(OUT/d['svg']).getroot()
        if svg.tag!='{http://www.w3.org/2000/svg}svg':bad.append(d['id']+' not SVG')
    except Exception as e:bad.append(d['id']+' '+str(e))
check('all_diagrams_parse_render_xml',not bad,{'count':len(diagrams),'errors':bad,'renderer':renders['renderer']})
dids={d['id'] for d in diagrams}
check('diagram_metadata_and_navigation',all(all(d.get(k) for k in ('id','title','viewpoint','question','level','milestone','processes','sources','assumptions')) and all(p in ids for p in d['processes']) and all(x in dids for x in d['children']) for d in diagrams),'Viewpoints, scope, milestone, evidence, exceptions/legends, valid process and child links')
check('all_leaves_diagrammed',all(any(p['id'] in d['processes'] for d in diagrams) for p in ps),'All leaf responsibilities appear in a family decomposition view')
balance=read('traceability/dfd-balancing.json'); parent=(OUT/'diagrams/data-flow/005.mmd').read_text(); child=(OUT/'diagrams/data-flow/006.mmd').read_text()
check('dfd_named_channel_balance',all(parent.count(c['label'])==1 and child.count(c['label'])==1 for c in balance['channels']),'Eight named external channels identical at levels 0/1; lower diagrams are explicitly scoped zooms, not exhaustive decomposition claims')
mr=read('formal-analysis/model-results.json')
check('bounded_model_and_mutants',mr['valid_model']['violation'] is None and all(x.get('violation') for x in mr['mutants']) and mr['source_sha256']==sha(OUT/'formal-analysis/check_model.py'),{'states':mr['valid_model']['states'],'transitions':mr['valid_model']['edges'],'mutants_detected':len(mr['mutants']),'scope':'Depth 10 abstraction only, not HPX correspondence'})
dep=read('traceability/dependencies.json')
check('dependency_graph',not dep['unresolved_relative_imports'],{'crate_cycles':dep['crate_cycles'],'frontend_cycles':dep['frontend_cycles'],'limits':dep['limits']})
viewer=read('validation/viewer-results.json')
check('offline_viewer',viewer['passed'],viewer['checks'])

# Validate local Markdown links in review only, never blame unrelated baseline links.
broken=[]; linkcount=0
for p in OUT.rglob('*.md'):
    for match in re.finditer(r'(?<!!)\[[^\]\n]+\]\(([^)]+)\)',p.read_text()):
        target=match.group(1).strip().strip('<>')
        if re.match(r'^[a-zA-Z]+:',target) or target.startswith('#'):continue
        target=target.split('#')[0]
        linkcount+=1
        if not (p.parent/target).resolve().exists():broken.append({'file':str(p.relative_to(OUT)),'target':target})
check('local_markdown_links',not broken,{'links':linkcount,'broken':broken})
base=read('evidence/baseline-files.json'); changed=[x['path'] for x in base if not (ROOT/x['path']).is_file() or sha(ROOT/x['path'])!=x['sha256']]
check('original_files_unchanged',not changed,{'baseline_files':len(base),'changed':changed})
status=subprocess.check_output(['git','status','--short'],cwd=ROOT,text=True)
old=(OUT/'evidence/baseline-git-status.txt').read_text()
oldlines=set(old.splitlines());newlines=set(status.splitlines()); added=sorted(newlines-oldlines);removed=sorted(oldlines-newlines)
check('git_state_preserved',not removed and all(x.endswith(' docproject/') or ' docproject/architecture-review/' in x for x in added),{'added_status_lines':added,'removed_status_lines':removed,'commit_or_push':'None performed'})

result={'date':'2026-10-26','scope':'Analysis artifacts only; static/structural checks are not application correctness or standards conformance','checks':checks,'passed':not failures,'failed_checks':failures,'visual_inspection':'Four original contact sheets and detailed conceptual/transaction/security previews inspected; final additional views and corrected notes inspected separately before handoff.'}
(OUT/'validation/results.json').write_text(json.dumps(result,indent=2)+'\n')
def literal(value):
    text=html.escape(str(value)).replace('|',' / ')
    for a,b in [('[','&#91;'),(']','&#93;'),('(','&#40;'),(')','&#41;'),('`','&#96;')]:text=text.replace(a,b)
    return text
rows='| Check | Result | Evidence |\n| --- | --- | --- |\n'+''.join('| '+c['check']+' | '+('PASS' if c['passed'] else 'FAIL')+' | '+literal(c['detail'])+' |\n' for c in checks)
report='''# Validation report

Only review tooling and an isolated headless diagram browser ran. No application build/test, Lean replay, provider connection, personal browser, credential enrollment, manual-runtime refresh, Git commit or push was performed. Historical application tests are cited at their original scope.

## Executed checks

'''+rows+'''
Detailed machine output: [results.json](validation/results.json), [diagram parser/render results](validation/diagram-results.json), [offline viewer checks](validation/viewer-results.json), [model results](formal-analysis/model-results.json), [dependency graph](traceability/dependencies.json). Source hashes compare against the original dirty working tree, not HEAD alone.

The first diagram pass rendered 20/48 successfully: HTML labels needed namespace-aware SVG XML serialization, and Mermaid treated semicolons/extra note colons as syntax delimiters. Those initial failures are retained in [initial results](validation/diagram-results-initial.json), corrected in the source/renderer and revalidated. Visual inspection then prompted lighter note backgrounds; three focused identity/graph/source-mapping views were added. Final results validate all current diagram sources and serialized SVGs. The initial section checker also incorrectly compared raw bytes with LF-joined locator-text digests; the ledger now labels both encodings and carries independently checked raw span hashes. Quoted source locators are escaped so source-relative Markdown links are not accidentally interpreted as review-relative links. This records corrections rather than counting an unsuccessful pass as validation.

## Visual inspection and boundaries

Contact sheets show all views; detailed previews verify conceptual identity, separate publication/replacement ordering and plaintext trust boundaries. The final sheet includes publication actor bindings, role-labelled n-ary graph scope and the exact CRLF/emoji byte mapping example. The offline browser was checked for selection, process search, child navigation, zoom and JavaScript errors at desktop width. Standalone SVGs retain detail when contact-sheet text is small; the full-size source remains the reading artifact. Browser sessions were closed in finally blocks and no test server/profile was created.

The structural checker verifies required fields, source locators, hashes, IDs, navigation, named DFD channel balance, implementation file paths, requirement paths and render success. It does not establish that English contracts are complete or that code enforces them. The invariant/failure/threat matrices and evidence-linked findings carry the semantic analysis; future missing mechanisms remain explicit.

The valid abstract model checked 8,131 reachable states and 18,317 transitions through depth 10; three deliberately incorrect variants produced counterexamples. This is not extracted code, an unbounded/liveness proof, a cryptographic analysis or a hardware durability experiment. Static dependency SCC checks cover normal local Cargo edges and recognized frontend static relative imports only.

Baseline material is preserved. Any remaining semantic limitation is reported in [coverage](coverage-report.md), [findings](findings/README.md) and [owner questions](open-questions.md), rather than hidden by a passing artifact checker.
'''
(OUT/'validation-report.md').write_text(report)
print(json.dumps({'checks':len(checks),'passed':not failures,'failures':failures,'links':linkcount,'baseline_changed':changed}))
sys.exit(1 if failures else 0)
