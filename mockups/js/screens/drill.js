/* Verified code drill (#drill). Runs real Python in the browser: Pyodide (vendor/pyodide) inside a Web Worker
   (drill-worker.js), so a run that passes the 5-second limit can be terminated. Visible examples on Run, hidden
   tests on Submit, the first failing test shown with its input and a diff of expected against actual.
   Problems live in a small registry. The screen opens:
     - Homework 1, item 7 ("Conditional probability in code", p_given) when the learner arrives from #homework.
       Homework mode has no hint, no reference solution and no XP (spec 5.5, 8.2), and a pass emits 'drill:verified'.
     - the problem named by store key 'drill.current' when another screen sets it (read once), else
     - "Maximum drawdown" (topic 1.1 Python, part of the 1.1 exit project).
   Per problem, the draft is saved in 'drill.<id>.code' and { failed, revealed, done, ran, code } in 'drill.<id>.state',
   so the XP rules survive a reopen. A pass also sets 'drill.<id>.verified'.
   Spec: docs/design-research.md 2.10 and 2.11 (frame, button group), 3 (terminal glyph, flag), 4.5 (feedback, reveal),
   4.8 (tangram loader), 4.9 (sound, reduced motion), 5.1 (card utilities, Start over), 5.3 #10 (code editor),
   5.4 (button states), 5.5 (hints), 9.2 (voice), 10 (code drills).
   Every class carries the drl- prefix; sheet content uses drl-sh-. Test hook: window.ZQDrill while the screen is open. */
