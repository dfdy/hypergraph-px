#!/usr/bin/env python3
"""Fail-closed dual-hash HPX-SCP bootstrap (operates outside agent context).

Two hashes in an external integrity manifest cover the canonical prose and semantic
YAML independently; regenerated projection equivalence binds their meanings.
"""
from __future__ import annotations
import argparse
import hashlib
import hmac
import json
import os
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
PROTOCOL = ROOT / 'docs' / 'engineering' / 'semantic-protocol' / 'PROTOCOL.md'
DELIMITER = b'<!-- HPX-SCP:SEMANTIC-APPENDIX-BEGIN v4 -->\n'
MANIFEST_DELIMITER = b'<!-- HPX-SCP:INTEGRITY-MANIFEST-BEGIN v4 -->\n'
FORMAT_VERSION = 4
OPEN_FENCE = b'```yaml\n'
CLOSE_FENCE = b'\n```\n'
RULE_PATTERN = re.compile(r'^\*\*(SCP-[A-Z0-9-]+) \[([a-z]+)\]:\*\* (.+)$')
HEADING_PATTERN = re.compile(r'^(#{1,4}) (.+)$')
VERSION_PATTERN = re.compile(r'^\*\*Version:\*\* (\d+\.\d+\.\d+)\s*$', re.M)
SCOPES = {'kernel', 'baseline', 'negotiation', 'exchange', 'records', 'plan', 'implement', 'verify', 'handoff', 'amend', 'preflight', 'recovery'}

class BootstrapError(ValueError):
    """Canonical/semantic pair is invalid; do not load any semantic packet."""


def strict_object(pairs):
    result = {}
    for k, v in pairs:
        if k in result:
            raise BootstrapError(f'duplicate JSON key: {k}')
        result[k] = v
    return result


class StrictYAMLLoader(yaml.SafeLoader):
    """YAML subset: plain mappings/sequences/scalars; no aliases or duplicate keys."""

    def compose_node(self, parent, index):
        if self.check_event(yaml.AliasEvent):
            raise BootstrapError('YAML aliases are not supported')
        event = self.peek_event()
        if getattr(event, 'anchor', None):
            raise BootstrapError('YAML anchors are not supported')
        return super().compose_node(parent, index)


def unique_yaml_mapping(loader, node):
    out = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=True)
        if not isinstance(key, str):
            raise BootstrapError('YAML mapping keys must be strings')
        if key in out:
            raise BootstrapError('duplicate YAML key: ' + key)
        out[key] = loader.construct_object(value_node, deep=True)
    return out


StrictYAMLLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, unique_yaml_mapping)


def strict_yaml(raw: bytes) -> dict:
    try:
        parsed = yaml.load(raw.decode('utf-8', 'strict'), Loader=StrictYAMLLoader)
    except (yaml.YAMLError, UnicodeError, ValueError) as exc:
        raise BootstrapError('invalid semantic/manifest YAML: ' + str(exc)) from exc
    if not isinstance(parsed, dict):
        raise BootstrapError('semantic appendix and manifest must be mappings')
    return parsed


def yaml_bytes(value: dict) -> bytes:
    return yaml.safe_dump(value, allow_unicode=True, sort_keys=False, width=140).encode('utf-8')


