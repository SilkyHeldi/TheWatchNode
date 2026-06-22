// // ═══════════════════════════════════════════════════════════════════════════════
// // EXPLORE HUB — 3D constellation map
// // ═══════════════════════════════════════════════════════════════════════════════
// (function(){
//   const POSTS = window.EXPLORE_POSTS || [];
//   if (!POSTS.length) {
//     console.warn('[explore-hub] No posts available');
//     return;
//   }

//   // ── SEEDED RNG (so layout is stable across reloads) ─────────────────────────
//   let _s = 137;
//   const rng = () => { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; };
//   const rr  = (a, b) => a + rng() * (b - a);

//   // ── FEATURED NODES — wide X spread + FORCED Y/Z patterns to break planarity
//   // Y alternates high-low-high-low so nodes clearly zigzag in space
//   // Z alternates front-back so size contrast is obvious
//   const Y_PATTERN = [-0.75,  0.65, -0.55,  0.80, -0.70,  0.60, -0.50,  0.75];
//   const Z_PATTERN = [-0.95,  0.85, -0.70,  0.95, -0.85,  0.75, -0.60,  0.90];
//   const N = POSTS.length;
//   const FEAT_NODES = POSTS.map((p, i) => ({
//     x: -1.0 + (N > 1 ? i * (2.0 / (N - 1)) : 0) + rr(-0.04, 0.04),
//     y: (Y_PATTERN[i % Y_PATTERN.length]) + rr(-0.05, 0.05),
//     z: (Z_PATTERN[i % Z_PATTERN.length]) + rr(-0.05, 0.05),
//     featured: true, post: p, idx: i + 1,
//   }));

//   // ── BACKGROUND NODES — fill the whole 3D box ────────────────────────────────
//   const BG_NODES = [];
//   for (let i = 0; i < 150; i++) BG_NODES.push({
//     x: rr(-1.3, 1.3), y: rr(-0.95, 0.95), z: rr(-1.4, 1.4),
//     featured: false, post: null,
//   });

//   const ALL = [...BG_NODES, ...FEAT_NODES];
//   const NF  = BG_NODES.length;

//   // ── EDGES (k-nearest neighbours) ────────────────────────────────────────────
//   function d3(a, b) {
//     const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
//     return Math.sqrt(dx*dx + dy*dy + dz*dz);
//   }
//   const EDGES = [], ES = new Set();
//   ALL.forEach((n, i) => {
//     const k = n.featured ? 7 : 3;
//     ALL.map((_, j) => ({ j, d: d3(n, ALL[j]) }))
//       .filter(e => e.j !== i)
//       .sort((a, b) => a.d - b.d)
//       .slice(0, k)
//       .forEach(({ j }) => {
//         const key = i < j ? `${i}-${j}` : `${j}-${i}`;
//         if (!ES.has(key)) { ES.add(key); EDGES.push([i, j]); }
//       });
//   });

//   // ── TRAJECTORY: featured nodes sorted by X ──────────────────────────────────
//   const FSORTED = [...FEAT_NODES.map((_, i) => NF + i)].sort((a, b) => ALL[a].x - ALL[b].x);
//   const TRAJ = FSORTED.slice(0, -1).map((a, i) => [a, FSORTED[i + 1]]);
//   const TRAJ_SET = new Set(TRAJ.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`));

//   // ── 3D → 2D PROJECTION ──────────────────────────────────────────────────────
//   // Strong X-tilt creates oblique perspective (NMS-style); large Y factor in screen
//   // mapping makes Y variations clearly visible; strong Z impact on scale = depth
//   function project(n, W, H, fy) {
//     let { x, y, z } = n; y += fy;
//     const rx = 0.75, cosX = Math.cos(rx), sinX = Math.sin(rx);
//     const y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX;
//     const rz = -0.10, cosZ = Math.cos(rz), sinZ = Math.sin(rz);
//     const x2 = x * cosZ - y1 * sinZ, y2 = x * sinZ + y1 * cosZ;
//     const fov = 2.0, zOff = 2.8;
//     const sc = fov / (fov + z1 * 0.85 + zOff);
//     return {
//       sx: W * 0.5 + x2 * W * 0.75 * sc,   // wide X spread
//       sy: H * 0.5 + y2 * H * 0.85 * sc,   // ★ much taller Y mapping = visible elevation
//       scale: sc, depth: z1,
//     };
//   }

