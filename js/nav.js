/**
 * Navigation : menu mobile accessible + lien actif selon la section visible.
 */
export function initNav() {
  const burger = document.querySelector('.nav__burger');
  const menu = document.getElementById('nav-menu');
  if (!burger || !menu) return;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) menu.querySelector('a')?.focus();
  };
  const isOpen = () => burger.getAttribute('aria-expanded') === 'true';

  burger.addEventListener('click', () => setOpen(!isOpen()));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { setOpen(false); burger.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (isOpen() && !e.target.closest('.nav__pill')) setOpen(false);
  });
  window.matchMedia('(min-width: 769px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });

  // Lien actif
  const links = [...menu.querySelectorAll('.nav__links a[href^="#"]')];
  const sections = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  if (!sections.length) return;
  const obs = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const a of links) {
        const active = a.getAttribute('href') === `#${entry.target.id}`;
        if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => obs.observe(s));
}
