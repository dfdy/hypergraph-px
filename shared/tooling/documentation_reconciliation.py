"""Fail-closed mechanical bindings for explicitly reviewed documentation mappings.

Fingerprints attest which evidence was assessed, not semantic equivalence or owner
approval. This module never updates evidence; changing a pin requires re-review.
"""
from pathlib import Path
import csv
import hashlib
import json
import re

REGISTER = 'docs/02-governance/registers/source-obligations.json'
DISPOSITIONS = {'retained', 'transformed', 'delegated', 'owner-superseded', 'historical-evidence', 'unresolved'}
TABLES = {'coverage': ('claim-coverage.csv', 'section_id'), 'sections': ('source-sections.csv', 'section_id'), 'sources': ('source-manifest.csv', 'source_id'), 'claims': ('claims.csv', 'claim_id'), 'maps': ('source-destinations.csv', 'mapping_id'), 'documents': ('document-inventory.csv', 'id'), 'requirements': ('requirements.csv', 'requirement_id'), 'scopes': ('specification-ownership.csv', 'scope_id')}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def object_digest(value):
    return digest(json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode())


def nonblank(value):
    return isinstance(value, str) and bool(value.strip())


def require(condition, message):
    if not condition:
        raise ValueError(message)


def string_list(value):
    require(isinstance(value, list) and all(nonblank(item) for item in value), 'malformed string list')
    return value


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, 'duplicate JSON key')
        result[key] = value
    return result


def load_json(path):
    return json.loads(path.read_text(), object_pairs_hook=unique_object,
                      parse_constant=lambda _: (_ for _ in ()).throw(ValueError('nonfinite JSON')))


def owned(root, value):
    require(nonblank(value) and '\\' not in value and not Path(value).is_absolute()
            and all(p not in ('', '.', '..') for p in value.split('/')), 'invalid evidence path')
    p = root / value
    require(p.resolve().is_relative_to(root.resolve()), 'evidence path escapes root')
    return p


def slug(text):
    return re.sub(r'[^\w\- ]', '', text.lower()).replace(' ', '-')


def evidence_bytes(root, ref):
    """Exact Markdown section bytes, or exact whole-file bytes for unanchored refs."""
    require(nonblank(ref), 'blank evidence reference')
    path, _, anchor = ref.partition('#')
    p = owned(root, path)
    require(not {'.local', '.provenance', '.git'}.intersection(p.resolve().relative_to(root.resolve()).parts), 'review evidence must be public, not private runtime/archive content')
    data = p.read_bytes()
    if not anchor:
        return data
    require(p.suffix == '.md', 'anchor on non-Markdown evidence')
    lines = data.splitlines(keepends=True)
    headings = []
    fence = None
    for i, line in enumerate(lines):
        text = line.decode('utf-8').rstrip('\r\n')
        marker = re.match(r'^ {0,3}(`{3,}|~{3,})(.*)$', text)
        if fence:
            if marker and marker[1][0] == fence[0] and len(marker[1]) >= fence[1] and not marker[2].strip():
                fence = None
            continue
        if marker:
            fence = (marker[1][0], len(marker[1]))
            continue
        m = re.match(r'^(#{1,6})\s+(.+?)\s*$', text)
        if m:
            headings.append((i, len(m[1]), slug(m[2])))
    matches = [(i, level) for i, level, name in headings if name == anchor]
    require(len(matches) == 1, 'missing or ambiguous evidence anchor')
    start, level = matches[0]
    end = next((i for i, depth, _ in headings if i > start and depth <= level), len(lines))
    return b''.join(lines[start:end])


def tables(root):
    result = {}
    for name, (filename, key) in TABLES.items():
        with (root / 'docs/02-governance/registers' / filename).open(newline='') as f:
            reader = csv.DictReader(f)
            require(reader.fieldnames is not None and len(reader.fieldnames) == len(set(reader.fieldnames)) and key in reader.fieldnames, 'malformed registry header')
            data = list(reader)
        require(all(None not in r and all(v is not None for v in r.values()) for r in data), 'malformed registry row')
        require(all(nonblank(r.get(key)) for r in data), 'missing registry ID')
        result[name] = {r[key]: r for r in data}
        require(len(data) == len(result[name]), 'duplicate registry ID')
    return result


