"""Section-level prose/LikeC4 bindings. Read-only; no model service required."""
import csv
import json
import os
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REGISTER = 'docs/02-governance/registers/contract-bindings.json'


def slug(text):
    return re.sub(r'[^\w\- ]', '', text.lower()).replace(' ', '-')


def sections(text):
    """H2 owns its nested headings. Ignore fenced examples, retain exact headings."""
    result = []
    fence = None
    for line in text.splitlines():
        marker = re.match(r'^ {0,3}(`{3,}|~{3,})(.*)$', line)
        if fence:
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= fence[1] and not marker[2].strip():
                fence = None
            continue
        if marker:
            fence = (marker[1][0], len(marker[1]))
        elif line.startswith('## '):
            result.append((line[3:].strip(), slug(line[3:].strip())))
    return result


def model(root):
    """Index declarations/extends and direct links, excluding links on views/children.

    Mask quoted strings and comments before balancing braces. This intentionally
    reads only the declaration/link subset; LikeC4 remains the syntax validator.
    """
    elements, views = {}, set()
    for p in sorted((root / 'docs').rglob('*.c4')):
        text = p.read_text()
        masked = re.sub(r'"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|//[^\n]*|/\*[\s\S]*?\*/',
                        lambda m: ''.join('\n' if c == '\n' else ' ' for c in m[0]), text)
        stack, ends = [], {}
        for i, c in enumerate(masked):
            if c == '{': stack.append(i)
            elif c == '}' and stack: ends[stack.pop()] = i
        blocks = []
        pattern = r'\bextend\s+([\w.]+)\s*\{|\b([\w]+)\s*=\s*(\w+)\b[^{}\n]*\{'
        for m in re.finditer(pattern, masked):
            start = m.end() - 1
            if start not in ends: continue
            parent = next((b for b in reversed(blocks) if b['start'] < start < b['end']), None)
            identity = m[1] if m[1] else ((parent['id'] + '.') if parent else '') + m[2]
            blocks.append(dict(id=identity, start=start, end=ends[start], declaration=m.start(), extend=bool(m[1])))
        for b in blocks:
            if b['extend']: continue
            direct = []
            for m in re.finditer(r'^[ \t]*(link)\s+(\S+)', text[b['start']+1:b['end']], re.M):
                pos = b['start'] + 1 + m.start(1)
                if masked[pos:pos+4] != 'link': continue
                if any(c['start'] < pos < c['end'] for c in blocks if c is not b and b['start'] < c['start'] < b['end']): continue
                target = m[2].strip('"\'')
                path, sep, anchor = target.partition('#')
                direct.append(os.path.normpath(str(p.parent.relative_to(root) / path)) + (sep + anchor if sep else ''))
            elements[b['id']] = dict(source=str(p.relative_to(root)), start=b['start'], end=b['end'], links=direct)
        views.update(re.findall(r'\b(?:dynamic\s+)?view\s+(\w+)\b', masked))
    return elements, views


def required_documents(root):
    data = json.loads((root / REGISTER).read_text())
    with (root / 'docs/02-governance/registers/document-inventory.csv').open(newline='') as source:
        documents = list(csv.DictReader(source))
    required = {d['path'] for d in documents if d['id'] in data.get('coverage_policy', {}).get('split_document_ids', [])}
    with (root / 'docs/02-governance/registers/specification-ownership.csv').open(newline='') as f:
        for row in csv.DictReader(f):
            required.update(p for p in row['retained_contracts'].split(';') if p.startswith('docs/') and ('/contracts/' in p or '/proposals/' in p or p.endswith('/representation-profile.md')) and p.endswith('.md'))
    # Follow only local detailed-contract/proposal links, not general docs/audits.
    pending = list(required)
    while pending:
        path = pending.pop()
        for target in re.findall(r'\]\(([^\s)]+)', (root / path).read_text()):
            candidate = ((root / path).parent / target.split('#')[0]).resolve()
            if not candidate.is_relative_to(root.resolve()): continue
            relative = candidate.relative_to(root.resolve())
            if candidate.is_file() and candidate.suffix == '.md' and (('/contracts/' in str(relative) or '/proposals/' in str(relative)) or str(relative).endswith('/representation-profile.md')):
                name = str(relative)
                if name not in required:
                    required.add(name); pending.append(name)
    return required


def backlink(root, document, binding, elements):
    prefix = f'`{binding["id"]}` [{binding["heading"]}](#{binding["anchor"]})'
    if binding['disposition'] == 'prose-only':
        return f'| {prefix} | Prose only: {binding.get("reason", "")} |'
    owner = binding['owner']
    source = os.path.relpath(elements[owner]['source'], str(Path(document).parent))
    view_source = os.path.relpath('docs/04-architecture/navigation.md', str(Path(document).parent))
    consumers = ', '.join('`' + c + '`' for c in binding['consumers']) or 'none'
    return f'| {prefix} | [{owner}]({source}) · `{binding["scope"]}` · [{binding["view"]}]({view_source}) · consumers: {consumers} |'


