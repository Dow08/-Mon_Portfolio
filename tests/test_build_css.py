"""css/site.css doit être régénéré à chaque modification des sources CSS."""
from pathlib import Path

import build_css

ROOT = Path(__file__).resolve().parent.parent


def test_site_css_is_up_to_date():
    assert build_css.OUT.exists(), "lancer python scripts/build_css.py"
    assert build_css.OUT.read_text(encoding="utf-8") == build_css.build()


def test_minify_keeps_rules_and_drops_comments():
    out = build_css.minify("/* c */ a { color : red ; }\n@media (max-width: 10px) { b{ x:1; } }")
    assert out == "a{color:red}@media (max-width:10px){b{x:1}}"


def test_pages_link_the_built_stylesheet_only():
    for page in ("index.html", "404.html", "accessibilite.html"):
        html = (ROOT / page).read_text(encoding="utf-8")
        assert "css/site.css" in html, page
        for src in build_css.SOURCES:
            assert f"css/{src}" not in html, f"{page} référence encore {src}"
