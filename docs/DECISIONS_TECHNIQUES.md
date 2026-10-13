# Décisions techniques — refonte 2027

Date : 2026-10-13 · Statut : **proposé**, en attente de validation sur les points marqués ⚠️. Les décisions « ordinaires » (découlant du cahier des charges) seront appliquées sans validation supplémentaire.

**Validé par Dorian le 2026-10-13 :**
- Ton visuel **éditorial / supervision** (suppression curseur custom, glitch, faux terminal, watermark) → D9 confirmé.
- Séquence cinématique : **nouvelle séquence fournie par Dorian** (D3 : canvas + frames WebP ; repli CSS/SVG construit en attendant le fichier).
- Palette **inspirée de la référence** (vert profond, accent acide, sections claires) → voir DIRECTION_ARTISTIQUE.md.
- **CyberPulse conservé** et fiabilisé (D7) + **assistant option A** sans LLM (D8).

Format : contexte → options comparées → décision → conséquences.

---

## D1 — Architecture : rester en vanilla, éclater le monolithe

**Contexte.** Un seul `index.html` de 2 400 lignes, hébergé sur GitHub Pages sans build. L'utilisateur maintient le site seul.

| Option | Avantages | Inconvénients |
|---|---|---|
| A. Vanilla HTML/CSS/JS, fichiers séparés, modules ES natifs, **sans build** | Zéro dépendance, déploiement inchangé, lisible, diff clairs, maintenable sans Node | Pas de minification automatique (acceptable : < 100 Ko de JS), pas de composants |
| B. Astro (SSG) | Composants, optimisation images, build statique compatible Pages | Ajoute Node + workflow de build + 200 dépendances npm ; migration complète ; courbe d'apprentissage |
| C. Next.js / Nuxt (comme la référence) | Écosystème | Surdimensionné pour une page, export statique contraignant, maintenance lourde |

**Décision : A.** Structure cible :

```
index.html                 # HTML sémantique seul (~400 lignes)
css/tokens.css             # variables de design (palette, typo, espacements)
css/base.css  layout.css  components.css  motion.css
js/main.js                 # point d'entrée (module)
js/projects.js  cyberpulse.js  sequence.js  nav.js  assistant.js  util/dom.js
data/projects.json         # généré par Action
data/profile.json          # contenu validé (compétences, certifs, FAQ assistant)
assets/fonts/ sequence/ img/ vendor/
scripts/build_projects.py  scripts/validate_data.py  scripts/extract_frames.sh
tests/                     # pytest (scripts) + tests DOM légers (node --test + jsdom, optionnel)
docs/
```

**Conséquences.** Pas de build : les fichiers servis sont ceux du dépôt. La CSP et le cache (`?v=` sur les assets) sont gérés à la main. ⚠️ Rien à valider, sauf si l'utilisateur préfère un framework.

## D2 — Projets : `data/projects.json` généré par GitHub Action

**Contexte.** 11 appels API non authentifiés par visite ; rate-limit 60/h/IP ; rendu différé.

**Décision.** Script `scripts/build_projects.py` reprenant **à l'identique** la logique de `renderProjects()` (sections `###` + dossier racine + `Stack :` + `⭐` + `EXCLUDE_SLUGS` + `CATEGORY_LABELS`), exécuté par un workflow `projects.yml` (cron quotidien + `workflow_dispatch` + `repository_dispatch` pour déclenchement depuis les autres repos). Il utilise `GITHUB_TOKEN` (5 000 req/h), valide le schéma JSON et **échoue si 0 projet ou si un lien `tree/...` répond 404**. Il écrit aussi `repo_count` (hors forks et hors portfolio) pour le compteur du hero. Test de non-régression : la sortie doit contenir les 24 URL de `LIENS_ET_PROJETS.md`.

Côté client : `fetch('data/projects.json')` → rendu immédiat. Repli si le fetch échoue (fichier manquant) : message explicite + lien vers github.com/Dow08. Plus aucun appel à `api.github.com` depuis le navigateur → `connect-src 'self'` possible.

## D3 — Séquence cinématique : canvas + frames WebP (comme la référence)