def authority_ref(root, authority, db):
    """Use the explicit owner record's section, not an incidental reference."""
    require(nonblank(authority), 'malformed authority reference')
    if authority.startswith('HPX-OWNER-'):
        path = 'docs/02-governance/OWNER_DECISIONS.md'
        text = (root / path).read_text()
        lines = text.splitlines()
        matches = [i for i, line in enumerate(lines)
                   if re.match(r'^(?:\|\s*)?' + re.escape(authority) + r'(?:\s*\||[: ])', line)]
        require(bool(matches), 'unknown owner authority')
        anchors = set()
        for i in matches:
            preceding = [re.match(r'^#{1,6}\s+(.+)', line) for line in lines[:i + 1]]
            heading = next((m[1] for m in reversed(preceding) if m), None)
            require(heading is not None, 'owner authority without heading')
            anchors.add(path + '#' + slug(heading))
        return anchors
    if authority.startswith('HPX-ADR-'):
        require(authority in db['documents'], 'unknown ADR authority')
        return {db['documents'][authority]['path']}
    return set()


def expected_bindings(root, entry, db):
    """Derive required binding identities, never their approved digest values."""
    sid = entry['section_id']; coverage = db['coverage'][sid]; source = db['sources'][entry['source_id']]
    section = db['sections'][sid]
    require(entry['current_destination'] == {'document_id': coverage['destination_id'], 'path': coverage['destination_path'], 'section': coverage['destination_section']}, 'current destination mismatch')
    require(db['documents'][coverage['destination_id']]['path'] == coverage['destination_path'], 'destination document mismatch')
    checks = {'source_id': 'source_id', 'original_path': 'source_original_path',
              'current_source_path': 'source_current_path', 'archive_member': 'archive_member',
              'source_section_sha256': 'source_section_sha256'}
    for column, field in checks.items():
        require(coverage[column] == entry[field], 'coverage/source identity mismatch')
    require(int(coverage['start_line']) == entry['source_start_line'] and int(coverage['end_line']) == entry['source_end_line'], 'source span mismatch')
    require(source['sha256'] == entry['source_file_sha256'] and source['original_path'] == entry['source_original_path']
            and source['current_path'] == entry['source_current_path'] and source['archive_member'] == entry['archive_member'], 'source record mismatch')
    require(section['source_id'] == entry['source_id'] and section['section_sha256'] == entry['source_section_sha256']
            and int(section['start_line']) == entry['source_start_line'] and int(section['end_line']) == entry['source_end_line'], 'section record mismatch')
    claims = {k for k, row in db['claims'].items() if row['source_id'] == entry['source_id']
              and int(row['start_line']) <= entry['source_end_line'] and int(row['end_line']) >= entry['source_start_line']}
    require(set(entry['overlapping_claim_ids']) == claims and len(entry['overlapping_claim_ids']) == len(claims), 'claim coverage mismatch')
    mappings = set()
    for k, row in db['maps'].items():
        m = re.match(r'L(\d+)-L(\d+):', row['source_section_or_lines'])
        if row['source_id'] == entry['source_id'] and m and int(m[1]) <= entry['source_end_line'] and int(m[2]) >= entry['source_start_line']:
            mappings.add(k)
    require(set(entry['mapping_ids']) == mappings and len(entry['mapping_ids']) == len(mappings), 'mapping coverage mismatch')
    result = {'coverage:' + sid: object_digest(coverage), 'sections:' + sid: object_digest(section),
              'sources:' + entry['source_id']: object_digest(source)}
    for name, keys in [('claims', claims), ('maps', mappings), ('requirements', entry['requirement_refs']), ('scopes', entry['canonical_scope_ids']), ('documents', [coverage['destination_id']])]:
        for key in keys:
            result[name + ':' + key] = object_digest(db[name][key])
    refs = set(entry['current_refs'] + entry['canonical_sources'])
    refs.add(coverage['destination_path'] + '#' + slug(coverage['destination_section']))
    authorities = set(entry['authority_refs'])
    for c in entry['postrepair_dispositions']:
        refs.update(c['current_refs']); authorities.update(c['authority'])
        for part in c['components']:
            refs.update(part['current_refs']); authorities.update(part['authority'])
    for a in authorities:
        require(nonblank(a), 'malformed authority reference')
        if a.startswith('HPX-SRC-'):
            require(a.split(':')[0] == sid, 'unbound source authority')
        else:
            resolved = authority_ref(root, a, db)
            require(bool(resolved), 'unknown authority')
            refs.update(resolved)
    for ref in refs:
        result['evidence:' + ref] = digest(evidence_bytes(root, ref))
    return result


