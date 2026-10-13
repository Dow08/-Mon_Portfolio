# Séquence cinématique — prompt de génération et outils

Objectif : une vidéo de 5 à 8 s, un seul mouvement de caméra lent, qui deviendra 60-80 images WebP pilotées par le scroll (section « Approche », de l'infrastructure vers la gouvernance). Spécification technique complète : `DIRECTION_ARTISTIQUE.md` §9.

---

## 1. Le concept retenu (à produire)

**« De la salle serveur à la carte des risques »** — la caméra recule lentement d'un rack de serveurs sombre et épuré ; au fur et à mesure du recul, des lignes fines vert-lime relient les machines entre elles, puis montent vers une couche abstraite au-dessus : une grille de cellules (la matrice de risques) qui s'allument une à une. Dernière image : vue d'ensemble stable, rack en bas, grille lumineuse en haut, beaucoup d'espace vide à gauche (le texte s'y affichera).

Pourquoi ce concept : il raconte exactement le parcours technique → GRC, il reste lisible derrière du texte (sujet à droite, gauche sombre), il finit sur une image calme utilisable en poster.

## 2. Prompt (anglais — les générateurs vidéo comprennent mieux l'anglais)

```
Cinematic slow dolly-out shot, single continuous camera move, no cuts.
Start: extreme close-up of a minimalist dark server rack in a clean data center,
matte black metal, tiny status LEDs in pale lime green (#B8F23D), deep dark
teal ambient background (#061716), soft volumetric light, no people, no text,
no logos.
As the camera pulls back and slightly upward over 6 seconds, thin glowing
lime-green lines emerge from the servers and connect them into a network graph,
then rise upward into a floating translucent 5x5 grid of cells above the rack;
the cells light up one by one from green to amber to coral (#FF6B4A) in the top
right corner, like a risk matrix.
End: wide stable composition, rack at the bottom right, glowing grid at the top
right, large empty dark area on the left third of the frame. Camera comes to a
complete stop on the last frame.
Style: photoreal 3D render, Octane/Unreal look, shallow depth of field at the
start transitioning to deep focus, subtle film grain, muted cool palette
(dark teal, graphite, pale lime accent), no lens flares, no purple, no red
except the coral cells, no particles storm, no glitch effects.
Lighting: low-key, soft rim light, no bright sky.
Motion: very slow, constant speed, no camera shake, no zoom pops.
Format: 16:9, 4K or 1080p, 24 fps, 6 to 8 seconds, loopless (does not need to loop).
```

**Negative prompt** (si l'outil en accepte un) :
```
text, letters, watermark, logo, people, hands, faces, fast motion, camera shake,
cuts, flicker, purple, magenta, neon pink, matrix code rain, padlock, skull,
hooded hacker, lens flare, oversaturated, cartoon, blurry end frame
```

## 2b. Concept alternatif — « Le réseau qui s'organise » (pour comparaison)

Un seul point lumineux dans le noir ; en reculant, des nœuds apparaissent et se relient en graphe (l'infrastructure), puis une grille fine se dessine derrière et les nœuds s'alignent dessus : l'ordre émerge. Plus abstrait, plus intemporel que le rack.

```
Cinematic slow dolly-out, single continuous camera move, no cuts, 8 seconds.
Start: pitch-black deep teal void (#061716), one small glowing lime-green node
(#B8F23D) in the center right of the frame, soft bloom, shallow depth of field.
As the camera pulls back slowly and steadily, more nodes fade in around it,
floating in 3D space, and thin glowing lime lines connect them into a growing
network graph. Around the 5th second, a subtle translucent grid of fine lines
fades in behind the network, and the nodes gently drift to align with the grid,
forming an ordered, layered structure. A few nodes near the top right turn
amber (#F2C94C) then coral (#FF6B4A), like flagged risks.
End: wide, calm, perfectly stable composition; the structured network occupies
the right two thirds of the frame; the left third stays dark and empty.
Camera comes to a complete stop on the last frame, no movement in the final second.
Style: photoreal 3D render, Octane/Unreal look, volumetric haze, subtle film
grain, muted cool palette (dark teal, graphite, pale lime accent), no purple,
no text, no logos, no people, no particle storm, no glitch.
Lighting: low-key, nodes are the only light sources, soft rim light.
Motion: very slow, constant speed, no camera shake, no zoom pops.
Format: 16:9, 4K or 1080p, 24 fps.
```

Negative prompt : celui du §2, plus `numbers, strobe, blue sky, moving last frame`.

## 2c. Concept 3 — « La pile de supervision » (version détaillée, rendu studio)

Trois couches empilées révélées par un dolly-out + crane-up : serveurs (bas), graphe réseau (milieu), matrice de risques en verre (haut), rendu « visualisation produit », matériaux propres, sans particules ni texte. Sujet dans les deux tiers droits, tiers gauche vide.

```
Ultra-clean, high-end 3D product-visualization style, single continuous camera
move, no cuts, 8 seconds, 16:9, 24 fps.

SCENE — a minimalist "security operations stack" floating in a vast, dark,
empty studio void (background color #061716, no horizon, no floor texture,
faint volumetric haze only). The stack is built of three stacked layers,
each a thin, wide, rounded rectangular slab of matte black glass with a
1-pixel lime-green edge light (#B8F23D), hovering 40 cm apart:

  LAYER 1 (bottom) — INFRASTRUCTURE: a precise row of minimalist server
  modules, matte black metal, brushed aluminium edges, tiny pale lime status
  LEDs breathing slowly, perfectly aligned, no cables visible.
  LAYER 2 (middle) — NETWORK: a sparse 3D graph of small glowing nodes
  connected by thin lime light-lines, geometrically ordered, a few nodes
  pulsing softly as packets travel along the lines.
  LAYER 3 (top) — GOVERNANCE: a floating translucent panel showing an
  abstract 5x5 risk matrix of glass cells; cells are lit from pale green
  (bottom left) to amber (#F2C94C) and coral (#FF6B4A, top right); three
  small white markers sit on the matrix; no text, no numbers, no icons.

CAMERA — starts in a tight macro shot on the LEDs of LAYER 1 (shallow depth
of field, bokeh of lime lights), then performs ONE slow, perfectly smooth
dolly-out and gentle crane-up over 8 seconds, revealing LAYER 2, then
LAYER 3, ending on a wide three-quarter view with deep focus. The whole stack
sits in the RIGHT two thirds of the frame; the LEFT third remains dark and
completely empty. The camera decelerates and comes to a complete stop at
7 seconds; the final second is a fully static hold (only the LEDs breathe).

LIGHT & MATERIALS — low-key studio lighting, one soft large key light from
the top left, a faint cool rim light, physically based materials, crisp
reflections, no bloom halos, no lens flare, no dust particles, no fog
beams. Palette strictly: deep teal #061716, graphite, matte black, pale
lime #B8F23D, with amber and coral only inside the risk matrix.

QUALITY — photoreal, Octane / Unreal Engine 5 look, razor-sharp edges,
ultra-detailed, 4K, no noise, no grain, no motion blur, no chromatic
aberration, no vignette, consistent geometry from first to last frame.
```

Negative prompt :
```
text, letters, numbers, icons, UI, HUD, watermark, logo, people, hands,
faces, screens with content, cables, fast motion, camera shake, cuts,
flicker, strobe, purple, magenta, neon pink, blue sky, matrix code rain,
padlock, shield, skull, hooded hacker, globe, lens flare, bloom halo,
dust particles, film grain, motion blur, oversaturated, cartoon, low poly,
blurry last frame, moving last frame, morphing geometry
```

### Version 3.1 (2026-10-13) — retour de Dorian : « fond vide, dernière scène pas terrible »

Cause : la consigne « vide sombre, tiers gauche vide » a été prise au pied de la lettre. Le site pose de toute façon un voile sombre sur la gauche (`.seq__media::after`), donc le fond peut être habité. Corrections : un **environnement** (sol en verre réfléchissant, grille de sol lointaine, mur d'armoires flou en arrière-plan, bandes lumineuses) et un paragraphe **FINAL FRAME** qui décrit l'image finale comme un visuel clé de lancement produit (moitié gauche plus calme et plus sombre, mais pas vide). Negative prompt + `empty black background, flat void`.

**Méthode recommandée** : générer d'abord la **dernière image** seule (Imagen, Midjourney, mode image de Veo) avec les paragraphes ENVIRONMENT + SUBJECT + FINAL FRAME et `single still image, 16:9, 4K`, choisir la meilleure, puis l'utiliser comme **image de fin** (« end frame ») dans Veo 3 ou Runway Gen-4, qui animent vers une image donnée. On contrôle ainsi exactement le plan qui reste à l'écran.

Le critère 3 de la grille devient : « moitié gauche plus calme et plus sombre, mais habitée (grille de sol, reflets) ».

Prompt 3.1 complet : identique au 2c avec le bloc ENVIRONMENT ci-dessous inséré avant SUBJECT et le bloc FINAL FRAME inséré après CAMERA :

```
ENVIRONMENT — a vast, dark, high-tech studio hall, not empty: a polished
dark-glass floor with soft, slightly blurred reflections; a very faint
perspective grid of thin graphite lines etched into the floor, fading into
the distance; far in the background, out of focus, a wall of tall dark
server cabinets with sparse pale lime status LEDs, giving depth and scale;
a subtle cool atmospheric gradient from deep teal (#061716) at the edges to
a slightly lighter graphite-teal behind the subject; thin horizontal light
strips recessed in the floor on the far sides. No fog beams, no dust.
The stack hovers 60 cm above the floor and reflects softly in it.

FINAL FRAME (seconds 7 to 8, fully static, this is the hero image) — a wide
three-quarter view, deep focus: the complete three-layer stack stands in the
right half of the frame, its reflection visible on the floor beneath it; the
blurred cabinet wall and floor grid give depth behind it; the left half of
the frame is calmer and darker but not empty: the floor grid and the faint
reflections continue there, with a soft gradient of light coming from the
stack. Balanced, cinematic, premium composition, like a product launch key
visual. Only the LEDs and the matrix cells breathe during the hold.
```

### Grille de notation des variantes (sur 100 ; garder ≥ 80 et les 3 bloquants réussis)

| # | Critère | Pts | Vérification |
|---|---|---:|---|
| 1 | Première image sombre **(bloquant)** | 15 | pause à 0 s : fond presque noir |
| 2 | Dernière seconde immobile **(bloquant)** | 15 | 7-8 s : rien ne bouge sauf les LED |
| 3 | Tiers gauche vide à la fin **(bloquant)** | 10 | dernière image |
| 4 | Un seul mouvement continu, sans coupe | 10 | aucun saut |
| 5 | Trois couches lisibles | 10 | serveurs / réseau / matrice compréhensibles |
| 6 | Géométrie stable (pas de morphing) | 10 | image par image |
| 7 | Palette respectée (pas de violet ; rouge limité à la matrice) | 8 | reflets, fond |
| 8 | Aucun texte, chiffre, logo, icône, personnage | 8 | zoom sur matrice et serveurs |
| 9 | Netteté : pas de grain, pas de flou de mouvement | 8 | pause à 4 s et 8 s |
| 10 | Propreté : pas de câbles, poussière, halos, flares | 6 | impression « rendu produit » |

### Corrections par défaut observé

| Défaut | Ajout au prompt |
|---|---|
| Première image trop claire | `The first frame is almost completely black; lights fade in from darkness.` |
| Caméra bouge encore à la fin | `The camera stops completely at 6 seconds; frames 6 to 8 are a frozen static shot.` |
| Texte / chiffres | negative : `typography, glyphs, labels, readable symbols` ; prompt : `all surfaces are blank` |
| Trop de particules / brouillard | retirer `faint volumetric haze`, ajouter `perfectly clear air` |
| Géométrie qui se déforme | `rigid, static objects; only the camera moves` + intensité de mouvement plus basse |
| Dérive bleu / violet | `color-graded strictly teal and lime; zero blue, zero purple` |
| Sujet centré | `composition rule: subject anchored to the right, negative space on the left` |

## 3. Réglages à appliquer dans l'outil

| Paramètre | Valeur |
|---|---|
| Ratio | 16:9 |
| Résolution | la plus haute disponible (≥ 1080p ; 4K si possible, j'en tirerai des frames 1280 px nettes) |
| Durée | 6-8 s (5 s minimum) |
| Cadence | 24 fps (ou 30) |
| Mouvement de caméra | « dolly out » / « pull back », intensité faible (1-3 sur 10) |
| Seed | fixer la seed une fois qu'un résultat plaît, pour itérer sans tout changer |
| Amélioration de prompt automatique | désactiver si l'outil le permet (elle ajoute souvent des éléments non voulus) |

Génère 3-4 variantes, garde celle dont **la première image est la plus sombre** et **la dernière la plus stable**. Si la dernière image bouge encore, on peut la figer (je peux prolonger la dernière frame).

## 4. Quel outil ?

Classement selon la qualité de rendu 3D propre, le contrôle de caméra et le prix (état de ma connaissance à juin 2026 — vérifie les tarifs du moment) :

| Outil | Pourquoi | Points d'attention |
|---|---|---|
| **Google Veo 3** (via Gemini / Google AI Studio / Flow) | Meilleur rendu photoréaliste et respect des mouvements de caméra lents ; sortie 1080p native, 8 s | Abonnement Google AI Pro ; désactiver l'audio généré ; parfois ajoute du texte → negative prompt |
| **Runway Gen-4** | Très bon contrôle de caméra (« camera control » dédié), rendu stable | Crédits payants ; 5 ou 10 s |
| **Kling 2.x** | Mouvement fluide, bon rapport qualité/prix, mode « professionnel » 1080p | Interface en partie chinoise/anglaise ; file d'attente en gratuit |
| **Luma Dream Machine (Ray)** | Simple, bons dolly-out, offre gratuite limitée | Rendu parfois plus « soft » |
| **Hailuo (MiniMax)** | Gratuit généreux pour tester le concept | Résolution limitée en gratuit |

Alternative sans IA, 100 % maîtrisée : **Blender** (gratuit) avec un rack modélisé simplement et une animation de caméra ; c'est plus long mais le résultat est exactement celui voulu et réutilisable. Je peux fournir un fichier `.blend` de base si tu préfères cette voie.

Mon conseil : **Veo 3 ou Runway Gen-4** pour une version finale ; Hailuo ou Luma pour tester gratuitement que le concept te plaît.

## 4b. Bilan des générations (2026-10-13)

Quatre vidéos produites par Dorian (1920×1080, 24 fps, 8 s). Notes sur la grille : video1 (salle serveur) 72 · Video2 (réseau) 83 · video3 (pile, v3.1) 80 · **video4 (pile, v3.2) retenue** : seule vidéo **sans aucun texte généré**, rendu propre, sujet plus petit et plus clair (luminance 66 → 80) mais le voile et le cadrage ancré à droite compensent dans la page.

**Leçon principale** : ne jamais écrire de codes hexadécimaux ni de mots-étiquettes (« GOVERNANCE », « INFRASTRUCTURE ») dans un prompt vidéo — les modèles les impriment sur les objets (video3 affichait « B8F233D »). Décrire les couleurs avec des mots et répéter « all surfaces blank ».

Intégration : `python scripts/extract_frames.py assets/source/video4.mp4 --frames 72 --width 1280 --quality 72 --force` (avertissement de luminosité accepté) → 72 WebP, 2,89 Mo, `poster.webp` (hero) et `poster-last.webp`. Dans `js/sequence.js`, le recadrage est ancré à 80 % vers la droite et le mode statique ne charge que la dernière image.

## 5. Livraison

Dépose le fichier (MP4/MOV/WebM, ou dossier de PNG) dans `assets/source/` (ignoré par git). Je vérifie la conformité (ratio, luminosité de la première image, stabilité de la dernière), j'extrais les frames avec `scripts/extract_frames.py`, et je remplace le poster SVG temporaire. Si quelque chose ne va pas, je te le dis avant d'intégrer.
