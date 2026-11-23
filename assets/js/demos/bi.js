/* =====================================================================
   BI.SIM : du fichier dispersé à l'indicateur partagé, en 4 scènes.
   Les sources sont rassemblées par Power Query, nettoyées, reliées dans
   un modèle unique et contrôlées, puis lues sous forme d'indicateurs.
   Maquette animée : sources, valeurs et indicateurs sont fictifs.
   Sans animations (ou sans JavaScript), les quatre scènes restent
   visibles ensemble dans leur état final : voir bi.css.
   ===================================================================== */
(function () {
  'use strict';
  var html = document.documentElement;
  if (!html.classList.contains('motion')) return;

  /* Cartes « Ce que couvre le tableau de bord » : les pictogrammes s'animent tant que la carte est visible. */
  var cards = document.querySelectorAll('.rt-card');
  if (cards.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (list) {
      list.forEach(function (e) { e.target.classList.toggle('is-live', e.isIntersecting); });
    }, { threshold: .35 });
    Array.prototype.forEach.call(cards, function (c) { cio.observe(c); });
  }

  var DUR = [9000, 11000, 10000, 12000];
  var TOTAL = DUR.reduce(function (a, b) { return a + b; }, 0);

  function init(root) {
    var scenes = Array.prototype.slice.call(root.querySelectorAll('.bi-scene'));
    var steps = Array.prototype.slice.call(root.querySelectorAll('.bi-step'));
    var playBtn = root.querySelector('[data-bi-play]');
    var replayBtn = root.querySelector('[data-bi-replay]');
    var bar = root.querySelector('.bi-prog i');
    if (scenes.length !== DUR.length || steps.length !== DUR.length) return;

    var cur = 0, elapsed = 0, auto = true, paused = false, inView = !('IntersectionObserver' in window), last = performance.now();

    function hold() { root.classList.toggle('is-hold', paused || !inView || document.hidden); }

    function paint() {
      if (!bar) return;
      var done = 0;
      for (var i = 0; i < cur; i++) done += DUR[i];
      bar.style.transform = 'scaleX(' + (auto ? Math.min(1, (done + elapsed) / TOTAL) : 1) + ')';
    }

    function show(n) {
      cur = n;
      elapsed = 0;
      scenes.forEach(function (s) { s.classList.remove('is-current'); });
      void root.offsetWidth;
      scenes[n].classList.add('is-current');
      steps.forEach(function (b, i) {
        b.classList.toggle('is-current', i === n);
        b.classList.toggle('is-done', i < n);
        if (i === n) b.setAttribute('aria-current', 'step');
        else b.removeAttribute('aria-current');
      });
      paint();
    }

    function setPlay() {
      if (!playBtn) return;
      playBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      playBtn.textContent = paused ? playBtn.getAttribute('data-play') : playBtn.getAttribute('data-pause');
    }

    root.classList.add('is-ready');
    hold();
    show(0);

    setInterval(function () {
      var now = performance.now();
      var dt = Math.min(now - last, 250);
      last = now;
      if (!auto || paused || !inView || document.hidden) return;
      elapsed += dt;
      if (elapsed >= DUR[cur]) show((cur + 1) % DUR.length);
      else paint();
    }, 100);

    steps.forEach(function (b, i) {
      b.addEventListener('click', function () {
        auto = false;
        paused = false;
        setPlay();
        hold();
        show(i);
      });
    });
    if (playBtn) {
      playBtn.addEventListener('click', function () {
        paused = !paused;
        setPlay();
        hold();
      });
    }
    if (replayBtn) {
      replayBtn.addEventListener('click', function () {
        auto = true;
        paused = false;
        setPlay();
        hold();
        show(0);
      });
    }
    document.addEventListener('visibilitychange', function () { last = performance.now(); hold(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (list) {
        inView = list[list.length - 1].isIntersecting;
        last = performance.now();
        hold();
      }, { threshold: .25 }).observe(root);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-demo="bi"]'), init);
})();
