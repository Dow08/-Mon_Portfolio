// data/cases.json : structure complète, bilingue, sourcée, liens sûrs, images présentes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const data = JSON.parse(await readFile(new URL('data/cases.json', root), 'utf8'));
const projects = JSON.parse(await readFile(new URL('data/projects.json', root), 'utf8'));

test('six études de cas, chacune complète en FR et EN', () => {
  assert.equal(data.cases.length, 6);
  for (const c of data.cases) {
    for (const k of ['kicker', 'role', 'context', 'problem', 'approach']) assert.ok(c[k].fr && c[k].en, `${c.id}.${k}`);
    for (const k of ['results', 'limits']) {
      assert.ok(Array.isArray(c[k].fr) && c[k].fr.length >= 2, `${c.id}.${k}.fr`);
      assert.equal(c[k].fr.length, c[k].en.length, `${c.id}.${k} FR/EN`);
    }
    assert.ok(c.title && c.title_en, c.id);
  }
});

test('chaque étude renvoie vers une carte projet existante (URL identique)', () => {
  const urls = new Set(projects.projects.map((p) => p.url));
  for (const c of data.cases) assert.ok(urls.has(c.url), `${c.id}: ${c.url} absent de projects.json`);
});

test('les images référencées existent et sont servies depuis le site', async () => {
  for (const c of data.cases) {
    if (c.image === null) { assert.equal(c.image_alt, null); continue; }
    assert.match(c.image, /^assets\/cases\/[a-z0-9_-]+\.webp$/);
    await access(new URL(c.image, root));
    assert.ok(c.image_alt.fr && c.image_alt.en, `${c.id}: alt manquant`);
  }
});

test('chaque fiche nomme explicitement une limite et la nature du projet', () => {
  for (const c of data.cases) {
    const txt = (c.kicker.fr + ' ' + c.limits.fr.join(' ')).toLowerCase();
    assert.ok(/(fictif|fictive|personnel|formation|école|privé|laboratoire|lab|non commercial)/.test(txt), c.id);
  }
});
