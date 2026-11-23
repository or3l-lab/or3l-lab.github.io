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
    fig.dispatchEvent(new Event('art:replay'));
  }

  function initStory(fig) {
    var root = fig.querySelector('[data-art-story]');
    if (!root || !document.documentElement.classList.contains('motion')) return;
    var actions = root.querySelector('.as-actions');
    var controls = root.querySelector('.as-controls');
    var steps = Array.prototype.slice.call(root.querySelectorAll('[data-as-step]'));
    var scenes = Array.prototype.slice.call(root.querySelectorAll('[data-as-scene]'));
    var toggle = root.querySelector('[data-as-toggle]');
    var bar = root.querySelector('[data-as-progress]');
    var count = root.querySelector('[data-as-count]');
    var status = root.querySelector('[data-as-status]');
    if (!actions || !controls || !toggle || !bar || !count || !status || !steps.length || !scenes.length) return;

    var current = 0, elapsed = 0, paused = false, last = performance.now(), duration = 12000;

    function paint() {
      bar.style.transform = 'scaleX(' + Math.min(1, (current + elapsed / duration) / scenes.length) + ')';
      count.textContent = root.getAttribute('data-step-label') + ' ' + (current + 1) + ' / ' + scenes.length;
    }

    function show(n, announce) {
      current = n;
      elapsed = 0;
      fig.classList.add('no-anim');
      root.setAttribute('data-stage', String(n));
      scenes.forEach(function (scene, i) { scene.hidden = i !== n; });
      steps.forEach(function (step) {
        step.setAttribute('aria-pressed', Number(step.getAttribute('data-as-step')) === n ? 'true' : 'false');
      });
      void root.offsetWidth;
      fig.classList.remove('no-anim');
      if (announce) status.textContent = root.getAttribute('data-step-label') + ' ' + (n + 1) + ': '
        + scenes[n].querySelector('h3').textContent;
      paint();
    }

    function setPaused(value) {
      paused = value;
      root.classList.toggle('is-held', paused);
      toggle.textContent = toggle.getAttribute(paused ? 'data-play' : 'data-pause');
    }

    steps.forEach(function (step) {
      step.addEventListener('click', function () {
        setPaused(false);
        show(Number(step.getAttribute('data-as-step')), true);
      });
    });
    toggle.addEventListener('click', function () { setPaused(!paused); });
    fig.addEventListener('art:replay', function () { setPaused(false); show(0, true); });

    root.classList.add('is-ready');
    actions.hidden = false;
    controls.hidden = false;
    setPaused(false);
    show(0, false);
    document.addEventListener('visibilitychange', function () {
      root.classList.toggle('is-background', document.hidden);
      last = performance.now();
    });

    setInterval(function () {
      var now = performance.now();
      var delta = Math.min(now - last, 250);
      last = now;
      if (paused || document.hidden || !fig.classList.contains('is-live')) return;
      elapsed += delta;
      if (elapsed >= duration) show((current + 1) % scenes.length, false);
      else paint();
    }, 100);
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
    initStory(fig);
  });
})();
