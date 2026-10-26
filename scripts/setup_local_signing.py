#!/usr/bin/env python3
"""Explicit ADR016 installation; public metadata only, no trust-store changes."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'artifacts/local-development-signing'
NAME = 'Hypergraph PX Local Development'
IDENTIFIER = 'org.hypergraph-px.runtime.local-development'

def run(args):
    result = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        detail=''
        if args[0]=='/usr/bin/security':
            for line in result.stderr.decode(errors='replace').splitlines():
                if line.startswith('security: SecKeychainItemImport:'): detail=' '+line
        raise RuntimeError(f'{Path(args[0]).name} failed (exit {result.returncode});'+detail+' no password or private material logged')
    return result.stdout

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--install', action='store_true', required=True)
    parser.add_argument('--retry-uninstalled', action='store_true')
    args=parser.parse_args()
    os.umask(0o077)
    FOLDER.mkdir(parents=True, exist_ok=True, mode=0o700)
    config = FOLDER / 'identity.json'
    pending = FOLDER / 'installation-pending.json'
    if config.exists() or pending.exists() and not args.retry_uninstalled:
        raise RuntimeError('Signing metadata already exists; inspect it rather than overwriting or rotating an identity')
    keychain = Path.home() / 'Library/Keychains/login.keychain-db'
    existing = subprocess.run(['/usr/bin/security', 'find-certificate', '-a', '-c', NAME, str(keychain)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if existing.returncode == 0 and existing.stdout:
        raise RuntimeError('An identity certificate with this name already exists; no replacement was created')
    if existing.returncode not in (0, 44):
        raise RuntimeError('Could not inspect dedicated certificate-name scope; no installation attempted')
    if pending.exists():
        if json.loads(pending.read_text()).get('key_import_started'):
            raise RuntimeError('A scoped key import was started; inspect partial identity instead of regenerating')
        old_key=subprocess.run(['/usr/bin/security','find-key','-l',NAME,'-t','private',str(keychain)],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        if not (old_key.returncode==44 or old_key.returncode==1 and b'The specified item could not be found in the keychain.' in old_key.stderr) or old_key.stdout:
            raise RuntimeError('Possible partial signing-key import; no replacement attempted')
        pending.rename(FOLDER/'previous-uninstalled-attempt.json')
    with tempfile.TemporaryDirectory(prefix='hpx-signing-', dir='/private/tmp') as tmp:
        temp = Path(tmp)
        private, certificate, bundle = temp/'private.pem', temp/'certificate.pem', temp/'transfer.p12'
        run(['openssl', 'req', '-x509', '-newkey', 'rsa:3072', '-noenc', '-keyout', str(private), '-out', str(certificate), '-days', '730', '-subj', '/CN='+NAME, '-addext', 'basicConstraints=critical,CA:FALSE', '-addext', 'keyUsage=critical,digitalSignature', '-addext', 'extendedKeyUsage=codeSigning'])
        der = run(['openssl', 'x509', '-in', str(certificate), '-outform', 'DER'])
        metadata = {'identifier':IDENTIFIER, 'certificate_sha1':hashlib.sha1(der).hexdigest(), 'certificate_sha256':hashlib.sha256(der).hexdigest(), 'keychain':str(keychain), 'name':NAME}
        (FOLDER/'certificate.der').write_bytes(der)
        pending.write_text(json.dumps(metadata, indent=2)+'\n')
        # Import the unencrypted key directly from the private temporary directory.
        # No transfer password or owner password enters command arguments.
        traditional=temp/'private-rsa.pem'
        run(['openssl','pkey','-in',str(private),'-traditional','-out',str(traditional)])
        metadata['key_import_started']=True
        pending.write_text(json.dumps(metadata,indent=2)+'\n')
        run(['/usr/bin/security','import',str(traditional),'-k',str(keychain),'-t','priv','-f','openssl','-x','-T','/usr/bin/codesign'])
        run(['/usr/bin/security','import',str(certificate),'-k',str(keychain),'-t','cert','-f','pemseq'])
        os.replace(pending, config)
    print('Dedicated local signing identity imported; no TLS/system trust settings changed.')
    print('Public certificate SHA-256: '+metadata['certificate_sha256'])

if __name__ == '__main__':
    main()
