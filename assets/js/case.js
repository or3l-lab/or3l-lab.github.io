/* =====================================================================
   Études de cas : sommaire actif, schéma d'architecture qui se dessine,
   légère profondeur de l'écran du projet (son animation est dans figures.js).
   ===================================================================== */
(function () {
  'use strict';
  var AR = window.AR || {};
  var $ = AR.$ || function (s, r) { return (r || document).querySelector(s); };
  var $$ = AR.$$ || function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var gsap = window.gsap;
  var anim = !!(AR.hasGsap && !AR.reduce);

  /* ---------- Sommaire : section en cours et segments de progression, comme l'introduction ---------- */
  var tocLinks = $$('.case-toc a');
  var secs = $$('.case-section');
  var toc = $('.case-toc');
  if (tocLinks.length && secs.length) {
    var fills = [], label = null, percent = null;
    if (toc) {
      var track = document.createElement('div');
      track.className = 'case-track';
      track.setAttribute('aria-hidden', 'true');
      track.style.setProperty('--steps', secs.length);
      secs.forEach(function () {
        var seg = document.createElement('span'), fill = document.createElement('i');
        seg.appendChild(fill); track.appendChild(seg); fills.push(fill);
      });
      var head = document.createElement('p');
      head.className = 'case-track-label';
      head.setAttribute('aria-hidden', 'true');
      label = document.createElement('span'); percent = document.createElement('span');
      head.appendChild(label); head.appendChild(percent);
      var title = $('.case-toc-title', toc);
      var anchor = title ? title.nextSibling : toc.firstChild;
      toc.insertBefore(track, anchor);
      toc.insertBefore(head, anchor);
    }
    var nameOf = function (a) {
      var n = $('.toc-num', a), num = n ? n.textContent : '';
      return (num ? num + ' / ' : '') + a.textContent.slice(num.length).trim();
    };
    var ticking = false;
    var updateToc = function () {
      var line = window.innerHeight * 0.4, cur = null;
      secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s; });
      tocLinks.forEach(function (a) { a.classList.toggle('is-current', !!cur && a.hash === '#' + cur.id); });
      if (fills.length) {
        var done = 0;
        secs.forEach(function (s, i) {
          var r = s.getBoundingClientRect(), p = Math.max(0, Math.min(1, (line - r.top) / Math.max(1, r.height)));
          fills[i].style.transform = 'scaleX(' + p.toFixed(3) + ')';
          done += p;
        });
        var current = cur ? tocLinks.filter(function (a) { return a.hash === '#' + cur.id; })[0] : tocLinks[0];
        var text = current ? nameOf(current) : '';
        if (label.textContent !== text) label.textContent = text;
        percent.textContent = String(Math.round(done / secs.length * 100)).padStart(2, '0') + '%';
      }
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(updateToc); } }, { passive: true });
    window.addEventListener('resize', updateToc);
    updateToc();
  }

  if (!anim) return;

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
