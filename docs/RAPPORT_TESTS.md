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

### Non testé à ce stade (à faire)

- Lighthouse (performance, LCP/INP/CLS) et axe-core : nécessitent `npx` (téléchargement de paquets npm) — **en attente d'autorisation**.
- `prefers-reduced-motion` : non émulable dans le navigateur intégré ; à tester dans Chrome DevTools (Rendering → Emulate CSS media feature).
- Lecture audio effective (clic sur Lecture) : non déclenchée automatiquement (autoplay policy) ; à tester à la main.
- Lecteur d'écran (NVDA) et navigation clavier complète.
- Orientation paysage mobile.
- Workflows GitHub Actions : syntaxe validée, **exécution non testée** (impossible hors GitHub) ; premier run réel à surveiller après push.
- Pipeline complet avec appel IA réel (clés non disponibles localement) ; seules les fonctions sont testées avec des réponses simulées.
