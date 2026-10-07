/* Design system reference: tokens, type, buttons, states, art. Part of the prototype, for review. */
ZQ.screen({
  id: 'system', title: 'Design system', group: 'Reference', shell: true, tab: 'none',
  render(root, Z) {
    const sw = (name, v, note = '') => `<div class="ds-sw"><i style="background:var(${v})"></i><b>${name}</b><span>${note || v.replace('--', '')}</span></div>`;
    root.innerHTML = `
    <div class="ds">
      <header class="ds-head"><div class="t-overline muted">Reference</div><h1 class="t-course-title" style="margin:4px 0 8px">Design system</h1>
        <p class="t-body secondary" style="margin:0;max-width:62ch">Tokens recreated from the research spec (docs/design-research.md). White, neutral ink, colour kept for verdicts, the streak and track identity. Switch theme from the prototype tab on the left edge.</p></header>

      <section><h2 class="t-h1">Colour</h2>
        <h3 class="t-overline muted">Surfaces and ink</h3><div class="ds-grid">${sw('Canvas', '--bg-canvas')}${sw('Sunken', '--bg-sunken')}${sw('Line', '--line')}${sw('Ink', '--ink')}${sw('Secondary', '--text-2')}${sw('Muted', '--text-muted')}</div>
        <h3 class="t-overline muted">Verdicts</h3><div class="ds-grid">${sw('Progress', '--green-brand')}${sw('Correct face', '--green-face')}${sw('Correct frame', '--green-frame')}${sw('Not yet face', '--amber-face')}${sw('Not yet frame', '--amber-frame')}${sw('Hint', '--hint')}</div>
        <h3 class="t-overline muted">Streak and interaction</h3><div class="ds-grid">${sw('Pear 300', '--pear-300')}${sw('Pear 500', '--pear-500')}${sw('Pear 600', '--pear-600')}${sw('Movable', '--manip')}${sw('Neutral action', '--neutral-face')}${sw('Keyword', '--code-keyword')}</div>
        <h3 class="t-overline muted">Tracks</h3><div class="ds-grid">${['maths', 'prob', 'code', 'fin', 'ml', 'speed'].map(t => sw(Z.data().trackShort[t], '--' + t)).join('')}</div>
        <h3 class="t-overline muted">Charts (validated order)</h3><div class="ds-grid">${[1, 2, 3, 4, 5, 6].map(i => sw('Slot ' + i, '--s' + i)).join('')}</div>
      </section>

      <section><h2 class="t-h1">Type</h2>
        <div class="ds-type">
          <div><span class="t-caption muted">Display · Besley 500</span><div class="t-display">Zero to quant, one problem at a time.</div></div>
          <div><span class="t-caption muted">Lesson title · Archivo 700</span><div class="t-lesson-title">Shrinking the sample space</div></div>
          <div><span class="t-caption muted">Course title</span><div class="t-course-title">Conditional Probability</div></div>
          <div><span class="t-caption muted">Prose · 17/25</span><p class="t-prose" style="margin:0;max-width:540px">You roll two dice. A friend peeks and says the first die shows a <b>5</b>. Some outcomes are now impossible. Probability is what is left, measured again: ${Z.tex('P(A \\mid B) = \\dfrac{|A \\cap B|}{|B|}')}</p></div>
          <div><span class="t-caption muted">Overline · Stat · Code</span><div class="t-overline" style="color:var(--prob-deep)">Level 1</div><div class="t-stat">1,240</div><code class="t-code">def max_drawdown(prices: list[float]) -> float:</code></div>
        </div>
      </section>

      <section><h2 class="t-h1">Buttons</h2>
        <p class="t-body secondary" style="margin:0 0 16px">Pills with a hard 4px lip. Press one: the face sinks into the lip.</p>
        <div class="ds-row">
          <button class="btn" disabled>Check</button><button class="btn">Check</button><button class="btn secondary">Why?</button>
          <button class="btn correct">Continue</button><button class="btn secondary">Get help</button><button class="btn notyet">Try again</button>
          <span data-track="prob"><button class="btn track">Continue course</button></span><span data-track="maths"><button class="btn track lg">Start</button></span>
        </div>
      </section>

      <section><h2 class="t-h1">Answer states</h2>
        <div class="opts two" style="max-width:540px">
          <button class="opt">${Z.tex('\\tfrac{5}{36}')}</button>
          <button class="opt selected">${Z.tex('\\tfrac{1}{6}')}</button>
          <button class="opt correct">${Z.tex('\\tfrac{1}{11}')}<span class="badge">${Z.icon('check')}</span></button>
          <button class="opt wrong">${Z.tex('\\tfrac{1}{12}')}<span class="badge">${Z.icon('cross')}</span></button>
        </div>
        <div class="ds-row" style="margin-top:16px">
          <span class="chip correct">${Z.icon('check', 'xs')} Correct · +15 XP</span><span class="chip notyet">${Z.icon('cross', 'xs')} Not quite right</span>
          <span class="streak-pill">11${Z.bolt(true)}<span class="rest-slots"><i class="on"></i><i></i></span></span><span class="streak-pill">11${Z.bolt(false)}<span class="rest-slots"><i class="on"></i><i></i></span></span>
        </div>
        <div style="max-width:420px;margin-top:16px">${Z.weekStrip()}</div>
        <div style="max-width:540px;margin-top:16px;display:grid;gap:12px"><div class="bar"><i style="width:40%"></i></div><div class="dots"><i class="ok"></i><i class="bad"></i><i class="cur"></i><i></i><i></i></div></div>
      </section>

      <section><h2 class="t-h1">Course art</h2>
        <div class="ds-art">${['die', 'tree', 'bars', 'bell', 'walk', 'matrix', 'payoff', 'layers', 'code', 'candles', 'scatter', 'balance', 'circle', 'surface', 'timer', 'graph'].map((k, i) => {
          const t = ['prob', 'prob', 'prob', 'prob', 'prob', 'maths', 'fin', 'ml', 'code', 'fin', 'ml', 'maths', 'maths', 'maths', 'speed', 'code'][i];
          return `<figure data-track="${t}"><div class="ds-art-box">${ZQArt(k)}</div><figcaption class="t-caption muted">${k}</figcaption></figure>`; }).join('')}</div>
      </section>
    </div>`;
  },
});
