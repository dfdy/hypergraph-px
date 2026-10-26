// SPDX-License-Identifier: AGPL-3.0-only
// Public pinned identity metadata only; signing key stays in the login Keychain.
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'../..'),folder=join(root,'artifacts/local-development-signing');
const identifier='org.hypergraph-px.runtime.local-development';
const hash=(algorithm,bytes)=>createHash(algorithm).update(bytes).digest('hex');
export async function developmentIdentity(){
 let config;try{config=JSON.parse(await readFile(join(folder,'identity.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw error;}
 const certificate=await readFile(join(folder,'certificate.der'));
 if(process.platform!=='darwin'||config.identifier!==identifier||hash('sha1',certificate)!==config.certificate_sha1||hash('sha256',certificate)!==config.certificate_sha256)throw Error('Development signing identity metadata failed validation');
 return {...config,requirement:`identifier "${identifier}" and certificate leaf = H"${config.certificate_sha1}"`};
}
export async function verifyDevelopmentSignature(binary){
 const identity=await developmentIdentity();if(!identity)return false;
 execFileSync('/usr/bin/codesign',['--verify','--strict','--verbose=2','-R','='+identity.requirement,binary],{stdio:['ignore','ignore','pipe']});
 const temp=await mkdtemp('/private/tmp/hpx-signature-');
 try{const prefix=join(temp,'signer');execFileSync('/usr/bin/codesign',['--display','--extract-certificates='+prefix,binary],{stdio:['ignore','ignore','pipe']});const actual=await readFile(prefix+'0');if(hash('sha256',actual)!==identity.certificate_sha256)throw Error('Signed runtime certificate differs from pinned identity');}
 finally{await rm(temp,{recursive:true,force:true});}return true;
}
export async function signDevelopmentBinary(binary){
 const identity=await developmentIdentity();if(!identity)throw Error('No approved local development signing identity is configured');
 execFileSync('/usr/bin/codesign',['--force','--sign',identity.certificate_sha1,'--identifier',identifier,'--requirements','=designated => '+identity.requirement,'--timestamp=none',binary],{stdio:['ignore','ignore','pipe']});
 await verifyDevelopmentSignature(binary);return identity;
}
