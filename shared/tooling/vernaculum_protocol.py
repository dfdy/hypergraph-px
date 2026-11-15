"""Hypergraph PX — Exact engineering-protocol reader

Read the installed engineering communication contract only after verifying its approved full-byte digest.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/vernaculum_protocol.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Engineering agents reloading the protocol and isolated reader/tampering tests.

Specification:
- [Protocol installation and agreement boundary](../../docs/09-guides/developers/vernaculum/UPGRADE_2.0.0.md)
- [Active protocol](protocol/PROTOCOL.md)

Boundary: --check verifies identity without loading the full text into an agent context; reading does not negotiate or adopt a peer session.
"""
from pathlib import Path
import argparse
import hashlib
import sys

ROOT = Path(__file__).resolve().parents[2]
PROTOCOL = ROOT / "shared/tooling/protocol/PROTOCOL.md"
SHA256 = "a36b882c56c2355c42945fe8be93eab416cfcd8ead084fb9c066514a05717632"


def read_protocol(path: Path = PROTOCOL) -> bytes:
    """Return exact installed bytes only when their SHA256 matches the approved protocol pin."""

    data = path.read_bytes()
    if hashlib.sha256(data).hexdigest() != SHA256:
        raise ValueError("Installed Vernaculum protocol SHA256 differs from the approved pin")
    return data


def main() -> None:
    """Print the whole verified protocol or an explicitly requested digest-only check, failing without a fallback on missing/tampered bytes."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check exact bytes without printing the full protocol")
    args = parser.parse_args()

    try:
        data = read_protocol()
    except (OSError, ValueError) as error:
        parser.exit(1, str(error) + "\n")
    if args.check:
        print("PASS: installed Vernaculum SCP:MS 2.0.0 SHA256 " + SHA256)
    else:
        sys.stdout.buffer.write(data)


if __name__ == "__main__":
    main()
