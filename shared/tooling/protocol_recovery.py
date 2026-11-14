#!/usr/bin/env python3
"""Persist small untrusted task checkpoints and recover a verified scoped HPX-SCP packet.

No lifecycle-hook assumption: call `checkpoint` before known compaction and `recover`
afterwards or at session start. The checkpoint is never protocol authority.
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
    state = os.environ.get('XDG_STATE_HOME')
    return ((Path(state) if state else Path.home()/'.local'/'state')/'hpx-scp'/'recovery')


def validate_checkpoint(value: object) -> dict:
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
    if not SESSION.fullmatch(session):
        raise BootstrapError('invalid session ID')
    return state_dir / (session+'.json')


def save_checkpoint(session: str, checkpoint: dict, version: str, state_dir: Path) -> Path:
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
        if os.path.exists(temp):os.unlink(temp)
    return path


def read_checkpoint(session: str, state_dir: Path) -> dict | None:
    path=checkpoint_path(state_dir,session)
    if not path.exists():return None
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
            if a.input is None:raise BootstrapError('checkpoint requires --input')
            raw=a.input.read_bytes()
            if len(raw)>MAX_BYTES:raise BootstrapError('checkpoint too large')
            checkpoint=json.loads(raw.decode('utf-8'),object_pairs_hook=strict_object)
            save_checkpoint(a.session,checkpoint,projection['protocol_version'],a.state_dir)
            print('CHECKPOINT STORED (untrusted task state; no protocol digests in agent context)')
        else:
            if a.input is not None:raise BootstrapError('recover does not accept --input')
            result=recover(a.session,a.scopes,a.state_dir,trusted_sha256=a.trusted_sha256)
            print(json.dumps(result,ensure_ascii=False,separators=(',',':')))
        return 0
    except (BootstrapError,ValueError,OSError) as exc:
        print('RECOVERY REFUSED: '+str(exc),file=sys.stderr)
        return 1

if __name__=='__main__':
    raise SystemExit(main())
