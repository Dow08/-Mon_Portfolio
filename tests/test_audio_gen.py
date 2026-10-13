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


def test_model_path_downloads_when_missing(monkeypatch, tmp_path):
    calls = []
    monkeypatch.setattr(ag, "PIPER_VOICES_DIR", tmp_path)
    monkeypatch.setattr(ag.subprocess, "run", lambda cmd, **k: calls.append(cmd))
    p = ag.piper_model_path("fr_FR-tom-medium")
    assert p == tmp_path / "fr_FR-tom-medium.onnx"
    assert calls and "piper.download_voices" in calls[0] and "fr_FR-tom-medium" in calls[0]
    # modèle présent → pas de téléchargement
    (tmp_path / "fr_FR-tom-medium.onnx").write_bytes(b"x"); (tmp_path / "fr_FR-tom-medium.onnx.json").write_text("{}")
    calls.clear(); ag.piper_model_path("fr_FR-tom-medium"); assert calls == []
