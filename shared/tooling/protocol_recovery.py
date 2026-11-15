#!/usr/bin/env python3
"""Hypergraph PX — Untrusted task checkpoint recovery

Bound task checkpoint shape and size, publish private checkpoint files atomically, and pair recovered state with a freshly verified legacy context packet.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/protocol_recovery.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Explicit checkpoint/recover commands and isolated recovery fixtures.

Specification:
- [Current protocol installation and historical boundary](../../docs/09-guides/developers/vernaculum/UPGRADE_2.0.0.md)
- [Commenting standard](../../docs/09-guides/developers/code-comments.md)

Boundary: A checkpoint is untrusted continuity data, never protocol authority or permission to mutate a workspace; this tool is not run for the commenting change.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from pathlib import Path
from bootstrap_semantic_protocol import BootstrapError, PROTOCOL, SCOPES, strict_object, verify_path
from protocol_context import packet_for
from protocol_amendments import validate_registry

FIELDS = ('objective','constraints','decisions','evidence','blockers','changed_files','record_ids','next_action')
LIST_FIELDS = ('constraints','decisions','evidence','blockers','changed_files','record_ids')
SESSION = re.compile(r'[A-Za-z0-9][A-Za-z0-9_-]{0,63}$')
MAX_BYTES=12_000


def state_directory() -> Path:
    """Choose the caller state-home recovery folder without changing the repository or shell profile."""

    state = os.environ.get('XDG_STATE_HOME')
    return ((Path(state) if state else Path.home()/'.local'/'state')/'hpx-scp'/'recovery')


def validate_checkpoint(value: object) -> dict:
    """Reject extra fields, oversized text/lists and malformed task-state data before persistence."""

    if not isinstance(value,dict) or set(value) != set(FIELDS):
        raise BootstrapError('checkpoint has missing or unexpected fields')

    for name in ('objective','next_action'):
        v=value[name]
        if not isinstance(v,str) or not v.strip() or len(v)>2000:
            raise BootstrapError('invalid checkpoint ' + name)

    for name in LIST_FIELDS:
        v=value[name]
        if not isinstance(v,list) or len(v)>40 or any(not isinstance(x,str) or not x.strip() or len(x)>500 for x in v):
            raise BootstrapError('invalid checkpoint ' + name)
    # Do not accept credential-shaped keys or opaque arbitrary extra fields.
    raw=json.dumps(value,ensure_ascii=False).encode('utf-8')
    if len(raw)>MAX_BYTES:
        raise BootstrapError('checkpoint too large')
    return value


def checkpoint_path(state_dir: Path, session: str) -> Path:
    """Constrain a session identifier to one local JSON filename instead of accepting arbitrary paths."""

    if not SESSION.fullmatch(session):
        raise BootstrapError('invalid session ID')
    return state_dir / (session+'.json')


def save_checkpoint(session: str, checkpoint: dict, version: str, state_dir: Path) -> Path:
    """Write validated untrusted state through a private fsynced temporary file and atomic replacement."""

    cp=validate_checkpoint(checkpoint)
    state_dir.mkdir(mode=0o700,parents=True,exist_ok=True)
    os.chmod(state_dir,0o700)
    path=checkpoint_path(state_dir,session)
    if path.is_symlink():
        raise BootstrapError('checkpoint destination must not be a symlink')
    envelope={'protocol':'HPX-SCP','version':version,'state':cp}
    fd,temp=tempfile.mkstemp(prefix='.checkpoint-',dir=state_dir)

    try:
        with os.fdopen(fd,'w',encoding='utf-8') as f:
            json.dump(envelope,f,ensure_ascii=False,separators=(',',':'))
            f.write('\n')
            f.flush()
            os.fsync(f.fileno())
        os.chmod(temp,0o600)
        os.replace(temp,path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
    return path


def read_checkpoint(session: str, state_dir: Path) -> dict | None:
    """Read a bounded nonsymlink checkpoint and validate its exact envelope and task-state shape."""

    path=checkpoint_path(state_dir,session)
    if not path.exists():
        return None
    if path.is_symlink() or path.stat().st_size>MAX_BYTES+400:
        raise BootstrapError('invalid or oversize checkpoint file')

    try:
        value=json.loads(path.read_text(encoding='utf-8'),object_pairs_hook=strict_object)
    except (ValueError,UnicodeError,OSError) as exc:
        raise BootstrapError('invalid checkpoint JSON: '+str(exc)) from exc
    if not isinstance(value,dict) or set(value)!= {'protocol','version','state'} or value['protocol']!='HPX-SCP' or not isinstance(value['version'],str):
        raise BootstrapError('invalid checkpoint envelope')
    validate_checkpoint(value['state'])
    return value


def recover(session: str, scopes: list[str], state_dir: Path, *, protocol: Path=PROTOCOL, trusted_sha256: str|None=None) -> dict:
    """Verify protocol/registry first, then return optional checkpoint state with explicit reconciliation obligations."""

    projection=verify_path(protocol,trusted_sha256)
    validate_registry(projection)
    packet=packet_for(projection,scopes)
    cp=read_checkpoint(session,state_dir)
    return {'protocol_packet':packet,
            'checkpoint': cp,
            'checkpoint_authoritative':False,
            'requires_workspace_reconciliation':True,
            'recovery_status':'verify_sources_and_workspace_before_mutation'}


def main():
    """Dispatch explicit checkpoint or recovery intent and report refusal without treating persisted state as authority."""

    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('action',choices=['checkpoint','recover'])
    p.add_argument('--session',required=True)
    p.add_argument('--input',type=Path,help='checkpoint JSON to store; never include credentials')
    p.add_argument('--for',dest='scopes',action='append',default=[],choices=sorted(SCOPES))
    p.add_argument('--state-dir',type=Path,default=state_directory())
    p.add_argument('--trusted-sha256',help='independently protected digest')
    a=p.parse_args()

    try:
        projection=verify_path(PROTOCOL,a.trusted_sha256)
        validate_registry(projection)
        if a.action=='checkpoint':
            if a.input is None:
                raise BootstrapError('checkpoint requires --input')
            raw=a.input.read_bytes()
            if len(raw)>MAX_BYTES:
                raise BootstrapError('checkpoint too large')
            checkpoint=json.loads(raw.decode('utf-8'),object_pairs_hook=strict_object)
            save_checkpoint(a.session,checkpoint,projection['protocol_version'],a.state_dir)
            print('CHECKPOINT STORED (untrusted task state; no protocol digests in agent context)')
        else:
            if a.input is not None:
                raise BootstrapError('recover does not accept --input')
            result=recover(a.session,a.scopes,a.state_dir,trusted_sha256=a.trusted_sha256)
            print(json.dumps(result,ensure_ascii=False,separators=(',',':')))
        return 0
    except (BootstrapError,ValueError,OSError) as exc:
        print('RECOVERY REFUSED: '+str(exc),file=sys.stderr)
        return 1

if __name__=='__main__':
    raise SystemExit(main())
