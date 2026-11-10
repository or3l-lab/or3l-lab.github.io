/* =====================================================================
   Démo « came électronique » : convoyeur (axe maître), tête d'application
   (axe esclave) et loi de came position maître → esclave.
   Simulation pédagogique, valeurs indicatives.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-demo="cam"]');
  if (!root) return;
  var T = JSON.parse(root.querySelector('.demo-i18n').textContent);
  var lang = document.documentElement.lang === 'en' ? 'en-GB' : 'fr-FR';
  var reduce = !document.documentElement.classList.contains('motion');
  var line = root.querySelector('.cam-line'), plot = root.querySelector('.cam-plot');
  var inRate = root.querySelector('[data-in="rate"]'), inPitch = root.querySelector('[data-in="pitch"]');
  var outRate = root.querySelector('[data-out="rate"]'), outPitch = root.querySelector('[data-out="pitch"]');
  var rCycle = root.querySelector('[data-read="cycle"]'), rSpeed = root.querySelector('[data-read="speed"]'), rSync = root.querySelector('[data-read="sync"]');
  var btn = root.querySelector('[data-act="toggle"]');
  var C = { signal: '#2de2e6', andon: '#ffb547', line: '#222c38', line2: '#2e3a48', dim: '#5f6d7e', muted: '#93a1b3', text: '#e8eef5', surface: '#161d26' };
  var SYNC = 0.35;          // part du cycle en zone synchrone
  var rate = 150, pitch = 250, theta = 0, playing = !reduce, visible = true, last = 0, raf = 0;

  // Loi de came : zone synchrone (vitesse produit), puis retour lisse (Hermite cubique, vitesses raccordées)
  function slave(th) {
    var S = SYNC * pitch;
    if (th < SYNC) return th * pitch;
    var u = (th - SYNC) / (1 - SYNC), m = pitch * (1 - SYNC);
    var h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
    return h00 * S + h10 * m + h01 * 0 + h11 * m;
  }

  function fit(c) {
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = c.clientWidth, h = c.clientHeight;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  var L, P;
  function resize() { L = fit(line); P = fit(plot); draw(); }

  function drawLine() {
    var ctx = L.ctx, w = L.w, h = L.h, k = w / 1500, beltY = h - 46, xA = 560;
    ctx.clearRect(0, 0, w, h);
    // convoyeur
    ctx.fillStyle = C.surface; ctx.fillRect(0, beltY, w, 14);
    ctx.strokeStyle = C.line2; ctx.lineWidth = 1;
    var off = (theta * pitch) % 40;
    for (var x = -40; x < 1500; x += 40) { ctx.beginPath(); ctx.moveTo((x + off) * k, beltY); ctx.lineTo((x + off) * k + 8, beltY + 14); ctx.stroke(); }
    // packs (2 × 3 bouteilles vues de profil)
    var PW = 150;
    for (var n = -2; n < 1500 / pitch + 2; n++) {
      var cx = xA + theta * pitch + (n - Math.floor((xA + theta * pitch) / pitch)) * pitch;
      if (cx < -PW || cx > 1500 + PW) continue;
      var px = (cx - PW / 2) * k, pw = PW * k;
      ctx.strokeStyle = C.dim; ctx.fillStyle = 'rgba(147,161,179,.08)';
      for (var b = 0; b < 3; b++) { var bx = px + b * pw / 3 + 2; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, beltY - 48, pw / 3 - 4, 48, 4) : ctx.rect(bx, beltY - 48, pw / 3 - 4, 48); ctx.fill(); ctx.stroke(); }
      if (cx >= xA + SYNC * pitch - 0.5) {   // poignée posée
        ctx.strokeStyle = C.andon; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(px + pw * .2, beltY - 50); ctx.quadraticCurveTo(px + pw / 2, beltY - 74, px + pw * .8, beltY - 50); ctx.stroke();
        ctx.lineWidth = 1;
      }
    }
    // tête d'application (axe esclave)
    var hx = (xA + slave(theta)) * k, down = theta < SYNC;
    ctx.strokeStyle = down ? C.signal : C.muted; ctx.fillStyle = down ? 'rgba(45,226,230,.18)' : 'rgba(147,161,179,.1)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(hx, 14); ctx.lineTo(hx, down ? beltY - 76 : beltY - 96); ctx.stroke();
    ctx.beginPath(); ctx.rect(hx - 26, down ? beltY - 84 : beltY - 104, 52, 10); ctx.fill(); ctx.stroke();
    // bobine de bande (déroulement)
    ctx.beginPath(); ctx.arc(hx - 46, 34, 16, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx - 46, 34); var a = theta * Math.PI * 6; ctx.lineTo(hx - 46 + Math.cos(a) * 14, 34 + Math.sin(a) * 14); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.fillStyle = C.muted; ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText(T.slave, Math.min(w - 120, hx + 32), 30);
    ctx.fillText(T.master + ' →', 12, h - 12);
  }

  function drawPlot() {
    var ctx = P.ctx, w = P.w, h = P.h, l = 46, r = 14, t = 16, b = 34, gw = w - l - r, gh = h - t - b;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(45,226,230,.07)'; ctx.fillRect(l, t, gw * SYNC, gh);
    ctx.strokeStyle = C.line; ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) { var gx = l + gw * i / 4; ctx.beginPath(); ctx.moveTo(gx, t); ctx.lineTo(gx, t + gh); ctx.stroke(); }
    ctx.strokeStyle = C.line2; ctx.beginPath(); ctx.moveTo(l, t); ctx.lineTo(l, t + gh); ctx.lineTo(l + gw, t + gh); ctx.stroke();
    var max = 0, min = 0, s, th;
    for (th = 0; th <= 1; th += .005) { s = slave(th); if (s > max) max = s; if (s < min) min = s; }
    var Y = function (v) { return t + gh - (v - min) / (max - min || 1) * gh; };
    ctx.strokeStyle = C.signal; ctx.lineWidth = 2; ctx.beginPath();
    for (th = 0; th <= 1.0001; th += .005) { var px = l + gw * th, py = Y(slave(Math.min(th, .9999))); if (th === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.stroke();
    var cx = l + gw * theta, cy = Y(slave(theta));
    ctx.strokeStyle = 'rgba(255,181,71,.5)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx, t); ctx.lineTo(cx, t + gh); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.andon; ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.dim; ctx.font = '500 10.5px "JetBrains Mono", monospace';
    ['0°', '90°', '180°', '270°', '360°'].forEach(function (lab, i) { ctx.fillText(lab, l + gw * i / 4 - (i === 4 ? 26 : 6), h - 14); });
    ctx.fillStyle = C.signal; ctx.fillText(T.sync, l + 6, t + 14);
    ctx.save(); ctx.translate(14, t + gh / 2 + 34); ctx.rotate(-Math.PI / 2); ctx.fillStyle = C.muted; ctx.fillText(T.slave, 0, 0); ctx.restore();
  }

  function draw() { if (L && P) { drawLine(); drawPlot(); } }

  function fmt(n, d) { return n.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function readouts() {
    rate = +inRate.value; pitch = +inPitch.value;
    outRate.textContent = rate; outPitch.textContent = pitch;
    rCycle.textContent = fmt(60000 / rate, 0) + ' ms';
    rSpeed.textContent = fmt(pitch * rate / 1000, 1) + ' m/min';
    rSync.textContent = fmt(SYNC * 60000 / rate, 0) + ' ms';
    draw();
  }

  function loop(now) {
    raf = 0;
    if (!playing || !visible) return;
    var dt = last ? Math.min(.05, (now - last) / 1000) : 0;
    last = now;
    theta = (theta + dt * rate / 60) % 1;
    draw();
    raf = requestAnimationFrame(loop);
  }
  function play() { if (!raf && playing && visible) { last = 0; raf = requestAnimationFrame(loop); } }
  function setBtn() { btn.textContent = playing ? T.pause : T.play; btn.setAttribute('aria-pressed', playing ? 'false' : 'true'); }

  inRate.addEventListener('input', readouts);
  inPitch.addEventListener('input', readouts);
  btn.addEventListener('click', function () { playing = !playing; setBtn(); play(); });
  window.addEventListener('resize', resize);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; play(); }).observe(root);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  if (reduce) theta = 0.2;
  resize(); readouts(); setBtn(); play();
})();
