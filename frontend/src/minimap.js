// Geometry comes from this editor's measured/estimated line blocks, never a
// separately wrapped plain-text view. Visible rendered widgets are cloned.
export function renderMinimap(view, track, layer, viewport) {
  const scroll = view.scrollDOM;
  const content = view.contentDOM;
  const style = getComputedStyle(content);
  const width = content.clientWidth;
  if (!width || !track.clientHeight) return;
  const scale = Math.min(0.1, track.clientWidth / width);
  const total = scroll.scrollHeight;
  const maxScroll = Math.max(0, total - scroll.clientHeight);
  const progress = maxScroll ? scroll.scrollTop / maxScroll : 0;
  const overflow = Math.max(0, total * scale - track.clientHeight);
  const offset = progress * overflow;
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingRight = parseFloat(style.paddingRight);
  layer.style.cssText = `position:absolute;left:0;top:${-offset}px;width:${width}px;height:${total}px;transform:scale(${scale});transform-origin:top left;pointer-events:none;`;
  layer.style.fontFamily = style.fontFamily;
  layer.style.fontSize = style.fontSize;
  layer.style.lineHeight = '1.9';
  const nodes = [];
  const seen = new Set();
  for (let n = 1; n <= view.state.doc.lines; n++) {
    const line = view.state.doc.line(n);
    const block = view.lineBlockAt(line.from);
    // Replaced block widgets cover several source lines, drawn only once.
    if (seen.has(block.from)) continue;
    seen.add(block.from);
    const widget = view.dom.querySelector(`[data-table-from="${block.from}"], [data-math-from="${block.from}"]`);
    let mini, measuredTop = null, measuredHeight = null;
    if (widget) {
      mini = widget.cloneNode(true);
      mini.querySelectorAll('button,input,textarea,.table-caption,.table-hint').forEach(e => e.remove());
      mini.querySelectorAll('[tabindex],[id]').forEach(e => {e.removeAttribute('tabindex');e.removeAttribute('id');});
      mini.style.margin = '0';
      measuredTop = widget.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop;
      measuredHeight = widget.getBoundingClientRect().height;
    } else {
      const visible = view.domAtPos(line.from).node;
      let actual = (visible.nodeType === 1 ? visible : visible.parentElement)?.closest('.cm-line');
      if (actual && view.posAtDOM(actual, 0) !== line.from) actual = null;
      mini = actual ? actual.cloneNode(true) : document.createElement('div');
      if (!actual) mini.textContent = line.text;
      mini.classList.add('mini-source-line');
      mini.querySelectorAll('[tabindex],[id]').forEach(e => {e.removeAttribute('tabindex');e.removeAttribute('id');});
      const heading = /^#{1,4}(?=\s)/.exec(line.text);
      if (heading) mini.classList.add(`cm-h${heading[0].length}`);
      mini.style.whiteSpace = 'pre-wrap';
      mini.style.overflowWrap = 'anywhere';
      mini.style.padding = '0 4px';
      if (actual) {
        measuredTop = actual.getBoundingClientRect().top - scroll.getBoundingClientRect().top + scroll.scrollTop;
        measuredHeight = actual.getBoundingClientRect().height;
        const measured = getComputedStyle(actual);
        mini.style.fontSize = measured.fontSize;
        mini.style.lineHeight = measured.lineHeight;
        mini.style.fontWeight = measured.fontWeight;
      }
    }
    mini.dataset.sourceFrom = line.from;
    mini.style.position = 'absolute';
    mini.style.left = `${paddingLeft}px`;
    mini.style.top = `${measuredTop ?? view.documentPadding.top + block.top}px`;
    mini.style.width = `${width - paddingLeft - paddingRight}px`;
    mini.style.maxHeight = `${Math.max(1, measuredHeight ?? block.height)}px`;
    mini.style.overflow = 'hidden';
    nodes.push(mini);
  }
  layer.replaceChildren(...nodes);
  const height = scroll.clientHeight * scale;
  viewport.style.height = `${height}px`;
  viewport.style.top = `${scroll.scrollTop * scale - offset}px`;
  viewport.setAttribute('aria-valuenow', Math.round(progress * 100));
  track.dataset.scale = scale;
  track.dataset.offset = offset;
  track.dataset.travel = Math.max(0, Math.min(total * scale, track.clientHeight) - height);
}

export function bindMinimap(track, viewport, getView) {
  track.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    track.setPointerCapture(event.pointerId);
    const rect = track.getBoundingClientRect();
    const grab = event.target === viewport
      ? event.clientY - viewport.getBoundingClientRect().top
      : viewport.getBoundingClientRect().height / 2;
    const move = e => {
      const view = getView();
      const travel = Number(track.dataset.travel);
      const progress = travel ? Math.max(0, Math.min(1, (e.clientY - rect.top - grab) / travel)) : 0;
      view.scrollDOM.scrollTop = progress * (view.scrollDOM.scrollHeight - view.scrollDOM.clientHeight);
    };
    if (event.target !== viewport) move(event);
    const finish = () => {
      track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', finish);
      track.removeEventListener('pointercancel', finish);
    };
    track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', finish);
    track.addEventListener('pointercancel', finish);
  });
}
