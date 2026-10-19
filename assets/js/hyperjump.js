// ═══════════════════════════════════════════════════════════════════════════
// HYPERJUMP — random travel between entries
// Loaded on every page by _includes/hyperjump.html.
//
//   window.Hyperjump.go()  → warp animation, then a random entry
//   arriving with ?jump=1  → "HYPERJUMP COMPLETE" banner on top of the entry
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Arrival reveal ──
  // _includes/hyperjump-head.html adds .xjump-arriving to <html> in the <head>,
  // so the page is covered by the warp's dark glow from its very first paint.
  // We lift that cover only once the page has finished loading (fonts too),
  // so the reader never sees it assemble piece by piece.
  const root = document.documentElement;
  if (root.classList.contains('xjump-arriving')) {
    const loaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise(r => window.addEventListener('load', r, { once: true }));
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const cap = new Promise(r => setTimeout(r, 1200));          // never wait longer than this
    Promise.race([Promise.all([loaded, fonts]), cap]).then(() => {
      requestAnimationFrame(() => {
        root.classList.add('xjump-reveal');
        setTimeout(() => root.classList.remove('xjump-arriving', 'xjump-reveal'), 1000);
      });
    });
  }

  const dataEl = document.getElementById('hyperjumpData');
  if (!dataEl) return;
  let DATA;
  try { DATA = JSON.parse(dataEl.textContent); } catch (_) { return; }
  const POSTS = (DATA.posts || []).filter(Boolean);
  const EXPLORE = DATA.explore || '/explore/';
  if (!POSTS.length) return;

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const norm = p => (p || '').replace(/index\.html$/, '').replace(/\/+$/, '') || '/';

  // ── Pick a destination: never the current page, avoid the last 3 jumps ──
  function recent() {
    try { return JSON.parse(sessionStorage.getItem('xjump-recent') || '[]'); } catch (_) { return []; }
  }
  function remember(url) {
    try {
      const r = recent().filter(u => u !== url);
      r.unshift(url);
      sessionStorage.setItem('xjump-recent', JSON.stringify(r.slice(0, 3)));
    } catch (_) { /* storage blocked: no memory, still works */ }
  }
  function pick() {
    const here = norm(location.pathname);
    const pool = POSTS.filter(u => norm(u) !== here);
    if (!pool.length) return null;
    const fresh = pool.filter(u => !recent().includes(u));
    const list = fresh.length ? fresh : pool;
    return list[Math.floor(Math.random() * list.length)];
  }

  // ── Warp overlay ─────────────────────────────────────────────────────────
  // `navigate` is called near the end of the animation; the animation keeps
  // running (dark + glow) until the browser swaps in the new page.
  function warp(navigate) {
    const ov = document.createElement('div');
    ov.className = 'xwarp';
    ov.setAttribute('role', 'status');
    ov.innerHTML =
      '<canvas class="xwarp__canvas" aria-hidden="true"></canvas>' +
      '<p class="xwarp__txt">HYPERJUMP INITIATED<span>locking random coordinates…</span></p>';
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('is-on'));

    if (reduced()) { setTimeout(navigate, 450); return; }

    const cv = ov.querySelector('canvas');
    const ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.scale(dpr, dpr);
    const cx = W / 2, cy = H / 2, R = Math.hypot(cx, cy);

    const stars = [];
    for (let i = 0; i < 420; i++) {
      stars.push({ a: Math.random() * Math.PI * 2, d: 10 + Math.random() * R, s: 0.4 + Math.random() * 0.8, pink: Math.random() < 0.08 });
    }

    const DUR = 1350;
    const t0 = performance.now();
    let finished = false;
    (function frame(now) {
      const t = Math.min(1, (now - t0) / DUR);
      const speed = 0.6 + Math.pow(t, 2.2) * 34;      // slow start, smooth acceleration
      // fade = 1 during the jump, then down to 0 as it settles
      const fade = t < 0.72 ? 1 : Math.max(0, 1 - (t - 0.72) / 0.18);
      // clear the previous frame (fully opaque so old streaks really disappear;
      // clears harder while settling so nothing stays frozen on screen)
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(2, 4, 10, ${0.45 + (1 - fade) * 0.55})`;
      ctx.fillRect(0, 0, W, H);
      ctx.lineCap = 'round';
      ctx.globalAlpha = fade;                          // streaks dim as the jump settles
      stars.forEach(s => {
        const step = speed * s.s * (0.25 + s.d / R);
        s.d += step;
        if (s.d > R) { s.d = 8 + Math.random() * 40; return; }
        // each star is drawn as a streak whose length grows with speed
        const tail = Math.max(1.5, step * 5);
        const d0 = Math.max(0, s.d - tail);
        const cos = Math.cos(s.a), sin = Math.sin(s.a);
        ctx.strokeStyle = s.pink ? 'rgba(255, 42, 160, 0.75)' : `rgba(${160 + 80 * s.s | 0}, 230, 255, ${0.35 + s.s * 0.55})`;
        ctx.lineWidth = 0.6 + (s.d / R) * 1.6;
        ctx.beginPath();
        ctx.moveTo(cx + cos * d0, cy + sin * d0);
        ctx.lineTo(cx + cos * s.d, cy + sin * s.d);
        ctx.stroke();
      });
      if (t > 0.62) ov.classList.add('is-glow');     // soft cyan bloom from the center
      if (t > 0.72) ov.classList.add('is-settle');   // streaks and text fade into the dark
      // Change page only once fully settled: the last frame then looks
      // exactly like the arrival cover, so the switch is invisible.
      if (t >= 0.96 && !finished) { finished = true; navigate(); }
      if (document.body.contains(ov)) requestAnimationFrame(frame);
    })(t0);
  }

  let jumping = false;
  function go() {
    if (jumping) return;
    const url = pick();
    if (!url) return;
    jumping = true;
    remember(url);
    const dest = new URL(url, location.href);
    // Start downloading the destination right away, while the warp plays
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = dest.href;
      document.head.appendChild(link);
    } catch (_) { /* ignore */ }
    dest.searchParams.set('jump', '1');
    warp(() => location.assign(dest.href));
  }

  // Coming back with the browser's Back button: clear the overlay
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    jumping = false;
    document.querySelectorAll('.xwarp').forEach(el => el.remove());
  });

  window.Hyperjump = { go };

  // ── Arrival ──────────────────────────────────────────────────────────────
  let params;
  try { params = new URL(location.href).searchParams; } catch (_) { return; }
  if (params.get('jump') !== '1') return;

  // Remove ?jump=1 so a reload or a shared link doesn't show the banner again
  try {
    const clean = new URL(location.href);
    clean.searchParams.delete('jump');
    history.replaceState(null, '', clean);
  } catch (_) { /* ignore */ }

  const banner = document.createElement('div');
  banner.className = 'xjump-banner';
  banner.setAttribute('role', 'status');
  banner.innerHTML =
    '<div class="xjump-banner__head">' +
      '<span class="xjump-banner__tag" data-text="HYPERJUMP COMPLETE">HYPERJUMP COMPLETE</span>' +
      '<button type="button" class="xjump-banner__close" aria-label="Dismiss">✕</button>' +
    '</div>' +
    '<p class="xjump-banner__msg">Random coordinates locked. You landed on a <b>random entry</b>, picked by the hyperjump drive.</p>' +
    '<div class="xjump-banner__actions">' +
      '<button type="button" class="xjump-banner__btn xjump-banner__btn--main">JUMP AGAIN ⟿</button>' +
      '<a class="xjump-banner__btn" href="' + EXPLORE.replace(/"/g, '&quot;') + '">← BACK TO MAP</a>' +
    '</div>';

  const target = document.querySelector('.page__content') || document.querySelector('main') || document.body;
  target.insertBefore(banner, target.firstChild);

  banner.querySelector('.xjump-banner__btn--main').addEventListener('click', go);
  banner.querySelector('.xjump-banner__close').addEventListener('click', () => {
    banner.classList.add('is-gone');
    setTimeout(() => banner.remove(), reduced() ? 0 : 250);
  });
})();
