"""Tests du pipeline CyberPulse : scraper RSS, parsing IA, validation du schéma."""
import json
from pathlib import Path
from unittest import mock

import pytest

import main as cp
import scraper

ROOT = Path(__file__).resolve().parent.parent

RSS = """<?xml version="1.0"?><rss version="2.0"><channel><title>THN</title>
<item><title>Alpha &amp; co</title><link>https://thehackernews.com/2026/10/alpha.html</link>
<description><![CDATA[<p>Résumé <b>un</b>.</p>]]></description><pubDate>Mon, 12 Oct 2026 10:00:00 +0000</pubDate></item>
<item><title>Bad link</title><link>javascript:alert(1)</link><description>x</description></item>
<item><title>Beta</title><link>https://thehackernews.com/2026/10/beta.html</link><description>Deux</description></item>
<item><title>Gamma</title><link>https://thehackernews.com/2026/10/gamma.html</link><description>Trois</description></item>
</channel></rss>""".encode("utf-8")


class FakeResponse:
    def __init__(self, content=b"", text=""):
        self.content, self.text = content, text
    def raise_for_status(self): pass


def test_fetch_rss_cleans_html_and_rejects_bad_urls(monkeypatch):
    monkeypatch.setattr(scraper.requests, "get", lambda *a, **k: FakeResponse(RSS))
    arts = scraper.fetch_rss(3)
    assert [a["title"] for a in arts] == ["Alpha & co", "Beta", "Gamma"]
    assert arts[0]["summary"] == "Résumé un."
    assert all(a["url"].startswith("https://thehackernews.com/") for a in arts)


def test_scrape_returns_empty_on_network_error_without_fallback(monkeypatch):
    def boom(*a, **k): raise scraper.requests.RequestException("down")
    monkeypatch.setattr(scraper.requests, "get", boom)
    monkeypatch.delenv("CYBERPULSE_HTML_FALLBACK", raising=False)
    assert scraper.scrape_hackernews(3) == []


def test_parse_json_accepts_fenced_block_and_rejects_garbage():
    assert cp.parse_json('```json\n{"a": 1}\n```') == {"a": 1}
    with pytest.raises(cp.PipelineError):
        cp.parse_json("TITRE: pas du json")


def test_parse_json_tolerates_raw_newlines_in_strings():
    """Cas réel du run du 2026-10-13 : le LLM met des retours à la ligne bruts dans la chaîne."""
    raw = '{\n  "script": "Bonjour et bienvenue.\nPremière actualité.\n\nRestez vigilants."\n}'
    assert cp.parse_json(raw)["script"].startswith("Bonjour et bienvenue.\nPremière")
    # texte parasite autour + guillemets échappés
    raw2 = 'Voici le JSON :\n{"script": "Il a dit \\"bonjour\\".\nFin."} merci'
    assert cp.parse_json(raw2)["script"] == 'Il a dit "bonjour".\nFin.'


def test_translate_articles_requires_complete_answer(monkeypatch):
    news = [{"title": "A", "summary": "a"}, {"title": "B", "summary": "b"}, {"title": "C", "summary": "c"}]
    monkeypatch.setattr(cp, "call_ai", lambda *a, **k: json.dumps({"articles": [{"title_fr": "A fr", "summary_fr": "a fr"}]}))
    with pytest.raises(cp.PipelineError, match="incomplète"):
        cp.translate_articles(news)
    monkeypatch.setattr(cp, "call_ai", lambda *a, **k: json.dumps({"articles": [
        {"title_fr": "A fr", "summary_fr": "a fr"}, {"title_fr": "", "summary_fr": "b fr"}, {"title_fr": "C fr", "summary_fr": ""}]}))
    out = cp.translate_articles(news)
    assert out[0]["title_fr"] == "A fr"
    assert out[1]["title_fr"] == "B"      # repli sur l'original si vide
    assert out[2]["summary_fr"] == "c"


def test_generate_script_enforces_word_count(monkeypatch):
    news = [{"title_fr": "A", "summary_fr": "a"}]
    monkeypatch.setattr(cp, "call_ai", lambda *a, **k: json.dumps({"script": "trop court"}))
    with pytest.raises(cp.PipelineError, match="hors limites"):
        cp.generate_script(news)
    monkeypatch.setattr(cp, "call_ai", lambda *a, **k: json.dumps({"script": "mot " * 200}))
    assert len(cp.generate_script(news).split()) == 200


def _valid_payload():
    art = {"title": "Titre long", "url": "https://thehackernews.com/x.html", "summary": "s",
           "title_fr": "Titre fr", "summary_fr": "Résumé en français.", "published": ""}
    return {"version": 2, "generated_at": "2026-10-13T08:00:00+00:00",
            "source": {"name": "The Hacker News", "url": "https://thehackernews.com"},
            "articles": [art, art, art], "script": "mot " * 200, "audio_file": "audio/latest_briefing.mp3",
            "audio_bytes": 80000, "ai_providers": {"translation": "openai:gpt-4o-mini"}}


def test_schema_accepts_valid_payload_and_rejects_bad_url_or_count():
    cp.validate(_valid_payload())
    bad = _valid_payload(); bad["articles"][0]["url"] = "https://evil.example/x"
    with pytest.raises(cp.PipelineError):
        cp.validate(bad)
    short = _valid_payload(); short["articles"] = short["articles"][:2]
    with pytest.raises(cp.PipelineError):
        cp.validate(short)


def test_main_fails_when_not_enough_articles(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "x")
    monkeypatch.setattr(cp, "scrape_hackernews", lambda n: [])
    assert cp.main() == 1
