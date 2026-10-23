// Tests Node (node --test tests/) des helpers DOM sûrs — sans navigateur.
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.location = { href: 'https://dow08.github.io/Mon_Portfolio/' };
const { safeHref } = await import('../js/util/dom.js');

test('safeHref accepte https, mailto et ancres', () => {
  assert.equal(safeHref('https://github.com/Dow08'), 'https://github.com/Dow08');
  assert.equal(safeHref('mailto:a@b.c'), 'mailto:a@b.c');
  assert.equal(safeHref('#contact'), '#contact');
  assert.equal(safeHref('data/projects.json'), 'https://dow08.github.io/Mon_Portfolio/data/projects.json');
});

test('safeHref refuse javascript:, data:, http: externe et les valeurs non textuelles', () => {
  assert.equal(safeHref('javascript:alert(1)'), null);
  assert.equal(safeHref('JaVaScRiPt:alert(1)'), null);
  assert.equal(safeHref('data:text/html,hi'), null);
  assert.equal(safeHref('http://evil.example/'), null);
  assert.equal(safeHref(42), null);
  assert.equal(safeHref(null), null);
});
