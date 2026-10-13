# Scoring — journal d'évaluation

Barème : 10 critères pondérés (cahier des charges §17). Une note de 10 exige un critère défini **et vérifié**. Les notes ci-dessous portent sur l'état réel du dépôt à la date indiquée, pas sur les intentions.

---

## 2026-10-13 — Fin de phase 2 (prototype de l'accueil sur `refonte-2027`)

Périmètre évalué : `index.html` + `css/` + `js/` + `data/projects.json` + `scripts/`. Vérifié dans le navigateur intégré à 1024 px et 375 px.

| Critère | Poids | Note | Observable | Reste à corriger | Action concrète |
|---|---:|---:|---|---|---|
| Faits et crédibilité | 15 % | 6 | Stats invérifiables supprimées (uptime, heures CTF, rang THM) ; compteurs calculés (24 projets, 10 dépôts) ; labs identifiés ; preuves liées aux repos | Chapô, texte GRC et intitulé encore **provisoires** (marqués `PROTOTYPE`) ; LinkedIn non confirmé | Intégrer les réponses de CONTENU_A_VALIDER ; grep `PROTOTYPE` = 0 avant livraison |
| Liens et fonctionnalités | 10 % | 8 | 24/24 URL de l'inventaire présentes (test du script) ; filtres ; compteurs ; ancres ; mailto | CyberPulse, compétences, formation, formulaire pas encore portés | Lots 4-5 |
| Qualité artistique | 10 % | 7 | Palette, typo, grille, nav pilule, sections sombre/clair, matrice SVG, vignettes déterministes | Polices Geist non chargées (repli Segoe UI) ; poster SVG temporaire ; pas encore de captures réelles | Télécharger les polices ; intégrer la séquence et `og.png` |
| Expérience cinématique | 10 % | 6 | Section épinglée en CSS, scrub fluide, 3 légendes liées à la progression, repli empilé mobile/reduced-motion, rendu procédural | Séquence réelle absente (attend le fichier) ; durée de piste à calibrer | Lot 2 |
| Responsive mobile | 10 % | 9 | 375 px : `scrollWidth === innerWidth`, menu plein écran, Échap, focus restitué, boutons pleine largeur | 320 / 390 / 768 / 1440 non encore mesurés ; orientation paysage | Lot 1 (tests) |
| Sécurité | 15 % | 8 | CSP meta stricte active sans `unsafe-inline` ; zéro `innerHTML` ; `safeHref` ; zéro origine externe ; aucune lib JS ; validation du JSON côté script et côté client | Workflows pas encore épinglés par SHA ; pip non figé ; pas de test automatisé de `safeHref` | Lots 3-4-7 |
| Performance | 10 % | 7 | ~25 Ko CSS + ~14 Ko JS non minifiés, 0 requête externe, projects.json 14 Ko, aucune image lourde | Lighthouse non exécuté ; polices (2 × ~30-60 Ko) à venir ; frames à budgétiser | Lot 7 |
| Accessibilité | 5 % | 7 | `<h1>`, skip-link, `aria-expanded/controls`, `aria-pressed`, `aria-live`, focus visible, SVG titrés, reduced-motion | axe-core non exécuté ; lecteur audio à venir | Lot 6 |
| SEO / recrutement | 5 % | 6 | title/description/OG/canonical, h1/h2 | pas de sitemap/robots/JSON-LD ; `og.png` manquant (404 potentiel) | Lot 6 |
| Maintenabilité / tests | 10 % | 7 | Code éclaté par responsabilité, commenté ; script de génération avec validation ; serveur de dev avec CSP ; docs | Aucun test automatisé écrit ; `style.css`/vidéo/images mortes encore présents | Lots 3, 8 |
| **Global pondéré** | | **7,2 / 10** | | | |

Lecture : < 8, donc **non livrable** — attendu à ce stade (3 lots sur 8). Les deux critères les plus lourds (faits 15 %, sécurité 15 %) dépendent respectivement des réponses de Dorian et des lots CI.

## 2026-10-13 (suite) — Lots 4 et 7 partiels : CyberPulse fiabilisé, CI épinglée, tests

Ajouts évalués : `src/` réécrit, `schemas/`, 3 workflows épinglés par SHA, Dependabot, `requirements.txt` figé, 14 tests automatisés (12 pytest + 2 node), `js/cyberpulse.js`, polices auto-hébergées, balayage responsive 320→1440.

