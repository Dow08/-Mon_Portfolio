"""
CyberDailyWatch - Orchestrateur Principal
Coordonne le scraping, la génération IA et la synthèse audio.

Ce module est le point d'entrée principal de l'application.
Il orchestre les différentes étapes du pipeline:
1. Récupération des actualités
2. Traduction en français
3. Génération du script radio
4. Création de l'audio
5. Sauvegarde des données

Providers IA supportés:
    - OpenAI (GPT-4o-mini) - prioritaire
    - Google Gemini (gemini-1.5-flash) - fallback automatique

Configuration via fichier .env:
    - OPENAI_API_KEY: Clé API OpenAI
    - GEMINI_API_KEY: Clé API Google Gemini
"""

import os
import json
from datetime import datetime
from pathlib import Path

# =============================================================================
# CHARGEMENT DE LA CONFIGURATION
# =============================================================================

# Charger les variables d'environnement depuis .env
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

from scraper import scrape_hackernews
from audio_gen import generate_audio_sync

# =============================================================================
# CONFIGURATION - Modifiez ces valeurs selon vos besoins
# =============================================================================

# Chemins des fichiers générés (adapté pour portfolio)
PROJECT_ROOT = Path(__file__).parent.parent
PUBLIC_DIR = PROJECT_ROOT / "cyber-news"
AUDIO_DIR = PUBLIC_DIR / "audio"
DATA_FILE = PUBLIC_DIR / "data.json"

# Nombre d'articles à récupérer
NUM_ARTICLES = 3

# Modèles IA utilisés
OPENAI_MODEL = "gpt-4o-mini"

# Liste des modèles Gemini à essayer en cascade (chaque modèle a son propre quota)
# Gemini 1.5 est déprécié, utiliser Gemini 2.0 et 2.5
GEMINI_MODELS = [
    "gemini-2.5-flash",        # Nouveau modèle par défaut (juin 2025)
    "gemini-2.5-flash-lite",   # Version légère 2.5, très économique
    "gemini-2.0-flash",        # Version 2.0, stable
    "gemini-2.0-flash-lite",   # Version légère 2.0
    "gemini-2.5-pro",          # Version Pro (quota limité mais puissant)
]

# Provider IA actif (déterminé automatiquement)
AI_PROVIDER = None
CURRENT_GEMINI_MODEL = None  # Modèle Gemini actuellement utilisé


# =============================================================================
# FONCTIONS IA - Gestion des providers
# =============================================================================

def get_ai_provider() -> str:
    """
    Détermine quel provider IA utiliser selon les clés disponibles.
    
    Ordre de priorité:
    1. OpenAI si OPENAI_API_KEY est définie
    2. Gemini si GEMINI_API_KEY ou GOOGLE_API_KEY est définie
    
    Returns:
        str: Nom du provider ("openai" ou "gemini")
    
    Raises:
        ValueError: Si aucune clé API n'est configurée
    """
    global AI_PROVIDER
    
    if os.environ.get("OPENAI_API_KEY"):
        AI_PROVIDER = "openai"
        return "openai"
    elif os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"):
        AI_PROVIDER = "gemini"
        return "gemini"
    else:
        raise ValueError(
            "❌ Aucune clé API trouvée!\n"
            "💡 Ajoutez OPENAI_API_KEY ou GEMINI_API_KEY dans le fichier .env"
        )


