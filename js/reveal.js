/**
 * Révélation à l'entrée dans le viewport — une seule fois, jamais rejouée.
 * Sous prefers-reduced-motion le CSS affiche tout immédiatement ; on marque
 * quand même .is-visible pour les composants qui en dépendent (matrice).
 */
let observer;

export function observeReveal(root = document) {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.15 });
  }
  // Lecture de toutes les positions d'abord, écritures ensuite : évite un
  // recalcul de mise en page par élément (reflow forcé mesuré par Lighthouse).
  const nodes = [...root.querySelectorAll('.reveal:not(.is-visible)')];
  const viewportH = window.innerHeight;
  const aboveFold = nodes.map((node) => node.getBoundingClientRect().top < viewportH);
  nodes.forEach((node, i) => {
    // Ce qui est déjà à l'écran au chargement apparaît sans attendre l'observateur
    if (aboveFold[i]) node.classList.add('is-visible');
    else observer.observe(node);
  });
}
