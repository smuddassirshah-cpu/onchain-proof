/* Onboarding: 8 steps, no paywall, account optional and local-first. Steps 1 to 7 live here; step 8 is the first
   lesson itself, which the plan's primary button opens at once (spec 7.6: "It starts at once").
   Spec: docs/design-research.md 7.6 (steps), 2.9 (Besley display token for Welcome and framing questions,
   course-title for statement screens), 4.2 and 4.8 (calm transitions, tangram loader), 4.9 (reduced motion),
   5.3 and 5.4 (keys 1 to 9 select, Enter triggers the primary), 9.2 (voice).
   Curriculum: docs/curriculum.md (3,100 hours, stage hours, Stage 2 track table, weekly rhythm, two habits, exit tests).
   Every class is prefixed ob- (sheet content ob-acct-) so nothing leaks into other screens. */
(function () {
  'use strict';

  /* Prototype clock, matching Today (3 October). Only month and year are shown. */
  const TODAY = new Date(2026, 9, 3);
  const STEPS = 8;            // 8 is the first lesson
  const FULL_PATH = 3100;     // curriculum total
  const DEV_EXTRA = 140;      // curriculum 1.9: on the developer track C++ needs at least double its 140 hours
  const STAGE0 = 500;
  const STAGE0_MATHS = 440;   // 0.1 + 0.2 + 0.3
  const NPROB = 5;            // placement length; the items themselves adapt
  const NB = '&nbsp;';

  const GOALS = [
    { id: 'trader', name: 'Trader', desc: 'Probability, mental arithmetic, market-making games',
      react: 'Trader interviews test probability hardest, so it gets the most hours here too.',
      plan: 'From Stage 2 the weight goes on probability drills, options and one project.' },
    { id: 'researcher', name: 'Researcher', desc: 'Probability, statistics, machine learning, a data take-home',
      react: 'Researchers get the most statistics and machine learning, plus two projects.',
      plan: 'From Stage 2 the weight goes on machine learning, time series and projects 1 and 2.' },
    { id: 'developer', name: 'Developer', desc: 'Algorithms, C++, systems design',
      react: 'Developers get more algorithm practice and twice the C++ hours. That adds 140 hours to the path.',
      plan: `From Stage 2 the weight goes on C++, contests and projects 1 and 4. C++ gets 280${NB}hours, not 140.` },
    { id: 'unsure', name: 'Not sure yet', desc: 'Stages 0 and 1 are the same for every track',
      react: 'That is fine. You choose before Stage 2, about 1,900 hours in.',
      plan: 'Stages 0 and 1 are the same for every track. You choose one before Stage 2.' },
    { id: 'refresh', name: 'Refresh my maths', desc: 'Stage 0 maths, up to the edge of calculus',
      react: 'Your plan will stop at the end of Stage 0 maths. You can extend it later.',
      plan: 'Your plan ends with 0.3 Precalculus. Extend it to the full path at any time.' },
  ];
  const MATHS = [
    { id: 'arith', name: 'Arithmetic', desc: 'Fractions and percentages, with a calculator', start: '0.1' },
    { id: 'gcse', name: 'GCSE', desc: 'Linear equations, graphs, some quadratics', start: '0.2' },
    { id: 'alevel', name: 'A-level', desc: 'Differentiation, logarithms, trigonometry', start: '0.3' },
    { id: 'uni', name: 'University', desc: 'Calculus and linear algebra at degree level', start: '0.3' },
  ];
  const PY = [
    { id: 'never', name: 'Never', desc: 'Not a line yet', react: '0.4 Computer basics runs alongside from week one.' },
    { id: 'some', name: 'Some', desc: 'Loops and functions', react: 'You will move through 0.4 Computer basics quickly.' },
    { id: 'comfortable', name: 'Comfortable', desc: 'Scripts of your own', react: 'Write the 0.4 exit script to test out of it.' },
  ];
  const PY_REFRESH = 'Your plan is maths only for now. Python joins when you extend it.';

  /* ---------- Placement: an item bank from the Stage 0 exit test areas, served adaptively ----------
     Five items, chosen one at a time: the first from the level you chose, then one topic up after a right
     answer and one down after a Not yet or a skip (within 0.1 to 0.3). Answers are checked only at the end. */
  const ITEMS = {
    frac: { name: 'Fraction to decimal', topic: '0.1', kind: 'choice', cols: 2, tex: true,
      prompt: 'Write this fraction as a decimal.', display: '\\frac{3}{8}', opts: ['0.38', '0.375', '2.\\overline{6}', '0.6'], answer: 1 },
    pct: { name: 'Percentage of an amount', topic: '0.1', kind: 'num',
      prompt: 'Work out this percentage.', display: '15\\% \\text{ of } 80', answer: 12 },
    change: { name: 'Percentage change', topic: '0.1', kind: 'choice', cols: 1,
      prompt: 'A price rises by 20%. The new price then falls by 20%. What is the overall change?', opts: ['No change', 'A fall of 4%', 'A rise of 4%', 'A fall of 2%'], answer: 1 },
    lin: { name: 'Linear equation', topic: '0.2', kind: 'num', pre: 'x =', label: 'Your answer for x',
      prompt: 'Solve for $x$.', display: '3x + 7 = 22', answer: 5 },
    quad: { name: 'Quadratic equation', topic: '0.2', kind: 'choice', cols: 2, wide: true, tex: true,
      prompt: 'Which values of $x$ solve this equation?', display: 'x^2 - 5x + 6 = 0',
      opts: ['x = -2 \\text{ or } x = -3', 'x = 1 \\text{ or } x = 6', 'x = 2 \\text{ or } x = 3', 'x = -1 \\text{ or } x = 6'], answer: 2 },
    log: { name: 'Logarithm', topic: '0.3', kind: 'num', pre: 'x =', label: 'Your answer for x',
      prompt: 'Find $x$.', display: '\\log_2 x = 5', answer: 32 },
    sin: { name: 'Exact trigonometry', topic: '0.3', kind: 'choice', cols: 2, tex: true,
      prompt: 'What is the exact value?', display: '\\sin 30^\\circ', opts: ['\\dfrac{\\sqrt{3}}{2}', '\\dfrac{1}{3}', '\\dfrac{\\sqrt{2}}{2}', '\\dfrac{1}{2}'], answer: 3 },
    choose: { name: 'Counting', topic: '0.3', kind: 'num', unit: 'ways', label: 'Number of ways',
      prompt: 'In how many ways can you choose 2 people from a group of 5? Order does not matter.', answer: 10 },
  };
  const TOPICS = ['0.1', '0.2', '0.3'];
  const BANK = { '0.1': ['frac', 'pct', 'change'], '0.2': ['lin', 'quad'], '0.3': ['log', 'sin', 'choose'] };
  const OPENING = { arith: 'frac', gcse: 'lin', alevel: 'quad', uni: 'quad' };

  const START = {
    '0.1': { name: 'Number', course: 'number-sense', lesson: 'What a fraction measures', skipped: 0,
      why: 'Fractions and percentages come first. Everything later is built on them.' },
    '0.2': { name: 'Algebra', course: 'equations', lesson: 'Keeping the balance', skipped: 60,
      why: 'Number looked secure. Equations are where to begin.' },
    '0.3': { name: 'Precalculus', course: 'exp-log', lesson: 'Doubling, again and again', skipped: 240,
      why: 'Number and algebra looked secure. Logarithms are where to begin.' },
  };
  const HOURS = [5, 10, 15, 25];
  const HOURS_REACT = {
    5: 'Slow but steady. Short sessions on most days beat one long one.',
    10: 'Workable alongside a full-time job.',
    15: 'The pace this curriculum is planned around.',
    25: 'Close to a part-time job. The fastest pace here, if you can hold it.',
  };
  /* Weekly rhythm: 9 / 3 / 2 / 1 h at 15 h (curriculum). Mental arithmetic is a 10-minute daily habit, so it holds
     at 1 h at every pace; the other three blocks share the rest 9 : 3 : 2, rounded to half hours by largest remainder.
     Uses ZQData.weeklySplit when data.js provides it, so Today and this screen agree. */
  const localSplit = (h) => {
    const rest = Math.max(0, h - 1), raw = [9, 3, 2].map(w => Math.round(rest * w / 7 * 1e9) / 1e9); // in half hours
    const halves = raw.map(Math.floor); let left = rest * 2 - halves.reduce((a, b) => a + b, 0);
    raw.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left > 0) { halves[i]++; left--; } });
    return [...halves.map(v => v / 2), 1];
  };
  const BLOCKS = [
    { name: 'Main subject', slot: '--s1' }, { name: 'Build', slot: '--s2' },
    { name: 'Review', slot: '--s3', note: 'Redo what you got wrong, a week later and a month later' },
    { name: 'Mental arithmetic', slot: '--s4', note: '10 minutes a day' },
  ];
  const TIMES = [['07:30', 'Morning'], ['12:30', 'Lunch'], ['19:00', 'Evening']];
  const SLOTS = Array.from({ length: 36 }, (_, i) => `${String(6 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`); // 06:00 to 23:30

  /* ---------- Small helpers ---------- */
  const fmtN = (n) => Math.round(n).toLocaleString('en-GB');
  const fmtH = (v) => String(v);
  const duration = (weeks) => {
    const months = weeks * 7 / 30.4375, years = weeks * 7 / 365.25;
    if (months < 18) { const m = Math.max(1, Math.round(months)); return `about ${m}${NB}${m === 1 ? 'month' : 'months'}`; }
    if (years < 3) return `about ${String(+years.toFixed(1))}${NB}years`;
    return `about ${Math.round(years)}${NB}years`;
  };
  const finishDate = (weeks) => new Date(TODAY.getTime() + weeks * 7 * 86400000).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const parseNum = (s) => { const v = String(s).trim().replace(/\s+/g, ''); return /^-?(\d+\.?\d*|\.\d+)$/.test(v) ? parseFloat(v) : NaN; };
  const isRight = (p, a) => a != null && a !== 'skip' && (p.kind === 'choice' ? a === p.answer : Math.abs(parseNum(a) - p.answer) < 1e-9);

  /* ---------- Tangram loader geometry: 7 pieces, 4 points each (triangles repeat a vertex) ---------- */
  const normalise = (poly) => {
    // clockwise on screen, starting from the vertex nearest the top-left, so the pieces morph without twisting
    let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; }
    const pts = a < 0 ? poly.slice().reverse() : poly.slice();
    let k = 0; pts.forEach((p, i) => { if (p[0] + p[1] < pts[k][0] + pts[k][1] - 0.01) k = i; });
    return pts.slice(k).concat(pts.slice(0, k));
  };
  const DIE = (() => {
    // isometric cube: top face cut at a third (pip 1 stays clear of the seam), left face in two, right face in three strips
    const A = [60, 14], B = [100, 37], C = [100, 83], Dn = [60, 106], E = [20, 83], F = [20, 37], O = [60, 60];
    const P = [73.33, 21.67], Q = [33.33, 44.67], L1 = [20, 60], M = [60, 83];
    const top = (x) => 60 - (x - 60) * 23 / 40, bot = (x) => 106 - (x - 60) * 23 / 40;
    const s1 = [73.33, top(73.33)], s2 = [86.67, top(86.67)], b1 = [73.33, bot(73.33)], b2 = [86.67, bot(86.67)];
    return [[F, O, M, L1], [L1, M, Dn, E], [A, P, Q, F], [P, B, O, Q], [O, s1, b1, Dn], [s1, s2, b2, b1], [s2, B, C, b2]].map(normalise);
  })();
  const ARROW = (() => {
    const seg = (P, Q, h) => { const dx = Q[0] - P[0], dy = Q[1] - P[1], L = Math.hypot(dx, dy), nx = -dy / L * h, ny = dx / L * h;
      return [[P[0] + nx, P[1] + ny], [Q[0] + nx, Q[1] + ny], [Q[0] - nx, Q[1] - ny], [P[0] - nx, P[1] - ny]]; };
    const mid = (P, Q) => [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
    const A = [14, 98], B = [44, 66], C = [62, 82], Dn = [92, 48], h = 9;
    const ext = (P, Q, e) => { const L = Math.hypot(Q[0] - P[0], Q[1] - P[1]); return [Q[0] + (Q[0] - P[0]) / L * e, Q[1] + (Q[1] - P[1]) / L * e]; };
    const segX = (P, Q, hh) => seg(ext(Q, P, 4), ext(P, Q, 4), hh); // overlap a little at each joint
    const ux = (Dn[0] - C[0]) / Math.hypot(Dn[0] - C[0], Dn[1] - C[1]), uy = (Dn[1] - C[1]) / Math.hypot(Dn[0] - C[0], Dn[1] - C[1]);
    const nx = -uy * 21, ny = ux * 21, K = [Dn[0] - ux * 2, Dn[1] - uy * 2], tip = [Dn[0] + ux * 30, Dn[1] + uy * 30];
    return [segX(A, mid(A, B), h), segX(mid(A, B), B, h), segX(B, C, h), segX(C, mid(C, Dn), h), segX(mid(C, Dn), Dn, h),
      [K, [K[0] + nx, K[1] + ny], tip, tip], [K, tip, [K[0] - nx, K[1] - ny], [K[0] - nx, K[1] - ny]]].map(normalise);
  })();
  const BELL = (() => {
    // seven slices under a normal curve; each slice top has a midpoint so the curve reads smooth
    const top = (x) => 102 - 84 * Math.exp(-0.5 * Math.pow((x - 60) / 19.5, 2));
    const x0 = 7, w = 106 / 7;
    return Array.from({ length: 7 }, (_, i) => { const a = x0 + i * w, b = a + w, m = (a + b) / 2;
      return [[a, top(a)], [m, top(m)], [b, top(b)], [b, 102], [a, 102]]; });
  })();
  /* Die and arrow pieces get the same fifth point, the midpoint of their first (top) edge, so all three shapes interpolate point for point */
  const withMid = (q) => [q[0], [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2], q[1], q[2], q[3]];
  const SHAPES = [DIE.map(withMid), ARROW.map(withMid), BELL];
  const PIECE_FILL = ['var(--maths)', 'var(--ob-tint)', 'var(--prob)', 'var(--code)', 'var(--fin)', 'var(--ml)', 'var(--speed)'];
  /* Die pips: 1 on the top face, 2 on the left, 3 on the right */
  const PIPS = [[60, 37], [32, 57.7], [48, 85.3], [66.67, 65.37], [80, 71.5], [93.33, 77.63]];
  const easeMorph = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // = cubic-bezier(0.65, 0, 0.35, 1)

  function mount(root, Z) {
    const D = Z.data(), esc = Z.esc;
    const weeklySplit = (h) => (typeof D.weeklySplit === 'function' && D.weeklySplit(h)) || localSplit(h);
    const S = {
      step: 1, goal: null, maths: null, py: null,
      phase: 0,                 // placement: 0 intro, 1 to 5 problems, 6 summary
      seq: [], ans: [],         // item ids served so far, and the answer to each (index, string, 'skip' or null)
      skipAll: false,           // "Not now" on the intro
      choice: 'start', choiceKey: null,
      hours: null, remind: true, time: '19:00',
    };
    const timers = new Set(); let raf = 0, closeSheet = null, keyFn = null;
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); cancelAnimationFrame(raf); raf = 0; };

    root.innerHTML = `<div class="ob">
      <header class="ob-top" hidden>
        <button type="button" class="icon-btn ob-back" aria-label="Back">${Z.icon('chevronL')}</button>
        <div class="ob-prog">
          <div class="bar ob-bar" role="progressbar" aria-label="Setup progress" aria-valuemin="1" aria-valuemax="${STEPS}"><i></i></div>
          <span class="ob-count tnum" aria-hidden="true"></span>
        </div>
        <span class="ob-top-r" aria-hidden="true"></span>
      </header>
      <main class="ob-main"><div class="ob-col"></div></main>
      <footer class="ob-foot"><div class="ob-actions"></div><p class="ob-note t-caption" hidden></p></footer>
    </div>`;
    const $ = (s) => root.querySelector(s);
    const ob = $('.ob'), top = $('.ob-top'), col = $('.ob-col'), actions = $('.ob-actions'), note = $('.ob-note');
    const bar = $('.ob-bar'), fill = bar.querySelector('i'), count = $('.ob-count');

    /* ---------- Placement: next item, results, start point ---------- */
    const nextItem = (seq, ans) => {
      if (!seq.length) return OPENING[S.maths] || OPENING.arith;
      const last = ITEMS[seq[seq.length - 1]], dir = isRight(last, ans[seq.length - 1]) ? 1 : -1;
      const target = Math.min(2, Math.max(0, TOPICS.indexOf(last.topic) + dir));
      const used = new Set(seq);
      // the target topic first; if it has nothing left, look further in the same direction, then back the other way
      const order = [target, target + dir, target - dir, target + 2 * dir, target - 2 * dir];
      for (const t of order) { if (t < 0 || t > 2) continue; const id = BANK[TOPICS[t]].find(x => !used.has(x)); if (id) return id; }
      return null;
    };
    /* Serve item i: keep it if the answers before it still lead there, otherwise replace it and drop what followed */
    const ensureItem = (i) => {
      const id = nextItem(S.seq.slice(0, i), S.ans.slice(0, i));
      if (S.seq[i] !== id) { S.seq = S.seq.slice(0, i).concat(id); S.ans = S.ans.slice(0, i).concat(null); }
    };
    const results = () => S.skipAll ? [] : S.seq.map((id, i) => { const p = ITEMS[id], a = S.ans[i];
      return { id, p, a, ok: isRight(p, a), skip: a == null || a === 'skip' }; });
    const placement = () => {
      const r = results();
      if (!r.length || r.every(x => x.skip)) { // nothing answered: place from the self-reported level
        const m = MATHS.find(x => x.id === S.maths) || MATHS[0];
        return { start: m.start, source: 'self', right: 0, all: false };
      }
      /* Worked from the top down. A topic is secure when it has more right answers than Not yet and skips together;
         a tie counts as secure when a higher topic is secure, so one slip does not undo the right answers above it.
         A topic you were never served is secure when a higher one is. You start at the lowest topic that is not secure.
         Checked over all 243 right / Not yet / skip patterns per level: a right answer in place of a wrong one never lowers the start. */
      const secure = [false, false, false];
      for (let i = TOPICS.length - 1; i >= 0; i--) {
        const xs = r.filter(x => x.p.topic === TOPICS[i]), ok = xs.filter(x => x.ok).length, bad = xs.length - ok;
        const above = secure.slice(i + 1).some(Boolean);
        secure[i] = xs.length ? ok > bad || (ok === bad && above) : above;
      }
      const lowest = secure.indexOf(false), start = lowest === -1 ? '0.3' : TOPICS[lowest];
      const right = r.filter(x => x.ok).length;
      return { start, source: 'problems', right, all: right === NPROB };
    };
    const plan = () => {
      const refresh = S.goal === 'refresh', dev = S.goal === 'developer';
      const pl = placement(), st = START[pl.start], exit = S.choice === 'exit' && !refresh;
      const hours = S.hours || 15;
      const base = weeklySplit(hours);
      // Refresh is maths only: no Build block, its hours go to the main subject
      const split = refresh ? [base[0] + base[1], 0, base[2], base[3]] : base;
      // hours a week that move you along the plan: everything on the full path, maths only (main and review) on refresh
      const rate = refresh ? hours - split[3] : hours;
      const full = FULL_PATH + (dev ? DEV_EXTRA : 0);
      let left, scopeName, first;
      if (exit) {
        left = full - STAGE0;
        scopeName = 'the full path';
        const t = D.topic('1.1'); const c = t.courses[0];
        first = { topicId: '1.1', topicName: t.name, track: 'code', course: c, lesson: 'Your first program' };
      } else {
        left = (refresh ? STAGE0_MATHS : full) - st.skipped;
        scopeName = refresh ? 'Stage 0 maths' : 'the full path';
        const t = D.topic(pl.start); const c = t.courses.find(x => x.id === st.course);
        first = { topicId: pl.start, topicName: t.name, track: t.track, course: c, lesson: st.lesson };
      }
      const stage0Left = exit ? 0 : (refresh ? STAGE0_MATHS : STAGE0) - st.skipped;
      return { pl, st, exit, refresh, dev, hours, split, rate, left, scopeName, first, stage0Left, weeks: left / rate, stage0Weeks: stage0Left / rate };
    };

    /* ---------- Chrome: top bar, progress, buttons ---------- */
    const progressValue = () => {
      const base = (S.step - 1) / (STEPS - 1);
      return S.step === 4 ? base + (S.phase / 7) / (STEPS - 1) : base;
    };
    const updateTop = () => {
      top.hidden = S.step === 1;
      ob.classList.toggle('is-welcome', S.step === 1);
      const v = progressValue();
      fill.style.width = (v * 100).toFixed(2) + '%';
      bar.setAttribute('aria-valuenow', String(S.step));
      bar.setAttribute('aria-valuetext', `Step ${S.step} of ${STEPS}`);
      count.textContent = `${S.step} of ${STEPS}`;
    };
    const setActions = (html, noteHtml = '') => {
      actions.innerHTML = html;
      ob.classList.toggle('no-actions', !html);
      actions.className = 'ob-actions' + (actions.children.length > 1 && !actions.querySelector('.ob-stack') ? ' two' : '');
      note.hidden = !noteHtml; note.innerHTML = noteHtml;
    };
    const primary = () => actions.querySelector('[data-next], [data-primary]');
    const enable = (on) => { const b = actions.querySelector('[data-next]'); if (b) b.disabled = !on; };

    /* ---------- Transitions: content column fades out (120ms), new content fades in and rises 8px (200ms) ----------
       Input is locked from the moment a step changes until the next one is built, and two navigations need at
       least 280ms between them, so a double-click or a repeated Enter moves one step, not two. */
    let firstBuild = true, busy = false, lastNav = -1e9;
    const setInert = (on) => { col.inert = on; actions.inert = on; top.inert = on; };
    const canNav = () => {
      const now = performance.now();
      if (busy || now - lastNav < 280) return false;
      lastNav = now; return true;
    };
    const show = () => {
      clearTimers(); keyFn = null;
      if (closeSheet) { closeSheet(); closeSheet = null; }
      const initial = firstBuild; firstBuild = false;
      if (initial || Z.reducedMotion()) { build(!initial); return; }
      busy = true; setInert(true);
      col.classList.remove('ob-in'); col.classList.add('ob-out');
      later(() => build(true), 120);
    };
    const build = (focus) => {
      busy = false; setInert(false);
      col.classList.remove('ob-out');
      col.innerHTML = '';
      VIEWS[S.step]();
      Z.mathify(col);
      updateTop();
      col.classList.remove('ob-in'); void col.offsetWidth; col.classList.add('ob-in');
      window.scrollTo(0, 0);
      const h = col.querySelector('[data-focus]');
      if (h && focus) h.focus({ preventScroll: true });
    };
    const goStep = (n) => { S.step = n; show(); };
    const advance = () => {
      if (S.step === 4 && S.phase < NPROB + 1) {
        if (S.phase === 0 && S.skipAll) { S.skipAll = false; S.seq = []; S.ans = []; }
        if (S.phase < NPROB) ensureItem(S.phase);
        S.phase++; show(); return;
      }
      if (S.step < 7) goStep(S.step + 1);
    };
    const next = () => { if (canNav()) advance(); };
    const back = () => {
      if (!canNav()) return;
      if (S.step === 4 && S.phase === NPROB + 1 && S.skipAll) { S.phase = 0; show(); return; }
      if (S.step === 4 && S.phase > 0) { S.phase--; show(); return; }
      if (S.step === 7) { goStep(5); return; } // skip the loader on the way back
      if (S.step > 1) goStep(S.step - 1);
    };
    $('.ob-back').addEventListener('click', back);
    actions.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.hasAttribute('data-next')) next();
    });
    /* Keys (spec 5.3, 5.4): Enter triggers the primary button; 1 to 9 pick an answer on choice problems */
    const onKey = (e) => {
      if (!keyFn || busy || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('.scrim')) return; // a sheet is open
      const t = e.target instanceof Element ? e.target : document.body;
      if (t.closest('input, select, textarea')) return;
      keyFn(e, t);
    };
    document.addEventListener('keydown', onKey);
    const enterKey = (e, t) => {
      if (e.key !== 'Enter' || e.repeat || t.closest('button, a')) return false;
      const p = primary(); if (!p || p.disabled) return false;
      e.preventDefault(); p.click(); return true;
    };

    /* ---------- Reusable pieces ---------- */
    const radio = '<span class="ob-radio" aria-hidden="true"></span>';
    const rowBtn = (o, group, sel) => `<button type="button" class="opt ob-row" data-${group}="${o.id}" aria-pressed="${sel === o.id}">
        <span class="ob-row-tx"><span class="ob-row-h">${esc(o.name)}</span><span class="ob-row-d">${esc(o.desc)}</span></span>${radio}</button>`;
    const pick = (container, attr, onPick) => {
      container.addEventListener('click', (e) => {
        const b = e.target.closest(`[data-${attr}]`); if (!b) return;
        container.querySelectorAll(`[data-${attr}]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        Z.sound('tap');
        onPick(b.getAttribute(`data-${attr}`), b);
      });
    };
    const swapText = (el, html) => {
      el.innerHTML = html; el.classList.remove('ob-pop'); void el.offsetWidth; el.classList.add('ob-pop');
    };
    const headline = (text, cls = 't-display ob-q') => `<h1 class="${cls}" tabindex="-1" data-focus>${text}</h1>`;
    const saveAnswers = (start) => Z.store.set('onboarding', { goal: S.goal, maths: S.maths, python: S.py, start, hours: S.hours || 15, reminder: S.remind ? S.time : null });

    /* ---------- 1 Welcome ---------- */
    const welcome = () => {
      col.innerHTML = `<section class="ob-welcome">
          <span class="ob-mark">${Z.mark()}</span>
          ${headline('Zero to quant, one problem at a time.', 't-display ob-hero')}
          <p class="t-prose ob-sub">About ${fmtN(FULL_PATH)} hours of deliberate work, from school arithmetic to interview-ready probability. This builds skill, not a credential.</p>
        </section>`;
      setActions(`<div class="ob-stack"><button type="button" class="btn block" data-next>Start</button>
        <button type="button" class="btn secondary block" data-account>I have an account</button></div>`,
        'No account needed. Your progress stays on this device.');
      actions.querySelector('[data-account]').addEventListener('click', openAccount);
      keyFn = enterKey;
    };
    const openAccount = () => {
      const box = Z.h(`<div class="ob-acct">
          <h2 class="t-sheet-title">Sign in</h2>
          <p class="t-body secondary">We email you a link. Your plan and progress come with you.</p>
          <form class="ob-acct-form" novalidate>
            <label class="t-label" for="ob-email">Email</label>
            <div class="field"><input id="ob-email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" spellcheck="false"></div>
            <button type="submit" class="btn block" disabled>Email me a link</button>
          </form>
        </div>`);
      const input = box.querySelector('input'), send = box.querySelector('[type="submit"]');
      const valid = () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      input.addEventListener('input', () => { send.disabled = !valid(); });
      box.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault(); if (!valid()) return;
        box.innerHTML = `<h2 class="t-sheet-title">Check your inbox</h2>
          <p class="t-body secondary">We sent a link to <b class="ob-acct-mail">${esc(input.value.trim())}</b>. It signs you in on this device and lasts 15 minutes.</p>
          <div class="ob-acct-act"><button type="button" class="btn block" data-signed>I have signed in</button>
          <button type="button" class="btn secondary block" data-close>Carry on without an account</button></div>`;
        box.closest('[role="dialog"]')?.setAttribute('aria-label', 'Check your inbox');
        box.querySelector('[data-signed]').addEventListener('click', () => Z.go('today'));
        box.querySelector('[data-signed]').focus();
      });
      closeSheet = Z.sheet(box, { label: 'Sign in', onClose: () => { closeSheet = null; } });
    };

    /* ---------- 2 Goal ---------- */
    const goal = () => {
      const g = GOALS.find(x => x.id === S.goal);
      col.innerHTML = `${headline('What are you aiming for?')}
        <p class="t-body ob-react" aria-live="polite">${g ? esc(g.react) : '<span class="muted">Pick one. You can change it later in Settings.</span>'}</p>
        <div class="opts ob-rows" role="group" aria-label="Goal">${GOALS.map(o => rowBtn(o, 'goal', S.goal)).join('')}</div>`;
      pick(col.querySelector('.ob-rows'), 'goal', (id) => {
        S.goal = id; swapText(col.querySelector('.ob-react'), esc(GOALS.find(x => x.id === id).react)); enable(true);
      });
      setActions('<button type="button" class="btn block" data-next>Continue</button>');
      enable(!!S.goal);
      keyFn = enterKey;
    };

    /* ---------- 3 Starting point ---------- */
    const start = () => {
      const pyReact = (id) => (S.goal === 'refresh' ? PY_REFRESH : PY.find(x => x.id === id).react);
      col.innerHTML = `${headline('Where are you starting from?')}
        <section class="ob-group" aria-labelledby="ob-gm"><h2 class="t-h2" id="ob-gm">Maths: the furthest you have studied</h2>
          <div class="opts ob-rows" role="group" aria-labelledby="ob-gm">${MATHS.map(o => rowBtn(o, 'maths', S.maths)).join('')}</div></section>
        <section class="ob-group" aria-labelledby="ob-gp"><h2 class="t-h2" id="ob-gp">Python</h2>
          <div class="opts ob-py" role="group" aria-labelledby="ob-gp">${PY.map(o => `<button type="button" class="opt ob-pyb" data-py="${o.id}" aria-pressed="${S.py === o.id}">
            <span class="ob-row-h">${o.name}</span><span class="ob-row-d">${o.desc}</span></button>`).join('')}</div>
          <p class="t-caption secondary ob-pyr" aria-live="polite">${S.py ? esc(pyReact(S.py)) : ''}</p></section>`;
      const ready = () => enable(!!(S.maths && S.py));
      pick(col.querySelector('.ob-rows'), 'maths', (id) => { S.maths = id; ready(); });
      pick(col.querySelector('.ob-py'), 'py', (id) => { S.py = id; swapText(col.querySelector('.ob-pyr'), esc(pyReact(id))); ready(); });
      setActions('<button type="button" class="btn block" data-next>Continue</button>');
      ready();
      keyFn = enterKey;
    };

    /* ---------- 4 Placement: intro, five adaptive problems (neutral selection only), summary ---------- */
    const pdots = (cur) => `<div class="dots ob-pdots" aria-hidden="true">${Array.from({ length: NPROB }, (_, i) =>
      `<i class="${i === cur ? 'cur' : ''} ${!S.skipAll && i !== cur && i < S.seq.length && S.ans[i] != null ? 'ob-done' : ''}"></i>`).join('')}</div>`;
    const placementView = () => {
      if (S.phase === 0) {
        col.innerHTML = `<section class="ob-statement">
            <div class="ob-stmt-art" aria-hidden="true">${pdots(-1)}</div>
            ${headline('Five quick problems. No marks shown until the end.', 't-course-title ob-stmt')}
            <p class="t-body secondary">They come from the Stage 0 exit test and adjust to your answers. Skip any you have not met yet. A skip tells us as much as an answer.</p>
          </section>`;
        setActions(`<button type="button" class="btn secondary ob-sec" data-skipall>Not now</button><button type="button" class="btn ob-pri" data-next>Begin</button>`);
        actions.querySelector('[data-skipall]').addEventListener('click', () => {
          if (!canNav()) return;
          S.skipAll = true; S.seq = []; S.ans = []; S.phase = NPROB + 1; show();
        });
        keyFn = enterKey;
        return;
      }
      if (S.phase <= NPROB) return problem(S.phase - 1);
      summary();
    };
    const problem = (i) => {
      const p = ITEMS[S.seq[i]], a = S.ans[i];
      const body = p.kind === 'choice'
        ? `<div class="opts ob-popts ${p.cols === 2 ? 'two' : ''} ${p.wide ? 'ob-wide' : ''}" role="group" aria-label="Answers">${p.opts.map((o, k) => `<button type="button" class="opt" data-k="${k}" aria-pressed="${a === k}" aria-keyshortcuts="${k + 1}">${p.tex ? Z.tex(o) : esc(o)}</button>`).join('')}</div>`
        : `<label class="field ob-num">${p.pre ? `<span class="ob-num-pre" aria-hidden="true">${Z.tex(p.pre)}</span>` : ''}
            <input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="${esc(p.label || 'Your answer')}" value="${typeof a === 'string' && a !== 'skip' ? esc(a) : ''}">${p.unit ? `<span class="unit">${esc(p.unit)}</span>` : ''}</label>`;
      col.innerHTML = `<section class="ob-prob">
          <div class="ob-prob-head">${pdots(i)}<span class="t-caption muted tnum">Problem ${i + 1} of ${NPROB}</span></div>
          <h1 class="t-prose ob-prompt" tabindex="-1" data-focus>${Z.md(esc(p.prompt))}</h1>
          ${p.display ? `<div class="ob-eq">${Z.tex(p.display, true)}</div>` : ''}
          ${body}
          <p class="t-caption muted ob-nomark">${Z.icon('lock', 'xs')} Answers are checked at the end.</p>
        </section>`;
      setActions(`<button type="button" class="btn secondary ob-sec" data-skip aria-label="Skip: I have not met this yet">Skip</button><button type="button" class="btn ob-pri" data-next>Next</button>`);
      actions.querySelector('[data-skip]').addEventListener('click', () => { if (!canNav()) return; S.ans[i] = 'skip'; advance(); });
      if (p.kind === 'choice') {
        const opts = col.querySelectorAll('[data-k]');
        pick(col.querySelector('.ob-popts'), 'k', (k) => { S.ans[i] = +k; enable(true); });
        enable(typeof a === 'number');
        keyFn = (e, t) => {
          if (enterKey(e, t)) return;
          if (/^[1-9]$/.test(e.key) && !e.repeat) { const b = opts[+e.key - 1]; if (b) { e.preventDefault(); b.click(); } }
        };
      } else {
        const inp = col.querySelector('input');
        const upd = () => { const v = inp.value.trim(); S.ans[i] = v ? v : null; enable(!!v); };
        inp.addEventListener('input', upd);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && inp.value.trim()) { e.preventDefault(); if (!e.repeat) next(); } });
        enable(!!(typeof a === 'string' && a !== 'skip'));
        keyFn = enterKey;
        if (!('ontouchstart' in window)) later(() => inp.focus({ preventScroll: true }), 220);
      }
    };
    const summary = () => {
      const pl = placement(), st = START[pl.start], r = results();
      const self = pl.source === 'self';
      const refresh = S.goal === 'refresh';
      const offerExit = pl.all && !refresh;
      /* The default follows the result: the suggested option is the selected one. A manual pick sticks until the answers change. */
      const key = [S.maths, S.skipAll, ...S.seq.map((id, k) => `${id}=${S.ans[k]}`)].join('|');
      if (refresh) S.choice = 'start';
      else if (key !== S.choiceKey) { S.choice = offerExit ? 'exit' : 'start'; S.choiceKey = key; }
      const statement = offerExit ? `All five right. Start at 0.3${NB}Precalculus, or sit the exit test.` : `Start at Stage 0, item ${pl.start}${NB}${st.name}.`;
      const why = self ? `You skipped the problems, so this comes from the level you chose: ${esc(MATHS.find(x => x.id === S.maths)?.name || 'Arithmetic')}.`
        : offerExit ? 'Five problems cannot place you past Stage 0. The exit test can.' : st.why;
      const verdict = (x) => x.skip ? `<span class="ob-v ob-v-skip">${Z.icon('minus', 'xs')}Skipped</span>`
        : x.ok ? `<span class="ob-v ob-v-ok">${Z.icon('check', 'xs')}Correct</span>` : `<span class="ob-v ob-v-no">${Z.icon('cross', 'xs')}Not yet</span>`;
      const tag = '<span class="ob-tag">Suggested</span>';
      col.innerHTML = `<section class="ob-sum">
          <p class="t-overline muted">Placement</p>
          ${headline(statement, 't-course-title ob-stmt')}
          <p class="t-body secondary ob-why">${why}</p>
          ${self ? '<p class="ob-center"><button type="button" class="link-btn ob-retry" data-retry>Try the five problems after all</button></p>' : ''}
          ${self ? '' : `<div class="ob-results"><div class="ob-results-h"><span class="t-h2">Your answers</span><span class="t-label tnum">${pl.right} of ${r.length} right</span></div>
            <ol>${r.map((x, i) => `<li><span class="ob-rn tnum">${i + 1}</span><span class="ob-rt"><span class="t-label">${esc(x.p.name)}</span><span class="t-caption muted">${x.p.topic} ${esc(D.topic(x.p.topic).name)}</span></span>${verdict(x)}</li>`).join('')}</ol></div>`}
          ${refresh ? '' : `<div class="opts ob-choice" role="group" aria-label="How to start">
            <button type="button" class="opt ob-row" data-choice="start" aria-pressed="${S.choice === 'start'}">
              <span class="ob-row-tx"><span class="ob-row-h">Start at ${pl.start}${NB}${st.name}${offerExit ? '' : ' ' + tag}</span><span class="ob-row-d">Work through Stage 0 from there.</span></span>${radio}</button>
            <button type="button" class="opt ob-row" data-choice="exit" aria-pressed="${S.choice === 'exit'}">
              <span class="ob-row-tx"><span class="ob-row-h">Sit the Stage 0 exit test instead${offerExit ? ' ' + tag : ''}</span><span class="ob-row-d">A GCSE Higher paper at 80% and a precalculus test at 85%. Then 25 on the 2‑minute drill and a Python script that runs.</span></span>${radio}</button>
          </div>`}
        </section>`;
      if (!refresh) pick(col.querySelector('.ob-choice'), 'choice', (id) => { S.choice = id; });
      const retry = col.querySelector('[data-retry]');
      if (retry) retry.addEventListener('click', () => {
        if (!canNav()) return;
        S.skipAll = false; S.seq = []; S.ans = []; ensureItem(0); S.phase = 1; show();
      });
      setActions('<button type="button" class="btn block" data-next>Continue</button>');
      keyFn = enterKey;
    };

    /* ---------- 5 Week ---------- */
    const week = () => {
      col.innerHTML = `${headline('How many hours a week?')}
        <div class="ob-hours" role="group" aria-label="Hours per week">${HOURS.map(h => `<button type="button" class="chip ob-hr" data-h="${h}" aria-pressed="${S.hours === h}" aria-label="${h} hours a week"><b class="tnum">${h}</b><span>h</span></button>`).join('')}</div>
        <div class="card ob-pace" aria-live="polite"></div>
        <section class="ob-group ob-remind" aria-labelledby="ob-gr">
          <div class="ob-remind-h"><h2 class="t-h2" id="ob-gr">Daily reminder</h2>
            <label class="ob-switch"><input type="checkbox" role="switch" ${S.remind ? 'checked' : ''} aria-labelledby="ob-gr"><span aria-hidden="true"></span></label></div>
          <div class="ob-times">
            <div class="ob-tchips" role="group" aria-label="Reminder time presets">${TIMES.map(([t, n]) => `<button type="button" class="chip ob-tc" data-t="${t}" aria-pressed="${S.time === t}"><span class="ob-tc-n">${n}</span><span class="tnum">${t}</span></button>`).join('')}</div>
            <label class="field ob-time"><span class="t-label secondary">At</span><select aria-label="Reminder time">${SLOTS.map(t => `<option value="${t}" ${t === S.time ? 'selected' : ''}>${t}</option>`).join('')}</select>${Z.icon('chevronD', 'sm')}</label>
          </div>
          <p class="t-caption muted">Only on days you have not studied yet. Change it any time in Settings.</p>
        </section>`;
      const pace = col.querySelector('.ob-pace');
      const renderPace = (animate) => {
        if (!S.hours) { pace.innerHTML = `<p class="t-body muted ob-pace-empty">Pick a pace to see how long the path takes.</p>`; return; }
        const P = plan();
        const from = P.exit ? ' after the exit test' : P.st.skipped ? ` from ${P.pl.start} ${P.st.name}` : '';
        const extra = P.dev && !P.refresh ? ` That includes ${DEV_EXTRA}${NB}more hours of C++ for developers.` : '';
        const maths = P.refresh ? ` ${P.rate} of your ${S.hours}${NB}hours a week go on maths. The other hour is mental arithmetic.` : '';
        const html = `<div class="ob-pace-big"><span class="t-h1">${duration(P.weeks).replace(/^a/, 'A')}</span><span class="t-caption muted">at ${S.hours}${NB}hours a week</span></div>
          <p class="t-body secondary">${fmtN(P.left)}${NB}hours for ${P.scopeName}${from}.${extra}${maths} Finish around ${finishDate(P.weeks)}.</p>
          <p class="t-body ob-pace-r">${HOURS_REACT[S.hours]}</p>`;
        if (animate) swapText(pace, html); else pace.innerHTML = html;
      };
      renderPace(false);
      col.querySelector('.ob-hours').addEventListener('click', (e) => {
        const b = e.target.closest('[data-h]'); if (!b) return;
        S.hours = +b.dataset.h;
        col.querySelectorAll('[data-h]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        Z.sound('tap'); renderPace(true); enable(true);
      });
      const sw = col.querySelector('.ob-switch input'), times = col.querySelector('.ob-times'), tin = col.querySelector('.ob-time select');
      const syncRemind = () => {
        times.classList.toggle('is-off', !S.remind);
        times.querySelectorAll('button, select').forEach(x => { x.disabled = !S.remind; });
      };
      sw.addEventListener('change', () => { S.remind = sw.checked; syncRemind(); });
      const syncChips = () => times.querySelectorAll('[data-t]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.t === S.time)));
      times.querySelector('.ob-tchips').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; S.time = b.dataset.t; tin.value = S.time; syncChips(); });
      tin.addEventListener('change', () => { S.time = tin.value; syncChips(); });
      syncRemind();
      setActions('<button type="button" class="btn block" data-next>Continue</button>');
      enable(!!S.hours);
      keyFn = enterKey;
    };

    /* ---------- 6 Loader: seven pieces morph die -> rising arrow -> bell curve (700ms ease-morph, 400ms holds) ---------- */
    const loader = () => {
      const P = plan();
      const lines = [
        P.exit ? 'Booking the Stage 0 exit test' : `Placing you at ${P.first.topicId} ${P.first.topicName}`,
        `Fitting ${P.hours} hours into your week`,
        'Adding your two habits',
      ];
      const pts = (poly) => poly.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
      col.innerHTML = `<section class="ob-load">
          <svg class="ob-tangram is-die" viewBox="0 0 120 120" role="img" aria-label="Seven pieces forming a die, a rising arrow and a bell curve">
            ${SHAPES[0].map((poly, i) => `<polygon points="${pts(poly)}" style="fill:${PIECE_FILL[i]}"/>`).join('')}
            <g class="ob-pips">${PIPS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2"/>`).join('')}</g>
          </svg>
          ${headline('Building your plan', 't-h1 ob-load-h')}
          <p class="t-body secondary ob-load-l" aria-live="polite">${lines[0]}</p>
        </section>`;
      setActions('');
      const svg = col.querySelector('svg'), polys = Array.from(svg.querySelectorAll('polygon')), line = col.querySelector('.ob-load-l');
      const draw = (a, b, t) => polys.forEach((el, i) => el.setAttribute('points', a[i].map((p, k) => { const q = b[i][k]; return (p[0] + (q[0] - p[0]) * t).toFixed(2) + ',' + (p[1] + (q[1] - p[1]) * t).toFixed(2); }).join(' ')));
      const morph = (from, to, done) => {
        svg.classList.remove('is-die');
        const t0 = performance.now();
        const stepF = (now) => {
          const t = Math.min(1, (now - t0) / 700);
          draw(SHAPES[from], SHAPES[to], easeMorph(t));
          if (t < 1) raf = requestAnimationFrame(stepF); else { raf = 0; if (to === 0) svg.classList.add('is-die'); done(); }
        };
        raf = requestAnimationFrame(stepF);
      };
      const finish = () => later(() => goStep(7), 0);
      if (Z.reducedMotion()) { later(() => swapText(line, lines[1]), 600); later(() => swapText(line, lines[2]), 1200); later(finish, 1800); return; }
      // 400 hold, 700 morph, 400 hold, 700 morph, 400 hold: 2.6 s
      later(() => { swapText(line, lines[1]); morph(0, 1, () => later(() => { swapText(line, lines[2]); morph(1, 2, () => later(finish, 400)); }, 400)); }, 400);
    };

    /* ---------- 7 Your plan. Its primary button opens step 8, the first lesson, at once ---------- */
    const planView = () => {
      const P = plan(), f = P.first, g = GOALS.find(x => x.id === S.goal) || GOALS[3];
      const stage0 = !P.exit && P.stage0Left > 0;
      const statement = P.exit ? 'Exit test first, then Stage 1.' : `${f.topicName} first, ${P.hours}${NB}hours a week.`;
      const mainNote = P.exit ? 'Exit test parts first, then 1.1 Python if you pass'
        : `On the current item: ${f.topicId}\u00a0${f.topicName}`;
      const buildNote = P.exit ? 'Code. From Stage 1, commit something every week'
        : S.py === 'comfortable' ? 'Code. Pass the 0.4 exit script, then write small scripts of your own'
        : '0.4 Computer basics: typing, the terminal, a first script';
      const notes = [mainNote, buildNote, BLOCKS[2].note, BLOCKS[3].note];
      const blocks = BLOCKS.map((b, i) => ({ ...b, h: P.split[i], note: notes[i] })).filter(b => b.h > 0);
      const splitNote = P.refresh ? 'Maths only, so the Build hours go to the main subject. Mental arithmetic stays at 10 minutes a day.'
        : P.hours !== 15 ? 'Mental arithmetic stays at 10 minutes a day at any pace.' : '';
      const totalLabel = P.refresh ? 'Stage 0 maths done' : 'Full path done';
      const mentalCap = P.exit ? 'From this week. The exit test asks for 25 on the 2‑minute drill.'
        : P.refresh ? 'From this week. Aim for 25 on the 2‑minute drill.'
        : 'From this week. Reach 25 on the 2‑minute drill by the end of Stage 0.';
      const firstRow = P.exit
        ? `<div><dt>Exit test</dt><dd>4 parts, in any order <span class="muted">· GCSE paper first, 90${NB}minutes</span></dd></div>`
        : `<div><dt>First lesson</dt><dd>${esc(f.lesson)} <span class="muted">· about 12${NB}minutes</span></dd></div>`;
      col.innerHTML = `<section class="ob-plan">
          <p class="t-overline muted ob-center">Your plan</p>
          ${headline(statement, 't-course-title ob-stmt')}
          <article class="card ob-pcard" data-track="${f.track}">
            <div class="ob-pcard-art" aria-hidden="true">${window.ZQArt ? ZQArt(f.course.art) : ''}</div>
            <dl class="ob-dl">
              <div><dt>Stage</dt><dd>${P.exit ? 'Stage 0 exit test, then Stage 1 Foundations' : 'Stage 0 · From nothing'}</dd></div>
              ${firstRow}
              <div><dt>${P.exit ? 'First topic if you pass' : 'First topic'}</dt><dd>${f.topicId} ${esc(f.topicName)} <span class="muted">· ${D.topic(f.topicId).hours}${NB}hours</span></dd></div>
              <div><dt>First course</dt><dd>${esc(f.course.name)} <span class="muted">· ${f.course.lessons}${NB}lessons</span></dd></div>
              <div><dt>Track</dt><dd>${esc(g.name)}</dd></div>
            </dl>
            <p class="t-caption secondary ob-pcard-n">${g.plan}${P.exit ? ' If you miss the bar on a part, you get a list of what to study and start at ' + P.pl.start + ' ' + P.st.name + '.' : ''}</p>
          </article>

          <div class="ob-finish">
            ${stage0 && !P.refresh ? `<div class="card ob-stat"><span class="t-overline muted">Stage 0 done</span><span class="t-h1">${finishDate(P.stage0Weeks)}</span><span class="t-caption muted">${fmtN(P.stage0Left)}${NB}hours, ${duration(P.stage0Weeks)}</span></div>` : ''}
            <div class="card ob-stat"><span class="t-overline muted">${totalLabel}</span><span class="t-h1">${finishDate(P.weeks)}</span><span class="t-caption muted">${fmtN(P.left)}${NB}hours, ${duration(P.weeks)}</span></div>
          </div>

          <section class="ob-group" aria-labelledby="ob-gw">
            <div class="ob-split-h"><h2 class="t-h2" id="ob-gw">Your week</h2><span class="t-label tnum">${P.hours}${NB}hours</span></div>
            <div class="ob-split" role="img" aria-label="${blocks.map(b => `${b.name} ${fmtH(b.h)} hours`).join(', ')}">
              ${blocks.map(b => `<span style="flex:${b.h} 1 0;--c:var(${b.slot})"></span>`).join('')}
            </div>
            <ul class="ob-keys">${blocks.map(b => `<li style="--c:var(${b.slot})"><span class="ob-key-h"><span class="t-label">${b.name}</span><span class="t-label tnum">${fmtH(b.h)}${NB}h</span></span><span class="t-caption secondary">${esc(b.note)}</span></li>`).join('')}</ul>
            ${splitNote ? `<p class="t-caption muted">${splitNote}</p>` : ''}
          </section>

          <section class="ob-group" aria-labelledby="ob-gh">
            <h2 class="t-h2" id="ob-gh">Two habits</h2>
            <ul class="ob-habits">
              <li data-track="speed"><span class="ob-hi">${Z.icon('timer')}</span><span><span class="t-label">10 minutes of mental arithmetic a day</span><span class="t-caption secondary">${mentalCap}</span></span></li>
              <li data-track="prob" class="${P.refresh ? 'is-later' : ''}"><span class="ob-hi">${Z.icon('target')}</span><span><span class="t-label">Three interview-style probability problems a week</span><span class="t-caption secondary">${P.refresh ? 'Starts at 1.5 Probability, beyond your current plan.' : 'Starts when you reach 1.5 Probability.'}</span></span></li>
            </ul>
          </section>
          <p class="t-caption muted ob-center">Estimates assume you keep this pace every week. Change any of it in Settings.</p>
        </section>`;
      const syncNote = 'Create an account after your first lesson to sync. Until then, your progress stays on this device.';
      if (P.exit) {
        setActions(`<div class="ob-stack"><button type="button" class="btn block" data-primary data-exam>Start the exit test</button>
          <button type="button" class="btn secondary block" data-lesson>Start with a lesson instead</button></div>`, syncNote);
        actions.querySelector('[data-exam]').addEventListener('click', () => { if (!canNav()) return; saveAnswers('exit'); Z.go('exam'); });
      } else {
        setActions('<button type="button" class="btn block" data-primary data-lesson>Start your first lesson</button>', syncNote);
      }
      actions.querySelector('[data-lesson]').addEventListener('click', () => { if (!canNav()) return; saveAnswers(P.pl.start); Z.go('lesson'); });
      keyFn = enterKey;
    };

    const VIEWS = { 1: welcome, 2: goal, 3: start, 4: placementView, 5: week, 6: loader, 7: planView };
    show();

    return () => { clearTimers(); document.removeEventListener('keydown', onKey); if (closeSheet) closeSheet(); };
  }

  ZQ.screen({ id: 'onboarding', title: 'Onboarding', group: 'Onboarding', shell: false, render: (root, Z) => mount(root, Z) });
})();
