# Politique de sécurité

Ce dépôt contient le code du portfolio https://dow08.github.io/Mon_Portfolio/ et le pipeline CyberPulse qui le met à jour chaque jour.

## Signaler une vulnérabilité

- **E-mail** : Dow@ikmail.com, objet « [SECURITY] portfolio ». Merci d'indiquer la page ou le fichier concerné, les étapes de reproduction et l'impact estimé.
- Accusé de réception sous 72 h ; correction visée sous 14 jours pour un problème exploitable, avec mention dans le journal du dépôt si vous le souhaitez.
- Merci de ne pas ouvrir d'issue publique pour un problème exploitable avant la correction.

## Périmètre

Dans le périmètre : `index.html`, `js/`, `css/`, `data/`, `src/` (pipeline), `scripts/`, `.github/workflows/`.
Hors périmètre : GitHub Pages et GitHub Actions eux-mêmes, les services tiers appelés par le pipeline (Gemini, The Hacker News, Hugging Face), les dépôts de projets liés depuis le site (chacun a son propre README).

## Ce qui est en place

- Site statique sans backend ni authentification ; aucune donnée personnelle collectée, aucun cookie, aucun tiers chargé.
- Content Security Policy stricte (`script-src 'self'`, pas d'`unsafe-inline`, `object-src 'none'`, Trusted Types imposés) ; tout contenu externe (README, flux RSS, sortie de modèle) est rendu via `textContent` et des URL filtrées.
- Chaîne CI : permissions minimales par job, actions épinglées par SHA, dépendances Python installées avec `--require-hashes`, modèle de synthèse vocale vérifié par SHA-256, Dependabot et Trivy.
- Détail, limites connues et risques résiduels : [`docs/RAPPORT_SECURITE.md`](docs/RAPPORT_SECURITE.md) et [`docs/REVUE_DEVSECOPS.md`](docs/REVUE_DEVSECOPS.md).

## Limites connues

GitHub Pages ne permet pas d'en-têtes HTTP personnalisés : pas de `frame-ancestors` ni de `Permissions-Policy`. Un signalement portant uniquement sur ce point est déjà documenté et ne nécessite pas de rapport.
