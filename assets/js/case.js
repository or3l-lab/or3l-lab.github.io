/* =====================================================================
   Études de cas : sommaire actif, schéma d'architecture qui se dessine,
   visuel d'en-tête animé.
   ===================================================================== */
(function () {
  'use strict';
  var AR = window.AR || {};
  var $ = AR.$ || function (s, r) { return (r || document).querySelector(s); };
  var $$ = AR.$$ || function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var gsap = window.gsap;
  var anim = !!(AR.hasGsap && !AR.reduce);

  /* ---------- Sommaire : section en cours (dernière section passée sous les 40 % de l'écran) ---------- */
  var tocLinks = $$('.case-toc a');
  var secs = $$('.case-section');
  if (tocLinks.length && secs.length) {
    var ticking = false;
    var updateToc = function () {
      var line = window.innerHeight * 0.4, cur = null;
      secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s; });
      tocLinks.forEach(function (a) { a.classList.toggle('is-current', !!cur && a.hash === '#' + cur.id); });
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(updateToc); } }, { passive: true });
    window.addEventListener('resize', updateToc);
    updateToc();
  }

  if (!anim) return;

  /* ---------- Visuel d'en-tête : le pictogramme se trace ---------- */
  var visual = $('.case-visual .glyph');
  if (visual && window.DrawSVGPlugin) {
    var strokes = $$('.g-line, .g-accent', visual);
    gsap.from(strokes, { drawSVG: '0%', duration: 1.6, stagger: .04, ease: 'power2.inOut', delay: .2 });
    gsap.from($$('.g-dot', visual), { scale: 0, transformOrigin: '50% 50%', duration: .5, stagger: .1, delay: 1.2, ease: 'back.out(3)' });
  }
  /* ---------- Schéma d'architecture : nœuds puis flux ---------- */
  $$('.diagram').forEach(function (svg) {
    var nodes = $$('.dg-node', svg), edges = $$('.dg-edge', svg);
    var tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 78%', once: true } });
    tl.from(nodes, { opacity: 0, y: 14, duration: .55, stagger: .07, ease: 'power3.out' });
    if (window.DrawSVGPlugin) tl.from(edges, { drawSVG: '0%', duration: .7, stagger: .08, ease: 'power2.inOut' }, '-=.3');
    else tl.from(edges, { opacity: 0, duration: .5, stagger: .05 }, '-=.3');
  });

  /* ---------- Légère profondeur au défilement ---------- */
  var caseVisual = $('.case-visual');
  if (caseVisual) {
    gsap.to(caseVisual, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.case-hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
})();
