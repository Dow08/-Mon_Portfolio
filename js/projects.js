/**
 * Projets : lit data/projects.json (généré par scripts/build_projects.py),
 * rend les filtres et les cartes sans innerHTML, met à jour les compteurs.
 * Re-rend à chaque changement de langue (événement 'langchange').
 */
import { el, externalLink, icon } from './util/dom.js';
import { observeReveal } from './reveal.js';
import { t } from './i18n.js';

const STATUS_FR = {
  lab: 'Lab de formation',
  perso: 'Projet personnel',
  vitrine: 'Vitrine (code privé)',
  formation: 'Formation',
  pause: 'En pause',
};
const statusLabel = (s) => t(`js.status.${s}`, STATUS_FR[s] || t('js.status.default', 'Projet'));
const groupLabel = (p) => t(`js.group.${p.group}`, p.group_label || p.group);

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
  } catch {
    grid.replaceChildren(el('p', { class: 'notice' }, [
      t('js.projects.error', 'La liste des projets n’a pas pu être chargée. '),
      externalLink('https://github.com/Dow08', {}, t('js.projects.github', 'Voir les dépôts sur GitHub')), '.',
    ]));
    return;
  }

  const projects = data.projects.filter(isValid);
  const groups = data.groups || {};
  let currentGroup = '*';

  setText('count-projects', projects.length);
  setText('count-repos', data.repo_count);

  function renderFilters() {
    if (!chips) return;
    const counts = projects.reduce((acc, p) => (acc[p.group] = (acc[p.group] || 0) + 1, acc), {});
    const order = ['*', ...Object.keys(groups).filter((g) => counts[g])];
    chips.replaceChildren(...order.map((key) => el('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(key === currentGroup), dataset: { group: key },
    }, [key === '*' ? t('js.all', 'Tous') : t(`js.group.${key}`, groups[key]),
      el('span', { class: 'chip__count' }, String(key === '*' ? projects.length : counts[key]))])));
  }

  if (chips) {
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      currentGroup = chip.dataset.group;
      chips.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      renderCards(true);
    });
  }

  function renderCards(immediate) {
    const list = currentGroup === '*' ? projects : projects.filter((p) => p.group === currentGroup);
    grid.replaceChildren(...list.map((p, i) => card(p, i)));
    if (immediate) grid.querySelectorAll('.reveal').forEach((n) => n.classList.add('is-visible'));
    else observeReveal(grid);
    grid.setAttribute('aria-busy', 'false');
  }

  function renderAll(immediate) {
    renderFilters();
    renderCards(immediate);
    renderReferentials(data.referentials);
  }

  renderAll(false);
  window.addEventListener('langchange', () => renderAll(true));
}

function isValid(p) {
  return p && typeof p.title === 'string' && p.title.length <= 120
    && typeof p.url === 'string' && p.url.startsWith('https://github.com/')
    && typeof p.description === 'string' && Array.isArray(p.stack);
}

function card(p, index) {
  const num = String(index + 1).padStart(2, '0');
  return el('article', { class: `card reveal${p.featured ? ' card--featured' : ''}`, dataset: { delay: String(Math.min(index % 3, 3)) }, lang: 'fr' }, [
    el('div', { class: 'card__thumb', 'aria-hidden': 'true' }, thumb(p.id)),
    el('div', { class: 'card__body' }, [
      el('div', { class: 'card__kicker mono' }, [el('span', {}, `${num} — ${groupLabel(p)}`), p.featured ? el('span', {}, t('js.featured', '★ À la une')) : null]),
      el('h3', { class: 'card__title' }, externalLink(p.url, {}, p.title)),
      el('p', { class: 'card__desc' }, p.description),
      p.stack.length ? el('div', { class: 'card__tags' }, p.stack.slice(0, 4).map((s) => el('span', { class: 'tag' }, String(s).slice(0, 32)))) : null,
    ]),
    el('div', { class: 'card__foot' }, [
      el('span', { class: `badge badge--${p.status || 'perso'}` }, statusLabel(p.status || 'perso')),
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
  list.replaceChildren(...items.map(([name, n]) => el('li', {}, [name,
    el('span', {}, `${n} ${n > 1 ? t('js.pulse.projects', 'projets') : t('js.pulse.project', 'projet')}`)])));
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node && value !== undefined && value !== null) node.textContent = String(value);
}
