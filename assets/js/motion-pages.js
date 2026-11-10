(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = !html.classList.contains('motion');
  var reveal = Array.prototype.slice.call(document.querySelectorAll(
    '.journey-row[data-journey-step], .skill-group[data-skill-card], .skill-explorer'
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

  var filterBar = document.querySelector('[data-skill-filters]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-skill-card]'));
  var count = document.querySelector('[data-skill-count]');
  if (filterBar && cards.length) {
    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('[data-skill-filter]'));
    var label = count ? count.getAttribute('data-label') : '';
    function updateCount(visible) {
      if (count) count.textContent = visible + ' / ' + cards.length + ' ' + label;
    }
    updateCount(cards.length);
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var selected = button.getAttribute('data-skill-filter');
        buttons.forEach(function (item) {
          var active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        var visible = 0;
        cards.forEach(function (card) {
          var show = selected === 'all' || card.getAttribute('data-skill-card') === selected;
          card.hidden = !show;
          if (show) {
            visible += 1;
            card.classList.add('is-revealed');
            if (!reduce) {
              card.classList.add('is-entering');
              window.setTimeout(function () { card.classList.remove('is-entering'); }, 500);
            } else {
              card.classList.add('is-revealed');
            }
          }
        });
        updateCount(visible);
      });
    });
  }

  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.skill-group').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', ((event.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--pointer-y', ((event.clientY - rect.top) / rect.height * 100) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.style.removeProperty('--pointer-x');
        card.style.removeProperty('--pointer-y');
      });
    });
  }

  html.classList.add('motion-pages-ready');
})();
