/* Review hub (#review) and a homework set (#homework).
   Spec: docs/design-research.md 5.7 redo queue, 6.2 mastery points against XP, 8.2 assessment ladder and homework rules,
   8.4 difficulty, 9.4 explanation conventions, 10 critiques (homework, long-form items, verified code, accepted answers).
   Curriculum: redo every missed problem one week later and one month later; problems over reading.
   Prototype clock: Saturday 3 October, as on Today. Every selector carries the rv- (hub) or hw- (homework) prefix. */
(function () {
  'use strict';

  /* ---------- Clock and rules ---------- */
  const D7 = 'Sat 10 Oct';      // today + 7 days
  const D30 = 'Mon 2 Nov';      // today + 30 days
  const MP_EACH = 2;            // mastery points per correct redo and per first-try correct homework item
  const XP_PRACTICE = 15;       // a first-try practice answer, as on a lesson screen
  const LONG_PASS = 6;          // a long-form item counts as correct at 6 of 10 or more

  /* Session state: survives moving between screens, resets on reload */
  const session = { redo: {}, practice: {}, hw: null, hwView: 'intro', hwPreview: false };

  /* ---------- Helpers ---------- */
  const mdx = (Z, s) => String(s)
    .replace(/\$\$([^$]+)\$\$/g, (_, m) => Z.tex(m, true))
    .replace(/\$([^$]+)\$([.,:;?)]?)/g, (_, m, p) => `<span class="rv-nw">${Z.tex(m)}${p}</span>`);
  const parseNum = (s) => {
    let v = String(s).replace(/\s+/g, '').replace(/[\u2212\u2013]/g, '-');
    let pct = false;
    if (v.endsWith('%')) { pct = true; v = v.slice(0, -1); }
    const m = v.match(/^(-?(?:\d+\.?\d*|\.\d+))\/(\d+\.?\d*|\.\d+)$/);
    const x = m ? (+m[2] ? +m[1] / +m[2] : NaN) : /^-?(\d+\.?\d*|\.\d+)$/.test(v) ? parseFloat(v) : NaN;
    return pct ? x / 100 : x;
  };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const listAnd = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const optHTML = (Z, o) => typeof o === 'string' ? Z.tex(o) : o.code ? `<code class="rv-code-opt">${Z.esc(o.code)}</code>` : mdx(Z, o.md);
  /* MP and XP write through to the shared learner, so the header chip and Today agree */
  const paintMp = (Z) => document.querySelectorAll('.mp-chip').forEach(c => { c.innerHTML = `${Z.icon('target', 'sm')} ${Z.data().learner.mp}`; });
  const award = (Z, { mp = 0, xp = 0 }) => { const L = Z.data().learner; L.mp += mp; L.xp += xp; if (mp) paintMp(Z); };
  const syncDue = (Z) => { const L = Z.data().learner, left = REDO.filter(r => !session.redo[r.id]); L.due.redo = left.length; L.due.redoMinutes = left.reduce((s, r) => s + r.min, 0); };
  const pips = (Z, d) => `<span class="rv-pips" role="img" aria-label="Difficulty ${d} of 5">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= d ? 'on' : ''}"></i>`).join('')}</span>`;

  /* =====================================================================================
     CONTENT. Every answer below was checked by brute force over the 36 dice outcomes
     or by exact fractions over the deck.
     ===================================================================================== */

  /* Redo queue: due today (Sat 3 Oct). 7-day items were missed on Sat 26 Sep, 30-day items on Thu 3 Sep. */
  const REDO = [
    { id: 'r1', track: 'prob', topic: '1.5', due: 30, min: 2, src: 'Counting and Chance · Lesson 9 quiz',
      stem: 'Two fair dice are rolled. What is $P(\\text{total} = 8)$?',
      kind: 'choice', opts: ['\\tfrac{1}{6}', '\\tfrac{5}{36}', '\\tfrac{1}{9}', '\\tfrac{7}{36}'], ans: 1,
      accept: 'any form equal to $\\tfrac{5}{36}$',
      why: 'Five of the 36 equally likely pairs total 8: $(2,6)$, $(3,5)$, $(4,4)$, $(5,3)$ and $(6,2)$. The tempting $\\tfrac{1}{6}$ is the chance of a 7, which has six pairs.' },
    { id: 'r2', track: 'prob', topic: '1.5', due: 7, min: 2, src: 'Conditional Probability · Lesson 2 quiz',
      stem: 'A card is drawn from a standard 52-card deck. Given that it is a face card, what is $P(\\text{king})$?',
      kind: 'choice', opts: ['\\tfrac{1}{13}', '\\tfrac{1}{4}', '\\tfrac{1}{3}', '\\tfrac{4}{13}'], ans: 2,
      accept: 'any form equal to $\\tfrac{1}{3}$',
      why: 'The deck has 12 face cards and 4 of them are kings, so the answer is $\\tfrac{4}{12} = \\tfrac{1}{3}$. The tempting $\\tfrac{1}{13}$ is the chance before you learn anything: the condition shrinks the deck to 12 cards.' },
    { id: 'r3', track: 'maths', topic: '1.3', due: 7, min: 3, src: 'Integrals · Lesson 14 quiz',
      stem: 'Evaluate $\\int_0^1 x e^{x}\\,dx$.',
      kind: 'num', ans: 1, tol: 0.001, label: 'Value of the integral',
      accept: 'any form equal to $1$, or $1 \\pm 0.001$',
      why: 'Integrate by parts with $u = x$ and $dv = e^{x}\\,dx$, so the antiderivative is $x e^{x} - e^{x}$. It is $0$ at 1 and $-1$ at 0, so the integral is $0 - (-1) = 1$.' },
    { id: 'r4', track: 'maths', topic: '1.4', due: 30, min: 2, src: 'Vectors and Matrices · Homework 3, item 5',
      stem: 'Find the area of the parallelogram spanned by $\\mathbf{u} = (2, 1)$ and $\\mathbf{v} = (4, 3)$.',
      kind: 'num', ans: 2, tol: 0.001, label: 'Area',
      accept: 'any form equal to $2$',
      why: 'The area is the absolute value of the determinant with $\\mathbf{u}$ and $\\mathbf{v}$ as columns. That is $|2 \\cdot 3 - 4 \\cdot 1| = 2$.' },
  ];
  const redoNext = (it, ok) => it.due === 7
    ? (ok ? 'Back once more on Mon 26 Oct for its 30-day redo.' : `It starts again: back on ${D7} and ${D30}.`)
    : (ok ? 'Done at 30 days. It leaves your queue.' : `It starts again: back on ${D7} and ${D30}.`);

  /* Practice sets: mastery covers the skills met so far; each set leans on the weakest ones */
  const PRACTICE = [
    { id: 'prob', track: 'prob', topic: '1.5', name: 'Probability', art: 'die',
      skills: [['Multiplication rule', 18], ['Conditional probability', 24], ['Combinations', 70], ['Arrangements', 81], ['Sample spaces', 92]],
      items: [
        { id: 'p1', stem: 'Two fair dice are rolled and the total is 9. What is the probability that the first die shows 3?',
          kind: 'choice', opts: ['\\tfrac{1}{6}', '\\tfrac{1}{4}', '\\tfrac{1}{9}', '\\tfrac{1}{3}'], ans: 1, accept: 'any form equal to $\\tfrac{1}{4}$',
          why: 'A total of 9 leaves four pairs: $(3,6)$, $(4,5)$, $(5,4)$ and $(6,3)$. One starts with 3, so the answer is $\\tfrac{1}{4}$.' },
        { id: 'p2', stem: 'A drawer holds 4 red and 6 blue socks. You take two without looking. What is the probability both are red?',
          kind: 'num', ans: 2 / 15, tol: 0.0005, label: 'Probability', accept: 'any form equal to $\\tfrac{2}{15}$, or $0.1333 \\pm 0.0005$',
          why: 'By the multiplication rule, $\\tfrac{4}{10} \\cdot \\tfrac{3}{9} = \\tfrac{2}{15}$. The second factor is conditional: one red sock is already gone.' },
        { id: 'p3', stem: 'How many different arrangements are there of the letters in LEVEL?',
          kind: 'choice', opts: ['20', '30', '60', '120'], ans: 1, accept: 'exactly $30$',
          why: 'Five letters give $5!$ orders, but swapping the two L’s or the two E’s changes nothing. So the count is $\\tfrac{5!}{2!\\,2!} = 30$.' },
      ] },
    { id: 'calc', track: 'maths', topic: '1.3', name: 'Calculus', art: 'area',
      skills: [['Integration by parts', 38], ['Definite integrals', 48], ['Substitution', 52], ['Derivative rules', 79], ['Limits', 88]],
      items: [
        { id: 'c1', stem: 'Evaluate $\\int_0^2 3x^2\\,dx$.', kind: 'num', ans: 8, tol: 0.001, label: 'Value of the integral', accept: 'any form equal to $8$',
          why: 'An antiderivative of $3x^2$ is $x^3$. So the integral is $2^3 - 0^3 = 8$.' },
        { id: 'c2', stem: 'Which is $\\int x \\cos x\\,dx$?', kind: 'choice',
          opts: ['x \\sin x + \\cos x + C', 'x \\sin x - \\cos x + C', '-x \\sin x + \\cos x + C', '\\tfrac{x^2}{2} \\sin x + C'], ans: 0,
          accept: '$x \\sin x + \\cos x + C$, for any constant $C$',
          why: 'Take $u = x$ and $dv = \\cos x\\,dx$, so $v = \\sin x$ and the integral is $x \\sin x - \\int \\sin x\\,dx = x \\sin x + \\cos x + C$. Differentiate it to check: you get $x \\cos x$ back.' },
        { id: 'c3', stem: 'Evaluate $\\int_1^{e} \\frac{1}{x}\\,dx$.', kind: 'num', ans: 1, tol: 0.001, label: 'Value of the integral', accept: 'any form equal to $1$',
          why: 'An antiderivative of $\\tfrac{1}{x}$ is $\\ln x$ for $x > 0$. So the integral is $\\ln e - \\ln 1 = 1 - 0 = 1$.' },
      ] },
    { id: 'lin', track: 'maths', topic: '1.4', name: 'Linear algebra', art: 'matrix',
      skills: [['Inverses', 39], ['Determinants', 48], ['Matrix multiplication', 71], ['Dot products', 82], ['Vector arithmetic', 90]],
      items: [
        { id: 'l1', stem: 'Find $\\det \\begin{pmatrix} 3 & 2 \\\\ 1 & 4 \\end{pmatrix}$.', kind: 'num', ans: 10, tol: 0.001, label: 'Determinant', accept: 'exactly $10$',
          why: 'For a $2 \\times 2$ matrix the determinant is $ad - bc$. Here that is $3 \\cdot 4 - 2 \\cdot 1 = 10$.' },
        { id: 'l2', stem: 'Which matrix is the inverse of $\\begin{pmatrix} 2 & 1 \\\\ 5 & 3 \\end{pmatrix}$?', kind: 'choice',
          opts: ['\\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix}', '\\begin{pmatrix} 3 & 1 \\\\ 5 & 2 \\end{pmatrix}', '\\begin{pmatrix} -3 & 1 \\\\ 5 & -2 \\end{pmatrix}', '\\begin{pmatrix} 2 & -5 \\\\ -1 & 3 \\end{pmatrix}'], ans: 0,
          accept: '$\\begin{pmatrix} 3 & -1 \\\\ -5 & 2 \\end{pmatrix}$',
          why: 'The determinant is $2 \\cdot 3 - 1 \\cdot 5 = 1$. Swap the diagonal, negate the other two entries and divide by 1. Multiply back to check: you get the identity.' },
        { id: 'l3', stem: 'Compute $\\begin{pmatrix} 1 & 2 \\\\ 0 & 1 \\end{pmatrix} \\begin{pmatrix} 1 & 0 \\\\ 3 & 1 \\end{pmatrix}$.', kind: 'choice',
          opts: ['\\begin{pmatrix} 7 & 2 \\\\ 3 & 1 \\end{pmatrix}', '\\begin{pmatrix} 1 & 2 \\\\ 3 & 7 \\end{pmatrix}', '\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}', '\\begin{pmatrix} 1 & 2 \\\\ 3 & 1 \\end{pmatrix}'], ans: 0,
          accept: '$\\begin{pmatrix} 7 & 2 \\\\ 3 & 1 \\end{pmatrix}$',
          why: 'Each entry is a row of the first matrix dotted with a column of the second. The top-left entry is $1 \\cdot 1 + 2 \\cdot 3 = 7$, and the rest follow the same way.' },
      ] },
    { id: 'py', track: 'code', topic: '1.1', name: 'Python', art: 'code',
      skills: [['Returns from prices', 62], ['pandas indexing', 69], ['NumPy arrays', 76], ['Functions', 88], ['Lists and loops', 95]],
      items: [
        { id: 'y1', stem: 'Prices are $100$, $110$ and $99$ on three days. What is the second daily simple return, as a decimal?', kind: 'num', ans: -0.1, tol: 0.0005, label: 'Return, as a decimal',
          accept: 'any form equal to $-0.1$', why: 'A simple return is today over yesterday, minus 1. That is $\\tfrac{99}{110} - 1 = -0.1$. The price fell back below where it started even though the first move was $+0.1$.' },
        { id: 'y2', stem: 'What does <code>np.diff(np.array([100, 103, 101]))</code> return?', kind: 'choice',
          opts: [{ code: 'array([ 3, -2])' }, { code: 'array([3, 2])' }, { code: 'array([ 0,  3, -2])' }, { code: 'array([-3,  2])' }], ans: 0,
          accept: '<code>array([ 3, -2])</code>', why: '<code>np.diff</code> subtracts each element from the next one, so $n$ values give $n - 1$ differences: $103 - 100 = 3$ and $101 - 103 = -2$.' },
        { id: 'y3', stem: 'With <code>s = pd.Series([10, 20, 30], index=["a", "b", "c"])</code>, what is <code>s.iloc[1]</code>?', kind: 'choice',
          opts: [{ code: '10' }, { code: '20' }, { code: '30' }, { code: 'KeyError' }], ans: 1,
          accept: '<code>20</code>', why: '<code>iloc</code> selects by position, counting from 0, so position 1 is the second value. <code>s.loc["b"]</code> would select the same value by label.' },
      ] },
  ];
  PRACTICE.forEach(p => { p.mastery = Math.round(p.skills.reduce((s, k) => s + k[1], 0) / p.skills.length); p.items.forEach(it => { it.track = p.track; it.topic = p.topic; it.src = `${p.name} practice set`; }); });

  /* Notebook: formula cards the learner saved */
  const NOTEBOOK = [
    { id: 'cond', name: 'Conditional probability', src: 'Conditional Probability, Level 1', track: 'prob',
      tex: 'P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}', what: 'Keep only the outcomes where $B$ happened, then measure $A$ again. Defined only when $P(B) > 0$.',
      ex: 'Two dice, and the first shows 5: $P(\\text{total } 8 \\mid \\text{first } 5) = \\dfrac{1/36}{6/36} = \\dfrac{1}{6}$.',
      trap: '$P(A \\mid B)$ and $P(B \\mid A)$ are different numbers. Given a total of 8, the first die is a 6 with chance $\\tfrac{1}{5}$; given a first 6, the total is 8 with chance $\\tfrac{1}{6}$.' },
    { id: 'bayes', name: 'Bayes’ rule', src: 'Conditional Probability, Level 2', track: 'prob',
      tex: 'P(A \\mid B) = \\frac{P(B \\mid A)\\,P(A)}{P(B)}', what: 'It turns $P(B \\mid A)$, which you often know, into $P(A \\mid B)$, which you usually want.',
      ex: 'A test finds 99% of cases and wrongly flags 5% of healthy people, and 1% of people have the condition. A positive result gives $\\dfrac{0.99 \\cdot 0.01}{0.99 \\cdot 0.01 + 0.05 \\cdot 0.99} = \\dfrac{1}{6}$.',
      trap: 'Ignoring the base rate. The test is accurate, but the condition is rare, so most positives are false.' },
    { id: 'lin', name: 'Linearity of expectation', src: 'Random Variables, Level 2', track: 'prob',
      tex: '\\mathbb{E}[aX + bY] = a\\,\\mathbb{E}[X] + b\\,\\mathbb{E}[Y]', what: 'It holds whether or not $X$ and $Y$ are independent.',
      ex: 'The expected total of two dice is $3.5 + 3.5 = 7$, with no table of 36 outcomes.',
      trap: 'Products are different: $\\mathbb{E}[XY] = \\mathbb{E}[X]\\,\\mathbb{E}[Y]$ only when $X$ and $Y$ are uncorrelated.' },
    { id: 'var', name: 'Variance of a sum', src: 'Random Variables, Level 4', track: 'prob',
      tex: '\\operatorname{Var}(X + Y) = \\operatorname{Var}(X) + \\operatorname{Var}(Y) + 2\\operatorname{Cov}(X, Y)', what: 'Spread adds, plus a correction for how the two move together.',
      ex: 'Two independent dice: $\\operatorname{Var}(X + Y) = \\tfrac{35}{12} + \\tfrac{35}{12} = \\tfrac{35}{6}$, since the covariance is 0.',
      trap: 'Standard deviations do not add. They add only when the correlation is exactly 1.' },
    { id: 'vol', name: 'Annualised volatility', src: 'NumPy and pandas, Level 5', track: 'code',
      tex: '\\sigma_{\\text{annual}} = \\sigma_{\\text{daily}} \\sqrt{252}', what: 'Scale the standard deviation of daily returns by the square root of the 252 trading days in a year.',
      ex: 'A daily volatility of $0.012$ gives $0.012 \\sqrt{252} \\approx 0.190$ a year.',
      trap: 'Multiplying by 252 scales the variance, not the volatility. The rule also assumes daily returns are independent with the same spread.' },
  ];

  /* Exam papers other than 1.5: the prototype shows each in a sheet and opens the 1.5 player as a stand-in */
  const FINALS = [
    { id: 'fin-calc', name: 'Calculus', track: 'maths', covers: 'Limits, derivatives, integrals, series and several variables' },
    { id: 'fin-lin', name: 'Linear algebra', track: 'maths', covers: 'Elimination, inverses, least squares, eigenvalues and the SVD' },
    { id: 'fin-prob', name: 'Probability', track: 'prob', covers: 'Counting, conditional probability, random variables and limit theorems' },
  ];
  const PAPERS = {
    'topic-1.4': { over: '1.4 Linear algebra', title: 'Linear algebra topic exam', track: 'maths', time: '90 minutes, timed. The clock does not pause.',
      covers: 'Vectors, matrices, elimination, least squares and eigenvalues. Pass it and the topic is complete.' },
    ...Object.fromEntries(FINALS.map(f => [f.id, { over: 'Stage 1 exit test', title: `${f.name} finals paper`, track: f.track, time: '3 hours, timed. The clock does not pause.',
      covers: `${f.covers}, at the level of a first-year university final.` }])),
  };

  /* Homework 4 (in progress) and Homework 3 (marked), shown in sheets from the hub */
  const HW4 = [
    'Evaluate $\\int_0^{\\pi} \\sin x\\,dx$.', 'Find $\\int 2x \\cos(x^2)\\,dx$.', 'Find the area between $y = x$ and $y = x^2$.',
    'Evaluate $\\int_1^{e} \\ln x\\,dx$.', 'Find the average value of $\\sin x$ on $[0, \\pi]$.', 'Choose a substitution for $\\int \\frac{x}{\\sqrt{1 + x^2}}\\,dx$.',
    'Code drill: the trapezium rule in NumPy.', 'Long form: show that $\\int_0^1 x^n\\,dx = \\frac{1}{n + 1}$ for $n \\ge 0$.',
  ];
  const HW3 = [
    ['Dot product of two vectors', 3, 3], ['Unit vector in a given direction', 3, 3], ['One entry of a matrix product', 4, 4], ['Angle between two vectors', 4, 4],
    ['Area of a parallelogram', 0, 4, 'In today’s redo queue'], ['Inverse of a $2 \\times 2$ matrix', 5, 5], ['Code drill: matrix product in NumPy', 5, 5, 'Verified by tests'],
    ['Long form: show that $(\\mathbf{AB})^{\\mathsf T} = \\mathbf{B}^{\\mathsf T}\\mathbf{A}^{\\mathsf T}$', 7, 10, 'Self-marked'],
  ];

  /* Homework 1 · Updating on evidence (Conditional Probability, Level 1). Marks equal difficulty; the long-form item is out of 10. */
  const HW = [
    { n: 1, kind: 'choice', diff: 3, title: 'Doubles, given a high total',
      prompt: 'Two fair dice are rolled. You are told the total is at least 10.', q: 'What is the probability that both dice show the same number?',
      opts: ['\\tfrac{1}{6}', '\\tfrac{1}{3}', '\\tfrac{1}{2}', '\\tfrac{2}{3}'], ans: 1, accept: 'any form equal to $\\tfrac{1}{3}$',
      why: 'Six outcomes total 10 or more: $(4,6)$, $(5,5)$, $(6,4)$, $(5,6)$, $(6,5)$ and $(6,6)$. Two are doubles, so the answer is $\\tfrac{2}{6} = \\tfrac{1}{3}$. $\\tfrac{1}{6}$ is the chance of a double before you know the total.' },
    { n: 2, kind: 'choice', diff: 3, title: 'A second heart',
      prompt: 'Two cards are drawn from a standard 52-card deck without replacement. The first card is a heart.', q: 'What is the probability that the second card is also a heart?',
      opts: ['\\tfrac{1}{4}', '\\tfrac{13}{51}', '\\tfrac{4}{17}', '\\tfrac{1}{17}'], ans: 2, accept: 'any form equal to $\\tfrac{4}{17}$',
      why: 'After one heart is gone, 51 cards remain and 12 are hearts: $\\tfrac{12}{51} = \\tfrac{4}{17}$. $\\tfrac{1}{4}$ treats the first card as if it went back; $\\tfrac{13}{51}$ forgets that a heart has gone.' },
    { n: 3, kind: 'num', diff: 4, title: 'Both sixes, given at least one',
      prompt: 'A fair die is rolled twice. You are told that at least one roll is a 6.', q: 'What is the probability that both rolls are 6? Give a fraction or a decimal.',
      ans: 1 / 11, tol: 0.0005, label: 'Probability, as a fraction or decimal', accept: 'any form equal to $\\tfrac{1}{11}$, or $0.0909 \\pm 0.0005$',
      why: 'At least one 6 leaves 11 of the 36 pairs: six with a first 6, six with a second 6, and $(6,6)$ counted once. Only $(6,6)$ has both, so the answer is $\\tfrac{1}{11}$. The tempting $\\tfrac{1}{6}$ answers a different question: a second 6, given the first was a 6.' },
    { n: 4, kind: 'multi', diff: 4, title: 'Which way round',
      prompt: 'Two fair dice are rolled. Let $A$ be ‘the first die shows 6’, $B$ be ‘the total is 7’ and $C$ be ‘the total is 8’.', q: 'Which statements are true? Select all that apply.',
      opts: [{ md: '$P(A \\mid B) = \\tfrac{1}{6}$' }, { md: '$P(A \\mid C) = \\tfrac{1}{6}$' }, { md: '$P(C \\mid A) = \\tfrac{1}{6}$' }, { md: '$P(A \\mid C) = P(C \\mid A)$' }, { md: '$P(B \\mid C) = 0$' }],
      ans: [0, 2, 4], accept: 'exactly the first, third and fifth statements',
      why: 'Given $B$, the first die is equally likely to be 1 to 6, so $P(A \\mid B) = \\tfrac{1}{6}$. Given $C$, only $(6,2)$ of five pairs starts with 6, so $P(A \\mid C) = \\tfrac{1}{5}$, while $P(C \\mid A) = \\tfrac{1}{6}$. A total cannot be 7 and 8 at once, so $P(B \\mid C) = 0$.' },
    { n: 5, kind: 'num', diff: 4, title: 'Three hearts in a row',
      prompt: 'Three cards are dealt from a standard 52-card deck without replacement.', q: 'What is the probability that all three are hearts? Give a fraction, or a decimal to 4 significant figures.',
      ans: 11 / 850, tol: 0.00005, label: 'Probability, as a fraction or decimal', accept: 'any form equal to $\\tfrac{11}{850}$, or $0.01294 \\pm 0.00005$',
      why: 'Use the multiplication rule: $\\tfrac{13}{52} \\cdot \\tfrac{12}{51} \\cdot \\tfrac{11}{50} = \\tfrac{11}{850} \\approx 0.01294$. Each factor is conditional on the hearts already dealt. Item 8 proves why multiplying them is allowed.' },
    { n: 6, kind: 'choice', diff: 5, title: 'All aces, given at least one',
      prompt: 'Three cards are dealt from a standard deck without replacement. You are told that at least one of them is an ace.', q: 'What is the probability that all three are aces?',
      opts: ['\\tfrac{1}{425}', '\\tfrac{1}{1201}', '\\tfrac{1}{5525}', '\\tfrac{1}{221}'], ans: 1, accept: 'any form equal to $\\tfrac{1}{1201}$',
      why: 'There are $\\binom{52}{3} = 22100$ hands and $\\binom{48}{3} = 17296$ have no ace, so 4804 have at least one. Four hands are all aces, giving $\\tfrac{4}{4804} = \\tfrac{1}{1201}$. The tempting $\\tfrac{1}{425}$ conditions on the first card being an ace, a stronger clue.' },
    { n: 7, kind: 'code', diff: 4, title: 'Conditional probability in code',
      prompt: 'Write a function that returns $P(A \\mid B)$ for two fair dice as an exact fraction. Events arrive as functions of the pair of dice.',
      accept: 'passing every example and hidden test', why: 'Keep the outcomes where $B$ holds, then count the ones where $A$ also holds. Exact <code>Fraction</code> arithmetic avoids rounding, so the tests compare for equality.' },
    { n: 8, kind: 'long', diff: 5, title: 'The multiplication rule for three events', marks: 10,
      prompt: 'Let $A$, $B$ and $C$ be events with $P(A \\cap B) > 0$.', q: 'Show that' },
  ];
  HW.forEach(it => { it.marks = it.marks || it.diff; });
  const HW_TOTAL = HW.reduce((s, it) => s + it.marks, 0); // 37

  const RUBRIC = [
    'Writes the definition $P(E \\mid F) = \\frac{P(E \\cap F)}{P(F)}$ with the condition $P(F) > 0$.',
    'Rearranges it into the multiplication rule $P(E \\cap F) = P(F)\\,P(E \\mid F)$.',
    'States the assumption $P(A \\cap B) > 0$, so $P(C \\mid A \\cap B)$ is defined.',
    'Explains why $P(A) > 0$ follows: $A \\cap B$ lies inside $A$.',
    'Regroups $A \\cap B \\cap C$ as $(A \\cap B) \\cap C$.',
    'Applies the rule with $F = A \\cap B$ to get $P(A \\cap B)\\,P(C \\mid A \\cap B)$.',
    'Applies the rule with $F = A$ to expand $P(A \\cap B) = P(A)\\,P(B \\mid A)$.',
    'Substitutes and reaches exactly the stated result.',
    'Gives a reason on every line, with no step left as obvious.',
    'Uses notation correctly throughout: $\\cap$ for both, the bar for given.',
  ];

  const newHw = () => ({ answers: {}, code: 'none', lf: { text: '', marked: false, ticks: [] }, submitted: false, result: null });

  /* Code item: it counts only when the drill's own tests pass. The drill announces that with a 'drill:verified' event
     (requested in drill.js); until then, watch the drill screen for its Verified summary while the learner is there. */
  const codeVerified = () => { if (session.hw && session.hw.code === 'opened') session.hw.code = 'verified'; };
  if (window.ZQ && ZQ.on) ZQ.on('drill:verified', codeVerified);
  let drillWatch = null;
  const watchDrill = () => {
    if (drillWatch) return;
    const mo = new MutationObserver(() => { if (document.querySelector('.screen-drill .drl-ver')) codeVerified(); });
    const stop = () => { if (location.hash !== '#drill') { mo.disconnect(); window.removeEventListener('hashchange', stop); drillWatch = null; } };
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('hashchange', stop);
    drillWatch = mo;
  };

  /* Grades the set: one result per item */
  const gradeHw = (S) => HW.map(it => {
    const a = S.answers[it.n];
    let ok = false, got = 0, answered = a !== undefined && a !== '' && !(Array.isArray(a) && !a.length);
    if (it.kind === 'choice') ok = a === it.ans;
    if (it.kind === 'num') { const v = parseNum(a ?? ''); answered = !isNaN(v); ok = answered && Math.abs(v - it.ans) <= it.tol; }
    if (it.kind === 'multi') ok = Array.isArray(a) && a.length === it.ans.length && it.ans.every(i => a.includes(i));
    if (it.kind === 'code') { answered = S.code === 'verified'; ok = answered; }
    if (it.kind === 'long') { answered = S.lf.marked; got = S.lf.marked ? S.lf.ticks.length : 0; ok = got >= LONG_PASS; }
    else got = ok ? it.marks : 0;
    return { n: it.n, ok, got, answered };
  });

  /* =====================================================================================
     PLAYER: redo and practice problems inside a sheet. No hints, one try each.
     ===================================================================================== */
  function play(Z, items, mode, onDone) {
    const res = [];
    let i = 0, picked = null, done = false, earned = 0;
    const repeat = mode === 'practice' && items.every(it => session.practice[it.id]); // a finished set earns no XP again
    const box = Z.h('<div class="rv-pl"></div>');
    const close = Z.sheet(box, { label: mode === 'redo' ? 'Redo queue' : 'Practice set', onClose: () => onDone(res) });

    const draw = () => {
      const it = items[i];
      picked = null;
      const widget = it.kind === 'choice'
        ? `<div class="opts ${it.opts.every(o => typeof o === 'string' && o.length < 18) ? 'two' : ''} rv-pl-opts" role="group" aria-label="Answers">${it.opts.map((o, j) => `<button type="button" class="opt" data-o="${j}" aria-pressed="false"><span class="rv-k" aria-hidden="true">${j + 1}</span>${optHTML(Z, o)}</button>`).join('')}</div>`
        : `<label class="field rv-pl-field"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="${Z.esc(it.label || 'Answer')}" placeholder="A fraction or a decimal"></label>`;
      box.innerHTML = `
        <div class="rv-pl-head">
          <span class="t-overline">${mode === 'redo' ? 'Redo' : 'Practice'} ${i + 1} of ${items.length}</span>
          ${items.length > 1 ? `<span class="dots" aria-hidden="true">${items.map((_, j) => `<i class="${res[j] ? (res[j].ok ? 'ok' : 'bad') : j === i ? 'cur' : ''}"></i>`).join('')}</span>` : ''}
        </div>
        <p class="rv-pl-src" data-track="${it.track}"><span class="rv-tag">${it.topic}</span><span class="t-caption secondary">${Z.esc(it.src)}</span>${mode === 'redo' ? `<span class="chip rv-due ${it.due === 30 ? 'd30' : ''}">${Z.icon('replay', 'xs')}${it.due}-day</span>` : ''}</p>
        <div class="t-prose rv-pl-stem" tabindex="-1">${mdx(Z, it.stem)}</div>
        <div class="rv-pl-w">${widget}</div>
        <div class="rv-pl-v" aria-live="polite"></div>
        <div class="rv-pl-act"><button type="button" class="btn block" data-act="check" disabled>Check</button></div>
        <p class="t-caption muted rv-pl-rule">${mode === 'redo' ? `No hints. A right answer earns ${MP_EACH} mastery points.` : repeat ? 'No hints. You finished this set before, so it earns no XP this time.' : `No hints. A right answer earns ${XP_PRACTICE} XP. Mastery points come from quizzes, homework, exams and redos.`}</p>`;
      const check = box.querySelector('[data-act="check"]');
      const inp = box.querySelector('input');
      if (inp) inp.addEventListener('input', () => { check.disabled = isNaN(parseNum(inp.value)); });
      if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !check.disabled) { e.preventDefault(); check.click(); } });
      setTimeout(() => (inp || box.querySelector('.opt') || box).focus(), 60);
    };

    const grade = () => {
      const it = items[i];
      let ok;
      if (it.kind === 'choice') {
        ok = picked === it.ans;
        box.querySelectorAll('.opt').forEach((b, j) => {
          b.disabled = true;
          if (j === picked) { b.classList.add(ok ? 'correct' : 'wrong'); b.insertAdjacentHTML('beforeend', `<span class="badge">${Z.icon(ok ? 'check' : 'cross')}</span>`); }
          else if (!ok && j === it.ans) b.classList.add('rv-was');
          else b.classList.add('dim');
          b.classList.remove('selected'); b.setAttribute('aria-pressed', String(j === picked));
        });
      } else {
        const inp = box.querySelector('input'), v = parseNum(inp.value);
        ok = Math.abs(v - it.ans) <= it.tol;
        inp.readOnly = true; inp.closest('.field').classList.add(ok ? 'correct' : 'wrong');
      }
      res[i] = { id: it.id, ok };
      let gain = 0;
      if (mode === 'redo') { session.redo[it.id] = { ok }; if (ok) { gain = MP_EACH; award(Z, { mp: gain }); } syncDue(Z); }
      else { const first = !session.practice[it.id]; session.practice[it.id] = { ok }; if (ok && first) { gain = XP_PRACTICE; earned += gain; award(Z, { xp: gain }); } }
      Z.sound(ok ? 'correct' : 'notyet'); if (ok) Z.haptic();
      const chipHTML = gain ? `<span class="rv-award">${mode === 'redo' ? `${Z.icon('target', 'xs')}+${gain} MP` : `${Z.spark(true)}+${gain} XP`}</span>` : '';
      const next = mode === 'redo' ? redoNext(it, ok) : ok ? (gain ? 'Right first time.' : 'Right. A repeat earns no XP.') : 'Practice misses do not join the redo queue. This skill gets more weight next time.';
      box.querySelector('.rv-pl-v').innerHTML = `
        <div class="rv-chip ${ok ? 'is-ok' : 'is-no'}">
          <span class="rv-chip-ic" aria-hidden="true">${Z.icon(ok ? 'check' : 'cross')}</span>
          <span class="rv-chip-tx"><span class="rv-chip-h"><b>${ok ? 'Correct.' : 'Not quite right.'}</b>${chipHTML}</span><span>${Z.esc(next)}</span></span>
        </div>
        <p class="t-body rv-pl-why">${mdx(Z, it.why)}</p>
        <p class="t-caption secondary rv-pl-acc">Accepted: ${mdx(Z, it.accept)}.</p>`;
      const btn = box.querySelector('[data-act="check"]');
      btn.dataset.act = 'next'; btn.disabled = false;
      btn.className = 'btn block ' + (ok ? 'correct' : 'notyet');
      btn.textContent = i < items.length - 1 ? 'Continue' : items.length > 1 ? 'See results' : 'Done';
      if (items.length === 1) btn.dataset.act = 'close';
      btn.focus();
      box.querySelector('.rv-pl-head .dots')?.querySelectorAll('i').forEach((d, j) => { d.className = res[j] ? (res[j].ok ? 'ok' : 'bad') : j === i ? 'cur' : ''; });
    };

    const summary = () => {
      done = true;
      const right = res.filter(r => r.ok).length;
      const pts = mode === 'redo' ? `+${right * MP_EACH} MP` : `+${earned} XP`;
      const all = right === res.length;
      const left = REDO.filter(r => !session.redo[r.id]).length;
      box.innerHTML = `
        <div class="rv-sum">
          <span class="t-overline muted">${mode === 'redo' ? 'Redo queue' : 'Practice set'}</span>
          <h2 class="t-sheet-title" tabindex="-1">${mode === 'redo' ? (left ? `Done. ${left} left in today’s queue.` : 'Queue clear for today.') : all ? 'All right first time.' : 'Set done.'}</h2>
          <div class="rv-sum-stats">
            <div><span class="t-stat tnum" data-n="${right}">${right}</span><span class="t-caption muted">of ${res.length} right</span></div>
            <div class="rv-sum-pts"><span class="t-stat tnum">${pts}</span><span class="t-caption muted">${mode === 'redo' ? 'mastery points' : repeat ? 'Repeat: no XP' : 'activity'}</span></div>
          </div>
          <ul class="rv-sum-list">${res.map((r, j) => `<li class="${r.ok ? 'ok' : 'no'}"><span class="rv-sum-ic" aria-hidden="true">${Z.icon(r.ok ? 'check' : 'cross')}</span>
            <span class="rv-sum-t"><span class="t-body">${mdx(Z, items[j].stem)}</span><span class="t-caption secondary">${r.ok ? 'Right' : 'Not right'}${mode === 'redo' ? '. ' + Z.esc(redoNext(items[j], r.ok)) : ''}</span></span></li>`).join('')}</ul>
          <button type="button" class="btn block" data-act="close">Done</button>
        </div>`;
      Z.sound('complete');
      if (all) Z.burst(box.querySelector('.t-stat'));
      setTimeout(() => box.querySelector('h2').focus(), 60);
    };

    box.addEventListener('click', (e) => {
      const o = e.target.closest('.opt');
      if (o && !o.disabled) {
        picked = +o.dataset.o; Z.sound('tap');
        box.querySelectorAll('.opt').forEach(b => { const on = b === o; b.classList.toggle('selected', on); b.setAttribute('aria-pressed', String(on)); });
        box.querySelector('[data-act="check"]').disabled = false;
        return;
      }
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'check') grade();
      else if (a.dataset.act === 'next') { if (i < items.length - 1) { i++; draw(); } else summary(); }
      else if (a.dataset.act === 'close') close();
    });
    box.addEventListener('keydown', (e) => {
      if (done || e.target.matches('input') || e.metaKey || e.ctrlKey || e.altKey) return;
      /* Enter triggers the primary button (spec 5.4); on an unpicked set it falls through and picks the focused option */
      if (e.key === 'Enter' && e.target.closest('.opt')) { const c = box.querySelector('[data-act="check"]'); if (c && !c.disabled) { e.preventDefault(); c.click(); } return; }
      const k = parseInt(e.key, 10), opts = box.querySelectorAll('.opt:not(:disabled)');
      if (k >= 1 && k <= opts.length) { e.preventDefault(); opts[k - 1].click(); opts[k - 1].focus(); }
    });
    draw();
  }

  /* =====================================================================================
     REVIEW HUB
     ===================================================================================== */
  ZQ.screen({
    id: 'review', title: 'Review', group: 'App', shell: true, tab: 'review',
    render(root, Z) {
      const Dt = Z.data(), L = Dt.learner, esc = Z.esc, I = Z.icon;
      const C = Dt.currentCourse;
      const lv1 = C.levels[0], lv1Done = lv1.items.filter(x => x.kind === 'lesson' && x.status === 'done').length, lv1Lessons = lv1.items.filter(x => x.kind === 'lesson').length;
      const examPct = Math.round(L.nextExam.readiness * 100);

      session.hwPreview = false; // the homework screen opens read-only only when this hub's Preview asks for it
      const weakest = PRACTICE.reduce((a, b) => b.mastery < a.mastery ? b : a);

      /* ---------- Redo queue ---------- */
      const redoCard = () => {
        const left = REDO.filter(r => !session.redo[r.id]);
        const mins = left.reduce((s, r) => s + r.min, 0);
        const doneN = REDO.length - left.length;
        const missN = REDO.filter(r => session.redo[r.id] && !session.redo[r.id].ok).length;
        const row = (it) => {
          const r = session.redo[it.id];
          const act = r
            ? `<span class="rv-q-res ${r.ok ? 'ok' : 'no'}">${I(r.ok ? 'check' : 'replay', 'xs')}<span>${r.ok ? (it.due === 7 ? 'Right. Back Mon 26 Oct' : 'Right. Leaves the queue') : `Back ${D7}`}</span></span>`
            : `<button type="button" class="btn secondary rv-q-go" data-start="${it.id}" aria-label="Start redo: ${esc(it.src)}">Start</button>`;
          return `<li class="rv-q ${r ? 'is-done' : ''}" data-track="${it.track}">
            <span class="rv-tag" aria-hidden="true">${it.topic}</span>
            <div class="rv-q-body">
              <p class="rv-q-stem">${mdx(Z, it.stem)}</p>
              <p class="rv-q-meta"><span class="chip rv-due ${it.due === 30 ? 'd30' : ''}">${I('replay', 'xs')}${it.due}-day</span><span class="t-caption secondary">${esc(it.src)} · ${it.min} min</span></p>
            </div>
            <div class="rv-q-act">${act}</div>
          </li>`;
        };
        return `
          <div class="rv-redo-head">
            <div class="rv-redo-t">
              <span class="t-overline rv-ov">${I('review', 'xs')}Redo queue</span>
              <h2 class="t-h1" id="rv-redo-h" tabindex="-1">${left.length ? `${plural(left.length, 'problem', 'problems')} due today` : 'Queue clear for today'}</h2>
            </div>
            <span class="rv-time">${I('clock', 'xs')}<span class="tnum">${left.length ? `About ${mins} min` : `${doneN} of ${REDO.length} done`}</span></span>
          </div>
          <p class="t-body secondary rv-redo-why">Each one is a problem you missed. It comes back after 7 days and again after 30. A right answer earns mastery points; XP only counts activity.</p>
          <ol class="rv-qs">${REDO.map(row).join('')}</ol>
          <div class="rv-redo-foot">
            ${left.length ? `<button type="button" class="btn block" data-start-all>${left.length === REDO.length ? `Start all, about ${mins} min` : `Start the ${left.length} left, about ${mins} min`}</button>`
              : `<p class="t-body rv-clear">${I('check', 'sm')}<span>${missN ? `All ${REDO.length} done. ${missN === 1 ? 'The miss comes' : `The ${missN} misses come`} back on ${D7}.` : `All ${REDO.length} done, and all right.`}</span></p>
                 <button type="button" class="btn secondary block" data-pr="${weakest.id}">Practise ${esc(weakest.name)}</button>`}
            <p class="t-caption muted">Next: 2 problems due Tue 6 Oct.${session.hw?.submitted && session.hw.result.wrong.length ? ` ${plural(session.hw.result.wrong.length, 'item', 'items')} from Homework 1 on ${D7}.` : ''}</p>
          </div>`;
      };

      /* ---------- Homework ---------- */
      const hwRes = session.hw?.submitted ? session.hw.result : null;
      const hwRow = ({ track, art, over, title, status, extra = '', btn, act }) => `<li class="rv-hw" data-track="${track}">
          <span class="rv-art" aria-hidden="true">${ZQArt(art)}</span>
          <div class="rv-hw-body"><span class="t-overline rv-deep">${over}</span><h3 class="t-h2">${title}</h3><p class="t-caption secondary rv-hw-st">${status}</p>${extra}</div>
          <button type="button" class="btn secondary rv-hw-go" data-act="${act}">${btn}</button></li>`;
      const hw4 = hwRow({ track: 'maths', art: 'area', over: 'Integrals · <span class="rv-nw">Level 4</span>', title: 'Homework 4 · Integrals',
        status: `${I('clock', 'xs')}<span>Due Thu 8 Oct · in progress, 3 of 8 answered</span>`,
        extra: `<span class="rv-segs" role="img" aria-label="3 of 8 items answered">${HW4.map((_, j) => `<i class="${j < 3 ? 'on' : ''}"></i>`).join('')}</span>`, btn: 'Continue', act: 'hw4' });
      const hw1 = hwRes
        ? hwRow({ track: 'prob', art: 'tree', over: 'Conditional Probability · <span class="rv-nw">Level 1</span>', title: 'Homework 1 · Updating on evidence',
          status: `${I('check', 'xs')}<span>Marked ${hwRes.pct}% · ${hwRes.marks} of ${HW_TOTAL} marks · today</span>`, btn: 'See marks', act: 'hw1-marks' })
        : hwRow({ track: 'prob', art: 'tree', over: 'Conditional Probability · <span class="rv-nw">Level 1</span>', title: 'Homework 1 · Updating on evidence',
          status: `${I('lock', 'xs')}<span>Not yet released. Unlocks when you finish Level 1: ${lv1Done} of ${lv1Lessons} lessons done.</span>`, btn: 'Preview', act: 'hw1' });
      const hw3 = hwRow({ track: 'maths', art: 'matrix', over: 'Vectors and Matrices · <span class="rv-nw">Level 3</span>', title: 'Homework 3 · Vectors',
        status: `${I('check', 'xs')}<span>Marked 82% · 31 of 38 marks · Thu 3 Sep. 1 item is in today’s redo queue.</span>`, btn: 'See marks', act: 'hw3' });

      /* ---------- Exams ---------- */
      const ringC = 2 * Math.PI * 22;
      const exams = `
        <ul class="rv-exs">
          <li class="rv-ex" data-track="maths">
            <span class="rv-ring" role="img" aria-label="${examPct}% ready"><svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="22" class="rv-ring-t"/><circle cx="28" cy="28" r="22" class="rv-ring-f" stroke-dasharray="${(ringC * examPct / 100).toFixed(2)} ${ringC.toFixed(2)}" transform="rotate(-90 28 28)"/></svg><span class="tnum" aria-hidden="true">${examPct}%</span></span>
            <div class="rv-ex-body"><span class="t-overline rv-deep">1.4 Linear algebra</span><h3 class="t-h2">Topic exam</h3>
              <p class="t-caption secondary">${examPct}% ready, from your mastery map. 90 min · pass mark 70%.</p></div>
            <button type="button" class="btn secondary" data-paper="topic-1.4">Sit now</button>
          </li>
          <li class="rv-ex" data-track="prob">
            <span class="rv-ex-ic" aria-hidden="true">${I('shield')}</span>
            <div class="rv-ex-body"><span class="t-overline rv-deep">1.5 Probability</span><h3 class="t-h2">Topic exam</h3>
              <p class="t-caption secondary">Sit it now to test out. Pass at 70% and the topic is complete; fall short and you get a list of what to study. 60 min.</p></div>
            <button type="button" class="btn secondary" data-go="exam">Sit now</button>
          </li>
        </ul>
        <div class="rv-exit">
          <div class="rv-exit-h"><h3 class="t-label">Stage 1 exit tests</h3><span class="t-caption muted">Pass all four to leave Foundations</span></div>
          <ul class="rv-exit-l">
            ${FINALS.map(({ id, name: n, track: t }) => `<li data-track="${t}"><button type="button" class="rv-exit-r" data-paper="${id}">
              <span class="rv-exit-n"><span class="t-label">${n} finals paper</span><span class="t-caption muted">3 hours · not sat</span></span>
              <span class="rv-pass t-label tnum">Pass 70%</span>${I('chevronR', 'sm rv-chev')}</button></li>`).join('')}
            <li data-track="code"><div class="rv-exit-r is-static">
              <span class="rv-exit-n"><span class="t-label">Algorithm problems</span><span class="t-caption muted">Starts with 1.8 · 0 of 150 solved</span></span>
              <span class="rv-pass t-label tnum">Pass 150</span><span class="rv-chev-sp" aria-hidden="true"></span></div></li>
          </ul>
        </div>`;

      /* ---------- Practice ---------- */
      const practiceHTML = () => `<ul class="rv-prs">${PRACTICE.slice().sort((a, b) => a.mastery - b.mastery).map(p => {
        const doneN = p.items.filter(x => session.practice[x.id]).length;
        return `<li data-track="${p.track}"><button type="button" class="rv-pr" data-pr="${p.id}">
          <span class="rv-pr-top"><span class="rv-tag sm" aria-hidden="true">${p.topic}</span><span class="t-label">${esc(p.name)}</span><span class="t-label tnum rv-pr-pct">${p.mastery}%<span class="sr-only"> mastery</span></span></span>
          <span class="bar track rv-pr-bar" aria-hidden="true"><i style="width:${p.mastery}%"></i></span>
          <span class="t-caption secondary">${doneN ? `Done today: ${p.items.filter(x => session.practice[x.id]?.ok).length} of ${p.items.length} right` : `Weakest: ${esc(p.skills[0][0].toLowerCase())} · ${p.items.length} problems`}</span>
        </button></li>`; }).join('')}</ul>`;

      /* ---------- Notebook ---------- */
      const notebook = `<ul class="rv-nbs">${NOTEBOOK.map(n => `<li><button type="button" class="rv-nb" data-nb="${n.id}" data-track="${n.track}">
          <span class="t-label">${esc(n.name)}</span>
          <span class="rv-nb-f">${Z.tex('\\displaystyle ' + n.tex)}</span>
          <span class="t-caption muted">${esc(n.src)}</span></button></li>`).join('')}</ul>`;

      root.innerHTML = `
        <div class="rv">
          <header class="rv-head">
            <h1 class="t-h1">Review</h1>
            <p class="t-body secondary">Clear the redo queue first, then homework. Practice sets lean on your weakest skills.</p>
          </header>
          <div class="rv-grid">
            <div class="rv-col">
              <section class="card rv-redo" aria-labelledby="rv-redo-h" data-redo>${redoCard()}</section>
              <section class="card rv-card" aria-labelledby="rv-hw-h">
                <div class="rv-card-h"><h2 class="t-h2" id="rv-hw-h">Homework</h2><span class="t-caption muted">One set per level, due 7 days after release</span></div>
                <ul class="rv-hws">${hw4}${hw1}${hw3}</ul>
              </section>
              <section class="card rv-card" aria-labelledby="rv-ex-h">
                <div class="rv-card-h"><h2 class="t-h2" id="rv-ex-h">Exams</h2><span class="t-caption muted">Timed, no hints, no retries</span></div>
                ${exams}
              </section>
            </div>
            <div class="rv-col">
              <section class="card rv-card" aria-labelledby="rv-pr-h">
                <div class="rv-card-h"><h2 class="t-h2" id="rv-pr-h">Practice sets</h2><span class="t-caption muted">Mastery of the skills you have met</span></div>
                <div data-practice>${practiceHTML()}</div>
              </section>
              <section class="card rv-card" aria-labelledby="rv-nb-h">
                <div class="rv-card-h"><h2 class="t-h2" id="rv-nb-h">Notebook</h2><span class="t-caption muted">${NOTEBOOK.length} formula cards</span></div>
                ${notebook}
              </section>
            </div>
          </div>
        </div>`;

      const redoEl = root.querySelector('[data-redo]');
      const refreshRedo = (focus) => { redoEl.innerHTML = redoCard(); if (focus) redoEl.querySelector('#rv-redo-h').focus(); };

      /* ---------- Sheets ---------- */
      const practiceSheet = (p) => {
        const box = Z.h(`<div class="rv-ps" data-track="${p.track}">
          <span class="t-overline rv-deep">${p.topic} · Practice set</span>
          <h2 class="t-sheet-title">${esc(p.name)}</h2>
          <div class="rv-ps-m"><span class="t-stat tnum">${p.mastery}%</span><span class="t-caption secondary">mastery of the ${p.skills.length} skills you have met</span></div>
          <h3 class="t-label">Skills, weakest first</h3>
          <ul class="rv-sk">${p.skills.map(([n, v]) => `<li><span class="t-body">${esc(n)}</span><span class="bar track thin" aria-hidden="true"><i style="width:${v}%"></i></span><span class="t-label tnum">${v}%</span></li>`).join('')}</ul>
          <p class="t-caption secondary">${p.items.length} problems, interleaved and weighted to the two weakest skills. No hints. ${p.items.every(x => session.practice[x.id]) ? 'You finished this set today, so a repeat earns no XP.' : `${XP_PRACTICE} XP for each right answer.`}</p>
          <button type="button" class="btn track block" data-act="go">Start ${p.items.length} problems, about ${p.items.length + 1} min</button>
        </div>`);
        const close = Z.sheet(box, { label: `${p.name} practice set` });
        box.querySelector('[data-act="go"]').addEventListener('click', () => {
          close();
          play(Z, p.items, 'practice', () => { root.querySelector('[data-practice]').innerHTML = practiceHTML(); root.querySelector(`[data-pr="${p.id}"]`)?.focus(); });
        });
      };
      const paperSheet = (id) => {
        const P = PAPERS[id];
        const box = Z.h(`<div class="rv-hs" data-track="${P.track}">
          <span class="t-overline rv-deep">${esc(P.over)}</span>
          <h2 class="t-sheet-title">${esc(P.title)}</h2>
          <p class="t-body secondary">${esc(P.covers)}</p>
          <ul class="rv-pf">
            <li>${I('clock', 'sm')}<span>${esc(P.time)}</span></li>
            <li>${I('target', 'sm')}<span>Pass mark 70%.${id === 'topic-1.4' ? ` You are ${examPct}% ready, from your mastery map.` : ' Not sat yet.'}</span></li>
            <li>${I('shield', 'sm')}<span>No hints and no retries. You can sit it first to test out.</span></li>
          </ul>
          <button type="button" class="btn block" data-act="go">Open the 1.5 paper</button>
          <p class="t-caption muted rv-proto">Prototype: the exam player is shown with the 1.5 Probability paper.</p>
        </div>`);
        const close = Z.sheet(box, { label: P.title });
        box.querySelector('[data-act="go"]').addEventListener('click', () => { close(); Z.go('exam'); });
      };
      const noteSheet = (n) => Z.sheet(`<div class="rv-note" data-track="${n.track}">
          <span class="t-overline muted">Notebook · ${esc(n.src)}</span>
          <h2 class="t-sheet-title">${esc(n.name)}</h2>
          <div class="rv-note-f">${Z.tex('\\displaystyle ' + n.tex)}</div>
          <p class="t-body">${mdx(Z, n.what)}</p>
          <div class="rv-note-b"><h3 class="t-label">Example</h3><p class="t-body">${mdx(Z, n.ex)}</p></div>
          <div class="rv-note-b"><h3 class="t-label">Common trap</h3><p class="t-body">${mdx(Z, n.trap)}</p></div>
        </div>`, { label: n.name });
      const hw4Sheet = () => {
        const box = Z.h(`<div class="rv-hs" data-track="maths">
          <span class="t-overline rv-deep">Integrals · Level 4</span>
          <h2 class="t-sheet-title">Homework 4 · Integrals</h2>
          <p class="t-body secondary">Due Thu 8 Oct, in 5 days. 3 of 8 answered. Nothing is marked until you submit.</p>
          <ol class="rv-hs-l">${HW4.map((s, j) => `<li class="${j < 3 ? 'on' : ''}"><span class="rv-hs-n tnum">${j + 1}</span><span class="t-body">${mdx(Z, s)}</span><span class="t-caption ${j < 3 ? 'secondary' : 'muted'}">${j < 3 ? 'Answered' : 'To do'}</span></li>`).join('')}</ol>
          <button type="button" class="btn block" data-act="go">Continue at item 4</button>
          <p class="t-caption muted rv-proto">Prototype: the homework player is shown with Homework 1.</p>
        </div>`);
        const close = Z.sheet(box, { label: 'Homework 4' });
        box.querySelector('[data-act="go"]').addEventListener('click', () => { close(); session.hwPreview = false; Z.go('homework'); });
      };
      const verdictLine = (ok, note) => `<span class="t-caption secondary rv-vl">${I(ok ? 'check' : 'cross', 'xs')}<span>${ok ? 'Right' : 'Not right'}${note ? ' · ' + note : ''}</span></span>`;
      const hw3Sheet = () => Z.sheet(`<div class="rv-hs" data-track="maths">
          <span class="t-overline rv-deep">Vectors and Matrices · Level 3</span>
          <h2 class="t-sheet-title">Homework 3 · Vectors</h2>
          <div class="rv-ps-m"><span class="t-stat tnum">82%</span><span class="t-caption secondary">31 of 38 marks. Marked Thu 3 Sep. +85 XP, +14 MP.</span></div>
          <ol class="rv-hs-l">${HW3.map(([t, got, of, note], j) => { const ok = /^Long form/.test(t) ? got >= LONG_PASS : got === of; return `<li class="${ok ? 'ok' : 'no'}"><span class="rv-hs-n tnum">${j + 1}</span>
            <span class="rv-hs-t"><span class="t-body">${mdx(Z, t)}</span>${verdictLine(ok, note)}</span>
            <span class="t-label tnum rv-hs-m">${got} of ${of}</span></li>`; }).join('')}</ol>
        </div>`, { label: 'Homework 3 marks' });
      const hw1Sheet = () => Z.sheet(`<div class="rv-hs" data-track="prob">
          <span class="t-overline rv-deep">Conditional Probability · Level 1</span>
          <h2 class="t-sheet-title">Homework 1 · Updating on evidence</h2>
          <div class="rv-ps-m"><span class="t-stat tnum">${hwRes.pct}%</span><span class="t-caption secondary">${hwRes.marks} of ${HW_TOTAL} marks. Marked today. +${hwRes.xp} XP, +${hwRes.mp} MP.</span></div>
          <ol class="rv-hs-l">${HW.map((it, j) => { const r = hwRes.items[j]; return `<li class="${r.ok ? 'ok' : 'no'}"><span class="rv-hs-n tnum">${it.n}</span>
            <span class="rv-hs-t"><span class="t-body">${esc(it.title)}</span>${verdictLine(r.ok, it.kind === 'long' ? 'Self-marked' : r.ok ? '' : `Back on ${D7} and ${D30}`)}</span>
            <span class="t-label tnum rv-hs-m">${r.got} of ${it.marks}</span></li>`; }).join('')}</ol>
        </div>`, { label: 'Homework 1 marks' });

      /* ---------- Events ---------- */
      const onClick = (e) => {
        const t = e.target;
        const st = t.closest('[data-start]');
        if (st) { const it = REDO.find(r => r.id === st.dataset.start); play(Z, [it], 'redo', () => refreshRedo(true)); return; }
        if (t.closest('[data-start-all]')) { const left = REDO.filter(r => !session.redo[r.id]); if (left.length) play(Z, left, 'redo', () => refreshRedo(true)); return; }
        const pr = t.closest('[data-pr]'); if (pr) { practiceSheet(PRACTICE.find(p => p.id === pr.dataset.pr)); return; }
        const nb = t.closest('[data-nb]'); if (nb) { noteSheet(NOTEBOOK.find(n => n.id === nb.dataset.nb)); return; }
        const pp = t.closest('[data-paper]'); if (pp) { paperSheet(pp.dataset.paper); return; }
        const g = t.closest('[data-go]'); if (g) { Z.go(g.dataset.go); return; }
        const a = t.closest('[data-act]');
        if (a) {
          if (a.dataset.act === 'hw4') hw4Sheet();
          if (a.dataset.act === 'hw1') { session.hwPreview = true; Z.go('homework'); }
          if (a.dataset.act === 'hw1-marks') hw1Sheet();
          if (a.dataset.act === 'hw3') hw3Sheet();
        }
      };
      root.addEventListener('click', onClick);
      return () => root.removeEventListener('click', onClick);
    },
  });

  /* =====================================================================================
     HOMEWORK SET
     ===================================================================================== */
  ZQ.screen({
    id: 'homework', title: 'Homework', group: 'Assessment', shell: false,
    render(root, Z) {
      const I = Z.icon, esc = Z.esc;
      if (!session.hw) session.hw = newHw();
      const S = session.hw;
      /* Preview: the hub opens an unreleased set read-only. Answers save as a draft; Submit waits for release. */
      const preview = session.hwPreview && !S.submitted;
      let view = session.hwView;
      const N = HW.length;

      root.innerHTML = `
        <div class="hw" data-track="prob">
          <header class="hw-top">
            <div class="hw-left">
              <button type="button" class="icon-btn hw-close" aria-label="Close homework. Your answers are saved.">${I('close')}</button>
              <div class="hw-ttl"><span class="hw-ttl-a">Homework 1<span class="hw-ttl-sep"> · </span><span class="hw-ttl-n">Updating on evidence</span></span><span class="t-caption muted hw-ttl-b">Conditional Probability, Level 1</span></div>
            </div>
            <nav class="hw-dots" aria-label="Items"></nav>
            <div class="hw-due"></div>
          </header>
          <main class="hw-frame">
            <div class="hw-scroll"><div class="hw-col" tabindex="-1"></div></div>
            <footer class="hw-foot">
              <p class="t-caption muted hw-save" aria-live="polite"></p>
              <div class="hw-actions"></div>
            </footer>
          </main>
        </div>`;
      const $ = (s) => root.querySelector(s);
      const col = $('.hw-col'), dots = $('.hw-dots'), acts = $('.hw-actions'), save = $('.hw-save'), scroller = $('.hw-scroll'), due = $('.hw-due');
      const drawDue = () => {
        const [ic, a, b] = S.submitted ? ['check', 'Marked today', `${S.result.pct}%`] : preview ? ['lock', 'Preview', 'Unlocks after Level 1'] : ['clock', `Due ${D7}`, '7 days left'];
        due.innerHTML = `<span class="hw-due-a">${I(ic, 'xs')}<span>${a}</span></span><span class="t-caption muted">${b}</span>`;
      };
      let saveT = 0;
      const saved = () => { save.textContent = 'Saved'; clearTimeout(saveT); saveT = setTimeout(() => { save.textContent = ''; }, 1600); };

      const results = () => S.result ? S.result.items : null;
      const answered = (it) => gradeHw(S)[it.n - 1].answered;

      const drawDots = () => {
        const r = results();
        dots.innerHTML = HW.map((it, j) => {
          const cls = r ? (r[j].ok ? 'ok' : 'bad') : answered(it) ? 'ans' : '';
          const state = r ? (r[j].ok ? 'right' : 'not right') : answered(it) ? 'answered' : 'not answered';
          return `<button type="button" class="hw-dot" data-view="${j}" aria-label="Item ${it.n}, ${state}" ${view === j ? 'aria-current="step"' : ''}><i class="${cls} ${view === j ? 'cur' : ''}"></i></button>`;
        }).join('');
      };

      const setActions = (html) => { acts.innerHTML = html; acts.classList.toggle('one', acts.children.length === 1); };

      /* ---------- Views ---------- */
      const intro = () => {
        col.innerHTML = `<section class="hw-intro">
          <span class="t-overline hw-deep">Homework 1 · Conditional Probability, Level 1</span>
          <h1 class="t-lesson-title">Updating on evidence</h1>
          <p class="t-prose">${preview ? 'Eight problems on Level 1. They are released when you finish the level. You can read them now and draft answers, but you cannot submit yet.'
            : 'Eight problems on the level you just finished, from dice and cards to a proof. Work in any order before the due date.'}</p>
          <ul class="hw-facts">
            <li>${I('clock', 'sm')}<span>${preview ? 'Due 7 days after release. About 50 minutes.' : `Due ${D7}, in 7 days. About 50 minutes.`}</span></li>
            <li>${I('lock', 'sm')}<span>No hints, and nothing is marked until you submit. You can change answers until then.</span></li>
            <li>${I('replay', 'sm')}<span>Items you miss join your redo queue: back after 7 days and again after 30.</span></li>
            <li>${I('edit', 'sm')}<span>Item 8 is a written proof. You mark it yourself against a model answer and a 10-point rubric.</span></li>
          </ul>
          <ol class="hw-ov">${HW.map(it => `<li><span class="hw-ov-n tnum">${it.n}</span><span class="t-body">${esc(it.title)}</span>${pips(Z, it.diff)}<span class="t-caption muted tnum hw-ov-m">${plural(it.marks, 'mark', 'marks')}</span></li>`).join('')}</ol>
          <p class="t-caption secondary">${HW_TOTAL} marks in all. Each item is worth its difficulty; the proof is worth 10.</p>
        </section>`;
        setActions(`<button type="button" class="btn hw-primary" data-nav="0">${Object.keys(S.answers).length || S.lf.marked || S.code !== 'none' ? 'Continue' : preview ? 'See the items' : 'Start'}</button>`);
      };

      const itemHead = (it) => `<div class="hw-meta"><span class="t-overline hw-deep">Item ${it.n} of ${N}</span><span class="hw-meta-r">${pips(Z, it.diff)}<span class="t-caption muted tnum">${plural(it.marks, 'mark', 'marks')}</span></span></div>`;

      const verdict = (it, r) => {
        if (!r) return '';
        const head = it.kind === 'long' ? `Self-marked ${r.got} of 10` : r.ok ? 'Right' : r.answered ? 'Not right' : 'No answer';
        const sub = r.ok ? `${r.got} of ${it.marks} marks.` : `${r.got} of ${it.marks} marks. Back in your redo queue on ${D7} and ${D30}.`;
        return `<div class="rv-chip ${r.ok ? 'is-ok' : 'is-no'} hw-verdict"><span class="rv-chip-ic" aria-hidden="true">${I(r.ok ? 'check' : 'cross')}</span>
          <span class="rv-chip-tx"><span class="rv-chip-h"><b>${head}</b></span><span>${esc(sub)}</span></span></div>
          ${it.why ? `<p class="t-body hw-why">${mdx(Z, it.why)}</p>` : ''}
          <p class="t-caption secondary hw-acc">Accepted: ${mdx(Z, it.accept || 'a score of 6 or more counts as right')}.</p>`;
      };

      const itemView = (j) => {
        const it = HW[j], r = results()?.[j], locked = !!r;
        const a = S.answers[it.n];
        let body = '';
        if (it.kind === 'choice' || it.kind === 'multi') {
          const multi = it.kind === 'multi';
          const sel = (k) => multi ? (a || []).includes(k) : a === k;
          const correct = (k) => multi ? it.ans.includes(k) : it.ans === k;
          const two = !multi && it.opts.every(o => typeof o === 'string' && o.length < 18);
          body = `<div class="opts ${two ? 'two' : ''} ${multi ? 'hw-multi' : ''}" role="group" aria-label="Answers">${it.opts.map((o, k) => {
            let cls = sel(k) ? 'selected' : '', badge = '';
            if (locked) {
              cls = sel(k) ? (correct(k) ? 'correct' : 'wrong') : correct(k) ? 'rv-was' : 'dim';
              if (sel(k)) badge = `<span class="badge">${I(correct(k) ? 'check' : 'cross')}</span>`;
            }
            return `<button type="button" class="opt ${cls}" data-o="${k}" aria-pressed="${sel(k)}" ${locked ? 'disabled' : ''}>${multi ? `<span class="hw-box" aria-hidden="true">${I('check')}</span>` : `<span class="rv-k" aria-hidden="true">${k + 1}</span>`}<span class="hw-ot">${optHTML(Z, o)}</span>${badge}</button>`;
          }).join('')}</div>`;
        }
        if (it.kind === 'num') {
          const st = locked ? (r.ok ? 'correct' : 'wrong') : '';
          body = `<label class="field hw-num ${st}"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="${esc(it.label)}" placeholder="For example 3/8 or 0.375" value="${esc(a || '')}" ${locked ? 'readonly' : ''}></label>
            <p class="t-caption muted hw-fmt" ${a && isNaN(parseNum(a)) ? '' : 'hidden'}>Type a fraction such as 3/8, or a decimal such as 0.375.</p>`;
        }
        if (it.kind === 'code') {
          const ok = S.code === 'verified', tried = S.code === 'opened';
          body = `<pre class="hw-code" aria-label="Function to write"><code><span class="kw">from</span> fractions <span class="kw">import</span> Fraction

