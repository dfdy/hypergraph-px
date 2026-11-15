/**
 * # Hypergraph PX — Predicate browsing and semantic catalog checks
 *
 * Loads stable predicate identities with overlapping browsing tags, ranks searches
 * and rejects catalog inconsistencies before the relationship chooser uses them.
 *
 * Source: [Latest source on GitHub][source]
 *
 * Agent provenance: Agent creation unverified; original creator not recorded.
 * Created: Unknown (not recorded).
 * Creation harness: Unknown (not recorded).
 * Creation model: Unknown (not recorded).
 *
 * Latest editing agent: Codex (OpenAI coding agent), /root/frontend_comments.
 * Latest editing harness: Codex; version/build: unknown.
 * Latest editing model: OpenAI; exact model identifier/revision: unknown.
 * Last edited: 2026-11-15 (UTC).
 *
 * Used by: Owned-source editing and presentation — relationship chooser, assertion
 * semantics and markers.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Assertions and predicate semantics][spec-2]
 *
 * Boundary: Browsing tags and search normalization do not define assertion
 * identity. Inverse wording is resolved through explicit canonical roles and
 * symmetry metadata.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/relationship-catalog.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 */

import definitions from '../../shared/predicate-catalog-v1.json' with {type:'json'};

/** Expose frozen predicate entries and their nested browsing metadata. */
export const relationshipTypes=Object.freeze(definitions.relationships.map(/* Freeze predicate metadata and supply a readable fallback label. */ type=>Object.freeze({...type,aliases:Object.freeze(type.aliases??[]),categoryIds:Object.freeze(type.categoryIds),contextFields:Object.freeze(type.contextFields),label:type.label??type.type.replaceAll('_',' ')})));

const byId=new Map(relationshipTypes.map(/* Index predicates by opaque stable identity. */ type=>[type.id,type]));

/** Expose overlapping browsing groups without duplicating stable predicate identity. */
export const relationshipCategories=Object.freeze(definitions.categories.map(/* Build frozen browsing groups from declared tag membership. */ group=>Object.freeze({...group,types:Object.freeze(relationshipTypes.filter(/* Select predicates that explicitly declare this browsing tag. */ type=>type.categoryIds.includes(group.id)))})));

/** Look up a stable predicate identity without inventing a fallback meaning. */
export function relationshipType(id){return byId.get(id)??null;}

/** Look up a browsing group or return no match. */
export function relationshipCategory(id){return relationshipCategories.find(/* Find the declared browsing group identity. */ group=>group.id===id)??null;}

/** Resolve and sort all browsing tags attached to a predicate. */
export function relationshipTags(type){return type.categoryIds.map(relationshipCategory).sort(/* Sort tags by friendly case-insensitive English labels. */ (a,b)=>a.label.localeCompare(b.label,'en',{sensitivity:'base'}));}

/** Normalize chooser search text only, leaving persisted source and stable IDs unchanged. */
const normalize=text=>String(text).toLowerCase().replace(/[_\-…]+/g,' ').replace(/\s+/g,' ').trim();

/** Rank exact names ahead of prefixes, substrings and broader definition/context matches. */
function searchScore(group,type,query){
 const q=normalize(query);

 if(!q)return 0;


 const names=[type.type,type.label,type.symbol,...type.aliases].filter(Boolean).map(normalize);


 if(names.includes(q))return 0;


 if(names.some(/* Recognise a name prefix as a stronger match than an arbitrary substring. */ name=>name.startsWith(q)))return 1;


 if(names.some(/* Recognise a name containing the query. */ name=>name.includes(q)))return 2;


 if(normalize(group.label).includes(q))return 3;


 if(normalize(type.inverse??'').includes(q))return 4;


 if(normalize(type.example).includes(q))return 5;


 if(normalize(type.definition).includes(q))return 6;


 const searchable=normalize([group.label,...names,type.inverse,type.example,type.definition].join(' '));

 return q.split(' ').every(/* Require every query token to occur in the combined searchable metadata. */ token=>searchable.includes(token))?7:Infinity;
}

