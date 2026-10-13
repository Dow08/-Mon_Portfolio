/**
 * Projets : lit data/projects.json (généré par scripts/build_projects.py),
 * rend les filtres et les cartes sans innerHTML, met à jour les compteurs.
 */
import { el, externalLink, icon } from './util/dom.js';
import { observeReveal } from './reveal.js';

const STATUS_LABEL = {
  lab: 'Lab de formation',
  perso: 'Projet personnel',
  vitrine: 'Vitrine (code privé)',
  formation: 'Formation',
  pause: 'En pause',
};

export async function initProjects() {
  const grid = document.getElementById('projects-grid');
  const chips = document.getElementById('projects-filters');
  if (!grid) return;

  let data;
  try {
    const r = await fetch('data/projects.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    data = await r.json();
    if (!Array.isArray(data.projects) || !data.projects.length) throw new Error('liste vide');
  } catch (err) {
    grid.replaceChildren(el('p', { class: 'notice' }, [
      'La liste des projets n’a pas pu être chargée. ',
      externalLink('https://github.com/Dow08', {}, 'Voir les dépôts sur GitHub'), '.',
    ]));
    return;
  }

  const projects = data.projects.filter(isValid);
  const groups = data.groups || {};

  // Compteurs globaux (hero, référentiels)
  setText('count-projects', projects.length);
  setText('count-repos', data.repo_count);
  renderReferentials(data.referentials);

  // Filtres
  if (chips) {
    const counts = projects.reduce((acc, p) => (acc[p.group] = (acc[p.group] || 0) + 1, acc), {});
    const order = ['*', ...Object.keys(groups).filter((g) => counts[g])];
    chips.replaceChildren(...order.map((key) => el('button', {
      class: 'chip', type: 'button', 'aria-pressed': key === '*' ? 'true' : 'false', dataset: { group: key },
    }, [key === '*' ? 'Tous' : groups[key], el('span', { class: 'chip__count' }, String(key === '*' ? projects.length : counts[key]))])));
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      const key = chip.dataset.group;
      render(key === '*' ? projects : projects.filter((p) => p.group === key), true);
    });
  }

  render(projects, false);

  function render(list, immediate) {
    grid.replaceChildren(...list.map((p, i) => card(p, i)));
    if (immediate) grid.querySelectorAll('.reveal').forEach((n) => n.classList.add('is-visible'));
    else observeReveal(grid);
    grid.setAttribute('aria-busy', 'false');
  }
}

function isValid(p) {
  return p && typeof p.title === 'string' && p.title.length <= 120
    && typeof p.url === 'string' && p.url.startsWith('https://github.com/')
    && typeof p.description === 'string' && Array.isArray(p.stack);
}

function card(p, index) {
  const num = String(index + 1).padStart(2, '0');
  return el('article', { class: `card reveal${p.featured ? ' card--featured' : ''}`, dataset: { delay: String(Math.min(index % 3, 3)) } }, [
    el('div', { class: 'card__thumb', 'aria-hidden': 'true' }, thumb(p.id)),
    el('div', { class: 'card__body' }, [
      el('div', { class: 'card__kicker mono' }, [el('span', {}, `${num} — ${p.group_label || ''}`), p.featured ? el('span', {}, '★ À la une') : null]),
      el('h3', { class: 'card__title' }, externalLink(p.url, {}, p.title)),
      el('p', { class: 'card__desc' }, p.description),
      p.stack.length ? el('div', { class: 'card__tags' }, p.stack.slice(0, 4).map((t) => el('span', { class: 'tag' }, String(t).slice(0, 32)))) : null,
    ]),
    el('div', { class: 'card__foot' }, [
      el('span', { class: `badge badge--${p.status || 'perso'}` }, STATUS_LABEL[p.status] || 'Projet'),
      icon('github'),
    ]),
  ]);
}

/** Vignette déterministe : motif de points dérivé de l'identifiant (aucune image à maintenir). */
function thumb(id) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 160 90');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  let h = 2166136261;
  for (const ch of id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  for (let y = 10; y < 90; y += 10) {
    for (let x = 10; x < 160; x += 10) {
      const v = rnd();
      if (v < 0.55) continue;
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y);
      c.setAttribute('r', v > 0.9 ? 2.6 : 1.4);
      c.setAttribute('fill', v > 0.9 ? 'var(--accent-text)' : 'var(--line-strong)');
      svg.append(c);
    }
  }
  return svg;
}

function renderReferentials(refs) {
  const list = document.getElementById('referentials');
  if (!list || !refs) return;
  const items = Object.entries(refs).sort((a, b) => b[1] - a[1]);
  list.replaceChildren(...items.map(([name, n]) => el('li', {}, [name, el('span', {}, `${n} projet${n > 1 ? 's' : ''}`)])));
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node && value !== undefined && value !== null) node.textContent = String(value);
}
