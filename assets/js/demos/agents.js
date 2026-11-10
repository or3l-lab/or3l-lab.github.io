/* =====================================================================
   Démo « orchestration d'agents IA » : une demande traverse l'équipe
   (orchestrateur, spécialistes, revue, validation humaine, livraison
   réversible). Reconstitution simplifiée, contenu fictif.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-demo="agents"]');
  if (!root) return;
  var T = JSON.parse(root.querySelector('.demo-i18n').textContent);
  var reduce = !document.documentElement.classList.contains('motion');
  var gsap = window.gsap;
  var graph = root.querySelector('[data-graph]'), log = root.querySelector('[data-log]');
  var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-run]'));
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // Positions : A1 au centre, A2…A9 en cercle, l'humain en bas à droite
  var pos = { A1: [260, 172] };
  var ring = ['A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9'];
  ring.forEach(function (id, i) {
    var a = -Math.PI / 2 + i * 2 * Math.PI / ring.length;
    pos[id] = [260 + Math.cos(a) * 150, 172 + Math.sin(a) * 128];
  });
  pos.H = [470, 316];
  var names = {};
  T.agents.forEach(function (a) { names[a[0]] = a[1]; });
  names.H = T.human;

  var svg = el('svg', { viewBox: '0 0 520 370', role: 'img', 'aria-label': T.title }, graph);
  var links = {}, nodes = {};
  ring.concat(['H']).forEach(function (id) {
    var from = id === 'H' ? pos.A9 : pos.A1;
    links[id] = el('line', { x1: from[0], y1: from[1], x2: pos[id][0], y2: pos[id][1], 'class': 'ag-link' }, svg);
  });
  Object.keys(pos).forEach(function (id) {
    var g = el('g', { 'class': 'ag-node' + (id === 'H' ? ' is-human' : '') }, svg);
    el('circle', { cx: pos[id][0], cy: pos[id][1], r: id === 'A1' ? 30 : 23 }, g);
    var t = el('text', { x: pos[id][0], y: pos[id][1] + 5 }, g);
    t.textContent = id === 'H' ? '◉' : id;
    var n = el('text', { x: pos[id][0], y: pos[id][1] + (id === 'A1' ? 48 : 40), 'class': 'ag-name' }, g);
    n.textContent = names[id];
    nodes[id] = g;
  });
  var packet = el('circle', { r: 5, cx: pos.A1[0], cy: pos.A1[1], 'class': 'ag-packet', opacity: 0 }, svg);

  function linkFor(a, b) {
    if (a === 'A1' && links[b]) return links[b];
    if (b === 'A1' && links[a]) return links[a];
    if ((a === 'A9' && b === 'H') || (a === 'H' && b === 'A9')) return links.H;
    return null;
  }

  var running = false, prev = null;
  function reset() {
    Object.keys(nodes).forEach(function (k) { nodes[k].classList.remove('is-on', 'is-err'); });
    Object.keys(links).forEach(function (k) { links[k].classList.remove('is-on'); });
    log.innerHTML = '';
    prev = null;
  }

  function apply(step, done) {
    var spec = step[0], text = step[1];
    var from = null, actors = spec;
    if (spec.indexOf('>') > -1) { from = spec.split('>')[0]; actors = spec.split('>')[1]; }
    var ids = actors.split(',');
    var isErr = /!/.test(text);
    var isOk = /OK\.?$|validé|approved|restauré|restored/i.test(text);
    Object.keys(nodes).forEach(function (k) { nodes[k].classList.remove('is-on'); });
    Object.keys(links).forEach(function (k) { links[k].classList.remove('is-on'); });
    var origin = from || prev || 'A1';
    ids.forEach(function (id) {
      nodes[id].classList.add(isErr ? 'is-err' : 'is-on');
      var l = linkFor(origin, id);
      if (l) l.classList.add('is-on');
    });
    if (from) nodes[from].classList.add('is-on');
    var li = document.createElement('li');
    if (isErr) li.className = 'is-err'; else if (isOk) li.className = 'is-ok';
    var who = document.createElement('span');
    who.className = 'who';
    who.textContent = ids.map(function (id) { return id === 'H' ? T.human : id; }).join(' + ');
    li.appendChild(who);
    li.appendChild(document.createTextNode(text));
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
    var target = pos[ids[0]];
    if (gsap && !reduce) {
      gsap.fromTo(packet, { attr: { cx: pos[origin][0], cy: pos[origin][1] }, opacity: 1 },
        { attr: { cx: target[0], cy: target[1] }, duration: .55, ease: 'power2.inOut', onComplete: function () { gsap.to(packet, { opacity: 0, duration: .2 }); } });
    }
    prev = ids[ids.length - 1];
    setTimeout(done, reduce ? 0 : 1150);
  }

  function run(kind) {
    if (running) return;
    running = true;
    buttons.forEach(function (b) { b.disabled = true; });
    reset();
    var steps = T.steps[kind], i = 0;
    (function next() {
      if (i >= steps.length) { running = false; buttons.forEach(function (b) { b.disabled = false; }); return; }
      apply(steps[i++], next);
    })();
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { run(b.getAttribute('data-run')); }); });

  // Lecture automatique du scénario nominal à la première apparition
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); run('nominal'); }
    }, { threshold: .4 });
    io.observe(root);
  }
})();
