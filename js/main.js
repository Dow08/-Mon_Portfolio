import { initI18n } from './i18n.js';
import { initNav } from './nav.js';
import { observeReveal } from './reveal.js';
import { initSequence } from './sequence.js';
import { initProjects } from './projects.js';
import { initCyberPulse } from './cyberpulse.js';

document.documentElement.classList.add('js');

// La langue d'abord : les modules suivants lisent t() au rendu initial.
await initI18n();

initNav();
observeReveal();
initSequence();
initProjects();
initCyberPulse();

// Délais en cascade de la matrice (via CSSOM : la CSP interdit les attributs style inline)
document.querySelectorAll('.matrix .cell').forEach((cell, i) => cell.style.setProperty('--i', String(i)));

// Année du pied de page
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
