"""Orchestration de la synthèse vocale : Piper d'abord, edge-tts en repli, erreur explicite sinon."""
from pathlib import Path

import pytest

import audio_gen as ag


def _writer(name, size=30_000):
    def backend(text, output_path, *a, **k):
        Path(output_path).write_bytes(b"\0" * size)
        return Path(output_path)
    backend.__name__ = name
    return backend


def _failing(msg):
    def backend(text, output_path, *a, **k):
        raise RuntimeError(msg)
    return backend


def test_piper_is_used_first(monkeypatch, tmp_path):
    monkeypatch.setattr(ag, "synthesize_piper", _writer("piper"))
    monkeypatch.setattr(ag, "synthesize_edge", _failing("ne doit pas être appelé"))
    out = ag.generate_audio_sync("bonjour", tmp_path / "a.mp3")
    assert out.stat().st_size == 30_000


def test_falls_back_to_edge_when_piper_fails(monkeypatch, tmp_path):
    monkeypatch.setattr(ag, "synthesize_piper", _failing("onnx cassé"))
    monkeypatch.setattr(ag, "synthesize_edge", _writer("edge"))
    out = ag.generate_audio_sync("bonjour", tmp_path / "a.mp3")
    assert out.exists()


def test_raises_when_both_fail(monkeypatch, tmp_path):
    monkeypatch.setattr(ag, "synthesize_piper", _failing("onnx cassé"))
    monkeypatch.setattr(ag, "synthesize_edge", _failing("403"))
    with pytest.raises(RuntimeError, match="aucun moteur"):
        ag.generate_audio_sync("bonjour", tmp_path / "a.mp3")
    assert not (tmp_path / "a.mp3").exists()


def test_wav_to_mp3_produces_a_playable_mp3(tmp_path):
    """Encodage réel avec lameenc (pur Python/wheel, présent dans requirements)."""
    import math, struct, wave
    pytest.importorskip("lameenc")
    wav = tmp_path / "t.wav"
    rate = 22050
    with wave.open(str(wav), "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(rate)
        f.writeframes(b"".join(struct.pack("<h", int(8000 * math.sin(2 * math.pi * 440 * i / rate))) for i in range(rate)))
    out = ag.wav_to_mp3(wav, tmp_path / "t.mp3")
    data = out.read_bytes()
    assert len(data) > 4000 and (data[:3] == b"ID3" or data[0] == 0xFF)


def test_model_comes_from_mirror_first_and_is_verified(monkeypatch, tmp_path):
    import hashlib
    fake = b"modele de test"
    fetched = []
    def fake_fetch(url, dest, timeout=300):
        fetched.append(url)
        dest.write_bytes(fake if url.endswith(".onnx") else b"{}")
    monkeypatch.setattr(ag, "PIPER_VOICES_DIR", tmp_path)
    monkeypatch.setattr(ag, "_fetch", fake_fetch)
    monkeypatch.setattr(ag.subprocess, "run", lambda *a, **k: (_ for _ in ()).throw(AssertionError("Hugging Face ne doit pas être appelé")))
    monkeypatch.setitem(ag.PIPER_VOICE_SHA256, "fr_FR-tom-medium", hashlib.sha256(fake).hexdigest())
    p = ag.piper_model_path("fr_FR-tom-medium")
    assert p == tmp_path / "fr_FR-tom-medium.onnx"
    assert fetched == [f"{ag.PIPER_MIRROR}/fr_FR-tom-medium.onnx", f"{ag.PIPER_MIRROR}/fr_FR-tom-medium.onnx.json"]
    # modèle présent → aucun nouveau téléchargement, empreinte revérifiée
    fetched.clear(); ag.piper_model_path("fr_FR-tom-medium"); assert fetched == []


def test_falls_back_to_huggingface_when_mirror_is_down(monkeypatch, tmp_path):
    import hashlib
    fake = b"modele de test"
    calls = []
    def failing_fetch(url, dest, timeout=300): raise OSError("miroir HS")
    def hf_download(cmd, **k):
        calls.append(cmd)
        (tmp_path / "fr_FR-tom-medium.onnx").write_bytes(fake)
        (tmp_path / "fr_FR-tom-medium.onnx.json").write_text("{}")
    monkeypatch.setattr(ag, "PIPER_VOICES_DIR", tmp_path)
    monkeypatch.setattr(ag, "_fetch", failing_fetch)
    monkeypatch.setattr(ag.subprocess, "run", hf_download)
    monkeypatch.setitem(ag.PIPER_VOICE_SHA256, "fr_FR-tom-medium", hashlib.sha256(fake).hexdigest())
    ag.piper_model_path("fr_FR-tom-medium")
    assert calls and "piper.download_voices" in calls[0]


def test_tampered_or_unknown_model_is_rejected(monkeypatch, tmp_path):
    monkeypatch.setattr(ag, "PIPER_VOICES_DIR", tmp_path)
    (tmp_path / "fr_FR-tom-medium.onnx").write_bytes(b"pas le bon fichier")
    (tmp_path / "fr_FR-tom-medium.onnx.json").write_text("{}")
    with pytest.raises(RuntimeError, match="empreinte"):
        ag.piper_model_path("fr_FR-tom-medium")
    assert not (tmp_path / "fr_FR-tom-medium.onnx").exists(), "le fichier altéré doit être supprimé"
    (tmp_path / "fr_FR-inconnue.onnx").write_bytes(b"x"); (tmp_path / "fr_FR-inconnue.onnx.json").write_text("{}")
    with pytest.raises(RuntimeError, match="sans empreinte"):
        ag.piper_model_path("fr_FR-inconnue")


def test_real_pinned_hash_matches_huggingface_lfs_pointer():
    """L'empreinte épinglée est celle publiée par le pointeur LFS officiel (vérifié le 2026-10-13)."""
    assert ag.PIPER_VOICE_SHA256["fr_FR-tom-medium"] == "bf65074ccdeeeeaa832e75edb1c0a513c01c9a972bdf085ff8a6e71ea234fd41"
