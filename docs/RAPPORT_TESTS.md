# Rapport de tests

Journal des tests réellement exécutés, avec date, outil et résultat. Ce qui n'a pas été testé est dit explicitement.

---

## 2026-10-13 — Lots 1-4 et 7 (partiel), branche `refonte-2027`

Environnement : Windows 11, Python 3.14.3, Node 22 (node --test), navigateur intégré Claude (Chromium), serveur `scripts/serve.py` avec CSP en mode rapport.

### Tests automatisés

| Suite | Commande | Résultat |
|---|---|---|
| Générateur de projets (titres, recollage d'accents, parsing README, marqueur ⭐, non-régression des 24 URL) | `python -m pytest tests/test_build_projects.py` | **5 passés** |
| Pipeline CyberPulse (RSS nettoyé + URL refusées, échec réseau → liste vide, JSON clôturé/invalide, traduction incomplète → erreur, bornes du script, schéma : URL hors THN et nombre d'articles refusés, `main()` retourne 1 sans articles) | `python -m pytest tests/test_cyberpulse.py` | **7 passés** |
| `safeHref` (accepte https/mailto/ancres/relatif ; refuse `javascript:`, `data:`, `http:` externe, non-string) | `node --test tests/dom.test.mjs` | **2 passés** |
| Validation des données générées | `python scripts/validate_data.py projects` | ok : 24 projets, 10 repos |
| Validation du `data.json` **actuel** (format v1 de l'ancien pipeline) | `python scripts/validate_data.py cyberpulse` | **refusé** (attendu : `version` manquant). Le front accepte v1 et v2 ; le schéma ne s'applique qu'aux nouvelles générations |
| Syntaxe des 3 workflows + dependabot | `yaml.safe_load` | ok |
| Scraper RSS en conditions réelles | `python src/scraper.py` | 3 articles THN récupérés via feedburner |
| Recherche d'API DOM dangereuses | `grep innerHTML\|eval(\|document.write js/` | 0 usage (2 occurrences, toutes deux dans des commentaires « sans innerHTML ») |

### Tests navigateur (manuels, outillés)

| Largeur | Débordement (`scrollWidth === clientWidth`) | Nav | Séquence | Grille projets |
|---|---|---|---|---|
| 320 × 640 | aucun | burger | statique (empilée) | 1 col |
| 375 × 812 | aucun | burger ; ouverture, fermeture par lien et par Échap, focus rendu au bouton, scroll bloqué derrière | statique | 1 col |
| 390 × 844 | aucun | burger | statique | 1 col |
| 768 × 1024 | aucun | burger | statique | 2 col |
| 1024 (pane) | aucun | liens | épinglée, légendes 01→03 suivent le scroll, barre de progression | 3 col |
| 1440 × 900 | aucun | liens | épinglée | 3 col, conteneur 1 280 px |

Autres vérifications navigateur :
- CSP (`Content-Security-Policy-Report-Only` identique à la meta) : **aucune violation** en console sur l'ensemble de la page.
- Polices Geist / Geist Mono : `document.fonts` → `loaded`.
- Projets : 24 cartes, 5 filtres + « Tous », compteurs 24 / 10, référentiels calculés.
- CyberPulse : section visible avec le `data.json` v1 en place (date « 11 octobre 2026 », 3 articles, mention de source), bouton lecture avec `aria-label`, curseur `<input type=range>` étiqueté.
- Matrice : 25 cellules + 3 points apparaissent à l'entrée dans le viewport.
- Requêtes réseau : **0 requête externe** ; seul 404 attendu : `data/sequence.json` (frames non encore livrées — repli procédural actif).

### Lighthouse (2026-10-13, lot 7, avant le lot 6 ; `npx lighthouse`, Chrome headless, serveur local)

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---|---|---|---|
| Desktop (preset desktop) | **100** | **100** | 96 | **100** | 0,5 s | 0,6 s | 0 ms | 0 |
| Mobile (simulation 4G lente, CPU ×4) | **95** | **100** | 96 | **100** | 2,2 s | **2,6 s** | 0 ms | 0 |

Résultats de laboratoire (simulation), pas des données terrain. Points relevés :
- « Erreurs en console » (bonnes pratiques 96) : le 404 de `data/sequence.json` → corrigé au lot 6 (manifeste vide livré).
- LCP mobile 2,6 s, légèrement au-dessus de l'objectif de 2,5 s : dû aux 5 feuilles CSS bloquantes (« render-blocking », 1,15 s simulées). Piste : concaténer les CSS en un fichier et inliner `tokens.css` + le CSS critique du hero ; minification (−6 Ko CSS, −3 Ko JS). À refaire après le lot 8.
- bfcache : 2 raisons d'échec (non détaillées par le rapport JSON) ; à investiguer dans DevTools.

### Bascule FR/EN (lot 6, navigateur)
- Clic « EN » : `<html lang="en">`, titre traduit, 71 clés appliquées (hero, légendes, gouvernance, filtres « All / GRC & compliance… », badges « Showcase (private code) », source CyberPulse, date « 11 October 2026 »), choix mémorisé (`localStorage`), boutons `aria-pressed` cohérents. Retour « FR » : tout restauré. Vérification automatique : **0 clé HTML sans traduction**.
- Contenu généré (descriptions de projets, articles) reste en français et porte `lang="fr"`.

### Lots 5 et 8 (2026-10-13, soir)

| Suite | Résultat |
|---|---|
| `tests/assistant.test.mjs` : normalisation, 6 questions typiques → bonne entrée, question hors périmètre sous le seuil, FR/EN et liens sûrs pour chaque entrée de la FAQ | **4 passés** |
| `tests/test_build_css.py` : `css/site.css` à jour, minification, pages liées au seul fichier généré | **3 passés** |
| Total automatisé | **15 pytest + 6 node = 21 passés** |
| Navigateur : sections Compétences (5 groupes, 39 items, légende) et Formation (9 lignes, statuts) rendues ; assistant : ouverture, question « est-il disponible en remote ? » → entrée « disponibilité », focus dans le dialogue, fermeture ; bascule EN re-rend compétences, formation, FAQ | ok |
| Nav : à 927 px, 6 liens + langue + CTA ne tenaient plus → burger relevé à 960 px ; vérifié à 1 280 px (une ligne) | ok |
| Après concaténation CSS : une seule feuille chargée, aucun 404, rendu identique | ok |

### Lighthouse — 2e passage (2026-10-13, après lots 5-8, CSS concaténé)

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---|---|---|---|
| Desktop | **100** | **100** | **100** | **100** | 0,5 s | 0,6 s | 0 ms | 0 |
| Mobile (4G lente simulée, CPU ×4) | **94** | **100** | **100** | **100** | 2,2 s | **2,7 s** | 0 ms | 0 |

- Bonnes pratiques 96 → 100 (plus aucune erreur console).
- LCP mobile 2,7 s (simulé) : seul `site.css` est bloquant (155 ms simulées) ; l'essentiel vient du **serveur local qui ne compresse pas** (« document latency : 14 Ko à gagner ») — GitHub Pages sert en gzip/brotli, le résultat réel devrait passer sous 2,5 s. À confirmer sur l'URL publique après mise en production (c'est la mesure qui compte).
- bfcache : les deux raisons sont le `Cache-Control: no-store` de `scripts/serve.py` (dev uniquement), absent en production.
- Reflow forcé (79 ms) dans `reveal.js` : corrigé (lecture de toutes les positions avant les écritures).

### axe-core 4.14 (2026-10-13, exécuté dans le navigateur, règles WCAG 2.0/2.1/2.2 A+AA + bonnes pratiques)

`npx @axe-core/cli` a échoué (ChromeDriver 155 vs Chrome 154 installé) ; axe a donc été injecté localement (`.axe-tmp/axe.min.js`, hors dépôt) dans les pages servies par le serveur de dev.

| Page | Violations | Règles passées | À vérifier manuellement |
|---|---:|---:|---|
| `index.html` (état initial, FR) | **0** | 46 | 1 : contraste de `.nav__brand`, indéterminable par l'outil à cause du pseudo-élément flouté de la pilule. Vérifié à la main : `#F4F5F2` sur un fond ≥ `rgba(11,35,34,.72)` au-dessus de `#061716` → ≥ 15 : 1 |
| `accessibilite.html` (copie sans CSP, le script y est interdit) | **0** | 26 | idem (même nav) |

Non couvert par axe : états ouverts (menu mobile, dialogue de l'assistant), version EN, lecteur d'écran.

### Séquence réelle (2026-10-13, video4 → 72 frames WebP)

| Vérification | Résultat |
|---|---|
| Extraction (`extract_frames.py`) | 72 frames 1280×720, 2,89 Mo, poster 13 Ko, poster final 49 Ko ; avertissement « première image claire (66/255) » accepté avec `--force` |
| Desktop 927 px : chargement | 72/72 frames chargées (2 975 Ko) après le premier rendu, aucune erreur |
| Desktop : scrub à 0 %, 50 %, 98 % | image correspondante affichée, légende 01/02/03 active, texte lisible grâce au voile renforcé et au cadrage ancré à droite |
| Mobile 375 px | classe `seq--static`, **1 seule frame chargée** (la dernière), légendes empilées |
| Tests automatisés | 15 pytest + 6 node, inchangés, verts |

### Mise en production — 2026-10-13, merge `14c6b89` puis `942ee1a` (preload polices, poster 640 px)

| Vérification sur https://dow08.github.io/-Mon_Portfolio/ | Résultat |
|---|---|
| Déploiement Pages | nouvelle version servie 20 s après le push ; HTML public identique au local (diff = 0) |
| Ressources (`/`, site.css, projects.json, profile.json, frames, og.png, accessibilite.html, robots, sitemap, cyber-news/data.json) | toutes en 200 ; gzip + HSTS (`max-age=31556952`) ; `Cache-Control: max-age=600` imposé par GitHub |
| Navigateur intégré sur l'URL publique | 24 cartes, 5 groupes de compétences, 9 lignes de formation, flash info du 11/10, 72 frames, polices chargées, assistant présent, 0 erreur console, 0 ressource en échec |

**Lighthouse local sur l'URL publique — mesure faussée.** Les runs depuis cette machine (desktop 99, mobile 90-91, LCP 3,0-3,1 s) montraient un **script de 130 Ko, bloquant 750 ms, servi depuis `dow08.github.io/<nom aléatoire>`**. Vérifié : il n'est **pas** dans le HTML publié (curl = identique au local), l'URL répond 404, le navigateur intégré ne le voit pas, et il persiste avec `--disable-extensions`. Conclusion : injection locale dans Chrome sur ce poste (module de sécurité ou VPN), invisible pour les visiteurs. À signaler à Dorian pour sa propre machine.

**PageSpeed Insights (Lighthouse 13.5 hébergé par Google, Moto G Power émulé, 4G lente) — mesure de référence, 2026-10-13 12:23 UTC+2 :**

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO | FCP | LCP | TBT | CLS | Speed Index |
|---|---:|---:|---:|---:|---|---|---|---|---|
| Mobile | **97** | **100** | **100** | **100** | 0,9 s | **2,0 s** | 0 ms | 0 | 4,2 s |

Objectifs du cahier des charges (LCP ≤ 2,5 s, INP/TBT ≤ 200 ms, CLS ≤ 0,1) : **atteints** en laboratoire. Pistes restantes signalées par PSI, non bloquantes : durée de cache (imposée par GitHub Pages), 300 ms de CSS bloquant (inlining du CSS critique possible, au prix d'un hash CSP), poster (31 Kio), deux animations non composées (matrice SVG : `opacity`/`transform` sur des `<rect>`). Les données terrain (CrUX) n'existent pas encore : site trop récent.

### Non testé à ce stade (à faire)

- PageSpeed Insights desktop (quota API anonyme épuisé ce jour ; à lancer depuis https://pagespeed.web.dev).
### Premiers passages réels des workflows (2026-10-13, déclenchés à la main par `workflow_dispatch`)

| Run | Résultat | Détail |
|---|---:|---|
| Projets `38383534876` | **succès** | 24 projets régénérés, aucun changement de contenu → pas de commit (comportement attendu) |
| CyberPulse `38383538686` | échec | script radio : JSON du LLM avec retours à la ligne bruts → `parse_json` strict ; **issue #1 ouverte automatiquement** (la chaîne d'alerte fonctionne) |
| CyberPulse `38384502055` | échec | JSON tronqué : Gemini 2.5 compte ses tokens de réflexion dans `max_output_tokens` → `thinking_budget=0`, limites relevées |
| CyberPulse `38384737825` | échec | traduction et script OK ; **edge-tts 403** (`speech.platform.bing.com` refuse les adresses GitHub Actions, 3 tentatives) — cause probable de l'échec du 12/10 déjà |
| CyberPulse `38385053947` | **succès** | flash du 13/10 publié **en texte seul**, `audio_file: null`, mention dans le résumé du job et sur le site ; issue #1 fermée avec explication |

Constat annexe : le secret `OPEN_AI_KEY` est vide (`OPENAI_API_KEY:` vide dans l'environnement du job) ; le pipeline tourne entièrement sur Gemini. À corriger ou à assumer (Dorian).

Décision en attente : remplacement de la synthèse vocale (voir DECISIONS_TECHNIQUES D7).
- `prefers-reduced-motion` : non émulable dans le navigateur intégré ; à tester dans Chrome DevTools (Rendering → Emulate CSS media feature).
- Lecture audio effective (clic sur Lecture) : non déclenchée automatiquement (autoplay policy) ; à tester à la main.
- Lecteur d'écran (NVDA) et navigation clavier complète.
- Orientation paysage mobile.
- Workflows GitHub Actions : syntaxe validée, **exécution non testée** (impossible hors GitHub) ; premier run réel à surveiller après push.
- Pipeline complet avec appel IA réel (clés non disponibles localement) ; seules les fonctions sont testées avec des réponses simulées.
