#!/usr/bin/env python3
"""Apply only the exact owner-approved ADR016 user codeSign leaf trust."""
import hashlib
import json
import os
from pathlib import Path
import plistlib
import subprocess
import tempfile
import time

ROOT=Path(__file__).resolve().parents[1]
FOLDER=ROOT/'artifacts/local-development-signing'
APPROVED='76e90b6b05a67bb7cd1649d2dcdb7a13de40b03eb5b5ce46c1a94de0508593a4'
def run(args):
    result=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors='replace').strip())
def main():
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
        certificate=Path(folder)/'approved.der';certificate.write_bytes(data)
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
if __name__=='__main__':main()