**Contexte.** La référence utilise un `<canvas>` (classe `video-sequence`) alimenté par une séquence d'images, scrubbée via GSAP ScrollTrigger, puis des vidéos pré-rendues de 5 s en boucle pour les cartes. Le site actuel a une vidéo H.264 1664×1248 de 5 s / 19,5 Mo.

| Option | Poids estimé | Fluidité | Compatibilité | Maintenance |
|---|---|---|---|---|
| A. `<video>` + `currentTime` piloté par le scroll | 2-4 Mo (réencodé, keyframes toutes les 1 à 2 frames) | Moyenne : seek dépend du GOP, saccades Safari/iOS, décodage coûteux | Bonne, mais iOS limite le seek sans interaction | Simple |
| B. **Canvas + N frames WebP** (60-80 frames, 1280 px, q≈75) | 2-3 Mo, chargées progressivement (10 premières en priorité) | Excellente (drawImage), pas de seek | Universelle | Script ffmpeg reproductible |
| C. Séquence CSS/SVG animée (pas de média) | < 100 Ko | Excellente | Universelle | Dépend du concept DA |

**Décision : B**, avec C en repli pour `prefers-reduced-motion`, écrans < 768 px et Save-Data (`navigator.connection.saveData`). Poster = frame 0 en `<img>` inline (LCP immédiat). Les frames sont extraites par `scripts/extract_frames.sh` (ffmpeg 8.1 disponible localement). ⚠️ **Source visuelle à valider** (réutiliser `cyber_hero.mp4` ou nouvelle séquence — question 8.1).

Contraintes d'implémentation : `will-change` limité, `requestAnimationFrame` unique, frames décodées via `createImageBitmap`, canvas redimensionné au `resize` seulement, navigation jamais bloquée (le scroll natif reste maître ; Lenis optionnel et désactivable).

## D4 — Sécurité du contenu injecté