def machine_from_projection(projection: dict) -> dict:
    """A concise, indented, self-describing semantic form, generated solely from canonical prose."""
    ordered_scopes = ['kernel', 'baseline', 'negotiation', 'exchange', 'records', 'plan', 'implement', 'verify',
                      'handoff', 'amend', 'recovery', 'preflight']
    scopes = {}
    for scope in ordered_scopes:
        matching = {r['id']: r['directive'] for r in projection['rules'] if r['scope'] == scope}
        if matching:
            scopes[scope] = matching
    return {
        'HPX-SCP': {
            'version': projection['protocol_version'],
            'format': FORMAT_VERSION,
            'authority': projection['authority'],
            'scopes': scopes,
            'message_envelope': {e['name']: e['meaning'] for e in projection['message_envelope']},
            'message_types': {t['kind']: {'required': t['required_body'], 'meaning': t['meaning']} for t in projection['message_types']},
            'record_envelope': {e['name']: e['meaning'] for e in projection['envelope_fields']},
            'record_types': {t['kind']: {
                'statuses': t['statuses'],
                'required': t['required_content_fields'],
                'meaning': t['meaning'],
            } for t in projection['record_types']},
            'relationships': {e['name']: e['meaning'] for e in projection['relationship_types']},
            'amendment_classes': {a['name']: {
                'examples': a['examples'],
                'activation': a['activation'],
            } for a in projection['amendment_classes']},
        }
    }


def natural_prefix(data: bytes) -> bytes:
    if data.startswith(b'\xef\xbb\xbf') or b'\r' in data:
        raise BootstrapError('BOM or CR/CRLF prohibited')
    if data.count(DELIMITER) != 1:
        raise BootstrapError('semantic appendix delimiter must appear exactly once')
    natural = data.split(DELIMITER, 1)[0]
    try:
        natural.decode('utf-8', errors='strict')
    except UnicodeError as exc:
        raise BootstrapError('invalid canonical UTF-8') from exc
    if not natural.startswith(b'# HPX Semantic Communication Protocol') or not natural.endswith(b'\n'):
        raise BootstrapError('unrecognised canonical source framing')
    return natural


def parse_table(src: str, header: tuple[str, ...]):
    rows = []
    for line in src.splitlines():
        if not line.startswith('|') or not line.endswith('|'):
            continue
        cells = [c.strip() for c in line[1:-1].split('|')]
        if all(re.fullmatch(r':?-{3,}:?', c) for c in cells):
            continue
        rows.append(cells)
    if not rows or rows[0] != list(header) or any(len(r) != len(header) for r in rows):
        raise BootstrapError('missing or malformed canonical table: ' + ', '.join(header))
    return rows[1:]


