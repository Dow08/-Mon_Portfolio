/**
 * Assistant de recrutement — option A : sans LLM, sans réseau, sans stockage.
 * Recherche dans la FAQ validée (data/profile.json → assistant.faq) par
 * recouvrement de mots-clés normalisés. Si rien ne correspond : le dit,
 * et renvoie vers le contact. Désactivable via assistant.enabled.
 */
import { el, safeHref } from './util/dom.js';
import { currentLang } from './i18n.js';

const L = (obj) => (obj && (obj[currentLang()] ?? obj.fr)) ?? '';
const UI = {
  fr: {
    open: 'Questions fréquentes', title: 'Questions fréquentes', close: 'Fermer',
    hint: 'Réponses préparées par Dorian — ce n’est pas une personne et rien n’est enregistré.',
    placeholder: 'Posez une question (ex. « disponible ? »)', search: 'Chercher',
    none: 'Je n’ai pas cette information. Le plus simple : contacter Dorian directement.',
    contact: 'Aller au contact', suggestions: 'Suggestions',
  },
  en: {
    open: 'Frequently asked questions', title: 'Frequently asked questions', close: 'Close',
    hint: 'Answers prepared by Dorian — this is not a person and nothing is stored.',
    placeholder: 'Ask a question (e.g. “available?”)', search: 'Search',
    none: 'I don’t have that information. The simplest way: contact Dorian directly.',
    contact: 'Go to contact', suggestions: 'Suggestions',
  },
};
const ui = (k) => (UI[currentLang()] || UI.fr)[k];

const STOP = new Set(['dorian', 'poncelet', 'le', 'la', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'ou', 'il', 'elle', 'est', 'a', 'the', 'is', 'he', 'his', 'what', 'quel', 'quelle', 'quels', 'quelles', 'que', 'qui', 'en', 'au', 'aux', 'pour', 'sur', 'dans', 'son', 'sa', 'ses', 'to', 'of', 'for', 'does', 'do', 'any']);

export function normalize(text) {
  return String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter((w) => w.length > 1 && !STOP.has(w));
}

/** Score d'une entrée FAQ pour une requête ; exporté pour les tests. */
export function score(entry, queryTokens) {
  if (!queryTokens.length) return 0;
  const bag = new Set([...entry.keywords.flatMap(normalize), ...normalize(entry.q.fr), ...normalize(entry.q.en || '')]);
  let hits = 0;
  for (const tok of queryTokens) {
    if (bag.has(tok)) { hits += 1; continue; }
    for (const b of bag) { if (b.length > 3 && (b.startsWith(tok) || tok.startsWith(b))) { hits += 0.6; break; } }
  }
  return hits / queryTokens.length;
}

export function initAssistant(profile) {
  const faq = profile?.assistant?.faq;
  if (!profile?.assistant?.enabled || !Array.isArray(faq) || !faq.length) return;

  const dialog = el('dialog', { class: 'assistant', 'aria-labelledby': 'assistant-title' });
  const title = el('h2', { id: 'assistant-title', class: 'assistant__title' });
  const hint = el('p', { class: 'assistant__hint muted' });
  const input = el('input', { class: 'assistant__input', type: 'search', autocomplete: 'off', 'aria-label': '' });
  const submit = el('button', { class: 'btn btn--primary btn--sm', type: 'submit' });
  const form = el('form', { class: 'assistant__form' }, [input, submit]);
  const sugTitle = el('p', { class: 'mono assistant__sug-title' });
  const sug = el('div', { class: 'assistant__suggestions' });
  const answer = el('div', { class: 'assistant__answer', 'aria-live': 'polite' });
  const closeBtn = el('button', { class: 'assistant__close', type: 'button' });
  dialog.append(el('div', { class: 'assistant__head' }, [title, closeBtn]), hint, form, sugTitle, sug, answer);
  document.body.append(dialog);

  const opener = el('button', { class: 'assistant__fab', type: 'button' }, [
    el('span', { 'aria-hidden': 'true' }, '?'), el('span', { class: 'assistant__fab-label' }),
  ]);
  document.body.append(opener);

  function labels() {
    title.textContent = ui('title'); hint.textContent = ui('hint');
    input.placeholder = ui('placeholder'); input.setAttribute('aria-label', ui('placeholder'));
    submit.textContent = ui('search'); closeBtn.textContent = ui('close'); closeBtn.setAttribute('aria-label', ui('close'));
    sugTitle.textContent = ui('suggestions');
    opener.querySelector('.assistant__fab-label').textContent = ui('open');
    opener.setAttribute('aria-label', ui('open'));
    sug.replaceChildren(...faq.map((e) => el('button', { class: 'chip', type: 'button', onclick: () => show(e) }, L(e.q))));
  }

  function show(entry) {
    answer.replaceChildren(
      el('p', { class: 'assistant__q mono' }, L(entry.q)),
      el('p', {}, L(entry.a)),
      entry.links?.length ? el('p', { class: 'assistant__links' }, entry.links.map((l) => {
        const href = safeHref(l.href);
        if (!href) return null;
        const internal = l.href.startsWith('#');
        return el('a', { class: 'btn btn--ghost btn--sm', href, ...(internal ? { onclick: () => dialog.close() } : { target: '_blank', rel: 'noopener noreferrer' }) }, l.label);
      })) : null,
    );
  }

  function none() {
    answer.replaceChildren(el('p', {}, ui('none')),
      el('p', {}, el('a', { class: 'btn btn--primary btn--sm', href: '#contact', onclick: () => dialog.close() }, ui('contact'))));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const tokens = normalize(input.value);
    const ranked = faq.map((entry) => ({ entry, s: score(entry, tokens) })).sort((a, b) => b.s - a.s);
    if (ranked[0] && ranked[0].s >= 0.4) show(ranked[0].entry); else none();
  });
  opener.addEventListener('click', () => { dialog.showModal(); input.focus(); });
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  // Échap ferme toujours (un champ type=search intercepte le premier Échap pour se vider)
  dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); dialog.close(); } });
  window.addEventListener('langchange', () => { labels(); answer.replaceChildren(); });
  labels();
}
