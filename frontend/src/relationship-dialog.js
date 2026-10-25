import {assertionProperties,assertionPropertyLabels} from './assertion-properties.js';
import {relationshipContext} from './relationship-details.js';
import {relationshipType,relationshipCategory,searchRelationshipCatalog,uniqueRelationshipMatches,relationshipTags} from './relationship-catalog.js';
const alphabet=new Intl.Collator('en',{sensitivity:'base',numeric:true});
const make=(tag,text)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;return element;};
// The frozen source context is rechecked before any tab-local record is created.
export function openRelationshipDialog(api,context,choice){
 const dialog=make('dialog');dialog.className='function-dialog relationship-dialog';
 const heading=make('h2','Add relations');heading.id='relationship-dialog-title';dialog.setAttribute('aria-labelledby',heading.id);
 const intro=make('p',`Connect the first selected ${choice.kind} to the second. This creates a tab-only assertion.`);dialog.append(heading);
 const form=make('form'),category=make('select'),type=make('select'),search=make('input');search.type='search';search.placeholder='';search.setAttribute('role','combobox');search.setAttribute('aria-autocomplete','list');search.setAttribute('aria-haspopup','listbox');search.autocomplete='off';
 const field=(label,control)=>{const row=make('label',label);control.setAttribute('aria-label',label);row.append(control);form.append(row);};
 const searchRow=make('div');searchRow.className='relationship-search-row';const searchLabel=make('label','Search relationships');search.setAttribute('aria-label','Search relationships');searchLabel.append(search);const useCustom=make('button','Use custom');useCustom.type='button';useCustom.setAttribute('aria-label','Use search as custom term');const searchField=make('div');searchField.className='relationship-search-field';const results=make('div');results.id='relationship-search-results';results.role='listbox';results.setAttribute('aria-label','Relationship search results');results.hidden=true;search.setAttribute('aria-controls',results.id);search.setAttribute('aria-expanded','false');searchField.append(searchLabel,results);searchRow.append(searchField,useCustom);form.append(searchRow);let suggestions=[],activeSuggestion=-1;field('Relationship category',category);field('Relationship type',type);let customChoice=null;
 const resultCount=make('p');resultCount.role='status';resultCount.setAttribute('aria-live','polite');
 const description=make('p'),example=make('p'),inverse=make('p');let roleDetails=relationshipContext(null);form.append(resultCount);
 const optionLabel=definition=>`${definition.label??definition.type}${definition.symbol?' ('+definition.symbol+')':''}`;
 function showType(){
  const definition=relationshipType(type.value),group=relationshipCategory(category.value);
  description.textContent=group?`Definition: ${definition?.family?definition.family+'. ':''}${definition?.definition??group.description}`:'';description.hidden=!group;
  example.textContent=definition?`Example: ${definition.example}`:'';example.hidden=!definition;
  inverse.textContent=definition?.inverse?`Inverse label: ${definition.inverse}`:'';inverse.hidden=!definition?.inverse;
  const nextDetails=relationshipContext(definition);roleDetails.replaceWith(nextDetails);roleDetails=nextDetails;
  connectionName.textContent=definition?.label??definition?.type??'Choose a relationship';connectionSymbol.textContent=definition?.symbol??'';
 }
 function placeholder(select,label){const option=make('option',label);option.value='';select.append(option);select.value='';}
 function enableAdd(){add.disabled=!customChoice&&!relationshipType(type.value);}
 function fillTypes(preferred=''){
  const matches=searchRelationshipCatalog(search.value),groups=category.value?matches.filter(group=>group.id===category.value):search.value.trim()?matches:[];
  type.replaceChildren();placeholder(type,'Choose relationship');
  for(const match of uniqueRelationshipMatches(groups).sort((a,b)=>alphabet.compare(a.type.label,b.type.label))){const option=make('option',optionLabel(match.type));option.value=match.type.id;type.append(option);}
  if(preferred&&[...type.options].some(option=>option.value===preferred))type.value=preferred;else type.value='';
  type.disabled=!groups.length;showType();enableAdd();
 }
 function hideResults(){results.hidden=true;search.setAttribute('aria-expanded','false');search.removeAttribute('aria-activedescendant');activeSuggestion=-1;}
 function selectTag(definition){const available=[...category.options].map(option=>option.value);return definition.categoryIds.includes(category.value)?category.value:available.includes(definition.categoryId)?definition.categoryId:definition.categoryIds.find(id=>available.includes(id))??'';}
 function chooseResult(definition){category.value=selectTag(definition);fillTypes(definition.id);hideResults();search.focus();}
 function highlightResult(){const options=[...results.children];for(let i=0;i<options.length;i++){options[i].classList.toggle('active',i===activeSuggestion);options[i].setAttribute('aria-selected',String(i===activeSuggestion));}if(activeSuggestion>=0){search.setAttribute('aria-activedescendant',options[activeSuggestion].id);options[activeSuggestion].scrollIntoView({block:'nearest'});}else search.removeAttribute('aria-activedescendant');}
 function showResults(matches){
  suggestions=uniqueRelationshipMatches(matches).map(match=>match.type);results.replaceChildren();activeSuggestion=-1;
  if(!search.value.trim()||!suggestions.length||suggestions.length>=10){hideResults();return;}
  suggestions.forEach((definition,index)=>{const option=make('button');option.type='button';option.role='option';option.id=`relationship-result-${index}`;option.tabIndex=-1;option.append(make('span',optionLabel(definition)),make('small',relationshipTags(definition).map(tag=>tag.label).join(' · ')));option.onmousedown=event=>event.preventDefault();option.onclick=()=>chooseResult(definition);results.append(option);});
  results.hidden=false;search.setAttribute('aria-expanded','true');if(suggestions.length===1)activeSuggestion=0;highlightResult();
 }
 function filter(){
  customChoice=null;useCustom.disabled=!search.value.trim()||search.value.trim().length>80;
  const matches=searchRelationshipCatalog(search.value);category.replaceChildren();placeholder(category,'Choose category');
  for(const group of [...matches].sort((a,b)=>alphabet.compare(a.label,b.label))){const option=make('option',group.label);option.value=group.id;category.append(option);}category.value='';category.disabled=!matches.length;
  fillTypes();const all=uniqueRelationshipMatches(matches);if(search.value.trim()&&all.length===1){category.value=selectTag(all[0].type);fillTypes(all[0].type.id);}showResults(matches);resultCount.textContent=search.value.trim()&&!matches.length?'No matching relationships. Try another word, or choose Use custom.':'';resultCount.hidden=!resultCount.textContent;
 }
 category.onchange=()=>{customChoice=null;hideResults();fillTypes(type.value);};
 type.onchange=()=>{const definition=relationshipType(type.value);if(definition){category.value=selectTag(definition);fillTypes(definition.id);}else{showType();enableAdd();}};search.oninput=filter;
 search.onkeydown=event=>{if(results.hidden)return;if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();activeSuggestion=(activeSuggestion+(event.key==='ArrowDown'?1:-1)+suggestions.length)%suggestions.length;highlightResult();}else if(event.key==='Enter'&&activeSuggestion>=0){event.preventDefault();chooseResult(suggestions[activeSuggestion]);}else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();hideResults();}};
 useCustom.onclick=()=>{hideResults();const name=search.value.trim();if(!name||name.length>80)return;customChoice={custom:true,name,categoryId:category.value||null};category.disabled=true;type.disabled=true;description.textContent='Definition: Custom relationship term supplied by the user.';description.hidden=false;example.textContent='';example.hidden=true;inverse.hidden=true;roleDetails.hidden=true;resultCount.hidden=false;resultCount.textContent=`Custom term selected: ${name}`;connectionName.textContent=name;connectionSymbol.textContent='';add.disabled=false;};
 const participants=make('div');participants.className='relationship-participants';
 const connection=make('div');connection.className='relationship-connector';const connectionName=make('strong'),connectionSymbol=make('span');connectionSymbol.className='relationship-symbol';
 const before=make('span','↓'),after=make('span','↓');before.setAttribute('aria-hidden','true');after.setAttribute('aria-hidden','true');connection.append(before,connectionName,connectionSymbol,after);const propertyPreview=make('p');propertyPreview.className='assertion-property-preview caption';propertyPreview.hidden=true;
 let index=0;for(const [label,unit] of [['Source — first selected unit',choice.pair.left],['Target — second selected unit',choice.pair.right]]){if(index++)participants.append(connection,propertyPreview);const excerpt=make('pre',unit.text.length>180?unit.text.slice(0,180)+'…':unit.text);excerpt.className='source-preview';participants.append(make('span',label),excerpt);}form.append(participants);const details=make('div');details.className='relationship-details';details.append(description,example,inverse,roleDetails,intro);form.append(details);
 const propertiesPanel=make('details');propertiesPanel.className='assertion-properties';propertiesPanel.append(make('summary','Assertion properties'));
 const negated=make('input');negated.type='checkbox';negated.setAttribute('aria-label','Negate assertion');const polarity=make('label','Negate assertion');polarity.className='assertion-polarity';polarity.append(negated);propertiesPanel.append(polarity);
 const certainty=make('select');certainty.setAttribute('aria-label','Assertion certainty');for(const [value,label] of [['unspecified','Unspecified'],['possible','Possible'],['probable','Probable'],['certain','Certain']]){const option=make('option',label);option.value=value;certainty.append(option);}
 const attribution=make('input');attribution.maxLength=200;attribution.setAttribute('aria-label','Assertion attribution');const scope=make('textarea');scope.rows=2;scope.maxLength=500;scope.setAttribute('aria-label','Assertion scope');
 for(const [label,control] of [['Certainty',certainty],['Attribution',attribution],['Scope',scope]]){const field=make('label',label);field.append(control);propertiesPanel.append(field);}form.append(propertiesPanel);const previewProperties=()=>{propertyPreview.textContent=assertionPropertyLabels({negated:negated.checked,certainty:certainty.value,attribution:attribution.value,scope:scope.value}).join(' · ');propertyPreview.hidden=!propertyPreview.textContent;};for(const control of [negated,certainty,attribution,scope])control.addEventListener('input',previewProperties);
 const error=make('p');error.role='alert';error.hidden=true;form.append(error);
 const actions=make('div');actions.className='dialog-actions';const cancel=make('button','Cancel'),add=make('button','Add relation');cancel.type='button';add.type='submit';add.className='primary-action';actions.append(cancel,add);form.append(actions);dialog.append(form);
 let finished=false;
 const editor=api.editorElement();
 function positionDialog(){const box=editor.getBoundingClientRect();dialog.style.width=Math.min(460,Math.max(320,box.width-24),innerWidth-24)+'px';const size=dialog.getBoundingClientRect();dialog.style.left=Math.max(8,Math.min(box.left+(box.width-size.width)/2,innerWidth-size.width-8))+'px';dialog.style.top=Math.max(8,Math.min(box.top+(box.height-size.height)/2,innerHeight-size.height-8))+'px';}
 const resize=new ResizeObserver(positionDialog);
 const dismissResults=event=>{if(!searchField.contains(event.target))hideResults();};
 document.addEventListener('pointerdown',dismissResults,true);window.addEventListener('resize',positionDialog);

 function cleanup(restore,afterRestore){
  if(finished)return;finished=true;resize.disconnect();document.removeEventListener('pointerdown',dismissResults,true);window.removeEventListener('resize',positionDialog);dialog.remove();api.focusEditor();if(!restore){afterRestore?.();return;}
  api.restore(context);
  // Native dialog focus restoration may reset DOM selection after this click ends.
  // Reapply once after layout, unless a new user gesture has already taken over.
  let pending=true;
  const stop=()=>{pending=false;document.removeEventListener('pointerdown',stop,true);document.removeEventListener('keydown',stop,true);};
  document.addEventListener('pointerdown',stop,true);document.addEventListener('keydown',stop,true);
  requestAnimationFrame(()=>{const restoreNow=pending&&api.current(context);stop();if(restoreNow){api.restore(context);api.focusEditor();afterRestore?.();}});
 }
 function close(afterRestore){dialog.close();cleanup(true,afterRestore);}
 cancel.onclick=()=>close();dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',()=>cleanup(false),{once:true});
 form.onsubmit=event=>{
  event.preventDefault();
  try{
   if(!api.current(context))throw Error('The selected source changed. Cancel and select the two units again.');
   const definition=relationshipType(type.value);if(!customChoice&&(!definition||!definition.categoryIds.includes(category.value)))throw Error('Choose a relationship from the selected category.');
   const id=api.create(context,choice,{...(customChoice??{predicateId:definition.id}),properties:assertionProperties({negated:negated.checked,certainty:certainty.value,attribution:attribution.value,scope:scope.value})});close(()=>api.inspect(id));
  }catch(reason){error.textContent=reason.message;error.hidden=false;}
 };
 filter();document.body.append(dialog);dialog.showModal();positionDialog();resize.observe(dialog);resize.observe(editor);search.focus();
}
