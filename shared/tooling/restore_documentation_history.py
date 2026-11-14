#!/usr/bin/env python3
"""Explicitly restore hash-bound public historical fixtures from local Git objects.

Never fetches, changes the index or overwrites differing local history. Normal
current-documentation checks do not call this optional historical operation.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
INDEX = 'shared/tooling/protocol/history-fixtures.json'
GROUPS = {'legacy-semantic-protocol': 'docs/engineering/semantic-protocol/'}


def restore(root, group):
    prefix = GROUPS[group]
    index = json.loads((root / INDEX).read_text())
    entries = [e for e in index['files'] if e['original_path'].startswith(prefix)]
    if not entries:
        raise ValueError('Historical fixture group is empty')
    prepared = []
    for entry in entries:
        destination = root / entry['current_path']
        if not entry['current_path'].startswith('.provenance/docs-reorganisation/historical-docs/' + prefix):
            raise ValueError('Historical fixture destination outside its group')
        if not destination.resolve().is_relative_to(root.resolve()):
            raise ValueError('Historical fixture destination escapes repository')
        ref = entry.get('historical_git_ref', '')
        if not re.fullmatch(r'[0-9a-f]{40}:' + re.escape(entry['original_path']), ref):
            raise ValueError('Historical fixture has no exact public Git identity')
        data = subprocess.check_output(['git', 'show', ref], cwd=root)
        if hashlib.sha256(data).hexdigest() != entry['sha256'] or len(data) != entry['bytes']:
            raise ValueError('Historical Git bytes differ from the retained original')
        if destination.exists() and destination.read_bytes() != data:
            raise ValueError('Refusing to overwrite differing local history')
        prepared.append((destination, data))
    created = 0
    for destination, data in prepared:
        if destination.exists(): continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        with destination.open('xb') as target: target.write(data)
        created += 1
    return {'group': group, 'verified': len(entries), 'created': created,
            'limits': 'Historical fixtures only; no current protocol adoption or source publication.'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--group', choices=GROUPS, required=True)
    args = parser.parse_args()
    print(json.dumps(restore(ROOT, args.group), indent=2))
