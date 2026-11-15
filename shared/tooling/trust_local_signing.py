#!/usr/bin/env python3
"""Hypergraph PX — Exact local signing-leaf trust installation

Apply the previously approved codeSign trust policy only to the pinned public leaf and verify unrelated user trust entries remain unchanged.

Source: [Latest source on GitHub](https://github.com/dfdy/hypergraph-px/blob/main/shared/tooling/trust_local_signing.py)

Agent provenance: Agent creation unverified; original creator not recorded.
Created: Unknown (not recorded).
Creation harness: Unknown (not recorded).
Creation model: Unknown (not recorded).

Latest editing agent: Codex (OpenAI coding agent), /root/tooling_comments.
Latest editing harness: Codex; version/build: Unknown (not exposed).
Latest editing model: OpenAI; exact identifier/revision: Unknown (not exposed).
Last edited: 2026-11-15 (UTC).

Used by: Owner-authorized macOS signing trust setup, not routine application or documentation checks.

Specification:
- [Local signing policy](../../docs/04-architecture/decisions/0016-local-development-signing.md)
- [Development workflow](../../docs/09-guides/developers/repository-development.md)

Boundary: Execution changes the user trust store and needs separate authorization; it is not run here and does not install browser TLS trust.
"""
import hashlib
import json
import os
from pathlib import Path
import plistlib
import subprocess
import tempfile
import time

ROOT=Path(__file__).resolve().parents[2]
FOLDER=ROOT/'.local/credentials/signing'
APPROVED='76e90b6b05a67bb7cd1649d2dcdb7a13de40b03eb5b5ce46c1a94de0508593a4'
def run(args):
    """Run one trust-management command and fail on its nonzero status instead of proceeding with uncertain trust state."""

    result=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors='replace').strip())
def main():
    """Check the exact approved certificate, preserve prior trust settings and remove new leaf trust if policy-scope verification fails."""

    os.umask(0o077)
    data=(FOLDER/'certificate.der').read_bytes()
    if hashlib.sha256(data).hexdigest()!=APPROVED:
        raise RuntimeError('Certificate differs from owner-approved fingerprint')
    identity=json.loads((FOLDER/'identity.json').read_text())
    sha1=hashlib.sha1(data).hexdigest().upper()
    if identity['certificate_sha256']!=APPROVED or identity['certificate_sha1'].upper()!=sha1:
        raise RuntimeError('Signing metadata does not match exact certificate')
    stamp=str(time.time_ns())
    before=FOLDER/('trust-before-'+stamp+'.plist')
    after=FOLDER/('trust-after-'+stamp+'.plist')
    run(['/usr/bin/security','trust-settings-export',str(before)])
    old=plistlib.loads(before.read_bytes()).get('trustList',{})
    if any(k.upper()==sha1 for k in old):
        raise RuntimeError('Dedicated leaf already has user trust settings; inspect instead of overwriting')

    with tempfile.TemporaryDirectory(prefix='hpx-signing-trust-',dir='/private/tmp') as folder:
        certificate=Path(folder)/'approved.der'
        certificate.write_bytes(data)
        if hashlib.sha256(certificate.read_bytes()).hexdigest()!=APPROVED:
            raise RuntimeError('Certificate snapshot changed')
        run(['/usr/bin/security','add-trusted-cert','-r','trustRoot','-p','codeSign','-k',identity['keychain'],str(certificate)])
        run(['/usr/bin/security','trust-settings-export',str(after)])
        new=plistlib.loads(after.read_bytes()).get('trustList',{})
        unchanged={k:v for k,v in old.items() if k.upper()!=sha1}=={k:v for k,v in new.items() if k.upper()!=sha1}
        entry=next((v for k,v in new.items() if k.upper()==sha1),{})
        settings=entry.get('trustSettings',[])
        valid=unchanged and len(settings)==1 and settings[0].get('kSecTrustSettingsResult',1)==1 and settings[0].get('kSecTrustSettingsPolicyName')=='CodeSigning' and settings[0].get('kSecTrustSettingsPolicy')==bytes.fromhex('2a864886f763640110') and set(settings[0])<= {'kSecTrustSettingsResult','kSecTrustSettingsPolicyName','kSecTrustSettingsPolicy'}
        if not valid:
            run(['/usr/bin/security','remove-trusted-cert',str(certificate)])
            raise RuntimeError('Trust scope verification failed; new leaf trust removed; observed policy '+str(settings))
    print('Verified exact signing leaf: user codeSign policy only; all other trust entries unchanged.')
    print('Private trust backup: '+str(before.relative_to(ROOT)))
if __name__=='__main__':
    main()