def semantic_projection(natural: bytes) -> dict:
    """Derive only semantic instructions and integrity indexes, never duplicate full prose."""
    content = natural.decode('utf-8', errors='strict')
    v = VERSION_PATTERN.search(content)
    if not v:
        raise BootstrapError('missing canonical semantic version')
    section_starts = []
    rules = []
    in_code = False
    byte_pos = 0
    for line_num, line in enumerate(content.splitlines(keepends=True), 1):
        stripped = line.rstrip('\n')
        if stripped.startswith('```'):
            in_code = not in_code
        match = HEADING_PATTERN.match(stripped) if not in_code else None
        if match:
            section_starts.append((byte_pos, match.group(2), len(match.group(1))))
        match = RULE_PATTERN.match(stripped) if not in_code else None
        if match:
            rid, scope, directive = match.groups()
            if scope not in SCOPES:
                raise BootstrapError('unrecognised scope: ' + scope)
            if any(x['id'] == rid for x in rules):
                raise BootstrapError('duplicate tagged rule: ' + rid)
            rules.append({'id': rid, 'scope': scope, 'directive': directive})
        # Canonical policy is intentionally rule/table-only. Reject stray prose
        # that a semantic packet could otherwise silently omit. Metadata is exempt.
        if (stripped and not in_code and not stripped.startswith(('#', '|', '- `', '**SCP-', '**Version:**', '**Status:**', '**Purpose:**'))
                and not stripped.startswith('|') and not stripped.startswith('|---')):
            raise BootstrapError(f'untagged canonical prose on line {line_num}; assign a semantic rule ID/scope')
        byte_pos += len(line.encode('utf-8'))
    if in_code:
        raise BootstrapError('unclosed Markdown code fence')
    if not section_starts or section_starts[0][0] != 0:
        raise BootstrapError('cannot partition canonical source')
    source_sections = {}
    for i, (start, title, level) in enumerate(section_starts):
        end = section_starts[i+1][0] if i+1 < len(section_starts) else len(natural)
        chunk = natural[start:end]
        if title in source_sections:
            raise BootstrapError('duplicate section title: ' + title)
        source_sections[title] = chunk.decode('utf-8')
    required_sections = {'1.2 Message envelope fields', '1.3 Message kinds', '5.1 Required record envelope', '5.2 Record kinds', '5.3 Relationships', '7.1 Change classes'}
    if not required_sections.issubset(source_sections):
        raise BootstrapError('missing typed vocabulary sections')
    message_envelope = []
    for field, meaning in parse_table(source_sections['1.2 Message envelope fields'], ('Field', 'Meaning')):
        if not re.fullmatch(r'`[a-z_]+`', field):
            raise BootstrapError('invalid message envelope field')
        message_envelope.append({'name': field[1:-1], 'meaning': meaning})
    message_types = []
    for kind, required, meaning in parse_table(source_sections['1.3 Message kinds'], ('Kind', 'Required body', 'Meaning')):
        if not re.fullmatch(r'`[a-z_]+`', kind):
            raise BootstrapError('invalid message kind')
        message_types.append({'kind': kind[1:-1], 'required_body': re.findall(r'`([^`]+)`', required), 'meaning': meaning})
    if len(message_envelope) != 10 or len(message_types) < 9 or len({e['kind'] for e in message_types}) != len(message_types):
        raise BootstrapError('incomplete or duplicate message vocabulary')
    envelope = []
    for field, meaning in parse_table(source_sections['5.1 Required record envelope'], ('Field', 'Meaning')):
        if not field.startswith('`') or not field.endswith('`'):
            raise BootstrapError('invalid envelope field marker')
        envelope.append({'name': field[1:-1], 'meaning': meaning})
    record_kinds = []
    for kind, statuses, required, meaning in parse_table(source_sections['5.2 Record kinds'], ('Kind', 'Statuses', 'Required content', 'Meaning')):
        if not re.fullmatch(r'`[a-z_]+`', kind):
            raise BootstrapError('invalid record kind identifier')
        record_kinds.append({'kind': kind[1:-1], 'statuses': re.findall(r'`([^`]+)`', statuses),
                             'required_content_fields': re.findall(r'`([^`]+)`', required), 'meaning': meaning})
    relationships = []
    for line in source_sections['5.3 Relationships'].splitlines():
        m = re.fullmatch(r'- `([a-z_]+)`: (.+)', line)
        if m:
            relationships.append({'name': m.group(1), 'meaning': m.group(2)})
    classes = []
    for kind, examples, activation in parse_table(source_sections['7.1 Change classes'], ('Class', 'Examples', 'Activation')):
        if not re.fullmatch(r'\*\*[A-Za-z]+\*\*', kind):
            raise BootstrapError('invalid amendment class')
        classes.append({'name': kind.strip('*').lower(), 'examples': examples, 'activation': activation})
    if len(rules) < 20 or len(record_kinds) != 8 or len(relationships) < 8 or len(classes) != 3:
        raise BootstrapError('incomplete canonical semantic vocabulary')
    for needed in ('SCP-PRIME-001','SCP-PRIME-002','SCP-PRIME-003','SCP-CONTEXT-001', 'SCP-BOOT-003'):
        if needed not in {r['id'] for r in rules}:
            raise BootstrapError('missing necessary rule: ' + needed)
    return {
        'appendix_format_version': FORMAT_VERSION,
        'protocol_version': v.group(1),
        'authority': 'canonical_natural_language_only',
        'rules': rules,
        'message_envelope': message_envelope,
        'message_types': message_types,
        'envelope_fields': envelope,
        'record_types': record_kinds,
        'relationship_types': relationships,
        'amendment_classes': classes,
    }


