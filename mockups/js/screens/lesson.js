/* Lesson player. Course: Conditional Probability (topic 1.5), Level 1, lesson 3, "Shrinking the sample space".
   Follows docs/design-research.md: 4.5 to 4.9 (feedback, progress, celebrations, transitions, reduced motion),
   5 (lesson anatomy, interaction catalogue and the Check state machine), 8.3 (sequencing) and 9 (voice).
   Routes: #lesson starts at the title, #lesson-quiz at the lesson quiz, #lesson-complete at the celebration.
   Every class is prefixed lsn- so nothing leaks into other screens. */
(function () {
  'use strict';

  const D6 = [1, 2, 3, 4, 5, 6];
  const N = 9;                 // lesson screens; one trailing pill in the top bar stands for the quiz
  const SEED = 4226;           // simulation seed, so the rolls repeat exactly
  const XP = { first: 15, retry: 5, quiz: 15, finish: 20, perfect: 15 };
  const RUNGS = ['Nudge', 'Point', 'Step'];
  const fmt = (n) => Math.round(n).toLocaleString('en-GB');
  const clock = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, '0')}`;
  const rngFrom = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0; let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const parseNum = (s) => {
    const v = String(s).replace(/\s+/g, '');
    let m = v.match(/^(-?\d+)\/(\d+)$/);
    if (m) return +m[2] ? +m[1] / +m[2] : NaN;
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(v)) return parseFloat(v);
    return NaN;
  };
  /* Like Z.md, but keeps punctuation that follows a formula on the same line, and keeps cell pairs such as (5, 5) together */
  const mdx = (Z, str) => String(str)
    .replace(/\((\d), (\d)\)/g, '($1,&nbsp;$2)')
    .replace(/\$\$([^$]+)\$\$/g, (_, m) => Z.tex(m, true))
    .replace(/\$([^$]+)\$([.,:;?]?)/g, (_, m, p) => `<span class="lsn-nw">${Z.tex(m)}${p}</span>`);
  const cbar = (caption) => `<div class="lsn-cbar"><span class="t-caption lsn-cap">${caption}</span><button type="button" class="link-btn lsn-so" disabled>Start over</button></div>`;
  const acceptedLine = (html) => `<p class="t-caption lsn-accept" hidden>${html}</p>`;

  /* ---------- Two-dice sample space: 6 x 6 grid, rows = first die, columns = second die ---------- */
  function DiceGrid(ctx, { interactive = false, label }) {
    const { Z } = ctx;
    const cellHTML = (r, c) => interactive
      ? `<button type="button" class="lsn-cell" data-r="${r}" data-c="${c}" aria-pressed="false" tabindex="${r === 1 && c === 1 ? 0 : -1}" aria-label="First die ${r}, second die ${c}"><span aria-hidden="true">${r}, ${c}</span></button>`
      : `<div class="lsn-cell" data-r="${r}" data-c="${c}"><span>${r}, ${c}</span></div>`;
    const el = Z.h(`<div class="lsn-dg${interactive ? '' : ' compact'}">
      <span class="lsn-dg-x t-caption" aria-hidden="true">Second die</span>
      <span class="lsn-dg-y t-caption" aria-hidden="true"><span>First die</span></span>
      <div class="lsn-dg-ch" aria-hidden="true">${D6.map(c => `<span>${c}</span>`).join('')}</div>
      <div class="lsn-dg-rh" aria-hidden="true">${D6.map(r => `<span>${r}</span>`).join('')}</div>
      <div class="lsn-cells" role="${interactive ? 'group' : 'img'}" aria-label="${Z.esc(label)}">${D6.map(r => D6.map(c => cellHTML(r, c)).join('')).join('')}<svg class="lsn-dg-ov" aria-hidden="true"><path class="lsn-dg-b" d=""/></svg></div>
    </div>`);
    const cellsEl = el.querySelector('.lsn-cells');
    const svg = el.querySelector('.lsn-dg-ov'), outlinePath = svg.querySelector('path');
    const map = new Map();
    cellsEl.querySelectorAll('.lsn-cell').forEach(n => map.set(n.dataset.r + n.dataset.c, n));
    const cell = (r, c) => map.get('' + r + c);
    const each = (fn) => D6.forEach(r => D6.forEach(c => fn(cell(r, c), r, c)));
    let shape = null, ptList = null, ptEl = null;
    const box = (r, c) => { const e = cell(r, c); return { x: e.offsetLeft, y: e.offsetTop, X: e.offsetLeft + e.offsetWidth, Y: e.offsetTop + e.offsetHeight }; };
    const half = () => (parseFloat(getComputedStyle(cellsEl).columnGap) || 6) / 2;
    const placePoint = () => {
      if (!ptEl || !ptList) return;
      const bs = ptList.map(([r, c]) => box(r, c)), g = half();
      const x = Math.min(...bs.map(b => b.x)) - g, y = Math.min(...bs.map(b => b.y)) - g;
      Object.assign(ptEl.style, { left: x + 'px', top: y + 'px', width: Math.max(...bs.map(b => b.X)) + g - x + 'px', height: Math.max(...bs.map(b => b.Y)) + g - y + 'px' });
    };
    const draw = () => {
      const W = cellsEl.clientWidth, H = cellsEl.clientHeight;
      if (!W) return;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
      const g = half();
      let d = '';
      if (shape === 'row5') { const a = box(5, 1), b = box(5, 6); d = `M${a.x - g} ${a.y - g}H${b.X + g}V${b.Y + g}H${a.x - g}Z`; }
      if (shape === 'cross5') {
        const k = box(5, 5), lx = box(5, 1).x - g, rx = box(5, 6).X + g, ty = box(1, 5).y - g, by = box(6, 5).Y + g;
        const a = k.x - g, b = k.X + g, c = k.y - g, e = k.Y + g;
        d = `M${a} ${ty}H${b}V${c}H${rx}V${e}H${b}V${by}H${a}V${e}H${lx}V${c}H${a}Z`;
      }
      outlinePath.setAttribute('d', d);
      placePoint();
    };
    const ro = new ResizeObserver(draw); ro.observe(cellsEl);

    if (interactive) { // roving tab stop: arrows move, Space toggles, Enter is Check
      cellsEl.addEventListener('keydown', (e) => {
        const n = e.target.closest('.lsn-cell'); if (!n) return;
        let r = +n.dataset.r, c = +n.dataset.c;
        const mv = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
        if (!mv) return;
        e.preventDefault();
        r = Math.min(6, Math.max(1, r + mv[0])); c = Math.min(6, Math.max(1, c + mv[1]));
        each(x => x.setAttribute('tabindex', '-1'));
        const t = cell(r, c); t.setAttribute('tabindex', '0'); t.focus();
      });
    }

    return {
      el, cellsEl, cell, each,
      outline(s) { shape = s; outlinePath.classList.toggle('on', !!s); draw(); },
      point(list) {
        ptEl && ptEl.remove();
        ptList = list; ptEl = Z.h('<span class="lsn-pt" aria-hidden="true"></span>');
        cellsEl.append(ptEl); placePoint();
        ctx.into(ptEl);
        const mine = ptEl;
        ctx.later(() => { mine.classList.add('out'); ctx.later(() => mine.remove(), 300); }, 3200);
      },
      /* Show-why flash. Its timers belong to the current grade, so Try again cancels them.
         Under reduced motion the highlight is applied once and stays until the grade is cleared. */
      flash(list, { cls = 'is-flash', ms = 150, times = 2 } = {}) {
        const nodes = list.map(([r, c]) => cell(r, c));
        if (ctx.rm()) { nodes.forEach(n => n.classList.add(cls)); return Promise.resolve(); }
        return new Promise(res => {
          let i = 0;
          const tick = () => {
            const on = i % 2 === 0;
            nodes.forEach(n => n.classList.toggle(cls, on));
            i++;
            if (i < times * 2) ctx.show(tick, ms); else res();
          };
          tick();
        });
      },
      /* Brief look at all 36 outcomes. Under reduced motion it highlights `still` instead, which holds still. */
      peek(ms, still) {
        if (ctx.rm()) { if (still) this.flash(still); return; }
        el.classList.add('is-peek'); ctx.show(() => el.classList.remove('is-peek'), ms);
      },
      unshow() { el.classList.remove('is-peek'); each(n => n.classList.remove('is-flash')); },
      destroy() { ro.disconnect(); },
    };
  }

  /* Rows other than `keep` (or outside the cross) dim one after another */
  const shrink = (ctx, grid, test, shape, cap, capText) => {
    let k = 0;
    grid.each((n, r, c) => {
      if (test(r, c)) return;
      n.style.transitionDelay = ctx.rm() ? '0ms' : `${(r - 1) * 50 + (shape === 'cross5' ? (c - 1) * 18 : 0)}ms`;
      n.classList.add('is-out'); k++;
    });
    ctx.later(() => { grid.outline(shape); if (cap) { cap.textContent = capText; cap.classList.add('lsn-cap-on'); } }, ctx.rm() ? 0 : 520);
    ctx.later(() => grid.each(n => { n.style.transitionDelay = ''; }), 900);
    return k;
  };

  /* ---------- Single choice: flat cards, 2 columns when there are 4 or fewer short options ---------- */
  function Choice(ctx, opts, { cols = 2, label = 'Answer options', onSelect } = {}) {
    const { Z } = ctx;
    const el = Z.h(`<div class="opts lsn-opts lsn-cols-${cols}" role="group" aria-label="${Z.esc(label)}">${opts.map((o, i) =>
      `<button type="button" class="opt" aria-pressed="false" data-i="${i}">${o.tex ? Z.tex(o.tex) : o.html}</button>`).join('')}</div>`);
    const btns = [...el.querySelectorAll('.opt')];
    let sel = -1, locked = false;
    const select = (i) => {
      if (locked || i < 0 || i >= btns.length) return;
      sel = i;
      btns.forEach((b, j) => { b.classList.toggle('selected', j === i); b.setAttribute('aria-pressed', String(j === i)); });
      Z.sound('tap');
      onSelect && onSelect(i);
      ctx.changed();
    };
    btns.forEach((b, i) => b.addEventListener('click', () => select(i)));
    const strip = () => btns.forEach(b => { b.classList.remove('correct', 'wrong', 'dim', 'lsn-rev'); const x = b.querySelector('.badge'); x && x.remove(); });
    return {
      el, select,
      get sel() { return sel; },
      picked: () => opts[sel],
      ready: () => sel >= 0, dirty: () => sel >= 0,
      lock(v) { locked = v; btns.forEach(b => b.setAttribute('aria-disabled', String(v))); },
      grade() {
        const ok = !!opts[sel].ok, b = btns[sel];
        b.classList.remove('selected');
        b.classList.add(ok ? 'correct' : 'wrong');
        b.insertAdjacentHTML('beforeend', `<span class="badge" aria-hidden="true">${Z.icon(ok ? 'check' : 'cross')}</span>`);
        if (ok) btns.forEach((x, j) => { if (j !== sel) x.classList.add('dim'); });
        return ok;
      },
      clear() { strip(); if (sel >= 0) btns[sel].classList.add('selected'); },
      reset() { strip(); sel = -1; btns.forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); }); },
      reveal() { strip(); btns.forEach((b, j) => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); b.classList.add(opts[j].ok ? 'lsn-rev' : 'dim'); }); },
    };
  }

  /* ---------- Numeric entry ---------- */
  function Numeric(ctx, { label, unit = '', mode = 'numeric', placeholder = '' }) {
    const { Z } = ctx;
    const el = Z.h(`<div class="lsn-num"><label class="field"><input type="text" inputmode="${mode}" autocomplete="off" spellcheck="false" aria-label="${Z.esc(label)}" placeholder="${Z.esc(placeholder)}">${unit ? `<span class="unit">${unit}</span>` : ''}</label></div>`);
    const field = el.querySelector('.field'), input = el.querySelector('input');
    input.addEventListener('input', () => {
      if (mode === 'numeric') { const v = input.value.replace(/[^0-9]/g, '').slice(0, 5); if (v !== input.value) input.value = v; }
      ctx.changed();
    });
    return {
      el, input,
      value: () => input.value.trim(),
      ready: () => input.value.trim() !== '', dirty: () => input.value !== '',
      lock(v) { input.readOnly = v; },
      mark(k) { field.classList.remove('correct', 'wrong', 'lsn-rev'); if (k) field.classList.add(k); },
      reset() { input.value = ''; this.mark(null); },
      set(v) { input.value = v; },
    };
  }

  /* ---------- Lesson screens ---------- */
  const T8 = ['26', '35', '44', '53', '62'];

  function sTitle(ctx) {
    const { Z } = ctx;
    return {
      id: 'title', kind: 'read',
      el: Z.h(`<section class="lsn-step lsn-title">
        <div class="lsn-title-art" data-track="prob">${window.ZQArt ? ZQArt('tree', { label: 'Course art: a probability tree' }) : ''}</div>
        <div class="t-overline lsn-over">Level 1 · Lesson 3</div>
        <h1 class="t-lesson-title">Shrinking the sample space</h1>
        <p class="t-prose">You roll two dice and learn something about the result. Some outcomes become impossible, so every chance has to be measured again on what is left.</p>
        <p class="t-caption lsn-meta">${Z.icon('clock', 'xs')} About 12 minutes, then a 3-question quiz</p>
      </section>`),
    };
  }

  function sShade(ctx) {
    const { Z } = ctx;
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">Two fair dice give 36 outcomes, all equally likely. Each cell is one outcome: the row is the first die, the column is the second.</p>
      <h2 class="t-h2 lsn-q">Shade every outcome where the total is 8. <span class="lsn-count tnum" aria-live="polite">0 shaded</span></h2>
      ${cbar('Tap a cell to shade it')}
      <div class="lsn-canvas"></div>
    </section>`);
    const grid = DiceGrid(ctx, { interactive: true, label: 'Outcomes for two dice. Tap a cell to shade it.' });
    el.querySelector('.lsn-canvas').append(grid.el);
    const on = new Set(); let locked = false;
    const count = el.querySelector('.lsn-count');
    const sync = () => { count.textContent = `${on.size} shaded`; };
    const setOn = (n, k, v) => { if (v) on.add(k); else on.delete(k); n.classList.toggle('is-on', v); n.setAttribute('aria-pressed', String(v)); };
    grid.each((n, r, c) => n.addEventListener('click', () => {
      if (locked) return;
      const k = '' + r + c;
      setOn(n, k, !on.has(k)); Z.sound('tap'); sync(); ctx.changed();
    }));
    const strip = () => grid.each(n => { n.classList.remove('g-ok', 'g-bad', 'g-kept', 'is-rev'); const x = n.querySelector('.lsn-x'); x && x.remove(); });
    return {
      id: 'shade', kind: 'task', el,
      ready: () => on.size > 0, dirty: () => on.size > 0,
      lock(v) { locked = v; },
      grade() {
        const keys = [...on], wrong = keys.filter(k => !T8.includes(k)), hit = keys.filter(k => T8.includes(k));
        if (!wrong.length && hit.length === 5) {
          hit.forEach(k => grid.cell(k[0], k[1]).classList.add('g-ok'));
          return { ok: true, reason: 'Five of the 36 outcomes add to 8.' };
        }
        wrong.forEach(k => { const n = grid.cell(k[0], k[1]); n.classList.add('g-bad'); n.insertAdjacentHTML('beforeend', `<i class="lsn-x" aria-hidden="true">${Z.icon('cross')}</i>`); });
        hit.forEach(k => grid.cell(k[0], k[1]).classList.add('g-kept'));
        let line;
        if (wrong.length) {
          const [r, c] = [+wrong[0][0], +wrong[0][1]];
          line = `(${r}, ${c}) adds to ${r + c}, not 8.` + (wrong.length > 1 ? ` ${wrong.length - 1} other shaded cell${wrong.length > 2 ? 's miss' : ' misses'} too.` : '');
        } else if (hit.length === 4 && !on.has('44')) line = 'You missed (4, 4). A double is one outcome, and it counts.';
        else line = `You found ${hit.length}. Try every first die from 1 to 6.`;
        return { ok: false, line };
      },
      clearGrade: strip,
      reset() { strip(); grid.each((n, r, c) => setOn(n, '' + r + c, false)); sync(); },
      reveal() { this.reset(); grid.each((n, r, c) => { if (r + c === 8) n.classList.add('is-rev'); }); count.textContent = '5 cells'; },
      hints: [
        'If the first die shows 3, what must the second die show?',
        'Totals of 8 sit on one diagonal, and it starts in row 2.',
        'Go row by row. A first die of 2 needs a 6, and a 3 needs a 5. Carry on up to 6. Row 1 cannot reach 8.',
      ],
      point: () => grid.point([[2, 6]]),
      why: (pick, rev) => `${rev ? 'The five cells from (2, 6) down to (6, 2) add to 8.' : 'You shaded the five cells from (2, 6) down to (6, 2).'} A first die of 1 cannot reach 8, so row 1 stays empty. That makes $P(\\text{total is } 8) = \\tfrac{5}{36}$.`,
      solution: 'The five cells from (2, 6) down to (6, 2) add to 8.',
      destroy: () => grid.destroy(),
    };
  }

  function sFirstFive(ctx) {
    const { Z } = ctx;
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">New roll. A friend peeks and tells you the first die shows 5. The cells marked in orange are the totals of 8 from the last screen.</p>
      ${cbar('36 outcomes')}
      <div class="lsn-canvas"></div>
      <h2 class="t-h2 lsn-q">What is the chance the total is 8 now?</h2>
      <div class="lsn-widget"></div>
    </section>`);
    const grid = DiceGrid(ctx, { label: 'Outcomes for two dice. Totals of 8 are marked. Only row 5 is still possible.' });
    grid.each((n, r, c) => { if (r + c === 8) n.classList.add('is-a'); });
    el.querySelector('.lsn-canvas').append(grid.el);
    const opts = [
      { tex: '\\dfrac{5}{36}', line: 'That is the chance before the news. Only the 6 cells in row 5 are still possible.', show: 'peek' },
      { tex: '\\dfrac{1}{36}', line: 'That divides by all 36 outcomes. Only the 6 cells in row 5 are still possible.', show: 'peek' },
      { tex: '\\dfrac{1}{6}', ok: true },
      { tex: '\\dfrac{5}{6}', line: 'That is the chance the total is not 8. Count the cells that do reach 8.', show: 'others' },
    ];
    const ch = Choice(ctx, opts);
    el.querySelector('.lsn-widget').append(ch.el);
    return {
      id: 'first5', kind: 'task', el, choice: ch,
      enter: () => ctx.later(() => shrink(ctx, grid, (r) => r === 5, 'row5', el.querySelector('.lsn-cap'), '6 outcomes left: the first die is 5'), ctx.rm() ? 0 : 350),
      ready: ch.ready, dirty: ch.dirty, lock: ch.lock,
      grade() {
        const o = ch.picked();
        if (ch.grade()) return { ok: true, reason: 'One of the 6 cells left, (5, 3), adds to 8.' };
        const row5 = D6.map(c => [5, c]);
        const show = o.show === 'peek' ? () => grid.peek(1000, row5) : () => grid.flash(row5.filter(([, c]) => c !== 3));
        return { ok: false, line: o.line, show };
      },
      clearGrade: () => { ch.clear(); grid.unshow(); },
      reset: () => ch.reset(),
      reveal: () => ch.reveal(),
      hints: [
        'Which cells are still possible once you know the first die is 5?',
        'Only row 5 is still lit. How many cells does it have, and how many are marked?',
        'Row 5 has 6 cells. One of them, (5, 3), adds to 8. Divide the marked cells by 6.',
      ],
      point: () => grid.point([[5, 1], [5, 6]]),
      why: (pick, rev) => `${rev ? 'Only row 5 is still possible, because the first die is 5.' : 'You counted inside row 5, the only row left once the first die is 5.'} One of its 6 cells, (5, 3), adds to 8. So the news moved the chance from $\\tfrac{5}{36}$ to $\\tfrac{1}{6}$.`,
      solution: 'Only (5, 3) adds to 8 in row 5, so the chance is $\\tfrac{1}{6}$.',
      destroy: () => grid.destroy(),
    };
  }

  function sCross(ctx) {
    const { Z } = ctx;
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">Another roll. This time your friend only says: at least one die shows a 5.</p>
      ${cbar('36 outcomes')}
      <div class="lsn-canvas"></div>
      <h2 class="t-h2 lsn-q">How many outcomes are left?</h2>
      <div class="lsn-widget"></div>
      ${acceptedLine(`Accepted: 11 exactly. Row 5 and column 5 share one cell: ${Z.tex('6 + 6 - 1 = 11')}.`)}
    </section>`);
    const grid = DiceGrid(ctx, { label: 'Outcomes for two dice. Row 5 and column 5 are still possible, forming a cross.' });
    el.querySelector('.lsn-canvas').append(grid.el);
    const num = Numeric(ctx, { label: 'Number of outcomes left', unit: 'outcomes' });
    el.querySelector('.lsn-widget').append(num.el);
    let twice = null;
    const clearTwice = () => { twice && twice.remove(); twice = null; grid.cell(5, 5).classList.remove('is-twice'); };
    return {
      id: 'cross', kind: 'task', el, input: num.input,
      enter: () => ctx.later(() => shrink(ctx, grid, (r, c) => r === 5 || c === 5, 'cross5', el.querySelector('.lsn-cap'), 'At least one die shows a 5'), ctx.rm() ? 0 : 350),
      ready: num.ready, dirty: num.dirty, lock: num.lock,
      grade() {
        const v = parseInt(num.value(), 10);
        if (v === 11) { num.mark('correct'); return { ok: true, reason: 'Row 5 plus column 5, with the corner counted once.' }; }
        num.mark('wrong');
        const corner = () => {
          const g = ctx.gen();
          grid.flash([[5, 5]]).then(() => {
            if (g !== ctx.gen()) return; // Try again came first
            const n = grid.cell(5, 5); n.classList.add('is-twice');
            twice = Z.h('<b class="lsn-twice" aria-hidden="true">×2</b>'); n.append(twice);
          });
        };
        const cross = D6.flatMap(r => D6.filter(c => r === 5 || c === 5).map(c => [r, c]));
        const lines = {
          12: ['You counted the (5, 5) cell twice. Look at the corner.', corner],
          10: ['Row 5 and column 5 share only one cell, (5, 5). Take it away once, not twice.', corner],
          6: ['That is one row. The 5 can also be on the second die.', () => grid.flash([[1, 5], [2, 5], [3, 5], [4, 5], [6, 5]])],
          36: ['That is every outcome. Rolls with no 5 are ruled out.', () => grid.peek(1000, cross)],
          25: ['That counts the outcomes with no 5. You want the ones that are left.', () => grid.peek(1000, cross)],
        };
        const [line, show] = lines[v] || ['Count the cells that are still lit, each one once.', null];
        return { ok: false, line, show };
      },
      clearGrade: () => { num.mark(null); clearTwice(); grid.unshow(); },
      reset: () => { num.reset(); clearTwice(); },
      reveal: () => { clearTwice(); num.set('11'); num.mark('lsn-rev'); },
      hints: [
        'How many cells are in row 5? How many are in column 5?',
        'One cell sits in both row 5 and column 5.',
        'Row 5 has 6 cells and column 5 has 6. The corner (5, 5) is in both, so count it once.',
      ],
      point: () => grid.point([[5, 5]]),
      why: (pick, rev) => `${rev ? 'Row 5 and column 5 both contain the corner (5, 5).' : 'You counted row 5 and column 5, and the corner (5, 5) belongs to both.'} Counting it once gives $6 + 6 - 1 = 11$. The news shrank the sample space from 36 outcomes to 11.`,
      solution: 'Count the corner once: $6 + 6 - 1 = 11$ outcomes.',
      destroy: () => grid.destroy(),
    };
  }

  function sTen(ctx) {
    const { Z } = ctx;
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">Same news as before: at least one die shows a 5. Now look for a total of 10.</p>
      ${cbar('11 outcomes left: at least one 5')}
      <div class="lsn-canvas"></div>
      <h2 class="t-h2 lsn-q">What is the chance the total is 10?</h2>
      <div class="lsn-widget"></div>
    </section>`);
    const grid = DiceGrid(ctx, { label: 'Outcomes for two dice. Only the cross of row 5 and column 5 is still possible.' });
    grid.each((n, r, c) => { if (r !== 5 && c !== 5) n.classList.add('is-out'); });
    el.querySelector('.lsn-canvas').append(grid.el);
    el.querySelector('.lsn-cap').classList.add('lsn-cap-on');
    const markTens = () => grid.each((n, r, c) => { if (r + c === 10) n.classList.add('is-a'); });
    const opts = [
      { tex: '\\dfrac{1}{6}', line: 'That treats one die as fixed at 5. You only know at least one is a 5, so 11 cells are possible.', show: 'row' },
      { tex: '\\dfrac{1}{11}', ok: true },
      { tex: '\\dfrac{1}{12}', line: 'You divided by 12, so the corner (5, 5) was counted twice. The cross has 11 cells.', show: 'corner' },
      { tex: '\\dfrac{3}{36}', line: 'That counts every way to make 10 among all 36 outcomes. Two of them have no 5, so they are gone.', show: 'tens' },
    ];
    const ch = Choice(ctx, opts);
    el.querySelector('.lsn-widget').append(ch.el);
    const colOut = () => [1, 2, 3, 4, 6].map(r => grid.cell(r, 5));
    const rowOnly = () => ctx.transient(() => colOut().forEach(n => n.classList.add('is-out')), () => colOut().forEach(n => n.classList.remove('is-out')), 1100);
    const base = () => grid.each((n, r, c) => { n.classList.toggle('is-out', r !== 5 && c !== 5); n.classList.remove('is-a'); });
    return {
      id: 'ten', kind: 'task', el, choice: ch, outline: () => grid.outline('cross5'),
      enter: () => grid.outline('cross5'),
      ready: ch.ready, dirty: ch.dirty, lock: ch.lock,
      grade() {
        const o = ch.picked();
        if (ch.grade()) { markTens(); return { ok: true, reason: 'Only (5, 5) adds to 10, out of 11 cells.' }; }
        const show = { row: rowOnly, corner: () => grid.flash([[5, 5]]), tens: () => { markTens(); grid.peek(1100); } }[o.show];
        return { ok: false, line: o.line, show };
      },
      clearGrade: () => { ch.clear(); grid.unshow(); base(); },
      reset: () => { ch.reset(); base(); },
      reveal: () => { ch.reveal(); markTens(); },
      hints: [
        'Which pairs add to 10? Which of them contain a 5?',
        'Only one cell in the cross adds to 10.',
        'The pairs adding to 10 are (4, 6), (5, 5) and (6, 4). Only (5, 5) is in the cross, and the cross has 11 cells.',
      ],
      point: () => grid.point([[5, 5]]),
      why: (pick, rev) => `${rev ? 'Only one cell in the cross, (5, 5), adds to 10, so the chance is $\\tfrac{1}{11}$.' : 'Your $\\tfrac{1}{11}$ counts one cell, (5, 5), out of the 11 in the cross.'} The other ways to make 10, (4, 6) and (6, 4), contain no 5, so they dropped out. Before the news the chance was $\\tfrac{3}{36} = \\tfrac{1}{12}$.`,
      solution: 'Only (5, 5) adds to 10, out of 11 cells: $\\tfrac{1}{11}$.',
      destroy: () => grid.destroy(),
    };
  }

  function sDerive(ctx) {
    const { Z } = ctx;
    const t = (s) => Z.tex('\\displaystyle ' + s);
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">You counted the outcomes where both things happen, out of the outcomes still possible. That is a conditional probability: ${Z.tex('P(A \\mid B)')}, the probability of ${Z.tex('A')} given ${Z.tex('B')}.</p>
      ${cbar('Derivation')}
      <div class="lsn-deriv lsn-canvas" role="group" aria-label="Derivation with one missing line">
        <div class="lsn-dl"><span class="lsn-dlhs">${t('P(A \\mid B)')}</span><span class="lsn-drhs">${t('= \\frac{|A \\cap B|}{|B|}')}</span><span class="lsn-dnote t-caption">What you counted</span></div>
        <div class="lsn-dl lsn-dmiss"><span class="lsn-dlhs"></span><span class="lsn-drhs">${t('=')}<span class="lsn-slot" aria-live="polite"><span class="lsn-slot-q">?</span></span></span><span class="lsn-dnote t-caption lsn-dnote-m">Missing line</span></div>
        <div class="lsn-dl"><span class="lsn-dlhs"></span><span class="lsn-drhs">${t('= \\frac{P(A \\cap B)}{P(B)}')}</span><span class="lsn-dnote t-caption">Each count over 36 is a probability</span></div>
      </div>
      <h2 class="t-h2 lsn-q">Which line completes the derivation?</h2>
      <div class="lsn-widget"></div>
      <div class="t-body lsn-yours" hidden><p>With your numbers, ${Z.tex('A')} is a total of 10 and ${Z.tex('B')} is at least one 5:</p>${Z.tex('P(A \\mid B) = \\frac{1/36}{11/36} = \\frac{1}{11}', true)}</div>
    </section>`);
    const slot = el.querySelector('.lsn-slot');
    const opts = [
      { tex: '\\dfrac{|A \\cap B| / 36}{|B|}', line: 'Dividing only the top changes the value. Do the same to the bottom.' },
      { tex: '\\dfrac{|A| / 36}{|B| / 36}', line: 'The top must count outcomes in both A and B. Some outcomes in A lie outside B.' },
      { tex: '\\dfrac{|A \\cap B| / 36}{|B| / 36}', ok: true },
    ];
    const fill = (i) => { slot.innerHTML = i < 0 ? '<span class="lsn-slot-q">?</span>' : Z.tex(opts[i].tex.replace('\\dfrac', '\\frac').replace(/^/, '\\displaystyle ')); slot.classList.toggle('on', i >= 0); };
    const ch = Choice(ctx, opts, { cols: 1, onSelect: fill });
    el.querySelector('.lsn-widget').append(ch.el);
    const note = el.querySelector('.lsn-dnote-m');
    const mark = (k) => { slot.classList.remove('ok', 'bad', 'rev'); if (k) slot.classList.add(k); };
    return {
      id: 'derive', kind: 'task', el, choice: ch,
      ready: ch.ready, dirty: ch.dirty, lock: ch.lock,
      grade() {
        const o = ch.picked();
        if (ch.grade()) { mark('ok'); note.textContent = 'Divide top and bottom by 36'; el.querySelector('.lsn-yours').hidden = false; return { ok: true, reason: 'The same factor top and bottom keeps the value.' }; }
        mark('bad');
        return { ok: false, line: o.line };
      },
      clearGrade: () => { ch.clear(); mark(null); },
      reset: () => { ch.reset(); mark(null); fill(-1); },
      reveal: () => { ch.reveal(); fill(2); mark('rev'); note.textContent = 'Divide top and bottom by 36'; el.querySelector('.lsn-yours').hidden = false; },
      hints: [
        'What can you do to the top and bottom of a fraction without changing its value?',
        'The missing line has to turn each count into a probability.',
        `Divide both ${Z.tex('|A \\cap B|')} and ${Z.tex('|B|')} by the same number, 36.`,
      ],
      point: () => ctx.pointEl(slot),
      why: (pick, rev) => `${rev ? 'Dividing both counts by 36 leaves the fraction unchanged.' : 'You divided both counts by 36, which leaves the fraction unchanged.'} Each count over 36 is a probability. The last line needs no counting, so it also works when outcomes are not equally likely.`,
      solution: 'Divide top and bottom by 36. The value stays the same.',
    };
  }

  const pips = { 1: [[2, 2]], 2: [[1, 1], [3, 3]], 3: [[1, 1], [2, 2], [3, 3]], 4: [[1, 1], [3, 1], [1, 3], [3, 3]], 5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]], 6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]] };
  const die = (n) => `<svg class="lsn-die" viewBox="0 0 28 28" role="img" aria-label="${n}"><rect x="1" y="1" width="26" height="26" rx="6"/>${pips[n].map(([x, y]) => `<circle cx="${x * 7}" cy="${y * 7}" r="2.4"/>`).join('')}</svg>`;

  function sSimulate(ctx) {
    const { Z } = ctx;
    const CAP_SHUT = 'Rolling opens once you check your estimate';
    const CAP_OPEN = 'Simulation, seeded so it repeats exactly';
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">Time for an experiment. You will roll two dice many times and keep only the rolls with at least one 5. Predict first, then roll.</p>
      <h2 class="t-h2 lsn-q">Of 1,000 rolls, about how many survive the filter?</h2>
      <div class="lsn-widget"></div>
      ${acceptedLine(`Accepted: any whole number from 280 to 330. Expected: ${Z.tex('1000 \\times \\tfrac{11}{36} \\approx 305.6')}`)}
      <div class="lsn-simwrap">
      ${cbar(CAP_SHUT)}
      <div class="lsn-sim lsn-canvas">
        <p class="lsn-filter t-label">Filter: keep a roll when at least one die shows a 5</p>
        <div class="lsn-sim-btns">
          <button type="button" class="btn secondary lsn-roll" data-n="10" disabled>Roll 10</button>
          <button type="button" class="btn secondary lsn-roll" data-n="100" disabled>Roll 100</button>
          <button type="button" class="btn secondary lsn-roll" data-n="1000" disabled>Roll 1,000</button>
        </div>
        <div class="lsn-sim-row">
          <div class="lsn-sim-last"><span class="lsn-dice" aria-hidden="true">${die(5)}${die(5)}</span><span class="t-caption lsn-sim-tag">Last roll</span></div>
          <dl class="lsn-sim-stats">
            <div><dt>Rolled</dt><dd class="tnum" data-k="rolled">0</dd></div>
            <div class="lsn-kept"><dt>Kept</dt><dd class="tnum" data-k="kept">0</dd></div>
            <div><dt>Total 10</dt><dd class="tnum" data-k="tens">0</dd></div>
          </dl>
        </div>
        <div class="lsn-share">
          <div class="lsn-share-head"><span class="t-label">Kept rolls with total 10</span><b class="tnum lsn-share-v">No rolls yet</b></div>
          <div class="lsn-share-track"><i class="lsn-share-fill"></i><span class="lsn-share-target"><span class="lsn-share-lab">${Z.tex('\\tfrac{1}{11}')}</span></span></div>
          <div class="lsn-share-axis t-caption"><span>0</span><span>0.25</span></div>
        </div>
        <svg class="lsn-trace" role="img" aria-label="Running share of kept rolls with total 10"></svg>
        <p class="t-caption lsn-trace-cap">Running share as kept rolls pile up. Dashed line: ${Z.tex('\\tfrac{1}{11} \\approx 0.091')}</p>
      </div>
      </div>
    </section>`);
    const num = Numeric(ctx, { label: 'Rolls that survive, out of 1,000', unit: 'rolls' });
    el.querySelector('.lsn-widget').append(num.el);
    const q = (s) => el.querySelector(s);
    const stat = (k) => q(`[data-k="${k}"]`);
    const rollBtns = [...el.querySelectorAll('.lsn-roll')];
    const trace = q('.lsn-trace'), cap = q('.lsn-cap');
    // Predict first: the rolls open only after a correct estimate or Show solution, so the Kept counter cannot answer the question.
    let rng, rolled, kept, tens, pts, last, busy = false, open = false, runGen = 0;
    const init = () => { runGen++; busy = false; rng = rngFrom(SEED); rolled = 0; kept = 0; tens = 0; pts = []; last = null; };
    init();
    const syncBtns = () => rollBtns.forEach(b => { b.disabled = !open || busy; });
    const setOpen = (v) => { open = v; syncBtns(); cap.textContent = v ? CAP_OPEN : CAP_SHUT; cap.classList.toggle('lsn-cap-on', v); };
    const one = () => {
      const a = 1 + Math.floor(rng() * 6), b = 1 + Math.floor(rng() * 6);
      rolled++; last = [a, b];
      if (a === 5 || b === 5) { kept++; if (a + b === 10) tens++; pts.push(tens / kept); }
    };
    const drawTrace = () => {
      const W = Math.max(200, trace.clientWidth || 300), H = 120, l = 34, r = 8, t = 8, b = 22;
      const ymax = 0.4, x = (i) => l + (W - l - r) * (pts.length > 1 ? i / (pts.length - 1) : 0), y = (v) => t + (H - t - b) * (1 - Math.min(v, ymax) / ymax);
      const stp = Math.max(1, Math.ceil(pts.length / 360));
      let d = '';
      for (let i = 0; i < pts.length; i += stp) d += (d ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(pts[i]).toFixed(1);
      if (pts.length > 1) d += 'L' + x(pts.length - 1).toFixed(1) + ' ' + y(pts[pts.length - 1]).toFixed(1);
      trace.setAttribute('viewBox', `0 0 ${W} ${H}`);
      trace.innerHTML = [0, 0.2, 0.4].map(v => `<path class="lsn-tr-grid" d="M${l} ${y(v)}H${W - r}"/><text class="lsn-tr-tick" x="${l - 6}" y="${y(v) + 4}" text-anchor="end">${v === 0 ? '0' : v.toFixed(1)}</text>`).join('')
        + `<path class="lsn-tr-axis" d="M${l} ${t}V${H - b}"/>`
        + `<path class="lsn-tr-target" d="M${l} ${y(1 / 11)}H${W - r}"/>`
        + (d ? `<path class="lsn-tr-line" d="${d}"/>` : '')
        + `<text class="lsn-tr-tick" x="${l}" y="${H - 6}">0</text><text class="lsn-tr-tick" x="${W - r}" y="${H - 6}" text-anchor="end">${pts.length ? fmt(pts.length) + ' kept' : 'Kept rolls'}</text>`;
    };
    const draw = () => {
      stat('rolled').textContent = fmt(rolled); stat('kept').textContent = fmt(kept); stat('tens').textContent = fmt(tens);
      const f = kept ? tens / kept : null;
      q('.lsn-share-v').textContent = f == null ? (rolled ? 'None kept yet' : 'No rolls yet') : f.toFixed(3);
      q('.lsn-share-fill').style.width = f == null ? '0%' : Math.min(100, f / 0.25 * 100) + '%';
      if (last) {
        q('.lsn-dice').innerHTML = die(last[0]) + die(last[1]);
        const k = last[0] === 5 || last[1] === 5;
        q('.lsn-sim-tag').textContent = k ? 'Kept' : 'Filtered out';
        q('.lsn-sim-last').classList.toggle('kept', k);
      } else { q('.lsn-dice').innerHTML = die(5) + die(5); q('.lsn-sim-tag').textContent = 'Last roll'; q('.lsn-sim-last').classList.remove('kept'); }
      drawTrace();
    };
    const roll = (n) => {
      if (busy || !open) return;
      const my = runGen;
      busy = true; syncBtns();
      const dur = ctx.rm() ? 0 : n === 10 ? 500 : n === 100 ? 750 : 1100;
      const t0 = performance.now(); let done = 0;
      const tick = (now) => {
        if (!ctx.alive() || my !== runGen) return; // left the screen, or Start over reset the counts
        const target = dur ? Math.min(n, Math.ceil(n * Math.min(1, (now - t0) / dur))) : n;
        while (done < target) { one(); done++; }
        draw();
        if (done < n) requestAnimationFrame(tick);
        else { busy = false; syncBtns(); ctx.changed(); }
      };
      requestAnimationFrame(tick);
    };
    rollBtns.forEach(b => b.addEventListener('click', () => roll(+b.dataset.n)));
    const ro = new ResizeObserver(() => drawTrace()); ro.observe(trace);
    draw();
    return {
      id: 'simulate', kind: 'task', el, input: num.input,
      ready: num.ready, dirty: num.dirty,
      lock: (v) => num.lock(v),
      grade() {
        const v = parseInt(num.value(), 10);
        if (v >= 280 && v <= 330) { num.mark('correct'); setOpen(true); return { ok: true, reason: 'About 11 in every 36 rolls contain a 5. Now roll to test it.' }; }
        num.mark('wrong');
        const lines = { 91: 'That uses $\\tfrac{1}{11}$, the share of kept rolls with total 10. You want the share of all rolls that are kept.', 167: 'That is the chance one particular die shows 5. Either die can show it.', 333: 'That counts the (5, 5) roll twice: 12 in 36. The cross has 11 cells.', 1000: 'Rolls with no 5 are thrown away, so fewer survive.' };
        return { ok: false, line: lines[v] || 'A roll survives when it lands in the cross: 11 of the 36 outcomes.', show: () => ctx.pointEl(q('.lsn-filter')) };
      },
      clearGrade: () => num.mark(null),
      reset: () => { init(); num.reset(); setOpen(false); draw(); },
      reveal: () => { num.set('306'); num.mark('lsn-rev'); setOpen(true); },
      hints: [
        'What fraction of the 36 outcomes has at least one 5?',
        'The filter keeps the same outcomes as the cross you counted earlier.',
        `11 of the 36 outcomes survive, so expect about ${Z.tex('1000 \\times \\tfrac{11}{36}')} rolls.`,
      ],
      point: () => ctx.pointEl(q('.lsn-filter')),
      why: (pick, rev) => {
        const est = parseInt(num.value(), 10);
        const lead = rev || isNaN(est) ? '' : `You estimated ${fmt(est)}. `;
        const yours = rolled ? ` Your ${fmt(rolled)} rolls kept ${fmt(kept)}.` : ' Roll 1,000 to see how close the experiment comes.';
        return `${lead}11 of the 36 outcomes contain a 5, so about $\\tfrac{11}{36}$ of rolls survive: $1000 \\times \\tfrac{11}{36} \\approx 305.6$.${yours}`;
      },
      solution: 'Expect about $1000 \\times \\tfrac{11}{36} \\approx 306$ rolls.',
      destroy: () => { runGen++; ro.disconnect(); },
    };
  }

  function sStocks(ctx) {
    const { Z } = ctx;
    const arrow = (up) => `<svg class="lsn-arr" viewBox="0 0 16 16" aria-hidden="true"><path d="${up ? 'M8 13V3.5M4 7.5l4-4 4 4' : 'M8 3v9.5M4 8.5l4 4 4-4'}"/></svg>`;
    const cellH = (k, a, b, name) => `<div class="lsn-tc" data-k="${k}"><span class="lsn-tc-g">A ${arrow(a)} B ${arrow(b)}</span><span class="lsn-tc-n t-caption">${name}</span><span class="lsn-tc-p">${Z.tex('\\tfrac{1}{4}')}</span></div>`;
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">Two stocks, A and B, each finish the day up or down with equal chance, independently. After the close you hear one fact: at least one of them finished up.</p>
      ${cbar('Four equally likely outcomes')}
      <div class="lsn-tf lsn-canvas" role="img" aria-label="Four outcomes: both up, A up and B down, A down and B up, both down. Each has chance one quarter.">
        <span></span><span class="lsn-tf-h t-caption">B up</span><span class="lsn-tf-h t-caption">B down</span>
        <span class="lsn-tf-h lsn-tf-r t-caption">A up</span>${cellH('uu', 1, 1, 'Both up')}${cellH('ud', 1, 0, 'Only A up')}
        <span class="lsn-tf-h lsn-tf-r t-caption">A down</span>${cellH('du', 0, 1, 'Only B up')}${cellH('dd', 0, 0, 'Both down')}
      </div>
      <h2 class="t-h2 lsn-q">What is the chance both finished up?</h2>
      <div class="lsn-widget"></div>
    </section>`);
    const c = (k) => el.querySelector(`[data-k="${k}"]`);
    const opts = [
      { tex: '\\dfrac{1}{4}', line: 'That is the chance before the news. Both down is now ruled out.', show: 'shrink' },
      { tex: '\\dfrac{1}{2}', line: 'That assumes you know which stock rose. You only know at least one did, so three outcomes remain.', show: 'pair' },
      { tex: '\\dfrac{2}{3}', line: 'That is the chance exactly one stock rose. Both up is one of the three outcomes left.', show: 'pair' },
      { tex: '\\dfrac{1}{3}', ok: true },
    ];
    const ch = Choice(ctx, opts);
    el.querySelector('.lsn-widget').append(ch.el);
    const shrunk = (v) => {
      c('dd').classList.toggle('is-out', v);
      ['uu', 'ud', 'du'].forEach(k => { c(k).querySelector('.lsn-tc-p').innerHTML = Z.tex(v ? '\\tfrac{1}{3}' : '\\tfrac{1}{4}'); });
      c('dd').querySelector('.lsn-tc-p').innerHTML = Z.tex(v ? '0' : '\\tfrac{1}{4}');
    };
    const flashPair = () => {
      const pair = ['ud', 'du'].map(c);
      if (ctx.rm()) { pair.forEach(n => n.classList.add('is-flash')); return; }
      let i = 0; const tick = () => { pair.forEach(n => n.classList.toggle('is-flash', i % 2 === 0)); i++; if (i < 4) ctx.show(tick, 150); };
      tick();
    };
    const ddOut = () => ctx.transient(() => c('dd').classList.add('is-out'), () => c('dd').classList.remove('is-out'), 1400);
    const clear = () => { shrunk(false); ['uu', 'ud', 'du', 'dd'].forEach(k => c(k).classList.remove('is-out', 'is-flash', 'is-a')); };
    return {
      id: 'stocks', kind: 'task', el, choice: ch,
      ready: ch.ready, dirty: ch.dirty, lock: ch.lock,
      grade() {
        const o = ch.picked();
        if (ch.grade()) { shrunk(true); c('uu').classList.add('is-a'); return { ok: true, reason: 'Both up is one of three equal outcomes left.' }; }
        return { ok: false, line: o.line, show: o.show === 'shrink' ? ddOut : () => { ddOut(); flashPair(); } };
      },
      clearGrade: () => { ch.clear(); clear(); },
      reset: () => { ch.reset(); clear(); },
      reveal: () => { ch.reveal(); shrunk(true); c('uu').classList.add('is-a'); },
      hints: [
        'Which of the four outcomes does the news rule out?',
        'One of the four outcomes is impossible once you know at least one stock rose.',
        'Three outcomes remain, each equally likely. Count the ones where both are up.',
      ],
      point: () => ctx.pointEl(c('dd')),
      why: (pick, rev) => `${rev ? 'The news rules out both down, which leaves three equal outcomes' : 'You ruled out both down, which leaves three equal outcomes'}: both up, only A up, and only B up. Only one has both up, so the chance is $\\tfrac{1}{3}$, not $\\tfrac{1}{2}$.`,
      solution: 'Both up is one of the three outcomes left: $\\tfrac{1}{3}$.',
    };
  }

  function sSummary(ctx) {
    const { Z } = ctx;
    return {
      id: 'summary', kind: 'read',
      el: Z.h(`<section class="lsn-step lsn-sum">
        <div class="t-overline lsn-over">Summary</div>
        <h1 class="t-lesson-title">What you found</h1>
        <ol class="lsn-ideas">
          <li><span class="lsn-idea-n">1</span><p class="t-body">News rules outcomes out. The outcomes still possible form the new sample space.</p></li>
          <li><span class="lsn-idea-n">2</span><div class="t-body"><p>With equally likely outcomes, count inside what is left:</p>${Z.tex('P(A \\mid B) = \\frac{|A \\cap B|}{|B|}', true)}</div></li>
          <li><span class="lsn-idea-n">3</span><p class="t-body">${mdx(Z, 'Divide top and bottom by the total, and the rule works for any outcomes, equally likely or not.')}</p></li>
        </ol>
        <div class="lsn-card">
          <div class="lsn-card-top"><span class="t-overline">Conditional probability</span><span class="lsn-saved t-caption">${Z.icon('book', 'xs')} Saved to Notebook</span></div>
          <div class="lsn-card-f">${Z.tex('P(A \\mid B) = \\dfrac{P(A \\cap B)}{P(B)}', true)}</div>
          <p class="t-caption lsn-card-n">${mdx(Z, 'Defined only when $P(B) > 0$: you cannot condition on something impossible.')}</p>
        </div>
        <p class="t-body lsn-trap"><b>Common trap.</b> “At least one is a 5” is not “the first is a 5”. The first leaves 6 outcomes; the second leaves 11.</p>
        <p class="t-caption lsn-next">Next: a 3-question quiz. No hints, one try each.</p>
      </section>`),
    };
  }

  /* ---------- Lesson quiz: scaffold free, one attempt each ---------- */
  function qTotalSeven(ctx) {
    const { Z } = ctx;
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">Two fair dice are rolled. You are told the total is 7.</p>
      <h2 class="t-h2 lsn-q">What is the chance that one of the dice shows a 3?</h2>
      <div class="lsn-widget"></div>
    </section>`);
    const opts = [
      { tex: '\\dfrac{1}{6}', line: 'That counts only (3, 4). The 3 can be on either die, so (4, 3) counts too.' },
      { tex: '\\dfrac{2}{11}', line: 'That is the chance of a total of 7 given a 3 is showing. The condition runs the other way here.' },
      { tex: '\\dfrac{1}{3}', ok: true },
      { tex: '\\dfrac{1}{18}', line: 'That divides by all 36 outcomes. A total of 7 leaves only 6.' },
    ];
    const ch = Choice(ctx, opts);
    el.querySelector('.lsn-widget').append(ch.el);
    return {
      id: 'q1', kind: 'quiz', el, choice: ch, ready: ch.ready, dirty: ch.dirty, lock: ch.lock,
      grade() { const o = ch.picked(); return ch.grade() ? { ok: true, reason: '(3, 4) and (4, 3), out of 6 ways to make 7.' } : { ok: false, line: o.line }; },
      why: () => 'A total of 7 leaves six outcomes, from (1, 6) to (6, 1). Two of them, (3, 4) and (4, 3), contain a 3. So the chance is $\\tfrac{2}{6} = \\tfrac{1}{3}$.',
    };
  }

  function qEven(ctx) {
    const { Z } = ctx;
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">A fair six-sided die is rolled. You learn the result is even.</p>
      <h2 class="t-h2 lsn-q">What is the chance it is greater than 3? Give a fraction or a decimal.</h2>
      <div class="lsn-widget"></div>
      <p class="t-caption lsn-help-line" hidden>Type a fraction such as 3/4, or a decimal such as 0.75.</p>
      ${acceptedLine(`Accepted: any form equal to ${Z.tex('\\tfrac{2}{3}')}, or a decimal that rounds to 0.67.`)}
    </section>`);
    const num = Numeric(ctx, { label: 'Chance, as a fraction or decimal', mode: 'text', placeholder: 'For example 3/4' });
    el.querySelector('.lsn-widget').append(num.el);
    const help = el.querySelector('.lsn-help-line');
    num.input.addEventListener('input', () => { const v = num.value(); help.hidden = !v || !isNaN(parseNum(v)) || /^[\d.]+\/?$/.test(v); });
    return {
      id: 'q2', kind: 'quiz', el, input: num.input,
      ready: () => !isNaN(parseNum(num.value())), dirty: num.dirty, lock: num.lock,
      grade() {
        const v = parseNum(num.value());
        const ok = num.value().includes('/') ? Math.abs(v - 2 / 3) < 1e-9 : v >= 0.665 && v < 0.675; // the rule shown after grading
        if (ok) { num.mark('correct'); return { ok: true, reason: '4 and 6, out of 2, 4 and 6.' }; }
        num.mark('wrong');
        const line = Math.abs(v - 0.5) < 0.005 ? 'That is the chance before you learned it was even. Only 2, 4 and 6 are left.'
          : Math.abs(v - 1 / 3) < 0.005 ? 'Of 2, 4 and 6, two are greater than 3, not one.'
            : 'Only 2, 4 and 6 are left. Count the ones above 3.';
        return { ok: false, line };
      },
      why: () => 'Learning the result is even leaves 2, 4 and 6. Two of those, 4 and 6, are greater than 3. So the chance is $\\tfrac{2}{3}$.',
    };
  }

  function qOneStock(ctx) {
    const { Z } = ctx;
    const el = Z.h(`<section class="lsn-step">
      <p class="t-prose">Stocks A and B each finish up or down with equal chance, independently. This time you learn that A finished up.</p>
      <h2 class="t-h2 lsn-q">What is the chance both finished up?</h2>
      <div class="lsn-widget"></div>
    </section>`);
    const opts = [
      { tex: '\\dfrac{1}{3}', line: 'That answers “at least one rose”. Here you know A rose, so only B is uncertain.' },
      { tex: '\\dfrac{1}{4}', line: 'That is the chance before any news. Knowing A rose leaves two outcomes.' },
      { tex: '\\dfrac{1}{2}', ok: true },
      { tex: '\\dfrac{3}{4}', line: 'That is the chance at least one stock rises. You already know A did.' },
    ];
    const ch = Choice(ctx, opts);
    el.querySelector('.lsn-widget').append(ch.el);
    return {
      id: 'q3', kind: 'quiz', el, choice: ch, ready: ch.ready, dirty: ch.dirty, lock: ch.lock,
      grade() { const o = ch.picked(); return ch.grade() ? { ok: true, reason: 'Knowing A rose leaves two equal outcomes.' } : { ok: false, line: o.line }; },
      why: () => 'Knowing A rose leaves two equal outcomes: both up, and only A up. B rose in one of them, so the chance is $\\tfrac{1}{2}$. Compare the lesson: “at least one rose” left three outcomes and gave $\\tfrac{1}{3}$.',
    };
  }

  const LESSON = [sTitle, sShade, sFirstFive, sCross, sTen, sDerive, sSimulate, sStocks, sSummary];
  const QUIZ = [qTotalSeven, qEven, qOneStock];
  const GRADED = LESSON.length - 2 + QUIZ.length; // 7 lesson problems and 3 quiz items

  /* ---------- Player ---------- */
  function mount(root, Z, start) {
    const { h, icon } = Z;
    const L = Z.data().learner;
    const rm = () => Z.reducedMotion();
    let alive = true, gen = 0;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms); timers.add(id); return id; };
    const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };
    /* Count-up. `tok` names the run it belongs to: when a newer run takes over, this one stops and leaves the
       number to it. Screen swaps bump `gen`; the top-bar XP has its own token so a quick Continue cannot freeze it. */
    let xpGen = 0;
    const counter = (el, from, to, ms, f = fmt, tok = () => gen) => {
      const my = tok();
      if (rm() || ms <= 0) { el.textContent = f(to); return Promise.resolve(); }
      return new Promise(res => {
        const t0 = performance.now();
        const tick = (now) => {
          if (!alive) return res();
          if (my !== tok()) return res();
          const p = Math.min(1, (now - t0) / ms);
          const e = p < 0.8 ? p / 0.8 * 0.9 : 0.9 + (1 - Math.pow(1 - (p - 0.8) / 0.2, 3)) * 0.1;
          el.textContent = f(from + (to - from) * e);
          if (p < 1) requestAnimationFrame(tick); else res();
        };
        requestAnimationFrame(tick);
      });
    };

    const S = {
      phase: 'lesson', i: 0, q: 0, st: 'read',
      xp: 0, checks: 0, okChecks: 0, anyCheck: false,
      results: {}, quiz: [], attempts: 0, rung: 0,
      t0: Date.now(), elapsed: null, streakDone: false,
    };
    // Shortcut routes start later in the lesson with example results so the numbers agree.
    const demoLesson = (perfect) => {
      ['shade', 'first5', 'cross', 'ten', 'derive', 'simulate', 'stocks'].forEach(id => { S.results[id] = { first: perfect || id !== 'cross', xp: perfect || id !== 'cross' ? XP.first : XP.retry }; });
      S.xp = perfect ? 105 : 95; S.checks = perfect ? 7 : 8; S.okChecks = 7; S.anyCheck = true;
    };
    const demoQuiz = () => { ['q1', 'q2', 'q3'].forEach(id => { S.results[id] = { first: true, xp: XP.quiz }; }); S.quiz = ['ok', 'ok', 'ok']; S.xp += 45; S.checks += 3; S.okChecks += 3; };
    /* Close saves the position (spec 5.1); #lesson resumes from it. A finished screen resumes at the next one. */
    const SAVE_KEY = 'lesson.l3';
    const saved = start === 'title' ? Z.store.get(SAVE_KEY, null) : null;
    let resumeAt = null;
    if (saved && (saved.phase === 'lesson' || saved.phase === 'quiz')) {
      ['xp', 'checks', 'okChecks', 'anyCheck', 'results', 'quiz'].forEach(k => { if (saved[k] != null) S[k] = saved[k]; });
      S.t0 = Date.now() - (saved.spent || 0) * 1000;
      resumeAt = saved;
    }
    if (start === 'quiz' || start === 'complete') {
      const perfect = window.ZQLessonDemo === 'perfect';
      demoLesson(perfect);
      S.phase = 'quiz'; S.t0 = Date.now() - 9 * 60000;
      if (start === 'complete') { demoQuiz(); S.elapsed = perfect ? 671 : 726; S.phase = 'complete'; }
    }

    const startStreak = L.streak, startLit = !!L.todayDone;
    root.innerHTML = '';
    const app = h(`<div class="lsn" data-track="prob">
      <div class="lsn-wash" aria-hidden="true"></div>
      <header class="lsn-top">
        <button type="button" class="icon-btn lsn-close" aria-label="Close lesson and return to the course map">${icon('close')}</button>
        <div class="lsn-prog">
          <div class="bar lsn-bar" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="0"><i></i></div>
          <span class="lsn-qpill" title="Lesson quiz" aria-hidden="true"></span>
        </div>
        <div class="lsn-stats">
          <span class="lsn-xp" title="XP this lesson"><span class="lsn-xp-n tnum">0</span>${Z.spark(false)}<span class="sr-only"> XP this lesson</span></span>
          <span class="lsn-streak" title="Streak"><span class="lsn-odo tnum"><span>${startStreak}</span></span>${Z.bolt(startLit)}<span class="sr-only"> day streak</span></span>
        </div>
      </header>
      <main class="lsn-frame">
        <div class="lsn-utils">
          <button type="button" class="icon-btn lsn-flag" aria-label="Report a problem with this screen">${icon('flag', 'sm')}</button>
          <button type="button" class="icon-btn lsn-snd" aria-pressed="false" aria-label="Sound">${icon('mute', 'sm')}</button>
        </div>
        <div class="lsn-scroll"><div class="lsn-col" tabindex="-1"></div></div>
        <div class="lsn-foot">
          <div class="lsn-verdict" aria-live="polite"></div>
          <div class="lsn-solve" hidden><button type="button" class="link-btn lsn-solve-btn">Show solution</button></div>
          <div class="lsn-actions">
            <button type="button" class="btn round secondary lsn-hint" aria-label="Get help">${icon('bulb')}</button>
            <button type="button" class="btn secondary lsn-sec" hidden></button>
            <button type="button" class="btn lsn-primary">Continue</button>
          </div>
        </div>
      </main>
    </div>`);
    root.append(app);
    const $ = (s) => app.querySelector(s);
    const col = $('.lsn-col'), scroller = $('.lsn-scroll'), verdict = $('.lsn-verdict');
    const primary = $('.lsn-primary'), sec = $('.lsn-sec'), hintBtn = $('.lsn-hint'), solveWrap = $('.lsn-solve');
    const barFill = $('.lsn-bar > i'), bar = $('.lsn-bar'), qpill = $('.lsn-qpill');
    const xpN = $('.lsn-xp-n'), sparkEl = $('.lsn-xp .spark');
    const odo = $('.lsn-odo'), boltEl = $('.lsn-streak .bolt'), sndBtn = $('.lsn-snd');
    let step = null, lastPick = null;

    /* Context handed to each screen */
    /* Show-why timers belong to one grade. Grading, Try again, Show solution, Start over and a new screen all
       bump showGen, so a late timer from an earlier answer can never repaint the canvas. */
    let showGen = 0;
    const stopShows = () => { showGen++; };
    const show = (fn, ms) => { const g = showGen; return later(() => { if (g === showGen) fn(); }, ms); };
    const into = (el) => { if (el && el.isConnected) el.scrollIntoView({ block: 'nearest', behavior: rm() ? 'auto' : 'smooth' }); };
    const ctx = {
      Z, later, show, rm, into, alive: () => alive, gen: () => showGen,
      /* apply() now; undo() after ms. Under reduced motion the applied state holds still until the grade is cleared. */
      transient(apply, undo, ms) { apply(); if (!rm()) show(undo, ms); },
      changed() {
        if (!step) return;
        if (S.st === 'idle' || S.st === 'engaged') S.st = step.ready() ? 'engaged' : 'idle';
        refresh();
      },
      pointEl(el) {
        if (!el) return;
        el.classList.remove('lsn-pointed'); void el.offsetWidth; el.classList.add('lsn-pointed');
        into(el);
        later(() => el.classList.remove('lsn-pointed'), 3200);
      },
    };

    /* ----- chrome ----- */
    const setProgress = () => {
      const frac = S.phase === 'lesson' ? S.i / N : 1;
      barFill.style.width = (frac * 100).toFixed(3) + '%';
      bar.setAttribute('aria-valuenow', String(S.phase === 'lesson' ? S.i : N));
      qpill.classList.toggle('cur', S.phase === 'quiz');
      qpill.classList.toggle('ok', S.phase === 'complete');
    };
    const setXP = (to, ms = 400) => {
      const from = S.xpShown || 0; S.xpShown = to;
      sparkEl.classList.toggle('on', to > 0);
      xpGen++;
      counter(xpN, from, to, ms, fmt, () => xpGen);
    };
    const addXP = (n) => { S.xp += n; setXP(S.xp); };
    const setFrame = (k) => {
      app.classList.remove('is-ok', 'is-no');
      if (k) app.classList.add('is-' + k);
    };
    const chip = (kind, title, line, xp, extra = '') => {
      const ic = { ok: 'check', no: 'cross', rev: 'bulb' }[kind];
      verdict.innerHTML = `<div class="lsn-chip is-${kind}"><span class="lsn-chip-ic">${icon(ic, 'sm')}</span><div class="lsn-chip-tx"><div class="lsn-chip-h"><b>${title}</b>${xp ? `<span class="lsn-chip-xp tnum">${Z.spark(true)}+${xp} XP</span>` : ''}</div>${line ? `<span>${mdx(Z, line)}</span>` : ''}${extra ? `<span class="lsn-chip-x">${extra}</span>` : ''}</div></div>`;
    };
    const clearChip = () => { verdict.innerHTML = ''; };
    const showAccepted = () => { const a = col.querySelector('.lsn-accept'); if (a) a.hidden = false; };
    const updateSO = () => {
      const so = col.querySelector('.lsn-so'); if (!so || !step) return;
      so.disabled = !(['idle', 'engaged', 'no'].includes(S.st) && step.dirty && step.dirty());
    };

    /* Buttons follow the state machine in spec 5.4 */
    const refresh = () => {
      const task = step && (step.kind === 'task' || step.kind === 'quiz');
      const quiz = S.phase === 'quiz';
      let p = { label: 'Continue', cls: '', disabled: false, hidden: false }, s = null, hint = 'hidden';
      // After the first Check in the lesson, hints stay open: Get help beside Check on desktop, the round button on mobile.
      const helpOpen = task && !quiz && S.anyCheck;
      switch (S.st) {
        case 'read': break;
        case 'idle': p = { label: 'Check', cls: '', disabled: true }; hint = quiz ? 'hidden' : S.anyCheck ? 'on' : 'off'; if (helpOpen) s = 'Get help'; break;
        case 'engaged': p = { label: 'Check', cls: '', disabled: false }; hint = quiz ? 'hidden' : S.anyCheck ? 'on' : 'off'; if (helpOpen) s = 'Get help'; break;
        case 'eval': p = { label: 'Check', cls: '', disabled: true }; hint = quiz ? 'hidden' : 'off'; if (helpOpen) s = 'Get help'; break;
        case 'ok': p = { label: 'Continue', cls: 'correct' }; s = 'Why?'; break;
        case 'no': p = { label: 'Try again', cls: 'notyet' }; s = 'Get help'; hint = 'on'; break;
        case 'rev': p = { label: 'Continue', cls: '' }; s = 'Why?'; break;
        case 'qok': p = { label: 'Continue', cls: 'correct' }; s = 'Why?'; break;
        case 'qno': p = { label: 'Continue', cls: 'notyet' }; s = 'Why?'; break;
        case 'play': p = { label: 'Continue', cls: '', hidden: true }; break;
        case 'done': p = { label: 'Continue', cls: '' }; break;
      }
      primary.textContent = p.label;
      primary.className = 'btn lsn-primary' + (p.cls ? ' ' + p.cls : '');
      primary.disabled = !!p.disabled;
      primary.classList.toggle('lsn-hide', !!p.hidden);
      primary.setAttribute('aria-hidden', String(!!p.hidden));
      primary.tabIndex = p.hidden ? -1 : 0;
      sec.hidden = !s; sec.textContent = s || '';
      sec.classList.toggle('is-help', s === 'Get help');
      hintBtn.hidden = !task || hint === 'hidden';
      hintBtn.disabled = hint === 'off';
      hintBtn.setAttribute('aria-label', hint === 'off' ? 'Hints open after your first check' : 'Get help');
      app.classList.toggle('lsn-two', !!s);
      solveWrap.hidden = !(S.st === 'no' && S.attempts >= 2 && S.phase === 'lesson');
      updateSO();
    };

    /* ----- screens ----- */
    const swap = async (build) => {
      gen++;
      const old = col.firstElementChild;
      if (old && !rm()) { try { await old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'cubic-bezier(0.3, 0, 0.8, 0.15)', fill: 'forwards' }).finished; } catch (e) { /* interrupted */ } }
      if (!alive) return null;
      if (step && step.destroy) step.destroy();
      col.innerHTML = '';
      const el = build();
      col.append(el);
      Z.mathify(el);
      scroller.scrollTop = 0;
      if (!rm()) el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)' });
      return el;
    };

    const wireStep = () => {
      const so = col.querySelector('.lsn-so');
      if (so) so.addEventListener('click', () => {
        if (!['idle', 'engaged', 'no'].includes(S.st)) return;
        stopShows(); clearPoints();
        step.clearGrade && step.clearGrade(); step.reset && step.reset(); step.lock && step.lock(false);
        setFrame(null); clearChip(); S.st = 'idle'; refresh();
      });
    };

    let busy = false;
    const enterStep = async (factory) => {
      busy = true; stopShows();
      clearChip(); setFrame(null);
      S.attempts = 0; S.rung = 0; lastPick = null;
      let made = null;
      const el = await swap(() => { made = factory(ctx); return made.el; });
      busy = false;
      if (!el) return;
      step = made;
      S.st = step.kind === 'read' ? 'read' : 'idle';
      wireStep(); refresh(); setProgress();
      col.focus({ preventScroll: true });
      if (step.input && matchMedia('(min-width: 768px)').matches) step.input.focus({ preventScroll: true });
      step.enter && step.enter();
    };

    const enterLesson = (i) => { S.phase = 'lesson'; S.i = i; setProgress(); enterStep(LESSON[i]); };
    const quizHead = () => `<div class="lsn-qhead"><span class="t-overline">Lesson quiz</span><span class="dots" aria-hidden="true">${QUIZ.map((_, j) => `<i class="${S.quiz[j] === 'ok' ? 'ok' : S.quiz[j] === 'bad' ? 'bad' : j === S.q ? 'cur' : ''}"></i>`).join('')}</span><span class="t-caption lsn-qof">Question ${S.q + 1} of ${QUIZ.length} · No hints, one try</span></div>`;
    const enterQuiz = (q) => {
      S.phase = 'quiz'; S.q = q; setProgress();
      enterStep((c) => { const s = QUIZ[q](c); s.el.prepend(h(quizHead())); return s; });
    };
    const syncDots = () => {
      const dots = col.querySelectorAll('.lsn-qhead .dots i');
      dots.forEach((d, j) => { d.className = S.quiz[j] === 'ok' ? 'ok' : S.quiz[j] === 'bad' ? 'bad' : j === S.q ? 'cur' : ''; });
    };

    /* ----- Check and its outcomes ----- */
    const check = () => {
      if (S.st !== 'engaged') return;
      S.st = 'eval'; step.lock && step.lock(true); refresh();
      later(grade, 90);
    };
    /* After the verdict chip lands the foot is taller, so bring the graded answer (or the accepted rule) back into view */
    const scrollGraded = () => {
      const t = col.querySelector('.lsn-accept:not([hidden])') || col.querySelector('.opt.correct, .opt.wrong, .opt.lsn-rev, .field.correct, .field.wrong, .field.lsn-rev, .lsn-slot.ok, .lsn-slot.bad, .lsn-slot.rev');
      into(t);
    };
    const grade = () => {
      stopShows();
      const r = step.grade();
      lastPick = step.choice ? step.choice.sel : null;
      S.checks++; S.anyCheck = true;
      if (S.phase === 'quiz') {
        S.quiz[S.q] = r.ok ? 'ok' : 'bad';
        S.results[step.id] = { first: r.ok, xp: r.ok ? XP.quiz : 0 };
        if (r.ok) S.okChecks++;
        setFrame(r.ok ? 'ok' : 'no'); syncDots(); showAccepted();
        if (r.ok) { Z.sound('correct'); Z.haptic(10); } else Z.sound('notyet');
        later(() => r.ok ? chip('ok', 'Correct', r.reason, XP.quiz) : chip('no', 'Not quite right.', r.line, 0, 'Added to your Redo queue.'), 80);
        if (r.ok) later(() => addXP(XP.quiz), 160);
        S.st = r.ok ? 'qok' : 'qno'; refresh();
        later(scrollGraded, 140);
        return;
      }
      if (r.ok) {
        S.okChecks++;
        const gain = S.attempts === 0 ? XP.first : XP.retry;
        S.results[step.id] = { first: S.attempts === 0, xp: gain };
        S.st = 'ok'; setFrame('ok'); showAccepted();
        Z.sound('correct'); Z.haptic(10);
        later(() => chip('ok', 'Correct', r.reason, gain), 80);
        later(() => addXP(gain), 160);
      } else {
        S.attempts++;
        S.st = 'no'; setFrame('no'); Z.sound('notyet');
        later(() => chip('no', 'Not quite right.', r.line), 80);
        if (r.show) show(r.show, 120);
      }
      refresh();
      later(scrollGraded, 140);
    };
    const clearPoints = () => { col.querySelectorAll('.lsn-pointed').forEach(n => n.classList.remove('lsn-pointed')); col.querySelectorAll('.lsn-pt').forEach(n => n.remove()); };
    const tryAgain = () => {
      stopShows(); clearPoints();
      step.clearGrade && step.clearGrade(); step.lock && step.lock(false);
      setFrame(null); clearChip();
      S.st = step.ready() ? 'engaged' : 'idle'; refresh();
      if (step.input) step.input.focus({ preventScroll: true });
    };
    const reveal = () => {
      if (S.phase !== 'lesson' || !step.reveal) return;
      stopShows(); clearPoints();
      // The answer objects animate to the solved state over 600ms (ease-morph), spec 4.5
      if (!rm()) { app.classList.add('lsn-revealing'); later(() => app.classList.remove('lsn-revealing'), 700); }
      step.clearGrade && step.clearGrade(); step.reveal(); step.lock && step.lock(true);
      S.results[step.id] = { first: false, xp: 0, revealed: true };
      setFrame(null); showAccepted();
      chip('rev', 'Solution', step.solution, 0, 'No XP for this screen. It returns in your Redo queue.');
      S.st = 'rev'; refresh();
      later(scrollGraded, 140);
    };
    const next = () => {
      if (S.phase === 'lesson') { if (S.i < N - 1) enterLesson(S.i + 1); else enterQuiz(0); return; }
      if (S.phase === 'quiz') { if (S.q < QUIZ.length - 1) enterQuiz(S.q + 1); else enterComplete(); return; }
      if (S.phase === 'complete') finish();
    };
    const onPrimary = () => {
      if (primary.disabled || S.st === 'play' || busy) return;
      if (S.st === 'idle' || S.st === 'engaged') return check();
      if (S.st === 'no') return tryAgain();
      return next();
    };

    /* ----- Sheets: hints, explanation, report ----- */
    const openHelp = () => {
      if (!step || !step.hints || S.phase !== 'lesson') return;
      S.rung = Math.max(1, S.rung);
      const box = h('<div class="lsn-sheet"></div>');
      const draw = () => {
        box.innerHTML = `<h2 class="t-sheet-title">Get help</h2>
          <p class="t-body lsn-sheet-sub">Three hints, from a nudge to the first step. Hints never cost XP.</p>
          <ol class="lsn-rungs">${step.hints.map((x, i) => `<li class="${i < S.rung ? 'on' : ''}"><span class="lsn-rung-n">${i + 1}</span><div>
            <div class="t-overline">${RUNGS[i]}</div>
            ${i < S.rung ? `<p class="t-body">${mdx(Z, x)}</p>${i === 1 ? `<button type="button" class="btn secondary lsn-showme">${icon('target', 'sm')} Show me on the diagram</button>` : ''}` : '<p class="t-body lsn-locked">Open the hint above first.</p>'}
          </div></li>`).join('')}</ol>
          <div class="lsn-sheet-act">${S.rung < 3 ? '<button type="button" class="btn" data-next>Next hint</button>' : '<button type="button" class="btn secondary" data-solve>Show solution</button>'}<button type="button" class="btn secondary" data-close>Back to the problem</button></div>`;
        Z.mathify(box);
      };
      draw();
      const close = Z.sheet(box, { label: 'Hints' });
      box.addEventListener('click', (e) => {
        if (e.target.closest('[data-next]')) { S.rung = Math.min(3, S.rung + 1); draw(); const b = box.querySelector('[data-next], [data-solve]'); b && b.focus(); }
        else if (e.target.closest('.lsn-showme')) { close(); later(() => step.point && step.point(), 300); }
        else if (e.target.closest('[data-solve]')) { close(); later(reveal, 200); }
      });
    };
    const openWhy = () => {
      if (!step || !step.why) return;
      const rev = !!(step.id && S.results[step.id] && S.results[step.id].revealed);
      Z.sheet(`<div class="lsn-sheet lsn-why"><h2 class="t-sheet-title">Explanation</h2><p class="t-prose">${mdx(Z, step.why(lastPick, rev))}</p></div>`, { label: 'Explanation' });
    };
    const openReport = () => {
      const kinds = ['The answer looks wrong', 'The wording is unclear', 'The diagram has a problem', 'Something else'];
      const box = h(`<div class="lsn-sheet"><h2 class="t-sheet-title">Report this screen</h2>
        <p class="t-body lsn-sheet-sub">Tell us what went wrong. The report includes this screen and your answer.</p>
        <div class="opts lsn-report" role="radiogroup" aria-label="What went wrong">${kinds.map((k, i) => `<button type="button" class="opt" role="radio" aria-checked="false" data-i="${i}">${k}</button>`).join('')}</div>
        <div class="lsn-sheet-act"><button type="button" class="btn" data-send disabled>Send report</button></div></div>`);
      const close = Z.sheet(box, { label: 'Report this screen' });
      box.addEventListener('click', (e) => {
        const o = e.target.closest('.lsn-report .opt');
        if (o) { box.querySelectorAll('.lsn-report .opt').forEach(b => { const on = b === o; b.classList.toggle('selected', on); b.setAttribute('aria-checked', String(on)); }); box.querySelector('[data-send]').disabled = false; }
        if (e.target.closest('[data-send]')) {
          box.innerHTML = `<h2 class="t-sheet-title">Report sent</h2><p class="t-body lsn-sheet-sub">Thanks. A person reads every report, and fixes reach this lesson for everyone.</p><div class="lsn-sheet-act"><button type="button" class="btn" data-close>Back to the lesson</button></div>`;
          box.querySelector('[data-close]').focus();
        }
      });
      return close;
    };

    /* ----- Lesson complete (spec 4.7) and the streak moment ----- */
    let skip = null;
    const enterComplete = async () => {
      S.phase = 'complete'; setProgress(); clearChip(); setFrame(null);
      if (S.elapsed == null) S.elapsed = Math.round((Date.now() - S.t0) / 1000);
      const res = Object.values(S.results);
      const first = res.filter(r => r.first).length;
      const perfect = first === GRADED;
      const acc = S.checks ? Math.round(S.okChecks / S.checks * 100) : 100;
      const base = S.xp, total = S.xp + XP.finish + (perfect ? XP.perfect : 0);
      const badge = (k, ic, label) => `<div class="lsn-badge" data-k="${k}"><span class="lsn-badge-l t-caption">${icon(ic, 'xs')} ${label}</span><b class="tnum lsn-badge-v">0</b></div>`;
      let made = null;
      const el = await swap(() => {
        made = h(`<section class="lsn-done${rm() ? ' rm' : ''}" aria-labelledby="lsn-done-t">
          <div class="lsn-done-mark">${Z.mark('lsn-markic')}</div>
          <h1 class="t-complete" id="lsn-done-t">Lesson complete</h1>
          <div class="lsn-total"><div class="t-overline lsn-total-l">Total XP</div><div class="t-stat lsn-total-n tnum">0</div><p class="t-caption lsn-total-note">&#8203;</p></div>
          <div class="lsn-perfect off"${perfect ? '' : ' hidden'}>${icon('star', 'xs')} Perfect lesson</div>
          <div class="lsn-badges">${badge('acc', 'target', 'Accuracy')}${badge('time', 'clock', 'Time')}${badge('first', 'check', 'First try')}</div>
          <p class="t-body lsn-streakline" hidden></p>
          <p class="t-caption lsn-skip">Tap anywhere to skip</p>
        </section>`);
        return made;
      });
      if (!el) return;
      step = { kind: 'done', el };
      S.st = 'play'; refresh();
      const q = (s) => el.querySelector(s);
      const totalN = q('.lsn-total-n');
      const vals = { acc: [acc, (v) => Math.round(v) + '%'], time: [S.elapsed, (v) => clock(v)], first: [first, (v) => `${Math.round(v)} of ${GRADED}`] };
      const note = `Includes ${XP.finish} for finishing${perfect ? ` and ${XP.perfect} for a perfect lesson` : ''}.`;
      const streakLine = () => {
        const sl = q('.lsn-streakline');
        sl.innerHTML = startLit ? `${Z.bolt(true)}<span>Today already counted. Your streak is on ${L.streak} days.</span>` : `${Z.bolt(true)}<span>Today counts. ${startStreak + 1} days in a row.</span>`;
        sl.hidden = false;
      };
      const finalState = () => {
        gen++; clearTimers();
        el.classList.add('final');
        totalN.textContent = fmt(total);
        Object.entries(vals).forEach(([k, [v, f]]) => { q(`[data-k="${k}"] .lsn-badge-v`).textContent = f(v); });
        q('.lsn-total-note').textContent = note;
        if (perfect) q('.lsn-perfect').classList.remove('off');
        lightStreak(false); streakLine();
        if (!startLit) { odo.innerHTML = `<span>${startStreak + 1}</span>`; }
        setXP(total, 0);
        S.st = 'done'; refresh(); skip = null;
        q('.lsn-skip').hidden = true;
      };
      skip = finalState;
      Z.sound('complete');
      if (rm()) { finalState(); return; }
      // 0ms: the mark pulses and bursts; title rises (CSS)
      later(() => { q('.lsn-done-mark').classList.add('pulse'); Z.burst(q('.lsn-done-mark'), { colors: ['var(--prob)', 'var(--green-face)', 'var(--s4)', 'var(--s3)'] }); }, 60);
      later(() => counter(totalN, 0, base, 700), 260);
      ['acc', 'time', 'first'].forEach((k, i) => later(() => { const [v, f] = vals[k]; counter(q(`[data-k="${k}"] .lsn-badge-v`), 0, v, 700, f); }, 420 + i * 80));
      // The ribbon's row is reserved from the start (visibility only), so the badges never jump while counting
      if (perfect) later(() => { q('.lsn-perfect').classList.remove('off'); q('.lsn-badges').classList.add('sweep'); }, 1200);
      later(() => { // badges merge into the total
        const target = totalN.getBoundingClientRect();
        el.querySelectorAll('.lsn-badge').forEach((b, i) => {
          later(() => {
            const r = b.getBoundingClientRect();
            const g = h('<i class="lsn-ghost" aria-hidden="true"></i>');
            Object.assign(g.style, { left: r.left + r.width / 2 - 6 + 'px', top: r.top + 10 + 'px' });
            document.body.append(g);
            const a = g.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${target.left + target.width / 2 - (r.left + r.width / 2)}px, ${target.top + target.height / 2 - (r.top + 16)}px) scale(0.5)`, opacity: 0.2 }], { duration: 340, easing: 'cubic-bezier(0.3, 0, 0.8, 0.15)' });
            a.onfinish = () => g.remove(); a.oncancel = () => g.remove();
            b.animate([{ transform: 'none' }, { transform: 'translateY(-4px)' }, { transform: 'none' }], { duration: 300 });
          }, i * 80);
        });
        later(() => { totalN.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 420 }); counter(totalN, base, total, 420); q('.lsn-total-note').textContent = note; setXP(total, 420); }, 400);
      }, 1320);
      later(() => { lightStreak(true); streakLine(); }, 1900);
      later(() => { if (skip) finalState(); }, 2350);
    };

    /* The bolt fills and pulses 1, 1.25, 1; the count flips at the peak (about 45% through). */
    const lightStreak = (animate) => {
      if (S.streakDone) return;
      S.streakDone = true;
      if (startLit) { window.ZQFlash = 'done'; return; } // today already counted: mark the node done, no streak toast
      const to = startStreak + 1;
      L.todayDone = true; L.streak = to; window.ZQFlash = 'streak';
      boltEl.classList.add('lit');
      const wrap = $('.lsn-streak');
      wrap.setAttribute('title', `Streak: ${to} days`);
      if (!animate || rm()) { odo.innerHTML = `<span>${to}</span>`; return; }
      Z.sound('streak');
      // 1 to 1.25 to 1: a quick rise, then a spring-bounce settle (spec 4.5); the count flips at the peak
      const spring = getComputedStyle(document.documentElement).getPropertyValue('--spring-bounce').trim() || 'cubic-bezier(0.2, 0, 0, 1)';
      try {
        wrap.animate([{ transform: 'scale(1)', easing: 'cubic-bezier(0.2, 0, 0, 1)' }, { transform: 'scale(1.25)', offset: 0.36, easing: spring }, { transform: 'scale(1)' }], { duration: 560 });
      } catch (e) { wrap.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: 0.36 }, { transform: 'scale(1)' }], { duration: 560, easing: 'cubic-bezier(0.2, 0, 0, 1)' }); }
      later(() => {
        const old = odo.firstElementChild, nu = h(`<span>${to}</span>`);
        odo.append(nu);
        const o = { duration: 250, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' };
        const k = [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }];
        old.animate(k, o);
        nu.animate(k, o).onfinish = () => { odo.innerHTML = `<span>${to}</span>`; };
      }, 80);
    };

    const finish = () => {
      if (!S.streakDone) lightStreak(false);
      Z.store.set(SAVE_KEY, null);
      Z.go('course');
    };
    const savePosition = () => {
      if (S.phase === 'complete') { Z.store.set(SAVE_KEY, null); return; }
      const done = ['ok', 'rev', 'qok', 'qno'].includes(S.st);
      let phase = S.phase, i = S.i, q = S.q;
      if (phase === 'lesson' && done) { i++; if (i >= N) { phase = 'quiz'; q = 0; } }
      else if (phase === 'quiz' && done) q++;
      if (phase === 'lesson' && i === 0) { Z.store.set(SAVE_KEY, null); return; } // nothing to come back to
      Z.store.set(SAVE_KEY, { phase, i, q, xp: S.xp, checks: S.checks, okChecks: S.okChecks, anyCheck: S.anyCheck, results: S.results, quiz: S.quiz, spent: Math.round((Date.now() - S.t0) / 1000) });
    };

    /* ----- wiring ----- */
    $('.lsn-close').addEventListener('click', () => {
      if (S.phase === 'complete') { lightStreak(false); Z.store.set(SAVE_KEY, null); } else savePosition();
      Z.go('course');
    });
    primary.addEventListener('click', onPrimary);
    sec.addEventListener('click', () => { if (sec.textContent === 'Why?') openWhy(); else openHelp(); });
    hintBtn.addEventListener('click', () => { if (!hintBtn.disabled) openHelp(); });
    $('.lsn-solve-btn').addEventListener('click', reveal);
    $('.lsn-flag').addEventListener('click', openReport);
    const syncSound = () => { const on = !!Z.settings.sound; sndBtn.setAttribute('aria-pressed', String(on)); sndBtn.innerHTML = icon(on ? 'sound' : 'mute', 'sm'); sndBtn.setAttribute('aria-label', on ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on'); };
    sndBtn.addEventListener('click', () => { Z.setSetting('sound', !Z.settings.sound); Z.sound('tap'); });
    Z.on('settings', () => { if (alive) syncSound(); });
    syncSound();
    app.addEventListener('click', (e) => { if (skip && S.phase === 'complete' && S.st === 'play' && !e.target.closest('.lsn-top, .lsn-utils')) skip(); });

    const onKey = (e) => {
      if (!alive || document.querySelector('.scrim')) return;
      const t = e.target;
      const inField = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
      if (e.key === 'Enter') {
        if (e.repeat) return;
        if (t && t.closest && t.closest('button, a') && !t.closest('.opt, .lsn-cell')) return; // native activation
        if (skip && S.st === 'play') { e.preventDefault(); skip(); return; }
        if (primary.disabled || primary.classList.contains('lsn-hide')) return;
        e.preventDefault(); primary.classList.add('is-pressed'); later(() => primary.classList.remove('is-pressed'), 90); onPrimary();
        return;
      }
      if (!inField && /^[1-9]$/.test(e.key) && step && step.choice && (S.st === 'idle' || S.st === 'engaged')) {
        e.preventDefault(); step.choice.select(+e.key - 1);
      }
    };
    document.addEventListener('keydown', onKey);

    // QA hook for the screenshot harness: ZQLessonDebug.goto(i) jumps to lesson screen i (0 to 8).
    window.ZQLessonDebug = { goto: (i) => { S.anyCheck = true; enterLesson(Math.max(0, Math.min(N - 1, i))); }, quiz: (q) => enterQuiz(q || 0) };

    setXP(S.xp, 0);
    if (start === 'complete') enterComplete();
    else if (start === 'quiz') enterQuiz(0);
    else if (resumeAt) {
      if (resumeAt.phase === 'lesson') enterLesson(Math.min(N - 1, resumeAt.i));
      else if (resumeAt.q >= QUIZ.length) enterComplete();
      else enterQuiz(resumeAt.q);
      Z.toast('Picked up where you left off');
    } else enterLesson(0);

    return () => {
      alive = false; gen++; clearTimers();
      delete window.ZQLessonDebug;
      document.removeEventListener('keydown', onKey);
      if (step && step.destroy) step.destroy();
      document.querySelectorAll('.lsn-ghost').forEach(n => n.remove());
    };
  }

  ZQ.screen({ id: 'lesson', title: 'Lesson player', group: 'Lesson', shell: false, render: (root, Z) => mount(root, Z, 'title') });
  ZQ.screen({ id: 'lesson-quiz', title: 'Lesson quiz', group: 'Lesson', shell: false, render: (root, Z) => mount(root, Z, 'quiz') });
  ZQ.screen({ id: 'lesson-complete', title: 'Lesson complete', group: 'Lesson', shell: false, render: (root, Z) => mount(root, Z, 'complete') });
})();
