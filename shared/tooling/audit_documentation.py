#!/usr/bin/env python3
"""Reject completed-project documents and links from current documentation."""
from pathlib import Path
import json
import re
import csv
from urllib.parse import unquote,urlsplit

ROOT=Path(__file__).resolve().parents[2]
POLICY=json.loads((Path(__file__).parent/'documentation-policy.json').read_text())
RETIRED=set(POLICY['retired_project_documents'])
NAMES={Path(p).name for p in RETIRED}


def retired_link(target,source,root):
    target=target.strip('<>');u=urlsplit(target)
    if not u.path:return False
    path=unquote(u.path)
    if '.provenance' in Path(path).parts:return True
    if u.scheme or u.netloc:
        return any('/'+old in path for old in RETIRED)
    p=(source.parent/path).resolve()
    return p.is_relative_to(root.resolve()) and str(p.relative_to(root.resolve())) in RETIRED


def audit(root=ROOT):
    errors=[];files=list((root/'docs').rglob('*'))+[root/'AGENTS.md']
    for p in files:
        if not p.is_file():continue
        if p.is_relative_to(root/'docs') and p.name in NAMES:
            errors.append('Retired project document remains: '+str(p.relative_to(root)))
        if p.suffix not in ('.md','.c4','.json','.csv'):continue
        text=p.read_text()
        targets=[]
        if p.suffix=='.md':targets=re.findall(r'\]\((<[^>]+>|[^\s)]+)',text)
        elif p.suffix=='.c4':targets=re.findall(r'^\s*link\s+(\S+)',text,re.M)
        # Navigation links inside model/contract registers use root paths;
        # original source identity fields are deliberately not navigational.
        elif p.suffix=='.json':
            def walk(value,key=''):
                if isinstance(value,dict):
                    for k,v in value.items():yield from walk(v,k)
                elif isinstance(value,list):
                    for v in value:yield from walk(v,key)
                elif isinstance(value,str) and key not in ('original_path','source_original_path','historical_git_ref'):
                    if value.split('#')[0] in RETIRED:yield value
            targets=list(walk(json.loads(text)))
            for target in targets:errors.append('Retired structured reference: '+str(p.relative_to(root))+' -> '+target)
            targets=[]
        elif p.suffix=='.csv':
            for row in csv.DictReader(text.splitlines()):
                for key,value in row.items():
                    if key in ('original_path','source_original_path','source_section_or_lines','archive_member') or not value:continue
                    if any(old in value for old in RETIRED):
                        errors.append('Retired structured reference: '+str(p.relative_to(root))+' field '+key)
        for target in targets:
            if retired_link(target,p,root):errors.append('Retired/archive link: '+str(p.relative_to(root))+' -> '+target)
    return errors


if __name__=='__main__':
    errors=audit()
    for e in errors:print('FAIL:',e)
    if errors:raise SystemExit(1)
    print('PASS: no retired project documents or archive links in current docs/AGENTS.md')
