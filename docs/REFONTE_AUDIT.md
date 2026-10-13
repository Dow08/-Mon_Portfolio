# Refonte 2027 — Diagnostic initial (phase 1)

Date : 2026-10-13 · Dépôt inspecté : `Dow08/-Mon_Portfolio`, commit `ec8a146` (HEAD de `main`, identique à l'audit du 02/10) · Site : https://dow08.github.io/-Mon_Portfolio/

Ce document distingue systématiquement : **constaté** (vérifié sur le code ou le site), **proposé** (recommandation), **à valider** (dépend de l'utilisateur). Aucun fichier de production n'a été modifié pendant cette phase.

---

## 1. État initial du projet (constaté)

| Élément | Constat |
|---|---|
| Stack | HTML/CSS/JS vanilla, **aucun framework, aucun bundler, aucun gestionnaire de paquets JS**. Un seul fichier `index.html` (2 398 lignes : ~930 de CSS, ~680 de HTML, ~750 de JS). |
| Hébergement | GitHub Pages, « Deploy from a branch » (`main`, racine), `.nojekyll` présent. Pas de domaine personnalisé. |
| Feuilles de style | `style.css` (2 091 lignes) **n'est référencé nulle part** : code mort confirmé (`grep` sur `index.html`, aucun `<link>`). |
| Animations | GSAP 3.12.2 + ScrollTrigger via cdnjs (`defer`), sans SRI. Animations maison en rAF (curseur, parallax, « déchiffrement » des titres), IntersectionObserver pour les reveals. |
| Polices / icônes | Google Fonts (Space Grotesk, JetBrains Mono), Font Awesome 6.4.0 via cdnjs (sans SRI). |
| Médias | `assets/Video/cyber_hero.mp4` : **19,5 Mo**, H.264, 1664×1248, 24 fps, 5,04 s (boucle). `assets/images/image1.png` : 7,9 Mo, **inutilisé**. `cyber-shield.png` : 1 Mo, utilisé seulement en Open Graph. |
| Projets | Générés **côté client** par `renderProjects()` : `GET /users/Dow08/repos` → pour chaque repo non-fork, `README.md` brut + `GET /contents/` si le README contient des `###`. 11 appels API non authentifiés par visite sans cache (mesuré). Cache `sessionStorage` 10 min. |
| CyberPulse | Workflow `daily_cron.yml` (cron `0 8 * * *`, `contents: write`) → `src/main.py` : scraping HTML de thehackernews.com → traduction + script radio (OpenAI `gpt-4o-mini`, repli Gemini) → TTS edge-tts → commit de `cyber-news/data.json` + `latest_briefing.mp3`. |
| Workflows | `deploy.yaml` = scan Trivy (`fs`, SARIF) non bloquant, mal nommé. Actions épinglées par **tag** (`checkout@v4`, `setup-python@v5`, `trivy-action@0.28.0`, `upload-sarif@v3`). |
| Secrets référencés | `OPEN_AI_KEY`, `GEMINI_KEY` (repo secrets) → exposés au script comme `OPENAI_API_KEY` / `GEMINI_API_KEY`. Aucun secret côté client. |
| Dépendances Python | `requirements.txt` non figé (`>=`), pas de lockfile, pas de Dependabot. |
| SEO | `<title>`, description, canonical, OG/Twitter complets. **Aucun `<h1>`**, pas de `robots.txt`, pas de `sitemap.xml`, pas de données structurées. |
| Formulaire de contact | Construit un `mailto:` côté client (pas de backend). Fonctionne réellement, mais dépend d'un client mail configuré. |
| Git | 243 commits, dont ~220 commits automatiques « Flash info ». Dernier commit humain : 2026-07-16. |

### État du pipeline CyberPulse au 13/10 (constaté via l'API Actions)

- Runs du 08 au 11/10 : succès.
- **Run du 12/10 : échec à l'étape « Exécution de CyberPulse »** (étapes commit/résumé sautées). Cause non lisible sans authentification (logs privés). Hypothèses à vérifier : quota API IA épuisé, changement du HTML de THN, erreur edge-tts.
- Le site affiche donc toujours le flash du 11/10 : **la défaillance est invisible pour le visiteur et pour le propriétaire** (pas de notification, badge README seulement).
- Les runs planifiés s'exécutent entre 12:51 et 17:07 UTC, jamais à 08:00 : retard normal des crons GitHub, mais la mention « 08:00 UTC » du README est inexacte.

## 2. Fonctionnalités à conserver (constaté + proposé)

| Fonctionnalité | Décision proposée | Dépendances |
|---|---|---|
| Génération automatique des cartes projets depuis GitHub (convention `### slug` + dossier + `Stack :` + `⭐`) | **Conserver la convention**, déplacer l'exécution dans une GitHub Action qui produit `data/projects.json` (cf. DECISIONS_TECHNIQUES) | API GitHub (token du workflow → 5 000 req/h) |
| Filtres par catégorie | Conserver | projects.json |
| CyberPulse (veille + audio) | **Conserver**, fiabiliser (RSS, échec explicite, validation) — à valider : droits de republication THN | OpenAI/Gemini, edge-tts |
| Compteur de repos GitHub | Conserver via projects.json (plus d'appel client) | — |
| Navigation par ancres + scroll JS | Conserver le principe, réimplémenter dans le nouveau layout | — |
| `prefers-reduced-motion` (CSS + JS) | Conserver et étendre à la séquence cinématique | — |
| Vidéo désactivée sous 769 px | Conserver le principe (chargement conditionnel des médias lourds) | — |
| Cache `sessionStorage` + repli périmé | Devient inutile si projects.json est statique ; conserver un repli « données embarquées » | — |
| Formulaire mailto | Conserver (seule option sans backend), ou remplacer par lien mailto direct — à valider | — |
| Liens Email / LinkedIn / GitHub / TryHackMe, « CV sur demande » | Conserver, valeurs à valider (cf. CONTENU_A_VALIDER) | — |
| Scan Trivy | Conserver, renommer, épingler | — |

## 3. Défauts confirmés sur le commit courant

Tous les points de `AUDIT.md` (02/10) ont été re-testés sur le site en ligne le 13/10 : **aucun n'a été corrigé, aucun n'est devenu non reproductible** (le dépôt n'a pas changé hors commits automatiques).

| # | Défaut | Sévérité | Preuve |
|---|---|---|---|
| R1 | Nav déborde à 375 px (logo chevauche « ABOUT », 3 liens hors écran) | 🔴 | `nav{padding:24px 60px}`, `.nav-links` sans media query ; capture 375 px |
| R2 | About, Contact, formulaire restent en 2 colonnes sur mobile ; texte tronqué par `section{overflow:hidden}` | 🔴 | `.about-grid`, `.contact-inner`, `.form-row` sans breakpoint |
| R3 | Cartes projets `minmax(360px)` + padding 60 px > 375 px | 🟠 | mesuré : `scrollWidth` 420 px |
| S1 | XSS via `innerHTML` sur `data.json` (titres, résumés, URL non filtrées) | 🟠 | `index.html` l.2354-2359 |
| S2 | `innerHTML` sur descriptions/stack issues des README | 🟡 | `buildCard()` l.1864-1885 |
| S3 | README annonce une CSP et `noreferrer` absents | 🟠 | 0 CSP, 1 seul `noreferrer` |
| S4 | Pas de SRI sur cdnjs (FA, GSAP) | 🟡 | l.25, 958-959 |
| S5 | Actions épinglées par tag ; workflow avec `contents: write` + secrets IA | 🟠 | `daily_cron.yml` |
| S6 | `requirements.txt` non figé | 🟡 | — |
| P1 | Pipeline : 0 article ⇒ `return` code 0 ⇒ job vert ; résumé « Succès » codé en dur | 🟠 | `main.py` l.197-199, `daily_cron.yml` |
| P2 | Scraping dépendant des classes CSS de THN | 🟠 | `scraper.py` |
| P3 | Parsing LLM par `split("[ARTICLE n]")` fragile | 🟡 | `main.py` |
| P4 | **Échec réel du 12/10 non remonté** | 🟠 | API Actions |
| F1 | Vidéo 19,5 Mo, `preload=auto` desktop, pas de `poster` | 🟠 | — |
| F2 | `image1.png` 7,9 Mo inutilisé ; OG image 1 Mo | 🟡 | — |
| F3 | 11 appels API GitHub/visite → rate-limit 60/h/IP ⇒ section vide possible | 🟠 | mesuré |
| A1 | Aucun `<h1>` ; labels non associés ; progress bar audio souris-only ; filtres sans `aria-pressed` ; titres réécrits par des glyphes aléatoires ; `cursor:none` global | 🟠 | — |
| C1 | Stat « 99 % Uptime » invérifiable ; compteur repos inclut forks/portfolio ; « © 2025 » ; 2 slugs LinkedIn différents ; textes obsolètes (« Faites défiler → », Three.js, PROJETS curée) ; nav FR/EN mélangée | 🟡 | — |
| D1 | `style.css` mort ; CSS `.scroll-progress`, `scroll-snap-align`, `.revealed` inutilisés | 🟡 | — |
| D2 | README : « 08:00 UTC » inexact ; « 100 % responsive » faux ; structure mentionne `deploy.yaml` comme déploiement | 🟡 | — |

### Défauts de l'audit non reproductibles
Aucun. Un point est à nuancer : l'audit évoquait une compromission de `trivy-action` début 2026 « de mémoire » — **non vérifié**, à confirmer avant d'en faire un argument ; l'épinglage par SHA est de toute façon recommandé.

## 4. Risques techniques de la refonte

| Risque | Impact | Mitigation |
|---|---|---|
| Perdre la génération automatique des projets en passant au statique | Cartes obsolètes | Action planifiée (quotidienne + `workflow_dispatch`) + script réutilisant **la même logique de parsing** que l'actuel, avec test de non-régression sur l'inventaire (24 cartes) |
| Séquence cinématique lourde ou saccadée | LCP dégradé, mobile injouable | Frames WebP ≤ 1280 px, ≤ 80 frames, chargement progressif, poster immédiat, désactivation sous `reduced-motion` et petits écrans, repli image fixe |
| CSP qui casse Google Fonts / cdnjs / API GitHub | Site cassé | CSP en `Content-Security-Policy-Report-Only` d'abord (meta ne le supporte pas → tester via en-tête local), puis liste blanche minimale ; auto-hébergement des polices et libs pour réduire la liste |
| Republication quotidienne de contenu THN | Juridique | Limiter à titre + lien + résumé court ; vérifier les CGU (à valider) |
| Régression des ancres/nav avec Lenis | Navigation cassée | Lenis optionnel ; ancres testées sans lib |
| Épinglage SHA erroné d'une Action | Workflow cassé | Vérifier chaque SHA sur la page release GitHub |
| Assistant IA avec backend | Coût, secrets, surface d'attaque | Option A (sans LLM) par défaut ; option B seulement après validation explicite (cf. DECISIONS) |

## 5. Dépendances : conserver / remplacer / retirer

| Dépendance | Décision proposée |
|---|---|
| GSAP + ScrollTrigger 3.12.2 (CDN) | **Conserver**, passer en 3.13.x, **auto-héberger** (`/vendor/`) → plus de CDN, CSP simple, pas de SRI nécessaire. Licence GSAP : gratuite y compris usage commercial depuis 2025 (Webflow) — à vérifier au moment de l'implémentation. |
| Font Awesome 6.4.0 (CDN, 19 Ko CSS + webfonts) | **Retirer** : remplacer par ~15 SVG inline (icônes réellement utilisées). Supprime une origine externe et un flash d'icônes. |
| Google Fonts | **Auto-héberger** 2 familles en woff2 (RGPD : Google Fonts chargé depuis les serveurs Google a été jugé non conforme en Allemagne ; l'auto-hébergement règle la question). |
| Lenis (smooth scroll) | **Optionnel**, à décider en phase DA ; ~10 Ko ; doit rester désactivable. |
| `requests`, `beautifulsoup4`, `openai`, `edge-tts`, `google-genai` | Conserver, **figer** (`==`) + `pip-compile` ou `requirements.txt` avec hashes ; Dependabot. `beautifulsoup4` peut être retiré si passage au RSS (`feedparser` ou `xml.etree`). |
| Actions GitHub | Conserver, épingler par SHA, `permissions` minimales par job. |

## 6. Contraintes d'hébergement (GitHub Pages)

- **Pas d'en-têtes HTTP personnalisés** : CSP, HSTS, `X-Frame-Options`, `Permissions-Policy` impossibles côté serveur. Seule une `<meta http-equiv="Content-Security-Policy">` est possible (pas de `frame-ancestors`, pas de `report-uri`, pas de mode Report-Only).
- **Pas de backend** : formulaire, assistant LLM, proxy API impossibles sans service tiers (Cloudflare Workers/Pages Functions, Vercel, etc.).
- Taille du site recommandée < 1 Go, bande passante « soft limit » 100 Go/mois : OK, mais la vidéo de 19,5 Mo consomme ~2 Go pour 100 visites desktop.
- Pas de rewrite : URLs propres uniquement via dossiers (`/projets/index.html`).
- Cache : `Cache-Control: max-age=600` imposé par GitHub ; le cache-busting `?t=Date.now()` actuel est donc pertinent pour `data.json`.

## 7. Décisions techniques recommandées (résumé — détail dans DECISIONS_TECHNIQUES.md)

1. **Rester en vanilla HTML/CSS/JS, sans framework ni bundler**, mais éclater `index.html` en `css/`, `js/` (modules ES), `data/`. Justification : site d'une page, hébergement statique, maintenabilité par l'utilisateur, zéro build.
2. **`data/projects.json` généré par GitHub Action** (reprend la logique actuelle), rendu immédiat sans appel API côté client.
3. **Séquence cinématique en canvas + frames WebP** (comme la référence), extraites de `cyber_hero.mp4` avec ffmpeg (disponible localement : ffmpeg 8.1.1), ~60-80 frames à 1280 px. Repli : image poster + vidéo courte compressée.
4. **CSP meta + auto-hébergement** des polices, GSAP et icônes SVG → `default-src 'self'` quasi pur, `connect-src` limité à `api.github.com` seulement si un repli client est conservé.
5. **CyberPulse** : passage au flux RSS officiel THN, sortie JSON structurée du LLM, `sys.exit(1)` sur résultat vide/incomplet, validation du schéma avant commit, résumé de job reflétant le vrai statut, notification d'échec (issue auto ou e-mail GitHub).
6. **Assistant IA : option A (déterministe, sans LLM, 100 % statique)** recommandée pour une première version ; option B (LLM + backend) non recommandée sans validation du coût et de l'hébergement.

## 8. Incertitudes restantes (à lever avant implémentation)

1. Positionnement exact (poste visé, intitulé, disponibilité, localisation) — voir CONTENU_A_VALIDER.
2. Cause de l'échec CyberPulse du 12/10 (logs privés).
3. Droits de republication des résumés THN.
4. Souhait ou non de conserver le formulaire `mailto:` vs lien direct.
5. Budget/temps pour l'assistant IA et choix A/B.
6. Source visuelle pour la séquence cinématique : réutiliser `cyber_hero.mp4` (5 s, boucle, contenu à vérifier visuellement) ou produire une nouvelle séquence ?
7. Licence GSAP à reconfirmer au moment du téléchargement.

## 9. Scoring de l'état initial (avant refonte)

| Critère | Poids | Note | Justification |
|---|---:|---:|---|
| Faits et crédibilité | 15 % | 6 | Contenu globalement honnête (« en cours », « sur demande »), mais « 99 % Uptime » invérifiable, « 100 % responsive » et « CSP » faux dans le README |
| Liens et fonctionnalités | 10 % | 8 | 24 cartes et tous les liens fonctionnent ; rate-limit peut vider la section |
| Qualité artistique | 10 % | 6 | Identité cohérente mais clichés (glitch, curseur custom, « CYBER » watermark, faux terminal) |
| Expérience cinématique | 10 % | 4 | Vidéo en boucle + parallax ; pas de narration au scroll |
| Responsive mobile | 10 % | 2 | Nav, About, Contact cassés à 375 px |
| Sécurité | 15 % | 4 | XSS via innerHTML, pas de CSP/SRI, Actions par tag |
| Performance | 10 % | 3 | 19,5 Mo de vidéo, 11 appels API, 27 Mo d'assets inutiles |
| Accessibilité | 5 % | 4 | Pas de h1, labels, focus, glyphes aléatoires |
| SEO / recrutement | 5 % | 6 | Meta OK ; pas de h1, pas de sitemap/robots |
| Maintenabilité / tests | 10 % | 4 | Monolithe 2 400 lignes, code mort, 0 test, échecs silencieux |
| **Global pondéré** | | **4,7 / 10** | Insuffisant (< 8) : refonte justifiée |
