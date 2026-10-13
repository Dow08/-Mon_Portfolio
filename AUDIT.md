# Audit — Portfolio Dorian Poncelet

Date : 2026-10-02 · Périmètre : dépôt `Dow08/-Mon_Portfolio` (commit `ec8a146`) + site en ligne https://dow08.github.io/-Mon_Portfolio/
Méthode : lecture intégrale du code (index.html, pipeline Python, workflows) + tests du site en ligne en 1024px et 375px (mobile).

Légende : 🔴 critique · 🟠 important · 🟡 mineur

---

## 1. Responsive / mobile — 🔴 le plus visible

Le README annonce « 100 % responsive », mais en 375px (smartphone), plusieurs parties sont cassées. Je l'ai vérifié sur le site en ligne :

| Problème | Cause (index.html) |
|---|---|
| 🔴 La nav déborde : le logo chevauche « ABOUT », et « SKILLS / VEILLE / CONTACT » sont coupés hors écran | `nav` a `padding:24px 60px` et `.nav-links` reste en `display:flex` : aucune media query pour la nav (pas de menu burger) |
| 🔴 Le texte de la section About est tronqué à droite et devient illisible | `.about-grid{grid-template-columns:1fr 1fr}` jamais repassé en 1 colonne, combiné à `section{overflow:hidden}` qui masque le débordement au lieu de le révéler |
| 🔴 Contact : même problème (2 colonnes + `form-row` en 2 colonnes) | `.contact-inner`, `.form-row` sans breakpoint |
| 🟠 Cartes projets légèrement rognées | `minmax(360px,1fr)` + `padding:0 60px` > 375px |
| 🟠 `section{padding:120px 60px}` n'est réduit que pour `#cyberpulse` | il manque un breakpoint général |

➡️ Il faut ajouter un bloc `@media (max-width:768px)` global : nav en burger (ou liens masqués), `padding:80px 20px`, grilles en `1fr`, `minmax(min(100%,320px),1fr)`.
Un recruteur sur deux ouvre un lien LinkedIn depuis son téléphone, c'est donc la correction prioritaire.

## 2. Sécurité — 🟠 (gênant pour un portfolio cyber)

1. 🟠 **XSS stocké possible via CyberPulse** (`index.html` l.2354-2359). Les titres, résumés et URL de `data.json` sont injectés en `innerHTML` sans échappement. Ces contenus viennent d'un site tiers scrapé, puis d'un LLM, donc ils ne sont pas fiables. Un `<img onerror>` dans un titre THN, ou une URL `javascript:`, s'exécuterait sur ton site. Correctif : construire les éléments avec `textContent`, et pour `a.url`, n'accepter que `https://`.
2. 🟡 Même chose pour les cartes projets (`buildCard`, l.1864-1885). La description et la stack viennent des README GitHub et sont injectées sans échappement. Le risque est faible puisque ce sont tes propres repos, mais la correction est la même.
3. 🟠 **Le README affirme des protections absentes.** Il dit « ✅ CSP », mais aucune Content-Security-Policy n'est présente. Il dit aussi « rel="noopener noreferrer" sur liens externes », mais une seule occurrence de `noreferrer` existe. Pour un profil cyber, une affirmation de sécurité fausse est pire qu'une absence : soit on l'ajoute (une `<meta http-equiv="Content-Security-Policy">` est possible sur GitHub Pages), soit on retire la ligne.
4. 🟡 Pas de SRI (`integrity=`) sur Font Awesome et GSAP chargés depuis cdnjs.
5. 🟠 **GitHub Actions épinglées par tag, pas par SHA** (`trivy-action@0.28.0`, `checkout@v4`, etc.). Si je me souviens bien, les tags de `aquasecurity/trivy-action` ont été réécrits lors d'une compromission supply-chain début 2026 : vérifie le statut de la version utilisée et épingle par SHA de commit. Le workflow quotidien a `contents: write` et reçoit les clés OpenAI/Gemini, donc une action compromise dans ce workflow aurait des conséquences directes.
6. 🟡 Dépendances Python non figées (`>=`), sans lockfile ni Dependabot.
7. 🟡 L'email est en clair dans le HTML (aspiré par les spammeurs). C'est acceptable pour un portfolio, à toi de voir.

## 3. Fiabilité du pipeline CyberPulse — 🟠

