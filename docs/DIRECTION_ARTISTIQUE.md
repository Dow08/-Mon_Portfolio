# Direction artistique — Portfolio Dorian Poncelet, refonte 2027

Date : 2026-10-13 · Statut : proposition de phase 2, à valider sur maquette/prototype. Choix déjà actés : ton éditorial/supervision, palette inspirée de la référence, séquence fournie par Dorian.

---

## 1. Intention

Un site qui ressemble à un **outil de supervision bien conçu**, pas à un film de hacker : sombre, précis, aéré, avec une seule couleur d'accent qui signale ce qui compte. La narration au scroll part de l'infrastructure (le concret, ce que Dorian sait déployer) pour monter vers la gouvernance (le risque, la conformité, la décision) — c'est exactement la trajectoire du profil : technique → GRC.

Ce que l'on retient de Terminal Industries (constaté sur le site) : une barre de navigation flottante en pilule translucide ; un hero plein écran où une séquence d'images est pilotée par le scroll sur un `<canvas>` ; des titres très grands, serrés, en deux lignes ; des sections qui passent du sombre au clair ; une grille fine en motif de fond ; des blocs numérotés `01 / 02 / 03` en monospace ; des vidéos courtes (5 s) en boucle dans les cartes de fonctionnalités ; un seul accent acide sur fond vert profond. Ce que l'on ne reprend pas : la mise en page B2B (calculateur ROI, formulaire long, FAQ), le ton marketing, les témoignages.

## 2. Palette (valeurs définitives pour `css/tokens.css`)

| Token | Valeur | Usage | Contraste vérifié |
|---|---|---|---|
| `--ink-950` | `#061716` | Fond principal sombre (hero, contact) | — |
| `--ink-900` | `#0B2322` | Fond des sections sombres secondaires, cartes sur fond 950 | — |
| `--ink-800` | `#123331` | Bordures et surfaces surélevées sur sombre | — |
| `--paper-50` | `#F4F5F2` | Fond des sections claires, texte principal sur sombre | paper-50 sur ink-950 : **16,9 : 1** |
| `--paper-100` | `#E8EBE6` | Cartes sur fond clair, séparateurs | — |
| `--mist-500` | `#7F9693` | Texte secondaire sur sombre | sur ink-950 : **5,6 : 1** (AA texte normal) |
| `--mist-300` | `#B9C6C3` | Texte tertiaire sur sombre, bordures claires | sur ink-950 : 9,6 : 1 |
| `--slate-900` | `#0F1A19` | Texte principal sur clair | sur paper-50 : **16,2 : 1** |
| `--slate-600` | `#4B5B59` | Texte secondaire sur clair | sur paper-50 : **6,9 : 1** |
| `--accent` | `#B8F23D` | Accent unique : CTA, indicateurs, soulignés, graphes. **Jamais en texte sur fond clair.** | sur ink-950 : 14,8 : 1 ; texte `--accent-ink` dessus : 10,7 : 1 |
| `--accent-ink` | `#16300A` | Texte sur bouton accent | — |
| `--accent-deep` | `#3F7A00` | Version de l'accent utilisable **en texte sur fond clair** | sur paper-50 : **4,9 : 1** (AA) |
| `--risk` | `#FF6B4A` | Sémantique « risque élevé » (matrice, badges) — usage parcimonieux | sur ink-950 : 6,3 : 1 |
| `--warn` | `#F2C94C` | « à surveiller / en cours » | sur ink-950 : 12,1 : 1 |
| `--ok` | `#5BD48F` | « validé / actif » | sur ink-950 : 10,2 : 1 |

Règles : une seule couleur d'accent par écran ; les couleurs sémantiques n'apparaissent que dans des composants de statut (jamais en décoration) ; aucun dégradé vert→violet ; les ombres portées sont remplacées par des bordures 1 px et des différences de fond.

Les ratios ci-dessus sont calculés sur les valeurs hexadécimales (formule WCAG) ; ils seront re-vérifiés par axe-core sur le rendu réel en phase de tests.

## 3. Typographie

