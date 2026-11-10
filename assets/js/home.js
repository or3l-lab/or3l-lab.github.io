/* =====================================================================
   Accueil : intro, hero (canvas « champ de signaux »), manifeste,
   parcours (frise épinglée + carte), pyramide de compétences,
   filtres de projets (Flip), convoyeur de la méthode.
   ===================================================================== */
(function () {
  'use strict';
  var AR = window.AR || {};
  var $ = AR.$ || function (s, r) { return (r || document).querySelector(s); };
  var $$ = AR.$$ || function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var anim = !!(AR.hasGsap && !AR.reduce);

  /* ---------- Canvas du hero : traces de signaux réagissant à la souris ---------- */
  (function heroCanvas() {
    var c = $('.hero-canvas'), hero = $('.hero');
    if (!c || !c.getContext) return;
    var ctx = c.getContext('2d'), w = 0, h = 0, t = 0, raf = 0, visible = true;
    var mouse = { x: -9999, y: -9999 };
    var LINES = 9;
    function resize() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < LINES; i++) {
        var y0 = h * (0.16 + i * 0.085), amp = 5 + (i % 3) * 4, f = 0.0055 + i * 0.0006, sp = 0.55 + i * 0.07;
        ctx.beginPath();
        for (var x = 0; x <= w + 6; x += 6) {
          var dx = x - mouse.x, dy = y0 - mouse.y;
          var near = Math.exp(-(dx * dx + dy * dy) / 39200);
          var y = y0 + Math.sin(x * f + t * sp + i) * amp * (1 + near * 3.4) + Math.sin(x * f * 2.7 - t * sp * 1.3) * amp * 0.35;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        var accent = i === 3 ? 'rgba(45,226,230,.5)' : i === 6 ? 'rgba(255,181,71,.32)' : 'rgba(46,58,72,.6)';
        ctx.strokeStyle = accent;
        ctx.lineWidth = (i === 3 || i === 6) ? 1.3 : 1;
        ctx.stroke();
      }
    }
    function loop() { t += 0.016; draw(); raf = window.requestAnimationFrame(loop); }
    function start() { if (!raf && visible && !document.hidden && !AR.reduce) raf = window.requestAnimationFrame(loop); }
    function stop() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } }
    window.addEventListener('resize', resize);
    if (hero) {
      hero.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
      hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); else stop(); }).observe(c);
    }
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    resize();
    start();
  })();

  /* ---------- Rôles du hero (s'arrête après trois tours) ---------- */
  function startRoles() {
    var roles = $$('.role');
    if (roles.length < 2 || AR.reduce) return;
    var i = 0, turns = 0;
    var timer = setInterval(function () {
      roles[i].classList.remove('is-active');
      i = (i + 1) % roles.length;
      var r = roles[i];
      r.classList.add('is-active');
      if (anim && window.ScrambleTextPlugin) {
        var txt = r.getAttribute('data-t') || r.textContent;
        r.setAttribute('data-t', txt);
        gsap.to(r, { duration: .8, scrambleText: { text: txt, chars: '01<>/#*', speed: .5 } });
      }
      if (i === 0 && ++turns >= 3) clearInterval(timer);
    }, 2800);
  }

  /* ---------- Entrée du hero ---------- */
  function buildHero() {
    if (!anim) return null;
    var tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
    var title = $('.hero-title');
    var chars = null;
    if (window.SplitText && title) chars = window.SplitText.create(title, { type: 'lines,chars', mask: 'lines' }).chars;
    tl.from('.status-badge', { y: 18, opacity: 0, duration: .8 })
      .from(chars || title, { yPercent: 115, duration: 1.15, stagger: .028 }, .1)
      .from('.hero-role', { y: 18, opacity: 0, duration: .8 }, .45)
      .from('.hero-lede', { y: 18, opacity: 0, duration: .8 }, .55)
      .from('.hero-ctas', { y: 18, opacity: 0, duration: .8 }, .65)
      .from('.hero-visual', { scale: .9, opacity: 0, duration: 1.5, ease: 'expo.out' }, .2)
      .from('.portrait-tag', { x: -12, opacity: 0, duration: .6, stagger: .12 }, .9)
      .from('.kpi', { y: 26, opacity: 0, duration: .8, stagger: .08 }, .75);
    return tl;
  }

  /* ---------- Intro (une fois par session) ---------- */
  var heroTl = buildHero();
  var intro = $('.intro');
  function markSeen() { try { window.sessionStorage.setItem('ar-intro-seen', '1'); } catch (e) {} }
  function afterIntro() {
    html.classList.remove('intro-on');
    markSeen();
    if (AR.lenis) AR.lenis.start();
    if (heroTl) heroTl.play();
    startRoles();
  }
  if (intro && html.classList.contains('intro-on') && anim && document.visibilityState !== 'hidden') {
    if (AR.lenis) AR.lenis.stop();
    var tl = gsap.timeline({ onComplete: afterIntro });
    tl.to($$('.intro-lines li', intro), { opacity: 1, x: 0, duration: .25, stagger: .2, ease: 'power2.out' })
      .to('.intro-bar span', { scaleX: 1, duration: 1.05, ease: 'power2.inOut' }, 0)
      .to('.intro-name', { opacity: 1, duration: .2 }, .85)
      .to('.intro-name', { duration: .7, scrambleText: { text: 'Or3L', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', speed: .7 } }, .85)
      .to(intro, { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'power4.inOut' }, '+=.2');
    var skip = function () { if (tl.progress() < 1) tl.progress(1); };
    $('.intro-skip', intro).addEventListener('click', skip);
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, skip, { once: true, passive: true }); });
    // Sécurité : l'intro ne bloque jamais la page plus de 5 secondes
    setTimeout(skip, 5000);
  } else {
    html.classList.remove('intro-on');
    if (heroTl) heroTl.play();
    startRoles();
  }
  html.classList.add('motion-ready');

  /* ---------- Manifeste : les mots s'allument au défilement ---------- */
  var manifesto = $('[data-manifesto]');
  if (manifesto && anim && window.SplitText) {
    var words = window.SplitText.create(manifesto, { type: 'words' }).words;
    gsap.fromTo(words, { color: '#34404e' }, { color: '#e8eef5', stagger: .12, ease: 'none',
      scrollTrigger: { trigger: manifesto, start: 'top 78%', end: 'bottom 42%', scrub: true } });
  }

  /* ---------- Parcours : frise horizontale épinglée + tracé sur la carte ---------- */
  var journey = $('.journey');
  if (journey) {
    var track = $('.journey-track', journey), viewport = $('.journey-viewport', journey);
    var cards = $$('.jcard', journey), route = $('.map-route', journey);
    var stops = {};
    $$('.map-stop', journey).forEach(function (s) { stops[s.getAttribute('data-stop')] = s; });
    var order = Object.keys(stops);
    var fractions = {};
    if (route && route.getTotalLength) {
      var len = route.getTotalLength();
      order.forEach(function (k) {
        var dot = $('.map-dot', stops[k]), cx = +dot.getAttribute('cx'), cy = +dot.getAttribute('cy'), best = 0, bestD = Infinity;
        for (var l = 0; l <= len; l += 2) {
          var p = route.getPointAtLength(l), d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
          if (d < bestD) { bestD = d; best = l; }
        }
        fractions[k] = len ? best / len * 100 : 100;
      });
    }
    var current = -1;
    function setActive(i) {
      if (i === current) return;
      current = i;
      cards.forEach(function (c, j) { c.classList.toggle('is-active', j === i); });
      var stop = cards[i].getAttribute('data-stop'), idx = order.indexOf(stop);
      order.forEach(function (k, j) {
        stops[k].classList.toggle('is-visited', j < idx);
        stops[k].classList.toggle('is-active', j === idx);
      });
      if (route && anim && window.DrawSVGPlugin) gsap.to(route, { drawSVG: '0% ' + (fractions[stop] || 0) + '%', duration: .7, ease: 'power2.out', overwrite: true });
    }
    if (!anim) {
      setActive(cards.length - 1);
    } else {
      if (window.DrawSVGPlugin && route) gsap.set(route, { drawSVG: '0% 0%' });
      gsap.from('.map-land', { opacity: 0, duration: 1.2, scrollTrigger: { trigger: journey, start: 'top 75%', once: true } });
      var mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (min-height: 640px)', function () {
        journey.classList.add('is-horizontal');
        var dist = function () { return Math.max(0, track.scrollWidth - viewport.clientWidth); };
        gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: $('.journey-stage', journey), start: 'top top', end: function () { return '+=' + dist(); },
            pin: true, scrub: .8, invalidateOnRefresh: true, refreshPriority: 1, anticipatePin: 1,
            onUpdate: function (self) { setActive(Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)))); } } });
        setActive(0);
        return function () { journey.classList.remove('is-horizontal'); gsap.set(track, { clearProps: 'x' }); current = -1; };
      });
      mm.add('(max-width: 1023px), (max-height: 639px)', function () {
        cards.forEach(function (c, i) {
          ST.create({ trigger: c, start: 'top 65%', end: 'bottom 35%', onToggle: function (self) { if (self.isActive) setActive(i); } });
        });
        gsap.from(cards, { y: 30, opacity: 0, duration: .8, stagger: .06, ease: 'power3.out', scrollTrigger: { trigger: track, start: 'top 85%', once: true } });
        setActive(0);
      });
    }
  }

  /* ---------- Pyramide de compétences (onglets accessibles) ---------- */
  var tabs = $$('.pyr-level');
  if (tabs.length) {
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var select = function (i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[j].classList.toggle('is-active', on);
      });
      if (focus) tabs[i].focus();
      if (anim) gsap.fromTo(panels[i], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, n = tabs.length, to = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') to = (i + 1) % n;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') to = (i - 1 + n) % n;
        else if (k === 'Home') to = 0;
        else if (k === 'End') to = n - 1;
        if (to !== null) { e.preventDefault(); select(to, true); }
      });
    });
    if (anim) {
      gsap.from(tabs.slice().reverse(), { y: 40, opacity: 0, scaleX: .7, duration: .8, stagger: .1, ease: 'power3.out',
        scrollTrigger: { trigger: '.pyramid', start: 'top 82%', once: true } });
    }
  }

  /* ---------- Projets : filtres animés (Flip), apparition, inclinaison ---------- */
  var projectCards = $$('.project-card');
  var filters = $$('.filter');
  var revealedAll = false;
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      filters.forEach(function (b) { var on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      if (anim && !revealedAll) { gsap.set(projectCards, { opacity: 1, y: 0 }); revealedAll = true; }
      var state = anim && window.Flip ? window.Flip.getState(projectCards) : null;
      projectCards.forEach(function (c) {
        var show = f === 'all' || (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1;
        c.style.display = show ? '' : 'none';
      });
      if (state) {
        window.Flip.from(state, { duration: .65, ease: 'power3.inOut', absolute: true, stagger: .03,
          onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: .5 }); },
          onLeave: function (els) { return gsap.to(els, { opacity: 0, scale: .92, duration: .35 }); },
          onComplete: function () { ST.refresh(); } });
      } else if (ST) { ST.refresh(); }
    });
  });
  if (anim && projectCards.length) {
    gsap.set(projectCards, { opacity: 0, y: 50 });
    ST.batch(projectCards, { start: 'top 90%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out' }); } });
  }
  if (anim && AR.fine) {
    $$('.card-link').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(card, { rotateY: x * 7, rotateX: -y * 7, duration: .5, ease: 'power2.out' });
      });
      card.addEventListener('pointerleave', function () { gsap.to(card, { rotateY: 0, rotateX: 0, duration: .8, ease: 'power3.out' }); });
    });
  }

  /* ---------- Méthode : le colis avance sur le convoyeur ---------- */
  var conveyor = $('.conveyor'), pack = $('.conveyor-pack'), stations = $$('.station');
  if (conveyor && stations.length) {
    if (!anim) {
      stations.forEach(function (s) { s.classList.add('is-on'); });
    } else {
      var belt = $('.conveyor-belt');
      gsap.to(pack, { x: function () { return belt.clientWidth - pack.offsetWidth; }, rotation: 180, ease: 'none',
        scrollTrigger: { trigger: conveyor, start: 'top 75%', end: 'bottom 50%', scrub: .6, invalidateOnRefresh: true,
          onUpdate: function (self) {
            var on = Math.ceil(self.progress * stations.length - .01);
            stations.forEach(function (s, i) { s.classList.toggle('is-on', i < on); });
          } } });
    }
  }

  if (ST) ST.refresh();
})();
