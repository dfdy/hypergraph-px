#!/usr/bin/env python3
"""Inspect fetched dependency manifests and refresh the resolved licence inventory.

This reports manifests, not an automated legal/security approval. Inspect new
upstream source/build scripts and bundled components before compilation.
"""
import json
from pathlib import Path
import tomllib

root = Path(__file__).resolve().parents[1]
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
(root / 'legal/RUST_DEPENDENCIES.json').write_text(json.dumps(dict(
    reviewed='2026-10-25', scope='Resolved registry manifests; own code AGPL-3.0-only. Bundled SQLite public domain; ring bundled third-party notices reviewed separately. No copied upstream application source.',
    packages=review), indent=2) + '\n')
