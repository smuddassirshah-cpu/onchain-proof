/* Python runner for the code drill (#drill). A module Web Worker, so the page can terminate it when a run
   passes the 5-second limit. It loads the vendored Pyodide, defines the grader, then runs one submission per
   message and streams one JSON event per test back to the page.

   Messages in:  { type: 'init', indexURL }   indexURL is the vendor/pyodide/ folder, absolute, ending in '/'
                 { type: 'run', id, code, spec }
                   spec = { fn, compare: 'isclose' | 'fraction', prelude, tests: [{ prices } | { gen } | { args }, expected] }
                   args and a string expected are Python source, evaluated after the prelude (lambdas for events, Fraction values)
   Messages out: { type: 'ready', version, ms } | { type: 'fail', message }
                 { type: 'event', id, data }   data is JSON: loaded | test | error | done
                 { type: 'crash', id, message } | { type: 'end', id } */
'use strict';

let py = null;
let runFn = null;

/* The grader. User code runs as solution.py in a fresh namespace; stdout and stderr are captured per test;
   tracebacks keep only the learner's own frames. Floats are compared with math.isclose(rel_tol=1e-9);
   'fraction' drills accept only a Fraction exactly equal to the expected value. */
const GRADER = String.raw`
import contextlib, io, json, linecache, math, numbers, time, traceback
from fractions import Fraction

def _walk(n, seed, start, step):
    # Seeded random walk built from an integer LCG, so every Python produces the same prices.
    x = seed
    p = start
    out = []
    for _ in range(n):
        x = (x * 1103515245 + 12345) % 2147483648
        p = p * (1 + step * ((x % 2001 - 1000) / 1000))
        out.append(p)
    return out

def _prices(t):
    g = t.get('gen')
    if g:
        return _walk(g['n'], g['seed'], g['start'], g['step'])
    return [float(v) for v in t['prices']]

def _args(t, env):
    # Python source for the argument tuple (events as lambdas), or a list of prices
    if 'args' in t:
        return tuple(eval(compile(t['args'], '<test>', 'eval'), dict(env)))
    return (_prices(t),)

def _expected(t, env):
    e = t['expected']
    return eval(compile(e, '<test>', 'eval'), dict(env)) if isinstance(e, str) else e

def _check(mode, actual, expected):
    # Returns (right type, accepted)
    if mode == 'fraction':
        typed = isinstance(actual, Fraction)
        return typed, typed and actual == expected
    typed = isinstance(actual, numbers.Real) and not isinstance(actual, bool)
    try:
        return typed, typed and math.isclose(actual, expected, rel_tol=1e-9)
    except Exception:
        return typed, False

def _tb(e):
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == 'solution.py']
    out = []
    if frames:
        out.append('Traceback (most recent call last):\n')
        out.extend(traceback.format_list(frames))
    out.extend(traceback.format_exception_only(type(e), e))
    return ''.join(out).rstrip()

def _cap(s, n=4000):
    return s if len(s) <= n else s[:n] + '\n[output cut at 4,000 characters]'

def _repr(v):
    try:
        return _cap(repr(v), 400)
    except Exception as e:
        return '<repr failed: ' + type(e).__name__ + '>'

def drl_run(code, spec_json, emit):
    spec = json.loads(spec_json)
    name = spec['fn']
    mode = spec.get('compare', 'isclose')
    env = {}
    exec(spec.get('prelude', ''), env)
    start = time.perf_counter()
    linecache.cache['solution.py'] = (len(code), None, code.splitlines(True), 'solution.py')
    ns = {'__name__': '__main__'}
    out = io.StringIO()
    try:
        compiled = compile(code, 'solution.py', 'exec')
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
            exec(compiled, ns)
    except BaseException as e:
        emit(json.dumps({'kind': 'error', 'stage': 'load', 'error': _tb(e), 'stdout': _cap(out.getvalue())}))
        return
    fn = ns.get(name)
    if not callable(fn):
        emit(json.dumps({'kind': 'error', 'stage': 'missing', 'error': 'NameError: solution.py does not define ' + name + '()', 'stdout': _cap(out.getvalue())}))
        return
    emit(json.dumps({'kind': 'loaded', 'stdout': _cap(out.getvalue()), 'ms': (time.perf_counter() - start) * 1000}))
    for i, t in enumerate(spec['tests']):
        args = _args(t, env)
        expected = _expected(t, env)
        buf = io.StringIO()
        err = None
        actual = None
        t0 = time.perf_counter()
        try:
            with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
                actual = fn(*args)
        except BaseException as e:
            err = _tb(e)
        ms = (time.perf_counter() - t0) * 1000
        typed, ok = _check(mode, actual, expected)
        emit(json.dumps({'kind': 'test', 'i': i, 'ok': bool(ok and err is None), 'actual': None if err else _repr(actual),
                         'type': type(actual).__name__, 'number': bool(typed), 'error': err,
                         'stdout': _cap(buf.getvalue()), 'ms': ms}))
    emit(json.dumps({'kind': 'done', 'ms': (time.perf_counter() - start) * 1000}))
`;

self.onmessage = async (e) => {
  const m = e.data || {};
  if (m.type === 'init') {
    const t0 = performance.now();
    try {
      if (typeof WebAssembly !== 'object') throw new Error('This browser has no WebAssembly support.');
      const { loadPyodide } = await import(m.indexURL + 'pyodide.mjs'); // this Pyodide build needs a module worker
      py = await loadPyodide({ indexURL: m.indexURL, stdout: () => {}, stderr: () => {} });
      py.runPython(GRADER);
      runFn = py.globals.get('drl_run');
      const version = py.runPython('import sys\n"%d.%d" % sys.version_info[:2]');
      self.postMessage({ type: 'ready', version, ms: Math.round(performance.now() - t0) });
    } catch (err) {
      self.postMessage({ type: 'fail', message: String((err && err.message) || err) });
    }
    return;
  }
  if (m.type === 'run') {
    const emit = (s) => self.postMessage({ type: 'event', id: m.id, data: String(s) });
    try {
      if (!runFn) throw new Error('Python is not ready.');
      runFn(m.code, JSON.stringify(m.spec), emit);
    } catch (err) {
      self.postMessage({ type: 'crash', id: m.id, message: String((err && err.message) || err) });
    }
    self.postMessage({ type: 'end', id: m.id });
  }
};
