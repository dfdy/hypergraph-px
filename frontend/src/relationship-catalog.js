// Stable preview relationship registry with overlapping browsing tags. IDs are opaque, including their legacy namespace.
import definitions from '../../crates/storage/src/predicate-catalog-v1.json' with {type:'json'};
export const relationshipTypes=Object.freeze(definitions.relationships.map(type=>Object.freeze({...type,aliases:Object.freeze(type.aliases??[]),categoryIds:Object.freeze(type.categoryIds),contextFields:Object.freeze(type.contextFields),label:type.label??type.type.replaceAll('_',' ')})));
const byId=new Map(relationshipTypes.map(type=>[type.id,type]));
export const relationshipCategories=Object.freeze(definitions.categories.map(group=>Object.freeze({...group,types:Object.freeze(relationshipTypes.filter(type=>type.categoryIds.includes(group.id)))})));
export function relationshipType(id){return byId.get(id)??null;}
export function relationshipCategory(id){return relationshipCategories.find(group=>group.id===id)??null;}
export function relationshipTags(type){return type.categoryIds.map(relationshipCategory).sort((a,b)=>a.label.localeCompare(b.label,'en',{sensitivity:'base'}));}
const normalize=text=>String(text).toLowerCase().replace(/[_\-…]+/g,' ').replace(/\s+/g,' ').trim();
function searchScore(group,type,query){
 const q=normalize(query);if(!q)return 0;
 const names=[type.type,type.label,type.symbol,...type.aliases].filter(Boolean).map(normalize);
 if(names.includes(q))return 0;
 if(names.some(name=>name.startsWith(q)))return 1;
 if(names.some(name=>name.includes(q)))return 2;
 if(normalize(group.label).includes(q))return 3;
 if(normalize(type.inverse??'').includes(q))return 4;
 if(normalize(type.example).includes(q))return 5;
 if(normalize(type.definition).includes(q))return 6;
 const searchable=normalize([group.label,...names,type.inverse,type.example,type.definition].join(' '));return q.split(' ').every(token=>searchable.includes(token))?7:Infinity;
}
export function searchRelationshipCatalog(query){
 return relationshipCategories.map(group=>({...group,types:group.types.map(type=>({type,score:searchScore(group,type,query)})).filter(match=>Number.isFinite(match.score)).sort((a,b)=>a.score-b.score)})).filter(group=>group.types.length);
}
// One search result per stable identity, even when several tags match.
export function uniqueRelationshipMatches(groups){
 const matches=new Map();for(const group of groups)for(const match of group.types){const current=matches.get(match.type.id);if(!current||match.score<current.score)matches.set(match.type.id,match);}
 return [...matches.values()].sort((a,b)=>a.score-b.score||a.type.label.localeCompare(b.type.label,'en',{sensitivity:'base',numeric:true})||a.type.id.localeCompare(b.type.id));
}
export function validateRelationshipCatalog(categories){
 const errors=[],ids=new Map(),groups=new Set();
 for(const group of categories){
  if(groups.has(group.id))errors.push(`Duplicate category: ${group.id}`);groups.add(group.id);const labels=new Map(),memberIds=new Set();
  for(const type of group.types){
   if(memberIds.has(type.id))errors.push(`Duplicate tag membership: ${type.id}`);memberIds.add(type.id);
   if(ids.has(type.id)&&ids.get(type.id)!==type)errors.push(`Conflicting relationship identity: ${type.id}`);ids.set(type.id,type);
   // Different meanings may share a word, but are not duplicate identities.
   const label=type.label.toLowerCase();if(labels.has(label)&&labels.get(label).definition===type.definition)errors.push(`Duplicate meaning: ${type.id}`);labels.set(label,type);
   if(!type.categoryIds?.includes(group.id))errors.push(`Wrong category: ${type.id}`);
   for(const field of ['definition','example','sourceRole','targetRole','inverseAssessment'])if(!type[field]?.trim())errors.push(`Missing ${field}: ${type.id}`);
   if(!Array.isArray(type.contextFields)||!type.contextFields.length)errors.push(`Missing context: ${type.id}`);
   if(!['forward','reverse'].includes(type.orientation)||!['symmetric','not asserted'].includes(type.symmetry))errors.push(`Invalid direction: ${type.id}`);
  }
 }
 for(const type of ids.values()){
  for(const tag of type.categoryIds??[])if(!groups.has(tag)||!categories.find(group=>group.id===tag).types.includes(type))errors.push(`Unresolved tag: ${type.id}`);
  if(!type.categoryIds?.length||new Set(type.categoryIds).size!==type.categoryIds.length)errors.push(`Invalid tag set: ${type.id}`);
  const canonical=ids.get(type.canonicalId);if(!canonical||canonical.orientation!=='forward'||canonical.canonicalId!==canonical.id)errors.push(`Invalid canonical orientation: ${type.id}`);
  if(type.orientation==='reverse'&&(!canonical||type.sourceRole!==canonical.targetRole||type.targetRole!==canonical.sourceRole))errors.push(`Invalid reversed roles: ${type.id}`);
  if(type.inverseId){const inverse=ids.get(type.inverseId);if(!inverse||inverse.inverseId!==type.id||inverse.canonicalId!==type.canonicalId&&type.symmetry!=='symmetric'||inverse.label!==type.inverse)errors.push(`Invalid converse: ${type.id}`);}
  if(type.symmetry==='symmetric'&&type.inverseId!==type.id)errors.push(`Invalid symmetry: ${type.id}`);
 }
 return errors;
}
const catalogErrors=validateRelationshipCatalog(relationshipCategories);
if(catalogErrors.length)throw new Error(catalogErrors.join('\n'));
