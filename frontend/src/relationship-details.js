/**
 * # Hypergraph PX — Relationship role and context explanation
 *
 * Render the declared endpoint roles, context fields and directional
 * interpretation for an explicitly selected relationship definition.
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
 * Used by: Relationship inspection and assertion composition within annotation and
 * provenance panels.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Assertions and predicate semantics][spec-2]
 *
 * Boundary: Descriptions explain a chosen declaration; they do not infer entities,
 * context or truth from prose.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/relationship-details.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/05-domain/assertions-and-predicates.md
 */

import {relationshipType} from './relationship-catalog.js';

// Describe the claimed entities/roles without pretending to infer them from prose.
/** Build a safe expandable explanation of the selected definition's roles, context and orientation. */
export function relationshipContext(definition){
 const details=document.createElement('details');

 details.className='relationship-context caption';


 const summary=document.createElement('summary');

 summary.textContent='Roles and context';details.append(summary);


 if(!definition){details.hidden=true;

  return details;}


 const canonical=relationshipType(definition.canonicalId);


 const direction=definition.symmetry==='symmetric'?'Symmetric in the specified context.':definition.orientation==='reverse'?`Reverse wording of “${canonical.label}”.`:'Directed from the first unit to the second.';


 for(const text of [`First unit describes: ${definition.sourceRole}.`,`Second unit describes: ${definition.targetRole}.`,`Context: ${definition.contextFields.join('; ')}.`,direction]){const line=document.createElement('p');

  line.textContent=text;details.append(line);}


 return details;
}
