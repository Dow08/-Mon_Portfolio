/**
 * Séquence cinématique pilotée par le scroll.
 *
 * - La section .seq est épinglée en CSS (position: sticky), pas par une lib.
 * - progress ∈ [0,1] = position du scroll dans .seq__track.
 * - Si data/sequence.json décrit des frames (assets/sequence/NNN.webp), elles
 *   sont chargées progressivement et dessinées sur le canvas.
 * - Sinon (frames absentes, erreur, économie de données) : rendu procédural
 *   léger — un graphe de nœuds qui se relie au fil du scroll. C'est aussi le
 *   repli garanti : le scroll n'est jamais bloqué par le chargement.
 * - Mobile / reduced-motion : classe .seq--static, tout est affiché empilé.
 */
import { prefersReducedMotion, isSmallScreen, wantsSaveData } from './util/dom.js';

export async function initSequence() {
  const section = document.querySelector('.seq');
  if (!section) return;
  const canvas = section.querySelector('canvas');
  const captions = [...section.querySelectorAll('.seq__caption')];
  const bar = section.querySelector('.seq__progress > span');
  const track = section.querySelector('.seq__track');

  // Mode statique (empilé) ou piloté : réévalué si la fenêtre franchit le
  // point de rupture ou si la préférence de mouvement change (ex. rotation
  // d'une tablette, ou largeur initiale fugace pendant l'ouverture du navigateur).
  let isStatic = false;
  function applyMode() {
    isStatic = prefersReducedMotion() || isSmallScreen();
    section.classList.toggle('seq--static', isStatic);
    captions.forEach((c) => c.classList.toggle('is-active', isStatic));
    progress = isStatic ? 1 : computeProgress();
    update();
  }
  window.matchMedia('(max-width: 768px)').addEventListener('change', applyMode);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', applyMode);

  const ctx = canvas?.getContext('2d', { alpha: false });
  if (!ctx) return;

  // ── Frames (optionnelles) ──────────────────────────────────
  let frames = null; // Array<ImageBitmap|HTMLImageElement|null>
  let manifest = null;
  if (!wantsSaveData()) {
    try {
      const r = await fetch('data/sequence.json', { cache: 'no-cache' });
      if (r.ok) manifest = await r.json();
    } catch { manifest = null; }
  }
  // Manifeste valide = compte raisonnable et chemin de frames à l'intérieur du site
  const manifestOk = manifest && Number.isInteger(manifest.count) && manifest.count > 0 && manifest.count <= 400
    && typeof manifest.pattern === 'string' && /^assets\/sequence\/\{n\}\.(webp|jpg|png)$/.test(manifest.pattern);
  if (manifestOk) {
    frames = new Array(manifest.count).fill(null);
    const load = (i) => {
      if (frames[i] !== null) return;
      frames[i] = false; // en cours
      const img = new Image();
      img.decoding = 'async';
      img.src = manifest.pattern.replace('{n}', String(i + 1).padStart(3, '0'));
      img.onload = () => { frames[i] = img; draw(); };
      img.onerror = () => { frames[i] = null; };
    };
    if (prefersReducedMotion() || isSmallScreen()) {
      // Mode statique : une seule image (la dernière), pas les 72
      load(manifest.count - 1);
    } else {
      // Priorité : première, dernière, puis échantillonnage, puis tout
      load(0); load(manifest.count - 1);
      for (let i = 0; i < manifest.count; i += 8) load(i);
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
      idle(() => { for (let i = 0; i < manifest.count; i++) load(i); });
    }
  }

  // ── Dimensionnement ────────────────────────────────────────
  let width = 0, height = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  // ── Progression ────────────────────────────────────────────
  let progress = 0;
  let ticking = false;
  function computeProgress() {
    if (isStatic) return 1;
    const rect = track.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 1;
    return Math.min(1, Math.max(0, -rect.top / total));
  }
  function onScroll() {
    if (ticking || isStatic) return;
    ticking = true;
    requestAnimationFrame(() => {
      progress = computeProgress();
      update();
      ticking = false;
    });
  }

  function update() {
    if (bar) bar.style.width = `${(progress * 100).toFixed(2)}%`;
    if (!isStatic && captions.length) {
      const idx = Math.min(captions.length - 1, Math.floor(progress * captions.length));
      captions.forEach((c, i) => c.classList.toggle('is-active', i === idx));
    }
    draw();
  }

  // ── Rendu ──────────────────────────────────────────────────
  function draw() {
    if (!width || !height) return;
    if (frames) {
      const idx = Math.round(progress * (frames.length - 1));
      // frame la plus proche déjà chargée
      let best = null;
      for (let d = 0; d < frames.length && !best; d++) {
        best = (frames[idx - d] instanceof Image && frames[idx - d]) || (frames[idx + d] instanceof Image && frames[idx + d]) || null;
      }
      if (best) { drawCover(best); return; }
    }
    drawProcedural(progress);
  }

  // Recadrage « cover » ancré à droite (le sujet des vidéos est centré ; le
  // texte occupe la gauche) : équivalent de object-position: 80% 50%.
  const ANCHOR_X = isStatic ? 0.5 : 0.8;
  function drawCover(img) {
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    ctx.drawImage(img, (width - w) * ANCHOR_X, (height - h) / 2, w, h);
  }

  // Graphe procédural déterministe : N nœuds, arêtes révélées selon progress.
  const NODES = 42;
  const seeded = mulberry32(20261013);
  const nodes = Array.from({ length: NODES }, () => ({
    x: 0.08 + seeded() * 0.84, y: 0.08 + seeded() * 0.84, r: 1.5 + seeded() * 2.5, k: seeded(),
  }));
  const edges = [];
  for (let i = 0; i < NODES; i++) {
    for (let j = i + 1; j < NODES; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      const d = Math.hypot(dx, dy);
      if (d < 0.22) edges.push({ i, j, d, o: seeded() });
    }
  }
  edges.sort((a, b) => a.o - b.o);

  function drawProcedural(p) {
    ctx.fillStyle = '#061716';
    ctx.fillRect(0, 0, width, height);
    // halo
    const g = ctx.createRadialGradient(width * 0.68, height * 0.5, 0, width * 0.68, height * 0.5, Math.max(width, height) * 0.6);
    g.addColorStop(0, 'rgba(184,242,61,0.10)');
    g.addColorStop(1, 'rgba(6,23,22,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    const shown = Math.floor(edges.length * easeOut(p));
    ctx.lineWidth = 1;
    for (let e = 0; e < shown; e++) {
      const { i, j, d } = edges[e];
      const a = nodes[i], b = nodes[j];
      const alpha = 0.08 + (1 - d / 0.22) * 0.25;
      ctx.strokeStyle = `rgba(184,242,61,${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
      ctx.stroke();
    }
    for (const n of nodes) {
      const lit = n.k < easeOut(p);
      ctx.fillStyle = lit ? 'rgba(184,242,61,0.9)' : 'rgba(185,198,195,0.35)';
      ctx.beginPath();
      ctx.arc(n.x * width, n.y * height, lit ? n.r + 0.8 : n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // ── Démarrage ──────────────────────────────────────────────
  resize();
  applyMode();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
