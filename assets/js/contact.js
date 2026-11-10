/* Coordonnées : e-mail (depuis config.js), copie, carte de visite vCard, année.
   Ne dépend d'aucune bibliothèque : fonctionne aussi sur la page CV. */
(function () {
  'use strict';
  var cfg = window.SITE_CONFIG || {};
  var lang = (document.documentElement.lang || 'fr').slice(0, 2);
  var T = {
    fr: { copied: 'Adresse e-mail copiée', fail: 'Copie impossible : sélectionnez l\'adresse', title: 'Responsable projets informatique industrielle', file: 'Or3L.vcf' },
    en: { copied: 'E-mail address copied', fail: 'Copy failed: please select the address', title: 'Industrial IT Project Manager', file: 'Or3L.vcf' }
  }[lang === 'en' ? 'en' : 'fr'];

  var email = String(cfg.email || '').trim();
  var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  var siteUrl = String(cfg.siteUrl || '').trim();

  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  var toastTimer;
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 2600);
  }
  window.ARToast = toast;

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      if (ok) { resolve(); } else { reject(new Error('copy')); }
    });
  }

  if (validEmail) {
    each('[data-email-link]', function (a) { a.href = 'mailto:' + email; a.hidden = false; });
    each('[data-email-copy]', function (b) {
      b.hidden = false;
      b.addEventListener('click', function () {
        copy(email).then(function () { toast(T.copied); }, function () { toast(T.fail); });
      });
    });
    each('[data-email-text]', function (s) {
      if (s.closest('.cv-contact')) {
        var a = document.createElement('a');
        a.href = 'mailto:' + email;
        a.textContent = email;
        s.appendChild(a);
      } else {
        s.textContent = email;
      }
    });
    each('[data-noemail]', function (s) { s.hidden = true; });
  }

  if (siteUrl) {
    each('[data-site-url]', function (s) {
      var a = document.createElement('a');
      a.href = siteUrl;
      a.textContent = (s.getAttribute('data-label') || '') + ' : ' + siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      s.appendChild(a);
    });
  }

  // Carte de visite (vCard) générée à la volée à partir de la configuration
  each('[data-vcard]', function (b) {
    b.hidden = false;
    b.addEventListener('click', function () {
      var lines = ['BEGIN:VCARD', 'VERSION:3.0', 'N:Or3L;;;;', 'FN:Or3L', 'TITLE:' + T.title,
        'ADR;TYPE=HOME:;;;Limoges;;;France'];
      if (validEmail) lines.push('EMAIL;TYPE=INTERNET:' + email);
      if (cfg.linkedin) lines.push('URL:' + cfg.linkedin);
      if (siteUrl) lines.push('URL:' + siteUrl);
      lines.push('END:VCARD');
      var blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/vcard;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = T.file;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    });
  });

  each('[data-year]', function (s) { s.textContent = String(new Date().getFullYear()); });
})();
