/* Exécuté avant l'affichage : prépare les classes utilisées par les animations. */
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (!reduce) d.classList.add('motion');
  try {
    if (!reduce && !window.sessionStorage.getItem('ar-intro-seen')) d.classList.add('intro-on');
  } catch (e) {}
  // Filets de sécurité : si un script ne démarre pas, le contenu reste visible.
  setTimeout(function () {
    if (!d.classList.contains('motion-ready')) d.classList.add('motion-fallback');
  }, 4000);
  setTimeout(function () { d.classList.remove('intro-on'); }, 7000);
})();
