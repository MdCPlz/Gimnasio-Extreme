/* =============================================================================
   ÁREA DE SOCIO — identificarse y ver/cancelar las reservas de clase.
   Ver el aviso de socio.js: esto no sustituye al sistema de altas del club.
   ========================================================================== */
(function () {
  'use strict';

  var B = window.__BRAND__, P = window.XP, T = window.XT, S = window.XS;
  var hueco = document.querySelector('[data-socio]');
  if (!B || !P || !S || !hueco) return;

  var esc = P.esc, icono = P.icono, R = P.ruta;
  var vieneAReservar = new URLSearchParams(location.search).get('volver') === '1';

  function pinta() {
    var s = S.sesion();
    hueco.innerHTML = s ? panel(s) : acceso();
    if (s) montaPanel(); else montaAcceso();
    if (T) T.montaApariciones();
  }

  /* ---------------------------------------------------------------- acceso */
  function acceso() {
    return '<div class="acceso" data-anima>' +
      '<div style="display:grid;place-items:center;margin-bottom:var(--e-5)">' +
        '<span style="width:3rem;height:3rem;display:grid;place-items:center;border-radius:50%;' +
          'background:var(--pizarra);color:var(--lima)">' + icono('candado', 22) + '</span>' +
      '</div>' +
      '<h1>' + esc(B.socio.titulo) + '</h1>' +
      '<p>' + esc(B.socio.texto) + '</p>' +
      (vieneAReservar
        ? '<div class="aviso aviso--info" style="margin-bottom:var(--e-5)">' + icono('info', 18) +
          '<span>Identifícate y volvemos a la clase que ibas a reservar.</span></div>'
        : '') +
      '<form class="formulario" id="ac-form" novalidate>' +
        '<div class="aviso aviso--error" id="ac-error" hidden>' + icono('aviso', 18) +
          '<span></span></div>' +
        '<div class="campo"><label for="ac-nombre">Nombre <span class="req">*</span></label>' +
          '<input type="text" id="ac-nombre" required autocomplete="name" ' +
            'placeholder="Nombre y apellido" aria-describedby="ac-nombre-err">' +
          '<p class="campo__error" id="ac-nombre-err">' + icono('aviso', 14) +
            '<span>Pon tu nombre, así te saludamos bien.</span></p></div>' +
        '<div class="campo"><label for="ac-email">Correo de socio <span class="req">*</span></label>' +
          '<input type="email" id="ac-email" required autocomplete="email" ' +
            'placeholder="tucorreo@ejemplo.com" aria-describedby="ac-email-err">' +
          '<p class="campo__error" id="ac-email-err">' + icono('aviso', 14) +
            '<span>Revisa el correo: es el que identifica tus reservas.</span></p>' +
          '<p class="campo__ayuda">El mismo que diste al darte de alta en el gimnasio.</p></div>' +
        '<button class="boton boton--ancho" type="submit">Entrar</button>' +
      '</form>' +
      '<p class="letra-pequena" style="margin-top:var(--e-5)">' + esc(B.socio.aviso) + ' ' +
        '<a href="' + esc(B.socio.urlClub) + '" target="_blank" rel="noopener noreferrer" ' +
        'style="color:var(--lima)">Ir al área personal del club</a>.</p>' +
    '</div>';
  }

  function montaAcceso() {
    var form = document.getElementById('ac-form');
    var nombre = document.getElementById('ac-nombre');
    var email = document.getElementById('ac-email');

    function valida(n, ok) {
      n.setAttribute('aria-invalid', String(!ok));
      var e = document.getElementById(n.id + '-err');
      if (e) e.setAttribute('data-visible', String(!ok));
      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var okN = valida(nombre, nombre.value.trim().length >= 2);
      var okE = valida(email, /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim()));
      if (!okN || !okE) { (okN ? email : nombre).focus(); return; }

      var s = S.entra({ nombre: nombre.value, email: email.value });
      if (!S.sesion()) {
        var err = document.getElementById('ac-error');
        err.querySelector('span').textContent =
          'Tu navegador no deja guardar datos (¿navegación privada?). Prueba en una ventana normal.';
        err.hidden = false;
        return;
      }
      if (T) T.mide('socio_entra');
      var volver = sessionStorage.getItem('xtreme.volver');
      if (vieneAReservar && volver) {
        sessionStorage.removeItem('xtreme.volver');
        location.href = volver;
        return;
      }
      pinta();
    });
  }

  /* ----------------------------------------------------------------- panel */
  function panel(s) {
    var proximas = S.proximas();
    var pasadas = S.mias().filter(function (x) { return x.fecha < P.iso(new Date()); }).reverse();

    return '<div data-anima>' +
      '<div class="socio__cabecera">' +
        '<div class="socio__quien">' +
          '<span class="socio__avatar" aria-hidden="true">' + esc(S.iniciales(s.nombre)) + '</span>' +
          '<div><b>Hola, ' + esc(s.nombre.split(' ')[0]) + '</b>' +
            '<span>' + esc(s.email) + '</span></div>' +
        '</div>' +
        '<button class="boton boton--fantasma boton--pequeno" type="button" id="ac-salir">' +
          icono('salir', 16) + ' Salir</button>' +
      '</div>' +

      '<h2 style="font-size:var(--t-2)">Tus próximas clases</h2>' +
      (proximas.length
        ? '<div class="reservas-lista">' + proximas.map(fila).join('') + '</div>'
        : '<div class="vacio">' + icono('calendario', 34) +
          '<h3>No tienes ninguna clase reservada</h3>' +
          '<p>Mira el cuadro de la semana y coge sitio en la que te venga bien.</p>' +
          '<a class="boton" href="' + R('/horarios.html') + '">Ver el cuadro de clases</a></div>') +

      (pasadas.length
        ? '<h2 style="font-size:var(--t-2);margin-top:var(--e-8)">Ya hechas</h2>' +
          '<div class="reservas-lista" style="opacity:.62">' +
            pasadas.slice(0, 8).map(function (r) { return fila(r, true); }).join('') + '</div>'
        : '') +

      '<div class="empleo" style="margin-top:var(--e-8)">' +
        '<div><h3>Cuotas, recibos y bajas</h3>' +
          '<p>' + esc(B.socio.aviso) + '</p></div>' +
        '<a class="boton" href="' + esc(B.socio.urlClub) + '" target="_blank" rel="noopener noreferrer">' +
          icono('tarjeta', 18) + ' Área personal del club</a>' +
      '</div>' +
    '</div>';
  }

  function fila(r, pasada) {
    var c = P.claseDe(r.clase) || { nombre: r.clase };
    var centro = P.centroDe(r.centro) || { nombre: r.centro };
    var f = P.deIso(r.fecha);
    return '<div class="reserva-item">' +
      '<div class="reserva-item__fecha">' +
        '<b>' + f.getDate() + '</b>' +
        '<span>' + esc(P.MESES[f.getMonth()].slice(0, 3)) + '</span>' +
      '</div>' +
      '<div class="reserva-item__info">' +
        '<b>' + esc(c.nombre) + '</b>' +
        '<span>' + esc(r.hora) + ' · ' + esc(centro.nombre) +
          (r.monitor ? ' · ' + esc(r.monitor) : '') + '</span>' +
      '</div>' +
      (pasada ? ''
        : '<button class="boton boton--fantasma boton--pequeno" type="button" ' +
          'data-cancelar="' + esc(r.id) + '">Cancelar</button>') +
    '</div>';
  }

  function montaPanel() {
    document.getElementById('ac-salir').addEventListener('click', function () {
      S.sale();
      pinta();
    });
    hueco.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cancelar]');
      if (!b) return;
      b.disabled = true;
      S.cancela(b.getAttribute('data-cancelar')).then(pinta);
    });
  }

  pinta();
})();
