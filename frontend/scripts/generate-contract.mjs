// SPDX-License-Identifier: AGPL-3.0-only
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import openapiTS,{astToString} from 'openapi-typescript';
const root=resolve(import.meta.dirname,'../..'),output=resolve(root,'frontend/src/generated');
export function validateReferences(spec){
 function visit(value){if(!value||typeof value!=='object')return;if('$ref' in value){if(!value.$ref.startsWith('#/'))throw Error('External schema reference forbidden');let target=spec;for(const key of value.$ref.slice(2).split('/'))target=target?.[key.replaceAll('~1','/').replaceAll('~0','~')];if(!target)throw Error('Unresolved schema reference: '+value.$ref);}for(const child of Object.values(value))visit(child);}visit(spec);
}
// Conservative wire freeze: additions are allowed; any existing operation/schema
// change needs explicit compatibility review. This is not semantic-version inference.
export function assertCompatible(previous,next,{reviewedRefinements=[]}={}){
 for(const [name,schema] of Object.entries(previous.components?.schemas??{}))if(JSON.stringify(schema)!==JSON.stringify(next.components?.schemas?.[name]))throw Error('Existing API schema changed: '+name);
 for(const [path,methods] of Object.entries(previous.paths??{}))for(const [method,operation] of Object.entries(methods)){
  const replacement=next.paths?.[path]?.[method];if(JSON.stringify(operation)===JSON.stringify(replacement))continue;
  const ignored=replacement?.['x-hpx-schema-coverage']==='typed-response'&&replacement?.['x-hpx-request-body']==='ignored';
  if(!reviewedRefinements.includes(path)||operation['x-hpx-schema-coverage']!=='route-only'||(replacement?.['x-hpx-schema-coverage']!=='typed'&&!ignored))throw Error('Existing API operation changed: '+method+' '+path);
  if(ignored&&(method!=='post'||replacement.requestBody?.required!==false||JSON.stringify(replacement.requestBody?.content?.['application/json']?.schema)!=='{}'))throw Error('Ignored-body refinement must preserve arbitrary optional bodies: '+path);
  const strip=value=>{const copy=structuredClone(value);delete copy['x-hpx-schema-coverage'];if(ignored){delete copy['x-hpx-request-body'];delete copy.requestBody?.required;}delete copy.requestBody?.content?.['application/json']?.schema;delete copy.responses?.['200']?.content?.['application/json']?.schema;return copy;};
  if(JSON.stringify(strip(operation))!==JSON.stringify(strip(replacement)))throw Error('Reviewed refinement altered method/error/security behaviour: '+path);
  if((method!=='get'&&!ignored&&!replacement.requestBody?.content?.['application/json']?.schema?.$ref)||!replacement.responses?.['200']?.content?.['application/json']?.schema?.$ref)throw Error('Reviewed refinement must use generated components: '+path);
 }
 if(JSON.stringify(previous.security)!==JSON.stringify(next.security)||JSON.stringify(previous.components?.securitySchemes)!==JSON.stringify(next.components?.securitySchemes))throw Error('API security contract changed');
}
export function schemaCacheValid(record,identity){return record?.identity===identity&&record.sha256===createHash('sha256').update(JSON.stringify(record.spec)).digest('hex');}
export async function generate({check=false,reviewedRefinements=[]}={}){
 if(check&&reviewedRefinements.length)throw Error("Check mode cannot accept refinements");
 const inputs=['crates/storage/Cargo.toml','crates/storage/src/lib.rs','crates/storage/src/encoding.rs','crates/storage/src/audit.rs','crates/runtime/src/api.rs','crates/runtime/src/export_api.rs','crates/runtime/src/main.rs','crates/runtime/Cargo.toml','crates/runtime/build.rs','Cargo.toml','Cargo.lock', 'frontend/scripts/generate-contract.mjs'];
 const toolchain=execFileSync('rustc',['--version'],{cwd:root,encoding:'utf8'});
 const sourceIdentity=async()=>{const hash=createHash('sha256').update(toolchain+'\0'+process.platform+'\0'+process.arch+'\0'+(process.env.RUSTUP_TOOLCHAIN??'')+'\0'+(process.env.CARGO_BUILD_TARGET??''));for(const path of inputs){hash.update(path+'\0');hash.update(await readFile(resolve(root,path)));}return hash.digest('hex');};
 const identity=await sourceIdentity(),cache=resolve(root,'.verification/api-contract');await mkdir(cache,{recursive:true});
 const cached=resolve(cache,identity+'.json');let spec;
 try{const record=JSON.parse(await readFile(cached,'utf8'));if(!schemaCacheValid(record,identity))throw Error('Invalid schema cache');spec=record.spec;}catch{spec=JSON.parse(execFileSync('cargo',['run','-p','hypergraph-runtime','--features','api-export','--bin','hypergraph-api','--offline','--locked'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','inherit']}));if(await sourceIdentity()!==identity)throw Error('Rust API inputs changed during export');await writeFile(cached,JSON.stringify({identity,sha256:createHash('sha256').update(JSON.stringify(spec)).digest('hex'),spec})+'\n');}
 validateReferences(spec);
 const schema=JSON.stringify(spec,null,2)+'\n',types='// Generated from Rust API DTOs. Do not edit.\n'+astToString(await openapiTS(spec,{alphabetize:true,arrayLength:true}));
 if(await sourceIdentity()!==identity)throw Error('API inputs changed during generation');
 const auditMaximum=spec.components.schemas.AuditRequest.properties.max_bytes.maximum,auditScope=spec.components.schemas.DocumentAuditReport.properties.scope.enum?.[0];
 if(!Number.isSafeInteger(auditMaximum)||auditMaximum<1||typeof auditScope!=='string')throw Error('Missing authoritative audit constraints');
 const routes=Object.fromEntries(Object.entries(spec.paths).map(([path,methods])=>{const [method,operation]=Object.entries(methods)[0];return [path,{method:method.toUpperCase(),...(operation.requestBody?.content?{contentType:Object.keys(operation.requestBody.content)[0]}:{})}];}));
 const routeSource='// Generated from the Rust-defined OpenAPI contract. Do not edit.\nexport const runtimeRoutes='+JSON.stringify(routes)+';\n';
 const constraints='// Generated from the Rust-defined OpenAPI contract. Do not edit.\nexport const auditMaxBytes='+JSON.stringify(auditMaximum)+';\nexport const auditScope='+JSON.stringify(auditScope)+';\n';
 await mkdir(output,{recursive:true});const files={'openapi.json':schema,'api.d.ts':types,'api-constraints.js':constraints,'api-routes.js':routeSource};
 let previous;try{previous=JSON.parse(await readFile(resolve(output,'openapi.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;if(check)throw Error('Missing generated contract');}
 if(previous)assertCompatible(previous,spec,{reviewedRefinements});
 for(const [name,value] of Object.entries(files)){let old;try{old=await readFile(resolve(output,name),'utf8');}catch{}if(check&&old!==value)throw Error('Generated API drift: '+name);if(!check&&old!==value)await writeFile(resolve(output,name),value);}
 console.log('Rust API contract '+(check?'matches':'generated')+'; '+Object.keys(spec.paths).length+' inventoried paths; typed coverage recorded per operation');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await generate({check:process.argv.includes('--check'),reviewedRefinements:process.argv.flatMap((value,index,args)=>value==='--reviewed-refinement'?[args[index+1]]:[])});
