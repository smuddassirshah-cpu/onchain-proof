/* You: profile, league board, mastery map, streak calendar, exam history, drill record, settings.
   Spec: docs/design-research.md 7.5 (You), 6.1 and 6.2 (league board rules, rest days, goals, notifications),
   2.4 (league row fill, medal colours), 2.6 (single-hue sequential ramp, tooltips, table views), 4.9 (motion, sound, haptics).
   Prototype clock: Saturday 3 October 2026, as on Today and Review (Homework 4 due Thu 8 Oct, 2 league days left).
   Screen selectors carry .screen-you; sheets live in <body>, so their classes carry the yu-sh- prefix. */
(function () {
  'use strict';

  const D = window.ZQData, L = D.learner;
  const SURNAME = 'Shah', LAST_INITIAL = 'S.';
  const TODAY_LONG = 'Saturday 3 October';

  /* ---------- Preferences kept by this screen (theme, motion and sound live in core.js) ---------- */
  const PREF_KEY = 'you.prefs';
  const PREF_DEFAULT = { goal: L.weeklyGoalH || 15, reminder: true, reminderAt: '07:30', streakMode: 'daily', streakDays: 5,
    leagues: L.league.optedIn, noDemotion: false, breaks: [] };
  const prefs = Object.assign({}, PREF_DEFAULT, ZQ.store.get(PREF_KEY, {}));
  delete prefs.haptics; // haptics moved to the shared settings (Z.setSetting('haptics'))
  if (!['daily', 'weekly', 'off'].includes(prefs.streakMode)) prefs.streakMode = 'daily';
  if (!Array.isArray(prefs.breaks)) prefs.breaks = [];
  const savePrefs = () => ZQ.store.set(PREF_KEY, prefs);
  /* Weekly goal and league opt-in are read by Today too, so the in-memory learner follows the saved choice. */
  L.weeklyGoalH = prefs.goal;
  L.league.optedIn = prefs.leagues;

  /* ---------- Dates ---------- */
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY_MS = 864e5;
  const CAL0 = Date.UTC(2026, 6, 13); // Monday 13 July 2026: first column of the 12-week calendar
  const calDate = (i) => new Date(CAL0 + i * DAY_MS);
  const fmtDay = (d) => `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
  const fmtDate = (d) => `${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const isoDate = (d) => d.toISOString().slice(0, 10);

  /* ---------- Streak calendar: 84 days, Monday 13 July to Sunday 4 October ----------
     L studied (qualifying day), R rest day used, X missed (no rest day held, streak reset), T today, F to come.
     Built with the 6.2 rules (one rest day per 7 qualifying days, at most 2 held, applied automatically) and checked
     by simulation: current streak 11 (21 Sep to 2 Oct, rest day on 30 Sep), longest 23 (27 Jul to 19 Aug), 1 rest day held. */
  const CAL = 'LLLLLRLLLLLLXXLLLLLLLLLLLLRLLLLLLLLLLLRRXLLLLLLLLLLLLLRRXLLLLLLLLLLLRXLLLLLLLLLRLLTF';
  const MINS = [135, 90, 150, 60, 75, 0, 120, 75, 135, 60, 180, 105, 0, 0, 60, 75, 150, 150, 75, 60, 45, 180, 150, 60, 75, 105, 0, 120,
    60, 150, 60, 105, 60, 120, 60, 120, 150, 90, 0, 0, 0, 120, 75, 120, 180, 90, 75, 120, 120, 105, 135, 75, 180, 75, 0, 0, 0, 60, 105,
    165, 180, 90, 75, 165, 165, 135, 120, 105, 0, 0, 90, 105, 75, 120, 180, 90, 75, 165, 150, 0, 140, 145, 0, 0];
  const runs = (() => { // streak runs: [first index, last index, qualifying days]
    const out = []; let cur = null;
    for (let i = 0; i < CAL.length; i++) {
      const c = CAL[i];
      if (c === 'L') { if (!cur) cur = [i, i, 0]; cur[1] = i; cur[2]++; }
      else if (c === 'X') { if (cur) out.push(cur); cur = null; }
    }
    if (cur) out.push(cur);
    return out;
  })();
  const RUN_NOW = runs[runs.length - 1];
  const RUN_BEST = runs.reduce((a, b) => (b[2] > a[2] ? b : a));
  const PAST_DAYS = CAL.indexOf('T');
  const STUDIED = (CAL.match(/L/g) || []).length;
  const LESSONS_DONE = 186; // matches the shared streak sheet
  const BREAK_DAYS = 14; // planned break allowance per year (spec 6.2)
  const BREAK_MIN = '2026-10-04', BREAK_MAX = '2026-12-31'; // from tomorrow to the end of this year

  /* ---------- League: Gamma, 30 learners, mastery points this week ----------
     Rows 8 to 10 match Today's league card. Avatars use track lip steps (white initial at 4.7:1 or better in both themes). */
  const AV = ['--fin-lip', '--ml-lip', '--maths-lip', '--prob-lip', '--code-lip', '--speed-lip'];
  const BOARD = [
    ['Wei C.', 248, 2], ['Sofia R.', 231, 3], ['Kwame A.', 207, 0], ['Priya N.', 186, 4], ['Lucas M.', 163, 5],
    ['Hana T.', 142, 1], ['Mateo G.', 121, 3], ['Aisha K.', 104, 0], [null, 96, -1], ['Daniel O.', 91, 1],
    ['Ingrid L.', 87, 4], ['Yusuf D.', 80, 2], ['Chloé B.', 74, 5], ['Arjun P.', 69, 3], ['Olga V.', 63, 0],
    ['Tomás H.', 58, 1], ['Mei L.', 51, 4], ['Kofi B.', 47, 2], ['Elena F.', 42, 5], ['Ravi S.', 36, 3],
    ['Nadia H.', 33, 0], ['Jonas W.', 27, 1], ['Amara E.', 22, 4], ['Hiroshi Y.', 18, 2], ['Fatima Z.', 15, 5],
    ['Liam O.', 11, 3], ['Zara Q.', 8, 0], ['Pedro S.', 5, 1], ['Anya K.', 3, 4], ['Ben T.', 0, 2],
  ];
  const GREEK = { Alpha: '\\alpha', Beta: '\\beta', Gamma: '\\gamma', Delta: '\\delta', Epsilon: '\\epsilon', Zeta: '\\zeta', Theta: '\\theta', Lambda: '\\lambda', Sigma: '\\sigma', Omega: '\\omega' };

  /* ---------- Mastery map: six skills per topic, stages 0 and 1 ----------
     Mastery comes from first-try answers in quizzes, homework, exams and redos (spec 6.2).
     1.4 averages 62%, the readiness Today and Review quote for the linear algebra exam. */
  const MASTERY = {
    '0.1': [['Fractions', 94], ['Decimals', 91], ['Percentages', 96], ['Ratio', 88], ['Powers and roots', 85], ['Estimation', 79]],
    '0.2': [['Expressions', 90], ['Linear equations', 93], ['Inequalities', 84], ['Simultaneous equations', 86], ['Quadratics', 81], ['Functions and graphs', 77]],
    '0.3': [['Exponentials and logarithms', 82], ['Trigonometry', 74], ['Sequences and series', 79], ['Binomial expansion', 71], ['Vectors', 76], ['Permutations and combinations', 88]],
    '0.4': [['Touch typing', 97], ['Files and folders', 95], ['Installing software', 92], ['The terminal', 89], ['Code editor', 90], ['First scripts', 93]],
    '0.5': [['Times tables', 92], ['Addition', 84], ['Subtraction', 80], ['Multiplication', 63], ['Division', 58], ['Fractions to decimals', 71]],
    '1.1': [['Control flow', 92], ['Functions', 88], ['Collections', 85], ['NumPy', 74], ['pandas', 66], ['Plotting', 38]],
    '1.2': [['Git', 86], ['Branches and merges', 72], ['Command line', 80], ['GitHub', 78], ['SQL', 64], ['pytest', 41]],
    '1.3': [['Limits', 89], ['Derivatives', 91], ['Integrals', 54], ['Taylor series', 12], ['Partial derivatives', 0], ['Lagrange multipliers', 0]],
    '1.4': [['Vectors and matrices', 84], ['Elimination', 76], ['Rank and spaces', 63], ['Least squares', 58], ['Determinants', 71], ['Eigenvalues and SVD', 20]],
    '1.5': [['Counting', 81], ['Conditional probability', 34], ['Bayes’ rule', 9], ['Random variables', 0], ['Distributions', 0], ['Markov chains', 0]],
    '1.6': [['Estimators', 0], ['Maximum likelihood', 0], ['Confidence intervals', 0], ['Hypothesis tests', 0], ['Linear regression', 0], ['Bayesian updating', 0]],
    '1.7': [['Markets and orders', 22], ['Interest and compounding', 47], ['Futures and forwards', 0], ['Option payoffs', 0], ['Binomial trees', 0], ['Microstructure', 0]],
    '1.8': [['Complexity', 15], ['Arrays and hashing', 12], ['Two pointers', 0], ['Trees and heaps', 0], ['Graphs', 0], ['Dynamic programming', 0]],
    '1.9': [['Types and syntax', 0], ['Pointers and references', 0], ['Classes', 0], ['STL containers', 0], ['Templates', 0], ['Testing and timing', 0]],
  };
  const bin = (v) => (v <= 0 ? 0 : Math.min(6, Math.ceil(v * 6 / 100))); // 1-16, 17-33, 34-50, 51-66, 67-83, 84-100
  const BIN_LABEL = ['Not started', '1 to 16%', '17 to 33%', '34 to 50%', '51 to 66%', '67 to 83%', '84 to 100%'];

  /* ---------- Exam history, newest first. Every score was checked: pct = round(got / of x 100), pass if pct >= pass mark. ---------- */
  const EXAMS = [
    { d: [2026, 8, 26], tag: '1.2', track: 'code', name: 'Tools', kind: 'Topic exam', got: 11, of: 12, pass: 70,
      skills: [['Git', 3, 3], ['Command line', 3, 3], ['SQL', 3, 3], ['pytest', 2, 3]] },
    { d: [2026, 5, 7], tag: 'S0', track: 'maths', name: 'Precalculus test', kind: 'Stage 0 exit', got: 26, of: 30, pass: 85,
      skills: [['Exponentials and logarithms', 6, 6], ['Trigonometry', 7, 8], ['Sequences and series', 5, 6], ['Vectors', 4, 5], ['Counting', 4, 5]] },
    { d: [2026, 5, 6], tag: 'S0', track: 'maths', name: 'GCSE Higher paper', kind: 'Stage 0 exit', got: 68, of: 80, pass: 80, unit: 'marks',
      skills: [['Number', 14, 15], ['Algebra', 27, 32], ['Ratio and proportion', 9, 10], ['Geometry and measures', 12, 15], ['Probability and statistics', 6, 8]] },
    { d: [2026, 4, 23], tag: '0.3', track: 'maths', name: 'Precalculus', kind: 'Topic exam', got: 10, of: 12, pass: 70,
      skills: [['Exponentials and logarithms', 3, 3], ['Trigonometry', 2, 3], ['Sequences and series', 2, 2], ['Binomial expansion', 2, 2], ['Vectors', 1, 2]] },
    { d: [2026, 4, 9], tag: '0.3', track: 'maths', name: 'Precalculus', kind: 'Topic exam', got: 8, of: 12, pass: 70,
      skills: [['Exponentials and logarithms', 3, 3], ['Trigonometry', 1, 3], ['Sequences and series', 2, 2], ['Binomial expansion', 0, 2], ['Vectors', 2, 2]] },
    { d: [2026, 1, 7], tag: '0.2', track: 'maths', name: 'Algebra', kind: 'Topic exam', got: 9, of: 12, pass: 70,
      skills: [['Linear equations', 3, 3], ['Inequalities', 1, 2], ['Simultaneous equations', 2, 2], ['Quadratics', 2, 3], ['Functions and graphs', 1, 2]] },
    { d: [2024, 11, 15], tag: '0.4', track: 'code', name: 'Computer basics', kind: 'Topic exam', got: 12, of: 12, pass: 70,
      skills: [['Files and folders', 3, 3], ['The terminal', 4, 4], ['Installing software', 2, 2], ['First scripts', 3, 3]] },
    { d: [2024, 9, 26], tag: '0.1', track: 'maths', name: 'Number', kind: 'Topic exam', got: 11, of: 12, pass: 70,
      skills: [['Fractions', 3, 3], ['Percentages', 2, 3], ['Powers and roots', 3, 3], ['Ratio', 2, 2], ['Estimation', 1, 1]] },
  ].map(e => {
    const date = new Date(Date.UTC(...e.d)), pct = Math.round(e.got / e.of * 100);
    return { ...e, date, pct, passed: e.got / e.of * 100 >= e.pass, need: Math.ceil(e.of * e.pass / 100 - 1e-9) };
  });

  /* ---------- Drill record: code drills verified by visible and hidden tests ---------- */
  const DRILLS = [['0.4', 18, 18], ['1.1', 64, 96], ['1.2', 15, 24], ['1.3', 9, 30], ['1.4', 11, 36], ['1.5', 7, 48]];
  const DRILLS_DONE = DRILLS.reduce((s, d) => s + d[1], 0);

  /* Keys as the other screens implement them: [keys, what it does, how the keys join ('to', '+', 'then' or side by side)].
     Code drill keys follow drill.js: Cmd on a Mac, Ctrl elsewhere. */
  const MOD = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '') ? '⌘' : 'Ctrl';
  const SHORTCUTS = [
    ['Lessons', [[['Enter'], 'Check, then Continue'], [['1', '9'], 'Pick an answer option', 'to'], [['Enter'], 'Skip a celebration']]],
    ['Exams', [[['1', '9'], 'Pick an answer option', 'to'], [['A', 'E'], 'Tick options on select-all questions', 'to'], [['←', '→'], 'Previous or next question'], [['M'], 'Mark to come back to']]],
    ['Homework and redo', [[['1', '9'], 'Pick an answer option', 'to'], [['Enter'], 'Submit a typed answer']]],
    ['Code drills', [[['Tab'], 'Indent'], [['Shift', 'Tab'], 'Dedent', '+'], [['Esc', 'Tab'], 'Leave the editor', 'then'],
      [[MOD, 'Enter'], 'Run the examples', '+'], [[MOD, 'Shift', 'Enter'], 'Submit for the hidden tests', '+']]],
    ['Everywhere', [[['Tab'], 'Move between controls (in the code editor, press Esc first)'], [['Esc'], 'Close a sheet or dialog'],
      [['↑', '↓', '←', '→'], 'Move around the mastery map and the calendar']]],
  ];

  const fmtH = (v) => String(Math.round(v * 10) / 10);
  const hoursDone = () => Object.values(L.hoursThisWeek).reduce((s, v) => s + v, 0);
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const yearsAt = (goal) => { const y = 3100 / (goal * 52.18); return y >= 3 ? String(Math.round(y)) : y.toFixed(1); };
  const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  const hm = (m) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);
  let settingsSync = null, settingsHooked = false;

  ZQ.screen({
    id: 'you', title: 'You', group: 'App', shell: true, tab: 'you',
    render(root, Z) {
      const { esc, icon } = Z;
      const cleanups = [];
      const listen = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); cleanups.push(() => el.removeEventListener(ev, fn, opt)); };
      const lg = L.league;
      const fullName = `${L.first} ${SURNAME}`;
      const initialOf = (n) => n.normalize('NFD').charAt(0).toUpperCase();

      /* =====================================================================
         Header
         ===================================================================== */
      /* The one tappable tile carries a border and a chevron. With the streak off (spec 6.2), it shows verified drills instead. */
      const streakOff = () => prefs.streakMode === 'off';
      const firstStat = () => (streakOff()
        ? `<div class="yu-stat"><span class="yu-stat-v tnum">${icon('terminal', 'sm')}${DRILLS_DONE}</span><span class="t-caption muted">verified drills</span></div>`
        : `<button type="button" class="yu-stat is-btn" data-act="streak" aria-label="${L.streak} day streak, ${L.restDays} of 2 rest days held. Open streak details.">
              <span class="yu-stat-v tnum">${L.streak}${Z.bolt(L.todayDone)}</span><span class="yu-stat-c t-caption muted">day streak${icon('chevronR', 'xs')}</span></button>`);
      const header = `
        <section class="card yu-head" aria-labelledby="yu-name">
          <div class="yu-id">
            <span class="avatar yu-av" aria-hidden="true">${esc(L.initial)}</span>
            <div class="yu-id-t">
              <h1 class="t-h1" id="yu-name">${esc(fullName)}</h1>
              <p class="t-body secondary">Stage ${L.stage} · ${esc(L.track)} track</p>
            </div>
            <button class="icon-btn yu-gear" type="button" data-act="settings" aria-label="Go to settings">${icon('settings')}</button>
          </div>
          <div class="yu-week">
            <div class="yu-week-h"><span class="t-overline muted">This week</span><span class="t-label tnum" data-goal-text></span></div>
            <div class="bar" role="progressbar" aria-label="Hours this week" aria-valuemin="0" data-goal-bar><i></i></div>
            <span class="t-caption muted" data-goal-note></span>
          </div>
          <ul class="yu-stats">
            <li data-stat-first>${firstStat()}</li>
            <li><div class="yu-stat"><span class="yu-stat-v tnum">${icon('target', 'sm')}${L.mp.toLocaleString('en-GB')}</span><span class="t-caption muted">mastery points</span></div></li>
            <li><div class="yu-stat"><span class="yu-stat-v tnum">${Z.spark(true)}${L.xp.toLocaleString('en-GB')}</span><span class="t-caption muted">XP</span></div></li>
            <li><div class="yu-stat"><span class="yu-stat-v tnum">${icon('book', 'sm')}${LESSONS_DONE}</span><span class="t-caption muted">lessons complete</span></div></li>
          </ul>
        </section>`;

      /* =====================================================================
         League board
         ===================================================================== */
      const SHOW_FROM = Math.max(1, lg.rank - 3), SHOW_TO = Math.min(lg.size, lg.rank + 3); // the 7 rows around the learner
      const demoteFrom = lg.size - lg.demote + 1; // 26
      const leagueRows = () => BOARD.map(([name, mp, av], i) => {
        const rank = i + 1, me = av < 0;
        const nm = me ? `${L.first} ${LAST_INITIAL}` : name;
        const zone = rank <= lg.promote ? 'up' : rank >= demoteFrom ? 'down' : '';
        const rk = rank <= 3
          ? `<span class="yu-medal m${rank}" aria-hidden="true">${rank}</span>`
          : `<span class="yu-rk tnum ${zone === 'up' ? 'up' : ''}" aria-hidden="true">${rank}</span>`;
        const near = rank >= SHOW_FROM && rank <= SHOW_TO;
        const zoneSr = zone === 'up' ? ', promotion zone' : zone === 'down' ? ', demotion zone' : '';
        const row = `<li class="yu-row${me ? ' me' : ''}${near ? ' near' : ''}" data-rank="${rank}" ${me ? 'aria-current="true"' : ''}>
            <span class="sr-only">Rank ${rank}${rank <= 3 ? ', ' + ['gold', 'silver', 'bronze'][rank - 1] + ' medal' : ''}${zoneSr}: </span>${rk}
            <span class="avatar" style="background:var(${me ? '--maths-lip' : AV[av]})" aria-hidden="true">${esc(initialOf(nm))}</span>
            <span class="yu-nm">${esc(nm)}${me ? '<span class="sr-only"> (you)</span>' : ''}</span>
            <span class="yu-mp tnum">${mp} MP</span></li>`;
        const div = rank === lg.promote ? `<li class="yu-zone up${near ? ' near' : ''}" aria-hidden="true"><span>Promotion zone</span></li>`
          : rank === demoteFrom - 1 ? `<li class="yu-zone down" aria-hidden="true"><span>Demotion zone</span></li>` : '';
        return row + div;
      }).join('');
      const leagueSub = () => `Top ${lg.promote} advance · bottom ${lg.demote} drop · ${plural(lg.daysLeft, 'day', 'days')} left`;
      const above = BOARD[lg.rank - 2], below = BOARD[lg.rank];
      const nb = (name) => esc(name).replace(/ /g, '&nbsp;'); // keep "Daniel O." on one line
      const leagueOn = () => `
          <div class="yu-lg-head">
            <span class="yu-badge" aria-hidden="true">${Z.tex(GREEK[lg.tier] || '\\gamma')}</span>
            <div class="yu-lg-t">
              <h2 class="t-overline" id="yu-lg-h">${esc(lg.tier)} league</h2>
              <p class="t-caption secondary">${leagueSub()}</p>
              ${prefs.noDemotion ? `<span class="chip soft yu-nodem">${icon('shield', 'xs')}No demotion: you can only move up</span>` : ''}
            </div>
          </div>
          <p class="t-body yu-lg-you">You are <b>${ordinal(lg.rank)} of ${lg.size}</b>, ${lg.rank <= lg.promote ? 'inside the promotion zone' : lg.rank >= demoteFrom ? 'inside the demotion zone' : 'between the zones'}: ${above[1] - BOARD[lg.rank - 1][1]}&nbsp;MP behind ${nb(above[0])} and ${BOARD[lg.rank - 1][1] - below[1]}&nbsp;MP ahead of ${nb(below[0].replace(/\.$/, ''))}.</p>
          <ol class="yu-board" id="yu-board" aria-label="${esc(lg.tier)} league standings, ranked by mastery points this week">${leagueRows()}</ol>
          <div class="yu-lg-foot">
            <button type="button" class="btn secondary yu-more" data-act="board" aria-expanded="false" aria-controls="yu-board">Show all ${lg.size}</button>
            <p class="t-caption muted">Ranked by mastery points earned this week, not XP. Resets Monday 03:00 UTC.</p>
          </div>`;
      const leagueOff = () => `
          <div class="yu-lg-off">
            <span class="yu-badge" aria-hidden="true">${Z.tex(GREEK[lg.tier] || '\\gamma')}</span>
            <div class="yu-lg-t">
              <h2 class="t-h2" id="yu-lg-h">Leagues are off</h2>
              <p class="t-body secondary">Join a weekly group of 30 learners ranked by mastery points. The top 10 move up a tier each Monday. You can switch demotion off.</p>
            </div>
          </div>
          <button type="button" class="btn secondary yu-join" data-act="join">Join leagues</button>`;

      /* =====================================================================
         Mastery map
         ===================================================================== */
      const topicName = (id) => (D.topic(id) || {}).name || id;
      const passed = (id) => L.passed.includes(id);
      const topicAvg = (id) => { const m = MASTERY[id] || []; return m.length ? Math.round(m.reduce((a, b) => a + b[1], 0) / m.length) : 0; };
      const mmGrid = (stage) => {
        const topics = D.stages[stage].topics;
        return `<div class="yu-mm-stage">
          <h3 class="t-overline muted" id="yu-mm-s${stage}">Stage ${stage} · ${esc(D.stages[stage].name)}</h3>
          <div class="yu-mm-grid" role="grid" aria-labelledby="yu-mm-s${stage}" aria-describedby="yu-mm-help" data-grid>
            ${topics.map((t, r) => `<div class="yu-mm-row" role="row" data-track="${t.track}">
              <div class="yu-mm-lbl" role="rowheader"><span class="yu-tag">${t.id}</span><span class="yu-mm-name">${esc(t.name)}</span>${passed(t.id)
                ? `<span class="yu-pass" title="Topic exam passed">${icon('check', 'xs')}<span class="sr-only">, topic exam passed</span></span>` : ''}<span class="yu-mm-avg t-caption tnum" title="Mean of the six skills"><span class="sr-only">, average </span>${topicAvg(t.id)}%</span></div>
              ${(MASTERY[t.id] || []).map(([sk, v], c) => `<div class="yu-cell b${bin(v)}" role="gridcell" tabindex="${stage === 0 && r === 0 && c === 0 || stage === 1 && r === 0 && c === 0 ? 0 : -1}"
                data-r="${r}" data-c="${c}" data-tip="${esc(t.id + ' ' + sk)}" data-v="${v}" aria-label="${esc(sk)}, ${v ? v + '%' : 'not started'}"></div>`).join('')}
            </div>`).join('')}
          </div></div>`;
      };
      const mmTable = () => `<div class="yu-tablewrap" tabindex="0" role="region" aria-label="Mastery map as a table">
          <table class="yu-tbl">
            <caption class="sr-only">Mastery by skill, stages 0 and 1</caption>
            <thead><tr><th scope="col">Skill</th><th scope="col" class="num">Mastery</th></tr></thead>
            ${[0, 1].map(s => D.stages[s].topics.map(t => `<tbody>
              <tr class="yu-tgrp"><th scope="rowgroup" colspan="2" data-track="${t.track}"><span class="yu-tag">${t.id}</span> ${esc(t.name)}<span class="muted">, ${topicAvg(t.id)}% average${passed(t.id) ? ', exam passed' : ''}</span></th></tr>
              ${(MASTERY[t.id] || []).map(([sk, v]) => `<tr><td>${esc(sk)}</td><td class="num tnum">${v ? v + '%' : '<span class="muted">Not started</span>'}</td></tr>`).join('')}</tbody>`).join('')).join('')}
          </table></div>`;
      const legend = `<div class="yu-legend" aria-hidden="true">
          <span class="yu-lg-item"><i class="yu-swatch b0"></i>Not started</span>
          <span class="yu-ramp"><span>1%</span>${[1, 2, 3, 4, 5, 6].map(b => `<i class="yu-swatch b${b}"></i>`).join('')}<span>100%</span></span>
        </div>`;
      const mastery = `
        <section class="card yu-card yu-mm" aria-labelledby="yu-mm-h">
          <div class="yu-card-h">
            <div><h2 class="t-h1" id="yu-mm-h">Mastery map</h2>
              <p class="t-caption secondary" id="yu-mm-help">Six skills per topic, shaded by mastery from first-try answers in quizzes, homework, exams and redos. The figure by each topic is the mean of its six skills.<span data-keyhelp> Use the arrow keys to move between skills.</span></p></div>
            <button type="button" class="yu-view" data-act="mm-view" aria-pressed="false">${icon('grid', 'xs')}<span>Table view</span></button>
          </div>
          ${legend}
          <div class="yu-chart" data-chart="mm">
            <div data-view="map">${mmGrid(0)}${mmGrid(1)}</div>
            <div data-view="table" hidden>${mmTable()}</div>
            <div class="yu-tip" aria-hidden="true" hidden></div>
          </div>
        </section>`;

      /* =====================================================================
         Streak calendar
         ===================================================================== */
      const DAYS = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
      const DAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      /* Every cell reads as day, state, then detail: "Wed 30 Sep: rest day, streak kept" */
      const calLabel = (i) => {
        const day = fmtDay(calDate(i)), c = CAL[i];
        if (c === 'L') return ['Studied', day, hm(MINS[i])];
        if (c === 'R') return ['Rest day', day, 'streak kept'];
        if (c === 'X') return ['Missed', day, 'no rest day held'];
        if (c === 'T') return ['Today', day, 'not studied yet'];
        return ['To come', day, ''];
      };
      /* Studied days are shaded in three steps by time: under 1 h 30 min, up to 2 h 29 min, 2 h 30 min or more */
      const heat = (m) => (m < 90 ? 'h1' : m < 150 ? 'h2' : 'h3');
      /* A month is labelled on the week that holds its 1st (or on the first week shown) */
      const monthOf = (w) => {
        if (w === 0) return MON[calDate(0).getUTCMonth()];
        for (let k = 0; k < 7; k++) { const d = calDate(w * 7 + k); if (d.getUTCDate() === 1) return MON[d.getUTCMonth()]; }
        return '';
      };
      const calCell = (i, r, c2) => {
        const c = CAL[i], [v, day, det] = calLabel(i);
        const cls = { L: 'lit ' + heat(MINS[i]), R: 'rest', X: 'missed', T: 'today', F: 'future' }[c];
        const inNow = i >= RUN_NOW[0] && i <= RUN_NOW[1], inBest = i >= RUN_BEST[0] && i <= RUN_BEST[1];
        const glyph = c === 'R' ? icon('rest') : '';
        return `<div class="yu-day ${cls}${inNow ? ' run-now' : ''}${inBest ? ' run-best' : ''}" role="gridcell" tabindex="${i === PAST_DAYS ? 0 : -1}" data-i="${i}"
          data-r="${r}" data-c="${c2}" data-tip="${esc(day)}" data-tv="${esc(v)}" data-td="${esc(det)}" aria-label="${esc(day)}: ${esc(v.toLowerCase())}${det ? ', ' + esc(det) : ''}">${glyph}</div>`;
      };
      /* Two layouts of the same 84 days: weekday rows and week columns from 640 px, week rows and weekday columns below
         (cells of about 38 px with a 44 px hit area). Only one is displayed at a time. */
      const calDesk = `<div class="yu-cal yu-cal-desk" role="grid" aria-label="Streak calendar, 12 weeks from 14 July. Rows are days of the week, Monday first; columns are weeks." data-grid>
          <div class="yu-cal-months" role="presentation" aria-hidden="true">${Array.from({ length: 12 }, (_, w) => { const m = monthOf(w); return m ? `<span style="grid-column:${w + 2}">${m}</span>` : ''; }).join('')}</div>
          ${DAYS.map((dl, r) => `<div class="yu-cal-row" role="row"><span class="yu-cal-d" role="rowheader" aria-label="${DAYS_LONG[r]}s">${dl}</span>${
            Array.from({ length: 12 }, (_, w) => calCell(w * 7 + r, r, w)).join('')}</div>`).join('')}
        </div>`;
      const calMob = `<div class="yu-cal yu-cal-mob" role="grid" aria-label="Streak calendar, 12 weeks from 14 July. Rows are weeks, oldest first; columns are days, Monday first." data-grid>
          <div class="yu-cal-row yu-cal-hd" role="row"><span role="columnheader"><span class="sr-only">Week of</span></span>${DAYS.map((dl, d) => `<span class="yu-cal-d" role="columnheader" aria-label="${DAYS_LONG[d]}">${dl}</span>`).join('')}</div>
          ${Array.from({ length: 12 }, (_, w) => { const wk = calDate(w * 7); return `<div class="yu-cal-row" role="row"><span class="yu-cal-d yu-cal-m" role="rowheader" aria-label="Week of ${wk.getUTCDate()} ${MON[wk.getUTCMonth()]}">${monthOf(w)}</span>${
            Array.from({ length: 7 }, (_, d) => calCell(w * 7 + d, w, d)).join('')}</div>`; }).join('')}
        </div>`;
      const weekRows = Array.from({ length: 12 }, (_, w) => {
        const s = CAL.slice(w * 7, w * 7 + 7), m = MINS.slice(w * 7, w * 7 + 7).reduce((a, b) => a + b, 0);
        const cnt = (ch) => (s.match(new RegExp(ch, 'g')) || []).length;
        const wk = calDate(w * 7);
        return `<tr><th scope="row" class="yu-wk">${wk.getUTCDate()} ${MON[wk.getUTCMonth()]}${w === 11 ? '<span class="t-caption muted">This week</span>' : ''}</th>
          <td class="num tnum">${cnt('L')}</td><td class="num tnum">${cnt('R')}</td><td class="num tnum">${cnt('X')}</td><td class="num tnum">${fmtH(m / 60)}</td></tr>`;
      }).reverse().join('');
      const calTable = `<div class="yu-tablewrap" tabindex="0" role="region" aria-label="Streak calendar as a table">
          <table class="yu-tbl"><caption class="sr-only">Days studied per week, newest first</caption>
          <thead><tr><th scope="col">Week of</th><th scope="col" class="num">Studied</th><th scope="col" class="num">Rest</th><th scope="col" class="num">Missed</th><th scope="col" class="num">Hours</th></tr></thead>
          <tbody>${weekRows}</tbody></table></div>`;
      const rangeText = (run) => `${fmtDay(calDate(run[0])).slice(4)} to ${fmtDay(calDate(run[1])).slice(4)}`;
      const streak = `
        <section class="card yu-card yu-st" aria-labelledby="yu-st-h">
          <div class="yu-card-h">
            <div><h2 class="t-h1" id="yu-st-h">Streak calendar</h2>
              <p class="t-caption secondary">The last 12 weeks. A day counts after one lesson or three problems.</p></div>
            <button type="button" class="yu-view" data-act="cal-view" aria-pressed="false">${icon('grid', 'xs')}<span>Table view</span></button>
          </div>
          <div class="yu-st-stats">
            <button type="button" class="yu-run" data-run="now" aria-pressed="false"><span class="t-overline muted">Current</span><span class="yu-run-v tnum">${L.streak} days</span><span class="t-caption muted">${rangeText(RUN_NOW)}</span></button>
            <button type="button" class="yu-run" data-run="best" aria-pressed="false"><span class="t-overline muted">Longest</span><span class="yu-run-v tnum">${L.bestStreak} days</span><span class="t-caption muted">${rangeText(RUN_BEST)}</span></button>
            <div class="yu-run is-static"><span class="t-overline muted">Studied</span><span class="yu-run-v tnum">${STUDIED} of ${PAST_DAYS}</span><span class="t-caption muted">days so far</span></div>
            <div class="yu-run is-static"><span class="t-overline muted">Rest days</span><span class="yu-run-v tnum">${L.restDays} of 2</span><span class="t-caption muted">held now</span></div>
          </div>
          <div class="yu-chart" data-chart="cal">
            <div data-view="map">${calDesk}${calMob}
              <ul class="yu-cal-key" aria-hidden="true">
                <li class="yu-cal-ramp"><span>Time studied: less</span><i class="yu-day lit h1"></i><i class="yu-day lit h2"></i><i class="yu-day lit h3"></i><span>more</span></li>
                <li><i class="yu-day rest">${icon('rest')}</i>Rest day used</li>
                <li><i class="yu-day missed"></i>Missed</li>
                <li><i class="yu-day today"></i>Today</li>
                <li><i class="yu-day future"></i>To come</li>
                <li data-key-booked hidden><i class="yu-day future booked">${icon('rest')}</i>Break booked</li>
              </ul>
            </div>
            <div data-view="table" hidden>${calTable}</div>
            <div class="yu-tip" aria-hidden="true" hidden></div>
          </div>
        </section>`;

      /* =====================================================================
         Exam history
         ===================================================================== */
      const examRows = EXAMS.map((e, i) => `<tr data-track="${e.track}">
          <td class="yu-ex-d"><time datetime="${isoDate(e.date)}">${fmtDate(e.date)}</time></td>
          <th scope="row" class="yu-ex-n"><button type="button" class="yu-ex-b" data-exam="${i}" aria-haspopup="dialog">
            <span class="yu-tag">${e.tag}</span><span class="yu-ex-t"><span class="t-label">${esc(e.name)}</span><span class="t-caption muted">${esc(e.kind)}</span></span>${icon('chevronR', 'sm yu-chev')}</button></th>
          <td class="yu-ex-s num tnum"><span class="yu-ex-pct">${e.pct}%</span><span class="yu-ex-got">${e.got} of ${e.of}</span></td>
          <td class="yu-ex-p num tnum"><span class="yu-k">Pass </span>${e.pass}%</td>
          <td class="yu-ex-r">${e.passed ? `<span class="chip correct">${icon('check', 'xs')}Passed</span>` : `<span class="chip notyet">${icon('cross', 'xs')}Not passed</span>`}</td>
        </tr>`).join('');
      const exams = `
        <section class="card yu-card yu-ex" aria-labelledby="yu-ex-h">
          <div class="yu-card-h"><div><h2 class="t-h1" id="yu-ex-h">Exam history</h2>
            <p class="t-caption secondary">${EXAMS.filter(e => e.passed).length} passed, ${EXAMS.filter(e => !e.passed).length} not passed. Open one to see marks by skill.</p></div></div>
          <table class="yu-extbl">
            <caption class="sr-only">Exam history, newest first</caption>
            <thead><tr><th scope="col">Date</th><th scope="col">Exam</th><th scope="col" class="num">Score</th><th scope="col" class="num">Pass mark</th><th scope="col">Result</th></tr></thead>
            <tbody>${examRows}</tbody>
          </table>
        </section>`;

      /* =====================================================================
         Drill record
         ===================================================================== */
      const drills = `
        <section class="card yu-card yu-dr" aria-labelledby="yu-dr-h">
          <div class="yu-card-h"><div><h2 class="t-h1" id="yu-dr-h">Drill record</h2>
            <p class="t-caption secondary">A drill counts once your code passes every visible and hidden test.</p></div>
            <span class="yu-dr-total"><span class="t-stat tnum">${DRILLS_DONE}</span><span class="t-caption muted">verified</span></span></div>
          <ul class="yu-dr-list">
            ${DRILLS.map(([id, done, of]) => { const t = D.topic(id); return `<li data-track="${t.track}">
              <span class="yu-tag">${id}</span><span class="yu-dr-n t-label">${esc(t.name)}</span>
              <span class="yu-dr-bar" role="img" aria-label="${done} of ${of} drills verified"><i style="width:${(done / of * 100).toFixed(1)}%"></i></span>
              <span class="yu-dr-v t-caption tnum"><b>${done}</b> of ${of}</span></li>`; }).join('')}
          </ul>
        </section>`;

      /* =====================================================================
         Settings
         ===================================================================== */
      const seg = (name, label, opts, val, help = '') => `<div class="yu-set-row yu-set-stack">
          <div class="yu-set-t"><span class="t-label" id="yu-l-${name}">${label}</span>${help ? `<span class="t-caption muted" id="yu-h-${name}">${help}</span>` : ''}</div>
          <div class="yu-seg" role="radiogroup" aria-labelledby="yu-l-${name}" ${help ? `aria-describedby="yu-h-${name}"` : ''}>
            ${opts.map(([v, l]) => `<label><input type="radio" name="yu-${name}" value="${v}" ${String(val) === String(v) ? 'checked' : ''}><span>${l}</span></label>`).join('')}
          </div></div>`;
      const sw = (id, label, help, on, extra = '') => `<div class="yu-set-row">
          <label class="yu-set-t" for="yu-${id}"><span class="t-label">${label}</span>${help ? `<span class="t-caption muted" id="yu-h-${id}">${help}</span>` : ''}</label>
          <span class="yu-sw"><input type="checkbox" role="switch" id="yu-${id}" ${on ? 'checked' : ''} ${help ? `aria-describedby="yu-h-${id}"` : ''} ${extra}><i aria-hidden="true"></i></span>
        </div>`;
      const act = (a, label, help, btn, ic) => `<div class="yu-set-row">
          <div class="yu-set-t"><span class="t-label">${label}</span><span class="t-caption muted">${help}</span></div>
          <button type="button" class="btn secondary yu-set-btn" data-act="${a}">${ic ? icon(ic, 'sm') : ''}${btn}</button>
        </div>`;
      const goalHelp = (g) => `The full path is 3,100 hours: about ${yearsAt(g)} years at ${g} h a week.`;
      const streakHelp = () => (prefs.streakMode === 'off' ? 'Hides the streak count, bolt and calendar everywhere.'
        : prefs.streakMode === 'weekly' ? `Study on ${prefs.streakDays} of 7 days each week. Missing the other days does not break your streak.`
          : 'Study every day. Rest days cover the odd missed day.');
      /* Planned breaks (spec 6.2): up to 14 days a year, booked ahead. Stored as { from: 'YYYY-MM-DD', days }. */
      const breaksLeft = () => BREAK_DAYS - prefs.breaks.reduce((a, b) => a + b.days, 0);
      const brStart = (b) => Date.parse(b.from + 'T00:00:00Z'), brEnd = (b) => brStart(b) + (b.days - 1) * DAY_MS;
      const brRange = (b) => (b.days === 1 ? fmtDay(new Date(brStart(b))) : `${fmtDay(new Date(brStart(b)))} to ${fmtDay(new Date(brEnd(b)))}`);
      const breaksHelp = () => `${breaksLeft()} of ${BREAK_DAYS} days left this year. Booked days never break your streak.`;
      const breaksList = () => prefs.breaks.map((b, i) => `<li><span class="t-caption tnum">${brRange(b)}, ${plural(b.days, 'day', 'days')}</span>
          <button type="button" class="yu-linkbtn" data-unbook="${i}" aria-label="Cancel the break from ${fmtDay(new Date(brStart(b)))}">Cancel</button></li>`).join('');
      const settings = `
        <section class="card yu-card yu-set" id="yu-settings" aria-labelledby="yu-set-h" tabindex="-1">
          <h2 class="t-h1" id="yu-set-h">Settings</h2>
          <div class="yu-set-cols">
            <div class="yu-set-g">
              <h3 class="t-overline muted">Display and feedback</h3>
              ${seg('theme', 'Theme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], Z.settings.theme, 'System follows your device.')}
              ${seg('motion', 'Motion', [['system', 'System'], ['full', 'Full'], ['reduced', 'Reduced']], Z.settings.motion, 'Reduced swaps movement for quick fades and shows totals at once.')}
              ${sw('sound', 'Sound', 'Short tones for right answers, misses and finishing a lesson.', Z.settings.sound)}
              ${sw('haptics', 'Haptics', 'A light tap on right answers. Never during exams.', Z.settings.haptics !== false)}
            </div>
            <div class="yu-set-g">
              <h3 class="t-overline muted">Study plan</h3>
              ${seg('goal', 'Weekly goal', [[5, '5 h'], [10, '10 h'], [15, '15 h'], [25, '25 h']], prefs.goal, goalHelp(prefs.goal))}
              <div class="yu-set-row yu-set-stack">
                <div class="yu-set-t"><label class="t-label" for="yu-remind">Daily reminder</label>
                  <span class="t-caption muted" id="yu-h-remind">One a day at most, and never after 21:00. For example: “${plural(L.due.redo, 'redo problem is', 'redo problems are')} due. About ${L.due.redoMinutes} minutes.”</span></div>
                <div class="yu-remind">
                  <span class="yu-sw"><input type="checkbox" role="switch" id="yu-remind" aria-describedby="yu-h-remind" ${prefs.reminder ? 'checked' : ''}><i aria-hidden="true"></i></span>
                  <label class="yu-time"><span class="t-caption muted">Time</span><input type="time" id="yu-remind-at" value="${esc(prefs.reminderAt)}" max="21:00" step="300" aria-describedby="yu-remind-err" ${prefs.reminder ? '' : 'disabled'}></label>
                  <span class="t-caption yu-err" id="yu-remind-err" aria-live="polite"></span>
                </div>
              </div>
              <div class="yu-set-row yu-set-stack">
                <div class="yu-set-t"><span class="t-label" id="yu-l-smode">Streak mode</span><span class="t-caption muted" id="yu-h-smode">${streakHelp()}</span></div>
                <div class="yu-smode">
                  <div class="yu-seg" role="radiogroup" aria-labelledby="yu-l-smode" aria-describedby="yu-h-smode">
                    ${[['daily', 'Daily'], ['weekly', 'Weekly'], ['off', 'Off']].map(([v, l]) => `<label><input type="radio" name="yu-smode" value="${v}" ${prefs.streakMode === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}
                  </div>
                  <label class="yu-days" hidden><span class="sr-only">Days a week</span>
                    <select id="yu-sdays">${[3, 4, 5, 6, 7].map(n => `<option value="${n}" ${prefs.streakDays === n ? 'selected' : ''}>${n} of 7 days</option>`).join('')}</select></label>
                </div>
                <p class="t-caption muted" data-wk-note hidden>Weekly mode starts on Monday 5 October. Past weeks keep their daily record.</p>
              </div>
              <div class="yu-set-row yu-breaks-row" data-breaks-row>
                <div class="yu-set-t"><span class="t-label" id="yu-l-breaks">Planned breaks</span><span class="t-caption muted" id="yu-h-breaks">${breaksHelp()}</span>
                  <ul class="yu-breaks" aria-label="Booked breaks" data-breaks>${breaksList()}</ul></div>
                <button type="button" class="btn secondary yu-set-btn" data-act="break" aria-describedby="yu-h-breaks">Book a break</button>
              </div>
            </div>
            <div class="yu-set-g">
              <h3 class="t-overline muted">Leagues</h3>
              ${sw('leagues', 'Weekly leagues', 'Groups of 30, ranked by mastery points. Off by default.', prefs.leagues)}
              ${sw('nodem', 'No demotion', 'You can move up a tier but never down.', prefs.noDemotion, prefs.leagues ? '' : 'disabled')}
            </div>
            <div class="yu-set-g">
              <h3 class="t-overline muted">Help and data</h3>
              ${act('keys', 'Keyboard shortcuts', 'Every lesson, exam and homework works from the keyboard.', 'View', '')}
              ${act('export', 'Export my record', 'Your exams, verified drills and mastery map as a PDF or CSV.', 'Export', '')}
              ${act('reset', 'Reset progress', 'Start the path again from Stage 0. Your settings stay.', 'Reset', '')}
            </div>
          </div>
        </section>`;

      /* =====================================================================
         Mount
         ===================================================================== */
      root.innerHTML = `<div class="yu">
          ${header}
          <div class="yu-cols">
            <div class="yu-side"><section class="card yu-card yu-lg" aria-labelledby="yu-lg-h" data-league></section></div>
            <div class="yu-main">${mastery}${streak}${exams}${drills}</div>
          </div>
          ${settings}
        </div>`;
      const $ = (s) => root.querySelector(s), $$ = (s) => Array.from(root.querySelectorAll(s));

      /* Mark the shell's avatar link as the current page (the shell is rebuilt on every route, so this stays on You) */
      const shellAv = root.closest('.shell') && root.closest('.shell').querySelector('.shell-header .avatar');
      if (shellAv) shellAv.setAttribute('aria-current', 'page');

      /* ---------- Weekly goal in the header ---------- */
      const drawGoal = () => {
        const done = hoursDone(), goal = prefs.goal, bar = $('[data-goal-bar]');
        $('[data-goal-text]').innerHTML = `<b>${fmtH(done)}</b> of ${goal} h`;
        bar.setAttribute('aria-valuemax', String(goal)); bar.setAttribute('aria-valuenow', fmtH(Math.min(done, goal)));
        bar.setAttribute('aria-valuetext', `${fmtH(done)} of ${goal} hours`);
        bar.querySelector('i').style.width = Math.min(100, done / goal * 100).toFixed(1) + '%';
        $('[data-goal-note]').textContent = done >= goal ? `Goal met. Anything more this week is extra.` : `${fmtH(goal - done)} h to go. The week resets on Monday.`;
      };
      drawGoal();

      /* ---------- League ---------- */
      let expanded = false;
      const drawLeague = () => {
        const box = $('[data-league]');
        box.classList.toggle('is-off', !prefs.leagues);
        box.innerHTML = prefs.leagues ? leagueOn() : leagueOff();
        box.classList.toggle('is-open', expanded);
        if (prefs.leagues) setBoard(expanded, false);
      };
      const setBoard = (open, animate) => {
        expanded = open;
        const box = $('[data-league]'), btn = box.querySelector('.yu-more');
        box.classList.toggle('is-open', open);
        box.querySelectorAll('.yu-board > li').forEach(li => {
          const show = open || li.classList.contains('near');
          const was = !li.hidden;
          li.hidden = !show;
          if (show && !was && animate && !Z.reducedMotion()) { li.classList.remove('yu-in'); void li.offsetWidth; li.classList.add('yu-in'); }
        });
        if (btn) { btn.setAttribute('aria-expanded', String(open)); btn.textContent = open ? 'Show fewer' : `Show all ${lg.size}`; }
      };
      drawLeague();

      /* ---------- Tooltips and roving focus for the two heatmaps ---------- */
      const tipFor = (chart) => chart.querySelector('.yu-tip');
      const showTip = (cell) => {
        const chart = cell.closest('.yu-chart'), tip = tipFor(chart);
        tip.replaceChildren();
        if (chart.dataset.chart === 'mm') {
          const v = +cell.dataset.v;
          const a = document.createElement('span'); a.textContent = cell.dataset.tip + ' · ';
          const b = document.createElement('b'); b.textContent = v ? v + '%' : 'not started';
          tip.append(a, b);
        } else {
          const a = document.createElement('span'); a.textContent = cell.dataset.tip + ' · ';
          const b = document.createElement('b'); b.textContent = cell.dataset.tv;
          const c = document.createElement('span'); c.textContent = cell.dataset.td ? ', ' + cell.dataset.td : '';
          tip.append(a, b, c);
        }
        tip.hidden = false;
        const cr = chart.getBoundingClientRect(), r = cell.getBoundingClientRect();
        const tw = tip.offsetWidth, th = tip.offsetHeight;
        let x = r.left - cr.left + r.width / 2 - tw / 2, y = r.top - cr.top - th - 8;
        x = Math.max(0, Math.min(cr.width - tw, x));
        if (y < -cr.top + 8 && r.bottom - cr.top + th + 8 < cr.height) y = r.bottom - cr.top + 8;
        tip.style.left = x + 'px'; tip.style.top = y + 'px';
        chart.querySelectorAll('.is-hot').forEach(n => n.classList.remove('is-hot'));
        cell.classList.add('is-hot');
      };
      const hideTip = (chart) => { const t = tipFor(chart); t.hidden = true; chart.querySelectorAll('.is-hot').forEach(n => n.classList.remove('is-hot')); };
      $$('.yu-chart').forEach(chart => {
        listen(chart, 'pointerover', (e) => { const c = e.target.closest('[role="gridcell"]'); if (c) showTip(c); });
        listen(chart, 'pointerleave', () => { const f = document.activeElement; if (f && chart.contains(f) && f.matches('[role="gridcell"]')) showTip(f); else hideTip(chart); });
        listen(chart, 'focusin', (e) => { if (e.target.matches('[role="gridcell"]')) showTip(e.target); });
        listen(chart, 'focusout', (e) => { if (!chart.contains(e.relatedTarget)) hideTip(chart); });
        listen(chart, 'keydown', (e) => {
          const cell = e.target.closest('[role="gridcell"]'); if (!cell) return;
          if (e.key === 'Escape') { hideTip(chart); return; }
          const grid = cell.closest('[data-grid]');
          const cells = Array.from(grid.querySelectorAll('[role="gridcell"]'));
          const r = +cell.dataset.r, c = +cell.dataset.c;
          const maxR = Math.max(...cells.map(n => +n.dataset.r)), maxC = Math.max(...cells.map(n => +n.dataset.c));
          const mv = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
          let nr = r, nc = c;
          if (mv) { nr = Math.max(0, Math.min(maxR, r + mv[0])); nc = Math.max(0, Math.min(maxC, c + mv[1])); }
          else if (e.key === 'Home') nc = 0; else if (e.key === 'End') nc = maxC; else return;
          e.preventDefault();
          const next = cells.find(n => +n.dataset.r === nr && +n.dataset.c === nc);
          if (next && next !== cell) { cell.tabIndex = -1; next.tabIndex = 0; next.focus(); }
        });
        listen(chart, 'click', (e) => { const c = e.target.closest('[role="gridcell"]'); if (c) { const g = c.closest('[data-grid]'); g.querySelectorAll('[role="gridcell"]').forEach(n => { n.tabIndex = -1; }); c.tabIndex = 0; c.focus(); } });
      });

      /* ---------- Table views ---------- */
      const toggleView = (btn, chart) => {
        const on = btn.getAttribute('aria-pressed') !== 'true';
        btn.setAttribute('aria-pressed', String(on));
        btn.querySelector('span').textContent = on ? (chart.dataset.chart === 'mm' ? 'Map view' : 'Calendar view') : 'Table view';
        chart.querySelector('[data-view="map"]').hidden = on;
        chart.querySelector('[data-view="table"]').hidden = !on;
        hideTip(chart);
        const legendEl = chart.parentElement.querySelector('.yu-legend'); if (legendEl) legendEl.hidden = on;
        const kh = chart.parentElement.querySelector('[data-keyhelp]'); if (kh) kh.hidden = on; // arrow keys only move around the map
        if (chart.dataset.chart === 'cal') { // the run highlight only shows on the calendar
          if (on) setRun(null);
          $$('.yu-run[data-run]').forEach(r => { r.disabled = on; });
        }
      };

      /* ---------- Streak run highlight ---------- */
      const setRun = (which) => {
        $$('.yu-run[data-run]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.run === which)));
        $$('.yu-cal').forEach(cal => { cal.classList.toggle('show-now', which === 'now'); cal.classList.toggle('show-best', which === 'best'); });
      };

      /* ---------- Sheets ---------- */
      const examSheet = (e) => {
        const under = e.skills.filter(([, c, t]) => c / t * 100 < e.pass);
        const listAnd = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
        const note = e.passed
          ? (under.length ? `Passed. Under the pass mark on ${listAnd(under.map(([n, c, t]) => `${esc(n)} (${c} of ${t})`))}. Those questions went to your redo queue.` : 'Passed, with every skill at or above the pass mark.')
          : `Not passed: ${plural(e.need - e.got, e.unit ? 'mark' : 'question', e.unit || 'questions')} short of the pass mark. Under the pass mark on ${listAnd(under.map(([n, c, t]) => `${esc(n)} (${c} of ${t})`))}. Those questions went to your redo queue, and you passed on the next attempt.`;
        const close = Z.sheet(`<div class="yu-sh" data-track="${e.track}">
            <div class="yu-sh-h"><span class="yu-sh-tag">${e.tag}</span><div><h2 class="t-sheet-title">${esc(e.name)}</h2><p class="t-caption muted">${esc(e.kind)} · ${WD[e.date.getUTCDay()]} ${fmtDate(e.date)}</p></div></div>
            <div class="yu-sh-score"><span class="t-stat tnum">${e.pct}%</span>
              <span class="yu-sh-meta"><span class="t-label tnum">${e.got} of ${e.of} ${e.unit || 'correct'}</span><span class="t-caption muted tnum">Pass mark ${e.pass}%, which is ${e.need} of ${e.of}</span></span>
              ${e.passed ? `<span class="chip correct">${icon('check', 'xs')}Passed</span>` : `<span class="chip notyet">${icon('cross', 'xs')}Not passed</span>`}</div>
            <div class="yu-sh-sk">
              <p class="t-caption secondary">Share correct in each skill. The dashed line is the ${e.pass}% pass mark.</p>
              <ul style="--pm:${e.pass}%">${e.skills.map(([n, c, t]) => `<li><span class="t-label">${esc(n)}</span><span class="t-caption tnum muted">${c} of ${t}</span>
                <span class="yu-sh-bar" role="img" aria-label="${esc(n)}: ${c} of ${t}, ${Math.round(c / t * 100)}%"><i style="width:${(c / t * 100).toFixed(1)}%"></i></span></li>`).join('')}</ul>
            </div>
            <p class="t-body yu-sh-note">${note}</p>
            <div class="yu-sh-acts"><button type="button" class="btn secondary" data-review>Review answers</button></div>
          </div>`, { label: `${e.name} exam, ${fmtDate(e.date)}` });
        const rv = document.querySelector('.yu-sh [data-review]');
        rv && rv.addEventListener('click', () => { close(); Z.go('exam-result'); });
      };
      const keysSheet = () => Z.sheet(`<div class="yu-sh">
          <h2 class="t-sheet-title">Keyboard shortcuts</h2>
          ${SHORTCUTS.map(([g, list]) => `<div class="yu-sh-keys"><h3 class="t-overline muted">${g}</h3><dl>${list.map(([k, d, sep]) =>
            `<div><dt>${k.map(x => `<kbd>${esc(x)}</kbd>`).join(sep ? `<span class="muted">${sep}</span>` : '')}</dt><dd>${d}</dd></div>`).join('')}</dl></div>`).join('')}
        </div>`, { label: 'Keyboard shortcuts' });

      /* Export: a one-page PDF (hand-built, Helvetica, ASCII only) or a CSV, made in the browser. */
      const asciiPdf = (s) => String(s).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/é/g, 'e').replace(/[^\x20-\x7e]/g, '-').replace(/[\\()]/g, (m) => '\\' + m);
      const makePdf = (lines) => {
        const pages = []; let page = [], y = 790;
        lines.forEach(([x, size, bold, text, gap = 0]) => {
          y -= gap; if (y < 56) { pages.push(page); page = []; y = 790; }
          page.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x} ${y} Td (${asciiPdf(text)}) Tj ET`); y -= size + 6;
        });
        pages.push(page);
        const obj = [null, '<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
          '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
        const kids = [];
        pages.forEach((p, i) => {
          const s = p.join('\n'), pid = 5 + i * 2; kids.push(`${pid} 0 R`);
          obj[pid] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pid + 1} 0 R >>`;
          obj[pid + 1] = `<< /Length ${s.length} >>\nstream\n${s}\nendstream`;
        });
        obj[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
        let out = '%PDF-1.4\n'; const off = [];
        for (let i = 1; i < obj.length; i++) { off[i] = out.length; out += `${i} 0 obj\n${obj[i]}\nendobj\n`; }
        const xref = out.length;
        out += `xref\n0 ${obj.length}\n0000000000 65535 f \n${off.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('')}`;
        out += `trailer\n<< /Size ${obj.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
        return new Blob([out], { type: 'application/pdf' });
      };
      const recordPdf = () => {
        const Ls = [[56, 20, true, 'Zero to Quant: learning record'], [56, 11, false, `${fullName}. Stage ${L.stage}, ${L.track} track. Exported ${TODAY_LONG} 2026.`, 2],
          [56, 13, true, 'Exams', 14]];
        EXAMS.forEach(e => Ls.push([56, 10, false, `${fmtDate(e.date)}   ${e.tag} ${e.name}, ${e.kind}   ${e.got} of ${e.of} (${e.pct}%)   pass mark ${e.pass}%   ${e.passed ? 'Passed' : 'Not passed'}`]));
        Ls.push([56, 13, true, `Verified drills: ${DRILLS_DONE}`, 14]);
        DRILLS.forEach(([id, d, o]) => Ls.push([56, 10, false, `${id} ${topicName(id)}: ${d} of ${o} verified`]));
        Ls.push([56, 13, true, 'Mastery by topic (mean of six skills)', 14]);
        [0, 1].forEach(s => D.stages[s].topics.forEach(t => Ls.push([56, 10, false, `${t.id} ${t.name}: ${topicAvg(t.id)}%${passed(t.id) ? ', topic exam passed' : ''}`])));
        Ls.push([56, 9, false, 'Mastery comes from first-try answers in quizzes, homework, exams and redos. Drills are verified by hidden tests.', 14]);
        Ls.push([56, 9, false, 'This is a record of your own study, not a qualification or accreditation.', 6]);
        return makePdf(Ls);
      };
      const recordCsv = () => {
        const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
        const rows = [['section', 'date', 'topic', 'item', 'value', 'out_of', 'percent', 'pass_mark', 'result']];
        EXAMS.forEach(e => rows.push(['exam', isoDate(e.date), e.tag, `${e.name} (${e.kind})`, e.got, e.of, e.pct, e.pass, e.passed ? 'passed' : 'not passed']));
        DRILLS.forEach(([id, d, o]) => rows.push(['drills', '', id, topicName(id), d, o, Math.round(d / o * 100), '', '']));
        [0, 1].forEach(s => D.stages[s].topics.forEach(t => MASTERY[t.id].forEach(([sk, v]) => rows.push(['mastery', '', t.id, sk, v, 100, v, '', '']))));
        /* A byte order mark, so Excel reads the curly apostrophe in "Bayes’ rule" as UTF-8 */
        return new Blob(['\uFEFF' + rows.map(r => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
      };
      const download = (blob, name) => {
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      };
      const exportSheet = () => {
        Z.sheet(`<div class="yu-sh">
            <h2 class="t-sheet-title">Export my record</h2>
            <p class="t-body secondary">Your study record as of ${TODAY_LONG}.</p>
            <ul class="yu-sh-inc">
              <li>${icon('shield', 'sm')}<span><b>${plural(EXAMS.length, 'exam attempt', 'exam attempts')}</b>, with scores and pass marks</span></li>
              <li>${icon('terminal', 'sm')}<span><b>${DRILLS_DONE} verified drills</b> across ${DRILLS.length} topics</span></li>
              <li>${icon('grid', 'sm')}<span><b>Mastery for 84 skills</b> in stages 0 and 1</span></li>
            </ul>
            <p class="t-caption muted">This is a record of your own study, not a qualification or accreditation.</p>
            <div class="yu-sh-acts"><button type="button" class="btn" data-dl="pdf">Download PDF</button><button type="button" class="btn secondary" data-dl="csv">Download CSV</button></div>
            <p class="t-caption yu-sh-done" role="status" aria-live="polite"></p>
          </div>`, { label: 'Export my record' });
        const box = document.querySelector('.yu-sh-acts'), done = document.querySelector('.yu-sh-done');
        box && box.addEventListener('click', (ev) => {
          const b = ev.target.closest('[data-dl]'); if (!b) return;
          const name = b.dataset.dl === 'pdf' ? 'zero-to-quant-record.pdf' : 'zero-to-quant-record.csv';
          download(b.dataset.dl === 'pdf' ? recordPdf() : recordCsv(), name);
          if (done) done.innerHTML = `${icon('check', 'xs')}<span>Saved as ${name}. Check your downloads folder.</span>`;
        });
      };
      const resetSheet = () => {
        Z.sheet(`<div class="yu-sh">
            <h2 class="t-sheet-title">Reset progress?</h2>
            <p class="t-body">This clears your streak, XP, mastery points, mastery map, exam history and drill record. Your settings stay. It cannot be undone.</p>
            <p class="t-caption muted">Export your record first if you want to keep it.</p>
            <div class="yu-sh-acts"><button type="button" class="btn" data-close autofocus>Keep my progress</button><button type="button" class="btn secondary" data-reset>Reset</button></div>
          </div>`, { modal: true, label: 'Reset progress' });
        const b = document.querySelector('[data-reset]');
        b && b.addEventListener('click', () => {
          const sh = b.closest('.yu-sh');
          sh.innerHTML = `<h2 class="t-sheet-title">Nothing was reset</h2><p class="t-body">This is a prototype, so your progress is unchanged. In the app, this would clear everything listed and take you back to Stage 0.</p>
            <div class="yu-sh-acts"><button type="button" class="btn secondary" data-close>Close</button></div>`;
          sh.querySelector('[data-close]').focus();
        });
      };

      /* ---------- Clicks ---------- */
      listen(root, 'click', (e) => {
        const ex = e.target.closest('[data-exam]'); if (ex) { examSheet(EXAMS[+ex.dataset.exam]); return; }
        const ub = e.target.closest('[data-unbook]');
        if (ub) { prefs.breaks.splice(+ub.dataset.unbook, 1); savePrefs(); drawBreaks(); $('[data-act="break"]').focus(); return; }
        const run = e.target.closest('.yu-run[data-run]');
        if (run) { setRun(run.getAttribute('aria-pressed') === 'true' ? null : run.dataset.run); return; }
        const b = e.target.closest('[data-act]'); if (!b) return;
        const a = b.dataset.act;
        if (a === 'streak') Z.streakSheet();
        else if (a === 'settings') { const s = $('#yu-settings'); s.scrollIntoView({ behavior: Z.reducedMotion() ? 'auto' : 'smooth', block: 'start' }); s.focus({ preventScroll: true }); }
        else if (a === 'board') { setBoard(!expanded, true); }
        else if (a === 'join') { setLeagues(true); $('[data-league] .yu-more')?.focus(); }
        else if (a === 'mm-view' || a === 'cal-view') toggleView(b, b.closest('.yu-card').querySelector('.yu-chart'));
        else if (a === 'keys') keysSheet();
        else if (a === 'break') breakSheet();
        else if (a === 'export') exportSheet();
        else if (a === 'reset') resetSheet();
      });

      /* ---------- Streak mode: daily, weekly or off. Off hides the streak tile, the calendar and the header pill. ---------- */
      const applyStreakMode = () => {
        const off = streakOff(), wk = prefs.streakMode === 'weekly';
        root.querySelector('.yu').classList.toggle('is-streak-off', off);
        $('.yu-st').hidden = off;
        $('[data-stat-first]').innerHTML = firstStat();
        $('.yu-days').hidden = !wk; $('[data-wk-note]').hidden = !wk;
        $('[data-breaks-row]').hidden = off;
        $('#yu-h-smode').textContent = streakHelp();
      };
      applyStreakMode();

      /* ---------- Planned breaks ---------- */
      const drawBreaks = () => {
        $('#yu-h-breaks').textContent = breaksHelp();
        $('[data-breaks]').innerHTML = breaksList();
        const b = $('[data-act="break"]'); b.disabled = breaksLeft() <= 0;
        /* Sunday 4 October is the one day still to come on the calendar */
        const booked = prefs.breaks.some(br => Date.parse(BREAK_MIN + 'T00:00:00Z') >= brStart(br) && Date.parse(BREAK_MIN + 'T00:00:00Z') <= brEnd(br));
        $$('.yu-day.future[data-i]').forEach(c => {
          c.classList.toggle('booked', booked);
          const [v, day] = calLabel(+c.dataset.i);
          c.dataset.tv = booked ? 'Break booked' : v; c.dataset.td = booked ? 'streak kept' : '';
          c.setAttribute('aria-label', booked ? `${day}: break booked, streak kept` : `${day}: ${v.toLowerCase()}`);
          c.innerHTML = booked ? icon('rest') : '';
        });
        $('[data-key-booked]').hidden = !booked;
      };
      const breakSheet = () => {
        const left = breaksLeft();
        const close = Z.sheet(`<div class="yu-sh">
            <h2 class="t-sheet-title">Book a break</h2>
            <p class="t-body secondary">Days you book never break your streak. You have ${plural(left, 'day', 'days')} left this year.</p>
            <div class="yu-sh-form">
              <label class="yu-sh-f"><span class="t-label">First day</span>
                <input type="date" id="yu-br-from" min="${BREAK_MIN}" max="${BREAK_MAX}" value="2026-10-05" required aria-describedby="yu-br-sum"></label>
              <label class="yu-sh-f"><span class="t-label">Length</span>
                <select id="yu-br-days" aria-describedby="yu-br-sum">${Array.from({ length: left }, (_, k) => `<option value="${k + 1}" ${k + 1 === Math.min(5, left) ? 'selected' : ''}>${plural(k + 1, 'day', 'days')}</option>`).join('')}</select></label>
            </div>
            <p class="t-caption yu-sh-sum" id="yu-br-sum" aria-live="polite"></p>
            <div class="yu-sh-acts"><button type="button" class="btn" data-book>Book break</button><button type="button" class="btn secondary" data-close>Cancel</button></div>
          </div>`, { label: 'Book a break' });
        const from = document.getElementById('yu-br-from'), days = document.getElementById('yu-br-days'), sum = document.getElementById('yu-br-sum');
        const book = document.querySelector('.yu-sh [data-book]');
        if (!from || !days || !sum || !book) return;
        const check = () => {
          const v = from.value, n = +days.value, br = { from: v, days: n };
          let err = '';
          if (!v) err = 'Pick the first day of your break.';
          else if (v < BREAK_MIN) err = 'Breaks start from tomorrow, Sunday 4 October.';
          else if (isoDate(new Date(brEnd(br))) > BREAK_MAX) err = 'That runs into next year. This year’s days must end by 31 December.';
          else if (prefs.breaks.some(o => brStart(br) <= brEnd(o) && brStart(o) <= brEnd(br))) err = 'That overlaps a break you have already booked.';
          if (err) from.setAttribute('aria-invalid', 'true'); else from.removeAttribute('aria-invalid');
          sum.classList.toggle('is-err', !!err);
          sum.textContent = err || `${brRange(br)}. ${plural(left - n, 'day', 'days')} left after this.`;
          return err ? null : br;
        };
        from.addEventListener('input', check); days.addEventListener('change', check); check();
        book.addEventListener('click', () => {
          const br = check(); if (!br) { from.focus(); return; }
          prefs.breaks.push(br); prefs.breaks.sort((a, b) => (a.from < b.from ? -1 : 1)); savePrefs();
          close(); drawBreaks();
          Z.toast(`Break booked: ${esc(brRange(br))}.`);
        });
      };
      drawBreaks();

      /* ---------- Settings controls ---------- */
      const setLeagues = (on) => {
        prefs.leagues = on; L.league.optedIn = on; savePrefs();
        $('#yu-leagues').checked = on; $('#yu-nodem').disabled = !on;
        drawLeague();
      };
      const remindErr = $('#yu-remind-err'), remindAt = $('#yu-remind-at');
      listen(root, 'change', (e) => {
        const t = e.target;
        if (t.name === 'yu-theme') Z.setSetting('theme', t.value);
        else if (t.name === 'yu-motion') Z.setSetting('motion', t.value);
        else if (t.id === 'yu-sound') { Z.setSetting('sound', t.checked); Z.sound('tap'); }
        else if (t.id === 'yu-haptics') { Z.setSetting('haptics', t.checked); if (t.checked) Z.haptic(); }
        else if (t.name === 'yu-goal') {
          prefs.goal = +t.value; L.weeklyGoalH = prefs.goal; savePrefs(); drawGoal();
          $('#yu-h-goal').textContent = goalHelp(prefs.goal);
        } else if (t.id === 'yu-remind') {
          prefs.reminder = t.checked; savePrefs(); remindAt.disabled = !t.checked;
          /* Turning off drops an unsaved, invalid time, so the field shows the saved one when it comes back */
          if (!t.checked) { remindAt.value = prefs.reminderAt; remindErr.textContent = ''; remindAt.removeAttribute('aria-invalid'); }
        }
        else if (t.id === 'yu-remind-at') {
          const v = t.value;
          if (!v) return;
          if (v > '21:00') { t.setAttribute('aria-invalid', 'true'); remindErr.textContent = 'Reminders stop at 21:00. Pick an earlier time.'; }
          else { t.removeAttribute('aria-invalid'); remindErr.textContent = ''; prefs.reminderAt = v; savePrefs(); }
        } else if (t.name === 'yu-smode') {
          prefs.streakMode = t.value; savePrefs(); applyStreakMode();
        } else if (t.id === 'yu-sdays') { prefs.streakDays = +t.value; savePrefs(); $('#yu-h-smode').textContent = streakHelp(); }
        else if (t.id === 'yu-leagues') setLeagues(t.checked);
        else if (t.id === 'yu-nodem') { prefs.noDemotion = t.checked; savePrefs(); drawLeague(); }
      });

      /* Theme, motion and sound can also change from the prototype panel: keep the radios in step. */
      settingsSync = (s) => {
        const pick = (name, v) => { const r = root.querySelector(`input[name="yu-${name}"][value="${v}"]`); if (r) r.checked = true; };
        pick('theme', s.theme); pick('motion', s.motion);
        const so = root.querySelector('#yu-sound'); if (so) so.checked = !!s.sound;
        const ha = root.querySelector('#yu-haptics'); if (ha) ha.checked = s.haptics !== false;
      };
      if (!settingsHooked) { settingsHooked = true; Z.on('settings', (s) => settingsSync && settingsSync(s)); }

      /* QA hook for the screenshot harness */
      window.ZQYouDebug = { board: (open) => setBoard(open !== false, false), run: setRun, leagues: setLeagues, tip: (sel) => { const c = Array.from(root.querySelectorAll(sel)).find(n => n.offsetParent); if (c) { c.scrollIntoView({ block: 'center' }); c.focus(); showTip(c); } } };

      return () => { cleanups.forEach(f => f()); settingsSync = null; delete window.ZQYouDebug; };
    },
  });
})();
