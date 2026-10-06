/* Course art: one hero object per course, flat fills in three value steps of the track colour,
   straight facets, rounded outer corners, light three-quarter angle. Drawn in a 160 x 100 box.
   Usage: ZQ.art('die') inside an element that carries data-track (sets --t, --t-deep, --t-lip, --t-soft). */
(function () {
  const L = 'color-mix(in srgb, var(--t) 42%, var(--bg-surface))'; // light face
  const M = 'var(--t)';                                            // mid face
  const D = 'var(--t-lip)';                                        // dark face
  const INK = 'var(--ink)';
  const pipsAt = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };

  const cube = (x, y, s, top = 6, left = 3, right = 5) => {
    // isometric cube with pips on the three visible faces
    const k = s * 0.5, hgt = s * 0.58;
    const T = `M${x},${y - hgt} l${s * 0.87},${k} l${-s * 0.87},${k} l${-s * 0.87},${-k}z`;
    const Lf = `M${x - s * 0.87},${y - hgt + k} l${s * 0.87},${k} v${s} l${-s * 0.87},${-k}z`;
    const Rf = `M${x},${y - hgt + 2 * k} l${s * 0.87},${-k} v${s} l${-s * 0.87},${k}z`;
    const pip = (cx, cy, ax, ay, bx, by, n) => (pipsAt[n] || []).map(([u, v]) => `<ellipse cx="${cx + u * ax * 0.32 + v * bx * 0.32}" cy="${cy + u * ay * 0.32 + v * by * 0.32}" rx="${s * 0.07}" ry="${s * 0.05}" fill="var(--bg-surface)"/>`).join('');
    return `<path d="${Lf}" fill="${M}" stroke="${D}" stroke-width="1.5" stroke-linejoin="round"/><path d="${Rf}" fill="${D}" stroke="${D}" stroke-width="1.5" stroke-linejoin="round"/><path d="${T}" fill="${L}" stroke="${D}" stroke-width="1.5" stroke-linejoin="round"/>`
      + pip(x, y - hgt + k, s * 0.87, k, -s * 0.87, k, top)
      + pip(x - s * 0.435, y - hgt + k * 1.5 + s * 0.5, s * 0.87, k, 0, s, left)
      + pip(x + s * 0.435, y - hgt + k * 1.5 + s * 0.5, s * 0.87, -k, 0, s, right);
  };
  const block = (x, y, w, h, d = 8) => // extruded rounded block, top-left light, side dark
    `<path d="M${x + d},${y - d}h${w}v${h}l${-d},${d}h${-w}z" fill="${D}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${M}"/><path d="M${x},${y + 4}a4 4 0 0 1 4-4h${w - 8}a4 4 0 0 1 4 4v${Math.min(10, h / 3)}h${-w}z" fill="${L}"/>`;

  const art = {
    die: () => cube(68, 62, 34, 5, 3, 6) + cube(116, 70, 26, 2, 4, 1),
    tree: () => {
      const n = [[30, 50], [80, 26], [80, 74], [130, 14], [130, 38], [130, 62], [130, 86]];
      const e = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
      return e.map(([a, b]) => `<path d="M${n[a][0]},${n[a][1]}L${n[b][0]},${n[b][1]}" stroke="${D}" stroke-width="4" stroke-linecap="round"/>`).join('')
        + n.map(([x, y], i) => `<circle cx="${x}" cy="${y + 3}" r="${i ? 9 : 12}" fill="${D}"/><circle cx="${x}" cy="${y}" r="${i ? 9 : 12}" fill="${i === 4 ? M : L}" stroke="${D}" stroke-width="2"/>`).join('');
    },
    bars: () => [22, 46, 70, 52, 30, 16].map((v, i) => block(18 + i * 22, 88 - v, 15, v, 5)).join(''),
    bell: () => `<path d="M10,88 C50,88 58,14 80,14 C102,14 110,88 150,88Z" fill="${L}" stroke="${D}" stroke-width="3" stroke-linejoin="round"/><path d="M80,14 C92,14 98,40 104,62 L104,88 L80,88Z" fill="${M}"/><path d="M10,88H150" stroke="${D}" stroke-width="4" stroke-linecap="round"/>`,
    walk: () => { let y = 60, d = 'M12,60'; const s = [8, -10, 6, 12, -8, -14, 10, -6, -12, 8, 14, -10, -6, 12]; s.forEach((v, i) => { y += v; d += ` L${12 + (i + 1) * 10},${y}`; }); return `<path d="M12,88H150" stroke="${L}" stroke-width="6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${D}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" transform="translate(2,3)"/><path d="${d}" fill="none" stroke="${M}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="152" cy="${y}" r="7" fill="${L}" stroke="${D}" stroke-width="2.5"/>`; },
    matrix: () => Array.from({ length: 9 }, (_, i) => block(38 + (i % 3) * 30, 12 + Math.floor(i / 3) * 27, 24, 21, 4)).join('').replace(/fill="var\(--t\)"/, `fill="${D}"`),
    payoff: () => `<path d="M14,70H82L146,14" fill="none" stroke="${D}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" transform="translate(2,4)"/><path d="M14,70H82L146,14" fill="none" stroke="${M}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14,88H146" stroke="${L}" stroke-width="6" stroke-linecap="round"/><circle cx="82" cy="70" r="8" fill="${L}" stroke="${D}" stroke-width="3"/>`,
    layers: () => [0, 1, 2].map(i => `<path d="M80,${62 - i * 20} l52,-14 l-52,-14 l-52,14z" transform="translate(0,${i ? 0 : 0})" fill="${i === 2 ? L : i === 1 ? M : D}" stroke="${D}" stroke-width="2" stroke-linejoin="round"/>`).reverse().join('') + `<path d="M28,62 v8 l52,14 l52,-14 v-8 l-52,14z" fill="${D}"/>`,
    code: () => `${block(22, 18, 116, 66, 7)}<path d="M50,40 l-12,11 12,11 M110,40 l12,11 -12,11 M88,34 l-16,34" fill="none" stroke="var(--bg-surface)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    terminal: () => `${block(22, 18, 116, 66, 7)}<path d="M40,42 l12,9 -12,9 M62,62 h22" fill="none" stroke="var(--bg-surface)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    table: () => `${block(26, 16, 108, 70, 7)}` + [0, 1, 2, 3].map(r => `<path d="M34,${36 + r * 12}H126" stroke="var(--bg-surface)" stroke-width="3" opacity="${r ? 0.7 : 1}"/>`).join('') + `<path d="M66,30V82M98,30V82" stroke="var(--bg-surface)" stroke-width="3" opacity="0.7"/>`,
    candles: () => [[20, 50, 30, 64, 0], [40, 40, 26, 70, 1], [60, 30, 36, 58, 1], [80, 26, 18, 50, 0], [100, 36, 22, 60, 1], [120, 22, 14, 44, 1], [140, 18, 10, 40, 1]].map(([x, top, hi, lo, up]) => `<path d="M${x + 6},${hi}V${lo + 20}" stroke="${D}" stroke-width="3" stroke-linecap="round"/><rect x="${x}" y="${top}" width="12" height="${lo - top}" rx="3" fill="${up ? M : L}" stroke="${D}" stroke-width="2"/>`).join(''),
    scatter: () => [[26, 74], [38, 66], [48, 70], [58, 56], [70, 58], [80, 46], [92, 48], [102, 36], [114, 38], [126, 26], [136, 30]].map(([x, y], i) => `<circle cx="${x}" cy="${y + 2}" r="6" fill="${D}"/><circle cx="${x}" cy="${y}" r="6" fill="${i % 3 ? L : M}" stroke="${D}" stroke-width="2"/>`).join('') + `<path d="M18,80L146,20" stroke="${D}" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 10"/>`,
    curve: () => `<path d="M14,80 C50,80 60,20 90,30 S130,70 148,18" fill="none" stroke="${D}" stroke-width="8" stroke-linecap="round" transform="translate(2,4)"/><path d="M14,80 C50,80 60,20 90,30 S130,70 148,18" fill="none" stroke="${M}" stroke-width="8" stroke-linecap="round"/>`,
    parabola: () => `<path d="M24,14 Q80,150 136,14" fill="none" stroke="${D}" stroke-width="8" stroke-linecap="round" transform="translate(2,4)"/><path d="M24,14 Q80,150 136,14" fill="none" stroke="${M}" stroke-width="8" stroke-linecap="round"/><circle cx="80" cy="82" r="7" fill="${L}" stroke="${D}" stroke-width="3"/>`,
    balance: () => `<path d="M80,24V82M56,88h48" stroke="${D}" stroke-width="7" stroke-linecap="round"/><path d="M26,34L134,22" stroke="${M}" stroke-width="7" stroke-linecap="round"/>${block(18, 14, 26, 18, 4)}${block(112, 2, 22, 18, 4)}<circle cx="80" cy="28" r="6" fill="${L}" stroke="${D}" stroke-width="2"/>`,
    fraction: () => `${block(36, 12, 88, 30, 6)}<rect x="30" y="50" width="100" height="6" rx="3" fill="${D}"/>${block(36, 64, 88, 26, 6)}`,
    pie: () => `<ellipse cx="80" cy="58" rx="56" ry="30" fill="${D}"/><ellipse cx="80" cy="50" rx="56" ry="30" fill="${L}"/><path d="M80,50 L80,20 A56,30 0 0 1 134,58 Z" fill="${M}"/>`,
    exp: () => `<path d="M14,86 C80,84 110,70 146,10" fill="none" stroke="${D}" stroke-width="8" stroke-linecap="round" transform="translate(2,4)"/><path d="M14,86 C80,84 110,70 146,10" fill="none" stroke="${M}" stroke-width="8" stroke-linecap="round"/>`,
    circle: () => `<circle cx="80" cy="52" r="38" fill="${L}" stroke="${D}" stroke-width="4"/><path d="M80,52 L113,33" stroke="${D}" stroke-width="5" stroke-linecap="round"/><path d="M113,33V52H80" fill="none" stroke="${M}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
    steps: () => [0, 1, 2, 3, 4].map(i => block(16 + i * 26, 70 - i * 13, 22, 18 + i * 13, 5)).join(''),
    grid: () => Array.from({ length: 16 }, (_, i) => `<rect x="${44 + (i % 4) * 19}" y="${12 + Math.floor(i / 4) * 19}" width="15" height="15" rx="3" fill="${[0, 5, 10, 15, 6].includes(i) ? M : L}" stroke="${D}" stroke-width="1.5"/>`).join(''),
    timer: () => `<circle cx="80" cy="56" r="36" fill="${D}"/><circle cx="80" cy="52" r="36" fill="${L}"/><path d="M80,52 L80,24 A28,28 0 0 1 106,62 Z" fill="${M}"/><rect x="70" y="6" width="20" height="9" rx="3" fill="${D}"/>`,
    branch: () => `<path d="M40,88V14M40,66 C40,44 110,52 110,30" fill="none" stroke="${D}" stroke-width="7" stroke-linecap="round"/>` + [[40, 14], [40, 88], [110, 30], [40, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="${L}" stroke="${D}" stroke-width="3"/>`).join(''),
    check: () => `${block(40, 18, 80, 66, 7)}<path d="M60,52 l12,12 26,-26" fill="none" stroke="var(--bg-surface)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
    tangent: () => `<path d="M14,82 C60,82 70,20 146,18" fill="none" stroke="${M}" stroke-width="8" stroke-linecap="round"/><path d="M30,84L132,22" stroke="${D}" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 9"/><circle cx="76" cy="50" r="8" fill="${L}" stroke="${D}" stroke-width="3"/>`,
    area: () => `<path d="M30,88 L30,60 C60,30 90,26 130,40 L130,88Z" fill="${L}"/>` + [0, 1, 2, 3, 4].map(i => `<rect x="${30 + i * 20}" y="${[60, 44, 36, 34, 38][i]}" width="20" height="${88 - [60, 44, 36, 34, 38][i]}" fill="${i % 2 ? M : 'none'}" stroke="${D}" stroke-width="2"/>`).join('') + `<path d="M20,88H140" stroke="${D}" stroke-width="5" stroke-linecap="round"/>`,
    surface: () => `<path d="M20,64 L80,36 L140,64 L80,92Z" fill="${L}" stroke="${D}" stroke-width="2"/><path d="M20,64 C50,30 60,24 80,36 S120,30 140,64" fill="none" stroke="${M}" stroke-width="6" stroke-linecap="round"/><path d="M50,78 C64,50 70,46 80,50 S104,52 110,78" fill="none" stroke="${D}" stroke-width="4" stroke-linecap="round"/>`,
    projection: () => `<path d="M20,80H140" stroke="${D}" stroke-width="6" stroke-linecap="round"/><path d="M30,80L110,20" stroke="${M}" stroke-width="7" stroke-linecap="round"/><path d="M110,20V80" stroke="${D}" stroke-width="3" stroke-dasharray="4 6"/><path d="M30,80H110" stroke="${L}" stroke-width="10" stroke-linecap="round"/>`,
    ellipse: () => `<ellipse cx="80" cy="52" rx="58" ry="26" transform="rotate(-18 80 52)" fill="${L}" stroke="${D}" stroke-width="3"/><path d="M80,52L134,34M80,52L88,76" stroke="${M}" stroke-width="7" stroke-linecap="round"/>`,
    book: () => [[20, 'L', 30], [20, 'L', 44], [20, 'L', 58], [20, 'L', 72], [84, 'R', 30], [84, 'R', 44], [84, 'R', 58], [84, 'R', 72]].map(([x, s, y], i) => `<rect x="${x + (s === 'L' ? 40 - [30, 22, 14, 34][i % 4] : 0)}" y="${y}" width="${[30, 22, 14, 34][i % 4] + 16}" height="10" rx="3" fill="${s === 'L' ? M : L}" stroke="${D}" stroke-width="1.5"/>`).join('') + `<path d="M80,22V88" stroke="${D}" stroke-width="4" stroke-linecap="round"/>`,
    graph: () => { const n = [[30, 30], [76, 18], [126, 34], [50, 76], [104, 80]]; return [[0, 1], [1, 2], [0, 3], [1, 4], [3, 4], [2, 4]].map(([a, b]) => `<path d="M${n[a][0]},${n[a][1]}L${n[b][0]},${n[b][1]}" stroke="${D}" stroke-width="4"/>`).join('') + n.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="11" fill="${i === 1 ? M : L}" stroke="${D}" stroke-width="3"/>`).join(''); },
    folds: () => [0, 1, 2, 3, 4].map(i => `<rect x="${18 + i * 26}" y="22" width="22" height="60" rx="5" fill="${i === 3 ? M : L}" stroke="${D}" stroke-width="2"/>`).join(''),
    vol: () => { let d = 'M12,52'; for (let i = 1; i <= 34; i++) d += ` L${12 + i * 4},${52 + Math.sin(i * 1.7) * (i > 14 && i < 24 ? 26 : 7)}`; return `<path d="${d}" fill="none" stroke="${M}" stroke-width="4" stroke-linejoin="round"/>`; },
    pair: () => `<path d="M12,70 C40,40 60,64 84,40 S124,30 148,20" fill="none" stroke="${M}" stroke-width="6" stroke-linecap="round"/><path d="M12,84 C40,56 60,80 84,58 S124,46 148,36" fill="none" stroke="${D}" stroke-width="6" stroke-linecap="round"/>`,
    tails: () => `<path d="M10,88 C50,88 58,16 80,16 C102,16 110,88 150,88Z" fill="${L}" stroke="${D}" stroke-width="3"/><path d="M10,88 C24,88 32,82 38,72 L38,88Z M150,88 C136,88 128,82 122,72 L122,88Z" fill="${M}"/>`,
  };

  window.ZQArt = (kind, { label = '' } = {}) => {
    const f = art[kind] || art.steps;
    return `<svg class="art" viewBox="0 0 160 100" role="img" aria-label="${label}" preserveAspectRatio="xMidYMid meet">${f()}</svg>`;
  };
  window.ZQArt.kinds = Object.keys(art);
})();
