#!/usr/bin/env python3
"""
Valide les fichiers de données générés avant publication.

  python scripts/validate_data.py cyberpulse   # cyber-news/data.json + mp3
  python scripts/validate_data.py projects     # data/projects.json
  python scripts/validate_data.py              # les deux

Code de sortie 1 à la première erreur : utilisé par les workflows pour bloquer
un commit de données incohérentes.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"ERREUR {path.relative_to(ROOT)} : {e}")


def check_cyberpulse() -> None:
    import jsonschema
    data = load(ROOT / "cyber-news" / "data.json")
    schema = load(ROOT / "schemas" / "cyberpulse.schema.json")
    try:
        jsonschema.validate(data, schema)
    except jsonschema.ValidationError as e:
        sys.exit(f"ERREUR cyber-news/data.json : {e.message} (à {'/'.join(map(str, e.path)) or 'racine'})")
    if data["audio_file"] is None:
        print(f"ok cyberpulse : {len(data['articles'])} articles, SANS audio (signalé), {data['generated_at']}")
        return
    audio = ROOT / "cyber-news" / data["audio_file"]
    if not audio.is_file() or audio.stat().st_size < 20_000:
        sys.exit(f"ERREUR audio manquant ou trop petit : {audio}")
    print(f"ok cyberpulse : {len(data['articles'])} articles, {audio.stat().st_size // 1024} Ko d'audio, {data['generated_at']}")


def check_projects() -> None:
    data = load(ROOT / "data" / "projects.json")
    projects = data.get("projects")
    if not isinstance(projects, list) or not projects:
        sys.exit("ERREUR data/projects.json : liste de projets vide")
    for p in projects:
        for key in ("id", "title", "url", "description", "group", "stack"):
            if key not in p:
                sys.exit(f"ERREUR projet {p.get('id', '?')} : champ {key} manquant")
        if not p["url"].startswith("https://github.com/Dow08/"):
            sys.exit(f"ERREUR projet {p['id']} : URL inattendue {p['url']}")
    print(f"ok projects : {len(projects)} projets, {data.get('repo_count')} repos")


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    if which in ("cyberpulse", "all"):
        check_cyberpulse()
    if which in ("projects", "all"):
        check_projects()
