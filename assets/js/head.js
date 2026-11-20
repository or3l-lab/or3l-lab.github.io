/* Exécuté avant l'affichage : prépare les classes utilisées par les animations. */
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  // Interrupteur « Animations » du pied de page : le choix « non », mémorisé, coupe toutes les animations.
  var off = false;
  try { off = window.localStorage.getItem('or3l-motion') === 'off'; } catch (e) {}
  if (off) d.classList.add('motion-off');
  if (!reduce && !off) {
    d.classList.add('motion');
    // Le titre de l'accueil attend le démarrage de la scène 3D (scene.js), qui gère son apparition.
    d.classList.add('scene-wait');
  }
  // Filets de sécurité : si un script ne démarre pas, le contenu reste visible.
  setTimeout(function () {
    if (!d.classList.contains('motion-ready')) d.classList.add('motion-fallback');
    if (!d.classList.contains('scene-ready')) d.classList.remove('scene-wait');
  }, 4000);
})();