def parse_appendix(data: bytes) -> tuple[dict, bytes, dict]:
    prefix = natural_prefix(data)
    remainder = data[len(prefix) + len(DELIMITER):]
    if remainder.count(MANIFEST_DELIMITER) != 1:
        raise BootstrapError('integrity manifest delimiter must appear exactly once')
    semantic_block, manifest_block = remainder.split(MANIFEST_DELIMITER, 1)
    if not semantic_block.startswith(OPEN_FENCE) or not semantic_block.endswith(CLOSE_FENCE):
        raise BootstrapError('invalid semantic YAML framing')
    if not manifest_block.startswith(OPEN_FENCE) or not manifest_block.endswith(CLOSE_FENCE):
        raise BootstrapError('invalid manifest YAML framing; no trailing bytes permitted')
    raw_machine = semantic_block[len(OPEN_FENCE):-len(CLOSE_FENCE)]
    raw_manifest = manifest_block[len(OPEN_FENCE):-len(CLOSE_FENCE)]
    machine = strict_yaml(raw_machine)
    manifest = strict_yaml(raw_manifest)
    return machine, raw_machine, manifest


def verify_document(data: bytes, trusted_sha256: str | None = None) -> dict:
    natural = natural_prefix(data)
    appendix, raw_machine, manifest = parse_appendix(data)
    if set(manifest) != {'natural_sha256', 'machine_sha256'}:
        raise BootstrapError('integrity manifest must contain exactly two SHA-256 digests')
    for label, raw in (('natural', natural), ('machine', raw_machine)):
        claimed = manifest[label + '_sha256']
        actual = hashlib.sha256(raw).hexdigest()
        if not isinstance(claimed, str) or not re.fullmatch(r'[a-f0-9]{64}', claimed):
            raise BootstrapError(f'invalid {label} SHA-256')
        if not hmac.compare_digest(actual, claimed):
            raise BootstrapError(f'{label} SHA-256 mismatch')
    if (not isinstance(appendix.get('HPX-SCP'), dict) or
            type(appendix['HPX-SCP'].get('format')) is not int or
            appendix['HPX-SCP']['format'] != FORMAT_VERSION):
        raise BootstrapError('unsupported appendix format version')
    for trusted in (trusted_sha256, os.environ.get('HPX_SCP_TRUSTED_SHA256')):
        if trusted is None:
            continue
        if not isinstance(trusted, str) or not re.fullmatch(r'[a-f0-9]{64}', trusted):
            raise BootstrapError('invalid independent trusted digest')
        if not hmac.compare_digest(hashlib.sha256(natural).hexdigest(), trusted):
            raise BootstrapError('independent trusted digest mismatch')
    projection = semantic_projection(natural)
    expected = machine_from_projection(projection)
    if appendix != expected:
        raise BootstrapError('semantic projection differs from canonical source')
    expected_machine = yaml_bytes(expected).rstrip(b"\n")
    if raw_machine != expected_machine:
        raise BootstrapError('semantic appendix is not deterministically encoded')
    return projection


def verify_path(path: Path = PROTOCOL, trusted_sha256: str | None = None) -> dict:
    return verify_document(path.read_bytes(), trusted_sha256)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--protocol', type=Path, default=PROTOCOL)
    parser.add_argument('--trusted-sha256')
    parser.add_argument('--show-digest', action='store_true', help='diagnostics only: output full canonical digest')
    args = parser.parse_args()
    try:
        result = verify_path(args.protocol, args.trusted_sha256)
    except (BootstrapError, OSError) as exc:
        print(f'BOOTSTRAP REFUSED: {exc}', file=sys.stderr)
        return 1
    msg = f"VERIFIED HPX-SCP {result['protocol_version']} | rules {len(result['rules'])}"
    if args.show_digest:
        natural = natural_prefix(args.protocol.read_bytes())
        msg += f" | canonical SHA-256 {hashlib.sha256(natural).hexdigest()}"
    print(msg)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
