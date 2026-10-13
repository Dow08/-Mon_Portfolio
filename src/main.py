"""
CyberPulse - Orchestrateur
Pipeline : RSS → traduction + script radio (JSON structuré) → audio → data.json

Règles :
  - toute étape obligatoire qui échoue termine le processus avec un code ≠ 0
    (le job GitHub Actions devient rouge, rien n'est commité) ;
  - la sortie est validée contre schemas/cyberpulse.schema.json avant écriture ;
  - les résumés affichés sont limités (titre + lien + résumé court) et la
    source est indiquée dans data.json.
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from scraper import scrape_hackernews
from audio_gen import generate_audio_sync

PROJECT_ROOT = Path(__file__).parent.parent
PUBLIC_DIR = PROJECT_ROOT / "cyber-news"
AUDIO_DIR = PUBLIC_DIR / "audio"
DATA_FILE = PUBLIC_DIR / "data.json"
SCHEMA_FILE = PROJECT_ROOT / "schemas" / "cyberpulse.schema.json"
NUM_ARTICLES = 3
MIN_AUDIO_BYTES = 20_000

OPENAI_MODEL = "gpt-4o-mini"
GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.0-flash-lite"]

PROVIDERS: dict[str, str] = {}   # étape → fournisseur réellement utilisé


class PipelineError(RuntimeError):
    """Erreur bloquante : le flash du jour ne doit pas être publié."""


# ─────────────────────────────── Appel IA ────────────────────────────────
def call_ai(step: str, system_prompt: str, user_prompt: str, temperature: float, max_tokens: int) -> str:
    """OpenAI puis Gemini (plusieurs modèles). Lève PipelineError si tout échoue."""
    errors = []
    if os.environ.get("OPENAI_API_KEY"):
        try:
            from openai import OpenAI
            resp = OpenAI().chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                temperature=temperature, max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )
            PROVIDERS[step] = f"openai:{OPENAI_MODEL}"
            return resp.choices[0].message.content.strip()
        except Exception as e:  # noqa: BLE001
            errors.append(f"openai: {e}")
            print(f"   ! OpenAI indisponible ({type(e).__name__}), repli Gemini")

    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)
        for model in GEMINI_MODELS:
            try:
                resp = client.models.generate_content(
                    model=model, contents=f"{system_prompt}\n\n{user_prompt}",
                    config=types.GenerateContentConfig(temperature=temperature, max_output_tokens=max_tokens,
                                                       response_mime_type="application/json"),
                )
                PROVIDERS[step] = f"gemini:{model}"
                return resp.text.strip()
            except Exception as e:  # noqa: BLE001
                errors.append(f"{model}: {e}")
                print(f"   ! {model} indisponible ({type(e).__name__})")
    raise PipelineError("aucun fournisseur IA n'a répondu : " + " | ".join(errors) if errors else "aucune clé API")


def parse_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = text[text.find("{"):text.rfind("}") + 1]
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise PipelineError(f"réponse IA non JSON : {e}") from e


# ─────────────────────────────── Étapes ──────────────────────────────────
def translate_articles(news: list[dict]) -> list[dict]:
    items = "\n".join(f"{i + 1}. TITLE: {a['title']}\n   SUMMARY: {a['summary']}" for i, a in enumerate(news))
    prompt = (
        f"Traduis en français ces {len(news)} articles de cybersécurité.\n\n{items}\n\n"
        'Réponds UNIQUEMENT avec un objet JSON de la forme '
        '{"articles":[{"title_fr":"...","summary_fr":"..."}, ...]} '
        f"contenant exactement {len(news)} éléments dans le même ordre. "
        "summary_fr : 2 phrases maximum, factuel, sans markdown."
    )
    data = parse_json(call_ai("translation", "Tu es un traducteur anglais-français spécialisé en cybersécurité.", prompt, 0.2, 1500))
    items_fr = data.get("articles")
    if not isinstance(items_fr, list) or len(items_fr) != len(news):
        raise PipelineError(f"traduction incomplète ({len(items_fr) if isinstance(items_fr, list) else 'absente'}/{len(news)})")
    out = []
    for src, fr in zip(news, items_fr):
        a = dict(src)
        a["title_fr"] = str(fr.get("title_fr", "")).strip() or src["title"]
        a["summary_fr"] = str(fr.get("summary_fr", "")).strip() or src["summary"]
        out.append(a)
    return out


def generate_script(news: list[dict]) -> str:
    content = "\n\n".join(f"{i + 1}. {a['title_fr']}\n{a['summary_fr']}" for i, a in enumerate(news))
    prompt = (
        "Écris un script radio « Flash Info Cyber » en français, 200 à 250 mots, texte brut prêt pour une "
        "synthèse vocale : accroche, une reformulation naturelle de chaque actualité (2-3 phrases, sans "
        "citer les titres bruts), conclusion « Restez vigilants ». Pas de markdown, pas de liste, pas de crochets.\n\n"
        f"ACTUALITÉS :\n{content}\n\n"
        'Réponds UNIQUEMENT avec un objet JSON {"script":"..."}.'
    )
    data = parse_json(call_ai("script", "Tu es un journaliste radio français, clair et professionnel.", prompt, 0.7, 1200))
    script = str(data.get("script", "")).strip()
    words = len(script.split())
    if not 120 <= words <= 400:
        raise PipelineError(f"script hors limites ({words} mots)")
    return script


def validate(data: dict) -> None:
    import jsonschema
    schema = json.loads(SCHEMA_FILE.read_text(encoding="utf-8"))
    try:
        jsonschema.validate(data, schema)
    except jsonschema.ValidationError as e:
        raise PipelineError(f"data.json invalide : {e.message}") from e


def main() -> int:
    print("=" * 60 + "\nCyberPulse - génération du flash info\n" + "=" * 60)
    if not (os.environ.get("OPENAI_API_KEY") or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")):
        print("ERREUR : aucune clé API (OPENAI_API_KEY ou GEMINI_API_KEY)")
        return 1
    try:
        print("\n[1/5] Actualités (RSS)")
        news = scrape_hackernews(NUM_ARTICLES)
        if len(news) < NUM_ARTICLES:
            raise PipelineError(f"{len(news)} article(s) récupéré(s), {NUM_ARTICLES} attendus")
        print(f"   ok : {len(news)} articles")

        print("\n[2/5] Traduction")
        news = translate_articles(news)
        print(f"   ok ({PROVIDERS.get('translation')})")

        print("\n[3/5] Script radio")
        script = generate_script(news)
        print(f"   ok : {len(script.split())} mots ({PROVIDERS.get('script')})")

        print("\n[4/5] Audio")
        AUDIO_DIR.mkdir(parents=True, exist_ok=True)
        audio_path = generate_audio_sync(script, AUDIO_DIR / "latest_briefing.mp3")
        size = audio_path.stat().st_size
        if size < MIN_AUDIO_BYTES:
            raise PipelineError(f"audio trop petit ({size} octets)")
        print(f"   ok : {size / 1024:.0f} Ko")

        print("\n[5/5] Validation et écriture")
        data = {
            "version": 2,
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "source": {"name": "The Hacker News", "url": "https://thehackernews.com", "feed": "https://feeds.feedburner.com/TheHackersNews"},
            "articles": [{k: a[k] for k in ("title", "url", "summary", "title_fr", "summary_fr", "published")} for a in news],
            "script": script,
            "audio_file": "audio/latest_briefing.mp3",
            "audio_bytes": size,
            "ai_providers": PROVIDERS,
        }
        validate(data)
        PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
        DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"   ok : {DATA_FILE}")
    except PipelineError as e:
        print(f"\nECHEC : {e}")
        return 1
    print("\nFlash info généré avec succès.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
