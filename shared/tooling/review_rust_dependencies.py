#!/usr/bin/env python3
"""Hypergraph PX — Resolved Rust dependency provenance inventory

Inspect fetched registry manifests for the exact lockfile packages and write their declared licences, selected alternatives and source checksums.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/review_rust_dependencies.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Developers reviewing Rust dependencies before compilation.

Specification:
- [Licence and dependency provenance](../../docs/02-governance/licensing-policy.md)
- [Repository development workflow](../../docs/09-guides/developers/repository-development.md)

Boundary: This script writes the licence inventory; manifest inspection is not legal/security approval and this documentation update does not run it.
"""
import json
from pathlib import Path
import tomllib

root = Path(__file__).resolve().parents[2]
lock = tomllib.loads((root / 'Cargo.lock').read_text())
roots = list((Path.home() / '.cargo/registry/src').glob('*'))
review = []

for package in lock['package']:
    if 'source' not in package:
        continue
    matches = [r / f"{package['name']}-{package['version']}" / 'Cargo.toml' for r in roots
               if (r / f"{package['name']}-{package['version']}" / 'Cargo.toml').is_file()]
    if len(matches) != 1:
        raise RuntimeError(f"fetch source before review: {package['name']}")
    manifest = tomllib.loads(matches[0].read_text())['package']
    licence = manifest.get('license', '')
    if not licence:
        raise RuntimeError(f"manual licence-file review required: {package['name']}")
    selected = 'MIT' if 'MIT' in licence else 'Apache-2.0' if 'Apache-2.0' in licence else licence
    if ' AND ' in licence:
        selected = licence
    if 'Unicode-3.0' in licence:
        selected = '(MIT AND Unicode-3.0)'
    review.append(dict(name=package['name'], version=package['version'], source=package['source'],
                       checksum=package['checksum'], declared_license=licence,
                       selected_license=selected, repository=manifest.get('repository', '')))
    print(package['name'], package['version'], licence)
(root / 'shared/legal/RUST_DEPENDENCIES.json').write_text(json.dumps(dict(
    reviewed='2026-10-25', scope='Resolved registry manifests; own code AGPL-3.0-only. Bundled SQLite public domain; ring bundled third-party notices reviewed separately. No copied upstream application source.',
    packages=review), indent=2) + '\n')