<span class="kw">def</span> p_given(a, b) -&gt; Fraction:
    <span class="cm">"""Chance of a, given b, for
    two fair dice. a and b take a
    pair (d1, d2), return a bool."""</span></code></pre>
            <p class="t-body">For example, <code class="hw-ic">p_given(lambda d: d[0] + d[1] == 8, lambda d: d[0] == 5)</code> returns <code class="hw-ic">Fraction(1, 6)</code>.</p>
            <div class="hw-run ${ok ? 'ok' : ''}">
              <span class="hw-run-ic" aria-hidden="true">${I(ok ? 'check' : 'terminal')}</span>
              <span class="hw-run-t"><b>${ok ? 'Verified by tests' : tried ? 'Tests not passed yet' : 'Not run yet'}</b><span class="t-caption secondary">${ok ? 'Every example and hidden test passed in the editor.'
                : tried ? 'Submit in the editor until every example and hidden test passes. Only then does this item count.' : 'Pass every example and hidden test in the editor to complete this item.'}</span></span>
              <button type="button" class="btn secondary hw-run-go" data-drill>${I('terminal', 'sm')}${ok ? 'Open in editor' : 'Open the drill'}</button>
            </div>`;
        }
        if (it.kind === 'long') body = longForm(locked, r);
        col.innerHTML = `<section class="hw-item" data-kind="${it.kind}">
          ${itemHead(it)}
          <p class="t-prose">${mdx(Z, it.prompt)}</p>
          ${it.kind === 'long' ? `<h2 class="t-h2 hw-q">Show that</h2><div class="hw-target"><div class="hw-target-in">${Z.tex('\\displaystyle {P(A \\cap B \\cap C)} = {P(A)\\,P(B \\mid A)\\,P(C \\mid A \\cap B)}')}</div></div>` : it.q ? `<h2 class="t-h2 hw-q">${mdx(Z, it.q)}</h2>` : ''}
          <div class="hw-w">${body}</div>
          ${locked ? verdict(it, r) : it.kind !== 'long' && it.kind !== 'code' ? '<p class="t-caption muted hw-note">No feedback until you submit.</p>' : ''}
        </section>`;
        const prevLabel = j === 0 ? 'Back' : 'Previous';
        if (locked) setActions(`<button type="button" class="btn secondary hw-sec" data-nav="${j === 0 ? 'summary' : j - 1}">${j === 0 ? 'Results' : 'Previous'}</button><button type="button" class="btn hw-primary" data-nav="${j < N - 1 ? j + 1 : 'summary'}">${j < N - 1 ? 'Next item' : 'Results'}</button>`);
        else setActions(`<button type="button" class="btn secondary hw-sec" data-nav="${j === 0 ? 'intro' : j - 1}">${prevLabel}</button><button type="button" class="btn hw-primary" data-nav="${j < N - 1 ? j + 1 : 'review'}">${j < N - 1 ? 'Next' : preview ? 'Review answers' : 'Review and submit'}</button>`);
        if (it.kind === 'long') wireLong(locked);
      };

      /* ---------- Long-form item: working, model answer, rubric ---------- */
      const typeset = (s) => String(s).split(/(\$[^$]+\$)/g).map(p => /^\$[^$]+\$$/.test(p) ? Z.tex(p.slice(1, -1)) : esc(p)).join('');
      const SYMS = ['∩', '∪', '∣', '⊆', '≥', '≤', '≠', '·'];
      const model = () => `
        <div class="hw-model">
          <h3 class="t-h2">Model answer</h3>
          <p class="t-body"><b>Step 1.</b> For events $E$ and $F$ with $P(F) > 0$, conditional probability is defined by</p>
          <div class="hw-disp">${Z.tex('P(E \\mid F) = \\frac{P(E \\cap F)}{P(F)}.', true)}</div>
          <p class="t-body">Multiply both sides by $P(F)$ to get the multiplication rule:</p>
          <div class="hw-disp">${Z.tex('P(E \\cap F) = P(F)\\,P(E \\mid F).', true)}</div>
          <p class="t-body"><b>Step 2.</b> Assume $P(A \\cap B) > 0$. Since $A \\cap B$ lies inside $A$, also $P(A) \\ge P(A \\cap B) > 0$, so every condition below has positive probability.</p>
          <div class="hw-deriv" role="group" aria-label="Derivation, one line per step">
            <div class="hw-dl"><span class="hw-dlhs">${Z.tex('P(A \\cap B \\cap C)')}</span><span class="hw-drhs">${Z.tex('= P\\big((A \\cap B) \\cap C\\big)')}</span><span class="hw-dn t-caption">Associativity: group $A$ and $B$ first.</span></div>
            <div class="hw-dl"><span class="hw-dlhs"></span><span class="hw-drhs">${Z.tex('= P(A \\cap B)\\,P(C \\mid A \\cap B)')}</span><span class="hw-dn t-caption">Multiplication rule, $E = C$ and $F = A \\cap B$.</span></div>
            <div class="hw-dl"><span class="hw-dlhs"></span><span class="hw-drhs">${Z.tex('= P(A)\\,P(B \\mid A)\\,P(C \\mid A \\cap B)')}</span><span class="hw-dn t-caption">Multiplication rule, $E = B$ and $F = A$.</span></div>
          </div>
          <p class="t-body"><b>Check.</b> Dealing three hearts gives $\\tfrac{13}{52} \\cdot \\tfrac{12}{51} \\cdot \\tfrac{11}{50} = \\tfrac{11}{850}$, the answer to item 5.</p>
        </div>`.replace(/<p class="t-body">([\s\S]*?)<\/p>/g, (m, inner) => `<p class="t-body">${mdx(Z, inner)}</p>`).replace(/<span class="hw-dn t-caption">([\s\S]*?)<\/span>/g, (m, inner) => `<span class="hw-dn t-caption">${mdx(Z, inner)}</span>`);
      const rubric = (locked) => `
        <fieldset class="hw-rubric">
          <legend class="t-h2">Mark it out of 10</legend>
          <p class="t-caption secondary">Tick each point your working shows. Be strict: your mastery map trusts this mark. ${LONG_PASS} or more counts as right.</p>
          <div class="hw-rbs">${RUBRIC.map((t, k) => `<label class="hw-rb"><input type="checkbox" data-rb="${k}" ${S.lf.ticks.includes(k) ? 'checked' : ''} ${locked ? 'disabled' : ''}><span class="hw-box" aria-hidden="true">${I('check')}</span><span class="t-body">${mdx(Z, t)}</span></label>`).join('')}</div>
          <div class="hw-score" aria-live="polite"><span class="t-stat tnum" data-score>${S.lf.ticks.length}</span><span class="t-h2 muted">of 10</span></div>
        </fieldset>`;
      const longForm = (locked) => {
        if (!S.lf.marked && !locked) return `
          <div class="hw-work">
            <label class="t-label" for="hw-ta">Your working</label>
            <div class="hw-syms" role="group" aria-label="Insert a symbol">${SYMS.map(s => `<button type="button" class="hw-sym" data-sym="${s}" aria-label="Insert ${s}">${s}</button>`).join('')}</div>
            <textarea id="hw-ta" class="hw-ta" rows="9" spellcheck="false" placeholder="Write each step and the reason for it.">${esc(S.lf.text)}</textarea>
            <p class="t-caption muted">Wrap maths in dollar signs to typeset it in the preview.</p>
            <div class="hw-prev" ${S.lf.text.includes('$') ? '' : 'hidden'}><span class="t-overline muted">Preview</span><div class="t-body hw-prev-b">${typeset(S.lf.text)}</div></div>
            <div class="hw-mark-row"><button type="button" class="btn secondary" data-mark ${S.lf.text.trim() ? '' : 'disabled'}>Mark my answer</button><span class="t-caption muted">Shows the model answer and the rubric. Your working then locks.</span></div>
          </div>`;
        return `
          <div class="hw-mine"><span class="t-overline muted">Your working, locked</span><div class="t-body hw-mine-b">${S.lf.text.trim() ? typeset(S.lf.text) : '<span class="muted">No working written.</span>'}</div></div>
          ${model()}
          ${rubric(locked)}`;
      };
      const wireLong = (locked) => {
        const ta = col.querySelector('#hw-ta');
        if (ta) {
          const prev = col.querySelector('.hw-prev'), pb = col.querySelector('.hw-prev-b'), mk = col.querySelector('[data-mark]');
          const upd = () => { S.lf.text = ta.value; mk.disabled = !ta.value.trim(); prev.hidden = !ta.value.includes('$'); pb.innerHTML = typeset(ta.value); drawDots(); };
          ta.addEventListener('input', () => { upd(); saved(); });
          col.querySelectorAll('[data-sym]').forEach(b => b.addEventListener('click', () => {
            const s = b.dataset.sym, a0 = ta.selectionStart, a1 = ta.selectionEnd;
            ta.value = ta.value.slice(0, a0) + s + ta.value.slice(a1); ta.focus(); ta.selectionStart = ta.selectionEnd = a0 + s.length; upd();
          }));
          mk.addEventListener('click', () => {
            S.lf.marked = true; Z.sound('tap');
            itemView(view); drawDots(); saved();
            const m = col.querySelector('.hw-model'); if (m) { m.setAttribute('tabindex', '-1'); m.focus({ preventScroll: true }); m.scrollIntoView({ behavior: Z.reducedMotion() ? 'auto' : 'smooth', block: 'start' }); }
          });
        }
        if (!locked) col.querySelectorAll('[data-rb]').forEach(cb => cb.addEventListener('change', () => {
          const k = +cb.dataset.rb;
          S.lf.ticks = cb.checked ? [...new Set([...S.lf.ticks, k])] : S.lf.ticks.filter(x => x !== k);
          col.querySelector('[data-score]').textContent = S.lf.ticks.length; saved();
        }));
      };

      /* ---------- Review before submitting ---------- */
      const reviewView = () => {
        const g = gradeHw(S);
        const status = (it, r) => it.kind === 'long' ? (S.lf.marked ? `Self-marked ${S.lf.ticks.length} of 10` : S.lf.text.trim() ? 'Written, not marked yet' : 'No answer')
          : it.kind === 'code' ? (S.code === 'verified' ? 'Verified by tests' : S.code === 'opened' ? 'Tests not passed yet' : 'Not run yet') : r.answered ? 'Answered' : 'No answer';
        const missing = HW.filter((it, j) => !g[j].answered).map(it => it.n);
        col.innerHTML = `<section class="hw-rev">
          <span class="t-overline hw-deep">Homework 1 · ${N} items</span>
          <h1 class="t-lesson-title">${preview ? 'Your draft' : 'Ready to submit?'}</h1>
          <p class="t-prose">${preview ? 'Homework 1 is released when you finish Level 1. Your answers stay here as a draft until then, and you have 7 days from release to submit.'
            : `Nothing is marked until you submit, and you cannot change answers afterwards. You have until ${D7}.`}</p>
          <ol class="hw-rl">${HW.map((it, j) => `<li><button type="button" class="hw-rl-r ${g[j].answered ? 'is-on' : ''}" data-nav="${j}">
            <span class="hw-ov-n tnum">${it.n}</span><span class="hw-rl-t"><span class="t-body">${esc(it.title)}</span><span class="t-caption ${g[j].answered ? 'secondary' : 'hw-miss'}">${status(it, g[j])}</span></span>${I('chevronR', 'sm rv-chev')}</button></li>`).join('')}</ol>
          ${missing.length ? `<p class="hw-warn t-body">${I('flag', 'sm')}<span>${missing.length === 1 ? `Item ${missing[0]} has` : `Items ${listAnd(missing.map(String))} have`} no answer yet.${preview ? '' : ` ${missing.length === 1 ? 'It' : 'They'} will score 0 and join your redo queue.`}</span></p>` : ''}
          ${preview ? `<p class="t-caption secondary hw-lockn">${I('lock', 'xs')}<span>You can submit once Homework 1 is released.</span></p>` : ''}
        </section>`;
        setActions(`<button type="button" class="btn secondary hw-sec" data-nav="${N - 1}">Back</button>${preview
          ? '<button type="button" class="btn hw-primary" data-back>Back to Review</button>'
          : '<button type="button" class="btn hw-primary" data-submit>Submit homework</button>'}`);
      };

      const confirmSubmit = () => {
        const box = Z.h(`<div class="hw-conf"><h2 class="t-sheet-title">Submit Homework 1?</h2>
          <p class="t-body secondary">You cannot change answers after this. Items you miss join your redo queue for ${D7} and ${D30}.</p>
          <div class="hw-conf-a"><button type="button" class="btn secondary" data-close>Keep working</button><button type="button" class="btn" data-yes>Submit</button></div></div>`);
        const close = Z.sheet(box, { modal: true, label: 'Submit homework' });
        box.querySelector('[data-yes]').addEventListener('click', () => {
          const items = gradeHw(S);
          const marks = items.reduce((s, r) => s + r.got, 0), right = items.filter(r => r.ok).length;
          S.result = { items, marks, right, pct: Math.round(marks / HW_TOTAL * 100), xp: 50 + 5 * right, mp: MP_EACH * right, wrong: items.filter(r => !r.ok).map(r => r.n) };
          S.submitted = true; award(Z, { mp: S.result.mp, xp: S.result.xp });
          close(); go('summary', true);
        });
      };

      /* ---------- Marked summary ---------- */
      const summaryView = (fresh) => {
        const R = S.result;
        col.innerHTML = `<section class="hw-sum">
          <span class="t-overline hw-deep">Homework 1 · Updating on evidence</span>
          <h1 class="t-complete">Homework marked</h1>
          <div class="hw-score-big"><span class="t-stat tnum" data-count>${fresh && !Z.reducedMotion() ? 0 : R.marks}</span><span class="t-h2 secondary">of ${HW_TOTAL} marks · ${R.pct}%</span></div>
          <div class="hw-badges">
            <div class="hw-badge"><span class="t-h1 tnum">${R.right} of ${N}</span><span class="t-caption muted">items right</span></div>
            <div class="hw-badge"><span class="t-h1 tnum hw-xp">${Z.spark(true)}+${R.xp}</span><span class="t-caption muted">XP: 50, plus 5 for each right item</span></div>
            <div class="hw-badge"><span class="t-h1 tnum">${I('target', 'sm')}+${R.mp}</span><span class="t-caption muted">mastery points, ${MP_EACH} per right item</span></div>
          </div>
          <div class="hw-redo">${R.wrong.length
            ? `${I('replay', 'sm')}<span><b>To your redo queue: ${R.wrong.length === 1 ? 'item' : 'items'} ${listAnd(R.wrong.map(String))}.</b> ${R.wrong.length === 1 ? 'It comes' : 'They come'} back on ${D7} and again on ${D30}.</span>`
            : `${I('check', 'sm')}<span><b>Nothing to redo.</b> Every item was right first time.</span>`}</div>
          <h2 class="t-h2 hw-res-h">Item by item</h2>
          <ol class="hw-res">${HW.map((it, j) => { const r = R.items[j]; return `<li><button type="button" class="hw-res-r ${r.ok ? 'ok' : 'no'}" data-nav="${j}">
            <span class="hw-res-ic" aria-hidden="true">${I(r.ok ? 'check' : 'cross')}</span>
            <span class="hw-rl-t"><span class="t-body"><span class="tnum">${it.n}.</span> ${esc(it.title)}</span><span class="t-caption secondary">${it.kind === 'long' ? `Self-marked ${r.got} of 10` : it.kind === 'code' ? (r.ok ? 'Verified by tests' : 'Tests not passed') : r.ok ? 'Right' : r.answered ? 'Not right' : 'No answer'}${r.ok ? '' : ' · to redo'}</span></span>
            <span class="t-label tnum hw-res-m">${r.got} of ${it.marks}</span>${I('chevronR', 'sm rv-chev')}</button></li>`; }).join('')}</ol>
        </section>`;
        setActions(`<button type="button" class="btn hw-primary" data-back>Back to Review</button>`);
        if (fresh) {
          Z.sound('complete');
          const n = col.querySelector('[data-count]');
          Z.countUp(n, R.marks, 900);
          col.querySelectorAll('.hw-badge').forEach((b, k) => { b.style.animationDelay = (300 + k * 80) + 'ms'; b.classList.add('hw-in'); });
        }
      };

      /* ---------- Navigation ---------- */
      const go = (v, fresh) => {
        view = v; session.hwView = v;
        if (v === 'intro') intro();
        else if (v === 'review') { if (S.submitted) { go('summary'); return; } reviewView(); }
        else if (v === 'summary') { if (!S.submitted) { go('review'); return; } summaryView(fresh); }
        else itemView(v);
        root.querySelector('.hw').classList.toggle('is-sum', v === 'summary');
        drawDue(); drawDots();
        scroller.scrollTop = 0;
        col.focus({ preventScroll: true });
      };

      const onClick = (e) => {
        const t = e.target;
        if (t.closest('.hw-close')) { Z.go('review'); return; }
        const nav = t.closest('[data-nav], [data-view]');
        if (nav) { const v = nav.dataset.nav ?? nav.dataset.view; go(/^\d+$/.test(v) ? +v : v); return; }
        if (t.closest('[data-submit]')) { confirmSubmit(); return; }
        if (t.closest('[data-back]')) { Z.go('review'); return; }
        if (t.closest('[data-drill]')) { if (S.code === 'none') S.code = 'opened'; watchDrill(); Z.go('drill'); return; }
        const o = t.closest('.hw-item .opt');
        if (o && !o.disabled && typeof view === 'number') {
          const it = HW[view], k = +o.dataset.o;
          if (it.kind === 'multi') {
            const cur = new Set(S.answers[it.n] || []);
            cur.has(k) ? cur.delete(k) : cur.add(k);
            S.answers[it.n] = [...cur].sort();
            o.classList.toggle('selected', cur.has(k)); o.setAttribute('aria-pressed', String(cur.has(k)));
          } else {
            S.answers[it.n] = k;
            col.querySelectorAll('.opt').forEach(b => { const on = b === o; b.classList.toggle('selected', on); b.setAttribute('aria-pressed', String(on)); });
          }
          Z.sound('tap'); drawDots(); saved();
        }
      };
      const onInput = (e) => {
        const inp = e.target.closest('.hw-num input');
        if (!inp || typeof view !== 'number') return;
        S.answers[HW[view].n] = inp.value.trim() ? inp.value : undefined;
        if (!inp.value.trim()) delete S.answers[HW[view].n];
        const bad = inp.value.trim() && isNaN(parseNum(inp.value));
        col.querySelector('.hw-fmt').hidden = !bad;
        drawDots(); saved();
      };
      const onKey = (e) => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || document.querySelector('.scrim')) return;
        if (e.target.matches('textarea')) return;
        if (e.target.matches('.hw-num input') && e.key === 'Enter') { e.preventDefault(); acts.querySelector('.hw-primary')?.click(); return; }
        if (e.target.matches('input')) return;
        /* Enter on an option triggers the footer's primary button (spec 5.4); Space still picks the option */
        if (e.key === 'Enter' && e.target.closest('.hw-item .opt')) { e.preventDefault(); acts.querySelector('.hw-primary')?.click(); return; }
        const k = parseInt(e.key, 10);
        if (typeof view === 'number' && k >= 1) { const opts = col.querySelectorAll('.opt:not(:disabled)'); if (k <= opts.length) { e.preventDefault(); opts[k - 1].click(); opts[k - 1].focus(); } }
      };
      root.addEventListener('click', onClick);
      root.addEventListener('input', onInput);
      document.addEventListener('keydown', onKey);
      go(view);
      return () => {
        root.removeEventListener('click', onClick); root.removeEventListener('input', onInput); document.removeEventListener('keydown', onKey); clearTimeout(saveT);
        if (location.hash !== '#drill') session.hwPreview = false;
      };
    },
  });
})();
