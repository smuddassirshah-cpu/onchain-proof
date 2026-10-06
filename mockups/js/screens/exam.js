/* Topic exam and exam result. Topic 1.5 Probability, practice paper A.
   Spec: docs/design-research.md 4.7 (exam passed: count-up, stamp on spring-snap, breakdown fades in, no particles),
   5.4 and 5.5 (exams: timed, no hints, no retries), 6.2 (200 XP on a pass), 8.2 and 8.4 (pass mark, difficulty mix),
   9.4 (accepted-answer rule, labelled worked solutions) and 10 (rigour you can see).
   Routes: #exam opens on the rules; #exam-result opens on a finished, marked attempt (example data).
   Every class carries the exm- prefix so nothing leaks into other screens. */
(function () {
  'use strict';

  const R = String.raw;
  const MINUTES = 90, PASS = 0.7, XP_PASS = 200, LOW = 5 * 60;
  const LETTERS = 'ABCDE';
  const KIND = { single: 'Single choice', multi: 'Select all that apply', num: 'Numeric answer' };
  const SKILLS = [['count', 'Counting'], ['cond', 'Conditional probability'], ['exp', 'Expectation'], ['dist', 'Distributions'], ['markov', 'Markov chains']];
  const SKILL = Object.fromEntries(SKILLS);
  /* Local glyphs: a calculator, and a bookmark for 'Mark to come back to' (the flag glyph means Report, spec 3) */
  const MARK = 'M7 3.5h10a1 1 0 0 1 1 1V20.5l-6-4.25-6 4.25V4.5a1 1 0 0 1 1-1z';
  const DEL = 'M9 5.5h10.5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9L3.5 12zM12 9.5l5 5M17 9.5l-5 5';
  const KEYPAD_MQ = '(max-width: 767px), (hover: none) and (pointer: coarse)';
  const CALC = 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 6.5h7v3h-7zM8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 17h.01M12 17h.01M15.5 17h.01';

  /* ---------- The paper: 12 items, difficulty mix 2 at 2, 6 at 3, 3 at 4, 1 at 5 (spec 8.4) ----------
     Every answer was checked by brute force or exact fractions. Steps are [maths, justification]. */
  const QS = [
    { skill: 'count', diff: 2, kind: 'single', title: 'Choosing a portfolio',
      prompt: 'A fund manager picks 3 of 10 stocks for a new portfolio. The order of picking does not matter.',
      ask: 'How many different portfolios are possible?',
      options: ['$120$', '$720$', '$30$', R`$1{,}000$`], answer: 0,
      rule: 'Accepted: the option $120$ only.',
      steps: [[R`\binom{10}{3} = \dfrac{10 \cdot 9 \cdot 8}{3!}`, 'Ordered picks, divided by the $3!$ orders of the same three stocks'], [R`= \dfrac{720}{6} = 120`, 'Each portfolio is now counted once']],
      diag: { 1: R`$720$ counts ordered picks, so each portfolio appears $3! = 6$ times.`, 2: R`$30$ is $10 \times 3$, which does not count choices.`, 3: R`$1{,}000 = 10^3$ allows repeats and counts order.` } },

    { skill: 'count', diff: 3, kind: 'num', title: 'Three different numbers',
      prompt: 'You roll three fair six-sided dice.',
      ask: 'What is the probability that all three show different numbers?',
      lo: 0.555, hi: 0.557, exact: R`\tfrac{5}{9} \approx 0.556`,
      rule: R`Accepted: any form equal to $\tfrac{5}{9}$, or a decimal from 0.555 to 0.557.`,
      steps: [[R`6 \cdot 5 \cdot 4 = 120`, 'Ordered outcomes with no number repeated'], [R`6^3 = 216`, 'All ordered outcomes, each equally likely'], [R`P = \tfrac{120}{216} = \tfrac{5}{9}`, 'Favourable over total']],
      diag: [[20 / 216, 0.0005, 'You counted sets of three numbers, but the total counts ordered rolls. Count both the same way.'], [1 / 36, 0.0005, R`$\tfrac{1}{36}$ is the chance all three match. The question asks for none matching.`]] },

    { skill: 'cond', diff: 3, kind: 'single', title: 'At least one six',
      prompt: 'You roll two fair dice out of sight. You ask a friend who can see them: “Is at least one of them a 6?” They say yes.',
      ask: 'What is the probability that both dice show 6?',
      options: [R`$\tfrac{1}{11}$`, R`$\tfrac{1}{6}$`, R`$\tfrac{1}{36}$`, R`$\tfrac{1}{12}$`], answer: 0,
      rule: R`Accepted: the option $\tfrac{1}{11}$ only.`,
      steps: [[R`|B| = 36 - 25 = 11`, 'Outcomes with at least one 6: all of them, minus the 25 with no 6'], [R`|A \cap B| = 1`, 'Only the roll (6, 6) has both dice on 6'], [R`P(A \mid B) = \tfrac{1}{11}`, 'Count inside the smaller sample space']],
      diag: { 1: R`$\tfrac16$ treats the answer as news about one particular die. Your friend checked both.`, 2: R`$\tfrac{1}{36}$ ignores what your friend told you.`, 3: R`$\tfrac{1}{12}$ counts the double six twice.` } },

    { skill: 'cond', diff: 3, kind: 'single', title: 'Second counter red',
      prompt: 'A bag holds 3 red and 2 blue counters. You draw two counters, one after the other, without replacement.',
      ask: 'Given that the second counter is red, what is the probability that the first was red?',
      options: [R`$\tfrac{1}{2}$`, R`$\tfrac{3}{5}$`, R`$\tfrac{2}{5}$`, R`$\tfrac{3}{10}$`], answer: 0,
      rule: R`Accepted: the option $\tfrac{1}{2}$ only.`,
      steps: [[R`P(R_1 \cap R_2) = \tfrac35 \cdot \tfrac24 = \tfrac{3}{10}`, 'Multiplication rule'], [R`P(R_2) = \tfrac35`, 'By symmetry, the second draw is as likely to be red as the first'], [R`P(R_1 \mid R_2) = \dfrac{3/10}{3/5} = \tfrac12`, 'Definition of conditional probability']],
      diag: { 1: R`$\tfrac35$ ignores the condition. A red second counter uses up one of the reds.`, 2: R`$\tfrac25$ is the chance the first was blue.`, 3: R`$\tfrac{3}{10}$ is $P(R_1 \cap R_2)$. Divide it by $P(R_2)$.` } },

    { skill: 'cond', diff: 4, kind: 'num', title: 'A positive test for a rare condition',
      prompt: 'A screening test is used where 1% of people have a condition. The test has 95% sensitivity and 90% specificity.',
      ask: 'A person chosen at random tests positive. What is the probability that they have the condition?',
      lo: 0.0871, hi: 0.0881, exact: R`\tfrac{19}{217} \approx 0.0876`,
      rule: R`Accepted: any form equal to $\tfrac{19}{217}$, or a decimal from 0.0871 to 0.0881.`,
      steps: [[R`P(D \mid +) = \dfrac{P(+ \mid D)\,P(D)}{P(+)}`, 'Bayes’ rule'], [R`P(+) = 0.95 \times 0.01 + 0.10 \times 0.99 = 0.1085`, 'Total probability. False positives occur at $1 - 0.90 = 0.10$'], [R`P(D \mid +) = \dfrac{0.0095}{0.1085} \approx 0.0876`, 'In 10,000 people: 95 true positives against 990 false ones']],
      diag: [[0.95, 0.0005, R`$0.95$ is $P(+ \mid D)$, the sensitivity. The question asks for $P(D \mid +)$, the condition turned round.`], [0.0095, 0.0001, R`$0.0095$ is $P(D \cap +)$. Divide it by $P(+) = 0.1085$.`], [0.9, 0.0005, R`$0.90$ is the specificity, the chance a healthy person tests negative.`]] },

    { skill: 'dist', diff: 2, kind: 'single', title: 'Waiting for a six',
      prompt: 'You roll a fair die until the first 6 appears.',
      ask: 'What is the expected number of rolls, counting the roll that shows the 6?',
      options: ['$6$', '$5$', '$3.5$', '$36$'], answer: 0,
      rule: 'Accepted: the option $6$ only.',
      steps: [[R`N \sim \text{Geometric}\big(\tfrac16\big)`, R`Each roll is a 6 with chance $\tfrac16$, independently`], [R`E[N] = \tfrac{1}{p} = 6`, 'Mean of a geometric count that includes the success']],
      diag: { 1: '$5$ counts the rolls before the 6, not the 6 itself.', 2: '$3.5$ is the mean of a single roll.', 3: '$36$ is the number of outcomes for two dice.' } },

    { skill: 'dist', diff: 3, kind: 'num', title: 'Three winning days of five',
      prompt: 'A strategy makes money on 60% of days, independently from day to day.',
      ask: 'Over 5 trading days, what is the probability that it makes money on exactly 3?',
      lo: 0.3451, hi: 0.3461, exact: R`\tfrac{216}{625} = 0.3456`,
      rule: R`Accepted: any form equal to $\tfrac{216}{625}$, or a decimal from 0.3451 to 0.3461.`,
      steps: [[R`X \sim \text{Bin}(5,\ 0.6)`, 'Five independent days with the same chance'], [R`P(X = 3) = \tbinom{5}{3}(0.6)^3(0.4)^2`, 'Choose which 3 days win'], [R`= 10 \times 0.216 \times 0.16 = 0.3456`, '']],
      diag: [[0.03456, 0.0002, R`$0.0346$ leaves out $\tbinom53 = 10$, the number of ways to pick the winning days.`], [0.6, 0.0005, '$0.6$ is the chance for one day, not three of five.']] },

    { skill: 'exp', diff: 3, kind: 'num', title: 'Neighbouring heads',
      prompt: 'You flip a fair coin 10 times. A double is a pair of neighbouring flips that are both heads, so HHH contains two doubles.',
      ask: 'What is the expected number of doubles?',
      lo: 2.245, hi: 2.255, exact: R`\tfrac{9}{4} = 2.25`,
      rule: R`Accepted: any form equal to $\tfrac{9}{4}$, or a decimal from 2.245 to 2.255.`,
      steps: [[R`I_k = 1 \text{ if flips } k \text{ and } k{+}1 \text{ are heads}`, 'One indicator for each of the 9 neighbouring pairs'], [R`E[I_k] = \tfrac14`, 'Two fair flips, both heads'], [R`E\Big[\textstyle\sum_{k=1}^{9} I_k\Big] = 9 \cdot \tfrac14 = 2.25`, 'Linearity holds even though neighbouring indicators are dependent']],
      diag: [[2.5, 0.0005, '$2.5$ uses 10 pairs. Ten flips have only 9 neighbouring pairs.'], [5, 0.0005, '$5$ is the expected number of heads, not of doubles.']] },

    { skill: 'exp', diff: 3, kind: 'single', title: 'Variance of a difference',
      prompt: R`$X$ and $Y$ are independent, with $\operatorname{Var}(X) = 4$ and $\operatorname{Var}(Y) = 9$.`,
      ask: R`What is $\operatorname{Var}(2X - Y)$?`,
      options: ['$25$', '$7$', '$17$', '$-1$'], answer: 0,
      rule: 'Accepted: the option $25$ only.',
      steps: [[R`\operatorname{Var}(2X - Y) = 2^2\operatorname{Var}(X) + (-1)^2\operatorname{Var}(Y)`, 'Independence removes the covariance term. Constants come out squared'], [R`= 16 + 9 = 25`, '']],
      diag: { 1: R`$7$ subtracts the variances. The minus sign is squared, $(-1)^2 = 1$, so the variances add.`, 2: R`$17$ doubles $\operatorname{Var}(X)$. The constant comes out squared: $2^2 = 4$.`, 3: '$-1$ doubles and subtracts. A variance can never be negative.' } },

    { skill: 'exp', diff: 4, kind: 'multi', title: 'Bets worth taking',
      prompt: 'Each bet costs the stake shown. If you win, you receive the prize shown and nothing else.',
      ask: 'Which bets have a positive expected profit? Select all that apply.',
      options: ['Stake £1. Roll a die. Prize £5 if it shows 6.', 'Stake £2. Flip two coins. Prize £10 if both land heads.', 'Stake £1. Draw a card from a full deck. Prize £15 if it is an ace.', 'Stake £3. Roll a die. Prize in pounds equal to the number shown.', 'Stake £5. Roll two dice. Prize £180 if both show 6.'],
      answer: [1, 2, 3],
      rule: 'Accepted: exactly B, C and D. No part marks.',
      steps: [[R`\text{A: } \tfrac16 \times 5 - 1 = -\tfrac16`, 'Loses about £0.17 a bet'], [R`\text{B: } \tfrac14 \times 10 - 2 = 0.50`, 'Gains £0.50 a bet'], [R`\text{C: } \tfrac{4}{52} \times 15 - 1 = \tfrac{2}{13}`, 'Gains about £0.15 a bet'], [R`\text{D: } 3.5 - 3 = 0.50`, 'A die roll averages 3.5'], [R`\text{E: } \tfrac{1}{36} \times 180 - 5 = 0`, 'A fair bet. Zero is not positive']],
      diag: null },

    { skill: 'markov', diff: 4, kind: 'num', title: 'Two days in a regime chain',
      prompt: R`A market switches between two regimes, Calm and Volatile, once a day. Rows are today’s regime and columns tomorrow’s, in that order. $$P = \begin{pmatrix} 0.9 & 0.1 \\ 0.3 & 0.7 \end{pmatrix}$$`,
      ask: 'Today is Calm. What is the probability that the market is Volatile two days from now?',
      lo: 0.1595, hi: 0.1605, exact: R`0.16`,
      rule: R`Accepted: any form equal to $0.16$, such as $\tfrac{4}{25}$, or a decimal from 0.1595 to 0.1605.`,
      steps: [[R`C \to C \to V:\ 0.9 \times 0.1 = 0.09`, 'Stay calm, then switch'], [R`C \to V \to V:\ 0.1 \times 0.7 = 0.07`, 'Switch, then stay volatile'], [R`(P^2)_{CV} = 0.09 + 0.07 = 0.16`, 'Add the two paths. They cannot both happen']],
      diag: [[0.1, 0.0005, '$0.1$ is one step. The question asks two days ahead.'], [0.07, 0.0005, '$0.07$ counts only the path that switches on day one.'], [0.09, 0.0005, '$0.09$ counts only the path that switches on day two.']] },

    { skill: 'exp', diff: 5, kind: 'num', title: 'Collecting six cards',
      prompt: 'Each pack contains one of 6 different cards. Every card is equally likely, independently from pack to pack.',
      ask: 'What is the expected number of packs you need to buy to collect all 6 cards?',
      lo: 14.65, hi: 14.75, exact: R`\tfrac{147}{10} = 14.7`,
      rule: R`Accepted: any form equal to $\tfrac{147}{10}$, or a decimal from 14.65 to 14.75.`,
      steps: [[R`T = G_0 + G_1 + \dots + G_5`, R`With $k$ cards held, the wait $G_k$ for a new one is geometric with $p = \tfrac{6-k}{6}$`], [R`E[T] = \sum_{k=0}^{5} \frac{6}{6-k}`, R`Linearity, and a geometric mean of $\tfrac1p$`], [R`= 6\big(1 + \tfrac12 + \tfrac13 + \tfrac14 + \tfrac15 + \tfrac16\big)`, ''], [R`= 6 \times \tfrac{49}{20} = 14.7`, 'In general $nH_n$ packs for $n$ cards']],
      diag: [[6, 0.0005, '$6$ assumes every pack brings a new card. The last card alone takes 6 packs on average.'], [36, 0.0005, '$36$ is $6^2$. The waits shrink as the set fills, so add them one by one.']] },
  ].map((q, i) => ({ ...q, n: i + 1 }));

  /* Example attempt for #exam-result: 10 of 12, wrong on 5 (Bayes) and 9 (variance), 5 and 12 marked to revisit, 41:18 used */
  const EXAMPLE = { ans: [0, '5/9', 0, 0, '0.95', 0, '0.3456', '2.25', 1, [1, 2, 3], '0.16', '14.7'], flags: [4, 11], used: 41 * 60 + 18, timeUp: false };

  /* ---------- Helpers ---------- */
  const clock = (s) => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const parseNum = (s) => {
    const v = String(s == null ? '' : s).trim();
    let m = v.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (m) return +m[2] ? +m[1] / +m[2] : NaN;
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(v)) return parseFloat(v);
    return NaN;
  };
  const answered = (q, a) => q.kind === 'multi' ? Array.isArray(a) && a.length > 0 : q.kind === 'num' ? a != null && String(a).trim() !== '' : a != null;
  const isRight = (q, a) => {
    if (!answered(q, a)) return false;
    if (q.kind === 'single') return a === q.answer;
    if (q.kind === 'multi') return a.length === q.answer.length && [...a].sort().every((x, i) => x === q.answer[i]);
    const v = parseNum(a); return isFinite(v) && v >= q.lo - 1e-12 && v <= q.hi + 1e-12;
  };
  const listAnd = (xs) => xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
  const mdx = (Z, s) => String(s)
    .replace(/\$\$([^$]+)\$\$/g, (_, m) => `<span class="exm-disp">${Z.tex(m, true)}</span>`)
    .replace(/\$([^$]+)\$([.,:;?)]?)/g, (_, m, p) => `<span class="exm-nw">${Z.tex(m)}${p}</span>`);
  const icon = (Z, name, cls = '') => name === 'calc' || name === 'mark' ? `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${name === 'calc' ? CALC : MARK}"/></svg>` : Z.icon(name, cls);
  /* A numeric entry that reads as a number; anything else is held back from the answered count */
  const readable = (q, a) => q.kind !== 'num' || isFinite(parseNum(a));
  /* A typed numeric answer, shown with KaTeX when it reads as a number or fraction */
  const typedTex = (Z, s) => {
    const v = String(s).trim();
    const f = v.match(/^(-?)(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
    if (f) return Z.tex(`${f[1]}\\tfrac{${f[2]}}{${f[3]}}`);
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(v)) return Z.tex(v);
    return `<span class="exm-raw">${Z.esc(v)}</span>`;
  };
  const answerHTML = (Z, q, a) => {
    if (!answered(q, a)) return '<span class="exm-none">No answer</span>';
    if (q.kind === 'single') return mdx(Z, q.options[a]);
    if (q.kind === 'multi') return listAnd([...a].sort().map(i => LETTERS[i]));
    return typedTex(Z, a);
  };
  const correctHTML = (Z, q) => q.kind === 'single' ? mdx(Z, q.options[q.answer]) : q.kind === 'multi' ? listAnd(q.answer.map(i => LETTERS[i])) : Z.tex(q.exact);
  const diagFor = (q, a) => {
    if (!q.diag || !answered(q, a)) return '';
    if (q.kind === 'single') return q.diag[a] || '';
    const v = parseNum(a); if (!isFinite(v)) return 'This does not read as a number, so it could not be marked.';
    const hit = q.diag.find(([t, tol]) => Math.abs(v - t) <= tol); return hit ? hit[2] : '';
  };
  /* Worked solutions (spec 9.4): a line that continues a chain ("= ...") carries the previous left-hand side as a phantom,
     so its = sign sits under the one above. The left-hand side is everything before the first = outside brackets. */
  const lhsOf = (tx) => {
    let d = 0;
    for (let i = 0; i < tx.length; i++) {
      const c = tx[i];
      if ('{(['.includes(c)) d++; else if ('})]'.includes(c)) d--;
      else if (c === '=' && d === 0) return tx.slice(0, i).trim();
    }
    return '';
  };
  const alignSteps = (steps) => { let lhs = ''; return steps.map(([tx, why]) => {
    const t = tx.trim();
    if (t.startsWith('=')) return [lhs ? `\\phantom{${lhs}} ${t}` : t, why];
    lhs = lhsOf(t); return [t, why];
  }); };

  /* ================================================================== */
  /* Exam: rules, then the timed paper                                    */
  /* ================================================================== */
  function mountExam(root, Z) {
    const S = { cur: 0, ans: QS.map(() => null), flags: new Set(), t0: 0, offset: 0, tick: null, low: false, over: false, anim: null, refocus: false };
    const cleanups = [];
    const $ = (sel) => root.querySelector(sel);
    /* Phones and touch tablets get the on-screen keypad (spec 5.3 #3); a physical keyboard types into the plain field */
    const touchPad = matchMedia(KEYPAD_MQ);

    /* ---------- Rules screen ---------- */
    const rules = [
      ['clock', `${MINUTES} minutes`, 'The clock starts when you begin and does not pause.'],
      ['clipboard', '12 questions', 'Single choice, select all that apply, and numeric answers.'],
      ['bulb', 'No hints', 'Hints, explanations and visual aids are switched off.'],
      ['replay', 'No retries', 'One attempt. You can change an answer until you submit.'],
      ['check', 'Marked when you submit', 'No feedback until then. Worked solutions follow.'],
      ['target', 'Pass mark 70%', 'That is 9 of 12 correct. A pass earns 200 XP.'],
      ['calc', 'Calculator allowed', 'Use your own. Numeric answers: a fraction, or a decimal to 3 significant figures.'],
      ['mark', 'Mark questions', 'Mark any question to come back to before you submit.'],
    ];
    const intro = () => {
      root.innerHTML = `<div class="exm" data-track="prob">
        <header class="exm-top">
          <button type="button" class="icon-btn exm-close" aria-label="Close and return to Review">${Z.icon('close')}</button>
          <p class="exm-top-t t-label">Topic exam</p><span></span>
        </header>
        <div class="exm-frame"><main class="exm-main">
          <div class="exm-scroll"><div class="exm-col exm-intro enter">
            <div class="exm-art">${window.ZQArt ? ZQArt('die', { label: 'Course art: two dice' }) : ''}</div>
            <p class="t-overline exm-ov">Topic 1.5 · Probability</p>
            <h1 class="t-lesson-title">Topic exam</h1>
            <p class="t-prose exm-lede">Practice paper A covers the whole topic: counting, conditional probability, expectation, distributions and Markov chains. Sit it now to test out, or after the last course.</p>
            <ul class="exm-rules">${rules.map(([ic, h, t]) => `<li><span class="exm-rule-ic">${icon(Z, ic)}</span><div><b class="t-label">${h}</b><p class="t-caption">${t}</p></div></li>`).join('')}</ul>
            <p class="t-caption exm-mix">Difficulty, on a scale of 1 to 5: 2 questions at level 2, 6 at level 3, 3 at level 4 and 1 at level 5.</p>
          </div></div>
          <div class="exm-foot"><p class="t-caption exm-foot-note">Leaving after you begin ends the attempt.</p><div class="exm-actions"><button type="button" class="btn exm-begin">Begin exam</button></div></div>
        </main></div>
      </div>`;
      $('.exm-close').addEventListener('click', () => Z.go('review'));
      $('.exm-begin').addEventListener('click', begin);
    };

    /* ---------- Paper ---------- */
    const remaining = () => MINUTES * 60 - ((performance.now() - S.t0) / 1000 + S.offset);
    const announce = (t) => { const l = $('[data-live]'); if (l) { l.textContent = ''; setTimeout(() => { l.textContent = t; }, 30); } };
    const dialogOpen = () => !!document.querySelector('.scrim');
    /* A square counts as answered only when its answer can be marked; a numeric entry that does not read as a number is held back */
    const isAns = (i) => answered(QS[i], S.ans[i]) && readable(QS[i], S.ans[i]);
    const unread = (i) => answered(QS[i], S.ans[i]) && !readable(QS[i], S.ans[i]);

    function begin() {
      S.t0 = performance.now();
      root.innerHTML = `<div class="exm is-paper" data-track="prob">
        <header class="exm-top">
          <button type="button" class="icon-btn exm-close" aria-label="Leave the exam">${Z.icon('close')}</button>
          <div class="exm-mid">
            <p class="exm-qof t-label">Question <span data-qn>1</span> of 12</p>
            <button type="button" class="exm-navbtn" aria-haspopup="dialog" aria-label="Question 1 of 12. Open the question navigator">${Z.icon('grid', 'sm')}<span><span class="exm-navbtn-w">Question </span><span data-qn>1</span> of 12</span>${Z.icon('chevronD', 'xs')}</button>
          </div>
          <div class="exm-right">
            <span class="exm-timer" role="timer" aria-label="Time left">${Z.icon('clock', 'sm')}<span data-time>${clock(MINUTES * 60)}</span></span>
            <button type="button" class="exm-markbtn" aria-pressed="false" aria-label="Mark question 1 to come back to">${icon(Z, 'mark', 'sm')}<span class="exm-mark-l">Mark</span></button>
          </div>
        </header>
        <div class="exm-frame">
          <main class="exm-main">
            <div class="exm-scroll"><div class="exm-col" data-col></div></div>
            <div class="exm-foot"><div class="exm-actions">
              <button type="button" class="btn secondary exm-prev" aria-label="Back to the previous question">${Z.icon('chevronL', 'sm')}<span class="exm-prev-l">Back</span></button>
              <button type="button" class="btn exm-next"><span>Next</span>${Z.icon('chevronR', 'sm')}</button>
            </div></div>
          </main>
          <aside class="exm-aside" aria-label="Question navigator">
            <h2 class="t-h2">Questions</h2>
            <p class="t-caption exm-count" data-count></p>
            <div data-grid>${grid()}</div>
            ${legend()}
            <div class="exm-aside-foot"><button type="button" class="btn secondary block exm-submit">Submit exam</button><p class="t-caption exm-zero">Unanswered questions score zero.</p></div>
          </aside>
        </div>
        <div class="sr-only" aria-live="polite" data-live></div>
      </div>`;
      $('.exm-close').addEventListener('click', confirmLeave);
      $('.exm-navbtn').addEventListener('click', openNav);
      $('.exm-markbtn').addEventListener('click', toggleMark);
      $('.exm-prev').addEventListener('click', () => go(S.cur - 1));
      $('.exm-next').addEventListener('click', () => (S.cur === QS.length - 1 ? confirmSubmit() : go(S.cur + 1)));
      $('.exm-submit').addEventListener('click', confirmSubmit);
      $('[data-grid]').addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) go(+b.dataset.q); });
      const col = $('[data-col]');
      col.addEventListener('click', onAnswerClick);
      col.addEventListener('input', onNumInput);
      col.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); $('.exm-next').click(); } });
      /* Keep the caret in the field while keypad keys are pressed */
      col.addEventListener('pointerdown', (e) => { if (e.target.closest('[data-kp]') && document.activeElement && document.activeElement.id === 'exm-num') e.preventDefault(); });
      const onMedia = () => { const n = $('#exm-num'); if (n) n.inputMode = touchPad.matches ? 'none' : 'text'; };
      touchPad.addEventListener('change', onMedia);
      cleanups.push(() => touchPad.removeEventListener('change', onMedia));
      document.addEventListener('keydown', onKey);
      cleanups.push(() => document.removeEventListener('keydown', onKey));
      S.tick = setInterval(updateTime, 250);
      cleanups.push(() => clearInterval(S.tick));
      window.ZQExam = { setRemaining: (s) => { S.offset = MINUTES * 60 - s - (performance.now() - S.t0) / 1000; updateTime(); } };
      cleanups.push(() => { delete window.ZQExam; });
      render(true);
      updateTime();
      announce(`Exam started. ${MINUTES} minutes. Question 1 of 12.`);
      setTimeout(() => { const h = $('.exm-ask'); h && h.focus({ preventScroll: true }); }, 60);
    }

    const markBadge = () => `<span class="exm-sq-m" aria-hidden="true">${icon(Z, 'mark')}</span>`;
    const legend = () => `<ul class="exm-legend" aria-label="Key">
      <li><i class="exm-sq-k is-ans"></i>Answered</li><li><i class="exm-sq-k"></i>Not answered</li>
      <li><i class="exm-sq-k is-cur"></i>Current</li><li><i class="exm-sq-k exm-sq-km">${icon(Z, 'mark')}</i>Marked</li></ul>`;
    const sqLabel = (i) => `Question ${i + 1}, ${isAns(i) ? 'answered' : unread(i) ? 'answer does not read as a number' : 'not answered'}${S.flags.has(i) ? ', marked' : ''}`;
    const grid = (cls = '') => `<div class="exm-grid ${cls}" role="group" aria-label="Questions">${QS.map((q, i) => {
      const f = S.flags.has(i), c = i === S.cur;
      return `<button type="button" class="exm-sq${isAns(i) ? ' is-ans' : ''}${c ? ' is-cur' : ''}${f ? ' is-mark' : ''}" data-q="${i}" aria-label="${sqLabel(i)}"${c ? ' aria-current="step"' : ''}>${i + 1}${f ? markBadge() : ''}</button>`;
    }).join('')}</div>`;
    /* Update the squares in place, so a keyboard user's focus stays on the square they are on */
    const syncGrid = (g) => g && g.querySelectorAll('[data-q]').forEach(b => {
      const i = +b.dataset.q, f = S.flags.has(i), c = i === S.cur;
      b.classList.toggle('is-ans', isAns(i)); b.classList.toggle('is-cur', c); b.classList.toggle('is-mark', f);
      b.setAttribute('aria-label', sqLabel(i));
      if (c) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      const m = b.querySelector('.exm-sq-m');
      if (f && !m) b.insertAdjacentHTML('beforeend', markBadge()); else if (!f && m) m.remove();
    });
    const counts = () => { const a = QS.filter((q, i) => isAns(i)).length; return { a, text: `${a} of 12 answered${S.flags.size ? ` · ${S.flags.size} marked` : ''}` }; };

    function renderChrome() {
      const i = S.cur, f = S.flags.has(i);
      root.querySelectorAll('[data-qn]').forEach(n => { n.textContent = i + 1; });
      $('.exm-navbtn').setAttribute('aria-label', `Question ${i + 1} of 12. Open the question navigator`);
      const mb = $('.exm-markbtn');
      mb.setAttribute('aria-pressed', String(f));
      mb.setAttribute('aria-label', `Mark question ${i + 1} to come back to`);
      mb.querySelector('.exm-mark-l').textContent = f ? 'Marked' : 'Mark';
      const prev = $('.exm-prev'), nx = $('.exm-next'), last = i === QS.length - 1;
      prev.disabled = i === 0;
      if (prev.disabled && document.activeElement === prev) nx.focus();
      if (nx.dataset.last !== String(last)) { nx.dataset.last = String(last); nx.innerHTML = last ? '<span>Submit exam</span>' : `<span>Next</span>${Z.icon('chevronR', 'sm')}`; }
      syncGrid($('[data-grid]'));
      $('[data-count]').textContent = counts().text;
      const tag = $('.exm-marked'); if (tag) tag.hidden = !f;
    }

    const KEYS = [['7'], ['8'], ['9'], ['/', 'Fraction slash'], ['4'], ['5'], ['6'], ['-', 'Minus', '−'], ['1'], ['2'], ['3'], ['del', 'Delete'], ['0'], ['.', 'Point']];
    const keypad = () => `<div class="exm-keypad" role="group" aria-label="Number keypad">${KEYS.map(([k, lab, show]) =>
      `<button type="button" class="exm-kp${k === 'del' ? ' exm-kp-del' : k === '0' ? ' exm-kp-0' : /\d/.test(k) ? '' : ' exm-kp-op'}" data-kp="${k}"${lab ? ` aria-label="${lab}"` : ''}>${k === 'del' ? `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${DEL}"/></svg>` : show || k}</button>`).join('')}</div>`;

    function questionHTML(i) {
      const q = QS[i], a = S.ans[i];
      let w = '';
      if (q.kind === 'single') {
        w = `<div class="opts exm-opts${q.options.length <= 4 ? ' two' : ''}" role="group" aria-labelledby="exm-ask">${q.options.map((o, k) =>
          `<button type="button" class="opt" data-i="${k}" aria-pressed="${a === k}"><span class="exm-key" aria-hidden="true">${k + 1}</span>${mdx(Z, o)}</button>`).join('')}</div>`;
      } else if (q.kind === 'multi') {
        const set = new Set(a || []);
        w = `<div class="opts exm-opts exm-multi" role="group" aria-labelledby="exm-ask">${q.options.map((o, k) =>
          `<button type="button" class="opt exm-mopt" role="checkbox" data-i="${k}" aria-checked="${set.has(k)}"><span class="exm-box" aria-hidden="true">${Z.icon('check')}</span><span class="exm-letter" aria-hidden="true">${LETTERS[k]}</span><span class="exm-otx">${mdx(Z, o)}</span></button>`).join('')}</div>`;
      } else {
        const has = answered(q, a);
        w = `<label class="t-caption exm-numl" for="exm-num">Your answer</label>
          <div class="field exm-field${has ? ' has' : ''}"><input id="exm-num" type="text" inputmode="${touchPad.matches ? 'none' : 'text'}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="For example 0.25 or 1/4" value="${has ? Z.esc(a) : ''}" aria-describedby="exm-numhelp"></div>
          <p class="t-caption exm-numhelp" id="exm-numhelp">${numHelp(a)}</p>
          ${keypad()}`;
      }
      return `<section class="exm-q" aria-labelledby="exm-ask">
        <div class="exm-qhead"><span class="t-overline exm-ov">Question ${i + 1} · ${KIND[q.kind]}</span><span class="exm-marked" ${S.flags.has(i) ? '' : 'hidden'}>${icon(Z, 'mark', 'xs')}Marked</span></div>
        <div class="t-prose exm-prompt">${mdx(Z, q.prompt)}</div>
        <h2 class="t-h2 exm-ask" id="exm-ask" tabindex="-1">${mdx(Z, q.ask)}</h2>
        ${w}
      </section>`;
    }
    const numHelp = (a) => {
      if (a != null && String(a).trim() !== '' && !isFinite(parseNum(a))) return 'This does not read as a number yet. Use digits, one point, or one slash for a fraction, such as 3/2.';
      return 'Enter a fraction, or a decimal to at least 3 significant figures. It is marked when you submit.';
    };

    function render(first) {
      const col = $('[data-col]');
      /* Focus inside the old question moves to the new question line, not to the page */
      S.refocus = (S.anim ? S.refocus : false) || col.contains(document.activeElement);
      const swap = () => {
        S.anim = null;
        col.inert = false;
        col.innerHTML = questionHTML(S.cur);
        col.classList.remove('exm-in'); void col.offsetWidth; col.classList.add('exm-in');
        $('.exm-scroll').scrollTop = 0;
        renderChrome();
        if (S.refocus) { S.refocus = false; const h = $('.exm-ask'); h && h.focus({ preventScroll: true }); }
      };
      if (S.anim) { S.anim.cancel(); S.anim = null; }
      if (first || Z.reducedMotion()) { swap(); return; }
      col.inert = true; // the outgoing question cannot take a click meant for the next one
      S.anim = col.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'cubic-bezier(0.3, 0, 0.8, 0.15)' });
      S.anim.onfinish = swap;
    }
    function go(i) {
      if (i < 0 || i >= QS.length) return;
      if (i === S.cur) { renderChrome(); return; }
      S.cur = i; render(false);
      announce(`Question ${i + 1} of 12${S.flags.has(i) ? ', marked' : ''}`);
    }
    function toggleMark() {
      const i = S.cur;
      if (S.flags.has(i)) S.flags.delete(i); else S.flags.add(i);
      renderChrome();
      announce(S.flags.has(i) ? `Question ${i + 1} marked to come back to` : `Mark removed from question ${i + 1}`);
    }
    function onKeypad(e) {
      const k = e.target.closest('[data-kp]'); if (!k) return false;
      const inp = $('#exm-num'); if (!inp) return true;
      const v = inp.value, focused = document.activeElement === inp;
      const s = focused ? inp.selectionStart : v.length, en = focused ? inp.selectionEnd : v.length;
      if (k.dataset.kp === 'del') { if (s !== en) inp.setRangeText('', s, en, 'end'); else if (s > 0) inp.setRangeText('', s - 1, s, 'end'); }
      else inp.setRangeText(k.dataset.kp, s, en, 'end');
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      Z.haptic(8);
      return true;
    }
    function onAnswerClick(e) {
      if (onKeypad(e)) return;
      const o = e.target.closest('.opt'); if (!o || $('[data-col]').inert) return;
      const q = QS[S.cur], k = +o.dataset.i;
      if (q.kind === 'num') return;
      if (q.kind === 'single') {
        S.ans[S.cur] = k;
        o.parentElement.querySelectorAll('.opt').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === k)));
      } else if (q.kind === 'multi') {
        const set = new Set(S.ans[S.cur] || []);
        if (set.has(k)) set.delete(k); else set.add(k);
        S.ans[S.cur] = [...set].sort();
        o.setAttribute('aria-checked', String(set.has(k)));
      }
      renderChrome();
    }
    function onNumInput(e) {
      if (!e.target.matches('#exm-num')) return;
      S.ans[S.cur] = e.target.value;
      e.target.closest('.field').classList.toggle('has', e.target.value.trim() !== '');
      $('#exm-numhelp').textContent = numHelp(e.target.value);
      renderChrome();
    }
    function onKey(e) {
      if (S.over || dialogOpen() || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target instanceof Element ? e.target : document.body, typing = t.matches('input, textarea, select') || t.isContentEditable;
      if (typing) return;
      const q = QS[S.cur], key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      /* Options: keys 1 to 9, and on select-all questions the letters shown on the cards */
      const idx = /^[1-9]$/.test(key) ? +key - 1 : q.kind === 'multi' && /^[a-e]$/.test(key) ? LETTERS.toLowerCase().indexOf(key) : -1;
      if (idx >= 0 && q.kind !== 'num') {
        if ($('[data-col]').inert) return;
        const b = root.querySelector(`.exm-opts .opt[data-i="${idx}"]`);
        if (b) { e.preventDefault(); b.click(); b.focus(); }
      } else if (key === 'ArrowRight') { e.preventDefault(); if (S.cur < QS.length - 1) go(S.cur + 1); }
      else if (key === 'ArrowLeft') { e.preventDefault(); go(S.cur - 1); }
      else if (key === 'm') { e.preventDefault(); toggleMark(); }
    }
    function updateTime() {
      if (S.over) return;
      const r = remaining(), el = $('[data-time]');
      if (!el) return;
      el.textContent = clock(r);
      const dt = document.querySelector('[data-dlg-time]'); if (dt) dt.textContent = clock(r);
      const low = r <= LOW;
      if (low !== S.low) {
        S.low = low;
        const tm = $('.exm-timer');
        tm.classList.toggle('is-low', low);
        tm.setAttribute('aria-label', low ? 'Time left, under 5 minutes' : 'Time left');
        if (low) announce('Five minutes left.');
      }
      if (r <= 0) submit(true);
    }

    /* ---------- Navigator sheet (below 1024px), leave and submit confirmations. Only one dialog at a time. ---------- */
    function openNav() {
      if (dialogOpen()) return;
      const box = Z.h(`<div class="exm-dlg exm-navsheet">
        <h2 class="t-sheet-title">Questions</h2>
        <p class="t-caption exm-count">${counts().text}</p>
        ${grid('exm-grid-6')}
        ${legend()}
        <div class="exm-dlg-act"><button type="button" class="btn secondary" data-submit>Submit exam</button></div>
      </div>`);
      const close = Z.sheet(box, { label: 'Question navigator' });
      box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-q]');
        if (b) { close(); go(+b.dataset.q); }
        else if (e.target.closest('[data-submit]')) { close(); setTimeout(confirmSubmit, 60); }
      });
      setTimeout(() => { const c = box.querySelector('.exm-sq.is-cur'); c && c.focus(); }, 60);
    }
    function confirmLeave() {
      if (dialogOpen()) return;
      const box = Z.h(`<div class="exm-dlg">
        <h2 class="t-sheet-title">Leave the exam?</h2>
        <p class="t-body exm-dlg-sub">Leaving ends this attempt. Nothing is marked, and next time you start on a new paper.</p>
        <div class="exm-dlg-act"><button type="button" class="btn secondary" data-leave>End attempt</button><button type="button" class="btn" data-close>Keep going</button></div>
      </div>`);
      Z.sheet(box, { label: 'Leave the exam' });
      box.addEventListener('click', (e) => { if (e.target.closest('[data-leave]')) Z.go('review'); });
      setTimeout(() => box.querySelector('.btn[data-close]').focus(), 60);
    }
    function confirmSubmit() {
      if (dialogOpen()) return;
      const all = QS.map((q, i) => i);
      const un = all.filter(i => !answered(QS[i], S.ans[i]));
      const nan = all.filter(unread);
      const fl = [...S.flags].sort((a, b) => a - b);
      const jumps = (xs) => `<div class="exm-jumps">${xs.map(i => `<button type="button" class="exm-sq${isAns(i) ? ' is-ans' : ''}" data-q="${i}" aria-label="Go to question ${i + 1}">${i + 1}</button>`).join('')}</div>`;
      const box = Z.h(`<div class="exm-dlg">
        <h2 class="t-sheet-title">Submit your exam?</h2>
        <p class="t-body exm-dlg-sub">You cannot change answers after you submit. Time left: <b class="tnum" data-dlg-time>${clock(remaining())}</b>.</p>
        ${un.length ? `<div class="exm-dlg-sec"><h3 class="t-h2">Not answered: ${un.length}</h3><p class="t-caption exm-dlg-cap">These score zero. Choose one to go back to it.</p>${jumps(un)}</div>` : ''}
        ${nan.length ? `<div class="exm-dlg-sec"><h3 class="t-h2">Not a number: ${nan.length}</h3><p class="t-caption exm-dlg-cap">These cannot be marked as typed. Use digits, one point, or one slash for a fraction.</p>${jumps(nan)}</div>` : ''}
        ${fl.length ? `<div class="exm-dlg-sec"><h3 class="t-h2 exm-dlg-mh">${icon(Z, 'mark', 'xs')}Marked: ${fl.length}</h3><p class="t-caption exm-dlg-cap">You marked these to come back to.</p>${jumps(fl)}</div>` : ''}
        ${!un.length && !nan.length && !fl.length ? `<p class="exm-allset t-body">${Z.icon('check', 'sm')}All 12 answered, none marked.</p>` : ''}
        <div class="exm-dlg-act"><button type="button" class="btn secondary" data-close>Keep working</button><button type="button" class="btn" data-submit>Submit exam</button></div>
      </div>`);
      const close = Z.sheet(box, { label: 'Submit exam' });
      box.addEventListener('click', (e) => {
        const b = e.target.closest('[data-q]');
        if (b) { close(); go(+b.dataset.q); }
        else if (e.target.closest('[data-submit]')) { close(); submit(false); }
      });
      setTimeout(() => box.querySelector('.btn[data-close]').focus(), 60);
    }
    function submit(timeUp) {
      if (S.over) return;
      S.over = true;
      if (S.anim) { S.anim.cancel(); S.anim = null; }
      cleanups.splice(0).forEach(f => f());
      document.querySelectorAll('.scrim, .sheet, .modal').forEach(n => n.remove());
      const used = Math.min(MINUTES * 60, Math.round((performance.now() - S.t0) / 1000 + S.offset));
      cleanups.push(mountResult(root, Z, { ans: S.ans, flags: [...S.flags], used, timeUp }));
      window.scrollTo(0, 0);
    }

    intro();
    return () => cleanups.splice(0).forEach(f => { try { f && f(); } catch (e) { console.error(e); } });
  }

  /* ================================================================== */
  /* Result: count-up, stamp, breakdown, review                          */
  /* ================================================================== */
  function mountResult(root, Z, at) {
    const marks = QS.map((q, i) => ({ q, a: at.ans[i], ok: isRight(q, at.ans[i]), done: answered(q, at.ans[i]), flag: at.flags.includes(i) }));
    const score = marks.filter(m => m.ok).length, total = QS.length;
    const pct = Math.round(score / total * 100), pass = score / total >= PASS;
    const wrong = marks.filter(m => !m.ok);
    const bySkill = SKILLS.map(([id, name]) => {
      const ms = marks.filter(m => m.q.skill === id);
      const c = ms.filter(m => m.ok).length;
      return { id, name, c, t: ms.length, p: ms.length ? c / ms.length : 0, qs: ms.map(m => m.q.n) };
    });
    const under = bySkill.filter(s => s.p < PASS);
    const timers = []; let raf = 0, final = false;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const skillRow = (s) => {
      const w = (s.p * 100).toFixed(2) + '%', near = Math.abs(s.p - PASS) < 0.06;
      const lab = `${s.name}: ${s.c} of ${s.t} correct, ${Math.round(s.p * 100)}%. Questions ${listAnd(s.qs.map(String))}.`;
      return `<div class="exm-row" tabindex="0" role="listitem" aria-label="${Z.esc(lab)}" data-skill="${s.id}">
        <span class="exm-row-l" aria-hidden="true">${Z.esc(s.name)}</span>
        <span class="exm-plot" aria-hidden="true"><i class="exm-bar" style="--w:${w}"></i><span class="exm-row-v tnum${near ? ' is-near' : ''}" style="--w:${w}">${s.c} of ${s.t}</span></span>
      </div>`;
    };
    const reviewItem = (m) => {
      const q = m.q, d = !m.ok ? diagFor(q, m.a) : '';
      const v = m.ok ? `<span class="exm-v is-ok">${Z.icon('check')}<span>Correct</span></span>` : `<span class="exm-v is-no">${Z.icon('cross')}<span>${m.done ? 'Not correct' : 'No answer'}</span></span>`;
      return `<article class="exm-ri${m.ok ? '' : ' is-no'}" data-ok="${m.ok}" data-flag="${m.flag}">
        <button type="button" class="exm-ri-h" aria-expanded="${!m.ok}" aria-controls="exm-rb-${q.n}">
          <span class="exm-ri-n tnum">${q.n}</span>
          <span class="exm-ri-t"><span class="t-label">${Z.esc(q.title)}</span><span class="t-caption exm-ri-meta">${SKILL[q.skill]} · Difficulty ${q.diff} of 5${m.flag ? ` · <span class="exm-ri-mark">${icon(Z, 'mark', 'xs')}Marked</span>` : ''}</span></span>
          ${v}
          <span class="exm-ri-chev" aria-hidden="true">${Z.icon('chevronD', 'sm')}</span>
        </button>
        <div class="exm-ri-b" id="exm-rb-${q.n}" ${m.ok ? 'hidden' : ''}>
          <div class="exm-ri-qrow"><div class="t-body exm-ri-q">${mdx(Z, q.prompt)} <b>${mdx(Z, q.ask)}</b></div>
            <button type="button" class="icon-btn exm-report" data-report="${q.n}" aria-label="Report a problem with question ${q.n}" title="Report a problem with this question">${Z.icon('flag')}</button></div>
          ${q.kind === 'multi' ? `<ol class="exm-ri-opts t-caption">${q.options.map((o, k) => `<li><b>${LETTERS[k]}</b> ${Z.esc(o)}</li>`).join('')}</ol>` : ''}
          <dl class="exm-ans">
            <div><dt class="t-caption">Your answer</dt><dd>${answerHTML(Z, q, m.a)}</dd></div>
            <div><dt class="t-caption">Correct answer</dt><dd>${correctHTML(Z, q)}</dd></div>
          </dl>
          <p class="t-caption exm-accept">${mdx(Z, q.rule)}</p>
          ${d ? `<p class="t-body exm-diag">${mdx(Z, d)}</p>` : ''}
          <p class="t-overline exm-ws-h">Worked solution</p>
          <ol class="exm-steps">${alignSteps(q.steps).map(([tx, why]) => `<li><span class="exm-step-m">${Z.tex('\\displaystyle ' + tx)}</span>${why ? `<span class="t-caption exm-step-w">${mdx(Z, why)}</span>` : '<span></span>'}</li>`).join('')}</ol>
          ${!m.ok ? `<p class="exm-redo"><span class="exm-redo-chip">${Z.icon('review', 'xs')}Added to redo queue</span><span class="t-caption exm-redo-c">It comes back in 7 days, then in 30.</span></p>` : ''}
        </div>
      </article>`;
    };

    const timeNote = at.timeUp ? `Time ran out, so your answers were submitted at ${clock(MINUTES * 60)}. ` : '';
    const heroNote = timeNote + (pass
      ? 'Pass mark 70%, which is 9 of 12. Topic 1.5 now counts as passed. Lessons you have not finished stay open.'
      : `Pass mark 70%, which is 9 of 12. You need ${Math.ceil(total * PASS) - score} more. Paper B is ready when you are.`);

    root.innerHTML = `<div class="exm-res" data-track="prob">
      <header class="exm-top exm-rtop">
        <button type="button" class="icon-btn exm-close" aria-label="Close results and return to Review">${Z.icon('close')}</button>
        <p class="exm-top-t t-label">Topic 1.5 exam · Paper A</p><span></span>
      </header>
      <main class="exm-rcol">
        <section class="exm-hero" aria-labelledby="exm-rh">
          <p class="t-overline exm-ov">Topic 1.5 · Practice paper A</p>
          <h1 class="t-complete" id="exm-rh">Probability topic exam</h1>
          <div class="exm-scorerow">
            <p class="exm-score"><span class="sr-only">${score} of ${total} correct, ${pct}%. ${pass ? 'Pass' : 'Not passed'}.</span>
              <span aria-hidden="true" class="exm-score-n"><b class="t-stat" data-score>0</b><span class="exm-of"> of ${total}</span></span>
              <span aria-hidden="true" class="exm-pct tnum"><span data-pct>0</span>% correct</span>
            </p>
            <div class="exm-stamp ${pass ? 'is-pass' : 'is-fail'}" aria-hidden="true">${Z.icon(pass ? 'check' : 'cross')}<span>${pass ? 'Pass' : 'Not passed'}</span></div>
          </div>
          <p class="t-body exm-hero-note exm-later" data-l="0">${heroNote}</p>
          <div class="exm-badges">
            <div class="exm-badge exm-xp exm-later" data-l="1"><span class="t-caption exm-badge-l">${Z.spark(pass)}XP</span><span class="exm-badge-v tnum">${pass ? '+' + XP_PASS : '0'}</span><span class="t-caption exm-badge-s">${pass ? 'Topic exam passed' : `${XP_PASS} on a pass`}</span></div>
            <div class="exm-badge exm-later" data-l="2"><span class="t-caption exm-badge-l">${Z.icon('clock', 'xs')}Time used</span><span class="exm-badge-v tnum">${clock(at.used)}</span><span class="t-caption exm-badge-s">of ${clock(MINUTES * 60)}</span></div>
            <div class="exm-badge exm-later" data-l="3"><span class="t-caption exm-badge-l">${Z.icon('review', 'xs')}Redo queue</span><span class="exm-badge-v tnum">+${wrong.length}</span><span class="t-caption exm-badge-s">${wrong.length ? 'back in 7 days' : 'nothing to redo'}</span></div>
          </div>
          <button type="button" class="btn exm-back exm-later" data-l="3">Back to Review</button>
        </section>

        <section class="exm-card exm-skills exm-later" data-l="4" aria-labelledby="exm-sk-h">
          <div class="exm-sec-h"><h2 class="t-h2" id="exm-sk-h">By skill</h2><button type="button" class="link-btn exm-tbl-t" aria-pressed="false">Show as table</button></div>
          <p class="t-caption exm-sec-c" data-cap>Share of questions correct in each skill. The dashed line is the 70% pass mark.</p>
          <div class="exm-chart">
            <div class="exm-gl" aria-hidden="true"><i style="--x:0"></i><i style="--x:0.5"></i><i style="--x:1"></i></div>
            <div class="exm-ref" aria-hidden="true"><span class="t-caption">Pass mark 70%</span></div>
            <div class="exm-rows" role="list" aria-label="Correct answers by skill">${bySkill.map(skillRow).join('')}</div>
            <div class="exm-axis t-caption" aria-hidden="true"><span style="--x:0">0%</span><span style="--x:0.5">50%</span><span style="--x:1">100%</span></div>
            <div class="exm-tip" role="presentation" hidden><b></b><span></span></div>
          </div>
          <table class="exm-table" hidden>
            <caption class="sr-only">Correct answers by skill</caption>
            <thead><tr><th scope="col">Skill</th><th scope="col" class="num">Correct</th><th scope="col" class="num">Share</th><th scope="col">Questions</th></tr></thead>
            <tbody>${bySkill.map(s => `<tr><th scope="row">${Z.esc(s.name)}</th><td class="num">${s.c} of ${s.t}</td><td class="num">${Math.round(s.p * 100)}%</td><td>${s.qs.join(', ')}</td></tr>`).join('')}</tbody>
          </table>
          <p class="t-body exm-sk-note">${under.length
            ? `Under the pass mark: ${listAnd(under.map(s => `${Z.esc(s.name)} (${s.c} of ${s.t})`))}. ${wrong.length === 1 ? 'The question you missed is' : wrong.length === 2 ? 'Both questions you missed are' : `All ${wrong.length} questions you missed are`} in your redo queue.`
            : 'Every skill is at or above the pass mark.'}</p>
        </section>

        <section class="exm-review exm-later" data-l="5" aria-labelledby="exm-rv-h">
          <h2 class="t-h1" id="exm-rv-h">Your answers</h2>
          <p class="t-body exm-sec-c">Each question shows the rule used to mark it and a worked solution.</p>
          <div class="exm-filter" role="group" aria-label="Show">
            <button type="button" class="chip on" data-f="all" aria-pressed="true">All <span class="tnum">${total}</span></button>
            <button type="button" class="chip" data-f="wrong" aria-pressed="false">Not correct <span class="tnum">${wrong.length}</span></button>
            <button type="button" class="chip" data-f="flag" aria-pressed="false">Marked <span class="tnum">${at.flags.length}</span></button>
          </div>
          <div class="exm-list">${marks.map(reviewItem).join('')}</div>
          <p class="t-body exm-empty" hidden>Nothing here.</p>
          <button type="button" class="btn exm-back exm-back-end">Back to Review</button>
        </section>
      </main>
    </div>`;

    const res = root.querySelector('.exm-res');
    const q = (s) => res.querySelector(s);
    const scoreEl = q('[data-score]'), pctEl = q('[data-pct]'), stamp = q('.exm-stamp');

    /* ---------- Interactions ---------- */
    q('.exm-close').addEventListener('click', () => Z.go('review'));
    res.querySelectorAll('.exm-back').forEach(b => b.addEventListener('click', () => Z.go('review')));
    res.querySelectorAll('.exm-ri-h').forEach(b => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(open));
      b.nextElementSibling.hidden = !open;
    }));
    /* Report a problem with a question (spec 3 and 10: a flag on every item) */
    res.addEventListener('click', (e) => {
      const b = e.target.closest('[data-report]'); if (!b || b.classList.contains('is-sent')) return;
      b.classList.add('is-sent');
      b.setAttribute('aria-label', `Problem reported on question ${b.dataset.report}`); b.title = 'Reported';
      Z.toast(`Thanks. We will check question ${b.dataset.report} and its answer key.`);
    });
    const filter = q('.exm-filter');
    filter.addEventListener('click', (e) => {
      const c = e.target.closest('[data-f]'); if (!c) return;
      filter.querySelectorAll('[data-f]').forEach(x => { const on = x === c; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
      let n = 0;
      res.querySelectorAll('.exm-ri').forEach(it => {
        const show = c.dataset.f === 'all' || (c.dataset.f === 'wrong' && it.dataset.ok === 'false') || (c.dataset.f === 'flag' && it.dataset.flag === 'true');
        it.hidden = !show; if (show) n++;
      });
      q('.exm-empty').hidden = n > 0;
    });
    const tblBtn = q('.exm-tbl-t');
    tblBtn.addEventListener('click', () => {
      const on = tblBtn.getAttribute('aria-pressed') !== 'true';
      tblBtn.setAttribute('aria-pressed', String(on));
      tblBtn.textContent = on ? 'Show as chart' : 'Show as table';
      q('.exm-chart').hidden = on; q('.exm-table').hidden = !on;
      q('[data-cap]').textContent = on ? 'Share of questions correct in each skill.' : 'Share of questions correct in each skill. The dashed line is the 70% pass mark.';
    });
    /* Per-bar tooltip on hover and focus: value first, then the skill */
    const chart = q('.exm-chart'), tip = q('.exm-tip');
    const showTip = (row) => {
      const s = bySkill.find(x => x.id === row.dataset.skill);
      tip.querySelector('b').textContent = `${Math.round(s.p * 100)}%`;
      tip.querySelector('span').textContent = `${s.name} · ${s.c} of ${s.t} correct · Questions ${listAnd(s.qs.map(String))}`;
      tip.hidden = false;
      const cr = chart.getBoundingClientRect(), br = row.querySelector('.exm-plot').getBoundingClientRect();
      const x = br.left - cr.left + br.width * s.p, tw = tip.offsetWidth;
      tip.style.left = Math.max(tw / 2, Math.min(cr.width - tw / 2, x)) + 'px';
      tip.style.top = (br.top - cr.top - 8) + 'px';
    };
    const hideTip = () => { tip.hidden = true; };
    chart.addEventListener('pointerover', (e) => { const r = e.target.closest('.exm-row'); if (r) showTip(r); });
    chart.addEventListener('pointerleave', hideTip);
    chart.addEventListener('focusin', (e) => { const r = e.target.closest('.exm-row'); if (r) showTip(r); });
    chart.addEventListener('focusout', hideTip);

    /* ---------- Celebration (spec 4.7): count-up 900ms, stamp on spring-snap, breakdown fades in. Tap skips. ---------- */
    const finish = () => {
      if (final) return;
      final = true;
      timers.splice(0).forEach(clearTimeout); cancelAnimationFrame(raf);
      scoreEl.textContent = score; pctEl.textContent = pct;
      res.classList.add('final');
      stamp.classList.add('on');
      res.querySelectorAll('.exm-later').forEach(n => n.classList.add('on'));
    };
    const countUp = (ms) => new Promise(done => {
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / ms);
        const e = p < 0.8 ? p / 0.8 * 0.9 : 0.9 + (1 - Math.pow(1 - (p - 0.8) / 0.2, 3)) * 0.1; // linear, ease-out on the last 20%
        scoreEl.textContent = Math.round(score * e); pctEl.textContent = Math.round(pct * e);
        if (p < 1) raf = requestAnimationFrame(step); else done();
      };
      raf = requestAnimationFrame(step);
    });
    if (Z.reducedMotion()) { res.classList.add('rm'); finish(); }
    else {
      countUp(900).then(() => {
        if (final) return;
        stamp.classList.add('on');
        if (pass) Z.sound('complete');
        res.querySelectorAll('.exm-later').forEach(n => later(() => n.classList.add('on'), 260 + (+n.dataset.l) * 80));
        later(finish, 1200);
      });
      const skip = (e) => { if (!final && !e.target.closest('.exm-top')) finish(); };
      res.addEventListener('pointerdown', skip);
      const onKey = (e) => { if (!final && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) finish(); };
      document.addEventListener('keydown', onKey);
      return () => { timers.forEach(t => t && clearTimeout(t)); cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); };
    }
    return () => { timers.forEach(t => t && clearTimeout(t)); cancelAnimationFrame(raf); };
  }

  ZQ.screen({ id: 'exam', title: 'Topic exam', group: 'Assessment', shell: false, render: (root, Z) => mountExam(root, Z) });
  ZQ.screen({ id: 'exam-result', title: 'Exam result', group: 'Assessment', shell: false, render: (root, Z) => mountResult(root, Z, EXAMPLE) });
})();
