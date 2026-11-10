/* =====================================================================
   Démo « DMAIC » : parcours animé Définir → Mesurer → Analyser → Améliorer
   → Maîtriser, indicateurs qui évoluent. Exemple illustratif, valeurs fictives.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-demo="dmaic"]');
  if (!root) return;
  var T = JSON.parse(root.querySelector('.demo-i18n').textContent);
  var reduce = !document.documentElement.classList.contains('motion');
  var tabs = Array.prototype.slice.call(root.querySelectorAll('.dmaic-tab'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('.dmaic-panel'));
  var bar = root.querySelector('.dmaic-progress i');
  var toggle = root.querySelector('[data-act="toggle"]');
  var next = root.querySelector('[data-act="next"]');
  var K = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-k]'), function (el) { K[el.getAttribute('data-k')] = el; });
  var DURATION = 5200;
  var current = 0, playing = !reduce, visible = false, timer = 0;

  function parse(s) {
    var m = String(s).match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/);
    return m ? { pre: m[1], n: parseFloat(m[2].replace(',', '.')), post: m[3] } : null;
  }
  function setKpis(improved) {
    Object.keys(K).forEach(function (k) {
      var el = K[k], target = parse((improved ? T.after : T.before)[k]), from = parse(el.textContent);
      el.classList.toggle('is-better', improved);
      if (!target) return;
      if (reduce || !from || from.n === target.n) { el.textContent = (improved ? T.after : T.before)[k]; return; }
      var t0 = performance.now();
      (function frame(now) {
        var p = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - p, 3);
        el.textContent = target.pre + Math.round(from.n + (target.n - from.n) * e) + target.post;
        if (p < 1) requestAnimationFrame(frame);
      })(t0);
    });
  }
  function restartBar() {
    if (!bar) return;
    bar.style.transition = 'none';
    bar.style.width = ((current + (playing ? 0 : 1)) / tabs.length * 100) + '%';
    if (!playing || reduce) return;
    void bar.offsetWidth;
    bar.style.transition = 'width ' + DURATION + 'ms linear';
    bar.style.width = ((current + 1) / tabs.length * 100) + '%';
  }
  function show(i, focus) {
    current = (i + tabs.length) % tabs.length;
    tabs.forEach(function (tab, j) {
      var on = j === current;
      tab.classList.toggle('is-active', on);
      tab.classList.toggle('is-done', j < current);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    });
    panels.forEach(function (panel, j) {
      panel.classList.toggle('is-active', j === current);
      panel.hidden = j !== current;
    });
    var phase = tabs[current].getAttribute('data-phase');
    root.setAttribute('data-phase', phase);
    setKpis(phase === 'i' || phase === 'c');
    restartBar();
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    timer = 0;
    if (playing && visible && !reduce && !document.hidden) timer = setTimeout(function () { show(current + 1); }, DURATION);
  }
  function setPlaying(on) {
    playing = on && !reduce;
    toggle.textContent = playing ? T.pause : T.play;
    toggle.setAttribute('aria-pressed', playing ? 'false' : 'true');
    restartBar();
    schedule();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { setPlaying(false); show(i); });
    tab.addEventListener('keydown', function (e) {
      var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (e.key === 'Home') d = -current;
      if (e.key === 'End') d = tabs.length - 1 - current;
      if (d === undefined) return;
      e.preventDefault();
      setPlaying(false);
      show(current + d, true);
    });
  });
  toggle.addEventListener('click', function () { setPlaying(!playing); });
  next.addEventListener('click', function () { setPlaying(false); show(current + 1); });
  if (reduce) toggle.hidden = true;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var was = visible;
      visible = en[0].isIntersecting;
      if (visible && !was) restartBar();
      schedule();
    }, { threshold: .35 }).observe(root);
  }
  document.addEventListener('visibilitychange', schedule);
  root.classList.add('is-ready');
  setPlaying(playing);
  show(0);
})();
