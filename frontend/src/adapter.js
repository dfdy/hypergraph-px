/**
 * # Hypergraph PX — Synthetic document adapter
 *
 * Exercise document editing, delayed acknowledgements and captured fragments
 * entirely within the demonstration browser tab.
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
 * Used by: Runtime requests and buffer coordination in the synthetic preview,
 * through the application shell.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: All positions are local UTF16 offsets. This fixture does not
 * authenticate users, persist documents, call HTTP or create canonical graph
 * identities.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/adapter.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

/** Provide the explicitly synthetic tab-local document and clipboard operations used by preview controls. */
export class FixtureAdapter {
 /** Initialize independent fixture documents and reset the tab-local clipboard and derivation counters. */
 constructor(documents){this.docs=new Map(documents.map(/* Pair each fixture identity with fresh local sequence and acknowledgement counters. */ d=>[d.id,{...d,sequence:0,acknowledged:0}]));this.clipboard=[];this.serial=0;this.pastes=[];}


 /** Return a defensive copy of a known fixture document, rejecting an unknown identity. */
 get(id){const d=this.docs.get(id);

  if(!d)throw new Error('Unknown fixture document');

  return {...d};}


 /** Replace one fixture buffer and advance its local edit sequence. */
 edit(id,source){const d=this.docs.get(id);

  if(!d)throw new Error('Unknown fixture document');

  d.source=source;

  return ++d.sequence;}


 /** Simulate a delayed acknowledgement for the exact sequence captured before waiting. */
 async checkpoint(id,delay=350){const captured=this.get(id);

  await new Promise(/* Resume the checkpoint simulation after the configured preview delay. */ r=>setTimeout(r,delay));

  const d=this.docs.get(id);

  d.acknowledged=Math.max(d.acknowledged,captured.sequence);

  return {document:id,sequence:captured.sequence,tabOnly:true};}


 /** Capture a nonempty scalar-safe UTF16 fragment from the exact fixture sequence, reusing only the identical capture. */
 capture(id,from,to){const d=this.get(id);

  if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<=from||to>d.source.length)throw new Error('Select a source range first');

  for(const p of [from,to]){const c=d.source.charCodeAt(p),prev=d.source.charCodeAt(p-1);

   if(c>=0xDC00&&c<=0xDFFF&&prev>=0xD800&&prev<=0xDBFF)throw new Error('Selection splits a Unicode character');}

  const found=this.clipboard.find(/* Find an already captured fragment with the same document, sequence and range. */ e=>e.document===id&&e.sequence===d.sequence&&e.from===from&&e.to===to);

  if(found)return found;

  const entry={id:`demo:clip:${++this.serial}`,document:id,title:d.title,sequence:d.sequence,from,to,text:d.source.slice(from,to)};

  this.clipboard.push(entry);

  return entry;}


 /** Remove the requested fixture clipboard entry without changing document content. */
 remove(id){this.clipboard=this.clipboard.filter(/* Retain every clipboard entry except the selected identity. */ e=>e.id!==id);}


 /** Freeze selected clipboard fragments into one synthetic paste plan, rejecting missing selections. */
 forkPlan(ids){const entries=ids.map(/* Resolve each selected clipboard identity to its current fixture entry. */ id=>this.clipboard.find(/* Match the exact selected clipboard identity. */ e=>e.id===id));

  if(!entries.length||entries.some(/* Detect a selection whose clipboard entry no longer exists. */ e=>!e))throw new Error('Clipboard selection changed');

  return {id:`demo:paste:${++this.serial}`,entries:entries.map(/* Copy each captured entry so later clipboard mutations cannot retarget the plan. */ e=>({...e})),text:entries.map(/* Collect captured fragment text in the user-selected order. */ e=>e.text).join('\n\n')};}


 /** Record synthetic paste provenance and optionally clear only the entries used by that plan. */
 finishFork(plan,clear){this.pastes.push({id:plan.id,sources:plan.entries.map(/* Retain each fragment's original document, sequence and range in paste evidence. */ e=>({document:e.document,sequence:e.sequence,from:e.from,to:e.to}))});

  if(clear){const ids=new Set(plan.entries.map(/* Collect identities of the clipboard entries used by the completed paste. */ e=>e.id));

   this.clipboard=this.clipboard.filter(/* Keep entries not consumed by this paste's optional clear operation. */ e=>!ids.has(e.id));}}


 /** Create an independent fixture node only if the captured source sequence and exact text still match. */
 createFork(context,title,attribution){const source=this.get(context.document);

  if(source.sequence!==context.sequence||source.source.slice(context.from,context.to)!==context.text)throw new Error('Fork source changed');

  if(!context.text||!title.trim())throw new Error('Fork requires selected source and a name');

  const id=`demo:fork:${++this.serial}`,record={id,title:title.trim(),source:context.text,sequence:0,acknowledged:0,attribution,fixtureFork:{document:context.document,sequence:context.sequence,from:context.from,to:context.to}};

  this.docs.set(id,record);this.pastes.push({id:`demo:derivation:${this.serial}`,destination:id,sources:[record.fixtureFork]});

  return this.get(id);}

}
