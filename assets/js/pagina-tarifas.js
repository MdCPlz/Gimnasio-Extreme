/* =============================================================================
   PÁGINA DE CUOTAS — planes con descuento, extras sueltos y colectivos.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, C = window.XC, T = window.XT;
  if (!B || !P || !C) return;
  var esc = P.esc, icono = P.icono, R = P.ruta;
  var t = B.tarifas;

  function $(s) { return document.querySelector(s); }

  /* ---------------------------------------------------------------- planes */
  var sec = $('#tarifas');
  if (sec) {
    sec.innerHTML =
      '<div class="contenedor">' +
        (t.aviso ? '<p class="aviso-precio" data-anima>' + icono('aviso', 16) + esc(t.aviso) + '</p>' : '') +
        '<div class="planes">' +
          t.planes.map(function (p, k) {
            return C.plan(p, { anima: true })
              .replace('data-anima', 'data-anima data-retraso="' + Math.min(4, k + 1) + '"');
          }).join('') +
        '</div>' +
        '<p class="letra-pequena" data-anima>' + esc(t.letraPequena) + '</p>' +
      '</div>';
  }

  /* ---------------------------------------------------------------- extras */
  var ex = $('#extras');
  if (ex) {
    ex.innerHTML =
      '<div class="contenedor">' +
        '<div class="seccion__cabecera" data-anima>' +
          '<p class="titulillo">Además de la cuota</p>' +
          '<h2 id="t-extras">Lo que se paga aparte</h2>' +
          '<p>Servicios sueltos, para quien no quiere atarse a una cuota o quiere ir ' +
            'un paso más allá.</p>' +
        '</div>' +
        '<div class="extras__lista" data-anima>' +
          t.extras.map(function (e) {
            var pc = P.descuento(e.precio, e.precioAntes);
            return '<div class="extra">' +
              '<span class="extra__nombre">' + esc(e.nombre) + '</span>' +
              '<p class="extra__nota">' + esc(e.nota) + '</p>' +
              '<span class="extra__precio">' +
                (e.precioAntes ? '<s>' + P.euros(e.precioAntes) + '</s>' : '') +
                '<b>' + P.euros(e.precio) + '</b>' +
                (pc ? '<span class="plan__descuento" style="position:static">−' + pc + ' %</span>' : '') +
              '</span>' +
            '</div>';
          }).join('') +
        '</div>' +

        '<div class="seccion__cabecera" style="margin-top:var(--e-9);margin-bottom:var(--e-5)" data-anima>' +
          '<h3>Precios especiales</h3>' +
        '</div>' +
        '<div class="colectivos" data-anima>' +
          t.descuentosColectivo.map(function (d) {
            return '<div class="colectivo"><b>' + esc(d.nombre) + '</b>' +
              '<span>−' + d.porcentaje + ' % sobre la cuota</span>' +
              '<p>' + esc(d.nota) + '</p></div>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  /* ----------------------------------------------------------------- dudas */
  var preguntas = [
    { p: '¿La cuota vale para los tres gimnasios?',
      r: 'Sí. Una sola cuota abre los tres centros: el de la avenida del Cid Campeador, el de la ' +
         'plaza Francisco Sarmiento y el de Valencia del Cid. Entra en el que quieras, las veces que quieras.' },
    { p: '¿De verdad se puede entrar a las cuatro de la mañana?',
      r: 'Sí. Los tres centros abren las 24 horas los 365 días del año. Fuera del horario de ' +
         'recepción se entra con la tarjeta de socio.' },
    { p: '¿Las clases dirigidas cuestan aparte?',
      r: 'No. Las más de 40 clases semanales están incluidas en cualquier cuota. Sólo hay que ' +
         'reservar plaza, porque las salas tienen aforo.' },
    { p: '¿Hay permanencia?',
      r: 'La cuota mensual no tiene permanencia: te das de baja cuando quieras. Las cuotas ' +
         'trimestral, semestral y anual se pagan por adelantado y por eso salen más baratas.' },
    { p: '¿Puedo congelar la cuota si me lesiono o me voy de viaje?',
      r: 'Sí, a partir de la cuota trimestral. Son 15 días al año en la trimestral y 30 en la ' +
         'semestral y la anual. Se pide en recepción.' },
    { p: '¿Qué incluye la sauna?',
      r: 'Está en los tres centros y entra en la cuota, sin coste extra ni reserva.' }
  ];

  var d = $('#dudas');
  if (d) {
    d.innerHTML =
      '<div class="contenedor contenedor-estrecho">' +
        '<div class="seccion__cabecera" data-anima>' +
          '<p class="titulillo">Dudas</p>' +
          '<h2 id="t-dudas">Lo que más nos preguntan</h2>' +
        '</div>' +
        '<div class="editor" data-anima>' +
          preguntas.map(function (q, i) {
            return '<details class="editor__ficha"' + (i === 0 ? ' open' : '') + '>' +
              '<summary>' + esc(q.p) + '</summary>' +
              '<div class="editor__campos"><p style="margin:0;color:var(--texto-suave)">' +
                esc(q.r) + '</p></div>' +
            '</details>';
          }).join('') +
        '</div>' +
        '<div class="empleo" data-anima style="margin-top:var(--e-8)">' +
          '<div><h3>¿Sigues con dudas?</h3>' +
            '<p>Llama al ' + esc(B.contacto.telefono) + ' o pásate por cualquiera de los tres ' +
            'centros. Te lo explicamos sin prisa.</p></div>' +
          '<a class="boton" href="' + R('/contacto.html') + '">Escribirnos</a>' +
        '</div>' +
      '</div>';
  }

  /* Preguntas frecuentes también para el buscador de Google */
  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas.map(function (q) {
      return { '@type': 'Question', name: q.p,
        acceptedAnswer: { '@type': 'Answer', text: q.r } };
    })
  });
  document.head.appendChild(ld);

  if (T) T.montaApariciones();
})();
