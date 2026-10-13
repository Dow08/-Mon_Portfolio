/**
 * CyberPulse : flash info quotidien (cyber-news/data.json + mp3).
 * Accepte les formats v1 (ancien pipeline) et v2. Toute donnée est rendue via
 * textContent ; les URL passent par safeHref. Section masquée si données
 * absentes ou invalides.
 */
import { el, externalLink, safeHref } from './util/dom.js';
import { t, currentLang } from './i18n.js';

export async function initCyberPulse() {
  const section = document.getElementById('veille');
  if (!section) return;
  let data;
  try {
    const r = await fetch(`cyber-news/data.json?t=${Date.now()}`, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    data = await r.json();
    if (!isValid(data)) throw new Error('format inattendu');
  } catch {
    section.hidden = true;
    return;
  }

  function renderTexts() {
    const date = new Date(data.generated_at);
    const dateEl = document.getElementById('pulse-date');
    if (dateEl && !Number.isNaN(date.getTime())) {
      dateEl.textContent = date.toLocaleDateString(currentLang() === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      dateEl.setAttribute('datetime', date.toISOString());
    }
    const sourceEl = document.getElementById('pulse-source');
    const source = data.source || { name: 'The Hacker News', url: 'https://thehackernews.com' };
    if (sourceEl) sourceEl.replaceChildren(t('js.pulse.source', 'Source : '), externalLink(source.url, {}, source.name),
      t('js.pulse.sourceNote', ' — titres et résumés traduits automatiquement.'));

    // Articles (en français quelle que soit la langue d'interface : contenu généré)
    const list = document.getElementById('pulse-articles');
    if (list) {
      list.replaceChildren(...data.articles.slice(0, 3).map((a, i) => {
        const href = safeHref(a.url);
        const title = a.title_fr || a.title;
        return el('li', { class: 'pulse-article', lang: 'fr' }, [
          el('span', { class: 'mono' }, `0${i + 1}`),
          el('div', {}, [
            el('h3', {}, href ? externalLink(href, {}, title) : title),
            el('p', { class: 'muted' }, (a.summary_fr || a.summary || '').slice(0, 400)),
          ]),
        ]);
      }));
    }
  }

  renderTexts();
  window.addEventListener('langchange', renderTexts);
  initPlayer(`cyber-news/${data.audio_file || 'audio/latest_briefing.mp3'}?t=${Date.now()}`);
}

function isValid(d) {
  return d && typeof d.generated_at === 'string' && Array.isArray(d.articles) && d.articles.length >= 1
    && d.articles.every((a) => a && typeof a.title === 'string' && typeof a.url === 'string');
}

function initPlayer(src) {
  const audio = document.getElementById('pulse-audio');
  const btn = document.getElementById('pulse-play');
  const range = document.getElementById('pulse-seek');
  const time = document.getElementById('pulse-time');
  const card = document.getElementById('pulse-player');
  if (!audio || !btn || !range || !time) return;

  audio.src = src;
  const fmt = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
  const setPlaying = (playing) => {
    btn.setAttribute('aria-label', playing ? t('js.pulse.pause', 'Mettre en pause') : t('js.pulse.play', 'Écouter le flash info'));
    btn.dataset.state = playing ? 'playing' : 'paused';
    card?.classList.toggle('is-playing', playing);
  };

  btn.addEventListener('click', () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); });
  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('ended', () => { setPlaying(false); range.value = '0'; });
  audio.addEventListener('loadedmetadata', () => { range.max = String(Math.floor(audio.duration)); time.textContent = `0:00 / ${fmt(audio.duration)}`; });
  audio.addEventListener('timeupdate', () => {
    if (!seeking) range.value = String(Math.floor(audio.currentTime));
    time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });
  audio.addEventListener('error', () => { if (card) card.hidden = true; });

  let seeking = false;
  range.addEventListener('input', () => { seeking = true; time.textContent = `${fmt(Number(range.value))} / ${fmt(audio.duration)}`; });
  range.addEventListener('change', () => { audio.currentTime = Number(range.value); seeking = false; });
}