//   // ── DOM ─────────────────────────────────────────────────────────────────────
//   const canvas  = document.getElementById('netCanvas');
//   const card    = document.getElementById('nodeCard');
//   const cardImg = document.getElementById('cardImg');
//   const cardIdx = document.getElementById('cardIdx');
//   const cardTit = document.getElementById('cardTitle');
//   if (!canvas) return;
//   const ctx = canvas.getContext('2d');

//   const CARD_W = 210, CARD_H = 178;
//   let W = 0, H = 0, t = 0, proj = [], hovIdx = -1;

//   function resize() {
//     const r = canvas.getBoundingClientRect();
//     canvas.width  = r.width  * devicePixelRatio;
//     canvas.height = r.height * devicePixelRatio;
//     W = r.width; H = r.height;
//     ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
//   }

//   // ── DRAW HELPERS ────────────────────────────────────────────────────────────
//   function hexPts(cx, cy, r) {
//     const p = [];
//     for (let i = 0; i < 6; i++) {
//       const a = Math.PI / 3 * i - Math.PI / 6;
//       p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
//     }
//     return p;
//   }
//   function drawHex(cx, cy, r, stroke, fill, alpha, lw) {
//     const p = hexPts(cx, cy, r);
//     ctx.beginPath();
//     ctx.moveTo(p[0][0], p[0][1]);
//     for (let i = 1; i < 6; i++) ctx.lineTo(p[i][0], p[i][1]);
//     ctx.closePath();
//     ctx.globalAlpha = alpha != null ? alpha : 1;
//     if (fill)   { ctx.fillStyle = fill;     ctx.fill();   }
//     if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.4; ctx.stroke(); }
//     ctx.globalAlpha = 1;
//   }

//   function drawDepthFadedDashedLine(pa, pb, baseColor, dashOff) {
//     const STEPS = 12;
//     ctx.save();
//     ctx.setLineDash([8, 6]);
//     ctx.lineDashOffset = dashOff;
//     ctx.lineWidth = 1.4;
//     for (let i = 0; i < STEPS; i++) {
//       const t0 = i / STEPS, t1 = (i + 1) / STEPS;
//       const x0 = pa.sx + (pb.sx - pa.sx) * t0, y0 = pa.sy + (pb.sy - pa.sy) * t0;
//       const x1 = pa.sx + (pb.sx - pa.sx) * t1, y1 = pa.sy + (pb.sy - pa.sy) * t1;
//       const tm = (t0 + t1) / 2;
//       const depthM = pa.depth + (pb.depth - pa.depth) * tm;
//       const bright = Math.max(0, Math.min(1, (depthM + 1.5) / 3));
//       const alpha = 0.15 + bright * 0.75;
//       const blur  = 3 + bright * 8;
//       ctx.strokeStyle = `rgba(${baseColor},${alpha})`;
//       ctx.shadowColor = `rgba(${baseColor},${alpha * 0.8})`;
//       ctx.shadowBlur  = blur;
//       ctx.beginPath();
//       ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
//       ctx.stroke();
//     }
//     ctx.shadowBlur = 0;
//     ctx.setLineDash([]);
//     ctx.restore();
//   }

//   // ── RENDER LOOP ─────────────────────────────────────────────────────────────
//   function frame() {
//     ctx.clearRect(0, 0, W, H);

//     // Subtle vignette
//     const vg = ctx.createRadialGradient(W/2, H/2, H*0.4, W/2, H/2, W*0.7);
//     vg.addColorStop(0, 'rgba(0,0,0,0)');
//     vg.addColorStop(1, 'rgba(0,0,0,0.4)');
//     ctx.fillStyle = vg;
//     ctx.fillRect(0, 0, W, H);

//     const fy = Math.sin(t * 0.00028) * 0.014;
//     proj = ALL.map(n => project(n, W, H, fy));
//     const order = ALL.map((_, i) => i).sort((a, b) => proj[b].depth - proj[a].depth);

