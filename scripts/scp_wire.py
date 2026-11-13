#!/usr/bin/env python3
"""HPX-SCP reference message validator and stdin/stdout YAML adapter.

SCP prompts and replies must be sent as literal YAML through a permitted agent
channel. Local files are optional validation adapters, not prompt substitutes.
Verification runs outside model context. Not an agent runner or secure transport.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
import uuid
import zipfile
from pathlib import Path

from bootstrap_semantic_protocol import (PROTOCOL, BootstrapError, strict_yaml, yaml_bytes,
                                         verify_path, verify_document, natural_prefix, strict_object)
from protocol_amendments import validate_registry

ID = re.compile(r'[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}\Z')
HEX = re.compile(r'[0-9a-f]{64}\Z')
MAX_MESSAGE_BYTES = 65536
MAX_BUNDLE_BYTES = 2000000
REPLY_KINDS = {'ready', 'need', 'offer', 'response', 'clarification', 'error'}
CONTROL_KINDS = {'hello', 'ready', 'need', 'offer'}
BODY_STATUS = {'completed', 'partial', 'failed', 'blocked'}
REQUIRED_ENVELOPE = {'scp','version','kind','id','sender','recipient','conversation','body'}
OPTIONAL_ENVELOPE = {'reply_to','refs'}


def verified(protocol: Path = PROTOCOL) -> dict:
    projection = verify_path(protocol)
    # validate shared amendments for active installation; other locations are staged only
    if protocol.resolve() == PROTOCOL.resolve():
        validate_registry(projection)
    return projection


def fingerprint(protocol: Path) -> str:
    return hashlib.sha256(natural_prefix(protocol.read_bytes())).hexdigest()


def clean_id(value: str, label: str) -> str:
    if not isinstance(value, str) or not ID.fullmatch(value):
        raise BootstrapError(f'invalid {label}')
    return value


def new_message(kind: str, sender: str, recipient: str, conversation: str,
                version: str, body: dict, reply_to: str | None = None) -> dict:
    msg={'scp':'HPX-SCP','version':version,'kind':kind,'id':'m-'+uuid.uuid4().hex,
         'sender':clean_id(sender,'sender'),'recipient':clean_id(recipient,'recipient'),
         'conversation':clean_id(conversation,'conversation'),'body':body}
    if reply_to:msg['reply_to']=clean_id(reply_to,'reply_to')
    return msg


def validate_message(raw: bytes | dict, projection: dict, *, compatible: bool = True) -> dict:
    if isinstance(raw, bytes):
        if len(raw)>MAX_MESSAGE_BYTES:
            raise BootstrapError('message exceeds size limit')
        value = strict_yaml(raw)
    else:
        value = raw
    if not isinstance(value, dict) or not REQUIRED_ENVELOPE <= value.keys() or not value.keys() <= REQUIRED_ENVELOPE | OPTIONAL_ENVELOPE:
        raise BootstrapError('invalid message envelope')
    if value['scp'] != 'HPX-SCP':
        raise BootstrapError('not an HPX-SCP message')
    if not isinstance(value['version'],str) or not re.fullmatch(r'\d+\.\d+\.\d+',value['version']):
        raise BootstrapError('invalid message protocol version')
    if compatible and value['version'] != projection['protocol_version']:
        raise BootstrapError('incompatible protocol version')
    for field in ('id','sender','recipient','conversation'):
        clean_id(value[field],field)
    if 'reply_to' in value:
        clean_id(value['reply_to'],'reply_to')
    if value['kind'] not in {x['kind'] for x in projection['message_types']}:
        raise BootstrapError('unknown message kind')
    if value['kind'] in REPLY_KINDS and 'reply_to' not in value:
        raise BootstrapError('reply_to is required for this message kind')
    if value['kind'] == 'hello' and 'reply_to' in value:
        raise BootstrapError('hello must not be a reply')
    body=value['body']
    if not isinstance(body,dict) or any(not isinstance(k,str) for k in body):
        raise BootstrapError('message body must be a string-keyed mapping')
    contract=next(x for x in projection['message_types'] if x['kind']==value['kind'])
    for key in contract['required_body']:
        if key not in body or body[key] is None or (isinstance(body[key],str) and not body[key].strip()):
            raise BootstrapError('missing required message body: '+key)
    if value['kind']=='hello' and (not isinstance(body['fingerprint'],str) or not HEX.fullmatch(body['fingerprint'])):
        raise BootstrapError('invalid discovery fingerprint')
    if value['kind']=='ready' and body['accepted_version']!=value['version']:
        raise BootstrapError('ready accepted_version mismatch')
    if value['kind']=='response' and body['status'] not in BODY_STATUS:
        raise BootstrapError('unsupported response status')
    if 'refs' in value and (not isinstance(value['refs'],list) or len(value['refs'])>80 or
            any(not isinstance(x,str) or not x.strip() or len(x)>256 for x in value['refs']) or
            len(set(value['refs']))!=len(value['refs'])):
        raise BootstrapError('invalid message references')
    return value


def state_root() -> Path:
    return Path(os.environ.get('XDG_STATE_HOME',str(Path.home()/'.local/state')))/'hpx-scp'/'wire'


def session_path(root: Path, conversation: str, local: str, remote: str) -> Path:
    fields=[clean_id(conversation,'conversation'),clean_id(local,'local'),clean_id(remote,'remote')]
    key=hashlib.sha256(json.dumps(fields,separators=(',',':')).encode('utf-8')).hexdigest()
    return root/(key+'.json')


def state_read(root: Path, conversation: str, local: str, remote: str) -> dict | None:
    path=session_path(root,conversation,local,remote)
    if not path.exists():return None
    if path.is_symlink() or path.stat().st_size>15000:
        raise BootstrapError('invalid state file')
    try:
        obj=json.loads(path.read_text(encoding='utf-8'),object_pairs_hook=strict_object)
    except (ValueError,UnicodeError) as exc:
        raise BootstrapError('malformed session state') from exc
    if not isinstance(obj,dict) or obj.get('conversation')!=conversation or obj.get('local')!=local or obj.get('remote')!=remote:
        raise BootstrapError('session identity mismatch')
    return obj


def state_write(root: Path, value: dict) -> None:
    root.mkdir(parents=True,exist_ok=True,mode=0o700)
    os.chmod(root,0o700)
    p=session_path(root,value['conversation'],value['local'],value['remote'])
    if p.is_symlink():raise BootstrapError('refuse symlink session state')
    fd,tmp=tempfile.mkstemp(prefix='.wire-',dir=root)
    try:
        with os.fdopen(fd,'w',encoding='utf-8') as handle:
            json.dump(value,handle,separators=(',',':'),ensure_ascii=False)
            handle.write('\n')
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(tmp,0o600)
        os.replace(tmp,p)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)


def state_new(message: dict, local: str, remote: str, fp: str, status: str) -> dict:
    return {'conversation':message['conversation'],'local':local,'remote':remote,
            'version':message['version'],'fingerprint':fp,'status':status,
            'hello_id':message['id'],'seen':[message['id']]}


def require_active(root: Path, msg: dict, local: str, outgoing: bool, expected_fingerprint: str) -> dict:
    remote=msg['recipient'] if outgoing else msg['sender']
    session=state_read(root,msg['conversation'],local,remote)
    if not session or session['status']!='ready' or session['version']!=msg['version'] or session['fingerprint']!=expected_fingerprint:
        raise BootstrapError('no verified ready session for peer and version')
    if msg['kind'] in CONTROL_KINDS:
        raise BootstrapError('control messages use negotiation commands')
    if msg['id'] in session['seen']:
        raise BootstrapError('duplicate or replayed message ID')
    if 'reply_to' in msg and msg['reply_to'] not in session['seen']:
        raise BootstrapError('reply_to is not known in this session')
    if outgoing and msg['sender']!=local or not outgoing and msg['recipient']!=local:
        raise BootstrapError('local sender/recipient mismatch')
    session['seen'].append(msg['id'])
    if len(session['seen'])>1000:
        raise BootstrapError('session replay log full: start new conversation')
    return session


def read_input(path: Path) -> bytes:
    if str(path) == '-':
        raw = sys.stdin.buffer.read(MAX_MESSAGE_BYTES + 1)
        if len(raw) > MAX_MESSAGE_BYTES:
            raise BootstrapError('input message exceeds size limit')
        return raw
    return path.read_bytes()


def write_yaml(path: Path, msg: dict) -> bool:
    """Output the *actual YAML*. True means stdout; never mix status with YAML."""
    data = yaml_bytes(msg)
    if str(path) == '-':
        sys.stdout.buffer.write(data)
        return True
    if path.exists() or path.is_symlink():raise BootstrapError('refusing to overwrite existing message')
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(data)
    return False


def run(args):
    projection=verified(args.protocol)
    ver=projection['protocol_version']
    fp=fingerprint(args.protocol)
    state=args.state_dir
    action=args.action
    if action=='hello':
        msg=new_message('hello',args.sender,args.recipient,args.conversation,ver,{'fingerprint':fp})
        validate_message(msg,projection)
        s=state_new(msg,args.sender,args.recipient,fp,'awaiting_ready')
        state_write(state,s)
        stdout=write_yaml(args.output,msg)
        return None if stdout else f'DISCOVERY HELLO CREATED: {args.output} (send YAML content, not this path)'
    if action=='answer-hello':
        hello=validate_message(read_input(args.input),projection,compatible=False)
        if hello['kind']!='hello' or hello['recipient']!=args.local:
            raise BootstrapError('expected hello addressed to local agent')
        match=hello['version']==ver and hello['body']['fingerprint']==fp
        kind='ready' if match else 'need'
        body={'accepted_version':ver} if match else {'reason':'protocol_version_or_content_diverges'}
        reply=new_message(kind,args.local,hello['sender'],hello['conversation'],ver,body,hello['id'])
        validate_message(reply,projection)
        if match:
            s=state_new(hello,args.local,hello['sender'],fp,'ready')
            s['seen'].append(reply['id'])
            state_write(state,s)
        stdout=write_yaml(args.output,reply)
        return None if stdout else ('READY' if match else 'NEED PROTOCOL BUNDLE')+f': {args.output}'
    if action=='accept-ready':
        response=validate_message(read_input(args.input),projection,compatible=False)
        if response['kind'] not in ('ready','need') or response['recipient']!=args.local:
            raise BootstrapError('expected ready/need addressed to local agent')
        s=state_read(state,response['conversation'],args.local,response['sender'])
        if not s or s['status']!='awaiting_ready' or s['hello_id']!=response['reply_to']:
            raise BootstrapError('ready reply is not bound to pending discovery')
        if response['kind']=='need':
            return 'PEER NEEDS PROTOCOL: transfer a verified bundle out of agent context; no session opened'
        if response['version']!=ver or response['body']['accepted_version']!=ver or s['fingerprint']!=fp:
            raise BootstrapError('incompatible readiness acknowledgement')
        s['status']='ready'
        s['seen'].append(response['id'])
        state_write(state,s)
        return 'SESSION READY: bidirectional validated YAML messages may be exchanged'
    if action=='offer':
        msg=new_message('offer',args.sender,args.recipient,args.conversation,ver,{'bundle_ref':args.bundle_ref},args.reply_to)
        validate_message(msg,projection)
        stdout=write_yaml(args.output,msg)
        return None if stdout else f'PROTOCOL OFFER CREATED: {args.output}'
    if action=='bundle':
        if str(args.output)=='-':
            raise BootstrapError('protocol bundles require a real output file, not inline task YAML')
        if args.output.exists():raise BootstrapError('refusing to overwrite bundle')
        with zipfile.ZipFile(args.output,'x',compression=zipfile.ZIP_DEFLATED) as z:
            z.writestr('PROTOCOL.md',args.protocol.read_bytes())
        return f'COMPLETE PROTOCOL BUNDLE CREATED: {args.output}; transmit by permitted channel, not model prompt'
    if action=='inspect-bundle':
        if str(args.input)=='-':
            raise BootstrapError('inspect-bundle requires an explicit bundle file')
        if args.input.stat().st_size>MAX_BUNDLE_BYTES:
            raise BootstrapError('bundle is too large')
        with zipfile.ZipFile(args.input,'r') as z:
            if z.namelist()!=['PROTOCOL.md'] or z.getinfo('PROTOCOL.md').file_size>MAX_BUNDLE_BYTES:
                raise BootstrapError('unexpected bundle content')
            raw=z.read('PROTOCOL.md')
        incoming=verify_document(raw)
        if args.expected_fingerprint and hashlib.sha256(natural_prefix(raw)).hexdigest()!=args.expected_fingerprint:
            raise BootstrapError('bundle does not match offered protocol fingerprint')
        args.stage_dir.mkdir(parents=True,exist_ok=True)
        target=args.stage_dir/'PROTOCOL.md'
        if target.exists() or target.is_symlink():raise BootstrapError('staging target already exists')
        target.write_bytes(raw)
        return (f'STAGED VERIFIED BUNDLE {incoming["protocol_version"]}: {target}; '
                'not activated; local trust/compatibility approval still required')
    if action=='send':
        # Read a kind-specific YAML body from stdin by default (or a local file).
        body=strict_yaml(read_input(args.body_file))
        msg=new_message(args.kind,args.sender,args.recipient,args.conversation,ver,body,args.reply_to)
        msg=validate_message(msg,projection)
        s=require_active(state,msg,args.sender,True,fp)
        stdout=write_yaml(args.output,msg)
        state_write(state,s)
        return None if stdout else f'YAML {args.kind.upper()} WRITTEN: {args.output}; send the YAML text, not the path'
    if action=='receive':
        msg=validate_message(read_input(args.input),projection)
        s=require_active(state,msg,args.local,False,fp)
        state_write(state,s)
        # Explicitly emit the validated message, not its location. The recipient
        # must receive the actual YAML content in order to interpret the prompt.
        sys.stdout.buffer.write(yaml_bytes(msg))
        return None
    raise BootstrapError('unknown exchange command')


def main() -> int:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('action',choices=['hello','answer-hello','accept-ready','offer','bundle','inspect-bundle','send','receive'])
    p.add_argument('--protocol',type=Path,default=PROTOCOL)
    p.add_argument('--state-dir',type=Path,default=state_root())
    p.add_argument('--sender')
    p.add_argument('--recipient')
    p.add_argument('--local')
    p.add_argument('--conversation')
    p.add_argument('--input',type=Path,default=Path('-'),help="YAML input path or '-' for stdin (default)")
    p.add_argument('--output',type=Path,default=Path('-'),help="YAML output path or '-' for stdout (default)")
    p.add_argument('--kind',choices=['request','response','clarification','error','handoff','amendment_notice'])
    p.add_argument('--body-file',type=Path,default=Path('-'),help="YAML body input or '-' for stdin (default)")
    p.add_argument('--reply-to')
    p.add_argument('--bundle-ref')
    p.add_argument('--stage-dir',type=Path)
    p.add_argument('--expected-fingerprint')
    a=p.parse_args()
    try:
        args_for={
            'hello':('sender','recipient','conversation'),
            'answer-hello':('local',),
            'accept-ready':('local',),
            'offer':('sender','recipient','conversation','reply_to','bundle_ref'),
            'bundle':('output',),
            'inspect-bundle':('input','stage_dir'),
            'send':('sender','recipient','conversation','kind'),
            'receive':('local',),
        }
        for field in args_for[a.action]:
            if getattr(a,field) is None:raise BootstrapError('missing --'+field.replace('_','-'))
        result=run(a)
        if result is not None:
            print(result)
    except (BootstrapError,ValueError,OSError,zipfile.BadZipFile,KeyError) as exc:
        print('EXCHANGE REFUSED: '+str(exc),file=sys.stderr)
        return 1
    return 0

if __name__=='__main__':
    raise SystemExit(main())
