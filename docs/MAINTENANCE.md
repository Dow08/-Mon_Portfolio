# Guide de maintenance

Comment faire évoluer le site sans le casser. Chaque opération indique le fichier à toucher, la commande à lancer et le test qui vérifie.

---

## Les règles qui protègent le site

1. **Jamais de `innerHTML`, jamais de `style=""` ni de `onclick=""` dans le HTML.** La CSP les bloque ; les tests et la console du serveur local (`scripts/serve.py`) le signalent.
2. **Aucun contenu inventé.** `data/profile.json` ne contient que du contenu validé ; une compétence sans projet public reste en niveau P ou A.
3. **Deux langues.** Tout texte ajouté dans `index.html` reçoit un `data-i18n="clé"` et sa traduction dans `data/i18n.en.json`. Vérification : le script en bas de cette page ne doit lister aucune clé manquante.
4. **Les fichiers générés ne s'éditent pas à la main** : `data/projects.json`, `css/site.css`, `cyber-news/*`, `assets/sequence/*`, `assets/img/og.png`.

## Opérations courantes

| Je veux… | Fichier | Commande | Vérifié par |
|---|---|---|---|
| Modifier un texte du site | `index.html` (FR) + `data/i18n.en.json` (EN) | — | script i18n ci-dessous |
| Ajouter / retirer une compétence, une certification, une question de l'assistant | `data/profile.json` (FR et EN dans chaque entrée) | — | `node --test tests/*.test.mjs` |
| Ajouter ou corriger une étude de cas | `data/cases.json` (FR et EN dans chaque champ ; `url` = URL exacte d'une carte projet ; image WebP ≤ 1200 px dans `assets/cases/` ou `null`) — ne citer que des faits présents dans le README du projet | — | `node --test tests/cases.test.mjs` (exige une limite et la nature du projet) |
| Faire apparaître un nouveau projet | README du **dépôt du projet** : section `### nom-du-dossier`, 1-3 lignes, `Stack : a, b, c`, `⭐` pour la une | attendre l'Action quotidienne ou lancer « Projets » (`workflow_dispatch`) ; en local : `python scripts/build_projects.py` | `python -m pytest tests/test_build_projects.py` |
| Changer la catégorie éditoriale d'un dépôt | `scripts/build_projects.py` → `REPO_GROUP`, `STATUS` | `python scripts/build_projects.py` | idem |
| Changer une couleur, une taille | `css/tokens.css` (puis autres `css/*.css`) | `python scripts/build_css.py` | `tests/test_build_css.py` |
| Remplacer la séquence vidéo | déposer dans `assets/source/` | `python scripts/extract_frames.py assets/source/fichier.mp4` | ouvrir le site : la section « Approche » utilise les frames ; `data/sequence.json` a `count > 0` |
| Régénérer l'image de partage | `scripts/make_og.py` (textes) | `python scripts/make_og.py` | aperçu sur https://www.opengraph.xyz |
| Mettre à jour le miroir de la voix Piper | Release GitHub `piper-voices-v1` (assets `.onnx` + `.onnx.json`) ; `PIPER_MIRROR` et `PIPER_VOICE_SHA256` dans `src/audio_gen.py` | créer une release `piper-voices-vN`, y déposer les deux fichiers, mettre à jour l'URL et l'empreinte, changer la clé du cache dans `cyberpulse.yml` | `python -m pytest tests/test_audio_gen.py` ; premier run CyberPulse après la mise à jour |
| Changer la voix de CyberPulse | `src/audio_gen.py` (`PIPER_VOICE`, ou variable d'environnement du même nom dans le workflow) ; voix FR disponibles : `fr_FR-tom-medium`, `fr_FR-siwis-medium`, `fr_FR-upmc-medium` | `python -m piper.download_voices <voix>` puis `cd src && python main.py` ; changer la clé du cache (`piper-voice-…-v2`) dans `cyberpulse.yml` | `python -m pytest tests/test_audio_gen.py` |
| Changer la source de CyberPulse | `src/scraper.py` (`FEED_URL`) | `cd src && python scraper.py` | `python -m pytest tests/test_cyberpulse.py` |
| Désactiver l'assistant | `data/profile.json` → `assistant.enabled: false` | — | le bouton disparaît |
| Mettre à jour une dépendance Python | `requirements.in` (versions directes) | `pip install pip-tools` puis `python -m piptools compile --generate-hashes --strip-extras --output-file requirements.txt requirements.in` (long : télécharge chaque roue pour l'empreinter) | le workflow installe avec `--require-hashes` : une empreinte manquante fait échouer le job, jamais installer silencieusement |
| Mettre à jour une Action GitHub | `.github/workflows/*.yml` : remplacer le SHA **et** le commentaire de version | `git ls-remote --tags https://github.com/<org>/<action> vX.Y.Z` pour obtenir le SHA | Dependabot propose aussi les PR |

## Avant chaque mise en production

```bash
python scripts/build_css.py
python -m pytest tests
node --test tests/*.test.mjs
npm ci && python scripts/serve.py &   # puis, dans un autre terminal :
node scripts/check_csp.mjs            # 0 violation CSP / Trusted Types, 0 erreur JS, 0 ressource en échec
python scripts/validate_data.py projects
grep -n "PROTOTYPE\|TODO\|À VALIDER" index.html data/profile.json   # doit être vide
```

Puis ouvrir `python scripts/serve.py`, vérifier la console (aucune violation CSP, aucun 404), tester à 375 px et 1 440 px, basculer FR/EN.

Clés de traduction manquantes :
```bash
python -c "import json,re;h=open('index.html',encoding='utf-8').read();k=set(re.findall(r'data-i18n(?:-label)?=\"([^\"]+)\"',h));d=json.load(open('data/i18n.en.json',encoding='utf-8'));print(sorted(k-set(d)))"
```

## Déploiement et retour arrière

- Le site en ligne = branche `main` (GitHub Pages, « Deploy from a branch », racine). Chaque push sur `main` publie en ~1 minute.
- Travailler sur une branche, vérifier en local, puis fusionner.
- Retour arrière : `git revert -m 1 <sha-du-merge>` puis `git push` ; ou `git push origin <sha-connu-bon>:main` (force implicite : à réserver aux urgences).
- Les workflows CyberPulse et Projets commitent sur `main` : après un retour arrière, vérifier que `cyber-news/` et `data/projects.json` sont cohérents (relancer les workflows à la main si besoin).

## Secrets et comptes

| Secret (Settings → Secrets → Actions) | Usage | Si absent |
|---|---|---|
| `GEMINI_KEY` | traduction + script CyberPulse (Gemini, seul fournisseur depuis le 2026-10-13) | échec du job → issue automatique |

Aucun autre compte ni service n'est nécessaire.

## Où est quoi (docs/)

`REFONTE_AUDIT.md` diagnostic initial · `LIENS_ET_PROJETS.md` inventaire de référence (test de non-régression) · `DECISIONS_TECHNIQUES.md` choix argumentés · `DIRECTION_ARTISTIQUE.md` palette, typo, storyboard, spécification de la séquence · `SEQUENCE_PROMPT.md` prompt de génération · `PLAN_IMPLEMENTATION.md` lots · `RAPPORT_TESTS.md` / `RAPPORT_SECURITE.md` · `SCORING.md` · `CONTENU_A_VALIDER.md` réponses de Dorian et points ouverts.
