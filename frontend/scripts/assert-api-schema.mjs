// Test-only interpreter for the generated components used by this migration.
// Not application validation or a general JSON Schema implementation. Unknown
// schema keywords fail the test instead of silently claiming conformance.
import {readFile} from 'node:fs/promises';
const spec=JSON.parse(await readFile(new URL('../../shared/openapi.json',import.meta.url)));
const supported=new Set(['$ref','type','oneOf','properties','required','additionalProperties','items','minItems','maxItems','minimum','maximum','enum','format','description','writeOnly']);
export function assertComponent(name,value){
 function matches(schema,value){
  for(const key of Object.keys(schema))if(!supported.has(key))throw Error('Unsupported schema keyword: '+key);
  if(schema.$ref){let target=spec;for(const key of schema.$ref.slice(2).split('/'))target=target[key];return matches(target,value);}
  if(schema.oneOf)return schema.oneOf.filter(s=>matches(s,value)).length===1;
  const type=value===null?'null':Array.isArray(value)?'array':typeof value;
  if(schema.type==='integer'?!Number.isSafeInteger(value):schema.type&&schema.type!==type)return false;
  if(schema.enum&&!schema.enum.includes(value))return false;
  if(typeof value==='number'&&(value<(schema.minimum??-Infinity)||value>(schema.maximum??Infinity)))return false;
  if(Array.isArray(value)){if(value.length<(schema.minItems??0)||value.length>(schema.maxItems??Infinity))return false;if(schema.items&&!value.every(item=>matches(schema.items,item)))return false;}
  if(type==='object'){if((schema.required??[]).some(key=>!Object.hasOwn(value,key)))return false;for(const [key,item] of Object.entries(value)){if(schema.properties?.[key]){if(!matches(schema.properties[key],item))return false;}else if(schema.additionalProperties===false)return false;}}
  return true;
 }
 if(!spec.components.schemas[name]||!matches(spec.components.schemas[name],value))throw Error('Actual payload violates generated '+name+' schema');
}
// Derive actual-test bindings from the same generated contract. Route-only
// operations stay excluded; this does not infer conformance for unknown bodies.
export const typedBindings=Object.entries(spec.paths).flatMap(([path,methods])=>Object.entries(methods).flatMap(([method,operation])=>{
 const ignored=operation['x-hpx-schema-coverage']==='typed-response'&&operation['x-hpx-request-body']==='ignored';
 if(operation['x-hpx-schema-coverage']!=='typed'&&!ignored)return [];
 const component=reference=>reference?.startsWith('#/components/schemas/')?reference.slice('#/components/schemas/'.length):null;
 const request=component(operation.requestBody?.content?.['application/json']?.schema?.$ref),response=component(operation.responses?.['200']?.content?.['application/json']?.schema?.$ref);
 if(!response||method==='post'&&!request&&!ignored)throw Error('Typed operation lacks generated component binding: '+path);
 return [{path,method:method.toUpperCase(),request,response}];
}));
export function assertBoundPayload(path,method,direction,value){
 const binding=typedBindings.find(b=>b.path===path&&b.method===method),component=binding?.[direction];
 if(!component)throw Error('No typed '+direction+' binding for '+method+' '+path);
 assertComponent(component,value);
}