def assessment_digest(entry):
    return object_digest({k: v for k, v in entry.items() if k != 'review_binding'})


def validate_entry(root, entry, db):
    require(isinstance(entry, dict), 'malformed reviewed entry')
    sid = entry['section_id']
    require(nonblank(sid) and nonblank(entry['source_id']), 'malformed section/source ID')
    for key in ('overlapping_claim_ids', 'mapping_ids', 'requirement_refs', 'canonical_scope_ids', 'current_refs', 'canonical_sources', 'authority_refs', 'reviewed_obligations'):
        string_list(entry[key])
    require(all(type(entry[k]) is int and entry[k] > 0 for k in ('source_start_line', 'source_end_line')) and entry['source_end_line'] >= entry['source_start_line'], 'malformed source span')
    require(all(isinstance(entry[k], str) and re.fullmatch(r'[0-9a-f]{64}', entry[k]) for k in ('source_section_sha256', 'source_file_sha256')), 'malformed source digest')
    require(sid in db['coverage'] and sid in db['sections'], 'unknown reviewed section')
    require('source-obligations.json for ' + sid in db['coverage'][sid]['disposition'], 'unreviewed section cannot use mapping')
    obligations = entry['postrepair_dispositions']
    require(isinstance(obligations, list) and bool(obligations), 'missing obligation groups')
    require(len(obligations) == len(entry['reviewed_obligations']), 'incomplete obligation groups')
    seen = set()
    for i, c in enumerate(obligations, 1):
        require(isinstance(c, dict), 'malformed obligation group')
        for key in ('source_claim_ids', 'source_mapping_ids', 'current_refs', 'authority', 'component_dispositions'):
            string_list(c[key])
        require(nonblank(c['disposition']), 'malformed disposition')
        require(c['obligation_id'] == sid + '-O' + str(i).zfill(2) and c['obligation_id'] not in seen, 'duplicate/malformed obligation ID')
        seen.add(c['obligation_id'])
        require(nonblank(c['summary']) and c['summary'] == entry['reviewed_obligations'][i-1] and nonblank(c['basis']), 'missing obligation summary/basis')
        require(c['disposition'] in DISPOSITIONS, 'invalid aggregate disposition')
        span = c['source_span']
        require(span == {'source_id': entry['source_id'], 'original_path': entry['source_original_path'],
                         'current_path': entry['source_current_path'], 'start_line': entry['source_start_line'],
                         'end_line': entry['source_end_line'], 'section_sha256': entry['source_section_sha256']}, 'obligation source binding mismatch')
        require(c['source_claim_ids'] == entry['overlapping_claim_ids'] and c['source_mapping_ids'] == entry['mapping_ids'], 'obligation traceability mismatch')
        parts = c['components']
        require(isinstance(parts, list) and bool(parts), 'missing obligation components')
        for part in parts:
            require(isinstance(part, dict) and nonblank(part['disposition']), 'malformed obligation component')
            string_list(part['current_refs'])
            string_list(part['authority'])
        require({p['disposition'] for p in parts} == set(c['component_dispositions']) and len(parts) == len(c['component_dispositions']) == len(set(c['component_dispositions'])), 'component disposition mismatch')
        require(c['disposition'] in c['component_dispositions'], 'aggregate absent from components')
        if 'owner-superseded' in c['component_dispositions']:
            scope = c.get('changed_source_clause_scope')
            require(nonblank(scope) and scope.strip().lower() not in {'all', '*', 'entire section', 'entire obligation'} and scope != c['summary'] and 'retained' in c['component_dispositions'], 'blanket supersession forbidden')
        for part in parts:
            require(part['disposition'] in DISPOSITIONS and nonblank(part['scope']) and nonblank(part['basis']), 'invalid component disposition/scope/basis')
            require(isinstance(part['current_refs'], list) and bool(part['current_refs']) and set(part['current_refs']) <= set(c['current_refs']), 'component has no bound current home')
            require(isinstance(part['authority'], list) and set(part['authority']) <= set(c['authority']), 'component authority mismatch')
            if part['disposition'] == 'owner-superseded':
                require(any(a.startswith(('HPX-OWNER-', 'HPX-ADR-')) for a in part['authority']) and part['scope'] == c['changed_source_clause_scope'], 'supersession lacks scoped authority')
            if part['disposition'] == 'unresolved':
                require(nonblank(part.get('open_scope')) and part['open_scope'] == c['unresolved_scope'] and part.get('resolution') == 'open-not-adopted', 'unresolved scope silently closed')
    binding = entry['review_binding']
    require(isinstance(binding, dict), 'malformed review binding')
    require(type(binding['version']) is int and binding['version'] == 1 and nonblank(binding['review_ref']) and nonblank(binding['basis']), 'missing explicit review evidence')
    # The public review locator must resolve, but is deliberately not hashed:
    # the audit records this schema and would otherwise create a hash cycle.
    ref = binding['review_ref']
    require(ref.partition('#')[0].startswith('docs/') and ref.partition('#')[0].endswith('.md'), 'review locator must name public Markdown documentation')
    evidence_bytes(root, ref)
    require(binding['assessment_sha256'] == assessment_digest(entry), 'reviewed assessment changed; re-review required')
    require(binding['bindings'] == expected_bindings(root, entry, db), 'stale reviewed target/authority/registry evidence; re-review required')


