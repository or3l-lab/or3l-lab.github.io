(function () {
  'use strict';
  var AR = window.AR, gsap = window.gsap, ST = window.ScrollTrigger;
  var html = document.documentElement;
  var hero = document.querySelector('[data-cinematic-hero]');

  if (!AR || !AR.hasGsap || AR.reduce || !hero) {
    html.classList.add('motion-ready');
    return;
  }

  var title = hero.querySelector('.hero-role');
  var artwork = hero.querySelector('.vision-art');
  var copy = hero.querySelector('.hero-copy');
  var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.status-badge', { y: 18, opacity: 0, duration: .65 })
    .from(title, { y: 34, opacity: 0, duration: 1 }, .08)
    .from('.hero-lede', { y: 18, opacity: 0, duration: .7 }, .28)
    .from('.hero-ctas .btn', { y: 14, opacity: 0, duration: .55, stagger: .08 }, .46)
    .from('.hero-visual', { clipPath: 'inset(0 0 100% 0)', scale: .94, opacity: 0, duration: 1.1, ease: 'expo.out' }, .12);

  if (artwork && ST) {
    gsap.to(artwork, { yPercent: -7, scale: .95, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 } });
  }
  if (copy && ST) {
    gsap.to(copy, { y: -28, opacity: .7, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 } });
  }
  var orbitLine = document.querySelector('.orbit-line');
  if (orbitLine && window.DrawSVGPlugin) {
    gsap.fromTo(orbitLine, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, ease: 'power2.inOut',
      scrollTrigger: { trigger: '.landing-profile', start: 'top 75%', once: true } });
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  if (ST && cards.length) {
    gsap.set(cards, { y: 24, opacity: 0 });
    ST.batch(cards, { start: 'top 88%', once: true,
      onEnter: function (batch) {
        gsap.to(batch, { y: 0, opacity: 1, duration: .7, stagger: .08, ease: 'power3.out', overwrite: true });
      } });
  }
  if (AR.fine) {
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - .5;
        var y = (event.clientY - rect.top) / rect.height - .5;
        gsap.to(card, { rotateY: x * 2.5, rotateX: y * -2.5, duration: .35, overwrite: true });
      });
      card.addEventListener('pointerleave', function () {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: .55, ease: 'power3.out' });
      });
    });
  }

  html.classList.add('motion-ready');
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
