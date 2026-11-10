(function () {
  'use strict';
  var AR = window.AR || {};
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  var links = Array.prototype.slice.call(document.querySelectorAll('.project-group-nav a'));
  var groups = links.map(function (link) { return document.getElementById(link.hash.slice(1)); });
  var ticking = false;
  function updateNavigation() {
    var active = -1;
    groups.forEach(function (group, i) {
      if (group && group.getBoundingClientRect().top <= window.innerHeight * .4) active = i;
    });
    links.forEach(function (link, i) {
      link.classList.toggle('is-current', i === active);
      if (i === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    ticking = false;
  }
  if (links.length) {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateNavigation); }
    }, { passive: true });
    window.addEventListener('resize', updateNavigation);
    updateNavigation();
  }
  if (!AR.hasGsap || AR.reduce || !gsap || !ST) return;
  Array.prototype.forEach.call(document.querySelectorAll('[data-showcase]'), function (stage) {
    var frame = stage.querySelector('.showcase-frame');
    gsap.from(frame, {
      y: 38, scale: .97, rotationX: 4, transformPerspective: 1100, opacity: 0,
      duration: 1.05, ease: 'power3.out', clearProps: 'transform,opacity',
      scrollTrigger: { trigger: stage, start: 'top 88%', once: true }
    });
    gsap.fromTo(stage.querySelector('.showcase-progress span'), { scaleX: .04 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: stage, start: 'top 88%', end: 'bottom 28%', scrub: .5 }
    });
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
