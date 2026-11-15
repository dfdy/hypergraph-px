/**
 * # Hypergraph PX — Claim-property validation and labels
 *
 * Validate assertion-level polarity, certainty, attribution and scope
 * independently of predicate identity.
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
 * Used by: Assertion composition, history and relationship inspection within
 * annotation and provenance panels.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Assertions and predicate semantics][spec-2]
 *
 * Boundary: Claim properties are declarations, not permission grants, new
 * predicate identities or checked logical truth.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/assertion-properties.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 */

/** Define the immutable neutral defaults for claim-level display and composition properties. */
export const defaultAssertionProperties=Object.freeze({negated:false,certainty:'unspecified',attribution:'',scope:''});

/** Reject unknown property keys, validate bounded values and freeze the normalized claim property set. */
export function assertionProperties(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(/* Detect a supplied property key outside the supported assertion-property vocabulary. */ key=>!Object.hasOwn(defaultAssertionProperties,key)))throw Error('Invalid assertion properties');


 const properties={...defaultAssertionProperties,...value};


 if(typeof properties.negated!=='boolean'||!['unspecified','possible','probable','certain'].includes(properties.certainty))throw Error('Invalid assertion polarity or certainty');


 for(const [key,limit] of [['attribution',200],['scope',500]]){if(typeof properties[key]!=='string'||properties[key].trim().length>limit)throw Error(`Invalid assertion ${key}`);

  properties[key]=properties[key].trim();}


 return Object.freeze(properties);
}

/** Turn validated non-default claim properties into explicit human-readable labels. */
export function assertionPropertyLabels(value){
 const properties=assertionProperties(value??{}),labels=[];


 if(properties.negated)labels.push('Negated');


 if(properties.certainty!=='unspecified')labels.push('Certainty: '+properties.certainty);


 if(properties.attribution)labels.push('Attributed to: '+properties.attribution);


 if(properties.scope)labels.push('Scope: '+properties.scope);


 return labels;
}
