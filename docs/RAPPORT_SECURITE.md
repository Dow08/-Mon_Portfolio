# Rapport de sécurité

État au 2026-10-13, branche `refonte-2027`. Ce rapport décrit les contrôles **réellement en place et vérifiés**, les limites de l'hébergement et les risques résiduels. Il ne prétend pas que le site est « sécurisé à 100 % ».

---

## 1. Contenu non fiable et injection

| Source de données | Traitement | Vérifié par |
|---|---|---|
| `data/projects.json` (dérivé des README GitHub) | Rendu via `el()` / `textContent` uniquement ; URL filtrées par `safeHref` (https/mailto/ancres) ; champs validés côté script (`validate()`) et côté client (`isValid()`) ; longueurs tronquées | `grep innerHTML js/` = 0 ; `tests/dom.test.mjs` ; `tests/test_build_projects.py` |
| `cyber-news/data.json` (site tiers + LLM) | Idem ; schéma JSON strict (`schemas/cyberpulse.schema.json` : 3 articles exactement, URL `https://thehackernews.com/` uniquement, longueurs bornées, `additionalProperties: false`) validé **avant** commit et **avant** publication | `tests/test_cyberpulse.py` |
| Réponses LLM | Demandées en JSON (`response_format` / `response_mime_type`), parsées, chaque champ re-validé ; le script est borné en mots ; le LLM ne produit jamais de HTML ni d'URL (les URL viennent du flux RSS) | idem |
| Liens externes | `target="_blank"` toujours accompagné de `rel="noopener noreferrer"` (`externalLink()`) | revue de code |

Risque résiduel : une injection de prompt dans un article THN pourrait altérer la **traduction** ou le **script radio** (texte affiché/lu), pas le DOM ni les liens. Mitigation : bornes de longueur, pas d'exécution, mention « traduit automatiquement ».

## 2. Content Security Policy

Politique active (balise `<meta http-equiv>` dans `index.html`) :

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none';
base-uri 'self'; form-action 'self' mailto:
```

- Aucun `'unsafe-inline'` : pas d'attribut `style=""`, pas de `onclick`, pas de `<script>` inline (règle de codage ; les variables CSS dynamiques passent par `element.style.setProperty`, autorisé par la CSP).
- **Zéro origine externe** : polices, scripts, styles et données sont servis depuis le site.
- Vérifié : serveur local avec en-tête `Content-Security-Policy-Report-Only` identique → aucune violation en console sur toute la page.

**Limites GitHub Pages (non contournables)** : pas d'en-têtes HTTP personnalisés, donc impossible d'ajouter `frame-ancestors` (anti-clickjacking), `Strict-Transport-Security` (HSTS est tout de même appliqué par GitHub sur `*.github.io`), `X-Content-Type-Options`, `Permissions-Policy`, ni de rapport de violations (`report-to`). Une migration vers Cloudflare Pages ou Netlify lèverait ces limites ; non retenue (pas de bénéfice suffisant pour un portfolio statique).

## 3. Chaîne d'approvisionnement

| Élément | État |
|---|---|
| Bibliothèques JavaScript | **aucune** (ni CDN, ni npm) |
| Polices | Geist 1.7.2 (SIL OFL), fichiers auto-hébergés, SHA-256 : `a369fcf5…28fbb8` (Geist), `fba8f577…e563ab` (Geist Mono), licence dans `assets/fonts/OFL.txt` |
| GitHub Actions | épinglées par SHA de commit complet, avec la version en commentaire : checkout v5.1.0, setup-python v6.3.0, trivy-action v0.36.0, codeql-action v4.38.3, upload/download-artifact v7.0.2 / v8.0.2, github-script v8 |
| Permissions des workflows | `permissions: {}` au niveau racine ; chaque job déclare le minimum : génération CyberPulse = `contents: read` (avec les clés IA), publication = `contents: write` (**sans** les clés IA, via artefact), alerte = `issues: write`, scan = `security-events: write` |
| `persist-credentials: false` | sur les checkouts qui n'ont pas besoin de pousser |
| Dépendances Python | versions figées (`==`) dans `requirements.txt` ; `requirements.in` pour `pip-compile --generate-hashes` (hashes non encore générés : à faire dans un environnement propre) |
| Dependabot | hebdomadaire pour `github-actions` et `pip` |
| Trivy | scan `vuln,secret,misconfig` à chaque push sur `main`, PR, hebdomadaire ; résultats dans l'onglet Security |

Point non vérifié : la rumeur de compromission de `trivy-action` début 2026 citée dans l'audit initial. La version épinglée (v0.36.0, avril 2026, SHA vérifié via `git ls-remote`) est postérieure ; aucun avis de sécurité n'a été consulté. **À vérifier par Dorian** sur la page Security du projet avant le premier run.

## 4. Secrets

- Aucun secret côté client (vérifié : aucun appel réseau sortant, aucune clé dans `js/`).
- `OPEN_AI_KEY` / `GEMINI_KEY` restent des secrets de dépôt, exposés uniquement au job `generate`.
- `GITHUB_TOKEN` du workflow Projets : `contents: write` sur ce seul dépôt.

## 5. Pipeline CyberPulse

- Toute étape manquante (moins de 3 articles, traduction incomplète, script hors bornes, audio < 20 Ko, schéma invalide, aucun fournisseur IA) → `sys.exit(1)` → job rouge → **rien n'est commité** → issue « CyberPulse en échec » créée ou commentée automatiquement.
- Source : flux RSS officiel (structuré) ; le repli HTML fragile n'est activé que par `CYBERPULSE_HTML_FALLBACK=1`.
- Droits de republication des résumés THN : **non vérifiés** (question 6.2 en attente). L'affichage est limité à titre + lien + résumé court et la source est citée.

## 6. Vie privée

- Aucun cookie, aucun stockage, aucun traqueur, aucune requête vers un tiers.
- Formulaire : `mailto:` uniquement (aucune donnée ne transite par un serveur tiers).
- Assistant (option A, à venir) : fonctionnera sans réseau ni journalisation.

## 7. Risques résiduels et actions

| Risque | Gravité | Action |
|---|---|---|
| Clickjacking (pas de `frame-ancestors`) | faible (site public sans action sensible) | documenté ; levable par changement d'hébergeur |
| Hashes pip absents | faible | `pip-compile --generate-hashes` avant mise en production |
| Première exécution réelle des workflows non testée | moyenne | surveiller le premier run, `workflow_dispatch` manuel après push |
| Anciens fichiers (`style.css`, vidéo 19 Mo, `image1.png`) encore dans le dépôt | nulle (non référencés) | suppression en lot 8 |
