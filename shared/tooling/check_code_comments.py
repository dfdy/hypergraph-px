#!/usr/bin/env python3
"""Hypergraph PX — Maintained-code commenting review gate

Keep every maintained source inventoried and bind reviewed batches to exact bytes, reporting incomplete coverage without pretending a presence scan judges readability.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/check_code_comments.py) (publication pending)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Incremental commenting CI, developer closeout checks and isolated comment-gate fixtures.

Specification:
- [Commenting and exact-source review](../../docs/09-guides/developers/code-comments.md)
- [Change-sensitive development evidence](../../docs/09-guides/reference/development-evidence.md)

Boundary: Presence and freshness checks cover selected declarations only; every-function teaching quality, provenance and logical spacing remain review obligations.
"""
from __future__ import annotations

import argparse
import ast
from collections import Counter
from datetime import date
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
INVENTORY = 'shared/tooling/code-comment-inventory.json'
EXTENSIONS = {'.rs', '.js', '.mjs', '.ts', '.py', '.lean', '.sh', '.css', '.html'}
SKIP = {'node_modules', 'target', 'dist', '__pycache__', 'test-results', 'playwright-report'}


def discover(root: Path) -> set[str]:
    """Find authored source without following symlinks or entering local archives.

    Include untracked, non-hidden source so a new file cannot disappear from the
    programme just because its author has not staged it yet. Prune directories
    before descending: dependency trees are both irrelevant and expensive.
    """

    found = set()

    for base, directories, files in os.walk(root, followlinks=False):
        # The owner-provided frontend intake is reference material, not adopted
        # application source. Do not accidentally hide an authored src/incoming.
        directories[:] = sorted(d for d in directories if not d.startswith('.')
                                and d not in SKIP and not (Path(base) / d).is_symlink()
                                and (Path(base) / d).relative_to(root).as_posix() != 'frontend/incoming')

        for name in sorted(files):
            path = Path(base) / name
            if not name.startswith('.') and path.suffix in EXTENSIONS and not path.is_symlink():
                found.add(path.relative_to(root).as_posix())
    return found


def digest(path: Path) -> str:
    """Bind review to exact source bytes, including comments and line endings."""

    return hashlib.sha256(path.read_bytes()).hexdigest()


def unique_object(pairs):
    """Reject duplicate JSON keys instead of silently accepting the last claim."""

    result = {}

    for key, value in pairs:
        if key in result:
            raise ValueError(f'duplicate JSON key: {key}')
        result[key] = value
    return result


def module_documented(text: str, suffix: str) -> bool:
    """Recognise a leading language-appropriate explanation, ignoring licences.

    A SPDX identifier, shebang or encoding declaration establishes provenance or
    execution, not module purpose. This deliberately modest presence check is
    supplemented by human review, not word counts or inferred semantic quality.
    """

    lines = text.splitlines()

    while lines and (not lines[0].strip() or lines[0].startswith('#!')
                     or 'SPDX-License-Identifier:' in lines[0]
                     or re.match(r'^#.*coding[:=]', lines[0])):
        lines.pop(0)
    if suffix == '.lean':
        # Lean module documentation follows imports: /-! itself is a command,
        # so moving it before import would make an otherwise valid file fail.
        while lines and (not lines[0].strip() or re.match(r'^(public )?import\s', lines[0])):
            lines.pop(0)
    first = '\n'.join(lines)
    if suffix == '.html':
        # A standards-mode doctype may legally precede the explanatory comment.
        # Skip only that declaration; markup without a following header still fails.
        first = re.sub(r'(?is)^<!doctype\s+html\b[^>]*>\s*', '', first, count=1)

    if suffix == '.py':
        return bool(ast.get_docstring(ast.parse(text)))
    prefixes = {'.rs': ('//!', '/*!'), '.lean': ('/-!', '/--', '--'),
                '.sh': ('#',), '.css': ('/*',), '.html': ('<!--',)}
    return first.startswith(prefixes.get(suffix, ('/**', '//')))


