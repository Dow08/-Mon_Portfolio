// Tests Node de la recherche de l'assistant (option A), sur la FAQ réelle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

globalThis.location = { href: 'https://dow08.github.io/Mon_Portfolio/' };
globalThis.window = { matchMedia: () => ({ matches: false }) };
const { normalize, score } = await import('../js/assistant.js');
const profile = JSON.parse(await readFile(new URL('../data/profile.json', import.meta.url), 'utf8'));
const faq = profile.assistant.faq;
const best = (q) => faq.map((e) => ({ e, s: score(e, normalize(q)) })).sort((a, b) => b.s - a.s)[0];

test('normalize retire accents, ponctuation et mots vides', () => {
  assert.deepEqual(normalize('Est-il disponible à Rodez ?'), ['disponible', 'rodez']);
});

test('les questions typiques tombent sur la bonne entrée', () => {
  assert.equal(best('Dorian est-il disponible ?').e.id, 'dispo');
  assert.equal(best('quel poste cherche-t-il').e.id, 'poste');
  assert.equal(best('connaît-il ISO 27001 et NIS2 ?').e.id, 'referentiels');
  assert.equal(best('how can I get his CV').e.id, 'contact');
  assert.equal(best('salaire ?').e.id, 'salaire');
  assert.equal(best('experience avant la cyber').e.id, 'experience');
});

test('une question hors périmètre reste sous le seuil', () => {
  assert.ok(best('recette de la tarte aux pommes').s < 0.4);
});

test('toutes les entrées ont des textes FR et EN et des liens sûrs', () => {
  for (const e of faq) {
    assert.ok(e.q.fr && e.q.en && e.a.fr && e.a.en, e.id);
    for (const l of e.links || []) assert.ok(l.href.startsWith('#') || l.href.startsWith('https://'), `${e.id}: ${l.href}`);
  }
});
