// el() ne doit jamais poser d'attribut exécutable ou d'URL non filtrée, même si on le lui demande.
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.location = { href: 'https://dow08.github.io/-Mon_Portfolio/' };
// DOM minimal : on enregistre ce que el() tente de poser
class FakeNode {
  constructor(tag) { this.tag = tag; this.attrs = {}; this.listeners = []; this.dataset = {}; this.children = []; this.className = ''; this.textContent = ''; }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener(type) { this.listeners.push(type); }
  append(...c) { this.children.push(...c); }
}
globalThis.Node = FakeNode;
globalThis.document = { createElement: (t) => new FakeNode(t), createTextNode: (s) => Object.assign(new FakeNode('#text'), { textContent: s }) };
const { el } = await import('../js/util/dom.js');

test('les attributs on* sous forme de chaîne sont ignorés, les fonctions sont écoutées', () => {
  const n = el('button', { onclick: 'alert(1)', onkeydown: () => {}, ONMOUSEOVER: 'x' });
  assert.deepEqual(n.attrs, {});
  assert.deepEqual(n.listeners, ['keydown']);
});

test('srcdoc, formaction, style et xlink:href ne sont jamais posés', () => {
  const n = el('iframe', { srcdoc: '<script>1</script>', formaction: 'javascript:1', style: 'x', 'xlink:href': 'javascript:1', title: 'ok' });
  assert.deepEqual(n.attrs, { title: 'ok' });
});

test('href et src passent par safeHref', () => {
  const bad = el('a', { href: 'javascript:alert(1)', src: 'data:text/html,x' });
  assert.deepEqual(bad.attrs, {});
  const good = el('a', { href: 'https://github.com/Dow08', src: 'assets/img/poster.webp' });
  assert.equal(good.attrs.href, 'https://github.com/Dow08');
  assert.equal(good.attrs.src, 'https://dow08.github.io/-Mon_Portfolio/assets/img/poster.webp');
});

test('les enfants chaîne deviennent des nœuds texte, jamais du HTML', () => {
  const n = el('p', {}, ['<img src=x onerror=alert(1)>']);
  assert.equal(n.children[0].tag, '#text');
  assert.equal(n.children[0].textContent, '<img src=x onerror=alert(1)>');
});
