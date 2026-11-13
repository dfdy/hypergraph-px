import {StateEffect,StateField} from '@codemirror/state';
import {Decoration,EditorView} from '@codemirror/view';
import {documentPresentation} from './document-presentation.js';
export const setMarkdownSource=StateEffect.define();
function projection(state,source){return {source,decorations:source?Decoration.none:Decoration.set(documentPresentation(state).hidden.map(range=>Decoration.replace({}).range(range.from,range.to)),true)};}
export const inlinePresentation=StateField.define({
 create:state=>projection(state,false),
 update(value,tr){let source=value.source;for(const effect of tr.effects)if(effect.is(setMarkdownSource))source=effect.value===true;return tr.docChanged||source!==value.source?projection(tr.state,source):value;},
 provide:field=>[EditorView.decorations.from(field,value=>value.decorations),EditorView.atomicRanges.of(view=>view.state.field(field).decorations)]
});
