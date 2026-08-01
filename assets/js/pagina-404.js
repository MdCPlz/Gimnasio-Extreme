/* =============================================================================
   404 — atajos a lo que sí existe, sacados del propio menú.
   ========================================================================== */
(function () {
  'use strict';

  var P = window.XP, T = window.XT;
  var caja = document.getElementById('atajos-404');
  if (!P || !caja || !T) return;

  var destacados = ['/clases.html', '/tarifas.html', '/horarios.html', '/contacto.html'];
  var menu = T.MENU.filter(function (m) { return destacados.indexOf(m.href) > -1; });

  caja.innerHTML =
    '<a class="boton" href="' + P.ruta('/index.html') + '">Volver al inicio</a>' +
    menu.map(function (m) {
      return '<a class="boton boton--fantasma" href="' + P.ruta(m.href) + '">' +
        P.esc(m.texto) + '</a>';
    }).join('');
})();