//     // BG edges
//     EDGES.forEach(([a, b]) => {
//       const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
//       if (TRAJ_SET.has(key)) return;
//       const pa = proj[a], pb = proj[b];
//       const bright = Math.max(0, Math.min(1, ((pa.depth + pb.depth) / 2 + 2) / 4));
//       const isFeat = ALL[a].featured || ALL[b].featured;
//       ctx.beginPath();
//       ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy);
//       ctx.strokeStyle = isFeat
//         ? `rgba(0,210,255,${0.08 + bright * 0.14})`
//         : `rgba(60,110,200,${0.04 + bright * 0.10})`;
//       ctx.lineWidth = 0.35 + bright * 0.45;
//       ctx.stroke();
//     });

//     // Trajectory (depth-faded)
//     const dashOff = -t * 0.05;
//     TRAJ.forEach(([a, b]) => drawDepthFadedDashedLine(proj[a], proj[b], '0,229,255', dashOff));

//     // Hover connector
//     if (hovIdx >= 0) {
//       const p = proj[hovIdx];
//       const hexR = Math.max(9, 14 * p.scale);
//       const goLeft = p.sx > W * 0.55;
//       const lineEndX = goLeft ? p.sx - hexR - 8 : p.sx + hexR + 8;
//       const cardX = goLeft ? p.sx - hexR - 20 - CARD_W : p.sx + hexR + 20;
//       const midX = goLeft ? cardX + CARD_W + 8 : cardX - 8;
//       ctx.save();
//       ctx.beginPath();
//       ctx.moveTo(lineEndX, p.sy);
//       ctx.lineTo(midX, p.sy);
//       ctx.strokeStyle = 'rgba(0,229,255,0.9)';
//       ctx.lineWidth = 1;
//       ctx.shadowColor = '#00e5ff';
//       ctx.shadowBlur = 6;
//       ctx.stroke();
//       // Diamond junction
//       ctx.save();
//       ctx.translate(lineEndX, p.sy);
//       ctx.rotate(Math.PI / 4);
//       ctx.fillStyle = '#00e5ff';
//       ctx.fillRect(-3, -3, 6, 6);
//       ctx.restore();
//       ctx.shadowBlur = 0;
//       ctx.restore();

//       // Position card
//       let cy = p.sy - CARD_H / 2;
//       cy = Math.max(4, Math.min(cy, H - CARD_H - 4));
//       let cx = cardX;
//       cx = Math.max(4, Math.min(cx, W - CARD_W - 4));
//       card.style.left = cx + 'px';
//       card.style.top  = cy + 'px';
//     }

//     // Nodes
//     order.forEach(i => {
//       const n = ALL[i], p = proj[i];
//       const bright = Math.max(0, Math.min(1, (p.depth + 2) / 4));

//       if (n.featured) {
//         const r = Math.max(9, 14 * p.scale);
//         const isHov = i === hovIdx;
//         const featBright = 0.25 + bright * 0.75;

//         // Outer pulse
//         ctx.save();
//         ctx.shadowColor = '#00e5ff';
//         ctx.shadowBlur = (isHov ? 28 : 14) * featBright;
//         const pr = r * (1.4 + 0.14 * Math.sin(t * 0.0025 + i));
//         ctx.globalAlpha = (0.12 + 0.08 * Math.sin(t * 0.0025 + i)) * featBright;
//         drawHex(p.sx, p.sy, pr, '#00e5ff', null);
//         ctx.globalAlpha = 1;
//         ctx.restore();

//         // Hex body — translucent
//         const strokeAlpha = 0.35 + featBright * 0.6;
//         const lw = 0.8 + featBright * 0.8;
//         const fillAlpha = 0.15 + featBright * 0.25;
//         drawHex(
//           p.sx, p.sy, r,
//           `rgba(0,229,255,${strokeAlpha})`,
//           isHov ? `rgba(0,30,55,${fillAlpha + 0.3})` : `rgba(3,15,30,${fillAlpha})`,
//           1, lw
//         );

//         // White centre
//         ctx.beginPath();
//         ctx.arc(p.sx, p.sy, 2.2, 0, Math.PI * 2);
//         ctx.fillStyle = '#ffffff';
//         ctx.globalAlpha = 0.75 * featBright;
//         ctx.fill();
//         ctx.globalAlpha = 1;

//         // Number
//         ctx.fillStyle = `rgba(0,229,255,${0.7 + featBright * 0.3})`;
//         ctx.font = `bold ${Math.max(6, 9 * p.scale)}px 'Courier New', monospace`;
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
//         ctx.globalAlpha = featBright;
//         ctx.fillText(String(n.idx).padStart(2, '0'), p.sx, p.sy + 0.5);
//         ctx.globalAlpha = 1;

