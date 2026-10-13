# Inventaire des liens et projets (référence avant refonte)

Date : 2026-10-13 · Source : API GitHub (`/users/Dow08/repos`, README bruts, `/contents/`) + rendu réel du site (24 cartes comptées dans le DOM).

**Règle** : après la refonte, chaque URL de ce document doit exister à l'identique sur le site (ou sa suppression doit être justifiée et validée). Ce fichier sert de jeu de test de non-régression pour le futur générateur `projects.json`.

---

## 1. Cartes projets actuellement affichées (24)

Reproduction exacte de l'algorithme `renderProjects()` : un repo dont le README contient des sections `### slug` correspondant à des **dossiers racine existants** est éclaté en une carte par section ; sinon une carte unique. Aucun README ne contient de marqueur `⭐` : **aucune carte « à la une » aujourd'hui**.

| # | Titre affiché | Catégorie | URL exacte | Description (source README / repo) | Stack documentée | Type / statut (constaté) |
|---|---|---|---|---|---|---|
| 1 | Os Agentique Showcase | Projet | https://github.com/Dow08/OS-Agentique_showcase | Équipe de 20 agents IA en local sur Windows : interface vocale, approbation humaine pour chaque action sensible, résultats vérifiés. Vitrine d'Hermes OS. (desc. repo ; le README dit 30 agents / 6 départements) | — (repo sans langage détecté ; README : Python, Windows 11, Ollama, Claude) | **Vitrine** : code source dans un repo privé. Projet personnel, en cours. |
| 2 | Green Shield Grc | Projet | https://github.com/Dow08/Green-Shield-GRC | Cockpit de conduite de mission pour consultant cybersécurité, 100 % local, de la phase de cadrage à la restitution Comex. | Python (repo) ; README : React 19, FastAPI, Python 3.12, Docker | Projet personnel, licence PolyForm Noncommercial, CI + Trivy, « 750 tests back / 183 front » (badge, non vérifié ici). 1 ⭐. |
| 3 | Red Shield | Projet | https://github.com/Dow08/RED-SHIELD- | Plateforme d'audit cyber tout-en-un red + blue, modulaire, 100 % locale (scan, monitoring, CVE, GRC, rapport). | Python (repo) ; README : FastAPI, React, Vite, Tailwind, Tauri v2 | Projet personnel, PolyForm Noncommercial, Trivy CI, « 112 pytest + 7 vitest » (badge, non vérifié). |
| 4 | Cours et Certifications | Formation | https://github.com/Dow08/Formation/tree/master/cours-et-certifications | Notes et supports sur ISO 27001:2022, NIS2, RGPD, réseau/OSI, sécurité technique et cloud. En construction au fil de la formation. | — | Notes de formation (AIS RNCP37680). README : « MAJ – migration sur Notion » → contenu peut-être déplacé. |
| 5 | Exercices Python | Formation | https://github.com/Dow08/Formation/tree/master/exercices-python | Scripts et exercices de scripting Python — automatisation, manipulation de fichiers, bases du développement orienté sécurité. | — | Exercices |
| 6 | Saison et Terroir Application Smartphone | Projet | https://github.com/Dow08/Saison-et-Terroir-Application-smartphone | Application de recherche par géolocalisation d'activités pour des vacances (OpenStreetMap/Overpass, Photon ; 5 langues ; APK Android). | TypeScript | Projet personnel hors cyber. |
| 7 | Agent Hermes Local | IA & Automatisation | https://github.com/Dow08/AI-Automation/tree/master/agent-hermes-local | Agent IA personnalisé 100 % local — multi-modèles (Ollama, Mistral, GLM), dashboard adaptatif, sélection dynamique du LLM. | Python, Ollama, Mistral, GLM | Projet personnel |
| 8 | Actu Cybersecurite | IA & Automatisation | https://github.com/Dow08/AI-Automation/tree/master/actu-cybersecurite | Scraper de veille cybersécurité — agrégation de news et podcasts, classement par thématique. | Python | Projet personnel |
| 9 | Netguard Surveillance | IA & Automatisation | https://github.com/Dow08/AI-Automation/tree/master/netguard-surveillance | Backend de surveillance réseau — monitoring des connexions et détection d'anomalies. | Python | Projet personnel |
| 10 | Smsi Automation Lab → affiché « SMSI Automation Lab » | GRC | https://github.com/Dow08/GRC-Compliance/tree/master/smsi-automation-lab | SMSI complet pour une PME fictive (TechShop SAS) — CISO Assistant, scripting Python pour les livrables ISO 27001:2022, cartographie NIS2 et RGPD. | Docker, Python, CISO Assistant | **Lab** formation, entreprise fictive |
| 11 | IaC Auditor Agent | GRC | https://github.com/Dow08/GRC-Compliance/tree/master/iac-auditor-agent | Agent d'audit IaC — analyse Ansible/Terraform/Docker, mapping ISO 27001, NIS2, CIS Controls, rapports HTML. | Python, Ansible, Terraform | Projet |
| 12 | Agent RGPD LÉA | GRC | https://github.com/Dow08/GRC-Compliance/tree/master/agent-rgpd-lea | Assistant conversationnel local RGPD — RAG sur sources CNIL, ANSSI, EUR-Lex, 100 % offline via Ollama. | Python, Ollama, ChromaDB, Mistral | Projet |
| 13 | Syntaris Compliance Lab | GRC | https://github.com/Dow08/GRC-Compliance/tree/master/syntaris-compliance-lab | Évaluation de maturité NIST CSF 2.0 pour une entreprise fictive — scoring, visualisations, plan de remédiation RGPD et PCI-DSS. | Python | **Lab**, entreprise fictive |
| 14 | Demoday PixelStore | Portfolio | https://github.com/Dow08/Portfolio/tree/master/demoday-pixelstore | E-commerce Flask déployé sur AWS — Terraform, tests de pénétration, remédiation, analyse GRC (ISO 27001, NIST CSF, FAIR). | Flask, AWS, Terraform, Python | Projet de fin de bootcamp (Demo Day Jedha) |
| 15 | Nova Syndicate | Infrastructure | https://github.com/Dow08/Infrastructure-SecOps/tree/master/nova-syndicate | Infrastructure multi-sites — 12 VMs Terraform, 10 playbooks Ansible, SIEM Wazuh, VLAN, WireGuard, PCA, budget CAPEX/OPEX. | Terraform, Ansible, Wazuh, WireGuard | **Lab** formation |
| 16 | Kessel SOC SIEM | Infrastructure | https://github.com/Dow08/Infrastructure-SecOps/tree/master/kessel-soc-siem | SOC fonctionnel avec Wazuh — sources de logs, tests de détection brute force, tuning des règles. | Wazuh, Linux | **Lab** |
| 17 | Meet Voice DevSecOps | Infrastructure | https://github.com/Dow08/Infrastructure-SecOps/tree/master/meet-voice-devsecops | Stack de monitoring complet (Prometheus, Grafana, Alertmanager, Loki, Promtail) orchestré par Ansible. | Ansible, Prometheus, Grafana, Loki | **Lab** |
| 18 | Cyber Homelab VPS | Infrastructure | https://github.com/Dow08/Infrastructure-SecOps/tree/master/cyber-homelab-vps | Station OSINT auto-hébergée sur VPS — environnement de veille et d'investigation isolé. | Linux, VPS | Homelab |
| 19 | VPS OSINT Hermès | Infrastructure | https://github.com/Dow08/Infrastructure-SecOps/tree/master/vps-osint-hermes | Déploiement one-shot d'un VPS personnel — outillage OSINT et agent Hermès, installation automatisée. | Python, Bash, Linux | Projet personnel |
| 20 | Active Directory | Infrastructure | https://github.com/Dow08/Infrastructure-SecOps/tree/master/active-directory | Administration AD sous Windows Server — utilisateurs, GPO, sécurisation de l'annuaire. | Windows Server, Active Directory | **Lab** |
| 21 | Nexus Conformité | Divers | https://github.com/Dow08/Divers/tree/master/nexus-conformite | Projet de conformité — dashboard et documentation réglementaire. | — | Divers |
| 22 | Outils Divers | Divers | https://github.com/Dow08/Divers/tree/master/outils-divers | Outils personnels et scripts utilitaires. | — | Divers |
| 23 | TRP Site Ami | Divers | https://github.com/Dow08/Divers/tree/master/trp-site-ami | Site web réalisé pour un ami. | — | Divers |
| 24 | Sortia App | Divers | https://github.com/Dow08/Divers/tree/master/sortia-app | Application mobile — projet en pause. | — | **En pause** |

