/* =====================================================================
   Démo « Orélia » : une demande traverse l'assistante (chef d'orchestre,
   agents spécialisés, mémoire, garde-fous sur les fichiers).
   Reconstitution simplifiée, contenu fictif.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-demo="orelia"]');
  if (!root) return;
  var T = JSON.parse(root.querySelector('.demo-i18n').textContent);
  var reduce = !document.documentElement.classList.contains('motion');
  var gsap = window.gsap;
  var graph = root.querySelector('[data-graph]'), log = root.querySelector('[data-log]');
  var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-run]'));
  var chips = Array.prototype.slice.call(root.querySelectorAll('[data-chip]'));
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  var pos = { H: [52, 185], O: [172, 185], M: [172, 62], E1: [318, 70], E2: [318, 185], E3: [318, 300], G: [470, 185], F: [470, 305] };
  var marks = { H: '◉', O: 'O', M: 'M', E1: 'A1', E2: 'A2', E3: 'A3', G: 'G', F: 'F' };
  var edges = [['H', 'O'], ['O', 'M'], ['O', 'E1'], ['O', 'E2'], ['O', 'E3'], ['E1', 'G'], ['E2', 'G'], ['E3', 'G'], ['G', 'F']];

  var svg = el('svg', { viewBox: '0 0 560 370', role: 'img', 'aria-label': T.title }, graph);
  var links = {}, nodes = {};
  edges.forEach(function (e) {
    links[e[0] + '|' + e[1]] = el('line', { x1: pos[e[0]][0], y1: pos[e[0]][1], x2: pos[e[1]][0], y2: pos[e[1]][1], 'class': 'ag-link' }, svg);
  });
  Object.keys(pos).forEach(function (id) {
    var g = el('g', { 'class': 'ag-node' + (id === 'H' ? ' is-human' : '') }, svg);
    el('circle', { cx: pos[id][0], cy: pos[id][1], r: id === 'O' ? 30 : 23 }, g);
    el('text', { x: pos[id][0], y: pos[id][1] + 5 }, g).textContent = marks[id];
    el('text', { x: pos[id][0], y: pos[id][1] + (id === 'O' ? 48 : 40), 'class': 'ag-name' }, g).textContent = T.names[id];
    nodes[id] = g;
  });
  var packet = el('circle', { r: 5, cx: pos.O[0], cy: pos.O[1], 'class': 'ag-packet', opacity: 0 }, svg);

  function linkFor(a, b) { return links[a + '|' + b] || links[b + '|' + a] || null; }

  var running = false;
  function clearActive() {
    Object.keys(nodes).forEach(function (k) { nodes[k].classList.remove('is-on', 'is-err'); });
    Object.keys(links).forEach(function (k) { links[k].classList.remove('is-on'); });
  }
  function reset() {
    clearActive();
    chips.forEach(function (c) { c.classList.remove('is-on', 'is-warn'); });
    log.innerHTML = '';
  }

  // Une étape : [acteurs, texte, garde-fous mobilisés, état]. « A>B » : de A vers B.
  function apply(step, prev, done) {
    var spec = step[0], from = null, id = spec;
    if (spec.indexOf('>') > -1) { from = spec.split('>')[0]; id = spec.split('>')[1]; }
    var origin = from || prev || id;
    var state = step[3];
    clearActive();
    nodes[id].classList.add(state === 'err' ? 'is-err' : 'is-on');
    if (from) nodes[from].classList.add('is-on');
    var l = linkFor(origin, id);
    if (l) l.classList.add('is-on');
    var used = step[2] ? step[2].split(',') : [];
    chips.forEach(function (c) {
      if (used.indexOf(c.getAttribute('data-chip')) < 0) return;
      if (state === 'err' && !c.classList.contains('is-on')) c.classList.add('is-warn');
      else if (state !== 'err') c.classList.add('is-on');
    });
    var li = document.createElement('li');
    if (state === 'err') li.className = 'is-err'; else if (state === 'ok') li.className = 'is-ok';
    var who = document.createElement('span');
    who.className = 'who';
    who.textContent = (from ? T.names[from] + ' → ' : '') + T.names[id];
    li.appendChild(who);
    li.appendChild(document.createTextNode(step[1]));
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
    if (gsap && !reduce && origin !== id) {
      gsap.fromTo(packet, { attr: { cx: pos[origin][0], cy: pos[origin][1] }, opacity: 1 },
        { attr: { cx: pos[id][0], cy: pos[id][1] }, duration: .55, ease: 'power2.inOut', onComplete: function () { gsap.to(packet, { opacity: 0, duration: .2 }); } });
    }
    setTimeout(function () { done(id); }, reduce ? 0 : 1250);
  }

  function run(kind) {
    if (running) return;
    running = true;
    buttons.forEach(function (b) { b.disabled = true; });
    reset();
    var steps = T.steps[kind], i = 0;
    (function next(prev) {
      if (i >= steps.length) { running = false; buttons.forEach(function (b) { b.disabled = false; }); return; }
      apply(steps[i++], prev, next);
    })(null);
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { run(b.getAttribute('data-run')); }); });

  // Lecture automatique de la première demande à la première apparition ;
  // sans animation, le premier scénario est affiché d'emblée en entier.
  if (reduce) {
    run('ask');
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); run('ask'); }
    }, { threshold: .4 });
    io.observe(root);
  }
})();