//         // Tag label
//         if (p.scale > 0.5) {
//           ctx.fillStyle = isHov ? '#ffffff' : `rgba(0,229,255,${0.6 * featBright})`;
//           ctx.font = `${Math.max(6, 7 * p.scale)}px 'Courier New', monospace`;
//           ctx.fillText(n.post.tag, p.sx, p.sy + r + 10 * p.scale);
//         }
//       } else {
//         const r = Math.max(0.8, (1.2 + bright * 3.5) * p.scale);
//         ctx.beginPath();
//         ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
//         const alpha = 0.15 + bright * 0.75;
//         ctx.fillStyle = bright > 0.6
//           ? `rgba(180,210,255,${alpha})`
//           : `rgba(80,120,200,${alpha * 0.6})`;
//         if (bright > 0.7) {
//           ctx.shadowColor = 'rgba(180,220,255,0.8)';
//           ctx.shadowBlur = bright * 8;
//         }
//         ctx.fill();
//         ctx.shadowBlur = 0;
//       }
//     });

//     t++;
//     requestAnimationFrame(frame);
//   }

//   // ── HIT TEST ────────────────────────────────────────────────────────────────
//   function getHit(mx, my) {
//     let best = -1, bestD = Infinity;
//     ALL.forEach((n, i) => {
//       if (!n.featured) return;
//       const p = proj[i];
//       const r = Math.max(9, 14 * p.scale) + 10;
//       const d = Math.hypot(mx - p.sx, my - p.sy);
//       if (d < r && d < bestD) { bestD = d; best = i; }
//     });
//     return best;
//   }

//   canvas.addEventListener('mousemove', e => {
//     const r = canvas.getBoundingClientRect();
//     const hit = getHit(e.clientX - r.left, e.clientY - r.top);
//     canvas.style.cursor = hit >= 0 ? 'pointer' : 'crosshair';
//     if (hit >= 0) {
//       if (hit !== hovIdx) {
//         hovIdx = hit;
//         const n = ALL[hit];
//         cardImg.src = n.post.img;
//         cardIdx.textContent = `NODE_${String(n.idx).padStart(2, '0')} // ${n.post.tag}`;
//         cardTit.textContent = n.post.title;
//         card.classList.add('visible');
//       }
//     } else {
//       hovIdx = -1;
//       card.classList.remove('visible');
//     }
//   });

//   canvas.addEventListener('click', e => {
//     const r = canvas.getBoundingClientRect();
//     const hit = getHit(e.clientX - r.left, e.clientY - r.top);
//     if (hit >= 0 && ALL[hit].post.url) window.location.href = ALL[hit].post.url;
//   });

//   canvas.addEventListener('mouseleave', () => {
//     hovIdx = -1;
//     card.classList.remove('visible');
//   });

//   // ── TAG CLOUD WEIGHTING ─────────────────────────────────────────────────────
//   const pills = document.querySelectorAll('.tag-pill');
//   if (pills.length) {
//     const counts = Array.from(pills).map(p => parseInt(p.dataset.count) || 1);
//     const maxC = Math.max(...counts, 1);
//     pills.forEach(p => {
//       const c = parseInt(p.dataset.count) || 1;
//       const ratio = c / maxC;
//       p.style.fontSize = (0.6 + ratio * 0.45) + 'rem';
//       p.style.opacity  = 0.55 + ratio * 0.45;
//     });
//   }

//   // ── INIT ────────────────────────────────────────────────────────────────────
//   window.addEventListener('resize', resize);
//   resize();
//   frame();
// })();

