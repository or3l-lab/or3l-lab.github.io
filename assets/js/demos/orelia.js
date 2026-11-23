/* =====================================================================
   ORELIA.SIM : le trajet d'une demande dans l'assistante.
   À gauche, ce que voit l'utilisateur (fenêtre de discussion) ; à droite,
   les coulisses (chef d'orchestre, agents, garde-fous, fichiers), le tout
   dans le périmètre du PC. Reconstitution simplifiée, contenu fictif.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-demo="orelia"]');
  if (!root) return;

  var T = JSON.parse(root.querySelector('.demo-i18n').textContent);
  var U = T.ui, S = T.scn, N = T.names;
  var html = document.documentElement;
  var NS = 'http://www.w3.org/2000/svg';
  var CANCEL = { cancelled: true };
  var RUN = 0, abortHook = null, started = false;

  function reduced() { return !html.classList.contains('motion'); }
  function $(s) { return root.querySelector(s); }
  function all(s) { return [].slice.call(root.querySelectorAll(s)); }
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

  var win = $('[data-win]'), wtitle = $('[data-wtitle]'), chat = $('[data-chat]');
  var typed = $('[data-typed]'), actions = $('[data-actions]'), autoBar = $('[data-auto]');
  var graph = $('[data-graph]'), capn = $('[data-capn]'), capt = $('[data-capt]'), prog = $('[data-prog]');
  var journal = $('[data-journal]'), wall = $('[data-wall]'), count = $('[data-count]');
  var buttons = all('[data-run]'), chips = all('[data-chip]');
  var rows = {}, drows = {};
  all('[data-b]').forEach(function (e) { rows[e.getAttribute('data-b')] = e; });
  all('[data-d]').forEach(function (e) { drows[e.getAttribute('data-d')] = e; });
  var ORDER = buttons.map(function (b) { return b.getAttribute('data-run'); });
  var fmt = new Intl.NumberFormat(U.nf);
  var TESTS = 1450, COLS = 145, ROWS = 10;

  /* ---------- moteur : annulable, instantané en mode réduit ---------- */
  function sleep(r, ms) {
    return new Promise(function (res, rej) {
      if (r.id !== RUN) return rej(CANCEL);
      if (reduced() || ms <= 0) return res();
      setTimeout(function () { r.id !== RUN ? rej(CANCEL) : res(); }, ms);
    });
  }
  function tween(r, ms, fn, ease) {
    return new Promise(function (res, rej) {
      if (r.id !== RUN) return rej(CANCEL);
      if (reduced() || ms <= 0) { fn(1); return res(); }
      var t0 = performance.now();
      (function frame(now) {
        if (r.id !== RUN) return rej(CANCEL);
        var t = Math.min(1, (now - t0) / ms);
        fn(ease ? ease(t) : t);
        t < 1 ? requestAnimationFrame(frame) : res();
      })(t0);
    });
  }
  function inOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* ---------- coulisses : graphe ---------- */
  var POS = { H: [46, 150], O: [140, 150], M: [140, 64], E1: [252, 64], E2: [252, 150], E3: [252, 236], G: [362, 150], F: [440, 150] };
  var RAD = { H: 20, O: 26, M: 22, E1: 19, E2: 19, E3: 19, G: 22, F: 20 };
  var EDGES = [['H', 'O'], ['O', 'M'], ['O', 'E1'], ['O', 'E2'], ['O', 'E3'], ['E1', 'G'], ['E2', 'G'], ['E3', 'G'], ['G', 'F']];
  var svg = se('svg', { viewBox: '0 0 480 340', 'aria-hidden': 'true', focusable: 'false' }, graph);
  var nodes = {}, links = {};

  se('rect', { x: 6, y: 8, width: 468, height: 288, rx: 4, 'class': 'ol-peri' }, svg);
  se('text', { x: 16, y: 289, 'class': 'ol-peri-t' }, svg, U.perim);
  se('path', { d: 'M228 296 V315', 'class': 'ol-cloud-l' }, svg);
  se('path', { d: 'M224.5 301 L231.5 308 M231.5 301 L224.5 308', 'class': 'ol-cloud-x' }, svg);
  se('path', { d: 'M-13 7 A6 6 0 0 1 -11 -4.8 A9 9 0 0 1 6 -6 A6.5 6.5 0 0 1 12 7 Z', transform: 'translate(228 322)', 'class': 'ol-cloud' }, svg);
  se('text', { x: 250, y: 326, 'class': 'ol-cloud-t' }, svg, U.cloud);

  EDGES.forEach(function (e) {
    var s = seg(e[0], e[1]);
    links[e[0] + '|' + e[1]] = se('line', { x1: s[0], y1: s[1], x2: s[2], y2: s[3], 'class': 'ol-l' }, svg);
  });

  function seg(a, b) {
    var p = POS[a], q = POS[b], dx = q[0] - p[0], dy = q[1] - p[1], d = Math.sqrt(dx * dx + dy * dy), ux = dx / d, uy = dy / d;
    var ra = RAD[a] + 3, rb = RAD[b] + 3;
    return [p[0] + ux * ra, p[1] + uy * ra, q[0] - ux * rb, q[1] - uy * rb];
  }
  function link(a, b) { return links[a + '|' + b] || links[b + '|' + a]; }

  Object.keys(POS).forEach(function (id) {
    var p = POS[id], R = RAD[id], g = se('g', { 'class': 'ol-n ol-n--' + id }, svg);
    se('circle', { cx: p[0], cy: p[1], r: R + 6, 'class': 'ol-ring' }, g);
    if (id.charAt(0) === 'E') se('rect', { x: p[0] - R, y: p[1] - R, width: R * 2, height: R * 2, rx: 8, 'class': 'ol-shape' }, g);
    else se('circle', { cx: p[0], cy: p[1], r: R, 'class': 'ol-shape' }, g);
    var gl = se('g', { 'class': 'ol-gl', transform: 'translate(' + p[0] + ' ' + p[1] + ')' }, g);
    if (id === 'H') {
      se('circle', { cx: 0, cy: -5, r: 4.5 }, gl);
      se('path', { d: 'M-9 10 C-9 1.5 9 1.5 9 10' }, gl);
    } else if (id === 'G') {
      se('path', { d: 'M0 -12 L10 -8 V1 C10 7 5 11 0 13.5 C-5 11 -10 7 -10 1 V-8 Z' }, gl);
      se('path', { d: 'M-4 1 L-1 4 L5 -3' }, gl);
    } else if (id === 'F') {
      se('path', { d: 'M-8 -11 H3 L9 -5 V11 H-8 Z' }, gl);
      se('path', { d: 'M3 -11 V-5 H9 M-4 1 H5 M-4 5 H5' }, gl);
    } else if (id === 'M') {
      se('path', { d: 'M0 -22 V22' }, gl);
      se('text', { x: -9, y: 4, 'class': 'ol-t' }, gl, 'G');
      se('text', { x: 9, y: 4, 'class': 'ol-t' }, gl, 'P');
    } else {
      se('text', { x: 0, y: id === 'O' ? 5 : 4, 'class': id === 'O' ? 'ol-t ol-t--big' : 'ol-t' }, gl, id === 'O' ? 'O' : 'A' + id.charAt(1));
    }
    se('text', { x: p[0], y: id === 'M' ? p[1] - R - 8 : p[1] + R + 15, 'class': 'ol-name' }, g, N[id]);
    if (id.charAt(0) === 'E') {
      se('rect', { x: p[0] - 28, y: p[1] + R + 21, width: 56, height: 13, rx: 6.5, 'class': 'ol-llm' }, g);
      se('text', { x: p[0], y: p[1] + R + 31, 'class': 'ol-llm-t' }, g, U.llm);
    }
    if (id === 'M') se('title', {}, g, U.mem);
    nodes[id] = g;
  });

  function mark(id, cls) {
    nodes[id].classList.remove('is-done');
    nodes[id].classList.add(cls);
  }
  function demote() {
    Object.keys(nodes).forEach(function (k) { if (nodes[k].classList.contains('is-on')) { nodes[k].classList.remove('is-on'); nodes[k].classList.add('is-done'); } });
    Object.keys(links).forEach(function (k) { if (links[k].classList.contains('is-on')) { links[k].classList.remove('is-on'); links[k].classList.add('is-done'); } });
  }

  async function hop(r, a, b, ms) {
    var s = seg(a, b), g = se('g', { 'class': 'ol-pk' }, svg);
    var dots = [3.4, 2.5, 1.7].map(function (rad) { return se('circle', { r: rad }, g); });
    function place(t) {
      dots.forEach(function (c, i) {
        var u = Math.max(0, t - i * 0.07);
        c.setAttribute('cx', s[0] + (s[2] - s[0]) * u);
        c.setAttribute('cy', s[1] + (s[3] - s[1]) * u);
      });
    }
    place(0);
    try { await tween(r, ms || 520, place, inOut); } finally { if (g.parentNode) g.parentNode.removeChild(g); }
  }
  // 'A>B' ou en parallèle 'A>B+C>D'
  async function route(r, spec, ms) {
    demote();
    var hops = spec.split('+').map(function (s) { return s.split('>'); });
    hops.forEach(function (h) { mark(h[0], 'is-on'); link(h[0], h[1]).classList.add('is-on'); });
    await Promise.all(hops.map(function (h) { return hop(r, h[0], h[1], ms); }));
    hops.forEach(function (h) { mark(h[1], 'is-on'); });
  }

  /* ---------- fenêtre de discussion ---------- */
  function note(text) { he('li', null, text, journal); }
  function scrollDown() {
    chat.scrollTop = chat.scrollHeight;
    requestAnimationFrame(function () { chat.scrollTop = chat.scrollHeight; });
  }
  function userMsg(text) {
    var m = he('div', 'ol-m ol-m--me', null, chat);
    he('span', 'ol-who', U.you, m);
    he('p', 'ol-mb', text, m);
    note(U.you + ' : ' + text);
    scrollDown();
  }
  function botMsg(text) {
    var m = he('div', 'ol-m ol-m--bot', null, chat);
    he('span', 'ol-who', U.bot, m);
    var b = he('div', 'ol-mb', null, m);
    if (text) he('p', null, text, b);
    scrollDown();
    return b;
  }
  function thinking(b) {
    var d = he('span', 'ol-think', null, b);
    he('i', null, null, d); he('i', null, null, d); he('i', null, null, d);
    scrollDown();
    return d;
  }
  function drop(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }
  async function typeQuestion(r, text) {
    win.classList.add('is-typing');
    await tween(r, text.length * 24, function (t) { typed.textContent = text.slice(0, Math.round(t * text.length)); });
    await sleep(r, 280);
    typed.textContent = '';
    win.classList.remove('is-typing');
    userMsg(text);
  }
  async function stream(r, el, text) {
    var w = text.split(' ');
    await tween(r, w.length * 38, function (t) {
      el.textContent = w.slice(0, Math.max(1, Math.round(t * w.length))).join(' ');
      scrollDown();
    });
  }
  async function reveal(r, el, gap) {
    void el.offsetWidth;
    el.classList.add('is-in');
    scrollDown();
    await sleep(r, gap);
  }
  async function readFiles(r, b, names) {
    var box = he('div', 'ol-files', null, b);
    for (var i = 0; i < names.length; i++) {
      var f = he('span', 'ol-file', null, box);
      he('b', null, names[i], f);
      he('small', null, U.read, f);
      await reveal(r, f, 380);
    }
  }
  async function sourcedAnswer(r, b, items) {
    var plain = [];
    for (var i = 0; i < items.length; i++) {
      var p = he('p', 'ol-a', null, b);
      he('span', 'ol-tag ol-tag--' + items[i][0], U.tags[items[i][0]], p);
      var span = he('span', 'ol-at', null, p);
      await stream(r, span, items[i][1]);
      plain.push(U.tags[items[i][0]] + ' : ' + items[i][1]);
    }
    note(U.bot + ' : ' + plain.join(' '));
  }
  async function diffCard(r, b, sc) {
    var d = he('div', 'ol-diff', null, b), h = he('div', 'ol-diff-h', null, d);
    he('b', null, sc.file, h);
    he('small', null, U.preview, h);
    for (var i = 0; i < sc.diff.length; i++) {
      var l = he('div', 'ol-dl ol-dl--' + sc.diff[i][0], null, d);
      he('span', 'ol-sg', { ctx: ' ', del: '−', add: '+' }[sc.diff[i][0]], l);
      he('span', null, sc.diff[i][1], l);
      await reveal(r, l, 320);
    }
    return d;
  }
  function denyCard(b, sc) {
    var d = he('div', 'ol-deny', null, b);
    d.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    he('strong', null, U.denyTitle, d);
    he('p', null, sc.denyText, d);
    var ul = he('ul', 'ol-allowed', null, d);
    he('li', 'ol-allowed-k', U.allowed, ul);
    U.allowedList.forEach(function (f) { he('li', null, f, ul); });
    scrollDown();
    return d;
  }
  function outcome(b, ok, text, extra) {
    var d = he('div', 'ol-done' + (ok ? '' : ' ol-done--no'), null, b);
    he('span', null, ok ? '✓' : '✕', d).setAttribute('aria-hidden', 'true');
    he('p', null, text, d);
    if (extra) he('b', null, extra, d);
    note(U.bot + ' : ' + text);
    scrollDown();
  }

  // confirmation interactive ; confirmation automatique si personne ne répond
  function confirmWait(r) {
    return new Promise(function (res, rej) {
      if (r.id !== RUN) return rej(CANCEL);
      if (reduced()) return res('confirm');
      var done = false, paused = false, elapsed = 0, last = performance.now(), raf = 0, LIMIT = 4500;
      var btnC = actions.querySelector('[data-act="confirm"]'), btnX = actions.querySelector('[data-act="cancel"]');
      function pause() { paused = true; }
      function resume() { paused = false; last = performance.now(); }
      function cleanup() {
        done = true;
        cancelAnimationFrame(raf);
        abortHook = null;
        btnC.removeEventListener('click', onC); btnX.removeEventListener('click', onX);
        actions.removeEventListener('mouseenter', pause); actions.removeEventListener('mouseleave', resume);
        actions.removeEventListener('focusin', pause); actions.removeEventListener('focusout', resume);
        actions.hidden = true;
        win.classList.remove('is-confirm');
      }
      function onC() { if (!done) { cleanup(); res('confirm'); } }
      function onX() { if (!done) { cleanup(); res('cancel'); } }
      function tick(now) {
        if (done) return;
        if (!paused) elapsed += now - last;
        last = now;
        autoBar.style.width = Math.min(100, elapsed / LIMIT * 100) + '%';
        if (elapsed >= LIMIT) return onC();
        raf = requestAnimationFrame(tick);
      }
      abortHook = function () { if (!done) { cleanup(); rej(CANCEL); } };
      btnC.addEventListener('click', onC); btnX.addEventListener('click', onX);
      actions.addEventListener('mouseenter', pause); actions.addEventListener('mouseleave', resume);
      actions.addEventListener('focusin', pause); actions.addEventListener('focusout', resume);
      autoBar.style.width = '0';
      actions.hidden = false;
      win.classList.add('is-confirm');
      note(U.waiting);
      raf = requestAnimationFrame(tick);
    });
  }

  /* ---------- légende, garde-fous, bandeau ---------- */
  function caption(n, tot, text) {
    capn.textContent = n ? n + ' / ' + tot : '';
    capt.textContent = text || '';
    capt.classList.remove('is-in');
    void capt.offsetWidth;
    capt.classList.add('is-in');
    prog.style.width = n ? (n / tot * 100) + '%' : '0%';
    if (n && text) note(text);
  }
  function chip(key, warn) {
    var c = root.querySelector('[data-chip="' + key + '"]');
    if (!c) return;
    c.classList.add('is-on');
    if (warn) c.classList.add('is-warn');
  }
  async function beat(r, sc, i, fn, o) {
    o = o || {};
    var text = o.text || sc.cap[i];
    caption(i + 1, sc.cap.length, text);
    (o.chips || []).forEach(function (k) { chip(k, o.warn && o.warn.indexOf(k) > -1); });
    await fn();
    await sleep(r, o.hold != null ? o.hold : Math.max(650, Math.min(2200, text.length * 14)));
  }

  /* ---------- banc de qualité ---------- */
  function drawWall(cols) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = wall.clientWidth || 580, h = 40;
    if (wall.width !== Math.round(w * dpr)) { wall.width = Math.round(w * dpr); wall.height = Math.round(h * dpr); }
    var x = wall.getContext('2d'), cw = w / COLS, ch = h / ROWS;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, w, h);
    x.fillStyle = getComputedStyle(root).getPropertyValue('--run').trim() || '#3ddc97';
    for (var c = 0; c < cols; c++) for (var k = 0; k < ROWS; k++) x.fillRect(c * cw + 0.6, k * ch + 0.6, Math.max(1, cw - 1.4), ch - 1.4);
  }
  function setCount(n) { count.textContent = n ? fmt.format(n) + ' / ' + fmt.format(TESTS) : ''; }
  function show(key) { rows[key].classList.add('is-in'); }

  /* ---------- scénarios ---------- */
  var SC = {};

  SC.ask = async function (r) {
    var sc = S.ask, b, dots;
    await beat(r, sc, 0, async function () { await typeQuestion(r, sc.q); await route(r, 'H>O'); }, { chips: ['local'] });
    await beat(r, sc, 1, async function () {
      b = botMsg(); dots = thinking(b);
      await route(r, 'O>M');
    });
    await beat(r, sc, 2, function () { return route(r, 'O>E1'); });
    await beat(r, sc, 3, function () { return route(r, 'E1>G'); }, { chips: ['zone', 'read'] });
    await beat(r, sc, 4, async function () {
      drop(dots);
      await Promise.all([route(r, 'G>F'), readFiles(r, b, sc.files)]);
      dots = thinking(b);
    });
    await beat(r, sc, 5, async function () { demote(); mark('E1', 'is-on'); await sleep(r, 800); }, { hold: 400 });
    await beat(r, sc, 6, async function () {
      await route(r, 'E1>O');
      drop(dots);
      await Promise.all([route(r, 'O>H'), sourcedAnswer(r, b, sc.ans)]);
    }, { hold: 900 });
  };

  SC.write = async function (r) {
    var sc = S.write, b, dots, card;
    await beat(r, sc, 0, async function () { await typeQuestion(r, sc.q); await route(r, 'H>O'); }, { chips: ['local'] });
    await beat(r, sc, 1, async function () { b = botMsg(); dots = thinking(b); await route(r, 'O>M'); });
    await beat(r, sc, 2, function () { return route(r, 'O>E2'); });
    await beat(r, sc, 3, function () { return route(r, 'E2>G'); }, { chips: ['zone'] });
    await beat(r, sc, 4, async function () {
      await route(r, 'G>E2'); await route(r, 'E2>O');
      drop(dots);
      he('p', null, sc.intro, b);
      await Promise.all([route(r, 'O>H'), diffCard(r, b, sc).then(function (d) { card = d; })]);
    }, { chips: ['write'], hold: 500 });
    demote(); mark('H', 'is-on');
    caption(6, sc.cap.length, sc.cap[5]);
    var choice = await confirmWait(r);
    await sleep(r, 250);
    if (choice === 'confirm') {
      await beat(r, sc, 6, async function () {
        card.classList.add('is-written');
        await route(r, 'H>O'); await route(r, 'O>E2', 420); await route(r, 'E2>G', 420); await route(r, 'G>F', 420);
        outcome(b, true, sc.done, sc.file);
      }, { hold: 900 });
    } else {
      await beat(r, sc, 6, async function () {
        card.classList.add('is-void');
        await route(r, 'H>O', 420);
        outcome(b, false, sc.cancelled);
      }, { text: sc.capCancel, hold: 900 });
    }
  };

  SC.deny = async function (r) {
    var sc = S.deny, b, dots;
    await beat(r, sc, 0, async function () { await typeQuestion(r, sc.q); await route(r, 'H>O'); }, { chips: ['local'] });
    await beat(r, sc, 1, async function () { b = botMsg(); dots = thinking(b); await route(r, 'O>E2'); });
    await beat(r, sc, 2, function () { return route(r, 'E2>G'); }, { chips: ['zone'], warn: ['zone'] });
    await beat(r, sc, 3, async function () {
      demote(); mark('G', 'is-err');
      drop(dots);
      var d = denyCard(b, sc);
      d.classList.add('is-shake');
      await sleep(r, 600);
    }, { hold: 1100 });
    await beat(r, sc, 4, async function () {
      await route(r, 'G>E2', 420); await route(r, 'E2>O', 420);
      var p = he('p', 'ol-a', null, b), span = he('span', 'ol-at', null, p);
      await Promise.all([route(r, 'O>H', 420), stream(r, span, sc.answer)]);
      note(U.bot + ' : ' + sc.answer);
    }, { hold: 900 });
  };

  SC.bench = async function (r) {
    var sc = S.bench;
    await beat(r, sc, 0, async function () { demote(); mark('O', 'is-on'); show('trig'); await sleep(r, 500); });
    await beat(r, sc, 1, async function () {
      show('tests');
      var shown = 0;
      await Promise.all([
        route(r, 'O>E1+O>E2+O>E3', 600),
        tween(r, 2600, function (t) {
          var cols = Math.round(t * COLS);
          if (cols !== shown) { shown = cols; drawWall(cols); setCount(cols * ROWS); }
        })
      ]);
    }, { hold: 700 });
    await beat(r, sc, 2, async function () {
      show('deleg');
      demote();
      await Promise.all(['E1', 'E2', 'E3'].map(async function (id, i) {
        await sleep(r, i * 600);
        drows[id].classList.add('is-run');
        link('O', id).classList.add('is-on');
        mark('O', 'is-on'); mark(id, 'is-on');
        await hop(r, 'O', id, 520);
        await sleep(r, 450);
        drows[id].classList.remove('is-run');
        drows[id].classList.add('is-done');
      }));
    }, { hold: 700 });
    await beat(r, sc, 3, async function () { demote(); mark('O', 'is-on'); show('ctx'); await sleep(r, 1400); });
    await beat(r, sc, 4, async function () { show('verdict'); await sleep(r, 600); }, { hold: 1200 });
  };

  /* ---------- initialisation, lecture ---------- */
  function reset(kind) {
    if (abortHook) { var h = abortHook; abortHook = null; h(); }
    chat.textContent = ''; journal.textContent = ''; typed.textContent = '';
    win.classList.remove('is-confirm', 'is-typing', 'is-bench');
    actions.hidden = true; autoBar.style.width = '0';
    wtitle.textContent = U.win;
    Object.keys(rows).forEach(function (k) { rows[k].classList.remove('is-in'); });
    Object.keys(drows).forEach(function (k) { drows[k].classList.remove('is-run', 'is-done'); });
    drawWall(0); setCount(0);
    chips.forEach(function (c) { c.classList.remove('is-on', 'is-warn'); });
    Object.keys(nodes).forEach(function (k) { nodes[k].classList.remove('is-on', 'is-done', 'is-err'); });
    Object.keys(links).forEach(function (k) { links[k].classList.remove('is-on', 'is-done'); });
    all('.ol-pk').forEach(drop);
    caption(0, 0, '');
    if (kind === 'bench') { win.classList.add('is-bench'); wtitle.textContent = U.benchTitle; }
    else botMsg(U.welcome);
  }

  function play(kind) {
    var id = ++RUN, r = { id: id };
    started = true;
    reset(kind);
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-run') === kind ? 'true' : 'false');
      b.classList.remove('is-next');
    });
    SC[kind](r).then(function () {
      if (id !== RUN) return;
      buttons[(ORDER.indexOf(kind) + 1) % buttons.length].classList.add('is-next');
    }).catch(function (e) {
      if (e !== CANCEL) setTimeout(function () { throw e; });
    });
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { play(b.getAttribute('data-run')); });
  });

  reset('idle');
  caption(0, 0, U.idle);
  if (reduced() || !('IntersectionObserver' in window)) {
    play('ask');
    // Les polices web arrivent après le premier rendu : on recale la fin de la discussion.
    window.addEventListener('load', scrollDown);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scrollDown);
  } else {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      setTimeout(function () { if (!started) play('ask'); }, 600);
    }, { threshold: 0.35 });
    io.observe($('.ol-stage'));
  }
})();
