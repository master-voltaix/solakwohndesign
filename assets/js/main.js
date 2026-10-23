/* Solak Wohndesign – Interaktionen */
(function () {
  'use strict';

  /* ===== Google Ads =====
     Conversion-ID hier eintragen (z. B. 'AW-123456789') und das Label der
     Formular-Conversion (z. B. 'AbCdEfGhIjK'). Solange leer, wird nichts geladen. */
  var GOOGLE_ADS_ID = '';
  var GOOGLE_ADS_LEAD_LABEL = '';

  var body = document.body;
  if (/[?&]shot=1/.test(location.search)) document.documentElement.classList.add('no-anim'); // für Vorschau-Screenshots

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('no-anim');
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Header & Scroll-Fortschritt ---------- */
  var header = document.querySelector('.header');
  var bar = document.createElement('div');
  bar.className = 'progress';
  body.appendChild(bar);
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle('scrolled', y > 10);
      if (!body.classList.contains('menu-open')) header.classList.toggle('hide', y > lastY + 2 && y > 500);
      if (y < lastY - 2) header.classList.remove('hide');
    }
    var h = root.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobiles Menü ---------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    if (burger) { burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen'); }
    if (menu) menu.setAttribute('aria-hidden', !open);
    body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ==========================================================
     Animationen – jedes Element bekommt automatisch eine passende,
     einheitliche Einblend-Animation. [Selektor, Typ, Start, Staffelung]
     ========================================================== */
  var RULES = [
    ['.hero h1 .mega-sub', 'up', .55],
    ['.hero-text p', 'up', .7], ['.hero-text .actions', 'up', .82],
    ['.hcard', 'card', .9, .12],
    ['.marquee', 'fade', .2],
    ['.eyebrow, .label', 'fade', 0],
    ['main h2, .legal-head h1', 'words', 0],
    ['.head p, .head > .btn, .head > a.btn', 'up', .25],
    ['.why-item', 'card', .1, .1], ['.why-item svg', 'pop'],
    ['.mcard', 'card', .05, .12], ['.mcard-img', 'img'], ['.mcard-img .num', 'pop'], ['.includes small', 'fade'], ['.inc i', 'pop'],
    ['.process-top .copy p, .process-top .copy .btn', 'up', .2, .1], ['.process-img', 'img', .1], ['.process-img .badge', 'up'],
    ['.step', 'card', .1, .14],
    ['.review', 'card', .05, .1], ['.rating-line', 'up', .2],
    ['.about-copy p, .about-copy .rating, .about-copy .btn', 'up', .15, .1], ['.about-img', 'img', .1], ['.feat', 'card', .1, .1], ['.feat i', 'pop'],
    ['.qcard', 'card', .05, .1], ['.qcard i', 'pop'],
    ['.form-card > p', 'up', .2], ['.form .group, .form .field, .form .consent, .form .form-foot', 'up', .1, .05], ['.form-img', 'img', .1], ['.form-img .quote', 'up'],
    ['.contact-sec p', 'up', .2], ['.c-social a', 'pop', .35, .08], ['.c-card', 'card', .1, .08], ['.c-card i', 'pop'],
    ['.statement p', 'words', 0],
    ['.footer-grid > div', 'up', 0, .1], ['.footer-bottom', 'fade', .3],
    ['.legal-head p', 'up', .3], ['.legal-nav a', 'left', .1, .06], ['.prose > *', 'up', .05, .04]
  ];

  function splitWords(el, base, step) {
    var i = 0;
    function wrap(content) {
      var w = document.createElement('span');
      w.className = 'w';
      w.style.setProperty('--d', (base + i++ * step).toFixed(3) + 's');
      w.appendChild(content);
      return w;
    }
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            frag.appendChild(/^\s+$/.test(p) ? document.createTextNode(p) : wrap(document.createTextNode(p)));
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.classList.contains('pic')) { var ph = document.createComment(''); n.parentNode.replaceChild(ph, n); ph.parentNode.replaceChild(wrap(n), ph); }
          else walk(n);
        }
      });
    })(el);
  }

  if (!reduce && hasIO) {
    root.classList.add('js-anim');

    // Hero-Wort als Ganzes (Wisch-Effekt, Text bleibt ein Wort)
    var mega = document.querySelector('.mega');
    if (mega) { mega.setAttribute('data-a', 'mega'); mega.style.setProperty('--d', '.05s'); }

    RULES.forEach(function (r) {
      var counts = new Map();
      document.querySelectorAll(r[0]).forEach(function (el) {
        if (el.hasAttribute('data-a')) return;
        var parentAnim = el.parentElement && el.parentElement.closest('[data-a]');
        var d;
        if (r[2] === undefined && parentAnim) {
          d = (parseFloat(parentAnim.style.getPropertyValue('--d')) || 0) + .3;
        } else {
          var p = el.parentElement, idx = counts.get(p) || 0;
          counts.set(p, idx + 1);
          d = (r[2] || 0) + Math.min(idx * (r[3] || 0), .7);
        }
        el.setAttribute('data-a', r[1]);
        if (r[1] === 'words') splitWords(el, d, .045);
        else el.style.setProperty('--d', d.toFixed(3) + 's');
      });
    });
  }

  var animEls = Array.prototype.slice.call(document.querySelectorAll('[data-a], [data-steps]'));
  if (hasIO && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    animEls.forEach(function (el) { io.observe(el); });
    // Absicherung: alles, was bereits oberhalb/innerhalb des Bildschirms liegt, sicher einblenden
    // (z. B. nach Sprung über Menü-Link oder sehr schnellem Scrollen)
    var pending = animEls.slice(), chk = false;
    function sweep() {
      var vh = window.innerHeight;
      pending = pending.filter(function (el) {
        if (el.classList.contains('in')) return false;
        if (el.getBoundingClientRect().top < vh * 0.96) { el.classList.add('in'); return false; }
        return true;
      });
      chk = false;
      if (!pending.length) window.removeEventListener('scroll', onSweep);
    }
    function onSweep() { if (!chk) { chk = true; requestAnimationFrame(sweep); } }
    window.addEventListener('scroll', onSweep, { passive: true });
    window.addEventListener('load', sweep);
    setTimeout(sweep, 400);
  } else {
    animEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Zahlen hochzählen ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (!reduce && hasIO) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = +el.getAttribute('data-count'), dec = +(el.getAttribute('data-dec') || 0), suf = el.getAttribute('data-suffix') || '', t0 = null;
        co.unobserve(el);
        (function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1600, 1), e = 1 - Math.pow(1 - p, 3);
          el.textContent = (end * e).toFixed(dec).replace('.', ',') + suf;
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Parallax-Bilder & Stuhl ---------- */
  if (!reduce) {
    var plx = document.querySelectorAll('[data-parallax] img');
    var ticking = false;
    function runPlx() {
      plx.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        var prog = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        img.style.setProperty('--py', (prog * -6).toFixed(2) + '%');
      });
      ticking = false;
    }
    if (plx.length) {
      window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(runPlx); ticking = true; } }, { passive: true });
      runPlx();
    }

    var stage = document.querySelector('.hero-stage'), chair = document.querySelector('.hero-chair');
    if (stage && chair && window.matchMedia('(pointer: fine)').matches) {
      stage.addEventListener('mousemove', function (e) {
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        chair.style.setProperty('--mx', (x * -28).toFixed(1) + 'px');
        chair.style.setProperty('--my', (y * -18).toFixed(1) + 'px');
      });
      stage.addEventListener('mouseleave', function () { chair.style.setProperty('--mx', '0px'); chair.style.setProperty('--my', '0px'); });
    }
  }

  /* ---------- Aktiver Menüpunkt ---------- */
  var navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('active'); });
          var l = map[en.target.id]; if (l) l.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- Kategorie aus Leistungskarte vorauswählen ---------- */
  document.querySelectorAll('[data-category]').forEach(function (el) {
    el.addEventListener('click', function () {
      var sel = document.getElementById('f-kategorie');
      if (sel) sel.value = el.getAttribute('data-category');
    });
  });

  /* ---------- Formular ---------- */
  var form = document.getElementById('anfrage');
  if (form) {
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');

    function setStatus(type, msg) { status.className = 'form-status ' + type; status.textContent = msg; }

    function validate() {
      var ok = true;
      form.querySelectorAll('.field, .consent').forEach(function (f) { f.classList.remove('invalid'); });
      ['vorname', 'nachname', 'email', 'telefon'].forEach(function (n) {
        var inp = form.elements[n];
        var valid = inp.value.trim() !== '' && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim()));
        if (!valid) { inp.closest('.field').classList.add('invalid'); ok = false; }
      });
      if (!form.elements.kategorie.value) { form.elements.kategorie.closest('.field').classList.add('invalid'); ok = false; }
      if (!form.elements.datenschutz.checked) { form.querySelector('.consent').classList.add('invalid'); ok = false; }
      return ok;
    }

    function mailtoFallback(data) {
      var lines = [
        'Name: ' + data.get('vorname') + ' ' + data.get('nachname'),
        'E-Mail: ' + data.get('email'),
        'Telefon: ' + (data.get('vorwahl') || '') + ' ' + data.get('telefon'),
        'Interesse: ' + data.get('kategorie'),
        '', 'Nachricht:', data.get('nachricht') || '-'
      ];
      window.location.href = 'mailto:office@solakwohndesign.at?subject=' +
        encodeURIComponent('Beratungsanfrage – ' + data.get('kategorie')) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    }

    function trackLead() {
      if (window.gtag && GOOGLE_ADS_ID && GOOGLE_ADS_LEAD_LABEL) {
        window.gtag('event', 'conversion', { send_to: GOOGLE_ADS_ID + '/' + GOOGLE_ADS_LEAD_LABEL });
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'generate_lead', form: 'beratungstermin' });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        setStatus('err', 'Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Datenschutzerklärung.');
        var first = form.querySelector('.invalid input, .invalid');
        if (first && first.focus) first.focus();
        return;
      }
      var data = new FormData(form);
      if (data.get('website')) return; // Spam-Schutz
      submitBtn.disabled = true;
      setStatus('', '');

      fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (res) {
          if (!res || !res.ok) throw new Error('send');
          trackLead();
          form.reset();
          setStatus('ok', 'Vielen Dank für Ihre Anfrage! Wir melden uns in Kürze bei Ihnen.');
        })
        .catch(function () {
          // Kein Server-Versand möglich (z. B. lokale Vorschau): E-Mail-Programm öffnen
          trackLead();
          mailtoFallback(data);
          setStatus('ok', 'Ihr E-Mail-Programm wurde mit Ihrer Anfrage geöffnet. Alternativ erreichen Sie uns unter +43 660 5461511.');
        })
        .finally(function () { submitBtn.disabled = false; });
    });
  }

  /* ---------- Cookie-Einwilligung ---------- */
  var KEY = 'solak-consent';
  var banner = document.querySelector('.cookie');
  function getConsent() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function saveConsent(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadAds() {
    if (!GOOGLE_ADS_ID || window.__adsLoaded) return;
    window.__adsLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'denied' });
    window.gtag('config', GOOGLE_ADS_ID);
  }

  function showBanner(show) { if (banner) banner.classList.toggle('show', show); }

  if (banner) {
    var c = getConsent();
    if (c === 'accept') loadAds();
    if (!c) setTimeout(function () { showBanner(true); }, 900);
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cookie]');
      if (!b) return;
      var v = b.getAttribute('data-cookie');
      saveConsent(v);
      showBanner(false);
      if (v === 'accept') loadAds();
      else if (window.__adsLoaded) window.location.reload();
    });
  }
  document.querySelectorAll('[data-cookie-open]').forEach(function (b) {
    b.addEventListener('click', function () { showBanner(true); });
  });
})();
