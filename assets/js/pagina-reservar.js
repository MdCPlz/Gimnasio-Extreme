/* =============================================================================
   RESERVAR — servicio, centro, día y hora. Tres pasos y un resumen que se va
   rellenando. El aviso del hueco le llega al club por /api/reserva.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, T = window.XT, D = window.XD;
  var enBase = !!(D && D.activo);
  var hueco = document.querySelector('[data-reserva]');
  if (!B || !P || !hueco) return;

  var esc = P.esc, icono = P.icono, R = P.ruta;
  var Rs = B.reservas;
  var params = new URLSearchParams(location.search);

  var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  var tope = new Date(hoy); tope.setDate(hoy.getDate() + (Rs.diasAntelacionMax || 45));

  var elegido = {
    servicio: params.get('servicio') || '',
    centro: params.get('centro') || (B.centros[0] || {}).id,
    fecha: '',
    hora: ''
  };
  var mesVista = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  /* --------------------------------------------------------------- pintar */
  hueco.innerHTML =
    '<div class="pasos" id="rv-pasos"></div>' +
    '<div class="reserva">' +
      '<div>' +
        '<div class="aviso aviso--exito" id="rv-exito" hidden>' + icono('ok', 20) +
          '<span></span></div>' +
        '<div class="aviso aviso--error" id="rv-error" hidden>' + icono('aviso', 20) +
          '<span></span></div>' +

        '<h2 style="font-size:var(--t-2)">1 · ¿Qué quieres hacer?</h2>' +
        '<div class="opciones" id="rv-servicios" role="radiogroup" aria-label="Servicio"></div>' +

        '<h2 style="font-size:var(--t-2);margin-top:var(--e-8)">2 · ¿En qué centro?</h2>' +
        '<div class="opciones" id="rv-centros" role="radiogroup" aria-label="Centro"></div>' +

        '<h2 style="font-size:var(--t-2);margin-top:var(--e-8)">3 · ¿Qué día y a qué hora?</h2>' +
        '<div class="rejilla rejilla--2" style="gap:var(--e-5);align-items:start">' +
          '<div class="calendario" id="rv-calendario"></div>' +
          '<div>' +
            '<p class="campo__ayuda" id="rv-horas-titulo" style="margin-bottom:var(--e-3)">' +
              'Elige primero un día.</p>' +
            '<div class="horas" id="rv-horas"></div>' +
          '</div>' +
        '</div>' +

        '<h2 style="font-size:var(--t-2);margin-top:var(--e-8)">4 · Tus datos</h2>' +
        '<form class="formulario" id="rv-form" novalidate>' +
          '<div class="campo--doble">' +
            '<div class="campo"><label for="rv-nombre">Nombre <span class="req">*</span></label>' +
              '<input type="text" id="rv-nombre" name="nombre" required autocomplete="name" ' +
                'placeholder="Cómo te llamas" aria-describedby="rv-nombre-err">' +
              '<p class="campo__error" id="rv-nombre-err">' + icono('aviso', 14) +
                '<span>Necesitamos tu nombre para esperarte.</span></p></div>' +
            '<div class="campo"><label for="rv-telefono">Teléfono <span class="req">*</span></label>' +
              '<input type="tel" id="rv-telefono" name="telefono" required autocomplete="tel" ' +
                'placeholder="600 000 000" aria-describedby="rv-telefono-err">' +
              '<p class="campo__error" id="rv-telefono-err">' + icono('aviso', 14) +
                '<span>Un teléfono por si hay que avisarte de algo.</span></p></div>' +
          '</div>' +
          '<div class="campo"><label for="rv-email">Correo <span class="req">*</span></label>' +
            '<input type="email" id="rv-email" name="email" required autocomplete="email" ' +
              'placeholder="tucorreo@ejemplo.com" aria-describedby="rv-email-err">' +
            '<p class="campo__error" id="rv-email-err">' + icono('aviso', 14) +
              '<span>Revisa el correo: ahí te mandamos la confirmación.</span></p></div>' +
          '<div class="campo"><label for="rv-nota">Algo que debamos saber</label>' +
            '<textarea id="rv-nota" name="nota" placeholder="Lesiones, objetivos, si vienes acompañado…"></textarea></div>' +
          '<div class="campo">' +
            '<div class="casilla"><input type="checkbox" id="rv-rgpd" name="rgpd" required>' +
              '<label for="rv-rgpd">Acepto la <a href="' + R('/legal/privacidad.html') +
                '">política de privacidad</a>.</label></div>' +
            '<p class="campo__error" id="rv-rgpd-err">' + icono('aviso', 14) +
              '<span>Sin esto no podemos guardar tu cita.</span></p>' +
          '</div>' +
          '<div class="trampa" aria-hidden="true">' +
            '<label for="rv-web">No rellenar</label>' +
            '<input type="text" id="rv-web" name="web" tabindex="-1" autocomplete="off"></div>' +
          '<button class="boton boton--ancho" type="submit" id="rv-enviar" disabled>' +
            'Confirmar la cita</button>' +
          '<p class="campo__ayuda">' + esc(Rs.politica) + '</p>' +
        '</form>' +
      '</div>' +

      '<aside class="reserva__resumen" data-anima>' +
        '<h3>Tu cita</h3>' +
        '<div class="reserva__fila"><span>Servicio</span><b id="rs-servicio"></b></div>' +
        '<div class="reserva__fila"><span>Centro</span><b id="rs-centro"></b></div>' +
        '<div class="reserva__fila"><span>Día</span><b id="rs-fecha"></b></div>' +
        '<div class="reserva__fila"><span>Hora</span><b id="rs-hora"></b></div>' +
        '<div class="reserva__fila"><span>Duración</span><b id="rs-duracion"></b></div>' +
        '<p class="letra-pequena" style="margin-top:var(--e-5)">Recibirás la confirmación por ' +
          'correo. Si no puedes venir, avísanos con 12 horas.</p>' +
      '</aside>' +
    '</div>';

  /* ------------------------------------------------------------- opciones */
  document.getElementById('rv-servicios').innerHTML = Rs.servicios.map(function (s) {
    return '<div class="opcion">' +
      '<input type="radio" name="servicio" id="sv-' + esc(s.id) + '" value="' + esc(s.id) + '"' +
        (elegido.servicio === s.id ? ' checked' : '') + '>' +
      '<label for="sv-' + esc(s.id) + '"><b>' + esc(s.nombre) + '</b>' +
        '<span>' + esc(s.texto) + '</span>' +
        '<em>' + P.minutos(s.duracion) + '</em></label>' +
    '</div>';
  }).join('');

  document.getElementById('rv-centros').innerHTML = B.centros.map(function (x) {
    return '<div class="opcion">' +
      '<input type="radio" name="centro" id="ct-' + esc(x.id) + '" value="' + esc(x.id) + '"' +
        (elegido.centro === x.id ? ' checked' : '') + '>' +
      '<label for="ct-' + esc(x.id) + '"><b>' + esc(x.nombre) + '</b>' +
        '<span>' + esc(x.calle) + ' · ' + esc(x.zona) + '</span></label>' +
    '</div>';
  }).join('');

  /* ----------------------------------------------------------- calendario */
  function franjasDe(f) {
    var d = f.getDay();
    if (d === 0) return Rs.franjas.domingo || [];
    if (d === 6) return Rs.franjas.sabado || [];
    return Rs.franjas.laborables || [];
  }

  function pintaCalendario() {
    var caja = document.getElementById('rv-calendario');
    var primero = new Date(mesVista.getFullYear(), mesVista.getMonth(), 1);
    var dias = new Date(mesVista.getFullYear(), mesVista.getMonth() + 1, 0).getDate();
    var arranque = (primero.getDay() + 6) % 7;              // lunes = 0
    var puedeAtras = mesVista > new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    var puedeAlante = mesVista < new Date(tope.getFullYear(), tope.getMonth(), 1);

    var celdas = '';
    for (var i = 0; i < arranque; i++) celdas += '<span class="dia dia--vacio"></span>';
    for (var d = 1; d <= dias; d++) {
      var f = new Date(mesVista.getFullYear(), mesVista.getMonth(), d);
      var iso = P.iso(f);
      var libre = f >= hoy && f <= tope && franjasDe(f).length > 0;
      celdas += '<button class="dia" type="button" data-dia="' + iso + '"' +
        (libre ? '' : ' disabled') +
        (iso === P.iso(hoy) ? ' data-hoy="true"' : '') +
        ' aria-pressed="' + (elegido.fecha === iso) + '"' +
        ' aria-label="' + esc(P.fechaLarga(f)) + (libre ? '' : ', sin horas') + '">' + d + '</button>';
    }

    caja.innerHTML =
      '<div class="calendario__barra">' +
        '<b>' + esc(P.mayus(P.MESES[mesVista.getMonth()])) + ' ' + mesVista.getFullYear() + '</b>' +
        '<div class="calendario__nav">' +
          '<button type="button" data-mes="-1"' + (puedeAtras ? '' : ' disabled') +
            ' aria-label="Mes anterior">' + icono('izquierda', 16) + '</button>' +
          '<button type="button" data-mes="1"' + (puedeAlante ? '' : ' disabled') +
            ' aria-label="Mes siguiente">' + icono('derecha', 16) + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="calendario__rejilla">' +
        ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(function (x, i) {
          return '<abbr title="' + esc(P.DIAS_LARGOS[(i + 1) % 7]) + '">' + x + '</abbr>';
        }).join('') +
        celdas +
      '</div>';
  }

  function pintaHoras() {
    var caja = document.getElementById('rv-horas');
    var titulo = document.getElementById('rv-horas-titulo');
    if (!elegido.fecha) {
      caja.innerHTML = '';
      titulo.textContent = 'Elige primero un día.';
      return;
    }
    var f = P.deIso(elegido.fecha);
    var franjas = franjasDe(f);
    titulo.textContent = 'Horas libres el ' + P.fechaLarga(f) + '.';

    var esHoy = elegido.fecha === P.iso(hoy);
    var ahoraMin = new Date().getHours() * 60 + new Date().getMinutes();

    caja.innerHTML = franjas.map(function (h) {
      var p = h.split(':');
      var pasada = esHoy && (+p[0] * 60 + +p[1]) < ahoraMin + 60;
      var cogida = enBase && D.huecoCogido(elegido.centro, elegido.fecha, h);
      return '<button class="hora" type="button" data-hora="' + esc(h) + '"' +
        (pasada || cogida ? ' disabled' : '') +
        (cogida ? ' title="Ya reservada" aria-label="' + esc(h) + ', ya reservada"' : '') +
        ' aria-pressed="' + (elegido.hora === h) + '">' + esc(h) + '</button>';
    }).join('');

    if (!franjas.filter(function (h) {
      var p = h.split(':');
      return !(esHoy && (+p[0] * 60 + +p[1]) < ahoraMin + 60) &&
        !(enBase && D.huecoCogido(elegido.centro, elegido.fecha, h));
    }).length) {
      caja.innerHTML = '<p class="campo__ayuda">Ya no quedan horas este día. Prueba con el siguiente.</p>';
    }
  }

  /* -------------------------------------------------------------- resumen */
  function servicioActual() {
    return Rs.servicios.filter(function (s) { return s.id === elegido.servicio; })[0] || null;
  }

  function pintaResumen() {
    var s = servicioActual();
    var c = P.centroDe(elegido.centro);
    document.getElementById('rs-servicio').textContent = s ? s.nombre : '';
    document.getElementById('rs-centro').textContent = c ? c.nombre + ' · ' + c.zona : '';
    document.getElementById('rs-fecha').textContent = elegido.fecha
      ? P.fechaLarga(P.deIso(elegido.fecha)) : '';
    document.getElementById('rs-hora').textContent = elegido.hora || '';
    document.getElementById('rs-duracion').textContent = s ? P.minutos(s.duracion) : '';

    var completo = !!(elegido.servicio && elegido.centro && elegido.fecha && elegido.hora);
    document.getElementById('rv-enviar').disabled = !completo;

    var pasos = [
      { t: 'Servicio', ok: !!elegido.servicio },
      { t: 'Centro', ok: !!elegido.centro },
      { t: 'Día y hora', ok: !!(elegido.fecha && elegido.hora) },
      { t: 'Datos', ok: false }
    ];
    var activo = pasos.findIndex(function (p) { return !p.ok; });
    document.getElementById('rv-pasos').innerHTML = pasos.map(function (p, i) {
      return '<span class="paso"' + (p.ok ? ' data-hecho="true"' : '') +
        (i === activo ? ' data-activo="true"' : '') + '>' +
        '<i>' + (p.ok ? '✓' : i + 1) + '</i>' + esc(p.t) + '</span>';
    }).join('');
  }

  /* -------------------------------------------------------------- eventos */
  hueco.addEventListener('change', function (e) {
    if (e.target.name === 'servicio') { elegido.servicio = e.target.value; pintaResumen(); }
    if (e.target.name === 'centro') {
      elegido.centro = e.target.value;
      if (enBase && elegido.hora && D.huecoCogido(elegido.centro, elegido.fecha, elegido.hora)) elegido.hora = '';
      pintaHoras(); pintaResumen();
    }
  });

  hueco.addEventListener('click', function (e) {
    var mes = e.target.closest('[data-mes]');
    if (mes) {
      mesVista.setMonth(mesVista.getMonth() + (+mes.getAttribute('data-mes')));
      pintaCalendario();
      return;
    }
    var dia = e.target.closest('[data-dia]');
    if (dia && !dia.disabled) {
      elegido.fecha = dia.getAttribute('data-dia');
      elegido.hora = '';
      pintaCalendario(); pintaHoras(); pintaResumen();
      return;
    }
    var hora = e.target.closest('[data-hora]');
    if (hora && !hora.disabled) {
      elegido.hora = hora.getAttribute('data-hora');
      pintaHoras(); pintaResumen();
    }
  });

  /* ------------------------------------------------------------- envío */
  var form = document.getElementById('rv-form');
  var campos = ['rv-nombre', 'rv-telefono', 'rv-email', 'rv-rgpd']
    .map(function (i) { return document.getElementById(i); });

  function valida(n) {
    var v = String(n.value || '').trim(), ok = true;
    if (n.type === 'checkbox') ok = n.checked;
    else if (!v) ok = false;
    else if (n.id === 'rv-email') ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
    else if (n.id === 'rv-telefono') ok = /^[+\d][\d\s().-]{7,}$/.test(v);
    var err = document.getElementById(n.id + '-err');
    n.setAttribute('aria-invalid', String(!ok));
    if (err) err.setAttribute('data-visible', String(!ok));
    return ok;
  }

  campos.forEach(function (n) {
    n.addEventListener('blur', function () { if (n.value || n.type === 'checkbox') valida(n); });
    n.addEventListener('input', function () {
      if (n.getAttribute('aria-invalid') === 'true') valida(n);
    });
    n.addEventListener('change', function () { if (n.type === 'checkbox') valida(n); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var exito = document.getElementById('rv-exito'), error = document.getElementById('rv-error');
    exito.hidden = true; error.hidden = true;
    if (document.getElementById('rv-web').value) return;
    if (!campos.map(valida).every(Boolean)) {
      var primero = campos.filter(function (n) { return n.getAttribute('aria-invalid') === 'true'; })[0];
      if (primero) { primero.focus(); primero.scrollIntoView({ block: 'center' }); }
      return;
    }

    var s = servicioActual(), c = P.centroDe(elegido.centro);
    var datos = {
      servicio: s ? s.nombre : '', servicioId: elegido.servicio,
      centro: c ? c.nombre : '', centroId: elegido.centro,
      fecha: elegido.fecha, hora: elegido.hora,
      duracion: s ? s.duracion : null,
      nombre: document.getElementById('rv-nombre').value.trim(),
      telefono: document.getElementById('rv-telefono').value.trim(),
      email: document.getElementById('rv-email').value.trim(),
      nota: document.getElementById('rv-nota').value.trim()
    };

    var boton = document.getElementById('rv-enviar');
    boton.setAttribute('data-cargando', 'true');

    /* Con base de datos, la cita se guarda allí (y sale en el panel al
       momento); el correo de aviso es un extra que puede fallar sin más. */
    function porCorreo() {
      return fetch(R('/api/reserva'), {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(datos)
      }).then(function (r) {
        if (!r.ok) throw new Error('respuesta ' + r.status);
        return r.json().catch(function () { return {}; });
      });
    }
    var envio = !enBase ? porCorreo() : D.crearCita(datos).then(function (r) {
      if (r.ok) { porCorreo().catch(function () {}); return r; }
      if (r.red) return porCorreo();
      /* La base dice que no (hora cogida, datos mal…): se explica y se deja corregir */
      var fallo = new Error(r.error); fallo.explicado = true; throw fallo;
    });

    envio.then(function () {
      boton.removeAttribute('data-cargando');
      exito.querySelector('span').textContent =
        'Cita confirmada: ' + datos.servicio + ' el ' + P.fechaLarga(P.deIso(datos.fecha)) +
        ' a las ' + datos.hora + ' en ' + datos.centro + '. Te hemos mandado el detalle por correo.';
      exito.hidden = false;
      exito.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (T) T.mide('reserva_cita', { servicio: datos.servicioId, centro: datos.centroId });
      form.reset();
      elegido.hora = '';
      pintaHoras(); pintaResumen();
    }).catch(function (fallo) {
      boton.removeAttribute('data-cargando');
      if (fallo && fallo.explicado) {
        error.querySelector('span').textContent = fallo.message;
        error.hidden = false;
        error.scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (enBase) D.vigilaHuecos(Rs.diasAntelacionMax || 45).then(function () { pintaHoras(); pintaResumen(); });
        return;
      }
      var asunto = encodeURIComponent('Cita: ' + datos.servicio + ' · ' + datos.fecha + ' ' + datos.hora);
      var cuerpo = encodeURIComponent(
        'Quiero reservar ' + datos.servicio + '\nCentro: ' + datos.centro +
        '\nDía: ' + datos.fecha + '\nHora: ' + datos.hora +
        '\n\n' + datos.nombre + '\nTel.: ' + datos.telefono + '\n' + datos.email +
        (datos.nota ? '\n\n' + datos.nota : ''));
      error.querySelector('span').innerHTML =
        'No hemos podido enviarla desde aquí. Llámanos al <a href="tel:' +
        esc(B.contacto.telefonoTel) + '" style="color:inherit;font-weight:600">' +
        esc(B.contacto.telefono) + '</a> o ' +
        '<a href="mailto:' + esc(B.contacto.emailReservas) + '?subject=' + asunto + '&body=' + cuerpo +
        '" style="color:inherit;font-weight:600">mándanos la cita por correo</a>.';
      error.hidden = false;
      error.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  });

  pintaCalendario();
  pintaHoras();
  pintaResumen();
  /* Horas ya cogidas por otros: se tachan y se refrescan solas */
  if (enBase) {
    D.alCambiar(function () {
      if (elegido.hora && D.huecoCogido(elegido.centro, elegido.fecha, elegido.hora)) elegido.hora = '';
      pintaHoras(); pintaResumen();
    });
    D.vigilaHuecos(Rs.diasAntelacionMax || 45);
  }
  if (T) T.montaApariciones();
})();
