// ESLint 10 (configuration plate). Objectif : interdire par construction les
// puits d'injection (innerHTML, eval, URL javascript:) et attraper les erreurs
// classiques. Le code du site n'a aucune dépendance : on lint js/, scripts/, tests/.
import js from '@eslint/js';
import noUnsanitized from 'eslint-plugin-no-unsanitized';

const browserGlobals = {
  window: 'readonly', document: 'readonly', navigator: 'readonly', location: 'readonly', history: 'readonly',
  fetch: 'readonly', URL: 'readonly', Image: 'readonly', Node: 'readonly', CustomEvent: 'readonly',
  IntersectionObserver: 'readonly', requestAnimationFrame: 'readonly', requestIdleCallback: 'readonly',
  localStorage: 'readonly', performance: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly',
  setInterval: 'readonly', clearInterval: 'readonly', console: 'readonly',
};
const nodeGlobals = { process: 'readonly', console: 'readonly', setTimeout: 'readonly', globalThis: 'writable', URL: 'readonly' };

export default [
  { ignores: ['node_modules/**', 'css/**', 'assets/**', 'data/**', 'cyber-news/**', '.axe-tmp/**'] },
  js.configs.recommended,
  noUnsanitized.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: browserGlobals },
    rules: {
      // Puits d'exécution : interdits sans exception
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': 'error',
      // Hygiène
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-properties': ['error',
        { object: 'document', property: 'write', message: 'Puits XSS : construire le DOM avec el().' },
        { object: 'document', property: 'writeln', message: 'Puits XSS : construire le DOM avec el().' }],
      'no-restricted-syntax': ['error',
        { selector: "AssignmentExpression[left.property.name='outerHTML']", message: 'Puits XSS : outerHTML interdit.' },
        { selector: "CallExpression[callee.property.name='insertAdjacentHTML']", message: 'Puits XSS : insertAdjacentHTML interdit.' }],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.mjs', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...nodeGlobals, ...browserGlobals } },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
];