/** Return matching groups with ranked predicate entries. */
export function searchRelationshipCatalog(query){
 return relationshipCategories.map(/* Rank each group while preserving its browsing context. */ group=>({...group,types:group.types.map(/* Attach a relevance score to each candidate predicate. */ type=>({type,score:searchScore(group,type,query)})).filter(/* Discard candidates with no finite relevance score. */ match=>Number.isFinite(match.score)).sort(/* Place stronger matches first within the browsing group. */ (a,b)=>a.score-b.score)})).filter(/* Discard groups with no matching predicates. */ group=>group.types.length);
}

// One search result per stable identity, even when several tags match.
/** Collapse overlapping tag results to one best match per stable predicate identity. */
export function uniqueRelationshipMatches(groups){
 const matches=new Map();

 for(const group of groups)for(const match of group.types){const current=matches.get(match.type.id);

  if(!current||match.score<current.score)matches.set(match.type.id,match);}


 return [...matches.values()].sort(/* Order unique results deterministically by score, friendly label and identity. */ (a,b)=>a.score-b.score||a.type.label.localeCompare(b.type.label,'en',{sensitivity:'base',numeric:true})||a.type.id.localeCompare(b.type.id));
}

/** Report duplicate identities, unresolved tags and inconsistent role/inverse/symmetry declarations. */
export function validateRelationshipCatalog(categories){
 const errors=[],ids=new Map(),groups=new Set();


 for(const group of categories){
  if(groups.has(group.id))errors.push(`Duplicate category: ${group.id}`);

  groups.add(group.id);

  const labels=new Map(),memberIds=new Set();


  for(const type of group.types){
   if(memberIds.has(type.id))errors.push(`Duplicate tag membership: ${type.id}`);

   memberIds.add(type.id);


   if(ids.has(type.id)&&ids.get(type.id)!==type)errors.push(`Conflicting relationship identity: ${type.id}`);

   ids.set(type.id,type);


   // Different meanings may share a word, but are not duplicate identities.
   const label=type.label.toLowerCase();

   if(labels.has(label)&&labels.get(label).definition===type.definition)errors.push(`Duplicate meaning: ${type.id}`);

   labels.set(label,type);


   if(!type.categoryIds?.includes(group.id))errors.push(`Wrong category: ${type.id}`);


   for(const field of ['definition','example','sourceRole','targetRole','inverseAssessment'])if(!type[field]?.trim())errors.push(`Missing ${field}: ${type.id}`);


   if(!Array.isArray(type.contextFields)||!type.contextFields.length)errors.push(`Missing context: ${type.id}`);


   if(!['forward','reverse'].includes(type.orientation)||!['symmetric','not asserted'].includes(type.symmetry))errors.push(`Invalid direction: ${type.id}`);
  }
 }


 for(const type of ids.values()){
  for(const tag of type.categoryIds??[])if(!groups.has(tag)||!categories.find(/* Resolve a declared tag when verifying reciprocal membership. */ group=>group.id===tag).types.includes(type))errors.push(`Unresolved tag: ${type.id}`);


  if(!type.categoryIds?.length||new Set(type.categoryIds).size!==type.categoryIds.length)errors.push(`Invalid tag set: ${type.id}`);


  const canonical=ids.get(type.canonicalId);

  if(!canonical||canonical.orientation!=='forward'||canonical.canonicalId!==canonical.id)errors.push(`Invalid canonical orientation: ${type.id}`);


  if(type.orientation==='reverse'&&(!canonical||type.sourceRole!==canonical.targetRole||type.targetRole!==canonical.sourceRole))errors.push(`Invalid reversed roles: ${type.id}`);


  if(type.inverseId){const inverse=ids.get(type.inverseId);

   if(!inverse||inverse.inverseId!==type.id||inverse.canonicalId!==type.canonicalId&&type.symmetry!=='symmetric'||inverse.label!==type.inverse)errors.push(`Invalid converse: ${type.id}`);}


  if(type.symmetry==='symmetric'&&type.inverseId!==type.id)errors.push(`Invalid symmetry: ${type.id}`);
 }


 return errors;
}

const catalogErrors=validateRelationshipCatalog(relationshipCategories);

if(catalogErrors.length)throw new Error(catalogErrors.join('\n'));
