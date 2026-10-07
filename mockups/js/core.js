/* Zero to Quant prototype runtime: screen registry and router, icons, maths, sound, motion helpers, shell.
   Screens register with ZQ.screen({...}) from js/screens/*.js. Routes are plain hash tokens (#today, #lesson). */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('zq.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('zq.' + k, JSON.stringify(v)); } catch { /* storage unavailable: setting lasts for this visit only */ } },
  };

  /* ---------- Icons: 24px grid, 2px stroke, round caps ---------- */
  const P = {
    close: 'M6 6l12 12M18 6L6 18',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    cross: 'M7 7l10 10M17 7L7 17',
    flag: 'M5 21V4h11l-2 4 2 4H5',
    sound: 'M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12',
    mute: 'M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6',
    bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
    today: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5zM4 9h16M8 2.5v3M16 2.5v3M8.5 13.5l2.5 2.5 4.5-4.5',
    learn: 'M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5z',
    review: 'M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5',
    you: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c.8-3.6 3.8-6 7.5-6s6.7 2.4 7.5 6',
    shield: 'M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z',
    clipboard: 'M9 4h6v3H9zM9 5.5H6.5A1.5 1.5 0 0 0 5 7v12.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H15M8.5 12.5h7M8.5 16.5h5',
    terminal: 'M4 5.5h16v13H4zM7.5 10l3 2.5-3 2.5M12.5 15.5H16',
    star: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z',
    chevronR: 'M9.5 6l6 6-6 6', chevronL: 'M14.5 6l-6 6 6 6', chevronD: 'M6 9.5l6 6 6-6', chevronU: 'M6 14.5l6-6 6 6',
    search: 'M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM15.5 15.5L21 21',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7.5 7.5 0 0 1-1.7 1l-.3 2h-4l-.3-2a7.5 7.5 0 0 1-1.7-1l-1.9.7-2-3.4 1.6-1.2a7.6 7.6 0 0 1 0-3l-1.6-1.2 2-3.4 1.9.7a7.5 7.5 0 0 1 1.7-1l.3-2h4l.3 2a7.5 7.5 0 0 1 1.7 1l1.9-.7 2 3.4-1.6 1.2a7.6 7.6 0 0 1 0 3z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
    play: 'M8 5.5v13l10-6.5z',
    replay: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4h4',
    arrowR: 'M5 12h14M13 6l6 6-6 6',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    menu: 'M4 7h16M4 12h16M4 17h16',
    book: 'M5 4.5h10.5A2.5 2.5 0 0 1 18 7v13H7.5A2.5 2.5 0 0 1 5 17.5zM5 17.5A2.5 2.5 0 0 1 7.5 15H18',
    target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z',
    trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1.5A3 3 0 0 0 8 10.5M16 6h3v1.5a3 3 0 0 1-3 3M12 13v4M8.5 20.5h7M10 17h4v3.5h-4z',
    lock: 'M6.5 11h11v9.5h-11zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    sparkle: 'M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z',
    timer: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 1.5M9.5 2.5h5',
    bolt: 'M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    edit: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
    rest: 'M8 4.5h8M9 4.5v3.5a3 3 0 0 0 6 0V4.5M8 19.5h8M9 19.5V16a3 3 0 0 1 6 0v3.5',
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[name] || ''}"/></svg>`;
  const BOLT_PATH = 'M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z';
  const bolt = (lit, cls = '') => `<svg class="bolt ${lit ? 'lit' : ''} ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${BOLT_PATH}"/></svg>`;
  /* XP glyph: four-point spark; outline at 0, solid strong green once XP > 0 */
  const spark = (on) => `<svg class="spark ${on ? 'on' : ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c.7 5.3 3.2 8.2 9.5 9.5-6.3 1.3-8.8 4.2-9.5 9.5-.7-5.3-3.2-8.2-9.5-9.5 6.3-1.3 8.8-4.2 9.5-9.5z"/></svg>`;
  /* Logo mark: rounded square, one squared corner (top right), rising step line */
  const mark = (cls = '') => `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true"><path d="M9 2h21v21a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7V9a7 7 0 0 1 7-7z" fill="var(--ink)"/><path d="M8 23h5v-5h5v-5h6" fill="none" stroke="var(--bg-canvas)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const logo = () => `<a class="logo" href="#today" aria-label="Zero to Quant home">${mark()}<span>zero <span class="to">to</span> quant</span></a>`;

  /* ---------- Maths (KaTeX) ---------- */
  const tex = (src, display = false) => {
    if (!window.katex) return `<code>${esc(src)}</code>`;
    // MathML output: the browser typesets it natively, so no third-party font or stylesheet is published
    return katex.renderToString(src, { displayMode: display, output: 'mathml', throwOnError: false, strict: 'ignore' });
  };
  /* Renders every [data-tex] element (add data-display for block maths) and $...$ spans inside .md text */
  const mathify = (root = document) => { $$('[data-tex]', root).forEach(el => { el.innerHTML = tex(el.dataset.tex, el.hasAttribute('data-display')); el.removeAttribute('data-tex'); }); };
  /* Inline-maths templating: 'Total is $x+y$' -> HTML with KaTeX */
  const md = (s) => String(s).replace(/\$\$([^$]+)\$\$/g, (_, m) => tex(m, true))
    .replace(/\$([^$]+)\$([.,:;?]?)/g, (_, m, p) => '<span style="white-space:nowrap">' + tex(m, false) + p + '</span>'); // punctuation stays with its formula

  /* ---------- Settings: theme, motion, sound ---------- */
  const settings = {
    theme: store.get('theme', 'system'), motion: store.get('motion', 'system'), sound: store.get('sound', false), haptics: store.get('haptics', true),
  };
  const applySettings = () => {
    const r = document.documentElement;
    if (settings.theme === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', settings.theme);
    if (settings.motion === 'reduced') r.setAttribute('data-motion', 'reduced'); else r.removeAttribute('data-motion');
  };
  const setSetting = (k, v) => { settings[k] = v; store.set(k, v); applySettings(); emit('settings', settings); };
  const reducedMotion = () => settings.motion === 'reduced' || (settings.motion === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Sound: synthesised, off by default ---------- */
  let ac = null;
  const tone = (freq, at, dur, type = 'sine', gain = 0.12) => {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq; o.connect(g); g.connect(ac.destination);
    const t = ac.currentTime + at; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.02);
  };
  const sound = (name) => {
    if (!settings.sound) return;
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
    if (name === 'correct') { tone(659.3, 0, 0.16, 'sine'); tone(659.3, 0, 0.1, 'triangle', 0.05); tone(830.6, 0.09, 0.2, 'sine'); tone(830.6, 0.09, 0.12, 'triangle', 0.05); }
    if (name === 'notyet') { tone(196, 0, 0.12, 'triangle', 0.14); }
    if (name === 'complete') { [523.3, 659.3, 784].forEach((f, i) => tone(f, i * 0.12, 0.3)); }
    if (name === 'streak') { [587.3, 784, 987.8].forEach((f, i) => tone(f, i * 0.08, 0.25, 'sine', 0.09)); }
    if (name === 'tap') { tone(1200, 0, 0.03, 'sine', 0.04); }
  };
  const haptic = (ms = 10) => { if (!settings.haptics) return; try { if (navigator.vibrate) navigator.vibrate(ms); } catch { /* not supported */ } };

  /* ---------- Motion helpers ---------- */
  const countUp = (el, to, ms = 700, from = 0, fmt = (v) => Math.round(v).toLocaleString('en-GB')) => {
    if (reducedMotion()) { el.textContent = fmt(to); return Promise.resolve(); }
    return new Promise(res => {
      let t0 = null;
      const step = (now) => {
        if (t0 === null) t0 = now; // first frame time, so a late first frame never starts mid-count
        const p = Math.max(0, Math.min(1, (now - t0) / ms));
        const e = p < 0.8 ? p / 0.8 * 0.9 : 0.9 + (1 - Math.pow(1 - (p - 0.8) / 0.2, 3)) * 0.1; // linear then ease-out on the last 20%
        el.textContent = fmt(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  };
  /* Square-particle burst from the centre of an element (12 particles, 600ms) */
  const burst = (el, { n = 12, colors = ['var(--pear-400)', 'var(--green-face)', 'var(--s1)', 'var(--s2)'], spread = 90 } = {}) => {
    if (reducedMotion() || !el) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      const a = (i / n) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1), d = spread * (0.7 + (i % 3) * 0.18), s = 6 + (i % 3) * 2;
      Object.assign(p.style, { position: 'fixed', left: r.left + r.width / 2 - s / 2 + 'px', top: r.top + r.height / 2 - s / 2 + 'px', width: s + 'px', height: s + 'px',
        background: colors[i % colors.length], borderRadius: '2px', zIndex: 100, pointerEvents: 'none' });
      document.body.appendChild(p);
      p.animate([{ transform: 'translate(0,0) rotate(0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) rotate(${(i % 2 ? 1 : -1) * 180}deg) scale(0.6)`, opacity: 0 }],
        { duration: 600, easing: 'cubic-bezier(0.05, 0.7, 0.1, 1)' }).onfinish = () => p.remove();
    }
  };
  const wait = (ms) => new Promise(r => setTimeout(r, reducedMotion() ? Math.min(ms, 60) : ms));
  const toast = (html, ms = 2200) => { const t = h(`<div class="toast" role="status">${html}</div>`); document.body.appendChild(t); setTimeout(() => t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).onfinish = () => t.remove(), ms); };

  /* Sheet / modal helper. Returns close(). content: HTML string or element. */
  const sheet = (content, { adaptive = true, modal = false, label = 'Dialog', onClose } = {}) => {
    const scrim = h('<div class="scrim"></div>');
    const box = h(`<div class="${modal ? 'modal' : 'sheet' + (adaptive ? ' adaptive' : '')}" role="dialog" aria-modal="true" aria-label="${esc(label)}"></div>`);
    box.append(typeof content === 'string' ? h(`<div>${content}</div>`) : content);
    box.insertAdjacentHTML('afterbegin', `<button class="icon-btn x" data-close aria-label="Close">${icon('close')}</button>`);
    const prev = document.activeElement;
    const close = () => { document.removeEventListener('keydown', onKey); scrim.remove(); box.remove(); prev && prev.focus && prev.focus(); onClose && onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    scrim.addEventListener('click', close); box.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.append(scrim, box); mathify(box);
    setTimeout(() => (box.querySelector('[autofocus], button:not([data-close]), input') || box).focus?.(), 50);
    return close;
  };

  /* ---------- Events ---------- */
  const listeners = {};
  const on = (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); };
  const emit = (ev, data) => (listeners[ev] || []).forEach(fn => fn(data));

  /* ---------- Shell (header on desktop, floating tab bar on mobile) ---------- */
  const TABS = [['today', 'Today', 'today'], ['learn', 'Learn', 'learn'], ['review', 'Review', 'review'], ['you', 'You', 'you']];
  const shell = (tab) => {
    const L = window.ZQData.learner;
    const wrap = h(`<div class="shell">
      <header class="shell-header"><div class="in">${logo()}
        <nav aria-label="Main">${TABS.slice(0, 3).map(([id, n]) => `<a href="#${id}" ${tab === id ? 'aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
        <div class="right">
          <button class="streak-pill" data-streak aria-label="Streak ${L.streak} days">${L.streak}${bolt(L.todayDone)}<span class="rest-slots">${[0, 1].map(i => `<i class="${i < L.restDays ? 'on' : ''}"></i>`).join('')}</span></button>
          <span class="mp-chip" title="Mastery points">${icon('target', 'sm')} ${L.mp}</span>
          <a class="avatar" href="#you" aria-label="You" ${tab === 'you' ? 'aria-current="page"' : ''}>${L.initial}</a>
        </div></div></header>
      <main class="shell-main" id="main"></main>
      <nav class="tabbar" aria-label="Main">${TABS.map(([id, n, ic]) => `<a href="#${id}" ${tab === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${n}</span></a>`).join('')}</nav>
    </div>`);
    wrap.querySelector('[data-streak]').addEventListener('click', () => streakSheet());
    if ((store.get('you.prefs', {}) || {}).streakMode === 'off') wrap.querySelector('[data-streak]').hidden = true; // streak switched off on You
    return wrap;
  };

  /* Streak sheet (shared): count, rest days, week strip, stats */
  const weekStrip = (week = window.ZQData.learner.week) => {
    const labels = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];
    return `<div class="week">${week.map((s, i) => {
      const lit = s === 'lit' || (s === 'today' && window.ZQData.learner.todayDone);
      const cls = lit ? 'lit' : s === 'rest' ? 'rest' : s === 'missed' ? 'missed' : '';
      const glyph = s === 'rest' ? `<svg viewBox="0 0 24 24"><path d="${P.rest}" style="stroke:var(--pear-600);fill:none"/></svg>` : `<svg viewBox="0 0 24 24"><path d="${BOLT_PATH}"/></svg>`;
      return `<div class="day ${s === 'today' ? 'today' : ''}"><span class="dot ${cls}">${glyph}</span><span>${labels[i]}</span></div>`;
    }).join('')}</div>`;
  };
  const streakSheet = () => {
    const L = window.ZQData.learner;
    sheet(`<div style="display:grid;gap:20px">
      <div style="display:flex;align-items:center;gap:12px;padding-right:48px"><span class="t-stat">${L.streak}</span>${bolt(L.todayDone, 'xl')}<span class="t-h2">day streak</span></div>
      <p class="t-body secondary" style="margin:0">${L.todayDone ? 'Today counts. Come back tomorrow to make it ' + (L.streak + 1) + '.' : 'Finish one lesson or three problems today to keep it going.'}</p>
      ${weekStrip()}
      <div class="card pad" style="display:flex;gap:12px;align-items:center"><span class="rest-slots" style="transform:scale(1.4);transform-origin:left">${[0, 1].map(i => `<i class="${i < L.restDays ? 'on' : ''}"></i>`).join('')}</span>
        <span class="t-body" style="margin-left:12px">${L.restDays} of 2 rest days held. One is earned every 7 days you study. A rest day keeps your streak if you miss a day.</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="card pad"><div class="t-overline muted">Longest streak</div><div class="t-h1 tnum">${L.bestStreak} days</div></div>
        <div class="card pad"><div class="t-overline muted">Lessons complete</div><div class="t-h1 tnum">186</div></div>
      </div></div>`, { label: 'Streak' });
  };

  /* ---------- Screen registry and router ---------- */
  const screens = [];
  const screen = (def) => { screens.push(def); if (booted) route(); };
  let booted = false, cleanup = null;
  const app = () => $('#app');
  const go = (id) => { if (location.hash === '#' + id) route(); else location.hash = id; };
  const route = () => {
    const id = (location.hash || '#today').slice(1) || 'today';
    const def = screens.find(s => s.id === id) || screens.find(s => s.id === 'today') || screens[0];
    if (!def) return;
    if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { console.error(e); } }
    cleanup = null;
    document.querySelectorAll('.scrim, .sheet, .modal, .toast').forEach(n => n.remove());
    const root = app(); root.innerHTML = ''; root.className = 'screen-' + def.id;
    document.title = (def.title ? def.title + ' · ' : '') + 'Zero to Quant';
    let mount = root;
    if (def.shell) { const s = shell(def.tab || def.id); root.append(s); mount = s.querySelector('#main'); }
    try { cleanup = def.render(mount, api) || null; } catch (e) { console.error(e); mount.innerHTML = `<p style="padding:24px">This screen failed to render: ${esc(e.message)}</p>`; }
    mathify(root);
    window.scrollTo(0, 0);
    protoNav.refresh(def.id);
  };

  /* ---------- Prototype navigator (not part of the product) ---------- */
  const protoNav = {
    el: null,
    mount() {
      this.el = h(`<div class="proto">
        <button class="proto-tab" aria-label="Prototype screens" aria-expanded="false">${icon('grid', 'sm')}</button>
        <div class="proto-panel" hidden>
          <div class="proto-head"><b>Prototype</b><span>Zero to Quant mockups, Stage 1</span></div>
          <div class="proto-list"></div>
          <div class="proto-set">
            <label>Theme <select id="proto-theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
            <label>Motion <select id="proto-motion"><option value="system">System</option><option value="full">Full</option><option value="reduced">Reduced</option></select></label>
            <label><input type="checkbox" id="proto-sound"> Sound</label>
          </div>
        </div></div>`);
      document.body.append(this.el);
      const tab = this.el.querySelector('.proto-tab'), panel = this.el.querySelector('.proto-panel');
      tab.addEventListener('click', () => { panel.hidden = !panel.hidden; tab.setAttribute('aria-expanded', String(!panel.hidden)); });
      panel.addEventListener('click', e => { if (e.target.closest('a')) { panel.hidden = true; tab.setAttribute('aria-expanded', 'false'); } });
      const th = this.el.querySelector('#proto-theme'), mo = this.el.querySelector('#proto-motion'), so = this.el.querySelector('#proto-sound');
      th.value = settings.theme; mo.value = settings.motion; so.checked = settings.sound;
      th.onchange = () => setSetting('theme', th.value); mo.onchange = () => setSetting('motion', mo.value); so.onchange = () => { setSetting('sound', so.checked); sound('tap'); };
      on('settings', s => { th.value = s.theme; mo.value = s.motion; so.checked = s.sound; });
    },
    refresh(cur) {
      if (!this.el) return;
      const groups = {};
      screens.filter(s => !s.hidden).forEach(s => (groups[s.group || 'Screens'] = groups[s.group || 'Screens'] || []).push(s));
      this.el.querySelector('.proto-list').innerHTML = Object.entries(groups).map(([g, list]) =>
        `<div class="proto-group"><div class="proto-g">${esc(g)}</div>${list.map(s => `<a href="#${s.id}" ${s.id === cur ? 'aria-current="page"' : ''}>${esc(s.title)}</a>`).join('')}</div>`).join('');
    },
  };

  const api = { $, $$, h, esc, icon, bolt, spark, mark, logo, tex, md, mathify, sound, haptic, countUp, burst, wait, toast, sheet, streakSheet, weekStrip,
    go, on, emit, store, settings, setSetting, reducedMotion, data: () => window.ZQData };
  window.ZQ = { ...api, screen, screens };

  const boot = () => {
    applySettings();
    if (!$('#app')) document.body.prepend(h('<div id="app"></div>'));
    protoNav.mount();
    booted = true;
    window.addEventListener('hashchange', route);
    route();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);
})();
