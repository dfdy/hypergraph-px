import {selectionKind} from './selection.js';
import {documentHeadings,selectedWords} from './context-actions.js';

const make = (tag,text) => {const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
export function installFunctionsBar(api) {
  const fork=document.querySelector('#forkSelection');
  const link=document.querySelector('#linkSelection');
  const embed=document.querySelector('#embedSelection');
  function frozen() {return Object.freeze({...api.getContext()});}
  function current(context) {
    return api.getContext().document===context.document && api.getDocument(context.document).sequence===context.sequence;
  }
  function modal(title,description,context) {
    const dialog=make('dialog');dialog.className='function-dialog';
    const heading=make('h2',title);heading.id='function-dialog-title';
    dialog.setAttribute('aria-labelledby',heading.id);
    dialog.append(heading,make('p',description));
    const body=make('div');dialog.append(body);
    const actions=make('div');actions.className='dialog-actions';
    const cancel=make('button','Cancel');cancel.type='button';
    actions.append(cancel);dialog.append(actions);
    let finished=false;
    function cleanup(restore){if(finished)return;finished=true;dialog.remove();if(restore)api.restoreContext(context);api.focusEditor();}
    function close(){dialog.close();cleanup(true);}
    cancel.onclick=close;
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
    dialog.addEventListener('close',()=>cleanup(false),{once:true});
    document.body.append(dialog);dialog.showModal();
    return {dialog,body,actions,close};
  }
  function field(parent,label,control) {
    const element=make('label',label);element.append(control);parent.append(element);
    control.setAttribute('aria-label',label);return control;
  }
  function preview(parent,text) {
    const element=make('pre',text);element.className='source-preview';parent.append(element);return element;
  }
  for(const button of [fork,link,embed])button.onmousedown=event=>event.preventDefault();
  fork.onclick=()=>{
    if(api.runtime){
      const context=frozen();if(context.from===context.to)return;
      const {dialog,body,actions,close}=modal('Fork selected content','Create an independent document from this committed selection. Its history will retain the exact source. You can edit either document independently.',context);
      const title=field(body,'Fork name',make('input'));title.value=`Fork of ${context.title}`;title.maxLength=512;
      preview(body,api.exactSelection(context));const message=make('p');message.setAttribute('role','status');body.append(message);
      const create=make('button','Create fork');create.className='primary-action';
      create.onclick=async()=>{
        if(!current(context)){message.textContent='Source changed. Reopen Fork against the current selection.';return;}
        if(!title.value.trim()){title.focus();return;}
        create.disabled=title.disabled=actions.firstElementChild.disabled=true;dialog.oncancel=e=>e.preventDefault();
        try{await api.createRuntimeFork(context,title.value.trim());close();}catch(error){message.textContent=error.message;}
        finally{title.disabled=actions.firstElementChild.disabled=false;dialog.oncancel=null;}
      };actions.append(create);title.focus();title.select();return;
    }
    const context=frozen(),kind=selectionKind(api.getDocument(context.document).source,context.from,context.to);
    if(!kind){api.notify('Select a whole sentence, paragraph or section to fork.');return;}
    const {dialog,body,actions,close}=modal('Fork selected content','Create an independent test document in this tab. The source stays unchanged. This preview does not save version history.',context);
    const title=field(body,'Fork name',make('input'));title.value=`Fork of ${context.title}`;
    body.append(make('p',`Captured ${kind.kind} · ${context.title} · local sequence ${context.sequence}`));
    preview(body,context.text);
    const create=make('button','Create demo fork');create.className='primary-action';
    create.onclick=()=>{
      if(!current(context)){api.notify('Source changed. Reopen Fork against the current selection.');close();return;}
      if(!title.value.trim()){title.focus();return;}
      api.createFork(context,title.value.trim());close();
    };
    actions.append(create);title.focus();title.select();
  };
  link.onclick=()=>{
    const context=frozen(),headings=documentHeadings(api.getDocument(context.document).source);
    if(!headings.length)return;
    const {dialog,body,actions,close}=modal('Link to a heading','Insert a Markdown heading link in this document. Graph relationships are not connected in this preview.',context);
    const target=field(body,'Target heading',make('select'));
    headings.forEach((h,i)=>{const option=make('option',h.label);option.value=i;target.append(option);});
    const label=field(body,'Link text',make('input'));label.value=context.text||headings[0].label;
    const insert=make('button','Insert Markdown link');insert.className='primary-action';
    insert.onclick=()=>{
      if(!current(context)){api.notify('Source changed. Reopen Link against the current document.');close();return;}
      if(!label.value.trim()){label.focus();return;}
      api.insertLink(context,headings[Number(target.value)],label.value.trim());close();
    };
    actions.append(insert);
  };
  embed.onclick=()=>{
    const context=frozen(),documents=api.listDocuments();
    const {dialog,body,actions,close}=modal('Embed content','Include shared source content at another location. You can choose and inspect the source here; inserting shared content is not available in this preview.',context);
    const source=field(body,'Source document',make('select'));
    documents.forEach(d=>{const option=make('option',d.title);option.value=d.id;source.append(option);});source.value=context.document;
    const section=field(body,'Source section',make('select'));
    const policy=field(body,'Resolution policy',make('select'));
    const pinned=make('option','Pinned — keep the selected version');pinned.value='pinned';
    const live=make('option','Live — follow source updates (not yet available)');live.value='live';live.disabled=true;policy.append(pinned,live);
    const origin=make('p');body.append(origin);const text=preview(body,'');let choices=[];
    function show(){const d=api.getDocument(source.value);choices=[{label:'Entire document',from:0,to:d.source.length},...documentHeadings(d.source)];section.replaceChildren();choices.forEach((h,i)=>{const option=make('option',h.label);option.value=i;section.append(option);});showSection();}
    function showSection(){const d=api.getDocument(source.value),h=choices[Number(section.value)];origin.textContent=`Preview source: ${d.title} · current tab state`;text.textContent=d.source.slice(h.from,h.to);}
    source.onchange=show;section.onchange=showSection;show();
    const insert=make('button','Insert embed');insert.disabled=true;insert.title='Shared embeds are not available in this preview';actions.append(insert);
    actions.firstElementChild.textContent='Close';
  };
  return {update(context){
    const source=api.getDocument(context.document).source;
    fork.disabled=api.runtime?(!api.forkSupported||!api.canFork()||context.from===context.to):!selectionKind(source,context.from,context.to);
    embed.disabled=!!api.runtime;
    fork.title=api.runtime?'Create an independent document from committed source':fork.disabled?'Select a whole sentence, paragraph or section':'Create an independent tab-only demo fork';
    link.disabled=!documentHeadings(source).length||context.from!==context.to&&!selectedWords(source,context.from,context.to);
    link.title=link.disabled?'Use a caret or whole-word selection in a document with headings':'Insert a plain Markdown heading link';
    embed.title='Choose and preview shared source content';
  }};
}