| Rôle | Police | Licence | Graisse / usage |
|---|---|---|---|
| Titres et texte | **Geist** (Vercel) | SIL OFL 1.1 — auto-hébergée en woff2, sous-ensemble latin | 400 corps, 500 UI, 600 titres, interlettrage −0,02 em sur les titres ≥ 40 px |
| Monospace | **Geist Mono** | SIL OFL 1.1 | 400 ; numéros de section `01`, étiquettes, métadonnées, dates, tags techniques |

Pourquoi : la référence utilise Suisse Intl (payante) + Geist Mono ; Geist donne la même construction grotesque, neutre et serrée, gratuitement, et forme une paire native avec Geist Mono. Space Grotesk (actuel) est plus « display » et moins lisible en corps long.

Échelle fluide (`clamp`) :

| Token | Mobile → Desktop | Usage |
|---|---|---|
| `--t-display` | 44 px → 112 px, line-height 0,95 | h1 du hero, nom |
| `--t-h2` | 32 px → 64 px, lh 1,02 | titres de section (2 lignes max) |
| `--t-h3` | 22 px → 32 px, lh 1,15 | titres de cartes / études de cas |
| `--t-lead` | 18 px → 22 px, lh 1,5 | proposition de valeur, chapôs |
| `--t-body` | 16 px → 17 px, lh 1,6 | corps |
| `--t-small` | 14 px, lh 1,5 | métadonnées |
| `--t-mono` | 12 px → 13 px, lettres espacées 0,08 em, capitales | numéros, étiquettes |

Longueur de ligne max : 68 caractères (`max-width: 68ch`) pour tout paragraphe.

## 4. Grille, espacement, formes

- Conteneur : `max-width: 1280px`, gouttières 24 px (desktop) / 16 px (mobile). Grille 12 colonnes desktop, 6 tablette, 4 mobile (`grid-template-columns: repeat(12, 1fr)` → `repeat(4, 1fr)` sous 768 px).
- Échelle d'espacement (base 4) : `--s-1: 4` `--s-2: 8` `--s-3: 12` `--s-4: 16` `--s-6: 24` `--s-8: 32` `--s-12: 48` `--s-16: 64` `--s-24: 96` `--s-32: 128`. Sections : padding vertical `--s-24` desktop / `--s-16` mobile.
- Rayons : `--r-s: 6px` (tags, inputs), `--r-m: 12px` (cartes), `--r-pill: 999px` (nav, boutons). Pas de 20 px.
- Bordures : `1px solid` `rgba(244,245,242,.12)` sur sombre, `rgba(15,26,25,.12)` sur clair.
- Motif de fond « grille » : lignes 1 px tous les 64 px à 4 % d'opacité, statique (pas d'animation de dérive) ; présent uniquement dans les sections B et C.

## 5. Mouvement

| Token | Valeur | Usage |
|---|---|---|
| `--d-fast` | 160 ms | hover, focus |
| `--d-base` | 320 ms | apparition de composants |
| `--d-slow` | 720 ms | transitions de section, révélations de titres |
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` | tout ce qui apparaît |
| `--ease-inout` | `cubic-bezier(.65,0,.35,1)` | crossfades |

Principes : on anime `transform` et `opacity` uniquement ; une révélation = translation 24 px + fondu, une seule fois, jamais rejouée ; aucun texte n'est jamais réécrit caractère par caractère ; aucun curseur personnalisé ; le scroll reste natif (Lenis non retenu). Sous `prefers-reduced-motion: reduce` : tout est visible immédiatement, la séquence affiche sa frame finale, les vidéos de cartes affichent leur poster.

## 6. Storyboard du scroll (page d'accueil)

Durées exprimées en hauteurs d'écran (`vh`) de défilement. Le texte reste lisible et sélectionnable à tout moment ; le visiteur peut cliquer « Projets » ou « Contact » dès la première seconde.

### A — Ouverture (0 → 100 vh, fond `ink-950`)
- Nav pilule flottante (logo texte « Dorian Poncelet », liens, CTA « Contact »), translucide `backdrop-filter`, repli en burger sous 768 px.
- `<h1>` sur deux lignes : nom + intitulé validé (ex. « Dorian Poncelet / Cybersécurité & GRC » — texte final issu de CONTENU_A_VALIDER 1.1).
- Chapô 2 lignes (proposition de valeur) + 2 boutons : « Voir les projets » (accent) et « Me contacter » (contour).
- Derrière/à droite : le `<canvas>` de la séquence, frame 0 affichée dès le chargement par une `<img>` poster.
- Étiquettes monospace discrètes en bas : `// disponible · remote · France` (si validé), indicateur « Défiler ».

