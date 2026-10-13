# Revue DevSecOps & ingénierie — portfolio Dorian Poncelet

Date : 2026-10-13 · Revue du commit `1c9162d` + durcissements appliqués dans la foulée · Posture : DevSecOps senior + ingénieur full-stack (front, pipeline, CI).
Méthode : lecture intégrale du code (`js/`, `src/`, `scripts/`, `.github/`), recherche outillée des puits DOM et des expressions de workflow, tests d'injection unitaires, vérification en navigateur (CSP en mode rapport puis bloquant), mapping OWASP Top 10 (2021) adapté à un site statique + pipeline CI. Chaque constat cite la preuve.

---

## 1. Modèle de menace (ce qui est réellement attaquable)

Un site statique sans backend ni authentification n'a **pas de session à voler ni de base à injecter**. Les surfaces réelles sont :

| Surface | Entrée non maîtrisée | Impact si compromise |
|---|---|---|
| S1. Rendu des projets | README des dépôts GitHub de Dorian (texte Markdown) | XSS stocké chez tous les visiteurs |
| S2. Rendu CyberPulse | flux RSS d'un site tiers, puis sortie d'un LLM | XSS stocké ; phishing par contenu ; injection de prompt |
| S3. Fichiers de données | `data/*.json`, `cyber-news/*` (même origine, commités par CI) | XSS si un workflow est compromis |
| S4. Pipeline CI | Actions tierces, dépendances PyPI, modèle ONNX téléchargé, secrets | exécution de code sur le runner → commit malveillant → S3 |
| S5. Hébergement | GitHub Pages (pas d'en-têtes serveur) | clickjacking ; pas de HSTS custom (GitHub l'applique sur `*.github.io`) |
| S6. Poste de l'auteur | jeton git, Chrome (script injecté localement constaté) | push malveillant |

## 2. OWASP Top 10 (2021) — état vérifié

