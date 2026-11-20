(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = !html.classList.contains('motion');
  var reveal = Array.prototype.slice.call(document.querySelectorAll(
    '.journey-row[data-journey-step], .skill-group, .skill-explorer'
  ));

  if ('IntersectionObserver' in window && !reduce) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    reveal.forEach(function (item) { revealObserver.observe(item); });
  } else {
    reveal.forEach(function (item) { item.classList.add('is-revealed'); });
  }

  var steps = Array.prototype.slice.call(document.querySelectorAll('[data-journey-step]'));
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-journey-link]'));
  function setCurrent(step) {
    var index = step.getAttribute('data-journey-step');
    steps.forEach(function (item) {
      item.classList.toggle('is-current', item === step);
    });
    links.forEach(function (link) {
      var active = link.getAttribute('data-journey-link') === index;
      link.classList.toggle('is-current', active);
      if (active) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }
  if (steps.length) setCurrent(steps[0]);
  if (steps.length && 'IntersectionObserver' in window && !reduce) {
    var journeyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target);
      });
    }, { threshold: 0, rootMargin: '-42% 0px -48% 0px' });
    steps.forEach(function (step) { journeyObserver.observe(step); });
  }

  html.classList.add('motion-pages-ready');
})();