/* =====================================================================
   Démo « tableau de bord atelier » : états machines, risque d'arrêt à 7 jours
   et plan d'actions recalculé en continu. Données entièrement fictives.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-demo="hmi"]');
  if (!root) return;
  var T = JSON.parse(root.querySelector('.demo-i18n').textContent);
  var lang = document.documentElement.lang === 'en' ? 'en-GB' : 'fr-FR';
  var reduce = !document.documentElement.classList.contains('motion');
  var grid = root.querySelector('[data-grid]'), actions = root.querySelector('[data-actions]');
  var K = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-k]'), function (el) { K[el.getAttribute('data-k')] = el; });

  // Générateur pseudo-aléatoire déterministe : la même démo à chaque visite
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  var codes = ['PRS', 'INJ', 'USN', 'MNT', 'CND', 'TRS'];
  var machines = [];
  for (var i = 0; i < 24; i++) {
    var p = rnd(), state = p < .74 ? 'run' : p < .84 ? 'fault' : p < .92 ? 'pm' : 'stop';
    machines.push({ name: codes[i % codes.length] + '-' + String(101 + i), state: state, base: .02 + rnd() * .3 });
  }
  function risk(m) {
    if (m.state === 'stop') return 0;
    return Math.min(.9, m.base + (m.state === 'fault' ? .22 : 0) + (m.state === 'pm' ? .14 : 0));
  }
  function level(r) { return r >= .35 ? 'high' : r >= .2 ? 'mid' : 'low'; }

  var tiles = machines.map(function (m) {
    var li = document.createElement('li');
    li.className = 'hmi-tile';
    li.innerHTML = '<strong></strong><span class="st"></span><i class="risk" aria-hidden="true"></i>';
    grid.appendChild(li);
    return li;
  });

  function render() {
    var stops = 0, high = 0, highRun = 0, expected = 0, pmRisk = 0, faults = 0;
    machines.forEach(function (m, i) {
      var r = risk(m), li = tiles[i];
      li.className = 'hmi-tile s-' + m.state;
      li.querySelector('strong').textContent = m.name;
      li.querySelector('.st').textContent = T.states[m.state];
      li.querySelector('.risk').className = 'risk r-' + level(r);
      li.title = m.name + ' — ' + T.states[m.state] + (m.state === 'stop' ? '' : ' — ' + T.risk + ' ' + Math.round(r * 100) + ' %');
      if (m.state === 'stop') stops++;
      else {
        expected += r;
        if (r >= .35) high++;
        if (r >= .35 && m.state === 'run') highRun++;
        if (m.state === 'pm' && r >= .2) pmRisk++;
        if (m.state === 'fault') faults++;
      }
    });
    K.avail.textContent = (100 * (machines.length - stops) / machines.length).toLocaleString(lang, { maximumFractionDigits: 1 }) + ' %';
    K.stops.textContent = String(stops);
    K.high.textContent = String(high);
    K.expected.textContent = expected.toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    var list = [];
    if (stops) list.push(['now', T.act.stop.replace('{n}', stops)]);
    if (pmRisk) list.push(['week', T.act.pm.replace('{n}', pmRisk)]);
    if (highRun) list.push(['week', T.act.high.replace('{n}', highRun)]);
    if (faults) list.push(['week', T.act.fault.replace('{n}', faults)]);
    actions.innerHTML = '';
    if (!list.length) list.push(['week', T.none]);
    list.forEach(function (a) {
      var li = document.createElement('li');
      var u = document.createElement('span');
      u.className = 'urg urg-' + a[0];
      u.textContent = T.urg[a[0]];
      li.appendChild(u);
      li.appendChild(document.createTextNode(a[1]));
      actions.appendChild(li);
    });
  }

  var NEXT = { run: [['fault', .05], ['pm', .03]], fault: [['stop', .12], ['run', .18]], stop: [['run', .3]], pm: [['run', .22]] };
  function step() {
    machines.forEach(function (m) {
      var p = rnd(), acc = 0;
      (NEXT[m.state] || []).some(function (tr) { acc += tr[1]; if (p < acc) { m.state = tr[0]; return true; } return false; });
    });
    render();
  }

  var timer = 0, visible = false;
  function sync() {
    if (visible && !reduce && !document.hidden) { if (!timer) timer = setInterval(step, 1600); }
    else if (timer) { clearInterval(timer); timer = 0; }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; sync(); }).observe(root);
  }
  document.addEventListener('visibilitychange', sync);
  render();
})();
