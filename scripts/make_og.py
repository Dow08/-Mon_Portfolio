#!/usr/bin/env python3
"""Génère assets/img/og.png (1200×630) pour les aperçus de partage, avec la palette et Geist."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img" / "og.png"
FONT = ROOT / "assets" / "fonts" / "Geist-Variable.woff2"

W, H = 1200, 630
img = Image.new("RGB", (W, H), "#061716")
d = ImageDraw.Draw(img)

# grille discrète
for x in range(0, W, 64):
    d.line([(x, 0), (x, H)], fill="#0b2322", width=1)
for y in range(0, H, 64):
    d.line([(0, y), (W, y)], fill="#0b2322", width=1)


def font(size: int, weight: int = 600):
    try:
        f = ImageFont.truetype(str(FONT), size)
        try:
            f.set_variation_by_axes([weight])
        except Exception:  # noqa: BLE001 - police non variable
            pass
        return f
    except OSError:
        return ImageFont.load_default(size)


d.ellipse([72, 84, 92, 104], fill="#b8f23d")
d.text((108, 78), "DORIAN PONCELET · PORTFOLIO", font=font(22, 500), fill="#7f9693")
d.text((72, 180), "Cybersécurité", font=font(110, 600), fill="#f4f5f2")
d.text((72, 300), "& GRC", font=font(110, 600), fill="#b8f23d")
d.text((72, 470), "Gouvernance, risques et conformité · infrastructures sécurisées ·", font=font(30, 400), fill="#b9c6c3")
d.text((72, 512), "automatisation par l'IA. Projets vérifiables sur GitHub.", font=font(30, 400), fill="#b9c6c3")
d.text((72, 572), "dow08.github.io/-Mon_Portfolio", font=font(22, 500), fill="#7f9693")

OUT.parent.mkdir(parents=True, exist_ok=True)
img.save(OUT, optimize=True)
print(f"ok {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} Ko)")