| # | Catégorie | Applicabilité | État | Preuve |
|---|---|---|---|---|
| A01 | Broken Access Control | CI seulement | ✅ | `permissions: {}` racine ; `contents: write` uniquement sur les jobs qui commitent ; secrets IA isolés dans `generate` (lecture seule) ; `persist-credentials: false` |
| A02 | Cryptographic Failures | hébergement | ✅ (limité) | HTTPS + HSTS `max-age=31556952` servis par GitHub ; aucune donnée sensible côté client |
| A03 | **Injection** | S1, S2, S3 | ✅ | 0 `innerHTML` / `eval` / `document.write` (`grep` sur `js/`) ; tout texte via `textContent` ; URL via `safeHref` (https/mailto/ancre) ; schéma JSON strict côté pipeline ; **Trusted Types imposés par CSP** depuis cette revue ; tests `dom.test.mjs`, `dom-el.test.mjs` |
| A04 | Insecure Design | pipeline | ✅ | « zéro invention » dans les données ; échecs explicites (`exit 1`), audio optionnel signalé, issue automatique |
| A05 | Security Misconfiguration | S5 | ⚠️ partiel | CSP stricte sans `unsafe-inline`, `object-src 'none'`, `base-uri 'self'` ; **impossible** : `frame-ancestors`, `X-Frame-Options`, `Permissions-Policy`, `COOP` (Pages n'autorise pas les en-têtes) |
| A06 | Vulnerable & Outdated Components | S4 | ✅ | **0 bibliothèque JS** ; Python figé ; Dependabot (actions + pip) ; Trivy hebdomadaire ; Actions épinglées par SHA |
| A07 | Identification & Auth Failures | n/a | — | pas d'authentification |
| A08 | **Software & Data Integrity** | S4 | ✅ depuis cette revue | SHA des Actions ; **empreinte SHA-256 du modèle Piper vérifiée** (pointeur LFS officiel) ; hashes pip en cours de génération (voir §5) ; artefact relu et revalidé avant commit |
| A09 | Logging & Monitoring | pipeline | ✅ | résumé de job, issue automatique en échec, Dependabot ; pas de télémétrie visiteur (choix vie privée) |
| A10 | SSRF | S4 | ✅ | URL sortantes fixes (`feeds.feedburner.com`, `api.github.com`, `raw.githubusercontent.com`, Hugging Face) ; les URL d'articles ne sont jamais suivies par le pipeline, seulement filtrées (`^https://thehackernews.com/`) |

### Vecteurs d'injection testés un par un

| Vecteur | Chemin | Résultat |
|---|---|---|
| `<img onerror>` dans un README | `build_projects.py` → `description` → `el('p', …, p.description)` → nœud texte | affiché littéralement, non interprété (test `dom-el.test.mjs`) |
| `javascript:` / `data:` dans une URL de README ou du RSS | `safeHref` → `null` → attribut non posé | lien omis (test `dom.test.mjs`) |
| Attribut `onclick="…"` passé à `el()` | ignoré sauf fonction | test `dom-el.test.mjs` |
| `srcdoc`, `formaction`, `style`, `xlink:href` via `el()` | refusés par liste | test |
| Chaîne contenant du HTML dans `i18n.en.json` / `profile.json` | `textContent` | inerte |
| Manifeste `sequence.json` pointant hors du site | regex `^assets/sequence/{n}\.(webp\|jpg\|png)$` + `count ≤ 400` | ignoré → rendu procédural |
| Injection de prompt via un article THN | sortie LLM contrainte au JSON, bornée en longueur, rendue en texte ; URL jamais issues du LLM | contenu textuel seulement (risque résiduel : texte trompeur, cf. §4) |
| Expression `${{ }}` dans un `run:` | une seule, `steps.commit.outputs.changed` = `true/false` produit par nous | pas d'injection de commande |
| Nom de branche / titre d'issue dans l'alerte | chaînes constantes | — |

## 3. Durcissements appliqués pendant la revue

1. **CSP + `require-trusted-types-for 'script'`** (`index.html`, `scripts/serve.py`) : le navigateur refuse désormais tout `innerHTML`/`eval`/`script.src` non typé. Vérifié : aucune violation en navigateur sur toute la page, séquence, projets, assistant.
2. **`el()` durci** (`js/util/dom.js`) : `on*` chaîne ignoré, `srcdoc`/`formaction`/`action`/`style`/`xlink:href`/`is` refusés, `src`/`poster`/`ping`/`cite`/… passent par `safeHref` comme `href`. 4 tests.
3. **Intégrité du modèle Piper** (`src/audio_gen.py`) : SHA-256 épinglée (`bf65074c…fd41`, pointeur LFS `rhasspy/piper-voices`), vérifiée après téléchargement **et** à chaque chargement depuis le cache ; fichier supprimé si différent ; voix inconnue refusée. 3 tests.
4. **Manifeste de séquence validé** (`js/sequence.js`).

## 4. Risques résiduels (acceptés ou hors de portée)

| Risque | Gravité | Pourquoi accepté / piste |
|---|---|---|
| Clickjacking (pas de `frame-ancestors`) | faible | aucune action sensible sur le site ; levable en passant par Cloudflare Pages / Netlify (en-têtes) |
| Contenu trompeur généré par le LLM (texte) | faible | borné, texte seul, source citée ; piste : liste de mots interdits ou second passage de vérification |
| Compromission du compte GitHub de Dorian | élevée mais hors site | 2FA + passkey, jeton git à portée minimale, revue des « Authorized OAuth Apps » |
| Script injecté dans Chrome sur le poste de l'auteur | moyenne (poste) | identifier le composant (antivirus/VPN) ; n'affecte pas les visiteurs |
| `actions/cache` empoisonné (voix Piper) | faible | neutralisé par la vérification SHA-256 à chaque chargement |
| Disponibilité des services tiers (Gemini, Hugging Face, feedburner) | moyenne | cascade de modèles, audio optionnel, flash précédent conservé ; piste : miroir du modèle dans une Release GitHub |

## 5. Axes d'amélioration (ingénierie)

### Priorité haute — valeur recruteur
1. **Études de cas** (lot 3, non livré) : 4-6 fiches Contexte / Problème / Démarche / Résultats / Limites, rédigées depuis le contenu validé, avec captures des README. C'est ce qui manque le plus pour convaincre un recruteur GRC.
2. **Dates et liens des certifications** (en attente de Dorian).
3. **Transcription du flash audio** : le script radio existe déjà dans `data.json` (`script`) ; l'afficher dans un `<details>` = accessibilité + SEO gratuit.

### Priorité moyenne — qualité et sécurité
4. ~~Hashes pip~~ — **fait pendant la revue** : `requirements.txt` à empreintes (1 691 hashes), `--require-hashes` dans le workflow, validé par un run réel.
5. ~~Miroir du modèle Piper~~ — **fait** : Release `piper-voices-v1`, source principale du pipeline, Hugging Face en repli ; validé par le run `38392986344`.
6. ~~Test de non-régression CSP automatisé~~ — **fait** : `scripts/check_csp.mjs` + workflow `site-checks.yml` (tests Python et Node, CSS/i18n/données, navigateur réel) ; premier run vert (`38392969369`). Il a détecté au passage que `404.html` n'était pas servable en local (préfixe Pages) → `serve.py` corrigé.
7. **Validation HTML (Nu) et lint JS** (ESLint, config stricte) en CI.
8. ~~`SECURITY.md`~~ — **fait**.

### Priorité basse — performance et confort
9. Inline du CSS critique (hash dans la CSP) : −300 ms de rendu bloquant simulé sur mobile.
10. Minification JS (−3 Ko) via le même `build_css.py` étendu.
11. Speed Index 4,2 s mobile : réduire le délai des révélations (`--d-slow` 720 → 480 ms) ou ne pas animer au-dessus de la ligne de flottaison.
12. Vidéo de séquence régénérée avec le prompt 3.2 (plus sombre, sujet plus grand).
13. Données terrain (CrUX) à relire dans 28 jours.

## 6. Verdict

Le site n'expose **aucun vecteur d'injection connu** : pas de puits DOM, URL filtrées, CSP stricte désormais renforcée par Trusted Types, données générées validées par schéma, chaîne CI à permissions minimales et dépendances épinglées. Les limites restantes tiennent à l'hébergeur (en-têtes HTTP) et au poste de l'auteur, pas au code. La dette la plus utile à rembourser n'est pas sécuritaire mais éditoriale : les études de cas.
