(function () {
  'use strict';
  var html = document.documentElement;
  var intro = document.querySelector('[data-cinematic-intro]');
  if (!intro || !html.classList.contains('intro-on')) return;

  var button = intro.querySelector('[data-skip-intro]');
  var canvas = intro.querySelector('.cinematic-canvas');
  var steps = intro.querySelectorAll('.cinematic-step');
  var context, frame = 0, watchdog = 0, finished = false;
  var width = 0, height = 0, centerX = 0, centerY = 0, scale = 0, yaw = 0;
  var motionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  function remember() {
    try { window.sessionStorage.setItem('ar-intro-seen', '1'); }
    catch (error) { console.warn('Impossible de mémoriser le passage de l’introduction.', error); }
  }
  function cleanup() {
    html.classList.remove('intro-on', 'intro-leaving');
    intro.hidden = true;
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  function finish(animate, shouldRemember) {
    if (finished) return;
    finished = true;
    if (frame && window.cancelAnimationFrame) window.cancelAnimationFrame(frame);
    window.clearTimeout(watchdog);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('wheel', onScrollIntent);
    window.removeEventListener('touchmove', onScrollIntent);
    window.removeEventListener('keydown', onKey, true);
    document.removeEventListener('visibilitychange', onVisibility);
    if (motionQuery && motionQuery.removeEventListener) motionQuery.removeEventListener('change', onMotionChange);
    if (shouldRemember !== false) remember();
    if (animate) {
      html.classList.add('intro-leaving');
      intro.classList.add('is-leaving');
      window.setTimeout(cleanup, 560);
    } else {
      cleanup();
    }
  }
  function onSkip(event) {
    event.stopPropagation();
    finish(true);
  }
  function onScrollIntent() { finish(false); }
  function onKey(event) {
    if (event.key === 'Escape' || event.key === 'Tab') finish(false);
  }
  function onVisibility() {
    if (document.hidden) finish(false, false);
  }
  function onMotionChange(event) {
    if (event.matches) finish(false, false);
  }
  function onResize() {
    try { resize(); }
    catch (error) {
      console.warn('L’animation d’introduction ne peut pas être redimensionnée.', error);
      finish(false);
    }
  }
  if (!button) {
    console.warn('Le bouton pour passer l’introduction est indisponible.');
    finish(false);
    return;
  }
  button.addEventListener('click', onSkip);
  window.addEventListener('wheel', onScrollIntent, { passive: true });
  window.addEventListener('touchmove', onScrollIntent, { passive: true });
  window.addEventListener('keydown', onKey, true);
  document.addEventListener('visibilitychange', onVisibility);
  if (motionQuery && motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);

  if (document.hidden || (motionQuery && motionQuery.matches)) {
    finish(false, false);
    return;
  }
  try {
    context = canvas && canvas.getContext && canvas.getContext('2d');
  } catch (error) {
    console.warn('Le dessin de l’animation d’introduction est indisponible.', error);
    finish(false);
    return;
  }
  if (!context || !window.requestAnimationFrame) {
    console.warn('Le dessin de l’animation d’introduction est indisponible.');
    finish(false);
    return;
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    var dpr = Math.max(.65, Math.min(window.devicePixelRatio || 1, 1.5, 1920 / width, 1200 / height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    centerX = width <= 720 ? width * .5 : width * .71;
    centerY = width <= 720 ? height * .47 : height * .63;
  }
  function project(point) {
    var cos = Math.cos(yaw), sin = Math.sin(yaw);
    var x = point[0] * cos - point[1] * sin;
    var y = point[0] * sin + point[1] * cos;
    var perspective = 1 / (1 + y * .1 - point[2] * .025);
    return [centerX + x * scale * perspective, centerY + (y * .5 - point[2] * .86) * scale * perspective];
  }
  function path(points, close) {
    context.beginPath();
    points.forEach(function (point, index) {
      var p = project(point);
      if (index) context.lineTo(p[0], p[1]); else context.moveTo(p[0], p[1]);
    });
    if (close) context.closePath();
  }
  function line(points, color, lineWidth, close) {
    path(points, close);
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.stroke();
  }
  function polygon(points, fill, stroke) {
    path(points, true);
    if (fill) { context.fillStyle = fill; context.fill(); }
    if (stroke) { context.strokeStyle = stroke; context.lineWidth = 1; context.stroke(); }
  }
  function square(size, z) {
    return [[-size, -size, z], [size, -size, z], [size, size, z], [-size, size, z]];
  }
  function dot(point, radius, color) {
    var p = project(point);
    context.beginPath();
    context.arc(p[0], p[1], radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
  }
  function along(points, value) {
    var position = value * (points.length - 1);
    var index = Math.min(points.length - 2, Math.floor(position));
    var fraction = position - index;
    return points[index].map(function (part, axis) {
      return part + (points[index + 1][axis] - part) * fraction;
    });
  }
  function drawBoard(seconds) {
    var top = square(.94, 0), bottom = square(.94, -.1);
    for (var edge = 0; edge < 4; edge++) {
      var next = (edge + 1) % 4;
      polygon([top[edge], top[next], bottom[next], bottom[edge]], 'rgba(7, 27, 35, .9)', 'rgba(74, 194, 198, .32)');
    }
    polygon(top, 'rgba(10, 39, 48, .9)', 'rgba(97, 234, 224, .72)');
    line(square(.86, .006), 'rgba(75, 181, 188, .34)', 1, true);
    for (var side = 0; side < 4; side++) {
      var sign = side % 2 ? -1 : 1;
      for (var i = 0; i < 6; i++) {
        var offset = (i - 2.5) * .15;
        var track = side < 2 ?
          [[sign * .85, offset, .014], [sign * .68, offset, .014], [sign * .53, offset * .7, .014], [sign * .34, offset * .7, .014]] :
          [[offset, sign * .85, .014], [offset, sign * .68, .014], [offset * .7, sign * .53, .014], [offset * .7, sign * .34, .014]];
        line(track, 'rgba(92, 207, 204, .36)', .8);
        dot(track[0], 1.4, 'rgba(118, 230, 219, .7)');
        var pulse = (seconds * .36 + i * .15 + side * .19) % 1;
        dot(along(track, pulse), i % 3 === 0 ? 2 : 1.4, i % 3 === 0 ? '#ffd18a' : '#a9fff1');
      }
    }
    polygon(square(.35, .025), 'rgba(5, 23, 31, .95)', 'rgba(95, 220, 216, .65)');
    var chipTop = square(.27, .105), chipBottom = square(.27, .025);
    for (var n = 0; n < 4; n++) {
      var after = (n + 1) % 4;
      polygon([chipTop[n], chipTop[after], chipBottom[after], chipBottom[n]], 'rgba(11, 48, 56, .95)', 'rgba(102, 213, 208, .45)');
    }
    polygon(chipTop, 'rgba(12, 57, 63, .98)', 'rgba(157, 255, 239, .8)');
    line(square(.2, .11), 'rgba(255, 194, 108, .7)', 1, true);
    dot([0, 0, .12], 3, '#ffe2ab');
  }
  function drawSphere(seconds) {
    var base = project([0, 0, .12]), beamEnd = project([0, 0, .82]);
    var beam = context.createLinearGradient(base[0], base[1], beamEnd[0], beamEnd[1]);
    beam.addColorStop(0, 'rgba(255, 193, 103, .66)');
    beam.addColorStop(1, 'rgba(104, 248, 231, .04)');
    context.beginPath();
    context.moveTo(base[0], base[1]);
    context.lineTo(beamEnd[0], beamEnd[1]);
    context.strokeStyle = beam;
    context.lineWidth = Math.max(2, scale * .025);
    context.stroke();

    var center = project([0, 0, 1.16]);
    var glow = context.createRadialGradient(center[0], center[1], 0, center[0], center[1], scale * .7);
    glow.addColorStop(0, 'rgba(29, 152, 156, .2)');
    glow.addColorStop(.58, 'rgba(29, 152, 156, .07)');
    glow.addColorStop(1, 'rgba(29, 152, 156, 0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(center[0], center[1], scale * .7, 0, Math.PI * 2);
    context.fill();

    var radius = .49, z = 1.16, points, angle, latitude, longitude;
    for (latitude = -2; latitude <= 2; latitude++) {
      points = [];
      var lat = latitude * Math.PI / 6;
      for (var j = 0; j <= 48; j++) {
        angle = j * Math.PI * 2 / 48;
        points.push([radius * Math.cos(lat) * Math.cos(angle), radius * Math.cos(lat) * Math.sin(angle), z + radius * Math.sin(lat)]);
      }
      line(points, 'rgba(93, 219, 217, .29)', .85);
    }
    for (longitude = 0; longitude < 6; longitude++) {
      points = [];
      var lon = longitude * Math.PI / 6;
      for (var k = 0; k <= 48; k++) {
        angle = k * Math.PI * 2 / 48;
        points.push([radius * Math.cos(angle) * Math.cos(lon), radius * Math.cos(angle) * Math.sin(lon), z + radius * Math.sin(angle)]);
      }
      line(points, 'rgba(91, 205, 211, .25)', .8);
    }
    var nodes = [];
    for (var n = 0; n < 28; n++) {
      var vertical = 1 - 2 * (n + .5) / 28;
      var around = n * 2.39996 + seconds * .18;
      var ring = Math.sqrt(1 - vertical * vertical);
      nodes.push([radius * ring * Math.cos(around), radius * ring * Math.sin(around), z + radius * vertical]);
    }
    for (var m = 0; m < 14; m++) {
      line([nodes[m], nodes[(m * 5 + 9) % nodes.length]], 'rgba(128, 242, 228, .13)', .75);
    }
    nodes.forEach(function (node, index) {
      dot(node, index % 7 === 0 ? 2.3 : 1.35, index % 7 === 0 ? '#ffe2ad' : '#a6f9ed');
    });
    points = [];
    for (var p = 0; p <= 64; p++) {
      angle = p * Math.PI * 2 / 64;
      points.push([.63 * Math.cos(angle), .63 * Math.sin(angle), z + .12 * Math.sin(angle * 2)]);
    }
    line(points, 'rgba(255, 193, 104, .35)', .9);
    dot(along(points, (seconds * .12) % 1), 2.6, '#ffd79c');
    var core = context.createRadialGradient(center[0], center[1], 0, center[0], center[1], scale * .18);
    core.addColorStop(0, 'rgba(255, 232, 173, .9)');
    core.addColorStop(.2, 'rgba(255, 194, 105, .45)');
    core.addColorStop(1, 'rgba(255, 194, 105, 0)');
    context.fillStyle = core;
    context.beginPath();
    context.arc(center[0], center[1], scale * .18, 0, Math.PI * 2);
    context.fill();
  }
  function draw(now, start) {
    var elapsed = Math.max(0, now - start);
    var seconds = elapsed / 1000;
    var ease = 1 - Math.pow(1 - Math.min(1, elapsed / 1600), 3);
    var mobile = width <= 720;
    scale = (mobile ? Math.min(width * .31, height * .2, 165) : Math.min(width * .22, height * .34, 330)) * (.84 + .16 * ease);
    yaw = .7 + .18 * ease;
    context.clearRect(0, 0, width, height);
    context.save();
    context.globalAlpha = Math.min(1, elapsed / 550);
    for (var i = 0; i < 34; i++) {
      var x = centerX + Math.sin(i * 73.17) * scale * 1.5;
      var y = centerY - scale * (.1 + (i * 37 % 100) / 55);
      context.fillStyle = 'rgba(139, 232, 226,' + (.15 + .18 * (1 + Math.sin(seconds + i)) / 2) + ')';
      context.fillRect(x, y, i % 8 === 0 ? 2 : 1, i % 8 === 0 ? 2 : 1);
    }
    drawBoard(seconds);
    context.globalAlpha *= Math.max(0, Math.min(1, (elapsed - 350) / 1100));
    drawSphere(seconds);
    context.restore();
    var active = elapsed < 1500 ? 0 : elapsed < 3000 ? 1 : 2;
    for (var s = 0; s < steps.length; s++) steps[s].classList.toggle('is-active', s === active);
    if (elapsed >= 4500) finish(true);
    else frame = window.requestAnimationFrame(function (time) { render(time, start); });
  }
  function render(now, start) {
    try { draw(now, start); }
    catch (error) {
      console.warn('L’animation d’introduction a été interrompue.', error);
      finish(false);
    }
  }
  try { resize(); }
  catch (error) {
    console.warn('L’animation d’introduction ne peut pas être initialisée.', error);
    finish(false);
    return;
  }
  window.addEventListener('resize', onResize);
  intro.classList.add('is-running');
  watchdog = window.setTimeout(function () {
    console.warn('L’animation d’introduction a dépassé son délai de sécurité.');
    finish(false);
  }, 5500);
  var start = window.performance.now();
  frame = window.requestAnimationFrame(function (time) { render(time, start); });
})();