def call_ai(system_prompt: str, user_prompt: str, temperature: float = 0.7, max_tokens: int = 500) -> str:
    """
    Appelle le provider IA avec basculement automatique multi-modèles.
    
    Essaie d'abord OpenAI, puis bascule vers Gemini en cas d'erreur.
    Pour Gemini, essaie plusieurs modèles en cascade jusqu'à ce qu'un fonctionne.
    
    Args:
        system_prompt: Instructions système pour l'IA
        user_prompt: Message/question de l'utilisateur
        temperature: Niveau de créativité (0-1, défaut: 0.7)
                     0 = réponses déterministes
                     1 = réponses créatives
        max_tokens: Longueur maximale de la réponse
    
    Returns:
        str: Réponse générée par l'IA
    
    Raises:
        RuntimeError: Si tous les providers et modèles échouent
    """
    global AI_PROVIDER, CURRENT_GEMINI_MODEL
    
    # ==========================================================================
    # TENTATIVE OPENAI
    # ==========================================================================
    if os.environ.get("OPENAI_API_KEY"):
        try:
            from openai import OpenAI
            client = OpenAI()
            
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )
            AI_PROVIDER = "openai"
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            error_msg = str(e).lower()
            if "quota" in error_msg or "rate" in error_msg or "insufficient" in error_msg:
                print(f"   ⚠️ OpenAI: quota dépassé, basculement vers Gemini...")
            else:
                print(f"   ⚠️ Erreur OpenAI: {e}")
                print(f"   🔄 Basculement vers Gemini...")
    
    # ==========================================================================
    # FALLBACK GEMINI - Essai de plusieurs modèles en cascade
    # ==========================================================================
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=gemini_key)
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        last_error = None
        for model_name in GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt,
                    config=types.GenerateContentConfig(
                        temperature=temperature,
                        max_output_tokens=max_tokens
                    )
                )
                AI_PROVIDER = "gemini"
                CURRENT_GEMINI_MODEL = model_name
                print(f"   ✓ Gemini: modèle {model_name} utilisé avec succès")
                return response.text.strip()
                
            except Exception as e:
                error_msg = str(e).lower()
                if "quota" in error_msg or "exhausted" in error_msg or "429" in str(e):
                    print(f"   ⚠️ Gemini {model_name}: quota épuisé, essai du modèle suivant...")
                    last_error = e
                    continue
                elif "not found" in error_msg or "404" in str(e):
                    print(f"   ⚠️ Gemini {model_name}: modèle non disponible, essai du modèle suivant...")
                    last_error = e
                    continue
                else:
                    # Erreur non liée au quota, on la propage
                    raise RuntimeError(f"❌ Erreur Gemini ({model_name}): {e}")
        
        # Tous les modèles ont échoué
        raise RuntimeError(
            f"❌ Tous les modèles Gemini ont échoué (quota épuisé).\n"
            f"   Dernière erreur: {last_error}\n"
            f"   💡 Solutions:\n"
            f"      - Attendez le reset quotidien des quotas\n"
            f"      - Activez la facturation sur Google AI Studio\n"
            f"      - Rechargez votre crédit OpenAI"
        )
    
    raise ValueError(
        "❌ Aucun provider IA disponible.\n"
        "💡 Vérifiez vos clés API dans le fichier .env"
    )


# =============================================================================
# FONCTIONS DE TRAITEMENT
# =============================================================================

def translate_articles_to_french(news: list[dict]) -> list[dict]:
    """
    Traduit les articles en français via l'IA.
    
    Ajoute les champs 'title_fr' et 'summary_fr' à chaque article
    tout en conservant les versions originales.
    
    Args:
        news: Liste d'articles avec title, url, summary (en anglais)
    
    Returns:
        Liste d'articles enrichie avec title_fr et summary_fr
    """
    # Préparer le contenu à traduire
    articles_text = "\n\n".join([
        f"[ARTICLE {i+1}]\nTITLE: {article['title']}\nSUMMARY: {article['summary']}"
        for i, article in enumerate(news)
    ])
    
    system_prompt = "Tu es un traducteur anglais-français. Traduis TOUT le contenu demandé sans rien omettre."
    
    user_prompt = f"""Traduis ces {len(news)} articles en français.

{articles_text}

Réponds EXACTEMENT avec ce format pour CHAQUE article:
[ARTICLE 1]
TITRE: <titre traduit>
RESUME: <résumé traduit en 2-3 phrases>

[ARTICLE 2]
TITRE: <titre traduit>
RESUME: <résumé traduit en 2-3 phrases>

[ARTICLE 3]
TITRE: <titre traduit>
RESUME: <résumé traduit en 2-3 phrases>

IMPORTANT: Traduis TOUS les articles, ne t'arrête pas avant d'avoir fini."""

    translated_text = call_ai(system_prompt, user_prompt, temperature=0.3, max_tokens=2000)
    
    # Parser les traductions
    translated_articles = []
    for i, article in enumerate(news):
        article_copy = article.copy()
        
        try:
            # Extraire la section de l'article
            article_section = translated_text.split(f"[ARTICLE {i+1}]")[1]
            if i + 2 <= len(news):
                article_section = article_section.split(f"[ARTICLE {i+2}]")[0]
            
            # Extraire le titre traduit
            if "TITRE:" in article_section:
                title_line = article_section.split("TITRE:")[1].split("\n")[0].strip()
                article_copy["title_fr"] = title_line
            else:
                article_copy["title_fr"] = article["title"]
            
            # Extraire le résumé traduit
            if "RESUME:" in article_section or "RÉSUMÉ:" in article_section:
                if "RESUME:" in article_section:
                    summary_text = article_section.split("RESUME:")[1].strip()
                else:
                    summary_text = article_section.split("RÉSUMÉ:")[1].strip()
                summary_text = summary_text.split("[ARTICLE")[0].strip()
                article_copy["summary_fr"] = summary_text
            else:
                article_copy["summary_fr"] = article["summary"]
                
        except (IndexError, KeyError):
            # En cas d'erreur de parsing, garder l'original
            article_copy["title_fr"] = article["title"]
            article_copy["summary_fr"] = article["summary"]
        
        translated_articles.append(article_copy)
    
    return translated_articles


