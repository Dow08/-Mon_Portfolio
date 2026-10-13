# Plan d'implémentation — refonte 2027 (phase 3)

Date : 2026-10-13 · Branche de travail : `refonte-2027` (locale, non poussée) · `main` = site en production, intouché.

État au moment du plan : le prototype de l'accueil (lots 1-3 partiels) est fonctionnel en local. Ce plan couvre le reste, lot par lot, avec pour chaque lot : fichiers, dépendances, risques de régression, tests.

---

## 0. Structure cible (déjà en place pour l'essentiel)

```
index.html                     page unique, HTML sémantique, CSP meta, sprite SVG d'icônes
css/{tokens,base,layout,components,motion}.css
js/main.js  nav.js  reveal.js  sequence.js  projects.js  [cyberpulse.js  assistant.js]  util/dom.js
data/projects.json             généré (Action) — NE PAS éditer à la main
data/profile.json              contenu validé (compétences, formation, FAQ assistant) — à créer après validation
data/sequence.json             manifeste des frames (count, pattern) — créé par extract_frames
cyber-news/{data.json, audio/} généré (Action CyberPulse) — inchangé
assets/fonts/                  Geist-Variable.woff2, GeistMono-Variable.woff2 (OFL)
assets/sequence/NNN.webp       frames de la séquence (générées)
assets/img/                    favicon.svg, og.png, poster.webp
assets/source/                 fichier brut fourni par Dorian (gitignored)
scripts/build_projects.py  serve.py  extract_frames.py  validate_data.py  [check_links.py]
src/                           pipeline CyberPulse (fiabilisé)
.github/workflows/{projects.yml, cyberpulse.yml, security-scan.yml}
tests/                         pytest pour les scripts ; tests DOM Node pour util/dom.js
docs/                          ce dossier
```

Fichiers **supprimés** en fin de refonte (après validation) : `style.css` (mort), `assets/images/image1.png` (inutilisé), `assets/images/cyber-shield.png` (remplacé par `og.png` léger), `assets/Video/cyber_hero.mp4` (remplacé par les frames), `AUDIT.md` (fusionné dans `docs/`).

## 1. Lots

### Lot 1 — Structure, navigation, design system, responsive ✅ (prototype)
Fait : nav pilule + burger accessible, tokens, grille, sections, `reveal`, mobile 375 px sans débordement.
Reste : pages d'erreur (`404.html`), `robots.txt`, `sitemap.xml`, lien « Accessibilité », test 320 / 390 / 768 / 1440.

### Lot 2 — Séquence cinématique
| Tâche | Fichier | Dépend de |
|---|---|---|
| `scripts/extract_frames.py` : ffmpeg → N frames WebP 1280 px (q 75) + poster + `data/sequence.json` | scripts/ | **fichier source de Dorian** |
| Chargement progressif déjà codé (`sequence.js`) ; ajuster `count` et la durée de piste (`.seq__track` height) selon N | js/, css/ | frames |
| Poster `<img>` dans `.hero__poster` et `.seq__media` (remplace le SVG temporaire) | index.html | frames |
| Budget : frames ≤ 3 Mo au total, poster ≤ 60 Ko, aucune frame chargée sous `saveData` | — | — |
Risque : séquence fournie non conforme (ratio, luminosité) → signalé avant intégration. Repli procédural conservé.

### Lot 3 — Projets et études de cas
| Tâche | Fichier |
|---|---|
| Workflow `projects.yml` : cron quotidien + `workflow_dispatch` + `repository_dispatch`, `GITHUB_TOKEN`, `permissions: contents: write` limité au job de commit, épinglé par SHA | .github/workflows/ |
| `tests/test_build_projects.py` : parse_readme_projects, join_desc_lines, format_title, non-régression des 24 URL | tests/ |
| Section « Autres travaux » repliée (`<details>`) si validé (CONTENU 4.2) | index.html, projects.js |
| 4-6 études de cas (HTML statique rédigé à partir du contenu validé, captures issues des README) | index.html |
Dépend de : réponses §4 de CONTENU_A_VALIDER.

