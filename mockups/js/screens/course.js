/* Course map for the current course (spec 7.4; progress and celebration motion 4.6, 4.7; glyphs 3).
   Desktop: course card on the left, 575px path column on the right. Mobile: the header stacks above the path.
   Nodes are tilted pucks on a sine serpentine with no connector lines. Tapping a node opens a card
   anchored to the bottom of the path column (desktop) or a bottom sheet (mobile).
   Hand-offs: the map sets window.ZQLaunch to the id it launches; the lesson player sets window.ZQFlash
   ('streak' when the lesson extended the streak) and the map completes the launched node on return. */
(function () {
  'use strict';

  /* Serpentine: a sine sampled every quarter period. Each node steps 13.5% of the column and
     centres swing between 20% and 47% of it (spec: about 13% per node, between about 20% and 50%). */
  const xAt = (g) => 0.335 + 0.135 * Math.sin(g * Math.PI / 2);

  /* Best lesson-quiz scores, [score, items] (example data). 80% or more marks a lesson Mastered (spec 8.2). */
  const QUIZ = { l1: [5, 5], l2: [4, 5] };
  const mins = (screens) => Math.round(screens * 1.2);

  /* Puck geometry in a 100-unit-wide box: elliptical face 2.1:1, side band 12% of the width. */
  const RY = 23.81, BAND = 12, VH = 59.62;

  /* The course lists 26 lessons, but data.js holds 18 nodes. These fill the levels to 6, 7, 6 and 7 lessons
     (spec 8.2: 4 to 7 per level), each inserted after the id named. Skipped once data.js carries 26. */
  const EXTRA = [
    ['l5', { kind: 'lesson', id: 'x6', name: 'Adding up the branches', status: 'upcoming', screens: 11 }],
    ['l10', { kind: 'lesson', id: 'x12', name: 'Many hypotheses at once', status: 'upcoming', screens: 11 }],
    ['l12', { kind: 'lesson', id: 'x15', name: 'Independent trials', status: 'upcoming', screens: 10 }],
    ['x15', { kind: 'lesson', id: 'x16', name: 'The gambler’s fallacy', status: 'upcoming', screens: 9 }],
    ['l16', { kind: 'lesson', id: 'x21', name: 'Bertrand’s box', status: 'upcoming', screens: 10 }],
    ['l17', { kind: 'lesson', id: 'x23', name: 'The boy born on a Tuesday', status: 'upcoming', screens: 11 }],
    ['l18', { kind: 'lesson', id: 'x25', name: 'Simpson’s paradox', status: 'upcoming', screens: 12 }],
    ['x25', { kind: 'lesson', id: 'x26', name: 'Survivorship bias', status: 'upcoming', screens: 10 }],
  ];

  /* Item pool for level checks and level reviews. lv: level; n: the lesson (course position) it draws on.
     Every answer checked by enumeration. */
  const fr = (a, b) => `$\\dfrac{${a}}{${b}}$`;
  const CHECK = [
    { lv: 1, n: 1, q: 'A card is drawn from a standard 52-card deck. You are told it is a heart. What is the probability it is the queen of hearts?',
      o: [fr(1, 52), fr(1, 13), fr(1, 4), fr(4, 13)], a: 1, why: 'Only the 13 hearts are left in play, and one of them is the queen.' },
    { lv: 1, n: 2, q: 'Two fair coins are flipped. At least one shows heads. What is the probability that both do?',
      o: [fr(1, 4), fr(1, 3), fr(1, 2), fr(3, 4)], a: 1, why: 'HH, HT and TH are left, equally likely. One of the three is HH.' },
    { lv: 1, n: 2, q: 'A bag holds 4 red and 6 blue counters. You draw a blue one and keep it out. What is the probability the next counter is red?',
      o: [fr(2, 5), fr(4, 9), fr(1, 2), fr(5, 9)], a: 1, why: '9 counters are left, and 4 of them are red.' },
    { lv: 1, n: 3, q: 'You roll a fair die and are told the result is even. What is the probability it is a 6?',
      o: [fr(1, 6), fr(1, 3), fr(1, 2), fr(2, 3)], a: 1, why: 'Only 2, 4 and 6 are left, and one of the three is a 6.' },
    { lv: 1, n: 3, q: 'Roll two fair dice. The total is 5. What is the probability the first die shows 1?',
      o: [fr(1, 6), fr(1, 5), fr(1, 4), fr(1, 2)], a: 2, why: 'Four pairs total 5: $(1,4)$, $(2,3)$, $(3,2)$ and $(4,1)$. One of them starts with a 1.' },
    { lv: 1, n: 4, q: 'A bag holds 3 red and 2 blue counters. You draw two without replacement. What is the probability both are red?',
      o: [fr(9, 25), fr(3, 10), fr(2, 5), fr(3, 5)], a: 1, why: '$\\tfrac{3}{5} \\times \\tfrac{2}{4} = \\tfrac{3}{10}$. The second draw has one red fewer.' },
    { lv: 1, n: 4, q: '$P(A) = 0.5$ and $P(B \\mid A) = 0.4$. What is $P(A \\cap B)$?',
      o: ['$0.2$', '$0.4$', '$0.8$', '$0.9$'], a: 0, why: '$P(A \\cap B) = P(A)\\,P(B \\mid A) = 0.5 \\times 0.4 = 0.2$.' },
    { lv: 1, n: 5, q: 'Flip a fair coin. On heads, roll a fair die. On tails, stop. What is the probability of heads and then a 6?',
      o: [fr(1, 12), fr(1, 7), fr(1, 6), fr(7, 12)], a: 0, why: 'Multiply along the branch: $\\tfrac{1}{2} \\times \\tfrac{1}{6} = \\tfrac{1}{12}$.' },
    { lv: 1, n: 6, q: 'Box 1 holds 2 red and 2 blue counters. Box 2 holds 1 red and 3 blue. You pick a box at random and draw one counter. What is the probability it is red?',
      o: [fr(1, 4), fr(3, 8), fr(1, 2), fr(3, 4)], a: 1, why: 'Add the two branches: $\\tfrac{1}{2} \\times \\tfrac{2}{4} + \\tfrac{1}{2} \\times \\tfrac{1}{4} = \\tfrac{3}{8}$.' },
    { lv: 2, n: 7, q: '$P(A) = 0.2$, $P(B \\mid A) = 0.5$ and $P(B) = 0.25$. What is $P(A \\mid B)$?',
      o: ['$0.1$', '$0.4$', '$0.5$', '$0.625$'], a: 1, why: '$P(A \\mid B) = \\tfrac{0.5 \\times 0.2}{0.25} = 0.4$.' },
    { lv: 2, n: 8, q: 'A condition affects 1 in 1,000 people. A test catches every case but also flags 5% of healthy people. You test positive. Roughly what is the chance you have the condition?',
      o: ['$2\\%$', '$5\\%$', '$50\\%$', '$95\\%$'], a: 0, why: 'Out of 1,000 people, 1 is ill and tests positive, and about 50 healthy people test positive too. That is about 1 in 51.' },
    { lv: 2, n: 9, q: '10% of signals are real. A filter passes 80% of real signals and 10% of false ones. A signal passes. What is the probability it is real?',
      o: [fr(1, 10), fr(8, 17), fr(1, 2), fr(4, 5)], a: 1, why: 'Out of 100 signals, 8 real ones pass and 9 false ones pass, so $\\tfrac{8}{17}$.' },
    { lv: 2, n: 10, q: 'The prior odds are $1:4$. The evidence is 3 times as likely if the claim is true. What is the posterior probability?',
      o: [fr(1, 4), fr(3, 7), fr(3, 5), fr(3, 4)], a: 1, why: 'The posterior odds are $3:4$, so the probability is $\\tfrac{3}{7}$.' },
    { lv: 2, n: 11, q: 'The prior odds are $1:1$. Two clues arrive, independent given the truth, and each is twice as likely if the claim is true. What is the posterior probability?',
      o: [fr(1, 2), fr(2, 3), fr(3, 4), fr(4, 5)], a: 3, why: 'Each clue doubles the odds, so $1:1$ becomes $4:1$ and the probability is $\\tfrac{4}{5}$.' },
    { lv: 2, n: 12, q: 'One coin is fair, one has two heads and one has two tails. You pick one at random, flip it and see heads. What is the probability it is the two-headed coin?',
      o: [fr(1, 3), fr(1, 2), fr(2, 3), fr(3, 4)], a: 2, why: 'Heads has probability $\\tfrac{1}{3} \\times \\tfrac{1}{2} + \\tfrac{1}{3} \\times 1 = \\tfrac{1}{2}$, and the two-headed coin supplies $\\tfrac{1}{3}$ of it: $\\tfrac{1/3}{1/2} = \\tfrac{2}{3}$.' },
    { lv: 2, n: 13, q: 'Up and down days are equally likely. A signal fires on 70% of up days and 30% of down days. Today it fired. What is the probability today is an up day?',
      o: ['$0.5$', '$0.6$', '$0.7$', '$0.8$'], a: 2, why: '$\\tfrac{0.5 \\times 0.7}{0.5 \\times 0.7 + 0.5 \\times 0.3} = \\tfrac{0.35}{0.5} = 0.7$.' },
    { lv: 3, n: 14, q: '$A$ and $B$ are independent, with $P(A) = 0.3$ and $P(B) = 0.5$. What is $P(A \\cup B)$?',
      o: ['$0.15$', '$0.5$', '$0.65$', '$0.8$'], a: 2, why: '$0.3 + 0.5 - 0.3 \\times 0.5 = 0.65$.' },
    { lv: 3, n: 14, q: 'Roll two fair dice. $A$: the first die is even. $B$: the total is 7. What is $P(A \\mid B)$?',
      o: [fr(1, 12), fr(1, 6), fr(1, 3), fr(1, 2)], a: 3, why: 'Six outcomes total 7, and three of them start with an even number. Knowing $B$ tells you nothing about $A$.' },
    { lv: 3, n: 15, q: 'A strategy beats the market on 60% of days, independently from day to day. What is the probability it wins three days running?',
      o: ['$0.18$', '$0.216$', '$0.36$', '$0.6$'], a: 1, why: '$0.6^3 = 0.216$.' },
    { lv: 3, n: 15, q: 'Three independent trades each fail with probability $0.1$. What is the probability that at least one fails?',
      o: ['$0.1$', '$0.271$', '$0.3$', '$0.729$'], a: 1, why: 'None fail with probability $0.9^3 = 0.729$, so at least one fails with probability $1 - 0.729 = 0.271$.' },
    { lv: 3, n: 16, q: 'A fair coin has landed heads five times in a row. What is the probability the next flip is heads?',
      o: [fr(1, 64), fr(1, 32), fr(1, 2), fr(31, 32)], a: 2, why: 'The coin has no memory. Each flip is heads with probability $\\tfrac{1}{2}$, whatever came before.' },
    { lv: 3, n: 17, q: 'Flip two fair coins. $A$: the first is heads. $B$: the second is heads. $C$: the coins match. What is $P(A \\cap B \\cap C)$?',
      o: ['$0$', fr(1, 8), fr(1, 4), fr(1, 2)], a: 2, why: '$A \\cap B$ is HH, which already matches, so the answer is $\\tfrac{1}{4}$, not $\\tfrac{1}{8}$. Each pair is independent, but the three together are not.' },
    { lv: 3, n: 18, q: 'A coin is either fair or two-headed, equally likely. You flip it twice. What is the probability of two heads?',
      o: [fr(1, 4), fr(1, 2), fr(9, 16), fr(5, 8)], a: 3, why: 'Given the coin, the flips are independent: $\\tfrac{1}{2} \\times \\tfrac{1}{4} + \\tfrac{1}{2} \\times 1 = \\tfrac{5}{8}$. Without that condition they are not, so $\\left(\\tfrac{3}{4}\\right)^2$ is wrong.' },
    { lv: 4, n: 20, q: 'You pick door 1. The host, who knows where the car is and always opens a door with a goat, opens door 3. What is the probability the car is behind door 2?',
      o: [fr(1, 3), fr(1, 2), fr(2, 3), '$1$'], a: 2, why: 'Door 1 keeps its $\\tfrac{1}{3}$. The host never opens the car door, so door 2 takes the other $\\tfrac{2}{3}$.' },
    { lv: 4, n: 21, q: 'Three boxes hold two gold coins, two silver coins, and one of each. You pick a box at random and draw a gold coin. What is the probability the other coin in that box is gold?',
      o: [fr(1, 3), fr(1, 2), fr(2, 3), fr(3, 4)], a: 2, why: 'You were equally likely to draw any of the three gold coins, and two of them sit in the gold-and-gold box.' },
    { lv: 4, n: 22, q: 'A family has two children, each a boy or a girl with equal chance. At least one is a boy. What is the probability both are boys?',
      o: [fr(1, 4), fr(1, 3), fr(1, 2), fr(2, 3)], a: 1, why: 'BB, BG and GB are left, equally likely. One of the three is BB.' },
    { lv: 4, n: 23, q: 'A family has two children. At least one is a boy born on a Tuesday. What is the probability both are boys?',
      o: [fr(1, 3), fr(13, 27), fr(1, 2), fr(14, 27)], a: 1, why: 'Each child is one of 14 equally likely sex and weekday pairs. 27 of the 196 families have a Tuesday boy, and 13 of those have two boys.' },
    { lv: 4, n: 24, q: 'A blood type occurs in 1 in 1,000 people. There are 10,001 suspects, the culprit among them, and the culprit has this type. One suspect has it. With no other evidence, what is the probability they are the culprit?',
      o: [fr(1, 1000), fr(1, 11), fr(1, 2), fr(999, 1000)], a: 1, why: 'On average 10 of the 10,000 innocent suspects share the type, plus the culprit, so the match picks out 1 of 11.' },
    { lv: 4, n: 25, q: 'Desk A wins 80 of 100 small trades and 20 of 100 large ones. Desk B wins 9 of 10 small trades and 50 of 190 large ones. Which desk has the higher overall win rate?',
      o: ['Desk A', 'Desk B', 'They are equal', 'You cannot tell'], a: 0, why: 'Desk A wins 100 of 200 and desk B 59 of 200. B does better at each size, but most of its trades are the harder large ones.' },
    { lv: 4, n: 26, q: '64 funds have no skill: each beats the market in a year with probability $\\tfrac{1}{2}$, independently. How many do you expect to beat it five years running?',
      o: ['$0$', '$1$', '$2$', '$4$'], a: 2, why: '$64 \\times \\left(\\tfrac{1}{2}\\right)^5 = 2$. Look only at the survivors and luck looks like skill.' },
  ];

  /* Round-robin over lessons, most recent first, so a set spreads across what it covers. */
  const spread = (pool, k) => {
    const by = [...new Set(pool.map(c => c.n))].sort((a, b) => b - a).map(n => pool.filter(c => c.n === n));
    const out = [];
    for (let r = 0; out.length < k && by.some(g => g[r]); r++) by.forEach(g => { if (g[r] && out.length < k) out.push(g[r]); });
    return out.sort((a, b) => CHECK.indexOf(a) - CHECK.indexOf(b));
  };

  ZQ.screen({
    id: 'course', title: 'Course map', group: 'App', shell: true, tab: 'learn',
    render(root, Z) {
      const D = Z.data(), C = D.currentCourse, L = D.learner, esc = Z.esc;
      const topic = D.topic(C.topic);
      const courseIdx = topic.courses.findIndex(c => c.id === C.id);
      const next = topic.courses[courseIdx + 1];
      const last = topic.courses[topic.courses.length - 1];
      const deskMQ = matchMedia('(min-width: 768px)'), wideMQ = matchMedia('(min-width: 1024px)');
      const desk = () => deskMQ.matches;
      const timers = [];
      let alive = true;
      const later = (fn, ms) => timers.push(setTimeout(() => alive && fn(), ms));
      const pathOf = (name) => (Z.icon(name).match(/ d="([^"]+)"/) || [])[1] || '';
      const motion = () => (Z.reducedMotion() ? 'auto' : 'smooth');

      /* ---------- Levels and path entries ---------- */
      const lessonsIn = (lvs) => lvs.reduce((s, lv) => s + lv.items.filter(it => it.kind === 'lesson').length, 0);
      const levels = lessonsIn(C.levels) >= C.lessons ? C.levels : C.levels.map(lv => {
        const items = [];
        lv.items.forEach(it => {
          items.push(it);
          for (let id = it.id, x; (x = EXTRA.find(([after]) => after === id)); id = x[1].id) items.push(x[1]);
        });
        return { ...lv, items };
      });
      const flat = [];
      let count = 0;
      levels.forEach(lv => lv.items.forEach((it, j) => flat.push({ it, lv, j, g: flat.length, no: it.kind === 'lesson' ? ++count : 0 })));
      const byId = (id) => flat.find(e => e.it.id === id);
      const lastNo = (lv) => Math.max(0, ...flat.filter(e => e.lv === lv).map(e => e.no));
      const levelDone = (lv) => flat.every(e => e.lv !== lv || e.it.kind !== 'lesson' || e.it.status === 'done');

      /* Mark a node done and hand the halo to the next node not yet done. */
      const advance = (doneE) => {
        const nx = flat.slice(doneE.g + 1).find(e => e.it.status !== 'done');
        doneE.it.status = 'done';
        const nextE = nx && nx.it.status === 'upcoming' ? nx : null;
        if (nextE) nextE.it.status = 'current';
        return { doneE, nextE };
      };

      /* ---------- Returning from a lesson ---------- */
      const flash = window.ZQFlash, launched = window.ZQLaunch;
      window.ZQLaunch = null;
      const flashing = flash === 'streak' || flash === 'done';
      let view = {}; // id -> status drawn before the completion animation runs
      let finished = null;
      if (flashing) {
        window.ZQFlash = null;
        /* No launch id means the lesson was opened outside the map (Today's Continue plays the current lesson).
           A practice, a jump or a review launch does not move the learner's place. */
        const cur = flat.find(e => e.it.kind === 'lesson' && e.it.status === 'current');
        const id = launched || (cur && cur.it.id);
        const doneE = flat.find(e => e.it.id === id && e.it.status === 'current' && e.it.kind === 'lesson');
        if (doneE) {
          finished = advance(doneE);
          view[doneE.it.id] = 'current';
          if (finished.nextE) view[finished.nextE.it.id] = 'upcoming';
        }
        if (flash === 'streak' && !L.todayDone) { L.todayDone = true; L.streak += 1; L.__zcBumped = true; }
      }
      const shown = (e) => view[e.it.id] || e.it.status;
      const lessonsDone = (st = (e) => e.it.status) => flat.filter(e => e.it.kind === 'lesson' && st(e) === 'done').length;
      L.progress[C.id] = lessonsDone() / C.lessons;
      const pct = (n) => Math.round(n / C.lessons * 100);

      const mastered = (it) => it.kind === 'lesson' && it.status === 'done' && (it.mastered || (QUIZ[it.id] && QUIZ[it.id][0] / QUIZ[it.id][1] >= 0.8));
      const kindName = (e) => e.it.kind === 'lesson' ? `Lesson ${e.no}` : e.it.kind === 'review' ? `Level ${e.lv.n} review` : e.it.name;
      const ariaFor = (e, st) => {
        const it = e.it;
        const what = it.kind === 'lesson' ? `Lesson ${e.no}, ${it.name}` : it.kind === 'review' ? `Level ${e.lv.n} review` : `${it.name}, level ${e.lv.n}`;
        const state = st === 'done' ? (mastered(it) ? 'Done, mastered' : 'Done') : st === 'current' ? 'Up next' : 'Not started';
        return `${what}. ${state}.`;
      };

      /* ---------- Puck ---------- */
      const puck = (kind) => {
        const star = pathOf('star');
        let glyph = '';
        if (kind === 'lesson') glyph = `<g transform="translate(50 ${RY}) scale(1 0.62)"><g class="zc-gpop zc-tick"><path class="zc-emb" d="M-12 0L-4 8L13-9"/><path class="zc-chk" d="M-12 0L-4 8L13-9"/></g></g>`;
        if (kind === 'review') glyph = `<g transform="translate(50 ${RY}) scale(1.4 0.86) translate(-12 -12)"><path class="zc-semb" d="${star}" transform="translate(0 2)"/><path class="zc-star" d="${star}"/></g>`;
        if (kind === 'homework') glyph = `<g transform="translate(50 ${RY + 0.6}) scale(1.35 0.82) translate(-12 -12.5)"><path class="zc-clip" d="${pathOf('clipboard')}"/></g>`;
        const mstar = kind === 'lesson' ? `<g class="zc-mstar" transform="translate(72 14) scale(0.6) translate(-12 -12)"><path d="${star}"/></g>` : '';
        return `<svg class="zc-puck" viewBox="0 0 100 ${VH}" aria-hidden="true" focusable="false">
          <path class="zc-side" d="M0 ${RY}V${RY + BAND}A50 ${RY} 0 0 0 100 ${RY + BAND}V${RY}Z"/>
          <path class="zc-shade" d="M0 ${RY + BAND - 2.5}V${RY + BAND}A50 ${RY} 0 0 0 100 ${RY + BAND}V${RY + BAND - 2.5}A50 ${RY} 0 0 1 0 ${RY + BAND - 2.5}Z"/>
          <g class="zc-top">
            <ellipse class="zc-face" cx="50" cy="${RY}" rx="50" ry="${RY}"/>
            <ellipse class="zc-fill" cx="50" cy="${RY}" rx="50" ry="${RY}"/>
            <ellipse class="zc-glow" cx="50" cy="${RY}" rx="50" ry="${RY}" fill="url(#zc-glow)"/>
            <ellipse class="zc-ring" cx="50" cy="${RY}" rx="37" ry="${(RY * 0.74).toFixed(2)}" pathLength="120"/>
            ${glyph}${mstar}
          </g></svg>`;
      };
      const nodeCls = (e, st) => `zc-node k-${e.it.kind} s-${st}${st === 'done' && mastered(e.it) ? ' is-m' : ''}`;
      const node = (e) => {
        const st = shown(e);
        return `<li><button type="button" class="${nodeCls(e, st)}" data-id="${e.it.id}" style="--x:${xAt(e.g).toFixed(4)};--i:${e.j}" aria-label="${esc(ariaFor(e, st))}">
          <span class="zc-pw">
            <span class="zc-halo" aria-hidden="true"><i></i></span>
            <span class="zc-beam" aria-hidden="true"></span>
            ${puck(e.it.kind)}
            <span class="zc-mark" aria-hidden="true"><span>${Z.mark()}</span></span>
          </span>
          <span class="zc-title">${esc(e.it.name)}</span>
        </button></li>`;
      };

      /* ---------- Page ---------- */
      const stats = (c) => `<span>${Z.icon('learn', 'sm')} ${c.lessons} lessons</span><span aria-hidden="true">·</span><span>${Z.icon('edit', 'sm')} ${c.exercises} exercises</span>`;
      const p0 = pct(lessonsDone(shown));
      root.innerHTML = `
      <div class="zc" data-track="${C.track}">
        <svg class="zc-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
          <radialGradient id="zc-glow" cx="50%" cy="42%" r="58%"><stop offset="0" style="stop-color:var(--zc-glow);stop-opacity:0.95"/><stop offset="0.55" style="stop-color:var(--zc-glow);stop-opacity:0.6"/><stop offset="1" style="stop-color:var(--zc-glow);stop-opacity:0"/></radialGradient>
        </defs></svg>
        <div class="zc-topbar">
          <button type="button" class="icon-btn zc-back" aria-label="Back to Learn">${Z.icon('chevronL')}</button>
          <button type="button" class="streak-pill" data-zc-streak aria-label="Streak ${L.__zcBumped ? L.streak - 1 : L.streak} days">${L.__zcBumped ? L.streak - 1 : L.streak}${Z.bolt(L.__zcBumped ? false : L.todayDone)}<span class="rest-slots">${[0, 1].map(i => `<i class="${i < L.restDays ? 'on' : ''}"></i>`).join('')}</span></button>
        </div>
        <aside class="zc-course card" aria-labelledby="zc-title">
          <div class="zc-art">${ZQArt(C.art, { label: 'A probability tree' })}</div>
          <div class="zc-course-body">
            <span class="chip track">${esc(topic.id)} ${esc(topic.name)}</span>
            <h1 class="t-course-title" id="zc-title">${esc(C.name)}</h1>
            <p class="t-body secondary zc-desc">${esc(C.description)}</p>
            <p class="t-label zc-stats">${stats(C)}</p>
            <div class="zc-prog">
              <div class="bar thin track" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p0}"><i style="width:${p0}%"></i></div>
              <span class="t-caption muted tnum zc-pct">${p0}% complete</span>
            </div>
            <button type="button" class="btn track block zc-continue">Continue course</button>
          </div>
        </aside>
        <div class="zc-col">
          ${levels.map(lv => {
            const es = flat.filter(e => e.lv === lv);
            return `<section class="zc-level" aria-labelledby="zc-lv${lv.n}">
              <div class="zc-lvwrap"><div class="zc-lvcard"><div class="t-overline zc-deep">Level ${lv.n}</div><h2 class="t-h2" id="zc-lv${lv.n}">${esc(lv.name)}</h2></div></div>
              <ol class="zc-path" style="--n:${es.length}">${es.map(node).join('')}</ol>
            </section>`;
          }).join('')}
          <div class="zc-end">
            ${next ? `<button type="button" class="zc-next card" data-zc-next>
              <span class="zc-next-art">${ZQArt(next.art, { label: '' })}</span>
              <span class="zc-next-text"><span class="t-overline zc-deep">Next course</span><span class="t-sheet-title">${esc(next.name)}</span><span class="t-caption muted">${next.lessons} lessons · ${next.exercises} exercises</span></span>
              <span class="zc-next-go">${Z.icon('chevronR')}</span>
            </button>` : ''}
            <div class="zc-exam">
              <span class="zc-exam-ic">${Z.icon('shield')}</span>
              <p class="t-body"><b>The ${esc(topic.id)} ${esc(topic.name)} exam</b> unlocks after ${esc(last.name)}, the last course in this topic. Know it already? <button type="button" class="link-btn zc-testout">Sit it now to test out</button></p>
            </div>
          </div>
        </div>
        <div class="zc-pop" hidden>
          <div class="zc-pop-glow" aria-hidden="true"></div>
          <div class="zc-pop-card" role="dialog" aria-modal="false" aria-labelledby="zc-pop-title">
            <button type="button" class="icon-btn zc-pop-x" aria-label="Close">${Z.icon('close')}</button>
            <div class="zc-pop-body"></div>
          </div>
        </div>
        <button type="button" class="btn secondary round zc-tocur" hidden aria-label="Scroll to your current lesson">${Z.icon('chevronD')}</button>
      </div>`;

      const $ = (s) => root.querySelector(s);
      const col = $('.zc-col'), pop = $('.zc-pop'), popCard = $('.zc-pop-card'), popBody = $('.zc-pop-body'), tocur = $('.zc-tocur');
      const nodeEl = (id) => col.querySelector(`.zc-node[data-id="${id}"]`);

      /* ---------- Launching: lessons and homework leave the map, reviews run in place ---------- */
      const goFor = (e) => {
        window.ZQLaunch = e.it.id;
        Z.go(e.it.kind === 'homework' ? 'homework' : 'lesson');
      };
      const launch = (e) => {
        if (!e) return;
        Z.sound('tap');
        if (e.it.kind === 'review') openCheck(e, 'review');
        else if (e.it.kind !== 'homework' || e.lv.n === 1) goFor(e);
      };

      /* ---------- Node card: content shared by the desktop card and the mobile sheet ---------- */
      const pearStar = `<svg class="zc-pstar" viewBox="0 0 24 24" aria-hidden="true"><path d="${pathOf('star')}"/></svg>`;
      const actFor = (e) => {
        const it = e.it, st = it.status;
        if (it.kind === 'homework') {
          /* The prototype's homework player holds Homework 1 only */
          if (e.lv.n !== 1) return { key: 'none', label: 'Start', cap: levelDone(e.lv) ? 'This prototype plays Homework 1 only.' : `Opens when Level ${e.lv.n} is done` };
          if (st === 'done') return { key: 'start', label: 'See your answers' };
          return st === 'current' || levelDone(e.lv) ? { key: 'start', label: 'Start' } : { key: 'jump', label: 'Jump here' };
        }
        if (st === 'current') return { key: 'start', label: 'Start' };
        if (st === 'done') return { key: 'start', label: `${Z.icon('replay')}Practise` };
        return { key: it.kind === 'review' ? 'start' : 'jump', label: 'Jump here' };
      };
      const fillInfo = (body, e, close) => {
        const it = e.it, st = it.status;
        const over = `Level ${e.lv.n} · ${it.kind === 'lesson' ? `Lesson ${e.no}` : it.kind === 'review' ? 'Review' : 'Homework'}`;
        const title = it.kind === 'review' ? `Level ${e.lv.n} review` : it.name;
        const meta = it.kind === 'review' ? `Mixed problems from Level ${e.lv.n} · 8 problems · about 10 min`
          : it.kind === 'homework' ? '8 problems · due 7 days after you start'
          : `${it.screens} screens · about ${mins(it.screens)} min`;
        const q = QUIZ[it.id];
        const score = it.kind === 'lesson' && st === 'done' && q ? `<div class="zc-score">
            <span class="t-label">Best quiz score <b class="tnum">${q[0]} of ${q[1]}</b></span>
            ${mastered(it) ? `<span class="zc-mchip">${pearStar}Mastered</span>` : `<span class="t-caption muted">Score ${Math.ceil(q[1] * 0.8)} of ${q[1]} to master it</span>`}
          </div>` : '';
        const act = actFor(e);
        body.innerHTML = `<div class="zc-info">
          <div class="t-overline zc-deep">${over}</div>
          <h2 class="t-sheet-title" id="zc-pop-title">${esc(title)}</h2>
          <p class="t-body secondary zc-meta">${meta}</p>
          ${score}
          <button type="button" class="btn track lg block" data-act="${act.key}"${act.cap ? ' disabled aria-describedby="zc-cap"' : ''}>${act.label}</button>
          ${act.cap ? `<p class="t-caption muted zc-cap" id="zc-cap">${esc(act.cap)}</p>` : ''}
        </div>`;
        body.querySelector('[data-act]').addEventListener('click', () => {
          if (act.key === 'none') return;
          if (act.key === 'jump') return fillOffer(body, e, close);
          if (it.kind === 'review') close();
          launch(e);
        });
      };
      const fillOffer = (body, e, close) => {
        body.innerHTML = `<div class="zc-info enter">
          <div class="t-overline zc-deep">Jump ahead</div>
          <h2 class="t-sheet-title" id="zc-pop-title">Take a quick level check first?</h2>
          <p class="t-body secondary zc-meta">Five questions on what ${esc(kindName(e))} builds on. It takes about 4 minutes, and you can jump whatever you score.</p>
          <button type="button" class="btn track lg block" data-check>Take the level check</button>
          <button type="button" class="link-btn zc-skip" data-skip>Skip the check</button>
        </div>`;
        body.querySelector('[data-check]').addEventListener('click', () => { close(); openCheck(e, 'jump'); });
        body.querySelector('[data-skip]').addEventListener('click', () => { Z.sound('tap'); goFor(e); });
        body.querySelector('[data-check]').focus({ preventScroll: true });
      };

      /* ---------- Desktop card anchored to the bottom of the path column ---------- */
      let selected = null, closeSheet = null;
      const place = () => {
        const r = col.getBoundingClientRect();
        if (desk()) {
          pop.style.left = r.left + 'px'; pop.style.width = r.width + 'px';
          tocur.style.left = (r.right - 48) + 'px'; tocur.style.right = 'auto';
          tocur.style.bottom = pop.hidden ? '' : (popCard.offsetHeight + 40) + 'px';
        } else {
          tocur.style.left = ''; tocur.style.right = ''; tocur.style.bottom = '';
        }
      };
      /* Keep the tapped node clear of the card, including after the card grows */
      const keepClear = (btn) => {
        const nb = btn.getBoundingClientRect(), cardTop = popCard.getBoundingClientRect().top;
        if (nb.bottom > cardTop - 16) window.scrollBy({ top: nb.bottom - cardTop + 48, behavior: motion() });
      };
      const unselect = () => { if (selected) { selected.classList.remove('is-sel'); selected.removeAttribute('aria-expanded'); } };
      const closePop = (refocus) => {
        if (pop.hidden) return;
        pop.hidden = true; popBody.innerHTML = '';
        const s = selected; unselect(); selected = null; place();
        if (refocus && s) s.focus({ preventScroll: true });
      };
      const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { place(); if (selected && !pop.hidden && desk()) keepClear(selected); }) : null;
      if (ro) ro.observe(popCard);
      const openNode = (btn) => {
        const e = byId(btn.dataset.id);
        Z.sound('tap');
        unselect(); selected = btn; btn.classList.add('is-sel'); btn.setAttribute('aria-expanded', 'true');
        if (desk()) {
          fillInfo(popBody, e, () => closePop(true));
          pop.hidden = false;
          popCard.classList.remove('zc-in'); void popCard.offsetWidth; popCard.classList.add('zc-in');
          place();
          (popBody.querySelector('[data-act]:not(:disabled)') || $('.zc-pop-x')).focus({ preventScroll: true });
          if (!ro) keepClear(btn);
        } else {
          const body = Z.h(`<div class="zc-sheet" data-track="${C.track}"></div>`);
          let closer = null;
          fillInfo(body, e, () => closer && closer());
          closer = closeSheet = Z.sheet(body, { label: e.it.kind === 'review' ? `Level ${e.lv.n} review` : e.it.name, onClose: () => { unselect(); selected = null; closeSheet = null; } });
        }
      };
      $('.zc-pop-x').addEventListener('click', () => closePop(true));

      /* ---------- Level check (5 items before a jump) and level review (8 items), no hints, one try each ---------- */
      const pick = (e, mode) => {
        if (mode === 'review') {
          const own = spread(CHECK.filter(c => c.lv === e.lv.n), e.lv.n === 1 ? 8 : 6);
          const back = spread(CHECK.filter(c => c.lv < e.lv.n), 2);
          back.forEach((c, i) => own.splice(2 + i * 3, 0, c));
          return own;
        }
        const upTo = e.it.kind === 'lesson' ? e.no : lastNo(e.lv) + 1;
        return spread(CHECK.filter(c => c.n < upTo), 5);
      };
      const openCheck = (e, mode) => {
        const review = mode === 'review';
        const items = pick(e, mode), res = [];
        const wasCurrent = review && e.it.status === 'current';
        const box = Z.h(`<div class="zc-check" data-track="${C.track}"></div>`);
        let k = 0, ended = false;
        const head = () => `<div class="zc-check-head"><span class="t-overline zc-deep">${review ? `Level ${e.lv.n} review` : 'Level check'}</span>
          <span class="dots" aria-hidden="true">${items.map((_, i) => `<i class="${res[i] === true ? 'ok' : res[i] === false ? 'bad' : ''}${i === k && res[i] == null ? ' cur' : ''}"></i>`).join('')}</span></div>`;
        const showItem = () => {
          const it = items[k];
          let choice = null;
          box.innerHTML = `${head()}
            <div class="zc-check-q enter">
              <p class="t-caption muted">Question ${k + 1} of ${items.length}</p>
              <p class="t-prose zc-q">${Z.md(esc(it.q))}</p>
              <div class="opts two" role="group" aria-label="Answers">${it.o.map((o, i) => `<button type="button" class="opt" aria-pressed="false" data-i="${i}">${Z.md(esc(o))}</button>`).join('')}</div>
            </div>
            <div class="zc-check-foot"><div class="zc-verdict" aria-live="polite"></div><button type="button" class="btn" data-go disabled>Check</button></div>`;
          const opts = [...box.querySelectorAll('.opt')], go = box.querySelector('[data-go]'), verdict = box.querySelector('.zc-verdict');
          opts.forEach(b => b.addEventListener('click', () => {
            if (res[k] != null) return;
            opts.forEach(o => o.setAttribute('aria-pressed', 'false'));
            b.setAttribute('aria-pressed', 'true'); choice = +b.dataset.i; go.disabled = false;
          }));
          go.addEventListener('click', () => {
            if (res[k] == null) {
              if (choice == null) return;
              const ok = choice === it.a; res[k] = ok;
              opts.forEach((o, i) => {
                o.setAttribute('aria-pressed', 'false'); o.disabled = true;
                if (i === it.a && ok) { o.classList.add('correct'); o.insertAdjacentHTML('beforeend', `<span class="badge">${Z.icon('check')}</span>`); }
                else if (i === it.a) { o.classList.add('reveal'); o.insertAdjacentHTML('beforeend', '<span class="sr-only">, the right answer</span>'); }
                else if (i === choice) { o.classList.add('wrong'); o.insertAdjacentHTML('beforeend', `<span class="badge">${Z.icon('cross')}</span><span class="sr-only">, your answer</span>`); }
                else o.classList.add('dim');
              });
              verdict.innerHTML = ok
                ? `<span class="chip correct">${Z.icon('check', 'xs')}Correct</span><span class="t-body">${Z.md(esc(it.why))}</span>`
                : `<span class="chip notyet">${Z.icon('cross', 'xs')}Not quite right</span><span class="t-body">${Z.md(esc(it.why))}</span>`;
              Z.sound(ok ? 'correct' : 'notyet'); if (ok) Z.haptic();
              go.textContent = 'Continue'; go.className = ok ? 'btn correct' : 'btn';
              box.querySelector('.dots').outerHTML = head().match(/<span class="dots"[\s\S]*<\/span>/)[0];
              go.focus();
            } else { k++; if (k < items.length) showItem(); else showResult(); }
          });
        };
        const showResult = () => {
          ended = true;
          const s = res.filter(Boolean).length, n = items.length, miss = n - s, pass = s >= 4;
          const note = review
            ? (miss === 0 ? 'Every one right. This level is in good shape.' : `The ${miss === 1 ? 'one' : miss} you missed ${miss === 1 ? 'goes' : 'go'} to your redo queue for another try in a few days.`)
            : (pass ? 'You know this well enough to skip ahead.' : 'Some of this is new to you. You can still jump, and the lessons you skip stay on your map.');
          box.innerHTML = `${head()}
            <div class="zc-result enter">
              <div class="t-overline muted">Your score</div>
              <div class="t-stat tnum">${s} of ${n}</div>
              <p class="t-body secondary">${note}</p>
              ${review ? '' : `<button type="button" class="btn track lg block" data-jump>Jump to ${esc(kindName(e))}</button>`}
              <button type="button" class="btn ${review ? 'track lg' : 'secondary'} block" data-close>Back to the map</button>
            </div>`;
          const jump = box.querySelector('[data-jump]');
          if (jump) jump.addEventListener('click', () => { Z.sound('tap'); goFor(e); });
          (jump || box.querySelector('[data-close]')).focus();
        };
        showItem();
        Z.sheet(box, {
          label: review ? `Level ${e.lv.n} review` : 'Level check',
          onClose: () => { if (alive && ended && wasCurrent && e.it.status === 'current') complete(advance(e), false); },
        });
      };

      /* ---------- Scroll-to-current button ---------- */
      let io = null;
      const observe = () => {
        if (io) io.disconnect();
        const cur = col.querySelector('.zc-node.s-current .zc-pw');
        if (!cur || !('IntersectionObserver' in window)) { tocur.hidden = true; return; }
        const top = desk() ? 64 + 110 : 110, bottom = desk() ? 0 : 92;
        io = new IntersectionObserver(([en]) => {
          const off = !en.isIntersecting;
          tocur.hidden = !off;
          if (off) {
            const up = en.boundingClientRect.top < (en.rootBounds ? en.rootBounds.top : 0);
            tocur.innerHTML = Z.icon(up ? 'chevronU' : 'chevronD');
            place();
          }
        }, { rootMargin: `-${top}px 0px -${bottom}px 0px` });
        io.observe(cur);
      };
      tocur.addEventListener('click', () => {
        const cur = col.querySelector('.zc-node.s-current');
        if (!cur) return;
        cur.scrollIntoView({ block: 'center', behavior: motion() });
        cur.focus({ preventScroll: true });
      });

      /* ---------- Wiring ---------- */
      col.addEventListener('click', (ev) => {
        const btn = ev.target.closest('.zc-node');
        if (btn) { openNode(btn); return; }
        if (ev.target.closest('[data-zc-next]')) Z.go('learn');
        if (ev.target.closest('.zc-testout')) Z.go('exam');
      });
      $('.zc-continue').addEventListener('click', () => launch(flat.find(e => e.it.status === 'current')));
      $('.zc-back').addEventListener('click', () => Z.go('learn'));
      $('[data-zc-streak]').addEventListener('click', () => Z.streakSheet());
      const onDown = (ev) => { if (!pop.hidden && !popCard.contains(ev.target) && !ev.target.closest('.zc-node')) closePop(false); };
      const onKey = (ev) => { if (ev.key === 'Escape' && !pop.hidden) closePop(true); };
      const onMQ = () => { closePop(false); if (closeSheet) closeSheet(); observe(); place(); };
      document.addEventListener('pointerdown', onDown);
      document.addEventListener('keydown', onKey);
      window.addEventListener('resize', place);
      deskMQ.addEventListener('change', onMQ);
      place();
      later(observe, 60);

      /* ---------- Completion: the done node fills over 300ms, the next takes its halo on spring-bounce ---------- */
      const complete = async ({ doneE, nextE }, scroll) => {
        const nd = nodeEl(doneE.it.id), nn = nextE && nodeEl(nextE.it.id);
        if (!nd) return;
        if (scroll) {
          /* Bring the finished node and the next one into view together */
          const top = desk() ? 190 : 130, bottom = innerHeight - (desk() ? 40 : 100);
          const a = nd.getBoundingClientRect().top - 70, b = (nn || nd).getBoundingClientRect().bottom;
          if (a < top || b > bottom) {
            window.scrollBy({ top: (a + b) / 2 - (top + bottom) / 2, behavior: motion() });
            await Z.wait(560);
          }
          if (!alive) return;
        }
        view = {};
        nd.className = nodeCls(doneE, 'done') + ' zc-just';
        nd.setAttribute('aria-label', ariaFor(doneE, 'done'));
        L.progress[C.id] = lessonsDone() / C.lessons;
        const p = pct(lessonsDone());
        const bar = $('.zc-prog .bar');
        bar.firstElementChild.style.width = p + '%'; bar.setAttribute('aria-valuenow', p);
        $('.zc-pct').textContent = `${p}% complete`;
        Z.haptic();
        await Z.wait(300);
        if (!alive) return;
        if (nn) {
          nn.className = nodeCls(nextE, 'current') + ' zc-arrive';
          nn.setAttribute('aria-label', ariaFor(nextE, 'current'));
        }
        observe();
      };

      /* ---------- Streak toast on return from a lesson ---------- */
      if (flash === 'streak') {
        Z.toast(`${Z.bolt(true)}<span>Streak extended</span>`, 2600);
        /* At 1024px and up the toast sits over the path column */
        const t = [...document.querySelectorAll('body > .toast')].pop();
        if (t && wideMQ.matches) {
          const r = col.getBoundingClientRect();
          Object.assign(t.style, { left: r.left + 'px', width: r.width + 'px', right: 'auto', margin: '0', maxWidth: 'none' });
        }
        if (L.__zcBumped) {
          delete L.__zcBumped;
          const pills = [...document.querySelectorAll('#app [data-streak], #app [data-zc-streak]')];
          const paint = () => pills.forEach(p => {
            p.firstChild.nodeValue = String(L.streak);
            const b = p.querySelector('.bolt'); if (b) b.classList.add('lit');
            p.setAttribute('aria-label', `Streak ${L.streak} days`);
          });
          if (Z.reducedMotion()) paint();
          else later(() => {
            pills.forEach(p => { const b = p.querySelector('.bolt'); if (b) { b.classList.add('lit'); b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)', offset: 0.45 }, { transform: 'scale(1)' }], { duration: 500, easing: 'cubic-bezier(0.2, 0, 0, 1)' }); } });
            later(paint, 225);
          }, 300);
        }
      }
      if (finished) later(() => complete(finished, true), 450);

      return () => {
        alive = false;
        timers.forEach(clearTimeout);
        if (io) io.disconnect();
        if (ro) ro.disconnect();
        document.removeEventListener('pointerdown', onDown);
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', place);
        deskMQ.removeEventListener('change', onMQ);
      };
    },
  });
})();