def _validate(root=ROOT, register=None):
    errors = []
    data = register if register is not None else json.loads((root / REGISTER).read_text())
    elements, views = model(root)
    with (root / 'docs/02-governance/registers/specification-ownership.csv').open(newline='') as f:
        scopes = {r['scope_id']: r for r in csv.DictReader(f)}
    if data.get('version') != 1: errors.append('Unsupported contract-binding register version')
    documents = data.get('documents', [])
    with (root / 'docs/02-governance/registers/document-inventory.csv').open(newline='') as source:
        document_ids = {d['path']: d['id'] for d in csv.DictReader(source)}
    summary = data.get('coverage_policy')
    if documents:
        bindings = [b for d in documents for b in d['sections']]
        expected = dict(documents=len(documents), sections=len(bindings),
                        bound=sum(b['disposition'] == 'bound' for b in bindings),
                        prose_only=sum(b['disposition'] == 'prose-only' for b in bindings))
        if not summary or any(summary.get(k) != v for k, v in expected.items()): errors.append('Contract binding aggregate counts drift')
    if {d['path'] for d in documents} != required_documents(root): errors.append('Contract document coverage differs')
    if len({d['path'] for d in documents}) != len(documents): errors.append('Duplicate contract document')
    ids = set()
    for d in documents:
        path = d['path']
        if d.get('document_id') != document_ids.get(path): errors.append(f'Contract document ID drift: {path}')
        if not (root / path).resolve().is_relative_to(root.resolve()):
            errors.append('Contract path escapes repository'); continue
        if not (root / path).is_file():
            errors.append(f'Missing contract {path}'); continue
        text = (root / path).read_text()
        headings = sections(text)
        if Counter((b['heading'], b['anchor']) for b in d['sections']) != Counter(headings): errors.append(f'Section coverage differs: {path}')
        anchors = Counter(slug(h[2]) for h in re.findall(r'^(#{1,6})(\s+)(.+)$', text, re.M))
        seen = set()
        for b in d['sections']:
            label = f'{path}#{b["anchor"]}'
            if b['id'] in ids: errors.append(f'Duplicate binding ID {b["id"]}')
            ids.add(b['id'])
            if b['anchor'] in seen: errors.append(f'Conflicting section owner: {label}')
            seen.add(b['anchor'])
            if anchors[b['anchor']] != 1: errors.append(f'Missing or ambiguous anchor: {label}')
            if b['disposition'] == 'prose-only':
                if b.get('owner') or not b.get('reason'): errors.append(f'Invalid prose-only disposition: {label}')
            elif b['disposition'] == 'bound':
                owner = b.get('owner')
                if owner not in elements: errors.append(f'Missing element: {owner}'); continue
                if b.get('view') not in views: errors.append(f'Missing view: {label}')
                scope = scopes.get(b.get('scope'))
                if not scope: errors.append(f'Missing scope: {label}')
                elif not any(owner == e or owner.startswith(e + '.') for e in scope['elements'].split(';')): errors.append(f'Owner outside scope: {label}')
                if label not in elements[owner]['links']: errors.append(f'Missing direct owner link: {label} ({owner})')
                if not isinstance(b.get('consumers'), list) or len(set(b['consumers'])) != len(b['consumers']): errors.append(f'Invalid consumers: {label}')
                else:
                    for c in b['consumers']:
                        if c not in elements: errors.append(f'Missing consumer: {c}')
                        elif label not in elements[c]['links']: errors.append(f'Missing consumer link: {label} ({c})')
                if b.get('view') in views and scope and b['view'] not in scope['views'].split(';'):
                    errors.append(f'View outside scope: {label}')
            else: errors.append(f'Unknown disposition: {label}')
            if backlink(root, path, b, elements) not in text: errors.append(f'Missing exact backlink: {label}')
    return errors


def validate(root=ROOT, register=None):
    try:
        return _validate(root, register)
    except (KeyError, TypeError, ValueError, AttributeError, OSError):
        return ['Malformed contract bindings or missing registry inputs']


if __name__ == '__main__':
    failures = validate()
    for error in failures: print(error)
    if failures: raise SystemExit(1)
    data = json.loads((ROOT / REGISTER).read_text())
    bindings = [b for d in data['documents'] for b in d['sections']]
    print(f'Contract bindings passed: {len(data["documents"])} documents; {len(bindings)} sections; {sum(b["disposition"] == "bound" for b in bindings)} bound')
