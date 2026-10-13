#!/usr/bin/env python3
"""
Génère data/projects.json à partir des dépôts GitHub publics de l'auteur.

Reprend à l'identique la logique de l'ancien renderProjects() côté client :
  - tous les repos publics, hors forks et hors ce portfolio ;
  - si le README contient des sections "### slug" ET qu'un dossier racine
    du même nom existe, une carte par section ; sinon une carte pour le repo ;
  - "Stack : a, b, c" -> tags ; une ligne commençant par ⭐/★/Featured -> à la une ;
  - EXCLUDE_SLUGS retire les sections qui ne sont pas des projets.

Usage :
  python scripts/build_projects.py            # écrit data/projects.json
  python scripts/build_projects.py --check    # vérifie aussi que chaque URL répond
  GITHUB_TOKEN=... python scripts/build_projects.py   # évite le rate-limit (Action)

Le script ÉCHOUE (code 1) si aucun projet n'est trouvé, si une carte de
l'inventaire de référence manque, ou si une URL ne répond pas (--check).
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

OWNER = "Dow08"
SELF_REPO = "-Mon_Portfolio"
EXCLUDE_SLUGS = {"site-web"}
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "projects.json"
REFERENCE = ROOT / "docs" / "LIENS_ET_PROJETS.md"

# Groupes éditoriaux affichés sur le site (clé -> libellé). L'ancien libellé
# par repo est conservé dans "repo_label" pour traçabilité.
GROUPS = {
    "grc": "GRC & conformité",
    "secops": "Infrastructure & SecOps",
    "ia": "IA & automatisation",
    "formation": "Formation",
    "autres": "Autres travaux",
}
REPO_GROUP = {
    "GRC-Compliance": "grc",
    "Green-Shield-GRC": "grc",
    "Portfolio": "grc",            # demoday-pixelstore : pentest + analyse GRC
    "Infrastructure-SecOps": "secops",
    "RED-SHIELD-": "secops",
    "AI-Automation": "ia",
    "OS-Agentique_showcase": "ia",
    "Formation": "formation",
    "Divers": "autres",
    "Saison-et-Terroir-Application-smartphone": "autres",
}
REPO_LABELS = {
    "Infrastructure-SecOps": "Infrastructure",
    "GRC-Compliance": "GRC",
    "AI-Automation": "IA & Automatisation",
    "Portfolio": "Portfolio",
    "Divers": "Divers",
    "Formation": "Formation",
}
# Statut constaté dans les README (docs/LIENS_ET_PROJETS.md). Clé = fin d'URL.
STATUS = {
    "OS-Agentique_showcase": "vitrine",      # code source privé
    "Green-Shield-GRC": "perso",
    "RED-SHIELD-": "perso",
    "cours-et-certifications": "formation",
    "exercices-python": "formation",
    "Saison-et-Terroir-Application-smartphone": "perso",
    "agent-hermes-local": "perso",
    "actu-cybersecurite": "perso",
    "netguard-surveillance": "perso",
    "smsi-automation-lab": "lab",
    "iac-auditor-agent": "perso",
    "agent-rgpd-lea": "perso",
    "syntaris-compliance-lab": "lab",
    "demoday-pixelstore": "formation",
    "nova-syndicate": "lab",
    "kessel-soc-siem": "lab",
    "meet-voice-devsecops": "lab",
    "cyber-homelab-vps": "perso",
    "vps-osint-hermes": "perso",
    "active-directory": "lab",
    "nexus-conformite": "perso",
    "outils-divers": "perso",
    "trp-site-ami": "perso",
    "sortia-app": "pause",
}
NAME_FIXES = {
    "Iac": "IaC", "Smsi": "SMSI", "Rgpd": "RGPD", "Vps": "VPS", "Osint": "OSINT",
    "Soc": "SOC", "Siem": "SIEM", "Ccm": "CCM", "Nist": "NIST", "Csf": "CSF",
    "Pci": "PCI", "Dss": "DSS", "Trp": "TRP", "Ai": "AI", "Devsecops": "DevSecOps",
    "Lea": "LÉA", "Hermes": "Hermès", "Pixelstore": "PixelStore",
    "Cybersecurite": "Cybersécurité", "Conformite": "Conformité", "Grc": "GRC",
    "Os": "OS",
}
LOWERCASE_WORDS = {"Et", "De", "Des", "Du", "La", "Le", "Un", "Une", "En", "À", "Au"}
REFERENTIALS = {
    "ISO 27001": r"iso ?27001",
    "NIS 2": r"nis ?2\b",
    "RGPD": r"rgpd|gdpr",
    "NIST CSF": r"nist(?: csf)?",
    "DORA": r"\bdora\b",
    "CIS Controls": r"\bcis\b",
    "EBIOS RM": r"ebios",
    "PCI DSS": r"pci",
}


def gh_get(url: str, raw: bool = False) -> str | None:
    headers = {"User-Agent": "portfolio-build/1.0"}
    token = os.environ.get("GITHUB_TOKEN")
    if token and not raw:
        headers["Authorization"] = f"Bearer {token}"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
            return r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def format_title(slug: str) -> str:
    words = [w[:1].upper() + w[1:].lower() for w in re.sub(r"[-_]", " ", slug).split()]
    out = []
    for i, w in enumerate(words):
        if w in NAME_FIXES:
            out.append(NAME_FIXES[w])
        elif i > 0 and w in LOWERCASE_WORDS:
            out.append(w.lower())
        else:
            out.append(w)
    return " ".join(out)


def strip_markdown(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    text = re.sub(r"\[(.+?)\]\(.+?\)", r"\1", text)
    return text


def join_desc_lines(lines: list[str]) -> str:
    """Recolle les README dont les accents ont été isolés sur leur propre ligne."""
    result, prev_fragment = "", False
    for line in lines:
        t = line.strip()
        fragment = 0 < len(t) <= 2
        if result == "":
            result = line
        elif fragment or prev_fragment:
            result += line
        else:
            result += " " + line
        prev_fragment = fragment
    return re.sub(r"\s+", " ", result).strip()


def parse_readme_projects(md: str) -> list[dict]:
    lines = [l.rstrip("\r") for l in md.split("\n")]
    h3 = [i for i, l in enumerate(lines) if re.match(r"^###\s+", l.strip())]
    projects = []
    for k, start in enumerate(h3):
        end = h3[k + 1] if k + 1 < len(h3) else len(lines)
        slug = re.sub(r"^###\s+", "", lines[start].strip()).strip()
        section = lines[start + 1:end]
        sig = next((i for i, l in enumerate(section) if l.strip().startswith("**")), -1)
        if sig != -1:
            section = section[:sig]
        section = [l for l in section if l.strip() and l.strip() != "---"]
        stack, featured, desc = [], False, []
        for l in section:
            t = l.strip()
            if re.match(r"^(⭐|★|Featured\b)", t, re.I):
                featured = True
                continue
            m = re.match(r"^Stack\s*:\s*(.+)$", t, re.I)
            if m:
                stack = [s.strip() for s in m.group(1).split(",") if s.strip()]
            else:
                desc.append(l)
        projects.append({"slug": slug, "desc": strip_markdown(join_desc_lines(desc)),
                         "stack": stack, "featured": featured})
    return projects


def root_dirs(repo: dict) -> list[str] | None:
    body = gh_get(f"https://api.github.com/repos/{OWNER}/{repo['name']}/contents/?ref={repo['default_branch']}")
    if body is None:
        return None
    items = json.loads(body)
    return [i["name"] for i in items if i.get("type") == "dir"] if isinstance(items, list) else None


def build() -> dict:
    repos = json.loads(gh_get(f"https://api.github.com/users/{OWNER}/repos?sort=updated&per_page=100") or "[]")
    candidates = [r for r in repos if not r["fork"] and r["name"] != SELF_REPO]
    projects: list[dict] = []
    for repo in candidates:
        md = gh_get(f"https://raw.githubusercontent.com/{OWNER}/{repo['name']}/{repo['default_branch']}/README.md", raw=True) or ""
        subs = [p for p in parse_readme_projects(md) if p["slug"] not in EXCLUDE_SLUGS]
        if subs:
            dirs = root_dirs(repo)
            if dirs is None:
                raise RuntimeError(f"Impossible de lister les dossiers de {repo['name']}")
            subs = [p for p in subs if p["slug"] in dirs]
        group = REPO_GROUP.get(repo["name"], "autres")
        if subs:
            for p in subs:
                projects.append({
                    "id": p["slug"],
                    "title": format_title(p["slug"]),
                    "group": group,
                    "group_label": GROUPS[group],
                    "repo": repo["name"],
                    "repo_label": REPO_LABELS.get(repo["name"], repo["name"]),
                    "description": p["desc"] or "Projet en cours de documentation.",
                    "stack": p["stack"],
                    "featured": p["featured"],
                    "status": STATUS.get(p["slug"], "perso"),
                    "url": f"{repo['html_url']}/tree/{repo['default_branch']}/{p['slug']}",
                    "updated_at": repo["pushed_at"],
                })
        else:
            projects.append({
                "id": repo["name"],
                "title": format_title(repo["name"]),
                "group": group,
                "group_label": GROUPS[group],
                "repo": repo["name"],
                "repo_label": REPO_LABELS.get(repo["name"], "Projet"),
                "description": repo["description"] or "Projet en cours de documentation.",
                "stack": [repo["language"]] if repo["language"] else [],
                "featured": False,
                "status": STATUS.get(repo["name"], "perso"),
                "url": repo["html_url"],
                "updated_at": repo["pushed_at"],
            })
    projects.sort(key=lambda p: (not p["featured"]))  # tri stable : à la une en tête

    text_all = " ".join(p["description"] + " " + " ".join(p["stack"]) for p in projects).lower()
    referentials = {name: sum(1 for p in projects if re.search(rx, (p["description"] + " " + " ".join(p["stack"])).lower()))
                    for name, rx in REFERENTIALS.items()}
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "owner": OWNER,
        "repo_count": len(candidates),
        "groups": GROUPS,
        "referentials": {k: v for k, v in referentials.items() if v},
        "projects": projects,
    }


def validate(data: dict, check_links: bool) -> list[str]:
    errors = []
    if not data["projects"]:
        errors.append("aucun projet généré")
    for p in data["projects"]:
        if not p["url"].startswith("https://github.com/"):
            errors.append(f"URL suspecte : {p['url']}")
        if not p["title"] or not p["description"]:
            errors.append(f"carte incomplète : {p['id']}")
    if REFERENCE.exists():
        # Seules les URL de cartes (repo ou /tree/) sont attendues ; les autres liens
        # du document (badge Actions, profil) ne sont pas des projets.
        ref_urls = {u for u in re.findall(r"\| (https://github\.com/Dow08/[^\s|]+) \|", REFERENCE.read_text(encoding="utf-8"))
                    if "/actions/" not in u}
        got = {p["url"] for p in data["projects"]}
        for u in sorted(ref_urls - got):
            errors.append(f"carte de référence manquante : {u}")
    if check_links:
        for p in data["projects"]:
            try:
                req = urllib.request.Request(p["url"], method="HEAD", headers={"User-Agent": "portfolio-build/1.0"})
                urllib.request.urlopen(req, timeout=30)
            except Exception as e:  # noqa: BLE001
                errors.append(f"lien injoignable : {p['url']} ({e})")
    return errors


def main() -> int:
    data = build()
    errors = validate(data, "--check" in sys.argv)
    if errors:
        print("ERREURS :", *errors, sep="\n  - ")
        return 1
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK : {len(data['projects'])} projets, {data['repo_count']} repos -> {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
