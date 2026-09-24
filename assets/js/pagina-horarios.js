/* =============================================================================
   CUADRO DE CLASES — semana por delante, plazas libres e inscripción.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, T = window.XT, S = window.XS, D = window.XD;
  var hueco = document.querySelector('[data-agenda]');
  if (!B || !P || !S || !hueco) return;

  var esc = P.esc, icono = P.icono, R = P.ruta;
  var A = B.agenda;
  var DIAS = 14;                      // dos semanas por delante
  var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  var seleccionado = P.iso(hoy);
  var centroFiltro = 'todos';

  function fechas() {
    var out = [], i, f;
    for (i = 0; i < DIAS; i++) {
      f = new Date(hoy); f.setDate(hoy.getDate() + i);
      out.push(f);
    }
    return out;
  }

  function sesionesDe(isoFecha) {
    var f = P.deIso(isoFecha);
    var d = P.diaSemana(f);
    return A.horario
      .filter(function (s) { return s.dia === d; })
      .filter(function (s) { return centroFiltro === 'todos' || s.centro === centroFiltro; })
      .sort(function (a, b) { return a.hora < b.hora ? -1 : 1; });
  }

  /* Una clase se puede reservar hasta la hora a la que empieza. */
  function yaPaso(isoFecha, hora) {
    var f = P.deIso(isoFecha);
    var p = hora.split(':');
    f.setHours(+p[0], +p[1], 0, 0);
    return f <= new Date();
  }

  function pinta() {
    var lista = fechas();
    var centros = B.centros.map(function (c) {
      return '<option value="' + esc(c.id) + '"' + (centroFiltro === c.id ? ' selected' : '') + '>' +
        esc(c.nombre) + ' · ' + esc(c.zona) + '</option>';
    }).join('');

    hueco.innerHTML =
      (A.demo ? '<p class="aviso-precio" style="margin-bottom:var(--e-5)">' + icono('aviso', 16) +
        'Cuadro horario de ejemplo: pendiente de sustituir por el real del club.</p>' : '') +

      '<div class="ocupacion__mandos">' +
        '<label class="solo-lector" for="ag-centro">Centro</label>' +
        '<select class="selector" id="ag-centro">' +
          '<option value="todos">Los tres centros</option>' + centros +
        '</select>' +
        '<span class="ocupacion__estado" id="ag-quien"></span>' +
      '</div>' +

      '<div class="agenda__dias" role="group" aria-label="Elegir día">' +
        lista.map(function (f) {
          var iso = P.iso(f);
          var n = sesionesDe(iso).length;
          return '<button class="agenda__dia" type="button" data-fecha="' + iso + '" ' +
            'aria-pressed="' + (iso === seleccionado) + '">' +
            '<small>' + esc(P.DIAS_CORTOS[f.getDay()]) + '</small>' +
            '<b>' + f.getDate() + '</b>' +
            '<small>' + (n ? n + ' cl.' : '—') + '</small>' +
          '</button>';
        }).join('') +
      '</div>' +

      '<div id="ag-sesiones" role="status" aria-live="polite"></div>';

    document.getElementById('ag-centro').addEventListener('change', function () {
      centroFiltro = this.value; pinta();
    });
    hueco.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fecha]');
      if (!b) return;
      seleccionado = b.getAttribute('data-fecha');
      Array.prototype.slice.call(hueco.querySelectorAll('[data-fecha]')).forEach(function (x) {
        x.setAttribute('aria-pressed', String(x === b));
      });
      pintaSesiones();
    });

    pintaSesiones();
    pintaQuien();
  }

  function pintaQuien() {
    var n = document.getElementById('ag-quien');
    if (!n) return;
    var s = S.sesion();
    n.innerHTML = s
      ? '<i></i> Reservando como <b style="color:var(--hueso);margin-left:.25rem">' + esc(s.nombre) + '</b>'
      : '<a class="enlace-flecha" href="' + R('/area-socio.html') + '">Identifícate para reservar ' +
        icono('flecha', 16) + '</a>';
  }

  function pintaSesiones() {
    var caja = document.getElementById('ag-sesiones');
    var ses = sesionesDe(seleccionado);
    var f = P.deIso(seleccionado);

    if (!ses.length) {
      caja.innerHTML =
        '<div class="vacio">' + icono('calendario', 34) +
          '<h3>No hay clases este día</h3>' +
          '<p>El ' + esc(P.fechaLarga(f)) + ' no hay clases dirigidas' +
          (centroFiltro !== 'todos' ? ' en este centro' : '') +
          '. La sala, eso sí, sigue abierta las 24 horas.</p>' +
          '<a class="boton boton--fantasma" href="' + R('/centros.html') + '">Ver los centros</a>' +
        '</div>';
      return;
    }

    caja.innerHTML =
      '<h2 style="font-size:var(--t-2);margin:var(--e-6) 0 var(--e-4)">' +
        esc(P.mayus(P.fechaLarga(f))) + '</h2>' +
      ses.map(function (s) { return filaSesion(s, seleccionado); }).join('');
  }

  function filaSesion(s, iso) {
    var c = P.claseDe(s.clase) || { nombre: s.clase, duracion: 0 };
    var centro = P.centroDe(s.centro) || { nombre: s.centro };
    var plazas = s.plazas || A.plazasPorDefecto;
    var cogidas = S.ocupadas(iso, s.hora, s.clase, s.centro);
    var libres = Math.max(0, plazas - cogidas);
    var mia = S.tengo(iso, s.hora, s.clase, s.centro);
    var pasada = yaPaso(iso, s.hora);

    var estado = libres === 0 ? 'lleno' : libres <= 4 ? 'pocas' : 'ok';
    var textoPlazas = libres === 0 ? 'Sin plazas'
      : libres === 1 ? 'Queda 1 plaza' : 'Quedan ' + libres + ' plazas';

    var boton;
    if (mia) {
      boton = '<button class="boton boton--fantasma boton--pequeno" type="button" ' +
        'data-cancelar="' + esc(S.idDe(iso, s.hora, s.clase, s.centro)) + '">Cancelar</button>';
    } else if (pasada) {
      boton = '<span class="sesion__aviso">Empezada</span>';
    } else if (libres === 0) {
      boton = '<button class="boton boton--pequeno" type="button" disabled>Completa</button>';
    } else {
      boton = '<button class="boton boton--pequeno" type="button" data-apuntar=\'' +
        esc(JSON.stringify({ fecha: iso, hora: s.hora, clase: s.clase, centro: s.centro, monitor: s.monitor })) +
        '\'>Reservar</button>';
    }

    return '<div class="sesion"' + (mia ? ' data-reservada="true"' : '') +
      (pasada && !mia ? ' data-pasada="true"' : '') + '>' +
      '<span class="sesion__hora">' + esc(s.hora) + '</span>' +
      '<div class="sesion__info">' +
        '<b>' + esc(c.nombre) + '</b>' +
        '<div class="sesion__meta">' +
          '<span>' + icono('pin', 14) + ' ' + esc(centro.nombre) + '</span>' +
          '<span>' + icono('reloj', 14) + ' ' + P.minutos(c.duracion) + '</span>' +
          (s.monitor ? '<span>' + icono('persona', 14) + ' ' + esc(s.monitor) + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<span class="sesion__plazas" data-estado="' + estado + '"><i></i>' +
        (mia ? 'Tienes plaza' : textoPlazas) + '</span>' +
      boton +
    '</div>';
  }

  /* ---------------------------------------------------------------- eventos */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-apuntar]');
    if (a) {
      var datos = JSON.parse(a.getAttribute('data-apuntar'));
      if (!S.sesion()) {
        sessionStorage.setItem('xtreme.volver', location.pathname + location.search);
        location.href = R('/area-socio.html') + '?volver=1';
        return;
      }
      a.setAttribute('data-cargando', 'true');
      a.disabled = true;
      S.apunta(datos).then(function (res) {
        a.removeAttribute('data-cargando');
        a.disabled = false;
        if (!res.ok && res.motivo === 'sin-espacio') {
          alert('Tu navegador no deja guardar la reserva (¿navegación privada?). ' +
            'Llámanos al ' + B.contacto.telefono + ' y te apuntamos nosotros.');
          return;
        }
        if (!res.ok && res.motivo === 'base') {
          alert((res.error || 'No se ha podido reservar.') +
            '\n\nSi no lo consigues, llámanos al ' + B.contacto.telefono + '.');
          pintaSesiones();
          return;
        }
        if (res.ok && window.XT) window.XT.mide('reserva_clase', { clase: datos.clase, centro: datos.centro });
        pintaSesiones();
      });
      return;
    }
    var c = e.target.closest('[data-cancelar]');
    if (c) {
      c.disabled = true;
      S.cancela(c.getAttribute('data-cancelar')).then(pintaSesiones);
    }
  });

  document.addEventListener('xt:socio', function () { pintaQuien(); pintaSesiones(); });

  pinta();
  /* Con base de datos, las plazas libres son las de todos los socios y se
     refrescan solas (cada 30 s y al volver a la pestaña). */
  if (D && D.activo) {
    D.alCambiar(function () { if (document.getElementById('ag-sesiones')) pintaSesiones(); });
    D.vigilaPlazas();
  }
  if (T) T.montaApariciones();
})();
