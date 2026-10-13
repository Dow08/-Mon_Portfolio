"""
CyberPulse - Générateur audio.

Moteur principal : Piper TTS (open source, hors ligne, voix fr_FR-tom-medium
téléchargée une fois et mise en cache). Sortie WAV convertie en MP3 par ffmpeg.
Repli : edge-tts (service gratuit Microsoft, qui refuse parfois les centres de
données — 403 depuis GitHub Actions constaté le 2026-10-13).

Variables d'environnement :
  PIPER_VOICE        nom de la voix Piper (défaut : fr_FR-tom-medium)
  PIPER_VOICES_DIR   dossier de cache des modèles (défaut : ~/.cache/piper-voices)
"""
from __future__ import annotations

import asyncio
import os
import shutil
import subprocess
import sys
import time
import wave
from pathlib import Path

PIPER_VOICE = os.environ.get("PIPER_VOICE", "fr_FR-tom-medium")
PIPER_VOICES_DIR = Path(os.environ.get("PIPER_VOICES_DIR", Path.home() / ".cache" / "piper-voices"))
EDGE_VOICE = "fr-FR-HenriNeural"
EDGE_RETRIES = 2
MP3_BITRATE = "64k"


# ─────────────────────────────── Piper ───────────────────────────────────
def piper_model_path(voice: str = PIPER_VOICE) -> Path:
    """Chemin du modèle .onnx ; le télécharge (avec son .json) s'il manque."""
    onnx = PIPER_VOICES_DIR / f"{voice}.onnx"
    if not (onnx.exists() and onnx.with_suffix(".onnx.json").exists()):
        PIPER_VOICES_DIR.mkdir(parents=True, exist_ok=True)
        print(f"   téléchargement de la voix Piper {voice}…")
        subprocess.run([sys.executable, "-m", "piper.download_voices", voice,
                        "--download-dir", str(PIPER_VOICES_DIR)], check=True)
    return onnx


def synthesize_piper(text: str, output_path: Path, voice: str = PIPER_VOICE) -> Path:
    """Texte → WAV (Piper) → MP3 (ffmpeg). Lève une exception en cas d'échec."""
    from piper import PiperVoice  # import local : dépendance lourde (onnxruntime)

    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg introuvable (nécessaire pour produire le MP3)")
    model = piper_model_path(voice)
    wav_path = output_path.with_suffix(".wav")
    piper_voice = PiperVoice.load(str(model))
    with wave.open(str(wav_path), "wb") as wav:
        piper_voice.synthesize_wav(text, wav)
    subprocess.run([ffmpeg, "-v", "error", "-y", "-i", str(wav_path),
                    "-codec:a", "libmp3lame", "-b:a", MP3_BITRATE, str(output_path)], check=True)
    wav_path.unlink(missing_ok=True)
    return output_path


# ─────────────────────────────── edge-tts ────────────────────────────────
async def _edge_async(text: str, output_path: Path, voice: str) -> Path:
    import edge_tts  # import local : dépendance réseau

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(output_path))
    return output_path


def synthesize_edge(text: str, output_path: Path, voice: str = EDGE_VOICE, retries: int = EDGE_RETRIES) -> Path:
    last: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            return asyncio.run(_edge_async(text, output_path, voice))
        except Exception as e:  # noqa: BLE001 - erreurs réseau/403 du service tiers
            last = e
            print(f"   ! edge-tts tentative {attempt}/{retries} : {type(e).__name__}: {str(e)[:100]}")
            if attempt < retries:
                time.sleep(5 * attempt)
    raise RuntimeError(f"edge-tts indisponible : {last}")


# ─────────────────────────────── Orchestration ───────────────────────────
def generate_audio_sync(text: str, output_path: Path) -> Path:
    """Piper d'abord, edge-tts en repli. Lève RuntimeError si les deux échouent."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    errors = []
    for name, backend in (("piper", synthesize_piper), ("edge-tts", synthesize_edge)):
        try:
            path = backend(text, output_path)
            print(f"   moteur : {name}")
            return path
        except Exception as e:  # noqa: BLE001
            errors.append(f"{name}: {type(e).__name__}: {str(e)[:160]}")
            print(f"   ! {name} a échoué : {type(e).__name__}")
            output_path.unlink(missing_ok=True)
    raise RuntimeError("aucun moteur de synthèse vocale disponible — " + " | ".join(errors))


if __name__ == "__main__":
    out = generate_audio_sync("Bonjour, ceci est un test de génération audio.", Path("test_audio.mp3"))
    print(f"Audio généré : {out} ({out.stat().st_size / 1024:.1f} Ko)")
