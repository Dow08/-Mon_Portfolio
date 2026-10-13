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
  root.querySelectorAll('.reveal:not(.is-visible)').forEach((node) => {
    // Ce qui est déjà à l'écran au chargement apparaît sans attendre l'observateur
    if (node.getBoundingClientRect().top < window.innerHeight) node.classList.add('is-visible');
    else observer.observe(node);
  });
}
