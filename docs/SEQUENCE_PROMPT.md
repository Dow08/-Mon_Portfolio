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

## 5. Livraison

Dépose le fichier (MP4/MOV/WebM, ou dossier de PNG) dans `assets/source/` (ignoré par git). Je vérifie la conformité (ratio, luminosité de la première image, stabilité de la dernière), j'extrais les frames avec `scripts/extract_frames.py`, et je remplace le poster SVG temporaire. Si quelque chose ne va pas, je te le dis avant d'intégrer.
