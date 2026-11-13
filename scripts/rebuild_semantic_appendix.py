#!/usr/bin/env python3
"""Rebuild the subordinate semantic appendix from canonical natural-language text.

Intentional exception: a human-authorised editing workflow can read a mismatched
old appendix to discard it; bootstrap itself remains strictly fail-closed.
"""
from __future__ import annotations
import argparse
import sys
from pathlib import Path

from bootstrap_semantic_protocol import (
    PROTOCOL, DELIMITER, MANIFEST_DELIMITER, BootstrapError, natural_prefix, semantic_projection, machine_from_projection, yaml_bytes, verify_document,
)


def rebuild_bytes(existing: bytes) -> bytes:
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
