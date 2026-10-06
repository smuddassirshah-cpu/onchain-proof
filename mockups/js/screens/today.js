/* Today (Home) and the mental arithmetic warm-up.
   Spec: 7.2 Today, 6.2 streak, rest days and weekly goal, 2.6 charts, 4 motion, 9.2 voice.
   Curriculum: the weekly rhythm (9 / 3 / 2 / 1 h at 15 h) and the two daily habits
   (10 minutes of mental arithmetic a day; three probability problems a week from 1.5).
   Layout modes: under 768px the mobile order; 768 to 1023 one column of the desktop cards;
   1024 and up two columns, the left 480px. Cards are moved between modes, never duplicated,
   so reading order and focus order always match what is on screen. */
(function () {
  'use strict';

  /* Prototype clock. data.js puts today on a Saturday (week strip), with 2 league days left
     and Homework 4 due Thu 8 Oct, so today is Saturday 3 October. */
  const TODAY = 'Saturday 3 October';
  const LAST_INITIAL = 'S.'; // data.js holds the first name only

  /* Shared across visits to these two screens in one session. shown: what the goal bar and ring last drew,
     so their fills animate only when a value has changed (spec 1: celebration is kept for the boundaries). */
  const session = { rounds: 0, shown: null };
  const ROUNDS_A_DAY = 5; // five 2-minute rounds make the curriculum's 10 minutes a day

  const LEVEL_ART = {
    1: ['tree', 'A probability tree'],
    2: ['grid', 'A grid of counted outcomes'],
    3: ['die', 'Two dice'],
    4: ['folds', 'A row of doors with one picked'],
  };
  /* Weekly rhythm from the curriculum, at the 15 h goal. Chart slots 1 to 4 in fixed order (spec 2.6). */
  const BLOCKS = [
    { key: 'main', name: 'Main subject', base: 9, slot: '--s1' },
    { key: 'build', name: 'Build', base: 3, slot: '--s2' },
    { key: 'review', name: 'Review', base: 2, slot: '--s3' },
    { key: 'mental', name: 'Mental arithmetic', base: 1, slot: '--s4' },
  ];
  /* Weekly mastery points for the rows around the learner (example data) */
  const NEIGHBOURS = { above: { name: 'Aisha K.', initial: 'A', mp: 104, bg: 'var(--fin-lip)' }, me: 96, below: { name: 'Daniel O.', initial: 'D', mp: 91, bg: 'var(--ml-lip)' } };
  const GREEK = { Alpha: '\\alpha', Beta: '\\beta', Gamma: '\\gamma', Delta: '\\delta', Epsilon: '\\epsilon', Zeta: '\\zeta', Theta: '\\theta', Lambda: '\\lambda', Sigma: '\\sigma', Omega: '\\omega' };

  /* Formulas the search can find. Each is checked against its source course. */
  const FORMULAS = [
    { name: 'Conditional probability', tex: 'P(A \\mid B) = \\dfrac{P(A \\cap B)}{P(B)}', what: 'Keep only the outcomes where $B$ happened, then measure $A$ again.', course: 'conditional', level: 1, keys: 'given' },
    { name: 'Multiplication rule', tex: 'P(A \\cap B) = P(A)\\,P(B \\mid A)', what: 'The chance of both is the chance of the first, times the chance of the second given the first.', course: 'conditional', level: 1, keys: 'product both and' },
    { name: 'Bayes’ rule', tex: 'P(A \\mid B) = \\dfrac{P(B \\mid A)\\,P(A)}{P(B)}', what: 'It turns $P(B \\mid A)$, which you often know, into $P(A \\mid B)$, which you usually want.', course: 'conditional', level: 2, keys: 'bayes theorem posterior prior' },
    { name: 'Law of total probability', tex: 'P(B) = P(B \\mid A)\\,P(A) + P(B \\mid A^c)\\,P(A^c)', what: 'Split $B$ by whether $A$ happened, then add the two pieces.', course: 'conditional', level: 2, keys: 'total partition' },
    { name: 'Independence', tex: 'P(A \\cap B) = P(A)\\,P(B)', what: 'Knowing that $B$ happened tells you nothing about $A$.', course: 'conditional', level: 3, keys: 'independent' },
    { name: 'Expected value', tex: 'E[X] = \\sum_x x\\,P(X = x)', what: 'The average of the values $X$ can take, each weighted by its probability.', course: 'random-vars', keys: 'mean expectation' },
    { name: 'Variance', tex: '\\operatorname{Var}(X) = E[X^2] - \\big(E[X]\\big)^2', what: 'The mean of the square minus the square of the mean.', course: 'random-vars', keys: 'spread standard deviation' },
    { name: 'Power rule', tex: '\\dfrac{d}{dx}\\,x^n = n\\,x^{n-1}', what: 'Bring the power down, then reduce it by one.', course: 'limits', keys: 'derivative differentiate' },
    { name: 'Integration by parts', tex: '\\int u\\,dv = uv - \\int v\\,du', what: 'The product rule for derivatives, run backwards.', course: 'integrals', keys: 'integral' },
    { name: 'Quadratic formula', tex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', what: 'The roots of $ax^2 + bx + c = 0$, for any $a \\neq 0$.', course: 'quadratics', keys: 'roots' },
    { name: 'Put-call parity', tex: 'C - P = S_0 - K e^{-rT}', what: 'A call minus a put with the same strike and expiry is worth a forward. It holds for European options on a stock with no dividends.', course: 'options', keys: 'options call put' },
  ];

  /* Lower case, no apostrophes, no accents: "Bayes’ rule" matches "bayes rule", "Itô" matches "ito" */
  const norm = (s) => String(s).toLowerCase().replace(/[’‘']/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const fmtH = (v) => String(Math.round(v * 10) / 10);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const greeting = () => { const h = new Date().getHours(); return h >= 4 && h < 12 ? 'Good morning' : h >= 12 && h < 17 ? 'Good afternoon' : 'Good evening'; };
  const lessonNo = (it) => parseInt(String(it.id).slice(1), 10);
  const mins = (screens) => Math.round(screens * 1.2); // matches the course map

  /* ---------- Tooltip shared by the two charts (values lead, labels follow; textContent only) ---------- */
  const showTip = (wrap, tip, x, y, strong, light) => {
    tip.replaceChildren();
    const b = document.createElement('b'); b.textContent = strong;
    const s = document.createElement('span'); s.textContent = light;
    tip.append(b, s); tip.hidden = false;
    const ww = wrap.clientWidth, tw = tip.offsetWidth;
    tip.style.left = Math.max(0, Math.min(ww - tw, x - tw / 2)) + 'px';
    tip.style.top = (y - tip.offsetHeight - 10) + 'px';
  };

  /* Pointer, touch and keyboard reading for a chart with n positions along x.
     A tap fires no pointermove, so pointerdown picks the point; the focus that follows keeps it. */
  const hoverable = (svg, n, indexAt, show, hide) => {
    let idx = -1;
    const set = (i) => { idx = i; if (i < 0) hide(); else show(i); };
    const at = (e) => { const r = svg.getBoundingClientRect(); return indexAt(e.clientX - r.left, r.width); };
    svg.addEventListener('pointermove', (e) => set(at(e)));
    svg.addEventListener('pointerdown', (e) => set(at(e)));
    /* A finger "leaves" on lift, before the tap's focus arrives, so only a mouse or pen leaving hides the reading */
    svg.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch' && document.activeElement !== svg) set(-1); });
    svg.addEventListener('focus', () => { if (idx < 0) set(n - 1); });
    svg.addEventListener('blur', () => set(-1));
    svg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); set(Math.max(0, Math.min(n - 1, (idx < 0 ? n - 1 : idx) + (e.key === 'ArrowLeft' ? -1 : 1)))); }
      if (e.key === 'Home') { e.preventDefault(); set(0); }
      if (e.key === 'End') { e.preventDefault(); set(n - 1); }
    });
  };

  /* Sparkline: one series, the speed track gold, endpoint emphasised with a surface ring. */
  const sparkline = (wrap, values) => {
    const W = 168, H = 56, P = 9, n = values.length;
    const lo = Math.min(...values), hi = Math.max(...values);
    const x = (i) => P + i * (W - 2 * P) / (n - 1);
    const y = (v) => H - P - (v - lo) / Math.max(1, hi - lo) * (H - 2 * P);
    const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" tabindex="0" role="img"
        aria-label="Your last ${n} scores, oldest first: ${values.join(', ')}. Use the arrow keys to read each one.">
        <line class="zt-cross" x1="0" x2="0" y1="2" y2="${H - 2}" visibility="hidden"/>
        <path class="zt-sline" d="${d}"/>
        <circle class="zt-hot" r="4" visibility="hidden"/>
        <circle class="zt-end" cx="${x(n - 1).toFixed(1)}" cy="${y(values[n - 1]).toFixed(1)}" r="4.5"/>
      </svg><div class="zt-tip" hidden></div>`;
    const svg = wrap.querySelector('svg'), tip = wrap.querySelector('.zt-tip');
    const cross = svg.querySelector('.zt-cross'), hot = svg.querySelector('.zt-hot');
    hoverable(svg, n, (px, w) => Math.max(0, Math.min(n - 1, Math.round((px * W / w - P) / ((W - 2 * P) / (n - 1))))), (i) => {
      cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
      hot.setAttribute('cx', x(i)); hot.setAttribute('cy', y(values[i])); hot.setAttribute('visibility', i === n - 1 ? 'hidden' : 'visible');
      const back = n - 1 - i;
      showTip(wrap, tip, x(i), y(values[i]), String(values[i]), back === 0 ? 'Last round' : plural(back, 'round', 'rounds') + ' before');
    }, () => { cross.setAttribute('visibility', 'hidden'); hot.setAttribute('visibility', 'hidden'); tip.hidden = true; });
  };

  /* =====================================================================================
     TODAY
     ===================================================================================== */
  ZQ.screen({
    id: 'today', title: 'Today', group: 'App', shell: true, tab: 'today',
    render(root, Z) {
      const D = Z.data(), L = D.learner, C = D.currentCourse, esc = Z.esc;
      const offs = [];
      const listen = (target, ev, fn, opt) => { target.addEventListener(ev, fn, opt); offs.push(() => target.removeEventListener(ev, fn, opt)); };

      /* ---------- Course and level state ---------- */
      const curLevel = Math.max(0, C.levels.findIndex(lv => lv.items.some(it => it.status === 'current')));
      let sel = curLevel;
      const levelInfo = (i) => {
        const lv = C.levels[i];
        const cur = lv.items.find(it => it.status === 'current');
        const next = cur || lv.items.find(it => it.kind === 'lesson' && it.status !== 'done') || lv.items[0];
        return { lv, next, isCurrent: !!cur, no: lessonNo(next), done: lv.items.filter(it => it.status === 'done').length, total: lv.items.length };
      };
      const art = (n) => LEVEL_ART[n] || [C.art, ''];

      /* ---------- Numbers ---------- */
      const goal = L.weeklyGoalH || 15;
      const blocks = BLOCKS.map(b => ({ ...b, goal: b.base * goal / 15, done: L.hoursThisWeek[b.key] || 0 }));
      const doneH = blocks.reduce((s, b) => s + b.done, 0);
      const lg = L.league;
      const examPct = Math.round(L.nextExam.readiness * 100);
      const trend = L.mental.trend;

      /* Fills animate on the first visit and when a value changes; a changed fill grows from where it was */
      const fills = blocks.map(b => Math.min(100, b.done / b.goal * 100).toFixed(1));
      const prev = session.shown;
      const goalGrow = !prev || prev.fills.join() !== fills.join();
      const growFrom = (i) => (prev && +fills[i] > 0 ? Math.min(1, prev.fills[i] / fills[i]).toFixed(3) : 0);
      const ringGrow = !prev || prev.exam !== examPct;
      session.shown = { fills, exam: examPct };

      /* ---------- Parts ---------- */
      const restPills = (big) => `<span class="${big ? 'zt-pills' : 'rest-slots'}" aria-hidden="true">${[0, 1].map(i => `<i class="${i < L.restDays ? 'on' : ''}"></i>`).join('')}</span>`;
      const P = {};

      P.top = `<div class="zt-top" data-part="top">
          <h1 class="sr-only">${greeting()}, ${esc(L.first)}</h1>
          <span class="zt-date">${TODAY}</span>
          <button class="streak-pill" type="button" data-streak aria-label="Streak ${L.streak} days, ${L.restDays} of 2 rest days. Open streak details.">${L.streak}${Z.bolt(L.todayDone)}${restPills(false)}</button>
        </div>`;

      /* The done state is carried by the streak card and the deck's "Done for today.", so the greeting stays one line */
      P.hello = `<header class="zt-hello" data-part="hello"><h1 class="t-h1">${greeting()}, ${esc(L.first)}</h1></header>`;

      P.search = `<div class="zt-search" data-part="search" role="search">
          <div class="zt-pill">${Z.icon('search', 'sm')}
            <input type="search" id="zt-q" placeholder="Search topics, formulas, lessons" aria-label="Search topics, formulas, lessons" autocomplete="off" spellcheck="false"
              role="combobox" aria-expanded="false" aria-controls="zt-results" aria-autocomplete="list"></div>
          <ul class="zt-results" id="zt-results" role="listbox" aria-label="Results" hidden></ul>
        </div>`;

      P.streak = `<section class="card zt-streak" data-part="streak" aria-label="Streak and weekly goal">
          <button class="zt-streak-top" type="button" data-streak aria-label="Streak ${L.streak} days, ${L.restDays} of 2 rest days held. Open streak details.">
            <span class="t-stat">${L.streak}</span>${Z.bolt(L.todayDone, 'xl')}
            <span class="zt-streak-l"><span class="t-h2">day streak</span>
              <span class="t-caption muted">${L.todayDone ? `Today counts. Tomorrow makes it ${L.streak + 1}.` : 'One lesson or three problems keeps it going.'}</span></span>
            <span class="zt-rest">${restPills(true)}<span class="t-caption muted">${L.restDays} of 2 rest days</span></span>
          </button>
          ${Z.weekStrip()}
          <div class="zt-goal">
            <div class="zt-goal-head"><span class="t-overline muted">Weekly goal</span><span class="t-label tnum"><b>${fmtH(doneH)}</b> of ${fmtH(goal)} h</span></div>
            <div class="zt-hbar ${goalGrow ? 'grow' : ''}" role="img" aria-label="${fmtH(doneH)} of ${fmtH(goal)} hours this week. ${blocks.map(b => `${b.name} ${fmtH(b.done)} of ${fmtH(b.goal)}`).join(', ')}.">
              ${blocks.map((b, i) => `<span class="zt-seg" style="--g:${b.goal};--c:var(${b.slot})"><i style="width:${fills[i]}%;--from:${growFrom(i)}"></i></span>`).join('')}
            </div>
            <ul class="zt-keys" aria-hidden="true">${blocks.map(b => `<li style="--c:var(${b.slot})"><i class="zt-sw"></i><span class="t-label tnum">${fmtH(b.done)} of ${fmtH(b.goal)} h</span><span class="t-caption secondary">${b.name}</span></li>`).join('')}</ul>
          </div>
        </section>`;

      const row = (rank, me, nb) => `<li class="${me ? 'me' : ''}" ${me ? 'aria-current="true"' : ''}>
          <span class="zt-rk tnum ${rank <= lg.promote ? 'up' : ''}">${rank}</span>
          ${me ? `<span class="avatar" aria-hidden="true">${esc(L.initial)}</span>` : `<span class="avatar" style="background:${nb.bg}" aria-hidden="true">${esc(nb.initial)}</span>`}
          <span class="zt-nm">${me ? `${esc(L.first)} ${LAST_INITIAL}` : esc(nb.name)}${me ? '<span class="sr-only"> (you)</span>' : ''}</span>
          <span class="zt-mp tnum">${me ? NEIGHBOURS.me : nb.mp} MP</span></li>`;
      const zone = (after) => after === lg.promote ? '<li class="zt-zone" aria-hidden="true"><span>Promotion zone</span></li>' : '';
      P.league = lg.optedIn ? `<section class="card zt-league" data-part="league" aria-label="${esc(lg.tier)} league">
          <div class="zt-league-head">
            <span class="zt-badge" aria-hidden="true">${Z.tex(GREEK[lg.tier] || '\\gamma')}</span>
            <span class="zt-league-t"><span class="t-overline">${esc(lg.tier)} league</span>
              <span class="t-caption secondary">Top ${lg.promote} advance · ${plural(lg.daysLeft, 'day', 'days')} left</span></span>
            <button class="icon-btn zt-expand" type="button" data-go="you" aria-label="Open the full league board">${Z.icon('chevronR')}</button>
          </div>
          <ol class="zt-board" aria-label="Standings around you">
            ${row(lg.rank - 1, false, NEIGHBOURS.above)}${zone(lg.rank - 1)}
            ${row(lg.rank, true)}${zone(lg.rank)}
            ${row(lg.rank + 1, false, NEIGHBOURS.below)}${zone(lg.rank + 1)}
          </ol>
        </section>` : '';

      const dueRow = (icon, title, meta, go) => `<li><button class="zt-row" type="button" data-go="${go}">
          <span class="zt-ico">${Z.icon(icon, 'sm')}</span>
          <span class="zt-row-t"><span class="t-label">${title}</span><span class="t-caption muted">${meta}</span></span>
          ${Z.icon('chevronR', 'sm zt-chev')}</button></li>`;
      P.due = `<section class="card zt-due" data-part="due" aria-labelledby="zt-due-h">
          <h2 class="t-h2" id="zt-due-h">Due</h2>
          <ul>
            ${L.due.redo ? dueRow('review', plural(L.due.redo, 'redo problem', 'redo problems'), `About ${L.due.redoMinutes} minutes`, 'review') : dueRow('check', 'Redo queue clear', 'Nothing due today', 'review')}
            ${dueRow('clipboard', esc(L.due.homework.name), `Due ${esc(L.due.homework.due)}`, 'review')}
            ${dueRow('star', 'Weekly probability problems', `${L.due.weeklyProbs} of 3 left this week`, 'review')}
          </ul>
        </section>`;

      P.warm = `<section class="card zt-warm" data-part="warm" data-track="speed" aria-labelledby="zt-warm-h">
          <div class="zt-warm-head"><span class="t-overline zt-deep">Daily warm-up</span><h2 class="t-h2" id="zt-warm-h">Mental arithmetic</h2></div>
          <div class="zt-warm-body">
            <div class="zt-warm-score"><span class="t-stat">${L.mental.last}</span><span class="t-caption muted">Last score</span></div>
            <div class="zt-spark" data-spark></div>
          </div>
          <p class="t-caption secondary zt-warm-note">${session.rounds >= ROUNDS_A_DAY ? `All ${ROUNDS_A_DAY} rounds done. That is your 10 minutes today.`
            : session.rounds ? `${session.rounds} of ${ROUNDS_A_DAY} rounds done today.` : 'Five 2-minute rounds make your 10 minutes a day.'}</p>
          <button class="btn secondary block" type="button" data-go="warmup">${Z.icon('timer', 'sm')}Start 2-minute drill</button>
        </section>`;

      P.jump = `<section class="zt-jump" data-part="jump" data-track="${C.track}" aria-labelledby="zt-jump-h">
          <h2 class="t-h1" id="zt-jump-h">Jump back in</h2>
          <div class="zt-deck"><div class="zt-deck-card" data-deck></div></div>
          <div class="zt-thumbs" role="group" aria-label="Levels">
            ${C.levels.map((lv, i) => `<button class="zt-thumb" type="button" data-level="${i}" aria-pressed="false" aria-label="Level ${lv.n}, ${esc(lv.name)}">
              <span class="zt-thumb-art">${ZQArt(art(lv.n)[0])}</span><span class="t-caption">Level ${lv.n}</span>
              <span class="zt-tick" aria-hidden="true">${Z.icon('check')}</span></button>`).join('')}
          </div>
        </section>`;

      P.hero = `<section class="zt-hero" data-part="hero" data-track="${C.track}" aria-label="${esc(C.name)}, levels">
          <h2 class="t-course-title">${esc(C.name)}</h2>
          <div class="zt-car" data-car>
            ${C.levels.map(lv => `<div class="zt-slide" role="group" aria-roledescription="slide" aria-label="Level ${lv.n} of ${C.levels.length}">
              <span class="t-overline zt-deep">Level ${lv.n}</span><span class="t-label secondary">${esc(lv.name)}</span>
              <span class="zt-slide-art">${ZQArt(art(lv.n)[0], { label: art(lv.n)[1] })}</span></div>`).join('')}
          </div>
          <div class="zt-dots" role="group" aria-label="Choose a level">
            ${C.levels.map((lv, i) => `<button type="button" data-dot="${i}" aria-label="Level ${lv.n}" aria-pressed="false"><i></i></button>`).join('')}
          </div>
        </section>`;

      P.resume = `<section class="card zt-resume" data-part="resume" data-track="${C.track}" aria-label="Next lesson" data-resume></section>`;

      const C_ = 2 * Math.PI * 26;
      P.exam = `<section class="card zt-exam" data-part="exam" data-track="${D.topic(L.nextExam.topic)?.track || 'maths'}" aria-labelledby="zt-exam-h">
          <div class="zt-ring ${ringGrow ? 'grow' : ''}" role="img" aria-label="Readiness ${examPct}%">
            <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="26" class="zt-ring-track"/>
              <circle cx="32" cy="32" r="26" class="zt-ring-fill" stroke-dasharray="${(C_ * examPct / 100).toFixed(2)} ${C_.toFixed(2)}" transform="rotate(-90 32 32)"/></svg>
            <span class="zt-ring-n tnum" aria-hidden="true">${examPct}%</span>
          </div>
          <div class="zt-exam-t">
            <span class="t-overline muted">${Z.icon('shield', 'xs')} Next topic exam</span>
            <h2 class="t-h2" id="zt-exam-h">${esc(L.nextExam.name)}</h2>
            <span class="t-caption secondary">${examPct}% ready, from your mastery map. Timed, with no hints and no retries.</span>
          </div>
          <button class="btn secondary zt-sit" type="button" data-go="exam">Sit now</button>
        </section>`;

      root.innerHTML = `<div class="zt"><div class="zt-col zt-left"></div><div class="zt-col zt-right"></div><div hidden data-hold></div></div>`;
      const left = root.querySelector('.zt-left'), right = root.querySelector('.zt-right'), hold = root.querySelector('[data-hold]');
      const parts = {};
      Object.entries(P).forEach(([k, html]) => { if (html) { parts[k] = Z.h(html); hold.append(parts[k]); } });

      /* ---------- Arrange for the current width ---------- */
      const MQ_M = matchMedia('(max-width: 767px)'), MQ_LG = matchMedia('(min-width: 1024px)');
      const mode = () => (MQ_M.matches ? 'm' : MQ_LG.matches ? 'lg' : 'md');
      const ORDER = {
        m: [['top', 'hero', 'resume', 'warm', 'due', 'exam', 'search'], []],
        md: [['hello', 'search', 'jump', 'streak', 'league', 'due', 'warm', 'exam'], []],
        lg: [['hello', 'search', 'streak', 'league', 'due', 'warm'], ['jump', 'exam']],
      };
      let laid = '', arrangeRaf = 0;
      const arrange = () => {
        if (laid === mode()) return;
        laid = mode();
        const [a, b] = ORDER[laid], used = new Set([...a, ...b]);
        a.forEach(k => parts[k] && left.append(parts[k]));
        b.forEach(k => parts[k] && right.append(parts[k]));
        Object.keys(parts).forEach(k => { if (!used.has(k)) hold.append(parts[k]); });
        root.querySelector('.zt').dataset.mode = laid;
        closeResults();
        /* The hero has just entered the page: show the selected level at once, after layout */
        if (laid === 'm') { cancelAnimationFrame(arrangeRaf); arrangeRaf = requestAnimationFrame(() => centreOn(sel, false)); }
      };
      offs.push(() => cancelAnimationFrame(arrangeRaf));

      /* ---------- Level views: desktop deck and thumbnails, mobile carousel and resume card ---------- */
      const deck = parts.jump.querySelector('[data-deck]');
      const resume = parts.resume;
      const actionBtn = (info) => info.isCurrent
        ? `<button class="btn track block" type="button" data-go="lesson">Continue course</button>`
        : `<button class="btn track block" type="button" data-go="course">${info.done ? 'Continue' : 'Start'} level ${info.lv.n}</button>`;
      const lessonRow = (info) => `<div class="zt-lrow">
          <span class="zt-puck" aria-hidden="true">${info.no}</span>
          <span class="zt-lrow-t"><span class="t-h2">${esc(info.next.name)}</span>
            <span class="t-caption muted">Lesson ${info.no} · ${info.next.screens} screens · about ${mins(info.next.screens)} min</span></span>
        </div>`;
      const doneLine = (info) => (info.isCurrent && L.todayDone ? `<p class="zt-donetoday t-label">${Z.icon('check', 'xs')}Done for today.</p>` : '');
      const renderDeck = (fade) => {
        const info = levelInfo(sel), [kind, label] = art(info.lv.n);
        deck.innerHTML = `<div class="zt-deck-in ${fade ? 'zt-fade' : ''}">
            <div class="zt-deck-head"><h3 class="t-h1">${esc(C.name)}</h3>
              <span class="t-overline zt-deep">Level ${info.lv.n}</span>
              <span class="t-caption secondary">${esc(info.lv.name)} · ${info.done} of ${info.total} done</span></div>
            <div class="zt-deck-art">${ZQArt(kind, { label })}</div>
            ${doneLine(info)}${lessonRow(info)}${actionBtn(info)}</div>`;
      };
      const renderResume = () => {
        const info = levelInfo(sel);
        resume.innerHTML = `${doneLine(info)}${lessonRow(info)}${actionBtn(info)}`;
      };
      const thumbs = Array.from(parts.jump.querySelectorAll('[data-level]'));
      const dots = Array.from(parts.hero.querySelectorAll('[data-dot]'));
      const car = parts.hero.querySelector('[data-car]');
      /* Scrolls the code starts itself (a dot tap, entering the page) set `target`. Scroll positions are ignored
         until the carousel reaches that slide, so the resume card and dots never flash through the levels it passes. */
      let target = null;
      const slideLeft = (i) => { const s = car.children[i]; return s.offsetLeft - (car.clientWidth - s.offsetWidth) / 2; };
      const nearest = () => {
        const mid = car.scrollLeft + car.clientWidth / 2;
        let best = 0, bd = Infinity;
        Array.from(car.children).forEach((s, j) => { const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = j; } });
        return best;
      };
      const centreOn = (i, smooth) => {
        if (!car.isConnected || !car.clientWidth) return;
        const left = Math.max(0, Math.min(car.scrollWidth - car.clientWidth, slideLeft(i)));
        if (Math.abs(car.scrollLeft - left) < 1) { target = null; return; }
        target = i;
        car.scrollTo({ left, behavior: smooth && !Z.reducedMotion() ? 'smooth' : 'auto' });
      };
      const setLevel = (i, { fade = false, scroll = false } = {}) => {
        const changed = i !== sel; sel = i;
        thumbs.forEach((t, j) => t.setAttribute('aria-pressed', String(j === sel)));
        dots.forEach((d, j) => d.setAttribute('aria-pressed', String(j === sel)));
        renderDeck(fade && changed); renderResume();
        if (scroll) centreOn(i, true);
      };
      thumbs.forEach((t, i) => t.addEventListener('click', () => setLevel(i, { fade: true })));
      dots.forEach((d, i) => d.addEventListener('click', () => setLevel(i, { scroll: true })));
      let scrollRaf = 0;
      car.addEventListener('scroll', () => {
        cancelAnimationFrame(scrollRaf);
        scrollRaf = requestAnimationFrame(() => {
          const best = nearest();
          if (target !== null) { if (best === target) target = null; return; }
          if (best !== sel) setLevel(best);
        });
      }, { passive: true });
      /* An interrupted programmatic scroll cannot leave the guard set; settle on wherever the carousel stopped */
      car.addEventListener('scrollend', () => { target = null; const best = nearest(); if (best !== sel) setLevel(best); });
      offs.push(() => cancelAnimationFrame(scrollRaf));

      /* ---------- Search ---------- */
      const sWrap = parts.search, q = sWrap.querySelector('#zt-q'), list = sWrap.querySelector('#zt-results');
      const courses = D.allCourses(), courseName = (id) => (courses.find(c => c.id === id) || {}).name || '';
      /* own: the learner's current course, its topic, lessons and formulas. They win ties. */
      const index = [];
      D.stages.forEach(s => s.topics.forEach(t => {
        index.push({ kind: 'Topic', icon: 'grid', title: `${t.id} ${t.name}`, name: t.name, sub: `Stage ${s.id} · ${s.name}`, go: 'learn', own: t.courses.some(c => c.id === C.id) });
        t.courses.forEach(c => index.push({ kind: 'Course', icon: 'book', title: c.name, sub: `${t.id} ${t.name}`, go: c.id === C.id ? 'course' : 'learn', own: c.id === C.id }));
      }));
      /* A lesson is found by its own name, not by its course's name, or "conditional" would list every lesson */
      C.levels.forEach(lv => lv.items.filter(it => it.kind === 'lesson').forEach(it =>
        index.push({ kind: 'Lesson', icon: 'play', title: it.name, sub: `${C.name} · Level ${lv.n}`, subHidden: true, go: it.status === 'current' ? 'lesson' : 'course', own: true })));
      FORMULAS.forEach(f => index.push({ kind: 'Formula', icon: 'sparkle', title: f.name, f, keys: f.keys, sub: courseName(f.course), own: f.course === C.id }));
      index.forEach((e, i) => {
        const hay = norm([e.title, e.subHidden ? '' : e.sub, e.keys || '', e.kind].join(' ')).replace(/\s+/g, ' ');
        e.i = i; e.t = norm(e.name || e.title);
        e.hay = ' ' + hay;
        e.toks = hay.split(/[^a-z0-9]+/).filter(Boolean);
      });
      /* Words match at word starts only: "put" finds put-call parity, not computer. "1.5" still finds the topic. */
      const hasWord = (e, w) => e.toks.some(t => t.startsWith(w)) || e.hay.includes(' ' + w);
      const rank = (e, v) => (e.t.startsWith(v) ? 0 : (' ' + e.t).includes(' ' + v) ? 1 : 2) + (e.own ? 0 : 1.5);
      let hits = [], active = -1;
      const closeResults = () => { list.hidden = true; q.setAttribute('aria-expanded', 'false'); q.removeAttribute('aria-activedescendant'); active = -1; hits = []; };
      const search = () => {
        const v = norm(q.value.trim()).replace(/\s+/g, ' ');
        if (!v) { closeResults(); return; }
        const words = v.split(' ');
        hits = index.filter(e => words.every(w => hasWord(e, w)))
          .map(e => ({ e, r: rank(e, v) }))
          .sort((a, b) => a.r - b.r || a.e.i - b.e.i).slice(0, 7).map(x => x.e);
        active = -1;
        list.classList.toggle('up', mode() === 'm');
        list.innerHTML = hits.length ? hits.map((e, i) => `<li role="option" id="zt-opt-${i}" aria-selected="false" data-i="${i}">
            <span class="zt-ico">${Z.icon(e.icon, 'sm')}</span>
            <span class="zt-opt-t"><span class="t-label">${esc(e.title)}</span>
              ${e.f ? `<span class="zt-opt-tex">${Z.tex(e.f.tex.replace(/\\dfrac/g, '\\tfrac'))}</span>` : `<span class="t-caption muted">${esc(e.sub)}</span>`}</span>
            <span class="t-caption muted zt-kind">${e.kind}</span></li>`).join('')
          : `<li class="zt-none t-body secondary" role="presentation">Nothing matches. Try a topic, such as Bayes or integrals.</li>`;
        list.hidden = false; q.setAttribute('aria-expanded', 'true');
      };
      const highlight = (i) => {
        active = i;
        Array.from(list.querySelectorAll('[role="option"]')).forEach((o, j) => o.setAttribute('aria-selected', String(j === i)));
        if (i >= 0) { q.setAttribute('aria-activedescendant', 'zt-opt-' + i); list.querySelector('#zt-opt-' + i).scrollIntoView({ block: 'nearest' }); }
        else q.removeAttribute('aria-activedescendant');
      };
      const choose = (e) => {
        closeResults();
        if (!e.f) { Z.go(e.go); return; }
        const f = e.f, inCourse = f.course === C.id;
        const close = Z.sheet(`<div class="zt-fsheet">
            <span class="t-overline muted">Formula</span>
            <h2 class="t-sheet-title">${esc(f.name)}</h2>
            <div class="zt-fsheet-tex">${Z.tex(f.tex, true)}</div>
            <p class="t-body">${Z.md(f.what)}</p>
            <p class="t-caption secondary">Taught in ${esc(courseName(f.course))}${f.level ? `, Level ${f.level}` : ''}.</p>
            <button class="btn block" type="button" data-fgo="${inCourse ? 'course' : 'learn'}">${inCourse ? 'Open the course map' : 'Find it in Learn'}</button>
          </div>`, { label: f.name });
        document.querySelector('[data-fgo]')?.addEventListener('click', (ev) => { const to = ev.currentTarget.dataset.fgo; close(); Z.go(to); });
      };
      listen(q, 'input', search);
      listen(q, 'focus', () => {
        if (mode() === 'm') sWrap.scrollIntoView({ block: 'center', behavior: Z.reducedMotion() ? 'auto' : 'smooth' }); // clear of the tab bar, room above for results
        if (q.value.trim()) search();
      });
      listen(q, 'keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          if (list.hidden) { if (!q.value.trim()) return; search(); }
          const n = hits.length;
          if (!n) return;
          e.preventDefault();
          highlight(e.key === 'ArrowDown' ? (active + 1) % n : active <= 0 ? n - 1 : active - 1);
        }
        else if (e.key === 'Enter' && !list.hidden && hits.length) { e.preventDefault(); choose(hits[active < 0 ? 0 : active]); }
        else if (e.key === 'Escape') { if (!list.hidden) { e.stopPropagation(); closeResults(); } else q.value = ''; }
      });
      listen(list, 'pointerdown', (e) => e.preventDefault()); // keep focus in the input
      listen(list, 'click', (e) => { const o = e.target.closest('[data-i]'); if (o) choose(hits[+o.dataset.i]); });
      listen(list, 'pointermove', (e) => { const o = e.target.closest('[data-i]'); if (o && +o.dataset.i !== active) highlight(+o.dataset.i); });
      listen(document, 'pointerdown', (e) => { if (!sWrap.contains(e.target)) closeResults(); });

      /* ---------- Wiring ---------- */
      listen(root, 'click', (e) => {
        if (e.target.closest('[data-streak]')) { Z.streakSheet(); return; }
        const g = e.target.closest('[data-go]');
        if (g) Z.go(g.dataset.go);
      });
      sparkline(parts.warm.querySelector('[data-spark]'), trend);
      listen(MQ_M, 'change', arrange); listen(MQ_LG, 'change', arrange);
      arrange();
      setLevel(sel);

      return () => offs.forEach(f => f());
    },
  });

  /* =====================================================================================
     MENTAL ARITHMETIC WARM-UP
     Classic default settings: addition 2 to 100 + 2 to 100; subtraction is addition in reverse;
     multiplication 2 to 12 by 2 to 100; division is multiplication in reverse. 120 seconds.
     ===================================================================================== */
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const makeProblem = (prev) => {
    for (;;) {
      const op = rnd(0, 3);
      let p;
      if (op === 0) { const a = rnd(2, 100), b = rnd(2, 100); p = { tex: `${a} + ${b}`, ans: a + b }; }
      else if (op === 1) { const a = rnd(2, 100), b = rnd(2, 100); p = { tex: `${a + b} - ${a}`, ans: b }; }
      else if (op === 2) { const a = rnd(2, 12), b = rnd(2, 100); p = { tex: `${a} \\times ${b}`, ans: a * b }; }
      else { const a = rnd(2, 12), b = rnd(2, 100); p = { tex: `${a * b} \\div ${a}`, ans: b }; }
      if (!prev || p.tex !== prev.tex) return p;
    }
  };
  const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* Column chart: the last 10 rounds in a lighter step, this round in the track colour,
     the Stage 3 mark (50) as a dashed target line (spec 2.6: targets 1.5px dashed ink).
     Both text labels keep clear of the line and of the columns, and carry a surface halo as a last resort. */
  const columns = (wrap, values, curLabel) => {
    const n = values.length, TARGET = 50;
    const draw = () => {
      const W = Math.max(240, Math.floor(wrap.clientWidth)), H = 200, PL = 30, PR = 4, PT = 22, PB = 26;
      const iw = W - PL - PR, ih = H - PT - PB;
      const top = Math.max(60, Math.ceil((Math.max(...values) + 8) / 10) * 10);
      const y = (v) => PT + ih - v / top * ih;
      const band = iw / n, bw = Math.min(24, band * 0.62);
      const bx = (i) => PL + band * i + (band - bw) / 2;
      const ticks = []; for (let t = 0; t <= top; t += 25) ticks.push(t);
      const bar = (i) => {
        const v = values[i], h = Math.max(0, y(0) - y(v)), r = Math.min(4, h, bw / 2), x0 = bx(i), x1 = x0 + bw, yt = y(v), yb = y(0);
        if (h <= 0) return `<path class="zw-col ${i === n - 1 ? 'now' : ''}" d="M${x0},${yb - 1}H${x1}V${yb}H${x0}Z"/>`;
        return `<path class="zw-col ${i === n - 1 ? 'now' : ''}" d="M${x0},${yb}V${yt + r}Q${x0},${yt} ${x0 + r},${yt}H${x1 - r}Q${x1},${yt} ${x1},${yt + r}V${yb}Z"/>`;
      };
      const last = n - 1, cx = bx(last) + bw / 2, tY = y(TARGET), vTop = y(values[last]);
      /* This round's value sits 6px above its column. Its digits are about 10px tall, centred 5px above the baseline:
         if that centre comes within 12px of the target line, lift the label clear of both the line and the column. */
      const vY = Math.abs(vTop - 6 - 5 - tY) < 12 ? Math.min(vTop, tY) - 7 : vTop - 6;
      wrap.querySelector('svg')?.remove();
      wrap.insertAdjacentHTML('afterbegin', `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" tabindex="0" role="img"
          aria-label="Scores for your last ${n - 1} rounds, oldest first: ${values.slice(0, -1).join(', ')}. ${curLabel}: ${values[last]}. Use the arrow keys to read each one.">
          <rect class="zw-hot" x="0" y="${PT}" width="${band}" height="${ih}" visibility="hidden"/>
          ${ticks.filter(t => t !== TARGET).map(t => `<line class="zw-grid" x1="${PL}" x2="${W - PR}" y1="${y(t)}" y2="${y(t)}"/>`).join('')}
          ${ticks.map(t => `<text class="zw-tick" x="${PL - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join('')}
          ${values.map((_, i) => bar(i)).join('')}
          <line class="zw-target" x1="${PL}" x2="${W - PR}" y1="${tY}" y2="${tY}"/>
          <text class="zw-tlabel" x="${PL + 6}" y="${tY - 6}">Stage 3 mark</text>
          <text class="zw-vlabel" x="${cx}" y="${vY}" text-anchor="middle">${values[last]}</text>
          <text class="zw-xlabel" x="${bx(0)}" y="${H - 6}">Oldest</text>
          <text class="zw-xlabel strong" x="${Math.min(cx, W - PR - 14)}" y="${H - 6}" text-anchor="middle">${curLabel}</text>
        </svg>`);
      const svg = wrap.querySelector('svg'), tip = wrap.querySelector('.zw-tip'), hot = svg.querySelector('.zw-hot');
      /* Place "Stage 3 mark" over the first run of columns that all stay below the line, never over this round */
      const tl = svg.querySelector('.zw-tlabel');
      let lw = 84; try { lw = tl.getComputedTextLength() || lw; } catch { /* not laid out: keep the estimate */ }
      const clearAt = (x0) => values.every((v, j) => { const a = bx(j) - 3, b = bx(j) + bw + 3; return b < x0 || a > x0 + lw || (j !== last && v < TARGET); });
      const starts = [PL + 6, ...values.map((_, j) => bx(j) + bw + 4)].filter(x => x + lw <= cx - 14);
      const spot = starts.find(clearAt);
      if (spot !== undefined) tl.setAttribute('x', spot.toFixed(1));
      hoverable(svg, n, (px, w) => Math.max(0, Math.min(n - 1, Math.floor((px * W / w - PL) / band))), (i) => {
        hot.setAttribute('x', PL + band * i); hot.setAttribute('visibility', 'visible');
        const back = last - i;
        showTip(wrap, tip, bx(i) + bw / 2, y(values[i]), String(values[i]), back === 0 ? curLabel : plural(back, 'round', 'rounds') + ' ago');
      }, () => { hot.setAttribute('visibility', 'hidden'); tip.hidden = true; });
    };
    draw();
    let w0 = wrap.clientWidth;
    const ro = new ResizeObserver(() => { if (Math.abs(wrap.clientWidth - w0) > 2) { w0 = wrap.clientWidth; draw(); } });
    ro.observe(wrap);
    return () => ro.disconnect();
  };

  /* Layout follows the lesson player (spec 2.11): a 64px top bar; from 768px a frame of the viewport minus 32px,
     radius 24, 2px border, with the 366px button group bottom-centre; under 768px no frame and a 286px button
     right-aligned with a 16px margin. The clock is a timer pill, as in the topic exam, not a progress bar. */
  ZQ.screen({
    id: 'warmup', title: 'Mental arithmetic warm-up', group: 'Practice', shell: false,
    render(root, Z) {
      const D = Z.data(), L = D.learner;
      const offs = [];
      const listen = (target, ev, fn, opt) => { target.addEventListener(ev, fn, opt); offs.push(() => target.removeEventListener(ev, fn, opt)); };
      let state = 'ready', raf = 0, countRaf = 0, endAt = 0, remaining = 0, total = 120, demo = false, score = 0, prob = null, lastShown = -1, flashT = 0;

      root.innerHTML = `<div class="zw" data-track="speed">
          <header class="zw-top">
            <button class="icon-btn zw-x" type="button" aria-label="Quit the warm-up">${Z.icon('close')}</button>
            <p class="zw-ttl t-label">Mental arithmetic warm-up</p>
            <span class="zw-timer" role="timer"><span class="sr-only">Time left </span>${Z.icon('timer', 'sm')}<span data-time>2:00</span></span>
          </header>
          <div class="zw-frame">
            <main class="zw-scroll" id="zw-main"><div class="zw-col" data-col></div></main>
            <footer class="zw-foot" data-foot hidden></footer>
          </div>
        </div>`;
      const col = root.querySelector('[data-col]'), scroller = root.querySelector('.zw-scroll'), foot = root.querySelector('[data-foot]');
      const timerEl = root.querySelector('.zw-timer'), timeEl = root.querySelector('[data-time]');
      const setFoot = (html) => { foot.innerHTML = html; foot.hidden = !html; };

      /* The pill turns amber for the last 10 seconds of a full round */
      const setClock = (ms) => {
        const s = Math.max(0, Math.ceil(ms / 1000));
        timerEl.classList.toggle('is-low', state === 'run' && total > 10 && s <= 10);
        if (s !== lastShown) { lastShown = s; timeEl.textContent = clock(s); }
      };
      const resetClock = (secs) => { total = secs; lastShown = -1; setClock(secs * 1000); };

      /* Count-up from the first frame's own timestamp, so the first frame always reads 0 */
      const countTo = (el, to, ms) => {
        cancelAnimationFrame(countRaf);
        if (Z.reducedMotion()) { el.textContent = String(to); return; }
        let t0 = null;
        const step = (now) => {
          if (t0 === null) t0 = now;
          const p = Math.max(0, Math.min(1, (now - t0) / ms));
          const e = p < 0.8 ? p / 0.8 * 0.9 : 0.9 + (1 - Math.pow(1 - (p - 0.8) / 0.2, 3)) * 0.1; // as core.js countUp
          el.textContent = String(Math.round(to * e));
          if (p < 1) countRaf = requestAnimationFrame(step);
        };
        countRaf = requestAnimationFrame(step);
      };

      /* ---------- Ready ---------- */
      const ready = () => {
        state = 'ready'; resetClock(120);
        const t = L.mental.trend, best = Math.max(...t);
        col.innerHTML = `<div class="zw-ready enter">
            <div class="zw-art">${ZQArt('timer', { label: 'A stopwatch' })}</div>
            <div class="zw-copy">
              <span class="t-overline zt-deep">Daily warm-up</span>
              <h1 class="t-lesson-title">Mental arithmetic</h1>
              <p class="t-prose">You have 120 seconds. Type each answer. It moves on by itself when it is right, so there is no Enter.</p>
            </div>
            <ul class="zw-kinds">
              <li><span class="zw-ex">${Z.tex('47 + 38')}</span><span class="t-body">Addition, 2 to 100 each side</span></li>
              <li><span class="zw-ex">${Z.tex('85 - 47')}</span><span class="t-body">Subtraction, addition in reverse</span></li>
              <li><span class="zw-ex">${Z.tex('7 \\times 64')}</span><span class="t-body">Multiplication, 2 to 12 by 2 to 100</span></li>
              <li><span class="zw-ex">${Z.tex('448 \\div 7')}</span><span class="t-body">Division, multiplication in reverse</span></li>
            </ul>
            <p class="t-caption secondary zw-last">Last score ${L.mental.last}. Best of your last ${t.length}: ${best}. Stage 3 asks for 50.</p>
          </div>`;
        setFoot(`<button class="link-btn zw-demo" type="button" data-demo>Quick demo (10 s)</button>
            <div class="zw-actions"><button class="btn zw-primary" type="button" data-start>Start</button></div>`);
        scroller.scrollTop = 0;
        foot.querySelector('[data-start]').addEventListener('click', () => start(120, false));
        foot.querySelector('[data-demo]').addEventListener('click', () => start(10, true));
        foot.querySelector('[data-start]').focus({ preventScroll: true });
      };

      /* ---------- Drill ---------- */
      let input, probEl, scoreEl, field;
      const next = () => { prob = makeProblem(prob); probEl.innerHTML = Z.tex(prob.tex); input.value = ''; };
      const tick = () => {
        if (state !== 'run') return;
        const left = endAt - Date.now();
        setClock(left);
        if (left <= 0) { finish(); return; }
        raf = requestAnimationFrame(tick);
      };
      const start = (secs, isDemo) => {
        demo = isDemo; score = 0; prob = null; state = 'starting'; resetClock(secs);
        col.innerHTML = `<div class="zw-drill">
            <div class="zw-score"><span class="t-overline muted">Score</span><span class="zw-score-n" data-score>0</span></div>
            <div class="zw-prob" data-prob aria-live="polite"></div>
            <label class="field zw-field"><span class="sr-only">Answer</span>
              <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="next" data-answer></label>
            <p class="t-caption muted">${demo ? 'Demo round, 10 seconds. It is not saved.' : 'Right answers move on by themselves.'}</p>
          </div>`;
        setFoot('');
        scroller.scrollTop = 0;
        input = col.querySelector('[data-answer]'); probEl = col.querySelector('[data-prob]'); scoreEl = col.querySelector('[data-score]'); field = col.querySelector('.zw-field');
        input.addEventListener('input', onInput);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
        next();
        state = 'run'; endAt = Date.now() + secs * 1000;
        input.focus({ preventScroll: true });
        raf = requestAnimationFrame(tick);
      };
      const onInput = () => {
        if (state !== 'run') return;
        const v = input.value.replace(/\D/g, '');
        if (v !== input.value) input.value = v;
        if (v === '' || Number(v) !== prob.ans) return;
        score += 1; scoreEl.textContent = String(score);
        scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump');
        field.classList.add('correct'); clearTimeout(flashT); flashT = setTimeout(() => field && field.classList.remove('correct'), 180);
        Z.sound('tap');
        next();
      };

      /* ---------- Pause and quit ---------- */
      const pause = () => { if (state !== 'run') return; state = 'paused'; remaining = endAt - Date.now(); cancelAnimationFrame(raf); };
      const resume = () => { if (state !== 'paused') return; state = 'run'; endAt = Date.now() + remaining; raf = requestAnimationFrame(tick); input && input.focus({ preventScroll: true }); };
      const quit = () => {
        if (state !== 'run') { Z.go('today'); return; }
        pause();
        let stopping = false;
        const close = Z.sheet(`<div class="zw-quit">
            <h2 class="t-sheet-title">Stop this round?</h2>
            <p class="t-body secondary">The clock is paused. A stopped round is not saved.</p>
            <div class="zw-quit-btns"><button class="btn secondary" type="button" data-stop>Stop</button><button class="btn" type="button" data-keep autofocus>Keep going</button></div>
          </div>`, { label: 'Stop this round?', onClose: () => { if (!stopping) resume(); } });
        const box = document.querySelector('.zw-quit');
        box.querySelector('[data-keep]').addEventListener('click', () => close());
        box.querySelector('[data-stop]').addEventListener('click', () => { stopping = true; close(); Z.go('today'); });
      };
      listen(root.querySelector('.zw-x'), 'click', quit);
      listen(document, 'keydown', (e) => { if (e.key === 'Escape' && state === 'run') { e.preventDefault(); quit(); } });

      /* ---------- End ---------- */
      let stopChart = null;
      const finish = () => {
        state = 'end'; cancelAnimationFrame(raf); setClock(0);
        const past = L.mental.trend.slice(-10), last = L.mental.last, best = Math.max(...past);
        const avg = past.reduce((s, v) => s + v, 0) / past.length;
        const diff = score - last;
        const isBest = !demo && score > best;
        const delta = demo
          ? 'That was the 10-second demo, so it is not saved. A full round runs for 120 seconds.'
          : diff > 0 ? `${plural(diff, 'more answer', 'more answers')} than your last round.`
          : diff === 0 ? 'Level with your last round.'
          : `${plural(-diff, 'fewer answer', 'fewer answers')} than your last round. Single rounds move around; the trend is what counts.`;
        const label = demo ? 'Demo' : 'Now';
        col.innerHTML = `<div class="zw-end">
            <h1 class="t-complete enter">Round complete</h1>
            <span class="t-overline muted enter">Score</span>
            <span class="zw-big tnum enter" data-big>0</span>
            <p class="t-body secondary zw-delta enter">${delta}</p>
            ${isBest ? `<span class="chip track zw-best">${Z.icon('star', 'xs')}Best of your last 10 rounds</span>` : ''}
            <section class="card zw-chartcard enter" aria-labelledby="zw-chart-h">
              <h2 class="t-h2" id="zw-chart-h">This round against your last 10</h2>
              <div class="zw-chart" data-chart><div class="zw-tip zt-tip" hidden></div></div>
              <p class="t-caption secondary">Last 10 rounds: average ${avg.toFixed(1)}, best ${best}. The dashed line is the Stage 3 mark of 50.</p>
              <table class="sr-only"><caption>Scores, oldest first</caption><thead><tr><th>Round</th><th>Score</th></tr></thead><tbody>
                ${past.map((v, i) => `<tr><td>${plural(past.length - i, 'round', 'rounds')} ago</td><td>${v}</td></tr>`).join('')}<tr><td>${label}</td><td>${score}</td></tr></tbody></table>
            </section>
          </div>`;
        setFoot(`<div class="zw-actions">
            <button class="btn secondary zw-sec" type="button" data-again>${demo ? 'Full round' : 'Go again'}</button>
            <button class="btn zw-primary" type="button" data-done>Done</button></div>`);
        scroller.scrollTop = 0;
        stopChart = columns(col.querySelector('[data-chart]'), [...past, score], label);
        foot.querySelector('[data-done]').addEventListener('click', () => Z.go('today'));
        foot.querySelector('[data-again]').addEventListener('click', () => { stopChart && stopChart(); stopChart = null; cancelAnimationFrame(countRaf); start(120, false); });
        foot.querySelector('[data-done]').focus({ preventScroll: true });
        countTo(col.querySelector('[data-big]'), score, 700);
        Z.sound('complete');
        if (!demo) {
          L.mental.trend = [...L.mental.trend.slice(1), score];
          L.mental.last = score;
          L.hoursThisWeek.mental = (L.hoursThisWeek.mental || 0) + total / 3600; // a full round adds its 2 minutes to the week
          session.rounds += 1;
        }
      };

      ready();
      return () => {
        state = 'gone'; cancelAnimationFrame(raf); cancelAnimationFrame(countRaf); clearTimeout(flashT);
        stopChart && stopChart(); offs.forEach(f => f());
      };
    },
  });
})();
