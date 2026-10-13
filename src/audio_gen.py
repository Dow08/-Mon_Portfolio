"""
CyberPulse - Générateur audio (edge-tts, voix Microsoft).

Le service gratuit de Microsoft refuse parfois les adresses de centres de
données (403 depuis GitHub Actions, constaté le 2026-10-13). On réessaie
quelques fois ; au-delà, l'appelant décide (main.py publie alors le flash
sans audio, en le signalant).
"""
import asyncio
import time
from pathlib import Path

VOICE = "fr-FR-HenriNeural"  # Alternatives: fr-FR-DeniseNeural (femme)
RETRIES = 3
BACKOFF_S = 8


async def generate_audio(text: str, output_path: Path, voice: str = VOICE) -> Path:
    """Génère un fichier MP3 à partir du texte."""
    import edge_tts  # import local : les tests n'ont pas besoin de la dépendance réseau

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(str(output_path))
    return output_path


def generate_audio_sync(text: str, output_path: Path, voice: str = VOICE, retries: int = RETRIES) -> Path:
    """Version synchrone avec nouvelles tentatives. Lève la dernière erreur si tout échoue."""
    last: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            return asyncio.run(generate_audio(text, output_path, voice))
        except Exception as e:  # noqa: BLE001 - erreurs réseau/403 du service tiers
            last = e
            print(f"   ! tentative {attempt}/{retries} : {type(e).__name__}: {str(e)[:120]}")
            if attempt < retries:
                time.sleep(BACKOFF_S * attempt)
    raise RuntimeError(f"synthèse vocale indisponible après {retries} tentatives : {last}")


if __name__ == "__main__":
    output = generate_audio_sync("Bonjour, ceci est un test de génération audio.", Path("test_audio.mp3"))
    print(f"Audio généré : {output} ({output.stat().st_size / 1024:.1f} Ko)")