- Tout contenu externe (projects.json, data.json, réponses de l'assistant) est rendu via `textContent` / `createElement` (`js/util/dom.js` : `el(tag, attrs, children)`), **jamais `innerHTML`**.
- URL : fonction `safeHref(url)` n'acceptant que `https:` (et `mailto:` pour le contact), sinon le lien est omis.
- `rel="noopener noreferrer"` systématique sur `target="_blank"`.
- Validation de schéma JSON côté Action (`scripts/validate_data.py`) **et** côté client (champs attendus, types, longueur max).

## D5 — CSP et origines externes

**Contexte.** GitHub Pages : pas d'en-têtes HTTP → CSP uniquement par `<meta>`, sans Report-Only ni `frame-ancestors`.

**Décision.** Réduire les origines à zéro : auto-héberger polices (woff2), GSAP (`assets/vendor/gsap.min.js`, version et SHA-256 notés dans `docs/VENDOR.md`), icônes en SVG inline. CSP cible :

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; media-src 'self'; connect-src 'self'; object-src 'none';
base-uri 'self'; form-action 'self' mailto:; upgrade-insecure-requests
```

Pas de `'unsafe-inline'` : donc **aucun `style=""` ni `onclick=""` inline** dans le HTML (règle de codage). Test : la CSP est d'abord appliquée en local via un serveur de dev qui envoie l'en-tête `Content-Security-Policy-Report-Only` (script `scripts/serve.py`), console vérifiée, puis basculée en meta. Les limites (pas de `frame-ancestors`, pas de rapport) sont documentées dans le rapport de sécurité. Le README actuel sera corrigé pour ne plus annoncer ce qui n'existe pas.

## D6 — Chaîne d'approvisionnement

- Actions épinglées par **SHA complet** + commentaire de version ; Dependabot activé pour `github-actions` et `pip`.
- `permissions:` minimales par job ; le job CyberPulse sépare « génération » (secrets IA, `contents: read`) et « commit » (`contents: write`, sans secrets IA) via un artefact.
- `requirements.txt` figé (`==`) généré par `pip-compile`, avec `--generate-hashes`.
- Trivy conservé (workflow renommé `security-scan.yml`), + `trivy config` sur les workflows.
- ⚠️ Le statut de `aquasecurity/trivy-action@0.28.0` (compromission supposée début 2026) sera **vérifié** sur la page sécurité du projet avant de choisir le SHA.

## D7 — CyberPulse fiabilisé

1. Source : flux RSS officiel THN (`https://feeds.feedburner.com/TheHackersNews`) via `feedparser` ; repli HTML actuel conservé derrière un flag.
2. LLM : demande de **JSON structuré** (`{"articles":[{"title_fr","summary_fr"}], "script"}`) et validation ; échec → `sys.exit(1)`.
3. Contrat de sortie : `data.json` validé contre `schemas/cyberpulse.schema.json` (3 articles, URL https, script 150-350 mots, mp3 > 20 Ko) avant commit.
4. Statut réel dans le `GITHUB_STEP_SUMMARY` ; en cas d'échec, étape `if: failure()` qui ouvre/actualise une issue « CyberPulse en échec » (⚠️ à valider, question 6.5).
5. `ai_provider` enregistre les deux étapes (traduction, script).
6. Historique git : ⚠️ proposer de stocker le MP3 hors git (branche orpheline `cyberpulse-media` ou GitHub Release « latest ») pour arrêter de gonfler l'historique ; sinon conserver tel quel (≈30 Mo/an, acceptable).
7. Affichage : titre + lien + résumé court ; mention explicite « Source : The Hacker News — résumé traduit automatiquement ». ⚠️ Droits à valider (6.2).

## D8 — Assistant IA : option A recommandée

| Critère | A. Déterministe statique | B. LLM + backend |
|---|---|---|
| Hébergement | GitHub Pages seul | Cloudflare Worker/Pages Functions (compte à créer), ou autre |
| Coût | 0 € | Variable (clé API) + risque d'abus → quota obligatoire |
| Secrets | Aucun | Clé côté serveur, jamais côté client |
| Hallucinations | Impossibles (réponses rédigées et validées) | Possibles malgré le RAG ; nécessite garde-fous, tests, prompt-injection via README |
| Confidentialité | Aucune donnée collectée | Conversations transitent par un tiers ; politique nécessaire |
| Valeur recruteur | Répond aux ~20 questions fréquentes, renvoie vers les preuves | Plus naturel, mais le recruteur veut des faits vérifiables, pas une conversation |
| Maintenance | Un fichier `data/profile.json` | Backend + base vectorielle + monitoring |

**Décision : A pour la V1.** Implémentation : `js/assistant.js` — index de recherche léger (normalisation accents, tokens, synonymes) sur `profile.json` (FAQ validée) + `projects.json` ; réponse = texte validé + liens ; si aucun score suffisant → « Je n'ai pas cette information ; contactez Dorian : [email/LinkedIn] ». Désactivable par un flag dans `profile.json`. Mention claire « assistant automatique, pas une personne ». Aucun stockage. L'architecture laisse la place à B plus tard (même interface, backend ajouté). ⚠️ Validation requise avant toute option B (question 7.1-7.2).

## D9 — Animations et bibliothèques

- **Mise à jour 2026-10-13 (prototype) : GSAP n'est plus nécessaire.** L'épinglage de la séquence est fait en CSS (`position: sticky` sur `.seq__sticky`, piste de 320 vh), la progression est calculée dans un `requestAnimationFrame` (`js/sequence.js`), les révélations par `IntersectionObserver`. Résultat : **zéro bibliothèque JavaScript**, aucune origine externe, aucune question de licence. GSAP reste une option si un effet futur l'exige (il serait alors auto-hébergé).
- ~~GSAP 3.13 + ScrollTrigger auto-hébergés (licence : gratuite pour tout usage depuis 2025 selon GSAP — ⚠️ à reconfirmer au téléchargement).~~
- Lenis : **non retenu par défaut** (ajoute un comportement de scroll non natif, gêne l'accessibilité et le tactile) ; réévaluable en phase DA si un prototype montre un bénéfice net.
- Toute animation : désactivée sous `prefers-reduced-motion`, aucune n'est requise pour naviguer, lire ou contacter.
- Suppression : curseur custom, glitch, « déchiffrement » des titres, watermark « CYBER », faux terminal (clichés listés par le cahier des charges). ⚠️ Confirmer (question 8.4).

## D10 — Formulaire de contact

Conserver le `mailto:` (seule option sans tiers), mais : labels associés, validation native, message d'état honnête (« Votre client mail va s'ouvrir ; si rien ne se passe, écrivez à … »), et lien e-mail direct toujours visible. ⚠️ Alternative à valider (question 5.5).

## D11 — SEO / accessibilité

- Un `<h1>` (nom + proposition de valeur), hiérarchie h2/h3 par section, `lang="fr"`, `robots.txt`, `sitemap.xml`, données structurées **`Person`** uniquement avec les champs validés (nom, jobTitle, sameAs GitHub/LinkedIn/THM) — pas de notation, pas d'avis.
- Menu mobile : `<button aria-expanded>` + `<nav>` ; fermeture à la sélection, à Échap, au clic extérieur ; focus géré.
- Tests : axe-core (via script Node) + Lighthouse local sur 320/375/390/768/1024/1440 ; résultats consignés dans `docs/RAPPORT_TESTS.md`.

## D13 — Bilingue FR/EN (validé le 2026-10-13)

**Contexte.** Dorian souhaite une bascule vers l'anglais. GitHub Pages, pas de build.

**Décision.** Une seule page, textes **dans le HTML** en français (langue par défaut, indexée), et un dictionnaire `data/i18n.en.json` appliqué côté client sur les éléments portant `data-i18n="clé"` ; `<html lang>` mis à jour ; choix mémorisé dans `localStorage` ; toggle « FR / EN » dans la nav avec `aria-pressed`. Les données générées (`projects.json`, CyberPulse) restent en français — l'anglais y est signalé comme « contenu en français ». Pas de traduction automatique : le dictionnaire anglais est rédigé à la main à partir du contenu validé. Coût de maintenance : chaque texte modifié doit l'être dans les deux langues (checklist dans MAINTENANCE.md). Alternative rejetée : une page `/en/` dupliquée (double maintenance du HTML).

## D12 — Déploiement et retour arrière

- Travail sur une branche `refonte-2027` ; la branche `main` reste le site actuel jusqu'à validation explicite.
- Prévisualisation : serveur local (`scripts/serve.py`) ; option : activer GitHub Pages sur un second repo/branche de staging (⚠️ à valider).
- Retour arrière : `git revert` du merge, ou `git push origin <sha-avant-merge>:main`. Les assets lourds supprimés restent dans l'historique.
- ⚠️ **Aucun push sur `main` sans accord explicite.**

---

## Scoring du plan (avant implémentation)

| Critère | Poids | Note plan | Justification / ce qui manque pour 10 |
|---|---:|---:|---|
| Faits et crédibilité | 15 % | 7 | Le plan interdit toute invention et liste les points à valider ; la note finale dépend des réponses de l'utilisateur |
| Liens et fonctionnalités | 10 % | 9 | Inventaire figé, test de non-régression prévu ; reste le choix sur « Divers » |
| Qualité artistique | 10 % | 6 | DA non encore produite (phase 2) |
| Expérience cinématique | 10 % | 7 | Approche validée techniquement (canvas + frames), source visuelle à confirmer |
| Responsive mobile | 10 % | 9 | Breakpoints, menu, tests sur 6 largeurs planifiés |
| Sécurité | 15 % | 9 | CSP sans inline, zéro origine externe, SHA, hashes pip, DOM sûr ; limite : pas d'en-têtes HTTP sur Pages |
| Performance | 10 % | 8 | Budget : < 300 Ko au premier rendu, frames lazy ; à mesurer |
| Accessibilité | 5 % | 8 | Tests axe + manuels prévus |
| SEO / recrutement | 5 % | 8 | h1, sitemap, Person ; contenu dépend de la validation |
| Maintenabilité / tests | 10 % | 8 | Fichiers séparés, scripts testés, docs ; pas de framework de test front lourd |
| **Global pondéré** | | **7,9 / 10** | Les deux critères faibles (DA, faits) dépendent des phases suivantes et des réponses de l'utilisateur |
