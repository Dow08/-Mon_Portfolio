#!/usr/bin/env node
/**
 * Test de non-régression CSP / Trusted Types / erreurs JS, en navigateur réel.
 *
 * Charge les pages du site (servies par scripts/serve.py), parcourt les
 * sections, bascule en anglais, ouvre l'assistant, et échoue (code 1) à la
 * moindre violation de CSP, violation Trusted Types, erreur JS non capturée
 * ou ressource en échec (HTTP ≥ 400).
 *
 *   node scripts/check_csp.mjs [baseUrl]        (défaut : http://localhost:8080)
 *   CHROME_PATH=... pour forcer l'exécutable.
 *
 * Dépendance : puppeteer-core (sans téléchargement de navigateur), à lancer via
 *   npx -y -p puppeteer-core node scripts/check_csp.mjs
 */
import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const base = (process.argv[2] || 'http://localhost:8080').replace(/\/$/, '');
const CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium-browser', '/usr/bin/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) { console.error('Chrome introuvable ; définir CHROME_PATH'); process.exit(2); }

const problems = [];
const browser = await puppeteer.launch({ executablePath, headless: 'new', args: ['--no-sandbox', '--disable-extensions'] });

async function checkPage(path, interact) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const tag = (kind, msg) => problems.push(`${path} — ${kind}: ${msg}`);
  // Violations CSP (y compris Trusted Types) remontées par le navigateur lui-même
  await page.evaluateOnNewDocument(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__cspViolations.push(`${e.violatedDirective} ← ${e.blockedURI || e.sample || '(inline)'} @ ${e.sourceFile}:${e.lineNumber}`);
    });
  });
  page.on('pageerror', (err) => tag('erreur JS', err.message));
  page.on('console', (m) => { if (m.type() === 'error') tag('console', m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) tag('HTTP ' + r.status(), r.url()); });
  await page.goto(`${base}${path}`, { waitUntil: 'networkidle0', timeout: 60000 });
  if (interact) await interact(page);
  const v = await page.evaluate(() => window.__cspViolations);
  v.forEach((x) => tag('CSP', x));
  await page.close();
}

await checkPage('/', async (page) => {
  // Parcours : chaque section (déclenche séquence, révélations, lazy images)
  const ids = await page.$$eval('main section[id]', (els) => els.map((e) => e.id));
  for (const id of ids) {
    await page.evaluate((i) => document.getElementById(i).scrollIntoView({ behavior: 'instant' }), id);
    await new Promise((r) => setTimeout(r, 250));
  }
  // Bascule EN puis FR
  await page.click('[data-lang="en"]'); await new Promise((r) => setTimeout(r, 500));
  await page.click('[data-lang="fr"]'); await new Promise((r) => setTimeout(r, 300));
  // Filtres projets
  const chips = await page.$$('#projects-filters .chip');
  if (chips[1]) await chips[1].click();
  // Assistant : ouverture, question, fermeture
  await page.click('.assistant__fab');
  await page.type('.assistant__input', 'est-il disponible ?');
  await page.keyboard.press('Enter');
  await new Promise((r) => setTimeout(r, 300));
  await page.keyboard.press('Escape');
  // Transcription
  await page.evaluate(() => { const d = document.getElementById('pulse-transcript'); if (d) d.open = true; });
  await new Promise((r) => setTimeout(r, 500));
});
await checkPage('/accessibilite.html');
await checkPage('/404.html');

await browser.close();
if (problems.length) {
  console.error(`ÉCHEC — ${problems.length} problème(s) :`);
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
console.log('OK — aucune violation CSP / Trusted Types, aucune erreur JS, aucune ressource en échec (3 pages, parcours complet).');