### B — Séquence pilotée (100 → 400 vh, section épinglée)
- La section est `pin`-ée par ScrollTrigger ; la séquence (60-80 frames) avance avec le scroll, `scrub: 0.6`.
- Trois légendes se succèdent en crossfade sur la gauche, chacune ancrée à un tiers de la séquence, numérotées `01 / 02 / 03` :
  - `01 — Infrastructures` : « Déployer et durcir » + 1 ligne de preuve (ex. « 12 VM Terraform, SIEM Wazuh — Nova Syndicate »).
  - `02 — Détection` : « Observer et répondre » + preuve (Kessel SOC, Red Shield).
  - `03 — Gouvernance` : « Cartographier, prioriser, prouver » + preuve (SMSI Lab, Green Shield).
- Chaque légende contient un lien vers la carte projet correspondante.
- Mobile (< 768 px) ou `reduced-motion` ou `saveData` : pas d'épinglage ; la séquence est remplacée par le poster + les trois légendes empilées.

### C — Risques & gouvernance (fond `paper-50`, transition par fondu de couleur de fond sur 40 vh)
- Titre h2 : « Du contrôle technique à la décision ».
- À gauche : paragraphe de positionnement GRC (texte validé).
- À droite : **matrice de risques SVG 5×5** dessinée en code (pas une image), dont les cellules se colorent à l'entrée dans le viewport ; trois points placés = trois exemples génériques (pas de données client). Sous `reduced-motion`, elle est affichée complète.
- Bandeau de référentiels réellement présents dans les projets : ISO 27001, NIS 2, RGPD, NIST CSF 2.0, DORA, CIS Controls, EBIOS RM — chacun avec le nombre de projets qui le citent (calculé depuis projects.json).

