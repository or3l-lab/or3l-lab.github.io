/* =====================================================================
   Figures des pages internes et pictogrammes animés des projets :
   Trajectoire (Parcours), Pile (Compétences), Mur de supervision (Projets),
   écran du projet (études de cas) et cartes de projets (au survol).
   Les boucles ne tournent que si le mouvement est permis et la figure visible.
   ===================================================================== */
(function () {
  'use strict';
  var html = document.documentElement;
  var AR = window.AR || {};
  var gsap = window.gsap;
  var motion = html.classList.contains('motion');
  var anim = motion && !!gsap;
  var draw = anim && !!window.DrawSVGPlugin;

  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function goTo(selector) {
    var el = selector && document.querySelector(selector);
    if (!el) return;
    if (AR.scrollTo) AR.scrollTo(el);
    else el.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });
  }

  /* ---------- Visibilité ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { if (entry.target._figWatch) entry.target._figWatch(entry.isIntersecting); });
  }, { rootMargin: '80px 0px' }) : null;
  function watch(el, callback) {
    el._figWatch = callback;
    if (io) io.observe(el); else callback(true);
  }

  /* ---------- Pictogrammes : seul le suiveur de came demande du JavaScript (il suit la courbe) ---------- */
  var followers = [], ticking = false;
  function tick(now) {
    var active = false;
    followers.forEach(function (f) {
      if (!f.host.classList.contains('is-animating')) return;
      active = true;
      var p = f.path.getPointAtLength(f.len * ((now % 2600) / 2600));
      var x = p.x.toFixed(1), y = p.y.toFixed(1);
      f.dot.setAttribute('cx', x);
      f.dot.setAttribute('cy', y);
      f.guide.setAttribute('d', 'M' + x + ' ' + y + 'V132');
    });
    if (active) window.requestAnimationFrame(tick); else ticking = false;
  }
  function animate(host, on) {
    if (!motion) return;
    host.classList.toggle('is-animating', on);
    if (on && followers.length && !ticking) { ticking = true; window.requestAnimationFrame(tick); }
  }
  function register(host) {
    $$('.glyph', host).forEach(function (svg) {
      var path = svg.querySelector('.ga-profile'), dot = svg.querySelector('.ga-follower'), guide = svg.querySelector('.ga-guide');
      if (path && dot && guide && path.getTotalLength) followers.push({ host: host, path: path, dot: dot, guide: guide, len: path.getTotalLength() });
    });
  }
  function drawIn(svg, delay) {
    if (!draw) return;
    // Les tracés normalisés (pathLength) et les pointillés gardent leur propre animation : ils apparaissent en fondu.
    var all = $$('.g-line, .g-accent', svg);
    var strokes = all.filter(function (el) { return !el.hasAttribute('pathLength') && !el.classList.contains('g-dash'); });
    var others = all.filter(function (el) { return strokes.indexOf(el) < 0; });
    gsap.from(strokes, { drawSVG: '0%', duration: 1.3, stagger: .025, ease: 'power2.inOut', delay: delay || 0, clearProps: 'strokeDasharray,strokeDashoffset' });
    if (others.length) gsap.from(others, { opacity: 0, duration: .6, delay: (delay || 0) + .7, clearProps: 'opacity' });
  }

  /* Cartes de projets : le pictogramme s'anime au survol ou au focus clavier. */
  $$('.card-link, .feature-project').forEach(function (card) {
    if (!card.querySelector('.glyph')) return;
    register(card);
    var on = function () { animate(card, true); }, off = function () { animate(card, false); };
    card.addEventListener('pointerenter', on);
    card.addEventListener('pointerleave', off);
    card.addEventListener('focusin', on);
    card.addEventListener('focusout', off);
  });

  /* Écran du projet, en tête des études de cas. */
  $$('[data-case-screen]').forEach(function (screen) {
    register(screen);
    watch(screen, function (visible) {
      screen.classList.toggle('is-live', visible);
      animate(screen, visible);
    });
    var svg = screen.querySelector('.glyph');
    if (svg) drawIn(svg, .25);
  });

  /* ---------- Trajectoire ---------- */
  var journey = document.querySelector('[data-figure="journey"]');
  if (journey) {
    var stations = $$('.jr-st', journey), jPlates = $$('.fig-plate', journey);
    var focusStep = function (step) {
      journey.classList.toggle('has-focus', !!step);
      stations.concat(jPlates).forEach(function (el) { el.classList.toggle('is-focus', el.getAttribute('data-step') === step); });
    };
    stations.concat(jPlates).forEach(function (el) {
      el.addEventListener('pointerenter', function () { focusStep(el.getAttribute('data-step')); });
      el.addEventListener('pointerleave', function () { focusStep(null); });
      el.addEventListener('click', function () { goTo(el.getAttribute('data-fig-target')); });
    });
    watch(journey, function (visible) { journey.classList.toggle('is-live', visible); });
    if (anim) {
      // Première visite : la route se trace et chaque étape s'allume au passage du signal.
      journey.classList.add('is-arming');
      var route = journey.querySelector('.jr-route');
      var tl = gsap.timeline({ delay: .45, onComplete: function () { journey.classList.remove('is-arming'); journey.classList.add('is-ready'); } });
      tl.fromTo(route, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: 'none', clearProps: 'strokeDashoffset' }, 0);
      stations.slice().sort(function (a, b) { return a.getAttribute('data-step') - b.getAttribute('data-step'); }).forEach(function (st, i) {
        tl.add(function () {
          st.classList.add('is-on');
          jPlates.forEach(function (p) { if (p.getAttribute('data-step') === st.getAttribute('data-step')) p.classList.add('is-on'); });
        }, i * .8);
      });
    } else {
      journey.classList.add('is-ready');
    }
  }

  /* ---------- Pile ---------- */
  var stack = document.querySelector('[data-figure="stack"]');
  if (stack) {
    var layers = $$('.sk-layer', stack), sPlates = $$('.fig-plate', stack);
    var focusPole = function (pole) {
      stack.classList.toggle('has-focus', !!pole);
      layers.concat(sPlates).forEach(function (el) { el.classList.toggle('is-focus', el.getAttribute('data-pole') === pole); });
    };
    layers.concat(sPlates).forEach(function (el) {
      var pole = el.getAttribute('data-pole');
      el.addEventListener('pointerenter', function () { focusPole(pole); });
      el.addEventListener('pointerleave', function () { focusPole(null); });
      el.addEventListener('click', function () {
        document.dispatchEvent(new CustomEvent('skills:pole', { detail: { pole: pole, scroll: true } }));
      });
    });
    document.addEventListener('skills:active', function (event) {
      var pole = event.detail && event.detail.pole;
      layers.concat(sPlates).forEach(function (el) { el.classList.toggle('is-active', el.getAttribute('data-pole') === pole); });
    });
    watch(stack, function (visible) { stack.classList.toggle('is-live', visible); });
    if (motion) {
      // Les couches se posent une à une, du métier jusqu'à la décision.
      stack.classList.add('is-arming');
      window.setTimeout(function () {
        stack.classList.add('is-entering');
        stack.classList.remove('is-arming');
        window.setTimeout(function () { stack.classList.remove('is-entering'); }, 1600);
      }, 350);
    }
  }

  /* ---------- Mur de supervision ---------- */
  var wall = document.querySelector('[data-figure="wall"]');
  if (wall) {
    var screens = $$('.wall-screen', wall);
    var caption = wall.querySelector('.wall-caption');
    var capNum = wall.querySelector('.wall-caption-num'), capTitle = wall.querySelector('.wall-caption-title'), capKicker = wall.querySelector('.wall-caption-kicker');
    var current = -1, timer = 0, hovered = -1, focused = -1, live = false;
    screens.forEach(register);
    var show = function (i) {
      if (i === current) return;
      if (current >= 0) { screens[current].classList.remove('is-focus'); animate(screens[current], false); }
      current = i;
      var s = screens[i];
      s.classList.add('is-focus');
      if (live) animate(s, true);
      capNum.textContent = s.querySelector('.wall-num').textContent;
      capTitle.textContent = s.getAttribute('data-title');
      capKicker.textContent = s.getAttribute('data-kicker');
      if (anim) gsap.fromTo(caption, { opacity: .3, y: 5 }, { opacity: 1, y: 0, duration: .45, ease: 'power2.out', overwrite: true, clearProps: 'opacity,transform' });
    };
    // Le survol prime sur le focus clavier ; chacun ne libère que l'écran qu'il retenait.
    var held = function () { return hovered >= 0 ? hovered : focused; };
    var schedule = function () {
      window.clearTimeout(timer);
      if (!motion || held() >= 0 || !live) return;
      timer = window.setTimeout(function () { show((current + 1) % screens.length); schedule(); }, 2800);
    };
    var sync = function () {
      var i = held();
      if (i >= 0) { window.clearTimeout(timer); show(i); } else schedule();
    };
    screens.forEach(function (s, i) {
      s.addEventListener('pointerenter', function () { hovered = i; sync(); });
      s.addEventListener('pointerleave', function () { if (hovered === i) hovered = -1; sync(); });
      s.addEventListener('focus', function () { focused = i; sync(); });
      s.addEventListener('blur', function () { if (focused === i) focused = -1; sync(); });
    });
    // Survol d'un domaine dans la navigation de la page : ses écrans ressortent.
    $$('.project-group-nav a').forEach(function (a) {
      var group = a.hash.slice(1);
      a.addEventListener('pointerenter', function () {
        wall.classList.add('has-group');
        screens.forEach(function (s) { s.classList.toggle('in-group', s.getAttribute('data-group') === group); });
      });
      a.addEventListener('pointerleave', function () { wall.classList.remove('has-group'); });
    });
    show(0);
    watch(wall, function (visible) {
      live = visible;
      if (current >= 0) animate(screens[current], visible);
      if (visible) schedule(); else window.clearTimeout(timer);
    });
    if (anim) {
      // Mise sous tension : les écrans s'allument un à un, puis les pictogrammes se tracent.
      gsap.from(screens, { opacity: 0, scaleY: .05, duration: .45, stagger: .07, ease: 'power3.out', delay: .3, clearProps: 'opacity,transform' });
      screens.forEach(function (s, i) { drawIn(s.querySelector('.glyph'), .45 + i * .07); });
    }
  }
})();
