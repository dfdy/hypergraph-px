#!/usr/bin/env python3
"""Hypergraph PX — Legacy semantic appendix regeneration

Derive the subordinate YAML projection and its two digest bindings from authoritative legacy natural-language bytes during an explicit editing workflow.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/rebuild_semantic_appendix.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Explicit legacy protocol maintenance and isolated regeneration/tampering tests.

Specification:
- [Current protocol installation and historical boundary](../../docs/09-guides/developers/vernaculum/UPGRADE_2.0.0.md)
- [Commenting standard](../../docs/09-guides/developers/code-comments.md)

Boundary: Regeneration intentionally discards a stale appendix, but must verify the rebuilt document before replacement; this does not authorize active-protocol changes.
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

from bootstrap_semantic_protocol import (
    PROTOCOL, DELIMITER, MANIFEST_DELIMITER, BootstrapError, natural_prefix, semantic_projection, machine_from_projection, yaml_bytes, verify_document,
)


def rebuild_bytes(existing: bytes) -> bytes:
    """Keep exact natural prose, reject unsupported encodings/line endings and derive its semantic appendix plus digest manifest."""

    prefix = natural_prefix(existing) if DELIMITER in existing else existing
    if b'\r' in prefix or prefix.startswith(b'\xef\xbb\xbf'):
        raise BootstrapError('natural-language text must use LF, UTF-8 without BOM')
    if DELIMITER in prefix:
        raise BootstrapError('delimiter found inside natural-language text')
    if not prefix.endswith(b'\n'):
        raise BootstrapError('natural-language text must end with LF')
    projection = semantic_projection(prefix)
    encoded = yaml_bytes(machine_from_projection(projection)).rstrip(b"\n")
    import hashlib
    manifest = {'natural_sha256': hashlib.sha256(prefix).hexdigest(),
                'machine_sha256': hashlib.sha256(encoded).hexdigest()}
    manifest_bytes = yaml_bytes(manifest).rstrip(b"\n")
    return (prefix + DELIMITER + b'```yaml\n' + encoded + b'\n```\n'
            + MANIFEST_DELIMITER + b'```yaml\n' + manifest_bytes + b'\n```\n')


def main():
    """Build and verify replacement bytes before atomically replacing the selected legacy document; clean temporary output on failure."""

    parser = argparse.ArgumentParser()
    parser.add_argument('--protocol', type=Path, default=PROTOCOL)
    args = parser.parse_args()

    try:
        # No modification if generation fails; safe local write/replace.
        original = args.protocol.read_bytes()
        rebuilt = rebuild_bytes(original)
        verify_document(rebuilt)
        tmp = args.protocol.with_name(args.protocol.name + '.tmp')

        try:
            tmp.write_bytes(rebuilt)
            tmp.replace(args.protocol)
        finally:
            if tmp.exists():
                tmp.unlink()
    except (BootstrapError, OSError, UnicodeError, ValueError) as exc:
        print(f'REBUILD REFUSED: {exc}', file=sys.stderr)
        return 1
    print(f'Semantic appendix generated from canonical prose: {args.protocol}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
