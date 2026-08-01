/* =============================================================================
   INTRO CINEMATOGRÁFICA — se recorre con el scroll antes de llegar a la portada.
   Se salta sola si: el visitante ya la vio hoy, pide menos movimiento, viene con
   un ancla en la URL, o entra desde otra página del sitio.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP;
  var hueco = document.querySelector('[data-intro]');
  if (!B || !P || !hueco) return;

  var cfg = B.intro || {};
  var CLAVE = 'xtreme.intro';

  function saltar() {
    hueco.remove();
    document.documentElement.removeAttribute('data-intro-activa');
  }

  var vistaHoy = P.almacen.lee(CLAVE, 0);
  var esHoy = vistaHoy && (Date.now() - vistaHoy) < 12 * 3600 * 1000;
  var interna = document.referrer && document.referrer.indexOf(location.host) > -1;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!cfg.activa || esHoy || interna || reduce || location.hash) { saltar(); return; }

  /* ------------------------------------------------------------------ pinta */
  var esc = P.esc, R = P.ruta;
  var fotogramas = (cfg.fotogramas || []).slice(0, 4);
  if (!fotogramas.length) { saltar(); return; }

  hueco.outerHTML =
    '<div class="intro" id="intro" role="region" aria-label="Presentación">' +
      '<div class="intro__pista">' +
        '<span class="intro__marca" aria-hidden="true">' + esc(cfg.marca || B.nombre) + '</span>' +
        fotogramas.map(function (f, i) {
          return '<div class="intro__fotograma" data-i="' + i + '">' +
            '<h2>' + esc(f.titulo) + '</h2><p>' + esc(f.texto) + '</p></div>';
        }).join('') +
      '</div>' +
      '<button class="intro__saltar" type="button">' + esc(cfg.saltarTexto || 'Saltar') + '</button>' +
      '<p class="intro__pista-scroll">Desliza</p>' +
      '<div class="intro__barra"><i></i></div>' +
    '</div>' +
    '<div class="intro-espacio" aria-hidden="true"></div>';

  var intro = document.getElementById('intro');
  var espacio = document.querySelector('.intro-espacio');
  var marca = intro.querySelector('.intro__marca');
  var barra = intro.querySelector('.intro__barra i');
  var pistaScroll = intro.querySelector('.intro__pista-scroll');
  var cuadros = Array.prototype.slice.call(intro.querySelectorAll('.intro__fotograma'));

  document.documentElement.setAttribute('data-intro-activa', '1');
  document.body.classList.add('sin-scroll');
  /* Volvemos arriba: si el navegador restauró la posición, la intro se vería a medias */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  /* soltamos el scroll en el siguiente cuadro, ya colocados arriba */
  requestAnimationFrame(function () { document.body.classList.remove('sin-scroll'); });

  var n = cuadros.length;
  var terminada = false;

  function termina() {
    if (terminada) return;
    terminada = true;
    P.almacen.guarda(CLAVE, Date.now());
    intro.style.transition = 'opacity 520ms ease';
    intro.style.opacity = '0';
    setTimeout(function () {
      intro.remove();
      if (espacio) espacio.remove();
      document.documentElement.removeAttribute('data-intro-activa');
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    }, 540);
  }

  function dibuja() {
    if (terminada) return;
    var alto = espacio ? espacio.offsetHeight - window.innerHeight : 0;
    var k = alto > 0 ? Math.min(1, Math.max(0, window.scrollY / alto)) : 1;

    barra.style.width = (k * 100).toFixed(1) + '%';
    if (pistaScroll) pistaScroll.style.opacity = k > 0.04 ? '0' : '1';

    /* Cada fotograma ocupa su tramo y aparece/desaparece con holgura.
       El primero es la excepción: tiene que estar ya visible antes de que
       nadie toque el scroll, o la web abre con la pantalla en negro. */
    cuadros.forEach(function (c, i) {
      var desde = i / n, hasta = (i + 1) / n;
      var local = (k - desde) / (hasta - desde);
      var t = Math.min(1, Math.max(0, local));          // recortado a 0-1
      var op = 0, y = 0, escala = 1;

      if (local >= -0.35 && local <= 1.35) {
        var entrada = (i === 0) ? 1 : Math.min(1, Math.max(0, local / 0.22));
        var salida = local > 0.78 ? Math.max(0, (1 - local) / 0.22) : 1;
        op = Math.min(entrada, salida);
        /* el primero sólo sube; los demás entran desde abajo y salen por arriba */
        y = (i === 0) ? -t * 23 : (0.5 - t) * 46;
        escala = 0.985 + t * 0.03;
      }
      c.style.opacity = op.toFixed(3);
      c.style.transform = 'translateY(' + y.toFixed(1) + 'px) scale(' + escala.toFixed(3) + ')';
    });

    /* el rótulo de marca crece y se desvanece al final */
    var mk = Math.min(1, Math.max(0, (k - 0.55) / 0.45));
    marca.style.opacity = (mk * 0.85).toFixed(3);
    marca.style.transform = 'translate(-50%, -50%) scale(' + (0.86 + mk * 0.5).toFixed(3) + ')';

    if (k >= 0.995) termina();
  }

  var tic = false;
  function alScroll() {
    if (tic) return;
    tic = true;
    requestAnimationFrame(function () { dibuja(); tic = false; });
  }

  window.addEventListener('scroll', alScroll, { passive: true });
  window.addEventListener('resize', alScroll);
  intro.querySelector('.intro__saltar').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'auto' });
    termina();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !terminada) { window.scrollTo(0, 0); termina(); }
  });

  dibuja();
})();
