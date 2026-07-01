# 🛡️ Portfolio Cybersécurité | Poncelet Dorian

[![CyberPulse](https://github.com/Dow08/-Mon_Portfolio/actions/workflows/daily_cron.yml/badge.svg)](https://github.com/Dow08/-Mon_Portfolio/actions/workflows/daily_cron.yml)

> Portfolio professionnel avec veille cybersécurité automatisée et briefings audio quotidiens générés par IA.

🌐 **[Voir le site en ligne](https://dow08.github.io/-Mon_Portfolio/)**

---

## ✨ Fonctionnalités

### 🏠 Portfolio One-Page
- **Hero** : présentation, vidéo de fond, statistiques (dont le nombre de repos GitHub, à jour via l'API)
- **About** : parcours, bloc terminal, chiffres clés
- **Projets** : sélection manuelle et curée des projets phares (voir `PROJETS` dans `index.html`), avec lien direct vers le sous-dossier GitHub concerné
- **Skills** : stack technique par domaine (Infra, Offensive, Défensive, GRC, Management…) + certifications
- **Contact** : formulaire (envoi via `mailto:`), liens directs (email, LinkedIn, GitHub, TryHackMe) et téléchargement du CV

### 🔊 CyberPulse - Veille Automatisée
Pipeline IA quotidien (08:00 UTC) qui :
1. Scrape TheHackerNews pour les 3 derniers articles
2. Traduit en français via GPT/Gemini
3. Génère un script radio
4. Synthétise l'audio avec edge-tts
5. Met à jour le site automatiquement

### 🎨 Design
- Thème futuriste "Vision 2026"
- Animations CSS (particules, aurora orbs)
- Lecteur audio custom avec visualiseur
- 100% responsive

---

## 🚀 Stack Technique

| Catégorie | Technologies |
|-----------|--------------|
| Frontend | HTML5, CSS3, JavaScript Vanilla |
| Backend/Pipeline | Python 3.11, OpenAI/Gemini API |
| Audio | edge-tts (Microsoft voices) |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |

---

## 📁 Structure du Projet

```
├── index.html              # Page principale (HTML + CSS + JS, tout inline)
├── style.css                # ⚠️ non utilisé — hérité d'une ancienne version multi-pages
├── script.js                 # ⚠️ non utilisé — hérité d'une ancienne version multi-pages
├── cyber-news/
│   ├── data.json           # Actualités (généré par IA)
│   └── audio/
│       └── latest_briefing.mp3  # Podcast quotidien
├── src/
│   ├── main.py             # Orchestrateur pipeline
│   ├── scraper.py          # Scraping TheHackerNews
│   └── audio_gen.py        # Génération TTS
├── assets/
│   └── documents/
│       └── CV_Poncelet_Dorian.pdf
├── .github/workflows/
│   ├── deploy.yaml         # Déploiement + Trivy scan
│   └── daily_cron.yml      # Pipeline CyberPulse (08:00 UTC)
└── requirements.txt        # Dépendances Python
```

---

## ⚙️ Configuration

### Secrets GitHub requis

| Secret | Description | Requis |
|--------|-------------|--------|
| `OPEN_AI_KEY` | Clé API OpenAI (GPT-4o-mini) | ✅ ou GEMINI |
| `GEMINI_KEY` | Clé API Google Gemini (fallback) | Optionnel |

> ➡️ `Settings > Secrets and variables > Actions > New repository secret`

### Formulaire de contact

Pas de service tiers : le formulaire construit un lien `mailto:` côté client (voir le handler `contact-form` dans `index.html`) et ouvre le client mail du visiteur avec le message pré-rempli.

---

## 🔧 Développement Local

```bash
# Cloner le repo
git clone https://github.com/Dow08/-Mon_Portfolio.git
cd ./-Mon_Portfolio

# Serveur local
python -m http.server 8080
# → http://localhost:8080

# Tester le pipeline (optionnel)
pip install -r requirements.txt
cd src && python main.py
```

---

## 📊 Déploiement & Workflows GitHub Actions

### Déploiement du site
Géré nativement par **GitHub Pages** (Settings > Pages > Source : "Deploy from a branch" > `main` > `/root`). Chaque push sur `main` republie automatiquement le site, sans workflow ni scan bloquant.

### Security Scan
- **Déclencheur** : Push sur `main` ou manuel — tourne en parallèle du déploiement, ne le bloque jamais
- **Actions** : Scan de vulnérabilités Trivy, résultats dans l'onglet Security du repo

### CyberPulse - Mise à jour quotidienne
- **Déclencheur** : Cron `0 8 * * *` (08:00 UTC) ou manuel
- **Actions** : Scraping → Traduction → Script → Audio → Commit

---

## 🛡️ Sécurité

- ✅ Scan Trivy automatique à chaque push (indépendant du déploiement)
- ✅ Secrets via GitHub Secrets (jamais en dur)
- ✅ `.gitignore` configuré (`.env`, `__pycache__`, etc.)
- ✅ CSP et attributs `rel="noopener noreferrer"` sur liens externes

---

## 📝 Licence

MIT License - Libre d'utilisation et modification.

---

## 👤 Auteur

**Dorian Poncelet**
- 🔗 [GitHub](https://github.com/Dow08)
- 🔗 [LinkedIn](https://www.linkedin.com/in/dorian-poncelet-1807612b5)
- 🔗 [TryHackMe](https://tryhackme.com/p/seallia81)