def validate(root):
    """Return only fully validated section IDs; any malformed record fails closed."""
    try:
        db = tables(root)
        marked = {sid for sid, row in db['coverage'].items() if 'source-obligations.json' in row['disposition']}
        path = root / REGISTER
        if not path.exists():
            require(not marked, 'missing reconciliation register')
            return set(), []
        record = load_json(path)
        require(type(record['verification_schema_version']) is int and record['verification_schema_version'] == 1, 'unknown reconciliation schema')
        entries = record['entries']
        require(isinstance(entries, list), 'malformed entries')
        require(all(isinstance(e, dict) and nonblank(e['section_id']) for e in entries), 'malformed reviewed section')
        ids = [e['section_id'] for e in entries]
        require(len(ids) == len(set(ids)), 'duplicate reviewed section')
        require(set(ids) == marked, 'missing or unreviewed section mapping')
        require(record['obligation_disposition_count'] == sum(len(e['postrepair_dispositions']) for e in entries), 'obligation count mismatch')
        for entry in entries:
            validate_entry(root, entry, db)
        return set(ids), []
    except (ValueError, KeyError, TypeError, OSError, UnicodeError, csv.Error) as exc:
        # Never echo private text or malformed input payloads into public logs.
        return set(), ['Reviewed reconciliation invalid: ' + type(exc).__name__ + (': ' + str(exc) if isinstance(exc, ValueError) and not isinstance(exc, json.JSONDecodeError) else '')]


def literal_body_differs(original, destination):
    original = original.strip()
    if re.match(r'^#{1,6}\s', original):
        original = original.split('\n', 1)[1].strip() if '\n' in original else ''
    normalize = lambda text: re.sub(r'\]\((<[^>]+>|[^\s)]+)\)', ']()', text)
    return bool(original and normalize(original) not in normalize(destination))
