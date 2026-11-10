(function () {
  'use strict';
  var root = document.querySelector('[data-demo="flow"]');
  if (!root) return;
  var T = JSON.parse(root.querySelector('.demo-i18n').textContent);
  var steps = Array.prototype.slice.call(root.querySelectorAll('.flow-step'));
  var text = root.querySelector('[data-flow-text]');
  var position = root.querySelector('[data-flow-position]');
  var toggle = root.querySelector('[data-flow-toggle]');
  var next = root.querySelector('[data-flow-next]');
  var reduce = !document.documentElement.classList.contains('motion');
  var current = 0, playing = !reduce, visible = false, timer = 0;
  function schedule() {
    clearTimeout(timer);
    if (playing && visible && !document.hidden) {
      timer = setTimeout(function () { show(current + 1); }, 3800);
    }
  }
  function show(index) {
    current = (index + steps.length) % steps.length;
    steps.forEach(function (step, i) {
      step.classList.toggle('is-current', i === current);
      step.classList.toggle('is-done', i < current);
      if (i === current) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    position.textContent = '0' + (current + 1) + ' / 04';
    text.textContent = T.steps[current][2];
    schedule();
  }
  function setPlaying(on) {
    playing = on;
    toggle.textContent = playing ? T.pause : T.play;
    toggle.setAttribute('aria-pressed', playing ? 'false' : 'true');
    schedule();
  }
  toggle.hidden = false;
  next.hidden = false;
  toggle.addEventListener('click', function () { setPlaying(!playing); });
  next.addEventListener('click', function () { setPlaying(false); show(current + 1); });
  root.addEventListener('focusin', function () { setPlaying(false); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      schedule();
    }, { threshold: .2 }).observe(root);
  }
  document.addEventListener('visibilitychange', schedule);
  setPlaying(playing);
  show(0);
})();