// ═══════════════════════════════════════════════════════════════════════════════
// EXPLORE HUB — 3D constellation map
// ═══════════════════════════════════════════════════════════════════════════════
(function(){
  const POSTS = window.EXPLORE_POSTS || [];
  if (!POSTS.length) {
    console.warn('[explore-hub] No posts available');
    return;
  }

  // ── SEEDED RNG (so layout is stable across reloads) ─────────────────────────
  let _s = 119;
  const rng = () => { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; };
  const rr  = (a, b) => a + rng() * (b - a);

  // ── FEATURED NODES — wide X spread + FORCED Y/Z patterns to break planarity
  // Y alternates very high-very low to ensure visible zigzag at any canvas height
  // Z alternates front-back so size contrast is obvious
  // FIXME : modify article nodes positions
  const Y_PATTERN = [-1.20,  1.05, -0.90,  1.25, -1.10,  0.95, -0.85,  1.15];
  const Z_PATTERN = [-0.95,  0.85, -0.70,  0.95, -0.85,  0.75, -0.60,  0.90];
  const N = POSTS.length;
  const FEAT_NODES = POSTS.map((p, i) => ({
    x: -1.0 + (N > 1 ? i * (2.0 / (N - 1)) : 0) + rr(-0.04, 0.04), // FIXME : jitter for more randomness
    y: (Y_PATTERN[i % Y_PATTERN.length]) + rr(-0.05, 0.05),
    z: (Z_PATTERN[i % Z_PATTERN.length]) + rr(-0.05, 0.05),
    featured: true, post: p, idx: i + 1,
  }));

  // ── BACKGROUND NODES — fill the whole 3D box ────────────────────────────────
  const BG_NODES = [];
  for (let i = 0; i < 150; i++) BG_NODES.push({
    x: rr(-1.3, 1.3), y: rr(-0.95, 0.95), z: rr(-1.4, 1.4),
    featured: false, post: null,
  });

  const ALL = [...BG_NODES, ...FEAT_NODES];
  const NF  = BG_NODES.length;

  // ── EDGES (k-nearest neighbours) ────────────────────────────────────────────
  function d3(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }
  const EDGES = [], ES = new Set();
  ALL.forEach((n, i) => {
    const k = n.featured ? 7 : 3;
    ALL.map((_, j) => ({ j, d: d3(n, ALL[j]) }))
      .filter(e => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, k)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!ES.has(key)) { ES.add(key); EDGES.push([i, j]); }
      });
  });

  // ── TRAJECTORY: featured nodes sorted by X ──────────────────────────────────
  const FSORTED = [...FEAT_NODES.map((_, i) => NF + i)].sort((a, b) => ALL[a].x - ALL[b].x);
  const TRAJ = FSORTED.slice(0, -1).map((a, i) => [a, FSORTED[i + 1]]);
  const TRAJ_SET = new Set(TRAJ.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`));

  // ── 3D → 2D PROJECTION ──────────────────────────────────────────────────────
  // Strong X-tilt for oblique perspective. The Y SCREEN factor is what actually
  // controls how much vertical space the zigzag occupies — it must be large
  // enough that Y variations are visible against the wide canvas.
  function project(n, W, H, fy) {
    let { x, y, z } = n; y += fy;
    const rx = 0.75, cosX = Math.cos(rx), sinX = Math.sin(rx);
    const y1 = y * cosX - z * sinX, z1 = y * sinX + z * cosX;
    const rz = -0.10, cosZ = Math.cos(rz), sinZ = Math.sin(rz);
    const x2 = x * cosZ - y1 * sinZ, y2 = x * sinZ + y1 * cosZ;
    const fov = 2.0, zOff = 2.8;
    const sc = fov / (fov + z1 * 0.85 + zOff);
    return {
      sx: W * 0.5 + x2 * W * 0.72 * sc,
      sy: H * 0.5 + y2 * H * 0.95 * sc, // FIXME : modify for 3D height
      scale: sc, depth: z1,
    };
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────
  const canvas  = document.getElementById('netCanvas');
  const card    = document.getElementById('nodeCard');
  const cardImg = document.getElementById('cardImg');
  const cardIdx = document.getElementById('cardIdx');
  const cardTit = document.getElementById('cardTitle');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CARD_W = 280, CARD_H = 248;
  let W = 0, H = 0, t = 0, proj = [], hovIdx = -1;

  function resize() {
    const r = canvas.getBoundingClientRect();
    canvas.width  = r.width  * devicePixelRatio;
    canvas.height = r.height * devicePixelRatio;
    W = r.width; H = r.height;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }

  // ── DRAW HELPERS ────────────────────────────────────────────────────────────
  function hexPts(cx, cy, r) {
    const p = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 3 * i - Math.PI / 6;
      p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return p;
  }
  function drawHex(cx, cy, r, stroke, fill, alpha, lw) {
    const p = hexPts(cx, cy, r);
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < 6; i++) ctx.lineTo(p[i][0], p[i][1]);
    ctx.closePath();
    ctx.globalAlpha = alpha != null ? alpha : 1;
    if (fill)   { ctx.fillStyle = fill;     ctx.fill();   }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1.4; ctx.stroke(); }
    ctx.globalAlpha = 1;
  }

  function drawDepthFadedDashedLine(pa, pb, baseColor, dashOff) {
    const STEPS = 12;
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = dashOff;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < STEPS; i++) {
      const t0 = i / STEPS, t1 = (i + 1) / STEPS;
      const x0 = pa.sx + (pb.sx - pa.sx) * t0, y0 = pa.sy + (pb.sy - pa.sy) * t0;
      const x1 = pa.sx + (pb.sx - pa.sx) * t1, y1 = pa.sy + (pb.sy - pa.sy) * t1;
      const tm = (t0 + t1) / 2;
      const depthM = pa.depth + (pb.depth - pa.depth) * tm;
      const bright = Math.max(0, Math.min(1, (depthM + 1.5) / 3));
      const alpha = 0.15 + bright * 0.75;
      const blur  = 3 + bright * 8;
      ctx.strokeStyle = `rgba(${baseColor},${alpha})`;
      ctx.shadowColor = `rgba(${baseColor},${alpha * 0.8})`;
      ctx.shadowBlur  = blur;
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);
    ctx.restore();
  }

  // ── RENDER LOOP ─────────────────────────────────────────────────────────────
  function frame() {
    ctx.clearRect(0, 0, W, H);

    // Subtle vignette
    const vg = ctx.createRadialGradient(W/2, H/2, H*0.4, W/2, H/2, W*0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    const fy = Math.sin(t * 0.00028) * 0.014;
    proj = ALL.map(n => project(n, W, H, fy));
    const order = ALL.map((_, i) => i).sort((a, b) => proj[b].depth - proj[a].depth);

    // BG edges
    EDGES.forEach(([a, b]) => {
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (TRAJ_SET.has(key)) return;
      const pa = proj[a], pb = proj[b];
      const bright = Math.max(0, Math.min(1, ((pa.depth + pb.depth) / 2 + 2) / 4));
      const isFeat = ALL[a].featured || ALL[b].featured;
      ctx.beginPath();
      ctx.moveTo(pa.sx, pa.sy); ctx.lineTo(pb.sx, pb.sy);
      ctx.strokeStyle = isFeat
        ? `rgba(0,210,255,${0.08 + bright * 0.14})`
        : `rgba(60,110,200,${0.04 + bright * 0.10})`;
      ctx.lineWidth = 0.35 + bright * 0.45;
      ctx.stroke();
    });

    // Trajectory (depth-faded)
    const dashOff = -t * 0.05;
    TRAJ.forEach(([a, b]) => drawDepthFadedDashedLine(proj[a], proj[b], '0,229,255', dashOff));

    // Hover connector
    if (hovIdx >= 0) {
      const p = proj[hovIdx];
      const hexR = Math.max(9, 14 * p.scale);
      const goLeft = p.sx > W * 0.55;
      const lineEndX = goLeft ? p.sx - hexR - 8 : p.sx + hexR + 8;
      const cardX = goLeft ? p.sx - hexR - 20 - CARD_W : p.sx + hexR + 20;
      const midX = goLeft ? cardX + CARD_W + 8 : cardX - 8;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lineEndX, p.sy);
      ctx.lineTo(midX, p.sy);
      ctx.strokeStyle = 'rgba(0,229,255,0.9)';
      ctx.lineWidth = 1;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 6;
      ctx.stroke();
      // Diamond junction
      ctx.save();
      ctx.translate(lineEndX, p.sy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Position card
      let cy = p.sy - CARD_H / 2;
      cy = Math.max(4, Math.min(cy, H - CARD_H - 4));
      let cx = cardX;
      cx = Math.max(4, Math.min(cx, W - CARD_W - 4));
      card.style.left = cx + 'px';
      card.style.top  = cy + 'px';
    }

    // Nodes
    order.forEach(i => {
      const n = ALL[i], p = proj[i];
      const bright = Math.max(0, Math.min(1, (p.depth + 2) / 4));

      if (n.featured) {
        const r = Math.max(9, 14 * p.scale);
        const isHov = i === hovIdx;
        const featBright = 0.25 + bright * 0.75;

        // Outer pulse
        ctx.save();
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = (isHov ? 28 : 14) * featBright;
        const pr = r * (1.4 + 0.14 * Math.sin(t * 0.0025 + i));
        ctx.globalAlpha = (0.12 + 0.08 * Math.sin(t * 0.0025 + i)) * featBright;
        drawHex(p.sx, p.sy, pr, '#00e5ff', null);
        ctx.globalAlpha = 1;
        ctx.restore();

        // Hex body — translucent
        const strokeAlpha = 0.35 + featBright * 0.6;
        const lw = 0.8 + featBright * 0.8;
        const fillAlpha = 0.15 + featBright * 0.25;
        drawHex(
          p.sx, p.sy, r,
          `rgba(0,229,255,${strokeAlpha})`,
          isHov ? `rgba(0,30,55,${fillAlpha + 0.3})` : `rgba(3,15,30,${fillAlpha})`,
          1, lw
        );

        // White centre
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.75 * featBright;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Number
        ctx.fillStyle = `rgba(0,229,255,${0.7 + featBright * 0.3})`;
        ctx.font = `bold ${Math.max(6, 9 * p.scale)}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = featBright;
        ctx.fillText(String(n.idx).padStart(2, '0'), p.sx, p.sy + 0.5);
        ctx.globalAlpha = 1;

        // Tag label
        if (p.scale > 0.5) {
          ctx.fillStyle = isHov ? '#ffffff' : `rgba(0,229,255,${0.6 * featBright})`;
          ctx.font = `${Math.max(6, 7 * p.scale)}px 'Courier New', monospace`;
          ctx.fillText(n.post.tag, p.sx, p.sy + r + 10 * p.scale);
        }
      } else {
        const r = Math.max(0.8, (1.2 + bright * 3.5) * p.scale);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        const alpha = 0.15 + bright * 0.75;
        ctx.fillStyle = bright > 0.6
          ? `rgba(180,210,255,${alpha})`
          : `rgba(80,120,200,${alpha * 0.6})`;
        if (bright > 0.7) {
          ctx.shadowColor = 'rgba(180,220,255,0.8)';
          ctx.shadowBlur = bright * 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    t++;
    requestAnimationFrame(frame);
  }

  // ── HIT TEST ────────────────────────────────────────────────────────────────
  function getHit(mx, my) {
    let best = -1, bestD = Infinity;
    ALL.forEach((n, i) => {
      if (!n.featured) return;
      const p = proj[i];
      const r = Math.max(9, 14 * p.scale) + 10;
      const d = Math.hypot(mx - p.sx, my - p.sy);
      if (d < r && d < bestD) { bestD = d; best = i; }
    });
    return best;
  }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    const hit = getHit(e.clientX - r.left, e.clientY - r.top);
    canvas.style.cursor = hit >= 0 ? 'pointer' : 'crosshair';
    if (hit >= 0) {
      if (hit !== hovIdx) {
        hovIdx = hit;
        const n = ALL[hit];
        cardImg.src = n.post.img;
        cardIdx.textContent = `NODE_${String(n.idx).padStart(2, '0')} // ${n.post.tag}`;
        cardTit.textContent = n.post.title;
        card.classList.add('visible');
      }
    } else {
      hovIdx = -1;
      card.classList.remove('visible');
    }
  });

  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const hit = getHit(e.clientX - r.left, e.clientY - r.top);
    if (hit >= 0 && ALL[hit].post.url) window.location.href = ALL[hit].post.url;
  });

  canvas.addEventListener('mouseleave', () => {
    hovIdx = -1;
    card.classList.remove('visible');
  });

  // ── TAG CLOUD WEIGHTING ─────────────────────────────────────────────────────
  const pills = document.querySelectorAll('.tag-pill');
  if (pills.length) {
    const counts = Array.from(pills).map(p => parseInt(p.dataset.count) || 1);
    const maxC = Math.max(...counts, 1);
    pills.forEach(p => {
      const c = parseInt(p.dataset.count) || 1;
      const ratio = c / maxC;
      p.style.fontSize = (0.6 + ratio * 0.45) + 'rem';
      p.style.opacity  = 0.55 + ratio * 0.45;
    });
  }

  // ── INIT ────────────────────────────────────────────────────────────────────
  window.addEventListener('resize', resize);
  resize();
  frame();
})();