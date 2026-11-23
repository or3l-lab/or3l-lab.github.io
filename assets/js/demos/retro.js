/* =====================================================================
   RETRO.SIM : la rétro-ingénierie d'un équipement industriel, en 5 étapes.
   Un poste de convoyage fictif (tapis, capteur, vérin, bac) est d'abord
   observé, puis ses signaux sont relevés, sa logique reconstituée,
   confrontée à la mesure, et enfin documentée.
   Reconstitution simplifiée : l'équipement, les signaux et les valeurs
   (temporisations, durées, compteurs) sont fictifs.
   ===================================================================== */
/* Cartes « Ce que l'on relève » : les pictogrammes s'animent tant que la carte est visible. */
(function () {
  'use strict';
  var cards = document.querySelectorAll('.rt-card');
  if (!cards.length || !('IntersectionObserver' in window) || !document.documentElement.classList.contains('motion')) return;
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (e) { e.target.classList.toggle('is-live', e.isIntersecting); });
  }, { threshold: .35 });
  Array.prototype.forEach.call(cards, function (c) { io.observe(c); });
})();

(function () {
  'use strict';
  var root = document.querySelector('[data-demo="retro"]');
  if (!root) return;

  var T = JSON.parse(root.querySelector('.demo-i18n').textContent);
  var U = T.ui;
  var html = document.documentElement;
  var NS = 'http://www.w3.org/2000/svg';
  var MOTION = html.classList.contains('motion');

  /* ---------- utilitaires ---------- */
  function he(tag, cls, text, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function se(name, attrs, parent, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function cls(el, name, on) { if (el.classList.contains(name) !== !!on) el.classList.toggle(name, !!on); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function sec(x) { return x.toFixed(1).replace('.', U.dec); }

  /* ---------- l'équipement fictif : un cycle de 8 s ----------
     Entrées : I1 pièce présente, I2 vérin sorti, I3 vérin rentré.
     Sorties : Q1 moteur du tapis, Q2 électrovanne du vérin.
     Les temporisations cachées sont T1 = 0,8 s (avant la poussée) et T2 = 0,6 s (vérin sorti). */
  var P = 8, V = 15, SP = 75, DIV = 10;
  var ROWS = ['I1', 'I2', 'I3', 'Q1', 'Q2'];
  var IV = { I1: [[2.4, 3.6]], I2: [[4.0, 4.7]], I3: [[0, 3.3], [5.4, 8]], Q1: [[0, 2.4], [5.4, 8]], Q2: [[3.2, 4.6]] };
  var CUTS = {};
  ROWS.forEach(function (s) {
    var c = [];
    IV[s].forEach(function (iv) { iv.forEach(function (t) { if (t > 0 && t < P && c.indexOf(t) < 0) c.push(t); }); });
    CUTS[s] = c.sort(function (a, b) { return a - b; });
  });
  function isOn(sig, t) {
    var a = IV[sig];
    for (var i = 0; i < a.length; i++) if (t >= a[i][0] && t < a[i][1]) return true;
    return false;
  }
  function runTime(t) { return t < 2.4 ? t : (t < 5.4 ? 2.4 : 2.4 + (t - 5.4)); }
  function ext(t) {
    if (t < 3.2) return 0;
    if (t < 4.0) return 80 * (t - 3.2) / .8;
    if (t < 4.6) return 80;
    if (t < 5.4) return 80 * (1 - (t - 4.6) / .8);
    return 0;
  }
  // États du modèle : 0 attente, 1 temporisation T1, 2 poussée, 3 retour.
  function stateAt(t, hasE1, hasT2) {
    var endPush = hasT2 ? 4.6 : 4.0;
    if (t < 2.4 || t >= 5.4) return 0;
    if (hasE1 && t < 3.2) return 1;
    if (t < endPush) return 2;
    return 3;
  }

  /* ---------- déroulé : durée de chaque étape (secondes) ---------- */
  var DUR = [9.5, 12.5, 9.5, 11.5, 9];
  var LOGT = [.8, 2.9, 5, 7, 8.6];
  var ROWT = function (i) { return .6 + 1.5 * i; };
  var MODT = { E0: .5, t02: 1.9, E2: 2.6, t23: 4.1, E3: 4.8, t30: 6.3, live: 7 };
  var FIX1 = 3.8, FIX2 = 6.6, OKT = 8.4, MISST = 1.8, PREDT = .3;
  var CHKT = function (i) { return .7 + 1 * i; };
  var STAMP = 6.9;

  /* ---------- structure ---------- */
  var bar = root.querySelector('.demo-bar');
  var stepsEl = he('ol', 'rt-steps');
  stepsEl.setAttribute('aria-label', U.stepsLabel);
  bar.parentNode.insertBefore(stepsEl, bar.nextSibling);
  var stepBtns = T.steps.map(function (s, i) {
    var li = he('li', null, null, stepsEl);
    var b = he('button', 'rt-step', null, li);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', (i + 1) + '. ' + s.n);
    he('span', 'rt-step-n', '0' + (i + 1), b);
    he('span', 'rt-step-t', s.n, b);
    b.addEventListener('click', function () { st.paused = false; go(i, true); kick(); });
    return b;
  });

  var stage = he('div', 'rt-stage');
  stepsEl.parentNode.insertBefore(stage, stepsEl.nextSibling);
  var mhost = he('div', 'rt-machine', null, stage);
  var chipId = he('span', 'rt-chip rt-chip--id', U.unknown, mhost);
  var chipRo = he('span', 'rt-chip rt-chip--ro', U.ro, mhost);
  chipRo.insertBefore(he('i', 'rt-lock'), chipRo.firstChild);

  var panel = he('div', 'rt-panel', null, stage);
  var phead = he('div', 'rt-panel-head', null, panel);
  var pk = he('span', 'rt-pk', '', phead);
  var ph = he('h3', 'rt-ph', '', phead);
  var pbody = he('div', 'rt-panel-body', null, panel);

  /* ---------- machine ---------- */
  var M = {};
  (function () {
    var svg = se('svg', { viewBox: '0 0 440 250', 'class': 'rt-msvg', 'aria-hidden': 'true', focusable: 'false' }, mhost);
    var defs = se('defs', {}, svg);
    se('rect', { x: 52, y: 102, width: 341, height: 46 }, se('clipPath', { id: 'rt-belt-clip' }, defs));
    var gr = se('linearGradient', { id: 'rt-scan-g', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    se('stop', { offset: '0', 'stop-color': '#2de2e6', 'stop-opacity': 0 }, gr);
    se('stop', { offset: '1', 'stop-color': '#2de2e6', 'stop-opacity': .32 }, gr);

    se('path', { d: 'M12 66H54L48 100H18Z', 'class': 'rt-m rt-m-soft' }, svg);
    se('path', { d: 'M326 166V222H424V166', 'class': 'rt-bin' }, svg);
    M.binN = se('text', { x: 375, y: 214, 'class': 'rt-bin-n' }, svg, U.cnt + '0');
    se('rect', { x: 50, y: 100, width: 345, height: 50, rx: 4, 'class': 'rt-m rt-belt' }, svg);
    M.stripes = se('g', {}, se('g', { 'clip-path': 'url(#rt-belt-clip)' }, svg));
    for (var k = -1; k < 18; k++) se('path', { d: 'M' + (52 + 20 * k) + ' 102V148', 'class': 'rt-stripe' }, M.stripes);
    se('path', { d: 'M84 150V176', 'class': 'rt-m-line' }, svg);
    se('rect', { x: 56, y: 176, width: 56, height: 38, rx: 5, 'class': 'rt-m rt-m-soft' }, svg);
    se('circle', { cx: 84, cy: 195, r: 12, 'class': 'rt-m' }, svg);
    M.rotor = se('g', {}, svg);
    se('path', { d: 'M84 195V185M84 195L92.7 200M84 195L75.3 200', 'class': 'rt-spoke' }, M.rotor);

    M.pieces = [];
    for (var s = 0; s < 5; s++) {
      var g = se('g', { 'class': 'rt-piece' }, svg);
      se('rect', { width: 30, height: 30, rx: 3 }, g);
      se('path', { d: 'M8 15H22M15 8V22', 'class': 'rt-piece-mark' }, g);
      M.pieces.push(g);
    }

    se('rect', { x: 316, y: 30, width: 26, height: 24, rx: 3, 'class': 'rt-m rt-m-soft' }, svg);
    M.air = se('g', { 'class': 'rt-air' }, svg);
    se('path', { d: 'M342 38H355M342 48H355' }, M.air);
    se('rect', { x: 355, y: 24, width: 30, height: 54, rx: 3, 'class': 'rt-m rt-m-soft' }, svg);
    M.rod = se('rect', { x: 366, y: 78, width: 8, height: 0, 'class': 'rt-rod' }, svg);
    M.head = se('rect', { x: 358, y: 78, width: 24, height: 6, rx: 1.5, 'class': 'rt-rod-head' }, svg);
    se('rect', { x: 388, y: 28, width: 10, height: 12, rx: 2, 'class': 'rt-m rt-m-soft' }, svg);
    se('rect', { x: 388, y: 60, width: 10, height: 12, rx: 2, 'class': 'rt-m rt-m-soft' }, svg);
    se('rect', { x: 398, y: 112, width: 16, height: 26, rx: 2, 'class': 'rt-m rt-m-soft' }, svg);
    M.beam = se('path', { d: 'M398 125L386 115V135Z', 'class': 'rt-beam' }, svg);

    var LED = { I1: [406, 125, 3.6], I2: [393, 66, 3], I3: [393, 34, 3], Q1: [102, 184, 3.4], Q2: [329, 42, 3.6] };
    M.leds = {};
    ROWS.forEach(function (s) { M.leds[s] = se('circle', { cx: LED[s][0], cy: LED[s][1], r: LED[s][2], 'class': 'rt-led rt-led--' + s.charAt(0) }, svg); });

    var TAG = { I1: [402, 92], I2: [402, 60], I3: [402, 28], Q1: [118, 188], Q2: [316, 8] };
    M.tags = {};
    ROWS.forEach(function (s) {
      var g = se('g', { 'class': 'rt-tag rt-tag--' + s.charAt(0), transform: 'translate(' + TAG[s][0] + ' ' + TAG[s][1] + ')' }, svg);
      se('rect', { width: 26, height: 14, rx: 2 }, g);
      se('text', { x: 13, y: 10.5 }, g, s);
      M.tags[s] = g;
    });

    M.qs = [[200, 80], [296, 34], [424, 158]].map(function (p) {
      var g = se('g', { 'class': 'rt-q', transform: 'translate(' + p[0] + ' ' + p[1] + ')' }, svg);
      se('circle', { r: 9 }, g);
      se('text', { x: 0, y: 3.6 }, g, '?');
      return g;
    });

    M.scan = se('g', { 'class': 'rt-scan' }, svg);
    se('rect', { x: -44, y: 6, width: 44, height: 238, fill: 'url(#rt-scan-g)' }, M.scan);
    se('path', { d: 'M0 6V244', 'class': 'rt-scan-edge' }, M.scan);
  })();

  /* ---------- panneau : observation, relevé, modèle, dossier ---------- */
  var paneLog = he('div', 'rt-pane', null, pbody);
  var logEl = he('ol', 'rt-log', null, paneLog);
  var logs = T.log.map(function (t) { return he('li', null, t, logEl); });

  var paneIo = he('div', 'rt-pane', null, pbody);
  var ioEl = he('ul', 'rt-io', null, paneIo);
  var ioHead = he('li', 'rt-io-head', null, ioEl);
  T.ioHead.forEach(function (h) { he('span', null, h, ioHead); });
  var ios = T.io.map(function (r) {
    var li = he('li', 'rt-io-row rt-io-row--' + r[0].charAt(0), null, ioEl);
    he('b', null, r[0], li);
    he('span', null, r[1], li);
    he('em', null, r[2], li);
    return li;
  });

  var paneModel = he('div', 'rt-pane', null, pbody);
  var model = {};
  (function () {
    var svg = se('svg', { viewBox: '0 0 360 118', 'class': 'rt-msvg rt-model', role: 'img', 'aria-label': U.modelLabel }, he('div', 'rt-model-wrap', null, paneModel));
    var defs = se('defs', {}, svg);
    var mk = se('marker', { id: 'rt-arr', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
    se('path', { d: 'M0 0L10 5L0 10z', 'class': 'rt-arrowhead' }, mk);
    var X = [6, 100, 194, 288], names = ['E0', 'E1', 'E2', 'E3'];
    model.tr = {};
    function tr(id, d, lx, ly, text, extra) {
      var g = se('g', { 'class': 'rt-tr' + (extra ? ' ' + extra : '') }, svg);
      se('path', { d: d, 'marker-end': 'url(#rt-arr)' }, g);
      se('text', { x: lx, y: ly }, g, text);
      model.tr[id] = g;
    }
    tr('t02', 'M80 49H192', 137, 43, T.model.t01, 'rt-tr--naive');
    tr('t01', 'M80 49H98', 89, 24, T.model.t01);
    tr('t12', 'M174 49H192', 183, 24, T.model.t12);
    tr('t23a', 'M268 49H286', 277, 24, T.model.t23a);
    tr('t23b', 'M268 49H286', 277, 24, T.model.t23b);
    tr('t30', 'M325 70V94H43V72', 184, 110, T.model.t30);
    model.st = names.map(function (n, i) {
      var g = se('g', { 'class': 'rt-st' }, svg);
      se('rect', { x: X[i], y: 30, width: 74, height: 38, rx: 4 }, g);
      se('text', { x: X[i] + 37, y: 46, 'class': 'rt-st-t' }, g, T.model[n][0]);
      se('text', { x: X[i] + 37, y: 60, 'class': 'rt-st-a' }, g, T.model[n][1]);
      return g;
    });
    model.hypo = he('p', 'rt-hypo', T.hypo, paneModel);
    var v = he('div', 'rt-verdict', null, paneModel);
    var vl = he('p', 'rt-v-line', null, v);
    he('span', 'rt-v-k', U.gap, vl);
    model.vn = he('b', 'rt-v-n', '—', vl);
    var fl = he('ul', 'rt-fix', null, v);
    model.fix = T.fix.map(function (t) { return he('li', null, t, fl); });
    model.ok = he('p', 'rt-v-ok', U.ok, v);
    model.verdict = v;
  })();

  var paneDoc = he('div', 'rt-pane', null, pbody);
  var chkEl = he('ul', 'rt-check', null, paneDoc);
  var chks = T.check.map(function (t) {
    var li = he('li', null, null, chkEl);
    he('i', 'rt-box', null, li);
    he('span', null, t, li);
    return li;
  });
  var stamp = he('p', 'rt-stamp', U.stamp, paneDoc);
  var panes = [paneLog, paneIo, paneModel, paneModel, paneDoc];

  /* ---------- relevé : chronogrammes ---------- */
  var traceEl = he('div', 'rt-trace');
  stage.parentNode.insertBefore(traceEl, stage.nextSibling);
  var grid = he('div', 'rt-grid', null, traceEl);
  var labs = [], waves = [], covered = {}, dirty = {};
  ROWS.forEach(function (s, i) {
    var r = T.io[i];
    var lab = he('div', 'rt-lab rt-lab--' + s.charAt(0), null, grid);
    lab.style.gridRow = String(i + 1);
    he('b', null, s, lab);
    he('span', null, r[1], lab);
    var w = he('div', 'rt-wave', null, grid);
    w.style.gridRow = String(i + 1);
    var svg = se('svg', { viewBox: '0 0 800 24', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' }, w);
    se('path', { d: 'M0 20H800', 'class': 'rt-base' }, svg);
    var sig = se('path', { d: '', 'class': 'rt-sig rt-sig--' + s.charAt(0) }, svg);
    var o = { sig: sig };
    if (s === 'Q2') {
      o.miss1 = se('rect', { x: 0, y: 0, width: 0, height: 24, 'class': 'rt-miss' }, svg);
      o.miss2 = se('rect', { x: 0, y: 0, width: 0, height: 24, 'class': 'rt-miss' }, svg);
      o.pred = se('path', { d: '', 'class': 'rt-pred' }, svg);
    }
    labs.push(lab);
    waves.push(o);
    covered[s] = [];
    for (var k = 0; k < P * DIV; k++) covered[s].push(false);
    dirty[s] = true;
  });
  var zone = he('div', 'rt-zone', null, grid);
  var head = he('i', 'rt-head', null, zone);
  var flags = he('div', 'rt-flags', null, grid);
  var flag1 = he('span', 'rt-flag', '', flags), flag2 = he('span', 'rt-flag', '', flags);
  var axis = he('div', 'rt-axis', null, grid);
  for (var a = 0; a <= P; a++) {
    var tk = he('span', 'rt-tick', a === 0 ? '0' : (a === P ? P + U.sec : String(a)), axis);
    tk.style.left = (a / P * 100) + '%';
    if (a === 0) tk.classList.add('is-first');
    if (a === P) tk.classList.add('is-last');
  }
  var clock = he('span', 'rt-clock', '', axis);

  /* ---------- légende et commandes ---------- */
  var cap = he('div', 'rt-cap');
  traceEl.parentNode.insertBefore(cap, traceEl.nextSibling);
  var capT = he('p', 'rt-cap-t', '', cap);
  capT.setAttribute('aria-live', 'polite');
  var ctl = he('div', 'rt-cap-ctl', null, cap);
  var progEl = he('span', 'rt-prog', null, ctl);
  var prog = he('i', null, null, progEl);
  var playBtn = he('button', 'rt-btn', U.pause, ctl);
  playBtn.type = 'button';
  var replayBtn = he('button', 'rt-btn', U.replay, ctl);
  replayBtn.type = 'button';
  if (!MOTION) ctl.hidden = true;

  var srList = he('ol', 'sr-only', null);
  cap.parentNode.insertBefore(srList, cap.nextSibling);
  T.steps.forEach(function (s) { he('li', null, s.n + ' — ' + s.c, srList); });

  /* ---------- état et dessin ---------- */
  var st = { step: -1, e: 0, sim: 0, auto: true, paused: false, inView: false, tab: true };
  var raf = 0, last = 0;

  function wavePath(sig) {
    var d = '', i = 0, N = P * DIV, c = covered[sig];
    while (i < N) {
      if (!c[i]) { i++; continue; }
      var j = i;
      while (j < N && c[j]) j++;
      var t0 = i / DIV, t1 = j / DIV;
      d += 'M' + (t0 * 100) + ' ' + (isOn(sig, t0 + .001) ? 4 : 20);
      CUTS[sig].forEach(function (x) { if (x > t0 && x < t1) d += 'H' + (x * 100) + 'V' + (isOn(sig, x + .001) ? 4 : 20); });
      d += 'H' + (t1 * 100);
      i = j;
    }
    return d;
  }
  function clearCovered() { ROWS.forEach(function (s) { for (var k = 0; k < covered[s].length; k++) covered[s][k] = false; dirty[s] = true; }); }
  function fillCovered() { ROWS.forEach(function (s) { for (var k = 0; k < covered[s].length; k++) covered[s][k] = true; dirty[s] = true; }); }

  function enter(k) {
    st.step = k;
    st.e = 0;
    root.setAttribute('data-step', String(k));
    stepBtns.forEach(function (b, i) {
      b.setAttribute('aria-pressed', i === k ? 'true' : 'false');
      cls(b, 'is-current', i === k);
      cls(b, 'is-done', i < k);
    });
    panes.forEach(function (p, i) { p.hidden = (p !== panes[k]); });
    pk.textContent = '0' + (k + 1) + ' / 0' + T.steps.length;
    ph.textContent = T.steps[k].h;
    capT.textContent = T.steps[k].c;
    if (k === 0 && MOTION) st.sim = 0;
    if (k === 0 || (k === 1 && MOTION)) clearCovered(); else fillCovered();
    pbody.classList.remove('rt-enter');
    void pbody.offsetWidth;
    pbody.classList.add('rt-enter');
  }
  function go(k, manual) {
    enter(k);
    if (manual) st.auto = false;
    if (!MOTION) st.e = DUR[k] + 5;
    draw();
  }

  function drawMachine(tau, n) {
    var run = runTime(tau);
    M.stripes.setAttribute('transform', 'translate(' + (((V * run + SP * n) % 20)).toFixed(2) + ' 0)');
    M.rotor.setAttribute('transform', 'rotate(' + ((V * run + SP * n) * 9).toFixed(1) + ' 84 195)');
    var b = V * run;
    for (var s = 0; s < M.pieces.length; s++) {
      var p = 264 + b - SP * s, dy = 0, op = clamp((p + 15) / 15, 0, 1);
      if (s === 0) {
        if (tau >= 5.4) op = 0;
        else if (tau >= 4.6) { var f = (tau - 4.6) / .8; dy = 54 + 6 * f; op = f < .45 ? 1 : 1 - (f - .45) / .55; }
        else dy = clamp(ext(tau) - 26, 0, 54);
      }
      M.pieces[s].setAttribute('transform', 'translate(' + (55 + p).toFixed(1) + ' ' + (110 + dy).toFixed(1) + ')');
      M.pieces[s].style.opacity = op.toFixed(2);
    }
    var x = ext(tau);
    M.rod.setAttribute('height', x.toFixed(1));
    M.head.setAttribute('y', (78 + x).toFixed(1));
    var delivered = n + (tau >= 4.0 ? 1 : 0);
    var txt = U.cnt + delivered;
    if (M.binN.textContent !== txt) M.binN.textContent = txt;
    ROWS.forEach(function (sg) { cls(M.leds[sg], 'is-on', isOn(sg, tau)); });
    cls(M.beam, 'is-on', isOn('I1', tau));
    cls(M.air, 'is-on', isOn('Q2', tau));
  }

  function rowVisible(i, k, e) { return k === 0 ? false : (k === 1 ? e >= ROWT(i) : true); }

  function drawStep(k, e, tau) {
    // Machine : repères d'étape
    cls(M.scan, 'is-on', k === 0);
    M.qs.forEach(function (q) { cls(q, 'is-on', k === 0); });
    chipId.textContent = k === 0 ? U.unknown : U.known;
    cls(chipId, 'is-known', k > 0);
    var docDone = k === 4 && e >= STAMP;
    chipRo.lastChild.textContent = docDone ? U.done : U.ro;
    cls(chipRo, 'is-done', docDone);

    // Chronogrammes : libellés, enregistrement progressif, repères
    ROWS.forEach(function (s, i) {
      var vis = rowVisible(i, k, e);
      cls(labs[i], 'is-on', vis);
      cls(M.tags[s], 'is-on', vis);
      cls(M.tags[s], 'is-hot', vis && isOn(s, tau));
      if (vis && k === 1) {
        var idx = Math.min(P * DIV - 1, Math.floor(tau * DIV));
        if (!covered[s][idx]) { covered[s][idx] = true; dirty[s] = true; }
      }
      if (dirty[s]) { waves[i].sig.setAttribute('d', wavePath(s)); dirty[s] = false; }
    });
    ios.forEach(function (li, i) { cls(li, 'is-on', rowVisible(i, k, e)); cls(li, 'is-hot', rowVisible(i, k, e) && isOn(ROWS[i], tau)); });

    // Étape 1 : journal d'observation
    logs.forEach(function (li, i) { cls(li, 'is-on', k === 0 ? e >= LOGT[i] : false); });

    // Étapes 3 et 4 : modèle, hypothèse contre mesure
    var hasE1 = false, hasT2 = false, a = 2.4, bEnd = 4.0, verdictOn = false, missOn = false, predOn = false;
    if (k === 2) {
      cls(model.st[0], 'is-on', e >= MODT.E0);
      cls(model.st[1], 'is-on', false);
      cls(model.st[2], 'is-on', e >= MODT.E2);
      cls(model.st[3], 'is-on', e >= MODT.E3);
      cls(model.tr.t02, 'is-on', e >= MODT.t02);
      cls(model.tr.t01, 'is-on', false);
      cls(model.tr.t12, 'is-on', false);
      cls(model.tr.t23a, 'is-on', e >= MODT.t23);
      cls(model.tr.t23b, 'is-on', false);
      cls(model.tr.t30, 'is-on', e >= MODT.t30);
    } else if (k === 3) {
      hasE1 = e >= FIX1;
      hasT2 = e >= FIX2;
      a = hasE1 ? 2.4 + .8 * ease(clamp((e - FIX1) / 1.5, 0, 1)) : 2.4;
      bEnd = hasT2 ? 4.0 + .6 * ease(clamp((e - FIX2) / 1.5, 0, 1)) : 4.0;
      verdictOn = true;
      predOn = e >= PREDT;
      missOn = e >= MISST;
      cls(model.st[0], 'is-on', true);
      cls(model.st[1], 'is-on', hasE1);
      cls(model.st[2], 'is-on', true);
      cls(model.st[3], 'is-on', true);
      cls(model.tr.t02, 'is-on', !hasE1);
      cls(model.tr.t01, 'is-on', hasE1);
      cls(model.tr.t12, 'is-on', hasE1);
      cls(model.tr.t23a, 'is-on', !hasT2);
      cls(model.tr.t23b, 'is-on', hasT2);
      cls(model.tr.t30, 'is-on', true);
    }
    var live = (k === 2 && e >= MODT.live) || k === 3;
    var cur = live ? stateAt(tau, hasE1, hasT2) : -1;
    model.st.forEach(function (g, i) { cls(g, 'is-live', i === cur); });
    cls(model.verdict, 'is-on', verdictOn);
    cls(model.hypo, 'is-on', k === 3);
    var w1 = Math.max(0, 3.2 - a), w2 = Math.max(0, 4.6 - bEnd);
    var gaps = (w1 > .005 ? 1 : 0) + (w2 > .005 ? 1 : 0);
    var vt = missOn ? String(gaps) : '—';
    if (model.vn.textContent !== vt) model.vn.textContent = vt;
    cls(model.vn, 'is-bad', missOn && gaps > 0);
    cls(model.vn, 'is-zero', missOn && gaps === 0);
    cls(model.fix[0], 'is-on', k === 3 && hasE1);
    cls(model.fix[1], 'is-on', k === 3 && hasT2);
    cls(model.ok, 'is-on', k === 3 && e >= OKT);

    var q = waves[ROWS.indexOf('Q2')];
    cls(q.pred, 'is-on', k === 3 && predOn);
    q.pred.setAttribute('d', 'M0 20H' + (a * 100).toFixed(1) + 'V4H' + (bEnd * 100).toFixed(1) + 'V20H800');
    q.miss1.setAttribute('x', (a * 100).toFixed(1));
    q.miss1.setAttribute('width', (w1 * 100).toFixed(1));
    q.miss2.setAttribute('x', (bEnd * 100).toFixed(1));
    q.miss2.setAttribute('width', (w2 * 100).toFixed(1));
    cls(q.miss1, 'is-on', k === 3 && missOn);
    cls(q.miss2, 'is-on', k === 3 && missOn);
    [[flag1, a, 3.2, w1], [flag2, bEnd, 4.6, w2]].forEach(function (f) {
      var show = k === 3 && missOn && f[3] > .02;
      cls(f[0], 'is-on', show);
      if (show) {
        f[0].style.left = (((f[1] + f[2]) / 2) / P * 100).toFixed(2) + '%';
        var t = sec(f[3]) + U.sec;
        if (f[0].textContent !== t) f[0].textContent = t;
      }
    });

    // Étape 5 : dossier remis
    chks.forEach(function (li, i) { cls(li, 'is-on', k === 4 && e >= CHKT(i)); });
    cls(stamp, 'is-on', k === 4 && e >= STAMP);
  }

  function draw() {
    var tau = st.sim % P, n = Math.floor(st.sim / P);
    drawMachine(tau, n);
    head.style.left = (tau / P * 100).toFixed(2) + '%';
    var ct = U.t + ' ' + sec(tau) + U.sec;
    if (clock.textContent !== ct) clock.textContent = ct;
    drawStep(st.step, st.e, tau);
    prog.style.transform = 'scaleX(' + (st.auto ? clamp(st.e / DUR[st.step], 0, 1) : 1).toFixed(3) + ')';
  }

  function frame(now) {
    raf = 0;
    if (!st.inView || !st.tab || st.paused) { last = 0; return; }
    var dt = last ? Math.min(.1, (now - last) / 1000) : 0;
    last = now;
    st.sim += dt;
    st.e += dt;
    if (st.auto && st.e >= DUR[st.step]) {
      if (st.step < DUR.length - 1) enter(st.step + 1);
      else st.auto = false;
    }
    draw();
    raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (!MOTION || raf || !st.inView || !st.tab || st.paused) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function syncPlay() {
    playBtn.textContent = st.paused ? U.play : U.pause;
    playBtn.setAttribute('aria-pressed', st.paused ? 'true' : 'false');
  }

  playBtn.addEventListener('click', function () {
    st.paused = !st.paused;
    syncPlay();
    kick();
  });
  replayBtn.addEventListener('click', function () {
    st.paused = false;
    st.auto = true;
    syncPlay();
    go(0, false);
    kick();
  });
  document.addEventListener('visibilitychange', function () { st.tab = !document.hidden; kick(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      st.inView = en[0].isIntersecting;
      kick();
    }, { threshold: .25 }).observe(root);
  } else {
    st.inView = true;
  }

  syncPlay();
  if (MOTION) { go(0, false); kick(); }
  else { st.sim = 4.2; go(3, true); }
})();
