/* =============================================================================
   SECCIONES DE LA PORTADA — instalaciones, clases, cuotas, reseñas, equipo,
   centros y cierre. Todo se pinta desde lib/manifest.js.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, C = window.XC;
  if (!B || !P || !C) return;
  var esc = P.esc, icono = P.icono, R = P.ruta;

  function $(s) { return document.querySelector(s); }
  function pon(sel, html) { var n = $(sel); if (n) n.innerHTML = html; return n; }

  function cabecera(id, titulillo, titulo, texto, centrada) {
    return '<div class="seccion__cabecera' + (centrada ? ' seccion__cabecera--centrada' : '') + '" data-anima>' +
      '<p class="titulillo">' + esc(titulillo) + '</p>' +
      '<h2 id="' + id + '">' + esc(titulo) + '</h2>' +
      (texto ? '<p>' + esc(texto) + '</p>' : '') +
    '</div>';
  }

  /* ------------------------------------------------------- cinta de marcas */
  (function cintaMarcas() {
    var h = document.querySelector('[data-cinta-marcas]');
    if (!h) return;
    var marcas = B.instalaciones.equipamiento.marcas || [];
    if (!marcas.length) { h.remove(); return; }
    var grupo = '<div class="cinta__grupo">' +
      marcas.map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</div>';
    h.outerHTML = '<div class="cinta" aria-hidden="true"><div class="cinta__pista">' +
      grupo + grupo + '</div></div>' +
      '<p class="solo-lector">Equipamiento de ' + esc(marcas.join(', ')) + '.</p>';
  })();

  /* -------------------------------------------------------- instalaciones */
  (function instalaciones() {
    var i = B.instalaciones;
    pon('#instalaciones',
      '<div class="contenedor">' +
        cabecera('t-instalaciones', i.titulillo, i.titulo, i.texto) +
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
      '</div>');
  })();

  /* ---------------------------------------------------- clases destacadas */
  (function clases() {
    var destacadas = B.clases.filter(function (c) { return c.destacada; }).slice(0, 6);
    pon('#clases',
      '<div class="contenedor">' +
        cabecera('t-clases', 'Clases dirigidas',
          'Más de 40 clases a la semana',
          'De la barra al tatami. Todas entran en la cuota y todas se reservan desde aquí.') +
        '<div class="rejilla rejilla--3">' +
          destacadas.map(function (c, k) {
            return C.clase(c, { anima: true }).replace('data-anima',
              'data-anima data-retraso="' + Math.min(4, (k % 3) + 1) + '"');
          }).join('') +
        '</div>' +
        '<p style="margin-top:var(--e-6)" data-anima>' +
          '<a class="enlace-flecha" href="' + R('/clases.html') + '">Ver las ' + B.clases.length +
          ' clases y el cuadro horario ' + icono('flecha', 18) + '</a></p>' +
      '</div>');
  })();

  /* ------------------------------------------------------------- cuotas */
  (function cuotas() {
    var t = B.tarifas;
    var planes = t.planes.slice(0, 4);
    pon('#cuotas',
      '<div class="contenedor">' +
        cabecera('t-cuotas', t.titulillo, t.titulo, t.texto) +
        (t.aviso ? '<p class="aviso-precio">' + icono('aviso', 16) + esc(t.aviso) + '</p>' : '') +
        '<div class="planes">' +
          planes.map(function (p, k) {
            return C.plan(p, { anima: true }).replace('data-anima',
              'data-anima data-retraso="' + Math.min(4, k + 1) + '"');
          }).join('') +
        '</div>' +
        '<p style="margin-top:var(--e-6)" data-anima>' +
          '<a class="enlace-flecha" href="' + R('/tarifas.html') + '">Ver todo: bonos, entrenador personal y ' +
          'descuentos ' + icono('flecha', 18) + '</a></p>' +
      '</div>');
  })();

  /* ------------------------------------------------------------- reseñas */
  (function resenas() {
    var r = B.resenas;
    var visibles = r.opiniones.filter(function (o) { return o.publicar !== false; });
    if (!visibles.length) { var s = $('#resenas'); if (s) s.remove(); return; }

    /* el carrusel necesita el grupo repetido para que el bucle no tenga costura */
    var grupo = '<div class="carrusel__grupo">' +
      visibles.concat(visibles).map(C.resena).join('') + '</div>';

    pon('#resenas',
      '<div class="contenedor">' +
        '<div class="seccion__cabecera" data-anima>' +
          '<p class="titulillo">' + esc(r.titulillo) + '</p>' +
          '<h2 id="t-resenas">' + esc(r.titulo) + '</h2>' +
          '<div class="resenas__nota">' +
            '<span class="nota-grande"><span data-rating="nota">' +
              esc(r.valoracion.toFixed(1).replace('.', ',')) + '</span><small>/ 5</small></span>' +
            '<span data-rating="estrellas">' + P.estrellas(r.valoracion, 18) + '</span>' +
            '<span class="resenas__total" data-rating="total">' +
              P.numero(r.total) + ' reseñas en Google</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="carrusel" data-anima>' +
        '<div class="carrusel__pista">' + grupo + grupo + '</div>' +
      '</div>' +
      '<div class="contenedor" style="margin-top:var(--e-6)">' +
        '<a class="enlace-flecha" href="' + esc(r.urlPerfil) + '" target="_blank" ' +
          'rel="noopener noreferrer">Leerlas todas en Google ' + icono('flecha', 18) + '</a>' +
      '</div>');
  })();

  /* --------------------------------------------------------------- equipo */
  (function equipo() {
    var e = B.equipo;
    pon('#equipo',
      '<div class="contenedor">' +
        cabecera('t-equipo', e.titulillo, e.titulo, e.texto) +
        '<div class="equipo">' +
          e.miembros.slice(0, 6).map(function (m, k) {
            return C.monitor(m, { anima: true }).replace('data-anima',
              'data-anima data-retraso="' + Math.min(4, (k % 3) + 1) + '"');
          }).join('') +
        '</div>' +
        '<div class="empleo" data-anima>' +
          '<div><h3>' + esc(e.empleo.titulo) + '</h3><p>' + esc(e.empleo.texto) + '</p></div>' +
          '<a class="boton boton--fantasma" href="mailto:' + esc(e.empleo.email) + '">' +
            icono('correo', 18) + ' Enviar el currículum</a>' +
        '</div>' +
      '</div>');
  })();

  /* -------------------------------------------------------------- centros */
  (function centros() {
    pon('#centros',
      '<div class="contenedor">' +
        cabecera('t-centros', 'Dónde estamos',
          'Tres gimnasios, la misma tarjeta',
          'Entra en el que te pille de camino. El de la avenida del Cid, el de Francisco ' +
          'Sarmiento o el de Valencia del Cid: los tres, con la misma cuota.') +
        '<div class="rejilla rejilla--3">' +
          B.centros.map(function (x, k) {
            return C.centro(x, { anima: true }).replace('data-anima',
              'data-anima data-retraso="' + Math.min(4, k + 1) + '"');
          }).join('') +
        '</div>' +
      '</div>');
  })();

  /* --------------------------------------------------------------- cierre */
  (function cierre() {
    pon('#empezar',
      '<div class="contenedor contenedor-estrecho" style="text-align:center">' +
        '<div data-anima>' +
          '<p class="titulillo" style="justify-content:center">Empezar</p>' +
          '<h2 id="t-empezar">El primer día es el que cuesta</h2>' +
          '<p style="font-size:var(--t-1);max-width:46ch;margin-inline:auto;color:#40495A">' +
            'Ven a ver la sala, prueba una clase y decide después. Sin compromiso y sin que ' +
            'nadie te persiga con un contrato.</p>' +
          '<div class="portada__acciones" style="justify-content:center;margin-top:var(--e-6)">' +
            '<a class="boton" href="' + R('/reservar.html') + '">Reservar una visita</a>' +
            '<a class="boton boton--fantasma" href="tel:' + esc(B.contacto.telefonoTel) + '">' +
              icono('telefono', 18) + ' ' + esc(B.contacto.telefono) + '</a>' +
          '</div>' +
        '</div>' +
      '</div>');
  })();

  /* Las secciones se han pintado después de que el núcleo montara el observador:
     hay que volver a engancharlo para que las nuevas piezas aparezcan. */
  if (window.XT) window.XT.montaApariciones();
})();