def python_interfaces(text: str) -> list[dict]:
    """Report public module definitions and methods lacking literal docstrings.

    Ignore nested implementation closures and underscore-prefixed names. Their
    explanation remains part of block-level review; Python's AST supplies exact
    declaration lines without confusing strings with comments or definitions.
    """

    missing = []
    tree = ast.parse(text)

    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            if not node.name.startswith('_') and not ast.get_docstring(node):
                missing.append({'line': node.lineno, 'name': node.name})
            if isinstance(node, ast.ClassDef):
                for method in node.body:
                    if isinstance(method, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        if not method.name.startswith('_') and not ast.get_docstring(method):
                            missing.append({'line': method.lineno, 'name': node.name + '.' + method.name})
    return missing


def validate(root: Path, inventory: dict, require_complete: bool = False) -> dict:
    """Validate scope, dispositions and reviewed content without rewriting them.

    Exact hashes make changed reviewed files fail closed. Authors must inspect
    the changed explanations and explicitly renew review; a successful scanner
    run never promotes a file from pending to reviewed.
    """

    errors = []
    if not isinstance(inventory, dict) or not isinstance(inventory.get('files'), list):
        return {'result': 'fail', 'complete': False, 'errors': ['Inventory must contain a files array']}
    files = inventory['files']
    records = {}
    if inventory.get('version') != 1:
        errors.append('Unsupported inventory version')

    for entry in files:
        if not isinstance(entry, dict):
            errors.append('Inventory entries must be objects')
            continue
        name = entry.get('path', '')
        if not isinstance(name, str) or name in records:
            errors.append(f'Invalid or duplicate inventory path: {name}')
            continue
        records[name] = entry
    actual = discover(root)

    for name in sorted(actual - records.keys()):
        errors.append(f'Uninventoried source: {name}')

    for name in sorted(records.keys() - actual):
        errors.append(f'Missing or out-of-scope source: {name}')
    statuses = Counter()

    for name in sorted(actual & records.keys()):
        entry = records[name]
        status = entry.get('status')
        if not isinstance(status, str):
            errors.append(f'{name}: disposition must be a string')
            continue
        statuses[status] += 1
        if status not in {'pending', 'reviewed', 'excluded'}:
            errors.append(f'{name}: invalid disposition')
            continue
        if not all(isinstance(entry.get(k), str) and entry[k].strip()
                   for k in ('responsibility', 'batch', 'risk', 'reason')):
            errors.append(f'{name}: missing responsibility/batch/risk/reason')
        if status == 'excluded':
            # Exclusion is explicit, never inferred from missing documentation.
            if entry.get('exclusion') not in ('generated', 'third-party') or not isinstance(entry.get('origin'), str) or not entry['origin'].strip():
                errors.append(f'{name}: exclusion requires generation/vendor origin')
            continue
        if status == 'pending':
            if require_complete:
                errors.append(f'{name}: review outstanding')
            continue
        path = root / name
        if entry.get('sha256') != digest(path):
            errors.append(f'{name}: reviewed bytes changed; re-review required')
        if not all(isinstance(entry.get(k), str) and entry[k].strip()
                   for k in ('reviewer', 'reviewed_on', 'review_notes')):
            errors.append(f'{name}: missing review evidence')

        try:
            date.fromisoformat(entry.get('reviewed_on', ''))
        except (TypeError, ValueError):
            errors.append(f'{name}: invalid review date')

        try:
            text = path.read_text(encoding='utf-8')
            if not module_documented(text, path.suffix):
                errors.append(f'{name}: missing module explanation')
            if path.suffix == '.py':
                for missing in python_interfaces(text):
                    errors.append(f'{name}:{missing["line"]}: undocumented public definition {missing["name"]}')
        except (UnicodeError, SyntaxError) as exc:
            errors.append(f'{name}: cannot inspect source: {exc}')
    open_findings = [f for f in inventory.get('findings', []) if f.get('status') == 'open']
    if require_complete:
        errors.extend('Open comment finding: ' + f['id'] for f in open_findings)
    return {'result': 'fail' if errors else 'pass', 'files': len(actual),
            'dispositions': dict(statuses), 'complete': not errors and not statuses['pending'] and not open_findings,
            'errors': errors, 'limits': 'Presence/freshness only; teaching quality requires recorded review.'}



def compare_baseline(inventory: dict, baseline: dict) -> list[str]:
    """Prevent CI from hiding a reviewed file by downgrading its disposition.

    Source removal may be intentional, but it needs a named retirement reason.
    Updating reviewed bytes also needs a fresh explanation of what was inspected;
    copying a new hash while leaving the earlier review untouched is insufficient.
    """

    current = {entry['path']: entry for entry in inventory['files']}
    retired = {entry['path']: entry.get('reason', '').strip()
               for entry in inventory.get('retired', [])}
    errors = []

    for old in baseline.get('files', []):
        if old.get('status') != 'reviewed':
            continue
        name = old['path']
        entry = current.get(name)
        if entry is None:
            if not retired.get(name):
                errors.append(f'{name}: reviewed file removed without a retirement reason')
        elif entry.get('status') != 'reviewed':
            errors.append(f'{name}: reviewed disposition downgraded')
        elif entry.get('sha256') != old.get('sha256') and entry.get('review_notes') == old.get('review_notes'):
            errors.append(f'{name}: changed reviewed bytes need updated review notes')
    return errors


def baseline_at(root: Path, ref: str) -> dict:
    """Read an existing Git inventory without checkout, fetch or branch changes.

    A verified commit with no prior inventory is the bootstrap case. An unknown
    ref is an error, not permission to silently disable regression protection.
    """

    resolved = subprocess.run(['git', 'rev-parse', '--verify', '--end-of-options', ref + '^{commit}'],
                              cwd=root, check=True, capture_output=True, text=True).stdout.strip()
    # Subsequent Git commands receive only the resolved object ID, never an
    # option-like or ambiguous user-supplied reference.
    ref = resolved
    listing = subprocess.run(['git', 'ls-tree', '--name-only', ref, '--', INVENTORY],
                             cwd=root, check=True, capture_output=True, text=True)
    if not listing.stdout.strip():
        return {'files': []}
    content = subprocess.run(['git', 'show', ref + ':' + INVENTORY], cwd=root,
                             check=True, capture_output=True, text=True)
    return json.loads(content.stdout, object_pairs_hook=unique_object)


def main() -> int:
    """Run the read-only gate; JSON is suitable for local or CI evidence.

    The JavaScript helper uses the already pinned TypeScript parser. Python-only
    checks remain available for isolated fixtures; normal CI also checks exported
    JS/TS declarations rather than treating regex matches as a language parser.
    """

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--inventory', default=INVENTORY)
    parser.add_argument('--require-complete', action='store_true')
    parser.add_argument('--json', action='store_true')
    parser.add_argument('--base-ref', help='Existing Git commit for reviewed-coverage regression checks')
    args = parser.parse_args()

    try:
        root = args.root.resolve()
        data = json.loads((root / args.inventory).read_text(), object_pairs_hook=unique_object)
        report = validate(root, data, args.require_complete)
        if args.base_ref:
            report['errors'].extend(compare_baseline(data, baseline_at(root, args.base_ref)))
            if report['errors']:
                report.update(result='fail', complete=False)
        reviewed_js = [e['path'] for e in data['files'] if e['status'] == 'reviewed'
                       and Path(e['path']).suffix in {'.js', '.mjs', '.ts'}]
        if reviewed_js:
            run = subprocess.run(['node', str(ROOT / 'shared/tooling/check_code_comments.mjs'),
                                  '--root', str(root), *reviewed_js], capture_output=True, text=True)
            if run.returncode:
                report['errors'].append(run.stdout.strip() or run.stderr.strip() or 'JavaScript check failed')
                report.update(result='fail', complete=False)
    except (OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        report = {'result': 'fail', 'complete': False, 'errors': [str(exc)]}
    if args.json:
        print(json.dumps(report, indent=2))
    else:
        print(f'Comment programme: {report["result"]}; complete={report["complete"]}')
        print(json.dumps(report.get('dispositions', {}), sort_keys=True))

        for error in report['errors']:
            print('FAIL ' + error)
    return int(report['result'] != 'pass')


if __name__ == '__main__':
    sys.exit(main())
