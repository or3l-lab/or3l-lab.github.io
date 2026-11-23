/* =====================================================================
   Articles : figure « du post à l'article » (page Articles), filtres et
   recherche du sommaire. Tout est facultatif : sans JavaScript ou avec les
   animations coupées, la page reste complète (figure à l'état final, liste
   entière visible, filtres masqués).
   ===================================================================== */
(function () {
  'use strict';
  var html = document.documentElement;
  var AR = window.AR || {};
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var $ = AR.$ || function (s, r) { return (r || document).querySelector(s); };
  var $$ = AR.$$ || function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var anim = html.classList.contains('motion') && !!gsap;

  /* ---------- Figure : un post court devient un article structuré ---------- */
  var fig = $('.fig-articles');
  if (fig && anim) {
    var all = $('.a-all', fig);
    var plates = $$('.fig-plate', fig);
    var card = $('.a-card-g', fig);
    var cardLines = $$('.a-card-g .aw', fig);
    var links = $$('.a-link', fig);
    var pulses = $$('.a-pulse', fig);
    var node = $('.a-node-g', fig);
    var sheet = $('.a-sheet', fig);
    var rail = $('.a-rail', fig);
    var lines = function (s) { return $$('.a-sheet-g .aw[data-s="' + s + '"]', fig); };
    var ticks = $$('.a-tick', fig);

    var tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: .5 });
    tl.set(all, { opacity: 1 }, 0)
      .set(plates, { opacity: 0 }, 0)
      .fromTo(card, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .6, ease: 'power2.out' }, .15)
      .fromTo(cardLines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .45, stagger: .12, ease: 'power1.out' }, .55)
      .to(plates[0], { opacity: 1, duration: .5 }, .6)
      .fromTo(links[0], { opacity: 0 }, { opacity: 1, duration: .4 }, 1.5)
      .fromTo(pulses[0], { strokeDashoffset: .09, opacity: 1 }, { strokeDashoffset: -1, duration: .9, ease: 'power1.inOut' }, 1.7)
      .set(pulses[0], { opacity: 0 }, 2.6)
      .fromTo(node, { opacity: 0, scale: .3, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .6, ease: 'back.out(2.2)' }, 2.5)
      .to(plates[1], { opacity: 1, duration: .5 }, 2.8)
      .fromTo(links[1], { opacity: 0 }, { opacity: 1, duration: .4 }, 3.4)
      .fromTo(pulses[1], { strokeDashoffset: .09, opacity: 1 }, { strokeDashoffset: -1, duration: .9, ease: 'power1.inOut' }, 3.6)
      .set(pulses[1], { opacity: 0 }, 4.5)
      .fromTo(sheet, { opacity: 0, scaleY: 0, transformOrigin: '50% 0%' }, { opacity: 1, scaleY: 1, duration: .8, ease: 'power3.out' }, 4.4)
      .to(plates[2], { opacity: 1, duration: .5 }, 4.9)
      .fromTo(lines(0), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .5, stagger: .14, ease: 'power1.out' }, 5.2)
      .fromTo(rail, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 3.6, ease: 'none' }, 5.9);
    ticks.forEach(function (tick, i) {
      var t = 6 + i * 1;
      tl.fromTo(tick, { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' }, t)
        .fromTo(tick, { fill: '#0b141c', stroke: 'rgba(143,238,240,.5)' }, { fill: '#2de2e6', stroke: '#2de2e6', duration: .35 }, t + .1)
        .fromTo(lines(i + 1), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .45, stagger: .12, ease: 'power1.out' }, t + .1);
    });
    tl.to([all].concat(plates), { opacity: 0, duration: .7, ease: 'power1.in' }, '+=2.6');

    if (ST) {
      ST.create({ trigger: fig, start: 'top 94%', end: 'bottom 6%', onToggle: function (self) { if (self.isActive) tl.play(); else tl.pause(); } });
    } else {
      tl.play();
    }
  }

  /* ---------- Sommaire : filtres par thème et recherche ---------- */
  var tools = $('.art-tools');
  var rows = $$('.art-row');
  if (tools && rows.length) {
    var buttons = $$('.art-filter', tools);
    var input = $('.art-search input', tools);
    var count = $('.art-count', tools);
    var empty = $('.art-empty');
    var years = $$('.art-year');
    var tag = '', query = '';
    var norm = function (s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); };

    var apply = function (animate) {
      var shown = [];
      rows.forEach(function (row) {
        var tags = ' ' + (row.getAttribute('data-tags') || '') + ' ';
        var hay = row.getAttribute('data-search') || '';
        var ok = (!tag || tags.indexOf(' ' + tag + ' ') > -1) && (!query || hay.indexOf(query) > -1);
        row.hidden = !ok;
        if (ok) shown.push(row);
      });
      years.forEach(function (y) { y.hidden = !$$('.art-row:not([hidden])', y).length; });
      if (empty) empty.hidden = shown.length > 0;
      if (count) {
        var n = shown.length;
        count.textContent = n + ' ' + count.getAttribute(n > 1 ? 'data-many' : 'data-one');
      }
      if (anim && animate && shown.length) {
        gsap.killTweensOf(shown);
        gsap.fromTo(shown, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power3.out', overwrite: true });
      }
      if (ST) ST.refresh();
    };

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tag = btn.getAttribute('data-tag') || '';
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply(true);
      });
    });
    if (input) {
      var timer = null;
      input.addEventListener('input', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { query = norm(input.value); apply(true); }, 140);
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && input.value) { input.value = ''; query = ''; apply(true); }
      });
    }
    tools.hidden = false;
    apply(false);
  }

  // Apparition des lignes au défilement ; un filtre les ramène à leur état normal (apply).
  if (anim && ST && rows.length) {
    gsap.set(rows, { opacity: 0, y: 26 });
    ST.batch(rows, { start: 'top 94%', once: true,
      onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: .8, stagger: .07, ease: 'power3.out', overwrite: true }); } });
  }
})();
