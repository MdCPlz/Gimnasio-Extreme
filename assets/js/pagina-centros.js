/* =============================================================================
   PÁGINA DE CENTROS — los tres gimnasios con mapa (bloqueado hasta consentir)
   y el detalle de las instalaciones.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, C = window.XC, T = window.XT;
  if (!B || !P || !C) return;
  var esc = P.esc, icono = P.icono, R = P.ruta;

  /* --------------------------------------------------------------- centros */
  var sec = document.getElementById('lista-centros');
  if (sec) {
    sec.innerHTML =
      '<div class="contenedor">' +
        B.centros.map(function (x, i) {
          var invertido = i % 2 === 1;
          return '<div class="rejilla rejilla--2" style="align-items:center;gap:var(--e-7);' +
              'margin-bottom:var(--e-9)" data-anima>' +
            '<div' + (invertido ? ' style="order:2"' : '') + '>' +
              '<p class="centro__zona">' + esc(x.zona) + '</p>' +
              '<h2 style="font-size:var(--t-3)">' + esc(x.nombre) + '</h2>' +
              '<address style="font-style:normal;color:var(--texto-suave);font-size:var(--t-1);' +
                'line-height:1.5;margin-bottom:var(--e-5)">' +
                esc(x.calle) + (x.detalle ? '<br>' + esc(x.detalle) : '') +
                '<br>' + esc(x.cp) + ' ' + esc(x.ciudad) + '</address>' +
              '<div class="centro__lineas">' +
                '<span class="centro__linea">' + icono('reloj', 16) +
                  '<span class="veinticuatro">' + esc(x.horario) + '</span></span>' +
                '<span class="centro__linea">' + icono('telefono', 16) +
                  '<a href="tel:' + esc(x.telefonoTel) + '">' + esc(x.telefono) + '</a></span>' +
                '<span class="centro__linea">' + icono('llave', 16) +
                  '<span>Entra con la misma tarjeta de socio</span></span>' +
              '</div>' +
              '<div class="centro__acciones" style="margin-top:var(--e-5)">' +
                '<a class="boton" href="' + esc(x.maps) + '" target="_blank" rel="noopener noreferrer">' +
                  icono('mapa', 18) + ' Cómo llegar</a>' +
                '<a class="boton boton--fantasma" href="' + R('/reservar.html') + '?centro=' +
                  esc(x.id) + '">Reservar una visita</a>' +
              '</div>' +
            '</div>' +
            '<div' + (invertido ? ' style="order:1"' : '') + '>' +
              '<div class="tarjeta__medio" style="border-radius:var(--radio-g);aspect-ratio:4/3">' +
                P.foto({ webp: x.foto, jpg: x.fotoFallback, alt: x.alt, ancho: 760, alto: 570,
                         sizes: '(min-width: 48em) 46vw, 92vw' }) +
              '</div>' +
              '<div data-mapa="' + esc(x.mapaEmbed) + '" data-maps="' + esc(x.maps) + '" ' +
                'data-titulo="Mapa de ' + esc(x.nombre) + '" style="margin-top:var(--e-4)"></div>' +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';
  }

  /* -------------------------------------------------------- instalaciones */
  var det = document.getElementById('instalaciones-detalle');
  if (det) {
    var i = B.instalaciones;
    det.innerHTML =
      '<div class="contenedor">' +
        '<div class="seccion__cabecera" data-anima>' +
          '<p class="titulillo">' + esc(i.titulillo) + '</p>' +
          '<h2 id="t-inst">' + esc(i.titulo) + '</h2>' +
          '<p>' + esc(i.texto) + '</p>' +
        '</div>' +
        '<div class="cifras" data-anima>' +
          i.cifras.map(function (c) {
            return '<div class="cifra"><b><span data-contador="' + c.valor + '">' +
              P.numero(c.valor) + '</span>' + esc(c.sufijo) + '</b>' +
              '<span>' + esc(c.etiqueta) + '</span></div>';
          }).join('') +
        '</div>' +
        '<div class="servicios" style="margin-top:var(--e-9)">' +
          i.servicios.map(function (s, k) {
            return C.servicio(s, { anima: true }).replace('<div class="servicio"',
              '<div class="servicio" data-retraso="' + Math.min(4, (k % 3) + 1) + '"');
          }).join('') +
        '</div>' +
        '<div class="empleo" data-anima style="margin-top:var(--e-9)">' +
          '<div><h3>' + esc(i.equipamiento.titulo) + '</h3>' +
            '<p>' + esc(i.equipamiento.texto) + '</p>' +
            '<p style="margin-top:var(--e-3);color:var(--lima);font-family:var(--tipo-titulo);' +
              'font-weight:700">' + esc(i.equipamiento.marcas.join(' · ')) + '</p></div>' +
        '</div>' +
      '</div>';
  }

  /* Esta página se pinta antes de que el núcleo haga su pasada (los scripts van
     al final del body), así que los mapas y las apariciones ya los engancha él. */
  if (T) T.montaApariciones();
})();
