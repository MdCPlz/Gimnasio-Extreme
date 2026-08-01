/* =============================================================================
   PORTADA — titular, datos y vídeo de fondo.
   El vídeo se carga DESPUÉS de pintar la página, sólo en pantallas grandes y
   sólo si la conexión no va justa. Si no llega, se queda el póster: la portada
   no depende de él para verse bien.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP;
  var hueco = document.querySelector('[data-portada]');
  if (!B || !P || !hueco) return;

  var esc = P.esc, icono = P.icono, R = P.ruta;
  var h = B.hero, v = h.video || {};

  var titulo = String(h.titulo || '').split('\n')
    .map(function (l) { return '<span>' + esc(l) + '</span>'; }).join('');

  var datos = (h.datos || []).map(function (d, i) {
    return '<div class="portada__dato" data-anima data-retraso="' + Math.min(4, i + 1) + '">' +
      '<b>' + esc(d.cifra) + esc(d.sufijo || '') + '</b>' +
      '<span>' + esc(d.etiqueta) + '</span></div>';
  }).join('');

  hueco.outerHTML =
    '<section class="portada" id="portada">' +
      '<div class="portada__fondo">' +
        '<picture>' +
          '<source srcset="' + esc(R(v.poster)) + '" type="image/webp">' +
          '<img src="' + esc(R(v.posterFallback)) + '" alt="' + esc(v.alt || '') + '" ' +
            'width="1600" height="900" fetchpriority="high" decoding="async">' +
        '</picture>' +
      '</div>' +
      '<span class="portada__gigante" aria-hidden="true">' + esc(h.palabraGigante) + '</span>' +
      '<div class="contenedor portada__interior">' +
        '<p class="portada__titulillo"><i aria-hidden="true"></i>' + esc(h.titulillo) + '</p>' +
        '<h1>' + titulo + '</h1>' +
        '<p class="portada__subtitulo">' + esc(h.subtitulo) + '</p>' +
        '<div class="portada__acciones">' +
          '<a class="boton" href="' + esc(R(h.ctaPrimario.href)) + '">' + esc(h.ctaPrimario.texto) + '</a>' +
          '<a class="boton boton--fantasma" href="' + esc(R(h.ctaSecundario.href)) + '">' +
            esc(h.ctaSecundario.texto) + ' ' + icono('flecha', 18) + '</a>' +
        '</div>' +
        '<div class="portada__datos">' + datos + '</div>' +
      '</div>' +
    '</section>';

  /* ------------------------------------------------------------------ vídeo */
  function cargaVideo() {
    if (!v.activo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 900) return;                 // en móvil, sólo póster
    var con = navigator.connection;
    if (con && (con.saveData || /2g|slow-2g/.test(con.effectiveType || ''))) return;

    var fondo = document.querySelector('.portada__fondo');
    if (!fondo) return;

    var video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true;
    video.autoplay = true; video.preload = 'auto';
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');
    video.poster = R(v.posterFallback || '');

    if (v.webm) video.appendChild(fuente(R(v.webm), 'video/webm'));
    if (v.mp4) video.appendChild(fuente(R(v.mp4), 'video/mp4'));

    /* si ninguna fuente carga, no tocamos nada y se queda el póster */
    video.addEventListener('canplay', function () {
      video.setAttribute('data-listo', 'true');
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* el navegador lo bloqueó: da igual */ });
    }, { once: true });
    video.addEventListener('error', function () { video.remove(); });

    fondo.appendChild(video);
  }

  function fuente(src, tipo) {
    var s = document.createElement('source');
    s.src = src; s.type = tipo;
    return s;
  }

  if (document.readyState === 'complete') setTimeout(cargaVideo, 400);
  else window.addEventListener('load', function () { setTimeout(cargaVideo, 400); });
})();
