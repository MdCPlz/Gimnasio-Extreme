/* =============================================================================
   COMPONENTES — las piezas que se repiten en varias páginas: ficha de clase,
   plan de cuota, ficha de centro, monitor, reseña. Devuelven HTML.
   Expone window.XC.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP;
  if (!B || !P) return;
  var esc = P.esc, icono = P.icono, R = P.ruta;

  /* ------------------------------------------------------------ ficha clase */
  function clase(c, opciones) {
    var o = opciones || {};
    var cat = P.categoriaDe(c.categoria);
    var barras = '';
    for (var i = 1; i <= 5; i++) barras += '<i' + (i <= c.intensidad ? ' class="on"' : '') + '></i>';

    return '<article class="tarjeta clase" data-clase="' + esc(c.id) + '" ' +
        'data-categoria="' + esc(c.categoria) + '"' + (o.anima ? ' data-anima' : '') + '>' +
      '<div class="tarjeta__medio clase__medio">' +
        '<span class="clase__categoria">' + esc(cat ? cat.nombre : '') + '</span>' +
        P.foto({ webp: c.foto, jpg: c.fotoFallback, alt: c.alt, ancho: 880, alto: 660,
                 sizes: '(min-width: 64em) 30vw, (min-width: 48em) 46vw, 92vw' }) +
        '<button class="clase__lupa" type="button" data-ampliar="' + esc(c.id) + '" ' +
          'aria-label="Ampliar la foto de ' + esc(c.nombre) + '">' + icono('ampliar', 16) + '</button>' +
      '</div>' +
      '<div class="tarjeta__cuerpo">' +
        '<h3>' + esc(c.nombre) + '</h3>' +
        '<p class="clase__resumen">' + esc(c.resumen) + '</p>' +
        '<p class="clase__texto">' + esc(c.texto) + '</p>' +
        '<div class="clase__pie">' +
          '<span>' + icono('reloj', 15) + P.minutos(c.duracion) + '</span>' +
          '<span>' + icono('persona', 15) + esc(c.nivel) + '</span>' +
          '<span title="Intensidad ' + c.intensidad + ' de 5">' + icono('fuego', 15) +
            '<span class="intensidad" role="img" aria-label="Intensidad ' + c.intensidad + ' de 5">' +
            barras + '</span></span>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* ----------------------------------------------------------- plan de cuota */
  function plan(p, opciones) {
    var o = opciones || {};
    var pc = P.descuento(p.precio, p.precioAntes);
    return '<article class="plan' + (p.destacado ? ' plan--destacado' : '') + '"' +
        (o.anima ? ' data-anima' : '') + '>' +
      (p.etiqueta ? '<span class="plan__etiqueta">' + esc(p.etiqueta) + '</span>' : '') +
      (pc ? '<span class="plan__descuento">−' + pc + ' %</span>' : '') +
      '<h3>' + esc(p.nombre) + '</h3>' +
      '<div class="plan__precio">' +
        '<b>' + P.euros(p.precio) + '</b>' +
        '<i>' + esc(p.periodo) + '</i>' +
        (p.precioAntes ? '<s class="plan__antes">' + P.euros(p.precioAntes) + '</s>' : '') +
      '</div>' +
      '<p class="plan__resumen">' + esc(p.resumen) + '</p>' +
      '<ul>' + (p.incluye || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<a class="boton' + (p.destacado ? '' : ' boton--fantasma') + ' boton--ancho" ' +
        'href="' + esc(B.contacto.altaOnline) + '" target="_blank" rel="noopener noreferrer" ' +
        'data-mide="alta" data-plan="' + esc(p.id) + '">' + esc(p.cta) + '</a>' +
    '</article>';
  }

  /* ---------------------------------------------------------- ficha centro */
  function centro(x, opciones) {
    var o = opciones || {};
    return '<article class="tarjeta centro"' + (o.anima ? ' data-anima' : '') + '>' +
      '<div class="tarjeta__medio centro__medio">' +
        P.foto({ webp: x.foto, jpg: x.fotoFallback, alt: x.alt, ancho: 760, alto: 570,
                 sizes: '(min-width: 64em) 30vw, (min-width: 48em) 46vw, 92vw' }) +
      '</div>' +
      '<div class="tarjeta__cuerpo">' +
        '<p class="centro__zona">' + esc(x.zona) + '</p>' +
        '<h3>' + esc(x.nombre) + '</h3>' +
        '<address>' + esc(x.calle) + (x.detalle ? '<br>' + esc(x.detalle) : '') +
          '<br>' + esc(x.cp) + ' ' + esc(x.ciudad) + '</address>' +
        '<div class="centro__lineas">' +
          '<span class="centro__linea">' + icono('reloj', 16) +
            '<span class="veinticuatro">' + esc(x.horario) + '</span></span>' +
          '<span class="centro__linea">' + icono('telefono', 16) +
            '<a href="tel:' + esc(x.telefonoTel) + '">' + esc(x.telefono) + '</a></span>' +
        '</div>' +
        '<div class="centro__acciones">' +
          '<a class="boton boton--pequeno" href="' + esc(x.maps) + '" target="_blank" ' +
            'rel="noopener noreferrer">Cómo llegar</a>' +
          '<a class="boton boton--fantasma boton--pequeno" href="' + R('/reservar.html') +
            '?centro=' + esc(x.id) + '">Reservar visita</a>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* --------------------------------------------------------------- monitor */
  function monitor(m, opciones) {
    var o = opciones || {};
    return '<article class="monitor"' + (o.anima ? ' data-anima' : '') + '>' +
      '<div class="monitor__medio">' +
        P.foto({ webp: m.foto, jpg: m.fotoFallback, alt: m.alt, ancho: 640, alto: 800,
                 sizes: '(min-width: 64em) 30vw, 46vw' }) +
      '</div>' +
      '<div class="monitor__cuerpo">' +
        '<h3>' + esc(m.nombre) + '</h3>' +
        '<p class="monitor__esp">' + esc(m.especialidad) + '</p>' +
        '<p class="monitor__bio">' + esc(m.bio) + '</p>' +
      '</div>' +
    '</article>';
  }

  /* ---------------------------------------------------------------- reseña */
  function resena(r) {
    return '<figure class="resena">' +
      '<div class="resena__estrellas">' + P.estrellas(r.estrellas, 15) + '</div>' +
      '<blockquote>«' + esc(r.texto) + '»</blockquote>' +
      '<figcaption>' + icono('persona', 15) + '<b>' + esc(r.autor) + '</b> · Google</figcaption>' +
    '</figure>';
  }

  /* -------------------------------------------------------------- servicio */
  function servicio(s, opciones) {
    var o = opciones || {};
    return '<div class="servicio"' + (o.anima ? ' data-anima' : '') + '>' +
      '<div class="servicio__icono">' + icono(s.icono, 20) + '</div>' +
      '<div><h4>' + esc(s.titulo) + '</h4><p>' + esc(s.texto) + '</p></div>' +
    '</div>';
  }

  /* --------------------------------------------------- visor de ampliación */
  /* Un único visor para galería y para las fotos de clase. */
  var visor = null, lista = [], indice = 0, ultimoFoco = null;

  function creaVisor() {
    if (visor) return visor;
    visor = document.createElement('div');
    visor.className = 'visor';
    visor.setAttribute('data-abierto', 'false');
    visor.setAttribute('role', 'dialog');
    visor.setAttribute('aria-modal', 'true');
    visor.setAttribute('aria-label', 'Foto ampliada');
    visor.innerHTML =
      '<div class="visor__barra">' +
        '<span class="visor__contador"></span>' +
        '<button class="visor__cerrar" type="button" aria-label="Cerrar">' + icono('cerrar', 18) + '</button>' +
      '</div>' +
      '<div class="visor__lienzo">' +
        '<button class="visor__nav visor__nav--prev" type="button" aria-label="Anterior">' + icono('izquierda', 18) + '</button>' +
        '<img src="" alt="">' +
        '<button class="visor__nav visor__nav--sig" type="button" aria-label="Siguiente">' + icono('derecha', 18) + '</button>' +
      '</div>' +
      '<p class="visor__pie"></p>';
    document.body.appendChild(visor);

    visor.querySelector('.visor__cerrar').addEventListener('click', cierra);
    visor.querySelector('.visor__nav--prev').addEventListener('click', function () { mueve(-1); });
    visor.querySelector('.visor__nav--sig').addEventListener('click', function () { mueve(1); });
    visor.addEventListener('click', function (e) {
      if (e.target === visor || e.target.classList.contains('visor__lienzo')) cierra();
    });
    document.addEventListener('keydown', function (e) {
      if (visor.getAttribute('data-abierto') !== 'true') return;
      if (e.key === 'Escape') cierra();
      if (e.key === 'ArrowLeft') mueve(-1);
      if (e.key === 'ArrowRight') mueve(1);
      if (e.key === 'Tab') {
        var focos = Array.prototype.slice.call(visor.querySelectorAll('button'));
        var pri = focos[0], ult = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
        else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
      }
    });
    return visor;
  }

  function pinta() {
    var f = lista[indice];
    if (!f) return;
    var img = visor.querySelector('img');
    img.src = f.jpg || f.src;
    img.alt = f.alt || '';
    visor.querySelector('.visor__pie').textContent = f.alt || '';
    visor.querySelector('.visor__contador').textContent = (indice + 1) + ' / ' + lista.length;
    var soloUna = lista.length < 2;
    visor.querySelector('.visor__nav--prev').hidden = soloUna;
    visor.querySelector('.visor__nav--sig').hidden = soloUna;
  }

  function abre(fotos, i) {
    creaVisor();
    lista = fotos; indice = i || 0;
    ultimoFoco = document.activeElement;
    pinta();
    visor.setAttribute('data-abierto', 'true');
    document.body.classList.add('sin-scroll');
    visor.querySelector('.visor__cerrar').focus();
  }
  function cierra() {
    if (!visor) return;
    visor.setAttribute('data-abierto', 'false');
    document.body.classList.remove('sin-scroll');
    if (ultimoFoco) ultimoFoco.focus();
  }
  function mueve(d) {
    if (lista.length < 2) return;
    indice = (indice + d + lista.length) % lista.length;
    pinta();
  }

  /* Delegación: cualquier botón [data-ampliar] abre la foto de esa clase */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ampliar]');
    if (!b) return;
    var id = b.getAttribute('data-ampliar');
    var c = P.claseDe(id);
    if (!c) return;
    /* recorre todas las clases pintadas para poder pasar de una a otra */
    var pintadas = Array.prototype.slice.call(document.querySelectorAll('[data-clase]'))
      .map(function (n) { return P.claseDe(n.getAttribute('data-clase')); })
      .filter(Boolean)
      .map(function (x) { return { src: x.foto, jpg: x.fotoFallback, alt: x.nombre + ' · ' + x.resumen }; });
    var i = 0;
    Array.prototype.slice.call(document.querySelectorAll('[data-clase]')).forEach(function (n, k) {
      if (n.getAttribute('data-clase') === id) i = k;
    });
    abre(pintadas.length ? pintadas : [{ src: c.foto, jpg: c.fotoFallback, alt: c.alt }], i);
  });

  window.XC = {
    clase: clase, plan: plan, centro: centro, monitor: monitor,
    resena: resena, servicio: servicio, abreVisor: abre
  };
})();