### Éléments exclus par l'algorithme actuel (constaté)
- `-Mon_Portfolio` (ce site) — exclu explicitement.
- `Portfolio/site-web` — exclu (`EXCLUDE_SLUGS`), copie ancienne du portfolio.
- `AI-Automation/voxlocal` — dossier présent **sans section README** → jamais affiché. À décider : documenter ou laisser hors site.
- Sections `###` des gros README (Green Shield, Red Shield) : sans dossier homonyme → correctement ignorées (le repo donne une carte unique).

## 2. Liens de navigation et de contact

| Libellé | URL / cible | Statut |
|---|---|---|
| Nav : About / Projets / Skills / Veille / Contact | `#about` `#projects` `#skills` `#cyberpulse` `#contact` | Fonctionnent |
| CTA « Me contacter », « Voir mes projets » | `#contact`, `#projects` | Fonctionnent |
| Email | `mailto:Dow@ikmail.com` | **À valider** (adresse à confirmer) |
| LinkedIn | https://www.linkedin.com/in/dorian-p-1807612b5/ | **Confirmé par Dorian (2026-10-13)** ; l'ancien README pointait vers un slug erroné, corrigé |
| GitHub | https://github.com/Dow08 | OK |
| TryHackMe | https://tryhackme.com/p/seallia81 | OK (rang « Top 7 % » à valider à date) |
| CV | « Sur demande » (pas de lien) | À valider : garder ainsi ou publier un PDF |
| Articles CyberPulse | 3 URL `thehackernews.com/...` (changent chaque jour) | Dynamiques |
| Badge README → Actions | https://github.com/Dow08/-Mon_Portfolio/actions/workflows/daily_cron.yml | OK |