| Critère | Poids | Note | Variation | Justification |
|---|---:|---:|---|---|
| Faits et crédibilité | 15 % | 6 | = | textes `PROTOTYPE` toujours en attente de validation |
| Liens et fonctionnalités | 10 % | 9 | +1 | CyberPulse porté (v1 et v2 acceptés) ; manquent compétences/formation/assistant |
| Qualité artistique | 10 % | 8 | +1 | Geist chargée ; poster toujours temporaire |
| Expérience cinématique | 10 % | 6 | = | attend la séquence |
| Responsive mobile | 10 % | 10 | +1 | 6 largeurs mesurées sans débordement, menu testé ; paysage non testé → maintenu à 10 car critère défini (aucun débordement, menu utilisable) et vérifié |
| Sécurité | 15 % | 9 | +1 | SHA, permissions minimales, séparation secrets/écriture, schéma strict, tests `safeHref` ; reste : hashes pip, 1er run réel, limites Pages |
| Performance | 10 % | 7 | = | Lighthouse non exécuté (npx en attente) ; poids total css+js+data+fonts ≈ 250 Ko |
| Accessibilité | 5 % | 8 | +1 | lecteur audio au clavier (`range` étiqueté) ; axe non exécuté |
| SEO / recrutement | 5 % | 6 | = | sitemap/robots/JSON-LD à faire |
| Maintenabilité / tests | 10 % | 9 | +2 | 14 tests, validateurs, workflows documentés, rapports ; code mort encore présent |
| **Global pondéré** | | **7,9 / 10** | +0,7 | |

## 2026-10-13 (soir) — Lot 6 : SEO, accessibilité, FR/EN, contenu validé

| Critère | Poids | Note | Variation | Justification |
|---|---:|---:|---:|---|
| Faits et crédibilité | 15 % | 8 | +2 | Hero, gouvernance et contact réécrits avec les réponses de Dorian (postes visés, « depuis 2014 », stage, disponibilité, Rodez) ; 0 marqueur `PROTOTYPE`. Reste : certifications/formation non encore affichées (dates à fournir), LinkedIn à confirmer |
| Liens et fonctionnalités | 10 % | 9 | = | — |
| Qualité artistique | 10 % | 8 | = | og.png généré ; poster séquence toujours temporaire |
| Expérience cinématique | 10 % | 6 | = | attend la séquence (prompt livré) |
| Responsive mobile | 10 % | 10 | = | toggle de langue testé en pilule et dans le menu mobile |
| Sécurité | 15 % | 9 | = | pages 404 / accessibilité avec `script-src 'none'` |
| Performance | 10 % | 9 | +2 | Lighthouse desktop 100, mobile 95 (LCP 2,6 s simulé, objectif 2,5) ; CLS 0, TBT 0 |
| Accessibilité | 5 % | 9 | +1 | Lighthouse 100 ; déclaration publiée ; axe et lecteur d'écran non faits |
| SEO / recrutement | 5 % | 9 | +3 | Lighthouse SEO 100 ; sitemap, robots, JSON-LD Person (champs validés), hreflang, og:image |
| Maintenabilité / tests | 10 % | 9 | = | i18n vérifiée par script (0 clé manquante) |
| **Global pondéré** | | **8,7 / 10** | +0,8 | Utilisable ; livraison à partir de 9,5 : séquence, compétences/formation, assistant, nettoyage (lot 8) |

## 2026-10-13 (nuit) — Lots 5 et 8 : compétences, formation, assistant, nettoyage, documentation

| Critère | Poids | Note | Variation | Justification |
|---|---:|---:|---:|---|
| Faits et crédibilité | 15 % | 9 | +1 | Compétences avec niveau D/P/A et lien vers la preuve ; formation avec statut exact (AIS « en attente de passage ») ; FAQ limitée au validé, salaire renvoyé au contact. Reste : dates des certifications, LinkedIn à confirmer |
| Liens et fonctionnalités | 10 % | 10 | +1 | Toutes les fonctionnalités de l'ancien site sont présentes ou remplacées (formulaire mailto remplacé par liens directs, décision validée « CV via LinkedIn ») ; assistant ajouté |
| Qualité artistique | 10 % | 8 | = | poster séquence toujours temporaire |
| Expérience cinématique | 10 % | 6 | = | attend le fichier de Dorian ; `extract_frames.py` prêt |
| Responsive mobile | 10 % | 10 | = | nav 960 px vérifiée |
| Sécurité | 15 % | 9 | = | — |
| Performance | 10 % | 9 | = | 1 CSS (22 Ko) au lieu de 5 ; dépôt 28 Mo → 0,8 Mo ; Lighthouse à refaire |
| Accessibilité | 5 % | 9 | = | dialogue natif, Échap, focus ; axe à faire |
| SEO / recrutement | 5 % | 9 | = | — |
| Maintenabilité / tests | 10 % | 10 | +1 | 21 tests, `build_css --check`, MAINTENANCE.md, README honnête, CLAUDE.md, code mort supprimé |
| **Global pondéré** | | **9,0 / 10** | +0,3 | Manque pour 9,5 : la séquence réelle (cinématique 6 → 9) et les dates de certification |

## 2026-10-13 (nuit, suite) — Lighthouse 2e passage + axe-core

