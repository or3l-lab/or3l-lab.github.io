/* =====================================================================
   Compétences : filtres par pôle (transitions fluides), détail de chaque
   compétence (infobulle ouverte au survol, au toucher ou au clavier)
   et lien avec la figure « La pile ».
   Sans JavaScript, chaque compétence reste un détail dépliable natif.
   ===================================================================== */
(function () {
  'use strict';
  var root = document.querySelector('[data-skill-poles]');
  if (!root) return;
  var html = document.documentElement;
  var AR = window.AR || {};
  var gsap = window.gsap;
  var Flip = window.Flip;
  var motion = html.classList.contains('motion') && !!gsap;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var EN = html.lang === 'en';
  var WORDS = EN ? { d: ['domain', 'domains'], s: ['skill', 'skills'] } : { d: ['domaine', 'domaines'], s: ['compétence', 'compétences'] };

  function $$(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }
  function plural(n, w) { return n + ' ' + w[n > 1 ? 1 : 0]; }

  var blocks = $$('.skill-pole-block', root);
  var buttons = $$('[data-pole-filter]');
  var count = document.querySelector('[data-skill-count]');
  var explorer = document.querySelector('[data-skill-explorer]');
  var tips = $$('details.skill-chip', root);

  /* ---------- Infobulles ---------- */
  function place(details) {
    var tip = details.querySelector('.skill-tip'), item = details.closest('.skill-item');
    if (!tip || !item) return;
    tip.style.removeProperty('--tip-x');
    var bounds = root.getBoundingClientRect(), r = item.getBoundingClientRect(), width = tip.offsetWidth;
    var left = Math.max(12, bounds.left), right = Math.min(window.innerWidth - 12, bounds.right);
    var shift = Math.max(0, r.left + width - right);
    shift = Math.min(shift, Math.max(0, r.left - left));
    tip.style.setProperty('--tip-x', -shift + 'px');
    tip.style.setProperty('--tip-arrow', Math.max(16, Math.min(width - 16, Math.min(r.width / 2, 40) + shift)) + 'px');
  }
  function closeAll(except) {
    tips.forEach(function (d) { if (d !== except && d.open) { d.open = false; delete d.dataset.pinned; } });
  }
  tips.forEach(function (details) {
    var summary = details.querySelector('summary'), item = details.closest('.skill-item'), timer = 0;
    details.addEventListener('toggle', function () {
      if (details.open) { closeAll(details); place(details); }
      else delete details.dataset.pinned;
    });
    // Un clic épingle l'infobulle ; le survol seul l'ouvre et la referme.
    summary.addEventListener('click', function (event) {
      if (details.open && !details.dataset.pinned && fine) {
        event.preventDefault();
        details.dataset.pinned = '1';
      } else if (!details.open) {
        details.dataset.pinned = '1';
      }
    });
    if (fine) {
      item.addEventListener('pointerenter', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { if (!details.open) details.open = true; }, 140);
      });
      item.addEventListener('pointerleave', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { if (details.open && !details.dataset.pinned) details.open = false; }, 220);
      });
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var open = tips.filter(function (d) { return d.open; })[0];
    if (!open) return;
    open.open = false;
    open.querySelector('summary').focus();
  });
  document.addEventListener('pointerdown', function (event) {
    if (!event.target.closest || !event.target.closest('.skill-item')) closeAll(null);
  });
  window.addEventListener('resize', function () { tips.forEach(function (d) { if (d.open) place(d); }); });

  /* ---------- Filtres par pôle ---------- */
  var active = 'all', run = 0;
  function updateCount() {
    var cards = $$('.skill-group', root).filter(function (c) { return !c.closest('[hidden]'); });
    var skills = cards.reduce(function (n, c) { return n + c.querySelectorAll('.skill-item').length; }, 0);
    if (count) count.textContent = plural(cards.length, WORDS.d) + ' · ' + plural(skills, WORDS.s);
  }
  function apply(pole, scroll) {
    if (!blocks.some(function (b) { return pole === 'all' || b.getAttribute('data-pole') === pole; })) pole = 'all';
    var id = ++run;
    active = pole;
    closeAll(null);
    buttons.forEach(function (b) {
      var on = b.getAttribute('data-pole-filter') === pole;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var visible = function (b) { return pole === 'all' || b.getAttribute('data-pole') === pole; };
    if (motion) {
      // Un filtrage encore en cours (clics rapprochés) est abandonné : ses animations s'arrêtent net.
      var parts = $$('.skill-pole-head, .skill-group', root);
      gsap.killTweensOf(blocks.concat(parts));
      gsap.set(blocks, { clearProps: 'all' });
      gsap.set(parts, { clearProps: 'opacity,transform' });
    }
    var leaving = blocks.filter(function (b) { return !b.hidden && !visible(b); });
    var finish = function () {
      if (id !== run) return;
      var kept = blocks.filter(function (b) { return !b.hidden && visible(b); });
      var state = motion && Flip && kept.length ? Flip.getState(kept) : null;
      var entering = blocks.filter(function (b) { return b.hidden && visible(b); });
      blocks.forEach(function (b) { b.hidden = !visible(b); });
      updateCount();
      // Les cartes affichées sont révélées d'office : leur déclencheur de défilement n'est plus à jour.
      var enteringCards = entering.reduce(function (list, b) { return list.concat($$('.skill-group', b)); }, []);
      var shown = $$('.skill-group', root).filter(function (c) { return !c.closest('[hidden]'); });
      shown.forEach(function (c) { c.classList.add('is-revealed'); });
      if (state) Flip.from(state, { duration: .55, ease: 'power3.inOut' });
      if (motion) {
        var pending = shown.filter(function (c) { return enteringCards.indexOf(c) < 0 && parseFloat(window.getComputedStyle(c).opacity) < .99; });
        if (pending.length) gsap.to(pending, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power3.out', overwrite: 'auto' });
        if (entering.length) {
          var heads = entering.map(function (b) { return b.querySelector('.skill-pole-head'); });
          gsap.fromTo(heads.concat(enteringCards), { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .55, stagger: .06, ease: 'power3.out', overwrite: 'auto' });
        }
        if (window.ScrollTrigger) window.setTimeout(function () { window.ScrollTrigger.refresh(); }, 650);
      }
      if (scroll && explorer) {
        if (AR.scrollTo) AR.scrollTo(explorer); else explorer.scrollIntoView({ block: 'start' });
      }
    };
    if (motion && leaving.length) {
      gsap.to(leaving, { opacity: 0, y: -14, duration: .22, ease: 'power2.in', onComplete: function () {
        gsap.set(leaving, { clearProps: 'opacity,transform' });
        finish();
      } });
    } else {
      finish();
    }
    document.dispatchEvent(new CustomEvent('skills:active', { detail: { pole: pole === 'all' ? null : pole } }));
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var pole = b.getAttribute('data-pole-filter');
      apply(pole === active && pole !== 'all' ? 'all' : pole, false);
    });
  });
  document.addEventListener('skills:pole', function (event) {
    var pole = event.detail && event.detail.pole;
    if (pole) apply(pole === active ? 'all' : pole, !!event.detail.scroll);
  });
  updateCount();

  /* ---------- Apparition : les segments du parcours se remplissent ---------- */
  if (motion && 'IntersectionObserver' in window) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        seen.unobserve(entry.target);
        var bars = $$('.skill-era .is-on i', entry.target);
        if (bars.length) gsap.fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: .7, stagger: .12, delay: .35, ease: 'power2.out', clearProps: 'transform' });
      });
    }, { threshold: .25 });
    $$('.skill-group', root).forEach(function (card) { seen.observe(card); });
  }
})();
