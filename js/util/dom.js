/**
 * Helpers DOM sûrs : aucun innerHTML, les textes passent par textContent,
 * les URL sont filtrées. Toute donnée externe (JSON généré, README GitHub)
 * doit transiter par ces fonctions.
 */

/**
 * Crée un élément. attrs : {class, dataset, aria-*, href…}, children : string | Node | array.
 * Une string devient un nœud texte (jamais du HTML).
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'text') node.textContent = value;
    else if (key === 'href') { const safe = safeHref(value); if (safe) node.setAttribute('href', safe); }
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** N'accepte que https:, mailto: et les ancres internes. Retourne null sinon. */
export function safeHref(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('#')) return trimmed;
  try {
    const parsed = new URL(trimmed, location.href);
    if (parsed.protocol === 'https:' || parsed.protocol === 'mailto:') return parsed.href;
    if (parsed.protocol === 'http:' && parsed.hostname === 'localhost') return parsed.href;
  } catch { /* URL invalide */ }
  return null;
}

/** Lien externe sécurisé (nouvel onglet + noopener noreferrer). */
export function externalLink(href, attrs = {}, children = []) {
  return el('a', { ...attrs, href, target: '_blank', rel: 'noopener noreferrer' }, children);
}

/** Icône SVG inline depuis le sprite <symbol id="i-…"> de index.html. */
export function icon(name, cls = '') {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  if (cls) svg.setAttribute('class', cls);
  const use = document.createElementNS(svgNS, 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isSmallScreen = () => window.matchMedia('(max-width: 768px)').matches;
export const wantsSaveData = () => {
  const c = navigator.connection;
  return !!(c && (c.saveData || /(^|[^4-9])[23]g$/.test(c.effectiveType || '')));
};