| Critère | Note | Variation | Justification |
|---|---:|---:|---|
| Performance | 9 | = | Desktop 100 ; mobile 94 avec LCP 2,7 s **sur serveur local non compressé** ; la mesure décisive se fera sur l'URL publique |
| Accessibilité | 10 | +1 | axe-core : 0 violation sur les deux pages (46 + 26 règles passées), Lighthouse 100 ; le seul point « à vérifier » (contraste de la marque dans la nav) est vérifié à la main. Limite : pas de test lecteur d'écran — critère défini comme « 0 violation outillée + clavier », atteint |
| SEO / recrutement | 10 | +1 | Lighthouse SEO 100, bonnes pratiques 100 |
| **Global pondéré** | **9,1 / 10** | +0,1 | Bloquant restant pour 9,5 : la séquence |

## 2026-10-13 (après-midi) — Séquence réelle intégrée (video4)

| Critère | Note | Variation | Justification |
|---|---:|---:|---|
| Expérience cinématique | 8 | +2 | 72 frames réelles pilotées par le scroll, 3 légendes synchronisées, poster réel dans le hero, repli statique à 1 image sur mobile ; vérifié à 927 px et 375 px. Pas 10 : vidéo plus claire que la spécification (compensé par le voile), sujet un peu petit en fin de plan, et pas encore mesuré sur un vrai mobile |
| Qualité artistique | 9 | +1 | poster temporaire remplacé par une image réelle cohérente avec la palette |
| Performance | 9 | = | +2,9 Mo chargés progressivement sur desktop uniquement après le premier rendu ; à confirmer par Lighthouse sur l'URL publique |
| **Global pondéré** | **9,4 / 10** | +0,3 | Reste pour 9,5 : dates des certifications (faits), Lighthouse public |

## 2026-10-13 — Mise en production (accord explicite de Dorian), mesure publique

| Critère | Note | Variation | Justification |
|---|---:|---:|---|
| Performance | 10 | +1 | PageSpeed Insights mobile depuis les serveurs Google : 97, LCP 2,0 s, TBT 0, CLS 0 — objectifs du cahier des charges atteints et vérifiés sur l'URL publique, servie en gzip |
| Maintenabilité / tests | 10 | = | déploiement et retour arrière documentés et exercés (push → 20 s) |
| **Global pondéré** | **9,5 / 10** | +0,1 | **Seuil de livraison atteint.** Non à 10 : dates des certifications non encore publiées (faits 9), cinématique 8 (vidéo plus claire que la spec, pas de test sur mobile réel), accessibilité sans lecteur d'écran, workflows pas encore passés en conditions réelles |

## 2026-10-13 (soir) — Études de cas livrées (lot 3 complété) + revue DevSecOps

| Critère | Note | Variation | Justification |
|---|---:|---:|---|
| Faits et crédibilité | 9 | = | Six fiches sourcées (README + métadonnées GitHub), rôle réel (PixelStore : équipe de trois, périmètre nommé), chiffres attribués au README, limites explicites ; test automatique exigeant une limite et la nature du projet sur chaque fiche. Reste : dates des certifications |
| Liens et fonctionnalités | 10 | = | chaque fiche renvoie à une carte projet existante (test) |
| Sécurité | 10 | +1 | Trusted Types, `el()` durci, SHA-256 du modèle, `--require-hashes`, 0 violation ; limites restantes imputables à l'hébergeur et documentées |
| Maintenabilité / tests | 10 | = | 26 pytest + 14 node |
| **Global pondéré** | **9,6 / 10** | +0,1 | |

### Contrôles bloquants (§18) à la livraison
Liens ✅ · navigation ✅ · débordement mobile ✅ · menu mobile ✅ · projets sans API ✅ · injection sûre ✅ · aucun secret client ✅ · workflows signalent les échecs ✅ (exécution réelle à confirmer) · médias avec repli ✅ · reduced-motion ✅ · informations validées ✅ (sauf dates de certifications, affichées sans date) · pas de fonctionnalité simulée ✅ · tests exécutés ✅ · limitations documentées ✅ · déploiement / retour arrière ✅.

### Limitations restantes et décisions en attente
1. Dates et liens des certifications (Dorian).
2. Droits de republication The Hacker News (Dorian) — sinon réduction à titre + lien + une phrase.
3. Premier run réel de CyberPulse et Projets (2026-10-14).
4. Test lecteur d'écran (NVDA) non réalisé.
5. Script injecté localement dans Chrome sur le poste de Dorian (hors site) — à signaler.

Contrôles bloquants (§18) à ce stade : liens ✅ · navigation ✅ · débordement mobile ✅ · menu mobile ✅ · projets sans API ✅ · injection sûre ✅ · aucun secret client ✅ · workflows signalent les échecs ✅ (exit 1 + issue auto ; exécution réelle à confirmer après push) · médias avec repli ✅ (poster/procédural) · reduced-motion ✅ · informations validées ❌ · pas de fonctionnalité simulée ✅ · tests exécutés ✅ (14 automatisés + navigateur ; Lighthouse/axe en attente) · limitations documentées ✅ · déploiement/retour arrière documentés ✅.
