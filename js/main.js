/* L&A Coiffure — interactions du site.
   Chaque fonction est indépendante et ne fait rien si ses éléments sont absents. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- En-tête : bordure au défilement ---------- */
  function initHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) return;
    var update = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    if (!toggle || !menu) return;
    var label = toggle.querySelector('.visually-hidden');

    function focusables() {
      return Array.prototype.slice.call(menu.querySelectorAll('a[href], button:not([disabled])'));
    }

    function open() {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      if (label) label.textContent = 'Fermer le menu';
      document.body.classList.add('menu-open');
      var items = focusables();
      if (items.length) items[0].focus();
    }

    function close(returnFocus) {
      if (menu.hidden) return;
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (label) label.textContent = 'Ouvrir le menu';
      document.body.classList.remove('menu-open');
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (menu.hidden) open(); else close(true);
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) close(false);
    });

    document.addEventListener('keydown', function (event) {
      if (menu.hidden) return;
      if (event.key === 'Escape') {
        close(true);
        return;
      }
      // Garde le focus dans le menu ouvert (bouton de fermeture inclus)
      if (event.key === 'Tab') {
        var items = [toggle].concat(focusables());
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    var desktop = window.matchMedia('(min-width: 1024px)');
    var onChange = function (e) { if (e.matches) close(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- Onglets des prestations (amélioration progressive) ---------- */
  function initTabs() {
    var root = document.querySelector('[data-tabs]');
    if (!root) return;
    var list = root.querySelector('[data-tabs-list]');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-tab]'));
    var panels = tabs.map(function (tab) {
      return root.querySelector('[data-panel="' + tab.getAttribute('data-tab') + '"]');
    });
    if (!list || !tabs.length || panels.indexOf(null) !== -1) return;

    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Catégories de prestations');

    tabs.forEach(function (tab, i) {
      var panel = panels[i];
      var tabId = 'tab-' + tab.getAttribute('data-tab');
      tab.id = tabId;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabId);
      panel.setAttribute('tabindex', '0');

      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          event.preventDefault();
          select(next, true);
        }
      });
    });

    function select(index, moveFocus) {
      tabs.forEach(function (tab, i) {
        var active = i === index;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
      });
      if (moveFocus) tabs[index].focus();
    }

    // Sur mobile, la rangée d'onglets défile horizontalement : on garde l'onglet choisi visible
    // sans jamais faire défiler la page verticalement.
    function revealTab(tab) {
      if (list.scrollWidth <= list.clientWidth) return;
      var gutter = 20;
      var left = tab.offsetLeft; // .tabs__list est positionnée : offsetLeft est relatif à la liste
      var right = left + tab.offsetWidth;
      if (left - gutter < list.scrollLeft) list.scrollLeft = Math.max(0, left - gutter);
      else if (right + gutter > list.scrollLeft + list.clientWidth) list.scrollLeft = right + gutter - list.clientWidth;
    }
    list.addEventListener('focusin', function (event) {
      if (event.target.matches('[data-tab]')) revealTab(event.target);
    });
    list.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-tab]');
      if (tab) revealTab(tab);
    });

    list.hidden = false;
    root.classList.add('is-ready');
    select(0, false);
  }

  /* ---------- Statut d'ouverture (heure de Zurich) ----------
     Les horaires sont lus dans le tableau HTML [data-hours] : une seule source à mettre à jour. */
  function initOpeningStatus() {
    var table = document.querySelector('[data-hours]');
    if (!table) return;
    var rows = Array.prototype.slice.call(table.querySelectorAll('tr[data-day]'));
    var DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    var schedule = {};
    rows.forEach(function (row) {
      var open = row.getAttribute('data-open');
      var close = row.getAttribute('data-close');
      schedule[row.getAttribute('data-day')] = open && close ? { open: toMinutes(open), close: toMinutes(close), row: row } : { row: row };
    });

    function toMinutes(hhmm) {
      var p = hhmm.split(':');
      return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
    }
    function fmt(minutes) {
      var h = Math.floor(minutes / 60);
      var m = minutes % 60;
      return h + 'h' + (m < 10 ? '0' : '') + m;
    }
    function zurichNow() {
      try {
        var parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Zurich', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        }).formatToParts(new Date());
        var map = {};
        parts.forEach(function (p) { map[p.type] = p.value; });
        var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(map.weekday);
        if (day === -1) throw new Error('weekday');
        return { day: day, minutes: (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10) };
      } catch (e) {
        var d = new Date();
        return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
      }
    }
    function nextOpening(fromDay) {
      for (var offset = 1; offset <= 7; offset++) {
        var day = (fromDay + offset) % 7;
        var s = schedule[day];
        if (s && s.open !== undefined) {
          var when = offset === 1 ? 'demain' : DAY_NAMES[day];
          return 'ouvre ' + when + ' à ' + fmt(s.open);
        }
      }
      return '';
    }

    function render() {
      var now = zurichNow();
      var today = schedule[now.day];
      var isOpen = false;
      var text;

      if (today && today.open !== undefined && now.minutes >= today.open && now.minutes < today.close) {
        isOpen = true;
        text = 'Ouvert · ferme à ' + fmt(today.close);
      } else if (today && today.open !== undefined && now.minutes < today.open) {
        text = 'Fermé · ouvre à ' + fmt(today.open);
      } else {
        text = 'Fermé · ' + nextOpening(now.day);
      }

      rows.forEach(function (row) { row.classList.remove('is-today'); });
      if (today && today.row) today.row.classList.add('is-today');

      Array.prototype.forEach.call(document.querySelectorAll('[data-open-status]'), function (el) {
        el.textContent = text;
      });
      var badge = document.querySelector('[data-open-status-badge]');
      if (badge) {
        badge.textContent = isOpen ? 'Ouvert maintenant' : 'Fermé actuellement';
        badge.classList.toggle('is-open', isOpen);
        badge.hidden = false;
      }
    }

    render();
    window.setInterval(render, 60 * 1000);
  }

  /* ---------- Carte OpenStreetMap chargée à la demande ---------- */
  function initMap() {
    var box = document.querySelector('[data-map]');
    var button = box && box.querySelector('[data-map-load]');
    if (!box || !button) return;
    var LAT = 46.799866;
    var LON = 7.1528;
    var D = 0.004;

    button.addEventListener('click', function () {
      var src = 'https://www.openstreetmap.org/export/embed.html?bbox=' +
        [LON - D, LAT - D / 2, LON + D, LAT + D / 2].map(function (n) { return n.toFixed(5); }).join('%2C') +
        '&layer=mapnik&marker=' + LAT + '%2C' + LON;
      var iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = 'Carte : L&A Coiffure, boulevard de Pérolles 22, Fribourg';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer';

      // L'attribution OpenStreetMap est affichée dans la carte elle-même.
      box.innerHTML = '';
      box.appendChild(iframe);
      box.classList.add('is-loaded');
      iframe.focus();
    });
  }

  /* ---------- Lien actif dans la navigation ---------- */
  function initActiveNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-nav-link]'));
    if (!links.length || !hasIO) return;
    var byId = {};
    links.forEach(function (link) { byId[link.getAttribute('href').slice(1)] = link; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        var active = byId[entry.target.id];
        if (active) {
          active.classList.add('is-active');
          active.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    // L'accueil est observé aussi : en haut de page, aucun lien n'est mis en avant.
    Object.keys(byId).concat('top').forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Barre d'action mobile ----------
     Visible quand les boutons de l'accueil et l'appel final ne sont plus à l'écran. */
  function initActionBar() {
    var bar = document.querySelector('[data-action-bar]');
    var hero = document.querySelector('[data-hero-actions]');
    var finale = document.querySelector('[data-cta-final]');
    if (!bar || !hero || !hasIO) return;
    var links = bar.querySelectorAll('a');
    var state = { hero: true, finale: false };

    function update() {
      var show = !state.hero && !state.finale;
      bar.classList.toggle('is-visible', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      Array.prototype.forEach.call(links, function (a) { a.tabIndex = show ? 0 : -1; });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === hero) state.hero = entry.isIntersecting || entry.boundingClientRect.top > 0;
        if (entry.target === finale) state.finale = entry.isIntersecting;
      });
      update();
    });
    observer.observe(hero);
    if (finale) observer.observe(finale);
  }

  /* ---------- Apparition douce au défilement ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reduceMotion || !hasIO) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-visible'); });
      return;
    }
    // Le masquage initial n'est activé qu'ici : sans script, tout reste visible.
    document.documentElement.classList.add('reveal-ready');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(items, function (el) { observer.observe(el); });
  }

  /* ---------- Année du copyright ---------- */
  function initYear() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function safe(fn) {
    try { fn(); } catch (e) { if (window.console) console.error(e); }
  }

  [initHeader, initMenu, initTabs, initOpeningStatus, initMap, initActiveNav, initActionBar, initReveal, initYear].forEach(safe);
})();
