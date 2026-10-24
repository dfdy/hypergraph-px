export const TOOLTIP_DELAY = 3100;
const targets = 'button,a,input,select,textarea,[role="slider"],[role="separator"],.math-rendered[tabindex="0"],.table-author-text[tabindex="0"]';

export function installTooltips(root = document) {
  const tip = document.createElement('div');
  tip.id = 'interface-tooltip';
  tip.role = 'tooltip';
  tip.hidden = true;
  document.body.append(tip);
  let pointerDown = false;
  let target = null, timer, originalDescription = null, pointer = {x:-1,y:-1};
  function suppressNative(element) {
    if (element.hasAttribute('title')) {
      element.dataset.tooltip = element.getAttribute('title');
      element.removeAttribute('title');
    }
  }
  function scan(parent) {
    if (parent instanceof Element) suppressNative(parent);
    parent.querySelectorAll?.('[title]').forEach(suppressNative);
  }
  scan(root);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') suppressNative(record.target);
      for (const child of record.addedNodes) scan(child);
    }
    if (target && !target.isConnected) hide();
  }).observe(root, {subtree:true,childList:true,attributes:true,attributeFilter:['title']});
  function hide() {
    clearTimeout(timer);
    tip.hidden = true;
    if (target) {
      if (originalDescription === null) target.removeAttribute('aria-describedby');
      else target.setAttribute('aria-describedby', originalDescription);
    }
    target = null;
  }
  function showFor(element) {
    if (pointerDown || element === target) return;
    hide();
    target = element;
    suppressNative(element);
    originalDescription = element.getAttribute('aria-describedby');
    timer = setTimeout(() => {
      if (!element.isConnected || target !== element) return;
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
  root.addEventListener('pointermove', e => {pointer = {x:e.clientX,y:e.clientY};});
  root.addEventListener('pointerover', e => {
    pointer = {x:e.clientX,y:e.clientY};
    const element = e.target.closest?.(targets);
    if (element) showFor(element);
  });
  root.addEventListener('pointerout', e => {
    if (target && !target.contains(e.relatedTarget)) hide();
  });
  root.addEventListener('focusin', e => {
    const element = e.target.closest?.(targets);
    if (element) showFor(element);
  });
  root.addEventListener('focusout', hide);
  root.addEventListener('pointerdown', () => {pointerDown = true; hide();}, true);
  root.addEventListener('pointerup', () => {pointerDown = false;}, true);
  root.addEventListener('pointercancel', () => {pointerDown = false;}, true);
  root.addEventListener('scroll', () => {
    hide();
    requestAnimationFrame(() => {
      const hovered = document.elementFromPoint(pointer.x, pointer.y)?.closest(targets);
      if (hovered) showFor(hovered);
    });
  }, true);
  root.addEventListener('keydown', e => {if (e.key === 'Escape') hide();});
}
