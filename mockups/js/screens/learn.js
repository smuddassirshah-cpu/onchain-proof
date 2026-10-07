/* Learn: the catalogue.
   Spec: 7.3 Catalogue, 8.2 Stage > Topic > Course, 3 course art, 2.5 track accents, 4 motion, 9.2 voice.
   Curriculum: four stages with exit tests, topics by number, and the Stage 2 tracks (Trader, Researcher, Developer).
   Two views: Courses (stage selector, exit test, track tabs, topic cards of course cards) and Paths (Stage 2 tracks).
   Course states: Not started, In progress, Complete (course done, topic not yet), Exam ready (whole topic done),
   Passed, and Tested out (topic exam passed before the course was finished).
   Everything is scoped under .screen-learn and uses the zl- prefix. */
(function () {
  'use strict';

  /* Months at 15 h a week, as the curriculum map states them */
  const MONTHS = { 0: 8, 1: 21, 2: 12, 3: 6 };
  const TRACKS = ['all', 'maths', 'prob', 'code', 'fin', 'ml', 'speed'];
  const TRACK_WORD = { maths: 'maths', prob: 'probability and statistics', code: 'programming', fin: 'finance', ml: 'machine learning', speed: 'interview and speed' };
  const TOAST = 'Prototype: Conditional Probability has the full course map';

  /* One-line notes from the curriculum, shown under a topic head */
  const NOTES = (L) => ({
    '0.4': 'Run it alongside 0.1 to 0.3 from the first week.',
    '0.5': 'Ten minutes a day, from the first week.',
    '1.1': 'First, so every maths topic after it can be checked in code.',
    '1.5': 'The priority. Interviews test it hardest.',
    '1.7': 'Run it alongside 1.3 to 1.6.',
    '1.9': L.track === 'Developer' ? 'The core skill on your track. Give it at least double the hours.' : `On the ${L.track} track you can let it slip into Stage 2.`,
    '2.3': 'Do three properly, not five thinly.',
    '3.2': 'Hours not counted. For derivatives pricing and desk quant roles.',
  });
  /* Topics closed by something other than a timed exam */
  const CLOSE = {
    '0.5': ['timer', 'Target score 25 in 120\u00a0s'],
    '2.3': ['clipboard', 'Closed by three projects'],
    '2.4': ['target', 'Target rating 1,400'],
    '3.1': ['clipboard', 'Closed by a replication'],
  };
  const OPTIONAL = { '3.2': true };
  const examMinutes = (h) => (h <= 60 ? 45 : h <= 150 ? 60 : 90); // spec 8.2: topic exams run 45 to 90 min

  /* Stage 2 tracks, from the curriculum's track table. Steps are in study order. */
  const PATHS = [
    { id: 'Trader', tests: 'Probability, mental arithmetic, market-making and betting games',
      steps: [
        { course: 'opt-dash', tag: 'Project 3' },
        { course: 'contests', meta: 'Trading competitions' },
        { course: 'puzzles' },
        { course: 'mm-games' },
        { course: 'mental-pressure' },
      ] },
    { id: 'Researcher', tests: 'Probability, statistics, regression, machine learning, a data take-home',
      steps: [
        { topic: '2.1' },
        { topic: '2.2' },
        { course: 'backtest', tag: 'Project 1' },
        { course: 'alpha', tag: 'Project 2' },
        { topic: '3.1', meta: 'Paper replication' },
        { course: 'puzzles' },
      ] },
    { id: 'Developer', tests: 'Algorithms, C++, systems design',
      steps: [
        { topic: '1.9', meta: 'At least double: 280\u00a0h' },
        { course: 'contests', meta: 'Codeforces weekly' },
        { course: 'backtest', tag: 'Project 1' },
        { title: 'Live Market Data Handler', topicId: '2.3', meta: 'Project 4 · In C++', art: 'vol', track: 'fin' },
        { course: 'puzzles' },
      ] },
  ];

  /* View state lasts for this visit, so returning from a course keeps the stage and tab */
  const state = { stage: null, track: 'all', view: 'courses' };

  ZQ.screen({
    id: 'learn', title: 'Learn', group: 'App', shell: true, tab: 'learn',
    render(root, Z) {
      const D = Z.data(), L = D.learner, esc = Z.esc;
      const all = D.allCourses();
      if (state.stage == null) state.stage = L.stage;
      const reduced = Z.reducedMotion();
      const fmt = (n) => Number(n).toLocaleString('en-GB');
      const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
      const titleCase = (s) => s.replace(/(^|\s)([a-z])([a-z]*)/g, (m, sp, a, rest) => (/^(and|of|the|for|in)$/.test(a + rest) && sp ? m : sp + a.toUpperCase() + rest));
      const hrs = (n) => `${fmt(n)}\u00a0h`;
      const notes = NOTES(L);

      /* ---------- State helpers ---------- */
      const prog = (id) => Math.max(0, Math.min(1, L.progress[id] || 0));
      const passed = (t) => L.passed.includes(t.id);
      /* Readiness is topic-level: the topic exam covers every course in the topic */
      const topicDone = (t) => t.courses.every(c => prog(c.id) >= 1);
      const courseState = (c, t) => {
        const p = prog(c.id);
        if (passed(t)) return p >= 1 ? 'pass' : 'out';
        return p >= 1 ? (topicDone(t) ? 'ready' : 'done') : p > 0 ? 'prog' : 'none';
      };
      const topicState = (t) => (passed(t) ? 'pass' : topicDone(t) ? 'ready' : t.courses.some(c => prog(c.id) > 0) ? 'prog' : 'none');
      const ring = '<svg class="zl-ring" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="M8 2.5a5.5 5.5 0 0 1 0 11z"/></svg>';
      const dash = '<svg class="zl-ring is-empty" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/></svg>';
      const STATE = {
        none: ['Not started', dash],
        prog: ['In progress', ring],
        done: ['Complete', Z.icon('check', 'xs')],
        ready: ['Exam ready', Z.icon('shield', 'xs')],
        pass: ['Passed', Z.icon('check', 'xs')],
        out: ['Tested out', Z.icon('check', 'xs')],
      };
      const chip = (s, cls = '') => `<span class="zl-chip is-${s} ${cls}">${STATE[s][1]}<span>${STATE[s][0]}</span></span>`;
      const stageOf = (n) => D.stages.find(s => s.id === n);
      const inTrack = (t) => state.track === 'all' || t.track === state.track;

      /* ---------- Skeleton ---------- */
      root.innerHTML = `
        <div class="zl">
          <header class="zl-head">
            <h1 class="t-h1 zl-h1">Learn</h1>
            <p class="t-body secondary zl-desc">3,100 hours in four stages. Sit a stage’s exit test first to skip it.</p>
            <div class="zl-toggle" role="group" aria-label="View">
              <button type="button" data-view="courses">${Z.icon('grid', 'xs')}<span>Courses</span></button>
              <button type="button" data-view="paths">${Z.icon('target', 'xs')}<span>Paths</span></button>
            </div>
          </header>
          <div class="zl-courses">
            <div class="zl-stages" role="group" aria-label="Stage"></div>
            <div class="zl-exit-slot"></div>
            <div class="zl-tabs-wrap"><div class="zl-tabs" role="tablist" aria-label="Track"></div></div>
            <div class="zl-topics" role="tabpanel" id="zl-panel"></div>
          </div>
          <div class="zl-paths-view" hidden></div>
        </div>`;
      const $ = (s) => root.querySelector(s);
      const coursesEl = $('.zl-courses'), pathsEl = $('.zl-paths-view');
      const stagesEl = $('.zl-stages'), exitEl = $('.zl-exit-slot'), tabsEl = $('.zl-tabs'), topicsEl = $('.zl-topics');

      /* ---------- Stage selector ---------- */
      /* Segmented pill: "Stage n" only. A check marks a finished stage, a dot marks the learner's stage. */
      stagesEl.innerHTML = D.stages.map(s => `
        <button type="button" class="zl-stage" data-stage="${s.id}" title="${esc(s.name)} · ${fmt(s.hours)} hours">
          ${s.id < L.stage ? `<span class="zl-stage-ok" aria-hidden="true">${Z.icon('check', 'xs')}</span>` : ''}<span class="zl-stage-n">Stage ${s.id}</span><span class="sr-only">: ${esc(s.name)}${s.id < L.stage ? ', passed' : ''}</span>${s.id === L.stage ? '<i class="zl-you" aria-hidden="true"></i><span class="sr-only">, your stage</span>' : ''}
        </button>`).join('');

      const paintStages = () => stagesEl.querySelectorAll('[data-stage]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.stage === state.stage)));

      /* ---------- Exit test card ---------- */
      const renderExit = () => {
        const s = stageOf(state.stage);
        const done = s.id < L.stage; // "No exit test, no next stage": every stage before the learner's is passed
        const req = s.topics.filter(t => !OPTIONAL[t.id]);
        const nPassed = req.filter(passed).length;
        const opt = s.topics.filter(t => OPTIONAL[t.id]);
        const exit = /^[A-Z][a-z]/.test(s.exit) ? s.exit.charAt(0).toLowerCase() + s.exit.slice(1) : s.exit;
        const facts = [esc(s.name), hrs(s.hours), `<span class="zl-months">about ${MONTHS[s.id]}\u00a0months at ${L.weeklyGoalH}\u00a0h a week</span>`,
          done ? 'Exit test passed' : `${nPassed} of ${req.length} topics passed`, ...(opt.length ? [`${opt.map(t => t.id).join(', ')} optional`] : [])];
        const act = done
          ? `${chip('pass', 'lg')}<button type="button" class="link-btn zl-link" data-result>See results</button>`
          : s.id === 2
            ? '<button type="button" class="btn secondary" data-projects>Check your projects</button><button type="button" class="link-btn zl-link zl-tolink" data-view="paths">See the three paths</button>'
            : '<button type="button" class="btn secondary" data-exam>Sit the exit test</button>';
        exitEl.innerHTML = `
          <section class="card zl-exit${done ? ' is-done' : ''}" aria-label="Stage ${s.id} exit test">
            <span class="zl-exit-ico" aria-hidden="true">${Z.icon(done ? 'check' : s.id === 2 ? 'clipboard' : 'shield')}</span>
            <div class="zl-exit-t">
              <p class="zl-exit-p"><b>Exit test:</b> ${esc(exit)}</p>
              <p class="t-caption secondary tnum zl-facts">${facts.join('<span class="zl-dot" aria-hidden="true"> · </span>')}</p>
            </div>
            <div class="zl-exit-act">${act}</div>
          </section>`;
      };

      /* ---------- Track tabs ---------- */
      const renderTabs = () => {
        const s = stageOf(state.stage);
        tabsEl.innerHTML = TRACKS.map(k => {
          const n = k === 'all' ? s.topics.length : s.topics.filter(t => t.track === k).length;
          const name = k === 'all' ? 'All' : D.trackShort[k];
          const sel = state.track === k;
          return `<button type="button" role="tab" class="zl-tab${n ? '' : ' is-empty'}" id="zl-tab-${k}" data-tab="${k}" ${k === 'all' ? '' : `data-track="${k}"`}
            aria-selected="${sel}" aria-controls="zl-panel" tabindex="${sel ? 0 : -1}">${esc(name)}<span class="zl-ct tnum" aria-label="${n} topic${n === 1 ? '' : 's'}">${n}</span></button>`;
        }).join('');
        topicsEl.setAttribute('aria-labelledby', 'zl-tab-' + state.track);
        fadeEdges();
      };
      const paintTabs = () => {
        tabsEl.querySelectorAll('[data-tab]').forEach(b => { const on = b.dataset.tab === state.track; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
        topicsEl.setAttribute('aria-labelledby', 'zl-tab-' + state.track);
        const cur = tabsEl.querySelector('[aria-selected="true"]');
        if (cur) { // keep the selected tab in view inside the strip, without moving the page
          const l = cur.offsetLeft - tabsEl.offsetLeft, r = l + cur.offsetWidth;
          if (l < tabsEl.scrollLeft + 16) tabsEl.scrollTo({ left: Math.max(0, l - 24), behavior: reduced ? 'auto' : 'smooth' });
          else if (r > tabsEl.scrollLeft + tabsEl.clientWidth - 16) tabsEl.scrollTo({ left: r - tabsEl.clientWidth + 24, behavior: reduced ? 'auto' : 'smooth' });
        }
      };
      const fadeEdges = () => {
        const w = tabsEl.parentElement;
        w.classList.toggle('fade-r', tabsEl.scrollLeft + tabsEl.clientWidth < tabsEl.scrollWidth - 2);
        w.classList.toggle('fade-l', tabsEl.scrollLeft > 2);
      };
      tabsEl.addEventListener('scroll', fadeEdges, { passive: true });

      /* ---------- Course card ---------- */
      const card = (c, t) => {
        const p = prog(c.id), pct = Math.round(p * 100), s = courseState(c, t), cur = c.id === D.currentCourse.id;
        const label = `${c.name}. ${c.lessons} lessons, ${c.exercises} exercises. ${pct}% done. ${STATE[s][0]}.${cur ? ' Your current course.' : ''}`;
        return `<button type="button" class="zl-card${cur ? ' is-current' : ''}" data-track="${t.track}" data-course="${c.id}" aria-label="${esc(label)}">
            <span class="zl-art" aria-hidden="true">${ZQArt(c.art)}</span>
            <span class="zl-body">
              ${cur ? '<span class="zl-cur" aria-hidden="true">Current</span>' : ''}
              <span class="zl-title">${esc(c.name)}</span>
              <span class="zl-label tnum">${fmt(c.lessons)} lessons · ${fmt(c.exercises)} exercises</span>
              <span class="zl-foot"><span class="bar thin track" aria-hidden="true"><i data-w="${pct}"></i></span>${chip(s)}</span>
            </span>
          </button>`;
      };

      /* ---------- Topic sections ---------- */
      const topicHead = (t) => {
        const st = topicState(t), lessons = t.courses.reduce((a, c) => a + c.lessons, 0);
        const opt = OPTIONAL[t.id];
        let close;
        if (opt) close = '';
        else if (CLOSE[t.id]) close = `<span class="zl-close">${Z.icon(CLOSE[t.id][0], 'xs')}<span>${esc(CLOSE[t.id][1])}</span></span>`;
        else {
          const min = examMinutes(t.hours), next = L.nextExam && L.nextExam.topic === t.id;
          const sub = st === 'pass' ? 'See results' : next ? `${Math.round(L.nextExam.readiness * 100)}% ready` : `${min} min`;
          const aria = st === 'pass' ? `Topic exam for ${t.id} ${t.name}: passed. See your results.`
            : `Topic exam for ${t.id} ${t.name}: ${min} minutes, timed, 70% to pass.${next ? ` You are ${Math.round(L.nextExam.readiness * 100)}% ready.` : ''} Sit it first to test out.`;
          close = `<button type="button" class="zl-exam-chip${st === 'pass' ? ' is-pass' : ''}" ${st === 'pass' ? 'data-result' : 'data-exam'} aria-label="${esc(aria)}">${Z.icon('shield', 'xs')}<span>Topic exam</span><span class="zl-sub">${sub}</span></button>`;
        }
        return `<div class="zl-topic-head">
            <div class="zl-topic-t">
              <span class="t-overline zl-ov">${esc(D.trackNames[t.track])}</span>
              <h2 class="zl-topic-h" id="zl-t-${t.id.replace('.', '-')}" tabindex="-1"><span class="zl-num tnum">${t.id}</span> ${esc(t.name)} <span class="zl-hrs tnum">· ${opt ? 'Optional' : hrs(t.hours)}</span></h2>
              <p class="zl-meta">${t.courses.length} course${t.courses.length === 1 ? '' : 's'} · ${lessons} lessons${notes[t.id] ? `<span class="zl-note">${esc(notes[t.id])}</span>` : ''}</p>
            </div>
            <div class="zl-topic-chips">${chip(st, 'lg')}${close}</div>
          </div>`;
      };

      const emptyState = () => {
        const k = state.track, word = TRACK_WORD[k];
        const where = D.stages.filter(s => s.topics.some(t => t.track === k)).map(s => s.id);
        const list = where.length === 1 ? `Stage ${where[0]}` : `Stages ${where.slice(0, -1).join(', ')} and ${where[where.length - 1]}`;
        const target = where.includes(L.stage) ? L.stage : (where.find(n => n > L.stage) ?? where[where.length - 1]);
        return `<div class="zl-empty" data-track="${k}">
            <span class="zl-empty-ico" aria-hidden="true">${Z.icon('learn')}</span>
            <h2 class="t-h2">Stage ${state.stage} has no ${esc(word)} topics</h2>
            <p class="t-body secondary">${esc(cap(word))} topics are in ${list}.</p>
            <button type="button" class="btn secondary" data-goto="${target}">Go to Stage ${target}</button>
          </div>`;
      };

      const fillBars = (scope) => {
        const bars = scope.querySelectorAll('.bar > i[data-w]');
        if (reduced) { bars.forEach(i => { i.style.width = i.dataset.w + '%'; }); return; }
        requestAnimationFrame(() => requestAnimationFrame(() => bars.forEach(i => { i.style.width = i.dataset.w + '%'; })));
      };

      /* mode: 'stage' rises in with the 80ms list stagger (spec 4.8); 'tab' is a 150ms cross-fade, no slide; '' is static */
      const renderTopics = (mode = '') => {
        const s = stageOf(state.stage);
        const topics = s.topics.filter(inTrack);
        const anim = reduced ? '' : mode;
        topicsEl.classList.toggle('zl-xfade', anim === 'tab');
        if (anim === 'tab') { topicsEl.style.animation = 'none'; void topicsEl.offsetWidth; topicsEl.style.animation = ''; }
        topicsEl.innerHTML = topics.length ? topics.map((t, i) => `
          <section class="zl-topic${anim === 'stage' ? ' enter' : ''}" data-track="${t.track}" aria-labelledby="zl-t-${t.id.replace('.', '-')}" ${anim === 'stage' ? `style="animation-delay:${Math.min(i, 5) * 80}ms"` : ''}>
            ${topicHead(t)}
            <div class="zl-grid">${t.courses.map(c => card(c, t)).join('')}</div>
          </section>`).join('') : emptyState();
        fillBars(topicsEl);
      };

      /* ---------- Paths view ---------- */
      const stepData = (s) => {
        if (s.topic) {
          const t = D.topic(s.topic);
          return { title: titleCase(t.name), meta: `${t.id} · ${s.meta || `${t.courses.length} courses · ${hrs(t.hours)}`}`, art: t.courses[0].art, track: t.track };
        }
        if (s.course) {
          const c = all.find(x => x.id === s.course);
          return { title: c.name, meta: `${c.topic}${s.tag ? ' · ' + s.tag : ''} · ${s.meta || `${c.lessons} lessons`}`, art: c.art, track: c.track };
        }
        return { title: s.title, meta: `${s.topicId} · ${s.meta}`, art: s.art, track: s.track };
      };
      const renderPaths = () => {
        const s2 = stageOf(2), s3 = stageOf(3), sto = D.topic('3.2'), ito = sto.courses[0];
        const exit3 = s3.exit;
        pathsEl.innerHTML = `
          <section class="zl-paths-intro" aria-labelledby="zl-paths-h">
            <span class="t-overline muted tnum">Stage 2 · ${esc(s2.name)} · <span class="zl-unit">${hrs(s2.hours)}</span></span>
            <h2 class="zl-paths-h" id="zl-paths-h">Choose a track before Stage 2</h2>
            <p class="t-body secondary">The three roles are interviewed differently, so each path makes different courses core. Every course stays open to you.</p>
          </section>
          <div class="zl-paths">${PATHS.map((p, pi) => {
            const mine = p.id === L.track;
            return `<section class="zl-path${mine ? ' is-mine' : ''}${reduced ? '' : ' enter'}" aria-labelledby="zl-p-${p.id}" ${reduced ? '' : `style="animation-delay:${pi * 80}ms"`}>
                <div class="zl-path-head">
                  <h3 class="zl-path-h" id="zl-p-${p.id}">${p.id}</h3>
                  ${mine ? '<span class="zl-mine">Your track</span>' : ''}
                </div>
                <div class="zl-tests">
                  <span class="t-overline muted">Interviews test</span>
                  <p class="t-body">${esc(p.tests)}</p>
                </div>
                <div class="zl-stack">
                  <span class="t-overline muted">Core, in order</span>
                  <ol class="zl-steps">${p.steps.map((st, i) => {
                    const d = stepData(st);
                    return `<li><button type="button" class="zl-step" data-track="${d.track}" data-step aria-label="${esc(`Step ${i + 1}: ${d.title}. ${d.meta}.`)}">
                        <span class="zl-step-n tnum" aria-hidden="true">${i + 1}</span>
                        <span class="zl-step-art" aria-hidden="true">${ZQArt(d.art)}</span>
                        <span class="zl-step-t"><span class="zl-step-name">${esc(d.title)}</span><span class="zl-step-meta tnum">${esc(d.meta)}</span></span>
                      </button></li>`;
                  }).join('')}</ol>
                </div>
              </section>`;
          }).join('')}</div>
          <section class="zl-opt card" data-track="${sto.track}" aria-labelledby="zl-opt-h">
            <div class="zl-opt-t">
              <div class="zl-opt-top"><span class="t-overline zl-ov">Stage 3 · ${esc(D.trackNames[sto.track])}</span><span class="zl-chip is-opt">Optional</span></div>
              <h2 class="zl-topic-h" id="zl-opt-h"><span class="zl-num tnum">3.2</span> ${esc(sto.name)}</h2>
              <p class="t-body secondary">Hours not counted. Needed for derivatives pricing and desk quant roles. Rarely tested for trading or statistical research roles.</p>
              <div class="zl-ito">${Z.tex("df(W_t) = f'(W_t)\\,dW_t + \\tfrac{1}{2}\\,f''(W_t)\\,dt", true)}<span class="t-caption secondary">Itô’s lemma for a function of Brownian motion. The ${Z.tex("\\tfrac{1}{2} f''(W_t)\\,dt")} term is what ordinary calculus misses.</span></div>
            </div>
            <button type="button" class="zl-step zl-opt-course" data-step aria-label="${esc(`${ito.name}. ${ito.lessons} lessons, ${ito.exercises} exercises. Optional.`)}">
              <span class="zl-step-art" aria-hidden="true">${ZQArt(ito.art)}</span>
              <span class="zl-step-t"><span class="zl-step-name">${esc(ito.name)}</span><span class="zl-step-meta tnum">${ito.lessons} lessons · ${ito.exercises} exercises</span></span>
              ${Z.icon('chevronR', 'sm')}
            </button>
          </section>
          <p class="t-caption secondary zl-paths-foot">All three paths end at the Stage 3 exit test: ${esc(exit3)}.</p>`;
      };

      /* ---------- View switching ---------- */
      const paintView = () => {
        root.querySelectorAll('.zl-toggle [data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
        const paths = state.view === 'paths';
        coursesEl.hidden = paths; pathsEl.hidden = !paths;
        if (paths && !pathsEl.childElementCount) renderPaths();
      };

      /* Keep the tab strip at the top of the viewport when a filter shrinks the list.
         stickTop reads the strip's sticky offset, which includes the safe-area inset. */
      const tabsWrap = $('.zl-tabs-wrap');
      const stickTop = () => parseFloat(getComputedStyle(tabsWrap).top) || 0;
      const stripTop = () => exitEl.getBoundingClientRect().bottom + window.scrollY + (parseFloat(getComputedStyle(coursesEl).rowGap) || 0) - stickTop();
      const settle = () => {
        const top = stripTop();
        if (window.scrollY > top + 1) window.scrollTo({ top, behavior: 'auto' });
      };
      /* Stage 2's exit is three projects: bring 2.3 Projects into view under the stuck strip */
      const showProjects = () => {
        if (!$('#zl-t-2-3')) setTrack('all');
        const h = $('#zl-t-2-3'); if (!h) return;
        const sec = h.closest('.zl-topic');
        const top = sec.getBoundingClientRect().top + window.scrollY - stickTop() - tabsWrap.offsetHeight - 12;
        window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
        h.focus({ preventScroll: true });
      };

      const setStage = (n) => {
        if (n === state.stage) return;
        state.stage = n; paintStages(); renderExit(); renderTabs(); renderTopics('stage'); settle();
      };
      const setTrack = (k) => {
        if (k === state.track) return;
        state.track = k; paintTabs(); renderTopics('tab'); settle();
      };

      /* ---------- Events ---------- */
      const onClick = (e) => {
        const b = e.target.closest('button'); if (!b || !root.contains(b)) return;
        if (b.dataset.stage != null) { setStage(+b.dataset.stage); return; }
        if (b.dataset.tab) { setTrack(b.dataset.tab); return; }
        if (b.dataset.goto != null) { setStage(+b.dataset.goto); stagesEl.querySelector(`[data-stage="${b.dataset.goto}"]`)?.focus(); return; }
        if (b.dataset.view) {
          const was = state.view; state.view = b.dataset.view; paintView();
          if (was !== state.view && b.classList.contains('zl-tolink')) { window.scrollTo(0, 0); root.querySelector('.zl-toggle [data-view="paths"]').focus(); }
          return;
        }
        if (b.hasAttribute('data-result')) { Z.go('exam-result'); return; }
        if (b.hasAttribute('data-exam')) { Z.go('exam'); return; }
        if (b.hasAttribute('data-projects')) { showProjects(); return; }
        if (b.dataset.course) {
          if (b.dataset.course === D.currentCourse.id) Z.go('course');
          else Z.toast(TOAST);
          return;
        }
        if (b.hasAttribute('data-step')) Z.toast(TOAST);
      };
      root.addEventListener('click', onClick);

      /* Arrow keys move between track tabs (automatic activation) */
      tabsEl.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' };
        if (!(e.key in keys)) return;
        e.preventDefault();
        const i = TRACKS.indexOf(state.track), k = keys[e.key];
        const j = k === 'first' ? 0 : k === 'last' ? TRACKS.length - 1 : (i + k + TRACKS.length) % TRACKS.length;
        setTrack(TRACKS[j]);
        tabsEl.querySelector(`[data-tab="${TRACKS[j]}"]`)?.focus();
      });

      const onResize = () => fadeEdges();
      window.addEventListener('resize', onResize);

      paintStages(); renderExit(); renderTabs(); renderTopics(); paintView();
      requestAnimationFrame(paintTabs);

      return () => { window.removeEventListener('resize', onResize); };
    },
  });
})();
