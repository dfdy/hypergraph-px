#!/usr/bin/env python3
"""Hypergraph PX — Numbered documentation structure

Keep active documentation inside the nine approved folders and distinguish normal public checks from explicitly requested local-byte verification.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/check_docs_structure.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Documentation validation and isolated structure/archive-boundary fixtures.

Specification:
- [Source-aware documentation checks](../../docs/08-assurance/source-traceability.md)
- [Repository development workflow](../../docs/09-guides/developers/repository-development.md)

Boundary: The optional --check-local path requires explicit archive access; normal validation never loads local originals.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
from audit_documentation import audit
ROOT_FILES = {'README.md', 'package.json', 'package-lock.json', 'likec4.config.json'}
ROOT_DIRS = {'01-purpose', '02-governance', '03-requirements', '04-architecture', '05-domain',
             '06-subsystems', '07-implementation', '08-assurance', '09-guides'}


def fingerprint(path):
    """Hash file bytes or the symlink spelling so optional relocation checks preserve the exact retained representation."""

    data = os.readlink(path).encode() if path.is_symlink() else path.read_bytes()
    return hashlib.sha256(data).hexdigest(), len(data)


def owned(root, value):
    """Reject noncanonical or escaping relocation paths before any optional local payload is read."""

    path = root / value
    if not isinstance(value, str) or Path(value).is_absolute() or '..' in Path(value).parts:
        raise ValueError('Non-canonical relocation path')
    # Dependency .bin symlinks intentionally resolve within the ignored install.
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError('Relocation path escapes repository')
    return path


def validate(root=ROOT, check_local=False):
    """Combine current archive-boundary, root-layout, symlink and ignored-file checks, optionally checking requested originals."""

    errors = audit(root)
    docs = root / 'docs'

    for p in docs.iterdir():
        if p.is_symlink() or (p.is_dir() and p.name not in ROOT_DIRS) or (p.is_file() and p.name not in ROOT_FILES):
            errors.append('Unexpected documentation root item: ' + p.name)
    paths = list(docs.rglob('*'))
    if any(p.is_symlink() for p in paths):
        errors.append('Documentation symlinks are forbidden')
    if any(p.is_dir() and (p.name.startswith('.') or p.name in {'node_modules', 'site', '__pycache__'}) for p in paths):
        errors.append('Local/generated documentation folder')
    ignored = subprocess.run(['git', 'ls-files', '--others', '--ignored', '--exclude-standard', '-z', '--', 'docs'],
                             cwd=root, capture_output=True, check=True).stdout
    if ignored:
        errors.append('Ignored files remain beneath docs')
    # Current structure is independent of completed relocation inventories.
    if check_local:
        manifest = json.loads((root / '.provenance/specification-migration/manifest.json').read_text())

        for entry in manifest['records']:
            path = owned(root, entry['archive_path'])
            if not path.is_file() or fingerprint(path) != (entry['sha256'], entry['bytes']):
                errors.append('Archived original bytes differ: ' + entry['original_path'])
    return errors


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-local', action='store_true')
    args = parser.parse_args()
    errors = validate(check_local=args.check_local)

    for error in errors:
        print('FAIL:', error)
    if errors:
        raise SystemExit(1)
    print('PASS: numbered documentation, active/archive accounting and no ignored docs files' + ('; exact local bytes checked' if args.check_local else '; local bytes not requested'))
