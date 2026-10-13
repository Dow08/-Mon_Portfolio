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

Contrôles bloquants (§18) à ce stade : liens ✅ · navigation ✅ · débordement mobile ✅ · menu mobile ✅ · projets sans API ✅ · injection sûre ✅ · aucun secret client ✅ · workflows signalent les échecs ✅ (exit 1 + issue auto ; exécution réelle à confirmer après push) · médias avec repli ✅ (poster/procédural) · reduced-motion ✅ · informations validées ❌ · pas de fonctionnalité simulée ✅ · tests exécutés ✅ (14 automatisés + navigateur ; Lighthouse/axe en attente) · limitations documentées ✅ · déploiement/retour arrière documentés ✅.
