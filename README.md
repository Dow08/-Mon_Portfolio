# Portfolio — Dorian Poncelet

[![CyberPulse](https://github.com/Dow08/-Mon_Portfolio/actions/workflows/cyberpulse.yml/badge.svg)](https://github.com/Dow08/-Mon_Portfolio/actions/workflows/cyberpulse.yml)
[![Projets](https://github.com/Dow08/-Mon_Portfolio/actions/workflows/projects.yml/badge.svg)](https://github.com/Dow08/-Mon_Portfolio/actions/workflows/projects.yml)
[![Security scan](https://github.com/Dow08/-Mon_Portfolio/actions/workflows/security-scan.yml/badge.svg)](https://github.com/Dow08/-Mon_Portfolio/actions/workflows/security-scan.yml)

Portfolio de **Dorian Poncelet** — cybersécurité orientée gouvernance, risques et conformité (GRC), infrastructures sécurisées et automatisation par l'IA.

🌐 https://dow08.github.io/-Mon_Portfolio/

## Ce que fait le site

- **Une page**, HTML/CSS/JavaScript sans framework ni bibliothèque, hébergée sur GitHub Pages, bilingue FR/EN.
- **Projets générés automatiquement** depuis les dépôts publics de l'auteur (`data/projects.json`, régénéré chaque jour par une GitHub Action). Pour faire apparaître un projet : le documenter dans le README de son dépôt (section `### nom-du-dossier`, ligne `Stack : …`, `⭐` pour le mettre en avant).
- **Compétences, formation et assistant « questions fréquentes »** alimentés par `data/profile.json`, un fichier de contenu validé. L'assistant fonctionne sans IA, sans réseau et sans stockage.
- **CyberPulse** : chaque jour, un pipeline Python lit le flux RSS de The Hacker News, traduit et résume trois articles (Gemini 2.5 Flash, plusieurs modèles en cascade), rédige un script radio et le lit en synthèse vocale (Piper TTS, hors ligne, repli edge-tts ; sans audio, le flash est publié en texte seul et le signale). Résultat validé contre un schéma JSON avant publication ; un échec ouvre une issue.
- **Séquence cinématique** pilotée par le défilement (canvas + images WebP), avec repli procédural, désactivée sous `prefers-reduced-motion` et sur petit écran.

## Sécurité

- CSP stricte par balise meta, sans `unsafe-inline` ; aucune origine externe (polices et icônes auto-hébergées).
- Tout contenu externe (README, flux RSS, réponses IA) est rendu via `textContent` et des URL filtrées, jamais via `innerHTML`.
- Actions GitHub épinglées par SHA, permissions minimales, secrets IA isolés du job qui écrit dans le dépôt, Dependabot, scan Trivy.
- Détail et limites (GitHub Pages n'autorise pas les en-têtes HTTP) : [docs/RAPPORT_SECURITE.md](docs/RAPPORT_SECURITE.md).

## Développement

```bash
python scripts/serve.py              # http://localhost:8080 (CSP en mode rapport, sans cache)
python scripts/build_css.py          # régénère css/site.css après modification de css/*.css
python scripts/build_projects.py     # régénère data/projects.json (GITHUB_TOKEN conseillé)
python scripts/make_og.py            # régénère l'image de partage
python -m pytest tests && node --test tests/*.test.mjs
```

Pipeline CyberPulse en local : `pip install -r requirements.txt`, puis `cd src && python main.py` avec `GEMINI_API_KEY`.

Guide complet : [docs/MAINTENANCE.md](docs/MAINTENANCE.md). Décisions, direction artistique, rapports de tests et de sécurité, scoring : dossier [docs/](docs/).

## Structure

```
index.html  accessibilite.html  404.html  robots.txt  sitemap.xml
css/        sources (tokens, base, layout, components, motion) → site.css généré
js/         modules ES : main, i18n, nav, reveal, sequence, projects, profile, assistant, cyberpulse, util/dom
data/       projects.json (généré) · profile.json (validé) · i18n.en.json · sequence.json
assets/     fonts (Geist, OFL) · img · sequence (frames générées) · source (brut, non versionné)
cyber-news/ data.json + audio (générés par CyberPulse)
src/        pipeline CyberPulse · schemas/ schéma de validation
scripts/    serve, build_css, build_projects, extract_frames, make_og, validate_data
tests/      pytest + node --test
.github/    workflows cyberpulse, projects, security-scan · dependabot
docs/       audit, décisions, DA, plan, rapports, scoring, maintenance
```

## Licence

Code du site : MIT. Polices Geist : SIL Open Font License (`assets/fonts/OFL.txt`). Contenus (textes, projets) : © Dorian Poncelet.
