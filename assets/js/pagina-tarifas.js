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
              (d.porcentaje ? '<span>−' + d.porcentaje + ' % sobre la cuota</span>'
                 : d.precioDesde ? '<span>desde ' + P.euros(d.precioDesde) + ' al mes</span>' : '') +
              '<p>' + esc(d.nota) + '</p></div>';
          }).join('') +
        '</div>' +

        /* ------------------------------------------------- artes marciales */
        (t.artesMarciales ?
          '<div class="seccion__cabecera" style="margin-top:var(--e-9);margin-bottom:var(--e-5)" data-anima>' +
            '<h3>' + esc(t.artesMarciales.titulo) + '</h3>' +
            '<p style="font-size:var(--t-0)">' + esc(t.artesMarciales.texto) + '</p>' +
          '</div>' +
          '<div class="extras__lista" data-anima>' +
            t.artesMarciales.cuotas.map(function (c) {
              var centro = P.centroDe(c.centro);
              return '<div class="extra">' +
                '<span class="extra__nombre">' + esc(c.nombre) +
                  (centro ? ' <small style="font-weight:400;color:var(--texto-suave)">· ' +
                    esc(centro.nombre) + '</small>' : '') + '</span>' +
                '<p class="extra__nota">' + esc(c.horario) + ' · ' + esc(c.edad) +
                  (c.nota ? ' · ' + esc(c.nota) : '') +
                  (c.matricula ? ' · Matrícula ' + P.euros(c.matricula) : ' · Sin matrícula') +
                  '</p>' +
                '<span class="extra__precio"><b>' + P.euros(c.precio) +
                  '</b><small style="color:var(--texto-suave)">/mes</small></span>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<p class="letra-pequena" data-anima>' + esc(t.artesMarciales.nota) + '</p>'
        : '') +

        /* ---------------------------------------------- judo en colegios */
        (t.judoColegios ?
          '<div class="seccion__cabecera" style="margin-top:var(--e-9);margin-bottom:var(--e-5)" data-anima>' +
            '<h3>' + esc(t.judoColegios.titulo) + ' · ' + P.euros(t.judoColegios.precio) + ' al mes</h3>' +
            '<p style="font-size:var(--t-0)">' + esc(t.judoColegios.texto) + '</p>' +
          '</div>' +
          '<div class="colectivos" data-anima>' +
            t.judoColegios.colegios.map(function (c) {
              return '<div class="colectivo"><b>' + esc(c.nombre) + '</b>' +
                '<p>' + esc(c.horario) + '</p></div>';
            }).join('') +
          '</div>'
        : '') +
      '</div>';
  }

  /* ----------------------------------------------------------------- dudas */
  var preguntas = [
    { p: '¿La cuota vale para los tres gimnasios?',
      r: 'Sí. Una sola cuota abre los tres centros: el de la avenida del Cid Campeador (X1), el ' +
         'de la plaza Francisco Sarmiento (X2) y el de Valencia del Cid (X3). Entra en el que ' +
         'quieras, las veces que quieras.' },
    { p: '¿De verdad se puede entrar a las cuatro de la mañana?',
      r: 'Sí. La cuota general da acceso ilimitado las 24 horas del día, todos los días del año. ' +
         'Fuera del horario de recepción se entra con la llave de acceso, que cuesta 3 € una ' +
         'sola vez. La cuota de 14 a 17 años es de 06:00 a 24:00.' },
    { p: '¿Cuánto cuesta darse de alta?',
      r: 'La cuota mensual lleva 3 € de tarifa de inscripción. La trimestral y la semestral no ' +
         'llevan matrícula. Y si ya has sido socio y llevas menos de tres meses de baja, se te ' +
         'descuenta en cuanto te identifiques.' },
    { p: '¿Hay permanencia?',
      r: 'La mensual y la trimestral se renuevan solas y te das de baja cuando quieras. La ' +
         'semestral es la excepción: no se puede interrumpir una vez empezada.' },
    { p: '¿Las clases dirigidas cuestan aparte?',
      r: 'No. Las más de 40 clases semanales, las salas de entrenamiento virtual y la sauna ' +
         'están incluidas en cualquier cuota general. Sólo hay que reservar plaza, porque las ' +
         'salas tienen aforo. Las artes marciales sí van con cuota propia.' },
    { p: '¿Puedo probar antes de darme de alta?',
      r: 'Sí. Hay entrada de día por 9 €, bono de 7 días por 21,90 € y bono de 15 días por ' +
         '29,90 €. Los bonos incluyen la pulsera de acceso a los tres gimnasios y no cubren ' +
         'las artes marciales.' },
    { p: 'Somos varios en casa, ¿hay descuento?',
      r: 'Sí. Cónyuges e hijos de 14 a 22 años: el primero paga su cuota completa y el resto ' +
         'la mensual a mitad de precio. Hay que darse de alta todos y acreditar el parentesco ' +
         'con el libro de familia o el documento de pareja de hecho desde el área privada. Las ' +
         'artes marciales quedan fuera de este descuento.' }
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
