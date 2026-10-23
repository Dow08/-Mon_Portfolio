# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Portfolio one-page de Dorian Poncelet (cybersécurité / GRC), GitHub Pages : https://dow08.github.io/Mon_Portfolio/ (repo `Dow08/Mon_Portfolio`). `main` = site en ligne. Refonte 2027 sur la branche `refonte-2027` — **ne pas pousser sur `main` sans accord explicite de Dorian**. Contenu et commentaires en français ; site bilingue FR/EN.

## Commandes

```bash
python scripts/serve.py                       # http://localhost:8080, CSP en mode rapport, sans cache
python scripts/build_css.py                   # OBLIGATOIRE après toute modification de css/*.css (génère css/site.css)
python scripts/build_projects.py [--check]    # régénère data/projects.json depuis l'API GitHub
python scripts/make_og.py                     # image de partage
python scripts/extract_frames.py assets/source/x.mp4   # frames WebP + data/sequence.json
python -m pytest tests                        # tests Python (PYTHONUTF8=1 sur Windows)
node --test tests/*.test.mjs                  # tests JS (safeHref, recherche de l'assistant)
python -m pytest tests/test_cyberpulse.py -k rss   # un seul test
```

Pas de bundler, pas de npm : vanilla HTML/CSS/JS en modules ES. Serveur local nécessaire (modules + fetch).

## Règles non négociables

- **Aucune invention de contenu** (expérience, certif, chiffre). Tout texte factuel vient de `docs/CONTENU_A_VALIDER.md` (réponses de Dorian) ou de `data/profile.json`. En cas de doute, retirer plutôt que publier.
- **Zéro `innerHTML`, zéro attribut `style=""` / `on*=""` dans le HTML** : la CSP meta (`script-src 'self'; style-src 'self'`, sans `unsafe-inline`) les bloque. Construire le DOM avec `el()` / `externalLink()` / `safeHref()` de `js/util/dom.js` ; les variables CSS dynamiques passent par `element.style.setProperty`.
- **Aucune origine externe** (pas de CDN, pas de Google Fonts) : tout est auto-hébergé.
- Tout texte ajouté dans `index.html` reçoit `data-i18n="clé"` + sa traduction dans `data/i18n.en.json` (le script de vérification est dans `docs/MAINTENANCE.md`).
- Fichiers générés, ne pas éditer : `css/site.css`, `data/projects.json`, `cyber-news/*`, `assets/sequence/*`, `assets/img/og.png`.
- Actions GitHub épinglées par SHA complet + commentaire de version.

## Architecture

- `index.html` : HTML sémantique seul ; sections A (hero) → B (`.seq`, séquence épinglée) → C (gouvernance, matrice SVG) → C2 (compétences) → D (projets) → E (CyberPulse) → F (formation) → G (contact). Sprite SVG d'icônes en tête de body.
- `js/main.js` attend `initI18n()` puis lance les modules. `i18n.js` applique `data/i18n.en.json` et émet `langchange` ; `projects.js`, `profile.js`, `cyberpulse.js`, `assistant.js` se re-rendent sur cet événement via `t(clé, repliFr)`.
- `js/sequence.js` : épinglage en CSS `position: sticky` (`.seq__track` 320 vh), progression calculée dans un rAF, frames WebP décrites par `data/sequence.json` (`count: 0` → rendu procédural, graphe de nœuds). Mode statique si `prefers-reduced-motion`, largeur ≤ 768 px ou `saveData`.
- Projets : `scripts/build_projects.py` reprend l'ancienne logique client (sections `### slug` d'un README + dossier homonyme + `Stack :` + `⭐`) ; `REPO_GROUP`/`STATUS` y sont les seules listes à maintenir. `tests/test_build_projects.py` exige que les 24 URL de `docs/LIENS_ET_PROJETS.md` soient présentes.
- Assistant (option A, sans LLM) : FAQ dans `data/profile.json` → `assistant.faq`, recherche par mots-clés normalisés (`normalize`/`score` testés), seuil 0,4, repli vers le contact.
- CyberPulse : `src/main.py` (RSS → JSON structuré via Gemini (cascade de modèles, thinking_budget=0) → Piper TTS (lameenc) puis edge-tts en repli, audio optionnel → validation `schemas/cyberpulse.schema.json`) ; toute étape incomplète → `exit 1`. Workflow `cyberpulse.yml` : job `generate` (secrets, lecture seule) → artefact → job `publish` (écriture, sans secrets) → job `alert` (issue). Le front accepte les formats v1 et v2 de `data.json`.
- Breakpoints : nav burger ≤ 960 px ; sections/séquence ≤ 768 px ; grilles 1 col ≤ 640 px.

## Docs

`docs/MAINTENANCE.md` (opérations courantes), `DECISIONS_TECHNIQUES.md` (D1-D13), `DIRECTION_ARTISTIQUE.md`, `RAPPORT_TESTS.md`, `RAPPORT_SECURITE.md`, `SCORING.md`, `CONTENU_A_VALIDER.md` (points encore ouverts : LinkedIn, dates des certifications, droits THN).
