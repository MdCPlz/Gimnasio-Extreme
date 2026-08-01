/* =============================================================================
   GALERÍA — mosaico con visor ampliable, teclado y flechas.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, C = window.XC, T = window.XT;
  var rejilla = document.getElementById('galeria');
  if (!B || !P || !C || !rejilla) return;

  var esc = P.esc;
  var fotos = (B.galeria.fotos || []);

  if (!fotos.length) {
    rejilla.outerHTML = '<div class="vacio"><h3>Todavía no hay fotos</h3>' +
      '<p>Estamos preparando el reportaje de los tres centros.</p></div>';
    return;
  }

  rejilla.innerHTML = fotos.map(function (f, i) {
    return '<button class="galeria__pieza" type="button" data-i="' + i + '" ' +
      'aria-label="Ampliar: ' + esc(f.alt) + '"' + (i < 4 ? '' : ' data-anima') + '>' +
      P.foto({ webp: f.src, jpg: f.fallback, alt: f.alt, ancho: f.ancho, alto: f.alto,
               prioridad: i === 0,
               sizes: '(min-width: 64em) 28vw, (min-width: 48em) 33vw, 50vw' }) +
    '</button>';
  }).join('');

  var paraVisor = fotos.map(function (f) {
    return { src: f.src, jpg: f.fallback, alt: f.alt };
  });

  rejilla.addEventListener('click', function (e) {
    var b = e.target.closest('[data-i]');
    if (!b) return;
    C.abreVisor(paraVisor, +b.getAttribute('data-i'));
  });

  if (T) T.montaApariciones();
})();
