import {relationshipType} from './relationship-catalog.js';
// Describe the claimed entities/roles without pretending to infer them from prose.
export function relationshipContext(definition){
 const details=document.createElement('details');details.className='relationship-context caption';
 const summary=document.createElement('summary');summary.textContent='Roles and context';details.append(summary);
 if(!definition){details.hidden=true;return details;}
 const canonical=relationshipType(definition.canonicalId);
 const direction=definition.symmetry==='symmetric'?'Symmetric in the specified context.':definition.orientation==='reverse'?`Reverse wording of “${canonical.label}”.`:'Directed from the first unit to the second.';
 for(const text of [`First unit describes: ${definition.sourceRole}.`,`Second unit describes: ${definition.targetRole}.`,`Context: ${definition.contextFields.join('; ')}.`,direction]){const line=document.createElement('p');line.textContent=text;details.append(line);}
 return details;
}
