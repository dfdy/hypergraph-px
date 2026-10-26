/** Build a declaration from reviewed immutable references, never current editor offsets. */
import {validAssertionSource} from './runtime-assertions.js';
import {assertionProperties} from './assertion-properties.js';
const bytes=value=>new TextEncoder().encode(value).length;
export function capturedAssertion({label,description,participants,properties}){
 if(typeof label!=='string'||!label.isWellFormed()||!label.trim()||[...label.trim()].length>80||typeof description!=='string'||!description.isWellFormed()||!description.trim()||bytes(description.trim())>8192)throw Error('Enter a claim name and description');
 if(!Array.isArray(participants)||participants.length<2||participants.length>8)throw Error('Choose between 2 and 8 participants');
 let total=0;const roles=new Map(),inputs=participants.map(p=>{
  if(typeof p.role!=='string'||!p.role.isWellFormed()||!p.role.trim()||bytes(p.role.trim())>64)throw Error('Enter a role for every participant (up to 64 bytes)');
  if(!validAssertionSource(p.source)||typeof p.quote!=='string'||!p.quote.isWellFormed()||bytes(p.quote)!==p.source.end_byte-p.source.start_byte)throw Error('Invalid exact participant source');
  total+=bytes(p.quote);const role=p.role.trim();roles.set(role,{id:role,label:role});return {role,source:structuredClone(p.source),expected_draft:null,quote:p.quote};
 });
 if(total>2*1024*1024)throw Error('Combined participants exceed the 2 MiB limit');
 const claim=assertionProperties(properties);if(!claim.attribution.isWellFormed()||!claim.scope.isWellFormed())throw Error('Invalid assertion properties');
 return {action:'create',predicate:{kind:'declared',label:label.trim(),description:description.trim(),roles:[...roles.values()]},participants:inputs,properties:claim};
}