## 3. Repos GitHub (11, aucun fork)

| Repo | Branche | Langage | Dernier push | Rôle sur le site |
|---|---|---|---|---|
| -Mon_Portfolio | main | HTML | 2026-10-11 | Le site (exclu) |
| OS-Agentique_showcase | main | — | 2026-10-02 | 1 carte |
| Green-Shield-GRC | main | Python | 2026-09-28 | 1 carte |
| RED-SHIELD- | main | Python | 2026-10-01 | 1 carte |
| Formation | master | Python | 2026-07-19 | 2 cartes |
| Saison-et-Terroir-Application-smartphone | main | TypeScript | 2026-07-16 | 1 carte |
| AI-Automation | master | TypeScript | 2026-07-02 | 3 cartes (+ voxlocal non listé) |
| GRC-Compliance | master | Python | 2026-06-17 | 4 cartes |
| Portfolio | master | HTML | 2026-06-17 | 1 carte (site-web exclu) |
| Infrastructure-SecOps | master | Python | 2026-06-17 | 6 cartes |
| Divers | master | Dart | 2026-06-17 | 4 cartes |

## 4. Remarques pour la refonte (proposé, à valider)

- Le README de `GRC-Compliance` est **corrompu** (accents isolés sur leur propre ligne : « conformit / é / r / é / glementaire »). Le site le recolle avec `joinDescLines()`. Il faudrait corriger le README à la source — hors périmètre de ce dépôt, à faire par l'utilisateur.
- Les catégories actuelles sont les **noms de repos**. Pour un positionnement GRC, une hiérarchie éditoriale (GRC & conformité → Infrastructure & SecOps → IA & automatisation → Formation → Divers) serait plus lisible, **sans changer les URL**.
- Les projets « Divers » (site d'un ami, outils, app en pause) diluent le message pour un recruteur GRC : proposer de les regrouper dans une section repliée « Autres travaux » plutôt que de les supprimer — **à valider**.
- Candidats évidents pour des **études de cas** (README riches, captures, tests) : Green Shield GRC, Red Shield, OS-Agentique, SMSI Automation Lab, Demoday PixelStore, Nova Syndicate. À valider avec l'utilisateur (rôle réel, contexte, limites).
- Tous les repos de labs mentionnent « entreprise fictive » ou « formation » : cette mention doit **rester visible** sur les cartes (règle « aucune invention »).
