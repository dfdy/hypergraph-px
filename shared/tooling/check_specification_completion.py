#!/usr/bin/env python3
"""Hypergraph PX — Current specification compatibility entry point

Keep an older command name usable while routing it to the current documentation and source-authority checks.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/check_specification_completion.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Developer commands that still invoke the compatibility specification-check entry point.

Specification:
- [Source-aware documentation checks](../../docs/08-assurance/source-traceability.md)
- [Repository development workflow](../../docs/09-guides/developers/repository-development.md)

Boundary: The historical command name is not a migration ledger or proof of product completion.
"""
from verify_documentation import verify
if __name__ == '__main__':
    verify()
