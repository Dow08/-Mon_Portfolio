/**
 * Études de cas : rendues depuis data/cases.json (contenu sourcé dans les
 * README et les métadonnées GitHub, voir docs). Bilingue, re-rendu sur
 * 'langchange'. Aucun HTML brut : tout passe par el()/textContent.
 */
import { el, externalLink, icon } from './util/dom.js';
import { observeReveal } from './reveal.js';
import { currentLang, t } from './i18n.js';

const L = (obj) => (obj && (obj[currentLang()] ?? obj.fr)) ?? '';

export async function initCases() {
  const root = document.getElementById('cases-list');
  if (!root) return;
  let data;
  try {
    const r = await fetch('data/cases.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    data = await r.json();
    if (!Array.isArray(data.cases) || !data.cases.length) throw new Error('vide');
  } catch {
    document.getElementById('etudes')?.setAttribute('hidden', '');
    return;
  }
  const render = () => {
    root.replaceChildren(...data.cases.filter(isValid).map((c, i) => caseBlock(c, i)));
    observeReveal(root);
  };
  render();
  window.addEventListener('langchange', render);
}

function isValid(c) {
  return c && typeof c.id === 'string' && typeof c.url === 'string' && c.url.startsWith('https://github.com/Dow08/')
    && c.title && c.context && c.problem && c.approach && c.results && c.limits;
}

function caseBlock(c, i) {
  const en = currentLang() === 'en';
  const title = (en && c.title_en) || c.title;
  const part = (key, labelFr, labelEn, body) => el('div', { class: 'case__part' }, [
    el('h4', { class: 'case__label mono' }, t(`js.case.${key}`, en ? labelEn : labelFr)),
    body,
  ]);
  const list = (items) => el('ul', { class: 'case__list' }, (items || []).map((s) => el('li', {}, s)));

  return el('article', { class: `case reveal${c.image ? '' : ' case--noimage'}`, id: `cas-${c.id}` }, [
    el('header', { class: 'case__head' }, [
      el('p', { class: 'mono case__kicker' }, [`${String(i + 1).padStart(2, '0')} — `, L(c.kicker)]),
      el('h3', { class: 'case__title' }, title),
      c.tags?.length ? el('div', { class: 'card__tags' }, c.tags.slice(0, 8).map((s) => el('span', { class: 'tag' }, String(s)))) : null,
    ]),
    c.image ? el('figure', { class: 'case__figure' }, [
      el('img', { src: c.image, alt: L(c.image_alt), loading: 'lazy', decoding: 'async', width: '1200', height: '750' }),
      el('figcaption', { class: 'muted' }, L(c.image_alt)),
    ]) : null,
    el('div', { class: 'case__grid' }, [
      part('role', 'Mon rôle', 'My role', el('p', {}, L(c.role))),
      part('context', 'Contexte', 'Context', el('p', {}, L(c.context))),
      part('problem', 'Problème', 'Problem', el('p', {}, L(c.problem))),
      part('approach', 'Démarche', 'Approach', el('p', {}, L(c.approach))),
      part('results', 'Résultats observables', 'Observable results', list(L(c.results))),
      part('limits', 'Limites', 'Limits', list(L(c.limits))),
    ]),
    el('p', { class: 'case__links' }, [
      externalLink(c.url, { class: 'btn btn--ghost btn--sm' }, [t('js.case.repo', en ? 'Open the repository' : 'Ouvrir le dépôt'), ' ', icon('arrow')]),
    ]),
  ]);
}
