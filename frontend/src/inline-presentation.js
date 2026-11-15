/**
 * # Hypergraph PX — Reversible inline Markdown presentation
 *
 * Derive hidden-syntax decorations from the editor source while retaining a switch
 * back to literal Markdown.
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
 * Used by: Owned-source editing and presentation in the CodeMirror document editor.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: Decorations change presentation and atomic navigation ranges only;
 * they never rewrite authored source or create another document identity.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/inline-presentation.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {StateEffect,StateField} from '@codemirror/state';
import {Decoration,EditorView} from '@codemirror/view';
import {documentPresentation} from './document-presentation.js';

/** Select literal-source versus rendered inline presentation through an editor effect. */
export const setMarkdownSource=StateEffect.define();

/** Build a presentation projection, exposing no hidden-syntax replacements in source mode. */
function projection(state,source){return {source,decorations:source?Decoration.none:Decoration.set(documentPresentation(state).hidden.map(/* Replace one hidden notation range visually without modifying its source bytes. */ range=>Decoration.replace({}).range(range.from,range.to)),true)};}

/** Maintain source/render mode and its derived replacement decorations as editor state. */
export const inlinePresentation=StateField.define({
 create:/* Initialize the editor in rendered inline presentation mode. */ state=>projection(state,false),
 /** Recompute presentation after source edits or an explicit source-mode change. */
 update(value,tr){let source=value.source;

 for(const effect of tr.effects)if(effect.is(setMarkdownSource))source=effect.value===true;

 return tr.docChanged||source!==value.source?projection(tr.state,source):value;},
 provide:/* Expose presentation decorations and their matching atomic ranges to CodeMirror. */ field=>[EditorView.decorations.from(field,/* Read the current field's derived decoration set. */ value=>value.decorations),EditorView.atomicRanges.of(/* Use the same replacement ranges for atomic cursor navigation as for visual rendering. */ view=>view.state.field(field).decorations)]
});