(function () {
  'use strict';

  const LIMIT_MS = 5000;
  const LOAD_LIMIT_MS = 60000;
  const XP = { first: 30, retry: 10 };
  const HW = { name: 'Homework 1', item: 7 };
  const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const num = (n) => (n < 10 ? WORDS[n] : String(n));

  /* Python-style float text: 100 -> "100.0", 0.25 -> "0.25" */
  const pyf = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
  const pyList = (a) => '[' + a.map(pyf).join(', ') + ']';

  /* ---------- Problem: maximum drawdown (1.1 Python) ----------
     Expected values checked in CPython against the reference and an O(n^2) brute force. */
  const WALK = { n: 200000, seed: 20261006, start: 100, step: 0.001 };
  const MDD = {
    id: 'max_drawdown', fn: 'max_drawdown', track: 'code', topic: '1.1 Python', course: 'Python Foundations', title: 'Maximum drawdown',
    compare: 'isclose', prelude: '',
    starter: [
      'def max_drawdown(prices):',
      '    """Return the maximum drawdown',
      '    of prices, as a fraction."""',
      '    # Your code here',
      '    return 0.0',
      '',
    ].join('\n'),
    reference: [
      'def max_drawdown(prices):',
      '    # Highest price so far',
      '    peak = 0.0',
      '    # Largest drawdown so far',
      '    worst = 0.0',
      '    for p in prices:',
      '        peak = max(peak, p)',
      '        worst = max(worst, 1 - p / peak)',
      '    return worst',
      '',
    ].join('\n'),
    examples: [
      { name: 'Example 1', prices: [100, 120, 90, 110], expected: 0.25, note: 'The peak is 120 and the lowest later price is 90, so $1 - \\tfrac{90}{120} = 0.25$.' },
      { name: 'Example 2', prices: [50, 40, 60, 30, 70], expected: 0.5, note: 'The fall from 50 to 40 is 0.2. Then the new high of 60 falls to 30, which is $1 - \\tfrac{30}{60} = 0.5$.' },
    ],
    hidden: [
      { name: 'Empty list', prices: [], expected: 0, why: 'With no prices there is nothing to fall from. Return `0.0` before you read `prices[0]`.' },
      { name: 'Single price', prices: [100], expected: 0, why: 'One price has no later low, so its drawdown is `0.0`.' },
      { name: 'Rising prices', prices: [100, 101, 103.5, 110, 125], expected: 0, why: 'Prices that only rise never fall from a high. Measure each price against the highest price so far, not the overall high.' },
      { name: 'Falling prices', prices: [100, 90, 80, 50], expected: 0.5, why: 'The first price is the peak and every later price sits below it. Make sure the first day counts.' },
      { name: 'Crash, then recovery', prices: [100, 50, 75, 100, 120], expected: 0.5, why: 'A recovery does not undo the loss. Keep the largest drawdown, not the latest one.' },
      { name: 'New high after a drawdown', prices: [100, 80, 120, 60, 130], expected: 0.5, why: 'After 120 the peak is 120, not 100. Move the peak up whenever the price makes a new high.' },
      { name: 'Smaller second drawdown', prices: [100, 70, 100, 110, 99], expected: 0.3, why: 'The second fall, 110 to 99, is smaller than the first. Keep the largest drawdown seen so far.' },
      { name: 'Daily closes', prices: [101.25, 99.8, 102.4, 97.15, 98.6, 103.9, 100.05, 104.2], expected: 0.05126953125, why: 'Return a fraction of the peak, $1 - P_t / \\text{peak}$, not a percentage or a price gap. Do not round.' },
      { name: 'Fall on the last day', prices: [80, 100, 125, 75], expected: 0.4, why: 'The worst fall comes on the final price. Check that your loop reaches the last element.' },
      { name: 'Long series', gen: WALK, expected: 0.4099895680221377, preview: '[99.9877, 100.0509, 100.052, …, 61.8678]',
        why: 'This test has 200,000 prices. A loop inside a loop takes about $2 \\times 10^{10}$ steps here; one pass takes $2 \\times 10^{5}$.' },
    ],
    input: (d) => (d.gen ? `prices = ${d.preview}` : `prices = ${pyList(d.prices)}`),
    inputNote: (d) => (d.gen ? '200,000 prices from a seeded random walk, rounded here' : ''),
    call: (d) => `max_drawdown(${d.gen ? '…' : pyList(d.prices)})`,
    expect: (d) => pyf(d.expected),
    test: (d) => (d.gen ? { gen: d.gen, expected: d.expected } : { prices: d.prices, expected: d.expected }),
    lead: (fmt, Z) => `
      <p class="t-prose">Maximum drawdown is the worst fall from a high to a later low. Risk reports quote it beside volatility. It is the loss you would have sat through if you bought at the top.</p>
      <p class="t-prose">Write ${fmt('`max_drawdown(prices)`.')} It takes prices in time order and returns the maximum drawdown as a fraction from 0 to 1.</p>
      <div class="drl-def">
        <p class="t-body">The drawdown on day ${fmt('$t$')} compares the price with the highest price so far:</p>
        <div class="drl-disp">${Z.tex('D_t = 1 - \\dfrac{P_t}{\\max\\limits_{s \\le t} P_s}', true)}</div>
        <p class="t-body">The maximum drawdown is ${fmt('$\\max_t D_t$.')} Return ${fmt('`0.0`')} for an empty list or a single price. Every price is a positive float.</p>
      </div>`,
    cons: ['$O(n)$ time, where $n$ is the number of prices. One pass is enough.', '$0 \\le n \\le 200{,}000$.', 'Standard library only. NumPy and pandas are not loaded.', 'All tests share a 5-second time limit.'],
    hint: 'Walk the list once and carry two numbers: the highest price so far, and the largest drawdown so far. Each new price either raises the peak or is measured against it.',
    how: { lead: 'Submit runs 10 hidden tests, from an empty list to 200,000 prices. Each answer is accepted when', rule: 'math.isclose(actual, expected,\n             rel_tol=1e-9)', tail: 'is true, so `0.30000000000000004` counts as `0.3`.' },
    accept: 'Accepted: `math.isclose(actual, expected, rel_tol=1e-9)`.',
    where: 'Part of the 1.1 exit project: returns, annualised volatility and maximum drawdown from a CSV of daily prices.',
    refPoints: ['`peak` holds the highest price so far, so each price is measured against the right high.', '`worst` keeps the largest drawdown, so a later recovery cannot erase it.', 'Each price is read once: $O(n)$ time and $O(1)$ extra memory.'],
    refNote: 'Starting `peak` at `0.0` is safe because every price is positive, so the first price always becomes the peak.',
    wrongType: (t) => `Your function returned \`${t}\`. Return a float.`,
  };

  /* ---------- Problem: conditional probability in code (Homework 1, item 7; 1.5 Probability) ----------
     Two fair dice, 36 ordered rolls. Expected values checked in CPython by enumerating the rolls. */
  const PG = {
    id: 'p_given', fn: 'p_given', track: 'prob', topic: '1.5 Probability', course: 'Conditional Probability', title: 'Conditional probability',
    compare: 'fraction', prelude: 'from fractions import Fraction',
    starter: [
      'from fractions import Fraction',
      '',
      '',
      'def p_given(a, b):',
      '    """P(a | b) for two fair dice.',
      '    a and b take a roll (d1, d2)',
      '    and return True or False."""',
      '    # Your code here',
      '    return Fraction(0)',
      '',
    ].join('\n'),
    reference: [
      'from fractions import Fraction',
      '',
      '',
      'def p_given(a, b):',
      '    rolls = [(i, j) for i in range(1, 7)',
      '             for j in range(1, 7)]',
      '    given = [d for d in rolls if b(d)]',
      '    both = [d for d in given if a(d)]',
      '    return Fraction(len(both), len(given))',
      '',
    ].join('\n'),
    examples: [
      { name: 'Example 1', a: 'lambda d: d[0] + d[1] == 8', b: 'lambda d: d[0] == 5', expected: 'Fraction(1, 6)', note: 'Given a first die of 5, six rolls remain and only $(5, 3)$ totals 8, so the answer is $\\tfrac{1}{6}$.' },
      { name: 'Example 2', a: 'lambda d: d[0] == 6', b: 'lambda d: d[0] + d[1] == 8', expected: 'Fraction(1, 5)', note: 'Five rolls total 8 and one of them, $(6, 2)$, starts with 6, so the answer is $\\tfrac{1}{5}$.' },
      { name: 'Example 3', a: 'lambda d: d[0] + d[1] == 7', b: 'lambda d: d[0] + d[1] == 8', expected: 'Fraction(0, 1)', note: 'A total cannot be 7 and 8 at once, so the answer is 0.' },
    ],
    hidden: [
      { name: 'Given any roll', a: 'lambda d: d[0] == d[1]', b: 'lambda d: True', expected: 'Fraction(1, 6)', why: 'When $B$ always holds, $P(A \\mid B) = P(A)$: 6 doubles out of 36 rolls.' },
      { name: 'Certain event', a: 'lambda d: d[0] + d[1] >= 2', b: 'lambda d: d[0] == 3', expected: 'Fraction(1, 1)', why: 'Every total is at least 2, so the answer is 1. Count only the rolls where `b` holds, then the ones where `a` also holds.' },
      { name: 'Doubles, given an even total', a: 'lambda d: d[0] == d[1]', b: 'lambda d: (d[0] + d[1]) % 2 == 0', expected: 'Fraction(1, 3)', why: 'Divide by the 18 rolls with an even total, not by 36. All 6 doubles have an even total, so the answer is $\\tfrac{6}{18}$.' },
      { name: 'Not the reverse', a: 'lambda d: d[0] == 6', b: 'lambda d: d[0] + d[1] >= 11', expected: 'Fraction(2, 3)', why: 'Here $P(A \\mid B) = \\tfrac{2}{3}$ but $P(B \\mid A) = \\tfrac{1}{3}$. Filter the rolls on `b` first, then test `a`.' },
      { name: 'Ordered pairs', a: 'lambda d: d[0] < d[1]', b: 'lambda d: d[0] != d[1]', expected: 'Fraction(1, 2)', why: 'A roll is an ordered pair, so $(1, 2)$ and $(2, 1)$ are different outcomes. Loop over all 36 rolls.' },
      { name: 'A six, given 10 or more', a: 'lambda d: 6 in d', b: 'lambda d: d[0] + d[1] >= 10', expected: 'Fraction(5, 6)', why: 'Six rolls total 10 or more, and five of them contain a 6.' },
      { name: 'Highest die 4, given a total of 7', a: 'lambda d: max(d) == 4', b: 'lambda d: d[0] + d[1] == 7', expected: 'Fraction(1, 3)', why: 'Of the six rolls that total 7, only $(3, 4)$ and $(4, 3)$ have a highest die of 4.' },
      { name: 'Lowest terms', a: 'lambda d: d[0] + d[1] <= 4', b: 'lambda d: d[0] != d[1]', expected: 'Fraction(2, 15)', why: 'Four of the 30 rolls without a double total 4 or less, and $\\tfrac{4}{30} = \\tfrac{2}{15}$. Build the answer from the two counts with `Fraction`.' },
    ],
    input: (d) => `a = ${d.a}\nb = ${d.b}`,
    inputNote: () => '',
    call: (d) => `p_given(${d.a}, ${d.b})`,
    expect: (d) => d.expected,
    test: (d) => ({ args: `(${d.a}, ${d.b})`, expected: d.expected }),
    lead: (fmt, Z) => `
      <p class="t-prose">Roll two fair dice. A roll is an ordered pair ${fmt('$(d_1, d_2)$,')} so there are 36 equally likely rolls.</p>
      <p class="t-prose">Write ${fmt('`p_given(a, b)`.')} Each event arrives as a function that takes a roll and returns True or False. Return ${fmt('$P(A \\mid B)$')} as an exact ${fmt('`Fraction`.')}</p>
      <div class="drl-def">
        <p class="t-body">With equally likely rolls, conditioning is counting. Keep the rolls where ${fmt('$B$')} holds, then count those where ${fmt('$A$')} holds too:</p>
        <div class="drl-disp">${Z.tex('P(A \\mid B) = \\dfrac{|A \\cap B|}{|B|}', true)}</div>
        <p class="t-body">A roll is a tuple, so ${fmt('`d[0]`')} is the first die. Every test gives a ${fmt('`b`')} that holds for at least one roll.</p>
      </div>`,
    cons: ['There are only 36 rolls, so a loop over every roll is fast enough.', 'Return a `Fraction`, not a float. The tests compare exactly.', 'Standard library only. The starter imports `Fraction` for you.', 'All tests share a 5-second time limit.'],
    hint: 'List the 36 rolls. Keep the ones where `b` holds, count how many of those also satisfy `a`, and return the two counts as a `Fraction`.',
    how: { lead: 'Submit runs 8 hidden tests. Each answer is accepted when', rule: 'isinstance(actual, Fraction)\nand actual == expected', tail: 'is true, so a float such as `0.5` does not count, even when it equals the answer.' },
    accept: 'Accepted: a `Fraction` exactly equal to the expected value.',
    where: 'Item 7 of Homework 1, Updating on evidence, in Conditional Probability.',
    refPoints: ['`rolls` lists all 36 ordered pairs, each equally likely.', 'Keeping the rolls where `b` holds shrinks the sample space to $B$.', 'The answer is the share of those that also satisfy `a`, $\\tfrac{|A \\cap B|}{|B|}$, kept exact by `Fraction`.'],
    refNote: '`Fraction` reduces to lowest terms, so 4 of 30 comes back as `Fraction(2, 15)`.',
    wrongType: (t) => `Your function returned \`${t}\`, not \`Fraction\`. Build the answer from the two counts with \`Fraction\` so it stays exact.`,
  };
  const PROBLEMS = { [MDD.id]: MDD, [PG.id]: PG };

  const fmtMs = (ms) => (ms == null ? '' : ms < 0.1 ? '<0.1 ms' : ms < 10 ? ms.toFixed(1) + ' ms' : ms < 1000 ? Math.round(ms) + ' ms' : (ms / 1000).toFixed(2) + ' s');

  /* ---------- Python syntax highlighting (keywords, builtins, strings, numbers, comments) ---------- */
  const KW = new Set('False None True and as assert async await break case class continue def del elif else except finally for from global if import in is lambda match nonlocal not or pass raise return try while with yield'.split(' '));
  const BI = new Set('abs all any bool dict enumerate filter float int isinstance len list map max min print range reversed round set sorted str sum tuple zip'.split(' '));
  const TOK = /(#[^\n]*)|((?:\b[rRbBfFuU]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?))|(\b\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?\d+)?j?|\.\d[\d_]*(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*)/g;
  const escH = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const highlight = (src) => {
    let out = '', last = 0, prev = '';
    src.replace(TOK, (m, com, str, nm, id, at) => {
      out += escH(src.slice(last, at)); last = at + m.length;
      let cls = '';
      if (com) cls = 'com';
      else if (str) cls = /^[rRbBfFuU]{0,2}("""|''')/.test(str) ? 'doc' : 'str';
      else if (nm) cls = 'num';
      else if (id) cls = KW.has(id) ? 'kw' : (prev === 'def' || prev === 'class') ? 'fn' : BI.has(id) ? 'bi' : '';
      prev = id || '';
      out += cls ? `<span class="tok-${cls}">${escH(m)}</span>` : escH(m);
      return m;
    });
    return out + escH(src.slice(last));
  };

  /* ---------- Tangram loader (spec 4.8): seven flat pieces morph die -> rising arrow -> bell curve,
     700ms ease-morph with 400ms holds. Geometry shared in spirit with the onboarding loader. ---------- */
  const normalise = (poly) => {
    let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; }
    const pts = a < 0 ? poly.slice().reverse() : poly.slice();
    let k = 0; pts.forEach((p, i) => { if (p[0] + p[1] < pts[k][0] + pts[k][1] - 0.01) k = i; });
    return pts.slice(k).concat(pts.slice(0, k));
  };
  const DIE = (() => {
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
    const segX = (P, Q, hh) => seg(ext(Q, P, 4), ext(P, Q, 4), hh);
    const L = Math.hypot(Dn[0] - C[0], Dn[1] - C[1]), ux = (Dn[0] - C[0]) / L, uy = (Dn[1] - C[1]) / L;
    const nx = -uy * 21, ny = ux * 21, K = [Dn[0] - ux * 2, Dn[1] - uy * 2], tip = [Dn[0] + ux * 30, Dn[1] + uy * 30];
    return [segX(A, mid(A, B), h), segX(mid(A, B), B, h), segX(B, C, h), segX(C, mid(C, Dn), h), segX(mid(C, Dn), Dn, h),
      [K, [K[0] + nx, K[1] + ny], tip, tip], [K, tip, [K[0] - nx, K[1] - ny], [K[0] - nx, K[1] - ny]]].map(normalise);
  })();
  const BELL = (() => {
    const top = (x) => 102 - 84 * Math.exp(-0.5 * Math.pow((x - 60) / 19.5, 2));
    const x0 = 7, w = 106 / 7;
    return Array.from({ length: 7 }, (_, i) => { const a = x0 + i * w, b = a + w, m = (a + b) / 2;
      return [[a, top(a)], [m, top(m)], [b, top(b)], [b, 102], [a, 102]]; });
  })();
  const withMid = (q) => [q[0], [(q[0][0] + q[1][0]) / 2, (q[0][1] + q[1][1]) / 2], q[1], q[2], q[3]];
  const SHAPES = [DIE.map(withMid), ARROW.map(withMid), BELL];
  const easeMorph = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // = cubic-bezier(0.65, 0, 0.35, 1)
  const ptsOf = (poly) => poly.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  const tangramSVG = () => `<svg class="drl-tg" viewBox="0 0 120 120" aria-hidden="true">${SHAPES[0].map(p => `<polygon points="${ptsOf(p)}"/>`).join('')}</svg>`;

  /* ---------- Editor: textarea over a synchronised highlighted pre, with line numbers ---------- */
  function Editor(host, { value, label, describedBy, onInput, onRun, onSubmit }) {
    host.innerHTML = `<div class="drl-gut" aria-hidden="true"><div class="drl-gut-in"></div></div>
      <div class="drl-ed-main"><pre class="drl-hl" aria-hidden="true"><code></code></pre>
        <textarea class="drl-ta" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="${label}" aria-describedby="${describedBy}"></textarea></div>`;
    const ta = host.querySelector('textarea'), code = host.querySelector('code'), gut = host.querySelector('.drl-gut-in');
    let lines = 0, cur = -1, escArmed = false;
    const lineStartOf = (v, i) => v.lastIndexOf('\n', i - 1) + 1;
    const scroll = () => {
      code.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`;
      gut.style.transform = `translateY(${-ta.scrollTop}px)`;
    };
    const mark = () => {
      const line = ta.value.slice(0, ta.selectionStart).split('\n').length - 1;
      if (line === cur) return;
      if (gut.children[cur]) gut.children[cur].classList.remove('cur');
      cur = line;
      if (gut.children[cur]) gut.children[cur].classList.add('cur');
    };
    const paint = () => {
      const v = ta.value;
      code.innerHTML = highlight(v) + '\n';
      const n = v.split('\n').length;
      if (n !== lines) { lines = n; gut.innerHTML = Array.from({ length: n }, (_, i) => `<span>${i + 1}</span>`).join(''); cur = -1; }
      mark(); scroll();
    };
    /* Replace a range through the browser's editing commands so Ctrl+Z still works; fall back to setRangeText */
    const edit = (start, end, text, selStart, selEnd = selStart) => {
      ta.focus();
      ta.setSelectionRange(start, end);
      let ok = false;
      if (start !== end || text) {
        try { ok = text ? document.execCommand('insertText', false, text) : document.execCommand('delete'); } catch { ok = false; }
        if (!ok) { ta.setRangeText(text, start, end, 'end'); paint(); onInput(ta.value); }
      }
      ta.setSelectionRange(selStart, selEnd);
      mark();
    };
    const indent = (out) => {
      const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
      const multi = v.slice(s, e).includes('\n');
      if (!multi && !out) { edit(s, e, '    ', s + 4); return; }
      const a = lineStartOf(v, s);
      const endAt = e > s && v[e - 1] === '\n' ? e - 1 : e;
      let b = v.indexOf('\n', endAt); if (b < 0) b = v.length;
      const old = v.slice(a, b);
      let first = 0, total = 0;
      const next = old.split('\n').map((ln, k) => {
        if (!out) { if (k === 0) first = 4; total += 4; return '    ' + ln; }
        const n = ln.match(/^ {0,4}/)[0].length; if (k === 0) first = -n; total -= n; return ln.slice(n);
      }).join('\n');
      if (next === old) return;
      edit(a, b, next, Math.max(a, s + first), multi ? e + total : Math.max(a, e + first));
    };
    const newline = () => {
      const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
      const line = v.slice(lineStartOf(v, s), s);
      let ind = line.match(/^ */)[0];
      if (line.replace(/#.*$/, '').trimEnd().endsWith(':')) ind += '    ';
      else if (/^\s*(return|pass|break|continue|raise)\b/.test(line)) ind = ind.slice(0, Math.max(0, ind.length - 4));
      edit(s, e, '\n' + ind, s + 1 + ind.length);
    };
    ta.addEventListener('keydown', (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); (ev.shiftKey ? onSubmit : onRun)(); return; }
      if (ev.key === 'Escape') { escArmed = true; return; }
      if (ev.key === 'Tab' && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
        if (escArmed) { escArmed = false; return; } // Esc then Tab leaves the editor
        ev.preventDefault(); indent(ev.shiftKey); return;
      }
      if (ev.key !== 'Shift') escArmed = false;
      if (ev.key === 'Enter' && !ev.isComposing && !ev.shiftKey && !ev.altKey) { ev.preventDefault(); newline(); return; }
      if (ev.key === 'Backspace' && ta.selectionStart === ta.selectionEnd) {
        const v = ta.value, s = ta.selectionStart, before = v.slice(lineStartOf(v, s), s);
        if (before.length && /^ +$/.test(before)) { const n = before.length % 4 || 4; ev.preventDefault(); edit(s - n, s, '', s - n); }
      }
    });
    ta.addEventListener('input', () => { paint(); onInput(ta.value); });
    ta.addEventListener('scroll', scroll, { passive: true });
    ['keyup', 'click', 'focus', 'select'].forEach(t => ta.addEventListener(t, mark));
    ta.value = value;
    paint();
    return {
      el: ta,
      get value() { return ta.value; },
      set(v) { ta.value = v; paint(); onInput(v); },         // direct, for the test hook
      replaceAll(v) { edit(0, ta.value.length, v, 0); ta.scrollTop = 0; ta.scrollLeft = 0; scroll(); }, // undoable
    };
  }

  /* ---------- Python runner: owns the worker, the load state and the 5-second limit ---------- */
  function PyRunner(onStatus) {
    let w = null, status = 'idle', version = '', reason = '', loadTimer = 0, run = null, gen = 0;
    const indexURL = new URL('vendor/pyodide/', location.href).href;
    const workerURL = new URL('js/screens/drill-worker.js', location.href).href;
    const set = (s) => { status = s; onStatus(s); };
    const kill = () => {
      clearTimeout(loadTimer);
      if (run) { clearTimeout(run.timer); run = null; }
      if (w) { w.onmessage = null; w.onerror = null; w.terminate(); w = null; }
    };
    const unavailable = (msg) => { kill(); reason = msg; set('unavailable'); };
    const end = (info) => { const r = run; if (!r) return; clearTimeout(r.timer); run = null; r.onEnd(info); };
    const start = (restart = false) => {
      kill();
      const my = ++gen;
      set(restart ? 'restarting' : 'loading');
      if (typeof WebAssembly !== 'object' || typeof Worker !== 'function') { unavailable('This browser cannot run WebAssembly in a background worker.'); return; }
      try { w = new Worker(workerURL, { type: 'module' }); } catch (err) { unavailable(String((err && err.message) || err)); return; }
      w.onmessage = (e) => {
        if (my !== gen) return;
        const m = e.data || {};
        if (m.type === 'ready') { clearTimeout(loadTimer); version = m.version; set('ready'); return; }
        if (m.type === 'fail') { unavailable(m.message); return; }
        if (!run || m.id !== run.id) return;
        if (m.type === 'event') { let d = null; try { d = JSON.parse(m.data); } catch { return; } run.onEvent(d); }
        else if (m.type === 'crash') run.crash = m.message;
        else if (m.type === 'end') { const crash = run.crash; end({ crash }); set('ready'); if (crash) start(true); }
      };
      w.onerror = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (my !== gen) return;
        const msg = (e && e.message) || 'The Python worker could not start.';
        if (run) { end({ crash: msg }); start(true); } else unavailable(msg);
      };
      w.postMessage({ type: 'init', indexURL });
      loadTimer = setTimeout(() => { if (my === gen) unavailable('Python took more than a minute to load.'); }, LOAD_LIMIT_MS);
    };
    const exec = (code, spec, onEvent, onEnd) => {
      if (status !== 'ready' || !w) return false;
      run = { id: Date.now() + Math.random(), onEvent, onEnd, crash: null };
      run.timer = setTimeout(() => { end({ timeout: true }); start(true); }, LIMIT_MS);
      set('running');
      w.postMessage({ type: 'run', id: run.id, code, spec });
      return true;
    };
    return { start, exec, kill, get status() { return status; }, get version() { return version; }, get reason() { return reason; } };
  }

  /* Remember where the learner came from, so Close and Continue go back there and homework opens its own item */
  let cameFrom = null;
  window.addEventListener('hashchange', (e) => {
    try {
      const n = new URL(e.newURL).hash.slice(1), o = new URL(e.oldURL).hash.slice(1);
      if (n === 'drill' && o && o !== 'drill') cameFrom = o;
    } catch { /* malformed URL: keep the previous value */ }
  });

  /* ---------- Screen ---------- */
  function mount(root, Z) {
    const esc = Z.esc, I = Z.icon, L = Z.data().learner;
    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
    const mod = mac ? '⌘' : 'Ctrl';

    /* Which problem: homework opens item 7; another screen can ask for one through 'drill.current' (read once);
       a reload keeps the last one opened. */
    const last = Z.store.get('drill.open', null);
    const req = Z.store.get('drill.current', null);
    if (req != null) Z.store.set('drill.current', null);
    let from = cameFrom, id;
    if (from) id = from === 'homework' ? PG.id : PROBLEMS[req] ? req : MDD.id;
    else { from = (last && last.from) || null; id = PROBLEMS[req] ? req : last && PROBLEMS[last.id] ? last.id : MDD.id; }
    Z.store.set('drill.open', { id, from });
    const P = PROBLEMS[id], hw = from === 'homework', back = from || 'today';
    const NX = P.examples.length, NH = P.hidden.length;

    const K = { code: `drill.${id}.code`, state: `drill.${id}.state` };
    const saved = Z.store.get(K.code, null);
    const st0 = Z.store.get(K.state, null) || {};
    const initial = typeof saved === 'string' && saved.trim() ? saved : P.starter;
    const S = {
      tab: 'brief', failed: hw ? 0 : st0.failed | 0, revealed: !hw && !!st0.revealed, done: !!st0.done, doneBefore: !!st0.done, ran: hw || !!st0.ran,
      verCode: st0.code || null, verified: false, dirtySinceVerify: false, retry: false,
      xp: 0, verdict: null, run: null, announcedReady: false,
    };
    S.verified = !hw && S.done && S.verCode === initial; // a verified solution reopens on Continue
    /* Homework keeps the standalone drill's attempts and reveal untouched; it only records a pass */
    const persist = () => Z.store.set(K.state, hw ? { ...st0, done: S.done, code: S.verCode }
      : { failed: S.failed, revealed: S.revealed, done: S.done, ran: S.ran, code: S.verCode });

    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };
    let alive = true;

    /* Inline copy: `code` and $maths$, with punctuation kept beside a formula */
    const fmt = (s) => String(s).split(/(\$[^$]+\$[.,;:]?|`[^`]+`[.,;:]?)/g).map((p, i) => {
      if (!(i % 2)) return esc(p);
      if (p[0] === '`') {
        const c = p.match(/^`([^`]+)`(.?)$/), html = `<code class="drl-ic">${esc(c[1])}</code>${esc(c[2])}`;
        return c[1].length > 24 ? html : `<span class="drl-nw">${html}</span>`; // long code may wrap
      }
      const m = p.match(/^\$([^$]+)\$(.?)$/);
      return `<span class="drl-nw">${Z.tex(m[1])}${esc(m[2])}</span>`;
    }).join('');
    const lines = (s) => esc(s).replace(/\n/g, '<br>');

    const exampleCard = (d, i) => `
      <div class="drl-exc">
        <p class="t-label drl-exc-h">Example ${i + 1}</p>
        <dl class="drl-io">
          <dt class="t-caption">Input</dt><dd><code>${lines(P.input(d))}</code></dd>
          <dt class="t-caption">Output</dt><dd><code>${esc(P.expect(d))}</code></dd>
        </dl>
        <p class="t-body drl-exc-why">${fmt(d.note)}</p>
      </div>`;
    const utils = (k) => `<div class="drl-utils drl-utils-${k}">
        <button type="button" class="icon-btn drl-flag" aria-label="Report a problem with this drill">${I('flag', 'sm')}</button>
        <button type="button" class="icon-btn drl-snd" aria-pressed="false" aria-label="Sound">${I('mute', 'sm')}</button>
      </div>`;
    const hintSummary = (locked) => `<span class="drl-hint-i">${I(locked ? 'lock' : 'bulb', 'sm')}</span><span class="drl-hint-l"><span>Hint</span>${locked ? '<span class="t-caption drl-hint-lk">Available after your first run</span>' : ''}</span>${locked ? '' : I('chevronD', 'sm drl-hint-c')}`;

    root.innerHTML = `
    <div class="drl${hw ? ' is-hw' : ''}" data-track="${P.track}" data-tab="brief">
      <div class="drl-wash" aria-hidden="true"></div>
      <header class="drl-top">
        <button type="button" class="icon-btn drl-close" aria-label="Close the drill. Your code is saved.">${I('close')}</button>
        <div class="drl-ttl">
          <span class="drl-glyph" aria-hidden="true">${I('terminal', 'sm')}</span>
          <span class="drl-ttl-t"><span class="drl-ttl-a">${esc(P.title)}</span><span class="t-caption drl-ttl-b">${hw ? `Code drill · ${HW.name}, item ${HW.item}` : `Code drill · ${esc(P.course)}`}</span></span>
        </div>
        <div class="drl-stats">
          ${hw ? '' : `<span class="drl-xp" role="img" aria-label="XP from this drill: 0"><span class="drl-xp-n tnum">0</span>${Z.spark(false)}</span>`}
          <span class="drl-bolt" role="img" aria-label="${L.todayDone ? 'Streak extended today' : 'Streak not yet extended today'}">${Z.bolt(L.todayDone)}</span>
        </div>
      </header>

      <div class="drl-tabbar">
        <div class="drl-tabs" role="tablist" aria-label="Drill">
          <button type="button" role="tab" id="drl-t-brief" aria-controls="drl-p-brief" aria-selected="true" data-tab="brief">Brief</button>
          <button type="button" role="tab" id="drl-t-code" aria-controls="drl-p-code" aria-selected="false" tabindex="-1" data-tab="code">Code</button>
          <button type="button" role="tab" id="drl-t-res" aria-controls="drl-p-res" aria-selected="false" tabindex="-1" data-tab="res">Results<span class="drl-badge" hidden></span></button>
        </div>
        ${utils('sm')}
      </div>

      <main class="drl-frame">
        <section class="drl-brief" id="drl-p-brief">
          ${utils('lg')}
          <div class="drl-brief-sc" tabindex="0" aria-label="Brief, scrollable">
            <div class="drl-brief-in">
              <p class="t-overline drl-ov">Code drill · ${esc(P.topic)}</p>
              <h1 class="t-lesson-title drl-h">${esc(P.title)}</h1>
              <div class="drl-meta">
                <span class="chip track">${I('terminal', 'xs')}${esc(P.course)}</span>
                <span class="chip soft">${I('timer', 'xs')}5 s limit</span>
                ${hw ? `<span class="chip soft">${I('clipboard', 'xs')}${HW.name} · item ${HW.item}</span>` : `<span class="chip soft drl-meta-xp">${Z.spark(false)}<span></span></span>`}
              </div>
              ${P.lead(fmt, Z)}

              <h2 class="t-h2 drl-sec">Examples</h2>
              <div class="drl-exs">${P.examples.map(exampleCard).join('')}</div>

              <h2 class="t-h2 drl-sec">Constraints</h2>
              <ul class="drl-cons t-body">${P.cons.map(c => `<li>${fmt(c)}</li>`).join('')}</ul>

              ${hw ? '' : `<details class="drl-hint"${S.ran ? '' : ' data-locked'}>
                <summary${S.ran ? '' : ' aria-disabled="true"'}>${hintSummary(!S.ran)}</summary>
                <div class="drl-hint-b t-body">${fmt(P.hint)}</div>
              </details>`}

              <div class="drl-how">
                <span class="drl-how-i" aria-hidden="true">${I('clipboard', 'sm')}</span>
                <div class="drl-how-t">
                  <p class="t-body">${fmt(P.how.lead)}</p>
                  <pre class="drl-how-c">${esc(P.how.rule)}</pre>
                  <p class="t-body">${fmt(P.how.tail)}</p>
                </div>
              </div>
              <p class="t-caption drl-where">${hw ? `${esc(P.where)} It counts once every example and hidden test passes. Homework has no hints.` : esc(P.where)}</p>
            </div>
          </div>
        </section>

        <section class="drl-code" id="drl-p-code">
          <div class="drl-ed-head">
            <span class="drl-file">${I('terminal', 'sm')}<span>solution.py</span></span>
            <span class="drl-py t-caption" data-py><i class="drl-dot" aria-hidden="true"></i><span data-py-t>Loading Python</span></span>
            <button type="button" class="link-btn drl-reset">Reset code</button>
          </div>
          <div class="drl-ed"></div>
          <p class="t-caption drl-keys" id="drl-keys"><kbd>Tab</kbd> indents, <kbd>Shift</kbd> <kbd>Tab</kbd> dedents. <kbd>Esc</kbd> then <kbd>Tab</kbd> leaves the editor. <kbd>${mod}</kbd> <kbd>Enter</kbd> runs the examples.</p>
        </section>

        <section class="drl-res" id="drl-p-res" tabindex="0">
          <div class="drl-res-head"><h2 class="t-h2">Results</h2><span class="t-caption drl-res-meta tnum"></span></div>
          <div class="drl-res-body"></div>
        </section>

        <footer class="drl-foot">
          <p class="t-caption drl-foot-note" hidden>Python could not start here, so the tests cannot run. Details are under Results.</p>
          <button type="button" class="link-btn drl-ref" hidden>Show reference solution</button>
          <div class="drl-actions">
            <button type="button" class="btn secondary drl-run" aria-label="Run examples" disabled><span class="drl-run-i">${I('play', 'sm')}</span><span class="drl-run-t">Run</span></button>
            <button type="button" class="btn drl-submit" disabled><span>Loading Python…</span></button>
          </div>
        </footer>
      </main>
      <p class="sr-only" aria-live="polite" data-live></p>
    </div>`;

    const $ = (s) => root.querySelector(s);
    const drl = $('.drl'), body = $('.drl-res-body'), meta = $('.drl-res-meta'), live = $('[data-live]');
    const runBtn = $('.drl-run'), subBtn = $('.drl-submit'), refBtn = $('.drl-ref'), resetBtn = $('.drl-reset'), badge = $('.drl-badge');
    const hint = $('.drl-hint'), briefSc = $('.drl-brief-sc');
    const say = (t) => { live.textContent = ''; later(() => { live.textContent = t; }, 30); };

    /* ---------- Tabs (below 1024px). The sections are tab panels only while the tabs show. ---------- */
    const mq = matchMedia('(max-width: 1023px)');
    const narrow = () => mq.matches;
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    const PANELS = [['brief', 'Brief'], ['code', 'Code'], ['res', 'Results']];
    const applyRoles = () => {
      const n = narrow();
      PANELS.forEach(([t, name]) => {
        const el = $('#drl-p-' + t);
        if (n) { el.setAttribute('role', 'tabpanel'); el.setAttribute('aria-labelledby', 'drl-t-' + t); el.removeAttribute('aria-label'); }
        else { el.removeAttribute('role'); el.removeAttribute('aria-labelledby'); el.setAttribute('aria-label', name); }
      });
    };
    const setTab = (t, focus = false) => {
      S.tab = t; drl.dataset.tab = t;
      tabs.forEach(b => { const on = b.dataset.tab === t; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
    };
    $('.drl-tabs').addEventListener('click', (e) => { const b = e.target.closest('[role="tab"]'); if (b) setTab(b.dataset.tab); });
    $('.drl-tabs').addEventListener('keydown', (e) => {
      const i = tabs.findIndex(b => b.dataset.tab === S.tab);
      const j = e.key === 'ArrowRight' ? (i + 1) % 3 : e.key === 'ArrowLeft' ? (i + 2) % 3 : e.key === 'Home' ? 0 : e.key === 'End' ? 2 : -1;
      if (j >= 0) { e.preventDefault(); setTab(tabs[j].dataset.tab, true); }
    });
    mq.addEventListener('change', applyRoles);
    applyRoles();

    /* ---------- Editor ---------- */
    let saveT = 0;
    const pristine = () => ed.value === P.starter;
    const ed = Editor($('.drl-ed'), {
      value: initial,
      label: 'Python code editor, solution.py', describedBy: 'drl-keys',
      onInput: (v) => {
        clearTimeout(saveT); saveT = setTimeout(() => Z.store.set(K.code, v), 400);
        if (S.retry) S.retry = false;          // editing after "Not quite right" is the Try again path
        if (S.verdict) setVerdict(null);
        if (S.verified) S.dirtySinceVerify = v !== S.verCode;
        paintButtons();
      },
      onRun: () => go('examples'), onSubmit: () => go('submit'),
    });
    resetBtn.addEventListener('click', () => { if (resetBtn.disabled) return; if (narrow()) setTab('code'); ed.replaceAll(P.starter); });

    /* ---------- Verdict: frame colour and page wash, as in the lesson player. A reveal uses hint indigo (spec 4.5). ---------- */
    const setVerdict = (v) => { S.verdict = v; ['ok', 'no', 'rev'].forEach(k => drl.classList.toggle('is-' + k, v === k)); };

    /* ---------- Hint: opens after the first run (spec 5.5); homework has none ---------- */
    const unlockHint = () => {
      if (!S.ran) { S.ran = true; persist(); }
      if (!hint || !hint.hasAttribute('data-locked')) return;
      hint.removeAttribute('data-locked');
      const sm = hint.querySelector('summary'); sm.removeAttribute('aria-disabled'); sm.innerHTML = hintSummary(false);
    };
    if (hint) {
      hint.querySelector('summary').addEventListener('click', (e) => { if (hint.hasAttribute('data-locked')) { e.preventDefault(); say('The hint opens after your first run.'); } });
      hint.addEventListener('toggle', () => { if (hint.hasAttribute('data-locked') && hint.open) hint.open = false; });
    }
    const openHint = () => {
      if (!hint) return;
      unlockHint();
      if (narrow()) setTab('brief');
      hint.open = true;
      later(() => {
        const top = hint.getBoundingClientRect().top - briefSc.getBoundingClientRect().top + briefSc.scrollTop - 16;
        briefSc.scrollTo({ top, behavior: Z.reducedMotion() ? 'auto' : 'smooth' });
        hint.querySelector('summary').focus({ preventScroll: true });
      }, 30);
    };

    /* ---------- Python status: buttons, editor status, results placeholder ---------- */
    let tgRaf = 0, tgT = 0;
    const stopTangram = () => { cancelAnimationFrame(tgRaf); clearTimeout(tgT); tgRaf = 0; tgT = 0; };
    const runTangram = (svg) => {
      stopTangram();
      if (!svg || Z.reducedMotion()) return;
      const polys = Array.from(svg.querySelectorAll('polygon'));
      let k = 0;
      const morph = () => {
        const a = SHAPES[k], b = SHAPES[(k + 1) % 3], t0 = performance.now();
        const step = (now) => {
          if (!alive || !svg.isConnected) return;
          const t = Math.min(1, (now - t0) / 700), e = easeMorph(t);
          polys.forEach((el, i) => el.setAttribute('points', a[i].map((p, j) => { const q = b[i][j]; return (p[0] + (q[0] - p[0]) * e).toFixed(2) + ',' + (p[1] + (q[1] - p[1]) * e).toFixed(2); }).join(' ')));
          if (t < 1) tgRaf = requestAnimationFrame(step); else { k = (k + 1) % 3; tgT = setTimeout(morph, 400); }
        };
        tgRaf = requestAnimationFrame(step);
      };
      tgT = setTimeout(morph, 400);
    };

    const py = PyRunner((st) => { paintButtons(); paintPy(); if (!S.run || st === 'unavailable') paintIdle(); });
    const paintPy = () => {
      const el = $('[data-py]'), st = py.status;
      el.className = 'drl-py t-caption is-' + st;
      $('[data-py-t]').textContent = st === 'ready' ? `Python ${py.version}` : st === 'running' ? `Running on Python ${py.version}`
        : st === 'unavailable' ? 'Python unavailable' : st === 'restarting' ? 'Restarting Python' : 'Loading Python';
      $('.drl-foot-note').hidden = st !== 'unavailable';
      if (st === 'ready' && !S.announcedReady) { S.announcedReady = true; say(`Python ${py.version} is ready.`); }
    };
    let pressed = null;
    /* Spec 5.4: idle (Submit flat and disabled until the first edit), engaged, evaluating, correct (Continue),
       not yet ([Get help] [Try again]). Run is the secondary button; on mobile it is the 48px round left slot. */
    const paintButtons = () => {
      const st = py.status, ready = st === 'ready';
      const cont = S.verified && !S.dirtySinceVerify;
      const help = S.retry && !cont && !!hint;
      runBtn.classList.toggle('is-help', help);
      runBtn.querySelector('.drl-run-i').innerHTML = I(help ? 'bulb' : 'play', 'sm');
      runBtn.querySelector('.drl-run-t').textContent = help ? 'Get help' : 'Run';
      runBtn.setAttribute('aria-label', help ? 'Get help: open the hint' : 'Run examples');
      runBtn.disabled = help ? false : !ready;
      runBtn.setAttribute('aria-busy', String(st === 'running' && pressed === 'examples'));
      const label = cont ? 'Continue' : S.retry ? 'Try again'
        : st === 'loading' ? 'Loading Python…' : st === 'restarting' ? 'Restarting Python…' : st === 'unavailable' ? 'Python unavailable'
        : st === 'running' && pressed === 'submit' ? 'Running tests…' : 'Submit';
      subBtn.querySelector('span').textContent = label;
      subBtn.classList.toggle('correct', cont && !S.revealed);
      subBtn.classList.toggle('notyet', !cont && S.retry);
      subBtn.disabled = cont || S.retry ? false : !ready || pristine();
      refBtn.hidden = hw || cont || !(S.revealed || S.failed >= 2);
      refBtn.textContent = S.revealed ? 'Reference solution' : 'Show reference solution';
      resetBtn.disabled = pristine();
    };
    const paintMeta = () => {
      const el = $('.drl-meta-xp span');
      if (el) el.textContent = S.revealed ? 'No XP: solution viewed' : S.doneBefore ? 'Verified before · 0 XP' : S.done ? `Verified · ${S.xp} XP` : `${S.failed ? XP.retry : XP.first} XP`;
    };

    const paintIdle = () => {
      const st = py.status;
      meta.textContent = '';
      if (st === 'unavailable') {
        stopTangram();
        body.innerHTML = `<div class="drl-notice" role="alert">
          <span class="drl-notice-i" aria-hidden="true">${I('terminal')}</span>
          <div class="drl-notice-t">
            <p class="t-h2">Python could not start here</p>
            <p class="t-body">This drill runs Python in a background worker with WebAssembly, and this browser or host blocked it. You can still read the brief and write your solution.</p>
            <p class="t-caption drl-reason">Reason: ${esc(py.reason || 'unknown')}</p>
            <button type="button" class="btn secondary drl-retry">${I('replay', 'sm')}<span>Try again</span></button>
          </div></div>`;
        body.querySelector('.drl-retry').addEventListener('click', () => py.start());
        badge.hidden = false; badge.className = 'drl-badge is-no'; badge.innerHTML = I('cross', 'xs');
        return;
      }
      if (S.run) return;
      const loading = st === 'loading' || st === 'restarting';
      const wasLoading = !!body.querySelector('.drl-load');
      if (loading && wasLoading) return; // keep the loader running across status repaints
      stopTangram();
      body.innerHTML = `<div class="drl-empty">
        ${loading ? `<div class="drl-load">${tangramSVG()}<div class="drl-load-t"><p class="t-label">${st === 'restarting' ? 'Restarting Python…' : 'Loading Python…'}</p><p class="t-caption">The first load takes a few seconds. Python runs on this device, not on a server.</p></div></div>` : ''}
        <span class="drl-empty-i${S.verified ? ' is-ok' : ''}" aria-hidden="true">${I(S.verified ? 'check' : 'terminal')}</span>
        ${S.verified
          ? `<p class="t-body">You verified this code on an earlier visit.</p><p class="t-caption">Change it and Submit runs the ${num(NH)} hidden tests again. Repeats earn no XP.</p>`
          : `<p class="t-body">Nothing has run yet.</p><p class="t-caption">Run checks the ${num(NX)} examples in the brief. Submit runs the ${num(NH)} hidden tests.</p>`}
      </div>`;
      if (loading) runTangram(body.querySelector('.drl-tg'));
    };

    /* ---------- Results ---------- */
    const ST = { pending: ['', 'Waiting'], running: ['', 'Running'], pass: ['check', 'Passed'], fail: ['cross', 'Failed'], error: ['cross', 'Error'], timeout: ['clock', 'Timed out'], skip: ['minus', 'Not run'] };
    const rowHTML = (R, i) => {
      const d = R.defs[i], r = R.res[i], [ic, label] = ST[r.status];
      const t = (r.status === 'pass' || r.status === 'fail' || r.status === 'error') ? fmtMs(r.ms) : '';
      const sub = R.mode === 'examples' ? `<span class="drl-call">${esc(P.call(d))}</span>` : '';
      return `<li class="drl-row is-${r.status}" data-i="${i}">
        <div class="drl-row-l">
          <span class="drl-st" aria-hidden="true">${ic ? I(ic) : ''}</span>
          <span class="drl-nm"><span class="drl-n tnum">${i + 1}</span><span class="drl-nm-t"><span>${esc(d.name)}</span>${sub}</span></span>
          <span class="drl-stx">${label}${t ? `<span class="drl-ms tnum">${t}</span>` : ''}</span>
        </div></li>`;
    };
    const setRow = (i) => {
      const li = body.querySelector(`.drl-row[data-i="${i}"]`);
      if (li) li.outerHTML = rowHTML(S.run, i);
    };

    const go = (mode) => {
      if (mode === 'submit' && S.verified && !S.dirtySinceVerify) { leave(); return; }
      if (py.status !== 'ready') { if (py.status !== 'running') say(py.status === 'unavailable' ? 'Python is unavailable in this browser.' : 'Python is still loading.'); return; }
      if (mode === 'submit' && pristine()) { say('Change the starter code before you submit.'); return; }
      const defs = mode === 'examples' ? P.examples : P.hidden;
      const R = S.run = { mode, defs, code: ed.value, res: defs.map(() => ({ status: 'pending' })), loaded: false, loadOut: '', loadErr: null, ms: null, timeout: false, crash: null };
      pressed = mode;
      S.retry = false;
      unlockHint();
      setVerdict(null);
      drl.classList.add('has-run');
      if (narrow()) setTab('res');
      const n = defs.length;
      meta.textContent = mode === 'examples' ? `${n} examples` : `${n} hidden tests`;
      stopTangram();
      body.innerHTML = `<div class="drl-sum"><p class="t-body drl-sum-run">${mode === 'examples' ? `Running the ${num(n)} examples…` : `Running ${num(n)} hidden tests…`}</p></div>
        <ol class="drl-rows" aria-label="${mode === 'examples' ? 'Examples' : 'Hidden tests'}">${defs.map((_, i) => rowHTML(R, i)).join('')}</ol>
        <div class="drl-out" hidden></div>`;
      body.scrollTop = 0;
      badge.hidden = false; badge.className = 'drl-badge is-run'; badge.textContent = '…';
      say(mode === 'examples' ? 'Running the examples.' : `Running ${n} hidden tests.`);
      const spec = { fn: P.fn, compare: P.compare, prelude: P.prelude, tests: defs.map(P.test) };
      const ok = py.exec(R.code, spec, (d) => onEvent(R, d), (info) => onEnd(R, info));
      if (!ok) { S.run = null; paintIdle(); }
      paintButtons();
    };

    const onEvent = (R, d) => {
      if (R !== S.run) return;
      if (d.kind === 'loaded') { R.loaded = true; R.loadOut = d.stdout || ''; R.res[0].status = 'running'; setRow(0); }
      else if (d.kind === 'error') R.loadErr = d;
      else if (d.kind === 'test') {
        R.res[d.i] = { status: d.ok ? 'pass' : d.error ? 'error' : 'fail', actual: d.actual, error: d.error, stdout: d.stdout, ms: d.ms, number: d.number, type: d.type };
        setRow(d.i);
        if (d.i + 1 < R.defs.length) { R.res[d.i + 1].status = 'running'; setRow(d.i + 1); }
      } else if (d.kind === 'done') R.ms = d.ms;
    };

    /* Why the first failing test failed: mechanical causes first, then the test's own note (none in homework) */
    const whyFor = (R, d, r) => {
      if (r.status === 'timeout') return d.gen ? d.why : 'Your code was still running when the limit hit, so Python was restarted. Look for a loop that never ends.';
      if (r.status === 'error' && R.crash) return 'Python stopped while running this test, often from memory use. Python has been restarted.';
      if (r.status === 'fail' && !r.number) return r.type === 'NoneType' ? 'Your function returned `None`. Check that every path reaches `return`.' : P.wrongType(r.type);
      const note = (hw ? '' : d.why) || d.note || '';
      if (r.status === 'error' && !note) return 'Your function raised an error on this input. The traceback shows the line.';
      return note;
    };

    const onEnd = (R, { timeout, crash }) => {
      if (R !== S.run) return;
      R.timeout = !!timeout; R.crash = crash || null;
      const n = R.defs.length;
      const changed = [];
      if (R.loadErr) R.res.forEach((r, i) => { r.status = 'skip'; changed.push(i); });
      else if (timeout || crash) {
        const k = R.res.findIndex(r => r.status === 'running' || r.status === 'pending');
        R.res.forEach((r, i) => { if (r.status === 'running' || r.status === 'pending') { r.status = i === k && R.loaded ? (timeout ? 'timeout' : 'error') : 'skip'; changed.push(i); } });
      }
      const passed = R.res.filter(r => r.status === 'pass').length;
      const first = R.res.findIndex(r => r.status !== 'pass');
      const all = passed === n;
      const msTxt = R.ms != null ? fmtMs(R.ms) : timeout ? 'stopped at 5 s' : '';
      meta.textContent = `${n} ${R.mode === 'examples' ? 'examples' : 'tests'}${msTxt ? ' · ' + msTxt : ''}`;
      changed.forEach(setRow); // rows that already showed their result keep it, so their badges do not pop twice
      const accepted = `<p class="t-caption drl-acc">${fmt(P.accept)}</p>`;

      /* Summary */
      const sum = body.querySelector('.drl-sum');
      if (R.mode === 'submit' && all) {
        const repeat = S.done, rev = S.revealed;
        const xpGain = hw || repeat || rev ? 0 : S.failed ? XP.retry : XP.first;
        S.verified = true; S.done = true; S.verCode = R.code; S.dirtySinceVerify = ed.value !== R.code; Z.emit('drill:verified', { id: 'max-drawdown' });
        persist(); paintMeta();
        Z.store.set(`drill.${id}.verified`, true);
        const msIn = R.ms != null ? ' in ' + fmtMs(R.ms) : '';
        if (rev) {
          sum.innerHTML = `<div class="drl-match">
            <div class="drl-ver-top"><span class="chip drl-match-chip">${I('bulb', 'xs')}Matches the reference</span>
              <span class="drl-ver-xp is-zero">${Z.spark(false)}<span class="tnum">+0 XP</span></span></div>
            <p class="t-h2 drl-ver-h">All ${n} tests passed${msIn}.</p>
            <p class="t-body drl-ver-n">No XP, because you opened the reference solution. This drill comes back in your redo queue in 7 days.</p>
            ${accepted}
          </div>`;
          setVerdict('rev');
          say(`All ${n} tests passed. It matches the reference, so no XP.`);
        } else {
          const note = hw ? `Item ${HW.item} of ${HW.name} now counts as verified. Continue takes you back to it.` : repeat ? 'Verified again. Repeats earn no XP.' : 'Added to your drill record.';
          sum.innerHTML = `<div class="drl-ver">
            <div class="drl-ver-top"><span class="chip correct drl-ver-chip">${I('check', 'xs')}Verified</span>
              ${hw ? '' : `<span class="drl-ver-xp${xpGain ? '' : ' is-zero'}">${Z.spark(xpGain > 0)}<span class="tnum">+${xpGain} XP</span></span>`}</div>
            <p class="t-h2 drl-ver-h">All ${n} tests passed${msIn}.</p>
            <p class="t-body drl-ver-n">${esc(note)}</p>
            ${accepted}
          </div>`;
          setVerdict('ok');
          Z.sound('correct'); Z.haptic();
          later(() => Z.burst(sum.querySelector('.drl-ver-chip')), 120);
          if (xpGain) addXp(xpGain);
          paintMeta();
          say(`Verified. All ${n} tests passed.${xpGain ? ' Plus ' + xpGain + ' XP.' : ''}`);
        }
        Z.emit('drill:verified', { id, fn: P.fn, homework: hw, revealed: rev });
      } else if (R.mode === 'submit') {
        if (R.loaded && !R.loadErr) S.failed += 1; // code that never ran is not an attempt
        S.retry = true;
        persist(); paintMeta();
        const head = R.loadErr ? 'Your code did not run' : timeout ? 'Stopped at 5 seconds' : crash ? 'Python stopped' : 'Not quite right';
        const line = R.loadErr ? (R.loadErr.stage === 'missing' ? `Keep the function name ${fmt('`' + P.fn + '`')} so the tests can call it.` : 'Python could not run solution.py. The traceback below points at the line.')
          : !R.loaded ? 'Your code never finished loading, so no test ran.'
          : `${passed} of ${n} tests passed. The first failure is test ${first + 1}, ${esc(R.defs[first].name.toLowerCase())}.`;
        sum.innerHTML = `<div class="drl-fail"><span class="chip notyet">${I(timeout ? 'clock' : 'cross', 'xs')}${head}</span><p class="t-body">${line}</p>${R.loaded && !R.loadErr ? accepted : ''}</div>`;
        setVerdict('no');
        Z.sound('notyet');
        say(`${head}. ${passed} of ${n} tests passed.`);
      } else {
        const head = R.loadErr ? 'Your code did not run' : timeout ? 'Stopped at 5 seconds' : `${passed} of ${n} examples passed`;
        const line = R.loadErr ? 'Python could not run solution.py. The traceback below points at the line.' : !R.loaded ? 'Your code never finished loading, so no example ran.'
          : all ? `${n === 2 ? 'Both examples match' : 'Every example matches'}. Submit runs the ${num(NH)} hidden tests.` : 'Compare your output with the expected value below.';
        const chip = all ? ['correct', 'check'] : timeout ? ['notyet', 'clock'] : ['notyet', 'cross'];
        sum.innerHTML = `<div class="drl-exsum"><span class="chip ${chip[0]}">${I(chip[1], 'xs')}${head}</span><p class="t-body">${line}</p></div>`;
        say(`${head}.`);
      }

      /* First failing test: input, expected against actual, a likely cause, its output */
      let diffLi = null;
      if (first >= 0 && !R.loadErr) {
        const d = R.defs[first], r = R.res[first];
        const why = whyFor(R, d, r);
        const actual = r.status === 'timeout' ? 'still running after 5 s' : r.status === 'error' ? (R.crash ? 'Python stopped' : 'raised ' + ((r.error || '').trim().split('\n').pop().split(':')[0] || 'an error')) : (r.actual || '');
        const li = body.querySelector(`.drl-row[data-i="${first}"]`);
        if (li && r.status !== 'skip') {
          li.classList.add('is-first');
          const note = P.inputNote(d);
          li.insertAdjacentHTML('beforeend', `<div class="drl-diff">
            <p class="t-overline drl-diff-h">${R.mode === 'examples' ? 'First failing example' : 'First failing test'}</p>
            <dl class="drl-kv">
              <dt>Input</dt><dd><code>${lines(P.input(d))}</code>${note ? `<span class="t-caption drl-kv-n">${esc(note)}</span>` : ''}</dd>
              <dt>Expected</dt><dd class="drl-exp"><code>${esc(P.expect(d))}</code></dd>
              <dt>Actual</dt><dd class="drl-act"><code>${esc(actual)}</code></dd>
            </dl>
            ${why ? `<p class="t-body drl-why"><span class="drl-why-i" aria-hidden="true">${I('bulb', 'xs')}</span><span>${fmt(why)}</span></p>` : ''}
            ${r.error && !R.crash ? `<pre class="drl-pre is-err">${esc(r.error)}</pre>` : ''}
            ${R.crash && r.status === 'error' ? `<pre class="drl-pre is-err">${esc(R.crash)}</pre>` : ''}
            ${r.stdout ? `<p class="t-caption drl-out-h">Your output</p><pre class="drl-pre">${esc(r.stdout)}</pre>` : ''}
          </div>`);
          diffLi = li;
        }
      }

      /* Output: a transcript for examples; script output and load errors for both */
      const out = body.querySelector('.drl-out');
      const parts = [];
      if (R.loadErr) parts.push(`<pre class="drl-pre is-err">${esc(R.loadErr.error)}</pre>`);
      if (R.loadErr && R.loadErr.stdout) parts.push(`<p class="t-caption drl-out-h">Output before the error</p><pre class="drl-pre">${esc(R.loadErr.stdout)}</pre>`);
      if (R.loadOut) parts.push(`<p class="t-caption drl-out-h">Output from solution.py</p><pre class="drl-pre">${esc(R.loadOut)}</pre>`);
      if (R.mode === 'examples' && !R.loadErr) {
        const tx = R.defs.map((d, i) => {
          const r = R.res[i];
          if (r.status === 'skip') return '';
          const call = `<span class="drl-pr">&gt;&gt;&gt;</span> ${esc(P.call(d))}\n`;
          const so = r.stdout ? esc(r.stdout.endsWith('\n') ? r.stdout : r.stdout + '\n') : '';
          const res = r.status === 'error' ? `<span class="drl-err">${esc(r.error || '')}</span>\n` : r.status === 'timeout' ? '<span class="drl-err">Stopped: still running after 5 s</span>\n' : `${esc(r.actual || '')}\n`;
          return call + so + res;
        }).join('');
        if (tx) parts.push(`<pre class="drl-pre drl-tx">${tx.trimEnd()}</pre>`);
      }
      if (timeout && !R.loaded) parts.push('<p class="t-body drl-why"><span class="drl-why-i" aria-hidden="true">' + I('bulb', 'xs') + '</span><span>Your code was still running at the top level after 5 seconds, so Python was restarted. Look for a loop outside the function that never ends.</span></p>');
      if (parts.length) {
        out.hidden = false;
        out.innerHTML = `<p class="t-overline drl-out-t">${R.loadErr ? 'Traceback' : !R.loaded || R.mode !== 'examples' ? 'Details' : 'Output'}</p>${parts.join('')}`;
        if (R.loadErr || !R.loaded) body.insertBefore(out, body.querySelector('.drl-rows')); // the reason comes before the rows that did not run
      }

      /* Bring the diagnosis into view inside Results: the failing row and its diff, or as much of it as fits */
      if (diffLi && body.clientHeight) {
        const top = diffLi.offsetTop - 8, bottom = diffLi.offsetTop + diffLi.offsetHeight + 16;
        const target = Math.min(top, bottom - body.clientHeight);
        if (target > body.scrollTop) body.scrollTo({ top: target, behavior: Z.reducedMotion() ? 'auto' : 'smooth' });
      }

      /* Badge on the Results tab */
      badge.hidden = false;
      badge.className = 'drl-badge ' + (all ? 'is-ok' : 'is-no');
      badge.innerHTML = all && R.mode === 'submit' ? I('check', 'xs') : `${passed}/${n}`;
      pressed = null;
      paintButtons();
    };

    const addXp = (n) => {
      const from = S.xp; S.xp += n;
      const xpEl = $('.drl-xp'), numEl = $('.drl-xp-n');
      if (!xpEl) return;
      xpEl.setAttribute('aria-label', `XP from this drill: ${S.xp}`);
      xpEl.querySelector('.spark').classList.add('on');
      later(() => Z.countUp(numEl, S.xp, 700, from), 160);
    };

    /* ---------- Not yet: [Get help] [Try again] ---------- */
    const tryAgain = () => {
      S.retry = false; setVerdict(null); paintButtons();
      if (narrow()) setTab('code');
      ed.el.focus();
    };

    /* ---------- Reference solution (after 2 failed submissions; never in homework) ---------- */
    const showReference = () => {
      const box = Z.h('<div class="drl-sh"></div>');
      let close = () => {};
      const showCode = () => {
        box.innerHTML = `<h2 class="t-sheet-title drl-sh-t">Reference solution</h2>
          <pre class="drl-sh-code" tabindex="0" aria-label="Reference solution code"><code>${highlight(P.reference.trimEnd())}</code></pre>
          <ul class="drl-sh-pts t-body">${P.refPoints.map(t => `<li>${fmt(t)}</li>`).join('')}</ul>
          <p class="t-caption drl-sh-n">${fmt(P.refNote)}</p>
          <div class="drl-sh-act"><button type="button" class="btn secondary" data-copy>Copy into editor</button><button type="button" class="btn" data-close>Done</button></div>`;
        box.querySelector('[data-copy]').addEventListener('click', () => {
          close();
          if (narrow()) setTab('code');
          ed.replaceAll(P.reference);
        });
      };
      if (S.revealed) { showCode(); close = Z.sheet(box, { label: 'Reference solution' }); return; }
      box.innerHTML = `<h2 class="t-sheet-title drl-sh-t">Show the reference solution?</h2>
        <p class="t-body drl-sh-p">You will see a full answer. This drill then earns no XP, and it comes back in your redo queue in 7 days.</p>
        <div class="drl-sh-act"><button type="button" class="btn secondary" data-close autofocus>Keep trying</button><button type="button" class="btn" data-reveal>Show solution</button></div>`;
      box.querySelector('[data-reveal]').addEventListener('click', () => {
        S.revealed = true; persist(); paintMeta(); paintButtons();
        showCode();
        box.querySelector('[data-close]').focus();
      });
      close = Z.sheet(box, { label: 'Reference solution' });
    };
    refBtn.addEventListener('click', showReference);

    /* ---------- Card utilities: report and sound (spec 5.1, 4.9) ---------- */
    const openReport = () => {
      const kinds = ['A test looks wrong', 'The brief is unclear', 'The editor misbehaves', 'Something else'];
      const box = Z.h(`<div class="drl-sh"><h2 class="t-sheet-title drl-sh-t">Report this drill</h2>
        <p class="t-body drl-sh-p">Tell us what went wrong. The report includes this drill, your code and your last results.</p>
        <div class="opts drl-sh-opts" role="radiogroup" aria-label="What went wrong">${kinds.map((k, i) => `<button type="button" class="opt" role="radio" aria-checked="false" data-i="${i}">${k}</button>`).join('')}</div>
        <div class="drl-sh-act"><button type="button" class="btn" data-send disabled>Send report</button></div></div>`);
      Z.sheet(box, { label: 'Report this drill' });
      box.addEventListener('click', (e) => {
        const o = e.target.closest('.drl-sh-opts .opt');
        if (o) { box.querySelectorAll('.drl-sh-opts .opt').forEach(b => { const on = b === o; b.classList.toggle('selected', on); b.setAttribute('aria-checked', String(on)); }); box.querySelector('[data-send]').disabled = false; }
        if (e.target.closest('[data-send]')) {
          box.innerHTML = `<h2 class="t-sheet-title drl-sh-t">Report sent</h2><p class="t-body drl-sh-p">Thanks. A person reads every report. If a test turns out to be wrong, the fix reaches everyone who took this drill.</p><div class="drl-sh-act"><button type="button" class="btn" data-close>Back to the drill</button></div>`;
          box.querySelector('[data-close]').focus();
        }
      });
    };
    const syncSound = () => { const on = !!Z.settings.sound; root.querySelectorAll('.drl-snd').forEach(b => { b.setAttribute('aria-pressed', String(on)); b.innerHTML = I(on ? 'sound' : 'mute', 'sm'); }); };
    root.addEventListener('click', (e) => {
      if (e.target.closest('.drl-flag')) openReport();
      else if (e.target.closest('.drl-snd')) { Z.setSetting('sound', !Z.settings.sound); Z.sound('tap'); }
    });
    Z.on('settings', () => { if (alive) syncSound(); });
    syncSound();

    /* ---------- Leaving ---------- */
    const leave = () => { Z.store.set(K.code, ed.value); Z.go(back); };
    $('.drl-close').addEventListener('click', leave);
    runBtn.addEventListener('click', () => { if (runBtn.classList.contains('is-help')) openHint(); else go('examples'); });
    subBtn.addEventListener('click', () => {
      if (S.verified && !S.dirtySinceVerify) leave();
      else if (S.retry) tryAgain();
      else go('submit');
    });
    drl.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && e.target !== ed.el) { e.preventDefault(); go(e.shiftKey ? 'submit' : 'examples'); }
    });

    window.ZQDrill = {
      setCode: (s) => ed.set(String(s)), code: () => ed.value, run: () => go('examples'), submit: () => go('submit'),
      status: () => py.status, tab: (t) => setTab(t), reference: () => P.reference, problem: () => id, homework: () => hw,
      /* Reopen the drill on another problem, as if arriving from a screen (e.g. 'homework') */
      open: (pid, src = null) => { Z.store.set('drill.open', { id: PROBLEMS[pid] ? pid : MDD.id, from: src }); cameFrom = null; Z.go('drill'); },
    };

    paintMeta(); paintButtons(); paintPy(); paintIdle();
    py.start();

    return () => {
      alive = false;
      clearTimeout(saveT); Z.store.set(K.code, ed.value);
      timers.forEach(clearTimeout); timers.clear();
      stopTangram();
      mq.removeEventListener('change', applyRoles);
      py.kill();
      if (window.ZQDrill) delete window.ZQDrill;
    };
  }

  ZQ.screen({ id: 'drill', title: 'Code drill', group: 'Assessment', shell: false, render: (root, Z) => mount(root, Z) });
})();
