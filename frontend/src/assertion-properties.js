// Properties of a claim, never new predicate identities or authorization grants.
export const defaultAssertionProperties=Object.freeze({negated:false,certainty:'unspecified',attribution:'',scope:''});
export function assertionProperties(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>!Object.hasOwn(defaultAssertionProperties,key)))throw Error('Invalid assertion properties');
 const properties={...defaultAssertionProperties,...value};
 if(typeof properties.negated!=='boolean'||!['unspecified','possible','probable','certain'].includes(properties.certainty))throw Error('Invalid assertion polarity or certainty');
 for(const [key,limit] of [['attribution',200],['scope',500]]){if(typeof properties[key]!=='string'||properties[key].trim().length>limit)throw Error(`Invalid assertion ${key}`);properties[key]=properties[key].trim();}
 return Object.freeze(properties);
}
export function assertionPropertyLabels(value){
 const properties=assertionProperties(value??{}),labels=[];
 if(properties.negated)labels.push('Negated');
 if(properties.certainty!=='unspecified')labels.push('Certainty: '+properties.certainty);
 if(properties.attribution)labels.push('Attributed to: '+properties.attribution);
 if(properties.scope)labels.push('Scope: '+properties.scope);
 return labels;
}
