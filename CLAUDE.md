# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Portfolio one-page de Dorian Poncelet (cybersécurité), hébergé sur GitHub Pages : https://dow08.github.io/-Mon_Portfolio/ (repo `Dow08/-Mon_Portfolio`, branche `main`). Contenu et commentaires en français.

## Commandes

```bash
# Serveur local (site statique, aucun build)
python -m http.server 8080

# Pipeline CyberPulse en local (nécessite OPENAI_API_KEY ou GEMINI_API_KEY)
pip install -r requirements.txt
cd src && python main.py

# Tester isolément le scraper / la synthèse vocale
cd src && python scraper.py
cd src && python audio_gen.py
```

Pas de tests, pas de linter, pas de bundler. Le déploiement est automatique à chaque push sur `main` (GitHub Pages natif, « Deploy from a branch », racine).

## Architecture

- **`index.html` est tout le site** : HTML + CSS (`<style>`) + JS (`<script>` en fin de body) sont inline. `style.css` n'est **pas** chargé : c'est du code mort hérité d'une ancienne version, il ne faut pas l'éditer en croyant modifier le site.
- **Section Projets générée côté client** (`renderProjects()`) : appelle l'API GitHub publique pour lister les repos de `Dow08` (hors forks et hors ce repo), lit le `README.md` de chacun et crée une carte par section `### slug`, seulement si un dossier racine du même nom existe dans le repo. Sinon, le repo donne une seule carte. Conventions lues dans les README des autres repos : `Stack: a, b, c` donne les tags, une ligne commençant par `⭐` met la carte « à la une ». Cache `sessionStorage` de 10 min. Modifier les projets affichés se fait donc dans les **autres repos**, pas ici. `CATEGORY_LABELS` mappe nom de repo vers libellé.
- **CyberPulse** : `.github/workflows/daily_cron.yml` (cron 08:00 UTC) exécute `src/main.py`, qui scrape TheHackerNews (`scraper.py`), traduit et écrit un script radio via OpenAI `gpt-4o-mini`, avec fallback sur une liste de modèles Gemini (`call_ai`), puis le lit en TTS avec edge-tts (`audio_gen.py`). Le résultat est écrit dans `cyber-news/data.json` + `cyber-news/audio/latest_briefing.mp3`, commités par le bot. Le front lit ces fichiers (`renderCyberPulse()`) et masque la section si `data.json` est absent. Ces deux fichiers sont générés : ne pas les éditer à la main. Secrets du repo : `OPEN_AI_KEY`, `GEMINI_KEY`, exposés au script sous `OPENAI_API_KEY` / `GEMINI_API_KEY`.
- **`deploy.yaml`** ne déploie rien malgré son nom : c'est un scan Trivy non bloquant (SARIF vers l'onglet Security).
- **Animations** : GSAP + ScrollTrigger chargés en `defer` depuis cdnjs. Le code qui en dépend passe par `whenGsapReady()`. Le défilement d'ancre est fait en JS (`smoothScrollTo`), pas en CSS `scroll-behavior`, pour rester fiable avec les ScrollTriggers. Tout effet doit respecter la constante `REDUCED` (prefers-reduced-motion) et le bloc CSS correspondant. `.hero-title-container` ne doit jamais être transformé en JS : GSAP n'anime que x/y des noms enfants.
- La vidéo hero (`assets/Video/cyber_hero.mp4`, ~19 Mo) n'est attachée en JS qu'au-dessus de 768px de large.
- Les surcharges de contraste AA sont regroupées dans un bloc CSS « ACCESSIBILITÉ » qui redéfinit des couleurs plus haut dans le fichier : vérifier ce bloc avant de changer une couleur de texte.

## Audit

`AUDIT.md` liste les problèmes connus (responsive mobile cassé, XSS via `innerHTML` sur data.json, CSP annoncée mais absente, rate-limit API GitHub, etc.) et un plan d'action priorisé.