### D — Projets (fond `paper-50` puis `ink-900` pour les études de cas)
- Filtres (chips, `aria-pressed`) : Tous · GRC & conformité · Infrastructure & SecOps · IA & automatisation · Formation · Autres.
- Grille de cartes (1 → 2 → 3 colonnes) : numéro mono, titre, 2 lignes de description, 4 tags max, statut (Lab / Perso / Vitrine / En pause — issu de l'inventaire), lien GitHub. Pas d'icône décorative colorée : une vignette **générée** (motif de points dérivé du nom, déterministe) ou une capture réelle quand le README en fournit une.
- Études de cas (4-6, sur fond sombre) : blocs larges alternés image/texte avec le plan Contexte · Problème · Démarche · Résultats observables · Limites · Lien. Les captures proviennent des README (déjà publiques). Contenu rédigé seulement après validation (CONTENU_A_VALIDER §4).

### E — CyberPulse (fond `ink-950`)
- Titre h2 + mention « Source : The Hacker News · traduction automatique · mis à jour le JJ/MM ».
- Lecteur audio : bouton Lecture/Pause, barre de progression **accessible** (`<input type=range>` stylé), temps, pas de visualiseur décoratif.
- 3 articles : index mono, titre (lien externe), 1-2 phrases.
- Si `data.json` est absent ou invalide : section masquée (comportement actuel conservé).

### F — Formation & certifications (fond `paper-50`)
- Liste sobre à deux colonnes : intitulé, organisme, **statut explicite** (Validé le … / En cours — fin prévue …), lien de vérification quand il existe.

### G — Contact (fond `ink-950`)
- Titre h2 très grand : « Parlons sécurité. » (ou texte validé).
- Trois liens-boutons : E-mail, LinkedIn, GitHub (+ TryHackMe en secondaire).
- Formulaire `mailto:` (labels associés, message d'état honnête) ou retiré selon 5.5.
- Pied de page : nom, année dynamique, lien vers le dépôt du site, lien « Accessibilité » (page/ancre décrivant les limites connues).

### Assistant (option A)
- Bouton flottant discret en bas à droite « Questions fréquentes » (icône bulle), panneau latéral : champ de recherche + suggestions cliquables (« Quel poste cherchez-vous ? », « Quels projets GRC ? »…). Réponses = texte validé + liens. Mention permanente « Réponses automatiques préparées par Dorian — ce n'est pas une personne. » Fermable, accessible clavier, masqué si `profile.json` le désactive.

## 7. Composants (liste pour `css/components.css`)

Nav pilule (+ burger), bouton primaire/secondaire/lien, chip de filtre, carte projet, bloc étude de cas, étiquette mono numérotée, badge de statut (Validé / En cours / Lab / Perso / Vitrine / En pause), matrice de risques SVG, lecteur audio, liste formation, lien-bouton de contact, formulaire, panneau assistant, pied de page, indicateur de défilement, « skip link » vers le contenu.

## 8. Adaptations mobiles

- Nav : burger `<button aria-expanded>` ouvrant un panneau plein écran ; fermeture au choix d'un lien, à Échap, au clic hors panneau.
- Hero : h1 à 44-56 px, boutons empilés pleine largeur, poster de la séquence en 4:5 recadré sous le texte (pas derrière).
- Section B : non épinglée ; légendes empilées avec poster.
- Grilles : 1 colonne sous 640 px, 2 sous 1024 px.
- Cibles tactiles ≥ 44 × 44 px ; aucun effet dépendant du survol (le tilt des cartes est supprimé).
- Padding latéral 16 px ; aucun élément plus large que `100vw` (test automatisé `scrollWidth === clientWidth`).

## 9. Spécification de la séquence à fournir (Dorian)

Pour que la séquence s'intègre sans retouche :

| Paramètre | Attendu |
|---|---|
| Format | MP4 (H.264), MOV, WebM, **ou** suite de PNG/JPG numérotés |
| Résolution | ≥ 1920 × 1080 (idéal 2560 × 1440) ; ratio 16:9 ; sera recadré en 4:5 sur mobile → garder le sujet au centre |
| Durée / cadence | 4 à 8 s ; 24-30 fps → j'extrais 60-80 frames |
| Contenu | Un seul mouvement de caméra lent et continu (travelling ou rotation), sans coupe, sans texte incrusté, sans logo, sans personnage reconnaissable |
| Couleurs | Première frame sombre proche de `#061716` (fond du hero) pour que le canvas se fonde ; palette froide (verts profonds, gris, un seul point lumineux clair ou lime) ; éviter le violet et le rouge |
| Thème (suggestions) | Un rack / salle serveur épurée qui se révèle ; un graphe de nœuds reliés qui se densifie ; une vue isométrique d'infrastructure qui monte vers une couche « gouvernance » (documents, matrice). Le mouvement doit « finir » sur une image stable lisible derrière un titre |
| Dernière frame | Stable et calme : c'est l'état affiché sous `reduced-motion` et après la séquence |
| Livraison | Déposer dans `assets/source/` (sera ignoré par git ; seules les frames WebP optimisées sont versionnées) |

Si la séquence fournie ne respecte pas un point, je le signalerai avant intégration plutôt que de le contourner silencieusement.

## 10. États sans animation (garantis)

| Situation | Rendu |
|---|---|
| `prefers-reduced-motion` | Aucune transition ; séquence = frame finale ; vidéos de cartes = poster ; matrice complète ; tout contenu visible |
| JavaScript désactivé | Contenu complet et lisible (HTML sémantique rendu serveur-less) ; projets : message « Liste des projets sur GitHub » + lien ; CyberPulse masqué via `<noscript>` ; nav : liens d'ancre fonctionnels |
| Frames non chargées / erreur | Poster conservé, légendes affichées, aucun blocage du scroll |
| `saveData` ou connexion lente (`effectiveType` 2g/3g) | Séquence non téléchargée ; poster seul |
| Écran < 768 px | Pas d'épinglage ; version empilée |

## 11. Ce que le prototype de phase 2 doit démontrer

1. Nav pilule + burger fonctionnels à 320/375/768/1280 px.
2. Hero avec h1, chapô, CTA, poster (image temporaire générée en SVG tant que la séquence n'est pas livrée).
3. Section B épinglée avec séquence **factice** (dégradé animé sur canvas) pour valider la mécanique de scrub, les légendes et les replis.
4. Transition sombre → clair et matrice de risques SVG.
5. Palette, typographie et composants de base appliqués.
6. Zéro `innerHTML`, zéro style inline, CSP meta active.

Le prototype vit sur la branche `refonte-2027` ; `main` reste le site actuel.
