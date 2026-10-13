"""Tests du générateur de projets (logique identique à l'ancien renderProjects())."""
import re
from pathlib import Path

import build_projects as bp

ROOT = Path(__file__).resolve().parent.parent

# Extrait réel du README de GRC-Compliance, dont les accents sont isolés sur
# leur propre ligne (constaté dans docs/LIENS_ET_PROJETS.md).
MANGLED = """# GRC & Compliance

## Projets

### smsi-automation-lab
SMSI complet pour une PME fictive (TechShop SAS)
—
 d
é
ploiement CISO Assistant.
Stack : Docker, Python, CISO Assistant

### notes
Section sans dossier.

---

**Dorian Poncelet** — [GitHub](https://github.com/Dow08) · Rodez
"""


def test_format_title_fixes_acronyms_and_small_words():
    assert bp.format_title("iac-auditor-agent") == "IaC Auditor Agent"
    assert bp.format_title("agent-rgpd-lea") == "Agent RGPD LÉA"
    assert bp.format_title("Saison-et-Terroir") == "Saison et Terroir"
    assert bp.format_title("OS-Agentique_showcase") == "OS Agentique Showcase"


def test_join_desc_lines_reassembles_broken_accents():
    lines = ["conformit", "é", " r", "é", "glementaire.", "Suite normale."]
    assert bp.join_desc_lines(lines) == "conformité réglementaire. Suite normale."


def test_parse_readme_projects_extracts_sections_stack_and_signature():
    projects = bp.parse_readme_projects(MANGLED)
    assert [p["slug"] for p in projects] == ["smsi-automation-lab", "notes"]
    smsi = projects[0]
    assert smsi["stack"] == ["Docker", "Python", "CISO Assistant"]
    assert "déploiement CISO Assistant" in smsi["desc"]
    assert smsi["featured"] is False
    # la signature finale "**Dorian…**" ne doit pas polluer la dernière section
    assert "Dorian" not in projects[1]["desc"]


def test_featured_marker_and_markdown_stripping():
    md = "### demo\n⭐ à la une\nUn **projet** avec `code` et [lien](https://x).\n"
    p = bp.parse_readme_projects(md)[0]
    assert p["featured"] is True
    assert p["desc"] == "Un projet avec code et lien."


def test_generated_file_contains_every_reference_card():
    """Non-régression : les 24 URL de l'inventaire doivent être dans data/projects.json."""
    import json
    data = json.loads((ROOT / "data" / "projects.json").read_text(encoding="utf-8"))
    got = {p["url"] for p in data["projects"]}
    ref = {u for u in re.findall(r"\| (https://github\.com/Dow08/[^\s|]+) \|",
                                 (ROOT / "docs" / "LIENS_ET_PROJETS.md").read_text(encoding="utf-8"))
           if "/actions/" not in u}
    assert ref, "inventaire de référence introuvable"
    assert ref <= got, f"cartes manquantes : {sorted(ref - got)}"
    assert bp.validate(data, check_links=False) == []
