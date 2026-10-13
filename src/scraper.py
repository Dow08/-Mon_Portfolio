"""
CyberPulse - Récupération des dernières actualités de The Hacker News.

Source principale : le flux RSS officiel (stable, structuré).
Repli optionnel : le HTML de la page d'accueil (dépend des classes CSS du site,
donc fragile) — activé seulement si CYBERPULSE_HTML_FALLBACK=1.

Chaque article retourné : {"title", "url", "summary", "published"}.
Une liste vide signifie un échec : l'appelant doit s'arrêter en erreur.
"""
from __future__ import annotations

import html
import os
import re

import requests

FEED_URL = "https://feeds.feedburner.com/TheHackersNews"
HTML_URL = "https://thehackernews.com"
HEADERS = {"User-Agent": "CyberPulse/2.0 (+https://dow08.github.io/-Mon_Portfolio/)"}
TIMEOUT = 20
MAX_SUMMARY = 600


def _clean(text: str) -> str:
    # balises de bloc → espace (évite de coller deux paragraphes), balises en ligne → rien
    text = re.sub(r"</?(?:p|br|div|li|ul|ol|h[1-6]|blockquote)\b[^>]*>", " ", text or "", flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _valid_url(url: str) -> bool:
    return isinstance(url, str) and url.startswith("https://thehackernews.com/")


def fetch_rss(num_articles: int) -> list[dict]:
    import feedparser  # import local : dépendance optionnelle du repli HTML

    r = requests.get(FEED_URL, headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    feed = feedparser.parse(r.content)
    if feed.bozo and not feed.entries:
        raise RuntimeError(f"flux RSS illisible : {feed.bozo_exception}")
    out = []
    for e in feed.entries:
        url = e.get("link", "")
        title = _clean(e.get("title", ""))
        summary = _clean(e.get("summary", "") or e.get("description", ""))[:MAX_SUMMARY]
        if not (title and _valid_url(url)):
            continue
        out.append({"title": title, "url": url, "summary": summary,
                    "published": e.get("published", "")})
        if len(out) >= num_articles:
            break
    return out


def fetch_html(num_articles: int) -> list[dict]:
    from bs4 import BeautifulSoup

    r = requests.get(HTML_URL, headers=HEADERS, timeout=TIMEOUT)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    out = []
    for link in soup.find_all("a", class_="story-link"):
        url = link.get("href", "")
        title_el = link.find("h2", class_="home-title")
        parent = link.find_parent("div", class_="body-post")
        desc_el = parent.find("div", class_="home-desc") if parent else None
        title = _clean(title_el.get_text() if title_el else "")
        if not (title and _valid_url(url)):
            continue
        out.append({"title": title, "url": url,
                    "summary": _clean(desc_el.get_text() if desc_el else "")[:MAX_SUMMARY],
                    "published": ""})
        if len(out) >= num_articles:
            break
    return out


def scrape_hackernews(num_articles: int = 3) -> list[dict]:
    """Retourne jusqu'à num_articles articles, ou [] en cas d'échec (jamais d'exception)."""
    try:
        articles = fetch_rss(num_articles)
        if articles:
            return articles
        print("   ! flux RSS vide")
    except Exception as e:  # noqa: BLE001 - on veut tomber en repli, pas planter ici
        print(f"   ! erreur flux RSS : {e}")

    if os.environ.get("CYBERPULSE_HTML_FALLBACK") == "1":
        try:
            return fetch_html(num_articles)
        except Exception as e:  # noqa: BLE001
            print(f"   ! erreur repli HTML : {e}")
    return []


if __name__ == "__main__":
    import json
    news = scrape_hackernews(3)
    print(json.dumps(news, indent=2, ensure_ascii=False) if news else "Aucun article")
