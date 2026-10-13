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

### Non testé à ce stade (à faire)

- Lighthouse à refaire après la concaténation CSS (objectif : LCP mobile < 2,5 s).
- axe-core (`npx @axe-core/cli`) : non exécuté (Lighthouse accessibilité = 100, mais il ne couvre pas tout).
- `prefers-reduced-motion` : non émulable dans le navigateur intégré ; à tester dans Chrome DevTools (Rendering → Emulate CSS media feature).
- Lecture audio effective (clic sur Lecture) : non déclenchée automatiquement (autoplay policy) ; à tester à la main.
- Lecteur d'écran (NVDA) et navigation clavier complète.
- Orientation paysage mobile.
- Workflows GitHub Actions : syntaxe validée, **exécution non testée** (impossible hors GitHub) ; premier run réel à surveiller après push.
- Pipeline complet avec appel IA réel (clés non disponibles localement) ; seules les fonctions sont testées avec des réponses simulées.
