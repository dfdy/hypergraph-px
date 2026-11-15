#!/usr/bin/env python3
"""Hypergraph PX — Verified historical semantic context packets

Select minimal legacy HPX-SCP semantic contracts after strict document and amendment verification, without including source prose or digest noise in ordinary output.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/protocol_context.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Explicit legacy context/recovery commands and isolated protocol fixtures.

Specification:
- [Current protocol installation and historical boundary](../../docs/09-guides/developers/vernaculum/UPGRADE_2.0.0.md)
- [Commenting standard](../../docs/09-guides/developers/code-comments.md)

Boundary: This legacy HPX-SCP projection is not the active Vernaculum agreement and is not required reading for ordinary development.
"""
from __future__ import annotations
import argparse
import json
import sys

from bootstrap_semantic_protocol import yaml_bytes
from pathlib import Path
from bootstrap_semantic_protocol import PROTOCOL, SCOPES, BootstrapError, verify_path
from protocol_amendments import validate_registry


def packet_for(projection: dict, scopes: list[str], record_types: list[str] | None = None,
               relations: list[str] | None = None, message_kinds: list[str] | None = None) -> dict:
    """Select known scopes and requested message/record/relation contracts while always retaining baseline rules."""

    requested = set(scopes) | {'kernel', 'baseline'}
    if not requested <= SCOPES:
        raise BootstrapError('unknown requested context scope: ' + ','.join(sorted(requested - SCOPES)))
    type_map = {x['kind']:x for x in projection['record_types']}
    relation_map = {x['name']:x for x in projection['relationship_types']}

    for kind in record_types or []:
        if kind not in type_map:
            raise BootstrapError('unknown record kind: ' + kind)

    for relation in relations or []:
        if relation not in relation_map:
            raise BootstrapError('unknown relation: ' + relation)
    if record_types and 'records' not in requested:
        requested.add('records')
    if relations and 'records' not in requested:
        requested.add('records')
    message_map = {x['kind']:x for x in projection['message_types']}

    for kind in message_kinds or []:
        if kind not in message_map:
            raise BootstrapError('unknown message kind: ' + kind)
    if message_kinds and not requested.intersection({'exchange','negotiation'}):
        requested.add('exchange')
    selected_message_kinds = list(dict.fromkeys(message_kinds or []))
    if not message_kinds:
        if 'exchange' in requested:
            selected_message_kinds = list(message_map)
        elif 'negotiation' in requested:
            selected_message_kinds = ['hello','ready','need','offer']
    packet = {
        'protocol': 'HPX-SCP',
        'version': projection['protocol_version'],
        'verified': True,
        'scopes': sorted(requested),
        'rules': [{'id': r['id'], 'do': r['directive']} for r in projection['rules'] if r['scope'] in requested],
    }
    if selected_message_kinds:
        packet['message_envelope'] = projection['message_envelope']
        packet['message_contracts'] = [message_map[k] for k in selected_message_kinds]
    if record_types:
        packet['record_contracts'] = [type_map[k] for k in dict.fromkeys(record_types)]
    if relations:
        packet['relations'] = [relation_map[r] for r in dict.fromkeys(relations)]
    return packet


def scoped_packet_as_yaml(packet: dict, projection: dict) -> str:
    """Group selected rules by scope and serialize the verified semantic packet without provenance hashes."""

    scope_lookup = {r['id']: r['scope'] for r in projection['rules']}
    grouped = {scope: {} for scope in packet['scopes']}

    for rule in packet['rules']:
        grouped[scope_lookup[rule['id']]][rule['id']] = rule['do']
    payload = {'HPX-SCP': {'version':packet['version'], 'verified':True, 'scopes':grouped}}
    if 'message_contracts' in packet:
        payload['HPX-SCP']['message_envelope'] = {f['name']:f['meaning'] for f in packet['message_envelope']}
        payload['HPX-SCP']['message_kinds'] = {m['kind']:{'required':m['required_body'],'meaning':m['meaning']} for m in packet['message_contracts']}
    if 'record_contracts' in packet:
        payload['HPX-SCP']['records'] = {r['kind']:{'statuses':r['statuses'],
            'required':r['required_content_fields'],'meaning':r['meaning']} for r in packet['record_contracts']}
    if 'relations' in packet:
        payload['HPX-SCP']['relationships'] = {r['name']:r['meaning'] for r in packet['relations']}
    return yaml_bytes(payload).decode('utf-8')


def main():
    """Verify the explicitly selected legacy protocol and registry before emitting YAML or requested legacy JSON context."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--protocol', type=Path, default=PROTOCOL)
    parser.add_argument('--for', dest='scopes', action='append', default=[], choices=sorted(SCOPES))
    parser.add_argument('--record-type', action='append', default=[])
    parser.add_argument('--message-kind', action='append', default=[])
    parser.add_argument('--relation', action='append', default=[])
    parser.add_argument('--trusted-sha256')
    parser.add_argument('--format', choices=('yaml','json'), default='yaml')
    args = parser.parse_args()

    try:
        verified = verify_path(args.protocol, args.trusted_sha256)
        validate_registry(verified)
        result = packet_for(verified, args.scopes, args.record_type, args.relation, args.message_kind)
    except (BootstrapError, OSError) as exc:
        print('CONTEXT REFUSED: ' + str(exc), file=sys.stderr)
        return 1
    if args.format == 'yaml':
        print(scoped_packet_as_yaml(result, verified), end='')
    else:
        print(json.dumps(result, ensure_ascii=False, separators=(',', ':')))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
