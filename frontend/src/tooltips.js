/**
 * # Hypergraph PX — Delayed accessible control explanations
 *
 * Adds delayed descriptions to ambiguous controls, replacing native title tooltips
 * and preserving existing accessible descriptions.
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
 * Used by: Interface shell and navigation — application controls, rendered math
 * and table source widgets.
 *
 * Specification:
 * - [Browser component responsibilities][spec-1]
 * - [Frontend interaction contract][spec-2]
 *
 * Boundary: Self-labelled controls do not receive redundant tooltips. Tips appear
 * after 1500 ms and are suppressed during pointer interactions.
 *
 * [source]: https://github.com/dfdy/hypergraph-px/blob/main/frontend/src/tooltips.js
 * [spec-1]: ../../docs/06-subsystems/diagrams/browser/interface.c4
 * [spec-2]: ../../docs/06-subsystems/frontend-interaction.md
 */

import {isDescriptiveControlLabel} from './control-labels.js';

/** Keep the owner-specified ambiguous-control hover delay in milliseconds. */
export const TOOLTIP_DELAY = 1500;

const targets = 'button,a,input,select,textarea,[role="slider"],[role="separator"],.math-rendered[tabindex="0"],.table-author-text[tabindex="0"]';

/** Install shared delayed tooltips for controls within the supplied DOM root. */
export function installTooltips(root = document) {
  const tip = document.createElement('div');


  tip.id = 'interface-tooltip';
  tip.role = 'tooltip';
  tip.hidden = true;
  document.body.append(tip);


  let pointerDown = false;


  let target = null, timer, originalDescription = null, pointer = {x:-1,y:-1};


  /** Move native title text into controlled tooltip metadata to prevent competing browser tips. */
  function suppressNative(element) {
    if (element.hasAttribute('title')) {
      element.dataset.tooltip = element.getAttribute('title');
      element.removeAttribute('title');
    }
  }


  /** Suppress native titles on the root and its newly discovered descendants. */
  function scan(parent) {
    if (parent instanceof Element) suppressNative(parent);


    parent.querySelectorAll?.('[title]').forEach(suppressNative);
  }


  scan(root);
  new MutationObserver(/* Process dynamically inserted controls and hide a tooltip whose target was removed. */ records => {
    for (const record of records) {
      if (record.type === 'attributes') suppressNative(record.target);


      for (const child of record.addedNodes) scan(child);
    }


    if (target && !target.isConnected) hide();
  }).observe(root, {subtree:true,childList:true,attributes:true,attributeFilter:['title']});


  /** Cancel pending display and restore the target’s original accessible description. */
  function hide() {
    clearTimeout(timer);
    tip.hidden = true;


    if (target) {
      if (originalDescription === null) target.removeAttribute('aria-describedby');
      else target.setAttribute('aria-describedby', originalDescription);
    }


    target = null;
  }


  /** Detect controls whose visible labels already explain their action. */
  function selfLabelled(element){
    if(element.matches('.chapter-open,.heading-open'))return true;


    const labelled=[...(element.labels??[])].map(/* Extract associated label text for descriptive-label assessment. */ label=>label.innerText??label.textContent).join(' ');


    if(isDescriptiveControlLabel(labelled))return true;


    if(element.matches('button,a,[role="button"]'))return isDescriptiveControlLabel(element.innerText??element.textContent);


    if(element.matches('input,textarea')&&!element.value)return isDescriptiveControlLabel(element.getAttribute('placeholder'));


    return false;
  }


  /** Schedule one ambiguous control’s explanation without disrupting pointer interactions. */
  function showFor(element) {
    // Explorer labels already name their destination; keep disclosure-control tips.
    if (selfLabelled(element)) {hide();

   return;}


    if (pointerDown || element === target) return;


    hide();
    target = element;
    suppressNative(element);
    originalDescription = element.getAttribute('aria-describedby');
    timer = setTimeout(/* Show a still-current control’s description inside its modal host and within viewport bounds. */ () => {
      if (!element.isConnected || target !== element) return;


      if(selfLabelled(element)){hide();

    return;}


      const host = element.closest('dialog[open]') || document.body;


      if (tip.parentElement !== host) host.append(tip);


      const name = element.getAttribute('aria-label') || element.labels?.[0]?.textContent ||
        element.getAttribute('placeholder') || element.textContent;


      const description = element.dataset.tooltip;


      const label = name?.trim() || description?.trim();


      if (!label) return;


      tip.textContent = description && !description.includes(label) ? `${label} — ${description}` : label;
      tip.hidden = false;


      const box = element.getBoundingClientRect();


      tip.style.left = `${Math.max(8, Math.min(box.left, innerWidth - tip.offsetWidth - 8))}px`;
      tip.style.top = `${box.bottom + tip.offsetHeight + 14 < innerHeight ? box.bottom + 8 : Math.max(8, box.top - tip.offsetHeight - 8)}px`;
      element.setAttribute('aria-describedby', [originalDescription, tip.id].filter(Boolean).join(' '));
    }, TOOLTIP_DELAY);
  }


  root.addEventListener('pointermove', /* Remember pointer coordinates for post-scroll hover reassessment. */ e => {pointer = {x:e.clientX,y:e.clientY};});
  root.addEventListener('pointerover', /* Schedule a tooltip when the pointer enters an eligible control. */ e => {
    pointer = {x:e.clientX,y:e.clientY};


    const element = e.target.closest?.(targets);


    if (element) showFor(element);
  });
  root.addEventListener('pointerout', /* Hide the current tooltip when the pointer leaves its target subtree. */ e => {
    if (target && !target.contains(e.relatedTarget)) hide();
  });
  root.addEventListener('focusin', /* Provide the same delayed explanation for keyboard focus. */ e => {
    const element = e.target.closest?.(targets);


    if (element) showFor(element);
  });
  root.addEventListener('focusout', hide);
  root.addEventListener('pointerdown', /* Suppress tooltip display throughout pointer dragging or clicking. */ () => {pointerDown = true; hide();}, true);
  root.addEventListener('pointerup', /* Allow tooltip scheduling after pointer release. */ () => {pointerDown = false;}, true);
  root.addEventListener('pointercancel', /* Recover tooltip eligibility after pointer cancellation. */ () => {pointerDown = false;}, true);
  root.addEventListener('scroll', /* Hide stale geometry during scroll and reassess the hovered control next frame. */ () => {
    hide();
    requestAnimationFrame(/* Locate the control now under the remembered pointer after scrolling. */ () => {
      const hovered = document.elementFromPoint(pointer.x, pointer.y)?.closest(targets);


      if (hovered) showFor(hovered);
    });
  }, true);
  root.addEventListener('keydown', /* Dismiss tooltip presentation with Escape. */ e => {if (e.key === 'Escape') hide();});
}
