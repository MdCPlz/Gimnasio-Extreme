/* =============================================================================
   NÚCLEO — cabecera, menú, pie, cookies, mapa, apariciones, analítica y rating.
   Depende de lib/manifest.js y lib/plantillas.js. Expone window.XT.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP;
  if (!B || !P) { console.error('[Xtreme] Faltan lib/manifest.js o lib/plantillas.js'); return; }

  var esc = P.esc, icono = P.icono, R = P.ruta;

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function crea(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }

  function sinMovimiento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function retrasa(fn, ms) {
    var t; return function () {
      var a = arguments, c = this;
      clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 160);
    };
  }

  /* Menú principal: una sola fuente para cabecera, menú móvil y pie. */
  var MENU = [
    { href: '/index.html',     texto: 'Inicio' },
    { href: '/clases.html',    texto: 'Clases' },
    { href: '/tarifas.html',   texto: 'Cuotas' },
    { href: '/horarios.html',  texto: 'Horarios' },
    { href: '/centros.html',   texto: 'Centros' },
    { href: '/reservar.html',  texto: 'Reservar' },
    { href: '/contacto.html',  texto: 'Contacto' }
  ];

  function esActual(href) {
    var p = location.pathname.replace(/\/$/, '');
    if (p === '' || p === '/index' ) p = '/index.html';
    if (!/\.html$/.test(p)) p = p + '.html';
    return p === href;
  }

  /* --------------------------------------------------------------- cabecera */
  function pintaCabecera() {
    var hueco = $('[data-cabecera]');
    if (!hueco) return;
    var logo = B.marca.logo;

    hueco.outerHTML =
      '<a class="saltar" href="#principal">Saltar al contenido</a>' +
      '<header class="cabecera" id="cabecera">' +
        '<div class="cabecera__interior">' +
          '<a class="marca" href="' + R('/index.html') + '" aria-label="' + esc(B.nombreCompleto) + ', inicio">' +
            '<img src="' + esc(R(logo.claro)) + '" srcset="' + esc(R(logo.claro)) + ' 1x, ' + esc(R(logo.claro2x)) + ' 3x" ' +
              'width="169" height="84" alt="' + esc(logo.alt) + '">' +
          '</a>' +
          '<nav class="navegacion" aria-label="Principal">' +
            MENU.map(function (m) {
              return '<a href="' + esc(R(m.href)) + '"' + (esActual(m.href) ? ' aria-current="page"' : '') + '>' +
                esc(m.texto) + '</a>';
            }).join('') +
          '</nav>' +
          '<div class="cabecera__acciones">' +
            '<a class="cabecera__tel" href="tel:' + esc(B.contacto.telefonoTel) + '">' +
              icono('telefono', 18) + '<span>' + esc(B.contacto.telefono) + '</span></a>' +
            '<a class="boton boton--pequeno" href="' + R('/area-socio.html') + '">Área de socio</a>' +
            '<button class="hamburguesa" type="button" aria-expanded="false" aria-controls="menu-movil" ' +
              'aria-label="Abrir el menú"><span></span><span></span><span></span></button>' +
          '</div>' +
        '</div>' +
      '</header>' +
      '<div class="menu" id="menu-movil" data-abierto="false" inert>' +
        '<nav aria-label="Menú">' +
          MENU.map(function (m, i) {
            return '<a href="' + esc(R(m.href)) + '"' + (esActual(m.href) ? ' aria-current="page"' : '') +
              ' style="animation-delay:' + (60 + i * 45) + 'ms"><span>' + P.pad(i + 1) + '</span>' +
              esc(m.texto) + '</a>';
          }).join('') +
        '</nav>' +
        '<div class="menu__pie">' +
          '<a class="boton boton--ancho" href="' + R('/tarifas.html') + '">Ver las cuotas</a>' +
          '<a class="boton boton--fantasma boton--ancho" href="tel:' + esc(B.contacto.telefonoTel) + '">' +
            icono('telefono', 18) + ' ' + esc(B.contacto.telefono) + '</a>' +
          '<p>' + esc(B.horario.resumen) + ' · ' + B.centros.length + ' centros en Burgos</p>' +
        '</div>' +
      '</div>';

    montaMenu();
    montaScrollCabecera();
  }

  function montaMenu() {
    var boton = $('.hamburguesa'), menu = $('#menu-movil');
    if (!boton || !menu) return;
    var abierto = false, ultimoFoco = null;

    function alterna(v) {
      abierto = v;
      boton.setAttribute('aria-expanded', String(v));
      boton.setAttribute('aria-label', v ? 'Cerrar el menú' : 'Abrir el menú');
      menu.setAttribute('data-abierto', String(v));
      if (v) { menu.removeAttribute('inert'); } else { menu.setAttribute('inert', ''); }
      document.body.classList.toggle('sin-scroll', v);
      if (v) {
        ultimoFoco = document.activeElement;
        var primero = $('a', menu);
        if (primero) setTimeout(function () { primero.focus(); }, 60);
      } else if (ultimoFoco) { ultimoFoco.focus(); }
    }

    boton.addEventListener('click', function () { alterna(!abierto); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) alterna(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && abierto) alterna(false);
    });
    window.addEventListener('resize', retrasa(function () {
      if (abierto && window.innerWidth >= 1024) alterna(false);
    }, 200));
  }

  /* La cabecera se esconde al bajar y vuelve al subir. */
  function montaScrollCabecera() {
    var cab = $('#cabecera');
    if (!cab) return;
    var ultimo = 0, tic = false;

    function mira() {
      var y = window.scrollY;
      cab.classList.toggle('cabecera--fija', y > 24);
      var menuAbierto = $('#menu-movil') && $('#menu-movil').getAttribute('data-abierto') === 'true';
      if (!menuAbierto) {
        cab.classList.toggle('cabecera--oculta', y > 420 && y > ultimo + 6);
      }
      ultimo = y; tic = false;
    }
    window.addEventListener('scroll', function () {
      if (!tic) { tic = true; window.requestAnimationFrame(mira); }
    }, { passive: true });
    mira();
  }

  /* -------------------------------------------------------------------- pie */
  function pintaPie() {
    var hueco = $('[data-pie]');
    if (!hueco) return;
    var logo = B.marca.logo, c = B.contacto;

    var redes = (B.redes || []).map(function (r) {
      return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer" ' +
        'aria-label="' + esc(B.nombre + ' en ' + r.nombre) + '">' + icono(r.id, 18) + '</a>';
    }).join('');

    var centros = (B.centros || []).map(function (x) {
      return '<div class="pie__centro"><b>' + esc(x.nombre) + '</b>' +
        esc(x.calle) + (x.detalle ? ' (' + esc(x.detalle) + ')' : '') + '<br>' +
        esc(x.cp) + ' ' + esc(x.ciudad) + '<br>' +
        '<a href="tel:' + esc(x.telefonoTel) + '">' + esc(x.telefono) + '</a></div>';
    }).join('');

    hueco.outerHTML =
      '<footer class="pie">' +
        '<div class="contenedor">' +
          '<div class="pie__rejilla">' +
            '<div class="pie__marca">' +
              '<img src="' + esc(R(logo.claro)) + '" srcset="' + esc(R(logo.claro)) + ' 1x, ' + esc(R(logo.claro2x)) + ' 3x" ' +
                'width="169" height="84" alt="' + esc(logo.alt) + '" loading="lazy">' +
              '<p>' + esc(B.claim) + ' ' + esc(B.slogan) + '</p>' +
              '<div class="pie__redes">' + redes + '</div>' +
            '</div>' +
            '<div><h4>El gimnasio</h4><ul>' +
              MENU.slice(1).map(function (m) {
                return '<li><a href="' + esc(R(m.href)) + '">' + esc(m.texto) + '</a></li>';
              }).join('') +
            '</ul></div>' +
            '<div><h4>Socios</h4><ul>' +
              '<li><a href="' + R('/area-socio.html') + '">Área de socio</a></li>' +
              '<li><a href="' + R('/horarios.html') + '">Cuadro de clases</a></li>' +
              '<li><a href="' + esc(c.altaOnline) + '" target="_blank" rel="noopener noreferrer">Darse de alta</a></li>' +
              '<li><a href="mailto:' + esc(B.equipo.empleo.email) + '">Trabaja con nosotros</a></li>' +
              '<li><a href="' + R('/galeria.html') + '">Galería</a></li>' +
            '</ul></div>' +
            '<div><h4>Los tres centros</h4>' + centros + '</div>' +
          '</div>' +
          '<div class="pie__legal">' +
            '<p>© <span data-ano></span> ' + esc(B.legal.titular) + ' · NIF ' + esc(B.legal.nif) + '</p>' +
            '<nav aria-label="Legal">' +
              '<a href="' + R('/legal/aviso-legal.html') + '">Aviso legal</a>' +
              '<a href="' + R('/legal/privacidad.html') + '">Privacidad</a>' +
              '<a href="' + R('/legal/cookies.html') + '">Cookies</a>' +
              '<a href="#" data-abrir-cookies>Preferencias de cookies</a>' +
            '</nav>' +
          '</div>' +
        '</div>' +
      '</footer>';

    $$('[data-ano]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
  }

  /* ---------------------------------------------------------------- promo */
  function pintaPromo() {
    var hueco = $('[data-promo]');
    if (!hueco) return;
    var p = B.promocion;
    if (!p || !p.activa) { hueco.remove(); return; }
    if (p.caduca && new Date(p.caduca + 'T23:59:59') < new Date()) { hueco.remove(); return; }

    hueco.outerHTML =
      '<aside class="promo">' +
        '<div class="contenedor promo__interior">' +
          '<span class="promo__etiqueta">' + esc(p.etiqueta) + '</span>' +
          '<p><b>' + esc(p.titulo) + '.</b> ' + esc(p.texto) + '</p>' +
          '<a href="' + esc(R(p.cta.href)) + '">' + esc(p.cta.texto) + ' →</a>' +
        '</div>' +
      '</aside>';
  }

  /* ---------------------------------------------------------- apariciones */
  function montaApariciones() {
    var piezas = $$('[data-anima]');
    if (!piezas.length) return;
    if (sinMovimiento() || !('IntersectionObserver' in window)) {
      piezas.forEach(function (p) { p.setAttribute('data-anima', 'visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.setAttribute('data-anima', 'visible');
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    piezas.forEach(function (p) { obs.observe(p); });
  }

  /* Cuenta atrás de cifras al entrar en pantalla */
  function montaContadores() {
    var nodos = $$('[data-contador]');
    if (!nodos.length) return;
    if (sinMovimiento() || !('IntersectionObserver' in window)) {
      nodos.forEach(function (n) { n.textContent = P.numero(+n.getAttribute('data-contador')); });
      return;
    }
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        var fin = +e.target.getAttribute('data-contador'), t0 = null, dur = 1100;
        function paso(t) {
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / dur);
          var suave = 1 - Math.pow(1 - k, 3);
          e.target.textContent = P.numero(Math.round(fin * suave));
          if (k < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      });
    }, { threshold: 0.4 });
    nodos.forEach(function (n) { n.textContent = '0'; obs.observe(n); });
  }

  /* ------------------------------------------------------------- consentimiento */
  var CLAVE_COOKIES = 'xtreme.cookies.v1';

  function consentimiento() {
    return P.almacen.lee(CLAVE_COOKIES, null);
  }
  function guardaConsentimiento(c) {
    c.fecha = new Date().toISOString();
    P.almacen.guarda(CLAVE_COOKIES, c);
    aplicaConsentimiento(c);
    document.dispatchEvent(new CustomEvent('xt:cookies', { detail: c }));
  }
  function aplicaConsentimiento(c) {
    if (c && c.medicion) arrancaAnalitica();
    if (c && c.mapas) $$('[data-mapa]').forEach(cargaMapa);
  }

  function pintaGalletas() {
    if ($('.galletas')) return;
    var previo = consentimiento();

    var caja = crea(
      '<div class="galletas" role="dialog" aria-modal="false" aria-labelledby="galletas-t" data-visible="false">' +
        '<h2 id="galletas-t">Cookies</h2>' +
        '<p>Usamos cookies propias para que la web funcione. Las de medición y las del mapa de ' +
          'Google sólo se activan si tú lo permites. Más detalle en la ' +
          '<a href="' + R('/legal/cookies.html') + '">política de cookies</a>.</p>' +
        '<div class="galletas__botones">' +
          '<button class="boton" type="button" data-galleta="todo">Aceptar todo</button>' +
          '<button class="boton boton--fantasma" type="button" data-galleta="nada">Sólo las necesarias</button>' +
          '<button class="boton boton--fantasma" type="button" data-galleta="ajustar" aria-expanded="false">Ajustar</button>' +
        '</div>' +
        '<div class="galletas__detalle" hidden>' +
          '<div class="casilla"><input type="checkbox" id="ck-nec" checked disabled>' +
            '<label for="ck-nec"><b>Necesarias.</b> Recuerdan tu elección de cookies y tus reservas. ' +
            'No se pueden desactivar.</label></div>' +
          '<div class="casilla"><input type="checkbox" id="ck-med">' +
            '<label for="ck-med"><b>Medición.</b> Cuántas visitas tenemos y qué páginas se ven. ' +
            'Datos agregados, sin identificarte.</label></div>' +
          '<div class="casilla"><input type="checkbox" id="ck-map">' +
            '<label for="ck-map"><b>Mapas.</b> Carga el mapa de Google Maps. Hasta que lo aceptes, ' +
            'el mapa no se descarga.</label></div>' +
          '<button class="boton boton--ancho" type="button" data-galleta="guardar">Guardar mi elección</button>' +
        '</div>' +
      '</div>');
    document.body.appendChild(caja);

    if (previo) { aplicaConsentimiento(previo); }
    else { setTimeout(function () { caja.setAttribute('data-visible', 'true'); }, 900); }

    caja.addEventListener('click', function (e) {
      var b = e.target.closest('[data-galleta]');
      if (!b) return;
      var q = b.getAttribute('data-galleta');
      if (q === 'ajustar') {
        var d = $('.galletas__detalle', caja);
        var v = d.hasAttribute('hidden');
        if (v) d.removeAttribute('hidden'); else d.setAttribute('hidden', '');
        b.setAttribute('aria-expanded', String(v));
        return;
      }
      if (q === 'todo') guardaConsentimiento({ necesarias: true, medicion: true, mapas: true });
      if (q === 'nada') guardaConsentimiento({ necesarias: true, medicion: false, mapas: false });
      if (q === 'guardar') guardaConsentimiento({
        necesarias: true,
        medicion: $('#ck-med', caja).checked,
        mapas: $('#ck-map', caja).checked
      });
      caja.setAttribute('data-visible', 'false');
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-abrir-cookies]')) return;
      e.preventDefault();
      var p = consentimiento() || {};
      $('#ck-med', caja).checked = !!p.medicion;
      $('#ck-map', caja).checked = !!p.mapas;
      $('.galletas__detalle', caja).removeAttribute('hidden');
      $('[data-galleta="ajustar"]', caja).setAttribute('aria-expanded', 'true');
      caja.setAttribute('data-visible', 'true');
      caja.scrollIntoView({ block: 'nearest' });
    });
  }

  /* ------------------------------------------------------------------- mapa */
  /* El iframe no se escribe hasta que hay consentimiento: así el mapa no
     descarga nada de Google antes de tiempo. */
  function cargaMapa(hueco) {
    var src = hueco.getAttribute('data-mapa');
    if (!src || hueco.getAttribute('data-cargado') === '1') return;
    hueco.setAttribute('data-cargado', '1');
    hueco.className = 'mapa';
    hueco.innerHTML = '<iframe src="' + esc(src) + '" loading="lazy" title="' +
      esc(hueco.getAttribute('data-titulo') || 'Mapa de situación') +
      '" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
  }

  function pintaMapas() {
    var c = consentimiento();
    $$('[data-mapa]').forEach(function (h) {
      if (c && c.mapas) { cargaMapa(h); return; }
      h.className = 'mapa-bloqueado';
      h.innerHTML =
        icono('mapa', 34) +
        '<p>El mapa lo sirve Google. Para verlo aquí hay que aceptar las cookies de mapas.</p>' +
        '<button class="boton boton--pequeno" type="button" data-permitir-mapa>Ver el mapa</button>' +
        '<p style="margin-top:1rem"><a class="enlace-flecha" href="' + esc(h.getAttribute('data-maps') || '#') +
        '" target="_blank" rel="noopener noreferrer">Abrirlo en Google Maps ' + icono('flecha', 16) + '</a></p>';
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('[data-permitir-mapa]')) return;
      var p = consentimiento() || { necesarias: true };
      p.mapas = true;
      guardaConsentimiento(p);
      $$('[data-mapa]').forEach(cargaMapa);
    });
  }

  /* -------------------------------------------------------------- analítica */
  function arrancaAnalitica() {
    var a = B.legal.analitica;
    if (!a || !a.id || window.__xtAnalitica) return;
    window.__xtAnalitica = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(a.id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', a.id, { anonymize_ip: true });
  }

  /** Conversión medida sólo si el visitante aceptó medición. */
  function mide(evento, datos) {
    var c = consentimiento();
    if (!c || !c.medicion || !window.gtag) return;
    window.gtag('event', evento, datos || {});
  }

  /* ----------------------------------------------------------------- rating */
  /* Nota de Google en vivo, con respaldo del manifiesto si la función falla. */
  function pintaRating() {
    var nodos = $$('[data-rating]');
    if (!nodos.length) return;
    var r = B.resenas;

    function pinta(nota, total, envivo) {
      nodos.forEach(function (n) {
        var tipo = n.getAttribute('data-rating');
        if (tipo === 'nota') n.textContent = nota.toFixed(1).replace('.', ',');
        else if (tipo === 'total') n.textContent = P.numero(total) + ' reseñas en Google';
        else if (tipo === 'estrellas') n.innerHTML = P.estrellas(nota, 18);
        n.removeAttribute('data-cargando');
        if (envivo) n.setAttribute('data-envivo', '1');
      });
    }

    pinta(r.valoracion, r.total, false);

    var cache = P.almacen.lee('xtreme.rating', null);
    if (cache && Date.now() - cache.t < 6 * 3600 * 1000) {
      pinta(cache.nota, cache.total, true);
      return;
    }
    fetch(R('/api/rating'), { headers: { accept: 'application/json' } })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (d) {
        if (!d || typeof d.rating !== 'number') return;
        pinta(d.rating, d.total || r.total, true);
        P.almacen.guarda('xtreme.rating', { nota: d.rating, total: d.total || r.total, t: Date.now() });
      })
      .catch(function () { /* se queda el respaldo del manifiesto */ });
  }

  /* ---------------------------------------------------------------- arranque */
  function arranca() {
    pintaCabecera();
    pintaPromo();
    document.dispatchEvent(new CustomEvent('xt:cabecera'));
  }

  function arrancaTarde() {
    pintaPie();
    pintaGalletas();
    pintaMapas();
    montaApariciones();
    montaContadores();
    pintaRating();
  }

  window.XT = {
    $: $, $$: $$, crea: crea, retrasa: retrasa, sinMovimiento: sinMovimiento,
    mide: mide, consentimiento: consentimiento, MENU: MENU,
    montaApariciones: montaApariciones, arranca: arranca, arrancaTarde: arrancaTarde
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { arranca(); arrancaTarde(); });
  } else { arranca(); arrancaTarde(); }
})();
