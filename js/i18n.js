/**
 * Bascule FR / EN sans rechargement.
 * - Le HTML est écrit en français (langue par défaut, indexée).
 * - data/i18n.en.json contient les traductions, clé → texte, appliquées sur
 *   les éléments [data-i18n] (texte) et [data-i18n-label] (aria-label).
 * - Le texte français d'origine est mémorisé pour revenir en arrière.
 * - Les modules qui rendent du contenu dynamique écoutent 'langchange' et
 *   utilisent t(clé, repliFr).
 */
const STORAGE_KEY = 'dp_lang';
let lang = 'fr';
let dict = null;
const originals = new WeakMap();

export const currentLang = () => lang;

/** Traduction d'une chaîne d'interface ; retourne le repli français si absent. */
export function t(key, fallbackFr) {
  if (lang === 'en' && dict && typeof dict[key] === 'string') return dict[key];
  return fallbackFr;
}

export async function initI18n() {
  const buttons = [...document.querySelectorAll('[data-lang]')];
  buttons.forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* stockage indisponible */ }
  const wanted = saved || (navigator.language && !navigator.language.toLowerCase().startsWith('fr') ? 'en' : 'fr');
  if (wanted === 'en') await setLang('en', false);
  else reflect();
}

async function setLang(next, persist = true) {
  if (next !== 'fr' && next !== 'en') return;
  if (next === 'en' && !dict) {
    try {
      const r = await fetch('data/i18n.en.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      dict = await r.json();
    } catch { dict = {}; }
  }
  lang = next;
  if (persist) { try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ } }
  apply();
  reflect();
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

function apply() {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-i18n]')) {
    if (!originals.has(el)) originals.set(el, el.textContent);
    el.textContent = lang === 'en' ? (dict?.[el.dataset.i18n] ?? originals.get(el)) : originals.get(el);
  }
  for (const el of document.querySelectorAll('[data-i18n-label]')) {
    const key = `${el.dataset.i18nLabel}`;
    if (!originals.has(el)) originals.set(el, el.getAttribute('aria-label') || '');
    el.setAttribute('aria-label', lang === 'en' ? (dict?.[key] ?? originals.get(el)) : originals.get(el));
  }
  const title = t('meta.title', null);
  if (!originals.has(document)) originals.set(document, document.title);
  document.title = lang === 'en' && title ? title : originals.get(document);
}

function reflect() {
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
}
