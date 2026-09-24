/* =============================================================================
   CONTACTO — formulario con validación propia (mensajes en cristiano) y aviso
   al club por /api/contacto. Si la función no está publicada, ofrece el correo.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, T = window.XT;
  var hueco = document.querySelector('[data-contacto]');
  if (!B || !P || !hueco) return;

  var esc = P.esc, icono = P.icono, R = P.ruta;
  var F = B.formulario, c = B.contacto;

  hueco.innerHTML =
    /* Hasta 68em va en una columna: el formulario necesita anchura para que los
       campos dobles no queden en dos tiras inservibles. */
    '<div class="contacto__rejilla">' +

      /* ------------------------------------------------------- formulario */
      '<form class="formulario" id="form-contacto" novalidate data-anima>' +
        '<div class="aviso aviso--exito" id="fc-exito" hidden>' + icono('ok', 20) +
          '<span>' + esc(F.exito) + '</span></div>' +
        '<div class="aviso aviso--error" id="fc-error" hidden>' + icono('aviso', 20) +
          '<span></span></div>' +

        '<div class="campo--doble">' +
          campo('nombre', 'Nombre', 'text', 'Cómo te llamas', true) +
          campo('telefono', 'Teléfono', 'tel', '600 000 000', false) +
        '</div>' +
        campo('email', 'Correo', 'email', 'tucorreo@ejemplo.com', true) +

        '<div class="campo">' +
          '<label for="fc-asunto">Sobre qué <span class="req">*</span></label>' +
          '<select id="fc-asunto" name="asunto" required aria-describedby="fc-asunto-err">' +
            '<option value="">Elige un asunto…</option>' +
            F.asuntos.map(function (a) {
              return '<option value="' + esc(a) + '">' + esc(a) + '</option>';
            }).join('') +
          '</select>' +
          '<p class="campo__error" id="fc-asunto-err">' + icono('aviso', 14) +
            '<span>Dinos de qué se trata para pasárselo a quien toca.</span></p>' +
        '</div>' +

        '<div class="campo">' +
          '<label for="fc-mensaje">Mensaje <span class="req">*</span></label>' +
          '<textarea id="fc-mensaje" name="mensaje" required minlength="10" ' +
            'placeholder="Cuéntanos qué necesitas" aria-describedby="fc-mensaje-err"></textarea>' +
          '<p class="campo__error" id="fc-mensaje-err">' + icono('aviso', 14) +
            '<span>Escribe al menos una frase para que podamos ayudarte.</span></p>' +
        '</div>' +

        '<div class="campo">' +
          '<div class="casilla">' +
            '<input type="checkbox" id="fc-rgpd" name="rgpd" required>' +
            '<label for="fc-rgpd">He leído y acepto la ' +
              '<a href="' + R('/legal/privacidad.html') + '">política de privacidad</a>. ' +
              'Usaremos tus datos sólo para contestarte.</label>' +
          '</div>' +
          '<p class="campo__error" id="fc-rgpd-err">' + icono('aviso', 14) +
            '<span>Necesitamos tu permiso para poder contestarte.</span></p>' +
        '</div>' +

        /* trampa para robots: si viene rellena, no enviamos */
        '<div class="trampa" aria-hidden="true">' +
          '<label for="fc-web">No rellenar</label>' +
          '<input type="text" id="fc-web" name="web" tabindex="-1" autocomplete="off"></div>' +

        '<button class="boton boton--ancho" type="submit" id="fc-enviar">Enviar el mensaje</button>' +
        '<p class="campo__ayuda">Te contestamos el mismo día laborable.</p>' +
      '</form>' +

      /* ------------------------------------------------------------ datos */
      '<aside data-anima>' +
        '<div class="reserva__resumen" style="position:static">' +
          '<h3>Por teléfono, más rápido</h3>' +
          B.centros.map(function (x) {
            return '<div class="pie__centro" style="margin-bottom:var(--e-4)">' +
              '<b>' + esc(x.nombre) + ' · ' + esc(x.zona) + '</b>' +
              esc(x.calle) + '<br>' + esc(x.cp) + ' ' + esc(x.ciudad) + '<br>' +
              '<a href="tel:' + esc(x.telefonoTel) + '" style="color:var(--lima);font-weight:600">' +
                esc(x.telefono) + '</a></div>';
          }).join('') +
          '<hr style="margin:var(--e-5) 0">' +
          '<div class="centro__lineas">' +
            '<span class="centro__linea">' + icono('reloj', 16) +
              '<span>' + esc(B.horario.resumen) + '</span></span>' +
            '<span class="centro__linea">' + icono('correo', 16) +
              '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></span>' +
            '<span class="centro__linea">' + icono('persona', 16) +
              '<a href="mailto:' + esc(B.equipo.empleo.email) + '">Trabaja con nosotros</a></span>' +
          '</div>' +
          '<p class="letra-pequena" style="margin-top:var(--e-5)">' +
            esc(B.horario.recepcion) + '</p>' +
        '</div>' +

        '<div data-mapa="' + esc(B.centros[0].mapaEmbed) + '" data-maps="' + esc(B.centros[0].maps) + '" ' +
          'data-titulo="Mapa de ' + esc(B.centros[0].nombre) + '" style="margin-top:var(--e-5)"></div>' +
      '</aside>' +
    '</div>';

  function campo(id, etiqueta, tipo, marcador, obligatorio) {
    return '<div class="campo">' +
      '<label for="fc-' + id + '">' + esc(etiqueta) +
        (obligatorio ? ' <span class="req">*</span>' : '') + '</label>' +
      '<input type="' + tipo + '" id="fc-' + id + '" name="' + id + '" ' +
        'placeholder="' + esc(marcador) + '"' + (obligatorio ? ' required' : '') +
        ' autocomplete="' + (id === 'nombre' ? 'name' : id === 'email' ? 'email' : 'tel') + '"' +
        ' aria-describedby="fc-' + id + '-err">' +
      '<p class="campo__error" id="fc-' + id + '-err">' + icono('aviso', 14) +
        '<span>' + esc(mensajeDe(id)) + '</span></p>' +
    '</div>';
  }

  function mensajeDe(id) {
    if (id === 'nombre') return 'Escribe tu nombre para saber con quién hablamos.';
    if (id === 'email') return 'Revisa el correo: es por donde te contestamos.';
    if (id === 'telefono') return 'Ese teléfono no parece correcto.';
    return 'Revisa este dato.';
  }

  /* --------------------------------------------------------- validación */
  var form = document.getElementById('form-contacto');
  var exito = document.getElementById('fc-exito');
  var error = document.getElementById('fc-error');

  function valida(campoNodo) {
    var v = String(campoNodo.value || '').trim();
    var id = campoNodo.id;
    var ok = true;
    if (campoNodo.type === 'checkbox') ok = campoNodo.checked;
    else if (campoNodo.hasAttribute('required') && !v) ok = false;
    else if (id === 'fc-email' && v) ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
    else if (id === 'fc-telefono' && v) ok = /^[+\d][\d\s().-]{7,}$/.test(v);
    else if (id === 'fc-mensaje' && v) ok = v.length >= 10;

    var err = document.getElementById(id + '-err');
    campoNodo.setAttribute('aria-invalid', String(!ok));
    if (err) err.setAttribute('data-visible', String(!ok));
    return ok;
  }

  var campos = ['fc-nombre', 'fc-email', 'fc-telefono', 'fc-asunto', 'fc-mensaje', 'fc-rgpd']
    .map(function (i) { return document.getElementById(i); }).filter(Boolean);

  campos.forEach(function (n) {
    n.addEventListener('blur', function () { if (n.value || n.type === 'checkbox') valida(n); });
    n.addEventListener('input', function () {
      if (n.getAttribute('aria-invalid') === 'true') valida(n);
    });
    n.addEventListener('change', function () {
      if (n.type === 'checkbox' || n.tagName === 'SELECT') valida(n);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    exito.hidden = true; error.hidden = true;

    if (document.getElementById('fc-web').value) return;   // robot

    var todosOk = campos.map(valida).every(Boolean);
    if (!todosOk) {
      var primero = campos.filter(function (n) { return n.getAttribute('aria-invalid') === 'true'; })[0];
      if (primero) { primero.focus(); primero.scrollIntoView({ block: 'center' }); }
      return;
    }

    var boton = document.getElementById('fc-enviar');
    boton.setAttribute('data-cargando', 'true');

    var datos = {};
    campos.forEach(function (n) {
      datos[n.name] = n.type === 'checkbox' ? n.checked : n.value.trim();
    });

    fetch(R('/api/contacto'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(datos)
    }).then(function (r) {
      if (!r.ok) throw new Error('respuesta ' + r.status);
      return r.json().catch(function () { return {}; });
    }).then(function () {
      boton.removeAttribute('data-cargando');
      exito.hidden = false;
      exito.scrollIntoView({ block: 'center', behavior: 'smooth' });
      form.reset();
      campos.forEach(function (n) { n.removeAttribute('aria-invalid'); });
      Array.prototype.slice.call(form.querySelectorAll('.campo__error')).forEach(function (n) {
        n.removeAttribute('data-visible');
      });
      if (T) T.mide('contacto_enviado', { asunto: datos.asunto });
    }).catch(function () {
      boton.removeAttribute('data-cargando');
      /* Sin función de correo publicada: le damos una salida real, no un «error». */
      var asunto = encodeURIComponent('Web · ' + (datos.asunto || 'Consulta'));
      var cuerpo = encodeURIComponent(
        datos.mensaje + '\n\n—\n' + datos.nombre +
        (datos.telefono ? '\nTel.: ' + datos.telefono : '') + '\n' + datos.email);
      error.hidden = false;
      error.querySelector('span').innerHTML =
        esc(F.error) + ' <a href="mailto:' + esc(c.email) + '?subject=' + asunto +
        '&body=' + cuerpo + '" style="color:inherit;font-weight:600">Abrir el correo con el mensaje escrito</a>.';
      error.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  });

  if (T) T.montaApariciones();
})();
