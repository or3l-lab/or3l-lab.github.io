/* =====================================================================
   Animations et interactions communes à toutes les pages
   (défilement fluide, en-tête, menu, progression, HUD, curseur,
   boutons magnétiques, apparitions au défilement, compteurs).
   Tout reste lisible si JavaScript ou les animations sont désactivés.
   ===================================================================== */
(function () {
  'use strict';
  var html = document.documentElement;
  var reduce = !html.classList.contains('motion');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var hasGsap = !!(gsap && ST);

  if (hasGsap) {
    var plugins = [ST, window.SplitText, window.ScrambleTextPlugin, window.Flip, window.DrawSVGPlugin].filter(Boolean);
    gsap.registerPlugin.apply(gsap, plugins);
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  var headerH = function () { var h = $('.site-header'); return h ? h.offsetHeight : 0; };

  /* ---------- Défilement fluide (Lenis), synchronisé avec ScrollTrigger ---------- */
  var lenis = null;
  if (!reduce && window.Lenis && hasGsap) {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (target !== 0 && !target) return;
    var y = target === 0 ? 0 : target.getBoundingClientRect().top + window.pageYOffset - headerH() - 12;
    if (lenis) {
      lenis.scrollTo(window.pageYOffset, { immediate: true });
      lenis.scrollTo(y, { duration: 1.2 });
      return;
    }
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- Menu mobile ---------- */
  var toggle = $('.menu-toggle');
  function setMenu(open) {
    html.classList.toggle('menu-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (lenis) { if (open) { lenis.stop(); } else { lenis.start(); } }
    if (open) { var first = $('.main-nav a'); if (first) first.focus(); }
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(!html.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && html.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
    });
  }

  /* ---------- Liens d'ancre internes ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var url = new URL(a.href, window.location.href);
    if (url.pathname !== window.location.pathname || url.search !== window.location.search) return;
    var id = decodeURIComponent(url.hash.slice(1));
    var target = id === 'top' ? 0 : document.getElementById(id);
    if (target === null || target === undefined) return;
    e.preventDefault();
    setMenu(false);
    scrollToTarget(target);
    if (history.pushState) history.pushState(null, '', '#' + id);
    if (target && target !== 0) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
  });

  /* ---------- Transition entre pages du site ---------- */
  if (!reduce) {
    window.addEventListener('pageshow', function () { html.classList.remove('is-transitioning'); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
          a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
      var url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      e.preventDefault();
      html.classList.add('is-transitioning');
      window.setTimeout(function () { window.location.assign(url.href); }, 360);
    });
  }

  /* ---------- En-tête, barre de progression ---------- */
  var header = $('.site-header');
  var bar = $('.progress span');
  var lastY = window.pageYOffset;
  function onScroll() {
    var y = window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (header) {
      header.classList.toggle('is-scrolled', y > 24);
      var hide = y > 320 && y > lastY + 4 && !html.classList.contains('menu-open');
      if (hide) header.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 320) header.classList.remove('is-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- HUD de section et lien de navigation actif ---------- */
  var hudSections = $$('[data-hud]');
  var hud = $('.hud');
  if (hud && hudSections.length && 'IntersectionObserver' in window) {
    var total = $('.hud-total', hud), num = $('.hud-num', hud), label = $('.hud-label', hud);
    total.textContent = String(hudSections.length).padStart(2, '0');
    var navLinks = $$('.main-nav a');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = hudSections.indexOf(en.target);
        num.textContent = String(i + 1).padStart(2, '0');
        var txt = en.target.getAttribute('data-hud') || '';
        if (hasGsap && window.ScrambleTextPlugin && !reduce) {
          gsap.to(label, { duration: .6, overwrite: true, scrambleText: { text: txt, chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', speed: .6 } });
        } else { label.textContent = txt; }
        navLinks.forEach(function (l) {
          var on = en.target.id && l.hash === '#' + en.target.id && l.pathname === window.location.pathname;
          l.classList.toggle('is-current', !!on);
        });
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    hudSections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Curseur « réticule » (ordinateur uniquement) ---------- */
  var cursor = $('.cursor');
  if (cursor && fine && !reduce && hasGsap) {
    html.classList.add('has-cursor');
    var xTo = gsap.quickTo(cursor, 'x', { duration: .35, ease: 'power3' });
    var yTo = gsap.quickTo(cursor, 'y', { duration: .35, ease: 'power3' });
    window.addEventListener('pointermove', function (e) { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, input, [role="tab"]'));
    });
    document.addEventListener('pointerleave', function () { cursor.style.opacity = '0'; });
    document.addEventListener('pointerenter', function () { cursor.style.opacity = ''; });
  }

  /* ---------- Boutons magnétiques ---------- */
  if (fine && !reduce && hasGsap) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .4, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .4)' }); });
    });
  }

  /* ---------- Apparitions au défilement ---------- */
  function splitLines(el) {
    if (!window.SplitText) return null;
    return window.SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
  }

  function countUp(el, text) {
    var m = /^(\D*?)(\d+)(.*)$/.exec(text);
    if (!m) {
      if (window.ScrambleTextPlugin) gsap.from(el, { duration: 1.1, scrambleText: { text: text, chars: 'XO10', speed: .5 } });
      return;
    }
    var obj = { v: 0 }, end = parseInt(m[2], 10);
    gsap.to(obj, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: function () { el.textContent = m[1] + Math.round(obj.v) + m[3]; } });
  }

  if (hasGsap && !reduce) {
    // autoSplit : les lignes sont recalculées au chargement des polices et au redimensionnement
    $$('[data-reveal="lines"]').forEach(function (el) {
      if (!window.SplitText) return;
      window.SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
        onSplit: function (self) {
          return gsap.from(self.lines, { yPercent: 110, duration: 1.1, stagger: .09, ease: 'power4.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        } });
    });

    var fadeSel = ['.section-intro', '.pillar', '.sectors', '.pyr-panels', '.transverse', '.filters', '.station', '.post-card',
      '.journey-row', '.skill-group', '.reading-note', '.reading-outro',
      '.contact-text', '.contact-actions', '.contact-email', '.fact', '.case-pitch', '.case-hero .card-tags', '.case-meta > div', '.tldr li',
      '.case-section > :not(h2)', '.case-h2', '.case-nav-link', '.legal-section'].join(',');
    var fades = $$(fadeSel).filter(function (el) { return !el.closest('.hero') && !el.closest('[data-showcase]'); });
    if (fades.length) {
      gsap.set(fades, { opacity: 0, y: 34 });
      ST.batch(fades, { start: 'top 90%', once: true,
        onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .07, overwrite: true }); } });
    }

    $$('.kpi-value[data-count]').forEach(function (el) {
      ST.create({ trigger: el, start: 'top 95%', once: true, onEnter: function () { countUp(el, el.getAttribute('data-count')); } });
    });
    $$('[data-count-text]').forEach(function (el) {
      var t = el.textContent;
      ST.create({ trigger: el, start: 'top 92%', once: true, onEnter: function () { countUp(el, t); } });
    });
  }

  // Sur l'accueil, home.js signale lui-même la fin de préparation (après l'intro et le hero).
  if (document.body.getAttribute('data-page') !== 'home') html.classList.add('motion-ready');

  if (hasGsap && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ST.refresh(); });
  }

  window.AR = { reduce: reduce, fine: fine, hasGsap: hasGsap, lenis: lenis, scrollTo: scrollToTarget, splitLines: splitLines, $: $, $$: $$ };
})();
