#!/usr/bin/env python3
"""Validate HPX-SCP records: JSON, schema, ID/link integrity and supersession cycles.

Requires `jsonschema>=4.18,<5`. Execute from anywhere; paths derive from this file.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'docs' / 'engineering' / 'semantic-protocol'
SCHEMA = BASE / 'schema' / 'record.schema.json'
CANONICAL = BASE / 'records'
EXAMPLES = BASE / 'examples'
EXTENSION_REGISTRY = BASE / 'extensions' / 'registry.json'


class DuplicateKeyError(ValueError):
    pass


def no_duplicate_keys(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            raise DuplicateKeyError(f'duplicate JSON property: {key}')
        out[key] = value
    return out


def read_json(path: Path):
    with path.open(encoding='utf-8') as fh:
        return json.load(fh, object_pairs_hook=no_duplicate_keys)


def load_extensions():
    """Load registered namespaced field validators; only local schemas under BASE."""
    registry = read_json(EXTENSION_REGISTRY)
    if registry.get('registry_version') != 1 or not isinstance(registry.get('extensions'), list):
        raise ValueError('invalid extension registry header')
    out = {}
    for item in registry['extensions']:
        if not isinstance(item, dict) or set(item) != {'key', 'description', 'schema', 'introduced_in', 'status'}:
            raise ValueError('invalid extension registry entry')
        key = item['key']
        if not isinstance(key, str) or not re.fullmatch(r'x\.[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+', key):
            raise ValueError(f'invalid extension key {key!r}')
        if key in out:
            raise ValueError(f'duplicate extension registration: {key}')
        if item['status'] != 'active' or not isinstance(item['description'], str) or not item['description']:
            raise ValueError(f'invalid/inactive extension registration: {key}')
        if not isinstance(item['introduced_in'], str) or not isinstance(item['schema'], str):
            raise ValueError(f'invalid extension registration fields: {key}')
        # Explicitly disallow remote refs, parent traversal and arbitrary local paths.
        relative = Path(item['schema'])
        if relative.is_absolute() or '..' in relative.parts or relative.parts[:2] != ('extensions', 'schemas') or relative.suffix != '.json':
            raise ValueError(f'unsafe extension schema path for {key}: {relative}')
        full_path = (BASE / relative).resolve()
        if not full_path.is_relative_to((BASE / 'extensions' / 'schemas').resolve()):
            raise ValueError(f'extension schema escapes registry area: {key}')
        extension_schema = read_json(full_path)
        Draft202012Validator.check_schema(extension_schema)
        # External $ref would require network/schema resolution; not supported here.
        def refs(value):
            if isinstance(value, dict):
                for k, v in value.items():
                    if k == '$ref' and isinstance(v, str) and not v.startswith('#/'):
                        raise ValueError(f'external or nonlocal $ref not permitted for {key}')
                    refs(v)
            elif isinstance(value, list):
                for v in value:
                    refs(v)
        refs(extension_schema)
        out[key] = Draft202012Validator(extension_schema, format_checker=FormatChecker())
    return out


def check_set(paths: list[Path], validator: Draft202012Validator, label: str, extension_validators=None):
    errors = []
    documents = {}
    if extension_validators is None:
        extension_validators = load_extensions()
    for path in paths:
        try:
            name = str(path.relative_to(ROOT))
        except ValueError:
            name = str(path)
        try:
            record = read_json(path)
        except (OSError, ValueError, json.JSONDecodeError) as exc:
            errors.append(f'{name}: invalid JSON: {exc}')
            continue
        for err in validator.iter_errors(record):
            at = '/'.join(map(str, err.absolute_path)) or '(root)'
            errors.append(f'{name}: {at}: {err.message}')
        if isinstance(record, dict) and isinstance(record.get('extensions'), dict):
            for ext_key, ext_value in record['extensions'].items():
                ext_validator = extension_validators.get(ext_key)
                if ext_validator is None:
                    errors.append(f'{name}: unregistered extension {ext_key}')
                else:
                    for err in ext_validator.iter_errors(ext_value):
                        at = '/'.join(map(str, err.absolute_path)) or '(root)'
                        errors.append(f'{name}: extension {ext_key}/{at}: {err.message}')
        if not isinstance(record, dict) or not isinstance(record.get('id'), str):
            continue
        rid = record['id']
        if path.stem != rid:
            errors.append(f'{name}: filename must be {rid}.json')
        if rid in documents:
            errors.append(f'{name}: duplicate record ID {rid}')
        documents[rid] = record
    for rid, rec in documents.items():
        for rel in (rec.get('relations') if isinstance(rec.get('relations'), list) else []):
            if not isinstance(rel, dict):
                continue
            target = rel.get('target')
            if isinstance(target, str) and target not in documents:
                errors.append(f'{rid}: dangling relation target {target} (in {label})')
        if rec.get('kind') == 'protocol_change' and rec.get('status') == 'applied':
            content = rec.get('content', {})
            auth = content.get('authorisation', {}) if isinstance(content, dict) else {}
            ref = auth.get('ref') if isinstance(auth, dict) else None
            if auth.get('basis') == 'owner_review':
                sources = rec.get('source_refs', [])
                approvals = {r.get('ref') for r in sources if isinstance(r, dict) and r.get('role') == 'approval'}
                if ref not in approvals:
                    errors.append(f'{rid}: owner approval ref must match a source_refs approval reference')
        if rec.get('kind') == 'decision':
            content = rec.get('content')
            approval_ref = content.get('approval_ref') if isinstance(content, dict) else None
            sources = rec.get('source_refs') if isinstance(rec.get('source_refs'), list) else []
            candidates = {r.get('ref') for r in sources if isinstance(r, dict) and r.get('role') == 'approval'}
            if approval_ref not in candidates:
                errors.append(f'{rid}: decision approval_ref must match a source_refs approval reference')
    # Supersedes must be acyclic. Traverse graph; no external graph library required.
    edges = defaultdict(list)
    for rid, rec in documents.items():
        for rel in (rec.get('relations') if isinstance(rec.get('relations'), list) else []):
            if isinstance(rel, dict) and rel.get('type') == 'supersedes' and rel.get('target') in documents:
                edges[rid].append(rel['target'])
    colors = {}
    def visit(node, stack):
        if colors.get(node) == 1:
            errors.append('supersedes cycle: ' + ' -> '.join(stack + [node]))
            return
        if colors.get(node) == 2:
            return
        colors[node] = 1
        for child in edges[node]:
            visit(child, stack + [node])
        colors[node] = 2
    for rid in documents:
        if not colors.get(rid):
            visit(rid, [])
    return errors, len(documents)


def enforce_protocol_bootstrap():
    """Load no record schema or semantic records until the canonical prose gate passes."""
    implementation = ROOT / 'scripts' / 'bootstrap_semantic_protocol.py'
    spec = importlib.util.spec_from_file_location('hpx_scp_bootstrap_gate', implementation)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.verify_path()


def validate(include_examples=True):
    enforce_protocol_bootstrap()
    schema = read_json(SCHEMA)
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors = []
    counts = {}
    extensions = load_extensions()
    for label, folder in [('canonical', CANONICAL), ('examples', EXAMPLES)]:
        if label == 'examples' and not include_examples:
            continue
        found = sorted(folder.glob('*.json'))
        issues, n = check_set(found, validator, label, extensions)
        counts[label] = n
        errors.extend(issues)
    return errors, counts


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--no-examples', action='store_true', help='check canonical records only')
    args = p.parse_args()
    try:
        errors, counts = validate(not args.no_examples)
    except (ValueError, OSError) as exc:
        print(f'BOOTSTRAP REFUSED: {exc}', file=sys.stderr)
        return 1
    for error in errors:
        print('ERROR:', error, file=sys.stderr)
    print('HPX-SCP records:', ', '.join(f'{key}={val}' for key, val in counts.items()), f'; errors={len(errors)}')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
