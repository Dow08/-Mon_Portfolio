"""
CyberPulse - Générateur audio.

Moteur principal : Piper TTS (open source, hors ligne, voix fr_FR-tom-medium
téléchargée une fois et mise en cache). Sortie WAV encodée en MP3 par lameenc
(ffmpeg en repli).
Repli : edge-tts (service gratuit Microsoft, qui refuse parfois les centres de
données — 403 depuis GitHub Actions constaté le 2026-10-13).

Variables d'environnement :
  PIPER_VOICE        nom de la voix Piper (défaut : fr_FR-tom-medium)
  PIPER_VOICES_DIR   dossier de cache des modèles (défaut : ~/.cache/piper-voices)
"""
from __future__ import annotations

import asyncio
import hashlib
import os
import shutil
import subprocess
import sys
import time
import wave
from pathlib import Path

PIPER_VOICE = os.environ.get("PIPER_VOICE", "fr_FR-tom-medium")
PIPER_VOICES_DIR = Path(os.environ.get("PIPER_VOICES_DIR", Path.home() / ".cache" / "piper-voices"))
# Empreintes SHA-256 des modèles autorisés (source : pointeur Git LFS du dépôt
# rhasspy/piper-voices sur Hugging Face, vérifié le 2026-10-13). Un modèle
# téléchargé qui ne correspond pas est supprimé et refusé : on n'exécute pas
# un fichier ONNX d'origine inconnue.
PIPER_MIRROR = os.environ.get("PIPER_MIRROR", "https://github.com/Dow08/-Mon_Portfolio/releases/download/piper-voices-v1")
PIPER_VOICE_SHA256 = {
    "fr_FR-tom-medium": "bf65074ccdeeeeaa832e75edb1c0a513c01c9a972bdf085ff8a6e71ea234fd41",
}
EDGE_VOICE = "fr-FR-HenriNeural"
EDGE_RETRIES = 2


# ─────────────────────────────── Piper ───────────────────────────────────
def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def verify_model(onnx: Path, voice: str) -> None:
    """Refuse un modèle dont l'empreinte n'est pas celle attendue (ou inconnue)."""
    expected = PIPER_VOICE_SHA256.get(voice)
    if not expected:
        raise RuntimeError(f"voix {voice} sans empreinte connue : l'ajouter à PIPER_VOICE_SHA256 après vérification")
    actual = sha256_of(onnx)
    if actual != expected:
        onnx.unlink(missing_ok=True)
        raise RuntimeError(f"empreinte du modèle {voice} inattendue ({actual[:16]}… ≠ {expected[:16]}…) : fichier supprimé")


def _fetch(url: str, dest: Path, timeout: int = 300) -> None:
    import urllib.request
    req = urllib.request.Request(url, headers={"User-Agent": "CyberPulse/2.0"})
    with urllib.request.urlopen(req, timeout=timeout) as r, open(dest, "wb") as f:
        shutil.copyfileobj(r, f)


def download_from_mirror(voice: str) -> bool:
    """Source principale : miroir dans une Release GitHub de ce dépôt (indépendant de Hugging Face).
    Retourne False si le miroir est indisponible (l'appelant passe au repli)."""
    try:
        for name in (f"{voice}.onnx", f"{voice}.onnx.json"):
            _fetch(f"{PIPER_MIRROR}/{name}", PIPER_VOICES_DIR / name)
        return True
    except Exception as e:  # noqa: BLE001
        print(f"   ! miroir indisponible ({type(e).__name__}), repli Hugging Face")
        for name in (f"{voice}.onnx", f"{voice}.onnx.json"):
            (PIPER_VOICES_DIR / name).unlink(missing_ok=True)
        return False


def piper_model_path(voice: str = PIPER_VOICE) -> Path:
    """Chemin du modèle .onnx ; le télécharge s'il manque (miroir GitHub, puis Hugging Face),
    et vérifie son empreinte dans tous les cas."""
    onnx = PIPER_VOICES_DIR / f"{voice}.onnx"
    if not (onnx.exists() and onnx.with_suffix(".onnx.json").exists()):
        PIPER_VOICES_DIR.mkdir(parents=True, exist_ok=True)
        print(f"   téléchargement de la voix Piper {voice}…")
        if not download_from_mirror(voice):
            subprocess.run([sys.executable, "-m", "piper.download_voices", voice,
                            "--download-dir", str(PIPER_VOICES_DIR)], check=True)
    verify_model(onnx, voice)
    return onnx


def wav_to_mp3(wav_path: Path, mp3_path: Path, bitrate_kbps: int = 64) -> Path:
    """WAV PCM 16 bits → MP3. lameenc (encodeur LAME embarqué, pur pip) d'abord ;
    ffmpeg en repli s'il est présent. Les runners GitHub n'ont pas ffmpeg."""
    try:
        import lameenc
    except ImportError:
        lameenc = None
    if lameenc is not None:
        with wave.open(str(wav_path), "rb") as f:
            channels, width, rate, frames = f.getnchannels(), f.getsampwidth(), f.getframerate(), f.getnframes()
            pcm = f.readframes(frames)
        if width != 2:
            raise RuntimeError(f"WAV {width * 8} bits non géré (16 bits attendus)")
        enc = lameenc.Encoder()
        enc.set_bit_rate(bitrate_kbps)
        enc.set_in_sample_rate(rate)
        enc.set_channels(channels)
        enc.set_quality(2)
        mp3_path.write_bytes(enc.encode(pcm) + enc.flush())
        return mp3_path
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ni lameenc ni ffmpeg disponibles pour produire le MP3")
    subprocess.run([ffmpeg, "-v", "error", "-y", "-i", str(wav_path),
                    "-codec:a", "libmp3lame", "-b:a", f"{bitrate_kbps}k", str(mp3_path)], check=True)
    return mp3_path


def synthesize_piper(text: str, output_path: Path, voice: str = PIPER_VOICE) -> Path:
    """Texte → WAV (Piper) → MP3. Lève une exception en cas d'échec."""
    from piper import PiperVoice  # import local : dépendance lourde (onnxruntime)

    model = piper_model_path(voice)
    wav_path = output_path.with_suffix(".wav")
    piper_voice = PiperVoice.load(str(model))
    with wave.open(str(wav_path), "wb") as wav:
        piper_voice.synthesize_wav(text, wav)
    try:
        return wav_to_mp3(wav_path, output_path)
    finally:
        wav_path.unlink(missing_ok=True)


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
