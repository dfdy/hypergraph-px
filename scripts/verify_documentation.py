#!/usr/bin/env python3
"""Read-only documentation checks; optional local archive integrity verification."""
from pathlib import Path
import csv,json,hashlib,re,subprocess,zipfile,argparse
from urllib.parse import unquote,urlsplit
ROOT=Path(__file__).resolve().parents[1]
def rows(path):
 with (ROOT/path).open(newline='') as f:return list(csv.DictReader(f))
def sha(data):return hashlib.sha256(data).hexdigest()
def links(p):
 for n,line in enumerate(p.read_text().splitlines(),1):
  for m in re.finditer(r'!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)',line):
   url=m[1].strip('<>');u=urlsplit(url)
   if u.scheme or u.netloc or not u.path:continue
   yield n,url,(p.parent/unquote(u.path)).resolve(),u.fragment

def verify(check_local_sources=False):
 errors=[];checks=[]
 moves=json.loads((ROOT/'docs/registers/documentation-archive.json').read_text())
 moved={r['original_path']:r for r in moves}
 inv=rows('docs/registers/document-inventory.csv');ids={r['id'] for r in inv};active={r['id']:r for r in inv if r['materialized']=='yes'}
 if len(ids)!=len(inv):errors.append('Duplicate document ID')
 required=['ID','Title','Purpose','Level','Status','Maintainer','Applies to','Upstream authority','Downstream dependencies','Verification','Decision/history','Last reviewed']
 for id,row in active.items():
  p=ROOT/row['path']
  if not p.is_file():errors.append('Missing active document '+id);continue
  text=p.read_text()
  for key in required:
   if not re.search(r'^- \*\*'+re.escape(key)+r':\*\*\s+\S',text,re.M):errors.append(f'Missing metadata {id}: {key}')
  if '{{' in text:errors.append('Unfilled template in '+id)
  if len(re.findall(r'^- \*\*ID:\*\*',text,re.M))!=1:errors.append('Ambiguous metadata ID in '+id)
  if any(i not in ids for i in row['upstream_ids'].split(';') if i):errors.append('Unknown upstream ID in '+id)
 checks.append(f'Metadata/status/ID registry checked: {len(active)} materialized contracts; {len(inv)-len(active)} reserved')
 # Original canonical section coverage is exhaustive, evidence remains separately classified.
 oldsections=rows('docs/registers/source-sections.csv');coverage=rows('docs/registers/claim-coverage.csv');cov={r['section_id'] for r in coverage}
 canon={r['section_id'] for r in oldsections if r['original_path'].startswith('Specifications/') and r['original_path']!='Specifications/README.md'}
 if canon-cov:errors.append('Canonical sections missing coverage: '+str(sorted(canon-cov)))
 for c in coverage:
  if check_local_sources:
   old=ROOT/(moved.get(c['original_path'],{}).get('archive_path',c['original_path']));lines=old.read_text().splitlines();a=int(c['start_line']);z=int(c['end_line']);text='\n'.join(lines[a-1:z])
   if sha(text.encode())!=c['source_section_sha256']:errors.append('Coverage source span drift '+c['section_id'])
  if c['destination_id'] not in active:errors.append('Coverage destination not materialized '+c['section_id'])
  destination=ROOT/c['destination_path']
  if check_local_sources and destination.exists():
   original=text.strip()
   if re.match(r'^#{1,6}\s',original):original=original.split('\n',1)[1].strip() if '\n' in original else ''
   def normalize_links(value):return re.sub(r'\]\((<[^>]+>|[^\s)]+)\)',']()',value)
   if original and normalize_links(original) not in normalize_links(destination.read_text()):errors.append('Retained source body differs '+c['section_id'])
 maps=rows('docs/registers/migration-map.csv');sources=rows('docs/registers/source-manifest.csv');sids={r['source_id'] for r in sources}
 if sids!={r['source_id'] for r in maps}:errors.append('Source/map coverage differs')
 if any(r['destination_doc_id'] not in ids for r in maps):errors.append('Unregistered mapping destination')
 if len(sids)!=len(sources):errors.append('Duplicate source ID')
 source_by_id={r['source_id']:r for r in sources}
 for filename,column in [('source-sections.csv','current_path'),('claim-coverage.csv','current_source_path'),('claims.csv','current_source_path'),('migration-map.csv','current_source_path')]:
  for r in rows('docs/registers/'+filename):
   source=source_by_id[r['source_id']]
   if r[column]!=source['current_path'] or r['archive_member']!=source['archive_member']:errors.append('Source-location drift '+filename+': '+r['source_id'])
 checks.append('Source/map IDs and current-location register consistency checked')
 if check_local_sources:
  for source in sources:
   current=ROOT/source['current_path']
   if not current.is_file():errors.append('Source current_path missing '+source['source_id']);continue
   if source['archive_member']:
    with zipfile.ZipFile(current) as z:data=z.read(source['archive_member'])
   else:data=current.read_bytes()
   if sha(data)!=source['sha256']:errors.append('Source current bytes differ '+source['source_id'])
  for r in rows('docs/registers/template-pack-inventory.csv'):
   with zipfile.ZipFile(ROOT/r['current_archive_path']) as z:data=z.read(r['archive_entry'])
   if sha(data)!=r['sha256']:errors.append('Template member hash differs '+r['archive_entry'])
  checks.append('All current source paths/ZIP members and register locations resolve with exact checksums')
 claims=rows('docs/registers/claims.csv');req=rows('docs/registers/requirements.csv');known={r['claim_id'] for r in claims}|{r['requirement_id'] for r in req}
 for t in rows('docs/registers/traceability.csv'):
  if t['from_id'] not in known or (t['to_id'] not in ids and not (ROOT/t['to_id']).exists()):errors.append('Dangling trace '+t['relation_id'])
 checks.append(f'Coverage: {len(canon)} canonical sections; {len(coverage)} retained canonical/policy/evidence sections; {len(sources)} sources; {len(claims)} claim units; {len(req)} requirement seeds')
 # Validate only current docs/control records. Local archive references use registers,
 # not public Markdown links. Imported template placeholders are allowed in templates.
 paths=list((ROOT/'docs').rglob('*.md'))+[ROOT/'README.md',ROOT/'AGENTS.md']
 for p in paths:
  if not p.exists():continue
  if 'templates' in p.parts or p.name=='MIGRATION-AGENT-PROTOCOL.md':continue
  for line,url,target,frag in links(p):
   if not target.exists():errors.append(f'Missing link {p.relative_to(ROOT)}:{line}: {url}')
   elif frag and target.suffix=='.md':
    def slug(value):return re.sub(r'[^\w\- ]','',value.lower()).replace(' ','-')
    headings={slug(m[1]) for m in re.finditer(r'^#{1,6}\s+(.+)',target.read_text(),re.M)}
    if frag not in headings:errors.append(f'Missing heading fragment {p.relative_to(ROOT)}:{line}: {url}')
 checks.append('Current Markdown local file links checked; original archive links not rewritten')
 if check_local_sources:
  if not moves:errors.append('Archive manifest missing')
  for entry in moves:
   path=ROOT/entry['archive_path']
   if not path.is_file() or sha(path.read_bytes())!=entry['sha256'] or path.stat().st_size!=entry['bytes']:
    errors.append('Archive bytes differ or missing: '+entry['original_path'])
  if b'/.oldspecs/' not in (ROOT/'.gitignore').read_bytes():errors.append('Archive ignore rule absent')
  if moves:
   names='\0'.join(r['archive_path'] for r in moves)+'\0';ignored=subprocess.run(['git','check-ignore','--stdin','-z'],cwd=ROOT,input=names.encode(),capture_output=True,check=True).stdout.decode().strip('\0').split('\0')
   if set(ignored)!={r['archive_path'] for r in moves}:errors.append('Archive paths not all ignored')
  tracked=subprocess.check_output(['git','ls-files','--','.oldspecs'],cwd=ROOT,text=True).strip()
  if tracked:errors.append('Archive unexpectedly tracked')
  checks.append(f'Archive preserved and ignored: {len(moves)} originals; no tracked .oldspecs paths')
 for check in checks:print('CHECK',check)
 for error in errors:print('FAIL',error)
 if errors:raise SystemExit(1)
 if not check_local_sources:print('SKIP: local archive bytes/source spans; use --check-local-sources when local originals are available')
 print('PASS: documentation mechanical checks; semantic adoption remains reviewable')
 return checks
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--check-local-sources',action='store_true',help='Require local archived sources and verify their exact bytes and spans')
 verify(parser.parse_args().check_local_sources)