def generate_radio_script(news: list[dict]) -> str:
    """
    Génère un script radio "Flash Info Cyber" en français.
    
    Le script est optimisé pour une lecture audio d'environ 1 minute.
    
    Args:
        news: Liste d'articles avec title_fr et summary_fr
    
    Returns:
        Script radio prêt à être converti en audio
    """
    # Utiliser les traductions françaises
    news_content = "\n\n".join([
        f"**{i+1}. {article.get('title_fr', article['title'])}**\n"
        f"{article.get('summary_fr', article['summary'])}"
        for i, article in enumerate(news)
    ])
    
    system_prompt = "Tu es un journaliste radio français dynamique. Tu DOIS écrire un script COMPLET."
    
    user_prompt = f"""Écris un script radio "Flash Info Cyber" de 150-200 mots.

ACTUALITÉS:
{news_content}

FORMAT OBLIGATOIRE:
1. Introduction accrocheuse ("Bonjour et bienvenue...")
2. Actualité 1 en 2-3 phrases
3. Actualité 2 en 2-3 phrases  
4. Actualité 3 en 2-3 phrases
5. Conclusion ("Restez vigilants...")

Écris le script COMPLET maintenant, sans t'arrêter."""

    return call_ai(system_prompt, user_prompt, temperature=0.7, max_tokens=800)


def save_data_json(news: list[dict], script: str) -> None:
    """
    Sauvegarde les données générées en JSON pour le frontend.
    
    Le fichier data.json contient:
    - Date de génération
    - Liste des articles (avec traductions)
    - Script radio
    - Chemin du fichier audio
    - Provider IA utilisé
    
    Args:
        news: Liste des articles enrichis
        script: Script radio généré
    """
    data = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "articles": news,
        "script": script,
        "audio_file": "audio/latest_briefing.mp3",
        "ai_provider": AI_PROVIDER
    }
    
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Données sauvegardées: {DATA_FILE}")


# =============================================================================
# FONCTION PRINCIPALE
# =============================================================================

def main():
    """
    Fonction principale d'orchestration.
    
    Pipeline complet:
    1. Vérification du provider IA
    2. Scraping des actualités
    3. Traduction en français
    4. Génération du script radio
    5. Création de l'audio MP3
    6. Sauvegarde des métadonnées
    """
    print("=" * 60)
    print("🛡️  CyberDailyWatch - Générateur de Flash Info")
    print("=" * 60)
    print()
    
    # -------------------------------------------------------------------------
    # Étape 0: Vérification du provider IA
    # -------------------------------------------------------------------------
    try:
        provider = get_ai_provider()
        print(f"🤖 Provider IA configuré: {provider.upper()}")
    except ValueError as e:
        print(e)
        import sys
        sys.exit(1)
    print()
    
    # -------------------------------------------------------------------------
    # Étape 1: Récupération des actualités
    # -------------------------------------------------------------------------
    print("📰 Étape 1: Récupération des actualités...")
    news = scrape_hackernews(NUM_ARTICLES)
    
    if not news:
        print("❌ Aucune actualité trouvée. Arrêt du processus.")
        return
    
    print(f"   ✓ {len(news)} articles récupérés")
    for article in news:
        print(f"     - {article['title'][:60]}...")
    print()
    
    # -------------------------------------------------------------------------
    # Étape 2: Traduction en français
    # -------------------------------------------------------------------------
    print("🌍 Étape 2: Traduction des articles en français...")
    news = translate_articles_to_french(news)
    print(f"   ✓ Articles traduits (via {AI_PROVIDER})")
    for article in news:
        print(f"     - {article.get('title_fr', article['title'])[:60]}...")
    print()
    
    # -------------------------------------------------------------------------
    # Étape 3: Génération du script radio
    # -------------------------------------------------------------------------
    print("🤖 Étape 3: Génération du script radio...")
    script = generate_radio_script(news)
    print(f"   ✓ Script généré ({len(script.split())} mots) via {AI_PROVIDER}")
    print()
    
    # -------------------------------------------------------------------------
    # Étape 4: Génération de l'audio
    # -------------------------------------------------------------------------
    print("🎙️ Étape 4: Génération de l'audio...")
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    audio_path = generate_audio_sync(script, AUDIO_DIR / "latest_briefing.mp3")
    print(f"   ✓ Audio sauvegardé: {audio_path}")
    print()
    
    # -------------------------------------------------------------------------
    # Étape 5: Sauvegarde des données
    # -------------------------------------------------------------------------
    print("💾 Étape 5: Sauvegarde des métadonnées...")
    save_data_json(news, script)
    print()
    
    # -------------------------------------------------------------------------
    # Terminé!
    # -------------------------------------------------------------------------
    print("=" * 60)
    print(f"✅ Flash info généré avec succès!")
    print(f"🤖 Provider utilisé: {AI_PROVIDER}")
    print("=" * 60)


# =============================================================================
# POINT D'ENTRÉE
# =============================================================================
if __name__ == "__main__":
    main()
