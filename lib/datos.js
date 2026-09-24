/* =============================================================================
   DATOS — lo que la web lee y escribe en la base de datos (Supabase).
   -----------------------------------------------------------------------------
   Es la parte pública del mismo sistema que usa el panel: una cita pedida aquí
   aparece en el panel al instante, y una plaza cogida se descuenta para todos.

   Habla directamente con la API de Supabase por fetch, sin cargar su librería:
   la web solo necesita llamar a cuatro funciones y leer dos listas.
   Sin sesión solo se ven huecos ocupados (sin nombres) y solo se puede crear;
   eso lo decide la base de datos, no este archivo.

   Si lib/config.js está vacío, window.XD.activo es false y cada página sigue
   funcionando como antes (aviso por correo, reservas en el dispositivo).
   Todas las escrituras devuelven una promesa con { ok: true, … } o { error }.
   Expone window.XD. Necesita antes lib/config.js y lib/plantillas.js.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.__SUPABASE__ || {};
  var P = window.XP;
  var activo = !!(CFG.url && CFG.key && window.fetch);

  function rpc(nombre, args) {
    if (!activo) return Promise.resolve({ error: 'sin-base' });
    return fetch(CFG.url.replace(/\/$/, '') + '/rest/v1/rpc/' + nombre, {
      method: 'POST',
      headers: { apikey: CFG.key, authorization: 'Bearer ' + CFG.key, 'content-type': 'application/json' },
      body: JSON.stringify(args || {})
    }).then(function (r) {
      return r.json().catch(function () { return null; }).then(function (d) {
        if (!r.ok) return { error: (d && d.message) || 'No se ha podido guardar. ¿Hay conexión?', red: true };
        return d;
      });
    }, function () {
      return { error: 'No se ha podido conectar. ¿Hay conexión?', red: true };
    });
  }

  function nulo(v) { v = v == null ? '' : String(v).trim(); return v === '' ? null : v; }

  /* ------------------------------------------------ copia de lo ocupado */
  var oyentes = [];
  var plazas = {};          // 'fecha|hora|clase|centro' → plazas cogidas
  var huecos = {};          // 'centro|fecha|hora' → true
  var sondeo = null;

  function avisa() {
    oyentes.forEach(function (fn) { try { fn(); } catch (e) { /* un oyente roto no para a los demás */ } });
  }
  function rango(dias) {
    var h = new Date(); h.setHours(0, 0, 0, 0);
    var f = new Date(h); f.setDate(h.getDate() + dias);
    return { p_desde: P.iso(h), p_hasta: P.iso(f) };
  }

  function cargaPlazas() {
    return rpc('plazas_ocupadas', rango(15)).then(function (d) {
      if (!Array.isArray(d)) return false;
      var nuevo = {};
      d.forEach(function (x) { nuevo[[x.fecha, x.hora, x.clase, x.centro].join('|')] = x.cogidas; });
      var cambia = JSON.stringify(nuevo) !== JSON.stringify(plazas);
      plazas = nuevo;
      if (cambia) avisa();
      return true;
    });
  }
  function cargaHuecos(dias) {
    return rpc('huecos_ocupados', rango(dias || 60)).then(function (d) {
      if (!Array.isArray(d)) return false;
      var nuevo = {};
      d.forEach(function (x) { nuevo[[x.centro, x.fecha, x.hora].join('|')] = true; });
      var cambia = JSON.stringify(nuevo) !== JSON.stringify(huecos);
      huecos = nuevo;
      if (cambia) avisa();
      return true;
    });
  }

  /* Se refresca cada 30 s y al volver a la pestaña, como la web de la Casa */
  function vigila(fn) {
    if (!activo || sondeo) return;
    sondeo = setInterval(function () { if (!document.hidden) fn(); }, 30000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) fn(); });
  }

  window.XD = {
    activo: activo,

    /* Clases */
    vigilaPlazas: function () { var p = cargaPlazas(); vigila(cargaPlazas); return p; },
    cogidas: function (fecha, hora, clase, centro) {
      return plazas[[fecha, hora, clase, centro].join('|')] || 0;
    },
    apuntarse: function (d) {
      return rpc('apuntarse', {
        p_fecha: d.fecha, p_hora: d.hora, p_clase: d.clase, p_centro: d.centro,
        p_nombre: d.nombre, p_email: d.email
      }).then(function (r) { if (r && r.ok) cargaPlazas(); return r || { error: 'Sin respuesta.' }; });
    },
    soltarPlaza: function (id, email) {
      return rpc('soltar_plaza', { p_id: id, p_email: email })
        .then(function (r) { if (r && r.ok) cargaPlazas(); return r || { error: 'Sin respuesta.' }; });
    },

    /* Citas */
    vigilaHuecos: function (dias) {
      var p = cargaHuecos(dias); vigila(function () { cargaHuecos(dias); }); return p;
    },
    huecoCogido: function (centro, fecha, hora) { return !!huecos[[centro, fecha, hora].join('|')]; },
    crearCita: function (d) {
      return rpc('crear_cita', {
        p_servicio: d.servicioId, p_centro: d.centroId, p_fecha: d.fecha, p_hora: d.hora,
        p_nombre: d.nombre, p_email: d.email, p_telefono: d.telefono, p_nota: nulo(d.nota)
      }).then(function (r) { if (r && r.ok) cargaHuecos(); return r || { error: 'Sin respuesta.' }; });
    },

    /* Contacto */
    enviarMensaje: function (d) {
      return rpc('enviar_mensaje', {
        p_asunto: d.asunto, p_nombre: d.nombre, p_email: d.email,
        p_telefono: nulo(d.telefono), p_mensaje: d.mensaje
      }).then(function (r) { return r || { error: 'Sin respuesta.' }; });
    },

    alCambiar: function (fn) { oyentes.push(fn); }
  };
})();
