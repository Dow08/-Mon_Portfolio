#!/usr/bin/env python3
"""
Concatène les feuilles CSS sources (css/*.css, dans l'ordre ci-dessous) en un seul
fichier css/site.css légèrement minifié, pour une seule requête bloquante.

  python scripts/build_css.py          # écrit css/site.css
  python scripts/build_css.py --check  # code 1 si css/site.css n'est pas à jour

Les sources restent la référence : modifier css/tokens.css etc., puis relancer.
tests/test_build_css.py échoue si l'on oublie.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ["tokens.css", "base.css", "layout.css", "components.css", "motion.css"]
OUT = ROOT / "css" / "site.css"


def minify(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)          # commentaires
    css = re.sub(r"\s+", " ", css)                            # espaces
    css = re.sub(r"\s*([{};:,>])\s*", r"\1", css)             # autour des séparateurs
    css = css.replace(";}", "}")
    return css.strip()


def build() -> str:
    parts = []
    for name in SOURCES:
        src = (ROOT / "css" / name).read_text(encoding="utf-8")
        # Les URL relatives aux sources restent valides : même dossier.
        parts.append(f"/* {name} */" + minify(src))
    header = "/* Fichier généré par scripts/build_css.py — ne pas éditer. Sources : css/*.css */\n"
    return header + "\n".join(parts) + "\n"


def main() -> int:
    expected = build()
    if "--check" in sys.argv:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != expected:
            print("css/site.css n'est pas à jour : lancer python scripts/build_css.py")
            return 1
        print("css/site.css à jour")
        return 0
    OUT.write_text(expected, encoding="utf-8")
    print(f"ok css/site.css ({len(expected.encode('utf-8')) // 1024} Ko)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
