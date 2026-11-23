/* Figures animées des articles : lecture au défilement, mise en pause hors de l'écran, bouton « Rejouer ».
   Les animations elles-mêmes sont dans assets/css/art-figures.css (actives seulement avec html.motion). */
(function () {
  'use strict';

  var figs = document.querySelectorAll('.art-motion');
  if (!figs.length) return;
  document.documentElement.classList.add('art-figs-on');

  function replay(fig) {
    fig.classList.add('no-anim');
    void fig.offsetWidth;
    fig.classList.remove('no-anim');
    fig.classList.add('is-live');
  }

  var observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.intersectionRatio >= 0.35) entry.target.classList.add('is-live');
        else if (!entry.isIntersecting) entry.target.classList.remove('is-live');
      });
    }, { threshold: [0, 0.35] });
  }

  Array.prototype.forEach.call(figs, function (fig) {
    var bar = fig.querySelector('.art-motion-bar');
    if (bar) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'art-motion-replay';
      btn.textContent = '\u21BB ' + (fig.getAttribute('data-replay') || 'Replay');
      btn.addEventListener('click', function () { replay(fig); });
      bar.appendChild(btn);
    }
    if (observer) observer.observe(fig);
    else fig.classList.add('is-live');
  });
})();