### Lot 4 — Fonctionnalités existantes : CyberPulse
| Tâche | Fichier |
|---|---|
| `src/scraper.py` : flux RSS (`feedparser`) avec repli HTML derrière flag | src/ |
| `src/main.py` : JSON structuré du LLM, validation, `sys.exit(1)` si incomplet, `ai_provider` par étape | src/ |
| `schemas/cyberpulse.schema.json` + `scripts/validate_data.py` (utilisé par l'Action avant commit) | schemas/, scripts/ |
| `cyberpulse.yml` : jobs séparés génération (secrets, `contents: read`) / commit (`contents: write`, artefact) ; résumé réel ; issue auto si échec (si validé 6.5) ; SHA | .github/workflows/ |
| `requirements.txt` figé + hashes ; `dependabot.yml` | racine, .github/ |
| `js/cyberpulse.js` : lecteur accessible (`<input type=range>`), rendu via `el()`, mention de source, masquage si données invalides | js/ |
Risque : changement de format de `data.json` → le front valide les champs et masque la section plutôt que de casser.

### Lot 5 — Formation, compétences, contact, assistant (option A)
| Tâche | Fichier |
|---|---|
| `data/profile.json` : compétences (D/F/A), formation avec statuts, FAQ — **uniquement contenu validé** | data/ |
| Sections Compétences et Formation rendues depuis profile.json (ou HTML statique si le contenu est stable) | index.html / js |
| Formulaire `mailto:` avec labels, validation, message honnête — ou retrait (5.5) | index.html |
| `js/assistant.js` : panneau, recherche normalisée (accents, synonymes), réponses validées + liens, « je ne sais pas » + contact, désactivable, mention « automatique » | js/, css/ |
Dépend de : §1-3, 5, 7 de CONTENU_A_VALIDER.

### Lot 6 — SEO et accessibilité
`<h1>` ✅, hiérarchie, `robots.txt`, `sitemap.xml`, JSON-LD `Person` (champs validés seulement), `og.png` 1200×630 ≤ 100 Ko, page « Accessibilité », tests axe-core + clavier + lecteur d'écran (NVDA si disponible), contraste mesuré sur rendu.

### Lot 7 — Sécurité et performance
CSP meta ✅ (déjà active, sans inline) ; `security-scan.yml` épinglé par SHA + `trivy config` ; Lighthouse sur 6 largeurs ; budget : ≤ 300 Ko au premier rendu hors frames, LCP ≤ 2,5 s en 4G simulée ; rapport `docs/RAPPORT_SECURITE.md` et `docs/RAPPORT_PERFORMANCE.md`.

### Lot 8 — Documentation et livraison
`README.md` réécrit (plus d'affirmations fausses), `docs/MAINTENANCE.md` (comment ajouter un projet, régénérer les frames, mettre à jour le profil), `docs/RAPPORT_TESTS.md`, `docs/SCORING.md` final, `CLAUDE.md` mis à jour.

## 2. Dépendances externes (toutes à zéro coût)

| Dépendance | Rôle | Origine | Versionné ? |
|---|---|---|---|
| Geist, Geist Mono (SIL OFL) | polices | github.com/vercel/geist-font (release) | oui, woff2 dans `assets/fonts/` |
| ffmpeg 8.1 (local) | extraction des frames | déjà installé | non (outil) |
| Python 3.11+ stdlib + `feedparser`, `openai`, `google-genai`, `edge-tts`, `jsonschema` | pipeline | PyPI, figé avec hashes | oui |
| Actions : checkout, setup-python, trivy-action, upload-sarif | CI | épinglées par SHA | oui |
| **Aucune** bibliothèque JS | — | — | — |

## 3. Risques de régression et parades

| Risque | Parade |
|---|---|
| Une des 24 cartes disparaît ou change d'URL | `tests/test_build_projects.py` compare à `docs/LIENS_ET_PROJETS.md` ; le workflow échoue |
| CyberPulse casse silencieusement | `sys.exit(1)` + validation de schéma + issue automatique |
| CSP bloque une ressource | serveur local en Report-Only + règle « aucun inline » + vérification console avant chaque lot |
| Séquence lourde | budget 3 Mo, `saveData`, chargement différé, poster immédiat |
| Mobile cassé par un nouveau composant | test `scrollWidth === innerWidth` à 320/375/390 après chaque lot |
| Contenu non validé publié | tout texte marqué `PROTOTYPE` dans index.html doit disparaître avant livraison (grep bloquant dans la checklist) |

## 4. Tests prévus

- **Unitaires (pytest)** : parsing README, titre, recollage des accents, validation JSON, schéma CyberPulse.
- **DOM (node --test)** : `safeHref` refuse `javascript:`/`http:` externe ; `el()` ne produit jamais de HTML à partir d'une string.
- **Navigateur** : 6 largeurs × (débordement, menu, ancres, filtres, lecteur audio, assistant, clavier, reduced-motion).
- **Qualité** : axe-core, Lighthouse (lab), validation HTML (Nu), liens (script `check_links.py`).
- Résultats consignés dans `docs/RAPPORT_TESTS.md` avec date, outil, version, et ce qui n'a pas pu être testé.

## 5. Déploiement et retour arrière

1. Chaque lot = un commit sur `refonte-2027` (sur accord de Dorian).
2. Revue finale sur serveur local ; option : prévisualisation GitHub Pages depuis la branche (Settings → Pages → branche `refonte-2027`) — à valider car cela remplace temporairement le site en ligne ; alternative : repo de staging.
3. Mise en production = merge `refonte-2027` → `main` **uniquement sur accord explicite**.
4. Retour arrière : `git revert -m 1 <merge>` puis push, ou `git push origin <sha-avant>:main` ; Pages redéploie en ~1 min. Les workflows de l'ancienne version restent dans l'historique.

## 6. Coûts

Aucun coût nouveau : pas de service tiers, pas de LLM côté site, pas de domaine. CyberPulse continue d'utiliser les clés OpenAI/Gemini existantes (budget à confirmer, 6.4).

## 7. Décisions encore requises de Dorian

1. Réponses de `docs/CONTENU_A_VALIDER.md` (au minimum §1, 2, 5 pour les lots 5-6).
2. Fichier source de la séquence (spécification §9 de DIRECTION_ARTISTIQUE.md).
3. Autorisation de télécharger les polices Geist (release GitHub de Vercel, licence OFL).
4. Accord pour committer les lots sur `refonte-2027`.
5. Choix de prévisualisation (branche Pages vs staging) avant mise en production.