- 🟠 **Échecs silencieux.** Si le scraping renvoie 0 article (THN change son HTML), `main()` fait `return` avec un code 0. Le job est donc vert, le résumé affiche « ✅ Succès » en dur, et le site garde un vieux flash sans alerte. Il faut un `sys.exit(1)` dans ce cas, et un résumé qui reflète le vrai statut.
- 🟠 Le scraper dépend des classes CSS de THN (`story-link`, `home-title`, `home-desc`). Le flux RSS officiel (`feeds.feedburner.com/TheHackersNews`) est bien plus stable.
- 🟡 Le parsing de la traduction par `split("[ARTICLE n]")` est fragile. Une sortie JSON demandée au LLM serait plus robuste.
- 🟡 `AI_PROVIDER` ne reflète que le dernier appel : si OpenAI traduit puis que Gemini écrit le script, seul « gemini » est enregistré.
- 🟡 Un MP3 est commité chaque jour (environ 80 Ko), soit environ 30 Mo par an dans l'historique git. Ce n'est pas bloquant, mais l'historique ne fera que grossir.
- 🟡 Point juridique : republier quotidiennement les résumés de THN (même traduits) relève de leurs conditions d'utilisation. Lien + court extrait, c'est généralement OK ; à garder en tête.

## 4. Performance — 🟠

- 🟠 **La vidéo hero pèse 19,5 Mo**, en `preload=auto` sur desktop, sans `poster`. Un réencodage en 720p H.264/WebM tomberait sous 3 Mo, et un `poster` (image WebP) éviterait l'écran noir.
- 🟡 `assets/images/image1.png` (7,9 Mo) n'est utilisé nulle part. `cyber-shield.png` (1 Mo) ne sert que d'image Open Graph : une version JPG/WebP 1200×630 d'environ 100 Ko suffit.
- 🟠 **Quota API GitHub.** Une visite sans cache déclenche 11 appels à l'API GitHub (j'en ai mesuré 1 + 1 + 9 `contents/`). La limite non authentifiée est de 60 requêtes par heure et par IP, donc environ 5 visites par heure depuis un même réseau d'entreprise (NAT) suffisent à afficher « Impossible de charger les projets » à un recruteur. Mieux vaut générer `projects.json` dans une GitHub Action (comme CyberPulse) et le servir en statique : zéro appel côté client, et un rendu instantané.

## 5. Accessibilité / SEO — 🟡

- 🟠 **Il n'y a aucun `<h1>`** : le nom est dans des `<div>`. C'est mauvais pour le SEO et les lecteurs d'écran.
- 🟡 Les `<label>` du formulaire ne sont pas associés aux champs (pas de `for`/`id`).
- 🟡 La barre de progression audio n'est utilisable qu'à la souris, et les chips de filtre n'ont pas de `aria-pressed`.
- 🟡 L'effet « déchiffrement » des titres réécrit le texte : un lecteur d'écran peut lire des glyphes aléatoires.
- 🟡 `cursor:none` global : si le JS du curseur plante sur desktop, le visiteur n'a plus de curseur.

## 6. Contenu / crédibilité — 🟡

- 🟠 La stat « 99 % Uptime » ne mesure rien de vérifiable : un recruteur cyber le relèvera. Mieux vaut la remplacer par une métrique réelle (nombre de rooms THM, de projets, etc.).
- 🟡 Le compteur « Repos GitHub » (11) inclut les forks et le portfolio, alors que la section Projets les exclut.
- 🟡 Le footer affiche « © 2025 ».
- 🟡 Le LinkedIn diffère entre le README (`dorian-poncelet-1807612b5`) et le site (`dorian-p-1807612b5`).
- 🟡 Il reste des textes obsolètes : « Faites défiler pour explorer → » (vestige du scroll horizontal), un commentaire « liste PROJETS curée », une mention de « Three.js », ainsi que les CSS `.scroll-progress`, `scroll-snap-align` et `.revealed` qui ne servent plus.
- 🟡 La langue de la nav est mélangée (« About », « Skills » vs « Projets », « Veille »).
- 🟡 `style.css` (2 091 lignes) est inutilisé : c'est du code mort à supprimer.

---

## Plan d'action recommandé

| # | Action | Effort |
|---|---|---|
| 1 | Breakpoint mobile global + menu burger | ~1 h |
| 2 | Échapper le contenu injecté (CyberPulse + projets), filtrer les URL | ~30 min |
| 3 | Ajouter une vraie CSP + SRI, ou corriger le README | ~30 min |
| 4 | Épingler les Actions par SHA, `sys.exit(1)` si 0 article, scraper via RSS | ~1 h |
| 5 | Réencoder la vidéo + poster, supprimer `image1.png` et `style.css` | ~30 min |
| 6 | `projects.json` généré par Action (fin du rate-limit) | ~1-2 h |
| 7 | `<h1>`, labels, nettoyage des textes obsolètes, stat « Uptime », © | ~30 min |

## Points positifs

- Le `prefers-reduced-motion` est très bien géré (CSS + JS), et le curseur natif est rétabli sur tactile.
- La vidéo n'est pas chargée sur mobile.
- Le cache `sessionStorage` sert de repli si l'API GitHub échoue.
- Les secrets passent par GitHub Secrets, et les permissions de workflow sont explicites.
- Le fallback multi-modèles Gemini est bien pensé.
- Les meta Open Graph et Twitter sont complètes, et le code est commenté proprement.
