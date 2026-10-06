/* Curriculum model and example learner state for the prototype.
   Stages and topics follow docs/Zero_to_Quant_Curriculum.md. Course names are our own.
   The learner state below is example data, clearly a prototype. */
(function () {
  const T = (id, name, hours, track, courses) => ({ id, name, hours, track, courses });
  const C = (id, name, lessons, exercises, extra = {}) => ({ id, name, lessons, exercises, ...extra });

  const stages = [
    { id: 0, name: 'From nothing', hours: 500, exit: 'GCSE Higher paper at 80%, precalculus test at 85%, mental arithmetic 25+, a Python script you wrote runs',
      topics: [
        T('0.1', 'Number', 60, 'maths', [C('number-sense', 'Number Sense', 24, 210, { art: 'fraction' }), C('ratio', 'Ratio and Percentages', 20, 180, { art: 'pie' })]),
        T('0.2', 'Algebra', 180, 'maths', [C('equations', 'Equations and Inequalities', 30, 280, { art: 'balance' }), C('functions', 'Functions and Graphs', 28, 260, { art: 'curve' }), C('quadratics', 'Quadratics', 22, 200, { art: 'parabola' })]),
        T('0.3', 'Precalculus', 200, 'maths', [C('exp-log', 'Exponentials and Logarithms', 26, 240, { art: 'exp' }), C('trig', 'Trigonometry', 30, 270, { art: 'circle' }), C('series', 'Sequences and Series', 22, 200, { art: 'steps' }), C('counting', 'Counting and Vectors', 24, 220, { art: 'grid' })]),
        T('0.4', 'Computer basics', 40, 'code', [C('terminal', 'Your Machine and the Terminal', 12, 90, { art: 'terminal' }), C('first-python', 'First Python Scripts', 14, 110, { art: 'code' })]),
        T('0.5', 'Mental arithmetic', 20, 'speed', [C('mental', 'Mental Arithmetic Drills', 16, 400, { art: 'timer' })]),
      ] },
    { id: 1, name: 'Foundations', hours: 1400, exit: 'Finals-style papers at 70% in calculus, linear algebra and probability; 150 algorithm problems solved',
      topics: [
        T('1.1', 'Python', 150, 'code', [C('py-found', 'Python Foundations', 32, 300, { art: 'code' }), C('numpy-pandas', 'NumPy and pandas', 26, 240, { art: 'table' }), C('plotting', 'Plotting Market Data', 14, 120, { art: 'candles' })]),
        T('1.2', 'Tools', 40, 'code', [C('git', 'Git and the Command Line', 12, 100, { art: 'branch' }), C('sql', 'SQL Basics', 10, 90, { art: 'table' }), C('pytest', 'Testing with pytest', 8, 70, { art: 'check' })]),
        T('1.3', 'Calculus', 200, 'maths', [C('limits', 'Limits and Derivatives', 30, 290, { art: 'tangent' }), C('integrals', 'Integrals', 28, 260, { art: 'area' }), C('taylor', 'Series and Approximation', 18, 160, { art: 'steps' }), C('multivar', 'Multivariable Calculus', 30, 280, { art: 'surface' })]),
        T('1.4', 'Linear algebra', 150, 'maths', [C('vectors', 'Vectors and Matrices', 24, 220, { art: 'matrix' }), C('elimination', 'Elimination and Rank', 18, 170, { art: 'matrix' }), C('least-squares', 'Orthogonality and Least Squares', 20, 190, { art: 'projection' }), C('eigen', 'Eigenvalues and the SVD', 22, 210, { art: 'ellipse' })]),
        T('1.5', 'Probability', 250, 'prob', [
          C('counting-chance', 'Counting and Chance', 28, 270, { art: 'die' }),
          C('conditional', 'Conditional Probability', 26, 250, { art: 'tree' }),
          C('random-vars', 'Random Variables', 30, 290, { art: 'bars' }),
          C('limits-thm', 'Distributions and Limit Theorems', 32, 300, { art: 'bell' }),
          C('markov', 'Markov Chains and Random Walks', 22, 210, { art: 'walk' })]),
        T('1.6', 'Statistics', 120, 'prob', [C('estimation', 'Estimation', 20, 190, { art: 'bell' }), C('testing', 'Hypothesis Testing', 18, 170, { art: 'tails' }), C('regression', 'Linear Regression', 22, 210, { art: 'scatter' })]),
        T('1.7', 'Finance basics', 100, 'fin', [C('markets', 'Markets and Instruments', 18, 160, { art: 'book' }), C('options', 'Options and Payoffs', 20, 190, { art: 'payoff' }), C('trees', 'Pricing with Trees', 16, 150, { art: 'tree' }), C('micro', 'Market Microstructure', 14, 130, { art: 'book' })]),
        T('1.8', 'Data structures and algorithms', 250, 'code', [C('algo-think', 'Algorithmic Thinking', 22, 200, { art: 'steps' }), C('ds', 'Core Data Structures', 30, 280, { art: 'tree' }), C('graphs-dp', 'Graphs and Dynamic Programming', 28, 260, { art: 'graph' })]),
        T('1.9', 'C++', 140, 'code', [C('cpp', 'C++ Foundations', 26, 240, { art: 'code' }), C('cpp-pricing', 'C++ for Pricing', 14, 120, { art: 'payoff' })]),
      ] },
    { id: 2, name: 'Intermediate', hours: 800, exit: 'Three finished projects, each with tests and a written results note',
      topics: [
        T('2.1', 'Machine learning', 200, 'ml', [C('stat-learning', 'Statistical Learning', 30, 280, { art: 'scatter' }), C('validation', 'Validation and Leakage', 18, 170, { art: 'folds' }), C('ensembles', 'Trees and Ensembles', 20, 190, { art: 'tree' }), C('fin-ml', 'Financial Machine Learning', 22, 200, { art: 'layers' })]),
        T('2.2', 'Time series', 60, 'prob', [C('arma', 'Stationarity and ARMA', 14, 130, { art: 'walk' }), C('garch', 'Volatility and GARCH', 10, 90, { art: 'vol' }), C('coint', 'Cointegration', 8, 70, { art: 'pair' })]),
        T('2.3', 'Projects', 400, 'fin', [C('backtest', 'Backtesting Engine', 10, 60, { art: 'candles' }), C('alpha', 'Alpha Signal Research', 10, 60, { art: 'scatter' }), C('opt-dash', 'Options Analytics Dashboard', 10, 60, { art: 'surface' })]),
        T('2.4', 'Contests', 140, 'speed', [C('contests', 'Contest Practice', 12, 300, { art: 'timer' })]),
      ] },
    { id: 3, name: 'Advanced', hours: 400, exit: '80% of the green book probability chapter solved cold; mental arithmetic 50+; ten mock interviews',
      topics: [
        T('3.1', 'Research papers', 150, 'ml', [C('momentum-rep', 'Replicating Momentum', 8, 50, { art: 'bars' }), C('pairs-rep', 'Replicating Pairs Trading', 8, 50, { art: 'pair' })]),
        T('3.2', 'Stochastic calculus', 0, 'maths', [C('ito', 'Brownian Motion and Itô', 20, 180, { art: 'walk' })]),
        T('3.3', 'Interview preparation', 250, 'speed', [C('puzzles', 'Probability Puzzles', 24, 300, { art: 'die' }), C('mm-games', 'Market-Making Games', 12, 120, { art: 'book' }), C('mental-pressure', 'Mental Maths Under Pressure', 10, 400, { art: 'timer' })]),
      ] },
  ];

  /* The course used by the course map, Today and the lesson player. */
  const currentCourse = {
    id: 'conditional', topic: '1.5', name: 'Conditional Probability', track: 'prob', art: 'tree',
    description: 'Update a probability when you learn something. Build to Bayes’ rule and use it on trades.',
    lessons: 26, exercises: 250,
    levels: [
      { n: 1, name: 'Updating on evidence', items: [
        { kind: 'lesson', id: 'l1', name: 'What changes when you learn something', status: 'done', mastered: true, screens: 10 },
        { kind: 'lesson', id: 'l2', name: 'Counting what is left', status: 'done', mastered: true, screens: 11 },
        { kind: 'lesson', id: 'l3', name: 'Shrinking the sample space', status: 'current', screens: 10 },
        { kind: 'lesson', id: 'l4', name: 'The multiplication rule', status: 'upcoming', screens: 12 },
        { kind: 'lesson', id: 'l5', name: 'Trees for sequences', status: 'upcoming', screens: 11 },
        { kind: 'review', id: 'r1', name: 'Level review', status: 'upcoming' },
        { kind: 'homework', id: 'h1', name: 'Homework 1', status: 'upcoming' } ] },
      { n: 2, name: 'Bayes’ rule', items: [
        { kind: 'lesson', id: 'l6', name: 'Turning the condition around', status: 'upcoming', screens: 10 },
        { kind: 'lesson', id: 'l7', name: 'Base rates', status: 'upcoming', screens: 12 },
        { kind: 'lesson', id: 'l8', name: 'Natural frequencies', status: 'upcoming', screens: 10 },
        { kind: 'lesson', id: 'l9', name: 'Odds form', status: 'upcoming', screens: 9 },
        { kind: 'lesson', id: 'l10', name: 'Updating twice', status: 'upcoming', screens: 11 },
        { kind: 'lesson', id: 'l11', name: 'Bayes on a trading signal', status: 'upcoming', screens: 12 },
        { kind: 'review', id: 'r2', name: 'Level review', status: 'upcoming' },
        { kind: 'homework', id: 'h2', name: 'Homework 2', status: 'upcoming' } ] },
      { n: 3, name: 'Independence', items: [
        { kind: 'lesson', id: 'l12', name: 'When knowing tells you nothing', status: 'upcoming', screens: 10 },
        { kind: 'lesson', id: 'l13', name: 'Pairwise is not enough', status: 'upcoming', screens: 11 },
        { kind: 'lesson', id: 'l14', name: 'Conditional independence', status: 'upcoming', screens: 12 },
        { kind: 'lesson', id: 'l15', name: 'Correlated defaults', status: 'upcoming', screens: 10 },
        { kind: 'review', id: 'r3', name: 'Level review', status: 'upcoming' },
        { kind: 'homework', id: 'h3', name: 'Homework 3', status: 'upcoming' } ] },
      { n: 4, name: 'Puzzles that fool experts', items: [
        { kind: 'lesson', id: 'l16', name: 'The Monty Hall problem', status: 'upcoming', screens: 11 },
        { kind: 'lesson', id: 'l17', name: 'Two children, one boy', status: 'upcoming', screens: 10 },
        { kind: 'lesson', id: 'l18', name: 'The prosecutor’s fallacy', status: 'upcoming', screens: 10 },
        { kind: 'review', id: 'r4', name: 'Level review', status: 'upcoming' },
        { kind: 'homework', id: 'h4', name: 'Homework 4', status: 'upcoming' } ] },
    ],
  };

  /* Example learner. All numbers are illustrative. */
  const learner = {
    first: 'Muddassir', initial: 'M', stage: 1, track: 'Researcher', weeklyGoalH: 15,
    hoursThisWeek: { main: 6.5, build: 2, review: 1, mental: 0.5 },
    streak: 11, restDays: 1, todayDone: false, bestStreak: 23,
    week: ['lit', 'lit', 'rest', 'lit', 'lit', 'today', 'future'], // Monday to Sunday
    xp: 1240, mp: 312,
    league: { tier: 'Gamma', daysLeft: 2, rank: 9, size: 30, promote: 10, demote: 5, optedIn: true },
    progress: { // course id -> fraction complete
      'number-sense': 1, ratio: 1, equations: 1, functions: 1, quadratics: 1, 'exp-log': 1, trig: 1, series: 1, counting: 1,
      terminal: 1, 'first-python': 1, mental: 0.7, 'py-found': 1, 'numpy-pandas': 0.85, plotting: 0.4, git: 1, sql: 0.6, pytest: 0.3,
      limits: 1, integrals: 0.55, vectors: 0.7, 'counting-chance': 1, conditional: 0.08 },
    passed: ['0.1', '0.2', '0.3', '0.4', '1.2'],
    due: { redo: 4, redoMinutes: 9, homework: { name: 'Homework 4 · Integrals', due: 'Thu 9 Oct' }, weeklyProbs: 2 },
    mental: { last: 31, trend: [18, 21, 22, 24, 23, 26, 27, 29, 28, 31] },
    nextExam: { topic: '1.4', name: 'Linear algebra topic exam', readiness: 0.62 },
  };

  const trackNames = { maths: 'Maths', prob: 'Probability and statistics', code: 'Programming', fin: 'Finance', ml: 'Machine learning', speed: 'Interview and speed' };
  const trackShort = { maths: 'Maths', prob: 'Prob & Stats', code: 'Programming', fin: 'Finance', ml: 'ML', speed: 'Interview' };

  window.ZQData = { stages, currentCourse, learner, trackNames, trackShort,
    topic(id) { for (const s of stages) for (const t of s.topics) if (t.id === id) return t; return null; },
    allCourses() { return stages.flatMap(s => s.topics.flatMap(t => t.courses.map(c => ({ ...c, topic: t.id, topicName: t.name, track: t.track, stage: s.id })))); },
  };
})();
