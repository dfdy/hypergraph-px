#!/usr/bin/env python3
"""Validate and maintain the shared HPX-SCP amendment index outside model context.

Routine output contains identifiers/versions, not SHA-256 digests. Sync is an
explicit maintenance step, never an implicit way to make stale records valid.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from pathlib import Path
from bootstrap_semantic_protocol import BootstrapError, PROTOCOL, strict_object, verify_path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'docs' / 'engineering' / 'semantic-protocol'
INDEX = BASE / 'amendments' / 'registry.json'
ID_PATTERN = re.compile(r'HPX-PROTO-\d{8}-[a-z0-9][a-z0-9-]*$')


def load_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding='utf-8'), object_pairs_hook=strict_object)
    except (ValueError, UnicodeError, OSError) as exc:
        raise BootstrapError(f'invalid shared amendment material: {path.name}: {exc}') from exc
    if not isinstance(value, dict):
        raise BootstrapError(f'expected JSON object: {path.name}')
    return value


def canonical_records(base: Path) -> dict:
    records = {}
    for path in sorted((base / 'records').glob('*.json')):
        obj = load_json(path)
        if obj.get('kind') != 'protocol_change' or obj.get('status') != 'applied':
            continue
        rid = obj.get('id')
        if not isinstance(rid, str) or not ID_PATTERN.fullmatch(rid) or path.name != f'{rid}.json':
            raise BootstrapError('invalid persistent applied protocol change identity')
        if rid in records:
            raise BootstrapError('duplicate applied protocol change identity')
        content = obj.get('content', {})
        if not isinstance(content, dict) or not isinstance(content.get('validation'), dict) or content['validation'].get('outcome') != 'pass':
            raise BootstrapError('applied protocol change has no passing validation record: ' + rid)
        auth = content.get('authorisation')
        if not isinstance(auth, dict) or auth.get('basis') not in ('standing_delegation', 'owner_review'):
            raise BootstrapError('applied protocol change has no valid authorisation: ' + rid)
        if content.get('change_class') in ('governance','breaking') and auth.get('basis') != 'owner_review':
            raise BootstrapError('breaking or governance change needs owner approval: ' + rid)
        records[rid] = obj
    return records


def validate_registry(projection: dict, *, root: Path | None = None, allow_unindexed: set[str] | None = None, allow_stale_version: bool = False) -> dict:
    """Return verified registry; abort on stale/missing/extra applied records."""
    base = (root or ROOT) / 'docs' / 'engineering' / 'semantic-protocol'
    registry = load_json(base / 'amendments' / 'registry.json')
    if set(registry) != {'registry_version','protocol_version','amendments'}:
        raise BootstrapError('invalid shared amendment registry envelope')
    if registry.get('registry_version') != 1:
        raise BootstrapError('unsupported shared amendment registry version')
    current, target = registry.get('protocol_version'), projection['protocol_version']
    if current != target:
        if not allow_stale_version:
            raise BootstrapError('shared amendment registry version mismatch')
        def semver(v):
            if not isinstance(v, str) or not re.fullmatch(r'\d+\.\d+\.\d+', v):
                raise BootstrapError('invalid shared amendment registry protocol version')
            return tuple(map(int, v.split('.')))
        if semver(current) > semver(target):
            raise BootstrapError('cannot sync shared amendment registry backwards')
    entries = registry.get('amendments')
    if not isinstance(entries, list):
        raise BootstrapError('invalid shared amendment list')
    applied = canonical_records(base)
    found = set()
    for entry in entries:
        if not isinstance(entry, dict) or set(entry) != {'id','record_path','introduced_in','status'}:
            raise BootstrapError('invalid shared amendment registry entry')
        rid = entry['id']
        if not isinstance(rid, str) or not ID_PATTERN.fullmatch(rid) or rid in found:
            raise BootstrapError('duplicate or invalid shared amendment identity')
        found.add(rid)
        if entry['status'] != 'applied' or entry['record_path'] != f'records/{rid}.json':
            raise BootstrapError('invalid shared amendment record path or status: ' + rid)
        if rid not in applied:
            raise BootstrapError('missing or non-applied shared amendment record: ' + rid)
        if entry['introduced_in'] != applied[rid]['protocol_version']:
            raise BootstrapError('shared amendment version diverges from record: ' + rid)
    unexpected = set(applied) - found - (allow_unindexed or set())
    if unexpected or (found - set(applied)):
        raise BootstrapError('unindexed applied protocol change(s): ' + ', '.join(sorted(unexpected)))
    return registry


def atomic_json(path: Path, obj: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(prefix='.amend-registry-', dir=path.parent)
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as out:
            json.dump(obj,out,indent=2,ensure_ascii=False)
            out.write('\n')
            out.flush()
            os.fsync(out.fileno())
        os.replace(temp,path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def sync(projection: dict, *, register: str | None = None, root: Path = ROOT) -> dict:
    """Explicit update, following authorised canonical edits and regeneration.

    Only the version and an explicitly chosen *applied* change are synced.
    Concurrent modifications must additionally be protected by repository review.
    """
    base = root / 'docs' / 'engineering' / 'semantic-protocol'
    old = validate_registry(projection, root=root, allow_unindexed={register} if register else None, allow_stale_version=True)
    amended = dict(old)
    amended['protocol_version'] = projection['protocol_version']
    amended['amendments'] = list(old['amendments'])
    if register:
        applied = canonical_records(base)
        if register not in applied:
            raise BootstrapError('cannot register missing or non-applied protocol change: ' + register)
        if register not in {e['id'] for e in amended['amendments']}:
            amended['amendments'].append({
                'id': register,
                'record_path': f'records/{register}.json',
                'introduced_in': applied[register]['protocol_version'],
                'status': 'applied'
            })
            amended['amendments'].sort(key=lambda e: e['id'])
    # Check all invariant constraints without touching committed registry until valid.
    tmp = base / 'amendments' / 'registry.json'
    existing = load_json(tmp)
    if existing != old:
        raise BootstrapError('registry changed concurrently before sync')
    # Do not rewrite if an applied record is unregistered (use --register first).
    if {e['id'] for e in amended['amendments']} != set(canonical_records(base)):
        raise BootstrapError('cannot sync: unindexed applied change; use sync --register <id>')
    atomic_json(tmp,amended)
    return validate_registry(projection, root=root)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', nargs='?', choices=['validate','list','sync'], default='validate')
    parser.add_argument('--register', help='ID of newly applied canonical protocol_change (with sync)')
    parser.add_argument('--trusted-sha256',help='external trust anchor; never emitted in ordinary output')
    args = parser.parse_args()
    try:
        projection=verify_path(PROTOCOL,args.trusted_sha256)
        if args.action=='sync':
            sync(projection,register=args.register)
        elif args.register:
            raise BootstrapError('--register requires sync')
        registry=validate_registry(projection)
        if args.action=='list':
            print(json.dumps({'protocol':'HPX-SCP','version':registry['protocol_version'],
                              'amendments':[{'id':e['id'],'introduced_in':e['introduced_in']} for e in registry['amendments']]},
                             ensure_ascii=False,separators=(',',':')))
        else:
            print(f"VERIFIED shared amendments | protocol {registry['protocol_version']} | applied {len(registry['amendments'])}")
        return 0
    except (BootstrapError,OSError) as exc:
        print(f'AMENDMENTS REFUSED: {exc}',file=sys.stderr)
        return 1

if __name__ == '__main__':
    raise SystemExit(main())
