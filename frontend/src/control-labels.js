// Formatting abbreviations and glyphs still need an explanatory name on hover.
export function isDescriptiveControlLabel(text){
 const label=String(text??'').normalize('NFKC').replace(/\s+/g,' ').trim();
 if(!label||/^(?:[BIP]|H[1-6]|Aa)$/u.test(label))return false;
 return /\p{L}{2,}/u.test(label);
}
