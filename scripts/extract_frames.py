#!/usr/bin/env python3
"""
Transforme la séquence source (assets/source/*.mp4|mov|webm, ou dossier d'images)
en frames WebP pour le canvas piloté par le scroll, plus un poster.

  python scripts/extract_frames.py assets/source/sequence.mp4 [--frames 72] [--width 1280] [--quality 75]

Produit :
  assets/sequence/001.webp … NNN.webp   (ratio conservé, largeur --width)
  assets/img/poster.webp                (première frame, pour le hero)
  assets/img/poster-last.webp           (dernière frame, état reduced-motion)
  data/sequence.json                    (manifeste lu par js/sequence.js)

Vérifications avant extraction (docs/DIRECTION_ARTISTIQUE.md §9) : durée 4-10 s,
largeur ≥ 1280, première image sombre. Un écart est signalé, pas contourné.
Nécessite ffmpeg/ffprobe dans le PATH.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "sequence"
MANIFEST = ROOT / "data" / "sequence.json"


def probe(src: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate,duration", "-of", "json", str(src)],
        capture_output=True, text=True, check=True).stdout
    s = json.loads(out)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return {"width": int(s["width"]), "height": int(s["height"]),
            "fps": int(num) / int(den), "duration": float(s.get("duration") or 0)}


def mean_luma(path: Path) -> float:
    """Luminance moyenne 0-255 d'une image (via ffmpeg signalstats)."""
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-vf", "signalstats,metadata=print:file=-", "-f", "null", "-"],
        capture_output=True, text=True).stdout
    for line in out.splitlines():
        if "YAVG" in line:
            return float(line.split("=")[-1])
    return -1


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("source", type=Path)
    ap.add_argument("--frames", type=int, default=72)
    ap.add_argument("--width", type=int, default=1280)
    ap.add_argument("--quality", type=int, default=75)
    ap.add_argument("--force", action="store_true", help="ignorer les avertissements de conformité")
    a = ap.parse_args()

    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        sys.exit("ffmpeg/ffprobe introuvables dans le PATH")
    if not a.source.exists():
        sys.exit(f"source introuvable : {a.source}")

    info = probe(a.source)
    warnings = []
    if info["width"] < 1280:
        warnings.append(f"largeur {info['width']} < 1280")
    if info["duration"] and not 4 <= info["duration"] <= 10:
        warnings.append(f"durée {info['duration']:.1f} s hors 4-10 s")
    print(f"source : {info['width']}x{info['height']}, {info['fps']:.0f} fps, {info['duration']:.2f} s")

    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True)
    # fps de sortie = frames / durée → exactement N images réparties sur la séquence
    fps_out = a.frames / info["duration"] if info["duration"] else a.frames / 6
    subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(a.source), "-vf",
         f"fps={fps_out:.6f},scale={a.width}:-2:flags=lanczos",
         "-frames:v", str(a.frames), "-c:v", "libwebp", "-quality", str(a.quality), "-compression_level", "6",
         str(OUT_DIR / "%03d.webp")], check=True)
    frames = sorted(OUT_DIR.glob("*.webp"))
    if not frames:
        sys.exit("aucune frame produite")

    luma = mean_luma(frames[0])
    if luma > 60:
        warnings.append(f"première image claire (luminance {luma:.0f}/255) : le canvas ne se fondra pas dans le fond")

    img_dir = ROOT / "assets" / "img"
    shutil.copy(frames[0], img_dir / "poster.webp")
    shutil.copy(frames[-1], img_dir / "poster-last.webp")

    total = sum(f.stat().st_size for f in frames)
    h = probe(frames[0])["height"] if False else int(a.width * info["height"] / info["width"])
    MANIFEST.write_text(json.dumps({
        "count": len(frames), "pattern": "assets/sequence/{n}.webp",
        "width": a.width, "height": h, "bytes": total, "source": a.source.name,
    }, indent=2) + "\n", encoding="utf-8")
    print(f"ok : {len(frames)} frames, {total / 1024 / 1024:.2f} Mo, poster + manifeste écrits")
    if total > 3 * 1024 * 1024:
        warnings.append(f"poids total {total / 1024 / 1024:.1f} Mo > budget 3 Mo : réduire --frames, --width ou --quality")

    if warnings:
        print("AVERTISSEMENTS :", *warnings, sep="\n  - ")
        if not a.force:
            print("Relancer avec --force pour accepter malgré tout.")
            return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
