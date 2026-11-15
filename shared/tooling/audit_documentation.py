#!/usr/bin/env python3
"""Hypergraph PX — Current-documentation archive boundary

Reject retired project documents and navigational links that would make historical archives an active development dependency.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/audit_documentation.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Documentation verification, numbered-folder checks and their isolated Python fixtures.

Specification:
- [Source-aware documentation checks](../../docs/08-assurance/source-traceability.md)
- [Commenting and review standard](../../docs/09-guides/developers/code-comments.md)

Boundary: Reads current docs and the policy register only; it does not open archives or establish semantic equivalence.
"""
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
    """Classify decoded local or hosted links against the archive boundary without reading their targets."""

    target=target.strip('<>')
    u=urlsplit(target)
    if not u.path:
        return False
    path=unquote(u.path)
    if '.provenance' in Path(path).parts:
        return True
    if u.scheme or u.netloc:
        return any('/'+old in path for old in RETIRED)
    p=(source.parent/path).resolve()
    return p.is_relative_to(root.resolve()) and str(p.relative_to(root.resolve())) in RETIRED


def audit(root=ROOT):
    """Inspect current Markdown, model and structured navigation references and report every retired/archive dependency."""

    errors=[]
    files=list((root/'docs').rglob('*'))+[root/'AGENTS.md']

    for p in files:
        if not p.is_file():
            continue
        if p.is_relative_to(root/'docs') and p.name in NAMES:
            errors.append('Retired project document remains: '+str(p.relative_to(root)))
        if p.suffix not in ('.md','.c4','.json','.csv'):
            continue
        text=p.read_text()
        targets=[]
        if p.suffix=='.md':
            targets=re.findall(r'\]\((<[^>]+>|[^\s)]+)',text)
        elif p.suffix=='.c4':
            targets=re.findall(r'^\s*link\s+(\S+)',text,re.M)
        # Navigation links inside model/contract registers use root paths;
        # original source identity fields are deliberately not navigational.
        elif p.suffix=='.json':
            def walk(value,key=''):
                """Yield retired navigational JSON references while preserving original-source identity fields as historical data."""

                if isinstance(value,dict):
                    for k,v in value.items():
                        yield from walk(v,k)
                elif isinstance(value,list):
                    for v in value:
                        yield from walk(v,key)
                elif isinstance(value,str) and key not in ('original_path','source_original_path','historical_git_ref'):
                    if value.split('#')[0] in RETIRED:
                        yield value
            targets=list(walk(json.loads(text)))

            for target in targets:
                errors.append('Retired structured reference: '+str(p.relative_to(root))+' -> '+target)
            targets=[]
        elif p.suffix=='.csv':
            for row in csv.DictReader(text.splitlines()):
                for key,value in row.items():
                    if key in ('original_path','source_original_path','source_section_or_lines','archive_member') or not value:
                        continue
                    if any(old in value for old in RETIRED):
                        errors.append('Retired structured reference: '+str(p.relative_to(root))+' field '+key)

        for target in targets:
            if retired_link(target,p,root):
                errors.append('Retired/archive link: '+str(p.relative_to(root))+' -> '+target)
    return errors


if __name__=='__main__':
    errors=audit()

    for e in errors:
        print('FAIL:',e)
    if errors:
        raise SystemExit(1)
    print('PASS: no retired project documents or archive links in current docs/AGENTS.md')
