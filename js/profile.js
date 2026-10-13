/**
 * Compétences et formation, rendues depuis data/profile.json (contenu validé).
 * Textes FR/EN portés par les données ; re-rendu sur 'langchange'.
 */
import { el, externalLink } from './util/dom.js';
import { observeReveal } from './reveal.js';
import { currentLang } from './i18n.js';

const L = (obj, fallback = '') => (obj && (obj[currentLang()] ?? obj.fr)) ?? fallback;
const name = (item) => (currentLang() === 'en' && item.name_en) || item.name;

export async function initProfile() {
  const skillsRoot = document.getElementById('skills-grid');
  const eduRoot = document.getElementById('education-list');
  if (!skillsRoot && !eduRoot) return null;
  let data;
  try {
    const r = await fetch('data/profile.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    data = await r.json();
  } catch {
    document.getElementById('competences')?.setAttribute('hidden', '');
    document.getElementById('formation')?.setAttribute('hidden', '');
    return null;
  }

  function render() {
    if (skillsRoot) renderSkills(skillsRoot, data);
    if (eduRoot) renderEducation(eduRoot, data);
  }
  render();
  window.addEventListener('langchange', render);
  return data;
}

function renderSkills(root, data) {
  const legend = document.getElementById('skills-legend');
  if (legend) {
    legend.replaceChildren(...Object.entries(data.levels).map(([k, v]) =>
      el('li', {}, [el('span', { class: `lvl lvl--${k}` }, k), ' ', L(v)])));
  }
  root.replaceChildren(...data.skills.map((group, i) => el('article', { class: 'skill reveal', dataset: { delay: String(i % 3) } }, [
    el('h3', { class: 'skill__title' }, L(group.title)),
    group.note ? el('p', { class: 'skill__note muted' }, L(group.note)) : null,
    el('ul', { class: 'skill__list', role: 'list' }, group.items.map((it) => el('li', { class: 'skill__item' }, [
      el('span', { class: `lvl lvl--${it.level}`, title: L(data.levels[it.level]) }, it.level),
      it.url ? externalLink(it.url, { class: 'skill__link' }, name(it)) : el('span', {}, name(it)),
    ]))),
  ])));
  observeReveal(root);
}

function renderEducation(root, data) {
  const lang = currentLang();
  const statusText = (e) => (e.status_text ? L(e.status_text)
    : e.status === 'done' ? (lang === 'en' ? 'Completed' : 'Validé') : (lang === 'en' ? 'In progress' : 'En cours'));
  const row = (e) => el('li', { class: `edu edu--${e.status}` }, [
    el('div', {}, [
      el('span', { class: 'edu__name' }, e.url ? externalLink(e.url, {}, name(e)) : name(e)),
      el('span', { class: 'edu__issuer mono' }, e.issuer),
    ]),
    el('span', { class: `badge badge--${e.status === 'done' ? 'perso' : 'lab'}` }, statusText(e)),
  ]);
  root.replaceChildren(
    el('li', { class: 'edu__head mono' }, lang === 'en' ? 'Training' : 'Formation'),
    ...data.education.map(row),
    el('li', { class: 'edu__head mono' }, lang === 'en' ? 'Certifications' : 'Certifications'),
    ...data.certifications.map(row),
  );
  const note = document.getElementById('education-note');
  if (note) note.textContent = L(data.certifications_note);
}
