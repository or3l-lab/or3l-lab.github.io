/* =====================================================================
   « Pas à pas » : chaque étape de la liste éclaire les éléments du
   schéma d'architecture et les relie, dans l'ordre du récit.
   Sans animation, la liste reste entièrement lisible ; un clic met
   simplement l'étape en évidence sur le schéma.
   ===================================================================== */
(function () {
  'use strict';
  var wrap = document.querySelector('[data-walk]');
  if (!wrap) return;
  var section = wrap.closest('.case-section') || document;
  var svg = section.querySelector('svg.diagram');
  if (!svg) return;

  var motion = document.documentElement.classList.contains('motion');
  var NS = 'http://www.w3.org/2000/svg';
  var nodes = Array.prototype.slice.call(svg.querySelectorAll('g.dg-node'));
  var edgeEls = Array.prototype.slice.call(svg.querySelectorAll('path.dg-edge'));
  var buttons = Array.prototype.slice.call(wrap.querySelectorAll('.walk-step'));
  var replay = wrap.querySelector('[data-walk-replay]');
  var steps = buttons.map(function (b) {
    return b.getAttribute('data-nodes').split(',').map(function (k) { return parseInt(k, 10); });
  });

  // Chaque flèche relie le nœud le plus proche de son départ à celui le plus proche de son arrivée.
  var boxes = nodes.map(function (g) {
    var r = g.querySelector('rect');
    return { x: +r.getAttribute('x'), y: +r.getAttribute('y'), w: +r.getAttribute('width'), h: +r.getAttribute('height') };
  });
  function nearest(px, py) {
    var best = -1, bd = 1e9;
    boxes.forEach(function (b, i) {
      var dx = Math.max(b.x - px, 0, px - (b.x + b.w)), dy = Math.max(b.y - py, 0, py - (b.y + b.h));
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bd) { bd = d; best = i; }
    });
    return bd <= 14 ? best : -1;
  }
  var edges = edgeEls.map(function (el) {
    var n = (el.getAttribute('d').match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    return { el: el, from: nearest(n[0], n[1]), to: nearest(n[n.length - 2], n[n.length - 1]) };
  });

  var token = 0, timer = 0, current = -1, auto = false;

  function dotAlong(path, run) {
    var len = path.getTotalLength();
    var dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '4.5');
    dot.setAttribute('class', 'dg-walk-dot');
    svg.appendChild(dot);
    var t0 = performance.now(), dur = 700;
    (function frame(now) {
      var k = Math.min(1, (now - t0) / dur);
      var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var p = path.getPointAtLength(len * e);
      dot.setAttribute('cx', p.x);
      dot.setAttribute('cy', p.y);
      if (k < 1 && run === token) requestAnimationFrame(frame);
      else if (dot.parentNode) dot.parentNode.removeChild(dot);
    })(t0);
  }

  function clearDots() {
    Array.prototype.forEach.call(svg.querySelectorAll('.dg-walk-dot'), function (d) { d.parentNode.removeChild(d); });
  }

  function overview() {
    token++;
    current = -1;
    clearDots();
    svg.classList.remove('is-walking');
    nodes.forEach(function (g) { g.classList.remove('is-focus', 'is-done'); });
    edges.forEach(function (e) { e.el.classList.remove('is-lit'); });
    buttons.forEach(function (b, i) { b.classList.remove('is-current', 'is-seen'); b.setAttribute('aria-pressed', 'false'); });
  }

  function show(i) {
    var run = ++token;
    clearDots();
    current = i;
    var seen = {}, focus = {};
    steps.forEach(function (s, k) {
      if (k <= i) s.forEach(function (n) { seen[n] = true; });
    });
    steps[i].forEach(function (n) { focus[n] = true; });
    svg.classList.add('is-walking');
    nodes.forEach(function (g, n) {
      g.classList.toggle('is-focus', !!focus[n]);
      g.classList.toggle('is-done', !!seen[n] && !focus[n]);
    });
    edges.forEach(function (e) {
      var lit = !!(seen[e.from] && seen[e.to]);
      e.el.classList.toggle('is-lit', lit);
      if (lit && focus[e.to] && !focus[e.from] && motion) dotAlong(e.el, run);
    });
    buttons.forEach(function (b, k) {
      b.classList.toggle('is-current', k === i);
      b.classList.toggle('is-seen', k < i);
      b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
  }

  function stop() {
    auto = false;
    clearTimeout(timer);
  }

  function play(i) {
    if (!auto) return;
    if (i >= steps.length) {
      timer = setTimeout(function () { if (auto) { auto = false; overview(); } }, 2400);
      return;
    }
    show(i);
    timer = setTimeout(function () { play(i + 1); }, 2700);
  }

  function start() {
    stop();
    auto = true;
    play(0);
  }

  buttons.forEach(function (b, i) {
    b.addEventListener('click', function () {
      stop();
      if (current === i) overview(); else show(i);
    });
  });

  nodes.forEach(function (g, n) {
    g.classList.add('is-linked');
    g.addEventListener('click', function () {
      for (var i = 0; i < steps.length; i++) {
        if (steps[i].indexOf(n) > -1) { stop(); show(i); return; }
      }
    });
  });

  if (replay) replay.addEventListener('click', function () { if (motion) start(); else overview(); });
  wrap.addEventListener('focusin', stop);

  // Lecture automatique une seule fois, quand le bloc devient visible.
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      setTimeout(function () { if (!auto && current < 0) start(); }, 700);
    }, { threshold: .45 });
    io.observe(wrap);
  }
})();
